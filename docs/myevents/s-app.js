// Écrans 09 → 17 — Authentification, Onboarding, Dashboard, Événement
const L = require('./lib.js');
const { ic, btn, badge, kpi, fld, shell, phead, mapmock, invThumb, qr } = L;

/* ---------- panneau latéral commun aux écrans d'auth ---------- */
const authAside = (
  quote,
  who,
  role,
) => `<div style="width:600px;flex:0 0 600px;background:var(--ink);position:relative;overflow:hidden;padding:48px;display:flex;flex-direction:column;justify-content:space-between">
  <div style="position:absolute;width:780px;height:780px;left:-220px;top:-300px;border-radius:999px;background:radial-gradient(closest-side,rgba(122,31,43,.55),rgba(122,31,43,0))"></div>
  <div style="position:absolute;width:600px;height:600px;right:-200px;bottom:-240px;border-radius:999px;background:radial-gradient(closest-side,rgba(212,176,123,.18),rgba(212,176,123,0))"></div>
  <div style="position:relative"><div style="font-family:var(--serif);font-weight:500;font-size:21px;letter-spacing:3.2px;color:#F3EFE7">MYEVENT’S</div>
  <div class="mic mt6" style="letter-spacing:1.6px;text-transform:uppercase;color:#6B6459;font-size:9px">Espace organisateur</div></div>
  <div style="position:relative;display:flex;gap:28px;align-items:flex-end">
    <div class="device-phone" style="width:216px;flex:0 0 216px;padding:7px;border-radius:30px">
      <div class="scr" style="height:420px;border-radius:23px">${invThumb(202, 420, 202 / 390)}</div></div>
    <div style="flex:1;padding-bottom:8px">
      <div class="s-body" style="font-size:19px;line-height:30px;color:#F3EFE7">« ${quote} »</div>
      <div class="row g10 aic mt20"><span class="av lg" style="background:rgba(212,176,123,.2);color:var(--go-300)">${who[0]}</span>
      <div><div class="bm" style="color:#F3EFE7">${who}</div><div class="cap" style="color:#6B6459">${role}</div></div></div></div>
  </div>
  <div class="row g24 mic" style="position:relative;color:#5C554C;font-weight:400">
    <span>Données hébergées en France</span><span>·</span><span>Aucun compte requis pour vos invités</span></div></div>`;

const authForm = (
  title,
  sub,
  body,
  footer,
) => `<div style="flex:1;display:flex;align-items:center;justify-content:center;background:var(--ivory)">
  <div style="width:400px">${title}${sub}${body}${footer || ''}</div></div>`;

/* ============ 09 · CONNEXION ============ */
function p09() {
  return {
    n: '09',
    slug: 'connexion',
    title: 'Connexion',
    w: 1440,
    h: 900,
    cls: 'screen solo',
    group: 'Authentification',
    html: `
  <div style="display:flex;height:900px">
    ${authAside('On a envoyé l’invitation un dimanche soir. Le lundi midi, 70 % des foyers avaient répondu.', 'Yasmine', 'Mariage · Aix-en-Provence')}
    ${authForm(
      `<h1 class="s-title" style="font-size:34px">Content de vous revoir.</h1>`,
      `<p class="b dim mt10">Connectez-vous pour retrouver votre événement.</p>`,
      `<div class="col g16 mt32">
        ${fld('Adresse e-mail', 'adam@exemple.com', '')}
        <div class="fld"><div class="row between aic"><span class="lb">Mot de passe</span><span class="cap" style="color:var(--bx-700)">Mot de passe oublié ?</span></div>
          <div class="inp">••••••••••••</div></div>
        <div class="row g10 aic"><span class="chk on">${ic('check')}</span><span class="b dim">Rester connecté sur cet appareil</span></div>
        ${btn('Se connecter', 'pri', null, 'blk lg')}
        <div class="row g14 aic"><span style="flex:1;height:1px;background:var(--n-200)"></span><span class="cap muted">ou</span><span style="flex:1;height:1px;background:var(--n-200)"></span></div>
        ${btn('Continuer avec Google', 'sec', 'globe', 'blk lg')}
      </div>`,
      `<div class="tc mt32 b dim">Pas encore de compte ? <span style="color:var(--bx-700);font-weight:500">Créer un compte</span></div>`,
    )}
  </div>`,
  };
}

/* ============ 10 · INSCRIPTION ============ */
function p10() {
  return {
    n: '10',
    slug: 'inscription',
    title: 'Inscription',
    w: 1440,
    h: 900,
    cls: 'screen solo',
    group: 'Authentification',
    html: `
  <div style="display:flex;height:900px">
    ${authAside('Le livre d’or audio, c’est le cadeau qu’on ne savait pas qu’on voulait.', 'Léa', 'Mariage · Annecy')}
    ${authForm(
      `<h1 class="s-title" style="font-size:34px">Créons votre événement.</h1>`,
      `<p class="b dim mt10">Deux minutes suffisent. Vous ne payez qu’au moment de publier.</p>`,
      `<div class="col g16 mt32">
        <div class="row g12">${fld('Prénom', 'Adam', '')}${fld('Nom', 'Ferrand', '')}</div>
        ${fld('Adresse e-mail', 'adam@exemple.com', '')}
        <div class="fld"><span class="lb">Mot de passe</span><div class="inp">••••••••••••</div>
          <div class="row g6 mt4">${[1, 1, 1, 0].map((v) => `<span style="flex:1;height:3px;border-radius:999px;background:${v ? 'var(--ok)' : 'var(--n-200)'}"></span>`).join('')}</div>
          <span class="hint">Solide — 12 caractères, une majuscule, un chiffre</span></div>
        ${fld('Confirmation du mot de passe', '••••••••••••', '')}
        <div class="row g10 ais"><span class="chk on" style="margin-top:2px">${ic('check')}</span>
          <span class="b dim">J’accepte les <span style="color:var(--bx-700)">conditions d’utilisation</span> et la <span style="color:var(--bx-700)">politique de confidentialité</span>.</span></div>
        ${btn('Créer mon compte', 'pri', null, 'blk lg')}
        ${btn('Continuer avec Google', 'sec', 'globe', 'blk lg')}
      </div>`,
      `<div class="tc mt24 b dim">Déjà inscrit ? <span style="color:var(--bx-700);font-weight:500">Se connecter</span></div>`,
    )}
  </div>`,
  };
}

