// Écrans 23 → 29 — Invités, RSVP, Envois, Statistiques
const L = require('./lib.js');
const { ic, btn, badge, kpi, fld, shell, phead } = L;

const initials = (n) =>
  n
    .replace(/&amp;/g, '&')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2);

const GUESTS = [
  [
    'Yasmine Nadari',
    'Foyer Nadari',
    'yasmine@exemple.com',
    'Ouverte',
    'Présente',
    'ok',
    'Tous',
    '1',
    'il y a 2 h',
  ],
  [
    'Yassine Benali',
    'Famille Benali',
    '+33 6 24 88 11 02',
    'Ouverte',
    'En attente',
    'warn',
    'Mairie · Dîner',
    '—',
    'il y a 1 j',
  ],
  [
    'Claire Dupont',
    'Famille Dupont',
    'claire.dupont@exemple.com',
    'Ouverte',
    'Absente',
    'bad',
    'Dîner',
    '—',
    'il y a 3 j',
  ],
  [
    'Karim Haddad',
    'Amis université',
    'karim.h@exemple.com',
    'Ouverte',
    'Présent',
    'ok',
    'Tous',
    '2',
    'il y a 5 h',
  ],
  [
    'Amina Cherkaoui',
    'Foyer Cherkaoui',
    'amina.c@exemple.com',
    'Ouverte',
    'Présente',
    'ok',
    'Cérémonie · Dîner',
    '1',
    'il y a 12 min',
  ],
  [
    'Julien Moreau',
    'Famille Moreau',
    '+33 6 71 05 44 90',
    'Envoyée',
    'En attente',
    'warn',
    'Dîner',
    '—',
    '—',
  ],
  [
    'Farida Ferrand',
    'Foyer Ferrand',
    'fatima.e@exemple.com',
    'Ouverte',
    'Présente',
    'ok',
    'Tous',
    '3',
    'hier',
  ],
  [
    'Thomas Girard',
    'Amis université',
    't.girard@exemple.com',
    'Non envoyée',
    'En attente',
    'warn',
    'Cocktail · Dîner',
    '—',
    '—',
  ],
  [
    'Nour Belkacem',
    'Amis lycée',
    'nour.b@exemple.com',
    'Ouverte',
    'Présente',
    'ok',
    'Cocktail · Dîner',
    '1',
    'il y a 8 h',
  ],
  [
    'Pierre Lambert',
    'Collègues',
    'p.lambert@exemple.com',
    'Ouverte',
    'Absent',
    'bad',
    'Dîner',
    '—',
    'il y a 2 j',
  ],
  [
    'Leïla Amrani',
    'Foyer Amrani',
    'leila.a@exemple.com',
    'Ouverte',
    'Présente',
    'ok',
    'Tous',
    '2',
    'il y a 1 j',
  ],
];

/* ============ 23 · INVITÉS ============ */
function p23() {
  return {
    n: '23',
    slug: 'invites',
    title: 'Invités (CRM)',
    w: 1440,
    h: 1024,
    group: 'Invités',
    html: shell(
      'Invités',
      'Invités',
      `
    ${phead(
      '126 invités',
      '42 foyers · 137 personnes attendues le jour J',
      `${btn('Importer CSV', 'sec', 'upload')}${btn('Exporter', 'sec', 'download')}${btn('Ajouter un invité', 'pri', 'plus')}`,
    )}
    <div class="grid g4c" style="gap:16px">
      ${kpi('Présents', '84', '67 % de réponses', 'var(--ok)')}
      ${kpi('Absents', '12', '9 % du total', 'var(--bad)')}
      ${kpi('En attente', '30', '24 % · relance suggérée', 'var(--warn)')}
      ${kpi('Personnes attendues', '137', '84 invités + 53 accompagnants', 'var(--bx-700)')}
    </div>
    <div class="card mt20" style="padding:0;overflow:hidden">
      <div style="padding:14px 20px;border-bottom:1px solid var(--n-100);display:flex;align-items:center;gap:12px">
        <div class="inp ph" style="width:300px;height:36px;background:var(--n-50);border-color:var(--n-200)">${ic('search', 'i14')}<span style="font-size:13px">Rechercher un invité, un foyer…</span></div>
        <div class="row g8">${[
          'Tous · 126',
          'Présents · 84',
          'Absents · 12',
          'En attente · 30',
        ]
          .map(
            (f, i) => `
          <span class="btn ${i === 0 ? 'pri' : 'sec'} sm" style="border-radius:999px">${f}</span>`,
          )
          .join('')}</div>
        <span style="flex:1"></span>
        <span class="btn sec sm">${ic('filter', 'i14')}Sous-événement${ic('cdown', 'i14')}</span>
        <span class="btn sec sm">${ic('home', 'i14')}Groupe${ic('cdown', 'i14')}</span>
        <span class="btn sec sm" style="padding:0 9px">${ic('sliders', 'i14')}</span></div>
      <div style="padding:10px 20px;background:var(--go-50);border-bottom:1px solid var(--go-200);display:flex;align-items:center;gap:14px">
        <span class="chk on">${ic('check')}</span>
        <span class="capm" style="color:var(--go-700)">3 invités sélectionnés</span>
        <span style="flex:1"></span>
        ${btn('Envoyer une invitation', 'pri', 'send', 'sm')}${btn('Attribuer un sous-événement', 'sec', 'calendar', 'sm')}
        ${btn('Exporter', 'sec', 'download', 'sm')}${btn('', 'dgr', 'trash', 'sm')}</div>
      <table class="tbl" style="border:none;box-shadow:none;border-radius:0">
        <thead><tr>
          <th style="width:34px"><span class="chk on" style="width:16px;height:16px">${ic('check')}</span></th>
          <th>Nom</th><th>Foyer</th><th>Contact</th><th>Invitation</th><th>RSVP</th><th>Événements</th><th>Accomp.</th><th>Dernière activité</th><th style="width:48px"></th></tr></thead>
        <tbody>${GUESTS.map(
          (g, i) => `<tr${i < 3 ? ' style="background:var(--go-50)"' : ''}>
          <td><span class="chk${i < 3 ? ' on' : ''}" style="width:16px;height:16px">${i < 3 ? ic('check') : ''}</span></td>
          <td class="nm"><div class="row g10 aic"><span class="av${i % 2 ? ' g' : ''}">${initials(g[0])}</span>${g[0]}</div></td>
          <td>${g[1]}</td><td style="font-size:13px">${g[2]}</td>
          <td>${badge(g[3], g[3] === 'Ouverte' ? 'ok' : g[3] === 'Envoyée' ? 'info' : 'neu')}</td>
          <td>${badge(g[4], g[5])}</td>
          <td style="font-size:13px">${g[6]}</td>
          <td>${g[7]}</td>
          <td style="font-size:13px" class="muted">${g[8]}</td>
          <td>${ic('more', 'i16')}</td></tr>`,
        ).join('')}</tbody></table>
      <div style="padding:13px 20px;border-top:1px solid var(--n-100);display:flex;align-items:center;justify-content:space-between">
        <span class="cap muted">1 – 11 sur 126 invités</span>
        <div class="row g8 aic">
          <span class="btn sec sm" style="padding:0 9px">${ic('cleft', 'i14')}</span>
          ${[1, 2, 3, 4].map((p) => `<span class="btn ${p === 1 ? 'pri' : 'ghost'} sm" style="min-width:30px;justify-content:center">${p}</span>`).join('')}
          <span class="cap muted">…</span><span class="btn ghost sm" style="min-width:30px;justify-content:center">12</span>
          <span class="btn sec sm" style="padding:0 9px">${ic('cright', 'i14')}</span></div></div>
    </div>`,
    ),
  };
}

