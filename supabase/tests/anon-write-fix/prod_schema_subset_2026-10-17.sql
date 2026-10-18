-- ════════════════════════════════════════════════════════════════════════════
-- SCHEMA-ONLY SUBSET OF PRODUCTION (project zmhmdvmyeyswunurcyow), captured 2026-10-17
-- Method: read-only queries to pg_catalog (pg_get_viewdef / pg_get_functiondef / pg_get_constraintdef /
-- pg_policies / aclexplode). No application data was read. No secrets.
--
-- Scope: the eight target tables plus everything the rehearsal flows touch (profiles, maestros, clases,
-- sesiones_clase, permisos_maestros, clase_horarios, clases_emergentes, calendario_institucional,
-- tareas_institucionales, signage_*), their real columns, constraints, RLS flags, policies (including the
-- RESTRICTIVE ones), table ACLs, the helper functions and the signage views.
-- Deliberately reduced / omitted (they are only foreign-key parents or unrelated to the change):
--   · alumnos, levels, nodes, academic_plans: key columns only, RLS off, no policies
--   · triggers on calendario_institucional and tareas_institucionales (Hermes side effects, untouched by the fix)
--   · all other tables, functions, views and policies
-- Load with: node build_baseline.mjs <db> --from-prod-subset   (after 00_supabase_bootstrap.sql)
-- ════════════════════════════════════════════════════════════════════════════

CREATE SCHEMA IF NOT EXISTS soi_security;

CREATE TYPE public.event_categoria AS ENUM ('concierto', 'ensayo', 'reunion', 'patrocinio', 'pago', 'corte', 'inscripcion', 'auditoria', 'otro', 'aniversario', 'audicion_trimestral', 'ensayo_intensivo', 'feriado', 'suspension', 'actividad_especial');
CREATE TYPE public.soi_departamento AS ENUM ('DIR', 'ACM', 'ADM', 'FIN', 'LOG', 'COM', 'TECNICO', 'LUT');
CREATE TYPE public.tarea_institucional_estado AS ENUM ('pendiente', 'en_progreso', 'completada', 'bloqueada', 'cancelada', 'observada', 'bloqueada_por_dependencia');
CREATE TYPE public.tarea_institucional_prioridad AS ENUM ('baja', 'media', 'alta', 'critica');

CREATE SEQUENCE public.salones_codigo_seq;
CREATE SEQUENCE public.salon_code_seq;

-- ── functions (verbatim from production) ───────────────────────────────────
CREATE OR REPLACE FUNCTION soi_security.has_role(allowed_roles text[])
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO ''
AS $function$ SELECT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.estado = 'activo' AND p.activo IS TRUE AND p.rol = ANY(allowed_roles)); $function$;

CREATE OR REPLACE FUNCTION public.es_admin()
 RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
AS $function$
DECLARE
  v_role TEXT;
BEGIN
  SELECT p.rol INTO v_role FROM public.profiles p WHERE p.id = auth.uid();
  RETURN COALESCE(v_role IN ('admin', 'inventarista'), FALSE);
END;
$function$;

CREATE OR REPLACE FUNCTION public.es_coordinador_acm()
 RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
AS $function$
DECLARE
  v_role TEXT;
BEGIN
  SELECT p.rol INTO v_role FROM public.profiles p WHERE p.id = auth.uid();
  RETURN COALESCE(v_role IN ('admin', 'coordinacion_academica'), FALSE);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role()
 RETURNS text LANGUAGE sql STABLE SECURITY DEFINER
AS $function$ SELECT rol::TEXT FROM public.profiles WHERE id = auth.uid(); $function$;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
AS $function$ SELECT public.get_user_role() IN ('admin', 'superadmin'); $function$;

CREATE OR REPLACE FUNCTION public.maestro_actual()
 RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER
AS $function$
BEGIN
  RETURN (SELECT id FROM public.maestros WHERE user_id = auth.uid() OR (user_id IS NULL AND id = auth.uid()));
END;
$function$;

CREATE OR REPLACE FUNCTION public.maestro_en_clase(p_clase_id uuid)
 RETURNS boolean LANGUAGE plpgsql STABLE
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.clases
    WHERE id = p_clase_id
    AND (maestro_principal_id = public.maestro_actual() OR maestro_suplente_id = public.maestro_actual())
  );
END;
$function$;

CREATE OR REPLACE FUNCTION soi_security.assigned_maestro(target_clase_id uuid)
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO ''
AS $function$
  SELECT soi_security.has_role(ARRAY['maestro']) AND EXISTS (
    SELECT 1 FROM public.maestros m JOIN public.clases c
      ON m.id IN (c.maestro_principal_id, c.maestro_suplente_id)
    WHERE c.id = target_clase_id AND m.activo IS DISTINCT FROM false
      AND (m.user_id = auth.uid() OR (m.user_id IS NULL AND m.id = auth.uid()))
  );
$function$;

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql
AS $function$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $function$;
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger LANGUAGE plpgsql
AS $function$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $function$;
CREATE OR REPLACE FUNCTION public.fn_update_notif_asistencia_timestamp() RETURNS trigger LANGUAGE plpgsql
AS $function$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $function$;
CREATE OR REPLACE FUNCTION public.generate_salon_code() RETURNS trigger LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.codigo_salon IS NULL OR NEW.codigo_salon = '' THEN
    NEW.codigo_salon := 'SAL-' || LPAD(nextval('public.salones_codigo_seq')::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$function$;

-- ── tables: the eight targets (exact columns and constraints) ──────────────
CREATE TABLE public.programas (
  id uuid NOT NULL DEFAULT gen_random_uuid(), nombre text NOT NULL, descripcion text, activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now(),
  nivel text, codigo text, duracion_anios numeric,
  CONSTRAINT programas_pkey PRIMARY KEY (id), CONSTRAINT programas_codigo_key UNIQUE (codigo), CONSTRAINT programas_nombre_key UNIQUE (nombre));

CREATE TABLE public.salones (
  id uuid NOT NULL DEFAULT gen_random_uuid(), nombre text NOT NULL, ubicacion text, descripcion text, activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now(),
  capacidad integer DEFAULT 20, codigo_salon text, piso integer, condicion_fisica text DEFAULT 'buena'::text,
  equipamiento jsonb DEFAULT '[]'::jsonb, responsable_id uuid, is_active boolean,
  CONSTRAINT salones_pkey PRIMARY KEY (id), CONSTRAINT salones_nombre_key UNIQUE (nombre), CONSTRAINT unique_codigo_salon UNIQUE (codigo_salon));

CREATE TABLE public.horarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(), clase_id uuid NOT NULL, maestro_id uuid NOT NULL, salon_id uuid NOT NULL,
  dia_semana integer NOT NULL, hora_inicio time without time zone NOT NULL, hora_fin time without time zone NOT NULL,
  activo boolean DEFAULT true, created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT horarios_dia_semana_check CHECK (((dia_semana >= 1) AND (dia_semana <= 7))),
  CONSTRAINT horarios_hora_check CHECK ((hora_fin > hora_inicio)),
  CONSTRAINT horarios_pkey PRIMARY KEY (id),
  CONSTRAINT horarios_clase_unico UNIQUE (clase_id, dia_semana, hora_inicio, hora_fin),
  CONSTRAINT horarios_maestro_unico UNIQUE (maestro_id, dia_semana, hora_inicio, hora_fin),
  CONSTRAINT horarios_salon_unico UNIQUE (salon_id, dia_semana, hora_inicio, hora_fin));

