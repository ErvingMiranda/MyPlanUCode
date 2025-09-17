# API Documentation

## Authentication

### POST /auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1Q...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "is_active": true,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

### POST /auth/login
Login with existing user credentials.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as register

## Tasks

### GET /tasks
Get all tasks for the authenticated user.

**Query Parameters:**
- `filter` (optional): `all`, `pending`, `completed`, `high`

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": 1,
    "title": "Study for exam",
    "description": "Review chapters 1-3",
    "priority": "high",
    "status": "pending",
    "due_date": "2024-01-20T00:00:00Z",
    "completed": false,
    "completed_at": null,
    "owner_id": 1,
    "course_id": 1,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "course": {
      "id": 1,
      "name": "Mathematics",
      "code": "MAT101"
    }
  }
]
```

### POST /tasks
Create a new task.

**Request:**
```json
{
  "title": "Complete assignment",
  "description": "Math homework problems 1-20",
  "priority": "medium",
  "due_date": "2024-01-25T23:59:59Z",
  "course_id": 1
}
```

### PUT /tasks/{task_id}
Update an existing task.

**Request:**
```json
{
  "title": "Updated title",
  "completed": true
}
```

### DELETE /tasks/{task_id}
Delete a task.

**Response:**
```json
{
  "message": "Task deleted successfully"
}
```

### GET /tasks/today
Get tasks due today.

### GET /tasks/stats
Get task statistics.

**Response:**
```json
{
  "total_tasks": 10,
  "completed_tasks": 5,
  "pending_tasks": 5,
  "overdue_tasks": 2
}
```

## Schedule

### GET /schedule/weekly
Get weekly schedule organized by days.

**Response:**
```json
{
  "lunes": [
    {
      "id": 1,
      "course_name": "Mathematics",
      "location": "Room 201",
      "start_time": "08:00",
      "end_time": "10:00",
      "day_of_week": 1,
      "notes": "Bring calculator"
    }
  ],
  "martes": [],
  ...
}
```

### GET /schedule/today
Get today's schedule.

### POST /schedule/classes
Create a new class in schedule.

**Request:**
```json
{
  "course_name": "Physics",
  "location": "Lab A",
  "start_time": "10:00",
  "end_time": "12:00",
  "day_of_week": 1,
  "notes": "Lab session"
}
```

### PUT /schedule/classes/{class_id}
Update a class.

### DELETE /schedule/classes/{class_id}
Delete a class.

## Users

### GET /users/me
Get current user profile.

### PUT /users/me
Update current user profile.

**Request:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

## Error Responses

All endpoints may return these error formats:

**400 Bad Request:**
```json
{
  "detail": "Invalid input data"
}
```

**401 Unauthorized:**
```json
{
  "detail": "Could not validate credentials"
}
```

**404 Not Found:**
```json
{
  "detail": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "detail": "Internal server error"
}
```

## Data Models

### Task Priority
- `low`: Low priority
- `medium`: Medium priority  
- `high`: High priority

### Task Status
- `pending`: Task is pending
- `completed`: Task is completed
- `cancelled`: Task is cancelled

### Day of Week
- `0`: Sunday
- `1`: Monday
- `2`: Tuesday
- `3`: Wednesday
- `4`: Thursday
- `5`: Friday
- `6`: Saturday