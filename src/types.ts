// TypeScript types and interfaces for Doraemon Movie Streaming Website

export interface CloudflareBindings {
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
  
  // Environment variables
  OPENROUTER_API_KEY: string;
  TELEGRAM_BOT_TOKEN: string;
  JWT_SECRET: string;
  SUPERADMIN_USERNAME: string;
  SUPERADMIN_PASSWORD: string;
  SITE_NAME: string;
  SITE_URL: string;
  SITE_DESCRIPTION: string;
  ADSENSE_CLIENT_ID?: string;
  ADSENSE_SLOT_ID?: string;
  GOOGLE_ANALYTICS_ID?: string;
  RATE_LIMIT_REQUESTS: string;
  RATE_LIMIT_WINDOW: string;
  SESSION_EXPIRE_HOURS: string;
  AD_UNLOCK_EXPIRE_HOURS: string;
}

export interface AdminRole {
  id: number;
  username: string;
  password_hash: string;
  role: 'superadmin' | 'admin';
  created_at: string;
  last_login?: string;
  is_active: number;
  created_by?: number;
}

export interface Movie {
  id: number;
  title: string;
  year?: number;
  description?: string;
  characters?: string; // JSON string of characters array
  thumbnail_url?: string;
  telegram_file_id?: string;
  telegram_url?: string;
  ott_availability?: string; // JSON string of OTT platforms array
  genre?: string;
  duration_minutes?: number;
  rating?: number;
  view_count?: number;
  download_count?: number;
  is_active?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
}

export interface MovieBlog {
  id: number;
  movie_id: number;
  title: string;
  content: string; // HTML content
  summary?: string;
  keywords?: string;
  view_count?: number;
  is_published?: number;
  generated_at?: string;
  updated_at?: string;
  generated_by_ai?: number;
  openrouter_model?: string;
}

export interface UserSession {
  id?: number;
  session_id: string;
  ip_address?: string;
  user_agent?: string;
  ads_watched?: number;
  movies_unlocked?: string; // JSON array of movie IDs
  created_at?: string;
  last_activity?: string;
  expires_at?: string;
}

export interface Analytics {
  id?: number;
  event_type: 'page_view' | 'blog_view' | 'movie_view' | 'download' | 'ad_watch';
  entity_type?: 'movie' | 'blog' | 'homepage';
  entity_id?: number;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  additional_data?: string; // JSON string
  created_at?: string;
}

export interface AdInteraction {
  id?: number;
  session_id?: string;
  movie_id?: number;
  ad_type?: 'watch_unlock' | 'download_unlock';
  ad_network?: string;
  ad_unit_id?: string;
  interaction_type?: 'impression' | 'click' | 'completion';
  created_at?: string;
}

export interface CronJob {
  id?: number;
  job_name: string;
  last_run?: string;
  next_run?: string;
  status?: 'pending' | 'running' | 'completed' | 'failed';
  error_message?: string;
  run_count?: number;
  created_at?: string;
}

export interface CacheEntry {
  id?: number;
  cache_key: string;
  cache_value: string;
  expires_at?: string;
  created_at?: string;
}

// API Request/Response types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    username: string;
    role: string;
  };
  message?: string;
}

export interface MovieRequest {
  title: string;
  year?: number;
  description?: string;
  characters?: string[];
  thumbnail_url?: string;
  telegram_file_id?: string;
  telegram_url?: string;
  ott_availability?: string[];
  genre?: string;
  duration_minutes?: number;
  rating?: number;
}

export interface MovieResponse {
  success: boolean;
  movie?: Movie & { characters_list?: string[]; ott_list?: string[] };
  message?: string;
}

export interface BlogGenerationRequest {
  movie_id: number;
  force_regenerate?: boolean;
}

export interface BlogGenerationResponse {
  success: boolean;
  blog?: MovieBlog;
  message?: string;
}

export interface AnalyticsRequest {
  event_type: Analytics['event_type'];
  entity_type?: Analytics['entity_type'];
  entity_id?: number;
  additional_data?: Record<string, any>;
}

export interface StreamRequest {
  movie_id: number;
  action: 'watch' | 'download';
}

export interface StreamResponse {
  success: boolean;
  stream_url?: string;
  download_url?: string;
  requires_ads?: boolean;
  ads_watched?: number;
  message?: string;
}

// Konami Code sequence for admin access
export const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA'
];

// Utility types
export type HonoEnv = {
  Bindings: CloudflareBindings;
  Variables: {
    user?: AdminRole;
    session?: UserSession;
  };
};