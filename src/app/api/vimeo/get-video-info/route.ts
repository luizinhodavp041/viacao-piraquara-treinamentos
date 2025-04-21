// src/app/api/vimeo/get-video-info/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json(
        { error: "ID do vídeo é obrigatório" },
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

    // Fazer a requisição para a API do Vimeo para obter informações do vídeo
    const response = await axios.get(
      `https://api.vimeo.com/videos/${videoId}`,
      { headers }
    );

    // Extrair e formatar os dados relevantes
    const videoData = response.data;
    
    const formattedData = {
      id: videoData.uri.split('/').pop(),
      title: videoData.name,
      description: videoData.description,
      duration: videoData.duration,
      thumbnails: videoData.pictures?.sizes || [],
      privacy: videoData.privacy.view,
      embedSettings: videoData.embed,
      createdAt: videoData.created_time,
      uploadedAt: videoData.modified_time,
    };

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Erro ao obter informações do vídeo:", error);
    
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