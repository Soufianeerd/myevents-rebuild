// MyEvent's — bibliothèque de composants partagés (icônes, shell, invitation…)

const P = {
  dashboard:
    '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  calendar:
    '<rect x="3" y="4" width="18" height="18" rx="2.5"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2.5"/><path d="m22 7-10 6L2 7"/>',
  wand: '<path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8 19 13M17.8 6.2 19 5M3 21l9-9M12.2 6.2 11 5"/>',
  layers:
    '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  checkc:
    '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="3" width="7" height="7" rx="1.2"/><rect x="3" y="14" width="7" height="7" rx="1.2"/><path d="M14 14h3v3h-3zM21 14v.01M14 21v.01M18 21h3v-3"/>',
  image:
    '<rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="9" cy="9" r="2"/><path d="m21 15-4.5-4.5L5 21"/>',
  mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="3" width="7" height="7" rx="1.2"/><rect x="3" y="14" width="7" height="7" rx="1.2"/><rect x="14" y="14" width="7" height="7" rx="1.2"/>',
  chart: '<path d="M3 3v18h18"/><path d="M8 17v-5M13 17V8M18 17v-8"/>',
  heart:
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1.2"/><path d="M12 8v13M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  settings:
    '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>',
  cdown: '<path d="m6 9 6 6 6-6"/>',
  cright: '<path d="m9 18 6-6-6-6"/>',
  cleft: '<path d="m15 18-6-6 6-6"/>',
  cup: '<path d="m18 15-6-6-6 6"/>',
  updown: '<path d="m7 15 5 5 5-5M7 9l5-5 5 5"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  download:
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  upload:
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  share:
    '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3Z"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  grip: '<circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/>',
  undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>',
  redo: '<path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/>',
  monitor:
    '<rect x="2" y="3" width="20" height="14" rx="2.5"/><path d="M8 21h8M12 17v4"/>',
  tablet:
    '<rect x="4" y="2" width="16" height="20" rx="2.5"/><path d="M12 18h.01"/>',
  phone:
    '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M12 18h.01"/>',
  play: '<path d="m7 3 13 9-13 9V3Z"/>',
  pause:
    '<rect x="6" y="4" width="4" height="16" rx="1.2"/><rect x="14" y="4" width="4" height="16" rx="1.2"/>',
  trash:
    '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2.5"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  alert:
    '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  sparkle:
    '<path d="m12 3 1.9 5.8L20 10.7l-5.1 3.6L16 21l-4-3.2L8 21l1.1-6.7L4 10.7l6.1-1.9L12 3Z"/>',
  globe:
    '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  aright: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  aleft: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  video:
    '<rect x="2" y="6" width="14" height="12" rx="2.5"/><path d="m22 8-6 4 6 4V8Z"/>',
  pen: '<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"/>',
  camera:
    '<path d="M14.5 4h-5L8 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-4l-1.5-2Z"/><circle cx="12" cy="13" r="3.5"/>',
  palette:
    '<path d="M12 22a10 10 0 1 1 10-10c0 2-1.6 3-3.5 3H16a2 2 0 0 0-1.4 3.4A2 2 0 0 1 13 22h-1Z"/><circle cx="7.5" cy="10.5" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16.5" cy="10.5" r="1"/>',
  type: '<path d="M4 7V5h16v2M9 19h6M12 5v14"/>',
  history:
    '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  sliders:
    '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/>',
  building:
    '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M9 6h.01M15 6h.01M9 10h.01M15 10h.01M9 14h.01M15 14h.01"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"/><path d="M14 2v6h6"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/>',
  logout:
    '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  wallet:
    '<path d="M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v1"/><rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M16 13h3"/>',
  ring: '<circle cx="12" cy="14" r="6"/><path d="m9 5 3-3 3 3-3 3-3-3Z"/>',
  cake: '<path d="M4 20h16v-6a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v6Z"/><path d="M12 6V3M8 7V5M16 7V5M2 20h20"/>',
  baby: '<circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01M9 15a4 4 0 0 0 6 0"/>',
  briefcase:
    '<rect x="2" y="7" width="20" height="14" rx="2.5"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M2 12h20"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 4 13c0-6 8-11 16-11 0 8-4 16-9 18Z"/><path d="M4 21c3-6 6-9 11-11"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  minus: '<path d="M5 12h14"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  maximize:
    '<path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3"/>',
  hand: '<path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v7M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8v-1a2 2 0 1 1 4 0"/>',
  cursor: '<path d="m4 3 7 17 2.5-6.5L20 11 4 3Z"/>',
  zin: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M8 11h6M11 8v6"/>',
  zout: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M8 11h6"/>',
};