/* ============ 11 · MOT DE PASSE OUBLIÉ ============ */
function p11() {
  return {
    n: '11',
    slug: 'mot-de-passe',
    title: 'Mot de passe oublié / Réinitialisation',
    w: 1440,
    h: 900,
    cls: 'screen solo',
    group: 'Authentification',
    html: `
  <div style="display:flex;height:900px">
    ${authAside('Je gère six mariages par saison. Un seul endroit pour tout, ça change ma vie.', 'Nadia', 'Wedding planner · Lyon')}
    <div style="flex:1;display:flex;align-items:center;justify-content:center;background:var(--ivory)">
      <div style="width:400px">
        <span class="btn ghost sm" style="padding:0;margin-bottom:20px;color:var(--n-600)">${ic('aleft', 'i14')}Retour à la connexion</span>
        <div style="width:48px;height:48px;border-radius:14px;background:var(--go-50);border:1px solid var(--go-200);display:flex;align-items:center;justify-content:center;color:var(--go-700)">${ic('lock', 'i20')}</div>
        <h1 class="s-title mt20" style="font-size:32px">Réinitialiser<br>votre mot de passe.</h1>
        <p class="b dim mt10">Indiquez votre adresse e-mail : nous vous envoyons un lien sécurisé valable 30 minutes.</p>
        <div class="col g16 mt32">
          ${fld('Adresse e-mail', 'adam@exemple.com', '')}
          ${btn('Envoyer le lien', 'pri', 'mail', 'blk lg')}
        </div>
        <div class="alert ok mt24">${ic('check')}<div><div class="tx">E-mail envoyé</div><div class="ds">Vérifiez votre boîte de réception — et vos spams, on ne juge pas.</div></div></div>
        <div class="card pad mt24" style="box-shadow:none;background:transparent;border-style:dashed">
          <div class="row g10 aic">${ic('help', 'i16').replace('class="ic i16"', 'class="ic i16" style="stroke:var(--n-500)"')}<span class="capm">Vous n’avez rien reçu ?</span></div>
          <div class="cap dim mt6">Renvoyer dans 00:42 · ou <span style="color:var(--bx-700)">contacter le support</span></div></div>
      </div></div>
  </div>`,
  };
}

/* ============ 12 · ONBOARDING (4 étapes montrées) ============ */
const stepper = (cur) => {
  const S = [
    'Type d’événement',
    'Date',
    'Organisateurs',
    'Style',
    'Langue',
    'Votre invitation',
  ];
  return `<div class="row g0 aic" style="gap:0">${S.map(
    (s, i) => `
    <div class="row aic" style="${i < S.length - 1 ? 'flex:1' : ''}">
      <div class="row g8 aic">
        <span style="width:26px;height:26px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;
          ${i < cur ? 'background:var(--bx-700);color:#fff' : i === cur ? 'background:var(--go-500);color:#3A2A16' : 'background:var(--n-100);color:var(--n-400)'}">
          ${i < cur ? ic('check', 'i14') : i + 1}</span>
        <span class="cap" style="${i === cur ? 'color:var(--n-900);font-weight:600' : 'color:var(--n-500)'}">${s}</span></div>
      ${i < S.length - 1 ? `<span style="flex:1;height:1px;background:${i < cur ? 'var(--bx-700)' : 'var(--n-200)'};margin:0 12px"></span>` : ''}
    </div>`,
  ).join('')}</div>`;
};
const obShell = (
  cur,
  body,
  foot,
) => `<div style="height:940px;background:var(--ivory);display:flex;flex-direction:column">
  <div style="height:72px;flex:0 0 72px;background:#fff;border-bottom:1px solid var(--n-200);display:flex;align-items:center;justify-content:space-between;padding:0 40px">
    <div style="font-family:var(--serif);font-weight:500;font-size:19px;letter-spacing:3px;color:var(--ink)">MYEVENT’S</div>
    <div class="row g14 aic"><span class="cap muted">Étape ${cur + 1} sur 6</span>${btn('Enregistrer et quitter', 'ghost', null, 'sm')}</div></div>
  <div style="padding:26px 40px;background:#fff;border-bottom:1px solid var(--n-200)">${stepper(cur)}</div>
  <div style="flex:1;padding:44px 40px;overflow:hidden">${body}</div>
  <div style="height:82px;flex:0 0 82px;background:#fff;border-top:1px solid var(--n-200);display:flex;align-items:center;justify-content:space-between;padding:0 40px">${foot}</div></div>`;

function p12a() {
  const types = [
    ['Mariage', 'ring', true],
    ['Fiançailles', 'heart', false],
    ['Henné', 'leaf', false],
    ['Anniversaire', 'cake', false],
    ['Baby shower', 'baby', false],
    ['Baptême', 'sparkle', false],
    ['Événement professionnel', 'briefcase', false],
    ['Autre', 'plus', false],
  ];
  return {
    n: '12a',
    slug: 'onboarding-type',
    title: 'Onboarding · 1. Type d’événement',
    w: 1440,
    h: 940,
    cls: 'screen solo',
    group: 'Onboarding',
    html: obShell(
      0,
      `
    <div class="tc" style="max-width:840px;margin:0 auto">
      <h1 class="s-title" style="font-size:38px">Que célébrez-vous ?</h1>
      <p class="b dim mt10" style="font-size:15px">Le vocabulaire, les templates et les sections s’adapteront à votre choix.</p>
    </div>
    <div class="grid g4c mt40" style="gap:18px;max-width:1000px;margin:40px auto 0">
      ${types
        .map(
          (
            t,
          ) => `<div class="card" style="padding:26px 20px;text-align:center;${t[2] ? 'border-color:var(--go-500);box-shadow:0 0 0 3px rgba(212,176,123,.18),var(--e-1)' : ''}">
        <div style="width:52px;height:52px;margin:0 auto;border-radius:15px;display:flex;align-items:center;justify-content:center;
          background:${t[2] ? 'var(--bx-700)' : 'var(--go-50)'};color:${t[2] ? '#fff' : 'var(--go-700)'};border:1px solid ${t[2] ? 'var(--bx-700)' : 'var(--go-200)'}">${ic(t[1], 'i24')}</div>
        <div class="bm mt14">${t[0]}</div>
        ${t[2] ? `<div class="mic mt8" style="color:var(--go-700)">Sélectionné</div>` : ''}</div>`,
        )
        .join('')}
    </div>
    <div class="card pad mt32" style="max-width:1000px;margin:32px auto 0;background:var(--go-50);border-color:var(--go-200);display:flex;gap:12px;align-items:center">
      ${ic('sparkle', 'i18').replace('class="ic i18"', 'class="ic i18" style="stroke:var(--go-700)"')}
      <span class="b" style="color:var(--go-700)">Un mariage peut contenir plusieurs cérémonies — mairie, henné, dîner. Vous les ajouterez à l’étape suivante.</span></div>`,
      `${btn('Retour', 'ghost', 'aleft')}<div class="row g10">${btn('Passer', 'ghost')}${btn('Continuer', 'pri', 'aright')}</div>`,
    ),
  };
}

