// Écrans 01 → 08 — Site public
const L = require('./lib.js');
const { ic, btn, badge, mapmock, qr, invitation, invThumb } = L;

const navDark = (act) => `<nav class="mk-nav">
  <div class="wm">MYEVENT’S</div>
  <div class="lk">${['Fonctionnalités', 'Templates', 'Tarifs', 'Wedding planners', 'Exemples'].map((x) => `<span style="${x === act ? 'color:#F3EFE7' : ''}">${x}</span>`).join('')}</div>
  <div class="row g14 aic"><span style="font-size:14px;color:rgba(243,239,231,.75)">Connexion</span>${btn('Créer mon événement', 'gold', 'sparkle')}</div></nav>`;

const navLight = (
  act,
) => `<nav class="mk-nav light" style="border-bottom:1px solid var(--n-200);background:#fff">
  <div class="wm">MYEVENT’S</div>
  <div class="lk">${['Fonctionnalités', 'Templates', 'Tarifs', 'Wedding planners', 'Exemples'].map((x) => `<span style="${x === act ? 'color:var(--bx-700);font-weight:500' : ''}">${x}</span>`).join('')}</div>
  <div class="row g14 aic"><span style="font-size:14px;color:var(--n-600)">Connexion</span>${btn('Créer mon événement', 'pri', 'sparkle')}</div></nav>`;

const foot = `<footer class="mk-foot">
  <div class="row between ais">
    <div style="width:300px">
      <div class="wm" style="font-family:var(--serif);font-weight:500;font-size:21px;letter-spacing:3.2px;color:#F3EFE7">MYEVENT’S</div>
      <div class="mt12" style="font-size:13px;line-height:22px;color:#8C8478">La solution digitale pour tous vos événements, réunis en un seul endroit.</div>
      <div class="row g10 mt20">${['globe', 'mail', 'share'].map((i) => `<span style="width:34px;height:34px;border-radius:10px;border:1px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;color:#8C8478">${ic(i, 'i16')}</span>`).join('')}</div>
    </div>
    <div class="row g40 ais">
      <div><h4>Produit</h4><span class="li">Invitations digitales</span><span class="li">Studio</span><span class="li">Gestion des invités</span><span class="li">RSVP</span><span class="li">QR Codes</span></div>
      <div><h4>Souvenirs</h4><span class="li">Photos &amp; vidéos</span><span class="li">Livre d’or audio</span><span class="li">Galerie privée</span><span class="li">Carte de remerciement</span></div>
      <div><h4>Événements</h4><span class="li">Mariage</span><span class="li">Fiançailles &amp; henné</span><span class="li">Anniversaire</span><span class="li">Baby shower</span><span class="li">Professionnel</span></div>
      <div><h4>Entreprise</h4><span class="li">Wedding planners</span><span class="li">Tarifs</span><span class="li">FAQ</span><span class="li">Nous contacter</span></div>
    </div>
  </div>
  <div class="row between aic mt40" style="padding-top:26px;border-top:1px solid rgba(255,255,255,.08)">
    <span style="font-size:12px;color:#5C554C">© 2026 MyEvent’s — Tous droits réservés</span>
    <div class="row g24" style="font-size:12px;color:#5C554C"><span>Confidentialité</span><span>Conditions</span><span>Cookies</span><span>Mentions légales</span></div>
  </div></footer>`;

