"""Data downloaders — CourtListener (v4 search+opinions), HUDOC, LiveLaw."""
import requests, time, json, pathlib
from bs4 import BeautifulSoup
from loguru import logger
from config.settings import COURTLISTENER_TOKEN, RAW_DIR


class CourtListenerDownloader:
    """Download US court opinions via CourtListener v4 search + opinions API."""

    COURTS = {"scotus": 200, "ca1": 100, "ca2": 100, "ca3": 100,
              "ca4": 100, "ca5": 100, "ca6": 100}
    SEARCH_URL = "https://www.courtlistener.com/api/rest/v4/search/"
    OPINION_URL = "https://www.courtlistener.com/api/rest/v4/opinions/"

    def __init__(self):
        self.session = requests.Session()
        if COURTLISTENER_TOKEN and "YOUR_" not in COURTLISTENER_TOKEN:
            self.session.headers["Authorization"] = f"Token {COURTLISTENER_TOKEN}"

    def download(self, out_dir: pathlib.Path | None = None):
        out_dir = out_dir or RAW_DIR / "courtlistener"
        out_dir.mkdir(parents=True, exist_ok=True)
        for court, limit in self.COURTS.items():
            path = out_dir / f"{court}.jsonl"
            if path.exists() and path.stat().st_size > 100:
                logger.info(f"Skipping {court} — already downloaded")
                continue
            logger.info(f"Downloading {court} (limit {limit})...")
            docs = self._fetch_court(court, limit)
            with open(path, "w") as f:
                for d in docs:
                    f.write(json.dumps(d) + "\n")
            logger.info(f"  ✓ {court}: {len(docs)} docs → {path.name}")

    def _fetch_court(self, court: str, limit: int) -> list[dict]:
        docs = []
        page = 1
        while len(docs) < limit:
            try:
                r = self.session.get(self.SEARCH_URL, params={
                    "type": "o", "court": court, "format": "json",
                    "page_size": 20, "page": page,
                }, timeout=30)
                r.raise_for_status()
                data = r.json()
                results = data.get("results", [])
                if not results:
                    break
                for item in results:
                    if len(docs) >= limit:
                        break
                    # Fetch opinion text
                    opinions = item.get("opinions", [])
                    if not opinions:
                        continue
                    opinion_id = opinions[0].get("id")
                    if not opinion_id:
                        continue
                    text = self._fetch_opinion_text(opinion_id)
                    if not text or len(text) < 200:
                        continue
                    docs.append({
                        "id": f"cl_{item.get('cluster_id', opinion_id)}",
                        "case_name": item.get("caseName", ""),
                        "text": text,
                        "date": item.get("dateFiled", "")[:10],
                        "court": court,
                        "jurisdiction": "US",
                        "source": "courtlistener",
                    })
                page += 1
                time.sleep(0.5)
            except Exception as e:
                logger.warning(f"  Error fetching {court} page {page}: {e}")
                break
        return docs

    def _fetch_opinion_text(self, opinion_id: int) -> str:
        try:
            r = self.session.get(f"{self.OPINION_URL}{opinion_id}/",
                                params={"format": "json"}, timeout=30)
            r.raise_for_status()
            data = r.json()
            text = data.get("plain_text", "")
            if not text:
                html = data.get("html_with_citations") or data.get("html", "")
                if html:
                    text = BeautifulSoup(html, "lxml").get_text()
            time.sleep(0.3)
            return text
        except Exception as e:
            logger.debug(f"  Opinion {opinion_id} fetch error: {e}")
            return ""


class HUDOCDownloader:
    """Download ECHR cases from HUDOC."""

    BASE = "https://hudoc.echr.coe.int/app/query/results"
    ARTICLES = [2, 3, 5, 6, 8, 10, 14]

    def download(self, out_dir: pathlib.Path | None = None):
        out_dir = out_dir or RAW_DIR / "hudoc"
        out_dir.mkdir(parents=True, exist_ok=True)
        path = out_dir / "echr_cases.jsonl"
        if path.exists() and path.stat().st_size > 100:
            logger.info("Skipping HUDOC — already downloaded")
            return
        docs = []
        for art in self.ARTICLES:
            logger.info(f"Downloading ECHR Article {art}...")
            docs.extend(self._fetch_article(art, limit=500))
            time.sleep(1)
        with open(path, "w") as f:
            for d in docs:
                f.write(json.dumps(d) + "\n")
        logger.info(f"  ✓ HUDOC: {len(docs)} docs")

    def _fetch_article(self, article: int, limit: int = 500) -> list[dict]:
        docs = []
        params = {"query": f"contentsitename:ECHR AND article:{article}",
                  "select": "itemid,docname,kpdate,conclusion,doctype",
                  "sort": "kpdate Descending", "start": 0, "length": min(limit, 50)}
        try:
            r = requests.get(self.BASE, params=params, timeout=30)
            r.raise_for_status()
            data = r.json()
            for item in data.get("results", []):
                docs.append({
                    "id": f"hudoc_{item.get('itemid', '')}",
                    "case_name": item.get("docname", ""),
                    "text": item.get("conclusion", "") or item.get("docname", ""),
                    "date": (item.get("kpdate", "") or "")[:10],
                    "court": "ECHR",
                    "jurisdiction": "Europe",
                    "source": "hudoc",
                    "article": article,
                })
        except Exception as e:
            logger.warning(f"  HUDOC article {article} error: {e}")
        return docs[:limit]