/* ============ 24 · FICHE INVITÉ (drawer) ============ */
function p24() {
  const row = (l, v) =>
    `<div class="row between aic" style="padding:11px 0;border-bottom:1px solid var(--n-100)"><span class="cap muted">${l}</span><span class="capm" style="text-align:right;max-width:230px">${v}</span></div>`;
  return {
    n: '24',
    slug: 'fiche-invite',
    title: 'Fiche invité (drawer)',
    w: 1440,
    h: 1024,
    group: 'Invités',
    html: shell(
      'Invités',
      'Invités',
      `
    ${phead(
      '126 invités',
      '42 foyers · 137 personnes attendues le jour J',
      `${btn('Importer CSV', 'sec', 'upload')}${btn('Ajouter un invité', 'pri', 'plus')}`,
    )}
    <div class="card" style="padding:0;overflow:hidden;opacity:.55">
      <table class="tbl" style="border:none;box-shadow:none;border-radius:0">
        <thead><tr><th>Nom</th><th>Foyer</th><th>Contact</th><th>RSVP</th><th>Événements</th><th>Accomp.</th></tr></thead>
        <tbody>${GUESTS.slice(0, 8)
          .map(
            (
              g,
              i,
            ) => `<tr><td class="nm"><div class="row g10 aic"><span class="av${i % 2 ? ' g' : ''}">${initials(g[0])}</span>${g[0]}</div></td>
          <td>${g[1]}</td><td style="font-size:13px">${g[2]}</td><td>${badge(g[4], g[5])}</td><td style="font-size:13px">${g[6]}</td><td>${g[7]}</td></tr>`,
          )
          .join('')}</tbody></table></div>
    <div class="scrim"></div>
    <div class="drawer">
      <div style="padding:20px 24px;border-bottom:1px solid var(--n-100)">
        <div class="row between ais">
          <div class="row g14 aic"><span class="av xl">AC</span>
            <div><div class="h2" style="font-size:20px">Amina Cherkaoui</div>
              <div class="row g8 aic mt6">${badge('Présente', 'ok')}${badge('Foyer Cherkaoui', 'brd')}</div></div></div>
          <span class="btn ghost sm" style="padding:0 6px">${ic('close', 'i18')}</span></div>
        <div class="row g8 mt16">${btn('Modifier', 'sec', 'pen', 'sm')}${btn('Relancer', 'sec', 'send', 'sm')}${btn('Voir sa réponse', 'sec', 'eye', 'sm')}
          <span style="flex:1"></span>${btn('', 'ghost', 'more', 'sm')}</div></div>
      <div style="flex:1;overflow:hidden;padding:0 24px">
        <div class="tabs mt16" style="gap:22px"><span class="on" style="font-size:13px">Informations</span><span style="font-size:13px">Historique</span><span style="font-size:13px">Notes</span></div>
        <div class="mt16" style="overflow:hidden">
          <div class="over gold">Informations personnelles</div>
          <div class="mt6">${row('Nom complet', 'Amina Cherkaoui')}${row('Titre', 'Mme')}${row('Langue', 'Français')}</div>
          <div class="over gold mt20">Contact</div>
          <div class="mt6">${row('E-mail', 'amina.c@exemple.com')}${row('Téléphone', '+33 6 55 09 27 41')}${row('Canal préféré', 'E-mail')}</div>
          <div class="over gold mt20">Foyer &amp; accompagnants</div>
          <div class="mt6">${row('Foyer', 'Foyer Cherkaoui · 3 personnes')}${row('Contact principal', 'Oui')}${row('Accompagnants autorisés', '1 · Réda Cherkaoui')}</div>
          <div class="over gold mt20">Sous-événements autorisés</div>
          <div class="col g8 mt10">
            ${[
              ['Mairie d’Aix-en-Provence · 14:00', false],
              ['Cérémonie · 16:30', true],
              ['Cocktail · 18:00', true],
              ['Dîner &amp; soirée · 20:00', true],
            ]
              .map(
                (s) => `
            <div class="row g10 aic"><span class="chk ${s[1] ? 'on' : ''}">${s[1] ? ic('check') : ''}</span><span class="b" style="color:${s[1] ? 'var(--n-800)' : 'var(--n-400)'}">${s[0]}</span></div>`,
              )
              .join('')}</div>
          <div class="over gold mt20">Réponse RSVP</div>
          <div class="card pad mt10" style="box-shadow:none;background:var(--ok-bg);border-color:#CDE3D6">
            <div class="row between aic"><span class="capm" style="color:var(--ok)">Présente · 2 personnes</span><span class="mic muted" style="font-weight:400">Répondu il y a 12 min</span></div>
            <div class="cap dim mt8">« Avec grand plaisir ! Nous serons là dès la cérémonie. »</div></div>
          <div class="over gold mt20">Contraintes</div>
          <div class="mt6">${row('Régime alimentaire', 'Sans gluten (1) · Végétarien (1)')}${row('Accessibilité', 'Accès PMR nécessaire')}${row('Table souhaitée', 'Proche de la famille Nadari')}</div>
        </div></div>
      <div style="padding:16px 24px;border-top:1px solid var(--n-100);display:flex;gap:10px">
        ${btn('Supprimer', 'dgr', 'trash', 'sm')}<span style="flex:1"></span>${btn('Annuler', 'ghost', null, 'sm')}${btn('Enregistrer', 'pri', null, 'sm')}</div>
    </div>`,
    ),
  };
}

