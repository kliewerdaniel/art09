#!/bin/bash

# ArtSaaS Complete Setup Script
# This script sets up the entire ArtSaaS platform for development

set -e

echo "🎨 Setting up ArtSaaS - Supporting Artists Through Community"
echo "=========================================================="

# Check prerequisites
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js 18+ and try again."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed. Please install npm and try again."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup environment
echo "🔧 Setting up environment..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✅ Created .env.local from .env.example"
    echo "⚠️  Please edit .env.local with your actual configuration values"
else
    echo "✅ .env.local already exists"
fi

# Initialize PocketBase
echo "🗄️  Setting up PocketBase..."
if [ ! -d "pb_data" ]; then
    echo "📁 Creating PocketBase data directory..."
    mkdir -p pb_data
fi

# Bootstrap database collections
echo "🔄 Bootstrapping database collections..."
if command -v npx &> /dev/null; then
    npx ts-node scripts/bootstrap-collections.ts || echo "⚠️  Bootstrap script not found or failed"
else
    echo "⚠️  npx not available, skipping bootstrap script"
fi

# Build the application
echo "🔨 Building application..."
npm run build

echo ""
echo "🎉 ArtSaaS setup complete!"
echo "=========================="
echo ""
echo "🚀 To start the development server:"
echo "   npm run dev"
echo ""
echo "🌐 Access the application at:"
echo "   Frontend: http://localhost:3000"
echo "   PocketBase Admin: http://localhost:8090/_/"
echo ""
echo "🔑 Demo Accounts:"
echo "   Admin: admin@artsaas.com / password123"
echo "   Artist: sarah.artist@example.com / password123"
echo "   Volunteer: emma.mentor@example.com / password123"
echo "   Donor: patron@example.com / password123"
echo ""
echo "📚 For more information, see README.md"
echo ""
echo "🎨 Happy creating with ArtSaaS!"
