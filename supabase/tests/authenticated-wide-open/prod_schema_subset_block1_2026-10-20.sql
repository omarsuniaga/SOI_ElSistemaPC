-- ═════════════════════════════════════════════════════════════════════════════
-- SCHEMA-ONLY SUBSET OF PRODUCTION (project zmhmdvmyeyswunurcyow) FOR BLOCK 1, captured 2026-10-20
-- Method: read-only queries to pg_catalog / information_schema (columns, defaults, pg_get_constraintdef,
-- pg_policies, relacl, pg_get_triggerdef). No application data was read. No secrets.
--
-- Loaded ON TOP of the anon-write-fix subset (profiles, maestros, clases, sesiones_clase, programas,
-- tareas_institucionales, helper functions es_admin/has_role/maestro_actual/...) AFTER the already-applied
-- migration 20261017180000, i.e. it models production as of 2026-10-20.
--
-- Contents: the eleven block-1 tables with their exact columns, defaults, constraints, RLS flag,
-- policies (all PERMISSIVE; there are no RESTRICTIVE policies on them) and triggers, plus the reduced
-- foreign-key parent `periodos`. The ACL is the Supabase legacy default that the bootstrap reproduces
-- (arwdDxtm for anon/authenticated/service_role); tarea_comentarios has no anon entry in production.
-- Reduced on purpose: on_notification_inserted keeps only its side effect (a pg_net call, replaced here
-- by an insert into a local log table so tests can assert WHO triggers a push).
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE public.periodos (id uuid NOT NULL DEFAULT gen_random_uuid(), nombre text, CONSTRAINT periodos_pkey PRIMARY KEY (id));

CREATE TABLE public.alumnos_programas (
  id uuid NOT NULL DEFAULT gen_random_uuid(), alumno_id uuid NOT NULL, programa_id uuid NOT NULL,
  fecha_inscripcion date DEFAULT CURRENT_DATE, activo boolean DEFAULT true, created_at timestamptz DEFAULT now(),
  periodo_id uuid, calificacion numeric, estado text NOT NULL DEFAULT 'cursando', fuente text,
  requiere_verificacion boolean NOT NULL DEFAULT false,
  CONSTRAINT alumnos_programas_pkey PRIMARY KEY (id),
  CONSTRAINT alumnos_programas_calificacion_check CHECK (((calificacion >= (0)::numeric) AND (calificacion <= (100)::numeric))),
  CONSTRAINT alumnos_programas_estado_check CHECK ((estado = ANY (ARRAY['cursando','aprobado','repite','proyectado','retirado']))),
  CONSTRAINT alumnos_programas_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES periodos(id),
  CONSTRAINT fk_alumnos_programas_alumno FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  CONSTRAINT fk_alumnos_programas_programa FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE CASCADE);

CREATE TABLE public.alumno_escolaridad (
  id uuid NOT NULL DEFAULT gen_random_uuid(), alumno_id uuid NOT NULL, centro_estudios text, grado_nivel text, seccion text,
  anio_escolar text, director_institucion text, cargo_director text DEFAULT 'Director/a', telefono_centro text,
  correo_centro text, direccion_centro text, activo boolean DEFAULT true, created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT alumno_escolaridad_pkey PRIMARY KEY (id),
  CONSTRAINT alumno_escolaridad_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE);

CREATE TABLE public.student_cases (
  id uuid NOT NULL DEFAULT gen_random_uuid(), alumno_id uuid, alumno_nombre text, tipo text NOT NULL, titulo text NOT NULL,
  descripcion text, nivel_riesgo text NOT NULL DEFAULT 'bajo', estado text NOT NULL DEFAULT 'abierto',
  origen text NOT NULL DEFAULT 'manual', responsable_id uuid, fecha_apertura date DEFAULT CURRENT_DATE, fecha_cierre date,
  resumen_actual text, proxima_accion text, proxima_accion_fecha date, ultimo_contacto_en timestamptz, created_by uuid,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  CONSTRAINT student_cases_pkey PRIMARY KEY (id),
  CONSTRAINT student_cases_estado_check CHECK ((estado = ANY (ARRAY['abierto','en_seguimiento','resuelto','escalado','archivado']))),
  CONSTRAINT student_cases_nivel_riesgo_check CHECK ((nivel_riesgo = ANY (ARRAY['bajo','medio','alto','critico']))),
  CONSTRAINT student_cases_origen_check CHECK ((origen = ANY (ARRAY['automatico','manual','observacion_maestro','asistencia','justificacion','admin']))),
  CONSTRAINT student_cases_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL);