CREATE TABLE public.class_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(), teacher_id uuid NOT NULL, student_id uuid NOT NULL, academic_plan_id uuid,
  session_id uuid, level_id uuid, event_date date NOT NULL DEFAULT CURRENT_DATE, status text NOT NULL DEFAULT 'draft'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT class_events_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'completed'::text, 'cancelled'::text]))),
  CONSTRAINT class_events_pkey PRIMARY KEY (id));
-- unique indexes seen in production (idx_class_events_session_student, idx_methodology_event)
CREATE UNIQUE INDEX idx_class_events_session_student ON public.class_events (session_id, student_id);

CREATE TABLE public.class_event_methodology (
  id uuid NOT NULL DEFAULT gen_random_uuid(), class_event_id uuid NOT NULL, warmup text, sound_focus text, intonation_focus text,
  main_node_id uuid, technical_focus text, study_used text, repertoire_used text, sight_reading_work text, ear_training_work text,
  closing_observation text, homework_text text, created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT class_event_methodology_pkey PRIMARY KEY (id));
CREATE UNIQUE INDEX idx_methodology_event ON public.class_event_methodology (class_event_id);

CREATE TABLE public.homework_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(), class_event_id uuid NOT NULL, student_id uuid NOT NULL, teacher_id uuid NOT NULL,
  node_id uuid, description text NOT NULL, due_date date, status text NOT NULL DEFAULT 'assigned'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT homework_assignments_status_check CHECK ((status = ANY (ARRAY['assigned'::text, 'completed'::text, 'overdue'::text]))),
  CONSTRAINT homework_assignments_pkey PRIMARY KEY (id));

CREATE TABLE public.planned_content (
  id uuid NOT NULL DEFAULT gen_random_uuid(), maestro_id uuid NOT NULL, clase_id uuid NOT NULL, node_id uuid NOT NULL,
  planned_date date DEFAULT CURRENT_DATE, covered boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT planned_content_pkey PRIMARY KEY (id),
  CONSTRAINT planned_content_maestro_id_clase_id_node_id_planned_date_key UNIQUE (maestro_id, clase_id, node_id, planned_date));

CREATE TABLE public.notificaciones_asistencia (
  id uuid NOT NULL DEFAULT gen_random_uuid(), tipo text NOT NULL, canal text NOT NULL DEFAULT 'whatsapp'::text,
  prioridad text NOT NULL DEFAULT 'normal'::text, destinatario_telefono text NOT NULL, destinatario_nombre text,
  destinatario_email text, titulo text, cuerpo text NOT NULL, estado text NOT NULL DEFAULT 'pendiente'::text,
  fecha_creacion timestamp with time zone DEFAULT now(), fecha_programada timestamp with time zone, fecha_envio timestamp with time zone,
  fecha_respuesta timestamp with time zone, respuesta text, respuesta_hora timestamp with time zone, datos_extra jsonb,
  intentos_envio integer DEFAULT 0, error_ultimo jsonb, created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notificaciones_asistencia_canal_check CHECK ((canal = ANY (ARRAY['whatsapp'::text, 'email'::text, 'ambos'::text]))),
  CONSTRAINT notificaciones_asistencia_estado_check CHECK ((estado = ANY (ARRAY['pendiente'::text, 'enviado'::text, 'fallido'::text, 'entregado'::text, 'leido'::text]))),
  CONSTRAINT notificaciones_asistencia_prioridad_check CHECK ((prioridad = ANY (ARRAY['baja'::text, 'normal'::text, 'alta'::text, 'urgente'::text]))),
  CONSTRAINT notificaciones_asistencia_tipo_check CHECK ((tipo = ANY (ARRAY['alerta_asistencia_alumno'::text, 'recordatorio_asistencia_maestro'::text, 'reporte_asistencia_semanal'::text]))),
  CONSTRAINT notificaciones_asistencia_pkey PRIMARY KEY (id));

-- ── tables: context (exact columns) ────────────────────────────────────────
CREATE TABLE public.profiles (
  id uuid NOT NULL, email text NOT NULL, nombre_completo text, rol text NOT NULL DEFAULT 'user'::text, avatar_url text,
  activo boolean DEFAULT true, estado text NOT NULL DEFAULT 'pendiente'::text,
  created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now(),
  solicitud_instrumento text, solicitud_resena text,
  CONSTRAINT profiles_email_check CHECK ((email ~* '^[^@]+@[^@]+\.[^@]+$'::text)),
  CONSTRAINT profiles_estado_check CHECK ((estado = ANY (ARRAY['pendiente'::text, 'activo'::text, 'rechazado'::text, 'inactivo'::text]))),
  CONSTRAINT profiles_rol_check CHECK ((rol = ANY (ARRAY['superadmin'::text, 'admin'::text, 'direccion'::text, 'coordinacion_academica'::text, 'maestro'::text, 'monitor'::text, 'finanzas'::text, 'operaciones'::text, 'representante'::text, 'alumno'::text, 'jurado'::text, 'user'::text]))),
  CONSTRAINT profiles_pkey PRIMARY KEY (id));

