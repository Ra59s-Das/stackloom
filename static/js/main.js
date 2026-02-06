/* ═══════════════════════════════════════════════════
   RAUNAK DAS PORTFOLIO — main.js
   · Custom cursor
   · Nav scroll + active links
   · Page loader
   · Scroll progress bar
   · Scroll reveal (blur + stagger)
   · Magnetic buttons
   · Card tilt on hover
   · Text scramble on headings
   · Particle canvas (hero bg)
   · Stat counter
   · Projects render + filter
   · Certificates render
   · Modal
   · Contact form
   ═══════════════════════════════════════════════════ */

/* ── CURSOR ──────────────────────────────────────── */
const cur  = document.getElementById('cur');
const curR = document.getElementById('cur-r');
let cx = 0, cy = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  cx = e.clientX; cy = e.clientY;
  cur.style.left = cx + 'px';
  cur.style.top  = cy + 'px';
});
(function loopCursor() {
  rx += (cx - rx) * .1;
  ry += (cy - ry) * .1;
  curR.style.left = rx + 'px';
  curR.style.top  = ry + 'px';
  requestAnimationFrame(loopCursor);
})();

/* ── PAGE LOADER ─────────────────────────────────── */
window.addEventListener('load', () => {
  const loader = document.getElementById('pageLoader');
  if (loader) setTimeout(() => loader.remove(), 2200);
});

/* ── SCROLL PROGRESS BAR ─────────────────────────── */
const prog = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const pct = (scrollY / (document.body.scrollHeight - innerHeight)) * 100;
  if (prog) prog.style.width = pct + '%';
  document.getElementById('nav').classList.toggle('sc', scrollY > 50);

  // Active nav links
  document.querySelectorAll('.nav-ul a').forEach(a => {
    const sec = document.querySelector(a.getAttribute('href'));
    if (!sec) return;
    const { top, bottom } = sec.getBoundingClientRect();
    a.classList.toggle('active', top <= 80 && bottom >= 80);
  });

  // Footer reveal
  const footer = document.querySelector('footer');
  if (footer && footer.getBoundingClientRect().top < innerHeight)
    footer.classList.add('in');
});

/* ── MOBILE NAV ──────────────────────────────────── */
document.getElementById('ham').addEventListener('click', () =>
  document.getElementById('mobMenu').classList.toggle('on')
);
window.mClose = () => document.getElementById('mobMenu').classList.remove('on');

/* ── SCROLL REVEAL ───────────────────────────────── */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');

    if (e.target.hasAttribute('data-bars')) {
      e.target.querySelectorAll('.bar-row').forEach((row, i) => {
        setTimeout(() => row.querySelector('.bar-fill').style.width = row.dataset.p + '%', i * 120 + 200);
      });
    }
    if (e.target.classList.contains('sec-h') && !e.target.dataset.scrambled) {
      e.target.dataset.scrambled = '1';
      scrambleText(e.target);
    }
  });
}, { threshold: .12 });

document.querySelectorAll('.rv,.tl-row,.edu-c,.proj-card,.cert-c,[data-bars],.sec-h,.sec-tag')
  .forEach(el => obs.observe(el));

/* ── TEXT SCRAMBLE ───────────────────────────────── */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
function scrambleText(el) {
  const original = el.innerHTML;
  let iter = 0;
  const total = el.textContent.length * 2;
  const iv = setInterval(() => {
    el.innerHTML = original.replace(/[A-Z]/g, (ch, idx) =>
      idx < iter ? ch : CHARS[Math.floor(Math.random() * CHARS.length)]
    );
    iter += 2;
    if (iter >= total) { el.innerHTML = original; clearInterval(iv); }
  }, 28);
}

