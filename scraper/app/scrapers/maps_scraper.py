"""
maps_scraper.py
Extracción de empresas B2B desde Google Maps.
Estrategia híbrida en 2 fases:
  Fase 1: Scroll agresivo + extracción desde aria-label de tarjetas (rápido).
  Fase 2: Clic selectivo solo en tarjetas sin dominio/teléfono (lento pero preciso).

ÉTICA: Solo extrae información pública visible en Google Maps.
No accede a APIs privadas ni extrae datos de usuarios individuales.
"""

import asyncio
import html
import logging
import random
import re
import time
from typing import Any
from urllib.parse import unquote, quote_plus
from playwright.async_api import Page, ElementHandle

from app.config import settings
from app.models import EmpresaResult
from app.scrapers.base import BaseScraper
from app.utils.anti_bot import (
    bloquear_recursos_pesados,
    delay_humano,
    delay_scroll,
    mover_mouse_aleatorio,
)

logger = logging.getLogger(__name__)

# ── Selectores (múltiples fallbacks por si Google cambia el DOM) ──────────

SELECTORES_RESULTADOS = [
    'div[role="feed"] > div > div > a[href*="/maps/place/"]',
    'div[role="feed"] > div[jsaction]',
    'div.Nv2PK',
    'a[href*="/maps/place/"]',
]

SELECTOR_PANEL_DETALLE = 'div[role="main"]'

SELECTORES_NOMBRE = [
    'h1.DUwDvf',
    'h1[class*="DUwDvf"]',
    'h1[class*="fontHeadlineLarge"]',
]

SELECTORES_DIRECCION = [
    'button[data-item-id="address"]',
    'button[aria-label*="irección"]',
    'button[aria-label*="ddress"]',
]

SELECTORES_TELEFONO = [
    'button[data-item-id^="phone:tel"]',
    'button[aria-label*="eléfono"]',
    'button[aria-label*="hone"]',
]

SELECTORES_WEBSITE = [
    'a[data-item-id="authority"]',
    'a[aria-label*="sitio web"]',
    'a[aria-label*="website"]',
]

SELECTORES_CATEGORIA = [
    'button[jsaction*="category"]',
]

# ── Mapeo ciudad → provincia (España) ────────────────────────────────────

CIUDAD_A_PROVINCIA: dict[str, str] = {
    "valencia": "Valencia", "madrid": "Madrid", "barcelona": "Barcelona",
    "sevilla": "Sevilla", "zaragoza": "Zaragoza", "málaga": "Málaga",
    "malaga": "Málaga", "murcia": "Murcia", "palma": "Illes Balears",
    "bilbao": "Bizkaia", "alicante": "Alicante", "córdoba": "Córdoba",
    "cordoba": "Córdoba", "valladolid": "Valladolid", "vigo": "Pontevedra",
    "gijón": "Asturias", "gijon": "Asturias", "vitoria": "Álava",
    "granada": "Granada", "elche": "Alicante", "oviedo": "Asturias",
    "santa cruz de tenerife": "Santa Cruz de Tenerife",
    "las palmas": "Las Palmas", "pamplona": "Navarra",
    "san sebastián": "Gipuzkoa", "san sebastian": "Gipuzkoa",
    "santander": "Cantabria", "castellón": "Castellón",
    "castellon": "Castellón", "burgos": "Burgos", "salamanca": "Salamanca",
    "albacete": "Albacete", "logroño": "La Rioja", "logrono": "La Rioja",
    "badajoz": "Badajoz", "huelva": "Huelva", "tarragona": "Tarragona",
    "león": "León", "leon": "León", "cádiz": "Cádiz", "cadiz": "Cádiz",
    "jaén": "Jaén", "jaen": "Jaén", "ourense": "Ourense",
    "girona": "Girona", "lugo": "Lugo", "toledo": "Toledo",
    "lleida": "Lleida", "cáceres": "Cáceres", "caceres": "Cáceres",
    "pontevedra": "Pontevedra", "almería": "Almería", "almeria": "Almería",
    "huesca": "Huesca", "cuenca": "Cuenca", "segovia": "Segovia",
    "guadalajara": "Guadalajara", "ávila": "Ávila", "avila": "Ávila",
    "soria": "Soria", "teruel": "Teruel", "zamora": "Zamora",
    "palencia": "Palencia", "a coruña": "A Coruña",
    "alcalá de henares": "Madrid", "móstoles": "Madrid",
    "getafe": "Madrid", "alcorcón": "Madrid", "fuenlabrada": "Madrid",
    "leganés": "Madrid", "torrejón de ardoz": "Madrid",
    "alcobendas": "Madrid", "parla": "Madrid",
    "hospitalet de llobregat": "Barcelona", "badalona": "Barcelona",
    "terrassa": "Barcelona", "sabadell": "Barcelona",
    "mataró": "Barcelona", "santa coloma de gramenet": "Barcelona",
    "dos hermanas": "Sevilla", "torrent": "Valencia",
    "paterna": "Valencia", "sagunto": "Valencia", "gandía": "Valencia",
    "gandia": "Valencia", "manises": "Valencia", "mislata": "Valencia",
    "almussafes": "Valencia", "alzira": "Valencia", "xàtiva": "Valencia",
    "xativa": "Valencia", "ontinyent": "Valencia", "requena": "Valencia",
    "sueca": "Valencia", "cullera": "Valencia", "llíria": "Valencia",
    "lliria": "Valencia", "burjassot": "Valencia",
}

