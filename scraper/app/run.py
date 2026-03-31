import uvicorn
import asyncio
import sys

# 1. Aplicamos el parche ANTES de que Uvicorn o FastAPI hagan nada
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

# 2. Arrancamos el servidor
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)