/* ============ 01 · HOMEPAGE ============ */
function p01() {
  const step = (n, t, d, i) => `<div class="col g12" style="flex:1">
    <div class="row g12 aic"><span style="width:30px;height:30px;border-radius:999px;background:var(--bx-700);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600">${n}</span>${ic(i, 'i18')}</div>
    <div class="h3" style="font-size:17px">${t}</div><div class="b dim" style="max-width:250px">${d}</div></div>`;

  const feat = (i, t, d) =>
    `<div class="fcard"><div class="ib">${ic(i, 'i20')}</div><h3>${t}</h3><p>${d}</p></div>`;

  const testi = (q, n, r) => `<div class="card pad" style="border-radius:16px">
    <div class="row g4">${'<svg class="ic i14" viewBox="0 0 24 24" style="stroke:var(--go-500);fill:var(--go-500)">' + L.P.star + '</svg>'.repeat(5)}</div>
    <div class="s-body mt16" style="font-size:17px;line-height:27px;color:var(--n-800)">« ${q} »</div>
    <div class="row g10 aic mt20"><span class="av lg">${n[0]}</span><div><div class="bm">${n}</div><div class="cap muted">${r}</div></div></div></div>`;

  const tpl = (
    name,
    tag,
    tint,
    accent,
  ) => `<div class="tplcard"><div class="thumb" style="background:${tint}">
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 26px">
        <div class="mic" style="letter-spacing:2.4px;color:${accent};opacity:.8">LES FAMILLES</div>
        <div class="script mt10" style="font-size:38px;line-height:46px;color:${accent}">Yasmine &amp; Adam</div>
        <div style="width:40px;height:1px;background:${accent};opacity:.5;margin:14px 0"></div>
        <div class="mic" style="letter-spacing:2px;color:${accent};opacity:.75">06 · 06 · 2026</div>
      </div></div>
    <div class="meta"><div><div class="bm">${name}</div><div class="cap muted mt4">${tag}</div></div>${ic('aright', 'i16')}</div></div>`;

  const price = (
    t,
    p,
    list,
    feat,
  ) => `<div class="price${feat ? ' feat' : ''}">${feat ? '<span class="tag">Le plus choisi</span>' : ''}
    <div class="h3">${t}</div><div class="amt mt10">${p}<span style="font-size:15px;color:var(--n-500);font-family:var(--sans)"> / événement</span></div>
    <ul style="list-style:none;padding:0;margin:20px 0 0">${list.map((x) => `<li>${ic('check', 'i16')}<span>${x}</span></li>`).join('')}</ul>
    <div class="mt24">${btn('Choisir cette offre', feat ? 'gold' : 'sec', null, 'blk')}</div></div>`;

  return {
    n: '01',
    slug: 'homepage',
    title: 'Homepage',
    w: 1440,
    h: 5240,
    cls: 'mk',
    html: `
  <section class="mk-hero">${navDark()}
    <div class="glowA"></div><div class="glowB"></div>
    <div style="position:relative;padding:56px 64px 0;display:flex;gap:40px;align-items:flex-start">
      <div style="width:560px;flex:0 0 560px;padding-top:40px">
        <div class="mover" style="color:var(--go-500)">Invitations · Invités · Souvenirs</div>
        <h1 class="d-l mt20" style="color:#F7F3EC">Votre événement.<br>Une expérience à partager.</h1>
        <div class="rule mt24"></div>
        <p class="bl mt24" style="color:#A9A499;max-width:470px">Créez votre invitation, gérez vos invités et rassemblez tous vos souvenirs au même endroit.</p>
        <div class="row g12 mt32">${btn('Créer mon événement', 'gold', 'sparkle', 'lg')}${btn('Découvrir les templates', 'onDark', 'layers', 'lg')}</div>
        <div class="row g24 mt40">
          ${[
            ['12', 'types d’événements'],
            ['60+', 'templates'],
            ['4,9/5', 'satisfaction'],
          ]
            .map(
              (x) =>
                `<div><div class="s-title" style="font-size:26px;color:var(--go-500)">${x[0]}</div><div class="mic mt4" style="color:#6B6459;letter-spacing:1.4px;text-transform:uppercase">${x[1]}</div></div>`,
            )
            .join('')}
        </div>
      </div>
      <div style="flex:1;position:relative;height:640px">
        <div class="device-lap" style="position:absolute;left:20px;top:26px;width:760px">
          <div class="scr" style="height:470px;display:flex">
            <div style="width:150px;background:var(--ink);padding:14px 10px">
              <div style="font-family:var(--serif);font-size:12px;letter-spacing:2px;color:#F3EFE7">MYEVENT’S</div>
              <div class="col g6 mt16">${['dashboard', 'mail', 'wand', 'users', 'checkc', 'qr', 'chart'].map((i, k) => `<div class="row g8 aic" style="padding:6px 7px;border-radius:8px;${k === 0 ? 'background:rgba(212,176,123,.13)' : ''}"><span style="color:${k === 0 ? 'var(--go-500)' : '#8C8478'}">${ic(i, 'i14')}</span><span class="sk" style="height:6px;width:${52 - k * 3}px;background:${k === 0 ? 'rgba(243,239,231,.55)' : 'rgba(140,132,120,.4)'}"></span></div>`).join('')}</div>
            </div>
            <div style="flex:1;background:var(--n-25);padding:16px">
              <div class="row between aic"><div><div class="sk" style="width:150px;height:11px"></div><div class="sk mt6" style="width:96px;height:7px"></div></div><div class="row g8">${btn('', 'pri', 'plus', 'sm')}${btn('', 'sec', 'send', 'sm')}</div></div>
              <div class="grid g4c mt16" style="gap:10px">${[
                ['Invités', '126'],
                ['Présents', '84'],
                ['En attente', '30'],
                ['Attendus', '137'],
              ]
                .map(
                  (k) =>
                    `<div class="card pad" style="padding:11px 12px"><div class="mic muted" style="font-size:8px;letter-spacing:1.2px">${k[0].toUpperCase()}</div><div class="s-title mt4" style="font-size:22px">${k[1]}</div></div>`,
                )
                .join('')}</div>
              <div class="card mt12" style="padding:14px">
                <div class="row between aic"><div class="capm">Réponses reçues</div><span class="badge ok"><i></i>+18 cette semaine</span></div>
                <div class="row g6 aic mt16" style="height:96px">${[38, 52, 44, 66, 58, 74, 62, 88, 79, 94, 72, 86].map((v) => `<div style="flex:1;background:linear-gradient(180deg,var(--bx-500),var(--bx-700));border-radius:4px;height:${v}%"></div>`).join('')}</div>
              </div>
              <div class="row g10 mt12">${[
                ['QR Codes', 'qr'],
                ['Livre audio', 'mic'],
                ['Photos', 'image'],
              ]
                .map(
                  (x) =>
                    `<div class="card fx" style="padding:11px 12px"><div class="row g8 aic">${ic(x[1], 'i14')}<span class="cap">${x[0]}</span></div></div>`,
                )
                .join('')}</div>
            </div></div></div>
        <div class="device-phone" style="position:absolute;right:0;top:0;width:286px">
          <div class="notch" style="width:96px;height:22px"></div>
          <div class="scr" style="height:588px">${invThumb(264, 588, 264 / 390)}</div></div>
      </div>
    </div>
  </section>

  <section style="background:#fff;padding:36px 64px;border-bottom:1px solid var(--n-200)">
    <div class="row between aic">
      <span class="mic muted" style="letter-spacing:1.8px;text-transform:uppercase">Ils organisent avec MyEvent’s</span>
      <div class="row g40" style="font-family:var(--serif);font-size:19px;color:var(--n-400);letter-spacing:1.5px">
        <span>MAISON LUMEN</span><span>ATELIER NOCE</span><span>DOMAINE CAMÉLIA</span><span>LE JARDIN D’OR</span><span>PLANNER &amp; CO</span></div></div>
  </section>

  <section class="mk-sec" style="background:var(--ivory)">
    <div class="eyebrow">Comment ça fonctionne</div>
    <h2>Quatre étapes, aucune friction.</h2>
    <div class="row g32 mt40">
      ${step(1, 'Choisissez un modèle', 'Plus de 60 templates classés par univers : oriental, moderne, floral, minimaliste.', 'layers')}
      ${step(2, 'Personnalisez dans le Studio', 'Textes, couleurs, typographies, sections, animations. Aperçu en temps réel.', 'wand')}
      ${step(3, 'Invitez et suivez', 'Import de vos invités, envoi par lien, SMS ou e-mail, suivi des ouvertures et des réponses.', 'send')}
      ${step(4, 'Collectez les souvenirs', 'QR codes photo, vidéo et livre d’or audio. Une galerie privée pour tout rassembler.', 'camera')}
    </div>
  </section>

  <section class="mk-sec" style="background:#fff">
    <div class="row g40 aic">
      <div style="width:520px;flex:0 0 520px">
        <div class="eyebrow">Studio d’invitation</div>
        <h2>Une invitation qui vous ressemble,<br>au pixel près.</h2>
        <p class="lead">Réorganisez les sections, ajustez chaque détail typographique, prévisualisez en mobile, tablette et desktop. Tout est enregistré automatiquement.</p>
        <div class="col g12 mt32">
          ${['Sections réorganisables par glisser-déposer', 'Palettes et typographies préréglées', 'Animations d’apparition contrôlées', 'Historique de versions et restauration'].map((x) => `<div class="row g10 aic">${ic('check', 'i16').replace('class="ic i16"', 'class="ic i16" style="stroke:var(--go-600)"')}<span class="b" style="color:var(--n-700)">${x}</span></div>`).join('')}
        </div>
        <div class="mt32">${btn('Ouvrir le Studio', 'pri', 'aright')}</div>
      </div>
      <div style="flex:1">
        <div class="card" style="overflow:hidden;box-shadow:var(--e-2);border-radius:16px">
          <div class="stu-hd" style="height:52px;padding:0 14px">
            <div class="row g10 aic"><span class="capm">Notre mariage</span><span class="badge ok" style="font-size:10px"><i></i>Enregistré</span></div>
            <div class="row g8 aic"><span class="seg" style="transform:scale(.85)"><span class="on">${ic('phone', 'i14')}</span><span>${ic('tablet', 'i14')}</span><span>${ic('monitor', 'i14')}</span></span>${btn('Publier', 'gold', null, 'sm')}</div>
          </div>
          <div class="row" style="height:400px">
            <div style="width:170px;border-right:1px solid var(--n-200);padding:12px;background:#fff">
              <div class="mic muted mt4" style="letter-spacing:1.4px">SECTIONS</div>
              <div class="col g6 mt10">${['Introduction', 'Familles &amp; noms', 'Citation', 'Programme', 'Compte à rebours', 'RSVP', 'Footer'].map((s, i) => `<div class="stu-sec ${i === 1 ? 'on' : ''}" style="padding:6px;gap:7px"><div class="th" style="width:26px;height:22px;flex:0 0 26px"></div><span style="font-size:9.5px;font-weight:500;color:var(--n-700)">${s}</span></div>`).join('')}</div>
            </div>
            <div class="stu-c" style="padding:16px 0">
              <div class="device-phone" style="width:210px;padding:7px;border-radius:28px">
                <div class="scr" style="height:368px;border-radius:22px">${invThumb(196, 368, 196 / 390)}</div></div>
            </div>
            <div style="width:190px;border-left:1px solid var(--n-200);padding:12px;background:#fff">
              <div class="mic muted" style="letter-spacing:1.4px">PROPRIÉTÉS</div>
              <div class="row g10 mt10" style="font-size:9.5px;color:var(--n-500)"><span style="color:var(--bx-700);font-weight:600;border-bottom:1.5px solid var(--bx-700);padding-bottom:5px">Contenu</span><span>Style</span><span>Animation</span></div>
              <div class="col g10 mt14">${['Sous-titre', 'Titre principal', 'Noms des mariés', 'Date'].map((f) => `<div><div style="font-size:8.5px;color:var(--n-500);margin-bottom:4px">${f}</div><div class="inp" style="height:28px;font-size:9px;padding:0 8px"><span class="sk" style="width:${50 + f.length * 2}px;height:6px"></span></div></div>`).join('')}</div>
            </div></div></div>
      </div></div>
  </section>

  <section class="mk-sec" style="background:var(--ivory)">
    <div class="row between ais">
      <div><div class="eyebrow">Gestion des invités &amp; RSVP</div>
      <h2>Chaque foyer, chaque accompagnant,<br>chaque réponse.</h2></div>
      <p class="lead" style="max-width:400px;margin-top:52px">Un CRM pensé pour les événements : foyers, groupes, sous-événements, régimes alimentaires et accessibilité. Les relances se déclenchent d’un clic.</p>
    </div>
    <div class="grid g4c mt40" style="gap:16px">
      ${[
        ['126', 'Invités', 'users'],
        ['84', 'Présents', 'checkc'],
        ['30', 'En attente', 'clock'],
        ['137', 'Personnes attendues', 'home'],
      ]
        .map(
          (k) =>
            `<div class="card pad" style="padding:22px"><div class="row between aic"><span class="mic muted" style="letter-spacing:1.6px">${k[1].toUpperCase()}</span>${ic(k[2], 'i16').replace('class="ic i16"', 'class="ic i16" style="stroke:var(--go-600)"')}</div><div class="s-title mt10" style="font-size:38px;color:var(--bx-700)">${k[0]}</div></div>`,
        )
        .join('')}
    </div>
    <div class="card mt24" style="overflow:hidden">
      <table class="tbl" style="box-shadow:none;border:none">
        <thead><tr><th>Invité</th><th>Foyer</th><th>Sous-événements</th><th>RSVP</th><th>Accompagnants</th></tr></thead>
        <tbody>
        ${[
          [
            'Yassine Benali',
            'Famille Benali',
            'Mairie · Dîner',
            'En attente',
            'warn',
            '—',
          ],
          ['Claire Dupont', 'Famille Dupont', 'Dîner', 'Absente', 'bad', '—'],
          [
            'Karim Haddad',
            'Amis université',
            'Cérémonie · Cocktail · Dîner',
            'Présent',
            'ok',
            '2',
          ],
          ['Amina Cherkaoui', 'Foyer Cherkaoui', 'Tous', 'Présente', 'ok', '1'],
        ]
          .map(
            (r, i) => `<tr>
          <td class="nm"><div class="row g10 aic"><span class="av${i % 2 ? ' g' : ''}">${r[0]
            .split(' ')
            .map((w) => w[0])
            .join('')}</span>${r[0]}</div></td>
          <td>${r[1]}</td><td>${r[2]}</td><td>${badge(r[3], r[4])}</td><td>${r[5]}</td></tr>`,
          )
          .join('')}
        </tbody></table></div>
  </section>

  <section class="mk-sec" style="background:#fff">
    <div class="eyebrow">Souvenirs</div>
    <h2>Le jour J se raconte tout seul.</h2>
    <p class="lead">Trois QR codes suffisent : vos invités déposent leurs photos, laissent un message vocal et retrouvent la galerie privée.</p>
    <div class="grid g3 mt40" style="gap:20px">
      ${[
        [
          'QR Code photos &amp; vidéos',
          'Vos invités scannent, envoient, c’est archivé. Modération incluse.',
          'image',
          6,
        ],
        [
          'QR Code livre d’or audio',
          'Des messages vocaux à réécouter pour toujours, avec waveform et durée.',
          'mic',
          12,
        ],
        [
          'Galerie privée',
          'Un espace élégant, réservé à vos invités, en lecture seule.',
          'grid',
          19,
        ],
      ]
        .map(
          (x) => `
      <div class="card" style="overflow:hidden;border-radius:16px">
        <div style="background:var(--go-50);padding:28px;display:flex;justify-content:center;border-bottom:1px solid var(--n-200)">
          <div style="background:#fff;padding:12px;border-radius:14px;box-shadow:var(--e-1)">${qr(120, '#1C1614', 21, x[3])}</div></div>
        <div style="padding:24px"><div class="row g10 aic">${ic(x[2], 'i18').replace('class="ic i18"', 'class="ic i18" style="stroke:var(--go-600)"')}<span class="h3" style="font-size:16px">${x[0]}</span></div>
        <p class="b dim mt10">${x[1]}</p></div></div>`,
        )
        .join('')}
    </div>
  </section>

  <section class="mk-sec" style="background:var(--ivory)">
    <div class="row between ais"><div><div class="eyebrow">Templates</div><h2>Un modèle pour chaque univers.</h2></div>
    <div class="row g10" style="margin-top:52px">${btn('Voir les 60+ templates', 'sec', 'aright')}</div></div>
    <div class="grid g4c mt40" style="gap:20px">
      ${tpl('Andalouse', 'Oriental · Doré', '#F6F1E7', '#7A1F2B')}
      ${tpl('Minéral', 'Minimaliste · Ivoire', '#EFEDE7', '#46413A')}
      ${tpl('Camélia', 'Floral · Rosé', '#F7EEEA', '#8E2836')}
      ${tpl('Nuit d’or', 'Classique · Nuit', '#231A18', '#D4B07B')}
    </div>
  </section>

  <section class="mk-sec" style="background:#fff">
    <div class="eyebrow">Témoignages</div><h2>Ce qu’en disent nos couples.</h2>
    <div class="grid g3 mt40" style="gap:20px">
      ${testi('On a envoyé l’invitation un dimanche soir. Le lundi midi, 70 % des foyers avaient répondu. On n’a relancé personne à la main.', 'Yasmine &amp; Adam', 'Mariage · Aix-en-Provence')}
      ${testi('Le livre d’or audio, c’est le cadeau qu’on ne savait pas qu’on voulait. On réécoute encore les messages un an après.', 'Léa &amp; Antoine', 'Mariage · Annecy')}
      ${testi('Je gère six mariages par saison. Un seul endroit pour les invitations, les RSVP et les souvenirs, ça change ma vie.', 'Nadia B.', 'Wedding planner · Lyon')}
    </div>
  </section>

  <section class="mk-sec" style="background:var(--ivory)">
    <div class="tc"><div class="eyebrow">Tarifs</div><h2>Un achat, un événement.<br>Pas d’abonnement.</h2>
    <p class="lead" style="margin:14px auto 0;text-align:center">Vous payez une fois pour votre événement. Les accès restent ouverts 12 mois après la date.</p></div>
    <div class="grid g3 mt40" style="gap:20px;align-items:start">
      ${price('Invitation digitale', '14,99 €', ['Invitation personnalisable', 'Studio complet', 'Gestion des invités &amp; RSVP', 'Envois illimités par lien', 'QR code d’invitation'], false)}
      ${price('Invitation + Photo/Vidéo', '29,99 €', ['Tout le pack Invitation', 'QR code photos &amp; vidéos', '10 Go de stockage', 'Modération des contenus', 'Galerie privée invités'], true)}
      ${price('Invitation + Photo/Vidéo + Audio', '39,99 €', ['Tout le pack précédent', 'QR code livre d’or audio', 'Messages vocaux illimités', 'Export audio et album', 'Carte de remerciement'], false)}
    </div>
  </section>

  <section class="mk-sec" style="background:#fff">
    <div class="row g40 ais">
      <div style="width:380px;flex:0 0 380px"><div class="eyebrow">FAQ</div><h2>Les questions<br>que l’on nous pose.</h2>
      <div class="mt24">${btn('Toutes les questions', 'sec', 'aright')}</div></div>
      <div class="fx">
        ${[
          [
            'Faut-il un abonnement ?',
            'Non. MyEvent’s se paie une fois, par événement. Vos accès restent ouverts 12 mois après la date de l’événement.',
          ],
          [
            'Mes invités doivent-ils créer un compte ?',
            'Jamais. Ils ouvrent un lien ou scannent un QR code, répondent et déposent leurs souvenirs. Rien à installer.',
          ],
          [
            'Puis-je gérer plusieurs cérémonies ?',
            'Oui. Mairie, cérémonie, cocktail, dîner, henné : chaque sous-événement a ses horaires, son lieu et sa liste d’invités.',
          ],
          [
            'Qui voit les photos déposées ?',
            'Vous seuls, jusqu’à validation. La modération est activée par défaut avant publication dans la galerie.',
          ],
        ]
          .map(
            (f, i) => `
        <div class="faq"><div style="flex:1"><div class="q">${f[0]}</div>${i === 0 ? `<div class="a">${f[1]}</div>` : ''}</div>
        <span style="color:var(--n-400)">${ic(i === 0 ? 'cup' : 'cdown', 'i18')}</span></div>`,
          )
          .join('')}
      </div></div>
  </section>

  <section style="background:var(--bx-700);padding:88px 64px;position:relative;overflow:hidden">
    <div style="position:absolute;width:700px;height:700px;right:-140px;top:-260px;border-radius:999px;background:radial-gradient(closest-side,rgba(212,176,123,.28),rgba(212,176,123,0))"></div>
    <div class="tc" style="position:relative">
      <div class="mover" style="color:var(--go-300)">Prêt à commencer</div>
      <h2 class="d-m mt16" style="color:#F9F7F2;font-size:46px;line-height:56px">Votre événement mérite mieux<br>qu’un groupe de messages.</h2>
      <div class="row g12 center mt32">${btn('Créer mon événement', 'gold', 'sparkle', 'lg')}${btn('Parler à un conseiller', 'onDark', null, 'lg')}</div>
      <div class="cap mt20" style="color:rgba(249,247,242,.6)">Sans engagement · Aperçu gratuit avant paiement</div>
    </div></section>
  ${foot}`,
  };
}