/* ============ 25 · FOYERS & GROUPES ============ */
function p25() {
  const H = [
    [
      'Famille Benali',
      'Yassine Benali',
      '5 personnes',
      'En attente',
      'warn',
      'Mairie · Dîner',
      ['YB', 'SB', 'LB', 'MB', 'KB'],
    ],
    [
      'Famille Dupont',
      'Claire Dupont',
      '3 personnes',
      'Absente',
      'bad',
      'Dîner',
      ['CD', 'PD', 'ED'],
    ],
    [
      'Amis université',
      'Karim Haddad',
      '8 personnes',
      'Partiel',
      'info',
      'Cocktail · Dîner',
      ['KH', 'TG', 'NB', 'JM', 'AL', 'RB', 'SM', 'FD'],
    ],
    [
      'Foyer Nadari',
      'Yasmine Nadari',
      '4 personnes',
      'Présente',
      'ok',
      'Tous',
      ['SE', 'ME', 'HE', 'YE'],
    ],
    [
      'Foyer Ferrand',
      'Farida Ferrand',
      '6 personnes',
      'Présente',
      'ok',
      'Tous',
      ['FE', 'AE', 'ME', 'SE', 'BE', 'NE'],
    ],
    [
      'Collègues',
      'Pierre Lambert',
      '4 personnes',
      'Partiel',
      'info',
      'Dîner',
      ['PL', 'AL', 'CL', 'DL'],
    ],
  ];
  return {
    n: '25',
    slug: 'foyers-groupes',
    title: 'Foyers & groupes',
    w: 1440,
    h: 1024,
    group: 'Invités',
    html: shell(
      'Foyers & groupes',
      'Foyers & groupes',
      `
    ${phead(
      'Foyers &amp; groupes',
      '42 foyers · un lien d’invitation unique par foyer',
      `${btn('Fusionner', 'sec', 'copy')}${btn('Créer un groupe', 'sec', 'plus')}${btn('Créer un foyer', 'pri', 'plus')}`,
    )}
    <div class="row between aic">
      <div class="row g8">${['Tous · 42', 'Foyers · 34', 'Groupes · 8', 'Sans réponse · 11'].map((f, i) => `<span class="btn ${i === 0 ? 'pri' : 'sec'} sm" style="border-radius:999px">${f}</span>`).join('')}</div>
      <div class="inp ph" style="width:280px;height:34px;background:#fff">${ic('search', 'i14')}<span style="font-size:13px">Rechercher un foyer…</span></div></div>
    <div class="grid g3 mt20" style="gap:20px">
      ${H.map(
        (h) => `<div class="card" style="padding:0;overflow:hidden">
        <div style="padding:18px 20px 14px">
          <div class="row between ais">
            <div><div class="h3" style="font-size:16px">${h[0]}</div>
              <div class="cap muted mt4">${h[2]} · ${h[5]}</div></div>
            ${badge(h[3], h[4])}</div>
          <div class="row g10 aic mt16">
            <div class="row">${h[6]
              .slice(0, 5)
              .map(
                (m, k) =>
                  `<span class="av${k % 2 ? ' g' : ''}" style="width:28px;height:28px;font-size:10px;margin-left:${k ? '-8px' : '0'};border:2px solid #fff">${m}</span>`,
              )
              .join('')}
              ${h[6].length > 5 ? `<span class="av" style="width:28px;height:28px;font-size:9px;margin-left:-8px;border:2px solid #fff;background:var(--n-100);color:var(--n-600)">+${h[6].length - 5}</span>` : ''}</div>
          </div>
          <div style="height:1px;background:var(--n-100);margin:16px 0"></div>
          <div class="row between aic"><span class="cap muted">Contact principal</span><span class="capm">${h[1]}</span></div>
          <div class="row between aic mt10"><span class="cap muted">Lien d’invitation</span>
            <span class="row g6 aic mic" style="color:var(--bx-700);font-weight:500">${ic('link', 'i14')}myevents.app/…/${h[0].toLowerCase().split(' ')[1] || 'foyer'}</span></div>
        </div>
        <div style="padding:12px 20px;background:var(--n-25);border-top:1px solid var(--n-100);display:flex;gap:8px">
          ${btn('Ouvrir', 'sec', null, 'sm')}${btn('Relancer', 'ghost', 'send', 'sm')}<span style="flex:1"></span>${btn('', 'ghost', 'more', 'sm')}</div></div>`,
      ).join('')}
      <div class="card" style="border-style:dashed;box-shadow:none;background:transparent;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:250px;gap:10px">
        <span style="width:44px;height:44px;border-radius:13px;background:var(--go-50);border:1px solid var(--go-200);display:flex;align-items:center;justify-content:center;color:var(--go-700)">${ic('home', 'i20')}</span>
        <span class="bm">Créer un foyer</span><span class="cap muted" style="max-width:210px;text-align:center">Regroupez les invités qui reçoivent une invitation commune.</span></div>
    </div>`,
    ),
  };
}