function p12b() {
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  let cells = '';
  for (let i = 1; i <= 30; i++)
    cells += `<div style="height:46px;display:flex;align-items:center;justify-content:center;border-radius:10px;font-size:14px;
    ${i === 6 ? 'background:var(--bx-700);color:#fff;font-weight:600' : 'color:var(--n-700)'}">${i}</div>`;
  return {
    n: '12b',
    slug: 'onboarding-date',
    title: 'Onboarding · 2. Date',
    w: 1440,
    h: 940,
    cls: 'screen solo',
    group: 'Onboarding',
    html: obShell(
      1,
      `
    <div style="max-width:1000px;margin:0 auto;display:flex;gap:40px;align-items:flex-start">
      <div style="width:400px;flex:0 0 400px;padding-top:12px">
        <h1 class="s-title" style="font-size:38px">Quand a lieu<br>votre mariage ?</h1>
        <p class="b dim mt12" style="font-size:15px">Le compte à rebours et les relances automatiques se calent sur cette date.</p>
        <div class="col g16 mt32">
          ${fld('Date de l’événement', 'Samedi 6 juin 2026', '')}
          ${fld('Fuseau horaire', 'Europe/Paris (UTC+2)', '')}
          <div class="row g10 aic"><span class="chk on">${ic('check')}</span><span class="b dim">La date n’est pas encore définitive</span></div>
        </div>
        <div class="alert info mt24">${ic('info')}<div><div class="tx">157 jours pour tout préparer</div><div class="ds">Nous vous suggérerons un calendrier d’envoi et de relance adapté.</div></div></div>
      </div>
      <div class="card fx" style="padding:26px">
        <div class="row between aic"><span class="btn ghost sm">${ic('cleft', 'i16')}</span>
          <span class="s-sub">Juin 2026</span><span class="btn ghost sm">${ic('cright', 'i16')}</span></div>
        <div class="grid" style="grid-template-columns:repeat(7,1fr);gap:4px;margin-top:18px">
          ${days.map((d) => `<div class="mic muted tc" style="padding:8px 0">${d}</div>`).join('')}
          ${''}${cells}</div>
        <div class="row between aic mt20" style="padding-top:18px;border-top:1px solid var(--n-100)">
          <span class="cap muted">Sélectionné</span><span class="bm">Samedi 6 juin 2026</span></div></div>
    </div>`,
      `${btn('Retour', 'ghost', 'aleft')}<div class="row g10">${btn('Passer', 'ghost')}${btn('Continuer', 'pri', 'aright')}</div>`,
    ),
  };
}

function p12c() {
  const styles = [
    ['Andalouse', '#F6F1E7', '#7A1F2B', true],
    ['Minéral', '#EFEDE7', '#46413A', false],
    ['Camélia', '#F7EEEA', '#8E2836', false],
    ['Nuit d’or', '#231A18', '#D4B07B', false],
  ];
  return {
    n: '12c',
    slug: 'onboarding-style',
    title: 'Onboarding · 4. Style',
    w: 1440,
    h: 940,
    cls: 'screen solo',
    group: 'Onboarding',
    html: obShell(
      3,
      `
    <div class="tc" style="max-width:840px;margin:0 auto">
      <h1 class="s-title" style="font-size:38px">Quel univers vous ressemble ?</h1>
      <p class="b dim mt10" style="font-size:15px">Un point de départ, pas une prison : tout reste modifiable dans le Studio.</p></div>
    <div class="grid g4c" style="gap:20px;max-width:1080px;margin:40px auto 0">
      ${styles
        .map(
          (
            s,
          ) => `<div class="tplcard" style="${s[3] ? 'border-color:var(--go-500);box-shadow:0 0 0 3px rgba(212,176,123,.18),var(--e-1)' : ''}">
        <div class="thumb" style="height:300px;background:${s[1]}">
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
            <div class="mic" style="letter-spacing:2.2px;color:${s[2]};opacity:.7;font-size:9px">LES FAMILLES</div>
            <div class="script mt10" style="font-size:32px;color:${s[2]}">Yasmine &amp; Adam</div>
            <div style="width:32px;height:1px;background:${s[2]};opacity:.5;margin:12px 0"></div>
            <div class="mic" style="letter-spacing:2px;color:${s[2]};opacity:.7;font-size:9px">06 · 06 · 2026</div></div>
          ${s[3] ? `<span style="position:absolute;top:12px;right:12px;width:24px;height:24px;border-radius:999px;background:var(--go-500);display:flex;align-items:center;justify-content:center;color:#3A2A16">${ic('check', 'i14')}</span>` : ''}</div>
        <div class="meta"><span class="bm">${s[0]}</span><div class="row g4">${[s[1], s[2], '#D4B07B'].map((c) => `<span style="width:11px;height:11px;border-radius:999px;background:${c};border:1px solid var(--n-200)"></span>`).join('')}</div></div></div>`,
        )
        .join('')}
    </div>
    <div class="row center g24 mt32" style="max-width:1080px;margin:32px auto 0">
      <div class="row g10 aic"><span class="cap muted">Typographie</span><span class="seg"><span class="on">Éditoriale</span><span>Moderne</span><span>Calligraphiée</span></span></div>
      <div class="row g10 aic"><span class="cap muted">Ambiance</span><span class="seg"><span class="on">Claire</span><span>Sombre</span></span></div></div>`,
      `${btn('Retour', 'ghost', 'aleft')}<div class="row g10">${btn('Passer', 'ghost')}${btn('Continuer', 'pri', 'aright')}</div>`,
    ),
  };
}

function p12d() {
  return {
    n: '12d',
    slug: 'onboarding-invitation',
    title: 'Onboarding · 6. Votre première invitation',
    w: 1440,
    h: 940,
    cls: 'screen solo',
    group: 'Onboarding',
    html: obShell(
      5,
      `
    <div style="max-width:1060px;margin:0 auto;display:flex;gap:48px;align-items:center">
      <div style="flex:1">
        <span class="badge gld">${''}<i></i>Générée pour vous</span>
        <h1 class="s-title mt16" style="font-size:38px">Voici votre invitation.</h1>
        <p class="b dim mt12" style="font-size:15px;max-width:440px">Nous l’avons pré-remplie avec vos réponses. Rien n’est publié : vous pouvez tout modifier, ou l’envoyer telle quelle.</p>
        <div class="col g12 mt28">
          ${[
            ['Type', 'Mariage · 3 cérémonies'],
            ['Date', 'Samedi 6 juin 2026'],
            ['Organisateurs', 'Yasmine Nadari &amp; Adam Ferrand'],
            ['Style', 'Andalouse · Bordeaux &amp; ivoire'],
            ['Langues', 'Français &amp; arabe'],
          ]
            .map(
              (r) => `
          <div class="row between aic card" style="padding:13px 16px;box-shadow:none">
            <span class="cap muted">${r[0]}</span><span class="bm">${r[1]}</span></div>`,
            )
            .join('')}
        </div>
        <div class="row g12 mt28">${btn('Ouvrir le Studio', 'pri', 'wand', 'lg')}${btn('Voir en plein écran', 'sec', 'eye', 'lg')}</div>
        <div class="row g10 aic mt16 cap muted">${ic('info', 'i14')}<span>Vous ne paierez qu’au moment de publier votre invitation.</span></div>
      </div>
      <div class="device-phone" style="width:326px;flex:0 0 326px">
        <div class="notch"></div><div class="scr" style="height:660px">${invThumb(304, 660, 304 / 390)}</div></div>
    </div>`,
      `${btn('Retour', 'ghost', 'aleft')}<div class="row g10">${btn('Terminer plus tard', 'ghost')}${btn('Accéder à mon espace', 'pri', 'aright')}</div>`,
    ),
  };
}

