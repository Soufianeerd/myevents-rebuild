// Écrans 39 → 43 — Expérience invité (mobile-first)
const L = require('./lib.js');
const { ic, btn, badge, invitation, qr, mapmock } = L;

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

/* barre de statut iOS stylisée */
const statusBar = (
  dark,
) => `<div style="height:44px;display:flex;align-items:center;justify-content:space-between;padding:0 26px;color:${dark ? '#F3EFE7' : 'var(--inv-ink)'}">
  <span class="mic" style="font-weight:600">9:41</span>
  <div class="row g5 aic">
    <svg viewBox="0 0 18 12" style="width:17px;height:11px;fill:currentColor"><rect x="0" y="7" width="3" height="5" rx="1"/><rect x="4.5" y="5" width="3" height="7" rx="1"/><rect x="9" y="2.5" width="3" height="9.5" rx="1"/><rect x="13.5" y="0" width="3" height="12" rx="1"/></svg>
    <svg viewBox="0 0 16 12" style="width:15px;height:11px;fill:currentColor"><path d="M8 11.2 5.4 8.5a3.7 3.7 0 0 1 5.2 0L8 11.2Zm-5-5.1a7.4 7.4 0 0 1 10 0l-1.4 1.5a5.4 5.4 0 0 0-7.2 0L3 6.1ZM.5 3.4a11 11 0 0 1 15 0L14 4.9a9 9 0 0 0-12 0L.5 3.4Z"/></svg>
    <svg viewBox="0 0 26 12" style="width:24px;height:11px"><rect x="0.5" y="0.5" width="21" height="11" rx="3.2" fill="none" stroke="currentColor" stroke-opacity=".4"/><rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor"/><path d="M23.5 4v4a2.4 2.4 0 0 0 0-4Z" fill="currentColor" fill-opacity=".5"/></svg>
  </div></div>`;

const homeBar = (
  dark,
) => `<div style="height:28px;display:flex;align-items:center;justify-content:center">
  <span style="width:126px;height:4px;border-radius:999px;background:${dark ? 'rgba(243,239,231,.35)' : 'rgba(42,18,20,.28)'}"></span></div>`;

/* ============ 39 · INVITATION PUBLIÉE ============ */
function p39() {
  return {
    n: '39',
    slug: 'invitation-publiee',
    title: 'Invitation publiée (invité)',
    w: 390,
    h: 2681,
    cls: 'screen mobile solo',
    group: 'Invité mobile',
    html: `${statusBar(false)}${invitation()}`,
  };
}

