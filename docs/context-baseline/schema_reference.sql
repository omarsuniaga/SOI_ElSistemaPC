-- =====================================================================
-- SOI (Sistema Operativo Institucional) - schema_reference.sql
-- Generated FROM LIVE DB STATE (not migration history)  [BD-live]
-- Source: Supabase project ref zmhmdvmyeyswunurcyow (SOI_DDBB_EL_SISTEMAPC), Postgres 17.6
-- Snapshot date: 2026-09-10  |  Reconstruction date: 2026-09-10
-- SCHEMA ONLY - NO DATA, NO SECRETS, NO PII.
-- Reconstructed from docs/context-baseline/_raw/*.json.
-- Programmable-object bodies (views/functions/triggers/policies) are NOT inlined;
--   they are listed by name at the foot of this file. Detail: 02_DATABASE_INVENTORY.md, RLS: 05.
-- Order: enums -> sequences -> tables (FK-dependency order) -> indexes -> (commented) objects.
-- Totals: 216 base tables, 35 enums, 4 sequences, 43 views, 0 matviews, ~263 functions, 95 triggers, ~591 policies.
-- =====================================================================

-- EXTENSIONS (installed; not managed here): pg_cron 1.6.4, pg_net 0.20.0, pg_stat_statements 1.11,
--   pg_trgm 1.6, pgcrypto 1.3, plpgsql 1.0, supabase_vault 0.3.1, unaccent 1.1, uuid-ossp 1.1
--   [advisor WARN] pg_trgm and pg_net live in schema public.

-- =====================================================================
-- ENUM TYPES (35)
-- =====================================================================
CREATE TYPE asignacion_estado AS ENUM ('pendiente', 'aprobado', 'rechazado', 'cobrado');
CREATE TYPE attempt_result AS ENUM ('in_process', 'approved', 'failed');
CREATE TYPE cierre_caja_estado AS ENUM ('borrador', 'cerrado', 'auditado');
CREATE TYPE cuota_estado AS ENUM ('pendiente', 'pagada', 'vencida', 'en_mora', 'exonerada', 'becada', 'pre_pagada');
CREATE TYPE event_categoria AS ENUM ('concierto', 'ensayo', 'reunion', 'patrocinio', 'pago', 'corte', 'inscripcion', 'auditoria', 'otro', 'aniversario', 'audicion_trimestral', 'ensayo_intensivo');
CREATE TYPE exoneracion_tipo AS ENUM ('total', 'parcial');
CREATE TYPE mensaje_tipo AS ENUM ('general', 'urgente', 'consulta', 'aprobacion_requerida');
CREATE TYPE metodo_pago AS ENUM ('efectivo', 'transferencia', 'pago_movil', 'tarjeta', 'mixto', 'tercero', 'link_externo');
CREATE TYPE minuta_visibilidad AS ENUM ('cajero', 'admin', 'todos');
CREATE TYPE nivel_estudiante AS ENUM ('Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4', 'Nivel 5');
CREATE TYPE notif_canal AS ENUM ('whatsapp', 'portal', 'ambos');
CREATE TYPE notif_estado_portal AS ENUM ('no_leida', 'leida', 'archivada');
CREATE TYPE notif_estado_wa AS ENUM ('pendiente', 'enviada', 'leida', 'respondida', 'fallida', 'no_aplica');
CREATE TYPE notif_prioridad AS ENUM ('baja', 'media', 'alta', 'critica');
CREATE TYPE notif_tipo AS ENUM ('mora_recordatorio', 'mora_compromiso', 'mora_escalada', 'accesorio_asignado', 'accesorio_aprobacion', 'stock_bajo', 'comodato_riesgo', 'campana_pago', 'mensaje_interno', 'tarea_asignada', 'minuta_nueva');
CREATE TYPE patrocinante_tipo AS ENUM ('persona', 'empresa');
CREATE TYPE patrocinio_cubre AS ENUM ('cuotas', 'wallet', 'accesorios', 'todo');
CREATE TYPE progress_status AS ENUM ('pending', 'in_process', 'approved', 'failed');
CREATE TYPE resultado_audicion AS ENUM ('PROMOVIDO', 'PERMANECE', 'NO_PROMOVIDO');
CREATE TYPE route_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE sim_actor_tipo AS ENUM ('postulante', 'alumno', 'maestro', 'representante');
CREATE TYPE sim_canal AS ENUM ('whatsapp', 'email');
CREATE TYPE sim_estado_pago AS ENUM ('solvente', 'moroso', 'no_aplica');
CREATE TYPE sim_outbox_estado AS ENUM ('pendiente', 'enviado', 'fallido');
CREATE TYPE sim_run_estado AS ENUM ('creado', 'corriendo', 'pausado', 'finalizado', 'error');
CREATE TYPE soi_departamento AS ENUM ('DIR', 'ACM', 'ADM', 'FIN', 'LOG', 'COM', 'TECNICO', 'LUT');
CREATE TYPE tarea_estado AS ENUM ('pendiente', 'en_progreso', 'completada', 'cancelada', 'vencida');
CREATE TYPE tarea_institucional_estado AS ENUM ('pendiente', 'en_progreso', 'completada', 'bloqueada', 'cancelada', 'observada', 'bloqueada_por_dependencia');
CREATE TYPE tarea_institucional_prioridad AS ENUM ('baja', 'media', 'alta', 'critica');
CREATE TYPE tarea_prioridad AS ENUM ('baja', 'media', 'alta', 'critica');
CREATE TYPE tarea_tipo AS ENUM ('seguimiento_pago', 'revision_instrumento', 'reposicion_stock', 'recordatorio_compromiso', 'otro');
CREATE TYPE wallet_modo AS ENUM ('solo_accesorios', 'solo_cuotas', 'mixto');
CREATE TYPE wallet_origen AS ENUM ('pago', 'patrocinio', 'beca', 'accesorio', 'ajuste');
CREATE TYPE wallet_status AS ENUM ('operativa', 'congelada', 'devuelta');
CREATE TYPE wallet_tipo AS ENUM ('credito', 'debito');

-- =====================================================================
-- SEQUENCES (4 standalone; most PKs use gen_random_uuid())
-- =====================================================================
CREATE SEQUENCE applicant_events_id_seq;
CREATE SEQUENCE hermes_inbox_id_seq;
CREATE SEQUENCE salon_code_seq;
CREATE SEQUENCE salones_codigo_seq;

-- =====================================================================
-- TABLES
-- =====================================================================

CREATE TABLE familias (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    nombre_familia text NOT NULL,
    fecha_ingreso date NOT NULL DEFAULT CURRENT_DATE,
    activa boolean NOT NULL DEFAULT true,
    datos_extra jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT familias_pkey PRIMARY KEY (id)
);

CREATE TABLE profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    nombre_completo text,
    rol text NOT NULL DEFAULT 'user'::text,
    avatar_url text,
    activo boolean DEFAULT true,
    estado text NOT NULL DEFAULT 'pendiente'::text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    solicitud_instrumento text,
    solicitud_resena text,
    CONSTRAINT profiles_pkey PRIMARY KEY (id),
    CONSTRAINT profiles_email_check CHECK ((email ~* '^[^@]+@[^@]+\.[^@]+$'::text)),
    CONSTRAINT profiles_estado_check CHECK ((estado = ANY (ARRAY['pendiente'::text, 'activo'::text, 'rechazado'::text]))),
    CONSTRAINT profiles_rol_check CHECK ((rol = ANY (ARRAY['superadmin'::text, 'admin'::text, 'direccion'::text, 'coordinacion_academica'::text, 'maestro'::text, 'monitor'::text, 'finanzas'::text, 'operaciones'::text, 'representante'::text, 'alumno'::text, 'jurado'::text, 'user'::text]))),
    CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE alumnos (
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
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
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
    fecha_aceptacion_beca timestamptz,
    acepta_pago_600 boolean,
    fecha_aceptacion_pago timestamptz,
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
    deuda_pendiente_baja_centavos bigint NOT NULL DEFAULT 0,
    CONSTRAINT alumnos_pkey PRIMARY KEY (id),
    CONSTRAINT alumnos_user_id_key UNIQUE (user_id),
    CONSTRAINT chk_problemas_conducta CHECK ((problemas_conducta = ANY (ARRAY['no'::text, 'pocas_veces'::text, 'si'::text, 'violento'::text]))),
    CONSTRAINT chk_padres_en_vida CHECK ((padres_en_vida = ANY (ARRAY['ambos'::text, 'solo_madre'::text, 'solo_padre'::text, 'ninguno'::text]))),
    CONSTRAINT alumnos_nivel_actual_check CHECK (((nivel_actual >= 1) AND (nivel_actual <= 10))),
    CONSTRAINT alumnos_estado_academico_chk CHECK ((estado_academico = ANY (ARRAY['activo'::text, 'retirado'::text, 'retirado_con_deuda'::text]))),
    CONSTRAINT chk_nivel_lectura_musical CHECK ((nivel_lectura_musical = ANY (ARRAY['basico'::text, 'intermedio'::text, 'avanzado'::text]))),
    CONSTRAINT chk_interes_musical CHECK ((interes_musical = ANY (ARRAY['cantar'::text, 'instrumento'::text, 'ambas'::text]))),
    CONSTRAINT alumnos_familia_id_fkey FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT,
    CONSTRAINT alumnos_baja_procesada_por_fkey FOREIGN KEY (baja_procesada_por) REFERENCES auth.users(id),
    CONSTRAINT fk_alumnos_profile FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE TABLE programas (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    descripcion text,
    activo boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    nivel text,
    codigo text,
    duracion_anios numeric,
    CONSTRAINT programas_pkey PRIMARY KEY (id),
    CONSTRAINT programas_codigo_key UNIQUE (codigo),
    CONSTRAINT programas_nombre_key UNIQUE (nombre)
);

CREATE TABLE academic_plans (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    student_id uuid,
    programa_id uuid,
    status text DEFAULT 'in_process'::text,
    started_at timestamptz DEFAULT now(),
    completed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT academic_plans_pkey PRIMARY KEY (id),
    CONSTRAINT academic_plans_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'in_process'::text, 'completed'::text, 'cancelled'::text]))),
    CONSTRAINT academic_plans_programa_id_fkey FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE SET NULL,
    CONSTRAINT academic_plans_student_id_fkey FOREIGN KEY (student_id) REFERENCES alumnos(id) ON DELETE CASCADE
);

-- -- DEPRECATED: conservada para rediseño de inventario lutería 2026-09 (Owner: LUT)
CREATE TABLE accesorios (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    categoria text NOT NULL,
    descripcion text,
    stock_actual integer NOT NULL DEFAULT 0,
    stock_minimo integer NOT NULL DEFAULT 0,
    precio_unitario numeric NOT NULL,
    activo boolean DEFAULT true,
    links_externos jsonb DEFAULT '[]'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT accesorios_pkey PRIMARY KEY (id),
    CONSTRAINT accesorios_stock_actual_check CHECK ((stock_actual >= 0))
);

CREATE TABLE acm_curriculum_sources (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    file_name text NOT NULL,
    file_path text,
    source_type text NOT NULL,
    author text,
    version_label text,
    uploaded_by uuid,
    uploaded_at timestamptz NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'draft'::text,
    raw_text text,
    notes text,
    related_version_id uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT acm_curriculum_sources_pkey PRIMARY KEY (id),
    CONSTRAINT acm_curriculum_sources_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'in_review'::text, 'approved'::text, 'active'::text, 'archived'::text, 'replaced'::text]))),
    CONSTRAINT acm_curriculum_sources_source_type_check CHECK ((source_type = ANY (ARRAY['documento_rector'::text, 'documento_complementario'::text, 'referencia_externa'::text, 'ajuste_acm'::text]))),
    CONSTRAINT acm_curriculum_sources_related_version_fkey FOREIGN KEY (related_version_id) REFERENCES acm_curriculum_versions(id) ON DELETE SET NULL,
    CONSTRAINT acm_curriculum_sources_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE TABLE acm_curriculum_versions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    source_id uuid,
    program_id uuid,
    status text NOT NULL DEFAULT 'draft'::text,
    is_active boolean NOT NULL DEFAULT false,
    approved_by uuid,
    approved_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT acm_curriculum_versions_pkey PRIMARY KEY (id),
    CONSTRAINT acm_curriculum_versions_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'in_review'::text, 'approved'::text, 'active'::text, 'archived'::text, 'replaced'::text]))),
    CONSTRAINT acm_curriculum_versions_source_id_fkey FOREIGN KEY (source_id) REFERENCES acm_curriculum_sources(id) ON DELETE SET NULL,
    CONSTRAINT acm_curriculum_versions_program_id_fkey FOREIGN KEY (program_id) REFERENCES programas(id) ON DELETE SET NULL,
    CONSTRAINT acm_curriculum_versions_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE TABLE acm_weekly_plans (
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
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT acm_weekly_plans_pkey PRIMARY KEY (id),
    CONSTRAINT acm_weekly_plans_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'approved'::text, 'active'::text, 'archived'::text]))),
    CONSTRAINT acm_weekly_plans_curriculum_version_id_fkey FOREIGN KEY (curriculum_version_id) REFERENCES acm_curriculum_versions(id) ON DELETE CASCADE,
    CONSTRAINT acm_weekly_plans_program_id_fkey FOREIGN KEY (program_id) REFERENCES programas(id) ON DELETE SET NULL
);

CREATE TABLE maestros (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid,
    nombre_completo text NOT NULL,
    especialidad text NOT NULL,
    tipo_maestro text DEFAULT 'catedra'::text,
    habilidades text[] DEFAULT ARRAY[]::text[],
    disponibilidad jsonb NOT NULL DEFAULT '{}'::jsonb,
    tlf text,
    correo text NOT NULL,
    resena text,
    puede_ser_suplente boolean DEFAULT true,
    activo boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    especialidades text[],
    es_admin boolean DEFAULT false,
    retirado_en timestamptz,
    retirado_por uuid,
    motivo_retiro text,
    CONSTRAINT maestros_pkey PRIMARY KEY (id),
    CONSTRAINT maestros_correo_key UNIQUE (correo),
    CONSTRAINT maestros_user_id_key UNIQUE (user_id),
    CONSTRAINT maestros_tipo_maestro_check CHECK ((tipo_maestro = ANY (ARRAY['catedra'::text, 'orquesta'::text, 'coro'::text, 'preparatoria'::text, 'monitor'::text, 'suplente'::text, 'direccion'::text, 'otro'::text]))),
    CONSTRAINT fk_maestros_profile FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL,
    CONSTRAINT maestros_retirado_por_fkey FOREIGN KEY (retirado_por) REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE TABLE niveles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    programa_id uuid NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    orden integer NOT NULL,
    duracion_estimada_meses integer,
    criterios_promocion jsonb DEFAULT '{}'::jsonb,
    activo boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT niveles_pkey PRIMARY KEY (id),
    CONSTRAINT niveles_programa_nombre_unique UNIQUE (programa_id, nombre),
    CONSTRAINT niveles_programa_orden_unique UNIQUE (programa_id, orden),
    CONSTRAINT niveles_duracion_estimada_meses_check CHECK (((duracion_estimada_meses IS NULL) OR (duracion_estimada_meses > 0))),
    CONSTRAINT niveles_orden_check CHECK ((orden > 0)),
    CONSTRAINT fk_niveles_programa FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE CASCADE
);

CREATE TABLE routes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    instrument text NOT NULL,
    description text,
    status route_status NOT NULL DEFAULT 'draft'::route_status,
    created_by uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT routes_pkey PRIMARY KEY (id),
    CONSTRAINT routes_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

CREATE TABLE route_versions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    route_id uuid NOT NULL,
    version text NOT NULL,
    status route_status NOT NULL DEFAULT 'draft'::route_status,
    notes text,
    created_by uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    published_at timestamptz,
    CONSTRAINT route_versions_pkey PRIMARY KEY (id),
    CONSTRAINT route_versions_route_id_version_key UNIQUE (route_id, version),
    CONSTRAINT route_versions_route_id_fkey FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    CONSTRAINT route_versions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

CREATE TABLE rutas_contenido (
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
    fecha_aprobacion timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT rutas_contenido_pkey PRIMARY KEY (id),
    CONSTRAINT rutas_contenido_instrumento_nivel_nombre_key UNIQUE (instrumento, nivel, nombre),
    CONSTRAINT rutas_contenido_tipo_check CHECK ((tipo = ANY (ARRAY['soi-estandar'::text, 'maestro-variante'::text]))),
    CONSTRAINT rutas_contenido_estado_check CHECK ((estado = ANY (ARRAY['activa'::text, 'pendiente'::text, 'aprobada'::text, 'rechazada'::text]))),
    CONSTRAINT rutas_contenido_check CHECK (((tipo = 'soi-estandar'::text) OR (ruta_base_id IS NOT NULL))),
    CONSTRAINT rutas_contenido_ruta_base_id_fkey FOREIGN KEY (ruta_base_id) REFERENCES rutas_contenido(id) ON DELETE SET NULL,
    CONSTRAINT rutas_contenido_creada_por_fkey FOREIGN KEY (creada_por) REFERENCES maestros(id) ON DELETE SET NULL,
    CONSTRAINT rutas_contenido_aprobada_por_fkey FOREIGN KEY (aprobada_por) REFERENCES maestros(id) ON DELETE SET NULL
);

CREATE TABLE clases (
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
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    estado varchar DEFAULT 'activa'::character varying,
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
    revision_motivo text,
    CONSTRAINT clases_pkey PRIMARY KEY (id),
    CONSTRAINT clases_modalidad_check CHECK ((modalidad = ANY (ARRAY['presencial'::text, 'virtual'::text, 'hibrida'::text]))),
    CONSTRAINT clases_tipo_clase_check CHECK ((tipo_clase = ANY (ARRAY['individual'::text, 'grupal'::text, 'rotativa'::text, 'seccional'::text, 'orquesta'::text, 'coro'::text, 'teoria'::text, 'preparatoria'::text, 'otro'::text]))),
    CONSTRAINT clases_capacidad_maxima_check CHECK (((capacidad_maxima IS NULL) OR (capacidad_maxima > 0))),
    CONSTRAINT clases_maestros_diferentes_check CHECK (((maestro_suplente_id IS NULL) OR (maestro_suplente_id <> maestro_principal_id))),
    CONSTRAINT clases_ruta_id_fkey FOREIGN KEY (ruta_id) REFERENCES rutas_contenido(id) ON DELETE SET NULL,
    CONSTRAINT clases_maestro_auxiliar_id_fkey FOREIGN KEY (maestro_auxiliar_id) REFERENCES maestros(id) ON DELETE SET NULL,
    CONSTRAINT fk_clases_programa FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE RESTRICT,
    CONSTRAINT fk_clases_nivel FOREIGN KEY (nivel_id) REFERENCES niveles(id) ON DELETE SET NULL,
    CONSTRAINT fk_clases_maestro_principal FOREIGN KEY (maestro_principal_id) REFERENCES maestros(id) ON DELETE RESTRICT,
    CONSTRAINT fk_clases_maestro_suplente FOREIGN KEY (maestro_suplente_id) REFERENCES maestros(id) ON DELETE SET NULL,
    CONSTRAINT clases_route_version_id_fkey FOREIGN KEY (route_version_id) REFERENCES route_versions(id)
);

CREATE TABLE acm_active_routes (
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
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT acm_active_routes_pkey PRIMARY KEY (id),
    CONSTRAINT acm_active_routes_status_check CHECK ((status = ANY (ARRAY['active'::text, 'paused'::text, 'completed'::text, 'archived'::text]))),
    CONSTRAINT acm_active_routes_weekly_plan_id_fkey FOREIGN KEY (weekly_plan_id) REFERENCES acm_weekly_plans(id) ON DELETE CASCADE,
    CONSTRAINT acm_active_routes_program_id_fkey FOREIGN KEY (program_id) REFERENCES programas(id) ON DELETE SET NULL,
    CONSTRAINT acm_active_routes_group_id_fkey FOREIGN KEY (group_id) REFERENCES clases(id) ON DELETE SET NULL,
    CONSTRAINT acm_active_routes_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES maestros(id) ON DELETE SET NULL
);

CREATE TABLE blocks (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    route_version_id uuid NOT NULL,
    name text NOT NULL,
    level_from integer NOT NULL,
    level_to integer NOT NULL,
    objective text,
    description text,
    order_index integer NOT NULL DEFAULT 0,
    CONSTRAINT blocks_pkey PRIMARY KEY (id),
    CONSTRAINT blocks_route_version_id_fkey FOREIGN KEY (route_version_id) REFERENCES route_versions(id) ON DELETE CASCADE
);

CREATE TABLE levels (
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
    order_index integer NOT NULL DEFAULT 0,
    CONSTRAINT levels_pkey PRIMARY KEY (id),
    CONSTRAINT levels_route_version_id_level_number_key UNIQUE (route_version_id, level_number),
    CONSTRAINT levels_block_id_fkey FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE CASCADE,
    CONSTRAINT levels_route_version_id_fkey FOREIGN KEY (route_version_id) REFERENCES route_versions(id) ON DELETE CASCADE
);

CREATE TABLE nodes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    level_id uuid NOT NULL,
    route_version_id uuid NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    is_critical boolean NOT NULL DEFAULT false,
    is_required boolean NOT NULL DEFAULT true,
    objective text,
    order_index integer NOT NULL DEFAULT 0,
    codigo text,
    CONSTRAINT nodes_pkey PRIMARY KEY (id),
    CONSTRAINT nodes_level_id_fkey FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE,
    CONSTRAINT nodes_route_version_id_fkey FOREIGN KEY (route_version_id) REFERENCES route_versions(id) ON DELETE CASCADE
);

-- Objetivos explícitos entre temas (nodes) e indicadores.
CREATE TABLE objetivos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    node_id uuid NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    order_index integer NOT NULL DEFAULT 0,
    activo boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT objetivos_pkey PRIMARY KEY (id),
    CONSTRAINT objetivos_node_order_unique UNIQUE (node_id, order_index),
    CONSTRAINT objetivos_node_id_fkey FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

CREATE TABLE indicators (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    node_id uuid,
    description text NOT NULL,
    minimum_criteria jsonb DEFAULT '{}'::jsonb,
    is_required boolean NOT NULL DEFAULT true,
    order_index integer NOT NULL DEFAULT 0,
    nombre text,
    activo boolean NOT NULL DEFAULT true,
    objetivo_id uuid,
    CONSTRAINT indicators_pkey PRIMARY KEY (id),
    CONSTRAINT indicators_node_id_fkey FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE,
    CONSTRAINT indicators_objetivo_id_fkey FOREIGN KEY (objetivo_id) REFERENCES objetivos(id) ON DELETE SET NULL
);

CREATE TABLE teacher_class_sessions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    active_route_id uuid,
    teacher_id uuid,
    group_id uuid,
    class_date date NOT NULL DEFAULT CURRENT_DATE,
    week_number integer,
    planned_week_id uuid,
    status text NOT NULL DEFAULT 'draft'::text,
    general_observation text,
    created_at timestamptz NOT NULL DEFAULT now(),
    closed_at timestamptz,
    CONSTRAINT teacher_class_sessions_pkey PRIMARY KEY (id),
    CONSTRAINT teacher_class_sessions_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'started'::text, 'completed'::text, 'cancelled'::text]))),
    CONSTRAINT teacher_class_sessions_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES maestros(id) ON DELETE SET NULL,
    CONSTRAINT teacher_class_sessions_group_id_fkey FOREIGN KEY (group_id) REFERENCES clases(id) ON DELETE SET NULL,
    CONSTRAINT teacher_class_sessions_planned_week_id_fkey FOREIGN KEY (planned_week_id) REFERENCES acm_weekly_plans(id) ON DELETE SET NULL,
    CONSTRAINT teacher_class_sessions_active_route_id_fkey FOREIGN KEY (active_route_id) REFERENCES acm_active_routes(id) ON DELETE SET NULL
);

CREATE TABLE acm_evidence_files (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    student_id uuid,
    group_id uuid,
    session_id uuid,
    indicator_id uuid,
    file_url text NOT NULL,
    file_type text,
    description text,
    uploaded_by uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT acm_evidence_files_pkey PRIMARY KEY (id),
    CONSTRAINT acm_evidence_files_group_id_fkey FOREIGN KEY (group_id) REFERENCES clases(id) ON DELETE SET NULL,
    CONSTRAINT acm_evidence_files_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES profiles(id) ON DELETE SET NULL,
    CONSTRAINT acm_evidence_files_indicator_id_fkey FOREIGN KEY (indicator_id) REFERENCES indicators(id) ON DELETE SET NULL,
    CONSTRAINT acm_evidence_files_student_id_fkey FOREIGN KEY (student_id) REFERENCES alumnos(id) ON DELETE CASCADE,
    CONSTRAINT acm_evidence_files_session_id_fkey FOREIGN KEY (session_id) REFERENCES teacher_class_sessions(id) ON DELETE SET NULL
);

CREATE TABLE acm_teacher_week_adjustments (
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
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT acm_teacher_week_adjustments_pkey PRIMARY KEY (id),
    CONSTRAINT acm_teacher_week_adjustments_unique UNIQUE (group_id, teacher_id, weekly_plan_id, week_number),
    CONSTRAINT acm_teacher_week_adjustments_weekly_plan_id_fkey FOREIGN KEY (weekly_plan_id) REFERENCES acm_weekly_plans(id) ON DELETE CASCADE,
    CONSTRAINT acm_teacher_week_adjustments_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES maestros(id) ON DELETE CASCADE,
    CONSTRAINT acm_teacher_week_adjustments_group_id_fkey FOREIGN KEY (group_id) REFERENCES clases(id) ON DELETE CASCADE
);

CREATE TABLE acm_weekly_plan_items (
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
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT acm_weekly_plan_items_pkey PRIMARY KEY (id),
    CONSTRAINT acm_weekly_plan_items_weekly_plan_id_fkey FOREIGN KEY (weekly_plan_id) REFERENCES acm_weekly_plans(id) ON DELETE CASCADE,
    CONSTRAINT acm_weekly_plan_items_indicator_id_fkey FOREIGN KEY (indicator_id) REFERENCES indicators(id) ON DELETE SET NULL
);

CREATE TABLE alertas_log (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    tipo text NOT NULL,
    canal text NOT NULL,
    destinatario text NOT NULL,
    contenido text,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT alertas_log_pkey PRIMARY KEY (id)
);

-- -- DEPRECATED: datos escolares secundarios diferidos 2026-09 (Owner: DIR/ADM)
CREATE TABLE alumno_escolaridad (
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
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT alumno_escolaridad_pkey PRIMARY KEY (id),
    CONSTRAINT alumno_escolaridad_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE
);

CREATE TABLE curriculos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    instrumento text NOT NULL,
    nivel text NOT NULL,
    descripcion text,
    activo boolean DEFAULT true,
    created_by uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT curriculos_pkey PRIMARY KEY (id),
    CONSTRAINT curriculos_instrumento_nivel_key UNIQUE (instrumento, nivel),
    CONSTRAINT curriculos_created_by_fkey FOREIGN KEY (created_by) REFERENCES maestros(id)
);

CREATE TABLE curriculo_pilares (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    curriculo_id uuid,
    nombre text NOT NULL,
    orden integer NOT NULL DEFAULT 0,
    CONSTRAINT curriculo_pilares_pkey PRIMARY KEY (id),
    CONSTRAINT curriculo_pilares_curriculo_id_fkey FOREIGN KEY (curriculo_id) REFERENCES curriculos(id) ON DELETE CASCADE
);

CREATE TABLE curriculo_objetivos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    pilar_id uuid,
    descripcion text NOT NULL,
    orden integer NOT NULL DEFAULT 0,
    CONSTRAINT curriculo_objetivos_pkey PRIMARY KEY (id),
    CONSTRAINT curriculo_objetivos_pilar_id_fkey FOREIGN KEY (pilar_id) REFERENCES curriculo_pilares(id) ON DELETE CASCADE
);

CREATE TABLE salones (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    ubicacion text,
    descripcion text,
    activo boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    capacidad integer DEFAULT 20,
    codigo_salon text,
    piso integer,
    condicion_fisica text DEFAULT 'buena'::text,
    equipamiento jsonb DEFAULT '[]'::jsonb,
    responsable_id uuid,
    is_active boolean,
    CONSTRAINT salones_pkey PRIMARY KEY (id),
    CONSTRAINT salones_nombre_key UNIQUE (nombre),
    CONSTRAINT unique_codigo_salon UNIQUE (codigo_salon),
    CONSTRAINT salones_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES maestros(id)
);

CREATE TABLE horarios (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    clase_id uuid NOT NULL,
    maestro_id uuid NOT NULL,
    salon_id uuid NOT NULL,
    dia_semana integer NOT NULL,
    hora_inicio time NOT NULL,
    hora_fin time NOT NULL,
    activo boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT horarios_pkey PRIMARY KEY (id),
    CONSTRAINT horarios_clase_unico UNIQUE (clase_id, dia_semana, hora_inicio, hora_fin),
    CONSTRAINT horarios_salon_unico UNIQUE (salon_id, dia_semana, hora_inicio, hora_fin),
    CONSTRAINT horarios_maestro_unico UNIQUE (maestro_id, dia_semana, hora_inicio, hora_fin),
    CONSTRAINT horarios_hora_check CHECK ((hora_fin > hora_inicio)),
    CONSTRAINT horarios_dia_semana_check CHECK (((dia_semana >= 1) AND (dia_semana <= 7))),
    CONSTRAINT fk_horarios_clase FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE,
    CONSTRAINT fk_horarios_salon FOREIGN KEY (salon_id) REFERENCES salones(id) ON DELETE RESTRICT,
    CONSTRAINT fk_horarios_maestro FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE RESTRICT
);

CREATE TABLE sesiones_clase (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    clase_id uuid,
    horario_id uuid,
    maestro_id uuid NOT NULL,
    salon_id uuid,
    fecha date NOT NULL,
    hora_inicio time,
    hora_fin time,
    tema_principal text,
    contenidos_trabajados jsonb DEFAULT '[]'::jsonb,
    observaciones_generales text,
    estado text NOT NULL DEFAULT 'programada'::text,
    cerrada_en timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
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
    node_codigo text,
    CONSTRAINT sesiones_clase_pkey PRIMARY KEY (id),
    CONSTRAINT sesiones_clase_unica UNIQUE (clase_id, fecha, hora_inicio),
    CONSTRAINT sesiones_clase_clase_fecha_maestro_unique UNIQUE (clase_id, fecha, maestro_id),
    CONSTRAINT sesiones_clase_hora_check CHECK (((hora_inicio IS NULL) OR (hora_fin IS NULL) OR (hora_fin > hora_inicio))),
    CONSTRAINT sesiones_clase_node_origen_check CHECK (((node_origen IS NULL) OR (node_origen = ANY (ARRAY['explicito'::text, 'derivado'::text, 'manual'::text])))),
    CONSTRAINT sesiones_clase_estado_check CHECK ((estado = ANY (ARRAY['programada'::text, 'abierta'::text, 'asistencia_registrada'::text, 'progreso_registrado'::text, 'cerrada'::text, 'pendiente'::text, 'atrasada'::text, 'cancelada'::text, 'registrada'::text]))),
    CONSTRAINT sesiones_clase_node_codigo_chk CHECK (((node_codigo IS NULL) OR (node_codigo = ANY (ARRAY['ESC'::text, 'ARP'::text, 'MI'::text, 'ARC'::text, 'SON'::text, 'AFI'::text, 'EST'::text, 'REP'::text])))),
    CONSTRAINT fk_sesiones_clase_salon FOREIGN KEY (salon_id) REFERENCES salones(id) ON DELETE SET NULL,
    CONSTRAINT fk_sesiones_clase_maestro FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE RESTRICT,
    CONSTRAINT fk_sesiones_clase_horario FOREIGN KEY (horario_id) REFERENCES horarios(id) ON DELETE SET NULL,
    CONSTRAINT fk_sesiones_clase_clase FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE,
    CONSTRAINT sesiones_clase_maestro_auxiliar_id_fkey FOREIGN KEY (maestro_auxiliar_id) REFERENCES maestros(id),
    CONSTRAINT sesiones_clase_node_id_fkey FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE SET NULL,
    CONSTRAINT sesiones_clase_emergente_id_fkey FOREIGN KEY (emergente_id) REFERENCES sesiones_clase(id) ON DELETE SET NULL
);

CREATE TABLE alumno_plan_entradas (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    alumno_id uuid NOT NULL,
    maestro_id uuid NOT NULL,
    tipo text NOT NULL,
    titulo text NOT NULL,
    descripcion text,
    objetivo_id uuid,
    nivel_referencia text,
    sesion_id uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT alumno_plan_entradas_pkey PRIMARY KEY (id),
    CONSTRAINT alumno_plan_entradas_descripcion_check CHECK ((char_length(descripcion) <= 2000)),
    CONSTRAINT alumno_plan_entradas_nivel_referencia_check CHECK ((nivel_referencia = ANY (ARRAY['inicial'::text, 'basico'::text, 'intermedio'::text, 'avanzado'::text]))),
    CONSTRAINT alumno_plan_entradas_tipo_check CHECK ((tipo = ANY (ARRAY['diagnostico'::text, 'logro'::text, 'en_progreso'::text, 'dificultad'::text, 'objetivo'::text]))),
    CONSTRAINT alumno_plan_entradas_titulo_check CHECK (((char_length(titulo) >= 2) AND (char_length(titulo) <= 200))),
    CONSTRAINT alumno_plan_entradas_objetivo_id_fkey FOREIGN KEY (objetivo_id) REFERENCES curriculo_objetivos(id) ON DELETE SET NULL,
    CONSTRAINT alumno_plan_entradas_sesion_id_fkey FOREIGN KEY (sesion_id) REFERENCES sesiones_clase(id) ON DELETE SET NULL,
    CONSTRAINT alumno_plan_entradas_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
    CONSTRAINT alumno_plan_entradas_maestro_id_fkey FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE
);

CREATE TABLE alumno_suspensiones (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    alumno_id uuid NOT NULL,
    desde date NOT NULL DEFAULT CURRENT_DATE,
    hasta date,
    motivo text,
    estado text NOT NULL DEFAULT 'activa'::text,
    creado_por uuid DEFAULT auth.uid(),
    levantada_por uuid,
    levantada_en timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT alumno_suspensiones_pkey PRIMARY KEY (id),
    CONSTRAINT alumno_suspensiones_estado_check CHECK ((estado = ANY (ARRAY['activa'::text, 'levantada'::text]))),
    CONSTRAINT alumno_suspensiones_levantada_por_fkey FOREIGN KEY (levantada_por) REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT alumno_suspensiones_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
    CONSTRAINT alumno_suspensiones_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE alumnos_clases (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    alumno_id uuid NOT NULL,
    clase_id uuid NOT NULL,
    fecha_inscripcion date DEFAULT CURRENT_DATE,
    activo boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    hora_inicio time,
    hora_fin time,
    dia text,
    CONSTRAINT alumnos_clases_pkey PRIMARY KEY (id),
    CONSTRAINT alumnos_clases_unico UNIQUE (alumno_id, clase_id),
    CONSTRAINT alumnos_clases_dia_check CHECK (((dia IS NULL) OR (dia = ANY (ARRAY['lunes'::text, 'martes'::text, 'miércoles'::text, 'jueves'::text, 'viernes'::text, 'sábado'::text, 'domingo'::text])))),
    CONSTRAINT fk_alumnos_clases_alumno FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
    CONSTRAINT fk_alumnos_clases_clase FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE
);

CREATE TABLE logros (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    descripcion text,
    criterio jsonb DEFAULT '{}'::jsonb,
    icono text,
    activo boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT logros_pkey PRIMARY KEY (id),
    CONSTRAINT logros_nombre_key UNIQUE (nombre)
);

CREATE TABLE alumnos_logros (
    alumno_id uuid NOT NULL,
    logro_id uuid NOT NULL,
    obtenido_en timestamptz DEFAULT now(),
    CONSTRAINT alumnos_logros_pkey PRIMARY KEY (alumno_id, logro_id),
    CONSTRAINT fk_alumnos_logros_logro FOREIGN KEY (logro_id) REFERENCES logros(id) ON DELETE CASCADE,
    CONSTRAINT fk_alumnos_logros_alumno FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE
);

-- Períodos académicos del año (ej: Trimestre I 2025)
CREATE TABLE periodos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    activo boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    cerrado boolean NOT NULL DEFAULT false,
    cerrado_at timestamptz,
    cerrado_por uuid,
    observaciones_cierre text,
    CONSTRAINT periodos_pkey PRIMARY KEY (id),
    CONSTRAINT periodos_fechas_check CHECK ((fecha_fin > fecha_inicio))
);

CREATE TABLE alumnos_programas (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    alumno_id uuid NOT NULL,
    programa_id uuid NOT NULL,
    fecha_inscripcion date DEFAULT CURRENT_DATE,
    activo boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    periodo_id uuid,
    calificacion numeric,
    estado text NOT NULL DEFAULT 'cursando'::text,
    fuente text,
    requiere_verificacion boolean NOT NULL DEFAULT false,
    CONSTRAINT alumnos_programas_pkey PRIMARY KEY (id),
    CONSTRAINT alumnos_programas_estado_check CHECK ((estado = ANY (ARRAY['cursando'::text, 'aprobado'::text, 'repite'::text, 'proyectado'::text, 'retirado'::text]))),
    CONSTRAINT alumnos_programas_calificacion_check CHECK (((calificacion >= (0)::numeric) AND (calificacion <= (100)::numeric))),
    CONSTRAINT alumnos_programas_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES periodos(id),
    CONSTRAINT fk_alumnos_programas_programa FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE CASCADE,
    CONSTRAINT fk_alumnos_programas_alumno FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE
);

CREATE TABLE alumnos_reinscripciones (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    alumno_id uuid NOT NULL,
    fecha date NOT NULL DEFAULT CURRENT_DATE,
    procesada_por uuid,
    deuda_verificada_centavos bigint NOT NULL DEFAULT 0,
    familia_anterior uuid,
    familia_nueva uuid,
    notas text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT alumnos_reinscripciones_pkey PRIMARY KEY (id),
    CONSTRAINT alumnos_reinscripciones_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id),
    CONSTRAINT alumnos_reinscripciones_procesada_por_fkey FOREIGN KEY (procesada_por) REFERENCES auth.users(id)
);

CREATE TABLE cuotas (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    familia_id uuid NOT NULL,
    alumno_id uuid,
    concepto text NOT NULL,
    monto_base_centavos bigint NOT NULL,
    monto_final_centavos bigint NOT NULL,
    descuento_centavos bigint DEFAULT 0,
    fecha_generacion date NOT NULL,
    fecha_vencimiento date NOT NULL,
    estado cuota_estado NOT NULL DEFAULT 'pendiente'::cuota_estado,
    ciclo_mes integer NOT NULL,
    ciclo_anio integer NOT NULL,
    metadatos jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    monto_pagado_centavos bigint NOT NULL DEFAULT 0,
    CONSTRAINT cuotas_pkey PRIMARY KEY (id),
    CONSTRAINT cuotas_familia_id_alumno_id_ciclo_anio_ciclo_mes_concepto_key UNIQUE (familia_id, alumno_id, ciclo_anio, ciclo_mes, concepto),
    CONSTRAINT chk_cuotas_monto_pagado CHECK (((monto_pagado_centavos >= 0) AND (monto_pagado_centavos <= monto_final_centavos))),
    CONSTRAINT chk_cuotas_montos_no_negativos CHECK (((monto_base_centavos >= 0) AND (monto_final_centavos >= 0) AND (descuento_centavos >= 0))),
    CONSTRAINT cuotas_ciclo_mes_check CHECK (((ciclo_mes >= 1) AND (ciclo_mes <= 12))),
    CONSTRAINT cuotas_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE RESTRICT,
    CONSTRAINT cuotas_familia_id_fkey FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT
);

CREATE TABLE pagos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    familia_id uuid NOT NULL,
    cuota_ids uuid[] NOT NULL DEFAULT '{}'::uuid[],
    monto_centavos bigint NOT NULL,
    metodo_pago metodo_pago NOT NULL,
    referencia text,
    cajero_id uuid,
    notas text,
    recibo_url text,
    created_at timestamptz DEFAULT now(),
    fecha_pago date DEFAULT CURRENT_DATE,
    CONSTRAINT pagos_pkey PRIMARY KEY (id),
    CONSTRAINT pagos_monto_check CHECK (((monto_centavos)::numeric > (0)::numeric)),
    CONSTRAINT pagos_cajero_id_fkey FOREIGN KEY (cajero_id) REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT pagos_familia_id_fkey FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT
);

CREATE TABLE aplicaciones_pago (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    pago_id uuid NOT NULL,
    cuota_id uuid NOT NULL,
    monto_aplicado_centavos bigint NOT NULL,
    dias_atraso_al_aplicar integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT aplicaciones_pago_pkey PRIMARY KEY (id),
    CONSTRAINT uq_aplicacion UNIQUE (pago_id, cuota_id),
    CONSTRAINT aplicaciones_pago_monto_aplicado_centavos_check CHECK ((monto_aplicado_centavos > 0)),
    CONSTRAINT aplicaciones_pago_pago_id_fkey FOREIGN KEY (pago_id) REFERENCES pagos(id),
    CONSTRAINT aplicaciones_pago_cuota_id_fkey FOREIGN KEY (cuota_id) REFERENCES cuotas(id)
);

CREATE TABLE app_users (
    id uuid NOT NULL,
    role text NOT NULL,
    jurado_id text NOT NULL,
    display_name text NOT NULL,
    created_at timestamptz DEFAULT now(),
    email text,
    CONSTRAINT app_users_pkey PRIMARY KEY (id),
    CONSTRAINT app_users_jurado_id_check CHECK ((jurado_id = ANY (ARRAY['admin'::text, 'omar'::text, 'kalani'::text, 'manuel'::text, 'especialista'::text]))),
    CONSTRAINT app_users_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'jurado'::text]))),
    CONSTRAINT app_users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE applicants (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    idempotency_key text NOT NULL,
    full_name text NOT NULL,
    phone_number text NOT NULL,
    email text,
    utm_source text DEFAULT 'direct'::text,
    status text NOT NULL DEFAULT 'LEAD'::text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT applicants_pkey PRIMARY KEY (id),
    CONSTRAINT applicants_idempotency_key_key UNIQUE (idempotency_key),
    CONSTRAINT applicants_status_check CHECK ((status = ANY (ARRAY['LEAD'::text, 'FORM_COMPLETED'::text, 'SCHEDULED'::text, 'ATTENDED'::text, 'NO_SHOW'::text, 'CANCELLED'::text])))
);

CREATE TABLE applicant_events (
    id bigint NOT NULL DEFAULT nextval('applicant_events_id_seq'::regclass),
    applicant_id uuid,
    event_name text NOT NULL,
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT applicant_events_pkey PRIMARY KEY (id),
    CONSTRAINT applicant_events_applicant_id_fkey FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
);

CREATE TABLE appointments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    applicant_id uuid NOT NULL,
    scheduled_datetime timestamptz NOT NULL,
    status text NOT NULL DEFAULT 'RESERVED_PENDING'::text,
    locked_until timestamptz,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT appointments_pkey PRIMARY KEY (id),
    CONSTRAINT appointments_status_check CHECK ((status = ANY (ARRAY['RESERVED_PENDING'::text, 'CONFIRMED'::text, 'CANCELLED'::text, 'COMPLETED'::text]))),
    CONSTRAINT appointments_applicant_id_fkey FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
);

CREATE TABLE registros_pendientes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    maestro_id uuid NOT NULL,
    sesion_clase_id uuid,
    tipo text NOT NULL,
    prioridad text DEFAULT 'media'::text,
    estado text DEFAULT 'pendiente'::text,
    fecha_limite timestamptz,
    mensaje text NOT NULL,
    deep_link text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    resuelto_at timestamptz,
    last_notified_at timestamptz,
    notif_count integer DEFAULT 0,
    notification_state text DEFAULT 'VERDE'::text,
    CONSTRAINT registros_pendientes_pkey PRIMARY KEY (id),
    CONSTRAINT registros_pendientes_notification_state_check CHECK ((notification_state = ANY (ARRAY['VERDE'::text, 'AMARILLO'::text, 'NARANJA'::text, 'ROJO'::text]))),
    CONSTRAINT registros_pendientes_tipo_check CHECK ((tipo = ANY (ARRAY['asistencia_pendiente'::text, 'contenido_pendiente'::text, 'progreso_pendiente'::text, 'sesion_sin_cerrar'::text, 'justificacion_pendiente'::text, 'otro'::text]))),
    CONSTRAINT registros_pendientes_prioridad_check CHECK ((prioridad = ANY (ARRAY['baja'::text, 'media'::text, 'alta'::text, 'critica'::text]))),
    CONSTRAINT registros_pendientes_estado_check CHECK ((estado = ANY (ARRAY['pendiente'::text, 'visto'::text, 'resuelto'::text, 'cancelado'::text]))),
    CONSTRAINT fk_registros_pendientes_sesion FOREIGN KEY (sesion_clase_id) REFERENCES sesiones_clase(id) ON DELETE CASCADE,
    CONSTRAINT fk_registros_pendientes_maestro FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE
);

CREATE TABLE notificaciones (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    profile_id uuid,
    registro_pendiente_id uuid,
    tipo text DEFAULT 'in_app'::text,
    titulo text NOT NULL,
    mensaje text NOT NULL,
    deep_link text,
    estado text DEFAULT 'pendiente'::text,
    enviada_en timestamptz,
    leida_en timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    escalation_level integer DEFAULT 0,
    scheduled_for timestamptz,
    dedup_key text,
    clase_id uuid,
    CONSTRAINT notificaciones_pkey PRIMARY KEY (id),
    CONSTRAINT check_deep_link_format CHECK (((deep_link IS NULL) OR (deep_link ~ '^/[a-zA-Z0-9/_-]+$'::text))),
    CONSTRAINT notificaciones_tipo_check CHECK ((tipo = ANY (ARRAY['in_app'::text, 'push'::text, 'email'::text, 'sistema'::text, 'recordatorio_clase'::text]))),
    CONSTRAINT notificaciones_estado_check CHECK ((estado = ANY (ARRAY['pendiente'::text, 'enviada'::text, 'leida'::text, 'fallida'::text]))),
    CONSTRAINT fk_notificaciones_registro FOREIGN KEY (registro_pendiente_id) REFERENCES registros_pendientes(id) ON DELETE SET NULL,
    CONSTRAINT fk_notificaciones_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT notificaciones_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE
);

-- Registro de ausencias y solicitudes de permisos de los docentes
CREATE TABLE ausencias_maestros (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    maestro_id uuid NOT NULL,
    tipo_ausencia text NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    motivo text,
    estado text DEFAULT 'pendiente'::text,
    urgencia text DEFAULT 'media'::text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    duracion_tipo text DEFAULT 'un_dia'::text,
    archivo_url text,
    maestro_suplente_id uuid,
    notificar_director boolean DEFAULT true,
    director_notificacion_id uuid,
    aprobado_por uuid,
    decision_notas text,
    decidido_en timestamptz,
    revisado_por uuid,
    revision_notas text,
    revision_en timestamptz,
    aprobado_en timestamptz,
    rechazado_por uuid,
    rechazado_en timestamptz,
    razon_rechazo text,
    intentos_solicitud integer DEFAULT 0,
    fecha_solicitud_original date,
    clases_afectadas uuid[],
    actividades_por_clase jsonb,
    clase_emergente jsonb,
    CONSTRAINT ausencias_maestros_pkey PRIMARY KEY (id),
    CONSTRAINT ausencias_maestros_estado_check CHECK ((estado = ANY (ARRAY['pendiente'::text, 'aprobada'::text, 'rechazada'::text, 'cancelada'::text]))),
    CONSTRAINT ausencias_maestros_urgencia_check CHECK ((urgencia = ANY (ARRAY['baja'::text, 'media'::text, 'alta'::text, 'critica'::text]))),
    CONSTRAINT ausencias_maestros_duracion_tipo_check CHECK ((duracion_tipo = ANY (ARRAY['un_dia'::text, 'varios_dias'::text]))),
    CONSTRAINT ausencias_maestros_revisado_por_fkey FOREIGN KEY (revisado_por) REFERENCES auth.users(id),
    CONSTRAINT ausencias_maestros_maestro_suplente_id_fkey FOREIGN KEY (maestro_suplente_id) REFERENCES maestros(id) ON DELETE SET NULL,
    CONSTRAINT ausencias_maestros_rechazado_por_fkey FOREIGN KEY (rechazado_por) REFERENCES auth.users(id),
    CONSTRAINT ausencias_maestros_aprobado_por_fkey FOREIGN KEY (aprobado_por) REFERENCES profiles(id) ON DELETE SET NULL,
    CONSTRAINT ausencias_maestros_maestro_id_fkey FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE,
    CONSTRAINT ausencias_maestros_director_notificacion_id_fkey FOREIGN KEY (director_notificacion_id) REFERENCES notificaciones(id) ON DELETE SET NULL
);

-- Presencia del docente por sesion de clase. Complementa ausencias_maestros (que modela solicitudes de permiso, no presencia diaria).
CREATE TABLE asistencia_maestros (
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
    marked_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT asistencia_maestros_pkey PRIMARY KEY (id),
    CONSTRAINT asistencia_maestros_sesion_maestro_uniq UNIQUE (sesion_clase_id, maestro_id),
    CONSTRAINT asistencia_maestros_suplencia_chk CHECK (((estado <> 'suplencia'::text) OR (suplente_id IS NOT NULL))),
    CONSTRAINT asistencia_maestros_estado_check CHECK ((estado = ANY (ARRAY['presente'::text, 'ausente'::text, 'justificado'::text, 'suplencia'::text, 'tardanza'::text]))),
    CONSTRAINT asistencia_maestros_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE SET NULL,
    CONSTRAINT asistencia_maestros_registrado_por_fkey FOREIGN KEY (registrado_por) REFERENCES profiles(id) ON DELETE SET NULL,
    CONSTRAINT asistencia_maestros_suplente_id_fkey FOREIGN KEY (suplente_id) REFERENCES maestros(id) ON DELETE SET NULL,
    CONSTRAINT asistencia_maestros_ausencia_id_fkey FOREIGN KEY (ausencia_id) REFERENCES ausencias_maestros(id) ON DELETE SET NULL,
    CONSTRAINT asistencia_maestros_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE SET NULL,
    CONSTRAINT asistencia_maestros_maestro_id_fkey FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE RESTRICT,
    CONSTRAINT asistencia_maestros_sesion_clase_id_fkey FOREIGN KEY (sesion_clase_id) REFERENCES sesiones_clase(id) ON DELETE CASCADE
);

CREATE TABLE asistencias (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    sesion_clase_id uuid NOT NULL,
    clase_id uuid NOT NULL,
    alumno_id uuid NOT NULL,
    fecha date NOT NULL,
    estado text NOT NULL,
    justificacion_texto text,
    observaciones text,
    registrado_por uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    periodo_id uuid,
    marked_at timestamptz,
    CONSTRAINT asistencias_pkey PRIMARY KEY (id),
    CONSTRAINT uk_asistencias_clase_alumno_fecha UNIQUE (clase_id, alumno_id, fecha),
    CONSTRAINT asistencias_unica_por_sesion UNIQUE (sesion_clase_id, alumno_id),
    CONSTRAINT asistencias_estado_check CHECK ((estado = ANY (ARRAY['presente'::text, 'ausente'::text, 'tarde'::text, 'justificado'::text]))),
    CONSTRAINT asistencias_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES periodos(id),
    CONSTRAINT fk_asistencias_sesion FOREIGN KEY (sesion_clase_id) REFERENCES sesiones_clase(id) ON DELETE CASCADE,
    CONSTRAINT fk_asistencias_clase FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE,
    CONSTRAINT fk_asistencias_alumno FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
    CONSTRAINT fk_asistencias_registrado_por FOREIGN KEY (registrado_por) REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE TABLE ausencias (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    maestro_id uuid NOT NULL,
    fecha_ausencia date NOT NULL,
    motivo text NOT NULL,
    reemplazo_maestro_id uuid,
    clase_alternativa text,
    notificacion_enviada boolean DEFAULT false,
    estado text NOT NULL DEFAULT 'pendiente'::text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT ausencias_pkey PRIMARY KEY (id),
    CONSTRAINT ausencias_estado_check CHECK ((estado = ANY (ARRAY['pendiente'::text, 'notificado'::text, 'resuelta'::text])))
);

CREATE TABLE ausencias_auditoria (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    ausencia_id uuid NOT NULL,
    actor_id uuid NOT NULL,
    accion text NOT NULL,
    notas text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ausencias_auditoria_pkey PRIMARY KEY (id),
    CONSTRAINT ausencias_auditoria_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE RESTRICT,
    CONSTRAINT ausencias_auditoria_ausencia_id_fkey FOREIGN KEY (ausencia_id) REFERENCES ausencias(id) ON DELETE CASCADE
);

CREATE TABLE becas (
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
    created_at timestamptz DEFAULT now(),
    CONSTRAINT becas_pkey PRIMARY KEY (id),
    CONSTRAINT becas_porcentaje_check CHECK (((porcentaje > (0)::numeric) AND (porcentaje <= (100)::numeric))),
    CONSTRAINT becas_familia_id_fkey FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT,
    CONSTRAINT becas_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE RESTRICT,
    CONSTRAINT becas_aprobado_por_fkey FOREIGN KEY (aprobado_por) REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE departamentos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    codigo text,
    descripcion text,
    jefe_id uuid,
    activo boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    email text,
    responsable_nombre text,
    responsable_email text,
    CONSTRAINT departamentos_pkey PRIMARY KEY (id),
    CONSTRAINT departamentos_nombre_key UNIQUE (nombre),
    CONSTRAINT departamentos_jefe_id_fkey FOREIGN KEY (jefe_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE calendario (
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
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT calendario_pkey PRIMARY KEY (id),
    CONSTRAINT calendario_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE RESTRICT,
    CONSTRAINT calendario_departamento_id_fkey FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE,
    CONSTRAINT calendario_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE calendario_institucional (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    titulo text NOT NULL,
    descripcion text,
    categoria event_categoria NOT NULL DEFAULT 'otro'::event_categoria,
    fecha_inicio timestamptz NOT NULL,
    fecha_fin timestamptz NOT NULL,
    ubicacion text,
    departamento_responsable soi_departamento NOT NULL DEFAULT 'DIR'::soi_departamento,
    metadata jsonb DEFAULT '{}'::jsonb,
    estado text NOT NULL DEFAULT 'programado'::text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    es_macro_evento boolean DEFAULT false,
    salud_proyecto text DEFAULT 'en_orden'::text,
    venue_id text,
    aforo_proyectado integer DEFAULT 0,
    metadata_pm jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT calendario_institucional_pkey PRIMARY KEY (id),
    CONSTRAINT calendario_institucional_estado_check CHECK ((estado = ANY (ARRAY['programado'::text, 'en_curso'::text, 'completado'::text, 'cancelado'::text]))),
    CONSTRAINT calendario_institucional_salud_proyecto_check CHECK ((salud_proyecto = ANY (ARRAY['en_orden'::text, 'en_riesgo'::text, 'critico'::text, 'completado'::text])))
);

CREATE TABLE campanias_periodo (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    tipo text NOT NULL,
    accion text NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    activo boolean NOT NULL DEFAULT false,
    periodo_academico_id uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid DEFAULT auth.uid(),
    abre_servicio_publico boolean NOT NULL DEFAULT false,
    CONSTRAINT campanias_periodo_pkey PRIMARY KEY (id),
    CONSTRAINT campanias_periodo_tipo_check CHECK ((tipo = ANY (ARRAY['A'::text, 'B'::text]))),
    CONSTRAINT campanias_periodo_accion_check CHECK ((accion = ANY (ARRAY['inscripcion'::text, 'reinscripcion'::text, 'concierto'::text, 'microperiodo'::text, 'servicio'::text]))),
    CONSTRAINT campanias_periodo_periodo_academico_id_fkey FOREIGN KEY (periodo_academico_id) REFERENCES periodos(id) ON DELETE SET NULL
);

CREATE TABLE campania_envios (
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
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT campania_envios_pkey PRIMARY KEY (id),
    CONSTRAINT campania_envios_campania_id_jid_key UNIQUE (campania_id, jid),
    CONSTRAINT campania_envios_fuente_check CHECK ((fuente = ANY (ARRAY['postulante'::text, 'alumno'::text]))),
    CONSTRAINT campania_envios_campania_id_fkey FOREIGN KEY (campania_id) REFERENCES campanias_periodo(id) ON DELETE CASCADE
);

CREATE TABLE catalogo_niveles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    instrumento text NOT NULL,
    orden integer NOT NULL,
    activo boolean NOT NULL DEFAULT true,
    created_by uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT catalogo_niveles_pkey PRIMARY KEY (id),
    CONSTRAINT catalogo_niveles_instrumento_orden_key UNIQUE (instrumento, orden),
    CONSTRAINT catalogo_niveles_created_by_fkey FOREIGN KEY (created_by) REFERENCES maestros(id)
);

CREATE TABLE catalogo_objetivos_generales (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    nivel_id uuid NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    orden integer NOT NULL,
    activo boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT catalogo_objetivos_generales_pkey PRIMARY KEY (id),
    CONSTRAINT catalogo_objetivos_generales_nivel_id_orden_key UNIQUE (nivel_id, orden),
    CONSTRAINT catalogo_objetivos_generales_nivel_id_fkey FOREIGN KEY (nivel_id) REFERENCES catalogo_niveles(id) ON DELETE CASCADE
);

-- -- DEPRECATED: plantilla curricular legacy en evaluación 2026-09 (Owner: ACM)
CREATE TABLE catalogo_objetivos_especificos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    objetivo_general_id uuid NOT NULL,
    nombre text NOT NULL,
    orden integer NOT NULL,
    activo boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT catalogo_objetivos_especificos_pkey PRIMARY KEY (id),
    CONSTRAINT catalogo_objetivos_especificos_objetivo_general_id_orden_key UNIQUE (objetivo_general_id, orden),
    CONSTRAINT catalogo_objetivos_especificos_objetivo_general_id_fkey FOREIGN KEY (objetivo_general_id) REFERENCES catalogo_objetivos_generales(id) ON DELETE CASCADE
);

CREATE TABLE catalogos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    tipo text NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    codigo text,
    categoria text,
    orden integer DEFAULT 0,
    activo boolean DEFAULT true,
    created_by uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT catalogos_pkey PRIMARY KEY (id),
    CONSTRAINT catalogos_tipo_check CHECK ((tipo = ANY (ARRAY['contenidos'::text, 'medidas'::text, 'sugerencias'::text, 'tareas'::text, 'objetivos'::text]))),
    CONSTRAINT catalogos_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

CREATE TABLE clase_horarios (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    clase_id uuid NOT NULL,
    dia text NOT NULL,
    hora_inicio time NOT NULL,
    hora_fin time NOT NULL,
    salon_id uuid,
    created_at timestamptz DEFAULT now(),
    maestro_id uuid,
    CONSTRAINT clase_horarios_pkey PRIMARY KEY (id),
    CONSTRAINT clase_horarios_check CHECK ((hora_fin > hora_inicio)),
    CONSTRAINT clase_horarios_dia_check CHECK ((dia = ANY (ARRAY['lunes'::text, 'martes'::text, 'miércoles'::text, 'jueves'::text, 'viernes'::text, 'sábado'::text, 'domingo'::text]))),
    CONSTRAINT clase_horarios_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE,
    CONSTRAINT clase_horarios_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES salones(id) ON DELETE SET NULL
);

-- -- DEPRECATED: objetivos legacy en evaluación 2026-09 (Owner: ACM)
CREATE TABLE clase_mapa_objetivos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    clase_id uuid NOT NULL,
    level_id uuid NOT NULL,
    origen_node_id uuid,
    origen_objetivo_id uuid,
    nombre text NOT NULL,
    descripcion text,
    orden_objetivo integer NOT NULL,
    order_index integer NOT NULL DEFAULT 0,
    archived_at timestamptz,
    created_by uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    estado_revision text NOT NULL DEFAULT 'borrador'::text,
    CONSTRAINT clase_mapa_objetivos_pkey PRIMARY KEY (id),
    CONSTRAINT clase_mapa_objetivos_clase_id_level_id_orden_objetivo_key UNIQUE (clase_id, level_id, orden_objetivo),
    CONSTRAINT clase_mapa_objetivos_estado_revision_check CHECK ((estado_revision = ANY (ARRAY['borrador'::text, 'revisada'::text, 'publicada'::text]))),
    CONSTRAINT clase_mapa_objetivos_created_by_fkey FOREIGN KEY (created_by) REFERENCES maestros(id),
    CONSTRAINT clase_mapa_objetivos_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE,
    CONSTRAINT clase_mapa_objetivos_origen_objetivo_id_fkey FOREIGN KEY (origen_objetivo_id) REFERENCES catalogo_objetivos_generales(id) ON DELETE SET NULL,
    CONSTRAINT clase_mapa_objetivos_level_id_fkey FOREIGN KEY (level_id) REFERENCES catalogo_niveles(id) ON DELETE RESTRICT
);

-- -- DEPRECATED: jerarquía legacy en evaluación 2026-09 (Owner: ACM)
CREATE TABLE clase_mapa_indicadores (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    objetivo_id uuid NOT NULL,
    clase_id uuid NOT NULL,
    origen_indicator_id uuid,
    descripcion text NOT NULL,
    orden_indicador integer NOT NULL,
    order_index integer NOT NULL DEFAULT 0,
    es_requerido boolean NOT NULL DEFAULT true,
    id_jerarquico text NOT NULL,
    archived_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT clase_mapa_indicadores_pkey PRIMARY KEY (id),
    CONSTRAINT clase_mapa_indicadores_clase_id_id_jerarquico_key UNIQUE (clase_id, id_jerarquico),
    CONSTRAINT clase_mapa_indicadores_objetivo_id_orden_indicador_key UNIQUE (objetivo_id, orden_indicador),
    CONSTRAINT clase_mapa_indicadores_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE,
    CONSTRAINT clase_mapa_indicadores_origen_indicator_id_fkey FOREIGN KEY (origen_indicator_id) REFERENCES catalogo_objetivos_especificos(id) ON DELETE SET NULL,
    CONSTRAINT clase_mapa_indicadores_objetivo_id_fkey FOREIGN KEY (objetivo_id) REFERENCES clase_mapa_objetivos(id) ON DELETE RESTRICT
);

CREATE TABLE clases_emergentes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    maestro_id uuid NOT NULL,
    fecha date NOT NULL,
    hora_inicio time,
    hora_fin time,
    clase_id uuid,
    nombre_clase text,
    motivo text,
    contenido text,
    observaciones text,
    created_at timestamptz DEFAULT now(),
    salon text,
    grupo text,
    instrumento text,
    tipo text DEFAULT 'refuerzo'::text,
    estado text DEFAULT 'pendiente'::text,
    CONSTRAINT clases_emergentes_pkey PRIMARY KEY (id)
);

-- Explicit class event record per session+student, linking academic plan, level, and methodology.
CREATE TABLE class_events (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    teacher_id uuid NOT NULL,
    student_id uuid NOT NULL,
    academic_plan_id uuid,
    session_id uuid,
    level_id uuid,
    event_date date NOT NULL DEFAULT CURRENT_DATE,
    status text NOT NULL DEFAULT 'draft'::text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT class_events_pkey PRIMARY KEY (id),
    CONSTRAINT class_events_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'completed'::text, 'cancelled'::text]))),
    CONSTRAINT class_events_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES maestros(id) ON DELETE CASCADE,
    CONSTRAINT class_events_student_id_fkey FOREIGN KEY (student_id) REFERENCES alumnos(id) ON DELETE CASCADE,
    CONSTRAINT class_events_academic_plan_id_fkey FOREIGN KEY (academic_plan_id) REFERENCES academic_plans(id) ON DELETE SET NULL,
    CONSTRAINT class_events_session_id_fkey FOREIGN KEY (session_id) REFERENCES sesiones_clase(id) ON DELETE SET NULL,
    CONSTRAINT class_events_level_id_fkey FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE SET NULL
);

-- Structured methodology notes for a class event (warmup, focus areas, repertoire, etc).
CREATE TABLE class_event_methodology (
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
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT class_event_methodology_pkey PRIMARY KEY (id),
    CONSTRAINT class_event_methodology_main_node_id_fkey FOREIGN KEY (main_node_id) REFERENCES nodes(id) ON DELETE SET NULL,
    CONSTRAINT class_event_methodology_class_event_id_fkey FOREIGN KEY (class_event_id) REFERENCES class_events(id) ON DELETE CASCADE
);

CREATE TABLE class_session_content_snapshots (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    session_id uuid NOT NULL,
    node_id uuid,
    indicator_id uuid,
    node_name text,
    indicator_description text,
    is_critical boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT class_session_content_snapshots_pkey PRIMARY KEY (id)
);

CREATE TABLE planificaciones (
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
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    instrumento text,
    objetivos_estructurados jsonb NOT NULL DEFAULT '[]'::jsonb,
    frecuencia_semanal numeric,
    semanas_totales integer,
    nivel_texto text,
    CONSTRAINT planificaciones_pkey PRIMARY KEY (id),
    CONSTRAINT planificaciones_estado_check CHECK ((estado = ANY (ARRAY['borrador'::text, 'activa'::text, 'cerrada'::text, 'archivada'::text]))),
    CONSTRAINT planificaciones_fecha_check CHECK (((fecha_fin IS NULL) OR (fecha_fin >= fecha_inicio))),
    CONSTRAINT fk_planificaciones_nivel FOREIGN KEY (nivel_id) REFERENCES niveles(id) ON DELETE SET NULL,
    CONSTRAINT fk_planificaciones_clase FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE,
    CONSTRAINT fk_planificaciones_maestro FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE RESTRICT,
    CONSTRAINT fk_planificaciones_programa FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE SET NULL
);

CREATE TABLE cobertura_alumno_objetivo (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    alumno_id uuid,
    objetivo_id uuid,
    plan_id uuid,
    maestro_id uuid,
    fecha date NOT NULL DEFAULT CURRENT_DATE,
    confirmado boolean DEFAULT false,
    nivel text DEFAULT 'en_proceso'::text,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT cobertura_alumno_objetivo_pkey PRIMARY KEY (id),
    CONSTRAINT cobertura_alumno_objetivo_alumno_id_objetivo_id_key UNIQUE (alumno_id, objetivo_id),
    CONSTRAINT cobertura_alumno_objetivo_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES planificaciones(id) ON DELETE SET NULL,
    CONSTRAINT cobertura_alumno_objetivo_maestro_id_fkey FOREIGN KEY (maestro_id) REFERENCES maestros(id),
    CONSTRAINT cobertura_alumno_objetivo_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
    CONSTRAINT cobertura_alumno_objetivo_objetivo_id_fkey FOREIGN KEY (objetivo_id) REFERENCES curriculo_objetivos(id) ON DELETE CASCADE
);

-- Catálogo de instrumentos. estado_uso lo gestiona el trigger trg_comodato_sync_estado_uso.
CREATE TABLE inventario_activos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    tipo_instrumento varchar NOT NULL,
    marca varchar,
    modelo varchar,
    numero_serie varchar,
    codigo_inventario varchar NOT NULL,
    estado_conservacion varchar NOT NULL DEFAULT 'bueno'::character varying,
    estado_uso varchar NOT NULL DEFAULT 'disponible'::character varying,
    ubicacion varchar NOT NULL DEFAULT 'Sede Principal'::character varying,
    activo boolean NOT NULL DEFAULT true,
    notas text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    fecha_adquisicion date,
    valor_adquisicion numeric,
    fecha_baja date,
    motivo_baja text,
    foto_url varchar,
    proveedor varchar,
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
    import_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    CONSTRAINT inventario_activos_pkey PRIMARY KEY (id),
    CONSTRAINT inventario_activos_codigo_inventario_key UNIQUE (codigo_inventario),
    CONSTRAINT inventario_activos_estado_uso_check CHECK (((estado_uso)::text = ANY ((ARRAY['disponible'::character varying, 'prestado'::character varying, 'en_mantenimiento'::character varying, 'en_reparacion'::character varying, 'de_baja'::character varying])::text[]))),
    CONSTRAINT inventario_activos_estado_conservacion_check CHECK (((estado_conservacion)::text = ANY ((ARRAY['excelente'::character varying, 'bueno'::character varying, 'regular'::character varying, 'mantenimiento'::character varying, 'de_baja'::character varying])::text[])))
);

-- Préstamos de instrumentos. El trigger trg_comodato_sync_estado_uso sincroniza inventario_activos.estado_uso.
CREATE TABLE comodatos_activos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    activo_id uuid NOT NULL,
    alumno_id uuid NOT NULL,
    fecha_entrega date NOT NULL DEFAULT CURRENT_DATE,
    fecha_devolucion date,
    estado varchar NOT NULL DEFAULT 'activo'::character varying,
    contrato_firmado_url varchar,
    observaciones text,
    registrado_por uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    fecha_vencimiento date,
    tipo_comodato varchar,
    instrumento_propio_id uuid,
    renovado_de_id uuid,
    intercambiado_con_id uuid,
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT comodatos_activos_pkey PRIMARY KEY (id),
    CONSTRAINT comodatos_activos_tipo_comodato_check CHECK (((tipo_comodato)::text = ANY ((ARRAY['escolar'::character varying, 'anual'::character varying, 'eventual'::character varying])::text[]))),
    CONSTRAINT comodatos_activos_estado_check CHECK (((estado)::text = ANY ((ARRAY['activo'::character varying, 'devuelto'::character varying, 'renovado'::character varying])::text[]))),
    CONSTRAINT comodatos_activos_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE RESTRICT,
    CONSTRAINT comodatos_activos_activo_id_fkey FOREIGN KEY (activo_id) REFERENCES inventario_activos(id) ON DELETE RESTRICT,
    CONSTRAINT comodatos_activos_intercambiado_con_id_fkey FOREIGN KEY (intercambiado_con_id) REFERENCES comodatos_activos(id) ON DELETE SET NULL,
    CONSTRAINT comodatos_activos_renovado_de_id_fkey FOREIGN KEY (renovado_de_id) REFERENCES comodatos_activos(id) ON DELETE SET NULL,
    CONSTRAINT comodatos_activos_instrumento_propio_id_fkey FOREIGN KEY (instrumento_propio_id) REFERENCES inventario_activos(id) ON DELETE SET NULL,
    CONSTRAINT comodatos_activos_registrado_por_fkey FOREIGN KEY (registrado_por) REFERENCES auth.users(id)
);

CREATE TABLE representantes (
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
    created_at timestamptz DEFAULT now(),
    bloqueo_reinscripcion boolean NOT NULL DEFAULT false,
    motivo_bloqueo text,
    CONSTRAINT representantes_pkey PRIMARY KEY (id),
    CONSTRAINT representantes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT representantes_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL,
    CONSTRAINT representantes_familia_id_fkey FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT
);

CREATE TABLE compromisos_pago (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    familia_id uuid NOT NULL,
    representante_id uuid NOT NULL,
    monto_comprometido_centavos bigint NOT NULL,
    fecha_comprometida date NOT NULL,
    cumplido boolean DEFAULT false,
    fecha_cumplimiento date,
    origen_notificacion_id uuid,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT compromisos_pago_pkey PRIMARY KEY (id),
    CONSTRAINT chk_compromisos_monto_positivo CHECK ((monto_comprometido_centavos > 0)),
    CONSTRAINT compromisos_pago_representante_id_fkey FOREIGN KEY (representante_id) REFERENCES representantes(id) ON DELETE RESTRICT,
    CONSTRAINT compromisos_pago_familia_id_fkey FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT
);

-- Portal COM: registro de interacciones (llamadas/whatsapp/correo/reunion) con motor de proxima-accion (follow-up). Estandar CRM Activity model.
CREATE TABLE comunicaciones_seguimiento (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    alumno_id uuid,
    contacto_nombre text,
    contacto_telefono text,
    contacto_email text,
    canal text NOT NULL DEFAULT 'llamada'::text,
    fecha timestamptz NOT NULL DEFAULT now(),
    resultado text NOT NULL DEFAULT 'contactado'::text,
    notas text,
    requiere_seguimiento boolean NOT NULL DEFAULT false,
    proxima_accion text,
    proxima_fecha date,
    estado text NOT NULL DEFAULT 'abierto'::text,
    responsable_id uuid DEFAULT auth.uid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    nivel smallint,
    origen text NOT NULL DEFAULT 'manual'::text,
    CONSTRAINT comunicaciones_seguimiento_pkey PRIMARY KEY (id),
    CONSTRAINT comunicaciones_seguimiento_resultado_check CHECK ((resultado = ANY (ARRAY['contactado'::text, 'buzon_no_contesto'::text, 'reagendar'::text, 'sin_interes'::text, 'resuelto'::text]))),
    CONSTRAINT comunicaciones_seguimiento_canal_check CHECK ((canal = ANY (ARRAY['llamada'::text, 'whatsapp'::text, 'correo'::text, 'reunion'::text, 'otro'::text]))),
    CONSTRAINT comunicaciones_seguimiento_origen_chk CHECK ((origen = ANY (ARRAY['manual'::text, 'ausentismo'::text, 'hermes'::text, 'otro'::text]))),
    CONSTRAINT comunicaciones_seguimiento_estado_check CHECK ((estado = ANY (ARRAY['abierto'::text, 'cerrado'::text]))),
    CONSTRAINT comunicaciones_seguimiento_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT comunicaciones_seguimiento_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL
);

CREATE TABLE configuracion_aranceles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    concepto text NOT NULL,
    monto_centavos bigint NOT NULL,
    moneda text NOT NULL DEFAULT 'DOP'::text,
    descripcion text,
    activo boolean NOT NULL DEFAULT true,
    fecha_vigencia_desde date NOT NULL DEFAULT CURRENT_DATE,
    fecha_vigencia_hasta date,
    modificado_por uuid,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT configuracion_aranceles_pkey PRIMARY KEY (id),
    CONSTRAINT configuracion_aranceles_monto_centavos_check CHECK ((monto_centavos > 0)),
    CONSTRAINT configuracion_aranceles_modificado_por_fkey FOREIGN KEY (modificado_por) REFERENCES auth.users(id)
);

CREATE TABLE configuracion_recordatorios (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    profile_id uuid NOT NULL,
    recordatorios_activos boolean DEFAULT true,
    push_activo boolean DEFAULT false,
    email_activo boolean DEFAULT false,
    hora_resumen_diario time DEFAULT '18:00:00'::time without time zone,
    dia_resumen_semanal integer DEFAULT 5,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    min_antes_clase integer DEFAULT 15,
    min_post_clase_sin_registro integer DEFAULT 60,
    horas_recordatorio_dia1 integer DEFAULT 24,
    horas_recordatorio_dia2 integer DEFAULT 48,
    alerta_pre_clase boolean DEFAULT true,
    alerta_post_clase boolean DEFAULT true,
    alerta_24h boolean DEFAULT true,
    alerta_48h boolean DEFAULT true,
    CONSTRAINT configuracion_recordatorios_pkey PRIMARY KEY (id),
    CONSTRAINT configuracion_recordatorios_profile_id_key UNIQUE (profile_id),
    CONSTRAINT configuracion_recordatorios_dia_resumen_semanal_check CHECK (((dia_resumen_semanal >= 1) AND (dia_resumen_semanal <= 7))),
    CONSTRAINT fk_configuracion_recordatorios_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE contactos_alianzas (
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
    fecha_primer_contacto timestamptz,
    fecha_ultima_respuesta timestamptz,
    email_enviado boolean DEFAULT false,
    email_draft_id text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    tipo text DEFAULT 'fundacion'::text,
    CONSTRAINT contactos_alianzas_pkey PRIMARY KEY (id),
    CONSTRAINT contactos_alianzas_tipo_check CHECK ((tipo = ANY (ARRAY['fundacion'::text, 'artista'::text, 'aliado_local'::text, 'gobierno'::text, 'red'::text]))),
    CONSTRAINT contactos_alianzas_estado_check CHECK ((estado = ANY (ARRAY['prospecto'::text, 'contactado'::text, 'respondio'::text, 'en_negociacion'::text, 'convenio_activo'::text, 'descartado'::text]))),
    CONSTRAINT contactos_alianzas_puntuacion_match_check CHECK (((puntuacion_match >= 1) AND (puntuacion_match <= 5)))
);

CREATE TABLE modulos (
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
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT modulos_pkey PRIMARY KEY (id),
    CONSTRAINT modulos_nivel_orden_unique UNIQUE (nivel_id, orden),
    CONSTRAINT modulos_nivel_nombre_unique UNIQUE (nivel_id, nombre),
    CONSTRAINT modulos_orden_check CHECK ((orden > 0)),
    CONSTRAINT modulos_duracion_estimada_semanas_check CHECK (((duracion_estimada_semanas IS NULL) OR (duracion_estimada_semanas > 0))),
    CONSTRAINT modulos_porcentaje_aprobacion_check CHECK (((porcentaje_aprobacion >= (0)::numeric) AND (porcentaje_aprobacion <= (100)::numeric))),
    CONSTRAINT fk_modulos_programa FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE CASCADE,
    CONSTRAINT fk_modulos_requisito FOREIGN KEY (requisito_modulo_id) REFERENCES modulos(id) ON DELETE SET NULL,
    CONSTRAINT fk_modulos_nivel FOREIGN KEY (nivel_id) REFERENCES niveles(id) ON DELETE CASCADE
);

CREATE TABLE unidades (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    modulo_id uuid NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    orden integer NOT NULL,
    activo boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT unidades_pkey PRIMARY KEY (id),
    CONSTRAINT unidades_modulo_nombre_unique UNIQUE (modulo_id, nombre),
    CONSTRAINT unidades_modulo_orden_unique UNIQUE (modulo_id, orden),
    CONSTRAINT unidades_orden_check CHECK ((orden > 0)),
    CONSTRAINT fk_unidades_modulo FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE
);

CREATE TABLE ejercicios (
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
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT ejercicios_pkey PRIMARY KEY (id),
    CONSTRAINT ejercicios_unidad_orden_unique UNIQUE (unidad_id, orden),
    CONSTRAINT ejercicios_orden_check CHECK ((orden > 0)),
    CONSTRAINT ejercicios_puntaje_maximo_check CHECK ((puntaje_maximo > (0)::numeric)),
    CONSTRAINT ejercicios_puntaje_aprobacion_check CHECK ((puntaje_aprobacion >= (0)::numeric)),
    CONSTRAINT ejercicios_puntos_xp_check CHECK ((puntos_xp >= 0)),
    CONSTRAINT ejercicios_tipo_ejercicio_check CHECK ((tipo_ejercicio = ANY (ARRAY['tecnico'::text, 'ritmico'::text, 'lectura'::text, 'auditivo'::text, 'repertorio'::text, 'teorico'::text, 'postural'::text, 'ensamble'::text, 'memoria'::text, 'otro'::text]))),
    CONSTRAINT ejercicios_dificultad_check CHECK (((dificultad >= 1) AND (dificultad <= 10))),
    CONSTRAINT ejercicios_puntaje_check CHECK ((puntaje_aprobacion <= puntaje_maximo)),
    CONSTRAINT fk_ejercicios_unidad FOREIGN KEY (unidad_id) REFERENCES unidades(id) ON DELETE CASCADE
);

CREATE TABLE contenidos_sesion (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    sesion_clase_id uuid NOT NULL,
    planificacion_id uuid,
    modulo_id uuid,
    unidad_id uuid,
    ejercicio_id uuid,
    descripcion text,
    nivel_logro text,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT contenidos_sesion_pkey PRIMARY KEY (id),
    CONSTRAINT contenidos_sesion_nivel_logro_check CHECK (((nivel_logro IS NULL) OR (nivel_logro = ANY (ARRAY['introducido'::text, 'practicado'::text, 'reforzado'::text, 'evaluado'::text, 'dominado'::text])))),
    CONSTRAINT fk_contenidos_sesion_unidad FOREIGN KEY (unidad_id) REFERENCES unidades(id) ON DELETE SET NULL,
    CONSTRAINT fk_contenidos_sesion_planificacion FOREIGN KEY (planificacion_id) REFERENCES planificaciones(id) ON DELETE SET NULL,
    CONSTRAINT fk_contenidos_sesion_sesion FOREIGN KEY (sesion_clase_id) REFERENCES sesiones_clase(id) ON DELETE CASCADE,
    CONSTRAINT fk_contenidos_sesion_modulo FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE SET NULL,
    CONSTRAINT fk_contenidos_sesion_ejercicio FOREIGN KEY (ejercicio_id) REFERENCES ejercicios(id) ON DELETE SET NULL
);

CREATE TABLE postulantes (
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
    sincronizado_en timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    estado text NOT NULL DEFAULT 'pendiente'::text,
    alumno_id uuid,
    fecha_postulacion timestamptz,
    fecha_contacto timestamptz,
    fecha_cita timestamptz,
    notas_seguimiento text,
    instrumento text,
    CONSTRAINT postulantes_pkey PRIMARY KEY (id),
    CONSTRAINT postulantes_submission_key UNIQUE (correo, nombre_completo),
    CONSTRAINT postulantes_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id)
);

CREATE TABLE conversaciones_whatsapp (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    postulante_id uuid NOT NULL,
    estado_conversacion text NOT NULL DEFAULT 'esperando_respuesta_campania'::text,
    reintentos integer DEFAULT 0,
    jid text NOT NULL,
    ultimo_mensaje_enviado text,
    ultimo_mensaje_recibido text,
    ultima_intencion text,
    fecha_cita_propuesta timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT conversaciones_whatsapp_pkey PRIMARY KEY (id),
    CONSTRAINT unique_postulante_conversacion UNIQUE (postulante_id),
    CONSTRAINT conversaciones_whatsapp_postulante_id_fkey FOREIGN KEY (postulante_id) REFERENCES postulantes(id) ON DELETE CASCADE
);

-- -- DEPRECATED: generador documental institucional diferido 2026-09 (Owner: DIR/ADM)
CREATE TABLE document_batches (
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
    created_at timestamptz DEFAULT now(),
    generated_at timestamptz,
    CONSTRAINT document_batches_pkey PRIMARY KEY (id),
    CONSTRAINT document_batches_estado_check CHECK ((estado = ANY (ARRAY['borrador'::text, 'generado'::text, 'archivado'::text, 'anulado'::text])))
);

CREATE TABLE document_templates (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    tipo text NOT NULL,
    descripcion text,
    contenido text NOT NULL,
    variables text[] DEFAULT '{}'::text[],
    estado text NOT NULL DEFAULT 'activa'::text,
    version integer NOT NULL DEFAULT 1,
    created_by uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT document_templates_pkey PRIMARY KEY (id),
    CONSTRAINT document_templates_estado_check CHECK ((estado = ANY (ARRAY['activa'::text, 'inactiva'::text, 'archivada'::text])))
);

CREATE TABLE maestro_routes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    maestro_id uuid NOT NULL,
    clase_id uuid NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT maestro_routes_pkey PRIMARY KEY (id),
    CONSTRAINT maestro_routes_maestro_id_clase_id_key UNIQUE (maestro_id, clase_id),
    CONSTRAINT maestro_routes_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE,
    CONSTRAINT maestro_routes_maestro_id_fkey FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE
);

CREATE TABLE maestro_unidades (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    ruta_id uuid NOT NULL,
    orden integer NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT maestro_unidades_pkey PRIMARY KEY (id),
    CONSTRAINT valid_orden CHECK ((orden >= 0)),
    CONSTRAINT maestro_unidades_ruta_id_fkey FOREIGN KEY (ruta_id) REFERENCES maestro_routes(id) ON DELETE CASCADE
);

CREATE TABLE maestro_objetivos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    unidad_id uuid NOT NULL,
    orden integer NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT maestro_objetivos_pkey PRIMARY KEY (id),
    CONSTRAINT valid_orden CHECK ((orden >= 0)),
    CONSTRAINT maestro_objetivos_unidad_id_fkey FOREIGN KEY (unidad_id) REFERENCES maestro_unidades(id) ON DELETE CASCADE
);

CREATE TABLE maestro_indicadores (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    objetivo_id uuid NOT NULL,
    orden integer NOT NULL,
    nombre text NOT NULL,
    criterios_json jsonb,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT maestro_indicadores_pkey PRIMARY KEY (id),
    CONSTRAINT valid_orden CHECK ((orden >= 0)),
    CONSTRAINT maestro_indicadores_objetivo_id_fkey FOREIGN KEY (objetivo_id) REFERENCES maestro_objetivos(id) ON DELETE CASCADE
);

CREATE TABLE evaluacion_indicador (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    alumno_id uuid NOT NULL,
    indicator_id uuid,
    clase_id uuid NOT NULL,
    nota integer,
    estado text DEFAULT 'sin_evaluar'::text,
    observaciones text,
    evaluado_por uuid,
    fecha_evaluacion timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    clase_indicador_id uuid,
    recovery_status text DEFAULT 'pendiente'::text,
    recovery_notes text,
    recovery_timestamp timestamptz,
    recovery_grade integer,
    maestro_indicador_id uuid,
    review_flag boolean NOT NULL DEFAULT false,
    CONSTRAINT evaluacion_indicador_pkey PRIMARY KEY (id),
    CONSTRAINT evaluacion_indicador_alumno_indicator_clase_unique UNIQUE (alumno_id, indicator_id, clase_id),
    CONSTRAINT evaluacion_indicador_alumno_maestro_indicador_clase_unique UNIQUE (alumno_id, maestro_indicador_id, clase_id),
    CONSTRAINT evaluacion_indicador_nota_check CHECK (((nota >= 1) AND (nota <= 5))),
    CONSTRAINT evaluacion_indicador_recovery_grade_check CHECK (((recovery_grade IS NULL) OR ((recovery_grade >= 1) AND (recovery_grade <= 5)))),
    CONSTRAINT evaluacion_indicador_exactly_one_indicator_source CHECK ((((indicator_id IS NOT NULL) AND (maestro_indicador_id IS NULL)) OR ((indicator_id IS NULL) AND (maestro_indicador_id IS NOT NULL)))),
    CONSTRAINT evaluacion_indicador_recovery_status_check CHECK ((recovery_status = ANY (ARRAY['pendiente'::text, 'recuperado'::text, 'no_recuperable'::text, 'no_aplica'::text]))),
    CONSTRAINT evaluacion_indicador_estado_check CHECK ((estado = ANY (ARRAY['sin_evaluar'::text, 'inicia'::text, 'en_progreso'::text, 'avanzado'::text, 'dominado'::text]))),
    CONSTRAINT evaluacion_indicador_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
    CONSTRAINT evaluacion_indicador_indicator_id_fkey FOREIGN KEY (indicator_id) REFERENCES indicators(id) ON DELETE CASCADE,
    CONSTRAINT evaluacion_indicador_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE,
    CONSTRAINT evaluacion_indicador_clase_indicador_id_fkey FOREIGN KEY (clase_indicador_id) REFERENCES clase_mapa_indicadores(id) ON DELETE RESTRICT,
    CONSTRAINT evaluacion_indicador_maestro_indicador_id_fkey FOREIGN KEY (maestro_indicador_id) REFERENCES maestro_indicadores(id) ON DELETE CASCADE,
    CONSTRAINT evaluacion_indicador_evaluado_por_fkey FOREIGN KEY (evaluado_por) REFERENCES auth.users(id)
);

CREATE TABLE evaluations (
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
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT evaluations_pkey PRIMARY KEY (id),
    CONSTRAINT evaluations_student_id_jurado_id_key UNIQUE (student_id, jurado_id),
    CONSTRAINT evaluations_digitacion_check CHECK (((digitacion >= 1) AND (digitacion <= 4))),
    CONSTRAINT evaluations_lectura_check CHECK (((lectura >= 1) AND (lectura <= 4))),
    CONSTRAINT evaluations_articulacion_check CHECK (((articulacion >= 1) AND (articulacion <= 4))),
    CONSTRAINT evaluations_ritmo_rep_check CHECK (((ritmo_rep >= 1) AND (ritmo_rep <= 4))),
    CONSTRAINT evaluations_afinacion_rep_check CHECK (((afinacion_rep >= 1) AND (afinacion_rep <= 4))),
    CONSTRAINT evaluations_sonido_check CHECK (((sonido >= 1) AND (sonido <= 4))),
    CONSTRAINT evaluations_ritmo_escala_check CHECK (((ritmo_escala >= 1) AND (ritmo_escala <= 4))),
    CONSTRAINT evaluations_afinacion_general_check CHECK (((afinacion_general >= 1) AND (afinacion_general <= 4))),
    CONSTRAINT evaluations_student_id_fkey FOREIGN KEY (student_id) REFERENCES alumnos(id) ON DELETE CASCADE
);

-- Reparaciones de instrumentos. estado controla el flujo: recibido → en_reparacion → finalizado → entregado
CREATE TABLE inventario_reparaciones (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    activo_id uuid NOT NULL,
    tipo_tallerista varchar NOT NULL,
    tallerista_nombre varchar NOT NULL,
    descripcion text NOT NULL,
    costo_estimado numeric,
    costo_real numeric,
    fecha_ingreso date NOT NULL DEFAULT CURRENT_DATE,
    fecha_egreso date,
    estado varchar NOT NULL DEFAULT 'recibido'::character varying,
    proveedor_factura_url varchar,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT inventario_reparaciones_pkey PRIMARY KEY (id),
    CONSTRAINT inventario_reparaciones_costo_real_check CHECK ((costo_real >= (0)::numeric)),
    CONSTRAINT inventario_reparaciones_estado_check CHECK (((estado)::text = ANY ((ARRAY['recibido'::character varying, 'en_reparacion'::character varying, 'finalizado'::character varying, 'entregado'::character varying])::text[]))),
    CONSTRAINT inventario_reparaciones_costo_estimado_check CHECK ((costo_estimado >= (0)::numeric)),
    CONSTRAINT inventario_reparaciones_tipo_tallerista_check CHECK (((tipo_tallerista)::text = ANY ((ARRAY['externo'::character varying, 'luthier_interno'::character varying])::text[]))),
    CONSTRAINT inventario_reparaciones_activo_id_fkey FOREIGN KEY (activo_id) REFERENCES inventario_activos(id) ON DELETE RESTRICT
);

-- Facturas asociadas a reparaciones de instrumentos
CREATE TABLE facturas_reparacion (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    reparacion_id uuid NOT NULL,
    numero_factura varchar NOT NULL,
    monto_total numeric NOT NULL,
    impuestos numeric DEFAULT 0,
    metodo_pago varchar NOT NULL,
    responsable_id uuid,
    tipo_factura varchar NOT NULL DEFAULT 'institucion'::character varying,
    fecha_emision date NOT NULL DEFAULT CURRENT_DATE,
    pdf_generado_url varchar,
    estado_pago varchar NOT NULL DEFAULT 'pendiente'::character varying,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT facturas_reparacion_pkey PRIMARY KEY (id),
    CONSTRAINT facturas_reparacion_numero_factura_key UNIQUE (numero_factura),
    CONSTRAINT facturas_reparacion_monto_total_check CHECK ((monto_total > (0)::numeric)),
    CONSTRAINT facturas_reparacion_estado_pago_check CHECK (((estado_pago)::text = ANY ((ARRAY['pendiente'::character varying, 'pagado'::character varying, 'anulada'::character varying])::text[]))),
    CONSTRAINT facturas_reparacion_tipo_factura_check CHECK (((tipo_factura)::text = ANY ((ARRAY['alumno'::character varying, 'institucion'::character varying])::text[]))),
    CONSTRAINT facturas_reparacion_metodo_pago_check CHECK (((metodo_pago)::text = ANY ((ARRAY['efectivo'::character varying, 'transferencia'::character varying, 'deposito'::character varying, 'tarjeta'::character varying])::text[]))),
    CONSTRAINT facturas_reparacion_impuestos_check CHECK ((impuestos >= (0)::numeric)),
    CONSTRAINT facturas_reparacion_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES auth.users(id),
    CONSTRAINT facturas_reparacion_reparacion_id_fkey FOREIGN KEY (reparacion_id) REFERENCES inventario_reparaciones(id) ON DELETE RESTRICT
);

-- Catálogo de conectores de proveedores de servicios externos (CEPM, etc.). Solo service_role.
CREATE TABLE fin_service_providers (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    connector_key text NOT NULL,
    connector_status text NOT NULL DEFAULT 'active'::text,
    display_name text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fin_service_providers_pkey PRIMARY KEY (id),
    CONSTRAINT fin_service_providers_connector_key_key UNIQUE (connector_key),
    CONSTRAINT fin_service_providers_connector_status_check CHECK ((connector_status = ANY (ARRAY['active'::text, 'inactive'::text])))
);

-- Cuentas de servicios externos a refrescar (medidores CEPM, etc.). Solo service_role.
CREATE TABLE fin_service_accounts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    provider_id uuid NOT NULL,
    external_account_ref text NOT NULL,
    account_name text,
    service_type text,
    currency_code text NOT NULL DEFAULT 'DOP'::text,
    essential boolean NOT NULL DEFAULT false,
    active boolean NOT NULL DEFAULT true,
    refresh_enabled boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    CONSTRAINT fin_service_accounts_pkey PRIMARY KEY (id),
    CONSTRAINT fin_service_accounts_provider_id_external_account_ref_key UNIQUE (provider_id, external_account_ref),
    CONSTRAINT fin_service_accounts_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES fin_service_providers(id)
);

-- Auditoría de cada intento de refresh (audit trail). Solo service_role.
CREATE TABLE fin_service_refresh_runs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    service_account_id uuid NOT NULL,
    trigger_source text NOT NULL,
    status text NOT NULL,
    error_code text,
    error_message text,
    created_by uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    finished_at timestamptz,
    CONSTRAINT fin_service_refresh_runs_pkey PRIMARY KEY (id),
    CONSTRAINT fin_service_refresh_runs_trigger_source_check CHECK ((trigger_source = ANY (ARRAY['schedule'::text, 'manual'::text]))),
    CONSTRAINT fin_service_refresh_runs_status_check CHECK ((status = ANY (ARRAY['running'::text, 'success'::text, 'unsupported'::text, 'skipped'::text, 'error'::text]))),
    CONSTRAINT fin_service_refresh_runs_service_account_id_fkey FOREIGN KEY (service_account_id) REFERENCES fin_service_accounts(id)
);

-- Histórico de balances observados por cuenta (dedup por source_snapshot_key). Solo service_role.
CREATE TABLE fin_service_balance_snapshots (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    service_account_id uuid NOT NULL,
    refresh_run_id uuid,
    observed_at timestamptz NOT NULL,
    balance_centavos bigint,
    amount_due_centavos bigint,
    due_date date,
    currency_code text NOT NULL,
    source_snapshot_key text NOT NULL,
    provider_summary jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fin_service_balance_snapshots_pkey PRIMARY KEY (id),
    CONSTRAINT fin_service_balance_snapshots_source_snapshot_key_key UNIQUE (source_snapshot_key),
    CONSTRAINT fin_service_balance_snapshots_refresh_run_id_fkey FOREIGN KEY (refresh_run_id) REFERENCES fin_service_refresh_runs(id),
    CONSTRAINT fin_service_balance_snapshots_service_account_id_fkey FOREIGN KEY (service_account_id) REFERENCES fin_service_accounts(id)
);

-- Estado de lock + última consulta por cuenta, para concurrencia segura. Solo service_role.
CREATE TABLE fin_service_refresh_state (
    service_account_id uuid NOT NULL,
    locked_by_run_id uuid,
    lock_expires_at timestamptz,
    last_query_at timestamptz,
    last_success_at timestamptz,
    last_status text,
    last_error_code text,
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fin_service_refresh_state_pkey PRIMARY KEY (service_account_id),
    CONSTRAINT fin_service_refresh_state_service_account_id_fkey FOREIGN KEY (service_account_id) REFERENCES fin_service_accounts(id),
    CONSTRAINT fin_service_refresh_state_locked_by_run_id_fkey FOREIGN KEY (locked_by_run_id) REFERENCES fin_service_refresh_runs(id)
);

CREATE TABLE finanzas_politica_cobranza (
    singleton boolean NOT NULL DEFAULT true,
    dia_vencimiento smallint NOT NULL DEFAULT 10,
    dias_mora_amarilla integer NOT NULL DEFAULT 30,
    dias_mora_critica integer NOT NULL DEFAULT 60,
    bloqueo_requiere_aprobacion boolean NOT NULL DEFAULT true,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid DEFAULT auth.uid(),
    CONSTRAINT finanzas_politica_cobranza_pkey PRIMARY KEY (singleton),
    CONSTRAINT finanzas_politica_cobranza_singleton_check CHECK (singleton),
    CONSTRAINT finanzas_politica_cobranza_dia_vencimiento_check CHECK (((dia_vencimiento >= 1) AND (dia_vencimiento <= 28))),
    CONSTRAINT finanzas_politica_cobranza_check CHECK ((dias_mora_critica > dias_mora_amarilla)),
    CONSTRAINT finanzas_politica_cobranza_dias_mora_amarilla_check CHECK ((dias_mora_amarilla >= 1))
);

CREATE TABLE gastos_fijos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    categoria text NOT NULL,
    centro_costo soi_departamento NOT NULL DEFAULT 'ADM'::soi_departamento,
    monto_centavos bigint NOT NULL,
    dia_inicio smallint NOT NULL,
    dia_fin smallint NOT NULL,
    repetir_mensual boolean NOT NULL DEFAULT true,
    activo boolean NOT NULL DEFAULT true,
    notas text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid DEFAULT auth.uid(),
    CONSTRAINT gastos_fijos_pkey PRIMARY KEY (id),
    CONSTRAINT gastos_fijos_check CHECK ((((dia_fin >= 1) AND (dia_fin <= 31)) AND (dia_fin >= dia_inicio))),
    CONSTRAINT gastos_fijos_monto_centavos_check CHECK ((monto_centavos > 0)),
    CONSTRAINT gastos_fijos_categoria_check CHECK ((categoria = ANY (ARRAY['comunicaciones'::text, 'energia'::text, 'agua'::text, 'limpieza'::text, 'personal'::text, 'alquiler'::text, 'software'::text, 'seguro'::text, 'otro'::text]))),
    CONSTRAINT gastos_fijos_dia_inicio_check CHECK (((dia_inicio >= 1) AND (dia_inicio <= 31)))
);

CREATE TABLE gastos_fijos_pagos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    gasto_fijo_id uuid NOT NULL,
    periodo_anio integer NOT NULL,
    periodo_mes integer NOT NULL,
    monto_centavos bigint NOT NULL,
    estado text NOT NULL DEFAULT 'pendiente'::text,
    fecha_pago date,
    referencia text,
    registrado_por uuid DEFAULT auth.uid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT gastos_fijos_pagos_pkey PRIMARY KEY (id),
    CONSTRAINT gastos_fijos_pagos_gasto_fijo_id_periodo_anio_periodo_mes_key UNIQUE (gasto_fijo_id, periodo_anio, periodo_mes),
    CONSTRAINT gastos_fijos_pagos_estado_check CHECK ((estado = ANY (ARRAY['pendiente'::text, 'pagado'::text]))),
    CONSTRAINT gastos_fijos_pagos_periodo_mes_check CHECK (((periodo_mes >= 1) AND (periodo_mes <= 12))),
    CONSTRAINT gastos_fijos_pagos_monto_centavos_check CHECK ((monto_centavos > 0)),
    CONSTRAINT gastos_fijos_pagos_gasto_fijo_id_fkey FOREIGN KEY (gasto_fijo_id) REFERENCES gastos_fijos(id) ON DELETE CASCADE
);

-- -- DEPRECATED: generador documental institucional diferido 2026-09 (Owner: DIR/ADM)
CREATE TABLE generated_documents (
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
    generated_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    CONSTRAINT generated_documents_pkey PRIMARY KEY (id),
    CONSTRAINT generated_documents_estado_check CHECK ((estado = ANY (ARRAY['borrador'::text, 'generado'::text, 'archivado'::text, 'anulado'::text]))),
    CONSTRAINT generated_documents_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL,
    CONSTRAINT generated_documents_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES document_batches(id) ON DELETE SET NULL,
    CONSTRAINT generated_documents_template_id_fkey FOREIGN KEY (template_id) REFERENCES document_templates(id) ON DELETE SET NULL
);

-- Registro de telemetria y latido en vivo (heartbeat) emitido por el contenedor Evolution API / Baileys.
CREATE TABLE hermes_gateway_health (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    instance_name text NOT NULL DEFAULT 'soi-main'::text,
    status text NOT NULL DEFAULT 'disconnected'::text,
    phone_number text,
    battery_level integer,
    qr_code_base64 text,
    last_heartbeat timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    CONSTRAINT hermes_gateway_health_pkey PRIMARY KEY (id),
    CONSTRAINT hermes_gateway_health_instance_name_key UNIQUE (instance_name),
    CONSTRAINT hermes_gateway_health_status_check CHECK ((status = ANY (ARRAY['connected'::text, 'connecting'::text, 'disconnected'::text, 'qr_ready'::text])))
);

CREATE TABLE hermes_gateway_worker_lease (
    instance_name text NOT NULL,
    owner_id text NOT NULL,
    lease_until timestamptz NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT hermes_gateway_worker_lease_pkey PRIMARY KEY (instance_name)
);

-- Bus de eventos para HERMES. Leída por analyze-risk.js y cron jobs. Solo service_role.
CREATE TABLE hermes_inbox (
    id bigint NOT NULL DEFAULT nextval('hermes_inbox_id_seq'::regclass),
    canal varchar NOT NULL DEFAULT 'db_trigger'::character varying,
    categoria varchar NOT NULL,
    summary text NOT NULL,
    raw_ref uuid,
    processed boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    telegram_user_id bigint,
    CONSTRAINT hermes_inbox_pkey PRIMARY KEY (id),
    CONSTRAINT hermes_inbox_canal_check CHECK (((canal)::text = ANY ((ARRAY['db_trigger'::character varying, 'telegram'::character varying])::text[])))
);

-- Espejo read-only de tarjetas del Kanban de Hermes (~/.hermes/kanban.db). Escrita por edge fn hermes-kanban-ingest via poller. Fase 1 puente Hermes<->SOI.
CREATE TABLE hermes_kanban_cards (
    card_id text NOT NULL,
    board text,
    title text NOT NULL,
    status text NOT NULL,
    assignee text,
    priority integer,
    summary text,
    hermes_updated_at timestamptz,
    synced_at timestamptz NOT NULL DEFAULT now(),
    raw jsonb,
    CONSTRAINT hermes_kanban_cards_pkey PRIMARY KEY (card_id)
);

-- Contrato digital ejecutable de un proceso SOI documentado. No reemplaza la ficha canonica; la vuelve operable por Hermes.
CREATE TABLE soi_process_contracts (
    process_code text NOT NULL,
    process_name text NOT NULL,
    department_owner text NOT NULL,
    canonical_doc_path text NOT NULL,
    doc_id text,
    trigger_type text NOT NULL DEFAULT 'manual'::text,
    required_evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
    closure_criteria jsonb NOT NULL DEFAULT '[]'::jsonb,
    responsible_departments text[] NOT NULL DEFAULT ARRAY[]::text[],
    task_templates jsonb NOT NULL DEFAULT '[]'::jsonb,
    automation_status text NOT NULL DEFAULT 'manual'::text,
    recurrence_count integer NOT NULL DEFAULT 0,
    active boolean NOT NULL DEFAULT true,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT soi_process_contracts_pkey PRIMARY KEY (process_code),
    CONSTRAINT soi_process_contracts_automation_status_check CHECK ((automation_status = ANY (ARRAY['manual'::text, 'semi_auto'::text, 'automated'::text, 'deprecated'::text]))),
    CONSTRAINT soi_process_contracts_trigger_type_check CHECK ((trigger_type = ANY (ARRAY['manual'::text, 'event'::text, 'scheduled'::text, 'data_driven'::text, 'conversation'::text]))),
    CONSTRAINT soi_process_contracts_recurrence_count_check CHECK ((recurrence_count >= 0))
);

-- Ejecucion concreta de un proceso SOI. Su id se usa como correlation_id para agrupar tareas institucionales.
CREATE TABLE hermes_process_cases (
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
    opened_at timestamptz NOT NULL DEFAULT now(),
    closed_at timestamptz,
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT hermes_process_cases_pkey PRIMARY KEY (id),
    CONSTRAINT hermes_process_cases_source_check CHECK ((source = ANY (ARRAY['manual'::text, 'event'::text, 'scheduled'::text, 'data_driven'::text, 'conversation'::text]))),
    CONSTRAINT hermes_process_cases_status_check CHECK ((status = ANY (ARRAY['open'::text, 'in_progress'::text, 'blocked'::text, 'closed'::text, 'cancelled'::text]))),
    CONSTRAINT hermes_process_cases_priority_check CHECK ((priority = ANY (ARRAY['baja'::text, 'media'::text, 'alta'::text, 'critica'::text]))),
    CONSTRAINT hermes_process_cases_entity_type_check CHECK (((entity_type IS NULL) OR (entity_type = ANY (ARRAY['alumno'::text, 'maestro'::text, 'postulante'::text, 'representante'::text, 'instrumento'::text, 'evento'::text, 'otro'::text])))),
    CONSTRAINT hermes_process_cases_process_code_fkey FOREIGN KEY (process_code) REFERENCES soi_process_contracts(process_code) ON UPDATE CASCADE
);

CREATE TABLE hermes_protocolos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    categoria_evento event_categoria NOT NULL,
    nombre_protocolo text NOT NULL,
    descripcion text,
    tareas_plantilla jsonb NOT NULL,
    activo boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT hermes_protocolos_pkey PRIMARY KEY (id),
    CONSTRAINT hermes_protocolos_categoria_evento_key UNIQUE (categoria_evento)
);

CREATE TABLE hermes_reactive_rules (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    rule_type text NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    enabled boolean NOT NULL DEFAULT true,
    departamento text NOT NULL,
    conditions_json jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT hermes_reactive_rules_pkey PRIMARY KEY (id),
    CONSTRAINT uq_hermes_rules_type_dept UNIQUE (rule_type, departamento),
    CONSTRAINT check_hermes_rules_departamento CHECK ((departamento = ANY (ARRAY['DIR'::text, 'ACM'::text, 'ADM'::text, 'FIN'::text, 'LOG'::text, 'COM'::text, 'TECNICO'::text, 'LUT'::text]))),
    CONSTRAINT check_hermes_rules_type CHECK ((rule_type = ANY (ARRAY['R1'::text, 'R2'::text, 'R3'::text, 'R4'::text, 'R5'::text, 'R6'::text, 'R7'::text, 'R8'::text])))
);

CREATE TABLE hermes_whatsapp_config (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    gateway_url text NOT NULL,
    api_key text,
    instance_name text NOT NULL DEFAULT 'soi-main'::text,
    activo boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
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
    consentimiento_registrado boolean NOT NULL DEFAULT false,
    CONSTRAINT hermes_whatsapp_config_pkey PRIMARY KEY (id),
    CONSTRAINT hermes_whatsapp_config_numero_wid_key UNIQUE (numero_wid)
);

CREATE TABLE hermes_whatsapp_queue (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    jid text NOT NULL,
    mensaje text NOT NULL,
    estado text NOT NULL DEFAULT 'pendiente'::text,
    intentos integer DEFAULT 0,
    error_msg text,
    created_at timestamptz DEFAULT now(),
    procesado_at timestamptz,
    campania_envio_id uuid,
    CONSTRAINT hermes_whatsapp_queue_pkey PRIMARY KEY (id),
    CONSTRAINT hermes_whatsapp_queue_estado_check CHECK ((estado = ANY (ARRAY['pendiente'::text, 'pendiente_aprobacion'::text, 'procesando'::text, 'enviado'::text, 'fallido'::text, 'cancelado'::text]))),
    CONSTRAINT hermes_whatsapp_queue_campania_envio_id_fkey FOREIGN KEY (campania_envio_id) REFERENCES campania_envios(id) ON DELETE SET NULL
);

-- Tracking de altas, bajas y reactivaciones de alumnos
CREATE TABLE historial_estado_alumno (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    alumno_id uuid NOT NULL,
    estado text NOT NULL,
    motivo text,
    registrado_por uuid,
    fecha date NOT NULL DEFAULT CURRENT_DATE,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT historial_estado_alumno_pkey PRIMARY KEY (id),
    CONSTRAINT historial_estado_alumno_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE
);

-- Formal homework assignments with optional node link and due date.
CREATE TABLE homework_assignments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    class_event_id uuid NOT NULL,
    student_id uuid NOT NULL,
    teacher_id uuid NOT NULL,
    node_id uuid,
    description text NOT NULL,
    due_date date,
    status text NOT NULL DEFAULT 'assigned'::text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT homework_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT homework_assignments_status_check CHECK ((status = ANY (ARRAY['assigned'::text, 'completed'::text, 'overdue'::text]))),
    CONSTRAINT homework_assignments_student_id_fkey FOREIGN KEY (student_id) REFERENCES alumnos(id) ON DELETE CASCADE,
    CONSTRAINT homework_assignments_node_id_fkey FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE SET NULL,
    CONSTRAINT homework_assignments_class_event_id_fkey FOREIGN KEY (class_event_id) REFERENCES class_events(id) ON DELETE CASCADE,
    CONSTRAINT homework_assignments_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES maestros(id) ON DELETE CASCADE
);

CREATE TABLE indicador_prerequisito (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    indicador_id uuid NOT NULL,
    prerequisito_indicador_id uuid NOT NULL,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT indicador_prerequisito_pkey PRIMARY KEY (id),
    CONSTRAINT indicador_prerequisito_indicador_id_prerequisito_indicador__key UNIQUE (indicador_id, prerequisito_indicador_id),
    CONSTRAINT no_self_reference CHECK ((indicador_id <> prerequisito_indicador_id)),
    CONSTRAINT indicador_prerequisito_prerequisito_indicador_id_fkey FOREIGN KEY (prerequisito_indicador_id) REFERENCES maestro_indicadores(id),
    CONSTRAINT indicador_prerequisito_indicador_id_fkey FOREIGN KEY (indicador_id) REFERENCES maestro_indicadores(id) ON DELETE CASCADE
);

CREATE TABLE indicator_attempts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL,
    indicator_id uuid NOT NULL,
    session_id uuid,
    result text,
    observations text,
    created_at timestamptz DEFAULT now(),
    node_id uuid,
    status text DEFAULT 'pending'::text,
    nota smallint,
    tarea text,
    covered_date date DEFAULT CURRENT_DATE,
    covered_by_clase_id uuid,
    created_by uuid NOT NULL,
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT indicator_attempts_pkey PRIMARY KEY (id),
    CONSTRAINT uq_attempt_session_indicator_student UNIQUE (session_id, indicator_id, student_id),
    CONSTRAINT indicator_attempts_nota_check CHECK (((nota >= 1) AND (nota <= 5))),
    CONSTRAINT indicator_attempts_created_by_fkey FOREIGN KEY (created_by) REFERENCES maestros(id) ON DELETE SET NULL,
    CONSTRAINT indicator_attempts_covered_by_clase_id_fkey FOREIGN KEY (covered_by_clase_id) REFERENCES clases(id) ON DELETE SET NULL,
    CONSTRAINT indicator_attempts_node_id_fkey FOREIGN KEY (node_id) REFERENCES nodes(id)
);

CREATE TABLE ruta_contenido_objetivos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    ruta_id uuid NOT NULL,
    objetivo_id uuid,
    descripcion text NOT NULL,
    semana_inicio integer NOT NULL,
    semana_fin integer NOT NULL,
    orden integer NOT NULL,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT ruta_contenido_objetivos_pkey PRIMARY KEY (id),
    CONSTRAINT ruta_contenido_objetivos_ruta_id_objetivo_id_key UNIQUE (ruta_id, objetivo_id),
    CONSTRAINT ruta_contenido_objetivos_ruta_id_orden_key UNIQUE (ruta_id, orden),
    CONSTRAINT ruta_contenido_objetivos_check CHECK ((semana_fin >= semana_inicio)),
    CONSTRAINT ruta_contenido_objetivos_semana_inicio_check CHECK ((semana_inicio > 0)),
    CONSTRAINT ruta_contenido_objetivos_objetivo_id_fkey FOREIGN KEY (objetivo_id) REFERENCES curriculo_objetivos(id) ON DELETE SET NULL,
    CONSTRAINT ruta_contenido_objetivos_ruta_id_fkey FOREIGN KEY (ruta_id) REFERENCES rutas_contenido(id) ON DELETE CASCADE
);

CREATE TABLE indicator_sessions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    maestro_id uuid NOT NULL,
    clase_id uuid NOT NULL,
    fecha date NOT NULL,
    descripcion text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    objetivo_id uuid NOT NULL,
    CONSTRAINT indicator_sessions_pkey PRIMARY KEY (id),
    CONSTRAINT indicator_sessions_unique_session UNIQUE (clase_id, objetivo_id, fecha, maestro_id),
    CONSTRAINT indicator_sessions_maestro_id_fkey FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE,
    CONSTRAINT indicator_sessions_objetivo_id_fkey FOREIGN KEY (objetivo_id) REFERENCES ruta_contenido_objetivos(id) ON DELETE RESTRICT,
    CONSTRAINT indicator_sessions_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE RESTRICT
);

CREATE TABLE indicator_session_students (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    indicator_session_id uuid NOT NULL,
    alumno_id uuid NOT NULL,
    nota_cualitativa varchar NOT NULL,
    observaciones_individuales text,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT indicator_session_students_pkey PRIMARY KEY (id),
    CONSTRAINT indicator_session_students_indicator_session_id_alumno_id_key UNIQUE (indicator_session_id, alumno_id),
    CONSTRAINT indicator_session_students_nota_cualitativa_check CHECK (((nota_cualitativa)::text = ANY ((ARRAY['bien'::character varying, 'regular'::character varying, 'mal'::character varying])::text[]))),
    CONSTRAINT indicator_session_students_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
    CONSTRAINT indicator_session_students_indicator_session_id_fkey FOREIGN KEY (indicator_session_id) REFERENCES indicator_sessions(id) ON DELETE CASCADE
);

CREATE TABLE instrumentos (
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
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT instrumentos_pkey PRIMARY KEY (id),
    CONSTRAINT instrumentos_codigo_key UNIQUE (codigo),
    CONSTRAINT instrumentos_estado_check CHECK ((estado = ANY (ARRAY['disponible'::text, 'asignado'::text, 'danado'::text, 'en_reparacion'::text, 'fuera_de_uso'::text])))
);

-- Accesorios asociados a instrumentos (fundas, arcos, cuerdas, etc.)
CREATE TABLE inventario_accesorios (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    activo_id uuid,
    tipo varchar NOT NULL,
    marca varchar,
    cantidad integer NOT NULL DEFAULT 1,
    estado varchar NOT NULL DEFAULT 'disponible'::character varying,
    fecha_asignacion date,
    observaciones text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT inventario_accesorios_pkey PRIMARY KEY (id),
    CONSTRAINT inventario_accesorios_cantidad_check CHECK ((cantidad >= 0)),
    CONSTRAINT inventario_accesorios_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['funda'::character varying, 'arco'::character varying, 'cuerdas'::character varying, 'boquilla'::character varying, 'atril'::character varying, 'parlante'::character varying, 'cable'::character varying, 'otro'::character varying])::text[]))),
    CONSTRAINT inventario_accesorios_estado_check CHECK (((estado)::text = ANY ((ARRAY['disponible'::character varying, 'asignado'::character varying, 'agotado'::character varying])::text[]))),
    CONSTRAINT inventario_accesorios_activo_id_fkey FOREIGN KEY (activo_id) REFERENCES inventario_activos(id) ON DELETE CASCADE
);

-- Historial de eventos de instrumentos. Se inserta automáticamente via triggers.
CREATE TABLE inventario_historial (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    activo_id uuid NOT NULL,
    tipo_evento varchar NOT NULL,
    descripcion text NOT NULL,
    fecha timestamptz NOT NULL DEFAULT now(),
    usuario_id uuid,
    metadata jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT inventario_historial_pkey PRIMARY KEY (id),
    CONSTRAINT inventario_historial_tipo_evento_check CHECK (((tipo_evento)::text = ANY ((ARRAY['asignacion'::character varying, 'devolucion'::character varying, 'reparacion'::character varying, 'cambio_estado'::character varying, 'baja'::character varying, 'creacion'::character varying, 'observacion'::character varying, 'intercambio'::character varying, 'renovacion'::character varying])::text[]))),
    CONSTRAINT inventario_historial_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id),
    CONSTRAINT inventario_historial_activo_id_fkey FOREIGN KEY (activo_id) REFERENCES inventario_activos(id) ON DELETE CASCADE
);

CREATE TABLE inventario_materiales (
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
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT inventario_materiales_pkey PRIMARY KEY (id)
);

-- Registro de justificaciones de inasistencias de alumnos
CREATE TABLE justificaciones (
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
    fecha_revision timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    categoria text,
    CONSTRAINT justificaciones_pkey PRIMARY KEY (id),
    CONSTRAINT justificaciones_sesion_id_alumno_id_key UNIQUE (sesion_id, alumno_id),
    CONSTRAINT justificaciones_categoria_check CHECK (((categoria IS NULL) OR (categoria = ANY (ARRAY['medica'::text, 'familiar'::text, 'academica'::text, 'institucional'::text, 'religiosa'::text, 'transporte'::text, 'otra'::text])))),
    CONSTRAINT justificaciones_estado_check CHECK ((estado = ANY (ARRAY['pendiente'::text, 'aprobado'::text, 'rechazado'::text]))),
    CONSTRAINT justificaciones_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES maestros(id),
    CONSTRAINT justificaciones_sesion_id_fkey FOREIGN KEY (sesion_id) REFERENCES sesiones_clase(id) ON DELETE CASCADE,
    CONSTRAINT justificaciones_revisado_por_fkey FOREIGN KEY (revisado_por) REFERENCES maestros(id)
);

CREATE TABLE lut_ordenes_reparacion (
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
    fecha_recepcion timestamptz NOT NULL DEFAULT now(),
    fecha_diagnostico timestamptz,
    fecha_inicio_reparacion timestamptz,
    fecha_estimada_entrega timestamptz,
    fecha_entrega timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT lut_ordenes_reparacion_pkey PRIMARY KEY (id),
    CONSTRAINT lut_ordenes_reparacion_estado_check CHECK ((estado = ANY (ARRAY['reportado'::text, 'recibido'::text, 'pendiente_diagnostico'::text, 'diagnosticado'::text, 'presupuesto_pendiente'::text, 'esperando_aprobacion'::text, 'esperando_insumos'::text, 'en_reparacion'::text, 'en_prueba'::text, 'listo_entrega'::text, 'entregado'::text, 'cerrado'::text, 'cancelado'::text]))),
    CONSTRAINT lut_ordenes_reparacion_gravedad_check CHECK ((gravedad = ANY (ARRAY['leve'::text, 'moderada'::text, 'grave'::text, 'critica'::text]))),
    CONSTRAINT lut_ordenes_reparacion_prioridad_check CHECK ((prioridad = ANY (ARRAY['baja'::text, 'media'::text, 'alta'::text, 'critica'::text]))),
    CONSTRAINT lut_ordenes_reparacion_instrumento_id_fkey FOREIGN KEY (instrumento_id) REFERENCES inventario_activos(id)
);

CREATE TABLE lut_diagnosticos (
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
    created_at timestamptz NOT NULL DEFAULT now(),
    items jsonb NOT NULL DEFAULT '[]'::jsonb,
    CONSTRAINT lut_diagnosticos_pkey PRIMARY KEY (id),
    CONSTRAINT lut_diagnosticos_gravedad_check CHECK ((gravedad = ANY (ARRAY['leve'::text, 'moderada'::text, 'grave'::text, 'critica'::text]))),
    CONSTRAINT lut_diagnosticos_orden_id_fkey FOREIGN KEY (orden_id) REFERENCES lut_ordenes_reparacion(id) ON DELETE CASCADE
);

CREATE TABLE lut_evidencias (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    orden_id uuid NOT NULL,
    tipo text NOT NULL,
    nombre text,
    storage_path text,
    descripcion text,
    visibilidad text NOT NULL DEFAULT 'interno'::text,
    subido_por uuid,
    subido_por_nombre text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT lut_evidencias_pkey PRIMARY KEY (id),
    CONSTRAINT lut_evidencias_tipo_check CHECK ((tipo = ANY (ARRAY['foto_antes'::text, 'foto_durante'::text, 'foto_despues'::text, 'documento'::text, 'video'::text, 'factura'::text, 'informe'::text]))),
    CONSTRAINT lut_evidencias_visibilidad_check CHECK ((visibilidad = ANY (ARRAY['interno'::text, 'finanzas'::text, 'representante'::text, 'publico'::text]))),
    CONSTRAINT lut_evidencias_orden_id_fkey FOREIGN KEY (orden_id) REFERENCES lut_ordenes_reparacion(id) ON DELETE CASCADE
);

CREATE TABLE lut_insumos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    categoria text,
    unidad text NOT NULL DEFAULT 'unidad'::text,
    stock_actual numeric NOT NULL DEFAULT 0,
    stock_minimo numeric NOT NULL DEFAULT 0,
    costo_unitario numeric,
    proveedor_sugerido text,
    activo boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT lut_insumos_pkey PRIMARY KEY (id)
);

CREATE TABLE lut_movimientos_insumos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    insumo_id uuid NOT NULL,
    orden_id uuid,
    tipo_movimiento text NOT NULL,
    cantidad numeric NOT NULL,
    costo_unitario numeric,
    registrado_por uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT lut_movimientos_insumos_pkey PRIMARY KEY (id),
    CONSTRAINT lut_movimientos_insumos_tipo_movimiento_check CHECK ((tipo_movimiento = ANY (ARRAY['entrada'::text, 'consumo'::text, 'ajuste'::text, 'devolucion'::text, 'perdida'::text]))),
    CONSTRAINT lut_movimientos_insumos_orden_id_fkey FOREIGN KEY (orden_id) REFERENCES lut_ordenes_reparacion(id) ON DELETE SET NULL,
    CONSTRAINT lut_movimientos_insumos_insumo_id_fkey FOREIGN KEY (insumo_id) REFERENCES lut_insumos(id) ON DELETE RESTRICT
);

CREATE TABLE lut_presupuestos (
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
    aprobado_en timestamptz,
    observaciones text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT lut_presupuestos_pkey PRIMARY KEY (id),
    CONSTRAINT lut_presupuestos_estado_check CHECK ((estado = ANY (ARRAY['borrador'::text, 'enviado'::text, 'aprobado'::text, 'rechazado'::text, 'cubierto_institucion'::text]))),
    CONSTRAINT lut_presupuestos_orden_id_fkey FOREIGN KEY (orden_id) REFERENCES lut_ordenes_reparacion(id) ON DELETE CASCADE
);

CREATE TABLE lut_solicitudes_compra (
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
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT lut_solicitudes_compra_pkey PRIMARY KEY (id),
    CONSTRAINT lut_solicitudes_compra_urgencia_check CHECK ((urgencia = ANY (ARRAY['baja'::text, 'media'::text, 'alta'::text, 'critica'::text]))),
    CONSTRAINT lut_solicitudes_compra_estado_check CHECK ((estado = ANY (ARRAY['pendiente'::text, 'aprobada'::text, 'rechazada'::text, 'comprada'::text, 'cancelada'::text]))),
    CONSTRAINT lut_solicitudes_compra_orden_id_fkey FOREIGN KEY (orden_id) REFERENCES lut_ordenes_reparacion(id) ON DELETE SET NULL,
    CONSTRAINT lut_solicitudes_compra_insumo_id_fkey FOREIGN KEY (insumo_id) REFERENCES lut_insumos(id) ON DELETE SET NULL
);

-- Encrypted vault for recoverable maestro portal passwords. Plaintext is only returned by the admin-only Edge Function.
CREATE TABLE maestro_access_credentials (
    maestro_id uuid NOT NULL,
    password_ciphertext text NOT NULL,
    password_iv text NOT NULL,
    password_version integer NOT NULL DEFAULT 1,
    last_generated_at timestamptz NOT NULL DEFAULT now(),
    last_revealed_at timestamptz,
    last_revealed_by uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT maestro_access_credentials_pkey PRIMARY KEY (maestro_id),
    CONSTRAINT maestro_access_credentials_last_revealed_by_fkey FOREIGN KEY (last_revealed_by) REFERENCES profiles(id),
    CONSTRAINT maestro_access_credentials_maestro_id_fkey FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE
);

CREATE TABLE maestro_desempeno (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    maestro_id uuid,
    total_sesiones integer DEFAULT 0,
    sesiones_verde integer DEFAULT 0,
    sesiones_amarillo integer DEFAULT 0,
    sesiones_naranja integer DEFAULT 0,
    sesiones_rojo integer DEFAULT 0,
    categoria text DEFAULT 'responsable'::text,
    fecha_ultima_evaluacion timestamptz,
    tendencia text DEFAULT 'estable'::text,
    pending_count integer DEFAULT 0,
    oldest_dias_atraso integer DEFAULT 0,
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT maestro_desempeno_pkey PRIMARY KEY (id),
    CONSTRAINT maestro_desempeno_maestro_id_key UNIQUE (maestro_id),
    CONSTRAINT maestro_desempeno_tendencia_check CHECK ((tendencia = ANY (ARRAY['mejorando'::text, 'estable'::text, 'empeorando'::text]))),
    CONSTRAINT maestro_desempeno_categoria_check CHECK ((categoria = ANY (ARRAY['responsable'::text, 'regular'::text, 'incumplidor'::text, 'negligente'::text]))),
    CONSTRAINT maestro_desempeno_maestro_id_fkey FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE
);

CREATE TABLE maestro_retiros (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    maestro_id uuid NOT NULL,
    reemplazo_maestro_id uuid,
    retirado_por uuid,
    motivo text,
    resumen_dependencias jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT maestro_retiros_pkey PRIMARY KEY (id),
    CONSTRAINT maestro_retiros_reemplazo_maestro_id_fkey FOREIGN KEY (reemplazo_maestro_id) REFERENCES maestros(id) ON DELETE SET NULL,
    CONSTRAINT maestro_retiros_retirado_por_fkey FOREIGN KEY (retirado_por) REFERENCES profiles(id) ON DELETE SET NULL,
    CONSTRAINT maestro_retiros_maestro_id_fkey FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE RESTRICT
);

CREATE TABLE maestro_tareas (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    maestro_id uuid NOT NULL,
    alumno_id uuid,
    sesion_id uuid,
    tarea text NOT NULL,
    fecha_recordatorio date,
    completada boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT maestro_tareas_pkey PRIMARY KEY (id),
    CONSTRAINT maestro_tareas_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
    CONSTRAINT maestro_tareas_sesion_id_fkey FOREIGN KEY (sesion_id) REFERENCES sesiones_clase(id) ON DELETE SET NULL
);

-- -- DEPRECATED: plantillas legacy en evaluación 2026-09 (Owner: ACM)
CREATE TABLE mapa_plantillas (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    instrumento text NOT NULL,
    descripcion text,
    route_version_id uuid NOT NULL,
    level_id uuid NOT NULL,
    activo boolean NOT NULL DEFAULT true,
    publicada_por uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT mapa_plantillas_pkey PRIMARY KEY (id),
    CONSTRAINT mapa_plantillas_route_version_id_level_id_key UNIQUE (route_version_id, level_id),
    CONSTRAINT mapa_plantillas_route_version_id_fkey FOREIGN KEY (route_version_id) REFERENCES route_versions(id) ON DELETE RESTRICT,
    CONSTRAINT mapa_plantillas_publicada_por_fkey FOREIGN KEY (publicada_por) REFERENCES maestros(id),
    CONSTRAINT mapa_plantillas_level_id_fkey FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE
);

-- -- DEPRECATED: conservada por integridad referencial desde tareas_institucionales 2026-09 (Owner: DIR)
CREATE TABLE minutas (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    titulo text NOT NULL,
    fecha_reunion date NOT NULL,
    participantes jsonb NOT NULL DEFAULT '[]'::jsonb,
    puntos_tratados jsonb NOT NULL DEFAULT '[]'::jsonb,
    acuerdos jsonb NOT NULL DEFAULT '[]'::jsonb,
    responsables jsonb DEFAULT '[]'::jsonb,
    fecha_proxima_reunion date,
    visibilidad minuta_visibilidad NOT NULL DEFAULT 'todos'::minuta_visibilidad,
    creado_por uuid,
    archivo_adjunto_url text,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT minutas_pkey PRIMARY KEY (id),
    CONSTRAINT minutas_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE node_resources (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    node_id uuid NOT NULL,
    resource_type text NOT NULL,
    title text NOT NULL,
    url text,
    content text,
    order_index integer NOT NULL DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT node_resources_pkey PRIMARY KEY (id),
    CONSTRAINT node_resources_resource_type_check CHECK ((resource_type = ANY (ARRAY['video'::text, 'pdf'::text, 'exercise_text'::text, 'link'::text]))),
    CONSTRAINT node_resources_node_id_fkey FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

CREATE TABLE notificaciones_asistencia (
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
    fecha_creacion timestamptz DEFAULT now(),
    fecha_programada timestamptz,
    fecha_envio timestamptz,
    fecha_respuesta timestamptz,
    respuesta text,
    respuesta_hora timestamptz,
    datos_extra jsonb,
    intentos_envio integer DEFAULT 0,
    error_ultimo jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT notificaciones_asistencia_pkey PRIMARY KEY (id),
    CONSTRAINT notificaciones_asistencia_estado_check CHECK ((estado = ANY (ARRAY['pendiente'::text, 'enviado'::text, 'fallido'::text, 'entregado'::text, 'leido'::text]))),
    CONSTRAINT notificaciones_asistencia_canal_check CHECK ((canal = ANY (ARRAY['whatsapp'::text, 'email'::text, 'ambos'::text]))),
    CONSTRAINT notificaciones_asistencia_prioridad_check CHECK ((prioridad = ANY (ARRAY['baja'::text, 'normal'::text, 'alta'::text, 'urgente'::text]))),
    CONSTRAINT notificaciones_asistencia_tipo_check CHECK ((tipo = ANY (ARRAY['alerta_asistencia_alumno'::text, 'recordatorio_asistencia_maestro'::text, 'reporte_asistencia_semanal'::text])))
);

CREATE TABLE notificaciones_caja (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    familia_id uuid,
    representante_id uuid,
    alumno_id uuid,
    tipo notif_tipo NOT NULL,
    canal notif_canal NOT NULL DEFAULT 'ambos'::notif_canal,
    prioridad notif_prioridad NOT NULL DEFAULT 'media'::notif_prioridad,
    titulo text NOT NULL,
    cuerpo text NOT NULL,
    datos_extra jsonb DEFAULT '{}'::jsonb,
    estado_whatsapp notif_estado_wa NOT NULL DEFAULT 'pendiente'::notif_estado_wa,
    estado_portal notif_estado_portal NOT NULL DEFAULT 'no_leida'::notif_estado_portal,
    respuesta_padre text,
    fecha_respuesta timestamptz,
    fecha_programada timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT notificaciones_caja_pkey PRIMARY KEY (id),
    CONSTRAINT notificaciones_caja_familia_id_fkey FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT,
    CONSTRAINT notificaciones_caja_representante_id_fkey FOREIGN KEY (representante_id) REFERENCES representantes(id) ON DELETE SET NULL,
    CONSTRAINT notificaciones_caja_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL
);

CREATE TABLE notification_trigger_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    execution_time timestamp DEFAULT now(),
    status text NOT NULL,
    maestros_processed integer,
    notifications_created integer,
    errors_count integer,
    error_message text,
    context text,
    created_at timestamp DEFAULT now(),
    CONSTRAINT notification_trigger_logs_pkey PRIMARY KEY (id)
);

CREATE TABLE observaciones_alumnos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    alumno_id uuid NOT NULL,
    maestro_id uuid,
    clase_id uuid,
    sesion_clase_id uuid,
    tipo text DEFAULT 'academica'::text,
    observacion text NOT NULL,
    requiere_seguimiento boolean DEFAULT false,
    fecha date DEFAULT CURRENT_DATE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    titulo text,
    descripcion text,
    prioridad text NOT NULL DEFAULT 'media'::text,
    estado text NOT NULL DEFAULT 'abierta'::text,
    fecha_observacion date,
    seguimiento_fecha date,
    seguimiento_observacion text,
    CONSTRAINT observaciones_alumnos_pkey PRIMARY KEY (id),
    CONSTRAINT observaciones_alumnos_tipo_check CHECK ((tipo = ANY (ARRAY['academica'::text, 'conductual'::text, 'asistencia'::text, 'tecnica'::text, 'motivacional'::text, 'administrativa'::text, 'otra'::text]))),
    CONSTRAINT fk_observaciones_alumnos_alumno FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
    CONSTRAINT fk_observaciones_alumnos_maestro FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE SET NULL,
    CONSTRAINT fk_observaciones_alumnos_sesion FOREIGN KEY (sesion_clase_id) REFERENCES sesiones_clase(id) ON DELETE SET NULL,
    CONSTRAINT fk_observaciones_alumnos_clase FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE SET NULL
);

-- Raw DSL observations per session. es_borrador=true for auto-drafts, false for confirmed saves.
CREATE TABLE observaciones_sesion (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    sesion_id uuid NOT NULL,
    maestro_id uuid NOT NULL,
    contenido_raw text NOT NULL DEFAULT ''::text,
    contenido_parsed jsonb,
    es_borrador boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    contenido_ia_dsl text,
    first_note_at timestamptz,
    last_note_at timestamptz,
    ai_fill_at timestamptz,
    CONSTRAINT observaciones_sesion_pkey PRIMARY KEY (id),
    CONSTRAINT observaciones_sesion_maestro_id_fkey FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE,
    CONSTRAINT observaciones_sesion_sesion_id_fkey FOREIGN KEY (sesion_id) REFERENCES sesiones_clase(id) ON DELETE CASCADE
);

-- Registro de pagos por alumno. periodo_mes es el mes cubierto, no la fecha de pago.
CREATE TABLE pagos_alumnos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    alumno_id uuid NOT NULL,
    monto numeric NOT NULL,
    concepto varchar NOT NULL,
    periodo_mes date NOT NULL,
    fecha_pago date NOT NULL DEFAULT CURRENT_DATE,
    metodo_pago varchar NOT NULL,
    referencia_transaccion varchar,
    registrado_por uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT pagos_alumnos_pkey PRIMARY KEY (id),
    CONSTRAINT pagos_alumnos_concepto_check CHECK (((concepto)::text = ANY ((ARRAY['mensualidad'::character varying, 'inscripcion'::character varying, 'uniforme'::character varying, 'otro'::character varying])::text[]))),
    CONSTRAINT pagos_alumnos_metodo_pago_check CHECK (((metodo_pago)::text = ANY ((ARRAY['efectivo'::character varying, 'transferencia'::character varying, 'deposito'::character varying, 'beca'::character varying])::text[]))),
    CONSTRAINT pagos_alumnos_monto_check CHECK ((monto > (0)::numeric)),
    CONSTRAINT pagos_alumnos_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE RESTRICT,
    CONSTRAINT pagos_alumnos_registrado_por_fkey FOREIGN KEY (registrado_por) REFERENCES auth.users(id)
);

CREATE TABLE patrocinantes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    tipo patrocinante_tipo NOT NULL DEFAULT 'persona'::patrocinante_tipo,
    contacto text,
    email text,
    telefono text,
    activo boolean DEFAULT true,
    notas text,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT patrocinantes_pkey PRIMARY KEY (id)
);

CREATE TABLE patrocinios (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    patrocinante_id uuid NOT NULL,
    alumno_id uuid NOT NULL,
    familia_id uuid NOT NULL,
    cubre patrocinio_cubre NOT NULL DEFAULT 'todo'::patrocinio_cubre,
    monto_mensual_centavos bigint,
    activo boolean DEFAULT true,
    fecha_inicio date NOT NULL DEFAULT CURRENT_DATE,
    fecha_fin date,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT patrocinios_pkey PRIMARY KEY (id),
    CONSTRAINT patrocinios_familia_id_fkey FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT,
    CONSTRAINT patrocinios_patrocinante_id_fkey FOREIGN KEY (patrocinante_id) REFERENCES patrocinantes(id) ON DELETE RESTRICT,
    CONSTRAINT patrocinios_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE RESTRICT
);

-- Dias no lectivos dentro de un periodo academico. periodo_id NULL = excepcion global (feriado nacional).
CREATE TABLE periodo_excepciones (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    periodo_id uuid,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    motivo text NOT NULL,
    tipo text NOT NULL DEFAULT 'feriado'::text,
    creado_por uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT periodo_excepciones_pkey PRIMARY KEY (id),
    CONSTRAINT periodo_excepciones_tipo_check CHECK ((tipo = ANY (ARRAY['feriado'::text, 'receso'::text, 'suspension'::text, 'institucional'::text, 'otro'::text]))),
    CONSTRAINT periodo_excepciones_rango_chk CHECK ((fecha_fin >= fecha_inicio)),
    CONSTRAINT periodo_excepciones_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE CASCADE,
    CONSTRAINT periodo_excepciones_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE TABLE periodos_cierre_auditoria (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    periodo_id uuid NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    cerrado_por uuid,
    observaciones text,
    resumen jsonb NOT NULL DEFAULT '{}'::jsonb,
    snapshot jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT periodos_cierre_auditoria_pkey PRIMARY KEY (id),
    CONSTRAINT periodos_cierre_auditoria_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE CASCADE
);

CREATE TABLE permisos_maestros (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    maestro_id uuid NOT NULL,
    puede_registrar_alumnos boolean DEFAULT false,
    puede_inscribir_clases boolean DEFAULT false,
    concedido_por uuid,
    creado_en timestamptz DEFAULT now(),
    actualizado_en timestamptz DEFAULT now(),
    permisos text[] NOT NULL DEFAULT '{}'::text[],
    solicitudes text[] NOT NULL DEFAULT '{}'::text[],
    fecha_inicio date NOT NULL DEFAULT CURRENT_DATE,
    fecha_fin date,
    puede_crear_clases boolean DEFAULT false,
    puede_planificar boolean DEFAULT true,
    puede_asistir boolean DEFAULT true,
    CONSTRAINT permisos_maestros_pkey PRIMARY KEY (id),
    CONSTRAINT permisos_maestros_maestro_id_key UNIQUE (maestro_id),
    CONSTRAINT permisos_maestros_concedido_por_fkey FOREIGN KEY (concedido_por) REFERENCES auth.users(id),
    CONSTRAINT permisos_maestros_maestro_id_fkey FOREIGN KEY (maestro_id) REFERENCES maestros(id)
);

-- DEPRECATED: usar routes/route_versions/blocks/levels/nodes/indicators
CREATE TABLE plan_clases (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now(),
    nombre text NOT NULL,
    descripcion text,
    activo boolean DEFAULT true,
    maestro_id uuid,
    clase_id uuid,
    CONSTRAINT plan_clases_pkey PRIMARY KEY (id),
    CONSTRAINT plan_clases_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE SET NULL,
    CONSTRAINT plan_clases_maestro_id_fkey FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE
);

-- DEPRECATED: usar levels
CREATE TABLE plan_niveles (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    clase_id uuid,
    nombre text NOT NULL,
    numero_nivel integer NOT NULL,
    objetivo_general text,
    orden_index integer DEFAULT 0,
    CONSTRAINT plan_niveles_pkey PRIMARY KEY (id),
    CONSTRAINT plan_niveles_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES plan_clases(id) ON DELETE CASCADE
);

-- DEPRECATED: usar nodes
CREATE TABLE plan_temas (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    nivel_id uuid,
    nombre text NOT NULL,
    tipo text DEFAULT 'TECNICA'::text,
    es_critico boolean DEFAULT false,
    orden_index integer DEFAULT 0,
    CONSTRAINT plan_temas_pkey PRIMARY KEY (id),
    CONSTRAINT plan_temas_nivel_id_fkey FOREIGN KEY (nivel_id) REFERENCES plan_niveles(id) ON DELETE CASCADE
);

-- DEPRECATED: usar indicators
CREATE TABLE plan_objetivos (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    tema_id uuid,
    nombre text NOT NULL,
    orden_index integer DEFAULT 0,
    CONSTRAINT plan_objetivos_pkey PRIMARY KEY (id),
    CONSTRAINT plan_objetivos_tema_id_fkey FOREIGN KEY (tema_id) REFERENCES plan_temas(id) ON DELETE CASCADE
);

-- DEPRECATED: usar indicators
CREATE TABLE plan_indicadores (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    objetivo_id uuid,
    descripcion text NOT NULL,
    es_requerido boolean DEFAULT true,
    orden_index integer DEFAULT 0,
    CONSTRAINT plan_indicadores_pkey PRIMARY KEY (id),
    CONSTRAINT plan_indicadores_objetivo_id_fkey FOREIGN KEY (objetivo_id) REFERENCES plan_objetivos(id) ON DELETE CASCADE
);

-- Teachers' daily planning of content to cover in each class session
CREATE TABLE planned_content (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    maestro_id uuid NOT NULL,
    clase_id uuid NOT NULL,
    node_id uuid NOT NULL,
    planned_date date DEFAULT CURRENT_DATE,
    covered boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT planned_content_pkey PRIMARY KEY (id),
    CONSTRAINT planned_content_maestro_id_clase_id_node_id_planned_date_key UNIQUE (maestro_id, clase_id, node_id, planned_date),
    CONSTRAINT planned_content_maestro_id_fkey FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE,
    CONSTRAINT planned_content_node_id_fkey FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE,
    CONSTRAINT planned_content_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE
);

CREATE TABLE planning_documents (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    maestro_id uuid NOT NULL,
    clase_id uuid,
    title text NOT NULL,
    file_name text NOT NULL,
    file_url text NOT NULL,
    file_type text,
    file_size bigint,
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT planning_documents_pkey PRIMARY KEY (id),
    CONSTRAINT planning_documents_maestro_id_fkey FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE,
    CONSTRAINT planning_documents_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE SET NULL
);

-- DEPRECATED: reemplazada por mapa_plantillas para el mapa gamificado
CREATE TABLE plantillas_planificacion (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    objetivos text,
    contenido text,
    recursos text,
    evaluacion_metodo text,
    activo boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    clase_id uuid,
    CONSTRAINT plantillas_planificacion_pkey PRIMARY KEY (id),
    CONSTRAINT plantillas_planificacion_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE SET NULL
);

CREATE TABLE portal_catalog (
    portal_id text NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    ruta text NOT NULL,
    icono text DEFAULT 'bi-door-open'::text,
    roles_default text[] DEFAULT '{}'::text[],
    activo boolean NOT NULL DEFAULT true,
    orden integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    is_active boolean DEFAULT true,
    CONSTRAINT portal_catalog_pkey PRIMARY KEY (portal_id)
);

-- Flujo académico: qué programa exige haber cursado otro (selección, audición o recomendación del maestro)
CREATE TABLE programas_prerrequisitos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    programa_id uuid NOT NULL,
    prerequisito_id uuid NOT NULL,
    tipo text NOT NULL DEFAULT 'seleccion'::text,
    nota_minima numeric,
    notas text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT programas_prerrequisitos_pkey PRIMARY KEY (id),
    CONSTRAINT programas_prerrequisitos_programa_id_prerequisito_id_key UNIQUE (programa_id, prerequisito_id),
    CONSTRAINT programas_prerrequisitos_tipo_check CHECK ((tipo = ANY (ARRAY['seleccion'::text, 'audicion'::text, 'recomendacion'::text]))),
    CONSTRAINT programas_prerrequisitos_nota_minima_check CHECK (((nota_minima >= (0)::numeric) AND (nota_minima <= (100)::numeric))),
    CONSTRAINT programas_prerrequisitos_prerequisito_id_fkey FOREIGN KEY (prerequisito_id) REFERENCES programas(id) ON DELETE CASCADE,
    CONSTRAINT programas_prerrequisitos_programa_id_fkey FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE CASCADE
);

CREATE TABLE progresos (
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
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    periodo_id uuid,
    contenido_dsl text,
    objetivo_id uuid,
    CONSTRAINT progresos_pkey PRIMARY KEY (id),
    CONSTRAINT progresos_upsert_key UNIQUE (alumno_id, clase_id, sesion_clase_id, contenido_dsl),
    CONSTRAINT progresos_evaluacion_tipo_check CHECK ((evaluacion_tipo = ANY (ARRAY['clase'::text, 'ejercicio'::text, 'audicion'::text, 'recital'::text, 'examen'::text, 'observacion'::text, 'otro'::text]))),
    CONSTRAINT progresos_calificacion_check CHECK (((calificacion IS NULL) OR ((calificacion >= (0)::numeric) AND (calificacion <= (10)::numeric)))),
    CONSTRAINT fk_progresos_sesion FOREIGN KEY (sesion_clase_id) REFERENCES sesiones_clase(id) ON DELETE SET NULL,
    CONSTRAINT fk_progresos_asistencia FOREIGN KEY (asistencia_id) REFERENCES asistencias(id) ON DELETE SET NULL,
    CONSTRAINT fk_progresos_ejercicio FOREIGN KEY (ejercicio_id) REFERENCES ejercicios(id) ON DELETE SET NULL,
    CONSTRAINT fk_progresos_clase FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE,
    CONSTRAINT fk_progresos_alumno FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
    CONSTRAINT fk_progresos_maestro FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE SET NULL,
    CONSTRAINT progresos_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES periodos(id),
    CONSTRAINT progresos_objetivo_id_fkey FOREIGN KEY (objetivo_id) REFERENCES plan_objetivos(id)
);

-- -- DEPRECATED: infraestructura base para Hermes en reserva 2026-09 (Owner: DIR/HERMES)
CREATE TABLE protocolos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    tipo text NOT NULL,
    descripcion text,
    tareas jsonb DEFAULT '[]'::jsonb,
    activo boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT protocolos_pkey PRIMARY KEY (id),
    CONSTRAINT protocolos_nombre_key UNIQUE (nombre)
);

CREATE TABLE pulso_score_history (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    score numeric NOT NULL,
    nivel text NOT NULL,
    asistencia_pct numeric NOT NULL DEFAULT 100.00,
    tareas_tiempo_pct numeric NOT NULL DEFAULT 100.00,
    cobertura_registro_pct numeric NOT NULL DEFAULT 100.00,
    penalizacion_vencidas_pct numeric NOT NULL DEFAULT 100.00,
    metricas_detalle jsonb NOT NULL DEFAULT '{}'::jsonb,
    calculado_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT pulso_score_history_pkey PRIMARY KEY (id),
    CONSTRAINT pulso_score_history_nivel_check CHECK ((nivel = ANY (ARRAY['optimo'::text, 'atencion'::text, 'critico'::text])))
);

CREATE TABLE push_subscriptions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    profile_id uuid NOT NULL,
    endpoint text NOT NULL,
    p256dh text NOT NULL,
    auth text NOT NULL,
    user_agent text,
    activo boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id),
    CONSTRAINT push_subscriptions_endpoint_key UNIQUE (endpoint),
    CONSTRAINT fk_push_subscriptions_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- -- DEPRECATED: gamificación pedagógica en pausa 2026-09 (Owner: ACM)
CREATE TABLE rachas (
    alumno_id uuid NOT NULL,
    racha_actual integer DEFAULT 0,
    racha_maxima integer DEFAULT 0,
    ultima_fecha_activa date,
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT rachas_pkey PRIMARY KEY (alumno_id),
    CONSTRAINT rachas_racha_actual_check CHECK ((racha_actual >= 0)),
    CONSTRAINT rachas_racha_maxima_check CHECK ((racha_maxima >= 0)),
    CONSTRAINT fk_rachas_alumno FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE
);

CREATE TABLE sections (
    id text NOT NULL,
    family text NOT NULL,
    default_day text NOT NULL,
    order_index integer NOT NULL DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT sections_pkey PRIMARY KEY (id)
);

CREATE TABLE repertoire_items (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    section text NOT NULL,
    title text NOT NULL,
    type text NOT NULL DEFAULT 'obra'::text,
    tempo_indication text DEFAULT ''::text,
    key_signature text DEFAULT ''::text,
    is_active boolean DEFAULT true,
    order_index integer NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT repertoire_items_pkey PRIMARY KEY (id),
    CONSTRAINT repertoire_items_section_title_type_key UNIQUE (section, title, type),
    CONSTRAINT repertoire_items_section_fkey FOREIGN KEY (section) REFERENCES sections(id) ON DELETE CASCADE
);

-- Retención temporal del instrumento de un alumno por ausentismo acumulado (nivel 3). Independiente del inventario instrumentos: instrumento_texto sirve cuando no hay fila formal. fecha_reincorporacion reinicia el contador de ausencias del alumno para el período.
CREATE TABLE retenciones_instrumento (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    alumno_id uuid NOT NULL,
    instrumento_id uuid,
    instrumento_texto text,
    motivo text NOT NULL DEFAULT 'ausentismo_acumulado'::text,
    estado text NOT NULL DEFAULT 'retenido'::text,
    retenido_por uuid DEFAULT auth.uid(),
    retenido_en timestamptz NOT NULL DEFAULT now(),
    maestro_notificado_en timestamptz,
    maestro_confirmo_recogida_en timestamptz,
    acta_firmada_en timestamptz,
    fecha_reincorporacion timestamptz,
    levantada_por uuid,
    levantada_en timestamptz,
    notas text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT retenciones_instrumento_pkey PRIMARY KEY (id),
    CONSTRAINT retenciones_instrumento_estado_check CHECK ((estado = ANY (ARRAY['retenido'::text, 'levantada'::text]))),
    CONSTRAINT retenciones_instrumento_instrumento_id_fkey FOREIGN KEY (instrumento_id) REFERENCES instrumentos(id) ON DELETE SET NULL,
    CONSTRAINT retenciones_instrumento_levantada_por_fkey FOREIGN KEY (levantada_por) REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT retenciones_instrumento_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
    CONSTRAINT retenciones_instrumento_retenido_por_fkey FOREIGN KEY (retenido_por) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- -- DEPRECATED: motor algorítmico de horarios pausado 2026-09 (Owner: ACM)
CREATE TABLE schedule_runs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    periodo text,
    config jsonb,
    resultado jsonb,
    metricas jsonb,
    estado text NOT NULL DEFAULT 'borrador'::text,
    applied_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT schedule_runs_pkey PRIMARY KEY (id),
    CONSTRAINT schedule_runs_estado_check CHECK ((estado = ANY (ARRAY['borrador'::text, 'revision'::text, 'publicado'::text, 'aplicado'::text])))
);

-- -- DEPRECATED: telemetría de horarios pausada 2026-09 (Owner: ACM)
CREATE TABLE schedule_run_feedback (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    run_id uuid NOT NULL,
    usuario_id uuid NOT NULL,
    comentario text NOT NULL,
    tipo text NOT NULL DEFAULT 'observacion'::text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT schedule_run_feedback_pkey PRIMARY KEY (id),
    CONSTRAINT schedule_run_feedback_tipo_check CHECK ((tipo = ANY (ARRAY['observacion'::text, 'aprobacion'::text, 'rechazo'::text]))),
    CONSTRAINT schedule_run_feedback_run_id_fkey FOREIGN KEY (run_id) REFERENCES schedule_runs(id) ON DELETE CASCADE,
    CONSTRAINT schedule_run_feedback_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE score_compromiso (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    representante_id uuid NOT NULL,
    familia_id uuid NOT NULL,
    score numeric NOT NULL,
    nivel char NOT NULL,
    puntualidad_pct numeric,
    consistencia_meses integer,
    voluntad_pago_pct numeric,
    comportamiento_mora_pct numeric,
    generosidad_pct numeric,
    calculado_en timestamptz DEFAULT now(),
    ciclo_mes integer NOT NULL,
    ciclo_anio integer NOT NULL,
    CONSTRAINT score_compromiso_pkey PRIMARY KEY (id),
    CONSTRAINT score_compromiso_representante_id_ciclo_mes_ciclo_anio_key UNIQUE (representante_id, ciclo_mes, ciclo_anio),
    CONSTRAINT score_compromiso_nivel_check CHECK ((nivel = ANY (ARRAY['A'::bpchar, 'B'::bpchar, 'C'::bpchar, 'D'::bpchar, 'E'::bpchar]))),
    CONSTRAINT score_compromiso_score_check CHECK (((score >= (0)::numeric) AND (score <= (100)::numeric))),
    CONSTRAINT score_compromiso_familia_id_fkey FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT,
    CONSTRAINT score_compromiso_representante_id_fkey FOREIGN KEY (representante_id) REFERENCES representantes(id) ON DELETE RESTRICT
);

CREATE TABLE seguimiento_ausencias_reinicio (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    alumno_id uuid NOT NULL,
    fecha_corte timestamptz NOT NULL DEFAULT now(),
    motivo text,
    creado_por uuid DEFAULT auth.uid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT seguimiento_ausencias_reinicio_pkey PRIMARY KEY (id),
    CONSTRAINT seguimiento_ausencias_reinicio_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
    CONSTRAINT seguimiento_ausencias_reinicio_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE seguimiento_reglas (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    tipo text NOT NULL,
    descripcion text,
    config jsonb NOT NULL DEFAULT '{}'::jsonb,
    activo boolean DEFAULT true,
    prioridad integer DEFAULT 1,
    created_by uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT seguimiento_reglas_pkey PRIMARY KEY (id)
);

CREATE TABLE service_accounts (
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
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid DEFAULT auth.uid(),
    CONSTRAINT service_accounts_pkey PRIMARY KEY (id),
    CONSTRAINT service_accounts_connector_status_check CHECK ((connector_status = ANY (ARRAY['unconfigured'::text, 'active'::text, 'disabled'::text, 'unsupported'::text])))
);

CREATE TABLE service_account_observations (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    service_account_id uuid NOT NULL,
    observed_at timestamptz NOT NULL DEFAULT now(),
    balance_centavos bigint,
    amount_due_centavos bigint,
    due_date date,
    days_remaining integer,
    last_query_at timestamptz,
    last_success_at timestamptz,
    last_status text NOT NULL DEFAULT 'never'::text,
    last_error_code text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT service_account_observations_pkey PRIMARY KEY (id),
    CONSTRAINT service_account_observations_last_status_check CHECK ((last_status = ANY (ARRAY['never'::text, 'success'::text, 'unsupported'::text, 'skipped'::text, 'error'::text]))),
    CONSTRAINT service_account_observations_service_account_id_fkey FOREIGN KEY (service_account_id) REFERENCES service_accounts(id) ON DELETE CASCADE
);

-- Registro de pantallas de señalética. layout = jsonb con proporciones y ajustes de zona. Escrita por el portal Admin (es_admin), leída por la SPA de la Raspberry.
CREATE TABLE signage_pantallas (
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
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    institucion text,
    siglas text,
    menu_portales text[] NOT NULL DEFAULT '{}'::text[],
    logo_path text,
    CONSTRAINT signage_pantallas_pkey PRIMARY KEY (id),
    CONSTRAINT signage_pantallas_slug_key UNIQUE (slug),
    CONSTRAINT signage_pantallas_orientacion_check CHECK ((orientacion = ANY (ARRAY['horizontal'::text, 'vertical'::text])))
);

-- Playlist declarativa de la señalética (intención). El caché físico de YouTube y su estado de descarga viven en la Raspberry, no aquí.
CREATE TABLE signage_media (
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
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    contenido jsonb,
    CONSTRAINT signage_media_pkey PRIMARY KEY (id),
    CONSTRAINT signage_media_tipo_check CHECK ((tipo = ANY (ARRAY['imagen'::text, 'video'::text, 'youtube'::text, 'slide'::text]))),
    CONSTRAINT signage_media_fuente_chk CHECK ((((tipo = 'youtube'::text) AND (youtube_url IS NOT NULL)) OR ((tipo = ANY (ARRAY['imagen'::text, 'video'::text])) AND (storage_path IS NOT NULL)) OR ((tipo = 'slide'::text) AND (contenido IS NOT NULL)))),
    CONSTRAINT signage_media_pantalla_id_fkey FOREIGN KEY (pantalla_id) REFERENCES signage_pantallas(id) ON DELETE CASCADE
);

CREATE TABLE sim_runs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    nombre text NOT NULL DEFAULT 'Simulación sin nombre'::text,
    estado sim_run_estado NOT NULL DEFAULT 'creado'::sim_run_estado,
    velocidad integer NOT NULL DEFAULT 10,
    fecha_inicio_virtual timestamptz NOT NULL,
    fecha_fin_virtual timestamptz,
    fecha_actual_virtual timestamptz,
    creado_por uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT sim_runs_pkey PRIMARY KEY (id),
    CONSTRAINT sim_runs_velocidad_check CHECK ((velocidad > 0)),
    CONSTRAINT sim_runs_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Datos 100% FICTICIOS para el sandbox del simulador (postulantes, alumnos, maestros, representantes). Nunca referencia entidades reales de producción.
CREATE TABLE sim_actores (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    run_id uuid NOT NULL,
    tipo sim_actor_tipo NOT NULL,
    nombre_ficticio text NOT NULL,
    instrumento text,
    estado_pago sim_estado_pago NOT NULL DEFAULT 'no_aplica'::sim_estado_pago,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT sim_actores_pkey PRIMARY KEY (id),
    CONSTRAINT sim_actores_run_id_fkey FOREIGN KEY (run_id) REFERENCES sim_runs(id) ON DELETE CASCADE
);

-- Espejo aislado de calendario_institucional para el sandbox del simulador. Nunca se referencia desde triggers de producción.
CREATE TABLE sim_calendario (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    run_id uuid NOT NULL,
    titulo text NOT NULL,
    descripcion text,
    categoria event_categoria NOT NULL DEFAULT 'otro'::event_categoria,
    fecha_inicio timestamptz NOT NULL,
    fecha_fin timestamptz NOT NULL,
    ubicacion text,
    departamento_responsable soi_departamento NOT NULL DEFAULT 'DIR'::soi_departamento,
    metadata jsonb DEFAULT '{}'::jsonb,
    estado text NOT NULL DEFAULT 'programado'::text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT sim_calendario_pkey PRIMARY KEY (id),
    CONSTRAINT sim_calendario_estado_check CHECK ((estado = ANY (ARRAY['programado'::text, 'en_curso'::text, 'completado'::text, 'cancelado'::text]))),
    CONSTRAINT sim_calendario_run_id_fkey FOREIGN KEY (run_id) REFERENCES sim_runs(id) ON DELETE CASCADE
);

-- Whitelist server-side inviolable de destinos de envío (spec: simulador-salida-segura / Whitelist server-side inviolable). Un registro por canal.
CREATE TABLE sim_config (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    canal sim_canal NOT NULL,
    destino text NOT NULL,
    proveedor_llm text NOT NULL DEFAULT 'groq'::text,
    activo boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT sim_config_pkey PRIMARY KEY (id),
    CONSTRAINT sim_config_canal_key UNIQUE (canal),
    CONSTRAINT sim_config_proveedor_llm_check CHECK ((proveedor_llm = ANY (ARRAY['groq'::text, 'openrouter'::text])))
);

-- Auditoría append-only de cada acción de agente. Base para la animación en tiempo real vía Supabase Realtime (ver RLS: SELECT abierto a authenticated).
CREATE TABLE sim_log (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    run_id uuid NOT NULL,
    fecha_simulada timestamptz NOT NULL,
    departamento soi_departamento NOT NULL,
    agente text NOT NULL,
    accion text NOT NULL,
    evento_id uuid,
    payload jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT sim_log_pkey PRIMARY KEY (id),
    CONSTRAINT sim_log_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES sim_calendario(id) ON DELETE SET NULL,
    CONSTRAINT sim_log_run_id_fkey FOREIGN KEY (run_id) REFERENCES sim_runs(id) ON DELETE CASCADE
);

CREATE TABLE sim_outbox (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    run_id uuid NOT NULL,
    canal sim_canal NOT NULL,
    destinatario_original text NOT NULL,
    destinatario_redirigido text NOT NULL,
    asunto text,
    mensaje text NOT NULL,
    estado sim_outbox_estado NOT NULL DEFAULT 'pendiente'::sim_outbox_estado,
    error_msg text,
    created_at timestamptz DEFAULT now(),
    procesado_at timestamptz,
    CONSTRAINT sim_outbox_pkey PRIMARY KEY (id),
    CONSTRAINT sim_outbox_run_id_fkey FOREIGN KEY (run_id) REFERENCES sim_runs(id) ON DELETE CASCADE
);

-- Espejo aislado de tareas_institucionales para el sandbox del simulador.
CREATE TABLE sim_tareas (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    run_id uuid NOT NULL,
    event_id uuid,
    titulo text NOT NULL,
    descripcion text,
    departamento soi_departamento NOT NULL DEFAULT 'DIR'::soi_departamento,
    asignado_a text,
    estado tarea_institucional_estado NOT NULL DEFAULT 'pendiente'::tarea_institucional_estado,
    prioridad tarea_institucional_prioridad NOT NULL DEFAULT 'media'::tarea_institucional_prioridad,
    fecha_vencimiento date,
    checklist jsonb DEFAULT '[]'::jsonb,
    feedback text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT sim_tareas_pkey PRIMARY KEY (id),
    CONSTRAINT sim_tareas_run_id_fkey FOREIGN KEY (run_id) REFERENCES sim_runs(id) ON DELETE CASCADE,
    CONSTRAINT sim_tareas_event_id_fkey FOREIGN KEY (event_id) REFERENCES sim_calendario(id) ON DELETE CASCADE
);

CREATE TABLE soi_analisis_semanal (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    periodo_inicio timestamptz NOT NULL,
    periodo_fin timestamptz NOT NULL,
    total_eventos_analizados integer NOT NULL DEFAULT 0,
    resumen_ejecutivo text NOT NULL,
    patrones jsonb NOT NULL DEFAULT '[]'::jsonb,
    tendencias jsonb NOT NULL DEFAULT '[]'::jsonb,
    recomendaciones jsonb NOT NULL DEFAULT '[]'::jsonb,
    score_promedio numeric,
    modelo_usado text DEFAULT 'llama-3.3-70b-versatile'::text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT soi_analisis_semanal_pkey PRIMARY KEY (id)
);

-- Bus de eventos interno. Solo service_role: sin politica para authenticated, el cliente no accede.
CREATE TABLE soi_event_bus (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    tipo text NOT NULL,
    origen text NOT NULL,
    payload jsonb NOT NULL,
    procesado boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT soi_event_bus_pkey PRIMARY KEY (id)
);

CREATE TABLE soi_eventos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    tipo text NOT NULL,
    entidad_tipo text NOT NULL,
    entidad_id uuid,
    actor_id uuid,
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    correlation_id uuid,
    procesado boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT soi_eventos_pkey PRIMARY KEY (id),
    CONSTRAINT check_soi_eventos_tipo CHECK ((tipo = ANY (ARRAY['sesion.creada'::text, 'sesion.completada'::text, 'sesion.cancelada'::text, 'asistencia.registrada'::text, 'asistencia.falta_injustificada'::text, 'asistencia.falta_justificada'::text, 'tarea.creada'::text, 'tarea.completada'::text, 'tarea.escalada'::text, 'tarea.vencida'::text, 'justificacion.solicitada'::text, 'justificacion.aprobada'::text, 'justificacion.rechazada'::text, 'periodo.abierto'::text, 'periodo.cerrado'::text])))
);

CREATE TABLE soi_rule_effectiveness (
    rule_type text NOT NULL,
    nombre text NOT NULL,
    total_activaciones integer NOT NULL DEFAULT 0,
    casos_resueltos integer NOT NULL DEFAULT 0,
    tasa_exito numeric NOT NULL DEFAULT 100.00,
    tiempo_promedio_horas numeric DEFAULT 0.00,
    ultima_activacion timestamptz,
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT soi_rule_effectiveness_pkey PRIMARY KEY (rule_type)
);

CREATE TABLE solicitudes_ausencia (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    maestro_id uuid NOT NULL,
    fecha_ausencia date NOT NULL,
    motivo text,
    contenido_reemplazo text,
    suplente_id uuid,
    dinamica_trabajo text,
    estado text DEFAULT 'pendiente'::text,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT solicitudes_ausencia_pkey PRIMARY KEY (id),
    CONSTRAINT solicitudes_ausencia_estado_check CHECK ((estado = ANY (ARRAY['pendiente'::text, 'aprobada'::text, 'rechazada'::text])))
);

CREATE TABLE solicitudes_necesidades (
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
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    correlation_id uuid,
    link_tienda text,
    costo_estimado numeric,
    presupuesto numeric,
    departamento_actual text,
    pre_aprobada_por uuid,
    presupuestado_por uuid,
    CONSTRAINT solicitudes_necesidades_pkey PRIMARY KEY (id),
    CONSTRAINT solicitudes_necesidades_estado_check CHECK ((estado = ANY (ARRAY['pendiente'::text, 'pre_aprobada_acm'::text, 'rechazada_acm'::text, 'en_presupuesto'::text, 'presupuestada'::text, 'aprobada'::text, 'rechazada'::text, 'comprada'::text, 'entregada'::text, 'cancelada'::text]))),
    CONSTRAINT solicitudes_necesidades_prioridad_check CHECK ((prioridad = ANY (ARRAY['baja'::text, 'media'::text, 'alta'::text, 'urgente'::text])))
);

CREATE TABLE solicitudes_permisos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    maestro_id uuid NOT NULL,
    tipos jsonb NOT NULL,
    estado text DEFAULT 'pendiente'::text,
    creado_en timestamptz DEFAULT now(),
    aprobado_en timestamptz,
    aprobado_por uuid,
    solicita_alumnos boolean DEFAULT false,
    solicita_clases boolean DEFAULT false,
    motivo_rechazo text,
    CONSTRAINT solicitudes_permisos_pkey PRIMARY KEY (id),
    CONSTRAINT solicitudes_permisos_aprobado_por_fkey FOREIGN KEY (aprobado_por) REFERENCES auth.users(id),
    CONSTRAINT solicitudes_permisos_maestro_id_fkey FOREIGN KEY (maestro_id) REFERENCES maestros(id)
);

CREATE TABLE student_cases (
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
    ultimo_contacto_en timestamptz,
    created_by uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT student_cases_pkey PRIMARY KEY (id),
    CONSTRAINT student_cases_origen_check CHECK ((origen = ANY (ARRAY['automatico'::text, 'manual'::text, 'observacion_maestro'::text, 'asistencia'::text, 'justificacion'::text, 'admin'::text]))),
    CONSTRAINT student_cases_nivel_riesgo_check CHECK ((nivel_riesgo = ANY (ARRAY['bajo'::text, 'medio'::text, 'alto'::text, 'critico'::text]))),
    CONSTRAINT student_cases_estado_check CHECK ((estado = ANY (ARRAY['abierto'::text, 'en_seguimiento'::text, 'resuelto'::text, 'escalado'::text, 'archivado'::text]))),
    CONSTRAINT student_cases_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL
);

CREATE TABLE student_case_actions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    case_id uuid NOT NULL,
    alumno_id uuid,
    tipo text NOT NULL,
    titulo text NOT NULL,
    descripcion text,
    resultado text,
    fecha_accion timestamptz DEFAULT now(),
    proxima_accion text,
    proxima_accion_fecha date,
    documento_id uuid,
    registrado_por uuid,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT student_case_actions_pkey PRIMARY KEY (id),
    CONSTRAINT student_case_actions_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL,
    CONSTRAINT student_case_actions_case_id_fkey FOREIGN KEY (case_id) REFERENCES student_cases(id) ON DELETE CASCADE
);

CREATE TABLE student_case_alerts (
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
    detectada_en timestamptz DEFAULT now(),
    revisada_por uuid,
    revisada_en timestamptz,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT student_case_alerts_pkey PRIMARY KEY (id),
    CONSTRAINT student_case_alerts_estado_check CHECK ((estado = ANY (ARRAY['pendiente'::text, 'revisada'::text, 'convertida_en_caso'::text, 'descartada'::text, 'archivada'::text]))),
    CONSTRAINT student_case_alerts_nivel_riesgo_check CHECK ((nivel_riesgo = ANY (ARRAY['bajo'::text, 'medio'::text, 'alto'::text, 'critico'::text]))),
    CONSTRAINT student_case_alerts_case_id_fkey FOREIGN KEY (case_id) REFERENCES student_cases(id) ON DELETE SET NULL,
    CONSTRAINT student_case_alerts_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL
);

CREATE TABLE student_case_events (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    case_id uuid NOT NULL,
    tipo text NOT NULL,
    titulo text NOT NULL,
    descripcion text,
    metadata jsonb DEFAULT '{}'::jsonb,
    actor_id uuid,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT student_case_events_pkey PRIMARY KEY (id),
    CONSTRAINT student_case_events_case_id_fkey FOREIGN KEY (case_id) REFERENCES student_cases(id) ON DELETE CASCADE
);

CREATE TABLE student_indicator_progress (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL,
    indicator_id uuid NOT NULL,
    session_id uuid,
    status text NOT NULL DEFAULT 'not_started'::text,
    score numeric,
    observation text,
    evidence_id uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT student_indicator_progress_pkey PRIMARY KEY (id),
    CONSTRAINT student_indicator_progress_unique UNIQUE (student_id, indicator_id),
    CONSTRAINT student_indicator_progress_indicator_id_fkey FOREIGN KEY (indicator_id) REFERENCES indicators(id) ON DELETE CASCADE,
    CONSTRAINT student_indicator_progress_session_id_fkey FOREIGN KEY (session_id) REFERENCES teacher_class_sessions(id) ON DELETE SET NULL,
    CONSTRAINT student_indicator_progress_student_id_fkey FOREIGN KEY (student_id) REFERENCES alumnos(id) ON DELETE CASCADE
);

-- Tabla de configuración del sistema - API keys, settings globales
CREATE TABLE system_config (
    key varchar NOT NULL,
    value text,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT system_config_pkey PRIMARY KEY (key)
);

CREATE TABLE tareas_institucionales (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    event_id uuid,
    titulo text NOT NULL,
    descripcion text,
    departamento soi_departamento NOT NULL DEFAULT 'DIR'::soi_departamento,
    asignado_a text,
    estado tarea_institucional_estado NOT NULL DEFAULT 'pendiente'::tarea_institucional_estado,
    prioridad tarea_institucional_prioridad NOT NULL DEFAULT 'media'::tarea_institucional_prioridad,
    fecha_vencimiento date,
    checklist jsonb DEFAULT '[]'::jsonb,
    feedback text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
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
    source_event_id uuid,
    CONSTRAINT tareas_institucionales_pkey PRIMARY KEY (id),
    CONSTRAINT tareas_entidad_tipo_check CHECK (((entidad_tipo IS NULL) OR (entidad_tipo = ANY (ARRAY['alumno'::text, 'maestro'::text, 'postulante'::text, 'representante'::text, 'instrumento'::text, 'evento'::text, 'otro'::text])))),
    CONSTRAINT tareas_institucionales_depende_de_tarea_id_fkey FOREIGN KEY (depende_de_tarea_id) REFERENCES tareas_institucionales(id) ON DELETE SET NULL,
    CONSTRAINT tareas_institucionales_process_code_fkey FOREIGN KEY (process_code) REFERENCES soi_process_contracts(process_code) ON UPDATE CASCADE,
    CONSTRAINT tareas_institucionales_minuta_id_fkey FOREIGN KEY (minuta_id) REFERENCES minutas(id) ON DELETE SET NULL,
    CONSTRAINT tareas_institucionales_event_id_fkey FOREIGN KEY (event_id) REFERENCES calendario_institucional(id) ON DELETE CASCADE,
    CONSTRAINT tareas_institucionales_dependencia_tarea_id_fkey FOREIGN KEY (dependencia_tarea_id) REFERENCES tareas_institucionales(id) ON DELETE SET NULL,
    CONSTRAINT tareas_institucionales_source_event_id_fkey FOREIGN KEY (source_event_id) REFERENCES soi_eventos(id) ON DELETE SET NULL
);

CREATE TABLE tarea_comentarios (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    tarea_id uuid NOT NULL,
    autor_id uuid,
    autor_nombre text,
    cuerpo text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT tarea_comentarios_pkey PRIMARY KEY (id),
    CONSTRAINT tarea_comentarios_tarea_id_fkey FOREIGN KEY (tarea_id) REFERENCES tareas_institucionales(id) ON DELETE CASCADE
);

CREATE TABLE tarea_historial (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    tarea_id uuid NOT NULL,
    campo text NOT NULL,
    valor_anterior text,
    valor_nuevo text,
    actor_id uuid,
    actor_nombre text,
    actor_rol text,
    actor_departamento text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT tarea_historial_pkey PRIMARY KEY (id),
    CONSTRAINT tarea_historial_tarea_id_fkey FOREIGN KEY (tarea_id) REFERENCES tareas_institucionales(id) ON DELETE CASCADE
);

CREATE TABLE tareas_calendario (
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
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT tareas_calendario_pkey PRIMARY KEY (id),
    CONSTRAINT tareas_calendario_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES calendario(id) ON DELETE CASCADE,
    CONSTRAINT tareas_calendario_departamento_id_fkey FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE,
    CONSTRAINT tareas_calendario_asignado_a_fkey FOREIGN KEY (asignado_a) REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE tarea_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    tarea_id uuid NOT NULL,
    evento text NOT NULL,
    cambios jsonb,
    changed_by uuid NOT NULL,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT tarea_logs_pkey PRIMARY KEY (id),
    CONSTRAINT tarea_logs_tarea_id_fkey FOREIGN KEY (tarea_id) REFERENCES tareas_calendario(id) ON DELETE CASCADE,
    CONSTRAINT tarea_logs_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES auth.users(id) ON DELETE RESTRICT
);

CREATE TABLE tareas_caja (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    titulo text NOT NULL,
    descripcion text,
    tipo tarea_tipo NOT NULL DEFAULT 'otro'::tarea_tipo,
    asignado_a uuid,
    familia_id uuid,
    alumno_id uuid,
    referencia_id uuid,
    estado tarea_estado NOT NULL DEFAULT 'pendiente'::tarea_estado,
    prioridad tarea_prioridad NOT NULL DEFAULT 'media'::tarea_prioridad,
    fecha_vencimiento date,
    recurrente boolean DEFAULT false,
    patron_recurrencia jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT tareas_caja_pkey PRIMARY KEY (id),
    CONSTRAINT tareas_caja_asignado_a_fkey FOREIGN KEY (asignado_a) REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT tareas_caja_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL,
    CONSTRAINT tareas_caja_familia_id_fkey FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE SET NULL
);

CREATE TABLE teacher_session_indicators (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    session_id uuid NOT NULL,
    indicator_id uuid,
    planned_topic text,
    planned_objective text,
    worked_status text NOT NULL DEFAULT 'not_started'::text,
    teacher_notes text,
    next_action text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT teacher_session_indicators_pkey PRIMARY KEY (id),
    CONSTRAINT teacher_session_indicators_session_id_fkey FOREIGN KEY (session_id) REFERENCES teacher_class_sessions(id) ON DELETE CASCADE,
    CONSTRAINT teacher_session_indicators_indicator_id_fkey FOREIGN KEY (indicator_id) REFERENCES indicators(id) ON DELETE SET NULL
);

CREATE TABLE telegram_allowed_users (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    telegram_user_id bigint NOT NULL,
    nombre text NOT NULL,
    rol text NOT NULL,
    activo boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    CONSTRAINT telegram_allowed_users_pkey PRIMARY KEY (id),
    CONSTRAINT telegram_allowed_users_telegram_user_id_key UNIQUE (telegram_user_id),
    CONSTRAINT telegram_allowed_users_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id)
);

CREATE TABLE telegram_messages_raw (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    telegram_message_id bigint NOT NULL,
    telegram_chat_id bigint NOT NULL,
    telegram_user_id bigint NOT NULL,
    message_type text NOT NULL DEFAULT 'text'::text,
    raw_payload jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT telegram_messages_raw_pkey PRIMARY KEY (id),
    CONSTRAINT telegram_messages_raw_telegram_message_id_key UNIQUE (telegram_message_id)
);

CREATE TABLE user_portal_access (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    portal_id text NOT NULL,
    granted_by uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT user_portal_access_pkey PRIMARY KEY (id),
    CONSTRAINT user_portal_access_user_portal_unique UNIQUE (user_id, portal_id),
    CONSTRAINT user_portal_access_portal_id_fkey FOREIGN KEY (portal_id) REFERENCES portal_catalog(portal_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT user_portal_access_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES profiles(id) ON DELETE SET NULL,
    CONSTRAINT user_portal_access_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE usuario_departamentos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    departamento_id uuid NOT NULL,
    rol text DEFAULT 'miembro'::text,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT usuario_departamentos_pkey PRIMARY KEY (id),
    CONSTRAINT usuario_departamentos_user_id_departamento_id_key UNIQUE (user_id, departamento_id),
    CONSTRAINT usuario_departamentos_departamento_id_fkey FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE,
    CONSTRAINT usuario_departamentos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE wallet_movimientos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    familia_id uuid NOT NULL,
    tipo wallet_tipo NOT NULL,
    monto_centavos bigint NOT NULL,
    origen wallet_origen NOT NULL,
    referencia_id uuid,
    descripcion text,
    saldo_resultante_centavos bigint NOT NULL,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT wallet_movimientos_pkey PRIMARY KEY (id),
    CONSTRAINT wallet_movimientos_monto_check CHECK (((monto_centavos)::numeric > (0)::numeric)),
    CONSTRAINT wallet_movimientos_familia_id_fkey FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT
);

CREATE TABLE whatsapp_consentimientos (
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
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT whatsapp_consentimientos_pkey PRIMARY KEY (id),
    CONSTRAINT whatsapp_consentimientos_jid_campania_id_key UNIQUE (jid, campania_id),
    CONSTRAINT whatsapp_consentimientos_campania_id_fkey FOREIGN KEY (campania_id) REFERENCES campanias_periodo(id) ON DELETE CASCADE
);

CREATE TABLE whatsapp_optout (
    jid text NOT NULL,
    motivo text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT whatsapp_optout_pkey PRIMARY KEY (jid)
);

CREATE TABLE whatsapp_webhook_log (
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
    created_at timestamptz DEFAULT now(),
    CONSTRAINT whatsapp_webhook_log_pkey PRIMARY KEY (id),
    CONSTRAINT whatsapp_webhook_log_postulante_id_fkey FOREIGN KEY (postulante_id) REFERENCES postulantes(id) ON DELETE SET NULL
);

-- =====================================================================
-- INDEXES (non-PK). ~701 total including PK indexes.
-- =====================================================================
CREATE INDEX idx_familias_activa ON public.familias USING btree (activa);
CREATE INDEX idx_profiles_estado ON public.profiles USING btree (estado);
CREATE INDEX idx_profiles_rol ON public.profiles USING btree (rol);
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
CREATE UNIQUE INDEX programas_codigo_key ON public.programas USING btree (codigo);
CREATE UNIQUE INDEX programas_nombre_key ON public.programas USING btree (nombre);
CREATE INDEX idx_academic_plans_student ON public.academic_plans USING btree (student_id);
CREATE INDEX idx_accesorios_stock ON public.accesorios USING btree (stock_actual, stock_minimo) WHERE (activo = true);
CREATE INDEX idx_acm_curriculum_sources_status ON public.acm_curriculum_sources USING btree (status);
CREATE INDEX idx_acm_curriculum_versions_source ON public.acm_curriculum_versions USING btree (source_id);
CREATE INDEX idx_acm_curriculum_versions_status ON public.acm_curriculum_versions USING btree (status);
CREATE INDEX idx_acm_weekly_plans_level ON public.acm_weekly_plans USING btree (level_id, week_number);
CREATE INDEX idx_maestros_activo ON public.maestros USING btree (activo);
CREATE INDEX idx_maestros_especialidad ON public.maestros USING btree (especialidad);
CREATE INDEX idx_maestros_nombre ON public.maestros USING btree (nombre_completo);
CREATE INDEX idx_maestros_user_id ON public.maestros USING btree (user_id);
CREATE UNIQUE INDEX maestros_correo_key ON public.maestros USING btree (correo);
CREATE UNIQUE INDEX maestros_user_id_key ON public.maestros USING btree (user_id);
CREATE INDEX idx_niveles_programa ON public.niveles USING btree (programa_id);
CREATE UNIQUE INDEX niveles_programa_nombre_unique ON public.niveles USING btree (programa_id, nombre);
CREATE UNIQUE INDEX niveles_programa_orden_unique ON public.niveles USING btree (programa_id, orden);
CREATE INDEX idx_routes_instrument ON public.routes USING btree (instrument);
CREATE INDEX idx_route_versions_route ON public.route_versions USING btree (route_id);
CREATE INDEX idx_route_versions_status ON public.route_versions USING btree (status);
CREATE UNIQUE INDEX route_versions_route_id_version_key ON public.route_versions USING btree (route_id, version);
CREATE UNIQUE INDEX uniq_one_draft_per_route_user ON public.route_versions USING btree (route_id, created_by) WHERE (status = 'draft'::route_status);
CREATE INDEX idx_rutas_contenido_instrumento_nivel_estado ON public.rutas_contenido USING btree (instrumento, nivel, estado);
CREATE UNIQUE INDEX rutas_contenido_instrumento_nivel_nombre_key ON public.rutas_contenido USING btree (instrumento, nivel, nombre);
CREATE INDEX idx_clases_activo ON public.clases USING btree (activo);
CREATE INDEX idx_clases_maestro ON public.clases USING btree (maestro_principal_id);
CREATE INDEX idx_clases_maestro_auxiliar_id ON public.clases USING btree (maestro_auxiliar_id);
CREATE INDEX idx_clases_nivel ON public.clases USING btree (nivel_id);
CREATE INDEX idx_clases_programa ON public.clases USING btree (programa_id);
CREATE INDEX idx_clases_ruta_id ON public.clases USING btree (ruta_id);
CREATE INDEX idx_acm_active_routes_group ON public.acm_active_routes USING btree (group_id);
CREATE UNIQUE INDEX idx_acm_active_routes_one_active_per_group ON public.acm_active_routes USING btree (group_id) WHERE (status = 'active'::text);
CREATE INDEX idx_acm_active_routes_status ON public.acm_active_routes USING btree (status);
CREATE INDEX idx_acm_active_routes_teacher ON public.acm_active_routes USING btree (teacher_id);
CREATE INDEX idx_levels_number ON public.levels USING btree (level_number);
CREATE INDEX idx_levels_route_version ON public.levels USING btree (route_version_id);
CREATE UNIQUE INDEX levels_route_version_id_level_number_key ON public.levels USING btree (route_version_id, level_number);
CREATE INDEX idx_nodes_codigo ON public.nodes USING btree (codigo) WHERE (codigo IS NOT NULL);
CREATE INDEX idx_nodes_critical ON public.nodes USING btree (is_critical);
CREATE INDEX idx_nodes_level ON public.nodes USING btree (level_id);
CREATE INDEX idx_objetivos_node_order ON public.objetivos USING btree (node_id, order_index);
CREATE UNIQUE INDEX objetivos_node_order_unique ON public.objetivos USING btree (node_id, order_index);
CREATE INDEX idx_indicators_node ON public.indicators USING btree (node_id);
CREATE INDEX idx_indicators_objetivo_id ON public.indicators USING btree (objetivo_id);
CREATE INDEX idx_acm_evidence_files_indicator ON public.acm_evidence_files USING btree (indicator_id);
CREATE INDEX idx_acm_evidence_files_session ON public.acm_evidence_files USING btree (session_id);
CREATE UNIQUE INDEX acm_teacher_week_adjustments_unique ON public.acm_teacher_week_adjustments USING btree (group_id, teacher_id, weekly_plan_id, week_number);
CREATE INDEX idx_acm_teacher_week_adjustments_group ON public.acm_teacher_week_adjustments USING btree (group_id, teacher_id, weekly_plan_id);
CREATE INDEX idx_acm_weekly_plan_items_weekly_plan ON public.acm_weekly_plan_items USING btree (weekly_plan_id);
CREATE INDEX idx_alertas_canal_tipo ON public.alertas_log USING btree (canal, tipo, created_at DESC);
CREATE UNIQUE INDEX curriculos_instrumento_nivel_key ON public.curriculos USING btree (instrumento, nivel);
CREATE UNIQUE INDEX salones_nombre_key ON public.salones USING btree (nombre);
CREATE UNIQUE INDEX unique_codigo_salon ON public.salones USING btree (codigo_salon);
CREATE UNIQUE INDEX horarios_clase_unico ON public.horarios USING btree (clase_id, dia_semana, hora_inicio, hora_fin);
CREATE UNIQUE INDEX horarios_maestro_unico ON public.horarios USING btree (maestro_id, dia_semana, hora_inicio, hora_fin);
CREATE UNIQUE INDEX horarios_salon_unico ON public.horarios USING btree (salon_id, dia_semana, hora_inicio, hora_fin);
CREATE INDEX idx_horarios_clase ON public.horarios USING btree (clase_id);
CREATE INDEX idx_horarios_dia ON public.horarios USING btree (dia_semana);
CREATE INDEX idx_horarios_maestro ON public.horarios USING btree (maestro_id);
CREATE INDEX idx_horarios_salon ON public.horarios USING btree (salon_id);
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
CREATE UNIQUE INDEX sesiones_clase_unica ON public.sesiones_clase USING btree (clase_id, fecha, hora_inicio);
CREATE INDEX idx_ape_alumno ON public.alumno_plan_entradas USING btree (alumno_id, created_at DESC);
CREATE INDEX idx_ape_maestro ON public.alumno_plan_entradas USING btree (maestro_id);
CREATE INDEX idx_ape_objetivo ON public.alumno_plan_entradas USING btree (objetivo_id) WHERE (objetivo_id IS NOT NULL);
CREATE INDEX idx_alumno_suspensiones_activa ON public.alumno_suspensiones USING btree (alumno_id) WHERE (estado = 'activa'::text);
CREATE INDEX idx_alumno_suspensiones_alumno ON public.alumno_suspensiones USING btree (alumno_id);
CREATE UNIQUE INDEX alumnos_clases_unico ON public.alumnos_clases USING btree (alumno_id, clase_id);
CREATE INDEX idx_alumnos_clases_alumno ON public.alumnos_clases USING btree (alumno_id);
CREATE INDEX idx_alumnos_clases_clase ON public.alumnos_clases USING btree (clase_id);
CREATE UNIQUE INDEX logros_nombre_key ON public.logros USING btree (nombre);
CREATE UNIQUE INDEX idx_periodo_activo_unico ON public.periodos USING btree (activo) WHERE (activo = true);
CREATE UNIQUE INDEX idx_periodos_unico_activo ON public.periodos USING btree (activo) WHERE (activo = true);
CREATE UNIQUE INDEX alumnos_programas_alumno_programa_periodo_unq ON public.alumnos_programas USING btree (alumno_id, programa_id, periodo_id);
CREATE INDEX idx_alumnos_reinscripciones_alumno ON public.alumnos_reinscripciones USING btree (alumno_id, fecha DESC);
CREATE UNIQUE INDEX cuotas_familia_id_alumno_id_ciclo_anio_ciclo_mes_concepto_key ON public.cuotas USING btree (familia_id, alumno_id, ciclo_anio, ciclo_mes, concepto);
CREATE INDEX idx_cuotas_estado ON public.cuotas USING btree (estado);
CREATE INDEX idx_cuotas_familia_ciclo ON public.cuotas USING btree (familia_id, ciclo_anio, ciclo_mes);
CREATE INDEX idx_cuotas_vencimiento ON public.cuotas USING btree (fecha_vencimiento) WHERE (estado = ANY (ARRAY['pendiente'::cuota_estado, 'vencida'::cuota_estado, 'en_mora'::cuota_estado]));
CREATE INDEX idx_pagos_cajero_fecha ON public.pagos USING btree (cajero_id, created_at);
CREATE INDEX idx_pagos_cuota_ids ON public.pagos USING gin (cuota_ids);
CREATE INDEX idx_pagos_familia ON public.pagos USING btree (familia_id);
CREATE UNIQUE INDEX uq_aplicacion ON public.aplicaciones_pago USING btree (pago_id, cuota_id);
CREATE UNIQUE INDEX applicants_idempotency_key_key ON public.applicants USING btree (idempotency_key);
CREATE INDEX idx_applicants_phone_number ON public.applicants USING btree (phone_number);
CREATE INDEX idx_applicants_status ON public.applicants USING btree (status);
CREATE INDEX idx_applicant_events_applicant_id ON public.applicant_events USING btree (applicant_id);
CREATE INDEX idx_applicant_events_created_at ON public.applicant_events USING btree (created_at DESC);
CREATE INDEX idx_applicant_events_event_name ON public.applicant_events USING btree (event_name);
CREATE INDEX idx_appointments_applicant_id ON public.appointments USING btree (applicant_id);
CREATE INDEX idx_appointments_scheduled_datetime ON public.appointments USING btree (scheduled_datetime);
CREATE INDEX idx_appointments_status ON public.appointments USING btree (status);
CREATE UNIQUE INDEX uq_active_confirmed_slot ON public.appointments USING btree (scheduled_datetime) WHERE (status = 'CONFIRMED'::text);
CREATE INDEX idx_registros_pendientes_estado ON public.registros_pendientes USING btree (estado);
CREATE INDEX idx_registros_pendientes_last_notified ON public.registros_pendientes USING btree (last_notified_at);
CREATE INDEX idx_registros_pendientes_maestro ON public.registros_pendientes USING btree (maestro_id);
CREATE INDEX idx_registros_pendientes_notification_state ON public.registros_pendientes USING btree (notification_state);
CREATE INDEX idx_registros_pendientes_tipo ON public.registros_pendientes USING btree (tipo);
CREATE INDEX idx_rp_maestro_estado_tipo ON public.registros_pendientes USING btree (maestro_id, estado, tipo);
CREATE INDEX idx_notificaciones_clase_id ON public.notificaciones USING btree (clase_id);
CREATE INDEX idx_notificaciones_dedup_key ON public.notificaciones USING btree (dedup_key) WHERE (dedup_key IS NOT NULL);
CREATE INDEX idx_notificaciones_escalation_level ON public.notificaciones USING btree (escalation_level);
CREATE INDEX idx_notificaciones_estado ON public.notificaciones USING btree (estado);
CREATE INDEX idx_notificaciones_profile ON public.notificaciones USING btree (profile_id);
CREATE INDEX idx_ausencias_maestros_aprobado_en ON public.ausencias_maestros USING btree (aprobado_en);
CREATE INDEX idx_ausencias_maestros_estado ON public.ausencias_maestros USING btree (estado);
CREATE INDEX idx_ausencias_maestros_fecha_solicitud_original ON public.ausencias_maestros USING btree (fecha_solicitud_original);
CREATE INDEX idx_ausencias_maestros_fechas ON public.ausencias_maestros USING btree (fecha_inicio, fecha_fin);
CREATE INDEX idx_ausencias_maestros_rechazado_por ON public.ausencias_maestros USING btree (rechazado_por);
CREATE INDEX idx_ausencias_maestros_revisado_por ON public.ausencias_maestros USING btree (revisado_por);
CREATE INDEX idx_ausencias_maestros_revision_en ON public.ausencias_maestros USING btree (revision_en);
CREATE UNIQUE INDEX asistencia_maestros_sesion_maestro_uniq ON public.asistencia_maestros USING btree (sesion_clase_id, maestro_id);
CREATE INDEX idx_asist_maestros_maestro_fecha ON public.asistencia_maestros USING btree (maestro_id, fecha DESC);
CREATE INDEX idx_asist_maestros_periodo ON public.asistencia_maestros USING btree (periodo_id) WHERE (periodo_id IS NOT NULL);
CREATE INDEX idx_asist_maestros_sesion ON public.asistencia_maestros USING btree (sesion_clase_id);
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
CREATE INDEX idx_ausencias_estado ON public.ausencias USING btree (estado);
CREATE INDEX idx_ausencias_fecha_ausencia ON public.ausencias USING btree (fecha_ausencia);
CREATE INDEX idx_ausencias_maestro_fecha ON public.ausencias USING btree (maestro_id, fecha_ausencia);
CREATE INDEX idx_ausencias_maestro_id ON public.ausencias USING btree (maestro_id);
CREATE INDEX idx_ausencias_auditoria_actor_id ON public.ausencias_auditoria USING btree (actor_id);
CREATE INDEX idx_ausencias_auditoria_ausencia_id ON public.ausencias_auditoria USING btree (ausencia_id);
CREATE INDEX idx_ausencias_auditoria_created_at ON public.ausencias_auditoria USING btree (created_at DESC);
CREATE UNIQUE INDEX departamentos_nombre_key ON public.departamentos USING btree (nombre);
CREATE UNIQUE INDEX ux_departamentos_codigo ON public.departamentos USING btree (upper(codigo));
CREATE INDEX idx_calendario_departamento ON public.calendario USING btree (departamento_id);
CREATE INDEX idx_calendario_estado ON public.calendario USING btree (estado);
CREATE INDEX idx_calendario_fecha ON public.calendario USING btree (fecha_inicio, fecha_fin);
CREATE INDEX idx_calendario_tipo ON public.calendario USING btree (tipo);
CREATE INDEX idx_calendario_macro ON public.calendario_institucional USING btree (es_macro_evento) WHERE (es_macro_evento = true);
CREATE UNIQUE INDEX uq_campania_activa ON public.campanias_periodo USING btree (tipo, accion) WHERE activo;
CREATE UNIQUE INDEX campania_envios_campania_id_jid_key ON public.campania_envios USING btree (campania_id, jid);
CREATE UNIQUE INDEX catalogo_niveles_instrumento_orden_key ON public.catalogo_niveles USING btree (instrumento, orden);
CREATE INDEX idx_catn_instrumento ON public.catalogo_niveles USING btree (instrumento);
CREATE UNIQUE INDEX catalogo_objetivos_generales_nivel_id_orden_key ON public.catalogo_objetivos_generales USING btree (nivel_id, orden);
CREATE INDEX idx_catog_nivel ON public.catalogo_objetivos_generales USING btree (nivel_id);
CREATE UNIQUE INDEX catalogo_objetivos_especificos_objetivo_general_id_orden_key ON public.catalogo_objetivos_especificos USING btree (objetivo_general_id, orden);
CREATE INDEX idx_catoe_objetivo_general ON public.catalogo_objetivos_especificos USING btree (objetivo_general_id);
CREATE INDEX idx_catalogos_activo ON public.catalogos USING btree (activo);
CREATE INDEX idx_catalogos_tipo ON public.catalogos USING btree (tipo);
CREATE INDEX idx_clase_horarios_clase_dia ON public.clase_horarios USING btree (clase_id, dia);
CREATE INDEX idx_clase_horarios_clase_id ON public.clase_horarios USING btree (clase_id);
CREATE UNIQUE INDEX clase_mapa_objetivos_clase_id_level_id_orden_objetivo_key ON public.clase_mapa_objetivos USING btree (clase_id, level_id, orden_objetivo);
CREATE INDEX idx_clase_mapa_objetivos_estado_revision ON public.clase_mapa_objetivos USING btree (estado_revision);
CREATE INDEX idx_cmo_clase ON public.clase_mapa_objetivos USING btree (clase_id);
CREATE INDEX idx_cmo_level ON public.clase_mapa_objetivos USING btree (level_id);
CREATE INDEX idx_cmo_origen_node ON public.clase_mapa_objetivos USING btree (origen_node_id);
CREATE INDEX idx_cmo_origen_objetivo ON public.clase_mapa_objetivos USING btree (origen_objetivo_id);
CREATE UNIQUE INDEX clase_mapa_indicadores_clase_id_id_jerarquico_key ON public.clase_mapa_indicadores USING btree (clase_id, id_jerarquico);
CREATE UNIQUE INDEX clase_mapa_indicadores_objetivo_id_orden_indicador_key ON public.clase_mapa_indicadores USING btree (objetivo_id, orden_indicador);
CREATE INDEX idx_cmi_clase ON public.clase_mapa_indicadores USING btree (clase_id);
CREATE INDEX idx_cmi_objetivo ON public.clase_mapa_indicadores USING btree (objetivo_id);
CREATE INDEX idx_cmi_origen_indicator ON public.clase_mapa_indicadores USING btree (origen_indicator_id);
CREATE INDEX idx_clases_emergentes_maestro_fecha ON public.clases_emergentes USING btree (maestro_id, fecha);
CREATE INDEX idx_class_events_date ON public.class_events USING btree (event_date);
CREATE INDEX idx_class_events_session ON public.class_events USING btree (session_id);
CREATE UNIQUE INDEX idx_class_events_session_student ON public.class_events USING btree (session_id, student_id);
CREATE INDEX idx_class_events_student ON public.class_events USING btree (student_id);
CREATE INDEX idx_class_events_teacher ON public.class_events USING btree (teacher_id);
CREATE UNIQUE INDEX idx_methodology_event ON public.class_event_methodology USING btree (class_event_id);
CREATE INDEX idx_content_snapshots_session ON public.class_session_content_snapshots USING btree (session_id);
CREATE INDEX idx_planificaciones_clase ON public.planificaciones USING btree (clase_id);
CREATE INDEX idx_planificaciones_estado ON public.planificaciones USING btree (estado);
CREATE INDEX idx_planificaciones_maestro ON public.planificaciones USING btree (maestro_id);
CREATE UNIQUE INDEX cobertura_alumno_objetivo_alumno_id_objetivo_id_key ON public.cobertura_alumno_objetivo USING btree (alumno_id, objetivo_id);
CREATE INDEX idx_inventario_activos_asignado_a_texto ON public.inventario_activos USING btree (asignado_a_texto) WHERE (asignado_a_texto IS NOT NULL);
CREATE INDEX idx_inventario_activos_familia ON public.inventario_activos USING btree (familia) WHERE (activo = true);
CREATE INDEX idx_inventario_activos_requiere_mantenimiento ON public.inventario_activos USING btree (requiere_mantenimiento) WHERE (activo = true);
CREATE INDEX idx_inventario_activos_tipo ON public.inventario_activos USING btree (tipo_instrumento) WHERE (activo = true);
CREATE INDEX idx_inventario_estado_uso ON public.inventario_activos USING btree (estado_uso) WHERE (activo = true);
CREATE UNIQUE INDEX inventario_activos_codigo_inventario_key ON public.inventario_activos USING btree (codigo_inventario);
CREATE INDEX idx_comodatos_alumno ON public.comodatos_activos USING btree (alumno_id, estado);
CREATE INDEX idx_comodatos_tipo ON public.comodatos_activos USING btree (tipo_comodato) WHERE ((estado)::text = 'activo'::text);
CREATE INDEX idx_comodatos_vencimiento ON public.comodatos_activos USING btree (fecha_vencimiento) WHERE ((estado)::text = 'activo'::text);
CREATE UNIQUE INDEX uix_comodato_activo_por_instrumento ON public.comodatos_activos USING btree (activo_id) WHERE ((estado)::text = 'activo'::text);
CREATE INDEX idx_representantes_bloqueo ON public.representantes USING btree (bloqueo_reinscripcion) WHERE (bloqueo_reinscripcion = true);
CREATE INDEX idx_representantes_familia ON public.representantes USING btree (familia_id);
CREATE INDEX idx_representantes_user ON public.representantes USING btree (user_id);
CREATE INDEX idx_com_seg_alumno ON public.comunicaciones_seguimiento USING btree (alumno_id);
CREATE INDEX idx_com_seg_estado ON public.comunicaciones_seguimiento USING btree (estado);
CREATE INDEX idx_com_seg_proxima_fecha ON public.comunicaciones_seguimiento USING btree (proxima_fecha) WHERE ((estado = 'abierto'::text) AND (requiere_seguimiento = true));
CREATE UNIQUE INDEX uq_arancel_concepto_activo ON public.configuracion_aranceles USING btree (concepto) WHERE (activo = true);
CREATE UNIQUE INDEX configuracion_recordatorios_profile_id_key ON public.configuracion_recordatorios USING btree (profile_id);
CREATE INDEX idx_contactos_alianzas_created ON public.contactos_alianzas USING btree (created_at DESC);
CREATE INDEX idx_contactos_alianzas_estado ON public.contactos_alianzas USING btree (estado);
CREATE INDEX idx_contactos_alianzas_match ON public.contactos_alianzas USING btree (puntuacion_match DESC);
CREATE INDEX idx_modulos_nivel ON public.modulos USING btree (nivel_id);
CREATE INDEX idx_modulos_programa ON public.modulos USING btree (programa_id);
CREATE UNIQUE INDEX modulos_nivel_nombre_unique ON public.modulos USING btree (nivel_id, nombre);
CREATE UNIQUE INDEX modulos_nivel_orden_unique ON public.modulos USING btree (nivel_id, orden);
CREATE INDEX idx_unidades_modulo ON public.unidades USING btree (modulo_id);
CREATE UNIQUE INDEX unidades_modulo_nombre_unique ON public.unidades USING btree (modulo_id, nombre);
CREATE UNIQUE INDEX unidades_modulo_orden_unique ON public.unidades USING btree (modulo_id, orden);
CREATE UNIQUE INDEX ejercicios_unidad_orden_unique ON public.ejercicios USING btree (unidad_id, orden);
CREATE INDEX idx_ejercicios_tipo ON public.ejercicios USING btree (tipo_ejercicio);
CREATE INDEX idx_ejercicios_unidad ON public.ejercicios USING btree (unidad_id);
CREATE INDEX idx_contenidos_sesion_sesion ON public.contenidos_sesion USING btree (sesion_clase_id);
CREATE INDEX idx_postulantes_created_at ON public.postulantes USING btree (created_at);
CREATE INDEX idx_postulantes_estado ON public.postulantes USING btree (estado);
CREATE INDEX idx_postulantes_fecha_cita ON public.postulantes USING btree (fecha_cita);
CREATE INDEX idx_postulantes_madre_tlf ON public.postulantes USING btree (madre_tlf_whatsapp);
CREATE INDEX idx_postulantes_nombre_completo ON public.postulantes USING gin (nombre_completo gin_trgm_ops);
CREATE INDEX idx_postulantes_padre_tlf ON public.postulantes USING btree (padre_tlf_whatsapp);
CREATE INDEX idx_postulantes_telefono_alumno ON public.postulantes USING btree (telefono_alumno);
CREATE UNIQUE INDEX postulantes_submission_key ON public.postulantes USING btree (correo, nombre_completo);
CREATE INDEX idx_conversaciones_estado ON public.conversaciones_whatsapp USING btree (estado_conversacion);
CREATE UNIQUE INDEX unique_postulante_conversacion ON public.conversaciones_whatsapp USING btree (postulante_id);
CREATE INDEX idx_maestro_routes_clase ON public.maestro_routes USING btree (clase_id);
CREATE INDEX idx_maestro_routes_maestro ON public.maestro_routes USING btree (maestro_id);
CREATE INDEX idx_maestro_routes_maestro_clase ON public.maestro_routes USING btree (maestro_id, clase_id);
CREATE UNIQUE INDEX maestro_routes_maestro_id_clase_id_key ON public.maestro_routes USING btree (maestro_id, clase_id);
CREATE INDEX idx_maestro_unidades_ruta ON public.maestro_unidades USING btree (ruta_id, orden);
CREATE INDEX idx_maestro_objetivos_unidad ON public.maestro_objetivos USING btree (unidad_id, orden);
CREATE INDEX idx_maestro_indicadores_objetivo ON public.maestro_indicadores USING btree (objetivo_id, orden);
CREATE UNIQUE INDEX ei_unq_clase ON public.evaluacion_indicador USING btree (alumno_id, clase_indicador_id) WHERE (clase_indicador_id IS NOT NULL);
CREATE UNIQUE INDEX ei_unq_global ON public.evaluacion_indicador USING btree (alumno_id, indicator_id, clase_id) WHERE (indicator_id IS NOT NULL);
CREATE UNIQUE INDEX evaluacion_indicador_alumno_indicator_clase_unique ON public.evaluacion_indicador USING btree (alumno_id, indicator_id, clase_id);
CREATE UNIQUE INDEX evaluacion_indicador_alumno_maestro_indicador_clase_unique ON public.evaluacion_indicador USING btree (alumno_id, maestro_indicador_id, clase_id);
CREATE INDEX idx_ei_alumno ON public.evaluacion_indicador USING btree (alumno_id);
CREATE INDEX idx_ei_clase ON public.evaluacion_indicador USING btree (clase_id);
CREATE INDEX idx_ei_clase_alumno ON public.evaluacion_indicador USING btree (clase_id, alumno_id);
CREATE INDEX idx_ei_clase_indicador ON public.evaluacion_indicador USING btree (clase_indicador_id);
CREATE INDEX idx_ei_clase_recovery ON public.evaluacion_indicador USING btree (clase_id, recovery_status);
CREATE INDEX idx_ei_indicator ON public.evaluacion_indicador USING btree (indicator_id);
CREATE INDEX idx_ei_maestro_indicador ON public.evaluacion_indicador USING btree (maestro_indicador_id);
CREATE INDEX idx_ei_recovery_status ON public.evaluacion_indicador USING btree (recovery_status);
CREATE INDEX idx_ei_review_flag ON public.evaluacion_indicador USING btree (review_flag) WHERE (review_flag = true);
CREATE UNIQUE INDEX evaluations_student_id_jurado_id_key ON public.evaluations USING btree (student_id, jurado_id);
CREATE INDEX idx_reparaciones_activo_estado ON public.inventario_reparaciones USING btree (activo_id, estado);
CREATE INDEX idx_reparaciones_estado ON public.inventario_reparaciones USING btree (estado);
CREATE UNIQUE INDEX facturas_reparacion_numero_factura_key ON public.facturas_reparacion USING btree (numero_factura);
CREATE INDEX idx_facturas_estado ON public.facturas_reparacion USING btree (estado_pago);
CREATE INDEX idx_facturas_reparacion ON public.facturas_reparacion USING btree (reparacion_id);
CREATE UNIQUE INDEX fin_service_providers_connector_key_key ON public.fin_service_providers USING btree (connector_key);
CREATE UNIQUE INDEX fin_service_accounts_provider_id_external_account_ref_key ON public.fin_service_accounts USING btree (provider_id, external_account_ref);
CREATE UNIQUE INDEX fin_service_balance_snapshots_source_snapshot_key_key ON public.fin_service_balance_snapshots USING btree (source_snapshot_key);
CREATE INDEX idx_fin_service_balance_snapshots_account_observed ON public.fin_service_balance_snapshots USING btree (service_account_id, observed_at DESC);
CREATE UNIQUE INDEX gastos_fijos_pagos_gasto_fijo_id_periodo_anio_periodo_mes_key ON public.gastos_fijos_pagos USING btree (gasto_fijo_id, periodo_anio, periodo_mes);
CREATE INDEX idx_gastos_fijos_pagos_gasto ON public.gastos_fijos_pagos USING btree (gasto_fijo_id);
CREATE UNIQUE INDEX hermes_gateway_health_instance_name_key ON public.hermes_gateway_health USING btree (instance_name);
CREATE INDEX idx_hermes_gateway_health_instance ON public.hermes_gateway_health USING btree (instance_name);
CREATE INDEX hermes_inbox_rate_limit_idx ON public.hermes_inbox USING btree (telegram_user_id, created_at DESC) WHERE (telegram_user_id IS NOT NULL);
CREATE INDEX idx_hermes_inbox_unprocessed ON public.hermes_inbox USING btree (created_at) WHERE (processed = false);
CREATE INDEX idx_hermes_kanban_cards_status ON public.hermes_kanban_cards USING btree (status);
CREATE INDEX idx_hermes_kanban_cards_synced_at ON public.hermes_kanban_cards USING btree (synced_at DESC);
CREATE INDEX idx_soi_process_contracts_active ON public.soi_process_contracts USING btree (active) WHERE (active = true);
CREATE INDEX idx_soi_process_contracts_automation ON public.soi_process_contracts USING btree (automation_status);
CREATE INDEX idx_soi_process_contracts_owner ON public.soi_process_contracts USING btree (department_owner);
CREATE INDEX idx_hermes_process_cases_entity ON public.hermes_process_cases USING btree (entity_type, entity_id);
CREATE INDEX idx_hermes_process_cases_owner ON public.hermes_process_cases USING btree (owner_department);
CREATE INDEX idx_hermes_process_cases_process ON public.hermes_process_cases USING btree (process_code);
CREATE INDEX idx_hermes_process_cases_status ON public.hermes_process_cases USING btree (status);
CREATE UNIQUE INDEX hermes_protocolos_categoria_evento_key ON public.hermes_protocolos USING btree (categoria_evento);
CREATE INDEX idx_hermes_protocolos_activo ON public.hermes_protocolos USING btree (activo);
CREATE INDEX idx_hermes_rules_departamento ON public.hermes_reactive_rules USING btree (departamento);
CREATE INDEX idx_hermes_rules_enabled ON public.hermes_reactive_rules USING btree (enabled, rule_type);
CREATE INDEX idx_hermes_rules_lookup ON public.hermes_reactive_rules USING btree (rule_type, departamento);
CREATE UNIQUE INDEX uq_hermes_rules_type_dept ON public.hermes_reactive_rules USING btree (rule_type, departamento);
CREATE UNIQUE INDEX hermes_whatsapp_config_numero_wid_key ON public.hermes_whatsapp_config USING btree (numero_wid);
CREATE INDEX idx_hermes_whatsapp_queue_claim ON public.hermes_whatsapp_queue USING btree (estado, created_at) WHERE (estado = 'pendiente'::text);
CREATE INDEX idx_hermes_whatsapp_queue_jid_sent ON public.hermes_whatsapp_queue USING btree (jid, procesado_at DESC) WHERE (estado = 'enviado'::text);
CREATE INDEX idx_historial_alumno ON public.historial_estado_alumno USING btree (alumno_id, fecha DESC);
CREATE INDEX idx_homework_due_date ON public.homework_assignments USING btree (due_date);
CREATE INDEX idx_homework_event ON public.homework_assignments USING btree (class_event_id);
CREATE INDEX idx_homework_student ON public.homework_assignments USING btree (student_id);
CREATE INDEX idx_homework_teacher ON public.homework_assignments USING btree (teacher_id);
CREATE INDEX idx_indicador_prerequisito_indicador ON public.indicador_prerequisito USING btree (indicador_id);
CREATE INDEX idx_indicador_prerequisito_prerequisito ON public.indicador_prerequisito USING btree (prerequisito_indicador_id);
CREATE UNIQUE INDEX indicador_prerequisito_indicador_id_prerequisito_indicador__key ON public.indicador_prerequisito USING btree (indicador_id, prerequisito_indicador_id);
CREATE INDEX idx_attempts_indicator ON public.indicator_attempts USING btree (indicator_id);
CREATE INDEX idx_attempts_session ON public.indicator_attempts USING btree (session_id);
CREATE INDEX idx_attempts_student ON public.indicator_attempts USING btree (student_id);
CREATE INDEX idx_indicator_attempts_clase ON public.indicator_attempts USING btree (covered_by_clase_id, covered_date DESC);
CREATE INDEX idx_indicator_attempts_covered_date ON public.indicator_attempts USING btree (indicator_id, covered_date DESC);
CREATE INDEX idx_indicator_attempts_created_by ON public.indicator_attempts USING btree (created_by);
CREATE INDEX idx_indicator_attempts_session ON public.indicator_attempts USING btree (session_id);
CREATE INDEX idx_indicator_attempts_student ON public.indicator_attempts USING btree (student_id);
CREATE UNIQUE INDEX uq_attempt_session_indicator_student ON public.indicator_attempts USING btree (session_id, indicator_id, student_id);
CREATE UNIQUE INDEX ruta_contenido_objetivos_ruta_id_objetivo_id_key ON public.ruta_contenido_objetivos USING btree (ruta_id, objetivo_id);
CREATE UNIQUE INDEX ruta_contenido_objetivos_ruta_id_orden_key ON public.ruta_contenido_objetivos USING btree (ruta_id, orden);
CREATE INDEX idx_indicator_sessions_clase ON public.indicator_sessions USING btree (clase_id);
CREATE INDEX idx_indicator_sessions_fecha ON public.indicator_sessions USING btree (fecha DESC);
CREATE INDEX idx_indicator_sessions_maestro ON public.indicator_sessions USING btree (maestro_id);
CREATE INDEX idx_indicator_sessions_objetivo ON public.indicator_sessions USING btree (objetivo_id);
CREATE UNIQUE INDEX indicator_sessions_unique_session ON public.indicator_sessions USING btree (clase_id, objetivo_id, fecha, maestro_id);
CREATE INDEX idx_indicator_session_students_alumno ON public.indicator_session_students USING btree (alumno_id);
CREATE INDEX idx_indicator_session_students_session ON public.indicator_session_students USING btree (indicator_session_id);
CREATE INDEX idx_indicator_session_students_session_alumno ON public.indicator_session_students USING btree (indicator_session_id, alumno_id);
CREATE UNIQUE INDEX indicator_session_students_indicator_session_id_alumno_id_key ON public.indicator_session_students USING btree (indicator_session_id, alumno_id);
CREATE INDEX idx_instrumentos_alumno ON public.instrumentos USING btree (alumno_id);
CREATE INDEX idx_instrumentos_estado ON public.instrumentos USING btree (estado);
CREATE UNIQUE INDEX instrumentos_codigo_key ON public.instrumentos USING btree (codigo);
CREATE INDEX idx_accesorios_activo ON public.inventario_accesorios USING btree (activo_id);
CREATE INDEX idx_accesorios_tipo ON public.inventario_accesorios USING btree (tipo);
CREATE INDEX idx_historial_activo_fecha ON public.inventario_historial USING btree (activo_id, fecha DESC);
CREATE INDEX idx_historial_tipo_evento ON public.inventario_historial USING btree (tipo_evento);
CREATE INDEX idx_justificaciones_alumno ON public.justificaciones USING btree (alumno_id);
CREATE INDEX idx_justificaciones_categoria ON public.justificaciones USING btree (categoria) WHERE (categoria IS NOT NULL);
CREATE INDEX idx_justificaciones_clase ON public.justificaciones USING btree (clase_id);
CREATE INDEX idx_justificaciones_fecha ON public.justificaciones USING btree (fecha);
CREATE INDEX idx_justificaciones_sesion ON public.justificaciones USING btree (sesion_id);
CREATE UNIQUE INDEX justificaciones_sesion_id_alumno_id_key ON public.justificaciones USING btree (sesion_id, alumno_id);
CREATE INDEX idx_lut_ordenes_alumno ON public.lut_ordenes_reparacion USING btree (alumno_id);
CREATE INDEX idx_lut_ordenes_correlation ON public.lut_ordenes_reparacion USING btree (correlation_id);
CREATE INDEX idx_lut_ordenes_estado ON public.lut_ordenes_reparacion USING btree (estado);
CREATE INDEX idx_lut_ordenes_instrumento ON public.lut_ordenes_reparacion USING btree (instrumento_id);
CREATE INDEX idx_lut_diagnosticos_orden ON public.lut_diagnosticos USING btree (orden_id);
CREATE INDEX idx_lut_evidencias_orden ON public.lut_evidencias USING btree (orden_id);
CREATE INDEX idx_lut_insumos_activo ON public.lut_insumos USING btree (activo);
CREATE INDEX idx_lut_insumos_categoria ON public.lut_insumos USING btree (categoria);
CREATE INDEX idx_lut_movimientos_insumo ON public.lut_movimientos_insumos USING btree (insumo_id);
CREATE INDEX idx_lut_movimientos_orden ON public.lut_movimientos_insumos USING btree (orden_id);
CREATE INDEX idx_lut_presupuestos_orden ON public.lut_presupuestos USING btree (orden_id);
CREATE INDEX idx_lut_solicitudes_estado ON public.lut_solicitudes_compra USING btree (estado);
CREATE INDEX idx_lut_solicitudes_orden ON public.lut_solicitudes_compra USING btree (orden_id);
CREATE INDEX idx_maestro_desempeno_categoria ON public.maestro_desempeno USING btree (categoria);
CREATE INDEX idx_maestro_desempeno_tendencia ON public.maestro_desempeno USING btree (tendencia);
CREATE INDEX idx_maestro_desempeno_updated_at ON public.maestro_desempeno USING btree (updated_at);
CREATE INDEX idx_md_categoria ON public.maestro_desempeno USING btree (categoria);
CREATE INDEX idx_md_tendencia ON public.maestro_desempeno USING btree (tendencia);
CREATE INDEX idx_md_updated_at ON public.maestro_desempeno USING btree (updated_at);
CREATE UNIQUE INDEX maestro_desempeno_maestro_id_key ON public.maestro_desempeno USING btree (maestro_id);
CREATE INDEX idx_maestro_retiros_maestro_created ON public.maestro_retiros USING btree (maestro_id, created_at DESC);
CREATE INDEX idx_maestro_tareas_maestro_fecha ON public.maestro_tareas USING btree (maestro_id, fecha_recordatorio);
CREATE INDEX idx_mp_activo ON public.mapa_plantillas USING btree (activo);
CREATE INDEX idx_mp_level ON public.mapa_plantillas USING btree (level_id);
CREATE INDEX idx_mp_route_version ON public.mapa_plantillas USING btree (route_version_id);
CREATE UNIQUE INDEX mapa_plantillas_route_version_id_level_id_key ON public.mapa_plantillas USING btree (route_version_id, level_id);
CREATE INDEX idx_node_resources_node_id ON public.node_resources USING btree (node_id);
CREATE INDEX idx_node_resources_type ON public.node_resources USING btree (resource_type);
CREATE INDEX idx_notif_asistencia_created ON public.notificaciones_asistencia USING btree (created_at DESC);
CREATE INDEX idx_notif_asistencia_destinatario ON public.notificaciones_asistencia USING btree (destinatario_telefono);
CREATE INDEX idx_notif_asistencia_estado ON public.notificaciones_asistencia USING btree (estado) WHERE (estado = 'pendiente'::text);
CREATE INDEX idx_notif_asistencia_estado_programada ON public.notificaciones_asistencia USING btree (estado, fecha_programada) WHERE (estado = 'pendiente'::text);
CREATE INDEX idx_notif_asistencia_tipo ON public.notificaciones_asistencia USING btree (tipo);
CREATE INDEX idx_notif_familia ON public.notificaciones_caja USING btree (familia_id, created_at DESC);
CREATE INDEX idx_notif_hermes ON public.notificaciones_caja USING btree (estado_whatsapp, created_at) WHERE ((canal = ANY (ARRAY['whatsapp'::notif_canal, 'ambos'::notif_canal])) AND (estado_whatsapp = 'pendiente'::notif_estado_wa));
CREATE INDEX idx_notif_portal_unreads ON public.notificaciones_caja USING btree (estado_portal) WHERE (estado_portal = 'no_leida'::notif_estado_portal);
CREATE INDEX idx_notification_trigger_logs_execution_time ON public.notification_trigger_logs USING btree (execution_time DESC);
CREATE INDEX idx_observaciones_alumno ON public.observaciones_alumnos USING btree (alumno_id);
CREATE INDEX idx_observaciones_alumno_estado ON public.observaciones_alumnos USING btree (alumno_id, estado);
CREATE INDEX idx_observaciones_alumnos_followup ON public.observaciones_alumnos USING btree (alumno_id, estado, tipo) WHERE (estado = ANY (ARRAY['abierta'::text, 'seguimiento'::text, 'pendiente'::text]));
CREATE INDEX idx_observaciones_clase ON public.observaciones_alumnos USING btree (clase_id);
CREATE INDEX idx_observaciones_fecha ON public.observaciones_alumnos USING btree (fecha);
CREATE INDEX idx_obs_borrador ON public.observaciones_sesion USING btree (sesion_id, es_borrador) WHERE (es_borrador = true);
CREATE INDEX idx_obs_maestro ON public.observaciones_sesion USING btree (maestro_id);
CREATE INDEX idx_obs_sesion ON public.observaciones_sesion USING btree (sesion_id);
CREATE INDEX idx_observaciones_clase_filled ON public.observaciones_sesion USING btree (sesion_id, first_note_at DESC) WHERE (first_note_at IS NOT NULL);
CREATE INDEX idx_observaciones_first_note_at ON public.observaciones_sesion USING btree (first_note_at DESC);
CREATE INDEX idx_observaciones_last_note_at ON public.observaciones_sesion USING btree (last_note_at DESC);
CREATE INDEX idx_observaciones_maestro_filled ON public.observaciones_sesion USING btree (maestro_id, first_note_at DESC) WHERE (first_note_at IS NOT NULL);
CREATE INDEX idx_pagos_alumno_periodo ON public.pagos_alumnos USING btree (alumno_id, periodo_mes DESC);
CREATE UNIQUE INDEX uix_pagos_mensualidad_mes ON public.pagos_alumnos USING btree (alumno_id, periodo_mes) WHERE ((concepto)::text = 'mensualidad'::text);
CREATE INDEX idx_periodo_excepciones_periodo ON public.periodo_excepciones USING btree (periodo_id) WHERE (periodo_id IS NOT NULL);
CREATE INDEX idx_periodo_excepciones_rango ON public.periodo_excepciones USING btree (fecha_inicio, fecha_fin);
CREATE INDEX idx_permisos_maestros_maestro_id ON public.permisos_maestros USING btree (maestro_id);
CREATE INDEX permisos_maestros_maestro_id_idx ON public.permisos_maestros USING btree (maestro_id);
CREATE UNIQUE INDEX permisos_maestros_maestro_id_key ON public.permisos_maestros USING btree (maestro_id);
CREATE INDEX idx_niveles_clase ON public.plan_niveles USING btree (clase_id);
CREATE INDEX idx_temas_nivel ON public.plan_temas USING btree (nivel_id);
CREATE INDEX idx_objetivos_tema ON public.plan_objetivos USING btree (tema_id);
CREATE INDEX idx_indicadores_objetivo ON public.plan_indicadores USING btree (objetivo_id);
CREATE INDEX idx_planned_content_clase ON public.planned_content USING btree (clase_id, planned_date);
CREATE INDEX idx_planned_content_maestro ON public.planned_content USING btree (maestro_id, planned_date);
CREATE INDEX idx_planned_content_node ON public.planned_content USING btree (node_id, planned_date);
CREATE UNIQUE INDEX planned_content_maestro_id_clase_id_node_id_planned_date_key ON public.planned_content USING btree (maestro_id, clase_id, node_id, planned_date);
CREATE INDEX idx_plandocs_clase ON public.planning_documents USING btree (clase_id);
CREATE INDEX idx_plandocs_maestro ON public.planning_documents USING btree (maestro_id);
CREATE INDEX idx_pp_clase_id ON public.plantillas_planificacion USING btree (clase_id);
CREATE UNIQUE INDEX programas_prerrequisitos_programa_id_prerequisito_id_key ON public.programas_prerrequisitos USING btree (programa_id, prerequisito_id);
CREATE INDEX idx_progresos_alumno ON public.progresos USING btree (alumno_id);
CREATE INDEX idx_progresos_alumno_fecha ON public.progresos USING btree (alumno_id, fecha_evaluacion DESC);
CREATE INDEX idx_progresos_alumno_fecha_calificacion ON public.progresos USING btree (alumno_id, fecha_evaluacion DESC) WHERE (calificacion IS NOT NULL);
CREATE INDEX idx_progresos_clase ON public.progresos USING btree (clase_id);
CREATE INDEX idx_progresos_fecha ON public.progresos USING btree (fecha_evaluacion);
CREATE INDEX idx_progresos_periodo ON public.progresos USING btree (periodo_id);
CREATE INDEX idx_progresos_sesion ON public.progresos USING btree (sesion_clase_id);
CREATE UNIQUE INDEX progresos_upsert_idx ON public.progresos USING btree (alumno_id, clase_id, sesion_clase_id, contenido_dsl) WHERE (contenido_dsl IS NOT NULL);
CREATE UNIQUE INDEX progresos_upsert_key ON public.progresos USING btree (alumno_id, clase_id, sesion_clase_id, contenido_dsl);
CREATE UNIQUE INDEX progresos_upsert_key_hash ON public.progresos USING btree (alumno_id, clase_id, sesion_clase_id, md5(contenido_dsl));
CREATE INDEX idx_protocolos_activo ON public.protocolos USING btree (activo);
CREATE INDEX idx_protocolos_tipo ON public.protocolos USING btree (tipo);
CREATE UNIQUE INDEX protocolos_nombre_key ON public.protocolos USING btree (nombre);
CREATE INDEX idx_pulso_score_history_calculado ON public.pulso_score_history USING btree (calculado_at DESC);
CREATE UNIQUE INDEX push_subscriptions_endpoint_key ON public.push_subscriptions USING btree (endpoint);
CREATE UNIQUE INDEX repertoire_items_section_title_type_key ON public.repertoire_items USING btree (section, title, type);
CREATE INDEX idx_retenciones_alumno ON public.retenciones_instrumento USING btree (alumno_id);
CREATE INDEX idx_retenciones_retenido ON public.retenciones_instrumento USING btree (alumno_id) WHERE (estado = 'retenido'::text);
CREATE INDEX idx_schedule_run_feedback_run_id ON public.schedule_run_feedback USING btree (run_id);
CREATE INDEX idx_score_representante_ciclo ON public.score_compromiso USING btree (representante_id, ciclo_anio DESC, ciclo_mes DESC);
CREATE UNIQUE INDEX score_compromiso_representante_id_ciclo_mes_ciclo_anio_key ON public.score_compromiso USING btree (representante_id, ciclo_mes, ciclo_anio);
CREATE INDEX idx_ausencias_reinicio_alumno ON public.seguimiento_ausencias_reinicio USING btree (alumno_id);
CREATE INDEX idx_service_account_observations_account ON public.service_account_observations USING btree (service_account_id, observed_at DESC);
CREATE UNIQUE INDEX signage_pantallas_slug_key ON public.signage_pantallas USING btree (slug);
CREATE INDEX idx_signage_media_activo_orden ON public.signage_media USING btree (activo, orden);
CREATE INDEX idx_signage_media_pantalla ON public.signage_media USING btree (pantalla_id);
CREATE INDEX idx_signage_media_youtube ON public.signage_media USING btree (tipo) WHERE (tipo = 'youtube'::text);
CREATE INDEX idx_sim_actores_run_tipo ON public.sim_actores USING btree (run_id, tipo);
CREATE INDEX idx_sim_calendario_run_fecha ON public.sim_calendario USING btree (run_id, fecha_inicio);
CREATE UNIQUE INDEX sim_config_canal_key ON public.sim_config USING btree (canal);
CREATE INDEX idx_sim_log_run_created ON public.sim_log USING btree (run_id, created_at);
CREATE INDEX idx_sim_log_run_fecha_simulada ON public.sim_log USING btree (run_id, fecha_simulada, id);
CREATE INDEX idx_sim_outbox_run ON public.sim_outbox USING btree (run_id);
CREATE INDEX idx_sim_tareas_run ON public.sim_tareas USING btree (run_id);
CREATE INDEX idx_soi_analisis_semanal_created ON public.soi_analisis_semanal USING btree (created_at DESC);
CREATE INDEX idx_soi_event_bus_procesado ON public.soi_event_bus USING btree (procesado);
CREATE INDEX idx_soi_event_bus_tipo ON public.soi_event_bus USING btree (tipo);
CREATE INDEX idx_soi_eventos_correlation ON public.soi_eventos USING btree (correlation_id);
CREATE INDEX idx_soi_eventos_entity_timeline ON public.soi_eventos USING btree (entidad_id, created_at DESC);
CREATE INDEX idx_soi_eventos_procesado_queue ON public.soi_eventos USING btree (procesado, created_at) WHERE (procesado = false);
CREATE INDEX idx_soi_eventos_tipo_timeline ON public.soi_eventos USING btree (tipo, created_at DESC);
CREATE INDEX idx_solicitudes_ausencia_maestro ON public.solicitudes_ausencia USING btree (maestro_id);
CREATE INDEX idx_solicitudes_estado ON public.solicitudes_permisos USING btree (estado);
CREATE INDEX idx_solicitudes_maestro_id ON public.solicitudes_permisos USING btree (maestro_id);
CREATE UNIQUE INDEX student_indicator_progress_unique ON public.student_indicator_progress USING btree (student_id, indicator_id);
CREATE INDEX idx_tareas_correlation ON public.tareas_institucionales USING btree (correlation_id);
CREATE INDEX idx_tareas_correlation_created ON public.tareas_institucionales USING btree (correlation_id, created_at DESC) WHERE (correlation_id IS NOT NULL);
CREATE INDEX idx_tareas_dag ON public.tareas_institucionales USING btree (depende_de_tarea_id) WHERE (depende_de_tarea_id IS NOT NULL);
CREATE INDEX idx_tareas_dependencia ON public.tareas_institucionales USING btree (dependencia_tarea_id) WHERE (dependencia_tarea_id IS NOT NULL);
CREATE INDEX idx_tareas_entidad ON public.tareas_institucionales USING btree (entidad_tipo, entidad_id);
CREATE INDEX idx_tareas_institucionales_estado ON public.tareas_institucionales USING btree (estado);
CREATE INDEX idx_tareas_institucionales_vencimiento ON public.tareas_institucionales USING btree (fecha_vencimiento);
CREATE INDEX idx_tareas_minuta ON public.tareas_institucionales USING btree (minuta_id);
CREATE INDEX idx_tareas_process_code ON public.tareas_institucionales USING btree (process_code);
CREATE UNIQUE INDEX uq_tareas_correlation_departamento ON public.tareas_institucionales USING btree (correlation_id, departamento) WHERE (correlation_id IS NOT NULL);
CREATE INDEX idx_tarea_comentarios_tarea ON public.tarea_comentarios USING btree (tarea_id, created_at);
CREATE INDEX idx_tarea_historial_tarea ON public.tarea_historial USING btree (tarea_id, created_at);
CREATE INDEX idx_tareas_departamento ON public.tareas_calendario USING btree (departamento_id);
CREATE INDEX idx_tareas_estado ON public.tareas_calendario USING btree (estado);
CREATE INDEX idx_tareas_evento ON public.tareas_calendario USING btree (evento_id);
CREATE INDEX telegram_allowed_users_activo_idx ON public.telegram_allowed_users USING btree (telegram_user_id) WHERE (activo = true);
CREATE UNIQUE INDEX telegram_allowed_users_telegram_user_id_key ON public.telegram_allowed_users USING btree (telegram_user_id);
CREATE INDEX telegram_messages_raw_chat_idx ON public.telegram_messages_raw USING btree (telegram_chat_id, created_at DESC);
CREATE UNIQUE INDEX telegram_messages_raw_telegram_message_id_key ON public.telegram_messages_raw USING btree (telegram_message_id);
CREATE INDEX telegram_messages_raw_user_idx ON public.telegram_messages_raw USING btree (telegram_user_id, created_at DESC);
CREATE INDEX idx_user_portal_access_portal_id ON public.user_portal_access USING btree (portal_id);
CREATE INDEX idx_user_portal_access_user_id ON public.user_portal_access USING btree (user_id);
CREATE UNIQUE INDEX user_portal_access_user_portal_unique ON public.user_portal_access USING btree (user_id, portal_id);
CREATE INDEX idx_usuario_departamentos ON public.usuario_departamentos USING btree (user_id, departamento_id);
CREATE UNIQUE INDEX usuario_departamentos_user_id_departamento_id_key ON public.usuario_departamentos USING btree (user_id, departamento_id);
CREATE INDEX idx_wallet_familia_created ON public.wallet_movimientos USING btree (familia_id, created_at DESC);
CREATE UNIQUE INDEX whatsapp_consentimientos_jid_campania_id_key ON public.whatsapp_consentimientos USING btree (jid, campania_id);
CREATE INDEX idx_webhook_log_created_at ON public.whatsapp_webhook_log USING btree (created_at DESC);
CREATE INDEX idx_webhook_log_message_id ON public.whatsapp_webhook_log USING btree (message_id);
CREATE INDEX idx_webhook_log_postulante ON public.whatsapp_webhook_log USING btree (postulante_id);

-- =====================================================================
-- VIEWS (43) - definitions in 02_DATABASE_INVENTORY.md
-- =====================================================================
--   VIEW alumno_clases
--   VIEW node_student_coverage
--   VIEW signage_v_calendario_mes
--   VIEW signage_v_horario_hoy
--   VIEW signage_v_horario_manana
--   VIEW signage_v_horario_semana
--   VIEW student_results
--   VIEW teacher_class_fill_metrics
--   VIEW teacher_class_fill_metrics_aggregated
--   VIEW v_semaforo_contenidos
--   VIEW view_evaluaciones_pedagogicas
--   VIEW view_node_difficulty
--   VIEW vw_activos_ociosos
--   VIEW vw_admin_enrollment_calendar
--   VIEW vw_alertas_activas
--   VIEW vw_alumno_estado_pago
--   VIEW vw_asistencias_clases_formato
--   VIEW vw_asistencias_consolidada
--   VIEW vw_clase_objetivo_estrellas
--   VIEW vw_comodatos_en_riesgo
--   VIEW vw_cupos_iniciacion
--   VIEW vw_destacados_y_riesgo_academico
--   VIEW vw_estadisticas_periodo
--   VIEW vw_estado_familiar
--   VIEW vw_evaluacion_indicador_global
--   VIEW vw_ia_alumnos
--   VIEW vw_ia_asistencias_resumen
--   VIEW vw_ia_inventario
--   VIEW vw_ia_maestros
--   VIEW vw_indice_ensenanza_guiada
--   VIEW vw_ingresos_diarios
--   VIEW vw_instrumentos_disponibles
--   VIEW vw_kpi_inventario
--   VIEW vw_mora_activa
--   VIEW vw_patron_asistencia
--   VIEW vw_prediccion_abandono
--   VIEW vw_rendimiento_maestro
--   VIEW vw_reparaciones_pendientes
--   VIEW vw_resumen_alumno
--   VIEW vw_riesgo_abandono
--   VIEW vw_score_representantes
--   VIEW vw_seguimiento_ausentes
--   VIEW vw_stock_bajo
-- [advisor ERROR] SECURITY DEFINER views: vw_mora_activa, vw_estado_familiar, signage_v_horario_semana,
--   signage_v_horario_hoy, signage_v_horario_manana, signage_v_calendario_mes, vw_asistencias_consolidada,
--   vw_seguimiento_ausentes, vw_indice_ensenanza_guiada
-- MATERIALIZED VIEWS: none.

-- =====================================================================
-- FUNCTIONS / RPC (~263) - grouped detail in 02_DATABASE_INVENTORY.md
-- =====================================================================
--   _fn_crear_tarea_caso(p_corr uuid, p_titulo text, p_desc text, p_depto soi_departamento, p_prioridad text, p_ent) -> void [SECURITY DEFINER]
--   actualizar_timestamp_permisos() -> trigger
--   actualizar_timestamp_solicitudes() -> trigger
--   analizar_seguimiento_alumnos(p_desde date, p_hasta date, p_limit integer, p_offset integer, p_busqueda text) -> TABLE(alumno_id uuid, nombre_c
--   approve_maestro_profile(p_profile_id uuid, p_new_rol text, p_new_estado text) -> jsonb [SECURITY DEFINER]
--   aprobar_usuario(p_user_id uuid) -> void [SECURITY DEFINER]
--   backfill_alumnos_desde_postulantes(dry_run boolean) -> TABLE(alumno_id uuid, alumno_n [SECURITY DEFINER]
--   cambiar_estado_activo(p_id uuid, p_nuevo_estado text) -> jsonb [SECURITY DEFINER]
--   cambiar_estado_reparacion(p_id uuid, p_nuevo_estado text) -> jsonb [SECURITY DEFINER]
--   cambiar_rol_usuario(p_user_id uuid, p_nuevo_rol text) -> void [SECURITY DEFINER]
--   capture_asistencia_marked_at() -> trigger
--   capture_observaciones_timestamps() -> trigger
--   check_permisos_maestros_integrity() -> trigger [SECURITY DEFINER]
--   clonar_catalogo_a_clase(p_clase_id uuid, p_nivel_id uuid, p_objetivo_general_ids uuid[]) -> TABLE(objetivo_id uuid, origen [SECURITY DEFINER]
--   clonar_plantilla_a_clase(p_clase_id uuid, p_plantilla_id uuid, p_node_ids uuid[]) -> TABLE(objetivo_id uuid, origen [SECURITY DEFINER]
--   clone_route_version_as_draft(p_source_version_id uuid) -> uuid [SECURITY DEFINER]
--   count_alumnos_activos() -> bigint [SECURITY DEFINER]
--   crear_reparacion(p_activo_id uuid, p_tipo_tallerista text, p_tallerista_nombre text, p_descripcion text, p_) -> jsonb [SECURITY DEFINER]
--   create_profile_for_maestro() -> trigger [SECURITY DEFINER]
--   diagnose_profiles_schema() -> jsonb [SECURITY DEFINER]
--   eliminar_maestro_limpio(p_maestro_id uuid) -> jsonb [SECURITY DEFINER]
--   ensure_session_and_save_evaluation(p_clase_id uuid, p_maestro_id uuid, p_fecha date, p_hora_inicio time with time zone, p_ind) -> uuid [SECURITY DEFINER]
--   es_admin() -> boolean [SECURITY DEFINER]
--   es_coordinador_acm() -> boolean [SECURITY DEFINER]
--   es_maestro_de_clase(p_clase_id uuid) -> boolean [SECURITY DEFINER]
--   es_maestro_titular_de_clase(p_clase_id uuid) -> boolean [SECURITY DEFINER]
--   fn_activar_campania(p_id uuid) -> json [SECURITY DEFINER]
--   fn_activar_periodo(p_periodo_id uuid) -> jsonb [SECURITY DEFINER]
--   fn_actualizar_contacto(p_tipo text, p_nombre text, p_campo text, p_valor text, p_secret text) -> TABLE(persona_nombre text, tip [SECURITY DEFINER]
--   fn_actualizar_estado_postulante(p_nombre text, p_nuevo_estado text, p_secret text) -> TABLE(postulante_nombre text,  [SECURITY DEFINER]
--   fn_actualizar_racha_alumno(p_alumno_id uuid, p_fecha date, p_clase_id uuid) -> void [SECURITY DEFINER]
--   fn_actualizar_tarea(p_tarea_id uuid, p_nuevo_estado text, p_notas text) -> json [SECURITY DEFINER]
--   fn_alumno_evaluaciones_recientes(p_alumno_id uuid) -> TABLE(evaluacion_id uuid, fech [SECURITY DEFINER]
--   fn_alumno_ficha_360(p_alumno_id uuid) -> TABLE(total_sesiones integer,  [SECURITY DEFINER]
--   fn_alumno_instrumentos_comodato(p_alumno_id uuid) -> TABLE(comodato_id uuid, tipo_c [SECURITY DEFINER]
--   fn_alumnos_inasistencias_pendiente(p_secret text) -> TABLE(alumno_nombre text, inas [SECURITY DEFINER]
--   fn_anular_sesiones_no_lectivas(p_dry_run boolean, p_desde date, p_hasta date) -> jsonb [SECURITY DEFINER]
--   fn_asignar_id_jerarquico() -> trigger
--   fn_asistencia_maestro_completar() -> trigger [SECURITY DEFINER]
--   fn_beca_anula_cuotas_abiertas() -> trigger [SECURITY DEFINER]
--   fn_bloquear_id_jerarquico() -> trigger
--   fn_bloquear_objetivo_jerarquico() -> trigger
--   fn_calcular_pulso_score(p_persistir boolean) -> jsonb [SECURITY DEFINER]
--   fn_calcular_score_representante(p_representante_id uuid, p_mes integer, p_anio integer) -> void [SECURITY DEFINER]
--   fn_camp_touch_updated_at() -> trigger
--   fn_cerrar_periodo_academico(p_periodo_id uuid, p_fecha_inicio date, p_fecha_fin date, p_cerrado_por uuid, p_observacio) -> jsonb [SECURITY DEFINER]
--   fn_check_and_notify_pending_asistencias() -> TABLE(notification_count integ [SECURITY DEFINER]
--   fn_cobertura_curricular(p_periodo_id uuid) -> jsonb [SECURITY DEFINER]
--   fn_com_seg_touch_updated_at() -> trigger
--   fn_correlacion_asistencia_rendimiento() -> numeric
--   fn_crear_evento_calendario(p_departamento_id uuid, p_titulo text, p_descripcion text, p_tipo text, p_fecha_inicio dat) -> json [SECURITY DEFINER]
--   fn_crear_familia_para_alumno(p_nombre text) -> uuid [SECURITY DEFINER]
--   fn_dar_de_baja_alumno(p_alumno_id uuid, p_motivo text, p_observaciones text, p_usuario_id uuid) -> jsonb [SECURITY DEFINER]
--   fn_datos_jerarquicos_de_objetivo(p_objetivo_id uuid) -> TABLE(clase_id uuid, level_num
--   fn_desplazar_cronograma_evento(p_event_id uuid, p_delta_dias integer) -> integer
--   fn_deuda_viva(p_alumno_id uuid, p_familia_id uuid) -> bigint [SECURITY DEFINER]
--   fn_dispatch_enrollment_reminders() -> integer [SECURITY DEFINER]
--   fn_eliminar_familia_huerfana(p_familia_id uuid) -> boolean [SECURITY DEFINER]
--   fn_email_departamento(p_codigo text) -> text [SECURITY DEFINER]
--   fn_emit_mora_event() -> trigger [SECURITY DEFINER]
--   fn_encolar_campania(p_campania_id uuid, p_limite integer) -> json [SECURITY DEFINER]
--   fn_enrollment_funnel_set_updated_at() -> trigger
--   fn_es_dia_lectivo(p_fecha date) -> boolean [SECURITY DEFINER]
--   fn_escalar_mora() -> void [SECURITY DEFINER]
--   fn_estado_asistencia_maestro(p_maestro_id uuid, p_desde date, p_hasta date) -> TABLE(fecha date, clase_id uui [SECURITY DEFINER]
--   fn_estado_calendario(p_fecha date) -> jsonb [SECURITY DEFINER]
--   fn_evaluacion_cobertura(p_clase_id uuid) -> json [SECURITY DEFINER]
--   fn_evaluar_logros_alumno(p_alumno_id uuid) -> void [SECURITY DEFINER]
--   fn_evaluar_reinscripcion(p_representante_cedula text, p_alumno_nombre text, p_alumno_fecha_nacimiento date, p_repre) -> jsonb [SECURITY DEFINER]
--   fn_fin_acquire_service_refresh_lock(p_service_account_id uuid, p_refresh_run_id uuid, p_lease_seconds integer) -> boolean [SECURITY DEFINER]
--   fn_fin_complete_service_refresh(p_service_account_id uuid, p_refresh_run_id uuid, p_status text, p_error_code text, p_reco) -> boolean [SECURITY DEFINER]
--   fn_fin_service_dashboard() -> TABLE(service_account_id uuid, [SECURITY DEFINER]
--   fn_fusionar_alumnos_duplicados(p_principal_id uuid, p_obsoleto_id uuid, p_datos_fusion jsonb) -> json [SECURITY DEFINER]
--   fn_generar_ciclo_cuotas(p_mes integer, p_anio integer, p_monto_centavos bigint) -> integer [SECURITY DEFINER]
--   fn_generar_instancias_gastos_fijos(p_mes integer, p_anio integer) -> integer [SECURITY DEFINER]
--   fn_generar_tareas_calendario(p_evento_id uuid) -> json [SECURITY DEFINER]
--   fn_generate_class_start_reminders() -> TABLE(notifications_created in [SECURITY DEFINER]
--   fn_get_indice_ensenanza_guiada() -> SETOF vw_indice_ensenanza_guia [SECURITY DEFINER]
--   fn_hermes_aprobar_whatsapp(p_queue_id uuid) -> void [SECURITY DEFINER]
--   fn_hermes_auto_delegar_tareas() -> trigger [SECURITY DEFINER]
--   fn_hermes_close_process_case(p_case_id uuid, p_closure_summary text, p_actor_id uuid, p_actor_nombre text, p_force bool) -> jsonb [SECURITY DEFINER]
--   fn_hermes_consulta_estado() -> json [SECURITY DEFINER]
--   fn_hermes_escalar_tareas_bloqueadas() -> void [SECURITY DEFINER]
--   fn_hermes_force_close_process_case(p_case_id uuid, p_closure_summary text, p_actor_id uuid, p_actor_nombre text) -> jsonb [SECURITY DEFINER]
--   fn_hermes_gateway_acquire_lease(p_instance_name text, p_owner_id text, p_duration_seconds integer) -> boolean [SECURITY DEFINER]
--   fn_hermes_gateway_get_live_status(p_instance_name text) -> TABLE(instance_name text, stat [SECURITY DEFINER]
--   fn_hermes_gateway_heartbeat(p_instance_name text, p_status text, p_phone text, p_battery integer, p_qr text, p_metadat) -> uuid [SECURITY DEFINER]
--   fn_hermes_gateway_release_lease(p_instance_name text, p_owner_id text) -> boolean [SECURITY DEFINER]
--   fn_hermes_orquestar_protocolo(p_evento_id uuid, p_protocolo_id uuid) -> TABLE(paso integer, tarea_id u [SECURITY DEFINER]
--   fn_hermes_outreach_gate_status(p_secret text) -> TABLE(whatsapp_ingest_enabled  [SECURITY DEFINER]
--   fn_hermes_queue_whatsapp(p_jid text, p_mensaje text) -> uuid [SECURITY DEFINER]
--   fn_hermes_rechazar_whatsapp(p_queue_id uuid, p_motivo text) -> void [SECURITY DEFINER]
--   fn_hermes_register_response(p_notif_id uuid, p_response_text text, p_sender_whatsapp text, p_sender_name text) -> json [SECURITY DEFINER]
--   fn_hermes_reintentar_mensaje(p_id uuid) -> uuid [SECURITY DEFINER]
--   fn_hermes_resolver_caso(p_case_id uuid, p_decision text) -> jsonb [SECURITY DEFINER]
--   fn_hermes_rules_update_updated_at() -> trigger
--   fn_hermes_start_process_case(p_process_code text, p_title text, p_description text, p_source text, p_priority text, p_r) -> uuid [SECURITY DEFINER]
--   fn_hermes_tarea_completada_feedback() -> trigger [SECURITY DEFINER]
--   fn_hermes_update_notif(p_id uuid, p_estado_wa text, p_respuesta text) -> void [SECURITY DEFINER]
--   fn_historial_activo() -> trigger [SECURITY DEFINER]
--   fn_historial_comodato() -> trigger [SECURITY DEFINER]
--   fn_historial_reparacion() -> trigger [SECURITY DEFINER]
--   fn_listar_protocolos() -> json [SECURITY DEFINER]
--   fn_lookup_maestro_contacto(p_nombre text, p_secret text) -> TABLE(maestro_nombre text, jid [SECURITY DEFINER]
--   fn_lookup_representante_contacto(p_nombre text, p_secret text) -> TABLE(alumno_nombre text, repr [SECURITY DEFINER]
--   fn_lut_diagnosticos_recalc_costo() -> trigger
--   fn_lut_upsert_diagnostico(p_orden_id uuid, p_diagnostico_tecnico text, p_items jsonb, p_causa_probable text, p_tipo_) -> uuid [SECURITY DEFINER]
--   fn_maestros_asistencia_pendiente(p_secret text) -> TABLE(maestro_nombre text, cla [SECURITY DEFINER]
--   fn_marcar_asistencia(p_alumno text, p_clase text, p_fecha date, p_nuevo_estado text, p_secret text) -> TABLE(alumno_nombre text, clas [SECURITY DEFINER]
--   fn_morning_admissions_briefing() -> text [SECURITY DEFINER]
--   fn_notify_maestro_ausencia() -> trigger
--   fn_observar_tarea(p_tarea_id uuid, p_comentario text, p_actor_id uuid, p_actor_nombre text) -> void [SECURITY DEFINER]
--   fn_obtener_eventos_proximos(p_dias_desde integer, p_dias_hasta integer) -> json [SECURITY DEFINER]
--   fn_obtener_protocolo(p_tipo text) -> json [SECURITY DEFINER]
--   fn_obtener_tareas_departamento(p_departamento_id uuid, p_estado text) -> json [SECURITY DEFINER]
--   fn_periodo_vigente(p_fecha date) -> uuid [SECURITY DEFINER]
--   fn_portal_maestro_bloqueado() -> boolean [SECURITY DEFINER]
--   fn_prevent_periodo_reopen() -> trigger [SECURITY DEFINER]
--   fn_preview_campania(p_id uuid) -> json [SECURITY DEFINER]
--   fn_procedimientos_resumen() -> TABLE(correlation_id uuid, tit [SECURITY DEFINER]
--   fn_racha_ausencias(p_alumno_id uuid) -> integer
--   fn_reactivar_alumno(p_alumno_id uuid, p_usuario_id uuid, p_nueva_familia_id uuid) -> jsonb [SECURITY DEFINER]
--   fn_recalcular_bloqueos_familia(p_familia_id uuid) -> jsonb [SECURITY DEFINER]
--   fn_registrar_alerta_enviada(p_tipo text, p_canal text, p_destinatario text, p_contenido text) -> json [SECURITY DEFINER]
--   fn_registrar_pago_transaccional(p_familia_id uuid, p_monto_centavos bigint, p_metodo_pago text, p_referencia text, p_notas) -> pagos [SECURITY DEFINER]
--   fn_reinscripcion_rol_autorizado() -> boolean [SECURITY DEFINER]
--   fn_reportar_alumno_riesgo(p_alumno_id uuid, p_alumno_nombre text, p_motivo text, p_actor_id uuid, p_actor_nombre tex) -> uuid [SECURITY DEFINER]
--   fn_reportar_instrumento_danado(p_instrumento_id uuid, p_descripcion text, p_actor_id uuid, p_actor_nombre text) -> uuid [SECURITY DEFINER]
--   fn_reporte_cierre_semestre(p_periodo_id uuid, p_escala_calificacion numeric, p_umbral_nota_pct numeric, p_umbral_asis) -> jsonb [SECURITY DEFINER]
--   fn_reporte_indicadores_adicionales(p_periodo_id uuid, p_cobertura_minima_pct numeric) -> jsonb [SECURITY DEFINER]
--   fn_resumen_academico_integrado(p_alumno_id uuid, p_limite integer) -> jsonb [SECURITY DEFINER]
--   fn_resumen_cumplimiento_asistencia(p_desde date, p_hasta date, p_maestro_id uuid) -> TABLE(maestro_id uuid, maestro [SECURITY DEFINER]
--   fn_resumen_diario_director() -> json [SECURITY DEFINER]
--   fn_servicio_publico_activo() -> boolean [SECURITY DEFINER]
--   fn_set_updated_at() -> trigger
--   fn_set_updated_at_alianzas() -> trigger
--   fn_signage_set_updated_at() -> trigger
--   fn_sim_set_updated_at() -> trigger
--   fn_sincronizar_arbol_curricular(p_clase_id uuid, p_nombre text, p_objetivos jsonb, p_plantilla_id uuid) -> uuid [SECURITY DEFINER]
--   fn_soi_evento_asistencia_falta() -> trigger [SECURITY DEFINER]
--   fn_soi_evento_asistencia_registrada() -> trigger [SECURITY DEFINER]
--   fn_soi_evento_justificacion() -> trigger [SECURITY DEFINER]
--   fn_soi_evento_periodo() -> trigger [SECURITY DEFINER]
--   fn_soi_evento_periodo_abierto() -> trigger [SECURITY DEFINER]
--   fn_soi_evento_sesion_creada() -> trigger [SECURITY DEFINER]
--   fn_soi_evento_tarea() -> trigger [SECURITY DEFINER]
--   fn_solicitudes_necesidades_open_process_case() -> trigger [SECURITY DEFINER]
--   fn_sugerir_nodo_por_texto(p_texto text) -> TABLE(codigo text, nombre text
--   fn_sync_campania_envio_estado() -> trigger [SECURITY DEFINER]
--   fn_sync_estado_reparacion() -> trigger [SECURITY DEFINER]
--   fn_sync_estado_uso_activo() -> trigger
--   fn_tarea_log_historial() -> trigger [SECURITY DEFINER]
--   fn_tasa_asistencia_periodo(p_alumno_id uuid, p_desde date, p_hasta date) -> numeric
--   fn_trigger_desbloqueo_tareas_dependientes() -> trigger
--   fn_trigger_evaluacion_gamificacion() -> trigger [SECURITY DEFINER]
--   fn_trigger_hermes_task_wa_alert() -> trigger [SECURITY DEFINER]
--   fn_trigger_historial_estado_alumno() -> trigger [SECURITY DEFINER]
--   fn_update_notif_asistencia_timestamp() -> trigger
--   fn_update_notifications_on_attendance_change() -> trigger [SECURITY DEFINER]
--   fn_upsert_protocolo(p_nombre text, p_tipo text, p_descripcion text, p_tareas jsonb) -> json [SECURITY DEFINER]
--   fn_validar_checklist_tarea() -> trigger [SECURITY DEFINER]
--   fn_validar_cierre_periodo(p_periodo_id uuid) -> jsonb [SECURITY DEFINER]
--   fn_validar_reinscripcion_alumno(p_alumno_id uuid) -> jsonb [SECURITY DEFINER]
--   fn_validate_maestro_disponibilidad_horario() -> trigger
--   fn_validate_salon_capacity_horario() -> trigger
--   fn_validate_salon_no_overlap() -> trigger
--   fn_verificar_conflicto_cita(p_fecha_inicio timestamp with time zone, p_fecha_fin timestamp with time zone, p_departame) -> TABLE(hay_conflicto boolean, e [SECURITY DEFINER]
--   fn_verificar_stock_minimo() -> trigger [SECURITY DEFINER]
--   fn_whatsapp_cap_hoy() -> integer [SECURITY DEFINER]
--   fn_whatsapp_enviados_hoy() -> integer [SECURITY DEFINER]
--   fn_whatsapp_optout(p_jid text, p_motivo text) -> void [SECURITY DEFINER]
--   fn_whatsapp_rate_excedido(p_jid text) -> boolean [SECURITY DEFINER]
--   fn_whatsapp_reclamar_pendientes(p_limite integer) -> SETOF hermes_whatsapp_queue [SECURITY DEFINER]
--   generar_contrato_pdf(p_comodato_id uuid) -> jsonb [SECURITY DEFINER]
--   generar_numero_factura() -> character varying
--   generar_reporte_inventario(p_tipo text, p_filtros jsonb) -> jsonb [SECURITY DEFINER]
--   generate_pending_class_notifications() -> TABLE(maestros_processed integ
--   generate_salon_code() -> trigger
--   get_alumnos_disponibles_para_inscripcion() -> TABLE(id uuid, nombre_completo [SECURITY DEFINER]
--   get_app_user_role() -> text [SECURITY DEFINER]
--   get_informe_academico_semestral(p_periodo_id uuid) -> jsonb [SECURITY DEFINER]
--   get_my_rol() -> text [SECURITY DEFINER]
--   get_resumen_academico_mensual(p_periodo_id uuid, p_mes integer, p_anio integer) -> jsonb [SECURITY DEFINER]
--   get_user_department() -> text [SECURITY DEFINER]
--   get_user_familia_id() -> uuid [SECURITY DEFINER]
--   get_user_portales(p_user_id uuid) -> TABLE(portal_id text, nombre t [SECURITY DEFINER]
--   get_user_role() -> text [SECURITY DEFINER]
--   gin_extract_query_trgm(text, internal, smallint, internal, internal, internal, internal) -> internal
--   gin_extract_value_trgm(text, internal) -> internal
--   gin_trgm_consistent(internal, smallint, text, integer, internal, internal, internal, internal) -> boolean
--   gin_trgm_triconsistent(internal, smallint, text, integer, internal, internal, internal) -> "char"
--   gtrgm_compress(internal) -> internal
--   gtrgm_consistent(internal, text, smallint, oid, internal) -> boolean
--   gtrgm_decompress(internal) -> internal
--   gtrgm_distance(internal, text, smallint, oid, internal) -> double precision
--   gtrgm_in(cstring) -> gtrgm
--   gtrgm_options(internal) -> void
--   gtrgm_out(gtrgm) -> cstring
--   gtrgm_penalty(internal, internal, internal) -> internal
--   gtrgm_picksplit(internal, internal) -> internal
--   gtrgm_same(gtrgm, gtrgm, internal) -> internal
--   gtrgm_union(internal, internal) -> gtrgm
--   handle_new_auth_user() -> trigger [SECURITY DEFINER]
--   handle_new_user() -> trigger [SECURITY DEFINER]
--   handle_profile_insert_maestro() -> trigger [SECURITY DEFINER]
--   has_portal_access(p_portal_id text, p_user_id uuid) -> boolean [SECURITY DEFINER]
--   intercambiar_instrumentos(p_comodato_origen_id uuid, p_activo_destino_id uuid, p_alumno_id uuid) -> jsonb [SECURITY DEFINER]
--   is_admin() -> boolean [SECURITY DEFINER]
--   is_app_admin() -> boolean [SECURITY DEFINER]
--   is_super_admin() -> boolean [SECURITY DEFINER]
--   is_teacher() -> boolean [SECURITY DEFINER]
--   maestro_actual() -> uuid [SECURITY DEFINER]
--   maestro_en_clase(p_clase_id uuid) -> boolean
--   norm_cedula(p text) -> text
--   normalizar_tel_rd(raw text) -> text
--   normalize_phone(raw text) -> text
--   obtener_kpi_inventario() -> jsonb [SECURITY DEFINER]
--   on_notification_inserted() -> trigger [SECURITY DEFINER]
--   preview_retiro_maestro(p_maestro_id uuid) -> jsonb [SECURITY DEFINER]
--   profile_is_active() -> boolean [SECURITY DEFINER]
--   reactivar_maestro_seguro(p_maestro_id uuid) -> void [SECURITY DEFINER]
--   rechazar_usuario(p_user_id uuid) -> void [SECURITY DEFINER]
--   refresh_maestro_desempeno() -> void [SECURITY DEFINER]
--   registrar_justificacion_asistencia(p_clase_id uuid, p_alumno_id uuid, p_fecha date, p_motivo text) -> uuid
--   registrar_sesion_bitacora(p_clase_id uuid, p_objetivo_id uuid, p_fecha date, p_notas jsonb) -> uuid
--   renovar_comodato(p_comodato_id uuid, p_nueva_fecha_vencimiento date, p_nuevo_tipo text) -> jsonb [SECURITY DEFINER]
--   retirar_maestro_seguro(p_maestro_id uuid, p_reemplazo_maestro_id uuid, p_motivo text) -> jsonb [SECURITY DEFINER]
--   set_evaluations_updated_at() -> trigger
--   set_limit(real) -> real
--   set_updated_at() -> trigger
--   set_user_portales(p_user_id uuid, p_portal_ids text[]) -> jsonb [SECURITY DEFINER]
--   show_limit() -> real
--   show_trgm(text) -> text[]
--   similarity(text, text) -> real
--   similarity_dist(text, text) -> real
--   similarity_op(text, text) -> boolean
--   strict_word_similarity(text, text) -> real
--   strict_word_similarity_commutator_op(text, text) -> boolean
--   strict_word_similarity_dist_commutator_op(text, text) -> real
--   strict_word_similarity_dist_op(text, text) -> real
--   strict_word_similarity_op(text, text) -> boolean
--   teacher_can_create_students() -> boolean [SECURITY DEFINER]
--   tg_alumno_suspensiones_touch() -> trigger
--   tg_retenciones_levantar() -> trigger
--   tg_retenciones_touch() -> trigger
--   tiene_permiso(p_permiso text) -> boolean
--   touch_maestro_access_credentials_updated_at() -> trigger
--   update_catalogo_timestamp() -> trigger
--   update_cmi_timestamp() -> trigger
--   update_cmo_timestamp() -> trigger
--   update_ei_timestamp() -> trigger
--   update_mp_timestamp() -> trigger
--   update_profile(p_id uuid, p_nombre_completo text, p_avatar_url text) -> void [SECURITY DEFINER]
--   update_sb_timestamp() -> trigger
--   update_updated_at() -> trigger
--   update_updated_at_column() -> trigger
--   validate_admin_invite_code(p_code text) -> boolean [SECURITY DEFINER]
--   validate_disponibilidad_json(p_json jsonb) -> boolean
--   word_similarity(text, text) -> real
--   word_similarity_commutator_op(text, text) -> boolean
--   word_similarity_dist_commutator_op(text, text) -> real
--   word_similarity_dist_op(text, text) -> real
--   word_similarity_op(text, text) -> boolean

-- =====================================================================
-- TRIGGERS (95)
-- =====================================================================
--   accesorios: trg_verificar_stock_minimo AFTER UPDATE -> fn_verificar_stock_minimo()
--   alumno_suspensiones: trg_alumno_suspensiones_touch BEFORE UPDATE -> tg_alumno_suspensiones_touch()
--   alumnos: trg_historial_estado_alumno AFTER UPDATE -> fn_trigger_historial_estado_alumno()
--   alumnos: update_alumnos_updated_at BEFORE UPDATE -> update_updated_at_column()
--   applicants: trg_applicants_set_updated_at BEFORE UPDATE -> fn_enrollment_funnel_set_updated_at()
--   appointments: trg_appointments_set_updated_at BEFORE UPDATE -> fn_enrollment_funnel_set_updated_at()
--   asistencia_maestros: trg_asistencia_maestro_completar BEFORE INSERT,UPDATE -> fn_asistencia_maestro_completar()
--   asistencias: trg_asistencia_marked_at BEFORE UPDATE,INSERT -> capture_asistencia_marked_at()
--   asistencias: trg_soi_evento_asistencia_falta AFTER UPDATE -> fn_soi_evento_asistencia_falta()
--   asistencias: trg_soi_evento_asistencia_registrada AFTER INSERT -> fn_soi_evento_asistencia_registrada()
--   asistencias: update_asistencias_updated_at BEFORE UPDATE -> update_updated_at_column()
--   ausencias: tg_ausencia_notify AFTER INSERT -> fn_notify_maestro_ausencia()
--   becas: trg_beca_anula_cuotas_abiertas AFTER UPDATE,INSERT -> fn_beca_anula_cuotas_abiertas()
--   calendario_institucional: trg_hermes_event_inserted AFTER INSERT -> fn_hermes_auto_delegar_tareas()
--   catalogo_niveles: trg_catn_updated_at BEFORE UPDATE -> update_catalogo_timestamp()
--   catalogo_objetivos_especificos: trg_catoe_updated_at BEFORE UPDATE -> update_catalogo_timestamp()
--   catalogo_objetivos_generales: trg_catog_updated_at BEFORE UPDATE -> update_catalogo_timestamp()
--   clase_mapa_indicadores: trg_asignar_id_jerarquico BEFORE INSERT -> fn_asignar_id_jerarquico()
--   clase_mapa_indicadores: trg_bloquear_id_jerarquico BEFORE UPDATE -> fn_bloquear_id_jerarquico()
--   clase_mapa_indicadores: trg_cmi_updated_at BEFORE UPDATE -> update_cmi_timestamp()
--   clase_mapa_objetivos: trg_bloquear_objetivo_jerarquico BEFORE UPDATE -> fn_bloquear_objetivo_jerarquico()
--   clase_mapa_objetivos: trg_cmo_updated_at BEFORE UPDATE -> update_cmo_timestamp()
--   clases: update_clases_updated_at BEFORE UPDATE -> update_updated_at_column()
--   class_events: trg_class_events_updated_at BEFORE UPDATE -> set_updated_at()
--   comodatos_activos: trg_comodato_sync_estado_uso AFTER INSERT,UPDATE -> fn_sync_estado_uso_activo()
--   comodatos_activos: trg_historial_comodato AFTER INSERT,UPDATE -> fn_historial_comodato()
--   comunicaciones_seguimiento: trg_com_seg_updated_at BEFORE UPDATE -> fn_com_seg_touch_updated_at()
--   configuracion_recordatorios: update_configuracion_recordatorios_updated_at BEFORE UPDATE -> update_updated_at_column()
--   contactos_alianzas: trg_contactos_alianzas_updated_at BEFORE UPDATE -> fn_set_updated_at_alianzas()
--   ejercicios: update_ejercicios_updated_at BEFORE UPDATE -> update_updated_at_column()
--   evaluacion_indicador: trg_ei_updated_at BEFORE UPDATE -> update_ei_timestamp()
--   evaluacion_indicador: trg_evaluacion_indicador_gamificacion AFTER INSERT,UPDATE -> fn_trigger_evaluacion_gamificacion()
--   evaluations: trg_evaluations_updated_at BEFORE UPDATE -> set_evaluations_updated_at()
--   hermes_reactive_rules: trg_hermes_rules_update_updated_at BEFORE UPDATE -> fn_hermes_rules_update_updated_at()
--   hermes_whatsapp_queue: trg_sync_campania_envio AFTER UPDATE -> fn_sync_campania_envio_estado()
--   horarios: update_horarios_updated_at BEFORE UPDATE -> update_updated_at_column()
--   inventario_activos: trg_historial_activo AFTER INSERT,UPDATE -> fn_historial_activo()
--   inventario_reparaciones: trg_historial_reparacion AFTER UPDATE,INSERT -> fn_historial_reparacion()
--   inventario_reparaciones: trg_sync_estado_reparacion AFTER INSERT,UPDATE -> fn_sync_estado_reparacion()
--   justificaciones: trg_soi_evento_justificacion AFTER INSERT,UPDATE -> fn_soi_evento_justificacion()
--   justificaciones: trigger_justificaciones_updated_at BEFORE UPDATE -> update_updated_at_column()
--   logros: update_logros_updated_at BEFORE UPDATE -> update_updated_at_column()
--   lut_diagnosticos: trg_lut_diagnosticos_recalc_costo BEFORE UPDATE,INSERT -> fn_lut_diagnosticos_recalc_costo()
--   maestro_access_credentials: trg_maestro_access_credentials_updated_at BEFORE UPDATE -> touch_maestro_access_credentials_updated_at()
--   maestros: trigger_auto_profile_maestro AFTER INSERT -> create_profile_for_maestro()
--   maestros: update_maestros_updated_at BEFORE UPDATE -> update_updated_at_column()
--   mapa_plantillas: trg_mp_updated_at BEFORE UPDATE -> update_mp_timestamp()
--   modulos: update_modulos_updated_at BEFORE UPDATE -> update_updated_at_column()
--   niveles: update_niveles_updated_at BEFORE UPDATE -> update_updated_at_column()
--   notificaciones: trigger_on_notification_inserted AFTER INSERT -> on_notification_inserted()
--   notificaciones: update_notificaciones_updated_at BEFORE UPDATE -> update_updated_at_column()
--   notificaciones_asistencia: trg_notif_asistencia_update_timestamp BEFORE UPDATE -> fn_update_notif_asistencia_timestamp()
--   observaciones_alumnos: trg_obs_alumnos_updated_at BEFORE UPDATE -> set_updated_at()
--   observaciones_alumnos: update_observaciones_alumnos_updated_at BEFORE UPDATE -> update_updated_at_column()
--   observaciones_sesion: observaciones_sesion_updated_at BEFORE UPDATE -> update_updated_at()
--   observaciones_sesion: trg_observaciones_timestamps BEFORE UPDATE,INSERT -> capture_observaciones_timestamps()
--   pagos_alumnos: trg_mora_emit_hermes AFTER INSERT -> fn_emit_mora_event()
--   periodos: trg_periodos_updated_at BEFORE UPDATE -> fn_set_updated_at()
--   periodos: trg_prevent_periodo_reopen BEFORE UPDATE -> fn_prevent_periodo_reopen()
--   periodos: trg_soi_evento_periodo AFTER UPDATE -> fn_soi_evento_periodo()
--   periodos: trg_soi_evento_periodo_abierto AFTER INSERT -> fn_soi_evento_periodo_abierto()
--   permisos_maestros: set_actualizado_en_permisos BEFORE UPDATE -> actualizar_timestamp_permisos()
--   permisos_maestros: trigger_check_permisos_maestros_integrity BEFORE UPDATE,INSERT -> check_permisos_maestros_integrity()
--   planificaciones: trg_planificaciones_updated_at BEFORE UPDATE -> set_updated_at()
--   planificaciones: update_planificaciones_updated_at BEFORE UPDATE -> update_updated_at_column()
--   profiles: on_profile_insert_maestro AFTER INSERT -> handle_profile_insert_maestro()
--   profiles: update_profiles_updated_at BEFORE UPDATE -> update_updated_at_column()
--   programas: update_programas_updated_at BEFORE UPDATE -> update_updated_at_column()
--   progresos: trg_progresos_updated_at BEFORE UPDATE -> set_updated_at()
--   progresos: update_progresos_updated_at BEFORE UPDATE -> update_updated_at_column()
--   push_subscriptions: update_push_subscriptions_updated_at BEFORE UPDATE -> update_updated_at_column()
--   registros_pendientes: update_registros_pendientes_updated_at BEFORE UPDATE -> update_updated_at_column()
--   retenciones_instrumento: trg_retenciones_levantar BEFORE UPDATE -> tg_retenciones_levantar()
--   retenciones_instrumento: trg_retenciones_touch BEFORE UPDATE -> tg_retenciones_touch()
--   salones: tr_generate_salon_code BEFORE INSERT -> generate_salon_code()
--   salones: update_salones_updated_at BEFORE UPDATE -> update_updated_at_column()
--   sesiones_clase: trg_soi_evento_sesion_creada AFTER INSERT -> fn_soi_evento_sesion_creada()
--   sesiones_clase: trg_update_notifications_on_attendance AFTER INSERT,UPDATE -> fn_update_notifications_on_attendance_change()
--   sesiones_clase: update_sesiones_clase_updated_at BEFORE UPDATE -> update_updated_at_column()
--   signage_media: trg_signage_media_updated_at BEFORE UPDATE -> fn_signage_set_updated_at()
--   signage_pantallas: trg_signage_pantallas_updated_at BEFORE UPDATE -> fn_signage_set_updated_at()
--   sim_calendario: trg_sim_calendario_updated_at BEFORE UPDATE -> fn_sim_set_updated_at()
--   sim_config: trg_sim_config_updated_at BEFORE UPDATE -> fn_sim_set_updated_at()
--   sim_outbox: trg_sim_outbox_updated_at BEFORE UPDATE -> fn_sim_set_updated_at()
--   sim_runs: trg_sim_runs_updated_at BEFORE UPDATE -> fn_sim_set_updated_at()
--   sim_tareas: trg_sim_tareas_updated_at BEFORE UPDATE -> fn_sim_set_updated_at()
--   solicitudes_necesidades: trg_solicitudes_necesidades_open_case AFTER INSERT -> fn_solicitudes_necesidades_open_process_case()
--   solicitudes_permisos: set_actualizado_en_solicitudes BEFORE UPDATE -> actualizar_timestamp_solicitudes()
--   tareas_institucionales: trg_desbloqueo_tareas AFTER UPDATE -> fn_trigger_desbloqueo_tareas_dependientes()
--   tareas_institucionales: trg_hermes_tarea_completada_feedback AFTER UPDATE -> fn_hermes_tarea_completada_feedback()
--   tareas_institucionales: trg_hermes_task_wa_alert AFTER INSERT -> fn_trigger_hermes_task_wa_alert()
--   tareas_institucionales: trg_soi_evento_tarea AFTER INSERT,UPDATE -> fn_soi_evento_tarea()
--   tareas_institucionales: trg_tarea_log_historial AFTER UPDATE -> fn_tarea_log_historial()
--   tareas_institucionales: trg_validar_checklist BEFORE UPDATE -> fn_validar_checklist_tarea()
--   unidades: update_unidades_updated_at BEFORE UPDATE -> update_updated_at_column()

-- =====================================================================
-- RLS POLICIES (~591 across 210 tables) - summary here, full detail in 05_*.md
-- =====================================================================
--   academic_plans: 3 policies {'INSERT': 1, 'SELECT': 2}
--   accesorios: 3 policies {'ALL': 1, 'SELECT': 1, 'UPDATE': 1}
--   acm_active_routes: 1 policies {'ALL': 1}
--   acm_curriculum_sources: 2 policies {'ALL': 1, 'SELECT': 1}
--   acm_curriculum_versions: 2 policies {'ALL': 1, 'SELECT': 1}
--   acm_evidence_files: 1 policies {'ALL': 1}
--   acm_teacher_week_adjustments: 1 policies {'ALL': 1}
--   acm_weekly_plan_items: 2 policies {'ALL': 1, 'SELECT': 1}
--   acm_weekly_plans: 2 policies {'ALL': 1, 'SELECT': 1}
--   alertas_log: 1 policies {'ALL': 1}
--   alumno_escolaridad: 1 policies {'ALL': 1}
--   alumno_plan_entradas: 4 policies {'DELETE': 1, 'INSERT': 1, 'SELECT': 1, 'UPDATE': 1}
--   alumno_suspensiones: 2 policies {'SELECT': 1, 'ALL': 1}
--   alumnos: 9 policies {'SELECT': 3, 'INSERT': 3, 'UPDATE': 2, 'DELETE': 1}
--   alumnos_clases: 6 policies {'SELECT': 3, 'DELETE': 1, 'INSERT': 1, 'UPDATE': 1}
--   alumnos_logros: 2 policies {'SELECT': 1, 'ALL': 1}
--   alumnos_programas: 3 policies {'SELECT': 2, 'ALL': 1}
--   alumnos_reinscripciones: 1 policies {'SELECT': 1}
--   aplicaciones_pago: 1 policies {'SELECT': 1}
--   app_users: 4 policies {'ALL': 1, 'SELECT': 1, 'INSERT': 1, 'UPDATE': 1}
--   applicant_events: 3 policies {'ALL': 2, 'SELECT': 1}
--   applicants: 3 policies {'ALL': 2, 'SELECT': 1}
--   appointments: 4 policies {'ALL': 2, 'SELECT': 1, 'UPDATE': 1}
--   asistencia_maestros: 2 policies {'ALL': 1, 'SELECT': 1}
--   asistencias: 5 policies {'ALL': 1, 'INSERT': 1, 'SELECT': 1, 'UPDATE': 1, 'DELETE': 1}
--   ausencias: 4 policies {'SELECT': 2, 'ALL': 2}
--   ausencias_auditoria: 2 policies {'INSERT': 1, 'SELECT': 1}
--   ausencias_maestros: 4 policies {'UPDATE': 1, 'INSERT': 1, 'SELECT': 2}
--   becas: 2 policies {'ALL': 1, 'SELECT': 1}
--   blocks: 3 policies {'SELECT': 2, 'ALL': 1}
--   calendario: 4 policies {'ALL': 1, 'INSERT': 1, 'SELECT': 1, 'UPDATE': 1}
--   calendario_institucional: 1 policies {'ALL': 1}
--   campania_envios: 1 policies {'ALL': 1}
--   campanias_periodo: 1 policies {'ALL': 1}
--   catalogo_niveles: 2 policies {'ALL': 1, 'SELECT': 1}
--   catalogo_objetivos_especificos: 2 policies {'ALL': 1, 'SELECT': 1}
--   catalogo_objetivos_generales: 2 policies {'ALL': 1, 'SELECT': 1}
--   catalogos: 1 policies {'SELECT': 1}
--   clase_horarios: 8 policies {'UPDATE': 2, 'INSERT': 2, 'DELETE': 2, 'SELECT': 2}
--   clase_mapa_indicadores: 1 policies {'ALL': 1}
--   clase_mapa_objetivos: 1 policies {'ALL': 1}
--   clases: 6 policies {'SELECT': 3, 'UPDATE': 1, 'INSERT': 1, 'DELETE': 1}
--   clases_emergentes: 5 policies {'SELECT': 2, 'DELETE': 1, 'INSERT': 1, 'UPDATE': 1}
--   class_event_methodology: 5 policies {'DELETE': 1, 'INSERT': 1, 'SELECT': 2, 'UPDATE': 1}
--   class_events: 5 policies {'DELETE': 1, 'INSERT': 1, 'SELECT': 2, 'UPDATE': 1}
--   class_session_content_snapshots: 3 policies {'INSERT': 1, 'SELECT': 2}
--   cobertura_alumno_objetivo: 3 policies {'INSERT': 1, 'SELECT': 1, 'UPDATE': 1}
--   comodatos_activos: 3 policies {'INSERT': 1, 'UPDATE': 1, 'SELECT': 1}
--   compromisos_pago: 2 policies {'ALL': 1, 'SELECT': 1}
--   comunicaciones_seguimiento: 4 policies {'DELETE': 1, 'INSERT': 1, 'SELECT': 1, 'UPDATE': 1}
--   configuracion_aranceles: 2 policies {'ALL': 1, 'SELECT': 1}
--   configuracion_recordatorios: 2 policies {'SELECT': 1, 'ALL': 1}
--   contactos_alianzas: 1 policies {'ALL': 1}
--   contenidos_sesion: 7 policies {'ALL': 3, 'INSERT': 1, 'SELECT': 1, 'UPDATE': 1, 'DELETE': 1}
--   conversaciones_whatsapp: 1 policies {'ALL': 1}
--   cuotas: 4 policies {'INSERT': 1, 'SELECT': 2, 'UPDATE': 1}
--   curriculo_objetivos: 4 policies {'DELETE': 1, 'INSERT': 1, 'SELECT': 1, 'UPDATE': 1}
--   curriculo_pilares: 4 policies {'DELETE': 1, 'INSERT': 1, 'SELECT': 1, 'UPDATE': 1}
--   curriculos: 4 policies {'DELETE': 1, 'INSERT': 1, 'SELECT': 1, 'UPDATE': 1}
--   departamentos: 1 policies {'ALL': 1}
--   document_batches: 1 policies {'ALL': 1}
--   document_templates: 1 policies {'ALL': 1}
--   ejercicios: 2 policies {'SELECT': 1, 'ALL': 1}
--   evaluacion_indicador: 6 policies {'ALL': 2, 'DELETE': 1, 'INSERT': 1, 'SELECT': 1, 'UPDATE': 1}
--   evaluations: 4 policies {'DELETE': 1, 'INSERT': 1, 'SELECT': 1, 'UPDATE': 1}
--   facturas_reparacion: 4 policies {'DELETE': 1, 'INSERT': 1, 'UPDATE': 1, 'SELECT': 1}
--   familias: 3 policies {'ALL': 1, 'SELECT': 2}
--   finanzas_politica_cobranza: 1 policies {'SELECT': 1}
--   gastos_fijos: 3 policies {'INSERT': 1, 'SELECT': 1, 'UPDATE': 1}
--   gastos_fijos_pagos: 3 policies {'INSERT': 1, 'SELECT': 1, 'UPDATE': 1}
--   generated_documents: 1 policies {'ALL': 1}
--   hermes_gateway_health: 2 policies {'SELECT': 1, 'ALL': 1}
--   hermes_gateway_worker_lease: 1 policies {'ALL': 1}
--   hermes_inbox: 1 policies {'ALL': 1}
--   hermes_kanban_cards: 2 policies {'ALL': 1, 'SELECT': 1}
--   hermes_process_cases: 1 policies {'ALL': 1}
--   hermes_protocolos: 2 policies {'ALL': 1, 'SELECT': 1}
--   hermes_reactive_rules: 14 policies {'SELECT': 8, 'UPDATE': 4, 'INSERT': 1, 'ALL': 1}
--   hermes_whatsapp_config: 2 policies {'ALL': 2}
--   hermes_whatsapp_queue: 2 policies {'SELECT': 1, 'ALL': 1}
--   historial_estado_alumno: 1 policies {'SELECT': 1}
--   homework_assignments: 5 policies {'SELECT': 2, 'DELETE': 1, 'INSERT': 1, 'UPDATE': 1}
--   horarios: 5 policies {'UPDATE': 1, 'INSERT': 1, 'DELETE': 1, 'SELECT': 1, 'ALL': 1}
--   indicador_prerequisito: 3 policies {'DELETE': 1, 'SELECT': 1, 'INSERT': 1}
--   indicator_attempts: 7 policies {'SELECT': 4, 'DELETE': 1, 'INSERT': 1, 'UPDATE': 1}
--   indicator_session_students: 2 policies {'INSERT': 1, 'SELECT': 1}
--   indicator_sessions: 3 policies {'INSERT': 1, 'SELECT': 1, 'UPDATE': 1}
--   indicators: 3 policies {'SELECT': 2, 'ALL': 1}
--   instrumentos: 1 policies {'ALL': 1}
--   inventario_accesorios: 4 policies {'DELETE': 1, 'INSERT': 1, 'UPDATE': 1, 'SELECT': 1}
--   inventario_activos: 3 policies {'INSERT': 1, 'UPDATE': 1, 'SELECT': 1}
--   inventario_historial: 3 policies {'DELETE': 1, 'INSERT': 1, 'SELECT': 1}
--   inventario_materiales: 4 policies {'DELETE': 1, 'INSERT': 1, 'UPDATE': 1, 'SELECT': 1}
--   inventario_reparaciones: 4 policies {'DELETE': 1, 'INSERT': 1, 'UPDATE': 1, 'SELECT': 1}
--   justificaciones: 5 policies {'INSERT': 1, 'SELECT': 1, 'UPDATE': 1, 'DELETE': 1, 'ALL': 1}
--   levels: 3 policies {'SELECT': 2, 'ALL': 1}
--   logros: 2 policies {'SELECT': 1, 'ALL': 1}
--   lut_diagnosticos: 1 policies {'ALL': 1}
--   lut_evidencias: 1 policies {'ALL': 1}
--   lut_insumos: 1 policies {'ALL': 1}
--   lut_movimientos_insumos: 1 policies {'ALL': 1}
--   lut_ordenes_reparacion: 1 policies {'ALL': 1}
--   lut_presupuestos: 1 policies {'ALL': 1}
--   lut_solicitudes_compra: 1 policies {'ALL': 1}
--   maestro_access_credentials: 1 policies {'ALL': 1}
--   maestro_desempeno: 3 policies {'SELECT': 1, 'UPDATE': 1, 'INSERT': 1}
--   maestro_indicadores: 4 policies {'DELETE': 1, 'SELECT': 1, 'UPDATE': 1, 'INSERT': 1}
--   maestro_objetivos: 4 policies {'DELETE': 1, 'SELECT': 1, 'UPDATE': 1, 'INSERT': 1}
--   maestro_retiros: 1 policies {'SELECT': 1}
--   maestro_routes: 4 policies {'DELETE': 1, 'INSERT': 1, 'SELECT': 1, 'UPDATE': 1}
--   maestro_tareas: 2 policies {'SELECT': 1, 'ALL': 1}
--   maestro_unidades: 4 policies {'DELETE': 1, 'SELECT': 1, 'UPDATE': 1, 'INSERT': 1}
--   maestros: 5 policies {'INSERT': 1, 'SELECT': 2, 'UPDATE': 1, 'DELETE': 1}
--   mapa_plantillas: 2 policies {'ALL': 1, 'SELECT': 1}
--   minutas: 4 policies {'INSERT': 1, 'SELECT': 2, 'UPDATE': 1}
--   modulos: 2 policies {'SELECT': 1, 'ALL': 1}
--   niveles: 2 policies {'SELECT': 1, 'ALL': 1}
--   node_resources: 2 policies {'ALL': 1, 'SELECT': 1}
--   nodes: 3 policies {'SELECT': 2, 'ALL': 1}
--   notificaciones: 2 policies {'SELECT': 1, 'ALL': 1}
--   notificaciones_asistencia: 3 policies {'UPDATE': 1, 'INSERT': 1, 'SELECT': 1}
--   notificaciones_caja: 5 policies {'ALL': 1, 'INSERT': 1, 'SELECT': 2, 'UPDATE': 1}
--   notification_trigger_logs: 1 policies {'ALL': 1}
--   objetivos: 1 policies {'SELECT': 1}
--   observaciones_alumnos: 8 policies {'ALL': 1, 'INSERT': 2, 'SELECT': 2, 'UPDATE': 2, 'DELETE': 1}
--   observaciones_sesion: 2 policies {'ALL': 1, 'SELECT': 1}
--   pagos: 4 policies {'INSERT': 1, 'SELECT': 2, 'UPDATE': 1}
--   pagos_alumnos: 3 policies {'INSERT': 1, 'SELECT': 1, 'UPDATE': 1}
--   patrocinantes: 2 policies {'ALL': 1, 'SELECT': 1}
--   patrocinios: 2 policies {'ALL': 1, 'SELECT': 1}
--   periodo_excepciones: 2 policies {'ALL': 1, 'SELECT': 1}
--   periodos: 4 policies {'INSERT': 1, 'SELECT': 1, 'UPDATE': 1, 'DELETE': 1}
--   periodos_cierre_auditoria: 2 policies {'SELECT': 1, 'ALL': 1}
--   permisos_maestros: 5 policies {'SELECT': 3, 'UPDATE': 1, 'INSERT': 1}
--   plan_clases: 5 policies {'SELECT': 2, 'DELETE': 1, 'INSERT': 1, 'UPDATE': 1}
--   plan_indicadores: 5 policies {'SELECT': 2, 'DELETE': 1, 'INSERT': 1, 'UPDATE': 1}
--   plan_niveles: 5 policies {'SELECT': 2, 'DELETE': 1, 'INSERT': 1, 'UPDATE': 1}
--   plan_objetivos: 5 policies {'SELECT': 2, 'DELETE': 1, 'INSERT': 1, 'UPDATE': 1}
--   plan_temas: 5 policies {'SELECT': 2, 'DELETE': 1, 'INSERT': 1, 'UPDATE': 1}
--   planificaciones: 4 policies {'DELETE': 1, 'INSERT': 1, 'SELECT': 1, 'UPDATE': 1}
--   planned_content: 5 policies {'SELECT': 2, 'DELETE': 1, 'INSERT': 1, 'UPDATE': 1}
--   planning_documents: 5 policies {'DELETE': 1, 'INSERT': 1, 'SELECT': 2, 'UPDATE': 1}
--   portal_catalog: 2 policies {'ALL': 1, 'SELECT': 1}
--   postulantes: 6 policies {'DELETE': 2, 'INSERT': 1, 'SELECT': 1, 'UPDATE': 2}
--   profiles: 5 policies {'SELECT': 2, 'INSERT': 1, 'UPDATE': 1, 'DELETE': 1}
--   programas: 6 policies {'UPDATE': 1, 'INSERT': 1, 'DELETE': 1, 'SELECT': 2, 'ALL': 1}
--   programas_prerrequisitos: 1 policies {'SELECT': 1}
--   progresos: 6 policies {'SELECT': 2, 'ALL': 1, 'INSERT': 1, 'DELETE': 1, 'UPDATE': 1}
--   protocolos: 2 policies {'ALL': 1, 'SELECT': 1}
--   pulso_score_history: 2 policies {'SELECT': 1, 'ALL': 1}
--   push_subscriptions: 3 policies {'ALL': 2, 'SELECT': 1}
--   rachas: 2 policies {'SELECT': 1, 'ALL': 1}
--   registros_pendientes: 2 policies {'SELECT': 1, 'ALL': 1}
--   repertoire_items: 2 policies {'ALL': 1, 'SELECT': 1}
--   representantes: 3 policies {'ALL': 1, 'SELECT': 2}
--   retenciones_instrumento: 2 policies {'SELECT': 1, 'ALL': 1}
--   route_versions: 4 policies {'DELETE': 1, 'SELECT': 2, 'UPDATE': 1}
--   routes: 2 policies {'SELECT': 2}
--   ruta_contenido_objetivos: 3 policies {'INSERT': 1, 'SELECT': 1, 'UPDATE': 1}
--   rutas_contenido: 3 policies {'INSERT': 1, 'SELECT': 1, 'UPDATE': 1}
--   salones: 5 policies {'UPDATE': 1, 'INSERT': 1, 'DELETE': 1, 'SELECT': 1, 'ALL': 1}
--   schedule_run_feedback: 3 policies {'ALL': 1, 'INSERT': 1, 'SELECT': 1}
--   schedule_runs: 1 policies {'ALL': 1}
--   score_compromiso: 1 policies {'SELECT': 1}
--   sections: 2 policies {'ALL': 1, 'SELECT': 1}
--   seguimiento_ausencias_reinicio: 2 policies {'SELECT': 1, 'ALL': 1}
--   seguimiento_reglas: 1 policies {'ALL': 1}
--   service_account_observations: 2 policies {'INSERT': 1, 'SELECT': 1}
--   service_accounts: 3 policies {'INSERT': 1, 'SELECT': 1, 'UPDATE': 1}
--   sesiones_clase: 8 policies {'UPDATE': 2, 'INSERT': 2, 'SELECT': 2, 'DELETE': 2}
--   signage_media: 3 policies {'ALL': 1, 'SELECT': 2}
--   signage_pantallas: 3 policies {'ALL': 1, 'SELECT': 2}
--   sim_actores: 2 policies {'ALL': 1, 'SELECT': 1}
--   sim_calendario: 1 policies {'ALL': 1}
--   sim_config: 2 policies {'ALL': 1, 'SELECT': 1}
--   sim_log: 2 policies {'INSERT': 1, 'SELECT': 1}
--   sim_outbox: 2 policies {'ALL': 1, 'SELECT': 1}
--   sim_runs: 1 policies {'ALL': 1}
--   sim_tareas: 2 policies {'ALL': 1, 'SELECT': 1}
--   soi_analisis_semanal: 2 policies {'SELECT': 1, 'ALL': 1}
--   soi_event_bus: 1 policies {'ALL': 1}
--   soi_eventos: 9 policies {'SELECT': 6, 'DELETE': 1, 'UPDATE': 1, 'ALL': 1}
--   soi_process_contracts: 2 policies {'SELECT': 1, 'ALL': 1}
--   soi_rule_effectiveness: 2 policies {'SELECT': 1, 'ALL': 1}
--   solicitudes_ausencia: 2 policies {'SELECT': 1, 'ALL': 1}
--   solicitudes_necesidades: 6 policies {'INSERT': 1, 'SELECT': 1, 'UPDATE': 4}
--   solicitudes_permisos: 3 policies {'ALL': 1, 'INSERT': 1, 'SELECT': 1}
--   student_case_actions: 1 policies {'ALL': 1}
--   student_case_alerts: 1 policies {'ALL': 1}
--   student_case_events: 1 policies {'ALL': 1}
--   student_cases: 1 policies {'ALL': 1}
--   student_indicator_progress: 1 policies {'ALL': 1}
--   system_config: 4 policies {'SELECT': 3, 'ALL': 1}
--   tarea_comentarios: 1 policies {'ALL': 1}
--   tarea_historial: 1 policies {'SELECT': 1}
--   tarea_logs: 2 policies {'SELECT': 2}
--   tareas_caja: 4 policies {'ALL': 1, 'INSERT': 1, 'SELECT': 1, 'UPDATE': 1}
--   tareas_calendario: 3 policies {'ALL': 1, 'SELECT': 1, 'UPDATE': 1}
--   tareas_institucionales: 1 policies {'ALL': 1}
--   teacher_class_sessions: 1 policies {'ALL': 1}
--   teacher_session_indicators: 1 policies {'ALL': 1}
--   telegram_allowed_users: 2 policies {'SELECT': 1, 'ALL': 1}
--   telegram_messages_raw: 3 policies {'ALL': 3}
--   unidades: 2 policies {'SELECT': 1, 'ALL': 1}
--   user_portal_access: 2 policies {'ALL': 1, 'SELECT': 1}
--   usuario_departamentos: 2 policies {'ALL': 1, 'SELECT': 1}
--   wallet_movimientos: 2 policies {'SELECT': 2}
--   whatsapp_consentimientos: 1 policies {'ALL': 1}
--   whatsapp_optout: 1 policies {'ALL': 1}
--   whatsapp_webhook_log: 2 policies {'SELECT': 1, 'ALL': 1}
-- [advisor] RLS enabled but NO policy: fin_service_accounts, fin_service_balance_snapshots,
--   fin_service_providers, fin_service_refresh_runs, fin_service_refresh_state, plantillas_planificacion
-- END schema_reference.sql