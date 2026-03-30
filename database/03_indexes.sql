-- ==============================================
-- 03_indexes.sql
-- Índices de rendimiento para consultas frecuentes
-- ==============================================

-- ============================================================
-- miembros_equipo - consultas más frecuentes del sistema
-- (usadas en get_user_organizacion_ids() - crítico para RLS)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_miembros_user_id
    ON miembros_equipo(user_id)
    WHERE activo = true;

CREATE INDEX IF NOT EXISTS idx_miembros_organizacion_id
    ON miembros_equipo(organizacion_id)
    WHERE activo = true;

-- ============================================================
-- global_empresas - deduplicación y búsqueda de caché
-- ============================================================

-- Clave principal de caché: dominio (UNIQUE ya crea índice, este es explícito)
CREATE INDEX IF NOT EXISTS idx_empresas_dominio
    ON global_empresas(dominio)
    WHERE dominio IS NOT NULL;

-- Para deduplicación por Google Place ID
CREATE INDEX IF NOT EXISTS idx_empresas_place_id
    ON global_empresas(google_place_id)
    WHERE google_place_id IS NOT NULL;

-- Búsqueda por ciudad/sector (para estadísticas internas)
CREATE INDEX IF NOT EXISTS idx_empresas_ciudad_sector
    ON global_empresas(ciudad, sector)
    WHERE ciudad IS NOT NULL;

-- ============================================================
-- global_contactos - lookups por empresa
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_contactos_empresa_id
    ON global_contactos(empresa_id);

CREATE INDEX IF NOT EXISTS idx_contactos_email
    ON global_contactos(email)
    WHERE email IS NOT NULL;

-- ============================================================
-- leads_prospectados - consultas del panel de gestión
-- ============================================================

-- Más importante: filtrar por tenant + estado (vista principal del usuario)
CREATE INDEX IF NOT EXISTS idx_leads_org_estado
    ON leads_prospectados(organizacion_id, estado);

-- Ordenación por fecha de creación (vista "más recientes")
CREATE INDEX IF NOT EXISTS idx_leads_org_created
    ON leads_prospectados(organizacion_id, created_at DESC);

-- Filtro por comercial asignado
CREATE INDEX IF NOT EXISTS idx_leads_asignado_a
    ON leads_prospectados(asignado_a)
    WHERE asignado_a IS NOT NULL;

-- Lookup por empresa (para comprobar si ya existe como lead)
CREATE INDEX IF NOT EXISTS idx_leads_empresa_id
    ON leads_prospectados(empresa_id);

-- ============================================================
-- trabajos_scraping - polling del frontend
-- ============================================================

-- Vista principal: mis jobs por estado
CREATE INDEX IF NOT EXISTS idx_trabajos_org_estado
    ON trabajos_scraping(organizacion_id, estado);

-- Polling por ID de trabajo específico
CREATE INDEX IF NOT EXISTS idx_trabajos_n8n_id
    ON trabajos_scraping(n8n_execution_id)
    WHERE n8n_execution_id IS NOT NULL;

-- Jobs recientes (listado de historial)
CREATE INDEX IF NOT EXISTS idx_trabajos_created
    ON trabajos_scraping(organizacion_id, created_at DESC);

-- ============================================================
-- configuracion_tenant
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_config_tenant_org_id
    ON configuracion_tenant(organizacion_id);
