import { NextRequest, NextResponse } from "next/server";
import { Vimeo } from "vimeo";

// Configuração do cliente Vimeo
const clientId = process.env.VIMEO_CLIENT_ID;
const clientSecret = process.env.VIMEO_CLIENT_SECRET;
const accessToken = process.env.VIMEO_ACCESS_TOKEN;

// Verificar se as variáveis de ambiente estão definidas
if (!clientId || !clientSecret || !accessToken) {
  console.error(
    "Variáveis de ambiente do Vimeo não estão configuradas corretamente"
  );
}

// Criar o cliente do Vimeo
const vimeoClient = new Vimeo(clientId!, clientSecret!, accessToken!);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoId = searchParams.get("videoId");

  if (!videoId) {
    return NextResponse.json(
      { error: "ID do vídeo é obrigatório" },
      { status: 400 }
    );
  }

  try {
    // Criando uma Promise para processar o callback do Vimeo
    const getVideoInfo = () => {
      return new Promise((resolve, reject) => {
        // @ts-ignore
        vimeoClient.request(
          {
            method: "GET",
            path: `/videos/${videoId}`,
          },
          function (error: Error | null, body: any) {
            if (error) {
              reject(error);
              return;
            }

            // Extrair as informações relevantes
            const videoInfo = {
              id: body.uri?.split("/").pop(),
              title: body.name,
              description: body.description,
              duration: body.duration, // Duração em segundos
              thumbnails: body.pictures?.sizes || [],
              privacy: body.privacy?.view,
              embedSettings: body.embed,
              createdAt: body.created_time,
              uploadedAt: body.upload_date,
            };

            resolve(videoInfo);
          }
        );
      });
    };

    // Aguardar as informações do vídeo
    const videoInfo = await getVideoInfo();

    // Retornar as informações do vídeo
    return NextResponse.json(videoInfo);
  } catch (error) {
    console.error("Erro ao obter informações do vídeo:", error);

    return NextResponse.json(
      { error: "Erro ao obter informações do vídeo" },
      { status: 500 }
    );
  }
}
