"""
Recommendation engine — orchestrates different recommendation strategies.

Phase 1: Content-based using Gemini embeddings + FAISS.
Phase 2 (future): Collaborative filtering using implicit feedback.
"""
from typing import List, Dict
from bson import ObjectId
from db.mongo import get_collection
from services.recommendations.embeddings import find_similar, find_similar_to_multiple


def get_similar_products(product_id: str, top_k: int = 8) -> List[Dict]:
    """
    Get products similar to a given product.
    Used on the product detail page ("You may also like").
    """
    similar = find_similar(product_id, top_k=top_k)

    if not similar:
        return []

    # Fetch product details
    products_col = get_collection("products")
    result_ids = [ObjectId(item["product_id"]) for item in similar]
    products = list(products_col.find(
        {"_id": {"$in": result_ids}},
        {"name": 1, "price": 1, "imageCover": 1, "ratingsAvg": 1, "sold": 1, "priceAfterDiscount": 1},
    ))

    # Build a score lookup
    score_map = {item["product_id"]: item["score"] for item in similar}

    # Enrich with product data
    enriched = []
    for p in products:
        pid = str(p["_id"])
        enriched.append({
            "id": pid,
            "name": p.get("name", ""),
            "price": p.get("price", 0),
            "priceAfterDiscount": p.get("priceAfterDiscount"),
            "imageCover": p.get("imageCover", ""),
            "ratingsAvg": p.get("ratingsAvg", 0),
            "sold": p.get("sold", 0),
            "similarityScore": round(score_map.get(pid, 0), 4),
        })

    # Sort by similarity score
    enriched.sort(key=lambda x: x["similarityScore"], reverse=True)
    return enriched


def get_user_recommendations(user_id: str, top_k: int = 12) -> List[Dict]:
    """
    Get personalized recommendations for a user.
    Strategy:
    1. Collect products the user has interacted with (orders, wishlist, reviews)
    2. Find similar products using embedding similarity
    3. Rank and deduplicate
    """
    orders_col = get_collection("orders")
    users_col = get_collection("users")
    reviews_col = get_collection("reviews")

    interacted_product_ids = set()

    # 1. Products from orders
    user_orders = list(orders_col.find(
        {"user": ObjectId(user_id)},
        {"orderItems.product": 1},
    ))
    for order in user_orders:
        for item in order.get("orderItems", []):
            interacted_product_ids.add(str(item.get("product", "")))

    # 2. Products from wishlist
    user = users_col.find_one({"_id": ObjectId(user_id)}, {"wishlist": 1})
    if user and user.get("wishlist"):
        for pid in user["wishlist"]:
            interacted_product_ids.add(str(pid))

    # 3. Products from reviews (rated >= 3)
    user_reviews = list(reviews_col.find(
        {"user": ObjectId(user_id), "rating": {"$gte": 3}},
        {"product": 1},
    ))
    for review in user_reviews:
        interacted_product_ids.add(str(review.get("product", "")))

    # Remove empty strings
    interacted_product_ids.discard("")

    if not interacted_product_ids:
        # Cold start: return popular products
        return _get_popular_products(top_k)

    # Find similar products
    similar = find_similar_to_multiple(list(interacted_product_ids), top_k=top_k)

    if not similar:
        return _get_popular_products(top_k)

    # Fetch product details
    products_col = get_collection("products")
    result_ids = [ObjectId(item["product_id"]) for item in similar]
    products = list(products_col.find(
        {"_id": {"$in": result_ids}},
        {"name": 1, "price": 1, "imageCover": 1, "ratingsAvg": 1, "sold": 1, "priceAfterDiscount": 1},
    ))

    score_map = {item["product_id"]: item["score"] for item in similar}

    enriched = []
    for p in products:
        pid = str(p["_id"])
        enriched.append({
            "id": pid,
            "name": p.get("name", ""),
            "price": p.get("price", 0),
            "priceAfterDiscount": p.get("priceAfterDiscount"),
            "imageCover": p.get("imageCover", ""),
            "ratingsAvg": p.get("ratingsAvg", 0),
            "sold": p.get("sold", 0),
            "recommendationScore": round(score_map.get(pid, 0), 4),
        })

    enriched.sort(key=lambda x: x["recommendationScore"], reverse=True)
    return enriched


def _get_popular_products(top_k: int = 12) -> List[Dict]:
    """Fallback: return most popular products (by sold count + rating)."""
    products_col = get_collection("products")
    products = list(
        products_col.find(
            {},
            {"name": 1, "price": 1, "imageCover": 1, "ratingsAvg": 1, "sold": 1, "priceAfterDiscount": 1},
        )
        .sort([("sold", -1), ("ratingsAvg", -1)])
        .limit(top_k)
    )

    return [
        {
            "id": str(p["_id"]),
            "name": p.get("name", ""),
            "price": p.get("price", 0),
            "priceAfterDiscount": p.get("priceAfterDiscount"),
            "imageCover": p.get("imageCover", ""),
            "ratingsAvg": p.get("ratingsAvg", 0),
            "sold": p.get("sold", 0),
            "recommendationScore": 0,
        }
        for p in products
    ]
