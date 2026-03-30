# FinGuard AI

> Platformă SaaS de management financiar cu AI pentru freelanceri români

**Finanțele tale, automate și optimizate**

[![Status](https://img.shields.io/badge/status-in%20development-yellow)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

---

## 📖 Despre Proiect

**FinGuard AI** este o platformă SaaS modernă care automatizează managementul financiar și fiscal pentru freelanceri și SRL-uri micro din România, folosind inteligență artificială (AI).

### Problema

Freelancerii români pierd **8-12 ore/lună** cu management financiar manual:
- Categorisire cheltuieli (deductibile vs nedeductibile)
- Calculare impozite și contribuții (CAS, CASS, impozit venit)
- Urmărire deadline-uri fiscale ANAF
- Raportare și conformitate legislație RO

**Impact financiar**: 5.000-10.000 RON/an în timp pierdut, penalități, și deduceri neoptimizate.

### Soluția

**2 Agenți AI specializați** pe legislația fiscală românească:

1. **Expense Auditor Agent**
   - OCR automat pentru facturi și bonuri (Claude Vision)
   - Clasificare automată cheltuieli (deductibile/nedeductibile conform Cod Fiscal RO)
   - Identificare oportunități deduceri fiscale

2. **Tax Strategy Advisor Agent**
   - Calcul automat impozite și contribuții (CAS 25%, CASS 10%, impozit venit 10%)
   - Optimizare strategie fiscală (PFA vs SRL, distribuție dividende)
   - Alerting proactiv pentru deadline-uri ANAF

**Rezultate**:
- ⏱️ Economie timp: 8-12h/lună → 10 min/lună (reducere **98%**)
- 💰 Economii financiare: 500-2.000 RON/an optimizare + evitare penalități
- ✅ Conformitate 100% cu legislația RO (Cod Fiscal 2026, OUG 89/2025)

---

## 🎯 Features Cheie

### AI-First Approach
- ✅ **Claude 4.6 API** (Sonnet/Opus/Haiku) pentru reasoning financiar complex
- ✅ **Claude Vision** pentru OCR automat facturi și bonuri
- ✅ **GPT-4o fallback** pentru redundanță
- ✅ **Qdrant Vector DB** pentru memorie context financiar

### Specializare România
- ✅ **Cod Fiscal RO 2026** integrat în AI training
- ✅ **ANAF API integration** (e-factura, SPV - Spațiul Privat Virtual)
- ✅ **Legislație actualizată** automat (OUG, norme ANAF)
- ✅ **Banking integration** (BT, ING, Revolut, Wise) pentru import automat tranzacții

### Proactiv vs Reactiv
- ✅ **Alerting inteligent**: "În 14 zile deadline CAS, poți deduce încă 350 RON"
- ✅ **Recomandări contextualizate**: "Cheltuială transport DEDUCTIBILĂ 100%, economie fiscală 7 RON"
- ✅ **Predicție cash-flow**: Estimare venit + cheltuieli + impozite pe 3-6 luni

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

- **Railway vs AWS**: ~60% cost savings pentru MVP ($300-500/mo saved)
- **Cloudflare R2 vs S3**: ~75% cheaper storage, zero egress fees ($100-200/mo saved)
- **Claude 4.6**: Superior reasoning pentru context financiar/legal vs GPT-4
- **FastAPI**: Performance (async native), developer experience, type safety

---

## 💰 Model de Business

### Subscription SaaS (4 Tiers)

| Tier | Preț | Target | Features |
|------|------|--------|----------|
| **Free** | 0 RON/lună | Trial, max 10 tranzacții/lună | Expense categorization basic, Tax calculator manual |
| **Starter** | 49 RON/lună | Freelanceri începători (<2k RON/lună) | AI expense audit, Banking sync 1 cont, ANAF alerting |
| **Pro** | 99 RON/lună | Freelanceri activi (2-10k RON/lună) | 2 Agenți AI full, Banking sync 3 conturi, Tax optimization, e-Factura sync |
| **Business** | 199 RON/lună | SRL micro (>10k RON/lună) | Multi-user (3 seats), Accountant collaboration, Advanced reports, Priority support |

### Proiecții An 1 (Bootstrapped)

**Target**: 1.500-3.000 utilizatori activi (0.5-1% TAM)

| Metric | Valoare |
|--------|---------|
| **Revenue An 1** | 159.855 RON |
| **Costuri An 1** | 130.000 RON |
| **Profit An 1** | 29.855 RON |
| **ROI** | 23% |
| **Break-even** | Luna 9-10 |
| **LTV** | 1.200-2.400 RON |
| **CAC** | <300 RON |
| **LTV:CAC** | 4-8:1 |
| **Gross Margin** | 60-70% |

**Future revenue streams**:
- API B2B (integrare contabili/platforme freelancing)
- White-label pentru bănci/fintech
- Affiliate partnerships (banking, contabilitate)
- Premium add-ons (audit support, multi-year reports)

---

## 📊 Market Analysis

### Dimensiunea Pieței (România 2026)

| Segment | Număr | Descriere |
|---------|-------|-----------|
| **TAM** | 570.000 | Total freelanceri (450k PFA + 120k SRL micro) |
| **SAM** | 300.000 | Venit >3k RON/lună, digital-savvy |
| **SOM** | 1.500-3.000 | Target An 1 (0.5-1% SAM) |

### Competitori

**Locali (RO)**:
- **SmartBill** (lider) - Invoicing + contabilitate, ~100k users, 50-150 RON/lună
- **Oblio** - Invoicing, ~50k users, 30-80 RON/lună

**Internaționali**:
- **QuickBooks Self-Employed** - $15/mo (~70 RON), suport RO limitat
- **FreshBooks** - $17/mo (~78 RON), zero legislație RO
- **Wave Accounting** - Free + paid, zero RO support

### Diferențiatori FinGuard AI

1. **AI-first nativ** vs automation (competiția = if-else rules, FinGuard = LLM reasoning)
2. **ANAF + AI predictive** vs invoicing static
3. **Proactiv** vs reactiv (alerting inteligent, recomandări contextualizate)
4. **Specialized RO** vs generic international (Cod Fiscal 2026, OUG 89/2025)
5. **First-mover advantage**: Zero competitori AI-native în RO (gap 18-24 luni)

---

## 📅 Roadmap

### M0: Research & Setup (2 săptămâni)
- ✅ Market research competitori
- ✅ Tech stack finalizare
- ✅ Business Foundation document

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

| Membru | Rol | Responsabilități |
|--------|-----|------------------|
| **Sabău Eduard** | Tech Lead & Backend | Arhitectură sistem, FastAPI, ANAF API integration |
| **Maftei Valentin** | Backend Engineer | Banking sync, Database schema, API development |
| **Liciu Ștefan** | AI Engineer | Claude integration, AI agents, Qdrant vector DB |
| **Sandu Eduard** | Frontend Engineer | Next.js, React, UI/UX, Onboarding flow |
| **Clem Daria** | Product Manager | User research, Feature prioritization, Roadmap |
| **Nițoi Antonio** | Marketing & Growth | Content marketing, Social media, Community building |

**Model compensație**: Equity-only bootstrapped (6 founders, vesting 4 ani cu 1 an cliff)

**Tranziție salarii**: După break-even + 3-6 luni cash buffer (estimat luna 12-15)

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
- Sabău Eduard (Tech Lead)
- Maftei Valentin (Backend)
- Liciu Ștefan (AI)
- Sandu Eduard (Frontend)
- Clem Daria (Product)
- Nițoi Antonio (Marketing)

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
