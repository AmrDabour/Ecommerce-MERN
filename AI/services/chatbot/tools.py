"""LangGraph agent tools for querying MongoDB."""
from typing import List, Dict, Any
from langchain.tools import tool
from db.mongo import get_collection
from config.settings import settings


@tool
def search_products(query_intent: str, max_results: int = 5) -> List[Dict[str, Any]]:
    """
    Search the database for products based on the user's intent.
    Use this to find products like 'lowest price mobile phone', 'laptops', etc.
    """
    products_collection = get_collection("products")

    # If the intent mentions "lowest" or "cheap", sort by price asc
    sort_query = [("price", 1)] if any(
        word in query_intent.lower() for word in ["lowest", "cheap", "cheapest"]
    ) else [("createdAt", -1)]

    # Extract meaningful keywords for regex search
    keywords = [
        w for w in query_intent.split()
        if len(w) > 3 and w.lower() not in ["lowest", "price", "show", "me", "find"]
    ]

    db_query = {}
    if keywords:
        regex_pattern = "|".join(keywords)
        db_query = {
            "$or": [
                {"name": {"$regex": regex_pattern, "$options": "i"}},
                {"description": {"$regex": regex_pattern, "$options": "i"}},
            ]
        }

    cursor = products_collection.find(db_query).sort(sort_query).limit(max_results)

    results = []
    for p in cursor:
        results.append({
            "id": str(p["_id"]),
            "name": p.get("name", "Unknown"),
            "price": p.get("price", 0),
            "link": f"{settings.FRONTEND_URL}/products/{str(p['_id'])}",
        })

    if not results:
        return [{"message": f"No products found matching '{query_intent}'."}]

    return results