/* ── MAGNETIC BUTTONS ────────────────────────────── */
function addMagnetic(el) {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.18}px,${(e.clientY-r.top-r.height/2)*.18}px)`;
  });
  el.addEventListener('mouseleave', () => el.style.transform = '');
}
document.querySelectorAll('.btn-pri,.btn-sec,.sync-btn,.cert-btn').forEach(addMagnetic);

/* ── CARD TILT ───────────────────────────────────── */
function addTilt(el) {
  el.addEventListener('mousemove', e => {
    const r  = el.getBoundingClientRect();
    const mx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
    const my = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
    el.style.transform = `perspective(800px) rotateY(${mx*4}deg) rotateX(${-my*3}deg) translateZ(6px) translateY(-4px)`;
  });
  el.addEventListener('mouseleave', () => el.style.transform = '');
}

/* ── PARTICLE CANVAS ─────────────────────────────── */
(function initParticles() {
  const hero = document.getElementById('hero');
  if (!hero) return;
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:.45';
  hero.prepend(canvas);
  const ctx = canvas.getContext('2d');
  let W, H, pts;

  function resize() {
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }
  function mkPt() {
    return { x:Math.random()*W, y:Math.random()*H,
             vx:(Math.random()-.5)*.25, vy:(Math.random()-.5)*.18,
             r:Math.random()*1.2+.3, a:Math.random()*.3+.05 };
  }
  function init() { resize(); pts = Array.from({length:65}, mkPt); }
  function draw() {
    ctx.clearRect(0,0,W,H);
    pts.forEach(p => {
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0)p.x=W; if(p.x>W)p.x=0;
      if(p.y<0)p.y=H; if(p.y>H)p.y=0;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(122,175,196,${p.a})`; ctx.fill();
    });
    for(let i=0;i<pts.length;i++) {
      for(let j=i+1;j<pts.length;j++) {
        const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y;
        const d=Math.sqrt(dx*dx+dy*dy);
        if(d<90){
          ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y);
          ctx.strokeStyle=`rgba(122,175,196,${.07*(1-d/90)})`; ctx.lineWidth=.5; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  init(); draw();
  window.addEventListener('resize', init);
})();

/* ── STAT COUNTER ────────────────────────────────── */
const sv = document.getElementById('sv1');
if (sv) {
  new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    let s = 0;
    (function run(t) {
      if (!s) s = t;
      const p = Math.min((t-s)/1200,1);
      sv.textContent = Math.floor(p*2);
      p < 1 ? requestAnimationFrame(run) : (sv.textContent = '2');
    })(performance.now());
  }, { threshold:.5 }).observe(sv);
}

/* ── PROJECTS ────────────────────────────────────── */
const PROJECTS = [
  { n:'F1 Dominance Analytics', d:'Built a custom Team Dominance Index (TDI) from 1,000+ race entries spanning 1950–2025. Dynamic dashboards for era-wise comparison and strategic reporting.', tags:['Python','Pandas','Matplotlib','Seaborn'], m:['1,000+ race entries','75 years of F1 data'], cat:'Data Science', f:true, gh:'https://github.com/Ra59s-Das/F1_Dominance_Analytics' },
  { n:'Fraud Detection Pipeline', d:'End-to-end ML pipeline on 280K+ real transactions. Random Forest hitting 98% ROC-AUC and 0.92 F1-Score with 15+ engineered features.', tags:['Python','Scikit-learn','Pandas','Random Forest'], m:['98% ROC-AUC','0.92 F1-Score','280K+ transactions'], cat:'Machine Learning', f:true, gh:'https://github.com/Ra59s-Das/FraudDetectionPipeline' },
  { n:'Trader Behaviour Insights', d:'Analysed how Fear & Greed Index shapes trader profitability. Python + Power BI dashboards revealing sentiment-performance correlations.', tags:['Python','Pandas','Power BI','NumPy'], m:['Fear/Greed analysis','Power BI dashboards'], cat:'Data Analytics', f:true, gh:'https://github.com/Ra59s-Das/Trader_Behaviour_Insights' },
  { n:'HackVerse Platform', d:'15+ FastAPI AI microservice endpoints, automated room allocation (30% less manual work), TypeScript + shadcn/UI frontend.', tags:['TypeScript','FastAPI','Python','Tailwind CSS'], m:['25% fewer errors','30% less manual work','15+ endpoints'], cat:'Full-Stack', f:true, gh:'https://github.com/Ra59s-Das/Quack-Quack' },
  { n:'SkyMonk Weather App', d:'Clean weather app deployed live on Vercel. Responsive HTML/CSS/JS with real-time weather data.', tags:['HTML','CSS','JavaScript'], m:['Live on Vercel','Responsive'], cat:'Web App', f:false, gh:'https://github.com/Ra59s-Das/SkyMonk', live:'https://sky-monk.vercel.app' },
  { n:'To-Do App', d:'Full-stack task manager with Python backend and clean HTML/CSS/JS frontend. Persistent storage, minimal interface.', tags:['Python','HTML','CSS'], m:['Python backend','Full-stack'], cat:'Web App', f:false, gh:'https://github.com/Ra59s-Das/To--Do' }
];