/* ============ 02 · FONCTIONNALITÉS ============ */
function p02() {
  const mockStudio = `<div style="display:flex;height:100%">
    <div style="width:150px;border-right:1px solid var(--n-200);padding:12px;background:#fff">
      <div class="mic muted" style="font-size:8px;letter-spacing:1.2px">SECTIONS</div>
      <div class="col g5 mt8">${[
        'Introduction',
        'Familles &amp; noms',
        'Citation',
        'Programme',
        'Compte à rebours',
        'RSVP',
      ]
        .map(
          (s, i) => `
        <div class="row g7 aic" style="gap:7px;padding:5px 6px;border-radius:7px;border:1px solid ${i === 1 ? 'var(--go-500)' : 'var(--n-200)'};background:${i === 1 ? 'var(--go-50)' : '#fff'}">
          <div style="width:18px;height:15px;border-radius:3px;background:var(--cream);flex:0 0 18px"></div>
          <span style="font-size:8px;font-weight:500;color:var(--n-700)">${s}</span></div>`,
        )
        .join('')}</div></div>
    <div style="flex:1;background:var(--n-50);display:flex;align-items:center;justify-content:center">
      <div class="device-phone" style="width:132px;padding:5px;border-radius:20px;box-shadow:var(--e-2)">
        <div class="scr" style="height:216px;border-radius:16px">${invThumb(122, 216, 122 / 390)}</div></div></div>
    <div style="width:140px;border-left:1px solid var(--n-200);padding:12px;background:#fff">
      <div class="mic muted" style="font-size:8px;letter-spacing:1.2px">PROPRIÉTÉS</div>
      <div class="row g8 mt8" style="font-size:8px;color:var(--n-500)"><span style="color:var(--bx-700);font-weight:600;border-bottom:1.5px solid var(--bx-700);padding-bottom:4px">Contenu</span><span>Style</span><span>Anim.</span></div>
      <div class="col g8 mt10">${[
        'Sur-titre',
        'Noms des familles',
        'Texte d’invitation',
        'Date',
      ]
        .map(
          (f) => `
        <div><div style="font-size:7.5px;color:var(--n-500);margin-bottom:3px">${f}</div>
        <div class="inp" style="height:22px;padding:0 6px"><span class="sk" style="width:${40 + f.length * 1.5}px;height:5px"></span></div></div>`,
        )
        .join('')}</div></div></div>`;

  const mockGuests = `<div style="padding:14px;background:var(--n-25);height:100%">
    <div class="row g8">${[
      ['Invités', '126'],
      ['Présents', '84'],
      ['Absents', '12'],
      ['Attente', '30'],
    ]
      .map(
        (k) => `
      <div class="card" style="flex:1;padding:9px 10px;box-shadow:none"><div class="mic muted" style="font-size:7.5px;letter-spacing:1px">${k[0].toUpperCase()}</div>
      <div class="s-title mt2" style="font-size:19px">${k[1]}</div></div>`,
      )
      .join('')}</div>
    <div class="card mt10" style="padding:0;overflow:hidden;box-shadow:none">
      <div style="display:flex;padding:7px 12px;background:var(--n-50);gap:12px">${[
        'NOM',
        'FOYER',
        'RSVP',
        'ACCOMP.',
      ]
        .map(
          (h, i) => `
        <span class="mic muted" style="font-size:7px;letter-spacing:1px;${i === 0 ? 'width:120px' : 'flex:1'}">${h}</span>`,
        )
        .join('')}</div>
      ${[
        ['Yassine Benali', 'Famille Benali', 'En attente', 'warn', '—'],
        ['Claire Dupont', 'Famille Dupont', 'Absente', 'bad', '—'],
        ['Karim Haddad', 'Amis université', 'Présent', 'ok', '2'],
        ['Amina Cherkaoui', 'Foyer Cherkaoui', 'Présente', 'ok', '1'],
        ['Nour Belkacem', 'Amis lycée', 'Présente', 'ok', '1'],
      ]
        .map(
          (r, i) => `
      <div style="display:flex;align-items:center;padding:8px 12px;gap:12px;${i ? 'border-top:1px solid var(--n-100)' : ''}">
        <span style="width:120px;display:flex;align-items:center;gap:7px"><span class="av" style="width:17px;height:17px;font-size:7px">${r[0]
          .split(' ')
          .map((w) => w[0])
          .join('')}</span>
        <span style="font-size:9px;font-weight:500;color:var(--n-900)">${r[0]}</span></span>
        <span style="flex:1;font-size:9px;color:var(--n-600)">${r[1]}</span>
        <span style="flex:1">${badge(r[2], r[3]).replace('font-size:11px', 'font-size:8px').replace('padding:4px 9px', 'padding:2px 6px')}</span>
        <span style="flex:1;font-size:9px;color:var(--n-600)">${r[4]}</span></div>`,
        )
        .join('')}</div></div>`;

  const mockSend = `<div style="padding:14px;background:var(--n-25);height:100%;display:flex;gap:12px">
    <div style="flex:1">
      ${[
        ['Première invitation', 'Envoyée', 'ok', 126, 118],
        ['Relance sans réponse', 'Programmée', 'info', 30, 0],
        ['Rappel programme', 'Envoyée', 'ok', 84, 71],
      ]
        .map(
          (c) => `
      <div class="card" style="padding:11px 13px;box-shadow:none;margin-bottom:9px">
        <div class="row between aic"><span style="font-size:10px;font-weight:500">${c[0]}</span>
        ${badge(c[1], c[2]).replace('font-size:11px', 'font-size:8px').replace('padding:4px 9px', 'padding:2px 6px')}</div>
        <div class="row g10 mt8">${[
          ['Envoyé', c[3]],
          ['Ouvert', c[4] || '—'],
          ['Répondu', c[4] ? Math.round(c[4] * 0.8) : '—'],
        ]
          .map(
            (s) => `
          <div style="flex:1"><div class="mic muted" style="font-size:7px;font-weight:400">${s[0]}</div><div style="font-size:10px;font-weight:600;margin-top:1px">${s[1]}</div></div>`,
          )
          .join('')}</div>
        <div class="prog mt8" style="height:4px"><i style="width:${Math.round((c[4] / c[3] || 0) * 100)}%"></i></div></div>`,
        )
        .join('')}</div>
    <div class="card" style="width:150px;flex:0 0 150px;padding:11px;box-shadow:none">
      <div class="mic muted" style="font-size:7.5px;letter-spacing:1px">NOUVELLE CAMPAGNE</div>
      <div class="col g7 mt8">${[
        'Destinataires',
        'Modèle',
        'Canal',
        'Programmation',
      ]
        .map(
          (f) => `
        <div><div style="font-size:7.5px;color:var(--n-500);margin-bottom:3px">${f}</div>
        <div class="inp" style="height:22px;padding:0 6px"><span class="sk" style="width:${34 + f.length}px;height:5px"></span></div></div>`,
        )
        .join('')}</div>
      <div style="height:24px;border-radius:7px;background:var(--bx-700);color:#fff;font-size:8px;font-weight:500;display:flex;align-items:center;justify-content:center;margin-top:10px">Programmer l’envoi</div></div></div>`;

  const big = (
    i,
    t,
    d,
    pts,
    rev,
    mock,
  ) => `<div class="row g40 aic" style="${rev ? 'flex-direction:row-reverse' : ''}">
    <div style="width:460px;flex:0 0 460px">
      <div class="row g10 aic"><span style="width:38px;height:38px;border-radius:11px;background:var(--go-50);border:1px solid var(--go-200);display:flex;align-items:center;justify-content:center;color:var(--go-700)">${ic(i, 'i18')}</span>
      <span class="mover gold">${t}</span></div>
      <h2 style="font-size:34px;line-height:42px;margin-top:16px">${d}</h2>
      <div class="col g10 mt20">${pts.map((p) => `<div class="row g10 ais">${ic('check', 'i16').replace('class="ic i16"', 'class="ic i16" style="stroke:var(--go-600);margin-top:3px"')}<span class="b dim">${p}</span></div>`).join('')}</div>
    </div>
    <div class="fx card" style="height:290px;overflow:hidden;background:#fff;position:relative;box-shadow:var(--e-2)">${mock}</div></div>`;
  return {
    n: '02',
    slug: 'fonctionnalites',
    title: 'Fonctionnalités',
    w: 1440,
    h: 2680,
    cls: 'mk',
    html: `
  ${navLight('Fonctionnalités')}
  <section class="mk-sec" style="background:var(--ivory);padding-bottom:56px">
    <div class="tc" style="max-width:760px;margin:0 auto">
      <div class="eyebrow">Fonctionnalités</div>
      <h2 style="font-size:50px;line-height:58px">Tout ce qu’un événement demande,<br>enfin réuni.</h2>
      <p class="lead" style="margin:18px auto 0;text-align:center">De la première invitation au dernier souvenir, huit modules pensés comme un seul produit.</p>
    </div>
    <div class="grid g4c mt40" style="gap:16px">
      ${[
        [
          'Invitation',
          'mail',
          'Une page élégante, multilingue, partageable par lien ou QR.',
        ],
        [
          'Studio',
          'wand',
          'Éditeur WYSIWYG : sections, styles, animations, versions.',
        ],
        [
          'Invités',
          'users',
          'Foyers, groupes, accompagnants, régimes, accessibilité.',
        ],
        [
          'RSVP',
          'checkc',
          'Réponses par personne, par sous-événement, en temps réel.',
        ],
        [
          'QR Codes',
          'qr',
          'Six destinations, personnalisables, traçables au scan.',
        ],
        [
          'Livre audio',
          'mic',
          'Messages vocaux avec waveform, modération et export.',
        ],
        [
          'Photo &amp; vidéo',
          'image',
          'Collecte, modération, galerie privée, 10 Go inclus.',
        ],
        [
          'Statistiques',
          'chart',
          'Ouvertures, réponses, relances : chaque chiffre est actionnable.',
        ],
      ]
        .map(
          (x) => `
      <div class="fcard" style="padding:22px"><div class="ib" style="width:38px;height:38px">${ic(x[1], 'i18')}</div>
      <h3 style="font-size:16px;margin-top:14px">${x[0]}</h3><p style="font-size:13px;line-height:21px">${x[2]}</p></div>`,
        )
        .join('')}
    </div>
  </section>
  <section class="mk-sec" style="background:#fff"><div class="col g40" style="gap:72px">
    ${big('wand', 'Le Studio', 'Chaque détail se règle,<br>rien ne se casse.', ['Sections réorganisables, ajoutables, dupliquables', 'Palettes et typographies préréglées, cohérentes par construction', 'Aperçu mobile, tablette et desktop en un clic', 'Historique de versions avec restauration et comparaison'], false, mockStudio)}
    ${big('users', 'Les invités', 'Un CRM d’événement,<br>pas un tableur.', ['Foyers et groupes avec contact principal', 'Accompagnants autorisés par invité', 'Sous-événements attribués individuellement', 'Import CSV avec détection des doublons'], true, mockGuests)}
    ${big('send', 'Les envois', 'Envoyer, suivre,<br>relancer sans y penser.', ['Campagnes par lien, e-mail ou SMS', 'Programmation à la date de votre choix', 'Suivi : envoyé, délivré, ouvert, cliqué, répondu', 'Relance ciblée sur les foyers sans réponse'], false, mockSend)}
  </div></section>
  ${foot}`,
  };
}