CREATE TABLE public.maestros (
  id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid, nombre_completo text NOT NULL, especialidad text NOT NULL,
  tipo_maestro text DEFAULT 'catedra'::text, habilidades text[] DEFAULT ARRAY[]::text[], disponibilidad jsonb NOT NULL DEFAULT '{}'::jsonb,
  tlf text, correo text NOT NULL, resena text, puede_ser_suplente boolean DEFAULT true, activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now(), especialidades text[],
  es_admin boolean DEFAULT false, retirado_en timestamp with time zone, retirado_por uuid, motivo_retiro text,
  CONSTRAINT maestros_tipo_maestro_check CHECK ((tipo_maestro = ANY (ARRAY['catedra'::text, 'orquesta'::text, 'coro'::text, 'preparatoria'::text, 'monitor'::text, 'suplente'::text, 'direccion'::text, 'otro'::text]))),
  CONSTRAINT maestros_pkey PRIMARY KEY (id), CONSTRAINT maestros_correo_key UNIQUE (correo), CONSTRAINT maestros_user_id_key UNIQUE (user_id));

CREATE TABLE public.permisos_maestros (
  id uuid NOT NULL DEFAULT gen_random_uuid(), maestro_id uuid NOT NULL, puede_registrar_alumnos boolean DEFAULT false,
  puede_inscribir_clases boolean DEFAULT false, concedido_por uuid, creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(), permisos text[] NOT NULL DEFAULT '{}'::text[],
  solicitudes text[] NOT NULL DEFAULT '{}'::text[], fecha_inicio date NOT NULL DEFAULT CURRENT_DATE, fecha_fin date,
  puede_crear_clases boolean DEFAULT false, puede_planificar boolean DEFAULT true, puede_asistir boolean DEFAULT true,
  CONSTRAINT permisos_maestros_pkey PRIMARY KEY (id), CONSTRAINT permisos_maestros_maestro_id_key UNIQUE (maestro_id));

CREATE TABLE public.clases (
  id uuid NOT NULL DEFAULT gen_random_uuid(), nombre text NOT NULL, programa_id uuid, nivel_id uuid, maestro_principal_id uuid,
  maestro_suplente_id uuid, tipo_clase text DEFAULT 'grupal'::text, instrumento text, descripcion text, capacidad_maxima integer,
  activo boolean DEFAULT true, created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now(),
  estado character varying(50) DEFAULT 'activa'::character varying, maestro_id uuid, plan_estudio text,
  modalidad text DEFAULT 'presencial'::text, salon text, route_version_id uuid, maestro_auxiliar_id uuid, ruta_id uuid,
  whatsapp_group_jid text, es_clase_iniciacion boolean NOT NULL DEFAULT false, necesita_revision boolean NOT NULL DEFAULT false, revision_motivo text,
  CONSTRAINT clases_capacidad_maxima_check CHECK (((capacidad_maxima IS NULL) OR (capacidad_maxima > 0))),
  CONSTRAINT clases_maestros_diferentes_check CHECK (((maestro_suplente_id IS NULL) OR (maestro_suplente_id <> maestro_principal_id))),
  CONSTRAINT clases_modalidad_check CHECK ((modalidad = ANY (ARRAY['presencial'::text, 'virtual'::text, 'hibrida'::text]))),
  CONSTRAINT clases_tipo_clase_check CHECK ((tipo_clase = ANY (ARRAY['individual'::text, 'grupal'::text, 'rotativa'::text, 'seccional'::text, 'orquesta'::text, 'coro'::text, 'teoria'::text, 'preparatoria'::text, 'otro'::text]))),
  CONSTRAINT clases_pkey PRIMARY KEY (id));

CREATE TABLE public.clase_horarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(), clase_id uuid NOT NULL, dia text NOT NULL, hora_inicio time without time zone NOT NULL,
  hora_fin time without time zone NOT NULL, salon_id uuid, created_at timestamp with time zone DEFAULT now(), maestro_id uuid,
  CONSTRAINT clase_horarios_check CHECK ((hora_fin > hora_inicio)),
  CONSTRAINT clase_horarios_dia_check CHECK ((dia = ANY (ARRAY['lunes'::text, 'martes'::text, 'miércoles'::text, 'jueves'::text, 'viernes'::text, 'sábado'::text, 'domingo'::text]))),
  CONSTRAINT clase_horarios_pkey PRIMARY KEY (id));

CREATE TABLE public.clases_emergentes (
  id uuid NOT NULL DEFAULT gen_random_uuid(), maestro_id uuid NOT NULL, fecha date NOT NULL, hora_inicio time without time zone,
  hora_fin time without time zone, clase_id uuid, nombre_clase text, motivo text, contenido text, observaciones text,
  created_at timestamp with time zone DEFAULT now(), salon text, grupo text, instrumento text, tipo text DEFAULT 'refuerzo'::text,
  estado text DEFAULT 'pendiente'::text, CONSTRAINT clases_emergentes_pkey PRIMARY KEY (id));

CREATE TABLE public.sesiones_clase (
  id uuid NOT NULL DEFAULT gen_random_uuid(), clase_id uuid, horario_id uuid, maestro_id uuid NOT NULL, salon_id uuid, fecha date NOT NULL,
  hora_inicio time without time zone, hora_fin time without time zone, tema_principal text, contenidos_trabajados jsonb DEFAULT '[]'::jsonb,
  observaciones_generales text, estado text NOT NULL DEFAULT 'programada'::text, cerrada_en timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now(), borrador boolean DEFAULT false,
  contenido text, contenido_dsl text, asistencia jsonb DEFAULT '[]'::jsonb, es_codocencia boolean DEFAULT false, actividad text,
  maestro_auxiliar_id uuid, motivo text, emergente_id uuid, node_id uuid, node_origen text, node_codigo text, lugar character varying(255),
  alcance_tipo text DEFAULT 'institucion'::text, alcance_config jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT sesiones_clase_estado_check CHECK ((estado = ANY (ARRAY['programada'::text, 'abierta'::text, 'asistencia_registrada'::text, 'progreso_registrado'::text, 'cerrada'::text, 'pendiente'::text, 'atrasada'::text, 'cancelada'::text, 'registrada'::text]))),
  CONSTRAINT sesiones_clase_pkey PRIMARY KEY (id),
  CONSTRAINT sesiones_clase_clase_fecha_maestro_unique UNIQUE (clase_id, fecha, maestro_id),
  CONSTRAINT sesiones_clase_unica UNIQUE (clase_id, fecha, hora_inicio));