/* ============ 26 · IMPORT CSV ============ */
function p26() {
  const cols = [
    ['Colonne A', 'Prénom', 'Prénom', 'ok'],
    ['Colonne B', 'Nom', 'Nom', 'ok'],
    ['Colonne C', 'Email', 'Adresse e-mail', 'ok'],
    ['Colonne D', 'Tel', 'Téléphone', 'ok'],
    ['Colonne E', 'Famille', 'Foyer', 'ok'],
    ['Colonne F', 'Nb accomp.', 'Accompagnants autorisés', 'ok'],
    ['Colonne G', 'Régime', 'Régime alimentaire', 'ok'],
    ['Colonne H', 'Notes internes', '— Ignorer cette colonne', 'neu'],
  ];
  return {
    n: '26',
    slug: 'import-csv',
    title: 'Import CSV (assistant)',
    w: 1440,
    h: 1024,
    group: 'Invités',
    html: shell(
      'Invités',
      'Importer des invités',
      `
    <div style="max-width:1080px;margin:0 auto">
      ${phead('Importer vos invités', 'Fichier reconnu : liste-invites-mariage.csv · 138 lignes')}
      <div class="card pad" style="padding:22px 26px">
        <div class="row aic" style="gap:0">
          ${['Importer', 'Mapper les colonnes', 'Vérifier', 'Importer']
            .map(
              (s, i) => `
          <div class="row aic" style="${i < 3 ? 'flex:1' : ''}">
            <div class="row g8 aic"><span style="width:26px;height:26px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;
              ${i < 1 ? 'background:var(--bx-700);color:#fff' : i === 1 ? 'background:var(--go-500);color:#3A2A16' : 'background:var(--n-100);color:var(--n-400)'}">${i < 1 ? ic('check', 'i14') : i + 1}</span>
              <span class="cap" style="${i === 1 ? 'color:var(--n-900);font-weight:600' : 'color:var(--n-500)'}">${s}</span></div>
            ${i < 3 ? `<span style="flex:1;height:1px;background:${i < 1 ? 'var(--bx-700)' : 'var(--n-200)'};margin:0 14px"></span>` : ''}</div>`,
            )
            .join('')}
        </div></div>

      <div class="row g20 mt20 ais">
        <div class="fx">
          <div class="card pad">
            <div class="row between aic"><span class="h3" style="font-size:16px">Correspondance des colonnes</span>
              <span class="badge ok"><i></i>7 colonnes reconnues</span></div>
            <div class="mt16">${cols
              .map(
                (c) => `
              <div class="row g14 aic" style="padding:11px 0;border-bottom:1px solid var(--n-100)">
                <div style="width:180px;flex:0 0 180px"><div class="capm">${c[1]}</div><div class="mic muted mt2" style="font-weight:400">${c[0]}</div></div>
                <span style="color:var(--n-300)">${ic('aright', 'i16')}</span>
                <div class="inp" style="flex:1;height:36px;font-size:13px;justify-content:space-between;${c[3] === 'neu' ? 'color:var(--n-400)' : ''}">${c[2]}${ic('cdown', 'i14')}</div>
                ${c[3] === 'ok' ? `<span style="color:var(--ok)">${ic('check', 'i16')}</span>` : `<span style="color:var(--n-300)">${ic('minus', 'i16')}</span>`}</div>`,
              )
              .join('')}</div>
          </div>
          <div class="card pad mt20">
            <div class="row between aic"><span class="h3" style="font-size:16px">Aperçu · 5 premières lignes</span><span class="cap muted">138 lignes au total</span></div>
            <table class="tbl mt14" style="box-shadow:none">
              <thead><tr><th>Prénom</th><th>Nom</th><th>E-mail</th><th>Foyer</th><th>Accomp.</th><th>État</th></tr></thead>
              <tbody>
                ${[
                  [
                    'Yassine',
                    'Benali',
                    'y.benali@exemple.com',
                    'Famille Benali',
                    '1',
                    'ok',
                    'Nouveau',
                  ],
                  [
                    'Sofia',
                    'Benali',
                    's.benali@exemple.com',
                    'Famille Benali',
                    '0',
                    'ok',
                    'Nouveau',
                  ],
                  [
                    'Claire',
                    'Dupont',
                    'claire.dupont@exemple.com',
                    'Famille Dupont',
                    '0',
                    'warn',
                    'Doublon',
                  ],
                  [
                    'Karim',
                    'Haddad',
                    'karim.h@exemple.com',
                    'Amis université',
                    '2',
                    'ok',
                    'Nouveau',
                  ],
                  [
                    'Thomas',
                    '',
                    't.girard@exemple.com',
                    'Amis université',
                    '0',
                    'bad',
                    'Nom manquant',
                  ],
                ]
                  .map(
                    (r) => `
                <tr><td class="nm">${r[0]}</td><td>${r[1] || '<span class="muted">—</span>'}</td><td style="font-size:13px">${r[2]}</td>
                  <td>${r[3]}</td><td>${r[4]}</td><td>${badge(r[6], r[5])}</td></tr>`,
                  )
                  .join('')}</tbody></table>
          </div>
        </div>
        <div style="width:320px;flex:0 0 320px">
          <div class="card pad">
            <div class="over muted">Résumé de l’import</div>
            <div class="col g12 mt14">
              ${[
                ['Lignes détectées', '138', 'neutral'],
                ['Invités à créer', '124', 'ok'],
                ['Doublons détectés', '11', 'warn'],
                ['Lignes en erreur', '3', 'bad'],
              ]
                .map(
                  (r) => `
              <div class="row between aic"><span class="cap dim">${r[0]}</span>${badge(r[1], r[2])}</div>`,
                )
                .join('')}</div>
            <div style="height:1px;background:var(--n-100);margin:16px 0"></div>
            <div class="over muted">Doublons</div>
            <div class="col g10 mt10">
              ${[
                ['Fusionner avec l’existant', true],
                ['Créer un nouvel invité', false],
                ['Ignorer ces lignes', false],
              ]
                .map(
                  (o) => `
              <div class="row g10 aic"><span class="rdo ${o[1] ? 'on' : ''}"></span><span class="b" style="color:var(--n-700)">${o[0]}</span></div>`,
                )
                .join('')}</div>
            <div style="height:1px;background:var(--n-100);margin:16px 0"></div>
            <div class="row g10 aic"><span class="chk on">${ic('check')}</span><span class="b dim">Créer les foyers manquants</span></div>
            <div class="row g10 aic mt10"><span class="chk">${''}</span><span class="b dim">Envoyer l’invitation après l’import</span></div>
          </div>
          <div class="alert warn mt16">${ic('alert')}<div><div class="tx">3 lignes seront ignorées</div><div class="ds">Nom ou contact manquant. Vous pourrez les corriger et réimporter.</div></div></div>
          <div class="row g10 mt16">${btn('Retour', 'sec', 'aleft')}${btn('Importer 124 invités', 'pri', 'check')}</div>
        </div>
      </div></div>`,
    ),
  };
}

