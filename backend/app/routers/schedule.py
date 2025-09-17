from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, time

from app.core.database import get_db
from app.core.security import verify_token
from app.models import User, Schedule, Course
from app.schemas import (
    ScheduleCreate, 
    ScheduleUpdate, 
    Schedule as ScheduleSchema,
    CourseCreate,
    Course as CourseSchema
)

router = APIRouter()
security = HTTPBearer()

def get_current_user(token: str = Depends(security), db: Session = Depends(get_db)):
    payload = verify_token(token.credentials)
    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    return user

@router.get("/weekly")
async def get_weekly_schedule(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    schedules = db.query(Schedule).filter(
        Schedule.owner_id == current_user.id
    ).all()
    
    # Organize by day of week
    weekly_schedule = {
        "lunes": [],
        "martes": [],
        "miércoles": [],
        "jueves": [],
        "viernes": [],
        "sábado": [],
        "domingo": []
    }
    
    day_names = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]
    
    for schedule in schedules:
        day_name = day_names[schedule.day_of_week]
        schedule_data = {
            "id": schedule.id,
            "course_name": schedule.course.name if schedule.course else "Sin curso",
            "location": schedule.location,
            "start_time": schedule.start_time.strftime("%H:%M"),
            "end_time": schedule.end_time.strftime("%H:%M"),
            "day_of_week": schedule.day_of_week,
            "notes": schedule.notes
        }
        weekly_schedule[day_name].append(schedule_data)
    
    # Sort by start time
    for day in weekly_schedule:
        weekly_schedule[day].sort(key=lambda x: x["start_time"])
    
    return weekly_schedule

@router.get("/today")
async def get_today_schedule(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today_weekday = datetime.now().weekday() + 1  # Convert to 1=Monday format
    if today_weekday == 7:
        today_weekday = 0  # Sunday
    
    schedules = db.query(Schedule).filter(
        Schedule.owner_id == current_user.id,
        Schedule.day_of_week == today_weekday
    ).order_by(Schedule.start_time).all()
    
    return [
        {
            "id": schedule.id,
            "course_name": schedule.course.name if schedule.course else "Sin curso",
            "location": schedule.location,
            "start_time": schedule.start_time.strftime("%H:%M"),
            "end_time": schedule.end_time.strftime("%H:%M"),
            "notes": schedule.notes
        }
        for schedule in schedules
    ]

@router.post("/classes", response_model=Dict[str, Any])
async def create_class(
    class_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Extract course data
    course_name = class_data.get("course_name")
    if not course_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Course name is required"
        )
    
    # Find or create course
    course = db.query(Course).filter(
        Course.name == course_name,
        Course.owner_id == current_user.id
    ).first()
    
    if not course:
        course = Course(
            name=course_name,
            owner_id=current_user.id
        )
        db.add(course)
        db.commit()
        db.refresh(course)
    
    # Parse time strings
    start_time_str = class_data.get("start_time", "08:00")
    end_time_str = class_data.get("end_time", "10:00")
    
    try:
        start_time = datetime.strptime(start_time_str, "%H:%M").time()
        end_time = datetime.strptime(end_time_str, "%H:%M").time()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid time format. Use HH:MM"
        )
    
    # Create schedule
    schedule = Schedule(
        day_of_week=class_data.get("day_of_week", 1),
        start_time=start_time,
        end_time=end_time,
        location=class_data.get("location"),
        notes=class_data.get("notes"),
        owner_id=current_user.id,
        course_id=course.id
    )
    
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    
    return {
        "id": schedule.id,
        "course_name": course.name,
        "location": schedule.location,
        "start_time": schedule.start_time.strftime("%H:%M"),
        "end_time": schedule.end_time.strftime("%H:%M"),
        "day_of_week": schedule.day_of_week,
        "notes": schedule.notes
    }

@router.put("/classes/{class_id}")
async def update_class(
    class_id: int,
    class_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    schedule = db.query(Schedule).filter(
        Schedule.id == class_id,
        Schedule.owner_id == current_user.id
    ).first()
    
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    # Update course if needed
    if "course_name" in class_data:
        course = db.query(Course).filter(
            Course.name == class_data["course_name"],
            Course.owner_id == current_user.id
        ).first()
        
        if not course:
            course = Course(
                name=class_data["course_name"],
                owner_id=current_user.id
            )
            db.add(course)
            db.commit()
            db.refresh(course)
        
        schedule.course_id = course.id
    
    # Update other fields
    if "start_time" in class_data:
        schedule.start_time = datetime.strptime(class_data["start_time"], "%H:%M").time()
    if "end_time" in class_data:
        schedule.end_time = datetime.strptime(class_data["end_time"], "%H:%M").time()
    if "location" in class_data:
        schedule.location = class_data["location"]
    if "day_of_week" in class_data:
        schedule.day_of_week = class_data["day_of_week"]
    if "notes" in class_data:
        schedule.notes = class_data["notes"]
    
    db.commit()
    db.refresh(schedule)
    
    return {
        "id": schedule.id,
        "course_name": schedule.course.name,
        "location": schedule.location,
        "start_time": schedule.start_time.strftime("%H:%M"),
        "end_time": schedule.end_time.strftime("%H:%M"),
        "day_of_week": schedule.day_of_week,
        "notes": schedule.notes
    }

@router.delete("/classes/{class_id}")
async def delete_class(
    class_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    schedule = db.query(Schedule).filter(
        Schedule.id == class_id,
        Schedule.owner_id == current_user.id
    ).first()
    
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    db.delete(schedule)
    db.commit()
    return {"message": "Class deleted successfully"}