/* ============ 03 · GALERIE DE TEMPLATES ============ */
function p03() {
  const cats = [
    'Tous',
    'Oriental',
    'Moderne',
    'Minimaliste',
    'Floral',
    'Classique',
    'Civil',
    'Henné',
    'Anniversaire',
  ];
  const T = [
    ['Andalouse', 'Oriental', '#F6F1E7', '#7A1F2B', 'script'],
    ['Minéral', 'Minimaliste', '#EFEDE7', '#46413A', 'serif'],
    ['Camélia', 'Floral', '#F7EEEA', '#8E2836', 'script'],
    ['Nuit d’or', 'Classique', '#231A18', '#D4B07B', 'serif'],
    ['Zellige', 'Oriental', '#F2EFE6', '#9C7742', 'script'],
    ['Lin', 'Minimaliste', '#F6F4EF', '#635D53', 'serif'],
    ['Bougainvillier', 'Floral', '#F9EDEE', '#7A1F2B', 'script'],
    ['Marbre', 'Moderne', '#FFFFFF', '#1C1917', 'serif'],
    ['Henné', 'Henné', '#F3E9DC', '#5F1822', 'script'],
    ['Civil', 'Civil', '#F6F4EF', '#3A5F86', 'serif'],
    ['Confetti', 'Anniversaire', '#FBF6EC', '#B0762A', 'script'],
    ['Sable', 'Moderne', '#F4EFE8', '#8E2836', 'serif'],
  ];
  const card = (t) => `<div class="tplcard">
    <div class="thumb" style="background:${t[2]};height:280px">
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 22px">
        <div class="mic" style="letter-spacing:2.2px;color:${t[3]};opacity:.75;font-size:9px">LES FAMILLES</div>
        ${
          t[4] === 'script'
            ? `<div class="script mt10" style="font-size:34px;line-height:42px;color:${t[3]}">Yasmine &amp; Adam</div>`
            : `<div class="s-title mt10" style="font-size:24px;line-height:32px;letter-spacing:2px;text-transform:uppercase;color:${t[3]}">Yasmine<br>&amp; Adam</div>`
        }
        <div style="width:34px;height:1px;background:${t[3]};opacity:.45;margin:12px 0"></div>
        <div class="mic" style="letter-spacing:2px;color:${t[3]};opacity:.7;font-size:9px">06 · 06 · 2026</div>
      </div>
      <div style="position:absolute;left:0;right:0;bottom:0;padding:12px;display:flex;gap:8px;background:linear-gradient(180deg,rgba(28,22,20,0),rgba(28,22,20,.55))">
        ${btn('Aperçu', 'sec', 'eye', 'sm')}${btn('Utiliser ce template', 'pri', null, 'sm')}</div>
    </div>
    <div class="meta"><div><div class="bm">${t[0]}</div><div class="cap muted mt4">${t[1]}</div></div>
    <div class="row g4">${[t[2], t[3], '#D4B07B'].map((c) => `<span style="width:12px;height:12px;border-radius:999px;background:${c};border:1px solid var(--n-200)"></span>`).join('')}</div></div></div>`;
  return {
    n: '03',
    slug: 'templates-galerie',
    title: 'Galerie de templates',
    w: 1440,
    h: 1860,
    cls: 'mk',
    html: `
  ${navLight('Templates')}
  <section style="background:var(--ivory);padding:56px 64px 32px">
    <div class="eyebrow">Templates</div>
    <h2 style="font-family:var(--serif);font-weight:400;font-size:46px;line-height:54px;margin:14px 0 0">Choisissez le point de départ.</h2>
    <p class="b dim mt14" style="max-width:560px;font-size:16px;line-height:26px">Chaque modèle est complet : sections, typographies et palette. Vous ne partez jamais d’une page blanche.</p>
    <div class="row between aic mt32">
      <div class="row g8 wrap">${cats.map((c, i) => `<span class="btn ${i === 0 ? 'pri' : 'sec'} sm" style="border-radius:999px">${c}</span>`).join('')}</div>
      <div class="row g10 aic"><span class="cap muted">62 modèles</span><span class="btn sec sm">${ic('sliders', 'i14')}Trier : Populaires${ic('cdown', 'i14')}</span></div>
    </div>
  </section>
  <section style="background:var(--ivory);padding:0 64px 72px">
    <div class="grid g4c" style="gap:20px">${T.map(card).join('')}</div>
    <div class="row center mt40">${btn('Charger plus de modèles', 'sec', 'refresh')}</div>
  </section>
  ${foot}`,
  };
}

