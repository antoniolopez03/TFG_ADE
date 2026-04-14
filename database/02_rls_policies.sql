-- ==============================================
-- 02_rls_policies.sql
-- Row Level Security (RLS) — Aislamiento Multitenant
-- Garantiza que ningún tenant acceda a datos de otro
-- ==============================================

-- ============================================================
-- FUNCIÓN HELPER: Obtener organizaciones del usuario actual
-- SECURITY DEFINER: corre como postgres, evita que el usuario
-- necesite permisos directos sobre miembros_equipo
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

-- ============================================================
-- FUNCIÓN HELPER: Verificar si el usuario es admin de una org
-- ============================================================

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

ALTER TABLE organizaciones        ENABLE ROW LEVEL SECURITY;
ALTER TABLE miembros_equipo       ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_tenant  ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_empresas       ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_contactos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE trabajos_busqueda     ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads_prospectados    ENABLE ROW LEVEL SECURITY;

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

-- INSERT solo via service role (onboarding de nuevos tenants desde API Route)

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
-- POLÍTICAS: global_empresas
-- Lectura: todos los usuarios autenticados (catálogo compartido)
-- Escritura: solo service role (API Routes server-side con SUPABASE_SERVICE_ROLE_KEY)
-- ============================================================

CREATE POLICY "Usuarios autenticados pueden ver empresas globales"
    ON global_empresas FOR SELECT
    TO authenticated
    USING (true);

-- No hay políticas INSERT/UPDATE/DELETE para authenticated.
-- Las API Routes de Next.js usan SUPABASE_SERVICE_ROLE_KEY para escribir.

-- ============================================================
-- POLÍTICAS: global_contactos
-- Idéntico a global_empresas: lectura libre, escritura solo service role
-- ============================================================

CREATE POLICY "Usuarios autenticados pueden ver contactos globales"
    ON global_contactos FOR SELECT
    TO authenticated
    USING (true);

-- ============================================================
-- POLÍTICAS: trabajos_busqueda
-- ============================================================

CREATE POLICY "Ver mis búsquedas"
    ON trabajos_busqueda FOR SELECT
    TO authenticated
    USING (organizacion_id IN (SELECT get_user_organizacion_ids()));

CREATE POLICY "Crear búsquedas en mi organización"
    ON trabajos_busqueda FOR INSERT
    TO authenticated
    WITH CHECK (
        organizacion_id IN (SELECT get_user_organizacion_ids())
        AND created_by = auth.uid()
    );

-- UPDATE solo via service role (las API Routes actualizan estado y resultados)

-- ============================================================
-- POLÍTICAS: leads_prospectados
-- Aislamiento estricto: un tenant nunca ve leads de otro
-- ============================================================

CREATE POLICY "Ver leads de mi organización"
    ON leads_prospectados FOR SELECT
    TO authenticated
    USING (organizacion_id IN (SELECT get_user_organizacion_ids()));

CREATE POLICY "Crear leads en mi organización"
    ON leads_prospectados FOR INSERT
    TO authenticated
    WITH CHECK (organizacion_id IN (SELECT get_user_organizacion_ids()));

CREATE POLICY "Actualizar leads de mi organización"
    ON leads_prospectados FOR UPDATE
    TO authenticated
    USING (organizacion_id IN (SELECT get_user_organizacion_ids()))
    WITH CHECK (organizacion_id IN (SELECT get_user_organizacion_ids()));

CREATE POLICY "Admins pueden eliminar leads de su organización"
    ON leads_prospectados FOR DELETE
    TO authenticated
    USING (
        organizacion_id IN (SELECT get_user_organizacion_ids())
        AND es_admin_de_org(organizacion_id)
    );

-- ============================================================
-- IMPORTANTE: SUPABASE_SERVICE_ROLE_KEY
-- Bypasa TODAS las políticas RLS.
-- Usar ÚNICAMENTE en:
--   - API Routes de Next.js (server-side) tras verificar auth del usuario
-- NUNCA en código cliente ni con prefijo NEXT_PUBLIC_
-- ============================================================