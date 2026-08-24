-- Enables the annual anniversary category and provides its canonical 25-task template.

ALTER TYPE public.event_categoria ADD VALUE IF NOT EXISTS 'aniversario';
ALTER TYPE public.soi_departamento ADD VALUE IF NOT EXISTS 'LUT';

WITH plantilla(departamento, titulo, diferencia_dias, prioridad) AS (
  VALUES
    ('DIR', 'Definir lema, objetivos y comisión del aniversario', -90, 'critica'),
    ('ADM', 'Cotizar y reservar recinto oficial', -75, 'critica'),
    ('ACM', 'Seleccionar repertorio oficial', -70, 'alta'),
    ('FIN', 'Aprobar presupuesto maestro', -60, 'alta'),
    ('COM', 'Gestionar cartas a auspiciadores', -55, 'alta'),
    ('DIR', 'Definir invitados VIP y autoridades', -50, 'alta'),
    ('COM', 'Diseñar identidad visual e invitaciones', -45, 'alta'),
    ('COM', 'Distribuir nota de prensa', -42, 'media'),
    ('ADM', 'Gestionar permisos de ausencia', -40, 'alta'),
    ('ACM', 'Emitir circular de ensayos intensivos', -35, 'alta'),
    ('LUT', 'Ejecutar mantenimiento preventivo', -30, 'alta'),
    ('COM', 'Contratar fotografia y video', -28, 'media'),
    ('ADM', 'Notificar a padres y representantes', -25, 'alta'),
    ('FIN', 'Asegurar refrigerios para seminario', -21, 'alta'),
    ('LOG', 'Reservar transporte de instrumentos', -21, 'alta'),
    ('LOG', 'Contratar personal de montaje', -18, 'alta'),
    ('ACM', 'Coordinar seminario intensivo', -14, 'critica'),
    ('COM', 'Preparar lista operativa de logistica', -14, 'media'),
    ('COM', 'Enviar programa de mano a imprenta', -10, 'alta'),
    ('COM', 'Enviar afiche conmemorativo a imprenta', -10, 'alta'),
    ('DIR', 'Preparar discursos y reconocimientos', -7, 'alta'),
    ('COM', 'Confirmar invitados VIP y protocolo', -7, 'alta'),
    ('LOG', 'Verificar locacion, tarima y sonido', -5, 'critica'),
    ('COM', 'Realizar gira de medios', -3, 'media'),
    ('DIR', 'Realizar check final interdepartamental', -1, 'critica')
), tarea_json AS (
  SELECT jsonb_agg(
    jsonb_build_object(
      'titulo', titulo || ' - {evento_titulo}',
      'descripcion', 'Tarea del protocolo anual de aniversario.',
      'departamento', departamento,
      'prioridad', prioridad,
      'diferencia_dias', diferencia_dias,
      'checklist', '[]'::jsonb
    ) ORDER BY diferencia_dias, titulo
  ) AS tareas
  FROM plantilla
)
INSERT INTO public.hermes_protocolos (categoria_evento, nombre_protocolo, descripcion, tareas_plantilla, activo)
SELECT
  'aniversario'::public.event_categoria,
  'Protocolo de Concierto Aniversario Institucional',
  'Plantilla canónica de 25 tareas para el aniversario institucional.',
  tareas,
  true
FROM tarea_json
ON CONFLICT (categoria_evento) DO UPDATE
SET nombre_protocolo = EXCLUDED.nombre_protocolo,
    descripcion = EXCLUDED.descripcion,
    tareas_plantilla = EXCLUDED.tareas_plantilla,
    activo = true,
    updated_at = now();

DO $$
DECLARE
  v_task_count integer;
BEGIN
  SELECT jsonb_array_length(tareas_plantilla)
  INTO v_task_count
  FROM public.hermes_protocolos
  WHERE categoria_evento = 'aniversario';

  IF v_task_count <> 25 THEN
    RAISE EXCEPTION 'La plantilla de aniversario debe contener 25 tareas; contiene %', v_task_count;
  END IF;
END $$;