CREATE TABLE public.student_case_actions (
  id uuid NOT NULL DEFAULT gen_random_uuid(), case_id uuid NOT NULL, alumno_id uuid, tipo text NOT NULL, titulo text NOT NULL,
  descripcion text, resultado text, fecha_accion timestamptz DEFAULT now(), proxima_accion text, proxima_accion_fecha date,
  documento_id uuid, registrado_por uuid, created_at timestamptz DEFAULT now(),
  CONSTRAINT student_case_actions_pkey PRIMARY KEY (id),
  CONSTRAINT student_case_actions_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL,
  CONSTRAINT student_case_actions_case_id_fkey FOREIGN KEY (case_id) REFERENCES student_cases(id) ON DELETE CASCADE);

CREATE TABLE public.student_case_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(), case_id uuid NOT NULL, tipo text NOT NULL, titulo text NOT NULL, descripcion text,
  metadata jsonb DEFAULT '{}'::jsonb, actor_id uuid, created_at timestamptz DEFAULT now(),
  CONSTRAINT student_case_events_pkey PRIMARY KEY (id),
  CONSTRAINT student_case_events_case_id_fkey FOREIGN KEY (case_id) REFERENCES student_cases(id) ON DELETE CASCADE);

CREATE TABLE public.student_case_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid(), alumno_id uuid, alumno_nombre text, case_id uuid, tipo text NOT NULL,
  nivel_riesgo text NOT NULL, titulo text NOT NULL, descripcion text, evidencia jsonb DEFAULT '{}'::jsonb,
  estado text NOT NULL DEFAULT 'pendiente', detectada_en timestamptz DEFAULT now(), revisada_por uuid, revisada_en timestamptz,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT student_case_alerts_pkey PRIMARY KEY (id),
  CONSTRAINT student_case_alerts_estado_check CHECK ((estado = ANY (ARRAY['pendiente','revisada','convertida_en_caso','descartada','archivada']))),
  CONSTRAINT student_case_alerts_nivel_riesgo_check CHECK ((nivel_riesgo = ANY (ARRAY['bajo','medio','alto','critico']))),
  CONSTRAINT student_case_alerts_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL,
  CONSTRAINT student_case_alerts_case_id_fkey FOREIGN KEY (case_id) REFERENCES student_cases(id) ON DELETE SET NULL);

CREATE TABLE public.comunicaciones_seguimiento (
  id uuid NOT NULL DEFAULT gen_random_uuid(), alumno_id uuid, contacto_nombre text, contacto_telefono text, contacto_email text,
  canal text NOT NULL DEFAULT 'llamada', fecha timestamptz NOT NULL DEFAULT now(), resultado text NOT NULL DEFAULT 'contactado',
  notas text, requiere_seguimiento boolean NOT NULL DEFAULT false, proxima_accion text, proxima_fecha date,
  estado text NOT NULL DEFAULT 'abierto', responsable_id uuid DEFAULT auth.uid(), created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(), nivel smallint, origen text NOT NULL DEFAULT 'manual', mensaje_enviado text,
  CONSTRAINT comunicaciones_seguimiento_pkey PRIMARY KEY (id),
  CONSTRAINT comunicaciones_seguimiento_canal_check CHECK ((canal = ANY (ARRAY['llamada','whatsapp','correo','reunion','otro']))),
  CONSTRAINT comunicaciones_seguimiento_estado_check CHECK ((estado = ANY (ARRAY['abierto','cerrado']))),
  CONSTRAINT comunicaciones_seguimiento_origen_chk CHECK ((origen = ANY (ARRAY['manual','ausentismo','hermes','otro']))),
  CONSTRAINT comunicaciones_seguimiento_resultado_check CHECK ((resultado = ANY (ARRAY['contactado','buzon_no_contesto','reagendar','sin_interes','resuelto']))),
  CONSTRAINT comunicaciones_seguimiento_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL,
  CONSTRAINT comunicaciones_seguimiento_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES auth.users(id) ON DELETE SET NULL);