/* ============ 27 · GESTION RSVP ============ */
function p27() {
  const H = [
    [
      'Foyer Nadari',
      '4 / 4',
      'Présente',
      'ok',
      'Tous',
      '2 sans gluten',
      '—',
      'il y a 2 h',
    ],
    [
      'Famille Benali',
      '0 / 5',
      'En attente',
      'warn',
      'Mairie · Dîner',
      '—',
      '—',
      '—',
    ],
    [
      'Famille Dupont',
      '3 / 3',
      'Absente',
      'bad',
      'Dîner',
      '—',
      '—',
      'il y a 3 j',
    ],
    [
      'Amis université',
      '5 / 8',
      'Partiel',
      'info',
      'Cocktail · Dîner',
      '1 végétarien',
      '1 PMR',
      'il y a 5 h',
    ],
    [
      'Foyer Cherkaoui',
      '2 / 3',
      'Partiel',
      'info',
      'Cérémonie · Dîner',
      '1 sans gluten',
      '1 PMR',
      'il y a 12 min',
    ],
    [
      'Foyer Ferrand',
      '6 / 6',
      'Présente',
      'ok',
      'Tous',
      '2 halal',
      '—',
      'hier',
    ],
    ['Collègues', '2 / 4', 'Partiel', 'info', 'Dîner', '—', '—', 'il y a 1 j'],
  ];
  return {
    n: '27',
    slug: 'rsvp',
    title: 'Gestion RSVP',
    w: 1440,
    h: 1024,
    group: 'RSVP',
    html: shell(
      'RSVP',
      'RSVP',
      `
    ${phead(
      'Réponses reçues',
      '96 réponses sur 126 invités · clôture le 1ᵉʳ mai 2026',
      `${btn('Exporter', 'sec', 'download')}${btn('Relancer les 30 en attente', 'pri', 'send')}`,
    )}
    <div class="row g20 ais">
      <div class="fx">
        <div class="grid g4c" style="gap:16px">
          ${kpi('Présents', '84', '67 %', 'var(--ok)')}
          ${kpi('Absents', '12', '9 %', 'var(--bad)')}
          ${kpi('En attente', '30', '24 %', 'var(--warn)')}
          ${kpi('Partiellement présents', '9', 'foyers', 'var(--info)')}
        </div>
        <div class="row g16 mt20 ais">
          <div class="card pad fx">
            <div class="h3" style="font-size:16px">Évolution des réponses</div>
            <div class="cap muted mt4">Depuis l’envoi du 12 janvier</div>
            <div style="position:relative;height:150px;margin-top:20px">
              <svg viewBox="0 0 620 150" style="width:100%;height:150px" preserveAspectRatio="none">
                <defs><linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#7A1F2B" stop-opacity=".22"/><stop offset="100%" stop-color="#7A1F2B" stop-opacity="0"/></linearGradient></defs>
                <path d="M0,140 L52,128 L104,112 L156,104 L208,86 L260,74 L312,58 L364,50 L416,38 L468,30 L520,22 L572,16 L620,12 L620,150 L0,150 Z" fill="url(#gA)"/>
                <path d="M0,140 L52,128 L104,112 L156,104 L208,86 L260,74 L312,58 L364,50 L416,38 L468,30 L520,22 L572,16 L620,12" fill="none" stroke="#7A1F2B" stroke-width="2.2"/>
                <path d="M0,146 L52,142 L104,138 L156,136 L208,132 L260,130 L312,126 L364,124 L416,122 L468,120 L520,118 L572,117 L620,116" fill="none" stroke="#A32F2F" stroke-width="1.6" stroke-dasharray="4 4"/>
              </svg></div>
            <div class="row between mt10">${['4 mai', '18 mai', '1 juin', '15 juin', '29 juin', '13 juil.'].map((d) => `<span class="mic muted" style="font-weight:400">${d}</span>`).join('')}</div>
            <div class="row g20 mt14">
              <span class="row g6 aic mic muted" style="font-weight:400"><span style="width:14px;height:2px;background:var(--bx-700);display:block"></span>Présents cumulés</span>
              <span class="row g6 aic mic muted" style="font-weight:400"><span style="width:14px;height:2px;background:var(--bad);display:block"></span>Absents cumulés</span></div>
          </div>
          <div class="card pad" style="width:300px;flex:0 0 300px">
            <div class="h3" style="font-size:16px">Par sous-événement</div>
            <div class="col g16 mt16">
              ${[
                ['Mairie d’Aix-en-Provence', '48 / 54', 89],
                ['Cérémonie', '96 / 126', 76],
                ['Cocktail', '92 / 126', 73],
                ['Dîner &amp; soirée', '88 / 118', 75],
              ]
                .map(
                  (s) => `
              <div><div class="row between"><span class="cap" style="color:var(--n-800)">${s[0]}</span><span class="capm">${s[1]}</span></div>
                <div class="prog mt8"><i style="width:${s[2]}%"></i></div></div>`,
                )
                .join('')}</div>
            <div style="height:1px;background:var(--n-100);margin:18px 0"></div>
            <div class="h3" style="font-size:16px">Contraintes déclarées</div>
            <div class="col g10 mt14">
              ${[
                ['Sans gluten', '6', 'warn'],
                ['Végétarien', '9', 'ok'],
                ['Halal', '21', 'ok'],
                ['Allergies (fruits à coque)', '3', 'bad'],
                ['Accès PMR', '4', 'info'],
              ]
                .map(
                  (c) => `
              <div class="row between aic"><span class="cap dim">${c[0]}</span>${badge(c[1], c[2])}</div>`,
                )
                .join('')}</div>
          </div></div>
        <div class="card mt20" style="padding:0;overflow:hidden">
          <div style="padding:14px 20px;border-bottom:1px solid var(--n-100);display:flex;align-items:center;justify-content:space-between">
            <span class="h3" style="font-size:16px">Réponses par foyer</span>
            <div class="row g8">${['Tous', 'Complets', 'Partiels', 'Sans réponse'].map((f, i) => `<span class="btn ${i === 0 ? 'pri' : 'sec'} sm" style="border-radius:999px">${f}</span>`).join('')}</div></div>
          <table class="tbl" style="border:none;box-shadow:none;border-radius:0">
            <thead><tr><th>Foyer</th><th>Réponses</th><th>Statut</th><th>Sous-événements</th><th>Régime</th><th>Accessibilité</th><th>Reçu</th><th style="width:130px"></th></tr></thead>
            <tbody>${H.map(
              (h, i) => `<tr>
              <td class="nm"><div class="row g10 aic"><span class="av${i % 2 ? ' g' : ''}">${initials(h[0])}</span>${h[0]}</div></td>
              <td>${h[1]}</td><td>${badge(h[2], h[3])}</td><td style="font-size:13px">${h[4]}</td>
              <td style="font-size:13px">${h[5]}</td><td style="font-size:13px">${h[6]}</td><td class="muted" style="font-size:13px">${h[7]}</td>
              <td><div class="row g6">${h[3] === 'warn' ? btn('Relancer', 'pri', 'send', 'sm') : btn('Voir', 'sec', null, 'sm')}${btn('', 'ghost', 'more', 'sm')}</div></td></tr>`,
            ).join('')}</tbody></table>
        </div>
      </div>
      <div style="width:300px;flex:0 0 300px">
        <div class="card pad" style="background:var(--warn-bg);border-color:#F0DFC0">
          <div class="row g10 ais">${ic('alert', 'i18').replace('class="ic i18"', 'class="ic i18" style="stroke:var(--warn);margin-top:2px"')}
            <div><div class="bm" style="color:var(--warn)">30 personnes sans réponse</div>
            <div class="cap dim mt6">11 foyers n’ont jamais ouvert l’invitation.</div>
            <div class="mt12">${btn('Programmer une relance', 'pri', null, 'sm blk')}</div></div></div></div>
        <div class="card pad mt16"><div class="over muted">Dernières réponses</div>
          <div class="col g14 mt14">
            ${[
              ['Amina Cherkaoui', 'Présente · 2 pers.', 'ok', 'il y a 12 min'],
              ['Nour Belkacem', 'Présente · 2 pers.', 'ok', 'il y a 8 h'],
              ['Karim Haddad', 'Présent · 3 pers.', 'ok', 'il y a 5 h'],
              ['Pierre Lambert', 'Absent', 'bad', 'il y a 2 j'],
            ]
              .map(
                (r) => `
            <div class="row g10 ais"><span class="av" style="margin-top:2px">${initials(r[0])}</span>
              <div style="flex:1"><div class="capm">${r[0]}</div><div class="mic mt2" style="color:var(--${r[2] === 'ok' ? 'ok' : 'bad'});font-weight:400">${r[1]}</div>
              <div class="mic muted mt2" style="font-weight:400">${r[3]}</div></div></div>`,
              )
              .join('')}</div></div>
        <div class="card pad mt16"><div class="over muted">Clôture des réponses</div>
          <div class="s-title mt10" style="font-size:24px">1ᵉʳ mai</div>
          <div class="cap muted mt4">dans 120 jours</div>
          <div class="prog mt14"><i style="width:38%"></i></div>
          <div class="mt14">${btn('Modifier la date limite', 'sec', 'calendar', 'sm blk')}</div></div>
      </div></div>`,
    ),
  };
}