/* ============ 04 · DÉTAIL TEMPLATE ============ */
function p04() {
  return {
    n: '04',
    slug: 'template-detail',
    title: 'Détail d’un template',
    w: 1440,
    h: 1560,
    cls: 'mk',
    html: `
  ${navLight('Templates')}
  <section style="background:var(--ivory);padding:32px 64px 72px">
    <div class="row g8 aic cap muted"><span>Templates</span>${ic('cright', 'i14')}<span>Oriental</span>${ic('cright', 'i14')}<span style="color:var(--n-900)">Andalouse</span></div>
    <div class="row g40 ais mt24">
      <div style="width:400px;flex:0 0 400px;display:flex;justify-content:center">
        <div class="device-phone" style="width:340px">
          <div class="notch"></div>
          <div class="scr" style="height:700px">${invThumb(318, 700, 318 / 390)}</div></div>
      </div>
      <div class="fx">
        <div class="row g10 aic">${badge('Oriental', 'brd')}${badge('Le plus utilisé', 'gld')}</div>
        <h2 style="font-family:var(--serif);font-weight:400;font-size:46px;line-height:54px;margin:16px 0 0">Andalouse</h2>
        <p class="bl dim mt14" style="max-width:560px">Calligraphie arabe, ivoire chaud et doré discret. Pensé pour les mariages orientaux, adaptable au henné et aux fiançailles.</p>

        <div class="mt32"><div class="over muted">Variantes de couleurs</div>
          <div class="row g12 mt12">${[
            ['Bordeaux &amp; ivoire', '#7A1F2B', '#F6F1E7', true],
            ['Nuit &amp; or', '#231A18', '#D4B07B', false],
            ['Terracotta', '#9C4A2F', '#F7EFE6', false],
            ['Vert olive', '#4A5A3A', '#F2F1E6', false],
            ['Encre', '#1C2A3A', '#EFF1F4', false],
          ]
            .map(
              (v) => `
          <div class="col g6 aic"><div style="width:56px;height:56px;border-radius:12px;background:linear-gradient(135deg,${v[2]} 50%,${v[1]} 50%);border:${v[3] ? '2px solid var(--go-500)' : '1px solid var(--n-200)'};box-shadow:${v[3] ? '0 0 0 3px rgba(212,176,123,.2)' : 'none'}"></div>
          <span class="mic muted" style="font-weight:400;max-width:64px;text-align:center;line-height:14px">${v[0]}</span></div>`,
            )
            .join('')}</div></div>

        <div class="mt32"><div class="over muted">Sections incluses</div>
          <div class="grid g2 mt12" style="gap:10px;max-width:620px">${[
            ['Ornement calligraphique', 'sparkle'],
            ['Familles &amp; noms', 'users'],
            ['Citation / verset', 'type'],
            ['Programme &amp; lieux', 'pin'],
            ['Compte à rebours', 'clock'],
            ['Formulaire RSVP', 'checkc'],
            ['Galerie', 'image'],
            ['Message de clôture', 'heart'],
          ]
            .map(
              (s) => `
          <div class="row g10 aic card" style="padding:11px 14px;box-shadow:none">${ic(s[1], 'i16').replace('class="ic i16"', 'class="ic i16" style="stroke:var(--go-600)"')}<span class="b" style="color:var(--n-700)">${s[0]}</span></div>`,
            )
            .join('')}</div></div>

        <div class="mt32"><div class="over muted">Aperçu</div>
          <div class="row g10 mt12"><span class="seg"><span class="on">${ic('phone', 'i14')}Mobile</span><span>${ic('tablet', 'i14')}Tablette</span><span>${ic('monitor', 'i14')}Desktop</span></span></div></div>

        <div class="row g12 mt32">${btn('Utiliser ce modèle', 'pri', 'sparkle', 'lg')}${btn('Aperçu plein écran', 'sec', 'maximize', 'lg')}${btn('', 'ghost', 'heart', 'lg')}</div>
        <div class="row g10 aic mt20 cap muted">${ic('info', 'i14')}<span>Vous pourrez tout modifier ensuite dans le Studio — sections, textes, couleurs et animations.</span></div>
      </div></div>

    <div class="mt40"><div class="row between aic"><h3 class="s-title" style="font-size:26px">Modèles similaires</h3>${btn('Voir tout', 'ghost', 'aright', 'sm')}</div>
      <div class="grid g4c mt20" style="gap:20px">
      ${[
        ['Zellige', 'Oriental', '#F2EFE6', '#9C7742'],
        ['Henné', 'Henné', '#F3E9DC', '#5F1822'],
        ['Nuit d’or', 'Classique', '#231A18', '#D4B07B'],
        ['Camélia', 'Floral', '#F7EEEA', '#8E2836'],
      ]
        .map(
          (t) => `
        <div class="tplcard"><div class="thumb" style="background:${t[2]};height:220px">
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
            <div class="script" style="font-size:28px;color:${t[3]}">Yasmine &amp; Adam</div>
            <div class="mic mt10" style="letter-spacing:2px;color:${t[3]};opacity:.7;font-size:9px">06 · 06 · 2026</div></div></div>
          <div class="meta"><div><div class="bm">${t[0]}</div><div class="cap muted mt4">${t[1]}</div></div>${ic('aright', 'i16')}</div></div>`,
        )
        .join('')}</div></div>
  </section>
  ${foot}`,
  };
}

