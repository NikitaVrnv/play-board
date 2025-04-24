import { SettingsFormValues } from "@/types";
import { User } from "@/types";
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888/api';

const getAuthHeader = (): HeadersInit => {
  const token = localStorage.getItem("token") ?? "";
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

export const API = {
  updateUserSettings: async (_values: SettingsFormValues) => {
    // Simulate API call with the values
    return new Promise((resolve) => setTimeout(resolve, 1000));
  },
  getCurrentUser: async (): Promise<User> => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
  
    return handleResponse(response);
  },  
}; 