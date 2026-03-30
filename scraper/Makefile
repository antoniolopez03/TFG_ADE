.PHONY: install run test-manual docker-build docker-run

# Instalar dependencias y navegador Playwright
install:
	pip install -r requirements.txt
	playwright install chromium

# Levantar servidor en modo desarrollo (con hot-reload)
run:
	uvicorn app.main:app --reload --port 8000

# Ejecutar pruebas manuales contra el servidor local
test-manual:
	bash test_manual.sh

# Construir imagen Docker
docker-build:
	docker build -t tfg-scraper .

# Ejecutar contenedor Docker
docker-run:
	docker run -p 8000:8000 --env-file .env tfg-scraper
