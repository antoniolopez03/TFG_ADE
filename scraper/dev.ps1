# dev.ps1 - Comandos de desarrollo para Windows PowerShell
# Uso: .\dev.ps1 <comando>
# Comandos disponibles: install, run, test-manual, docker-build, docker-run

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

switch ($Command) {
    "install" {
        Write-Host "Instalando dependencias..." -ForegroundColor Cyan
        pip install -r requirements.txt
        playwright install chromium
    }
    "run" {
        Write-Host "Levantando servidor en http://localhost:8000 ..." -ForegroundColor Cyan
        Write-Host "Swagger UI disponible en http://localhost:8000/docs" -ForegroundColor Green
        uvicorn app.main:app --reload --port 8000
    }
    "test-manual" {
        # Leer API key del .env
        $apiKey = "test-api-key-local-dev"
        if (Test-Path ".env") {
            $envLine = Get-Content ".env" | Where-Object { $_ -match "^API_KEY=" }
            if ($envLine) { $apiKey = $envLine -replace "^API_KEY=", "" }
        }
        $baseUrl = "http://localhost:8000"

        Write-Host "==========================================" -ForegroundColor Yellow
        Write-Host "  Pruebas manuales del Scraper"
        Write-Host "  URL: $baseUrl"
        Write-Host "==========================================" -ForegroundColor Yellow

        # Test 1: Health
        Write-Host "`n[1/5] Health Check" -ForegroundColor Yellow
        Invoke-RestMethod -Uri "$baseUrl/health" | ConvertTo-Json

        # Test 2: Sin API key (401)
        Write-Host "`n[2/5] Sin API key (esperado: 401)" -ForegroundColor Yellow
        try {
            Invoke-RestMethod -Uri "$baseUrl/scrape/maps" -Method Post `
                -ContentType "application/json" `
                -Body '{"query":"test","location":"test","organizacion_id":"test"}'
        } catch {
            if ($_.Exception.Response.StatusCode -eq 401) {
                Write-Host "OK: Recibido 401 (correcto)" -ForegroundColor Green
            } else {
                Write-Host "ERROR: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
            }
        }

        # Test 3: API key incorrecta (401)
        Write-Host "`n[3/5] API key incorrecta (esperado: 401)" -ForegroundColor Yellow
        try {
            Invoke-RestMethod -Uri "$baseUrl/scrape/maps" -Method Post `
                -ContentType "application/json" `
                -Headers @{"X-API-Key" = "wrong-key"} `
                -Body '{"query":"test","location":"test","organizacion_id":"test"}'
        } catch {
            if ($_.Exception.Response.StatusCode -eq 401) {
                Write-Host "OK: Recibido 401 (correcto)" -ForegroundColor Green
            } else {
                Write-Host "ERROR: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
            }
        }

        # Test 4: Maps real
        Write-Host "`n[4/5] Scrape Google Maps (max_results=3, espera 30-60s...)" -ForegroundColor Yellow
        $body = @{
            query = "restaurantes"
            location = "Valencia, Espana"
            max_results = 3
            organizacion_id = "test-manual"
        } | ConvertTo-Json
        Invoke-RestMethod -Uri "$baseUrl/scrape/maps" -Method Post `
            -ContentType "application/json" `
            -Headers @{"X-API-Key" = $apiKey} `
            -Body $body | ConvertTo-Json -Depth 10

        # Test 5: Dorks real
        Write-Host "`n[5/5] Scrape Google Dorks (max_results=3, espera 30-60s...)" -ForegroundColor Yellow
        $body = @{
            dork_query = 'site:es.linkedin.com/in "CEO" "Madrid"'
            max_results = 3
            organizacion_id = "test-manual"
        } | ConvertTo-Json
        Invoke-RestMethod -Uri "$baseUrl/scrape/dorks" -Method Post `
            -ContentType "application/json" `
            -Headers @{"X-API-Key" = $apiKey} `
            -Body $body | ConvertTo-Json -Depth 10

        Write-Host "`n==========================================" -ForegroundColor Yellow
        Write-Host "  Pruebas completadas"
        Write-Host "==========================================" -ForegroundColor Yellow
    }
    "docker-build" {
        Write-Host "Construyendo imagen Docker..." -ForegroundColor Cyan
        docker build -t tfg-scraper .
    }
    "docker-run" {
        Write-Host "Ejecutando contenedor Docker en puerto 8000..." -ForegroundColor Cyan
        docker run -p 8000:8000 --env-file .env tfg-scraper
    }
    default {
        Write-Host "Uso: .\dev.ps1 <comando>" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Comandos disponibles:"
        Write-Host "  install      - Instala dependencias Python y Playwright Chromium"
        Write-Host "  run          - Levanta el servidor en http://localhost:8000"
        Write-Host "  test-manual  - Ejecuta pruebas contra el servidor local"
        Write-Host "  docker-build - Construye la imagen Docker"
        Write-Host "  docker-run   - Ejecuta el contenedor Docker"
    }
}
