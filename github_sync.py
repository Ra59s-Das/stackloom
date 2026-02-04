"""
github_sync.py — Detect new GitHub repos and add to approval queue.

Usage:
  python github_sync.py            # Check for new repos
  python github_sync.py --approve  # Interactive approval CLI
  python github_sync.py --list     # Show approved + pending
"""

import json, sys, os, httpx
from datetime import datetime
from pathlib import Path

GITHUB_USER  = "Ra59s-Das"
DATA_FILE    = "data/projects.json"
PENDING_FILE = "data/pending.json"

Path("data").mkdir(exist_ok=True)

LANG_TO_CAT = {
    "Python": "Data Science", "Jupyter Notebook": "Data Science",
    "TypeScript": "Full-Stack", "JavaScript": "Web App",
    "HTML": "Web App", "Java": "Backend", None: "Project"
}

def load(path, default=None):
    if default is None: default = []
    return json.load(open(path)) if os.path.exists(path) else default

def save(path, data):
    with open(path, "w") as f: json.dump(data, f, indent=2)

def fetch_repos():
    print(f"  Fetching repos for @{GITHUB_USER}...")
    try:
        r = httpx.get(
            f"https://api.github.com/users/{GITHUB_USER}/repos",
            headers={"Accept": "application/vnd.github.v3+json"},
            params={"per_page": 100, "sort": "updated"},
            timeout=15
        )
        if r.status_code == 200:
            return r.json()
        print(f"  GitHub API returned {r.status_code}")
    except Exception as e:
        print(f"  Error: {e}")
    return []

def check():
    repos    = fetch_repos()
    existing = {p["repo_name"] for p in load(DATA_FILE)}
    pending  = load(PENDING_FILE)
    pend_names = {p["repo_name"] for p in pending}
    skip     = {GITHUB_USER}

    new = []
    for repo in repos:
        name = repo["name"]
        if name in skip or name in existing or name in pend_names:
            continue
        lang = repo.get("language")
        new.append({
            "repo_name":    name,
            "description":  repo.get("description") or f"{name} — a project by Raunak Das",
            "github_url":   repo["html_url"],
            "language":     lang or "Python",
            "stars":        repo.get("stargazers_count", 0),
            "updated_at":   repo.get("updated_at", ""),
            "tags":         [lang] if lang else ["Python"],
            "metrics":      [],
            "featured":     False,
            "category":     LANG_TO_CAT.get(lang, "Project"),
            "pending_since": datetime.now().isoformat()
        })

    if new:
        pending.extend(new)
        save(PENDING_FILE, pending)
        print(f"\n  Found {len(new)} new repo(s) — added to pending queue:")
        for r in new:
            print(f"    + {r['repo_name']}  [{r['language']}]")
        print(f"\n  Run with --approve to review them.")
    else:
        print("  All repos are up to date.")

    print(f"\n  Approved: {len(load(DATA_FILE))}  |  Pending: {len(pending)}")

def approve():
    pending  = load(PENDING_FILE)
    projects = load(DATA_FILE)
    if not pending:
        print("  No pending projects."); return

    print(f"\n{'─'*52}")
    print(f"  APPROVE PROJECTS  ({len(pending)} pending)")
    print(f"{'─'*52}\n")

    approved = []
    for i, repo in enumerate(list(pending), 1):
        print(f"  [{i}/{len(pending)}]  {repo['repo_name']}")
        print(f"         {repo['github_url']}")
        print(f"         {repo['description'][:72]}...")
        print(f"         Lang: {repo['language']}  Stars: {repo['stars']}\n")

        choice = input("  Add to portfolio? [y / n / s=skip]: ").strip().lower()
        if choice == 'y':
            custom = input("  Custom description? (Enter to keep): ").strip()
            if custom: repo["description"] = custom
            repo["featured"] = input("  Featured? [y/n]: ").strip().lower() == 'y'
            repo["approved"] = True
            repo.pop("pending_since", None)
            projects.append(repo)
            approved.append(repo["repo_name"])
            pending = [p for p in pending if p["repo_name"] != repo["repo_name"]]
            print(f"  ✓ Added\n")
        elif choice == 'n':
            pending = [p for p in pending if p["repo_name"] != repo["repo_name"]]
            print(f"  ✗ Rejected\n")
        else:
            print(f"  → Skipped\n")

    save(DATA_FILE, projects)
    save(PENDING_FILE, pending)
    print(f"  Done. Approved: {len(approved)}  |  Still pending: {len(pending)}")

def list_all():
    projects = load(DATA_FILE)
    pending  = load(PENDING_FILE)
    print(f"\n  APPROVED ({len(projects)})")
    print(f"  {'─'*40}")
    for p in projects:
        star = "★ " if p.get("featured") else "  "
        print(f"  {star}{p['repo_name']}  [{p.get('category','?')}]")
    print(f"\n  PENDING ({len(pending)})")
    print(f"  {'─'*40}")
    for p in pending:
        print(f"    {p['repo_name']}  [{p['language']}]  since {p['pending_since'][:10]}")

if __name__ == "__main__":
    args = sys.argv[1:]
    if "--approve" in args: approve()
    elif "--list"   in args: list_all()
    else: check()
