// Écrans 30 → 38 — QR, Souvenirs, Remerciement, Offres, Paramètres
const L = require('./lib.js');
const { ic, btn, badge, kpi, fld, shell, phead, qr, invThumb } = L;

const tint = (i) =>
  [
    '#F6F1E7',
    '#EFE8DA',
    '#F3E9DC',
    '#F7EEEA',
    '#EFEDE7',
    '#F2EFE6',
    '#F4EFE8',
    '#F9EDEE',
  ][i % 8];

/* ============ 30 · QR CODES ============ */
function p30() {
  const Q = [
    [
      'Invitation',
      'myevents.app/yasmine-adam',
      'Actif',
      'ok',
      412,
      '12 janvier 2026',
      7,
    ],
    ['RSVP', 'myevents.app/…/rsvp', 'Actif', 'ok', 268, '12 janvier 2026', 13],
    [
      'Livre d’or audio',
      'myevents.app/…/audio',
      'Actif',
      'ok',
      96,
      '12 mars 2026',
      21,
    ],
    [
      'Photos &amp; vidéos',
      'myevents.app/…/photos',
      'Actif',
      'ok',
      147,
      '12 mars 2026',
      29,
    ],
    [
      'Galerie invités',
      'myevents.app/…/galerie',
      'Programmé',
      'info',
      0,
      '—',
      35,
    ],
    ['Remerciements', 'myevents.app/…/merci', 'Brouillon', 'neu', 0, '—', 41],
  ];
  return {
    n: '30',
    slug: 'qr-codes',
    title: 'QR Codes',
    w: 1440,
    h: 1024,
    group: 'Souvenirs',
    html: shell(
      'QR Codes',
      'QR Codes',
      `
    ${phead(
      'QR Codes',
      '6 codes · 923 scans cumulés · imprimables en haute définition',
      `${btn('Tout télécharger', 'sec', 'download')}${btn('Créer un QR Code', 'pri', 'plus')}`,
    )}
    <div class="row g20 ais">
      <div class="fx">
        <div class="grid g3" style="gap:20px">
          ${Q.map(
            (q) => `<div class="card" style="padding:0;overflow:hidden">
            <div style="padding:22px;background:var(--go-50);border-bottom:1px solid var(--n-200);display:flex;justify-content:center;position:relative">
              <div style="background:#fff;padding:11px;border-radius:12px;box-shadow:var(--e-1);position:relative">
                ${qr(112, q[3] === 'neu' ? '#A9A499' : '#1C1614', 21, q[6])}
                <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">
                  <div style="width:26px;height:26px;border-radius:8px;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 3px #fff">
                    <span class="script" style="font-size:15px;color:var(--bx-700);line-height:1">M</span></div></div></div>
              <span style="position:absolute;top:12px;right:12px">${badge(q[2], q[3])}</span></div>
            <div style="padding:16px 18px">
              <div class="row between aic"><span class="bm">${q[0]}</span><span style="color:var(--n-400)">${ic('more', 'i16')}</span></div>
              <div class="row g6 aic mt6 mic muted" style="font-weight:400">${ic('link', 'i14')}<span>${q[1]}</span></div>
              <div class="row between aic mt12" style="padding-top:12px;border-top:1px solid var(--n-100)">
                <div><div class="mic muted" style="font-weight:400">Scans</div><div class="capm mt2">${q[4] || '—'}</div></div>
                <div style="text-align:right"><div class="mic muted" style="font-weight:400">Créé le</div><div class="capm mt2">${q[5]}</div></div></div>
              <div class="row g6 mt14">${btn('Aperçu', 'sec', 'eye', 'sm')}${btn('', 'sec', 'palette', 'sm')}${btn('', 'sec', 'download', 'sm')}${btn('', 'sec', 'share', 'sm')}</div></div></div>`,
          ).join('')}
        </div>
      </div>
      <div style="width:340px;flex:0 0 340px">
        <div class="card" style="padding:0;overflow:hidden">
          <div style="padding:16px 18px;border-bottom:1px solid var(--n-100);display:flex;align-items:center;justify-content:space-between">
            <span class="over muted">Personnaliser</span><span class="badge brd">Invitation</span></div>
          <div style="padding:18px">
            <div style="background:var(--go-50);border-radius:12px;padding:22px;display:flex;justify-content:center">
              <div style="background:#fff;padding:12px;border-radius:12px;box-shadow:var(--e-1);position:relative">
                ${qr(150, '#7A1F2B', 21, 7)}
                <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">
                  <div style="width:34px;height:34px;border-radius:10px;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 4px #fff">
                    <span class="script" style="font-size:20px;color:var(--bx-700);line-height:1">M</span></div></div></div></div>
            <div class="col g14 mt18">
              <div class="fld"><span class="lb">Couleur du code</span>
                <div class="row g8">${[
                  '#1C1614',
                  '#7A1F2B',
                  '#B8925C',
                  '#46413A',
                  '#3A5F86',
                ]
                  .map(
                    (c, i) => `
                  <span style="width:34px;height:34px;border-radius:9px;background:${c};border:${i === 1 ? '2px solid var(--go-500)' : '1px solid var(--n-200)'};${i === 1 ? 'box-shadow:0 0 0 3px rgba(212,176,123,.2)' : ''}"></span>`,
                  )
                  .join('')}</div></div>
              <div class="fld"><span class="lb">Logo central</span>
                <div class="row g8">${[
                  ['Monogramme', true],
                  ['Aucun', false],
                  ['Importer', false],
                ]
                  .map(
                    (o) => `
                  <span class="btn ${o[1] ? 'pri' : 'sec'} sm" style="flex:1;justify-content:center">${o[0]}</span>`,
                  )
                  .join('')}</div></div>
              <div class="fld"><span class="lb">Cadre</span>
                <div class="row g8">${[
                  ['Sans', false],
                  ['Fin', true],
                  ['Arrondi', false],
                  ['Étiquette', false],
                ]
                  .map(
                    (o) => `
                  <span class="btn ${o[1] ? 'pri' : 'sec'} sm" style="flex:1;justify-content:center;padding:0 8px">${o[0]}</span>`,
                  )
                  .join('')}</div></div>
              <div class="fld"><span class="lb">Texte sous le code</span><div class="inp" style="height:38px;font-size:13px">Scannez pour ouvrir l’invitation</div></div>
              <div class="fld"><span class="lb">Format d’export</span>
                <div class="row g8">${[
                  ['PNG', true],
                  ['PDF', false],
                  ['SVG', false],
                ]
                  .map(
                    (o) => `
                  <span class="btn ${o[1] ? 'pri' : 'sec'} sm" style="flex:1;justify-content:center">${o[0]}</span>`,
                  )
                  .join('')}</div>
                <div class="row g10 aic mt8"><span class="chk on">${ic('check')}</span><span class="cap dim">Haute résolution 300 dpi (impression)</span></div></div>
              <div class="fld"><span class="lb">Destination</span>
                <div class="inp" style="height:38px;font-size:12px;justify-content:space-between">myevents.app/yasmine-adam${ic('pen', 'i14')}</div>
                <span class="hint">Modifier la destination ne change pas le QR déjà imprimé.</span></div>
            </div></div>
          <div style="padding:14px 18px;border-top:1px solid var(--n-100);display:flex;gap:10px">
            ${btn('Réinitialiser', 'ghost', null, 'sm')}<span style="flex:1"></span>${btn('Télécharger', 'pri', 'download', 'sm')}</div>
        </div></div></div>`,
    ),
  };
}

