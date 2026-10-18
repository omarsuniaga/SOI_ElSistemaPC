-- Minimal subset of production needed by the module (TEST HARNESS ONLY).
-- soi_security.has_role is copied verbatim from production (read-only capture 2026-10-17).
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  rol text, estado text, activo boolean
);
CREATE SCHEMA soi_security;
GRANT USAGE ON SCHEMA soi_security TO anon, authenticated, service_role;
CREATE OR REPLACE FUNCTION soi_security.has_role(allowed_roles text[])
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO ''
AS $function$ SELECT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.estado = 'activo' AND p.activo IS TRUE AND p.rol = ANY(allowed_roles)); $function$;
REVOKE ALL ON FUNCTION soi_security.has_role(text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION soi_security.has_role(text[]) TO authenticated;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Pre-existing buckets / policies that must remain untouched.
INSERT INTO storage.buckets (id, name, public) VALUES
  ('signage','signage',true), ('documentos','documentos',true), ('db-backups','db-backups',false);
CREATE POLICY signage_bucket_auth_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id='signage');
