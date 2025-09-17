# Development Guide

## Backend Development

### Setup
1. Create virtual environment: `python -m venv venv`
2. Activate: `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows)
3. Install dependencies: `pip install -r requirements.txt`
4. Setup database: `python setup_database.py`
5. Run server: `python main.py`

### Database
- SQLite database file: `myplanu.db`
- Schema: See `../database/init.sql`
- Test setup: Run `setup_database.py`

### API Testing
Use curl or tools like Postman to test endpoints:

```bash
# Health check
curl http://localhost:8000/health

# Register user
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get tasks (requires token)
curl http://localhost:8000/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Frontend Development

### Setup
1. Install Node.js and npm
2. Navigate to frontend directory: `cd frontend`
3. Install dependencies: `npm install`
4. Start development server: `npm start`

### Development Mode
The frontend includes offline fallback functionality that works without the backend:
- Demo login: `demo@myplanu.com` / `demo123`
- Local storage for tasks and schedules
- Mock data for testing

### Testing
- Use Expo development tools
- Test on iOS/Android simulators
- Use React Native debugging tools

## Architecture Overview

```
MyPlanUCode/
├── frontend/           # React Native mobile app
│   ├── src/
│   │   ├── screens/    # UI screens
│   │   ├── services/   # API and storage services
│   │   └── components/ # Reusable UI components
├── backend/            # Python FastAPI server
│   ├── app/
│   │   ├── models/     # Database models
│   │   ├── routers/    # API endpoints
│   │   └── schemas/    # Data validation
└── database/           # Database schema and scripts
```

## Common Tasks

### Add New Feature
1. Define database model (if needed) in `backend/app/models/`
2. Create API schema in `backend/app/schemas/`
3. Implement API endpoints in `backend/app/routers/`
4. Create service in `frontend/src/services/`
5. Implement UI in `frontend/src/screens/`

### Debug Issues
1. Check backend logs: Server runs with debug output
2. Check frontend console: Use React Native debugger
3. Check database: Use SQLite browser or run SQL queries

### Deploy
1. Backend: Use uvicorn with production settings
2. Frontend: Build with Expo and deploy to app stores
3. Database: Migrate to production database (PostgreSQL recommended)

## Best Practices

- Follow REST API conventions
- Use TypeScript for better code quality
- Implement proper error handling
- Add input validation
- Write tests for critical functionality
- Use environment variables for configuration
- Implement proper authentication and authorization