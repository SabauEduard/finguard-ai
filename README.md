# FinGuard AI

> Platformă SaaS de management financiar cu AI pentru freelanceri români

**Finanțele tale, automate și optimizate**

[![Status](https://img.shields.io/badge/status-in%20development-yellow)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

---

## 📖 Despre Proiect

**FinGuard AI** este o platformă SaaS modernă care automatizează managementul financiar și fiscal pentru freelanceri și SRL-uri micro din România, folosind inteligență artificială (AI).

### Problema

Freelancerii români pierd **8-12 ore/lună** cu managementul financiar manual:

- Categorizarea cheltuielilor (deductibile vs nedeductibile)
- Calcularea impozitelor și contribuțiilor (CAS, CASS, impozit venit)
- Urmărirea termenelor-limită fiscale ANAF
- Raportarea și conformitatea cu legislația RO

**Impact financiar**: 5.000-10.000 RON/an în timp pierdut, penalități, și deduceri neoptimizate.

### Soluția

**2 Agenți AI specializați** pe legislația fiscală românească:

1. **Expense Auditor Agent**
   - OCR automat pentru facturi și bonuri (Claude Vision)
   - Clasificarea automată a cheltuielilor (deductibile/nedeductibile conform Cod Fiscal RO)
   - Identificarea oportunităților de deduceri fiscale

2. **Tax Strategy Advisor Agent**
   - Calculul automat al impozitelor și contribuțiilor (CAS 25%, CASS 10%, impozit venit 10%)
   - Optimizarea strategiei fiscale (PFA vs SRL, distribuirea dividendelor)
   - Alertare proactivă pentru termenele-limită ANAF

**Rezultate**:

- ⏱️ Economie de timp: 8-12h/lună → 10 min/lună (reducere **98%**)
- 💰 Economii financiare: 500-2.000 RON/an prin optimizare + evitarea penalităților
- ✅ Conformitate 100% cu legislația RO (Cod Fiscal 2026, OUG 89/2025)

---

## 🎯 Features Cheie

### AI-First Approach

- ✅ **Claude 4.6 API** (Sonnet/Opus/Haiku) pentru reasoning financiar complex
- ✅ **Claude Vision** pentru OCR automat facturi și bonuri
- ✅ **GPT-4o fallback** pentru redundanță
- ✅ **Qdrant Vector DB** pentru memorie context financiar

### Specializare România

- ✅ **Cod Fiscal RO 2026** integrat în antrenamentul AI
- ✅ **Integrare ANAF API** (e-Factură, SPV - Spațiul Privat Virtual)
- ✅ **Legislație actualizată** automat (OUG, norme ANAF)
- ✅ **Integrare bancară** (BT, ING, Revolut, Wise) pentru importul automat al tranzacțiilor

### Proactiv vs Reactiv

- ✅ **Alertare inteligentă**: "În 14 zile e termenul-limită CAS, poți deduce încă 350 RON"
- ✅ **Recomandări contextualizate**: "Cheltuială transport DEDUCTIBILĂ 100%, economie fiscală 7 RON"
- ✅ **Predicție cash-flow**: Estimarea veniturilor + cheltuieli + impozite pe 3-6 luni

---

## 🏗️ Arhitectură

### Stack Tehnologic

**Backend**

- Python 3.12 + FastAPI 0.110
- Celery + Redis pentru task queue
- SQLAlchemy 2.0 + PostgreSQL 16

**AI Layer**

- Claude 4.6 API (Sonnet primary, Opus complex, Haiku fast)
- Claude Vision pentru OCR
- OpenAI GPT-4o fallback
- Qdrant vector database pentru memorie

**Frontend**

- Next.js 15 (App Router)
- React 19 + TypeScript 5.4
- Tailwind CSS 4 + shadcn/ui

**Infrastructure**

- Railway (backend MVP)
- Vercel (frontend)
- Cloudflare R2 (storage, zero egress fees)
- PostgreSQL 16 (Supabase/Neon managed)
- Redis 7 (Upstash)

**Auth & Payments**

- Clerk (OAuth 2.0, MFA)
- Stripe + Netopia Payments (RO cards)

### Justificări Arhitecturale

- **Railway vs AWS**: ~60% reducere costuri pentru MVP (economie $300-500/lună)
- **Cloudflare R2 vs S3**: ~75% mai ieftin la storage, fără costuri egress (economie $100-200/lună)
- **Claude 4.6**: Reasoning superior pentru context financiar/legal vs GPT-4
- **FastAPI**: Performanță (async nativ), experiență dezvoltator, type safety

---

## 💰 Model de Business

### Subscription SaaS (4 Tiers)

| Tier         | Preț         | Target                                | Features                                                                           |
| ------------ | ------------ | ------------------------------------- | ---------------------------------------------------------------------------------- |
| **Free**     | 0 RON/lună   | Trial, max 10 tranzacții/lună         | Expense categorization basic, Tax calculator manual                                |
| **Starter**  | 49 RON/lună  | Freelanceri începători (<2k RON/lună) | AI expense audit, Banking sync 1 cont, ANAF alerting                               |
| **Pro**      | 99 RON/lună  | Freelanceri activi (2-10k RON/lună)   | 2 Agenți AI full, Banking sync 3 conturi, Tax optimization, e-Factura sync         |
| **Business** | 199 RON/lună | SRL micro (>10k RON/lună)             | Multi-user (3 seats), Accountant collaboration, Advanced reports, Priority support |

### Proiecții An 1 (Bootstrapped)

**Target**: 1.500-3.000 utilizatori activi (0.5-1% TAM)

| Metric           | Valoare         |
| ---------------- | --------------- |
| **Revenue An 1** | 159.855 RON     |
| **Costuri An 1** | 130.000 RON     |
| **Profit An 1**  | 29.855 RON      |
| **ROI**          | 23%             |
| **Break-even**   | Luna 9-10       |
| **LTV**          | 1.200-2.400 RON |
| **CAC**          | <300 RON        |
| **LTV:CAC**      | 4-8:1           |
| **Gross Margin** | 60-70%          |

**Fluxuri viitoare de venituri**:

- API B2B (integrare cu contabili/platforme de freelancing)
- White-label pentru bănci/fintech
- Parteneriate afiliate (banking, contabilitate)
- Add-ons premium (suport audit, rapoarte multi-an)

---

## 📊 Market Analysis

### Dimensiunea Pieței (România 2026)

| Segment | Număr       | Descriere                                     |
| ------- | ----------- | --------------------------------------------- |
| **TAM** | 570.000     | Total freelanceri (450k PFA + 120k SRL micro) |
| **SAM** | 300.000     | Venit >3k RON/lună, digital-savvy             |
| **SOM** | 1.500-3.000 | Target An 1 (0.5-1% SAM)                      |

### Competitori

**Locali (RO)**:

- **SmartBill** (lider) - Invoicing + contabilitate, ~100k users, 50-150 RON/lună
- **Oblio** - Invoicing, ~50k users, 30-80 RON/lună

**Internaționali**:

- **QuickBooks Self-Employed** - $15/mo (~70 RON), suport RO limitat
- **FreshBooks** - $17/mo (~78 RON), zero legislație RO
- **Wave Accounting** - Free + paid, zero RO support

### Diferențiatori FinGuard AI

1. **AI-first nativi** vs automatizare (competiția = reguli if-else, FinGuard = raționament LLM)
2. **ANAF + AI predictiv** vs facturare statică
3. **Proactiv** vs reactiv (alertare inteligentă, recomandări contextualizate)
4. **Specializat RO** vs generic internațional (Cod Fiscal 2026, OUG 89/2025)
5. **Avantaj first-mover**: Zero competitori AI-nativi în RO (gap 18-24 luni)

---

## 📅 Roadmap

### M0: Research & Setup (2 săptămâni)

- ✅ Cercetare piață și competitori
- ✅ Finalizarea stack-ului tehnologic
- ✅ Documentul Business Foundation

### M1: MVP Backend (4 săptămâni)

- [ ] FastAPI core + auth (Clerk)
- [ ] PostgreSQL schema + migrations
- [ ] Banking sync API (Revolut, Wise)
- [ ] **ANAF API integration** (critical path)

### M2: AI Agents Core (4 săptămâni)

- [ ] Claude 4.6 integration
- [ ] Expense Auditor Agent (OCR + classification)
- [ ] Tax Strategy Advisor Agent (calcule + optimization)
- [ ] Qdrant vector DB pentru memorie

### M3: MVP Frontend (3 săptămâni)

- [ ] Next.js 15 setup + auth flow
- [ ] Dashboard principal + expense list
- [ ] Tax calculator UI
- [ ] Onboarding flow

### M4: Integration & Testing (2 săptămâni)

- [ ] End-to-end testing
- [ ] Security audit
- [ ] Performance optimization
- [ ] Bug fixing

### M5: Beta Launch (2 săptămâni)

- [ ] 50 beta users (IT freelancers)
- [ ] Feedback collection
- [ ] Iterații rapide

### M6: Public Launch (2 săptămâni)

- [ ] Marketing campaign (LinkedIn, dev communities)
- [ ] PR & content marketing
- [ ] Launch pe Product Hunt
- [ ] Monitoring & support 24/7

**Timeline total**: 19 săptămâni (Aprilie-August 2026)

---

## 👥 Echipa

| Membru              | Rol                 | Responsabilități                                                     |
| ------------------- | ------------------- | -------------------------------------------------------------------- |
| **Sabău Eduard**    | Tech Lead & Backend | Arhitectură sistem, FastAPI, ANAF API integration, coordonare echipă |
| **Maftei Valentin** | Backend Engineer    | Banking sync, Database schema, API development, integrări            |
| **Liciu Ștefan**    | AI/ML Engineer      | Claude integration, AI agents, Qdrant vector DB, prompt engineering  |
| **Sandu Eduard**    | Frontend Engineer   | Next.js, React, UI/UX, Onboarding flow, mobile (Flutter)             |
| **Clem Daria**      | Product & Strategy  | Roadmap, cercetare utilizatori, prioritizare features, UX            |
| **Nițoi Antonio**   | Growth & Community  | Content tehnic (blog, docs), community building, developer relations |

**Model de compensație**: Doar equity în faza bootstrapped (6 fondatori, vesting 4 ani cu 1 an cliff)

**Tranziția la salarii**: După break-even + 3-6 luni rezervă cash (estimat luna 12-15)

---

## 📚 Documentație Proiect

### 📄 Business Foundation (COMPLET ✅)

**Locație**: [`docs/business-foundation/`](./docs/business-foundation/)

**Status**: ✅ READY FOR SUBMISSION (30 Martie 2026)

**Documente finale**:

1. **BUSINESS_FOUNDATION.pdf** (6.0 MB, 15 pagini) - Document principal LaTeX
2. **ai-usage-log.pdf** (84 KB, 17 pagini) - Documentare AI tools (17 prompturi complete)
3. **VERIFICARE_CERINTE.md** - Checklist 100% coverage cerințe profesor

**Conținut complet**:

- ✅ Motivație (2 pg) - Problema + Impact financiar 5-10k RON/an + 3 Cazuri utilizare
- ✅ Rezumat (2-3 pg) - 2 Agenți AI + Beneficii măsurabile 98% timp + Diferențiatori + "De ce 2026?"
- ✅ SWOT Analysis - Imagine PNG vizuală + Rezumat text (Top 3 per categorie)
- ✅ Market Analysis - 5 Competitori + Matrice funcționalități + Diferențiatori
- ✅ Tehnologii - Stack complet cu justificări + Tabel costuri MVP (2.3-7k RON/lună)
- ✅ Riscuri - 10 Riscuri majore cu Impact/Probabilitate/Mitigation
- ✅ Planificare - 6 Membri echipă + Gantt chart 19 săptămâni (M0-M6)
- ✅ Costuri - Inițiale 10k + Lunare 4-12k (bootstrapped) + Anuale 130k RON
- ✅ Model Business - 4 Tiers pricing + Proiecții venituri 159.855 RON An 1
- ✅ ROI - 23%, Break-even luna 9-10, LTV:CAC 4-8:1
- ✅ Lean Canvas - Imagine PNG vizuală 1400×1644px (9 secțiuni complete)

**Assets vizuale**:

- Logo PNG + SVG (512×512px)
- Gantt chart PNG (1.2 MB, 19 săptămâni M0-M6)
- Lean Canvas PNG (352 KB, grid layout color-coded)
- SWOT Analysis PNG (609 KB, 4 cadrante gradient backgrounds)

**AI Tools documentate**:

- Claude Code (Sonnet 4.5) - 13 utilizări (structură, SWOT, tech stack, compilare, LaTeX, vizualizări, content)
- Gemini (3 Fast, Nano Banana 2) - 4 utilizări (logo, research competitori, statistici piață)
- Total: 17 prompturi complete cu Context + Input + Output

**Efficiency metrics**:

- Document complet în ~8 ore vs ~30-40 ore manual
- Cost savings identificate: ~60% reducere infrastructure (Railway vs AWS, R2 vs S3)
- 17 prompturi AI documentate transparent

**Detalii complete**: [`docs/business-foundation/README.md`](./docs/business-foundation/README.md)

---

## 🚀 Getting Started

### Prerequisites

```bash
# Backend
python 3.12+
postgresql 16
redis 7

# Frontend
node 20+
npm/pnpm/yarn

# AI
Claude API key (Anthropic)
OpenAI API key (fallback)
```

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/finguard-ai.git
cd finguard-ai

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Configure API keys

# Frontend setup
cd ../frontend
pnpm install
cp .env.example .env.local  # Configure endpoints

# Database setup
cd ../backend
alembic upgrade head

# Run development servers
# Terminal 1 - Backend
uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd ../frontend
pnpm dev
```

### Environment Variables

**Backend (.env)**:

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/finguard
REDIS_URL=redis://localhost:6379
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
CLERK_SECRET_KEY=sk_...
```

**Frontend (.env.local)**:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
```

---

## 📖 Documentație Suplimentară

- **Business Foundation**: [`docs/business-foundation/`](./docs/business-foundation/) - Document complet MPA (15 pg + 17 pg AI log)
- **Architecture**: `docs/architecture/` - System design, ERD, API specs (TBD)
- **API Docs**: `docs/api/` - FastAPI auto-generated docs + Postman collection (TBD)
- **User Guide**: `docs/user-guide/` - Ghid utilizare platformă (TBD)

---

## 🤝 Contributing

Acest proiect este dezvoltat ca parte a cursului MPA (Mobile & Pervasive Applications) la Universitatea București.

**Echipa de dezvoltare**:

- Sabău Eduard (Tech Lead & Backend)
- Maftei Valentin (Backend)
- Liciu Ștefan (AI/ML)
- Sandu Eduard (Frontend)
- Clem Daria (Product & Strategy)
- Nițoi Antonio (Growth & Community)

Pentru contribuții externe (după Public Launch):

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📜 License

MIT License - Vezi [`LICENSE`](./LICENSE) pentru detalii.

---

## 📞 Contact

**Proiect**: FinGuard AI
**Email**: [contact@finguard.ro](mailto:contact@finguard.ro) (TBD)
**Website**: [https://finguard.ro](https://finguard.ro) (TBD)

**Social**:

- LinkedIn: [FinGuard AI](https://linkedin.com/company/finguard-ai) (TBD)
- Twitter/X: [@FinGuardAI](https://twitter.com/FinGuardAI) (TBD)

---

## 🙏 Acknowledgments

- **Universitatea București** - Curs MPA (Mobile & Pervasive Applications)
- **Anthropic** - Claude 4.6 API pentru AI reasoning
- **OpenAI** - GPT-4o fallback și inspirație arhitectură
- **Comunitatea freelancerilor români** - Feedback și insights pentru product-market fit

---

**Status proiect**: 🚧 In Development (M0: Research & Setup - ✅ COMPLETE)

**Next milestone**: M1: MVP Backend (Start: Aprilie 2026)

**Last updated**: 30 Martie 2026
