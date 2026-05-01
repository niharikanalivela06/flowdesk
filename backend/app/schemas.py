from pydantic import BaseModel
from datetime import datetime

class UserCreate(BaseModel):
    email: str
    password: str
    role: str

class ProjectCreate(BaseModel):
    name: str

class TaskCreate(BaseModel):
    title: str
    project_id: int
    assigned_to: int
    due_date: datetime

class TaskStatusUpdate(BaseModel):
    status: str