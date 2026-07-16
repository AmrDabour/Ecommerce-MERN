import os
from celery import Celery
from dotenv import load_dotenv

load_dotenv()

# Get broker URL, default to rabbitmq container inside docker-compose network
BROKER_URL = os.getenv("CELERY_BROKER_URL", "amqp://guest:guest@localhost:5672//")

# Create Celery app
# We use rpc:// as result backend because it returns task results directly via transient queues in RabbitMQ
celery_app = Celery(
    "ai_agent",
    broker=BROKER_URL,
    backend="rpc://",
    include=["tasks"]
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
