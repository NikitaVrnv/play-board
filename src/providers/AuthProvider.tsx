import { useState, useEffect, ReactNode } from "react";
import type { LoginCredentials, RegisterCredentials, User } from "@/types";
import { API } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { AuthContext } from "@/context/AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const user = await API.getCurrentUser();
        setUser(user);
      } catch (err) {
        console.error("Auth load failed", err);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const user = await API.login(credentials);
      setUser(user);
      localStorage.setItem("token", user.token);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setLoading(true);
      const user = await API.register(credentials);
      setUser(user);
      localStorage.setItem("token", user.token);
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.username}!`,
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const updateUser = async (data: {
    username?: string;
    email?: string;
    currentPassword: string;
    newPassword?: string;
  }) => {
    try {
      const updatedUser = await API.updateUser(data);
      setUser(updatedUser);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Create a value object that explicitly matches the AuthContextType
  const authValue = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}