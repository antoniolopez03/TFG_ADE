import logging
from fastapi import APIRouter, Depends

from app.config import settings
from app.dependencies import verificar_api_key
from app.models import MapsSearchRequest, ScrapeResponse
from app.scrapers.maps_scraper import MapsScraper

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/scrape/maps",
    response_model=ScrapeResponse,
    dependencies=[Depends(verificar_api_key)],
    tags=["Scraping"],
    summary="Buscar empresas en Google Maps",
)
async def scrape_google_maps(request: MapsSearchRequest):
    """
    Busca empresas B2B en Google Maps y devuelve sus datos públicos.

    El orquestador n8n llama a este endpoint durante el Workflow de Descubrimiento.
    Los datos retornados son procesados por n8n para:
    1. Comprobar si ya existen en global_empresas (caché/Data Moat)
    2. Enriquecer con Apollo.io si no existen
    3. Guardar en leads_prospectados con estado 'nuevo'

    Requiere header: X-API-Key: {settings.api_key}
    """
    import time
    inicio = time.time()

    logger.info(
        f"[{request.organizacion_id}] Maps scrape: "
        f"'{request.query}' en '{request.location}' (max: {request.max_results})"
    )

    errores = []

    try:
        async with MapsScraper() as scraper:
            empresas = await scraper.scrape(
                query=request.query,
                location=request.location,
                max_results=min(request.max_results, settings.max_results_per_job),
                organizacion_id=request.organizacion_id,
            )
    except Exception as e:
        msg = f"{type(e).__name__}: {e}" if str(e) else type(e).__name__
        logger.error(f"[{request.organizacion_id}] Error en Maps scraper: {msg}", exc_info=True)
        errores.append(msg)
        empresas = []

    duracion = time.time() - inicio

    return ScrapeResponse(
        organizacion_id=request.organizacion_id,
        query_original=f"{request.query} {request.location}",
        total_encontrados=len(empresas),
        empresas=empresas,
        errores=errores,
        tiempo_ejecucion_segundos=round(duracion, 2),
    )
