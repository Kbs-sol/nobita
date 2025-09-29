// Database utilities for Doraemon Movie Streaming Website
import type { 
  AdminRole, 
  Movie, 
  MovieBlog, 
  UserSession, 
  Analytics, 
  AdInteraction,
  CronJob,
  CacheEntry,
  HonoEnv 
} from '../types';

export class DatabaseService {
  constructor(private db: D1Database) {}

  // Admin management
  async getAdminByUsername(username: string): Promise<AdminRole | null> {
    const result = await this.db.prepare(
      'SELECT * FROM admin_roles WHERE username = ? AND is_active = 1'
    ).bind(username).first();
    
    return result as AdminRole | null;
  }

  async createAdmin(admin: Omit<AdminRole, 'id' | 'created_at'>): Promise<AdminRole> {
    const result = await this.db.prepare(`
      INSERT INTO admin_roles (username, password_hash, role, created_by, is_active)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      admin.username,
      admin.password_hash,
      admin.role,
      admin.created_by || null,
      admin.is_active ?? 1
    ).run();

    const newAdmin = await this.db.prepare(
      'SELECT * FROM admin_roles WHERE id = ?'
    ).bind(result.meta.last_row_id).first();

    return newAdmin as AdminRole;
  }

  async updateAdminLastLogin(id: number): Promise<void> {
    await this.db.prepare(
      'UPDATE admin_roles SET last_login = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(id).run();
  }

  async getAllAdmins(): Promise<AdminRole[]> {
    const result = await this.db.prepare(
      'SELECT * FROM admin_roles WHERE is_active = 1 ORDER BY created_at ASC'
    ).all();
    
    return result.results as AdminRole[];
  }

  // Movie management
  async getAllMovies(activeOnly: boolean = true): Promise<Movie[]> {
    const query = activeOnly 
      ? 'SELECT * FROM movies WHERE is_active = 1 ORDER BY year DESC, title ASC'
      : 'SELECT * FROM movies ORDER BY year DESC, title ASC';
    
    const result = await this.db.prepare(query).all();
    return result.results as Movie[];
  }

  async getMovieById(id: number): Promise<Movie | null> {
    const result = await this.db.prepare(
      'SELECT * FROM movies WHERE id = ?'
    ).bind(id).first();
    
    return result as Movie | null;
  }

  async createMovie(movie: Omit<Movie, 'id' | 'created_at' | 'updated_at'>): Promise<Movie> {
    const result = await this.db.prepare(`
      INSERT INTO movies (
        title, year, description, characters, thumbnail_url, 
        telegram_file_id, telegram_url, ott_availability, genre,
        duration_minutes, rating, view_count, download_count,
        is_active, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      movie.title,
      movie.year || null,
      movie.description || null,
      movie.characters || null,
      movie.thumbnail_url || null,
      movie.telegram_file_id || null,
      movie.telegram_url || null,
      movie.ott_availability || null,
      movie.genre || 'Animation',
      movie.duration_minutes || null,
      movie.rating || 0.0,
      movie.view_count || 0,
      movie.download_count || 0,
      movie.is_active ?? 1,
      movie.created_by || null
    ).run();

    const newMovie = await this.getMovieById(result.meta.last_row_id as number);
    return newMovie!;
  }

  async updateMovie(id: number, updates: Partial<Movie>): Promise<Movie | null> {
    const fields = Object.keys(updates).filter(key => updates[key as keyof Movie] !== undefined);
    if (fields.length === 0) return null;

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => updates[field as keyof Movie]);

    await this.db.prepare(`
      UPDATE movies 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(...values, id).run();

    return await this.getMovieById(id);
  }

  async incrementMovieViews(id: number): Promise<void> {
    await this.db.prepare(
      'UPDATE movies SET view_count = view_count + 1 WHERE id = ?'
    ).bind(id).run();
  }

  async incrementMovieDownloads(id: number): Promise<void> {
    await this.db.prepare(
      'UPDATE movies SET download_count = download_count + 1 WHERE id = ?'
    ).bind(id).run();
  }

  // Blog management
  async getBlogByMovieId(movieId: number): Promise<MovieBlog | null> {
    const result = await this.db.prepare(
      'SELECT * FROM movie_blogs WHERE movie_id = ? AND is_published = 1'
    ).bind(movieId).first();
    
    return result as MovieBlog | null;
  }

  async createBlog(blog: Omit<MovieBlog, 'id' | 'generated_at' | 'updated_at'>): Promise<MovieBlog> {
    const result = await this.db.prepare(`
      INSERT INTO movie_blogs (
        movie_id, title, content, summary, keywords,
        view_count, is_published, generated_by_ai, openrouter_model
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      blog.movie_id,
      blog.title,
      blog.content,
      blog.summary || null,
      blog.keywords || null,
      blog.view_count || 0,
      blog.is_published ?? 1,
      blog.generated_by_ai ?? 1,
      blog.openrouter_model || 'gpt-3.5-turbo'
    ).run();

    const newBlog = await this.db.prepare(
      'SELECT * FROM movie_blogs WHERE id = ?'
    ).bind(result.meta.last_row_id).first();

    return newBlog as MovieBlog;
  }

  async incrementBlogViews(id: number): Promise<void> {
    await this.db.prepare(
      'UPDATE movie_blogs SET view_count = view_count + 1 WHERE id = ?'
    ).bind(id).run();
  }

  // Session management
  async getSessionById(sessionId: string): Promise<UserSession | null> {
    const result = await this.db.prepare(
      'SELECT * FROM user_sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP'
    ).bind(sessionId).first();
    
    return result as UserSession | null;
  }

  async createSession(session: Omit<UserSession, 'id' | 'created_at'>): Promise<UserSession> {
    const result = await this.db.prepare(`
      INSERT INTO user_sessions (
        session_id, ip_address, user_agent, ads_watched,
        movies_unlocked, last_activity, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      session.session_id,
      session.ip_address || null,
      session.user_agent || null,
      session.ads_watched || 0,
      session.movies_unlocked || '[]',
      session.last_activity || new Date().toISOString(),
      session.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    ).run();

    const newSession = await this.getSessionById(session.session_id);
    return newSession!;
  }

  async updateSessionAds(sessionId: string, adsWatched: number, unlockedMovies: number[]): Promise<void> {
    await this.db.prepare(`
      UPDATE user_sessions 
      SET ads_watched = ?, movies_unlocked = ?, last_activity = CURRENT_TIMESTAMP
      WHERE session_id = ?
    `).bind(adsWatched, JSON.stringify(unlockedMovies), sessionId).run();
  }

  // Analytics
  async recordAnalytic(analytic: Omit<Analytics, 'id' | 'created_at'>): Promise<void> {
    await this.db.prepare(`
      INSERT INTO analytics (
        event_type, entity_type, entity_id, session_id,
        ip_address, user_agent, referrer, additional_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      analytic.event_type,
      analytic.entity_type || null,
      analytic.entity_id || null,
      analytic.session_id || null,
      analytic.ip_address || null,
      analytic.user_agent || null,
      analytic.referrer || null,
      analytic.additional_data || null
    ).run();
  }

  async recordAdInteraction(interaction: Omit<AdInteraction, 'id' | 'created_at'>): Promise<void> {
    await this.db.prepare(`
      INSERT INTO ad_interactions (
        session_id, movie_id, ad_type, ad_network,
        ad_unit_id, interaction_type
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      interaction.session_id || null,
      interaction.movie_id || null,
      interaction.ad_type || null,
      interaction.ad_network || null,
      interaction.ad_unit_id || null,
      interaction.interaction_type || null
    ).run();
  }

  // Cron jobs
  async getCronJob(jobName: string): Promise<CronJob | null> {
    const result = await this.db.prepare(
      'SELECT * FROM cron_jobs WHERE job_name = ?'
    ).bind(jobName).first();
    
    return result as CronJob | null;
  }

  async updateCronJob(jobName: string, status: string, errorMessage?: string): Promise<void> {
    await this.db.prepare(`
      UPDATE cron_jobs 
      SET last_run = CURRENT_TIMESTAMP, status = ?, error_message = ?, run_count = run_count + 1
      WHERE job_name = ?
    `).bind(status, errorMessage || null, jobName).run();
  }

  // Cache management
  async getCacheEntry(key: string): Promise<CacheEntry | null> {
    const result = await this.db.prepare(
      'SELECT * FROM cache_entries WHERE cache_key = ? AND expires_at > CURRENT_TIMESTAMP'
    ).bind(key).first();
    
    return result as CacheEntry | null;
  }

  async setCacheEntry(key: string, value: string, expiresAt?: string): Promise<void> {
    const expires = expiresAt || new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour default
    
    await this.db.prepare(`
      INSERT OR REPLACE INTO cache_entries (cache_key, cache_value, expires_at)
      VALUES (?, ?, ?)
    `).bind(key, value, expires).run();
  }

  async cleanupExpiredCache(): Promise<void> {
    await this.db.prepare(
      'DELETE FROM cache_entries WHERE expires_at <= CURRENT_TIMESTAMP'
    ).run();
  }

  async cleanupExpiredSessions(): Promise<void> {
    await this.db.prepare(
      'DELETE FROM user_sessions WHERE expires_at <= CURRENT_TIMESTAMP'
    ).run();
  }
}