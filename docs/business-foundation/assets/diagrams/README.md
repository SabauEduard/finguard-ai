# Diagrame & Assets Vizuale - FinGuard AI

Acest folder conține toate diagramele și asset-urile vizuale folosite în documentul Business Foundation.

## Fișiere

### 1. Lean Canvas
- **lean-canvas.png** (352 KB, 1400x1644px) - Imagine finală folosită în PDF
- **lean-canvas.html** (14 KB) - Sursă HTML pentru preview/editare

### 2. SWOT Analysis
- **swot-analysis.png** (609 KB, 1200x1417px) - Imagine finală folosită în PDF
- **swot-analysis.html** (13 KB) - Sursă HTML pentru preview/editare

### 3. Gantt Chart
- **gantt.png** (1.2 MB) - Diagramă Gantt project roadmap (19 săptămâni, M0-M6)

## Cum să regenerezi imaginile

### Metoda 1: Editare HTML + Screenshot automat

```bash
# 1. Editează HTML-ul
open lean-canvas.html  # sau swot-analysis.html

# 2. Regenerează PNG-ul cu script Python (din folder rădăcină)
cd ../..
python3 scripts/screenshot_fullpage.py assets/diagrams/lean-canvas.html assets/diagrams/lean-canvas.png 1400
python3 scripts/screenshot_fullpage.py assets/diagrams/swot-analysis.html assets/diagrams/swot-analysis.png 1200

# Script-ul va:
# - Face screenshot full-page (înălțime automată)
# - Crop spațiul alb de sus/jos
# - Deschide imaginea pentru preview
```

### Metoda 2: Chrome manual (mai simplu)

```bash
# Screenshot cu dimensiuni fixe mari
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --headless --disable-gpu \
  --screenshot="lean-canvas.png" \
  --window-size=1400,5000 \
  --hide-scrollbars \
  "file://$(pwd)/lean-canvas.html"

# Apoi crop manual în Preview sau cu Python
```

### Metoda 3: Browser manual (cel mai ușor)

1. Deschide HTML în Chrome/Firefox
2. Zoom 100%
3. Screenshot: `Cmd+Shift+4` (Mac) sau `Print Screen` (Windows)
4. Salvează ca PNG

## Scripturi disponibile

**Locație:** `../../scripts/` (folder rădăcină business-foundation)

- **screenshot_fullpage.py** - Script Python pentru screenshot automat cu crop
- **generate_images.py** - Script Selenium (necesită `pip install selenium`)
- **screenshot_full.sh** - Script Bash wrapper pentru Chrome headless

## Note tehnice

**Dimensiuni recomandate:**
- Lean Canvas: width 1400px (height auto, ~1600-1700px)
- SWOT Analysis: width 1200px (height auto, ~1400-1500px)

**Cropping:**
- Top threshold: 245 (detectează header colorat)
- Bottom threshold: 240 (detectează footer/ultimul content)

**Culori folosite:**
- Lean Canvas: Gradient violet (#667eea → #764ba2)
- SWOT: Verde (#16a34a), Roșu (#dc2626), Albastru (#2563eb), Portocaliu (#ea580c)

## Regenerare PDF

După modificarea imaginilor:

```bash
cd ../..  # înapoi la root business-foundation/
xelatex BUSINESS_FOUNDATION.tex
xelatex BUSINESS_FOUNDATION.tex  # twice for TOC
rm *.aux *.log *.out *.toc
open BUSINESS_FOUNDATION.pdf
```

---

**Ultima actualizare:** 30 Martie 2026