/* ============ 40 · RSVP INVITÉ ============ */
function p40() {
  const member = (
    n,
    ini,
    state,
    note,
  ) => `<div class="card" style="padding:14px;box-shadow:none;border-color:${state === 'ok' ? 'rgba(122,31,43,.35)' : 'var(--n-200)'};background:${state === 'ok' ? 'rgba(122,31,43,.03)' : '#fff'}">
    <div class="row g10 aic"><span class="av" style="background:${state === 'ok' ? 'var(--bx-100)' : 'var(--n-100)'};color:${state === 'ok' ? 'var(--bx-700)' : 'var(--n-500)'}">${ini}</span>
      <div style="flex:1"><div class="bm" style="font-size:13px">${n}</div>${note ? `<div class="mic muted mt2" style="font-weight:400">${note}</div>` : ''}</div></div>
    <div class="row g8 mt12">
      <span style="flex:1;display:flex;align-items:center;justify-content:center;gap:7px;height:38px;border-radius:9px;font-size:12px;font-weight:500;
        background:${state === 'ok' ? 'var(--bx-700)' : '#fff'};color:${state === 'ok' ? '#fff' : 'var(--n-600)'};border:1px solid ${state === 'ok' ? 'var(--bx-700)' : 'var(--n-300)'}">
        ${state === 'ok' ? ic('check', 'i14') : ''}Présent(e)</span>
      <span style="flex:1;display:flex;align-items:center;justify-content:center;gap:7px;height:38px;border-radius:9px;font-size:12px;font-weight:500;
        background:${state === 'bad' ? 'var(--bad)' : '#fff'};color:${state === 'bad' ? '#fff' : 'var(--n-600)'};border:1px solid ${state === 'bad' ? 'var(--bad)' : 'var(--n-300)'}">
        ${state === 'bad' ? ic('close', 'i14') : ''}Absent(e)</span></div></div>`;
  return {
    n: '40',
    slug: 'rsvp-invite',
    title: 'RSVP invité',
    w: 390,
    h: 1560,
    cls: 'screen mobile solo',
    group: 'Invité mobile',
    html: `
  ${statusBar(false)}
  <div style="padding:8px 24px 40px">
    <div class="tc" style="padding:16px 0 24px">
      <div class="mic" style="letter-spacing:2.4px;text-transform:uppercase;color:var(--go-600)">Réponse souhaitée</div>
      <div class="script mt12" style="font-size:34px;line-height:44px;color:var(--bx-700)">Bonjour<br>Famille Benali</div>
      <div class="s-body mt12" style="font-size:14px;line-height:22px;color:var(--warm)">Merci de confirmer la présence de chacun<br>avant le 1ᵉʳ mai 2026.</div>
    </div>

    <div class="row g10 aic" style="background:rgba(184,146,92,.12);border:1px solid rgba(184,146,92,.3);border-radius:11px;padding:11px 13px">
      ${ic('clock', 'i16').replace('class="ic i16"', 'class="ic i16" style="stroke:var(--go-700)"')}
      <span class="cap" style="color:var(--go-700);flex:1">Il reste 120 jours pour répondre</span></div>

    <div class="mic mt24" style="letter-spacing:2px;text-transform:uppercase;color:var(--warm)">Les 5 membres de votre foyer</div>
    <div class="col g10 mt12">
      ${member('Yassine Benali', 'YB', 'ok', 'Contact principal')}
      ${member('Sofia Benali', 'SB', 'ok', '')}
      ${member('Leïla Benali', 'LB', 'ok', 'Enfant · 8 ans')}
      ${member('Mehdi Benali', 'MB', 'bad', '')}
      ${member('Karima Benali', 'KB', '', 'Sans réponse')}
    </div>

    <div class="mic mt24" style="letter-spacing:2px;text-transform:uppercase;color:var(--warm)">Accompagnants autorisés</div>
    <div class="card mt12" style="padding:14px;box-shadow:none">
      <div class="row between aic"><div><div class="bm" style="font-size:13px">1 accompagnant</div>
        <div class="mic muted mt2" style="font-weight:400">Pour Yassine Benali</div></div>
        <div class="row g8 aic"><span style="width:30px;height:30px;border-radius:8px;border:1px solid var(--n-300);display:flex;align-items:center;justify-content:center;color:var(--n-500)">${ic('minus', 'i14')}</span>
          <span class="bm" style="width:20px;text-align:center">1</span>
          <span style="width:30px;height:30px;border-radius:8px;border:1px solid var(--n-300);display:flex;align-items:center;justify-content:center;color:var(--n-500)">${ic('plus', 'i14')}</span></div></div>
      <div class="inp mt12" style="height:40px;font-size:13px">Nom de l’accompagnant</div></div>

    <div class="mic mt24" style="letter-spacing:2px;text-transform:uppercase;color:var(--warm)">Moments auxquels vous êtes conviés</div>
    <div class="col g8 mt12">
      ${[
        ['Mairie d’Aix-en-Provence', 'Samedi 14:00', true, true],
        ['Cérémonie', 'Samedi 16:30', true, true],
        ['Cocktail', 'Samedi 18:00', false, false],
        ['Dîner &amp; soirée', 'Samedi 20:00', true, true],
      ]
        .map(
          (s) => `
      <div class="row g11 aic" style="gap:11px;padding:12px 13px;border-radius:11px;border:1px solid ${s[3] ? 'rgba(122,31,43,.3)' : 'var(--n-200)'};background:${s[2] ? '#fff' : 'var(--n-50)'};${!s[2] ? 'opacity:.6' : ''}">
        <span class="chk ${s[3] ? 'on' : ''}">${s[3] ? ic('check') : ''}</span>
        <div style="flex:1"><div class="bm" style="font-size:13px">${s[0]}</div><div class="mic muted mt2" style="font-weight:400">${s[1]}</div></div>
        ${!s[2] ? '<span class="mic muted" style="font-weight:400">Non convié</span>' : ''}</div>`,
        )
        .join('')}</div>

    <div class="mic mt24" style="letter-spacing:2px;text-transform:uppercase;color:var(--warm)">Régime alimentaire</div>
    <div class="row g8 wrap mt12">
      ${[
        ['Aucune contrainte', false],
        ['Végétarien', true],
        ['Sans gluten', false],
        ['Halal', true],
        ['Allergies', false],
      ]
        .map(
          (t) => `
      <span style="padding:8px 13px;border-radius:999px;font-size:12px;font-weight:500;border:1px solid ${t[1] ? 'var(--bx-700)' : 'var(--n-300)'};
        background:${t[1] ? 'var(--bx-700)' : '#fff'};color:${t[1] ? '#fff' : 'var(--n-600)'}">${t[0]}</span>`,
        )
        .join('')}</div>

    <div class="mic mt24" style="letter-spacing:2px;text-transform:uppercase;color:var(--warm)">Accessibilité</div>
    <div class="inp mt12" style="height:44px;font-size:13px;color:var(--n-400)">Un besoin particulier ? (facultatif)</div>

    <div class="mic mt24" style="letter-spacing:2px;text-transform:uppercase;color:var(--warm)">Un mot pour les mariés</div>
    <div class="inp ta mt12" style="min-height:88px;font-size:13px;color:var(--n-400)">Votre message…</div>

    <div style="height:50px;border-radius:11px;background:var(--bx-700);color:var(--cream);display:flex;align-items:center;justify-content:center;
      font-size:12px;letter-spacing:1.8px;font-weight:500;margin-top:26px">CONFIRMER NOTRE RÉPONSE</div>
    <div class="cap tc mt12" style="color:var(--warm)">Vous pourrez modifier votre réponse jusqu’au 1ᵉʳ mai.</div>
  </div>
  ${homeBar(false)}`,
  };
}

/* ============ 41 · ENREGISTREMENT AUDIO ============ */
function p41() {
  const bars = [];
  for (let i = 0; i < 48; i++) {
    const h = 6 + Math.abs(Math.sin(i * 0.7)) * 40;
    bars.push(h);
  }
  return {
    n: '41',
    slug: 'livre-audio-invite',
    title: 'QR Livre d’or audio · enregistrement',
    w: 390,
    h: 844,
    cls: 'screen mobile solo',
    group: 'Invité mobile',
    html: `<div style="height:844px;background:var(--bx-900);position:relative;overflow:hidden;display:flex;flex-direction:column">
    <div style="position:absolute;width:620px;height:620px;left:-140px;top:-260px;border-radius:999px;background:radial-gradient(closest-side,rgba(212,176,123,.20),rgba(212,176,123,0))"></div>
    <div style="position:absolute;width:520px;height:520px;right:-180px;bottom:-200px;border-radius:999px;background:radial-gradient(closest-side,rgba(158,53,67,.35),rgba(158,53,67,0))"></div>
    <div style="position:relative">${statusBar(true)}</div>
    <div style="position:relative;flex:1;display:flex;flex-direction:column;align-items:center;padding:24px 28px 0;text-align:center">
      <div class="script" style="font-size:26px;color:var(--go-300)">Yasmine &amp; Adam</div>
      <div class="mic mt6" style="letter-spacing:2px;color:rgba(212,176,123,.6);font-weight:400">06 · 06 · 2026</div>

      <div class="s-title mt32" style="font-size:30px;line-height:40px;color:#F7F3EC">Laissez-nous<br>un souvenir de votre voix</div>
      <div class="cap mt14" style="color:rgba(243,239,231,.6);line-height:20px;max-width:270px">Un mot, une anecdote, un vœu. Trois minutes maximum, et c’est gardé pour toujours.</div>

      <div class="row g4 aic mt40" style="height:64px;gap:3px">
        ${bars.map((h, i) => `<div style="flex:1;height:${i < 28 ? h : h * 0.4}px;border-radius:2px;background:${i < 28 ? 'var(--go-500)' : 'rgba(212,176,123,.25)'}"></div>`).join('')}</div>

      <div class="s-title mt20" style="font-size:34px;color:#F7F3EC;font-family:var(--sans);font-weight:300;letter-spacing:1px">00:47</div>
      <div class="mic mt4" style="color:rgba(243,239,231,.4);font-weight:400">sur 03:00 maximum</div>

      <div class="row g24 aic mt40">
        <div class="col aic g8">
          <span style="width:52px;height:52px;border-radius:999px;border:1px solid rgba(243,239,231,.2);display:flex;align-items:center;justify-content:center;color:rgba(243,239,231,.75)">${ic('refresh', 'i20')}</span>
          <span class="mic" style="color:rgba(243,239,231,.45);font-weight:400">Recommencer</span></div>
        <div class="col aic g8">
          <span style="width:88px;height:88px;border-radius:999px;background:var(--go-500);display:flex;align-items:center;justify-content:center;color:var(--bx-900);box-shadow:0 0 0 10px rgba(212,176,123,.16),0 0 0 22px rgba(212,176,123,.07)">${ic('stop', 'i32')}</span>
          <span class="mic" style="color:var(--go-300);font-weight:500">Arrêter</span></div>
        <div class="col aic g8">
          <span style="width:52px;height:52px;border-radius:999px;border:1px solid rgba(243,239,231,.2);display:flex;align-items:center;justify-content:center;color:rgba(243,239,231,.75)">${ic('play', 'i20')}</span>
          <span class="mic" style="color:rgba(243,239,231,.45);font-weight:400">Réécouter</span></div></div>

      <div style="width:100%;margin-top:auto;padding-bottom:8px">
        <div class="row g10 aic" style="background:rgba(255,255,255,.06);border:1px solid rgba(212,176,123,.18);border-radius:11px;padding:11px 13px">
          <span style="color:var(--go-500)">${ic('user', 'i16')}</span>
          <span class="cap" style="color:rgba(243,239,231,.75);flex:1">Yassine Benali</span>
          <span style="color:rgba(243,239,231,.4)">${ic('pen', 'i14')}</span></div>
        <div style="height:52px;border-radius:11px;background:var(--go-500);color:var(--bx-900);display:flex;align-items:center;justify-content:center;gap:9px;
          font-size:12px;letter-spacing:1.6px;font-weight:600;margin-top:12px">${ic('send', 'i16')}ENVOYER MON MESSAGE</div>
        <div class="mic tc mt12" style="color:rgba(243,239,231,.35);font-weight:400">Votre message sera écouté par les mariés uniquement.</div>
      </div>
    </div>
    <div style="position:relative">${homeBar(true)}</div>
  </div>`,
  };
}

/* ============ 42 · PHOTO / VIDÉO ============ */
function p42() {
  return {
    n: '42',
    slug: 'photos-invite',
    title: 'QR Photos & vidéos · dépôt',
    w: 390,
    h: 844,
    cls: 'screen mobile solo',
    group: 'Invité mobile',
    html: `<div style="height:844px;background:var(--cream);display:flex;flex-direction:column">
    ${statusBar(false)}
    <div style="flex:1;padding:16px 24px 0;display:flex;flex-direction:column">
      <div class="tc">
        <div class="script" style="font-size:24px;color:var(--bx-700)">Yasmine &amp; Adam</div>
        <div class="mic mt4" style="letter-spacing:2px;color:var(--warm);font-weight:400">06 · 06 · 2026</div>
        <div class="s-title mt20" style="font-size:30px;line-height:38px;color:var(--bx-700)">Partagez<br>votre souvenir</div>
        <div class="cap mt12" style="color:var(--warm);line-height:20px">Vos photos et vidéos rejoignent directement<br>l’album privé des mariés.</div></div>

      <div class="col g10 mt24">
        <div class="row g12 aic" style="background:var(--bx-700);border-radius:13px;padding:16px 18px;color:#F6F1E7">
          <span style="width:42px;height:42px;flex:0 0 42px;border-radius:12px;background:rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center">${ic('camera', 'i20')}</span>
          <div style="flex:1"><div class="bm" style="font-size:14px">Prendre une photo</div>
            <div class="mic mt2" style="color:rgba(246,241,231,.6);font-weight:400">Appareil photo</div></div>
          ${ic('cright', 'i16')}</div>
        <div class="row g12 aic" style="background:#fff;border:1px solid rgba(184,146,92,.3);border-radius:13px;padding:16px 18px">
          <span style="width:42px;height:42px;flex:0 0 42px;border-radius:12px;background:var(--go-50);border:1px solid var(--go-200);display:flex;align-items:center;justify-content:center;color:var(--go-700)">${ic('video', 'i20')}</span>
          <div style="flex:1"><div class="bm" style="font-size:14px">Filmer une vidéo</div>
            <div class="mic muted mt2" style="font-weight:400">30 secondes maximum</div></div>
          <span style="color:var(--n-400)">${ic('cright', 'i16')}</span></div>
        <div class="row g12 aic" style="background:#fff;border:1px solid rgba(184,146,92,.3);border-radius:13px;padding:16px 18px">
          <span style="width:42px;height:42px;flex:0 0 42px;border-radius:12px;background:var(--go-50);border:1px solid var(--go-200);display:flex;align-items:center;justify-content:center;color:var(--go-700)">${ic('image', 'i20')}</span>
          <div style="flex:1"><div class="bm" style="font-size:14px">Choisir depuis la galerie</div>
            <div class="mic muted mt2" style="font-weight:400">Jusqu’à 20 fichiers à la fois</div></div>
          <span style="color:var(--n-400)">${ic('cright', 'i16')}</span></div>
      </div>

      <div class="row between aic mt24">
        <span class="mic" style="letter-spacing:2px;text-transform:uppercase;color:var(--warm)">Prêts à envoyer · 4</span>
        <span class="mic" style="color:var(--bx-700);font-weight:500">Tout effacer</span></div>
      <div class="row g8 mt12">
        ${[0, 1, 2, 3]
          .map(
            (
              i,
            ) => `<div style="flex:1;aspect-ratio:1;border-radius:11px;background:${tint(i)};border:1px solid rgba(184,146,92,.25);position:relative;display:flex;align-items:center;justify-content:center;color:rgba(122,31,43,.22)">
          ${ic(i === 2 ? 'video' : 'image', 'i20')}
          <span style="position:absolute;top:5px;right:5px;width:17px;height:17px;border-radius:999px;background:rgba(42,18,20,.55);display:flex;align-items:center;justify-content:center;color:#fff">${ic('close', 'i14').replace('class="ic i14"', 'class="ic" style="width:10px;height:10px"')}</span>
          ${i === 2 ? `<span style="position:absolute;bottom:5px;left:5px;background:rgba(42,18,20,.6);border-radius:5px;padding:2px 5px;font-size:8px;color:#fff">0:18</span>` : ''}</div>`,
          )
          .join('')}</div>

      <div class="mt20">
        <div class="inp" style="height:44px;font-size:13px;background:#fff;border-color:rgba(184,146,92,.3)">
          ${ic('user', 'i14')}<span style="color:var(--n-800)">Yassine Benali</span></div>
        <div class="inp mt10" style="height:44px;font-size:13px;background:#fff;border-color:rgba(184,146,92,.3);color:var(--n-400)">Une légende ? (facultatif)</div></div>

      <div style="margin-top:auto;padding-bottom:8px">
        <div style="height:50px;border-radius:11px;background:var(--bx-700);color:var(--cream);display:flex;align-items:center;justify-content:center;gap:9px;
          font-size:12px;letter-spacing:1.6px;font-weight:500">${ic('upload', 'i16')}ENVOYER AUX MARIÉS</div>
        <div class="row g8 aic center mt12">${ic('lock', 'i14').replace('class="ic i14"', 'class="ic i14" style="stroke:var(--warm)"')}
          <span class="mic" style="color:var(--warm);font-weight:400">Album privé · visible uniquement par les mariés</span></div></div>
    </div>
    ${homeBar(false)}</div>`,
  };
}

/* ============ 43 · GALERIE INVITÉS ============ */
function p43() {
  const hs = [168, 124, 148, 190, 132, 176, 144, 200, 136, 160, 184, 128];
  return {
    n: '43',
    slug: 'galerie-invites',
    title: 'Galerie privée (invité)',
    w: 390,
    h: 1180,
    cls: 'screen mobile solo',
    group: 'Invité mobile',
    html: `<div style="background:var(--cream);min-height:1180px;display:flex;flex-direction:column">
    ${statusBar(false)}
    <div style="padding:8px 20px 0">
      <div class="row between aic">
        <span style="width:36px;height:36px;border-radius:10px;background:#fff;border:1px solid rgba(184,146,92,.3);display:flex;align-items:center;justify-content:center;color:var(--bx-700)">${ic('aleft', 'i16')}</span>
        <div class="tc"><div class="script" style="font-size:20px;color:var(--bx-700);line-height:24px">Yasmine &amp; Adam</div>
          <div class="mic" style="letter-spacing:1.6px;color:var(--warm);font-weight:400;font-size:8.5px">GALERIE PRIVÉE</div></div>
        <span style="width:36px;height:36px;border-radius:10px;background:#fff;border:1px solid rgba(184,146,92,.3);display:flex;align-items:center;justify-content:center;color:var(--bx-700)">${ic('share', 'i16')}</span></div>

      <div class="row g14 aic center mt20" style="padding:14px 0;border-top:1px solid rgba(184,146,92,.22);border-bottom:1px solid rgba(184,146,92,.22)">
        ${[
          ['168', 'photos'],
          ['34', 'vidéos'],
          ['42', 'contributeurs'],
        ]
          .map(
            (s, i, a) => `
        <div class="tc" style="flex:1"><div class="s-title" style="font-size:20px;color:var(--bx-700)">${s[0]}</div>
          <div class="mic mt2" style="color:var(--warm);font-weight:400">${s[1]}</div></div>
        ${i < a.length - 1 ? '<span style="width:1px;height:26px;background:rgba(184,146,92,.25)"></span>' : ''}`,
          )
          .join('')}</div>

      <div class="row g8 mt16" style="overflow:hidden">
        ${[
          ['Tout', true],
          ['Photos', false],
          ['Vidéos', false],
          ['Cérémonie', false],
          ['Soirée', false],
        ]
          .map(
            (f) => `
        <span style="flex:0 0 auto;padding:7px 14px;border-radius:999px;font-size:11.5px;font-weight:500;
          background:${f[1] ? 'var(--bx-700)' : '#fff'};color:${f[1] ? 'var(--cream)' : 'var(--warm)'};border:1px solid ${f[1] ? 'var(--bx-700)' : 'rgba(184,146,92,.3)'}">${f[0]}</span>`,
          )
          .join('')}</div>
    </div>

    <div style="padding:16px 20px 0;column-count:2;column-gap:10px">
      ${hs
        .map(
          (
            h,
            i,
          ) => `<div style="break-inside:avoid;margin-bottom:10px;border-radius:12px;overflow:hidden;position:relative;height:${h}px;background:${tint(i)};border:1px solid rgba(184,146,92,.2)">
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(122,31,43,.2)">${ic(i % 5 === 2 ? 'video' : 'image', 'i24')}</div>
        ${
          i % 5 === 2
            ? `<span style="position:absolute;top:8px;right:8px;background:rgba(42,18,20,.55);border-radius:6px;padding:3px 6px;display:flex;align-items:center;gap:4px">
          <span style="color:#fff">${ic('play', 'i14').replace('class="ic i14"', 'class="ic" style="width:9px;height:9px"')}</span><span style="font-size:8.5px;color:#fff">0:${18 + i}</span></span>`
            : ''
        }
        <div style="position:absolute;bottom:0;left:0;right:0;padding:8px 10px;background:linear-gradient(180deg,transparent,rgba(42,18,20,.5))">
          <span style="font-size:9px;color:rgba(255,255,255,.9)">${['Amina', 'Karim', 'Nour', 'Leïla', 'Yassine', 'Fatima'][i % 6]}</span></div>
      </div>`,
        )
        .join('')}
    </div>

    <div style="padding:16px 20px 24px">
      <div style="height:46px;border-radius:11px;background:#fff;border:1px solid rgba(184,146,92,.35);color:var(--bx-700);display:flex;align-items:center;justify-content:center;gap:9px;
        font-size:12px;letter-spacing:1.4px;font-weight:500">${ic('refresh', 'i16')}CHARGER PLUS</div>
      <div class="row g10 aic mt16" style="background:rgba(184,146,92,.12);border:1px solid rgba(184,146,92,.28);border-radius:11px;padding:12px 14px">
        ${ic('camera', 'i16').replace('class="ic i16"', 'class="ic i16" style="stroke:var(--go-700)"')}
        <span class="cap" style="color:var(--go-700);flex:1;line-height:18px">Vous avez d’autres souvenirs ? Ajoutez-les à la galerie.</span>
        <span style="color:var(--go-700)">${ic('cright', 'i16')}</span></div>
      <div class="mic tc mt16" style="color:var(--warm);font-weight:400">Créé avec MyEvent’s</div>
    </div>
    ${homeBar(false)}</div>`,
  };
}

module.exports = [p39, p40, p41, p42, p43].map((f) => f());
