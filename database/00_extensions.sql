-- ==============================================
-- 00_extensions.sql
-- Habilitar extensiones necesarias en Supabase
-- Ejecutar con Service Role o como superuser
-- ==============================================

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cryptographic functions (needed by Vault/pgsodium)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Supabase Vault para gestión de secretos de tenants
CREATE EXTENSION IF NOT EXISTS "supabase_vault" SCHEMA vault;

-- Esquema separado para extensiones (best practice de seguridad)
CREATE SCHEMA IF NOT EXISTS extensions;