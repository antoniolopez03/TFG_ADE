"""
anti_bot.py
Técnicas de evasión de sistemas anti-bot para scraping responsable.
El objetivo es simular comportamiento humano, no sobrecargar servidores.
"""

import asyncio
import random
from typing import Optional
from playwright.async_api import BrowserContext, Page


# Pool de User-Agents reales (actualizar periódicamente)
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
]

# Resoluciones de pantalla comunes (evitar resoluciones sospechosas como 800x600)
VIEWPORTS = [
    {"width": 1920, "height": 1080},
    {"width": 1440, "height": 900},
    {"width": 1366, "height": 768},
    {"width": 2560, "height": 1440},
    {"width": 1280, "height": 800},
]

# Script de stealth: inyectado en cada página para eliminar huellas de Playwright
STEALTH_SCRIPT = """
() => {
    // Eliminar huella de webdriver
    Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
        configurable: true
    });

    // Simular plugins de navegador real
    Object.defineProperty(navigator, 'plugins', {
        get: () => [
            { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
            { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: '' },
            { name: 'Native Client', filename: 'internal-nacl-plugin', description: '' }
        ]
    });

    // Simular idiomas reales
    Object.defineProperty(navigator, 'languages', {
        get: () => ['es-ES', 'es', 'en-US', 'en']
    });

    // Eliminar propiedad específica de Playwright
    delete window.__playwright;
    delete window.__pw_manual;

    // Simular hardware concurrency real (no 0 que indica VM)
    Object.defineProperty(navigator, 'hardwareConcurrency', {
        get: () => 8
    });

    // Simular memoria del dispositivo
    Object.defineProperty(navigator, 'deviceMemory', {
        get: () => 8
    });
}
"""


def get_random_user_agent() -> str:
    return random.choice(USER_AGENTS)


def get_random_viewport() -> dict:
    return random.choice(VIEWPORTS)


async def delay_humano(min_ms: int = 1500, max_ms: int = 4000) -> None:
    """Pausa aleatoria para simular lectura/procesamiento humano."""
    segundos = random.uniform(min_ms / 1000, max_ms / 1000)
    await asyncio.sleep(segundos)


async def delay_corto() -> None:
    """Pausa corta para simular interacciones rápidas (hover, foco)."""
    await asyncio.sleep(random.uniform(0.3, 0.8))


async def configurar_contexto(browser, config) -> BrowserContext:
    """
    Crea un nuevo contexto de navegador con todas las medidas anti-detección.
    Un contexto nuevo por job evita correlación de cookies/fingerprint entre búsquedas.
    """
    context = await browser.new_context(
        user_agent=get_random_user_agent(),
        viewport=get_random_viewport(),
        locale="es-ES",
        timezone_id="Europe/Madrid",
        # Evitar que el navegador comparta geolocalización real
        permissions=[],
        # Headers HTTP que imitan un navegador real
        extra_http_headers={
            "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "DNT": "1",
            "Upgrade-Insecure-Requests": "1",
        },
    )

    # Inyectar script de stealth en todas las páginas del contexto
    await context.add_init_script(STEALTH_SCRIPT)

    return context


async def simular_scroll_humano(page: Page, pasos: int = 5) -> None:
    """
    Simula el scroll gradual que haría un humano al revisar resultados.
    Usa incrementos variables con pequeñas pausas entre cada uno.
    """
    for _ in range(pasos):
        # Scroll de cantidad variable (no siempre el mismo valor)
        pixels = random.randint(300, 700)
        await page.mouse.wheel(0, pixels)
        await asyncio.sleep(random.uniform(0.5, 1.5))


async def mover_mouse_aleatorio(page: Page) -> None:
    """
    Mueve el cursor a una posición aleatoria de la pantalla.
    Evita la detección de cursores que nunca se mueven (comportamiento de bot).
    """
    viewport = page.viewport_size
    if viewport:
        x = random.randint(100, viewport["width"] - 100)
        y = random.randint(100, viewport["height"] - 100)
        await page.mouse.move(x, y)
        await delay_corto()


async def navegar_con_retry(
    page: Page,
    url: str,
    max_reintentos: int = 3,
    timeout_ms: int = 30000
) -> bool:
    """
    Navega a una URL con reintentos automáticos.
    Maneja errores de red y respuestas de rate limiting (429, 403).
    """
    for intento in range(max_reintentos):
        try:
            response = await page.goto(url, wait_until="domcontentloaded", timeout=timeout_ms)

            if response and response.status == 429:
                # Rate limited: esperar más tiempo antes del siguiente intento
                espera = (intento + 1) * 10  # 10s, 20s, 30s
                await asyncio.sleep(espera)
                continue

            if response and response.status in (403, 401):
                return False  # Bloqueado permanentemente, no reintentar

            return True

        except Exception as e:
            if intento < max_reintentos - 1:
                await asyncio.sleep(2 ** intento)  # backoff exponencial
            else:
                raise e

    return False
