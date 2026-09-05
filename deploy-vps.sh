#!/bin/bash

# ==============================================================================
# TaskFlow 1-Click VPS Automated Deployment Script
# ==============================================================================

echo "🚀 Starting TaskFlow VPS Deployment..."

# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
fi

# 3. Install Docker Compose plugin if missing
if ! docker compose version &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    sudo apt install -y docker-compose-plugin
fi

# 4. Build and run containers
echo "🏗️ Building Docker container for TaskFlow..."
docker compose down
docker compose up -d --build

echo "✅ TaskFlow is now LIVE on your VPS!"
echo "🌐 Access your app at: http://YOUR_VPS_IP:3000"
