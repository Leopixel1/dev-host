#!/bin/bash

# Exit on error
set -e

# Colors for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting QuickHost installation...${NC}"

# 1. Check if Node.js and npm are installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js (v18+) and try again."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed. Please install npm and try again."
    exit 1
fi

echo -e "✅ Node.js version: $(node -v)"
echo -e "✅ npm version: $(npm -v)"

# 2. Install all dependencies
echo -e "${BLUE}📦 Installing all dependencies...${NC}"
npm run setup

# 3. Build the frontend
echo -e "${BLUE}🏗️ Building the frontend...${NC}"
npm run build

# 4. Check/Install pm2
echo -e "${BLUE}🛡️ Ensuring pm2 is installed globally...${NC}"
if ! command -v pm2 &> /dev/null; then
    echo "Installing pm2..."
    npm install -g pm2
else
    echo "✅ pm2 is already installed."
fi

# 5. Start the application in the background using pm2
echo -e "${BLUE}🌟 Starting the application using pm2...${NC}"

# Ensure data directory exists for sqlite database
mkdir -p quickhost/backend/data

# Stop and delete if it is already running to ensure a clean start
if pm2 status | grep -q "quickhost"; then
    pm2 delete quickhost
fi

cd quickhost/backend
pm2 start server.js --name quickhost

# Save the pm2 process list
pm2 save

echo -e "${GREEN}==========================================================================${NC}"
echo -e "${GREEN}🎉 QuickHost has been successfully installed and started!${NC}"
echo -e "📍 It is currently running on port 3000 (by default)."
echo -e "💻 Dashboard: http://localhost:3000"
echo -e "📊 Check status: pm2 status"
echo -e "📜 View logs:     pm2 logs quickhost"
echo -e "${GREEN}==========================================================================${NC}"
