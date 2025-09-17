#!/bin/bash

echo "📱 MyPlanU Frontend Development"
echo "==============================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Frontend directory not found!${NC}"
    echo "Run this script from the project root directory"
    exit 1
fi

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing Node.js dependencies...${NC}"
    npm install
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Node.js dependencies already installed${NC}"
fi

# Check Node and npm versions
echo -e "${BLUE}🔍 System information:${NC}"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo ""

echo -e "${BLUE}🚀 Starting React Native development server...${NC}"
echo "App will be available for:"
echo "- iOS Simulator"  
echo "- Android Emulator"
echo "- Physical devices (via Expo Go)"
echo ""
echo "Demo credentials:"
echo "Email: demo@myplanu.com"
echo "Password: demo123"
echo ""

# Start the frontend
npm start