/* ============ 13 · DASHBOARD ============ */
function p13() {
  const chk = [
    ['Choisir le template', 1],
    ['Personnaliser l’invitation', 1],
    ['Importer la liste d’invités', 1],
    ['Publier l’invitation', 1],
    ['Envoyer la première vague', 1],
    ['Relancer les foyers sans réponse', 0],
    ['Imprimer les QR codes de table', 0],
    ['Préparer la carte de remerciement', 0],
  ];
  const act = [
    ['Amina Cherkaoui a confirmé sa présence', 'il y a 12 min', 'ok', 'checkc'],
    ['3 nouveaux messages audio déposés', 'il y a 1 h', 'gld', 'mic'],
    ['Relance envoyée à 18 foyers', 'il y a 3 h', 'info', 'send'],
    ['Famille Dupont a décliné l’invitation', 'hier · 21:04', 'bad', 'close'],
    ['12 photos ajoutées par vos invités', 'hier · 18:32', 'gld', 'image'],
  ];
  return {
    n: '13',
    slug: 'dashboard',
    title: 'Dashboard principal',
    w: 1440,
    h: 1024,
    group: 'Application',
    html: shell(
      'Vue d’ensemble',
      'Vue d’ensemble',
      `
    ${phead(
      'Bonjour Yasmine &amp; Adam',
      'Mariage — Samedi 6 juin 2026 · Le Tholonet',
      `${btn('Modifier l’invitation', 'sec', 'pen')}${btn('Ajouter des invités', 'sec', 'plus')}${btn('Envoyer une relance', 'pri', 'send')}`,
    )}
    <div class="row g20 ais">
      <div class="fx">
        <div class="card" style="background:var(--ink);border:none;overflow:hidden;position:relative;padding:26px 28px">
          <div style="position:absolute;width:520px;height:520px;right:-120px;top:-200px;border-radius:999px;background:radial-gradient(closest-side,rgba(122,31,43,.65),rgba(122,31,43,0))"></div>
          <div style="position:relative;display:flex;align-items:center;justify-content:space-between">
            <div>
              <div class="mic" style="letter-spacing:2.2px;text-transform:uppercase;color:var(--go-500)">Le grand jour</div>
              <div class="row g24 mt14">${[
                ['157', 'jours'],
                ['22', 'heures'],
                ['33', 'min'],
                ['54', 'sec'],
              ]
                .map(
                  (c) => `
                <div><div class="s-title" style="font-size:40px;color:#F3EFE7;line-height:44px">${c[0]}</div><div class="mic mt4" style="color:#6B6459;text-transform:uppercase;letter-spacing:1.2px;font-weight:400">${c[1]}</div></div>`,
                )
                .join('')}</div>
            </div>
            <div style="text-align:right">
              <span class="badge ok" style="background:rgba(47,122,85,.18);color:#7BC49B"><i></i>Invitation publiée</span>
              <div class="row g10 aic mt14" style="justify-content:flex-end">${ic('link', 'i14').replace('class="ic i14"', 'class="ic i14" style="stroke:#8C8478"')}
                <span class="cap" style="color:#8C8478">myevents.app/yasmine-adam</span></div>
              <div class="row g8 mt14" style="justify-content:flex-end">${btn('Voir l’invitation', 'onDark', 'eye', 'sm')}${btn('Partager', 'onDark', 'share', 'sm')}</div></div>
          </div>
          <div class="mt24" style="position:relative">
            <div class="row between aic"><span class="cap" style="color:#8C8478">Préparation de l’événement</span><span class="capm" style="color:var(--go-500)">62 %</span></div>
            <div class="prog gold mt8" style="background:rgba(255,255,255,.1)"><i style="width:62%"></i></div></div>
        </div>

        <div class="grid g4c mt20" style="gap:16px">
          ${kpi('Invités', '126', '+8 cette semaine')}
          ${kpi('Présents', '84', '67 % de réponses', 'var(--ok)')}
          ${kpi('Absents', '12', '9 % du total', 'var(--bad)')}
          ${kpi('En attente', '30', 'Relance suggérée', 'var(--warn)')}
        </div>

        <div class="row g16 mt20 ais">
          <div class="card pad fx">
            <div class="row between aic"><div><div class="h3" style="font-size:16px">Réponses reçues</div><div class="cap muted mt4">12 dernières semaines</div></div>
              <span class="badge ok"><i></i>+18 cette semaine</span></div>
            <div class="row g8 aic mt20" style="height:132px">${[
              26, 34, 30, 44, 38, 52, 47, 66, 58, 74, 69, 88,
            ]
              .map(
                (v, i) => `
              <div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:100%">
                <div style="height:${v}%;border-radius:5px;background:${i > 9 ? 'linear-gradient(180deg,var(--go-500),var(--go-600))' : 'linear-gradient(180deg,var(--bx-500),var(--bx-700))'}"></div></div>`,
              )
              .join('')}</div>
            <div class="row between mt10">${['S24', 'S27', 'S30', 'S33', 'S36'].map((x) => `<span class="mic muted" style="font-weight:400">${x}</span>`).join('')}</div>
          </div>
          <div class="card pad" style="width:288px;flex:0 0 288px">
            <div class="h3" style="font-size:16px">Personnes attendues</div>
            <div class="row g16 aic mt20">
              <div style="position:relative;width:112px;height:112px;flex:0 0 112px;border-radius:999px;
                background:conic-gradient(var(--bx-700) 0 61%,var(--go-500) 61% 70%,var(--n-200) 70% 100%)">
                <div style="position:absolute;inset:14px;border-radius:999px;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center">
                  <div class="s-title" style="font-size:26px">137</div><div class="mic muted" style="font-weight:400">attendues</div></div></div>
              <div class="col g10">
                ${[
                  ['Invités confirmés', '84', 'var(--bx-700)'],
                  ['Accompagnants', '53', 'var(--go-500)'],
                  ['Sans réponse', '30', 'var(--n-200)'],
                ]
                  .map(
                    (r) => `
                <div class="row g8 aic"><span style="width:8px;height:8px;border-radius:2px;background:${r[2]}"></span>
                <span class="cap dim" style="flex:1">${r[0]}</span><span class="capm">${r[1]}</span></div>`,
                  )
                  .join('')}</div></div>
            <div class="mt20" style="padding-top:14px;border-top:1px solid var(--n-100)">
              <div class="row between"><span class="cap muted">Taux d’ouverture</span><span class="capm">91 %</span></div>
              <div class="row between mt8"><span class="cap muted">Taux de réponse</span><span class="capm">76 %</span></div></div>
          </div>
        </div>
      </div>

      <div style="width:330px;flex:0 0 330px">
        <div class="card pad">
          <div class="row between aic"><span class="h3" style="font-size:16px">Checklist</span><span class="capm gold">5 / 8</span></div>
          <div class="col g10 mt16">${chk
            .map(
              (c) => `<div class="row g10 aic">
            <span class="chk ${c[1] ? 'on' : ''}">${c[1] ? ic('check') : ''}</span>
            <span class="b" style="color:${c[1] ? 'var(--n-400)' : 'var(--n-700)'};${c[1] ? 'text-decoration:line-through' : ''}">${c[0]}</span></div>`,
            )
            .join('')}</div>
        </div>
        <div class="card pad mt16" style="background:var(--warn-bg);border-color:#F0DFC0">
          <div class="row g10 ais">${ic('alert', 'i18').replace('class="ic i18"', 'class="ic i18" style="stroke:var(--warn);margin-top:2px"')}
            <div><div class="bm" style="color:var(--warn)">30 personnes n’ont pas encore répondu</div>
            <div class="cap dim mt6">Dont 11 foyers qui n’ont jamais ouvert l’invitation.</div>
            <div class="row g8 mt12">${btn('Envoyer une relance', 'pri', null, 'sm')}${btn('Voir la liste', 'sec', null, 'sm')}</div></div></div>
        </div>
        <div class="card pad mt16">
          <div class="row between aic"><span class="h3" style="font-size:16px">Activité récente</span><span class="cap" style="color:var(--bx-700)">Tout voir</span></div>
          <div class="col g14 mt16">${act
            .map(
              (a) => `<div class="row g10 ais">
            <span style="width:28px;height:28px;flex:0 0 28px;border-radius:9px;display:flex;align-items:center;justify-content:center;
              background:var(--${a[2] === 'gld' ? 'go-50' : a[2] + '-bg'});color:var(--${a[2] === 'gld' ? 'go-700' : a[2]})">${ic(a[3], 'i14')}</span>
            <div style="flex:1"><div class="cap" style="color:var(--n-800);line-height:18px">${a[0]}</div>
            <div class="mic muted mt4" style="font-weight:400">${a[1]}</div></div></div>`,
            )
            .join('')}</div>
        </div>
      </div>
    </div>`,
    ),
  };
}

