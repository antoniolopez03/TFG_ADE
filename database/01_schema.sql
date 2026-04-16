-- ==============================================
-- 01_schema.sql
-- Esquema completo LeadBy — Arquitectura Serverless v4
-- Gemini mock como fuente de datos (sin Apollo, sin n8n)
-- ==============================================

-- ============================================================
-- DOMINIO 1: TENANT Y CONTROL DE ACCESO
-- ============================================================

-- Entidad raíz: la empresa cliente del SaaS
CREATE TABLE IF NOT EXISTS organizaciones (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre          TEXT NOT NULL,
    slug            TEXT UNIQUE NOT NULL,
    plan            TEXT NOT NULL DEFAULT 'free',
    activa          BOOLEAN NOT NULL DEFAULT true,
    configuracion   JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT plan_valido CHECK (plan IN ('free', 'starter', 'pro'))
);

COMMENT ON TABLE organizaciones IS 'Tenant raíz: empresa cliente del SaaS.';

-- Miembros del equipo: vincula auth.users con organizaciones
CREATE TABLE IF NOT EXISTS miembros_equipo (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacion_id UUID NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_completo TEXT,
    cargo           TEXT,
    rol             TEXT NOT NULL DEFAULT 'miembro',
    activo          BOOLEAN NOT NULL DEFAULT true,
    invited_at      TIMESTAMPTZ,
    joined_at       TIMESTAMPTZ DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT rol_valido CHECK (rol IN ('admin', 'miembro')),
    CONSTRAINT unique_user_org UNIQUE (organizacion_id, user_id)
);

COMMENT ON TABLE miembros_equipo IS 'Vincula usuarios de Supabase Auth con sus organizaciones y roles.';

-- Configuración por tenant
-- Solo el token de HubSpot va en Vault (pertenece al cliente).
-- Apollo, Gemini y Resend son claves del sistema → variables de entorno en Vercel.
CREATE TABLE IF NOT EXISTS configuracion_tenant (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacion_id         UUID NOT NULL UNIQUE REFERENCES organizaciones(id) ON DELETE CASCADE,
    crm_proveedor           TEXT NOT NULL DEFAULT 'hubspot',
    hubspot_token_vault_id  UUID,
    preferencias_ia         JSONB NOT NULL DEFAULT '{}',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT crm_valido CHECK (crm_proveedor IN ('hubspot', 'salesforce', 'none'))
);

COMMENT ON TABLE configuracion_tenant IS 'Preferencias por tenant. Solo el token HubSpot va en Vault. Gemini/Resend son variables de entorno del sistema.';
COMMENT ON COLUMN configuracion_tenant.hubspot_token_vault_id IS 'UUID del secreto en vault.secrets. Nunca almacenar el token en texto plano.';

-- ============================================================
-- DOMINIO 2: LEADS (privado por tenant)
-- Zona de cuarentena: los datos esperan aprobación humana
-- antes de viajar al CRM del cliente.
-- ============================================================

CREATE TABLE IF NOT EXISTS leads (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- TENANT
    organizacion_id             UUID NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
    asignado_a                  UUID REFERENCES auth.users(id),

    -- EMPRESA
    empresa_nombre              TEXT NOT NULL,
    empresa_dominio             TEXT,
    empresa_sector              TEXT,
    empresa_empleados_rango     TEXT,           -- '1-10' | '11-50' | '51-200' | '201-500' | '500+'
    empresa_facturacion_rango   TEXT,           -- '<1M€' | '1M-10M€' | '10M-50M€' | '50M-100M€' | '>100M€'
    empresa_ciudad              TEXT,
    empresa_pais                TEXT NOT NULL DEFAULT 'ES',
    empresa_telefono            TEXT,
    empresa_linkedin_url        TEXT,
    empresa_descripcion         TEXT,           -- párrafo generado por Gemini para contextualizar el email

    -- CONTACTO
    contacto_nombre_completo    TEXT,
    contacto_cargo              TEXT,
    contacto_departamento       TEXT,
    contacto_email              TEXT,
    contacto_telefono           TEXT,
    contacto_linkedin_url       TEXT,

    -- CICLO DE VIDA
    estado                      TEXT NOT NULL DEFAULT 'nuevo',
    fuente                      TEXT NOT NULL DEFAULT 'prospeccion', -- prospeccion | lookalike

    -- EMAIL (Human-in-the-Loop)
    email_asunto                TEXT,
    email_borrador              TEXT,           -- generado por Gemini, pendiente revisión del comercial
    email_aprobado              TEXT,           -- versión final aprobada por el comercial
    email_enviado_at            TIMESTAMPTZ,

    -- CRM
    hubspot_contact_id          TEXT,
    hubspot_deal_id             TEXT,
    resend_message_id           TEXT,

    -- METADATOS
    notas                       TEXT,
    metadata                    JSONB NOT NULL DEFAULT '{}',
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT estado_valido CHECK (estado IN (
        'nuevo', 'pendiente_aprobacion', 'aprobado', 'enviado', 'descartado'
    )),
    CONSTRAINT fuente_valida CHECK (fuente IN ('prospeccion', 'lookalike')),
    -- Una empresa solo puede aparecer una vez por tenant
    CONSTRAINT unique_empresa_por_tenant UNIQUE (organizacion_id, empresa_nombre)
);

COMMENT ON TABLE leads IS 'Lead completo por tenant: empresa + contacto + ciclo de vida. Generado via Gemini mock.';
COMMENT ON COLUMN leads.email_borrador IS 'Draft generado por Gemini. El comercial DEBE revisarlo antes de enviar.';
COMMENT ON COLUMN leads.email_aprobado IS 'Versión final editada y aprobada por el comercial. Enviada via Resend.';
COMMENT ON COLUMN leads.empresa_descripcion IS 'Párrafo generado por Gemini para contextualizar el email hiperpersonalizado.';

-- ============================================================
-- DOMINIO 3: CUMPLIMIENTO (RGPD/LSSI)
-- ============================================================

CREATE TABLE IF NOT EXISTS email_opt_outs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacion_id UUID NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
    lead_id         UUID REFERENCES leads(id) ON DELETE SET NULL,
    email           TEXT NOT NULL,
    reason          TEXT,
    source          TEXT NOT NULL DEFAULT 'email_link',
    unsubscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT email_opt_outs_email_not_empty CHECK (char_length(trim(email)) > 3),
    CONSTRAINT email_opt_outs_source_valido CHECK (source IN ('email_link', 'manual', 'api')),
    CONSTRAINT email_opt_outs_unique_org_email UNIQUE (organizacion_id, email)
);

COMMENT ON TABLE email_opt_outs IS 'Registro de bajas de comunicaciones comerciales por organización. Cumplimiento RGPD/LSSI.';
COMMENT ON COLUMN email_opt_outs.email IS 'Email normalizado en minúsculas para deduplicar bajas por tenant.';

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

CREATE TRIGGER trg_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trg_email_opt_outs_updated_at
    BEFORE UPDATE ON email_opt_outs
    FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

-- Normalizar email a minúsculas en opt-outs
CREATE OR REPLACE FUNCTION normalizar_email_opt_out()
RETURNS TRIGGER AS $$
BEGIN
    NEW.email := lower(trim(NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_email_opt_outs_normalizar_email
    BEFORE INSERT OR UPDATE ON email_opt_outs
    FOR EACH ROW EXECUTE FUNCTION normalizar_email_opt_out();