from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas, database

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    yield db
    db.close()

@router.get("/")
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(models.Project).all()
    return [{"id": p.id, "name": p.name, "owner_id": p.owner_id} for p in projects]

@router.post("/")
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    new_project = models.Project(name=project.name, owner_id=1)
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return {"msg": "Project created", "project_id": new_project.id, "name": new_project.name}