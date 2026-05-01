const API = "";

// ── State ──────────────────────────────────────────────────────────────────
let currentUser = JSON.parse(localStorage.getItem("ttm_user")) || null;
let projects = [];
let users = [];
let allTasks = [];
let currentFilter = "all";

// ── Init ───────────────────────────────────────────────────────────────────
document.getElementById("currentDate").textContent =
  new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

if (currentUser) showApp();

// ── AUTH ───────────────────────────────────────────────────────────────────
function switchTab(tab) {
  document.getElementById("loginForm").classList.toggle("hidden", tab !== "login");
  document.getElementById("signupForm").classList.toggle("hidden", tab !== "signup");
  document.getElementById("loginTabBtn").classList.toggle("active", tab === "login");
  document.getElementById("signupTabBtn").classList.toggle("active", tab === "signup");
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  setMsg("loginError", "");
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role: "member" })
    });
    const data = await res.json();
    if (!res.ok) { setMsg("loginError", data.detail || "Login failed"); return; }
    currentUser = { id: data.user_id, email, role: data.role };
    localStorage.setItem("ttm_user", JSON.stringify(currentUser));
    showApp();
  } catch { setMsg("loginError", "Cannot connect to server"); }
}

async function handleSignup(e) {
  e.preventDefault();
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const role = document.getElementById("signupRole").value;
  setMsg("signupError", ""); setMsg("signupSuccess", "");
  try {
    const res = await fetch(`${API}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role })
    });
    const data = await res.json();
    if (!res.ok) { setMsg("signupError", data.detail || "Signup failed"); return; }
    setMsg("signupSuccess", "Account created! You can now log in.");
    document.getElementById("signupForm").reset();
    setTimeout(() => switchTab("login"), 1500);
  } catch { setMsg("signupError", "Cannot connect to server"); }
}

function logout() {
  currentUser = null;
  localStorage.removeItem("ttm_user");
  document.getElementById("appScreen").classList.add("hidden");
  document.getElementById("authScreen").classList.remove("hidden");
}

// ── APP INIT ───────────────────────────────────────────────────────────────
async function showApp() {
  document.getElementById("authScreen").classList.add("hidden");
  document.getElementById("appScreen").classList.remove("hidden");
  document.getElementById("userEmail").textContent = currentUser.email;
  document.getElementById("userRole").textContent = currentUser.role;
  document.getElementById("userAvatar").textContent = currentUser.email[0].toUpperCase();
  await Promise.all([fetchProjects(), fetchUsers()]);
  await loadTasks();
}

// ── VIEWS ──────────────────────────────────────────────────────────────────
function showView(name, el) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  document.getElementById("view-" + name).classList.add("active");
  if (el) el.classList.add("active");
  if (name === "tasks" || name === "dashboard") loadTasks();
  if (name === "projects") renderProjects();
  if (name === "team") renderMembers();
  return false;
}

// ── TASKS ──────────────────────────────────────────────────────────────────
async function loadTasks() {
  try {
    const res = await fetch(`${API}/tasks/`);
    allTasks = await res.json();
  } catch { allTasks = []; }
  renderDashboard();
  renderTaskList(currentFilter);
}

function renderDashboard() {
  const now = new Date();
  const todo    = allTasks.filter(t => t.status === "todo").length;
  const inProg  = allTasks.filter(t => t.status === "in_progress").length;
  const done    = allTasks.filter(t => t.status === "done").length;
  const overdue = allTasks.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== "done").length;

  document.getElementById("statTotal").textContent     = allTasks.length;
  document.getElementById("statTodo").textContent      = todo;
  document.getElementById("statInProgress").textContent = inProg;
  document.getElementById("statDone").textContent      = done;
  document.getElementById("statOverdue").textContent   = overdue;

  const recent = [...allTasks].reverse().slice(0, 6);
  document.getElementById("dashboardTaskList").innerHTML = buildTaskCards(recent, false);
}

function filterTasks(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderTaskList(filter);
}

function renderTaskList(filter) {
  const now = new Date();
  let list = allTasks;
  if (filter === "overdue")
    list = allTasks.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== "done");
  else if (filter !== "all")
    list = allTasks.filter(t => t.status === filter);
  document.getElementById("taskList").innerHTML = buildTaskCards(list, true);
}

function buildTaskCards(tasks, withStatusUpdate) {
  if (!tasks.length)
    return `<div class="empty-state"><div class="empty-icon">📭</div><p>No tasks found</p></div>`;

  const now = new Date();
  return tasks.map(t => {
    const isOverdue = t.due_date && new Date(t.due_date) < now && t.status !== "done";
    const displayStatus = isOverdue ? "overdue" : (t.status || "todo");
    const statusLabel = { todo: "To Do", in_progress: "In Progress", done: "Done", overdue: "Overdue" }[displayStatus] || displayStatus;
    const dueStr = t.due_date
      ? new Date(t.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "—";
    const proj     = projects.find(p => p.id === t.project_id);
    const assignee = users.find(u => u.id === t.assigned_to);
    const safeStatus = ["todo","in_progress","done"].includes(t.status) ? t.status : "todo";

    const statusControl = withStatusUpdate
      ? `<select class="status-select status-${safeStatus}" onchange="updateStatus(${t.id|0},this)">
           <option value="todo"        ${safeStatus==="todo"        ? "selected" : ""}>To Do</option>
           <option value="in_progress" ${safeStatus==="in_progress" ? "selected" : ""}>In Progress</option>
           <option value="done"        ${safeStatus==="done"        ? "selected" : ""}>Done</option>
         </select>`
      : `<span class="status-badge status-${displayStatus}">${statusLabel}</span>`;

    return `
      <div class="task-card ${isOverdue ? "overdue-card" : ""}">
        <div class="task-info">
          <div class="task-title">${escHtml(t.title)}</div>
          <div class="task-meta">
            ${proj     ? `<span>📁 ${escHtml(proj.name)}</span>` : t.project_id ? `<span>📁 Project #${t.project_id|0}</span>` : ""}
            <span>📅 ${dueStr}</span>
            ${assignee ? `<span>👤 ${escHtml(assignee.email)}</span>` : t.assigned_to ? `<span>👤 User #${t.assigned_to|0}</span>` : ""}
          </div>
        </div>
        ${statusControl}
      </div>`;
  }).join("");
}

async function updateStatus(taskId, select) {
  const status = select.value;
  select.className = `status-select status-${status}`;
  try {
    const res = await fetch(`${API}/tasks/${taskId|0}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      const task = allTasks.find(t => t.id === taskId);
      if (task) task.status = status;
      renderDashboard();
    } else {
      alert("Failed to update status");
    }
  } catch { alert("Cannot connect to server"); }
}