CREATE TABLE public.calendario_institucional (
  id uuid NOT NULL DEFAULT gen_random_uuid(), titulo text NOT NULL, descripcion text,
  categoria event_categoria NOT NULL DEFAULT 'otro'::event_categoria, fecha_inicio timestamp with time zone NOT NULL,
  fecha_fin timestamp with time zone NOT NULL, ubicacion text, departamento_responsable soi_departamento NOT NULL DEFAULT 'DIR'::soi_departamento,
  metadata jsonb DEFAULT '{}'::jsonb, estado text NOT NULL DEFAULT 'programado'::text, created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(), es_macro_evento boolean DEFAULT false, salud_proyecto text DEFAULT 'en_orden'::text,
  venue_id text, aforo_proyectado integer DEFAULT 0, metadata_pm jsonb DEFAULT '{}'::jsonb, alcance text NOT NULL DEFAULT 'institucional'::text,
  programas_convocados uuid[] NOT NULL DEFAULT '{}'::uuid[], clases_convocadas uuid[] NOT NULL DEFAULT '{}'::uuid[],
  responsable_asistencia_id uuid, requiere_aprobacion boolean NOT NULL DEFAULT true, aprobado_por uuid, aprobado_en timestamp with time zone,
  motivo_rechazo text, creado_por uuid, version integer NOT NULL DEFAULT 1, reemplaza_a uuid,
  CONSTRAINT calendario_institucional_pkey PRIMARY KEY (id));

CREATE TABLE public.tareas_institucionales (
  id uuid NOT NULL DEFAULT gen_random_uuid(), event_id uuid, titulo text NOT NULL, descripcion text,
  departamento soi_departamento NOT NULL DEFAULT 'DIR'::soi_departamento, asignado_a text,
  estado tarea_institucional_estado NOT NULL DEFAULT 'pendiente'::tarea_institucional_estado,
  prioridad tarea_institucional_prioridad NOT NULL DEFAULT 'media'::tarea_institucional_prioridad, fecha_vencimiento date,
  checklist jsonb DEFAULT '[]'::jsonb, feedback text, created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now(),
  minuta_id uuid, documentos_adjuntos jsonb DEFAULT '[]'::jsonb, entidad_tipo text, entidad_id uuid, entidad_label text,
  correlation_id uuid NOT NULL DEFAULT gen_random_uuid(), updated_by uuid, updated_by_nombre text, process_code text,
  dependencia_tarea_id uuid, depende_de_tarea_id uuid, t_minus_dias integer, source_event_id uuid,
  CONSTRAINT tareas_institucionales_pkey PRIMARY KEY (id));

CREATE TABLE public.signage_pantallas (
  id uuid NOT NULL DEFAULT gen_random_uuid(), slug text NOT NULL, nombre text NOT NULL, ubicacion text,
  orientacion text NOT NULL DEFAULT 'horizontal'::text, ancho_px integer NOT NULL DEFAULT 1280, alto_px integer NOT NULL DEFAULT 720,
  layout jsonb NOT NULL DEFAULT '{}'::jsonb, modo_nocturno jsonb NOT NULL DEFAULT '{"desde": "21:00", "hasta": "06:00", "activo": true}'::jsonb,
  activo boolean NOT NULL DEFAULT true, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(),
  institucion text, siglas text, menu_portales text[] NOT NULL DEFAULT '{}'::text[], logo_path text,
  CONSTRAINT signage_pantallas_pkey PRIMARY KEY (id), CONSTRAINT signage_pantallas_slug_key UNIQUE (slug));

CREATE TABLE public.signage_media (
  id uuid NOT NULL DEFAULT gen_random_uuid(), pantalla_id uuid, tipo text NOT NULL, titulo text, credito text, storage_path text,
  youtube_url text, youtube_video_id text, duracion_seg integer, orden integer NOT NULL DEFAULT 0, activo boolean NOT NULL DEFAULT true,
  vigente_desde date, vigente_hasta date, created_by uuid, created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(), contenido jsonb,
  CONSTRAINT signage_media_pkey PRIMARY KEY (id));

-- ── foreign-key parents, reduced (see header) ──────────────────────────────
CREATE TABLE public.alumnos (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid, nombre_completo text NOT NULL,
  nivel text NOT NULL DEFAULT 'inicial'::text, activo boolean DEFAULT true, CONSTRAINT alumnos_pkey PRIMARY KEY (id), CONSTRAINT alumnos_user_id_key UNIQUE (user_id));
CREATE TABLE public.levels (id uuid NOT NULL DEFAULT gen_random_uuid(), route_version_id uuid NOT NULL, name text NOT NULL DEFAULT 'n', CONSTRAINT levels_pkey PRIMARY KEY (id));
CREATE TABLE public.nodes (id uuid NOT NULL DEFAULT gen_random_uuid(), level_id uuid NOT NULL, route_version_id uuid NOT NULL, name text NOT NULL, type text NOT NULL, CONSTRAINT nodes_pkey PRIMARY KEY (id));
CREATE TABLE public.academic_plans (id uuid NOT NULL DEFAULT gen_random_uuid(), student_id uuid, programa_id uuid, status text DEFAULT 'in_process'::text, CONSTRAINT academic_plans_pkey PRIMARY KEY (id));

