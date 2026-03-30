"""
maps_scraper.py
Extracción de empresas B2B desde Google Maps.
Estrategia: búsqueda por keyword + ubicación, scroll de resultados, extracción de datos.

ÉTICA: Solo extrae información pública visible en Google Maps.
No accede a APIs privadas ni extrae datos de usuarios individuales.
"""

import asyncio
import logging
import re
import time
from urllib.parse import quote_plus

from app.models import EmpresaResult, MapsSearchRequest
from app.scrapers.base import BaseScraper
from app.utils.anti_bot import (
    delay_humano,
    delay_corto,
    simular_scroll_humano,
    mover_mouse_aleatorio,
)

logger = logging.getLogger(__name__)

# Selectores de Google Maps (pueden cambiar con actualizaciones de Google)
# Se usan múltiples como fallback
SELECTORES_RESULTADOS = [
    'div[role="feed"] > div[jsaction]',
    'div.Nv2PK',          # tarjeta de resultado
    'a[href*="/maps/place/"]',
]

SELECTOR_PANEL_DETALLE = 'div[role="main"]'
SELECTOR_NOMBRE = 'h1.DUwDvf, h1[class*="fontHeadlineLarge"]'
SELECTOR_DIRECCION = 'button[data-item-id="address"] div.Io6YTe'
SELECTOR_TELEFONO = 'button[data-item-id^="phone:tel"] div.Io6YTe'
SELECTOR_WEBSITE = 'a[data-item-id="authority"] div.Io6YTe'
SELECTOR_CATEGORIA = 'button[jsaction*="category"] span'


