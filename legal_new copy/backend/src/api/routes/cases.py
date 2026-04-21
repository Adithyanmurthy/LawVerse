"""Case Library routes — browse scraped Indian court cases."""
import sqlite3, json
from fastapi import APIRouter, Query, HTTPException
from config.settings import DATA_DIR

router = APIRouter(prefix="/cases", tags=["cases"])
DB_PATH = str(DATA_DIR / "indian_kanoon.db")


def _get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@router.get("")
async def list_cases(
    court: str | None = None,
    year: int | None = None,
    q: str | None = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
):
    """List cases with optional filters."""
    conn = _get_db()
    offset = (page - 1) * limit
    where_clauses = ["word_count >= 50"]
    params: list = []

    if court:
        where_clauses.append("court LIKE ?")
        params.append(f"%{court}%")
    if year:
        where_clauses.append("year = ?")
        params.append(year)
    if q:
        where_clauses.append("(case_name LIKE ? OR text LIKE ?)")
        params.extend([f"%{q}%", f"%{q}%"])

    where = " AND ".join(where_clauses)

    total = conn.execute(f"SELECT COUNT(*) FROM documents WHERE {where}", params).fetchone()[0]
    rows = conn.execute(
        f"SELECT doc_id, case_name, date, year, court, word_count, url "
        f"FROM documents WHERE {where} ORDER BY year DESC, date DESC LIMIT ? OFFSET ?",
        params + [limit, offset],
    ).fetchall()
    conn.close()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "cases": [
            {"id": r["doc_id"], "case_name": r["case_name"], "date": r["date"],
             "year": r["year"], "court": r["court"], "word_count": r["word_count"],
             "url": r["url"]}
            for r in rows
        ],
    }


@router.get("/stats")
async def case_stats():
    """Get case library statistics."""
    conn = _get_db()
    total = conn.execute("SELECT COUNT(*) FROM documents").fetchone()[0]
    courts = conn.execute(
        "SELECT court, COUNT(*) as cnt FROM documents GROUP BY court ORDER BY cnt DESC LIMIT 20"
    ).fetchall()
    decades = conn.execute(
        "SELECT decade, COUNT(*) as cnt FROM documents WHERE decade IS NOT NULL GROUP BY decade ORDER BY decade"
    ).fetchall()
    conn.close()
    return {
        "total_cases": total,
        "courts": [{"name": r["court"], "count": r["cnt"]} for r in courts],
        "decades": [{"decade": r["decade"], "count": r["cnt"]} for r in decades],
    }


@router.get("/{doc_id}")
async def get_case(doc_id: str):
    """Get full case details."""
    conn = _get_db()
    row = conn.execute(
        "SELECT doc_id, case_name, text, date, year, decade, court, url, citations, word_count "
        "FROM documents WHERE doc_id = ?",
        (doc_id,),
    ).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Case not found")
    return {
        "id": row["doc_id"], "case_name": row["case_name"], "text": row["text"],
        "date": row["date"], "year": row["year"], "decade": row["decade"],
        "court": row["court"], "url": row["url"],
        "citations": json.loads(row["citations"]) if row["citations"] else [],
        "word_count": row["word_count"],
    }
