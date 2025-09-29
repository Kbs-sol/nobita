// Doraemon Movie Streaming Website - Frontend JavaScript

// Global variables
let sessionId = null;
let isAdmin = false;
let adminToken = null;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        // Get or create session
        sessionId = localStorage.getItem('session_id') || generateUUID();
        localStorage.setItem('session_id', sessionId);
        
        // Set session header for all axios requests
        axios.defaults.headers.common['X-Session-ID'] = sessionId;
        
        // Check admin authentication
        adminToken = localStorage.getItem('admin_token');
        if (adminToken) {
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + adminToken;
            await verifyAdminToken();
        }
        
        // Initialize page-specific functionality
        initializePage();
        
    } catch (error) {
        console.error('App initialization error:', error);
    }
}

function initializePage() {
    const path = window.location.pathname;
    
    if (path === '/') {
        initializeHomepage();
    } else if (path.startsWith('/movie/') && path.endsWith('/blog')) {
        initializeBlogPage();
    } else if (path.startsWith('/watch/')) {
        initializeWatchPage();
    } else if (path.startsWith('/admin/')) {
        initializeAdminPanel();
    }
}

// Homepage functionality
function initializeHomepage() {
    loadMovies();
    setupSearchFunctionality();
    setupFilterFunctionality();
}

async function loadMovies() {
    try {
        const response = await axios.get('/api/movies');
        if (response.data.success) {
            displayMovies(response.data.movies);
        }
    } catch (error) {
        console.error('Failed to load movies:', error);
        showToast('Failed to load movies', 'error');
    }
}

function displayMovies(movies) {
    const container = document.getElementById('movies-grid');
    if (!container) return;
    
    container.innerHTML = movies.map(movie => `
        <div class="movie-card bg-white rounded-xl shadow-lg overflow-hidden" data-movie-id="${movie.id}">
            <div class="relative">
                <img src="${movie.thumbnail_url || '/static/default-movie.jpg'}" 
                     alt="${movie.title}" 
                     class="w-full h-64 object-cover"
                     loading="lazy"
                     onerror="this.src='/static/default-movie.jpg'">
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
    `).join('');
}

// Search functionality
function setupSearchFunctionality() {
    const searchInput = document.getElementById('movieSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterMovies, 300));
    }
}

function setupFilterFunctionality() {
    const yearFilter = document.getElementById('yearFilter');
    const ratingFilter = document.getElementById('ratingFilter');
    
    if (yearFilter) {
        yearFilter.addEventListener('change', filterMovies);
    }
    
    if (ratingFilter) {
        ratingFilter.addEventListener('change', filterMovies);
    }
}

