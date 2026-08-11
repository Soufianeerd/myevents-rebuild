// Écrans 18 → 22 — Studio MyEvent's
const L = require('./lib.js');
const { ic, btn, badge, fld, shell, phead, invitation, invThumb } = L;

const SECTIONS = [
  ['Introduction', 'Ouverture de l’invitation', 'b1'],
  ['Familles &amp; noms', 'Yasmine &amp; Adam', 'b2'],
  ['Citation', 'Texte / Verset', 'b3'],
  ['Programme', 'Lieux &amp; horaires', 'b4'],
  ['Compte à rebours', 'J-Countdown', 'b5'],
  ['RSVP', 'Formulaire de réponse', 'b6'],
  ['Galerie', 'Photos de l’événement', 'gal'],
  ['Informations pratiques', 'Hébergement, dress code', 'info'],
  ['Footer', 'Message de clôture', 'b7'],
];

/* miniature d'une section précise de l'invitation */
function secThumb(w, h, kind) {
  const map = {
    b1: 0,
    b2: -196,
    b3: -726,
    b4: -1049,
    b5: -1497,
    b6: -1864,
    gal: -1864,
    info: -1864,
    b7: -2377,
  };
  const sc = w / 390;
  return `<div style="width:${w}px;height:${h}px;overflow:hidden;position:relative;background:var(--cream)">
    <div style="transform:scale(${sc});transform-origin:top left;width:390px;position:absolute;top:${(map[kind] || 0) * sc}px">${invitation()}</div></div>`;
}

const stuHeader = (right) => `<div class="stu-hd">
  <div class="row g14 aic">
    <span class="btn ghost sm" style="padding:0 6px">${ic('aleft', 'i16')}</span>
    <div><div class="row g8 aic"><span class="bm">Mariage de Yasmine &amp; Adam</span>${ic('pen', 'i14').replace('class="ic i14"', 'class="ic i14" style="stroke:var(--n-400)"')}</div>
      <div class="row g6 aic mt2"><span style="width:6px;height:6px;border-radius:999px;background:var(--ok)"></span><span class="mic muted" style="font-weight:400">Enregistré automatiquement · il y a 4 s</span></div></div></div>
  <span class="seg"><span class="on">${ic('phone', 'i14')}Mobile</span><span>${ic('tablet', 'i14')}Tablette</span><span>${ic('monitor', 'i14')}Desktop</span></span>
  <div class="row g10 aic">
    <span class="btn sec sm" style="padding:0 9px">${ic('undo', 'i16')}</span>
    <span class="btn sec sm" style="padding:0 9px">${ic('redo', 'i16')}</span>
    <span class="tb-vd" style="height:22px"></span>
    ${right || ''}
    ${btn('Aperçu', 'sec', 'eye', 'sm')}${btn('Publier', 'gold', 'sparkle', 'sm')}
    <span class="tb-av" style="width:28px;height:28px"></span></div></div>`;

const timeline = (active) => `<div class="stu-tl">
  <span class="over muted" style="writing-mode:vertical-rl;transform:rotate(180deg);letter-spacing:1.4px;font-size:9px">TIMELINE</span>
  ${SECTIONS.map(
    (s, i) => `<div style="flex:0 0 auto;text-align:center">
    <div class="stu-tlc ${i === active ? 'on' : ''}">${
      ['gal', 'info'].includes(s[2])
        ? `<div style="height:100%;display:flex;align-items:center;justify-content:center;background:var(--n-50);color:var(--n-400)">${ic(s[2] === 'gal' ? 'image' : 'info', 'i18')}</div>`
        : secThumb(112, 76, s[2])
    }
      <span style="position:absolute;top:3px;left:4px;width:14px;height:14px;border-radius:4px;background:rgba(255,255,255,.9);display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:600;color:var(--n-600)">${i + 1}</span></div>
    <div class="mic muted mt4" style="font-weight:400;font-size:9px">${s[0].replace('&amp;', '&')}</div></div>`,
  ).join('')}
  <div style="flex:0 0 auto;width:112px;height:76px;border:1px dashed var(--n-300);border-radius:9px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;color:var(--n-400)">
    ${ic('plus', 'i16')}<span class="mic" style="font-weight:400;font-size:9px">Ajouter</span></div></div>`;

