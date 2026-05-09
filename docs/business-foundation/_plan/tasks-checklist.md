# [LIST] TASKS TODO - Business Foundation

> **Quick Reference**: Ce trebuie completat pentru Business Foundation

**Ultima actualizare**: 29 Martie 2026

---

## [TARGET] Prioritate ÎNALTĂ (Fă primele!)

### 1. [OK] Definire Echipă

- [x] **Completează** numărul exact de membri
- [x] **Completează** tabelul din [Plan → Secțiunea 8.1](./PLAN_BUSINESS_FOUNDATION.md#81-echipa)
- [x] **Specifică** model compensație (equity vs salarii)
- **Estimat timp**: 15 min
- **Tool**: Editare manuală Markdown

---

### 2. [SEARCH] Research Competitori

- [x] **Folosește** ChatGPT/Claude/Perplexity
- [x] **Completează** pentru fiecare competitor:
  - QuickBooks Self-Employed
  - FreshBooks
  - Wave Accounting
  - Smartbill
  - Oblio
- [x] **Info necesară**: funcționalități, preț, avantaje, dezavantaje
- [x] **Documentează** promptul în `AI_TOOLS_AND_PROMPTS.md`
- **Estimat timp**: 30-45 min
- **Locație**: [Plan → Secțiunea 5.1](./PLAN_BUSINESS_FOUNDATION.md#51-competitori)

**Prompt sugerat**:

```
Analizează competitorii: QuickBooks Self-Employed, FreshBooks, Wave Accounting,
Smartbill, Oblio în piața de management financiar pentru freelanceri.

Pentru fiecare: top 5 funcționalități, pricing (RON sau USD), 3 avantaje,
3 dezavantaje, suport legislație RO (DA/NU/Parțial).

Format: Markdown pentru copy-paste.
```

---

### 3. [DESIGN] Logo Design

- [x] **Alege tool**: Midjourney / DALL-E / Canva AI / Figma
- [x] **Generează** logo pentru "FinGuard AI"
- [x] **Export**: PNG transparent + SVG
- [x] **Salvează** în: `/docs/business-foundation/assets/logo.png`
- [x] **Documentează** prompt în `AI_TOOLS_AND_PROMPTS.md`
- **Estimat timp**: 20-30 min (cu iterații)

**Prompt sugerat** (pentru Midjourney/DALL-E):

```
Modern minimalist logo for 'FinGuard AI', a financial management SaaS for freelancers.
Elements: AI neural network, shield/guard symbol, financial charts or money.
Color scheme: professional blue and green gradients.
Style: clean, tech-forward, trustworthy. Vector-ready, simple for small sizes.
```

---

### 4. [CHART] Review & Prioritizare SWOT

- [ ] **Citește** template-ul SWOT din [Plan → Secțiunea 4](./PLAN_BUSINESS_FOUNDATION.md#-4-analiza-swot)
- [ ] **Adaugă/modifică** puncte unde e cazul
- [ ] **Marchează** Top 3 cele mai importante per categorie
- [ ] **Optional**: Folosește AI pentru brainstorming suplimentar
- **Estimat timp**: 20-30 min
- **Tool**: Editare Markdown (+ optional ChatGPT pentru idei)

---

## [TOOL] Prioritate MEDIE

### 5. Diagrama Gantt

- [ ] **Alege tool**: GanttProject / Figma / Google Sheets / Mermaid + AI
- [ ] **Creează** diagrama cu milestones din [Secțiunea 8.2](./PLAN_BUSINESS_FOUNDATION.md#82-milestones)
- [ ] **Include**: tasks, dependencies, timeline, responsabili
- [ ] **Export** PNG/PDF → `/docs/business-foundation/assets/gantt.png`
- [ ] **Documentează** (dacă folosești AI) în `AI_TOOLS_AND_PROMPTS.md`
- **Estimat timp**: 45-60 min
- **Recomandare**: GanttProject (ușor) sau Mermaid cu AI (quick)

**AI Help** (optional):

```prompt
Generează diagramă Gantt în format Mermaid cu milestone-urile:
M0: Research & Setup (2 săpt) - tasks: [listă]
M1: MVP Backend (4 săpt) - tasks: [listă]
[etc.]

Include: start/end dates, dependencies, assignees.
```

---

### 6. [COST] Validare Pricing & Costuri

- [x] **Review** pricing tiers: 49/99/199 RON/lună
- [x] **Ajustează** dacă e cazul (prea mult/prea puțin?)
- [x] **Verifică** estimările de costuri lunare
- [x] **Confirmă** scenariul (bootstrapped vs funded) -> boostrapped
- [?] **Update** valori în [Secțiunea 9](./PLAN_BUSINESS_FOUNDATION.md#-9-costuri)
- **Estimat timp**: 20 min
- **Tool**: Calculator + editare Markdown

---

### 7. [CHART] Statistici Piață Freelancing RO

- [x] **Tool**: Perplexity / ChatGPT cu browsing
- [x] **Date necesare**:
  - Nr. freelanceri înregistrați RO (2025-2026)
  - Venit mediu lunar
  - Creștere YoY
  - Predicții următorii 3 ani
- [x] **Adaugă** în [Secțiunea 5 Market Analysis](./PLAN_BUSINESS_FOUNDATION.md#-5-market-analysis)
- [x] **Documentează** prompt în `AI_TOOLS_AND_PROMPTS.md`
- **Estimat timp**: 20 min

**Prompt sugerat**:

```
Care sunt cele mai recente statistici despre piața de freelancing în România (2025-2026)?
Vreau: număr freelanceri înregistrați, venit mediu, domenii active, predicții creștere următorii 3 ani.
Citează sursele.
```

---

## [NOTE] Prioritate SCĂZUTĂ (Nice-to-have)

### 8. [DESIGN] Mockups UI/UX (Optional)

- [ ] **Tool**: Figma / V0.dev / Uizard
- [ ] **Creează** 2-3 screenshots dashboard
- [ ] **Salvează** în `/docs/business-foundation/assets/mockups/`
- **Estimat timp**: 60+ min (dacă vrei să faci)
- **Notă**: Opțional, dar impresionant în document!
- Nu facem.

---

### 9. [DOC] Lean Canvas - Completare Finală

- [ ] **Review** template [Secțiunea 10](./PLAN_BUSINESS_FOUNDATION.md#-10-lean-canvas-1-page-summary)
- [ ] **Fill in** detaliile rămase
- [ ] **Validare** internă echipă
- **Estimat timp**: 15 min
- **Notă**: Majoritatea e deja completată din secțiuni anterioare

---

## [BOOKS] Documentare AI (IMPORTANT!)

### 10. [NOTE] Update AI_TOOLS_AND_PROMPTS.md

- [ ] **După fiecare** utilizare tool AI, documentează:
  - Nume tool + model
  - Prompt exact (copy-paste)
  - Output obținut
  - Utilitate (de ce a fost folositor)
- **CRITICAL**: Profesorul cere explicit asta!
- **Locație**: `AI_TOOLS_AND_PROMPTS.md`

**Template rapid**:

```markdown
## [NUME TOOL]

**Tool**: [ex: ChatGPT]
**Model**: [ex: GPT-4o]
**Folosit pentru**: [ex: Research competitori]
**Data**: [29 Martie 2026]

### Prompt:

[PASTE AICI]

### Output:

[DESCRIERE SAU LINK]

### Utilitate:

[EXPLICAȚIE SCURTĂ]
```

---

## [OK] Finalizare Document

### 11. [DOC] Formatare Document Final

- [ ] **Tool**: Word / Google Docs / LaTeX / Notion
- [ ] **Include**:
  - Logo (pe prima pagină)
  - Toate secțiunile din plan
  - Diagrama Gantt
  - Grafice costuri (optional)
  - Tabel competitori
  - SWOT final
  - Lean Canvas
- [ ] **Spell check** română
- [ ] **Export** PDF final
- **Estimat timp**: 45-60 min
- **Notă**: Fă la sfârșit când tot restul e gata!

---
