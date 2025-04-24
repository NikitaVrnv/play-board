import { Game, Review, User, RegisterCredentials, LoginCredentials, SettingsFormValues, Genre, SortOption } from "@/types";
import { mockGenres, mockGames } from "@/mocks/mockData";
import { snakeToCamel } from '@/utils/caseConversion';

const raw = await fetch(...);
const json = await raw.json();
const game = snakeToCamel(json) as Game;
// Use a consistent API URL with fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888/api';

// Cache for frequently used data to prevent blinking
const cache = {
  games: null as Game[] | null,
  genres: null as Genre[] | null,
  gameDetails: new Map<string, Game>(),
  gameReviews: new Map<string, Review[]>(),
};

// Helper for getting auth headers
const getAuthHeader = (): HeadersInit => {
  const token = localStorage.getItem("token") ?? "";
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper for handling API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Request failed');
    } catch (e) {
      // If parsing the error response fails, throw a generic error
      throw new Error(`Request failed with status ${response.status}`);
    }
  }
  return response.json();
};

// Helper for making fetch requests with consistent error handling
const apiRequest = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(url, options);
    return handleResponse(response);
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    throw error;
  }
};

// Type for game filtering parameters
type GameParams = {
  author?: string;
  genre?: Genre;
  sort?: SortOption;
  search?: string;
};

export const API = {
  // Authentication
  login: async ({ usernameOrEmail, password }: LoginCredentials): Promise<User> => {
    return apiRequest(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors', // Optional in modern browsers but useful for clarity
      body: JSON.stringify({ usernameOrEmail, password }),
    });
  },

  register: async (credentials: RegisterCredentials): Promise<User> => {
    return apiRequest(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      } as HeadersInit,
      body: JSON.stringify(credentials),
    });
  },

  // User
  updateUser: async (data: {
    username?: string;
    email?: string;
    currentPassword: string;
    newPassword?: string
  }): Promise<User> => {
    return apiRequest(`${API_URL}/auth/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      } as HeadersInit,
      body: JSON.stringify(data),
    });
  },

  getUserGames: async (userId: string): Promise<Game[]> => {
    return apiRequest(`${API_URL}/users/${userId}/games`, {
      headers: getAuthHeader(),
    });
  },

  getCurrentUser: async (): Promise<User> => {
    return apiRequest(`${API_URL}/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
  },

  getReviews: async (userId: string): Promise<Review[]> => {
    return apiRequest(`${API_URL}/users/${userId}/reviews`, {
      headers: getAuthHeader(),
    });
  },

  // Games
  getGames: async (params: GameParams = {}): Promise<Game[]> => {
    // Use cached data if available to prevent blinking
    if (cache.games && Object.keys(params).length === 0) {
      return cache.games;
    }

    try {
      const queryParams = new URLSearchParams();
      if (params.author) queryParams.set('author', params.author);
      if (params.genre) queryParams.set('genre', params.genre);
      if (params.sort) queryParams.set('sort', params.sort);
      if (params.search) queryParams.set('search', params.search);

      const data = await apiRequest(`${API_URL}/games?${queryParams}`);
      
      // Cache the data if it's a basic fetch without params
      if (Object.keys(params).length === 0) {
        cache.games = data;
      }
      
      return data;
    } catch (error) {
      console.warn('Using mock data for games');
      
      // Filter mock data based on params if needed
      let filteredGames = [...mockGames];
      if (params.genre) {
        filteredGames = filteredGames.filter(game => 
          game.genres?.includes(params.genre as string)
        );
      }
      
      // Cache the mock data
      if (Object.keys(params).length === 0) {
        cache.games = filteredGames;
      }
      
      return filteredGames;
    }
  },

  getGame: async (gameId: string): Promise<Game> => {
    // Use cached data if available
    if (cache.gameDetails.has(gameId)) {
      const cachedGame = cache.gameDetails.get(gameId);
      if (cachedGame) {
        return cachedGame;
      }
    }
    
    try {
      const data = await apiRequest(`${API_URL}/games/${gameId}`, {
        headers: getAuthHeader(),
      });
      
      // Cache the data
      cache.gameDetails.set(gameId, data);
      
      return data;
    } catch (error) {
      console.warn('Attempting to find game in mock data');
      
      // Try to find in cached games first
      if (cache.games) {
        const game = cache.games.find(g => g.id === gameId);
        if (game) {
          cache.gameDetails.set(gameId, game);
          return game;
        }
      }
      
      // Try to find in mock data
      const game = mockGames.find(g => g.id === gameId);
      if (game) {
        cache.gameDetails.set(gameId, game);
        return game;
      }
      
      throw error;
    }
  },

  getGenres: async (): Promise<Genre[]> => {
    // Use cached data if available
    if (cache.genres) {
      return cache.genres;
    }
    
    try {
      const data = await apiRequest(`${API_URL}/genres`);
      
      // Cache the data
      cache.genres = data;
      
      return data;
    } catch (error) {
      console.warn('Using mock data for genres');
      
      // Cache the mock data
      cache.genres = mockGenres;
      
      return mockGenres;
    }
  },

  addGame: async (gameData: any): Promise<Game> => {
    try {
      // Convert camelCase to snake_case
      const snakeCaseData = camelToSnake({
        ...gameData,
        slug: gameData.title?.toLowerCase().replace(/\s+/g, '-') || '',
        short_description: gameData.description?.substring(0, 200) || ''
      });
      
      const response = await fetch(`${API_URL}/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        } as HeadersInit,
        body: JSON.stringify(snakeCaseData),
      });
      
      const newGame = await handleResponse(response);
      
      // Invalidate the games cache when adding a new game
      cache.games = null;
      
      return newGame;
    } catch (error) {
      console.error('Add game error:', error);
      throw error;
    }
  },

  getGameReviews: async (gameId: string): Promise<Review[]> => {
    // Use cached data if available
    if (cache.gameReviews.has(gameId)) {
      const cachedReviews = cache.gameReviews.get(gameId);
      if (cachedReviews) {
        return cachedReviews;
      }
    }
    
    try {
      const data = await apiRequest(`${API_URL}/reviews/game/${gameId}`);
      
      // Cache the data
      cache.gameReviews.set(gameId, data);
      
      return data;
    } catch (error) {
      console.error('Get game reviews error:', error);
      
      // Cache empty reviews array for this game
      cache.gameReviews.set(gameId, []);
      
      return [];
    }
  },

  addReview: async (review: {
    gameId: string;
    rating: number;
    comment: string; // Match the backend field name
  }): Promise<Review> => {
    const newReview = await apiRequest(`${API_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      } as HeadersInit,
      body: JSON.stringify(review),
    });
    
    // Invalidate the reviews cache for this game
    cache.gameReviews.delete(review.gameId);
    // Invalidate the game details cache as the rating may have changed
    cache.gameDetails.delete(review.gameId);
    
    return newReview;
  },

  updateUserSettings: async (_values: SettingsFormValues) => {
    try {
      // If this is actually a simulation in development:
      return new Promise((resolve) => setTimeout(resolve, 1000));
      // If you want to actually implement it:
      /*
      return apiRequest(`${API_URL}/auth/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        } as HeadersInit,
        body: JSON.stringify(_values),
      });
      */
    } catch (error) {
      console.error('Update settings error:', error);
      throw error;
    }
  },
};

export default API;