/* ============ 14 · MES ÉVÉNEMENTS ============ */
function p14() {
  const E = [
    [
      'Yasmine &amp; Adam',
      'Mariage',
      '6 juin 2026',
      'Publiée',
      'ok',
      62,
      126,
      '#F6F1E7',
      '#7A1F2B',
    ],
    [
      'Henné de Yasmine',
      'Henné',
      '5 juin 2026',
      'Publiée',
      'ok',
      48,
      86,
      '#F3E9DC',
      '#5F1822',
    ],
    [
      'Brunch du lendemain',
      'Réception',
      '7 juin 2026',
      'Brouillon',
      'neu',
      15,
      54,
      '#F6F4EF',
      '#635D53',
    ],
    [
      'Fiançailles Inès &amp; Malik',
      'Fiançailles',
      '5 juin 2027',
      'Brouillon',
      'neu',
      8,
      0,
      '#F7EEEA',
      '#8E2836',
    ],
    [
      'Les 30 ans de Nour',
      'Anniversaire',
      '12 mars 2026',
      'Terminé',
      'info',
      100,
      54,
      '#FBF6EC',
      '#B0762A',
    ],
    [
      'Baby shower Inès',
      'Baby shower',
      '8 février 2026',
      'Archivé',
      'neu',
      100,
      32,
      '#EFEDE7',
      '#46413A',
    ],
  ];
  return {
    n: '14',
    slug: 'mes-evenements',
    title: 'Mes événements',
    w: 1440,
    h: 1024,
    group: 'Application',
    html: shell(
      'Événement',
      'Mes événements',
      `
    ${phead('Mes événements', '6 événements · 2 en cours de préparation', `${btn('Importer', 'sec', 'upload')}${btn('Créer un événement', 'pri', 'plus')}`)}
    <div class="row between aic">
      <div class="row g8">${['Tous', 'Actifs', 'Brouillons', 'Terminés', 'Archivés'].map((f, i) => `<span class="btn ${i === 0 ? 'pri' : 'sec'} sm" style="border-radius:999px">${f}${i === 0 ? ' · 6' : ''}</span>`).join('')}</div>
      <div class="row g10">${btn('Filtrer', 'sec', 'filter', 'sm')}<span class="btn sec sm">${ic('sliders', 'i14')}Trier : Date${ic('cdown', 'i14')}</span>
        <span class="seg"><span class="on">${ic('grid', 'i14')}</span><span>${ic('menu', 'i14')}</span></span></div></div>
    <div class="grid g3 mt20" style="gap:20px">
      ${E.map(
        (e) => `<div class="card" style="overflow:hidden">
        <div style="height:150px;background:${e[7]};position:relative;display:flex;align-items:center;justify-content:center">
          <div class="tc"><div class="script" style="font-size:26px;color:${e[8]}">${e[0]}</div>
            <div class="mic mt6" style="letter-spacing:2px;color:${e[8]};opacity:.7;font-size:9px">${e[2].toUpperCase()}</div></div>
          <span style="position:absolute;top:12px;left:12px">${badge(e[3], e[4])}</span>
          <span style="position:absolute;top:10px;right:10px;width:28px;height:28px;border-radius:8px;background:rgba(255,255,255,.85);display:flex;align-items:center;justify-content:center">${ic('more', 'i16')}</span></div>
        <div style="padding:18px 20px">
          <div class="row between aic"><span class="bm">${e[0]}</span>${badge(e[1], 'brd')}</div>
          <div class="row g8 aic mt8 cap muted">${ic('calendar', 'i14')}<span>${e[2]}</span><span>·</span>${ic('users', 'i14')}<span>${e[6]} invités</span></div>
          <div class="mt16"><div class="row between"><span class="mic muted" style="font-weight:400">Préparation</span><span class="mic">${e[5]} %</span></div>
            <div class="prog mt6"><i style="width:${e[5]}%"></i></div></div>
          <div class="row g8 mt16">${btn('Ouvrir', 'sec', null, 'sm')}${btn('Studio', 'ghost', 'wand', 'sm')}</div></div></div>`,
      ).join('')}
      <div class="card" style="border-style:dashed;box-shadow:none;background:transparent;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;gap:12px">
        <span style="width:48px;height:48px;border-radius:14px;background:var(--go-50);border:1px solid var(--go-200);display:flex;align-items:center;justify-content:center;color:var(--go-700)">${ic('plus', 'i20')}</span>
        <span class="bm">Créer un événement</span><span class="cap muted" style="max-width:200px;text-align:center">Mariage, henné, anniversaire, baby shower…</span></div>
    </div>`,
    ),
  };
}

