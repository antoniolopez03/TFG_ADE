"""
base.py
Clase base abstracta para todos los scrapers.
Gestiona el ciclo de vida del navegador y aplica evasión anti-bot.
"""

import time
import logging
from abc import ABC, abstractmethod
from typing import Optional

from playwright.async_api import async_playwright, Browser, BrowserContext, Page

from app.config import settings
from app.models import EmpresaResult
from app.utils.anti_bot import configurar_contexto, navegar_con_retry

logger = logging.getLogger(__name__)


class BaseScraper(ABC):
    """
    Clase base para scrapers. Gestiona el browser lifecycle.

    Uso:
        scraper = MapsScraper()
        await scraper.iniciar()
        resultados = await scraper.scrape(request)
        await scraper.cerrar()
    """

    def __init__(self):
        self._playwright = None
        self._browser: Optional[Browser] = None
        self._context: Optional[BrowserContext] = None

    async def iniciar(self) -> None:
        """Lanza el navegador Chromium headless."""
        self._playwright = await async_playwright().start()
        self._browser = await self._playwright.chromium.launch(
            headless=settings.headless,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",   # crítico para Docker con poca RAM
                "--disable-accelerated-2d-canvas",
                "--no-first-run",
                "--no-zygote",
                "--disable-gpu",
                "--disable-extensions",
                "--disable-background-networking",
                "--disable-default-apps",
                "--disable-sync",
                "--disable-translate",
                "--mute-audio",
                "--hide-scrollbars",
            ],
        )
        logger.info("Navegador Chromium iniciado.")

    async def cerrar(self) -> None:
        """Cierra el navegador y libera recursos."""
        if self._context:
            await self._context.close()
        if self._browser:
            await self._browser.close()
        if self._playwright:
            await self._playwright.stop()
        logger.info("Navegador cerrado.")

    async def nueva_pagina(self) -> Page:
        """
        Crea un nuevo contexto y página con evasión anti-bot aplicada.
        Cada job recibe un contexto fresco para evitar correlación de cookies.
        """
        if not self._browser:
            raise RuntimeError("El navegador no ha sido iniciado. Llama a iniciar() primero.")

        # Cerrar contexto anterior si existe
        if self._context:
            await self._context.close()

        self._context = await configurar_contexto(self._browser, settings)
        page = await self._context.new_page()

        # Timeout por defecto para todas las operaciones
        page.set_default_timeout(settings.browser_timeout_ms)

        return page

    async def navegar(self, page: Page, url: str) -> bool:
        """Navega a una URL con reintentos y manejo de errores."""
        return await navegar_con_retry(page, url, timeout_ms=settings.browser_timeout_ms)

    @abstractmethod
    async def scrape(self, **kwargs) -> list[EmpresaResult]:
        """
        Implementar en subclases.
        Debe retornar una lista de EmpresaResult.
        """
        ...

    def _extraer_dominio(self, url: str) -> Optional[str]:
        """Extrae el dominio limpio de una URL."""
        if not url:
            return None
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url if url.startswith("http") else f"https://{url}")
            dominio = parsed.netloc.lower()
            # Eliminar 'www.'
            return dominio.removeprefix("www.")
        except Exception:
            return None

    def _es_url_valida(self, url: str) -> bool:
        """Verifica que la URL sea navegable (no un teléfono, email, etc.)."""
        if not url:
            return False
        url = url.lower().strip()
        return (
            url.startswith("http://") or url.startswith("https://")
        ) and not any(
            x in url for x in ["javascript:", "mailto:", "tel:", "whatsapp:"]
        )
