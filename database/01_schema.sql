-- ==============================================
-- 01_schema.sql
-- Esquema completo LeadBy — Arquitectura Serverless v3
-- Apollo.io como única fuente de datos
-- Sin n8n, sin scraper Python
-- ==============================================

-- ============================================================
-- DOMINIO 1: TENANT Y CONTROL DE ACCESO
-- ============================================================

-- Entidad raíz: la empresa cliente del SaaS
CREATE TABLE IF NOT EXISTS organizaciones (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre          TEXT NOT NULL,
    slug            TEXT UNIQUE NOT NULL,       -- usado en URLs
    plan            TEXT NOT NULL DEFAULT 'free', -- free | starter | pro
    activa          BOOLEAN NOT NULL DEFAULT true,
    configuracion   JSONB NOT NULL DEFAULT '{}', -- preferencias flexibles
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT plan_valido CHECK (plan IN ('free', 'starter', 'pro'))
);

COMMENT ON TABLE organizaciones IS 'Tenant raíz: empresa cliente del SaaS.';
COMMENT ON COLUMN organizaciones.slug IS 'Identificador URL-friendly único por organización.';

-- Miembros del equipo: vincula auth.users con organizaciones
CREATE TABLE IF NOT EXISTS miembros_equipo (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacion_id UUID NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_completo TEXT,
    cargo           TEXT,
    rol             TEXT NOT NULL DEFAULT 'miembro', -- admin | miembro
    activo          BOOLEAN NOT NULL DEFAULT true,
    invited_at      TIMESTAMPTZ,
    joined_at       TIMESTAMPTZ DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT rol_valido CHECK (rol IN ('admin', 'miembro')),
    CONSTRAINT unique_user_org UNIQUE (organizacion_id, user_id)
);

COMMENT ON TABLE miembros_equipo IS 'Vincula usuarios de Supabase Auth con sus organizaciones y roles.';

-- Configuración por tenant
-- NOTA: Apollo, Gemini y Resend son claves del SISTEMA → variables de entorno en Vercel.
-- Solo el token de HubSpot va en Vault porque pertenece al tenant, no al sistema.
CREATE TABLE IF NOT EXISTS configuracion_tenant (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacion_id         UUID NOT NULL UNIQUE REFERENCES organizaciones(id) ON DELETE CASCADE,
    crm_proveedor           TEXT NOT NULL DEFAULT 'hubspot', -- hubspot | salesforce | none
    -- UUID de referencia al secreto en Supabase Vault (nunca el valor en texto plano)
    hubspot_token_vault_id  UUID,
    -- Preferencias de IA: tono de voz, propuesta de valor, sector objetivo
    preferencias_ia         JSONB NOT NULL DEFAULT '{}',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT crm_valido CHECK (crm_proveedor IN ('hubspot', 'salesforce', 'none'))
);

COMMENT ON TABLE configuracion_tenant IS 'Preferencias por tenant. Solo el token HubSpot va en Vault (es del cliente). Apollo/Gemini/Resend son variables de entorno del sistema.';
COMMENT ON COLUMN configuracion_tenant.hubspot_token_vault_id IS 'UUID del secreto en vault.secrets. Nunca almacenar el token en texto plano.';

-- ============================================================
-- DOMINIO 2: GLOBAL (DATA MOAT — Caché compartida y anónima)
-- Lectura: todos los usuarios autenticados.
-- Escritura: solo service role (API Routes server-side).
-- ============================================================

-- Directorio global de empresas enriquecidas via Apollo.io
CREATE TABLE IF NOT EXISTS global_empresas (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre              TEXT NOT NULL,
    dominio             TEXT UNIQUE,            -- clave principal de caché (cache hit = 0 créditos Apollo)
    apollo_org_id       TEXT UNIQUE,            -- ID en Apollo para evitar duplicados
    linkedin_url        TEXT,
    sector              TEXT,
    empleados_rango     TEXT,                   -- '1-10' | '11-50' | '51-200' | '200+'
    ingresos_rango      TEXT,                   -- '0-1M' | '1-10M' | '10-100M' | '100M+'
    tecnologias         JSONB NOT NULL DEFAULT '[]'::jsonb, -- stack tecnológico detectado por Apollo
    descripcion         TEXT,
    ciudad              TEXT,
    provincia           TEXT,
    pais                TEXT NOT NULL DEFAULT 'ES',
    telefono            TEXT,
    fuente              TEXT NOT NULL DEFAULT 'apollo',
    ultima_verificacion TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT global_empresas_fuente_valido CHECK (
        fuente IN ('apollo', 'manual')
    ),
    CONSTRAINT global_empresas_tecnologias_array CHECK (
        jsonb_typeof(tecnologias) = 'array'
    ),
    CONSTRAINT global_empresas_ingresos_rango_valido CHECK (
        ingresos_rango IS NULL OR ingresos_rango IN ('0-1M', '1-10M', '10-100M', '100M+')
    )
);

COMMENT ON TABLE global_empresas IS 'Data Moat: directorio global de empresas enriquecidas via Apollo.io. Cache hit = 0 créditos Apollo.';
COMMENT ON COLUMN global_empresas.dominio IS 'UNIQUE: clave principal de caché. Buscar aquí antes de llamar a Apollo.';
COMMENT ON COLUMN global_empresas.apollo_org_id IS 'UNIQUE: evita duplicados si el mismo dominio aparece con variantes en Apollo.';

