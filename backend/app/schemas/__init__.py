from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, time

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    username: Optional[str] = None

class Login(BaseModel):
    email: EmailStr
    password: str

# Course Schemas
class CourseBase(BaseModel):
    name: str
    code: Optional[str] = None
    description: Optional[str] = None
    credits: Optional[int] = None
    color: Optional[str] = "#6200ee"

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    credits: Optional[int] = None
    color: Optional[str] = None

class Course(CourseBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Task Schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "medium"
    due_date: Optional[datetime] = None
    course_id: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[datetime] = None
    completed: Optional[bool] = None
    course_id: Optional[int] = None

class Task(TaskBase):
    id: int
    status: str
    completed: bool
    completed_at: Optional[datetime] = None
    owner_id: int
    created_at: datetime
    updated_at: datetime
    course: Optional[Course] = None

    class Config:
        from_attributes = True

# Schedule Schemas
class ScheduleBase(BaseModel):
    day_of_week: int
    start_time: time
    end_time: time
    location: Optional[str] = None
    notes: Optional[str] = None
    course_id: int

class ScheduleCreate(ScheduleBase):
    pass

class ScheduleUpdate(BaseModel):
    day_of_week: Optional[int] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    course_id: Optional[int] = None

class Schedule(ScheduleBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
    course: Course

    class Config:
        from_attributes = True

# Reminder Schemas
class ReminderBase(BaseModel):
    title: str
    message: Optional[str] = None
    remind_at: datetime
    reminder_type: Optional[str] = "custom"
    task_id: Optional[int] = None

class ReminderCreate(ReminderBase):
    pass

class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    remind_at: Optional[datetime] = None
    is_sent: Optional[bool] = None

class Reminder(ReminderBase):
    id: int
    is_sent: bool
    owner_id: int
    created_at: datetime
    updated_at: datetime
    task: Optional[Task] = None

    class Config:
        from_attributes = True

# Statistics Schemas
class TaskStats(BaseModel):
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    overdue_tasks: int

class DashboardStats(BaseModel):
    task_stats: TaskStats
    upcoming_classes: int
    total_courses: int