# Design Contract

Source de vérité canonique : `docs/myevents/ds.css`

## Design Tokens Exacts

### Couleurs de Marque (Brand)

- `--bx-900`: #4a121a
- `--bx-800`: #5f1822
- `--bx-700`: #7a1f2b (Primary Brand)
- `--bx-600`: #8e2836
- `--bx-500`: #9b3543
- `--bx-200`: #e7cdd1
- `--bx-100`: #f3e4e6
- `--bx-50`: #fbf3f4

- `--go-700`: #9c7742
- `--go-600`: #b8925c (Gold Highlight)
- `--go-500`: #d4b07b (Gold Primary)
- `--go-300`: #e3cba5
- `--go-200`: #efe0c7
- `--go-50`: #fbf6ec

- `--ivory`: #f9f7f2
- `--ink`: #1c1614

### Neutres Chauds

- `--n-0`: #ffffff
- `--n-25`: #fcfbf8 (App Canvas)
- `--n-50`: #f6f4ef
- `--n-100`: #efede7
- `--n-200`: #e4e1d9 (Borders)
- `--n-300`: #d2cec4
- `--n-400`: #a9a499
- `--n-500`: #857f74 (Muted Text)
- `--n-600`: #635d53
- `--n-700`: #46413a
- `--n-800`: #2e2a25
- `--n-900`: #1c1917 (Primary Text)

### Sémantique

- Success (`--ok`): #2f7a55 / bg `#e8f2ec`
- Warning (`--warn`): #b0762a / bg `#fbf1e2`
- Danger (`--bad`): #a32f2f / bg `#f8e9e9`
- Info (`--info`): #3a5f86 / bg `#e9eff6`

### Radii (Border Radius)

- `--r-sm`: 10px
- `--r-md`: 12px
- `--r-lg`: 14px
- `--r-xl`: 16px
- `--r-2xl`: 24px
- `--r-pill`: 999px

### Ombres (Shadows)

- `--e-0`: `0 1px 2px rgba(28, 23, 20, 0.04)`
- `--e-1`: `0 1px 2px rgba(28, 23, 20, 0.05), 0 6px 16px -4px rgba(28, 23, 20, 0.05)`
- `--e-2`: `0 2px 4px rgba(28, 23, 20, 0.06), 0 14px 34px -8px rgba(28, 23, 20, 0.08)`
- `--e-3`: `0 4px 10px rgba(28, 23, 20, 0.06), 0 24px 60px -12px rgba(28, 23, 20, 0.1)`
- `--e-dev`: `0 36px 80px -20px rgba(28, 23, 20, 0.3)`

### Typographie (Fonts & Scales)

- `--sans`: Inter
- `--serif`: Cormorant Garamond
- `--script`: Great Vibes
- `--arabic`: Amiri

- `d-xl`: Serif 300, 72px / 80px, ls -1.5px
- `d-l`: Serif 300, 56px / 64px, ls -1px
- `d-m`: Serif 400, 40px / 48px, ls -0.5px
- `s-title`: Serif 500, 32px / 40px, ls -0.2px
- `s-sub`: Serif 400, 24px / 32px
- `s-body`: Serif 400, 18px / 28px
- `h1`: Sans 600, 28px / 36px, ls -0.4px
- `h2`: Sans 600, 22px / 30px, ls -0.3px
- `h3`: Sans 600, 18px / 26px, ls -0.2px
- `h4`: Sans 600, 15px / 22px, ls -0.1px
- `bl`: Sans 400, 16px / 26px
- `b`: Sans 400, 14px / 22px
- `bm`: Sans 500, 14px / 22px
- `lab`: Sans 500, 13px / 18px
- `cap`: Sans 400, 12px / 18px
- `capm`: Sans 500, 12px / 18px
- `mic`: Sans 500, 11px / 16px, ls 0.2px
- `over`: Sans 500, 11px / 16px, uppercase, ls 1.6px
- `mover`: Sans 500, 12px / 18px, uppercase, ls 2.4px

### Dimensions et Structure

- Largeur Sidebar (`.sb`): 268px
- Hauteur Topbar (`.tb`): 68px
- Canvas par défaut (`.screen`): 1440px
- Canvas mobile (`.screen.mobile`): 390px
- Padding principal du contenu (`.content`): 28px

### UI States & Controls

- **Boutons (`.btn`)** : Hauteur standard 40px (`.sm` 32px, `.lg` 46px). Radius 10px. Typographie Sans 500 14px. Bouton Gold utilise `#3a2a16` en couleur de texte sur fond `var(--go-500)`.
- **Inputs (`.inp`)** : Hauteur 42px. Radius 10px. Border `var(--n-300)`.
- **Cartes (`.card`)** : Radius `--r-lg`, background `#fff`, shadow `--e-1`. Padding standard `.pad` 20px.
- **KPIs (`.kpi`)** : Radius `--r-lg`, shadow `--e-1`. Padding 18x20px. Valeur principale: 32px / 40px, SemiBold.
- **Badges (`.badge`)** : Radius `--r-pill`, font-size 11px, Medium. Paddings 4x9px.