CREATE TABLE public.postulantes (
  id uuid NOT NULL DEFAULT gen_random_uuid(), nombre_completo text NOT NULL, fecha_nacimiento date, telefono_alumno text, correo text,
  nacionalidad text, sector_calle_numero text, madre_nombre text, madre_tlf_whatsapp text, padre_nombre text, padre_tlf_whatsapp text,
  representante_parentesco text, acepta_pago_600 boolean NOT NULL DEFAULT false, autoriza_fotos_redes boolean NOT NULL DEFAULT false,
  religion_limita boolean NOT NULL DEFAULT false, disponibilidad_tiempo text, tiene_transporte boolean NOT NULL DEFAULT false,
  representantes_apoyan boolean NOT NULL DEFAULT false, copia_cedula boolean NOT NULL DEFAULT false,
  sincronizado_en timestamptz DEFAULT now(), created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  estado text NOT NULL DEFAULT 'pendiente', alumno_id uuid, fecha_postulacion timestamptz, fecha_contacto timestamptz,
  fecha_cita timestamptz, notas_seguimiento text, instrumento text,
  CONSTRAINT postulantes_pkey PRIMARY KEY (id),
  CONSTRAINT postulantes_submission_key UNIQUE (correo, nombre_completo),
  CONSTRAINT postulantes_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES alumnos(id));

CREATE TABLE public.notificaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(), profile_id uuid, registro_pendiente_id uuid, tipo text DEFAULT 'in_app',
  titulo text NOT NULL, mensaje text NOT NULL, deep_link text, estado text DEFAULT 'pendiente', enviada_en timestamptz,
  leida_en timestamptz, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(), escalation_level integer DEFAULT 0,
  scheduled_for timestamptz, dedup_key text, clase_id uuid,
  CONSTRAINT notificaciones_pkey PRIMARY KEY (id),
  CONSTRAINT check_deep_link_format CHECK (((deep_link IS NULL) OR (deep_link ~ '^/[a-zA-Z0-9/_-]+$'::text))),
  CONSTRAINT notificaciones_estado_check CHECK ((estado = ANY (ARRAY['pendiente','enviada','leida','fallida']))),
  CONSTRAINT notificaciones_tipo_check CHECK ((tipo = ANY (ARRAY['in_app','push','email','sistema','recordatorio_clase']))),
  CONSTRAINT fk_notificaciones_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT notificaciones_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE);

CREATE TABLE public.registros_pendientes (
  id uuid NOT NULL DEFAULT gen_random_uuid(), maestro_id uuid NOT NULL, sesion_clase_id uuid, tipo text NOT NULL,
  prioridad text DEFAULT 'media', estado text DEFAULT 'pendiente', fecha_limite timestamptz, mensaje text NOT NULL, deep_link text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(), resuelto_at timestamptz, last_notified_at timestamptz,
  notif_count integer DEFAULT 0, notification_state text DEFAULT 'VERDE',
  CONSTRAINT registros_pendientes_pkey PRIMARY KEY (id),
  CONSTRAINT registros_pendientes_estado_check CHECK ((estado = ANY (ARRAY['pendiente','visto','resuelto','cancelado']))),
  CONSTRAINT registros_pendientes_notification_state_check CHECK ((notification_state = ANY (ARRAY['VERDE','AMARILLO','NARANJA','ROJO']))),
  CONSTRAINT registros_pendientes_prioridad_check CHECK ((prioridad = ANY (ARRAY['baja','media','alta','critica']))),
  CONSTRAINT registros_pendientes_tipo_check CHECK ((tipo = ANY (ARRAY['asistencia_pendiente','contenido_pendiente','progreso_pendiente','sesion_sin_cerrar','justificacion_pendiente','otro']))),
  CONSTRAINT fk_registros_pendientes_maestro FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE,
  CONSTRAINT fk_registros_pendientes_sesion FOREIGN KEY (sesion_clase_id) REFERENCES sesiones_clase(id) ON DELETE CASCADE);
