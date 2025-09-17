#!/bin/bash

echo "🚀 MyPlanU Development Server Startup"
echo "====================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Backend directory not found!${NC}"
    echo "Run this script from the project root directory"
    exit 1
fi

# Setup database
echo -e "${BLUE}📂 Setting up database...${NC}"
cd backend
python setup_database.py

# Check if Python dependencies are installed
echo -e "${BLUE}🔍 Checking Python dependencies...${NC}"
python -c "import fastapi, uvicorn, sqlalchemy, pydantic" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Python dependencies are installed${NC}"
    
    echo -e "${BLUE}🚀 Starting backend server...${NC}"
    echo "Backend will be available at: http://localhost:8000"
    echo "API documentation at: http://localhost:8000/docs"
    echo ""
    echo -e "${BLUE}To start frontend in another terminal:${NC}"
    echo "cd frontend && npm install && npm start"
    echo ""
    
    # Start the backend server
    python main.py
else
    echo -e "${RED}❌ Python dependencies not installed${NC}"
    echo "Please install dependencies first:"
    echo "pip install -r requirements.txt"
    echo ""
    echo "Or install manually:"
    echo "pip install fastapi uvicorn sqlalchemy pydantic python-jose passlib python-multipart"
fi