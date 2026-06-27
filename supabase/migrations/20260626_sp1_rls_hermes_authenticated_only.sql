-- 20260626_sp1_rls_hermes_authenticated_only.sql
-- SP-1: cerrar acceso anon a las tablas core de Hermes.
--
-- Hallazgo: tareas_institucionales, calendario_institucional y hermes_protocolos tenian
-- policy permisiva 'allow_all_*' + 7 grants a anon -> lectura/escritura publica de datos
-- institucionales sensibles (incluidos datos de menores via entidad asociada de SP-0).
--
-- Decision de modelo: el sistema tiene solo roles 'maestro' y 'admin'; la separacion por
-- departamento se hace en la capa de vista (cada portal pasa su hermesDept como filtro de
-- query). Una RLS por-departamento basada en identidad romperia al admin que opera varios
-- portales. Por eso la RLS es authenticated-only + anon denegado; el scoping departamental
-- queda (correctamente) en la query. Cuando exista identidad por depto, se endurece aqui.

DROP POLICY IF EXISTS allow_all_tareas ON public.tareas_institucionales;
CREATE POLICY tareas_auth_all ON public.tareas_institucionales
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
REVOKE ALL ON public.tareas_institucionales FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tareas_institucionales TO authenticated;

DROP POLICY IF EXISTS allow_all_calendario ON public.calendario_institucional;
CREATE POLICY calendario_auth_all ON public.calendario_institucional
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
REVOKE ALL ON public.calendario_institucional FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendario_institucional TO authenticated;

DROP POLICY IF EXISTS allow_all_protocolos ON public.hermes_protocolos;
CREATE POLICY protocolos_auth_read ON public.hermes_protocolos
  FOR SELECT TO authenticated USING (true);
CREATE POLICY protocolos_admin_write ON public.hermes_protocolos
  FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
REVOKE ALL ON public.hermes_protocolos FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hermes_protocolos TO authenticated;
