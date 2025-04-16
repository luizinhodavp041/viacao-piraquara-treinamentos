// lib/dbConnect.ts
import mongoose from "mongoose";

// Definição do tipo para a variável global de cache
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Verificar a variável de ambiente MONGODB_URI
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("A variável de ambiente MONGODB_URI não está definida");
}

// Declarar a variável global do mongoose para TypeScript
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

// Inicializar a variável global se não existir
global.mongoose = global.mongoose || { conn: null, promise: null };

/**
 * Função para conectar ao MongoDB usando mongoose
 * Reutiliza conexões existentes para evitar múltiplas conexões durante hot reloading
 */
async function dbConnect(): Promise<typeof mongoose> {
  // Se já existir uma conexão, retorná-la
  if (global.mongoose.conn) {
    return global.mongoose.conn;
  }

  // Se não existir uma promise de conexão, criar uma nova
  if (!global.mongoose.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Usando o operador "!" para informar ao TypeScript que MONGODB_URI não é undefined
    // Já verificamos isso na condição acima
    global.mongoose.promise = mongoose.connect(MONGODB_URI!, opts);
  }

  try {
    // Aguardar a conexão e armazenar a referência
    const mongooseInstance = await global.mongoose.promise;
    global.mongoose.conn = mongooseInstance;
    return mongooseInstance;
  } catch (error) {
    // Em caso de erro, limpar a promise para tentar novamente na próxima chamada
    global.mongoose.promise = null;
    throw error;
  }
}

export default dbConnect;
