#!/bin/bash

# Good Grid Platform Setup Script
echo "🚀 Setting up Good Grid Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. Please install PostgreSQL 14+ first."
    echo "   On macOS: brew install postgresql"
    echo "   On Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    echo "   On Windows: Download from https://www.postgresql.org/download/"
    exit 1
fi

echo "✅ PostgreSQL detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating environment configuration..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env with your configuration before running the application"
fi

# Create database (optional)
read -p "🗄️  Do you want to create the PostgreSQL database now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Creating database 'good_grid'..."
    createdb good_grid 2>/dev/null || echo "Database might already exist"
    
    echo "Setting up database schema..."
    psql -d good_grid -f backend/src/database/schema.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ Database setup completed"
    else
        echo "❌ Database setup failed. Please check your PostgreSQL configuration."
    fi
fi

echo ""
echo "🎉 Setup completed!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your configuration"
echo "2. Set up your Gemini AI API key"
echo "3. Run 'npm run dev' to start development servers"
echo ""
echo "Frontend will be available at: http://localhost:3000"
echo "Backend API will be available at: http://localhost:3001"
echo ""
echo "For more information, see README.md"