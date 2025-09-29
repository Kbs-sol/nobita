# 🤖 Doraemon Movie Streaming Website

A complete, production-ready movie streaming website featuring Doraemon movies with AI-generated blogs, ad monetization, and comprehensive admin management. Built with Hono framework and deployed on Cloudflare Workers/Pages.

## ✨ Features

### 🎬 Core Functionality
- **Movie Streaming**: Watch Doraemon movies online with video player
- **Download Support**: Download movies after watching required ads
- **Mobile-First Design**: Responsive Doraemon-themed interface (blue, red, yellow)
- **AI-Powered Blogs**: Automated blog generation using OpenRouter API
- **Ad Integration**: Watch 2 ads to unlock movie access
- **Analytics Tracking**: Comprehensive user behavior analytics

### 🔐 Admin Panel
- **Role-Based Access**: Superadmin and Admin roles
- **Movie Management**: Add, edit, delete movies with Telegram file integration
- **Blog Generation**: AI-powered content creation for each movie
- **Analytics Dashboard**: View stats, user interactions, and performance metrics
- **Cron Job Management**: Automated tasks for content updates and cleanup
- **User Management**: Create and manage admin accounts (Superadmin only)

### 🛡️ Security Features
- **JWT Authentication**: Secure admin panel access
- **Rate Limiting**: API protection against abuse
- **SQL Injection Protection**: Parameterized queries
- **XSS Prevention**: Input sanitization
- **CORS Configuration**: Secure cross-origin requests

### 🎨 User Interface
- **Konami Code Access**: Secret admin panel access (↑↑↓↓←→←→BA)
- **Doraemon Theme**: Authentic blue, red, yellow color scheme
- **Interactive Elements**: Hover effects, animations, loading states
- **Social Sharing**: Share movies and blog posts
- **Search & Filter**: Find movies by title, year, rating

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Cloudflare account (free tier works)
- OpenRouter API key (for AI blog generation)
- Telegram Bot token (for file streaming)

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd doraemon-stream
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .dev.vars
# Edit .dev.vars with your API keys
```

Required environment variables:
- `OPENROUTER_API_KEY`: Get from [OpenRouter](https://openrouter.ai/)
- `TELEGRAM_BOT_TOKEN`: Create bot via [@BotFather](https://t.me/botfather)
- `JWT_SECRET`: Random long string for authentication
- `SITE_NAME`: Your website name
- `SITE_URL`: Your website URL

### 3. Local Development
```bash
# Clean any existing processes on port 3000
npm run clean-port

# Build the application
npm run build

# Set up local database
npm run db:migrate:local
npm run db:seed

# Start development server
npm run dev:sandbox
```

Visit: http://localhost:3000

### 4. Admin Panel Access
- **URL**: http://localhost:3000/awd
- **Konami Code**: ↑↑↓↓←→←→BA (on homepage)
- **Default Login**: `superadmin` / `admin123`

## 🌐 Deployment

### Automated Deployment
```bash
./deploy.sh
```

The deployment script will:
1. Set up Cloudflare D1 database
2. Create KV namespace for caching
3. Create R2 bucket for assets
4. Deploy to Cloudflare Pages
5. Apply database migrations

### Manual Deployment Steps

1. **Authenticate with Cloudflare**
```bash
wrangler auth login
```

2. **Create Cloudflare Resources**
```bash
# Create D1 database
wrangler d1 create doraemon-production

# Create KV namespace
wrangler kv:namespace create doraemon_KV
wrangler kv:namespace create doraemon_KV --preview

# Create R2 bucket
wrangler r2 bucket create doraemon-assets
```

3. **Update Configuration**
Update `wrangler.jsonc` with the IDs from above commands.

4. **Deploy Application**
```bash
npm run build
wrangler pages project create doraemon-stream --production-branch main
wrangler pages deploy dist --project-name doraemon-stream
```

5. **Set Production Environment Variables**
In Cloudflare dashboard, add all variables from `.env.example`.

## 📊 Database Schema

### Core Tables
- **admin_roles**: User authentication and role management
- **movies**: Movie metadata, Telegram file IDs, OTT availability
- **movie_blogs**: AI-generated blog content for each movie
- **user_sessions**: Anonymous user tracking for ad requirements
- **analytics**: User behavior and interaction tracking
- **ad_interactions**: Ad view/click/completion tracking
- **cron_jobs**: Automated task management
- **cache_entries**: Performance optimization caching

### Sample Data
The application includes sample Doraemon movies:
- Stand by Me Doraemon (2014)
- Doraemon: Nobita's Great Adventure in the Antarctic Kachi Kochi (2017)
- Doraemon: Nobita's Treasure Island (2018)
- Stand by Me Doraemon 2 (2020)
- Doraemon: Nobita's New Dinosaur (2020)

## 🎯 API Endpoints

### Public APIs
- `GET /api/movies` - List all active movies
- `GET /api/movies/:id` - Get single movie details
- `GET /api/movies/:id/blog` - Get movie blog content
- `POST /api/check-ads/:movieId` - Check ad requirements
- `POST /api/track-ad` - Track ad interactions
- `GET /api/stream/:fileId` - Stream movie file (proxy to Telegram)
- `GET /api/download/:fileId` - Download movie file

### Admin APIs
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/movies` - Movie management (CRUD)
- `POST /api/admin/movies/:id/generate-blog` - Generate AI blog
- `POST /api/admin/validate-telegram` - Validate Telegram files
- `POST /api/admin/cron/:job` - Run cron jobs manually

