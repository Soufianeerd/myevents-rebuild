# Legacy Prototype Mapping

Le prototype original (https://github.com/Soufianeerd/invitationmariagesalmaetsoufiane) est une référence d'expérience, PAS l'architecture cible.

| Prototype Feature | Destination MyEvents (Domain/Component) |
|---|---|
| Portes + Sceau interactif | OpeningExperience |
| Révélation progressive (Hero) | InvitationRenderer |
| Texte culturel / RTL | Culture/i18n/content blocks |
| Programme (Lieux/Itinéraires) | ScheduleItem / ProgramBlock / LocationBlock |
| Cartes | Location |
| Calendrier / Compte à rebours | CountdownBlock |
| RSVP (Présence/Absence, nb pers.) | RSVPForm / RSVPSubmission / GuestGroup |
| Message invité | RSVPSubmission |
| Notification organisateur | MailProvider / Notification |
| Confirmation invité | MailProvider |
| Animations de scroll | AnimationConfig / Renderer |
| Google Sheet persistence | (Référence fonctionnelle uniquement) |
