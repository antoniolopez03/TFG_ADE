from pydantic import BaseModel, field_validator
from typing import Optional


class MapsSearchRequest(BaseModel):
    """Petición de scraping en Google Maps."""
    query: str                          # ej: "fábricas de automoción"
    location: str                       # ej: "Valencia, España"
    max_results: int = 20
    organizacion_id: str                # para correlación con la BD

    @field_validator("max_results")
    @classmethod
    def limitar_resultados(cls, v: int) -> int:
        return min(v, 50)  # hardcap de seguridad

    @field_validator("query")
    @classmethod
    def sanitizar_query(cls, v: str) -> str:
        return v.strip()[:200]


class DorksSearchRequest(BaseModel):
    """Petición de scraping con Google Dorks."""
    dork_query: str     # ej: 'site:linkedin.com/in "Director de Compras" "Madrid"'
    max_results: int = 20
    organizacion_id: str

    @field_validator("max_results")
    @classmethod
    def limitar_resultados(cls, v: int) -> int:
        return min(v, 50)


class ContactoResult(BaseModel):
    """Contacto extraído de Google Dorks (snippet de LinkedIn)."""
    nombre: Optional[str] = None
    cargo: Optional[str] = None
    empresa: Optional[str] = None
    linkedin_url: Optional[str] = None


class EmpresaResult(BaseModel):
    """Empresa extraída del scraping. Mapea a global_empresas."""
    nombre: str
    dominio: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    provincia: Optional[str] = None
    pais: str = "ES"
    sector: Optional[str] = None
    google_maps_url: Optional[str] = None
    google_place_id: Optional[str] = None
    fuente: str = "google_maps"         # google_maps | google_dorks
    contactos: list[ContactoResult] = []
    datos_adicionales: dict = {}


class ScrapeResponse(BaseModel):
    """Respuesta del microservicio al orquestador n8n."""
    organizacion_id: str
    query_original: str
    total_encontrados: int
    empresas: list[EmpresaResult]
    errores: list[str] = []
    tiempo_ejecucion_segundos: float
