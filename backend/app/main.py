from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from .database import Base, engine
from .routes import user, project, task, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Team Task Manager")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

@app.get("/")
def root():
    return FileResponse(FRONTEND_DIR / "index.html")

app.include_router(user.router, prefix="/auth")
app.include_router(project.router, prefix="/projects")
app.include_router(task.router, prefix="/tasks")
app.include_router(dashboard.router, prefix="/dashboard")

@app.get("/{full_path:path}")
def spa(full_path: str):
    file_path = FRONTEND_DIR / full_path
    if file_path.exists() and file_path.is_file():
        return FileResponse(file_path)
    return FileResponse(FRONTEND_DIR / "index.html")