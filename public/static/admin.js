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

// Modal and interaction functions
function showAddMovieModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div class="p-6 border-b">
                <div class="flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-gray-900">Add New Movie</h3>
                    <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <form id="addMovieForm" class="p-6 space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                        <input type="text" name="title" required class="w-full border border-gray-300 rounded-lg px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Year</label>
                        <input type="number" name="year" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea name="description" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2"></textarea>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                        <input type="text" name="genre" placeholder="Adventure, Comedy" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                        <input type="number" name="duration_minutes" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Rating (1-10)</label>
                        <input type="number" name="rating" min="1" max="10" step="0.1" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Thumbnail URL</label>
                        <input type="url" name="thumbnail_url" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Telegram File ID</label>
                    <input type="text" name="telegram_file_id" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                </div>
                
                <div class="flex items-center space-x-4 pt-4">
                    <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-plus mr-2"></i>Add Movie
                    </button>
                    <button type="button" onclick="closeModal()" class="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('addMovieForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const movieData = Object.fromEntries(formData);
        
        try {
            showToast('Adding movie...', 'info');
            const response = await axios.post('/api/admin/movies', movieData);
            
            if (response.data.success) {
                showToast('Movie added successfully!', 'success');
                closeModal();
                await loadMovies();
                renderMoviesTable();
            } else {
                showToast(response.data.message || 'Failed to add movie', 'error');
            }
        } catch (error) {
            console.error('Add movie error:', error);
            showToast('Failed to add movie', 'error');
        }
    });
}

function showAddUserModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-md w-full">
            <div class="p-6 border-b">
                <div class="flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-gray-900">Add Admin User</h3>
                    <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <form id="addUserForm" class="p-6 space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                    <input type="text" name="username" required class="w-full border border-gray-300 rounded-lg px-3 py-2">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                    <input type="password" name="password" required class="w-full border border-gray-300 rounded-lg px-3 py-2">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select name="role" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                        <option value="admin">Admin</option>
                        ${AdminApp.currentUser.role === 'superadmin' ? '<option value="superadmin">Superadmin</option>' : ''}
                    </select>
                </div>
                
                <div class="flex items-center space-x-4 pt-4">
                    <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-user-plus mr-2"></i>Add User
                    </button>
                    <button type="button" onclick="closeModal()" class="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('addUserForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const userData = Object.fromEntries(formData);
        
        try {
            showToast('Adding user...', 'info');
            const response = await axios.post('/api/admin/users', userData);
            
            if (response.data.success) {
                showToast('User added successfully!', 'success');
                closeModal();
                await loadUsers();
            } else {
                showToast(response.data.message || 'Failed to add user', 'error');
            }
        } catch (error) {
            console.error('Add user error:', error);
            showToast('Failed to add user', 'error');
        }
    });
}

function closeModal() {
    const modals = document.querySelectorAll('.fixed.inset-0.bg-black');
    modals.forEach(modal => modal.remove());
}

async function editMovie(movieId) {
    try {
        // Find the movie in our cached data
        const movie = AdminApp.movies.find(m => m.id === movieId);
        if (!movie) {
            showToast('Movie not found', 'error');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
                <div class="p-6 border-b">
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-semibold text-gray-900">Edit Movie: ${movie.title}</h3>
                        <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <form id="editMovieForm" class="p-6 space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                            <input type="text" name="title" value="${movie.title}" required class="w-full border border-gray-300 rounded-lg px-3 py-2">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Year</label>
                            <input type="number" name="year" value="${movie.year || ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea name="description" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2">${movie.description || ''}</textarea>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                            <input type="text" name="genre" value="${movie.genre || ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                            <input type="number" name="duration_minutes" value="${movie.duration_minutes || ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Rating (1-10)</label>
                            <input type="number" name="rating" value="${movie.rating || ''}" min="1" max="10" step="0.1" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Thumbnail URL</label>
                            <input type="url" name="thumbnail_url" value="${movie.thumbnail_url || ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Telegram File ID</label>
                        <input type="text" name="telegram_file_id" value="${movie.telegram_file_id || ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                    </div>
                    
                    <div>
                        <label class="flex items-center">
                            <input type="checkbox" name="is_active" ${movie.is_active ? 'checked' : ''} class="mr-2">
                            <span class="text-sm font-medium text-gray-700">Active</span>
                        </label>
                    </div>
                    
                    <div class="flex items-center space-x-4 pt-4">
                        <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            <i class="fas fa-save mr-2"></i>Update Movie
                        </button>
                        <button type="button" onclick="closeModal()" class="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        document.getElementById('editMovieForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const movieData = Object.fromEntries(formData);
            movieData.is_active = formData.has('is_active') ? 1 : 0;
            
            try {
                showToast('Updating movie...', 'info');
                const response = await axios.put(`/api/admin/movies/${movieId}`, movieData);
                
                if (response.data.success) {
                    showToast('Movie updated successfully!', 'success');
                    closeModal();
                    await loadMovies();
                    renderMoviesTable();
                } else {
                    showToast(response.data.message || 'Failed to update movie', 'error');
                }
            } catch (error) {
                console.error('Update movie error:', error);
                showToast('Failed to update movie', 'error');
            }
        });
    } catch (error) {
        console.error('Edit movie error:', error);
        showToast('Failed to open edit form', 'error');
    }
}

