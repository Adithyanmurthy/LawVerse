"""
Indian Kanoon Web Scraping Agent
================================
High-performance scraper for indiankanoon.org.
Scrapes judgments from Supreme Court + High Courts (1950-2026),
stores in SQLite database, and auto-integrates with the LCET pipeline.

Usage:
    python -m scraper.agent                    # Run full scraper
    python -m scraper.agent --court supremecourt --years 2020-2026
    python -m scraper.agent --concept "dowry"  # Search-based scraping
    python -m scraper.agent --status           # Show scraping progress
"""
import asyncio, aiohttp, json, re, time, sqlite3, pathlib, sys, argparse, ssl
import certifi
from dataclasses import dataclass
from bs4 import BeautifulSoup
from loguru import logger

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
from config.settings import DATA_DIR

# ── Configuration ──
DB_PATH = DATA_DIR / "indian_kanoon.db"
CORPUS_DIR = DATA_DIR / "corpus"
BASE_URL = "https://indiankanoon.org"
MAX_CONCURRENT = 5  # Respectful concurrency
DELAY_BETWEEN_REQUESTS = 0.8  # seconds
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

COURTS = [
    "supremecourt", "delhi", "bombay", "kolkata", "allahabad",
    "madras", "karnataka", "gujarat", "kerala", "punjab",
    "himachal_pradesh", "chattisgarh", "gauhati", "jammu",
    "jharkhand", "madhya_pradesh", "orissa", "patna",
    "rajasthan", "uttaranchal", "andhra", "amravati", "telangana",
]

INDIAN_LEGAL_CONCEPTS = [
    "right to life", "right to equality", "freedom of speech",
    "right to privacy", "due process", "natural justice",
    "anticipatory bail", "dowry", "cruelty section 498a",
    "sedition", "defamation", "contempt of court",
    "judicial review", "fundamental rights", "reasonable restriction",
    "right to education", "right to information", "environmental law",
    "consumer protection", "arbitration", "specific performance",
    "negligence", "breach of contract", "intellectual property",
    "cyber crime", "money laundering", "prevention of corruption",
]


@dataclass
class ScrapedDoc:
    doc_id: str
    case_name: str
    text: str
    date: str
    court: str
    url: str
    citations: list


# ── Database Layer ──

def init_db():
    """Initialize the scraper database."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            doc_id TEXT UNIQUE NOT NULL,
            case_name TEXT,
            text TEXT,
            date TEXT,
            year INTEGER,
            decade TEXT,
            court TEXT,
            jurisdiction TEXT DEFAULT 'India',
            source TEXT DEFAULT 'indiankanoon',
            url TEXT,
            citations TEXT,
            word_count INTEGER,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            processed INTEGER DEFAULT 0
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS scrape_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            court TEXT,
            year INTEGER,
            page INTEGER,
            completed INTEGER DEFAULT 0,
            doc_count INTEGER DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(court, year, page)
        )
    """)
    conn.execute("CREATE INDEX IF NOT EXISTS idx_doc_year ON documents(year)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_doc_court ON documents(court)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_doc_processed ON documents(processed)")
    conn.commit()
    conn.close()
    logger.info(f"Database initialized: {DB_PATH}")