/* ============ 28 · CENTRE D'ENVOIS ============ */
function p28() {
  const C = [
    [
      'Première invitation',
      'Tous les foyers · 42',
      'E-mail + SMS',
      'Envoyée',
      'ok',
      '12 janvier 2026 · 09:00',
      126,
      124,
      118,
      96,
      84,
    ],
    [
      'Rappel programme',
      'Foyers ayant répondu · 31',
      'E-mail',
      'Envoyée',
      'ok',
      '2 mars 2026 · 18:00',
      84,
      84,
      71,
      0,
      0,
    ],
    [
      'Relance sans réponse',
      '11 foyers · 30 invités',
      'E-mail + SMS',
      'Programmée',
      'info',
      '20 mars 2026 · 10:00',
      30,
      0,
      0,
      0,
      0,
    ],
    [
      'Dernier rappel',
      'Foyers sans réponse',
      'SMS',
      'Brouillon',
      'neu',
      '—',
      0,
      0,
      0,
      0,
      0,
    ],
    [
      'Infos pratiques',
      'Tous les présents',
      'E-mail',
      'Erreur',
      'bad',
      '12 mars 2026 · 12:00',
      84,
      82,
      0,
      0,
      0,
    ],
  ];
  const stat = (l, v, c) =>
    `<div style="flex:1"><div class="mic muted" style="font-weight:400">${l}</div><div class="capm mt2" style="color:${c || 'var(--n-900)'}">${v}</div></div>`;
  return {
    n: '28',
    slug: 'envois',
    title: 'Centre d’envois',
    w: 1440,
    h: 1024,
    group: 'Envois',
    html: shell(
      'Envois',
      'Envois',
      `
    ${phead(
      'Centre d’envois',
      '5 campagnes · 91 % de taux d’ouverture moyen',
      `${btn('Modèles de message', 'sec', 'file')}${btn('Créer une campagne', 'pri', 'plus')}`,
    )}
    <div class="row g20 ais">
      <div class="fx">
        <div class="card" style="padding:0;overflow:hidden">
          <div style="padding:0 20px;border-bottom:1px solid var(--n-100)">
            <div class="tabs" style="border:none">${['Tous · 5', 'Programmés · 1', 'Envoyés · 3', 'Ouverts', 'Répondus', 'Erreurs · 1'].map((t, i) => `<span class="${i === 0 ? 'on' : ''}">${t}</span>`).join('')}</div></div>
          <div style="padding:16px 20px">
            ${C.map(
              (
                c,
              ) => `<div class="card" style="padding:16px 18px;box-shadow:none;margin-bottom:12px">
              <div class="row between ais">
                <div class="row g12 ais">
                  <span style="width:36px;height:36px;flex:0 0 36px;border-radius:10px;background:var(--${c[4] === 'neu' ? 'n-50' : c[4] + '-bg'});color:var(--${c[4] === 'neu' ? 'n-500' : c[4]});display:flex;align-items:center;justify-content:center">${ic(c[3] === 'Programmée' ? 'clock' : c[3] === 'Erreur' ? 'alert' : 'send', 'i18')}</span>
                  <div><div class="row g10 aic"><span class="bm">${c[0]}</span>${badge(c[3], c[4])}</div>
                    <div class="row g14 aic mt6 cap muted">
                      <span class="row g6 aic">${ic('users', 'i14')}${c[1]}</span>
                      <span class="row g6 aic">${ic('mail', 'i14')}${c[2]}</span>
                      <span class="row g6 aic">${ic('clock', 'i14')}${c[5]}</span></div></div></div>
                <div class="row g8">${c[3] === 'Brouillon' ? btn('Reprendre', 'pri', null, 'sm') : c[3] === 'Programmée' ? btn('Modifier', 'sec', 'pen', 'sm') : btn('Détails', 'sec', null, 'sm')}${btn('', 'ghost', 'more', 'sm')}</div></div>
              ${
                c[6]
                  ? `<div class="row g16 mt16" style="padding-top:14px;border-top:1px solid var(--n-100)">
                ${stat('Envoyé', c[6])}${stat('Délivré', c[7] || '—')}${stat('Ouvert', c[8] || '—', 'var(--info)')}${stat('Cliqué', c[9] || '—', 'var(--go-700)')}${stat('Répondu', c[10] || '—', 'var(--ok)')}
                <div style="width:180px"><div class="mic muted" style="font-weight:400">Progression</div><div class="prog mt6"><i style="width:${Math.round((c[8] / c[6]) * 100) || 0}%"></i></div></div></div>`
                  : ''
              }
              ${c[3] === 'Erreur' ? `<div class="alert bad mt12" style="padding:10px 12px">${ic('alert', 'i16')}<div><div class="tx" style="font-size:13px">2 envois ont échoué</div><div class="ds">Adresses e-mail invalides — corrigez puis relancez.</div></div></div>` : ''}
            </div>`,
            ).join('')}
          </div></div>
      </div>
      <div style="width:340px;flex:0 0 340px">
        <div class="card pad">
          <div class="row between aic"><span class="h3" style="font-size:16px">Nouvelle campagne</span>${badge('Brouillon', 'neu')}</div>
          <div class="col g14 mt16">
            <div class="fld"><span class="lb">Destinataires</span>
              <div class="inp" style="height:38px;font-size:13px;justify-content:space-between">Foyers sans réponse · 11${ic('cdown', 'i14')}</div></div>
            <div class="fld"><span class="lb">Modèle</span>
              <div class="inp" style="height:38px;font-size:13px;justify-content:space-between">Relance douce${ic('cdown', 'i14')}</div></div>
            <div class="fld"><span class="lb">Canal</span>
              <div class="row g8"><span class="btn pri sm" style="flex:1;justify-content:center">${ic('mail', 'i14')}E-mail</span>
                <span class="btn pri sm" style="flex:1;justify-content:center">${ic('phone', 'i14')}SMS</span>
                <span class="btn sec sm" style="flex:1;justify-content:center">${ic('link', 'i14')}Lien</span></div></div>
            <div class="fld"><span class="lb">Message</span>
              <div class="inp ta" style="min-height:104px;font-size:13px;line-height:20px;color:var(--n-800)">Bonjour {{prénom}},<br><br>Nous serions ravis de vous compter parmi nous le 6 juin. Votre réponse nous aide à finaliser le plan de table.</div>
              <div class="row g6 mt6">${['{{prénom}}', '{{foyer}}', '{{lien}}', '{{date}}'].map((v) => `<span class="badge neu" style="font-size:10px"><i style="display:none"></i>${v}</span>`).join('')}</div></div>
            <div class="fld"><span class="lb">Programmation</span>
              <div class="row g8"><span class="btn sec sm" style="flex:1;justify-content:center">Immédiat</span>
                <span class="btn pri sm" style="flex:1;justify-content:center">${ic('clock', 'i14')}Programmer</span></div>
              <div class="inp mt8" style="height:38px;font-size:13px;justify-content:space-between">20 mars 2026 · 10:00${ic('calendar', 'i14')}</div></div>
          </div>
          <div class="row g10 mt18">${btn('Aperçu', 'sec', 'eye', 'sm')}${btn('Programmer l’envoi', 'pri', 'send', 'sm')}</div>
        </div>
        <div class="card pad mt16" style="background:var(--go-50);border-color:var(--go-200)">
          <div class="row g10 ais">${ic('sparkle', 'i16').replace('class="ic i16"', 'class="ic i16" style="stroke:var(--go-700);margin-top:2px"')}
          <div><div class="capm" style="color:var(--go-700)">Meilleur moment d’envoi</div>
          <div class="cap dim mt6">Vos invités ouvrent surtout le mardi entre 18 h et 20 h.</div></div></div></div>
      </div></div>`,
    ),
  };
}

