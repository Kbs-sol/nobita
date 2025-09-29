// Movie routes for public access
import { Hono } from 'hono';
import type { HonoEnv, MovieRequest, MovieResponse, BlogGenerationRequest } from '../types';
import { DatabaseService } from '../utils/database';
import { OpenRouterService } from '../utils/openrouter';
import { getClientIP, getUserAgent } from '../utils/auth';

const movies = new Hono<HonoEnv>();

// Get all movies (public)
movies.get('/api/movies', async (c) => {
  try {
    const db = new DatabaseService(c.env.DB);
    const allMovies = await db.getAllMovies();

    // Enhance movies with parsed data
    const enhancedMovies = allMovies.map(movie => ({
      ...movie,
      characters_list: movie.characters ? JSON.parse(movie.characters) : [],
      ott_list: movie.ott_availability ? JSON.parse(movie.ott_availability) : []
    }));

    return c.json({
      success: true,
      movies: enhancedMovies
    });

  } catch (error) {
    console.error('Get movies error:', error);
    return c.json({ success: false, message: 'Failed to fetch movies' }, 500);
  }
});

// Get single movie by ID (public)
movies.get('/api/movies/:id', async (c) => {
  try {
    const movieId = parseInt(c.req.param('id'));
    if (isNaN(movieId)) {
      return c.json({ success: false, message: 'Invalid movie ID' }, 400);
    }

    const db = new DatabaseService(c.env.DB);
    const movie = await db.getMovieById(movieId);

    if (!movie || !movie.is_active) {
      return c.json({ success: false, message: 'Movie not found' }, 404);
    }

    // Track movie view
    const session = c.get('session');
    if (session) {
      await db.recordAnalytic({
        event_type: 'movie_view',
        entity_type: 'movie',
        entity_id: movieId,
        session_id: session.session_id,
        ip_address: getClientIP(c.req.raw),
        user_agent: getUserAgent(c.req.raw)
      });
    }

    // Enhance movie with parsed data
    const enhancedMovie = {
      ...movie,
      characters_list: movie.characters ? JSON.parse(movie.characters) : [],
      ott_list: movie.ott_availability ? JSON.parse(movie.ott_availability) : []
    };

    return c.json({
      success: true,
      movie: enhancedMovie
    });

  } catch (error) {
    console.error('Get movie error:', error);
    return c.json({ success: false, message: 'Failed to fetch movie' }, 500);
  }
});

// Get movie blog
movies.get('/api/movies/:id/blog', async (c) => {
  try {
    const movieId = parseInt(c.req.param('id'));
    if (isNaN(movieId)) {
      return c.json({ success: false, message: 'Invalid movie ID' }, 400);
    }

    const db = new DatabaseService(c.env.DB);
    
    // Get movie first to verify it exists
    const movie = await db.getMovieById(movieId);
    if (!movie || !movie.is_active) {
      return c.json({ success: false, message: 'Movie not found' }, 404);
    }

    // Get existing blog
    let blog = await db.getBlogByMovieId(movieId);

    if (!blog) {
      // Generate blog if it doesn't exist
      try {
        const openRouter = new OpenRouterService(c.env.OPENROUTER_API_KEY);
        const generatedBlog = await openRouter.generateBlogPost(movie);
        
        blog = await db.createBlog({
          movie_id: movieId,
          title: generatedBlog.title,
          content: generatedBlog.content,
          summary: generatedBlog.summary,
          keywords: generatedBlog.keywords
        });
      } catch (error) {
        console.error('Blog generation error:', error);
        return c.json({ success: false, message: 'Blog not available' }, 503);
      }
    }

    // Track blog view
    const session = c.get('session');
    if (session) {
      await db.recordAnalytic({
        event_type: 'blog_view',
        entity_type: 'blog',
        entity_id: blog.id,
        session_id: session.session_id,
        ip_address: getClientIP(c.req.raw),
        user_agent: getUserAgent(c.req.raw)
      });
      
      await db.incrementBlogViews(blog.id);
    }

    return c.json({
      success: true,
      blog: blog,
      movie: {
        id: movie.id,
        title: movie.title,
        year: movie.year,
        characters_list: movie.characters ? JSON.parse(movie.characters) : [],
        ott_list: movie.ott_availability ? JSON.parse(movie.ott_availability) : []
      }
    });

  } catch (error) {
    console.error('Get blog error:', error);
    return c.json({ success: false, message: 'Failed to fetch blog' }, 500);
  }
});

