"""Celery tasks for recommendations service."""
from workers.celery_app import celery_app
from services.recommendations.embeddings import rebuild_index


@celery_app.task(name="tasks.rebuild_embeddings_task")
def rebuild_embeddings_task():
    """Background task to rebuild the FAISS index."""
    try:
        print("[Worker] Starting rebuild embeddings task...")
        stats = rebuild_index()
        print(f"[Worker] Finished rebuild embeddings. Stats: {stats}")
        return stats
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}