function filterMovies() {
    const searchTerm = document.getElementById('movieSearch')?.value.toLowerCase() || '';
    const yearFilter = document.getElementById('yearFilter')?.value || '';
    const ratingFilter = parseFloat(document.getElementById('ratingFilter')?.value || '0');
    
    const movieCards = document.querySelectorAll('.movie-card');
    
    movieCards.forEach(card => {
        const title = card.querySelector('h4').textContent.toLowerCase();
        const year = card.querySelector('.bg-blue-500').textContent;
        const rating = parseFloat(card.querySelector('.fas.fa-star + span').textContent);
        
        const matchesSearch = title.includes(searchTerm);
        const matchesYear = !yearFilter || year.includes(yearFilter);
        const matchesRating = rating >= ratingFilter;
        
        if (matchesSearch && matchesYear && matchesRating) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Movie interaction functions
async function watchMovie(movieId) {
    try {
        // Track movie view
        await trackEvent('movie_view', 'movie', movieId);
        
        // Check ad requirements
        const response = await axios.post(`/api/check-ads/${movieId}`);
        
        if (response.data.success) {
            if (response.data.can_watch) {
                window.location.href = `/watch/${movieId}`;
            } else {
                showAdModal(movieId, response.data.ads_needed);
            }
        }
    } catch (error) {
        console.error('Watch movie error:', error);
        showToast('Failed to start movie', 'error');
    }
}

function showAdModal(movieId, adsNeeded) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div class="text-center">
                <i class="fas fa-ad text-4xl text-blue-500 mb-4"></i>
                <h3 class="text-2xl font-bold text-gray-800 mb-4">Watch Ads to Continue</h3>
                <p class="text-gray-600 mb-6">Please watch ${adsNeeded} ad(s) to unlock this movie.</p>
                <div class="flex space-x-4">
                    <button onclick="window.location.href='/watch/${movieId}'" 
                            class="flex-1 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors">
                        <i class="fas fa-play mr-2"></i>Continue
                    </button>
                    <button onclick="this.closest('.fixed').remove()" 
                            class="flex-1 bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Blog page functionality
function initializeBlogPage() {
    setupSocialSharing();
    setupBlogInteractions();
}

function setupSocialSharing() {
    const shareButtons = document.querySelectorAll('[data-share]');
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            const platform = this.getAttribute('data-share');
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);
            
            let shareUrl = '';
            
            switch (platform) {
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                    break;
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                    break;
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                    break;
                default:
                    if (navigator.share) {
                        navigator.share({
                            title: document.title,
                            url: window.location.href
                        });
                        return;
                    } else {
                        navigator.clipboard.writeText(window.location.href);
                        showToast('Link copied to clipboard!', 'success');
                        return;
                    }
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });
}

function setupBlogInteractions() {
    // Like button functionality
    const likeButton = document.querySelector('[onclick="likePost()"]');
    if (likeButton) {
        likeButton.addEventListener('click', async function() {
            try {
                const blogId = this.getAttribute('data-blog-id');
                await trackEvent('blog_view', 'blog', blogId, { action: 'like' });
                showToast('Thanks for liking this post!', 'success');
                
                // Update like count
                const likeCount = this.querySelector('.like-count');
                if (likeCount) {
                    likeCount.textContent = parseInt(likeCount.textContent) + 1;
                }
            } catch (error) {
                console.error('Like error:', error);
            }
        });
    }
}

// Admin panel functionality
function initializeAdminPanel() {
    if (!adminToken) {
        window.location.href = '/awd';
        return;
    }
    
    loadAdminDashboard();
}

async function loadAdminDashboard() {
    try {
        const response = await axios.get('/api/admin/stats');
        if (response.data.success) {
            displayAdminStats(response.data.stats);
        }
    } catch (error) {
        console.error('Admin dashboard error:', error);
        if (error.response?.status === 401) {
            logout();
        }
    }
}

function displayAdminStats(stats) {
    // Update stats cards
    const statsContainer = document.getElementById('admin-stats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="bg-white rounded-lg p-6 shadow">
                    <div class="flex items-center">
                        <div class="p-2 bg-blue-100 rounded-lg">
                            <i class="fas fa-film text-blue-500"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Total Movies</p>
                            <p class="text-2xl font-bold text-gray-900">${stats.total_movies}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg p-6 shadow">
                    <div class="flex items-center">
                        <div class="p-2 bg-green-100 rounded-lg">
                            <i class="fas fa-eye text-green-500"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Total Views</p>
                            <p class="text-2xl font-bold text-gray-900">${stats.total_views}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg p-6 shadow">
                    <div class="flex items-center">
                        <div class="p-2 bg-yellow-100 rounded-lg">
                            <i class="fas fa-download text-yellow-500"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Total Downloads</p>
                            <p class="text-2xl font-bold text-gray-900">${stats.total_downloads}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg p-6 shadow">
                    <div class="flex items-center">
                        <div class="p-2 bg-red-100 rounded-lg">
                            <i class="fas fa-check-circle text-red-500"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Active Movies</p>
                            <p class="text-2xl font-bold text-gray-900">${stats.active_movies}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

async function verifyAdminToken() {
    try {
        const response = await axios.post('/api/admin/verify');
        if (response.data.success) {
            isAdmin = true;
            return true;
        }
    } catch (error) {
        logout();
    }
    return false;
}

function logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    delete axios.defaults.headers.common['Authorization'];
    isAdmin = false;
    adminToken = null;
    window.location.href = '/awd';
}

// Analytics and tracking
async function trackEvent(eventType, entityType, entityId, additionalData = null) {
    try {
        await axios.post('/api/analytics/track', {
            event_type: eventType,
            entity_type: entityType,
            entity_id: entityId,
            additional_data: additionalData
        });
    } catch (error) {
        console.error('Analytics tracking error:', error);
    }
}

// Utility functions
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Hide and remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, duration);
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
}

// Error handling
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    showToast('An unexpected error occurred', 'error');
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showToast('An unexpected error occurred', 'error');
});

// Service Worker registration (if available)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export functions for global use
window.DoraemonApp = {
    watchMovie,
    trackEvent,
    showToast,
    logout,
    formatNumber,
    timeAgo
};