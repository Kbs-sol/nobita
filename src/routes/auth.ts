// Authentication routes for admin panel
import { Hono } from 'hono';
import type { HonoEnv, LoginRequest, LoginResponse } from '../types';
import { DatabaseService } from '../utils/database';
import { hashPassword, verifyPassword, generateToken, verifyToken } from '../utils/auth';

const auth = new Hono<HonoEnv>();

// Admin login
auth.post('/api/admin/login', async (c) => {
  try {
    const body = await c.req.json() as LoginRequest;
    const { username, password } = body;

    if (!username || !password) {
      return c.json({ success: false, message: 'Username and password required' }, 400);
    }

    const db = new DatabaseService(c.env.DB);
    const user = await db.getAdminByUsername(username);

    if (!user || !user.is_active) {
      return c.json({ success: false, message: 'Invalid credentials' }, 401);
    }

    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return c.json({ success: false, message: 'Invalid credentials' }, 401);
    }

    // Update last login
    await db.updateAdminLastLogin(user.id);

    // Generate JWT token
    const token = await generateToken(user, c.env.JWT_SECRET);

    const response: LoginResponse = {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    };

    return c.json(response);

  } catch (error) {
    console.error('Login error:', error);
    return c.json({ success: false, message: 'Login failed' }, 500);
  }
});

// Verify token
auth.post('/api/admin/verify', async (c) => {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return c.json({ success: false, message: 'Token required' }, 401);
    }

    const payload = await verifyToken(token, c.env.JWT_SECRET);
    
    if (!payload) {
      return c.json({ success: false, message: 'Invalid token' }, 401);
    }

    const db = new DatabaseService(c.env.DB);
    const user = await db.getAdminByUsername(payload.username);

    if (!user || !user.is_active) {
      return c.json({ success: false, message: 'User not found' }, 401);
    }

    return c.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return c.json({ success: false, message: 'Verification failed' }, 500);
  }
});

// Create admin (superadmin only)
auth.post('/api/admin/create', async (c) => {
  try {
    const currentUser = c.get('user');
    
    if (!currentUser || currentUser.role !== 'superadmin') {
      return c.json({ success: false, message: 'Superadmin access required' }, 403);
    }

    const body = await c.req.json();
    const { username, password, role } = body;

    if (!username || !password || !role) {
      return c.json({ success: false, message: 'Username, password, and role required' }, 400);
    }

    if (role !== 'admin' && role !== 'superadmin') {
      return c.json({ success: false, message: 'Invalid role' }, 400);
    }

    const db = new DatabaseService(c.env.DB);
    
    // Check if username already exists
    const existingUser = await db.getAdminByUsername(username);
    if (existingUser) {
      return c.json({ success: false, message: 'Username already exists' }, 409);
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const newUser = await db.createAdmin({
      username,
      password_hash: passwordHash,
      role,
      created_by: currentUser.id,
      is_active: 1
    });

    return c.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        created_at: newUser.created_at
      }
    });

  } catch (error) {
    console.error('Create admin error:', error);
    return c.json({ success: false, message: 'Failed to create admin' }, 500);
  }
});

// List all admins (superadmin only)
auth.get('/api/admin/users', async (c) => {
  try {
    const currentUser = c.get('user');
    
    if (!currentUser || currentUser.role !== 'superadmin') {
      return c.json({ success: false, message: 'Superadmin access required' }, 403);
    }

    const db = new DatabaseService(c.env.DB);
    const admins = await db.getAllAdmins();

    // Remove password hashes from response
    const safeAdmins = admins.map(admin => ({
      id: admin.id,
      username: admin.username,
      role: admin.role,
      created_at: admin.created_at,
      last_login: admin.last_login,
      is_active: admin.is_active
    }));

    return c.json({
      success: true,
      admins: safeAdmins
    });

  } catch (error) {
    console.error('List admins error:', error);
    return c.json({ success: false, message: 'Failed to fetch admins' }, 500);
  }
});

// Admin panel login page
auth.get('/awd', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Panel - ${c.env.SITE_NAME}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-gray-900 to-blue-900 min-h-screen flex items-center justify-center">
        <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
            <div class="text-center mb-8">
                <i class="fas fa-shield-alt text-4xl text-blue-500 mb-4"></i>
                <h1 class="text-2xl font-bold text-gray-800">Admin Panel</h1>
                <p class="text-gray-600">Doraemon Stream Management</p>
            </div>
            
            <form id="loginForm" class="space-y-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <input type="text" id="username" required 
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input type="password" id="password" required
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                
                <button type="submit" 
                        class="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium">
                    <i class="fas fa-sign-in-alt mr-2"></i>
                    Login
                </button>
            </form>
            
            <div id="errorMessage" class="mt-4 p-3 bg-red-100 text-red-700 rounded-lg hidden"></div>
            
            <div class="mt-8 text-center text-sm text-gray-500">
                <p>Protected Area - Authorized Personnel Only</p>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            document.getElementById('loginForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                const errorDiv = document.getElementById('errorMessage');
                
                try {
                    const response = await axios.post('/api/admin/login', {
                        username: username,
                        password: password
                    });
                    
                    if (response.data.success) {
                        localStorage.setItem('admin_token', response.data.token);
                        localStorage.setItem('admin_user', JSON.stringify(response.data.user));
                        window.location.href = '/admin/dashboard';
                    } else {
                        errorDiv.textContent = response.data.message;
                        errorDiv.classList.remove('hidden');
                    }
                } catch (error) {
                    errorDiv.textContent = error.response?.data?.message || 'Login failed';
                    errorDiv.classList.remove('hidden');
                }
            });
        </script>
    </body>
    </html>
  `);
});

export default auth;