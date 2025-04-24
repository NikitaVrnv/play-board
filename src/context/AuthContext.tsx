import { createContext } from "react";
import type { LoginCredentials, RegisterCredentials, User } from "@/types";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (data: {
    username?: string;
    email?: string;
    currentPassword: string;
    newPassword?: string;
  }) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);