let activeFilter = 'all';
function renderProjects() {
  const show = activeFilter==='all' ? PROJECTS : PROJECTS.filter(p=>p.cat===activeFilter);
  document.getElementById('pg').innerHTML = show.map((p,i) => `
    <div class="proj-card" style="transition-delay:${i*.06}s">
      ${p.f?'<div class="feat-mark">Featured</div>':''}
      <div class="proj-idx">0${i+1}</div>
      <span class="proj-cat">${p.cat}</span>
      <div class="proj-name">${p.n}</div>
      <p class="proj-desc">${p.d}</p>
      <div class="proj-tags">${p.tags.map(t=>`<span class="proj-tag">${t}</span>`).join('')}</div>
      <div class="proj-metrics">${p.m.map(m=>`<div class="proj-m">${m}</div>`).join('')}</div>
      <div class="proj-links">
        <a href="${p.gh}" target="_blank" class="proj-a">GitHub ↗</a>
        ${p.live?`<a href="${p.live}" target="_blank" class="proj-a">Live ↗</a>`:''}
      </div>
    </div>`).join('');
  setTimeout(() => {
    document.querySelectorAll('.proj-card').forEach((c,i) =>
      setTimeout(() => { c.classList.add('in'); obs.observe(c); addTilt(c); }, i*60)
    );
  }, 60);
}
renderProjects();
document.querySelectorAll('.fb').forEach(btn => btn.addEventListener('click', function() {
  document.querySelectorAll('.fb').forEach(b=>b.classList.remove('on'));
  this.classList.add('on'); activeFilter=this.dataset.f; renderProjects();
}));
window.doSync = async () => {
  const btn  = document.querySelector('.sync-btn');
  const info = document.getElementById('si');
  btn.style.opacity = '.5';
  info.textContent = 'Syncing…';
  try {
    const res  = await fetch('/api/sync-github');
    const data = await res.json();
    info.textContent = data.message;
    if (data.found > 0) {
      // Reload projects from server
      const pr = await fetch('/api/projects');
      const pd = await pr.json();
      if (pd.projects && pd.projects.length) {
        PROJECTS.length = 0;
        pd.projects.forEach(p => PROJECTS.push({
          n: p.name || p.repo_name,
          d: p.description,
          tags: p.tags || [],
          m: p.metrics || [],
          cat: p.category || 'Project',
          f: p.featured || false,
          gh: p.github_url,
          live: p.live_url || null
        }));
        renderProjects();
      }
    }
  } catch {
    info.textContent = 'Sync failed — is the server running?';
  }
  btn.style.opacity = '1';
  setTimeout(() => { info.textContent = ''; }, 5000);
};

/* ── CERTIFICATES (loaded from /api/certificates → data/certificates.json) ── */
async function loadCerts() {
  let certs = [];
  try {
    const res  = await fetch('/api/certificates');
    const data = await res.json();
    certs = data.certificates || [];
  } catch {
    // fallback if server unreachable
    certs = [];
  }

  const grid = document.getElementById('cg');
  if (!certs.length) {
    grid.innerHTML = '<p style="color:var(--ink4);font-size:13px">No certificates found. Add entries to data/certificates.json</p>';
    return;
  }

  grid.innerHTML = certs.map((c, i) => `
    <div class="cert-c" style="transition-delay:${i * .12}s">
      <div class="cert-iss" style="color:${c.color || '#7aafc4'}">${c.issuer}</div>
      <div class="cert-title">${c.title}</div>
      <div class="cert-year">${c.date}</div>
      <p class="cert-desc">${c.description || ''}</p>
      <button class="cert-btn" onclick='openModal(${JSON.stringify(c).replace(/'/g, "&#39;").replace(/"/g, "&quot;")})'>
        View Certificate ↗
      </button>
    </div>`).join('');

  setTimeout(() => document.querySelectorAll('.cert-c, .edu-c').forEach(el => obs.observe(el)), 100);
}
loadCerts();

