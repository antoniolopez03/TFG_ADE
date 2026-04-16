-- ==============================================
-- 04_vault_helpers.sql
-- Funciones RPC para gestión del token HubSpot via Supabase Vault
-- Llamadas por las API Routes de Next.js con Service Role Key
-- ==============================================

-- ============================================================
-- Guardar el token HubSpot de un tenant en Vault
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
    SELECT vault.create_secret(
        p_token,
        'hubspot_' || p_organizacion_id::text,
        'HubSpot API Token - ' || p_nombre_empresa
    ) INTO v_secret_id;

    INSERT INTO configuracion_tenant (organizacion_id, hubspot_token_vault_id)
    VALUES (p_organizacion_id, v_secret_id)
    ON CONFLICT (organizacion_id)
    DO UPDATE SET
        hubspot_token_vault_id = v_secret_id,
        updated_at = now();

    RETURN v_secret_id;
END;
$$;

COMMENT ON FUNCTION guardar_hubspot_token IS
    'Almacena el token HubSpot del tenant en Vault y guarda el UUID de referencia '
    'en configuracion_tenant. Llamar durante el onboarding. Requiere Service Role Key.';

-- ============================================================
-- Recuperar el token HubSpot de un tenant
-- El descifrado ocurre exclusivamente en memoria
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

COMMENT ON FUNCTION obtener_hubspot_token IS
    'Recupera y descifra el token HubSpot del tenant desde Vault. Requiere Service Role Key.';

-- ============================================================
-- Rotar el token HubSpot sin cambiar el UUID de referencia
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

COMMENT ON FUNCTION rotar_hubspot_token IS
    'Actualiza el token HubSpot en Vault manteniendo el mismo UUID. '
    'Usar para rotación periódica de credenciales. Requiere Service Role Key.';

-- ============================================================
-- USO EN API ROUTES DE NEXT.JS (server-side con Service Role Key):
--
-- Guardar durante onboarding:
--   await supabase.rpc('guardar_hubspot_token', {
--     p_organizacion_id: organizacionId,
--     p_token: hubspotToken,
--     p_nombre_empresa: nombreEmpresa
--   })
--
-- Recuperar antes de llamar a HubSpot API:
--   const { data: token } = await supabase.rpc('obtener_hubspot_token', {
--     p_organizacion_id: organizacionId
--   })
--
-- NUNCA llamar desde componentes cliente de React.
-- ============================================================