// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { API } from "@/services/api";
import { User, UserCredentials } from "@/types";
import { toast } from "@/components/ui/sonner";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: UserCredentials) => Promise<void>;
  register: (credentials: UserCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  useEffect(() => {
    const init = async () => {
      if (!token || user) { setIsLoading(false); return; }
  
      try {
        const me = await API.getCurrentUser();
        setUser(me);
      } catch (err: any) {
        console.error(err);
        if (/401|invalid token|unauthor/i.test(err.message)) {
          logout();               // token really is bad
        } else {
          toast.error("Can’t load profile – retrying later");
        }
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [token]);  

  const login = async (credentials: UserCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Logging in with:", credentials.email);
      
      if (!credentials.email || !credentials.password) {
        throw new Error("Email and password are required");
      }
      
      // Use the API service to handle login
      const data = await API.login(credentials);
      
      if (!data.token) {
        throw new Error("Login response missing token");
      }
      
      // Set user and token state
      setToken(data.token);
      setUser(data.user);
      toast.success("Logged in successfully!");
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(`Login failed: ${err.message}`);
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: UserCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!credentials.username || !credentials.email || !credentials.password) {
        throw new Error("Username, email and password are required");
      }
      
      // Use the API service to handle registration
      const data = await API.register(credentials);
      
      if (!data.token) {
        throw new Error("Registration response missing token");
      }
      
      // Set user and token state
      setToken(data.token);
      setUser(data.user);
      toast.success("Registered and logged in successfully!");
    } catch (err: any) {
      console.error("Registration error:", err);
      toast.error(`Registration failed: ${err.message}`);
      setError(err.message || "Registration failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    toast.info("Logged out");
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};