-- ── foreign keys among the captured tables (as in production) ──────────────
ALTER TABLE public.alumnos ADD CONSTRAINT fk_alumnos_profile FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE public.maestros ADD CONSTRAINT fk_maestros_profile FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE public.maestros ADD CONSTRAINT maestros_retirado_por_fkey FOREIGN KEY (retirado_por) REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE public.permisos_maestros ADD CONSTRAINT permisos_maestros_maestro_id_fkey FOREIGN KEY (maestro_id) REFERENCES maestros(id);
ALTER TABLE public.clases ADD CONSTRAINT fk_clases_maestro_principal FOREIGN KEY (maestro_principal_id) REFERENCES maestros(id) ON DELETE RESTRICT;
ALTER TABLE public.clases ADD CONSTRAINT fk_clases_maestro_suplente FOREIGN KEY (maestro_suplente_id) REFERENCES maestros(id) ON DELETE SET NULL;
ALTER TABLE public.clases ADD CONSTRAINT fk_clases_programa FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE RESTRICT;
ALTER TABLE public.clase_horarios ADD CONSTRAINT clase_horarios_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE;
ALTER TABLE public.clase_horarios ADD CONSTRAINT clase_horarios_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES salones(id) ON DELETE SET NULL;
ALTER TABLE public.salones ADD CONSTRAINT salones_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES maestros(id);
ALTER TABLE public.horarios ADD CONSTRAINT fk_horarios_clase FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE;
ALTER TABLE public.horarios ADD CONSTRAINT fk_horarios_maestro FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE RESTRICT;
ALTER TABLE public.horarios ADD CONSTRAINT fk_horarios_salon FOREIGN KEY (salon_id) REFERENCES salones(id) ON DELETE RESTRICT;
ALTER TABLE public.sesiones_clase ADD CONSTRAINT fk_sesiones_clase_clase FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE;
ALTER TABLE public.sesiones_clase ADD CONSTRAINT fk_sesiones_clase_horario FOREIGN KEY (horario_id) REFERENCES horarios(id) ON DELETE SET NULL;
ALTER TABLE public.sesiones_clase ADD CONSTRAINT fk_sesiones_clase_maestro FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE RESTRICT;
ALTER TABLE public.sesiones_clase ADD CONSTRAINT fk_sesiones_clase_salon FOREIGN KEY (salon_id) REFERENCES salones(id) ON DELETE SET NULL;
ALTER TABLE public.sesiones_clase ADD CONSTRAINT sesiones_clase_node_id_fkey FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE SET NULL;
ALTER TABLE public.class_events ADD CONSTRAINT class_events_academic_plan_id_fkey FOREIGN KEY (academic_plan_id) REFERENCES academic_plans(id) ON DELETE SET NULL;
ALTER TABLE public.class_events ADD CONSTRAINT class_events_level_id_fkey FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE SET NULL;
ALTER TABLE public.class_events ADD CONSTRAINT class_events_session_id_fkey FOREIGN KEY (session_id) REFERENCES sesiones_clase(id) ON DELETE SET NULL;
ALTER TABLE public.class_events ADD CONSTRAINT class_events_student_id_fkey FOREIGN KEY (student_id) REFERENCES alumnos(id) ON DELETE CASCADE;
ALTER TABLE public.class_events ADD CONSTRAINT class_events_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES maestros(id) ON DELETE CASCADE;
ALTER TABLE public.class_event_methodology ADD CONSTRAINT class_event_methodology_class_event_id_fkey FOREIGN KEY (class_event_id) REFERENCES class_events(id) ON DELETE CASCADE;
ALTER TABLE public.class_event_methodology ADD CONSTRAINT class_event_methodology_main_node_id_fkey FOREIGN KEY (main_node_id) REFERENCES nodes(id) ON DELETE SET NULL;
ALTER TABLE public.homework_assignments ADD CONSTRAINT homework_assignments_class_event_id_fkey FOREIGN KEY (class_event_id) REFERENCES class_events(id) ON DELETE CASCADE;
ALTER TABLE public.homework_assignments ADD CONSTRAINT homework_assignments_node_id_fkey FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE SET NULL;
ALTER TABLE public.homework_assignments ADD CONSTRAINT homework_assignments_student_id_fkey FOREIGN KEY (student_id) REFERENCES alumnos(id) ON DELETE CASCADE;
ALTER TABLE public.homework_assignments ADD CONSTRAINT homework_assignments_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES maestros(id) ON DELETE CASCADE;
ALTER TABLE public.planned_content ADD CONSTRAINT planned_content_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE;
ALTER TABLE public.planned_content ADD CONSTRAINT planned_content_maestro_id_fkey FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE;
ALTER TABLE public.planned_content ADD CONSTRAINT planned_content_node_id_fkey FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE;
ALTER TABLE public.tareas_institucionales ADD CONSTRAINT tareas_institucionales_event_id_fkey FOREIGN KEY (event_id) REFERENCES calendario_institucional(id) ON DELETE CASCADE;
ALTER TABLE public.signage_media ADD CONSTRAINT signage_media_pantalla_id_fkey FOREIGN KEY (pantalla_id) REFERENCES signage_pantallas(id) ON DELETE CASCADE;

-- ── views (verbatim; security_invoker=false) ───────────────────────────────
CREATE VIEW public.signage_v_horario_semana WITH (security_invoker = false) AS
 SELECT ch.id, ch.clase_id,
        CASE lower(ch.dia) WHEN 'lunes' THEN 1 WHEN 'martes' THEN 2 WHEN 'miércoles' THEN 3 WHEN 'miercoles' THEN 3
          WHEN 'jueves' THEN 4 WHEN 'viernes' THEN 5 WHEN 'sábado' THEN 6 WHEN 'sabado' THEN 6 WHEN 'domingo' THEN 7 ELSE NULL::integer END AS dia_iso,
        ch.dia AS dia_nombre, ch.hora_inicio, ch.hora_fin, c.nombre AS clase_nombre, c.instrumento, s.nombre AS salon_nombre, m.nombre_completo AS maestro_nombre
   FROM clase_horarios ch
     JOIN clases c ON c.id = ch.clase_id AND COALESCE(c.activo, true)
     LEFT JOIN salones s ON s.id = ch.salon_id
     LEFT JOIN maestros m ON m.id = COALESCE(ch.maestro_id, c.maestro_principal_id);

CREATE VIEW public.signage_v_horario_hoy WITH (security_invoker = false) AS
 SELECT id, clase_id, hora_inicio, hora_fin, clase_nombre, instrumento, salon_nombre, maestro_nombre, origen
   FROM ( SELECT w.id, w.clase_id, w.hora_inicio, w.hora_fin, w.clase_nombre, w.instrumento, w.salon_nombre, w.maestro_nombre, 'regular'::text AS origen
            FROM signage_v_horario_semana w
           WHERE w.dia_iso = EXTRACT(isodow FROM (now() AT TIME ZONE 'America/Santo_Domingo'))::integer
         UNION ALL
          SELECT ce.id, ce.clase_id, ce.hora_inicio, ce.hora_fin, COALESCE(ce.nombre_clase, 'Clase emergente'::text), ce.instrumento, ce.salon,
                 ( SELECT m.nombre_completo FROM maestros m WHERE m.id = ce.maestro_id), 'emergente'::text
            FROM clases_emergentes ce
           WHERE ce.fecha = (now() AT TIME ZONE 'America/Santo_Domingo')::date AND COALESCE(ce.estado, 'activa'::text) <> 'cancelada'::text) q
  ORDER BY hora_inicio;

