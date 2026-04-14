-- ==============================================
-- 05_email_opt_outs.sql
-- Persistencia de bajas (opt-out) para cumplimiento RGPD/LSSI
-- Ejecutar manualmente en Supabase SQL Editor
-- ==============================================

CREATE TABLE IF NOT EXISTS email_opt_outs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacion_id UUID NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
    contacto_id     UUID REFERENCES global_contactos(id) ON DELETE SET NULL,
    lead_id         UUID REFERENCES leads_prospectados(id) ON DELETE SET NULL,
    email           TEXT NOT NULL,
    reason          TEXT,
    source          TEXT NOT NULL DEFAULT 'email_link', -- email_link | manual | api
    unsubscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT email_opt_outs_email_not_empty CHECK (char_length(trim(email)) > 3),
    CONSTRAINT email_opt_outs_source_valido CHECK (source IN ('email_link', 'manual', 'api')),
    CONSTRAINT email_opt_outs_unique_org_email UNIQUE (organizacion_id, email)
);

COMMENT ON TABLE email_opt_outs IS 'Registro de bajas de comunicaciones comerciales por organizacion.';
COMMENT ON COLUMN email_opt_outs.email IS 'Email normalizado en minusculas para deduplicar bajas por tenant.';
COMMENT ON COLUMN email_opt_outs.reason IS 'Motivo opcional de baja (clic de enlace o peticion manual).';

CREATE INDEX IF NOT EXISTS idx_email_opt_outs_org_created
    ON email_opt_outs(organizacion_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_opt_outs_contacto_id
    ON email_opt_outs(contacto_id)
    WHERE contacto_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_opt_outs_lead_id
    ON email_opt_outs(lead_id)
    WHERE lead_id IS NOT NULL;

-- Reutiliza la funcion global definida en 01_schema.sql
DROP TRIGGER IF EXISTS trg_email_opt_outs_updated_at ON email_opt_outs;
CREATE TRIGGER trg_email_opt_outs_updated_at
    BEFORE UPDATE ON email_opt_outs
    FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

-- Normalizar email a minúsculas para deduplicación correcta
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

ALTER TABLE email_opt_outs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver opt-outs de mi organizacion"
    ON email_opt_outs FOR SELECT
    TO authenticated
    USING (organizacion_id IN (SELECT get_user_organizacion_ids()));

-- No crear policies de INSERT/UPDATE/DELETE para authenticated.
-- Las bajas publicas se registran desde API Routes con Service Role Key.