async function deleteMovie(movieId) {
    if (confirm('Are you sure you want to delete this movie? This action cannot be undone.')) {
        try {
            showToast('Deleting movie...', 'info');
            const response = await axios.delete(`/api/admin/movies/${movieId}`);
            
            if (response.data.success) {
                showToast('Movie deleted successfully!', 'success');
                await loadMovies();
                renderMoviesTable();
            } else {
                showToast(response.data.message || 'Failed to delete movie', 'error');
            }
        } catch (error) {
            console.error('Delete movie error:', error);
            showToast('Failed to delete movie', 'error');
        }
    }
}

async function toggleMovieStatus(movieId) {
    try {
        const movie = AdminApp.movies.find(m => m.id === movieId);
        if (!movie) return;

        const newStatus = movie.is_active ? 0 : 1;
        showToast(`${newStatus ? 'Activating' : 'Deactivating'} movie...`, 'info');
        
        const response = await axios.put(`/api/admin/movies/${movieId}`, { is_active: newStatus });
        
        if (response.data.success) {
            showToast(`Movie ${newStatus ? 'activated' : 'deactivated'} successfully!`, 'success');
            await loadMovies();
            renderMoviesTable();
        } else {
            showToast(response.data.message || 'Failed to update movie status', 'error');
        }
    } catch (error) {
        console.error('Toggle movie status error:', error);
        showToast('Failed to update movie status', 'error');
    }
}

async function validateTelegramFile(movieId) {
    try {
        const movie = AdminApp.movies.find(m => m.id === movieId);
        if (!movie || !movie.telegram_file_id) {
            showToast('No Telegram file ID found for this movie', 'warning');
            return;
        }

        showToast('Validating Telegram file...', 'info');
        const response = await axios.post('/api/admin/validate-telegram', {
            file_id: movie.telegram_file_id
        });
        
        if (response.data.success && response.data.valid) {
            showToast('Telegram file is valid!', 'success');
        } else {
            showToast(`Telegram file validation failed: ${response.data.error}`, 'error');
        }
    } catch (error) {
        console.error('Validate Telegram file error:', error);
        showToast('Failed to validate Telegram file', 'error');
    }
}

async function generateBlog(movieId) {
    try {
        showToast('Generating AI blog...', 'info');
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

async function loadUsers() {
    try {
        const response = await axios.get('/api/admin/users');
        if (response.data.success) {
            AdminApp.users = response.data.users;
            renderUsersTable();
        }
    } catch (error) {
        console.error('Load users error:', error);
        showToast('Failed to load users', 'error');
    }
}

function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody || !AdminApp.users) return;

    tbody.innerHTML = AdminApp.users.map(user => `
        <tr class="border-b hover:bg-gray-50">
            <td class="py-4 px-4 font-medium text-gray-900">${user.username}</td>
            <td class="py-4 px-4">
                <span class="px-2 py-1 text-xs rounded-full ${user.role === 'superadmin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}">
                    ${user.role}
                </span>
            </td>
            <td class="py-4 px-4 text-gray-500">${new Date(user.created_at).toLocaleDateString()}</td>
            <td class="py-4 px-4 text-gray-500">${user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</td>
            <td class="py-4 px-4">
                <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
            </td>
            <td class="py-4 px-4">
                <div class="flex items-center space-x-2">
                    ${AdminApp.currentUser.role === 'superadmin' && user.username !== 'superadmin' ? `
                    <button onclick="deleteUser('${user.username}')" 
                            class="text-red-600 hover:text-red-700 p-2" 
                            title="Delete User">
                        <i class="fas fa-trash"></i>
                    </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
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