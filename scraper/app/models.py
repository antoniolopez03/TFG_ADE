from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal


class MapsSearchRequest(BaseModel):
    """Petición de scraping en Google Maps."""
    query: str                          # ej: "fábricas de automoción"
    location: str                       # ej: "Valencia, España"
    max_results: int = Field(default=20, ge=1)
    organizacion_id: str                # para correlación con la BD

    @field_validator("query")
    @classmethod
    def sanitizar_query(cls, v: str) -> str:
        return v.strip()[:200]


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
    fuente: Literal["google_maps"] = "google_maps"
    datos_adicionales: dict = Field(default_factory=dict)


class ScrapeResponse(BaseModel):
    """Respuesta del microservicio al orquestador n8n."""
    organizacion_id: str
    query_original: str
    total_encontrados: int
    empresas: list[EmpresaResult]
    errores: list[str] = Field(default_factory=list)
    tiempo_ejecucion_segundos: float
