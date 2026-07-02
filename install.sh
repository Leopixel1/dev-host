#!/bin/bash

# Exit on error
set -e

echo "Starting QuickHost installation..."

# 1. Check if Node.js and npm are installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js (v18+) and try again."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install npm and try again."
    exit 1
fi

echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"

# 2. Install backend dependencies
echo "Installing backend dependencies..."
cd quickhost/backend
npm install

# 3. Install frontend dependencies
echo "Installing frontend dependencies..."
cd ../frontend
npm install

# 4. Build the frontend
echo "Building the frontend..."
npm run build

# 5. Check/Install pm2
echo "Ensuring pm2 is installed globally..."
if ! command -v pm2 &> /dev/null; then
    echo "Installing pm2..."
    npm install -g pm2
else
    echo "pm2 is already installed."
fi

# 6. Start the application in the background using pm2
echo "Starting the application using pm2..."
cd ../backend

# Ensure data directory exists for sqlite database
mkdir -p data

# Stop and delete if it is already running to ensure a clean start
if pm2 status | grep -q "quickhost"; then
    pm2 delete quickhost
fi

pm2 start server.js --name quickhost

# Save the pm2 process list
pm2 save

echo "=========================================================================="
echo "QuickHost has been successfully installed and started in the background!"
echo "It is currently running on port 3000 (by default)."
echo "You can check its status with: pm2 status"
echo "You can view logs with:        pm2 logs quickhost"
echo "=========================================================================="