CREATE VIEW public.signage_v_horario_manana WITH (security_invoker = false) AS
 SELECT id, clase_id, hora_inicio, hora_fin, clase_nombre, instrumento, salon_nombre, maestro_nombre, origen
   FROM ( SELECT w.id, w.clase_id, w.hora_inicio, w.hora_fin, w.clase_nombre, w.instrumento, w.salon_nombre, w.maestro_nombre, 'regular'::text AS origen
            FROM signage_v_horario_semana w
           WHERE w.dia_iso = EXTRACT(isodow FROM (now() AT TIME ZONE 'America/Santo_Domingo') + '1 day'::interval)::integer
         UNION ALL
          SELECT ce.id, ce.clase_id, ce.hora_inicio, ce.hora_fin, COALESCE(ce.nombre_clase, 'Clase emergente'::text), ce.instrumento, ce.salon,
                 ( SELECT m.nombre_completo FROM maestros m WHERE m.id = ce.maestro_id), 'emergente'::text
            FROM clases_emergentes ce
           WHERE ce.fecha = ((now() AT TIME ZONE 'America/Santo_Domingo') + '1 day'::interval)::date AND COALESCE(ce.estado, 'activa'::text) <> 'cancelada'::text) q
  ORDER BY hora_inicio;

CREATE VIEW public.signage_v_calendario_mes WITH (security_invoker = false) AS
 SELECT id, titulo, descripcion, categoria::text AS categoria, ubicacion, fecha_inicio, fecha_fin, COALESCE(es_macro_evento, false) AS es_macro_evento
   FROM calendario_institucional ci
  WHERE estado = 'programado'::text AND fecha_fin >= date_trunc('month'::text, (now() AT TIME ZONE 'America/Santo_Domingo'))
    AND fecha_inicio < (date_trunc('month'::text, (now() AT TIME ZONE 'America/Santo_Domingo')) + '2 mons'::interval)
  ORDER BY fecha_inicio;

-- ── triggers (pg_get_triggerdef) ───────────────────────────────────────────
CREATE TRIGGER trg_class_events_updated_at BEFORE UPDATE ON public.class_events FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER update_horarios_updated_at BEFORE UPDATE ON public.horarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_notif_asistencia_update_timestamp BEFORE UPDATE ON public.notificaciones_asistencia FOR EACH ROW EXECUTE FUNCTION fn_update_notif_asistencia_timestamp();
CREATE TRIGGER update_programas_updated_at BEFORE UPDATE ON public.programas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_generate_salon_code BEFORE INSERT ON public.salones FOR EACH ROW EXECUTE FUNCTION generate_salon_code();
CREATE TRIGGER update_salones_updated_at BEFORE UPDATE ON public.salones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── RLS flags (the four reduced parents stay without RLS) ──────────────────
ALTER TABLE public.calendario_institucional ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clase_horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clases_emergentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_event_methodology ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maestros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones_asistencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permisos_maestros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planned_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones_clase ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signage_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signage_pantallas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas_institucionales ENABLE ROW LEVEL SECURITY;