def save_document(doc: ScrapedDoc):
    """Save a scraped document to the database."""
    conn = sqlite3.connect(str(DB_PATH))
    year = None
    if doc.date:
        m = re.search(r'(1[89]\d{2}|20[0-2]\d)', doc.date)
        if m:
            year = int(m.group(1))
    decade = f"{(year // 10) * 10}s" if year else None
    word_count = len(doc.text.split())

    try:
        conn.execute("""
            INSERT OR IGNORE INTO documents 
            (doc_id, case_name, text, date, year, decade, court, url, citations, word_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            doc.doc_id, doc.case_name, doc.text, doc.date,
            year, decade, doc.court, doc.url,
            json.dumps(doc.citations), word_count,
        ))
        conn.commit()
    except sqlite3.IntegrityError:
        pass  # Already exists
    finally:
        conn.close()


def mark_progress(court: str, year: int, page: int, doc_count: int):
    conn = sqlite3.connect(str(DB_PATH))
    conn.execute("""
        INSERT OR REPLACE INTO scrape_progress (court, year, page, completed, doc_count, updated_at)
        VALUES (?, ?, ?, 1, ?, CURRENT_TIMESTAMP)
    """, (court, year, page, doc_count))
    conn.commit()
    conn.close()


def is_page_done(court: str, year: int, page: int) -> bool:
    conn = sqlite3.connect(str(DB_PATH))
    row = conn.execute(
        "SELECT completed FROM scrape_progress WHERE court=? AND year=? AND page=?",
        (court, year, page)
    ).fetchone()
    conn.close()
    return bool(row and row[0])


def get_stats() -> dict:
    conn = sqlite3.connect(str(DB_PATH))
    total = conn.execute("SELECT COUNT(*) FROM documents").fetchone()[0]
    by_court = conn.execute(
        "SELECT court, COUNT(*) FROM documents GROUP BY court ORDER BY COUNT(*) DESC"
    ).fetchall()
    by_decade = conn.execute(
        "SELECT decade, COUNT(*) FROM documents WHERE decade IS NOT NULL GROUP BY decade ORDER BY decade"
    ).fetchall()
    unprocessed = conn.execute("SELECT COUNT(*) FROM documents WHERE processed=0").fetchone()[0]
    conn.close()
    return {
        "total_documents": total,
        "unprocessed": unprocessed,
        "by_court": dict(by_court),
        "by_decade": dict(by_decade),
    }


# ── Scraping Engine ──

async def fetch_page(session: aiohttp.ClientSession, url: str) -> str | None:
    """Fetch a page with retry logic."""
    headers = {"User-Agent": USER_AGENT}
    for attempt in range(3):
        try:
            async with session.get(url, headers=headers, timeout=20) as resp:
                if resp.status == 200:
                    return await resp.text()
                elif resp.status == 429:
                    wait = 10 * (attempt + 1)
                    logger.warning(f"Rate limited, waiting {wait}s...")
                    await asyncio.sleep(wait)
                else:
                    return None
        except (aiohttp.ClientError, asyncio.TimeoutError):
            await asyncio.sleep(2 * (attempt + 1))
    return None


def parse_search_results(html: str) -> list[dict]:
    """Parse Indian Kanoon search results page."""
    soup = BeautifulSoup(html, "lxml")
    results = []
    # Each result has .result_title (with case name) and a /doc/ link
    result_titles = soup.select(".result_title")
    for title_el in result_titles:
        # The title link contains case name
        title_link = title_el.find("a")
        if not title_link:
            continue
        title = title_link.get_text(strip=True)
        # Find the corresponding /doc/ link (sibling or nearby)
        parent = title_el.parent
        doc_link = parent.find("a", href=re.compile(r"/doc/\d+")) if parent else None
        if not doc_link:
            # Try finding in the fragment URL
            frag_href = title_link.get("href", "")
            doc_match = re.search(r"/docfragment/(\d+)/", frag_href)
            if doc_match:
                doc_id = doc_match.group(1)
            else:
                continue
        else:
            doc_id_match = re.search(r"/doc/(\d+)", doc_link.get("href", ""))
            doc_id = doc_id_match.group(1) if doc_id_match else ""

        if not doc_id:
            continue

        results.append({
            "url": f"{BASE_URL}/doc/{doc_id}/",
            "doc_id": doc_id,
            "title": title,
            "snippet": "",
        })
    return results


def parse_document(html: str, url: str) -> ScrapedDoc | None:
    """Parse a full Indian Kanoon document page."""
    soup = BeautifulSoup(html, "lxml")

    # Extract title (case name + date)
    title_el = soup.select_one(".doc_title")
    title = title_el.get_text(strip=True) if title_el else ""

    # Extract court
    court_el = soup.select_one(".docsource_main")
    court = court_el.get_text(strip=True) if court_el else "Indian Courts"

    # Extract judgment text
    judgment_el = soup.select_one(".judgments")
    if not judgment_el:
        judgment_el = soup.select_one("#jd, .doc_content")
    if not judgment_el:
        return None

    text = judgment_el.get_text(separator=" ", strip=True)
    if len(text.split()) < 50:
        return None

    # Extract date from title (e.g., "... on 18 July, 2019")
    date = ""
    date_match = re.search(r'on\s+(\d{1,2}\s+\w+,?\s+\d{4})', title)
    if date_match:
        date = date_match.group(1)

    # Extract Indian citations
    cite_pattern = re.compile(
        r'\(\d{4}\)\s+\d+\s+SCC\s+\d+|'
        r'AIR\s+\d{4}\s+SC\s+\d+|'
        r'\d{4}\s+\(\d+\)\s+SCC\s+\d+|'
        r'\d{4}\s+SCC\s+OnLine\s+SC\s+\d+|'
        r'\[\d{4}\]\s+\d+\s+SCR\s+\d+'
    )
    citations = cite_pattern.findall(text)

    doc_id_match = re.search(r"/doc/(\d+)", url)
    doc_id = f"ik_{doc_id_match.group(1)}" if doc_id_match else f"ik_{hash(url) % 10**9}"

    return ScrapedDoc(
        doc_id=doc_id,
        case_name=title[:500],
        text=text[:100000],
        date=date,
        court=court,
        url=url,
        citations=citations[:50],
    )


async def scrape_by_court_year(session: aiohttp.ClientSession, court: str, year: int, max_pages: int = 10):
    """Scrape all documents for a given court and year."""
    docs_saved = 0
    for page in range(max_pages):
        if is_page_done(court, year, page):
            continue

        search_url = f"{BASE_URL}/search/?formInput=doctypes%3A+{court}+year%3A+{year}&pagenum={page}"
        html = await fetch_page(session, search_url)
        if not html:
            break

        results = parse_search_results(html)
        if not results:
            break

        for result in results:
            if not result["doc_id"]:
                continue
            # Check if already in DB
            conn = sqlite3.connect(str(DB_PATH))
            exists = conn.execute(
                "SELECT 1 FROM documents WHERE doc_id=?", (f"ik_{result['doc_id']}",)
            ).fetchone()
            conn.close()
            if exists:
                continue

            await asyncio.sleep(DELAY_BETWEEN_REQUESTS)
            doc_html = await fetch_page(session, result["url"])
            if not doc_html:
                continue

            doc = parse_document(doc_html, result["url"])
            if doc:
                save_document(doc)
                docs_saved += 1

        mark_progress(court, year, page, docs_saved)
        await asyncio.sleep(DELAY_BETWEEN_REQUESTS)

    if docs_saved > 0:
        logger.info(f"  {court}/{year}: {docs_saved} new docs")
    return docs_saved


async def scrape_by_concept(session: aiohttp.ClientSession, concept: str, max_pages: int = 5):
    """Scrape documents related to a specific legal concept."""
    docs_saved = 0
    for page in range(max_pages):
        search_url = f"{BASE_URL}/search/?formInput={concept.replace(' ', '+')}&pagenum={page}"
        html = await fetch_page(session, search_url)
        if not html:
            break

        results = parse_search_results(html)
        if not results:
            break

        for result in results:
            if not result["doc_id"]:
                continue
            conn = sqlite3.connect(str(DB_PATH))
            exists = conn.execute(
                "SELECT 1 FROM documents WHERE doc_id=?", (f"ik_{result['doc_id']}",)
            ).fetchone()
            conn.close()
            if exists:
                continue

            await asyncio.sleep(DELAY_BETWEEN_REQUESTS)
            doc_html = await fetch_page(session, result["url"])
            if not doc_html:
                continue

            doc = parse_document(doc_html, result["url"])
            if doc:
                save_document(doc)
                docs_saved += 1

        await asyncio.sleep(DELAY_BETWEEN_REQUESTS)

    if docs_saved > 0:
        logger.info(f"  Concept '{concept}': {docs_saved} new docs")
    return docs_saved


# ── Export to LCET Pipeline ──

def export_to_corpus():
    """Export scraped Indian Kanoon data to the LCET corpus format."""
    conn = sqlite3.connect(str(DB_PATH))
    rows = conn.execute(
        "SELECT doc_id, case_name, text, date, year, decade, court, citations, word_count "
        "FROM documents WHERE processed=0 AND word_count >= 50"
    ).fetchall()
    conn.close()

    if not rows:
        logger.info("No new documents to export")
        return 0

    CORPUS_DIR.mkdir(parents=True, exist_ok=True)
    corpus_path = CORPUS_DIR / "corpus_indian_kanoon.jsonl"

    # Append to existing file
    with open(corpus_path, "a") as f:
        for row in rows:
            doc = {
                "id": row[0],
                "case_name": row[1],
                "text": row[2],
                "date": row[3] or "",
                "year": row[4],
                "decade": row[5] or "",
                "court": row[6] or "Indian Courts",
                "jurisdiction": "India",
                "source": "indiankanoon",
                "citations": json.loads(row[7]) if row[7] else [],
                "word_count": row[8],
            }
            f.write(json.dumps(doc) + "\n")

    # Mark as processed
    conn = sqlite3.connect(str(DB_PATH))
    conn.execute("UPDATE documents SET processed=1 WHERE processed=0 AND word_count >= 50")
    conn.commit()
    conn.close()

    logger.info(f"Exported {len(rows)} docs → {corpus_path.name}")
    return len(rows)


# ── Main Agent Runner ──

async def run_agent(courts: list[str] | None = None, years: range | None = None,
                    concepts: list[str] | None = None, max_pages: int = 10):
    """Main scraping agent — runs continuously until all targets are scraped."""
    init_db()

    courts = courts or COURTS
    years = years or range(1950, 2027)  # Default: 1950-2026 (full history)
    concepts = concepts or INDIAN_LEGAL_CONCEPTS

    logger.info(f"🚀 Indian Kanoon Scraping Agent Started")
    logger.info(f"   Courts: {len(courts)} | Years: {years.start}-{years.stop-1} | Concepts: {len(concepts)}")

    connector = aiohttp.TCPConnector(limit=MAX_CONCURRENT, ssl=ssl.create_default_context(cafile=certifi.where()))
    async with aiohttp.ClientSession(connector=connector) as session:
        # Phase 1: Scrape by court + year (systematic coverage)
        logger.info("── Phase 1: Court + Year systematic scraping ──")
        total = 0
        for court in courts:
            for year in years:
                count = await scrape_by_court_year(session, court, year, max_pages)
                total += count

        # Phase 2: Scrape by concept (targeted for LCET features)
        logger.info("── Phase 2: Concept-based targeted scraping ──")
        for concept in concepts:
            count = await scrape_by_concept(session, concept, max_pages=3)
            total += count

    # Phase 3: Export to corpus
    logger.info("── Phase 3: Exporting to LCET corpus ──")
    exported = export_to_corpus()

    stats = get_stats()
    logger.info(f"✅ Agent complete. Total in DB: {stats['total_documents']} | New this run: {total} | Exported: {exported}")
    return stats


def show_status():
    """Show current scraping progress."""
    if not DB_PATH.exists():
        print("No database found. Run the agent first.")
        return
    stats = get_stats()
    print(f"\n{'='*50}")
    print(f"  Indian Kanoon Scraper Status")
    print(f"{'='*50}")
    print(f"  Total documents: {stats['total_documents']:,}")
    print(f"  Unprocessed:     {stats['unprocessed']:,}")
    print(f"\n  By Court:")
    for court, count in list(stats['by_court'].items())[:10]:
        print(f"    {court}: {count:,}")
    print(f"\n  By Decade:")
    for decade, count in stats['by_decade'].items():
        print(f"    {decade}: {count:,}")
    print(f"{'='*50}\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Indian Kanoon Scraping Agent")
    parser.add_argument("--court", type=str, help="Specific court to scrape (e.g., supremecourt)")
    parser.add_argument("--years", type=str, help="Year range (e.g., 2020-2026)")
    parser.add_argument("--concept", type=str, help="Specific concept to search")
    parser.add_argument("--max-pages", type=int, default=10, help="Max pages per court/year")
    parser.add_argument("--status", action="store_true", help="Show scraping progress")
    parser.add_argument("--export", action="store_true", help="Export to corpus only")
    args = parser.parse_args()

    if args.status:
        show_status()
    elif args.export:
        init_db()
        export_to_corpus()
    else:
        courts = [args.court] if args.court else None
        years = None
        if args.years:
            parts = args.years.split("-")
            years = range(int(parts[0]), int(parts[1]) + 1)
        concepts = [args.concept] if args.concept else None

        asyncio.run(run_agent(courts=courts, years=years, concepts=concepts, max_pages=args.max_pages))
