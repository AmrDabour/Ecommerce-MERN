"""Celery configuration for the AI service."""
from celery import Celery
from config.settings import settings

# Create Celery app
# We use rpc:// as result backend because it returns task results directly via transient queues in RabbitMQ
celery_app = Celery(
    "ai_agent",
    broker=settings.CELERY_BROKER_URL,
    backend="rpc://",
    include=["workers.tasks"]
)

# Optional configurations
celery_app.conf.update(
    task_track_started=True,
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
)
