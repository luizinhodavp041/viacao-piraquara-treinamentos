// src/app/api/videos/[videoId]/route.ts
import { NextResponse } from "next/server";
import vimeoClient from "@/lib/vimeo-client";

export async function GET(
  request: Request,
  { params }: { params: { videoId: string } }
) {
  try {
    const videoId = params.videoId;

    // Verificar se o ID do vídeo é válido
    if (!videoId || !/^\d+$/.test(videoId)) {
      return NextResponse.json(
        { error: "ID de vídeo inválido" },
        { status: 400 }
      );
    }

    // Buscar dados do vídeo da API do Vimeo
    const videoData = await new Promise((resolve, reject) => {
      vimeoClient.request(
        {
          method: "GET",
          path: `/videos/${videoId}`,
          query: {
            fields: "uri,name,description,duration,pictures.sizes,files,play",
          },
        },
        (error, body, statusCode) => {
          if (error) {
            console.error("Erro ao obter dados do vídeo Vimeo:", error);
            reject(error);
          } else {
            resolve(body);
          }
        }
      );
    });

    return NextResponse.json(videoData);
  } catch (error) {
    console.error("Erro ao processar solicitação de vídeo:", error);
    return NextResponse.json(
      { error: "Falha ao obter dados do vídeo" },
      { status: 500 }
    );
  }
}