/* ============ 15 · CRÉER UN ÉVÉNEMENT ============ */
function p15() {
  return {
    n: '15',
    slug: 'creer-evenement',
    title: 'Créer un événement',
    w: 1440,
    h: 1024,
    group: 'Application',
    html: shell(
      'Événement',
      'Créer un événement',
      `
    <div style="max-width:1080px;margin:0 auto">
      ${phead('Créer un événement', 'Cinq informations suffisent — le reste se règle ensuite.')}
      <div class="row g24 ais">
        <div class="fx">
          <div class="card pad" style="padding:28px">
            <div class="over gold">1 · Type</div>
            <div class="row g10 wrap mt14">${[
              'Mariage',
              'Fiançailles',
              'Henné',
              'Anniversaire',
              'Baby shower',
              'Baptême',
              'Soirée privée',
              'Professionnel',
              'Autre',
            ]
              .map(
                (t, i) => `
              <span class="btn ${i === 0 ? 'pri' : 'sec'} sm" style="border-radius:999px">${t}</span>`,
              )
              .join('')}</div>
            <div style="height:1px;background:var(--n-100);margin:26px 0"></div>
            <div class="over gold">2 · Identité</div>
            <div class="col g16 mt14">
              ${fld('Nom de l’événement', 'Mariage de Yasmine &amp; Adam', '')}
              <div class="row g16">${fld('Date', 'Samedi 6 juin 2026', '')}${fld('Fuseau horaire', 'Europe/Paris (UTC+2)', '')}</div>
              ${fld('Ville principale', 'Le Tholonet, Bouches-du-Rhône', '')}
            </div>
            <div style="height:1px;background:var(--n-100);margin:26px 0"></div>
            <div class="over gold">3 · Organisateurs</div>
            <div class="col g12 mt14">
              ${[
                ['Yasmine Nadari', 'yasmine@exemple.com', 'Organisatrice'],
                ['Adam Ferrand', 'adam@exemple.com', 'Organisateur'],
              ]
                .map(
                  (o, i) => `
              <div class="row g12 aic card" style="padding:12px 14px;box-shadow:none">
                <span class="av lg${i ? ' g' : ''}">${o[0]
                  .split(' ')
                  .map((w) => w[0])
                  .join('')}</span>
                <div style="flex:1"><div class="bm">${o[0]}</div><div class="cap muted mt2">${o[1]}</div></div>
                ${badge(o[2], 'brd')}${ic('more', 'i16')}</div>`,
                )
                .join('')}
              <span class="btn sec sm" style="align-self:flex-start">${ic('plus', 'i14')}Ajouter un organisateur</span></div>
            <div style="height:1px;background:var(--n-100);margin:26px 0"></div>
            <div class="over gold">4 · Langues de l’invitation</div>
            <div class="row g10 mt14">${[
              ['Français', true],
              ['العربية', true],
              ['English', false],
              ['Español', false],
            ]
              .map(
                (l) => `
              <span class="btn ${l[1] ? 'pri' : 'sec'} sm" style="border-radius:999px">${l[1] ? ic('check', 'i14') : ''}${l[0]}</span>`,
              )
              .join('')}</div>
          </div>
          <div class="row between aic mt20">${btn('Annuler', 'ghost')}
            <div class="row g10">${btn('Enregistrer comme brouillon', 'sec')}${btn('Créer et choisir un template', 'pri', 'aright')}</div></div>
        </div>
        <div style="width:320px;flex:0 0 320px">
          <div class="card pad" style="position:sticky;top:0">
            <div class="over muted">Aperçu</div>
            <div class="mt14" style="border-radius:12px;overflow:hidden;border:1px solid var(--n-200)">
              <div style="height:120px;background:var(--cream);display:flex;flex-direction:column;align-items:center;justify-content:center">
                <div class="script" style="font-size:24px;color:var(--bx-700)">Yasmine &amp; Adam</div>
                <div class="mic mt6" style="letter-spacing:2px;color:var(--warm);font-size:9px">06 · 06 · 2026</div></div></div>
            <div class="col g10 mt16">
              ${[
                ['Type', 'Mariage'],
                ['Date', '6 juin 2026'],
                ['Compte à rebours', '157 jours'],
                ['Langues', 'FR · AR'],
              ]
                .map(
                  (r) => `
              <div class="row between"><span class="cap muted">${r[0]}</span><span class="capm">${r[1]}</span></div>`,
                )
                .join('')}</div>
            <div style="height:1px;background:var(--n-100);margin:16px 0"></div>
            <div class="row g10 ais">${ic('info', 'i16').replace('class="ic i16"', 'class="ic i16" style="stroke:var(--n-500);margin-top:2px"')}
              <span class="cap dim">Vous ajouterez les cérémonies, lieux et horaires juste après, dans l’onglet Programme.</span></div>
          </div></div>
      </div></div>`,
    ),
  };
}

