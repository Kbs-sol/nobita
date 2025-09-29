// Main Doraemon Movie Streaming Website Application
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';

import type { HonoEnv } from './types';
import { DatabaseService } from './utils/database';
import { OpenRouterService } from './utils/openrouter';
import { TelegramService } from './utils/telegram';
import { 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  verifyToken,
  generateSessionId,
  checkRateLimit,
  getClientIP,
  getUserAgent
} from './utils/auth';

const app = new Hono<HonoEnv>();

// CORS middleware
app.use('/api/*', cors({
  origin: ['*'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }));

// Rate limiting middleware (simplified for local development)
app.use('/api/*', async (c, next) => {
  const ip = getClientIP(c.req.raw);
  
  // Skip rate limiting if KV is not available (local development)
  if (c.env.KV) {
    const rateLimit = await checkRateLimit(
      c.env.KV,
      ip,
      parseInt(c.env.RATE_LIMIT_REQUESTS || '100'),
      parseInt(c.env.RATE_LIMIT_WINDOW || '3600') * 1000
    );

    if (!rateLimit.allowed) {
      return c.json({ error: 'Rate limit exceeded' }, 429);
    }

    c.header('X-RateLimit-Remaining', rateLimit.remaining.toString());
  }
  
  await next();
});

// Session middleware (simplified for local development)
app.use('/api/*', async (c, next) => {
  const sessionId = c.req.header('X-Session-ID') || generateSessionId();
  
  // Skip database session if DB is not available (local development)
  if (c.env.DB) {
    const db = new DatabaseService(c.env.DB);
    
    let session = await db.getSessionById(sessionId);
    if (!session) {
      session = await db.createSession({
        session_id: sessionId,
        ip_address: getClientIP(c.req.raw),
        user_agent: getUserAgent(c.req.raw),
        expires_at: new Date(Date.now() + parseInt(c.env.SESSION_EXPIRE_HOURS || '24') * 60 * 60 * 1000).toISOString()
      });
    }
    c.set('session', session);
  } else {
    // Create a mock session for local development
    c.set('session', {
      session_id: sessionId,
      ads_watched: 0,
      movies_unlocked: '[]'
    });
  }

  c.header('X-Session-ID', sessionId);
  await next();
});

// Authentication middleware for admin routes
app.use('/api/admin/*', async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return c.json({ error: 'Authorization token required' }, 401);
  }

  const payload = await verifyToken(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  const db = new DatabaseService(c.env.DB);
  const user = await db.getAdminByUsername(payload.username);
  if (!user || !user.is_active) {
    return c.json({ error: 'User not found or inactive' }, 401);
  }

  c.set('user', user);
  await next();
});

// Analytics tracking middleware (simplified for local development)
app.use('*', async (c, next) => {
  await next();
  
  // Track page views only if DB is available
  if (c.env.DB) {
    const db = new DatabaseService(c.env.DB);
    const session = c.get('session');
    
    if (session && c.res.status === 200) {
      await db.recordAnalytic({
        event_type: 'page_view',
        session_id: session.session_id,
        ip_address: getClientIP(c.req.raw),
        user_agent: getUserAgent(c.req.raw),
        referrer: c.req.header('Referer') || null,
        additional_data: JSON.stringify({
          path: new URL(c.req.url).pathname,
          method: c.req.method
        })
      });
    }
  }
});