/* ============ 31 · PHOTOS & VIDÉOS ============ */
function p31() {
  const items = [
    [1, 'photo', 'ok'],
    [2, 'photo', 'ok'],
    [3, 'video', 'warn'],
    [4, 'photo', 'ok'],
    [5, 'photo', 'warn'],
    [6, 'photo', 'ok'],
    [7, 'video', 'ok'],
    [8, 'photo', 'ok'],
    [9, 'photo', 'ok'],
    [10, 'photo', 'warn'],
    [11, 'photo', 'ok'],
    [12, 'video', 'ok'],
    [13, 'photo', 'ok'],
    [14, 'photo', 'ok'],
    [15, 'photo', 'ok'],
  ];
  const hs = [
    210, 160, 240, 180, 150, 200, 170, 230, 155, 195, 215, 165, 185, 205, 175,
  ];
  return {
    n: '31',
    slug: 'photos-videos',
    title: 'Photos & vidéos',
    w: 1440,
    h: 1180,
    group: 'Souvenirs',
    html: shell(
      'Photos & vidéos',
      'Photos & vidéos',
      `
    ${phead(
      'Souvenirs photo &amp; vidéo',
      '186 fichiers déposés par 42 contributeurs',
      `${btn('Modération', 'sec', 'shield')}${btn('Tout télécharger', 'sec', 'download')}${btn('Ajouter des médias', 'pri', 'upload')}`,
    )}
    <div class="row g20 ais">
      <div class="fx">
        <div class="card" style="padding:20px;display:flex;gap:24px;align-items:center;background:var(--go-50);border-color:var(--go-200)">
          <div style="background:#fff;padding:11px;border-radius:12px;box-shadow:var(--e-1)">${qr(104, '#7A1F2B', 21, 29)}</div>
          <div style="flex:1">
            <div class="row g10 aic"><span class="h3" style="font-size:17px">Lien de collecte</span>${badge('Actif', 'ok')}</div>
            <div class="cap dim mt6">Affichez ce QR code sur les tables : vos invités déposent leurs photos et vidéos sans créer de compte.</div>
            <div class="row g10 aic mt14">
              <div class="inp" style="height:36px;flex:1;max-width:340px;font-size:13px;background:#fff">${ic('link', 'i14')}myevents.app/yasmine-adam/photos</div>
              ${btn('Copier le lien', 'sec', 'copy', 'sm')}${btn('Télécharger le QR', 'sec', 'download', 'sm')}${btn('Partager', 'pri', 'share', 'sm')}</div>
          </div>
          <div style="width:1px;height:96px;background:var(--go-200)"></div>
          <div class="col g14" style="width:190px">
            ${[
              ['186', 'fichiers'],
              ['2,4 Go', 'sur 10 Go'],
              ['42', 'contributeurs'],
            ]
              .map(
                (s) => `
            <div class="row between aic"><span class="cap dim">${s[1]}</span><span class="h3" style="font-size:18px">${s[0]}</span></div>`,
              )
              .join('')}
            <div class="prog gold" style="margin-top:-4px"><i style="width:24%"></i></div></div>
        </div>

        <div class="row between aic mt20">
          <div class="row g8">${[
            'Tous · 186',
            'Photos · 152',
            'Vidéos · 34',
            'En attente · 12',
            'Approuvés · 168',
            'Masqués · 6',
          ]
            .map(
              (f, i) => `
            <span class="btn ${i === 0 ? 'pri' : 'sec'} sm" style="border-radius:999px">${f}</span>`,
            )
            .join('')}</div>
          <div class="row g8"><span class="btn sec sm">${ic('sliders', 'i14')}Plus récents${ic('cdown', 'i14')}</span>
            <span class="seg"><span class="on">${ic('grid', 'i14')}</span><span>${ic('menu', 'i14')}</span></span></div></div>

        <div style="column-count:5;column-gap:14px;margin-top:18px">
          ${items
            .map(
              (
                it,
                i,
              ) => `<div style="break-inside:avoid;margin-bottom:14px;border-radius:12px;overflow:hidden;position:relative;background:${tint(i)};height:${hs[i]}px;border:1px solid var(--n-200)">
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(122,31,43,.22)">${ic(it[1] === 'video' ? 'video' : 'image', 'i32')}</div>
            <div style="position:absolute;top:8px;left:8px"><span class="chk" style="background:rgba(255,255,255,.9);border-color:rgba(0,0,0,.08)"></span></div>
            ${
              it[1] === 'video'
                ? `<div style="position:absolute;top:8px;right:8px;background:rgba(28,22,20,.6);border-radius:6px;padding:3px 6px;display:flex;align-items:center;gap:4px">
              <span style="color:#fff">${ic('play', 'i14')}</span><span class="mic" style="color:#fff;font-weight:400">0:${20 + i}</span></div>`
                : ''
            }
            ${it[2] === 'warn' ? `<div style="position:absolute;bottom:8px;left:8px">${badge('En attente', 'warn')}</div>` : ''}
            <div style="position:absolute;bottom:0;left:0;right:0;padding:10px;background:linear-gradient(180deg,transparent,rgba(28,22,20,.55));display:flex;align-items:center;justify-content:space-between">
              <span class="mic" style="color:#fff;font-weight:400">${['Amina', 'Karim', 'Nour', 'Leïla', 'Yassine'][i % 5]}</span>
              <div class="row g4">${['check', 'eye', 'trash'].map((a) => `<span style="width:22px;height:22px;border-radius:6px;background:rgba(255,255,255,.9);display:flex;align-items:center;justify-content:center;color:var(--n-700)">${ic(a, 'i14')}</span>`).join('')}</div></div>
          </div>`,
            )
            .join('')}
        </div>
      </div>
      <div style="width:300px;flex:0 0 300px">
        <div class="card pad">
          <div class="over muted">Modération</div>
          <div class="row between aic mt14"><span class="b" style="color:var(--n-800)">Validation avant publication</span><span class="tgl on"></span></div>
          <div class="cap dim mt8">Rien n’apparaît dans la galerie invités sans votre accord.</div>
          <div style="height:1px;background:var(--n-100);margin:16px 0"></div>
          <div class="row between aic"><span class="capm">12 fichiers en attente</span>${badge('À traiter', 'warn')}</div>
          <div class="row g8 mt12">${btn('Tout approuver', 'pri', 'check', 'sm')}${btn('Examiner', 'sec', null, 'sm')}</div></div>
        <div class="card pad mt16"><div class="over muted">Top contributeurs</div>
          <div class="col g12 mt14">
            ${[
              ['Amina Cherkaoui', '24 fichiers'],
              ['Karim Haddad', '19 fichiers'],
              ['Nour Belkacem', '17 fichiers'],
              ['Leïla Amrani', '14 fichiers'],
            ]
              .map(
                (c, i) => `
            <div class="row g10 aic"><span class="av${i % 2 ? ' g' : ''}">${c[0]
              .split(' ')
              .map((w) => w[0])
              .join('')}</span>
            <span class="cap" style="flex:1;color:var(--n-800)">${c[0]}</span><span class="mic muted" style="font-weight:400">${c[1]}</span></div>`,
              )
              .join('')}</div></div>
        <div class="card pad mt16"><div class="over muted">Stockage</div>
          <div class="row between aic mt12"><span class="h3" style="font-size:20px">2,4 Go</span><span class="cap muted">sur 10 Go</span></div>
          <div class="prog mt10"><i style="width:24%"></i></div>
          <div class="col g8 mt14">
            ${[
              ['Photos', '1,6 Go'],
              ['Vidéos', '0,8 Go'],
            ]
              .map(
                (r) =>
                  `<div class="row between"><span class="cap dim">${r[0]}</span><span class="capm">${r[1]}</span></div>`,
              )
              .join('')}</div>
          <div class="mt14">${btn('Augmenter le stockage', 'sec', 'plus', 'sm blk')}</div></div>
      </div></div>`,
    ),
  };
}

