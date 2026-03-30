import logging
from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional

from app.config import settings
from app.models import MapsSearchRequest, ScrapeResponse
from app.scrapers.maps_scraper import MapsScraper

logger = logging.getLogger(__name__)
router = APIRouter()


async def verificar_api_key(x_api_key: Optional[str] = Header(default=None)):
    """Dependency: verifica que la petición incluye la API key correcta."""
    if not x_api_key or x_api_key != settings.api_key:
        raise HTTPException(status_code=401, detail="API key inválida o ausente.")
    return x_api_key


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

    scraper = MapsScraper()
    errores = []

    try:
        await scraper.iniciar()
        empresas = await scraper.scrape(
            query=request.query,
            location=request.location,
            max_results=min(request.max_results, settings.max_results_per_job),
            organizacion_id=request.organizacion_id,
        )
    except Exception as e:
        logger.error(f"[{request.organizacion_id}] Error en Maps scraper: {e}")
        errores.append(str(e))
        empresas = []
    finally:
        await scraper.cerrar()

    duracion = time.time() - inicio

    return ScrapeResponse(
        organizacion_id=request.organizacion_id,
        query_original=f"{request.query} {request.location}",
        total_encontrados=len(empresas),
        empresas=empresas,
        errores=errores,
        tiempo_ejecucion_segundos=round(duracion, 2),
    )
