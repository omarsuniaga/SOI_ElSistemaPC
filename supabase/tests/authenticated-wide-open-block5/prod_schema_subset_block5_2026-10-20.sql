-- ═════════════════════════════════════════════════════════════════════════════
-- SCHEMA-ONLY SUBSET OF PRODUCTION (project zmhmdvmyeyswunurcyow) FOR BLOCK 5, captured 2026-10-20
-- Method: read-only queries to pg_catalog (pg_attribute, pg_attrdef, pg_constraint, pg_policies,
-- pg_class.relacl, pg_trigger, pg_get_viewdef). No application data was read. No secrets.
--
-- Loaded ON TOP of the anon-write-fix subset (profiles, maestros, programas, alumnos, helper functions
-- es_admin/has_role/maestro_actual/update_updated_at_column ...) AFTER the already-applied migration
-- 20261017180000, i.e. it models production as of 2026-10-20 for the nine block-5 tables.
--
-- Contents: nine tables with exact columns, defaults, constraints, RLS flag, policies (all PERMISSIVE, no
-- RESTRICTIVE ones exist) and triggers. ACL: the Supabase legacy default (arwdDxtm for anon/authenticated/
-- service_role) is what the bootstrap reproduces; instrumentos and soi_process_contracts have NO anon entry in
-- production, reproduced below with REVOKE.
-- Reduced on purpose:
--   · vw_seguimiento_ausentes keeps only its dependency on seguimiento_reglas (security_invoker view).
--   · fn_email_departamento / fn_hermes_start_process_case / fn_generate_class_start_reminders are modelled
--     by three tiny SECURITY DEFINER functions that perform the same reads/writes on the block-5 tables.
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE public.departamentos (
  id uuid NOT NULL DEFAULT gen_random_uuid(), nombre text NOT NULL, codigo text, descripcion text, jefe_id uuid,
  activo boolean NOT NULL DEFAULT true, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  email text, responsable_nombre text, responsable_email text,
  CONSTRAINT departamentos_pkey PRIMARY KEY (id),
  CONSTRAINT departamentos_nombre_key UNIQUE (nombre),
  CONSTRAINT departamentos_jefe_id_fkey FOREIGN KEY (jefe_id) REFERENCES auth.users(id) ON DELETE SET NULL);

CREATE TABLE public.instrumentos (
  id uuid NOT NULL DEFAULT gen_random_uuid(), codigo text, nombre text NOT NULL, tipo text, marca text, serie text,
  estado text NOT NULL DEFAULT 'disponible', alumno_id uuid, alumno_nombre text, notas text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT instrumentos_pkey PRIMARY KEY (id),
  CONSTRAINT instrumentos_codigo_key UNIQUE (codigo),
  CONSTRAINT instrumentos_estado_check CHECK ((estado = ANY (ARRAY['disponible','asignado','danado','en_reparacion','fuera_de_uso']))));

CREATE TABLE public.niveles (
  id uuid NOT NULL DEFAULT gen_random_uuid(), programa_id uuid NOT NULL, nombre text NOT NULL, descripcion text,
  orden integer NOT NULL, duracion_estimada_meses integer, criterios_promocion jsonb DEFAULT '{}'::jsonb,
  activo boolean DEFAULT true, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  CONSTRAINT niveles_pkey PRIMARY KEY (id),
  CONSTRAINT niveles_duracion_estimada_meses_check CHECK (((duracion_estimada_meses IS NULL) OR (duracion_estimada_meses > 0))),
  CONSTRAINT niveles_orden_check CHECK ((orden > 0)),
  CONSTRAINT niveles_programa_nombre_unique UNIQUE (programa_id, nombre),
  CONSTRAINT niveles_programa_orden_unique UNIQUE (programa_id, orden),
  CONSTRAINT fk_niveles_programa FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE CASCADE);

