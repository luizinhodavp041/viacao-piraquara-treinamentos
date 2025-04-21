// src/app/api/modules/[id]/lessons/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Module from "@/models/Module";
import Lesson from "@/models/Lesson";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const moduleId = params.id;
    console.log("GET - Buscando aulas para o módulo:", moduleId);

    // Buscar todas as aulas do módulo
    // Estamos usando uma abordagem diferente aqui:
    // 1. Primeiro, buscamos o módulo com as aulas preenchidas (populate)
    const module = await Module.findById(moduleId).populate('lessons');
    
    if (!module) {
      console.log("GET - Módulo não encontrado:", moduleId);
      return NextResponse.json(
        { error: "Módulo não encontrado" },
        { status: 404 }
      );
    }

    console.log("GET - Aulas encontradas:", module.lessons?.length || 0);
    
    // 2. Retornamos diretamente as aulas do módulo
    return NextResponse.json(module.lessons || []);
  } catch (error) {
    console.error("GET - Erro ao buscar aulas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("POST - Iniciando criação de aula para o módulo:", params.id);
  
  try {
    await connectDB();

    const moduleId = params.id;
    const data = await request.json();
    
    console.log("POST - Dados recebidos:", {
      title: data.title,
      description: data.description ? "sim" : "não",
      vimeoId: data.vimeoId
    });
    
    // Validação dos dados
    if (!data.title || !data.vimeoId) {
      console.log("POST - Validação falhou: título ou vimeoId ausente");
      return NextResponse.json(
        { error: "Título e ID do vídeo do Vimeo são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o módulo existe
    console.log("POST - Buscando módulo:", moduleId);
    const module = await Module.findById(moduleId);
    
    if (!module) {
      console.log("POST - Módulo não encontrado");
      return NextResponse.json(
        { error: "Módulo não encontrado" },
        { status: 404 }
      );
    }

    console.log("POST - Módulo encontrado, courseId:", module.course);

    // Encontrar a ordem máxima das aulas existentes
    const maxOrderLesson = await Lesson.findOne({ module: moduleId })
      .sort({ order: -1 })
      .limit(1);
    
    const nextOrder = maxOrderLesson ? maxOrderLesson.order + 1 : 0;
    console.log("POST - Próxima ordem:", nextOrder);

    // Criar a nova aula
    console.log("POST - Criando nova aula");
    try {
      const newLesson = new Lesson({
        title: data.title,
        description: data.description || "",
        courseId: module.course, // Usar o courseId do módulo
        vimeoId: data.vimeoId,
        module: moduleId, // Campo para a relação com o módulo
        order: nextOrder,
        isPublished: false,
      });

      // Salvar a aula
      console.log("POST - Salvando aula no banco de dados");
      const savedLesson = await newLesson.save();
      console.log("POST - Aula salva com ID:", savedLesson._id);

      // Adicionar a aula ao módulo
      console.log("POST - Adicionando aula ao módulo");
      await Module.findByIdAndUpdate(moduleId, {
        $push: { lessons: savedLesson._id }
      });
      console.log("POST - Aula adicionada ao módulo com sucesso");

      // Retornar a aula criada
      return NextResponse.json(savedLesson, { status: 201 });
    } catch (error) {
      console.error("POST - Erro ao criar/salvar a aula:", error);
      throw error; // Propagar o erro para o tratamento global
    }
  } catch (error) {
    console.error("POST - Erro geral ao adicionar aula:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno do servidor" },
      { status: 500 }
    );
  }
}