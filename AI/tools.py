import os
from typing import List, Dict, Any
from pymongo import MongoClient
from langchain.tools import tool
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("MONGO_DB_NAME", "ecommerce")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:4200")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

@tool
def search_products(query_intent: str, max_results: int = 5) -> List[Dict[str, Any]]:
    """
    Search the database for products based on the user's intent. 
    Use this to find products like 'lowest price mobile phone', 'laptops', etc.
    """
    products_collection = db["products"]
    
    # Simple logic for this MVP agent
    # If the intent mentions "lowest" or "cheap", sort by price asc
    sort_query = [("price", 1)] if any(word in query_intent.lower() for word in ["lowest", "cheap", "cheapest"]) else [("createdAt", -1)]
    
    # If the intent has a category keyword, we can try to filter
    # For a robust solution, we'd do a text index search, but a regex on name/description is fine for a simple agent.
    keywords = [w for w in query_intent.split() if len(w) > 3 and w.lower() not in ["lowest", "price", "show", "me", "find"]]
    
    db_query = {}
    if keywords:
        # Create a regex to match any of the keywords
        regex_pattern = "|".join(keywords)
        db_query = {
            "$or": [
                {"name": {"$regex": regex_pattern, "$options": "i"}},
                {"description": {"$regex": regex_pattern, "$options": "i"}}
            ]
        }
        
    cursor = products_collection.find(db_query).sort(sort_query).limit(max_results)
    
    results = []
    for p in cursor:
        results.append({
            "id": str(p["_id"]),
            "name": p.get("name", "Unknown"),
            "price": p.get("price", 0),
            "link": f"{FRONTEND_URL}/products/{str(p['_id'])}"
        })
        
    if not results:
        return [{"message": f"No products found matching '{query_intent}'."}]
        
    return results

# You can add more tools like get_product_details(id), etc.
