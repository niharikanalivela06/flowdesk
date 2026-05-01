from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, database
from datetime import datetime

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    yield db
    db.close()

@router.get("/")
def dashboard(db: Session = Depends(get_db)):
    tasks = db.query(models.Task).all()
    overdue = [t for t in tasks if t.due_date and t.due_date < datetime.utcnow()]
    return {
        "total_tasks": len(tasks),
        "overdue": len(overdue)
    }