const ic = (n, cls = 'i16') =>
  `<svg class="ic ${cls}" viewBox="0 0 24 24">${P[n] || ''}</svg>`;

/* ---------------- SIDEBAR ---------------- */
const NAV = [
  {
    g: null,
    items: [
      ['Vue d’ensemble', 'dashboard'],
      ['Événement', 'calendar'],
    ],
  },
  {
    g: 'CRÉATION',
    items: [
      ['Invitation', 'mail'],
      ['Studio', 'wand'],
      ['Templates', 'layers'],
    ],
  },
  {
    g: 'INVITÉS',
    items: [
      ['Invités', 'users'],
      ['Foyers & groupes', 'home'],
      ['RSVP', 'checkc'],
      ['Envois', 'send'],
    ],
  },
  {
    g: 'SOUVENIRS',
    items: [
      ['QR Codes', 'qr'],
      ['Photos & vidéos', 'image'],
      ['Livre d’or audio', 'mic'],
      ['Galerie', 'grid'],
    ],
  },
  { g: 'ANALYSE', items: [['Statistiques', 'chart']] },
  {
    g: 'PLUS',
    items: [
      ['Carte de remerciement', 'heart'],
      ['Offres & produits', 'gift'],
      ['Paramètres', 'settings'],
    ],
  },
];

function sidebar(active) {
  let nav = '';
  for (const s of NAV) {
    if (s.g) nav += `<div class="sb-grp">${s.g}</div>`;
    for (const [lbl, icn] of s.items) {
      nav += `<div class="sb-it${lbl === active ? ' on' : ''}">${ic(icn)}<span>${lbl}</span></div>`;
    }
  }
  return `<aside class="sb">
    <div class="sb-logo"><div class="wm">MYEVENT’S</div><div class="tg">Espace organisateur</div></div>
    <div class="sb-evt"><div class="mono">Y&amp;A</div><div class="fx"><div class="t1">Yasmine &amp; Adam</div><div class="t2">6 juin 2026</div></div>${ic('updown', 'i14')}</div>
    <nav class="sb-nav">${nav}</nav>
    <div class="sb-div"></div>
    <div class="sb-it">${ic('help')}<span>Aide &amp; tutoriels</span></div>
    <div class="sb-user"><div class="av"></div><div class="fx"><div class="t1">Adam F.</div><div class="t2">Organisateur</div></div>${ic('more', 'i14')}</div>
  </aside>`;
}

function topbar(title, crumb = 'Mariage Yasmine & Adam') {
  return `<header class="tb">
    <div class="tb-l"><span class="crumb">${crumb}</span><svg class="sep" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">${P.cright}</svg><span class="h4">${title}</span></div>
    <div class="tb-r">
      <div class="tb-search">${ic('search', 'i14')}<span>Rechercher un invité, un envoi…</span></div>
      <div class="tb-ic">${ic('bell', 'i18')}<span class="dot"></span></div>
      <div class="tb-vd"></div>
      <div class="row g6 aic"><div class="tb-av"></div>${ic('cdown', 'i14')}</div>
    </div></header>`;
}