/* ============ 16 · DÉTAIL ÉVÉNEMENT ============ */
function p16() {
  const tabs = [
    'Vue d’ensemble',
    'Programme',
    'Lieux',
    'Invitation',
    'Invités',
    'RSVP',
    'Envois',
    'Souvenirs',
    'Statistiques',
  ];
  return {
    n: '16',
    slug: 'detail-evenement',
    title: 'Détail événement',
    w: 1440,
    h: 1024,
    group: 'Application',
    html: shell(
      'Événement',
      'Détail de l’événement',
      `
    <div class="card" style="overflow:hidden;padding:0">
      <div style="height:132px;background:var(--ink);position:relative;overflow:hidden">
        <div style="position:absolute;width:600px;height:600px;left:-120px;top:-320px;border-radius:999px;background:radial-gradient(closest-side,rgba(122,31,43,.6),rgba(122,31,43,0))"></div>
        <div style="position:relative;padding:22px 26px;display:flex;align-items:center;justify-content:space-between;height:100%">
          <div class="row g16 aic">
            <div style="width:74px;height:88px;border-radius:12px;background:var(--cream);display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px solid rgba(212,176,123,.4)">
              <span class="script" style="font-size:22px;color:var(--bx-700);line-height:26px">Y&amp;A</span>
              <span class="mic" style="font-size:7.5px;letter-spacing:1px;color:var(--warm)">06·06·26</span></div>
            <div><div class="row g10 aic"><span class="h1" style="color:#F3EFE7;font-size:26px">Mariage de Yasmine &amp; Adam</span>
              <span class="badge ok" style="background:rgba(47,122,85,.18);color:#7BC49B"><i></i>Publiée</span></div>
              <div class="row g14 aic mt8 cap" style="color:#8C8478">
                <span class="row g6 aic">${ic('calendar', 'i14')}Samedi 6 juin 2026</span>
                <span class="row g6 aic">${ic('pin', 'i14')}Aix-en-Provence · Le Tholonet</span>
                <span class="row g6 aic">${ic('users', 'i14')}126 invités · 137 attendues</span></div></div></div>
          <div class="row g10">${btn('Aperçu', 'onDark', 'eye')}${btn('Partager', 'onDark', 'share')}${btn('Modifier', 'gold', 'pen')}</div></div></div>
      <div style="padding:0 26px;background:#fff">
        <div class="tabs">${tabs.map((t, i) => `<span class="${i === 0 ? 'on' : ''}">${t}</span>`).join('')}</div></div>
      <div style="padding:24px 26px;background:var(--n-25)">
        <div class="row g20 ais">
          <div class="fx">
            <div class="grid g3" style="gap:16px">
              ${kpi('Réponses', '96 / 126', '76 % de réponses')}
              ${kpi('Cérémonies', '3', 'Mairie · Réception · Brunch')}
              ${kpi('Souvenirs', '218', '186 photos · 32 audios', 'var(--go-700)')}</div>
            <div class="card pad mt20">
              <div class="row between aic"><span class="h3" style="font-size:16px">Programme du jour</span>${btn('Modifier', 'ghost', 'pen', 'sm')}</div>
              <div class="col g0 mt16">
                ${[
                  [
                    '14:00',
                    'Mairie d’Aix-en-Provence',
                    'Cérémonie civile',
                    '54 invités',
                  ],
                  [
                    '16:30',
                    'Domaine des Oliviers',
                    'Cérémonie &amp; vin d’honneur',
                    '126 invités',
                  ],
                  [
                    '20:00',
                    'Domaine des Oliviers',
                    'Dîner &amp; soirée',
                    '126 invités',
                  ],
                ]
                  .map(
                    (s, i, a) => `
                <div class="row g16 ais" style="padding:14px 0;${i < a.length - 1 ? 'border-bottom:1px solid var(--n-100)' : ''}">
                  <div style="width:56px;flex:0 0 56px"><div class="bm">${s[0]}</div></div>
                  <div style="width:12px;flex:0 0 12px;display:flex;flex-direction:column;align-items:center;padding-top:5px">
                    <span style="width:9px;height:9px;border-radius:999px;background:var(--bx-700)"></span>
                    ${i < a.length - 1 ? '<span style="flex:1;width:1px;background:var(--n-200);margin-top:4px;min-height:26px"></span>' : ''}</div>
                  <div style="flex:1"><div class="bm">${s[1]}</div><div class="cap muted mt4">${s[2]} · ${s[3]}</div></div>
                  ${ic('more', 'i16')}</div>`,
                  )
                  .join('')}</div></div>
            <div class="card pad mt20">
              <div class="row between aic"><span class="h3" style="font-size:16px">Lieux</span>${btn('Ajouter un lieu', 'ghost', 'plus', 'sm')}</div>
              <div class="row g16 mt16">
                ${[
                  [
                    'Mairie d’Aix-en-Provence',
                    'Place de l’Hôtel de Ville, 13100 Aix-en-Provence',
                  ],
                  ['Domaine des Oliviers', '340 route de Cézanne, Le Tholonet'],
                ]
                  .map(
                    (v) => `
                <div class="card fx" style="padding:0;overflow:hidden;box-shadow:none">
                  ${mapmock(320, 132, 0)}
                  <div style="padding:14px 16px"><div class="bm">${v[0]}</div><div class="cap muted mt4">${v[1]}</div>
                  <div class="row g8 mt12">${btn('Itinéraire', 'sec', 'pin', 'sm')}${btn('Copier l’adresse', 'ghost', 'copy', 'sm')}</div></div></div>`,
                  )
                  .join('')}</div></div>
          </div>
          <div style="width:300px;flex:0 0 300px">
            <div class="card pad"><div class="over muted">Invitation</div>
              <div class="mt14" style="border-radius:12px;overflow:hidden;border:1px solid var(--n-200)">${invThumb(266, 300, 266 / 390)}</div>
              <div class="row g8 mt14">${btn('Studio', 'pri', 'wand', 'sm')}${btn('Aperçu', 'sec', 'eye', 'sm')}</div></div>
            <div class="card pad mt16"><div class="over muted">Prochaines actions</div>
              <div class="col g12 mt14">
                ${[
                  ['Relancer 30 invités', 'J-157', 'send', 'warn'],
                  ['Imprimer les QR de table', 'J-30', 'qr', 'neu'],
                  ['Clore les RSVP', '1ᵉʳ sept.', 'checkc', 'neu'],
                ]
                  .map(
                    (a) => `
                <div class="row g10 aic"><span style="width:28px;height:28px;flex:0 0 28px;border-radius:8px;background:var(--n-50);display:flex;align-items:center;justify-content:center;color:var(--n-600)">${ic(a[2], 'i14')}</span>
                <span class="cap" style="flex:1;color:var(--n-800)">${a[0]}</span>${badge(a[1], a[3])}</div>`,
                  )
                  .join('')}</div></div>
            <div class="card pad mt16"><div class="over muted">Équipe</div>
              <div class="col g12 mt14">${[
                ['Yasmine N.', 'Owner'],
                ['Adam F.', 'Owner'],
                ['Nadia B.', 'Editor'],
              ]
                .map(
                  (m, i) => `
                <div class="row g10 aic"><span class="av${i % 2 ? ' g' : ''}">${m[0][0]}</span><span class="cap" style="flex:1;color:var(--n-800)">${m[0]}</span>
                <span class="mic muted">${m[1]}</span></div>`,
                )
                .join('')}
                <span class="btn ghost sm" style="align-self:flex-start;padding:0;color:var(--bx-700)">${ic('plus', 'i14')}Inviter</span></div></div>
          </div></div></div>
    </div>`,
      { flush: false },
    ),
  };
}