PROVINCIAS_ESPANA = {
    "A Coruña", "Álava", "Albacete", "Alicante", "Almería", "Asturias",
    "Ávila", "Badajoz", "Barcelona", "Bizkaia", "Burgos", "Cáceres",
    "Cádiz", "Cantabria", "Castellón", "Ciudad Real", "Córdoba", "Cuenca",
    "Gipuzkoa", "Girona", "Granada", "Guadalajara", "Huelva", "Huesca",
    "Illes Balears", "Jaén", "La Rioja", "Las Palmas", "León", "Lleida",
    "Lugo", "Madrid", "Málaga", "Murcia", "Navarra", "Ourense",
    "Palencia", "Pontevedra", "Salamanca", "Santa Cruz de Tenerife",
    "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo",
    "Valencia", "Valladolid", "Zamora", "Zaragoza",
}


def construir_termino_busqueda_maps(query: str, location: str) -> str:
    q = " ".join((query or "").split()).strip().rstrip(",")
    loc = " ".join((location or "").split()).strip().lstrip(",")
    if q and loc:
        return f"{q}, {loc}"
    return q or loc


class MapsScraper(BaseScraper):
    """
    Scraper de Google Maps para descubrimiento de empresas B2B.
    Usa un enfoque híbrido: extracción rápida desde tarjetas + clic selectivo.
    """

    # ── Método principal ──────────────────────────────────────────────────

    async def scrape(
        self,
        query: str,
        location: str,
        max_results: int = 20,
        organizacion_id: str = "",
    ) -> list[EmpresaResult]:
        inicio = time.time()
        empresas: list[EmpresaResult] = []
        errores: list[str] = []

        termino_busqueda = construir_termino_busqueda_maps(query, location)
        ciudad_objetivo = self._extraer_ciudad_de_location(location)
        provincia_objetivo = self._extraer_provincia(None, ciudad_objetivo)
        url = f"https://www.google.com/maps/search/{quote_plus(termino_busqueda)}"

        logger.info(f"[{organizacion_id}] Iniciando búsqueda Maps: '{termino_busqueda}'")

        page = await self.nueva_pagina()
        await bloquear_recursos_pesados(page)

        try:
            global_timeout_s = settings.maps_global_timeout_ms / 1000
            async with asyncio.timeout(global_timeout_s):
                # Navegar a Google Maps
                exito = await self.navegar(page, url)
                if not exito:
                    logger.error(f"[{organizacion_id}] No se pudo acceder a Google Maps")
                    return empresas

                await self._aceptar_cookies(page)

                if await self._detectar_captcha(page):
                    logger.error(f"[{organizacion_id}] CAPTCHA detectado en Google Maps.")
                    return empresas

                # Esperar feed
                try:
                    await page.wait_for_selector(
                        'div[role="feed"]',
                        timeout=settings.maps_feed_timeout_ms,
                    )
                except Exception:
                    logger.warning(f"[{organizacion_id}] No se encontró feed de resultados.")
                    return empresas

                await delay_humano(
                    settings.maps_initial_delay_min_ms,
                    settings.maps_initial_delay_max_ms,
                )
                await mover_mouse_aleatorio(page)

                # ── FASE 1: Scroll + extracción desde tarjetas ────────
                tarjetas = await self._scroll_y_recolectar_tarjetas(
                    page, max_results, organizacion_id
                )

                datos_parciales: list[dict[str, Any]] = []
                for tarjeta in tarjetas[:max_results]:
                    try:
                        datos = await self._extraer_datos_desde_tarjeta(tarjeta)
                        if datos and datos.get("nombre"):
                            datos_parciales.append(datos)
                    except Exception as e:
                        logger.debug(f"[{organizacion_id}] Error extrayendo tarjeta: {e}")

                logger.info(
                    f"[{organizacion_id}] Fase 1 completada: "
                    f"{len(datos_parciales)} empresas desde tarjetas en {time.time() - inicio:.1f}s"
                )

                # ── FASE 2: Clic selectivo para enriquecer ────────────
                for datos in datos_parciales:
                    needs_detail = not datos.get("dominio") or not datos.get("telefono")
                    if needs_detail:
                        try:
                            await self._enriquecer_con_panel(
                                page, datos, organizacion_id
                            )
                        except Exception as e:
                            logger.debug(
                                f"[{organizacion_id}] Error enriqueciendo '{datos.get('nombre', '?')}': {e}"
                            )

                # ── Construir resultados finales ──────────────────────
                for datos in datos_parciales:
                    ciudad = datos.get("ciudad") or ciudad_objetivo
                    provincia = (
                        datos.get("provincia")
                        or self._extraer_provincia(datos.get("direccion"), ciudad)
                        or provincia_objetivo
                    )
                    empresa = EmpresaResult(
                        nombre=datos["nombre"],
                        dominio=datos.get("dominio"),
                        telefono=datos.get("telefono"),
                        direccion=datos.get("direccion"),
                        ciudad=ciudad,
                        provincia=provincia,
                        sector=datos.get("sector"),
                        google_maps_url=datos.get("google_maps_url"),
                        google_place_id=datos.get("google_place_id"),
                        fuente="google_maps",
                        datos_adicionales={
                            "website_texto": datos.get("website_texto"),
                            "website_href": datos.get("website_href"),
                            "latitud": datos.get("latitud"),
                            "longitud": datos.get("longitud"),
                        },
                    )
                    empresas.append(empresa)

        except TimeoutError:
            logger.warning(f"[{organizacion_id}] Timeout global de scraping en Google Maps")
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

    # ── FASE 1: Scroll y recolección de tarjetas ──────────────────────────

    async def _scroll_y_recolectar_tarjetas(
        self, page: Page, max_results: int, organizacion_id: str
    ) -> list[ElementHandle]:
        """Scrollea el feed agresivamente y retorna las tarjetas visibles."""
        inicio_scroll = time.time()
        timeout_scroll_s = settings.maps_scroll_timeout_ms / 1000
        max_sin_nuevos = settings.maps_no_new_scrolls_limit
        prev_count = 0
        sin_nuevos = 0

        while time.time() - inicio_scroll < timeout_scroll_s:
            # Contar tarjetas actuales
            tarjetas = await self._obtener_tarjetas(page)
            count = len(tarjetas)

            if count >= max_results:
                logger.debug(f"[{organizacion_id}] Suficientes tarjetas: {count}")
                break

            if count == prev_count:
                sin_nuevos += 1
                if sin_nuevos >= max_sin_nuevos:
                    logger.debug(
                        f"[{organizacion_id}] Sin nuevas tarjetas tras {max_sin_nuevos} scrolls. "
                        f"Total: {count}"
                    )
                    break
            else:
                sin_nuevos = 0
            prev_count = count

            # Detectar fin de resultados
            if await self._es_fin_de_resultados(page):
                logger.debug(f"[{organizacion_id}] Fin de resultados detectado. Total: {count}")
                break

            # Scroll agresivo
            feed = await page.query_selector('div[role="feed"]')
            if feed:
                pixels = random.randint(
                    settings.maps_scroll_pixels_min,
                    settings.maps_scroll_pixels_max,
                )
                await feed.evaluate(f"el => el.scrollBy(0, {pixels})")
            await delay_scroll(
                settings.maps_action_delay_min_ms,
                settings.maps_action_delay_max_ms,
            )

        tarjetas_finales = await self._obtener_tarjetas(page)
        logger.info(
            f"[{organizacion_id}] Scroll completado: {len(tarjetas_finales)} tarjetas "
            f"en {time.time() - inicio_scroll:.1f}s"
        )
        return tarjetas_finales

    async def _obtener_tarjetas(self, page: Page) -> list[ElementHandle]:
        """Obtiene las tarjetas de resultado usando selectores con fallback."""
        for selector in SELECTORES_RESULTADOS:
            tarjetas = await page.query_selector_all(selector)
            if tarjetas:
                return tarjetas
        return []

    async def _es_fin_de_resultados(self, page: Page) -> bool:
        """Detecta si Google Maps muestra el mensaje de fin de resultados."""
        feed = await page.query_selector('div[role="feed"]')
        if not feed:
            return False
        try:
            texto = await feed.evaluate(
                "el => el.lastElementChild ? el.lastElementChild.innerText : ''"
            )
            if not texto:
                return False
            t = texto.lower()
            return any(frase in t for frase in (
                "no hay más resultados",
                "no hay mas resultados",
                "has llegado al final",
                "you've reached the end",
                "no more results",
            ))
        except Exception:
            return False

    # ── Extracción desde tarjeta (sin clic) ───────────────────────────────

    async def _extraer_datos_desde_tarjeta(
        self, tarjeta: ElementHandle
    ) -> dict[str, Any] | None:
        """Extrae datos visibles de una tarjeta del feed sin hacer clic."""
        datos: dict[str, Any] = {}

        # 1. Buscar el enlace con aria-label
        link = await tarjeta.query_selector('a[href*="/maps/place/"]')
        if not link:
            # La propia tarjeta puede ser el enlace
            href_check = await tarjeta.get_attribute("href")
            if href_check and "/maps/place/" in href_check:
                link = tarjeta

        if link:
            aria = await link.get_attribute("aria-label")
            if aria:
                datos = self._parsear_aria_label_tarjeta(aria)

            href = await link.get_attribute("href")
            if href:
                datos["google_maps_url"] = href
                datos["google_place_id"] = self._extraer_place_id(href)
                lat, lon = self._extraer_lat_lon(href)
                datos["latitud"] = lat
                datos["longitud"] = lon

        # 2. Fallback: inner_text de la tarjeta
        if not datos.get("nombre"):
            card_text = self._normalizar_texto(await tarjeta.inner_text())
            nombre_fallback = self._limpiar_nombre_fallback(card_text)
            if nombre_fallback and not self._es_nombre_generico(nombre_fallback):
                datos["nombre"] = nombre_fallback
            # Intentar parsear sector/dirección del texto de tarjeta
            if card_text:
                datos_tarjeta = self._parsear_tarjeta_texto(card_text)
                datos.setdefault("sector", datos_tarjeta.get("sector"))
                datos.setdefault("direccion", datos_tarjeta.get("direccion"))
                datos.setdefault("telefono", datos_tarjeta.get("telefono"))

        return datos if datos.get("nombre") else None

    def _parsear_aria_label_tarjeta(self, aria_label: str) -> dict[str, Any]:
        """
        Parsea el aria-label de un enlace de tarjeta Maps.
        Formato típico: "Ford Valencia. 4,2 estrellas. Concesionario. Av. del Cid, 65. Abierto."
        """
        datos: dict[str, Any] = {}
        # Separar por ". " (punto + espacio) preservando abreviaciones comunes
        raw = aria_label.strip().rstrip(".")
        # Proteger abreviaciones comunes antes de splitear
        protected = raw
        for abbr in ("Av.", "av.", "C.", "Ctra.", "Pol.", "Pza.", "Nº.", "nº."):
            protected = protected.replace(abbr, abbr.replace(".", "\x00"))
        segmentos = [s.strip().replace("\x00", ".") for s in protected.split(". ") if s.strip()]

        if not segmentos:
            return datos

        # Primer segmento = nombre
        datos["nombre"] = segmentos[0]

        sector = None
        direccion = None

        for seg in segmentos[1:]:
            seg_lower = seg.lower()

            # Ignorar rating
            if re.search(r"\d[.,]?\d?\s*estrellas?", seg_lower) or re.search(r"\d[.,]?\d?\s*stars?", seg_lower):
                continue

            # Ignorar horario
            if self._contiene_estado_horario(seg):
                continue

            # Ignorar conteo de reseñas
            if re.search(r"^\d[\d.,]*\s*reseñas?$", seg_lower) or re.search(r"^\d[\d.,]*\s*reviews?$", seg_lower):
                continue

            # ¿Dirección?
            if not direccion and self._parece_direccion(seg):
                direccion = seg
                continue

            # ¿Sector? (primer segmento no filtrado)
            if not sector:
                sector = seg

        if sector:
            datos["sector"] = sector
        if direccion:
            datos["direccion"] = direccion

        return datos

    # ── FASE 2: Enriquecimiento con panel de detalle ──────────────────────

    async def _enriquecer_con_panel(
        self, page: Page, datos: dict[str, Any], organizacion_id: str
    ) -> None:
        """Hace clic en una tarjeta, extrae datos del panel y vuelve a la lista."""
        nombre = datos.get("nombre", "?")
        maps_url = datos.get("google_maps_url")

        if not maps_url:
            return

        # Navegar directamente a la URL del lugar (más fiable que re-click en tarjeta)
        try:
            await page.goto(
                maps_url,
                wait_until="domcontentloaded",
                timeout=settings.maps_detail_nav_timeout_ms,
            )
        except Exception as e:
            logger.debug(f"[{organizacion_id}] No se pudo navegar a detalle de '{nombre}': {e}")
            return

        await delay_humano(
            settings.maps_click_delay_min_ms,
            settings.maps_click_delay_max_ms,
        )

        # Esperar panel
        try:
            await page.wait_for_selector(SELECTOR_PANEL_DETALLE, timeout=settings.maps_detail_panel_timeout_ms)
        except Exception:
            logger.debug(f"[{organizacion_id}] Panel no cargó para '{nombre}'")
            await self._volver_a_lista(page)
            return

        # Esperar al menos un campo de datos
        try:
            selectors_any = ", ".join(
                SELECTORES_DIRECCION[:1] + SELECTORES_TELEFONO[:1] + SELECTORES_WEBSITE[:1]
            )
            await page.wait_for_selector(selectors_any, timeout=settings.maps_detail_fields_timeout_ms)
        except Exception:
            pass

        # Extraer datos del panel
        panel = await page.query_selector(SELECTOR_PANEL_DETALLE)
        if not panel:
            await self._volver_a_lista(page)
            return

        # Nombre más preciso desde el panel
        if not datos.get("nombre") or self._es_nombre_generico(datos.get("nombre")):
            for sel in SELECTORES_NOMBRE:
                nombre_el = await page.query_selector(sel)
                if nombre_el:
                    n = self._normalizar_texto(await nombre_el.inner_text())
                    if n and not self._es_nombre_generico(n):
                        datos["nombre"] = n
                        break

        # Dirección
        if not datos.get("direccion"):
            datos["direccion"] = await self._extraer_campo_panel(
                panel, SELECTORES_DIRECCION, prefijos=("Dirección:", "Address:")
            )
            if datos["direccion"] and not self._parece_direccion(datos["direccion"]):
                datos["direccion"] = None
            # Fallback desde texto/html del panel
            if not datos["direccion"]:
                panel_texto = self._normalizar_texto(await panel.inner_text()) or ""
                datos["direccion"] = self._extraer_direccion_desde_texto(panel_texto)
                if not datos["direccion"]:
                    panel_html = await panel.inner_html()
                    datos["direccion"] = self._extraer_direccion_desde_html(panel_html)

        # Teléfono
        if not datos.get("telefono"):
            tel_raw = await self._extraer_campo_panel(
                panel, SELECTORES_TELEFONO, prefijos=("Teléfono:", "Phone:")
            )
            datos["telefono"] = self._extraer_telefono_texto(tel_raw)
            # Fallback: buscar en div.Io6YTe dentro del botón de teléfono
            if not datos["telefono"]:
                for sel in SELECTORES_TELEFONO:
                    tel_el = await panel.query_selector(sel)
                    if tel_el:
                        inner_el = await tel_el.query_selector('div.Io6YTe')
                        if inner_el:
                            t = self._normalizar_texto(await inner_el.inner_text())
                            datos["telefono"] = self._extraer_telefono_texto(t)
                            if datos["telefono"]:
                                break

        # Website / Dominio
        if not datos.get("dominio"):
            for sel in SELECTORES_WEBSITE:
                web_el = await panel.query_selector(sel)
                if web_el:
                    datos["website_texto"] = self._normalizar_texto(await web_el.inner_text())
                    datos["website_href"] = await web_el.get_attribute("href")
                    candidato = datos["website_href"] or datos["website_texto"]
                    if candidato:
                        candidato = candidato.strip()
                        if self._es_url_valida(candidato):
                            datos["dominio"] = self._extraer_dominio(candidato)
                        elif "." in candidato and " " not in candidato:
                            datos["dominio"] = self._extraer_dominio(candidato)
                    if datos.get("dominio"):
                        break
            # Fallback desde texto/html
            if not datos.get("dominio"):
                panel_texto = self._normalizar_texto(await panel.inner_text()) or ""
                datos["dominio"] = self._extraer_dominio_desde_texto(panel_texto)
            if not datos.get("dominio"):
                panel_html = await panel.inner_html()
                datos["dominio"] = self._extraer_dominio_desde_html(panel_html)

        # Sector
        if not datos.get("sector"):
            for sel in SELECTORES_CATEGORIA:
                cat_el = await panel.query_selector(sel)
                if cat_el:
                    datos["sector"] = self._normalizar_texto(await cat_el.inner_text())
                    if datos["sector"]:
                        break

        # Actualizar URL y coordenadas desde la URL actual (más precisa)
        current_url = page.url
        datos["google_maps_url"] = current_url
        datos["google_place_id"] = self._extraer_place_id(current_url) or datos.get("google_place_id")
        lat, lon = self._extraer_lat_lon(current_url)
        if lat is not None:
            datos["latitud"] = lat
            datos["longitud"] = lon

        # Ciudad desde dirección
        if not datos.get("ciudad") and datos.get("direccion"):
            datos["ciudad"] = self._extraer_ciudad(str(datos["direccion"]))

        # Volver a la lista para la siguiente tarjeta
        await self._volver_a_lista(page)

    async def _extraer_campo_panel(
        self,
        panel: ElementHandle,
        selectores: list[str],
        prefijos: tuple[str, ...] = (),
    ) -> str | None:
        """Intenta extraer un campo del panel usando múltiples selectores."""
        for sel in selectores:
            el = await panel.query_selector(sel)
            if not el:
                continue
            valor = await self._extraer_valor_elemento(el, prefijos=prefijos)
            if valor:
                return valor
        return None

    async def _volver_a_lista(self, page: Page) -> bool:
        """Vuelve a la vista de lista tras ver un detalle."""
        back_selectors = [
            'button[aria-label="Atrás"]',
            'button[aria-label="Back"]',
            'button[jsaction*="back"]',
        ]
        for selector in back_selectors:
            btn = await page.query_selector(selector)
            if btn:
                await btn.click()
                await delay_humano(
                    settings.maps_action_delay_min_ms,
                    settings.maps_action_delay_max_ms,
                )
                try:
                    await page.wait_for_selector(
                        'div[role="feed"]',
                        timeout=settings.maps_back_wait_timeout_ms,
                    )
                    return True
                except Exception:
                    pass

        # Fallback: page.go_back()
        try:
            await page.go_back(
                wait_until="domcontentloaded",
                timeout=settings.maps_back_nav_timeout_ms,
            )
            await page.wait_for_selector(
                'div[role="feed"]',
                timeout=settings.maps_back_wait_timeout_ms,
            )
            return True
        except Exception:
            return False

    # ── Provincia ─────────────────────────────────────────────────────────

    def _extraer_provincia(self, direccion: str | None, ciudad: str | None) -> str | None:
        """Extrae la provincia desde la dirección o la ciudad."""
        if direccion:
            dir_lower = direccion.lower()
            for provincia in PROVINCIAS_ESPANA:
                if provincia.lower() in dir_lower:
                    return provincia

        if ciudad:
            return CIUDAD_A_PROVINCIA.get(ciudad.lower().strip())

        return None

    # ── Helpers de cookies / captcha ──────────────────────────────────────

    async def _aceptar_cookies(self, page: Page) -> None:
        try:
            selectores_aceptar = [
                'button[aria-label*="Accept"]',
                'button[aria-label*="Aceptar"]',
                'button#L2AGLb',
                'form[action*="consent"] button:has-text("Accept")',
                'form[action*="consent"] button:has-text("Aceptar")',
            ]
            for selector in selectores_aceptar:
                btn = await page.query_selector(selector)
                if btn:
                    await btn.click()
                    await delay_humano(
                        settings.maps_initial_delay_min_ms,
                        settings.maps_initial_delay_max_ms,
                    )
                    logger.debug("Diálogo de cookies aceptado.")
                    return
        except Exception as e:
            logger.debug(f"No se pudo manejar cookies consent: {e}")

    async def _detectar_captcha(self, page: Page) -> bool:
        contenido = await page.content()
        indicadores = [
            "recaptcha", "unusual traffic", "tráfico inusual",
            "detected unusual traffic", 'id="captcha"',
            'src="https://www.google.com/recaptcha',
        ]
        return any(ind in contenido.lower() for ind in indicadores)

    # ── Helpers de extracción ─────────────────────────────────────────────

    def _extraer_place_id(self, url: str) -> str | None:
        if not url:
            return None
        candidatos: list[str] = []
        candidatos.extend(re.findall(r"!1s([^!]+)", url))
        candidatos.extend(re.findall(r"!16s([^!]+)", url))
        for candidato in reversed(candidatos):
            valor = unquote(candidato).strip().lstrip("/")
            if re.fullmatch(r"0x[0-9a-fA-F]+(?::0x[0-9a-fA-F]+)?", valor):
                return valor
            if re.fullmatch(r"[gm]/[A-Za-z0-9_-]+", valor):
                return valor
        return None

    def _extraer_ciudad(self, direccion: str) -> str | None:
        direccion_limpia = self._normalizar_texto(direccion)
        if not direccion_limpia:
            return None
        direccion_limpia = re.sub(r",?\s*(españa|spain)\s*$", "", direccion_limpia, flags=re.IGNORECASE)

        postal_match = re.search(r"\b\d{5}\s+([A-Za-zÀ-ÿ''\- ]+)$", direccion_limpia)
        if postal_match:
            ciudad_postal = self._normalizar_texto(postal_match.group(1))
            if ciudad_postal and not self._parece_tramo_calle(ciudad_postal):
                return ciudad_postal

        partes = [p.strip() for p in direccion.split(",")]
        partes = [p for p in partes if p]

        if len(partes) == 2:
            candidato = partes[1]
            if re.search(r"\d", candidato) or self._parece_tramo_calle(candidato):
                return None
            return candidato
        if len(partes) == 4:
            candidato = partes[2]
            if self._parece_tramo_calle(candidato):
                return None
            return candidato
        if len(partes) == 3:
            candidato = partes[1]
            if self._parece_tramo_calle(candidato):
                return None
            return candidato
        if len(partes) >= 2:
            candidato = partes[-2]
            if re.search(r"\d", candidato) or self._parece_tramo_calle(candidato):
                return None
            return candidato
        return None

    def _normalizar_texto(self, valor: str | None) -> str | None:
        if not valor:
            return None
        limpio = " ".join(valor.split()).strip()
        return limpio or None

    def _es_nombre_generico(self, nombre: str | None) -> bool:
        if not nombre:
            return True
        nombre_l = nombre.lower().strip()
        return nombre_l in {"resultados", "results", "google maps"}

    def _parsear_tarjeta_texto(self, texto: str) -> dict[str, Any]:
        limpio = self._normalizar_texto(texto) or ""
        if not limpio:
            return {}

        sin_nombre = re.sub(r"^.*?\b\d(?:[\.,]\d)?\s+", "", limpio)

        sector = None
        direccion = None
        telefono = None

        partes = [self._normalizar_texto(p) for p in sin_nombre.split("·")]
        partes = [p for p in partes if p]

        if partes:
            primer = partes[0]
            if not self._contiene_estado_horario(primer):
                sector = primer

        for parte in partes[1:]:
            if not telefono:
                telefono = self._extraer_telefono_texto(parte)
            if not direccion and self._parece_direccion(parte):
                direccion = parte

        return {"sector": sector, "direccion": direccion, "telefono": telefono}

    def _limpiar_nombre_fallback(self, texto: str | None) -> str | None:
        limpio = self._normalizar_texto(texto)
        if not limpio:
            return None
        nombre = re.sub(r"\s+\d(?:[\.,]\d)?\s+.*$", "", limpio)
        nombre = re.sub(r"\s+·\s+.*$", "", nombre)
        return self._normalizar_texto(nombre)

    async def _extraer_valor_elemento(
        self,
        elemento: ElementHandle | None,
        prefijos: tuple[str, ...] = (),
    ) -> str | None:
        if not elemento:
            return None

        candidatos: list[str] = []
        for attr in ("aria-label", "title"):
            valor_attr = await elemento.get_attribute(attr)
            valor_attr = self._normalizar_texto(valor_attr)
            if valor_attr:
                candidatos.append(valor_attr)

        texto = self._normalizar_texto(await elemento.inner_text())
        if texto:
            candidatos.append(texto)

        for candidato in candidatos:
            limpio = candidato
            for prefijo in prefijos:
                if limpio.lower().startswith(prefijo.lower()):
                    limpio = limpio[len(prefijo):].strip()
            limpio = self._normalizar_texto(limpio)
            if limpio:
                return limpio

        return None

    def _extraer_telefono_texto(self, texto: str | None) -> str | None:
        if not texto:
            return None
        match = re.search(r"(?:\+?\d[\d\s().-]{6,}\d)", texto)
        if not match:
            return None
        telefono = re.sub(r"[^\d+]", "", match.group(0))
        return telefono or None

    def _extraer_direccion_desde_texto(self, texto: str | None) -> str | None:
        if not texto:
            return None
        patron = re.compile(
            r"((?:Calle|Carrer|Cam[ií]|Camino|Avenida|Av\.?|Plaza|Carretera|Pol[ií]gono|Paseo)\s+[^\n,]+(?:,\s*\d+[A-Za-z]?[^\n]*)?)",
            re.IGNORECASE,
        )
        match = patron.search(texto)
        if not match:
            return None
        direccion = self._normalizar_texto(match.group(1))
        if direccion and self._parece_direccion(direccion):
            return direccion
        return None

    def _extraer_dominio_desde_texto(self, texto: str | None) -> str | None:
        if not texto:
            return None
        match = re.search(r"\b((?:https?://)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+)\b", texto)
        if not match:
            return None
        candidato = match.group(1)
        if self._es_url_valida(candidato):
            return self._extraer_dominio(candidato)
        if "." in candidato and " " not in candidato:
            return self._extraer_dominio(candidato)
        return None

    def _extraer_direccion_desde_html(self, panel_html: str | None) -> str | None:
        if not panel_html:
            return None
        patrones = [
            r'"formattedAddress":"([^\"]+)"',
            r'"address":"([^\"]+)"',
        ]
        for patron in patrones:
            for match in re.finditer(patron, panel_html):
                candidato = self._decodificar_cadena_json(match.group(1))
                if candidato and self._parece_direccion(candidato):
                    return candidato
        return None

    def _extraer_dominio_desde_html(self, panel_html: str | None) -> str | None:
        if not panel_html:
            return None
        for match in re.finditer(r'https?:\\/\\/[^\"\s]+', panel_html):
            raw = match.group(0).replace("\\/", "/")
            if "google.com" in raw or "gstatic.com" in raw:
                continue
            dominio = self._extraer_dominio(raw)
            if dominio:
                return dominio
        return None

    def _decodificar_cadena_json(self, valor: str | None) -> str | None:
        if not valor:
            return None
        texto = valor
        texto = texto.replace("\\u0026", "&")
        texto = texto.replace("\\/", "/")
        texto = bytes(texto, "utf-8").decode("unicode_escape")
        texto = html.unescape(texto)
        return self._normalizar_texto(texto)

    def _extraer_lat_lon(self, url: str | None) -> tuple[float | None, float | None]:
        if not url:
            return None, None
        match = re.search(r"!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)", url)
        if not match:
            return None, None
        try:
            return float(match.group(1)), float(match.group(2))
        except ValueError:
            return None, None

    def _extraer_ciudad_de_location(self, location: str | None) -> str | None:
        if not location:
            return None
        partes = [p.strip() for p in location.split(",") if p.strip()]
        if not partes:
            return None
        primera = partes[0]
        if re.search(r"\d", primera):
            return None
        return primera

    def _contiene_estado_horario(self, texto: str) -> bool:
        t = texto.lower()
        return any(p in t for p in ("abierto", "cerrado", "apertura", "cierra", "horario", "open", "closed"))

    def _parece_direccion(self, texto: str) -> bool:
        t = self._normalizar_texto(texto)
        if not t:
            return False
        if self._contiene_estado_horario(t):
            return False
        if self._extraer_telefono_texto(t):
            return False
        if re.search(r",\s*\d", t):
            return True
        return self._parece_tramo_calle(t)

    def _parece_tramo_calle(self, texto: str) -> bool:
        t = texto.lower()
        claves = [
            "calle", "carrer", "camí", "cami", "camino", "avenida", "av.",
            "plaza", "carretera", "polígono", "poligono", "paseo", "travess",
            "ronda", "passeig", "plaça", "glorieta", "c/", "c.",
        ]
        return any(c in t for c in claves)
