-- ============================================================
-- Migration: SOI Hermes Virtual Manager Core (hermes-core)
-- Timestamp: 20260622_hermes_core
-- Project: sistema-academico-pwa
-- Description: Core tables, trigger automation, and seeds for Hermes
-- Date: 2026-06-22
-- ============================================================

-- 1. Types Definitions (if not exists)
DO $$ BEGIN
  CREATE TYPE event_categoria AS ENUM (
    'concierto', 'ensayo', 'reunion', 'patrocinio', 'pago', 'corte', 'inscripcion', 'auditoria', 'otro'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE soi_departamento AS ENUM (
    'DIR', 'ACM', 'ADM', 'FIN', 'LOG', 'COM', 'TECNICO'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tarea_institucional_estado AS ENUM (
    'pendiente', 'en_progreso', 'completada', 'bloqueada', 'cancelada'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tarea_institucional_prioridad AS ENUM (
    'baja', 'media', 'alta', 'critica'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Core Tables Creation
CREATE TABLE IF NOT EXISTS public.calendario_institucional (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo         text NOT NULL,
  descripcion    text,
  categoria      event_categoria NOT NULL DEFAULT 'otro',
  fecha_inicio   timestamp with time zone NOT NULL,
  fecha_fin      timestamp with time zone NOT NULL,
  ubicacion      text,
  departamento_responsable soi_departamento NOT NULL DEFAULT 'DIR',
  metadata       jsonb DEFAULT '{}',
  estado         text NOT NULL DEFAULT 'programado' CHECK (estado IN ('programado', 'en_curso', 'completado', 'cancelado')),
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tareas_institucionales (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id       uuid REFERENCES public.calendario_institucional(id) ON DELETE CASCADE,
  titulo         text NOT NULL,
  descripcion    text,
  departamento   soi_departamento NOT NULL DEFAULT 'DIR',
  asignado_a     text, -- Name, Role, or UUID
  estado         tarea_institucional_estado NOT NULL DEFAULT 'pendiente',
  prioridad      tarea_institucional_prioridad NOT NULL DEFAULT 'media',
  fecha_vencimiento date,
  checklist      jsonb DEFAULT '[]', -- Array of {"item": "...", "completado": false}
  feedback       text,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hermes_protocolos (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_evento event_categoria UNIQUE NOT NULL,
  nombre_protocolo text NOT NULL,
  descripcion    text,
  tareas_plantilla jsonb NOT NULL, -- Array of task templates
  activo         boolean DEFAULT true,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

-- 3. Row Level Security Policies
ALTER TABLE public.calendario_institucional ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas_institucionales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hermes_protocolos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS allow_all_calendario ON public.calendario_institucional;
CREATE POLICY allow_all_calendario ON public.calendario_institucional FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS allow_all_tareas ON public.tareas_institucionales;
CREATE POLICY allow_all_tareas ON public.tareas_institucionales FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS allow_all_protocolos ON public.hermes_protocolos;
CREATE POLICY allow_all_protocolos ON public.hermes_protocolos FOR ALL USING (true) WITH CHECK (true);

-- 4. Auto-Delegation Trigger Function (The Brain of Hermes)
CREATE OR REPLACE FUNCTION public.fn_hermes_auto_delegar_tareas()
RETURNS TRIGGER AS $$
DECLARE
  proto RECORD;
  t_item JSONB;
  v_titulo TEXT;
  v_descripcion TEXT;
  v_vencimiento DATE;
  v_checklist JSONB;
BEGIN
  -- Search for an active protocol corresponding to the inserted event category
  SELECT * INTO proto FROM public.hermes_protocolos 
  WHERE categoria_evento = NEW.categoria AND activo = true;

  IF FOUND THEN
    -- Iterate over each task template in the array
    FOR t_item IN SELECT * FROM jsonb_array_elements(proto.tareas_plantilla)
    LOOP
      -- Replace placeholders with actual event details
      v_titulo := replace(t_item->>'titulo', '{evento_titulo}', NEW.titulo);
      v_descripcion := replace(coalesce(t_item->>'descripcion', ''), '{evento_titulo}', NEW.titulo);
      
      -- Calculate due date based on difference_dias (offset days relative to event start)
      v_vencimiento := (NEW.fecha_inicio::date + ((coalesce(t_item->>'diferencia_dias', '0'))::integer || ' days')::interval)::date;
      
      -- Extract checklist or default to empty array
      v_checklist := coalesce(t_item->'checklist', '[]'::jsonb);

      -- Insert the delegated task for the appropriate department
      INSERT INTO public.tareas_institucionales (
        event_id,
        titulo,
        descripcion,
        departamento,
        estado,
        prioridad,
        fecha_vencimiento,
        checklist
      ) VALUES (
        NEW.id,
        v_titulo,
        v_descripcion,
        (t_item->>'departamento')::public.soi_departamento,
        'pendiente',
        coalesce(t_item->>'prioridad', 'media')::public.tarea_institucional_prioridad,
        v_vencimiento,
        v_checklist
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger binding
DROP TRIGGER IF EXISTS trg_hermes_event_inserted ON public.calendario_institucional;
CREATE TRIGGER trg_hermes_event_inserted
  AFTER INSERT ON public.calendario_institucional
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_hermes_auto_delegar_tareas();

-- 5. Standard Seed Protocols (Insert default behaviors)
INSERT INTO public.hermes_protocolos (categoria_evento, nombre_protocolo, descripcion, tareas_plantilla)
VALUES 
(
  'concierto',
  'Protocolo de Producción de Conciertos Maestro',
  'Automatiza las tareas de preparación y logística previas y posteriores a una presentación musical pública.',
  '[
    {
      "titulo": "🎼 ACM: Definir repertorio y ensayos generales - {evento_titulo}",
      "descripcion": "Establecer la lista de obras y coordinar el cronograma detallado de ensayos parciales y generales.",
      "departamento": "ACM",
      "prioridad": "critica",
      "diferencia_dias": -14,
      "checklist": [
        {"item": "Definir repertorio", "completado": false},
        {"item": "Asignar partituras a profesores", "completado": false},
        {"item": "Realizar ensayos seccionales", "completado": false},
        {"item": "Realizar ensayo general", "completado": false}
      ]
    },
    {
      "titulo": "📦 LOG: Coordinar logística, hidratación y sonido - {evento_titulo}",
      "descripcion": "Organizar el traslado de instrumentos, sonido, refrigerios para alumnos y tarima.",
      "departamento": "LOG",
      "prioridad": "alta",
      "diferencia_dias": -7,
      "checklist": [
        {"item": "Reservar transporte escolar/autobuses", "completado": false},
        {"item": "Coordinar equipo de sonido e iluminación", "completado": false},
        {"item": "Garantizar agua/refrigerios para el elenco", "completado": false},
        {"item": "Coordinar montaje de tarima en locación", "completado": false}
      ]
    },
    {
      "titulo": "💰 FIN: Asegurar viáticos y pagos de aranceles de sala",
      "descripcion": "Verificar presupuesto del evento, aprobar desembolsos de viáticos y confirmar pago de permisos de sala.",
      "departamento": "FIN",
      "prioridad": "alta",
      "diferencia_dias": -5,
      "checklist": [
        {"item": "Revisar estimación presupuestaria", "completado": false},
        {"item": "Emitir pagos a proveedores de logística", "completado": false},
        {"item": "Realizar pago de arancel de la sala del concierto", "completado": false}
      ]
    },
    {
      "titulo": "📢 COM: Diseñar piezas de difusión y convocar prensa",
      "descripcion": "Desarrollar el material gráfico para redes sociales, convocar a medios locales y patrocinadores.",
      "departamento": "COM",
      "prioridad": "media",
      "diferencia_dias": -10,
      "checklist": [
        {"item": "Diseñar afiche oficial del evento", "completado": false},
        {"item": "Publicar en redes oficiales", "completado": false},
        {"item": "Redactar y enviar nota de prensa", "completado": false},
        {"item": "Coordinar fotógrafo para el día del concierto", "completado": false}
      ]
    },
    {
      "titulo": "🎯 DIR: Protocolo, invitaciones especiales y discurso",
      "descripcion": "Enviar invitaciones formales a patrocinadores, entes aliados y preparar palabras de apertura.",
      "departamento": "DIR",
      "prioridad": "critica",
      "diferencia_dias": -3,
      "checklist": [
        {"item": "Enviar invitaciones oficiales a sponsors/donantes", "completado": false},
        {"item": "Confirmar protocolo y orden de llegada de autoridades", "completado": false},
        {"item": "Escribir palabras de apertura y bienvenida", "completado": false}
      ]
    }
  ]'::jsonb
),
(
  'patrocinio',
  'Protocolo de Atención a Donantes y Aliados',
  'Procedimiento operativo para preparar visitas institucionales de patrocinadores actuales o potenciales.',
  '[
    {
      "titulo": "🎯 DIR: Preparar informe de impacto de donaciones",
      "descripcion": "Armar la carpeta institucional de resultados pedagógicos y financieros para el patrocinante.",
      "departamento": "DIR",
      "prioridad": "alta",
      "diferencia_dias": -2,
      "checklist": [
        {"item": "Extraer métricas de asistencia de la base de datos", "completado": false},
        {"item": "Consolidar informe financiero simplificado", "completado": false},
        {"item": "Preparar carta de agradecimiento oficial firmada", "completado": false}
      ]
    },
    {
      "titulo": "🎼 ACM: Organizar muestra musical en vivo - {evento_titulo}",
      "descripcion": "Coordinar una pequeña pieza demostrativa (5-10 minutos) con los alumnos durante la visita.",
      "departamento": "ACM",
      "prioridad": "alta",
      "diferencia_dias": -3,
      "checklist": [
        {"item": "Seleccionar el ensamble o alumnos solistas", "completado": false},
        {"item": "Montar y ensayar la pieza corta", "completado": false},
        {"item": "Alinear a los alumnos sobre el protocolo de bienvenida", "completado": false}
      ]
    },
    {
      "titulo": "📦 LOG: Adecuación y limpieza de espacios",
      "descripcion": "Verificar que el salón de ensayos principal y oficinas estén impecables para la recepción.",
      "departamento": "LOG",
      "prioridad": "media",
      "diferencia_dias": -1,
      "checklist": [
        {"item": "Solicitar jornada especial de limpieza en salones", "completado": false},
        {"item": "Disponer estación de café/agua para la visita", "completado": false}
      ]
    },
    {
      "titulo": "📢 COM: Cobertura y agradecimiento digital",
      "descripcion": "Registrar material audiovisual de la visita y publicar agradecimiento especial.",
      "departamento": "COM",
      "prioridad": "media",
      "diferencia_dias": 0,
      "checklist": [
        {"item": "Registrar fotos y videos de alta calidad de la muestra", "completado": false},
        {"item": "Diseñar y publicar post en redes de agradecimiento", "completado": false}
      ]
    }
  ]'::jsonb
),
(
  'corte',
  'Protocolo de Cierre Mensual y Control de Mora',
  'Procedimientos internos ejecutados por Hermes en las fechas de corte financiero.',
  '[
    {
      "titulo": "💰 FIN: Conciliación bancaria y auditoría de mora",
      "descripcion": "Conciliar pagos recibidos contra cuotas generadas, identificando impagos.",
      "departamento": "FIN",
      "prioridad": "critica",
      "diferencia_dias": 0,
      "checklist": [
        {"item": "Verificar transferencias en estado pendiente", "completado": false},
        {"item": "Listar alumnos en mora crítica (>30 días)", "completado": false},
        {"item": "Emitir snapshot financiero a dirección", "completado": false}
      ]
    },
    {
      "titulo": "💻 TECNICO: Envío de alertas de cobro por WhatsApp",
      "descripcion": "Hermes despacha las notificaciones de mora a los representantes correspondientes.",
      "departamento": "TECNICO",
      "prioridad": "alta",
      "diferencia_dias": 1,
      "checklist": [
        {"item": "Verificar conexión de API/Bridge de WhatsApp", "completado": false},
        {"item": "Monitorear envío masivo de estados de cuenta", "completado": false}
      ]
    }
  ]'::jsonb
)
ON CONFLICT (categoria_evento) DO UPDATE 
SET nombre_protocolo = EXCLUDED.nombre_protocolo,
    descripcion = EXCLUDED.descripcion,
    tareas_plantilla = EXCLUDED.tareas_plantilla,
    updated_at = now();
