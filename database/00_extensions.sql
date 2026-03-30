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
-- Disponible en todos los planes de Supabase
CREATE EXTENSION IF NOT EXISTS "supabase_vault" SCHEMA vault;

-- CREAR UN ESQUEMA SEPARADO PARA EXTENSIONES (Best Practice de Seguridad)
CREATE SCHEMA IF NOT EXISTS extensions;

-- Outbound HTTP calls desde triggers (opcional para notificaciones)
CREATE EXTENSION IF NOT EXISTS "pg_net" SCHEMA extensions;