/* ============ 32 · LIVRE D'OR AUDIO ============ */
function p32() {
  const M = [
    ['Amina Cherkaoui', '0:48', 'il y a 12 min', 'ok', true],
    ['Karim Haddad', '1:22', 'il y a 3 h', 'ok', false],
    ['Nour Belkacem', '0:36', 'il y a 5 h', 'warn', false],
    ['Leïla Amrani', '2:04', 'hier · 22:14', 'ok', false],
    ['Yassine Benali', '0:55', 'hier · 19:02', 'ok', false],
    ['Farida Ferrand', '1:47', 'il y a 2 j', 'ok', false],
    ['Thomas Girard', '0:29', 'il y a 2 j', 'warn', false],
  ];
  const wave = (n, active) => {
    let s = '';
    for (let i = 0; i < n; i++) {
      const h = 8 + ((i * 37) % 20);
      s += `<b class="${active && i < n * 0.4 ? 'p' : ''}" style="height:${h}px"></b>`;
    }
    return `<div class="wave">${s}</div>`;
  };
  return {
    n: '32',
    slug: 'livre-audio',
    title: 'Livre d’or audio',
    w: 1440,
    h: 1024,
    group: 'Souvenirs',
    html: shell(
      'Livre d’or audio',
      'Livre d’or audio',
      `
    ${phead(
      'Livre d’or audio',
      '32 messages · 47 minutes · 18 contributeurs',
      `${btn('Exporter l’album', 'sec', 'download')}${btn('Partager le QR', 'pri', 'share')}`,
    )}
    <div class="row g20 ais">
      <div class="fx">
        <div class="card" style="padding:20px;display:flex;gap:24px;align-items:center;background:var(--go-50);border-color:var(--go-200)">
          <div style="background:#fff;padding:11px;border-radius:12px;box-shadow:var(--e-1)">${qr(104, '#7A1F2B', 21, 21)}</div>
          <div style="flex:1">
            <div class="row g10 aic"><span class="h3" style="font-size:17px">« Laissez-nous un souvenir de votre voix »</span>${badge('Actif', 'ok')}</div>
            <div class="cap dim mt6">Le QR ouvre directement l’enregistreur : pas d’application, pas de compte.</div>
            <div class="row g10 aic mt14">
              <div class="inp" style="height:36px;flex:1;max-width:320px;font-size:13px;background:#fff">${ic('link', 'i14')}myevents.app/yasmine-adam/audio</div>
              ${btn('Copier le lien', 'sec', 'copy', 'sm')}${btn('Télécharger le QR', 'sec', 'download', 'sm')}</div></div>
          <div style="width:1px;height:88px;background:var(--go-200)"></div>
          <div class="col g14" style="width:170px">
            ${[
              ['32', 'messages'],
              ['47 min', 'de souvenirs'],
              ['18', 'contributeurs'],
            ]
              .map(
                (s) => `
            <div class="row between aic"><span class="cap dim">${s[1]}</span><span class="h3" style="font-size:18px">${s[0]}</span></div>`,
              )
              .join('')}</div>
        </div>
        <div class="row between aic mt20">
          <div class="row g8">${['Tous · 32', 'Approuvés · 28', 'En attente · 4', 'Favoris · 6'].map((f, i) => `<span class="btn ${i === 0 ? 'pri' : 'sec'} sm" style="border-radius:999px">${f}</span>`).join('')}</div>
          <div class="row g8">${btn('Tout lire', 'sec', 'play', 'sm')}<span class="btn sec sm">${ic('sliders', 'i14')}Plus récents${ic('cdown', 'i14')}</span></div></div>
        <div class="card mt16" style="padding:0;overflow:hidden">
          ${M.map(
            (
              m,
              i,
            ) => `<div style="padding:16px 20px;display:flex;align-items:center;gap:16px;${i ? 'border-top:1px solid var(--n-100)' : ''};${m[4] ? 'background:var(--go-50)' : ''}">
            <span style="width:40px;height:40px;flex:0 0 40px;border-radius:999px;background:${m[4] ? 'var(--bx-700)' : 'var(--n-50)'};color:${m[4] ? '#fff' : 'var(--n-600)'};display:flex;align-items:center;justify-content:center;border:1px solid ${m[4] ? 'var(--bx-700)' : 'var(--n-200)'}">${ic(m[4] ? 'pause' : 'play', 'i16')}</span>
            <span class="av lg${i % 2 ? ' g' : ''}">${m[0]
              .split(' ')
              .map((w) => w[0])
              .join('')}</span>
            <div style="width:170px;flex:0 0 170px"><div class="bm">${m[0]}</div><div class="mic muted mt2" style="font-weight:400">${m[2]}</div></div>
            <div style="flex:1">${wave(56, m[4])}</div>
            <span class="capm" style="width:44px;text-align:right">${m[1]}</span>
            ${m[3] === 'warn' ? badge('À valider', 'warn') : badge('Publié', 'ok')}
            <div class="row g6">${btn('', 'sec', 'check', 'sm')}${btn('', 'sec', 'download', 'sm')}${btn('', 'sec', 'star', 'sm')}${btn('', 'ghost', 'more', 'sm')}</div>
          </div>`,
          ).join('')}
          <div style="padding:13px 20px;border-top:1px solid var(--n-100);display:flex;align-items:center;justify-content:space-between">
            <span class="cap muted">1 – 7 sur 32 messages</span>
            <div class="row g8 aic"><span class="btn sec sm" style="padding:0 9px">${ic('cleft', 'i14')}</span>
              ${[1, 2, 3, 4, 5].map((p) => `<span class="btn ${p === 1 ? 'pri' : 'ghost'} sm" style="min-width:30px;justify-content:center">${p}</span>`).join('')}
              <span class="btn sec sm" style="padding:0 9px">${ic('cright', 'i14')}</span></div></div></div>
      </div>
      <div style="width:300px;flex:0 0 300px">
        <div class="card pad">
          <div class="over muted">Lecture en cours</div>
          <div class="row g12 aic mt14"><span class="av xl">AC</span>
            <div><div class="bm">Amina Cherkaoui</div><div class="cap muted mt2">0:48 · il y a 12 min</div></div></div>
          <div class="mt16">${wave(44, true)}</div>
          <div class="row between mt8"><span class="mic muted" style="font-weight:400">0:19</span><span class="mic muted" style="font-weight:400">0:48</span></div>
          <div class="row g10 center mt16">
            <span class="btn sec sm" style="padding:0 9px">${ic('aleft', 'i16')}</span>
            <span style="width:44px;height:44px;border-radius:999px;background:var(--bx-700);color:#fff;display:flex;align-items:center;justify-content:center">${ic('pause', 'i18')}</span>
            <span class="btn sec sm" style="padding:0 9px">${ic('aright', 'i16')}</span></div>
          <div class="row g8 mt16">${btn('Approuver', 'pri', 'check', 'sm')}${btn('', 'sec', 'download', 'sm')}${btn('', 'dgr', 'trash', 'sm')}</div></div>
        <div class="card pad mt16"><div class="over muted">Modération</div>
          <div class="row between aic mt14"><span class="b" style="color:var(--n-800)">Validation avant publication</span><span class="tgl on"></span></div>
          <div class="row between aic mt12"><span class="b" style="color:var(--n-800)">Durée maximale</span><span class="capm">3 min</span></div>
          <div class="row between aic mt12"><span class="b" style="color:var(--n-800)">Message d’accueil</span><span style="color:var(--n-400)">${ic('pen', 'i16')}</span></div></div>
        <div class="card pad mt16" style="background:var(--go-50);border-color:var(--go-200)">
          <div class="row g10 ais">${ic('sparkle', 'i16').replace('class="ic i16"', 'class="ic i16" style="stroke:var(--go-700);margin-top:2px"')}
          <div><div class="capm" style="color:var(--go-700)">Album audio</div>
          <div class="cap dim mt6">Compilez les 32 messages en un fichier unique à offrir aux familles.</div>
          <div class="mt12">${btn('Générer l’album', 'gold', null, 'sm')}</div></div></div></div>
      </div></div>`,
    ),
  };
}