async function handleCreateTask(e) {
  e.preventDefault();
  setMsg("taskError", ""); setMsg("taskSuccess", "");
  const title      = document.getElementById("taskTitle").value;
  const project_id = parseInt(document.getElementById("taskProject").value, 10);
  const assigned_to = parseInt(document.getElementById("taskAssignee").value, 10);
  const due_date   = document.getElementById("taskDueDate").value;

  if (!project_id || !assigned_to) { setMsg("taskError", "Please select a project and assignee"); return; }

  try {
    const res = await fetch(`${API}/tasks/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, project_id, assigned_to, due_date: new Date(due_date).toISOString() })
    });
    const data = await res.json();
    if (!res.ok) { setMsg("taskError", data.detail || "Failed to create task"); return; }
    setMsg("taskSuccess", "Task created!");
    document.getElementById("taskTitle").value = "";
    setTimeout(() => { closeModal("taskModal"); loadTasks(); }, 900);
  } catch { setMsg("taskError", "Cannot connect to server"); }
}

// ── PROJECTS ──────────────────────────────────────────────────────────────
async function fetchProjects() {
  try {
    const res = await fetch(`${API}/projects/`);
    projects = await res.json();
  } catch { projects = []; }
  renderProjects();
}

function renderProjects() {
  const list = document.getElementById("projectList");
  if (!projects.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">📁</div><p>No projects yet. Create your first project!</p></div>`;
    return;
  }
  list.innerHTML = projects.map(p => {
    const taskCount = allTasks.filter(t => t.project_id === p.id).length;
    return `
      <div class="project-card">
        <div class="project-card-icon">📁</div>
        <div class="project-card-name">${escHtml(p.name)}</div>
        <div class="project-card-meta">ID: ${p.id|0} &nbsp;·&nbsp; ${taskCount} task${taskCount !== 1 ? "s" : ""}</div>
      </div>`;
  }).join("");
}

async function handleCreateProject(e) {
  e.preventDefault();
  setMsg("projectError", ""); setMsg("projectSuccess", "");
  const name = document.getElementById("projectName").value;
  try {
    const res = await fetch(`${API}/projects/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    const data = await res.json();
    if (!res.ok) { setMsg("projectError", data.detail || "Failed to create project"); return; }
    setMsg("projectSuccess", "Project created!");
    document.getElementById("projectName").value = "";
    await fetchProjects();
    setTimeout(() => closeModal("projectModal"), 900);
  } catch { setMsg("projectError", "Cannot connect to server"); }
}

// ── USERS / TEAM ───────────────────────────────────────────────────────────
async function fetchUsers() {
  try {
    const res = await fetch(`${API}/auth/users`);
    users = await res.json();
  } catch { users = []; }
  renderMembers();
}

function renderMembers() {
  const list = document.getElementById("memberList");
  if (!users.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">👥</div><p>No team members yet.</p></div>`;
    return;
  }
  list.innerHTML = users.map(u => `
    <div class="member-card">
      <div class="member-avatar">${u.email[0].toUpperCase()}</div>
      <div>
        <div class="member-email">${escHtml(u.email)}</div>
        <span class="member-role role-${escHtml(u.role)}">${escHtml(u.role)}</span>
      </div>
    </div>`).join("");
}

async function handleAddMember(e) {
  e.preventDefault();
  setMsg("memberError", ""); setMsg("memberSuccess", "");
  const email    = document.getElementById("memberEmail").value;
  const password = document.getElementById("memberPassword").value;
  const role     = document.getElementById("memberRole").value;
  try {
    const res = await fetch(`${API}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role })
    });
    const data = await res.json();
    if (!res.ok) { setMsg("memberError", data.detail || "Failed to add member"); return; }
    setMsg("memberSuccess", "Member added!");
    document.getElementById("memberEmail").value = "";
    document.getElementById("memberPassword").value = "";
    await fetchUsers();
    setTimeout(() => closeModal("memberModal"), 900);
  } catch { setMsg("memberError", "Cannot connect to server"); }
}

// ── MODALS ─────────────────────────────────────────────────────────────────
function openModal(id) {
  if (id === "taskModal") {
    document.getElementById("taskProject").innerHTML = projects.length
      ? projects.map(p => `<option value="${p.id|0}">${escHtml(p.name)}</option>`).join("")
      : `<option value="">No projects — create one first</option>`;
    document.getElementById("taskAssignee").innerHTML = users.length
      ? users.map(u => `<option value="${u.id|0}">${escHtml(u.email)}</option>`).join("")
      : `<option value="">No users available</option>`;
  }
  document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
  ["Error", "Success"].forEach(s => {
    const key = id.replace("Modal", "") + s;
    const el = document.getElementById(key);
    if (el) el.textContent = "";
  });
}

function closeModalOutside(e, id) {
  if (e.target.id === id) closeModal(id);
}

// ── HELPERS ────────────────────────────────────────────────────────────────
function setMsg(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}