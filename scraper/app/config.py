from pathlib import Path

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(ENV_PATH), extra="ignore")

    # Autenticación: n8n debe incluir este header en todas las peticiones
    api_key: str = Field(default="", min_length=1)

    # Límites de seguridad
    max_results_per_job: int = Field(default=50, ge=1, le=100)

    # Delays anti-bot (milisegundos)
    min_delay_ms: int = Field(default=1500, ge=0)
    max_delay_ms: int = Field(default=4000, ge=0)

    # Playwright
    headless: bool = True
    browser_timeout_ms: int = Field(default=30000, ge=1000)

    # Maps scraper tuning
    maps_global_timeout_ms: int = Field(default=90000, ge=10000)
    maps_feed_timeout_ms: int = Field(default=15000, ge=1000)
    maps_scroll_timeout_ms: int = Field(default=15000, ge=1000)
    maps_scroll_pixels_min: int = Field(default=800, ge=100)
    maps_scroll_pixels_max: int = Field(default=1500, ge=100)
    maps_no_new_scrolls_limit: int = Field(default=4, ge=1, le=10)
    maps_initial_delay_min_ms: int = Field(default=800, ge=0)
    maps_initial_delay_max_ms: int = Field(default=1500, ge=0)
    maps_action_delay_min_ms: int = Field(default=300, ge=0)
    maps_action_delay_max_ms: int = Field(default=600, ge=0)
    maps_detail_nav_timeout_ms: int = Field(default=10000, ge=1000)
    maps_detail_panel_timeout_ms: int = Field(default=4000, ge=1000)
    maps_detail_fields_timeout_ms: int = Field(default=2000, ge=500)
    maps_click_delay_min_ms: int = Field(default=600, ge=0)
    maps_click_delay_max_ms: int = Field(default=1200, ge=0)
    maps_back_wait_timeout_ms: int = Field(default=3000, ge=500)
    maps_back_nav_timeout_ms: int = Field(default=5000, ge=1000)

    # Debug: habilita Swagger UI en /docs (desactivar en produccion)
    debug: bool = False

    @model_validator(mode="after")
    def _validar_rangos(self) -> "Settings":
        if self.max_delay_ms <= self.min_delay_ms:
            raise ValueError("max_delay_ms must be > min_delay_ms")
        if self.maps_click_delay_max_ms <= self.maps_click_delay_min_ms:
            raise ValueError("maps_click_delay_max_ms must be > maps_click_delay_min_ms")
        if self.maps_initial_delay_max_ms <= self.maps_initial_delay_min_ms:
            raise ValueError("maps_initial_delay_max_ms must be > maps_initial_delay_min_ms")
        if self.maps_action_delay_max_ms <= self.maps_action_delay_min_ms:
            raise ValueError("maps_action_delay_max_ms must be > maps_action_delay_min_ms")
        if self.maps_scroll_pixels_max <= self.maps_scroll_pixels_min:
            raise ValueError("maps_scroll_pixels_max must be > maps_scroll_pixels_min")
        return self


settings = Settings()