/* ============ 33 · CARTE DE REMERCIEMENT ============ */
function p33() {
  const models = [
    'Ivoire &amp; or',
    'Bordeaux',
    'Photo pleine page',
    'Minimal',
    'Floral',
    'Calligraphie',
  ];
  return {
    n: '33',
    slug: 'carte-remerciement',
    title: 'Éditeur carte de remerciement',
    w: 1440,
    h: 1024,
    cls: 'screen solo',
    group: 'Souvenirs',
    html: `
  <div style="height:1024px;display:flex;flex-direction:column;background:var(--n-25)">
    <div class="stu-hd">
      <div class="row g14 aic"><span class="btn ghost sm" style="padding:0 6px">${ic('aleft', 'i16')}</span>
        <div><div class="bm">Carte de remerciement</div>
          <div class="row g6 aic mt2"><span style="width:6px;height:6px;border-radius:999px;background:var(--ok)"></span><span class="mic muted" style="font-weight:400">Enregistré automatiquement</span></div></div></div>
      <span class="seg"><span class="on">Recto</span><span>Verso</span></span>
      <div class="row g10 aic">
        <span class="btn sec sm" style="padding:0 9px">${ic('undo', 'i16')}</span><span class="btn sec sm" style="padding:0 9px">${ic('redo', 'i16')}</span>
        <span class="tb-vd" style="height:22px"></span>${btn('Aperçu', 'sec', 'eye', 'sm')}${btn('Exporter PDF', 'sec', 'download', 'sm')}${btn('Exporter PNG', 'gold', 'download', 'sm')}</div></div>
    <div style="flex:1;display:flex;min-height:0">
      <div class="stu-l">
        <div style="padding:16px 16px 12px;border-bottom:1px solid var(--n-100)"><span class="over muted">Modèles</span></div>
        <div style="flex:1;padding:14px;overflow:hidden">
          <div class="grid g2" style="gap:12px">
            ${models
              .map(
                (
                  m,
                  i,
                ) => `<div style="border-radius:11px;overflow:hidden;border:${i === 0 ? '2px solid var(--go-500)' : '1px solid var(--n-200)'};${i === 0 ? 'box-shadow:0 0 0 3px rgba(212,176,123,.16)' : ''}">
              <div style="height:88px;background:${i === 1 ? '#7A1F2B' : tint(i)};display:flex;flex-direction:column;align-items:center;justify-content:center">
                <span class="script" style="font-size:15px;color:${i === 1 ? '#EFE0C7' : '#7A1F2B'}">Merci</span>
                <span class="mic mt4" style="font-size:6.5px;letter-spacing:1px;color:${i === 1 ? 'rgba(239,224,199,.7)' : 'var(--warm)'}">S &amp; S · 23.10.26</span></div>
              <div style="padding:7px 9px;background:#fff"><span class="mic" style="font-weight:500">${m}</span></div></div>`,
              )
              .join('')}</div>
          <div style="height:1px;background:var(--n-100);margin:16px 0"></div>
          <div class="over muted">Éléments</div>
          <div class="col g8 mt12">
            ${[
              ['Texte', 'type'],
              ['Photo', 'image'],
              ['QR Photo/Vidéo', 'qr'],
              ['QR Livre audio', 'mic'],
              ['Ornement doré', 'sparkle'],
              ['Monogramme', 'pen'],
            ]
              .map(
                (e) => `
            <div class="row g10 aic" style="padding:9px 11px;border-radius:10px;border:1px solid var(--n-200);background:#fff">
              <span style="color:var(--n-500)">${ic(e[1], 'i16')}</span><span class="b" style="color:var(--n-700);flex:1">${e[0]}</span>
              <span style="color:var(--n-300)">${ic('plus', 'i14')}</span></div>`,
              )
              .join('')}</div>
        </div></div>
      <div class="stu-c" style="align-items:center;justify-content:center;flex-direction:column">
        <div style="position:relative">
          <div style="position:absolute;inset:-26px;border:1px dashed var(--n-300);border-radius:6px"></div>
          <div style="position:absolute;inset:-14px;border:1px dashed rgba(163,47,47,.35);border-radius:4px"></div>
          <div style="width:420px;height:594px;background:var(--cream);box-shadow:var(--e-3);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px;text-align:center;position:relative">
            <div style="position:absolute;top:24px;left:24px;right:24px;bottom:24px;border:1px solid rgba(184,146,92,.35)"></div>
            <div class="bism" style="font-family:var(--arabic);direction:rtl;font-size:19px;color:var(--go-600)">شكراً لكم</div>
            <div style="width:40px;height:1px;background:rgba(184,146,92,.6);margin:18px 0"></div>
            <div class="script" style="font-size:56px;line-height:64px;color:var(--bx-700)">Merci</div>
            <div class="s-body mt16" style="font-size:14px;line-height:24px;color:var(--warm);max-width:250px">
              Merci d’avoir partagé ce jour avec nous.<br>Votre présence en a fait un souvenir<br>que nous garderons pour toujours.</div>
            <div class="script mt24" style="font-size:26px;color:var(--bx-700)">Yasmine &amp; Adam</div>
            <div class="mic mt10" style="letter-spacing:2px;color:var(--warm)">06 · 06 · 2026</div>
            <div class="row g20 mt32">
              ${[
                ['Photos', '29'],
                ['Livre audio', '21'],
              ]
                .map(
                  (q) => `<div class="col aic g6">
                <div style="background:#fff;padding:6px;border-radius:8px;border:1px solid rgba(184,146,92,.3)">${qr(56, '#7A1F2B', 21, Number(q[1]))}</div>
                <span class="mic" style="font-size:7px;letter-spacing:.8px;color:var(--warm);font-weight:400">${q[0]}</span></div>`,
                )
                .join('')}</div>
          </div>
          <div style="position:absolute;top:-26px;left:50%;transform:translateX(-50%) translateY(-18px)">
            <span class="mic muted" style="font-weight:400">Fond perdu 3 mm</span></div>
        </div>
        <div class="row g10 aic mt20">
          <span class="btn sec sm" style="background:#fff">${ic('zout', 'i14')}</span>
          <span class="btn sec sm" style="background:#fff">75 %${ic('cdown', 'i14')}</span>
          <span class="btn sec sm" style="background:#fff">${ic('zin', 'i14')}</span>
          <span class="tb-vd" style="height:20px"></span>
          <span class="btn sec sm" style="background:#fff">A6 · 105 × 148 mm${ic('cdown', 'i14')}</span></div>
      </div>
      <div class="stu-r">
        <div style="padding:16px 18px 0"><div class="row between aic"><span class="over muted">Propriétés</span><span class="badge neu">Texte</span></div>
          <div class="h3 mt10" style="font-size:17px">Message principal</div></div>
        <div style="flex:1;overflow:hidden;padding:18px">
          <div class="col g14">
            <div class="fld"><span class="lb">Contenu</span>
              <div class="inp ta" style="min-height:82px;font-size:13px;line-height:20px;color:var(--n-800)">Merci d’avoir partagé ce jour avec nous. Votre présence en a fait un souvenir que nous garderons pour toujours.</div></div>
            <div class="row g10"><div class="fld" style="flex:1"><span class="lb">Police</span><div class="inp" style="height:36px;font-size:12px;justify-content:space-between">Cormorant${ic('cdown', 'i14')}</div></div>
              <div class="fld" style="width:80px"><span class="lb">Taille</span><div class="inp" style="height:36px;font-size:12px">14</div></div></div>
            <div class="fld"><span class="lb">Alignement</span>
              <div class="row g6">${['Gauche', 'Centre', 'Droite', 'Justifié'].map((x, k) => `<span class="btn ${k === 1 ? 'pri' : 'sec'} sm" style="flex:1;justify-content:center;padding:0 6px;font-size:11px">${x}</span>`).join('')}</div></div>
          </div>
          <div class="acc mt18"><span class="nm">Hérité de l’invitation</span><span style="color:var(--n-400)">${ic('cup', 'i16')}</span></div>
          <div class="col g10 mt10">
            ${[
              ['Palette', 'Bordeaux &amp; ivoire', true],
              ['Typographies', 'Cormorant · Great Vibes', true],
              ['Noms des mariés', 'Yasmine &amp; Adam', true],
              ['Date', '6 juin 2026', true],
              ['Ornements', 'Filet doré', true],
            ]
              .map(
                (r) => `
            <div class="row between aic"><span class="cap dim">${r[0]}</span>
              <div class="row g8 aic"><span class="capm">${r[1]}</span><span class="tgl on" style="width:32px;height:19px"></span></div></div>`,
              )
              .join('')}</div>
          <div class="acc mt18"><span class="nm">Codes QR</span><span style="color:var(--n-400)">${ic('cup', 'i16')}</span></div>
          <div class="col g10 mt10">
            <div class="row between aic"><span class="cap dim">QR Photos &amp; vidéos</span><span class="tgl on" style="width:32px;height:19px"></span></div>
            <div class="row between aic"><span class="cap dim">QR Livre d’or audio</span><span class="tgl on" style="width:32px;height:19px"></span></div>
            <div class="row between aic"><span class="cap dim">QR Galerie privée</span><span class="tgl" style="width:32px;height:19px"></span></div></div>
          <div class="alert info mt18" style="padding:11px 13px">${ic('info', 'i16')}<div><div class="tx" style="font-size:13px">Zone de sécurité</div><div class="ds">Gardez le texte à 5 mm des bords pour l’impression.</div></div></div>
        </div>
        <div style="padding:14px 18px;border-top:1px solid var(--n-100);display:flex;gap:10px">
          ${btn('Commander l’impression', 'sec', 'gift', 'sm')}<span style="flex:1"></span>${btn('Enregistrer', 'pri', null, 'sm')}</div>
      </div></div>
  </div>`,
  };
}

