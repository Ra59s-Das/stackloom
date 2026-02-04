"""
resume_parser.py — Extract structured data from a PDF resume
and auto-populate the portfolio data files.

Usage:
  pip install pdfplumber
  python resume_parser.py resume.pdf
"""

import json, re, sys
from pathlib import Path

DATA_FILE = "data/projects.json"
Path("data").mkdir(exist_ok=True)

def parse_resume(pdf_path: str) -> dict:
    try:
        import pdfplumber
    except ImportError:
        print("  Install pdfplumber first:  pip install pdfplumber")
        sys.exit(1)

    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""

    return {
        "raw_text": text,
        "email":    _find(r"[\w.+-]+@[\w-]+\.[a-z]{2,}", text),
        "phone":    _find(r"[\+\d][\d\s\-]{9,}", text),
        "linkedin": _find(r"linkedin\.com/in/[\w\-]+", text),
        "github":   _find(r"github\.com/[\w\-]+", text),
        "skills":   _extract_skills(text),
        "education":_extract_education(text),
    }

def _find(pattern, text):
    m = re.search(pattern, text, re.IGNORECASE)
    return m.group(0) if m else None

def _extract_skills(text):
    keywords = [
        "Python","Java","SQL","FastAPI","Django","Pandas","NumPy",
        "Matplotlib","Seaborn","Scikit-learn","BeautifulSoup","Selenium",
        "Playwright","Pyppeteer","Asyncio","AWS","MongoDB","PostgreSQL",
        "MySQL","Power BI","Excel","Cognos","REST","Microservice"
    ]
    return [k for k in keywords if k.lower() in text.lower()]

def _extract_education(text):
    entries = []
    for line in text.split("\n"):
        if any(w in line for w in ["B.Tech","B.E.","M.Tech","MBA","Class XII","Senior School"]):
            entries.append(line.strip())
    return entries

def run(pdf_path: str):
    print(f"\n  Parsing: {pdf_path}")
    data = parse_resume(pdf_path)

    print(f"  Email:    {data['email']}")
    print(f"  LinkedIn: {data['linkedin']}")
    print(f"  GitHub:   {data['github']}")
    print(f"  Skills:   {', '.join(data['skills'][:8])}...")
    print(f"  Education lines found: {len(data['education'])}")

    out = {k: v for k, v in data.items() if k != "raw_text"}
    out_path = "data/resume_parsed.json"
    with open(out_path, "w") as f:
        json.dump(out, f, indent=2)
    print(f"\n  Saved parsed data → {out_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python resume_parser.py resume.pdf")
        sys.exit(1)
    run(sys.argv[1])
