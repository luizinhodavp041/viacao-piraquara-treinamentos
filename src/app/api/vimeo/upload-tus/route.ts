// src/app/api/vimeo/upload-tus/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, privacy = "nobody" } = body;

    // Verificar dados
    if (!name) {
      return NextResponse.json(
        { error: "Nome do vídeo é obrigatório" },
        { status: 400 }
      );
    }

    // Obter token de acesso do Vimeo das variáveis de ambiente
    const accessToken = process.env.VIMEO_ACCESS_TOKEN;
    
    if (!accessToken) {
      throw new Error("Token de acesso do Vimeo não configurado");
    }

    // Configurar cabeçalhos para a API do Vimeo
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.vimeo.*+json;version=3.4'
    };

    // Dados para criar novo vídeo com suporte a TUS
    const videoData = {
      upload: {
        approach: 'tus',
        size: null // O tamanho será definido pelo cliente TUS
      },
      name,
      description: description || '',
      privacy: {
        view: privacy
      }
    };

    // Fazer a requisição para a API do Vimeo
    const response = await axios.post(
      'https://api.vimeo.com/me/videos',
      videoData,
      { headers }
    );

    // Extrair dados da resposta
    const uploadLink = response.data.upload.upload_link;
    const videoUri = response.data.uri;

    // Extrair o ID do vídeo do URI
    const videoIdMatch = videoUri.match(/\/videos\/(\d+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
      throw new Error("Não foi possível obter o ID do vídeo");
    }

    console.log("Link de upload obtido:", uploadLink);
    console.log("ID do vídeo:", videoId);

    // Retornar o link e o ID do vídeo
    return NextResponse.json({ 
      uploadLink, 
      videoId 
    });
  } catch (error) {
    console.error("Erro na API de upload do Vimeo:", error);
    
    // Extrair detalhes do erro se for do Axios
    let errorMessage = "Erro interno do servidor";
    let statusCode = 500;
    
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.error || error.message;
      statusCode = error.response.status;
      console.error("Detalhes do erro da API Vimeo:", error.response.data);
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}