-- ── policies (verbatim, incl. RESTRICTIVE) ─────────────────────────────────
-- the eight targets
CREATE POLICY cem_delete_all ON public.class_event_methodology AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY cem_insert_all ON public.class_event_methodology AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY cem_select_all ON public.class_event_methodology AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY cem_update_all ON public.class_event_methodology AS PERMISSIVE FOR UPDATE TO public USING (true);
CREATE POLICY class_event_methodology_admin_read ON public.class_event_methodology AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY ce_delete_all ON public.class_events AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY ce_insert_all ON public.class_events AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY ce_select_all ON public.class_events AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY ce_update_all ON public.class_events AS PERMISSIVE FOR UPDATE TO public USING (true);
CREATE POLICY class_events_admin_read ON public.class_events AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY hw_delete_all ON public.homework_assignments AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY hw_insert_all ON public.homework_assignments AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY hw_select_all ON public.homework_assignments AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY hw_update_all ON public.homework_assignments AS PERMISSIVE FOR UPDATE TO public USING (true);
CREATE POLICY homework_assignments_admin_read ON public.homework_assignments AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY "Permitir actualizar horarios" ON public.horarios AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Permitir crear horarios" ON public.horarios AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Permitir eliminar horarios" ON public.horarios AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY horarios_admin_read ON public.horarios AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY horarios_authenticated_all ON public.horarios AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY hermes_update_notifications ON public.notificaciones_asistencia AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY portal_insert_notifications ON public.notificaciones_asistencia AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY portal_read_own_notifications ON public.notificaciones_asistencia AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY planned_content_admin_read ON public.planned_content AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY planned_content_delete_all ON public.planned_content AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY planned_content_insert_all ON public.planned_content AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY planned_content_select_all ON public.planned_content AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY planned_content_update_all ON public.planned_content AS PERMISSIVE FOR UPDATE TO public USING (true);
CREATE POLICY "Permitir actualizar programas" ON public.programas AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Permitir crear programas" ON public.programas AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Permitir eliminar programas" ON public.programas AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY programas_admin_read ON public.programas AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY programas_anon_read ON public.programas AS PERMISSIVE FOR SELECT TO anon USING (true);
CREATE POLICY programas_authenticated_all ON public.programas AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir actualizar salones" ON public.salones AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Permitir crear salones" ON public.salones AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Permitir eliminar salones" ON public.salones AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY salones_admin_read ON public.salones AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY salones_authenticated_all ON public.salones AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- context tables
CREATE POLICY "Maestro ve sus propios permisos" ON public.permisos_maestros AS PERMISSIVE FOR SELECT TO authenticated USING ((maestro_id = maestro_actual()));
CREATE POLICY "Permitir actualizar sus propios permisos o por admin" ON public.permisos_maestros AS PERMISSIVE FOR UPDATE TO authenticated USING ((es_admin() OR (maestro_id IN ( SELECT m.id FROM maestros m WHERE (m.user_id = auth.uid()))))) WITH CHECK ((es_admin() OR (maestro_id IN ( SELECT m.id FROM maestros m WHERE (m.user_id = auth.uid())))));
CREATE POLICY "Permitir insertar sus propios permisos o por admin" ON public.permisos_maestros AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((es_admin() OR (maestro_id IN ( SELECT m.id FROM maestros m WHERE (m.user_id = auth.uid())))));
CREATE POLICY "Todos pueden leer permisos" ON public.permisos_maestros AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY permisos_maestros_admin_read ON public.permisos_maestros AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY "Maestros pueden actualizar sus propias sesiones" ON public.sesiones_clase AS PERMISSIVE FOR UPDATE TO authenticated USING ((maestro_id = maestro_actual())) WITH CHECK ((maestro_id = maestro_actual()));
CREATE POLICY "Maestros pueden crear sesiones de sus clases" ON public.sesiones_clase AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((maestro_en_clase(clase_id) AND (maestro_id = maestro_actual())));
CREATE POLICY "Maestros ven sus sesiones" ON public.sesiones_clase AS PERMISSIVE FOR SELECT TO authenticated USING (((maestro_id = maestro_actual()) OR maestro_en_clase(clase_id)));
CREATE POLICY sesiones_admin_insert ON public.sesiones_clase AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((es_admin() OR (maestro_id = maestro_actual()) OR maestro_en_clase(clase_id)));
CREATE POLICY sesiones_admin_select ON public.sesiones_clase AS PERMISSIVE FOR SELECT TO authenticated USING ((es_admin() OR (maestro_id = maestro_actual()) OR maestro_en_clase(clase_id)));
CREATE POLICY sesiones_admin_update ON public.sesiones_clase AS PERMISSIVE FOR UPDATE TO authenticated USING ((es_admin() OR (maestro_id = maestro_actual()) OR maestro_en_clase(clase_id))) WITH CHECK ((es_admin() OR (maestro_id = maestro_actual()) OR maestro_en_clase(clase_id)));
CREATE POLICY sesiones_clase_delete ON public.sesiones_clase AS PERMISSIVE FOR DELETE TO authenticated USING ((maestro_id = maestro_actual()));
CREATE POLICY "Maestros ven sus clases" ON public.clases AS PERMISSIVE FOR SELECT TO authenticated USING (((maestro_principal_id = maestro_actual()) OR (maestro_suplente_id = maestro_actual())));
CREATE POLICY clases_admin_read ON public.clases AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY f0_active_actor ON public.clases AS RESTRICTIVE FOR ALL TO authenticated USING (soi_security.has_role(ARRAY['admin'::text, 'superadmin'::text, 'direccion'::text, 'coordinacion_academica'::text, 'finanzas'::text, 'maestro'::text])) WITH CHECK (soi_security.has_role(ARRAY['admin'::text, 'superadmin'::text, 'direccion'::text, 'coordinacion_academica'::text, 'finanzas'::text, 'maestro'::text]));
CREATE POLICY f0_delete_scope ON public.clases AS RESTRICTIVE FOR DELETE TO authenticated USING (soi_security.has_role(ARRAY['admin'::text, 'superadmin'::text, 'direccion'::text, 'coordinacion_academica'::text]));
CREATE POLICY f0_insert_scope ON public.clases AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (soi_security.has_role(ARRAY['admin'::text, 'superadmin'::text, 'direccion'::text, 'coordinacion_academica'::text]));
CREATE POLICY f0_read_allow ON public.clases AS PERMISSIVE FOR SELECT TO authenticated USING ((soi_security.has_role(ARRAY['admin'::text, 'superadmin'::text, 'direccion'::text, 'coordinacion_academica'::text, 'finanzas'::text]) OR soi_security.assigned_maestro(id)));
CREATE POLICY f0_read_scope ON public.clases AS RESTRICTIVE FOR SELECT TO authenticated USING ((soi_security.has_role(ARRAY['admin'::text, 'superadmin'::text, 'direccion'::text, 'coordinacion_academica'::text, 'finanzas'::text]) OR soi_security.assigned_maestro(id)));
CREATE POLICY f0_staff_manage ON public.clases AS PERMISSIVE FOR ALL TO authenticated USING (soi_security.has_role(ARRAY['admin'::text, 'superadmin'::text, 'direccion'::text, 'coordinacion_academica'::text])) WITH CHECK (soi_security.has_role(ARRAY['admin'::text, 'superadmin'::text, 'direccion'::text, 'coordinacion_academica'::text]));
CREATE POLICY f0_update_scope ON public.clases AS RESTRICTIVE FOR UPDATE TO authenticated USING (soi_security.has_role(ARRAY['admin'::text, 'superadmin'::text, 'direccion'::text, 'coordinacion_academica'::text])) WITH CHECK (soi_security.has_role(ARRAY['admin'::text, 'superadmin'::text, 'direccion'::text, 'coordinacion_academica'::text]));
CREATE POLICY clase_horarios_admin_read ON public.clase_horarios AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY clase_horarios_delete ON public.clase_horarios AS PERMISSIVE FOR DELETE TO authenticated USING (maestro_en_clase(clase_id));
CREATE POLICY clase_horarios_insert ON public.clase_horarios AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (maestro_en_clase(clase_id));
CREATE POLICY clase_horarios_select ON public.clase_horarios AS PERMISSIVE FOR SELECT TO authenticated USING (maestro_en_clase(clase_id));
CREATE POLICY clase_horarios_update ON public.clase_horarios AS PERMISSIVE FOR UPDATE TO authenticated USING (maestro_en_clase(clase_id)) WITH CHECK (maestro_en_clase(clase_id));
CREATE POLICY f0_active_actor ON public.clase_horarios AS RESTRICTIVE FOR ALL TO authenticated USING (soi_security.has_role(ARRAY['admin'::text, 'superadmin'::text, 'direccion'::text, 'coordinacion_academica'::text, 'finanzas'::text, 'maestro'::text])) WITH CHECK (soi_security.has_role(ARRAY['admin'::text, 'superadmin'::text, 'direccion'::text, 'coordinacion_academica'::text, 'finanzas'::text, 'maestro'::text]));
CREATE POLICY f0_delete_scope ON public.clase_horarios AS RESTRICTIVE FOR DELETE TO authenticated USING ((soi_security.has_role(ARRAY['admin'::text, 'superadmin'::text, 'direccion'::text, 'coordinacion_academica'::text]) OR soi_security.assigned_maestro(clase_id)));
CREATE POLICY f0_insert_scope ON public.clase_horarios AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK ((soi_security.has_role(ARRAY['admin'::text, 'superadmin'::text, 'direccion'::text, 'coordinacion_academica'::text]) OR soi_security.assigned_maestro(clase_id)));
CREATE POLICY f0_read_allow ON public.clase_horarios AS PERMISSIVE FOR SELECT TO authenticated USING ((soi_security.has_role(ARRAY['admin'::text, 'superadmin'::text, 'direccion'::text, 'coordinacion_academica'::text, 'finanzas'::text]) OR soi_security.assigned_maestro(clase_id)));
CREATE POLICY f0_read_scope ON public.clase_horarios AS RESTRICTIVE FOR SELECT TO authenticated USING ((soi_security.has_role(ARRAY['admin'::text, 'superadmin'::text, 'direccion'::text, 'coordinacion_academica'::text, 'finanzas'::text]) OR soi_security.assigned_maestro(clase_id)));
CREATE POLICY f0_staff_manage ON public.clase_horarios AS PERMISSIVE FOR ALL TO authenticated USING (soi_security.has_role(ARRAY['admin'::text, 'superadmin'::text, 'direccion'::text, 'coordinacion_academica'::text])) WITH CHECK (soi_security.has_role(ARRAY['admin'::text, 'superadmin'::text, 'direccion'::text, 'coordinacion_academica'::text]));
CREATE POLICY f0_update_scope ON public.clase_horarios AS RESTRICTIVE FOR UPDATE TO authenticated USING ((soi_security.has_role(ARRAY['admin'::text, 'superadmin'::text, 'direccion'::text, 'coordinacion_academica'::text]) OR soi_security.assigned_maestro(clase_id))) WITH CHECK ((soi_security.has_role(ARRAY['admin'::text, 'superadmin'::text, 'direccion'::text, 'coordinacion_academica'::text]) OR soi_security.assigned_maestro(clase_id)));
CREATE POLICY clases_emergentes_admin_read ON public.clases_emergentes AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY clases_emergentes_delete ON public.clases_emergentes AS PERMISSIVE FOR DELETE TO authenticated USING ((maestro_id = maestro_actual()));
CREATE POLICY clases_emergentes_insert ON public.clases_emergentes AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((maestro_id = maestro_actual()));
CREATE POLICY clases_emergentes_select ON public.clases_emergentes AS PERMISSIVE FOR SELECT TO authenticated USING (((maestro_id = maestro_actual()) OR maestro_en_clase(clase_id)));
CREATE POLICY clases_emergentes_update ON public.clases_emergentes AS PERMISSIVE FOR UPDATE TO authenticated USING ((maestro_id = maestro_actual())) WITH CHECK ((maestro_id = maestro_actual()));
CREATE POLICY calendario_read_authenticated ON public.calendario_institucional AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY calendario_write_staff ON public.calendario_institucional AS PERMISSIVE FOR ALL TO authenticated USING (es_coordinador_acm()) WITH CHECK (es_coordinador_acm());
CREATE POLICY tareas_auth_all ON public.tareas_institucionales AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY signage_media_admin_write ON public.signage_media AS PERMISSIVE FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY signage_media_anon_read ON public.signage_media AS PERMISSIVE FOR SELECT TO anon USING (true);
CREATE POLICY signage_media_auth_read ON public.signage_media AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY signage_pantallas_admin_write ON public.signage_pantallas AS PERMISSIVE FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY signage_pantallas_anon_read ON public.signage_pantallas AS PERMISSIVE FOR SELECT TO anon USING (true);
CREATE POLICY signage_pantallas_auth_read ON public.signage_pantallas AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY maestros_admin_insert ON public.maestros AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (es_admin());
CREATE POLICY maestros_admin_read ON public.maestros AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY maestros_admin_update ON public.maestros AS PERMISSIVE FOR UPDATE TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY maestros_select_self ON public.maestros AS PERMISSIVE FOR SELECT TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "Usuarios ven su propio perfil" ON public.profiles AS PERMISSIVE FOR SELECT TO authenticated USING ((id = auth.uid()));
CREATE POLICY f0_profiles_delete ON public.profiles AS RESTRICTIVE FOR DELETE TO authenticated USING (soi_security.has_role(ARRAY['superadmin'::text]));
CREATE POLICY f0_profiles_insert ON public.profiles AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (soi_security.has_role(ARRAY['admin'::text, 'superadmin'::text]));
CREATE POLICY f0_profiles_read ON public.profiles AS RESTRICTIVE FOR SELECT TO authenticated USING (((id = auth.uid()) OR soi_security.has_role(ARRAY['admin'::text, 'superadmin'::text])));
CREATE POLICY f0_profiles_staff_read ON public.profiles AS PERMISSIVE FOR SELECT TO authenticated USING (soi_security.has_role(ARRAY['admin'::text, 'superadmin'::text]));
CREATE POLICY f0_profiles_update ON public.profiles AS RESTRICTIVE FOR UPDATE TO authenticated USING (soi_security.has_role(ARRAY['admin'::text, 'superadmin'::text])) WITH CHECK (soi_security.has_role(ARRAY['admin'::text, 'superadmin'::text]));
CREATE POLICY profiles_admin_insert ON public.profiles AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (es_admin());
CREATE POLICY profiles_admin_read ON public.profiles AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY profiles_admin_update ON public.profiles AS PERMISSIVE FOR UPDATE TO authenticated USING (es_admin()) WITH CHECK (es_admin());