const shell = (active, title, content, { crumb, flush } = {}) =>
  `${sidebar(active)}<div class="main">${topbar(title, crumb || undefined)}<div class="content${flush ? ' flush' : ''}">${content}</div></div>`;

/* ---------------- BRIQUES ---------------- */
function phead(title, sub, acts = '') {
  return `<div class="phead"><div><h1 class="ttl">${title}</h1>${sub ? `<div class="sub">${sub}</div>` : ''}</div>${acts ? `<div class="acts">${acts}</div>` : ''}</div>`;
}
const btn = (l, k = 'sec', i = null, extra = '') =>
  `<span class="btn ${k} ${extra}">${i ? ic(i) : ''}${l ? `<span>${l}</span>` : ''}</span>`;
const badge = (l, t = 'neu') => `<span class="badge ${t}"><i></i>${l}</span>`;
const kpi = (k, v, d, c = '') =>
  `<div class="kpi"><div class="k">${k}</div><div class="v" ${c ? `style="color:${c}"` : ''}>${v}</div><div class="d">${d}</div></div>`;
const fld = (l, v, st = 'ph', hint = '') =>
  `<div class="fld"><span class="lb">${l}</span><div class="inp ${st}">${v}</div>${hint ? `<span class="hint ${st === 'err' ? 'err' : ''}">${hint}</span>` : ''}</div>`;

function mapmock(w, h, r = 10) {
  return `<div class="mapmock" style="width:${w}px;height:${h}px;border-radius:${r}px">
    <div class="park" style="width:${w * 0.75}px;height:${h * 0.7}px;left:${w * 0.45}px;top:${h * 0.35}px"></div>
    <div class="rd" style="left:0;top:${h * 0.62}px;width:${w}px;height:1.6px"></div>
    <div class="rd" style="left:${w * 0.24}px;top:0;width:1.6px;height:${h}px"></div>
    <div class="rd" style="left:0;top:${h * 0.28}px;width:${w}px;height:1.2px"></div>
    <div class="rd" style="left:${w * 0.66}px;top:0;width:1.2px;height:${h}px"></div>
    <div class="rd" style="left:-10px;top:${h * 0.5}px;width:${w * 1.4}px;height:1.4px;transform:rotate(-18deg)"></div>
    <div class="rt" style="left:${w * 0.22}px;top:${h * 0.5}px;width:${w * 0.42}px"></div>
    <div class="pn" style="left:${w * 0.55}px;top:${h * 0.38}px"></div></div>`;
}

// QR déterministe (motif pseudo-aléatoire stable + repères d'angle)
function qr(size, dark = '#1C1614', cells = 21, seed = 7) {
  let s = seed,
    rnd = () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
  const on = [];
  for (let y = 0; y < cells; y++) {
    on[y] = [];
    for (let x = 0; x < cells; x++) {
      on[y][x] = rnd() > 0.52;
    }
  }
  const finder = (ox, oy) => {
    for (let y = 0; y < 7; y++)
      for (let x = 0; x < 7; x++) {
        const edge = x === 0 || x === 6 || y === 0 || y === 6,
          core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        on[oy + y][ox + x] = edge || core;
      }
  };
  finder(0, 0);
  finder(cells - 7, 0);
  finder(0, cells - 7);
  const quiet = (ox, oy) => {
    for (let y = 0; y < 8; y++)
      for (let x = 0; x < 8; x++) {
        const yy = oy + y,
          xx = ox + x;
        if (yy < 0 || xx < 0 || yy >= cells || xx >= cells) continue;
        if (x === 7 || y === 7) on[yy][xx] = false;
      }
  };
  quiet(0, 0);
  quiet(cells - 8, 0);
  quiet(0, cells - 8);
  let cellsHtml = '';
  for (let y = 0; y < cells; y++)
    for (let x = 0; x < cells; x++)
      cellsHtml += `<i class="${on[y][x] ? '' : 'o'}"></i>`;
  return `<div class="qr" style="width:${size}px;height:${size}px;grid-template-columns:repeat(${cells},1fr);gap:0;--d:${dark}">
    <style>.qr i{background:${dark}}.qr i.o{background:transparent}</style>${cellsHtml}</div>`;
}

