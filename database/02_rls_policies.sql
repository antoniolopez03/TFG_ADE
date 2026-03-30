-- ==============================================
-- 02_rls_policies.sql
-- Row Level Security (RLS) - Aislamiento Multitenant
-- Garantiza que ningún tenant acceda a datos de otro
-- ==============================================

-- ============================================================
-- FUNCIÓN HELPER: Obtener organizaciones del usuario actual
-- SECURITY DEFINER: corre como postgres, puede leer miembros_equipo
-- sin que el usuario tenga permisos directos sobre la tabla
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
    'Devuelve los UUIDs de organizaciones a las que pertenece el usuario autenticado. '
    'Usada en políticas RLS para evitar joins repetidos.';

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
ALTER TABLE leads_prospectados    ENABLE ROW LEVEL SECURITY;
ALTER TABLE trabajos_scraping     ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLÍTICAS: organizaciones
-- Los usuarios solo ven sus propias organizaciones
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

-- INSERT solo vía service role (onboarding de nuevos tenants)
-- No se crea política de INSERT para authenticated: usa service role en n8n

-- ============================================================
-- POLÍTICAS: miembros_equipo
-- Los usuarios ven a todos los miembros de sus organizaciones
-- y pueden ver su propio perfil en cualquier org
-- ============================================================

CREATE POLICY "Ver miembros de mis organizaciones"
    ON miembros_equipo FOR SELECT
    TO authenticated
    USING (
        organizacion_id IN (SELECT get_user_organizacion_ids())
        OR user_id = auth.uid()
    );

CREATE POLICY "Admins pueden invitar/actualizar miembros"
    ON miembros_equipo FOR UPDATE
    TO authenticated
    USING (es_admin_de_org(organizacion_id))
    WITH CHECK (es_admin_de_org(organizacion_id));

CREATE POLICY "Admins pueden agregar miembros"
    ON miembros_equipo FOR INSERT
    TO authenticated
    WITH CHECK (es_admin_de_org(organizacion_id));

-- Soft delete: nunca DELETE, usar activo = false
-- No se crea política DELETE para authenticated

-- ============================================================
-- POLÍTICAS: configuracion_tenant
-- Solo miembros de la organización pueden ver su configuración
-- Solo admins pueden modificarla
-- ============================================================

CREATE POLICY "Ver configuración de mis organizaciones"
    ON configuracion_tenant FOR SELECT
    TO authenticated
    USING (organizacion_id IN (SELECT get_user_organizacion_ids()));

CREATE POLICY "Admins pueden actualizar configuración"
    ON configuracion_tenant FOR UPDATE
    TO authenticated
    USING (es_admin_de_org(organizacion_id))
    WITH CHECK (es_admin_de_org(organizacion_id));

-- INSERT solo vía service role durante onboarding

-- ============================================================
-- POLÍTICAS: global_empresas
-- LECTURA: todos los usuarios autenticados (es un catálogo compartido)
-- ESCRITURA: solo service role (n8n con SUPABASE_SERVICE_ROLE_KEY)
-- ============================================================

CREATE POLICY "Usuarios autenticados pueden ver empresas globales"
    ON global_empresas FOR SELECT
    TO authenticated
    USING (true);

-- No se crean políticas INSERT/UPDATE/DELETE para authenticated
-- Solo el service role (n8n/scraper) puede escribir

-- ============================================================
-- POLÍTICAS: global_contactos
-- Idéntico a global_empresas: lectura libre, escritura solo service role
-- ============================================================

CREATE POLICY "Usuarios autenticados pueden ver contactos globales"
    ON global_contactos FOR SELECT
    TO authenticated
    USING (true);

-- ============================================================
-- POLÍTICAS: leads_prospectados
-- AISLAMIENTO ESTRICTO: un tenant nunca ve leads de otro tenant
-- ============================================================

CREATE POLICY "Ver leads de mis organizaciones"
    ON leads_prospectados FOR SELECT
    TO authenticated
    USING (organizacion_id IN (SELECT get_user_organizacion_ids()));

CREATE POLICY "Crear leads en mis organizaciones"
    ON leads_prospectados FOR INSERT
    TO authenticated
    WITH CHECK (organizacion_id IN (SELECT get_user_organizacion_ids()));

CREATE POLICY "Actualizar leads de mis organizaciones"
    ON leads_prospectados FOR UPDATE
    TO authenticated
    USING (organizacion_id IN (SELECT get_user_organizacion_ids()))
    WITH CHECK (organizacion_id IN (SELECT get_user_organizacion_ids()));

-- Descartados se actualizan via UPDATE (estado = 'descartado'), no DELETE
CREATE POLICY "Admins pueden eliminar leads de su organización"
    ON leads_prospectados FOR DELETE
    TO authenticated
    USING (
        organizacion_id IN (SELECT get_user_organizacion_ids())
        AND es_admin_de_org(organizacion_id)
    );

-- ============================================================
-- POLÍTICAS: trabajos_scraping
-- Los usuarios ven y crean jobs de sus propias organizaciones
-- Solo service role (n8n callback) puede actualizar el estado
-- ============================================================

CREATE POLICY "Ver jobs de mis organizaciones"
    ON trabajos_scraping FOR SELECT
    TO authenticated
    USING (organizacion_id IN (SELECT get_user_organizacion_ids()));

CREATE POLICY "Crear jobs en mis organizaciones"
    ON trabajos_scraping FOR INSERT
    TO authenticated
    WITH CHECK (
        organizacion_id IN (SELECT get_user_organizacion_ids())
        AND created_by = auth.uid()
    );

-- UPDATE de estado: solo via service role (n8n actualiza progreso y resultado)
-- No se crea política UPDATE para authenticated

-- ============================================================
-- NOTA IMPORTANTE SOBRE EL SERVICE ROLE:
-- El SUPABASE_SERVICE_ROLE_KEY bypasa TODAS las políticas RLS.
-- Úsalo exclusivamente en:
--   - n8n (servidor): para actualizar estados de jobs y leads
--   - API Routes de Next.js (server-side): solo tras verificar auth del usuario
-- NUNCA lo expongas en código cliente o con prefijo NEXT_PUBLIC_
-- ============================================================
