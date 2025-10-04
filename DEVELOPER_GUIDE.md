# 🔧 **Developer Guide - Doraemon Movie Streaming Website**

## 📋 **Project Overview**

This is a complete movie streaming website built with modern web technologies, featuring:
- **53+ Doraemon Movies** from 1980-2026
- **AI-Generated Blog Content** using OpenRouter API
- **Direct Video Streaming** via Telegram Bot API (no Telegram UI visible to users)
- **Ad-Unlock System** with Google AdSense integration
- **Admin Dashboard** for complete site management
- **Mobile-Responsive Design** using TailwindCSS

---

## 🏗️ **Technical Architecture**

### **Frontend Stack**
- **HTML5 + TailwindCSS** for responsive UI
- **Vanilla JavaScript** for interactivity
- **CDN Libraries** (FontAwesome, Chart.js, Axios)
- **No framework dependencies** for fast loading

### **Backend Stack**
- **Hono Framework** - Lightweight, fast web framework
- **TypeScript** - Type safety and modern JavaScript features
- **Cloudflare Workers** - Serverless edge runtime
- **Cloudflare D1** - SQLite database with global distribution

### **APIs & Services**
- **Telegram Bot API** - Video file streaming and downloads
- **OpenRouter API** - AI blog generation (GPT-3.5/4)
- **Google AdSense** - Monetization and ad serving
- **Google Analytics** - User behavior tracking

---

## 📂 **Project Structure**

```
doraemon-stream-website/
├── src/
│   ├── index.tsx              # Main Hono application entry point
│   ├── routes/
│   │   ├── movies.ts          # Movie pages and API routes
│   │   ├── admin.ts           # Admin panel routes
│   │   ├── auth.ts            # Authentication routes
│   │   └── streaming.ts       # Video streaming routes
│   ├── utils/
│   │   ├── database.ts        # D1 database service
│   │   ├── telegram.ts        # Telegram Bot API service
│   │   ├── openrouter.ts      # AI blog generation service
│   │   └── auth.ts            # Authentication utilities
│   └── types.ts               # TypeScript type definitions
├── public/
│   └── static/
│       ├── app.js             # Frontend JavaScript
│       ├── admin.js           # Admin panel JavaScript
│       └── styles.css         # Custom CSS styles
├── migrations/
│   └── 0001_initial_schema.sql # Database schema
├── .dev.vars                  # Environment variables (local)
├── wrangler.jsonc             # Cloudflare configuration
├── package.json               # Dependencies and scripts
└── ecosystem.config.cjs       # PM2 configuration
```

---

## 🚀 **Development Setup**

### **1. Prerequisites**
```bash
# Node.js (v18+)
node --version

# NPM or Yarn
npm --version

# Wrangler CLI (Cloudflare)
npm install -g wrangler
```

### **2. Environment Configuration**
```bash
# Copy environment template
cp .dev.vars.example .dev.vars

# Fill in your API keys:
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
ADSENSE_CLIENT_ID=ca-pub-your-adsense-id
GOOGLE_ANALYTICS_ID=G-YOUR-GA-ID
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
```

### **3. Database Setup**
```bash
# Apply migrations
npm run db:migrate:local

# Seed with all 53 movies
npm run db:seed

# Verify data
npm run db:console:local
# SQL: SELECT COUNT(*) FROM movies;
# Should show 53 movies
```

### **4. Local Development**
```bash
# Build project
npm run build

# Start development server
pm2 start ecosystem.config.cjs

# Check logs
pm2 logs doraemon-stream --nostream
```

---

## 🎯 **Core Features Implementation**

### **Movie Streaming System**

#### **Video Storage & Retrieval**
```typescript
// Telegram service handles video file streaming
const telegram = new TelegramService(env.TELEGRAM_BOT_TOKEN);
const streamUrl = telegram.generateProxyStreamUrl(fileId, baseUrl);
```

#### **Ad-Unlock Mechanism**
```javascript
// User must watch 2 ads before unlocking movie
const adSession = await checkAdRequirement(movieId);
if (!adSession.canWatch) {
  showAdModal(movieId, adSession.adsNeeded);
}
```

#### **Direct Download System**
```typescript
// Generate secure download links
const downloadUrl = telegram.generateProxyDownloadUrl(
  fileId, 
  baseUrl, 
  `${movie.title}.mp4`
);
```

### **AI Blog Generation**

#### **OpenRouter Integration**
```typescript
const openRouter = new OpenRouterService(env.OPENROUTER_API_KEY);
const blog = await openRouter.generateBlogPost(movie);
// Returns: { title, content, summary, keywords }
```

