// src/lib/dbConnect.ts
import mongoose from "mongoose";

// Definir o tipo para o cache global
declare global {
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

// Variável para armazenar a conexão com o MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Por favor, defina a variável de ambiente MONGODB_URI no arquivo .env.local"
  );
}

// Cache da conexão
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI as string, opts)
      .then((mongoose) => {
        return mongoose.connection;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
