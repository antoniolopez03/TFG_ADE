-- ==============================================
-- 04_vault_helpers.sql
-- Funciones RPC para gestión de secretos via Supabase Vault
-- Llamadas por n8n con la Service Role Key
-- ==============================================

-- ============================================================
-- Guardar el token API de HubSpot de un tenant en Vault
-- Retorna el UUID del secreto (se guarda en configuracion_tenant)
-- Llamar durante el onboarding del tenant
-- ============================================================

CREATE OR REPLACE FUNCTION guardar_hubspot_token(
    p_organizacion_id   UUID,
    p_token             TEXT,
    p_nombre_empresa    TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
    v_secret_id UUID;
BEGIN
    -- Crear o actualizar el secreto en Vault
    SELECT vault.create_secret(
        p_token,
        'hubspot_' || p_organizacion_id::text,
        'HubSpot API Token - ' || p_nombre_empresa
    ) INTO v_secret_id;

    -- Guardar referencia UUID en configuracion_tenant (upsert)
    INSERT INTO configuracion_tenant (organizacion_id, hubspot_token_vault_id)
    VALUES (p_organizacion_id, v_secret_id)
    ON CONFLICT (organizacion_id)
    DO UPDATE SET
        hubspot_token_vault_id = v_secret_id,
        updated_at = now();

    RETURN v_secret_id;
END;
$$;

-- ============================================================
-- Recuperar el token API de HubSpot de un tenant
-- Solo accesible con Service Role Key (n8n)
-- vault.decrypted_secrets descifra en memoria
-- ============================================================

CREATE OR REPLACE FUNCTION obtener_hubspot_token(p_organizacion_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
    v_token TEXT;
BEGIN
    SELECT ds.decrypted_secret INTO v_token
    FROM vault.decrypted_secrets ds
    JOIN configuracion_tenant ct ON ct.hubspot_token_vault_id = ds.id
    WHERE ct.organizacion_id = p_organizacion_id;

    RETURN v_token;
END;
$$;

-- ============================================================
-- Rotar (actualizar) el token de HubSpot sin cambiar el UUID
-- ============================================================

CREATE OR REPLACE FUNCTION rotar_hubspot_token(
    p_organizacion_id   UUID,
    p_nuevo_token       TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
    v_secret_id UUID;
BEGIN
    SELECT hubspot_token_vault_id INTO v_secret_id
    FROM configuracion_tenant
    WHERE organizacion_id = p_organizacion_id;

    IF v_secret_id IS NULL THEN
        RAISE EXCEPTION 'No existe configuración para la organización %', p_organizacion_id;
    END IF;

    PERFORM vault.update_secret(v_secret_id, p_nuevo_token);
END;
$$;

-- ============================================================
-- NOTA DE USO EN N8N:
--
-- Inserción durante onboarding:
--   SELECT guardar_hubspot_token(
--     '{{$json.organizacion_id}}'::uuid,
--     '{{$json.hubspot_token}}',
--     '{{$json.nombre_empresa}}'
--   );
--
-- Recuperación antes de llamar a HubSpot API:
--   SELECT obtener_hubspot_token('{{$json.organizacion_id}}'::uuid);
--
-- Estas funciones requieren Service Role Key en el cliente Supabase de n8n.
-- NUNCA se llaman desde el frontend.
-- ============================================================