/* ============ 34 · OFFRES & PRODUITS ============ */
function p34() {
  const packs = [
    [
      'Invitation digitale',
      '14,99 €',
      [
        'Invitation personnalisable',
        'Studio complet',
        'Invités &amp; RSVP',
        'Envois illimités',
        'QR d’invitation',
      ],
      'Possédé',
      'ok',
    ],
    [
      'Invitation + Photo/Vidéo',
      '29,99 €',
      [
        'Tout le pack Invitation',
        'QR photos &amp; vidéos',
        '10 Go de stockage',
        'Modération',
        'Galerie privée',
      ],
      'Débloqué',
      'gld',
    ],
    [
      'Invitation + Photo/Vidéo + Audio',
      '39,99 €',
      [
        'Tout le pack précédent',
        'QR livre d’or audio',
        'Messages illimités',
        'Export album',
        'Carte de remerciement',
      ],
      'Disponible',
      'neu',
    ],
  ];
  const adds = [
    [
      'Livre d’or audio',
      'mic',
      '12,99 €',
      'Messages vocaux illimités, modération et export album.',
      'Ajouter',
      'gld',
    ],
    [
      'Carte de remerciement',
      'heart',
      '7,99 €',
      'Éditeur dédié, export PDF et PNG haute définition.',
      'Inclus',
      'ok',
    ],
    [
      'Stockage +20 Go',
      'image',
      '9,99 €',
      'Pour les événements très photographiés.',
      'Ajouter',
      'neu',
    ],
    [
      'Impression 100 QR de table',
      'qr',
      '24,99 €',
      'Cartons imprimés, livrés sous 5 jours.',
      'Ajouter',
      'neu',
    ],
  ];
  return {
    n: '34',
    slug: 'offres',
    title: 'Offres & produits',
    w: 1440,
    h: 1180,
    group: 'Offres',
    html: shell(
      'Offres & produits',
      'Offres & produits',
      `
    ${phead(
      'Offres &amp; produits',
      'Achat unique par événement · vos accès restent ouverts 12 mois après le 6 juin 2026',
      `${btn('Historique d’achats', 'sec', 'history')}`,
    )}
    <div class="card pad" style="display:flex;align-items:center;gap:20px;background:var(--go-50);border-color:var(--go-200)">
      <span style="width:44px;height:44px;border-radius:13px;background:#fff;border:1px solid var(--go-200);display:flex;align-items:center;justify-content:center;color:var(--go-700)">${ic('wallet', 'i20')}</span>
      <div style="flex:1"><div class="bm" style="color:var(--go-700)">Votre offre actuelle : Invitation + Photo/Vidéo</div>
        <div class="cap dim mt4">Acquise le 12 janvier 2026 · 29,99 € · accès jusqu’au 6 juin 2027</div></div>
      ${badge('Actif', 'ok')}${btn('Voir la facture', 'sec', 'file', 'sm')}</div>

    <div class="grid g3 mt20" style="gap:20px;align-items:start">
      ${packs
        .map(
          (
            p,
            i,
          ) => `<div class="price${i === 1 ? ' feat' : ''}" style="padding:26px">
        ${i === 1 ? '<span class="tag">Votre offre</span>' : ''}
        <div class="row between ais"><div class="h3" style="font-size:17px">${p[0]}</div>${badge(p[3], p[4])}</div>
        <div class="amt mt12" style="font-size:40px;line-height:48px">${p[1]}</div>
        <div class="cap muted">paiement unique · par événement</div>
        <ul style="list-style:none;padding:0;margin:18px 0 0">${p[2].map((x) => `<li>${ic('check', 'i16')}<span>${x}</span></li>`).join('')}</ul>
        <div class="mt24">${i === 0 ? btn('Inclus dans votre offre', 'dis', 'check', 'blk') : i === 1 ? btn('Offre actuelle', 'dis', 'check', 'blk') : btn('Passer à cette offre · +10 €', 'gold', 'aright', 'blk')}</div>
      </div>`,
        )
        .join('')}
    </div>

    <div class="mt32"><div class="over gold">Produits additionnels</div>
      <div class="grid g4c mt14" style="gap:20px">
        ${adds
          .map(
            (
              a,
            ) => `<div class="card pad" style="display:flex;flex-direction:column">
          <div class="row between ais">
            <span style="width:40px;height:40px;border-radius:12px;background:var(--go-50);border:1px solid var(--go-200);display:flex;align-items:center;justify-content:center;color:var(--go-700)">${ic(a[1], 'i18')}</span>
            ${badge(a[4], a[5])}</div>
          <div class="h3 mt14" style="font-size:16px">${a[0]}</div>
          <div class="cap dim mt6" style="flex:1">${a[3]}</div>
          <div class="row between aic mt16"><span class="s-title" style="font-size:22px;color:var(--bx-700)">${a[2]}</span>
            ${a[4] === 'Inclus' ? btn('Ouvrir', 'sec', null, 'sm') : a[4] === 'Ajouter' && a[5] === 'gld' ? btn('Ajouter', 'gold', 'plus', 'sm') : btn('Ajouter', 'sec', 'plus', 'sm')}</div></div>`,
          )
          .join('')}
      </div></div>

    <div class="row g20 mt32 ais">
      <div class="card pad fx">
        <div class="h3" style="font-size:16px">Ce que comprend votre offre</div>
        <div class="grid g2 mt16" style="gap:10px 24px">
          ${[
            ['Invitation personnalisable', 1],
            ['Studio complet', 1],
            ['Invités, foyers &amp; RSVP', 1],
            ['Envois e-mail et SMS', 1],
            ['QR d’invitation et de RSVP', 1],
            ['QR photos &amp; vidéos', 1],
            ['10 Go de stockage souvenirs', 1],
            ['Galerie privée invités', 1],
            ['Livre d’or audio', 0],
            ['Export album audio', 0],
            ['Carte de remerciement', 0],
            ['Support prioritaire', 0],
          ]
            .map(
              (f) => `
          <div class="row g10 aic"><span style="color:${f[1] ? 'var(--go-600)' : 'var(--n-300)'}">${ic(f[1] ? 'check' : 'lock', 'i16')}</span>
            <span class="b" style="color:${f[1] ? 'var(--n-800)' : 'var(--n-400)'}">${f[0]}</span></div>`,
            )
            .join('')}</div></div>
      <div class="card pad" style="width:340px;flex:0 0 340px;background:var(--ink);border:none">
        <div class="over" style="color:var(--go-500)">Compléter votre offre</div>
        <div class="s-title mt12" style="font-size:26px;color:#F3EFE7">Ajoutez le livre d’or audio</div>
        <div class="cap mt10" style="color:#8C8478;line-height:20px">Vos invités laissent un message vocal ; vous les réécoutez pour toujours. 32 messages en moyenne par mariage.</div>
        <div class="row g10 aic mt20"><span class="s-title" style="font-size:28px;color:var(--go-500)">+10 €</span>
          <span class="cap" style="color:#6B6459;text-decoration:line-through">12,99 €</span></div>
        <div class="mt16">${btn('Passer à l’offre complète', 'gold', 'sparkle', 'blk')}</div>
        <div class="cap mt12" style="color:#5C554C;text-align:center">Différence uniquement — pas de nouvel achat</div></div>
    </div>`,
    ),
  };
}

