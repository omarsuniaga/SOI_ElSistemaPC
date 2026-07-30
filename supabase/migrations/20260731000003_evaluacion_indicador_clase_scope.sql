-- ============================================================================
-- MAPA GAMIFICADO DE PLANIFICACIÓN — evaluacion_indicador: fix de RLS +
-- alcance por clase (Tarea 1.3, prioridad — bugfix de seguridad)
-- Fecha: 2026-07-31
-- Contexto (openspec/changes/mapa-gamificado-planificacion/design.md,
--   Decisión 2 + sección "RLS concreta (REQ-13)"):
--
-- BUG CRÍTICO CONFIRMADO: 20260730000001_deploy_evaluacion_indicador.sql
--   (desplegada el 2026-07-30) define sus 4 políticas de maestro comparando
--   `evaluado_por = auth.uid()`. Pero `evaluado_por` es FK a
--   `public.maestros(id)`, y `auth.uid()` devuelve el id de `auth.users`.
--   Esos dos valores NUNCA coinciden — la tabla es hoy inescribible e
--   ilegible para cualquier maestro. Mismo bug ya documentado en
--   openspec/specs/teacher-self-registration/spec.md:77. Este archivo lo
--   corrige reemplazando las 5 políticas rotas (4 de maestro + la de admin)
--   por UNA sola política `ei_owner FOR ALL` que usa `maestro_actual()` y,
--   además, aísla por clase con `es_maestro_de_clase(clase_id)` (REQ-13 —
--   las políticas originales tampoco aislaban por clase).
--
-- Además (Decisión 2): `evaluacion_indicador` se EXTIENDE, no se reemplaza.
--   Se agrega la columna aditiva nullable `clase_indicador_id` (FK a la
--   nueva `clase_mapa_indicadores`, class-owned) y `indicator_id` pasa a
--   nullable. Un CHECK de exclusividad garantiza que cada fila viene de
--   una sola fuente (catálogo global O árbol de clase, nunca ambas ni
--   ninguna). `evaluacion_indicador` tiene 0 filas en producción (auditado
--   2026-07-30, ver design.md "Auditoría de migración cumplida") — no hay
--   backfill, y esta migración NUNCA trunca ni reescribe la tabla (§9.3 del
--   plan de rollback): es aditiva y reversible.
--
--   Fuente única de verdad para reportes ACM: vista
--   `vw_evaluacion_indicador_global`, que expone
--   `COALESCE(ei.indicator_id, cmi.origen_indicator_id) AS indicator_id_global`
--   para que un reporte nunca tenga que decidir cuál columna leer.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. RLS — reemplazar las 5 políticas rotas por una sola ei_owner
--    (design.md, tabla "RLS concreta (REQ-13)")
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "teacher_insert_ei" ON public.evaluacion_indicador;
DROP POLICY IF EXISTS "teacher_read_own_ei" ON public.evaluacion_indicador;
DROP POLICY IF EXISTS "teacher_update_own_ei" ON public.evaluacion_indicador;
DROP POLICY IF EXISTS "teacher_delete_own_ei" ON public.evaluacion_indicador;
DROP POLICY IF EXISTS "admin_read_all_ei" ON public.evaluacion_indicador;

CREATE POLICY "ei_owner" ON public.evaluacion_indicador
  FOR ALL TO authenticated
  USING (public.es_admin() OR public.es_maestro_de_clase(clase_id))
  WITH CHECK (public.es_maestro_de_clase(clase_id) AND evaluado_por = public.maestro_actual());

-- ----------------------------------------------------------------------------
-- 2. Columna aditiva clase_indicador_id (Decisión 2) — indicator_id pasa a
--    nullable, CHECK de exclusividad, índices únicos parciales que
--    reemplazan el UNIQUE(alumno_id, indicator_id, clase_id) original.
-- ----------------------------------------------------------------------------

ALTER TABLE public.evaluacion_indicador
  ALTER COLUMN indicator_id DROP NOT NULL,
  ADD COLUMN clase_indicador_id uuid REFERENCES public.clase_mapa_indicadores(id) ON DELETE RESTRICT,
  ADD CONSTRAINT ei_una_sola_fuente CHECK (num_nonnulls(indicator_id, clase_indicador_id) = 1);

CREATE INDEX idx_ei_clase_indicador ON public.evaluacion_indicador(clase_indicador_id);

DROP INDEX IF EXISTS evaluacion_indicador_alumno_id_indicator_id_clase_id_key; -- el UNIQUE original

CREATE UNIQUE INDEX ei_unq_global ON public.evaluacion_indicador(alumno_id, indicator_id, clase_id)
  WHERE indicator_id IS NOT NULL;

CREATE UNIQUE INDEX ei_unq_clase ON public.evaluacion_indicador(alumno_id, clase_indicador_id)
  WHERE clase_indicador_id IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 3. Vista vw_evaluacion_indicador_global — fuente única para reportes ACM.
--    Nunca leer la tabla cruda para reportería: siempre esta vista.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.vw_evaluacion_indicador_global AS
SELECT
  ei.id,
  ei.alumno_id,
  ei.clase_id,
  ei.indicator_id,
  ei.clase_indicador_id,
  COALESCE(ei.indicator_id, cmi.origen_indicator_id) AS indicator_id_global,
  ei.nota,
  ei.estado,
  ei.observaciones,
  ei.evaluado_por,
  ei.fecha_evaluacion,
  ei.created_at,
  ei.updated_at
FROM public.evaluacion_indicador ei
LEFT JOIN public.clase_mapa_indicadores cmi ON cmi.id = ei.clase_indicador_id;

GRANT SELECT ON public.vw_evaluacion_indicador_global TO authenticated;

-- ============================================================================
-- DOWN
-- ============================================================================
-- DROP VIEW IF EXISTS public.vw_evaluacion_indicador_global;
-- DROP INDEX IF EXISTS ei_unq_clase;
-- DROP INDEX IF EXISTS ei_unq_global;
-- CREATE UNIQUE INDEX evaluacion_indicador_alumno_id_indicator_id_clase_id_key
--   ON public.evaluacion_indicador(alumno_id, indicator_id, clase_id);
-- DROP INDEX IF EXISTS idx_ei_clase_indicador;
-- ALTER TABLE public.evaluacion_indicador
--   DROP CONSTRAINT IF EXISTS ei_una_sola_fuente,
--   DROP COLUMN IF EXISTS clase_indicador_id,
--   ALTER COLUMN indicator_id SET NOT NULL;
-- DROP POLICY IF EXISTS "ei_owner" ON public.evaluacion_indicador;
-- CREATE POLICY "teacher_insert_ei" ON public.evaluacion_indicador
--   FOR INSERT TO authenticated WITH CHECK (evaluado_por = auth.uid());
-- CREATE POLICY "teacher_read_own_ei" ON public.evaluacion_indicador
--   FOR SELECT TO authenticated USING (evaluado_por = auth.uid());
-- CREATE POLICY "teacher_update_own_ei" ON public.evaluacion_indicador
--   FOR UPDATE TO authenticated USING (evaluado_por = auth.uid()) WITH CHECK (evaluado_por = auth.uid());
-- CREATE POLICY "teacher_delete_own_ei" ON public.evaluacion_indicador
--   FOR DELETE TO authenticated USING (evaluado_por = auth.uid());
-- CREATE POLICY "admin_read_all_ei" ON public.evaluacion_indicador
--   FOR SELECT TO authenticated USING (es_admin());
-- ============================================================================
