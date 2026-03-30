-- ==============================================
-- 01_schema.sql
-- Esquema completo de la plataforma SaaS B2B
-- Arquitectura Multitenant con Data Moat (caché global)
-- ==============================================

-- ============================================================
-- DOMINIO 1: TENANT Y CONTROL DE ACCESO
-- ============================================================

-- La entidad raíz: la empresa cliente del SaaS
CREATE TABLE IF NOT EXISTS organizaciones (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre              TEXT NOT NULL,
    slug                TEXT UNIQUE NOT NULL,           -- usado en URLs
    plan                TEXT NOT NULL DEFAULT 'free',   -- free | starter | pro
    activa              BOOLEAN NOT NULL DEFAULT true,
    configuracion       JSONB NOT NULL DEFAULT '{}',    -- preferencias flexibles
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT plan_valido CHECK (plan IN ('free', 'starter', 'pro'))
);

COMMENT ON TABLE organizaciones IS 'Tenant raíz: empresa cliente del SaaS.';
COMMENT ON COLUMN organizaciones.slug IS 'Identificador URL-friendly único por organización.';

-- Miembros del equipo: vincula auth.users con organizaciones (N:M para org-switching)
CREATE TABLE IF NOT EXISTS miembros_equipo (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacion_id     UUID NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_completo     TEXT,
    cargo               TEXT,
    rol                 TEXT NOT NULL DEFAULT 'miembro', -- admin | miembro
    activo              BOOLEAN NOT NULL DEFAULT true,
    invited_at          TIMESTAMPTZ,
    joined_at           TIMESTAMPTZ DEFAULT now(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT rol_valido CHECK (rol IN ('admin', 'miembro')),
    CONSTRAINT unique_user_org UNIQUE (organizacion_id, user_id)
);

COMMENT ON TABLE miembros_equipo IS 'Vincula usuarios de Supabase Auth con sus organizaciones y roles.';

-- Configuración por tenant: referencias a secretos en Vault (nunca valores en texto plano)
CREATE TABLE IF NOT EXISTS configuracion_tenant (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacion_id             UUID NOT NULL UNIQUE REFERENCES organizaciones(id) ON DELETE CASCADE,
    crm_proveedor               TEXT DEFAULT 'hubspot',          -- hubspot | salesforce | none
    -- UUID de referencia al secreto en Supabase Vault (no el valor real)
    hubspot_token_vault_id      UUID,
    resend_api_key_vault_id     UUID,
    gemini_api_key_vault_id     UUID,
    -- Preferencias de IA: tono de voz, propuesta de valor, sector objetivo
    preferencias_ia             JSONB NOT NULL DEFAULT '{}',
    -- Configuración del scraper por tenant
    scraper_config              JSONB NOT NULL DEFAULT '{"max_results": 20, "delay_ms": 2000}',
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE configuracion_tenant IS 'Preferencias por tenant. Los tokens API se almacenan en Supabase Vault; aquí solo el UUID de referencia.';
COMMENT ON COLUMN configuracion_tenant.hubspot_token_vault_id IS 'UUID del secreto en vault.secrets, no el token en texto plano.';

-- ============================================================
-- DOMINIO 2: GLOBAL (DATA MOAT - Caché compartida y anónima)
-- Estas tablas son de solo lectura para los usuarios.
-- Solo el service role (n8n/scraper) puede escribir en ellas.
-- ============================================================

-- Directorio global de empresas extraídas de internet
CREATE TABLE IF NOT EXISTS global_empresas (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre              TEXT NOT NULL,
    dominio             TEXT UNIQUE,                    -- clave de deduplicación
    telefono            TEXT,
    direccion           TEXT,
    ciudad              TEXT,
    provincia           TEXT,
    pais                TEXT NOT NULL DEFAULT 'ES',
    sector              TEXT,
    empleados_rango     TEXT,                           -- '1-10' | '11-50' | '51-200' | '200+'
    descripcion         TEXT,
    google_maps_url     TEXT,
    google_place_id     TEXT UNIQUE,
    fuente              TEXT NOT NULL DEFAULT 'google_maps', -- google_maps | google_dorks | manual
    datos_adicionales   JSONB NOT NULL DEFAULT '{}',
    ultima_verificacion TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE global_empresas IS 'Directorio global de empresas (Data Moat). Compartida entre todos los tenants para reducir llamadas a APIs externas.';
COMMENT ON COLUMN global_empresas.dominio IS 'Campo UNIQUE para evitar duplicados. Clave de búsqueda de caché.';

-- Directorio global de contactos (decisores: CEOs, Directores, etc.)
CREATE TABLE IF NOT EXISTS global_contactos (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id          UUID NOT NULL REFERENCES global_empresas(id) ON DELETE CASCADE,
    nombre              TEXT,
    apellidos           TEXT,
    cargo               TEXT,
    email               TEXT,
    linkedin_url        TEXT,
    telefono            TEXT,
    fuente              TEXT NOT NULL DEFAULT 'apollo', -- apollo | linkedin | manual
    datos_adicionales   JSONB NOT NULL DEFAULT '{}',
    verificado          BOOLEAN NOT NULL DEFAULT false,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE global_contactos IS 'Decisores de empresas (CEOs, Directores). Enriquecidos via Apollo.io o scraping.';

-- ============================================================
-- DOMINIO 3: TRANSACCIONAL (Zona de Cuarentena por Tenant)
-- Privado para cada tenant. Datos en preparación antes de
-- enviarse al CRM del cliente.
-- ============================================================

-- Tabla pivot: conecta una empresa global con un tenant específico
CREATE TABLE IF NOT EXISTS leads_prospectados (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacion_id     UUID NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
    empresa_id          UUID NOT NULL REFERENCES global_empresas(id),
    contacto_id         UUID REFERENCES global_contactos(id),
    asignado_a          UUID REFERENCES auth.users(id),

    -- Estado del ciclo de vida (Human-in-the-Loop)
    estado              TEXT NOT NULL DEFAULT 'nuevo',
    -- nuevo | enriqueciendo | pendiente_aprobacion | aprobado | enviado | descartado

    -- Contenido del email (flujo Human-in-the-Loop)
    email_borrador      TEXT,                           -- generado por Gemini, en revisión
    email_aprobado      TEXT,                           -- versión final aprobada por el comercial
    email_asunto        TEXT,

    -- Metadatos de envío y CRM
    email_enviado_at    TIMESTAMPTZ,
    hubspot_contact_id  TEXT,
    hubspot_deal_id     TEXT,
    resend_message_id   TEXT,

    -- Correlación con jobs de scraping/n8n
    n8n_job_id          TEXT,
    trabajo_scraping_id UUID,

    notas               TEXT,
    metadata            JSONB NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT estado_valido CHECK (estado IN (
        'nuevo', 'enriqueciendo', 'pendiente_aprobacion',
        'aprobado', 'enviado', 'descartado'
    )),
    -- Un tenant no puede tener la misma empresa dos veces
    CONSTRAINT unique_lead_por_tenant UNIQUE (organizacion_id, empresa_id)
);

COMMENT ON TABLE leads_prospectados IS 'Zona de cuarentena por tenant. Ningún dato viaja al CRM sin aprobación humana explícita.';
COMMENT ON COLUMN leads_prospectados.email_borrador IS 'Draft generado por Google Gemini. Pendiente de revisión y aprobación del comercial.';
COMMENT ON COLUMN leads_prospectados.email_aprobado IS 'Texto final aprobado y posiblemente editado por el comercial antes del envío.';

-- Cola de trabajos de scraping (permite polling desde el frontend)
CREATE TABLE IF NOT EXISTS trabajos_scraping (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacion_id     UUID NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
    tipo                TEXT NOT NULL,                  -- google_maps | google_dorks
    parametros          JSONB NOT NULL,                 -- query, location, filters, limit
    estado              TEXT NOT NULL DEFAULT 'pendiente',
    -- pendiente | ejecutando | completado | error
    total_resultados    INTEGER NOT NULL DEFAULT 0,
    procesados          INTEGER NOT NULL DEFAULT 0,
    error_mensaje       TEXT,
    n8n_execution_id    TEXT,
    iniciado_at         TIMESTAMPTZ,
    completado_at       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by          UUID NOT NULL REFERENCES auth.users(id),

    CONSTRAINT tipo_valido CHECK (tipo IN ('google_maps', 'google_dorks')),
    CONSTRAINT estado_valido CHECK (estado IN ('pendiente', 'ejecutando', 'completado', 'error'))
);

COMMENT ON TABLE trabajos_scraping IS 'Cola de jobs asíncronos. El frontend hace polling sobre esta tabla via Supabase Realtime.';

-- ============================================================
-- TRIGGERS: updated_at automático
-- ============================================================

CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_organizaciones_updated_at
    BEFORE UPDATE ON organizaciones
    FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trg_miembros_equipo_updated_at
    BEFORE UPDATE ON miembros_equipo
    FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trg_configuracion_tenant_updated_at
    BEFORE UPDATE ON configuracion_tenant
    FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trg_global_empresas_updated_at
    BEFORE UPDATE ON global_empresas
    FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trg_global_contactos_updated_at
    BEFORE UPDATE ON global_contactos
    FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trg_leads_prospectados_updated_at
    BEFORE UPDATE ON leads_prospectados
    FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
