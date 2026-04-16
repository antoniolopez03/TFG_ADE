-- ==============================================
-- 02_rls_policies.sql
-- Row Level Security (RLS) — Aislamiento Multitenant
-- Garantiza que ningún tenant acceda a datos de otro
-- ==============================================

-- ============================================================
-- FUNCIONES HELPER
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_organizacion_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT organizacion_id
    FROM miembros_equipo
    WHERE user_id = auth.uid()
      AND activo = true;
$$;

COMMENT ON FUNCTION get_user_organizacion_ids IS
    'Devuelve los UUIDs de organizaciones del usuario autenticado. '
    'Usada en todas las políticas RLS para evitar joins repetidos.';

CREATE OR REPLACE FUNCTION es_admin_de_org(org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM miembros_equipo
        WHERE user_id = auth.uid()
          AND organizacion_id = org_id
          AND rol = 'admin'
          AND activo = true
    );
$$;

-- ============================================================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- ============================================================

ALTER TABLE organizaciones       ENABLE ROW LEVEL SECURITY;
ALTER TABLE miembros_equipo      ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_tenant ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads                ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_opt_outs       ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLÍTICAS: organizaciones
-- ============================================================

CREATE POLICY "Ver propias organizaciones"
    ON organizaciones FOR SELECT
    TO authenticated
    USING (id IN (SELECT get_user_organizacion_ids()));

CREATE POLICY "Admins pueden actualizar su organización"
    ON organizaciones FOR UPDATE
    TO authenticated
    USING (es_admin_de_org(id))
    WITH CHECK (es_admin_de_org(id));

-- INSERT solo via service role (onboarding de nuevos tenants)

-- ============================================================
-- POLÍTICAS: miembros_equipo
-- ============================================================

CREATE POLICY "Ver miembros de mis organizaciones"
    ON miembros_equipo FOR SELECT
    TO authenticated
    USING (
        organizacion_id IN (SELECT get_user_organizacion_ids())
        OR user_id = auth.uid()
    );

CREATE POLICY "Admins pueden agregar miembros"
    ON miembros_equipo FOR INSERT
    TO authenticated
    WITH CHECK (es_admin_de_org(organizacion_id));

CREATE POLICY "Admins pueden actualizar miembros"
    ON miembros_equipo FOR UPDATE
    TO authenticated
    USING (es_admin_de_org(organizacion_id))
    WITH CHECK (es_admin_de_org(organizacion_id));

-- Soft delete: usar activo = false, nunca DELETE

-- ============================================================
-- POLÍTICAS: configuracion_tenant
-- ============================================================

CREATE POLICY "Ver configuración de mi organización"
    ON configuracion_tenant FOR SELECT
    TO authenticated
    USING (organizacion_id IN (SELECT get_user_organizacion_ids()));

CREATE POLICY "Admins pueden actualizar configuración"
    ON configuracion_tenant FOR UPDATE
    TO authenticated
    USING (es_admin_de_org(organizacion_id))
    WITH CHECK (es_admin_de_org(organizacion_id));

-- INSERT solo via service role durante onboarding

-- ============================================================
-- POLÍTICAS: leads
-- Aislamiento estricto: un tenant nunca ve leads de otro
-- ============================================================

CREATE POLICY "Ver leads de mi organización"
    ON leads FOR SELECT
    TO authenticated
    USING (organizacion_id IN (SELECT get_user_organizacion_ids()));

CREATE POLICY "Crear leads en mi organización"
    ON leads FOR INSERT
    TO authenticated
    WITH CHECK (organizacion_id IN (SELECT get_user_organizacion_ids()));

CREATE POLICY "Actualizar leads de mi organización"
    ON leads FOR UPDATE
    TO authenticated
    USING (organizacion_id IN (SELECT get_user_organizacion_ids()))
    WITH CHECK (organizacion_id IN (SELECT get_user_organizacion_ids()));

CREATE POLICY "Admins pueden eliminar leads de su organización"
    ON leads FOR DELETE
    TO authenticated
    USING (
        organizacion_id IN (SELECT get_user_organizacion_ids())
        AND es_admin_de_org(organizacion_id)
    );

-- ============================================================
-- POLÍTICAS: email_opt_outs
-- Lectura: usuarios del tenant. Escritura: solo service role.
-- ============================================================

CREATE POLICY "Ver opt-outs de mi organización"
    ON email_opt_outs FOR SELECT
    TO authenticated
    USING (organizacion_id IN (SELECT get_user_organizacion_ids()));

-- INSERT/UPDATE via service role (bajas desde enlaces públicos de email)

-- ============================================================
-- IMPORTANTE: SUPABASE_SERVICE_ROLE_KEY
-- Bypasa TODAS las políticas RLS.
-- Usar ÚNICAMENTE en API Routes de Next.js (server-side)
-- NUNCA en código cliente ni con prefijo NEXT_PUBLIC_
-- ============================================================