"""
run.py - Entry point para desarrollo local en Windows.

En Windows, uvicorn con --reload crea el event loop antes de que app/main.py
pueda cambiar la politica asyncio. Este script establece ProactorEventLoop
como primer paso, antes de importar uvicorn, garantizando que Playwright
pueda lanzar subprocesos.

En produccion (Docker/Linux): se usa el CMD del Dockerfile directamente.
"""
import sys
import asyncio

# DEBE ejecutarse antes de cualquier import de uvicorn o asyncio
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000)
