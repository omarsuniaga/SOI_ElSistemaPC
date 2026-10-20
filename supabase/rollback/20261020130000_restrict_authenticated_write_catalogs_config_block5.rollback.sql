-- ════════════════════════════════════════════════════════════════════════════
-- ROLLBACK of 20261020130000_restrict_authenticated_write_catalogs_config_block5.sql
--
-- Restores the policies and ACLs captured read-only from production on 2026-10-20
-- (pg_policies / pg_class.relacl) and removes the three helper functions of block 5.
-- public.tiene_capacidad_academica(text) belongs to 20261018042037 and is NOT touched.
--
-- WARNING: this REOPENS the vulnerability (any signed-in account can read/write/delete the nine tables, and
-- `anon` regains every privilege on seven of them). Use it only if a legitimate flow breaks and cannot be
-- fixed forward (e.g. by extending tiene_capacidad_configuracion in a reviewed migration).
-- Idempotent: safe to run twice.
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

-- 1. Drop every policy on the nine tables (block-5 ones and the restored names, so a second run is a no-op)
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT tablename, policyname FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('configuracion_recordatorios', 'departamentos', 'ejercicios', 'instrumentos', 'modulos',
                        'niveles', 'seguimiento_reglas', 'soi_process_contracts', 'unidades')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- 2. Restore the original policies (verbatim from production)
CREATE POLICY configuracion_recordatorios_admin_read ON public.configuracion_recordatorios AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY configuracion_recordatorios_authenticated_all ON public.configuracion_recordatorios AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY departamentos_authenticated_all ON public.departamentos AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY ejercicios_admin_read ON public.ejercicios AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY ejercicios_authenticated_all ON public.ejercicios AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY instrumentos_auth_all ON public.instrumentos AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY modulos_admin_read ON public.modulos AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY modulos_authenticated_all ON public.modulos AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY niveles_admin_read ON public.niveles AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY niveles_authenticated_all ON public.niveles AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY rls_seguimiento_reglas_all ON public.seguimiento_reglas AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY soi_process_contracts_auth_read ON public.soi_process_contracts AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY soi_process_contracts_auth_write ON public.soi_process_contracts AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY unidades_admin_read ON public.unidades AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY unidades_authenticated_all ON public.unidades AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Restore the original ACLs: arwdDxtm for authenticated on all nine; for anon on seven of them
--    (instrumentos and soi_process_contracts never had an anon entry). Column-level grants disappear with the REVOKE.
REVOKE ALL ON public.configuracion_recordatorios, public.departamentos, public.ejercicios, public.instrumentos,
  public.modulos, public.niveles, public.seguimiento_reglas, public.soi_process_contracts, public.unidades
  FROM anon, authenticated;
GRANT ALL ON public.configuracion_recordatorios, public.departamentos, public.ejercicios, public.modulos,
  public.niveles, public.seguimiento_reglas, public.unidades
  TO anon, authenticated;
GRANT ALL ON public.instrumentos, public.soi_process_contracts TO authenticated;

-- 4. Remove the helpers
DROP FUNCTION IF EXISTS public.puede_leer_configuracion_institucional();
DROP FUNCTION IF EXISTS public.puede_leer_catalogo_staff();
DROP FUNCTION IF EXISTS public.tiene_capacidad_configuracion(text);

COMMIT;
