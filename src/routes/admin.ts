// Admin panel routes
import { Hono } from 'hono';
import type { HonoEnv, MovieRequest } from '../types';
import { DatabaseService } from '../utils/database';
import { OpenRouterService } from '../utils/openrouter';
import { TelegramService } from '../utils/telegram';
import { isAdmin, isSuperAdmin } from '../utils/auth';

const admin = new Hono<HonoEnv>();

// Admin dashboard
admin.get('/admin/dashboard', async (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Dashboard - ${c.env.SITE_NAME}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    </head>
    <body class="bg-gray-100">
        <div id="app"></div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/admin.js"></script>
    </body>
    </html>
  `);
});

// Get dashboard stats
admin.get('/api/admin/stats', async (c) => {
  try {
    const db = new DatabaseService(c.env.DB);
    
    // Get total counts
    const movies = await db.getAllMovies(false);
    
    // Calculate basic stats
    const totalMovies = movies.length;
    const activeMovies = movies.filter(m => m.is_active).length;
    const totalViews = movies.reduce((sum, m) => sum + (m.view_count || 0), 0);
    const totalDownloads = movies.reduce((sum, m) => sum + (m.download_count || 0), 0);

    return c.json({
      success: true,
      stats: {
        total_movies: totalMovies,
        active_movies: activeMovies,
        total_views: totalViews,
        total_downloads: totalDownloads,
        recent_movies: movies.slice(0, 5)
      }
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return c.json({ success: false, message: 'Failed to fetch stats' }, 500);
  }
});

// Get all movies (admin)
admin.get('/api/admin/movies', async (c) => {
  try {
    const db = new DatabaseService(c.env.DB);
    const movies = await db.getAllMovies(false);

    const enhancedMovies = movies.map(movie => ({
      ...movie,
      characters_list: movie.characters ? JSON.parse(movie.characters) : [],
      ott_list: movie.ott_availability ? JSON.parse(movie.ott_availability) : []
    }));

    return c.json({
      success: true,
      movies: enhancedMovies
    });

  } catch (error) {
    console.error('Admin get movies error:', error);
    return c.json({ success: false, message: 'Failed to fetch movies' }, 500);
  }
});

// Create new movie
admin.post('/api/admin/movies', async (c) => {
  try {
    const currentUser = c.get('user');
    if (!isAdmin(currentUser)) {
      return c.json({ success: false, message: 'Admin access required' }, 403);
    }

    const body = await c.req.json() as MovieRequest;
    const { title, year, description, characters, thumbnail_url, telegram_file_id, telegram_url, ott_availability, genre, duration_minutes, rating } = body;

    if (!title) {
      return c.json({ success: false, message: 'Movie title is required' }, 400);
    }

    // Validate Telegram file if provided
    if (telegram_file_id) {
      const telegram = new TelegramService(c.env.TELEGRAM_BOT_TOKEN);
      const validation = await telegram.validateFile(telegram_file_id);
      
      if (!validation.valid) {
        return c.json({ success: false, message: `Invalid Telegram file: ${validation.error}` }, 400);
      }
    }

    const db = new DatabaseService(c.env.DB);
    const movie = await db.createMovie({
      title,
      year,
      description,
      characters: characters ? JSON.stringify(characters) : null,
      thumbnail_url,
      telegram_file_id,
      telegram_url,
      ott_availability: ott_availability ? JSON.stringify(ott_availability) : null,
      genre: genre || 'Animation',
      duration_minutes,
      rating,
      created_by: currentUser.id
    });

    return c.json({
      success: true,
      movie: {
        ...movie,
        characters_list: movie.characters ? JSON.parse(movie.characters) : [],
        ott_list: movie.ott_availability ? JSON.parse(movie.ott_availability) : []
      }
    });

  } catch (error) {
    console.error('Create movie error:', error);
    return c.json({ success: false, message: 'Failed to create movie' }, 500);
  }
});

// Update movie
admin.put('/api/admin/movies/:id', async (c) => {
  try {
    const currentUser = c.get('user');
    if (!isAdmin(currentUser)) {
      return c.json({ success: false, message: 'Admin access required' }, 403);
    }

    const movieId = parseInt(c.req.param('id'));
    if (isNaN(movieId)) {
      return c.json({ success: false, message: 'Invalid movie ID' }, 400);
    }

    const body = await c.req.json();
    const updates: any = {};

    // Prepare updates
    if (body.title !== undefined) updates.title = body.title;
    if (body.year !== undefined) updates.year = body.year;
    if (body.description !== undefined) updates.description = body.description;
    if (body.characters !== undefined) updates.characters = JSON.stringify(body.characters);
    if (body.thumbnail_url !== undefined) updates.thumbnail_url = body.thumbnail_url;
    if (body.telegram_file_id !== undefined) updates.telegram_file_id = body.telegram_file_id;
    if (body.telegram_url !== undefined) updates.telegram_url = body.telegram_url;
    if (body.ott_availability !== undefined) updates.ott_availability = JSON.stringify(body.ott_availability);
    if (body.genre !== undefined) updates.genre = body.genre;
    if (body.duration_minutes !== undefined) updates.duration_minutes = body.duration_minutes;
    if (body.rating !== undefined) updates.rating = body.rating;
    if (body.is_active !== undefined) updates.is_active = body.is_active;

    // Validate Telegram file if being updated
    if (updates.telegram_file_id) {
      const telegram = new TelegramService(c.env.TELEGRAM_BOT_TOKEN);
      const validation = await telegram.validateFile(updates.telegram_file_id);
      
      if (!validation.valid) {
        return c.json({ success: false, message: `Invalid Telegram file: ${validation.error}` }, 400);
      }
    }

    const db = new DatabaseService(c.env.DB);
    const movie = await db.updateMovie(movieId, updates);

    if (!movie) {
      return c.json({ success: false, message: 'Movie not found' }, 404);
    }

    return c.json({
      success: true,
      movie: {
        ...movie,
        characters_list: movie.characters ? JSON.parse(movie.characters) : [],
        ott_list: movie.ott_availability ? JSON.parse(movie.ott_availability) : []
      }
    });

  } catch (error) {
    console.error('Update movie error:', error);
    return c.json({ success: false, message: 'Failed to update movie' }, 500);
  }
});

// Delete movie (soft delete)
admin.delete('/api/admin/movies/:id', async (c) => {
  try {
    const currentUser = c.get('user');
    if (!isAdmin(currentUser)) {
      return c.json({ success: false, message: 'Admin access required' }, 403);
    }

    const movieId = parseInt(c.req.param('id'));
    if (isNaN(movieId)) {
      return c.json({ success: false, message: 'Invalid movie ID' }, 400);
    }

    const db = new DatabaseService(c.env.DB);
    const movie = await db.updateMovie(movieId, { is_active: 0 });

    if (!movie) {
      return c.json({ success: false, message: 'Movie not found' }, 404);
    }

    return c.json({
      success: true,
      message: 'Movie deleted successfully'
    });

  } catch (error) {
    console.error('Delete movie error:', error);
    return c.json({ success: false, message: 'Failed to delete movie' }, 500);
  }
});

// Generate blog for movie
admin.post('/api/admin/movies/:id/generate-blog', async (c) => {
  try {
    const currentUser = c.get('user');
    if (!isAdmin(currentUser)) {
      return c.json({ success: false, message: 'Admin access required' }, 403);
    }

    const movieId = parseInt(c.req.param('id'));
    if (isNaN(movieId)) {
      return c.json({ success: false, message: 'Invalid movie ID' }, 400);
    }

    const db = new DatabaseService(c.env.DB);
    const movie = await db.getMovieById(movieId);

    if (!movie) {
      return c.json({ success: false, message: 'Movie not found' }, 404);
    }

    try {
      const openRouter = new OpenRouterService(c.env.OPENROUTER_API_KEY);
      const generatedBlog = await openRouter.generateBlogPost(movie);
      
      // Check if blog already exists
      let existingBlog = await db.getBlogByMovieId(movieId);
      
      if (existingBlog) {
        // Update existing blog
        const updatedBlog = await db.createBlog({
          movie_id: movieId,
          title: generatedBlog.title,
          content: generatedBlog.content,
          summary: generatedBlog.summary,
          keywords: generatedBlog.keywords
        });
        
        return c.json({
          success: true,
          blog: updatedBlog,
          message: 'Blog updated successfully'
        });
      } else {
        // Create new blog
        const blog = await db.createBlog({
          movie_id: movieId,
          title: generatedBlog.title,
          content: generatedBlog.content,
          summary: generatedBlog.summary,
          keywords: generatedBlog.keywords
        });

        return c.json({
          success: true,
          blog: blog,
          message: 'Blog generated successfully'
        });
      }

    } catch (error) {
      console.error('Blog generation error:', error);
      return c.json({ success: false, message: 'Failed to generate blog content' }, 503);
    }

  } catch (error) {
    console.error('Generate blog error:', error);
    return c.json({ success: false, message: 'Failed to generate blog' }, 500);
  }
});

// Validate Telegram file
admin.post('/api/admin/validate-telegram', async (c) => {
  try {
    const currentUser = c.get('user');
    if (!isAdmin(currentUser)) {
      return c.json({ success: false, message: 'Admin access required' }, 403);
    }

    const body = await c.req.json();
    const { file_id } = body;

    if (!file_id) {
      return c.json({ success: false, message: 'File ID is required' }, 400);
    }

    const telegram = new TelegramService(c.env.TELEGRAM_BOT_TOKEN);
    const validation = await telegram.validateFile(file_id);
    
    if (validation.valid) {
      const fileInfo = await telegram.getFileInfo(file_id);
      return c.json({
        success: true,
        valid: true,
        file_info: fileInfo
      });
    } else {
      return c.json({
        success: false,
        valid: false,
        error: validation.error
      });
    }

  } catch (error) {
    console.error('Telegram validation error:', error);
    return c.json({ success: false, message: 'Validation failed' }, 500);
  }
});

// Run cron jobs manually (superadmin only)
admin.post('/api/admin/cron/:job', async (c) => {
  try {
    const currentUser = c.get('user');
    if (!isSuperAdmin(currentUser)) {
      return c.json({ success: false, message: 'Superadmin access required' }, 403);
    }

    const jobName = c.req.param('job');
    const db = new DatabaseService(c.env.DB);

    switch (jobName) {
      case 'generate_blogs':
        // Generate blogs for all movies without blogs
        const movies = await db.getAllMovies();
        const openRouter = new OpenRouterService(c.env.OPENROUTER_API_KEY);
        let generated = 0;
        
        for (const movie of movies) {
          const existingBlog = await db.getBlogByMovieId(movie.id);
          if (!existingBlog) {
            try {
              const generatedBlog = await openRouter.generateBlogPost(movie);
              await db.createBlog({
                movie_id: movie.id,
                title: generatedBlog.title,
                content: generatedBlog.content,
                summary: generatedBlog.summary,
                keywords: generatedBlog.keywords
              });
              generated++;
            } catch (error) {
              console.error(`Failed to generate blog for movie ${movie.id}:`, error);
            }
          }
        }
        
        await db.updateCronJob(jobName, 'completed');
        
        return c.json({
          success: true,
          message: `Generated ${generated} new blogs`
        });

      case 'cleanup_sessions':
        await db.cleanupExpiredSessions();
        await db.updateCronJob(jobName, 'completed');
        
        return c.json({
          success: true,
          message: 'Expired sessions cleaned up'
        });

      case 'cleanup_cache':
        await db.cleanupExpiredCache();
        await db.updateCronJob(jobName, 'completed');
        
        return c.json({
          success: true,
          message: 'Expired cache entries cleaned up'
        });

      default:
        return c.json({ success: false, message: 'Unknown cron job' }, 400);
    }

  } catch (error) {
    console.error('Cron job error:', error);
    return c.json({ success: false, message: 'Cron job failed' }, 500);
  }
});

// Get all admin users (superadmin only)
admin.get('/api/admin/users', async (c) => {
  try {
    const currentUser = c.get('user');
    if (!isSuperAdmin(currentUser)) {
      return c.json({ success: false, message: 'Superadmin access required' }, 403);
    }

    const db = new DatabaseService(c.env.DB);
    const users = await db.getAllAdminUsers();

    return c.json({
      success: true,
      users: users
    });

  } catch (error) {
    console.error('Get users error:', error);
    return c.json({ success: false, message: 'Failed to fetch users' }, 500);
  }
});

// Create new admin user (superadmin only)
admin.post('/api/admin/users', async (c) => {
  try {
    const currentUser = c.get('user');
    if (!isSuperAdmin(currentUser)) {
      return c.json({ success: false, message: 'Superadmin access required' }, 403);
    }

    const body = await c.req.json();
    const { username, password, role } = body;

    if (!username || !password) {
      return c.json({ success: false, message: 'Username and password are required' }, 400);
    }

    const db = new DatabaseService(c.env.DB);
    
    // Check if user already exists
    const existingUser = await db.getAdminByUsername(username);
    if (existingUser) {
      return c.json({ success: false, message: 'Username already exists' }, 400);
    }

    // Create new admin user
    const newUser = await db.createAdminUser({
      username,
      password,
      role: role || 'admin',
      created_by: currentUser.id
    });

    return c.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        created_at: newUser.created_at
      },
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('Create user error:', error);
    return c.json({ success: false, message: 'Failed to create user' }, 500);
  }
});

// Delete admin user (superadmin only)
admin.delete('/api/admin/users/:username', async (c) => {
  try {
    const currentUser = c.get('user');
    if (!isSuperAdmin(currentUser)) {
      return c.json({ success: false, message: 'Superadmin access required' }, 403);
    }

    const username = c.req.param('username');
    
    // Prevent deleting superadmin
    if (username === 'superadmin') {
      return c.json({ success: false, message: 'Cannot delete superadmin user' }, 400);
    }

    const db = new DatabaseService(c.env.DB);
    const deleted = await db.deleteAdminUser(username);

    if (!deleted) {
      return c.json({ success: false, message: 'User not found' }, 404);
    }

    return c.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return c.json({ success: false, message: 'Failed to delete user' }, 500);
  }
});

export default admin;