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
CREATE POLICY signage_bucket_auth_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'signage');

-- The 8 storage.objects policies present in production (read-only capture 2026-10-17), verbatim,
-- with their helper functions stubbed to ALWAYS TRUE: if any of them were not bucket-scoped it
-- would open the new bucket to every caller, and the suite would catch it.
CREATE FUNCTION public.es_admin() RETURNS boolean LANGUAGE sql AS 'SELECT true';
CREATE FUNCTION public.is_super_admin() RETURNS boolean LANGUAGE sql AS 'SELECT true';
CREATE FUNCTION public.maestro_actual() RETURNS uuid LANGUAGE sql AS 'SELECT gen_random_uuid()';
CREATE POLICY db_backups_superadmin_delete ON storage.objects FOR DELETE TO public USING (bucket_id = 'db-backups' AND is_super_admin());
CREATE POLICY db_backups_superadmin_read ON storage.objects FOR SELECT TO public USING (bucket_id = 'db-backups' AND is_super_admin());
CREATE POLICY db_backups_superadmin_write ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'db-backups' AND is_super_admin());
CREATE POLICY justificaciones_evidencia_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documentos' AND name LIKE 'justificaciones/%' AND (es_admin() OR maestro_actual() IS NOT NULL));
CREATE POLICY justificaciones_evidencia_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documentos' AND name LIKE 'justificaciones/%' AND (es_admin() OR maestro_actual() IS NOT NULL));
CREATE POLICY justificaciones_evidencia_select ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'documentos' AND name LIKE 'justificaciones/%' AND (es_admin() OR maestro_actual() IS NOT NULL));
CREATE POLICY signage_bucket_admin_write ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'signage' AND es_admin()) WITH CHECK (bucket_id = 'signage' AND es_admin());
