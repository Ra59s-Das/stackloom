/* ═══════════════════════════════════════════════════
   RAUNAK DAS PORTFOLIO — chatbot.js
   AI assistant powered by Groq (Llama 3 70B)

   ► HOW TO SET YOUR API KEY:
     1. Go to https://console.groq.com
     2. Sign up (free) → API Keys → Create API Key
     3. Paste your key below replacing the placeholder
   ═══════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════
   RAUNAK DAS PORTFOLIO — chatbot.js
   AI assistant powered by backend Groq proxy
════════════════════════════════════════════════════ */

const SYSTEM_PROMPT = `You are the personal AI assistant on Raunak Das's portfolio website.
Answer questions about Raunak clearly and concisely — 2 to 3 sentences max unless more detail is needed.
Be direct and confident.

RAUNAK DAS — FULL PROFILE:

Personal:
- Location: Kolkata, West Bengal, India
- Email: raunakd35@gmail.com
- LinkedIn: linkedin.com/in/raunak-das
- GitHub: github.com/Ra59s-Das (11 repos)
- Languages: English (Professional), Hindi (Advanced), Bengali (Native)
- Hobbies: Competitive Football, Strategic Chess, AI/ML, Quantitative Analytics

Education:
- B.Tech CST, UEM Kolkata, Aug 2022–Jul 2026 (graduating soon)
- Class XII CBSE, Amrita Vidyalayam Kolkata, 2022
- Certifications: AI/ML with IBM SkillBuild (Edunet Foundation), Database for Developers (Oracle)

Skills:
- Python 95%, SQL 85%, Power BI 85%, Excel/Sheets 90%, Java 70%, IBM Cognos 70%
- Frameworks: FastAPI, Django, REST APIs, Microservices
- Libraries: Pandas, NumPy, Scikit-learn, Matplotlib, Seaborn, BeautifulSoup, Requests
- Automation: Selenium, Playwright, Pyppeteer, Asyncio
- Cloud/DB: AWS, MongoDB, PostgreSQL, MySQL

Work Experience:
1. OGGANGS Pvt. Ltd. — Software Engineering Intern (Dec 2025–Mar 2026)
   - 2.5M+ record pipelines with Selenium/Playwright/Pyppeteer/BS4
   - Optimised Django Data Fetcher module
   - FastAPI microservices reducing API latency
   - Worked with global engineering teams on sprint deliverables

2. Humans of Football — Data Analytics Intern (May–Aug 2025)
   - 5,000+ record analysis with Python, Pandas, Excel
   - 10+ Power BI dashboards for player performance
   - A/B testing → 20% operational efficiency increase
   - Presented findings directly to senior leadership

GitHub Projects:
1. F1_Dominance_Analytics — TDI algorithm, 1000+ race entries, 1950–2025, Python/Pandas/Matplotlib
2. FraudDetectionPipeline — Random Forest, 280K+ transactions, 98% ROC-AUC, 0.92 F1-Score
3. Trader_Behaviour_Insights — Fear & Greed Index vs trader profitability, Python + Power BI
4. Quack-Quack (HackVerse) — 15+ FastAPI endpoints, automated room allocation, TypeScript frontend
5. SkyMonk — Weather app, live at sky-monk.vercel.app, HTML/CSS/JS
6. To--Do — Full-stack todo app, Python backend + HTML/CSS/JS frontend

Achievements:
- Volunteer Lead at Humans of Football: 10+ interns, 5+ events, 20% participation boost
- Award: Highest event conversion rate and record-breaking attendance
- GitHub badges: Pull Shark ×2, YOLO, Quickdraw

Availability: Open to full-time, internships, and freelance in software engineering, data analytics, Python development.

Style: Keep answers sharp. If something isn't in the profile, say so briefly and suggest emailing raunakd35@gmail.com.`;

let chatOpen = false;
let chatHistory = [];

const chatWin = document.getElementById('chatWin');
const chatFab = document.getElementById('cfab');
const chatMsgs = document.getElementById('chatMsgs');
const chatInput = document.getElementById('chatInp');
const icon1 = document.getElementById('ci1');
const icon2 = document.getElementById('ci2');
const chipsEl = document.getElementById('chatChips');

window.tChat = () => {
  chatOpen = !chatOpen;
  chatWin.classList.toggle('on', chatOpen);
  icon1.style.display = chatOpen ? 'none' : 'block';
  icon2.style.display = chatOpen ? 'block' : 'none';
  dismissIntro();
  if (chatOpen) setTimeout(() => chatInput.focus(), 300);
};

window.dismissIntro = () => {
  const el = document.getElementById('chatIntro');
  if (!el) return;
  el.style.opacity = '0';
  el.style.transition = 'opacity .25s';
  setTimeout(() => el.remove(), 260);
};

window.askC = (text) => {
  chatInput.value = text;
  chipsEl.style.display = 'none';
  sendChat();
};

function addMsg(text, type) {
  const div = document.createElement('div');
  div.className = `msg ${type}`;
  div.textContent = text;
  chatMsgs.appendChild(div);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'typing';
  div.id = 'ty';
  div.innerHTML = '<div class="td"></div><div class="td"></div><div class="td"></div>';
  chatMsgs.appendChild(div);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
}

function hideTyping() {
  document.getElementById('ty')?.remove();
}

async function sendChat() {
  const text = chatInput.value.trim();
  if (!text) return;

  chatInput.value = '';
  chipsEl.style.display = 'none';

  addMsg(text, 'usr');
  chatHistory.push({ role: 'user', content: text });
  showTyping();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        history: chatHistory,
        system_prompt: SYSTEM_PROMPT
      })
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    hideTyping();

    const reply = data.reply || 'Something went wrong — try again.';
    addMsg(reply, 'bot');
    chatHistory.push({ role: 'assistant', content: reply });

    if (chatHistory.length > 20) chatHistory = chatHistory.slice(-16);
  } catch (err) {
    hideTyping();
    addMsg('Connection error — please try again.', 'bot');
  }
}

window.sChat = sendChat;