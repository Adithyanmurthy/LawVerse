"""Preprocess raw JSONL → cleaned corpus with year/decade/citations."""
import json, re, pathlib, unicodedata
from bs4 import BeautifulSoup
from loguru import logger
from config.settings import RAW_DIR, PROCESSED_DIR, CORPUS_DIR

YEAR_RE = re.compile(r'\b(1[89]\d{2}|20[0-2]\d)\b')
CITE_RE = re.compile(r'\d+\s+U\.S\.\s+\d+|\d+\s+S\.\s*Ct\.\s+\d+|\d+\s+F\.\d[d]\s+\d+')


def _clean(text: str) -> str:
    text = BeautifulSoup(text, "lxml").get_text() if "<" in text else text
    text = unicodedata.normalize("NFKD", text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def _extract_year(doc: dict) -> int | None:
    date_str = doc.get("date", "")
    if date_str:
        m = YEAR_RE.search(date_str)
        if m:
            return int(m.group(1))
    m = YEAR_RE.search(doc.get("text", "")[:500])
    return int(m.group(1)) if m else None


def preprocess_all():
    """Read all raw JSONL, clean, enrich, write to processed/corpus."""
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    CORPUS_DIR.mkdir(parents=True, exist_ok=True)
    all_docs = []

    for jsonl_path in sorted(RAW_DIR.rglob("*.jsonl")):
        logger.info(f"Processing {jsonl_path.name}...")
        with open(jsonl_path) as f:
            for line in f:
                try:
                    doc = json.loads(line.strip())
                except json.JSONDecodeError:
                    continue
                text = _clean(doc.get("text", ""))
                if len(text.split()) < 50:
                    continue
                year = _extract_year(doc)
                if not year:
                    continue
                citations = CITE_RE.findall(text)
                all_docs.append({
                    "id": doc.get("id", ""),
                    "case_name": doc.get("case_name", ""),
                    "text": text,
                    "year": year,
                    "decade": f"{(year // 10) * 10}s",
                    "court": doc.get("court", ""),
                    "jurisdiction": doc.get("jurisdiction", ""),
                    "source": doc.get("source", ""),
                    "citations": citations,
                    "word_count": len(text.split()),
                })

    # Write corpus
    corpus_path = CORPUS_DIR / "corpus.jsonl"
    with open(corpus_path, "w") as f:
        for d in all_docs:
            f.write(json.dumps(d) + "\n")
    logger.info(f"Corpus: {len(all_docs)} docs → {corpus_path}")

    # Write stats
    from collections import Counter
    decades = Counter(d["decade"] for d in all_docs)
    jurisdictions = Counter(d["jurisdiction"] for d in all_docs)
    stats = {
        "total_documents": len(all_docs),
        "total_words": sum(d["word_count"] for d in all_docs),
        "decades": dict(sorted(decades.items())),
        "jurisdictions": dict(jurisdictions),
    }
    stats_path = CORPUS_DIR / "stats.json"
    stats_path.write_text(json.dumps(stats, indent=2))
    logger.info(f"Stats: {stats_path}")
    return all_docs


if __name__ == "__main__":
    preprocess_all()
