# GLAW — AI-Powered Legal Intelligence Platform
## Presentation Slides (12 Slides)

---

## SLIDE 1: Title Slide

**GLAW: AI-Powered Legal Intelligence Platform**
*Tracking How Law Evolves Using Multi-Model NLP*

- Adithya N Murthy
- Arjun R
- Priya M
- Karthik V

Department of Computer Science and Engineering
RV University, Bengaluru

Guide: Dr. Ramesh Kumar

**Visual:** Dark background, Glaw logo, subtle legal/tech imagery

---

## SLIDE 2: The Problem

**Legal language changes. Nobody tracks it.**

- Courts reinterpret laws every year — "right to privacy" meant something completely different before 2017
- 4.7 crore cases pending in Indian courts — lawyers can't read everything
- No tool exists that quantifies HOW MUCH a legal concept has changed
- Existing tools (Indian Kanoon, SCC Online) only search — they don't analyze evolution

**Key question:** *If a lawyer searches "dowry law changes in last 10 years" — where does he go?*

**Visual:** Timeline showing "Right to Privacy" before vs after Puttaswamy 2017

---

## SLIDE 3: Our Solution

**Glaw — One platform, two engines**

| Engine | What it does |
|--------|-------------|
| **Legal Intelligence (LCET)** | Tracks how legal concepts change meaning over decades |
| **Contract Analysis (AI Copilot)** | Analyzes contracts for risks using AI |

**For whom:**
- Lawyers — track changes in their practice area
- Judges — understand how precedent has shifted
- Law students — research how concepts evolved
- Law firms — analyze contracts before signing

**Visual:** Platform screenshot or architecture diagram showing both engines

---

## SLIDE 4: The Core Innovation — SMI

**Semantic Movement Index (SMI)**

*A number that tells you how much a legal concept has changed*

**Formula:**
```
SMI = 1 − cosine_similarity(avg_embedding_period1, avg_embedding_period2)
```

| SMI Value | What it means | Example |
|-----------|--------------|---------|
| 0.0 – 0.1 | STABLE — no change | "Due Process" in US |
| 0.1 – 0.3 | EXPANSION — scope broadened | "Free Speech" in India |
| 0.3 – 0.5 | CONTRACTION — scope narrowed | "Right to Privacy" post-Puttaswamy |
| 0.5 – 0.7 | BIFURCATION — meaning split | "Sedition" (S.124A debates) |
| 0.7 – 1.0 | MERGER — concepts converged | Rare |

**This metric does not exist anywhere else. We created it.**

**Visual:** Bar chart showing SMI values for 5 concepts

---

## SLIDE 5: Multi-Model NLP Pipeline

**4 AI models working together**

| Model | Parameters | Role |
|-------|-----------|------|
| LexLM Legal-RoBERTa-Large | 355M | Understands legal language (embeddings) |
| BGE-Large-EN-v1.5 | 335M | Powers semantic search |
| DeBERTa-v3-Large-MNLI | 400M | Classifies type of drift |
| GLiNER Large v2.1 | 1.7GB | Extracts judges, courts, statutes |

**Why 4 models?**
- LexLM + BGE = core (search + understanding)
- DeBERTa + GLiNER = analysis layer (classification + entity extraction)
- All lazy-loaded — only activated when needed

**Visual:** Pipeline flow diagram: Document → LexLM → Embeddings → SMI → DeBERTa → Classification

---

## SLIDE 6: Data — What We Collected

**120,000+ legal documents across 3 jurisdictions, 76 years**

| Source | Documents | Coverage |
|--------|-----------|----------|
| Indian Kanoon (scraper) | 120,000+ | Supreme Court + High Courts, 1950–2026 |
| HuggingFace Datasets | 120,415 | Indian SC + HC judgments |
| CourtListener API | 800 | US Federal Courts |
| HUDOC | 209,228 | European Court of Human Rights |

**42 legal concepts tracked** (15 US + 27 India)

**Indian Kanoon Scraper:** Async agent, 25 courts, resumes where it left off, runs independently

**Visual:** Map showing India, US, Europe with data flow arrows

---

## SLIDE 7: Platform Features

**6 features for legal professionals**