-- ── ACLs (aclexplode, production) ──────────────────────────────────────────
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
-- the eight targets and most context tables: full table access for the API roles (legacy default)
GRANT ALL ON public.class_event_methodology, public.class_events, public.homework_assignments, public.horarios,
  public.notificaciones_asistencia, public.planned_content, public.programas, public.salones,
  public.clases_emergentes, public.maestros, public.permisos_maestros, public.sesiones_clase,
  public.tareas_institucionales, public.levels, public.nodes, public.academic_plans TO anon, authenticated;
-- hardened by the F0 containment: no anon, authenticated without TRUNCATE/REFERENCES/TRIGGER
GRANT INSERT, SELECT, UPDATE, DELETE, MAINTAIN ON public.alumnos, public.clases, public.clase_horarios, public.profiles TO authenticated;
GRANT INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN ON public.calendario_institucional TO authenticated;
-- signage: anon reads only
GRANT SELECT ON public.signage_media, public.signage_pantallas TO anon;
GRANT ALL ON public.signage_media, public.signage_pantallas TO authenticated;
GRANT SELECT ON public.signage_v_horario_semana, public.signage_v_horario_hoy, public.signage_v_horario_manana, public.signage_v_calendario_mes TO anon;
GRANT ALL ON public.signage_v_horario_semana, public.signage_v_horario_hoy, public.signage_v_horario_manana, public.signage_v_calendario_mes TO authenticated, service_role;
GRANT USAGE, SELECT, UPDATE ON public.salones_codigo_seq, public.salon_code_seq TO anon, authenticated, service_role;

-- functions: public helpers executable by everyone (=X); soi_security helpers only by authenticated
GRANT USAGE ON SCHEMA soi_security TO authenticated, service_role;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA soi_security FROM PUBLIC, anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA soi_security TO authenticated;
