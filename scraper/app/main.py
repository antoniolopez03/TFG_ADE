"""
main.py
FastAPI application factory para el microservicio de scraping.
Desplegado en Render.com (Free Tier con Docker).
"""

import sys
import asyncio
import logging
from contextlib import asynccontextmanager

# Windows: SelectorEventLoop no soporta subprocesos (necesario para Playwright)
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import health, maps, dorks
from app.config import settings

# Configuración de logging
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Eventos de inicio y cierre de la aplicación."""
    logger.info("Microservicio de scraping iniciando...")
    logger.info(f"Modo headless: {settings.headless}")
    logger.info(f"Max resultados por job: {settings.max_results_per_job}")
    yield
    logger.info("Microservicio de scraping cerrando...")


app = FastAPI(
    title="TFG Scraper Microservice",
    description=(
        "Microservicio de extracción de datos B2B para la plataforma SaaS. "
        "Busca empresas en Google Maps y contactos via Google Dorks. "
        "Llamado por n8n durante el Workflow de Descubrimiento."
    ),
    version="1.0.0",
    lifespan=lifespan,
    # En producción, deshabilitar la documentación pública
    docs_url="/docs" if settings.debug else None,
    redoc_url=None,
)

# CORS: solo permitir peticiones desde el servidor n8n
# En producción, reemplazar "*" por la URL exacta de tu instancia n8n
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restringir en producción
    allow_credentials=False,
    allow_methods=["POST", "GET"],
    allow_headers=["X-API-Key", "Content-Type"],
)

# Registrar routers
app.include_router(health.router)
app.include_router(maps.router)
app.include_router(dorks.router)
