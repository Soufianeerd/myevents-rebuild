# Design System de MyEvent's

Le Design System MyEvent's repose sur une approche "Quiet Luxury" et Local-First.
Il implémente les directives graphiques originelles issues du carrousel de maquettes.

## Philosophie et Contraintes

- **Local-First** : Aucune police de Google Fonts n'est téléchargée par défaut au runtime. Une stack de polices de fallback est utilisée (`--font-sans-family`, `--font-serif-family`, etc.).
- **Accessibilité (WCAG 2.2 AA)** : Tous les contrôles interactifs disposent d'un focus visible (`--focus-ring`), d'états `disabled` lisibles, et de contrastes respectant la norme AA. Les modales et infobulles utilisent Radix UI pour la robustesse absolue (focus trap, ARIA, escape).
- **Architecture** : Dépendance minimale. Les seuls packages tiers ajoutés sont `@radix-ui/react-dialog` et `@radix-ui/react-tooltip`. Tout le reste (Select, Radio, Checkbox, Switch) utilise du HTML natif avec un stylage CSS complexe mais natif. Aucun shadcn/ui monolythique.

## Utilisation des Tokens Tailwind (v4)

Les couleurs, ombres, rayons et espacements sont exposés en variables CSS (`globals.css`) et reconnus par Tailwind v4 via `@theme`.

- **Couleurs de marque** : `bg-primary`, `text-accent`, `bg-brand-bordeaux-700`, etc.
- **Couleurs sémantiques** : `text-success`, `bg-danger-bg`, etc.
- **Rayons** : `rounded-sm` (10px) à `rounded-pill` (9999px).
- **Ombres** : `shadow-xs` à `shadow-floating`.

## Primitives Disponibles

- **Action** : `Button`, `IconButton`.
- **Formulaire** : `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`.
- **Feedback** : `Badge`, `Alert`, `StatusMessage`, `Skeleton`, `Spinner`, `EmptyState`.
- **Overlay** : `Dialog`, `Drawer` (base Radix Dialog), `Tooltip` (base Radix Tooltip).
- **Structure** : `Card`, `Separator`.
