import mongoose from "mongoose";

// Interface para definir a estrutura do cache
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Declare o tipo global
declare global {
  var mongooseCache: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env"
  );
}

// Inicializa o cache
if (!global.mongooseCache) {
  global.mongooseCache = {
    conn: null,
    promise: null,
  };
}

async function connectDB() {
  if (global.mongooseCache?.conn) {
    return global.mongooseCache.conn;
  }

  const opts = {
    bufferCommands: false,
  };

  if (!global.mongooseCache?.promise) {
    global.mongooseCache!.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    global.mongooseCache!.conn = await global.mongooseCache!.promise;
  } catch (e) {
    global.mongooseCache!.promise = null;
    throw e;
  }

  return global.mongooseCache!.conn;
}

export default connectDB;