/* ============ 35 · PROFIL & PRÉFÉRENCES ============ */
const setMenu = (active) => `<div style="width:230px;flex:0 0 230px">
  <div class="card" style="padding:8px">
    ${[
      ['Profil', 'user'],
      ['Sécurité', 'shield'],
      ['Organisation', 'building'],
      ['Équipe', 'users'],
      ['Préférences', 'sliders'],
      ['Langue', 'globe'],
      ['Confidentialité', 'lock'],
      ['Facturation', 'card'],
      ['Historique', 'history'],
    ]
      .map(
        (m) => `
    <div class="row g11 aic" style="gap:11px;padding:10px 11px;border-radius:9px;${m[0] === active ? 'background:var(--bx-700)' : ''}">
      <span style="color:${m[0] === active ? '#fff' : 'var(--n-500)'}">${ic(m[1], 'i16')}</span>
      <span class="b" style="color:${m[0] === active ? '#fff' : 'var(--n-700)'};font-weight:${m[0] === active ? 500 : 400}">${m[0]}</span></div>`,
      )
      .join('')}
  </div></div>`;

function p35() {
  return {
    n: '35',
    slug: 'profil',
    title: 'Profil & préférences',
    w: 1440,
    h: 1024,
    group: 'Paramètres',
    html: shell(
      'Paramètres',
      'Paramètres',
      `
    ${phead('Paramètres', 'Compte, préférences et confidentialité')}
    <div class="row g24 ais">
      ${setMenu('Profil')}
      <div class="fx" style="max-width:840px">
        <div class="card pad" style="padding:26px">
          <div class="h3" style="font-size:17px">Profil</div>
          <div class="row g20 aic mt20">
            <span class="av xl" style="width:72px;height:72px;flex:0 0 72px;font-size:22px">AF</span>
            <div><div class="row g10">${btn('Changer la photo', 'sec', 'upload', 'sm')}${btn('Supprimer', 'ghost', null, 'sm')}</div>
              <div class="cap muted mt8">JPG ou PNG · 2 Mo maximum</div></div></div>
          <div class="grid g2 mt24" style="gap:16px">
            ${fld('Prénom', 'Adam', '')}${fld('Nom', 'Ferrand', '')}
            ${fld('Adresse e-mail', 'adam.ferrand@exemple.com', '')}${fld('Téléphone', '+33 6 12 34 56 78', '')}
          </div>
          <div class="fld mt16"><span class="lb">Rôle affiché aux invités</span><div class="inp" style="justify-content:space-between">Organisateur${ic('cdown', 'i16')}</div></div>
        </div>
        <div class="card pad mt20" style="padding:26px">
          <div class="h3" style="font-size:17px">Préférences</div>
          <div class="col g0 mt14">
            ${[
              [
                'Notifications par e-mail',
                'Nouvelles réponses RSVP, souvenirs déposés',
                true,
              ],
              [
                'Notifications par SMS',
                'Uniquement les événements critiques',
                false,
              ],
              [
                'Résumé hebdomadaire',
                'Chaque lundi matin, l’avancement de votre événement',
                true,
              ],
              [
                'Suggestions intelligentes',
                'Moments d’envoi, relances, checklist',
                true,
              ],
            ]
              .map(
                (p, i, a) => `
            <div class="row between aic" style="padding:14px 0;${i < a.length - 1 ? 'border-bottom:1px solid var(--n-100)' : ''}">
              <div><div class="bm">${p[0]}</div><div class="cap muted mt3">${p[1]}</div></div>
              <span class="tgl ${p[2] ? 'on' : ''}"></span></div>`,
              )
              .join('')}</div>
        </div>
        <div class="card pad mt20" style="padding:26px">
          <div class="h3" style="font-size:17px">Langue &amp; région</div>
          <div class="grid g2 mt16" style="gap:16px">
            <div class="fld"><span class="lb">Langue de l’interface</span><div class="inp" style="justify-content:space-between">Français${ic('cdown', 'i16')}</div></div>
            <div class="fld"><span class="lb">Fuseau horaire</span><div class="inp" style="justify-content:space-between">Europe/Paris (UTC+2)${ic('cdown', 'i16')}</div></div>
            <div class="fld"><span class="lb">Format de date</span><div class="inp" style="justify-content:space-between">6 juin 2026${ic('cdown', 'i16')}</div></div>
            <div class="fld"><span class="lb">Devise</span><div class="inp" style="justify-content:space-between">Euro (€)${ic('cdown', 'i16')}</div></div></div>
        </div>
        <div class="row between aic mt20">${btn('Annuler', 'ghost')}${btn('Enregistrer les modifications', 'pri', 'check')}</div>
      </div>
      <div style="width:280px;flex:0 0 280px">
        <div class="card pad"><div class="over muted">Sécurité</div>
          <div class="col g14 mt14">
            <div class="row between aic"><span class="cap dim">Mot de passe</span><span class="capm">Modifié il y a 3 mois</span></div>
            <div class="row between aic"><span class="cap dim">Double authentification</span>${badge('Activée', 'ok')}</div>
            <div class="row between aic"><span class="cap dim">Sessions actives</span><span class="capm">2 appareils</span></div></div>
          <div class="mt16">${btn('Gérer la sécurité', 'sec', 'shield', 'sm blk')}</div></div>
        <div class="card pad mt16"><div class="over muted">Compte</div>
          <div class="col g10 mt12">
            <div class="row between"><span class="cap dim">Créé le</span><span class="capm">12 janvier 2026</span></div>
            <div class="row between"><span class="cap dim">Événements</span><span class="capm">6</span></div>
            <div class="row between"><span class="cap dim">Plan</span><span class="capm">Achat par événement</span></div></div></div>
      </div></div>`,
    ),
  };
}

