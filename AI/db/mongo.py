"""Shared MongoDB client and helpers."""
from pymongo import MongoClient
from config.settings import settings

_client: MongoClient | None = None


def get_client() -> MongoClient:
    """Return a singleton MongoClient instance."""
    global _client
    if _client is None:
        _client = MongoClient(settings.MONGO_URI)
    return _client


def get_db():
    """Return the default database handle."""
    return get_client()[settings.MONGO_DB_NAME]


def get_collection(name: str):
    """Shortcut to get a collection by name."""
    return get_db()[name]
