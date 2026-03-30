"""
dependencies.py
Dependencias compartidas de FastAPI (autenticación, etc.).
"""

from typing import Optional

from fastapi import Header, HTTPException

from app.config import settings


async def verificar_api_key(x_api_key: Optional[str] = Header(default=None)):
    """Verifica que la petición incluye la API key correcta."""
    if not x_api_key or x_api_key != settings.api_key:
        raise HTTPException(status_code=401, detail="API key inválida o ausente.")
    return x_api_key
