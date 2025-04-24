// backend/src/types.ts
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: string;
  createdAt: string;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  genre?: string;
  releaseDate?: string;
  coverImage?: string;
  status: string;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  company?: Company;
  companyId?: string;
  tags?: GameTag[];
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  website?: string;
  logo?: string;
  foundedYear?: number;
  headquarters?: string;
}

export interface GameTag {
  id: string;
  gameId: string;
  tagId: string;
  tag: Tag;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  gameId: string;
  username: string;
  userAvatar?: string;
  user?: {
    id: string;
    username: string;
    avatar?: string;
  };
  game?: {
    id: string;
    title: string;
    coverImage?: string;
    genre?: string;
  };
}