from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

celery_app = Celery(
    "wb_analytics",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.timezone = "Europe/Moscow"
celery_app.conf.task_routes = {
    "app.tasks.sync_*": {"queue": "sync"},
}
celery_app.conf.beat_schedule = {
    "sync-wb-data-every-2-hours": {
        "task": "app.tasks.sync_all_users_data",
        "schedule": crontab(minute=0, hour="*/2"),
    }
}


@celery_app.task(name="app.tasks.sync_all_users_data")
def sync_all_users_data():
    # Заглушка: здесь будет проход по пользователям и запуск синхронизации с WB API.
    # В проде: асинхронные вызовы API WB + сохранение в БД + перерасчет агрегатов.
    return "scheduled-sync-triggered"