/* ============ 05 · TARIFS ============ */
function p05() {
  const rows = [
    ['Invitation personnalisable', 1, 1, 1],
    ['Studio complet (sections, styles, animations)', 1, 1, 1],
    ['Gestion des invités, foyers &amp; accompagnants', 1, 1, 1],
    ['RSVP par personne et par sous-événement', 1, 1, 1],
    ['Envois par lien, e-mail et SMS', 1, 1, 1],
    ['QR code d’invitation', 1, 1, 1],
    ['Statistiques &amp; relances', 1, 1, 1],
    ['QR code photos &amp; vidéos', 0, 1, 1],
    ['Stockage souvenirs', '—', '10 Go', '10 Go'],
    ['Modération des contenus', 0, 1, 1],
    ['Galerie privée invités', 0, 1, 1],
    ['QR code livre d’or audio', 0, 0, 1],
    ['Messages vocaux illimités', 0, 0, 1],
    ['Export audio &amp; album', 0, 0, 1],
    ['Carte de remerciement', 0, 0, 1],
  ];
  const cell = (v) =>
    v === 1
      ? `<span style="color:var(--go-600)">${ic('check', 'i18')}</span>`
      : v === 0
        ? `<span style="color:var(--n-300)">${ic('minus', 'i18')}</span>`
        : `<span class="b" style="color:var(--n-700)">${v}</span>`;
  const pk = (
    t,
    p,
    d,
    feat,
  ) => `<div class="price${feat ? ' feat' : ''}" style="text-align:center">${feat ? '<span class="tag" style="left:50%;transform:translateX(-50%)">Le plus choisi</span>' : ''}
    <div class="h3">${t}</div><div class="cap muted mt6">${d}</div>
    <div class="amt mt16">${p}</div><div class="cap muted">paiement unique · par événement</div>
    <div class="mt24">${btn('Choisir', feat ? 'gold' : 'sec', null, 'blk')}</div></div>`;
  return {
    n: '05',
    slug: 'tarifs',
    title: 'Tarifs',
    w: 1440,
    h: 1780,
    cls: 'mk',
    html: `
  ${navLight('Tarifs')}
  <section style="background:var(--ivory);padding:64px 64px 48px" class="tc">
    <div class="eyebrow">Tarifs</div>
    <h2 style="font-family:var(--serif);font-weight:400;font-size:50px;line-height:58px;margin:14px 0 0">Un achat, un événement.</h2>
    <p class="bl dim" style="max-width:620px;margin:16px auto 0">Aucun abonnement mensuel. Vous payez une fois pour votre événement, et vos accès restent ouverts 12 mois après la date.</p>
    <div class="grid g3 mt40" style="gap:20px;align-items:start;text-align:left">
      ${pk('Invitation digitale', '14,99 €', 'L’essentiel pour inviter et suivre', false)}
      ${pk('Invitation + Photo/Vidéo', '29,99 €', 'Inviter, puis tout collecter', true)}
      ${pk('Invitation + Photo/Vidéo + Audio', '39,99 €', 'L’expérience complète', false)}
    </div>
  </section>
  <section style="background:#fff;padding:64px">
    <h3 class="s-title tc" style="font-size:30px">Comparer les offres</h3>
    <table class="tbl mt32" style="box-shadow:var(--e-1)">
      <thead><tr><th style="width:520px">Inclus</th><th class="tc">Invitation</th><th class="tc">+ Photo/Vidéo</th><th class="tc">+ Livre audio</th></tr></thead>
      <tbody>${rows
        .map(
          (r) => `<tr><td style="color:var(--n-800)">${r[0]}</td>
        <td class="tc">${cell(r[1])}</td><td class="tc" style="background:var(--go-50)">${cell(r[2])}</td><td class="tc">${cell(r[3])}</td></tr>`,
        )
        .join('')}
        <tr><td></td><td class="tc">${btn('Choisir', 'sec', null, 'sm')}</td><td class="tc" style="background:var(--go-50)">${btn('Choisir', 'gold', null, 'sm')}</td><td class="tc">${btn('Choisir', 'sec', null, 'sm')}</td></tr>
      </tbody></table>
    <div class="grid g3 mt40" style="gap:20px">
      ${[
        [
          'Produits additionnels',
          'Ajoutez le livre audio ou la carte de remerciement à tout moment, sans changer d’offre.',
          'gift',
        ],
        [
          'Wedding planners',
          'Tarifs dégressifs à partir de 5 événements, espace agence et facturation centralisée.',
          'building',
        ],
        [
          'Garantie sérénité',
          'Aperçu complet gratuit. Vous ne payez qu’au moment de publier votre invitation.',
          'shield',
        ],
      ]
        .map(
          (x) => `
      <div class="card pad"><div class="row g10 aic">${ic(x[2], 'i18').replace('class="ic i18"', 'class="ic i18" style="stroke:var(--go-600)"')}<span class="h3" style="font-size:16px">${x[0]}</span></div>
      <p class="b dim mt10">${x[1]}</p></div>`,
        )
        .join('')}</div>
  </section>
  ${foot}`,
  };
}

