from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Autenticación: n8n debe incluir este header en todas las peticiones
    api_key: str = "changeme-generate-with-openssl-rand-hex-32"

    # Límites de seguridad
    max_results_per_job: int = 50

    # Delays anti-bot (milisegundos)
    min_delay_ms: int = 1500
    max_delay_ms: int = 4000

    # Playwright
    headless: bool = True
    browser_timeout_ms: int = 30000  # 30s por operación de navegador

    # Cold start: Render Free suspende la instancia; este flag
    # indica si el navegador ya fue inicializado (warm)
    debug: bool = False


settings = Settings()
