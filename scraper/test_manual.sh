#!/bin/bash
# ==============================================
# Script de pruebas manuales del Scraper
# ==============================================
# Uso: bash test_manual.sh [BASE_URL] [API_KEY]
#
# Prerequisitos:
#   1. Copiar .env.example a .env
#   2. Levantar el servidor: make run
#   3. Ejecutar este script en otra terminal

BASE_URL="${1:-http://localhost:8000}"
API_KEY="${2:-test-api-key-local-dev}"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "  Pruebas manuales del Scraper"
echo "  URL: $BASE_URL"
echo "=========================================="
echo ""

# ---- Test 1: Health Check ----
echo -e "${YELLOW}[1/4] Health Check${NC}"
echo "GET $BASE_URL/health"
echo "---"
curl -s "$BASE_URL/health" | python -m json.tool 2>/dev/null || curl -s "$BASE_URL/health"
echo ""
echo ""

# ---- Test 2: Auth sin API key (debe dar 401) ----
echo -e "${YELLOW}[2/4] Auth sin API key (esperado: 401)${NC}"
echo "POST $BASE_URL/scrape/maps (sin X-API-Key)"
echo "---"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/scrape/maps" \
  -H "Content-Type: application/json" \
  -d '{"query":"test","location":"test","organizacion_id":"test"}')
if [ "$HTTP_CODE" = "401" ]; then
  echo -e "${GREEN}OK: Recibido 401 (correcto)${NC}"
else
  echo -e "${RED}ERROR: Esperado 401, recibido $HTTP_CODE${NC}"
fi
echo ""

# ---- Test 3: Auth con API key incorrecta (debe dar 401) ----
echo -e "${YELLOW}[3/4] Auth con API key incorrecta (esperado: 401)${NC}"
echo "POST $BASE_URL/scrape/maps (X-API-Key: wrong-key)"
echo "---"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/scrape/maps" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: wrong-key" \
  -d '{"query":"test","location":"test","organizacion_id":"test"}')
if [ "$HTTP_CODE" = "401" ]; then
  echo -e "${GREEN}OK: Recibido 401 (correcto)${NC}"
else
  echo -e "${RED}ERROR: Esperado 401, recibido $HTTP_CODE${NC}"
fi
echo ""

# ---- Test 4: Scrape Google Maps (real) ----
echo -e "${YELLOW}[4/4] Scrape Google Maps (real - max_results=3)${NC}"
echo "POST $BASE_URL/scrape/maps"
echo "Esto puede tardar 30-60 segundos..."
echo "---"
curl -s -X POST "$BASE_URL/scrape/maps" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "query": "restaurantes",
    "location": "Valencia, España",
    "max_results": 3,
    "organizacion_id": "test-manual"
  }' | python -m json.tool 2>/dev/null || echo "(respuesta no es JSON válido)"
echo ""
echo ""

echo "=========================================="
echo "  Pruebas completadas"
echo "=========================================="
