// Écran 44 — Planche des états UI
const L = require('./lib.js');
const { ic, btn, badge } = L;

const box = (
  t,
  d,
  body,
  w,
) => `<div style="${w ? `grid-column:span ${w}` : ''}">
  <div class="row g10 aic"><span class="capm">${t}</span></div>
  <div class="mic muted mt2" style="font-weight:400">${d}</div>
  <div class="mt10">${body}</div></div>`;

function p44() {
  const skel = `<div class="card pad" style="box-shadow:none">
    <div class="row between aic"><div class="sk" style="width:130px;height:12px"></div><div class="sk" style="width:60px;height:20px;border-radius:999px"></div></div>
    <div class="sk mt16" style="width:88px;height:30px"></div>
    <div class="sk mt10" style="width:100%;height:9px"></div>
    <div class="sk mt6" style="width:72%;height:9px"></div>
    <div class="row g10 mt16">${[1, 2, 3].map(() => `<div class="sk" style="flex:1;height:56px;border-radius:10px"></div>`).join('')}</div></div>`;

  const autosave = `<div class="row g14">
    <div class="row g8 aic card" style="padding:9px 13px;box-shadow:none">
      <span style="width:14px;height:14px;border-radius:999px;border:2px solid var(--n-200);border-top-color:var(--bx-700)"></span>
      <span class="cap dim">Enregistrement…</span></div>
    <div class="row g8 aic card" style="padding:9px 13px;box-shadow:none">
      <span style="width:7px;height:7px;border-radius:999px;background:var(--ok)"></span>
      <span class="cap dim">Enregistré · il y a 4 s</span></div>
    <div class="row g8 aic card" style="padding:9px 13px;box-shadow:none;border-color:#E3C4C4">
      <span style="color:var(--bad)">${ic('alert', 'i14')}</span>
      <span class="cap" style="color:var(--bad)">Échec — nouvelle tentative</span></div></div>`;

  const empty = `<div class="card" style="padding:36px 26px;text-align:center;border-style:dashed;box-shadow:none;background:transparent">
    <span style="width:52px;height:52px;margin:0 auto;border-radius:15px;background:var(--go-50);border:1px solid var(--go-200);display:flex;align-items:center;justify-content:center;color:var(--go-700)">${ic('users', 'i24')}</span>
    <div class="h3 mt16" style="font-size:16px">Aucun invité pour l’instant</div>
    <div class="cap dim mt8" style="max-width:280px;margin:8px auto 0">Importez votre liste ou ajoutez vos proches un par un. Vous pourrez les organiser en foyers ensuite.</div>
    <div class="row g10 center mt18">${btn('Importer un CSV', 'sec', 'upload', 'sm')}${btn('Ajouter un invité', 'pri', 'plus', 'sm')}</div></div>`;

  const noResult = `<div class="card" style="padding:32px 26px;text-align:center;box-shadow:none">
    <span style="width:46px;height:46px;margin:0 auto;border-radius:13px;background:var(--n-50);display:flex;align-items:center;justify-content:center;color:var(--n-400)">${ic('search', 'i20')}</span>
    <div class="h3 mt14" style="font-size:15px">Aucun résultat pour « dupond »</div>
    <div class="cap dim mt6">Vérifiez l’orthographe ou cherchez par foyer.</div>
    <div class="row g10 center mt14">${btn('Effacer la recherche', 'ghost', null, 'sm')}${btn('Chercher « Dupont »', 'sec', null, 'sm')}</div></div>`;

  const locked = `<div class="card" style="padding:0;overflow:hidden;position:relative">
    <div style="padding:22px;filter:blur(1.5px);opacity:.5">
      <div class="row g10 aic">${ic('mic', 'i18')}<span class="h3" style="font-size:16px">Livre d’or audio</span></div>
      <div class="cap dim mt8">32 messages · 47 minutes</div>
      <div class="row g8 mt14">${[1, 2, 3, 4].map(() => `<div class="sk" style="flex:1;height:34px;border-radius:9px"></div>`).join('')}</div></div>
    <div style="position:absolute;inset:0;background:rgba(252,251,248,.72);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px">
      <span style="width:38px;height:38px;border-radius:11px;background:#fff;border:1px solid var(--go-200);display:flex;align-items:center;justify-content:center;color:var(--go-700)">${ic('lock', 'i18')}</span>
      <span class="capm">Disponible avec l’offre complète</span>
      ${btn('Débloquer · +10 €', 'gold', 'sparkle', 'sm')}</div></div>`;

  const upgrade = `<div class="card pad" style="background:var(--ink);border:none;color:#F3EFE7">
    <div class="row between ais">
      <div><div class="over" style="color:var(--go-500)">Compléter votre offre</div>
        <div class="s-title mt10" style="font-size:22px;color:#F3EFE7">Ajoutez le livre d’or audio</div>
        <div class="cap mt8" style="color:#8C8478;max-width:280px">Vos invités laissent un message vocal ; vous les réécoutez pour toujours.</div></div>
      <div style="text-align:right"><div class="s-title" style="font-size:26px;color:var(--go-500)">+10 €</div>
        <div class="mic" style="color:#5C554C;font-weight:400;text-decoration:line-through">12,99 €</div></div></div>
    <div class="row g10 mt16">${btn('Passer à l’offre complète', 'gold', 'aright', 'sm')}${btn('Plus tard', 'onDark', null, 'sm')}</div></div>`;

  const confirm = `<div class="modal" style="width:100%;box-shadow:var(--e-2)">
    <div class="row g14 ais">
      <span style="width:40px;height:40px;flex:0 0 40px;border-radius:12px;background:var(--bad-bg);color:var(--bad);display:flex;align-items:center;justify-content:center">${ic('trash', 'i18')}</span>
      <div style="flex:1"><div class="h3" style="font-size:17px">Supprimer 3 invités ?</div>
        <div class="b dim mt8">Yassine Benali, Sofia Benali et Leïla Benali seront retirés de la liste. Leurs réponses RSVP et leurs souvenirs déposés seront conservés.</div>
        <div class="row g10 aic mt14"><span class="chk">${''}</span><span class="cap dim">Supprimer également leurs souvenirs</span></div></div></div>
    <div class="row g10 mt20" style="justify-content:flex-end">${btn('Annuler', 'sec', null, 'sm')}${btn('Supprimer définitivement', 'dgr', 'trash', 'sm')}</div></div>`;

  const toasts = `<div class="col g10">
    <div class="toast"><span style="color:#7BC49B">${ic('check', 'i16')}</span><span style="flex:1">Invitation publiée avec succès</span>
      <span style="color:var(--go-500);font-weight:500">Voir</span><span style="color:#6B6459">${ic('close', 'i14')}</span></div>
    <div class="toast"><span style="color:var(--go-500)">${ic('send', 'i16')}</span><span style="flex:1">Relance envoyée à 18 foyers</span>
      <span style="color:var(--go-500);font-weight:500">Annuler</span><span style="color:#6B6459">${ic('close', 'i14')}</span></div>
    <div class="toast" style="background:#5F1822"><span style="color:#F0B4B4">${ic('alert', 'i16')}</span><span style="flex:1">2 envois ont échoué</span>
      <span style="color:#F0B4B4;font-weight:500">Détails</span><span style="color:rgba(243,239,231,.4)">${ic('close', 'i14')}</span></div></div>`;

  const ctx = `<div class="ctxmenu">
    ${[
      ['Voir la fiche', 'user'],
      ['Modifier', 'pen'],
      ['Renvoyer l’invitation', 'send'],
      ['Copier le lien', 'link'],
    ]
      .map((m) => `<div>${ic(m[1], 'i16')}<span>${m[0]}</span></div>`)
      .join('')}
    <div class="sepx"></div>
    ${[
      ['Marquer comme absent', 'close'],
      ['Retirer du foyer', 'home'],
    ]
      .map((m) => `<div>${ic(m[1], 'i16')}<span>${m[0]}</span></div>`)
      .join('')}
    <div class="sepx"></div>
    <div class="dgr">${ic('trash', 'i16')}<span>Supprimer l’invité</span></div></div>`;

  const drawer = `<div class="card" style="padding:0;overflow:hidden;height:300px;position:relative;background:var(--n-50)">
    <div style="padding:18px;opacity:.4">
      <div class="sk" style="width:150px;height:12px"></div>
      <div class="row g10 mt14">${[1, 2, 3].map(() => `<div class="sk" style="flex:1;height:46px;border-radius:10px"></div>`).join('')}</div>
      <div class="sk mt14" style="width:100%;height:9px"></div><div class="sk mt6" style="width:80%;height:9px"></div></div>
    <div style="position:absolute;inset:0;background:rgba(28,22,20,.42)"></div>
    <div style="position:absolute;top:0;right:0;bottom:0;width:230px;background:#fff;box-shadow:var(--e-3);padding:16px">
      <div class="row between aic"><span class="capm">Fiche invité</span><span style="color:var(--n-400)">${ic('close', 'i16')}</span></div>
      <div class="row g10 aic mt14"><span class="av lg">AC</span><div><div class="capm">Amina C.</div><div class="mic muted mt2" style="font-weight:400">Présente</div></div></div>
      <div class="col g8 mt14">${[1, 2, 3].map(() => `<div class="sk" style="height:30px;border-radius:8px"></div>`).join('')}</div>
      <div class="row g8" style="position:absolute;bottom:16px;left:16px;right:16px">${btn('Annuler', 'ghost', null, 'sm')}${btn('Enregistrer', 'pri', null, 'sm')}</div></div></div>`;

  const modal = `<div class="card" style="padding:0;overflow:hidden;height:300px;position:relative;background:var(--n-50)">
    <div style="padding:18px;opacity:.4">
      <div class="sk" style="width:180px;height:12px"></div>
      <div class="row g10 mt14">${[1, 2].map(() => `<div class="sk" style="flex:1;height:60px;border-radius:10px"></div>`).join('')}</div></div>
    <div style="position:absolute;inset:0;background:rgba(28,22,20,.42);display:flex;align-items:center;justify-content:center">
      <div style="width:300px;background:#fff;border-radius:16px;box-shadow:var(--e-3);padding:22px">
        <div class="row between aic"><span class="h3" style="font-size:16px">Publier l’invitation ?</span><span style="color:var(--n-400)">${ic('close', 'i16')}</span></div>
        <div class="cap dim mt10">Elle deviendra accessible par lien et par QR code. Vous pourrez continuer à la modifier.</div>
        <div class="row g10 mt16" style="justify-content:flex-end">${btn('Annuler', 'sec', null, 'sm')}${btn('Publier', 'gold', 'sparkle', 'sm')}</div></div></div></div>`;

  const inclus = `<div class="row g10 wrap">
    ${badge('Inclus dans votre offre', 'gld')}${badge('Possédé', 'ok')}${badge('Disponible', 'neu')}${badge('Débloqué', 'brd')}
    ${badge('Nouveau', 'info')}${badge('Bientôt', 'neu')}${badge('Expire dans 30 j', 'warn')}</div>`;

  const errors = `<div class="col g14">
    <div class="fld"><span class="lb">Adresse e-mail</span><div class="inp err">yasmine@</div>
      <span class="hint err">Il manque le nom de domaine — par exemple yasmine@exemple.com</span></div>
    <div class="fld"><span class="lb">Date de l’événement</span><div class="inp err">12 mars 2024</div>
      <span class="hint err">Cette date est déjà passée. Choisissez une date à venir.</span></div>
    <div class="alert bad">${ic('alert')}<div><div class="tx">L’import n’a pas pu aboutir</div>
      <div class="ds">3 lignes n’ont ni nom ni contact. Corrigez le fichier, ou importez les 124 lignes valides.</div></div></div></div>`;

  const loading = `<div class="row g14 aic">
    <span style="width:20px;height:20px;border-radius:999px;border:2.5px solid var(--n-200);border-top-color:var(--bx-700)"></span>
    <div class="prog" style="flex:1"><i style="width:62%"></i></div>
    <span class="capm">62 %</span></div>
    <div class="cap muted mt10">Envoi en cours · 78 sur 126 invités</div>`;

  return {
    n: '44',
    slug: 'etats-ui',
    title: 'Planche des états UI',
    w: 1440,
    h: 1720,
    cls: 'screen solo',
    group: 'Design system',
    html: `
  <div style="background:var(--ivory);min-height:1720px;padding:64px 80px">
    <div class="over gold">Design system</div>
    <h1 class="s-title mt8" style="font-size:36px">États de l’interface</h1>
    <p class="b dim mt10" style="max-width:640px">Chargement, vide, erreur, verrouillé, confirmation. Les mêmes règles s’appliquent partout : un message clair, une cause, une action.</p>

    <div class="grid g3 mt40" style="gap:32px 28px;align-items:start">
      ${box('Chargement · skeleton', 'Aucun spinner plein écran : la structure apparaît d’abord.', skel)}
      ${box('Enregistrement automatique', 'Trois états, jamais bloquants.', autosave)}
      ${box('Progression longue', 'Toujours chiffrée et interruptible.', loading)}
      ${box('État vide', 'Explique quoi faire, pas seulement ce qui manque.', empty)}
      ${box('Recherche sans résultat', 'Propose une correction plutôt qu’un cul-de-sac.', noResult)}
      ${box('Erreurs de saisie', 'Le message dit comment corriger.', errors)}
      ${box('Fonctionnalité verrouillée', 'On montre la valeur, on ne cache pas la porte.', locked)}
      ${box('Invitation à compléter l’offre', 'Le prix affiché est la différence, pas un nouvel achat.', upgrade)}
      ${box('Badges de droits', 'Un vocabulaire unique dans tout le produit.', inclus)}
      ${box('Confirmation de suppression', 'Nomme précisément ce qui va disparaître.', confirm)}
      ${box('Notifications toast', 'Succès, action, erreur — avec un recours.', toasts)}
      ${box('Menu contextuel', 'Actions destructives séparées, en bas.', ctx)}
      ${box('Panneau latéral (drawer)', 'Pour éditer sans quitter la liste.', drawer)}
      ${box('Fenêtre modale', 'Réservée aux décisions à conséquence.', modal)}
      ${box(
        'Succès',
        'Confirme, puis propose la suite logique.',
        `<div class="alert ok">${ic('check')}<div><div class="tx">Invitation publiée</div>
          <div class="ds">Accessible par lien et QR code. 126 invités peuvent la consulter.</div>
          <div class="row g8 mt12">${btn('Copier le lien', 'sec', 'copy', 'sm')}${btn('Envoyer maintenant', 'pri', 'send', 'sm')}</div></div></div>`,
      )}
    </div>

    <div class="mt40" style="padding-top:32px;border-top:1px solid var(--n-200)">
      <div class="over gold">Règles d’écriture</div>
      <div class="grid g4c mt16" style="gap:20px">
        ${[
          [
            'Jamais de jargon',
            'Pas d’UUID, de JSON, d’« entitlement » ni de nom de table. On parle d’invités, d’offres, de droits.',
          ],
          [
            'Une cause, une action',
            'Chaque erreur explique ce qui s’est passé et propose le geste suivant.',
          ],
          [
            'Chiffres concrets',
            '« 30 personnes n’ont pas répondu » plutôt que « des réponses sont manquantes ».',
          ],
          [
            'Ton posé',
            'On ne dramatise pas, on n’infantilise pas. Une phrase, un verbe, un chiffre.',
          ],
        ]
          .map(
            (r) => `
        <div class="card pad" style="box-shadow:none"><div class="capm">${r[0]}</div><div class="cap dim mt8">${r[1]}</div></div>`,
          )
          .join('')}
      </div></div>
  </div>`,
  };
}

module.exports = [p44()];
