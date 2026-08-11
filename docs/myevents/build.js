const fs = require('fs');
const path = require('path');

const MODS = [
  './s-public.js',
  './s-app.js',
  './s-studio.js',
  './s-guests.js',
  './s-memories.js',
  './s-mobile.js',
  './s-states.js',
];
let screens = [];
for (const m of MODS) {
  const p = path.join(__dirname, m);
  if (fs.existsSync(p)) screens = screens.concat(require(m));
}
screens.sort((a, b) => a.n.localeCompare(b.n));

const css = fs.readFileSync(path.join(__dirname, 'ds.css'), 'utf8');
const outDir = path.join(__dirname, 'screens');
fs.mkdirSync(outDir, { recursive: true });

const cssScreens = css.replace(/url\('fonts\//g, "url('../fonts/");

const page = (s) => `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>MyEvent's — ${s.n} ${s.title}</title><style>${cssScreens}
html,body{background:#fff}
#shot{width:${s.w}px;${s.h ? `min-height:${s.h}px;` : ''}}
</style></head><body>
<div id="shot" class="${s.cls || 'screen'}">${s.html}</div></body></html>`;

for (const s of screens)
  fs.writeFileSync(path.join(outDir, `${s.n}-${s.slug}.html`), page(s));

// ---------- carrousel navigable ----------
const toc = screens
  .map(
    (s) =>
      `<button class="tocb" data-i="${s.n}"><b>${s.n}</b><span>${s.title}</span></button>`,
  )
  .join('');
const slides = screens
  .map(
    (s) => `<section class="slide" id="s${s.n}">
  <div class="slide-head"><div class="sh-n">${s.n}<span>/ ${screens.length}</span></div>
  <div class="sh-t">${s.title}</div><div class="sh-g">${s.group || ''}</div></div>
  <div class="stage"><div class="frame ${s.cls || 'screen'}" style="width:${s.w}px">${s.html}</div></div></section>`,
  )
  .join('');

const index = `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>MyEvent's — Carrousel UI/UX (${screens.length} écrans)</title>
<style>${css}
body{background:#EDEAE3;font-family:var(--sans)}
#top{position:sticky;top:0;z-index:50;background:rgba(28,22,20,.96);backdrop-filter:blur(8px);
  padding:14px 26px;display:flex;align-items:center;gap:20px;border-bottom:1px solid rgba(255,255,255,.08)}
#top .wm{font-family:var(--serif);font-weight:500;font-size:18px;letter-spacing:3px;color:#F3EFE7}
#top .sub{font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#8C8478}
#top .sp{flex:1}
#top .nb{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);color:#F3EFE7;
  border-radius:9px;padding:7px 13px;font-size:12px;cursor:pointer;font-family:inherit}
#top .cnt{font-size:12px;color:#8C8478;min-width:74px;text-align:center}
#toc{display:flex;gap:6px;overflow-x:auto;padding:10px 26px;background:#1C1614;border-bottom:1px solid rgba(255,255,255,.08)}
.tocb{flex:0 0 auto;display:flex;gap:7px;align-items:center;background:transparent;border:1px solid rgba(255,255,255,.1);
  color:#8C8478;border-radius:8px;padding:6px 10px;font-size:11px;cursor:pointer;font-family:inherit;white-space:nowrap}
.tocb b{color:var(--go-500);font-weight:600}
.tocb.on{background:rgba(212,176,123,.14);border-color:rgba(212,176,123,.4);color:#F3EFE7}
.slide{padding:34px 0 54px;border-bottom:1px solid #DCD8CF}
.slide-head{max-width:1560px;margin:0 auto 18px;padding:0 26px;display:flex;align-items:baseline;gap:16px}
.sh-n{font-family:var(--serif);font-size:30px;color:var(--bx-700)}
.sh-n span{font-size:13px;color:var(--n-400);font-family:var(--sans);margin-left:6px}
.sh-t{font-size:19px;font-weight:600;color:var(--n-900)}
.sh-g{font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:var(--n-500);margin-left:auto}
.stage{display:flex;justify-content:center;padding:0 26px}
.frame{box-shadow:0 30px 70px -24px rgba(28,22,20,.35);border-radius:14px;overflow:hidden;background:#fff}
</style></head><body>
<div id="top"><div><div class="wm">MYEVENT’S</div><div class="sub">Carrousel UI/UX · ${screens.length} écrans</div></div>
<div class="sp"></div>
<button class="nb" id="prev">← Précédent</button><span class="cnt" id="cnt">01 / ${screens.length}</span>
<button class="nb" id="next">Suivant →</button></div>
<div id="toc">${toc}</div>
${slides}
<script>
const secs=[...document.querySelectorAll('.slide')];
const tocbs=[...document.querySelectorAll('.tocb')];
const tocEl=document.getElementById('toc');
const cntEl=document.getElementById('cnt');
const OFFSET=104;           // hauteur de l'en-tête collant
let i=0, lock=0;            // lock = ignore le scroll pendant une navigation

function mark(){
  cntEl.textContent=String(i+1).padStart(2,'0')+' / '+secs.length;
  tocbs.forEach((b,k)=>b.classList.toggle('on',k===i));
  const b=tocbs[i];
  if(b) tocEl.scrollLeft = b.offsetLeft - tocEl.clientWidth/2 + b.offsetWidth/2;
}
function go(k){
  i=Math.max(0,Math.min(secs.length-1,k));
  lock=Date.now()+900;
  window.scrollTo({top:Math.max(0,secs[i].offsetTop-OFFSET),behavior:'smooth'});
  mark();
}
document.getElementById('prev').onclick=()=>go(i-1);
document.getElementById('next').onclick=()=>go(i+1);
tocbs.forEach((b,k)=>b.onclick=()=>go(k));
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
  if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();go(i+1)}
  if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();go(i-1)}
  if(e.key==='Home'){e.preventDefault();go(0)}
  if(e.key==='End'){e.preventDefault();go(secs.length-1)}
});
addEventListener('scroll',()=>{
  if(Date.now()<lock) return;                 // navigation en cours : on ne touche pas à l'index
  const y=scrollY+OFFSET+40;
  let k=0;
  for(let j=0;j<secs.length;j++){ if(secs[j].offsetTop<=y) k=j; else break; }
  if(k!==i){ i=k; mark(); }
},{passive:true});
mark();
</script></body></html>`;

fs.writeFileSync(path.join(__dirname, 'MyEvents-carrousel.html'), index);
console.log('OK — ' + screens.length + ' écrans');
console.log(
  screens
    .map((s) => s.n + ' ' + s.title + ' (' + s.w + '×' + (s.h || 'auto') + ')')
    .join('\n'),
);
