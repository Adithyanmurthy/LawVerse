<div align="center">

# ⚖️ LawVerse

### AI-Powered Legal Intelligence Platform

**Track how law evolves. Analyze contracts. Search 116,000+ cases.**

[![Built with Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=flat-square)](https://nextjs.org/)
[![Built with FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/ML-PyTorch-EE4C2C?style=flat-square)](https://pytorch.org/)
[![HuggingFace](https://img.shields.io/badge/Models-HuggingFace-FFD21E?style=flat-square)](https://huggingface.co/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](#)

[Live Demo](#) · [Documentation](platform/docs/COMPLETE_PROJECT_DOCUMENTATION.md) · [Research Paper](platform/docs/RESEARCH_PAPER.md)

</div>

---

## What is LawVerse?

LawVerse is a unified legal intelligence platform that combines **legal research** and **contract analysis** into one product. It uses 4 AI models to understand legal text at a deep semantic level.

| Feature | Description |
|---------|-------------|
| 🔍 **Semantic Search** | Search 116,000+ legal documents in natural language |
| 📊 **Concept Timeline** | Track how 25 legal concepts changed meaning across decades |
| 📈 **SMI Dashboard** | Quantify semantic drift with our novel Semantic Movement Index |
| 📚 **Case Library** | Browse Indian Supreme Court & High Court cases (1950–2026) |
| 📋 **Contract Analysis** | Upload contracts, get AI-powered risk scoring & suggested edits |
| 🔔 **Drift Alerts** | Monitor legal concepts and get notified when meanings shift |

---

## The Problem

- **4.7 crore cases** pending in Indian courts — lawyers can't read everything
- Legal language changes over time, but no tool measures HOW MUCH
- Contract review is manual, slow, and expensive
- Existing tools (Indian Kanoon, SCC Online) search but don't analyze evolution

## Our Solution

A platform that **quantifies legal change** using a novel metric (SMI) and **automates contract review** using LLMs — all in one place.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│           LawVerse Frontend (Next.js 14)        │
│           Port 3001                             │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│           API Gateway (FastAPI)                 │
│           Port 9000                             │
├─────────────────┬───────────────────────────────┤
│  /api/lcet/*    │    /api/contract/*            │
│       │         │          │                    │
│  LCET Backend   │   Contract Backend            │
│  (Port 8000)    │   (Port 8001)                 │
│  4 NLP Models   │   3 LLM Providers             │
├─────────────────┴───────────────────────────────┤
│              Data Layer                          │
│  116,379 documents · 160M words · 3 jurisdictions│
└─────────────────────────────────────────────────┘
```

---

## AI Models

### NLP Pipeline (Legal Research)

| Model | Parameters | Purpose |
|-------|-----------|---------|
| **LexLM Legal-RoBERTa-Large** | 355M | Domain-specific legal embeddings |
| **BGE-Large-EN-v1.5** | 335M | Semantic search & retrieval |
| **DeBERTa-v3-Large-MNLI** | 400M | Zero-shot drift classification |
| **GLiNER Large v2.1** | 1.7GB | Zero-shot legal entity extraction |

### LLM Cascade (Contract Analysis)

| Priority | Provider | Model |
|----------|----------|-------|
| 1st | Groq | Llama-3.3-70B |
| 2nd | Google Gemini | 1.5 Flash |
| 3rd | Cloudflare | Llama-3.1-8B |

---

## Semantic Movement Index (SMI)

Our **novel metric** that quantifies how much a legal concept's meaning has changed:

```
SMI = 1 − cosine_similarity(centroid_period1, centroid_period2)
```

| SMI Range | Classification | Meaning |
|-----------|---------------|---------|
| 0.0 – 0.1 | STABLE | No change |
| 0.1 – 0.3 | EXPANSION | Scope broadened |
| 0.3 – 0.5 | CONTRACTION | Scope narrowed |
| 0.5 – 0.7 | BIFURCATION | Meaning split |
| 0.7 – 1.0 | MERGER | Major semantic shift |

---

## Data

| Source | Documents | Jurisdiction | Period |
|--------|-----------|-------------|--------|
| HuggingFace Datasets | 120,415 | India | 1800s–2020s |
| CourtListener API | 800 | United States | 2020s |
| HUDOC | 209,228 available | Europe (ECHR) | 1959–2026 |
| Indian Kanoon Scraper | Growing | India | 1950–2026 |
| **Total Corpus** | **116,379** | **3 jurisdictions** | **200+ years** |

### 25 Legal Concepts Tracked

`due process` · `equal protection` · `free speech` · `privacy` · `search and seizure` · `probable cause` · `reasonable doubt` · `negligence` · `breach of contract` · `fiduciary duty` · `right to life` · `freedom of expression` · `fair trial` · `habeas corpus` · `judicial review` · `dowry` · `bail` · `sedition` · `defamation` · `contempt of court` · `arbitration` · `consumer protection` · `right to education` · `environmental law` · `cyber crime`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Inline CSS |
| Gateway | FastAPI, httpx |
| LCET Backend | FastAPI, SQLAlchemy, SQLite, PyTorch, Transformers |
| Contract Backend | FastAPI, SQLAlchemy, SQLite, Groq, Gemini |
| Scraper | asyncio, aiohttp, BeautifulSoup |
| Payments | Razorpay (INR) |
| DevOps | Docker, Kubernetes, GitHub Actions |

---

## Quick Start

### Prerequisites
- Python 3.12+
- Node.js 20+
- ~6GB disk space (for AI models)

### Run Everything (One Command)

```bash
cd platform
./start.sh
```

This starts:
- LCET Backend → http://localhost:8000
- Contract Backend → http://localhost:8001
- API Gateway → http://localhost:9000
- Frontend → http://localhost:3001

### Run the Scraper (Optional)

```bash
cd "legal_new copy"
python3 -m scraper          # Scrape Indian Kanoon
python3 -m scraper --status # Check progress
```

---

## Project Structure

```
LawVerse/
├── AI Laywer/              # Contract analysis project
│   ├── backend/            # FastAPI + Groq/Gemini LLMs
│   ├── frontend/           # Original contract UI
│   ├── docs/               # Documentation
│   └── scripts/            # Setup scripts
│
├── legal_new copy/         # Legal intelligence project (LCET)
│   ├── backend/            # FastAPI + 4 NLP models
│   ├── frontend/           # Original LCET UI
│   ├── config/             # Settings, API keys
│   ├── data/               # Corpus, embeddings, databases
│   ├── model/              # ML models, SMI computation
│   ├── scraper/            # Indian Kanoon scraping agent
│   ├── devops/             # Docker, K8s, monitoring
│   └── scripts/            # Pipeline scripts
│
└── platform/               # Unified platform
    ├── gateway/            # API gateway (connects both backends)
    ├── frontend/           # Unified LawVerse frontend
    ├── docs/               # Reports, papers, presentations
    └── start.sh            # One-command startup
```

---

## Pricing

| | Free | Professional (₹499/mo) | Law Firm (₹2,999/mo) |
|---|---|---|---|
| Semantic Search | 5/day | 100/day | Unlimited |
| Concept Timeline | ✓ | ✓ | ✓ |
| Case Library | Browse | Full text | Full text |
| Contract Analysis | 2 total | 25/month | 200/month |
| Drift Alerts | 1 | 10 | Unlimited |
| PDF Export | ✗ | ✓ | ✓ |

---

## Documentation

| Document | Description |
|----------|-------------|
| [Complete Documentation](platform/docs/COMPLETE_PROJECT_DOCUMENTATION.md) | Everything about the project |
| [Research Paper (IEEE)](platform/docs/research_paper.txt) | Academic paper in IEEE format |
| [Research Paper (ICML)](platform/docs/RESEARCH_PAPER.md) | Academic paper in ICML format |
| [Project Report](platform/docs/PROJECT_REPORT.md) | 28-page academic report |
| [Presentation Guide](platform/docs/PRESENTATION_SLIDES.md) | 12-slide PPT content |
| [Scraper Documentation](platform/docs/SCRAPER_DOCUMENTATION.md) | Web scraping agent details |

---

## Team

| Name | Role |
|------|------|
| **Adithya N Murthy** | Team Lead & Full Stack Developer |
| **ABhishek Biradar** | Backend Developer & ML Engineer |
| **Ajay Kumar T N** | Frontend Developer & UI/UX Designer |
| **Aniketh Chakravarthy** | Data Engineer & DevOps |

**Guide:** Dr. Ramesh Kumar, Professor, Department of CSE

**Institution:** RV University, Bengaluru

---

<div align="center">

**Built with ❤️ for the legal community**

*LawVerse — Legal Intelligence, Reimagined*

</div>
