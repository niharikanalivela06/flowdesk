# FlowDesk - Team Task Manager

A full-stack web application for managing team tasks and projects, built with FastAPI backend and vanilla JavaScript frontend. Features user authentication, project management, task tracking, and a responsive dashboard.

## 🚀 Features

- **User Authentication**: Secure signup and login with JWT-based sessions
- **Project Management**: Create and manage team projects
- **Task Management**: Add, update, and track tasks with status (To Do, In Progress, Done, Overdue)
- **Dashboard**: Real-time overview of tasks, projects, and team members
- **Responsive Design**: Mobile-friendly interface with modern UI
- **RESTful API**: Well-documented API endpoints for all operations

## 🛠 Tech Stack

### Backend
- **FastAPI**: High-performance async web framework
- **SQLAlchemy**: ORM for database operations
- **SQLite**: Lightweight database (easily replaceable with PostgreSQL)
- **Pydantic**: Data validation and serialization
- **PassLib**: Password hashing with bcrypt
- **Uvicorn**: ASGI server

### Frontend
- **Vanilla JavaScript**: No frameworks, pure ES6+ JavaScript
- **HTML5**: Semantic markup
- **CSS3**: Custom responsive styling with CSS Grid and Flexbox
- **Fetch API**: For AJAX requests

### Deployment
- **Railway**: Cloud platform for deployment
- **Procfile**: Process definition for Railway
- **Railway.toml**: Multi-service configuration

## 📁 Project Structure

```
team-task-manager/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app with routing
│   │   ├── database.py      # Database setup and models
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic schemas
│   │   └── routes/          # API route handlers
│   │       ├── user.py      # Auth endpoints
│   │       ├── project.py   # Project CRUD
│   │       ├── task.py      # Task CRUD
│   │       └── dashboard.py # Dashboard data
│   ├── requirements.txt     # Python dependencies
│   ├── Procfile             # Railway process definition
│   └── test.http            # API testing file
├── frontend/
│   ├── index.html           # Main HTML page
│   ├── app.js               # Main JavaScript application
│   ├── styles.css           # CSS styles
│   └── package.json         # Node.js config (for Railway)
├── railway.toml             # Railway deployment config
├── requirements.txt         # Root dependencies
├── Procfile                 # Root process definition
└── README.md
```

## 🏃‍♂️ Local Development

### Prerequisites
- Python 3.8+ (download from [python.org](https://python.org))
- Git (download from [git-scm.com](https://git-scm.com))
- A web browser (Chrome, Firefox, etc.)

### Quick Start (Windows)

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd team-task-manager
   ```

2. **Set up Backend**:
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   Keep this terminal running. The API is now at `http://localhost:8000`.

3. **Set up Frontend** (in a new terminal):
   ```bash
   cd frontend
   python -m http.server 3000
   ```
   Or simply open `frontend/index.html` directly in your browser.

4. **Configure API URL**:
   - Open `frontend/app.js`
   - Change `const API = "";` to `const API = "http://localhost:8000";`
   - Save the file

5. **Access the Application**:
   - Open `http://localhost:3000` in your browser
   - Sign up for a new account or log in
   - Start creating projects and tasks!

### Detailed Setup

#### Backend Setup
1. Navigate to backend directory: `cd backend`
2. Create virtual environment: `python -m venv venv`
3. Activate environment: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (macOS/Linux)
4. Install dependencies: `pip install -r requirements.txt`
5. Run server: `uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`
6. Verify: Visit `http://localhost:8000` - should show API status

#### Frontend Setup
1. For simple testing: Double-click `frontend/index.html` to open in browser
2. For proper server: Run `python -m http.server 3000` from `frontend/` directory
3. Access at `http://localhost:3000`

#### API Configuration
- Production: `const API = "";` (same-origin)
- Local development: `const API = "http://localhost:8000";`

### Testing the API
- Use `backend/test.http` with VS Code REST Client extension
- Or use tools like Postman/cURL
- Example: `GET http://localhost:8000/auth/users`

### Troubleshooting
- **Port 8000 in use**: Change to `--port 8001` in uvicorn command
- **Python not found**: Ensure Python is in PATH
- **Permission errors**: Run terminal as administrator
- **CORS errors**: Ensure API URL is correct in `app.js`

## 📡 API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login

### Projects
- `GET /projects/` - List all projects
- `POST /projects/` - Create new project
- `GET /projects/{id}` - Get project details
- `PUT /projects/{id}` - Update project
- `DELETE /projects/{id}` - Delete project

### Tasks
- `GET /tasks/` - List all tasks
- `POST /tasks/` - Create new task
- `GET /tasks/{id}` - Get task details
- `PATCH /tasks/{id}` - Update task (status, etc.)
- `DELETE /tasks/{id}` - Delete task

### Dashboard
- `GET /dashboard/stats` - Dashboard statistics

### Users
- `GET /auth/users` - List all users

## 🚀 Deployment

The application is configured for deployment on Railway:

1. **Connect Repository**: Link your GitHub repository to Railway
2. **Service Configuration**:
   - Root Directory: `.` (repository root)
   - Build Command: Automatic (via `requirements.txt`)
   - Start Command: Via `Procfile`
3. **Environment Variables**: None required (uses Railway's `$PORT`)
4. **Database**: SQLite is used (persistent via Railway volumes)

The `railway.toml` defines a single service that serves both backend and frontend.

## 🔧 Key Implementation Details

### Backend Architecture
- **Modular Routing**: Separate route files for different domains
- **Database Models**: User, Project, Task with proper relationships
- **CORS Handling**: Configured for cross-origin requests
- **Static File Serving**: Frontend assets served via FastAPI

### Frontend Architecture
- **SPA Design**: Single-page application with client-side routing
- **State Management**: In-memory state with localStorage persistence
- **API Integration**: RESTful API calls with error handling
- **Responsive UI**: CSS Grid and Flexbox for layouts

### Security
- Password hashing with bcrypt
- CORS middleware for API protection
- Input validation with Pydantic

## 🧪 Testing

### API Testing
Use the provided `test.http` file with VS Code REST Client extension, or tools like Postman.

### Manual Testing
1. Start the backend server
2. Open the frontend in a browser
3. Test signup, login, project creation, task management

