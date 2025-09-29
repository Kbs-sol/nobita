// Streaming and download routes
import { Hono } from 'hono';
import type { HonoEnv, StreamRequest, StreamResponse } from '../types';
import { DatabaseService } from '../utils/database';
import { TelegramService } from '../utils/telegram';
import { getClientIP, getUserAgent } from '../utils/auth';

const streaming = new Hono<HonoEnv>();

// Check ad requirement for movie access
streaming.post('/api/check-ads/:movieId', async (c) => {
  try {
    const movieId = parseInt(c.req.param('movieId'));
    if (isNaN(movieId)) {
      return c.json({ success: false, message: 'Invalid movie ID' }, 400);
    }

    const session = c.get('session');
    if (!session) {
      return c.json({ success: false, message: 'Session required' }, 401);
    }

    const db = new DatabaseService(c.env.DB);
    const movie = await db.getMovieById(movieId);
    
    if (!movie || !movie.is_active) {
      return c.json({ success: false, message: 'Movie not found' }, 404);
    }

    const unlockedMovies = session.movies_unlocked ? JSON.parse(session.movies_unlocked) : [];
    const adsWatched = session.ads_watched || 0;
    const isUnlocked = unlockedMovies.includes(movieId);
    
    const requiredAds = 2;
    const canWatch = isUnlocked || adsWatched >= requiredAds;

    return c.json({
      success: true,
      can_watch: canWatch,
      ads_watched: adsWatched,
      ads_needed: Math.max(0, requiredAds - adsWatched),
      is_unlocked: isUnlocked
    });

  } catch (error) {
    console.error('Check ads error:', error);
    return c.json({ success: false, message: 'Failed to check ad requirements' }, 500);
  }
});

// Track ad interaction
streaming.post('/api/track-ad', async (c) => {
  try {
    const body = await c.req.json();
    const { movie_id, ad_type, interaction_type } = body;

    const session = c.get('session');
    if (!session) {
      return c.json({ success: false, message: 'Session required' }, 401);
    }

    const db = new DatabaseService(c.env.DB);
    
    // Record ad interaction
    await db.recordAdInteraction({
      session_id: session.session_id,
      movie_id: movie_id,
      ad_type: ad_type,
      ad_network: 'google_adsense',
      interaction_type: interaction_type
    });

    // If ad was completed, increment ads watched
    if (interaction_type === 'completion') {
      const newAdsWatched = (session.ads_watched || 0) + 1;
      const unlockedMovies = session.movies_unlocked ? JSON.parse(session.movies_unlocked) : [];
      
      // Check if user has watched enough ads to unlock the movie
      if (newAdsWatched >= 2 && movie_id && !unlockedMovies.includes(movie_id)) {
        unlockedMovies.push(movie_id);
      }
      
      await db.updateSessionAds(session.session_id, newAdsWatched, unlockedMovies);
      
      return c.json({
        success: true,
        ads_watched: newAdsWatched,
        movie_unlocked: unlockedMovies.includes(movie_id)
      });
    }

    return c.json({ success: true });

  } catch (error) {
    console.error('Track ad error:', error);
    return c.json({ success: false, message: 'Failed to track ad' }, 500);
  }
});

// Stream movie file
streaming.get('/api/stream/:fileId', async (c) => {
  try {
    const fileId = decodeURIComponent(c.req.param('fileId'));
    
    if (!fileId) {
      return new Response('File ID required', { status: 400 });
    }

    const telegram = new TelegramService(c.env.TELEGRAM_BOT_TOKEN);
    
    // Validate file ID format
    if (!telegram.isValidFileId(fileId)) {
      return new Response('Invalid file ID format', { status: 400 });
    }

    // Stream the file through Telegram API
    return await telegram.streamFile(fileId, c.req.raw);

  } catch (error) {
    console.error('Stream error:', error);
    return new Response('Streaming failed', { status: 500 });
  }
});

