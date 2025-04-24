// backend/src/services/api.ts
import { Game, Review, User, UserCredentials, Company, Genre, SortOption } from "@/types";

// API utility functions  
const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

// Use mock data if API_MODE is 'mock'
const API_MODE = import.meta.env.VITE_API_MODE || "server";
const USE_MOCK = API_MODE === "mock";

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

// ————————————————————————————————————————————————————
// Mock data implementation (for development/testing)
// ————————————————————————————————————————————————————

// Helper for mock API
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock data stores
let mockUsers: User[] = [
  { id: 1, username: "gamer123", email: "gamer@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=gamer123" },
  { id: 2, username: "rpgfan",   email: "rpg@example.com",   avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rpgfan" },
  { id: 3, username: "ylands_edu", email: "ylands@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ylands_edu" },
];
let nextUserId = mockUsers.length;

const mockCompanies: Company[] = [
  {
    id: 1,
    name: "Bohemia Interactive",
    description: "Bohemia Interactive is a Czech video game studio famous for ARMA and DayZ.",
    foundedYear: 1999,
    website: "https://www.bohemia.net/",
    logo: "https://www.bohemia.net/assets/img/bohemia-interactive-logo.svg",
  },
  // Other mock companies...
];

let mockGames: Game[] = [
  {
    id: 1,
    title: "Elden Ring",
    coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
    author: "FromSoftware",
    genre: "RPG",
    description: "An action RPG by George R. R. Martin & Hidetaka Miyazaki. Defeat demigods to restore the Elden Ring.",
    releaseDate: "2022-02-25",
    averageRating: 4.8,
    reviewCount: 3,
    companyId: 1,
    companyName: "Bohemia Interactive",
    composer: "Yuka Kitamura",
  },
  // Other mock games...
];
let nextGameId = mockGames.length;

let mockReviews: Review[] = [
  { id:  1, gameId: 1, userId: 1, username: mockUsers[0].username, userAvatar: mockUsers[0].avatar, rating: 5, comment: "One of the best games I've ever played.", createdAt: "2022-03-01T14:30:00Z" },
  // Other mock reviews...
];
let nextReviewId = mockReviews.length;

// Mock API implementation
const MockAPI = {
  // Auth endpoints
  login: async (email: string, password: string): Promise<any> => {
    await delay(800);
    
    if (!email || !password) {
      throw new Error("Email and password required");
    }
    
    const user = mockUsers.find((u) => u.email === email);
    if (!user) throw new Error("Invalid credentials");
    
    // In mock mode, we're not checking passwords
    // In a real implementation, you'd compare password hashes here
    
    // Generate a mock token
    const token = btoa(`user-${user.id}-${Date.now()}`);
    
    // Store token in localStorage
    localStorage.setItem("token", token);
    
    return { user: { ...user }, token };
  },
  
  register: async (username: string, email: string, password: string): Promise<any> => {
    await delay(800);
    
    if (!username || !email || !password) {
      throw new Error("Username, email and password required");
    }
    
    if (mockUsers.some((u) => u.email === email)) {
      throw new Error("Email already in use");
    }

    const newUser: User = {
      id: ++nextUserId,
      username,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    };
    mockUsers.push(newUser);
    
    // Generate a mock token
    const token = btoa(`user-${newUser.id}-${Date.now()}`);
    
    // Store token in localStorage
    localStorage.setItem("token", token);
    
    return { user: newUser, token };
  },
  
  getProfile: async (): Promise<User> => {
    await delay(300);
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");
    
    // Extract user ID from mock token
    const tokenParts = atob(token).split("-");
    const userId = parseInt(tokenParts[1], 10);
    
    const user = mockUsers.find(u => u.id === userId);
    if (!user) throw new Error("User not found");
    
    return { ...user };
  },
  
  // Game endpoints
  getGames: async (filters?: {
    genre?: Genre;
    search?: string;
    sort?: SortOption;
  }): Promise<Game[]> => {
    await delay(500);
    let out = [...mockGames];

    if (filters?.genre) {
      out = out.filter((g) => g.genre === filters.genre);
    }

    if (filters?.search) {
      const term = filters.search.toLowerCase();
      out = out.filter((g) => {
        const comp = mockCompanies.find((c) => c.id === g.companyId);
        const compName = comp ? comp.name.toLowerCase() : "";
        return (
          g.title.toLowerCase().includes(term) ||
          g.author.toLowerCase().includes(term) ||
          g.description.toLowerCase().includes(term) ||
          compName.includes(term)
        );
      });
    }

    if (filters?.sort) {
      switch (filters.sort) {
        case "newest":
          out.sort((a, b) => Date.parse(b.releaseDate as string) - Date.parse(a.releaseDate as string));
          break;
        case "oldest":
          out.sort((a, b) => Date.parse(a.releaseDate as string) - Date.parse(b.releaseDate as string));
          break;
        case "highest-rated":
          out.sort((a, b) => b.averageRating - a.averageRating);
          break;
        case "lowest-rated":
          out.sort((a, b) => a.averageRating - b.averageRating);
          break;
        case "most-reviewed":
          out.sort((a, b) => b.reviewCount - a.reviewCount);
          break;
      }
    }

    return out;
  },
  
  getGame: async (id: number | string): Promise<Game | null> => {
    await delay(300);
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    return mockGames.find((g) => g.id === numId) || null;
  },
  
  // Genres endpoint
  getGenres: async (): Promise<Genre[]> => {
    await delay(200);
    return [
      "Action",
      "Adventure",
      "RPG",
      "Strategy",
      "Simulation",
      "Sports",
      "Puzzle",
      "Shooter",
      "Platformer",
      "Horror",
      "Racing",
      "Fighting",
      "Educational",
      "Sandbox",
      "Other",
    ];
  },
  
  // Companies endpoints
  getCompanies: async (): Promise<Company[]> => {
    await delay(300);
    return [...mockCompanies];
  },
  
  getCompany: async (id: number | string): Promise<Company | null> => {
    await delay(300);
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    return mockCompanies.find((c) => c.id === numId) || null;
  },
  
  // Review endpoints
  getReviews: async (gameId?: number | string): Promise<Review[]> => {
    await delay(300);
    if (!gameId) return [...mockReviews];
    
    const numId = typeof gameId === 'string' ? parseInt(gameId, 10) : gameId;
    return mockReviews.filter((r) => r.gameId === numId);
  },
  
  getUserReviews: async (userId?: number | string): Promise<Review[]> => {
    await delay(300);
    if (!userId) {
      // Get current user's reviews
      const token = localStorage.getItem("token");
      if (!token) return [];
      
      // Extract user ID from mock token
      const tokenParts = atob(token).split("-");
      const currentUserId = parseInt(tokenParts[1], 10);
      
      return mockReviews.filter(r => r.userId === currentUserId);
    }
    
    const numId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    return mockReviews.filter(r => r.userId === numId);
  },
  
  getReview: async (id: number | string): Promise<Review | null> => {
    await delay(300);
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    return mockReviews.find(r => r.id === numId) || null;
  },
  
  addReview: async (gameId: number | string, rating: number, comment: string): Promise<Review> => {
    await delay(800);
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");
    
    // Extract user ID from mock token
    const tokenParts = atob(token).split("-");
    const userId = parseInt(tokenParts[1], 10);
    
    const user = mockUsers.find(u => u.id === userId);
    if (!user) throw new Error("User not found");
    
    const numGameId = typeof gameId === 'string' ? parseInt(gameId, 10) : gameId;
    
    const newReview: Review = {
      id: ++nextReviewId,
      gameId: numGameId,
      userId,
      username: user.username,
      userAvatar: user.avatar,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };
    
    mockReviews.push(newReview);
    
    // Recalculate game stats
    const gameReviews = mockReviews.filter(r => r.gameId === numGameId);
    const game = mockGames.find(g => g.id === numGameId);
    if (game) {
      game.reviewCount = gameReviews.length;
      game.averageRating = Math.round(
        (gameReviews.reduce((sum, r) => sum + r.rating, 0) / gameReviews.length) * 10
      ) / 10;
    }
    
    return newReview;
  },
  
  updateReview: async (id: number | string, rating: number, comment: string): Promise<Review> => {
    await delay(500);
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    const reviewIndex = mockReviews.findIndex(r => r.id === numId);
    
    if (reviewIndex === -1) throw new Error("Review not found");
    
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");
    
    // Extract user ID from mock token
    const tokenParts = atob(token).split("-");
    const userId = parseInt(tokenParts[1], 10);
    
    // Check if the user owns this review
    if (mockReviews[reviewIndex].userId !== userId) {
      throw new Error("You can only edit your own reviews");
    }
    
    // Update the review
    mockReviews[reviewIndex] = {
      ...mockReviews[reviewIndex],
      rating,
      comment,
    };
    
    // Recalculate game stats
    const gameId = mockReviews[reviewIndex].gameId;
    const gameReviews = mockReviews.filter(r => r.gameId === gameId);
    const game = mockGames.find(g => g.id === gameId);
    if (game) {
      game.averageRating = Math.round(
        (gameReviews.reduce((sum, r) => sum + r.rating, 0) / gameReviews.length) * 10
      ) / 10;
    }
    
    return { ...mockReviews[reviewIndex] };
  },
  
  deleteReview: async (id: number | string): Promise<void> => {
    await delay(500);
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    const reviewIndex = mockReviews.findIndex(r => r.id === numId);
    
    if (reviewIndex === -1) throw new Error("Review not found");
    
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");
    
    // Extract user ID from mock token
    const tokenParts = atob(token).split("-");
    const userId = parseInt(tokenParts[1], 10);
    
    // Check if the user owns this review
    if (mockReviews[reviewIndex].userId !== userId) {
      throw new Error("You can only delete your own reviews");
    }
    
    // Get the game ID before removing the review
    const gameId = mockReviews[reviewIndex].gameId;
    
    // Remove the review
    mockReviews.splice(reviewIndex, 1);
    
    // Recalculate game stats
    const gameReviews = mockReviews.filter(r => r.gameId === gameId);
    const game = mockGames.find(g => g.id === gameId);
    if (game) {
      game.reviewCount = gameReviews.length;
      game.averageRating = gameReviews.length ? Math.round(
        (gameReviews.reduce((sum, r) => sum + r.rating, 0) / gameReviews.length) * 10
      ) / 10 : 0;
    }
  },
};

// ————————————————————————————————————————————————————
// Server API implementation (for production)
// ————————————————————————————————————————————————————
const ServerAPI = {
  // Auth endpoints
  login: async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error("Email and password required");
    }
    
    // Send email and password directly, NOT wrapped in a UserCredentials object
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await handleResponse(response);
    
    // Store the token in localStorage if present
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    
    return data;
  },
  
  register: async (username: string, email: string, password: string) => {
    if (!username || !email || !password) {
      throw new Error("Username, email and password required");
    }
    
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    
    const data = await handleResponse(response);
    
    // Store the token in localStorage if present
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    
    return data;
  },
  
  getProfile: async () => {
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
  
  getGame: async (id: string) => {
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
  
  getCompany: async (id: string) => {
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
  getReviews: async (gameId?: string) => {
    const url = gameId 
      ? `${BASE_URL}/reviews?gameId=${gameId}` 
      : `${BASE_URL}/reviews`;
      
    const response = await fetch(url, {
      headers: createHeaders(),
    });
    return handleResponse(response) as Promise<Review[]>;
  },
  
  getUserReviews: async (userId?: string) => {
    const url = userId
      ? `${BASE_URL}/reviews/user/${userId}`
      : `${BASE_URL}/reviews/user`;
    
    const response = await fetch(url, {
      headers: createHeaders(),
    });
    return handleResponse(response) as Promise<Review[]>;
  },
  
  getReview: async (id: string) => {
    const response = await fetch(`${BASE_URL}/reviews/${id}`, {
      headers: createHeaders(),
    });
    return handleResponse(response) as Promise<Review>;
  },
  
  addReview: async (gameId: string, rating: number, comment: string) => {
    const response = await fetch(`${BASE_URL}/reviews`, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify({ gameId, rating, comment }),
    });
    return handleResponse(response) as Promise<Review>;
  },
  
  updateReview: async (id: string, rating: number, comment: string) => {
    const response = await fetch(`${BASE_URL}/reviews/${id}`, {
      method: "PUT",
      headers: createHeaders(),
      body: JSON.stringify({ rating, comment }),
    });
    return handleResponse(response) as Promise<Review>;
  },
  
  deleteReview: async (id: string) => {
    const response = await fetch(`${BASE_URL}/reviews/${id}`, {
      method: "DELETE",
      headers: createHeaders(),
    });
    return handleResponse(response);
  }
};

// Function to log API calls for debugging
const logAPICall = (methodName: string, args: any[]) => {
  console.log(`API.${methodName} called with:`, args);
};

// Create a wrapper with consistent interface that adapts to both implementations
const APIWrapper = {
  // Auth endpoints
  login: async (credentials: UserCredentials) => {
    logAPICall('login', [credentials]);
    
    if (USE_MOCK) {
      // MockAPI expects email and password directly
      return MockAPI.login(credentials.email, credentials.password);
    } else {
      // ServerAPI also expects email and password directly
      return ServerAPI.login(credentials.email, credentials.password);
    }
  },
  
  register: async (credentials: UserCredentials) => {
    logAPICall('register', [credentials]);
    
    if (!credentials.username) {
      throw new Error("Username is required for registration");
    }
    
    if (USE_MOCK) {
      return MockAPI.register(credentials.username, credentials.email, credentials.password);
    } else {
      return ServerAPI.register(credentials.username, credentials.email, credentials.password);
    }
  },
  
  // Pass through all other API methods
  getCurrentUser: async () => {
    return USE_MOCK ? MockAPI.getProfile() : ServerAPI.getProfile();
  },
  
  getGames: async (filters?: any) => {
    return USE_MOCK ? MockAPI.getGames(filters) : ServerAPI.getGames(filters);
  },
  
  getGame: async (id: string | number) => {
    return USE_MOCK ? MockAPI.getGame(id) : ServerAPI.getGame(String(id));
  },
  
  getGenres: async () => {
    return USE_MOCK ? MockAPI.getGenres() : ServerAPI.getGenres();
  },
  
  getCompanies: async () => {
    return USE_MOCK ? MockAPI.getCompanies() : ServerAPI.getCompanies();
  },
  
  getCompany: async (id: string | number) => {
    return USE_MOCK ? MockAPI.getCompany(id) : ServerAPI.getCompany(String(id));
  },
  
  getTags: async () => {
    return USE_MOCK ? [] : ServerAPI.getTags();
  },
  
  getReviews: async (gameId?: string | number) => {
    return USE_MOCK ? MockAPI.getReviews(gameId) : ServerAPI.getReviews(gameId ? String(gameId) : undefined);
  },
  
  getUserReviews: async (userId?: string | number) => {
    return USE_MOCK ? MockAPI.getUserReviews(userId) : ServerAPI.getUserReviews(userId ? String(userId) : undefined);
  },
  
  getReview: async (id: string | number) => {
    return USE_MOCK ? MockAPI.getReview(id) : ServerAPI.getReview(String(id));
  },
  
  addReview: async (gameId: string | number, rating: number, comment: string) => {
    return USE_MOCK ? MockAPI.addReview(gameId, rating, comment) : ServerAPI.addReview(String(gameId), rating, comment);
  },
  
  updateReview: async (id: string | number, rating: number, comment: string) => {
    return USE_MOCK ? MockAPI.updateReview(id, rating, comment) : ServerAPI.updateReview(String(id), rating, comment);
  },
  
  deleteReview: async (id: string | number) => {
    return USE_MOCK ? MockAPI.deleteReview(id) : ServerAPI.deleteReview(String(id));
  }
};

// Export the wrapper
export const API = APIWrapper;