## 🔧 Configuration

### Movie File Integration
Movies are streamed via Telegram Bot API. Add movies in admin panel with:
- **Title, Year, Description**: Basic movie information
- **Telegram File ID**: File uploaded to your Telegram bot
- **Thumbnail URL**: Movie poster/thumbnail image
- **Characters**: JSON array of character names
- **OTT Availability**: Platforms where movie is available

### AI Blog Generation
Blogs are automatically generated using OpenRouter API with GPT-3.5-turbo:
- Triggered when users visit `/movie/:id/blog` without existing blog
- Can be manually generated via admin panel
- Includes SEO-optimized content with headings, keywords, and meta descriptions

### Ad Integration
- Users must watch 2 ads before movie access
- Supports Google AdSense (configure `ADSENSE_CLIENT_ID`)
- Session-based tracking (no user accounts needed)
- Configurable ad requirements and expiration

## 🛠️ Development

### Project Structure
```
doraemon-stream/
├── src/
│   ├── index.tsx           # Main Hono application
│   ├── types.ts            # TypeScript interfaces
│   ├── routes/             # API route handlers
│   └── utils/              # Database, auth, API utilities
├── public/static/          # Frontend assets (CSS, JS)
├── migrations/             # D1 database migrations
├── .dev.vars              # Local environment variables
├── wrangler.jsonc         # Cloudflare configuration
├── deploy.sh              # Deployment script
└── README.md              # This file
```

### Available Scripts
- `npm run dev` - Vite development server
- `npm run dev:sandbox` - Wrangler Pages development
- `npm run build` - Build for production
- `npm run deploy` - Deploy to Cloudflare Pages
- `npm run db:migrate:local` - Apply local DB migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset local database
- `npm run clean-port` - Kill processes on port 3000

### Technology Stack
- **Backend**: Hono (TypeScript) on Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare KV (caching) + R2 (assets)
- **Frontend**: Vanilla JavaScript + TailwindCSS
- **AI Integration**: OpenRouter API (GPT models)
- **File Streaming**: Telegram Bot API
- **Deployment**: Cloudflare Pages

## 🎨 Customization

### Theming
The Doraemon theme uses CSS custom properties in `public/static/styles.css`:
- `--doraemon-blue`: #1E40AF
- `--doraemon-red`: #DC2626  
- `--doraemon-yellow`: #D97706

### Adding Movies
1. Upload movie file to your Telegram bot
2. Get file ID from Telegram API
3. Add movie via admin panel with file ID
4. AI blog will be generated automatically

### Custom Content
- Modify `seed.sql` for different sample data
- Update movie characters and descriptions
- Customize blog generation prompts in `src/utils/openrouter.ts`

## 📈 Analytics & Monitoring

### Tracked Events
- Page views and navigation
- Movie views and blog reads
- Ad impressions, clicks, completions
- Download attempts and successes
- User session data (anonymous)

### Admin Dashboard
- Total movies, views, downloads
- Recent movie activity
- User engagement metrics
- System health indicators

### Cron Jobs
- **Generate Blogs**: Create AI content for movies without blogs
- **Cleanup Sessions**: Remove expired user sessions
- **Cache Cleanup**: Clear expired cache entries
- **Analytics Aggregation**: Process and summarize user data

## 🔐 Security Considerations

### Authentication
- JWT tokens with configurable expiration
- Bcrypt password hashing (Web Crypto API)
- Role-based access control (Superadmin/Admin)
- Session-based user tracking (no PII required)

### Data Protection
- No user registration/personal data collection
- Anonymous session tracking only
- Secure API token handling
- Rate limiting on all endpoints

### File Security
- Telegram API proxy for file streaming
- No direct file uploads to prevent abuse
- File validation before streaming
- Bandwidth protection via ad requirements

## 🚨 Troubleshooting

### Common Issues

**Port 3000 already in use:**
```bash
npm run clean-port
```

**Database migration errors:**
```bash
npm run db:reset
```

**Wrangler authentication:**
```bash
wrangler auth login
wrangler whoami
```

**Build failures:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables
Ensure all required variables are set in:
- `.dev.vars` (local development)
- Cloudflare dashboard (production)

### File Streaming Issues
- Verify Telegram bot token
- Check file ID format
- Ensure bot has access to files
- Test with sample file IDs

## 📞 Support

### Resources
- [Hono Documentation](https://hono.dev/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [OpenRouter API Docs](https://openrouter.ai/docs)
- [Telegram Bot API](https://core.telegram.org/bots/api)

### Common Commands
```bash
# View logs
pm2 logs doraemon-stream --nostream

# Database console
npm run db:console:local

# Test endpoints
curl http://localhost:3000/api/movies

# Check deployment
wrangler pages deployment list --project-name doraemon-stream
```

## 📄 License

This project is for educational purposes. Please ensure compliance with copyright laws and Telegram's Terms of Service when using with actual movie content.

---

**🎬 Enjoy your Doraemon Movie Streaming Website!**

Built with ❤️ using Cloudflare Workers, Hono, and AI-powered content generation.