// Download movie file
streaming.get('/api/download/:fileId', async (c) => {
  try {
    const fileId = decodeURIComponent(c.req.param('fileId'));
    const filename = c.req.query('filename') || 'movie.mp4';
    
    if (!fileId) {
      return new Response('File ID required', { status: 400 });
    }

    const telegram = new TelegramService(c.env.TELEGRAM_BOT_TOKEN);
    
    // Validate file ID format
    if (!telegram.isValidFileId(fileId)) {
      return new Response('Invalid file ID format', { status: 400 });
    }

    // Get direct download URL
    const downloadUrl = await telegram.getDirectDownloadUrl(fileId);
    
    if (!downloadUrl) {
      return new Response('Download not available', { status: 404 });
    }

    // Fetch file and return with download headers
    const response = await fetch(downloadUrl);
    
    if (!response.ok) {
      return new Response('Download failed', { status: 502 });
    }

    const headers = new Headers(response.headers);
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Content-Type', 'application/octet-stream');

    return new Response(response.body, {
      status: response.status,
      headers: headers
    });

  } catch (error) {
    console.error('Download error:', error);
    return new Response('Download failed', { status: 500 });
  }
});

// Movie watch page
streaming.get('/watch/:id', async (c) => {
  try {
    const movieId = parseInt(c.req.param('id'));
    if (isNaN(movieId)) {
      return c.html('<h1>Invalid Movie ID</h1>', 400);
    }

    const db = new DatabaseService(c.env.DB);
    const movie = await db.getMovieById(movieId);
    
    if (!movie || !movie.is_active) {
      return c.html('<h1>Movie Not Found</h1>', 404);
    }

    const characters = movie.characters ? JSON.parse(movie.characters) : [];
    const ottPlatforms = movie.ott_availability ? JSON.parse(movie.ott_availability) : [];

    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Watch ${movie.title} - ${c.env.SITE_NAME}</title>
          <meta name="description" content="Watch ${movie.title} online on ${c.env.SITE_NAME}">
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
          <style>
            .doraemon-blue { background: linear-gradient(135deg, #1E40AF, #3B82F6); }
            .doraemon-red { background: linear-gradient(135deg, #DC2626, #EF4444); }
            .doraemon-yellow { background: linear-gradient(135deg, #D97706, #F59E0B); }
            .ad-overlay { 
              position: fixed; 
              top: 0; 
              left: 0; 
              width: 100%; 
              height: 100%; 
              background: rgba(0,0,0,0.9); 
              z-index: 9999; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
            }
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
      <body class="bg-black">
          <!-- Ad Overlay (initially hidden) -->
          <div id="adOverlay" class="ad-overlay hidden">
              <div class="bg-white rounded-lg p-8 max-w-md text-center">
                  <h3 class="text-2xl font-bold text-gray-800 mb-4">Watch Ad to Continue</h3>
                  <p class="text-gray-600 mb-6">Please watch <span id="adsRemaining">2</span> ad(s) to unlock this movie.</p>
                  
                  <!-- Ad placeholder -->
                  <div id="adContainer" class="bg-gray-200 h-64 flex items-center justify-center mb-4 rounded-lg">
                      ${c.env.ADSENSE_CLIENT_ID ? `
                      <ins class="adsbygoogle"
                           style="display:block;width:300px;height:250px;"
                           data-ad-client="${c.env.ADSENSE_CLIENT_ID}"
                           data-ad-slot="${c.env.ADSENSE_SLOT_ID || ''}"></ins>
                      ` : `
                      <div class="text-gray-500">
                          <i class="fas fa-ad text-4xl mb-4"></i>
                          <p>Advertisement</p>
                          <p class="text-sm">(Demo Mode - Click to continue)</p>
                      </div>
                      `}
                  </div>
                  
                  <div class="flex space-x-4">
                      <button onclick="skipAd()" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                          Skip Ad (<span id="skipTimer">5</span>s)
                      </button>
                      <button onclick="closeAd()" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                          Close
                      </button>
                  </div>
              </div>
          </div>

          <!-- Header -->
          <header class="bg-black bg-opacity-75 text-white p-4 absolute top-0 left-0 right-0 z-50">
              <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                      <a href="/" class="text-2xl font-bold hover:text-blue-400 transition-colors">
                          <i class="fas fa-arrow-left mr-2"></i>
                          ${c.env.SITE_NAME}
                      </a>
                      <div>
                          <h1 class="text-xl font-semibold">${movie.title}</h1>
                          <p class="text-gray-300 text-sm">${movie.year || 'Classic'}</p>
                      </div>
                  </div>
                  <div class="flex items-center space-x-4">
                      <a href="/movie/${movieId}/blog" 
                         class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors">
                          <i class="fas fa-blog mr-2"></i>Blog
                      </a>
                  </div>
              </div>
          </header>

          <!-- Video Player Container -->
          <main class="relative h-screen flex items-center justify-center">
              <div id="playerContainer" class="w-full max-w-6xl mx-auto">
                  <!-- Video Player -->
                  <video id="moviePlayer" 
                         class="w-full h-auto max-h-screen"
                         controls
                         preload="metadata"
                         poster="${movie.thumbnail_url || '/static/default-movie.jpg'}"
                         style="display: none;">
                      <source id="videoSource" src="" type="video/mp4">
                      Your browser does not support the video tag.
                  </video>
                  
                  <!-- Loading/Locked State -->
                  <div id="lockedState" class="text-center text-white">
                      <div class="bg-black bg-opacity-75 rounded-lg p-8 inline-block">
                          <i class="fas fa-lock text-6xl text-gray-400 mb-4"></i>
                          <h2 class="text-2xl font-bold mb-4">Movie Locked</h2>
                          <p class="text-gray-300 mb-6">Watch 2 ads to unlock this movie</p>
                          <div class="space-y-4">
                              <button onclick="watchAd()" 
                                      class="doraemon-blue text-white px-8 py-3 rounded-lg hover:opacity-90 transition-opacity">
                                  <i class="fas fa-ad mr-2"></i>Watch Ad (<span id="adsWatched">0</span>/2)
                              </button>
                              <br>
                              <button onclick="downloadMovie()" 
                                      class="doraemon-red text-white px-8 py-3 rounded-lg hover:opacity-90 transition-opacity">
                                  <i class="fas fa-download mr-2"></i>Download Movie
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </main>

          <!-- Movie Info (Bottom) -->
          <footer class="bg-black bg-opacity-75 text-white p-4 absolute bottom-0 left-0 right-0">
              <div class="max-w-6xl mx-auto">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                          <p class="text-gray-300">Duration: ${movie.duration_minutes || 90} minutes</p>
                          <p class="text-gray-300">Rating: ${movie.rating || '8.0'}/10</p>
                      </div>
                      <div>
                          ${characters.length > 0 ? `
                          <p class="text-gray-300">Characters: ${characters.slice(0, 3).join(', ')}${characters.length > 3 ? '...' : ''}</p>
                          ` : ''}
                      </div>
                      <div class="text-right">
                          <p class="text-gray-300">Views: ${movie.view_count || 0}</p>
                          <p class="text-gray-300">Downloads: ${movie.download_count || 0}</p>
                      </div>
                  </div>
              </div>
          </footer>

          <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
          <script>
              const movieId = ${movieId};
              const fileId = '${movie.telegram_file_id || ''}';
              let adsWatchedCount = 0;
              let skipCountdown = 5;
              let skipTimer = null;

              // Initialize page
              async function init() {
                  try {
                      const response = await axios.post('/api/check-ads/' + movieId);
                      const data = response.data;
                      
                      if (data.success) {
                          adsWatchedCount = data.ads_watched;
                          document.getElementById('adsWatched').textContent = adsWatchedCount;
                          document.getElementById('adsRemaining').textContent = data.ads_needed;
                          
                          if (data.can_watch) {
                              unlockMovie();
                          }
                      }
                  } catch (error) {
                      console.error('Init error:', error);
                  }
              }

              function watchAd() {
                  if (adsWatchedCount >= 2) {
                      unlockMovie();
                      return;
                  }
                  
                  document.getElementById('adOverlay').classList.remove('hidden');
                  
                  // Track ad impression
                  trackAd('impression');
                  
                  // Start skip countdown
                  skipCountdown = 5;
                  updateSkipTimer();
                  skipTimer = setInterval(() => {
                      skipCountdown--;
                      updateSkipTimer();
                      
                      if (skipCountdown <= 0) {
                          clearInterval(skipTimer);
                          document.querySelector('button[onclick="skipAd()"]').disabled = false;
                      }
                  }, 1000);
                  
                  ${c.env.ADSENSE_CLIENT_ID ? `
                  // Load AdSense
                  (adsbygoogle = window.adsbygoogle || []).push({});
                  ` : `
                  // Demo mode - auto complete after 3 seconds
                  setTimeout(() => {
                      skipAd();
                  }, 3000);
                  `}
              }

              function updateSkipTimer() {
                  const button = document.querySelector('button[onclick="skipAd()"]');
                  const timer = document.getElementById('skipTimer');
                  
                  if (skipCountdown > 0) {
                      timer.textContent = skipCountdown;
                      button.disabled = true;
                      button.classList.add('opacity-50');
                  } else {
                      timer.textContent = '0';
                      button.disabled = false;
                      button.classList.remove('opacity-50');
                      button.textContent = 'Continue';
                  }
              }

              async function skipAd() {
                  if (skipCountdown > 0) return;
                  
                  // Track ad completion
                  try {
                      const response = await axios.post('/api/track-ad', {
                          movie_id: movieId,
                          ad_type: 'watch_unlock',
                          interaction_type: 'completion'
                      });
                      
                      if (response.data.success) {
                          adsWatchedCount = response.data.ads_watched;
                          document.getElementById('adsWatched').textContent = adsWatchedCount;
                          
                          if (response.data.movie_unlocked || adsWatchedCount >= 2) {
                              closeAd();
                              unlockMovie();
                          } else {
                              closeAd();
                              document.getElementById('adsRemaining').textContent = 2 - adsWatchedCount;
                          }
                      }
                  } catch (error) {
                      console.error('Track ad error:', error);
                      closeAd();
                  }
              }

              function closeAd() {
                  document.getElementById('adOverlay').classList.add('hidden');
                  if (skipTimer) {
                      clearInterval(skipTimer);
                  }
              }

              function unlockMovie() {
                  if (!fileId) {
                      alert('Movie file not available');
                      return;
                  }
                  
                  document.getElementById('lockedState').style.display = 'none';
                  document.getElementById('moviePlayer').style.display = 'block';
                  document.getElementById('videoSource').src = '/api/stream/' + encodeURIComponent(fileId);
                  document.getElementById('moviePlayer').load();
                  
                  // Track movie view
                  trackEvent('movie_view', 'movie', movieId);
              }

              async function downloadMovie() {
                  if (adsWatchedCount < 2) {
                      alert('Please watch 2 ads before downloading');
                      return;
                  }
                  
                  if (!fileId) {
                      alert('Download not available');
                      return;
                  }
                  
                  // Track download
                  trackEvent('download', 'movie', movieId);
                  
                  // Open download link
                  const downloadUrl = '/api/download/' + encodeURIComponent(fileId) + '?filename=' + encodeURIComponent('${movie.title}.mp4');
                  window.open(downloadUrl, '_blank');
              }

              async function trackAd(interactionType) {
                  try {
                      await axios.post('/api/track-ad', {
                          movie_id: movieId,
                          ad_type: 'watch_unlock',
                          interaction_type: interactionType
                      });
                  } catch (error) {
                      console.error('Track ad error:', error);
                  }
              }

              async function trackEvent(eventType, entityType, entityId) {
                  try {
                      await axios.post('/api/analytics/track', {
                          event_type: eventType,
                          entity_type: entityType,
                          entity_id: entityId
                      });
                  } catch (error) {
                      console.error('Track event error:', error);
                  }
              }

              // Initialize on page load
              init();
          </script>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('Watch page error:', error);
    return c.html('<h1>Error Loading Movie</h1>', 500);
  }
});

// Analytics tracking endpoint
streaming.post('/api/analytics/track', async (c) => {
  try {
    const body = await c.req.json();
    const { event_type, entity_type, entity_id, additional_data } = body;

    const session = c.get('session');
    if (!session) {
      return c.json({ success: false, message: 'Session required' }, 401);
    }

    const db = new DatabaseService(c.env.DB);
    
    await db.recordAnalytic({
      event_type: event_type,
      entity_type: entity_type || null,
      entity_id: entity_id || null,
      session_id: session.session_id,
      ip_address: getClientIP(c.req.raw),
      user_agent: getUserAgent(c.req.raw),
      referrer: c.req.header('Referer') || null,
      additional_data: additional_data ? JSON.stringify(additional_data) : null
    });

    // Update movie counters if needed
    if (event_type === 'movie_view' && entity_id) {
      await db.incrementMovieViews(entity_id);
    } else if (event_type === 'download' && entity_id) {
      await db.incrementMovieDownloads(entity_id);
    }

    return c.json({ success: true });

  } catch (error) {
    console.error('Analytics track error:', error);
    return c.json({ success: false, message: 'Failed to track analytics' }, 500);
  }
});

export default streaming;