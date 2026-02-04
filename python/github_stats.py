"""
github_stats.py — Fetch live GitHub stats (stars, forks, languages)
and update the portfolio data cache.

Usage:
  python github_stats.py
"""

import json, httpx, os
from pathlib import Path

GITHUB_USER = "Ra59s-Das"
DATA_FILE   = "data/projects.json"
STATS_FILE  = "data/github_stats.json"

Path("data").mkdir(exist_ok=True)

def fetch_stats():
    base = f"https://api.github.com/users/{GITHUB_USER}"
    headers = {"Accept": "application/vnd.github.v3+json"}

    with httpx.Client(timeout=15, headers=headers) as client:
        user  = client.get(base).json()
        repos = client.get(f"{base}/repos", params={"per_page": 100}).json()

    total_stars = sum(r.get("stargazers_count", 0) for r in repos if isinstance(r, dict))
    total_forks = sum(r.get("forks_count", 0)       for r in repos if isinstance(r, dict))

    lang_counts = {}
    for r in repos:
        if isinstance(r, dict) and r.get("language"):
            lang_counts[r["language"]] = lang_counts.get(r["language"], 0) + 1

    stats = {
        "username":     GITHUB_USER,
        "public_repos": user.get("public_repos", 0),
        "followers":    user.get("followers", 0),
        "following":    user.get("following", 0),
        "total_stars":  total_stars,
        "total_forks":  total_forks,
        "top_languages": sorted(lang_counts.items(), key=lambda x: -x[1])[:5],
        "repos": [
            {
                "name":     r["name"],
                "stars":    r.get("stargazers_count", 0),
                "forks":    r.get("forks_count", 0),
                "language": r.get("language"),
                "url":      r["html_url"],
                "updated":  r.get("updated_at", "")[:10]
            }
            for r in repos if isinstance(r, dict) and r["name"] != GITHUB_USER
        ]
    }

    with open(STATS_FILE, "w") as f:
        json.dump(stats, f, indent=2)

    print(f"\n  GitHub Stats for @{GITHUB_USER}")
    print(f"  {'─'*36}")
    print(f"  Public repos : {stats['public_repos']}")
    print(f"  Total stars  : {stats['total_stars']}")
    print(f"  Followers    : {stats['followers']}")
    print(f"  Top languages: {', '.join(l for l,_ in stats['top_languages'])}")
    print(f"\n  Saved → {STATS_FILE}")

    # Patch stars into projects cache
    if os.path.exists(DATA_FILE):
        projects = json.load(open(DATA_FILE))
        repo_map = {r["name"]: r for r in stats["repos"]}
        for p in projects:
            if p["repo_name"] in repo_map:
                p["stars"] = repo_map[p["repo_name"]]["stars"]
        with open(DATA_FILE, "w") as f:
            json.dump(projects, f, indent=2)
        print(f"  Updated star counts in {DATA_FILE}")

if __name__ == "__main__":
    fetch_stats()
