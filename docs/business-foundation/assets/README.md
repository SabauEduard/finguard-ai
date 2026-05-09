# [DESIGN] Assets Folder

Aici se salvează toate fișierele vizuale pentru documentul Business Foundation.

## [FOLDER] Structură

```
assets/
 logo/
    logo.png          ← Logo principal (transparent PNG, min 512x512px)
    logo.svg          ← Logo vector (scalabil, pentru print)

 diagrams/
    gantt.png         ← Diagrama Gantt (min 1920x1080px)
    lean-canvas.png   ← Lean Canvas vizual (optional)

 mockups/              ← UI screenshots (optional, dar impresionant!)
     dashboard.png
     upload.png
     reports.png
```

## [LIST] Checklist Assets

### Obligatorii

- [ ] **Logo** (`logo/logo.png`) - Transparent PNG, min 512x512px
- [ ] **Logo SVG** (`logo/logo.svg`) - Pentru scalabilitate
- [ ] **Gantt Chart** (`diagrams/gantt.png`) - Min 1920x1080px, lizibil

### Opționale (dar recomandate)

- [ ] **Lean Canvas** (`diagrams/lean-canvas.png`) - Vizualizare canvas
- [ ] **Mockups UI** (`mockups/*.png`) - 2-3 screenshots dashboard

## Tool-uri Recomandate

### Pentru Logo

- **Midjourney** ($10/lună) - Calitate profesională
- **DALL-E 3** (inclus ChatGPT Plus) - Foarte bun
- **Canva AI** (free tier) - OK pentru start
- **Figma** (free) - Dacă vrei să desenezi manual

### Pentru Gantt

- **GanttProject** (free) - Ușor de folosit
- **Mermaid + AI** (free) - Generate cu ChatGPT
- **Figma** (free) - Cu plugin
- **Google Sheets** (free) - Cu template

### Pentru Mockups

- **Figma** (free) - Best pentru UI design
- **V0.dev** (free tier) - AI-generated
- **Uizard** (free trial) - AI design

## [EXPORT] Referențiere în Document

### Logo în header:

```markdown
![FinGuard AI Logo](./assets/logo/logo.png)
```

### Gantt în Planificare:

```markdown
![Diagrama Gantt](./assets/diagrams/gantt.png)
```

### Mockups:

```markdown
![Dashboard](./assets/mockups/dashboard.png)
```
