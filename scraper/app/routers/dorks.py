import logging
import time

from fastapi import APIRouter, Depends

from app.config import settings
from app.dependencies import verificar_api_key
from app.models import DorksSearchRequest, ScrapeResponse
from app.scrapers.dorks_scraper import DorksScraper

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/scrape/dorks",
    response_model=ScrapeResponse,
    dependencies=[Depends(verificar_api_key)],
    tags=["Scraping"],
    summary="Buscar contactos B2B con Google Dorks",
)
async def scrape_google_dorks(request: DorksSearchRequest):
    """
    Busca perfiles de decisores usando Google Dorks.

    Casos de uso:
    - Encontrar directores de compras de un sector en una ciudad
    - Descubrir CEOs de empresas de un nicho específico
    - Localizar responsables de IT en pymes industriales

    Ejemplo de dork_query:
    'site:es.linkedin.com/in "Director de Compras" "empresa de logística" "Madrid"'

    El orquestador n8n usa este endpoint cuando el usuario activa la
    Búsqueda IA (Lookalike) y Gemini genera los términos de búsqueda.
    """
    inicio = time.time()

    logger.info(
        f"[{request.organizacion_id}] Dorks scrape: '{request.dork_query[:60]}...'"
    )

    errores = []

    try:
        async with DorksScraper() as scraper:
            empresas = await scraper.scrape(
                dork_query=request.dork_query,
                max_results=min(request.max_results, settings.max_results_per_job),
                organizacion_id=request.organizacion_id,
            )
    except Exception as e:
        msg = f"{type(e).__name__}: {e}" if str(e) else type(e).__name__
        logger.error(f"[{request.organizacion_id}] Error en Dorks scraper: {msg}", exc_info=True)
        errores.append(msg)
        empresas = []

    duracion = time.time() - inicio

    return ScrapeResponse(
        organizacion_id=request.organizacion_id,
        query_original=request.dork_query,
        total_encontrados=len(empresas),
        empresas=empresas,
        errores=errores,
        tiempo_ejecucion_segundos=round(duracion, 2),
    )
