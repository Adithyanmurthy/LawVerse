"""Download Indian legal datasets from HuggingFace and convert to project format."""
import json, pathlib, sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
from config.settings import RAW_DIR
from loguru import logger

DATASETS = [
    {
        "id": "labofsahil/Indian-Supreme-Court-Judgments",
        "name": "indian_sc_judgments",
        "desc": "10K-100K Supreme Court judgments",
    },
    {
        "id": "Immanuel30303/Indian-High-Court-Judgments-all",
        "name": "indian_hc_judgments",
        "desc": "1M-10M High Court judgments (large)",
        "split": "train",
        "max_rows": 50000,  # Start with 50K to avoid memory issues
    },
    {
        "id": "santoshtyss/indian_courts_cases",
        "name": "indian_courts_cases",
        "desc": "10K-100K mixed court cases",
    },
    {
        "id": "opennyaiorg/InJudgements_dataset",
        "name": "opennyai_judgements",
        "desc": "OpenNyAI curated judgments",
    },
]


def download_dataset(ds_config: dict):
    from datasets import load_dataset

    name = ds_config["name"]
    out_dir = RAW_DIR / "indian_hf"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{name}.jsonl"

    if out_path.exists() and out_path.stat().st_size > 1000:
        logger.info(f"Skipping {name} — already downloaded")
        return

    logger.info(f"Downloading {ds_config['id']} ({ds_config['desc']})...")
    try:
        kwargs = {"split": ds_config.get("split", "train")}
        if "max_rows" in ds_config:
            kwargs["split"] = f"train[:{ds_config['max_rows']}]"

        ds = load_dataset(ds_config["id"], **kwargs, trust_remote_code=True)
        logger.info(f"  Loaded {len(ds)} rows. Converting...")

        count = 0
        with open(out_path, "w") as f:
            for i, row in enumerate(ds):
                doc = _convert_row(row, name, i)
                if doc and len(doc.get("text", "").split()) >= 50:
                    f.write(json.dumps(doc) + "\n")
                    count += 1

        logger.info(f"  ✓ {name}: {count} docs → {out_path.name}")
    except Exception as e:
        logger.error(f"  ✗ {name} failed: {e}")


def _convert_row(row: dict, source: str, idx: int) -> dict | None:
    """Convert HuggingFace row to our standard JSONL format."""
    # Different datasets have different column names
    text = (
        row.get("text") or row.get("judgment") or row.get("content")
        or row.get("judgement") or row.get("case_text") or row.get("document")
        or row.get("full_text") or ""
    )
    if not text:
        # Try combining available fields
        for key in row:
            val = row[key]
            if isinstance(val, str) and len(val) > 200:
                text = val
                break

    if not text or len(text.split()) < 50:
        return None

    case_name = (
        row.get("case_name") or row.get("title") or row.get("case_title")
        or row.get("name") or row.get("petitioner", "") + " v. " + row.get("respondent", "")
        or ""
    ).strip()
    if case_name == " v. ":
        case_name = ""

    date = row.get("date") or row.get("judgment_date") or row.get("date_of_judgment") or ""
    court = row.get("court") or row.get("court_name") or row.get("bench") or "Indian Courts"

    return {
        "id": f"hf_{source}_{idx}",
        "case_name": case_name[:300],
        "text": text[:50000],  # Cap at 50K chars to avoid huge docs
        "date": str(date)[:10],
        "court": court,
        "jurisdiction": "India",
        "source": f"huggingface_{source}",
    }


def download_all():
    logger.info("=== Downloading Indian Legal Datasets from HuggingFace ===")
    for ds in DATASETS:
        download_dataset(ds)
    logger.info("=== All Indian datasets downloaded ===")


if __name__ == "__main__":
    download_all()