/* ============ 06 · WEDDING PLANNERS ============ */
function p06() {
  return {
    n: '06',
    slug: 'wedding-planners',
    title: 'Wedding planners (B2B)',
    w: 1440,
    h: 2340,
    cls: 'mk',
    html: `
  <section style="background:var(--ink);position:relative;overflow:hidden">
    ${navDark('Wedding planners')}
    <div style="position:absolute;width:900px;height:900px;left:-200px;top:-300px;border-radius:999px;background:radial-gradient(closest-side,rgba(122,31,43,.5),rgba(122,31,43,0))"></div>
    <div style="position:relative;padding:56px 64px 88px;display:flex;gap:48px;align-items:center">
      <div style="width:580px;flex:0 0 580px">
        <div class="mover" style="color:var(--go-500)">Pour les agences &amp; wedding planners</div>
        <h1 class="d-l mt20" style="color:#F7F3EC;font-size:52px;line-height:60px">Tous vos mariages,<br>un seul espace.</h1>
        <div class="rule mt24"></div>
        <p class="bl mt24" style="color:#A9A499;max-width:480px">Créez, dupliquez et pilotez les invitations de tous vos clients. Vos modèles, votre marque, votre facturation.</p>
        <div class="row g12 mt32">${btn('Demander une démo', 'gold', 'aright', 'lg')}${btn('Voir les tarifs agence', 'onDark', null, 'lg')}</div>
        <div class="row g32 mt40">${[
          ['−70 %', 'de temps sur les relances'],
          ['1 espace', 'pour tous vos clients'],
          ['Marque blanche', 'sur demande'],
        ]
          .map(
            (x) =>
              `<div><div class="s-title" style="font-size:22px;color:var(--go-500)">${x[0]}</div><div class="mic mt4" style="color:#6B6459;text-transform:uppercase;letter-spacing:1.2px">${x[1]}</div></div>`,
          )
          .join('')}</div>
      </div>
      <div class="fx">
        <div class="card" style="overflow:hidden;box-shadow:var(--e-dev);border-radius:16px">
          <div style="padding:16px 18px;border-bottom:1px solid var(--n-200);display:flex;justify-content:space-between;align-items:center">
            <div><div class="bm">Portefeuille clients</div><div class="cap muted mt4">Saison 2026 · 6 événements actifs</div></div>${btn('Nouvel événement', 'pri', 'plus', 'sm')}</div>
          <div style="padding:16px;background:var(--n-25)">
            ${[
              ['Yasmine &amp; Adam', '6 juin 2026', 'Publiée', 'ok', 67],
              ['Léa &amp; Antoine', '12 sept. 2026', 'Publiée', 'ok', 88],
              ['Inès &amp; Malik', '5 juin 2027', 'Brouillon', 'neu', 12],
              ['Chloé &amp; Paul', '19 juil. 2026', 'Publiée', 'ok', 94],
            ]
              .map(
                (e) => `
            <div class="card" style="padding:13px 16px;margin-bottom:10px;box-shadow:none;display:flex;align-items:center;gap:16px">
              <div style="width:38px;height:46px;border-radius:8px;background:var(--cream);border:1px solid var(--n-200);display:flex;align-items:center;justify-content:center"><span class="script" style="font-size:15px;color:var(--bx-700)">S</span></div>
              <div style="width:170px"><div class="bm">${e[0]}</div><div class="cap muted mt4">${e[1]}</div></div>
              ${badge(e[2], e[3])}
              <div class="fx"><div class="prog"><i style="width:${e[4]}%"></i></div><div class="mic muted mt6">${e[4]} % de réponses</div></div>
              ${ic('more', 'i16')}</div>`,
              )
              .join('')}
          </div></div>
      </div></div>
  </section>
  <section class="mk-sec" style="background:#fff">
    <div class="eyebrow">Ce que ça change</div><h2>Conçu pour un portefeuille,<br>pas pour un seul couple.</h2>
    <div class="grid g3 mt40" style="gap:20px">
      ${[
        [
          'Espace agence',
          'building',
          'Tous vos événements dans une même vue, avec statut, progression et prochaines échéances.',
        ],
        [
          'Modèles maison',
          'layers',
          'Enregistrez vos propres templates et vos palettes. Chaque nouveau client démarre à votre image.',
        ],
        [
          'Rôles &amp; permissions',
          'shield',
          'Owner, Admin, Editor, Viewer. Vos clients voient ce que vous décidez de leur montrer.',
        ],
        [
          'Duplication',
          'copy',
          'Reprenez la structure d’un événement réussi et adaptez-la en quelques minutes.',
        ],
        [
          'Facturation centralisée',
          'wallet',
          'Une seule facture pour l’agence, ventilée par événement, exportable en comptabilité.',
        ],
        [
          'Support prioritaire',
          'help',
          'Un interlocuteur dédié en pleine saison, avec réponse sous 4 heures ouvrées.',
        ],
      ]
        .map(
          (x) => `
      <div class="fcard"><div class="ib">${ic(x[1], 'i20')}</div><h3>${x[0]}</h3><p>${x[2]}</p></div>`,
        )
        .join('')}
    </div>
  </section>
  <section class="mk-sec" style="background:var(--ivory)">
    <div class="row g40 ais">
      <div style="width:420px;flex:0 0 420px"><div class="eyebrow">Tarifs agence</div><h2>Dégressif dès<br>le 5ᵉ événement.</h2>
      <p class="lead">Vous achetez des crédits événement, vous les attribuez quand vous voulez. Pas de date d’expiration avant 24 mois.</p></div>
      <div class="fx grid g3" style="gap:20px">
        ${[
          ['5 événements', '119 €', '23,80 € / événement', false],
          ['10 événements', '219 €', '21,90 € / événement', true],
          ['25 événements', '479 €', '19,16 € / événement', false],
        ]
          .map(
            (p) => `
        <div class="price${p[3] ? ' feat' : ''}" style="padding:26px">${p[3] ? '<span class="tag">Recommandé</span>' : ''}
          <div class="h3" style="font-size:16px">${p[0]}</div><div class="amt mt10" style="font-size:38px;line-height:46px">${p[1]}</div>
          <div class="cap muted">${p[2]}</div><div class="mt20">${btn('Acheter des crédits', p[3] ? 'gold' : 'sec', null, 'blk')}</div></div>`,
          )
          .join('')}
      </div></div>
  </section>
  ${foot}`,
  };
}

