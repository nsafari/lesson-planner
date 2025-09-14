#!/bin/bash

# Lesson Planner Angular Frontend Setup Script

echo "🚀 Setting up Lesson Planner Angular Frontend..."

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

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create favicon.ico if it doesn't exist
if [ ! -f "src/favicon.ico" ]; then
    echo "📄 Creating favicon.ico..."
    touch src/favicon.ico
fi

# Check if backend is running
echo "🔍 Checking if backend is running..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Backend is running on http://localhost:3000"
else
    echo "⚠️  Backend is not running. Please start the backend first:"
    echo "   cd ../backend && npm run start:dev"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure the backend is running on http://localhost:3000"
echo "2. Start the Angular development server:"
echo "   npm start"
echo "3. Open your browser and go to http://localhost:4200"
echo ""
echo "🔐 Default test accounts:"
echo "   Student: ali.ahmadi / password123"
echo "   Admin: test / password"
echo ""
echo "📚 For more information, see README.md"
