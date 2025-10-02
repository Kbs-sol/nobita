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

// All Movies Gallery Page
movies.get('/movies', async (c) => {
  try {
    const db = new DatabaseService(c.env.DB);
    let allMovies = [];
    
    if (c.env.DB) {
      allMovies = await db.getAllMovies();
    } else {
      // Fallback sample movies for local development
      allMovies = [
        { id: 1, title: 'Stand by Me Doraemon', year: 2014, rating: 8.8, thumbnail_url: '/static/movies/stand-by-me-2014.jpg', description: 'Revolutionary 3D CGI film focusing on the emotional bond between Nobita and Doraemon.' },
        { id: 2, title: 'Doraemon: Nobita\'s New Dinosaur', year: 2020, rating: 8.3, thumbnail_url: '/static/movies/new-dinosaur-2020.jpg', description: 'Twin dinosaur adventure focusing on evolution, adaptation, and the bonds between species.' }
      ];
    }

    const decades = {
      '1980s': allMovies.filter(m => m.year >= 1980 && m.year < 1990),
      '1990s': allMovies.filter(m => m.year >= 1990 && m.year < 2000),
      '2000s': allMovies.filter(m => m.year >= 2000 && m.year < 2010),
      '2010s': allMovies.filter(m => m.year >= 2010 && m.year < 2020),
      '2020s': allMovies.filter(m => m.year >= 2020)
    };

    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>All Doraemon Movies - ${c.env.SITE_NAME}</title>
          <meta name="description" content="Complete collection of Doraemon movies from 1980 to 2026. Watch and discover all the adventures!">
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
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
                          <a href="/" class="flex items-center space-x-4">
                              <i class="fas fa-robot text-4xl"></i>
                              <div>
                                  <h1 class="text-3xl font-bold">${c.env.SITE_NAME}</h1>
                                  <p class="text-blue-200">All Movies Collection</p>
                              </div>
                          </a>
                      </div>
                      <nav class="hidden md:flex space-x-6">
                          <a href="/" class="hover:text-blue-200 transition-colors">Home</a>
                          <a href="/movies" class="text-white font-semibold">Movies</a>
                          <a href="/blog" class="hover:text-blue-200 transition-colors">Blog</a>
                      </nav>
                  </div>
              </div>
          </header>

          <main class="container mx-auto px-4 py-8">
              <!-- Hero Section -->
              <section class="text-center mb-12">
                  <h2 class="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
                      Complete <span class="text-blue-600">Doraemon</span> Collection
                  </h2>
                  <p class="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                      Explore all ${allMovies.length} Doraemon movies from 1980 to 2026. 
                      From classic adventures to modern 3D masterpieces, discover the magical world of Doraemon!
                  </p>
                  
                  <!-- Movie Stats -->
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                      <div class="bg-white rounded-lg p-4 shadow-sm">
                          <div class="text-2xl font-bold text-blue-600">${allMovies.length}</div>
                          <div class="text-sm text-gray-600">Total Movies</div>
                      </div>
                      <div class="bg-white rounded-lg p-4 shadow-sm">
                          <div class="text-2xl font-bold text-green-600">47</div>
                          <div class="text-sm text-gray-600">Years of Magic</div>
                      </div>
                      <div class="bg-white rounded-lg p-4 shadow-sm">
                          <div class="text-2xl font-bold text-yellow-600">5</div>
                          <div class="text-sm text-gray-600">Decades</div>
                      </div>
                      <div class="bg-white rounded-lg p-4 shadow-sm">
                          <div class="text-2xl font-bold text-red-600">∞</div>
                          <div class="text-sm text-gray-600">Adventures</div>
                      </div>
                  </div>
              </section>

              <!-- Movies by Decade -->
              ${Object.entries(decades).map(([decade, movies]) => `
                ${movies.length > 0 ? `
                <section class="mb-16">
                    <div class="flex items-center mb-8">
                        <h3 class="text-3xl font-bold text-gray-800">${decade}</h3>
                        <div class="flex-1 h-px bg-gray-300 ml-4"></div>
                        <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold ml-4">
                            ${movies.length} movies
                        </span>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        ${movies.map(movie => `
                            <div class="movie-card bg-white rounded-xl shadow-lg overflow-hidden">
                                <div class="relative">
                                    <img src="${movie.thumbnail_url || '/static/default-movie.jpg'}" 
                                         alt="${movie.title}" 
                                         class="w-full h-48 object-cover">
                                    <div class="absolute top-2 left-2">
                                        <span class="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                                            ${movie.year || 'Classic'}
                                        </span>
                                    </div>
                                    <div class="absolute top-2 right-2">
                                        <span class="bg-yellow-500 text-white px-2 py-1 rounded text-sm flex items-center">
                                            <i class="fas fa-star mr-1"></i>${movie.rating || '8.0'}
                                        </span>
                                    </div>
                                </div>
                                <div class="p-4">
                                    <h4 class="text-lg font-bold text-gray-800 mb-2 line-clamp-2">${movie.title}</h4>
                                    <p class="text-gray-600 text-sm mb-4 line-clamp-3">
                                        ${movie.description || 'A wonderful Doraemon adventure awaits!'}
                                    </p>
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center text-sm text-gray-500">
                                            <i class="fas fa-clock mr-1"></i>
                                            <span>${movie.duration_minutes || 90} min</span>
                                        </div>
                                        <div class="flex items-center space-x-2">
                                            <button onclick="watchMovie(${movie.id})" 
                                                    class="doraemon-blue text-white px-3 py-1 rounded hover:opacity-90 transition-opacity text-sm">
                                                <i class="fas fa-play mr-1"></i>Watch
                                            </button>
                                            <a href="/movie/${movie.id}/blog" 
                                               class="doraemon-yellow text-white px-3 py-1 rounded hover:opacity-90 transition-opacity text-sm">
                                                <i class="fas fa-blog mr-1"></i>Blog
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>
                ` : ''}
              `).join('')}
          </main>

          <!-- Footer -->
          <footer class="bg-gray-800 text-white mt-16">
              <div class="container mx-auto px-4 py-8">
                  <div class="text-center">
                      <p class="text-gray-300">© 2024 ${c.env.SITE_NAME}. Enjoy Doraemon movies responsibly!</p>
                  </div>
              </div>
          </footer>

          <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
          <script>
              function watchMovie(movieId) {
                  window.location.href = '/watch/' + movieId;
              }

              // Track page visit
              if (typeof gtag !== 'undefined') {
                  gtag('event', 'page_view', {
                      page_title: 'All Movies',
                      page_location: window.location.href
                  });
              }
          </script>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('Movies page error:', error);
    return c.html('<h1>Error Loading Movies</h1>', 500);
  }
});

// All Blogs Gallery Page
movies.get('/blog', async (c) => {
  try {
    // For now, use sample data to get the page working
    const allBlogs = [
      { 
        id: 1, 
        title: 'Stand by Me Doraemon: A Revolutionary 3D Journey', 
        summary: 'Experience the groundbreaking 3D animation of Stand by Me Doraemon, a heartwarming tale of friendship and growth.',
        view_count: 1250,
        movie_title: 'Stand by Me Doraemon',
        movie_year: 2014,
        movie_id: 1
      },
      { 
        id: 2, 
        title: 'Antarctic Adventure: Doraemon\'s Coolest Expedition', 
        summary: 'Join Doraemon and friends on their thrilling Antarctic adventure filled with mystery and ancient secrets.',
        view_count: 987,
        movie_title: 'Doraemon: Antarctic Kachi Kochi',
        movie_year: 2017,
        movie_id: 2
      },
      { 
        id: 3, 
        title: 'Treasure Island: A Swashbuckling Doraemon Epic', 
        summary: 'Set sail with Doraemon on a treasure-hunting adventure filled with pirates and friendship.',
        view_count: 1100,
        movie_title: 'Doraemon: Treasure Island',
        movie_year: 2018,
        movie_id: 3
      },
      { 
        id: 4, 
        title: 'New Dinosaur: A Prehistoric Adventure with Heart', 
        summary: 'Discover the wonder of prehistoric life as Nobita raises twin dinosaurs in this heartwarming tale.',
        view_count: 876,
        movie_title: 'Doraemon: New Dinosaur',
        movie_year: 2020,
        movie_id: 4
      },
      { 
        id: 5, 
        title: 'Moon Exploration: Lunar Wonders Await', 
        summary: 'Explore the magical moon and discover its secret rabbit civilization in this enchanting adventure.',
        view_count: 1340,
        movie_title: 'Doraemon: Moon Exploration',
        movie_year: 2019,
        movie_id: 5
      }
    ];

    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Doraemon Movie Blogs - ${c.env.SITE_NAME}</title>
          <meta name="description" content="AI-generated blogs about Doraemon movies. Discover insights, reviews, and analysis of every adventure!">
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
          <style>
            .doraemon-blue { background: linear-gradient(135deg, #1E40AF, #3B82F6); }
            .doraemon-red { background: linear-gradient(135deg, #DC2626, #EF4444); }
            .doraemon-yellow { background: linear-gradient(135deg, #D97706, #F59E0B); }
            .blog-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
            .blog-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
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
                                  <h1 class="text-3xl font-bold">${c.env.SITE_NAME}</h1>
                                  <p class="text-blue-200">AI-Generated Movie Blogs</p>
                              </div>
                          </a>
                      </div>
                      <nav class="hidden md:flex space-x-6">
                          <a href="/" class="hover:text-blue-200 transition-colors">Home</a>
                          <a href="/movies" class="hover:text-blue-200 transition-colors">Movies</a>
                          <a href="/blog" class="text-white font-semibold">Blog</a>
                      </nav>
                  </div>
              </div>
          </header>

          <main class="container mx-auto px-4 py-8">
              <!-- Hero Section -->
              <section class="text-center mb-12">
                  <h2 class="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
                      <span class="text-blue-600">AI-Powered</span> Movie Blogs
                  </h2>
                  <p class="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                      Discover deep insights, character analysis, and hidden meanings in every Doraemon movie. 
                      Our AI generates comprehensive blogs that explore themes, animation, and cultural significance.
                  </p>
                  
                  <!-- Blog Stats -->
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-lg mx-auto">
                      <div class="bg-white rounded-lg p-4 shadow-sm">
                          <div class="text-2xl font-bold text-blue-600">${allBlogs.length}</div>
                          <div class="text-sm text-gray-600">Blog Posts</div>
                      </div>
                      <div class="bg-white rounded-lg p-4 shadow-sm">
                          <div class="text-2xl font-bold text-green-600">AI</div>
                          <div class="text-sm text-gray-600">Generated</div>
                      </div>
                      <div class="bg-white rounded-lg p-4 shadow-sm">
                          <div class="text-2xl font-bold text-purple-600">∞</div>
                          <div class="text-sm text-gray-600">Insights</div>
                      </div>
                  </div>
              </section>

              <!-- Featured Blog -->
              ${allBlogs.length > 0 ? `
              <section class="mb-16">
                  <h3 class="text-3xl font-bold text-gray-800 mb-8 text-center">Featured Blog</h3>
                  <div class="bg-white rounded-xl shadow-xl overflow-hidden max-w-4xl mx-auto">
                      <div class="md:flex">
                          <div class="md:w-1/3">
                              <img src="/static/movies/featured-blog.jpg" 
                                   alt="Featured Blog" 
                                   class="w-full h-64 md:h-full object-cover">
                          </div>
                          <div class="md:w-2/3 p-8">
                              <div class="flex items-center mb-4">
                                  <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                                      Featured
                                  </span>
                                  <span class="ml-2 text-gray-500 text-sm">
                                      ${allBlogs[0].movie_year || 'Classic'}
                                  </span>
                              </div>
                              <h3 class="text-2xl font-bold text-gray-800 mb-4">${allBlogs[0].title}</h3>
                              <p class="text-gray-600 mb-6">${allBlogs[0].summary}</p>
                              <div class="flex items-center justify-between">
                                  <div class="flex items-center text-sm text-gray-500">
                                      <i class="fas fa-eye mr-1"></i>
                                      <span>${allBlogs[0].view_count || 0} views</span>
                                      <span class="mx-2">•</span>
                                      <i class="fas fa-robot mr-1"></i>
                                      <span>AI Generated</span>
                                  </div>
                                  <a href="/movie/${allBlogs[0].movie_id}/blog" 
                                     class="doraemon-blue text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity">
                                      Read More <i class="fas fa-arrow-right ml-2"></i>
                                  </a>
                              </div>
                          </div>
                      </div>
                  </div>
              </section>
              ` : ''}

              <!-- All Blogs Grid -->
              <section>
                  <h3 class="text-3xl font-bold text-gray-800 mb-8">All Movie Blogs</h3>
                  ${allBlogs.length > 0 ? `
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      ${allBlogs.map(blog => `
                          <article class="blog-card bg-white rounded-xl shadow-lg overflow-hidden">
                              <div class="relative">
                                  <img src="/static/movies/blog-${blog.movie_id || 'default'}.jpg" 
                                       alt="${blog.title}" 
                                       class="w-full h-48 object-cover">
                                  <div class="absolute top-2 right-2">
                                      <span class="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                                          ${blog.movie_year || 'Classic'}
                                      </span>
                                  </div>
                              </div>
                              <div class="p-6">
                                  <div class="flex items-center mb-3">
                                      <i class="fas fa-robot text-blue-500 mr-2"></i>
                                      <span class="text-sm text-gray-500">AI Generated</span>
                                  </div>
                                  <h4 class="text-xl font-bold text-gray-800 mb-3 line-clamp-2">${blog.title}</h4>
                                  <p class="text-gray-600 mb-4 line-clamp-3">${blog.summary}</p>
                                  <div class="flex items-center justify-between">
                                      <div class="flex items-center text-sm text-gray-500">
                                          <i class="fas fa-eye mr-1"></i>
                                          <span>${blog.view_count || 0}</span>
                                      </div>
                                      <div class="flex items-center space-x-2">
                                          <a href="/movie/${blog.movie_id}/blog" 
                                             class="doraemon-blue text-white px-4 py-2 rounded hover:opacity-90 transition-opacity text-sm">
                                              <i class="fas fa-book-open mr-1"></i>Read
                                          </a>
                                          <button onclick="watchMovie(${blog.movie_id})" 
                                                  class="doraemon-red text-white px-4 py-2 rounded hover:opacity-90 transition-opacity text-sm">
                                              <i class="fas fa-play mr-1"></i>Watch
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          </article>
                      `).join('')}
                  </div>
                  ` : `
                  <div class="text-center py-16">
                      <i class="fas fa-robot text-6xl text-gray-400 mb-4"></i>
                      <h4 class="text-xl font-semibold text-gray-600 mb-2">No Blogs Yet</h4>
                      <p class="text-gray-500 mb-6">AI-generated blogs will appear here as movies are added.</p>
                      <a href="/movies" class="doraemon-blue text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity">
                          <i class="fas fa-film mr-2"></i>Explore Movies
                      </a>
                  </div>
                  `}
              </section>
          </main>

          <!-- Footer -->
          <footer class="bg-gray-800 text-white mt-16">
              <div class="container mx-auto px-4 py-8">
                  <div class="text-center">
                      <p class="text-gray-300">© 2024 ${c.env.SITE_NAME}. AI-powered movie insights.</p>
                  </div>
              </div>
          </footer>

          <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
          <script>
              function watchMovie(movieId) {
                  window.location.href = '/watch/' + movieId;
              }

              // Track page visit
              if (typeof gtag !== 'undefined') {
                  gtag('event', 'page_view', {
                      page_title: 'All Blogs',
                      page_location: window.location.href
                  });
              }
          </script>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('Blog page error:', error);
    return c.html('<h1>Error Loading Blogs</h1>', 500);
  }
});

export default movies;