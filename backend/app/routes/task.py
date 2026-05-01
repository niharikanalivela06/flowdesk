from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database
from datetime import datetime

router = APIRouter()

VALID_STATUSES = ["todo", "in_progress", "done"]

def get_db():
    db = database.SessionLocal()
    yield db
    db.close()

@router.post("/")
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    new_task = models.Task(
        title=task.title,
        project_id=task.project_id,
        assigned_to=task.assigned_to,
        due_date=task.due_date
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return {"msg": "Task created", "task_id": new_task.id}

@router.get("/")
def get_tasks(db: Session = Depends(get_db)):
    tasks = db.query(models.Task).all()
    return [
        {
            "id": t.id,
            "title": t.title,
            "status": t.status,
            "due_date": t.due_date.isoformat() if t.due_date else None,
            "project_id": t.project_id,
            "assigned_to": t.assigned_to,
        }
        for t in tasks
    ]

@router.patch("/{task_id}")
def update_task_status(task_id: int, body: schemas.TaskStatusUpdate, db: Session = Depends(get_db)):
    if body.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Status must be one of {VALID_STATUSES}")
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = body.status
    db.commit()
    return {"msg": "Status updated"}