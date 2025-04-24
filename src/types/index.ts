export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  token: string;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  bannerImage?: string;
  releaseDate: string;
  developer: string;
  publisher: string;
  rating: number;
  reviewCount?: number;
  genres: string[];
  platforms: string[];
  price: number;
  discountPercent?: number;
  isFree: boolean;
  isEarlyAccess: boolean;
  isMultiplayer: boolean;
  minPlayers?: number;
  maxPlayers?: number;
  playtimeEstimate?: number;
  ageRating?: string;
  systemRequirements?: {
    minimum: string;
    recommended: string;
  };
  languages?: string[];
  website?: string;
  steamId?: string;
  epicId?: string;
  gogId?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  gameId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  rating: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  helpfulCount: number;
  unhelpfulCount: number;
  isVerifiedOwner: boolean;
  playtimeHours?: number;
  isFeatured?: boolean;
}

export type Genre = "Action" | "Adventure" | "RPG" | "Strategy" | "Simulation" | "Sports" | "Racing" | "Fighting" | "Platformer" | "Puzzle" | "Shooter" | "Survival" | "Horror" | "MMO" | "MOBA" | "Battle Royale" | "Sandbox" | "Educational" | "Music" | "Visual Novel" | "Card Game" | "Board Game" | "Trivia" | "Casual" | "Arcade" | "Party" | "Educational" | "Fitness" | "VR" | "Other";

export interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export type SortOption = 'newest' | 'oldest' | 'highest-rated' | 'lowest-rated' | 'most-reviewed';

export interface Company {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  website?: string;
  foundedYear?: number;
  country?: string;
}

export interface SettingsFormValues {
  username: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
}
