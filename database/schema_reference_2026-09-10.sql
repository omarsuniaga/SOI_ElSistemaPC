-- ==========================================================================
-- SNAPSHOT ESQUEMA REAL SUPABASE / POSTGRESQL (SOI_DDBB_EL_SISTEMAPC)
-- Fecha captura: 2026-09-10
-- Generado a partir de introspeccion real de PostgreSQL 17.6
-- Base de datos activa: zmhmdvmyeyswunurcyow (us-east-2)
-- SIN DATOS PERSONALES NI SECRETOS PRODUCTIVOS
-- ==========================================================================

-- --------------------------------------------------------------------------
-- 1. EXTENSIONES INSTALADAS (9)
-- --------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH VERSION '1.6.4';
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH VERSION '0.20.0';
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH VERSION '1.11';
CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH VERSION '1.6';
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH VERSION '1.3';
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH VERSION '1.0';
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH VERSION '0.3.1';
CREATE EXTENSION IF NOT EXISTS "unaccent" WITH VERSION '1.1';
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH VERSION '1.1';

-- --------------------------------------------------------------------------
-- 2. SEQUENCES (4)
-- --------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.applicant_events_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.hermes_inbox_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.salon_code_seq;
CREATE SEQUENCE IF NOT EXISTS public.salones_codigo_seq;

-- --------------------------------------------------------------------------
-- 3. TIPOS ENUM PERSONALIZADOS (35)
-- --------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.asignacion_estado AS ENUM ('pendiente', 'aprobado', 'rechazado', 'cobrado');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.attempt_result AS ENUM ('in_process', 'approved', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.cierre_caja_estado AS ENUM ('borrador', 'cerrado', 'auditado');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.cuota_estado AS ENUM ('pendiente', 'pagada', 'vencida', 'en_mora', 'exonerada', 'becada', 'pre_pagada');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.event_categoria AS ENUM ('concierto', 'ensayo', 'reunion', 'patrocinio', 'pago', 'corte', 'inscripcion', 'auditoria', 'otro', 'aniversario', 'audicion_trimestral', 'ensayo_intensivo');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.exoneracion_tipo AS ENUM ('total', 'parcial');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.mensaje_tipo AS ENUM ('general', 'urgente', 'consulta', 'aprobacion_requerida');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.metodo_pago AS ENUM ('efectivo', 'transferencia', 'pago_movil', 'tarjeta', 'mixto', 'tercero', 'link_externo');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.minuta_visibilidad AS ENUM ('cajero', 'admin', 'todos');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.nivel_estudiante AS ENUM ('Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4', 'Nivel 5');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.notif_canal AS ENUM ('whatsapp', 'portal', 'ambos');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.notif_estado_portal AS ENUM ('no_leida', 'leida', 'archivada');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.notif_estado_wa AS ENUM ('pendiente', 'enviada', 'leida', 'respondida', 'fallida', 'no_aplica');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.notif_prioridad AS ENUM ('baja', 'media', 'alta', 'critica');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.notif_tipo AS ENUM ('mora_recordatorio', 'mora_compromiso', 'mora_escalada', 'accesorio_asignado', 'accesorio_aprobacion', 'stock_bajo', 'comodato_riesgo', 'campana_pago', 'mensaje_interno', 'tarea_asignada', 'minuta_nueva');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.patrocinante_tipo AS ENUM ('persona', 'empresa');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.patrocinio_cubre AS ENUM ('cuotas', 'wallet', 'accesorios', 'todo');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.progress_status AS ENUM ('pending', 'in_process', 'approved', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.resultado_audicion AS ENUM ('PROMOVIDO', 'PERMANECE', 'NO_PROMOVIDO');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.route_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.sim_actor_tipo AS ENUM ('postulante', 'alumno', 'maestro', 'representante');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.sim_canal AS ENUM ('whatsapp', 'email');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.sim_estado_pago AS ENUM ('solvente', 'moroso', 'no_aplica');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.sim_outbox_estado AS ENUM ('pendiente', 'enviado', 'fallido');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.sim_run_estado AS ENUM ('creado', 'corriendo', 'pausado', 'finalizado', 'error');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.soi_departamento AS ENUM ('DIR', 'ACM', 'ADM', 'FIN', 'LOG', 'COM', 'TECNICO', 'LUT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.tarea_estado AS ENUM ('pendiente', 'en_progreso', 'completada', 'cancelada', 'vencida');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.tarea_institucional_estado AS ENUM ('pendiente', 'en_progreso', 'completada', 'bloqueada', 'cancelada', 'observada', 'bloqueada_por_dependencia');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.tarea_institucional_prioridad AS ENUM ('baja', 'media', 'alta', 'critica');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.tarea_prioridad AS ENUM ('baja', 'media', 'alta', 'critica');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.tarea_tipo AS ENUM ('seguimiento_pago', 'revision_instrumento', 'reposicion_stock', 'recordatorio_compromiso', 'otro');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.wallet_modo AS ENUM ('solo_accesorios', 'solo_cuotas', 'mixto');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.wallet_origen AS ENUM ('pago', 'patrocinio', 'beca', 'accesorio', 'ajuste');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.wallet_status AS ENUM ('operativa', 'congelada', 'devuelta');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.wallet_tipo AS ENUM ('credito', 'debito');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- --------------------------------------------------------------------------
-- 4. TABLAS BASE Y COLUMNAS
-- --------------------------------------------------------------------------
-- Table: public.academic_plans
CREATE TABLE IF NOT EXISTS public.academic_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  programa_id uuid,
  status text DEFAULT 'in_process'::text,
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.accesorios
-- Comment: -- DEPRECATED: conservada para rediseño de inventario lutería 2026-09 (Owner: LUT)
CREATE TABLE IF NOT EXISTS public.accesorios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  categoria text NOT NULL,
  descripcion text,
  stock_actual integer NOT NULL DEFAULT 0,
  stock_minimo integer NOT NULL DEFAULT 0,
  precio_unitario numeric NOT NULL,
  activo boolean DEFAULT true,
  links_externos jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.accesorios IS '-- DEPRECATED: conservada para rediseño de inventario lutería 2026-09 (Owner: LUT)';

-- Table: public.acm_active_routes
CREATE TABLE IF NOT EXISTS public.acm_active_routes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  weekly_plan_id uuid NOT NULL,
  teacher_id uuid,
  group_id uuid,
  program_id uuid,
  area_id uuid,
  instrument_id uuid,
  module_id uuid,
  level_id uuid,
  phase_id uuid,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  current_week integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'active'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.acm_curriculum_sources
CREATE TABLE IF NOT EXISTS public.acm_curriculum_sources (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  file_name text NOT NULL,
  file_path text,
  source_type text NOT NULL,
  author text,
  version_label text,
  uploaded_by uuid,
  uploaded_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'draft'::text,
  raw_text text,
  notes text,
  related_version_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.acm_curriculum_versions
CREATE TABLE IF NOT EXISTS public.acm_curriculum_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  source_id uuid,
  program_id uuid,
  status text NOT NULL DEFAULT 'draft'::text,
  is_active boolean NOT NULL DEFAULT false,
  approved_by uuid,
  approved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.acm_evidence_files
CREATE TABLE IF NOT EXISTS public.acm_evidence_files (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  group_id uuid,
  session_id uuid,
  indicator_id uuid,
  file_url text NOT NULL,
  file_type text,
  description text,
  uploaded_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.acm_teacher_week_adjustments
CREATE TABLE IF NOT EXISTS public.acm_teacher_week_adjustments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL,
  teacher_id uuid NOT NULL,
  weekly_plan_id uuid NOT NULL,
  week_number integer NOT NULL,
  teacher_strategy text,
  student_activity text,
  homework text,
  evidence text,
  teacher_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.acm_weekly_plan_items
CREATE TABLE IF NOT EXISTS public.acm_weekly_plan_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  weekly_plan_id uuid NOT NULL,
  node_id uuid,
  indicator_id uuid,
  topic text,
  objective text,
  teacher_strategy text,
  student_activity text,
  homework text,
  materials text,
  evidence text,
  assessment_method text,
  estimated_minutes integer,
  order_index integer NOT NULL DEFAULT 0,
  is_required boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.acm_weekly_plans
CREATE TABLE IF NOT EXISTS public.acm_weekly_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  curriculum_version_id uuid NOT NULL,
  program_id uuid,
  area_id uuid,
  instrument_id uuid,
  module_id uuid,
  level_id uuid,
  phase_id uuid,
  week_number integer NOT NULL,
  week_label text,
  phase_type text,
  main_topic text,
  main_objective text,
  status text NOT NULL DEFAULT 'draft'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.alertas_log
CREATE TABLE IF NOT EXISTS public.alertas_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tipo text NOT NULL,
  canal text NOT NULL,
  destinatario text NOT NULL,
  contenido text,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: public.alumno_escolaridad
-- Comment: -- DEPRECATED: datos escolares secundarios diferidos 2026-09 (Owner: DIR/ADM)
CREATE TABLE IF NOT EXISTS public.alumno_escolaridad (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  alumno_id uuid NOT NULL,
  centro_estudios text,
  grado_nivel text,
  seccion text,
  anio_escolar text,
  director_institucion text,
  cargo_director text DEFAULT 'Director/a'::text,
  telefono_centro text,
  correo_centro text,
  direccion_centro text,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.alumno_escolaridad IS '-- DEPRECATED: datos escolares secundarios diferidos 2026-09 (Owner: DIR/ADM)';

-- Table: public.alumno_plan_entradas
CREATE TABLE IF NOT EXISTS public.alumno_plan_entradas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  alumno_id uuid NOT NULL,
  maestro_id uuid NOT NULL,
  tipo text NOT NULL,
  titulo text NOT NULL,
  descripcion text,
  objetivo_id uuid,
  nivel_referencia text,
  sesion_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.alumno_suspensiones
CREATE TABLE IF NOT EXISTS public.alumno_suspensiones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  alumno_id uuid NOT NULL,
  desde date NOT NULL DEFAULT CURRENT_DATE,
  hasta date,
  motivo text,
  estado text NOT NULL DEFAULT 'activa'::text,
  creado_por uuid DEFAULT auth.uid(),
  levantada_por uuid,
  levantada_en timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.alumnos
CREATE TABLE IF NOT EXISTS public.alumnos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  nombre_completo text NOT NULL,
  fecha_nacimiento date,
  instrumento_principal text,
  nivel_actual integer DEFAULT 1,
  fecha_ingreso date DEFAULT CURRENT_DATE,
  padre_nombre text,
  madre_nombre text,
  representante_nombre text,
  representante_cedula text,
  representante_tlf text,
  correo_representante text,
  tlf_alumno text,
  direccion text,
  foto_url text,
  observaciones_generales text,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  nivel text NOT NULL DEFAULT 'inicial'::text,
  condiciones_medicas text,
  alergias text,
  medicamentos text,
  contacto_emergencia_nombre text,
  contacto_emergencia_telefono text,
  contacto_emergencia_parentesco text,
  familiar_nombre text,
  familiar_telefono text,
  familiar_parentesco text,
  sabe_leer boolean,
  sabe_escribir boolean,
  nacionalidad text,
  tiene_pasaporte boolean,
  como_se_entero text,
  ubicacion_maps_url text,
  municipio_residencia text,
  sector_calle_numero text,
  madre_cedula text,
  madre_tlf_whatsapp text,
  padre_cedula text,
  padre_tlf_whatsapp text,
  otro_responsable_nombre text,
  otro_responsable_cedula text,
  otro_responsable_tlf text,
  contacto_emergencia_2_nombre text,
  contacto_emergencia_2_telefono text,
  familia_monoparental boolean,
  beneficiario_subsidio_estado boolean,
  subsidio_descripcion text,
  apoyo_actividades text,
  tiene_conocimientos_musicales boolean,
  instrumento_previo text,
  nivel_lectura_musical text,
  interes_musical text,
  instrumento_interes text,
  requiere_iniciacion_musical boolean,
  fecha_ingreso_iniciacion date,
  por_que_unirse text,
  sentimiento_musica_clasica text,
  sentimiento_aprender_instrumento text,
  aspiracion_instrumento text,
  musico_favorito text,
  preferencia_aprendizaje_musical text,
  tiene_alergias boolean,
  alergias_descripcion text,
  tiene_condicion_transmisible boolean,
  condicion_transmisible_desc text,
  tiene_alergia_medicamento boolean,
  alergia_medicamento_desc text,
  impedimento_social boolean,
  problemas_conducta text,
  centro_estudios text,
  grado_nivel text,
  padres_en_vida text,
  acepta_beca_4500 boolean,
  fecha_aceptacion_beca timestamp with time zone,
  acepta_pago_600 boolean,
  fecha_aceptacion_pago timestamp with time zone,
  autoriza_fotos_redes boolean,
  representante_parentesco text,
  exento_mensualidad boolean NOT NULL DEFAULT false,
  familia_id uuid,
  mora_flag boolean NOT NULL DEFAULT false,
  bloqueo_certificado boolean NOT NULL DEFAULT false,
  bloqueo_evento boolean NOT NULL DEFAULT false,
  abandono_score numeric,
  genero text,
  promedio_notas numeric,
  estado_academico text NOT NULL DEFAULT 'activo'::text,
  motivo_baja text,
  fecha_baja date,
  observaciones_baja text,
  baja_procesada_por uuid,
  bloqueo_reinscripcion boolean NOT NULL DEFAULT false,
  deuda_pendiente_baja_centavos bigint NOT NULL DEFAULT 0
);

-- Table: public.alumnos_clases
CREATE TABLE IF NOT EXISTS public.alumnos_clases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  alumno_id uuid NOT NULL,
  clase_id uuid NOT NULL,
  fecha_inscripcion date DEFAULT CURRENT_DATE,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  hora_inicio time without time zone,
  hora_fin time without time zone,
  dia text
);

-- Table: public.alumnos_logros
CREATE TABLE IF NOT EXISTS public.alumnos_logros (
  alumno_id uuid NOT NULL,
  logro_id uuid NOT NULL,
  obtenido_en timestamp with time zone DEFAULT now()
);

-- Table: public.alumnos_programas
CREATE TABLE IF NOT EXISTS public.alumnos_programas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  alumno_id uuid NOT NULL,
  programa_id uuid NOT NULL,
  fecha_inscripcion date DEFAULT CURRENT_DATE,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  periodo_id uuid,
  calificacion numeric,
  estado text NOT NULL DEFAULT 'cursando'::text,
  fuente text,
  requiere_verificacion boolean NOT NULL DEFAULT false
);

-- Table: public.alumnos_reinscripciones
CREATE TABLE IF NOT EXISTS public.alumnos_reinscripciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  alumno_id uuid NOT NULL,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  procesada_por uuid,
  deuda_verificada_centavos bigint NOT NULL DEFAULT 0,
  familia_anterior uuid,
  familia_nueva uuid,
  notas text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.aplicaciones_pago
CREATE TABLE IF NOT EXISTS public.aplicaciones_pago (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pago_id uuid NOT NULL,
  cuota_id uuid NOT NULL,
  monto_aplicado_centavos bigint NOT NULL,
  dias_atraso_al_aplicar integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.app_users
CREATE TABLE IF NOT EXISTS public.app_users (
  id uuid NOT NULL,
  role text NOT NULL,
  jurado_id text NOT NULL,
  display_name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  email text
);

-- Table: public.applicant_events
CREATE TABLE IF NOT EXISTS public.applicant_events (
  id bigint NOT NULL DEFAULT nextval('applicant_events_id_seq'::regclass),
  applicant_id uuid,
  event_name text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.applicants
CREATE TABLE IF NOT EXISTS public.applicants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  idempotency_key text NOT NULL,
  full_name text NOT NULL,
  phone_number text NOT NULL,
  email text,
  utm_source text DEFAULT 'direct'::text,
  status text NOT NULL DEFAULT 'LEAD'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  applicant_id uuid NOT NULL,
  scheduled_datetime timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'RESERVED_PENDING'::text,
  locked_until timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.asistencia_maestros
-- Comment: Presencia del docente por sesion de clase. Complementa ausencias_maestros (que modela solicitudes de permiso, no presencia diaria).
CREATE TABLE IF NOT EXISTS public.asistencia_maestros (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sesion_clase_id uuid NOT NULL,
  maestro_id uuid NOT NULL,
  clase_id uuid,
  periodo_id uuid,
  fecha date NOT NULL,
  estado text NOT NULL,
  ausencia_id uuid,
  suplente_id uuid,
  motivo text,
  observaciones text,
  registrado_por uuid,
  marked_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.asistencia_maestros IS 'Presencia del docente por sesion de clase. Complementa ausencias_maestros (que modela solicitudes de permiso, no presencia diaria).';

-- Table: public.asistencias
CREATE TABLE IF NOT EXISTS public.asistencias (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sesion_clase_id uuid NOT NULL,
  clase_id uuid NOT NULL,
  alumno_id uuid NOT NULL,
  fecha date NOT NULL,
  estado text NOT NULL,
  justificacion_texto text,
  observaciones text,
  registrado_por uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  periodo_id uuid,
  marked_at timestamp with time zone
);

-- Table: public.ausencias
CREATE TABLE IF NOT EXISTS public.ausencias (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  maestro_id uuid NOT NULL,
  fecha_ausencia date NOT NULL,
  motivo text NOT NULL,
  reemplazo_maestro_id uuid,
  clase_alternativa text,
  notificacion_enviada boolean DEFAULT false,
  estado text NOT NULL DEFAULT 'pendiente'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.ausencias_auditoria
CREATE TABLE IF NOT EXISTS public.ausencias_auditoria (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ausencia_id uuid NOT NULL,
  actor_id uuid NOT NULL,
  accion text NOT NULL,
  notas text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.ausencias_maestros
-- Comment: Registro de ausencias y solicitudes de permisos de los docentes
CREATE TABLE IF NOT EXISTS public.ausencias_maestros (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  maestro_id uuid NOT NULL,
  tipo_ausencia text NOT NULL,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  motivo text,
  estado text DEFAULT 'pendiente'::text,
  urgencia text DEFAULT 'media'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  duracion_tipo text DEFAULT 'un_dia'::text,
  archivo_url text,
  maestro_suplente_id uuid,
  notificar_director boolean DEFAULT true,
  director_notificacion_id uuid,
  aprobado_por uuid,
  decision_notas text,
  decidido_en timestamp with time zone,
  revisado_por uuid,
  revision_notas text,
  revision_en timestamp with time zone,
  aprobado_en timestamp with time zone,
  rechazado_por uuid,
  rechazado_en timestamp with time zone,
  razon_rechazo text,
  intentos_solicitud integer DEFAULT 0,
  fecha_solicitud_original date,
  clases_afectadas ARRAY,
  actividades_por_clase jsonb,
  clase_emergente jsonb
);

COMMENT ON TABLE public.ausencias_maestros IS 'Registro de ausencias y solicitudes de permisos de los docentes';

-- Table: public.becas
CREATE TABLE IF NOT EXISTS public.becas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  alumno_id uuid NOT NULL,
  familia_id uuid NOT NULL,
  porcentaje numeric NOT NULL,
  motivo text NOT NULL,
  aprobado_por uuid,
  activa boolean DEFAULT true,
  fecha_inicio date NOT NULL,
  fecha_fin date,
  indicador_progreso_minimo text,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: public.blocks
CREATE TABLE IF NOT EXISTS public.blocks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  route_version_id uuid NOT NULL,
  name text NOT NULL,
  level_from integer NOT NULL,
  level_to integer NOT NULL,
  objective text,
  description text,
  order_index integer NOT NULL DEFAULT 0
);

-- Table: public.calendario
CREATE TABLE IF NOT EXISTS public.calendario (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  departamento_id uuid NOT NULL,
  titulo text NOT NULL,
  descripcion text,
  tipo text NOT NULL,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  fecha_alerta integer DEFAULT 7,
  prioridad text DEFAULT 'media'::text,
  estado text DEFAULT 'planificado'::text,
  responsable_id uuid,
  protocolo_json jsonb DEFAULT '{}'::jsonb,
  notas text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.calendario_institucional
CREATE TABLE IF NOT EXISTS public.calendario_institucional (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descripcion text,
  categoria USER-DEFINED NOT NULL DEFAULT 'otro'::event_categoria,
  fecha_inicio timestamp with time zone NOT NULL,
  fecha_fin timestamp with time zone NOT NULL,
  ubicacion text,
  departamento_responsable USER-DEFINED NOT NULL DEFAULT 'DIR'::soi_departamento,
  metadata jsonb DEFAULT '{}'::jsonb,
  estado text NOT NULL DEFAULT 'programado'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  es_macro_evento boolean DEFAULT false,
  salud_proyecto text DEFAULT 'en_orden'::text,
  venue_id text,
  aforo_proyectado integer DEFAULT 0,
  metadata_pm jsonb DEFAULT '{}'::jsonb
);

-- Table: public.campania_envios
CREATE TABLE IF NOT EXISTS public.campania_envios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  campania_id uuid NOT NULL,
  fuente text NOT NULL,
  persona_id uuid NOT NULL,
  nombre text,
  telefono text,
  jid text NOT NULL,
  segmento text NOT NULL,
  mensaje text,
  estado text NOT NULL DEFAULT 'pendiente_envio'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.campanias_periodo
CREATE TABLE IF NOT EXISTS public.campanias_periodo (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  tipo text NOT NULL,
  accion text NOT NULL,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  activo boolean NOT NULL DEFAULT false,
  periodo_academico_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  abre_servicio_publico boolean NOT NULL DEFAULT false
);

-- Table: public.catalogo_niveles
CREATE TABLE IF NOT EXISTS public.catalogo_niveles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  instrumento text NOT NULL,
  orden integer NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.catalogo_objetivos_especificos
-- Comment: -- DEPRECATED: plantilla curricular legacy en evaluación 2026-09 (Owner: ACM)
CREATE TABLE IF NOT EXISTS public.catalogo_objetivos_especificos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  objetivo_general_id uuid NOT NULL,
  nombre text NOT NULL,
  orden integer NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.catalogo_objetivos_especificos IS '-- DEPRECATED: plantilla curricular legacy en evaluación 2026-09 (Owner: ACM)';

-- Table: public.catalogo_objetivos_generales
CREATE TABLE IF NOT EXISTS public.catalogo_objetivos_generales (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nivel_id uuid NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  orden integer NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.catalogos
CREATE TABLE IF NOT EXISTS public.catalogos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tipo text NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  codigo text,
  categoria text,
  orden integer DEFAULT 0,
  activo boolean DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.clase_horarios
CREATE TABLE IF NOT EXISTS public.clase_horarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clase_id uuid NOT NULL,
  dia text NOT NULL,
  hora_inicio time without time zone NOT NULL,
  hora_fin time without time zone NOT NULL,
  salon_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  maestro_id uuid
);

-- Table: public.clase_mapa_indicadores
-- Comment: -- DEPRECATED: jerarquía legacy en evaluación 2026-09 (Owner: ACM)
CREATE TABLE IF NOT EXISTS public.clase_mapa_indicadores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  objetivo_id uuid NOT NULL,
  clase_id uuid NOT NULL,
  origen_indicator_id uuid,
  descripcion text NOT NULL,
  orden_indicador integer NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  es_requerido boolean NOT NULL DEFAULT true,
  id_jerarquico text NOT NULL,
  archived_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.clase_mapa_indicadores IS '-- DEPRECATED: jerarquía legacy en evaluación 2026-09 (Owner: ACM)';

-- Table: public.clase_mapa_objetivos
-- Comment: -- DEPRECATED: objetivos legacy en evaluación 2026-09 (Owner: ACM)
CREATE TABLE IF NOT EXISTS public.clase_mapa_objetivos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clase_id uuid NOT NULL,
  level_id uuid NOT NULL,
  origen_node_id uuid,
  origen_objetivo_id uuid,
  nombre text NOT NULL,
  descripcion text,
  orden_objetivo integer NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  archived_at timestamp with time zone,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  estado_revision text NOT NULL DEFAULT 'borrador'::text
);

COMMENT ON TABLE public.clase_mapa_objetivos IS '-- DEPRECATED: objetivos legacy en evaluación 2026-09 (Owner: ACM)';

-- Table: public.clases
CREATE TABLE IF NOT EXISTS public.clases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  programa_id uuid,
  nivel_id uuid,
  maestro_principal_id uuid,
  maestro_suplente_id uuid,
  tipo_clase text DEFAULT 'grupal'::text,
  instrumento text,
  descripcion text,
  capacidad_maxima integer,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  estado character varying(50) DEFAULT 'activa'::character varying,
  maestro_id uuid,
  plan_estudio text,
  modalidad text DEFAULT 'presencial'::text,
  salon text,
  route_version_id uuid,
  maestro_auxiliar_id uuid,
  ruta_id uuid,
  whatsapp_group_jid text,
  es_clase_iniciacion boolean NOT NULL DEFAULT false,
  necesita_revision boolean NOT NULL DEFAULT false,
  revision_motivo text
);

-- Table: public.clases_emergentes
CREATE TABLE IF NOT EXISTS public.clases_emergentes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  maestro_id uuid NOT NULL,
  fecha date NOT NULL,
  hora_inicio time without time zone,
  hora_fin time without time zone,
  clase_id uuid,
  nombre_clase text,
  motivo text,
  contenido text,
  observaciones text,
  created_at timestamp with time zone DEFAULT now(),
  salon text,
  grupo text,
  instrumento text,
  tipo text DEFAULT 'refuerzo'::text,
  estado text DEFAULT 'pendiente'::text
);

-- Table: public.class_event_methodology
-- Comment: Structured methodology notes for a class event (warmup, focus areas, repertoire, etc).
CREATE TABLE IF NOT EXISTS public.class_event_methodology (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_event_id uuid NOT NULL,
  warmup text,
  sound_focus text,
  intonation_focus text,
  main_node_id uuid,
  technical_focus text,
  study_used text,
  repertoire_used text,
  sight_reading_work text,
  ear_training_work text,
  closing_observation text,
  homework_text text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.class_event_methodology IS 'Structured methodology notes for a class event (warmup, focus areas, repertoire, etc).';

-- Table: public.class_events
-- Comment: Explicit class event record per session+student, linking academic plan, level, and methodology.
CREATE TABLE IF NOT EXISTS public.class_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  student_id uuid NOT NULL,
  academic_plan_id uuid,
  session_id uuid,
  level_id uuid,
  event_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'draft'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.class_events IS 'Explicit class event record per session+student, linking academic plan, level, and methodology.';

-- Table: public.class_session_content_snapshots
CREATE TABLE IF NOT EXISTS public.class_session_content_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  node_id uuid,
  indicator_id uuid,
  node_name text,
  indicator_description text,
  is_critical boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: public.cobertura_alumno_objetivo
CREATE TABLE IF NOT EXISTS public.cobertura_alumno_objetivo (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  alumno_id uuid,
  objetivo_id uuid,
  plan_id uuid,
  maestro_id uuid,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  confirmado boolean DEFAULT false,
  nivel text DEFAULT 'en_proceso'::text,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: public.comodatos_activos
-- Comment: Préstamos de instrumentos. El trigger trg_comodato_sync_estado_uso sincroniza inventario_activos.estado_uso.
CREATE TABLE IF NOT EXISTS public.comodatos_activos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  activo_id uuid NOT NULL,
  alumno_id uuid NOT NULL,
  fecha_entrega date NOT NULL DEFAULT CURRENT_DATE,
  fecha_devolucion date,
  estado character varying(50) NOT NULL DEFAULT 'activo'::character varying,
  contrato_firmado_url character varying(255),
  observaciones text,
  registrado_por uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  fecha_vencimiento date,
  tipo_comodato character varying(50),
  instrumento_propio_id uuid,
  renovado_de_id uuid,
  intercambiado_con_id uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.comodatos_activos IS 'Préstamos de instrumentos. El trigger trg_comodato_sync_estado_uso sincroniza inventario_activos.estado_uso.';

-- Table: public.compromisos_pago
CREATE TABLE IF NOT EXISTS public.compromisos_pago (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  familia_id uuid NOT NULL,
  representante_id uuid NOT NULL,
  monto_comprometido_centavos bigint NOT NULL,
  fecha_comprometida date NOT NULL,
  cumplido boolean DEFAULT false,
  fecha_cumplimiento date,
  origen_notificacion_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: public.comunicaciones_seguimiento
-- Comment: Portal COM: registro de interacciones (llamadas/whatsapp/correo/reunion) con motor de proxima-accion (follow-up). Estandar CRM Activity model.
CREATE TABLE IF NOT EXISTS public.comunicaciones_seguimiento (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  alumno_id uuid,
  contacto_nombre text,
  contacto_telefono text,
  contacto_email text,
  canal text NOT NULL DEFAULT 'llamada'::text,
  fecha timestamp with time zone NOT NULL DEFAULT now(),
  resultado text NOT NULL DEFAULT 'contactado'::text,
  notas text,
  requiere_seguimiento boolean NOT NULL DEFAULT false,
  proxima_accion text,
  proxima_fecha date,
  estado text NOT NULL DEFAULT 'abierto'::text,
  responsable_id uuid DEFAULT auth.uid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  nivel smallint,
  origen text NOT NULL DEFAULT 'manual'::text
);

COMMENT ON TABLE public.comunicaciones_seguimiento IS 'Portal COM: registro de interacciones (llamadas/whatsapp/correo/reunion) con motor de proxima-accion (follow-up). Estandar CRM Activity model.';

-- Table: public.configuracion_aranceles
CREATE TABLE IF NOT EXISTS public.configuracion_aranceles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  concepto text NOT NULL,
  monto_centavos bigint NOT NULL,
  moneda text NOT NULL DEFAULT 'DOP'::text,
  descripcion text,
  activo boolean NOT NULL DEFAULT true,
  fecha_vigencia_desde date NOT NULL DEFAULT CURRENT_DATE,
  fecha_vigencia_hasta date,
  modificado_por uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table: public.configuracion_recordatorios
CREATE TABLE IF NOT EXISTS public.configuracion_recordatorios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  recordatorios_activos boolean DEFAULT true,
  push_activo boolean DEFAULT false,
  email_activo boolean DEFAULT false,
  hora_resumen_diario time without time zone DEFAULT '18:00:00'::time without time zone,
  dia_resumen_semanal integer DEFAULT 5,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  min_antes_clase integer DEFAULT 15,
  min_post_clase_sin_registro integer DEFAULT 60,
  horas_recordatorio_dia1 integer DEFAULT 24,
  horas_recordatorio_dia2 integer DEFAULT 48,
  alerta_pre_clase boolean DEFAULT true,
  alerta_post_clase boolean DEFAULT true,
  alerta_24h boolean DEFAULT true,
  alerta_48h boolean DEFAULT true
);

-- Table: public.contactos_alianzas
CREATE TABLE IF NOT EXISTS public.contactos_alianzas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre_institucion text NOT NULL,
  website text,
  email_contacto text,
  persona_contacto text,
  area_enfoque text,
  programa_relevante text,
  enfoque_geografico text,
  puntuacion_match integer,
  notas text,
  estado text NOT NULL DEFAULT 'prospecto'::text,
  fecha_primer_contacto timestamp with time zone,
  fecha_ultima_respuesta timestamp with time zone,
  email_enviado boolean DEFAULT false,
  email_draft_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  tipo text DEFAULT 'fundacion'::text
);

-- Table: public.contenidos_sesion
CREATE TABLE IF NOT EXISTS public.contenidos_sesion (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sesion_clase_id uuid NOT NULL,
  planificacion_id uuid,
  modulo_id uuid,
  unidad_id uuid,
  ejercicio_id uuid,
  descripcion text,
  nivel_logro text,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: public.conversaciones_whatsapp
CREATE TABLE IF NOT EXISTS public.conversaciones_whatsapp (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  postulante_id uuid NOT NULL,
  estado_conversacion text NOT NULL DEFAULT 'esperando_respuesta_campania'::text,
  reintentos integer DEFAULT 0,
  jid text NOT NULL,
  ultimo_mensaje_enviado text,
  ultimo_mensaje_recibido text,
  ultima_intencion text,
  fecha_cita_propuesta timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.cuotas
CREATE TABLE IF NOT EXISTS public.cuotas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  familia_id uuid NOT NULL,
  alumno_id uuid,
  concepto text NOT NULL,
  monto_base_centavos bigint NOT NULL,
  monto_final_centavos bigint NOT NULL,
  descuento_centavos bigint DEFAULT 0,
  fecha_generacion date NOT NULL,
  fecha_vencimiento date NOT NULL,
  estado USER-DEFINED NOT NULL DEFAULT 'pendiente'::cuota_estado,
  ciclo_mes integer NOT NULL,
  ciclo_anio integer NOT NULL,
  metadatos jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  monto_pagado_centavos bigint NOT NULL DEFAULT 0
);

-- Table: public.curriculo_objetivos
CREATE TABLE IF NOT EXISTS public.curriculo_objetivos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pilar_id uuid,
  descripcion text NOT NULL,
  orden integer NOT NULL DEFAULT 0
);

-- Table: public.curriculo_pilares
CREATE TABLE IF NOT EXISTS public.curriculo_pilares (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  curriculo_id uuid,
  nombre text NOT NULL,
  orden integer NOT NULL DEFAULT 0
);

-- Table: public.curriculos
CREATE TABLE IF NOT EXISTS public.curriculos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  instrumento text NOT NULL,
  nivel text NOT NULL,
  descripcion text,
  activo boolean DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.departamentos
CREATE TABLE IF NOT EXISTS public.departamentos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  codigo text,
  descripcion text,
  jefe_id uuid,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  email text,
  responsable_nombre text,
  responsable_email text
);

-- Table: public.document_batches
-- Comment: -- DEPRECATED: generador documental institucional diferido 2026-09 (Owner: DIR/ADM)
CREATE TABLE IF NOT EXISTS public.document_batches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tipo text NOT NULL,
  titulo text NOT NULL,
  grupo_tipo text,
  grupo_id uuid,
  grupo_nombre text,
  actividad_nombre text,
  fecha_actividad date,
  lugar_actividad text,
  total_alumnos integer DEFAULT 0,
  total_generados integer DEFAULT 0,
  total_con_advertencias integer DEFAULT 0,
  total_excluidos integer DEFAULT 0,
  estado text NOT NULL DEFAULT 'borrador'::text,
  generado_por uuid,
  created_at timestamp with time zone DEFAULT now(),
  generated_at timestamp with time zone
);

COMMENT ON TABLE public.document_batches IS '-- DEPRECATED: generador documental institucional diferido 2026-09 (Owner: DIR/ADM)';

-- Table: public.document_templates
CREATE TABLE IF NOT EXISTS public.document_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  tipo text NOT NULL,
  descripcion text,
  contenido text NOT NULL,
  variables ARRAY DEFAULT '{}'::text[],
  estado text NOT NULL DEFAULT 'activa'::text,
  version integer NOT NULL DEFAULT 1,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.ejercicios
CREATE TABLE IF NOT EXISTS public.ejercicios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  unidad_id uuid NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  tipo_ejercicio text NOT NULL,
  dificultad integer DEFAULT 1,
  instrucciones text,
  criterios_evaluacion jsonb DEFAULT '{}'::jsonb,
  contenido jsonb DEFAULT '{}'::jsonb,
  puntaje_maximo numeric DEFAULT 10,
  puntaje_aprobacion numeric DEFAULT 7,
  requiere_evidencia boolean DEFAULT false,
  puntos_xp integer DEFAULT 10,
  orden integer NOT NULL,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.evaluacion_indicador
CREATE TABLE IF NOT EXISTS public.evaluacion_indicador (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  alumno_id uuid NOT NULL,
  indicator_id uuid,
  clase_id uuid NOT NULL,
  nota integer,
  estado text DEFAULT 'sin_evaluar'::text,
  observaciones text,
  evaluado_por uuid,
  fecha_evaluacion timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  clase_indicador_id uuid,
  recovery_status text DEFAULT 'pendiente'::text,
  recovery_notes text,
  recovery_timestamp timestamp with time zone,
  recovery_grade integer,
  maestro_indicador_id uuid,
  review_flag boolean NOT NULL DEFAULT false
);

-- Table: public.evaluations
CREATE TABLE IF NOT EXISTS public.evaluations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  jurado_id text NOT NULL,
  jurado_name text NOT NULL,
  afinacion_general integer,
  ritmo_escala integer,
  sonido integer,
  digitacion integer,
  afinacion_rep integer,
  ritmo_rep integer,
  articulacion integer,
  lectura integer,
  score_escala integer,
  score_danzon integer,
  score_total integer,
  observations text DEFAULT ''::text,
  recommendation text DEFAULT ''::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.facturas_reparacion
-- Comment: Facturas asociadas a reparaciones de instrumentos
CREATE TABLE IF NOT EXISTS public.facturas_reparacion (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  reparacion_id uuid NOT NULL,
  numero_factura character varying(50) NOT NULL,
  monto_total numeric NOT NULL,
  impuestos numeric DEFAULT 0,
  metodo_pago character varying(50) NOT NULL,
  responsable_id uuid,
  tipo_factura character varying(50) NOT NULL DEFAULT 'institucion'::character varying,
  fecha_emision date NOT NULL DEFAULT CURRENT_DATE,
  pdf_generado_url character varying(500),
  estado_pago character varying(50) NOT NULL DEFAULT 'pendiente'::character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.facturas_reparacion IS 'Facturas asociadas a reparaciones de instrumentos';

-- Table: public.familias
CREATE TABLE IF NOT EXISTS public.familias (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre_familia text NOT NULL,
  fecha_ingreso date NOT NULL DEFAULT CURRENT_DATE,
  activa boolean NOT NULL DEFAULT true,
  datos_extra jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.fin_service_accounts
-- Comment: Cuentas de servicios externos a refrescar (medidores CEPM, etc.). Solo service_role.
CREATE TABLE IF NOT EXISTS public.fin_service_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL,
  external_account_ref text NOT NULL,
  account_name text,
  service_type text,
  currency_code text NOT NULL DEFAULT 'DOP'::text,
  essential boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  refresh_enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid
);

COMMENT ON TABLE public.fin_service_accounts IS 'Cuentas de servicios externos a refrescar (medidores CEPM, etc.). Solo service_role.';

-- Table: public.fin_service_balance_snapshots
-- Comment: Histórico de balances observados por cuenta (dedup por source_snapshot_key). Solo service_role.
CREATE TABLE IF NOT EXISTS public.fin_service_balance_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  service_account_id uuid NOT NULL,
  refresh_run_id uuid,
  observed_at timestamp with time zone NOT NULL,
  balance_centavos bigint,
  amount_due_centavos bigint,
  due_date date,
  currency_code text NOT NULL,
  source_snapshot_key text NOT NULL,
  provider_summary jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.fin_service_balance_snapshots IS 'Histórico de balances observados por cuenta (dedup por source_snapshot_key). Solo service_role.';

-- Table: public.fin_service_providers
-- Comment: Catálogo de conectores de proveedores de servicios externos (CEPM, etc.). Solo service_role.
CREATE TABLE IF NOT EXISTS public.fin_service_providers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  connector_key text NOT NULL,
  connector_status text NOT NULL DEFAULT 'active'::text,
  display_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.fin_service_providers IS 'Catálogo de conectores de proveedores de servicios externos (CEPM, etc.). Solo service_role.';

-- Table: public.fin_service_refresh_runs
-- Comment: Auditoría de cada intento de refresh (audit trail). Solo service_role.
CREATE TABLE IF NOT EXISTS public.fin_service_refresh_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  service_account_id uuid NOT NULL,
  trigger_source text NOT NULL,
  status text NOT NULL,
  error_code text,
  error_message text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  finished_at timestamp with time zone
);

COMMENT ON TABLE public.fin_service_refresh_runs IS 'Auditoría de cada intento de refresh (audit trail). Solo service_role.';

-- Table: public.fin_service_refresh_state
-- Comment: Estado de lock + última consulta por cuenta, para concurrencia segura. Solo service_role.
CREATE TABLE IF NOT EXISTS public.fin_service_refresh_state (
  service_account_id uuid NOT NULL,
  locked_by_run_id uuid,
  lock_expires_at timestamp with time zone,
  last_query_at timestamp with time zone,
  last_success_at timestamp with time zone,
  last_status text,
  last_error_code text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.fin_service_refresh_state IS 'Estado de lock + última consulta por cuenta, para concurrencia segura. Solo service_role.';

-- Table: public.finanzas_politica_cobranza
CREATE TABLE IF NOT EXISTS public.finanzas_politica_cobranza (
  singleton boolean NOT NULL DEFAULT true,
  dia_vencimiento smallint NOT NULL DEFAULT 10,
  dias_mora_amarilla integer NOT NULL DEFAULT 30,
  dias_mora_critica integer NOT NULL DEFAULT 60,
  bloqueo_requiere_aprobacion boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid DEFAULT auth.uid()
);

-- Table: public.gastos_fijos
CREATE TABLE IF NOT EXISTS public.gastos_fijos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  categoria text NOT NULL,
  centro_costo USER-DEFINED NOT NULL DEFAULT 'ADM'::soi_departamento,
  monto_centavos bigint NOT NULL,
  dia_inicio smallint NOT NULL,
  dia_fin smallint NOT NULL,
  repetir_mensual boolean NOT NULL DEFAULT true,
  activo boolean NOT NULL DEFAULT true,
  notas text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid()
);

-- Table: public.gastos_fijos_pagos
CREATE TABLE IF NOT EXISTS public.gastos_fijos_pagos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  gasto_fijo_id uuid NOT NULL,
  periodo_anio integer NOT NULL,
  periodo_mes integer NOT NULL,
  monto_centavos bigint NOT NULL,
  estado text NOT NULL DEFAULT 'pendiente'::text,
  fecha_pago date,
  referencia text,
  registrado_por uuid DEFAULT auth.uid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.generated_documents
-- Comment: -- DEPRECATED: generador documental institucional diferido 2026-09 (Owner: DIR/ADM)
CREATE TABLE IF NOT EXISTS public.generated_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  batch_id uuid,
  template_id uuid,
  tipo text NOT NULL,
  titulo text NOT NULL,
  alumno_id uuid,
  alumno_nombre text,
  grupo_nombre text,
  actividad_nombre text,
  contenido_final text NOT NULL,
  variables_usadas jsonb DEFAULT '{}'::jsonb,
  variables_faltantes jsonb DEFAULT '[]'::jsonb,
  advertencias jsonb DEFAULT '[]'::jsonb,
  pdf_url text,
  estado text NOT NULL DEFAULT 'borrador'::text,
  generado_por uuid,
  generated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.generated_documents IS '-- DEPRECATED: generador documental institucional diferido 2026-09 (Owner: DIR/ADM)';

-- Table: public.hermes_gateway_health
-- Comment: Registro de telemetria y latido en vivo (heartbeat) emitido por el contenedor Evolution API / Baileys.
CREATE TABLE IF NOT EXISTS public.hermes_gateway_health (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  instance_name text NOT NULL DEFAULT 'soi-main'::text,
  status text NOT NULL DEFAULT 'disconnected'::text,
  phone_number text,
  battery_level integer,
  qr_code_base64 text,
  last_heartbeat timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

COMMENT ON TABLE public.hermes_gateway_health IS 'Registro de telemetria y latido en vivo (heartbeat) emitido por el contenedor Evolution API / Baileys.';

-- Table: public.hermes_gateway_worker_lease
CREATE TABLE IF NOT EXISTS public.hermes_gateway_worker_lease (
  instance_name text NOT NULL,
  owner_id text NOT NULL,
  lease_until timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.hermes_inbox
-- Comment: Bus de eventos para HERMES. Leída por analyze-risk.js y cron jobs. Solo service_role.
CREATE TABLE IF NOT EXISTS public.hermes_inbox (
  id bigint NOT NULL DEFAULT nextval('hermes_inbox_id_seq'::regclass),
  canal character varying(50) NOT NULL DEFAULT 'db_trigger'::character varying,
  categoria character varying(100) NOT NULL,
  summary text NOT NULL,
  raw_ref uuid,
  processed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  telegram_user_id bigint
);

COMMENT ON TABLE public.hermes_inbox IS 'Bus de eventos para HERMES. Leída por analyze-risk.js y cron jobs. Solo service_role.';

-- Table: public.hermes_kanban_cards
-- Comment: Espejo read-only de tarjetas del Kanban de Hermes (~/.hermes/kanban.db). Escrita por edge fn hermes-kanban-ingest via poller. Fase 1 puente Hermes<->SOI.
CREATE TABLE IF NOT EXISTS public.hermes_kanban_cards (
  card_id text NOT NULL,
  board text,
  title text NOT NULL,
  status text NOT NULL,
  assignee text,
  priority integer,
  summary text,
  hermes_updated_at timestamp with time zone,
  synced_at timestamp with time zone NOT NULL DEFAULT now(),
  raw jsonb
);

COMMENT ON TABLE public.hermes_kanban_cards IS 'Espejo read-only de tarjetas del Kanban de Hermes (~/.hermes/kanban.db). Escrita por edge fn hermes-kanban-ingest via poller. Fase 1 puente Hermes<->SOI.';

-- Table: public.hermes_process_cases
-- Comment: Ejecucion concreta de un proceso SOI. Su id se usa como correlation_id para agrupar tareas institucionales.
CREATE TABLE IF NOT EXISTS public.hermes_process_cases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  process_code text,
  title text NOT NULL,
  description text,
  source text NOT NULL DEFAULT 'manual'::text,
  status text NOT NULL DEFAULT 'open'::text,
  priority text NOT NULL DEFAULT 'media'::text,
  requested_by uuid,
  requested_by_name text,
  owner_department text,
  entity_type text,
  entity_id uuid,
  entity_label text,
  required_evidence_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  closure_criteria_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  closure_summary text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  opened_at timestamp with time zone NOT NULL DEFAULT now(),
  closed_at timestamp with time zone,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.hermes_process_cases IS 'Ejecucion concreta de un proceso SOI. Su id se usa como correlation_id para agrupar tareas institucionales.';

-- Table: public.hermes_protocolos
CREATE TABLE IF NOT EXISTS public.hermes_protocolos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  categoria_evento USER-DEFINED NOT NULL,
  nombre_protocolo text NOT NULL,
  descripcion text,
  tareas_plantilla jsonb NOT NULL,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.hermes_reactive_rules
CREATE TABLE IF NOT EXISTS public.hermes_reactive_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  rule_type text NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  enabled boolean NOT NULL DEFAULT true,
  departamento text NOT NULL,
  conditions_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.hermes_whatsapp_config
CREATE TABLE IF NOT EXISTS public.hermes_whatsapp_config (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  gateway_url text NOT NULL,
  api_key text,
  instance_name text NOT NULL DEFAULT 'soi-main'::text,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  jitter_min_seg integer NOT NULL DEFAULT 8,
  jitter_max_seg integer NOT NULL DEFAULT 20,
  cap_diario integer NOT NULL DEFAULT 200,
  cap_horario integer NOT NULL DEFAULT 40,
  batch_size integer NOT NULL DEFAULT 10,
  batch_cooldown_seg integer NOT NULL DEFAULT 60,
  warmup_inicio integer NOT NULL DEFAULT 20,
  warmup_dias integer NOT NULL DEFAULT 7,
  warmup_desde date,
  rate_limit_hora integer NOT NULL DEFAULT 10,
  numero_wid text,
  numero_nombre text,
  consentimiento_registrado boolean NOT NULL DEFAULT false
);

-- Table: public.hermes_whatsapp_queue
CREATE TABLE IF NOT EXISTS public.hermes_whatsapp_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  jid text NOT NULL,
  mensaje text NOT NULL,
  estado text NOT NULL DEFAULT 'pendiente'::text,
  intentos integer DEFAULT 0,
  error_msg text,
  created_at timestamp with time zone DEFAULT now(),
  procesado_at timestamp with time zone,
  campania_envio_id uuid
);

-- Table: public.historial_estado_alumno
-- Comment: Tracking de altas, bajas y reactivaciones de alumnos
CREATE TABLE IF NOT EXISTS public.historial_estado_alumno (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  alumno_id uuid NOT NULL,
  estado text NOT NULL,
  motivo text,
  registrado_por uuid,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.historial_estado_alumno IS 'Tracking de altas, bajas y reactivaciones de alumnos';

-- Table: public.homework_assignments
-- Comment: Formal homework assignments with optional node link and due date.
CREATE TABLE IF NOT EXISTS public.homework_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_event_id uuid NOT NULL,
  student_id uuid NOT NULL,
  teacher_id uuid NOT NULL,
  node_id uuid,
  description text NOT NULL,
  due_date date,
  status text NOT NULL DEFAULT 'assigned'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.homework_assignments IS 'Formal homework assignments with optional node link and due date.';

-- Table: public.horarios
CREATE TABLE IF NOT EXISTS public.horarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clase_id uuid NOT NULL,
  maestro_id uuid NOT NULL,
  salon_id uuid NOT NULL,
  dia_semana integer NOT NULL,
  hora_inicio time without time zone NOT NULL,
  hora_fin time without time zone NOT NULL,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.indicador_prerequisito
CREATE TABLE IF NOT EXISTS public.indicador_prerequisito (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  indicador_id uuid NOT NULL,
  prerequisito_indicador_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: public.indicator_attempts
CREATE TABLE IF NOT EXISTS public.indicator_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  indicator_id uuid NOT NULL,
  session_id uuid,
  result text,
  observations text,
  created_at timestamp with time zone DEFAULT now(),
  node_id uuid,
  status text DEFAULT 'pending'::text,
  nota smallint,
  tarea text,
  covered_date date DEFAULT CURRENT_DATE,
  covered_by_clase_id uuid,
  created_by uuid NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.indicator_session_students
CREATE TABLE IF NOT EXISTS public.indicator_session_students (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  indicator_session_id uuid NOT NULL,
  alumno_id uuid NOT NULL,
  nota_cualitativa character varying(20) NOT NULL,
  observaciones_individuales text,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: public.indicator_sessions
CREATE TABLE IF NOT EXISTS public.indicator_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  maestro_id uuid NOT NULL,
  clase_id uuid NOT NULL,
  fecha date NOT NULL,
  descripcion text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  objetivo_id uuid NOT NULL
);

-- Table: public.indicators
CREATE TABLE IF NOT EXISTS public.indicators (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  node_id uuid,
  description text NOT NULL,
  minimum_criteria jsonb DEFAULT '{}'::jsonb,
  is_required boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  nombre text,
  activo boolean NOT NULL DEFAULT true,
  objetivo_id uuid
);

-- Table: public.instrumentos
CREATE TABLE IF NOT EXISTS public.instrumentos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  codigo text,
  nombre text NOT NULL,
  tipo text,
  marca text,
  serie text,
  estado text NOT NULL DEFAULT 'disponible'::text,
  alumno_id uuid,
  alumno_nombre text,
  notas text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.inventario_accesorios
-- Comment: Accesorios asociados a instrumentos (fundas, arcos, cuerdas, etc.)
CREATE TABLE IF NOT EXISTS public.inventario_accesorios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  activo_id uuid,
  tipo character varying(50) NOT NULL,
  marca character varying(100),
  cantidad integer NOT NULL DEFAULT 1,
  estado character varying(50) NOT NULL DEFAULT 'disponible'::character varying,
  fecha_asignacion date,
  observaciones text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.inventario_accesorios IS 'Accesorios asociados a instrumentos (fundas, arcos, cuerdas, etc.)';

-- Table: public.inventario_activos
-- Comment: Catálogo de instrumentos. estado_uso lo gestiona el trigger trg_comodato_sync_estado_uso.
CREATE TABLE IF NOT EXISTS public.inventario_activos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tipo_instrumento character varying(100) NOT NULL,
  marca character varying(100),
  modelo character varying(100),
  numero_serie character varying(100),
  codigo_inventario character varying(50) NOT NULL,
  estado_conservacion character varying(50) NOT NULL DEFAULT 'bueno'::character varying,
  estado_uso character varying(50) NOT NULL DEFAULT 'disponible'::character varying,
  ubicacion character varying(100) NOT NULL DEFAULT 'Sede Principal'::character varying,
  activo boolean NOT NULL DEFAULT true,
  notas text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  fecha_adquisicion date,
  valor_adquisicion numeric,
  fecha_baja date,
  motivo_baja text,
  foto_url character varying(500),
  proveedor character varying(200),
  familia text,
  nombre_normalizado text,
  tamano text,
  cantidad numeric DEFAULT 1,
  unidad text DEFAULT 'unidad'::text,
  estado_asignacion_original text,
  asignado_a_texto text,
  requiere_mantenimiento boolean DEFAULT false,
  tiene_arco boolean,
  tiene_estuche boolean,
  tiene_funda boolean,
  tiene_hombrera_almohadilla boolean,
  faltantes_detectados text,
  donante_inferido text,
  codigo_donante text,
  fuente_importacion text,
  numero_original text,
  fila_origen_csv integer,
  revisar boolean DEFAULT false,
  alertas_calidad text,
  import_metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

COMMENT ON TABLE public.inventario_activos IS 'Catálogo de instrumentos. estado_uso lo gestiona el trigger trg_comodato_sync_estado_uso.';

-- Table: public.inventario_historial
-- Comment: Historial de eventos de instrumentos. Se inserta automáticamente via triggers.
CREATE TABLE IF NOT EXISTS public.inventario_historial (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  activo_id uuid NOT NULL,
  tipo_evento character varying(50) NOT NULL,
  descripcion text NOT NULL,
  fecha timestamp with time zone NOT NULL DEFAULT now(),
  usuario_id uuid,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.inventario_historial IS 'Historial de eventos de instrumentos. Se inserta automáticamente via triggers.';

-- Table: public.inventario_materiales
CREATE TABLE IF NOT EXISTS public.inventario_materiales (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  item text NOT NULL,
  categoria text,
  familia_instrumento text,
  marca text,
  modelo text,
  cantidad numeric,
  unidad text NOT NULL DEFAULT 'unidad'::text,
  descripcion text,
  ubicacion text,
  activo boolean NOT NULL DEFAULT true,
  fuente_importacion text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.inventario_reparaciones
-- Comment: Reparaciones de instrumentos. estado controla el flujo: recibido → en_reparacion → finalizado → entregado
CREATE TABLE IF NOT EXISTS public.inventario_reparaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  activo_id uuid NOT NULL,
  tipo_tallerista character varying(50) NOT NULL,
  tallerista_nombre character varying(200) NOT NULL,
  descripcion text NOT NULL,
  costo_estimado numeric,
  costo_real numeric,
  fecha_ingreso date NOT NULL DEFAULT CURRENT_DATE,
  fecha_egreso date,
  estado character varying(50) NOT NULL DEFAULT 'recibido'::character varying,
  proveedor_factura_url character varying(500),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.inventario_reparaciones IS 'Reparaciones de instrumentos. estado controla el flujo: recibido → en_reparacion → finalizado → entregado';

-- Table: public.justificaciones
-- Comment: Registro de justificaciones de inasistencias de alumnos
CREATE TABLE IF NOT EXISTS public.justificaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sesion_id uuid,
  alumno_id uuid NOT NULL,
  clase_id uuid,
  fecha date NOT NULL,
  motivo text NOT NULL,
  evidencia_url text,
  evidencia_base64 text,
  creado_por uuid,
  estado text NOT NULL DEFAULT 'pendiente'::text,
  revisado_por uuid,
  fecha_revision timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  categoria text
);

COMMENT ON TABLE public.justificaciones IS 'Registro de justificaciones de inasistencias de alumnos';

-- Table: public.levels
CREATE TABLE IF NOT EXISTS public.levels (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  block_id uuid,
  route_version_id uuid NOT NULL,
  level_number integer NOT NULL,
  name text NOT NULL,
  main_objective text,
  suggested_duration_value integer,
  suggested_duration_unit text,
  is_flexible_duration boolean NOT NULL DEFAULT true,
  target_work jsonb DEFAULT '{}'::jsonb,
  unlock_criteria jsonb DEFAULT '{}'::jsonb,
  order_index integer NOT NULL DEFAULT 0
);

-- Table: public.logros
CREATE TABLE IF NOT EXISTS public.logros (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  criterio jsonb DEFAULT '{}'::jsonb,
  icono text,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.lut_diagnosticos
CREATE TABLE IF NOT EXISTS public.lut_diagnosticos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  orden_id uuid NOT NULL,
  diagnostico_tecnico text NOT NULL,
  causa_probable text,
  tipo_dano text,
  gravedad text,
  zona_afectada text,
  reparacion_recomendada text,
  materiales_requeridos text,
  tiempo_estimado_horas numeric,
  costo_mano_obra numeric,
  costo_materiales numeric,
  requiere_servicio_externo boolean NOT NULL DEFAULT false,
  observaciones text,
  diagnosticado_por uuid,
  diagnosticado_por_nombre text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  items jsonb NOT NULL DEFAULT '[]'::jsonb
);

-- Table: public.lut_evidencias
CREATE TABLE IF NOT EXISTS public.lut_evidencias (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  orden_id uuid NOT NULL,
  tipo text NOT NULL,
  nombre text,
  storage_path text,
  descripcion text,
  visibilidad text NOT NULL DEFAULT 'interno'::text,
  subido_por uuid,
  subido_por_nombre text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.lut_insumos
CREATE TABLE IF NOT EXISTS public.lut_insumos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  categoria text,
  unidad text NOT NULL DEFAULT 'unidad'::text,
  stock_actual numeric NOT NULL DEFAULT 0,
  stock_minimo numeric NOT NULL DEFAULT 0,
  costo_unitario numeric,
  proveedor_sugerido text,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.lut_movimientos_insumos
CREATE TABLE IF NOT EXISTS public.lut_movimientos_insumos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  insumo_id uuid NOT NULL,
  orden_id uuid,
  tipo_movimiento text NOT NULL,
  cantidad numeric NOT NULL,
  costo_unitario numeric,
  registrado_por uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.lut_ordenes_reparacion
CREATE TABLE IF NOT EXISTS public.lut_ordenes_reparacion (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  correlation_id uuid,
  instrumento_id uuid NOT NULL,
  alumno_id uuid,
  alumno_nombre text,
  reportado_por uuid,
  reportado_por_nombre text,
  recibido_por uuid,
  recibido_por_nombre text,
  tecnico_responsable uuid,
  tecnico_responsable_nombre text,
  departamento_origen text,
  estado text NOT NULL DEFAULT 'reportado'::text,
  prioridad text NOT NULL DEFAULT 'media'::text,
  descripcion_inicial text,
  diagnostico_resumen text,
  tipo_dano text,
  gravedad text,
  requiere_reemplazo boolean NOT NULL DEFAULT false,
  requiere_cobro boolean NOT NULL DEFAULT false,
  requiere_aprobacion_direccion boolean NOT NULL DEFAULT false,
  costo_estimado numeric,
  costo_final numeric,
  fecha_recepcion timestamp with time zone NOT NULL DEFAULT now(),
  fecha_diagnostico timestamp with time zone,
  fecha_inicio_reparacion timestamp with time zone,
  fecha_estimada_entrega timestamp with time zone,
  fecha_entrega timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.lut_presupuestos
CREATE TABLE IF NOT EXISTS public.lut_presupuestos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  orden_id uuid NOT NULL,
  estado text NOT NULL DEFAULT 'borrador'::text,
  subtotal_mano_obra numeric NOT NULL DEFAULT 0,
  subtotal_materiales numeric NOT NULL DEFAULT 0,
  subtotal_servicios_externos numeric NOT NULL DEFAULT 0,
  descuento numeric NOT NULL DEFAULT 0,
  monto_institucion numeric NOT NULL DEFAULT 0,
  monto_representante numeric NOT NULL DEFAULT 0,
  total numeric,
  aprobado_por uuid,
  aprobado_en timestamp with time zone,
  observaciones text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.lut_solicitudes_compra
CREATE TABLE IF NOT EXISTS public.lut_solicitudes_compra (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  orden_id uuid,
  insumo_id uuid,
  cantidad_solicitada numeric NOT NULL,
  justificacion text,
  urgencia text NOT NULL DEFAULT 'media'::text,
  costo_estimado numeric,
  proveedor_sugerido text,
  estado text NOT NULL DEFAULT 'pendiente'::text,
  solicitado_por uuid,
  aprobado_por uuid,
  fecha_requerida date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.maestro_access_credentials
-- Comment: Encrypted vault for recoverable maestro portal passwords. Plaintext is only returned by the admin-only Edge Function.
CREATE TABLE IF NOT EXISTS public.maestro_access_credentials (
  maestro_id uuid NOT NULL,
  password_ciphertext text NOT NULL,
  password_iv text NOT NULL,
  password_version integer NOT NULL DEFAULT 1,
  last_generated_at timestamp with time zone NOT NULL DEFAULT now(),
  last_revealed_at timestamp with time zone,
  last_revealed_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.maestro_access_credentials IS 'Encrypted vault for recoverable maestro portal passwords. Plaintext is only returned by the admin-only Edge Function.';

-- Table: public.maestro_desempeno
CREATE TABLE IF NOT EXISTS public.maestro_desempeno (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  maestro_id uuid,
  total_sesiones integer DEFAULT 0,
  sesiones_verde integer DEFAULT 0,
  sesiones_amarillo integer DEFAULT 0,
  sesiones_naranja integer DEFAULT 0,
  sesiones_rojo integer DEFAULT 0,
  categoria text DEFAULT 'responsable'::text,
  fecha_ultima_evaluacion timestamp with time zone,
  tendencia text DEFAULT 'estable'::text,
  pending_count integer DEFAULT 0,
  oldest_dias_atraso integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.maestro_indicadores
CREATE TABLE IF NOT EXISTS public.maestro_indicadores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  objetivo_id uuid NOT NULL,
  orden integer NOT NULL,
  nombre text NOT NULL,
  criterios_json jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: public.maestro_objetivos
CREATE TABLE IF NOT EXISTS public.maestro_objetivos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  unidad_id uuid NOT NULL,
  orden integer NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: public.maestro_retiros
CREATE TABLE IF NOT EXISTS public.maestro_retiros (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  maestro_id uuid NOT NULL,
  reemplazo_maestro_id uuid,
  retirado_por uuid,
  motivo text,
  resumen_dependencias jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.maestro_routes
CREATE TABLE IF NOT EXISTS public.maestro_routes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  maestro_id uuid NOT NULL,
  clase_id uuid NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.maestro_tareas
CREATE TABLE IF NOT EXISTS public.maestro_tareas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  maestro_id uuid NOT NULL,
  alumno_id uuid,
  sesion_id uuid,
  tarea text NOT NULL,
  fecha_recordatorio date,
  completada boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: public.maestro_unidades
CREATE TABLE IF NOT EXISTS public.maestro_unidades (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ruta_id uuid NOT NULL,
  orden integer NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: public.maestros
CREATE TABLE IF NOT EXISTS public.maestros (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  nombre_completo text NOT NULL,
  especialidad text NOT NULL,
  tipo_maestro text DEFAULT 'catedra'::text,
  habilidades ARRAY DEFAULT ARRAY[]::text[],
  disponibilidad jsonb NOT NULL DEFAULT '{}'::jsonb,
  tlf text,
  correo text NOT NULL,
  resena text,
  puede_ser_suplente boolean DEFAULT true,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  especialidades ARRAY,
  es_admin boolean DEFAULT false,
  retirado_en timestamp with time zone,
  retirado_por uuid,
  motivo_retiro text
);

-- Table: public.mapa_plantillas
-- Comment: -- DEPRECATED: plantillas legacy en evaluación 2026-09 (Owner: ACM)
CREATE TABLE IF NOT EXISTS public.mapa_plantillas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  instrumento text NOT NULL,
  descripcion text,
  route_version_id uuid NOT NULL,
  level_id uuid NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  publicada_por uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.mapa_plantillas IS '-- DEPRECATED: plantillas legacy en evaluación 2026-09 (Owner: ACM)';

-- Table: public.minutas
-- Comment: -- DEPRECATED: conservada por integridad referencial desde tareas_institucionales 2026-09 (Owner: DIR)
CREATE TABLE IF NOT EXISTS public.minutas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  fecha_reunion date NOT NULL,
  participantes jsonb NOT NULL DEFAULT '[]'::jsonb,
  puntos_tratados jsonb NOT NULL DEFAULT '[]'::jsonb,
  acuerdos jsonb NOT NULL DEFAULT '[]'::jsonb,
  responsables jsonb DEFAULT '[]'::jsonb,
  fecha_proxima_reunion date,
  visibilidad USER-DEFINED NOT NULL DEFAULT 'todos'::minuta_visibilidad,
  creado_por uuid,
  archivo_adjunto_url text,
  created_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.minutas IS '-- DEPRECATED: conservada por integridad referencial desde tareas_institucionales 2026-09 (Owner: DIR)';

-- Table: public.modulos
CREATE TABLE IF NOT EXISTS public.modulos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  programa_id uuid NOT NULL,
  nivel_id uuid NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  orden integer NOT NULL,
  duracion_estimada_semanas integer,
  requisito_modulo_id uuid,
  porcentaje_aprobacion numeric DEFAULT 80,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.niveles
CREATE TABLE IF NOT EXISTS public.niveles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  programa_id uuid NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  orden integer NOT NULL,
  duracion_estimada_meses integer,
  criterios_promocion jsonb DEFAULT '{}'::jsonb,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.node_resources
CREATE TABLE IF NOT EXISTS public.node_resources (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  node_id uuid NOT NULL,
  resource_type text NOT NULL,
  title text NOT NULL,
  url text,
  content text,
  order_index integer NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.nodes
CREATE TABLE IF NOT EXISTS public.nodes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  level_id uuid NOT NULL,
  route_version_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  is_critical boolean NOT NULL DEFAULT false,
  is_required boolean NOT NULL DEFAULT true,
  objective text,
  order_index integer NOT NULL DEFAULT 0,
  codigo text
);

-- Table: public.notificaciones
CREATE TABLE IF NOT EXISTS public.notificaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid,
  registro_pendiente_id uuid,
  tipo text DEFAULT 'in_app'::text,
  titulo text NOT NULL,
  mensaje text NOT NULL,
  deep_link text,
  estado text DEFAULT 'pendiente'::text,
  enviada_en timestamp with time zone,
  leida_en timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  escalation_level integer DEFAULT 0,
  scheduled_for timestamp with time zone,
  dedup_key text,
  clase_id uuid
);

-- Table: public.notificaciones_asistencia
CREATE TABLE IF NOT EXISTS public.notificaciones_asistencia (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tipo text NOT NULL,
  canal text NOT NULL DEFAULT 'whatsapp'::text,
  prioridad text NOT NULL DEFAULT 'normal'::text,
  destinatario_telefono text NOT NULL,
  destinatario_nombre text,
  destinatario_email text,
  titulo text,
  cuerpo text NOT NULL,
  estado text NOT NULL DEFAULT 'pendiente'::text,
  fecha_creacion timestamp with time zone DEFAULT now(),
  fecha_programada timestamp with time zone,
  fecha_envio timestamp with time zone,
  fecha_respuesta timestamp with time zone,
  respuesta text,
  respuesta_hora timestamp with time zone,
  datos_extra jsonb,
  intentos_envio integer DEFAULT 0,
  error_ultimo jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.notificaciones_caja
CREATE TABLE IF NOT EXISTS public.notificaciones_caja (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  familia_id uuid,
  representante_id uuid,
  alumno_id uuid,
  tipo USER-DEFINED NOT NULL,
  canal USER-DEFINED NOT NULL DEFAULT 'ambos'::notif_canal,
  prioridad USER-DEFINED NOT NULL DEFAULT 'media'::notif_prioridad,
  titulo text NOT NULL,
  cuerpo text NOT NULL,
  datos_extra jsonb DEFAULT '{}'::jsonb,
  estado_whatsapp USER-DEFINED NOT NULL DEFAULT 'pendiente'::notif_estado_wa,
  estado_portal USER-DEFINED NOT NULL DEFAULT 'no_leida'::notif_estado_portal,
  respuesta_padre text,
  fecha_respuesta timestamp with time zone,
  fecha_programada timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.notification_trigger_logs
CREATE TABLE IF NOT EXISTS public.notification_trigger_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  execution_time timestamp without time zone DEFAULT now(),
  status text NOT NULL,
  maestros_processed integer,
  notifications_created integer,
  errors_count integer,
  error_message text,
  context text,
  created_at timestamp without time zone DEFAULT now()
);

-- Table: public.objetivos
-- Comment: Objetivos explícitos entre temas (nodes) e indicadores.
CREATE TABLE IF NOT EXISTS public.objetivos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  node_id uuid NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  order_index integer NOT NULL DEFAULT 0,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.objetivos IS 'Objetivos explícitos entre temas (nodes) e indicadores.';

-- Table: public.observaciones_alumnos
CREATE TABLE IF NOT EXISTS public.observaciones_alumnos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  alumno_id uuid NOT NULL,
  maestro_id uuid,
  clase_id uuid,
  sesion_clase_id uuid,
  tipo text DEFAULT 'academica'::text,
  observacion text NOT NULL,
  requiere_seguimiento boolean DEFAULT false,
  fecha date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  titulo text,
  descripcion text,
  prioridad text NOT NULL DEFAULT 'media'::text,
  estado text NOT NULL DEFAULT 'abierta'::text,
  fecha_observacion date,
  seguimiento_fecha date,
  seguimiento_observacion text
);

-- Table: public.observaciones_sesion
-- Comment: Raw DSL observations per session. es_borrador=true for auto-drafts, false for confirmed saves.
CREATE TABLE IF NOT EXISTS public.observaciones_sesion (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sesion_id uuid NOT NULL,
  maestro_id uuid NOT NULL,
  contenido_raw text NOT NULL DEFAULT ''::text,
  contenido_parsed jsonb,
  es_borrador boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  contenido_ia_dsl text,
  first_note_at timestamp with time zone,
  last_note_at timestamp with time zone,
  ai_fill_at timestamp with time zone
);

COMMENT ON TABLE public.observaciones_sesion IS 'Raw DSL observations per session. es_borrador=true for auto-drafts, false for confirmed saves.';

-- Table: public.pagos
CREATE TABLE IF NOT EXISTS public.pagos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  familia_id uuid NOT NULL,
  cuota_ids ARRAY NOT NULL DEFAULT '{}'::uuid[],
  monto_centavos bigint NOT NULL,
  metodo_pago USER-DEFINED NOT NULL,
  referencia text,
  cajero_id uuid,
  notas text,
  recibo_url text,
  created_at timestamp with time zone DEFAULT now(),
  fecha_pago date DEFAULT CURRENT_DATE
);

-- Table: public.pagos_alumnos
-- Comment: Registro de pagos por alumno. periodo_mes es el mes cubierto, no la fecha de pago.
CREATE TABLE IF NOT EXISTS public.pagos_alumnos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  alumno_id uuid NOT NULL,
  monto numeric NOT NULL,
  concepto character varying(100) NOT NULL,
  periodo_mes date NOT NULL,
  fecha_pago date NOT NULL DEFAULT CURRENT_DATE,
  metodo_pago character varying(50) NOT NULL,
  referencia_transaccion character varying(100),
  registrado_por uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.pagos_alumnos IS 'Registro de pagos por alumno. periodo_mes es el mes cubierto, no la fecha de pago.';

-- Table: public.patrocinantes
CREATE TABLE IF NOT EXISTS public.patrocinantes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  tipo USER-DEFINED NOT NULL DEFAULT 'persona'::patrocinante_tipo,
  contacto text,
  email text,
  telefono text,
  activo boolean DEFAULT true,
  notas text,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: public.patrocinios
CREATE TABLE IF NOT EXISTS public.patrocinios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patrocinante_id uuid NOT NULL,
  alumno_id uuid NOT NULL,
  familia_id uuid NOT NULL,
  cubre USER-DEFINED NOT NULL DEFAULT 'todo'::patrocinio_cubre,
  monto_mensual_centavos bigint,
  activo boolean DEFAULT true,
  fecha_inicio date NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin date,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: public.periodo_excepciones
-- Comment: Dias no lectivos dentro de un periodo academico. periodo_id NULL = excepcion global (feriado nacional).
CREATE TABLE IF NOT EXISTS public.periodo_excepciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  periodo_id uuid,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  motivo text NOT NULL,
  tipo text NOT NULL DEFAULT 'feriado'::text,
  creado_por uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.periodo_excepciones IS 'Dias no lectivos dentro de un periodo academico. periodo_id NULL = excepcion global (feriado nacional).';

-- Table: public.periodos
-- Comment: Períodos académicos del año (ej: Trimestre I 2025)
CREATE TABLE IF NOT EXISTS public.periodos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  activo boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  cerrado boolean NOT NULL DEFAULT false,
  cerrado_at timestamp with time zone,
  cerrado_por uuid,
  observaciones_cierre text
);

COMMENT ON TABLE public.periodos IS 'Períodos académicos del año (ej: Trimestre I 2025)';

-- Table: public.periodos_cierre_auditoria
CREATE TABLE IF NOT EXISTS public.periodos_cierre_auditoria (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  periodo_id uuid NOT NULL,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  cerrado_por uuid,
  observaciones text,
  resumen jsonb NOT NULL DEFAULT '{}'::jsonb,
  snapshot jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.permisos_maestros
CREATE TABLE IF NOT EXISTS public.permisos_maestros (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  maestro_id uuid NOT NULL,
  puede_registrar_alumnos boolean DEFAULT false,
  puede_inscribir_clases boolean DEFAULT false,
  concedido_por uuid,
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  permisos ARRAY NOT NULL DEFAULT '{}'::text[],
  solicitudes ARRAY NOT NULL DEFAULT '{}'::text[],
  fecha_inicio date NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin date,
  puede_crear_clases boolean DEFAULT false,
  puede_planificar boolean DEFAULT true,
  puede_asistir boolean DEFAULT true
);

-- Table: public.plan_clases
-- Comment: DEPRECATED: usar routes/route_versions/blocks/levels/nodes/indicators
CREATE TABLE IF NOT EXISTS public.plan_clases (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone DEFAULT now(),
  nombre text NOT NULL,
  descripcion text,
  activo boolean DEFAULT true,
  maestro_id uuid,
  clase_id uuid
);

COMMENT ON TABLE public.plan_clases IS 'DEPRECATED: usar routes/route_versions/blocks/levels/nodes/indicators';

-- Table: public.plan_indicadores
-- Comment: DEPRECATED: usar indicators
CREATE TABLE IF NOT EXISTS public.plan_indicadores (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  objetivo_id uuid,
  descripcion text NOT NULL,
  es_requerido boolean DEFAULT true,
  orden_index integer DEFAULT 0
);

COMMENT ON TABLE public.plan_indicadores IS 'DEPRECATED: usar indicators';

-- Table: public.plan_niveles
-- Comment: DEPRECATED: usar levels
CREATE TABLE IF NOT EXISTS public.plan_niveles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  clase_id uuid,
  nombre text NOT NULL,
  numero_nivel integer NOT NULL,
  objetivo_general text,
  orden_index integer DEFAULT 0
);

COMMENT ON TABLE public.plan_niveles IS 'DEPRECATED: usar levels';

-- Table: public.plan_objetivos
-- Comment: DEPRECATED: usar indicators
CREATE TABLE IF NOT EXISTS public.plan_objetivos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  tema_id uuid,
  nombre text NOT NULL,
  orden_index integer DEFAULT 0
);

COMMENT ON TABLE public.plan_objetivos IS 'DEPRECATED: usar indicators';

-- Table: public.plan_temas
-- Comment: DEPRECATED: usar nodes
CREATE TABLE IF NOT EXISTS public.plan_temas (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nivel_id uuid,
  nombre text NOT NULL,
  tipo text DEFAULT 'TECNICA'::text,
  es_critico boolean DEFAULT false,
  orden_index integer DEFAULT 0
);

COMMENT ON TABLE public.plan_temas IS 'DEPRECATED: usar nodes';

-- Table: public.planificaciones
CREATE TABLE IF NOT EXISTS public.planificaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  programa_id uuid,
  nivel_id uuid,
  clase_id uuid NOT NULL,
  maestro_id uuid NOT NULL,
  titulo text NOT NULL,
  descripcion text,
  periodo_nombre text,
  fecha_inicio date NOT NULL,
  fecha_fin date,
  contenidos jsonb DEFAULT '[]'::jsonb,
  tecnicas jsonb DEFAULT '[]'::jsonb,
  obras jsonb DEFAULT '[]'::jsonb,
  escalas_arpegios jsonb DEFAULT '[]'::jsonb,
  evaluaciones jsonb DEFAULT '[]'::jsonb,
  estado text DEFAULT 'borrador'::text,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  instrumento text,
  objetivos_estructurados jsonb NOT NULL DEFAULT '[]'::jsonb,
  frecuencia_semanal numeric,
  semanas_totales integer,
  nivel_texto text
);

-- Table: public.planned_content
-- Comment: Teachers' daily planning of content to cover in each class session
CREATE TABLE IF NOT EXISTS public.planned_content (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  maestro_id uuid NOT NULL,
  clase_id uuid NOT NULL,
  node_id uuid NOT NULL,
  planned_date date DEFAULT CURRENT_DATE,
  covered boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.planned_content IS 'Teachers'' daily planning of content to cover in each class session';

-- Table: public.planning_documents
CREATE TABLE IF NOT EXISTS public.planning_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  maestro_id uuid NOT NULL,
  clase_id uuid,
  title text NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_size bigint,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.plantillas_planificacion
-- Comment: DEPRECATED: reemplazada por mapa_plantillas para el mapa gamificado
CREATE TABLE IF NOT EXISTS public.plantillas_planificacion (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  objetivos text,
  contenido text,
  recursos text,
  evaluacion_metodo text,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  clase_id uuid
);

COMMENT ON TABLE public.plantillas_planificacion IS 'DEPRECATED: reemplazada por mapa_plantillas para el mapa gamificado';

-- Table: public.portal_catalog
CREATE TABLE IF NOT EXISTS public.portal_catalog (
  portal_id text NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  ruta text NOT NULL,
  icono text DEFAULT 'bi-door-open'::text,
  roles_default ARRAY DEFAULT '{}'::text[],
  activo boolean NOT NULL DEFAULT true,
  orden integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Table: public.postulantes
CREATE TABLE IF NOT EXISTS public.postulantes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre_completo text NOT NULL,
  fecha_nacimiento date,
  telefono_alumno text,
  correo text,
  nacionalidad text,
  sector_calle_numero text,
  madre_nombre text,
  madre_tlf_whatsapp text,
  padre_nombre text,
  padre_tlf_whatsapp text,
  representante_parentesco text,
  acepta_pago_600 boolean NOT NULL DEFAULT false,
  autoriza_fotos_redes boolean NOT NULL DEFAULT false,
  religion_limita boolean NOT NULL DEFAULT false,
  disponibilidad_tiempo text,
  tiene_transporte boolean NOT NULL DEFAULT false,
  representantes_apoyan boolean NOT NULL DEFAULT false,
  copia_cedula boolean NOT NULL DEFAULT false,
  sincronizado_en timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  estado text NOT NULL DEFAULT 'pendiente'::text,
  alumno_id uuid,
  fecha_postulacion timestamp with time zone,
  fecha_contacto timestamp with time zone,
  fecha_cita timestamp with time zone,
  notas_seguimiento text,
  instrumento text
);

-- Table: public.profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  email text NOT NULL,
  nombre_completo text,
  rol text NOT NULL DEFAULT 'user'::text,
  avatar_url text,
  activo boolean DEFAULT true,
  estado text NOT NULL DEFAULT 'pendiente'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  solicitud_instrumento text,
  solicitud_resena text
);

-- Table: public.programas
CREATE TABLE IF NOT EXISTS public.programas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  nivel text,
  codigo text,
  duracion_anios numeric
);

-- Table: public.programas_prerrequisitos
-- Comment: Flujo académico: qué programa exige haber cursado otro (selección, audición o recomendación del maestro)
CREATE TABLE IF NOT EXISTS public.programas_prerrequisitos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  programa_id uuid NOT NULL,
  prerequisito_id uuid NOT NULL,
  tipo text NOT NULL DEFAULT 'seleccion'::text,
  nota_minima numeric,
  notas text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.programas_prerrequisitos IS 'Flujo académico: qué programa exige haber cursado otro (selección, audición o recomendación del maestro)';

-- Table: public.progresos
CREATE TABLE IF NOT EXISTS public.progresos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  alumno_id uuid NOT NULL,
  clase_id uuid NOT NULL,
  sesion_clase_id uuid,
  asistencia_id uuid,
  ejercicio_id uuid,
  maestro_id uuid,
  fecha_evaluacion date NOT NULL DEFAULT CURRENT_DATE,
  indicadores jsonb NOT NULL DEFAULT '{}'::jsonb,
  estado_cualitativo text,
  calificacion numeric,
  evaluacion_tipo text DEFAULT 'clase'::text,
  observaciones text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  periodo_id uuid,
  contenido_dsl text,
  objetivo_id uuid
);

-- Table: public.protocolos
-- Comment: -- DEPRECATED: infraestructura base para Hermes en reserva 2026-09 (Owner: DIR/HERMES)
CREATE TABLE IF NOT EXISTS public.protocolos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  tipo text NOT NULL,
  descripcion text,
  tareas jsonb DEFAULT '[]'::jsonb,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.protocolos IS '-- DEPRECATED: infraestructura base para Hermes en reserva 2026-09 (Owner: DIR/HERMES)';

-- Table: public.pulso_score_history
CREATE TABLE IF NOT EXISTS public.pulso_score_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  score numeric NOT NULL,
  nivel text NOT NULL,
  asistencia_pct numeric NOT NULL DEFAULT 100.00,
  tareas_tiempo_pct numeric NOT NULL DEFAULT 100.00,
  cobertura_registro_pct numeric NOT NULL DEFAULT 100.00,
  penalizacion_vencidas_pct numeric NOT NULL DEFAULT 100.00,
  metricas_detalle jsonb NOT NULL DEFAULT '{}'::jsonb,
  calculado_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.push_subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.rachas
-- Comment: -- DEPRECATED: gamificación pedagógica en pausa 2026-09 (Owner: ACM)
CREATE TABLE IF NOT EXISTS public.rachas (
  alumno_id uuid NOT NULL,
  racha_actual integer DEFAULT 0,
  racha_maxima integer DEFAULT 0,
  ultima_fecha_activa date,
  updated_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.rachas IS '-- DEPRECATED: gamificación pedagógica en pausa 2026-09 (Owner: ACM)';

-- Table: public.registros_pendientes
CREATE TABLE IF NOT EXISTS public.registros_pendientes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  maestro_id uuid NOT NULL,
  sesion_clase_id uuid,
  tipo text NOT NULL,
  prioridad text DEFAULT 'media'::text,
  estado text DEFAULT 'pendiente'::text,
  fecha_limite timestamp with time zone,
  mensaje text NOT NULL,
  deep_link text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  resuelto_at timestamp with time zone,
  last_notified_at timestamp with time zone,
  notif_count integer DEFAULT 0,
  notification_state text DEFAULT 'VERDE'::text
);

-- Table: public.repertoire_items
CREATE TABLE IF NOT EXISTS public.repertoire_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  section text NOT NULL,
  title text NOT NULL,
  type text NOT NULL DEFAULT 'obra'::text,
  tempo_indication text DEFAULT ''::text,
  key_signature text DEFAULT ''::text,
  is_active boolean DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: public.representantes
CREATE TABLE IF NOT EXISTS public.representantes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  familia_id uuid NOT NULL,
  user_id uuid,
  nombre text NOT NULL,
  cedula text,
  telefono_whatsapp text,
  email text,
  relacion text,
  es_pagador boolean DEFAULT true,
  autoriza_accesorios_hasta numeric DEFAULT 0,
  alumno_id uuid,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  bloqueo_reinscripcion boolean NOT NULL DEFAULT false,
  motivo_bloqueo text
);

-- Table: public.retenciones_instrumento
-- Comment: Retención temporal del instrumento de un alumno por ausentismo acumulado (nivel 3). Independiente del inventario instrumentos: instrumento_texto sirve cuando no hay fila formal. fecha_reincorporacion reinicia el contador de ausencias del alumno para el período.
CREATE TABLE IF NOT EXISTS public.retenciones_instrumento (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  alumno_id uuid NOT NULL,
  instrumento_id uuid,
  instrumento_texto text,
  motivo text NOT NULL DEFAULT 'ausentismo_acumulado'::text,
  estado text NOT NULL DEFAULT 'retenido'::text,
  retenido_por uuid DEFAULT auth.uid(),
  retenido_en timestamp with time zone NOT NULL DEFAULT now(),
  maestro_notificado_en timestamp with time zone,
  maestro_confirmo_recogida_en timestamp with time zone,
  acta_firmada_en timestamp with time zone,
  fecha_reincorporacion timestamp with time zone,
  levantada_por uuid,
  levantada_en timestamp with time zone,
  notas text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.retenciones_instrumento IS 'Retención temporal del instrumento de un alumno por ausentismo acumulado (nivel 3). Independiente del inventario instrumentos: instrumento_texto sirve cuando no hay fila formal. fecha_reincorporacion reinicia el contador de ausencias del alumno para el período.';

-- Table: public.route_versions
CREATE TABLE IF NOT EXISTS public.route_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  route_id uuid NOT NULL,
  version text NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'draft'::route_status,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  published_at timestamp with time zone
);

-- Table: public.routes
CREATE TABLE IF NOT EXISTS public.routes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  instrument text NOT NULL,
  description text,
  status USER-DEFINED NOT NULL DEFAULT 'draft'::route_status,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.ruta_contenido_objetivos
CREATE TABLE IF NOT EXISTS public.ruta_contenido_objetivos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ruta_id uuid NOT NULL,
  objetivo_id uuid,
  descripcion text NOT NULL,
  semana_inicio integer NOT NULL,
  semana_fin integer NOT NULL,
  orden integer NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: public.rutas_contenido
CREATE TABLE IF NOT EXISTS public.rutas_contenido (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  instrumento text NOT NULL,
  nivel text NOT NULL,
  nombre text NOT NULL,
  tipo text NOT NULL,
  estado text NOT NULL,
  descripcion text,
  ruta_base_id uuid,
  duracion_semanas integer NOT NULL DEFAULT 40,
  creada_por uuid,
  aprobada_por uuid,
  fecha_aprobacion timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.salones
CREATE TABLE IF NOT EXISTS public.salones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  ubicacion text,
  descripcion text,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  capacidad integer DEFAULT 20,
  codigo_salon text,
  piso integer,
  condicion_fisica text DEFAULT 'buena'::text,
  equipamiento jsonb DEFAULT '[]'::jsonb,
  responsable_id uuid,
  is_active boolean
);

-- Table: public.schedule_run_feedback
-- Comment: -- DEPRECATED: telemetría de horarios pausada 2026-09 (Owner: ACM)
CREATE TABLE IF NOT EXISTS public.schedule_run_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL,
  usuario_id uuid NOT NULL,
  comentario text NOT NULL,
  tipo text NOT NULL DEFAULT 'observacion'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.schedule_run_feedback IS '-- DEPRECATED: telemetría de horarios pausada 2026-09 (Owner: ACM)';

-- Table: public.schedule_runs
-- Comment: -- DEPRECATED: motor algorítmico de horarios pausado 2026-09 (Owner: ACM)
CREATE TABLE IF NOT EXISTS public.schedule_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  periodo text,
  config jsonb,
  resultado jsonb,
  metricas jsonb,
  estado text NOT NULL DEFAULT 'borrador'::text,
  applied_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.schedule_runs IS '-- DEPRECATED: motor algorítmico de horarios pausado 2026-09 (Owner: ACM)';

-- Table: public.score_compromiso
CREATE TABLE IF NOT EXISTS public.score_compromiso (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  representante_id uuid NOT NULL,
  familia_id uuid NOT NULL,
  score numeric NOT NULL,
  nivel character(1) NOT NULL,
  puntualidad_pct numeric,
  consistencia_meses integer,
  voluntad_pago_pct numeric,
  comportamiento_mora_pct numeric,
  generosidad_pct numeric,
  calculado_en timestamp with time zone DEFAULT now(),
  ciclo_mes integer NOT NULL,
  ciclo_anio integer NOT NULL
);

-- Table: public.sections
CREATE TABLE IF NOT EXISTS public.sections (
  id text NOT NULL,
  family text NOT NULL,
  default_day text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: public.seguimiento_ausencias_reinicio
CREATE TABLE IF NOT EXISTS public.seguimiento_ausencias_reinicio (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  alumno_id uuid NOT NULL,
  fecha_corte timestamp with time zone NOT NULL DEFAULT now(),
  motivo text,
  creado_por uuid DEFAULT auth.uid(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.seguimiento_reglas
CREATE TABLE IF NOT EXISTS public.seguimiento_reglas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  tipo text NOT NULL,
  descripcion text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  activo boolean DEFAULT true,
  prioridad integer DEFAULT 1,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.service_account_observations
CREATE TABLE IF NOT EXISTS public.service_account_observations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  service_account_id uuid NOT NULL,
  observed_at timestamp with time zone NOT NULL DEFAULT now(),
  balance_centavos bigint,
  amount_due_centavos bigint,
  due_date date,
  days_remaining integer,
  last_query_at timestamp with time zone,
  last_success_at timestamp with time zone,
  last_status text NOT NULL DEFAULT 'never'::text,
  last_error_code text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.service_accounts
CREATE TABLE IF NOT EXISTS public.service_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  provider_key text NOT NULL,
  provider_name text NOT NULL,
  account_name text NOT NULL,
  service_type text NOT NULL,
  essential boolean NOT NULL DEFAULT false,
  refresh_enabled boolean NOT NULL DEFAULT false,
  connector_status text NOT NULL DEFAULT 'unconfigured'::text,
  currency_code text NOT NULL DEFAULT 'DOP'::text,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid()
);

-- Table: public.sesiones_clase
CREATE TABLE IF NOT EXISTS public.sesiones_clase (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clase_id uuid,
  horario_id uuid,
  maestro_id uuid NOT NULL,
  salon_id uuid,
  fecha date NOT NULL,
  hora_inicio time without time zone,
  hora_fin time without time zone,
  tema_principal text,
  contenidos_trabajados jsonb DEFAULT '[]'::jsonb,
  observaciones_generales text,
  estado text NOT NULL DEFAULT 'programada'::text,
  cerrada_en timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  borrador boolean DEFAULT false,
  contenido text,
  contenido_dsl text,
  asistencia jsonb DEFAULT '[]'::jsonb,
  es_codocencia boolean DEFAULT false,
  actividad text,
  maestro_auxiliar_id uuid,
  motivo text,
  emergente_id uuid,
  node_id uuid,
  node_origen text,
  node_codigo text
);

-- Table: public.signage_media
-- Comment: Playlist declarativa de la señalética (intención). El caché físico de YouTube y su estado de descarga viven en la Raspberry, no aquí.
CREATE TABLE IF NOT EXISTS public.signage_media (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pantalla_id uuid,
  tipo text NOT NULL,
  titulo text,
  credito text,
  storage_path text,
  youtube_url text,
  youtube_video_id text,
  duracion_seg integer,
  orden integer NOT NULL DEFAULT 0,
  activo boolean NOT NULL DEFAULT true,
  vigente_desde date,
  vigente_hasta date,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  contenido jsonb
);

COMMENT ON TABLE public.signage_media IS 'Playlist declarativa de la señalética (intención). El caché físico de YouTube y su estado de descarga viven en la Raspberry, no aquí.';

-- Table: public.signage_pantallas
-- Comment: Registro de pantallas de señalética. layout = jsonb con proporciones y ajustes de zona. Escrita por el portal Admin (es_admin), leída por la SPA de la Raspberry.
CREATE TABLE IF NOT EXISTS public.signage_pantallas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  nombre text NOT NULL,
  ubicacion text,
  orientacion text NOT NULL DEFAULT 'horizontal'::text,
  ancho_px integer NOT NULL DEFAULT 1280,
  alto_px integer NOT NULL DEFAULT 720,
  layout jsonb NOT NULL DEFAULT '{}'::jsonb,
  modo_nocturno jsonb NOT NULL DEFAULT '{"desde": "21:00", "hasta": "06:00", "activo": true}'::jsonb,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  institucion text,
  siglas text,
  menu_portales ARRAY NOT NULL DEFAULT '{}'::text[],
  logo_path text
);

COMMENT ON TABLE public.signage_pantallas IS 'Registro de pantallas de señalética. layout = jsonb con proporciones y ajustes de zona. Escrita por el portal Admin (es_admin), leída por la SPA de la Raspberry.';

-- Table: public.sim_actores
-- Comment: Datos 100% FICTICIOS para el sandbox del simulador (postulantes, alumnos, maestros, representantes). Nunca referencia entidades reales de producción.
CREATE TABLE IF NOT EXISTS public.sim_actores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL,
  tipo USER-DEFINED NOT NULL,
  nombre_ficticio text NOT NULL,
  instrumento text,
  estado_pago USER-DEFINED NOT NULL DEFAULT 'no_aplica'::sim_estado_pago,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.sim_actores IS 'Datos 100% FICTICIOS para el sandbox del simulador (postulantes, alumnos, maestros, representantes). Nunca referencia entidades reales de producción.';

-- Table: public.sim_calendario
-- Comment: Espejo aislado de calendario_institucional para el sandbox del simulador. Nunca se referencia desde triggers de producción.
CREATE TABLE IF NOT EXISTS public.sim_calendario (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL,
  titulo text NOT NULL,
  descripcion text,
  categoria USER-DEFINED NOT NULL DEFAULT 'otro'::event_categoria,
  fecha_inicio timestamp with time zone NOT NULL,
  fecha_fin timestamp with time zone NOT NULL,
  ubicacion text,
  departamento_responsable USER-DEFINED NOT NULL DEFAULT 'DIR'::soi_departamento,
  metadata jsonb DEFAULT '{}'::jsonb,
  estado text NOT NULL DEFAULT 'programado'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.sim_calendario IS 'Espejo aislado de calendario_institucional para el sandbox del simulador. Nunca se referencia desde triggers de producción.';

-- Table: public.sim_config
-- Comment: Whitelist server-side inviolable de destinos de envío (spec: simulador-salida-segura / Whitelist server-side inviolable). Un registro por canal.
CREATE TABLE IF NOT EXISTS public.sim_config (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  canal USER-DEFINED NOT NULL,
  destino text NOT NULL,
  proveedor_llm text NOT NULL DEFAULT 'groq'::text,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.sim_config IS 'Whitelist server-side inviolable de destinos de envío (spec: simulador-salida-segura / Whitelist server-side inviolable). Un registro por canal.';

-- Table: public.sim_log
-- Comment: Auditoría append-only de cada acción de agente. Base para la animación en tiempo real vía Supabase Realtime (ver RLS: SELECT abierto a authenticated).
CREATE TABLE IF NOT EXISTS public.sim_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL,
  fecha_simulada timestamp with time zone NOT NULL,
  departamento USER-DEFINED NOT NULL,
  agente text NOT NULL,
  accion text NOT NULL,
  evento_id uuid,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.sim_log IS 'Auditoría append-only de cada acción de agente. Base para la animación en tiempo real vía Supabase Realtime (ver RLS: SELECT abierto a authenticated).';

-- Table: public.sim_outbox
CREATE TABLE IF NOT EXISTS public.sim_outbox (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL,
  canal USER-DEFINED NOT NULL,
  destinatario_original text NOT NULL,
  destinatario_redirigido text NOT NULL,
  asunto text,
  mensaje text NOT NULL,
  estado USER-DEFINED NOT NULL DEFAULT 'pendiente'::sim_outbox_estado,
  error_msg text,
  created_at timestamp with time zone DEFAULT now(),
  procesado_at timestamp with time zone
);

-- Table: public.sim_runs
CREATE TABLE IF NOT EXISTS public.sim_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL DEFAULT 'Simulación sin nombre'::text,
  estado USER-DEFINED NOT NULL DEFAULT 'creado'::sim_run_estado,
  velocidad integer NOT NULL DEFAULT 10,
  fecha_inicio_virtual timestamp with time zone NOT NULL,
  fecha_fin_virtual timestamp with time zone,
  fecha_actual_virtual timestamp with time zone,
  creado_por uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.sim_tareas
-- Comment: Espejo aislado de tareas_institucionales para el sandbox del simulador.
CREATE TABLE IF NOT EXISTS public.sim_tareas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL,
  event_id uuid,
  titulo text NOT NULL,
  descripcion text,
  departamento USER-DEFINED NOT NULL DEFAULT 'DIR'::soi_departamento,
  asignado_a text,
  estado USER-DEFINED NOT NULL DEFAULT 'pendiente'::tarea_institucional_estado,
  prioridad USER-DEFINED NOT NULL DEFAULT 'media'::tarea_institucional_prioridad,
  fecha_vencimiento date,
  checklist jsonb DEFAULT '[]'::jsonb,
  feedback text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.sim_tareas IS 'Espejo aislado de tareas_institucionales para el sandbox del simulador.';

-- Table: public.soi_analisis_semanal
CREATE TABLE IF NOT EXISTS public.soi_analisis_semanal (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  periodo_inicio timestamp with time zone NOT NULL,
  periodo_fin timestamp with time zone NOT NULL,
  total_eventos_analizados integer NOT NULL DEFAULT 0,
  resumen_ejecutivo text NOT NULL,
  patrones jsonb NOT NULL DEFAULT '[]'::jsonb,
  tendencias jsonb NOT NULL DEFAULT '[]'::jsonb,
  recomendaciones jsonb NOT NULL DEFAULT '[]'::jsonb,
  score_promedio numeric,
  modelo_usado text DEFAULT 'llama-3.3-70b-versatile'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.soi_event_bus
-- Comment: Bus de eventos interno. Solo service_role: sin politica para authenticated, el cliente no accede.
CREATE TABLE IF NOT EXISTS public.soi_event_bus (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tipo text NOT NULL,
  origen text NOT NULL,
  payload jsonb NOT NULL,
  procesado boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.soi_event_bus IS 'Bus de eventos interno. Solo service_role: sin politica para authenticated, el cliente no accede.';

-- Table: public.soi_eventos
CREATE TABLE IF NOT EXISTS public.soi_eventos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tipo text NOT NULL,
  entidad_tipo text NOT NULL,
  entidad_id uuid,
  actor_id uuid,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  correlation_id uuid,
  procesado boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.soi_process_contracts
-- Comment: Contrato digital ejecutable de un proceso SOI documentado. No reemplaza la ficha canonica; la vuelve operable por Hermes.
CREATE TABLE IF NOT EXISTS public.soi_process_contracts (
  process_code text NOT NULL,
  process_name text NOT NULL,
  department_owner text NOT NULL,
  canonical_doc_path text NOT NULL,
  doc_id text,
  trigger_type text NOT NULL DEFAULT 'manual'::text,
  required_evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  closure_criteria jsonb NOT NULL DEFAULT '[]'::jsonb,
  responsible_departments ARRAY NOT NULL DEFAULT ARRAY[]::text[],
  task_templates jsonb NOT NULL DEFAULT '[]'::jsonb,
  automation_status text NOT NULL DEFAULT 'manual'::text,
  recurrence_count integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.soi_process_contracts IS 'Contrato digital ejecutable de un proceso SOI documentado. No reemplaza la ficha canonica; la vuelve operable por Hermes.';

-- Table: public.soi_rule_effectiveness
CREATE TABLE IF NOT EXISTS public.soi_rule_effectiveness (
  rule_type text NOT NULL,
  nombre text NOT NULL,
  total_activaciones integer NOT NULL DEFAULT 0,
  casos_resueltos integer NOT NULL DEFAULT 0,
  tasa_exito numeric NOT NULL DEFAULT 100.00,
  tiempo_promedio_horas numeric DEFAULT 0.00,
  ultima_activacion timestamp with time zone,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.solicitudes_ausencia
CREATE TABLE IF NOT EXISTS public.solicitudes_ausencia (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  maestro_id uuid NOT NULL,
  fecha_ausencia date NOT NULL,
  motivo text,
  contenido_reemplazo text,
  suplente_id uuid,
  dinamica_trabajo text,
  estado text DEFAULT 'pendiente'::text,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: public.solicitudes_necesidades
CREATE TABLE IF NOT EXISTS public.solicitudes_necesidades (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  maestro_id uuid NOT NULL,
  maestro_nombre text,
  tipo_necesidad text NOT NULL,
  categoria text,
  titulo text NOT NULL,
  descripcion text NOT NULL,
  prioridad text NOT NULL DEFAULT 'media'::text,
  cantidad integer,
  area text,
  observaciones text,
  estado text NOT NULL DEFAULT 'pendiente'::text,
  respuesta_admin text,
  fecha_solicitud date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  correlation_id uuid,
  link_tienda text,
  costo_estimado numeric,
  presupuesto numeric,
  departamento_actual text,
  pre_aprobada_por uuid,
  presupuestado_por uuid
);

-- Table: public.solicitudes_permisos
CREATE TABLE IF NOT EXISTS public.solicitudes_permisos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  maestro_id uuid NOT NULL,
  tipos jsonb NOT NULL,
  estado text DEFAULT 'pendiente'::text,
  creado_en timestamp with time zone DEFAULT now(),
  aprobado_en timestamp with time zone,
  aprobado_por uuid,
  solicita_alumnos boolean DEFAULT false,
  solicita_clases boolean DEFAULT false,
  motivo_rechazo text
);

-- Table: public.student_case_actions
CREATE TABLE IF NOT EXISTS public.student_case_actions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL,
  alumno_id uuid,
  tipo text NOT NULL,
  titulo text NOT NULL,
  descripcion text,
  resultado text,
  fecha_accion timestamp with time zone DEFAULT now(),
  proxima_accion text,
  proxima_accion_fecha date,
  documento_id uuid,
  registrado_por uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: public.student_case_alerts
CREATE TABLE IF NOT EXISTS public.student_case_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  alumno_id uuid,
  alumno_nombre text,
  case_id uuid,
  tipo text NOT NULL,
  nivel_riesgo text NOT NULL,
  titulo text NOT NULL,
  descripcion text,
  evidencia jsonb DEFAULT '{}'::jsonb,
  estado text NOT NULL DEFAULT 'pendiente'::text,
  detectada_en timestamp with time zone DEFAULT now(),
  revisada_por uuid,
  revisada_en timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: public.student_case_events
CREATE TABLE IF NOT EXISTS public.student_case_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL,
  tipo text NOT NULL,
  titulo text NOT NULL,
  descripcion text,
  metadata jsonb DEFAULT '{}'::jsonb,
  actor_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: public.student_cases
CREATE TABLE IF NOT EXISTS public.student_cases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  alumno_id uuid,
  alumno_nombre text,
  tipo text NOT NULL,
  titulo text NOT NULL,
  descripcion text,
  nivel_riesgo text NOT NULL DEFAULT 'bajo'::text,
  estado text NOT NULL DEFAULT 'abierto'::text,
  origen text NOT NULL DEFAULT 'manual'::text,
  responsable_id uuid,
  fecha_apertura date DEFAULT CURRENT_DATE,
  fecha_cierre date,
  resumen_actual text,
  proxima_accion text,
  proxima_accion_fecha date,
  ultimo_contacto_en timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.student_indicator_progress
CREATE TABLE IF NOT EXISTS public.student_indicator_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  indicator_id uuid NOT NULL,
  session_id uuid,
  status text NOT NULL DEFAULT 'not_started'::text,
  score numeric,
  observation text,
  evidence_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.system_config
-- Comment: Tabla de configuración del sistema - API keys, settings globales
CREATE TABLE IF NOT EXISTS public.system_config (
  key character varying(100) NOT NULL,
  value text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.system_config IS 'Tabla de configuración del sistema - API keys, settings globales';

-- Table: public.tarea_comentarios
CREATE TABLE IF NOT EXISTS public.tarea_comentarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tarea_id uuid NOT NULL,
  autor_id uuid,
  autor_nombre text,
  cuerpo text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.tarea_historial
CREATE TABLE IF NOT EXISTS public.tarea_historial (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tarea_id uuid NOT NULL,
  campo text NOT NULL,
  valor_anterior text,
  valor_nuevo text,
  actor_id uuid,
  actor_nombre text,
  actor_rol text,
  actor_departamento text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.tarea_logs
CREATE TABLE IF NOT EXISTS public.tarea_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tarea_id uuid NOT NULL,
  evento text NOT NULL,
  cambios jsonb,
  changed_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: public.tareas_caja
CREATE TABLE IF NOT EXISTS public.tareas_caja (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descripcion text,
  tipo USER-DEFINED NOT NULL DEFAULT 'otro'::tarea_tipo,
  asignado_a uuid,
  familia_id uuid,
  alumno_id uuid,
  referencia_id uuid,
  estado USER-DEFINED NOT NULL DEFAULT 'pendiente'::tarea_estado,
  prioridad USER-DEFINED NOT NULL DEFAULT 'media'::tarea_prioridad,
  fecha_vencimiento date,
  recurrente boolean DEFAULT false,
  patron_recurrencia jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.tareas_calendario
CREATE TABLE IF NOT EXISTS public.tareas_calendario (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  evento_id uuid NOT NULL,
  departamento_id uuid NOT NULL,
  titulo text NOT NULL,
  descripcion text,
  fecha_vencimiento date NOT NULL,
  estado text DEFAULT 'pendiente'::text,
  asignado_a uuid,
  prioridad text DEFAULT 'media'::text,
  generada_por text DEFAULT 'hermes'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.tareas_institucionales
CREATE TABLE IF NOT EXISTS public.tareas_institucionales (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid,
  titulo text NOT NULL,
  descripcion text,
  departamento USER-DEFINED NOT NULL DEFAULT 'DIR'::soi_departamento,
  asignado_a text,
  estado USER-DEFINED NOT NULL DEFAULT 'pendiente'::tarea_institucional_estado,
  prioridad USER-DEFINED NOT NULL DEFAULT 'media'::tarea_institucional_prioridad,
  fecha_vencimiento date,
  checklist jsonb DEFAULT '[]'::jsonb,
  feedback text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  minuta_id uuid,
  documentos_adjuntos jsonb DEFAULT '[]'::jsonb,
  entidad_tipo text,
  entidad_id uuid,
  entidad_label text,
  correlation_id uuid NOT NULL DEFAULT gen_random_uuid(),
  updated_by uuid,
  updated_by_nombre text,
  process_code text,
  dependencia_tarea_id uuid,
  depende_de_tarea_id uuid,
  t_minus_dias integer,
  source_event_id uuid
);

-- Table: public.teacher_class_sessions
CREATE TABLE IF NOT EXISTS public.teacher_class_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  active_route_id uuid,
  teacher_id uuid,
  group_id uuid,
  class_date date NOT NULL DEFAULT CURRENT_DATE,
  week_number integer,
  planned_week_id uuid,
  status text NOT NULL DEFAULT 'draft'::text,
  general_observation text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  closed_at timestamp with time zone
);

-- Table: public.teacher_session_indicators
CREATE TABLE IF NOT EXISTS public.teacher_session_indicators (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  indicator_id uuid,
  planned_topic text,
  planned_objective text,
  worked_status text NOT NULL DEFAULT 'not_started'::text,
  teacher_notes text,
  next_action text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.telegram_allowed_users
CREATE TABLE IF NOT EXISTS public.telegram_allowed_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  telegram_user_id bigint NOT NULL,
  nombre text NOT NULL,
  rol text NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid
);

-- Table: public.telegram_messages_raw
CREATE TABLE IF NOT EXISTS public.telegram_messages_raw (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  telegram_message_id bigint NOT NULL,
  telegram_chat_id bigint NOT NULL,
  telegram_user_id bigint NOT NULL,
  message_type text NOT NULL DEFAULT 'text'::text,
  raw_payload jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.unidades
CREATE TABLE IF NOT EXISTS public.unidades (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  modulo_id uuid NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  orden integer NOT NULL,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.user_portal_access
CREATE TABLE IF NOT EXISTS public.user_portal_access (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  portal_id text NOT NULL,
  granted_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.usuario_departamentos
CREATE TABLE IF NOT EXISTS public.usuario_departamentos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  departamento_id uuid NOT NULL,
  rol text DEFAULT 'miembro'::text,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: public.wallet_movimientos
CREATE TABLE IF NOT EXISTS public.wallet_movimientos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  familia_id uuid NOT NULL,
  tipo USER-DEFINED NOT NULL,
  monto_centavos bigint NOT NULL,
  origen USER-DEFINED NOT NULL,
  referencia_id uuid,
  descripcion text,
  saldo_resultante_centavos bigint NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: public.whatsapp_consentimientos
CREATE TABLE IF NOT EXISTS public.whatsapp_consentimientos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  jid text NOT NULL,
  nombre_representante text,
  representante_cedula text,
  niño_nombre text,
  niño_edad integer,
  campania_id uuid,
  acepta_campania boolean NOT NULL DEFAULT true,
  acepta_estadisticas boolean NOT NULL DEFAULT false,
  firmas_digitales text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.whatsapp_optout
CREATE TABLE IF NOT EXISTS public.whatsapp_optout (
  jid text NOT NULL,
  motivo text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: public.whatsapp_webhook_log
CREATE TABLE IF NOT EXISTS public.whatsapp_webhook_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  message_id text NOT NULL,
  jid_remitente text NOT NULL,
  postulante_id uuid,
  mensaje_texto text,
  push_name text,
  intencion_detectada text,
  confianza numeric,
  argumento text,
  respuesta_enviada text,
  estado_conversacion_nuevo text,
  accion_pipeline jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- --------------------------------------------------------------------------
-- 5. CONSTRAINTS (PK, FK, UNIQUE, CHECK)
-- --------------------------------------------------------------------------
ALTER TABLE public.academic_plans DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.academic_plans ADD CONSTRAINT undefined CHECK ((status = ANY (ARRAY['draft'::text, 'in_process'::text, 'completed'::text, 'cancelled'::text])));

ALTER TABLE public.academic_plans DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.academic_plans ADD CONSTRAINT undefined FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE SET NULL;

ALTER TABLE public.academic_plans DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.academic_plans ADD CONSTRAINT undefined FOREIGN KEY (student_id) REFERENCES alumnos(id) ON DELETE CASCADE;

ALTER TABLE public.academic_plans DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.academic_plans ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.accesorios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.accesorios ADD CONSTRAINT undefined CHECK ((stock_actual >= 0));

ALTER TABLE public.accesorios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.accesorios ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.acm_active_routes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_active_routes ADD CONSTRAINT undefined CHECK ((status = ANY (ARRAY['active'::text, 'paused'::text, 'completed'::text, 'archived'::text])));

ALTER TABLE public.acm_active_routes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_active_routes ADD CONSTRAINT undefined FOREIGN KEY (weekly_plan_id) REFERENCES acm_weekly_plans(id) ON DELETE CASCADE;

ALTER TABLE public.acm_active_routes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_active_routes ADD CONSTRAINT undefined FOREIGN KEY (program_id) REFERENCES programas(id) ON DELETE SET NULL;

ALTER TABLE public.acm_active_routes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_active_routes ADD CONSTRAINT undefined FOREIGN KEY (group_id) REFERENCES clases(id) ON DELETE SET NULL;

ALTER TABLE public.acm_active_routes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_active_routes ADD CONSTRAINT undefined FOREIGN KEY (teacher_id) REFERENCES maestros(id) ON DELETE SET NULL;

ALTER TABLE public.acm_active_routes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_active_routes ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.acm_curriculum_sources DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_curriculum_sources ADD CONSTRAINT undefined CHECK ((status = ANY (ARRAY['draft'::text, 'in_review'::text, 'approved'::text, 'active'::text, 'archived'::text, 'replaced'::text])));

ALTER TABLE public.acm_curriculum_sources DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_curriculum_sources ADD CONSTRAINT undefined CHECK ((source_type = ANY (ARRAY['documento_rector'::text, 'documento_complementario'::text, 'referencia_externa'::text, 'ajuste_acm'::text])));

ALTER TABLE public.acm_curriculum_sources DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_curriculum_sources ADD CONSTRAINT undefined FOREIGN KEY (related_version_id) REFERENCES acm_curriculum_versions(id) ON DELETE SET NULL;

ALTER TABLE public.acm_curriculum_sources DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_curriculum_sources ADD CONSTRAINT undefined FOREIGN KEY (uploaded_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE public.acm_curriculum_sources DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_curriculum_sources ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.acm_curriculum_versions DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_curriculum_versions ADD CONSTRAINT undefined CHECK ((status = ANY (ARRAY['draft'::text, 'in_review'::text, 'approved'::text, 'active'::text, 'archived'::text, 'replaced'::text])));

ALTER TABLE public.acm_curriculum_versions DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_curriculum_versions ADD CONSTRAINT undefined FOREIGN KEY (source_id) REFERENCES acm_curriculum_sources(id) ON DELETE SET NULL;

ALTER TABLE public.acm_curriculum_versions DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_curriculum_versions ADD CONSTRAINT undefined FOREIGN KEY (program_id) REFERENCES programas(id) ON DELETE SET NULL;

ALTER TABLE public.acm_curriculum_versions DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_curriculum_versions ADD CONSTRAINT undefined FOREIGN KEY (approved_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE public.acm_curriculum_versions DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_curriculum_versions ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.acm_evidence_files DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_evidence_files ADD CONSTRAINT undefined FOREIGN KEY (group_id) REFERENCES clases(id) ON DELETE SET NULL;

ALTER TABLE public.acm_evidence_files DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_evidence_files ADD CONSTRAINT undefined FOREIGN KEY (uploaded_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE public.acm_evidence_files DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_evidence_files ADD CONSTRAINT undefined FOREIGN KEY (indicator_id) REFERENCES indicators(id) ON DELETE SET NULL;

ALTER TABLE public.acm_evidence_files DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_evidence_files ADD CONSTRAINT undefined FOREIGN KEY (student_id) REFERENCES alumnos(id) ON DELETE CASCADE;

ALTER TABLE public.acm_evidence_files DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_evidence_files ADD CONSTRAINT undefined FOREIGN KEY (session_id) REFERENCES teacher_class_sessions(id) ON DELETE SET NULL;

ALTER TABLE public.acm_evidence_files DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_evidence_files ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.acm_teacher_week_adjustments DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_teacher_week_adjustments ADD CONSTRAINT undefined FOREIGN KEY (weekly_plan_id) REFERENCES acm_weekly_plans(id) ON DELETE CASCADE;

ALTER TABLE public.acm_teacher_week_adjustments DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_teacher_week_adjustments ADD CONSTRAINT undefined FOREIGN KEY (teacher_id) REFERENCES maestros(id) ON DELETE CASCADE;

ALTER TABLE public.acm_teacher_week_adjustments DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_teacher_week_adjustments ADD CONSTRAINT undefined FOREIGN KEY (group_id) REFERENCES clases(id) ON DELETE CASCADE;

ALTER TABLE public.acm_teacher_week_adjustments DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_teacher_week_adjustments ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.acm_teacher_week_adjustments DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_teacher_week_adjustments ADD CONSTRAINT undefined UNIQUE (group_id, teacher_id, weekly_plan_id, week_number);

ALTER TABLE public.acm_weekly_plan_items DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_weekly_plan_items ADD CONSTRAINT undefined FOREIGN KEY (weekly_plan_id) REFERENCES acm_weekly_plans(id) ON DELETE CASCADE;

ALTER TABLE public.acm_weekly_plan_items DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_weekly_plan_items ADD CONSTRAINT undefined FOREIGN KEY (indicator_id) REFERENCES indicators(id) ON DELETE SET NULL;

ALTER TABLE public.acm_weekly_plan_items DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_weekly_plan_items ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.acm_weekly_plans DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_weekly_plans ADD CONSTRAINT undefined CHECK ((status = ANY (ARRAY['draft'::text, 'approved'::text, 'active'::text, 'archived'::text])));

ALTER TABLE public.acm_weekly_plans DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_weekly_plans ADD CONSTRAINT undefined FOREIGN KEY (curriculum_version_id) REFERENCES acm_curriculum_versions(id) ON DELETE CASCADE;

ALTER TABLE public.acm_weekly_plans DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_weekly_plans ADD CONSTRAINT undefined FOREIGN KEY (program_id) REFERENCES programas(id) ON DELETE SET NULL;

ALTER TABLE public.acm_weekly_plans DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.acm_weekly_plans ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.alertas_log DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alertas_log ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.alumno_escolaridad DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumno_escolaridad ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE;

ALTER TABLE public.alumno_escolaridad DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumno_escolaridad ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.alumno_plan_entradas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumno_plan_entradas ADD CONSTRAINT undefined CHECK ((char_length(descripcion) <= 2000));

ALTER TABLE public.alumno_plan_entradas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumno_plan_entradas ADD CONSTRAINT undefined CHECK ((nivel_referencia = ANY (ARRAY['inicial'::text, 'basico'::text, 'intermedio'::text, 'avanzado'::text])));

ALTER TABLE public.alumno_plan_entradas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumno_plan_entradas ADD CONSTRAINT undefined CHECK ((tipo = ANY (ARRAY['diagnostico'::text, 'logro'::text, 'en_progreso'::text, 'dificultad'::text, 'objetivo'::text])));

ALTER TABLE public.alumno_plan_entradas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumno_plan_entradas ADD CONSTRAINT undefined CHECK (((char_length(titulo) >= 2) AND (char_length(titulo) <= 200)));

ALTER TABLE public.alumno_plan_entradas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumno_plan_entradas ADD CONSTRAINT undefined FOREIGN KEY (objetivo_id) REFERENCES curriculo_objetivos(id) ON DELETE SET NULL;

ALTER TABLE public.alumno_plan_entradas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumno_plan_entradas ADD CONSTRAINT undefined FOREIGN KEY (sesion_id) REFERENCES sesiones_clase(id) ON DELETE SET NULL;

ALTER TABLE public.alumno_plan_entradas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumno_plan_entradas ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE;

ALTER TABLE public.alumno_plan_entradas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumno_plan_entradas ADD CONSTRAINT undefined FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE;

ALTER TABLE public.alumno_plan_entradas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumno_plan_entradas ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.alumno_suspensiones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumno_suspensiones ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['activa'::text, 'levantada'::text])));

ALTER TABLE public.alumno_suspensiones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumno_suspensiones ADD CONSTRAINT undefined FOREIGN KEY (levantada_por) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.alumno_suspensiones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumno_suspensiones ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE;

ALTER TABLE public.alumno_suspensiones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumno_suspensiones ADD CONSTRAINT undefined FOREIGN KEY (creado_por) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.alumno_suspensiones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumno_suspensiones ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.alumnos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumnos ADD CONSTRAINT undefined CHECK ((problemas_conducta = ANY (ARRAY['no'::text, 'pocas_veces'::text, 'si'::text, 'violento'::text])));

ALTER TABLE public.alumnos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumnos ADD CONSTRAINT undefined CHECK ((padres_en_vida = ANY (ARRAY['ambos'::text, 'solo_madre'::text, 'solo_padre'::text, 'ninguno'::text])));

ALTER TABLE public.alumnos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumnos ADD CONSTRAINT undefined CHECK (((nivel_actual >= 1) AND (nivel_actual <= 10)));

ALTER TABLE public.alumnos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumnos ADD CONSTRAINT undefined CHECK ((estado_academico = ANY (ARRAY['activo'::text, 'retirado'::text, 'retirado_con_deuda'::text])));

ALTER TABLE public.alumnos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumnos ADD CONSTRAINT undefined CHECK ((nivel_lectura_musical = ANY (ARRAY['basico'::text, 'intermedio'::text, 'avanzado'::text])));

ALTER TABLE public.alumnos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumnos ADD CONSTRAINT undefined CHECK ((interes_musical = ANY (ARRAY['cantar'::text, 'instrumento'::text, 'ambas'::text])));

ALTER TABLE public.alumnos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumnos ADD CONSTRAINT undefined FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT;

ALTER TABLE public.alumnos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumnos ADD CONSTRAINT undefined FOREIGN KEY (baja_procesada_por) REFERENCES auth.users(id);

ALTER TABLE public.alumnos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumnos ADD CONSTRAINT undefined FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE public.alumnos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumnos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.alumnos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumnos ADD CONSTRAINT undefined UNIQUE (user_id);

ALTER TABLE public.alumnos_clases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumnos_clases ADD CONSTRAINT undefined CHECK (((dia IS NULL) OR (dia = ANY (ARRAY['lunes'::text, 'martes'::text, 'miércoles'::text, 'jueves'::text, 'viernes'::text, 'sábado'::text, 'domingo'::text]))));

ALTER TABLE public.alumnos_clases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumnos_clases ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE;

ALTER TABLE public.alumnos_clases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumnos_clases ADD CONSTRAINT undefined FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE;

ALTER TABLE public.alumnos_clases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumnos_clases ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.alumnos_clases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumnos_clases ADD CONSTRAINT undefined UNIQUE (alumno_id, clase_id);

ALTER TABLE public.alumnos_logros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumnos_logros ADD CONSTRAINT undefined FOREIGN KEY (logro_id) REFERENCES logros(id) ON DELETE CASCADE;

ALTER TABLE public.alumnos_logros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumnos_logros ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE;

ALTER TABLE public.alumnos_logros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumnos_logros ADD CONSTRAINT undefined PRIMARY KEY (alumno_id, logro_id);

ALTER TABLE public.alumnos_programas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumnos_programas ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['cursando'::text, 'aprobado'::text, 'repite'::text, 'proyectado'::text, 'retirado'::text])));

ALTER TABLE public.alumnos_programas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumnos_programas ADD CONSTRAINT undefined CHECK (((calificacion >= (0)::numeric) AND (calificacion <= (100)::numeric)));

ALTER TABLE public.alumnos_programas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumnos_programas ADD CONSTRAINT undefined FOREIGN KEY (periodo_id) REFERENCES periodos(id);

ALTER TABLE public.alumnos_programas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumnos_programas ADD CONSTRAINT undefined FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE CASCADE;

ALTER TABLE public.alumnos_programas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumnos_programas ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE;

ALTER TABLE public.alumnos_programas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumnos_programas ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.alumnos_reinscripciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumnos_reinscripciones ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id);

ALTER TABLE public.alumnos_reinscripciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumnos_reinscripciones ADD CONSTRAINT undefined FOREIGN KEY (procesada_por) REFERENCES auth.users(id);

ALTER TABLE public.alumnos_reinscripciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.alumnos_reinscripciones ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.aplicaciones_pago DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.aplicaciones_pago ADD CONSTRAINT undefined CHECK ((monto_aplicado_centavos > 0));

ALTER TABLE public.aplicaciones_pago DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.aplicaciones_pago ADD CONSTRAINT undefined FOREIGN KEY (pago_id) REFERENCES pagos(id);

ALTER TABLE public.aplicaciones_pago DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.aplicaciones_pago ADD CONSTRAINT undefined FOREIGN KEY (cuota_id) REFERENCES cuotas(id);

ALTER TABLE public.aplicaciones_pago DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.aplicaciones_pago ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.aplicaciones_pago DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.aplicaciones_pago ADD CONSTRAINT undefined UNIQUE (pago_id, cuota_id);

ALTER TABLE public.app_users DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.app_users ADD CONSTRAINT undefined CHECK ((jurado_id = ANY (ARRAY['admin'::text, 'omar'::text, 'kalani'::text, 'manuel'::text, 'especialista'::text])));

ALTER TABLE public.app_users DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.app_users ADD CONSTRAINT undefined CHECK ((role = ANY (ARRAY['admin'::text, 'jurado'::text])));

ALTER TABLE public.app_users DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.app_users ADD CONSTRAINT undefined FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.app_users DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.app_users ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.applicant_events DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.applicant_events ADD CONSTRAINT undefined FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE;

ALTER TABLE public.applicant_events DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.applicant_events ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.applicants DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.applicants ADD CONSTRAINT undefined CHECK ((status = ANY (ARRAY['LEAD'::text, 'FORM_COMPLETED'::text, 'SCHEDULED'::text, 'ATTENDED'::text, 'NO_SHOW'::text, 'CANCELLED'::text])));

ALTER TABLE public.applicants DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.applicants ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.applicants DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.applicants ADD CONSTRAINT undefined UNIQUE (idempotency_key);

ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.appointments ADD CONSTRAINT undefined CHECK ((status = ANY (ARRAY['RESERVED_PENDING'::text, 'CONFIRMED'::text, 'CANCELLED'::text, 'COMPLETED'::text])));

ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.appointments ADD CONSTRAINT undefined FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE;

ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.appointments ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.asistencia_maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.asistencia_maestros ADD CONSTRAINT undefined CHECK (((estado <> 'suplencia'::text) OR (suplente_id IS NOT NULL)));

ALTER TABLE public.asistencia_maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.asistencia_maestros ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['presente'::text, 'ausente'::text, 'justificado'::text, 'suplencia'::text, 'tardanza'::text])));

ALTER TABLE public.asistencia_maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.asistencia_maestros ADD CONSTRAINT undefined FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE SET NULL;

ALTER TABLE public.asistencia_maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.asistencia_maestros ADD CONSTRAINT undefined FOREIGN KEY (registrado_por) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE public.asistencia_maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.asistencia_maestros ADD CONSTRAINT undefined FOREIGN KEY (suplente_id) REFERENCES maestros(id) ON DELETE SET NULL;

ALTER TABLE public.asistencia_maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.asistencia_maestros ADD CONSTRAINT undefined FOREIGN KEY (ausencia_id) REFERENCES ausencias_maestros(id) ON DELETE SET NULL;

ALTER TABLE public.asistencia_maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.asistencia_maestros ADD CONSTRAINT undefined FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE SET NULL;

ALTER TABLE public.asistencia_maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.asistencia_maestros ADD CONSTRAINT undefined FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE RESTRICT;

ALTER TABLE public.asistencia_maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.asistencia_maestros ADD CONSTRAINT undefined FOREIGN KEY (sesion_clase_id) REFERENCES sesiones_clase(id) ON DELETE CASCADE;

ALTER TABLE public.asistencia_maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.asistencia_maestros ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.asistencia_maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.asistencia_maestros ADD CONSTRAINT undefined UNIQUE (sesion_clase_id, maestro_id);

ALTER TABLE public.asistencias DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.asistencias ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['presente'::text, 'ausente'::text, 'tarde'::text, 'justificado'::text])));

ALTER TABLE public.asistencias DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.asistencias ADD CONSTRAINT undefined FOREIGN KEY (periodo_id) REFERENCES periodos(id);

ALTER TABLE public.asistencias DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.asistencias ADD CONSTRAINT undefined FOREIGN KEY (sesion_clase_id) REFERENCES sesiones_clase(id) ON DELETE CASCADE;

ALTER TABLE public.asistencias DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.asistencias ADD CONSTRAINT undefined FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE;

ALTER TABLE public.asistencias DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.asistencias ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE;

ALTER TABLE public.asistencias DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.asistencias ADD CONSTRAINT undefined FOREIGN KEY (registrado_por) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE public.asistencias DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.asistencias ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.asistencias DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.asistencias ADD CONSTRAINT undefined UNIQUE (clase_id, alumno_id, fecha);

ALTER TABLE public.asistencias DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.asistencias ADD CONSTRAINT undefined UNIQUE (sesion_clase_id, alumno_id);

ALTER TABLE public.ausencias DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ausencias ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['pendiente'::text, 'notificado'::text, 'resuelta'::text])));

ALTER TABLE public.ausencias DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ausencias ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.ausencias_auditoria DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ausencias_auditoria ADD CONSTRAINT undefined FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE RESTRICT;

ALTER TABLE public.ausencias_auditoria DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ausencias_auditoria ADD CONSTRAINT undefined FOREIGN KEY (ausencia_id) REFERENCES ausencias(id) ON DELETE CASCADE;

ALTER TABLE public.ausencias_auditoria DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ausencias_auditoria ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.ausencias_maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ausencias_maestros ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['pendiente'::text, 'aprobada'::text, 'rechazada'::text, 'cancelada'::text])));

ALTER TABLE public.ausencias_maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ausencias_maestros ADD CONSTRAINT undefined CHECK ((urgencia = ANY (ARRAY['baja'::text, 'media'::text, 'alta'::text, 'critica'::text])));

ALTER TABLE public.ausencias_maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ausencias_maestros ADD CONSTRAINT undefined CHECK ((duracion_tipo = ANY (ARRAY['un_dia'::text, 'varios_dias'::text])));

ALTER TABLE public.ausencias_maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ausencias_maestros ADD CONSTRAINT undefined FOREIGN KEY (revisado_por) REFERENCES auth.users(id);

ALTER TABLE public.ausencias_maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ausencias_maestros ADD CONSTRAINT undefined FOREIGN KEY (maestro_suplente_id) REFERENCES maestros(id) ON DELETE SET NULL;

ALTER TABLE public.ausencias_maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ausencias_maestros ADD CONSTRAINT undefined FOREIGN KEY (rechazado_por) REFERENCES auth.users(id);

ALTER TABLE public.ausencias_maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ausencias_maestros ADD CONSTRAINT undefined FOREIGN KEY (aprobado_por) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE public.ausencias_maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ausencias_maestros ADD CONSTRAINT undefined FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE;

ALTER TABLE public.ausencias_maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ausencias_maestros ADD CONSTRAINT undefined FOREIGN KEY (director_notificacion_id) REFERENCES notificaciones(id) ON DELETE SET NULL;

ALTER TABLE public.ausencias_maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ausencias_maestros ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.becas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.becas ADD CONSTRAINT undefined CHECK (((porcentaje > (0)::numeric) AND (porcentaje <= (100)::numeric)));

ALTER TABLE public.becas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.becas ADD CONSTRAINT undefined FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT;

ALTER TABLE public.becas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.becas ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE RESTRICT;

ALTER TABLE public.becas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.becas ADD CONSTRAINT undefined FOREIGN KEY (aprobado_por) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.becas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.becas ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.blocks DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.blocks ADD CONSTRAINT undefined FOREIGN KEY (route_version_id) REFERENCES route_versions(id) ON DELETE CASCADE;

ALTER TABLE public.blocks DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.blocks ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.calendario DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.calendario ADD CONSTRAINT undefined FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE RESTRICT;

ALTER TABLE public.calendario DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.calendario ADD CONSTRAINT undefined FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE;

ALTER TABLE public.calendario DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.calendario ADD CONSTRAINT undefined FOREIGN KEY (responsable_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.calendario DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.calendario ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.calendario_institucional DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.calendario_institucional ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['programado'::text, 'en_curso'::text, 'completado'::text, 'cancelado'::text])));

ALTER TABLE public.calendario_institucional DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.calendario_institucional ADD CONSTRAINT undefined CHECK ((salud_proyecto = ANY (ARRAY['en_orden'::text, 'en_riesgo'::text, 'critico'::text, 'completado'::text])));

ALTER TABLE public.calendario_institucional DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.calendario_institucional ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.campania_envios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.campania_envios ADD CONSTRAINT undefined CHECK ((fuente = ANY (ARRAY['postulante'::text, 'alumno'::text])));

ALTER TABLE public.campania_envios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.campania_envios ADD CONSTRAINT undefined FOREIGN KEY (campania_id) REFERENCES campanias_periodo(id) ON DELETE CASCADE;

ALTER TABLE public.campania_envios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.campania_envios ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.campania_envios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.campania_envios ADD CONSTRAINT undefined UNIQUE (campania_id, jid);

ALTER TABLE public.campanias_periodo DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.campanias_periodo ADD CONSTRAINT undefined CHECK ((tipo = ANY (ARRAY['A'::text, 'B'::text])));

ALTER TABLE public.campanias_periodo DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.campanias_periodo ADD CONSTRAINT undefined CHECK ((accion = ANY (ARRAY['inscripcion'::text, 'reinscripcion'::text, 'concierto'::text, 'microperiodo'::text, 'servicio'::text])));

ALTER TABLE public.campanias_periodo DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.campanias_periodo ADD CONSTRAINT undefined FOREIGN KEY (periodo_academico_id) REFERENCES periodos(id) ON DELETE SET NULL;

ALTER TABLE public.campanias_periodo DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.campanias_periodo ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.catalogo_niveles DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.catalogo_niveles ADD CONSTRAINT undefined FOREIGN KEY (created_by) REFERENCES maestros(id);

ALTER TABLE public.catalogo_niveles DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.catalogo_niveles ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.catalogo_niveles DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.catalogo_niveles ADD CONSTRAINT undefined UNIQUE (instrumento, orden);

ALTER TABLE public.catalogo_objetivos_especificos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.catalogo_objetivos_especificos ADD CONSTRAINT undefined FOREIGN KEY (objetivo_general_id) REFERENCES catalogo_objetivos_generales(id) ON DELETE CASCADE;

ALTER TABLE public.catalogo_objetivos_especificos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.catalogo_objetivos_especificos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.catalogo_objetivos_especificos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.catalogo_objetivos_especificos ADD CONSTRAINT undefined UNIQUE (objetivo_general_id, orden);

ALTER TABLE public.catalogo_objetivos_generales DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.catalogo_objetivos_generales ADD CONSTRAINT undefined FOREIGN KEY (nivel_id) REFERENCES catalogo_niveles(id) ON DELETE CASCADE;

ALTER TABLE public.catalogo_objetivos_generales DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.catalogo_objetivos_generales ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.catalogo_objetivos_generales DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.catalogo_objetivos_generales ADD CONSTRAINT undefined UNIQUE (nivel_id, orden);

ALTER TABLE public.catalogos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.catalogos ADD CONSTRAINT undefined CHECK ((tipo = ANY (ARRAY['contenidos'::text, 'medidas'::text, 'sugerencias'::text, 'tareas'::text, 'objetivos'::text])));

ALTER TABLE public.catalogos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.catalogos ADD CONSTRAINT undefined FOREIGN KEY (created_by) REFERENCES auth.users(id);

ALTER TABLE public.catalogos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.catalogos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.clase_horarios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clase_horarios ADD CONSTRAINT undefined CHECK ((hora_fin > hora_inicio));

ALTER TABLE public.clase_horarios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clase_horarios ADD CONSTRAINT undefined CHECK ((dia = ANY (ARRAY['lunes'::text, 'martes'::text, 'miércoles'::text, 'jueves'::text, 'viernes'::text, 'sábado'::text, 'domingo'::text])));

ALTER TABLE public.clase_horarios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clase_horarios ADD CONSTRAINT undefined FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE;

ALTER TABLE public.clase_horarios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clase_horarios ADD CONSTRAINT undefined FOREIGN KEY (salon_id) REFERENCES salones(id) ON DELETE SET NULL;

ALTER TABLE public.clase_horarios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clase_horarios ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.clase_mapa_indicadores DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clase_mapa_indicadores ADD CONSTRAINT undefined FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE;

ALTER TABLE public.clase_mapa_indicadores DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clase_mapa_indicadores ADD CONSTRAINT undefined FOREIGN KEY (origen_indicator_id) REFERENCES catalogo_objetivos_especificos(id) ON DELETE SET NULL;

ALTER TABLE public.clase_mapa_indicadores DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clase_mapa_indicadores ADD CONSTRAINT undefined FOREIGN KEY (objetivo_id) REFERENCES clase_mapa_objetivos(id) ON DELETE RESTRICT;

ALTER TABLE public.clase_mapa_indicadores DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clase_mapa_indicadores ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.clase_mapa_indicadores DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clase_mapa_indicadores ADD CONSTRAINT undefined UNIQUE (clase_id, id_jerarquico);

ALTER TABLE public.clase_mapa_indicadores DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clase_mapa_indicadores ADD CONSTRAINT undefined UNIQUE (objetivo_id, orden_indicador);

ALTER TABLE public.clase_mapa_objetivos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clase_mapa_objetivos ADD CONSTRAINT undefined CHECK ((estado_revision = ANY (ARRAY['borrador'::text, 'revisada'::text, 'publicada'::text])));

ALTER TABLE public.clase_mapa_objetivos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clase_mapa_objetivos ADD CONSTRAINT undefined FOREIGN KEY (created_by) REFERENCES maestros(id);

ALTER TABLE public.clase_mapa_objetivos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clase_mapa_objetivos ADD CONSTRAINT undefined FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE;

ALTER TABLE public.clase_mapa_objetivos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clase_mapa_objetivos ADD CONSTRAINT undefined FOREIGN KEY (origen_objetivo_id) REFERENCES catalogo_objetivos_generales(id) ON DELETE SET NULL;

ALTER TABLE public.clase_mapa_objetivos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clase_mapa_objetivos ADD CONSTRAINT undefined FOREIGN KEY (level_id) REFERENCES catalogo_niveles(id) ON DELETE RESTRICT;

ALTER TABLE public.clase_mapa_objetivos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clase_mapa_objetivos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.clase_mapa_objetivos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clase_mapa_objetivos ADD CONSTRAINT undefined UNIQUE (clase_id, level_id, orden_objetivo);

ALTER TABLE public.clases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clases ADD CONSTRAINT undefined CHECK ((modalidad = ANY (ARRAY['presencial'::text, 'virtual'::text, 'hibrida'::text])));

ALTER TABLE public.clases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clases ADD CONSTRAINT undefined CHECK ((tipo_clase = ANY (ARRAY['individual'::text, 'grupal'::text, 'rotativa'::text, 'seccional'::text, 'orquesta'::text, 'coro'::text, 'teoria'::text, 'preparatoria'::text, 'otro'::text])));

ALTER TABLE public.clases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clases ADD CONSTRAINT undefined CHECK (((capacidad_maxima IS NULL) OR (capacidad_maxima > 0)));

ALTER TABLE public.clases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clases ADD CONSTRAINT undefined CHECK (((maestro_suplente_id IS NULL) OR (maestro_suplente_id <> maestro_principal_id)));

ALTER TABLE public.clases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clases ADD CONSTRAINT undefined FOREIGN KEY (ruta_id) REFERENCES rutas_contenido(id) ON DELETE SET NULL;

ALTER TABLE public.clases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clases ADD CONSTRAINT undefined FOREIGN KEY (maestro_auxiliar_id) REFERENCES maestros(id) ON DELETE SET NULL;

ALTER TABLE public.clases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clases ADD CONSTRAINT undefined FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE RESTRICT;

ALTER TABLE public.clases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clases ADD CONSTRAINT undefined FOREIGN KEY (nivel_id) REFERENCES niveles(id) ON DELETE SET NULL;

ALTER TABLE public.clases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clases ADD CONSTRAINT undefined FOREIGN KEY (maestro_principal_id) REFERENCES maestros(id) ON DELETE RESTRICT;

ALTER TABLE public.clases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clases ADD CONSTRAINT undefined FOREIGN KEY (maestro_suplente_id) REFERENCES maestros(id) ON DELETE SET NULL;

ALTER TABLE public.clases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clases ADD CONSTRAINT undefined FOREIGN KEY (route_version_id) REFERENCES route_versions(id);

ALTER TABLE public.clases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clases ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.clases_emergentes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.clases_emergentes ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.class_event_methodology DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.class_event_methodology ADD CONSTRAINT undefined FOREIGN KEY (main_node_id) REFERENCES nodes(id) ON DELETE SET NULL;

ALTER TABLE public.class_event_methodology DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.class_event_methodology ADD CONSTRAINT undefined FOREIGN KEY (class_event_id) REFERENCES class_events(id) ON DELETE CASCADE;

ALTER TABLE public.class_event_methodology DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.class_event_methodology ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.class_events DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.class_events ADD CONSTRAINT undefined CHECK ((status = ANY (ARRAY['draft'::text, 'completed'::text, 'cancelled'::text])));

ALTER TABLE public.class_events DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.class_events ADD CONSTRAINT undefined FOREIGN KEY (teacher_id) REFERENCES maestros(id) ON DELETE CASCADE;

ALTER TABLE public.class_events DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.class_events ADD CONSTRAINT undefined FOREIGN KEY (student_id) REFERENCES alumnos(id) ON DELETE CASCADE;

ALTER TABLE public.class_events DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.class_events ADD CONSTRAINT undefined FOREIGN KEY (academic_plan_id) REFERENCES academic_plans(id) ON DELETE SET NULL;

ALTER TABLE public.class_events DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.class_events ADD CONSTRAINT undefined FOREIGN KEY (session_id) REFERENCES sesiones_clase(id) ON DELETE SET NULL;

ALTER TABLE public.class_events DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.class_events ADD CONSTRAINT undefined FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE SET NULL;

ALTER TABLE public.class_events DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.class_events ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.class_session_content_snapshots DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.class_session_content_snapshots ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.cobertura_alumno_objetivo DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.cobertura_alumno_objetivo ADD CONSTRAINT undefined FOREIGN KEY (plan_id) REFERENCES planificaciones(id) ON DELETE SET NULL;

ALTER TABLE public.cobertura_alumno_objetivo DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.cobertura_alumno_objetivo ADD CONSTRAINT undefined FOREIGN KEY (maestro_id) REFERENCES maestros(id);

ALTER TABLE public.cobertura_alumno_objetivo DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.cobertura_alumno_objetivo ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE;

ALTER TABLE public.cobertura_alumno_objetivo DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.cobertura_alumno_objetivo ADD CONSTRAINT undefined FOREIGN KEY (objetivo_id) REFERENCES curriculo_objetivos(id) ON DELETE CASCADE;

ALTER TABLE public.cobertura_alumno_objetivo DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.cobertura_alumno_objetivo ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.cobertura_alumno_objetivo DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.cobertura_alumno_objetivo ADD CONSTRAINT undefined UNIQUE (alumno_id, objetivo_id);

ALTER TABLE public.comodatos_activos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.comodatos_activos ADD CONSTRAINT undefined CHECK (((tipo_comodato)::text = ANY ((ARRAY['escolar'::character varying, 'anual'::character varying, 'eventual'::character varying])::text[])));

ALTER TABLE public.comodatos_activos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.comodatos_activos ADD CONSTRAINT undefined CHECK (((estado)::text = ANY ((ARRAY['activo'::character varying, 'devuelto'::character varying, 'renovado'::character varying])::text[])));

ALTER TABLE public.comodatos_activos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.comodatos_activos ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE RESTRICT;

ALTER TABLE public.comodatos_activos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.comodatos_activos ADD CONSTRAINT undefined FOREIGN KEY (activo_id) REFERENCES inventario_activos(id) ON DELETE RESTRICT;

ALTER TABLE public.comodatos_activos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.comodatos_activos ADD CONSTRAINT undefined FOREIGN KEY (intercambiado_con_id) REFERENCES comodatos_activos(id) ON DELETE SET NULL;

ALTER TABLE public.comodatos_activos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.comodatos_activos ADD CONSTRAINT undefined FOREIGN KEY (renovado_de_id) REFERENCES comodatos_activos(id) ON DELETE SET NULL;

ALTER TABLE public.comodatos_activos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.comodatos_activos ADD CONSTRAINT undefined FOREIGN KEY (instrumento_propio_id) REFERENCES inventario_activos(id) ON DELETE SET NULL;

ALTER TABLE public.comodatos_activos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.comodatos_activos ADD CONSTRAINT undefined FOREIGN KEY (registrado_por) REFERENCES auth.users(id);

ALTER TABLE public.comodatos_activos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.comodatos_activos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.compromisos_pago DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.compromisos_pago ADD CONSTRAINT undefined CHECK ((monto_comprometido_centavos > 0));

ALTER TABLE public.compromisos_pago DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.compromisos_pago ADD CONSTRAINT undefined FOREIGN KEY (representante_id) REFERENCES representantes(id) ON DELETE RESTRICT;

ALTER TABLE public.compromisos_pago DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.compromisos_pago ADD CONSTRAINT undefined FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT;

ALTER TABLE public.compromisos_pago DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.compromisos_pago ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.comunicaciones_seguimiento DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.comunicaciones_seguimiento ADD CONSTRAINT undefined CHECK ((resultado = ANY (ARRAY['contactado'::text, 'buzon_no_contesto'::text, 'reagendar'::text, 'sin_interes'::text, 'resuelto'::text])));

ALTER TABLE public.comunicaciones_seguimiento DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.comunicaciones_seguimiento ADD CONSTRAINT undefined CHECK ((canal = ANY (ARRAY['llamada'::text, 'whatsapp'::text, 'correo'::text, 'reunion'::text, 'otro'::text])));

ALTER TABLE public.comunicaciones_seguimiento DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.comunicaciones_seguimiento ADD CONSTRAINT undefined CHECK ((origen = ANY (ARRAY['manual'::text, 'ausentismo'::text, 'hermes'::text, 'otro'::text])));

ALTER TABLE public.comunicaciones_seguimiento DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.comunicaciones_seguimiento ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['abierto'::text, 'cerrado'::text])));

ALTER TABLE public.comunicaciones_seguimiento DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.comunicaciones_seguimiento ADD CONSTRAINT undefined FOREIGN KEY (responsable_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.comunicaciones_seguimiento DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.comunicaciones_seguimiento ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL;

ALTER TABLE public.comunicaciones_seguimiento DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.comunicaciones_seguimiento ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.configuracion_aranceles DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.configuracion_aranceles ADD CONSTRAINT undefined CHECK ((monto_centavos > 0));

ALTER TABLE public.configuracion_aranceles DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.configuracion_aranceles ADD CONSTRAINT undefined FOREIGN KEY (modificado_por) REFERENCES auth.users(id);

ALTER TABLE public.configuracion_aranceles DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.configuracion_aranceles ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.configuracion_recordatorios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.configuracion_recordatorios ADD CONSTRAINT undefined CHECK (((dia_resumen_semanal >= 1) AND (dia_resumen_semanal <= 7)));

ALTER TABLE public.configuracion_recordatorios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.configuracion_recordatorios ADD CONSTRAINT undefined FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE public.configuracion_recordatorios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.configuracion_recordatorios ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.configuracion_recordatorios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.configuracion_recordatorios ADD CONSTRAINT undefined UNIQUE (profile_id);

ALTER TABLE public.contactos_alianzas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.contactos_alianzas ADD CONSTRAINT undefined CHECK ((tipo = ANY (ARRAY['fundacion'::text, 'artista'::text, 'aliado_local'::text, 'gobierno'::text, 'red'::text])));

ALTER TABLE public.contactos_alianzas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.contactos_alianzas ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['prospecto'::text, 'contactado'::text, 'respondio'::text, 'en_negociacion'::text, 'convenio_activo'::text, 'descartado'::text])));

ALTER TABLE public.contactos_alianzas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.contactos_alianzas ADD CONSTRAINT undefined CHECK (((puntuacion_match >= 1) AND (puntuacion_match <= 5)));

ALTER TABLE public.contactos_alianzas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.contactos_alianzas ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.contenidos_sesion DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.contenidos_sesion ADD CONSTRAINT undefined CHECK (((nivel_logro IS NULL) OR (nivel_logro = ANY (ARRAY['introducido'::text, 'practicado'::text, 'reforzado'::text, 'evaluado'::text, 'dominado'::text]))));

ALTER TABLE public.contenidos_sesion DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.contenidos_sesion ADD CONSTRAINT undefined FOREIGN KEY (unidad_id) REFERENCES unidades(id) ON DELETE SET NULL;

ALTER TABLE public.contenidos_sesion DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.contenidos_sesion ADD CONSTRAINT undefined FOREIGN KEY (planificacion_id) REFERENCES planificaciones(id) ON DELETE SET NULL;

ALTER TABLE public.contenidos_sesion DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.contenidos_sesion ADD CONSTRAINT undefined FOREIGN KEY (sesion_clase_id) REFERENCES sesiones_clase(id) ON DELETE CASCADE;

ALTER TABLE public.contenidos_sesion DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.contenidos_sesion ADD CONSTRAINT undefined FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE SET NULL;

ALTER TABLE public.contenidos_sesion DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.contenidos_sesion ADD CONSTRAINT undefined FOREIGN KEY (ejercicio_id) REFERENCES ejercicios(id) ON DELETE SET NULL;

ALTER TABLE public.contenidos_sesion DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.contenidos_sesion ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.conversaciones_whatsapp DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.conversaciones_whatsapp ADD CONSTRAINT undefined FOREIGN KEY (postulante_id) REFERENCES postulantes(id) ON DELETE CASCADE;

ALTER TABLE public.conversaciones_whatsapp DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.conversaciones_whatsapp ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.conversaciones_whatsapp DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.conversaciones_whatsapp ADD CONSTRAINT undefined UNIQUE (postulante_id);

ALTER TABLE public.cuotas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.cuotas ADD CONSTRAINT undefined CHECK (((monto_pagado_centavos >= 0) AND (monto_pagado_centavos <= monto_final_centavos)));

ALTER TABLE public.cuotas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.cuotas ADD CONSTRAINT undefined CHECK (((monto_base_centavos >= 0) AND (monto_final_centavos >= 0) AND (descuento_centavos >= 0)));

ALTER TABLE public.cuotas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.cuotas ADD CONSTRAINT undefined CHECK (((ciclo_mes >= 1) AND (ciclo_mes <= 12)));

ALTER TABLE public.cuotas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.cuotas ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE RESTRICT;

ALTER TABLE public.cuotas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.cuotas ADD CONSTRAINT undefined FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT;

ALTER TABLE public.cuotas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.cuotas ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.cuotas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.cuotas ADD CONSTRAINT undefined UNIQUE (familia_id, alumno_id, ciclo_anio, ciclo_mes, concepto);

ALTER TABLE public.curriculo_objetivos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.curriculo_objetivos ADD CONSTRAINT undefined FOREIGN KEY (pilar_id) REFERENCES curriculo_pilares(id) ON DELETE CASCADE;

ALTER TABLE public.curriculo_objetivos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.curriculo_objetivos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.curriculo_pilares DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.curriculo_pilares ADD CONSTRAINT undefined FOREIGN KEY (curriculo_id) REFERENCES curriculos(id) ON DELETE CASCADE;

ALTER TABLE public.curriculo_pilares DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.curriculo_pilares ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.curriculos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.curriculos ADD CONSTRAINT undefined FOREIGN KEY (created_by) REFERENCES maestros(id);

ALTER TABLE public.curriculos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.curriculos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.curriculos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.curriculos ADD CONSTRAINT undefined UNIQUE (instrumento, nivel);

ALTER TABLE public.departamentos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.departamentos ADD CONSTRAINT undefined FOREIGN KEY (jefe_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.departamentos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.departamentos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.departamentos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.departamentos ADD CONSTRAINT undefined UNIQUE (nombre);

ALTER TABLE public.document_batches DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.document_batches ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['borrador'::text, 'generado'::text, 'archivado'::text, 'anulado'::text])));

ALTER TABLE public.document_batches DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.document_batches ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.document_templates DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.document_templates ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['activa'::text, 'inactiva'::text, 'archivada'::text])));

ALTER TABLE public.document_templates DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.document_templates ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.ejercicios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ejercicios ADD CONSTRAINT undefined CHECK ((orden > 0));

ALTER TABLE public.ejercicios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ejercicios ADD CONSTRAINT undefined CHECK ((puntaje_maximo > (0)::numeric));

ALTER TABLE public.ejercicios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ejercicios ADD CONSTRAINT undefined CHECK ((puntaje_aprobacion >= (0)::numeric));

ALTER TABLE public.ejercicios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ejercicios ADD CONSTRAINT undefined CHECK ((puntos_xp >= 0));

ALTER TABLE public.ejercicios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ejercicios ADD CONSTRAINT undefined CHECK ((tipo_ejercicio = ANY (ARRAY['tecnico'::text, 'ritmico'::text, 'lectura'::text, 'auditivo'::text, 'repertorio'::text, 'teorico'::text, 'postural'::text, 'ensamble'::text, 'memoria'::text, 'otro'::text])));

ALTER TABLE public.ejercicios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ejercicios ADD CONSTRAINT undefined CHECK (((dificultad >= 1) AND (dificultad <= 10)));

ALTER TABLE public.ejercicios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ejercicios ADD CONSTRAINT undefined CHECK ((puntaje_aprobacion <= puntaje_maximo));

ALTER TABLE public.ejercicios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ejercicios ADD CONSTRAINT undefined FOREIGN KEY (unidad_id) REFERENCES unidades(id) ON DELETE CASCADE;

ALTER TABLE public.ejercicios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ejercicios ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.ejercicios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ejercicios ADD CONSTRAINT undefined UNIQUE (unidad_id, orden);

ALTER TABLE public.evaluacion_indicador DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.evaluacion_indicador ADD CONSTRAINT undefined CHECK (((nota >= 1) AND (nota <= 5)));

ALTER TABLE public.evaluacion_indicador DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.evaluacion_indicador ADD CONSTRAINT undefined CHECK (((recovery_grade IS NULL) OR ((recovery_grade >= 1) AND (recovery_grade <= 5))));

ALTER TABLE public.evaluacion_indicador DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.evaluacion_indicador ADD CONSTRAINT undefined CHECK ((((indicator_id IS NOT NULL) AND (maestro_indicador_id IS NULL)) OR ((indicator_id IS NULL) AND (maestro_indicador_id IS NOT NULL))));

ALTER TABLE public.evaluacion_indicador DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.evaluacion_indicador ADD CONSTRAINT undefined CHECK ((recovery_status = ANY (ARRAY['pendiente'::text, 'recuperado'::text, 'no_recuperable'::text, 'no_aplica'::text])));

ALTER TABLE public.evaluacion_indicador DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.evaluacion_indicador ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['sin_evaluar'::text, 'inicia'::text, 'en_progreso'::text, 'avanzado'::text, 'dominado'::text])));

ALTER TABLE public.evaluacion_indicador DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.evaluacion_indicador ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE;

ALTER TABLE public.evaluacion_indicador DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.evaluacion_indicador ADD CONSTRAINT undefined FOREIGN KEY (indicator_id) REFERENCES indicators(id) ON DELETE CASCADE;

ALTER TABLE public.evaluacion_indicador DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.evaluacion_indicador ADD CONSTRAINT undefined FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE;

ALTER TABLE public.evaluacion_indicador DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.evaluacion_indicador ADD CONSTRAINT undefined FOREIGN KEY (clase_indicador_id) REFERENCES clase_mapa_indicadores(id) ON DELETE RESTRICT;

ALTER TABLE public.evaluacion_indicador DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.evaluacion_indicador ADD CONSTRAINT undefined FOREIGN KEY (maestro_indicador_id) REFERENCES maestro_indicadores(id) ON DELETE CASCADE;

ALTER TABLE public.evaluacion_indicador DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.evaluacion_indicador ADD CONSTRAINT undefined FOREIGN KEY (evaluado_por) REFERENCES auth.users(id);

ALTER TABLE public.evaluacion_indicador DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.evaluacion_indicador ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.evaluacion_indicador DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.evaluacion_indicador ADD CONSTRAINT undefined UNIQUE (alumno_id, indicator_id, clase_id);

ALTER TABLE public.evaluacion_indicador DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.evaluacion_indicador ADD CONSTRAINT undefined UNIQUE (alumno_id, maestro_indicador_id, clase_id);

ALTER TABLE public.evaluations DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.evaluations ADD CONSTRAINT undefined CHECK (((digitacion >= 1) AND (digitacion <= 4)));

ALTER TABLE public.evaluations DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.evaluations ADD CONSTRAINT undefined CHECK (((lectura >= 1) AND (lectura <= 4)));

ALTER TABLE public.evaluations DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.evaluations ADD CONSTRAINT undefined CHECK (((articulacion >= 1) AND (articulacion <= 4)));

ALTER TABLE public.evaluations DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.evaluations ADD CONSTRAINT undefined CHECK (((ritmo_rep >= 1) AND (ritmo_rep <= 4)));

ALTER TABLE public.evaluations DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.evaluations ADD CONSTRAINT undefined CHECK (((afinacion_rep >= 1) AND (afinacion_rep <= 4)));

ALTER TABLE public.evaluations DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.evaluations ADD CONSTRAINT undefined CHECK (((sonido >= 1) AND (sonido <= 4)));

ALTER TABLE public.evaluations DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.evaluations ADD CONSTRAINT undefined CHECK (((ritmo_escala >= 1) AND (ritmo_escala <= 4)));

ALTER TABLE public.evaluations DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.evaluations ADD CONSTRAINT undefined CHECK (((afinacion_general >= 1) AND (afinacion_general <= 4)));

ALTER TABLE public.evaluations DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.evaluations ADD CONSTRAINT undefined FOREIGN KEY (student_id) REFERENCES alumnos(id) ON DELETE CASCADE;

ALTER TABLE public.evaluations DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.evaluations ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.evaluations DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.evaluations ADD CONSTRAINT undefined UNIQUE (student_id, jurado_id);

ALTER TABLE public.facturas_reparacion DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.facturas_reparacion ADD CONSTRAINT undefined CHECK ((monto_total > (0)::numeric));

ALTER TABLE public.facturas_reparacion DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.facturas_reparacion ADD CONSTRAINT undefined CHECK (((estado_pago)::text = ANY ((ARRAY['pendiente'::character varying, 'pagado'::character varying, 'anulada'::character varying])::text[])));

ALTER TABLE public.facturas_reparacion DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.facturas_reparacion ADD CONSTRAINT undefined CHECK (((tipo_factura)::text = ANY ((ARRAY['alumno'::character varying, 'institucion'::character varying])::text[])));

ALTER TABLE public.facturas_reparacion DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.facturas_reparacion ADD CONSTRAINT undefined CHECK (((metodo_pago)::text = ANY ((ARRAY['efectivo'::character varying, 'transferencia'::character varying, 'deposito'::character varying, 'tarjeta'::character varying])::text[])));

ALTER TABLE public.facturas_reparacion DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.facturas_reparacion ADD CONSTRAINT undefined CHECK ((impuestos >= (0)::numeric));

ALTER TABLE public.facturas_reparacion DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.facturas_reparacion ADD CONSTRAINT undefined FOREIGN KEY (responsable_id) REFERENCES auth.users(id);

ALTER TABLE public.facturas_reparacion DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.facturas_reparacion ADD CONSTRAINT undefined FOREIGN KEY (reparacion_id) REFERENCES inventario_reparaciones(id) ON DELETE RESTRICT;

ALTER TABLE public.facturas_reparacion DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.facturas_reparacion ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.facturas_reparacion DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.facturas_reparacion ADD CONSTRAINT undefined UNIQUE (numero_factura);

ALTER TABLE public.familias DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.familias ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.fin_service_accounts DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.fin_service_accounts ADD CONSTRAINT undefined FOREIGN KEY (provider_id) REFERENCES fin_service_providers(id);

ALTER TABLE public.fin_service_accounts DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.fin_service_accounts ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.fin_service_accounts DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.fin_service_accounts ADD CONSTRAINT undefined UNIQUE (provider_id, external_account_ref);

ALTER TABLE public.fin_service_balance_snapshots DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.fin_service_balance_snapshots ADD CONSTRAINT undefined FOREIGN KEY (refresh_run_id) REFERENCES fin_service_refresh_runs(id);

ALTER TABLE public.fin_service_balance_snapshots DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.fin_service_balance_snapshots ADD CONSTRAINT undefined FOREIGN KEY (service_account_id) REFERENCES fin_service_accounts(id);

ALTER TABLE public.fin_service_balance_snapshots DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.fin_service_balance_snapshots ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.fin_service_balance_snapshots DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.fin_service_balance_snapshots ADD CONSTRAINT undefined UNIQUE (source_snapshot_key);

ALTER TABLE public.fin_service_providers DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.fin_service_providers ADD CONSTRAINT undefined CHECK ((connector_status = ANY (ARRAY['active'::text, 'inactive'::text])));

ALTER TABLE public.fin_service_providers DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.fin_service_providers ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.fin_service_providers DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.fin_service_providers ADD CONSTRAINT undefined UNIQUE (connector_key);

ALTER TABLE public.fin_service_refresh_runs DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.fin_service_refresh_runs ADD CONSTRAINT undefined CHECK ((trigger_source = ANY (ARRAY['schedule'::text, 'manual'::text])));

ALTER TABLE public.fin_service_refresh_runs DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.fin_service_refresh_runs ADD CONSTRAINT undefined CHECK ((status = ANY (ARRAY['running'::text, 'success'::text, 'unsupported'::text, 'skipped'::text, 'error'::text])));

ALTER TABLE public.fin_service_refresh_runs DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.fin_service_refresh_runs ADD CONSTRAINT undefined FOREIGN KEY (service_account_id) REFERENCES fin_service_accounts(id);

ALTER TABLE public.fin_service_refresh_runs DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.fin_service_refresh_runs ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.fin_service_refresh_state DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.fin_service_refresh_state ADD CONSTRAINT undefined FOREIGN KEY (service_account_id) REFERENCES fin_service_accounts(id);

ALTER TABLE public.fin_service_refresh_state DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.fin_service_refresh_state ADD CONSTRAINT undefined FOREIGN KEY (locked_by_run_id) REFERENCES fin_service_refresh_runs(id);

ALTER TABLE public.fin_service_refresh_state DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.fin_service_refresh_state ADD CONSTRAINT undefined PRIMARY KEY (service_account_id);

ALTER TABLE public.finanzas_politica_cobranza DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.finanzas_politica_cobranza ADD CONSTRAINT undefined CHECK (singleton);

ALTER TABLE public.finanzas_politica_cobranza DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.finanzas_politica_cobranza ADD CONSTRAINT undefined CHECK (((dia_vencimiento >= 1) AND (dia_vencimiento <= 28)));

ALTER TABLE public.finanzas_politica_cobranza DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.finanzas_politica_cobranza ADD CONSTRAINT undefined CHECK ((dias_mora_critica > dias_mora_amarilla));

ALTER TABLE public.finanzas_politica_cobranza DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.finanzas_politica_cobranza ADD CONSTRAINT undefined CHECK ((dias_mora_amarilla >= 1));

ALTER TABLE public.finanzas_politica_cobranza DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.finanzas_politica_cobranza ADD CONSTRAINT undefined PRIMARY KEY (singleton);

ALTER TABLE public.gastos_fijos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.gastos_fijos ADD CONSTRAINT undefined CHECK ((((dia_fin >= 1) AND (dia_fin <= 31)) AND (dia_fin >= dia_inicio)));

ALTER TABLE public.gastos_fijos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.gastos_fijos ADD CONSTRAINT undefined CHECK ((monto_centavos > 0));

ALTER TABLE public.gastos_fijos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.gastos_fijos ADD CONSTRAINT undefined CHECK ((categoria = ANY (ARRAY['comunicaciones'::text, 'energia'::text, 'agua'::text, 'limpieza'::text, 'personal'::text, 'alquiler'::text, 'software'::text, 'seguro'::text, 'otro'::text])));

ALTER TABLE public.gastos_fijos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.gastos_fijos ADD CONSTRAINT undefined CHECK (((dia_inicio >= 1) AND (dia_inicio <= 31)));

ALTER TABLE public.gastos_fijos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.gastos_fijos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.gastos_fijos_pagos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.gastos_fijos_pagos ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['pendiente'::text, 'pagado'::text])));

ALTER TABLE public.gastos_fijos_pagos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.gastos_fijos_pagos ADD CONSTRAINT undefined CHECK (((periodo_mes >= 1) AND (periodo_mes <= 12)));

ALTER TABLE public.gastos_fijos_pagos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.gastos_fijos_pagos ADD CONSTRAINT undefined CHECK ((monto_centavos > 0));

ALTER TABLE public.gastos_fijos_pagos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.gastos_fijos_pagos ADD CONSTRAINT undefined FOREIGN KEY (gasto_fijo_id) REFERENCES gastos_fijos(id) ON DELETE CASCADE;

ALTER TABLE public.gastos_fijos_pagos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.gastos_fijos_pagos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.gastos_fijos_pagos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.gastos_fijos_pagos ADD CONSTRAINT undefined UNIQUE (gasto_fijo_id, periodo_anio, periodo_mes);

ALTER TABLE public.generated_documents DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.generated_documents ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['borrador'::text, 'generado'::text, 'archivado'::text, 'anulado'::text])));

ALTER TABLE public.generated_documents DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.generated_documents ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL;

ALTER TABLE public.generated_documents DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.generated_documents ADD CONSTRAINT undefined FOREIGN KEY (batch_id) REFERENCES document_batches(id) ON DELETE SET NULL;

ALTER TABLE public.generated_documents DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.generated_documents ADD CONSTRAINT undefined FOREIGN KEY (template_id) REFERENCES document_templates(id) ON DELETE SET NULL;

ALTER TABLE public.generated_documents DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.generated_documents ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.hermes_gateway_health DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.hermes_gateway_health ADD CONSTRAINT undefined CHECK ((status = ANY (ARRAY['connected'::text, 'connecting'::text, 'disconnected'::text, 'qr_ready'::text])));

ALTER TABLE public.hermes_gateway_health DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.hermes_gateway_health ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.hermes_gateway_health DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.hermes_gateway_health ADD CONSTRAINT undefined UNIQUE (instance_name);

ALTER TABLE public.hermes_gateway_worker_lease DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.hermes_gateway_worker_lease ADD CONSTRAINT undefined PRIMARY KEY (instance_name);

ALTER TABLE public.hermes_inbox DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.hermes_inbox ADD CONSTRAINT undefined CHECK (((canal)::text = ANY ((ARRAY['db_trigger'::character varying, 'telegram'::character varying])::text[])));

ALTER TABLE public.hermes_inbox DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.hermes_inbox ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.hermes_kanban_cards DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.hermes_kanban_cards ADD CONSTRAINT undefined PRIMARY KEY (card_id);

ALTER TABLE public.hermes_process_cases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.hermes_process_cases ADD CONSTRAINT undefined CHECK ((source = ANY (ARRAY['manual'::text, 'event'::text, 'scheduled'::text, 'data_driven'::text, 'conversation'::text])));

ALTER TABLE public.hermes_process_cases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.hermes_process_cases ADD CONSTRAINT undefined CHECK ((status = ANY (ARRAY['open'::text, 'in_progress'::text, 'blocked'::text, 'closed'::text, 'cancelled'::text])));

ALTER TABLE public.hermes_process_cases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.hermes_process_cases ADD CONSTRAINT undefined CHECK ((priority = ANY (ARRAY['baja'::text, 'media'::text, 'alta'::text, 'critica'::text])));

ALTER TABLE public.hermes_process_cases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.hermes_process_cases ADD CONSTRAINT undefined CHECK (((entity_type IS NULL) OR (entity_type = ANY (ARRAY['alumno'::text, 'maestro'::text, 'postulante'::text, 'representante'::text, 'instrumento'::text, 'evento'::text, 'otro'::text]))));

ALTER TABLE public.hermes_process_cases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.hermes_process_cases ADD CONSTRAINT undefined FOREIGN KEY (process_code) REFERENCES soi_process_contracts(process_code) ON UPDATE CASCADE;

ALTER TABLE public.hermes_process_cases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.hermes_process_cases ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.hermes_protocolos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.hermes_protocolos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.hermes_protocolos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.hermes_protocolos ADD CONSTRAINT undefined UNIQUE (categoria_evento);

ALTER TABLE public.hermes_reactive_rules DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.hermes_reactive_rules ADD CONSTRAINT undefined CHECK ((departamento = ANY (ARRAY['DIR'::text, 'ACM'::text, 'ADM'::text, 'FIN'::text, 'LOG'::text, 'COM'::text, 'TECNICO'::text, 'LUT'::text])));

ALTER TABLE public.hermes_reactive_rules DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.hermes_reactive_rules ADD CONSTRAINT undefined CHECK ((rule_type = ANY (ARRAY['R1'::text, 'R2'::text, 'R3'::text, 'R4'::text, 'R5'::text, 'R6'::text, 'R7'::text, 'R8'::text])));

ALTER TABLE public.hermes_reactive_rules DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.hermes_reactive_rules ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.hermes_reactive_rules DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.hermes_reactive_rules ADD CONSTRAINT undefined UNIQUE (rule_type, departamento);

ALTER TABLE public.hermes_whatsapp_config DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.hermes_whatsapp_config ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.hermes_whatsapp_config DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.hermes_whatsapp_config ADD CONSTRAINT undefined UNIQUE (numero_wid);

ALTER TABLE public.hermes_whatsapp_queue DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.hermes_whatsapp_queue ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['pendiente'::text, 'pendiente_aprobacion'::text, 'procesando'::text, 'enviado'::text, 'fallido'::text, 'cancelado'::text])));

ALTER TABLE public.hermes_whatsapp_queue DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.hermes_whatsapp_queue ADD CONSTRAINT undefined FOREIGN KEY (campania_envio_id) REFERENCES campania_envios(id) ON DELETE SET NULL;

ALTER TABLE public.hermes_whatsapp_queue DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.hermes_whatsapp_queue ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.historial_estado_alumno DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.historial_estado_alumno ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE;

ALTER TABLE public.historial_estado_alumno DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.historial_estado_alumno ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.homework_assignments DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.homework_assignments ADD CONSTRAINT undefined CHECK ((status = ANY (ARRAY['assigned'::text, 'completed'::text, 'overdue'::text])));

ALTER TABLE public.homework_assignments DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.homework_assignments ADD CONSTRAINT undefined FOREIGN KEY (student_id) REFERENCES alumnos(id) ON DELETE CASCADE;

ALTER TABLE public.homework_assignments DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.homework_assignments ADD CONSTRAINT undefined FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE SET NULL;

ALTER TABLE public.homework_assignments DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.homework_assignments ADD CONSTRAINT undefined FOREIGN KEY (class_event_id) REFERENCES class_events(id) ON DELETE CASCADE;

ALTER TABLE public.homework_assignments DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.homework_assignments ADD CONSTRAINT undefined FOREIGN KEY (teacher_id) REFERENCES maestros(id) ON DELETE CASCADE;

ALTER TABLE public.homework_assignments DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.homework_assignments ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.horarios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.horarios ADD CONSTRAINT undefined CHECK ((hora_fin > hora_inicio));

ALTER TABLE public.horarios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.horarios ADD CONSTRAINT undefined CHECK (((dia_semana >= 1) AND (dia_semana <= 7)));

ALTER TABLE public.horarios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.horarios ADD CONSTRAINT undefined FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE;

ALTER TABLE public.horarios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.horarios ADD CONSTRAINT undefined FOREIGN KEY (salon_id) REFERENCES salones(id) ON DELETE RESTRICT;

ALTER TABLE public.horarios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.horarios ADD CONSTRAINT undefined FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE RESTRICT;

ALTER TABLE public.horarios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.horarios ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.horarios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.horarios ADD CONSTRAINT undefined UNIQUE (clase_id, dia_semana, hora_inicio, hora_fin);

ALTER TABLE public.horarios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.horarios ADD CONSTRAINT undefined UNIQUE (salon_id, dia_semana, hora_inicio, hora_fin);

ALTER TABLE public.horarios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.horarios ADD CONSTRAINT undefined UNIQUE (maestro_id, dia_semana, hora_inicio, hora_fin);

ALTER TABLE public.indicador_prerequisito DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.indicador_prerequisito ADD CONSTRAINT undefined CHECK ((indicador_id <> prerequisito_indicador_id));

ALTER TABLE public.indicador_prerequisito DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.indicador_prerequisito ADD CONSTRAINT undefined FOREIGN KEY (prerequisito_indicador_id) REFERENCES maestro_indicadores(id);

ALTER TABLE public.indicador_prerequisito DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.indicador_prerequisito ADD CONSTRAINT undefined FOREIGN KEY (indicador_id) REFERENCES maestro_indicadores(id) ON DELETE CASCADE;

ALTER TABLE public.indicador_prerequisito DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.indicador_prerequisito ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.indicador_prerequisito DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.indicador_prerequisito ADD CONSTRAINT undefined UNIQUE (indicador_id, prerequisito_indicador_id);

ALTER TABLE public.indicator_attempts DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.indicator_attempts ADD CONSTRAINT undefined CHECK (((nota >= 1) AND (nota <= 5)));

ALTER TABLE public.indicator_attempts DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.indicator_attempts ADD CONSTRAINT undefined FOREIGN KEY (created_by) REFERENCES maestros(id) ON DELETE SET NULL;

ALTER TABLE public.indicator_attempts DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.indicator_attempts ADD CONSTRAINT undefined FOREIGN KEY (covered_by_clase_id) REFERENCES clases(id) ON DELETE SET NULL;

ALTER TABLE public.indicator_attempts DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.indicator_attempts ADD CONSTRAINT undefined FOREIGN KEY (node_id) REFERENCES nodes(id);

ALTER TABLE public.indicator_attempts DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.indicator_attempts ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.indicator_attempts DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.indicator_attempts ADD CONSTRAINT undefined UNIQUE (session_id, indicator_id, student_id);

ALTER TABLE public.indicator_session_students DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.indicator_session_students ADD CONSTRAINT undefined CHECK (((nota_cualitativa)::text = ANY ((ARRAY['bien'::character varying, 'regular'::character varying, 'mal'::character varying])::text[])));

ALTER TABLE public.indicator_session_students DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.indicator_session_students ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE;

ALTER TABLE public.indicator_session_students DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.indicator_session_students ADD CONSTRAINT undefined FOREIGN KEY (indicator_session_id) REFERENCES indicator_sessions(id) ON DELETE CASCADE;

ALTER TABLE public.indicator_session_students DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.indicator_session_students ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.indicator_session_students DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.indicator_session_students ADD CONSTRAINT undefined UNIQUE (indicator_session_id, alumno_id);

ALTER TABLE public.indicator_sessions DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.indicator_sessions ADD CONSTRAINT undefined FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE;

ALTER TABLE public.indicator_sessions DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.indicator_sessions ADD CONSTRAINT undefined FOREIGN KEY (objetivo_id) REFERENCES ruta_contenido_objetivos(id) ON DELETE RESTRICT;

ALTER TABLE public.indicator_sessions DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.indicator_sessions ADD CONSTRAINT undefined FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE RESTRICT;

ALTER TABLE public.indicator_sessions DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.indicator_sessions ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.indicator_sessions DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.indicator_sessions ADD CONSTRAINT undefined UNIQUE (clase_id, objetivo_id, fecha, maestro_id);

ALTER TABLE public.indicators DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.indicators ADD CONSTRAINT undefined FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE;

ALTER TABLE public.indicators DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.indicators ADD CONSTRAINT undefined FOREIGN KEY (objetivo_id) REFERENCES objetivos(id) ON DELETE SET NULL;

ALTER TABLE public.indicators DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.indicators ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.instrumentos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.instrumentos ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['disponible'::text, 'asignado'::text, 'danado'::text, 'en_reparacion'::text, 'fuera_de_uso'::text])));

ALTER TABLE public.instrumentos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.instrumentos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.instrumentos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.instrumentos ADD CONSTRAINT undefined UNIQUE (codigo);

ALTER TABLE public.inventario_accesorios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.inventario_accesorios ADD CONSTRAINT undefined CHECK ((cantidad >= 0));

ALTER TABLE public.inventario_accesorios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.inventario_accesorios ADD CONSTRAINT undefined CHECK (((tipo)::text = ANY ((ARRAY['funda'::character varying, 'arco'::character varying, 'cuerdas'::character varying, 'boquilla'::character varying, 'atril'::character varying, 'parlante'::character varying, 'cable'::character varying, 'otro'::character varying])::text[])));

ALTER TABLE public.inventario_accesorios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.inventario_accesorios ADD CONSTRAINT undefined CHECK (((estado)::text = ANY ((ARRAY['disponible'::character varying, 'asignado'::character varying, 'agotado'::character varying])::text[])));

ALTER TABLE public.inventario_accesorios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.inventario_accesorios ADD CONSTRAINT undefined FOREIGN KEY (activo_id) REFERENCES inventario_activos(id) ON DELETE CASCADE;

ALTER TABLE public.inventario_accesorios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.inventario_accesorios ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.inventario_activos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.inventario_activos ADD CONSTRAINT undefined CHECK (((estado_uso)::text = ANY ((ARRAY['disponible'::character varying, 'prestado'::character varying, 'en_mantenimiento'::character varying, 'en_reparacion'::character varying, 'de_baja'::character varying])::text[])));

ALTER TABLE public.inventario_activos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.inventario_activos ADD CONSTRAINT undefined CHECK (((estado_conservacion)::text = ANY ((ARRAY['excelente'::character varying, 'bueno'::character varying, 'regular'::character varying, 'mantenimiento'::character varying, 'de_baja'::character varying])::text[])));

ALTER TABLE public.inventario_activos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.inventario_activos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.inventario_activos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.inventario_activos ADD CONSTRAINT undefined UNIQUE (codigo_inventario);

ALTER TABLE public.inventario_historial DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.inventario_historial ADD CONSTRAINT undefined CHECK (((tipo_evento)::text = ANY ((ARRAY['asignacion'::character varying, 'devolucion'::character varying, 'reparacion'::character varying, 'cambio_estado'::character varying, 'baja'::character varying, 'creacion'::character varying, 'observacion'::character varying, 'intercambio'::character varying, 'renovacion'::character varying])::text[])));

ALTER TABLE public.inventario_historial DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.inventario_historial ADD CONSTRAINT undefined FOREIGN KEY (usuario_id) REFERENCES auth.users(id);

ALTER TABLE public.inventario_historial DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.inventario_historial ADD CONSTRAINT undefined FOREIGN KEY (activo_id) REFERENCES inventario_activos(id) ON DELETE CASCADE;

ALTER TABLE public.inventario_historial DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.inventario_historial ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.inventario_materiales DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.inventario_materiales ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.inventario_reparaciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.inventario_reparaciones ADD CONSTRAINT undefined CHECK ((costo_real >= (0)::numeric));

ALTER TABLE public.inventario_reparaciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.inventario_reparaciones ADD CONSTRAINT undefined CHECK (((estado)::text = ANY ((ARRAY['recibido'::character varying, 'en_reparacion'::character varying, 'finalizado'::character varying, 'entregado'::character varying])::text[])));

ALTER TABLE public.inventario_reparaciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.inventario_reparaciones ADD CONSTRAINT undefined CHECK ((costo_estimado >= (0)::numeric));

ALTER TABLE public.inventario_reparaciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.inventario_reparaciones ADD CONSTRAINT undefined CHECK (((tipo_tallerista)::text = ANY ((ARRAY['externo'::character varying, 'luthier_interno'::character varying])::text[])));

ALTER TABLE public.inventario_reparaciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.inventario_reparaciones ADD CONSTRAINT undefined FOREIGN KEY (activo_id) REFERENCES inventario_activos(id) ON DELETE RESTRICT;

ALTER TABLE public.inventario_reparaciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.inventario_reparaciones ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.justificaciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.justificaciones ADD CONSTRAINT undefined CHECK (((categoria IS NULL) OR (categoria = ANY (ARRAY['medica'::text, 'familiar'::text, 'academica'::text, 'institucional'::text, 'religiosa'::text, 'transporte'::text, 'otra'::text]))));

ALTER TABLE public.justificaciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.justificaciones ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['pendiente'::text, 'aprobado'::text, 'rechazado'::text])));

ALTER TABLE public.justificaciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.justificaciones ADD CONSTRAINT undefined FOREIGN KEY (creado_por) REFERENCES maestros(id);

ALTER TABLE public.justificaciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.justificaciones ADD CONSTRAINT undefined FOREIGN KEY (sesion_id) REFERENCES sesiones_clase(id) ON DELETE CASCADE;

ALTER TABLE public.justificaciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.justificaciones ADD CONSTRAINT undefined FOREIGN KEY (revisado_por) REFERENCES maestros(id);

ALTER TABLE public.justificaciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.justificaciones ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.justificaciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.justificaciones ADD CONSTRAINT undefined UNIQUE (sesion_id, alumno_id);

ALTER TABLE public.levels DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.levels ADD CONSTRAINT undefined FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE CASCADE;

ALTER TABLE public.levels DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.levels ADD CONSTRAINT undefined FOREIGN KEY (route_version_id) REFERENCES route_versions(id) ON DELETE CASCADE;

ALTER TABLE public.levels DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.levels ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.levels DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.levels ADD CONSTRAINT undefined UNIQUE (route_version_id, level_number);

ALTER TABLE public.logros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.logros ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.logros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.logros ADD CONSTRAINT undefined UNIQUE (nombre);

ALTER TABLE public.lut_diagnosticos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.lut_diagnosticos ADD CONSTRAINT undefined CHECK ((gravedad = ANY (ARRAY['leve'::text, 'moderada'::text, 'grave'::text, 'critica'::text])));

ALTER TABLE public.lut_diagnosticos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.lut_diagnosticos ADD CONSTRAINT undefined FOREIGN KEY (orden_id) REFERENCES lut_ordenes_reparacion(id) ON DELETE CASCADE;

ALTER TABLE public.lut_diagnosticos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.lut_diagnosticos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.lut_evidencias DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.lut_evidencias ADD CONSTRAINT undefined CHECK ((tipo = ANY (ARRAY['foto_antes'::text, 'foto_durante'::text, 'foto_despues'::text, 'documento'::text, 'video'::text, 'factura'::text, 'informe'::text])));

ALTER TABLE public.lut_evidencias DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.lut_evidencias ADD CONSTRAINT undefined CHECK ((visibilidad = ANY (ARRAY['interno'::text, 'finanzas'::text, 'representante'::text, 'publico'::text])));

ALTER TABLE public.lut_evidencias DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.lut_evidencias ADD CONSTRAINT undefined FOREIGN KEY (orden_id) REFERENCES lut_ordenes_reparacion(id) ON DELETE CASCADE;

ALTER TABLE public.lut_evidencias DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.lut_evidencias ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.lut_insumos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.lut_insumos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.lut_movimientos_insumos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.lut_movimientos_insumos ADD CONSTRAINT undefined CHECK ((tipo_movimiento = ANY (ARRAY['entrada'::text, 'consumo'::text, 'ajuste'::text, 'devolucion'::text, 'perdida'::text])));

ALTER TABLE public.lut_movimientos_insumos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.lut_movimientos_insumos ADD CONSTRAINT undefined FOREIGN KEY (orden_id) REFERENCES lut_ordenes_reparacion(id) ON DELETE SET NULL;

ALTER TABLE public.lut_movimientos_insumos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.lut_movimientos_insumos ADD CONSTRAINT undefined FOREIGN KEY (insumo_id) REFERENCES lut_insumos(id) ON DELETE RESTRICT;

ALTER TABLE public.lut_movimientos_insumos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.lut_movimientos_insumos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.lut_ordenes_reparacion DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.lut_ordenes_reparacion ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['reportado'::text, 'recibido'::text, 'pendiente_diagnostico'::text, 'diagnosticado'::text, 'presupuesto_pendiente'::text, 'esperando_aprobacion'::text, 'esperando_insumos'::text, 'en_reparacion'::text, 'en_prueba'::text, 'listo_entrega'::text, 'entregado'::text, 'cerrado'::text, 'cancelado'::text])));

ALTER TABLE public.lut_ordenes_reparacion DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.lut_ordenes_reparacion ADD CONSTRAINT undefined CHECK ((gravedad = ANY (ARRAY['leve'::text, 'moderada'::text, 'grave'::text, 'critica'::text])));

ALTER TABLE public.lut_ordenes_reparacion DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.lut_ordenes_reparacion ADD CONSTRAINT undefined CHECK ((prioridad = ANY (ARRAY['baja'::text, 'media'::text, 'alta'::text, 'critica'::text])));

ALTER TABLE public.lut_ordenes_reparacion DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.lut_ordenes_reparacion ADD CONSTRAINT undefined FOREIGN KEY (instrumento_id) REFERENCES inventario_activos(id);

ALTER TABLE public.lut_ordenes_reparacion DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.lut_ordenes_reparacion ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.lut_presupuestos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.lut_presupuestos ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['borrador'::text, 'enviado'::text, 'aprobado'::text, 'rechazado'::text, 'cubierto_institucion'::text])));

ALTER TABLE public.lut_presupuestos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.lut_presupuestos ADD CONSTRAINT undefined FOREIGN KEY (orden_id) REFERENCES lut_ordenes_reparacion(id) ON DELETE CASCADE;

ALTER TABLE public.lut_presupuestos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.lut_presupuestos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.lut_solicitudes_compra DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.lut_solicitudes_compra ADD CONSTRAINT undefined CHECK ((urgencia = ANY (ARRAY['baja'::text, 'media'::text, 'alta'::text, 'critica'::text])));

ALTER TABLE public.lut_solicitudes_compra DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.lut_solicitudes_compra ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['pendiente'::text, 'aprobada'::text, 'rechazada'::text, 'comprada'::text, 'cancelada'::text])));

ALTER TABLE public.lut_solicitudes_compra DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.lut_solicitudes_compra ADD CONSTRAINT undefined FOREIGN KEY (orden_id) REFERENCES lut_ordenes_reparacion(id) ON DELETE SET NULL;

ALTER TABLE public.lut_solicitudes_compra DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.lut_solicitudes_compra ADD CONSTRAINT undefined FOREIGN KEY (insumo_id) REFERENCES lut_insumos(id) ON DELETE SET NULL;

ALTER TABLE public.lut_solicitudes_compra DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.lut_solicitudes_compra ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.maestro_access_credentials DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestro_access_credentials ADD CONSTRAINT undefined FOREIGN KEY (last_revealed_by) REFERENCES profiles(id);

ALTER TABLE public.maestro_access_credentials DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestro_access_credentials ADD CONSTRAINT undefined FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE;

ALTER TABLE public.maestro_access_credentials DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestro_access_credentials ADD CONSTRAINT undefined PRIMARY KEY (maestro_id);

ALTER TABLE public.maestro_desempeno DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestro_desempeno ADD CONSTRAINT undefined CHECK ((tendencia = ANY (ARRAY['mejorando'::text, 'estable'::text, 'empeorando'::text])));

ALTER TABLE public.maestro_desempeno DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestro_desempeno ADD CONSTRAINT undefined CHECK ((categoria = ANY (ARRAY['responsable'::text, 'regular'::text, 'incumplidor'::text, 'negligente'::text])));

ALTER TABLE public.maestro_desempeno DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestro_desempeno ADD CONSTRAINT undefined FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE;

ALTER TABLE public.maestro_desempeno DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestro_desempeno ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.maestro_desempeno DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestro_desempeno ADD CONSTRAINT undefined UNIQUE (maestro_id);

ALTER TABLE public.maestro_indicadores DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestro_indicadores ADD CONSTRAINT undefined CHECK ((orden >= 0));

ALTER TABLE public.maestro_indicadores DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestro_indicadores ADD CONSTRAINT undefined FOREIGN KEY (objetivo_id) REFERENCES maestro_objetivos(id) ON DELETE CASCADE;

ALTER TABLE public.maestro_indicadores DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestro_indicadores ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.maestro_objetivos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestro_objetivos ADD CONSTRAINT undefined CHECK ((orden >= 0));

ALTER TABLE public.maestro_objetivos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestro_objetivos ADD CONSTRAINT undefined FOREIGN KEY (unidad_id) REFERENCES maestro_unidades(id) ON DELETE CASCADE;

ALTER TABLE public.maestro_objetivos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestro_objetivos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.maestro_retiros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestro_retiros ADD CONSTRAINT undefined FOREIGN KEY (reemplazo_maestro_id) REFERENCES maestros(id) ON DELETE SET NULL;

ALTER TABLE public.maestro_retiros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestro_retiros ADD CONSTRAINT undefined FOREIGN KEY (retirado_por) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE public.maestro_retiros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestro_retiros ADD CONSTRAINT undefined FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE RESTRICT;

ALTER TABLE public.maestro_retiros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestro_retiros ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.maestro_routes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestro_routes ADD CONSTRAINT undefined FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE;

ALTER TABLE public.maestro_routes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestro_routes ADD CONSTRAINT undefined FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE;

ALTER TABLE public.maestro_routes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestro_routes ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.maestro_routes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestro_routes ADD CONSTRAINT undefined UNIQUE (maestro_id, clase_id);

ALTER TABLE public.maestro_tareas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestro_tareas ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE;

ALTER TABLE public.maestro_tareas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestro_tareas ADD CONSTRAINT undefined FOREIGN KEY (sesion_id) REFERENCES sesiones_clase(id) ON DELETE SET NULL;

ALTER TABLE public.maestro_tareas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestro_tareas ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.maestro_unidades DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestro_unidades ADD CONSTRAINT undefined CHECK ((orden >= 0));

ALTER TABLE public.maestro_unidades DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestro_unidades ADD CONSTRAINT undefined FOREIGN KEY (ruta_id) REFERENCES maestro_routes(id) ON DELETE CASCADE;

ALTER TABLE public.maestro_unidades DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestro_unidades ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestros ADD CONSTRAINT undefined CHECK ((tipo_maestro = ANY (ARRAY['catedra'::text, 'orquesta'::text, 'coro'::text, 'preparatoria'::text, 'monitor'::text, 'suplente'::text, 'direccion'::text, 'otro'::text])));

ALTER TABLE public.maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestros ADD CONSTRAINT undefined FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE public.maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestros ADD CONSTRAINT undefined FOREIGN KEY (retirado_por) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE public.maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestros ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestros ADD CONSTRAINT undefined UNIQUE (correo);

ALTER TABLE public.maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.maestros ADD CONSTRAINT undefined UNIQUE (user_id);

ALTER TABLE public.mapa_plantillas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.mapa_plantillas ADD CONSTRAINT undefined FOREIGN KEY (route_version_id) REFERENCES route_versions(id) ON DELETE RESTRICT;

ALTER TABLE public.mapa_plantillas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.mapa_plantillas ADD CONSTRAINT undefined FOREIGN KEY (publicada_por) REFERENCES maestros(id);

ALTER TABLE public.mapa_plantillas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.mapa_plantillas ADD CONSTRAINT undefined FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE;

ALTER TABLE public.mapa_plantillas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.mapa_plantillas ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.mapa_plantillas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.mapa_plantillas ADD CONSTRAINT undefined UNIQUE (route_version_id, level_id);

ALTER TABLE public.minutas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.minutas ADD CONSTRAINT undefined FOREIGN KEY (creado_por) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.minutas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.minutas ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.modulos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.modulos ADD CONSTRAINT undefined CHECK ((orden > 0));

ALTER TABLE public.modulos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.modulos ADD CONSTRAINT undefined CHECK (((duracion_estimada_semanas IS NULL) OR (duracion_estimada_semanas > 0)));

ALTER TABLE public.modulos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.modulos ADD CONSTRAINT undefined CHECK (((porcentaje_aprobacion >= (0)::numeric) AND (porcentaje_aprobacion <= (100)::numeric)));

ALTER TABLE public.modulos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.modulos ADD CONSTRAINT undefined FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE CASCADE;

ALTER TABLE public.modulos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.modulos ADD CONSTRAINT undefined FOREIGN KEY (requisito_modulo_id) REFERENCES modulos(id) ON DELETE SET NULL;

ALTER TABLE public.modulos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.modulos ADD CONSTRAINT undefined FOREIGN KEY (nivel_id) REFERENCES niveles(id) ON DELETE CASCADE;

ALTER TABLE public.modulos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.modulos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.modulos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.modulos ADD CONSTRAINT undefined UNIQUE (nivel_id, orden);

ALTER TABLE public.modulos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.modulos ADD CONSTRAINT undefined UNIQUE (nivel_id, nombre);

ALTER TABLE public.niveles DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.niveles ADD CONSTRAINT undefined CHECK (((duracion_estimada_meses IS NULL) OR (duracion_estimada_meses > 0)));

ALTER TABLE public.niveles DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.niveles ADD CONSTRAINT undefined CHECK ((orden > 0));

ALTER TABLE public.niveles DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.niveles ADD CONSTRAINT undefined FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE CASCADE;

ALTER TABLE public.niveles DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.niveles ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.niveles DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.niveles ADD CONSTRAINT undefined UNIQUE (programa_id, nombre);

ALTER TABLE public.niveles DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.niveles ADD CONSTRAINT undefined UNIQUE (programa_id, orden);

ALTER TABLE public.node_resources DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.node_resources ADD CONSTRAINT undefined CHECK ((resource_type = ANY (ARRAY['video'::text, 'pdf'::text, 'exercise_text'::text, 'link'::text])));

ALTER TABLE public.node_resources DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.node_resources ADD CONSTRAINT undefined FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE;

ALTER TABLE public.node_resources DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.node_resources ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.nodes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.nodes ADD CONSTRAINT undefined FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE;

ALTER TABLE public.nodes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.nodes ADD CONSTRAINT undefined FOREIGN KEY (route_version_id) REFERENCES route_versions(id) ON DELETE CASCADE;

ALTER TABLE public.nodes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.nodes ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.notificaciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.notificaciones ADD CONSTRAINT undefined CHECK (((deep_link IS NULL) OR (deep_link ~ '^/[a-zA-Z0-9/_-]+$'::text)));

ALTER TABLE public.notificaciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.notificaciones ADD CONSTRAINT undefined CHECK ((tipo = ANY (ARRAY['in_app'::text, 'push'::text, 'email'::text, 'sistema'::text, 'recordatorio_clase'::text])));

ALTER TABLE public.notificaciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.notificaciones ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['pendiente'::text, 'enviada'::text, 'leida'::text, 'fallida'::text])));

ALTER TABLE public.notificaciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.notificaciones ADD CONSTRAINT undefined FOREIGN KEY (registro_pendiente_id) REFERENCES registros_pendientes(id) ON DELETE SET NULL;

ALTER TABLE public.notificaciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.notificaciones ADD CONSTRAINT undefined FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE public.notificaciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.notificaciones ADD CONSTRAINT undefined FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE;

ALTER TABLE public.notificaciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.notificaciones ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.notificaciones_asistencia DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.notificaciones_asistencia ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['pendiente'::text, 'enviado'::text, 'fallido'::text, 'entregado'::text, 'leido'::text])));

ALTER TABLE public.notificaciones_asistencia DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.notificaciones_asistencia ADD CONSTRAINT undefined CHECK ((canal = ANY (ARRAY['whatsapp'::text, 'email'::text, 'ambos'::text])));

ALTER TABLE public.notificaciones_asistencia DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.notificaciones_asistencia ADD CONSTRAINT undefined CHECK ((prioridad = ANY (ARRAY['baja'::text, 'normal'::text, 'alta'::text, 'urgente'::text])));

ALTER TABLE public.notificaciones_asistencia DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.notificaciones_asistencia ADD CONSTRAINT undefined CHECK ((tipo = ANY (ARRAY['alerta_asistencia_alumno'::text, 'recordatorio_asistencia_maestro'::text, 'reporte_asistencia_semanal'::text])));

ALTER TABLE public.notificaciones_asistencia DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.notificaciones_asistencia ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.notificaciones_caja DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.notificaciones_caja ADD CONSTRAINT undefined FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT;

ALTER TABLE public.notificaciones_caja DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.notificaciones_caja ADD CONSTRAINT undefined FOREIGN KEY (representante_id) REFERENCES representantes(id) ON DELETE SET NULL;

ALTER TABLE public.notificaciones_caja DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.notificaciones_caja ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL;

ALTER TABLE public.notificaciones_caja DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.notificaciones_caja ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.notification_trigger_logs DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.notification_trigger_logs ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.objetivos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.objetivos ADD CONSTRAINT undefined FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE;

ALTER TABLE public.objetivos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.objetivos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.objetivos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.objetivos ADD CONSTRAINT undefined UNIQUE (node_id, order_index);

ALTER TABLE public.observaciones_alumnos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.observaciones_alumnos ADD CONSTRAINT undefined CHECK ((tipo = ANY (ARRAY['academica'::text, 'conductual'::text, 'asistencia'::text, 'tecnica'::text, 'motivacional'::text, 'administrativa'::text, 'otra'::text])));

ALTER TABLE public.observaciones_alumnos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.observaciones_alumnos ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE;

ALTER TABLE public.observaciones_alumnos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.observaciones_alumnos ADD CONSTRAINT undefined FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE SET NULL;

ALTER TABLE public.observaciones_alumnos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.observaciones_alumnos ADD CONSTRAINT undefined FOREIGN KEY (sesion_clase_id) REFERENCES sesiones_clase(id) ON DELETE SET NULL;

ALTER TABLE public.observaciones_alumnos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.observaciones_alumnos ADD CONSTRAINT undefined FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE SET NULL;

ALTER TABLE public.observaciones_alumnos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.observaciones_alumnos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.observaciones_sesion DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.observaciones_sesion ADD CONSTRAINT undefined FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE;

ALTER TABLE public.observaciones_sesion DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.observaciones_sesion ADD CONSTRAINT undefined FOREIGN KEY (sesion_id) REFERENCES sesiones_clase(id) ON DELETE CASCADE;

ALTER TABLE public.observaciones_sesion DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.observaciones_sesion ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.pagos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.pagos ADD CONSTRAINT undefined CHECK (((monto_centavos)::numeric > (0)::numeric));

ALTER TABLE public.pagos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.pagos ADD CONSTRAINT undefined FOREIGN KEY (cajero_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.pagos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.pagos ADD CONSTRAINT undefined FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT;

ALTER TABLE public.pagos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.pagos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.pagos_alumnos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.pagos_alumnos ADD CONSTRAINT undefined CHECK (((concepto)::text = ANY ((ARRAY['mensualidad'::character varying, 'inscripcion'::character varying, 'uniforme'::character varying, 'otro'::character varying])::text[])));

ALTER TABLE public.pagos_alumnos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.pagos_alumnos ADD CONSTRAINT undefined CHECK (((metodo_pago)::text = ANY ((ARRAY['efectivo'::character varying, 'transferencia'::character varying, 'deposito'::character varying, 'beca'::character varying])::text[])));

ALTER TABLE public.pagos_alumnos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.pagos_alumnos ADD CONSTRAINT undefined CHECK ((monto > (0)::numeric));

ALTER TABLE public.pagos_alumnos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.pagos_alumnos ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE RESTRICT;

ALTER TABLE public.pagos_alumnos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.pagos_alumnos ADD CONSTRAINT undefined FOREIGN KEY (registrado_por) REFERENCES auth.users(id);

ALTER TABLE public.pagos_alumnos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.pagos_alumnos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.patrocinantes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.patrocinantes ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.patrocinios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.patrocinios ADD CONSTRAINT undefined FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT;

ALTER TABLE public.patrocinios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.patrocinios ADD CONSTRAINT undefined FOREIGN KEY (patrocinante_id) REFERENCES patrocinantes(id) ON DELETE RESTRICT;

ALTER TABLE public.patrocinios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.patrocinios ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE RESTRICT;

ALTER TABLE public.patrocinios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.patrocinios ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.periodo_excepciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.periodo_excepciones ADD CONSTRAINT undefined CHECK ((tipo = ANY (ARRAY['feriado'::text, 'receso'::text, 'suspension'::text, 'institucional'::text, 'otro'::text])));

ALTER TABLE public.periodo_excepciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.periodo_excepciones ADD CONSTRAINT undefined CHECK ((fecha_fin >= fecha_inicio));

ALTER TABLE public.periodo_excepciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.periodo_excepciones ADD CONSTRAINT undefined FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE CASCADE;

ALTER TABLE public.periodo_excepciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.periodo_excepciones ADD CONSTRAINT undefined FOREIGN KEY (creado_por) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE public.periodo_excepciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.periodo_excepciones ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.periodos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.periodos ADD CONSTRAINT undefined CHECK ((fecha_fin > fecha_inicio));

ALTER TABLE public.periodos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.periodos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.periodos_cierre_auditoria DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.periodos_cierre_auditoria ADD CONSTRAINT undefined FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE CASCADE;

ALTER TABLE public.periodos_cierre_auditoria DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.periodos_cierre_auditoria ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.permisos_maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.permisos_maestros ADD CONSTRAINT undefined FOREIGN KEY (concedido_por) REFERENCES auth.users(id);

ALTER TABLE public.permisos_maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.permisos_maestros ADD CONSTRAINT undefined FOREIGN KEY (maestro_id) REFERENCES maestros(id);

ALTER TABLE public.permisos_maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.permisos_maestros ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.permisos_maestros DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.permisos_maestros ADD CONSTRAINT undefined UNIQUE (maestro_id);

ALTER TABLE public.plan_clases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.plan_clases ADD CONSTRAINT undefined FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE SET NULL;

ALTER TABLE public.plan_clases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.plan_clases ADD CONSTRAINT undefined FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE;

ALTER TABLE public.plan_clases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.plan_clases ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.plan_indicadores DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.plan_indicadores ADD CONSTRAINT undefined FOREIGN KEY (objetivo_id) REFERENCES plan_objetivos(id) ON DELETE CASCADE;

ALTER TABLE public.plan_indicadores DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.plan_indicadores ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.plan_niveles DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.plan_niveles ADD CONSTRAINT undefined FOREIGN KEY (clase_id) REFERENCES plan_clases(id) ON DELETE CASCADE;

ALTER TABLE public.plan_niveles DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.plan_niveles ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.plan_objetivos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.plan_objetivos ADD CONSTRAINT undefined FOREIGN KEY (tema_id) REFERENCES plan_temas(id) ON DELETE CASCADE;

ALTER TABLE public.plan_objetivos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.plan_objetivos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.plan_temas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.plan_temas ADD CONSTRAINT undefined FOREIGN KEY (nivel_id) REFERENCES plan_niveles(id) ON DELETE CASCADE;

ALTER TABLE public.plan_temas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.plan_temas ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.planificaciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.planificaciones ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['borrador'::text, 'activa'::text, 'cerrada'::text, 'archivada'::text])));

ALTER TABLE public.planificaciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.planificaciones ADD CONSTRAINT undefined CHECK (((fecha_fin IS NULL) OR (fecha_fin >= fecha_inicio)));

ALTER TABLE public.planificaciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.planificaciones ADD CONSTRAINT undefined FOREIGN KEY (nivel_id) REFERENCES niveles(id) ON DELETE SET NULL;

ALTER TABLE public.planificaciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.planificaciones ADD CONSTRAINT undefined FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE;

ALTER TABLE public.planificaciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.planificaciones ADD CONSTRAINT undefined FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE RESTRICT;

ALTER TABLE public.planificaciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.planificaciones ADD CONSTRAINT undefined FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE SET NULL;

ALTER TABLE public.planificaciones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.planificaciones ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.planned_content DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.planned_content ADD CONSTRAINT undefined FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE;

ALTER TABLE public.planned_content DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.planned_content ADD CONSTRAINT undefined FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE;

ALTER TABLE public.planned_content DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.planned_content ADD CONSTRAINT undefined FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE;

ALTER TABLE public.planned_content DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.planned_content ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.planned_content DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.planned_content ADD CONSTRAINT undefined UNIQUE (maestro_id, clase_id, node_id, planned_date);

ALTER TABLE public.planning_documents DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.planning_documents ADD CONSTRAINT undefined FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE;

ALTER TABLE public.planning_documents DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.planning_documents ADD CONSTRAINT undefined FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE SET NULL;

ALTER TABLE public.planning_documents DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.planning_documents ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.plantillas_planificacion DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.plantillas_planificacion ADD CONSTRAINT undefined FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE SET NULL;

ALTER TABLE public.plantillas_planificacion DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.plantillas_planificacion ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.portal_catalog DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.portal_catalog ADD CONSTRAINT undefined PRIMARY KEY (portal_id);

ALTER TABLE public.postulantes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.postulantes ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id);

ALTER TABLE public.postulantes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.postulantes ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.postulantes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.postulantes ADD CONSTRAINT undefined UNIQUE (correo, nombre_completo);

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.profiles ADD CONSTRAINT undefined CHECK ((email ~* '^[^@]+@[^@]+\.[^@]+$'::text));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.profiles ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['pendiente'::text, 'activo'::text, 'rechazado'::text])));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.profiles ADD CONSTRAINT undefined CHECK ((rol = ANY (ARRAY['superadmin'::text, 'admin'::text, 'direccion'::text, 'coordinacion_academica'::text, 'maestro'::text, 'monitor'::text, 'finanzas'::text, 'operaciones'::text, 'representante'::text, 'alumno'::text, 'jurado'::text, 'user'::text])));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.profiles ADD CONSTRAINT undefined FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.profiles ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.programas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.programas ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.programas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.programas ADD CONSTRAINT undefined UNIQUE (codigo);

ALTER TABLE public.programas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.programas ADD CONSTRAINT undefined UNIQUE (nombre);

ALTER TABLE public.programas_prerrequisitos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.programas_prerrequisitos ADD CONSTRAINT undefined CHECK ((tipo = ANY (ARRAY['seleccion'::text, 'audicion'::text, 'recomendacion'::text])));

ALTER TABLE public.programas_prerrequisitos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.programas_prerrequisitos ADD CONSTRAINT undefined CHECK (((nota_minima >= (0)::numeric) AND (nota_minima <= (100)::numeric)));

ALTER TABLE public.programas_prerrequisitos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.programas_prerrequisitos ADD CONSTRAINT undefined FOREIGN KEY (prerequisito_id) REFERENCES programas(id) ON DELETE CASCADE;

ALTER TABLE public.programas_prerrequisitos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.programas_prerrequisitos ADD CONSTRAINT undefined FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE CASCADE;

ALTER TABLE public.programas_prerrequisitos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.programas_prerrequisitos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.programas_prerrequisitos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.programas_prerrequisitos ADD CONSTRAINT undefined UNIQUE (programa_id, prerequisito_id);

ALTER TABLE public.progresos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.progresos ADD CONSTRAINT undefined CHECK ((evaluacion_tipo = ANY (ARRAY['clase'::text, 'ejercicio'::text, 'audicion'::text, 'recital'::text, 'examen'::text, 'observacion'::text, 'otro'::text])));

ALTER TABLE public.progresos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.progresos ADD CONSTRAINT undefined CHECK (((calificacion IS NULL) OR ((calificacion >= (0)::numeric) AND (calificacion <= (10)::numeric))));

ALTER TABLE public.progresos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.progresos ADD CONSTRAINT undefined FOREIGN KEY (sesion_clase_id) REFERENCES sesiones_clase(id) ON DELETE SET NULL;

ALTER TABLE public.progresos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.progresos ADD CONSTRAINT undefined FOREIGN KEY (asistencia_id) REFERENCES asistencias(id) ON DELETE SET NULL;

ALTER TABLE public.progresos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.progresos ADD CONSTRAINT undefined FOREIGN KEY (ejercicio_id) REFERENCES ejercicios(id) ON DELETE SET NULL;

ALTER TABLE public.progresos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.progresos ADD CONSTRAINT undefined FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE;

ALTER TABLE public.progresos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.progresos ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE;

ALTER TABLE public.progresos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.progresos ADD CONSTRAINT undefined FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE SET NULL;

ALTER TABLE public.progresos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.progresos ADD CONSTRAINT undefined FOREIGN KEY (periodo_id) REFERENCES periodos(id);

ALTER TABLE public.progresos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.progresos ADD CONSTRAINT undefined FOREIGN KEY (objetivo_id) REFERENCES plan_objetivos(id);

ALTER TABLE public.progresos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.progresos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.progresos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.progresos ADD CONSTRAINT undefined UNIQUE (alumno_id, clase_id, sesion_clase_id, contenido_dsl);

ALTER TABLE public.protocolos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.protocolos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.protocolos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.protocolos ADD CONSTRAINT undefined UNIQUE (nombre);

ALTER TABLE public.pulso_score_history DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.pulso_score_history ADD CONSTRAINT undefined CHECK ((nivel = ANY (ARRAY['optimo'::text, 'atencion'::text, 'critico'::text])));

ALTER TABLE public.pulso_score_history DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.pulso_score_history ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.push_subscriptions DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.push_subscriptions ADD CONSTRAINT undefined FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE public.push_subscriptions DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.push_subscriptions ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.push_subscriptions DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.push_subscriptions ADD CONSTRAINT undefined UNIQUE (endpoint);

ALTER TABLE public.rachas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.rachas ADD CONSTRAINT undefined CHECK ((racha_actual >= 0));

ALTER TABLE public.rachas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.rachas ADD CONSTRAINT undefined CHECK ((racha_maxima >= 0));

ALTER TABLE public.rachas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.rachas ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE;

ALTER TABLE public.rachas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.rachas ADD CONSTRAINT undefined PRIMARY KEY (alumno_id);

ALTER TABLE public.registros_pendientes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.registros_pendientes ADD CONSTRAINT undefined CHECK ((notification_state = ANY (ARRAY['VERDE'::text, 'AMARILLO'::text, 'NARANJA'::text, 'ROJO'::text])));

ALTER TABLE public.registros_pendientes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.registros_pendientes ADD CONSTRAINT undefined CHECK ((tipo = ANY (ARRAY['asistencia_pendiente'::text, 'contenido_pendiente'::text, 'progreso_pendiente'::text, 'sesion_sin_cerrar'::text, 'justificacion_pendiente'::text, 'otro'::text])));

ALTER TABLE public.registros_pendientes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.registros_pendientes ADD CONSTRAINT undefined CHECK ((prioridad = ANY (ARRAY['baja'::text, 'media'::text, 'alta'::text, 'critica'::text])));

ALTER TABLE public.registros_pendientes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.registros_pendientes ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['pendiente'::text, 'visto'::text, 'resuelto'::text, 'cancelado'::text])));

ALTER TABLE public.registros_pendientes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.registros_pendientes ADD CONSTRAINT undefined FOREIGN KEY (sesion_clase_id) REFERENCES sesiones_clase(id) ON DELETE CASCADE;

ALTER TABLE public.registros_pendientes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.registros_pendientes ADD CONSTRAINT undefined FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE;

ALTER TABLE public.registros_pendientes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.registros_pendientes ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.repertoire_items DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.repertoire_items ADD CONSTRAINT undefined FOREIGN KEY (section) REFERENCES sections(id) ON DELETE CASCADE;

ALTER TABLE public.repertoire_items DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.repertoire_items ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.repertoire_items DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.repertoire_items ADD CONSTRAINT undefined UNIQUE (section, title, type);

ALTER TABLE public.representantes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.representantes ADD CONSTRAINT undefined FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.representantes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.representantes ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL;

ALTER TABLE public.representantes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.representantes ADD CONSTRAINT undefined FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT;

ALTER TABLE public.representantes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.representantes ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.retenciones_instrumento DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.retenciones_instrumento ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['retenido'::text, 'levantada'::text])));

ALTER TABLE public.retenciones_instrumento DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.retenciones_instrumento ADD CONSTRAINT undefined FOREIGN KEY (instrumento_id) REFERENCES instrumentos(id) ON DELETE SET NULL;

ALTER TABLE public.retenciones_instrumento DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.retenciones_instrumento ADD CONSTRAINT undefined FOREIGN KEY (levantada_por) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.retenciones_instrumento DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.retenciones_instrumento ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE;

ALTER TABLE public.retenciones_instrumento DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.retenciones_instrumento ADD CONSTRAINT undefined FOREIGN KEY (retenido_por) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.retenciones_instrumento DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.retenciones_instrumento ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.route_versions DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.route_versions ADD CONSTRAINT undefined FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE;

ALTER TABLE public.route_versions DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.route_versions ADD CONSTRAINT undefined FOREIGN KEY (created_by) REFERENCES auth.users(id);

ALTER TABLE public.route_versions DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.route_versions ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.route_versions DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.route_versions ADD CONSTRAINT undefined UNIQUE (route_id, version);

ALTER TABLE public.routes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.routes ADD CONSTRAINT undefined FOREIGN KEY (created_by) REFERENCES auth.users(id);

ALTER TABLE public.routes DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.routes ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.ruta_contenido_objetivos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ruta_contenido_objetivos ADD CONSTRAINT undefined CHECK ((semana_fin >= semana_inicio));

ALTER TABLE public.ruta_contenido_objetivos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ruta_contenido_objetivos ADD CONSTRAINT undefined CHECK ((semana_inicio > 0));

ALTER TABLE public.ruta_contenido_objetivos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ruta_contenido_objetivos ADD CONSTRAINT undefined FOREIGN KEY (objetivo_id) REFERENCES curriculo_objetivos(id) ON DELETE SET NULL;

ALTER TABLE public.ruta_contenido_objetivos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ruta_contenido_objetivos ADD CONSTRAINT undefined FOREIGN KEY (ruta_id) REFERENCES rutas_contenido(id) ON DELETE CASCADE;

ALTER TABLE public.ruta_contenido_objetivos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ruta_contenido_objetivos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.ruta_contenido_objetivos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ruta_contenido_objetivos ADD CONSTRAINT undefined UNIQUE (ruta_id, objetivo_id);

ALTER TABLE public.ruta_contenido_objetivos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.ruta_contenido_objetivos ADD CONSTRAINT undefined UNIQUE (ruta_id, orden);

ALTER TABLE public.rutas_contenido DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.rutas_contenido ADD CONSTRAINT undefined CHECK ((tipo = ANY (ARRAY['soi-estandar'::text, 'maestro-variante'::text])));

ALTER TABLE public.rutas_contenido DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.rutas_contenido ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['activa'::text, 'pendiente'::text, 'aprobada'::text, 'rechazada'::text])));

ALTER TABLE public.rutas_contenido DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.rutas_contenido ADD CONSTRAINT undefined CHECK (((tipo = 'soi-estandar'::text) OR (ruta_base_id IS NOT NULL)));

ALTER TABLE public.rutas_contenido DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.rutas_contenido ADD CONSTRAINT undefined FOREIGN KEY (ruta_base_id) REFERENCES rutas_contenido(id) ON DELETE SET NULL;

ALTER TABLE public.rutas_contenido DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.rutas_contenido ADD CONSTRAINT undefined FOREIGN KEY (creada_por) REFERENCES maestros(id) ON DELETE SET NULL;

ALTER TABLE public.rutas_contenido DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.rutas_contenido ADD CONSTRAINT undefined FOREIGN KEY (aprobada_por) REFERENCES maestros(id) ON DELETE SET NULL;

ALTER TABLE public.rutas_contenido DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.rutas_contenido ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.rutas_contenido DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.rutas_contenido ADD CONSTRAINT undefined UNIQUE (instrumento, nivel, nombre);

ALTER TABLE public.salones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.salones ADD CONSTRAINT undefined FOREIGN KEY (responsable_id) REFERENCES maestros(id);

ALTER TABLE public.salones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.salones ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.salones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.salones ADD CONSTRAINT undefined UNIQUE (nombre);

ALTER TABLE public.salones DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.salones ADD CONSTRAINT undefined UNIQUE (codigo_salon);

ALTER TABLE public.schedule_run_feedback DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.schedule_run_feedback ADD CONSTRAINT undefined CHECK ((tipo = ANY (ARRAY['observacion'::text, 'aprobacion'::text, 'rechazo'::text])));

ALTER TABLE public.schedule_run_feedback DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.schedule_run_feedback ADD CONSTRAINT undefined FOREIGN KEY (run_id) REFERENCES schedule_runs(id) ON DELETE CASCADE;

ALTER TABLE public.schedule_run_feedback DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.schedule_run_feedback ADD CONSTRAINT undefined FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.schedule_run_feedback DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.schedule_run_feedback ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.schedule_runs DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.schedule_runs ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['borrador'::text, 'revision'::text, 'publicado'::text, 'aplicado'::text])));

ALTER TABLE public.schedule_runs DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.schedule_runs ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.score_compromiso DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.score_compromiso ADD CONSTRAINT undefined CHECK ((nivel = ANY (ARRAY['A'::bpchar, 'B'::bpchar, 'C'::bpchar, 'D'::bpchar, 'E'::bpchar])));

ALTER TABLE public.score_compromiso DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.score_compromiso ADD CONSTRAINT undefined CHECK (((score >= (0)::numeric) AND (score <= (100)::numeric)));

ALTER TABLE public.score_compromiso DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.score_compromiso ADD CONSTRAINT undefined FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT;

ALTER TABLE public.score_compromiso DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.score_compromiso ADD CONSTRAINT undefined FOREIGN KEY (representante_id) REFERENCES representantes(id) ON DELETE RESTRICT;

ALTER TABLE public.score_compromiso DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.score_compromiso ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.score_compromiso DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.score_compromiso ADD CONSTRAINT undefined UNIQUE (representante_id, ciclo_mes, ciclo_anio);

ALTER TABLE public.sections DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sections ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.seguimiento_ausencias_reinicio DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.seguimiento_ausencias_reinicio ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE;

ALTER TABLE public.seguimiento_ausencias_reinicio DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.seguimiento_ausencias_reinicio ADD CONSTRAINT undefined FOREIGN KEY (creado_por) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.seguimiento_ausencias_reinicio DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.seguimiento_ausencias_reinicio ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.seguimiento_reglas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.seguimiento_reglas ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.service_account_observations DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.service_account_observations ADD CONSTRAINT undefined CHECK ((last_status = ANY (ARRAY['never'::text, 'success'::text, 'unsupported'::text, 'skipped'::text, 'error'::text])));

ALTER TABLE public.service_account_observations DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.service_account_observations ADD CONSTRAINT undefined FOREIGN KEY (service_account_id) REFERENCES service_accounts(id) ON DELETE CASCADE;

ALTER TABLE public.service_account_observations DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.service_account_observations ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.service_accounts DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.service_accounts ADD CONSTRAINT undefined CHECK ((connector_status = ANY (ARRAY['unconfigured'::text, 'active'::text, 'disabled'::text, 'unsupported'::text])));

ALTER TABLE public.service_accounts DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.service_accounts ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.sesiones_clase DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sesiones_clase ADD CONSTRAINT undefined CHECK (((hora_inicio IS NULL) OR (hora_fin IS NULL) OR (hora_fin > hora_inicio)));

ALTER TABLE public.sesiones_clase DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sesiones_clase ADD CONSTRAINT undefined CHECK (((node_origen IS NULL) OR (node_origen = ANY (ARRAY['explicito'::text, 'derivado'::text, 'manual'::text]))));

ALTER TABLE public.sesiones_clase DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sesiones_clase ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['programada'::text, 'abierta'::text, 'asistencia_registrada'::text, 'progreso_registrado'::text, 'cerrada'::text, 'pendiente'::text, 'atrasada'::text, 'cancelada'::text, 'registrada'::text])));

ALTER TABLE public.sesiones_clase DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sesiones_clase ADD CONSTRAINT undefined CHECK (((node_codigo IS NULL) OR (node_codigo = ANY (ARRAY['ESC'::text, 'ARP'::text, 'MI'::text, 'ARC'::text, 'SON'::text, 'AFI'::text, 'EST'::text, 'REP'::text]))));

ALTER TABLE public.sesiones_clase DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sesiones_clase ADD CONSTRAINT undefined FOREIGN KEY (salon_id) REFERENCES salones(id) ON DELETE SET NULL;

ALTER TABLE public.sesiones_clase DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sesiones_clase ADD CONSTRAINT undefined FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE RESTRICT;

ALTER TABLE public.sesiones_clase DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sesiones_clase ADD CONSTRAINT undefined FOREIGN KEY (horario_id) REFERENCES horarios(id) ON DELETE SET NULL;

ALTER TABLE public.sesiones_clase DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sesiones_clase ADD CONSTRAINT undefined FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE;

ALTER TABLE public.sesiones_clase DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sesiones_clase ADD CONSTRAINT undefined FOREIGN KEY (maestro_auxiliar_id) REFERENCES maestros(id);

ALTER TABLE public.sesiones_clase DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sesiones_clase ADD CONSTRAINT undefined FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE SET NULL;

ALTER TABLE public.sesiones_clase DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sesiones_clase ADD CONSTRAINT undefined FOREIGN KEY (emergente_id) REFERENCES sesiones_clase(id) ON DELETE SET NULL;

ALTER TABLE public.sesiones_clase DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sesiones_clase ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.sesiones_clase DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sesiones_clase ADD CONSTRAINT undefined UNIQUE (clase_id, fecha, hora_inicio);

ALTER TABLE public.sesiones_clase DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sesiones_clase ADD CONSTRAINT undefined UNIQUE (clase_id, fecha, maestro_id);

ALTER TABLE public.signage_media DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.signage_media ADD CONSTRAINT undefined CHECK ((tipo = ANY (ARRAY['imagen'::text, 'video'::text, 'youtube'::text, 'slide'::text])));

ALTER TABLE public.signage_media DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.signage_media ADD CONSTRAINT undefined CHECK ((((tipo = 'youtube'::text) AND (youtube_url IS NOT NULL)) OR ((tipo = ANY (ARRAY['imagen'::text, 'video'::text])) AND (storage_path IS NOT NULL)) OR ((tipo = 'slide'::text) AND (contenido IS NOT NULL))));

ALTER TABLE public.signage_media DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.signage_media ADD CONSTRAINT undefined FOREIGN KEY (pantalla_id) REFERENCES signage_pantallas(id) ON DELETE CASCADE;

ALTER TABLE public.signage_media DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.signage_media ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.signage_pantallas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.signage_pantallas ADD CONSTRAINT undefined CHECK ((orientacion = ANY (ARRAY['horizontal'::text, 'vertical'::text])));

ALTER TABLE public.signage_pantallas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.signage_pantallas ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.signage_pantallas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.signage_pantallas ADD CONSTRAINT undefined UNIQUE (slug);

ALTER TABLE public.sim_actores DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sim_actores ADD CONSTRAINT undefined FOREIGN KEY (run_id) REFERENCES sim_runs(id) ON DELETE CASCADE;

ALTER TABLE public.sim_actores DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sim_actores ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.sim_calendario DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sim_calendario ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['programado'::text, 'en_curso'::text, 'completado'::text, 'cancelado'::text])));

ALTER TABLE public.sim_calendario DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sim_calendario ADD CONSTRAINT undefined FOREIGN KEY (run_id) REFERENCES sim_runs(id) ON DELETE CASCADE;

ALTER TABLE public.sim_calendario DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sim_calendario ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.sim_config DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sim_config ADD CONSTRAINT undefined CHECK ((proveedor_llm = ANY (ARRAY['groq'::text, 'openrouter'::text])));

ALTER TABLE public.sim_config DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sim_config ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.sim_config DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sim_config ADD CONSTRAINT undefined UNIQUE (canal);

ALTER TABLE public.sim_log DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sim_log ADD CONSTRAINT undefined FOREIGN KEY (evento_id) REFERENCES sim_calendario(id) ON DELETE SET NULL;

ALTER TABLE public.sim_log DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sim_log ADD CONSTRAINT undefined FOREIGN KEY (run_id) REFERENCES sim_runs(id) ON DELETE CASCADE;

ALTER TABLE public.sim_log DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sim_log ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.sim_outbox DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sim_outbox ADD CONSTRAINT undefined FOREIGN KEY (run_id) REFERENCES sim_runs(id) ON DELETE CASCADE;

ALTER TABLE public.sim_outbox DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sim_outbox ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.sim_runs DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sim_runs ADD CONSTRAINT undefined CHECK ((velocidad > 0));

ALTER TABLE public.sim_runs DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sim_runs ADD CONSTRAINT undefined FOREIGN KEY (creado_por) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.sim_runs DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sim_runs ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.sim_tareas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sim_tareas ADD CONSTRAINT undefined FOREIGN KEY (run_id) REFERENCES sim_runs(id) ON DELETE CASCADE;

ALTER TABLE public.sim_tareas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sim_tareas ADD CONSTRAINT undefined FOREIGN KEY (event_id) REFERENCES sim_calendario(id) ON DELETE CASCADE;

ALTER TABLE public.sim_tareas DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.sim_tareas ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.soi_analisis_semanal DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.soi_analisis_semanal ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.soi_event_bus DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.soi_event_bus ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.soi_eventos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.soi_eventos ADD CONSTRAINT undefined CHECK ((tipo = ANY (ARRAY['sesion.creada'::text, 'sesion.completada'::text, 'sesion.cancelada'::text, 'asistencia.registrada'::text, 'asistencia.falta_injustificada'::text, 'asistencia.falta_justificada'::text, 'tarea.creada'::text, 'tarea.completada'::text, 'tarea.escalada'::text, 'tarea.vencida'::text, 'justificacion.solicitada'::text, 'justificacion.aprobada'::text, 'justificacion.rechazada'::text, 'periodo.abierto'::text, 'periodo.cerrado'::text])));

ALTER TABLE public.soi_eventos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.soi_eventos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.soi_process_contracts DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.soi_process_contracts ADD CONSTRAINT undefined CHECK ((automation_status = ANY (ARRAY['manual'::text, 'semi_auto'::text, 'automated'::text, 'deprecated'::text])));

ALTER TABLE public.soi_process_contracts DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.soi_process_contracts ADD CONSTRAINT undefined CHECK ((trigger_type = ANY (ARRAY['manual'::text, 'event'::text, 'scheduled'::text, 'data_driven'::text, 'conversation'::text])));

ALTER TABLE public.soi_process_contracts DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.soi_process_contracts ADD CONSTRAINT undefined CHECK ((recurrence_count >= 0));

ALTER TABLE public.soi_process_contracts DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.soi_process_contracts ADD CONSTRAINT undefined PRIMARY KEY (process_code);

ALTER TABLE public.soi_rule_effectiveness DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.soi_rule_effectiveness ADD CONSTRAINT undefined PRIMARY KEY (rule_type);

ALTER TABLE public.solicitudes_ausencia DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.solicitudes_ausencia ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['pendiente'::text, 'aprobada'::text, 'rechazada'::text])));

ALTER TABLE public.solicitudes_ausencia DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.solicitudes_ausencia ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.solicitudes_necesidades DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.solicitudes_necesidades ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['pendiente'::text, 'pre_aprobada_acm'::text, 'rechazada_acm'::text, 'en_presupuesto'::text, 'presupuestada'::text, 'aprobada'::text, 'rechazada'::text, 'comprada'::text, 'entregada'::text, 'cancelada'::text])));

ALTER TABLE public.solicitudes_necesidades DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.solicitudes_necesidades ADD CONSTRAINT undefined CHECK ((prioridad = ANY (ARRAY['baja'::text, 'media'::text, 'alta'::text, 'urgente'::text])));

ALTER TABLE public.solicitudes_necesidades DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.solicitudes_necesidades ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.solicitudes_permisos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.solicitudes_permisos ADD CONSTRAINT undefined FOREIGN KEY (aprobado_por) REFERENCES auth.users(id);

ALTER TABLE public.solicitudes_permisos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.solicitudes_permisos ADD CONSTRAINT undefined FOREIGN KEY (maestro_id) REFERENCES maestros(id);

ALTER TABLE public.solicitudes_permisos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.solicitudes_permisos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.student_case_actions DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.student_case_actions ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL;

ALTER TABLE public.student_case_actions DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.student_case_actions ADD CONSTRAINT undefined FOREIGN KEY (case_id) REFERENCES student_cases(id) ON DELETE CASCADE;

ALTER TABLE public.student_case_actions DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.student_case_actions ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.student_case_alerts DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.student_case_alerts ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['pendiente'::text, 'revisada'::text, 'convertida_en_caso'::text, 'descartada'::text, 'archivada'::text])));

ALTER TABLE public.student_case_alerts DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.student_case_alerts ADD CONSTRAINT undefined CHECK ((nivel_riesgo = ANY (ARRAY['bajo'::text, 'medio'::text, 'alto'::text, 'critico'::text])));

ALTER TABLE public.student_case_alerts DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.student_case_alerts ADD CONSTRAINT undefined FOREIGN KEY (case_id) REFERENCES student_cases(id) ON DELETE SET NULL;

ALTER TABLE public.student_case_alerts DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.student_case_alerts ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL;

ALTER TABLE public.student_case_alerts DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.student_case_alerts ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.student_case_events DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.student_case_events ADD CONSTRAINT undefined FOREIGN KEY (case_id) REFERENCES student_cases(id) ON DELETE CASCADE;

ALTER TABLE public.student_case_events DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.student_case_events ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.student_cases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.student_cases ADD CONSTRAINT undefined CHECK ((origen = ANY (ARRAY['automatico'::text, 'manual'::text, 'observacion_maestro'::text, 'asistencia'::text, 'justificacion'::text, 'admin'::text])));

ALTER TABLE public.student_cases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.student_cases ADD CONSTRAINT undefined CHECK ((nivel_riesgo = ANY (ARRAY['bajo'::text, 'medio'::text, 'alto'::text, 'critico'::text])));

ALTER TABLE public.student_cases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.student_cases ADD CONSTRAINT undefined CHECK ((estado = ANY (ARRAY['abierto'::text, 'en_seguimiento'::text, 'resuelto'::text, 'escalado'::text, 'archivado'::text])));

ALTER TABLE public.student_cases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.student_cases ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL;

ALTER TABLE public.student_cases DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.student_cases ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.student_indicator_progress DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.student_indicator_progress ADD CONSTRAINT undefined FOREIGN KEY (indicator_id) REFERENCES indicators(id) ON DELETE CASCADE;

ALTER TABLE public.student_indicator_progress DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.student_indicator_progress ADD CONSTRAINT undefined FOREIGN KEY (session_id) REFERENCES teacher_class_sessions(id) ON DELETE SET NULL;

ALTER TABLE public.student_indicator_progress DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.student_indicator_progress ADD CONSTRAINT undefined FOREIGN KEY (student_id) REFERENCES alumnos(id) ON DELETE CASCADE;

ALTER TABLE public.student_indicator_progress DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.student_indicator_progress ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.student_indicator_progress DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.student_indicator_progress ADD CONSTRAINT undefined UNIQUE (student_id, indicator_id);

ALTER TABLE public.system_config DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.system_config ADD CONSTRAINT undefined PRIMARY KEY (key);

ALTER TABLE public.tarea_comentarios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.tarea_comentarios ADD CONSTRAINT undefined FOREIGN KEY (tarea_id) REFERENCES tareas_institucionales(id) ON DELETE CASCADE;

ALTER TABLE public.tarea_comentarios DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.tarea_comentarios ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.tarea_historial DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.tarea_historial ADD CONSTRAINT undefined FOREIGN KEY (tarea_id) REFERENCES tareas_institucionales(id) ON DELETE CASCADE;

ALTER TABLE public.tarea_historial DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.tarea_historial ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.tarea_logs DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.tarea_logs ADD CONSTRAINT undefined FOREIGN KEY (tarea_id) REFERENCES tareas_calendario(id) ON DELETE CASCADE;

ALTER TABLE public.tarea_logs DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.tarea_logs ADD CONSTRAINT undefined FOREIGN KEY (changed_by) REFERENCES auth.users(id) ON DELETE RESTRICT;

ALTER TABLE public.tarea_logs DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.tarea_logs ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.tareas_caja DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.tareas_caja ADD CONSTRAINT undefined FOREIGN KEY (asignado_a) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.tareas_caja DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.tareas_caja ADD CONSTRAINT undefined FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL;

ALTER TABLE public.tareas_caja DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.tareas_caja ADD CONSTRAINT undefined FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE SET NULL;

ALTER TABLE public.tareas_caja DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.tareas_caja ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.tareas_calendario DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.tareas_calendario ADD CONSTRAINT undefined FOREIGN KEY (evento_id) REFERENCES calendario(id) ON DELETE CASCADE;

ALTER TABLE public.tareas_calendario DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.tareas_calendario ADD CONSTRAINT undefined FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE;

ALTER TABLE public.tareas_calendario DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.tareas_calendario ADD CONSTRAINT undefined FOREIGN KEY (asignado_a) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.tareas_calendario DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.tareas_calendario ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.tareas_institucionales DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.tareas_institucionales ADD CONSTRAINT undefined CHECK (((entidad_tipo IS NULL) OR (entidad_tipo = ANY (ARRAY['alumno'::text, 'maestro'::text, 'postulante'::text, 'representante'::text, 'instrumento'::text, 'evento'::text, 'otro'::text]))));

ALTER TABLE public.tareas_institucionales DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.tareas_institucionales ADD CONSTRAINT undefined FOREIGN KEY (depende_de_tarea_id) REFERENCES tareas_institucionales(id) ON DELETE SET NULL;

ALTER TABLE public.tareas_institucionales DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.tareas_institucionales ADD CONSTRAINT undefined FOREIGN KEY (process_code) REFERENCES soi_process_contracts(process_code) ON UPDATE CASCADE;

ALTER TABLE public.tareas_institucionales DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.tareas_institucionales ADD CONSTRAINT undefined FOREIGN KEY (minuta_id) REFERENCES minutas(id) ON DELETE SET NULL;

ALTER TABLE public.tareas_institucionales DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.tareas_institucionales ADD CONSTRAINT undefined FOREIGN KEY (event_id) REFERENCES calendario_institucional(id) ON DELETE CASCADE;

ALTER TABLE public.tareas_institucionales DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.tareas_institucionales ADD CONSTRAINT undefined FOREIGN KEY (dependencia_tarea_id) REFERENCES tareas_institucionales(id) ON DELETE SET NULL;

ALTER TABLE public.tareas_institucionales DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.tareas_institucionales ADD CONSTRAINT undefined FOREIGN KEY (source_event_id) REFERENCES soi_eventos(id) ON DELETE SET NULL;

ALTER TABLE public.tareas_institucionales DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.tareas_institucionales ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.teacher_class_sessions DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.teacher_class_sessions ADD CONSTRAINT undefined CHECK ((status = ANY (ARRAY['draft'::text, 'started'::text, 'completed'::text, 'cancelled'::text])));

ALTER TABLE public.teacher_class_sessions DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.teacher_class_sessions ADD CONSTRAINT undefined FOREIGN KEY (teacher_id) REFERENCES maestros(id) ON DELETE SET NULL;

ALTER TABLE public.teacher_class_sessions DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.teacher_class_sessions ADD CONSTRAINT undefined FOREIGN KEY (group_id) REFERENCES clases(id) ON DELETE SET NULL;

ALTER TABLE public.teacher_class_sessions DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.teacher_class_sessions ADD CONSTRAINT undefined FOREIGN KEY (planned_week_id) REFERENCES acm_weekly_plans(id) ON DELETE SET NULL;

ALTER TABLE public.teacher_class_sessions DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.teacher_class_sessions ADD CONSTRAINT undefined FOREIGN KEY (active_route_id) REFERENCES acm_active_routes(id) ON DELETE SET NULL;

ALTER TABLE public.teacher_class_sessions DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.teacher_class_sessions ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.teacher_session_indicators DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.teacher_session_indicators ADD CONSTRAINT undefined FOREIGN KEY (session_id) REFERENCES teacher_class_sessions(id) ON DELETE CASCADE;

ALTER TABLE public.teacher_session_indicators DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.teacher_session_indicators ADD CONSTRAINT undefined FOREIGN KEY (indicator_id) REFERENCES indicators(id) ON DELETE SET NULL;

ALTER TABLE public.teacher_session_indicators DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.teacher_session_indicators ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.telegram_allowed_users DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.telegram_allowed_users ADD CONSTRAINT undefined FOREIGN KEY (created_by) REFERENCES profiles(id);

ALTER TABLE public.telegram_allowed_users DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.telegram_allowed_users ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.telegram_allowed_users DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.telegram_allowed_users ADD CONSTRAINT undefined UNIQUE (telegram_user_id);

ALTER TABLE public.telegram_messages_raw DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.telegram_messages_raw ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.telegram_messages_raw DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.telegram_messages_raw ADD CONSTRAINT undefined UNIQUE (telegram_message_id);

ALTER TABLE public.unidades DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.unidades ADD CONSTRAINT undefined CHECK ((orden > 0));

ALTER TABLE public.unidades DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.unidades ADD CONSTRAINT undefined FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE;

ALTER TABLE public.unidades DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.unidades ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.unidades DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.unidades ADD CONSTRAINT undefined UNIQUE (modulo_id, nombre);

ALTER TABLE public.unidades DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.unidades ADD CONSTRAINT undefined UNIQUE (modulo_id, orden);

ALTER TABLE public.user_portal_access DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.user_portal_access ADD CONSTRAINT undefined FOREIGN KEY (portal_id) REFERENCES portal_catalog(portal_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.user_portal_access DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.user_portal_access ADD CONSTRAINT undefined FOREIGN KEY (granted_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE public.user_portal_access DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.user_portal_access ADD CONSTRAINT undefined FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE public.user_portal_access DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.user_portal_access ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.user_portal_access DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.user_portal_access ADD CONSTRAINT undefined UNIQUE (user_id, portal_id);

ALTER TABLE public.usuario_departamentos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.usuario_departamentos ADD CONSTRAINT undefined FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE;

ALTER TABLE public.usuario_departamentos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.usuario_departamentos ADD CONSTRAINT undefined FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.usuario_departamentos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.usuario_departamentos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.usuario_departamentos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.usuario_departamentos ADD CONSTRAINT undefined UNIQUE (user_id, departamento_id);

ALTER TABLE public.wallet_movimientos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.wallet_movimientos ADD CONSTRAINT undefined CHECK (((monto_centavos)::numeric > (0)::numeric));

ALTER TABLE public.wallet_movimientos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.wallet_movimientos ADD CONSTRAINT undefined FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT;

ALTER TABLE public.wallet_movimientos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.wallet_movimientos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.whatsapp_consentimientos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.whatsapp_consentimientos ADD CONSTRAINT undefined FOREIGN KEY (campania_id) REFERENCES campanias_periodo(id) ON DELETE CASCADE;

ALTER TABLE public.whatsapp_consentimientos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.whatsapp_consentimientos ADD CONSTRAINT undefined PRIMARY KEY (id);

ALTER TABLE public.whatsapp_consentimientos DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.whatsapp_consentimientos ADD CONSTRAINT undefined UNIQUE (jid, campania_id);

ALTER TABLE public.whatsapp_optout DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.whatsapp_optout ADD CONSTRAINT undefined PRIMARY KEY (jid);

ALTER TABLE public.whatsapp_webhook_log DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.whatsapp_webhook_log ADD CONSTRAINT undefined FOREIGN KEY (postulante_id) REFERENCES postulantes(id) ON DELETE SET NULL;

ALTER TABLE public.whatsapp_webhook_log DROP CONSTRAINT IF EXISTS undefined;
ALTER TABLE public.whatsapp_webhook_log ADD CONSTRAINT undefined PRIMARY KEY (id);

-- --------------------------------------------------------------------------
-- 6. INDICES
-- --------------------------------------------------------------------------
CREATE UNIQUE INDEX academic_plans_pkey ON public.academic_plans USING btree (id);
CREATE INDEX idx_academic_plans_student ON public.academic_plans USING btree (student_id);
CREATE UNIQUE INDEX accesorios_pkey ON public.accesorios USING btree (id);
CREATE INDEX idx_accesorios_stock ON public.accesorios USING btree (stock_actual, stock_minimo) WHERE (activo = true);
CREATE UNIQUE INDEX acm_active_routes_pkey ON public.acm_active_routes USING btree (id);
CREATE INDEX idx_acm_active_routes_group ON public.acm_active_routes USING btree (group_id);
CREATE UNIQUE INDEX idx_acm_active_routes_one_active_per_group ON public.acm_active_routes USING btree (group_id) WHERE (status = 'active'::text);
CREATE INDEX idx_acm_active_routes_status ON public.acm_active_routes USING btree (status);
CREATE INDEX idx_acm_active_routes_teacher ON public.acm_active_routes USING btree (teacher_id);
CREATE UNIQUE INDEX acm_curriculum_sources_pkey ON public.acm_curriculum_sources USING btree (id);
CREATE INDEX idx_acm_curriculum_sources_status ON public.acm_curriculum_sources USING btree (status);
CREATE UNIQUE INDEX acm_curriculum_versions_pkey ON public.acm_curriculum_versions USING btree (id);
CREATE INDEX idx_acm_curriculum_versions_source ON public.acm_curriculum_versions USING btree (source_id);
CREATE INDEX idx_acm_curriculum_versions_status ON public.acm_curriculum_versions USING btree (status);
CREATE UNIQUE INDEX acm_evidence_files_pkey ON public.acm_evidence_files USING btree (id);
CREATE INDEX idx_acm_evidence_files_indicator ON public.acm_evidence_files USING btree (indicator_id);
CREATE INDEX idx_acm_evidence_files_session ON public.acm_evidence_files USING btree (session_id);
CREATE UNIQUE INDEX acm_teacher_week_adjustments_pkey ON public.acm_teacher_week_adjustments USING btree (id);
CREATE UNIQUE INDEX acm_teacher_week_adjustments_unique ON public.acm_teacher_week_adjustments USING btree (group_id, teacher_id, weekly_plan_id, week_number);
CREATE INDEX idx_acm_teacher_week_adjustments_group ON public.acm_teacher_week_adjustments USING btree (group_id, teacher_id, weekly_plan_id);
CREATE UNIQUE INDEX acm_weekly_plan_items_pkey ON public.acm_weekly_plan_items USING btree (id);
CREATE INDEX idx_acm_weekly_plan_items_weekly_plan ON public.acm_weekly_plan_items USING btree (weekly_plan_id);
CREATE UNIQUE INDEX acm_weekly_plans_pkey ON public.acm_weekly_plans USING btree (id);
CREATE INDEX idx_acm_weekly_plans_level ON public.acm_weekly_plans USING btree (level_id, week_number);
CREATE UNIQUE INDEX alertas_log_pkey ON public.alertas_log USING btree (id);
CREATE INDEX idx_alertas_canal_tipo ON public.alertas_log USING btree (canal, tipo, created_at DESC);
CREATE UNIQUE INDEX alumno_escolaridad_pkey ON public.alumno_escolaridad USING btree (id);
CREATE UNIQUE INDEX alumno_plan_entradas_pkey ON public.alumno_plan_entradas USING btree (id);
CREATE INDEX idx_ape_alumno ON public.alumno_plan_entradas USING btree (alumno_id, created_at DESC);
CREATE INDEX idx_ape_maestro ON public.alumno_plan_entradas USING btree (maestro_id);
CREATE INDEX idx_ape_objetivo ON public.alumno_plan_entradas USING btree (objetivo_id) WHERE (objetivo_id IS NOT NULL);
CREATE UNIQUE INDEX alumno_suspensiones_pkey ON public.alumno_suspensiones USING btree (id);
CREATE INDEX idx_alumno_suspensiones_activa ON public.alumno_suspensiones USING btree (alumno_id) WHERE (estado = 'activa'::text);
CREATE INDEX idx_alumno_suspensiones_alumno ON public.alumno_suspensiones USING btree (alumno_id);
CREATE UNIQUE INDEX alumnos_pkey ON public.alumnos USING btree (id);
CREATE UNIQUE INDEX alumnos_user_id_key ON public.alumnos USING btree (user_id);
CREATE INDEX idx_alumnos_activo ON public.alumnos USING btree (activo);
CREATE INDEX idx_alumnos_activo_nombre ON public.alumnos USING btree (activo, nombre_completo);
CREATE INDEX idx_alumnos_bloqueo_reinscripcion ON public.alumnos USING btree (bloqueo_reinscripcion) WHERE (bloqueo_reinscripcion = true);
CREATE INDEX idx_alumnos_created_at ON public.alumnos USING btree (created_at);
CREATE INDEX idx_alumnos_estado_academico ON public.alumnos USING btree (estado_academico);
CREATE INDEX idx_alumnos_fecha_nacimiento ON public.alumnos USING btree (fecha_nacimiento);
CREATE INDEX idx_alumnos_instrumento ON public.alumnos USING btree (instrumento_principal);
CREATE INDEX idx_alumnos_municipio ON public.alumnos USING btree (municipio_residencia);
CREATE INDEX idx_alumnos_nombre ON public.alumnos USING btree (nombre_completo);
CREATE INDEX idx_alumnos_nombre_trgm ON public.alumnos USING gin (lower(nombre_completo) gin_trgm_ops);
CREATE INDEX idx_alumnos_requiere_iniciacion ON public.alumnos USING btree (requiere_iniciacion_musical) WHERE (requiere_iniciacion_musical = true);
CREATE INDEX idx_alumnos_user_id ON public.alumnos USING btree (user_id);
CREATE UNIQUE INDEX alumnos_clases_pkey ON public.alumnos_clases USING btree (id);
CREATE UNIQUE INDEX alumnos_clases_unico ON public.alumnos_clases USING btree (alumno_id, clase_id);
CREATE INDEX idx_alumnos_clases_alumno ON public.alumnos_clases USING btree (alumno_id);
CREATE INDEX idx_alumnos_clases_clase ON public.alumnos_clases USING btree (clase_id);
CREATE UNIQUE INDEX alumnos_logros_pkey ON public.alumnos_logros USING btree (alumno_id, logro_id);
CREATE UNIQUE INDEX alumnos_programas_alumno_programa_periodo_unq ON public.alumnos_programas USING btree (alumno_id, programa_id, periodo_id);
CREATE UNIQUE INDEX alumnos_programas_pkey ON public.alumnos_programas USING btree (id);
CREATE UNIQUE INDEX alumnos_reinscripciones_pkey ON public.alumnos_reinscripciones USING btree (id);
CREATE INDEX idx_alumnos_reinscripciones_alumno ON public.alumnos_reinscripciones USING btree (alumno_id, fecha DESC);
CREATE UNIQUE INDEX aplicaciones_pago_pkey ON public.aplicaciones_pago USING btree (id);
CREATE UNIQUE INDEX uq_aplicacion ON public.aplicaciones_pago USING btree (pago_id, cuota_id);
CREATE UNIQUE INDEX app_users_pkey ON public.app_users USING btree (id);
CREATE UNIQUE INDEX applicant_events_pkey ON public.applicant_events USING btree (id);
CREATE INDEX idx_applicant_events_applicant_id ON public.applicant_events USING btree (applicant_id);
CREATE INDEX idx_applicant_events_created_at ON public.applicant_events USING btree (created_at DESC);
CREATE INDEX idx_applicant_events_event_name ON public.applicant_events USING btree (event_name);
CREATE UNIQUE INDEX applicants_idempotency_key_key ON public.applicants USING btree (idempotency_key);
CREATE UNIQUE INDEX applicants_pkey ON public.applicants USING btree (id);
CREATE INDEX idx_applicants_phone_number ON public.applicants USING btree (phone_number);
CREATE INDEX idx_applicants_status ON public.applicants USING btree (status);
CREATE UNIQUE INDEX appointments_pkey ON public.appointments USING btree (id);
CREATE INDEX idx_appointments_applicant_id ON public.appointments USING btree (applicant_id);
CREATE INDEX idx_appointments_scheduled_datetime ON public.appointments USING btree (scheduled_datetime);
CREATE INDEX idx_appointments_status ON public.appointments USING btree (status);
CREATE UNIQUE INDEX uq_active_confirmed_slot ON public.appointments USING btree (scheduled_datetime) WHERE (status = 'CONFIRMED'::text);
CREATE UNIQUE INDEX asistencia_maestros_pkey ON public.asistencia_maestros USING btree (id);
CREATE UNIQUE INDEX asistencia_maestros_sesion_maestro_uniq ON public.asistencia_maestros USING btree (sesion_clase_id, maestro_id);
CREATE INDEX idx_asist_maestros_maestro_fecha ON public.asistencia_maestros USING btree (maestro_id, fecha DESC);
CREATE INDEX idx_asist_maestros_periodo ON public.asistencia_maestros USING btree (periodo_id) WHERE (periodo_id IS NOT NULL);
CREATE INDEX idx_asist_maestros_sesion ON public.asistencia_maestros USING btree (sesion_clase_id);
CREATE UNIQUE INDEX asistencias_pkey ON public.asistencias USING btree (id);
CREATE UNIQUE INDEX asistencias_unica_por_sesion ON public.asistencias USING btree (sesion_clase_id, alumno_id);
CREATE INDEX idx_asistencias_alumno ON public.asistencias USING btree (alumno_id);
CREATE INDEX idx_asistencias_alumno_fecha ON public.asistencias USING btree (alumno_id, fecha DESC);
CREATE INDEX idx_asistencias_alumno_fecha_estado ON public.asistencias USING btree (alumno_id, fecha, estado);
CREATE INDEX idx_asistencias_clase ON public.asistencias USING btree (clase_id);
CREATE INDEX idx_asistencias_estado ON public.asistencias USING btree (estado);
CREATE INDEX idx_asistencias_fecha ON public.asistencias USING btree (fecha);
CREATE INDEX idx_asistencias_maestro_marked ON public.asistencias USING btree (marked_at DESC) WHERE (marked_at IS NOT NULL);
CREATE INDEX idx_asistencias_marked_at ON public.asistencias USING btree (marked_at DESC);
CREATE INDEX idx_asistencias_periodo ON public.asistencias USING btree (periodo_id);
CREATE INDEX idx_asistencias_sesion ON public.asistencias USING btree (sesion_clase_id);
CREATE INDEX idx_asistencias_sesion_clase ON public.asistencias USING btree (sesion_clase_id);
CREATE UNIQUE INDEX uk_asistencias_clase_alumno_fecha ON public.asistencias USING btree (clase_id, alumno_id, fecha);
CREATE UNIQUE INDEX ausencias_pkey ON public.ausencias USING btree (id);
CREATE INDEX idx_ausencias_estado ON public.ausencias USING btree (estado);
CREATE INDEX idx_ausencias_fecha_ausencia ON public.ausencias USING btree (fecha_ausencia);
CREATE INDEX idx_ausencias_maestro_fecha ON public.ausencias USING btree (maestro_id, fecha_ausencia);
CREATE INDEX idx_ausencias_maestro_id ON public.ausencias USING btree (maestro_id);
CREATE UNIQUE INDEX ausencias_auditoria_pkey ON public.ausencias_auditoria USING btree (id);
CREATE INDEX idx_ausencias_auditoria_actor_id ON public.ausencias_auditoria USING btree (actor_id);
CREATE INDEX idx_ausencias_auditoria_ausencia_id ON public.ausencias_auditoria USING btree (ausencia_id);
CREATE INDEX idx_ausencias_auditoria_created_at ON public.ausencias_auditoria USING btree (created_at DESC);
CREATE UNIQUE INDEX ausencias_maestros_pkey ON public.ausencias_maestros USING btree (id);
CREATE INDEX idx_ausencias_maestros_aprobado_en ON public.ausencias_maestros USING btree (aprobado_en);
CREATE INDEX idx_ausencias_maestros_estado ON public.ausencias_maestros USING btree (estado);
CREATE INDEX idx_ausencias_maestros_fecha_solicitud_original ON public.ausencias_maestros USING btree (fecha_solicitud_original);
CREATE INDEX idx_ausencias_maestros_fechas ON public.ausencias_maestros USING btree (fecha_inicio, fecha_fin);
CREATE INDEX idx_ausencias_maestros_rechazado_por ON public.ausencias_maestros USING btree (rechazado_por);
CREATE INDEX idx_ausencias_maestros_revisado_por ON public.ausencias_maestros USING btree (revisado_por);
CREATE INDEX idx_ausencias_maestros_revision_en ON public.ausencias_maestros USING btree (revision_en);
CREATE UNIQUE INDEX becas_pkey ON public.becas USING btree (id);
CREATE UNIQUE INDEX blocks_pkey ON public.blocks USING btree (id);
CREATE UNIQUE INDEX calendario_pkey ON public.calendario USING btree (id);
CREATE INDEX idx_calendario_departamento ON public.calendario USING btree (departamento_id);
CREATE INDEX idx_calendario_estado ON public.calendario USING btree (estado);
CREATE INDEX idx_calendario_fecha ON public.calendario USING btree (fecha_inicio, fecha_fin);
CREATE INDEX idx_calendario_tipo ON public.calendario USING btree (tipo);
CREATE UNIQUE INDEX calendario_institucional_pkey ON public.calendario_institucional USING btree (id);
CREATE INDEX idx_calendario_macro ON public.calendario_institucional USING btree (es_macro_evento) WHERE (es_macro_evento = true);
CREATE UNIQUE INDEX campania_envios_campania_id_jid_key ON public.campania_envios USING btree (campania_id, jid);
CREATE UNIQUE INDEX campania_envios_pkey ON public.campania_envios USING btree (id);
CREATE UNIQUE INDEX campanias_periodo_pkey ON public.campanias_periodo USING btree (id);
CREATE UNIQUE INDEX uq_campania_activa ON public.campanias_periodo USING btree (tipo, accion) WHERE activo;
CREATE UNIQUE INDEX catalogo_niveles_instrumento_orden_key ON public.catalogo_niveles USING btree (instrumento, orden);
CREATE UNIQUE INDEX catalogo_niveles_pkey ON public.catalogo_niveles USING btree (id);
CREATE INDEX idx_catn_instrumento ON public.catalogo_niveles USING btree (instrumento);
CREATE UNIQUE INDEX catalogo_objetivos_especificos_objetivo_general_id_orden_key ON public.catalogo_objetivos_especificos USING btree (objetivo_general_id, orden);
CREATE UNIQUE INDEX catalogo_objetivos_especificos_pkey ON public.catalogo_objetivos_especificos USING btree (id);
CREATE INDEX idx_catoe_objetivo_general ON public.catalogo_objetivos_especificos USING btree (objetivo_general_id);
CREATE UNIQUE INDEX catalogo_objetivos_generales_nivel_id_orden_key ON public.catalogo_objetivos_generales USING btree (nivel_id, orden);
CREATE UNIQUE INDEX catalogo_objetivos_generales_pkey ON public.catalogo_objetivos_generales USING btree (id);
CREATE INDEX idx_catog_nivel ON public.catalogo_objetivos_generales USING btree (nivel_id);
CREATE UNIQUE INDEX catalogos_pkey ON public.catalogos USING btree (id);
CREATE INDEX idx_catalogos_activo ON public.catalogos USING btree (activo);
CREATE INDEX idx_catalogos_tipo ON public.catalogos USING btree (tipo);
CREATE UNIQUE INDEX clase_horarios_pkey ON public.clase_horarios USING btree (id);
CREATE INDEX idx_clase_horarios_clase_dia ON public.clase_horarios USING btree (clase_id, dia);
CREATE INDEX idx_clase_horarios_clase_id ON public.clase_horarios USING btree (clase_id);
CREATE UNIQUE INDEX clase_mapa_indicadores_clase_id_id_jerarquico_key ON public.clase_mapa_indicadores USING btree (clase_id, id_jerarquico);
CREATE UNIQUE INDEX clase_mapa_indicadores_objetivo_id_orden_indicador_key ON public.clase_mapa_indicadores USING btree (objetivo_id, orden_indicador);
CREATE UNIQUE INDEX clase_mapa_indicadores_pkey ON public.clase_mapa_indicadores USING btree (id);
CREATE INDEX idx_cmi_clase ON public.clase_mapa_indicadores USING btree (clase_id);
CREATE INDEX idx_cmi_objetivo ON public.clase_mapa_indicadores USING btree (objetivo_id);
CREATE INDEX idx_cmi_origen_indicator ON public.clase_mapa_indicadores USING btree (origen_indicator_id);
CREATE UNIQUE INDEX clase_mapa_objetivos_clase_id_level_id_orden_objetivo_key ON public.clase_mapa_objetivos USING btree (clase_id, level_id, orden_objetivo);
CREATE UNIQUE INDEX clase_mapa_objetivos_pkey ON public.clase_mapa_objetivos USING btree (id);
CREATE INDEX idx_clase_mapa_objetivos_estado_revision ON public.clase_mapa_objetivos USING btree (estado_revision);
CREATE INDEX idx_cmo_clase ON public.clase_mapa_objetivos USING btree (clase_id);
CREATE INDEX idx_cmo_level ON public.clase_mapa_objetivos USING btree (level_id);
CREATE INDEX idx_cmo_origen_node ON public.clase_mapa_objetivos USING btree (origen_node_id);
CREATE INDEX idx_cmo_origen_objetivo ON public.clase_mapa_objetivos USING btree (origen_objetivo_id);
CREATE UNIQUE INDEX clases_pkey ON public.clases USING btree (id);
CREATE INDEX idx_clases_activo ON public.clases USING btree (activo);
CREATE INDEX idx_clases_maestro ON public.clases USING btree (maestro_principal_id);
CREATE INDEX idx_clases_maestro_auxiliar_id ON public.clases USING btree (maestro_auxiliar_id);
CREATE INDEX idx_clases_nivel ON public.clases USING btree (nivel_id);
CREATE INDEX idx_clases_programa ON public.clases USING btree (programa_id);
CREATE INDEX idx_clases_ruta_id ON public.clases USING btree (ruta_id);
CREATE UNIQUE INDEX clases_emergentes_pkey ON public.clases_emergentes USING btree (id);
CREATE INDEX idx_clases_emergentes_maestro_fecha ON public.clases_emergentes USING btree (maestro_id, fecha);
CREATE UNIQUE INDEX class_event_methodology_pkey ON public.class_event_methodology USING btree (id);
CREATE UNIQUE INDEX idx_methodology_event ON public.class_event_methodology USING btree (class_event_id);
CREATE UNIQUE INDEX class_events_pkey ON public.class_events USING btree (id);
CREATE INDEX idx_class_events_date ON public.class_events USING btree (event_date);
CREATE INDEX idx_class_events_session ON public.class_events USING btree (session_id);
CREATE UNIQUE INDEX idx_class_events_session_student ON public.class_events USING btree (session_id, student_id);
CREATE INDEX idx_class_events_student ON public.class_events USING btree (student_id);
CREATE INDEX idx_class_events_teacher ON public.class_events USING btree (teacher_id);
CREATE UNIQUE INDEX class_session_content_snapshots_pkey ON public.class_session_content_snapshots USING btree (id);
CREATE INDEX idx_content_snapshots_session ON public.class_session_content_snapshots USING btree (session_id);
CREATE UNIQUE INDEX cobertura_alumno_objetivo_alumno_id_objetivo_id_key ON public.cobertura_alumno_objetivo USING btree (alumno_id, objetivo_id);
CREATE UNIQUE INDEX cobertura_alumno_objetivo_pkey ON public.cobertura_alumno_objetivo USING btree (id);
CREATE UNIQUE INDEX comodatos_activos_pkey ON public.comodatos_activos USING btree (id);
CREATE INDEX idx_comodatos_alumno ON public.comodatos_activos USING btree (alumno_id, estado);
CREATE INDEX idx_comodatos_tipo ON public.comodatos_activos USING btree (tipo_comodato) WHERE ((estado)::text = 'activo'::text);
CREATE INDEX idx_comodatos_vencimiento ON public.comodatos_activos USING btree (fecha_vencimiento) WHERE ((estado)::text = 'activo'::text);
CREATE UNIQUE INDEX uix_comodato_activo_por_instrumento ON public.comodatos_activos USING btree (activo_id) WHERE ((estado)::text = 'activo'::text);
CREATE UNIQUE INDEX compromisos_pago_pkey ON public.compromisos_pago USING btree (id);
CREATE UNIQUE INDEX comunicaciones_seguimiento_pkey ON public.comunicaciones_seguimiento USING btree (id);
CREATE INDEX idx_com_seg_alumno ON public.comunicaciones_seguimiento USING btree (alumno_id);
CREATE INDEX idx_com_seg_estado ON public.comunicaciones_seguimiento USING btree (estado);
CREATE INDEX idx_com_seg_proxima_fecha ON public.comunicaciones_seguimiento USING btree (proxima_fecha) WHERE ((estado = 'abierto'::text) AND (requiere_seguimiento = true));
CREATE UNIQUE INDEX configuracion_aranceles_pkey ON public.configuracion_aranceles USING btree (id);
CREATE UNIQUE INDEX uq_arancel_concepto_activo ON public.configuracion_aranceles USING btree (concepto) WHERE (activo = true);
CREATE UNIQUE INDEX configuracion_recordatorios_pkey ON public.configuracion_recordatorios USING btree (id);
CREATE UNIQUE INDEX configuracion_recordatorios_profile_id_key ON public.configuracion_recordatorios USING btree (profile_id);
CREATE UNIQUE INDEX contactos_alianzas_pkey ON public.contactos_alianzas USING btree (id);
CREATE INDEX idx_contactos_alianzas_created ON public.contactos_alianzas USING btree (created_at DESC);
CREATE INDEX idx_contactos_alianzas_estado ON public.contactos_alianzas USING btree (estado);
CREATE INDEX idx_contactos_alianzas_match ON public.contactos_alianzas USING btree (puntuacion_match DESC);
CREATE UNIQUE INDEX contenidos_sesion_pkey ON public.contenidos_sesion USING btree (id);
CREATE INDEX idx_contenidos_sesion_sesion ON public.contenidos_sesion USING btree (sesion_clase_id);
CREATE UNIQUE INDEX conversaciones_whatsapp_pkey ON public.conversaciones_whatsapp USING btree (id);
CREATE INDEX idx_conversaciones_estado ON public.conversaciones_whatsapp USING btree (estado_conversacion);
CREATE UNIQUE INDEX unique_postulante_conversacion ON public.conversaciones_whatsapp USING btree (postulante_id);
CREATE UNIQUE INDEX cuotas_familia_id_alumno_id_ciclo_anio_ciclo_mes_concepto_key ON public.cuotas USING btree (familia_id, alumno_id, ciclo_anio, ciclo_mes, concepto);
CREATE UNIQUE INDEX cuotas_pkey ON public.cuotas USING btree (id);
CREATE INDEX idx_cuotas_estado ON public.cuotas USING btree (estado);
CREATE INDEX idx_cuotas_familia_ciclo ON public.cuotas USING btree (familia_id, ciclo_anio, ciclo_mes);
CREATE INDEX idx_cuotas_vencimiento ON public.cuotas USING btree (fecha_vencimiento) WHERE (estado = ANY (ARRAY['pendiente'::cuota_estado, 'vencida'::cuota_estado, 'en_mora'::cuota_estado]));
CREATE UNIQUE INDEX curriculo_objetivos_pkey ON public.curriculo_objetivos USING btree (id);
CREATE UNIQUE INDEX curriculo_pilares_pkey ON public.curriculo_pilares USING btree (id);
CREATE UNIQUE INDEX curriculos_instrumento_nivel_key ON public.curriculos USING btree (instrumento, nivel);
CREATE UNIQUE INDEX curriculos_pkey ON public.curriculos USING btree (id);
CREATE UNIQUE INDEX departamentos_nombre_key ON public.departamentos USING btree (nombre);
CREATE UNIQUE INDEX departamentos_pkey ON public.departamentos USING btree (id);
CREATE UNIQUE INDEX ux_departamentos_codigo ON public.departamentos USING btree (upper(codigo));
CREATE UNIQUE INDEX document_batches_pkey ON public.document_batches USING btree (id);
CREATE UNIQUE INDEX document_templates_pkey ON public.document_templates USING btree (id);
CREATE UNIQUE INDEX ejercicios_pkey ON public.ejercicios USING btree (id);
CREATE UNIQUE INDEX ejercicios_unidad_orden_unique ON public.ejercicios USING btree (unidad_id, orden);
CREATE INDEX idx_ejercicios_tipo ON public.ejercicios USING btree (tipo_ejercicio);
CREATE INDEX idx_ejercicios_unidad ON public.ejercicios USING btree (unidad_id);
CREATE UNIQUE INDEX ei_unq_clase ON public.evaluacion_indicador USING btree (alumno_id, clase_indicador_id) WHERE (clase_indicador_id IS NOT NULL);
CREATE UNIQUE INDEX ei_unq_global ON public.evaluacion_indicador USING btree (alumno_id, indicator_id, clase_id) WHERE (indicator_id IS NOT NULL);
CREATE UNIQUE INDEX evaluacion_indicador_alumno_indicator_clase_unique ON public.evaluacion_indicador USING btree (alumno_id, indicator_id, clase_id);
CREATE UNIQUE INDEX evaluacion_indicador_alumno_maestro_indicador_clase_unique ON public.evaluacion_indicador USING btree (alumno_id, maestro_indicador_id, clase_id);
CREATE UNIQUE INDEX evaluacion_indicador_pkey ON public.evaluacion_indicador USING btree (id);
CREATE INDEX idx_ei_alumno ON public.evaluacion_indicador USING btree (alumno_id);
CREATE INDEX idx_ei_clase ON public.evaluacion_indicador USING btree (clase_id);
CREATE INDEX idx_ei_clase_alumno ON public.evaluacion_indicador USING btree (clase_id, alumno_id);
CREATE INDEX idx_ei_clase_indicador ON public.evaluacion_indicador USING btree (clase_indicador_id);
CREATE INDEX idx_ei_clase_recovery ON public.evaluacion_indicador USING btree (clase_id, recovery_status);
CREATE INDEX idx_ei_indicator ON public.evaluacion_indicador USING btree (indicator_id);
CREATE INDEX idx_ei_maestro_indicador ON public.evaluacion_indicador USING btree (maestro_indicador_id);
CREATE INDEX idx_ei_recovery_status ON public.evaluacion_indicador USING btree (recovery_status);
CREATE INDEX idx_ei_review_flag ON public.evaluacion_indicador USING btree (review_flag) WHERE (review_flag = true);
CREATE UNIQUE INDEX evaluations_pkey ON public.evaluations USING btree (id);
CREATE UNIQUE INDEX evaluations_student_id_jurado_id_key ON public.evaluations USING btree (student_id, jurado_id);
CREATE UNIQUE INDEX facturas_reparacion_numero_factura_key ON public.facturas_reparacion USING btree (numero_factura);
CREATE UNIQUE INDEX facturas_reparacion_pkey ON public.facturas_reparacion USING btree (id);
CREATE INDEX idx_facturas_estado ON public.facturas_reparacion USING btree (estado_pago);
CREATE INDEX idx_facturas_reparacion ON public.facturas_reparacion USING btree (reparacion_id);
CREATE UNIQUE INDEX familias_pkey ON public.familias USING btree (id);
CREATE INDEX idx_familias_activa ON public.familias USING btree (activa);
CREATE UNIQUE INDEX fin_service_accounts_pkey ON public.fin_service_accounts USING btree (id);
CREATE UNIQUE INDEX fin_service_accounts_provider_id_external_account_ref_key ON public.fin_service_accounts USING btree (provider_id, external_account_ref);
CREATE UNIQUE INDEX fin_service_balance_snapshots_pkey ON public.fin_service_balance_snapshots USING btree (id);
CREATE UNIQUE INDEX fin_service_balance_snapshots_source_snapshot_key_key ON public.fin_service_balance_snapshots USING btree (source_snapshot_key);
CREATE INDEX idx_fin_service_balance_snapshots_account_observed ON public.fin_service_balance_snapshots USING btree (service_account_id, observed_at DESC);
CREATE UNIQUE INDEX fin_service_providers_connector_key_key ON public.fin_service_providers USING btree (connector_key);
CREATE UNIQUE INDEX fin_service_providers_pkey ON public.fin_service_providers USING btree (id);
CREATE UNIQUE INDEX fin_service_refresh_runs_pkey ON public.fin_service_refresh_runs USING btree (id);
CREATE UNIQUE INDEX fin_service_refresh_state_pkey ON public.fin_service_refresh_state USING btree (service_account_id);
CREATE UNIQUE INDEX finanzas_politica_cobranza_pkey ON public.finanzas_politica_cobranza USING btree (singleton);
CREATE UNIQUE INDEX gastos_fijos_pkey ON public.gastos_fijos USING btree (id);
CREATE UNIQUE INDEX gastos_fijos_pagos_gasto_fijo_id_periodo_anio_periodo_mes_key ON public.gastos_fijos_pagos USING btree (gasto_fijo_id, periodo_anio, periodo_mes);
CREATE UNIQUE INDEX gastos_fijos_pagos_pkey ON public.gastos_fijos_pagos USING btree (id);
CREATE INDEX idx_gastos_fijos_pagos_gasto ON public.gastos_fijos_pagos USING btree (gasto_fijo_id);
CREATE UNIQUE INDEX generated_documents_pkey ON public.generated_documents USING btree (id);
CREATE UNIQUE INDEX hermes_gateway_health_instance_name_key ON public.hermes_gateway_health USING btree (instance_name);
CREATE UNIQUE INDEX hermes_gateway_health_pkey ON public.hermes_gateway_health USING btree (id);
CREATE INDEX idx_hermes_gateway_health_instance ON public.hermes_gateway_health USING btree (instance_name);
CREATE UNIQUE INDEX hermes_gateway_worker_lease_pkey ON public.hermes_gateway_worker_lease USING btree (instance_name);
CREATE UNIQUE INDEX hermes_inbox_pkey ON public.hermes_inbox USING btree (id);
CREATE INDEX hermes_inbox_rate_limit_idx ON public.hermes_inbox USING btree (telegram_user_id, created_at DESC) WHERE (telegram_user_id IS NOT NULL);
CREATE INDEX idx_hermes_inbox_unprocessed ON public.hermes_inbox USING btree (created_at) WHERE (processed = false);
CREATE UNIQUE INDEX hermes_kanban_cards_pkey ON public.hermes_kanban_cards USING btree (card_id);
CREATE INDEX idx_hermes_kanban_cards_status ON public.hermes_kanban_cards USING btree (status);
CREATE INDEX idx_hermes_kanban_cards_synced_at ON public.hermes_kanban_cards USING btree (synced_at DESC);
CREATE UNIQUE INDEX hermes_process_cases_pkey ON public.hermes_process_cases USING btree (id);
CREATE INDEX idx_hermes_process_cases_entity ON public.hermes_process_cases USING btree (entity_type, entity_id);
CREATE INDEX idx_hermes_process_cases_owner ON public.hermes_process_cases USING btree (owner_department);
CREATE INDEX idx_hermes_process_cases_process ON public.hermes_process_cases USING btree (process_code);
CREATE INDEX idx_hermes_process_cases_status ON public.hermes_process_cases USING btree (status);
CREATE UNIQUE INDEX hermes_protocolos_categoria_evento_key ON public.hermes_protocolos USING btree (categoria_evento);
CREATE UNIQUE INDEX hermes_protocolos_pkey ON public.hermes_protocolos USING btree (id);
CREATE INDEX idx_hermes_protocolos_activo ON public.hermes_protocolos USING btree (activo);
CREATE UNIQUE INDEX hermes_reactive_rules_pkey ON public.hermes_reactive_rules USING btree (id);
CREATE INDEX idx_hermes_rules_departamento ON public.hermes_reactive_rules USING btree (departamento);
CREATE INDEX idx_hermes_rules_enabled ON public.hermes_reactive_rules USING btree (enabled, rule_type);
CREATE INDEX idx_hermes_rules_lookup ON public.hermes_reactive_rules USING btree (rule_type, departamento);
CREATE UNIQUE INDEX uq_hermes_rules_type_dept ON public.hermes_reactive_rules USING btree (rule_type, departamento);
CREATE UNIQUE INDEX hermes_whatsapp_config_numero_wid_key ON public.hermes_whatsapp_config USING btree (numero_wid);
CREATE UNIQUE INDEX hermes_whatsapp_config_pkey ON public.hermes_whatsapp_config USING btree (id);
CREATE UNIQUE INDEX hermes_whatsapp_queue_pkey ON public.hermes_whatsapp_queue USING btree (id);
CREATE INDEX idx_hermes_whatsapp_queue_claim ON public.hermes_whatsapp_queue USING btree (estado, created_at) WHERE (estado = 'pendiente'::text);
CREATE INDEX idx_hermes_whatsapp_queue_jid_sent ON public.hermes_whatsapp_queue USING btree (jid, procesado_at DESC) WHERE (estado = 'enviado'::text);
CREATE UNIQUE INDEX historial_estado_alumno_pkey ON public.historial_estado_alumno USING btree (id);
CREATE INDEX idx_historial_alumno ON public.historial_estado_alumno USING btree (alumno_id, fecha DESC);
CREATE UNIQUE INDEX homework_assignments_pkey ON public.homework_assignments USING btree (id);
CREATE INDEX idx_homework_due_date ON public.homework_assignments USING btree (due_date);
CREATE INDEX idx_homework_event ON public.homework_assignments USING btree (class_event_id);
CREATE INDEX idx_homework_student ON public.homework_assignments USING btree (student_id);
CREATE INDEX idx_homework_teacher ON public.homework_assignments USING btree (teacher_id);
CREATE UNIQUE INDEX horarios_clase_unico ON public.horarios USING btree (clase_id, dia_semana, hora_inicio, hora_fin);
CREATE UNIQUE INDEX horarios_maestro_unico ON public.horarios USING btree (maestro_id, dia_semana, hora_inicio, hora_fin);
CREATE UNIQUE INDEX horarios_pkey ON public.horarios USING btree (id);
CREATE UNIQUE INDEX horarios_salon_unico ON public.horarios USING btree (salon_id, dia_semana, hora_inicio, hora_fin);
CREATE INDEX idx_horarios_clase ON public.horarios USING btree (clase_id);
CREATE INDEX idx_horarios_dia ON public.horarios USING btree (dia_semana);
CREATE INDEX idx_horarios_maestro ON public.horarios USING btree (maestro_id);
CREATE INDEX idx_horarios_salon ON public.horarios USING btree (salon_id);
CREATE INDEX idx_indicador_prerequisito_indicador ON public.indicador_prerequisito USING btree (indicador_id);
CREATE INDEX idx_indicador_prerequisito_prerequisito ON public.indicador_prerequisito USING btree (prerequisito_indicador_id);
CREATE UNIQUE INDEX indicador_prerequisito_indicador_id_prerequisito_indicador__key ON public.indicador_prerequisito USING btree (indicador_id, prerequisito_indicador_id);
CREATE UNIQUE INDEX indicador_prerequisito_pkey ON public.indicador_prerequisito USING btree (id);
CREATE INDEX idx_attempts_indicator ON public.indicator_attempts USING btree (indicator_id);
CREATE INDEX idx_attempts_session ON public.indicator_attempts USING btree (session_id);
CREATE INDEX idx_attempts_student ON public.indicator_attempts USING btree (student_id);
CREATE INDEX idx_indicator_attempts_clase ON public.indicator_attempts USING btree (covered_by_clase_id, covered_date DESC);
CREATE INDEX idx_indicator_attempts_covered_date ON public.indicator_attempts USING btree (indicator_id, covered_date DESC);
CREATE INDEX idx_indicator_attempts_created_by ON public.indicator_attempts USING btree (created_by);
CREATE INDEX idx_indicator_attempts_session ON public.indicator_attempts USING btree (session_id);
CREATE INDEX idx_indicator_attempts_student ON public.indicator_attempts USING btree (student_id);
CREATE UNIQUE INDEX indicator_attempts_pkey ON public.indicator_attempts USING btree (id);
CREATE UNIQUE INDEX uq_attempt_session_indicator_student ON public.indicator_attempts USING btree (session_id, indicator_id, student_id);
CREATE INDEX idx_indicator_session_students_alumno ON public.indicator_session_students USING btree (alumno_id);
CREATE INDEX idx_indicator_session_students_session ON public.indicator_session_students USING btree (indicator_session_id);
CREATE INDEX idx_indicator_session_students_session_alumno ON public.indicator_session_students USING btree (indicator_session_id, alumno_id);
CREATE UNIQUE INDEX indicator_session_students_indicator_session_id_alumno_id_key ON public.indicator_session_students USING btree (indicator_session_id, alumno_id);
CREATE UNIQUE INDEX indicator_session_students_pkey ON public.indicator_session_students USING btree (id);
CREATE INDEX idx_indicator_sessions_clase ON public.indicator_sessions USING btree (clase_id);
CREATE INDEX idx_indicator_sessions_fecha ON public.indicator_sessions USING btree (fecha DESC);
CREATE INDEX idx_indicator_sessions_maestro ON public.indicator_sessions USING btree (maestro_id);
CREATE INDEX idx_indicator_sessions_objetivo ON public.indicator_sessions USING btree (objetivo_id);
CREATE UNIQUE INDEX indicator_sessions_pkey ON public.indicator_sessions USING btree (id);
CREATE UNIQUE INDEX indicator_sessions_unique_session ON public.indicator_sessions USING btree (clase_id, objetivo_id, fecha, maestro_id);
CREATE INDEX idx_indicators_node ON public.indicators USING btree (node_id);
CREATE INDEX idx_indicators_objetivo_id ON public.indicators USING btree (objetivo_id);
CREATE UNIQUE INDEX indicators_pkey ON public.indicators USING btree (id);
CREATE INDEX idx_instrumentos_alumno ON public.instrumentos USING btree (alumno_id);
CREATE INDEX idx_instrumentos_estado ON public.instrumentos USING btree (estado);
CREATE UNIQUE INDEX instrumentos_codigo_key ON public.instrumentos USING btree (codigo);
CREATE UNIQUE INDEX instrumentos_pkey ON public.instrumentos USING btree (id);
CREATE INDEX idx_accesorios_activo ON public.inventario_accesorios USING btree (activo_id);
CREATE INDEX idx_accesorios_tipo ON public.inventario_accesorios USING btree (tipo);
CREATE UNIQUE INDEX inventario_accesorios_pkey ON public.inventario_accesorios USING btree (id);
CREATE INDEX idx_inventario_activos_asignado_a_texto ON public.inventario_activos USING btree (asignado_a_texto) WHERE (asignado_a_texto IS NOT NULL);
CREATE INDEX idx_inventario_activos_familia ON public.inventario_activos USING btree (familia) WHERE (activo = true);
CREATE INDEX idx_inventario_activos_requiere_mantenimiento ON public.inventario_activos USING btree (requiere_mantenimiento) WHERE (activo = true);
CREATE INDEX idx_inventario_activos_tipo ON public.inventario_activos USING btree (tipo_instrumento) WHERE (activo = true);
CREATE INDEX idx_inventario_estado_uso ON public.inventario_activos USING btree (estado_uso) WHERE (activo = true);
CREATE UNIQUE INDEX inventario_activos_codigo_inventario_key ON public.inventario_activos USING btree (codigo_inventario);
CREATE UNIQUE INDEX inventario_activos_pkey ON public.inventario_activos USING btree (id);
CREATE INDEX idx_historial_activo_fecha ON public.inventario_historial USING btree (activo_id, fecha DESC);
CREATE INDEX idx_historial_tipo_evento ON public.inventario_historial USING btree (tipo_evento);
CREATE UNIQUE INDEX inventario_historial_pkey ON public.inventario_historial USING btree (id);
CREATE UNIQUE INDEX inventario_materiales_pkey ON public.inventario_materiales USING btree (id);
CREATE INDEX idx_reparaciones_activo_estado ON public.inventario_reparaciones USING btree (activo_id, estado);
CREATE INDEX idx_reparaciones_estado ON public.inventario_reparaciones USING btree (estado);
CREATE UNIQUE INDEX inventario_reparaciones_pkey ON public.inventario_reparaciones USING btree (id);
CREATE INDEX idx_justificaciones_alumno ON public.justificaciones USING btree (alumno_id);
CREATE INDEX idx_justificaciones_categoria ON public.justificaciones USING btree (categoria) WHERE (categoria IS NOT NULL);
CREATE INDEX idx_justificaciones_clase ON public.justificaciones USING btree (clase_id);
CREATE INDEX idx_justificaciones_fecha ON public.justificaciones USING btree (fecha);
CREATE INDEX idx_justificaciones_sesion ON public.justificaciones USING btree (sesion_id);
CREATE UNIQUE INDEX justificaciones_pkey ON public.justificaciones USING btree (id);
CREATE UNIQUE INDEX justificaciones_sesion_id_alumno_id_key ON public.justificaciones USING btree (sesion_id, alumno_id);
CREATE INDEX idx_levels_number ON public.levels USING btree (level_number);
CREATE INDEX idx_levels_route_version ON public.levels USING btree (route_version_id);
CREATE UNIQUE INDEX levels_pkey ON public.levels USING btree (id);
CREATE UNIQUE INDEX levels_route_version_id_level_number_key ON public.levels USING btree (route_version_id, level_number);
CREATE UNIQUE INDEX logros_nombre_key ON public.logros USING btree (nombre);
CREATE UNIQUE INDEX logros_pkey ON public.logros USING btree (id);
CREATE INDEX idx_lut_diagnosticos_orden ON public.lut_diagnosticos USING btree (orden_id);
CREATE UNIQUE INDEX lut_diagnosticos_pkey ON public.lut_diagnosticos USING btree (id);
CREATE INDEX idx_lut_evidencias_orden ON public.lut_evidencias USING btree (orden_id);
CREATE UNIQUE INDEX lut_evidencias_pkey ON public.lut_evidencias USING btree (id);
CREATE INDEX idx_lut_insumos_activo ON public.lut_insumos USING btree (activo);
CREATE INDEX idx_lut_insumos_categoria ON public.lut_insumos USING btree (categoria);
CREATE UNIQUE INDEX lut_insumos_pkey ON public.lut_insumos USING btree (id);
CREATE INDEX idx_lut_movimientos_insumo ON public.lut_movimientos_insumos USING btree (insumo_id);
CREATE INDEX idx_lut_movimientos_orden ON public.lut_movimientos_insumos USING btree (orden_id);
CREATE UNIQUE INDEX lut_movimientos_insumos_pkey ON public.lut_movimientos_insumos USING btree (id);
CREATE INDEX idx_lut_ordenes_alumno ON public.lut_ordenes_reparacion USING btree (alumno_id);
CREATE INDEX idx_lut_ordenes_correlation ON public.lut_ordenes_reparacion USING btree (correlation_id);
CREATE INDEX idx_lut_ordenes_estado ON public.lut_ordenes_reparacion USING btree (estado);
CREATE INDEX idx_lut_ordenes_instrumento ON public.lut_ordenes_reparacion USING btree (instrumento_id);
CREATE UNIQUE INDEX lut_ordenes_reparacion_pkey ON public.lut_ordenes_reparacion USING btree (id);
CREATE INDEX idx_lut_presupuestos_orden ON public.lut_presupuestos USING btree (orden_id);
CREATE UNIQUE INDEX lut_presupuestos_pkey ON public.lut_presupuestos USING btree (id);
CREATE INDEX idx_lut_solicitudes_estado ON public.lut_solicitudes_compra USING btree (estado);
CREATE INDEX idx_lut_solicitudes_orden ON public.lut_solicitudes_compra USING btree (orden_id);
CREATE UNIQUE INDEX lut_solicitudes_compra_pkey ON public.lut_solicitudes_compra USING btree (id);
CREATE UNIQUE INDEX maestro_access_credentials_pkey ON public.maestro_access_credentials USING btree (maestro_id);
CREATE INDEX idx_maestro_desempeno_categoria ON public.maestro_desempeno USING btree (categoria);
CREATE INDEX idx_maestro_desempeno_tendencia ON public.maestro_desempeno USING btree (tendencia);
CREATE INDEX idx_maestro_desempeno_updated_at ON public.maestro_desempeno USING btree (updated_at);
CREATE INDEX idx_md_categoria ON public.maestro_desempeno USING btree (categoria);
CREATE INDEX idx_md_tendencia ON public.maestro_desempeno USING btree (tendencia);
CREATE INDEX idx_md_updated_at ON public.maestro_desempeno USING btree (updated_at);
CREATE UNIQUE INDEX maestro_desempeno_maestro_id_key ON public.maestro_desempeno USING btree (maestro_id);
CREATE UNIQUE INDEX maestro_desempeno_pkey ON public.maestro_desempeno USING btree (id);
CREATE INDEX idx_maestro_indicadores_objetivo ON public.maestro_indicadores USING btree (objetivo_id, orden);
CREATE UNIQUE INDEX maestro_indicadores_pkey ON public.maestro_indicadores USING btree (id);
CREATE INDEX idx_maestro_objetivos_unidad ON public.maestro_objetivos USING btree (unidad_id, orden);
CREATE UNIQUE INDEX maestro_objetivos_pkey ON public.maestro_objetivos USING btree (id);
CREATE INDEX idx_maestro_retiros_maestro_created ON public.maestro_retiros USING btree (maestro_id, created_at DESC);
CREATE UNIQUE INDEX maestro_retiros_pkey ON public.maestro_retiros USING btree (id);
CREATE INDEX idx_maestro_routes_clase ON public.maestro_routes USING btree (clase_id);
CREATE INDEX idx_maestro_routes_maestro ON public.maestro_routes USING btree (maestro_id);
CREATE INDEX idx_maestro_routes_maestro_clase ON public.maestro_routes USING btree (maestro_id, clase_id);
CREATE UNIQUE INDEX maestro_routes_maestro_id_clase_id_key ON public.maestro_routes USING btree (maestro_id, clase_id);
CREATE UNIQUE INDEX maestro_routes_pkey ON public.maestro_routes USING btree (id);
CREATE INDEX idx_maestro_tareas_maestro_fecha ON public.maestro_tareas USING btree (maestro_id, fecha_recordatorio);
CREATE UNIQUE INDEX maestro_tareas_pkey ON public.maestro_tareas USING btree (id);
CREATE INDEX idx_maestro_unidades_ruta ON public.maestro_unidades USING btree (ruta_id, orden);
CREATE UNIQUE INDEX maestro_unidades_pkey ON public.maestro_unidades USING btree (id);
CREATE INDEX idx_maestros_activo ON public.maestros USING btree (activo);
CREATE INDEX idx_maestros_especialidad ON public.maestros USING btree (especialidad);
CREATE INDEX idx_maestros_nombre ON public.maestros USING btree (nombre_completo);
CREATE INDEX idx_maestros_user_id ON public.maestros USING btree (user_id);
CREATE UNIQUE INDEX maestros_correo_key ON public.maestros USING btree (correo);
CREATE UNIQUE INDEX maestros_pkey ON public.maestros USING btree (id);
CREATE UNIQUE INDEX maestros_user_id_key ON public.maestros USING btree (user_id);
CREATE INDEX idx_mp_activo ON public.mapa_plantillas USING btree (activo);
CREATE INDEX idx_mp_level ON public.mapa_plantillas USING btree (level_id);
CREATE INDEX idx_mp_route_version ON public.mapa_plantillas USING btree (route_version_id);
CREATE UNIQUE INDEX mapa_plantillas_pkey ON public.mapa_plantillas USING btree (id);
CREATE UNIQUE INDEX mapa_plantillas_route_version_id_level_id_key ON public.mapa_plantillas USING btree (route_version_id, level_id);
CREATE UNIQUE INDEX minutas_pkey ON public.minutas USING btree (id);
CREATE INDEX idx_modulos_nivel ON public.modulos USING btree (nivel_id);
CREATE INDEX idx_modulos_programa ON public.modulos USING btree (programa_id);
CREATE UNIQUE INDEX modulos_nivel_nombre_unique ON public.modulos USING btree (nivel_id, nombre);
CREATE UNIQUE INDEX modulos_nivel_orden_unique ON public.modulos USING btree (nivel_id, orden);
CREATE UNIQUE INDEX modulos_pkey ON public.modulos USING btree (id);
CREATE INDEX idx_niveles_programa ON public.niveles USING btree (programa_id);
CREATE UNIQUE INDEX niveles_pkey ON public.niveles USING btree (id);
CREATE UNIQUE INDEX niveles_programa_nombre_unique ON public.niveles USING btree (programa_id, nombre);
CREATE UNIQUE INDEX niveles_programa_orden_unique ON public.niveles USING btree (programa_id, orden);
CREATE INDEX idx_node_resources_node_id ON public.node_resources USING btree (node_id);
CREATE INDEX idx_node_resources_type ON public.node_resources USING btree (resource_type);
CREATE UNIQUE INDEX node_resources_pkey ON public.node_resources USING btree (id);
CREATE INDEX idx_nodes_codigo ON public.nodes USING btree (codigo) WHERE (codigo IS NOT NULL);
CREATE INDEX idx_nodes_critical ON public.nodes USING btree (is_critical);
CREATE INDEX idx_nodes_level ON public.nodes USING btree (level_id);
CREATE UNIQUE INDEX nodes_pkey ON public.nodes USING btree (id);
CREATE INDEX idx_notificaciones_clase_id ON public.notificaciones USING btree (clase_id);
CREATE INDEX idx_notificaciones_dedup_key ON public.notificaciones USING btree (dedup_key) WHERE (dedup_key IS NOT NULL);
CREATE INDEX idx_notificaciones_escalation_level ON public.notificaciones USING btree (escalation_level);
CREATE INDEX idx_notificaciones_estado ON public.notificaciones USING btree (estado);
CREATE INDEX idx_notificaciones_profile ON public.notificaciones USING btree (profile_id);
CREATE UNIQUE INDEX notificaciones_pkey ON public.notificaciones USING btree (id);
CREATE INDEX idx_notif_asistencia_created ON public.notificaciones_asistencia USING btree (created_at DESC);
CREATE INDEX idx_notif_asistencia_destinatario ON public.notificaciones_asistencia USING btree (destinatario_telefono);
CREATE INDEX idx_notif_asistencia_estado ON public.notificaciones_asistencia USING btree (estado) WHERE (estado = 'pendiente'::text);
CREATE INDEX idx_notif_asistencia_estado_programada ON public.notificaciones_asistencia USING btree (estado, fecha_programada) WHERE (estado = 'pendiente'::text);
CREATE INDEX idx_notif_asistencia_tipo ON public.notificaciones_asistencia USING btree (tipo);
CREATE UNIQUE INDEX notificaciones_asistencia_pkey ON public.notificaciones_asistencia USING btree (id);
CREATE INDEX idx_notif_familia ON public.notificaciones_caja USING btree (familia_id, created_at DESC);
CREATE INDEX idx_notif_hermes ON public.notificaciones_caja USING btree (estado_whatsapp, created_at) WHERE ((canal = ANY (ARRAY['whatsapp'::notif_canal, 'ambos'::notif_canal])) AND (estado_whatsapp = 'pendiente'::notif_estado_wa));
CREATE INDEX idx_notif_portal_unreads ON public.notificaciones_caja USING btree (estado_portal) WHERE (estado_portal = 'no_leida'::notif_estado_portal);
CREATE UNIQUE INDEX notificaciones_caja_pkey ON public.notificaciones_caja USING btree (id);
CREATE INDEX idx_notification_trigger_logs_execution_time ON public.notification_trigger_logs USING btree (execution_time DESC);
CREATE UNIQUE INDEX notification_trigger_logs_pkey ON public.notification_trigger_logs USING btree (id);
CREATE INDEX idx_objetivos_node_order ON public.objetivos USING btree (node_id, order_index);
CREATE UNIQUE INDEX objetivos_node_order_unique ON public.objetivos USING btree (node_id, order_index);
CREATE UNIQUE INDEX objetivos_pkey ON public.objetivos USING btree (id);
CREATE INDEX idx_observaciones_alumno ON public.observaciones_alumnos USING btree (alumno_id);
CREATE INDEX idx_observaciones_alumno_estado ON public.observaciones_alumnos USING btree (alumno_id, estado);
CREATE INDEX idx_observaciones_alumnos_followup ON public.observaciones_alumnos USING btree (alumno_id, estado, tipo) WHERE (estado = ANY (ARRAY['abierta'::text, 'seguimiento'::text, 'pendiente'::text]));
CREATE INDEX idx_observaciones_clase ON public.observaciones_alumnos USING btree (clase_id);
CREATE INDEX idx_observaciones_fecha ON public.observaciones_alumnos USING btree (fecha);
CREATE UNIQUE INDEX observaciones_alumnos_pkey ON public.observaciones_alumnos USING btree (id);
CREATE INDEX idx_obs_borrador ON public.observaciones_sesion USING btree (sesion_id, es_borrador) WHERE (es_borrador = true);
CREATE INDEX idx_obs_maestro ON public.observaciones_sesion USING btree (maestro_id);
CREATE INDEX idx_obs_sesion ON public.observaciones_sesion USING btree (sesion_id);
CREATE INDEX idx_observaciones_clase_filled ON public.observaciones_sesion USING btree (sesion_id, first_note_at DESC) WHERE (first_note_at IS NOT NULL);
CREATE INDEX idx_observaciones_first_note_at ON public.observaciones_sesion USING btree (first_note_at DESC);
CREATE INDEX idx_observaciones_last_note_at ON public.observaciones_sesion USING btree (last_note_at DESC);
CREATE INDEX idx_observaciones_maestro_filled ON public.observaciones_sesion USING btree (maestro_id, first_note_at DESC) WHERE (first_note_at IS NOT NULL);
CREATE UNIQUE INDEX observaciones_sesion_pkey ON public.observaciones_sesion USING btree (id);
CREATE INDEX idx_pagos_cajero_fecha ON public.pagos USING btree (cajero_id, created_at);
CREATE INDEX idx_pagos_cuota_ids ON public.pagos USING gin (cuota_ids);
CREATE INDEX idx_pagos_familia ON public.pagos USING btree (familia_id);
CREATE UNIQUE INDEX pagos_pkey ON public.pagos USING btree (id);
CREATE INDEX idx_pagos_alumno_periodo ON public.pagos_alumnos USING btree (alumno_id, periodo_mes DESC);
CREATE UNIQUE INDEX pagos_alumnos_pkey ON public.pagos_alumnos USING btree (id);
CREATE UNIQUE INDEX uix_pagos_mensualidad_mes ON public.pagos_alumnos USING btree (alumno_id, periodo_mes) WHERE ((concepto)::text = 'mensualidad'::text);
CREATE UNIQUE INDEX patrocinantes_pkey ON public.patrocinantes USING btree (id);
CREATE UNIQUE INDEX patrocinios_pkey ON public.patrocinios USING btree (id);
CREATE INDEX idx_periodo_excepciones_periodo ON public.periodo_excepciones USING btree (periodo_id) WHERE (periodo_id IS NOT NULL);
CREATE INDEX idx_periodo_excepciones_rango ON public.periodo_excepciones USING btree (fecha_inicio, fecha_fin);
CREATE UNIQUE INDEX periodo_excepciones_pkey ON public.periodo_excepciones USING btree (id);
CREATE UNIQUE INDEX idx_periodo_activo_unico ON public.periodos USING btree (activo) WHERE (activo = true);
CREATE UNIQUE INDEX idx_periodos_unico_activo ON public.periodos USING btree (activo) WHERE (activo = true);
CREATE UNIQUE INDEX periodos_pkey ON public.periodos USING btree (id);
CREATE UNIQUE INDEX periodos_cierre_auditoria_pkey ON public.periodos_cierre_auditoria USING btree (id);
CREATE INDEX idx_permisos_maestros_maestro_id ON public.permisos_maestros USING btree (maestro_id);
CREATE INDEX permisos_maestros_maestro_id_idx ON public.permisos_maestros USING btree (maestro_id);
CREATE UNIQUE INDEX permisos_maestros_maestro_id_key ON public.permisos_maestros USING btree (maestro_id);
CREATE UNIQUE INDEX permisos_maestros_pkey ON public.permisos_maestros USING btree (id);
CREATE UNIQUE INDEX plan_clases_pkey ON public.plan_clases USING btree (id);
CREATE INDEX idx_indicadores_objetivo ON public.plan_indicadores USING btree (objetivo_id);
CREATE UNIQUE INDEX plan_indicadores_pkey ON public.plan_indicadores USING btree (id);
CREATE INDEX idx_niveles_clase ON public.plan_niveles USING btree (clase_id);
CREATE UNIQUE INDEX plan_niveles_pkey ON public.plan_niveles USING btree (id);
CREATE INDEX idx_objetivos_tema ON public.plan_objetivos USING btree (tema_id);
CREATE UNIQUE INDEX plan_objetivos_pkey ON public.plan_objetivos USING btree (id);
CREATE INDEX idx_temas_nivel ON public.plan_temas USING btree (nivel_id);
CREATE UNIQUE INDEX plan_temas_pkey ON public.plan_temas USING btree (id);
CREATE INDEX idx_planificaciones_clase ON public.planificaciones USING btree (clase_id);
CREATE INDEX idx_planificaciones_estado ON public.planificaciones USING btree (estado);
CREATE INDEX idx_planificaciones_maestro ON public.planificaciones USING btree (maestro_id);
CREATE UNIQUE INDEX planificaciones_pkey ON public.planificaciones USING btree (id);
CREATE INDEX idx_planned_content_clase ON public.planned_content USING btree (clase_id, planned_date);
CREATE INDEX idx_planned_content_maestro ON public.planned_content USING btree (maestro_id, planned_date);
CREATE INDEX idx_planned_content_node ON public.planned_content USING btree (node_id, planned_date);
CREATE UNIQUE INDEX planned_content_maestro_id_clase_id_node_id_planned_date_key ON public.planned_content USING btree (maestro_id, clase_id, node_id, planned_date);
CREATE UNIQUE INDEX planned_content_pkey ON public.planned_content USING btree (id);
CREATE INDEX idx_plandocs_clase ON public.planning_documents USING btree (clase_id);
CREATE INDEX idx_plandocs_maestro ON public.planning_documents USING btree (maestro_id);
CREATE UNIQUE INDEX planning_documents_pkey ON public.planning_documents USING btree (id);
CREATE INDEX idx_pp_clase_id ON public.plantillas_planificacion USING btree (clase_id);
CREATE UNIQUE INDEX plantillas_planificacion_pkey ON public.plantillas_planificacion USING btree (id);
CREATE UNIQUE INDEX portal_catalog_pkey ON public.portal_catalog USING btree (portal_id);
CREATE INDEX idx_postulantes_created_at ON public.postulantes USING btree (created_at);
CREATE INDEX idx_postulantes_estado ON public.postulantes USING btree (estado);
CREATE INDEX idx_postulantes_fecha_cita ON public.postulantes USING btree (fecha_cita);
CREATE INDEX idx_postulantes_madre_tlf ON public.postulantes USING btree (madre_tlf_whatsapp);
CREATE INDEX idx_postulantes_nombre_completo ON public.postulantes USING gin (nombre_completo gin_trgm_ops);
CREATE INDEX idx_postulantes_padre_tlf ON public.postulantes USING btree (padre_tlf_whatsapp);
CREATE INDEX idx_postulantes_telefono_alumno ON public.postulantes USING btree (telefono_alumno);
CREATE UNIQUE INDEX postulantes_pkey ON public.postulantes USING btree (id);
CREATE UNIQUE INDEX postulantes_submission_key ON public.postulantes USING btree (correo, nombre_completo);
CREATE INDEX idx_profiles_estado ON public.profiles USING btree (estado);
CREATE INDEX idx_profiles_rol ON public.profiles USING btree (rol);
CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);
CREATE UNIQUE INDEX programas_codigo_key ON public.programas USING btree (codigo);
CREATE UNIQUE INDEX programas_nombre_key ON public.programas USING btree (nombre);
CREATE UNIQUE INDEX programas_pkey ON public.programas USING btree (id);
CREATE UNIQUE INDEX programas_prerrequisitos_pkey ON public.programas_prerrequisitos USING btree (id);
CREATE UNIQUE INDEX programas_prerrequisitos_programa_id_prerequisito_id_key ON public.programas_prerrequisitos USING btree (programa_id, prerequisito_id);
CREATE INDEX idx_progresos_alumno ON public.progresos USING btree (alumno_id);
CREATE INDEX idx_progresos_alumno_fecha ON public.progresos USING btree (alumno_id, fecha_evaluacion DESC);
CREATE INDEX idx_progresos_alumno_fecha_calificacion ON public.progresos USING btree (alumno_id, fecha_evaluacion DESC) WHERE (calificacion IS NOT NULL);
CREATE INDEX idx_progresos_clase ON public.progresos USING btree (clase_id);
CREATE INDEX idx_progresos_fecha ON public.progresos USING btree (fecha_evaluacion);
CREATE INDEX idx_progresos_periodo ON public.progresos USING btree (periodo_id);
CREATE INDEX idx_progresos_sesion ON public.progresos USING btree (sesion_clase_id);
CREATE UNIQUE INDEX progresos_pkey ON public.progresos USING btree (id);
CREATE UNIQUE INDEX progresos_upsert_idx ON public.progresos USING btree (alumno_id, clase_id, sesion_clase_id, contenido_dsl) WHERE (contenido_dsl IS NOT NULL);
CREATE UNIQUE INDEX progresos_upsert_key ON public.progresos USING btree (alumno_id, clase_id, sesion_clase_id, contenido_dsl);
CREATE UNIQUE INDEX progresos_upsert_key_hash ON public.progresos USING btree (alumno_id, clase_id, sesion_clase_id, md5(contenido_dsl));
CREATE INDEX idx_protocolos_activo ON public.protocolos USING btree (activo);
CREATE INDEX idx_protocolos_tipo ON public.protocolos USING btree (tipo);
CREATE UNIQUE INDEX protocolos_nombre_key ON public.protocolos USING btree (nombre);
CREATE UNIQUE INDEX protocolos_pkey ON public.protocolos USING btree (id);
CREATE INDEX idx_pulso_score_history_calculado ON public.pulso_score_history USING btree (calculado_at DESC);
CREATE UNIQUE INDEX pulso_score_history_pkey ON public.pulso_score_history USING btree (id);
CREATE UNIQUE INDEX push_subscriptions_endpoint_key ON public.push_subscriptions USING btree (endpoint);
CREATE UNIQUE INDEX push_subscriptions_pkey ON public.push_subscriptions USING btree (id);
CREATE UNIQUE INDEX rachas_pkey ON public.rachas USING btree (alumno_id);
CREATE INDEX idx_registros_pendientes_estado ON public.registros_pendientes USING btree (estado);
CREATE INDEX idx_registros_pendientes_last_notified ON public.registros_pendientes USING btree (last_notified_at);
CREATE INDEX idx_registros_pendientes_maestro ON public.registros_pendientes USING btree (maestro_id);
CREATE INDEX idx_registros_pendientes_notification_state ON public.registros_pendientes USING btree (notification_state);
CREATE INDEX idx_registros_pendientes_tipo ON public.registros_pendientes USING btree (tipo);
CREATE INDEX idx_rp_maestro_estado_tipo ON public.registros_pendientes USING btree (maestro_id, estado, tipo);
CREATE UNIQUE INDEX registros_pendientes_pkey ON public.registros_pendientes USING btree (id);
CREATE UNIQUE INDEX repertoire_items_pkey ON public.repertoire_items USING btree (id);
CREATE UNIQUE INDEX repertoire_items_section_title_type_key ON public.repertoire_items USING btree (section, title, type);
CREATE INDEX idx_representantes_bloqueo ON public.representantes USING btree (bloqueo_reinscripcion) WHERE (bloqueo_reinscripcion = true);
CREATE INDEX idx_representantes_familia ON public.representantes USING btree (familia_id);
CREATE INDEX idx_representantes_user ON public.representantes USING btree (user_id);
CREATE UNIQUE INDEX representantes_pkey ON public.representantes USING btree (id);
CREATE INDEX idx_retenciones_alumno ON public.retenciones_instrumento USING btree (alumno_id);
CREATE INDEX idx_retenciones_retenido ON public.retenciones_instrumento USING btree (alumno_id) WHERE (estado = 'retenido'::text);
CREATE UNIQUE INDEX retenciones_instrumento_pkey ON public.retenciones_instrumento USING btree (id);
CREATE INDEX idx_route_versions_route ON public.route_versions USING btree (route_id);
CREATE INDEX idx_route_versions_status ON public.route_versions USING btree (status);
CREATE UNIQUE INDEX route_versions_pkey ON public.route_versions USING btree (id);
CREATE UNIQUE INDEX route_versions_route_id_version_key ON public.route_versions USING btree (route_id, version);
CREATE UNIQUE INDEX uniq_one_draft_per_route_user ON public.route_versions USING btree (route_id, created_by) WHERE (status = 'draft'::route_status);
CREATE INDEX idx_routes_instrument ON public.routes USING btree (instrument);
CREATE UNIQUE INDEX routes_pkey ON public.routes USING btree (id);
CREATE UNIQUE INDEX ruta_contenido_objetivos_pkey ON public.ruta_contenido_objetivos USING btree (id);
CREATE UNIQUE INDEX ruta_contenido_objetivos_ruta_id_objetivo_id_key ON public.ruta_contenido_objetivos USING btree (ruta_id, objetivo_id);
CREATE UNIQUE INDEX ruta_contenido_objetivos_ruta_id_orden_key ON public.ruta_contenido_objetivos USING btree (ruta_id, orden);
CREATE INDEX idx_rutas_contenido_instrumento_nivel_estado ON public.rutas_contenido USING btree (instrumento, nivel, estado);
CREATE UNIQUE INDEX rutas_contenido_instrumento_nivel_nombre_key ON public.rutas_contenido USING btree (instrumento, nivel, nombre);
CREATE UNIQUE INDEX rutas_contenido_pkey ON public.rutas_contenido USING btree (id);
CREATE UNIQUE INDEX salones_nombre_key ON public.salones USING btree (nombre);
CREATE UNIQUE INDEX salones_pkey ON public.salones USING btree (id);
CREATE UNIQUE INDEX unique_codigo_salon ON public.salones USING btree (codigo_salon);
CREATE INDEX idx_schedule_run_feedback_run_id ON public.schedule_run_feedback USING btree (run_id);
CREATE UNIQUE INDEX schedule_run_feedback_pkey ON public.schedule_run_feedback USING btree (id);
CREATE UNIQUE INDEX schedule_runs_pkey ON public.schedule_runs USING btree (id);
CREATE INDEX idx_score_representante_ciclo ON public.score_compromiso USING btree (representante_id, ciclo_anio DESC, ciclo_mes DESC);
CREATE UNIQUE INDEX score_compromiso_pkey ON public.score_compromiso USING btree (id);
CREATE UNIQUE INDEX score_compromiso_representante_id_ciclo_mes_ciclo_anio_key ON public.score_compromiso USING btree (representante_id, ciclo_mes, ciclo_anio);
CREATE UNIQUE INDEX sections_pkey ON public.sections USING btree (id);
CREATE INDEX idx_ausencias_reinicio_alumno ON public.seguimiento_ausencias_reinicio USING btree (alumno_id);
CREATE UNIQUE INDEX seguimiento_ausencias_reinicio_pkey ON public.seguimiento_ausencias_reinicio USING btree (id);
CREATE UNIQUE INDEX seguimiento_reglas_pkey ON public.seguimiento_reglas USING btree (id);
CREATE INDEX idx_service_account_observations_account ON public.service_account_observations USING btree (service_account_id, observed_at DESC);
CREATE UNIQUE INDEX service_account_observations_pkey ON public.service_account_observations USING btree (id);
CREATE UNIQUE INDEX service_accounts_pkey ON public.service_accounts USING btree (id);
CREATE INDEX idx_sesiones_clase_clase ON public.sesiones_clase USING btree (clase_id);
CREATE INDEX idx_sesiones_clase_clase_fecha ON public.sesiones_clase USING btree (clase_id, fecha);
CREATE INDEX idx_sesiones_clase_estado ON public.sesiones_clase USING btree (estado);
CREATE INDEX idx_sesiones_clase_fecha ON public.sesiones_clase USING btree (fecha);
CREATE INDEX idx_sesiones_clase_maestro ON public.sesiones_clase USING btree (maestro_id);
CREATE INDEX idx_sesiones_clase_maestro_fecha ON public.sesiones_clase USING btree (maestro_id, fecha);
CREATE INDEX idx_sesiones_clase_maestro_fecha_clase ON public.sesiones_clase USING btree (maestro_id, fecha, clase_id);
CREATE INDEX idx_sesiones_maestro_fecha ON public.sesiones_clase USING btree (maestro_id, fecha);
CREATE INDEX idx_sesiones_node ON public.sesiones_clase USING btree (node_id) WHERE (node_id IS NOT NULL);
CREATE INDEX idx_sesiones_node_codigo ON public.sesiones_clase USING btree (node_codigo) WHERE (node_codigo IS NOT NULL);
CREATE INDEX idx_teacher_class_metrics_clase ON public.sesiones_clase USING btree (clase_id, fecha DESC) WHERE (estado <> 'borrador'::text);
CREATE INDEX idx_teacher_class_metrics_maestro ON public.sesiones_clase USING btree (maestro_id, fecha DESC) WHERE (estado <> 'borrador'::text);
CREATE UNIQUE INDEX sesiones_clase_clase_fecha_maestro_unique ON public.sesiones_clase USING btree (clase_id, fecha, maestro_id);
CREATE UNIQUE INDEX sesiones_clase_pkey ON public.sesiones_clase USING btree (id);
CREATE UNIQUE INDEX sesiones_clase_unica ON public.sesiones_clase USING btree (clase_id, fecha, hora_inicio);
CREATE INDEX idx_signage_media_activo_orden ON public.signage_media USING btree (activo, orden);
CREATE INDEX idx_signage_media_pantalla ON public.signage_media USING btree (pantalla_id);
CREATE INDEX idx_signage_media_youtube ON public.signage_media USING btree (tipo) WHERE (tipo = 'youtube'::text);
CREATE UNIQUE INDEX signage_media_pkey ON public.signage_media USING btree (id);
CREATE UNIQUE INDEX signage_pantallas_pkey ON public.signage_pantallas USING btree (id);
CREATE UNIQUE INDEX signage_pantallas_slug_key ON public.signage_pantallas USING btree (slug);
CREATE INDEX idx_sim_actores_run_tipo ON public.sim_actores USING btree (run_id, tipo);
CREATE UNIQUE INDEX sim_actores_pkey ON public.sim_actores USING btree (id);
CREATE INDEX idx_sim_calendario_run_fecha ON public.sim_calendario USING btree (run_id, fecha_inicio);
CREATE UNIQUE INDEX sim_calendario_pkey ON public.sim_calendario USING btree (id);
CREATE UNIQUE INDEX sim_config_canal_key ON public.sim_config USING btree (canal);
CREATE UNIQUE INDEX sim_config_pkey ON public.sim_config USING btree (id);
CREATE INDEX idx_sim_log_run_created ON public.sim_log USING btree (run_id, created_at);
CREATE INDEX idx_sim_log_run_fecha_simulada ON public.sim_log USING btree (run_id, fecha_simulada, id);
CREATE UNIQUE INDEX sim_log_pkey ON public.sim_log USING btree (id);
CREATE INDEX idx_sim_outbox_run ON public.sim_outbox USING btree (run_id);
CREATE UNIQUE INDEX sim_outbox_pkey ON public.sim_outbox USING btree (id);
CREATE UNIQUE INDEX sim_runs_pkey ON public.sim_runs USING btree (id);
CREATE INDEX idx_sim_tareas_run ON public.sim_tareas USING btree (run_id);
CREATE UNIQUE INDEX sim_tareas_pkey ON public.sim_tareas USING btree (id);
CREATE INDEX idx_soi_analisis_semanal_created ON public.soi_analisis_semanal USING btree (created_at DESC);
CREATE UNIQUE INDEX soi_analisis_semanal_pkey ON public.soi_analisis_semanal USING btree (id);
CREATE INDEX idx_soi_event_bus_procesado ON public.soi_event_bus USING btree (procesado);
CREATE INDEX idx_soi_event_bus_tipo ON public.soi_event_bus USING btree (tipo);
CREATE UNIQUE INDEX soi_event_bus_pkey ON public.soi_event_bus USING btree (id);
CREATE INDEX idx_soi_eventos_correlation ON public.soi_eventos USING btree (correlation_id);
CREATE INDEX idx_soi_eventos_entity_timeline ON public.soi_eventos USING btree (entidad_id, created_at DESC);
CREATE INDEX idx_soi_eventos_procesado_queue ON public.soi_eventos USING btree (procesado, created_at) WHERE (procesado = false);
CREATE INDEX idx_soi_eventos_tipo_timeline ON public.soi_eventos USING btree (tipo, created_at DESC);
CREATE UNIQUE INDEX soi_eventos_pkey ON public.soi_eventos USING btree (id);
CREATE INDEX idx_soi_process_contracts_active ON public.soi_process_contracts USING btree (active) WHERE (active = true);
CREATE INDEX idx_soi_process_contracts_automation ON public.soi_process_contracts USING btree (automation_status);
CREATE INDEX idx_soi_process_contracts_owner ON public.soi_process_contracts USING btree (department_owner);
CREATE UNIQUE INDEX soi_process_contracts_pkey ON public.soi_process_contracts USING btree (process_code);
CREATE UNIQUE INDEX soi_rule_effectiveness_pkey ON public.soi_rule_effectiveness USING btree (rule_type);
CREATE INDEX idx_solicitudes_ausencia_maestro ON public.solicitudes_ausencia USING btree (maestro_id);
CREATE UNIQUE INDEX solicitudes_ausencia_pkey ON public.solicitudes_ausencia USING btree (id);
CREATE UNIQUE INDEX solicitudes_necesidades_pkey ON public.solicitudes_necesidades USING btree (id);
CREATE INDEX idx_solicitudes_estado ON public.solicitudes_permisos USING btree (estado);
CREATE INDEX idx_solicitudes_maestro_id ON public.solicitudes_permisos USING btree (maestro_id);
CREATE UNIQUE INDEX solicitudes_permisos_pkey ON public.solicitudes_permisos USING btree (id);
CREATE UNIQUE INDEX student_case_actions_pkey ON public.student_case_actions USING btree (id);
CREATE UNIQUE INDEX student_case_alerts_pkey ON public.student_case_alerts USING btree (id);
CREATE UNIQUE INDEX student_case_events_pkey ON public.student_case_events USING btree (id);
CREATE UNIQUE INDEX student_cases_pkey ON public.student_cases USING btree (id);
CREATE UNIQUE INDEX student_indicator_progress_pkey ON public.student_indicator_progress USING btree (id);
CREATE UNIQUE INDEX student_indicator_progress_unique ON public.student_indicator_progress USING btree (student_id, indicator_id);
CREATE UNIQUE INDEX system_config_pkey ON public.system_config USING btree (key);
CREATE INDEX idx_tarea_comentarios_tarea ON public.tarea_comentarios USING btree (tarea_id, created_at);
CREATE UNIQUE INDEX tarea_comentarios_pkey ON public.tarea_comentarios USING btree (id);
CREATE INDEX idx_tarea_historial_tarea ON public.tarea_historial USING btree (tarea_id, created_at);
CREATE UNIQUE INDEX tarea_historial_pkey ON public.tarea_historial USING btree (id);
CREATE UNIQUE INDEX tarea_logs_pkey ON public.tarea_logs USING btree (id);
CREATE UNIQUE INDEX tareas_caja_pkey ON public.tareas_caja USING btree (id);
CREATE INDEX idx_tareas_departamento ON public.tareas_calendario USING btree (departamento_id);
CREATE INDEX idx_tareas_estado ON public.tareas_calendario USING btree (estado);
CREATE INDEX idx_tareas_evento ON public.tareas_calendario USING btree (evento_id);
CREATE UNIQUE INDEX tareas_calendario_pkey ON public.tareas_calendario USING btree (id);
CREATE INDEX idx_tareas_correlation ON public.tareas_institucionales USING btree (correlation_id);
CREATE INDEX idx_tareas_correlation_created ON public.tareas_institucionales USING btree (correlation_id, created_at DESC) WHERE (correlation_id IS NOT NULL);
CREATE INDEX idx_tareas_dag ON public.tareas_institucionales USING btree (depende_de_tarea_id) WHERE (depende_de_tarea_id IS NOT NULL);
CREATE INDEX idx_tareas_dependencia ON public.tareas_institucionales USING btree (dependencia_tarea_id) WHERE (dependencia_tarea_id IS NOT NULL);
CREATE INDEX idx_tareas_entidad ON public.tareas_institucionales USING btree (entidad_tipo, entidad_id);
CREATE INDEX idx_tareas_institucionales_estado ON public.tareas_institucionales USING btree (estado);
CREATE INDEX idx_tareas_institucionales_vencimiento ON public.tareas_institucionales USING btree (fecha_vencimiento);
CREATE INDEX idx_tareas_minuta ON public.tareas_institucionales USING btree (minuta_id);
CREATE INDEX idx_tareas_process_code ON public.tareas_institucionales USING btree (process_code);
CREATE UNIQUE INDEX tareas_institucionales_pkey ON public.tareas_institucionales USING btree (id);
CREATE UNIQUE INDEX uq_tareas_correlation_departamento ON public.tareas_institucionales USING btree (correlation_id, departamento) WHERE (correlation_id IS NOT NULL);
CREATE UNIQUE INDEX teacher_class_sessions_pkey ON public.teacher_class_sessions USING btree (id);
CREATE UNIQUE INDEX teacher_session_indicators_pkey ON public.teacher_session_indicators USING btree (id);
CREATE INDEX telegram_allowed_users_activo_idx ON public.telegram_allowed_users USING btree (telegram_user_id) WHERE (activo = true);
CREATE UNIQUE INDEX telegram_allowed_users_pkey ON public.telegram_allowed_users USING btree (id);
CREATE UNIQUE INDEX telegram_allowed_users_telegram_user_id_key ON public.telegram_allowed_users USING btree (telegram_user_id);
CREATE INDEX telegram_messages_raw_chat_idx ON public.telegram_messages_raw USING btree (telegram_chat_id, created_at DESC);
CREATE UNIQUE INDEX telegram_messages_raw_pkey ON public.telegram_messages_raw USING btree (id);
CREATE UNIQUE INDEX telegram_messages_raw_telegram_message_id_key ON public.telegram_messages_raw USING btree (telegram_message_id);
CREATE INDEX telegram_messages_raw_user_idx ON public.telegram_messages_raw USING btree (telegram_user_id, created_at DESC);
CREATE INDEX idx_unidades_modulo ON public.unidades USING btree (modulo_id);
CREATE UNIQUE INDEX unidades_modulo_nombre_unique ON public.unidades USING btree (modulo_id, nombre);
CREATE UNIQUE INDEX unidades_modulo_orden_unique ON public.unidades USING btree (modulo_id, orden);
CREATE UNIQUE INDEX unidades_pkey ON public.unidades USING btree (id);
CREATE INDEX idx_user_portal_access_portal_id ON public.user_portal_access USING btree (portal_id);
CREATE INDEX idx_user_portal_access_user_id ON public.user_portal_access USING btree (user_id);
CREATE UNIQUE INDEX user_portal_access_pkey ON public.user_portal_access USING btree (id);
CREATE UNIQUE INDEX user_portal_access_user_portal_unique ON public.user_portal_access USING btree (user_id, portal_id);
CREATE INDEX idx_usuario_departamentos ON public.usuario_departamentos USING btree (user_id, departamento_id);
CREATE UNIQUE INDEX usuario_departamentos_pkey ON public.usuario_departamentos USING btree (id);
CREATE UNIQUE INDEX usuario_departamentos_user_id_departamento_id_key ON public.usuario_departamentos USING btree (user_id, departamento_id);
CREATE INDEX idx_wallet_familia_created ON public.wallet_movimientos USING btree (familia_id, created_at DESC);
CREATE UNIQUE INDEX wallet_movimientos_pkey ON public.wallet_movimientos USING btree (id);
CREATE UNIQUE INDEX whatsapp_consentimientos_jid_campania_id_key ON public.whatsapp_consentimientos USING btree (jid, campania_id);
CREATE UNIQUE INDEX whatsapp_consentimientos_pkey ON public.whatsapp_consentimientos USING btree (id);
CREATE UNIQUE INDEX whatsapp_optout_pkey ON public.whatsapp_optout USING btree (jid);
CREATE INDEX idx_webhook_log_created_at ON public.whatsapp_webhook_log USING btree (created_at DESC);
CREATE INDEX idx_webhook_log_message_id ON public.whatsapp_webhook_log USING btree (message_id);
CREATE INDEX idx_webhook_log_postulante ON public.whatsapp_webhook_log USING btree (postulante_id);
CREATE UNIQUE INDEX whatsapp_webhook_log_pkey ON public.whatsapp_webhook_log USING btree (id);

-- --------------------------------------------------------------------------
-- 7. VISTAS (43)
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.alumno_clases AS
undefined;

CREATE OR REPLACE VIEW public.node_student_coverage AS
undefined;

CREATE OR REPLACE VIEW public.signage_v_calendario_mes AS
undefined;

CREATE OR REPLACE VIEW public.signage_v_horario_hoy AS
undefined;

CREATE OR REPLACE VIEW public.signage_v_horario_manana AS
undefined;

CREATE OR REPLACE VIEW public.signage_v_horario_semana AS
undefined;

CREATE OR REPLACE VIEW public.student_results AS
undefined;

CREATE OR REPLACE VIEW public.teacher_class_fill_metrics AS
undefined;

CREATE OR REPLACE VIEW public.teacher_class_fill_metrics_aggregated AS
undefined;

CREATE OR REPLACE VIEW public.v_semaforo_contenidos AS
undefined;

CREATE OR REPLACE VIEW public.view_evaluaciones_pedagogicas AS
undefined;

CREATE OR REPLACE VIEW public.view_node_difficulty AS
undefined;

CREATE OR REPLACE VIEW public.vw_activos_ociosos AS
undefined;

CREATE OR REPLACE VIEW public.vw_admin_enrollment_calendar AS
undefined;

CREATE OR REPLACE VIEW public.vw_alertas_activas AS
undefined;

CREATE OR REPLACE VIEW public.vw_alumno_estado_pago AS
undefined;

CREATE OR REPLACE VIEW public.vw_asistencias_clases_formato AS
undefined;

CREATE OR REPLACE VIEW public.vw_asistencias_consolidada AS
undefined;

CREATE OR REPLACE VIEW public.vw_clase_objetivo_estrellas AS
undefined;

CREATE OR REPLACE VIEW public.vw_comodatos_en_riesgo AS
undefined;

CREATE OR REPLACE VIEW public.vw_cupos_iniciacion AS
undefined;

CREATE OR REPLACE VIEW public.vw_destacados_y_riesgo_academico AS
undefined;

CREATE OR REPLACE VIEW public.vw_estadisticas_periodo AS
undefined;

CREATE OR REPLACE VIEW public.vw_estado_familiar AS
undefined;

CREATE OR REPLACE VIEW public.vw_evaluacion_indicador_global AS
undefined;

CREATE OR REPLACE VIEW public.vw_ia_alumnos AS
undefined;

CREATE OR REPLACE VIEW public.vw_ia_asistencias_resumen AS
undefined;

CREATE OR REPLACE VIEW public.vw_ia_inventario AS
undefined;

CREATE OR REPLACE VIEW public.vw_ia_maestros AS
undefined;

CREATE OR REPLACE VIEW public.vw_indice_ensenanza_guiada AS
undefined;

CREATE OR REPLACE VIEW public.vw_ingresos_diarios AS
undefined;

CREATE OR REPLACE VIEW public.vw_instrumentos_disponibles AS
undefined;

CREATE OR REPLACE VIEW public.vw_kpi_inventario AS
undefined;

CREATE OR REPLACE VIEW public.vw_mora_activa AS
undefined;

CREATE OR REPLACE VIEW public.vw_patron_asistencia AS
undefined;

CREATE OR REPLACE VIEW public.vw_prediccion_abandono AS
undefined;

CREATE OR REPLACE VIEW public.vw_rendimiento_maestro AS
undefined;

CREATE OR REPLACE VIEW public.vw_reparaciones_pendientes AS
undefined;

CREATE OR REPLACE VIEW public.vw_resumen_alumno AS
undefined;

CREATE OR REPLACE VIEW public.vw_riesgo_abandono AS
undefined;

CREATE OR REPLACE VIEW public.vw_score_representantes AS
undefined;

CREATE OR REPLACE VIEW public.vw_seguimiento_ausentes AS
undefined;

CREATE OR REPLACE VIEW public.vw_stock_bajo AS
undefined;

-- --------------------------------------------------------------------------
-- 8. FUNCIONES Y RPC (263)
-- --------------------------------------------------------------------------
-- Function: public._fn_crear_tarea_caso(p_corr uuid, p_titulo text, p_desc text, p_depto soi_departamento, p_prioridad text, p_entidad_tipo text, p_entidad_id uuid, p_entidad_label text, p_actor_id uuid, p_actor_nombre text)
-- Returns: void | Language: sql | Security Definer: true | Volatility: volatile

-- Function: public.actualizar_timestamp_permisos()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.actualizar_timestamp_solicitudes()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.analizar_seguimiento_alumnos(p_desde date, p_hasta date, p_limit integer, p_offset integer, p_busqueda text)
-- Returns: TABLE(alumno_id uuid, nombre_completo text, instrumento_principal text, asistencia_total integer, asistencia_presentes integer, asistencia_rate numeric, progreso_count integer, progreso_promedio numeric, observaciones_count integer, risk_reasons text[], en_riesgo boolean, risk_score integer, nivel_riesgo text, total_count bigint, risk_count bigint) | Language: sql | Security Definer: false | Volatility: stable

-- Function: public.approve_maestro_profile(p_profile_id uuid, p_new_rol text, p_new_estado text)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile
-- Comment: Atomic approval of pending maestro profiles by admin. Confirms email, syncs metadata role, creates/updates maestros with registration instrument and reseña, and grants default permissions.

-- Function: public.aprobar_usuario(p_user_id uuid)
-- Returns: void | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.backfill_alumnos_desde_postulantes(dry_run boolean)
-- Returns: TABLE(alumno_id uuid, alumno_nombre text, postulante_id uuid, postulante_nombre text, match_tipo text, campos_llenados integer, accion text) | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.cambiar_estado_activo(p_id uuid, p_nuevo_estado text)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.cambiar_estado_reparacion(p_id uuid, p_nuevo_estado text)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.cambiar_rol_usuario(p_user_id uuid, p_nuevo_rol text)
-- Returns: void | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.capture_asistencia_marked_at()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.capture_observaciones_timestamps()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.check_permisos_maestros_integrity()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.clonar_catalogo_a_clase(p_clase_id uuid, p_nivel_id uuid, p_objetivo_general_ids uuid[])
-- Returns: TABLE(objetivo_id uuid, origen_objetivo_general_id uuid, indicador_id uuid, origen_objetivo_especifico_id uuid) | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.clonar_plantilla_a_clase(p_clase_id uuid, p_plantilla_id uuid, p_node_ids uuid[])
-- Returns: TABLE(objetivo_id uuid, origen_objetivo_id uuid, indicador_id uuid, origen_indicator_id uuid) | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.clone_route_version_as_draft(p_source_version_id uuid)
-- Returns: uuid | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.count_alumnos_activos()
-- Returns: bigint | Language: sql | Security Definer: true | Volatility: stable
-- Comment: Loop 14: retorna count de alumnos activos. Reemplaza SELECT count sobre alumnos.

-- Function: public.crear_reparacion(p_activo_id uuid, p_tipo_tallerista text, p_tallerista_nombre text, p_descripcion text, p_costo_estimado numeric, p_proveedor_factura_url text)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.create_profile_for_maestro()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.diagnose_profiles_schema()
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.eliminar_maestro_limpio(p_maestro_id uuid)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.ensure_session_and_save_evaluation(p_clase_id uuid, p_maestro_id uuid, p_fecha date, p_hora_inicio time with time zone, p_indicator_id uuid, p_student_id uuid, p_nota integer, p_observations text)
-- Returns: uuid | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.es_admin()
-- Returns: boolean | Language: plpgsql | Security Definer: true | Volatility: volatile
-- Comment: Retorna true si el usuario autenticado tiene rol admin o inventarista en profiles

-- Function: public.es_coordinador_acm()
-- Returns: boolean | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.es_maestro_de_clase(p_clase_id uuid)
-- Returns: boolean | Language: sql | Security Definer: true | Volatility: stable

-- Function: public.es_maestro_titular_de_clase(p_clase_id uuid)
-- Returns: boolean | Language: sql | Security Definer: true | Volatility: stable

-- Function: public.fn_activar_campania(p_id uuid)
-- Returns: json | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_activar_periodo(p_periodo_id uuid)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile
-- Comment: Activa un periodo desactivando el anterior en una sola transaccion. Reemplaza el par de updates del cliente, que dejaba el sistema sin periodo activo si el segundo fallaba.

-- Function: public.fn_actualizar_contacto(p_tipo text, p_nombre text, p_campo text, p_valor text, p_secret text)
-- Returns: TABLE(persona_nombre text, tipo text, campo text, valor_anterior text, valor_nuevo text) | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_actualizar_estado_postulante(p_nombre text, p_nuevo_estado text, p_secret text)
-- Returns: TABLE(postulante_nombre text, estado_anterior text, estado_nuevo text) | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_actualizar_racha_alumno(p_alumno_id uuid, p_fecha date, p_clase_id uuid)
-- Returns: void | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_actualizar_tarea(p_tarea_id uuid, p_nuevo_estado text, p_notas text)
-- Returns: json | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_alumno_evaluaciones_recientes(p_alumno_id uuid)
-- Returns: TABLE(evaluacion_id uuid, fecha_evaluacion date, estado_cualitativo text, calificacion numeric, evaluacion_tipo text, objetivo text, contenido_dsl text, observaciones text, tarea text, es_colectivo boolean, maestro_nombre text, clase_nombre text) | Language: plpgsql | Security Definer: true | Volatility: stable

-- Function: public.fn_alumno_ficha_360(p_alumno_id uuid)
-- Returns: TABLE(total_sesiones integer, presentes integer, ausentes integer, justificados integer, primera_asistencia date, ultima_asistencia date, total_evaluaciones integer, ultima_fecha_evaluacion date, ultima_calificacion numeric, ultimo_estado_cualitativo text, ultimo_objetivo text, ultimas_observaciones text, ultima_tarea text, ultimo_contenido_dsl text) | Language: plpgsql | Security Definer: true | Volatility: stable

-- Function: public.fn_alumno_instrumentos_comodato(p_alumno_id uuid)
-- Returns: TABLE(comodato_id uuid, tipo_comodato text, fecha_entrega date, fecha_vencimiento date, comodato_estado text, contrato_firmado_url text, activo_id uuid, codigo_inventario text, tipo_instrumento text, marca text, modelo text, numero_serie text, estado_conservacion text, estado_uso text, ubicacion text, en_reparacion boolean, reparacion_estado text, reparacion_descripcion text, reparacion_fecha_ingreso date) | Language: plpgsql | Security Definer: true | Volatility: stable

-- Function: public.fn_alumnos_inasistencias_pendiente(p_secret text)
-- Returns: TABLE(alumno_nombre text, inasistencias bigint, ultima_fecha date) | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_anular_sesiones_no_lectivas(p_dry_run boolean, p_desde date, p_hasta date)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile
-- Comment: Marca cancelada las sesiones en dias no lectivos. Nunca toca sesiones con asistencia registrada: si hubo asistencia la clase ocurrio y el calendario es lo que esta mal. Simulacion por defecto.

-- Function: public.fn_asignar_id_jerarquico()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.fn_asistencia_maestro_completar()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_beca_anula_cuotas_abiertas()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile
-- Comment: Trigger: al registrar/activar una beca, anula (marca becada, perdona el saldo) las cuotas de mensualidad todavia abiertas del alumno dentro de la vigencia de la beca.

-- Function: public.fn_bloquear_id_jerarquico()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.fn_bloquear_objetivo_jerarquico()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.fn_calcular_pulso_score(p_persistir boolean)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_calcular_score_representante(p_representante_id uuid, p_mes integer, p_anio integer)
-- Returns: void | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_camp_touch_updated_at()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.fn_cerrar_periodo_academico(p_periodo_id uuid, p_fecha_inicio date, p_fecha_fin date, p_cerrado_por uuid, p_observaciones text, p_forzar boolean)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile
-- Comment: Cierra un periodo tras validar completitud. Bloquea por defecto; p_forzar exige justificacion escrita, que se archiva junto al detalle de lo faltante.

-- Function: public.fn_check_and_notify_pending_asistencias()
-- Returns: TABLE(notification_count integer) | Language: plpgsql | Security Definer: true | Volatility: volatile
-- Comment: Notifica asistencias pendientes del dia. Aborta en dias no lectivos segun fn_es_dia_lectivo.

-- Function: public.fn_cobertura_curricular(p_periodo_id uuid)
-- Returns: jsonb | Language: sql | Security Definer: true | Volatility: stable
-- Comment: Cobertura curricular del periodo agrupada por categoria de trabajo (node_codigo). Reemplaza el SIN_DATOS del informe de cierre.

-- Function: public.fn_com_seg_touch_updated_at()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.fn_correlacion_asistencia_rendimiento()
-- Returns: numeric | Language: sql | Security Definer: false | Volatility: stable

-- Function: public.fn_crear_evento_calendario(p_departamento_id uuid, p_titulo text, p_descripcion text, p_tipo text, p_fecha_inicio date, p_fecha_fin date, p_fecha_alerta integer, p_prioridad text, p_responsable_id uuid, p_protocolo_json jsonb, p_notas text)
-- Returns: json | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_crear_familia_para_alumno(p_nombre text)
-- Returns: uuid | Language: plpgsql | Security Definer: true | Volatility: volatile
-- Comment: Crea la familia requerida para dar de alta un alumno, aplicando la misma autorizacion que alumnos_insert_authenticated. Evita que un maestro pueda crear el alumno pero no su familia.

-- Function: public.fn_dar_de_baja_alumno(p_alumno_id uuid, p_motivo text, p_observaciones text, p_usuario_id uuid)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_datos_jerarquicos_de_objetivo(p_objetivo_id uuid)
-- Returns: TABLE(clase_id uuid, level_number integer, orden_objetivo integer) | Language: sql | Security Definer: false | Volatility: stable

-- Function: public.fn_desplazar_cronograma_evento(p_event_id uuid, p_delta_dias integer)
-- Returns: integer | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.fn_deuda_viva(p_alumno_id uuid, p_familia_id uuid)
-- Returns: bigint | Language: sql | Security Definer: true | Volatility: stable

-- Function: public.fn_dispatch_enrollment_reminders()
-- Returns: integer | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_eliminar_familia_huerfana(p_familia_id uuid)
-- Returns: boolean | Language: plpgsql | Security Definer: true | Volatility: volatile
-- Comment: Revierte la familia creada cuando el alta del alumno falla despues. Solo borra si ningun alumno la referencia.

-- Function: public.fn_email_departamento(p_codigo text)
-- Returns: text | Language: sql | Security Definer: true | Volatility: stable

-- Function: public.fn_emit_mora_event()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_encolar_campania(p_campania_id uuid, p_limite integer)
-- Returns: json | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_enrollment_funnel_set_updated_at()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.fn_es_dia_lectivo(p_fecha date)
-- Returns: boolean | Language: sql | Security Definer: true | Volatility: stable
-- Comment: TRUE si la fecha cae dentro de un periodo academico y no esta cubierta por una excepcion. Fuente unica para decidir si se exige registro de asistencia.

-- Function: public.fn_escalar_mora()
-- Returns: void | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_estado_asistencia_maestro(p_maestro_id uuid, p_desde date, p_hasta date)
-- Returns: TABLE(fecha date, clase_id uuid, clase_nombre text, maestro_id uuid, hora_inicio time without time zone, hora_fin time without time zone, sesion_id uuid, estado text, dias_atraso integer, asistencia_completa boolean, cubierta_emergente boolean) | Language: plpgsql | Security Definer: true | Volatility: stable

-- Function: public.fn_estado_calendario(p_fecha date)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: stable
-- Comment: Estado del calendario para una fecha, con el motivo legible. Permite que la interfaz explique por que no se pide registro.

-- Function: public.fn_evaluacion_cobertura(p_clase_id uuid)
-- Returns: json | Language: plpgsql | Security Definer: true | Volatility: stable

-- Function: public.fn_evaluar_logros_alumno(p_alumno_id uuid)
-- Returns: void | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_evaluar_reinscripcion(p_representante_cedula text, p_alumno_nombre text, p_alumno_fecha_nacimiento date, p_representante_telefono text)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: stable

-- Function: public.fn_fin_acquire_service_refresh_lock(p_service_account_id uuid, p_refresh_run_id uuid, p_lease_seconds integer)
-- Returns: boolean | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_fin_complete_service_refresh(p_service_account_id uuid, p_refresh_run_id uuid, p_status text, p_error_code text, p_record_query boolean, p_success boolean)
-- Returns: boolean | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_fin_service_dashboard()
-- Returns: TABLE(service_account_id uuid, provider_key text, provider_name text, account_name text, service_type text, essential boolean, refresh_enabled boolean, connector_status text, observed_at timestamp with time zone, balance_centavos bigint, amount_due_centavos bigint, due_date date, currency_code text, days_remaining integer, last_query_at timestamp with time zone, last_success_at timestamp with time zone, last_status text, last_error_code text) | Language: sql | Security Definer: true | Volatility: stable

-- Function: public.fn_fusionar_alumnos_duplicados(p_principal_id uuid, p_obsoleto_id uuid, p_datos_fusion jsonb)
-- Returns: json | Language: plpgsql | Security Definer: true | Volatility: volatile
-- Comment: Fusiona dos alumnos duplicados: actualiza el principal con los datos resueltos, migra todos sus datos hijos y elimina el registro obsoleto. Atómico: si cualquier paso falla se revierte todo.

-- Function: public.fn_generar_ciclo_cuotas(p_mes integer, p_anio integer, p_monto_centavos bigint)
-- Returns: integer | Language: plpgsql | Security Definer: true | Volatility: volatile
-- Comment: Genera cuotas mensuales; omite inactivos y exentos; aplica descuento por becas.porcentaje.

-- Function: public.fn_generar_instancias_gastos_fijos(p_mes integer, p_anio integer)
-- Returns: integer | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_generar_tareas_calendario(p_evento_id uuid)
-- Returns: json | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_generate_class_start_reminders()
-- Returns: TABLE(notifications_created integer) | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_get_indice_ensenanza_guiada()
-- Returns: SETOF vw_indice_ensenanza_guiada | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_hermes_aprobar_whatsapp(p_queue_id uuid)
-- Returns: void | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_hermes_auto_delegar_tareas()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_hermes_close_process_case(p_case_id uuid, p_closure_summary text, p_actor_id uuid, p_actor_nombre text, p_force boolean)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile
-- Comment: Cierra un caso/procedimiento Hermes. Verifica tareas completas y evidencias requeridas a menos que force=true.

-- Function: public.fn_hermes_consulta_estado()
-- Returns: json | Language: sql | Security Definer: true | Volatility: stable

-- Function: public.fn_hermes_escalar_tareas_bloqueadas()
-- Returns: void | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_hermes_force_close_process_case(p_case_id uuid, p_closure_summary text, p_actor_id uuid, p_actor_nombre text)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile
-- Comment: Fuerza el cierre de un caso Hermes sin verificar tareas pendientes ni evidencias.

-- Function: public.fn_hermes_gateway_acquire_lease(p_instance_name text, p_owner_id text, p_duration_seconds integer)
-- Returns: boolean | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_hermes_gateway_get_live_status(p_instance_name text)
-- Returns: TABLE(instance_name text, status text, is_alive boolean, phone_number text, battery_level integer, qr_code_base64 text, seconds_since_heartbeat numeric, last_heartbeat timestamp with time zone) | Language: plpgsql | Security Definer: true | Volatility: stable

-- Function: public.fn_hermes_gateway_heartbeat(p_instance_name text, p_status text, p_phone text, p_battery integer, p_qr text, p_metadata jsonb)
-- Returns: uuid | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_hermes_gateway_release_lease(p_instance_name text, p_owner_id text)
-- Returns: boolean | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_hermes_orquestar_protocolo(p_evento_id uuid, p_protocolo_id uuid)
-- Returns: TABLE(paso integer, tarea_id uuid, titulo text, departamento text, fecha_vencimiento date, dependencia_tarea_id uuid) | Language: plpgsql | Security Definer: true | Volatility: volatile
-- Comment: Loop C: crea tareas en secuencia con dependencias. A diferencia de fn_hermes_auto_delegar_tareas (paralelo), esta función respeta orden y dependencias.

-- Function: public.fn_hermes_outreach_gate_status(p_secret text)
-- Returns: TABLE(whatsapp_ingest_enabled boolean, quiet_hours_start text, quiet_hours_end text) | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_hermes_queue_whatsapp(p_jid text, p_mensaje text)
-- Returns: uuid | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_hermes_rechazar_whatsapp(p_queue_id uuid, p_motivo text)
-- Returns: void | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_hermes_register_response(p_notif_id uuid, p_response_text text, p_sender_whatsapp text, p_sender_name text)
-- Returns: json | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_hermes_reintentar_mensaje(p_id uuid)
-- Returns: uuid | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_hermes_resolver_caso(p_case_id uuid, p_decision text)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile
-- Comment: Aprueba (approve->status=closed) o rechaza (reject->status=cancelled) un hermes_process_case. Autorización server-side scoped por owner_department vs. departamentos del usuario autenticado (N:M via usuario_departamentos). Fail-closed si owner_department es NULL o el usuario no pertenece al departamento dueño. Precondición: status=open.

-- Function: public.fn_hermes_rules_update_updated_at()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.fn_hermes_start_process_case(p_process_code text, p_title text, p_description text, p_source text, p_priority text, p_requested_by uuid, p_requested_by_name text, p_entity_type text, p_entity_id uuid, p_entity_label text, p_metadata jsonb)
-- Returns: uuid | Language: plpgsql | Security Definer: true | Volatility: volatile
-- Comment: Abre un caso/procedimiento Hermes desde un contrato SOI y genera tareas departamentales con correlation_id compartido.

-- Function: public.fn_hermes_tarea_completada_feedback()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_hermes_update_notif(p_id uuid, p_estado_wa text, p_respuesta text)
-- Returns: void | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_historial_activo()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_historial_comodato()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_historial_reparacion()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_listar_protocolos()
-- Returns: json | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_lookup_maestro_contacto(p_nombre text, p_secret text)
-- Returns: TABLE(maestro_nombre text, jid text) | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_lookup_representante_contacto(p_nombre text, p_secret text)
-- Returns: TABLE(alumno_nombre text, representante_nombre text, jid text) | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_lut_diagnosticos_recalc_costo()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.fn_lut_upsert_diagnostico(p_orden_id uuid, p_diagnostico_tecnico text, p_items jsonb, p_causa_probable text, p_tipo_dano text, p_gravedad text, p_zona_afectada text, p_reparacion_recomendada text, p_materiales_requeridos text, p_tiempo_estimado_horas numeric, p_costo_materiales numeric, p_requiere_servicio_externo boolean, p_observaciones text, p_diagnosticado_por uuid, p_diagnosticado_por_nombre text)
-- Returns: uuid | Language: plpgsql | Security Definer: true | Volatility: volatile
-- Comment: Loop 19: upsert diagnóstico con items. Calcula costo_mano_obra automáticamente y actualiza costo_estimado de la orden.

-- Function: public.fn_maestros_asistencia_pendiente(p_secret text)
-- Returns: TABLE(maestro_nombre text, clase_nombre text, fecha date) | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_marcar_asistencia(p_alumno text, p_clase text, p_fecha date, p_nuevo_estado text, p_secret text)
-- Returns: TABLE(alumno_nombre text, clase_nombre text, fecha date, estado_anterior text, estado_nuevo text) | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_morning_admissions_briefing()
-- Returns: text | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_notify_maestro_ausencia()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.fn_observar_tarea(p_tarea_id uuid, p_comentario text, p_actor_id uuid, p_actor_nombre text)
-- Returns: void | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_obtener_eventos_proximos(p_dias_desde integer, p_dias_hasta integer)
-- Returns: json | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_obtener_protocolo(p_tipo text)
-- Returns: json | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_obtener_tareas_departamento(p_departamento_id uuid, p_estado text)
-- Returns: json | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_periodo_vigente(p_fecha date)
-- Returns: uuid | Language: sql | Security Definer: true | Volatility: stable
-- Comment: Periodo academico que contiene la fecha dada. NULL si la fecha cae fuera de todo periodo.

-- Function: public.fn_portal_maestro_bloqueado()
-- Returns: boolean | Language: sql | Security Definer: true | Volatility: stable
-- Comment: TRUE cuando hoy no es dia lectivo. Deriva de fn_es_dia_lectivo; ya no depende de que el titulo del evento contenga la palabra RECESO.

-- Function: public.fn_prevent_periodo_reopen()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_preview_campania(p_id uuid)
-- Returns: json | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_procedimientos_resumen()
-- Returns: TABLE(correlation_id uuid, titulo_muestra text, total integer, completadas integer, pendientes integer, en_progreso integer, bloqueadas integer, observadas integer, canceladas integer, pct_avance integer, departamentos text[], prioridad_max text, ultima_actividad timestamp with time zone) | Language: sql | Security Definer: true | Volatility: stable

-- Function: public.fn_racha_ausencias(p_alumno_id uuid)
-- Returns: integer | Language: plpgsql | Security Definer: false | Volatility: stable

-- Function: public.fn_reactivar_alumno(p_alumno_id uuid, p_usuario_id uuid, p_nueva_familia_id uuid)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_recalcular_bloqueos_familia(p_familia_id uuid)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_registrar_alerta_enviada(p_tipo text, p_canal text, p_destinatario text, p_contenido text)
-- Returns: json | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_registrar_pago_transaccional(p_familia_id uuid, p_monto_centavos bigint, p_metodo_pago text, p_referencia text, p_notas text, p_cuota_ids uuid[], p_fecha_pago date)
-- Returns: pagos | Language: plpgsql | Security Definer: true | Volatility: volatile
-- Comment: Pago atómico; imputa FIFO (cuotas seleccionadas y luego el resto de la familia) con fecha contable; el excedente se acredita al wallet.

-- Function: public.fn_reinscripcion_rol_autorizado()
-- Returns: boolean | Language: sql | Security Definer: true | Volatility: stable

-- Function: public.fn_reportar_alumno_riesgo(p_alumno_id uuid, p_alumno_nombre text, p_motivo text, p_actor_id uuid, p_actor_nombre text)
-- Returns: uuid | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_reportar_instrumento_danado(p_instrumento_id uuid, p_descripcion text, p_actor_id uuid, p_actor_nombre text)
-- Returns: uuid | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_reporte_cierre_semestre(p_periodo_id uuid, p_escala_calificacion numeric, p_umbral_nota_pct numeric, p_umbral_asistencia_pct numeric, p_dias_gracia_registro integer)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile
-- Comment: Informe ejecutivo de cierre de semestre. Atribuye sesiones por clases.maestro_principal_id (no por sesiones_clase.maestro_id, que guarda al autor del registro). Devuelve SIN_DATOS explicito donde no hay evidencia, nunca 0 % ni 100 % por defecto.

-- Function: public.fn_reporte_indicadores_adicionales(p_periodo_id uuid, p_cobertura_minima_pct numeric)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile
-- Comment: Indicadores complementarios del informe de cierre. Cada bloque declara su propio estado (SIN_DATOS / PARCIAL / EVALUABLE) con motivo y accion pendiente, y comienza a reportar cuando la institucion registra el dato. Nunca infiere ni rellena.

-- Function: public.fn_resumen_academico_integrado(p_alumno_id uuid, p_limite integer)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_resumen_cumplimiento_asistencia(p_desde date, p_hasta date, p_maestro_id uuid)
-- Returns: TABLE(maestro_id uuid, maestro_nombre text, total_clases bigint, registradas bigint, pendientes bigint, vencidas bigint, es_solvente boolean) | Language: plpgsql | Security Definer: true | Volatility: stable

-- Function: public.fn_resumen_diario_director()
-- Returns: json | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_servicio_publico_activo()
-- Returns: boolean | Language: sql | Security Definer: true | Volatility: stable

-- Function: public.fn_set_updated_at()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.fn_set_updated_at_alianzas()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.fn_signage_set_updated_at()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.fn_sim_set_updated_at()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.fn_sincronizar_arbol_curricular(p_clase_id uuid, p_nombre text, p_objetivos jsonb, p_plantilla_id uuid)
-- Returns: uuid | Language: plpgsql | Security Definer: true | Volatility: volatile
-- Comment: Persiste el árbol curricular del Diseñador (unidad → objetivo → indicador) para una clase: valida autorización real (admin o maestro de la clase), upserta la plantilla y sincroniza los indicadores con UUID real a public.indicators.

-- Function: public.fn_soi_evento_asistencia_falta()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_soi_evento_asistencia_registrada()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_soi_evento_justificacion()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_soi_evento_periodo()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_soi_evento_periodo_abierto()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_soi_evento_sesion_creada()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_soi_evento_tarea()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_solicitudes_necesidades_open_process_case()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile
-- Comment: Abre el caso Hermes ACM-NEC para cada solicitud de necesidades e inyecta el correlation_id.

-- Function: public.fn_sugerir_nodo_por_texto(p_texto text)
-- Returns: TABLE(codigo text, nombre text, aciertos integer) | Language: sql | Security Definer: false | Volatility: immutable
-- Comment: Propone categorias de nodo a partir del texto libre del maestro. Devuelve candidatos ordenados por aciertos; no decide por si sola.

-- Function: public.fn_sync_campania_envio_estado()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_sync_estado_reparacion()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_sync_estado_uso_activo()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.fn_tarea_log_historial()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_tasa_asistencia_periodo(p_alumno_id uuid, p_desde date, p_hasta date)
-- Returns: numeric | Language: plpgsql | Security Definer: false | Volatility: stable

-- Function: public.fn_trigger_desbloqueo_tareas_dependientes()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.fn_trigger_evaluacion_gamificacion()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_trigger_hermes_task_wa_alert()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_trigger_historial_estado_alumno()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_update_notif_asistencia_timestamp()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.fn_update_notifications_on_attendance_change()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_upsert_protocolo(p_nombre text, p_tipo text, p_descripcion text, p_tareas jsonb)
-- Returns: json | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_validar_checklist_tarea()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_validar_cierre_periodo(p_periodo_id uuid)
-- Returns: jsonb | Language: sql | Security Definer: true | Volatility: stable
-- Comment: Semaforo de completitud previo al cierre. Solo evalua sesiones en dias lectivos: una sesion en receso no bloquea el cierre. Implementada con CTEs: una validacion de solo lectura no necesita tablas temporales.

-- Function: public.fn_validar_reinscripcion_alumno(p_alumno_id uuid)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: stable

-- Function: public.fn_validate_maestro_disponibilidad_horario()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.fn_validate_salon_capacity_horario()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.fn_validate_salon_no_overlap()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.fn_verificar_conflicto_cita(p_fecha_inicio timestamp with time zone, p_fecha_fin timestamp with time zone, p_departamento text)
-- Returns: TABLE(hay_conflicto boolean, evento_id uuid, evento_titulo text, evento_inicio timestamp with time zone, evento_fin timestamp with time zone, evento_departamento text) | Language: sql | Security Definer: true | Volatility: stable
-- Comment: Loop D: retorna eventos que se solapan con el rango dado. Sin overbooking.

-- Function: public.fn_verificar_stock_minimo()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_whatsapp_cap_hoy()
-- Returns: integer | Language: plpgsql | Security Definer: true | Volatility: stable

-- Function: public.fn_whatsapp_enviados_hoy()
-- Returns: integer | Language: sql | Security Definer: true | Volatility: stable

-- Function: public.fn_whatsapp_optout(p_jid text, p_motivo text)
-- Returns: void | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.fn_whatsapp_rate_excedido(p_jid text)
-- Returns: boolean | Language: plpgsql | Security Definer: true | Volatility: stable

-- Function: public.fn_whatsapp_reclamar_pendientes(p_limite integer)
-- Returns: SETOF hermes_whatsapp_queue | Language: plpgsql | Security Definer: true | Volatility: volatile
-- Comment: Atomic outbox claim: applies runtime flag, quiet hours, opt-out, campaign consent, warm-up caps and configurable one-send-per-JID window (system_config.whatsapp_dedup_jid_horas, default 24h).

-- Function: public.generar_contrato_pdf(p_comodato_id uuid)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.generar_numero_factura()
-- Returns: character varying | Language: plpgsql | Security Definer: false | Volatility: volatile
-- Comment: Genera número de factura secuencial: FACT-2026-00001

-- Function: public.generar_reporte_inventario(p_tipo text, p_filtros jsonb)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.generate_pending_class_notifications()
-- Returns: TABLE(maestros_processed integer, notifications_created integer, errors_logged integer) | Language: plpgsql | Security Definer: false | Volatility: volatile
-- Comment: Escala clases vencidas/pendientes. Excluye los dias no lectivos del conteo: una sesion en receso no es deuda del maestro.

-- Function: public.generate_salon_code()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.get_alumnos_disponibles_para_inscripcion()
-- Returns: TABLE(id uuid, nombre_completo text, instrumento_principal text, activo boolean, nivel text, promedio_notas numeric) | Language: plpgsql | Security Definer: true | Volatility: stable

-- Function: public.get_app_user_role()
-- Returns: text | Language: sql | Security Definer: true | Volatility: stable

-- Function: public.get_informe_academico_semestral(p_periodo_id uuid)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.get_my_rol()
-- Returns: text | Language: sql | Security Definer: true | Volatility: stable

-- Function: public.get_resumen_academico_mensual(p_periodo_id uuid, p_mes integer, p_anio integer)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.get_user_department()
-- Returns: text | Language: plpgsql | Security Definer: true | Volatility: stable

-- Function: public.get_user_familia_id()
-- Returns: uuid | Language: sql | Security Definer: true | Volatility: stable

-- Function: public.get_user_portales(p_user_id uuid)
-- Returns: TABLE(portal_id text, nombre text, ruta text, icono text, orden integer, origen_acceso text) | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.get_user_role()
-- Returns: text | Language: sql | Security Definer: true | Volatility: stable

-- Function: public.gin_extract_query_trgm(text, internal, smallint, internal, internal, internal, internal)
-- Returns: internal | Language: c | Security Definer: false | Volatility: immutable

-- Function: public.gin_extract_value_trgm(text, internal)
-- Returns: internal | Language: c | Security Definer: false | Volatility: immutable

-- Function: public.gin_trgm_consistent(internal, smallint, text, integer, internal, internal, internal, internal)
-- Returns: boolean | Language: c | Security Definer: false | Volatility: immutable

-- Function: public.gin_trgm_triconsistent(internal, smallint, text, integer, internal, internal, internal)
-- Returns: "char" | Language: c | Security Definer: false | Volatility: immutable

-- Function: public.gtrgm_compress(internal)
-- Returns: internal | Language: c | Security Definer: false | Volatility: immutable

-- Function: public.gtrgm_consistent(internal, text, smallint, oid, internal)
-- Returns: boolean | Language: c | Security Definer: false | Volatility: immutable

-- Function: public.gtrgm_decompress(internal)
-- Returns: internal | Language: c | Security Definer: false | Volatility: immutable

-- Function: public.gtrgm_distance(internal, text, smallint, oid, internal)
-- Returns: double precision | Language: c | Security Definer: false | Volatility: immutable

-- Function: public.gtrgm_in(cstring)
-- Returns: gtrgm | Language: c | Security Definer: false | Volatility: immutable

-- Function: public.gtrgm_options(internal)
-- Returns: void | Language: c | Security Definer: false | Volatility: immutable

-- Function: public.gtrgm_out(gtrgm)
-- Returns: cstring | Language: c | Security Definer: false | Volatility: immutable

-- Function: public.gtrgm_penalty(internal, internal, internal)
-- Returns: internal | Language: c | Security Definer: false | Volatility: immutable

-- Function: public.gtrgm_picksplit(internal, internal)
-- Returns: internal | Language: c | Security Definer: false | Volatility: immutable

-- Function: public.gtrgm_same(gtrgm, gtrgm, internal)
-- Returns: internal | Language: c | Security Definer: false | Volatility: immutable

-- Function: public.gtrgm_union(internal, internal)
-- Returns: gtrgm | Language: c | Security Definer: false | Volatility: immutable

-- Function: public.handle_new_auth_user()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.handle_new_user()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile
-- Comment: Creates profile on auth.users INSERT. Auto-confirms email for maestros.

-- Function: public.handle_profile_insert_maestro()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile
-- Comment: Creates maestros row when profile with rol=maestro is inserted. Tolerant to column mismatches.

-- Function: public.has_portal_access(p_portal_id text, p_user_id uuid)
-- Returns: boolean | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.intercambiar_instrumentos(p_comodato_origen_id uuid, p_activo_destino_id uuid, p_alumno_id uuid)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.is_admin()
-- Returns: boolean | Language: sql | Security Definer: true | Volatility: stable

-- Function: public.is_app_admin()
-- Returns: boolean | Language: sql | Security Definer: true | Volatility: stable

-- Function: public.is_super_admin()
-- Returns: boolean | Language: plpgsql | Security Definer: true | Volatility: stable

-- Function: public.is_teacher()
-- Returns: boolean | Language: sql | Security Definer: true | Volatility: stable

-- Function: public.maestro_actual()
-- Returns: uuid | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.maestro_en_clase(p_clase_id uuid)
-- Returns: boolean | Language: plpgsql | Security Definer: false | Volatility: stable

-- Function: public.norm_cedula(p text)
-- Returns: text | Language: sql | Security Definer: false | Volatility: immutable

-- Function: public.normalizar_tel_rd(raw text)
-- Returns: text | Language: sql | Security Definer: false | Volatility: immutable
-- Comment: Normaliza un teléfono a formato E.164 dominicano (+1809/829/849 + 7 dígitos). NULL si no es un número RD plausible. Espejo de normalizarTelefonoRD() en seguimientoAusentesService.js.

-- Function: public.normalize_phone(raw text)
-- Returns: text | Language: plpgsql | Security Definer: false | Volatility: immutable

-- Function: public.obtener_kpi_inventario()
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.on_notification_inserted()
-- Returns: trigger | Language: plpgsql | Security Definer: true | Volatility: volatile
-- Comment: Automatically sends a Web Push notification via send-push Edge Function on insert

-- Function: public.preview_retiro_maestro(p_maestro_id uuid)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.profile_is_active()
-- Returns: boolean | Language: sql | Security Definer: true | Volatility: stable

-- Function: public.reactivar_maestro_seguro(p_maestro_id uuid)
-- Returns: void | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.rechazar_usuario(p_user_id uuid)
-- Returns: void | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.refresh_maestro_desempeno()
-- Returns: void | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.registrar_justificacion_asistencia(p_clase_id uuid, p_alumno_id uuid, p_fecha date, p_motivo text)
-- Returns: uuid | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.registrar_sesion_bitacora(p_clase_id uuid, p_objetivo_id uuid, p_fecha date, p_notas jsonb)
-- Returns: uuid | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.renovar_comodato(p_comodato_id uuid, p_nueva_fecha_vencimiento date, p_nuevo_tipo text)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.retirar_maestro_seguro(p_maestro_id uuid, p_reemplazo_maestro_id uuid, p_motivo text)
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.set_evaluations_updated_at()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.set_limit(real)
-- Returns: real | Language: c | Security Definer: false | Volatility: volatile

-- Function: public.set_updated_at()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.set_user_portales(p_user_id uuid, p_portal_ids text[])
-- Returns: jsonb | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.show_limit()
-- Returns: real | Language: c | Security Definer: false | Volatility: stable

-- Function: public.show_trgm(text)
-- Returns: text[] | Language: c | Security Definer: false | Volatility: immutable

-- Function: public.similarity(text, text)
-- Returns: real | Language: c | Security Definer: false | Volatility: immutable

-- Function: public.similarity_dist(text, text)
-- Returns: real | Language: c | Security Definer: false | Volatility: immutable

-- Function: public.similarity_op(text, text)
-- Returns: boolean | Language: c | Security Definer: false | Volatility: stable

-- Function: public.strict_word_similarity(text, text)
-- Returns: real | Language: c | Security Definer: false | Volatility: immutable

-- Function: public.strict_word_similarity_commutator_op(text, text)
-- Returns: boolean | Language: c | Security Definer: false | Volatility: stable

-- Function: public.strict_word_similarity_dist_commutator_op(text, text)
-- Returns: real | Language: c | Security Definer: false | Volatility: immutable

-- Function: public.strict_word_similarity_dist_op(text, text)
-- Returns: real | Language: c | Security Definer: false | Volatility: immutable

-- Function: public.strict_word_similarity_op(text, text)
-- Returns: boolean | Language: c | Security Definer: false | Volatility: stable

-- Function: public.teacher_can_create_students()
-- Returns: boolean | Language: sql | Security Definer: true | Volatility: stable
-- Comment: Returns true when the authenticated maestro is active and has alumnos:create permission.

-- Function: public.tg_alumno_suspensiones_touch()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.tg_retenciones_levantar()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.tg_retenciones_touch()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.tiene_permiso(p_permiso text)
-- Returns: boolean | Language: plpgsql | Security Definer: false | Volatility: stable

-- Function: public.touch_maestro_access_credentials_updated_at()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.update_catalogo_timestamp()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.update_cmi_timestamp()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.update_cmo_timestamp()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.update_ei_timestamp()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.update_mp_timestamp()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.update_profile(p_id uuid, p_nombre_completo text, p_avatar_url text)
-- Returns: void | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.update_sb_timestamp()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.update_updated_at()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.update_updated_at_column()
-- Returns: trigger | Language: plpgsql | Security Definer: false | Volatility: volatile

-- Function: public.validate_admin_invite_code(p_code text)
-- Returns: boolean | Language: plpgsql | Security Definer: true | Volatility: volatile

-- Function: public.validate_disponibilidad_json(p_json jsonb)
-- Returns: boolean | Language: plpgsql | Security Definer: false | Volatility: immutable

-- Function: public.word_similarity(text, text)
-- Returns: real | Language: c | Security Definer: false | Volatility: immutable

-- Function: public.word_similarity_commutator_op(text, text)
-- Returns: boolean | Language: c | Security Definer: false | Volatility: stable

-- Function: public.word_similarity_dist_commutator_op(text, text)
-- Returns: real | Language: c | Security Definer: false | Volatility: immutable

-- Function: public.word_similarity_dist_op(text, text)
-- Returns: real | Language: c | Security Definer: false | Volatility: immutable

-- Function: public.word_similarity_op(text, text)
-- Returns: boolean | Language: c | Security Definer: false | Volatility: stable

-- --------------------------------------------------------------------------
-- 9. TRIGGERS (95)
-- --------------------------------------------------------------------------
-- Trigger on undefined: trg_verificar_stock_minimo (AFTER undefined)
-- Trigger on undefined: trg_alumno_suspensiones_touch (BEFORE undefined)
-- Trigger on undefined: trg_historial_estado_alumno (AFTER undefined)
-- Trigger on undefined: update_alumnos_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_applicants_set_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_appointments_set_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_asistencia_maestro_completar (BEFORE undefined)
-- Trigger on undefined: trg_asistencia_marked_at (BEFORE undefined)
-- Trigger on undefined: trg_soi_evento_asistencia_falta (AFTER undefined)
-- Trigger on undefined: trg_soi_evento_asistencia_registrada (AFTER undefined)
-- Trigger on undefined: update_asistencias_updated_at (BEFORE undefined)
-- Trigger on undefined: tg_ausencia_notify (AFTER undefined)
-- Trigger on undefined: trg_beca_anula_cuotas_abiertas (AFTER undefined)
-- Trigger on undefined: trg_hermes_event_inserted (AFTER undefined)
-- Trigger on undefined: trg_catn_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_catoe_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_catog_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_asignar_id_jerarquico (BEFORE undefined)
-- Trigger on undefined: trg_bloquear_id_jerarquico (BEFORE undefined)
-- Trigger on undefined: trg_cmi_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_bloquear_objetivo_jerarquico (BEFORE undefined)
-- Trigger on undefined: trg_cmo_updated_at (BEFORE undefined)
-- Trigger on undefined: update_clases_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_class_events_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_comodato_sync_estado_uso (AFTER undefined)
-- Trigger on undefined: trg_historial_comodato (AFTER undefined)
-- Trigger on undefined: trg_com_seg_updated_at (BEFORE undefined)
-- Trigger on undefined: update_configuracion_recordatorios_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_contactos_alianzas_updated_at (BEFORE undefined)
-- Trigger on undefined: update_ejercicios_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_ei_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_evaluacion_indicador_gamificacion (AFTER undefined)
-- Trigger on undefined: trg_evaluations_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_hermes_rules_update_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_sync_campania_envio (AFTER undefined)
-- Trigger on undefined: update_horarios_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_historial_activo (AFTER undefined)
-- Trigger on undefined: trg_historial_reparacion (AFTER undefined)
-- Trigger on undefined: trg_sync_estado_reparacion (AFTER undefined)
-- Trigger on undefined: trg_soi_evento_justificacion (AFTER undefined)
-- Trigger on undefined: trigger_justificaciones_updated_at (BEFORE undefined)
-- Trigger on undefined: update_logros_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_lut_diagnosticos_recalc_costo (BEFORE undefined)
-- Trigger on undefined: trg_maestro_access_credentials_updated_at (BEFORE undefined)
-- Trigger on undefined: trigger_auto_profile_maestro (AFTER undefined)
-- Trigger on undefined: update_maestros_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_mp_updated_at (BEFORE undefined)
-- Trigger on undefined: update_modulos_updated_at (BEFORE undefined)
-- Trigger on undefined: update_niveles_updated_at (BEFORE undefined)
-- Trigger on undefined: trigger_on_notification_inserted (AFTER undefined)
-- Trigger on undefined: update_notificaciones_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_notif_asistencia_update_timestamp (BEFORE undefined)
-- Trigger on undefined: trg_obs_alumnos_updated_at (BEFORE undefined)
-- Trigger on undefined: update_observaciones_alumnos_updated_at (BEFORE undefined)
-- Trigger on undefined: observaciones_sesion_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_observaciones_timestamps (BEFORE undefined)
-- Trigger on undefined: trg_mora_emit_hermes (AFTER undefined)
-- Trigger on undefined: trg_periodos_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_prevent_periodo_reopen (BEFORE undefined)
-- Trigger on undefined: trg_soi_evento_periodo (AFTER undefined)
-- Trigger on undefined: trg_soi_evento_periodo_abierto (AFTER undefined)
-- Trigger on undefined: set_actualizado_en_permisos (BEFORE undefined)
-- Trigger on undefined: trigger_check_permisos_maestros_integrity (BEFORE undefined)
-- Trigger on undefined: trg_planificaciones_updated_at (BEFORE undefined)
-- Trigger on undefined: update_planificaciones_updated_at (BEFORE undefined)
-- Trigger on undefined: on_profile_insert_maestro (AFTER undefined)
-- Trigger on undefined: update_profiles_updated_at (BEFORE undefined)
-- Trigger on undefined: update_programas_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_progresos_updated_at (BEFORE undefined)
-- Trigger on undefined: update_progresos_updated_at (BEFORE undefined)
-- Trigger on undefined: update_push_subscriptions_updated_at (BEFORE undefined)
-- Trigger on undefined: update_registros_pendientes_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_retenciones_levantar (BEFORE undefined)
-- Trigger on undefined: trg_retenciones_touch (BEFORE undefined)
-- Trigger on undefined: tr_generate_salon_code (BEFORE undefined)
-- Trigger on undefined: update_salones_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_soi_evento_sesion_creada (AFTER undefined)
-- Trigger on undefined: trg_update_notifications_on_attendance (AFTER undefined)
-- Trigger on undefined: update_sesiones_clase_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_signage_media_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_signage_pantallas_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_sim_calendario_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_sim_config_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_sim_outbox_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_sim_runs_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_sim_tareas_updated_at (BEFORE undefined)
-- Trigger on undefined: trg_solicitudes_necesidades_open_case (AFTER undefined)
-- Trigger on undefined: set_actualizado_en_solicitudes (BEFORE undefined)
-- Trigger on undefined: trg_desbloqueo_tareas (AFTER undefined)
-- Trigger on undefined: trg_hermes_tarea_completada_feedback (AFTER undefined)
-- Trigger on undefined: trg_hermes_task_wa_alert (AFTER undefined)
-- Trigger on undefined: trg_soi_evento_tarea (AFTER undefined)
-- Trigger on undefined: trg_tarea_log_historial (AFTER undefined)
-- Trigger on undefined: trg_validar_checklist (BEFORE undefined)
-- Trigger on undefined: update_unidades_updated_at (BEFORE undefined)

-- --------------------------------------------------------------------------
-- 10. CRON JOBS (11)
-- --------------------------------------------------------------------------
-- Job ID: 2 | Name: generate-pending-notifs-9am | Schedule: 0 9 * * * | Active: true
-- Command: SELECT generate_pending_class_notifications()

-- Job ID: 3 | Name: generate-pending-notifs-3:15pm | Schedule: 15 15 * * * | Active: true
-- Command: SELECT generate_pending_class_notifications()

-- Job ID: 4 | Name: generate-pending-notifs-8:45pm | Schedule: 45 20 * * * | Active: true
-- Command: SELECT generate_pending_class_notifications()

-- Job ID: 5 | Name: notify_pending_asistencias_weekdays | Schedule: 0 19 * * 1-5 | Active: true
-- Command: SELECT fn_check_and_notify_pending_asistencias();

-- Job ID: 6 | Name: notify_pending_asistencias_saturday | Schedule: 0 13 * * 6 | Active: true
-- Command: SELECT fn_check_and_notify_pending_asistencias();

-- Job ID: 7 | Name: recordar-citas-diario | Schedule: 0 11 * * * | Active: true
-- Command:    SELECT net.http_post(     url := 'https://zmhmdvmyeyswunurcyow.supabase.co/functions/v1/recordar-citas',     headers := jsonb_build_object(       'Content-Type', 'application/json',       'Authorization', 'Bearer sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'     )::json,     body := '{}'::json,     timeout_milliseconds := 60000   );   

-- Job ID: 14 | Name: class-start-reminders-cron | Schedule: */2 * * * * | Active: true
-- Command: SELECT fn_generate_class_start_reminders();

-- Job ID: 15 | Name: hermes-escalar-tareas-bloqueadas | Schedule: 0 */4 * * * | Active: true
-- Command: SELECT public.fn_hermes_escalar_tareas_bloqueadas()

-- Job ID: 17 | Name: hermes-event-completion-monitor | Schedule: 5 * * * * | Active: true
-- Command:    SELECT net.http_post(     url := 'https://zmhmdvmyeyswunurcyow.supabase.co/functions/v1/hermes-event-monitor',     headers := jsonb_build_object(       'Content-Type', 'application/json',       'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptaG1kdm15ZXlzd3VudXJjeW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMzI3MjEsImV4cCI6MjA5MjkwODcyMX0.ZEPI2FuJ-apwZYR20PAjAOLRUNIpfknG1LHDCUUwMRs'     ),     body := '{"check_all": true}'::jsonb,     timeout_milliseconds := 30000   );   

-- Job ID: 18 | Name: soi-event-enrichment | Schedule: */10 7-21 * * 1-5 | Active: true
-- Command:    SELECT net.http_post(     url := 'https://zmhmdvmyeyswunurcyow.supabase.co/functions/v1/event-spine-logger',     headers := jsonb_build_object(       'Content-Type', 'application/json',       'Authorization', 'Bearer ' || (SELECT value FROM system_config WHERE key = 'supabase_anon_key'),       'x-internal-key', (SELECT value FROM system_config WHERE key = 'internal_api_key')     ),     body := '{"source":"cron"}'::jsonb,     timeout_milliseconds := 60000   );   

-- Job ID: 21 | Name: finanzas_generar_ciclo_cuotas_mensual | Schedule: 0 6 1 * * | Active: true
-- Command: SELECT public.fn_generar_ciclo_cuotas(EXTRACT(MONTH FROM CURRENT_DATE)::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer)

-- --------------------------------------------------------------------------
-- 11. STORAGE BUCKETS (3)
-- --------------------------------------------------------------------------
-- Bucket: documentos | Public: true | File size limit: null | Allowed mime types: null
-- Bucket: instrumentos-fotos | Public: true | File size limit: 5242880 | Allowed mime types: ["image/jpeg","image/png","image/webp"]
-- Bucket: signage | Public: true | File size limit: null | Allowed mime types: null

-- --------------------------------------------------------------------------
-- 12. POLITICAS RLS (ROW LEVEL SECURITY) (591)
-- --------------------------------------------------------------------------
-- Table: academic_plans | Policy: Authenticated users can insert academic plans | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can insert academic plans" ON public.academic_plans;
  CREATE POLICY "Authenticated users can insert academic plans" ON public.academic_plans FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: academic_plans | Policy: Authenticated users can read academic plans | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can read academic plans" ON public.academic_plans;
  CREATE POLICY "Authenticated users can read academic plans" ON public.academic_plans FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: academic_plans | Policy: academic_plans_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "academic_plans_admin_read" ON public.academic_plans;
  CREATE POLICY "academic_plans_admin_read" ON public.academic_plans FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: accesorios | Policy: accesorios_insert_delete_admin | Cmd: ALL | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "accesorios_insert_delete_admin" ON public.accesorios;
  CREATE POLICY "accesorios_insert_delete_admin" ON public.accesorios FOR ALL USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: accesorios | Policy: accesorios_select_cajero_admin | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "accesorios_select_cajero_admin" ON public.accesorios;
  CREATE POLICY "accesorios_select_cajero_admin" ON public.accesorios FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: accesorios | Policy: accesorios_update_cajero_admin | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "accesorios_update_cajero_admin" ON public.accesorios;
  CREATE POLICY "accesorios_update_cajero_admin" ON public.accesorios FOR UPDATE USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text]))) WITH CHECK ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: acm_active_routes | Policy: acm_active_routes_owner | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "acm_active_routes_owner" ON public.acm_active_routes;
  CREATE POLICY "acm_active_routes_owner" ON public.acm_active_routes FOR ALL TO authenticated USING ((es_admin() OR (teacher_id = maestro_actual()))) WITH CHECK ((es_admin() OR (teacher_id = maestro_actual())));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: acm_curriculum_sources | Policy: acm_curriculum_sources_admin_write | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "acm_curriculum_sources_admin_write" ON public.acm_curriculum_sources;
  CREATE POLICY "acm_curriculum_sources_admin_write" ON public.acm_curriculum_sources FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: acm_curriculum_sources | Policy: acm_curriculum_sources_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "acm_curriculum_sources_read" ON public.acm_curriculum_sources;
  CREATE POLICY "acm_curriculum_sources_read" ON public.acm_curriculum_sources FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: acm_curriculum_versions | Policy: acm_curriculum_versions_admin_write | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "acm_curriculum_versions_admin_write" ON public.acm_curriculum_versions;
  CREATE POLICY "acm_curriculum_versions_admin_write" ON public.acm_curriculum_versions FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: acm_curriculum_versions | Policy: acm_curriculum_versions_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "acm_curriculum_versions_read" ON public.acm_curriculum_versions;
  CREATE POLICY "acm_curriculum_versions_read" ON public.acm_curriculum_versions FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: acm_evidence_files | Policy: acm_evidence_files_scoped | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "acm_evidence_files_scoped" ON public.acm_evidence_files;
  CREATE POLICY "acm_evidence_files_scoped" ON public.acm_evidence_files FOR ALL TO authenticated USING ((es_admin() OR (uploaded_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM teacher_class_sessions s
  WHERE ((s.id = acm_evidence_files.session_id) AND (s.teacher_id = maestro_actual())))))) WITH CHECK ((es_admin() OR (uploaded_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM teacher_class_sessions s
  WHERE ((s.id = acm_evidence_files.session_id) AND (s.teacher_id = maestro_actual()))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: acm_teacher_week_adjustments | Policy: acm_teacher_week_adjustments_owner | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "acm_teacher_week_adjustments_owner" ON public.acm_teacher_week_adjustments;
  CREATE POLICY "acm_teacher_week_adjustments_owner" ON public.acm_teacher_week_adjustments FOR ALL TO authenticated USING ((es_admin() OR (teacher_id = maestro_actual()))) WITH CHECK ((es_admin() OR (teacher_id = maestro_actual())));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: acm_weekly_plan_items | Policy: acm_weekly_plan_items_admin_write | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "acm_weekly_plan_items_admin_write" ON public.acm_weekly_plan_items;
  CREATE POLICY "acm_weekly_plan_items_admin_write" ON public.acm_weekly_plan_items FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: acm_weekly_plan_items | Policy: acm_weekly_plan_items_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "acm_weekly_plan_items_read" ON public.acm_weekly_plan_items;
  CREATE POLICY "acm_weekly_plan_items_read" ON public.acm_weekly_plan_items FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: acm_weekly_plans | Policy: acm_weekly_plans_admin_write | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "acm_weekly_plans_admin_write" ON public.acm_weekly_plans;
  CREATE POLICY "acm_weekly_plans_admin_write" ON public.acm_weekly_plans FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: acm_weekly_plans | Policy: acm_weekly_plans_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "acm_weekly_plans_read" ON public.acm_weekly_plans;
  CREATE POLICY "acm_weekly_plans_read" ON public.acm_weekly_plans FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alertas_log | Policy: alertas_log_authenticated_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "alertas_log_authenticated_all" ON public.alertas_log;
  CREATE POLICY "alertas_log_authenticated_all" ON public.alertas_log FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alumno_escolaridad | Policy: rls_alumno_escolaridad_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "rls_alumno_escolaridad_all" ON public.alumno_escolaridad;
  CREATE POLICY "rls_alumno_escolaridad_all" ON public.alumno_escolaridad FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alumno_plan_entradas | Policy: maestro_delete_plan_entradas | Cmd: DELETE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestro_delete_plan_entradas" ON public.alumno_plan_entradas;
  CREATE POLICY "maestro_delete_plan_entradas" ON public.alumno_plan_entradas FOR DELETE USING ((maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alumno_plan_entradas | Policy: maestro_insert_plan_entradas | Cmd: INSERT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestro_insert_plan_entradas" ON public.alumno_plan_entradas;
  CREATE POLICY "maestro_insert_plan_entradas" ON public.alumno_plan_entradas FOR INSERT WITH CHECK (((maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))) AND (EXISTS ( SELECT 1
   FROM (alumnos_clases ac
     JOIN clases c ON ((c.id = ac.clase_id)))
  WHERE ((ac.alumno_id = alumno_plan_entradas.alumno_id) AND (c.maestro_id = alumno_plan_entradas.maestro_id) AND (ac.activo = true))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alumno_plan_entradas | Policy: maestro_select_plan_entradas | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestro_select_plan_entradas" ON public.alumno_plan_entradas;
  CREATE POLICY "maestro_select_plan_entradas" ON public.alumno_plan_entradas FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ((alumnos_clases ac
     JOIN clases c ON ((c.id = ac.clase_id)))
     JOIN maestros m ON ((m.id = c.maestro_id)))
  WHERE ((ac.alumno_id = alumno_plan_entradas.alumno_id) AND (m.user_id = auth.uid())))) OR (maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid())))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alumno_plan_entradas | Policy: maestro_update_plan_entradas | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestro_update_plan_entradas" ON public.alumno_plan_entradas;
  CREATE POLICY "maestro_update_plan_entradas" ON public.alumno_plan_entradas FOR UPDATE USING ((maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alumno_suspensiones | Policy: alumno_suspensiones_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "alumno_suspensiones_select" ON public.alumno_suspensiones;
  CREATE POLICY "alumno_suspensiones_select" ON public.alumno_suspensiones FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alumno_suspensiones | Policy: alumno_suspensiones_write | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "alumno_suspensiones_write" ON public.alumno_suspensiones;
  CREATE POLICY "alumno_suspensiones_write" ON public.alumno_suspensiones FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alumnos | Policy: Maestros ven alumnos de sus clases | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Maestros ven alumnos de sus clases" ON public.alumnos;
  CREATE POLICY "Maestros ven alumnos de sus clases" ON public.alumnos FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM alumnos_clases ac
  WHERE ((ac.alumno_id = alumnos.id) AND maestro_en_clase(ac.clase_id)))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alumnos | Policy: alumnos_admin_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "alumnos_admin_insert" ON public.alumnos;
  CREATE POLICY "alumnos_admin_insert" ON public.alumnos FOR INSERT TO authenticated WITH CHECK ((( SELECT is_admin() AS is_admin) = true));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alumnos | Policy: alumnos_admin_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "alumnos_admin_read" ON public.alumnos;
  CREATE POLICY "alumnos_admin_read" ON public.alumnos FOR SELECT TO authenticated USING ((es_admin() OR (EXISTS ( SELECT 1
   FROM (alumnos_clases ac
     JOIN clases c ON ((c.id = ac.clase_id)))
  WHERE ((ac.alumno_id = alumnos.id) AND (c.maestro_principal_id = auth.uid()))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alumnos | Policy: alumnos_admin_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "alumnos_admin_update" ON public.alumnos;
  CREATE POLICY "alumnos_admin_update" ON public.alumnos FOR UPDATE TO authenticated USING ((( SELECT is_admin() AS is_admin) = true)) WITH CHECK ((( SELECT is_admin() AS is_admin) = true));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alumnos | Policy: alumnos_insert_authenticated | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "alumnos_insert_authenticated" ON public.alumnos;
  CREATE POLICY "alumnos_insert_authenticated" ON public.alumnos FOR INSERT TO authenticated WITH CHECK ((maestro_actual() IS NOT NULL));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alumnos | Policy: alumnos_read_all | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "alumnos_read_all" ON public.alumnos;
  CREATE POLICY "alumnos_read_all" ON public.alumnos FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alumnos | Policy: alumnos_superadmin_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "alumnos_superadmin_delete" ON public.alumnos;
  CREATE POLICY "alumnos_superadmin_delete" ON public.alumnos FOR DELETE TO authenticated USING ((( SELECT is_super_admin() AS is_super_admin) = true));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alumnos | Policy: alumnos_teacher_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "alumnos_teacher_insert" ON public.alumnos;
  CREATE POLICY "alumnos_teacher_insert" ON public.alumnos FOR INSERT TO authenticated WITH CHECK ((( SELECT teacher_can_create_students() AS teacher_can_create_students) = true));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alumnos | Policy: alumnos_update_own | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "alumnos_update_own" ON public.alumnos;
  CREATE POLICY "alumnos_update_own" ON public.alumnos FOR UPDATE TO authenticated USING ((es_admin() OR (EXISTS ( SELECT 1
   FROM (alumnos_clases ac
     JOIN clases c ON ((c.id = ac.clase_id)))
  WHERE ((ac.alumno_id = alumnos.id) AND (c.maestro_principal_id = auth.uid()))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alumnos_clases | Policy: Maestros ven sus inscripciones | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Maestros ven sus inscripciones" ON public.alumnos_clases;
  CREATE POLICY "Maestros ven sus inscripciones" ON public.alumnos_clases FOR SELECT TO authenticated USING (maestro_en_clase(clase_id));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alumnos_clases | Policy: alumnos_clases_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "alumnos_clases_admin_read" ON public.alumnos_clases;
  CREATE POLICY "alumnos_clases_admin_read" ON public.alumnos_clases FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alumnos_clases | Policy: alumnos_clases_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "alumnos_clases_delete" ON public.alumnos_clases;
  CREATE POLICY "alumnos_clases_delete" ON public.alumnos_clases FOR DELETE TO authenticated USING (((( SELECT is_admin() AS is_admin) = true) OR ((( SELECT profile_is_active() AS profile_is_active) = true) AND ((( SELECT is_teacher() AS is_teacher) = true) AND tiene_permiso('clases:enroll'::text) AND maestro_en_clase(clase_id)))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alumnos_clases | Policy: alumnos_clases_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "alumnos_clases_insert" ON public.alumnos_clases;
  CREATE POLICY "alumnos_clases_insert" ON public.alumnos_clases FOR INSERT TO authenticated WITH CHECK (((( SELECT is_admin() AS is_admin) = true) OR ((( SELECT profile_is_active() AS profile_is_active) = true) AND ((( SELECT is_teacher() AS is_teacher) = true) AND tiene_permiso('clases:enroll'::text) AND maestro_en_clase(clase_id)))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alumnos_clases | Policy: alumnos_clases_read_all | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "alumnos_clases_read_all" ON public.alumnos_clases;
  CREATE POLICY "alumnos_clases_read_all" ON public.alumnos_clases FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alumnos_clases | Policy: alumnos_clases_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "alumnos_clases_update" ON public.alumnos_clases;
  CREATE POLICY "alumnos_clases_update" ON public.alumnos_clases FOR UPDATE TO authenticated USING (((( SELECT is_admin() AS is_admin) = true) OR ((( SELECT profile_is_active() AS profile_is_active) = true) AND ((( SELECT is_teacher() AS is_teacher) = true) AND tiene_permiso('clases:enroll'::text) AND maestro_en_clase(clase_id))))) WITH CHECK (((( SELECT is_admin() AS is_admin) = true) OR ((( SELECT profile_is_active() AS profile_is_active) = true) AND ((( SELECT is_teacher() AS is_teacher) = true) AND tiene_permiso('clases:enroll'::text) AND maestro_en_clase(clase_id)))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alumnos_logros | Policy: alumnos_logros_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "alumnos_logros_admin_read" ON public.alumnos_logros;
  CREATE POLICY "alumnos_logros_admin_read" ON public.alumnos_logros FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alumnos_logros | Policy: alumnos_logros_authenticated_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "alumnos_logros_authenticated_all" ON public.alumnos_logros;
  CREATE POLICY "alumnos_logros_authenticated_all" ON public.alumnos_logros FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alumnos_programas | Policy: Enable read access for all users | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "Enable read access for all users" ON public.alumnos_programas;
  CREATE POLICY "Enable read access for all users" ON public.alumnos_programas FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alumnos_programas | Policy: alumnos_programas_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "alumnos_programas_admin_read" ON public.alumnos_programas;
  CREATE POLICY "alumnos_programas_admin_read" ON public.alumnos_programas FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alumnos_programas | Policy: alumnos_programas_authenticated_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "alumnos_programas_authenticated_all" ON public.alumnos_programas;
  CREATE POLICY "alumnos_programas_authenticated_all" ON public.alumnos_programas FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: alumnos_reinscripciones | Policy: alumnos_reinscripciones_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "alumnos_reinscripciones_read" ON public.alumnos_reinscripciones;
  CREATE POLICY "alumnos_reinscripciones_read" ON public.alumnos_reinscripciones FOR SELECT TO authenticated USING (fn_reinscripcion_rol_autorizado());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: aplicaciones_pago | Policy: aplicaciones_pago_select_cajero_admin | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "aplicaciones_pago_select_cajero_admin" ON public.aplicaciones_pago;
  CREATE POLICY "aplicaciones_pago_select_cajero_admin" ON public.aplicaciones_pago FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = ANY (ARRAY['admin'::text, 'finanzas'::text]))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: app_users | Policy: App users admin modify policy | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "App users admin modify policy" ON public.app_users;
  CREATE POLICY "App users admin modify policy" ON public.app_users FOR ALL TO authenticated USING (is_app_admin()) WITH CHECK (is_app_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: app_users | Policy: App users select policy | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "App users select policy" ON public.app_users;
  CREATE POLICY "App users select policy" ON public.app_users FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: app_users | Policy: App users self insert policy | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "App users self insert policy" ON public.app_users;
  CREATE POLICY "App users self insert policy" ON public.app_users FOR INSERT TO authenticated WITH CHECK ((id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: app_users | Policy: App users self update policy | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "App users self update policy" ON public.app_users;
  CREATE POLICY "App users self update policy" ON public.app_users FOR UPDATE TO authenticated USING ((id = auth.uid())) WITH CHECK ((id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: applicant_events | Policy: applicant_events_all_service_role | Cmd: ALL | Roles: service_role
DO $$ BEGIN
  DROP POLICY IF EXISTS "applicant_events_all_service_role" ON public.applicant_events;
  CREATE POLICY "applicant_events_all_service_role" ON public.applicant_events FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: applicant_events | Policy: applicant_events_no_anon | Cmd: ALL | Roles: anon
DO $$ BEGIN
  DROP POLICY IF EXISTS "applicant_events_no_anon" ON public.applicant_events;
  CREATE POLICY "applicant_events_no_anon" ON public.applicant_events FOR ALL TO anon USING (false) WITH CHECK (false);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: applicant_events | Policy: applicant_events_select_admin | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "applicant_events_select_admin" ON public.applicant_events;
  CREATE POLICY "applicant_events_select_admin" ON public.applicant_events FOR SELECT TO authenticated USING ((get_user_role() = 'admin'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: applicants | Policy: applicants_all_service_role | Cmd: ALL | Roles: service_role
DO $$ BEGIN
  DROP POLICY IF EXISTS "applicants_all_service_role" ON public.applicants;
  CREATE POLICY "applicants_all_service_role" ON public.applicants FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: applicants | Policy: applicants_no_anon | Cmd: ALL | Roles: anon
DO $$ BEGIN
  DROP POLICY IF EXISTS "applicants_no_anon" ON public.applicants;
  CREATE POLICY "applicants_no_anon" ON public.applicants FOR ALL TO anon USING (false) WITH CHECK (false);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: applicants | Policy: applicants_select_admin | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "applicants_select_admin" ON public.applicants;
  CREATE POLICY "applicants_select_admin" ON public.applicants FOR SELECT TO authenticated USING ((get_user_role() = 'admin'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: appointments | Policy: appointments_all_service_role | Cmd: ALL | Roles: service_role
DO $$ BEGIN
  DROP POLICY IF EXISTS "appointments_all_service_role" ON public.appointments;
  CREATE POLICY "appointments_all_service_role" ON public.appointments FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: appointments | Policy: appointments_no_anon | Cmd: ALL | Roles: anon
DO $$ BEGIN
  DROP POLICY IF EXISTS "appointments_no_anon" ON public.appointments;
  CREATE POLICY "appointments_no_anon" ON public.appointments FOR ALL TO anon USING (false) WITH CHECK (false);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: appointments | Policy: appointments_select_admin | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "appointments_select_admin" ON public.appointments;
  CREATE POLICY "appointments_select_admin" ON public.appointments FOR SELECT TO authenticated USING ((get_user_role() = 'admin'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: appointments | Policy: appointments_update_admin | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "appointments_update_admin" ON public.appointments;
  CREATE POLICY "appointments_update_admin" ON public.appointments FOR UPDATE TO authenticated USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: asistencia_maestros | Policy: asistencia_maestros_admin_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "asistencia_maestros_admin_all" ON public.asistencia_maestros;
  CREATE POLICY "asistencia_maestros_admin_all" ON public.asistencia_maestros FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: asistencia_maestros | Policy: asistencia_maestros_self_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "asistencia_maestros_self_read" ON public.asistencia_maestros;
  CREATE POLICY "asistencia_maestros_self_read" ON public.asistencia_maestros FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM maestros m
  WHERE ((m.id = asistencia_maestros.maestro_id) AND (m.user_id = auth.uid())))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: asistencias | Policy: Maestros gestionan sus asistencias | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Maestros gestionan sus asistencias" ON public.asistencias;
  CREATE POLICY "Maestros gestionan sus asistencias" ON public.asistencias FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM sesiones_clase s
  WHERE ((s.id = asistencias.sesion_clase_id) AND ((s.maestro_id = maestro_actual()) OR maestro_en_clase(s.clase_id)))))) WITH CHECK ((tiene_permiso('asistencias:write'::text) AND (EXISTS ( SELECT 1
   FROM sesiones_clase s
  WHERE ((s.id = asistencias.sesion_clase_id) AND ((s.maestro_id = maestro_actual()) OR maestro_en_clase(s.clase_id)))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: asistencias | Policy: asistencias_admin_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "asistencias_admin_insert" ON public.asistencias;
  CREATE POLICY "asistencias_admin_insert" ON public.asistencias FOR INSERT TO authenticated WITH CHECK ((es_admin() OR (EXISTS ( SELECT 1
   FROM sesiones_clase s
  WHERE ((s.id = asistencias.sesion_clase_id) AND ((s.maestro_id = maestro_actual()) OR maestro_en_clase(s.clase_id)))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: asistencias | Policy: asistencias_admin_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "asistencias_admin_select" ON public.asistencias;
  CREATE POLICY "asistencias_admin_select" ON public.asistencias FOR SELECT TO authenticated USING ((es_admin() OR (EXISTS ( SELECT 1
   FROM sesiones_clase s
  WHERE ((s.id = asistencias.sesion_clase_id) AND ((s.maestro_id = maestro_actual()) OR maestro_en_clase(s.clase_id)))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: asistencias | Policy: asistencias_admin_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "asistencias_admin_update" ON public.asistencias;
  CREATE POLICY "asistencias_admin_update" ON public.asistencias FOR UPDATE TO authenticated USING ((es_admin() OR (EXISTS ( SELECT 1
   FROM sesiones_clase s
  WHERE ((s.id = asistencias.sesion_clase_id) AND ((s.maestro_id = maestro_actual()) OR maestro_en_clase(s.clase_id))))))) WITH CHECK ((es_admin() OR (EXISTS ( SELECT 1
   FROM sesiones_clase s
  WHERE ((s.id = asistencias.sesion_clase_id) AND ((s.maestro_id = maestro_actual()) OR maestro_en_clase(s.clase_id)))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: asistencias | Policy: asistencias_superadmin_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "asistencias_superadmin_delete" ON public.asistencias;
  CREATE POLICY "asistencias_superadmin_delete" ON public.asistencias FOR DELETE TO authenticated USING ((( SELECT is_super_admin() AS is_super_admin) = true));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: ausencias | Policy: Authenticated users can view ausencias | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can view ausencias" ON public.ausencias;
  CREATE POLICY "Authenticated users can view ausencias" ON public.ausencias FOR SELECT USING ((auth.role() = 'authenticated'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: ausencias | Policy: Maestros gestionan sus ausencias | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Maestros gestionan sus ausencias" ON public.ausencias;
  CREATE POLICY "Maestros gestionan sus ausencias" ON public.ausencias FOR ALL TO authenticated USING ((maestro_id = maestro_actual()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: ausencias | Policy: Service role has full access to ausencias | Cmd: ALL | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role has full access to ausencias" ON public.ausencias;
  CREATE POLICY "Service role has full access to ausencias" ON public.ausencias FOR ALL USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: ausencias | Policy: ausencias_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "ausencias_admin_read" ON public.ausencias;
  CREATE POLICY "ausencias_admin_read" ON public.ausencias FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: ausencias_auditoria | Policy: ausencias_auditoria_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "ausencias_auditoria_insert" ON public.ausencias_auditoria;
  CREATE POLICY "ausencias_auditoria_insert" ON public.ausencias_auditoria FOR INSERT TO authenticated WITH CHECK ((actor_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: ausencias_auditoria | Policy: ausencias_auditoria_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "ausencias_auditoria_select" ON public.ausencias_auditoria;
  CREATE POLICY "ausencias_auditoria_select" ON public.ausencias_auditoria FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: ausencias_maestros | Policy: Maestros pueden cancelar sus propias solicitudes | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "Maestros pueden cancelar sus propias solicitudes" ON public.ausencias_maestros;
  CREATE POLICY "Maestros pueden cancelar sus propias solicitudes" ON public.ausencias_maestros FOR UPDATE USING ((maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: ausencias_maestros | Policy: Maestros pueden crear sus propias solicitudes | Cmd: INSERT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "Maestros pueden crear sus propias solicitudes" ON public.ausencias_maestros;
  CREATE POLICY "Maestros pueden crear sus propias solicitudes" ON public.ausencias_maestros FOR INSERT WITH CHECK ((maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: ausencias_maestros | Policy: Maestros pueden ver sus propias ausencias | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "Maestros pueden ver sus propias ausencias" ON public.ausencias_maestros;
  CREATE POLICY "Maestros pueden ver sus propias ausencias" ON public.ausencias_maestros FOR SELECT USING ((maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: ausencias_maestros | Policy: ausencias_maestros_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "ausencias_maestros_admin_read" ON public.ausencias_maestros;
  CREATE POLICY "ausencias_maestros_admin_read" ON public.ausencias_maestros FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: becas | Policy: becas_all_admin | Cmd: ALL | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "becas_all_admin" ON public.becas;
  CREATE POLICY "becas_all_admin" ON public.becas FOR ALL USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: becas | Policy: becas_select_cajero_admin | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "becas_select_cajero_admin" ON public.becas;
  CREATE POLICY "becas_select_cajero_admin" ON public.becas FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: blocks | Policy: Maestros pueden leer bloques de rutas | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Maestros pueden leer bloques de rutas" ON public.blocks;
  CREATE POLICY "Maestros pueden leer bloques de rutas" ON public.blocks FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: blocks | Policy: blocks_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "blocks_admin_read" ON public.blocks;
  CREATE POLICY "blocks_admin_read" ON public.blocks FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: blocks | Policy: maestros_write_own_draft_blocks | Cmd: ALL | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestros_write_own_draft_blocks" ON public.blocks;
  CREATE POLICY "maestros_write_own_draft_blocks" ON public.blocks FOR ALL USING ((route_version_id IN ( SELECT route_versions.id
   FROM route_versions
  WHERE ((route_versions.created_by = auth.uid()) AND (route_versions.status = 'draft'::route_status))))) WITH CHECK ((route_version_id IN ( SELECT route_versions.id
   FROM route_versions
  WHERE ((route_versions.created_by = auth.uid()) AND (route_versions.status = 'draft'::route_status)))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: calendario | Policy: calendario_admin_all | Cmd: ALL | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "calendario_admin_all" ON public.calendario;
  CREATE POLICY "calendario_admin_all" ON public.calendario FOR ALL USING ((get_user_role() = 'admin'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: calendario | Policy: calendario_insert_own_dept | Cmd: INSERT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "calendario_insert_own_dept" ON public.calendario;
  CREATE POLICY "calendario_insert_own_dept" ON public.calendario FOR INSERT WITH CHECK (((departamento_id IN ( SELECT usuario_departamentos.departamento_id
   FROM usuario_departamentos
  WHERE (usuario_departamentos.user_id = auth.uid()))) AND (created_by = auth.uid())));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: calendario | Policy: calendario_select_own_dept | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "calendario_select_own_dept" ON public.calendario;
  CREATE POLICY "calendario_select_own_dept" ON public.calendario FOR SELECT USING ((departamento_id IN ( SELECT usuario_departamentos.departamento_id
   FROM usuario_departamentos
  WHERE (usuario_departamentos.user_id = auth.uid()))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: calendario | Policy: calendario_update_own_dept | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "calendario_update_own_dept" ON public.calendario;
  CREATE POLICY "calendario_update_own_dept" ON public.calendario FOR UPDATE USING ((departamento_id IN ( SELECT usuario_departamentos.departamento_id
   FROM usuario_departamentos
  WHERE (usuario_departamentos.user_id = auth.uid()))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: calendario_institucional | Policy: calendario_auth_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "calendario_auth_all" ON public.calendario_institucional;
  CREATE POLICY "calendario_auth_all" ON public.calendario_institucional FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: campania_envios | Policy: ce_admin_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "ce_admin_all" ON public.campania_envios;
  CREATE POLICY "ce_admin_all" ON public.campania_envios FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: campanias_periodo | Policy: cp_admin_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "cp_admin_all" ON public.campanias_periodo;
  CREATE POLICY "cp_admin_all" ON public.campanias_periodo FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: catalogo_niveles | Policy: catalogo_niveles_admin | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "catalogo_niveles_admin" ON public.catalogo_niveles;
  CREATE POLICY "catalogo_niveles_admin" ON public.catalogo_niveles FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: catalogo_niveles | Policy: catalogo_niveles_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "catalogo_niveles_read" ON public.catalogo_niveles;
  CREATE POLICY "catalogo_niveles_read" ON public.catalogo_niveles FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: catalogo_objetivos_especificos | Policy: catalogo_objetivos_especificos_admin | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "catalogo_objetivos_especificos_admin" ON public.catalogo_objetivos_especificos;
  CREATE POLICY "catalogo_objetivos_especificos_admin" ON public.catalogo_objetivos_especificos FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: catalogo_objetivos_especificos | Policy: catalogo_objetivos_especificos_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "catalogo_objetivos_especificos_read" ON public.catalogo_objetivos_especificos;
  CREATE POLICY "catalogo_objetivos_especificos_read" ON public.catalogo_objetivos_especificos FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: catalogo_objetivos_generales | Policy: catalogo_objetivos_generales_admin | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "catalogo_objetivos_generales_admin" ON public.catalogo_objetivos_generales;
  CREATE POLICY "catalogo_objetivos_generales_admin" ON public.catalogo_objetivos_generales FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: catalogo_objetivos_generales | Policy: catalogo_objetivos_generales_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "catalogo_objetivos_generales_read" ON public.catalogo_objetivos_generales;
  CREATE POLICY "catalogo_objetivos_generales_read" ON public.catalogo_objetivos_generales FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: catalogos | Policy: catalogos_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "catalogos_admin_read" ON public.catalogos;
  CREATE POLICY "catalogos_admin_read" ON public.catalogos FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: clase_horarios | Policy: Permitir actualizar clase_horarios | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "Permitir actualizar clase_horarios" ON public.clase_horarios;
  CREATE POLICY "Permitir actualizar clase_horarios" ON public.clase_horarios FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: clase_horarios | Policy: Permitir crear clase_horarios | Cmd: INSERT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "Permitir crear clase_horarios" ON public.clase_horarios;
  CREATE POLICY "Permitir crear clase_horarios" ON public.clase_horarios FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: clase_horarios | Policy: Permitir eliminar clase_horarios | Cmd: DELETE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "Permitir eliminar clase_horarios" ON public.clase_horarios;
  CREATE POLICY "Permitir eliminar clase_horarios" ON public.clase_horarios FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: clase_horarios | Policy: clase_horarios_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "clase_horarios_admin_read" ON public.clase_horarios;
  CREATE POLICY "clase_horarios_admin_read" ON public.clase_horarios FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: clase_horarios | Policy: clase_horarios_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "clase_horarios_delete" ON public.clase_horarios;
  CREATE POLICY "clase_horarios_delete" ON public.clase_horarios FOR DELETE TO authenticated USING (maestro_en_clase(clase_id));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: clase_horarios | Policy: clase_horarios_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "clase_horarios_insert" ON public.clase_horarios;
  CREATE POLICY "clase_horarios_insert" ON public.clase_horarios FOR INSERT TO authenticated WITH CHECK (maestro_en_clase(clase_id));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: clase_horarios | Policy: clase_horarios_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "clase_horarios_select" ON public.clase_horarios;
  CREATE POLICY "clase_horarios_select" ON public.clase_horarios FOR SELECT TO authenticated USING (maestro_en_clase(clase_id));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: clase_horarios | Policy: clase_horarios_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "clase_horarios_update" ON public.clase_horarios;
  CREATE POLICY "clase_horarios_update" ON public.clase_horarios FOR UPDATE TO authenticated USING (maestro_en_clase(clase_id)) WITH CHECK (maestro_en_clase(clase_id));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: clase_mapa_indicadores | Policy: clase_mapa_indicadores_owner | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "clase_mapa_indicadores_owner" ON public.clase_mapa_indicadores;
  CREATE POLICY "clase_mapa_indicadores_owner" ON public.clase_mapa_indicadores FOR ALL TO authenticated USING ((es_admin() OR es_coordinador_acm() OR es_maestro_titular_de_clase(clase_id))) WITH CHECK ((es_admin() OR es_coordinador_acm() OR es_maestro_titular_de_clase(clase_id)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: clase_mapa_objetivos | Policy: clase_mapa_objetivos_owner | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "clase_mapa_objetivos_owner" ON public.clase_mapa_objetivos;
  CREATE POLICY "clase_mapa_objetivos_owner" ON public.clase_mapa_objetivos FOR ALL TO authenticated USING ((es_admin() OR es_coordinador_acm() OR es_maestro_titular_de_clase(clase_id))) WITH CHECK ((es_admin() OR es_coordinador_acm() OR es_maestro_titular_de_clase(clase_id)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: clases | Policy: Maestros ven sus clases | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Maestros ven sus clases" ON public.clases;
  CREATE POLICY "Maestros ven sus clases" ON public.clases FOR SELECT TO authenticated USING (((maestro_principal_id = maestro_actual()) OR (maestro_suplente_id = maestro_actual())));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: clases | Policy: Permitir actualizar clases | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "Permitir actualizar clases" ON public.clases;
  CREATE POLICY "Permitir actualizar clases" ON public.clases FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: clases | Policy: Permitir crear clases | Cmd: INSERT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "Permitir crear clases" ON public.clases;
  CREATE POLICY "Permitir crear clases" ON public.clases FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: clases | Policy: Permitir eliminar clases | Cmd: DELETE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "Permitir eliminar clases" ON public.clases;
  CREATE POLICY "Permitir eliminar clases" ON public.clases FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: clases | Policy: Permitir leer todas las clases | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "Permitir leer todas las clases" ON public.clases;
  CREATE POLICY "Permitir leer todas las clases" ON public.clases FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: clases | Policy: clases_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "clases_admin_read" ON public.clases;
  CREATE POLICY "clases_admin_read" ON public.clases FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: clases_emergentes | Policy: clases_emergentes_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "clases_emergentes_admin_read" ON public.clases_emergentes;
  CREATE POLICY "clases_emergentes_admin_read" ON public.clases_emergentes FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: clases_emergentes | Policy: clases_emergentes_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "clases_emergentes_delete" ON public.clases_emergentes;
  CREATE POLICY "clases_emergentes_delete" ON public.clases_emergentes FOR DELETE TO authenticated USING ((maestro_id = maestro_actual()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: clases_emergentes | Policy: clases_emergentes_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "clases_emergentes_insert" ON public.clases_emergentes;
  CREATE POLICY "clases_emergentes_insert" ON public.clases_emergentes FOR INSERT TO authenticated WITH CHECK ((maestro_id = maestro_actual()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: clases_emergentes | Policy: clases_emergentes_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "clases_emergentes_select" ON public.clases_emergentes;
  CREATE POLICY "clases_emergentes_select" ON public.clases_emergentes FOR SELECT TO authenticated USING (((maestro_id = maestro_actual()) OR maestro_en_clase(clase_id)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: clases_emergentes | Policy: clases_emergentes_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "clases_emergentes_update" ON public.clases_emergentes;
  CREATE POLICY "clases_emergentes_update" ON public.clases_emergentes FOR UPDATE TO authenticated USING ((maestro_id = maestro_actual())) WITH CHECK ((maestro_id = maestro_actual()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: class_event_methodology | Policy: cem_delete_all | Cmd: DELETE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "cem_delete_all" ON public.class_event_methodology;
  CREATE POLICY "cem_delete_all" ON public.class_event_methodology FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: class_event_methodology | Policy: cem_insert_all | Cmd: INSERT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "cem_insert_all" ON public.class_event_methodology;
  CREATE POLICY "cem_insert_all" ON public.class_event_methodology FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: class_event_methodology | Policy: cem_select_all | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "cem_select_all" ON public.class_event_methodology;
  CREATE POLICY "cem_select_all" ON public.class_event_methodology FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: class_event_methodology | Policy: cem_update_all | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "cem_update_all" ON public.class_event_methodology;
  CREATE POLICY "cem_update_all" ON public.class_event_methodology FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: class_event_methodology | Policy: class_event_methodology_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "class_event_methodology_admin_read" ON public.class_event_methodology;
  CREATE POLICY "class_event_methodology_admin_read" ON public.class_event_methodology FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: class_events | Policy: ce_delete_all | Cmd: DELETE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "ce_delete_all" ON public.class_events;
  CREATE POLICY "ce_delete_all" ON public.class_events FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: class_events | Policy: ce_insert_all | Cmd: INSERT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "ce_insert_all" ON public.class_events;
  CREATE POLICY "ce_insert_all" ON public.class_events FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: class_events | Policy: ce_select_all | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "ce_select_all" ON public.class_events;
  CREATE POLICY "ce_select_all" ON public.class_events FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: class_events | Policy: ce_update_all | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "ce_update_all" ON public.class_events;
  CREATE POLICY "ce_update_all" ON public.class_events FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: class_events | Policy: class_events_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "class_events_admin_read" ON public.class_events;
  CREATE POLICY "class_events_admin_read" ON public.class_events FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: class_session_content_snapshots | Policy: Authenticated can insert content snapshots | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated can insert content snapshots" ON public.class_session_content_snapshots;
  CREATE POLICY "Authenticated can insert content snapshots" ON public.class_session_content_snapshots FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: class_session_content_snapshots | Policy: Authenticated can read content snapshots | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated can read content snapshots" ON public.class_session_content_snapshots;
  CREATE POLICY "Authenticated can read content snapshots" ON public.class_session_content_snapshots FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: class_session_content_snapshots | Policy: class_session_content_snapshots_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "class_session_content_snapshots_admin_read" ON public.class_session_content_snapshots;
  CREATE POLICY "class_session_content_snapshots_admin_read" ON public.class_session_content_snapshots FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: cobertura_alumno_objetivo | Policy: cobertura_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "cobertura_insert" ON public.cobertura_alumno_objetivo;
  CREATE POLICY "cobertura_insert" ON public.cobertura_alumno_objetivo FOR INSERT TO authenticated WITH CHECK ((maestro_id = maestro_actual()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: cobertura_alumno_objetivo | Policy: cobertura_select_maestro | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "cobertura_select_maestro" ON public.cobertura_alumno_objetivo;
  CREATE POLICY "cobertura_select_maestro" ON public.cobertura_alumno_objetivo FOR SELECT TO authenticated USING (((maestro_id = maestro_actual()) OR es_admin()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: cobertura_alumno_objetivo | Policy: cobertura_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "cobertura_update" ON public.cobertura_alumno_objetivo;
  CREATE POLICY "cobertura_update" ON public.cobertura_alumno_objetivo FOR UPDATE TO authenticated USING ((maestro_id = maestro_actual()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: comodatos_activos | Policy: comodatos_admin_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "comodatos_admin_insert" ON public.comodatos_activos;
  CREATE POLICY "comodatos_admin_insert" ON public.comodatos_activos FOR INSERT TO authenticated WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: comodatos_activos | Policy: comodatos_admin_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "comodatos_admin_update" ON public.comodatos_activos;
  CREATE POLICY "comodatos_admin_update" ON public.comodatos_activos FOR UPDATE TO authenticated USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: comodatos_activos | Policy: comodatos_authenticated_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "comodatos_authenticated_select" ON public.comodatos_activos;
  CREATE POLICY "comodatos_authenticated_select" ON public.comodatos_activos FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: compromisos_pago | Policy: compromisos_all_admin | Cmd: ALL | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "compromisos_all_admin" ON public.compromisos_pago;
  CREATE POLICY "compromisos_all_admin" ON public.compromisos_pago FOR ALL USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: compromisos_pago | Policy: compromisos_select_cajero_admin | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "compromisos_select_cajero_admin" ON public.compromisos_pago;
  CREATE POLICY "compromisos_select_cajero_admin" ON public.compromisos_pago FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: comunicaciones_seguimiento | Policy: com_seg_delete_authenticated | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "com_seg_delete_authenticated" ON public.comunicaciones_seguimiento;
  CREATE POLICY "com_seg_delete_authenticated" ON public.comunicaciones_seguimiento FOR DELETE TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: comunicaciones_seguimiento | Policy: com_seg_insert_authenticated | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "com_seg_insert_authenticated" ON public.comunicaciones_seguimiento;
  CREATE POLICY "com_seg_insert_authenticated" ON public.comunicaciones_seguimiento FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: comunicaciones_seguimiento | Policy: com_seg_select_authenticated | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "com_seg_select_authenticated" ON public.comunicaciones_seguimiento;
  CREATE POLICY "com_seg_select_authenticated" ON public.comunicaciones_seguimiento FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: comunicaciones_seguimiento | Policy: com_seg_update_authenticated | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "com_seg_update_authenticated" ON public.comunicaciones_seguimiento;
  CREATE POLICY "com_seg_update_authenticated" ON public.comunicaciones_seguimiento FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: configuracion_aranceles | Policy: configuracion_aranceles_modify_authorized | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "configuracion_aranceles_modify_authorized" ON public.configuracion_aranceles;
  CREATE POLICY "configuracion_aranceles_modify_authorized" ON public.configuracion_aranceles FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.rol = ANY (ARRAY['admin'::text, 'finanzas'::text, 'director'::text])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.rol = ANY (ARRAY['admin'::text, 'finanzas'::text, 'director'::text]))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: configuracion_aranceles | Policy: configuracion_aranceles_read_all | Cmd: SELECT | Roles: anon, authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "configuracion_aranceles_read_all" ON public.configuracion_aranceles;
  CREATE POLICY "configuracion_aranceles_read_all" ON public.configuracion_aranceles FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: configuracion_recordatorios | Policy: configuracion_recordatorios_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "configuracion_recordatorios_admin_read" ON public.configuracion_recordatorios;
  CREATE POLICY "configuracion_recordatorios_admin_read" ON public.configuracion_recordatorios FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: configuracion_recordatorios | Policy: configuracion_recordatorios_authenticated_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "configuracion_recordatorios_authenticated_all" ON public.configuracion_recordatorios;
  CREATE POLICY "configuracion_recordatorios_authenticated_all" ON public.configuracion_recordatorios FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: contactos_alianzas | Policy: contactos_alianzas_autenticados | Cmd: ALL | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "contactos_alianzas_autenticados" ON public.contactos_alianzas;
  CREATE POLICY "contactos_alianzas_autenticados" ON public.contactos_alianzas FOR ALL USING ((auth.role() = 'authenticated'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: contenidos_sesion | Policy: Maestros gestionan contenidos de sus sesiones | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Maestros gestionan contenidos de sus sesiones" ON public.contenidos_sesion;
  CREATE POLICY "Maestros gestionan contenidos de sus sesiones" ON public.contenidos_sesion FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM sesiones_clase s
  WHERE ((s.id = contenidos_sesion.sesion_clase_id) AND ((s.maestro_id = maestro_actual()) OR maestro_en_clase(s.clase_id))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: contenidos_sesion | Policy: contenidos_admin_all | Cmd: ALL | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "contenidos_admin_all" ON public.contenidos_sesion;
  CREATE POLICY "contenidos_admin_all" ON public.contenidos_sesion FOR ALL USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: contenidos_sesion | Policy: contenidos_sesion_admin_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "contenidos_sesion_admin_insert" ON public.contenidos_sesion;
  CREATE POLICY "contenidos_sesion_admin_insert" ON public.contenidos_sesion FOR INSERT TO authenticated WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: contenidos_sesion | Policy: contenidos_sesion_admin_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "contenidos_sesion_admin_select" ON public.contenidos_sesion;
  CREATE POLICY "contenidos_sesion_admin_select" ON public.contenidos_sesion FOR SELECT TO authenticated USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: contenidos_sesion | Policy: contenidos_sesion_admin_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "contenidos_sesion_admin_update" ON public.contenidos_sesion;
  CREATE POLICY "contenidos_sesion_admin_update" ON public.contenidos_sesion FOR UPDATE TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: contenidos_sesion | Policy: contenidos_sesion_authenticated_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "contenidos_sesion_authenticated_all" ON public.contenidos_sesion;
  CREATE POLICY "contenidos_sesion_authenticated_all" ON public.contenidos_sesion FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: contenidos_sesion | Policy: contenidos_sesion_superadmin_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "contenidos_sesion_superadmin_delete" ON public.contenidos_sesion;
  CREATE POLICY "contenidos_sesion_superadmin_delete" ON public.contenidos_sesion FOR DELETE TO authenticated USING ((( SELECT is_super_admin() AS is_super_admin) = true));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: conversaciones_whatsapp | Policy: allow_all_conversaciones | Cmd: ALL | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "allow_all_conversaciones" ON public.conversaciones_whatsapp;
  CREATE POLICY "allow_all_conversaciones" ON public.conversaciones_whatsapp FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: cuotas | Policy: cuotas_insert_cajero_admin | Cmd: INSERT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "cuotas_insert_cajero_admin" ON public.cuotas;
  CREATE POLICY "cuotas_insert_cajero_admin" ON public.cuotas FOR INSERT WITH CHECK ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: cuotas | Policy: cuotas_select_cajero_admin | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "cuotas_select_cajero_admin" ON public.cuotas;
  CREATE POLICY "cuotas_select_cajero_admin" ON public.cuotas FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: cuotas | Policy: cuotas_select_representante | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "cuotas_select_representante" ON public.cuotas;
  CREATE POLICY "cuotas_select_representante" ON public.cuotas FOR SELECT USING (((get_user_role() = 'representante'::text) AND (familia_id = get_user_familia_id())));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: cuotas | Policy: cuotas_update_admin | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "cuotas_update_admin" ON public.cuotas;
  CREATE POLICY "cuotas_update_admin" ON public.cuotas FOR UPDATE USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: curriculo_objetivos | Policy: objetivos_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "objetivos_delete" ON public.curriculo_objetivos;
  CREATE POLICY "objetivos_delete" ON public.curriculo_objetivos FOR DELETE TO authenticated USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: curriculo_objetivos | Policy: objetivos_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "objetivos_insert" ON public.curriculo_objetivos;
  CREATE POLICY "objetivos_insert" ON public.curriculo_objetivos FOR INSERT TO authenticated WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: curriculo_objetivos | Policy: objetivos_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "objetivos_select" ON public.curriculo_objetivos;
  CREATE POLICY "objetivos_select" ON public.curriculo_objetivos FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: curriculo_objetivos | Policy: objetivos_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "objetivos_update" ON public.curriculo_objetivos;
  CREATE POLICY "objetivos_update" ON public.curriculo_objetivos FOR UPDATE TO authenticated USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: curriculo_pilares | Policy: pilares_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "pilares_delete" ON public.curriculo_pilares;
  CREATE POLICY "pilares_delete" ON public.curriculo_pilares FOR DELETE TO authenticated USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: curriculo_pilares | Policy: pilares_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "pilares_insert" ON public.curriculo_pilares;
  CREATE POLICY "pilares_insert" ON public.curriculo_pilares FOR INSERT TO authenticated WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: curriculo_pilares | Policy: pilares_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "pilares_select" ON public.curriculo_pilares;
  CREATE POLICY "pilares_select" ON public.curriculo_pilares FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: curriculo_pilares | Policy: pilares_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "pilares_update" ON public.curriculo_pilares;
  CREATE POLICY "pilares_update" ON public.curriculo_pilares FOR UPDATE TO authenticated USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: curriculos | Policy: curriculos_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "curriculos_delete" ON public.curriculos;
  CREATE POLICY "curriculos_delete" ON public.curriculos FOR DELETE TO authenticated USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: curriculos | Policy: curriculos_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "curriculos_insert" ON public.curriculos;
  CREATE POLICY "curriculos_insert" ON public.curriculos FOR INSERT TO authenticated WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: curriculos | Policy: curriculos_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "curriculos_select" ON public.curriculos;
  CREATE POLICY "curriculos_select" ON public.curriculos FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: curriculos | Policy: curriculos_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "curriculos_update" ON public.curriculos;
  CREATE POLICY "curriculos_update" ON public.curriculos FOR UPDATE TO authenticated USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: departamentos | Policy: departamentos_authenticated_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "departamentos_authenticated_all" ON public.departamentos;
  CREATE POLICY "departamentos_authenticated_all" ON public.departamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: document_batches | Policy: rls_document_batches_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "rls_document_batches_all" ON public.document_batches;
  CREATE POLICY "rls_document_batches_all" ON public.document_batches FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: document_templates | Policy: rls_document_templates_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "rls_document_templates_all" ON public.document_templates;
  CREATE POLICY "rls_document_templates_all" ON public.document_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: ejercicios | Policy: ejercicios_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "ejercicios_admin_read" ON public.ejercicios;
  CREATE POLICY "ejercicios_admin_read" ON public.ejercicios FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: ejercicios | Policy: ejercicios_authenticated_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "ejercicios_authenticated_all" ON public.ejercicios;
  CREATE POLICY "ejercicios_authenticated_all" ON public.ejercicios FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: evaluacion_indicador | Policy: admin_all_ei | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "admin_all_ei" ON public.evaluacion_indicador;
  CREATE POLICY "admin_all_ei" ON public.evaluacion_indicador FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: evaluacion_indicador | Policy: ei_owner | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "ei_owner" ON public.evaluacion_indicador;
  CREATE POLICY "ei_owner" ON public.evaluacion_indicador FOR ALL TO authenticated USING ((es_admin() OR es_maestro_de_clase(clase_id))) WITH CHECK ((es_maestro_de_clase(clase_id) AND (evaluado_por = maestro_actual())));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: evaluacion_indicador | Policy: teacher_delete_own_ei | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "teacher_delete_own_ei" ON public.evaluacion_indicador;
  CREATE POLICY "teacher_delete_own_ei" ON public.evaluacion_indicador FOR DELETE TO authenticated USING (((evaluado_por = auth.uid()) OR es_admin()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: evaluacion_indicador | Policy: teacher_insert_ei | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "teacher_insert_ei" ON public.evaluacion_indicador;
  CREATE POLICY "teacher_insert_ei" ON public.evaluacion_indicador FOR INSERT TO authenticated WITH CHECK (((evaluado_por = auth.uid()) OR (evaluado_por IS NULL) OR es_admin()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: evaluacion_indicador | Policy: teacher_read_own_ei | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "teacher_read_own_ei" ON public.evaluacion_indicador;
  CREATE POLICY "teacher_read_own_ei" ON public.evaluacion_indicador FOR SELECT TO authenticated USING (((evaluado_por = auth.uid()) OR (evaluado_por IS NULL) OR es_admin()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: evaluacion_indicador | Policy: teacher_update_own_ei | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "teacher_update_own_ei" ON public.evaluacion_indicador;
  CREATE POLICY "teacher_update_own_ei" ON public.evaluacion_indicador FOR UPDATE TO authenticated USING (((evaluado_por = auth.uid()) OR (evaluado_por IS NULL) OR es_admin())) WITH CHECK (((evaluado_por = auth.uid()) OR (evaluado_por IS NULL) OR es_admin()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: evaluations | Policy: Evaluations delete policy | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Evaluations delete policy" ON public.evaluations;
  CREATE POLICY "Evaluations delete policy" ON public.evaluations FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM app_users au
  WHERE ((au.id = auth.uid()) AND ((au.role = 'admin'::text) OR ((au.role = 'jurado'::text) AND (au.jurado_id = evaluations.jurado_id)))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: evaluations | Policy: Evaluations insert policy | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Evaluations insert policy" ON public.evaluations;
  CREATE POLICY "Evaluations insert policy" ON public.evaluations FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM app_users au
  WHERE ((au.id = auth.uid()) AND ((au.role = 'admin'::text) OR ((au.role = 'jurado'::text) AND (au.jurado_id = evaluations.jurado_id)))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: evaluations | Policy: Evaluations read policy | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Evaluations read policy" ON public.evaluations;
  CREATE POLICY "Evaluations read policy" ON public.evaluations FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM app_users au
  WHERE ((au.id = auth.uid()) AND ((au.role = 'admin'::text) OR ((au.role = 'jurado'::text) AND (au.jurado_id = evaluations.jurado_id)))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: evaluations | Policy: Evaluations update policy | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Evaluations update policy" ON public.evaluations;
  CREATE POLICY "Evaluations update policy" ON public.evaluations FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM app_users au
  WHERE ((au.id = auth.uid()) AND ((au.role = 'admin'::text) OR ((au.role = 'jurado'::text) AND (au.jurado_id = evaluations.jurado_id))))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM app_users au
  WHERE ((au.id = auth.uid()) AND ((au.role = 'admin'::text) OR ((au.role = 'jurado'::text) AND (au.jurado_id = evaluations.jurado_id)))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: facturas_reparacion | Policy: facturas_admin_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "facturas_admin_delete" ON public.facturas_reparacion;
  CREATE POLICY "facturas_admin_delete" ON public.facturas_reparacion FOR DELETE TO authenticated USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: facturas_reparacion | Policy: facturas_admin_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "facturas_admin_insert" ON public.facturas_reparacion;
  CREATE POLICY "facturas_admin_insert" ON public.facturas_reparacion FOR INSERT TO authenticated WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: facturas_reparacion | Policy: facturas_admin_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "facturas_admin_update" ON public.facturas_reparacion;
  CREATE POLICY "facturas_admin_update" ON public.facturas_reparacion FOR UPDATE TO authenticated USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: facturas_reparacion | Policy: facturas_authenticated_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "facturas_authenticated_select" ON public.facturas_reparacion;
  CREATE POLICY "facturas_authenticated_select" ON public.facturas_reparacion FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: familias | Policy: familias_all_admin | Cmd: ALL | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "familias_all_admin" ON public.familias;
  CREATE POLICY "familias_all_admin" ON public.familias FOR ALL USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: familias | Policy: familias_select_cajero_admin | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "familias_select_cajero_admin" ON public.familias;
  CREATE POLICY "familias_select_cajero_admin" ON public.familias FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: familias | Policy: familias_select_representante | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "familias_select_representante" ON public.familias;
  CREATE POLICY "familias_select_representante" ON public.familias FOR SELECT USING (((get_user_role() = 'representante'::text) AND (id = get_user_familia_id())));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: finanzas_politica_cobranza | Policy: finanzas_politica_cobranza_authenticated_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "finanzas_politica_cobranza_authenticated_read" ON public.finanzas_politica_cobranza;
  CREATE POLICY "finanzas_politica_cobranza_authenticated_read" ON public.finanzas_politica_cobranza FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: gastos_fijos | Policy: gastos_fijos_insert_finanzas_admin | Cmd: INSERT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "gastos_fijos_insert_finanzas_admin" ON public.gastos_fijos;
  CREATE POLICY "gastos_fijos_insert_finanzas_admin" ON public.gastos_fijos FOR INSERT WITH CHECK ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: gastos_fijos | Policy: gastos_fijos_select_finanzas_admin | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "gastos_fijos_select_finanzas_admin" ON public.gastos_fijos;
  CREATE POLICY "gastos_fijos_select_finanzas_admin" ON public.gastos_fijos FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: gastos_fijos | Policy: gastos_fijos_update_admin | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "gastos_fijos_update_admin" ON public.gastos_fijos;
  CREATE POLICY "gastos_fijos_update_admin" ON public.gastos_fijos FOR UPDATE USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: gastos_fijos_pagos | Policy: gastos_fijos_pagos_insert_finanzas_admin | Cmd: INSERT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "gastos_fijos_pagos_insert_finanzas_admin" ON public.gastos_fijos_pagos;
  CREATE POLICY "gastos_fijos_pagos_insert_finanzas_admin" ON public.gastos_fijos_pagos FOR INSERT WITH CHECK ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: gastos_fijos_pagos | Policy: gastos_fijos_pagos_select_finanzas_admin | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "gastos_fijos_pagos_select_finanzas_admin" ON public.gastos_fijos_pagos;
  CREATE POLICY "gastos_fijos_pagos_select_finanzas_admin" ON public.gastos_fijos_pagos FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: gastos_fijos_pagos | Policy: gastos_fijos_pagos_update_finanzas_admin | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "gastos_fijos_pagos_update_finanzas_admin" ON public.gastos_fijos_pagos;
  CREATE POLICY "gastos_fijos_pagos_update_finanzas_admin" ON public.gastos_fijos_pagos FOR UPDATE USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text]))) WITH CHECK ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: generated_documents | Policy: rls_generated_documents_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "rls_generated_documents_all" ON public.generated_documents;
  CREATE POLICY "rls_generated_documents_all" ON public.generated_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: hermes_gateway_health | Policy: hgh_admin_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "hgh_admin_read" ON public.hermes_gateway_health;
  CREATE POLICY "hgh_admin_read" ON public.hermes_gateway_health FOR SELECT TO authenticated USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: hermes_gateway_health | Policy: hgh_service_role_all | Cmd: ALL | Roles: service_role
DO $$ BEGIN
  DROP POLICY IF EXISTS "hgh_service_role_all" ON public.hermes_gateway_health;
  CREATE POLICY "hgh_service_role_all" ON public.hermes_gateway_health FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: hermes_gateway_worker_lease | Policy: hermes_gateway_worker_lease_service_role | Cmd: ALL | Roles: service_role
DO $$ BEGIN
  DROP POLICY IF EXISTS "hermes_gateway_worker_lease_service_role" ON public.hermes_gateway_worker_lease;
  CREATE POLICY "hermes_gateway_worker_lease_service_role" ON public.hermes_gateway_worker_lease FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: hermes_inbox | Policy: hermes_inbox_service_only | Cmd: ALL | Roles: service_role
DO $$ BEGIN
  DROP POLICY IF EXISTS "hermes_inbox_service_only" ON public.hermes_inbox;
  CREATE POLICY "hermes_inbox_service_only" ON public.hermes_inbox FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: hermes_kanban_cards | Policy: hermes_kanban_cards_admin_write | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "hermes_kanban_cards_admin_write" ON public.hermes_kanban_cards;
  CREATE POLICY "hermes_kanban_cards_admin_write" ON public.hermes_kanban_cards FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: hermes_kanban_cards | Policy: hermes_kanban_cards_auth_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "hermes_kanban_cards_auth_read" ON public.hermes_kanban_cards;
  CREATE POLICY "hermes_kanban_cards_auth_read" ON public.hermes_kanban_cards FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: hermes_process_cases | Policy: hermes_process_cases_auth_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "hermes_process_cases_auth_all" ON public.hermes_process_cases;
  CREATE POLICY "hermes_process_cases_auth_all" ON public.hermes_process_cases FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: hermes_protocolos | Policy: protocolos_admin_write | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "protocolos_admin_write" ON public.hermes_protocolos;
  CREATE POLICY "protocolos_admin_write" ON public.hermes_protocolos FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: hermes_protocolos | Policy: protocolos_auth_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "protocolos_auth_read" ON public.hermes_protocolos;
  CREATE POLICY "protocolos_auth_read" ON public.hermes_protocolos FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: hermes_reactive_rules | Policy: hermes_rules_acm_select | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "hermes_rules_acm_select" ON public.hermes_reactive_rules;
  CREATE POLICY "hermes_rules_acm_select" ON public.hermes_reactive_rules FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'ACM'::text) AND (departamento = 'ACM'::text)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: hermes_reactive_rules | Policy: hermes_rules_acm_update | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "hermes_rules_acm_update" ON public.hermes_reactive_rules;
  CREATE POLICY "hermes_rules_acm_update" ON public.hermes_reactive_rules FOR UPDATE USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'ACM'::text) AND (departamento = 'ACM'::text))) WITH CHECK (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'ACM'::text) AND (departamento = 'ACM'::text)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: hermes_reactive_rules | Policy: hermes_rules_adm_select | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "hermes_rules_adm_select" ON public.hermes_reactive_rules;
  CREATE POLICY "hermes_rules_adm_select" ON public.hermes_reactive_rules FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'ADM'::text) AND (departamento = 'ADM'::text)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: hermes_reactive_rules | Policy: hermes_rules_adm_update | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "hermes_rules_adm_update" ON public.hermes_reactive_rules;
  CREATE POLICY "hermes_rules_adm_update" ON public.hermes_reactive_rules FOR UPDATE USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'ADM'::text) AND (departamento = 'ADM'::text))) WITH CHECK (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'ADM'::text) AND (departamento = 'ADM'::text)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: hermes_reactive_rules | Policy: hermes_rules_com_select | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "hermes_rules_com_select" ON public.hermes_reactive_rules;
  CREATE POLICY "hermes_rules_com_select" ON public.hermes_reactive_rules FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'COM'::text) AND (departamento = 'COM'::text)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: hermes_reactive_rules | Policy: hermes_rules_dir_insert | Cmd: INSERT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "hermes_rules_dir_insert" ON public.hermes_reactive_rules;
  CREATE POLICY "hermes_rules_dir_insert" ON public.hermes_reactive_rules FOR INSERT WITH CHECK (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'DIR'::text)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: hermes_reactive_rules | Policy: hermes_rules_dir_select | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "hermes_rules_dir_select" ON public.hermes_reactive_rules;
  CREATE POLICY "hermes_rules_dir_select" ON public.hermes_reactive_rules FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'DIR'::text)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: hermes_reactive_rules | Policy: hermes_rules_dir_update | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "hermes_rules_dir_update" ON public.hermes_reactive_rules;
  CREATE POLICY "hermes_rules_dir_update" ON public.hermes_reactive_rules FOR UPDATE USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'DIR'::text))) WITH CHECK (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'DIR'::text)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: hermes_reactive_rules | Policy: hermes_rules_fin_select | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "hermes_rules_fin_select" ON public.hermes_reactive_rules;
  CREATE POLICY "hermes_rules_fin_select" ON public.hermes_reactive_rules FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'FIN'::text) AND (departamento = 'FIN'::text)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: hermes_reactive_rules | Policy: hermes_rules_log_select | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "hermes_rules_log_select" ON public.hermes_reactive_rules;
  CREATE POLICY "hermes_rules_log_select" ON public.hermes_reactive_rules FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'LOG'::text) AND (departamento = 'LOG'::text)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: hermes_reactive_rules | Policy: hermes_rules_log_update | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "hermes_rules_log_update" ON public.hermes_reactive_rules;
  CREATE POLICY "hermes_rules_log_update" ON public.hermes_reactive_rules FOR UPDATE USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'LOG'::text) AND (departamento = 'LOG'::text))) WITH CHECK (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'LOG'::text) AND (departamento = 'LOG'::text)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: hermes_reactive_rules | Policy: hermes_rules_lut_select | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "hermes_rules_lut_select" ON public.hermes_reactive_rules;
  CREATE POLICY "hermes_rules_lut_select" ON public.hermes_reactive_rules FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'LUT'::text) AND (departamento = 'LUT'::text)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: hermes_reactive_rules | Policy: hermes_rules_service_role_all | Cmd: ALL | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "hermes_rules_service_role_all" ON public.hermes_reactive_rules;
  CREATE POLICY "hermes_rules_service_role_all" ON public.hermes_reactive_rules FOR ALL USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: hermes_reactive_rules | Policy: hermes_rules_tecnico_select | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "hermes_rules_tecnico_select" ON public.hermes_reactive_rules;
  CREATE POLICY "hermes_rules_tecnico_select" ON public.hermes_reactive_rules FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'TECNICO'::text) AND (departamento = 'TECNICO'::text)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: hermes_whatsapp_config | Policy: wa_config_admin_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "wa_config_admin_all" ON public.hermes_whatsapp_config;
  CREATE POLICY "wa_config_admin_all" ON public.hermes_whatsapp_config FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: hermes_whatsapp_config | Policy: wa_config_service_role_all | Cmd: ALL | Roles: service_role
DO $$ BEGIN
  DROP POLICY IF EXISTS "wa_config_service_role_all" ON public.hermes_whatsapp_config;
  CREATE POLICY "wa_config_service_role_all" ON public.hermes_whatsapp_config FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: hermes_whatsapp_queue | Policy: wa_queue_read_admin | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "wa_queue_read_admin" ON public.hermes_whatsapp_queue;
  CREATE POLICY "wa_queue_read_admin" ON public.hermes_whatsapp_queue FOR SELECT TO authenticated USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: hermes_whatsapp_queue | Policy: wa_queue_service_role_all | Cmd: ALL | Roles: service_role
DO $$ BEGIN
  DROP POLICY IF EXISTS "wa_queue_service_role_all" ON public.hermes_whatsapp_queue;
  CREATE POLICY "wa_queue_service_role_all" ON public.hermes_whatsapp_queue FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: historial_estado_alumno | Policy: historial_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "historial_admin_read" ON public.historial_estado_alumno;
  CREATE POLICY "historial_admin_read" ON public.historial_estado_alumno FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: homework_assignments | Policy: homework_assignments_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "homework_assignments_admin_read" ON public.homework_assignments;
  CREATE POLICY "homework_assignments_admin_read" ON public.homework_assignments FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: homework_assignments | Policy: hw_delete_all | Cmd: DELETE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "hw_delete_all" ON public.homework_assignments;
  CREATE POLICY "hw_delete_all" ON public.homework_assignments FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: homework_assignments | Policy: hw_insert_all | Cmd: INSERT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "hw_insert_all" ON public.homework_assignments;
  CREATE POLICY "hw_insert_all" ON public.homework_assignments FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: homework_assignments | Policy: hw_select_all | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "hw_select_all" ON public.homework_assignments;
  CREATE POLICY "hw_select_all" ON public.homework_assignments FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: homework_assignments | Policy: hw_update_all | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "hw_update_all" ON public.homework_assignments;
  CREATE POLICY "hw_update_all" ON public.homework_assignments FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: horarios | Policy: Permitir actualizar horarios | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "Permitir actualizar horarios" ON public.horarios;
  CREATE POLICY "Permitir actualizar horarios" ON public.horarios FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: horarios | Policy: Permitir crear horarios | Cmd: INSERT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "Permitir crear horarios" ON public.horarios;
  CREATE POLICY "Permitir crear horarios" ON public.horarios FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: horarios | Policy: Permitir eliminar horarios | Cmd: DELETE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "Permitir eliminar horarios" ON public.horarios;
  CREATE POLICY "Permitir eliminar horarios" ON public.horarios FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: horarios | Policy: horarios_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "horarios_admin_read" ON public.horarios;
  CREATE POLICY "horarios_admin_read" ON public.horarios FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: horarios | Policy: horarios_authenticated_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "horarios_authenticated_all" ON public.horarios;
  CREATE POLICY "horarios_authenticated_all" ON public.horarios FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: indicador_prerequisito | Policy: indicador_prerequisito_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "indicador_prerequisito_delete" ON public.indicador_prerequisito;
  CREATE POLICY "indicador_prerequisito_delete" ON public.indicador_prerequisito FOR DELETE TO authenticated USING ((es_admin() OR es_coordinador_acm() OR (indicador_id IN ( SELECT maestro_indicadores.id
   FROM maestro_indicadores
  WHERE (maestro_indicadores.objetivo_id IN ( SELECT maestro_objetivos.id
           FROM maestro_objetivos
          WHERE (maestro_objetivos.unidad_id IN ( SELECT maestro_unidades.id
                   FROM maestro_unidades
                  WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id
                           FROM maestro_routes
                          WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
                                   FROM maestros
                                  WHERE (maestros.user_id = auth.uid())))))))))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: indicador_prerequisito | Policy: indicador_prerequisito_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "indicador_prerequisito_select" ON public.indicador_prerequisito;
  CREATE POLICY "indicador_prerequisito_select" ON public.indicador_prerequisito FOR SELECT TO authenticated USING ((es_admin() OR es_coordinador_acm() OR (indicador_id IN ( SELECT maestro_indicadores.id
   FROM maestro_indicadores
  WHERE (maestro_indicadores.objetivo_id IN ( SELECT maestro_objetivos.id
           FROM maestro_objetivos
          WHERE (maestro_objetivos.unidad_id IN ( SELECT maestro_unidades.id
                   FROM maestro_unidades
                  WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id
                           FROM maestro_routes
                          WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
                                   FROM maestros
                                  WHERE (maestros.user_id = auth.uid())))))))))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: indicador_prerequisito | Policy: indicador_prerequisito_write | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "indicador_prerequisito_write" ON public.indicador_prerequisito;
  CREATE POLICY "indicador_prerequisito_write" ON public.indicador_prerequisito FOR INSERT TO authenticated WITH CHECK ((es_admin() OR es_coordinador_acm() OR (indicador_id IN ( SELECT maestro_indicadores.id
   FROM maestro_indicadores
  WHERE (maestro_indicadores.objetivo_id IN ( SELECT maestro_objetivos.id
           FROM maestro_objetivos
          WHERE (maestro_objetivos.unidad_id IN ( SELECT maestro_unidades.id
                   FROM maestro_unidades
                  WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id
                           FROM maestro_routes
                          WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
                                   FROM maestros
                                  WHERE (maestros.user_id = auth.uid())))))))))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: indicator_attempts | Policy: admin_read_all_indicator_attempts | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "admin_read_all_indicator_attempts" ON public.indicator_attempts;
  CREATE POLICY "admin_read_all_indicator_attempts" ON public.indicator_attempts FOR SELECT TO authenticated USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: indicator_attempts | Policy: auth_read_class_indicator_attempts | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "auth_read_class_indicator_attempts" ON public.indicator_attempts;
  CREATE POLICY "auth_read_class_indicator_attempts" ON public.indicator_attempts FOR SELECT TO authenticated USING ((covered_by_clase_id IN ( SELECT c.id
   FROM clases c
  WHERE ((c.maestro_principal_id = maestro_actual()) OR (c.maestro_suplente_id = maestro_actual())))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: indicator_attempts | Policy: indicator_attempts_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "indicator_attempts_admin_read" ON public.indicator_attempts;
  CREATE POLICY "indicator_attempts_admin_read" ON public.indicator_attempts FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: indicator_attempts | Policy: teacher_delete_own_attempts | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "teacher_delete_own_attempts" ON public.indicator_attempts;
  CREATE POLICY "teacher_delete_own_attempts" ON public.indicator_attempts FOR DELETE TO authenticated USING ((created_by IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: indicator_attempts | Policy: teacher_insert_attempts | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "teacher_insert_attempts" ON public.indicator_attempts;
  CREATE POLICY "teacher_insert_attempts" ON public.indicator_attempts FOR INSERT TO authenticated WITH CHECK ((created_by IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: indicator_attempts | Policy: teacher_read_own_attempts | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "teacher_read_own_attempts" ON public.indicator_attempts;
  CREATE POLICY "teacher_read_own_attempts" ON public.indicator_attempts FOR SELECT TO authenticated USING ((created_by IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: indicator_attempts | Policy: teacher_update_own_attempts | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "teacher_update_own_attempts" ON public.indicator_attempts;
  CREATE POLICY "teacher_update_own_attempts" ON public.indicator_attempts FOR UPDATE TO authenticated USING ((created_by IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid())))) WITH CHECK ((created_by IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: indicator_session_students | Policy: bitacora_session_students_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "bitacora_session_students_insert" ON public.indicator_session_students;
  CREATE POLICY "bitacora_session_students_insert" ON public.indicator_session_students FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM indicator_sessions s
  WHERE ((s.id = indicator_session_students.indicator_session_id) AND (s.maestro_id = maestro_actual())))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: indicator_session_students | Policy: bitacora_session_students_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "bitacora_session_students_select" ON public.indicator_session_students;
  CREATE POLICY "bitacora_session_students_select" ON public.indicator_session_students FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM indicator_sessions s
  WHERE ((s.id = indicator_session_students.indicator_session_id) AND (s.maestro_id = maestro_actual())))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: indicator_sessions | Policy: bitacora_indicator_sessions_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "bitacora_indicator_sessions_insert" ON public.indicator_sessions;
  CREATE POLICY "bitacora_indicator_sessions_insert" ON public.indicator_sessions FOR INSERT TO authenticated WITH CHECK (((maestro_id = maestro_actual()) AND maestro_en_clase(clase_id)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: indicator_sessions | Policy: bitacora_indicator_sessions_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "bitacora_indicator_sessions_select" ON public.indicator_sessions;
  CREATE POLICY "bitacora_indicator_sessions_select" ON public.indicator_sessions FOR SELECT TO authenticated USING ((maestro_id = maestro_actual()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: indicator_sessions | Policy: bitacora_indicator_sessions_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "bitacora_indicator_sessions_update" ON public.indicator_sessions;
  CREATE POLICY "bitacora_indicator_sessions_update" ON public.indicator_sessions FOR UPDATE TO authenticated USING ((maestro_id = maestro_actual())) WITH CHECK (((maestro_id = maestro_actual()) AND maestro_en_clase(clase_id)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: indicators | Policy: Maestros pueden leer indicadores | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Maestros pueden leer indicadores" ON public.indicators;
  CREATE POLICY "Maestros pueden leer indicadores" ON public.indicators FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: indicators | Policy: indicators_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "indicators_admin_read" ON public.indicators;
  CREATE POLICY "indicators_admin_read" ON public.indicators FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: indicators | Policy: maestros_write_own_draft_indicators | Cmd: ALL | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestros_write_own_draft_indicators" ON public.indicators;
  CREATE POLICY "maestros_write_own_draft_indicators" ON public.indicators FOR ALL USING ((node_id IN ( SELECT n.id
   FROM (nodes n
     JOIN route_versions rv ON ((rv.id = n.route_version_id)))
  WHERE ((rv.created_by = auth.uid()) AND (rv.status = 'draft'::route_status))))) WITH CHECK ((node_id IN ( SELECT n.id
   FROM (nodes n
     JOIN route_versions rv ON ((rv.id = n.route_version_id)))
  WHERE ((rv.created_by = auth.uid()) AND (rv.status = 'draft'::route_status)))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: instrumentos | Policy: instrumentos_auth_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "instrumentos_auth_all" ON public.instrumentos;
  CREATE POLICY "instrumentos_auth_all" ON public.instrumentos FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: inventario_accesorios | Policy: accesorios_admin_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "accesorios_admin_delete" ON public.inventario_accesorios;
  CREATE POLICY "accesorios_admin_delete" ON public.inventario_accesorios FOR DELETE TO authenticated USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: inventario_accesorios | Policy: accesorios_admin_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "accesorios_admin_insert" ON public.inventario_accesorios;
  CREATE POLICY "accesorios_admin_insert" ON public.inventario_accesorios FOR INSERT TO authenticated WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: inventario_accesorios | Policy: accesorios_admin_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "accesorios_admin_update" ON public.inventario_accesorios;
  CREATE POLICY "accesorios_admin_update" ON public.inventario_accesorios FOR UPDATE TO authenticated USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: inventario_accesorios | Policy: accesorios_authenticated_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "accesorios_authenticated_select" ON public.inventario_accesorios;
  CREATE POLICY "accesorios_authenticated_select" ON public.inventario_accesorios FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: inventario_activos | Policy: inventario_admin_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "inventario_admin_insert" ON public.inventario_activos;
  CREATE POLICY "inventario_admin_insert" ON public.inventario_activos FOR INSERT TO authenticated WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: inventario_activos | Policy: inventario_admin_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "inventario_admin_update" ON public.inventario_activos;
  CREATE POLICY "inventario_admin_update" ON public.inventario_activos FOR UPDATE TO authenticated USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: inventario_activos | Policy: inventario_authenticated_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "inventario_authenticated_select" ON public.inventario_activos;
  CREATE POLICY "inventario_authenticated_select" ON public.inventario_activos FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: inventario_historial | Policy: historial_admin_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "historial_admin_delete" ON public.inventario_historial;
  CREATE POLICY "historial_admin_delete" ON public.inventario_historial FOR DELETE TO authenticated USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: inventario_historial | Policy: historial_admin_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "historial_admin_insert" ON public.inventario_historial;
  CREATE POLICY "historial_admin_insert" ON public.inventario_historial FOR INSERT TO authenticated WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: inventario_historial | Policy: historial_authenticated_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "historial_authenticated_select" ON public.inventario_historial;
  CREATE POLICY "historial_authenticated_select" ON public.inventario_historial FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: inventario_materiales | Policy: materiales_admin_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "materiales_admin_delete" ON public.inventario_materiales;
  CREATE POLICY "materiales_admin_delete" ON public.inventario_materiales FOR DELETE TO authenticated USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: inventario_materiales | Policy: materiales_admin_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "materiales_admin_insert" ON public.inventario_materiales;
  CREATE POLICY "materiales_admin_insert" ON public.inventario_materiales FOR INSERT TO authenticated WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: inventario_materiales | Policy: materiales_admin_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "materiales_admin_update" ON public.inventario_materiales;
  CREATE POLICY "materiales_admin_update" ON public.inventario_materiales FOR UPDATE TO authenticated USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: inventario_materiales | Policy: materiales_authenticated_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "materiales_authenticated_select" ON public.inventario_materiales;
  CREATE POLICY "materiales_authenticated_select" ON public.inventario_materiales FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: inventario_reparaciones | Policy: reparaciones_admin_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "reparaciones_admin_delete" ON public.inventario_reparaciones;
  CREATE POLICY "reparaciones_admin_delete" ON public.inventario_reparaciones FOR DELETE TO authenticated USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: inventario_reparaciones | Policy: reparaciones_admin_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "reparaciones_admin_insert" ON public.inventario_reparaciones;
  CREATE POLICY "reparaciones_admin_insert" ON public.inventario_reparaciones FOR INSERT TO authenticated WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: inventario_reparaciones | Policy: reparaciones_admin_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "reparaciones_admin_update" ON public.inventario_reparaciones;
  CREATE POLICY "reparaciones_admin_update" ON public.inventario_reparaciones FOR UPDATE TO authenticated USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: inventario_reparaciones | Policy: reparaciones_authenticated_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "reparaciones_authenticated_select" ON public.inventario_reparaciones;
  CREATE POLICY "reparaciones_authenticated_select" ON public.inventario_reparaciones FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: justificaciones | Policy: justificaciones_admin_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "justificaciones_admin_insert" ON public.justificaciones;
  CREATE POLICY "justificaciones_admin_insert" ON public.justificaciones FOR INSERT TO authenticated WITH CHECK ((es_admin() OR maestro_en_clase(clase_id)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: justificaciones | Policy: justificaciones_admin_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "justificaciones_admin_select" ON public.justificaciones;
  CREATE POLICY "justificaciones_admin_select" ON public.justificaciones FOR SELECT TO authenticated USING ((es_admin() OR maestro_en_clase(clase_id)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: justificaciones | Policy: justificaciones_admin_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "justificaciones_admin_update" ON public.justificaciones;
  CREATE POLICY "justificaciones_admin_update" ON public.justificaciones FOR UPDATE TO authenticated USING ((es_admin() OR maestro_en_clase(clase_id))) WITH CHECK ((es_admin() OR maestro_en_clase(clase_id)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: justificaciones | Policy: justificaciones_superadmin_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "justificaciones_superadmin_delete" ON public.justificaciones;
  CREATE POLICY "justificaciones_superadmin_delete" ON public.justificaciones FOR DELETE TO authenticated USING ((( SELECT is_super_admin() AS is_super_admin) = true));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: justificaciones | Policy: teacher_manage_justificaciones | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "teacher_manage_justificaciones" ON public.justificaciones;
  CREATE POLICY "teacher_manage_justificaciones" ON public.justificaciones FOR ALL TO authenticated USING ((creado_por IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid())))) WITH CHECK ((creado_por IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: levels | Policy: Maestros pueden leer niveles | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Maestros pueden leer niveles" ON public.levels;
  CREATE POLICY "Maestros pueden leer niveles" ON public.levels FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: levels | Policy: levels_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "levels_admin_read" ON public.levels;
  CREATE POLICY "levels_admin_read" ON public.levels FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: levels | Policy: maestros_write_own_draft_levels | Cmd: ALL | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestros_write_own_draft_levels" ON public.levels;
  CREATE POLICY "maestros_write_own_draft_levels" ON public.levels FOR ALL USING ((route_version_id IN ( SELECT route_versions.id
   FROM route_versions
  WHERE ((route_versions.created_by = auth.uid()) AND (route_versions.status = 'draft'::route_status))))) WITH CHECK ((route_version_id IN ( SELECT route_versions.id
   FROM route_versions
  WHERE ((route_versions.created_by = auth.uid()) AND (route_versions.status = 'draft'::route_status)))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: logros | Policy: logros_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "logros_admin_read" ON public.logros;
  CREATE POLICY "logros_admin_read" ON public.logros FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: logros | Policy: logros_authenticated_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "logros_authenticated_all" ON public.logros;
  CREATE POLICY "logros_authenticated_all" ON public.logros FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: lut_diagnosticos | Policy: lut_diagnosticos_auth_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "lut_diagnosticos_auth_all" ON public.lut_diagnosticos;
  CREATE POLICY "lut_diagnosticos_auth_all" ON public.lut_diagnosticos FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: lut_evidencias | Policy: lut_evidencias_auth_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "lut_evidencias_auth_all" ON public.lut_evidencias;
  CREATE POLICY "lut_evidencias_auth_all" ON public.lut_evidencias FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: lut_insumos | Policy: lut_insumos_auth_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "lut_insumos_auth_all" ON public.lut_insumos;
  CREATE POLICY "lut_insumos_auth_all" ON public.lut_insumos FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: lut_movimientos_insumos | Policy: lut_movimientos_auth_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "lut_movimientos_auth_all" ON public.lut_movimientos_insumos;
  CREATE POLICY "lut_movimientos_auth_all" ON public.lut_movimientos_insumos FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: lut_ordenes_reparacion | Policy: lut_ordenes_auth_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "lut_ordenes_auth_all" ON public.lut_ordenes_reparacion;
  CREATE POLICY "lut_ordenes_auth_all" ON public.lut_ordenes_reparacion FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: lut_presupuestos | Policy: lut_presupuestos_auth_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "lut_presupuestos_auth_all" ON public.lut_presupuestos;
  CREATE POLICY "lut_presupuestos_auth_all" ON public.lut_presupuestos FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: lut_solicitudes_compra | Policy: lut_solicitudes_auth_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "lut_solicitudes_auth_all" ON public.lut_solicitudes_compra;
  CREATE POLICY "lut_solicitudes_auth_all" ON public.lut_solicitudes_compra FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: maestro_access_credentials | Policy: maestro_access_credentials_service_role | Cmd: ALL | Roles: service_role
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestro_access_credentials_service_role" ON public.maestro_access_credentials;
  CREATE POLICY "maestro_access_credentials_service_role" ON public.maestro_access_credentials FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: maestro_desempeno | Policy: admin_read_md | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "admin_read_md" ON public.maestro_desempeno;
  CREATE POLICY "admin_read_md" ON public.maestro_desempeno FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'admin'::text)))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: maestro_desempeno | Policy: system_update_md | Cmd: UPDATE | Roles: service_role
DO $$ BEGIN
  DROP POLICY IF EXISTS "system_update_md" ON public.maestro_desempeno;
  CREATE POLICY "system_update_md" ON public.maestro_desempeno FOR UPDATE TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: maestro_desempeno | Policy: system_write_md | Cmd: INSERT | Roles: service_role
DO $$ BEGIN
  DROP POLICY IF EXISTS "system_write_md" ON public.maestro_desempeno;
  CREATE POLICY "system_write_md" ON public.maestro_desempeno FOR INSERT TO service_role WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: maestro_indicadores | Policy: maestro_indicadores_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestro_indicadores_delete" ON public.maestro_indicadores;
  CREATE POLICY "maestro_indicadores_delete" ON public.maestro_indicadores FOR DELETE TO authenticated USING ((es_admin() OR es_coordinador_acm() OR (objetivo_id IN ( SELECT maestro_objetivos.id
   FROM maestro_objetivos
  WHERE (maestro_objetivos.unidad_id IN ( SELECT maestro_unidades.id
           FROM maestro_unidades
          WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id
                   FROM maestro_routes
                  WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
                           FROM maestros
                          WHERE (maestros.user_id = auth.uid())))))))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: maestro_indicadores | Policy: maestro_indicadores_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestro_indicadores_select" ON public.maestro_indicadores;
  CREATE POLICY "maestro_indicadores_select" ON public.maestro_indicadores FOR SELECT TO authenticated USING ((es_admin() OR es_coordinador_acm() OR (objetivo_id IN ( SELECT maestro_objetivos.id
   FROM maestro_objetivos
  WHERE (maestro_objetivos.unidad_id IN ( SELECT maestro_unidades.id
           FROM maestro_unidades
          WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id
                   FROM maestro_routes
                  WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
                           FROM maestros
                          WHERE (maestros.user_id = auth.uid())))))))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: maestro_indicadores | Policy: maestro_indicadores_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestro_indicadores_update" ON public.maestro_indicadores;
  CREATE POLICY "maestro_indicadores_update" ON public.maestro_indicadores FOR UPDATE TO authenticated USING ((es_admin() OR es_coordinador_acm() OR (objetivo_id IN ( SELECT maestro_objetivos.id
   FROM maestro_objetivos
  WHERE (maestro_objetivos.unidad_id IN ( SELECT maestro_unidades.id
           FROM maestro_unidades
          WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id
                   FROM maestro_routes
                  WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
                           FROM maestros
                          WHERE (maestros.user_id = auth.uid()))))))))))) WITH CHECK ((es_admin() OR es_coordinador_acm() OR (objetivo_id IN ( SELECT maestro_objetivos.id
   FROM maestro_objetivos
  WHERE (maestro_objetivos.unidad_id IN ( SELECT maestro_unidades.id
           FROM maestro_unidades
          WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id
                   FROM maestro_routes
                  WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
                           FROM maestros
                          WHERE (maestros.user_id = auth.uid())))))))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: maestro_indicadores | Policy: maestro_indicadores_write | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestro_indicadores_write" ON public.maestro_indicadores;
  CREATE POLICY "maestro_indicadores_write" ON public.maestro_indicadores FOR INSERT TO authenticated WITH CHECK ((es_admin() OR es_coordinador_acm() OR (objetivo_id IN ( SELECT maestro_objetivos.id
   FROM maestro_objetivos
  WHERE (maestro_objetivos.unidad_id IN ( SELECT maestro_unidades.id
           FROM maestro_unidades
          WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id
                   FROM maestro_routes
                  WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
                           FROM maestros
                          WHERE (maestros.user_id = auth.uid())))))))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: maestro_objetivos | Policy: maestro_objetivos_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestro_objetivos_delete" ON public.maestro_objetivos;
  CREATE POLICY "maestro_objetivos_delete" ON public.maestro_objetivos FOR DELETE TO authenticated USING ((es_admin() OR es_coordinador_acm() OR (unidad_id IN ( SELECT maestro_unidades.id
   FROM maestro_unidades
  WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id
           FROM maestro_routes
          WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
                   FROM maestros
                  WHERE (maestros.user_id = auth.uid())))))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: maestro_objetivos | Policy: maestro_objetivos_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestro_objetivos_select" ON public.maestro_objetivos;
  CREATE POLICY "maestro_objetivos_select" ON public.maestro_objetivos FOR SELECT TO authenticated USING ((es_admin() OR es_coordinador_acm() OR (unidad_id IN ( SELECT maestro_unidades.id
   FROM maestro_unidades
  WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id
           FROM maestro_routes
          WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
                   FROM maestros
                  WHERE (maestros.user_id = auth.uid())))))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: maestro_objetivos | Policy: maestro_objetivos_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestro_objetivos_update" ON public.maestro_objetivos;
  CREATE POLICY "maestro_objetivos_update" ON public.maestro_objetivos FOR UPDATE TO authenticated USING ((es_admin() OR es_coordinador_acm() OR (unidad_id IN ( SELECT maestro_unidades.id
   FROM maestro_unidades
  WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id
           FROM maestro_routes
          WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
                   FROM maestros
                  WHERE (maestros.user_id = auth.uid()))))))))) WITH CHECK ((es_admin() OR es_coordinador_acm() OR (unidad_id IN ( SELECT maestro_unidades.id
   FROM maestro_unidades
  WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id
           FROM maestro_routes
          WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
                   FROM maestros
                  WHERE (maestros.user_id = auth.uid())))))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: maestro_objetivos | Policy: maestro_objetivos_write | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestro_objetivos_write" ON public.maestro_objetivos;
  CREATE POLICY "maestro_objetivos_write" ON public.maestro_objetivos FOR INSERT TO authenticated WITH CHECK ((es_admin() OR es_coordinador_acm() OR (unidad_id IN ( SELECT maestro_unidades.id
   FROM maestro_unidades
  WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id
           FROM maestro_routes
          WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
                   FROM maestros
                  WHERE (maestros.user_id = auth.uid())))))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: maestro_retiros | Policy: maestro_retiros_admin_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestro_retiros_admin_read" ON public.maestro_retiros;
  CREATE POLICY "maestro_retiros_admin_read" ON public.maestro_retiros FOR SELECT TO authenticated USING (is_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: maestro_routes | Policy: maestro_routes_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestro_routes_delete" ON public.maestro_routes;
  CREATE POLICY "maestro_routes_delete" ON public.maestro_routes FOR DELETE TO authenticated USING ((es_admin() OR es_coordinador_acm() OR (maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid())))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: maestro_routes | Policy: maestro_routes_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestro_routes_insert" ON public.maestro_routes;
  CREATE POLICY "maestro_routes_insert" ON public.maestro_routes FOR INSERT TO authenticated WITH CHECK ((es_admin() OR es_coordinador_acm() OR (maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid())))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: maestro_routes | Policy: maestro_routes_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestro_routes_select" ON public.maestro_routes;
  CREATE POLICY "maestro_routes_select" ON public.maestro_routes FOR SELECT TO authenticated USING ((es_admin() OR es_coordinador_acm() OR (maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid())))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: maestro_routes | Policy: maestro_routes_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestro_routes_update" ON public.maestro_routes;
  CREATE POLICY "maestro_routes_update" ON public.maestro_routes FOR UPDATE TO authenticated USING ((es_admin() OR es_coordinador_acm() OR (maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))))) WITH CHECK ((es_admin() OR es_coordinador_acm() OR (maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid())))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: maestro_tareas | Policy: maestro_tareas_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestro_tareas_admin_read" ON public.maestro_tareas;
  CREATE POLICY "maestro_tareas_admin_read" ON public.maestro_tareas FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: maestro_tareas | Policy: maestro_tareas_own | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestro_tareas_own" ON public.maestro_tareas;
  CREATE POLICY "maestro_tareas_own" ON public.maestro_tareas FOR ALL TO authenticated USING ((maestro_id = maestro_actual())) WITH CHECK ((maestro_id = maestro_actual()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: maestro_unidades | Policy: maestro_unidades_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestro_unidades_delete" ON public.maestro_unidades;
  CREATE POLICY "maestro_unidades_delete" ON public.maestro_unidades FOR DELETE TO authenticated USING ((es_admin() OR es_coordinador_acm() OR (ruta_id IN ( SELECT maestro_routes.id
   FROM maestro_routes
  WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
           FROM maestros
          WHERE (maestros.user_id = auth.uid())))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: maestro_unidades | Policy: maestro_unidades_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestro_unidades_select" ON public.maestro_unidades;
  CREATE POLICY "maestro_unidades_select" ON public.maestro_unidades FOR SELECT TO authenticated USING ((es_admin() OR es_coordinador_acm() OR (ruta_id IN ( SELECT maestro_routes.id
   FROM maestro_routes
  WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
           FROM maestros
          WHERE (maestros.user_id = auth.uid())))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: maestro_unidades | Policy: maestro_unidades_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestro_unidades_update" ON public.maestro_unidades;
  CREATE POLICY "maestro_unidades_update" ON public.maestro_unidades FOR UPDATE TO authenticated USING ((es_admin() OR es_coordinador_acm() OR (ruta_id IN ( SELECT maestro_routes.id
   FROM maestro_routes
  WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
           FROM maestros
          WHERE (maestros.user_id = auth.uid()))))))) WITH CHECK ((es_admin() OR es_coordinador_acm() OR (ruta_id IN ( SELECT maestro_routes.id
   FROM maestro_routes
  WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
           FROM maestros
          WHERE (maestros.user_id = auth.uid())))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: maestro_unidades | Policy: maestro_unidades_write | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestro_unidades_write" ON public.maestro_unidades;
  CREATE POLICY "maestro_unidades_write" ON public.maestro_unidades FOR INSERT TO authenticated WITH CHECK ((es_admin() OR es_coordinador_acm() OR (ruta_id IN ( SELECT maestro_routes.id
   FROM maestro_routes
  WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
           FROM maestros
          WHERE (maestros.user_id = auth.uid())))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: maestros | Policy: maestros_admin_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestros_admin_insert" ON public.maestros;
  CREATE POLICY "maestros_admin_insert" ON public.maestros FOR INSERT TO authenticated WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: maestros | Policy: maestros_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestros_admin_read" ON public.maestros;
  CREATE POLICY "maestros_admin_read" ON public.maestros FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: maestros | Policy: maestros_admin_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestros_admin_update" ON public.maestros;
  CREATE POLICY "maestros_admin_update" ON public.maestros FOR UPDATE TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: maestros | Policy: maestros_select_self | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestros_select_self" ON public.maestros;
  CREATE POLICY "maestros_select_self" ON public.maestros FOR SELECT TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: maestros | Policy: maestros_superadmin_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestros_superadmin_delete" ON public.maestros;
  CREATE POLICY "maestros_superadmin_delete" ON public.maestros FOR DELETE TO authenticated USING ((( SELECT is_super_admin() AS is_super_admin) = true));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: mapa_plantillas | Policy: plantillas_admin | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "plantillas_admin" ON public.mapa_plantillas;
  CREATE POLICY "plantillas_admin" ON public.mapa_plantillas FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: mapa_plantillas | Policy: plantillas_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "plantillas_read" ON public.mapa_plantillas;
  CREATE POLICY "plantillas_read" ON public.mapa_plantillas FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: minutas | Policy: minutas_insert_cajero_admin | Cmd: INSERT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "minutas_insert_cajero_admin" ON public.minutas;
  CREATE POLICY "minutas_insert_cajero_admin" ON public.minutas FOR INSERT WITH CHECK ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: minutas | Policy: minutas_select_admin | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "minutas_select_admin" ON public.minutas;
  CREATE POLICY "minutas_select_admin" ON public.minutas FOR SELECT USING ((get_user_role() = 'admin'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: minutas | Policy: minutas_select_cajero | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "minutas_select_cajero" ON public.minutas;
  CREATE POLICY "minutas_select_cajero" ON public.minutas FOR SELECT USING (((get_user_role() = 'finanzas'::text) AND (visibilidad = ANY (ARRAY['cajero'::minuta_visibilidad, 'todos'::minuta_visibilidad]))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: minutas | Policy: minutas_update_admin | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "minutas_update_admin" ON public.minutas;
  CREATE POLICY "minutas_update_admin" ON public.minutas FOR UPDATE USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: modulos | Policy: modulos_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "modulos_admin_read" ON public.modulos;
  CREATE POLICY "modulos_admin_read" ON public.modulos FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: modulos | Policy: modulos_authenticated_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "modulos_authenticated_all" ON public.modulos;
  CREATE POLICY "modulos_authenticated_all" ON public.modulos FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: niveles | Policy: niveles_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "niveles_admin_read" ON public.niveles;
  CREATE POLICY "niveles_admin_read" ON public.niveles FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: niveles | Policy: niveles_authenticated_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "niveles_authenticated_all" ON public.niveles;
  CREATE POLICY "niveles_authenticated_all" ON public.niveles FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: node_resources | Policy: Full access for admins | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Full access for admins" ON public.node_resources;
  CREATE POLICY "Full access for admins" ON public.node_resources FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'admin'::text)))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: node_resources | Policy: Public read for authenticated users | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public read for authenticated users" ON public.node_resources;
  CREATE POLICY "Public read for authenticated users" ON public.node_resources FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: nodes | Policy: Maestros pueden leer nodos | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Maestros pueden leer nodos" ON public.nodes;
  CREATE POLICY "Maestros pueden leer nodos" ON public.nodes FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: nodes | Policy: maestros_write_own_draft_nodes | Cmd: ALL | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestros_write_own_draft_nodes" ON public.nodes;
  CREATE POLICY "maestros_write_own_draft_nodes" ON public.nodes FOR ALL USING ((route_version_id IN ( SELECT route_versions.id
   FROM route_versions
  WHERE ((route_versions.created_by = auth.uid()) AND (route_versions.status = 'draft'::route_status))))) WITH CHECK ((route_version_id IN ( SELECT route_versions.id
   FROM route_versions
  WHERE ((route_versions.created_by = auth.uid()) AND (route_versions.status = 'draft'::route_status)))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: nodes | Policy: nodes_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "nodes_admin_read" ON public.nodes;
  CREATE POLICY "nodes_admin_read" ON public.nodes FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: notificaciones | Policy: notificaciones_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "notificaciones_admin_read" ON public.notificaciones;
  CREATE POLICY "notificaciones_admin_read" ON public.notificaciones FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: notificaciones | Policy: notificaciones_authenticated_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "notificaciones_authenticated_all" ON public.notificaciones;
  CREATE POLICY "notificaciones_authenticated_all" ON public.notificaciones FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: notificaciones_asistencia | Policy: hermes_update_notifications | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "hermes_update_notifications" ON public.notificaciones_asistencia;
  CREATE POLICY "hermes_update_notifications" ON public.notificaciones_asistencia FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: notificaciones_asistencia | Policy: portal_insert_notifications | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "portal_insert_notifications" ON public.notificaciones_asistencia;
  CREATE POLICY "portal_insert_notifications" ON public.notificaciones_asistencia FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: notificaciones_asistencia | Policy: portal_read_own_notifications | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "portal_read_own_notifications" ON public.notificaciones_asistencia;
  CREATE POLICY "portal_read_own_notifications" ON public.notificaciones_asistencia FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: notificaciones_caja | Policy: notif_all_admin | Cmd: ALL | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "notif_all_admin" ON public.notificaciones_caja;
  CREATE POLICY "notif_all_admin" ON public.notificaciones_caja FOR ALL USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: notificaciones_caja | Policy: notif_insert_cajero_admin | Cmd: INSERT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "notif_insert_cajero_admin" ON public.notificaciones_caja;
  CREATE POLICY "notif_insert_cajero_admin" ON public.notificaciones_caja FOR INSERT WITH CHECK ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: notificaciones_caja | Policy: notif_select_cajero_admin | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "notif_select_cajero_admin" ON public.notificaciones_caja;
  CREATE POLICY "notif_select_cajero_admin" ON public.notificaciones_caja FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: notificaciones_caja | Policy: notif_select_representante | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "notif_select_representante" ON public.notificaciones_caja;
  CREATE POLICY "notif_select_representante" ON public.notificaciones_caja FOR SELECT USING (((get_user_role() = 'representante'::text) AND (familia_id = get_user_familia_id())));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: notificaciones_caja | Policy: notif_update_cajero | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "notif_update_cajero" ON public.notificaciones_caja;
  CREATE POLICY "notif_update_cajero" ON public.notificaciones_caja FOR UPDATE USING ((get_user_role() = 'finanzas'::text)) WITH CHECK ((get_user_role() = 'finanzas'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: notification_trigger_logs | Policy: solo admins | Cmd: ALL | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "solo admins" ON public.notification_trigger_logs;
  CREATE POLICY "solo admins" ON public.notification_trigger_logs FOR ALL USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'admin'::text)))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: objetivos | Policy: teacher_read_objetivos | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "teacher_read_objetivos" ON public.objetivos;
  CREATE POLICY "teacher_read_objetivos" ON public.objetivos FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: observaciones_alumnos | Policy: obs_admin_all | Cmd: ALL | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "obs_admin_all" ON public.observaciones_alumnos;
  CREATE POLICY "obs_admin_all" ON public.observaciones_alumnos FOR ALL USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: observaciones_alumnos | Policy: obs_alumnos_insert | Cmd: INSERT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "obs_alumnos_insert" ON public.observaciones_alumnos;
  CREATE POLICY "obs_alumnos_insert" ON public.observaciones_alumnos FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: observaciones_alumnos | Policy: obs_alumnos_select | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "obs_alumnos_select" ON public.observaciones_alumnos;
  CREATE POLICY "obs_alumnos_select" ON public.observaciones_alumnos FOR SELECT USING ((auth.role() = 'authenticated'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: observaciones_alumnos | Policy: obs_alumnos_update | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "obs_alumnos_update" ON public.observaciones_alumnos;
  CREATE POLICY "obs_alumnos_update" ON public.observaciones_alumnos FOR UPDATE USING ((auth.role() = 'authenticated'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: observaciones_alumnos | Policy: observaciones_alumnos_admin_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "observaciones_alumnos_admin_insert" ON public.observaciones_alumnos;
  CREATE POLICY "observaciones_alumnos_admin_insert" ON public.observaciones_alumnos FOR INSERT TO authenticated WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: observaciones_alumnos | Policy: observaciones_alumnos_admin_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "observaciones_alumnos_admin_select" ON public.observaciones_alumnos;
  CREATE POLICY "observaciones_alumnos_admin_select" ON public.observaciones_alumnos FOR SELECT TO authenticated USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: observaciones_alumnos | Policy: observaciones_alumnos_admin_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "observaciones_alumnos_admin_update" ON public.observaciones_alumnos;
  CREATE POLICY "observaciones_alumnos_admin_update" ON public.observaciones_alumnos FOR UPDATE TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: observaciones_alumnos | Policy: observaciones_alumnos_superadmin_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "observaciones_alumnos_superadmin_delete" ON public.observaciones_alumnos;
  CREATE POLICY "observaciones_alumnos_superadmin_delete" ON public.observaciones_alumnos FOR DELETE TO authenticated USING ((( SELECT is_super_admin() AS is_super_admin) = true));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: observaciones_sesion | Policy: Maestros gestionan observaciones de sus sesiones | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Maestros gestionan observaciones de sus sesiones" ON public.observaciones_sesion;
  CREATE POLICY "Maestros gestionan observaciones de sus sesiones" ON public.observaciones_sesion FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM sesiones_clase s
  WHERE ((s.id = observaciones_sesion.sesion_id) AND ((s.maestro_id = maestro_actual()) OR maestro_en_clase(s.clase_id)))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM sesiones_clase s
  WHERE ((s.id = observaciones_sesion.sesion_id) AND ((s.maestro_id = maestro_actual()) OR maestro_en_clase(s.clase_id))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: observaciones_sesion | Policy: observaciones_sesion_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "observaciones_sesion_admin_read" ON public.observaciones_sesion;
  CREATE POLICY "observaciones_sesion_admin_read" ON public.observaciones_sesion FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: pagos | Policy: pagos_insert_cajero_admin | Cmd: INSERT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "pagos_insert_cajero_admin" ON public.pagos;
  CREATE POLICY "pagos_insert_cajero_admin" ON public.pagos FOR INSERT WITH CHECK ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: pagos | Policy: pagos_select_cajero_admin | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "pagos_select_cajero_admin" ON public.pagos;
  CREATE POLICY "pagos_select_cajero_admin" ON public.pagos FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: pagos | Policy: pagos_select_representante | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "pagos_select_representante" ON public.pagos;
  CREATE POLICY "pagos_select_representante" ON public.pagos FOR SELECT USING (((get_user_role() = 'representante'::text) AND (familia_id = get_user_familia_id())));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: pagos | Policy: pagos_update_admin | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "pagos_update_admin" ON public.pagos;
  CREATE POLICY "pagos_update_admin" ON public.pagos FOR UPDATE USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: pagos_alumnos | Policy: pagos_admin_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "pagos_admin_insert" ON public.pagos_alumnos;
  CREATE POLICY "pagos_admin_insert" ON public.pagos_alumnos FOR INSERT TO authenticated WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: pagos_alumnos | Policy: pagos_admin_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "pagos_admin_select" ON public.pagos_alumnos;
  CREATE POLICY "pagos_admin_select" ON public.pagos_alumnos FOR SELECT TO authenticated USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: pagos_alumnos | Policy: pagos_admin_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "pagos_admin_update" ON public.pagos_alumnos;
  CREATE POLICY "pagos_admin_update" ON public.pagos_alumnos FOR UPDATE TO authenticated USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: patrocinantes | Policy: patrocinantes_all_admin | Cmd: ALL | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "patrocinantes_all_admin" ON public.patrocinantes;
  CREATE POLICY "patrocinantes_all_admin" ON public.patrocinantes FOR ALL USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: patrocinantes | Policy: patrocinantes_select_cajero_admin | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "patrocinantes_select_cajero_admin" ON public.patrocinantes;
  CREATE POLICY "patrocinantes_select_cajero_admin" ON public.patrocinantes FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: patrocinios | Policy: patrocinios_all_admin | Cmd: ALL | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "patrocinios_all_admin" ON public.patrocinios;
  CREATE POLICY "patrocinios_all_admin" ON public.patrocinios FOR ALL USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: patrocinios | Policy: patrocinios_select_cajero_admin | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "patrocinios_select_cajero_admin" ON public.patrocinios;
  CREATE POLICY "patrocinios_select_cajero_admin" ON public.patrocinios FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: periodo_excepciones | Policy: periodo_excepciones_admin_write | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "periodo_excepciones_admin_write" ON public.periodo_excepciones;
  CREATE POLICY "periodo_excepciones_admin_write" ON public.periodo_excepciones FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: periodo_excepciones | Policy: periodo_excepciones_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "periodo_excepciones_read" ON public.periodo_excepciones;
  CREATE POLICY "periodo_excepciones_read" ON public.periodo_excepciones FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: periodos | Policy: periodos_admin_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "periodos_admin_insert" ON public.periodos;
  CREATE POLICY "periodos_admin_insert" ON public.periodos FOR INSERT TO authenticated WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: periodos | Policy: periodos_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "periodos_admin_read" ON public.periodos;
  CREATE POLICY "periodos_admin_read" ON public.periodos FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: periodos | Policy: periodos_admin_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "periodos_admin_update" ON public.periodos;
  CREATE POLICY "periodos_admin_update" ON public.periodos FOR UPDATE TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: periodos | Policy: periodos_superadmin_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "periodos_superadmin_delete" ON public.periodos;
  CREATE POLICY "periodos_superadmin_delete" ON public.periodos FOR DELETE TO authenticated USING ((( SELECT is_super_admin() AS is_super_admin) = true));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: periodos_cierre_auditoria | Policy: periodos_cierre_auditoria_admin_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "periodos_cierre_auditoria_admin_read" ON public.periodos_cierre_auditoria;
  CREATE POLICY "periodos_cierre_auditoria_admin_read" ON public.periodos_cierre_auditoria FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.rol = 'admin'::text) AND (p.estado = 'activo'::text)))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: periodos_cierre_auditoria | Policy: periodos_cierre_auditoria_service_only | Cmd: ALL | Roles: service_role
DO $$ BEGIN
  DROP POLICY IF EXISTS "periodos_cierre_auditoria_service_only" ON public.periodos_cierre_auditoria;
  CREATE POLICY "periodos_cierre_auditoria_service_only" ON public.periodos_cierre_auditoria FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: permisos_maestros | Policy: Maestro ve sus propios permisos | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Maestro ve sus propios permisos" ON public.permisos_maestros;
  CREATE POLICY "Maestro ve sus propios permisos" ON public.permisos_maestros FOR SELECT TO authenticated USING ((maestro_id = maestro_actual()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: permisos_maestros | Policy: Permitir actualizar sus propios permisos o por admin | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Permitir actualizar sus propios permisos o por admin" ON public.permisos_maestros;
  CREATE POLICY "Permitir actualizar sus propios permisos o por admin" ON public.permisos_maestros FOR UPDATE TO authenticated USING ((es_admin() OR (maestro_id IN ( SELECT m.id
   FROM maestros m
  WHERE (m.user_id = auth.uid()))))) WITH CHECK ((es_admin() OR (maestro_id IN ( SELECT m.id
   FROM maestros m
  WHERE (m.user_id = auth.uid())))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: permisos_maestros | Policy: Permitir insertar sus propios permisos o por admin | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Permitir insertar sus propios permisos o por admin" ON public.permisos_maestros;
  CREATE POLICY "Permitir insertar sus propios permisos o por admin" ON public.permisos_maestros FOR INSERT TO authenticated WITH CHECK ((es_admin() OR (maestro_id IN ( SELECT m.id
   FROM maestros m
  WHERE (m.user_id = auth.uid())))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: permisos_maestros | Policy: Todos pueden leer permisos | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Todos pueden leer permisos" ON public.permisos_maestros;
  CREATE POLICY "Todos pueden leer permisos" ON public.permisos_maestros FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: permisos_maestros | Policy: permisos_maestros_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "permisos_maestros_admin_read" ON public.permisos_maestros;
  CREATE POLICY "permisos_maestros_admin_read" ON public.permisos_maestros FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: plan_clases | Policy: plan_clases_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "plan_clases_admin_read" ON public.plan_clases;
  CREATE POLICY "plan_clases_admin_read" ON public.plan_clases FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: plan_clases | Policy: plan_clases_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "plan_clases_delete" ON public.plan_clases;
  CREATE POLICY "plan_clases_delete" ON public.plan_clases FOR DELETE TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: plan_clases | Policy: plan_clases_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "plan_clases_insert" ON public.plan_clases;
  CREATE POLICY "plan_clases_insert" ON public.plan_clases FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: plan_clases | Policy: plan_clases_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "plan_clases_select" ON public.plan_clases;
  CREATE POLICY "plan_clases_select" ON public.plan_clases FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: plan_clases | Policy: plan_clases_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "plan_clases_update" ON public.plan_clases;
  CREATE POLICY "plan_clases_update" ON public.plan_clases FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: plan_indicadores | Policy: plan_indicadores_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "plan_indicadores_admin_read" ON public.plan_indicadores;
  CREATE POLICY "plan_indicadores_admin_read" ON public.plan_indicadores FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: plan_indicadores | Policy: plan_indicadores_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "plan_indicadores_delete" ON public.plan_indicadores;
  CREATE POLICY "plan_indicadores_delete" ON public.plan_indicadores FOR DELETE TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: plan_indicadores | Policy: plan_indicadores_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "plan_indicadores_insert" ON public.plan_indicadores;
  CREATE POLICY "plan_indicadores_insert" ON public.plan_indicadores FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: plan_indicadores | Policy: plan_indicadores_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "plan_indicadores_select" ON public.plan_indicadores;
  CREATE POLICY "plan_indicadores_select" ON public.plan_indicadores FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: plan_indicadores | Policy: plan_indicadores_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "plan_indicadores_update" ON public.plan_indicadores;
  CREATE POLICY "plan_indicadores_update" ON public.plan_indicadores FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: plan_niveles | Policy: plan_niveles_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "plan_niveles_admin_read" ON public.plan_niveles;
  CREATE POLICY "plan_niveles_admin_read" ON public.plan_niveles FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: plan_niveles | Policy: plan_niveles_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "plan_niveles_delete" ON public.plan_niveles;
  CREATE POLICY "plan_niveles_delete" ON public.plan_niveles FOR DELETE TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: plan_niveles | Policy: plan_niveles_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "plan_niveles_insert" ON public.plan_niveles;
  CREATE POLICY "plan_niveles_insert" ON public.plan_niveles FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: plan_niveles | Policy: plan_niveles_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "plan_niveles_select" ON public.plan_niveles;
  CREATE POLICY "plan_niveles_select" ON public.plan_niveles FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: plan_niveles | Policy: plan_niveles_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "plan_niveles_update" ON public.plan_niveles;
  CREATE POLICY "plan_niveles_update" ON public.plan_niveles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: plan_objetivos | Policy: plan_objetivos_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "plan_objetivos_admin_read" ON public.plan_objetivos;
  CREATE POLICY "plan_objetivos_admin_read" ON public.plan_objetivos FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: plan_objetivos | Policy: plan_objetivos_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "plan_objetivos_delete" ON public.plan_objetivos;
  CREATE POLICY "plan_objetivos_delete" ON public.plan_objetivos FOR DELETE TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: plan_objetivos | Policy: plan_objetivos_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "plan_objetivos_insert" ON public.plan_objetivos;
  CREATE POLICY "plan_objetivos_insert" ON public.plan_objetivos FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: plan_objetivos | Policy: plan_objetivos_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "plan_objetivos_select" ON public.plan_objetivos;
  CREATE POLICY "plan_objetivos_select" ON public.plan_objetivos FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: plan_objetivos | Policy: plan_objetivos_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "plan_objetivos_update" ON public.plan_objetivos;
  CREATE POLICY "plan_objetivos_update" ON public.plan_objetivos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: plan_temas | Policy: plan_temas_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "plan_temas_admin_read" ON public.plan_temas;
  CREATE POLICY "plan_temas_admin_read" ON public.plan_temas FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: plan_temas | Policy: plan_temas_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "plan_temas_delete" ON public.plan_temas;
  CREATE POLICY "plan_temas_delete" ON public.plan_temas FOR DELETE TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: plan_temas | Policy: plan_temas_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "plan_temas_insert" ON public.plan_temas;
  CREATE POLICY "plan_temas_insert" ON public.plan_temas FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: plan_temas | Policy: plan_temas_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "plan_temas_select" ON public.plan_temas;
  CREATE POLICY "plan_temas_select" ON public.plan_temas FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: plan_temas | Policy: plan_temas_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "plan_temas_update" ON public.plan_temas;
  CREATE POLICY "plan_temas_update" ON public.plan_temas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: planificaciones | Policy: planificaciones_delete_propia | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "planificaciones_delete_propia" ON public.planificaciones;
  CREATE POLICY "planificaciones_delete_propia" ON public.planificaciones FOR DELETE TO authenticated USING ((es_admin() OR (maestro_id = maestro_actual())));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: planificaciones | Policy: planificaciones_insert_propia | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "planificaciones_insert_propia" ON public.planificaciones;
  CREATE POLICY "planificaciones_insert_propia" ON public.planificaciones FOR INSERT TO authenticated WITH CHECK ((es_admin() OR ((maestro_id = maestro_actual()) AND ((clase_id IS NULL) OR maestro_en_clase(clase_id)))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: planificaciones | Policy: planificaciones_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "planificaciones_read" ON public.planificaciones;
  CREATE POLICY "planificaciones_read" ON public.planificaciones FOR SELECT TO authenticated USING ((es_admin() OR (maestro_id = maestro_actual()) OR maestro_en_clase(clase_id)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: planificaciones | Policy: planificaciones_update_propia | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "planificaciones_update_propia" ON public.planificaciones;
  CREATE POLICY "planificaciones_update_propia" ON public.planificaciones FOR UPDATE TO authenticated USING ((es_admin() OR (maestro_id = maestro_actual()) OR maestro_en_clase(clase_id))) WITH CHECK ((es_admin() OR (maestro_id = maestro_actual()) OR maestro_en_clase(clase_id)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: planned_content | Policy: planned_content_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "planned_content_admin_read" ON public.planned_content;
  CREATE POLICY "planned_content_admin_read" ON public.planned_content FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: planned_content | Policy: planned_content_delete_all | Cmd: DELETE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "planned_content_delete_all" ON public.planned_content;
  CREATE POLICY "planned_content_delete_all" ON public.planned_content FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: planned_content | Policy: planned_content_insert_all | Cmd: INSERT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "planned_content_insert_all" ON public.planned_content;
  CREATE POLICY "planned_content_insert_all" ON public.planned_content FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: planned_content | Policy: planned_content_select_all | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "planned_content_select_all" ON public.planned_content;
  CREATE POLICY "planned_content_select_all" ON public.planned_content FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: planned_content | Policy: planned_content_update_all | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "planned_content_update_all" ON public.planned_content;
  CREATE POLICY "planned_content_update_all" ON public.planned_content FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: planning_documents | Policy: plandocs_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "plandocs_delete" ON public.planning_documents;
  CREATE POLICY "plandocs_delete" ON public.planning_documents FOR DELETE TO authenticated USING ((maestro_id = maestro_actual()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: planning_documents | Policy: plandocs_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "plandocs_insert" ON public.planning_documents;
  CREATE POLICY "plandocs_insert" ON public.planning_documents FOR INSERT TO authenticated WITH CHECK ((maestro_id = maestro_actual()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: planning_documents | Policy: plandocs_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "plandocs_select" ON public.planning_documents;
  CREATE POLICY "plandocs_select" ON public.planning_documents FOR SELECT TO authenticated USING ((maestro_id = maestro_actual()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: planning_documents | Policy: plandocs_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "plandocs_update" ON public.planning_documents;
  CREATE POLICY "plandocs_update" ON public.planning_documents FOR UPDATE TO authenticated USING ((maestro_id = maestro_actual())) WITH CHECK ((maestro_id = maestro_actual()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: planning_documents | Policy: planning_documents_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "planning_documents_admin_read" ON public.planning_documents;
  CREATE POLICY "planning_documents_admin_read" ON public.planning_documents FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: portal_catalog | Policy: portal_catalog_admin_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "portal_catalog_admin_all" ON public.portal_catalog;
  CREATE POLICY "portal_catalog_admin_all" ON public.portal_catalog FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = ANY (ARRAY['superadmin'::text, 'admin'::text]))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: portal_catalog | Policy: portal_catalog_select_authenticated | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "portal_catalog_select_authenticated" ON public.portal_catalog;
  CREATE POLICY "portal_catalog_select_authenticated" ON public.portal_catalog FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: postulantes | Policy: postulantes_delete_authenticated | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "postulantes_delete_authenticated" ON public.postulantes;
  CREATE POLICY "postulantes_delete_authenticated" ON public.postulantes FOR DELETE TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: postulantes | Policy: postulantes_delete_service_role | Cmd: DELETE | Roles: service_role
DO $$ BEGIN
  DROP POLICY IF EXISTS "postulantes_delete_service_role" ON public.postulantes;
  CREATE POLICY "postulantes_delete_service_role" ON public.postulantes FOR DELETE TO service_role USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: postulantes | Policy: postulantes_insert_service_role | Cmd: INSERT | Roles: service_role
DO $$ BEGIN
  DROP POLICY IF EXISTS "postulantes_insert_service_role" ON public.postulantes;
  CREATE POLICY "postulantes_insert_service_role" ON public.postulantes FOR INSERT TO service_role WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: postulantes | Policy: postulantes_select_authenticated | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "postulantes_select_authenticated" ON public.postulantes;
  CREATE POLICY "postulantes_select_authenticated" ON public.postulantes FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: postulantes | Policy: postulantes_update_authenticated | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "postulantes_update_authenticated" ON public.postulantes;
  CREATE POLICY "postulantes_update_authenticated" ON public.postulantes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: postulantes | Policy: postulantes_update_service_role | Cmd: UPDATE | Roles: service_role
DO $$ BEGIN
  DROP POLICY IF EXISTS "postulantes_update_service_role" ON public.postulantes;
  CREATE POLICY "postulantes_update_service_role" ON public.postulantes FOR UPDATE TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: profiles | Policy: Usuarios ven su propio perfil | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Usuarios ven su propio perfil" ON public.profiles;
  CREATE POLICY "Usuarios ven su propio perfil" ON public.profiles FOR SELECT TO authenticated USING ((id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: profiles | Policy: profiles_admin_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "profiles_admin_insert" ON public.profiles;
  CREATE POLICY "profiles_admin_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: profiles | Policy: profiles_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "profiles_admin_read" ON public.profiles;
  CREATE POLICY "profiles_admin_read" ON public.profiles FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: profiles | Policy: profiles_admin_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
  CREATE POLICY "profiles_admin_update" ON public.profiles FOR UPDATE TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: profiles | Policy: profiles_superadmin_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "profiles_superadmin_delete" ON public.profiles;
  CREATE POLICY "profiles_superadmin_delete" ON public.profiles FOR DELETE TO authenticated USING ((( SELECT is_super_admin() AS is_super_admin) = true));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: programas | Policy: Permitir actualizar programas | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "Permitir actualizar programas" ON public.programas;
  CREATE POLICY "Permitir actualizar programas" ON public.programas FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: programas | Policy: Permitir crear programas | Cmd: INSERT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "Permitir crear programas" ON public.programas;
  CREATE POLICY "Permitir crear programas" ON public.programas FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: programas | Policy: Permitir eliminar programas | Cmd: DELETE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "Permitir eliminar programas" ON public.programas;
  CREATE POLICY "Permitir eliminar programas" ON public.programas FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: programas | Policy: programas_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "programas_admin_read" ON public.programas;
  CREATE POLICY "programas_admin_read" ON public.programas FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: programas | Policy: programas_anon_read | Cmd: SELECT | Roles: anon
DO $$ BEGIN
  DROP POLICY IF EXISTS "programas_anon_read" ON public.programas;
  CREATE POLICY "programas_anon_read" ON public.programas FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: programas | Policy: programas_authenticated_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "programas_authenticated_all" ON public.programas;
  CREATE POLICY "programas_authenticated_all" ON public.programas FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: programas_prerrequisitos | Policy: prerrequisitos_select_authenticated | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "prerrequisitos_select_authenticated" ON public.programas_prerrequisitos;
  CREATE POLICY "prerrequisitos_select_authenticated" ON public.programas_prerrequisitos FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: progresos | Policy: progresos_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "progresos_admin_read" ON public.progresos;
  CREATE POLICY "progresos_admin_read" ON public.progresos FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: progresos | Policy: progresos_authenticated_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "progresos_authenticated_all" ON public.progresos;
  CREATE POLICY "progresos_authenticated_all" ON public.progresos FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: progresos | Policy: progresos_insert | Cmd: INSERT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "progresos_insert" ON public.progresos;
  CREATE POLICY "progresos_insert" ON public.progresos FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: progresos | Policy: progresos_select | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "progresos_select" ON public.progresos;
  CREATE POLICY "progresos_select" ON public.progresos FOR SELECT USING ((auth.role() = 'authenticated'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: progresos | Policy: progresos_superadmin_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "progresos_superadmin_delete" ON public.progresos;
  CREATE POLICY "progresos_superadmin_delete" ON public.progresos FOR DELETE TO authenticated USING ((( SELECT is_super_admin() AS is_super_admin) = true));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: progresos | Policy: progresos_update | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "progresos_update" ON public.progresos;
  CREATE POLICY "progresos_update" ON public.progresos FOR UPDATE USING ((auth.role() = 'authenticated'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: protocolos | Policy: protocolos_admin | Cmd: ALL | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "protocolos_admin" ON public.protocolos;
  CREATE POLICY "protocolos_admin" ON public.protocolos FOR ALL USING ((get_user_role() = 'admin'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: protocolos | Policy: protocolos_select | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "protocolos_select" ON public.protocolos;
  CREATE POLICY "protocolos_select" ON public.protocolos FOR SELECT USING ((activo = true));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: pulso_score_history | Policy: pulso_score_history_auth_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "pulso_score_history_auth_select" ON public.pulso_score_history;
  CREATE POLICY "pulso_score_history_auth_select" ON public.pulso_score_history FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: pulso_score_history | Policy: pulso_score_history_service_all | Cmd: ALL | Roles: service_role
DO $$ BEGIN
  DROP POLICY IF EXISTS "pulso_score_history_service_all" ON public.pulso_score_history;
  CREATE POLICY "pulso_score_history_service_all" ON public.pulso_score_history FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: push_subscriptions | Policy: push_own_user | Cmd: ALL | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "push_own_user" ON public.push_subscriptions;
  CREATE POLICY "push_own_user" ON public.push_subscriptions FOR ALL USING ((profile_id = auth.uid())) WITH CHECK ((profile_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: push_subscriptions | Policy: push_subscriptions_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "push_subscriptions_admin_read" ON public.push_subscriptions;
  CREATE POLICY "push_subscriptions_admin_read" ON public.push_subscriptions FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: push_subscriptions | Policy: push_subscriptions_own | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "push_subscriptions_own" ON public.push_subscriptions;
  CREATE POLICY "push_subscriptions_own" ON public.push_subscriptions FOR ALL TO authenticated USING ((profile_id = auth.uid())) WITH CHECK ((profile_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: rachas | Policy: rachas_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "rachas_admin_read" ON public.rachas;
  CREATE POLICY "rachas_admin_read" ON public.rachas FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: rachas | Policy: rachas_authenticated_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "rachas_authenticated_all" ON public.rachas;
  CREATE POLICY "rachas_authenticated_all" ON public.rachas FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: registros_pendientes | Policy: registros_pendientes_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "registros_pendientes_admin_read" ON public.registros_pendientes;
  CREATE POLICY "registros_pendientes_admin_read" ON public.registros_pendientes FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: registros_pendientes | Policy: registros_pendientes_authenticated_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "registros_pendientes_authenticated_all" ON public.registros_pendientes;
  CREATE POLICY "registros_pendientes_authenticated_all" ON public.registros_pendientes FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: repertoire_items | Policy: Allow admin modify repertoire_items | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow admin modify repertoire_items" ON public.repertoire_items;
  CREATE POLICY "Allow admin modify repertoire_items" ON public.repertoire_items FOR ALL TO authenticated USING (is_app_admin()) WITH CHECK (is_app_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: repertoire_items | Policy: Allow public read repertoire_items | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow public read repertoire_items" ON public.repertoire_items;
  CREATE POLICY "Allow public read repertoire_items" ON public.repertoire_items FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: representantes | Policy: representantes_all_admin | Cmd: ALL | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "representantes_all_admin" ON public.representantes;
  CREATE POLICY "representantes_all_admin" ON public.representantes FOR ALL USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: representantes | Policy: representantes_select_cajero_admin | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "representantes_select_cajero_admin" ON public.representantes;
  CREATE POLICY "representantes_select_cajero_admin" ON public.representantes FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: representantes | Policy: representantes_select_representante | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "representantes_select_representante" ON public.representantes;
  CREATE POLICY "representantes_select_representante" ON public.representantes FOR SELECT USING (((get_user_role() = 'representante'::text) AND (familia_id = get_user_familia_id())));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: retenciones_instrumento | Policy: retenciones_select_auth | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "retenciones_select_auth" ON public.retenciones_instrumento;
  CREATE POLICY "retenciones_select_auth" ON public.retenciones_instrumento FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: retenciones_instrumento | Policy: retenciones_write_admin | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "retenciones_write_admin" ON public.retenciones_instrumento;
  CREATE POLICY "retenciones_write_admin" ON public.retenciones_instrumento FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: route_versions | Policy: maestros_delete_own_draft_versions | Cmd: DELETE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestros_delete_own_draft_versions" ON public.route_versions;
  CREATE POLICY "maestros_delete_own_draft_versions" ON public.route_versions FOR DELETE USING (((created_by = auth.uid()) AND (status = 'draft'::route_status)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: route_versions | Policy: maestros_select_own_draft_versions | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestros_select_own_draft_versions" ON public.route_versions;
  CREATE POLICY "maestros_select_own_draft_versions" ON public.route_versions FOR SELECT USING (((created_by = auth.uid()) AND (status = 'draft'::route_status)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: route_versions | Policy: maestros_update_own_draft_versions | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "maestros_update_own_draft_versions" ON public.route_versions;
  CREATE POLICY "maestros_update_own_draft_versions" ON public.route_versions FOR UPDATE USING (((created_by = auth.uid()) AND (status = 'draft'::route_status)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: route_versions | Policy: route_versions_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "route_versions_admin_read" ON public.route_versions;
  CREATE POLICY "route_versions_admin_read" ON public.route_versions FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: routes | Policy: Maestros pueden leer rutas | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Maestros pueden leer rutas" ON public.routes;
  CREATE POLICY "Maestros pueden leer rutas" ON public.routes FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: routes | Policy: routes_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "routes_admin_read" ON public.routes;
  CREATE POLICY "routes_admin_read" ON public.routes FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: ruta_contenido_objetivos | Policy: ruta_contenido_objetivos_insert | Cmd: INSERT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "ruta_contenido_objetivos_insert" ON public.ruta_contenido_objetivos;
  CREATE POLICY "ruta_contenido_objetivos_insert" ON public.ruta_contenido_objetivos FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM rutas_contenido
  WHERE ((rutas_contenido.id = ruta_contenido_objetivos.ruta_id) AND (auth.uid() = rutas_contenido.creada_por)))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: ruta_contenido_objetivos | Policy: ruta_contenido_objetivos_select_all | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "ruta_contenido_objetivos_select_all" ON public.ruta_contenido_objetivos;
  CREATE POLICY "ruta_contenido_objetivos_select_all" ON public.ruta_contenido_objetivos FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: ruta_contenido_objetivos | Policy: ruta_contenido_objetivos_update | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "ruta_contenido_objetivos_update" ON public.ruta_contenido_objetivos;
  CREATE POLICY "ruta_contenido_objetivos_update" ON public.ruta_contenido_objetivos FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM rutas_contenido
  WHERE ((rutas_contenido.id = ruta_contenido_objetivos.ruta_id) AND (auth.uid() = rutas_contenido.creada_por)))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: rutas_contenido | Policy: rutas_contenido_insert_maestro | Cmd: INSERT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "rutas_contenido_insert_maestro" ON public.rutas_contenido;
  CREATE POLICY "rutas_contenido_insert_maestro" ON public.rutas_contenido FOR INSERT WITH CHECK ((auth.uid() = creada_por));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: rutas_contenido | Policy: rutas_contenido_select_all | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "rutas_contenido_select_all" ON public.rutas_contenido;
  CREATE POLICY "rutas_contenido_select_all" ON public.rutas_contenido FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: rutas_contenido | Policy: rutas_contenido_update_maestro | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "rutas_contenido_update_maestro" ON public.rutas_contenido;
  CREATE POLICY "rutas_contenido_update_maestro" ON public.rutas_contenido FOR UPDATE USING (((auth.uid() = creada_por) OR (auth.uid() = aprobada_por)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: salones | Policy: Permitir actualizar salones | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "Permitir actualizar salones" ON public.salones;
  CREATE POLICY "Permitir actualizar salones" ON public.salones FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: salones | Policy: Permitir crear salones | Cmd: INSERT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "Permitir crear salones" ON public.salones;
  CREATE POLICY "Permitir crear salones" ON public.salones FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: salones | Policy: Permitir eliminar salones | Cmd: DELETE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "Permitir eliminar salones" ON public.salones;
  CREATE POLICY "Permitir eliminar salones" ON public.salones FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: salones | Policy: salones_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "salones_admin_read" ON public.salones;
  CREATE POLICY "salones_admin_read" ON public.salones FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: salones | Policy: salones_authenticated_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "salones_authenticated_all" ON public.salones;
  CREATE POLICY "salones_authenticated_all" ON public.salones FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: schedule_run_feedback | Policy: admins_all_feedback | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "admins_all_feedback" ON public.schedule_run_feedback;
  CREATE POLICY "admins_all_feedback" ON public.schedule_run_feedback FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM maestros
  WHERE ((maestros.user_id = auth.uid()) AND (maestros.es_admin = true)))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: schedule_run_feedback | Policy: authenticated_insert_feedback | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "authenticated_insert_feedback" ON public.schedule_run_feedback;
  CREATE POLICY "authenticated_insert_feedback" ON public.schedule_run_feedback FOR INSERT TO authenticated WITH CHECK ((usuario_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: schedule_run_feedback | Policy: authenticated_select_feedback | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "authenticated_select_feedback" ON public.schedule_run_feedback;
  CREATE POLICY "authenticated_select_feedback" ON public.schedule_run_feedback FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: schedule_runs | Policy: authenticated_all_runs | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "authenticated_all_runs" ON public.schedule_runs;
  CREATE POLICY "authenticated_all_runs" ON public.schedule_runs FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: score_compromiso | Policy: score_select_admin_only | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "score_select_admin_only" ON public.score_compromiso;
  CREATE POLICY "score_select_admin_only" ON public.score_compromiso FOR SELECT USING ((get_user_role() = 'admin'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: sections | Policy: Allow admin modify sections | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow admin modify sections" ON public.sections;
  CREATE POLICY "Allow admin modify sections" ON public.sections FOR ALL TO authenticated USING (is_app_admin()) WITH CHECK (is_app_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: sections | Policy: Allow public read sections | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow public read sections" ON public.sections;
  CREATE POLICY "Allow public read sections" ON public.sections FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: seguimiento_ausencias_reinicio | Policy: ausencias_reinicio_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "ausencias_reinicio_select" ON public.seguimiento_ausencias_reinicio;
  CREATE POLICY "ausencias_reinicio_select" ON public.seguimiento_ausencias_reinicio FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: seguimiento_ausencias_reinicio | Policy: ausencias_reinicio_write | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "ausencias_reinicio_write" ON public.seguimiento_ausencias_reinicio;
  CREATE POLICY "ausencias_reinicio_write" ON public.seguimiento_ausencias_reinicio FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: seguimiento_reglas | Policy: rls_seguimiento_reglas_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "rls_seguimiento_reglas_all" ON public.seguimiento_reglas;
  CREATE POLICY "rls_seguimiento_reglas_all" ON public.seguimiento_reglas FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: service_account_observations | Policy: service_account_observations_insert_finanzas_admin | Cmd: INSERT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "service_account_observations_insert_finanzas_admin" ON public.service_account_observations;
  CREATE POLICY "service_account_observations_insert_finanzas_admin" ON public.service_account_observations FOR INSERT WITH CHECK ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: service_account_observations | Policy: service_account_observations_select_finanzas_admin | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "service_account_observations_select_finanzas_admin" ON public.service_account_observations;
  CREATE POLICY "service_account_observations_select_finanzas_admin" ON public.service_account_observations FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: service_accounts | Policy: service_accounts_insert_finanzas_admin | Cmd: INSERT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "service_accounts_insert_finanzas_admin" ON public.service_accounts;
  CREATE POLICY "service_accounts_insert_finanzas_admin" ON public.service_accounts FOR INSERT WITH CHECK ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: service_accounts | Policy: service_accounts_select_finanzas_admin | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "service_accounts_select_finanzas_admin" ON public.service_accounts;
  CREATE POLICY "service_accounts_select_finanzas_admin" ON public.service_accounts FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: service_accounts | Policy: service_accounts_update_admin | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "service_accounts_update_admin" ON public.service_accounts;
  CREATE POLICY "service_accounts_update_admin" ON public.service_accounts FOR UPDATE USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: sesiones_clase | Policy: Maestros pueden actualizar sus propias sesiones | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Maestros pueden actualizar sus propias sesiones" ON public.sesiones_clase;
  CREATE POLICY "Maestros pueden actualizar sus propias sesiones" ON public.sesiones_clase FOR UPDATE TO authenticated USING ((maestro_id = maestro_actual())) WITH CHECK ((maestro_id = maestro_actual()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: sesiones_clase | Policy: Maestros pueden crear sesiones de sus clases | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Maestros pueden crear sesiones de sus clases" ON public.sesiones_clase;
  CREATE POLICY "Maestros pueden crear sesiones de sus clases" ON public.sesiones_clase FOR INSERT TO authenticated WITH CHECK ((maestro_en_clase(clase_id) AND (maestro_id = maestro_actual())));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: sesiones_clase | Policy: Maestros ven sus sesiones | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Maestros ven sus sesiones" ON public.sesiones_clase;
  CREATE POLICY "Maestros ven sus sesiones" ON public.sesiones_clase FOR SELECT TO authenticated USING (((maestro_id = maestro_actual()) OR maestro_en_clase(clase_id)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: sesiones_clase | Policy: sesiones_admin_insert | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "sesiones_admin_insert" ON public.sesiones_clase;
  CREATE POLICY "sesiones_admin_insert" ON public.sesiones_clase FOR INSERT TO authenticated WITH CHECK ((es_admin() OR (maestro_id = maestro_actual()) OR maestro_en_clase(clase_id)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: sesiones_clase | Policy: sesiones_admin_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "sesiones_admin_select" ON public.sesiones_clase;
  CREATE POLICY "sesiones_admin_select" ON public.sesiones_clase FOR SELECT TO authenticated USING ((es_admin() OR (maestro_id = maestro_actual()) OR maestro_en_clase(clase_id)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: sesiones_clase | Policy: sesiones_admin_update | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "sesiones_admin_update" ON public.sesiones_clase;
  CREATE POLICY "sesiones_admin_update" ON public.sesiones_clase FOR UPDATE TO authenticated USING ((es_admin() OR (maestro_id = maestro_actual()) OR maestro_en_clase(clase_id))) WITH CHECK ((es_admin() OR (maestro_id = maestro_actual()) OR maestro_en_clase(clase_id)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: sesiones_clase | Policy: sesiones_clase_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "sesiones_clase_delete" ON public.sesiones_clase;
  CREATE POLICY "sesiones_clase_delete" ON public.sesiones_clase FOR DELETE TO authenticated USING ((maestro_id = maestro_actual()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: sesiones_clase | Policy: sesiones_superadmin_delete | Cmd: DELETE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "sesiones_superadmin_delete" ON public.sesiones_clase;
  CREATE POLICY "sesiones_superadmin_delete" ON public.sesiones_clase FOR DELETE TO authenticated USING ((( SELECT is_super_admin() AS is_super_admin) = true));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: signage_media | Policy: signage_media_admin_write | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "signage_media_admin_write" ON public.signage_media;
  CREATE POLICY "signage_media_admin_write" ON public.signage_media FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: signage_media | Policy: signage_media_anon_read | Cmd: SELECT | Roles: anon
DO $$ BEGIN
  DROP POLICY IF EXISTS "signage_media_anon_read" ON public.signage_media;
  CREATE POLICY "signage_media_anon_read" ON public.signage_media FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: signage_media | Policy: signage_media_auth_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "signage_media_auth_read" ON public.signage_media;
  CREATE POLICY "signage_media_auth_read" ON public.signage_media FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: signage_pantallas | Policy: signage_pantallas_admin_write | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "signage_pantallas_admin_write" ON public.signage_pantallas;
  CREATE POLICY "signage_pantallas_admin_write" ON public.signage_pantallas FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: signage_pantallas | Policy: signage_pantallas_anon_read | Cmd: SELECT | Roles: anon
DO $$ BEGIN
  DROP POLICY IF EXISTS "signage_pantallas_anon_read" ON public.signage_pantallas;
  CREATE POLICY "signage_pantallas_anon_read" ON public.signage_pantallas FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: signage_pantallas | Policy: signage_pantallas_auth_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "signage_pantallas_auth_read" ON public.signage_pantallas;
  CREATE POLICY "signage_pantallas_auth_read" ON public.signage_pantallas FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: sim_actores | Policy: sim_actores_admin_write | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "sim_actores_admin_write" ON public.sim_actores;
  CREATE POLICY "sim_actores_admin_write" ON public.sim_actores FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: sim_actores | Policy: sim_actores_auth_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "sim_actores_auth_read" ON public.sim_actores;
  CREATE POLICY "sim_actores_auth_read" ON public.sim_actores FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: sim_calendario | Policy: sim_calendario_auth_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "sim_calendario_auth_all" ON public.sim_calendario;
  CREATE POLICY "sim_calendario_auth_all" ON public.sim_calendario FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: sim_config | Policy: sim_config_admin_write | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "sim_config_admin_write" ON public.sim_config;
  CREATE POLICY "sim_config_admin_write" ON public.sim_config FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: sim_config | Policy: sim_config_auth_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "sim_config_auth_read" ON public.sim_config;
  CREATE POLICY "sim_config_auth_read" ON public.sim_config FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: sim_log | Policy: sim_log_admin_write | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "sim_log_admin_write" ON public.sim_log;
  CREATE POLICY "sim_log_admin_write" ON public.sim_log FOR INSERT TO authenticated WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: sim_log | Policy: sim_log_auth_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "sim_log_auth_read" ON public.sim_log;
  CREATE POLICY "sim_log_auth_read" ON public.sim_log FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: sim_outbox | Policy: sim_outbox_admin_write | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "sim_outbox_admin_write" ON public.sim_outbox;
  CREATE POLICY "sim_outbox_admin_write" ON public.sim_outbox FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: sim_outbox | Policy: sim_outbox_auth_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "sim_outbox_auth_read" ON public.sim_outbox;
  CREATE POLICY "sim_outbox_auth_read" ON public.sim_outbox FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: sim_runs | Policy: sim_runs_auth_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "sim_runs_auth_all" ON public.sim_runs;
  CREATE POLICY "sim_runs_auth_all" ON public.sim_runs FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: sim_tareas | Policy: sim_tareas_admin_write | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "sim_tareas_admin_write" ON public.sim_tareas;
  CREATE POLICY "sim_tareas_admin_write" ON public.sim_tareas FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: sim_tareas | Policy: sim_tareas_auth_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "sim_tareas_auth_read" ON public.sim_tareas;
  CREATE POLICY "sim_tareas_auth_read" ON public.sim_tareas FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: soi_analisis_semanal | Policy: soi_analisis_semanal_auth_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "soi_analisis_semanal_auth_select" ON public.soi_analisis_semanal;
  CREATE POLICY "soi_analisis_semanal_auth_select" ON public.soi_analisis_semanal FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: soi_analisis_semanal | Policy: soi_analisis_semanal_service_all | Cmd: ALL | Roles: service_role
DO $$ BEGIN
  DROP POLICY IF EXISTS "soi_analisis_semanal_service_all" ON public.soi_analisis_semanal;
  CREATE POLICY "soi_analisis_semanal_service_all" ON public.soi_analisis_semanal FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: soi_event_bus | Policy: soi_event_bus_service_only | Cmd: ALL | Roles: service_role
DO $$ BEGIN
  DROP POLICY IF EXISTS "soi_event_bus_service_only" ON public.soi_event_bus;
  CREATE POLICY "soi_event_bus_service_only" ON public.soi_event_bus FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: soi_eventos | Policy: soi_eventos_acm_select | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "soi_eventos_acm_select" ON public.soi_eventos;
  CREATE POLICY "soi_eventos_acm_select" ON public.soi_eventos FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'ACM'::text) AND (entidad_tipo = ANY (ARRAY['sesiones_clase'::text, 'asistencias'::text, 'periodos'::text]))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: soi_eventos | Policy: soi_eventos_adm_select | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "soi_eventos_adm_select" ON public.soi_eventos;
  CREATE POLICY "soi_eventos_adm_select" ON public.soi_eventos FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'ADM'::text) AND (entidad_tipo = ANY (ARRAY['justificaciones'::text, 'periodos'::text]))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: soi_eventos | Policy: soi_eventos_dir_select | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "soi_eventos_dir_select" ON public.soi_eventos;
  CREATE POLICY "soi_eventos_dir_select" ON public.soi_eventos FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'DIR'::text)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: soi_eventos | Policy: soi_eventos_fin_select | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "soi_eventos_fin_select" ON public.soi_eventos;
  CREATE POLICY "soi_eventos_fin_select" ON public.soi_eventos FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'FIN'::text) AND false));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: soi_eventos | Policy: soi_eventos_immutable_delete | Cmd: DELETE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "soi_eventos_immutable_delete" ON public.soi_eventos;
  CREATE POLICY "soi_eventos_immutable_delete" ON public.soi_eventos FOR DELETE USING (false);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: soi_eventos | Policy: soi_eventos_immutable_update | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "soi_eventos_immutable_update" ON public.soi_eventos;
  CREATE POLICY "soi_eventos_immutable_update" ON public.soi_eventos FOR UPDATE USING (false) WITH CHECK (false);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: soi_eventos | Policy: soi_eventos_log_select | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "soi_eventos_log_select" ON public.soi_eventos;
  CREATE POLICY "soi_eventos_log_select" ON public.soi_eventos FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'LOG'::text) AND (entidad_tipo = 'tareas_institucionales'::text)));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: soi_eventos | Policy: soi_eventos_service_role_all | Cmd: ALL | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "soi_eventos_service_role_all" ON public.soi_eventos;
  CREATE POLICY "soi_eventos_service_role_all" ON public.soi_eventos FOR ALL USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: soi_eventos | Policy: soi_eventos_tecnico_select | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "soi_eventos_tecnico_select" ON public.soi_eventos;
  CREATE POLICY "soi_eventos_tecnico_select" ON public.soi_eventos FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'TECNICO'::text) AND false));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: soi_process_contracts | Policy: soi_process_contracts_auth_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "soi_process_contracts_auth_read" ON public.soi_process_contracts;
  CREATE POLICY "soi_process_contracts_auth_read" ON public.soi_process_contracts FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: soi_process_contracts | Policy: soi_process_contracts_auth_write | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "soi_process_contracts_auth_write" ON public.soi_process_contracts;
  CREATE POLICY "soi_process_contracts_auth_write" ON public.soi_process_contracts FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: soi_rule_effectiveness | Policy: soi_rule_effectiveness_auth_select | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "soi_rule_effectiveness_auth_select" ON public.soi_rule_effectiveness;
  CREATE POLICY "soi_rule_effectiveness_auth_select" ON public.soi_rule_effectiveness FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: soi_rule_effectiveness | Policy: soi_rule_effectiveness_service_all | Cmd: ALL | Roles: service_role
DO $$ BEGIN
  DROP POLICY IF EXISTS "soi_rule_effectiveness_service_all" ON public.soi_rule_effectiveness;
  CREATE POLICY "soi_rule_effectiveness_service_all" ON public.soi_rule_effectiveness FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: solicitudes_ausencia | Policy: solicitudes_ausencia_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "solicitudes_ausencia_admin_read" ON public.solicitudes_ausencia;
  CREATE POLICY "solicitudes_ausencia_admin_read" ON public.solicitudes_ausencia FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: solicitudes_ausencia | Policy: solicitudes_ausencia_own | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "solicitudes_ausencia_own" ON public.solicitudes_ausencia;
  CREATE POLICY "solicitudes_ausencia_own" ON public.solicitudes_ausencia FOR ALL TO authenticated USING ((maestro_id = maestro_actual())) WITH CHECK ((maestro_id = maestro_actual()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: solicitudes_necesidades | Policy: solic_insert_own | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "solic_insert_own" ON public.solicitudes_necesidades;
  CREATE POLICY "solic_insert_own" ON public.solicitudes_necesidades FOR INSERT TO authenticated WITH CHECK ((maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: solicitudes_necesidades | Policy: solic_select_owner_acm_fin_admin | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "solic_select_owner_acm_fin_admin" ON public.solicitudes_necesidades;
  CREATE POLICY "solic_select_owner_acm_fin_admin" ON public.solicitudes_necesidades FOR SELECT TO authenticated USING (((maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'admin'::text)))) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'finanzas'::text))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: solicitudes_necesidades | Policy: solic_update_acm_admin_stage | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "solic_update_acm_admin_stage" ON public.solicitudes_necesidades;
  CREATE POLICY "solic_update_acm_admin_stage" ON public.solicitudes_necesidades FOR UPDATE TO authenticated USING (((estado = 'pendiente'::text) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'admin'::text)))))) WITH CHECK (((estado = ANY (ARRAY['pre_aprobada_acm'::text, 'rechazada_acm'::text, 'en_presupuesto'::text])) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'admin'::text))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: solicitudes_necesidades | Policy: solic_update_admin_override | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "solic_update_admin_override" ON public.solicitudes_necesidades;
  CREATE POLICY "solic_update_admin_override" ON public.solicitudes_necesidades FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'admin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'admin'::text)))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: solicitudes_necesidades | Policy: solic_update_fin_admin_cajero_stage | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "solic_update_fin_admin_cajero_stage" ON public.solicitudes_necesidades;
  CREATE POLICY "solic_update_fin_admin_cajero_stage" ON public.solicitudes_necesidades FOR UPDATE TO authenticated USING (((estado = ANY (ARRAY['en_presupuesto'::text, 'presupuestada'::text])) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = ANY (ARRAY['admin'::text, 'finanzas'::text]))))))) WITH CHECK (((estado = ANY (ARRAY['presupuestada'::text, 'aprobada'::text, 'rechazada'::text, 'comprada'::text, 'entregada'::text])) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = ANY (ARRAY['admin'::text, 'finanzas'::text])))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: solicitudes_necesidades | Policy: solic_update_owner_cancel | Cmd: UPDATE | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "solic_update_owner_cancel" ON public.solicitudes_necesidades;
  CREATE POLICY "solic_update_owner_cancel" ON public.solicitudes_necesidades FOR UPDATE TO authenticated USING (((estado = 'pendiente'::text) AND (maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))))) WITH CHECK (((estado = 'cancelada'::text) AND (maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid())))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: solicitudes_permisos | Policy: Admin puede ver y actualizar todas | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admin puede ver y actualizar todas" ON public.solicitudes_permisos;
  CREATE POLICY "Admin puede ver y actualizar todas" ON public.solicitudes_permisos FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: solicitudes_permisos | Policy: Maestro puede crear su solicitud | Cmd: INSERT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Maestro puede crear su solicitud" ON public.solicitudes_permisos;
  CREATE POLICY "Maestro puede crear su solicitud" ON public.solicitudes_permisos FOR INSERT TO authenticated WITH CHECK ((maestro_id IN ( SELECT m.id
   FROM maestros m
  WHERE (m.user_id = auth.uid()))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: solicitudes_permisos | Policy: Maestro puede ver su solicitud | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "Maestro puede ver su solicitud" ON public.solicitudes_permisos;
  CREATE POLICY "Maestro puede ver su solicitud" ON public.solicitudes_permisos FOR SELECT TO authenticated USING (((maestro_id IN ( SELECT m.id
   FROM maestros m
  WHERE (m.user_id = auth.uid()))) OR es_admin()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: student_case_actions | Policy: rls_student_case_actions_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "rls_student_case_actions_all" ON public.student_case_actions;
  CREATE POLICY "rls_student_case_actions_all" ON public.student_case_actions FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: student_case_alerts | Policy: rls_student_case_alerts_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "rls_student_case_alerts_all" ON public.student_case_alerts;
  CREATE POLICY "rls_student_case_alerts_all" ON public.student_case_alerts FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: student_case_events | Policy: rls_student_case_events_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "rls_student_case_events_all" ON public.student_case_events;
  CREATE POLICY "rls_student_case_events_all" ON public.student_case_events FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: student_cases | Policy: rls_student_cases_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "rls_student_cases_all" ON public.student_cases;
  CREATE POLICY "rls_student_cases_all" ON public.student_cases FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: student_indicator_progress | Policy: student_indicator_progress_scoped | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "student_indicator_progress_scoped" ON public.student_indicator_progress;
  CREATE POLICY "student_indicator_progress_scoped" ON public.student_indicator_progress FOR ALL TO authenticated USING ((es_admin() OR (EXISTS ( SELECT 1
   FROM teacher_class_sessions s
  WHERE ((s.id = student_indicator_progress.session_id) AND (s.teacher_id = maestro_actual())))))) WITH CHECK ((es_admin() OR (EXISTS ( SELECT 1
   FROM teacher_class_sessions s
  WHERE ((s.id = student_indicator_progress.session_id) AND (s.teacher_id = maestro_actual()))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: system_config | Policy: admin_read_system_config | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "admin_read_system_config" ON public.system_config;
  CREATE POLICY "admin_read_system_config" ON public.system_config FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.rol = 'admin'::text) AND (p.estado = 'activo'::text)))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: system_config | Policy: admin_write_system_config | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "admin_write_system_config" ON public.system_config;
  CREATE POLICY "admin_write_system_config" ON public.system_config FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.rol = 'admin'::text) AND (p.estado = 'activo'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.rol = 'admin'::text) AND (p.estado = 'activo'::text)))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: system_config | Policy: system_config_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "system_config_admin_read" ON public.system_config;
  CREATE POLICY "system_config_admin_read" ON public.system_config FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: system_config | Policy: system_config_public_keys_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "system_config_public_keys_read" ON public.system_config;
  CREATE POLICY "system_config_public_keys_read" ON public.system_config FOR SELECT TO authenticated USING (((key)::text <> ALL ((ARRAY['groq_api_key'::character varying, 'openrouter_api_key'::character varying, 'vapid_private_key'::character varying, 'admin_invite_code'::character varying, 'telegram_monitor_healthcheck_secret'::character varying])::text[])));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: tarea_comentarios | Policy: tc_auth_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "tc_auth_all" ON public.tarea_comentarios;
  CREATE POLICY "tc_auth_all" ON public.tarea_comentarios FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: tarea_historial | Policy: th_auth_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "th_auth_read" ON public.tarea_historial;
  CREATE POLICY "th_auth_read" ON public.tarea_historial FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: tarea_logs | Policy: logs_admin | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "logs_admin" ON public.tarea_logs;
  CREATE POLICY "logs_admin" ON public.tarea_logs FOR SELECT USING ((get_user_role() = 'admin'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: tarea_logs | Policy: logs_own_tarea | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "logs_own_tarea" ON public.tarea_logs;
  CREATE POLICY "logs_own_tarea" ON public.tarea_logs FOR SELECT USING ((tarea_id IN ( SELECT tareas_calendario.id
   FROM tareas_calendario
  WHERE (tareas_calendario.departamento_id IN ( SELECT usuario_departamentos.departamento_id
           FROM usuario_departamentos
          WHERE (usuario_departamentos.user_id = auth.uid()))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: tareas_caja | Policy: tareas_all_admin | Cmd: ALL | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "tareas_all_admin" ON public.tareas_caja;
  CREATE POLICY "tareas_all_admin" ON public.tareas_caja FOR ALL USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: tareas_caja | Policy: tareas_insert_cajero_admin | Cmd: INSERT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "tareas_insert_cajero_admin" ON public.tareas_caja;
  CREATE POLICY "tareas_insert_cajero_admin" ON public.tareas_caja FOR INSERT WITH CHECK ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: tareas_caja | Policy: tareas_select_own_cajero | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "tareas_select_own_cajero" ON public.tareas_caja;
  CREATE POLICY "tareas_select_own_cajero" ON public.tareas_caja FOR SELECT USING (((get_user_role() = 'finanzas'::text) AND (asignado_a = auth.uid())));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: tareas_caja | Policy: tareas_update_own_cajero | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "tareas_update_own_cajero" ON public.tareas_caja;
  CREATE POLICY "tareas_update_own_cajero" ON public.tareas_caja FOR UPDATE USING (((get_user_role() = 'finanzas'::text) AND (asignado_a = auth.uid()))) WITH CHECK (((get_user_role() = 'finanzas'::text) AND (asignado_a = auth.uid())));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: tareas_calendario | Policy: tareas_admin_all | Cmd: ALL | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "tareas_admin_all" ON public.tareas_calendario;
  CREATE POLICY "tareas_admin_all" ON public.tareas_calendario FOR ALL USING ((get_user_role() = 'admin'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: tareas_calendario | Policy: tareas_select_own_dept | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "tareas_select_own_dept" ON public.tareas_calendario;
  CREATE POLICY "tareas_select_own_dept" ON public.tareas_calendario FOR SELECT USING (((departamento_id IN ( SELECT usuario_departamentos.departamento_id
   FROM usuario_departamentos
  WHERE (usuario_departamentos.user_id = auth.uid()))) OR (asignado_a = auth.uid())));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: tareas_calendario | Policy: tareas_update_own | Cmd: UPDATE | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "tareas_update_own" ON public.tareas_calendario;
  CREATE POLICY "tareas_update_own" ON public.tareas_calendario FOR UPDATE USING (((asignado_a = auth.uid()) OR (departamento_id IN ( SELECT usuario_departamentos.departamento_id
   FROM usuario_departamentos
  WHERE ((usuario_departamentos.user_id = auth.uid()) AND (usuario_departamentos.rol = 'jefe'::text))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: tareas_institucionales | Policy: tareas_auth_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "tareas_auth_all" ON public.tareas_institucionales;
  CREATE POLICY "tareas_auth_all" ON public.tareas_institucionales FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: teacher_class_sessions | Policy: teacher_class_sessions_owner | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "teacher_class_sessions_owner" ON public.teacher_class_sessions;
  CREATE POLICY "teacher_class_sessions_owner" ON public.teacher_class_sessions FOR ALL TO authenticated USING ((es_admin() OR (teacher_id = maestro_actual()))) WITH CHECK ((es_admin() OR (teacher_id = maestro_actual())));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: teacher_session_indicators | Policy: teacher_session_indicators_owner | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "teacher_session_indicators_owner" ON public.teacher_session_indicators;
  CREATE POLICY "teacher_session_indicators_owner" ON public.teacher_session_indicators FOR ALL TO authenticated USING ((es_admin() OR (EXISTS ( SELECT 1
   FROM teacher_class_sessions s
  WHERE ((s.id = teacher_session_indicators.session_id) AND (s.teacher_id = maestro_actual())))))) WITH CHECK ((es_admin() OR (EXISTS ( SELECT 1
   FROM teacher_class_sessions s
  WHERE ((s.id = teacher_session_indicators.session_id) AND (s.teacher_id = maestro_actual()))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: telegram_allowed_users | Policy: authenticated_read_own | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "authenticated_read_own" ON public.telegram_allowed_users;
  CREATE POLICY "authenticated_read_own" ON public.telegram_allowed_users FOR SELECT TO authenticated USING (((created_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'admin'::text))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: telegram_allowed_users | Policy: service_role_all | Cmd: ALL | Roles: service_role
DO $$ BEGIN
  DROP POLICY IF EXISTS "service_role_all" ON public.telegram_allowed_users;
  CREATE POLICY "service_role_all" ON public.telegram_allowed_users FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: telegram_messages_raw | Policy: deny_anon | Cmd: ALL | Roles: anon
DO $$ BEGIN
  DROP POLICY IF EXISTS "deny_anon" ON public.telegram_messages_raw;
  CREATE POLICY "deny_anon" ON public.telegram_messages_raw FOR ALL TO anon USING (false) WITH CHECK (false);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: telegram_messages_raw | Policy: deny_authenticated | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "deny_authenticated" ON public.telegram_messages_raw;
  CREATE POLICY "deny_authenticated" ON public.telegram_messages_raw FOR ALL TO authenticated USING (false) WITH CHECK (false);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: telegram_messages_raw | Policy: service_role_all | Cmd: ALL | Roles: service_role
DO $$ BEGIN
  DROP POLICY IF EXISTS "service_role_all" ON public.telegram_messages_raw;
  CREATE POLICY "service_role_all" ON public.telegram_messages_raw FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: unidades | Policy: unidades_admin_read | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "unidades_admin_read" ON public.unidades;
  CREATE POLICY "unidades_admin_read" ON public.unidades FOR SELECT USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: unidades | Policy: unidades_authenticated_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "unidades_authenticated_all" ON public.unidades;
  CREATE POLICY "unidades_authenticated_all" ON public.unidades FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: user_portal_access | Policy: user_portal_access_admin_write | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "user_portal_access_admin_write" ON public.user_portal_access;
  CREATE POLICY "user_portal_access_admin_write" ON public.user_portal_access FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = ANY (ARRAY['superadmin'::text, 'admin'::text]))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: user_portal_access | Policy: user_portal_access_select_own_or_admin | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "user_portal_access_select_own_or_admin" ON public.user_portal_access;
  CREATE POLICY "user_portal_access_select_own_or_admin" ON public.user_portal_access FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = ANY (ARRAY['superadmin'::text, 'admin'::text])))))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: usuario_departamentos | Policy: user_dept_admin | Cmd: ALL | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "user_dept_admin" ON public.usuario_departamentos;
  CREATE POLICY "user_dept_admin" ON public.usuario_departamentos FOR ALL USING ((get_user_role() = 'admin'::text));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: usuario_departamentos | Policy: user_dept_own | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "user_dept_own" ON public.usuario_departamentos;
  CREATE POLICY "user_dept_own" ON public.usuario_departamentos FOR SELECT USING ((user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: wallet_movimientos | Policy: wallet_mov_select_cajero_admin | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "wallet_mov_select_cajero_admin" ON public.wallet_movimientos;
  CREATE POLICY "wallet_mov_select_cajero_admin" ON public.wallet_movimientos FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: wallet_movimientos | Policy: wallet_mov_select_representante | Cmd: SELECT | Roles: public
DO $$ BEGIN
  DROP POLICY IF EXISTS "wallet_mov_select_representante" ON public.wallet_movimientos;
  CREATE POLICY "wallet_mov_select_representante" ON public.wallet_movimientos FOR SELECT USING (((get_user_role() = 'representante'::text) AND (familia_id = get_user_familia_id())));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: whatsapp_consentimientos | Policy: wc_admin_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "wc_admin_all" ON public.whatsapp_consentimientos;
  CREATE POLICY "wc_admin_all" ON public.whatsapp_consentimientos FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: whatsapp_optout | Policy: wo_admin_all | Cmd: ALL | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "wo_admin_all" ON public.whatsapp_optout;
  CREATE POLICY "wo_admin_all" ON public.whatsapp_optout FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: whatsapp_webhook_log | Policy: webhook_log_admin_read | Cmd: SELECT | Roles: authenticated
DO $$ BEGIN
  DROP POLICY IF EXISTS "webhook_log_admin_read" ON public.whatsapp_webhook_log;
  CREATE POLICY "webhook_log_admin_read" ON public.whatsapp_webhook_log FOR SELECT TO authenticated USING (es_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: whatsapp_webhook_log | Policy: webhook_log_service_role_all | Cmd: ALL | Roles: service_role
DO $$ BEGIN
  DROP POLICY IF EXISTS "webhook_log_service_role_all" ON public.whatsapp_webhook_log;
  CREATE POLICY "webhook_log_service_role_all" ON public.whatsapp_webhook_log FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

