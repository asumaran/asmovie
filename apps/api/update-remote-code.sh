#!/bin/bash

# Script to update code on an existing EC2 instance
# Usage: ./update-remote-code.sh <EC2_IP>

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if [ -z "$1" ]; then
    echo -e "${RED}❌ Usage: $0 <EC2_IP>${NC}"
    echo "Example: $0 ec2-3-87-121-159.compute-1.amazonaws.com"
    exit 1
fi

EC2_HOST="$1"
KEY_PATH="$HOME/.ssh/asmovie-keypair.pem"

echo -e "${BLUE}🔄 Updating code on EC2 instance: $EC2_HOST${NC}"
echo ""

# Verify that the key exists
if [ ! -f "$KEY_PATH" ]; then
    echo -e "${RED}❌ SSH key not found at $KEY_PATH${NC}"
    exit 1
fi

# Get the current local commit
LOCAL_COMMIT=$(git log --format="%H" -1)
LOCAL_MESSAGE=$(git log --format="%s" -1)

echo -e "${BLUE}📍 Local commit to deploy: ${LOCAL_COMMIT:0:8}${NC}"
echo -e "${BLUE}💬 Commit message: $LOCAL_MESSAGE${NC}"
echo ""

# Create SSH command
SSH_COMMAND="ssh -i $KEY_PATH -o StrictHostKeyChecking=no ec2-user@$EC2_HOST"

# Script to execute on the remote server
REMOTE_SCRIPT='
set -e

echo "🔄 Starting remote code update..."

# Change to the application directory
cd /opt/asmovie/app

# Verify current commit
CURRENT_COMMIT=$(sudo git log --format="%H" -1 2>/dev/null || echo "UNKNOWN")
echo "📍 Current commit: ${CURRENT_COMMIT:0:8}"

# Configure git globally for root
sudo git config --global --add safe.directory /opt/asmovie/app || true
sudo git config --global user.email "deploy@asmovie.com" || true
sudo git config --global user.name "Deploy Bot" || true

# Pull latest changes from GitHub (as root)
echo "🔄 Pulling latest changes from GitHub..."
sudo git fetch origin main
sudo git reset --hard origin/main

# Verify new commit
NEW_COMMIT=$(sudo git log --format="%H" -1)
echo "📍 Updated to commit: ${NEW_COMMIT:0:8}"
echo "💬 Commit message: $(sudo git log --format="%s" -1)"

# Go to the API directory
cd apps/api

# Remove infrastructure to avoid conflicts
echo "🧹 Removing infrastructure files..."
sudo rm -rf infrastructure

# Change ownership to ec2-user for npm operations
sudo chown -R ec2-user:ec2-user /opt/asmovie/app

# Install dependencies (including dev dependencies for build)
echo "📦 Installing all dependencies..."
npm ci

# Build the application
echo "🔨 Building application..."
npm run build

# Check if .env exists, if not, copy it from the original deployment  
if [ ! -f ".env" ] && [ -f "/opt/asmovie/app/.env" ]; then
    echo "🔧 Copying existing .env file..."
    cp /opt/asmovie/app/.env .env
elif [ ! -f ".env" ]; then
    echo "⚠️ No .env file found. Creating minimal .env..."
    cat > .env << ENV_EOF
NODE_ENV=production
PORT=3001
JWT_SECRET="production-jwt-secret-key-32-chars-minimum"
API_TOKEN="production-api-token-16-chars"
ALLOWED_ORIGINS="*"
ENV_EOF
fi

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Generate Prisma Client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Seed database if tables are empty
echo "🌱 Seeding database if needed..."
npm run seed || echo "⚠️ Seed failed or data already exists"

# Restart the application with PM2 (as root since PM2 runs as root)
echo "🔄 Restarting application..."
sudo pm2 stop asmovie-api || true
sudo pm2 delete asmovie-api || true
sudo pm2 start npm --name asmovie-api -- run start:prod
sudo pm2 save

echo "✅ Code update completed successfully!"
echo "🌐 Application restarted and running"
'

# Execute the script on the remote server
echo -e "${YELLOW}🚀 Executing remote update...${NC}"
$SSH_COMMAND "$REMOTE_SCRIPT"

echo ""
echo -e "${GREEN}✅ Remote code update completed!${NC}"
echo ""
echo -e "${BLUE}🧪 Testing API endpoint...${NC}"

# Wait a moment for the app to restart
sleep 5

# Test the API
API_URL="http://$EC2_HOST"
if curl -s "$API_URL" | grep -q "mundox"; then
    echo -e "${GREEN}✅ API is responding with latest changes!${NC}"
else
    echo -e "${YELLOW}⚠️ API is responding but might not have the latest changes${NC}"
    echo "Response: $(curl -s "$API_URL")"
fi
