import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Configuração do Vimeo
const accessToken = process.env.VIMEO_ACCESS_TOKEN;

// Verificar se o token está configurado
if (!accessToken) {
  console.error("Token de acesso do Vimeo não está configurado");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, privacy = "nobody", fileSize } = body;

    // Verificar se o tamanho do arquivo foi fornecido
    if (!fileSize) {
      return NextResponse.json(
        { error: "O tamanho do arquivo é obrigatório para uploads" },
        { status: 400 }
      );
    }

    console.log("Preparando requisição para a API do Vimeo...");

    // Estrutura esperada pela API do Vimeo para upload POST
    const requestBody = {
      upload: {
        approach: "post", // Usando POST em vez de TUS
        size: fileSize,
      },
      name: name || "Vídeo sem título",
      description: description || "",
      privacy: {
        view: privacy,
      },
    };

    console.log("Corpo da requisição:", JSON.stringify(requestBody));

    // Configurar cabeçalhos de autenticação
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.vimeo.*+json;version=3.4",
    };

    // Fazer a requisição para a API do Vimeo para obter o formulário de upload
    console.log("Enviando requisição para a API do Vimeo...");
    const response = await axios.post(
      "https://api.vimeo.com/me/videos",
      requestBody,
      { headers }
    );

    console.log("Resposta recebida da API do Vimeo:", response.status);

    // Verificar se a resposta contém os dados esperados
    if (!response.data || !response.data.upload || !response.data.upload.form) {
      throw new Error("Resposta inválida da API do Vimeo");
    }

    // Extrair os dados relevantes da resposta
    const uploadForm = response.data.upload.form;
    const uploadLink = response.data.upload.upload_link;
    const videoUri = response.data.uri;

    // Extrair o ID do vídeo do URI
    const videoIdMatch = videoUri.match(/\/videos\/(\d+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    console.log("Form de upload obtido com sucesso");
    console.log("ID do vídeo:", videoId);

    // Retornar os dados necessários para o cliente
    return NextResponse.json({
      uploadForm,
      uploadLink,
      videoUri,
      videoId,
    });
  } catch (error) {
    // Tratar e logar o erro de forma mais detalhada
    console.error("Erro na API:", error);

    // Extrair informações úteis do erro para depuração
    let errorDetails = "Erro desconhecido";
    let statusCode = 500;

    if (axios.isAxiosError(error)) {
      statusCode = error.response?.status || 500;
      errorDetails = error.response?.data || error.message;

      // Logar informações adicionais para depuração
      console.error("Detalhes completos do erro:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
        data: error.response?.data,
      });
    } else if (error instanceof Error) {
      errorDetails = error.message;
    }

    return NextResponse.json(
      {
        error: "Falha ao obter formulário de upload do Vimeo",
        details: errorDetails,
      },
      { status: statusCode }
    );
  }
}
