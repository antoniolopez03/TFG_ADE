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
-- configuracion_tenant
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_config_tenant_org_id
    ON configuracion_tenant(organizacion_id);

-- ============================================================
-- leads — consultas del panel principal del comercial
-- ============================================================

-- Vista principal: tenant + estado (la query más frecuente del sistema)
CREATE INDEX IF NOT EXISTS idx_leads_org_estado
    ON leads(organizacion_id, estado);

-- Ordenación por fecha de creación (vista "más recientes")
CREATE INDEX IF NOT EXISTS idx_leads_org_created
    ON leads(organizacion_id, created_at DESC);

-- Filtro por comercial asignado
CREATE INDEX IF NOT EXISTS idx_leads_asignado_a
    ON leads(asignado_a)
    WHERE asignado_a IS NOT NULL;

-- Filtro por fuente (prospección vs lookalike)
CREATE INDEX IF NOT EXISTS idx_leads_fuente
    ON leads(organizacion_id, fuente);

-- ============================================================
-- email_opt_outs — verificación antes de cada envío
-- ============================================================

-- Lookup crítico: comprobar si un email está dado de baja antes de enviar
CREATE INDEX IF NOT EXISTS idx_opt_outs_org_email
    ON email_opt_outs(organizacion_id, email);

-- Historial de bajas ordenado por fecha
CREATE INDEX IF NOT EXISTS idx_opt_outs_org_created
    ON email_opt_outs(organizacion_id, created_at DESC);