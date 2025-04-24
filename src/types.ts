export interface Game {
    id: string;
    title: string;
    slug: string;
    shortDescription: string;
    description: string;
    coverImage: string;
    releaseDate: string;
    developer: string;
    publisher: string;
    rating: number;
    reviewCount: number;
    price: number;
    discountPercent: number;
    isFree: boolean;
    isEarlyAccess: boolean;
    isMultiplayer: boolean;
    isCoop: boolean;
    minPlayers: number;
    maxPlayers: number;
    ageRating: string;
    playtimeEstimate: number;
    platforms?: GamePlatform[];
    genres?: string[];
  }  
  
  export interface GamePlatform {
    platform: string;
    release_date: string;
    price: number;
    is_exclusive: boolean;
  }
  
  export interface Review {
    id: string;
    game_id: string;
    user_id: string;
    rating: number;
    content: string;
    playtime_hours: number;
    is_verified_owner: boolean;
    is_helpful_count: number;
    is_not_helpful_count: number;
    is_featured: boolean;
    created_at: string;
    user?: {
      username: string;
      avatar?: string;
    };
    game?: {
      title: string;
      cover_image: string;
    };
    comments?: ReviewComment[];
  }
  
  export interface ReviewComment {
    id: string;
    review_id: string;
    user_id: string;
    content: string;
    is_helpful_count: number;
    is_not_helpful_count: number;
    created_at: string;
    user?: {
      username: string;
      avatar?: string;
    };
  }
  
  export interface UserGameLibrary {
    user_id: string;
    game_id: string;
    acquisition_date: string;
    playtime_hours: number;
    last_played: string | null;
    is_favorite: boolean;
    is_wishlist: boolean;
    game?: Game;
  }