// Movie blog page
movies.get('/movie/:id/blog', async (c) => {
  try {
    const movieId = parseInt(c.req.param('id'));
    if (isNaN(movieId)) {
      return c.html('<h1>Invalid Movie ID</h1>', 400);
    }

    const db = new DatabaseService(c.env.DB);
    
    // Get movie and blog data
    const movie = await db.getMovieById(movieId);
    if (!movie || !movie.is_active) {
      return c.html('<h1>Movie Not Found</h1>', 404);
    }

    let blog = await db.getBlogByMovieId(movieId);
    if (!blog) {
      // Generate blog on-the-fly
      try {
        const openRouter = new OpenRouterService(c.env.OPENROUTER_API_KEY);
        const generatedBlog = await openRouter.generateBlogPost(movie);
        
        blog = await db.createBlog({
          movie_id: movieId,
          title: generatedBlog.title,
          content: generatedBlog.content,
          summary: generatedBlog.summary,
          keywords: generatedBlog.keywords
        });
      } catch (error) {
        console.error('Blog generation error:', error);
        blog = {
          title: `${movie.title}: A Doraemon Adventure`,
          content: '<p>Blog content is being generated. Please check back soon!</p>',
          summary: `Discover ${movie.title}, a wonderful Doraemon movie.`,
          keywords: `Doraemon, ${movie.title}, anime movie`
        };
      }
    }

    const characters = movie.characters ? JSON.parse(movie.characters) : [];
    const ottPlatforms = movie.ott_availability ? JSON.parse(movie.ott_availability) : [];

    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${blog.title} - ${c.env.SITE_NAME}</title>
          <meta name="description" content="${blog.summary}">
          <meta name="keywords" content="${blog.keywords}">
          <meta property="og:title" content="${blog.title}">
          <meta property="og:description" content="${blog.summary}">
          <meta property="og:image" content="${movie.thumbnail_url || '/static/default-movie.jpg'}">
          <meta property="og:type" content="article">
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
          <style>
            .doraemon-blue { background: linear-gradient(135deg, #1E40AF, #3B82F6); }
            .doraemon-red { background: linear-gradient(135deg, #DC2626, #EF4444); }
            .doraemon-yellow { background: linear-gradient(135deg, #D97706, #F59E0B); }
            .blog-content h2 { @apply text-2xl font-bold text-gray-800 mt-8 mb-4; }
            .blog-content h3 { @apply text-xl font-semibold text-gray-700 mt-6 mb-3; }
            .blog-content p { @apply text-gray-600 leading-relaxed mb-4; }
            .blog-content ul { @apply list-disc list-inside text-gray-600 mb-4 space-y-2; }
            .blog-content li { @apply ml-4; }
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
                          <a href="/" class="flex items-center space-x-4">
                              <i class="fas fa-robot text-4xl"></i>
                              <div>
                                  <h1 class="text-2xl font-bold">${c.env.SITE_NAME}</h1>
                                  <p class="text-blue-200">Movie Blog</p>
                              </div>
                          </a>
                      </div>
                      <nav class="hidden md:flex space-x-6">
                          <a href="/" class="hover:text-blue-200 transition-colors">Home</a>
                          <a href="/movies" class="hover:text-blue-200 transition-colors">Movies</a>
                          <a href="/watch/${movieId}" class="doraemon-yellow px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                              <i class="fas fa-play mr-2"></i>Watch Movie
                          </a>
                      </nav>
                  </div>
              </div>
          </header>

          <main class="container mx-auto px-4 py-8">
              <!-- Movie Info Section -->
              <section class="mb-8">
                  <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                      <div class="md:flex">
                          <div class="md:w-1/3">
                              <img src="${movie.thumbnail_url || '/static/default-movie.jpg'}" 
                                   alt="${movie.title}" 
                                   class="w-full h-64 md:h-full object-cover">
                          </div>
                          <div class="md:w-2/3 p-6">
                              <div class="flex items-start justify-between mb-4">
                                  <div>
                                      <h1 class="text-3xl font-bold text-gray-800 mb-2">${movie.title}</h1>
                                      <div class="flex items-center space-x-4 text-gray-600">
                                          <span class="flex items-center">
                                              <i class="fas fa-calendar mr-2"></i>
                                              ${movie.year || 'Classic'}
                                          </span>
                                          <span class="flex items-center">
                                              <i class="fas fa-clock mr-2"></i>
                                              ${movie.duration_minutes || 90} min
                                          </span>
                                          <span class="flex items-center">
                                              <i class="fas fa-star mr-2 text-yellow-500"></i>
                                              ${movie.rating || '8.0'}
                                          </span>
                                      </div>
                                  </div>
                              </div>
                              
                              ${movie.description ? `
                              <p class="text-gray-600 mb-4">${movie.description}</p>
                              ` : ''}
                              
                              ${characters.length > 0 ? `
                              <div class="mb-4">
                                  <h3 class="font-semibold text-gray-700 mb-2">Characters:</h3>
                                  <div class="flex flex-wrap gap-2">
                                      ${characters.map(char => `
                                          <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">${char}</span>
                                      `).join('')}
                                  </div>
                              </div>
                              ` : ''}
                              
                              ${ottPlatforms.length > 0 ? `
                              <div class="mb-4">
                                  <h3 class="font-semibold text-gray-700 mb-2">Available on:</h3>
                                  <div class="flex flex-wrap gap-2">
                                      ${ottPlatforms.map(platform => `
                                          <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">${platform}</span>
                                      `).join('')}
                                  </div>
                              </div>
                              ` : ''}
                              
                              <div class="flex items-center space-x-4">
                                  <a href="/watch/${movieId}" 
                                     class="doraemon-blue text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity">
                                      <i class="fas fa-play mr-2"></i>Watch Now
                                  </a>
                                  <button onclick="shareMovie()" 
                                          class="doraemon-yellow text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity">
                                      <i class="fas fa-share mr-2"></i>Share
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              </section>

              <!-- Blog Content -->
              <section>
                  <article class="bg-white rounded-xl shadow-lg p-8">
                      <header class="mb-8 border-b border-gray-200 pb-6">
                          <h1 class="text-4xl font-bold text-gray-800 mb-4">${blog.title}</h1>
                          <div class="flex items-center text-gray-500 text-sm">
                              <i class="fas fa-robot mr-2"></i>
                              <span>AI-Generated Content</span>
                              <span class="mx-2">•</span>
                              <i class="fas fa-eye mr-2"></i>
                              <span>${blog.view_count || 0} views</span>
                          </div>
                      </header>
                      
                      <div class="blog-content prose max-w-none">
                          ${blog.content}
                      </div>
                      
                      <footer class="mt-8 pt-6 border-t border-gray-200">
                          <div class="flex items-center justify-between">
                              <div class="flex items-center space-x-4">
                                  <button onclick="likePost()" class="flex items-center text-gray-500 hover:text-red-500 transition-colors">
                                      <i class="fas fa-heart mr-2"></i>
                                      <span>Like</span>
                                  </button>
                                  <button onclick="sharePost()" class="flex items-center text-gray-500 hover:text-blue-500 transition-colors">
                                      <i class="fas fa-share mr-2"></i>
                                      <span>Share</span>
                                  </button>
                              </div>
                              <a href="/watch/${movieId}" 
                                 class="doraemon-red text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity">
                                  <i class="fas fa-play mr-2"></i>Watch Movie
                              </a>
                          </div>
                      </footer>
                  </article>
              </section>
          </main>

          <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
          <script>
              function shareMovie() {
                  if (navigator.share) {
                      navigator.share({
                          title: '${blog.title}',
                          text: '${blog.summary}',
                          url: window.location.href
                      });
                  } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                  }
              }
              
              function sharePost() {
                  shareMovie();
              }
              
              function likePost() {
                  // Track like interaction
                  axios.post('/api/analytics/track', {
                      event_type: 'blog_view',
                      entity_type: 'blog',
                      entity_id: ${blog.id || movieId},
                      additional_data: { action: 'like' }
                  });
                  
                  alert('Thanks for liking this post!');
              }
          </script>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('Movie blog page error:', error);
    return c.html('<h1>Error Loading Blog</h1>', 500);
  }
});

export default movies;