/* ---------------- INVITATION ---------------- */
function invitation() {
  const grule = (w = 64) =>
    `<div class="grule"><i style="width:${w}px"></i><b></b><i style="width:${w}px"></i></div>`;
  const cal = () => {
    const hd = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
      .map((d) => `<span class="hd">${d}</span>`)
      .join('');
    let d = '';
    for (let i = 1; i <= 30; i++)
      d += `<span class="${i === 6 ? 'on' : ''}">${i}</span>`;
    return `<div class="cal"><div class="mic" style="font-size:7.5px;letter-spacing:1px;color:var(--go-500);text-align:center;margin-bottom:8px">JUIN 2026</div><div class="cg">${hd}${d}</div></div>`;
  };
  const venue = (n, h, a) => `<div class="venue">
    <div style="font-family:var(--serif);font-size:15px;line-height:20px;color:var(--bx-700)">${n}</div>
    <div class="mic mt4" style="color:var(--warm);font-weight:400">${h}</div>
    <div class="mt10">${mapmock(122, 84)}</div>
    <div class="mt10" style="font-size:9.5px;line-height:14px;color:var(--warm)">${a}</div>
    <div class="mt10">${'<span class="pillbtn">' + ic('pin', 'i14').replace('i14', '') + 'ITINÉRAIRE</span>'}</div></div>`;
  const cd = (v, l) =>
    `<div class="col aic"><div class="cd">${v}</div><div class="cdl mt4">${l}</div></div>`;

  return `<div class="inv">
  <div class="blk b1">
    <div class="bism">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
    <div class="mt20">${grule()}</div>
    <div class="mic mt16" style="letter-spacing:1.2px;color:var(--warm);font-weight:400">Au nom de Dieu, le Tout Miséricordieux</div>
  </div>
  <div class="blk b2">
    <div class="ovl">Les familles</div>
    <div class="fam mt12">Nadari</div>
    <div class="s-body" style="font-size:16px;color:var(--go-600)">&amp;</div>
    <div class="fam">Ferrand</div>
    <div class="s-body mt20" style="font-size:14px;line-height:22px;color:var(--warm)">ont le plaisir de vous convier<br>au mariage de leurs enfants</div>
    <div class="names mt24">Yasmine</div>
    <div class="s-sub" style="font-size:22px;color:var(--go-600)">&amp;</div>
    <div class="names">Adam</div>
    <div class="mt24">${grule(44)}</div>
    <div class="ovl mt16" style="color:var(--bx-700);letter-spacing:2.4px">Le samedi 6 juin 2026</div>
    <div class="cap mt6" style="color:var(--warm)">Le Tholonet · Aix-en-Provence</div>
  </div>
  <div class="blk b3">
    <div class="verse">رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا<br>قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا</div>
    <div class="mt20" style="width:28px;height:1px;background:rgba(184,146,92,.6)"></div>
    <div class="fr mt20">« Notre Seigneur, accorde-nous, de nos épouses et de nos descendances,<br>la joie des yeux, et fais de nous un guide pour les pieux. »</div>
    <div class="mic mt16" style="letter-spacing:1.6px;color:var(--go-600)">SOURATE AL-FURQAN · VERSET 74</div>
  </div>
  <div class="blk b4">
    <div class="t4">Le Programme du<br>Samedi 6 Juin</div>
    <div class="row g14 mt24" style="width:100%;align-items:stretch">
      ${venue('Mairie d’Aix-en-Provence', '14:00 · Cérémonie civile', 'Place de l’Hôtel de Ville, 13100 Aix-en-Provence')}
      ${venue('Domaine des Oliviers', '18:00 · Réception &amp; dîner', '340 route de Cézanne, Le Tholonet')}
    </div>
  </div>
  <div class="blk b5">
    <div class="ovl" style="color:var(--go-500);letter-spacing:2.6px;font-size:9.5px">Le grand jour</div>
    <div class="s-title mt10" style="font-size:30px;color:#F3EFE7">Plus que…</div>
    <div class="row g16 aic center mt24" style="width:100%">
      <div class="row g14">${cd('157', 'Jours')}${cd('22', 'Heures')}${cd('33', 'Minutes')}${cd('54', 'Secondes')}</div>
      ${cal()}
    </div>
    <div class="mt24"><span class="pillbtn" style="color:var(--go-500);border-color:rgba(212,176,123,.5);font-size:9px;letter-spacing:1.4px;padding:9px 16px">${ic('calendar', '').replace('class="ic "', 'class="ic" style="width:12px;height:12px"')}AJOUTER AU CALENDRIER</span></div>
  </div>
  <div class="blk b6">
    <div class="ovl" style="color:var(--go-600);letter-spacing:2.6px;font-size:9.5px">Réponse souhaitée</div>
    <div class="t4 mt10" style="font-size:28px">Serez-vous des nôtres ?</div>
    <div class="cap mt10" style="color:var(--warm)">Merci de nous confirmer votre présence avant le 1er septembre 2026.</div>
    <div class="col g10 mt24" style="width:100%">
      <div class="ifld">Votre nom &amp; prénom</div>
      <div class="ifld">Votre e-mail</div>
      <div class="row g10">
        <div class="row g8 aic" style="flex:1;background:#fff;border:1.4px solid rgba(122,31,43,.8);border-radius:9px;padding:11px">
          <span class="rdo on" style="width:14px;height:14px;flex:0 0 14px"></span><span style="font-size:10px;font-weight:500;color:var(--bx-700)">Je serai présent(e)</span></div>
        <div class="row g8 aic" style="flex:1;background:rgba(255,255,255,.6);border:1px solid rgba(184,146,92,.28);border-radius:9px;padding:11px">
          <span class="rdo" style="width:14px;height:14px;flex:0 0 14px"></span><span style="font-size:10px;color:var(--warm)">Je serai absent(e)</span></div>
      </div>
      <div class="ifld ta">Un petit mot pour nous ?</div>
      <div class="isub mt6">CONFIRMER MA RÉPONSE</div>
    </div>
  </div>
  <div class="blk b7">
    <div class="ovl" style="color:#8A7466;font-size:8.5px;letter-spacing:2.2px">Nous avons hâte de vous voir</div>
    <div class="script mt14" style="font-size:30px;line-height:40px;color:var(--go-200)">Adam &amp; Yasmine</div>
    <div class="mt16" style="width:30px;height:1px;background:rgba(212,176,123,.4)"></div>
    <div class="mic mt14" style="letter-spacing:2px;color:#8A7466">06 · 06 · 2026</div>
    <div class="mic mt20" style="font-size:8.5px;color:#5C4A42;font-weight:400">Créé avec MyEvent’s</div>
  </div></div>`;
}

/* miniature d'invitation (pour vignettes / thumbs) */
function invThumb(w, h, scale) {
  return `<div style="width:${w}px;height:${h}px;overflow:hidden;position:relative;background:var(--cream)">
    <div style="transform:scale(${scale});transform-origin:top left;width:390px">${invitation()}</div></div>`;
}

const dot = (c) =>
  `<span style="width:6px;height:6px;border-radius:999px;background:${c};display:inline-block"></span>`;

module.exports = {
  P,
  ic,
  sidebar,
  topbar,
  shell,
  phead,
  btn,
  badge,
  kpi,
  fld,
  mapmock,
  qr,
  invitation,
  invThumb,
  dot,
  NAV,
};
