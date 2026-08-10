# 06 Conventions

## Internationalisation

- Ne jamais supposer "français uniquement"
- Ne jamais supposer "LTR uniquement"
- Ne jamais supposer "caractères latins uniquement"

Prévoir dans l'architecture : locale, direction (ltr|rtl), Unicode, et des propriétés CSS logiques.
Les contenus culturels seront plus tard de la DONNÉE, jamais des conditions React (ex: `if (culture === "maroc")`).

## Outils

- **TypeScript** en mode strict.
- **Prettier** pour le formatage.
- **ESLint** pour le lint.
