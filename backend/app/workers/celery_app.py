"""Celery application configuration."""

from celery import Celery

from app.config import settings

celery_app = Celery(
    "pawlogic",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minute hard limit
    task_soft_time_limit=240,  # 4 minute soft limit
)

# Auto-discover tasks in the workers package
celery_app.autodiscover_tasks(["app.workers"])