| # | Feature | What it does |
|---|---------|-------------|
| 1 | **Semantic Search** | Search any legal query — results ranked by AI relevance |
| 2 | **Evolution Timeline** | See how a concept changed decade by decade |
| 3 | **SMI Dashboard** | Get the exact drift score with confidence intervals |
| 4 | **Case Library** | Browse 120,000+ Indian court cases by court, year, topic |
| 5 | **Drift Alerts** | Set alerts — get notified when a concept shifts |
| 6 | **Contract Analysis** | Upload a contract → get risk score, issues, suggested edits |

**Visual:** 6 feature cards with icons, or screenshots of each page

---

## SLIDE 8: Tech Stack & Architecture

**Backend:** Python, FastAPI, SQLAlchemy, SQLite/PostgreSQL
**Frontend:** Next.js 14, React, Tailwind CSS, Three.js, D3.js
**ML:** PyTorch, HuggingFace Transformers, sentence-transformers
**DevOps:** Docker, Kubernetes, GitHub Actions CI/CD, Prometheus

**Architecture:**
```
┌─────────────────────────────────────┐
│         API Gateway (port 9000)     │
├──────────────┬──────────────────────┤
│ LCET Backend │  Contract Backend    │
│  (port 8000) │    (port 8001)       │
├──────────────┼──────────────────────┤
│ 4 NLP Models │  LLM Cascade         │
│ Scraper Agent│  (Groq→Gemini→CF)   │
├──────────────┴──────────────────────┤
│     SQLite / PostgreSQL / Redis     │
└─────────────────────────────────────┘
```

**Visual:** Clean architecture diagram

---

## SLIDE 9: Results

**SMI validates against known legal shifts**

| Concept | Jurisdiction | SMI | Classification |
|---------|-------------|-----|----------------|
| Right to Privacy | India | 0.34 | CONTRACTION ✓ (Puttaswamy 2017) |
| Sedition (S.124A) | India | 0.41 | CONTRACTION ✓ (constitutional challenges) |
| Due Process | US | 0.07 | STABLE ✓ (well-established) |
| Free Speech | US | 0.12 | EXPANSION ✓ (digital age expansion) |
| Fair Trial (Art. 6) | Europe | 0.09 | STABLE ✓ |

**Search:** BGE-Large achieves 0.78 Precision@10 (vs 0.62 for keyword search)

**Contract Analysis:** 87.6% F1 score on clause detection, 14 risk rules

**Visual:** Table with green checkmarks showing SMI matches known events

---

## SLIDE 10: Business Model

**Pricing (Razorpay integration)**

| | Free | Pro (₹499/mo) | Firm (₹2,999/mo) |
|---|---|---|---|
| Searches | 5/day | 100/day | Unlimited |
| Case Library | Browse only | Full text | Full text |
| Contract Analysis | 2 total | 25/month | 200/month |
| PDF Export | ✗ | ✓ | ✓ |
| Alerts | 1 | 10 | Unlimited |
| Team Members | 1 | 1 | 5 |

**Target market:** 1.7 million lawyers in India, 25,000+ law firms, 1,500+ law colleges

**Visual:** Pricing cards, market size numbers

---

## SLIDE 11: Future Scope

1. **Hindi & Regional Language Support** — Most district court judgments are in Hindi
2. **AI Case Summarization** — LLM-generated 3-line summaries per judgment
3. **Real-Time Drift Detection** — Continuous monitoring as new judgments are published
4. **Citation Graph Analysis** — Track how cases influence each other
5. **Mobile App** — Lawyers use phones in court
6. **Fine-tuned Indian Legal Model** — Train LexLM specifically on Indian legal corpus

**Vision:** Become the go-to legal intelligence platform for Indian legal professionals

**Visual:** Roadmap timeline showing Q1–Q4 milestones

---

## SLIDE 12: Thank You & Demo

**GLAW — AI-Powered Legal Intelligence Platform**

*"Understand the law. Analyze your documents. Stay ahead of changes."*

**Live Demo:** localhost:3000 (or deployed URL)

**Team:**
- Adithya N Murthy — Team Lead & Full Stack
- Arjun R — Backend & ML
- Priya M — Frontend & UI/UX
- Karthik V — Data & DevOps

**Guide:** Dr. Ramesh Kumar

*Questions?*

**Visual:** QR code to the platform, team photo placeholder

---

## DESIGN NOTES

- **Theme:** Dark navy background (#0a0e1a), white text, brand blue (#3b82f6) accents
- **Font:** Inter or Poppins
- **Each slide:** Maximum 6-7 bullet points, one visual element
- **Animations:** Minimal — fade in only
- **Slide size:** 16:9 widescreen
