import { createContext, useContext } from 'react';
import { User } from '@/types';
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 