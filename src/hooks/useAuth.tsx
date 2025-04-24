import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Import the API or define it
// If you have an API service, import it like:
import { API } from "../services/api"; // Adjust the path as needed
// If not defined yet, you can create a placeholder:
// const API = {
//   getCurrentUser: async () => { /* implementation */ },
//   login: async (email: string, password: string) => { /* implementation */ },
//   register: async (username: string, email: string, password: string, role: string) => { /* implementation */ },
// };

export type UserRole = "user" | "developer" | "admin";

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const userData = await API.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        localStorage.removeItem("token");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user, token } = await API.login(email, password);
      localStorage.setItem("token", token);
      setUser(user);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string, role: UserRole = "user") => {
    try {
      const { user, token } = await API.register(username, email, password, role);
      localStorage.setItem("token", token);
      setUser(user);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // Create the context value object
  const authContextValue: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading
  };

  // Return the provider with the context value
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}