/* ============ 29 · STATISTIQUES ============ */
function p29() {
  const insight = (
    t,
    d,
    cta,
    tone,
  ) => `<div class="card pad" style="border-left:3px solid var(--${tone})">
    <div class="row between ais"><div style="flex:1"><div class="bm">${t}</div><div class="cap dim mt6">${d}</div></div>
    ${btn(cta, 'sec', null, 'sm')}</div></div>`;
  return {
    n: '29',
    slug: 'statistiques',
    title: 'Statistiques',
    w: 1440,
    h: 1024,
    group: 'Analyse',
    html: shell(
      'Statistiques',
      'Statistiques',
      `
    ${phead(
      'Statistiques',
      'Mariage du 6 juin 2026 · données à jour il y a 4 min',
      `<span class="btn sec">${ic('calendar', 'i16')}Depuis le début${ic('cdown', 'i14')}</span>${btn('Exporter le rapport', 'sec', 'download')}`,
    )}
    <div class="grid g5" style="gap:16px">
      ${kpi('Taux d’ouverture', '91 %', '+4 pts vs. moyenne', 'var(--info)')}
      ${kpi('Taux de réponse', '76 %', '96 / 126 invités')}
      ${kpi('Présents', '84', '67 % du total', 'var(--ok)')}
      ${kpi('Absents', '12', '9 % du total', 'var(--bad)')}
      ${kpi('En attente', '30', '24 % du total', 'var(--warn)')}
    </div>
    <div class="row g16 mt20 ais">
      <div class="card pad fx">
        <div class="row between aic"><div><div class="h3" style="font-size:16px">Évolution des réponses</div>
          <div class="cap muted mt4">Cumul depuis le premier envoi</div></div>
          <span class="seg"><span class="on">Semaine</span><span>Mois</span></span></div>
        <div style="height:210px;margin-top:18px">
          <svg viewBox="0 0 640 210" style="width:100%;height:210px" preserveAspectRatio="none">
            <defs><linearGradient id="gB" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#7A1F2B" stop-opacity=".2"/><stop offset="100%" stop-color="#7A1F2B" stop-opacity="0"/></linearGradient></defs>
            ${[0, 1, 2, 3, 4].map((i) => `<line x1="0" y1="${i * 46 + 14}" x2="640" y2="${i * 46 + 14}" stroke="#EFEDE7" stroke-width="1"/>`).join('')}
            <path d="M0,192 L58,178 L116,158 L174,146 L232,120 L290,104 L348,82 L406,70 L464,54 L522,42 L580,30 L640,24 L640,210 L0,210 Z" fill="url(#gB)"/>
            <path d="M0,192 L58,178 L116,158 L174,146 L232,120 L290,104 L348,82 L406,70 L464,54 L522,42 L580,30 L640,24" fill="none" stroke="#7A1F2B" stroke-width="2.4"/>
            <path d="M0,200 L58,196 L116,190 L174,186 L232,180 L290,176 L348,172 L406,168 L464,166 L522,164 L580,162 L640,160" fill="none" stroke="#D4B07B" stroke-width="2"/>
            ${[
              [0, 192],
              [116, 158],
              [232, 120],
              [348, 82],
              [464, 54],
              [640, 24],
            ]
              .map(
                (p) =>
                  `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="#7A1F2B"/>`,
              )
              .join('')}
          </svg></div>
        <div class="row between mt10">${['S18', 'S20', 'S22', 'S24', 'S26', 'S28', 'S30', 'S32'].map((d) => `<span class="mic muted" style="font-weight:400">${d}</span>`).join('')}</div>
        <div class="row g20 mt14">
          <span class="row g6 aic mic muted" style="font-weight:400"><span style="width:14px;height:2px;background:var(--bx-700);display:block"></span>Présents</span>
          <span class="row g6 aic mic muted" style="font-weight:400"><span style="width:14px;height:2px;background:var(--go-500);display:block"></span>Absents</span></div>
      </div>
      <div class="card pad" style="width:330px;flex:0 0 330px">
        <div class="h3" style="font-size:16px">Répartition des réponses</div>
        <div class="row g16 aic mt20">
          <div style="position:relative;width:130px;height:130px;flex:0 0 130px;border-radius:999px;
            background:conic-gradient(var(--ok) 0 67%,var(--bad) 67% 76%,var(--n-200) 76% 100%)">
            <div style="position:absolute;inset:16px;border-radius:999px;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center">
              <div class="s-title" style="font-size:28px">76 %</div><div class="mic muted" style="font-weight:400">de réponses</div></div></div>
          <div class="col g12" style="flex:1">
            ${[
              ['Présents', '84', 'var(--ok)'],
              ['Absents', '12', 'var(--bad)'],
              ['En attente', '30', 'var(--n-200)'],
            ]
              .map(
                (r) => `
            <div class="row g8 aic"><span style="width:9px;height:9px;border-radius:3px;background:${r[2]}"></span>
            <span class="cap dim" style="flex:1">${r[0]}</span><span class="capm">${r[1]}</span></div>`,
              )
              .join('')}</div></div>
        <div style="height:1px;background:var(--n-100);margin:18px 0"></div>
        <div class="h3" style="font-size:16px">Performance des envois</div>
        <div class="col g14 mt14">
          ${[
            ['Délivrés', '98 %', 98],
            ['Ouverts', '91 %', 91],
            ['Cliqués', '78 %', 78],
            ['Répondus', '76 %', 76],
          ]
            .map(
              (s) => `
          <div><div class="row between"><span class="cap dim">${s[0]}</span><span class="capm">${s[1]}</span></div>
            <div class="prog mt6"><i style="width:${s[2]}%"></i></div></div>`,
            )
            .join('')}</div>
      </div></div>
    <div class="row g16 mt20 ais">
      <div class="card pad fx">
        <div class="h3" style="font-size:16px">Par sous-événement</div>
        <div class="row g16 aic mt20" style="height:170px;align-items:flex-end">
          ${[
            ['Mairie', 48, 54],
            ['Cérémonie', 96, 126],
            ['Cocktail', 92, 126],
            ['Dîner', 88, 118],
          ]
            .map(
              (s) => `
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:10px;height:100%;justify-content:flex-end">
            <span class="capm">${s[1]}</span>
            <div style="width:64px;height:${Math.round((s[1] / s[2]) * 118)}px;border-radius:8px 8px 0 0;background:linear-gradient(180deg,var(--bx-500),var(--bx-700))"></div>
            <span class="mic muted" style="font-weight:400">${s[0]} · ${Math.round((s[1] / s[2]) * 100)} %</span></div>`,
            )
            .join('')}
        </div></div>
      <div class="card pad" style="width:330px;flex:0 0 330px">
        <div class="h3" style="font-size:16px">Besoins alimentaires</div>
        <div class="col g12 mt16">
          ${[
            ['Aucune contrainte', '96', 72],
            ['Halal', '21', 16],
            ['Végétarien', '9', 7],
            ['Sans gluten', '6', 4],
            ['Allergies', '3', 2],
          ]
            .map(
              (r) => `
          <div><div class="row between"><span class="cap dim">${r[0]}</span><span class="capm">${r[1]}</span></div>
            <div class="prog mt6" style="height:5px"><i style="width:${r[2]}%;background:var(--go-500)"></i></div></div>`,
            )
            .join('')}</div>
        <div style="height:1px;background:var(--n-100);margin:16px 0"></div>
        <div class="row between aic"><span class="cap dim">Accès PMR</span>${badge('4 personnes', 'info')}</div>
      </div></div>
    <div class="mt20"><div class="over gold">Actions suggérées</div>
      <div class="grid g3 mt12" style="gap:16px">
        ${insight('30 personnes n’ont pas encore répondu', 'Dont 11 foyers qui n’ont jamais ouvert l’invitation.', 'Envoyer une relance', 'warn')}
        ${insight('Le dîner approche de la capacité', '118 places · 88 confirmées, 30 réponses attendues.', 'Voir le plan de table', 'info')}
        ${insight('6 régimes sans gluten à transmettre', 'Le traiteur attend la liste définitive avant le 1ᵉʳ mai.', 'Exporter la liste', 'ok')}
      </div></div>`,
    ),
  };
}

module.exports = [p23, p24, p25, p26, p27, p28, p29].map((f) => f());
