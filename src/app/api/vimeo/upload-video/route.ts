// src/app/api/vimeo/upload-link/route.ts
import { NextRequest, NextResponse } from "next/server";
import vimeoClient from "../../vimeo/config"; // Ajuste o caminho conforme necessário

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, privacy = "nobody" } = body;

    // Criando uma Promise para lidar com os callbacks do Vimeo
    // Esta abordagem permite evitar problemas de tipagem
    const getUploadLink = () => {
      return new Promise<string>((resolve, reject) => {
        const filePath = "";

        try {
          // @ts-ignore - Ignorando erros de tipagem para a chamada vimeoClient.upload
          vimeoClient.upload(
            filePath,
            {
              name,
              description,
              privacy: {
                view: privacy,
              },
              upload: {
                approach: "tus",
              },
            },
            (uploadLink) => {
              resolve(uploadLink);
            },
            undefined,
            (error) => {
              reject(error);
            }
          );
        } catch (error) {
          reject(error);
        }
      });
    };

    // Aguardar o link de upload
    const uploadLink = await getUploadLink();

    // Retornar o link em formato JSON
    return NextResponse.json({ uploadLink });
  } catch (error) {
    console.error("Erro na API:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
