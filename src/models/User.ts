// src/models/User.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Nome é obrigatório"],
    },
    email: {
      type: String,
      required: [true, "Email é obrigatório"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Senha é obrigatória"],
      minlength: [6, "Senha deve ter pelo menos 6 caracteres"],
    },
    role: {
      type: String,
      enum: ["student", "admin", "instructor"],
      default: "student",
    },
  },
  {
    timestamps: true,
  }
);

// Middleware para criptografar a senha antes de salvar
UserSchema.pre("save", async function (next) {
  // Apenas criptografa a senha se ela foi modificada ou é nova
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    // Garantir que password seja tratado como string
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Método para comparar senha
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Verificar se o modelo já foi compilado para evitar erros em desenvolvimento
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