/* ============ 17 · PROGRAMME & SOUS-ÉVÉNEMENTS ============ */
function p17() {
  const S = [
    [
      'Mairie d’Aix-en-Provence',
      'Cérémonie civile',
      '14:00 — 15:00',
      'Place de l’Hôtel de Ville, 13100 Aix-en-Provence',
      '54 invités · Proches uniquement',
      'ok',
    ],
    [
      'Domaine des Oliviers',
      'Cérémonie laïque',
      '16:30 — 17:30',
      '340 route de Cézanne, Le Tholonet',
      '126 invités · Tous',
      'ok',
    ],
    [
      'Domaine des Oliviers',
      'Cocktail &amp; vin d’honneur',
      '18:00 — 20:00',
      'Jardin d’hiver',
      '126 invités · Tous',
      'ok',
    ],
    [
      'Domaine des Oliviers',
      'Dîner &amp; soirée',
      '20:00 — 03:00',
      'Grande salle',
      '118 invités · Hors enfants',
      'warn',
    ],
  ];
  return {
    n: '17',
    slug: 'programme',
    title: 'Programme & sous-événements',
    w: 1440,
    h: 1024,
    group: 'Application',
    html: shell(
      'Événement',
      'Programme',
      `
    ${phead(
      'Programme du samedi 6 juin',
      '4 moments · 2 lieux · les invités sont attribués par moment',
      `${btn('Réorganiser', 'sec', 'grip')}${btn('Ajouter un moment', 'pri', 'plus')}`,
    )}
    <div class="row g20 ais">
      <div class="fx">
        ${S.map(
          (
            s,
            i,
          ) => `<div class="card" style="padding:0;overflow:hidden;margin-bottom:16px;display:flex">
          <div style="width:8px;background:${i < 2 ? 'var(--bx-700)' : 'var(--go-500)'}"></div>
          <div style="flex:1;padding:18px 20px">
            <div class="row between ais">
              <div class="row g14 ais">
                <span style="color:var(--n-300);cursor:grab;margin-top:2px">${ic('grip', 'i18')}</span>
                <div>
                  <div class="row g10 aic"><span class="h3" style="font-size:17px">${s[1]}</span>${badge(s[5] === 'ok' ? 'Confirmé' : 'À confirmer', s[5])}</div>
                  <div class="row g16 aic mt8 cap muted">
                    <span class="row g6 aic">${ic('clock', 'i14')}${s[2]}</span>
                    <span class="row g6 aic">${ic('pin', 'i14')}${s[0]}</span></div>
                  <div class="cap muted mt6" style="padding-left:20px">${s[3]}</div>
                  <div class="row g10 aic mt12">
                    <div class="row" style="margin-left:0">${[0, 1, 2, 3].map((k) => `<span class="av${k % 2 ? ' g' : ''}" style="width:24px;height:24px;font-size:9px;margin-left:${k ? '-7px' : '0'};border:2px solid #fff"></span>`).join('')}</div>
                    <span class="cap" style="color:var(--n-700)">${s[4]}</span>
                    <span class="btn ghost sm" style="padding:0;color:var(--bx-700)">Gérer les invités</span></div>
                </div></div>
              <div class="row g8">${btn('', 'sec', 'pen', 'sm')}${btn('', 'sec', 'copy', 'sm')}${btn('', 'ghost', 'more', 'sm')}</div>
            </div></div>
          <div style="width:230px;flex:0 0 230px;border-left:1px solid var(--n-100)">${mapmock(230, 164, 0)}</div>
        </div>`,
        ).join('')}
        <div class="card" style="border-style:dashed;box-shadow:none;background:transparent;padding:20px;display:flex;align-items:center;justify-content:center;gap:10px">
          ${ic('plus', 'i16').replace('class="ic i16"', 'class="ic i16" style="stroke:var(--n-500)"')}<span class="bm muted">Ajouter un moment au programme</span></div>
      </div>
      <div style="width:340px;flex:0 0 340px">
        <div class="card pad"><div class="over muted">Vue chronologique</div>
          <div class="col mt16">${[
            ['14:00', 'Mairie', 'var(--bx-700)'],
            ['16:30', 'Cérémonie', 'var(--bx-700)'],
            ['18:00', 'Cocktail', 'var(--go-500)'],
            ['20:00', 'Dîner', 'var(--go-500)'],
            ['03:00', 'Fin', 'var(--n-300)'],
          ]
            .map(
              (r, i, a) => `
            <div class="row g12 ais"><span class="mic" style="width:36px;flex:0 0 36px;color:var(--n-500);font-weight:400;padding-top:1px">${r[0]}</span>
              <div style="width:11px;flex:0 0 11px;display:flex;flex-direction:column;align-items:center">
                <span style="width:9px;height:9px;border-radius:999px;background:${r[2]}"></span>
                ${i < a.length - 1 ? `<span style="flex:1;width:1px;background:var(--n-200);min-height:${i === 0 ? 32 : 38}px;margin:3px 0"></span>` : ''}</div>
              <span class="cap" style="color:var(--n-800);padding-top:0">${r[1]}</span></div>`,
            )
            .join('')}</div></div>
        <div class="card pad mt16"><div class="over muted">Lieux</div>
          <div class="col g14 mt14">${[
            ['Mairie d’Aix-en-Provence', '1 place d’Armes', '2 moments'],
            ['Domaine des Oliviers', '340 route de Cézanne', '3 moments'],
          ]
            .map(
              (v) => `
            <div class="row g12 ais"><div style="border-radius:8px;overflow:hidden;flex:0 0 68px">${mapmock(68, 52, 0)}</div>
            <div style="flex:1"><div class="capm">${v[0]}</div><div class="mic muted mt4" style="font-weight:400">${v[1]}</div>
            <div class="mic gold mt4">${v[2]}</div></div></div>`,
            )
            .join('')}</div>
          <div class="mt16">${btn('Ajouter un lieu', 'sec', 'plus', 'sm blk')}</div></div>
        <div class="card pad mt16" style="background:var(--go-50);border-color:var(--go-200)">
          <div class="row g10 ais">${ic('sparkle', 'i16').replace('class="ic i16"', 'class="ic i16" style="stroke:var(--go-700);margin-top:2px"')}
          <div><div class="capm" style="color:var(--go-700)">Le programme apparaît dans l’invitation</div>
          <div class="cap dim mt6">Chaque invité ne voit que les moments auxquels il est convié.</div></div></div></div>
      </div>
    </div>`,
    ),
  };
}

module.exports = [
  p09,
  p10,
  p11,
  p12a,
  p12b,
  p12c,
  p12d,
  p13,
  p14,
  p15,
  p16,
  p17,
].map((f) => f());
