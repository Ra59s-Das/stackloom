"""
app.py — FastAPI backend for Raunak Das Portfolio
Run: uvicorn app:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
import json, os, httpx
from datetime import datetime
from pathlib import Path
from pydantic import BaseModel
from typing import Optional, List, Dict, Any


def load_dotenv(path='.env'):
    env_path = Path(path)
    if not env_path.exists():
        return
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, value = line.split('=', 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))

load_dotenv()

# ── Setup ──────────────────────────────────────────
app = FastAPI(title="Raunak Das Portfolio", version="2.0")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

Path("data").mkdir(exist_ok=True)
Path("static/images/certificates").mkdir(parents=True, exist_ok=True)

DATA_FILE    = "data/projects.json"
PENDING_FILE = "data/pending.json"
CERTS_FILE   = "data/certificates.json"

GITHUB_USER = "Ra59s-Das"
LANG_TO_CAT = {
    "Python": "Data Science", "Jupyter Notebook": "Data Science",
    "TypeScript": "Full-Stack", "JavaScript": "Web App",
    "HTML": "Web App", "Java": "Backend", None: "Project"
}

# ── Pydantic models ─────────────────────────────────
class ProjectApproval(BaseModel):
    repo_name: str
    approved: bool
    custom_description: Optional[str] = None
    featured: Optional[bool] = False

class Certificate(BaseModel):
    title: str
    issuer: str
    date: str
    description: Optional[str] = None
    credential_url: Optional[str] = None
    image_url: Optional[str] = None

class ChatMessage(BaseModel):
    messages: List[Dict[str, Any]]
    system: Optional[str] = None

# ── Data helpers ─────────────────────────────────────
def load(path, default):
    return json.load(open(path)) if os.path.exists(path) else default

def save(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)

# ── Routes ───────────────────────────────────────────
@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")

@app.get("/api/projects")
async def get_projects():
    projects = load(DATA_FILE, [])
    return {"projects": projects, "total": len(projects)}

@app.get("/api/projects/pending")
async def get_pending():
    return {"pending": load(PENDING_FILE, [])}

@app.post("/api/projects/approve")
async def approve_project(payload: ProjectApproval):
    pending = load(PENDING_FILE, [])
    proj = next((p for p in pending if p["repo_name"] == payload.repo_name), None)
    if not proj:
        raise HTTPException(404, f"No pending project '{payload.repo_name}'")
    pending = [p for p in pending if p["repo_name"] != payload.repo_name]
    save(PENDING_FILE, pending)
    if payload.approved:
        if payload.custom_description:
            proj["description"] = payload.custom_description
        proj["featured"] = payload.featured or False
        proj["approved"] = True
        proj.pop("pending_since", None)
        projects = load(DATA_FILE, [])
        projects.append(proj)
        save(DATA_FILE, projects)
        return {"status": "approved", "project": proj["repo_name"]}
    return {"status": "rejected", "project": payload.repo_name}

@app.get("/api/certificates")
async def get_certs():
    return {"certificates": load(CERTS_FILE, [])}

@app.post("/api/certificates")
async def add_cert(cert: Certificate):
    certs = load(CERTS_FILE, [])
    entry = cert.dict()
    entry["id"] = f"cert_{len(certs)+1}"
    certs.append(entry)
    save(CERTS_FILE, certs)
    return {"status": "added", "certificate": entry}

@app.get("/api/sync-github")
async def sync_github():
    try:
        async with httpx.AsyncClient(timeout=12) as client:
            resp = await client.get(
                f"https://api.github.com/users/{GITHUB_USER}/repos",
                headers={"Accept": "application/vnd.github.v3+json"},
                params={"per_page": 100, "sort": "updated"}
            )
            repos = resp.json() if resp.status_code == 200 else []
    except Exception:
        repos = []

    existing   = {p["repo_name"] for p in load(DATA_FILE, [])}
    pending    = load(PENDING_FILE, [])
    pend_names = {p["repo_name"] for p in pending}
    skip       = {GITHUB_USER}

    new_repos = []
    for repo in repos:
        if not isinstance(repo, dict): continue
        name = repo.get("name", "")
        if name in skip or name in existing or name in pend_names: continue
        lang = repo.get("language")
        new_repos.append({
            "repo_name":   name,
            "name":        name.replace("-", " ").replace("_", " "),
            "description": repo.get("description") or f"{name} — a project by Raunak Das",
            "github_url":  repo["html_url"],
            "language":    lang or "Python",
            "stars":       repo.get("stargazers_count", 0),
            "updated_at":  repo.get("updated_at", "")[:10],
            "tags":        [lang] if lang else ["Python"],
            "metrics":     [],
            "featured":    False,
            "category":    LANG_TO_CAT.get(lang, "Project"),
            "approved":    True,
        })

    if new_repos:
        projects = load(DATA_FILE, [])
        projects.extend(new_repos)
        save(DATA_FILE, projects)

    return {
        "found":   len(new_repos),
        "new":     [r["repo_name"] for r in new_repos],
        "message": f"Added {len(new_repos)} new repo(s)." if new_repos else "Already up to date."
    }

@app.post("/api/chat")
async def chat(payload: ChatMessage):
    groq_key = os.environ.get("GROQ_API_KEY", "")
    if not groq_key:
        return JSONResponse(
            status_code=503,
            content={"detail": "Chatbot disabled: GROQ_API_KEY is not set. Add GROQ_API_KEY to your environment or .env file."}
        )
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {groq_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "temperature": 0.65,
                "max_tokens": 800,
                "messages": [
                    {"role": "system", "content": payload.system or ""},
                    *payload.messages
                ]
            }
        )
        return resp.json()

@app.get("/api/health")
async def health():
    return {"status": "ok", "time": datetime.now().isoformat()}


@app.get('/resume', response_class=HTMLResponse)
async def resume(request: Request):
    return templates.TemplateResponse('resume.html', {'request': request})


@app.get('/resume-view', response_class=HTMLResponse)
async def resume_view(request: Request):
    return templates.TemplateResponse('resume_view.html', {'request': request})