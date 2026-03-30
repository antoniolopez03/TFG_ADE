from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint.
    Usado por Docker HEALTHCHECK y el orquestador n8n para
    verificar que el microservicio está activo tras el Cold Start de Render.
    """
    return HealthResponse(
        status="ok",
        service="scraper-microservice",
        version="1.0.0",
    )
