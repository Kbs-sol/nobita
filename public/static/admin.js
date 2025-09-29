// Admin Panel JavaScript for Doraemon Movie Streaming Website

// Admin application state
const AdminApp = {
    currentUser: null,
    currentPage: 'dashboard',
    movies: [],
    stats: {}
};

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPanel();
});

async function initializeAdminPanel() {
    try {
        // Check authentication
        const token = localStorage.getItem('admin_token');
        if (!token) {
            window.location.href = '/awd';
            return;
        }

        // Set authorization header
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;

        // Verify token
        const authResponse = await axios.post('/api/admin/verify');
        if (!authResponse.data.success) {
            window.location.href = '/awd';
            return;
        }

        AdminApp.currentUser = authResponse.data.user;

        // Load dashboard
        await loadDashboard();
        renderAdminInterface();

    } catch (error) {
        console.error('Admin initialization error:', error);
        window.location.href = '/awd';
    }
}

function renderAdminInterface() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="min-h-screen bg-gray-100">
            <!-- Admin Header -->
            <header class="bg-white shadow-sm border-b">
                <div class="px-6 py-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <h1 class="text-2xl font-bold text-gray-900">
                                <i class="fas fa-robot text-blue-500 mr-2"></i>
                                Doraemon Admin Panel
                            </h1>
                        </div>
                        <div class="flex items-center space-x-4">
                            <span class="text-sm text-gray-600">
                                Welcome, <strong>${AdminApp.currentUser.username}</strong>
                                <span class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">${AdminApp.currentUser.role}</span>
                            </span>
                            <button onclick="logout()" class="text-gray-600 hover:text-red-600 transition-colors">
                                <i class="fas fa-sign-out-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div class="flex">
                <!-- Sidebar -->
                <aside class="w-64 bg-white shadow-sm min-h-screen">
                    <nav class="p-6">
                        <ul class="space-y-2">
                            <li>
                                <button onclick="showPage('dashboard')" 
                                        class="nav-item w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${AdminApp.currentPage === 'dashboard' ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}">
                                    <i class="fas fa-chart-line mr-3"></i>Dashboard
                                </button>
                            </li>
                            <li>
                                <button onclick="showPage('movies')" 
                                        class="nav-item w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${AdminApp.currentPage === 'movies' ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}">
                                    <i class="fas fa-film mr-3"></i>Movies
                                </button>
                            </li>
                            <li>
                                <button onclick="showPage('blogs')" 
                                        class="nav-item w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${AdminApp.currentPage === 'blogs' ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}">
                                    <i class="fas fa-blog mr-3"></i>Blogs
                                </button>
                            </li>
                            <li>
                                <button onclick="showPage('analytics')" 
                                        class="nav-item w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${AdminApp.currentPage === 'analytics' ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}">
                                    <i class="fas fa-chart-bar mr-3"></i>Analytics
                                </button>
                            </li>
                            ${AdminApp.currentUser.role === 'superadmin' ? `
                            <li>
                                <button onclick="showPage('users')" 
                                        class="nav-item w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${AdminApp.currentPage === 'users' ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}">
                                    <i class="fas fa-users mr-3"></i>Users
                                </button>
                            </li>
                            <li>
                                <button onclick="showPage('cron')" 
                                        class="nav-item w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${AdminApp.currentPage === 'cron' ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}">
                                    <i class="fas fa-cogs mr-3"></i>Cron Jobs
                                </button>
                            </li>
                            ` : ''}
                        </ul>
                    </nav>
                </aside>

                <!-- Main Content -->
                <main class="flex-1 p-6">
                    <div id="pageContent"></div>
                </main>
            </div>
        </div>
    `;

    showPage('dashboard');
}

async function showPage(pageName) {
    AdminApp.currentPage = pageName;
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('bg-blue-100', 'text-blue-600');
        item.classList.add('text-gray-700');
    });
    
    const activeItem = document.querySelector(`[onclick="showPage('${pageName}')"]`);
    if (activeItem) {
        activeItem.classList.add('bg-blue-100', 'text-blue-600');
        activeItem.classList.remove('text-gray-700');
    }

    // Load page content
    const contentDiv = document.getElementById('pageContent');
    
    switch (pageName) {
        case 'dashboard':
            contentDiv.innerHTML = await renderDashboard();
            break;
        case 'movies':
            contentDiv.innerHTML = await renderMoviesPage();
            await loadMovies();
            break;
        case 'blogs':
            contentDiv.innerHTML = renderBlogsPage();
            break;
        case 'analytics':
            contentDiv.innerHTML = renderAnalyticsPage();
            break;
        case 'users':
            if (AdminApp.currentUser.role === 'superadmin') {
                contentDiv.innerHTML = await renderUsersPage();
                await loadUsers();
            }
            break;
        case 'cron':
            if (AdminApp.currentUser.role === 'superadmin') {
                contentDiv.innerHTML = renderCronPage();
            }
            break;
    }
}

async function loadDashboard() {
    try {
        const response = await axios.get('/api/admin/stats');
        if (response.data.success) {
            AdminApp.stats = response.data.stats;
        }
    } catch (error) {
        console.error('Dashboard load error:', error);
    }
}

function renderDashboard() {
    return `
        <div>
            <h2 class="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h2>
            
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg p-6 shadow-sm border">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-blue-100">
                            <i class="fas fa-film text-2xl text-blue-600"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Total Movies</p>
                            <p class="text-3xl font-bold text-gray-900">${AdminApp.stats.total_movies || 0}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg p-6 shadow-sm border">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-green-100">
                            <i class="fas fa-eye text-2xl text-green-600"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Total Views</p>
                            <p class="text-3xl font-bold text-gray-900">${AdminApp.stats.total_views || 0}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg p-6 shadow-sm border">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-yellow-100">
                            <i class="fas fa-download text-2xl text-yellow-600"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Total Downloads</p>
                            <p class="text-3xl font-bold text-gray-900">${AdminApp.stats.total_downloads || 0}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg p-6 shadow-sm border">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-red-100">
                            <i class="fas fa-check-circle text-2xl text-red-600"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Active Movies</p>
                            <p class="text-3xl font-bold text-gray-900">${AdminApp.stats.active_movies || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Movies -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">Recent Movies</h3>
                <div class="space-y-4">
                    ${AdminApp.stats.recent_movies ? AdminApp.stats.recent_movies.map(movie => `
                        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div class="flex items-center space-x-4">
                                <img src="${movie.thumbnail_url || '/static/default-movie.jpg'}" 
                                     alt="${movie.title}" 
                                     class="w-16 h-16 object-cover rounded-lg">
                                <div>
                                    <h4 class="font-medium text-gray-900">${movie.title}</h4>
                                    <p class="text-sm text-gray-600">${movie.year || 'N/A'} • ${movie.view_count || 0} views</p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-2">
                                <button onclick="editMovie(${movie.id})" class="text-blue-600 hover:text-blue-700">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="generateBlog(${movie.id})" class="text-green-600 hover:text-green-700">
                                    <i class="fas fa-robot"></i>
                                </button>
                            </div>
                        </div>
                    `).join('') : '<p class="text-gray-500">No movies found</p>'}
                </div>
            </div>
        </div>
    `;
}

async function renderMoviesPage() {
    return `
        <div>
            <div class="flex items-center justify-between mb-8">
                <h2 class="text-3xl font-bold text-gray-900">Movies Management</h2>
                <button onclick="showAddMovieModal()" 
                        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <i class="fas fa-plus mr-2"></i>Add New Movie
                </button>
            </div>
            
            <!-- Movies List -->
            <div class="bg-white rounded-lg shadow-sm border">
                <div class="p-6">
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="border-b">
                                    <th class="text-left py-3 px-4 font-semibold text-gray-900">Movie</th>
                                    <th class="text-left py-3 px-4 font-semibold text-gray-900">Year</th>
                                    <th class="text-left py-3 px-4 font-semibold text-gray-900">Views</th>
                                    <th class="text-left py-3 px-4 font-semibold text-gray-900">Downloads</th>
                                    <th class="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                                    <th class="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="moviesTableBody">
                                <tr>
                                    <td colspan="6" class="text-center py-8 text-gray-500">
                                        <div class="loading-spinner mx-auto mb-2"></div>
                                        Loading movies...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function loadMovies() {
    try {
        const response = await axios.get('/api/admin/movies');
        if (response.data.success) {
            AdminApp.movies = response.data.movies;
            renderMoviesTable();
        }
    } catch (error) {
        console.error('Load movies error:', error);
        showToast('Failed to load movies', 'error');
    }
}

function renderMoviesTable() {
    const tbody = document.getElementById('moviesTableBody');
    if (!tbody) return;

    tbody.innerHTML = AdminApp.movies.map(movie => `
        <tr class="border-b hover:bg-gray-50">
            <td class="py-4 px-4">
                <div class="flex items-center space-x-3">
                    <img src="${movie.thumbnail_url || '/static/default-movie.jpg'}" 
                         alt="${movie.title}" 
                         class="w-12 h-12 object-cover rounded-lg">
                    <div>
                        <p class="font-medium text-gray-900">${movie.title}</p>
                        <p class="text-sm text-gray-500">${movie.duration_minutes || 90} min</p>
                    </div>
                </div>
            </td>
            <td class="py-4 px-4 text-gray-900">${movie.year || 'N/A'}</td>
            <td class="py-4 px-4 text-gray-900">${movie.view_count || 0}</td>
            <td class="py-4 px-4 text-gray-900">${movie.download_count || 0}</td>
            <td class="py-4 px-4">
                <span class="px-2 py-1 text-xs rounded-full ${movie.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    ${movie.is_active ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td class="py-4 px-4">
                <div class="flex items-center space-x-2">
                    <button onclick="editMovie(${movie.id})" 
                            class="text-blue-600 hover:text-blue-700 p-2" 
                            title="Edit Movie">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="generateBlog(${movie.id})" 
                            class="text-green-600 hover:text-green-700 p-2" 
                            title="Generate Blog">
                        <i class="fas fa-robot"></i>
                    </button>
                    <button onclick="validateTelegramFile(${movie.id})" 
                            class="text-purple-600 hover:text-purple-700 p-2" 
                            title="Validate File">
                        <i class="fas fa-check-circle"></i>
                    </button>
                    <button onclick="toggleMovieStatus(${movie.id})" 
                            class="text-yellow-600 hover:text-yellow-700 p-2" 
                            title="Toggle Status">
                        <i class="fas fa-toggle-${movie.is_active ? 'on' : 'off'}"></i>
                    </button>
                    <button onclick="deleteMovie(${movie.id})" 
                            class="text-red-600 hover:text-red-700 p-2" 
                            title="Delete Movie">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderBlogsPage() {
    return `
        <div>
            <h2 class="text-3xl font-bold text-gray-900 mb-8">Blog Management</h2>
            <div class="bg-white rounded-lg shadow-sm border p-6">
                <p class="text-gray-600">Blog management features coming soon...</p>
            </div>
        </div>
    `;
}

function renderAnalyticsPage() {
    return `
        <div>
            <h2 class="text-3xl font-bold text-gray-900 mb-8">Analytics</h2>
            <div class="bg-white rounded-lg shadow-sm border p-6">
                <canvas id="analyticsChart" width="400" height="200"></canvas>
            </div>
        </div>
    `;
}

async function renderUsersPage() {
    return `
        <div>
            <div class="flex items-center justify-between mb-8">
                <h2 class="text-3xl font-bold text-gray-900">User Management</h2>
                <button onclick="showAddUserModal()" 
                        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <i class="fas fa-user-plus mr-2"></i>Add Admin User
                </button>
            </div>
            
            <div class="bg-white rounded-lg shadow-sm border">
                <div class="p-6">
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="border-b">
                                    <th class="text-left py-3 px-4 font-semibold text-gray-900">Username</th>
                                    <th class="text-left py-3 px-4 font-semibold text-gray-900">Role</th>
                                    <th class="text-left py-3 px-4 font-semibold text-gray-900">Created</th>
                                    <th class="text-left py-3 px-4 font-semibold text-gray-900">Last Login</th>
                                    <th class="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                                    <th class="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="usersTableBody">
                                <tr>
                                    <td colspan="6" class="text-center py-8 text-gray-500">
                                        <div class="loading-spinner mx-auto mb-2"></div>
                                        Loading users...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderCronPage() {
    return `
        <div>
            <h2 class="text-3xl font-bold text-gray-900 mb-8">Cron Jobs</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white rounded-lg shadow-sm border p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Generate Blogs</h3>
                    <p class="text-gray-600 mb-4">Generate AI blogs for movies without blogs</p>
                    <button onclick="runCronJob('generate_blogs')" 
                            class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-robot mr-2"></i>Run Now
                    </button>
                </div>
                
                <div class="bg-white rounded-lg shadow-sm border p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Cleanup Sessions</h3>
                    <p class="text-gray-600 mb-4">Remove expired user sessions</p>
                    <button onclick="runCronJob('cleanup_sessions')" 
                            class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        <i class="fas fa-broom mr-2"></i>Run Now
                    </button>
                </div>
                
                <div class="bg-white rounded-lg shadow-sm border p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Cleanup Cache</h3>
                    <p class="text-gray-600 mb-4">Remove expired cache entries</p>
                    <button onclick="runCronJob('cleanup_cache')" 
                            class="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                        <i class="fas fa-trash mr-2"></i>Run Now
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Modal functions would continue here...
async function generateBlog(movieId) {
    try {
        showToast('Generating blog...', 'info');
        const response = await axios.post(`/api/admin/movies/${movieId}/generate-blog`);
        
        if (response.data.success) {
            showToast('Blog generated successfully!', 'success');
        } else {
            showToast(response.data.message || 'Failed to generate blog', 'error');
        }
    } catch (error) {
        console.error('Generate blog error:', error);
        showToast('Failed to generate blog', 'error');
    }
}

async function runCronJob(jobName) {
    try {
        showToast(`Running ${jobName}...`, 'info');
        const response = await axios.post(`/api/admin/cron/${jobName}`);
        
        if (response.data.success) {
            showToast(response.data.message, 'success');
        } else {
            showToast(response.data.message || 'Cron job failed', 'error');
        }
    } catch (error) {
        console.error('Cron job error:', error);
        showToast('Cron job failed', 'error');
    }
}

function logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/awd';
}

// Utility functions
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${
        type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
        type === 'warning' ? 'bg-yellow-500' :
        'bg-blue-500'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, duration);
}