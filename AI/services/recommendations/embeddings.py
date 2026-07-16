"""
Gemini Embedding generation and FAISS vector index management.

Uses Google's `gemini-embedding-001` model to create semantic embeddings
for product descriptions, then stores them in a FAISS index for fast
similarity search.
"""
import os
import json
import numpy as np
import faiss
from typing import List, Dict, Optional
from bson import ObjectId
from google import genai
from google.genai import types
from db.mongo import get_collection
from config.settings import settings

# ── Constants ──────────────────────────────────────────────────────────
EMBEDDING_DIM = 768  # gemini-embedding-001 output dimension
EMBEDDING_MODEL = "gemini-embedding-001"
BATCH_SIZE = 100  # Gemini API batch limit

# ── Module-level state ─────────────────────────────────────────────────
_faiss_index: Optional[faiss.IndexFlatIP] = None  # Inner Product (cosine on normalized)
_product_ids: List[str] = []  # Parallel list of product ObjectId strings


def _get_genai_client():
    """Lazy-init the Google GenAI client."""
    api_key = settings.GOOGLE_API_KEY
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY is not set in environment.")
    return genai.Client(api_key=api_key)


def _build_product_text(product: dict) -> str:
    """Build a single text representation of a product for embedding."""
    name = product.get("name", "")
    description = product.get("description", "")
    category_name = ""
    # If category was populated, extract name
    cat = product.get("_category_name", "")
    if cat:
        category_name = f"Category: {cat}. "
    price = product.get("price", 0)
    return f"{category_name}{name}. {description}. Price: ${price}"


import time

def _embed_texts(client, texts: List[str]) -> List[List[float]]:
    """Embed a list of texts using Gemini, handling batching."""
    all_embeddings = []
    # Use smaller batch size to be safe with free tier (100 per minute)
    # 15 items per batch, 10 seconds sleep -> ~90 items per minute
    batch_size = 15
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        result = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=batch,
            config=types.EmbedContentConfig(task_type="SEMANTIC_SIMILARITY"),
        )
        all_embeddings.extend([e.values for e in result.embeddings])
        # Sleep to avoid rate limits
        if i + batch_size < len(texts):
            time.sleep(10)
    return all_embeddings


def rebuild_index() -> dict:
    """
    Rebuild the FAISS index from scratch:
    1. Read all products from MongoDB
    2. Generate embeddings via Gemini API
    3. Store embeddings back in MongoDB (for persistence)
    4. Build FAISS index in memory
    Returns stats dict.
    """
    global _faiss_index, _product_ids

    products_col = get_collection("products")
    categories_col = get_collection("categories")

    # Fetch all categories for name lookup
    cat_map = {}
    for cat in categories_col.find({}, {"_id": 1, "name": 1}):
        cat_map[str(cat["_id"])] = cat.get("name", "")

    # Fetch all products
    products = list(products_col.find({}))
    if not products:
        return {"status": "no_products", "count": 0}

    # Build text representations
    texts = []
    ids = []
    for p in products:
        p["_category_name"] = cat_map.get(str(p.get("category", "")), "")
        texts.append(_build_product_text(p))
        ids.append(str(p["_id"]))

    # Generate embeddings
    client = _get_genai_client()
    embeddings = _embed_texts(client, texts)

    # Normalize for cosine similarity via inner product
    embeddings_np = np.array(embeddings, dtype="float32")
    faiss.normalize_L2(embeddings_np)

    # Build FAISS index
    dim = embeddings_np.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings_np)

    # Persist embeddings to MongoDB
    for i, product in enumerate(products):
        products_col.update_one(
            {"_id": product["_id"]},
            {"$set": {"embedding": embeddings[i]}},
        )

    # Update module state
    _faiss_index = index
    _product_ids = ids

    return {"status": "ok", "count": len(ids)}


def _ensure_index_loaded():
    """Load FAISS index from MongoDB embeddings if not in memory."""
    global _faiss_index, _product_ids

    if _faiss_index is not None:
        return

    products_col = get_collection("products")
    products = list(products_col.find(
        {"embedding": {"$exists": True}},
        {"_id": 1, "embedding": 1},
    ))

    if not products:
        return

    ids = [str(p["_id"]) for p in products]
    embeddings_np = np.array(
        [p["embedding"] for p in products], dtype="float32"
    )
    faiss.normalize_L2(embeddings_np)

    dim = embeddings_np.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings_np)

    _faiss_index = index
    _product_ids = ids


def find_similar(product_id: str, top_k: int = 10) -> List[Dict]:
    """
    Find the top_k most similar products to a given product_id.
    Returns list of {"product_id": str, "score": float}.
    """
    _ensure_index_loaded()

    if _faiss_index is None or not _product_ids:
        return []

    if product_id not in _product_ids:
        return []

    idx = _product_ids.index(product_id)
    # Reconstruct the vector for this product
    dim = _faiss_index.d
    query_vec = np.zeros((1, dim), dtype="float32")
    _faiss_index.reconstruct(idx, query_vec[0])

    # Search (top_k + 1 because the product itself will be in results)
    scores, indices = _faiss_index.search(query_vec, top_k + 1)

    results = []
    for score, i in zip(scores[0], indices[0]):
        if i < 0 or i >= len(_product_ids):
            continue
        pid = _product_ids[i]
        if pid == product_id:
            continue  # Skip self
        results.append({"product_id": pid, "score": float(score)})

    return results[:top_k]


def find_similar_to_multiple(product_ids: List[str], top_k: int = 10) -> List[Dict]:
    """
    Find similar products to a set of products (e.g., user's purchase history).
    Aggregates scores and deduplicates.
    """
    _ensure_index_loaded()

    if _faiss_index is None or not _product_ids:
        return []

    score_map: Dict[str, float] = {}
    for pid in product_ids:
        similar = find_similar(pid, top_k=top_k)
        for item in similar:
            sid = item["product_id"]
            if sid not in product_ids:  # Exclude already-interacted products
                score_map[sid] = score_map.get(sid, 0) + item["score"]

    # Sort by aggregated score descending
    ranked = sorted(score_map.items(), key=lambda x: x[1], reverse=True)
    return [{"product_id": pid, "score": score} for pid, score in ranked[:top_k]]