CREATE TABLE public.modulos (
  id uuid NOT NULL DEFAULT gen_random_uuid(), programa_id uuid NOT NULL, nivel_id uuid NOT NULL, nombre text NOT NULL,
  descripcion text, orden integer NOT NULL, duracion_estimada_semanas integer, requisito_modulo_id uuid,
  porcentaje_aprobacion numeric DEFAULT 80, activo boolean DEFAULT true, created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT modulos_pkey PRIMARY KEY (id),
  CONSTRAINT modulos_duracion_estimada_semanas_check CHECK (((duracion_estimada_semanas IS NULL) OR (duracion_estimada_semanas > 0))),
  CONSTRAINT modulos_orden_check CHECK ((orden > 0)),
  CONSTRAINT modulos_porcentaje_aprobacion_check CHECK (((porcentaje_aprobacion >= (0)::numeric) AND (porcentaje_aprobacion <= (100)::numeric))),
  CONSTRAINT modulos_nivel_nombre_unique UNIQUE (nivel_id, nombre),
  CONSTRAINT modulos_nivel_orden_unique UNIQUE (nivel_id, orden),
  CONSTRAINT fk_modulos_nivel FOREIGN KEY (nivel_id) REFERENCES niveles(id) ON DELETE CASCADE,
  CONSTRAINT fk_modulos_programa FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE CASCADE,
  CONSTRAINT fk_modulos_requisito FOREIGN KEY (requisito_modulo_id) REFERENCES modulos(id) ON DELETE SET NULL);

CREATE TABLE public.unidades (
  id uuid NOT NULL DEFAULT gen_random_uuid(), modulo_id uuid NOT NULL, nombre text NOT NULL, descripcion text,
  orden integer NOT NULL, activo boolean DEFAULT true, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  CONSTRAINT unidades_pkey PRIMARY KEY (id),
  CONSTRAINT unidades_orden_check CHECK ((orden > 0)),
  CONSTRAINT unidades_modulo_nombre_unique UNIQUE (modulo_id, nombre),
  CONSTRAINT unidades_modulo_orden_unique UNIQUE (modulo_id, orden),
  CONSTRAINT fk_unidades_modulo FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE);

CREATE TABLE public.ejercicios (
  id uuid NOT NULL DEFAULT gen_random_uuid(), unidad_id uuid NOT NULL, nombre text NOT NULL, descripcion text,
  tipo_ejercicio text NOT NULL, dificultad integer DEFAULT 1, instrucciones text, criterios_evaluacion jsonb DEFAULT '{}'::jsonb,
  contenido jsonb DEFAULT '{}'::jsonb, puntaje_maximo numeric DEFAULT 10, puntaje_aprobacion numeric DEFAULT 7,
  requiere_evidencia boolean DEFAULT false, puntos_xp integer DEFAULT 10, orden integer NOT NULL, activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  CONSTRAINT ejercicios_pkey PRIMARY KEY (id),
  CONSTRAINT ejercicios_dificultad_check CHECK (((dificultad >= 1) AND (dificultad <= 10))),
  CONSTRAINT ejercicios_orden_check CHECK ((orden > 0)),
  CONSTRAINT ejercicios_puntaje_aprobacion_check CHECK ((puntaje_aprobacion >= (0)::numeric)),
  CONSTRAINT ejercicios_puntaje_check CHECK ((puntaje_aprobacion <= puntaje_maximo)),
  CONSTRAINT ejercicios_puntaje_maximo_check CHECK ((puntaje_maximo > (0)::numeric)),
  CONSTRAINT ejercicios_puntos_xp_check CHECK ((puntos_xp >= 0)),
  CONSTRAINT ejercicios_tipo_ejercicio_check CHECK ((tipo_ejercicio = ANY (ARRAY['tecnico','ritmico','lectura','auditivo','repertorio','teorico','postural','ensamble','memoria','otro']))),
  CONSTRAINT ejercicios_unidad_orden_unique UNIQUE (unidad_id, orden),
  CONSTRAINT fk_ejercicios_unidad FOREIGN KEY (unidad_id) REFERENCES unidades(id) ON DELETE CASCADE);

