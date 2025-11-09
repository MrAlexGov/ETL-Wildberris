from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.api import api_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="WB Analytics API",
        version="0.1.0",
        description="Система аналитики продаж для Wildberries",
    )

    # CORS
    origins = [origin.strip() for origin in settings.BACKEND_CORS_ORIGINS.split(",") if origin.strip()]
    if origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    # Routers
    app.include_router(api_router, prefix="/api/v1")

    return app


app = create_app()