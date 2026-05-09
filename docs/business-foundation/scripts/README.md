# Scripts - FinGuard AI Business Foundation

Acest folder conține scripturi pentru generarea automată a imaginilor PNG din sursele HTML.

## Fișiere disponibile

### screenshot_fullpage.py

**Recomandat** - Script Python complet pentru screenshot full-page cu cropping automat.

**Caracteristici:**

- Calcul automat al înălțimii necesare
- Smart cropping (elimină spațiul alb păstrând conținutul)
- Preview automat al imaginii generate
- Fallback la Chrome headless dacă Selenium nu e disponibil

**Dependințe (opțional, pentru Method 1):**

```bash
pip install selenium pillow
```

**Utilizare:**

```bash
# Din folder rădăcină business-foundation/
python3 scripts/screenshot_fullpage.py assets/diagrams/lean-canvas.html assets/diagrams/lean-canvas.png 1400
python3 scripts/screenshot_fullpage.py assets/diagrams/swot-analysis.html assets/diagrams/swot-analysis.png 1200
```

**Output:**

- lean-canvas.png (1400×1644px, ~352 KB)
- swot-analysis.png (1200×1417px, ~609 KB)

**Algoritm cropping:**

- Detectează prima/ultima linie cu conținut colorat
- Threshold: RGB < 245 sau diferență culoare > 30
- Păstrează 20px padding sus/jos
- Elimină automat 1600-1800px spațiu alb

---

### generate_images.py

Script Selenium alternativ (mai complex, necesită dependințe suplimentare).

**Dependințe:**

```bash
pip install selenium pillow
```

**Utilizare:**
Similar cu screenshot_fullpage.py, dar necesită Selenium instalat.

---

### screenshot_full.sh

Script Bash wrapper simplu pentru Chrome headless.

**Caracteristici:**

- Nu necesită Python sau dependințe suplimentare
- Folosește Chrome direct în mod headless
- Înălțime fixă 5000px (necesită crop manual ulterior)

**Utilizare:**

```bash
# Din folder assets/diagrams/
../../scripts/screenshot_full.sh lean-canvas.html lean-canvas.png 1400
```

**Limitări:**

- Generează imagini mari (~3-5 MB) cu mult spațiu alb
- Necesită crop manual sau folosirea unui alt tool

---

## Recomandări

**Pentru generare automată:** Folosește `screenshot_fullpage.py` (Method 1 cu Selenium sau Method 2 cu Chrome headless)

**Pentru debugging:** Folosește `screenshot_full.sh` pentru generare rapidă fără dependințe Python

**Pentru editare manuală:** Deschide HTML-ul direct în browser și fă screenshot cu `Cmd+Shift+4` (Mac)

---

## Structura proiectului

```
business-foundation/
├── scripts/                      ← Aici (scripturi generare)
│   ├── README.md
│   ├── screenshot_fullpage.py   (recomandat)
│   ├── generate_images.py
│   └── screenshot_full.sh
├── assets/
│   └── diagrams/                 ← Surse HTML + PNG-uri finale
│       ├── lean-canvas.html     (sursă editabilă)
│       ├── lean-canvas.png      (imagine finală în PDF)
│       ├── swot-analysis.html   (sursă editabilă)
│       ├── swot-analysis.png    (imagine finală în PDF)
│       ├── gantt.png
│       └── README.md
└── BUSINESS_FOUNDATION.tex       ← Document principal

```

---

**Ultima actualizare:** 30 Martie 2026
**Autor:** Claude Code (Sonnet 4.5)