-- per-user reminder preferences of the teacher portal (NOT an institution-wide setting)
CREATE TABLE public.configuracion_recordatorios (
  id uuid NOT NULL DEFAULT gen_random_uuid(), profile_id uuid NOT NULL, recordatorios_activos boolean DEFAULT true,
  push_activo boolean DEFAULT false, email_activo boolean DEFAULT false, hora_resumen_diario time DEFAULT '18:00:00',
  dia_resumen_semanal integer DEFAULT 5, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  min_antes_clase integer DEFAULT 15, min_post_clase_sin_registro integer DEFAULT 60, horas_recordatorio_dia1 integer DEFAULT 24,
  horas_recordatorio_dia2 integer DEFAULT 48, alerta_pre_clase boolean DEFAULT true, alerta_post_clase boolean DEFAULT true,
  alerta_24h boolean DEFAULT true, alerta_48h boolean DEFAULT true,
  CONSTRAINT configuracion_recordatorios_pkey PRIMARY KEY (id),
  CONSTRAINT configuracion_recordatorios_dia_resumen_semanal_check CHECK (((dia_resumen_semanal >= 1) AND (dia_resumen_semanal <= 7))),
  CONSTRAINT configuracion_recordatorios_profile_id_key UNIQUE (profile_id),
  CONSTRAINT fk_configuracion_recordatorios_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE);

CREATE TABLE public.seguimiento_reglas (
  id uuid NOT NULL DEFAULT gen_random_uuid(), nombre text NOT NULL, tipo text NOT NULL, descripcion text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb, activo boolean DEFAULT true, prioridad integer DEFAULT 1, created_by uuid,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  CONSTRAINT seguimiento_reglas_pkey PRIMARY KEY (id));

CREATE TABLE public.soi_process_contracts (
  process_code text NOT NULL, process_name text NOT NULL, department_owner text NOT NULL, canonical_doc_path text NOT NULL,
  doc_id text, trigger_type text NOT NULL DEFAULT 'manual', required_evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  closure_criteria jsonb NOT NULL DEFAULT '[]'::jsonb, responsible_departments text[] NOT NULL DEFAULT ARRAY[]::text[],
  task_templates jsonb NOT NULL DEFAULT '[]'::jsonb, automation_status text NOT NULL DEFAULT 'manual',
  recurrence_count integer NOT NULL DEFAULT 0, active boolean NOT NULL DEFAULT true, metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT soi_process_contracts_pkey PRIMARY KEY (process_code),
  CONSTRAINT soi_process_contracts_automation_status_check CHECK ((automation_status = ANY (ARRAY['manual','semi_auto','automated','deprecated']))),
  CONSTRAINT soi_process_contracts_recurrence_count_check CHECK ((recurrence_count >= 0)),
  CONSTRAINT soi_process_contracts_trigger_type_check CHECK ((trigger_type = ANY (ARRAY['manual','event','scheduled','data_driven','conversation']))));

-- production ACL: instrumentos and soi_process_contracts carry no anon entry (the other seven have arwdDxtm)
REVOKE ALL ON public.instrumentos FROM anon;
REVOKE ALL ON public.soi_process_contracts FROM anon;

-- ── triggers (verbatim from pg_get_triggerdef) ──────────────────────────────
CREATE TRIGGER update_niveles_updated_at BEFORE UPDATE ON public.niveles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_modulos_updated_at BEFORE UPDATE ON public.modulos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_unidades_updated_at BEFORE UPDATE ON public.unidades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ejercicios_updated_at BEFORE UPDATE ON public.ejercicios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configuracion_recordatorios_updated_at BEFORE UPDATE ON public.configuracion_recordatorios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── RLS flags (all nine: enabled, not forced) ───────────────────────────────
ALTER TABLE public.departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instrumentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niveles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ejercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion_recordatorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seguimiento_reglas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soi_process_contracts ENABLE ROW LEVEL SECURITY;