#### **Blog Templates**
- **Plot Analysis** - Story overview without spoilers
- **Character Development** - Main character analysis
- **Animation Quality** - Visual and technical review
- **Themes & Messages** - Educational and emotional content
- **Where to Watch** - Platform availability information

### **Admin Dashboard Features**

#### **Movie Management**
- ➕ Add new movies with Telegram file IDs
- ✏️ Edit movie metadata and descriptions
- 🗑️ Soft delete (hide from public)
- 📊 View statistics and analytics

#### **Blog Management**
- 🤖 Generate AI blogs for all movies
- ✏️ Edit existing blog content
- 📝 Bulk blog generation
- 🔄 Regenerate specific blogs

#### **User Management**
- 👥 Add/remove admin users
- 🔐 Role-based access control
- 📊 User activity monitoring
- 🚫 Deactivate user accounts

#### **Analytics Dashboard**
- 📈 View/download statistics
- 🎬 Popular movies tracking
- 👀 Blog engagement metrics
- 💰 Ad interaction analytics

---

## 🛠️ **API Reference**

### **Public APIs**

#### **Movies API**
```typescript
GET /api/movies              # List all active movies
GET /api/movies/:id          # Get single movie details
GET /api/movies/:id/blog     # Get movie blog content
```

#### **Streaming API**
```typescript
GET /api/stream/:fileId      # Stream video with range support
GET /api/download/:fileId    # Direct download after ad unlock
POST /api/ad/watched         # Track ad completion
```

### **Admin APIs**

#### **Authentication**
```typescript
POST /api/admin/login        # Admin login
POST /api/admin/verify       # Verify JWT token
GET /awd                     # Admin login page
GET /admin/dashboard         # Admin panel (requires auth)
```

#### **Movie Management**
```typescript
GET /api/admin/movies        # List all movies (including inactive)
POST /api/admin/movies       # Create new movie
PUT /api/admin/movies/:id    # Update movie
DELETE /api/admin/movies/:id # Soft delete movie
```

#### **Blog Management**
```typescript
POST /api/admin/movies/:id/generate-blog  # Generate AI blog
POST /api/admin/validate-telegram         # Validate Telegram file
POST /api/admin/cron/:job                 # Run cron jobs manually
```

#### **User Management**
```typescript
GET /api/admin/users         # List admin users (superadmin only)
POST /api/admin/users        # Create admin user (superadmin only)
DELETE /api/admin/users/:username # Delete admin user (superadmin only)
```

---

## 🔐 **Security Implementation**

### **Authentication & Authorization**
```typescript
// JWT-based admin authentication
const token = await generateToken(user, jwtSecret);

// Role-based access control
if (!isSuperAdmin(currentUser)) {
  return c.json({ error: 'Superadmin access required' }, 403);
}
```

### **Rate Limiting**
```typescript
// API rate limiting (100 requests per hour)
const rateLimit = await checkRateLimit(
  c.env.KV, 
  clientIP, 
  100, // requests
  3600000 // 1 hour window
);
```

### **Input Validation**
```typescript
// Telegram file ID validation
const isValid = telegram.isValidFileId(fileId);

// SQL injection prevention (using D1 prepared statements)
const movie = await db.prepare(
  'SELECT * FROM movies WHERE id = ?'
).bind(movieId).first();
```

### **CORS & Headers**
```typescript
// Secure CORS configuration
app.use('/api/*', cors({
  origin: ['https://your-domain.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 📊 **Database Schema**

### **Movies Table**
```sql
CREATE TABLE movies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  year INTEGER,
  description TEXT,
  characters TEXT,           -- JSON string
  telegram_file_id TEXT,     -- For streaming
  telegram_url TEXT,         -- Backup URL
  ott_availability TEXT,     -- JSON string
  genre TEXT DEFAULT 'Animation',
  duration_minutes INTEGER,
  rating REAL DEFAULT 0.0,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  release_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### **Blog Posts Table**
```sql
CREATE TABLE movie_blogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  movie_id INTEGER NOT NULL REFERENCES movies(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,     -- HTML content
  summary TEXT,              -- Meta description
  keywords TEXT,             -- SEO keywords
  view_count INTEGER DEFAULT 0,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  openrouter_model TEXT DEFAULT 'gpt-3.5-turbo'
);
```

### **Admin Users Table**
```sql
CREATE TABLE admin_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  is_active INTEGER DEFAULT 1
);
```

---

## 🚀 **Deployment Process**