const leftPanel = (active) => `<div class="stu-l">
  <div style="padding:16px 16px 12px;border-bottom:1px solid var(--n-100);display:flex;align-items:center;justify-content:space-between">
    <span class="over muted">Sections de l’invitation</span>
    <span class="btn ghost sm" style="padding:0;color:var(--bx-700);font-size:11px">${ic('grip', 'i14')}Réorganiser</span></div>
  <div style="flex:1;overflow:hidden;padding:12px;display:flex;flex-direction:column;gap:8px">
    ${SECTIONS.map(
      (s, i) => `<div class="stu-sec ${i === active ? 'on' : ''}">
      <span style="color:var(--n-300)">${ic('grip', 'i16')}</span>
      <div class="th">${
        ['gal', 'info'].includes(s[2])
          ? `<div style="height:100%;display:flex;align-items:center;justify-content:center;background:var(--n-50);color:var(--n-400)">${ic(s[2] === 'gal' ? 'image' : 'info', 'i16')}</div>`
          : secThumb(52, 44, s[2])
      }</div>
      <div style="flex:1;min-width:0"><div class="capm">${s[0]}</div><div class="mic muted mt2" style="font-weight:400">${s[1]}</div></div>
      <span style="color:var(--n-400)">${ic('more', 'i16')}</span></div>`,
    ).join('')}
    <div style="border:1px dashed var(--n-300);border-radius:12px;padding:13px;display:flex;align-items:center;justify-content:center;gap:8px;color:var(--n-500)">
      ${ic('plus', 'i16')}<span class="capm">Ajouter une section</span></div>
  </div></div>`;