ALTER TABLE public.notificaciones ADD CONSTRAINT fk_notificaciones_registro FOREIGN KEY (registro_pendiente_id) REFERENCES registros_pendientes(id) ON DELETE SET NULL;

CREATE TABLE public.tarea_comentarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(), tarea_id uuid NOT NULL, autor_id uuid, autor_nombre text, cuerpo text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tarea_comentarios_pkey PRIMARY KEY (id),
  CONSTRAINT tarea_comentarios_tarea_id_fkey FOREIGN KEY (tarea_id) REFERENCES tareas_institucionales(id) ON DELETE CASCADE);
REVOKE ALL ON public.tarea_comentarios FROM anon;        -- production ACL: postgres, authenticated, service_role only

-- ── push side effect (net.http_post replaced by a log so tests can see who triggers a push) ──────
CREATE TABLE public._push_log (n bigserial PRIMARY KEY, profile_id uuid, at timestamptz DEFAULT now());
CREATE OR REPLACE FUNCTION public.on_notification_inserted() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
AS $function$ BEGIN INSERT INTO public._push_log (profile_id) VALUES (NEW.profile_id); RETURN NEW; END; $function$;
CREATE OR REPLACE FUNCTION public.fn_com_seg_touch_updated_at() RETURNS trigger LANGUAGE plpgsql
AS $function$ begin new.updated_at = now(); return new; end; $function$;

CREATE TRIGGER trg_com_seg_updated_at BEFORE UPDATE ON public.comunicaciones_seguimiento FOR EACH ROW EXECUTE FUNCTION fn_com_seg_touch_updated_at();
CREATE TRIGGER trigger_on_notification_inserted AFTER INSERT ON public.notificaciones FOR EACH ROW EXECUTE FUNCTION on_notification_inserted();
CREATE TRIGGER update_notificaciones_updated_at BEFORE UPDATE ON public.notificaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_registros_pendientes_updated_at BEFORE UPDATE ON public.registros_pendientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── RLS flags ───────────────────────────────────────────────────────────────
ALTER TABLE public.alumno_escolaridad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumnos_programas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunicaciones_seguimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.postulantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_pendientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_case_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_case_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_case_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarea_comentarios ENABLE ROW LEVEL SECURITY;

-- ── policies (verbatim from pg_policies) ────────────────────────────────────
CREATE POLICY rls_alumno_escolaridad_all ON public.alumno_escolaridad AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY alumnos_programas_authenticated_all ON public.alumnos_programas AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable read access for all users" ON public.alumnos_programas AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY alumnos_programas_admin_read ON public.alumnos_programas AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY com_seg_delete_authenticated ON public.comunicaciones_seguimiento AS PERMISSIVE FOR DELETE TO authenticated USING (true);
CREATE POLICY com_seg_insert_authenticated ON public.comunicaciones_seguimiento AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY com_seg_select_authenticated ON public.comunicaciones_seguimiento AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY com_seg_update_authenticated ON public.comunicaciones_seguimiento AS PERMISSIVE FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY notificaciones_authenticated_all ON public.notificaciones AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY notificaciones_admin_read ON public.notificaciones AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY postulantes_delete_authenticated ON public.postulantes AS PERMISSIVE FOR DELETE TO authenticated USING (true);
CREATE POLICY postulantes_delete_service_role ON public.postulantes AS PERMISSIVE FOR DELETE TO service_role USING (true);
CREATE POLICY postulantes_insert_service_role ON public.postulantes AS PERMISSIVE FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY postulantes_select_authenticated ON public.postulantes AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY postulantes_update_authenticated ON public.postulantes AS PERMISSIVE FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY postulantes_update_service_role ON public.postulantes AS PERMISSIVE FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY registros_pendientes_authenticated_all ON public.registros_pendientes AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY registros_pendientes_admin_read ON public.registros_pendientes AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY rls_student_case_actions_all ON public.student_case_actions AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY rls_student_case_alerts_all ON public.student_case_alerts AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY rls_student_case_events_all ON public.student_case_events AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY rls_student_cases_all ON public.student_cases AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY tc_auth_all ON public.tarea_comentarios AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
