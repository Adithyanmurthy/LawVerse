# Indian Kanoon Web Scraping Agent — Complete Documentation

## Overview

The Indian Kanoon Scraping Agent is an autonomous, high-performance web scraper built to collect Indian court judgments from [indiankanoon.org](https://indiankanoon.org). It operates independently of the main platform and feeds data into the LexiVerse pipeline.

---

## Why We Built It

Indian Kanoon is the largest free Indian legal search engine, containing millions of judgments from:
- Supreme Court of India (1950–2026)
- All 25 High Courts
- District Courts and Tribunals

However, Indian Kanoon has no public API (only a paid one). To build our legal intelligence platform, we needed this data in our own database. The scraper solves this by systematically collecting judgments and storing them locally.

---

## Architecture

```
┌─────────────────────────────────────────┐
│         Scraping Agent                  │
│         (scraper/agent.py)              │
│                                         │
│  ┌──────────┐    ┌──────────────────┐  │
│  │ Search    │───▶│ Document Parser  │  │
│  │ Parser    │    │ (full text)      │  │
│  └──────────┘    └────────┬─────────┘  │
│                           │             │
│                  ┌────────▼─────────┐  │
│                  │ SQLite Database   │  │
│                  │ indian_kanoon.db  │  │
│                  └────────┬─────────┘  │
│                           │             │
│                  ┌────────▼─────────┐  │
│                  │ Corpus Exporter   │  │
│                  │ → corpus_indian_  │  │
│                  │   kanoon.jsonl    │  │
│                  └──────────────────┘  │
└─────────────────────────────────────────┘
```

---

## How It Works — Step by Step

### Step 1: Search Page Scraping

The agent constructs search URLs for each court + year combination:

```
https://indiankanoon.org/search/?formInput=doctypes:+supremecourt+year:+2020&pagenum=0
```

It parses the search results page using BeautifulSoup, extracting:
- Case title (from `.result_title` CSS class)
- Document ID (from `/docfragment/{id}/` URL pattern)
- Document URL (constructed as `https://indiankanoon.org/doc/{id}/`)

Each search page returns ~10 results. The agent paginates through up to 10 pages per court/year.

### Step 2: Document Fetching

For each document found in search results, the agent:
1. Checks if the document already exists in the database (by `doc_id`)
2. If not, fetches the full document page
3. Waits 0.8 seconds between requests (rate limiting)

### Step 3: Document Parsing

From each document page, the agent extracts:

| Field | CSS Selector | Example |
|-------|-------------|---------|
| Case name | `.doc_title` | "R. Rajagopal vs State Of T.N on 7 October, 1994" |
| Court | `.docsource_main` | "Supreme Court of India" |
| Judgment text | `.judgments` | Full judgment text (up to 100K chars) |
| Date | Regex from title | "7 October, 1994" |
| Citations | Regex patterns | "(1994) 6 SCC 632", "AIR 1963 SC 1295" |

**Citation patterns recognized:**
- `(YYYY) N SCC NNN` — Supreme Court Cases
- `AIR YYYY SC NNN` — All India Reporter
- `YYYY (N) SCC NNN` — Alternate SCC format
- `YYYY SCC OnLine SC NNN` — Online SCC
- `[YYYY] N SCR NNN` — Supreme Court Reports

### Step 4: Database Storage

Each document is stored in SQLite (`data/indian_kanoon.db`) with:

```sql
CREATE TABLE documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doc_id TEXT UNIQUE NOT NULL,        -- e.g., "ik_127491001"
    case_name TEXT,                      -- "Wasim vs State Nct Of Delhi..."
    text TEXT,                           -- Full judgment text
    date TEXT,                           -- "18 July, 2019"
    year INTEGER,                        -- 2019
    decade TEXT,                         -- "2010s"
    court TEXT,                          -- "Supreme Court of India"
    jurisdiction TEXT DEFAULT 'India',
    source TEXT DEFAULT 'indiankanoon',
    url TEXT,                            -- Original URL
    citations TEXT,                      -- JSON array of citations
    word_count INTEGER,
    scraped_at TIMESTAMP,
    processed INTEGER DEFAULT 0          -- 0=new, 1=exported to corpus
);
```

**Progress tracking table:**
```sql
CREATE TABLE scrape_progress (
    court TEXT,
    year INTEGER,
    page INTEGER,
    completed INTEGER DEFAULT 0,
    doc_count INTEGER DEFAULT 0,
    UNIQUE(court, year, page)
);
```

### Step 5: Export to Corpus

When `--export` is run, the agent:
1. Reads all unprocessed documents (where `processed=0`)
2. Converts them to the LCET corpus JSONL format
3. Appends to `data/corpus/corpus_indian_kanoon.jsonl`
4. Marks documents as `processed=1`

---

## Scraping Strategy

### Phase 1: Court + Year Systematic Scraping

The agent iterates through every combination of:
- **25 courts** × **76 years** (1950–2026) × **up to 10 pages each**
- Total potential: 25 × 76 × 10 = 19,000 search pages
- At ~10 docs per page = up to 190,000 documents

### Phase 2: Concept-Based Targeted Scraping

After systematic scraping, the agent searches for 27 specific Indian legal concepts:
- right to life, right to equality, freedom of speech, right to privacy
- due process, natural justice, anticipatory bail, dowry
- cruelty section 498a, sedition, defamation, contempt of court
- judicial review, fundamental rights, reasonable restriction
- right to education, right to information, environmental law
- consumer protection, arbitration, specific performance
- negligence, breach of contract, intellectual property
- cyber crime, money laundering, prevention of corruption

This ensures we have documents specifically relevant to the concepts we track.

---

## Technical Details

### Async Architecture

The agent uses Python's `asyncio` with `aiohttp` for non-blocking HTTP requests:
- **5 concurrent connections** (respectful limit)
- **0.8 second delay** between requests
- **Retry logic**: 3 attempts per request with exponential backoff
- **Rate limit handling**: If HTTP 429 received, waits 10/20/30 seconds

### SSL Certificate Fix

On macOS with Python 3.14, the default SSL certificates are not found. The agent uses `certifi` to provide the certificate bundle:

```python
import ssl, certifi
ssl_ctx = ssl.create_default_context(cafile=certifi.where())
connector = aiohttp.TCPConnector(limit=5, ssl=ssl_ctx)
```

### Resume Capability

The agent tracks progress in the `scrape_progress` table. When restarted:
1. Checks which court/year/page combinations are already completed
2. Skips completed ones
3. Continues from where it left off

This means you can stop the agent anytime (`Ctrl+C`) and restart it without losing progress or re-scraping.

### Deduplication

Before fetching a document, the agent checks:
```sql
SELECT 1 FROM documents WHERE doc_id = ?
```
If the document already exists, it's skipped. This prevents duplicates even if the same document appears in multiple search results.

---

## Courts Covered (25 Total)

| # | Court | Code |
|---|-------|------|
| 1 | Supreme Court of India | `supremecourt` |
| 2 | Delhi High Court | `delhi` |
| 3 | Bombay High Court | `bombay` |
| 4 | Calcutta High Court | `kolkata` |
| 5 | Allahabad High Court | `allahabad` |
| 6 | Madras High Court | `madras` |
| 7 | Karnataka High Court | `karnataka` |
| 8 | Gujarat High Court | `gujarat` |
| 9 | Kerala High Court | `kerala` |
| 10 | Punjab & Haryana High Court | `punjab` |
| 11 | Himachal Pradesh High Court | `himachal_pradesh` |
| 12 | Chhattisgarh High Court | `chattisgarh` |
| 13 | Gauhati High Court | `gauhati` |
| 14 | Jammu & Kashmir High Court | `jammu` |
| 15 | Jharkhand High Court | `jharkhand` |
| 16 | Madhya Pradesh High Court | `madhya_pradesh` |
| 17 | Orissa High Court | `orissa` |
| 18 | Patna High Court | `patna` |
| 19 | Rajasthan High Court | `rajasthan` |
| 20 | Uttarakhand High Court | `uttaranchal` |
| 21 | Andhra Pradesh High Court (pre-Telangana) | `andhra` |
| 22 | Andhra Pradesh High Court (Amravati) | `amravati` |
| 23 | Telangana High Court | `telangana` |

---

## Commands

```bash
# Navigate to project
cd "/Users/adithyan/Desktop/Glaw/legal_new copy"

# Run full scraper (all courts, 1950-2026, all concepts)
python3 -m scraper

# Scrape specific court and year range
python3 -m scraper.agent --court supremecourt --years 2020-2026

# Scrape by legal concept
python3 -m scraper.agent --concept "dowry"

# Check scraping progress
python3 -m scraper --status

# Export scraped data to corpus format
python3 -m scraper --export

# Limit pages per court/year
python3 -m scraper.agent --max-pages 5
```

---

## Output Format

### Database Record Example

```json
{
  "doc_id": "ik_127491001",
  "case_name": "Wasim vs State Nct Of Delhi on 18 July, 2019",
  "text": "Supreme Court of India Wasim vs State Nct Of Delhi on 18 July, 2019 Equivalent citations: ...",
  "date": "18 July, 2019",
  "year": 2019,
  "decade": "2010s",
  "court": "Supreme Court of India",
  "jurisdiction": "India",
  "source": "indiankanoon",
  "url": "https://indiankanoon.org/doc/127491001/",
  "citations": ["1994 (6) SCC 632", "AIR 1963 SC 1295", "(1975) 2 SCC 148"],
  "word_count": 7982
}
```

### Corpus JSONL Export Format

Same as above, compatible with the LCET preprocessor pipeline.

---

## Performance

- **Speed**: ~1.2 documents per second (limited by rate limiting, not by code)
- **Storage**: ~5-10 KB per document average
- **First run estimate**: 42-50 hours for complete coverage (all courts, all years)
- **Incremental runs**: Only fetches new documents — minutes to hours depending on new content

---

## Integration with LexiVerse

```
Scraper Agent → indian_kanoon.db → Export → corpus_indian_kanoon.jsonl
                                              ↓
                                    Preprocessor → corpus.jsonl
                                              ↓
                                    Indexer → embeddings/{concept}.json
                                              ↓
                                    Backend API → Frontend
```

The scraper feeds into the same pipeline as all other data sources. Once exported and reprocessed, scraped cases appear in:
- Semantic Search results
- Concept Evolution Timeline
- SMI Dashboard calculations
- Case Library (directly from scraper database)

---

*The scraper agent is located at `legal_new copy/scraper/agent.py` and can be run independently of the main platform.*
