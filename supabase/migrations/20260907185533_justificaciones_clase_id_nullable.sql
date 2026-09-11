-- Migration: 20260907185533_justificaciones_clase_id_nullable.sql
-- ============================================================================
-- FIX: guardar justificación desde una sesión emergente fallaba con
--   'null value in column "clase_id" of relation "justificaciones"
--    violates not-null constraint'
--
-- Las sesiones emergentes (sesiones_clase sin clase_id, creadas desde una
-- actividad y no desde una clase programada) no tienen una clase asociada.
-- El portal de maestros ya envía `clase_id: null` en ese caso
-- (justificacionService.guardarJustificacion → `clase_id: claseId || null`),
-- y el test justificacionService.test.js ya lo asume, pero la columna se creó
-- como NOT NULL en 20260512_create_justificaciones_table.sql y nunca se
-- relajó al introducir las sesiones emergentes.
--
-- clase_id no tiene FK en la base (es una columna uuid suelta con índice),
-- así que relajar la constraint es seguro y no requiere backfill.
-- ============================================================================

ALTER TABLE public.justificaciones
  ALTER COLUMN clase_id DROP NOT NULL;

COMMENT ON COLUMN public.justificaciones.clase_id IS
  'Clase asociada. NULL para justificaciones registradas en sesiones emergentes (sin clase programada).';
