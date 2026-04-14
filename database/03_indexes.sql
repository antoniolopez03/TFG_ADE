-- ==============================================
-- 03_indexes.sql
-- Índices de rendimiento para consultas frecuentes
-- ==============================================

-- ============================================================
-- miembros_equipo
-- Crítico: usado en get_user_organizacion_ids() que se ejecuta
-- en CADA política RLS del sistema
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_miembros_user_id
    ON miembros_equipo(user_id)
    WHERE activo = true;

CREATE INDEX IF NOT EXISTS idx_miembros_organizacion_id
    ON miembros_equipo(organizacion_id)
    WHERE activo = true;

-- ============================================================
-- global_empresas — deduplicación y búsqueda de caché
-- ============================================================

-- Clave principal de caché: buscar por dominio antes de llamar a Apollo
CREATE INDEX IF NOT EXISTS idx_empresas_dominio
    ON global_empresas(dominio)
    WHERE dominio IS NOT NULL;

-- Deduplicación por ID de Apollo
CREATE INDEX IF NOT EXISTS idx_empresas_apollo_org_id
    ON global_empresas(apollo_org_id)
    WHERE apollo_org_id IS NOT NULL;

-- Búsqueda por ciudad y sector (para estadísticas y filtros)
CREATE INDEX IF NOT EXISTS idx_empresas_ciudad_sector
    ON global_empresas(ciudad, sector)
    WHERE ciudad IS NOT NULL;

-- ============================================================
-- global_contactos — lookups por empresa y deduplicación
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_contactos_empresa_id
    ON global_contactos(empresa_id);

-- Deduplicación por ID de Apollo
CREATE INDEX IF NOT EXISTS idx_contactos_apollo_contact_id
    ON global_contactos(apollo_contact_id)
    WHERE apollo_contact_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contactos_email
    ON global_contactos(email)
    WHERE email IS NOT NULL;

-- ============================================================
-- trabajos_busqueda — historial y auditoría
-- ============================================================

-- Historial por organización ordenado por fecha
CREATE INDEX IF NOT EXISTS idx_trabajos_org_created
    ON trabajos_busqueda(organizacion_id, created_at DESC);

-- Filtro por estado (ver búsquedas con error, etc.)
CREATE INDEX IF NOT EXISTS idx_trabajos_org_estado
    ON trabajos_busqueda(organizacion_id, estado);

-- ============================================================
-- leads_prospectados — consultas del panel principal
-- ============================================================

-- Más importante: tenant + estado (vista principal del comercial)
CREATE INDEX IF NOT EXISTS idx_leads_org_estado
    ON leads_prospectados(organizacion_id, estado);

-- Ordenación por fecha de creación (vista "más recientes")
CREATE INDEX IF NOT EXISTS idx_leads_org_created
    ON leads_prospectados(organizacion_id, created_at DESC);

-- Filtro por comercial asignado
CREATE INDEX IF NOT EXISTS idx_leads_asignado_a
    ON leads_prospectados(asignado_a)
    WHERE asignado_a IS NOT NULL;

-- Lookup por empresa (comprobar si ya existe un lead para esa empresa)
CREATE INDEX IF NOT EXISTS idx_leads_empresa_id
    ON leads_prospectados(empresa_id);

-- Lookup por trabajo de búsqueda (ver qué leads generó cada búsqueda)
CREATE INDEX IF NOT EXISTS idx_leads_trabajo_busqueda_id
    ON leads_prospectados(trabajo_busqueda_id)
    WHERE trabajo_busqueda_id IS NOT NULL;

-- ============================================================
-- configuracion_tenant
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_config_tenant_org_id
    ON configuracion_tenant(organizacion_id);