### **Local Testing**
```bash
# Build and test locally
npm run build
pm2 start ecosystem.config.cjs
curl http://localhost:3000

# Check all pages work
curl http://localhost:3000/movies
curl http://localhost:3000/blog  
curl http://localhost:3000/awd
```

### **Cloudflare Pages Deployment**
```bash
# Set production environment variables
npx wrangler pages secret put TELEGRAM_BOT_TOKEN --project-name doraemon-stream-2
npx wrangler pages secret put OPENROUTER_API_KEY --project-name doraemon-stream-2
npx wrangler pages secret put ADSENSE_CLIENT_ID --project-name doraemon-stream-2

# Deploy to production
npm run deploy:prod

# Apply database migrations to production
npm run db:migrate:prod
npx wrangler d1 execute doraemon-stream-2-production --remote --file=./complete_doraemon_movies_seed.sql
```

### **Domain Configuration**
```bash
# Add custom domain (optional)
npx wrangler pages domain add yourdomain.com --project-name doraemon-stream-2
```

---

## 🔧 **Troubleshooting**

### **Common Issues**

#### **Database Connection Errors**
```bash
# Check database exists
npx wrangler d1 list

# Verify migrations applied
npx wrangler d1 migrations list doraemon-stream-2-production --local

# Reset local database
npm run db:reset
```

#### **API Authentication Errors**
```bash
# Check environment variables
echo $TELEGRAM_BOT_TOKEN
echo $OPENROUTER_API_KEY

# Verify API keys work
curl -H "Authorization: Bearer $TELEGRAM_BOT_TOKEN" \
  https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe
```

#### **Build Errors**
```bash
# Clear build cache
rm -rf dist/ .wrangler/
npm run build

# Check TypeScript errors
npx tsc --noEmit
```

#### **Streaming Issues**
```bash
# Test Telegram file access
curl -I "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getFile?file_id=YOUR_FILE_ID"

# Check CORS headers
curl -H "Origin: https://your-domain.com" -I http://localhost:3000/api/stream/test
```

---

## 📈 **Performance Optimization**

### **Frontend Optimization**
- ✅ **CDN Libraries** - Faster loading than bundled assets
- ✅ **Lazy Loading** - Images and components load on demand
- ✅ **Minified Assets** - Reduced file sizes
- ✅ **Caching Headers** - Browser and CDN caching

### **Backend Optimization**
- ✅ **Edge Computing** - Cloudflare Workers global distribution
- ✅ **Database Indexing** - Optimized queries
- ✅ **Connection Pooling** - D1 handles connections automatically
- ✅ **Response Caching** - API response caching

### **Streaming Optimization**
- ✅ **Range Requests** - Partial content loading
- ✅ **Direct Proxy** - No intermediate storage
- ✅ **Adaptive Bitrate** - Quality based on connection
- ✅ **CDN Delivery** - Global content distribution

---

## 🧪 **Testing**

### **Unit Tests**
```bash
# Test database operations
npm run test:db

# Test API endpoints
npm run test:api

# Test authentication
npm run test:auth
```

### **Integration Tests**
```bash
# Test movie streaming
curl -H "Range: bytes=0-1023" http://localhost:3000/api/stream/test_file_id

# Test admin functions
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"admin123"}'

# Test blog generation
curl -X POST http://localhost:3000/api/admin/movies/1/generate-blog \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Load Testing**
```bash
# Install apache bench
sudo apt install apache2-utils

# Test concurrent users
ab -n 1000 -c 10 http://localhost:3000/
ab -n 100 -c 5 http://localhost:3000/movies
```

---

## 📚 **Additional Resources**

### **Documentation Links**
- [Hono Framework](https://hono.dev/) - Web framework documentation
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) - Runtime documentation
- [Cloudflare D1](https://developers.cloudflare.com/d1/) - Database documentation
- [Telegram Bot API](https://core.telegram.org/bots/api) - Bot API reference
- [OpenRouter API](https://openrouter.ai/docs) - AI API documentation

### **Code Examples**
- See `/examples/` directory for additional code samples
- Check `/tests/` for comprehensive test examples
- Review `/docs/` for detailed API documentation

---

## 🤝 **Contributing**

### **Development Workflow**
1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Make changes and test thoroughly
4. Commit: `git commit -m "Add new feature"`
5. Push: `git push origin feature/new-feature`
6. Create Pull Request

### **Code Standards**
- Use TypeScript for type safety
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Use semantic commit messages

---

This developer guide provides everything needed to understand, modify, and extend the Doraemon movie streaming website. For specific implementation details, refer to the source code and inline comments.