// api/vimeo/get-video-info.ts - API para obter informações de um vídeo do Vimeo
import { NextApiRequest, NextApiResponse } from "next";
import vimeoClient from "./config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const { videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({ message: "ID do vídeo é obrigatório" });
  }

  try {
    // Obter informações do vídeo
    vimeoClient.request(
      {
        method: "GET",
        path: `/videos/${videoId}`,
      },
      function (error, body) {
        if (error) {
          console.error("Erro ao obter informações do vídeo:", error);
          return res
            .status(500)
            .json({ message: "Erro ao obter informações do vídeo" });
        }

        // Extrair as informações relevantes
        const videoInfo = {
          id: body.uri.split("/").pop(),
          title: body.name,
          description: body.description,
          duration: body.duration, // Duração em segundos
          thumbnails: body.pictures.sizes,
          privacy: body.privacy.view,
          embedSettings: body.embed,
          createdAt: body.created_time,
          uploadedAt: body.upload_date,
        };

        return res.status(200).json(videoInfo);
      }
    );
  } catch (error) {
    console.error("Erro na API:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}