class LiveLawDownloader:
    """Download Indian legal news from LiveLaw.in via web scraping.
    
    RSS feeds are discontinued. Now scrapes category pages directly.
    """

    BASE_URL = "https://www.livelaw.in"
    CATEGORIES = [
        "/supreme-court", "/high-court", "/news-updates",
        "/law-firms", "/columns", "/know-the-law",
    ]
    HEADERS = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                      "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
    }

    def download(self, out_dir: pathlib.Path | None = None, pages_per_category: int = 5):
        out_dir = out_dir or RAW_DIR / "livelaw"
        out_dir.mkdir(parents=True, exist_ok=True)
        path = out_dir / "livelaw_articles.jsonl"
        if path.exists() and path.stat().st_size > 100:
            logger.info("Skipping LiveLaw — already downloaded")
            return
        logger.info("Downloading LiveLaw via web scraping...")
        docs = []
        for cat in self.CATEGORIES:
            logger.info(f"  Scraping {cat}...")
            for page in range(1, pages_per_category + 1):
                url = f"{self.BASE_URL}{cat}/page/{page}" if page > 1 else f"{self.BASE_URL}{cat}"
                try:
                    r = requests.get(url, headers=self.HEADERS, timeout=20)
                    if r.status_code != 200:
                        break
                    soup = BeautifulSoup(r.text, "lxml")
                    articles = soup.select("article, .post-item, .news-item, h2 a, .entry-title a")
                    if not articles:
                        # Fallback: find all links that look like article URLs
                        articles = soup.find_all("a", href=lambda h: h and "/news-updates/" in h or "/supreme-court/" in h or "/high-court/" in h)
                    for art in articles:
                        link = art.get("href", "") if art.name == "a" else ""
                        if not link:
                            a_tag = art.find("a")
                            link = a_tag.get("href", "") if a_tag else ""
                        if not link or not link.startswith("http"):
                            if link.startswith("/"):
                                link = self.BASE_URL + link
                            else:
                                continue
                        title = art.get_text(strip=True)[:200]
                        if not title or len(title) < 10:
                            continue
                        doc = self._fetch_article(link, title, cat)
                        if doc:
                            docs.append(doc)
                    time.sleep(1.5)
                except Exception as e:
                    logger.warning(f"  LiveLaw {cat} page {page} error: {e}")
                    break
        with open(path, "w") as f:
            for d in docs:
                f.write(json.dumps(d) + "\n")
        logger.info(f"  ✓ LiveLaw: {len(docs)} docs")

    def _fetch_article(self, url: str, title: str, category: str) -> dict | None:
        try:
            r = requests.get(url, headers=self.HEADERS, timeout=15)
            if r.status_code != 200:
                return None
            soup = BeautifulSoup(r.text, "lxml")
            # Extract article body
            body = soup.select_one(".post-content, .entry-content, article .content, .td-post-content")
            if not body:
                body = soup.find("article")
            text = body.get_text(separator=" ", strip=True) if body else ""
            if len(text.split()) < 30:
                return None
            # Extract date
            date_el = soup.select_one("time, .post-date, .entry-date, .td-post-date")
            date_str = date_el.get("datetime", date_el.get_text(strip=True)) if date_el else ""
            time.sleep(0.5)
            return {
                "id": f"livelaw_{hash(url) % 10**9}",
                "case_name": title,
                "text": f"{title}. {text}",
                "date": date_str[:10],
                "court": "Indian Courts",
                "jurisdiction": "India",
                "source": "livelaw",
                "url": url,
                "category": category.strip("/"),
            }
        except Exception:
            return None


def download_all():
    """Run all downloaders."""
    logger.info("Starting data download pipeline...")
    if COURTLISTENER_TOKEN and "YOUR_" not in COURTLISTENER_TOKEN:
        CourtListenerDownloader().download()
    else:
        logger.warning("Skipping CourtListener — no API key configured")
    HUDOCDownloader().download()
    LiveLawDownloader().download()
    logger.info("Data download complete.")


if __name__ == "__main__":
    download_all()