-- Directorio global de contactos decisores (CEOs, Directores, etc.)
CREATE TABLE IF NOT EXISTS global_contactos (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id          UUID NOT NULL REFERENCES global_empresas(id) ON DELETE CASCADE,
    apollo_contact_id   TEXT UNIQUE,            -- ID en Apollo para evitar duplicados
    nombre              TEXT,
    apellidos           TEXT,
    cargo               TEXT,
    seniority           TEXT,                   -- nivel jerárquico según Apollo
    departamento        TEXT,                   -- área funcional según Apollo
    email               TEXT,
    email_status        TEXT,                   -- calidad del email según Apollo
    linkedin_url        TEXT,
    telefono            TEXT,
    fuente              TEXT NOT NULL DEFAULT 'apollo',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT global_contactos_fuente_valido CHECK (
        fuente IN ('apollo', 'manual')
    ),
    CONSTRAINT global_contactos_email_status_valido CHECK (
        email_status IS NULL OR email_status IN (
            'verified', 'unverified', 'catch_all', 'unknown', 'invalid'
        )
    ),
    CONSTRAINT global_contactos_seniority_valido CHECK (
        seniority IS NULL OR seniority IN (
            'owner', 'founder', 'c_suite', 'vp', 'director',
            'manager', 'senior', 'entry', 'unknown'
        )
    )
);

COMMENT ON TABLE global_contactos IS 'Decisores enriquecidos via Apollo.io (CEOs, Directores de Compras, etc.).';
COMMENT ON COLUMN global_contactos.apollo_contact_id IS 'UNIQUE: evita duplicar el mismo contacto si aparece en múltiples búsquedas.';

-- ============================================================
-- DOMINIO 3: TRANSACCIONAL (privado por tenant)
-- Zona de cuarentena: los datos esperan aprobación humana
-- antes de viajar al CRM del cliente.
-- ============================================================

-- Registro de búsquedas realizadas via Apollo.io
-- Las búsquedas son síncronas (API Route → Apollo → respuesta inmediata)
-- Esta tabla existe para auditoría e historial del usuario.
CREATE TABLE IF NOT EXISTS trabajos_busqueda (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacion_id UUID NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
    tipo            TEXT NOT NULL,              -- apollo_search | apollo_lookalike
    parametros      JSONB NOT NULL,             -- sector, ubicacion, tamaño, cargo, etc.
    estado          TEXT NOT NULL DEFAULT 'completado',
    total_resultados INTEGER NOT NULL DEFAULT 0,
    error_mensaje   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by      UUID NOT NULL REFERENCES auth.users(id),

    CONSTRAINT tipo_valido CHECK (tipo IN ('apollo_search', 'apollo_lookalike')),
    CONSTRAINT estado_valido CHECK (estado IN ('completado', 'error'))
);

COMMENT ON TABLE trabajos_busqueda IS 'Auditoría de búsquedas via Apollo.io. Síncrono: se crea y resuelve en la misma API Route de Next.js.';

-- Tabla pivot: conecta un contacto global con un tenant específico
-- Es la zona de cuarentena del Human-in-the-Loop
CREATE TABLE IF NOT EXISTS leads_prospectados (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacion_id     UUID NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
    empresa_id          UUID NOT NULL REFERENCES global_empresas(id),
    contacto_id         UUID REFERENCES global_contactos(id),
    asignado_a          UUID REFERENCES auth.users(id),
    trabajo_busqueda_id UUID REFERENCES trabajos_busqueda(id),

    -- Estado del ciclo Human-in-the-Loop
    -- pendiente_aprobacion → aprobado → enviado
    --                      → descartado
    estado              TEXT NOT NULL DEFAULT 'pendiente_aprobacion',

    -- Flujo Human-in-the-Loop: Gemini genera, comercial revisa, comercial envía
    borrador_email      TEXT,   -- generado por Google Gemini, pendiente de revisión
    email_aprobado      TEXT,   -- editado y aprobado por el comercial
    email_asunto        TEXT,

    -- Metadatos de envío y sincronización CRM
    email_enviado_at    TIMESTAMPTZ,
    hubspot_contact_id  TEXT,
    hubspot_deal_id     TEXT,
    resend_message_id   TEXT,

    notas               TEXT,
    metadata            JSONB NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT estado_valido CHECK (estado IN (
        'pendiente_aprobacion', 'aprobado', 'enviado', 'descartado'
    )),
    -- Un tenant no puede tener el mismo contacto dos veces
    CONSTRAINT unique_contacto_por_tenant UNIQUE (organizacion_id, contacto_id)
);

COMMENT ON TABLE leads_prospectados IS 'Zona de cuarentena por tenant. Ningún dato viaja al CRM sin aprobación humana explícita (Human-in-the-Loop).';
COMMENT ON COLUMN leads_prospectados.borrador_email IS 'Generado por Google Gemini. El comercial DEBE revisarlo antes de enviar.';
COMMENT ON COLUMN leads_prospectados.email_aprobado IS 'Versión final editada y aprobada por el comercial. Enviada via Resend.';

-- ============================================================
-- TRIGGERS: updated_at automático en todas las tablas
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