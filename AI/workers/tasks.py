"""
Central task registry for Celery workers.
Imports tasks from individual service domains so Celery can discover them.
"""

# Import tasks to register them with the Celery app
from services.recommendations.tasks import rebuild_embeddings_task

# Ensure tasks are not stripped out by linters/formatters
__all__ = ["rebuild_embeddings_task"]