/* ── CERT MODAL ──────────────────────────────────── */
window.openModal = cert => {
  const imageBlock = cert.image_url
    ? `<img src="${cert.image_url}" alt="${cert.title}"
            style="width:100%;display:block;border-radius:4px;
                   margin-bottom:22px;border:1px solid var(--line);
                   cursor:zoom-in"
            onclick="window.open('${cert.image_url}','_blank')">`
    : `<div style="width:100%;aspect-ratio:16/9;background:var(--bg3);
                    border:1px solid var(--line);display:flex;flex-direction:column;
                    align-items:center;justify-content:center;margin-bottom:22px;gap:10px">
         <div style="font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--ink4)">No Image Added</div>
         <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:.06em;color:var(--ink)">${cert.title}</div>
         <div style="font-size:10px;color:var(--ink4)">Add image_url to data/certificates.json</div>
       </div>`;

  const verifyBtn = cert.credential_url
    ? `<a href="${cert.credential_url}" target="_blank"
          style="display:inline-flex;align-items:center;gap:8px;background:var(--ac);
                 color:var(--c900);padding:10px 22px;font-size:11px;font-weight:700;
                 letter-spacing:.1em;text-transform:uppercase;text-decoration:none;margin-top:16px">
         Verify Credential ↗
       </a>`
    : '';

  document.getElementById('modCon').innerHTML = `
    <div style="font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;
                color:${cert.color || '#7aafc4'};margin-bottom:14px">${cert.issuer}</div>
    <h2 style="font-family:'Bebas Neue',sans-serif;font-size:34px;letter-spacing:.04em;
               color:var(--ink);margin-bottom:5px;line-height:1">${cert.title}</h2>
    <p style="font-size:11px;font-weight:500;color:var(--ink4);margin-bottom:20px;
              letter-spacing:.06em">${cert.issuer} · ${cert.date}</p>
    ${imageBlock}
    <p style="font-size:14px;font-weight:300;color:var(--c200);line-height:1.85">${cert.description || ''}</p>
    ${verifyBtn}`;

  document.getElementById('modBg').classList.add('on');
};
window.modClose = () => document.getElementById('modBg').classList.remove('on');
document.getElementById('modBg').addEventListener('click', e => { if(e.target.id==='modBg') window.modClose(); });

/* ── CONTACT FORM ────────────────────────────────── */
document.getElementById('cForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const btn=this.querySelector('.btn-pri'), orig=btn.innerHTML;
  btn.textContent='✓ Sent!'; btn.style.background='#5a9e6a';
  setTimeout(()=>{ btn.innerHTML=orig; btn.style.background=''; this.reset(); },3000);
});

/* ── SMOOTH SCROLL ───────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior:'smooth', block:'start' });
    window.mClose();
  });
});

/* ── EDUCATION CARD CANVAS ANIMATIONS ───────────── */
function initEduCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, pts;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  function mkPt() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
      r: Math.random() * .8 + .2,
      a: Math.random() * .2 + .03
    };
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(122,175,196,${p.a})`; ctx.fill();
    });
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 70) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(122,175,196,${.05 * (1 - d/70)})`;
          ctx.lineWidth = .5; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  resize();
  pts = Array.from({ length: 30 }, mkPt);
  draw();
  window.addEventListener('resize', () => { resize(); pts = Array.from({ length: 30 }, mkPt); });
}

// Init canvas on each edu card when it enters view
const eduObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const canvas = e.target.querySelector('.edu-bg-canvas');
    if (canvas && !canvas.dataset.init) {
      canvas.dataset.init = '1';
      initEduCanvas(canvas);
    }
  });
}, { threshold: .1 });
document.querySelectorAll('.edu-c').forEach(el => eduObs.observe(el));