-- ── policies (verbatim from pg_policies) ────────────────────────────────────
CREATE POLICY configuracion_recordatorios_admin_read ON public.configuracion_recordatorios AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY configuracion_recordatorios_authenticated_all ON public.configuracion_recordatorios AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY departamentos_authenticated_all ON public.departamentos AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY ejercicios_admin_read ON public.ejercicios AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY ejercicios_authenticated_all ON public.ejercicios AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY instrumentos_auth_all ON public.instrumentos AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY modulos_admin_read ON public.modulos AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY modulos_authenticated_all ON public.modulos AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY niveles_admin_read ON public.niveles AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY niveles_authenticated_all ON public.niveles AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY rls_seguimiento_reglas_all ON public.seguimiento_reglas AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY soi_process_contracts_auth_read ON public.soi_process_contracts AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY soi_process_contracts_auth_write ON public.soi_process_contracts AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY unidades_admin_read ON public.unidades AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY unidades_authenticated_all ON public.unidades AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── reduced security_invoker view (the real one joins alumnos, asistencias, ...) ─
CREATE VIEW public.vw_seguimiento_ausentes WITH (security_invoker = true) AS
  WITH regla AS (
    SELECT COALESCE(((seguimiento_reglas.config ->> 'nivel1'))::integer, 3) AS n1
      FROM public.seguimiento_reglas
     WHERE seguimiento_reglas.tipo = 'ausentismo_acumulado' AND seguimiento_reglas.activo
     LIMIT 1)
  SELECT a.id AS alumno_id, a.nombre_completo AS alumno_nombre, (SELECT regla.n1 FROM regla) AS n1
    FROM public.alumnos a;
GRANT SELECT ON public.vw_seguimiento_ausentes TO authenticated, service_role;

-- ── SECURITY DEFINER consumers modelled on the production ones (owner bypasses RLS) ──────────
-- fn_email_departamento(text): reads departamentos.email (production: executable by anon)
CREATE OR REPLACE FUNCTION public.fn_email_departamento(p_codigo text) RETURNS text LANGUAGE sql STABLE SECURITY DEFINER
  SET search_path TO 'public' AS $function$ select email from public.departamentos where upper(codigo) = upper(p_codigo) and activo and email is not null limit 1; $function$;
-- fn_hermes_start_process_case: reads a contract and bumps its recurrence counter
CREATE OR REPLACE FUNCTION public.fn_hermes_start_process_case(p_process_code text) RETURNS text LANGUAGE plpgsql SECURITY DEFINER
  SET search_path TO 'public' AS $function$ DECLARE v public.soi_process_contracts%ROWTYPE; BEGIN
    SELECT * INTO v FROM public.soi_process_contracts WHERE process_code = p_process_code AND active;
    IF NOT FOUND THEN RAISE EXCEPTION 'unknown contract %', p_process_code; END IF;
    UPDATE public.soi_process_contracts SET recurrence_count = recurrence_count + 1 WHERE process_code = p_process_code;
    RETURN v.process_name; END $function$;
-- fn_generate_class_start_reminders (cron): reads every teacher's reminder preferences
CREATE OR REPLACE FUNCTION public.fn_generate_class_start_reminders() RETURNS integer LANGUAGE sql SECURITY DEFINER
  SET search_path TO 'public' AS $function$ select count(*)::int from public.configuracion_recordatorios where recordatorios_activos; $function$;

-- production: the two Hermes/cron functions are executable by authenticated + service_role only;
-- fn_email_departamento IS executable by anon in production (kept, see report "hallazgos laterales")
REVOKE ALL ON FUNCTION public.fn_hermes_start_process_case(text)  FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_generate_class_start_reminders() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_hermes_start_process_case(text)  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_generate_class_start_reminders() TO authenticated, service_role;
