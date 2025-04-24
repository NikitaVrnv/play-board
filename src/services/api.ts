// src/services/api.ts
import { Game, Review, User, UserCredentials } from "@/types";

// API utility functions
const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      console.error("API error response:", errorData);
      throw new Error(errorData.error || errorData.message || `API error: ${response.status}`);
    } catch (e) {
      if (e instanceof Error) throw e;
      throw new Error(`API error: ${response.status}`);
    }
  }
  return response.json();
};

// Create headers with auth token when available
const createHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
};

export const API = {
  // Auth endpoints
  login: async (credentials: UserCredentials) => {
    console.log("API.login called with:", credentials);
    
    if (!credentials.email || !credentials.password) {
      throw new Error("Email and password required");
    }
    
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      }),
    });
    
    const data = await handleResponse(response);
    
    // Store the token in localStorage if present
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    
    return data;
  },
  
  register: async (credentials: UserCredentials) => {
    if (!credentials.username || !credentials.email || !credentials.password) {
      throw new Error("Username, email and password required");
    }
    
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: credentials.username,
        email: credentials.email,
        password: credentials.password
      }),
    });
    
    const data = await handleResponse(response);
    
    // Store the token in localStorage if present
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    
    return data;
  },
  
  // This method is called from AuthContext
  getCurrentUser: async () => {
    console.log("API.getCurrentUser called");
    return API.getProfile();
  },
  
  getProfile: async () => {
    console.log("API.getProfile called");
    const response = await fetch(`${BASE_URL}/auth/profile`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
  
  // Game endpoints
  getGames: async (params = {}) => {
    // Create a new object with only non-undefined values
    const cleanParams: Record<string, string> = {};
    
    // Only add parameters that have actual values
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = String(value);
      }
    });
    
    const queryString = new URLSearchParams(cleanParams).toString();
    const url = queryString ? `${BASE_URL}/games?${queryString}` : `${BASE_URL}/games`;
    
    const response = await fetch(url, {
      headers: createHeaders(),
    });
    return handleResponse(response) as Promise<Game[]>;
  },
  
  getGame: async (id: string | number) => {
    const response = await fetch(`${BASE_URL}/games/${id}`, {
      headers: createHeaders(),
    });
    
    // Handle 404 specially
    if (response.status === 404) {
      return null;
    }
    
    return handleResponse(response) as Promise<Game>;
  },
  
  // Genres endpoint
  getGenres: async () => {
    const response = await fetch(`${BASE_URL}/genres`, {
      headers: createHeaders(),
    });
    return handleResponse(response) as Promise<string[]>;
  },
  
  // Companies endpoint
  getCompanies: async () => {
    const response = await fetch(`${BASE_URL}/companies`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
  
  getCompany: async (id: string | number) => {
    const response = await fetch(`${BASE_URL}/companies/${id}`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
  
  // Tags endpoint
  getTags: async () => {
    const response = await fetch(`${BASE_URL}/tags`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
  
  // Review endpoints
  getReviews: async (gameId?: string | number) => {
    const url = gameId 
      ? `${BASE_URL}/reviews?gameId=${gameId}` 
      : `${BASE_URL}/reviews`;
      
    const response = await fetch(url, {
      headers: createHeaders(),
    });
    return handleResponse(response) as Promise<Review[]>;
  },
  
  getUserReviews: async (userId?: string | number) => {
    const url = userId
      ? `${BASE_URL}/reviews/user/${userId}`
      : `${BASE_URL}/reviews/user`;
    
    const response = await fetch(url, {
      headers: createHeaders(),
    });
    return handleResponse(response) as Promise<Review[]>;
  },
  
  getReview: async (id: string | number) => {
    const response = await fetch(`${BASE_URL}/reviews/${id}`, {
      headers: createHeaders(),
    });
    return handleResponse(response) as Promise<Review>;
  },
  
  addReview: async (gameId: string | number, rating: number, comment: string) => {
    const response = await fetch(`${BASE_URL}/reviews`, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify({ gameId, rating, comment }),
    });
    return handleResponse(response) as Promise<Review>;
  },
  
  updateReview: async (id: string | number, rating: number, comment: string) => {
    const response = await fetch(`${BASE_URL}/reviews/${id}`, {
      method: "PUT",
      headers: createHeaders(),
      body: JSON.stringify({ rating, comment }),
    });
    return handleResponse(response) as Promise<Review>;
  },
  
  deleteReview: async (id: string | number) => {
    const response = await fetch(`${BASE_URL}/reviews/${id}`, {
      method: "DELETE",
      headers: createHeaders(),
    });
    return handleResponse(response);
  }
};