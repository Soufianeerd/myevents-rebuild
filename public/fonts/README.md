# Polices MyEvents

Les WOFF2 proviennent du carrousel local `docs/myevents/fonts/`. Les TTF
contiennent les mêmes glyphes décompressés pour l’export PDF : l’incorporation
directe des WOFF2 dans PDFKit 0.20.2 / fontkit 2.0.4 produisait des textes
illisibles ou une erreur sur certains glyphes composés.

Conversion effectuée avec FontTools (`fonttools[woff]`) :

```python
from pathlib import Path
from fontTools.ttLib import TTFont

for source in Path('public/fonts').glob('*.woff2'):
    font = TTFont(source)
    font.flavor = None
    font.save(source.with_suffix('.ttf'))
```

Les licences SIL OFL sont incluses, récupérées auprès du dépôt Google Fonts :

- [Cormorant Garamond](https://github.com/google/fonts/blob/main/ofl/cormorantgaramond/OFL.txt)
- [Great Vibes](https://github.com/google/fonts/blob/main/ofl/greatvibes/OFL.txt)
- [Inter](https://github.com/google/fonts/blob/main/ofl/inter/OFL.txt)

Contrôle du 29 septembre 2026 : PDF recto/verso rendu avec Poppler et inspecté
visuellement ; voir `docs/audit/COHERENCE-PRODUIT-2026-09-29.md`.
