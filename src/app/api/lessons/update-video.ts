// api/lessons/update-video.ts - API para atualizar o vídeo de uma aula
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect"; // Sua função de conexão com o MongoDB
import Lesson from "@/models/Lesson";
// import { getSession } from "next-auth/react"; // Se estiver usando autenticação

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verificar o método HTTP
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  // Verificar autenticação (exemplo com next-auth)
  // const session = await getSession({ req });
  // if (!session || !session.user.isAdmin) {
  //   return res.status(401).json({ message: "Não autorizado" });
  // }

  // Conectar ao banco de dados
  await dbConnect();

  try {
    const { lessonId, vimeoId, duration } = req.body;

    if (!lessonId || !vimeoId) {
      return res
        .status(400)
        .json({ message: "IDs da aula e do vídeo são obrigatórios" });
    }

    // Atualizar a aula com o ID do vídeo do Vimeo
    const updatedLesson = await Lesson.findByIdAndUpdate(
      lessonId,
      {
        vimeoId,
        duration: duration || 0,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedLesson) {
      return res.status(404).json({ message: "Aula não encontrada" });
    }

    return res.status(200).json(updatedLesson);
  } catch (error) {
    console.error("Erro ao atualizar o vídeo da aula:", error);
    return res
      .status(500)
      .json({ message: "Erro ao atualizar o vídeo da aula" });
  }
}