const canvas = (extra) => `<div class="stu-c">
  <div style="position:absolute;left:16px;top:16px;display:flex;flex-direction:column;gap:4px;background:var(--ink);border-radius:12px;padding:6px">
    ${['cursor', 'hand', 'maximize', 'zin', 'zout']
      .map(
        (
          t,
          i,
        ) => `<span style="width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;
      background:${i === 0 ? 'var(--go-500)' : 'transparent'};color:${i === 0 ? '#3A2A16' : '#8C8478'}">${ic(t, 'i16')}</span>`,
      )
      .join('')}</div>
  <div style="padding:26px 0 0">
    <div class="device-phone" style="width:352px">
      <div class="notch"></div>
      <div class="scr" style="height:640px;position:relative">${invThumb(330, 640, 330 / 390)}
        <div style="position:absolute;left:0;right:0;top:${extra ? extra.top : 172}px;height:${extra ? extra.h : 300}px;border:2px solid var(--go-500);border-radius:6px;box-shadow:0 0 0 9999px rgba(28,22,20,.06)"></div>
        <div style="position:absolute;left:8px;top:${(extra ? extra.top : 172) - 20}px;background:var(--go-500);color:#3A2A16;font-size:9px;font-weight:600;padding:3px 7px;border-radius:5px">${extra ? extra.label : 'Familles & noms'}</div>
      </div></div>
    <div class="row g10 center mt16">
      <span class="btn sec sm" style="background:#fff">${ic('zout', 'i14')}</span>
      <span class="btn sec sm" style="background:#fff">100 %${ic('cdown', 'i14')}</span>
      <span class="btn sec sm" style="background:#fff">${ic('zin', 'i14')}</span></div>
  </div></div>`;

/* ============ 18 · TEMPLATES DANS LE STUDIO ============ */
function p18() {
  const T = [
    ['Andalouse', 'Oriental', '#F6F1E7', '#7A1F2B', true],
    ['Zellige', 'Oriental', '#F2EFE6', '#9C7742', false],
    ['Minéral', 'Minimaliste', '#EFEDE7', '#46413A', false],
    ['Camélia', 'Floral', '#F7EEEA', '#8E2836', false],
    ['Nuit d’or', 'Classique', '#231A18', '#D4B07B', false],
    ['Lin', 'Minimaliste', '#F6F4EF', '#635D53', false],
    ['Henné', 'Henné', '#F3E9DC', '#5F1822', false],
    ['Marbre', 'Moderne', '#FFFFFF', '#1C1917', false],
    ['Bougainvillier', 'Floral', '#F9EDEE', '#7A1F2B', false],
    ['Sable', 'Moderne', '#F4EFE8', '#8E2836', false],
  ];
  return {
    n: '18',
    slug: 'studio-templates',
    title: 'Studio · Sélection du template',
    w: 1440,
    h: 1024,
    group: 'Studio',
    html: shell(
      'Templates',
      'Templates',
      `
    ${phead(
      'Choisir un template',
      '62 modèles · votre contenu sera conservé lors du changement',
      `${btn('Importer un modèle', 'sec', 'upload')}${btn('Partir d’une page vierge', 'sec', 'plus')}`,
    )}
    <div class="row between aic">
      <div class="row g8 wrap">${[
        'Tous',
        'Oriental',
        'Moderne',
        'Minimaliste',
        'Floral',
        'Classique',
        'Civil',
        'Henné',
        'Anniversaire',
      ]
        .map(
          (c, i) => `
        <span class="btn ${i === 0 ? 'pri' : 'sec'} sm" style="border-radius:999px">${c}</span>`,
        )
        .join('')}</div>
      <div class="row g10"><span class="btn sec sm">${ic('sliders', 'i14')}Ambiance : Claire${ic('cdown', 'i14')}</span>
        <span class="btn sec sm">${ic('filter', 'i14')}Type : Mariage${ic('cdown', 'i14')}</span></div></div>
    <div class="grid g5 mt20" style="gap:16px">
      ${T.map(
        (
          t,
        ) => `<div class="tplcard" style="${t[4] ? 'border-color:var(--go-500);box-shadow:0 0 0 3px rgba(212,176,123,.18),var(--e-1)' : ''}">
        <div class="thumb" style="height:236px;background:${t[2]}">
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 14px;text-align:center">
            <div class="mic" style="letter-spacing:1.8px;color:${t[3]};opacity:.7;font-size:7.5px">LES FAMILLES</div>
            <div class="script mt8" style="font-size:23px;line-height:30px;color:${t[3]}">Yasmine &amp; Adam</div>
            <div style="width:26px;height:1px;background:${t[3]};opacity:.45;margin:9px 0"></div>
            <div class="mic" style="letter-spacing:1.6px;color:${t[3]};opacity:.7;font-size:7.5px">06 · 06 · 2026</div></div>
          ${t[4] ? `<span style="position:absolute;top:9px;right:9px;width:22px;height:22px;border-radius:999px;background:var(--go-500);display:flex;align-items:center;justify-content:center;color:#3A2A16">${ic('check', 'i14')}</span>` : ''}</div>
        <div class="meta" style="padding:11px 13px"><div><div class="capm">${t[0]}</div><div class="mic muted mt2" style="font-weight:400">${t[1]}</div></div>
          ${t[4] ? '<span class="mic gold">Actuel</span>' : ic('aright', 'i14')}</div></div>`,
      ).join('')}
    </div>
    <div class="card pad mt20" style="background:var(--go-50);border-color:var(--go-200);display:flex;align-items:center;gap:14px">
      ${ic('info', 'i18').replace('class="ic i18"', 'class="ic i18" style="stroke:var(--go-700)"')}
      <span class="b" style="color:var(--go-700);flex:1">Changer de template conserve vos textes, vos lieux et vos réponses RSVP. Seuls la mise en page et les styles sont remplacés.</span>
      ${btn('Comparer avant / après', 'sec', null, 'sm')}</div>`,
    ),
  };
}

/* ============ 19 · STUDIO PRINCIPAL ============ */
function p19() {
  const acc = [
    'Typographie',
    'Couleurs',
    'Espacement',
    'Arrière-plan',
    'Effets',
  ];
  return {
    n: '19',
    slug: 'studio-principal',
    title: 'Studio principal',
    w: 1440,
    h: 1024,
    cls: 'screen solo',
    group: 'Studio',
    html: `
  <div style="height:1024px;display:flex;flex-direction:column;background:var(--n-25)">
    ${stuHeader()}
    <div style="flex:1;display:flex;min-height:0">
      ${leftPanel(1)}
      ${canvas()}
      <div class="stu-r">
        <div style="padding:16px 18px 0">
          <div class="row between aic"><span class="over muted">Propriétés</span><span class="badge neu">Section 2</span></div>
          <div class="h3 mt10" style="font-size:17px">Familles &amp; noms</div>
          <div class="tabs mt14" style="gap:20px">
            <span class="on" style="font-size:13px">Contenu</span><span style="font-size:13px">Style</span><span style="font-size:13px">Animation</span></div></div>
        <div style="flex:1;overflow:hidden;padding:18px">
          <div class="over muted">Contenu</div>
          <div class="col g14 mt12">
            <div class="fld"><span class="lb">Sur-titre</span><div class="inp" style="height:38px;font-size:13px">LES FAMILLES</div></div>
            <div class="fld"><span class="lb">Noms des familles</span>
              <div class="row g6 aic" style="border:1px solid var(--n-200);border-radius:8px;padding:5px;background:var(--n-50)">
                ${['type', 'pen', 'menu', 'sliders', 'grip'].map((t, i) => `<span style="width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;background:${i === 0 ? '#fff' : 'transparent'};color:var(--n-600);${i === 0 ? 'box-shadow:var(--e-0)' : ''}">${ic(t, 'i14')}</span>`).join('')}</div>
              <div class="inp focus" style="height:46px"><span class="script" style="font-size:20px;color:var(--bx-700)">Nadari &amp; Ferrand</span></div></div>
            <div class="fld"><span class="lb">Texte d’invitation</span>
              <div class="inp ta" style="min-height:64px;font-size:13px;line-height:20px;color:var(--n-800)">ont le plaisir de vous convier au mariage de leurs enfants</div></div>
            <div class="fld"><span class="lb">Noms des mariés</span>
              <div class="inp" style="height:52px"><span class="script" style="font-size:26px;color:var(--bx-700)">Yasmine &amp; Adam</span></div></div>
            <div class="row g12">
              <div class="fld" style="flex:1"><span class="lb">Date affichée</span><div class="inp" style="height:38px;font-size:12px">6 juin 2026</div></div>
              <div class="fld" style="flex:1"><span class="lb">Lieu</span><div class="inp" style="height:38px;font-size:12px">Aix-en-Provence</div></div></div>
          </div>
          <div class="mt20">
            ${acc
              .map(
                (
                  a,
                  i,
                ) => `<div class="acc"><span class="nm">${a}</span><span style="color:var(--n-400)">${ic(i === 0 ? 'cup' : 'cdown', 'i16')}</span></div>
            ${
              i === 0
                ? `<div style="padding:2px 0 14px">
              <div class="row g10"><div class="fld" style="flex:1"><span class="lb" style="font-size:11px">Police</span><div class="inp" style="height:34px;font-size:12px">Great Vibes${ic('cdown', 'i14')}</div></div>
                <div class="fld" style="width:86px"><span class="lb" style="font-size:11px">Taille</span><div class="inp" style="height:34px;font-size:12px">62</div></div></div>
              <div class="row g10 mt10"><div class="fld" style="flex:1"><span class="lb" style="font-size:11px">Interligne</span><div class="inp" style="height:34px;font-size:12px">70</div></div>
                <div class="fld" style="flex:1"><span class="lb" style="font-size:11px">Interlettrage</span><div class="inp" style="height:34px;font-size:12px">0</div></div></div>
              <div class="row g6 mt10">${['Gauche', 'Centre', 'Droite'].map((x, k) => `<span class="btn ${k === 1 ? 'pri' : 'sec'} sm" style="flex:1;justify-content:center;font-size:11px">${x}</span>`).join('')}</div>
            </div>`
                : ''
            }`,
              )
              .join('')}
          </div>
        </div>
        <div style="padding:14px 18px;border-top:1px solid var(--n-100);display:flex;gap:10px">
          ${btn('Dupliquer', 'sec', 'copy', 'sm')}<span style="flex:1"></span>${btn('', 'dgr', 'trash', 'sm')}</div>
      </div>
    </div>
    ${timeline(1)}
  </div>`,
  };
}

/* ============ 20 · STUDIO / STYLE GLOBAL ============ */
function p20() {
  const palettes = [
    [
      'Bordeaux &amp; ivoire',
      ['#7A1F2B', '#D4B07B', '#F6F1E7', '#2A1214'],
      true,
    ],
    ['Nuit &amp; or', ['#231A18', '#D4B07B', '#F3EFE7', '#0F0B0A'], false],
    ['Terracotta', ['#9C4A2F', '#E0A87E', '#F7EFE6', '#3A2018'], false],
    ['Vert olive', ['#4A5A3A', '#C3CBA8', '#F2F1E6', '#232B1C'], false],
    ['Encre', ['#1C2A3A', '#8FA6BE', '#EFF1F4', '#0E161F'], false],
    ['Rosé poudré', ['#8E2836', '#E7C4C4', '#F9EDEE', '#3A1418'], false],
  ];
  return {
    n: '20',
    slug: 'studio-style',
    title: 'Studio · Style global',
    w: 1440,
    h: 1024,
    cls: 'screen solo',
    group: 'Studio',
    html: `
  <div style="height:1024px;display:flex;flex-direction:column;background:var(--n-25)">
    ${stuHeader()}
    <div style="flex:1;display:flex;min-height:0">
      <div class="stu-l">
        <div style="padding:16px 16px 12px;border-bottom:1px solid var(--n-100)"><span class="over muted">Style global</span></div>
        <div style="flex:1;padding:12px;display:flex;flex-direction:column;gap:6px">
          ${[
            ['Palette', 'palette', true],
            ['Typographie', 'type', false],
            ['Arrière-plan', 'image', false],
            ['Motifs', 'grid', false],
            ['Boutons', 'cursor', false],
            ['Rayons', 'maximize', false],
            ['Espacement', 'sliders', false],
          ]
            .map(
              (t) => `
          <div class="row g11 aic" style="gap:11px;padding:10px 11px;border-radius:10px;${t[2] ? 'background:var(--go-50);border:1px solid var(--go-200)' : ''}">
            <span style="color:${t[2] ? 'var(--go-700)' : 'var(--n-500)'}">${ic(t[1], 'i16')}</span>
            <span class="b" style="color:${t[2] ? 'var(--n-900)' : 'var(--n-700)'};font-weight:${t[2] ? 500 : 400}">${t[0]}</span></div>`,
            )
            .join('')}
          <div style="height:1px;background:var(--n-100);margin:10px 0"></div>
          <div class="over muted" style="padding:0 11px 6px">Presets</div>
          ${[
            ['Classique chaleureux', true],
            ['Minimal éditorial', false],
            ['Oriental doré', false],
            ['Moderne contrasté', false],
          ]
            .map(
              (p) => `
          <div class="row between aic" style="padding:9px 11px;border-radius:10px;border:1px solid ${p[1] ? 'var(--go-500)' : 'var(--n-200)'};margin-bottom:6px">
            <span class="cap" style="color:var(--n-800)">${p[0]}</span>${p[1] ? `<span style="color:var(--go-600)">${ic('check', 'i14')}</span>` : ''}</div>`,
            )
            .join('')}
        </div></div>
      ${canvas({ top: 60, h: 520, label: 'Aperçu global' })}
      <div class="stu-r">
        <div style="padding:16px 18px 0"><div class="over muted">Palette</div>
          <div class="h3 mt8" style="font-size:17px">Bordeaux &amp; ivoire</div></div>
        <div style="flex:1;overflow:hidden;padding:16px 18px">
          <div class="col g10">
            ${palettes
              .map(
                (
                  p,
                ) => `<div class="row between aic" style="padding:10px 12px;border-radius:11px;border:1px solid ${p[2] ? 'var(--go-500)' : 'var(--n-200)'};${p[2] ? 'box-shadow:0 0 0 3px rgba(212,176,123,.15)' : ''}">
              <div class="row g10 aic"><div class="row g0" style="gap:3px">${p[1].map((c) => `<span style="width:18px;height:18px;border-radius:5px;background:${c};border:1px solid rgba(0,0,0,.06)"></span>`).join('')}</div>
              <span class="cap" style="color:var(--n-800)">${p[0]}</span></div>
              ${p[2] ? `<span style="color:var(--go-600)">${ic('check', 'i14')}</span>` : ''}</div>`,
              )
              .join('')}
          </div>
          <div class="acc mt16"><span class="nm">Couleurs personnalisées</span><span style="color:var(--n-400)">${ic('cup', 'i16')}</span></div>
          <div class="col g10 mt10">
            ${[
              ['Primaire', '#7A1F2B'],
              ['Accent doré', '#D4B07B'],
              ['Fond', '#F6F1E7'],
              ['Texte', '#2A1D1A'],
            ]
              .map(
                (c) => `
            <div class="row between aic"><span class="cap dim">${c[0]}</span>
              <div class="row g8 aic" style="border:1px solid var(--n-200);border-radius:8px;padding:4px 8px 4px 4px">
                <span style="width:22px;height:22px;border-radius:6px;background:${c[1]}"></span><span class="mic" style="font-weight:400">${c[1]}</span></div></div>`,
              )
              .join('')}
          </div>
          <div class="acc mt16"><span class="nm">Typographie</span><span style="color:var(--n-400)">${ic('cup', 'i16')}</span></div>
          <div class="col g10 mt10">
            ${[
              ['Titres', 'Cormorant Garamond'],
              ['Interface', 'Inter'],
              ['Prénoms', 'Great Vibes'],
              ['Arabe', 'Amiri'],
            ]
              .map(
                (f) => `
            <div class="row between aic"><span class="cap dim">${f[0]}</span>
              <div class="inp" style="height:32px;width:180px;font-size:12px;justify-content:space-between">${f[1]}${ic('cdown', 'i14')}</div></div>`,
              )
              .join('')}
          </div>
          <div class="acc mt16"><span class="nm">Rayons &amp; espacement</span><span style="color:var(--n-400)">${ic('cup', 'i16')}</span></div>
          <div class="mt12"><div class="row between"><span class="cap dim">Rayon des cartes</span><span class="capm">12 px</span></div>
            <div class="prog gold mt8"><i style="width:42%"></i></div>
            <div class="row between mt14"><span class="cap dim">Densité verticale</span><span class="capm">Confort</span></div>
            <div class="prog gold mt8"><i style="width:62%"></i></div></div>
        </div>
        <div style="padding:14px 18px;border-top:1px solid var(--n-100);display:flex;gap:10px">
          ${btn('Réinitialiser', 'ghost', null, 'sm')}<span style="flex:1"></span>${btn('Appliquer à toutes les sections', 'pri', null, 'sm')}</div>
      </div></div>
    ${timeline(0)}
  </div>`,
  };
}

/* ============ 21 · STUDIO / ANIMATIONS ============ */
function p21() {
  const anims = [
    ['Fondu', 'Apparition en opacité', 'sparkle', true],
    ['Révélation', 'Le contenu se dévoile par le bas', 'cup', false],
    ['Glissement doux', 'Translation latérale légère', 'aright', false],
    ['Ouverture de portes', 'Deux volets s’écartent', 'maximize', false],
    ['Aucune', 'Affichage immédiat', 'close', false],
  ];
  return {
    n: '21',
    slug: 'studio-animations',
    title: 'Studio · Animations',
    w: 1440,
    h: 1024,
    cls: 'screen solo',
    group: 'Studio',
    html: `
  <div style="height:1024px;display:flex;flex-direction:column;background:var(--n-25)">
    ${stuHeader()}
    <div style="flex:1;display:flex;min-height:0">
      ${leftPanel(1)}
      ${canvas({ top: 172, h: 300, label: 'Familles & noms' })}
      <div class="stu-r">
        <div style="padding:16px 18px 0">
          <div class="row between aic"><span class="over muted">Propriétés</span><span class="badge neu">Section 2</span></div>
          <div class="h3 mt10" style="font-size:17px">Familles &amp; noms</div>
          <div class="tabs mt14" style="gap:20px">
            <span style="font-size:13px">Contenu</span><span style="font-size:13px">Style</span><span class="on" style="font-size:13px">Animation</span></div></div>
        <div style="flex:1;overflow:hidden;padding:18px">
          <div class="over muted">Transition d’entrée</div>
          <div class="col g10 mt12">
            ${anims
              .map(
                (
                  a,
                ) => `<div class="row g12 aic" style="padding:11px 12px;border-radius:11px;border:1px solid ${a[3] ? 'var(--go-500)' : 'var(--n-200)'};${a[3] ? 'background:var(--go-50)' : ''}">
              <span style="width:30px;height:30px;flex:0 0 30px;border-radius:8px;background:${a[3] ? 'var(--go-500)' : 'var(--n-50)'};color:${a[3] ? '#3A2A16' : 'var(--n-500)'};display:flex;align-items:center;justify-content:center">${ic(a[2], 'i16')}</span>
              <div style="flex:1"><div class="capm">${a[0]}</div><div class="mic muted mt2" style="font-weight:400">${a[1]}</div></div>
              ${a[3] ? `<span style="color:var(--go-700)">${ic('check', 'i16')}</span>` : ''}</div>`,
              )
              .join('')}
          </div>
          <div style="height:1px;background:var(--n-100);margin:18px 0"></div>
          <div class="over muted">Réglages</div>
          <div class="mt12">
            <div class="row between"><span class="cap dim">Durée</span><span class="capm">640 ms</span></div>
            <div class="prog gold mt8"><i style="width:52%"></i></div>
            <div class="row between mt16"><span class="cap dim">Délai</span><span class="capm">120 ms</span></div>
            <div class="prog gold mt8"><i style="width:18%"></i></div>
            <div class="row between aic mt16"><span class="cap dim">Courbe</span>
              <div class="inp" style="height:32px;width:150px;font-size:12px;justify-content:space-between">Ease-out${ic('cdown', 'i14')}</div></div>
            <div class="row between aic mt14"><span class="cap dim">Déclenchement au scroll</span><span class="tgl on"></span></div>
            <div class="row between aic mt14"><span class="cap dim">Rejouer à chaque passage</span><span class="tgl"></span></div>
            <div class="row between aic mt14"><span class="cap dim">Respecter « animations réduites »</span><span class="tgl on"></span></div>
          </div>
          <div class="card pad mt20" style="box-shadow:none;background:var(--n-50)">
            <div class="row between aic"><span class="capm">Aperçu de l’animation</span>${btn('Rejouer', 'sec', 'play', 'sm')}</div>
            <div class="row g6 aic mt14" style="height:34px">
              ${[10, 26, 48, 72, 88, 96, 100, 100, 100].map((v, i) => `<div style="flex:1;height:${v}%;border-radius:3px;background:${i < 6 ? 'var(--go-500)' : 'var(--go-200)'}"></div>`).join('')}</div>
            <div class="row between mt8"><span class="mic muted" style="font-weight:400">0 ms</span><span class="mic muted" style="font-weight:400">640 ms</span></div></div>
        </div>
        <div style="padding:14px 18px;border-top:1px solid var(--n-100);display:flex;gap:10px">
          ${btn('Appliquer à toutes', 'sec', null, 'sm')}<span style="flex:1"></span>${btn('Enregistrer', 'pri', null, 'sm')}</div>
      </div></div>
    ${timeline(1)}
  </div>`,
  };
}

/* ============ 22 · STUDIO / VERSIONS ============ */
function p22() {
  const V = [
    [
      'Aujourd’hui · 09:42',
      'Version actuelle',
      'Adam F.',
      'Modification des noms des mariés',
      true,
      'auto',
    ],
    [
      'Aujourd’hui · 09:31',
      '',
      'Adam F.',
      'Ajout de la section Galerie',
      false,
      'auto',
    ],
    [
      'Aujourd’hui · 08:55',
      '',
      'Yasmine N.',
      'Changement de palette : Bordeaux &amp; ivoire',
      false,
      'manuel',
    ],
    [
      'Hier · 21:03',
      'Avant publication',
      'Yasmine N.',
      'Correction du verset et de la traduction',
      false,
      'jalon',
    ],
    [
      'Hier · 18:12',
      '',
      'Nadia B.',
      'Ajustement du programme — 3 moments',
      false,
      'auto',
    ],
    [
      '8 janvier · 14:20',
      'Première version',
      'Adam F.',
      'Création depuis le template Andalouse',
      false,
      'jalon',
    ],
  ];
  return {
    n: '22',
    slug: 'studio-versions',
    title: 'Studio · Historique de versions',
    w: 1440,
    h: 1024,
    cls: 'screen solo',
    group: 'Studio',
    html: `
  <div style="height:1024px;display:flex;flex-direction:column;background:var(--n-25)">
    ${stuHeader(btn('Historique', 'sec', 'history', 'sm'))}
    <div style="flex:1;display:flex;min-height:0">
      <div class="stu-l" style="width:340px;flex:0 0 340px">
        <div style="padding:16px 16px 12px;border-bottom:1px solid var(--n-100);display:flex;align-items:center;justify-content:space-between">
          <span class="over muted">Historique</span><span class="btn ghost sm" style="padding:0;font-size:11px;color:var(--bx-700)">${ic('filter', 'i14')}Filtrer</span></div>
        <div style="flex:1;overflow:hidden;padding:12px">
          ${V.map(
            (v, i) => `<div style="display:flex;gap:12px">
            <div style="width:12px;flex:0 0 12px;display:flex;flex-direction:column;align-items:center;padding-top:14px">
              <span style="width:9px;height:9px;border-radius:999px;background:${v[4] ? 'var(--go-500)' : v[5] === 'jalon' ? 'var(--bx-700)' : 'var(--n-300)'};${v[4] ? 'box-shadow:0 0 0 3px rgba(212,176,123,.25)' : ''}"></span>
              ${i < V.length - 1 ? '<span style="flex:1;width:1px;background:var(--n-200);margin-top:4px"></span>' : ''}</div>
            <div style="flex:1;padding-bottom:10px">
              <div style="border-radius:11px;border:1px solid ${v[4] ? 'var(--go-500)' : 'var(--n-200)'};background:${v[4] ? 'var(--go-50)' : '#fff'};padding:11px 12px">
                <div class="row between aic"><span class="capm">${v[0]}</span>${v[1] ? `<span class="badge ${v[4] ? 'gld' : 'neu'}">${v[1]}</span>` : ''}</div>
                <div class="cap dim mt6">${v[3]}</div>
                <div class="row between aic mt10">
                  <div class="row g6 aic"><span class="av" style="width:18px;height:18px;font-size:8px">${v[2][0]}</span><span class="mic muted" style="font-weight:400">${v[2]}</span></div>
                  <div class="row g6">${v[4] ? '' : `<span class="btn ghost sm" style="padding:0;font-size:10px;color:var(--bx-700)">Restaurer</span>`}
                    <span style="color:var(--n-400)">${ic('more', 'i14')}</span></div></div></div></div></div>`,
          ).join('')}
        </div>
        <div style="padding:12px 16px;border-top:1px solid var(--n-100)">
          <div class="row g10 aic mic muted" style="font-weight:400">${ic('info', 'i14')}<span>Les versions sont conservées 90 jours.</span></div></div>
      </div>
      <div class="stu-c" style="flex-direction:column;padding:22px 0;align-items:center">
        <div class="row g12 aic" style="margin-bottom:18px">
          <span class="seg"><span class="on">${ic('eye', 'i14')}Aperçu</span><span>${ic('grid', 'i14')}Comparer</span></span>
          <span class="btn sec sm" style="background:#fff">Hier · 21:03${ic('cdown', 'i14')}</span>
          <span class="cap muted">vs</span>
          <span class="btn sec sm" style="background:#fff">Aujourd’hui · 09:42${ic('cdown', 'i14')}</span></div>
        <div class="row g20 ais">
          <div><div class="row between aic" style="margin-bottom:10px"><span class="capm muted">Hier · 21:03</span>${badge('Ancienne', 'neu')}</div>
            <div class="device-phone" style="width:280px;padding:8px;border-radius:34px"><div class="scr" style="height:520px;border-radius:26px;filter:saturate(.85);opacity:.85">${invThumb(264, 520, 264 / 390)}</div></div>
            <div class="mt12">${btn('Restaurer cette version', 'sec', 'history', 'sm blk')}</div></div>
          <div><div class="row between aic" style="margin-bottom:10px"><span class="capm">Aujourd’hui · 09:42</span>${badge('Actuelle', 'gld')}</div>
            <div class="device-phone" style="width:280px;padding:8px;border-radius:34px;box-shadow:0 0 0 3px rgba(212,176,123,.35),var(--e-dev)"><div class="scr" style="height:520px;border-radius:26px">${invThumb(264, 520, 264 / 390)}</div></div>
            <div class="mt12">${btn('Version affichée', 'dis', null, 'sm blk')}</div></div>
        </div></div>
      <div class="stu-r">
        <div style="padding:16px 18px 0"><div class="over muted">Différences</div>
          <div class="h3 mt8" style="font-size:17px">4 modifications</div></div>
        <div style="flex:1;overflow:hidden;padding:16px 18px">
          ${[
            [
              'Familles &amp; noms',
              'Texte modifié',
              '« Ezzaroil » → « Ferrand »',
              'pen',
              'warn',
            ],
            [
              'Citation',
              'Traduction ajustée',
              '2 lignes remplacées',
              'type',
              'warn',
            ],
            [
              'Galerie',
              'Section ajoutée',
              'Nouvelle section en position 7',
              'plus',
              'ok',
            ],
            [
              'Palette',
              'Couleur primaire',
              '#8E2836 → #7A1F2B',
              'palette',
              'info',
            ],
          ]
            .map(
              (d) => `
          <div class="card" style="padding:12px 14px;box-shadow:none;margin-bottom:10px">
            <div class="row g10 aic"><span style="width:26px;height:26px;flex:0 0 26px;border-radius:7px;background:var(--${d[4]}-bg);color:var(--${d[4]});display:flex;align-items:center;justify-content:center">${ic(d[3], 'i14')}</span>
              <div style="flex:1"><div class="capm">${d[0]}</div><div class="mic muted mt2" style="font-weight:400">${d[1]}</div></div></div>
            <div class="cap dim mt8" style="padding-left:36px">${d[2]}</div></div>`,
            )
            .join('')}
          <div class="alert info mt6">${ic('info')}<div><div class="tx">Restauration sans perte</div><div class="ds">Restaurer crée une nouvelle version : rien n’est effacé.</div></div></div>
        </div>
        <div style="padding:14px 18px;border-top:1px solid var(--n-100);display:flex;gap:10px">
          ${btn('Exporter le diff', 'sec', 'download', 'sm')}<span style="flex:1"></span>${btn('Restaurer', 'pri', 'history', 'sm')}</div>
      </div></div>
    ${timeline(1)}
  </div>`,
  };
}

module.exports = [p18, p19, p20, p21, p22].map((f) => f());
