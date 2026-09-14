-- R1 TEST B fixture: minimal current-production-compatible prerequisite schema.
-- No production data. Applied only to local database repertoire_harness.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
DO $$ BEGIN CREATE ROLE authenticated NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
GRANT USAGE ON SCHEMA public TO authenticated;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE TABLE IF NOT EXISTS auth.users (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
CREATE TABLE IF NOT EXISTS public.profiles (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
CREATE TABLE IF NOT EXISTS public.maestros (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
CREATE TABLE IF NOT EXISTS public.alumnos (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
CREATE TABLE IF NOT EXISTS public.instrumentos (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
CREATE TABLE IF NOT EXISTS public.sections (id text PRIMARY KEY);
CREATE TABLE IF NOT EXISTS public.clases (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
CREATE TABLE IF NOT EXISTS public.sesiones_clase (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), maestro_id uuid, clase_id uuid);
CREATE TABLE IF NOT EXISTS public.observaciones_sesion (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), sesion_id uuid);
CREATE TABLE IF NOT EXISTS public.calendario_institucional (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), titulo text, fecha_inicio timestamptz, fecha_fin timestamptz);

CREATE OR REPLACE FUNCTION public.get_user_department() RETURNS text LANGUAGE sql STABLE AS $$ SELECT COALESCE(NULLIF(current_setting('repertoire.test_department', true), ''), 'ACM')::text $$;
CREATE OR REPLACE FUNCTION public.get_user_role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT COALESCE(NULLIF(current_setting('repertoire.test_role', true), ''), 'coordinacion_academica')::text $$;
CREATE OR REPLACE FUNCTION public.maestro_actual() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT NULLIF(current_setting('repertoire.test_maestro_id', true), '')::uuid $$;
CREATE OR REPLACE FUNCTION public.maestro_en_clase(uuid) RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT false $$;
CREATE OR REPLACE FUNCTION public.es_admin() RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT false $$;
CREATE OR REPLACE FUNCTION public.is_super_admin() RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT false $$;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
