"""
dorks_scraper.py
Extracción de contactos B2B usando Google Dorks.
Estrategia: buscar en Google snippets de perfiles de LinkedIn sin acceder a LinkedIn.

ÉTICA: Solo lee los snippets de resultados que Google muestra públicamente.
No hace scraping directo de LinkedIn (que tiene T&Cs restrictivos).
"""

import asyncio
import logging
import re
import time
from urllib.parse import quote_plus

from app.models import EmpresaResult, ContactoResult
from app.scrapers.base import BaseScraper
from app.utils.anti_bot import delay_humano, simular_scroll_humano, mover_mouse_aleatorio

logger = logging.getLogger(__name__)

# Selectores de resultados de Google Search
SELECTOR_RESULTADOS = "div.g, div[data-sokoban-container]"
SELECTOR_TITULO = "h3"
SELECTOR_URL = "a[href]"
SELECTOR_SNIPPET = "div.VwiC3b, span.aCOpRe"

# Patrón para extraer información de snippets de LinkedIn
PATRON_LINKEDIN_CARGO = re.compile(
    r"([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+ [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)\s*[-·|]\s*([^·|\n]+?)(?:\s*[-·|]\s*(.+?))?(?:\n|$)",
    re.MULTILINE
)


class DorksScraper(BaseScraper):
    """
    Scraper de Google Dorks para descubrir decisores en empresas B2B.
    Usa operadores de búsqueda avanzada de Google para encontrar perfiles
    de LinkedIn sin necesidad de acceder directamente a la red social.

    Ejemplo de dork: site:es.linkedin.com/in "Director de Compras" "Logística" "Madrid"
    """

    async def scrape(
        self,
        dork_query: str,
        max_results: int = 20,
        organizacion_id: str = "",
    ) -> list[EmpresaResult]:
        """
        Ejecuta una búsqueda con Google Dorks y extrae contactos de los snippets.

        Args:
            dork_query: Query de Google Dorks (ej: 'site:linkedin.com/in "Director" "Madrid"')
            max_results: Máximo de resultados
            organizacion_id: ID de organización para logging

        Returns:
            Lista de EmpresaResult con ContactoResult asociados
        """
        inicio = time.time()
        resultados: list[EmpresaResult] = []

        # Calcular páginas necesarias (Google muestra ~10 por página)
        paginas_necesarias = (max_results // 10) + 1
        url_base = f"https://www.google.com/search?q={quote_plus(dork_query)}&hl=es&num=10"

        logger.info(f"[{organizacion_id}] Iniciando búsqueda Dorks: '{dork_query[:80]}...'")

        page = await self.nueva_pagina()

        try:
            for num_pagina in range(paginas_necesarias):
                if len(resultados) >= max_results:
                    break

                # URL con paginación
                start = num_pagina * 10
                url = f"{url_base}&start={start}" if start > 0 else url_base

                logger.debug(f"[{organizacion_id}] Página {num_pagina + 1}: {url}")

                exito = await self.navegar(page, url)
                if not exito:
                    logger.warning(f"[{organizacion_id}] No se pudo acceder a Google Search")
                    break

                # Manejar diálogo de consentimiento de cookies (solo primera página)
                if num_pagina == 0:
                    await self._aceptar_cookies(page)

                # Verificar si Google ha mostrado CAPTCHA
                if await self._detectar_captcha(page):
                    logger.error(f"[{organizacion_id}] CAPTCHA detectado. Deteniendo.")
                    break

                await delay_humano(2000, 4000)
                await mover_mouse_aleatorio(page)

                # Extraer resultados de la página actual
                nuevos = await self._extraer_resultados_pagina(page)
                resultados.extend(nuevos)

                logger.debug(f"[{organizacion_id}] Página {num_pagina + 1}: {len(nuevos)} resultados")

                if len(nuevos) < 8:
                    # Si hay menos resultados de lo esperado, no hay más páginas
                    break

                # Pausa más larga entre páginas (Google detecta paginación rápida)
                await delay_humano(5000, 10000)

        except Exception as e:
            logger.error(f"[{organizacion_id}] Error en Dorks scraper: {e}")
        finally:
            await page.close()

        duracion = time.time() - inicio
        logger.info(
            f"[{organizacion_id}] Dorks completado: "
            f"{len(resultados)} resultados en {duracion:.1f}s"
        )

        return resultados[:max_results]

    async def _extraer_resultados_pagina(self, page) -> list[EmpresaResult]:
        """Extrae los resultados de búsqueda de la página actual."""
        resultados = []

        # Obtener todos los elementos de resultado
        items = await page.query_selector_all("div.g")
        if not items:
            items = await page.query_selector_all("div[jscontroller][data-hveid]")

        for item in items:
            try:
                empresa = await self._parsear_resultado(item)
                if empresa:
                    resultados.append(empresa)
            except Exception as e:
                logger.debug(f"Error parseando resultado: {e}")

        return resultados

    async def _parsear_resultado(self, item) -> EmpresaResult | None:
        """
        Parsea un resultado de búsqueda de Google y extrae datos del snippet.
        Para resultados de LinkedIn, extrae nombre, cargo y empresa.
        """
        # Obtener URL del resultado
        link = await item.query_selector("a[href]")
        if not link:
            return None

        href = await link.get_attribute("href")
        if not href:
            return None

        # Obtener título
        titulo_el = await item.query_selector("h3")
        titulo = await titulo_el.inner_text() if titulo_el else ""

        # Obtener snippet de texto
        snippet_el = await item.query_selector("div.VwiC3b")
        if not snippet_el:
            snippet_el = await item.query_selector("span.aCOpRe")
        snippet = await snippet_el.inner_text() if snippet_el else ""

        texto_completo = f"{titulo}\n{snippet}"

        # Determinar si es un perfil de LinkedIn
        es_linkedin = "linkedin.com/in/" in href.lower()

        if es_linkedin:
            contacto = self._extraer_contacto_linkedin(titulo, snippet, href)
            if not contacto:
                return None

            # Crear empresa basada en la empresa del contacto
            nombre_empresa = contacto.empresa or "Empresa desconocida"
            return EmpresaResult(
                nombre=nombre_empresa,
                fuente="google_dorks",
                contactos=[contacto],
                datos_adicionales={
                    "dork_url": href,
                    "titulo_snippet": titulo,
                    "snippet": snippet,
                },
            )
        else:
            # Resultado genérico: puede ser directorio empresarial, etc.
            dominio = self._extraer_dominio(href)
            if not dominio or not titulo:
                return None

            return EmpresaResult(
                nombre=titulo,
                dominio=dominio,
                fuente="google_dorks",
                datos_adicionales={
                    "dork_url": href,
                    "snippet": snippet,
                },
            )

    def _extraer_contacto_linkedin(
        self, titulo: str, snippet: str, url: str
    ) -> ContactoResult | None:
        """
        Extrae datos de contacto del snippet de un perfil de LinkedIn.

        Formato típico del título:
        "Ana García - Directora de Compras - Empresa XYZ | LinkedIn"

        Formato típico del snippet:
        "Experiencia en gestión de proveedores. Madrid, España."
        """
        # Limpiar título (eliminar "| LinkedIn" al final)
        titulo_limpio = re.sub(r"\s*\|\s*LinkedIn\s*$", "", titulo, flags=re.IGNORECASE)

        # Separar por " - " (formato estándar de LinkedIn en Google)
        partes = [p.strip() for p in titulo_limpio.split(" - ")]

        nombre = None
        cargo = None
        empresa = None

        if len(partes) >= 1:
            nombre = partes[0] if self._parece_nombre(partes[0]) else None

        if len(partes) >= 2:
            cargo = partes[1]

        if len(partes) >= 3:
            empresa = partes[2]

        if not nombre and not cargo:
            return None

        return ContactoResult(
            nombre=nombre,
            cargo=cargo,
            empresa=empresa,
            linkedin_url=url if "linkedin.com/in/" in url else None,
        )

    def _parece_nombre(self, texto: str) -> bool:
        """Heurística: un nombre tiene 2+ palabras que empiezan por mayúscula."""
        palabras = texto.split()
        return (
            len(palabras) >= 2
            and all(p[0].isupper() for p in palabras if p)
            and len(texto) < 60
        )

    async def _aceptar_cookies(self, page) -> None:
        """Acepta el diálogo de consentimiento de cookies de Google si aparece."""
        try:
            selectores_aceptar = [
                'button[aria-label*="Accept"]',
                'button[aria-label*="Aceptar"]',
                'button#L2AGLb',
                'form[action*="consent"] button',
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
        indicadores_captcha = [
            "recaptcha",
            "unusual traffic",
            "tráfico inusual",
            "detected unusual traffic",
            'id="captcha"',
            'src="https://www.google.com/recaptcha',
        ]
        return any(ind in contenido.lower() for ind in indicadores_captcha)
