// src/types/index.ts
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface UserCredentials {
  email: string;
  password: string;
  username?: string;
}