/* ============ 07 · EXEMPLES / INSPIRATION ============ */
function p07() {
  const ex = [
    [
      'Yasmine &amp; Adam',
      'Mariage oriental · Aix-en-Provence',
      '#F6F1E7',
      '#7A1F2B',
      '126 invités · 94 % de réponses',
    ],
    [
      'Léa &amp; Antoine',
      'Mariage civil · Annecy',
      '#EFEDE7',
      '#46413A',
      '78 invités · 88 % de réponses',
    ],
    [
      'Sarah &amp; Reda',
      'Henné · Casablanca',
      '#F3E9DC',
      '#5F1822',
      '210 invités · 91 % de réponses',
    ],
    [
      'Chloé &amp; Paul',
      'Champêtre · Bordeaux',
      '#F2F1E6',
      '#4A5A3A',
      '96 invités · 82 % de réponses',
    ],
    [
      'Les 30 ans de Nour',
      'Anniversaire · Paris',
      '#FBF6EC',
      '#B0762A',
      '54 invités · 96 % de réponses',
    ],
    [
      'Baby shower Inès',
      'Baby shower · Lyon',
      '#F7EEEA',
      '#8E2836',
      '32 invités · 100 % de réponses',
    ],
  ];
  return {
    n: '07',
    slug: 'exemples',
    title: 'Exemples & inspiration',
    w: 1440,
    h: 1700,
    cls: 'mk',
    html: `
  ${navLight('Exemples')}
  <section style="background:var(--ivory);padding:56px 64px 24px">
    <div class="eyebrow">Inspiration</div>
    <h2 style="font-family:var(--serif);font-weight:400;font-size:48px;line-height:56px;margin:14px 0 0">De vrais événements,<br>de vrais résultats.</h2>
    <p class="b dim mt14" style="max-width:600px;font-size:16px;line-height:26px">Six invitations publiées avec MyEvent’s, avec l’accord de leurs organisateurs.</p>
    <div class="row g8 mt32">${['Tous', 'Mariage', 'Henné', 'Civil', 'Anniversaire', 'Baby shower', 'Professionnel'].map((c, i) => `<span class="btn ${i === 0 ? 'pri' : 'sec'} sm" style="border-radius:999px">${c}</span>`).join('')}</div>
  </section>
  <section style="background:var(--ivory);padding:32px 64px 72px">
    <div class="grid g3" style="gap:24px">${ex
      .map(
        (e) => `
      <div class="card" style="overflow:hidden;border-radius:16px">
        <div style="height:320px;background:${e[2]};position:relative;display:flex;align-items:center;justify-content:center">
          <div class="tc" style="padding:0 30px">
            <div class="mic" style="letter-spacing:2.2px;color:${e[3]};opacity:.7;font-size:9px">LES FAMILLES</div>
            <div class="script mt10" style="font-size:34px;line-height:44px;color:${e[3]}">${e[0]}</div>
            <div style="width:34px;height:1px;background:${e[3]};opacity:.45;margin:12px auto"></div>
            <div class="mic" style="letter-spacing:2px;color:${e[3]};opacity:.7;font-size:9px">06 · 06 · 2026</div></div>
          <span class="badge gld" style="position:absolute;top:14px;right:14px">Publiée</span></div>
        <div style="padding:18px 20px">
          <div class="bm">${e[0].replace('&amp;', '&')}</div><div class="cap muted mt4">${e[1]}</div>
          <div class="row between aic mt14"><span class="mic muted" style="font-weight:400">${e[4]}</span>
          <span class="btn ghost sm" style="padding:0;color:var(--bx-700)">Voir l’invitation${ic('aright', 'i14')}</span></div></div></div>`,
      )
      .join('')}</div>
  </section>
  ${foot}`,
  };
}

/* ============ 08 · FAQ ============ */
function p08() {
  const G = [
    [
      'Avant de commencer',
      [
        [
          'Faut-il un abonnement ?',
          'Non. MyEvent’s se paie une fois, par événement. Vos accès restent ouverts 12 mois après la date de l’événement, le temps de récupérer tous vos souvenirs.',
          1,
        ],
        [
          'Puis-je essayer avant de payer ?',
          'Oui. Vous créez votre événement, choisissez un template et personnalisez tout dans le Studio gratuitement. Le paiement n’intervient qu’au moment de publier.',
          0,
        ],
        [
          'MyEvent’s convient-il à autre chose qu’un mariage ?',
          'Oui : fiançailles, henné, anniversaire, baby shower, baptême, soirée privée, événement professionnel et conférence. Les templates et le vocabulaire s’adaptent au type choisi.',
          0,
        ],
      ],
    ],
    [
      'Invitations &amp; Studio',
      [
        [
          'Puis-je modifier mon invitation après l’envoi ?',
          'Oui, à tout moment. Le lien reste le même et vos invités voient immédiatement la dernière version. Chaque modification est enregistrée dans l’historique de versions.',
          0,
        ],
        [
          'L’invitation est-elle multilingue ?',
          'Vous pouvez mélanger les langues dans une même invitation — français, arabe, anglais — y compris les textes en écriture droite-à-gauche.',
          0,
        ],
      ],
    ],
    [
      'Invités &amp; RSVP',
      [
        [
          'Mes invités doivent-ils créer un compte ?',
          'Jamais. Ils ouvrent un lien ou scannent un QR code. Rien à installer, rien à retenir.',
          0,
        ],
        [
          'Comment gérer les accompagnants ?',
          'Vous définissez, invité par invité, le nombre d’accompagnants autorisés. Le formulaire RSVP s’adapte automatiquement.',
          0,
        ],
        [
          'Puis-je gérer plusieurs cérémonies ?',
          'Oui. Mairie, cérémonie, cocktail, dîner, henné : chaque sous-événement a son horaire, son lieu et sa propre liste d’invités.',
          0,
        ],
      ],
    ],
    [
      'Souvenirs &amp; confidentialité',
      [
        [
          'Qui voit les photos déposées ?',
          'Vous seuls, jusqu’à validation. La modération est activée par défaut : rien n’apparaît dans la galerie sans votre accord.',
          0,
        ],
        [
          'Que deviennent mes données après l’événement ?',
          'Vous exportez tout quand vous voulez. Passé 12 mois, vous pouvez prolonger, télécharger une archive complète ou supprimer définitivement l’événement.',
          0,
        ],
      ],
    ],
  ];
  return {
    n: '08',
    slug: 'faq',
    title: 'FAQ',
    w: 1440,
    h: 1620,
    cls: 'mk',
    html: `
  ${navLight()}
  <section style="background:var(--ivory);padding:56px 64px 72px">
    <div class="row g40 ais">
      <div style="width:340px;flex:0 0 340px;position:sticky;top:0">
        <div class="eyebrow">Aide</div>
        <h2 style="font-family:var(--serif);font-weight:400;font-size:42px;line-height:50px;margin:14px 0 0">Questions<br>fréquentes.</h2>
        <p class="b dim mt14">Vous ne trouvez pas votre réponse ? Notre équipe répond en moins de 4 heures ouvrées.</p>
        <div class="col g10 mt24">${btn('Nous écrire', 'pri', 'mail')}${btn('Voir les tutoriels', 'sec', 'help')}</div>
        <div class="card pad mt32" style="background:var(--go-50);border-color:var(--go-200)">
          <div class="row g10 aic">${ic('sparkle', 'i18').replace('class="ic i18"', 'class="ic i18" style="stroke:var(--go-700)"')}<span class="bm" style="color:var(--go-700)">Démo guidée</span></div>
          <p class="cap dim mt8">15 minutes avec un conseiller pour construire votre première invitation en direct.</p>
          <div class="mt14">${btn('Réserver un créneau', 'gold', null, 'sm')}</div></div>
      </div>
      <div class="fx">
        ${G.map(
          (
            g,
          ) => `<div style="margin-bottom:36px"><div class="over gold">${g[0]}</div>
          <div class="card mt14" style="padding:0 24px">
          ${g[1]
            .map(
              (
                q,
                i,
              ) => `<div class="faq" style="${i === g[1].length - 1 ? 'border-bottom:none' : ''}">
            <div style="flex:1"><div class="q">${q[0]}</div>${q[2] ? `<div class="a">${q[1]}</div>` : ''}</div>
            <span style="color:var(--n-400)">${ic(q[2] ? 'cup' : 'cdown', 'i18')}</span></div>`,
            )
            .join('')}</div></div>`,
        ).join('')}
      </div></div>
  </section>
  ${foot}`,
  };
}

module.exports = [p01, p02, p03, p04, p05, p06, p07, p08].map((f) => f());
