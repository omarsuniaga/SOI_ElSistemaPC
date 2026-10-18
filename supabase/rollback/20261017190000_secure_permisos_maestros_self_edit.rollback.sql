-- ROLLBACK for 20261017190000_secure_permisos_maestros_self_edit.sql
--
-- Restores the pre-migration state of public.permisos_maestros exactly as captured read-only from
-- production on 2026-10-17: the three dropped policies (textual definitions) and the full table
-- grants for anon and authenticated (INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES,
-- TRIGGER, MAINTAIN). THIS REOPENS the teacher self-edit hole (R9). Use it only if a legitimate
-- flow breaks and cannot be fixed forward.
--
-- Idempotent: every statement can run twice.

BEGIN;

DROP POLICY IF EXISTS permisos_maestros_admin_insert                         ON public.permisos_maestros;
DROP POLICY IF EXISTS permisos_maestros_admin_update                         ON public.permisos_maestros;
DROP POLICY IF EXISTS "Permitir actualizar sus propios permisos o por admin" ON public.permisos_maestros;
DROP POLICY IF EXISTS "Permitir insertar sus propios permisos o por admin"   ON public.permisos_maestros;
DROP POLICY IF EXISTS "Todos pueden leer permisos"                           ON public.permisos_maestros;

CREATE POLICY "Permitir actualizar sus propios permisos o por admin" ON public.permisos_maestros
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((es_admin() OR (maestro_id IN ( SELECT m.id FROM maestros m WHERE (m.user_id = auth.uid())))))
  WITH CHECK ((es_admin() OR (maestro_id IN ( SELECT m.id FROM maestros m WHERE (m.user_id = auth.uid())))));
CREATE POLICY "Permitir insertar sus propios permisos o por admin" ON public.permisos_maestros
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((es_admin() OR (maestro_id IN ( SELECT m.id FROM maestros m WHERE (m.user_id = auth.uid())))));
CREATE POLICY "Todos pueden leer permisos" ON public.permisos_maestros
  AS PERMISSIVE FOR SELECT TO authenticated USING (true);

GRANT ALL ON public.permisos_maestros TO anon, authenticated;

COMMIT;