class MapsScraper(BaseScraper):
    """
    Scraper de Google Maps para descubrimiento de empresas B2B.
    Simula a un usuario buscando proveedores en Google Maps.
    """

    async def scrape(
        self,
        query: str,
        location: str,
        max_results: int = 20,
        organizacion_id: str = "",
    ) -> list[EmpresaResult]:
        """
        Busca empresas en Google Maps y extrae sus datos públicos.

        Args:
            query: Tipo de negocio (ej: "fábricas de automoción")
            location: Ubicación (ej: "Valencia, España")
            max_results: Máximo de resultados a extraer
            organizacion_id: ID de la organización (para logging)

        Returns:
            Lista de EmpresaResult con datos públicos de las empresas
        """
        inicio = time.time()
        empresas: list[EmpresaResult] = []
        errores: list[str] = []

        # Construir URL de búsqueda
        termino_busqueda = f"{query} {location}"
        url = f"https://www.google.com/maps/search/{quote_plus(termino_busqueda)}"

        logger.info(f"[{organizacion_id}] Iniciando búsqueda Maps: '{termino_busqueda}'")

        page = await self.nueva_pagina()

        try:
            # Navegar a Google Maps
            exito = await self.navegar(page, url)
            if not exito:
                logger.error(f"[{organizacion_id}] No se pudo acceder a Google Maps")
                return empresas

            # Manejar diálogo de consentimiento de cookies si aparece
            await self._aceptar_cookies(page)

            # Verificar CAPTCHA
            if await self._detectar_captcha(page):
                logger.error(f"[{organizacion_id}] CAPTCHA detectado en Google Maps. Deteniendo.")
                return empresas

            # Esperar que cargue el feed de resultados
            try:
                await page.wait_for_selector('div[role="feed"]', timeout=15000)
            except Exception:
                # Sin resultados o estructura diferente
                logger.warning(f"[{organizacion_id}] No se encontró feed de resultados. Sin resultados para esta búsqueda.")
                return empresas

            await delay_humano(1000, 2500)
            await mover_mouse_aleatorio(page)

            # Extraer resultados haciendo scroll progresivo
            empresas_extraidas = 0
            scroll_sin_nuevos = 0

            while empresas_extraidas < max_results and scroll_sin_nuevos < 3:
                # Obtener todas las tarjetas de resultado visibles
                tarjetas = await page.query_selector_all(SELECTORES_RESULTADOS[0])

                if not tarjetas:
                    # Intentar con selectores alternativos
                    for selector in SELECTORES_RESULTADOS[1:]:
                        tarjetas = await page.query_selector_all(selector)
                        if tarjetas:
                            break

                nuevas_en_este_ciclo = 0

                for tarjeta in tarjetas[empresas_extraidas:max_results]:
                    try:
                        # Clic en la tarjeta para abrir el panel de detalle
                        await tarjeta.click()
                        await delay_humano(1500, 3000)

                        # Esperar que cargue el panel de detalle
                        await page.wait_for_selector(SELECTOR_PANEL_DETALLE, timeout=8000)

                        empresa = await self._extraer_datos_panel(page)
                        if empresa:
                            empresas.append(empresa)
                            nuevas_en_este_ciclo += 1
                            empresas_extraidas += 1
                            logger.debug(f"[{organizacion_id}] Extraída: {empresa.nombre}")

                        await delay_humano(800, 1800)

                    except Exception as e:
                        error_msg = f"Error extrayendo tarjeta: {str(e)[:100]}"
                        logger.warning(f"[{organizacion_id}] {error_msg}")
                        errores.append(error_msg)

                if nuevas_en_este_ciclo == 0:
                    scroll_sin_nuevos += 1
                else:
                    scroll_sin_nuevos = 0

                # Scroll para cargar más resultados
                if empresas_extraidas < max_results:
                    feed = await page.query_selector('div[role="feed"]')
                    if feed:
                        await feed.evaluate("el => el.scrollBy(0, 500)")
                    await delay_humano(1000, 2000)

        except Exception as e:
            logger.error(f"[{organizacion_id}] Error general en Maps scraper: {e}")
            errores.append(str(e))
        finally:
            await page.close()

        duracion = time.time() - inicio
        logger.info(
            f"[{organizacion_id}] Scraping Maps completado: "
            f"{len(empresas)} empresas en {duracion:.1f}s"
        )

        return empresas

    async def _extraer_datos_panel(self, page) -> EmpresaResult | None:
        """Extrae los datos del panel lateral de detalle de un lugar en Google Maps."""
        try:
            # Nombre de la empresa
            nombre_el = await page.query_selector(SELECTOR_NOMBRE)
            nombre = await nombre_el.inner_text() if nombre_el else None
            if not nombre:
                return None

            # Dirección
            dir_el = await page.query_selector(SELECTOR_DIRECCION)
            direccion = await dir_el.inner_text() if dir_el else None

            # Teléfono
            tel_el = await page.query_selector(SELECTOR_TELEFONO)
            telefono = await tel_el.inner_text() if tel_el else None

            # Website
            web_el = await page.query_selector(SELECTOR_WEBSITE)
            website_texto = await web_el.inner_text() if web_el else None
            dominio = self._extraer_dominio(website_texto) if website_texto else None

            # Categoría/Sector
            cat_el = await page.query_selector(SELECTOR_CATEGORIA)
            sector = await cat_el.inner_text() if cat_el else None

            # URL de Google Maps (contiene el Place ID)
            maps_url = page.url
            place_id = self._extraer_place_id(maps_url)

            # Ciudad desde la dirección (heurística simple)
            ciudad = self._extraer_ciudad(direccion) if direccion else None

            return EmpresaResult(
                nombre=nombre.strip(),
                dominio=dominio,
                telefono=telefono,
                direccion=direccion,
                ciudad=ciudad,
                sector=sector,
                google_maps_url=maps_url,
                google_place_id=place_id,
                fuente="google_maps",
                datos_adicionales={"website_texto": website_texto},
            )

        except Exception as e:
            logger.warning(f"Error extrayendo panel de detalle: {e}")
            return None

    async def _aceptar_cookies(self, page) -> None:
        """Acepta el diálogo de consentimiento de cookies de Google si aparece."""
        try:
            # Selectores comunes del banner de cookies de Google
            selectores_aceptar = [
                'button[aria-label*="Accept"]',
                'button[aria-label*="Aceptar"]',
                'button[aria-label*="Rechazar"]',
                'form[action*="consent"] button',
                'button#L2AGLb',  # botón "Acepto" en consent de Google
            ]
            for selector in selectores_aceptar:
                btn = await page.query_selector(selector)
                if btn:
                    await btn.click()
                    await delay_humano(1000, 2000)
                    logger.debug("Diálogo de cookies aceptado.")
                    return
        except Exception as e:
            logger.debug(f"No se pudo manejar cookies consent: {e}")

    async def _detectar_captcha(self, page) -> bool:
        """Detecta si Google ha mostrado un CAPTCHA."""
        contenido = await page.content()
        indicadores = [
            "recaptcha",
            "unusual traffic",
            "tráfico inusual",
            "detected unusual traffic",
            'id="captcha"',
            'src="https://www.google.com/recaptcha',
        ]
        return any(ind in contenido.lower() for ind in indicadores)

    def _extraer_place_id(self, url: str) -> str | None:
        """Extrae el Google Place ID de la URL de Maps."""
        match = re.search(r"place/[^/]+/([^/?@]+)", url)
        return match.group(1) if match else None

    def _extraer_ciudad(self, direccion: str) -> str | None:
        """
        Heurística simple: la ciudad suele ser la penúltima parte de la dirección.
        Ej: "Calle Mayor 1, Valencia, España" -> "Valencia"
        """
        partes = [p.strip() for p in direccion.split(",")]
        if len(partes) >= 2:
            return partes[-2]
        return None