// Homepage route
app.get('/', async (c) => {
  // Use sample data if DB is not available
  let movies = [];
  if (c.env.DB) {
    const db = new DatabaseService(c.env.DB);
    movies = await db.getAllMovies();
  } else {
    // Sample movies for local development without DB
    movies = [
      {
        id: 1,
        title: 'Stand by Me Doraemon',
        year: 2014,
        description: 'A heartwarming 3D animated film featuring Doraemon and Nobita.',
        thumbnail_url: '/static/default-movie.jpg',
        rating: 8.2,
        duration_minutes: 95,
        view_count: 1250,
        download_count: 89
      },
      {
        id: 2,
        title: 'Doraemon: Nobita\'s Treasure Island',
        year: 2018,
        description: 'A swashbuckling adventure as Nobita and the gang search for treasure.',
        thumbnail_url: '/static/default-movie.jpg',
        rating: 8.0,
        duration_minutes: 109,
        view_count: 987,
        download_count: 76
      }
    ];
  }
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${c.env.SITE_NAME} - Watch Doraemon Movies Online</title>
        <meta name="description" content="${c.env.SITE_DESCRIPTION}">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
        <style>
          .doraemon-blue { background: linear-gradient(135deg, #1E40AF, #3B82F6); }
          .doraemon-red { background: linear-gradient(135deg, #DC2626, #EF4444); }
          .doraemon-yellow { background: linear-gradient(135deg, #D97706, #F59E0B); }
          .movie-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
          .movie-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
        </style>
        ${c.env.GOOGLE_ANALYTICS_ID ? `
        <script async src="https://www.googletagmanager.com/gtag/js?id=${c.env.GOOGLE_ANALYTICS_ID}"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${c.env.GOOGLE_ANALYTICS_ID}');
        </script>
        ` : ''}
    </head>
    <body class="bg-gradient-to-br from-blue-50 to-yellow-50 min-h-screen">
        <!-- Header -->
        <header class="doraemon-blue text-white shadow-lg">
            <div class="container mx-auto px-4 py-6">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <i class="fas fa-robot text-4xl"></i>
                        <div>
                            <h1 class="text-3xl font-bold">${c.env.SITE_NAME}</h1>
                            <p class="text-blue-200">Watch Doraemon Movies Online</p>
                        </div>
                    </div>
                    <nav class="hidden md:flex space-x-6">
                        <a href="/" class="hover:text-blue-200 transition-colors">Home</a>
                        <a href="/movies" class="hover:text-blue-200 transition-colors">Movies</a>
                        <a href="/blog" class="hover:text-blue-200 transition-colors">Blog</a>
                    </nav>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="container mx-auto px-4 py-8">
            <!-- Hero Section -->
            <section class="text-center mb-12">
                <h2 class="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
                    <span class="text-blue-600">Doraemon</span> 
                    <span class="text-red-500">Movie</span> 
                    <span class="text-yellow-500">Collection</span>
                </h2>
                <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                    Discover the magical world of Doraemon with our complete collection of movies. 
                    Watch, download, and enjoy AI-generated blog content about your favorite adventures!
                </p>
            </section>

            <!-- Movies Grid -->
            <section>
                <h3 class="text-3xl font-bold text-gray-800 mb-8 text-center">
                    <i class="fas fa-film mr-3 text-blue-500"></i>
                    Featured Movies
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="movies-grid">
                    ${movies.map(movie => `
                        <div class="movie-card bg-white rounded-xl shadow-lg overflow-hidden">
                            <div class="relative">
                                <img src="${movie.thumbnail_url || '/static/default-movie.jpg'}" 
                                     alt="${movie.title}" 
                                     class="w-full h-64 object-cover">
                                <div class="absolute top-4 left-4">
                                    <span class="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                                        ${movie.year || 'Classic'}
                                    </span>
                                </div>
                                <div class="absolute top-4 right-4">
                                    <div class="flex items-center bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                                        <i class="fas fa-star text-yellow-400 mr-1"></i>
                                        <span>${movie.rating || '8.0'}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="p-6">
                                <h4 class="text-xl font-bold text-gray-800 mb-3">${movie.title}</h4>
                                <p class="text-gray-600 mb-4 line-clamp-3">
                                    ${movie.description || 'A wonderful Doraemon adventure awaits!'}
                                </p>
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center text-sm text-gray-500">
                                        <i class="fas fa-clock mr-1"></i>
                                        <span>${movie.duration_minutes || 90} min</span>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <button onclick="watchMovie(${movie.id})" 
                                                class="doraemon-blue text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                                            <i class="fas fa-play mr-2"></i>Watch
                                        </button>
                                        <a href="/movie/${movie.id}/blog" 
                                           class="doraemon-yellow text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                                            <i class="fas fa-blog mr-2"></i>Blog
                                        </a>
                                    </div>
                                </div>
                                <div class="mt-4 flex items-center justify-between text-sm text-gray-500">
                                    <div class="flex items-center">
                                        <i class="fas fa-eye mr-1"></i>
                                        <span>${movie.view_count || 0} views</span>
                                    </div>
                                    <div class="flex items-center">
                                        <i class="fas fa-download mr-1"></i>
                                        <span>${movie.download_count || 0} downloads</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Features Section -->
            <section class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="text-center p-6 bg-white rounded-xl shadow-lg">
                    <div class="doraemon-blue w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-robot text-2xl text-white"></i>
                    </div>
                    <h4 class="text-xl font-bold text-gray-800 mb-3">AI-Generated Blogs</h4>
                    <p class="text-gray-600">Discover detailed movie reviews and character analysis powered by artificial intelligence.</p>
                </div>
                <div class="text-center p-6 bg-white rounded-xl shadow-lg">
                    <div class="doraemon-red w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-play text-2xl text-white"></i>
                    </div>
                    <h4 class="text-xl font-bold text-gray-800 mb-3">Stream & Download</h4>
                    <p class="text-gray-600">Watch movies online or download them for offline viewing after watching ads.</p>
                </div>
                <div class="text-center p-6 bg-white rounded-xl shadow-lg">
                    <div class="doraemon-yellow w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-mobile-alt text-2xl text-white"></i>
                    </div>
                    <h4 class="text-xl font-bold text-gray-800 mb-3">Mobile Friendly</h4>
                    <p class="text-gray-600">Enjoy Doraemon movies on any device with our responsive design.</p>
                </div>
            </section>
        </main>

        <!-- Footer -->
        <footer class="bg-gray-800 text-white mt-16">
            <div class="container mx-auto px-4 py-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h5 class="text-xl font-bold mb-4">About ${c.env.SITE_NAME}</h5>
                        <p class="text-gray-300">${c.env.SITE_DESCRIPTION}</p>
                    </div>
                    <div>
                        <h5 class="text-xl font-bold mb-4">Quick Links</h5>
                        <ul class="space-y-2">
                            <li><a href="/" class="text-gray-300 hover:text-white transition-colors">Home</a></li>
                            <li><a href="/movies" class="text-gray-300 hover:text-white transition-colors">Movies</a></li>
                            <li><a href="/blog" class="text-gray-300 hover:text-white transition-colors">Blog</a></li>
                        </ul>
                    </div>
                    <div>
                        <h5 class="text-xl font-bold mb-4">Contact</h5>
                        <p class="text-gray-300">Enjoy Doraemon movies responsibly!</p>
                    </div>
                </div>
                <div class="border-t border-gray-700 mt-8 pt-8 text-center">
                    <p class="text-gray-300">© 2024 ${c.env.SITE_NAME}. Educational purposes only.</p>
                </div>
            </div>
        </footer>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
        <script>
            // Konami Code for admin access
            let konamiSequence = [];
            const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
            
            document.addEventListener('keydown', function(e) {
                konamiSequence.push(e.code);
                if (konamiSequence.length > konamiCode.length) {
                    konamiSequence.shift();
                }
                
                if (JSON.stringify(konamiSequence) === JSON.stringify(konamiCode)) {
                    window.location.href = '/awd';
                    konamiSequence = [];
                }
            });

            function watchMovie(movieId) {
                // Track analytics
                trackEvent('movie_view', 'movie', movieId);
                
                // Check if user has watched enough ads
                checkAdRequirement(movieId).then(result => {
                    if (result.can_watch) {
                        window.location.href = '/watch/' + movieId;
                    } else {
                        showAdModal(movieId, result.ads_needed);
                    }
                });
            }
        </script>
    </body>
    </html>
  `);
});

// Import route modules
import authRoutes from './routes/auth';
import movieRoutes from './routes/movies';
import adminRoutes from './routes/admin';
import streamingRoutes from './routes/streaming';

// Mount route modules
app.route('/', authRoutes);
app.route('/', movieRoutes);
app.route('/', adminRoutes);
app.route('/', streamingRoutes);

export default app;