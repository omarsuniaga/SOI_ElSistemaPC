-- ============================================================
-- Migration: Seed — Evento Concierto 5to Aniversario
-- Timestamp: 20260815000001
-- Description:
--   Inserta el evento real del Concierto 5to Aniversario en calendario_institucional.
--   Al insertarse, fn_hermes_auto_delegar_tareas() dispara automáticamente y crea
--   las 25 tareas departamentales con deadlines T-Minus desde el 22 de noviembre 2026.
--
-- IMPORTANTE: Ejecutar SOLO después de 20260815000000_aniversario_protocol.sql
-- ============================================================

INSERT INTO public.calendario_institucional (
  titulo,
  descripcion,
  categoria,
  fecha_inicio,
  fecha_fin,
  ubicacion,
  departamento_responsable,
  metadata,
  estado
)
VALUES (
  'Concierto 5to Aniversario El Sistema Punta Cana',
  'Gran Concierto de Aniversario celebrando 5 años de educación musical en Punta Cana. ' ||
  'Presentación de la Orquesta Sinfónica, Coro Institucional y Ensamble de Iniciación. ' ||
  'Evento de gala con invitados especiales, patrocinadores y comunidad institucional.',
  'aniversario',
  '2026-11-22',
  '2026-11-22',
  'Por confirmar — Ver tarea ADM: Scouting de Recinto (T-75)',
  'DIR',
  jsonb_build_object(
    'anio_aniversario', 5,
    'lema', 'Por confirmar — Ver tarea DIR: Definición de Lema (T-90)',
    'aforo_estimado', 300,
    'participantes_estimados', 100,
    'protocolo', 'EVT-P09-V9',
    'hermes_auto_delegado', true
  ),
  'programado'
)
ON CONFLICT DO NOTHING;

-- Nota: el trigger fn_hermes_auto_delegar_tareas() se dispara automáticamente
-- en el AFTER INSERT y crea las 25 tareas departamentales.
-- Verificar con:
--   SELECT titulo, departamento, fecha_vencimiento, prioridad
--   FROM tareas_institucionales
--   WHERE event_id = (
--     SELECT id FROM calendario_institucional
--     WHERE titulo LIKE '%5to Aniversario%' LIMIT 1
--   )
--   ORDER BY fecha_vencimiento;