/* ============ 36 · ÉQUIPE ============ */
function p36() {
  const M = [
    [
      'Adam Ferrand',
      'adam.ferrand@exemple.com',
      'Owner',
      'brd',
      'Il y a 4 min',
      'AF',
    ],
    [
      'Yasmine Nadari',
      'yasmine@exemple.com',
      'Owner',
      'brd',
      'Il y a 2 h',
      'YN',
    ],
    [
      'Nadia Benkirane',
      'nadia@planner-co.fr',
      'Admin',
      'gld',
      'Hier · 18:22',
      'NB',
    ],
    [
      'Julie Marchand',
      'julie@planner-co.fr',
      'Editor',
      'info',
      'Il y a 3 j',
      'JM',
    ],
    [
      'Mère de Yasmine',
      'fatima.m@exemple.com',
      'Viewer',
      'neu',
      'Il y a 6 j',
      'FM',
    ],
    [
      'Traiteur — Le Jardin',
      'contact@lejardin.fr',
      'Viewer',
      'neu',
      'Jamais connecté',
      'LJ',
    ],
  ];
  const perms = [
    ['Modifier l’invitation', 1, 1, 1, 0],
    ['Gérer les invités', 1, 1, 1, 0],
    ['Envoyer des campagnes', 1, 1, 0, 0],
    ['Voir les statistiques', 1, 1, 1, 1],
    ['Modérer les souvenirs', 1, 1, 1, 0],
    ['Gérer la facturation', 1, 0, 0, 0],
    ['Inviter des membres', 1, 1, 0, 0],
    ['Supprimer l’événement', 1, 0, 0, 0],
  ];
  return {
    n: '36',
    slug: 'equipe',
    title: 'Équipe & rôles',
    w: 1440,
    h: 1024,
    group: 'Paramètres',
    html: shell(
      'Paramètres',
      'Équipe',
      `
    ${phead('Équipe', '6 membres · 2 propriétaires', `${btn('Gérer les rôles', 'sec', 'shield')}${btn('Inviter un membre', 'pri', 'plus')}`)}
    <div class="row g24 ais">
      ${setMenu('Équipe')}
      <div class="fx">
        <div class="card" style="padding:0;overflow:hidden">
          <table class="tbl" style="border:none;box-shadow:none;border-radius:0">
            <thead><tr><th>Membre</th><th>Adresse e-mail</th><th>Rôle</th><th>Dernière activité</th><th style="width:110px"></th></tr></thead>
            <tbody>${M.map(
              (m, i) => `<tr>
              <td class="nm"><div class="row g10 aic"><span class="av lg${i % 2 ? ' g' : ''}">${m[5]}</span>${m[0]}</div></td>
              <td style="font-size:13px">${m[1]}</td>
              <td>${badge(m[2], m[3])}</td>
              <td class="muted" style="font-size:13px">${m[4]}</td>
              <td><div class="row g6">${m[2] === 'Owner' ? '<span class="cap muted">—</span>' : btn('Modifier', 'sec', null, 'sm')}${m[2] === 'Owner' ? '' : btn('', 'ghost', 'more', 'sm')}</div></td></tr>`,
            ).join('')}
              <tr><td colspan="5" style="padding:14px 20px;background:var(--n-25)">
                <div class="row g12 aic">
                  <div class="inp ph" style="height:38px;flex:1;max-width:300px;background:#fff;font-size:13px">${ic('mail', 'i14')}adresse@exemple.com</div>
                  <div class="inp" style="height:38px;width:150px;font-size:13px;justify-content:space-between;background:#fff">Editor${ic('cdown', 'i14')}</div>
                  ${btn('Envoyer l’invitation', 'pri', 'send', 'sm')}</div></td></tr>
            </tbody></table></div>

        <div class="card pad mt20" style="padding:0">
          <div style="padding:18px 22px;border-bottom:1px solid var(--n-100)"><div class="h3" style="font-size:17px">Permissions par rôle</div>
            <div class="cap muted mt4">Les propriétaires ont tous les droits et ne peuvent pas être rétrogradés.</div></div>
          <table class="tbl" style="border:none;box-shadow:none;border-radius:0">
            <thead><tr><th style="width:330px">Action</th><th class="tc">Owner</th><th class="tc">Admin</th><th class="tc">Editor</th><th class="tc">Viewer</th></tr></thead>
            <tbody>${perms
              .map(
                (p) => `<tr><td style="color:var(--n-800)">${p[0]}</td>
              ${[1, 2, 3, 4].map((k) => `<td class="tc">${p[k] ? `<span style="color:var(--ok)">${ic('check', 'i18')}</span>` : `<span style="color:var(--n-300)">${ic('minus', 'i18')}</span>`}</td>`).join('')}</tr>`,
              )
              .join('')}
            </tbody></table></div>
      </div>
      <div style="width:280px;flex:0 0 280px">
        <div class="card pad"><div class="over muted">Invitations en attente</div>
          <div class="col g12 mt14">
            ${[
              ['thomas@lejardin.fr', 'Viewer', 'Envoyée il y a 2 j'],
              ['photo@studiolumen.fr', 'Editor', 'Envoyée hier'],
            ]
              .map(
                (p) => `
            <div class="card" style="padding:11px 13px;box-shadow:none">
              <div class="capm">${p[0]}</div>
              <div class="row between aic mt6"><span class="mic muted" style="font-weight:400">${p[2]}</span>${badge(p[1], 'neu')}</div>
              <div class="row g6 mt10">${btn('Renvoyer', 'sec', null, 'sm')}${btn('Annuler', 'ghost', null, 'sm')}</div></div>`,
              )
              .join('')}</div></div>
        <div class="card pad mt16" style="background:var(--go-50);border-color:var(--go-200)">
          <div class="row g10 ais">${ic('info', 'i16').replace('class="ic i16"', 'class="ic i16" style="stroke:var(--go-700);margin-top:2px"')}
          <div><div class="capm" style="color:var(--go-700)">Wedding planner</div>
          <div class="cap dim mt6">Donnez le rôle Admin à votre planner : il gère tout, sauf la facturation et la suppression.</div></div></div></div>
      </div></div>`,
    ),
  };
}

/* ============ 37 · FACTURATION ============ */
function p37() {
  const H = [
    [
      '12 janvier 2026',
      'Invitation + Photo/Vidéo',
      'Mariage Yasmine &amp; Adam',
      '29,99 €',
      'Payé',
      'ok',
      'FAC-2026-0412',
    ],
    [
      '12 janvier 2026',
      'Impression 100 QR de table',
      'Mariage Yasmine &amp; Adam',
      '24,99 €',
      'Payé',
      'ok',
      'FAC-2026-0413',
    ],
    [
      '12 mars 2026',
      'Invitation digitale',
      'Les 30 ans de Nour',
      '14,99 €',
      'Payé',
      'ok',
      'FAC-2026-0188',
    ],
    [
      '8 févr. 2026',
      'Invitation digitale',
      'Baby shower Inès',
      '14,99 €',
      'Payé',
      'ok',
      'FAC-2026-0102',
    ],
    [
      '8 févr. 2026',
      'Stockage +20 Go',
      'Baby shower Inès',
      '9,99 €',
      'Remboursé',
      'neu',
      'FAC-2026-0103',
    ],
  ];
  return {
    n: '37',
    slug: 'facturation',
    title: 'Facturation & achats',
    w: 1440,
    h: 1024,
    group: 'Paramètres',
    html: shell(
      'Paramètres',
      'Facturation',
      `
    ${phead('Facturation &amp; achats', '5 achats · 94,95 € au total', `${btn('Télécharger toutes les factures', 'sec', 'download')}`)}
    <div class="row g24 ais">
      ${setMenu('Facturation')}
      <div class="fx">
        <div class="grid g3" style="gap:16px">
          ${kpi('Total dépensé', '94,95 €', 'sur 6 événements')}
          ${kpi('Événements actifs', '2', 'accès ouverts', 'var(--ok)')}
          ${kpi('Produits possédés', '7', 'dont 2 additionnels', 'var(--go-700)')}</div>

        <div class="card pad mt20" style="padding:0">
          <div style="padding:18px 22px;border-bottom:1px solid var(--n-100);display:flex;align-items:center;justify-content:space-between">
            <div class="h3" style="font-size:17px">Droits actifs</div>${badge('2 événements', 'brd')}</div>
          <div style="padding:18px 22px">
            ${[
              [
                'Mariage Yasmine &amp; Adam',
                'Invitation + Photo/Vidéo',
                'Jusqu’au 6 juin 2027',
                82,
                'ok',
              ],
              [
                'Henné de Yasmine',
                'Invitation digitale',
                'Jusqu’au 5 juin 2027',
                82,
                'ok',
              ],
              [
                'Les 30 ans de Nour',
                'Invitation digitale',
                'Expiré le 12 mars 2027',
                100,
                'neu',
              ],
            ]
              .map(
                (e, i, a) => `
            <div style="padding:14px 0;${i < a.length - 1 ? 'border-bottom:1px solid var(--n-100)' : ''}">
              <div class="row between aic">
                <div><div class="bm">${e[0]}</div><div class="cap muted mt4">${e[1]} · ${e[2]}</div></div>
                <div class="row g10 aic">${badge(e[4] === 'ok' ? 'Actif' : 'Expiré', e[4])}${btn('Gérer', 'sec', null, 'sm')}</div></div>
              <div class="prog mt10" style="height:5px"><i style="width:${e[3]}%;background:${e[4] === 'ok' ? 'var(--bx-700)' : 'var(--n-300)'}"></i></div></div>`,
              )
              .join('')}
          </div></div>

        <div class="card mt20" style="padding:0;overflow:hidden">
          <div style="padding:18px 22px;border-bottom:1px solid var(--n-100);display:flex;align-items:center;justify-content:space-between">
            <div class="h3" style="font-size:17px">Historique des achats</div>
            <div class="row g8">${btn('Filtrer', 'sec', 'filter', 'sm')}${btn('Exporter CSV', 'sec', 'download', 'sm')}</div></div>
          <table class="tbl" style="border:none;box-shadow:none;border-radius:0">
            <thead><tr><th>Date</th><th>Produit</th><th>Événement</th><th>Montant</th><th>Statut</th><th>Facture</th></tr></thead>
            <tbody>${H.map(
              (
                h,
              ) => `<tr><td>${h[0]}</td><td class="nm">${h[1]}</td><td>${h[2]}</td>
              <td class="nm">${h[3]}</td><td>${badge(h[4], h[5])}</td>
              <td><span class="row g6 aic" style="color:var(--bx-700);font-weight:500;font-size:13px">${ic('download', 'i14')}${h[6]}</span></td></tr>`,
            ).join('')}</tbody></table></div>
      </div>
      <div style="width:280px;flex:0 0 280px">
        <div class="card pad"><div class="over muted">Moyen de paiement</div>
          <div class="card mt14" style="padding:14px;box-shadow:none;background:var(--ink);border:none">
            <div class="row between aic"><span class="mic" style="color:#8C8478;letter-spacing:1.4px">VISA</span><span style="color:var(--go-500)">${ic('card', 'i16')}</span></div>
            <div class="mt16" style="color:#F3EFE7;letter-spacing:2px;font-size:14px">•••• •••• •••• 6411</div>
            <div class="row between aic mt10"><span class="mic" style="color:#6B6459;font-weight:400">A. FERRAND</span><span class="mic" style="color:#6B6459;font-weight:400">09/28</span></div></div>
          <div class="row g8 mt14">${btn('Modifier', 'sec', null, 'sm')}${btn('Ajouter', 'ghost', 'plus', 'sm')}</div></div>
        <div class="card pad mt16"><div class="over muted">Informations de facturation</div>
          <div class="col g10 mt12">
            ${[
              ['Nom', 'Adam Ferrand'],
              ['Adresse', '340 route de Cézanne'],
              ['Ville', '13100 Le Tholonet'],
              ['Pays', 'France'],
              ['TVA', '—'],
            ]
              .map(
                (r) => `
            <div class="row between"><span class="cap dim">${r[0]}</span><span class="capm" style="text-align:right">${r[1]}</span></div>`,
              )
              .join('')}</div>
          <div class="mt14">${btn('Modifier', 'sec', 'pen', 'sm blk')}</div></div>
        <div class="alert info mt16">${ic('info')}<div><div class="tx">Pas d’abonnement</div><div class="ds">Aucun prélèvement récurrent n’est associé à votre compte.</div></div></div>
      </div></div>`,
    ),
  };
}

