# Raunak Das — Portfolio

## File Structure

```
portfolio/
│
├── app.py                      ← FastAPI server (run this)
├── github_sync.py              ← Detect & approve new GitHub repos
├── requirements.txt
│
├── templates/
│   └── index.html              ← HTML template (markup only)
│
├── static/
│   ├── css/
│   │   ├── main.css            ← All layout, colors, components
│   │   └── chatbot.css         ← Chatbot widget styles only
│   ├── js/
│   │   ├── main.js             ← Cursor, nav, scroll, projects, certs, contact
│   │   └── chatbot.js          ← AI chatbot logic only
│   └── images/
│       └── certificates/       ← Drop certificate images here
│           └── .gitkeep
│
├── python/
│   ├── resume_parser.py        ← Parse a PDF resume → JSON
│   └── github_stats.py         ← Fetch live GitHub stats
│
└── data/                       ← Auto-created on first run
    ├── projects.json           ← Approved portfolio projects
    ├── pending.json            ← Repos awaiting your approval
    ├── certificates.json       ← Your certifications
    └── github_stats.json       ← Cached GitHub stats
```

---

## Quick Start

```bash
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```
Open → http://localhost:8000

---

## Adding Your Photo

In `templates/index.html`, find the comment block inside `.hero-right` and replace:
```html
<!-- replace this block -->
<div class="photo-placeholder">...</div>
<div class="photo-note">...</div>
```
with:
```html
<img src="/static/images/raunak.jpg" alt="Raunak Das">
```
Then drop your photo into `static/images/raunak.jpg`.

---

## GitHub Sync

```bash
python github_sync.py            # Check for new repos
python github_sync.py --approve  # Review & approve in the CLI
python github_sync.py --list     # See all approved + pending
```

---

## Adding Certificates

Drop the certificate image into `static/images/certificates/` then:
```bash
curl -X POST http://localhost:8000/api/certificates \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Certificate Name",
    "issuer": "Issuing Body",
    "date": "2025",
    "description": "What you learned.",
    "image_url": "/static/images/certificates/your_cert.jpg",
    "credential_url": "https://verify.org/abc"
  }'
```

---

## Python Utilities

```bash
# Parse your resume PDF into structured JSON
python python/resume_parser.py path/to/resume.pdf

# Fetch live GitHub stats and update star counts
python python/github_stats.py
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Portfolio page |
| GET | `/api/projects` | Approved projects |
| GET | `/api/projects/pending` | Pending approval |
| POST | `/api/projects/approve` | Approve / reject a repo |
| GET | `/api/certificates` | All certificates |
| POST | `/api/certificates` | Add a certificate |
| GET | `/api/health` | Health check |
