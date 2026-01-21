
export type Language = 'ru' | 'ua' | 'en' | 'be' | 'kk';

export interface User {
  email: string;
  password: string;
}

export interface AdminPermissions {
  canPublish: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface AdminRecord {
  email: string;
  permissions: AdminPermissions;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  genre: string;
  language: string;
  subtitles: string[];
  coverUrl: string;
  videoUrl: string;
  releaseDate?: string;
  producers?: string[];
  directors?: string[];
  isTrending?: boolean;
  isNew?: boolean;
  rating?: number;
}

export interface UserData {
  favorites: string[];
  history: { movieId: string; timestamp: number }[];
  playback: Record<string, number>;
  settings: {
    language: Language;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum Screen {
  SPLASH,
  AUTH,
  HOME,
  PROFILE,
  ADMIN,
  PLAYER
}

export const ADMIN_EMAIL = 'robloxura727@gmail.com';
export const OWNER_CODE = '13.01';
