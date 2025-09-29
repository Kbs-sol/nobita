#!/bin/bash
# Doraemon Movie Streaming Website - Deployment Script

set -e  # Exit on any error

echo "🚀 Starting Doraemon Movie Streaming Website Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Check if wrangler is available
if ! command -v wrangler &> /dev/null; then
    print_error "Wrangler CLI not found. Please install it first: npm install -g wrangler"
    exit 1
fi

print_step "Checking environment configuration..."

# Check if .dev.vars exists
if [ ! -f ".dev.vars" ]; then
    print_warning ".dev.vars file not found. Creating from template..."
    cp .env.example .dev.vars
    print_warning "Please edit .dev.vars with your actual API keys before deploying."
fi

print_step "Installing dependencies..."
npm install

print_step "Building the application..."
npm run build

print_step "Setting up Cloudflare D1 database..."

# Create D1 database if it doesn't exist
DB_OUTPUT=$(wrangler d1 create DORAEMON_DB 2>&1 || true)

if echo "$DB_OUTPUT" | grep -q "already exists"; then
    print_warning "Database 'DORAEMON_DB' already exists"
else
    print_success "Database 'DORAEMON_DB' created"
    echo "$DB_OUTPUT"
    print_warning "Please update wrangler.jsonc with the database_id from the output above"
fi

print_step "Applying database migrations..."
wrangler d1 migrations apply DORAEMON_DB --local

if [ -f "seed.sql" ]; then
    print_step "Seeding database with sample data..."
    wrangler d1 execute DORAEMON_DB --local --file=./seed.sql
    print_success "Database seeded with sample data"
fi


print_step "Creating KV namespace..."
KV_OUTPUT=$(wrangler kv:namespace create doraemon_KV 2>&1 || true)
if echo "$KV_OUTPUT" | grep -q "already exists"; then
    print_warning "KV namespace already exists"
else
    print_success "KV namespace created"
    echo "$KV_OUTPUT"
    print_warning "Please update wrangler.jsonc with the KV namespace ID from the output above"
fi

# Create preview KV namespace
KV_PREVIEW_OUTPUT=$(wrangler kv:namespace create doraemon_KV --preview 2>&1 || true)
if echo "$KV_PREVIEW_OUTPUT" | grep -q "already exists"; then
    print_warning "KV preview namespace already exists"
else
    print_success "KV preview namespace created"
    echo "$KV_PREVIEW_OUTPUT"
fi

print_step "Creating R2 bucket..."
R2_OUTPUT=$(wrangler r2 bucket create doraemon-assets 2>&1 || true)
if echo "$R2_OUTPUT" | grep -q "already exists"; then
    print_warning "R2 bucket 'doraemon-assets' already exists"
else
    print_success "R2 bucket 'doraemon-assets' created"
fi

print_step "Checking wrangler authentication..."
if ! wrangler whoami &> /dev/null; then
    print_error "Not authenticated with Cloudflare. Please run: wrangler auth login"
    exit 1
fi

print_success "Authentication verified"

# Ask for deployment confirmation
echo
read -p "🤔 Do you want to deploy to Cloudflare Pages? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_step "Creating Cloudflare Pages project..."
    
    # Try to create the project (it might already exist)
    wrangler pages project create doraemon-stream --production-branch main --compatibility-date 2025-09-29 2>&1 || true
    
    print_step "Deploying to Cloudflare Pages..."
    wrangler pages deploy dist --project-name doraemon-stream
    
    print_step "Applying production database migrations..."
    wrangler d1 migrations apply DORAEMON_DB
    
    print_success "🎉 Deployment completed successfully!"
    print_success "🌐 Your application should be available at: https://doraemon-stream.pages.dev"
    
    echo
    echo "🔧 Next steps:"
    echo "1. Set up environment variables in Cloudflare dashboard:"
    echo "   - OPENROUTER_API_KEY"
    echo "   - TELEGRAM_BOT_TOKEN" 
    echo "   - JWT_SECRET"
    echo "   - And other variables from .env.example"
    echo
    echo "2. Update wrangler.jsonc with the actual database and KV IDs"
    echo
    echo "3. Test the admin panel at: https://doraemon-stream.pages.dev/awd"
    echo "   Default credentials: superadmin / admin123"
    
else
    print_warning "Deployment skipped. Your local build is ready for manual deployment."
    print_success "To deploy manually later, run: wrangler pages deploy dist --project-name doraemon-stream"
fi

print_step "Local development setup..."
echo "🖥️  To start local development:"
echo "   npm run clean-port && npm run build && npm run dev:sandbox"
echo
echo "🔑 Admin panel: http://localhost:3000/awd"
echo "👤 Default login: superadmin / admin123"
echo

print_success "🎬 Doraemon Movie Streaming Website deployment script completed!"
print_success "Visit https://doraemon-stream.pages.dev to see your site (after deployment)"
