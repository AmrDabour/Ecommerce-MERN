"""FastAPI router for the recommendation service."""
from fastapi import APIRouter, HTTPException
from services.recommendations.engine import get_similar_products, get_user_recommendations
from services.recommendations.embeddings import rebuild_index

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get("/similar/{product_id}")
async def similar_products(product_id: str, top_k: int = 8):
    """Get products similar to a given product (for product detail page)."""
    try:
        results = get_similar_products(product_id, top_k=top_k)
        return {"products": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{user_id}")
async def user_recommendations(user_id: str, top_k: int = 12):
    """Get personalized recommendations for a user."""
    try:
        results = get_user_recommendations(user_id, top_k=top_k)
        return {"products": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/rebuild-index")
async def rebuild_embeddings():
    """Admin endpoint: Rebuild the FAISS embeddings index from scratch."""
    try:
        stats = rebuild_index()
        return {"message": "Index rebuilt successfully", **stats}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=repr(e))