/* ============ 38 · CONFIDENTIALITÉ ============ */
function p38() {
  return {
    n: '38',
    slug: 'confidentialite',
    title: 'Confidentialité & données',
    w: 1440,
    h: 1024,
    group: 'Paramètres',
    html: shell(
      'Paramètres',
      'Confidentialité',
      `
    ${phead('Confidentialité &amp; données', 'Vous restez propriétaire de tout ce que vous et vos invités déposez.')}
    <div class="row g24 ais">
      ${setMenu('Confidentialité')}
      <div class="fx" style="max-width:840px">
        <div class="card pad" style="padding:26px">
          <div class="h3" style="font-size:17px">Visibilité de l’événement</div>
          <div class="col g0 mt14">
            ${[
              [
                'Invitation accessible par lien',
                'Toute personne disposant du lien peut la consulter',
                true,
              ],
              [
                'Protéger par un mot de passe',
                'Un code sera demandé avant l’accès',
                false,
              ],
              [
                'Masquer la liste des invités',
                'Vos invités ne voient pas qui d’autre est convié',
                true,
              ],
              [
                'Indexation par les moteurs de recherche',
                'Désactivé par défaut',
                false,
              ],
            ]
              .map(
                (p, i, a) => `
            <div class="row between aic" style="padding:14px 0;${i < a.length - 1 ? 'border-bottom:1px solid var(--n-100)' : ''}">
              <div><div class="bm">${p[0]}</div><div class="cap muted mt3">${p[1]}</div></div>
              <span class="tgl ${p[2] ? 'on' : ''}"></span></div>`,
              )
              .join('')}</div>
        </div>
        <div class="card pad mt20" style="padding:26px">
          <div class="h3" style="font-size:17px">Gestion des médias</div>
          <div class="col g0 mt14">
            ${[
              [
                'Modération avant publication',
                'Photos, vidéos et messages audio',
                true,
              ],
              [
                'Autoriser le téléchargement par les invités',
                'Depuis la galerie privée',
                false,
              ],
              ['Filigrane sur la galerie', 'Discret, en bas à droite', false],
              [
                'Suppression automatique après 12 mois',
                'Vous serez prévenu 30 jours avant',
                true,
              ],
            ]
              .map(
                (p, i, a) => `
            <div class="row between aic" style="padding:14px 0;${i < a.length - 1 ? 'border-bottom:1px solid var(--n-100)' : ''}">
              <div><div class="bm">${p[0]}</div><div class="cap muted mt3">${p[1]}</div></div>
              <span class="tgl ${p[2] ? 'on' : ''}"></span></div>`,
              )
              .join('')}</div>
        </div>
        <div class="card pad mt20" style="padding:26px">
          <div class="h3" style="font-size:17px">Exporter vos données</div>
          <div class="cap dim mt6">Une archive complète : invitation, invités, réponses, photos, vidéos et messages audio.</div>
          <div class="grid g3 mt18" style="gap:14px">
            ${[
              ['Liste des invités', 'CSV · 126 lignes', 'file'],
              ['Réponses RSVP', 'CSV · 96 réponses', 'checkc'],
              ['Souvenirs', 'ZIP · 2,4 Go', 'image'],
            ]
              .map(
                (e) => `
            <div class="card" style="padding:14px;box-shadow:none">
              <div class="row g10 aic">${ic(e[2], 'i16').replace('class="ic i16"', 'class="ic i16" style="stroke:var(--n-600)"')}<span class="capm">${e[0]}</span></div>
              <div class="mic muted mt6" style="font-weight:400">${e[1]}</div>
              <div class="mt12">${btn('Télécharger', 'sec', 'download', 'sm blk')}</div></div>`,
              )
              .join('')}</div>
          <div class="mt18">${btn('Demander l’archive complète', 'pri', 'download')}</div>
        </div>
        <div class="card pad mt20" style="padding:26px;border-color:#E3C4C4">
          <div class="h3" style="font-size:17px;color:var(--bad)">Zone sensible</div>
          <div class="col g0 mt14">
            ${[
              [
                'Supprimer les médias de l’événement',
                '186 fichiers · action irréversible',
                'Supprimer les médias',
              ],
              [
                'Supprimer l’événement',
                'Invitation, invités, réponses et souvenirs',
                'Supprimer l’événement',
              ],
              [
                'Supprimer mon compte',
                'Tous vos événements seront définitivement effacés',
                'Supprimer mon compte',
              ],
            ]
              .map(
                (r, i, a) => `
            <div class="row between aic" style="padding:14px 0;${i < a.length - 1 ? 'border-bottom:1px solid var(--n-100)' : ''}">
              <div><div class="bm">${r[0]}</div><div class="cap muted mt3">${r[1]}</div></div>
              ${btn(r[2], 'dgr', 'trash', 'sm')}</div>`,
              )
              .join('')}</div>
        </div>
      </div>
      <div style="width:280px;flex:0 0 280px">
        <div class="card pad"><div class="over muted">Où sont vos données</div>
          <div class="col g12 mt14">
            ${[
              ['Hébergement', 'France (Paris)'],
              ['Chiffrement', 'TLS 1.3 · AES-256'],
              ['Sous-traitants', '2 · liste publique'],
              ['Conservation', '12 mois après l’événement'],
            ]
              .map(
                (r) => `
            <div class="row between"><span class="cap dim">${r[0]}</span><span class="capm" style="text-align:right">${r[1]}</span></div>`,
              )
              .join('')}</div>
          <div class="mt16">${btn('Politique de confidentialité', 'sec', 'shield', 'sm blk')}</div></div>
        <div class="card pad mt16"><div class="over muted">Journal d’activité</div>
          <div class="col g12 mt14">
            ${[
              ['Export CSV des invités', 'il y a 3 j', 'Adam F.'],
              ['Modification des permissions', 'il y a 6 j', 'Yasmine N.'],
              ['Connexion depuis un nouvel appareil', 'il y a 8 j', 'Adam F.'],
            ]
              .map(
                (a) => `
            <div><div class="cap" style="color:var(--n-800)">${a[0]}</div>
            <div class="mic muted mt3" style="font-weight:400">${a[1]} · ${a[2]}</div></div>`,
              )
              .join('')}</div>
          <div class="mt14">${btn('Voir tout le journal', 'ghost', null, 'sm blk')}</div></div>
      </div></div>`,
    ),
  };
}

module.exports = [p30, p31, p32, p33, p34, p35, p36, p37, p38].map((f) => f());
