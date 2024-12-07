export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "student";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Course {
  _id?: string;
  title: string;
  description: string;
  thumbnail?: string;
  modules: Module[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Module {
  _id?: string;
  title: string;
  description: string;
  lessons: Lesson[];
  order: number;
}

export interface Lesson {
  _id?: string;
  title: string;
  description: string;
  videoUrl?: string;
  materials?: string[];
  order: number;
}
