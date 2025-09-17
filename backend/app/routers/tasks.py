from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.core.security import verify_token
from app.models import User, Task, Course
from app.schemas import (
    TaskCreate, 
    TaskUpdate, 
    Task as TaskSchema, 
    TaskStats
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

@router.get("/", response_model=List[TaskSchema])
async def get_tasks(
    filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Task).filter(Task.owner_id == current_user.id)
    
    if filter == "pending":
        query = query.filter(Task.completed == False)
    elif filter == "completed":
        query = query.filter(Task.completed == True)
    elif filter == "high":
        query = query.filter(Task.priority == "high")
    
    tasks = query.order_by(Task.created_at.desc()).all()
    return tasks

@router.get("/today", response_model=List[TaskSchema])
async def get_today_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = datetime.now().date()
    tasks = db.query(Task).filter(
        Task.owner_id == current_user.id,
        Task.due_date == today
    ).order_by(Task.priority.desc()).limit(5).all()
    return tasks

@router.get("/stats", response_model=TaskStats)
async def get_task_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_tasks = db.query(Task).filter(Task.owner_id == current_user.id).count()
    completed_tasks = db.query(Task).filter(
        Task.owner_id == current_user.id,
        Task.completed == True
    ).count()
    pending_tasks = db.query(Task).filter(
        Task.owner_id == current_user.id,
        Task.completed == False
    ).count()
    overdue_tasks = db.query(Task).filter(
        Task.owner_id == current_user.id,
        Task.due_date < datetime.now(),
        Task.completed == False
    ).count()
    
    return TaskStats(
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        pending_tasks=pending_tasks,
        overdue_tasks=overdue_tasks
    )

@router.post("/", response_model=TaskSchema)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = Task(
        **task_data.dict(),
        owner_id=current_user.id
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.put("/{task_id}", response_model=TaskSchema)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.owner_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    update_data = task_data.dict(exclude_unset=True)
    
    # Handle completion
    if "completed" in update_data:
        if update_data["completed"] and not task.completed:
            update_data["completed_at"] = datetime.now()
        elif not update_data["completed"]:
            update_data["completed_at"] = None
    
    for field, value in update_data.items():
        setattr(task, field, value)
    
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.owner_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}