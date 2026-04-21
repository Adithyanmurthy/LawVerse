"""Build per-concept per-decade embeddings from the corpus using LexLM."""
import json, numpy as np, pathlib
from collections import defaultdict
from loguru import logger
from config.settings import CORPUS_DIR, EMBEDDINGS_DIR, SEED_CONCEPTS


def build_embeddings(concepts: list[str] | None = None, max_docs_per_period: int = 200):
    """For each concept × decade, embed relevant docs and store averages."""
    from model import get_hub
    hub = get_hub()
    concepts = concepts or SEED_CONCEPTS
    corpus_path = CORPUS_DIR / "corpus.jsonl"
    if not corpus_path.exists():
        logger.error("Corpus not found. Run preprocessor first.")
        return

    # Load corpus
    docs = []
    with open(corpus_path) as f:
        for line in f:
            docs.append(json.loads(line.strip()))
    logger.info(f"Loaded {len(docs)} docs from corpus")

    # Group docs by decade
    docs_by_decade: dict[str, list[dict]] = defaultdict(list)
    for d in docs:
        docs_by_decade[d["decade"]].append(d)

    EMBEDDINGS_DIR.mkdir(parents=True, exist_ok=True)

    for concept in concepts:
        logger.info(f"Embedding concept: '{concept}'")
        concept_data = {}
        for decade in sorted(docs_by_decade.keys()):
            # Filter docs mentioning this concept
            relevant = [d for d in docs_by_decade[decade]
                        if concept.lower() in d["text"].lower()]
            if not relevant:
                continue
            relevant = relevant[:max_docs_per_period]
            texts = [d["text"][:2000] for d in relevant]  # truncate for speed
            emb = hub.embed_concept_in_context(texts, concept)
            concept_data[decade] = {
                "embedding": emb.mean(axis=0).tolist(),
                "doc_count": len(relevant),
            }
            logger.info(f"  {decade}: {len(relevant)} docs")

        # Save
        out_path = EMBEDDINGS_DIR / f"{concept.replace(' ', '_')}.json"
        out_path.write_text(json.dumps(concept_data, indent=2))
        logger.info(f"  ✓ Saved {out_path.name}")

    logger.info("Embedding indexing complete.")


if __name__ == "__main__":
    build_embeddings()
