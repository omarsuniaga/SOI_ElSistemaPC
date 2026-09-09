-- ==============================================================================
-- SCHEMA REFERENCE CANÓNICO (POST-PODA FASE 0)
-- ==============================================================================
-- Fecha de extracción: 2026-09-08T18:16:38.691Z
-- Proyecto Supabase: zmhmdvmyeyswunurcyow (SOI_DDBB_EL_SISTEMAPC)
-- Universo reflejado:
--   • 216 Tablas Base
--   • 43 Vistas
--   • 217 Primary Keys
--   • 316 Unique & Check Constraints
--   • 357 Foreign Keys
--   • 485 Índices Secundarios
--   • 216 Tablas con RLS verificado
--   • 591 Políticas RLS
--   • 170 Comentarios de Catálogo (incluye 13 tablas DEPRECATED)
--   • 263 Funciones / RPCs
-- 
-- NOTA: Este archivo es la fuente canónica de referencia arquitectónica del
-- repositorio. Refleja fielmente la estructura física viva de la base de datos
-- tras la poda controlada de las 33 tablas vacías en la Fase 0 (Tarea 0.2).
-- ==============================================================================

-- ----------------------------------------------------------------------------
-- Tabla: public."academic_plans"
-- ----------------------------------------------------------------------------
CREATE TABLE public."academic_plans" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "student_id" uuid,
  "programa_id" uuid,
  "status" text DEFAULT 'in_process'::text,
  "started_at" timestamp with time zone DEFAULT now(),
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "academic_plans_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "academic_plans_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'in_process'::text, 'completed'::text, 'cancelled'::text]))),
  CONSTRAINT "academic_plans_programa_id_fkey" FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE SET NULL,
  CONSTRAINT "academic_plans_student_id_fkey" FOREIGN KEY (student_id) REFERENCES alumnos(id) ON DELETE CASCADE
);

ALTER TABLE public."academic_plans" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_academic_plans_student ON public.academic_plans USING btree (student_id);
CREATE POLICY "Authenticated users can insert academic plans" ON public."academic_plans" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can read academic plans" ON public."academic_plans" FOR SELECT TO authenticated USING (true);
CREATE POLICY "academic_plans_admin_read" ON public."academic_plans" FOR SELECT USING (es_admin());

-- ----------------------------------------------------------------------------
-- Tabla: public."accesorios"
-- ----------------------------------------------------------------------------
CREATE TABLE public."accesorios" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "nombre" text NOT NULL,
  "categoria" text NOT NULL,
  "descripcion" text,
  "stock_actual" integer DEFAULT 0 NOT NULL,
  "stock_minimo" integer DEFAULT 0 NOT NULL,
  "precio_unitario" numeric NOT NULL,
  "activo" boolean DEFAULT true,
  "links_externos" jsonb DEFAULT '[]'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "accesorios_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "accesorios_stock_actual_check" CHECK ((stock_actual >= 0))
);

ALTER TABLE public."accesorios" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."accesorios" IS '-- DEPRECATED: conservada para rediseño de inventario lutería 2026-09 (Owner: LUT)';
CREATE INDEX idx_accesorios_stock ON public.accesorios USING btree (stock_actual, stock_minimo) WHERE (activo = true);
CREATE POLICY "accesorios_insert_delete_admin" ON public."accesorios" FOR ALL USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
CREATE POLICY "accesorios_select_cajero_admin" ON public."accesorios" FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
CREATE POLICY "accesorios_update_cajero_admin" ON public."accesorios" FOR UPDATE USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text]))) WITH CHECK ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));

-- ----------------------------------------------------------------------------
-- Tabla: public."acm_active_routes"
-- ----------------------------------------------------------------------------
CREATE TABLE public."acm_active_routes" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "weekly_plan_id" uuid NOT NULL,
  "teacher_id" uuid,
  "group_id" uuid,
  "program_id" uuid,
  "area_id" uuid,
  "instrument_id" uuid,
  "module_id" uuid,
  "level_id" uuid,
  "phase_id" uuid,
  "start_date" date DEFAULT CURRENT_DATE NOT NULL,
  "end_date" date,
  "current_week" integer DEFAULT 1 NOT NULL,
  "status" text DEFAULT 'active'::text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "acm_active_routes_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "acm_active_routes_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'paused'::text, 'completed'::text, 'archived'::text]))),
  CONSTRAINT "acm_active_routes_group_id_fkey" FOREIGN KEY (group_id) REFERENCES clases(id) ON DELETE SET NULL,
  CONSTRAINT "acm_active_routes_program_id_fkey" FOREIGN KEY (program_id) REFERENCES programas(id) ON DELETE SET NULL,
  CONSTRAINT "acm_active_routes_teacher_id_fkey" FOREIGN KEY (teacher_id) REFERENCES maestros(id) ON DELETE SET NULL,
  CONSTRAINT "acm_active_routes_weekly_plan_id_fkey" FOREIGN KEY (weekly_plan_id) REFERENCES acm_weekly_plans(id) ON DELETE CASCADE
);

ALTER TABLE public."acm_active_routes" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_acm_active_routes_group ON public.acm_active_routes USING btree (group_id);
CREATE UNIQUE INDEX idx_acm_active_routes_one_active_per_group ON public.acm_active_routes USING btree (group_id) WHERE (status = 'active'::text);
CREATE INDEX idx_acm_active_routes_status ON public.acm_active_routes USING btree (status);
CREATE INDEX idx_acm_active_routes_teacher ON public.acm_active_routes USING btree (teacher_id);
CREATE POLICY "acm_active_routes_owner" ON public."acm_active_routes" FOR ALL TO authenticated USING ((es_admin() OR (teacher_id = maestro_actual()))) WITH CHECK ((es_admin() OR (teacher_id = maestro_actual())));

-- ----------------------------------------------------------------------------
-- Tabla: public."acm_curriculum_sources"
-- ----------------------------------------------------------------------------
CREATE TABLE public."acm_curriculum_sources" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "title" text NOT NULL,
  "file_name" text NOT NULL,
  "file_path" text,
  "source_type" text NOT NULL,
  "author" text,
  "version_label" text,
  "uploaded_by" uuid,
  "uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
  "status" text DEFAULT 'draft'::text NOT NULL,
  "raw_text" text,
  "notes" text,
  "related_version_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "acm_curriculum_sources_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "acm_curriculum_sources_source_type_check" CHECK ((source_type = ANY (ARRAY['documento_rector'::text, 'documento_complementario'::text, 'referencia_externa'::text, 'ajuste_acm'::text]))),
  CONSTRAINT "acm_curriculum_sources_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'in_review'::text, 'approved'::text, 'active'::text, 'archived'::text, 'replaced'::text]))),
  CONSTRAINT "acm_curriculum_sources_related_version_fkey" FOREIGN KEY (related_version_id) REFERENCES acm_curriculum_versions(id) ON DELETE SET NULL,
  CONSTRAINT "acm_curriculum_sources_uploaded_by_fkey" FOREIGN KEY (uploaded_by) REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE public."acm_curriculum_sources" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_acm_curriculum_sources_status ON public.acm_curriculum_sources USING btree (status);
CREATE POLICY "acm_curriculum_sources_admin_write" ON public."acm_curriculum_sources" FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "acm_curriculum_sources_read" ON public."acm_curriculum_sources" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."acm_curriculum_versions"
-- ----------------------------------------------------------------------------
CREATE TABLE public."acm_curriculum_versions" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "source_id" uuid,
  "program_id" uuid,
  "status" text DEFAULT 'draft'::text NOT NULL,
  "is_active" boolean DEFAULT false NOT NULL,
  "approved_by" uuid,
  "approved_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "acm_curriculum_versions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "acm_curriculum_versions_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'in_review'::text, 'approved'::text, 'active'::text, 'archived'::text, 'replaced'::text]))),
  CONSTRAINT "acm_curriculum_versions_approved_by_fkey" FOREIGN KEY (approved_by) REFERENCES profiles(id) ON DELETE SET NULL,
  CONSTRAINT "acm_curriculum_versions_program_id_fkey" FOREIGN KEY (program_id) REFERENCES programas(id) ON DELETE SET NULL,
  CONSTRAINT "acm_curriculum_versions_source_id_fkey" FOREIGN KEY (source_id) REFERENCES acm_curriculum_sources(id) ON DELETE SET NULL
);

ALTER TABLE public."acm_curriculum_versions" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_acm_curriculum_versions_source ON public.acm_curriculum_versions USING btree (source_id);
CREATE INDEX idx_acm_curriculum_versions_status ON public.acm_curriculum_versions USING btree (status);
CREATE POLICY "acm_curriculum_versions_admin_write" ON public."acm_curriculum_versions" FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "acm_curriculum_versions_read" ON public."acm_curriculum_versions" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."acm_evidence_files"
-- ----------------------------------------------------------------------------
CREATE TABLE public."acm_evidence_files" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "student_id" uuid,
  "group_id" uuid,
  "session_id" uuid,
  "indicator_id" uuid,
  "file_url" text NOT NULL,
  "file_type" text,
  "description" text,
  "uploaded_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "acm_evidence_files_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "acm_evidence_files_group_id_fkey" FOREIGN KEY (group_id) REFERENCES clases(id) ON DELETE SET NULL,
  CONSTRAINT "acm_evidence_files_indicator_id_fkey" FOREIGN KEY (indicator_id) REFERENCES indicators(id) ON DELETE SET NULL,
  CONSTRAINT "acm_evidence_files_session_id_fkey" FOREIGN KEY (session_id) REFERENCES teacher_class_sessions(id) ON DELETE SET NULL,
  CONSTRAINT "acm_evidence_files_student_id_fkey" FOREIGN KEY (student_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  CONSTRAINT "acm_evidence_files_uploaded_by_fkey" FOREIGN KEY (uploaded_by) REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE public."acm_evidence_files" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_acm_evidence_files_indicator ON public.acm_evidence_files USING btree (indicator_id);
CREATE INDEX idx_acm_evidence_files_session ON public.acm_evidence_files USING btree (session_id);
CREATE POLICY "acm_evidence_files_scoped" ON public."acm_evidence_files" FOR ALL TO authenticated USING ((es_admin() OR (uploaded_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM teacher_class_sessions s
  WHERE ((s.id = acm_evidence_files.session_id) AND (s.teacher_id = maestro_actual())))))) WITH CHECK ((es_admin() OR (uploaded_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM teacher_class_sessions s
  WHERE ((s.id = acm_evidence_files.session_id) AND (s.teacher_id = maestro_actual()))))));

-- ----------------------------------------------------------------------------
-- Tabla: public."acm_teacher_week_adjustments"
-- ----------------------------------------------------------------------------
CREATE TABLE public."acm_teacher_week_adjustments" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "group_id" uuid NOT NULL,
  "teacher_id" uuid NOT NULL,
  "weekly_plan_id" uuid NOT NULL,
  "week_number" integer NOT NULL,
  "teacher_strategy" text,
  "student_activity" text,
  "homework" text,
  "evidence" text,
  "teacher_notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "acm_teacher_week_adjustments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "acm_teacher_week_adjustments_unique" UNIQUE (group_id, teacher_id, weekly_plan_id, week_number),
  CONSTRAINT "acm_teacher_week_adjustments_group_id_fkey" FOREIGN KEY (group_id) REFERENCES clases(id) ON DELETE CASCADE,
  CONSTRAINT "acm_teacher_week_adjustments_teacher_id_fkey" FOREIGN KEY (teacher_id) REFERENCES maestros(id) ON DELETE CASCADE,
  CONSTRAINT "acm_teacher_week_adjustments_weekly_plan_id_fkey" FOREIGN KEY (weekly_plan_id) REFERENCES acm_weekly_plans(id) ON DELETE CASCADE
);

ALTER TABLE public."acm_teacher_week_adjustments" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX acm_teacher_week_adjustments_unique ON public.acm_teacher_week_adjustments USING btree (group_id, teacher_id, weekly_plan_id, week_number);
CREATE INDEX idx_acm_teacher_week_adjustments_group ON public.acm_teacher_week_adjustments USING btree (group_id, teacher_id, weekly_plan_id);
CREATE POLICY "acm_teacher_week_adjustments_owner" ON public."acm_teacher_week_adjustments" FOR ALL TO authenticated USING ((es_admin() OR (teacher_id = maestro_actual()))) WITH CHECK ((es_admin() OR (teacher_id = maestro_actual())));

-- ----------------------------------------------------------------------------
-- Tabla: public."acm_weekly_plan_items"
-- ----------------------------------------------------------------------------
CREATE TABLE public."acm_weekly_plan_items" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "weekly_plan_id" uuid NOT NULL,
  "node_id" uuid,
  "indicator_id" uuid,
  "topic" text,
  "objective" text,
  "teacher_strategy" text,
  "student_activity" text,
  "homework" text,
  "materials" text,
  "evidence" text,
  "assessment_method" text,
  "estimated_minutes" integer,
  "order_index" integer DEFAULT 0 NOT NULL,
  "is_required" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "acm_weekly_plan_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "acm_weekly_plan_items_indicator_id_fkey" FOREIGN KEY (indicator_id) REFERENCES indicators(id) ON DELETE SET NULL,
  CONSTRAINT "acm_weekly_plan_items_weekly_plan_id_fkey" FOREIGN KEY (weekly_plan_id) REFERENCES acm_weekly_plans(id) ON DELETE CASCADE
);

ALTER TABLE public."acm_weekly_plan_items" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_acm_weekly_plan_items_weekly_plan ON public.acm_weekly_plan_items USING btree (weekly_plan_id);
CREATE POLICY "acm_weekly_plan_items_admin_write" ON public."acm_weekly_plan_items" FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "acm_weekly_plan_items_read" ON public."acm_weekly_plan_items" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."acm_weekly_plans"
-- ----------------------------------------------------------------------------
CREATE TABLE public."acm_weekly_plans" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "curriculum_version_id" uuid NOT NULL,
  "program_id" uuid,
  "area_id" uuid,
  "instrument_id" uuid,
  "module_id" uuid,
  "level_id" uuid,
  "phase_id" uuid,
  "week_number" integer NOT NULL,
  "week_label" text,
  "phase_type" text,
  "main_topic" text,
  "main_objective" text,
  "status" text DEFAULT 'draft'::text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "acm_weekly_plans_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "acm_weekly_plans_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'approved'::text, 'active'::text, 'archived'::text]))),
  CONSTRAINT "acm_weekly_plans_curriculum_version_id_fkey" FOREIGN KEY (curriculum_version_id) REFERENCES acm_curriculum_versions(id) ON DELETE CASCADE,
  CONSTRAINT "acm_weekly_plans_program_id_fkey" FOREIGN KEY (program_id) REFERENCES programas(id) ON DELETE SET NULL
);

ALTER TABLE public."acm_weekly_plans" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_acm_weekly_plans_level ON public.acm_weekly_plans USING btree (level_id, week_number);
CREATE POLICY "acm_weekly_plans_admin_write" ON public."acm_weekly_plans" FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "acm_weekly_plans_read" ON public."acm_weekly_plans" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."alertas_log"
-- ----------------------------------------------------------------------------
CREATE TABLE public."alertas_log" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "tipo" text NOT NULL,
  "canal" text NOT NULL,
  "destinatario" text NOT NULL,
  "contenido" text,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "alertas_log_pkey" PRIMARY KEY ("id")
);

ALTER TABLE public."alertas_log" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_alertas_canal_tipo ON public.alertas_log USING btree (canal, tipo, created_at DESC);
CREATE POLICY "alertas_log_authenticated_all" ON public."alertas_log" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."alumno_escolaridad"
-- ----------------------------------------------------------------------------
CREATE TABLE public."alumno_escolaridad" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "alumno_id" uuid NOT NULL,
  "centro_estudios" text,
  "grado_nivel" text,
  "seccion" text,
  "anio_escolar" text,
  "director_institucion" text,
  "cargo_director" text DEFAULT 'Director/a'::text,
  "telefono_centro" text,
  "correo_centro" text,
  "direccion_centro" text,
  "activo" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "alumno_escolaridad_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "alumno_escolaridad_alumno_id_fkey" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE
);

ALTER TABLE public."alumno_escolaridad" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."alumno_escolaridad" IS '-- DEPRECATED: datos escolares secundarios diferidos 2026-09 (Owner: DIR/ADM)';
CREATE POLICY "rls_alumno_escolaridad_all" ON public."alumno_escolaridad" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."alumno_plan_entradas"
-- ----------------------------------------------------------------------------
CREATE TABLE public."alumno_plan_entradas" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "alumno_id" uuid NOT NULL,
  "maestro_id" uuid NOT NULL,
  "tipo" text NOT NULL,
  "titulo" text NOT NULL,
  "descripcion" text,
  "objetivo_id" uuid,
  "nivel_referencia" text,
  "sesion_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "alumno_plan_entradas_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "alumno_plan_entradas_descripcion_check" CHECK ((char_length(descripcion) <= 2000)),
  CONSTRAINT "alumno_plan_entradas_nivel_referencia_check" CHECK ((nivel_referencia = ANY (ARRAY['inicial'::text, 'basico'::text, 'intermedio'::text, 'avanzado'::text]))),
  CONSTRAINT "alumno_plan_entradas_tipo_check" CHECK ((tipo = ANY (ARRAY['diagnostico'::text, 'logro'::text, 'en_progreso'::text, 'dificultad'::text, 'objetivo'::text]))),
  CONSTRAINT "alumno_plan_entradas_titulo_check" CHECK (((char_length(titulo) >= 2) AND (char_length(titulo) <= 200))),
  CONSTRAINT "alumno_plan_entradas_alumno_id_fkey" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  CONSTRAINT "alumno_plan_entradas_maestro_id_fkey" FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE,
  CONSTRAINT "alumno_plan_entradas_objetivo_id_fkey" FOREIGN KEY (objetivo_id) REFERENCES curriculo_objetivos(id) ON DELETE SET NULL,
  CONSTRAINT "alumno_plan_entradas_sesion_id_fkey" FOREIGN KEY (sesion_id) REFERENCES sesiones_clase(id) ON DELETE SET NULL
);

ALTER TABLE public."alumno_plan_entradas" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_ape_alumno ON public.alumno_plan_entradas USING btree (alumno_id, created_at DESC);
CREATE INDEX idx_ape_maestro ON public.alumno_plan_entradas USING btree (maestro_id);
CREATE INDEX idx_ape_objetivo ON public.alumno_plan_entradas USING btree (objetivo_id) WHERE (objetivo_id IS NOT NULL);
CREATE POLICY "maestro_delete_plan_entradas" ON public."alumno_plan_entradas" FOR DELETE USING ((maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))));
CREATE POLICY "maestro_insert_plan_entradas" ON public."alumno_plan_entradas" FOR INSERT WITH CHECK (((maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))) AND (EXISTS ( SELECT 1
   FROM (alumnos_clases ac
     JOIN clases c ON ((c.id = ac.clase_id)))
  WHERE ((ac.alumno_id = alumno_plan_entradas.alumno_id) AND (c.maestro_id = alumno_plan_entradas.maestro_id) AND (ac.activo = true))))));
CREATE POLICY "maestro_select_plan_entradas" ON public."alumno_plan_entradas" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ((alumnos_clases ac
     JOIN clases c ON ((c.id = ac.clase_id)))
     JOIN maestros m ON ((m.id = c.maestro_id)))
  WHERE ((ac.alumno_id = alumno_plan_entradas.alumno_id) AND (m.user_id = auth.uid())))) OR (maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid())))));
CREATE POLICY "maestro_update_plan_entradas" ON public."alumno_plan_entradas" FOR UPDATE USING ((maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))));

-- ----------------------------------------------------------------------------
-- Tabla: public."alumno_suspensiones"
-- ----------------------------------------------------------------------------
CREATE TABLE public."alumno_suspensiones" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "alumno_id" uuid NOT NULL,
  "desde" date DEFAULT CURRENT_DATE NOT NULL,
  "hasta" date,
  "motivo" text,
  "estado" text DEFAULT 'activa'::text NOT NULL,
  "creado_por" uuid DEFAULT auth.uid(),
  "levantada_por" uuid,
  "levantada_en" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "alumno_suspensiones_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "alumno_suspensiones_estado_check" CHECK ((estado = ANY (ARRAY['activa'::text, 'levantada'::text]))),
  CONSTRAINT "alumno_suspensiones_alumno_id_fkey" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  CONSTRAINT "alumno_suspensiones_creado_por_fkey" FOREIGN KEY (creado_por) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT "alumno_suspensiones_levantada_por_fkey" FOREIGN KEY (levantada_por) REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public."alumno_suspensiones" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_alumno_suspensiones_activa ON public.alumno_suspensiones USING btree (alumno_id) WHERE (estado = 'activa'::text);
CREATE INDEX idx_alumno_suspensiones_alumno ON public.alumno_suspensiones USING btree (alumno_id);
CREATE POLICY "alumno_suspensiones_select" ON public."alumno_suspensiones" FOR SELECT TO authenticated USING (true);
CREATE POLICY "alumno_suspensiones_write" ON public."alumno_suspensiones" FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());

-- ----------------------------------------------------------------------------
-- Tabla: public."alumnos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."alumnos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid,
  "nombre_completo" text NOT NULL,
  "fecha_nacimiento" date,
  "instrumento_principal" text,
  "nivel_actual" integer DEFAULT 1,
  "fecha_ingreso" date DEFAULT CURRENT_DATE,
  "padre_nombre" text,
  "madre_nombre" text,
  "representante_nombre" text,
  "representante_cedula" text,
  "representante_tlf" text,
  "correo_representante" text,
  "tlf_alumno" text,
  "direccion" text,
  "foto_url" text,
  "observaciones_generales" text,
  "activo" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "nivel" text DEFAULT 'inicial'::text NOT NULL,
  "condiciones_medicas" text,
  "alergias" text,
  "medicamentos" text,
  "contacto_emergencia_nombre" text,
  "contacto_emergencia_telefono" text,
  "contacto_emergencia_parentesco" text,
  "familiar_nombre" text,
  "familiar_telefono" text,
  "familiar_parentesco" text,
  "sabe_leer" boolean,
  "sabe_escribir" boolean,
  "nacionalidad" text,
  "tiene_pasaporte" boolean,
  "como_se_entero" text,
  "ubicacion_maps_url" text,
  "municipio_residencia" text,
  "sector_calle_numero" text,
  "madre_cedula" text,
  "madre_tlf_whatsapp" text,
  "padre_cedula" text,
  "padre_tlf_whatsapp" text,
  "otro_responsable_nombre" text,
  "otro_responsable_cedula" text,
  "otro_responsable_tlf" text,
  "contacto_emergencia_2_nombre" text,
  "contacto_emergencia_2_telefono" text,
  "familia_monoparental" boolean,
  "beneficiario_subsidio_estado" boolean,
  "subsidio_descripcion" text,
  "apoyo_actividades" text,
  "tiene_conocimientos_musicales" boolean,
  "instrumento_previo" text,
  "nivel_lectura_musical" text,
  "interes_musical" text,
  "instrumento_interes" text,
  "requiere_iniciacion_musical" boolean,
  "fecha_ingreso_iniciacion" date,
  "por_que_unirse" text,
  "sentimiento_musica_clasica" text,
  "sentimiento_aprender_instrumento" text,
  "aspiracion_instrumento" text,
  "musico_favorito" text,
  "preferencia_aprendizaje_musical" text,
  "tiene_alergias" boolean,
  "alergias_descripcion" text,
  "tiene_condicion_transmisible" boolean,
  "condicion_transmisible_desc" text,
  "tiene_alergia_medicamento" boolean,
  "alergia_medicamento_desc" text,
  "impedimento_social" boolean,
  "problemas_conducta" text,
  "centro_estudios" text,
  "grado_nivel" text,
  "padres_en_vida" text,
  "acepta_beca_4500" boolean,
  "fecha_aceptacion_beca" timestamp with time zone,
  "acepta_pago_600" boolean,
  "fecha_aceptacion_pago" timestamp with time zone,
  "autoriza_fotos_redes" boolean,
  "representante_parentesco" text,
  "exento_mensualidad" boolean DEFAULT false NOT NULL,
  "familia_id" uuid,
  "mora_flag" boolean DEFAULT false NOT NULL,
  "bloqueo_certificado" boolean DEFAULT false NOT NULL,
  "bloqueo_evento" boolean DEFAULT false NOT NULL,
  "abandono_score" numeric,
  "genero" text,
  "promedio_notas" numeric,
  "estado_academico" text DEFAULT 'activo'::text NOT NULL,
  "motivo_baja" text,
  "fecha_baja" date,
  "observaciones_baja" text,
  "baja_procesada_por" uuid,
  "bloqueo_reinscripcion" boolean DEFAULT false NOT NULL,
  "deuda_pendiente_baja_centavos" bigint DEFAULT 0 NOT NULL,
  CONSTRAINT "alumnos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "alumnos_estado_academico_chk" CHECK ((estado_academico = ANY (ARRAY['activo'::text, 'retirado'::text, 'retirado_con_deuda'::text]))),
  CONSTRAINT "alumnos_nivel_actual_check" CHECK (((nivel_actual >= 1) AND (nivel_actual <= 10))),
  CONSTRAINT "alumnos_user_id_key" UNIQUE (user_id),
  CONSTRAINT "chk_interes_musical" CHECK ((interes_musical = ANY (ARRAY['cantar'::text, 'instrumento'::text, 'ambas'::text]))),
  CONSTRAINT "chk_nivel_lectura_musical" CHECK ((nivel_lectura_musical = ANY (ARRAY['basico'::text, 'intermedio'::text, 'avanzado'::text]))),
  CONSTRAINT "chk_padres_en_vida" CHECK ((padres_en_vida = ANY (ARRAY['ambos'::text, 'solo_madre'::text, 'solo_padre'::text, 'ninguno'::text]))),
  CONSTRAINT "chk_problemas_conducta" CHECK ((problemas_conducta = ANY (ARRAY['no'::text, 'pocas_veces'::text, 'si'::text, 'violento'::text]))),
  CONSTRAINT "alumnos_baja_procesada_por_fkey" FOREIGN KEY (baja_procesada_por) REFERENCES auth.users(id),
  CONSTRAINT "alumnos_familia_id_fkey" FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT,
  CONSTRAINT "fk_alumnos_profile" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE public."alumnos" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."alumnos"."abandono_score" IS 'Composite abandonment risk 0-100 from vw_prediccion_abandono. Updated by admin schedule.';
COMMENT ON COLUMN public."alumnos"."bloqueo_certificado" IS 'Blocks certificate generation (mora-triggered).';
COMMENT ON COLUMN public."alumnos"."bloqueo_evento" IS 'Blocks event participation (mora-triggered).';
COMMENT ON COLUMN public."alumnos"."exento_mensualidad" IS 'Si es true, el alumno no genera cuota mensual ni aparece como moroso.';
COMMENT ON COLUMN public."alumnos"."mora_flag" IS 'true when mora > 60 days. Read by maestros portal to block certificates/events.';
COMMENT ON COLUMN public."alumnos"."nivel" IS 'Nivel pedagógico del alumno (Básico/Intermedio/Avanzado), tomado del reconciliado de alumnos activos. Valores previos (inicial/orquesta/iniciación) eran genéricos sin información real de nivel.';
COMMENT ON COLUMN public."alumnos"."promedio_notas" IS 'Promedio de notas reportado en el reconciliado de alumnos activos (Excel ACM), escala 0-100. Se usa junto con nivel para sugerir clase al asignar un alumno sin clase.';
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
CREATE POLICY "Maestros ven alumnos de sus clases" ON public."alumnos" FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM alumnos_clases ac
  WHERE ((ac.alumno_id = alumnos.id) AND maestro_en_clase(ac.clase_id)))));
CREATE POLICY "alumnos_admin_insert" ON public."alumnos" FOR INSERT TO authenticated WITH CHECK ((( SELECT is_admin() AS is_admin) = true));
CREATE POLICY "alumnos_admin_read" ON public."alumnos" FOR SELECT TO authenticated USING ((es_admin() OR (EXISTS ( SELECT 1
   FROM (alumnos_clases ac
     JOIN clases c ON ((c.id = ac.clase_id)))
  WHERE ((ac.alumno_id = alumnos.id) AND (c.maestro_principal_id = auth.uid()))))));
CREATE POLICY "alumnos_admin_update" ON public."alumnos" FOR UPDATE TO authenticated USING ((( SELECT is_admin() AS is_admin) = true)) WITH CHECK ((( SELECT is_admin() AS is_admin) = true));
CREATE POLICY "alumnos_insert_authenticated" ON public."alumnos" FOR INSERT TO authenticated WITH CHECK ((maestro_actual() IS NOT NULL));
CREATE POLICY "alumnos_read_all" ON public."alumnos" FOR SELECT USING (true);
CREATE POLICY "alumnos_superadmin_delete" ON public."alumnos" FOR DELETE TO authenticated USING ((( SELECT is_super_admin() AS is_super_admin) = true));
CREATE POLICY "alumnos_teacher_insert" ON public."alumnos" FOR INSERT TO authenticated WITH CHECK ((( SELECT teacher_can_create_students() AS teacher_can_create_students) = true));
CREATE POLICY "alumnos_update_own" ON public."alumnos" FOR UPDATE TO authenticated USING ((es_admin() OR (EXISTS ( SELECT 1
   FROM (alumnos_clases ac
     JOIN clases c ON ((c.id = ac.clase_id)))
  WHERE ((ac.alumno_id = alumnos.id) AND (c.maestro_principal_id = auth.uid()))))));

-- ----------------------------------------------------------------------------
-- Tabla: public."alumnos_clases"
-- ----------------------------------------------------------------------------
CREATE TABLE public."alumnos_clases" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "alumno_id" uuid NOT NULL,
  "clase_id" uuid NOT NULL,
  "fecha_inscripcion" date DEFAULT CURRENT_DATE,
  "activo" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "hora_inicio" time without time zone,
  "hora_fin" time without time zone,
  "dia" text,
  CONSTRAINT "alumnos_clases_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "alumnos_clases_dia_check" CHECK (((dia IS NULL) OR (dia = ANY (ARRAY['lunes'::text, 'martes'::text, 'miércoles'::text, 'jueves'::text, 'viernes'::text, 'sábado'::text, 'domingo'::text])))),
  CONSTRAINT "alumnos_clases_unico" UNIQUE (alumno_id, clase_id),
  CONSTRAINT "fk_alumnos_clases_alumno" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  CONSTRAINT "fk_alumnos_clases_clase" FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE
);

ALTER TABLE public."alumnos_clases" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX alumnos_clases_unico ON public.alumnos_clases USING btree (alumno_id, clase_id);
CREATE INDEX idx_alumnos_clases_alumno ON public.alumnos_clases USING btree (alumno_id);
CREATE INDEX idx_alumnos_clases_clase ON public.alumnos_clases USING btree (clase_id);
CREATE POLICY "Maestros ven sus inscripciones" ON public."alumnos_clases" FOR SELECT TO authenticated USING (maestro_en_clase(clase_id));
CREATE POLICY "alumnos_clases_admin_read" ON public."alumnos_clases" FOR SELECT USING (es_admin());
CREATE POLICY "alumnos_clases_delete" ON public."alumnos_clases" FOR DELETE TO authenticated USING (((( SELECT is_admin() AS is_admin) = true) OR ((( SELECT profile_is_active() AS profile_is_active) = true) AND ((( SELECT is_teacher() AS is_teacher) = true) AND tiene_permiso('clases:enroll'::text) AND maestro_en_clase(clase_id)))));
CREATE POLICY "alumnos_clases_insert" ON public."alumnos_clases" FOR INSERT TO authenticated WITH CHECK (((( SELECT is_admin() AS is_admin) = true) OR ((( SELECT profile_is_active() AS profile_is_active) = true) AND ((( SELECT is_teacher() AS is_teacher) = true) AND tiene_permiso('clases:enroll'::text) AND maestro_en_clase(clase_id)))));
CREATE POLICY "alumnos_clases_read_all" ON public."alumnos_clases" FOR SELECT USING (true);
CREATE POLICY "alumnos_clases_update" ON public."alumnos_clases" FOR UPDATE TO authenticated USING (((( SELECT is_admin() AS is_admin) = true) OR ((( SELECT profile_is_active() AS profile_is_active) = true) AND ((( SELECT is_teacher() AS is_teacher) = true) AND tiene_permiso('clases:enroll'::text) AND maestro_en_clase(clase_id))))) WITH CHECK (((( SELECT is_admin() AS is_admin) = true) OR ((( SELECT profile_is_active() AS profile_is_active) = true) AND ((( SELECT is_teacher() AS is_teacher) = true) AND tiene_permiso('clases:enroll'::text) AND maestro_en_clase(clase_id)))));

-- ----------------------------------------------------------------------------
-- Tabla: public."alumnos_logros"
-- ----------------------------------------------------------------------------
CREATE TABLE public."alumnos_logros" (
  "alumno_id" uuid NOT NULL,
  "logro_id" uuid NOT NULL,
  "obtenido_en" timestamp with time zone DEFAULT now(),
  CONSTRAINT "alumnos_logros_pkey" PRIMARY KEY ("alumno_id", "logro_id"),
  CONSTRAINT "fk_alumnos_logros_alumno" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  CONSTRAINT "fk_alumnos_logros_logro" FOREIGN KEY (logro_id) REFERENCES logros(id) ON DELETE CASCADE
);

ALTER TABLE public."alumnos_logros" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alumnos_logros_admin_read" ON public."alumnos_logros" FOR SELECT USING (es_admin());
CREATE POLICY "alumnos_logros_authenticated_all" ON public."alumnos_logros" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."alumnos_programas"
-- ----------------------------------------------------------------------------
CREATE TABLE public."alumnos_programas" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "alumno_id" uuid NOT NULL,
  "programa_id" uuid NOT NULL,
  "fecha_inscripcion" date DEFAULT CURRENT_DATE,
  "activo" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "periodo_id" uuid,
  "calificacion" numeric,
  "estado" text DEFAULT 'cursando'::text NOT NULL,
  "fuente" text,
  "requiere_verificacion" boolean DEFAULT false NOT NULL,
  CONSTRAINT "alumnos_programas_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "alumnos_programas_calificacion_check" CHECK (((calificacion >= (0)::numeric) AND (calificacion <= (100)::numeric))),
  CONSTRAINT "alumnos_programas_estado_check" CHECK ((estado = ANY (ARRAY['cursando'::text, 'aprobado'::text, 'repite'::text, 'proyectado'::text, 'retirado'::text]))),
  CONSTRAINT "alumnos_programas_periodo_id_fkey" FOREIGN KEY (periodo_id) REFERENCES periodos(id),
  CONSTRAINT "fk_alumnos_programas_alumno" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  CONSTRAINT "fk_alumnos_programas_programa" FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE CASCADE
);

ALTER TABLE public."alumnos_programas" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."alumnos_programas"."calificacion" IS 'Nota final 0-100 del programa en el período';
COMMENT ON COLUMN public."alumnos_programas"."estado" IS 'cursando | aprobado | repite | proyectado (próximo semestre) | retirado';
CREATE UNIQUE INDEX alumnos_programas_alumno_programa_periodo_unq ON public.alumnos_programas USING btree (alumno_id, programa_id, periodo_id);
CREATE POLICY "Enable read access for all users" ON public."alumnos_programas" FOR SELECT USING (true);
CREATE POLICY "alumnos_programas_admin_read" ON public."alumnos_programas" FOR SELECT USING (es_admin());
CREATE POLICY "alumnos_programas_authenticated_all" ON public."alumnos_programas" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."alumnos_reinscripciones"
-- ----------------------------------------------------------------------------
CREATE TABLE public."alumnos_reinscripciones" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "alumno_id" uuid NOT NULL,
  "fecha" date DEFAULT CURRENT_DATE NOT NULL,
  "procesada_por" uuid,
  "deuda_verificada_centavos" bigint DEFAULT 0 NOT NULL,
  "familia_anterior" uuid,
  "familia_nueva" uuid,
  "notas" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "alumnos_reinscripciones_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "alumnos_reinscripciones_alumno_id_fkey" FOREIGN KEY (alumno_id) REFERENCES alumnos(id),
  CONSTRAINT "alumnos_reinscripciones_procesada_por_fkey" FOREIGN KEY (procesada_por) REFERENCES auth.users(id)
);

ALTER TABLE public."alumnos_reinscripciones" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_alumnos_reinscripciones_alumno ON public.alumnos_reinscripciones USING btree (alumno_id, fecha DESC);
CREATE POLICY "alumnos_reinscripciones_read" ON public."alumnos_reinscripciones" FOR SELECT TO authenticated USING (fn_reinscripcion_rol_autorizado());

-- ----------------------------------------------------------------------------
-- Tabla: public."aplicaciones_pago"
-- ----------------------------------------------------------------------------
CREATE TABLE public."aplicaciones_pago" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "pago_id" uuid NOT NULL,
  "cuota_id" uuid NOT NULL,
  "monto_aplicado_centavos" bigint NOT NULL,
  "dias_atraso_al_aplicar" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "aplicaciones_pago_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "aplicaciones_pago_monto_aplicado_centavos_check" CHECK ((monto_aplicado_centavos > 0)),
  CONSTRAINT "uq_aplicacion" UNIQUE (pago_id, cuota_id),
  CONSTRAINT "aplicaciones_pago_cuota_id_fkey" FOREIGN KEY (cuota_id) REFERENCES cuotas(id),
  CONSTRAINT "aplicaciones_pago_pago_id_fkey" FOREIGN KEY (pago_id) REFERENCES pagos(id)
);

ALTER TABLE public."aplicaciones_pago" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX uq_aplicacion ON public.aplicaciones_pago USING btree (pago_id, cuota_id);
CREATE POLICY "aplicaciones_pago_select_cajero_admin" ON public."aplicaciones_pago" FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = ANY (ARRAY['admin'::text, 'finanzas'::text]))))));

-- ----------------------------------------------------------------------------
-- Tabla: public."app_users"
-- ----------------------------------------------------------------------------
CREATE TABLE public."app_users" (
  "id" uuid NOT NULL,
  "role" text NOT NULL,
  "jurado_id" text NOT NULL,
  "display_name" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "email" text,
  CONSTRAINT "app_users_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "app_users_jurado_id_check" CHECK ((jurado_id = ANY (ARRAY['admin'::text, 'omar'::text, 'kalani'::text, 'manuel'::text, 'especialista'::text]))),
  CONSTRAINT "app_users_role_check" CHECK ((role = ANY (ARRAY['admin'::text, 'jurado'::text]))),
  CONSTRAINT "app_users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public."app_users" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "App users admin modify policy" ON public."app_users" FOR ALL TO authenticated USING (is_app_admin()) WITH CHECK (is_app_admin());
CREATE POLICY "App users select policy" ON public."app_users" FOR SELECT USING (true);
CREATE POLICY "App users self insert policy" ON public."app_users" FOR INSERT TO authenticated WITH CHECK ((id = auth.uid()));
CREATE POLICY "App users self update policy" ON public."app_users" FOR UPDATE TO authenticated USING ((id = auth.uid())) WITH CHECK ((id = auth.uid()));

-- ----------------------------------------------------------------------------
-- Tabla: public."applicant_events"
-- ----------------------------------------------------------------------------
CREATE TABLE public."applicant_events" (
  "id" bigint DEFAULT nextval('applicant_events_id_seq'::regclass) NOT NULL,
  "applicant_id" uuid,
  "event_name" text NOT NULL,
  "payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "applicant_events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "applicant_events_applicant_id_fkey" FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
);

ALTER TABLE public."applicant_events" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_applicant_events_applicant_id ON public.applicant_events USING btree (applicant_id);
CREATE INDEX idx_applicant_events_created_at ON public.applicant_events USING btree (created_at DESC);
CREATE INDEX idx_applicant_events_event_name ON public.applicant_events USING btree (event_name);
CREATE POLICY "applicant_events_all_service_role" ON public."applicant_events" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "applicant_events_no_anon" ON public."applicant_events" FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "applicant_events_select_admin" ON public."applicant_events" FOR SELECT TO authenticated USING ((get_user_role() = 'admin'::text));

-- ----------------------------------------------------------------------------
-- Tabla: public."applicants"
-- ----------------------------------------------------------------------------
CREATE TABLE public."applicants" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "idempotency_key" text NOT NULL,
  "full_name" text NOT NULL,
  "phone_number" text NOT NULL,
  "email" text,
  "utm_source" text DEFAULT 'direct'::text,
  "status" text DEFAULT 'LEAD'::text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "applicants_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "applicants_idempotency_key_key" UNIQUE (idempotency_key),
  CONSTRAINT "applicants_status_check" CHECK ((status = ANY (ARRAY['LEAD'::text, 'FORM_COMPLETED'::text, 'SCHEDULED'::text, 'ATTENDED'::text, 'NO_SHOW'::text, 'CANCELLED'::text])))
);

ALTER TABLE public."applicants" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX applicants_idempotency_key_key ON public.applicants USING btree (idempotency_key);
CREATE INDEX idx_applicants_phone_number ON public.applicants USING btree (phone_number);
CREATE INDEX idx_applicants_status ON public.applicants USING btree (status);
CREATE POLICY "applicants_all_service_role" ON public."applicants" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "applicants_no_anon" ON public."applicants" FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "applicants_select_admin" ON public."applicants" FOR SELECT TO authenticated USING ((get_user_role() = 'admin'::text));

-- ----------------------------------------------------------------------------
-- Tabla: public."appointments"
-- ----------------------------------------------------------------------------
CREATE TABLE public."appointments" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "applicant_id" uuid NOT NULL,
  "scheduled_datetime" timestamp with time zone NOT NULL,
  "status" text DEFAULT 'RESERVED_PENDING'::text NOT NULL,
  "locked_until" timestamp with time zone,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "appointments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "appointments_status_check" CHECK ((status = ANY (ARRAY['RESERVED_PENDING'::text, 'CONFIRMED'::text, 'CANCELLED'::text, 'COMPLETED'::text]))),
  CONSTRAINT "appointments_applicant_id_fkey" FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
);

ALTER TABLE public."appointments" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_appointments_applicant_id ON public.appointments USING btree (applicant_id);
CREATE INDEX idx_appointments_scheduled_datetime ON public.appointments USING btree (scheduled_datetime);
CREATE INDEX idx_appointments_status ON public.appointments USING btree (status);
CREATE UNIQUE INDEX uq_active_confirmed_slot ON public.appointments USING btree (scheduled_datetime) WHERE (status = 'CONFIRMED'::text);
CREATE POLICY "appointments_all_service_role" ON public."appointments" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "appointments_no_anon" ON public."appointments" FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "appointments_select_admin" ON public."appointments" FOR SELECT TO authenticated USING ((get_user_role() = 'admin'::text));
CREATE POLICY "appointments_update_admin" ON public."appointments" FOR UPDATE TO authenticated USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));

-- ----------------------------------------------------------------------------
-- Tabla: public."asistencia_maestros"
-- ----------------------------------------------------------------------------
CREATE TABLE public."asistencia_maestros" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "sesion_clase_id" uuid NOT NULL,
  "maestro_id" uuid NOT NULL,
  "clase_id" uuid,
  "periodo_id" uuid,
  "fecha" date NOT NULL,
  "estado" text NOT NULL,
  "ausencia_id" uuid,
  "suplente_id" uuid,
  "motivo" text,
  "observaciones" text,
  "registrado_por" uuid,
  "marked_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "asistencia_maestros_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "asistencia_maestros_estado_check" CHECK ((estado = ANY (ARRAY['presente'::text, 'ausente'::text, 'justificado'::text, 'suplencia'::text, 'tardanza'::text]))),
  CONSTRAINT "asistencia_maestros_sesion_maestro_uniq" UNIQUE (sesion_clase_id, maestro_id),
  CONSTRAINT "asistencia_maestros_suplencia_chk" CHECK (((estado <> 'suplencia'::text) OR (suplente_id IS NOT NULL))),
  CONSTRAINT "asistencia_maestros_ausencia_id_fkey" FOREIGN KEY (ausencia_id) REFERENCES ausencias_maestros(id) ON DELETE SET NULL,
  CONSTRAINT "asistencia_maestros_clase_id_fkey" FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE SET NULL,
  CONSTRAINT "asistencia_maestros_maestro_id_fkey" FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE RESTRICT,
  CONSTRAINT "asistencia_maestros_periodo_id_fkey" FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE SET NULL,
  CONSTRAINT "asistencia_maestros_registrado_por_fkey" FOREIGN KEY (registrado_por) REFERENCES profiles(id) ON DELETE SET NULL,
  CONSTRAINT "asistencia_maestros_sesion_clase_id_fkey" FOREIGN KEY (sesion_clase_id) REFERENCES sesiones_clase(id) ON DELETE CASCADE,
  CONSTRAINT "asistencia_maestros_suplente_id_fkey" FOREIGN KEY (suplente_id) REFERENCES maestros(id) ON DELETE SET NULL
);

ALTER TABLE public."asistencia_maestros" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."asistencia_maestros"."marked_at" IS 'Momento del registro. Permite medir puntualidad de carga: marked_at::date - fecha.';
COMMENT ON TABLE public."asistencia_maestros" IS 'Presencia del docente por sesion de clase. Complementa ausencias_maestros (que modela solicitudes de permiso, no presencia diaria).';
CREATE UNIQUE INDEX asistencia_maestros_sesion_maestro_uniq ON public.asistencia_maestros USING btree (sesion_clase_id, maestro_id);
CREATE INDEX idx_asist_maestros_maestro_fecha ON public.asistencia_maestros USING btree (maestro_id, fecha DESC);
CREATE INDEX idx_asist_maestros_periodo ON public.asistencia_maestros USING btree (periodo_id) WHERE (periodo_id IS NOT NULL);
CREATE INDEX idx_asist_maestros_sesion ON public.asistencia_maestros USING btree (sesion_clase_id);
CREATE POLICY "asistencia_maestros_admin_all" ON public."asistencia_maestros" FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "asistencia_maestros_self_read" ON public."asistencia_maestros" FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM maestros m
  WHERE ((m.id = asistencia_maestros.maestro_id) AND (m.user_id = auth.uid())))));

-- ----------------------------------------------------------------------------
-- Tabla: public."asistencias"
-- ----------------------------------------------------------------------------
CREATE TABLE public."asistencias" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "sesion_clase_id" uuid NOT NULL,
  "clase_id" uuid NOT NULL,
  "alumno_id" uuid NOT NULL,
  "fecha" date NOT NULL,
  "estado" text NOT NULL,
  "justificacion_texto" text,
  "observaciones" text,
  "registrado_por" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "periodo_id" uuid,
  "marked_at" timestamp with time zone,
  CONSTRAINT "asistencias_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "asistencias_estado_check" CHECK ((estado = ANY (ARRAY['presente'::text, 'ausente'::text, 'tarde'::text, 'justificado'::text]))),
  CONSTRAINT "asistencias_unica_por_sesion" UNIQUE (sesion_clase_id, alumno_id),
  CONSTRAINT "uk_asistencias_clase_alumno_fecha" UNIQUE (clase_id, alumno_id, fecha),
  CONSTRAINT "asistencias_periodo_id_fkey" FOREIGN KEY (periodo_id) REFERENCES periodos(id),
  CONSTRAINT "fk_asistencias_alumno" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  CONSTRAINT "fk_asistencias_clase" FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE,
  CONSTRAINT "fk_asistencias_registrado_por" FOREIGN KEY (registrado_por) REFERENCES profiles(id) ON DELETE SET NULL,
  CONSTRAINT "fk_asistencias_sesion" FOREIGN KEY (sesion_clase_id) REFERENCES sesiones_clase(id) ON DELETE CASCADE
);

ALTER TABLE public."asistencias" ENABLE ROW LEVEL SECURITY;
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
CREATE POLICY "Maestros gestionan sus asistencias" ON public."asistencias" FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM sesiones_clase s
  WHERE ((s.id = asistencias.sesion_clase_id) AND ((s.maestro_id = maestro_actual()) OR maestro_en_clase(s.clase_id)))))) WITH CHECK ((tiene_permiso('asistencias:write'::text) AND (EXISTS ( SELECT 1
   FROM sesiones_clase s
  WHERE ((s.id = asistencias.sesion_clase_id) AND ((s.maestro_id = maestro_actual()) OR maestro_en_clase(s.clase_id)))))));
CREATE POLICY "asistencias_admin_insert" ON public."asistencias" FOR INSERT TO authenticated WITH CHECK ((es_admin() OR (EXISTS ( SELECT 1
   FROM sesiones_clase s
  WHERE ((s.id = asistencias.sesion_clase_id) AND ((s.maestro_id = maestro_actual()) OR maestro_en_clase(s.clase_id)))))));
CREATE POLICY "asistencias_admin_select" ON public."asistencias" FOR SELECT TO authenticated USING ((es_admin() OR (EXISTS ( SELECT 1
   FROM sesiones_clase s
  WHERE ((s.id = asistencias.sesion_clase_id) AND ((s.maestro_id = maestro_actual()) OR maestro_en_clase(s.clase_id)))))));
CREATE POLICY "asistencias_admin_update" ON public."asistencias" FOR UPDATE TO authenticated USING ((es_admin() OR (EXISTS ( SELECT 1
   FROM sesiones_clase s
  WHERE ((s.id = asistencias.sesion_clase_id) AND ((s.maestro_id = maestro_actual()) OR maestro_en_clase(s.clase_id))))))) WITH CHECK ((es_admin() OR (EXISTS ( SELECT 1
   FROM sesiones_clase s
  WHERE ((s.id = asistencias.sesion_clase_id) AND ((s.maestro_id = maestro_actual()) OR maestro_en_clase(s.clase_id)))))));
CREATE POLICY "asistencias_superadmin_delete" ON public."asistencias" FOR DELETE TO authenticated USING ((( SELECT is_super_admin() AS is_super_admin) = true));

-- ----------------------------------------------------------------------------
-- Tabla: public."ausencias"
-- ----------------------------------------------------------------------------
CREATE TABLE public."ausencias" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "maestro_id" uuid NOT NULL,
  "fecha_ausencia" date NOT NULL,
  "motivo" text NOT NULL,
  "reemplazo_maestro_id" uuid,
  "clase_alternativa" text,
  "notificacion_enviada" boolean DEFAULT false,
  "estado" text DEFAULT 'pendiente'::text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "ausencias_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ausencias_estado_check" CHECK ((estado = ANY (ARRAY['pendiente'::text, 'notificado'::text, 'resuelta'::text])))
);

ALTER TABLE public."ausencias" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_ausencias_estado ON public.ausencias USING btree (estado);
CREATE INDEX idx_ausencias_fecha_ausencia ON public.ausencias USING btree (fecha_ausencia);
CREATE INDEX idx_ausencias_maestro_fecha ON public.ausencias USING btree (maestro_id, fecha_ausencia);
CREATE INDEX idx_ausencias_maestro_id ON public.ausencias USING btree (maestro_id);
CREATE POLICY "Authenticated users can view ausencias" ON public."ausencias" FOR SELECT USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "Maestros gestionan sus ausencias" ON public."ausencias" FOR ALL TO authenticated USING ((maestro_id = maestro_actual()));
CREATE POLICY "Service role has full access to ausencias" ON public."ausencias" FOR ALL USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));
CREATE POLICY "ausencias_admin_read" ON public."ausencias" FOR SELECT USING (es_admin());

-- ----------------------------------------------------------------------------
-- Tabla: public."ausencias_auditoria"
-- ----------------------------------------------------------------------------
CREATE TABLE public."ausencias_auditoria" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "ausencia_id" uuid NOT NULL,
  "actor_id" uuid NOT NULL,
  "accion" text NOT NULL,
  "notas" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "ausencias_auditoria_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ausencias_auditoria_actor_id_fkey" FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE RESTRICT,
  CONSTRAINT "ausencias_auditoria_ausencia_id_fkey" FOREIGN KEY (ausencia_id) REFERENCES ausencias(id) ON DELETE CASCADE
);

ALTER TABLE public."ausencias_auditoria" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_ausencias_auditoria_actor_id ON public.ausencias_auditoria USING btree (actor_id);
CREATE INDEX idx_ausencias_auditoria_ausencia_id ON public.ausencias_auditoria USING btree (ausencia_id);
CREATE INDEX idx_ausencias_auditoria_created_at ON public.ausencias_auditoria USING btree (created_at DESC);
CREATE POLICY "ausencias_auditoria_insert" ON public."ausencias_auditoria" FOR INSERT TO authenticated WITH CHECK ((actor_id = auth.uid()));
CREATE POLICY "ausencias_auditoria_select" ON public."ausencias_auditoria" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."ausencias_maestros"
-- ----------------------------------------------------------------------------
CREATE TABLE public."ausencias_maestros" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "maestro_id" uuid NOT NULL,
  "tipo_ausencia" text NOT NULL,
  "fecha_inicio" date NOT NULL,
  "fecha_fin" date NOT NULL,
  "motivo" text,
  "estado" text DEFAULT 'pendiente'::text,
  "urgencia" text DEFAULT 'media'::text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "duracion_tipo" text DEFAULT 'un_dia'::text,
  "archivo_url" text,
  "maestro_suplente_id" uuid,
  "notificar_director" boolean DEFAULT true,
  "director_notificacion_id" uuid,
  "aprobado_por" uuid,
  "decision_notas" text,
  "decidido_en" timestamp with time zone,
  "revisado_por" uuid,
  "revision_notas" text,
  "revision_en" timestamp with time zone,
  "aprobado_en" timestamp with time zone,
  "rechazado_por" uuid,
  "rechazado_en" timestamp with time zone,
  "razon_rechazo" text,
  "intentos_solicitud" integer DEFAULT 0,
  "fecha_solicitud_original" date,
  "clases_afectadas" ARRAY,
  "actividades_por_clase" jsonb,
  "clase_emergente" jsonb,
  CONSTRAINT "ausencias_maestros_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ausencias_maestros_duracion_tipo_check" CHECK ((duracion_tipo = ANY (ARRAY['un_dia'::text, 'varios_dias'::text]))),
  CONSTRAINT "ausencias_maestros_estado_check" CHECK ((estado = ANY (ARRAY['pendiente'::text, 'aprobada'::text, 'rechazada'::text, 'cancelada'::text]))),
  CONSTRAINT "ausencias_maestros_urgencia_check" CHECK ((urgencia = ANY (ARRAY['baja'::text, 'media'::text, 'alta'::text, 'critica'::text]))),
  CONSTRAINT "ausencias_maestros_aprobado_por_fkey" FOREIGN KEY (aprobado_por) REFERENCES profiles(id) ON DELETE SET NULL,
  CONSTRAINT "ausencias_maestros_director_notificacion_id_fkey" FOREIGN KEY (director_notificacion_id) REFERENCES notificaciones(id) ON DELETE SET NULL,
  CONSTRAINT "ausencias_maestros_maestro_id_fkey" FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE,
  CONSTRAINT "ausencias_maestros_maestro_suplente_id_fkey" FOREIGN KEY (maestro_suplente_id) REFERENCES maestros(id) ON DELETE SET NULL,
  CONSTRAINT "ausencias_maestros_rechazado_por_fkey" FOREIGN KEY (rechazado_por) REFERENCES auth.users(id),
  CONSTRAINT "ausencias_maestros_revisado_por_fkey" FOREIGN KEY (revisado_por) REFERENCES auth.users(id)
);

ALTER TABLE public."ausencias_maestros" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."ausencias_maestros"."actividades_por_clase" IS 'Mapa clase_id -> actividad de reemplazo.';
COMMENT ON COLUMN public."ausencias_maestros"."archivo_url" IS 'URL pública del documento de soporte subido al bucket documentos.';
COMMENT ON COLUMN public."ausencias_maestros"."clase_emergente" IS 'Datos de reprogramacion { activo, clase_id, fecha, hora, salon_id } o null.';
COMMENT ON COLUMN public."ausencias_maestros"."clases_afectadas" IS 'IDs de clases afectadas por la ausencia (denormalizado).';
COMMENT ON COLUMN public."ausencias_maestros"."director_notificacion_id" IS 'Notificación in-app enviada a dirección/admin para esta solicitud.';
COMMENT ON COLUMN public."ausencias_maestros"."duracion_tipo" IS 'Duration type: un_dia (single day) or varios_dias (date range)';
COMMENT ON COLUMN public."ausencias_maestros"."maestro_suplente_id" IS 'Substitute teacher assigned to cover the absence';
COMMENT ON COLUMN public."ausencias_maestros"."notificar_director" IS 'Whether director should be automatically notified';
COMMENT ON TABLE public."ausencias_maestros" IS 'Registro de ausencias y solicitudes de permisos de los docentes';
CREATE INDEX idx_ausencias_maestros_aprobado_en ON public.ausencias_maestros USING btree (aprobado_en);
CREATE INDEX idx_ausencias_maestros_estado ON public.ausencias_maestros USING btree (estado);
CREATE INDEX idx_ausencias_maestros_fecha_solicitud_original ON public.ausencias_maestros USING btree (fecha_solicitud_original);
CREATE INDEX idx_ausencias_maestros_fechas ON public.ausencias_maestros USING btree (fecha_inicio, fecha_fin);
CREATE INDEX idx_ausencias_maestros_rechazado_por ON public.ausencias_maestros USING btree (rechazado_por);
CREATE INDEX idx_ausencias_maestros_revisado_por ON public.ausencias_maestros USING btree (revisado_por);
CREATE INDEX idx_ausencias_maestros_revision_en ON public.ausencias_maestros USING btree (revision_en);
CREATE POLICY "Maestros pueden cancelar sus propias solicitudes" ON public."ausencias_maestros" FOR UPDATE USING ((maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))));
CREATE POLICY "Maestros pueden crear sus propias solicitudes" ON public."ausencias_maestros" FOR INSERT WITH CHECK ((maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))));
CREATE POLICY "Maestros pueden ver sus propias ausencias" ON public."ausencias_maestros" FOR SELECT USING ((maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))));
CREATE POLICY "ausencias_maestros_admin_read" ON public."ausencias_maestros" FOR SELECT USING (es_admin());

-- ----------------------------------------------------------------------------
-- Tabla: public."becas"
-- ----------------------------------------------------------------------------
CREATE TABLE public."becas" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "alumno_id" uuid NOT NULL,
  "familia_id" uuid NOT NULL,
  "porcentaje" numeric NOT NULL,
  "motivo" text NOT NULL,
  "aprobado_por" uuid,
  "activa" boolean DEFAULT true,
  "fecha_inicio" date NOT NULL,
  "fecha_fin" date,
  "indicador_progreso_minimo" text,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "becas_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "becas_porcentaje_check" CHECK (((porcentaje > (0)::numeric) AND (porcentaje <= (100)::numeric))),
  CONSTRAINT "becas_alumno_id_fkey" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE RESTRICT,
  CONSTRAINT "becas_aprobado_por_fkey" FOREIGN KEY (aprobado_por) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT "becas_familia_id_fkey" FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT
);

ALTER TABLE public."becas" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "becas_all_admin" ON public."becas" FOR ALL USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
CREATE POLICY "becas_select_cajero_admin" ON public."becas" FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));

-- ----------------------------------------------------------------------------
-- Tabla: public."blocks"
-- ----------------------------------------------------------------------------
CREATE TABLE public."blocks" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "route_version_id" uuid NOT NULL,
  "name" text NOT NULL,
  "level_from" integer NOT NULL,
  "level_to" integer NOT NULL,
  "objective" text,
  "description" text,
  "order_index" integer DEFAULT 0 NOT NULL,
  CONSTRAINT "blocks_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "blocks_route_version_id_fkey" FOREIGN KEY (route_version_id) REFERENCES route_versions(id) ON DELETE CASCADE
);

ALTER TABLE public."blocks" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Maestros pueden leer bloques de rutas" ON public."blocks" FOR SELECT TO authenticated USING (true);
CREATE POLICY "blocks_admin_read" ON public."blocks" FOR SELECT USING (es_admin());
CREATE POLICY "maestros_write_own_draft_blocks" ON public."blocks" FOR ALL USING ((route_version_id IN ( SELECT route_versions.id
   FROM route_versions
  WHERE ((route_versions.created_by = auth.uid()) AND (route_versions.status = 'draft'::route_status))))) WITH CHECK ((route_version_id IN ( SELECT route_versions.id
   FROM route_versions
  WHERE ((route_versions.created_by = auth.uid()) AND (route_versions.status = 'draft'::route_status)))));

-- ----------------------------------------------------------------------------
-- Tabla: public."calendario"
-- ----------------------------------------------------------------------------
CREATE TABLE public."calendario" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "departamento_id" uuid NOT NULL,
  "titulo" text NOT NULL,
  "descripcion" text,
  "tipo" text NOT NULL,
  "fecha_inicio" date NOT NULL,
  "fecha_fin" date NOT NULL,
  "fecha_alerta" integer DEFAULT 7,
  "prioridad" text DEFAULT 'media'::text,
  "estado" text DEFAULT 'planificado'::text,
  "responsable_id" uuid,
  "protocolo_json" jsonb DEFAULT '{}'::jsonb,
  "notas" text,
  "created_by" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "calendario_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "calendario_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE RESTRICT,
  CONSTRAINT "calendario_departamento_id_fkey" FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE,
  CONSTRAINT "calendario_responsable_id_fkey" FOREIGN KEY (responsable_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public."calendario" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_calendario_departamento ON public.calendario USING btree (departamento_id);
CREATE INDEX idx_calendario_estado ON public.calendario USING btree (estado);
CREATE INDEX idx_calendario_fecha ON public.calendario USING btree (fecha_inicio, fecha_fin);
CREATE INDEX idx_calendario_tipo ON public.calendario USING btree (tipo);
CREATE POLICY "calendario_admin_all" ON public."calendario" FOR ALL USING ((get_user_role() = 'admin'::text));
CREATE POLICY "calendario_insert_own_dept" ON public."calendario" FOR INSERT WITH CHECK (((departamento_id IN ( SELECT usuario_departamentos.departamento_id
   FROM usuario_departamentos
  WHERE (usuario_departamentos.user_id = auth.uid()))) AND (created_by = auth.uid())));
CREATE POLICY "calendario_select_own_dept" ON public."calendario" FOR SELECT USING ((departamento_id IN ( SELECT usuario_departamentos.departamento_id
   FROM usuario_departamentos
  WHERE (usuario_departamentos.user_id = auth.uid()))));
CREATE POLICY "calendario_update_own_dept" ON public."calendario" FOR UPDATE USING ((departamento_id IN ( SELECT usuario_departamentos.departamento_id
   FROM usuario_departamentos
  WHERE (usuario_departamentos.user_id = auth.uid()))));

-- ----------------------------------------------------------------------------
-- Tabla: public."calendario_institucional"
-- ----------------------------------------------------------------------------
CREATE TABLE public."calendario_institucional" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "titulo" text NOT NULL,
  "descripcion" text,
  "categoria" event_categoria DEFAULT 'otro'::event_categoria NOT NULL,
  "fecha_inicio" timestamp with time zone NOT NULL,
  "fecha_fin" timestamp with time zone NOT NULL,
  "ubicacion" text,
  "departamento_responsable" soi_departamento DEFAULT 'DIR'::soi_departamento NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "estado" text DEFAULT 'programado'::text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "es_macro_evento" boolean DEFAULT false,
  "salud_proyecto" text DEFAULT 'en_orden'::text,
  "venue_id" text,
  "aforo_proyectado" integer DEFAULT 0,
  "metadata_pm" jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT "calendario_institucional_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "calendario_institucional_estado_check" CHECK ((estado = ANY (ARRAY['programado'::text, 'en_curso'::text, 'completado'::text, 'cancelado'::text]))),
  CONSTRAINT "calendario_institucional_salud_proyecto_check" CHECK ((salud_proyecto = ANY (ARRAY['en_orden'::text, 'en_riesgo'::text, 'critico'::text, 'completado'::text])))
);

ALTER TABLE public."calendario_institucional" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_calendario_macro ON public.calendario_institucional USING btree (es_macro_evento) WHERE (es_macro_evento = true);
CREATE POLICY "calendario_auth_all" ON public."calendario_institucional" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."campania_envios"
-- ----------------------------------------------------------------------------
CREATE TABLE public."campania_envios" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "campania_id" uuid NOT NULL,
  "fuente" text NOT NULL,
  "persona_id" uuid NOT NULL,
  "nombre" text,
  "telefono" text,
  "jid" text NOT NULL,
  "segmento" text NOT NULL,
  "mensaje" text,
  "estado" text DEFAULT 'pendiente_envio'::text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "campania_envios_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "campania_envios_campania_id_jid_key" UNIQUE (campania_id, jid),
  CONSTRAINT "campania_envios_fuente_check" CHECK ((fuente = ANY (ARRAY['postulante'::text, 'alumno'::text]))),
  CONSTRAINT "campania_envios_campania_id_fkey" FOREIGN KEY (campania_id) REFERENCES campanias_periodo(id) ON DELETE CASCADE
);

ALTER TABLE public."campania_envios" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX campania_envios_campania_id_jid_key ON public.campania_envios USING btree (campania_id, jid);
CREATE POLICY "ce_admin_all" ON public."campania_envios" FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());

-- ----------------------------------------------------------------------------
-- Tabla: public."campanias_periodo"
-- ----------------------------------------------------------------------------
CREATE TABLE public."campanias_periodo" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "nombre" text NOT NULL,
  "tipo" text NOT NULL,
  "accion" text NOT NULL,
  "fecha_inicio" date NOT NULL,
  "fecha_fin" date NOT NULL,
  "activo" boolean DEFAULT false NOT NULL,
  "periodo_academico_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid DEFAULT auth.uid(),
  "abre_servicio_publico" boolean DEFAULT false NOT NULL,
  CONSTRAINT "campanias_periodo_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "campanias_periodo_accion_check" CHECK ((accion = ANY (ARRAY['inscripcion'::text, 'reinscripcion'::text, 'concierto'::text, 'microperiodo'::text, 'servicio'::text]))),
  CONSTRAINT "campanias_periodo_tipo_check" CHECK ((tipo = ANY (ARRAY['A'::text, 'B'::text]))),
  CONSTRAINT "campanias_periodo_periodo_academico_id_fkey" FOREIGN KEY (periodo_academico_id) REFERENCES periodos(id) ON DELETE SET NULL
);

ALTER TABLE public."campanias_periodo" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX uq_campania_activa ON public.campanias_periodo USING btree (tipo, accion) WHERE activo;
CREATE POLICY "cp_admin_all" ON public."campanias_periodo" FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());

-- ----------------------------------------------------------------------------
-- Tabla: public."catalogo_niveles"
-- ----------------------------------------------------------------------------
CREATE TABLE public."catalogo_niveles" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "nombre" text NOT NULL,
  "instrumento" text NOT NULL,
  "orden" integer NOT NULL,
  "activo" boolean DEFAULT true NOT NULL,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "catalogo_niveles_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "catalogo_niveles_instrumento_orden_key" UNIQUE (instrumento, orden),
  CONSTRAINT "catalogo_niveles_created_by_fkey" FOREIGN KEY (created_by) REFERENCES maestros(id)
);

ALTER TABLE public."catalogo_niveles" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX catalogo_niveles_instrumento_orden_key ON public.catalogo_niveles USING btree (instrumento, orden);
CREATE INDEX idx_catn_instrumento ON public.catalogo_niveles USING btree (instrumento);
CREATE POLICY "catalogo_niveles_admin" ON public."catalogo_niveles" FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "catalogo_niveles_read" ON public."catalogo_niveles" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."catalogo_objetivos_especificos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."catalogo_objetivos_especificos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "objetivo_general_id" uuid NOT NULL,
  "nombre" text NOT NULL,
  "orden" integer NOT NULL,
  "activo" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "catalogo_objetivos_especificos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "catalogo_objetivos_especificos_objetivo_general_id_orden_key" UNIQUE (objetivo_general_id, orden),
  CONSTRAINT "catalogo_objetivos_especificos_objetivo_general_id_fkey" FOREIGN KEY (objetivo_general_id) REFERENCES catalogo_objetivos_generales(id) ON DELETE CASCADE
);

ALTER TABLE public."catalogo_objetivos_especificos" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."catalogo_objetivos_especificos" IS '-- DEPRECATED: plantilla curricular legacy en evaluación 2026-09 (Owner: ACM)';
CREATE UNIQUE INDEX catalogo_objetivos_especificos_objetivo_general_id_orden_key ON public.catalogo_objetivos_especificos USING btree (objetivo_general_id, orden);
CREATE INDEX idx_catoe_objetivo_general ON public.catalogo_objetivos_especificos USING btree (objetivo_general_id);
CREATE POLICY "catalogo_objetivos_especificos_admin" ON public."catalogo_objetivos_especificos" FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "catalogo_objetivos_especificos_read" ON public."catalogo_objetivos_especificos" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."catalogo_objetivos_generales"
-- ----------------------------------------------------------------------------
CREATE TABLE public."catalogo_objetivos_generales" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "nivel_id" uuid NOT NULL,
  "nombre" text NOT NULL,
  "descripcion" text,
  "orden" integer NOT NULL,
  "activo" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "catalogo_objetivos_generales_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "catalogo_objetivos_generales_nivel_id_orden_key" UNIQUE (nivel_id, orden),
  CONSTRAINT "catalogo_objetivos_generales_nivel_id_fkey" FOREIGN KEY (nivel_id) REFERENCES catalogo_niveles(id) ON DELETE CASCADE
);

ALTER TABLE public."catalogo_objetivos_generales" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX catalogo_objetivos_generales_nivel_id_orden_key ON public.catalogo_objetivos_generales USING btree (nivel_id, orden);
CREATE INDEX idx_catog_nivel ON public.catalogo_objetivos_generales USING btree (nivel_id);
CREATE POLICY "catalogo_objetivos_generales_admin" ON public."catalogo_objetivos_generales" FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "catalogo_objetivos_generales_read" ON public."catalogo_objetivos_generales" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."catalogos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."catalogos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "tipo" text NOT NULL,
  "nombre" text NOT NULL,
  "descripcion" text,
  "codigo" text,
  "categoria" text,
  "orden" integer DEFAULT 0,
  "activo" boolean DEFAULT true,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "catalogos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "catalogos_tipo_check" CHECK ((tipo = ANY (ARRAY['contenidos'::text, 'medidas'::text, 'sugerencias'::text, 'tareas'::text, 'objetivos'::text]))),
  CONSTRAINT "catalogos_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

ALTER TABLE public."catalogos" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_catalogos_activo ON public.catalogos USING btree (activo);
CREATE INDEX idx_catalogos_tipo ON public.catalogos USING btree (tipo);
CREATE POLICY "catalogos_admin_read" ON public."catalogos" FOR SELECT USING (es_admin());

-- ----------------------------------------------------------------------------
-- Tabla: public."clase_horarios"
-- ----------------------------------------------------------------------------
CREATE TABLE public."clase_horarios" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "clase_id" uuid NOT NULL,
  "dia" text NOT NULL,
  "hora_inicio" time without time zone NOT NULL,
  "hora_fin" time without time zone NOT NULL,
  "salon_id" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  "maestro_id" uuid,
  CONSTRAINT "clase_horarios_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "clase_horarios_check" CHECK ((hora_fin > hora_inicio)),
  CONSTRAINT "clase_horarios_dia_check" CHECK ((dia = ANY (ARRAY['lunes'::text, 'martes'::text, 'miércoles'::text, 'jueves'::text, 'viernes'::text, 'sábado'::text, 'domingo'::text]))),
  CONSTRAINT "clase_horarios_clase_id_fkey" FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE,
  CONSTRAINT "clase_horarios_salon_id_fkey" FOREIGN KEY (salon_id) REFERENCES salones(id) ON DELETE SET NULL
);

ALTER TABLE public."clase_horarios" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_clase_horarios_clase_dia ON public.clase_horarios USING btree (clase_id, dia);
CREATE INDEX idx_clase_horarios_clase_id ON public.clase_horarios USING btree (clase_id);
CREATE POLICY "Permitir actualizar clase_horarios" ON public."clase_horarios" FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir crear clase_horarios" ON public."clase_horarios" FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir eliminar clase_horarios" ON public."clase_horarios" FOR DELETE USING (true);
CREATE POLICY "clase_horarios_admin_read" ON public."clase_horarios" FOR SELECT USING (es_admin());
CREATE POLICY "clase_horarios_delete" ON public."clase_horarios" FOR DELETE TO authenticated USING (maestro_en_clase(clase_id));
CREATE POLICY "clase_horarios_insert" ON public."clase_horarios" FOR INSERT TO authenticated WITH CHECK (maestro_en_clase(clase_id));
CREATE POLICY "clase_horarios_select" ON public."clase_horarios" FOR SELECT TO authenticated USING (maestro_en_clase(clase_id));
CREATE POLICY "clase_horarios_update" ON public."clase_horarios" FOR UPDATE TO authenticated USING (maestro_en_clase(clase_id)) WITH CHECK (maestro_en_clase(clase_id));

-- ----------------------------------------------------------------------------
-- Tabla: public."clase_mapa_indicadores"
-- ----------------------------------------------------------------------------
CREATE TABLE public."clase_mapa_indicadores" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "objetivo_id" uuid NOT NULL,
  "clase_id" uuid NOT NULL,
  "origen_indicator_id" uuid,
  "descripcion" text NOT NULL,
  "orden_indicador" integer NOT NULL,
  "order_index" integer DEFAULT 0 NOT NULL,
  "es_requerido" boolean DEFAULT true NOT NULL,
  "id_jerarquico" text NOT NULL,
  "archived_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "clase_mapa_indicadores_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "clase_mapa_indicadores_clase_id_id_jerarquico_key" UNIQUE (clase_id, id_jerarquico),
  CONSTRAINT "clase_mapa_indicadores_objetivo_id_orden_indicador_key" UNIQUE (objetivo_id, orden_indicador),
  CONSTRAINT "clase_mapa_indicadores_clase_id_fkey" FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE,
  CONSTRAINT "clase_mapa_indicadores_objetivo_id_fkey" FOREIGN KEY (objetivo_id) REFERENCES clase_mapa_objetivos(id) ON DELETE RESTRICT,
  CONSTRAINT "clase_mapa_indicadores_origen_indicator_id_fkey" FOREIGN KEY (origen_indicator_id) REFERENCES catalogo_objetivos_especificos(id) ON DELETE SET NULL
);

ALTER TABLE public."clase_mapa_indicadores" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."clase_mapa_indicadores"."origen_indicator_id" IS 'FK a catalogo_objetivos_especificos — de qué indicador del catálogo se clonó (NULL = autoría 100% del maestro).';
COMMENT ON TABLE public."clase_mapa_indicadores" IS '-- DEPRECATED: jerarquía legacy en evaluación 2026-09 (Owner: ACM)';
CREATE UNIQUE INDEX clase_mapa_indicadores_clase_id_id_jerarquico_key ON public.clase_mapa_indicadores USING btree (clase_id, id_jerarquico);
CREATE UNIQUE INDEX clase_mapa_indicadores_objetivo_id_orden_indicador_key ON public.clase_mapa_indicadores USING btree (objetivo_id, orden_indicador);
CREATE INDEX idx_cmi_clase ON public.clase_mapa_indicadores USING btree (clase_id);
CREATE INDEX idx_cmi_objetivo ON public.clase_mapa_indicadores USING btree (objetivo_id);
CREATE INDEX idx_cmi_origen_indicator ON public.clase_mapa_indicadores USING btree (origen_indicator_id);
CREATE POLICY "clase_mapa_indicadores_owner" ON public."clase_mapa_indicadores" FOR ALL TO authenticated USING ((es_admin() OR es_coordinador_acm() OR es_maestro_titular_de_clase(clase_id))) WITH CHECK ((es_admin() OR es_coordinador_acm() OR es_maestro_titular_de_clase(clase_id)));

-- ----------------------------------------------------------------------------
-- Tabla: public."clase_mapa_objetivos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."clase_mapa_objetivos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "clase_id" uuid NOT NULL,
  "level_id" uuid NOT NULL,
  "origen_node_id" uuid,
  "origen_objetivo_id" uuid,
  "nombre" text NOT NULL,
  "descripcion" text,
  "orden_objetivo" integer NOT NULL,
  "order_index" integer DEFAULT 0 NOT NULL,
  "archived_at" timestamp with time zone,
  "created_by" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "estado_revision" text DEFAULT 'borrador'::text NOT NULL,
  CONSTRAINT "clase_mapa_objetivos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "clase_mapa_objetivos_clase_id_level_id_orden_objetivo_key" UNIQUE (clase_id, level_id, orden_objetivo),
  CONSTRAINT "clase_mapa_objetivos_estado_revision_check" CHECK ((estado_revision = ANY (ARRAY['borrador'::text, 'revisada'::text, 'publicada'::text]))),
  CONSTRAINT "clase_mapa_objetivos_clase_id_fkey" FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE,
  CONSTRAINT "clase_mapa_objetivos_created_by_fkey" FOREIGN KEY (created_by) REFERENCES maestros(id),
  CONSTRAINT "clase_mapa_objetivos_level_id_fkey" FOREIGN KEY (level_id) REFERENCES catalogo_niveles(id) ON DELETE RESTRICT,
  CONSTRAINT "clase_mapa_objetivos_origen_objetivo_id_fkey" FOREIGN KEY (origen_objetivo_id) REFERENCES catalogo_objetivos_generales(id) ON DELETE SET NULL
);

ALTER TABLE public."clase_mapa_objetivos" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."clase_mapa_objetivos"."level_id" IS 'FK a catalogo_niveles (catálogo propio) — ya NO a la tabla levels del árbol curricular viejo.';
COMMENT ON COLUMN public."clase_mapa_objetivos"."origen_objetivo_id" IS 'FK a catalogo_objetivos_generales — de qué objetivo general del catálogo se clonó (NULL = autoría 100% del maestro).';
COMMENT ON TABLE public."clase_mapa_objetivos" IS '-- DEPRECATED: objetivos legacy en evaluación 2026-09 (Owner: ACM)';
CREATE UNIQUE INDEX clase_mapa_objetivos_clase_id_level_id_orden_objetivo_key ON public.clase_mapa_objetivos USING btree (clase_id, level_id, orden_objetivo);
CREATE INDEX idx_clase_mapa_objetivos_estado_revision ON public.clase_mapa_objetivos USING btree (estado_revision);
CREATE INDEX idx_cmo_clase ON public.clase_mapa_objetivos USING btree (clase_id);
CREATE INDEX idx_cmo_level ON public.clase_mapa_objetivos USING btree (level_id);
CREATE INDEX idx_cmo_origen_node ON public.clase_mapa_objetivos USING btree (origen_node_id);
CREATE INDEX idx_cmo_origen_objetivo ON public.clase_mapa_objetivos USING btree (origen_objetivo_id);
CREATE POLICY "clase_mapa_objetivos_owner" ON public."clase_mapa_objetivos" FOR ALL TO authenticated USING ((es_admin() OR es_coordinador_acm() OR es_maestro_titular_de_clase(clase_id))) WITH CHECK ((es_admin() OR es_coordinador_acm() OR es_maestro_titular_de_clase(clase_id)));

-- ----------------------------------------------------------------------------
-- Tabla: public."clases"
-- ----------------------------------------------------------------------------
CREATE TABLE public."clases" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "nombre" text NOT NULL,
  "programa_id" uuid,
  "nivel_id" uuid,
  "maestro_principal_id" uuid,
  "maestro_suplente_id" uuid,
  "tipo_clase" text DEFAULT 'grupal'::text,
  "instrumento" text,
  "descripcion" text,
  "capacidad_maxima" integer,
  "activo" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "estado" character varying(50) DEFAULT 'activa'::character varying,
  "maestro_id" uuid,
  "plan_estudio" text,
  "modalidad" text DEFAULT 'presencial'::text,
  "salon" text,
  "route_version_id" uuid,
  "maestro_auxiliar_id" uuid,
  "ruta_id" uuid,
  "whatsapp_group_jid" text,
  "es_clase_iniciacion" boolean DEFAULT false NOT NULL,
  "necesita_revision" boolean DEFAULT false NOT NULL,
  "revision_motivo" text,
  CONSTRAINT "clases_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "clases_capacidad_maxima_check" CHECK (((capacidad_maxima IS NULL) OR (capacidad_maxima > 0))),
  CONSTRAINT "clases_maestros_diferentes_check" CHECK (((maestro_suplente_id IS NULL) OR (maestro_suplente_id <> maestro_principal_id))),
  CONSTRAINT "clases_modalidad_check" CHECK ((modalidad = ANY (ARRAY['presencial'::text, 'virtual'::text, 'hibrida'::text]))),
  CONSTRAINT "clases_tipo_clase_check" CHECK ((tipo_clase = ANY (ARRAY['individual'::text, 'grupal'::text, 'rotativa'::text, 'seccional'::text, 'orquesta'::text, 'coro'::text, 'teoria'::text, 'preparatoria'::text, 'otro'::text]))),
  CONSTRAINT "clases_maestro_auxiliar_id_fkey" FOREIGN KEY (maestro_auxiliar_id) REFERENCES maestros(id) ON DELETE SET NULL,
  CONSTRAINT "clases_route_version_id_fkey" FOREIGN KEY (route_version_id) REFERENCES route_versions(id),
  CONSTRAINT "clases_ruta_id_fkey" FOREIGN KEY (ruta_id) REFERENCES rutas_contenido(id) ON DELETE SET NULL,
  CONSTRAINT "fk_clases_maestro_principal" FOREIGN KEY (maestro_principal_id) REFERENCES maestros(id) ON DELETE RESTRICT,
  CONSTRAINT "fk_clases_maestro_suplente" FOREIGN KEY (maestro_suplente_id) REFERENCES maestros(id) ON DELETE SET NULL,
  CONSTRAINT "fk_clases_nivel" FOREIGN KEY (nivel_id) REFERENCES niveles(id) ON DELETE SET NULL,
  CONSTRAINT "fk_clases_programa" FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE RESTRICT
);

ALTER TABLE public."clases" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_clases_activo ON public.clases USING btree (activo);
CREATE INDEX idx_clases_maestro ON public.clases USING btree (maestro_principal_id);
CREATE INDEX idx_clases_maestro_auxiliar_id ON public.clases USING btree (maestro_auxiliar_id);
CREATE INDEX idx_clases_nivel ON public.clases USING btree (nivel_id);
CREATE INDEX idx_clases_programa ON public.clases USING btree (programa_id);
CREATE INDEX idx_clases_ruta_id ON public.clases USING btree (ruta_id);
CREATE POLICY "Maestros ven sus clases" ON public."clases" FOR SELECT TO authenticated USING (((maestro_principal_id = maestro_actual()) OR (maestro_suplente_id = maestro_actual())));
CREATE POLICY "Permitir actualizar clases" ON public."clases" FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir crear clases" ON public."clases" FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir eliminar clases" ON public."clases" FOR DELETE USING (true);
CREATE POLICY "Permitir leer todas las clases" ON public."clases" FOR SELECT USING (true);
CREATE POLICY "clases_admin_read" ON public."clases" FOR SELECT USING (es_admin());

-- ----------------------------------------------------------------------------
-- Tabla: public."clases_emergentes"
-- ----------------------------------------------------------------------------
CREATE TABLE public."clases_emergentes" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "maestro_id" uuid NOT NULL,
  "fecha" date NOT NULL,
  "hora_inicio" time without time zone,
  "hora_fin" time without time zone,
  "clase_id" uuid,
  "nombre_clase" text,
  "motivo" text,
  "contenido" text,
  "observaciones" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "salon" text,
  "grupo" text,
  "instrumento" text,
  "tipo" text DEFAULT 'refuerzo'::text,
  "estado" text DEFAULT 'pendiente'::text,
  CONSTRAINT "clases_emergentes_pkey" PRIMARY KEY ("id")
);

ALTER TABLE public."clases_emergentes" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_clases_emergentes_maestro_fecha ON public.clases_emergentes USING btree (maestro_id, fecha);
CREATE POLICY "clases_emergentes_admin_read" ON public."clases_emergentes" FOR SELECT USING (es_admin());
CREATE POLICY "clases_emergentes_delete" ON public."clases_emergentes" FOR DELETE TO authenticated USING ((maestro_id = maestro_actual()));
CREATE POLICY "clases_emergentes_insert" ON public."clases_emergentes" FOR INSERT TO authenticated WITH CHECK ((maestro_id = maestro_actual()));
CREATE POLICY "clases_emergentes_select" ON public."clases_emergentes" FOR SELECT TO authenticated USING (((maestro_id = maestro_actual()) OR maestro_en_clase(clase_id)));
CREATE POLICY "clases_emergentes_update" ON public."clases_emergentes" FOR UPDATE TO authenticated USING ((maestro_id = maestro_actual())) WITH CHECK ((maestro_id = maestro_actual()));

-- ----------------------------------------------------------------------------
-- Tabla: public."class_event_methodology"
-- ----------------------------------------------------------------------------
CREATE TABLE public."class_event_methodology" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "class_event_id" uuid NOT NULL,
  "warmup" text,
  "sound_focus" text,
  "intonation_focus" text,
  "main_node_id" uuid,
  "technical_focus" text,
  "study_used" text,
  "repertoire_used" text,
  "sight_reading_work" text,
  "ear_training_work" text,
  "closing_observation" text,
  "homework_text" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "class_event_methodology_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "class_event_methodology_class_event_id_fkey" FOREIGN KEY (class_event_id) REFERENCES class_events(id) ON DELETE CASCADE,
  CONSTRAINT "class_event_methodology_main_node_id_fkey" FOREIGN KEY (main_node_id) REFERENCES nodes(id) ON DELETE SET NULL
);

ALTER TABLE public."class_event_methodology" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."class_event_methodology" IS 'Structured methodology notes for a class event (warmup, focus areas, repertoire, etc).';
CREATE UNIQUE INDEX idx_methodology_event ON public.class_event_methodology USING btree (class_event_id);
CREATE POLICY "cem_delete_all" ON public."class_event_methodology" FOR DELETE USING (true);
CREATE POLICY "cem_insert_all" ON public."class_event_methodology" FOR INSERT WITH CHECK (true);
CREATE POLICY "cem_select_all" ON public."class_event_methodology" FOR SELECT USING (true);
CREATE POLICY "cem_update_all" ON public."class_event_methodology" FOR UPDATE USING (true);
CREATE POLICY "class_event_methodology_admin_read" ON public."class_event_methodology" FOR SELECT USING (es_admin());

-- ----------------------------------------------------------------------------
-- Tabla: public."class_events"
-- ----------------------------------------------------------------------------
CREATE TABLE public."class_events" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "teacher_id" uuid NOT NULL,
  "student_id" uuid NOT NULL,
  "academic_plan_id" uuid,
  "session_id" uuid,
  "level_id" uuid,
  "event_date" date DEFAULT CURRENT_DATE NOT NULL,
  "status" text DEFAULT 'draft'::text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "class_events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "class_events_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'completed'::text, 'cancelled'::text]))),
  CONSTRAINT "class_events_academic_plan_id_fkey" FOREIGN KEY (academic_plan_id) REFERENCES academic_plans(id) ON DELETE SET NULL,
  CONSTRAINT "class_events_level_id_fkey" FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE SET NULL,
  CONSTRAINT "class_events_session_id_fkey" FOREIGN KEY (session_id) REFERENCES sesiones_clase(id) ON DELETE SET NULL,
  CONSTRAINT "class_events_student_id_fkey" FOREIGN KEY (student_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  CONSTRAINT "class_events_teacher_id_fkey" FOREIGN KEY (teacher_id) REFERENCES maestros(id) ON DELETE CASCADE
);

ALTER TABLE public."class_events" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."class_events" IS 'Explicit class event record per session+student, linking academic plan, level, and methodology.';
CREATE INDEX idx_class_events_date ON public.class_events USING btree (event_date);
CREATE INDEX idx_class_events_session ON public.class_events USING btree (session_id);
CREATE UNIQUE INDEX idx_class_events_session_student ON public.class_events USING btree (session_id, student_id);
CREATE INDEX idx_class_events_student ON public.class_events USING btree (student_id);
CREATE INDEX idx_class_events_teacher ON public.class_events USING btree (teacher_id);
CREATE POLICY "ce_delete_all" ON public."class_events" FOR DELETE USING (true);
CREATE POLICY "ce_insert_all" ON public."class_events" FOR INSERT WITH CHECK (true);
CREATE POLICY "ce_select_all" ON public."class_events" FOR SELECT USING (true);
CREATE POLICY "ce_update_all" ON public."class_events" FOR UPDATE USING (true);
CREATE POLICY "class_events_admin_read" ON public."class_events" FOR SELECT USING (es_admin());

-- ----------------------------------------------------------------------------
-- Tabla: public."class_session_content_snapshots"
-- ----------------------------------------------------------------------------
CREATE TABLE public."class_session_content_snapshots" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid NOT NULL,
  "node_id" uuid,
  "indicator_id" uuid,
  "node_name" text,
  "indicator_description" text,
  "is_critical" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "class_session_content_snapshots_pkey" PRIMARY KEY ("id")
);

ALTER TABLE public."class_session_content_snapshots" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_content_snapshots_session ON public.class_session_content_snapshots USING btree (session_id);
CREATE POLICY "Authenticated can insert content snapshots" ON public."class_session_content_snapshots" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can read content snapshots" ON public."class_session_content_snapshots" FOR SELECT TO authenticated USING (true);
CREATE POLICY "class_session_content_snapshots_admin_read" ON public."class_session_content_snapshots" FOR SELECT USING (es_admin());

-- ----------------------------------------------------------------------------
-- Tabla: public."cobertura_alumno_objetivo"
-- ----------------------------------------------------------------------------
CREATE TABLE public."cobertura_alumno_objetivo" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "alumno_id" uuid,
  "objetivo_id" uuid,
  "plan_id" uuid,
  "maestro_id" uuid,
  "fecha" date DEFAULT CURRENT_DATE NOT NULL,
  "confirmado" boolean DEFAULT false,
  "nivel" text DEFAULT 'en_proceso'::text,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "cobertura_alumno_objetivo_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "cobertura_alumno_objetivo_alumno_id_objetivo_id_key" UNIQUE (alumno_id, objetivo_id),
  CONSTRAINT "cobertura_alumno_objetivo_alumno_id_fkey" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  CONSTRAINT "cobertura_alumno_objetivo_maestro_id_fkey" FOREIGN KEY (maestro_id) REFERENCES maestros(id),
  CONSTRAINT "cobertura_alumno_objetivo_objetivo_id_fkey" FOREIGN KEY (objetivo_id) REFERENCES curriculo_objetivos(id) ON DELETE CASCADE,
  CONSTRAINT "cobertura_alumno_objetivo_plan_id_fkey" FOREIGN KEY (plan_id) REFERENCES planificaciones(id) ON DELETE SET NULL
);

ALTER TABLE public."cobertura_alumno_objetivo" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX cobertura_alumno_objetivo_alumno_id_objetivo_id_key ON public.cobertura_alumno_objetivo USING btree (alumno_id, objetivo_id);
CREATE POLICY "cobertura_insert" ON public."cobertura_alumno_objetivo" FOR INSERT TO authenticated WITH CHECK ((maestro_id = maestro_actual()));
CREATE POLICY "cobertura_select_maestro" ON public."cobertura_alumno_objetivo" FOR SELECT TO authenticated USING (((maestro_id = maestro_actual()) OR es_admin()));
CREATE POLICY "cobertura_update" ON public."cobertura_alumno_objetivo" FOR UPDATE TO authenticated USING ((maestro_id = maestro_actual()));

-- ----------------------------------------------------------------------------
-- Tabla: public."comodatos_activos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."comodatos_activos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "activo_id" uuid NOT NULL,
  "alumno_id" uuid NOT NULL,
  "fecha_entrega" date DEFAULT CURRENT_DATE NOT NULL,
  "fecha_devolucion" date,
  "estado" character varying(50) DEFAULT 'activo'::character varying NOT NULL,
  "contrato_firmado_url" character varying(255),
  "observaciones" text,
  "registrado_por" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "fecha_vencimiento" date,
  "tipo_comodato" character varying(50),
  "instrumento_propio_id" uuid,
  "renovado_de_id" uuid,
  "intercambiado_con_id" uuid,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "comodatos_activos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "comodatos_activos_estado_check" CHECK (((estado)::text = ANY ((ARRAY['activo'::character varying, 'devuelto'::character varying, 'renovado'::character varying])::text[]))),
  CONSTRAINT "comodatos_activos_tipo_comodato_check" CHECK (((tipo_comodato)::text = ANY ((ARRAY['escolar'::character varying, 'anual'::character varying, 'eventual'::character varying])::text[]))),
  CONSTRAINT "comodatos_activos_activo_id_fkey" FOREIGN KEY (activo_id) REFERENCES inventario_activos(id) ON DELETE RESTRICT,
  CONSTRAINT "comodatos_activos_alumno_id_fkey" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE RESTRICT,
  CONSTRAINT "comodatos_activos_instrumento_propio_id_fkey" FOREIGN KEY (instrumento_propio_id) REFERENCES inventario_activos(id) ON DELETE SET NULL,
  CONSTRAINT "comodatos_activos_intercambiado_con_id_fkey" FOREIGN KEY (intercambiado_con_id) REFERENCES comodatos_activos(id) ON DELETE SET NULL,
  CONSTRAINT "comodatos_activos_registrado_por_fkey" FOREIGN KEY (registrado_por) REFERENCES auth.users(id),
  CONSTRAINT "comodatos_activos_renovado_de_id_fkey" FOREIGN KEY (renovado_de_id) REFERENCES comodatos_activos(id) ON DELETE SET NULL
);

ALTER TABLE public."comodatos_activos" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."comodatos_activos"."fecha_vencimiento" IS 'Fecha de vencimiento del comodato';
COMMENT ON COLUMN public."comodatos_activos"."instrumento_propio_id" IS 'Instrumento propio del alumno (intercambio)';
COMMENT ON COLUMN public."comodatos_activos"."intercambiado_con_id" IS 'Referencia al comodato con que se intercambió';
COMMENT ON COLUMN public."comodatos_activos"."renovado_de_id" IS 'Referencia al comodato anterior que se renovó';
COMMENT ON COLUMN public."comodatos_activos"."tipo_comodato" IS 'Tipo: escolar (ciclo), anual, eventual (evento específico)';
COMMENT ON TABLE public."comodatos_activos" IS 'Préstamos de instrumentos. El trigger trg_comodato_sync_estado_uso sincroniza inventario_activos.estado_uso.';
CREATE INDEX idx_comodatos_alumno ON public.comodatos_activos USING btree (alumno_id, estado);
CREATE INDEX idx_comodatos_tipo ON public.comodatos_activos USING btree (tipo_comodato) WHERE ((estado)::text = 'activo'::text);
CREATE INDEX idx_comodatos_vencimiento ON public.comodatos_activos USING btree (fecha_vencimiento) WHERE ((estado)::text = 'activo'::text);
CREATE UNIQUE INDEX uix_comodato_activo_por_instrumento ON public.comodatos_activos USING btree (activo_id) WHERE ((estado)::text = 'activo'::text);
CREATE POLICY "comodatos_admin_insert" ON public."comodatos_activos" FOR INSERT TO authenticated WITH CHECK (es_admin());
CREATE POLICY "comodatos_admin_update" ON public."comodatos_activos" FOR UPDATE TO authenticated USING (es_admin());
CREATE POLICY "comodatos_authenticated_select" ON public."comodatos_activos" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."compromisos_pago"
-- ----------------------------------------------------------------------------
CREATE TABLE public."compromisos_pago" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "familia_id" uuid NOT NULL,
  "representante_id" uuid NOT NULL,
  "monto_comprometido_centavos" bigint NOT NULL,
  "fecha_comprometida" date NOT NULL,
  "cumplido" boolean DEFAULT false,
  "fecha_cumplimiento" date,
  "origen_notificacion_id" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "compromisos_pago_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "chk_compromisos_monto_positivo" CHECK ((monto_comprometido_centavos > 0)),
  CONSTRAINT "compromisos_pago_familia_id_fkey" FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT,
  CONSTRAINT "compromisos_pago_representante_id_fkey" FOREIGN KEY (representante_id) REFERENCES representantes(id) ON DELETE RESTRICT
);

ALTER TABLE public."compromisos_pago" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "compromisos_all_admin" ON public."compromisos_pago" FOR ALL USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
CREATE POLICY "compromisos_select_cajero_admin" ON public."compromisos_pago" FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));

-- ----------------------------------------------------------------------------
-- Tabla: public."comunicaciones_seguimiento"
-- ----------------------------------------------------------------------------
CREATE TABLE public."comunicaciones_seguimiento" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "alumno_id" uuid,
  "contacto_nombre" text,
  "contacto_telefono" text,
  "contacto_email" text,
  "canal" text DEFAULT 'llamada'::text NOT NULL,
  "fecha" timestamp with time zone DEFAULT now() NOT NULL,
  "resultado" text DEFAULT 'contactado'::text NOT NULL,
  "notas" text,
  "requiere_seguimiento" boolean DEFAULT false NOT NULL,
  "proxima_accion" text,
  "proxima_fecha" date,
  "estado" text DEFAULT 'abierto'::text NOT NULL,
  "responsable_id" uuid DEFAULT auth.uid(),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "nivel" smallint,
  "origen" text DEFAULT 'manual'::text NOT NULL,
  CONSTRAINT "comunicaciones_seguimiento_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "comunicaciones_seguimiento_canal_check" CHECK ((canal = ANY (ARRAY['llamada'::text, 'whatsapp'::text, 'correo'::text, 'reunion'::text, 'otro'::text]))),
  CONSTRAINT "comunicaciones_seguimiento_estado_check" CHECK ((estado = ANY (ARRAY['abierto'::text, 'cerrado'::text]))),
  CONSTRAINT "comunicaciones_seguimiento_origen_chk" CHECK ((origen = ANY (ARRAY['manual'::text, 'ausentismo'::text, 'hermes'::text, 'otro'::text]))),
  CONSTRAINT "comunicaciones_seguimiento_resultado_check" CHECK ((resultado = ANY (ARRAY['contactado'::text, 'buzon_no_contesto'::text, 'reagendar'::text, 'sin_interes'::text, 'resuelto'::text]))),
  CONSTRAINT "comunicaciones_seguimiento_alumno_id_fkey" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL,
  CONSTRAINT "comunicaciones_seguimiento_responsable_id_fkey" FOREIGN KEY (responsable_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public."comunicaciones_seguimiento" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."comunicaciones_seguimiento"."nivel" IS 'Nivel de escalamiento (1-3) cuando origen = ausentismo.';
COMMENT ON COLUMN public."comunicaciones_seguimiento"."origen" IS 'Origen del contacto: manual | ausentismo | hermes | otro.';
COMMENT ON TABLE public."comunicaciones_seguimiento" IS 'Portal COM: registro de interacciones (llamadas/whatsapp/correo/reunion) con motor de proxima-accion (follow-up). Estandar CRM Activity model.';
CREATE INDEX idx_com_seg_alumno ON public.comunicaciones_seguimiento USING btree (alumno_id);
CREATE INDEX idx_com_seg_estado ON public.comunicaciones_seguimiento USING btree (estado);
CREATE INDEX idx_com_seg_proxima_fecha ON public.comunicaciones_seguimiento USING btree (proxima_fecha) WHERE ((estado = 'abierto'::text) AND (requiere_seguimiento = true));
CREATE POLICY "com_seg_delete_authenticated" ON public."comunicaciones_seguimiento" FOR DELETE TO authenticated USING (true);
CREATE POLICY "com_seg_insert_authenticated" ON public."comunicaciones_seguimiento" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "com_seg_select_authenticated" ON public."comunicaciones_seguimiento" FOR SELECT TO authenticated USING (true);
CREATE POLICY "com_seg_update_authenticated" ON public."comunicaciones_seguimiento" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."configuracion_aranceles"
-- ----------------------------------------------------------------------------
CREATE TABLE public."configuracion_aranceles" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "concepto" text NOT NULL,
  "monto_centavos" bigint NOT NULL,
  "moneda" text DEFAULT 'DOP'::text NOT NULL,
  "descripcion" text,
  "activo" boolean DEFAULT true NOT NULL,
  "fecha_vigencia_desde" date DEFAULT CURRENT_DATE NOT NULL,
  "fecha_vigencia_hasta" date,
  "modificado_por" uuid,
  "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT "configuracion_aranceles_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "configuracion_aranceles_monto_centavos_check" CHECK ((monto_centavos > 0)),
  CONSTRAINT "configuracion_aranceles_modificado_por_fkey" FOREIGN KEY (modificado_por) REFERENCES auth.users(id)
);

ALTER TABLE public."configuracion_aranceles" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX uq_arancel_concepto_activo ON public.configuracion_aranceles USING btree (concepto) WHERE (activo = true);
CREATE POLICY "configuracion_aranceles_modify_authorized" ON public."configuracion_aranceles" FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.rol = ANY (ARRAY['admin'::text, 'finanzas'::text, 'director'::text])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.rol = ANY (ARRAY['admin'::text, 'finanzas'::text, 'director'::text]))))));
CREATE POLICY "configuracion_aranceles_read_all" ON public."configuracion_aranceles" FOR SELECT TO anon,authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."configuracion_recordatorios"
-- ----------------------------------------------------------------------------
CREATE TABLE public."configuracion_recordatorios" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "profile_id" uuid NOT NULL,
  "recordatorios_activos" boolean DEFAULT true,
  "push_activo" boolean DEFAULT false,
  "email_activo" boolean DEFAULT false,
  "hora_resumen_diario" time without time zone DEFAULT '18:00:00'::time without time zone,
  "dia_resumen_semanal" integer DEFAULT 5,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "min_antes_clase" integer DEFAULT 15,
  "min_post_clase_sin_registro" integer DEFAULT 60,
  "horas_recordatorio_dia1" integer DEFAULT 24,
  "horas_recordatorio_dia2" integer DEFAULT 48,
  "alerta_pre_clase" boolean DEFAULT true,
  "alerta_post_clase" boolean DEFAULT true,
  "alerta_24h" boolean DEFAULT true,
  "alerta_48h" boolean DEFAULT true,
  CONSTRAINT "configuracion_recordatorios_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "configuracion_recordatorios_dia_resumen_semanal_check" CHECK (((dia_resumen_semanal >= 1) AND (dia_resumen_semanal <= 7))),
  CONSTRAINT "configuracion_recordatorios_profile_id_key" UNIQUE (profile_id),
  CONSTRAINT "fk_configuracion_recordatorios_profile" FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

ALTER TABLE public."configuracion_recordatorios" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."configuracion_recordatorios"."alerta_24h" IS 'Activar recordatorio a las 24h sin registrar';
COMMENT ON COLUMN public."configuracion_recordatorios"."alerta_48h" IS 'Activar recordatorio a las 48h sin registrar';
COMMENT ON COLUMN public."configuracion_recordatorios"."alerta_post_clase" IS 'Activar alerta cuando termina clase sin registrar';
COMMENT ON COLUMN public."configuracion_recordatorios"."alerta_pre_clase" IS 'Activar alerta antes de que empiece la clase';
COMMENT ON COLUMN public."configuracion_recordatorios"."horas_recordatorio_dia1" IS 'Horas después de clase sin registrar - primer recordatorio (default 24)';
COMMENT ON COLUMN public."configuracion_recordatorios"."horas_recordatorio_dia2" IS 'Horas después de clase sin registrar - segundo recordatorio (default 48)';
COMMENT ON COLUMN public."configuracion_recordatorios"."min_antes_clase" IS 'Minutos antes del inicio de clase para enviar alerta (default 15)';
COMMENT ON COLUMN public."configuracion_recordatorios"."min_post_clase_sin_registro" IS 'Minutos después de terminar clase sin registrar para alertar (default 60)';
CREATE UNIQUE INDEX configuracion_recordatorios_profile_id_key ON public.configuracion_recordatorios USING btree (profile_id);
CREATE POLICY "configuracion_recordatorios_admin_read" ON public."configuracion_recordatorios" FOR SELECT USING (es_admin());
CREATE POLICY "configuracion_recordatorios_authenticated_all" ON public."configuracion_recordatorios" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."contactos_alianzas"
-- ----------------------------------------------------------------------------
CREATE TABLE public."contactos_alianzas" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "nombre_institucion" text NOT NULL,
  "website" text,
  "email_contacto" text,
  "persona_contacto" text,
  "area_enfoque" text,
  "programa_relevante" text,
  "enfoque_geografico" text,
  "puntuacion_match" integer,
  "notas" text,
  "estado" text DEFAULT 'prospecto'::text NOT NULL,
  "fecha_primer_contacto" timestamp with time zone,
  "fecha_ultima_respuesta" timestamp with time zone,
  "email_enviado" boolean DEFAULT false,
  "email_draft_id" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "tipo" text DEFAULT 'fundacion'::text,
  CONSTRAINT "contactos_alianzas_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "contactos_alianzas_estado_check" CHECK ((estado = ANY (ARRAY['prospecto'::text, 'contactado'::text, 'respondio'::text, 'en_negociacion'::text, 'convenio_activo'::text, 'descartado'::text]))),
  CONSTRAINT "contactos_alianzas_puntuacion_match_check" CHECK (((puntuacion_match >= 1) AND (puntuacion_match <= 5))),
  CONSTRAINT "contactos_alianzas_tipo_check" CHECK ((tipo = ANY (ARRAY['fundacion'::text, 'artista'::text, 'aliado_local'::text, 'gobierno'::text, 'red'::text])))
);

ALTER TABLE public."contactos_alianzas" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_contactos_alianzas_created ON public.contactos_alianzas USING btree (created_at DESC);
CREATE INDEX idx_contactos_alianzas_estado ON public.contactos_alianzas USING btree (estado);
CREATE INDEX idx_contactos_alianzas_match ON public.contactos_alianzas USING btree (puntuacion_match DESC);
CREATE POLICY "contactos_alianzas_autenticados" ON public."contactos_alianzas" FOR ALL USING ((auth.role() = 'authenticated'::text));

-- ----------------------------------------------------------------------------
-- Tabla: public."contenidos_sesion"
-- ----------------------------------------------------------------------------
CREATE TABLE public."contenidos_sesion" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "sesion_clase_id" uuid NOT NULL,
  "planificacion_id" uuid,
  "modulo_id" uuid,
  "unidad_id" uuid,
  "ejercicio_id" uuid,
  "descripcion" text,
  "nivel_logro" text,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "contenidos_sesion_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "contenidos_sesion_nivel_logro_check" CHECK (((nivel_logro IS NULL) OR (nivel_logro = ANY (ARRAY['introducido'::text, 'practicado'::text, 'reforzado'::text, 'evaluado'::text, 'dominado'::text])))),
  CONSTRAINT "fk_contenidos_sesion_ejercicio" FOREIGN KEY (ejercicio_id) REFERENCES ejercicios(id) ON DELETE SET NULL,
  CONSTRAINT "fk_contenidos_sesion_modulo" FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE SET NULL,
  CONSTRAINT "fk_contenidos_sesion_planificacion" FOREIGN KEY (planificacion_id) REFERENCES planificaciones(id) ON DELETE SET NULL,
  CONSTRAINT "fk_contenidos_sesion_sesion" FOREIGN KEY (sesion_clase_id) REFERENCES sesiones_clase(id) ON DELETE CASCADE,
  CONSTRAINT "fk_contenidos_sesion_unidad" FOREIGN KEY (unidad_id) REFERENCES unidades(id) ON DELETE SET NULL
);

ALTER TABLE public."contenidos_sesion" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_contenidos_sesion_sesion ON public.contenidos_sesion USING btree (sesion_clase_id);
CREATE POLICY "Maestros gestionan contenidos de sus sesiones" ON public."contenidos_sesion" FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM sesiones_clase s
  WHERE ((s.id = contenidos_sesion.sesion_clase_id) AND ((s.maestro_id = maestro_actual()) OR maestro_en_clase(s.clase_id))))));
CREATE POLICY "contenidos_admin_all" ON public."contenidos_sesion" FOR ALL USING (es_admin());
CREATE POLICY "contenidos_sesion_admin_insert" ON public."contenidos_sesion" FOR INSERT TO authenticated WITH CHECK (es_admin());
CREATE POLICY "contenidos_sesion_admin_select" ON public."contenidos_sesion" FOR SELECT TO authenticated USING (es_admin());
CREATE POLICY "contenidos_sesion_admin_update" ON public."contenidos_sesion" FOR UPDATE TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "contenidos_sesion_authenticated_all" ON public."contenidos_sesion" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "contenidos_sesion_superadmin_delete" ON public."contenidos_sesion" FOR DELETE TO authenticated USING ((( SELECT is_super_admin() AS is_super_admin) = true));

-- ----------------------------------------------------------------------------
-- Tabla: public."conversaciones_whatsapp"
-- ----------------------------------------------------------------------------
CREATE TABLE public."conversaciones_whatsapp" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "postulante_id" uuid NOT NULL,
  "estado_conversacion" text DEFAULT 'esperando_respuesta_campania'::text NOT NULL,
  "reintentos" integer DEFAULT 0,
  "jid" text NOT NULL,
  "ultimo_mensaje_enviado" text,
  "ultimo_mensaje_recibido" text,
  "ultima_intencion" text,
  "fecha_cita_propuesta" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "conversaciones_whatsapp_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "unique_postulante_conversacion" UNIQUE (postulante_id),
  CONSTRAINT "conversaciones_whatsapp_postulante_id_fkey" FOREIGN KEY (postulante_id) REFERENCES postulantes(id) ON DELETE CASCADE
);

ALTER TABLE public."conversaciones_whatsapp" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_conversaciones_estado ON public.conversaciones_whatsapp USING btree (estado_conversacion);
CREATE UNIQUE INDEX unique_postulante_conversacion ON public.conversaciones_whatsapp USING btree (postulante_id);
CREATE POLICY "allow_all_conversaciones" ON public."conversaciones_whatsapp" FOR ALL USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."cuotas"
-- ----------------------------------------------------------------------------
CREATE TABLE public."cuotas" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "familia_id" uuid NOT NULL,
  "alumno_id" uuid,
  "concepto" text NOT NULL,
  "monto_base_centavos" bigint NOT NULL,
  "monto_final_centavos" bigint NOT NULL,
  "descuento_centavos" bigint DEFAULT 0,
  "fecha_generacion" date NOT NULL,
  "fecha_vencimiento" date NOT NULL,
  "estado" cuota_estado DEFAULT 'pendiente'::cuota_estado NOT NULL,
  "ciclo_mes" integer NOT NULL,
  "ciclo_anio" integer NOT NULL,
  "metadatos" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "monto_pagado_centavos" bigint DEFAULT 0 NOT NULL,
  CONSTRAINT "cuotas_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "chk_cuotas_monto_pagado" CHECK (((monto_pagado_centavos >= 0) AND (monto_pagado_centavos <= monto_final_centavos))),
  CONSTRAINT "chk_cuotas_montos_no_negativos" CHECK (((monto_base_centavos >= 0) AND (monto_final_centavos >= 0) AND (descuento_centavos >= 0))),
  CONSTRAINT "cuotas_ciclo_mes_check" CHECK (((ciclo_mes >= 1) AND (ciclo_mes <= 12))),
  CONSTRAINT "cuotas_familia_id_alumno_id_ciclo_anio_ciclo_mes_concepto_key" UNIQUE (familia_id, alumno_id, ciclo_anio, ciclo_mes, concepto),
  CONSTRAINT "cuotas_alumno_id_fkey" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE RESTRICT,
  CONSTRAINT "cuotas_familia_id_fkey" FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT
);

ALTER TABLE public."cuotas" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX cuotas_familia_id_alumno_id_ciclo_anio_ciclo_mes_concepto_key ON public.cuotas USING btree (familia_id, alumno_id, ciclo_anio, ciclo_mes, concepto);
CREATE INDEX idx_cuotas_estado ON public.cuotas USING btree (estado);
CREATE INDEX idx_cuotas_familia_ciclo ON public.cuotas USING btree (familia_id, ciclo_anio, ciclo_mes);
CREATE INDEX idx_cuotas_vencimiento ON public.cuotas USING btree (fecha_vencimiento) WHERE (estado = ANY (ARRAY['pendiente'::cuota_estado, 'vencida'::cuota_estado, 'en_mora'::cuota_estado]));
CREATE POLICY "cuotas_insert_cajero_admin" ON public."cuotas" FOR INSERT WITH CHECK ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
CREATE POLICY "cuotas_select_cajero_admin" ON public."cuotas" FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
CREATE POLICY "cuotas_select_representante" ON public."cuotas" FOR SELECT USING (((get_user_role() = 'representante'::text) AND (familia_id = get_user_familia_id())));
CREATE POLICY "cuotas_update_admin" ON public."cuotas" FOR UPDATE USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));

-- ----------------------------------------------------------------------------
-- Tabla: public."curriculo_objetivos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."curriculo_objetivos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "pilar_id" uuid,
  "descripcion" text NOT NULL,
  "orden" integer DEFAULT 0 NOT NULL,
  CONSTRAINT "curriculo_objetivos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "curriculo_objetivos_pilar_id_fkey" FOREIGN KEY (pilar_id) REFERENCES curriculo_pilares(id) ON DELETE CASCADE
);

ALTER TABLE public."curriculo_objetivos" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "objetivos_delete" ON public."curriculo_objetivos" FOR DELETE TO authenticated USING (es_admin());
CREATE POLICY "objetivos_insert" ON public."curriculo_objetivos" FOR INSERT TO authenticated WITH CHECK (es_admin());
CREATE POLICY "objetivos_select" ON public."curriculo_objetivos" FOR SELECT TO authenticated USING (true);
CREATE POLICY "objetivos_update" ON public."curriculo_objetivos" FOR UPDATE TO authenticated USING (es_admin());

-- ----------------------------------------------------------------------------
-- Tabla: public."curriculo_pilares"
-- ----------------------------------------------------------------------------
CREATE TABLE public."curriculo_pilares" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "curriculo_id" uuid,
  "nombre" text NOT NULL,
  "orden" integer DEFAULT 0 NOT NULL,
  CONSTRAINT "curriculo_pilares_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "curriculo_pilares_curriculo_id_fkey" FOREIGN KEY (curriculo_id) REFERENCES curriculos(id) ON DELETE CASCADE
);

ALTER TABLE public."curriculo_pilares" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pilares_delete" ON public."curriculo_pilares" FOR DELETE TO authenticated USING (es_admin());
CREATE POLICY "pilares_insert" ON public."curriculo_pilares" FOR INSERT TO authenticated WITH CHECK (es_admin());
CREATE POLICY "pilares_select" ON public."curriculo_pilares" FOR SELECT TO authenticated USING (true);
CREATE POLICY "pilares_update" ON public."curriculo_pilares" FOR UPDATE TO authenticated USING (es_admin());

-- ----------------------------------------------------------------------------
-- Tabla: public."curriculos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."curriculos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "instrumento" text NOT NULL,
  "nivel" text NOT NULL,
  "descripcion" text,
  "activo" boolean DEFAULT true,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "curriculos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "curriculos_instrumento_nivel_key" UNIQUE (instrumento, nivel),
  CONSTRAINT "curriculos_created_by_fkey" FOREIGN KEY (created_by) REFERENCES maestros(id)
);

ALTER TABLE public."curriculos" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX curriculos_instrumento_nivel_key ON public.curriculos USING btree (instrumento, nivel);
CREATE POLICY "curriculos_delete" ON public."curriculos" FOR DELETE TO authenticated USING (es_admin());
CREATE POLICY "curriculos_insert" ON public."curriculos" FOR INSERT TO authenticated WITH CHECK (es_admin());
CREATE POLICY "curriculos_select" ON public."curriculos" FOR SELECT TO authenticated USING (true);
CREATE POLICY "curriculos_update" ON public."curriculos" FOR UPDATE TO authenticated USING (es_admin());

-- ----------------------------------------------------------------------------
-- Tabla: public."departamentos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."departamentos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "nombre" text NOT NULL,
  "codigo" text,
  "descripcion" text,
  "jefe_id" uuid,
  "activo" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "email" text,
  "responsable_nombre" text,
  "responsable_email" text,
  CONSTRAINT "departamentos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "departamentos_nombre_key" UNIQUE (nombre),
  CONSTRAINT "departamentos_jefe_id_fkey" FOREIGN KEY (jefe_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public."departamentos" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX departamentos_nombre_key ON public.departamentos USING btree (nombre);
CREATE UNIQUE INDEX ux_departamentos_codigo ON public.departamentos USING btree (upper(codigo));
CREATE POLICY "departamentos_authenticated_all" ON public."departamentos" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."document_batches"
-- ----------------------------------------------------------------------------
CREATE TABLE public."document_batches" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "tipo" text NOT NULL,
  "titulo" text NOT NULL,
  "grupo_tipo" text,
  "grupo_id" uuid,
  "grupo_nombre" text,
  "actividad_nombre" text,
  "fecha_actividad" date,
  "lugar_actividad" text,
  "total_alumnos" integer DEFAULT 0,
  "total_generados" integer DEFAULT 0,
  "total_con_advertencias" integer DEFAULT 0,
  "total_excluidos" integer DEFAULT 0,
  "estado" text DEFAULT 'borrador'::text NOT NULL,
  "generado_por" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  "generated_at" timestamp with time zone,
  CONSTRAINT "document_batches_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "document_batches_estado_check" CHECK ((estado = ANY (ARRAY['borrador'::text, 'generado'::text, 'archivado'::text, 'anulado'::text])))
);

ALTER TABLE public."document_batches" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."document_batches" IS '-- DEPRECATED: generador documental institucional diferido 2026-09 (Owner: DIR/ADM)';
CREATE POLICY "rls_document_batches_all" ON public."document_batches" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."document_templates"
-- ----------------------------------------------------------------------------
CREATE TABLE public."document_templates" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "nombre" text NOT NULL,
  "tipo" text NOT NULL,
  "descripcion" text,
  "contenido" text NOT NULL,
  "variables" ARRAY DEFAULT '{}'::text[],
  "estado" text DEFAULT 'activa'::text NOT NULL,
  "version" integer DEFAULT 1 NOT NULL,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "document_templates_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "document_templates_estado_check" CHECK ((estado = ANY (ARRAY['activa'::text, 'inactiva'::text, 'archivada'::text])))
);

ALTER TABLE public."document_templates" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rls_document_templates_all" ON public."document_templates" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."ejercicios"
-- ----------------------------------------------------------------------------
CREATE TABLE public."ejercicios" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "unidad_id" uuid NOT NULL,
  "nombre" text NOT NULL,
  "descripcion" text,
  "tipo_ejercicio" text NOT NULL,
  "dificultad" integer DEFAULT 1,
  "instrucciones" text,
  "criterios_evaluacion" jsonb DEFAULT '{}'::jsonb,
  "contenido" jsonb DEFAULT '{}'::jsonb,
  "puntaje_maximo" numeric DEFAULT 10,
  "puntaje_aprobacion" numeric DEFAULT 7,
  "requiere_evidencia" boolean DEFAULT false,
  "puntos_xp" integer DEFAULT 10,
  "orden" integer NOT NULL,
  "activo" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "ejercicios_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ejercicios_dificultad_check" CHECK (((dificultad >= 1) AND (dificultad <= 10))),
  CONSTRAINT "ejercicios_orden_check" CHECK ((orden > 0)),
  CONSTRAINT "ejercicios_puntaje_aprobacion_check" CHECK ((puntaje_aprobacion >= (0)::numeric)),
  CONSTRAINT "ejercicios_puntaje_check" CHECK ((puntaje_aprobacion <= puntaje_maximo)),
  CONSTRAINT "ejercicios_puntaje_maximo_check" CHECK ((puntaje_maximo > (0)::numeric)),
  CONSTRAINT "ejercicios_puntos_xp_check" CHECK ((puntos_xp >= 0)),
  CONSTRAINT "ejercicios_tipo_ejercicio_check" CHECK ((tipo_ejercicio = ANY (ARRAY['tecnico'::text, 'ritmico'::text, 'lectura'::text, 'auditivo'::text, 'repertorio'::text, 'teorico'::text, 'postural'::text, 'ensamble'::text, 'memoria'::text, 'otro'::text]))),
  CONSTRAINT "ejercicios_unidad_orden_unique" UNIQUE (unidad_id, orden),
  CONSTRAINT "fk_ejercicios_unidad" FOREIGN KEY (unidad_id) REFERENCES unidades(id) ON DELETE CASCADE
);

ALTER TABLE public."ejercicios" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX ejercicios_unidad_orden_unique ON public.ejercicios USING btree (unidad_id, orden);
CREATE INDEX idx_ejercicios_tipo ON public.ejercicios USING btree (tipo_ejercicio);
CREATE INDEX idx_ejercicios_unidad ON public.ejercicios USING btree (unidad_id);
CREATE POLICY "ejercicios_admin_read" ON public."ejercicios" FOR SELECT USING (es_admin());
CREATE POLICY "ejercicios_authenticated_all" ON public."ejercicios" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."evaluacion_indicador"
-- ----------------------------------------------------------------------------
CREATE TABLE public."evaluacion_indicador" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "alumno_id" uuid NOT NULL,
  "indicator_id" uuid,
  "clase_id" uuid NOT NULL,
  "nota" integer,
  "estado" text DEFAULT 'sin_evaluar'::text,
  "observaciones" text,
  "evaluado_por" uuid,
  "fecha_evaluacion" timestamp with time zone DEFAULT now(),
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "clase_indicador_id" uuid,
  "recovery_status" text DEFAULT 'pendiente'::text,
  "recovery_notes" text,
  "recovery_timestamp" timestamp with time zone,
  "recovery_grade" integer,
  "maestro_indicador_id" uuid,
  "review_flag" boolean DEFAULT false NOT NULL,
  CONSTRAINT "evaluacion_indicador_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "evaluacion_indicador_alumno_indicator_clase_unique" UNIQUE (alumno_id, indicator_id, clase_id),
  CONSTRAINT "evaluacion_indicador_alumno_maestro_indicador_clase_unique" UNIQUE (alumno_id, maestro_indicador_id, clase_id),
  CONSTRAINT "evaluacion_indicador_estado_check" CHECK ((estado = ANY (ARRAY['sin_evaluar'::text, 'inicia'::text, 'en_progreso'::text, 'avanzado'::text, 'dominado'::text]))),
  CONSTRAINT "evaluacion_indicador_exactly_one_indicator_source" CHECK ((((indicator_id IS NOT NULL) AND (maestro_indicador_id IS NULL)) OR ((indicator_id IS NULL) AND (maestro_indicador_id IS NOT NULL)))),
  CONSTRAINT "evaluacion_indicador_nota_check" CHECK (((nota >= 1) AND (nota <= 5))),
  CONSTRAINT "evaluacion_indicador_recovery_grade_check" CHECK (((recovery_grade IS NULL) OR ((recovery_grade >= 1) AND (recovery_grade <= 5)))),
  CONSTRAINT "evaluacion_indicador_recovery_status_check" CHECK ((recovery_status = ANY (ARRAY['pendiente'::text, 'recuperado'::text, 'no_recuperable'::text, 'no_aplica'::text]))),
  CONSTRAINT "evaluacion_indicador_alumno_id_fkey" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  CONSTRAINT "evaluacion_indicador_clase_id_fkey" FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE,
  CONSTRAINT "evaluacion_indicador_clase_indicador_id_fkey" FOREIGN KEY (clase_indicador_id) REFERENCES clase_mapa_indicadores(id) ON DELETE RESTRICT,
  CONSTRAINT "evaluacion_indicador_evaluado_por_fkey" FOREIGN KEY (evaluado_por) REFERENCES auth.users(id),
  CONSTRAINT "evaluacion_indicador_indicator_id_fkey" FOREIGN KEY (indicator_id) REFERENCES indicators(id) ON DELETE CASCADE,
  CONSTRAINT "evaluacion_indicador_maestro_indicador_id_fkey" FOREIGN KEY (maestro_indicador_id) REFERENCES maestro_indicadores(id) ON DELETE CASCADE
);

ALTER TABLE public."evaluacion_indicador" ENABLE ROW LEVEL SECURITY;
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
CREATE POLICY "admin_all_ei" ON public."evaluacion_indicador" FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "ei_owner" ON public."evaluacion_indicador" FOR ALL TO authenticated USING ((es_admin() OR es_maestro_de_clase(clase_id))) WITH CHECK ((es_maestro_de_clase(clase_id) AND (evaluado_por = maestro_actual())));
CREATE POLICY "teacher_delete_own_ei" ON public."evaluacion_indicador" FOR DELETE TO authenticated USING (((evaluado_por = auth.uid()) OR es_admin()));
CREATE POLICY "teacher_insert_ei" ON public."evaluacion_indicador" FOR INSERT TO authenticated WITH CHECK (((evaluado_por = auth.uid()) OR (evaluado_por IS NULL) OR es_admin()));
CREATE POLICY "teacher_read_own_ei" ON public."evaluacion_indicador" FOR SELECT TO authenticated USING (((evaluado_por = auth.uid()) OR (evaluado_por IS NULL) OR es_admin()));
CREATE POLICY "teacher_update_own_ei" ON public."evaluacion_indicador" FOR UPDATE TO authenticated USING (((evaluado_por = auth.uid()) OR (evaluado_por IS NULL) OR es_admin())) WITH CHECK (((evaluado_por = auth.uid()) OR (evaluado_por IS NULL) OR es_admin()));

-- ----------------------------------------------------------------------------
-- Tabla: public."evaluations"
-- ----------------------------------------------------------------------------
CREATE TABLE public."evaluations" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "student_id" uuid NOT NULL,
  "jurado_id" text NOT NULL,
  "jurado_name" text NOT NULL,
  "afinacion_general" integer,
  "ritmo_escala" integer,
  "sonido" integer,
  "digitacion" integer,
  "afinacion_rep" integer,
  "ritmo_rep" integer,
  "articulacion" integer,
  "lectura" integer,
  "score_escala" integer,
  "score_danzon" integer,
  "score_total" integer,
  "observations" text DEFAULT ''::text,
  "recommendation" text DEFAULT ''::text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "evaluations_afinacion_general_check" CHECK (((afinacion_general >= 1) AND (afinacion_general <= 4))),
  CONSTRAINT "evaluations_afinacion_rep_check" CHECK (((afinacion_rep >= 1) AND (afinacion_rep <= 4))),
  CONSTRAINT "evaluations_articulacion_check" CHECK (((articulacion >= 1) AND (articulacion <= 4))),
  CONSTRAINT "evaluations_digitacion_check" CHECK (((digitacion >= 1) AND (digitacion <= 4))),
  CONSTRAINT "evaluations_lectura_check" CHECK (((lectura >= 1) AND (lectura <= 4))),
  CONSTRAINT "evaluations_ritmo_escala_check" CHECK (((ritmo_escala >= 1) AND (ritmo_escala <= 4))),
  CONSTRAINT "evaluations_ritmo_rep_check" CHECK (((ritmo_rep >= 1) AND (ritmo_rep <= 4))),
  CONSTRAINT "evaluations_sonido_check" CHECK (((sonido >= 1) AND (sonido <= 4))),
  CONSTRAINT "evaluations_student_id_jurado_id_key" UNIQUE (student_id, jurado_id),
  CONSTRAINT "evaluations_student_id_fkey" FOREIGN KEY (student_id) REFERENCES alumnos(id) ON DELETE CASCADE
);

ALTER TABLE public."evaluations" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX evaluations_student_id_jurado_id_key ON public.evaluations USING btree (student_id, jurado_id);
CREATE POLICY "Evaluations delete policy" ON public."evaluations" FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM app_users au
  WHERE ((au.id = auth.uid()) AND ((au.role = 'admin'::text) OR ((au.role = 'jurado'::text) AND (au.jurado_id = evaluations.jurado_id)))))));
CREATE POLICY "Evaluations insert policy" ON public."evaluations" FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM app_users au
  WHERE ((au.id = auth.uid()) AND ((au.role = 'admin'::text) OR ((au.role = 'jurado'::text) AND (au.jurado_id = evaluations.jurado_id)))))));
CREATE POLICY "Evaluations read policy" ON public."evaluations" FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM app_users au
  WHERE ((au.id = auth.uid()) AND ((au.role = 'admin'::text) OR ((au.role = 'jurado'::text) AND (au.jurado_id = evaluations.jurado_id)))))));
CREATE POLICY "Evaluations update policy" ON public."evaluations" FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM app_users au
  WHERE ((au.id = auth.uid()) AND ((au.role = 'admin'::text) OR ((au.role = 'jurado'::text) AND (au.jurado_id = evaluations.jurado_id))))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM app_users au
  WHERE ((au.id = auth.uid()) AND ((au.role = 'admin'::text) OR ((au.role = 'jurado'::text) AND (au.jurado_id = evaluations.jurado_id)))))));

-- ----------------------------------------------------------------------------
-- Tabla: public."facturas_reparacion"
-- ----------------------------------------------------------------------------
CREATE TABLE public."facturas_reparacion" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "reparacion_id" uuid NOT NULL,
  "numero_factura" character varying(50) NOT NULL,
  "monto_total" numeric NOT NULL,
  "impuestos" numeric DEFAULT 0,
  "metodo_pago" character varying(50) NOT NULL,
  "responsable_id" uuid,
  "tipo_factura" character varying(50) DEFAULT 'institucion'::character varying NOT NULL,
  "fecha_emision" date DEFAULT CURRENT_DATE NOT NULL,
  "pdf_generado_url" character varying(500),
  "estado_pago" character varying(50) DEFAULT 'pendiente'::character varying NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "facturas_reparacion_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "facturas_reparacion_estado_pago_check" CHECK (((estado_pago)::text = ANY ((ARRAY['pendiente'::character varying, 'pagado'::character varying, 'anulada'::character varying])::text[]))),
  CONSTRAINT "facturas_reparacion_impuestos_check" CHECK ((impuestos >= (0)::numeric)),
  CONSTRAINT "facturas_reparacion_metodo_pago_check" CHECK (((metodo_pago)::text = ANY ((ARRAY['efectivo'::character varying, 'transferencia'::character varying, 'deposito'::character varying, 'tarjeta'::character varying])::text[]))),
  CONSTRAINT "facturas_reparacion_monto_total_check" CHECK ((monto_total > (0)::numeric)),
  CONSTRAINT "facturas_reparacion_numero_factura_key" UNIQUE (numero_factura),
  CONSTRAINT "facturas_reparacion_tipo_factura_check" CHECK (((tipo_factura)::text = ANY ((ARRAY['alumno'::character varying, 'institucion'::character varying])::text[]))),
  CONSTRAINT "facturas_reparacion_reparacion_id_fkey" FOREIGN KEY (reparacion_id) REFERENCES inventario_reparaciones(id) ON DELETE RESTRICT,
  CONSTRAINT "facturas_reparacion_responsable_id_fkey" FOREIGN KEY (responsable_id) REFERENCES auth.users(id)
);

ALTER TABLE public."facturas_reparacion" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."facturas_reparacion" IS 'Facturas asociadas a reparaciones de instrumentos';
CREATE UNIQUE INDEX facturas_reparacion_numero_factura_key ON public.facturas_reparacion USING btree (numero_factura);
CREATE INDEX idx_facturas_estado ON public.facturas_reparacion USING btree (estado_pago);
CREATE INDEX idx_facturas_reparacion ON public.facturas_reparacion USING btree (reparacion_id);
CREATE POLICY "facturas_admin_delete" ON public."facturas_reparacion" FOR DELETE TO authenticated USING (es_admin());
CREATE POLICY "facturas_admin_insert" ON public."facturas_reparacion" FOR INSERT TO authenticated WITH CHECK (es_admin());
CREATE POLICY "facturas_admin_update" ON public."facturas_reparacion" FOR UPDATE TO authenticated USING (es_admin());
CREATE POLICY "facturas_authenticated_select" ON public."facturas_reparacion" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."familias"
-- ----------------------------------------------------------------------------
CREATE TABLE public."familias" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "nombre_familia" text NOT NULL,
  "fecha_ingreso" date DEFAULT CURRENT_DATE NOT NULL,
  "activa" boolean DEFAULT true NOT NULL,
  "datos_extra" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "familias_pkey" PRIMARY KEY ("id")
);

ALTER TABLE public."familias" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_familias_activa ON public.familias USING btree (activa);
CREATE POLICY "familias_all_admin" ON public."familias" FOR ALL USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
CREATE POLICY "familias_select_cajero_admin" ON public."familias" FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
CREATE POLICY "familias_select_representante" ON public."familias" FOR SELECT USING (((get_user_role() = 'representante'::text) AND (id = get_user_familia_id())));

-- ----------------------------------------------------------------------------
-- Tabla: public."fin_service_accounts"
-- ----------------------------------------------------------------------------
CREATE TABLE public."fin_service_accounts" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "provider_id" uuid NOT NULL,
  "external_account_ref" text NOT NULL,
  "account_name" text,
  "service_type" text,
  "currency_code" text DEFAULT 'DOP'::text NOT NULL,
  "essential" boolean DEFAULT false NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "refresh_enabled" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  CONSTRAINT "fin_service_accounts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "fin_service_accounts_provider_id_external_account_ref_key" UNIQUE (provider_id, external_account_ref),
  CONSTRAINT "fin_service_accounts_provider_id_fkey" FOREIGN KEY (provider_id) REFERENCES fin_service_providers(id)
);

ALTER TABLE public."fin_service_accounts" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."fin_service_accounts" IS 'Cuentas de servicios externos a refrescar (medidores CEPM, etc.). Solo service_role.';
CREATE UNIQUE INDEX fin_service_accounts_provider_id_external_account_ref_key ON public.fin_service_accounts USING btree (provider_id, external_account_ref);

-- ----------------------------------------------------------------------------
-- Tabla: public."fin_service_balance_snapshots"
-- ----------------------------------------------------------------------------
CREATE TABLE public."fin_service_balance_snapshots" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "service_account_id" uuid NOT NULL,
  "refresh_run_id" uuid,
  "observed_at" timestamp with time zone NOT NULL,
  "balance_centavos" bigint,
  "amount_due_centavos" bigint,
  "due_date" date,
  "currency_code" text NOT NULL,
  "source_snapshot_key" text NOT NULL,
  "provider_summary" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "fin_service_balance_snapshots_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "fin_service_balance_snapshots_source_snapshot_key_key" UNIQUE (source_snapshot_key),
  CONSTRAINT "fin_service_balance_snapshots_refresh_run_id_fkey" FOREIGN KEY (refresh_run_id) REFERENCES fin_service_refresh_runs(id),
  CONSTRAINT "fin_service_balance_snapshots_service_account_id_fkey" FOREIGN KEY (service_account_id) REFERENCES fin_service_accounts(id)
);

ALTER TABLE public."fin_service_balance_snapshots" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."fin_service_balance_snapshots" IS 'Histórico de balances observados por cuenta (dedup por source_snapshot_key). Solo service_role.';
CREATE UNIQUE INDEX fin_service_balance_snapshots_source_snapshot_key_key ON public.fin_service_balance_snapshots USING btree (source_snapshot_key);
CREATE INDEX idx_fin_service_balance_snapshots_account_observed ON public.fin_service_balance_snapshots USING btree (service_account_id, observed_at DESC);

-- ----------------------------------------------------------------------------
-- Tabla: public."fin_service_providers"
-- ----------------------------------------------------------------------------
CREATE TABLE public."fin_service_providers" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "connector_key" text NOT NULL,
  "connector_status" text DEFAULT 'active'::text NOT NULL,
  "display_name" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "fin_service_providers_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "fin_service_providers_connector_key_key" UNIQUE (connector_key),
  CONSTRAINT "fin_service_providers_connector_status_check" CHECK ((connector_status = ANY (ARRAY['active'::text, 'inactive'::text])))
);

ALTER TABLE public."fin_service_providers" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."fin_service_providers" IS 'Catálogo de conectores de proveedores de servicios externos (CEPM, etc.). Solo service_role.';
CREATE UNIQUE INDEX fin_service_providers_connector_key_key ON public.fin_service_providers USING btree (connector_key);

-- ----------------------------------------------------------------------------
-- Tabla: public."fin_service_refresh_runs"
-- ----------------------------------------------------------------------------
CREATE TABLE public."fin_service_refresh_runs" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "service_account_id" uuid NOT NULL,
  "trigger_source" text NOT NULL,
  "status" text NOT NULL,
  "error_code" text,
  "error_message" text,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "finished_at" timestamp with time zone,
  CONSTRAINT "fin_service_refresh_runs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "fin_service_refresh_runs_status_check" CHECK ((status = ANY (ARRAY['running'::text, 'success'::text, 'unsupported'::text, 'skipped'::text, 'error'::text]))),
  CONSTRAINT "fin_service_refresh_runs_trigger_source_check" CHECK ((trigger_source = ANY (ARRAY['schedule'::text, 'manual'::text]))),
  CONSTRAINT "fin_service_refresh_runs_service_account_id_fkey" FOREIGN KEY (service_account_id) REFERENCES fin_service_accounts(id)
);

ALTER TABLE public."fin_service_refresh_runs" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."fin_service_refresh_runs" IS 'Auditoría de cada intento de refresh (audit trail). Solo service_role.';

-- ----------------------------------------------------------------------------
-- Tabla: public."fin_service_refresh_state"
-- ----------------------------------------------------------------------------
CREATE TABLE public."fin_service_refresh_state" (
  "service_account_id" uuid NOT NULL,
  "locked_by_run_id" uuid,
  "lock_expires_at" timestamp with time zone,
  "last_query_at" timestamp with time zone,
  "last_success_at" timestamp with time zone,
  "last_status" text,
  "last_error_code" text,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "fin_service_refresh_state_pkey" PRIMARY KEY ("service_account_id"),
  CONSTRAINT "fin_service_refresh_state_locked_by_run_id_fkey" FOREIGN KEY (locked_by_run_id) REFERENCES fin_service_refresh_runs(id),
  CONSTRAINT "fin_service_refresh_state_service_account_id_fkey" FOREIGN KEY (service_account_id) REFERENCES fin_service_accounts(id)
);

ALTER TABLE public."fin_service_refresh_state" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."fin_service_refresh_state" IS 'Estado de lock + última consulta por cuenta, para concurrencia segura. Solo service_role.';

-- ----------------------------------------------------------------------------
-- Tabla: public."finanzas_politica_cobranza"
-- ----------------------------------------------------------------------------
CREATE TABLE public."finanzas_politica_cobranza" (
  "singleton" boolean DEFAULT true NOT NULL,
  "dia_vencimiento" smallint DEFAULT 10 NOT NULL,
  "dias_mora_amarilla" integer DEFAULT 30 NOT NULL,
  "dias_mora_critica" integer DEFAULT 60 NOT NULL,
  "bloqueo_requiere_aprobacion" boolean DEFAULT true NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_by" uuid DEFAULT auth.uid(),
  CONSTRAINT "finanzas_politica_cobranza_pkey" PRIMARY KEY ("singleton"),
  CONSTRAINT "finanzas_politica_cobranza_check" CHECK ((dias_mora_critica > dias_mora_amarilla)),
  CONSTRAINT "finanzas_politica_cobranza_dia_vencimiento_check" CHECK (((dia_vencimiento >= 1) AND (dia_vencimiento <= 28))),
  CONSTRAINT "finanzas_politica_cobranza_dias_mora_amarilla_check" CHECK ((dias_mora_amarilla >= 1)),
  CONSTRAINT "finanzas_politica_cobranza_singleton_check" CHECK (singleton)
);

ALTER TABLE public."finanzas_politica_cobranza" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "finanzas_politica_cobranza_authenticated_read" ON public."finanzas_politica_cobranza" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."gastos_fijos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."gastos_fijos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "nombre" text NOT NULL,
  "categoria" text NOT NULL,
  "centro_costo" soi_departamento DEFAULT 'ADM'::soi_departamento NOT NULL,
  "monto_centavos" bigint NOT NULL,
  "dia_inicio" smallint NOT NULL,
  "dia_fin" smallint NOT NULL,
  "repetir_mensual" boolean DEFAULT true NOT NULL,
  "activo" boolean DEFAULT true NOT NULL,
  "notas" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid DEFAULT auth.uid(),
  CONSTRAINT "gastos_fijos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "gastos_fijos_categoria_check" CHECK ((categoria = ANY (ARRAY['comunicaciones'::text, 'energia'::text, 'agua'::text, 'limpieza'::text, 'personal'::text, 'alquiler'::text, 'software'::text, 'seguro'::text, 'otro'::text]))),
  CONSTRAINT "gastos_fijos_check" CHECK ((((dia_fin >= 1) AND (dia_fin <= 31)) AND (dia_fin >= dia_inicio))),
  CONSTRAINT "gastos_fijos_dia_inicio_check" CHECK (((dia_inicio >= 1) AND (dia_inicio <= 31))),
  CONSTRAINT "gastos_fijos_monto_centavos_check" CHECK ((monto_centavos > 0))
);

ALTER TABLE public."gastos_fijos" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gastos_fijos_insert_finanzas_admin" ON public."gastos_fijos" FOR INSERT WITH CHECK ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
CREATE POLICY "gastos_fijos_select_finanzas_admin" ON public."gastos_fijos" FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
CREATE POLICY "gastos_fijos_update_admin" ON public."gastos_fijos" FOR UPDATE USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));

-- ----------------------------------------------------------------------------
-- Tabla: public."gastos_fijos_pagos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."gastos_fijos_pagos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "gasto_fijo_id" uuid NOT NULL,
  "periodo_anio" integer NOT NULL,
  "periodo_mes" integer NOT NULL,
  "monto_centavos" bigint NOT NULL,
  "estado" text DEFAULT 'pendiente'::text NOT NULL,
  "fecha_pago" date,
  "referencia" text,
  "registrado_por" uuid DEFAULT auth.uid(),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "gastos_fijos_pagos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "gastos_fijos_pagos_estado_check" CHECK ((estado = ANY (ARRAY['pendiente'::text, 'pagado'::text]))),
  CONSTRAINT "gastos_fijos_pagos_gasto_fijo_id_periodo_anio_periodo_mes_key" UNIQUE (gasto_fijo_id, periodo_anio, periodo_mes),
  CONSTRAINT "gastos_fijos_pagos_monto_centavos_check" CHECK ((monto_centavos > 0)),
  CONSTRAINT "gastos_fijos_pagos_periodo_mes_check" CHECK (((periodo_mes >= 1) AND (periodo_mes <= 12))),
  CONSTRAINT "gastos_fijos_pagos_gasto_fijo_id_fkey" FOREIGN KEY (gasto_fijo_id) REFERENCES gastos_fijos(id) ON DELETE CASCADE
);

ALTER TABLE public."gastos_fijos_pagos" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX gastos_fijos_pagos_gasto_fijo_id_periodo_anio_periodo_mes_key ON public.gastos_fijos_pagos USING btree (gasto_fijo_id, periodo_anio, periodo_mes);
CREATE INDEX idx_gastos_fijos_pagos_gasto ON public.gastos_fijos_pagos USING btree (gasto_fijo_id);
CREATE POLICY "gastos_fijos_pagos_insert_finanzas_admin" ON public."gastos_fijos_pagos" FOR INSERT WITH CHECK ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
CREATE POLICY "gastos_fijos_pagos_select_finanzas_admin" ON public."gastos_fijos_pagos" FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
CREATE POLICY "gastos_fijos_pagos_update_finanzas_admin" ON public."gastos_fijos_pagos" FOR UPDATE USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text]))) WITH CHECK ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));

-- ----------------------------------------------------------------------------
-- Tabla: public."generated_documents"
-- ----------------------------------------------------------------------------
CREATE TABLE public."generated_documents" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "batch_id" uuid,
  "template_id" uuid,
  "tipo" text NOT NULL,
  "titulo" text NOT NULL,
  "alumno_id" uuid,
  "alumno_nombre" text,
  "grupo_nombre" text,
  "actividad_nombre" text,
  "contenido_final" text NOT NULL,
  "variables_usadas" jsonb DEFAULT '{}'::jsonb,
  "variables_faltantes" jsonb DEFAULT '[]'::jsonb,
  "advertencias" jsonb DEFAULT '[]'::jsonb,
  "pdf_url" text,
  "estado" text DEFAULT 'borrador'::text NOT NULL,
  "generado_por" uuid,
  "generated_at" timestamp with time zone DEFAULT now(),
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "generated_documents_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "generated_documents_estado_check" CHECK ((estado = ANY (ARRAY['borrador'::text, 'generado'::text, 'archivado'::text, 'anulado'::text]))),
  CONSTRAINT "generated_documents_alumno_id_fkey" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL,
  CONSTRAINT "generated_documents_batch_id_fkey" FOREIGN KEY (batch_id) REFERENCES document_batches(id) ON DELETE SET NULL,
  CONSTRAINT "generated_documents_template_id_fkey" FOREIGN KEY (template_id) REFERENCES document_templates(id) ON DELETE SET NULL
);

ALTER TABLE public."generated_documents" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."generated_documents" IS '-- DEPRECATED: generador documental institucional diferido 2026-09 (Owner: DIR/ADM)';
CREATE POLICY "rls_generated_documents_all" ON public."generated_documents" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."hermes_gateway_health"
-- ----------------------------------------------------------------------------
CREATE TABLE public."hermes_gateway_health" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "instance_name" text DEFAULT 'soi-main'::text NOT NULL,
  "status" text DEFAULT 'disconnected'::text NOT NULL,
  "phone_number" text,
  "battery_level" integer,
  "qr_code_base64" text,
  "last_heartbeat" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  CONSTRAINT "hermes_gateway_health_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "hermes_gateway_health_instance_name_key" UNIQUE (instance_name),
  CONSTRAINT "hermes_gateway_health_status_check" CHECK ((status = ANY (ARRAY['connected'::text, 'connecting'::text, 'disconnected'::text, 'qr_ready'::text])))
);

ALTER TABLE public."hermes_gateway_health" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."hermes_gateway_health" IS 'Registro de telemetria y latido en vivo (heartbeat) emitido por el contenedor Evolution API / Baileys.';
CREATE UNIQUE INDEX hermes_gateway_health_instance_name_key ON public.hermes_gateway_health USING btree (instance_name);
CREATE INDEX idx_hermes_gateway_health_instance ON public.hermes_gateway_health USING btree (instance_name);
CREATE POLICY "hgh_admin_read" ON public."hermes_gateway_health" FOR SELECT TO authenticated USING (es_admin());
CREATE POLICY "hgh_service_role_all" ON public."hermes_gateway_health" FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."hermes_gateway_worker_lease"
-- ----------------------------------------------------------------------------
CREATE TABLE public."hermes_gateway_worker_lease" (
  "instance_name" text NOT NULL,
  "owner_id" text NOT NULL,
  "lease_until" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "hermes_gateway_worker_lease_pkey" PRIMARY KEY ("instance_name")
);

ALTER TABLE public."hermes_gateway_worker_lease" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hermes_gateway_worker_lease_service_role" ON public."hermes_gateway_worker_lease" FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."hermes_inbox"
-- ----------------------------------------------------------------------------
CREATE TABLE public."hermes_inbox" (
  "id" bigint DEFAULT nextval('hermes_inbox_id_seq'::regclass) NOT NULL,
  "canal" character varying(50) DEFAULT 'db_trigger'::character varying NOT NULL,
  "categoria" character varying(100) NOT NULL,
  "summary" text NOT NULL,
  "raw_ref" uuid,
  "processed" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "telegram_user_id" bigint,
  CONSTRAINT "hermes_inbox_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "hermes_inbox_canal_check" CHECK (((canal)::text = ANY ((ARRAY['db_trigger'::character varying, 'telegram'::character varying])::text[])))
);

ALTER TABLE public."hermes_inbox" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."hermes_inbox" IS 'Bus de eventos para HERMES. Leída por analyze-risk.js y cron jobs. Solo service_role.';
CREATE INDEX hermes_inbox_rate_limit_idx ON public.hermes_inbox USING btree (telegram_user_id, created_at DESC) WHERE (telegram_user_id IS NOT NULL);
CREATE INDEX idx_hermes_inbox_unprocessed ON public.hermes_inbox USING btree (created_at) WHERE (processed = false);
CREATE POLICY "hermes_inbox_service_only" ON public."hermes_inbox" FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."hermes_kanban_cards"
-- ----------------------------------------------------------------------------
CREATE TABLE public."hermes_kanban_cards" (
  "card_id" text NOT NULL,
  "board" text,
  "title" text NOT NULL,
  "status" text NOT NULL,
  "assignee" text,
  "priority" integer,
  "summary" text,
  "hermes_updated_at" timestamp with time zone,
  "synced_at" timestamp with time zone DEFAULT now() NOT NULL,
  "raw" jsonb,
  CONSTRAINT "hermes_kanban_cards_pkey" PRIMARY KEY ("card_id")
);

ALTER TABLE public."hermes_kanban_cards" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."hermes_kanban_cards" IS 'Espejo read-only de tarjetas del Kanban de Hermes (~/.hermes/kanban.db). Escrita por edge fn hermes-kanban-ingest via poller. Fase 1 puente Hermes<->SOI.';
CREATE INDEX idx_hermes_kanban_cards_status ON public.hermes_kanban_cards USING btree (status);
CREATE INDEX idx_hermes_kanban_cards_synced_at ON public.hermes_kanban_cards USING btree (synced_at DESC);
CREATE POLICY "hermes_kanban_cards_admin_write" ON public."hermes_kanban_cards" FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "hermes_kanban_cards_auth_read" ON public."hermes_kanban_cards" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."hermes_process_cases"
-- ----------------------------------------------------------------------------
CREATE TABLE public."hermes_process_cases" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "process_code" text,
  "title" text NOT NULL,
  "description" text,
  "source" text DEFAULT 'manual'::text NOT NULL,
  "status" text DEFAULT 'open'::text NOT NULL,
  "priority" text DEFAULT 'media'::text NOT NULL,
  "requested_by" uuid,
  "requested_by_name" text,
  "owner_department" text,
  "entity_type" text,
  "entity_id" uuid,
  "entity_label" text,
  "required_evidence_snapshot" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "closure_criteria_snapshot" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "closure_summary" text,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "opened_at" timestamp with time zone DEFAULT now() NOT NULL,
  "closed_at" timestamp with time zone,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "hermes_process_cases_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "hermes_process_cases_entity_type_check" CHECK (((entity_type IS NULL) OR (entity_type = ANY (ARRAY['alumno'::text, 'maestro'::text, 'postulante'::text, 'representante'::text, 'instrumento'::text, 'evento'::text, 'otro'::text])))),
  CONSTRAINT "hermes_process_cases_priority_check" CHECK ((priority = ANY (ARRAY['baja'::text, 'media'::text, 'alta'::text, 'critica'::text]))),
  CONSTRAINT "hermes_process_cases_source_check" CHECK ((source = ANY (ARRAY['manual'::text, 'event'::text, 'scheduled'::text, 'data_driven'::text, 'conversation'::text]))),
  CONSTRAINT "hermes_process_cases_status_check" CHECK ((status = ANY (ARRAY['open'::text, 'in_progress'::text, 'blocked'::text, 'closed'::text, 'cancelled'::text]))),
  CONSTRAINT "hermes_process_cases_process_code_fkey" FOREIGN KEY (process_code) REFERENCES soi_process_contracts(process_code) ON UPDATE CASCADE
);

ALTER TABLE public."hermes_process_cases" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."hermes_process_cases"."closure_criteria_snapshot" IS 'Copia de closure_criteria al momento de abrir el caso para preservar auditoria aunque el contrato evolucione.';
COMMENT ON COLUMN public."hermes_process_cases"."required_evidence_snapshot" IS 'Copia de required_evidence al momento de abrir el caso para preservar auditoria aunque el contrato evolucione.';
COMMENT ON TABLE public."hermes_process_cases" IS 'Ejecucion concreta de un proceso SOI. Su id se usa como correlation_id para agrupar tareas institucionales.';
CREATE INDEX idx_hermes_process_cases_entity ON public.hermes_process_cases USING btree (entity_type, entity_id);
CREATE INDEX idx_hermes_process_cases_owner ON public.hermes_process_cases USING btree (owner_department);
CREATE INDEX idx_hermes_process_cases_process ON public.hermes_process_cases USING btree (process_code);
CREATE INDEX idx_hermes_process_cases_status ON public.hermes_process_cases USING btree (status);
CREATE POLICY "hermes_process_cases_auth_all" ON public."hermes_process_cases" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."hermes_protocolos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."hermes_protocolos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "categoria_evento" event_categoria NOT NULL,
  "nombre_protocolo" text NOT NULL,
  "descripcion" text,
  "tareas_plantilla" jsonb NOT NULL,
  "activo" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "hermes_protocolos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "hermes_protocolos_categoria_evento_key" UNIQUE (categoria_evento)
);

ALTER TABLE public."hermes_protocolos" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX hermes_protocolos_categoria_evento_key ON public.hermes_protocolos USING btree (categoria_evento);
CREATE INDEX idx_hermes_protocolos_activo ON public.hermes_protocolos USING btree (activo);
CREATE POLICY "protocolos_admin_write" ON public."hermes_protocolos" FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "protocolos_auth_read" ON public."hermes_protocolos" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."hermes_reactive_rules"
-- ----------------------------------------------------------------------------
CREATE TABLE public."hermes_reactive_rules" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "rule_type" text NOT NULL,
  "nombre" text NOT NULL,
  "descripcion" text,
  "enabled" boolean DEFAULT true NOT NULL,
  "departamento" text NOT NULL,
  "conditions_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "hermes_reactive_rules_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "check_hermes_rules_departamento" CHECK ((departamento = ANY (ARRAY['DIR'::text, 'ACM'::text, 'ADM'::text, 'FIN'::text, 'LOG'::text, 'COM'::text, 'TECNICO'::text, 'LUT'::text]))),
  CONSTRAINT "check_hermes_rules_type" CHECK ((rule_type = ANY (ARRAY['R1'::text, 'R2'::text, 'R3'::text, 'R4'::text, 'R5'::text, 'R6'::text, 'R7'::text, 'R8'::text]))),
  CONSTRAINT "uq_hermes_rules_type_dept" UNIQUE (rule_type, departamento)
);

ALTER TABLE public."hermes_reactive_rules" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_hermes_rules_departamento ON public.hermes_reactive_rules USING btree (departamento);
CREATE INDEX idx_hermes_rules_enabled ON public.hermes_reactive_rules USING btree (enabled, rule_type);
CREATE INDEX idx_hermes_rules_lookup ON public.hermes_reactive_rules USING btree (rule_type, departamento);
CREATE UNIQUE INDEX uq_hermes_rules_type_dept ON public.hermes_reactive_rules USING btree (rule_type, departamento);
CREATE POLICY "hermes_rules_acm_select" ON public."hermes_reactive_rules" FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'ACM'::text) AND (departamento = 'ACM'::text)));
CREATE POLICY "hermes_rules_acm_update" ON public."hermes_reactive_rules" FOR UPDATE USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'ACM'::text) AND (departamento = 'ACM'::text))) WITH CHECK (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'ACM'::text) AND (departamento = 'ACM'::text)));
CREATE POLICY "hermes_rules_adm_select" ON public."hermes_reactive_rules" FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'ADM'::text) AND (departamento = 'ADM'::text)));
CREATE POLICY "hermes_rules_adm_update" ON public."hermes_reactive_rules" FOR UPDATE USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'ADM'::text) AND (departamento = 'ADM'::text))) WITH CHECK (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'ADM'::text) AND (departamento = 'ADM'::text)));
CREATE POLICY "hermes_rules_com_select" ON public."hermes_reactive_rules" FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'COM'::text) AND (departamento = 'COM'::text)));
CREATE POLICY "hermes_rules_dir_insert" ON public."hermes_reactive_rules" FOR INSERT WITH CHECK (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'DIR'::text)));
CREATE POLICY "hermes_rules_dir_select" ON public."hermes_reactive_rules" FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'DIR'::text)));
CREATE POLICY "hermes_rules_dir_update" ON public."hermes_reactive_rules" FOR UPDATE USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'DIR'::text))) WITH CHECK (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'DIR'::text)));
CREATE POLICY "hermes_rules_fin_select" ON public."hermes_reactive_rules" FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'FIN'::text) AND (departamento = 'FIN'::text)));
CREATE POLICY "hermes_rules_log_select" ON public."hermes_reactive_rules" FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'LOG'::text) AND (departamento = 'LOG'::text)));
CREATE POLICY "hermes_rules_log_update" ON public."hermes_reactive_rules" FOR UPDATE USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'LOG'::text) AND (departamento = 'LOG'::text))) WITH CHECK (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'LOG'::text) AND (departamento = 'LOG'::text)));
CREATE POLICY "hermes_rules_lut_select" ON public."hermes_reactive_rules" FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'LUT'::text) AND (departamento = 'LUT'::text)));
CREATE POLICY "hermes_rules_service_role_all" ON public."hermes_reactive_rules" FOR ALL USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));
CREATE POLICY "hermes_rules_tecnico_select" ON public."hermes_reactive_rules" FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'TECNICO'::text) AND (departamento = 'TECNICO'::text)));

-- ----------------------------------------------------------------------------
-- Tabla: public."hermes_whatsapp_config"
-- ----------------------------------------------------------------------------
CREATE TABLE public."hermes_whatsapp_config" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "gateway_url" text NOT NULL,
  "api_key" text,
  "instance_name" text DEFAULT 'soi-main'::text NOT NULL,
  "activo" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "jitter_min_seg" integer DEFAULT 8 NOT NULL,
  "jitter_max_seg" integer DEFAULT 20 NOT NULL,
  "cap_diario" integer DEFAULT 200 NOT NULL,
  "cap_horario" integer DEFAULT 40 NOT NULL,
  "batch_size" integer DEFAULT 10 NOT NULL,
  "batch_cooldown_seg" integer DEFAULT 60 NOT NULL,
  "warmup_inicio" integer DEFAULT 20 NOT NULL,
  "warmup_dias" integer DEFAULT 7 NOT NULL,
  "warmup_desde" date,
  "rate_limit_hora" integer DEFAULT 10 NOT NULL,
  "numero_wid" text,
  "numero_nombre" text,
  "consentimiento_registrado" boolean DEFAULT false NOT NULL,
  CONSTRAINT "hermes_whatsapp_config_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "hermes_whatsapp_config_numero_wid_key" UNIQUE (numero_wid)
);

ALTER TABLE public."hermes_whatsapp_config" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX hermes_whatsapp_config_numero_wid_key ON public.hermes_whatsapp_config USING btree (numero_wid);
CREATE POLICY "wa_config_admin_all" ON public."hermes_whatsapp_config" FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "wa_config_service_role_all" ON public."hermes_whatsapp_config" FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."hermes_whatsapp_queue"
-- ----------------------------------------------------------------------------
CREATE TABLE public."hermes_whatsapp_queue" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "jid" text NOT NULL,
  "mensaje" text NOT NULL,
  "estado" text DEFAULT 'pendiente'::text NOT NULL,
  "intentos" integer DEFAULT 0,
  "error_msg" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "procesado_at" timestamp with time zone,
  "campania_envio_id" uuid,
  CONSTRAINT "hermes_whatsapp_queue_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "hermes_whatsapp_queue_estado_check" CHECK ((estado = ANY (ARRAY['pendiente'::text, 'pendiente_aprobacion'::text, 'procesando'::text, 'enviado'::text, 'fallido'::text, 'cancelado'::text]))),
  CONSTRAINT "hermes_whatsapp_queue_campania_envio_id_fkey" FOREIGN KEY (campania_envio_id) REFERENCES campania_envios(id) ON DELETE SET NULL
);

ALTER TABLE public."hermes_whatsapp_queue" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_hermes_whatsapp_queue_claim ON public.hermes_whatsapp_queue USING btree (estado, created_at) WHERE (estado = 'pendiente'::text);
CREATE INDEX idx_hermes_whatsapp_queue_jid_sent ON public.hermes_whatsapp_queue USING btree (jid, procesado_at DESC) WHERE (estado = 'enviado'::text);
CREATE POLICY "wa_queue_read_admin" ON public."hermes_whatsapp_queue" FOR SELECT TO authenticated USING (es_admin());
CREATE POLICY "wa_queue_service_role_all" ON public."hermes_whatsapp_queue" FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."historial_estado_alumno"
-- ----------------------------------------------------------------------------
CREATE TABLE public."historial_estado_alumno" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "alumno_id" uuid NOT NULL,
  "estado" text NOT NULL,
  "motivo" text,
  "registrado_por" uuid,
  "fecha" date DEFAULT CURRENT_DATE NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "historial_estado_alumno_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "historial_estado_alumno_alumno_id_fkey" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE
);

ALTER TABLE public."historial_estado_alumno" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."historial_estado_alumno"."estado" IS 'activo | baja_voluntaria | baja_academica | suspendido | egresado';
COMMENT ON TABLE public."historial_estado_alumno" IS 'Tracking de altas, bajas y reactivaciones de alumnos';
CREATE INDEX idx_historial_alumno ON public.historial_estado_alumno USING btree (alumno_id, fecha DESC);
CREATE POLICY "historial_admin_read" ON public."historial_estado_alumno" FOR SELECT USING (es_admin());

-- ----------------------------------------------------------------------------
-- Tabla: public."homework_assignments"
-- ----------------------------------------------------------------------------
CREATE TABLE public."homework_assignments" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "class_event_id" uuid NOT NULL,
  "student_id" uuid NOT NULL,
  "teacher_id" uuid NOT NULL,
  "node_id" uuid,
  "description" text NOT NULL,
  "due_date" date,
  "status" text DEFAULT 'assigned'::text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "homework_assignments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "homework_assignments_status_check" CHECK ((status = ANY (ARRAY['assigned'::text, 'completed'::text, 'overdue'::text]))),
  CONSTRAINT "homework_assignments_class_event_id_fkey" FOREIGN KEY (class_event_id) REFERENCES class_events(id) ON DELETE CASCADE,
  CONSTRAINT "homework_assignments_node_id_fkey" FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE SET NULL,
  CONSTRAINT "homework_assignments_student_id_fkey" FOREIGN KEY (student_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  CONSTRAINT "homework_assignments_teacher_id_fkey" FOREIGN KEY (teacher_id) REFERENCES maestros(id) ON DELETE CASCADE
);

ALTER TABLE public."homework_assignments" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."homework_assignments" IS 'Formal homework assignments with optional node link and due date.';
CREATE INDEX idx_homework_due_date ON public.homework_assignments USING btree (due_date);
CREATE INDEX idx_homework_event ON public.homework_assignments USING btree (class_event_id);
CREATE INDEX idx_homework_student ON public.homework_assignments USING btree (student_id);
CREATE INDEX idx_homework_teacher ON public.homework_assignments USING btree (teacher_id);
CREATE POLICY "homework_assignments_admin_read" ON public."homework_assignments" FOR SELECT USING (es_admin());
CREATE POLICY "hw_delete_all" ON public."homework_assignments" FOR DELETE USING (true);
CREATE POLICY "hw_insert_all" ON public."homework_assignments" FOR INSERT WITH CHECK (true);
CREATE POLICY "hw_select_all" ON public."homework_assignments" FOR SELECT USING (true);
CREATE POLICY "hw_update_all" ON public."homework_assignments" FOR UPDATE USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."horarios"
-- ----------------------------------------------------------------------------
CREATE TABLE public."horarios" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "clase_id" uuid NOT NULL,
  "maestro_id" uuid NOT NULL,
  "salon_id" uuid NOT NULL,
  "dia_semana" integer NOT NULL,
  "hora_inicio" time without time zone NOT NULL,
  "hora_fin" time without time zone NOT NULL,
  "activo" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "horarios_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "horarios_clase_unico" UNIQUE (clase_id, dia_semana, hora_inicio, hora_fin),
  CONSTRAINT "horarios_dia_semana_check" CHECK (((dia_semana >= 1) AND (dia_semana <= 7))),
  CONSTRAINT "horarios_hora_check" CHECK ((hora_fin > hora_inicio)),
  CONSTRAINT "horarios_maestro_unico" UNIQUE (maestro_id, dia_semana, hora_inicio, hora_fin),
  CONSTRAINT "horarios_salon_unico" UNIQUE (salon_id, dia_semana, hora_inicio, hora_fin),
  CONSTRAINT "fk_horarios_clase" FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE,
  CONSTRAINT "fk_horarios_maestro" FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE RESTRICT,
  CONSTRAINT "fk_horarios_salon" FOREIGN KEY (salon_id) REFERENCES salones(id) ON DELETE RESTRICT
);

ALTER TABLE public."horarios" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX horarios_clase_unico ON public.horarios USING btree (clase_id, dia_semana, hora_inicio, hora_fin);
CREATE UNIQUE INDEX horarios_maestro_unico ON public.horarios USING btree (maestro_id, dia_semana, hora_inicio, hora_fin);
CREATE UNIQUE INDEX horarios_salon_unico ON public.horarios USING btree (salon_id, dia_semana, hora_inicio, hora_fin);
CREATE INDEX idx_horarios_clase ON public.horarios USING btree (clase_id);
CREATE INDEX idx_horarios_dia ON public.horarios USING btree (dia_semana);
CREATE INDEX idx_horarios_maestro ON public.horarios USING btree (maestro_id);
CREATE INDEX idx_horarios_salon ON public.horarios USING btree (salon_id);
CREATE POLICY "Permitir actualizar horarios" ON public."horarios" FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir crear horarios" ON public."horarios" FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir eliminar horarios" ON public."horarios" FOR DELETE USING (true);
CREATE POLICY "horarios_admin_read" ON public."horarios" FOR SELECT USING (es_admin());
CREATE POLICY "horarios_authenticated_all" ON public."horarios" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."indicador_prerequisito"
-- ----------------------------------------------------------------------------
CREATE TABLE public."indicador_prerequisito" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "indicador_id" uuid NOT NULL,
  "prerequisito_indicador_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "indicador_prerequisito_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "indicador_prerequisito_indicador_id_prerequisito_indicador__key" UNIQUE (indicador_id, prerequisito_indicador_id),
  CONSTRAINT "no_self_reference" CHECK ((indicador_id <> prerequisito_indicador_id)),
  CONSTRAINT "indicador_prerequisito_indicador_id_fkey" FOREIGN KEY (indicador_id) REFERENCES maestro_indicadores(id) ON DELETE CASCADE,
  CONSTRAINT "indicador_prerequisito_prerequisito_indicador_id_fkey" FOREIGN KEY (prerequisito_indicador_id) REFERENCES maestro_indicadores(id)
);

ALTER TABLE public."indicador_prerequisito" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_indicador_prerequisito_indicador ON public.indicador_prerequisito USING btree (indicador_id);
CREATE INDEX idx_indicador_prerequisito_prerequisito ON public.indicador_prerequisito USING btree (prerequisito_indicador_id);
CREATE UNIQUE INDEX indicador_prerequisito_indicador_id_prerequisito_indicador__key ON public.indicador_prerequisito USING btree (indicador_id, prerequisito_indicador_id);
CREATE POLICY "indicador_prerequisito_delete" ON public."indicador_prerequisito" FOR DELETE TO authenticated USING ((es_admin() OR es_coordinador_acm() OR (indicador_id IN ( SELECT maestro_indicadores.id
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
CREATE POLICY "indicador_prerequisito_select" ON public."indicador_prerequisito" FOR SELECT TO authenticated USING ((es_admin() OR es_coordinador_acm() OR (indicador_id IN ( SELECT maestro_indicadores.id
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
CREATE POLICY "indicador_prerequisito_write" ON public."indicador_prerequisito" FOR INSERT TO authenticated WITH CHECK ((es_admin() OR es_coordinador_acm() OR (indicador_id IN ( SELECT maestro_indicadores.id
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

-- ----------------------------------------------------------------------------
-- Tabla: public."indicator_attempts"
-- ----------------------------------------------------------------------------
CREATE TABLE public."indicator_attempts" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "student_id" uuid NOT NULL,
  "indicator_id" uuid NOT NULL,
  "session_id" uuid,
  "result" text,
  "observations" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "node_id" uuid,
  "status" text DEFAULT 'pending'::text,
  "nota" smallint,
  "tarea" text,
  "covered_date" date DEFAULT CURRENT_DATE,
  "covered_by_clase_id" uuid,
  "created_by" uuid NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "indicator_attempts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "indicator_attempts_nota_check" CHECK (((nota >= 1) AND (nota <= 5))),
  CONSTRAINT "uq_attempt_session_indicator_student" UNIQUE (session_id, indicator_id, student_id),
  CONSTRAINT "indicator_attempts_covered_by_clase_id_fkey" FOREIGN KEY (covered_by_clase_id) REFERENCES clases(id) ON DELETE SET NULL,
  CONSTRAINT "indicator_attempts_created_by_fkey" FOREIGN KEY (created_by) REFERENCES maestros(id) ON DELETE SET NULL,
  CONSTRAINT "indicator_attempts_node_id_fkey" FOREIGN KEY (node_id) REFERENCES nodes(id)
);

ALTER TABLE public."indicator_attempts" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."indicator_attempts"."covered_by_clase_id" IS 'Reference to the clase that covered this content';
COMMENT ON COLUMN public."indicator_attempts"."covered_date" IS 'Date when the content was covered in class';
COMMENT ON COLUMN public."indicator_attempts"."nota" IS 'Numeric grade 1-5 from DSL /N syntax';
COMMENT ON COLUMN public."indicator_attempts"."tarea" IS 'Assigned task from DSL {task} syntax';
CREATE INDEX idx_attempts_indicator ON public.indicator_attempts USING btree (indicator_id);
CREATE INDEX idx_attempts_session ON public.indicator_attempts USING btree (session_id);
CREATE INDEX idx_attempts_student ON public.indicator_attempts USING btree (student_id);
CREATE INDEX idx_indicator_attempts_clase ON public.indicator_attempts USING btree (covered_by_clase_id, covered_date DESC);
CREATE INDEX idx_indicator_attempts_covered_date ON public.indicator_attempts USING btree (indicator_id, covered_date DESC);
CREATE INDEX idx_indicator_attempts_created_by ON public.indicator_attempts USING btree (created_by);
CREATE INDEX idx_indicator_attempts_session ON public.indicator_attempts USING btree (session_id);
CREATE INDEX idx_indicator_attempts_student ON public.indicator_attempts USING btree (student_id);
CREATE UNIQUE INDEX uq_attempt_session_indicator_student ON public.indicator_attempts USING btree (session_id, indicator_id, student_id);
CREATE POLICY "admin_read_all_indicator_attempts" ON public."indicator_attempts" FOR SELECT TO authenticated USING (es_admin());
CREATE POLICY "auth_read_class_indicator_attempts" ON public."indicator_attempts" FOR SELECT TO authenticated USING ((covered_by_clase_id IN ( SELECT c.id
   FROM clases c
  WHERE ((c.maestro_principal_id = maestro_actual()) OR (c.maestro_suplente_id = maestro_actual())))));
CREATE POLICY "indicator_attempts_admin_read" ON public."indicator_attempts" FOR SELECT USING (es_admin());
CREATE POLICY "teacher_delete_own_attempts" ON public."indicator_attempts" FOR DELETE TO authenticated USING ((created_by IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))));
CREATE POLICY "teacher_insert_attempts" ON public."indicator_attempts" FOR INSERT TO authenticated WITH CHECK ((created_by IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))));
CREATE POLICY "teacher_read_own_attempts" ON public."indicator_attempts" FOR SELECT TO authenticated USING ((created_by IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))));
CREATE POLICY "teacher_update_own_attempts" ON public."indicator_attempts" FOR UPDATE TO authenticated USING ((created_by IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid())))) WITH CHECK ((created_by IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))));

-- ----------------------------------------------------------------------------
-- Tabla: public."indicator_session_students"
-- ----------------------------------------------------------------------------
CREATE TABLE public."indicator_session_students" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "indicator_session_id" uuid NOT NULL,
  "alumno_id" uuid NOT NULL,
  "nota_cualitativa" character varying(20) NOT NULL,
  "observaciones_individuales" text,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "indicator_session_students_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "indicator_session_students_indicator_session_id_alumno_id_key" UNIQUE (indicator_session_id, alumno_id),
  CONSTRAINT "indicator_session_students_nota_cualitativa_check" CHECK (((nota_cualitativa)::text = ANY ((ARRAY['bien'::character varying, 'regular'::character varying, 'mal'::character varying])::text[]))),
  CONSTRAINT "indicator_session_students_alumno_id_fkey" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  CONSTRAINT "indicator_session_students_indicator_session_id_fkey" FOREIGN KEY (indicator_session_id) REFERENCES indicator_sessions(id) ON DELETE CASCADE
);

ALTER TABLE public."indicator_session_students" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_indicator_session_students_alumno ON public.indicator_session_students USING btree (alumno_id);
CREATE INDEX idx_indicator_session_students_session ON public.indicator_session_students USING btree (indicator_session_id);
CREATE INDEX idx_indicator_session_students_session_alumno ON public.indicator_session_students USING btree (indicator_session_id, alumno_id);
CREATE UNIQUE INDEX indicator_session_students_indicator_session_id_alumno_id_key ON public.indicator_session_students USING btree (indicator_session_id, alumno_id);
CREATE POLICY "bitacora_session_students_insert" ON public."indicator_session_students" FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM indicator_sessions s
  WHERE ((s.id = indicator_session_students.indicator_session_id) AND (s.maestro_id = maestro_actual())))));
CREATE POLICY "bitacora_session_students_select" ON public."indicator_session_students" FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM indicator_sessions s
  WHERE ((s.id = indicator_session_students.indicator_session_id) AND (s.maestro_id = maestro_actual())))));

-- ----------------------------------------------------------------------------
-- Tabla: public."indicator_sessions"
-- ----------------------------------------------------------------------------
CREATE TABLE public."indicator_sessions" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "maestro_id" uuid NOT NULL,
  "clase_id" uuid NOT NULL,
  "fecha" date NOT NULL,
  "descripcion" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "objetivo_id" uuid NOT NULL,
  CONSTRAINT "indicator_sessions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "indicator_sessions_unique_session" UNIQUE (clase_id, objetivo_id, fecha, maestro_id),
  CONSTRAINT "indicator_sessions_clase_id_fkey" FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE RESTRICT,
  CONSTRAINT "indicator_sessions_maestro_id_fkey" FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE,
  CONSTRAINT "indicator_sessions_objetivo_id_fkey" FOREIGN KEY (objetivo_id) REFERENCES ruta_contenido_objetivos(id) ON DELETE RESTRICT
);

ALTER TABLE public."indicator_sessions" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_indicator_sessions_clase ON public.indicator_sessions USING btree (clase_id);
CREATE INDEX idx_indicator_sessions_fecha ON public.indicator_sessions USING btree (fecha DESC);
CREATE INDEX idx_indicator_sessions_maestro ON public.indicator_sessions USING btree (maestro_id);
CREATE INDEX idx_indicator_sessions_objetivo ON public.indicator_sessions USING btree (objetivo_id);
CREATE UNIQUE INDEX indicator_sessions_unique_session ON public.indicator_sessions USING btree (clase_id, objetivo_id, fecha, maestro_id);
CREATE POLICY "bitacora_indicator_sessions_insert" ON public."indicator_sessions" FOR INSERT TO authenticated WITH CHECK (((maestro_id = maestro_actual()) AND maestro_en_clase(clase_id)));
CREATE POLICY "bitacora_indicator_sessions_select" ON public."indicator_sessions" FOR SELECT TO authenticated USING ((maestro_id = maestro_actual()));
CREATE POLICY "bitacora_indicator_sessions_update" ON public."indicator_sessions" FOR UPDATE TO authenticated USING ((maestro_id = maestro_actual())) WITH CHECK (((maestro_id = maestro_actual()) AND maestro_en_clase(clase_id)));

-- ----------------------------------------------------------------------------
-- Tabla: public."indicators"
-- ----------------------------------------------------------------------------
CREATE TABLE public."indicators" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "node_id" uuid,
  "description" text NOT NULL,
  "minimum_criteria" jsonb DEFAULT '{}'::jsonb,
  "is_required" boolean DEFAULT true NOT NULL,
  "order_index" integer DEFAULT 0 NOT NULL,
  "nombre" text,
  "activo" boolean DEFAULT true NOT NULL,
  "objetivo_id" uuid,
  CONSTRAINT "indicators_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "indicators_node_id_fkey" FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE,
  CONSTRAINT "indicators_objetivo_id_fkey" FOREIGN KEY (objetivo_id) REFERENCES objetivos(id) ON DELETE SET NULL
);

ALTER TABLE public."indicators" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."indicators"."activo" IS 'Soft delete flag — inactive indicators hidden from teacher UI';
COMMENT ON COLUMN public."indicators"."nombre" IS 'Short display name for the indicator (shown in tree and DSL autocomplete)';
COMMENT ON COLUMN public."indicators"."objetivo_id" IS 'FK explícita al objetivo al que pertenece el indicador.';
CREATE INDEX idx_indicators_node ON public.indicators USING btree (node_id);
CREATE INDEX idx_indicators_objetivo_id ON public.indicators USING btree (objetivo_id);
CREATE POLICY "Maestros pueden leer indicadores" ON public."indicators" FOR SELECT TO authenticated USING (true);
CREATE POLICY "indicators_admin_read" ON public."indicators" FOR SELECT USING (es_admin());
CREATE POLICY "maestros_write_own_draft_indicators" ON public."indicators" FOR ALL USING ((node_id IN ( SELECT n.id
   FROM (nodes n
     JOIN route_versions rv ON ((rv.id = n.route_version_id)))
  WHERE ((rv.created_by = auth.uid()) AND (rv.status = 'draft'::route_status))))) WITH CHECK ((node_id IN ( SELECT n.id
   FROM (nodes n
     JOIN route_versions rv ON ((rv.id = n.route_version_id)))
  WHERE ((rv.created_by = auth.uid()) AND (rv.status = 'draft'::route_status)))));

-- ----------------------------------------------------------------------------
-- Tabla: public."instrumentos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."instrumentos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "codigo" text,
  "nombre" text NOT NULL,
  "tipo" text,
  "marca" text,
  "serie" text,
  "estado" text DEFAULT 'disponible'::text NOT NULL,
  "alumno_id" uuid,
  "alumno_nombre" text,
  "notas" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "instrumentos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "instrumentos_codigo_key" UNIQUE (codigo),
  CONSTRAINT "instrumentos_estado_check" CHECK ((estado = ANY (ARRAY['disponible'::text, 'asignado'::text, 'danado'::text, 'en_reparacion'::text, 'fuera_de_uso'::text])))
);

ALTER TABLE public."instrumentos" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_instrumentos_alumno ON public.instrumentos USING btree (alumno_id);
CREATE INDEX idx_instrumentos_estado ON public.instrumentos USING btree (estado);
CREATE UNIQUE INDEX instrumentos_codigo_key ON public.instrumentos USING btree (codigo);
CREATE POLICY "instrumentos_auth_all" ON public."instrumentos" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."inventario_accesorios"
-- ----------------------------------------------------------------------------
CREATE TABLE public."inventario_accesorios" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "activo_id" uuid,
  "tipo" character varying(50) NOT NULL,
  "marca" character varying(100),
  "cantidad" integer DEFAULT 1 NOT NULL,
  "estado" character varying(50) DEFAULT 'disponible'::character varying NOT NULL,
  "fecha_asignacion" date,
  "observaciones" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "inventario_accesorios_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "inventario_accesorios_cantidad_check" CHECK ((cantidad >= 0)),
  CONSTRAINT "inventario_accesorios_estado_check" CHECK (((estado)::text = ANY ((ARRAY['disponible'::character varying, 'asignado'::character varying, 'agotado'::character varying])::text[]))),
  CONSTRAINT "inventario_accesorios_tipo_check" CHECK (((tipo)::text = ANY ((ARRAY['funda'::character varying, 'arco'::character varying, 'cuerdas'::character varying, 'boquilla'::character varying, 'atril'::character varying, 'parlante'::character varying, 'cable'::character varying, 'otro'::character varying])::text[]))),
  CONSTRAINT "inventario_accesorios_activo_id_fkey" FOREIGN KEY (activo_id) REFERENCES inventario_activos(id) ON DELETE CASCADE
);

ALTER TABLE public."inventario_accesorios" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."inventario_accesorios" IS 'Accesorios asociados a instrumentos (fundas, arcos, cuerdas, etc.)';
CREATE INDEX idx_accesorios_activo ON public.inventario_accesorios USING btree (activo_id);
CREATE INDEX idx_accesorios_tipo ON public.inventario_accesorios USING btree (tipo);
CREATE POLICY "accesorios_admin_delete" ON public."inventario_accesorios" FOR DELETE TO authenticated USING (es_admin());
CREATE POLICY "accesorios_admin_insert" ON public."inventario_accesorios" FOR INSERT TO authenticated WITH CHECK (es_admin());
CREATE POLICY "accesorios_admin_update" ON public."inventario_accesorios" FOR UPDATE TO authenticated USING (es_admin());
CREATE POLICY "accesorios_authenticated_select" ON public."inventario_accesorios" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."inventario_activos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."inventario_activos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "tipo_instrumento" character varying(100) NOT NULL,
  "marca" character varying(100),
  "modelo" character varying(100),
  "numero_serie" character varying(100),
  "codigo_inventario" character varying(50) NOT NULL,
  "estado_conservacion" character varying(50) DEFAULT 'bueno'::character varying NOT NULL,
  "estado_uso" character varying(50) DEFAULT 'disponible'::character varying NOT NULL,
  "ubicacion" character varying(100) DEFAULT 'Sede Principal'::character varying NOT NULL,
  "activo" boolean DEFAULT true NOT NULL,
  "notas" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "fecha_adquisicion" date,
  "valor_adquisicion" numeric,
  "fecha_baja" date,
  "motivo_baja" text,
  "foto_url" character varying(500),
  "proveedor" character varying(200),
  "familia" text,
  "nombre_normalizado" text,
  "tamano" text,
  "cantidad" numeric DEFAULT 1,
  "unidad" text DEFAULT 'unidad'::text,
  "estado_asignacion_original" text,
  "asignado_a_texto" text,
  "requiere_mantenimiento" boolean DEFAULT false,
  "tiene_arco" boolean,
  "tiene_estuche" boolean,
  "tiene_funda" boolean,
  "tiene_hombrera_almohadilla" boolean,
  "faltantes_detectados" text,
  "donante_inferido" text,
  "codigo_donante" text,
  "fuente_importacion" text,
  "numero_original" text,
  "fila_origen_csv" integer,
  "revisar" boolean DEFAULT false,
  "alertas_calidad" text,
  "import_metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  CONSTRAINT "inventario_activos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "inventario_activos_codigo_inventario_key" UNIQUE (codigo_inventario),
  CONSTRAINT "inventario_activos_estado_conservacion_check" CHECK (((estado_conservacion)::text = ANY ((ARRAY['excelente'::character varying, 'bueno'::character varying, 'regular'::character varying, 'mantenimiento'::character varying, 'de_baja'::character varying])::text[]))),
  CONSTRAINT "inventario_activos_estado_uso_check" CHECK (((estado_uso)::text = ANY ((ARRAY['disponible'::character varying, 'prestado'::character varying, 'en_mantenimiento'::character varying, 'en_reparacion'::character varying, 'de_baja'::character varying])::text[])))
);

ALTER TABLE public."inventario_activos" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."inventario_activos"."fecha_adquisicion" IS 'Fecha de compra del instrumento';
COMMENT ON COLUMN public."inventario_activos"."fecha_baja" IS 'Fecha en que se dio de baja';
COMMENT ON COLUMN public."inventario_activos"."foto_url" IS 'URL de foto del instrumento';
COMMENT ON COLUMN public."inventario_activos"."motivo_baja" IS 'Motivo de la baja';
COMMENT ON COLUMN public."inventario_activos"."proveedor" IS 'Proveedor o tienda de compra';
COMMENT ON COLUMN public."inventario_activos"."valor_adquisicion" IS 'Valor de compra original';
COMMENT ON TABLE public."inventario_activos" IS 'Catálogo de instrumentos. estado_uso lo gestiona el trigger trg_comodato_sync_estado_uso.';
CREATE INDEX idx_inventario_activos_asignado_a_texto ON public.inventario_activos USING btree (asignado_a_texto) WHERE (asignado_a_texto IS NOT NULL);
CREATE INDEX idx_inventario_activos_familia ON public.inventario_activos USING btree (familia) WHERE (activo = true);
CREATE INDEX idx_inventario_activos_requiere_mantenimiento ON public.inventario_activos USING btree (requiere_mantenimiento) WHERE (activo = true);
CREATE INDEX idx_inventario_activos_tipo ON public.inventario_activos USING btree (tipo_instrumento) WHERE (activo = true);
CREATE INDEX idx_inventario_estado_uso ON public.inventario_activos USING btree (estado_uso) WHERE (activo = true);
CREATE UNIQUE INDEX inventario_activos_codigo_inventario_key ON public.inventario_activos USING btree (codigo_inventario);
CREATE POLICY "inventario_admin_insert" ON public."inventario_activos" FOR INSERT TO authenticated WITH CHECK (es_admin());
CREATE POLICY "inventario_admin_update" ON public."inventario_activos" FOR UPDATE TO authenticated USING (es_admin());
CREATE POLICY "inventario_authenticated_select" ON public."inventario_activos" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."inventario_historial"
-- ----------------------------------------------------------------------------
CREATE TABLE public."inventario_historial" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "activo_id" uuid NOT NULL,
  "tipo_evento" character varying(50) NOT NULL,
  "descripcion" text NOT NULL,
  "fecha" timestamp with time zone DEFAULT now() NOT NULL,
  "usuario_id" uuid,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "inventario_historial_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "inventario_historial_tipo_evento_check" CHECK (((tipo_evento)::text = ANY ((ARRAY['asignacion'::character varying, 'devolucion'::character varying, 'reparacion'::character varying, 'cambio_estado'::character varying, 'baja'::character varying, 'creacion'::character varying, 'observacion'::character varying, 'intercambio'::character varying, 'renovacion'::character varying])::text[]))),
  CONSTRAINT "inventario_historial_activo_id_fkey" FOREIGN KEY (activo_id) REFERENCES inventario_activos(id) ON DELETE CASCADE,
  CONSTRAINT "inventario_historial_usuario_id_fkey" FOREIGN KEY (usuario_id) REFERENCES auth.users(id)
);

ALTER TABLE public."inventario_historial" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."inventario_historial" IS 'Historial de eventos de instrumentos. Se inserta automáticamente via triggers.';
CREATE INDEX idx_historial_activo_fecha ON public.inventario_historial USING btree (activo_id, fecha DESC);
CREATE INDEX idx_historial_tipo_evento ON public.inventario_historial USING btree (tipo_evento);
CREATE POLICY "historial_admin_delete" ON public."inventario_historial" FOR DELETE TO authenticated USING (es_admin());
CREATE POLICY "historial_admin_insert" ON public."inventario_historial" FOR INSERT TO authenticated WITH CHECK (es_admin());
CREATE POLICY "historial_authenticated_select" ON public."inventario_historial" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."inventario_materiales"
-- ----------------------------------------------------------------------------
CREATE TABLE public."inventario_materiales" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "item" text NOT NULL,
  "categoria" text,
  "familia_instrumento" text,
  "marca" text,
  "modelo" text,
  "cantidad" numeric,
  "unidad" text DEFAULT 'unidad'::text NOT NULL,
  "descripcion" text,
  "ubicacion" text,
  "activo" boolean DEFAULT true NOT NULL,
  "fuente_importacion" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "inventario_materiales_pkey" PRIMARY KEY ("id")
);

ALTER TABLE public."inventario_materiales" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "materiales_admin_delete" ON public."inventario_materiales" FOR DELETE TO authenticated USING (es_admin());
CREATE POLICY "materiales_admin_insert" ON public."inventario_materiales" FOR INSERT TO authenticated WITH CHECK (es_admin());
CREATE POLICY "materiales_admin_update" ON public."inventario_materiales" FOR UPDATE TO authenticated USING (es_admin());
CREATE POLICY "materiales_authenticated_select" ON public."inventario_materiales" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."inventario_reparaciones"
-- ----------------------------------------------------------------------------
CREATE TABLE public."inventario_reparaciones" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "activo_id" uuid NOT NULL,
  "tipo_tallerista" character varying(50) NOT NULL,
  "tallerista_nombre" character varying(200) NOT NULL,
  "descripcion" text NOT NULL,
  "costo_estimado" numeric,
  "costo_real" numeric,
  "fecha_ingreso" date DEFAULT CURRENT_DATE NOT NULL,
  "fecha_egreso" date,
  "estado" character varying(50) DEFAULT 'recibido'::character varying NOT NULL,
  "proveedor_factura_url" character varying(500),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "inventario_reparaciones_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "inventario_reparaciones_costo_estimado_check" CHECK ((costo_estimado >= (0)::numeric)),
  CONSTRAINT "inventario_reparaciones_costo_real_check" CHECK ((costo_real >= (0)::numeric)),
  CONSTRAINT "inventario_reparaciones_estado_check" CHECK (((estado)::text = ANY ((ARRAY['recibido'::character varying, 'en_reparacion'::character varying, 'finalizado'::character varying, 'entregado'::character varying])::text[]))),
  CONSTRAINT "inventario_reparaciones_tipo_tallerista_check" CHECK (((tipo_tallerista)::text = ANY ((ARRAY['externo'::character varying, 'luthier_interno'::character varying])::text[]))),
  CONSTRAINT "inventario_reparaciones_activo_id_fkey" FOREIGN KEY (activo_id) REFERENCES inventario_activos(id) ON DELETE RESTRICT
);

ALTER TABLE public."inventario_reparaciones" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."inventario_reparaciones" IS 'Reparaciones de instrumentos. estado controla el flujo: recibido → en_reparacion → finalizado → entregado';
CREATE INDEX idx_reparaciones_activo_estado ON public.inventario_reparaciones USING btree (activo_id, estado);
CREATE INDEX idx_reparaciones_estado ON public.inventario_reparaciones USING btree (estado);
CREATE POLICY "reparaciones_admin_delete" ON public."inventario_reparaciones" FOR DELETE TO authenticated USING (es_admin());
CREATE POLICY "reparaciones_admin_insert" ON public."inventario_reparaciones" FOR INSERT TO authenticated WITH CHECK (es_admin());
CREATE POLICY "reparaciones_admin_update" ON public."inventario_reparaciones" FOR UPDATE TO authenticated USING (es_admin());
CREATE POLICY "reparaciones_authenticated_select" ON public."inventario_reparaciones" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."justificaciones"
-- ----------------------------------------------------------------------------
CREATE TABLE public."justificaciones" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "sesion_id" uuid,
  "alumno_id" uuid NOT NULL,
  "clase_id" uuid,
  "fecha" date NOT NULL,
  "motivo" text NOT NULL,
  "evidencia_url" text,
  "evidencia_base64" text,
  "creado_por" uuid,
  "estado" text DEFAULT 'pendiente'::text NOT NULL,
  "revisado_por" uuid,
  "fecha_revision" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "categoria" text,
  CONSTRAINT "justificaciones_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "justificaciones_categoria_check" CHECK (((categoria IS NULL) OR (categoria = ANY (ARRAY['medica'::text, 'familiar'::text, 'academica'::text, 'institucional'::text, 'religiosa'::text, 'transporte'::text, 'otra'::text])))),
  CONSTRAINT "justificaciones_estado_check" CHECK ((estado = ANY (ARRAY['pendiente'::text, 'aprobado'::text, 'rechazado'::text]))),
  CONSTRAINT "justificaciones_sesion_id_alumno_id_key" UNIQUE (sesion_id, alumno_id),
  CONSTRAINT "justificaciones_creado_por_fkey" FOREIGN KEY (creado_por) REFERENCES maestros(id),
  CONSTRAINT "justificaciones_revisado_por_fkey" FOREIGN KEY (revisado_por) REFERENCES maestros(id),
  CONSTRAINT "justificaciones_sesion_id_fkey" FOREIGN KEY (sesion_id) REFERENCES sesiones_clase(id) ON DELETE CASCADE
);

ALTER TABLE public."justificaciones" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."justificaciones"."categoria" IS 'Causal normalizada para agregacion en informes. NULL = sin clasificar; el informe la reporta como SIN_CLASIFICAR en vez de asumir una categoria.';
COMMENT ON COLUMN public."justificaciones"."clase_id" IS 'Clase asociada. NULL para justificaciones registradas en sesiones emergentes (sin clase programada).';
COMMENT ON COLUMN public."justificaciones"."estado" IS 'Estado de la justificación: pendiente/aprobado/rechazado';
COMMENT ON COLUMN public."justificaciones"."evidencia_base64" IS 'Imagen en base64 como evidencia opcional';
COMMENT ON COLUMN public."justificaciones"."evidencia_url" IS 'URL de archivo de evidencia (futuro, para storage)';
COMMENT ON COLUMN public."justificaciones"."motivo" IS 'Texto explicando el motivo de la ausencia';
COMMENT ON TABLE public."justificaciones" IS 'Registro de justificaciones de inasistencias de alumnos';
CREATE INDEX idx_justificaciones_alumno ON public.justificaciones USING btree (alumno_id);
CREATE INDEX idx_justificaciones_categoria ON public.justificaciones USING btree (categoria) WHERE (categoria IS NOT NULL);
CREATE INDEX idx_justificaciones_clase ON public.justificaciones USING btree (clase_id);
CREATE INDEX idx_justificaciones_fecha ON public.justificaciones USING btree (fecha);
CREATE INDEX idx_justificaciones_sesion ON public.justificaciones USING btree (sesion_id);
CREATE UNIQUE INDEX justificaciones_sesion_id_alumno_id_key ON public.justificaciones USING btree (sesion_id, alumno_id);
CREATE POLICY "justificaciones_admin_insert" ON public."justificaciones" FOR INSERT TO authenticated WITH CHECK ((es_admin() OR maestro_en_clase(clase_id)));
CREATE POLICY "justificaciones_admin_select" ON public."justificaciones" FOR SELECT TO authenticated USING ((es_admin() OR maestro_en_clase(clase_id)));
CREATE POLICY "justificaciones_admin_update" ON public."justificaciones" FOR UPDATE TO authenticated USING ((es_admin() OR maestro_en_clase(clase_id))) WITH CHECK ((es_admin() OR maestro_en_clase(clase_id)));
CREATE POLICY "justificaciones_superadmin_delete" ON public."justificaciones" FOR DELETE TO authenticated USING ((( SELECT is_super_admin() AS is_super_admin) = true));
CREATE POLICY "teacher_manage_justificaciones" ON public."justificaciones" FOR ALL TO authenticated USING ((creado_por IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid())))) WITH CHECK ((creado_por IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))));

-- ----------------------------------------------------------------------------
-- Tabla: public."levels"
-- ----------------------------------------------------------------------------
CREATE TABLE public."levels" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "block_id" uuid,
  "route_version_id" uuid NOT NULL,
  "level_number" integer NOT NULL,
  "name" text NOT NULL,
  "main_objective" text,
  "suggested_duration_value" integer,
  "suggested_duration_unit" text,
  "is_flexible_duration" boolean DEFAULT true NOT NULL,
  "target_work" jsonb DEFAULT '{}'::jsonb,
  "unlock_criteria" jsonb DEFAULT '{}'::jsonb,
  "order_index" integer DEFAULT 0 NOT NULL,
  CONSTRAINT "levels_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "levels_route_version_id_level_number_key" UNIQUE (route_version_id, level_number),
  CONSTRAINT "levels_block_id_fkey" FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE CASCADE,
  CONSTRAINT "levels_route_version_id_fkey" FOREIGN KEY (route_version_id) REFERENCES route_versions(id) ON DELETE CASCADE
);

ALTER TABLE public."levels" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_levels_number ON public.levels USING btree (level_number);
CREATE INDEX idx_levels_route_version ON public.levels USING btree (route_version_id);
CREATE UNIQUE INDEX levels_route_version_id_level_number_key ON public.levels USING btree (route_version_id, level_number);
CREATE POLICY "Maestros pueden leer niveles" ON public."levels" FOR SELECT TO authenticated USING (true);
CREATE POLICY "levels_admin_read" ON public."levels" FOR SELECT USING (es_admin());
CREATE POLICY "maestros_write_own_draft_levels" ON public."levels" FOR ALL USING ((route_version_id IN ( SELECT route_versions.id
   FROM route_versions
  WHERE ((route_versions.created_by = auth.uid()) AND (route_versions.status = 'draft'::route_status))))) WITH CHECK ((route_version_id IN ( SELECT route_versions.id
   FROM route_versions
  WHERE ((route_versions.created_by = auth.uid()) AND (route_versions.status = 'draft'::route_status)))));

-- ----------------------------------------------------------------------------
-- Tabla: public."logros"
-- ----------------------------------------------------------------------------
CREATE TABLE public."logros" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "nombre" text NOT NULL,
  "descripcion" text,
  "criterio" jsonb DEFAULT '{}'::jsonb,
  "icono" text,
  "activo" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "logros_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "logros_nombre_key" UNIQUE (nombre)
);

ALTER TABLE public."logros" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX logros_nombre_key ON public.logros USING btree (nombre);
CREATE POLICY "logros_admin_read" ON public."logros" FOR SELECT USING (es_admin());
CREATE POLICY "logros_authenticated_all" ON public."logros" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."lut_diagnosticos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."lut_diagnosticos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "orden_id" uuid NOT NULL,
  "diagnostico_tecnico" text NOT NULL,
  "causa_probable" text,
  "tipo_dano" text,
  "gravedad" text,
  "zona_afectada" text,
  "reparacion_recomendada" text,
  "materiales_requeridos" text,
  "tiempo_estimado_horas" numeric,
  "costo_mano_obra" numeric,
  "costo_materiales" numeric,
  "requiere_servicio_externo" boolean DEFAULT false NOT NULL,
  "observaciones" text,
  "diagnosticado_por" uuid,
  "diagnosticado_por_nombre" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "items" jsonb DEFAULT '[]'::jsonb NOT NULL,
  CONSTRAINT "lut_diagnosticos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "lut_diagnosticos_gravedad_check" CHECK ((gravedad = ANY (ARRAY['leve'::text, 'moderada'::text, 'grave'::text, 'critica'::text]))),
  CONSTRAINT "lut_diagnosticos_orden_id_fkey" FOREIGN KEY (orden_id) REFERENCES lut_ordenes_reparacion(id) ON DELETE CASCADE
);

ALTER TABLE public."lut_diagnosticos" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."lut_diagnosticos"."items" IS 'Loop 19: lista de ítems de cotización del diagnóstico. Formato: [{nombre, costo_dop, orden}].';
CREATE INDEX idx_lut_diagnosticos_orden ON public.lut_diagnosticos USING btree (orden_id);
CREATE POLICY "lut_diagnosticos_auth_all" ON public."lut_diagnosticos" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."lut_evidencias"
-- ----------------------------------------------------------------------------
CREATE TABLE public."lut_evidencias" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "orden_id" uuid NOT NULL,
  "tipo" text NOT NULL,
  "nombre" text,
  "storage_path" text,
  "descripcion" text,
  "visibilidad" text DEFAULT 'interno'::text NOT NULL,
  "subido_por" uuid,
  "subido_por_nombre" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "lut_evidencias_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "lut_evidencias_tipo_check" CHECK ((tipo = ANY (ARRAY['foto_antes'::text, 'foto_durante'::text, 'foto_despues'::text, 'documento'::text, 'video'::text, 'factura'::text, 'informe'::text]))),
  CONSTRAINT "lut_evidencias_visibilidad_check" CHECK ((visibilidad = ANY (ARRAY['interno'::text, 'finanzas'::text, 'representante'::text, 'publico'::text]))),
  CONSTRAINT "lut_evidencias_orden_id_fkey" FOREIGN KEY (orden_id) REFERENCES lut_ordenes_reparacion(id) ON DELETE CASCADE
);

ALTER TABLE public."lut_evidencias" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_lut_evidencias_orden ON public.lut_evidencias USING btree (orden_id);
CREATE POLICY "lut_evidencias_auth_all" ON public."lut_evidencias" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."lut_insumos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."lut_insumos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "nombre" text NOT NULL,
  "categoria" text,
  "unidad" text DEFAULT 'unidad'::text NOT NULL,
  "stock_actual" numeric DEFAULT 0 NOT NULL,
  "stock_minimo" numeric DEFAULT 0 NOT NULL,
  "costo_unitario" numeric,
  "proveedor_sugerido" text,
  "activo" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "lut_insumos_pkey" PRIMARY KEY ("id")
);

ALTER TABLE public."lut_insumos" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_lut_insumos_activo ON public.lut_insumos USING btree (activo);
CREATE INDEX idx_lut_insumos_categoria ON public.lut_insumos USING btree (categoria);
CREATE POLICY "lut_insumos_auth_all" ON public."lut_insumos" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."lut_movimientos_insumos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."lut_movimientos_insumos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "insumo_id" uuid NOT NULL,
  "orden_id" uuid,
  "tipo_movimiento" text NOT NULL,
  "cantidad" numeric NOT NULL,
  "costo_unitario" numeric,
  "registrado_por" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "lut_movimientos_insumos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "lut_movimientos_insumos_tipo_movimiento_check" CHECK ((tipo_movimiento = ANY (ARRAY['entrada'::text, 'consumo'::text, 'ajuste'::text, 'devolucion'::text, 'perdida'::text]))),
  CONSTRAINT "lut_movimientos_insumos_insumo_id_fkey" FOREIGN KEY (insumo_id) REFERENCES lut_insumos(id) ON DELETE RESTRICT,
  CONSTRAINT "lut_movimientos_insumos_orden_id_fkey" FOREIGN KEY (orden_id) REFERENCES lut_ordenes_reparacion(id) ON DELETE SET NULL
);

ALTER TABLE public."lut_movimientos_insumos" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_lut_movimientos_insumo ON public.lut_movimientos_insumos USING btree (insumo_id);
CREATE INDEX idx_lut_movimientos_orden ON public.lut_movimientos_insumos USING btree (orden_id);
CREATE POLICY "lut_movimientos_auth_all" ON public."lut_movimientos_insumos" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."lut_ordenes_reparacion"
-- ----------------------------------------------------------------------------
CREATE TABLE public."lut_ordenes_reparacion" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "correlation_id" uuid,
  "instrumento_id" uuid NOT NULL,
  "alumno_id" uuid,
  "alumno_nombre" text,
  "reportado_por" uuid,
  "reportado_por_nombre" text,
  "recibido_por" uuid,
  "recibido_por_nombre" text,
  "tecnico_responsable" uuid,
  "tecnico_responsable_nombre" text,
  "departamento_origen" text,
  "estado" text DEFAULT 'reportado'::text NOT NULL,
  "prioridad" text DEFAULT 'media'::text NOT NULL,
  "descripcion_inicial" text,
  "diagnostico_resumen" text,
  "tipo_dano" text,
  "gravedad" text,
  "requiere_reemplazo" boolean DEFAULT false NOT NULL,
  "requiere_cobro" boolean DEFAULT false NOT NULL,
  "requiere_aprobacion_direccion" boolean DEFAULT false NOT NULL,
  "costo_estimado" numeric,
  "costo_final" numeric,
  "fecha_recepcion" timestamp with time zone DEFAULT now() NOT NULL,
  "fecha_diagnostico" timestamp with time zone,
  "fecha_inicio_reparacion" timestamp with time zone,
  "fecha_estimada_entrega" timestamp with time zone,
  "fecha_entrega" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "lut_ordenes_reparacion_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "lut_ordenes_reparacion_estado_check" CHECK ((estado = ANY (ARRAY['reportado'::text, 'recibido'::text, 'pendiente_diagnostico'::text, 'diagnosticado'::text, 'presupuesto_pendiente'::text, 'esperando_aprobacion'::text, 'esperando_insumos'::text, 'en_reparacion'::text, 'en_prueba'::text, 'listo_entrega'::text, 'entregado'::text, 'cerrado'::text, 'cancelado'::text]))),
  CONSTRAINT "lut_ordenes_reparacion_gravedad_check" CHECK ((gravedad = ANY (ARRAY['leve'::text, 'moderada'::text, 'grave'::text, 'critica'::text]))),
  CONSTRAINT "lut_ordenes_reparacion_prioridad_check" CHECK ((prioridad = ANY (ARRAY['baja'::text, 'media'::text, 'alta'::text, 'critica'::text]))),
  CONSTRAINT "lut_ordenes_reparacion_instrumento_id_fkey" FOREIGN KEY (instrumento_id) REFERENCES inventario_activos(id)
);

ALTER TABLE public."lut_ordenes_reparacion" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_lut_ordenes_alumno ON public.lut_ordenes_reparacion USING btree (alumno_id);
CREATE INDEX idx_lut_ordenes_correlation ON public.lut_ordenes_reparacion USING btree (correlation_id);
CREATE INDEX idx_lut_ordenes_estado ON public.lut_ordenes_reparacion USING btree (estado);
CREATE INDEX idx_lut_ordenes_instrumento ON public.lut_ordenes_reparacion USING btree (instrumento_id);
CREATE POLICY "lut_ordenes_auth_all" ON public."lut_ordenes_reparacion" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."lut_presupuestos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."lut_presupuestos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "orden_id" uuid NOT NULL,
  "estado" text DEFAULT 'borrador'::text NOT NULL,
  "subtotal_mano_obra" numeric DEFAULT 0 NOT NULL,
  "subtotal_materiales" numeric DEFAULT 0 NOT NULL,
  "subtotal_servicios_externos" numeric DEFAULT 0 NOT NULL,
  "descuento" numeric DEFAULT 0 NOT NULL,
  "monto_institucion" numeric DEFAULT 0 NOT NULL,
  "monto_representante" numeric DEFAULT 0 NOT NULL,
  "total" numeric,
  "aprobado_por" uuid,
  "aprobado_en" timestamp with time zone,
  "observaciones" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "lut_presupuestos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "lut_presupuestos_estado_check" CHECK ((estado = ANY (ARRAY['borrador'::text, 'enviado'::text, 'aprobado'::text, 'rechazado'::text, 'cubierto_institucion'::text]))),
  CONSTRAINT "lut_presupuestos_orden_id_fkey" FOREIGN KEY (orden_id) REFERENCES lut_ordenes_reparacion(id) ON DELETE CASCADE
);

ALTER TABLE public."lut_presupuestos" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_lut_presupuestos_orden ON public.lut_presupuestos USING btree (orden_id);
CREATE POLICY "lut_presupuestos_auth_all" ON public."lut_presupuestos" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."lut_solicitudes_compra"
-- ----------------------------------------------------------------------------
CREATE TABLE public."lut_solicitudes_compra" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "orden_id" uuid,
  "insumo_id" uuid,
  "cantidad_solicitada" numeric NOT NULL,
  "justificacion" text,
  "urgencia" text DEFAULT 'media'::text NOT NULL,
  "costo_estimado" numeric,
  "proveedor_sugerido" text,
  "estado" text DEFAULT 'pendiente'::text NOT NULL,
  "solicitado_por" uuid,
  "aprobado_por" uuid,
  "fecha_requerida" date,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "lut_solicitudes_compra_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "lut_solicitudes_compra_estado_check" CHECK ((estado = ANY (ARRAY['pendiente'::text, 'aprobada'::text, 'rechazada'::text, 'comprada'::text, 'cancelada'::text]))),
  CONSTRAINT "lut_solicitudes_compra_urgencia_check" CHECK ((urgencia = ANY (ARRAY['baja'::text, 'media'::text, 'alta'::text, 'critica'::text]))),
  CONSTRAINT "lut_solicitudes_compra_insumo_id_fkey" FOREIGN KEY (insumo_id) REFERENCES lut_insumos(id) ON DELETE SET NULL,
  CONSTRAINT "lut_solicitudes_compra_orden_id_fkey" FOREIGN KEY (orden_id) REFERENCES lut_ordenes_reparacion(id) ON DELETE SET NULL
);

ALTER TABLE public."lut_solicitudes_compra" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_lut_solicitudes_estado ON public.lut_solicitudes_compra USING btree (estado);
CREATE INDEX idx_lut_solicitudes_orden ON public.lut_solicitudes_compra USING btree (orden_id);
CREATE POLICY "lut_solicitudes_auth_all" ON public."lut_solicitudes_compra" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."maestro_access_credentials"
-- ----------------------------------------------------------------------------
CREATE TABLE public."maestro_access_credentials" (
  "maestro_id" uuid NOT NULL,
  "password_ciphertext" text NOT NULL,
  "password_iv" text NOT NULL,
  "password_version" integer DEFAULT 1 NOT NULL,
  "last_generated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_revealed_at" timestamp with time zone,
  "last_revealed_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "maestro_access_credentials_pkey" PRIMARY KEY ("maestro_id"),
  CONSTRAINT "maestro_access_credentials_last_revealed_by_fkey" FOREIGN KEY (last_revealed_by) REFERENCES profiles(id),
  CONSTRAINT "maestro_access_credentials_maestro_id_fkey" FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE
);

ALTER TABLE public."maestro_access_credentials" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."maestro_access_credentials" IS 'Encrypted vault for recoverable maestro portal passwords. Plaintext is only returned by the admin-only Edge Function.';
CREATE POLICY "maestro_access_credentials_service_role" ON public."maestro_access_credentials" FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."maestro_desempeno"
-- ----------------------------------------------------------------------------
CREATE TABLE public."maestro_desempeno" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "maestro_id" uuid,
  "total_sesiones" integer DEFAULT 0,
  "sesiones_verde" integer DEFAULT 0,
  "sesiones_amarillo" integer DEFAULT 0,
  "sesiones_naranja" integer DEFAULT 0,
  "sesiones_rojo" integer DEFAULT 0,
  "categoria" text DEFAULT 'responsable'::text,
  "fecha_ultima_evaluacion" timestamp with time zone,
  "tendencia" text DEFAULT 'estable'::text,
  "pending_count" integer DEFAULT 0,
  "oldest_dias_atraso" integer DEFAULT 0,
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "maestro_desempeno_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "maestro_desempeno_categoria_check" CHECK ((categoria = ANY (ARRAY['responsable'::text, 'regular'::text, 'incumplidor'::text, 'negligente'::text]))),
  CONSTRAINT "maestro_desempeno_maestro_id_key" UNIQUE (maestro_id),
  CONSTRAINT "maestro_desempeno_tendencia_check" CHECK ((tendencia = ANY (ARRAY['mejorando'::text, 'estable'::text, 'empeorando'::text]))),
  CONSTRAINT "maestro_desempeno_maestro_id_fkey" FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE
);

ALTER TABLE public."maestro_desempeno" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_maestro_desempeno_categoria ON public.maestro_desempeno USING btree (categoria);
CREATE INDEX idx_maestro_desempeno_tendencia ON public.maestro_desempeno USING btree (tendencia);
CREATE INDEX idx_maestro_desempeno_updated_at ON public.maestro_desempeno USING btree (updated_at);
CREATE INDEX idx_md_categoria ON public.maestro_desempeno USING btree (categoria);
CREATE INDEX idx_md_tendencia ON public.maestro_desempeno USING btree (tendencia);
CREATE INDEX idx_md_updated_at ON public.maestro_desempeno USING btree (updated_at);
CREATE UNIQUE INDEX maestro_desempeno_maestro_id_key ON public.maestro_desempeno USING btree (maestro_id);
CREATE POLICY "admin_read_md" ON public."maestro_desempeno" FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'admin'::text)))));
CREATE POLICY "system_update_md" ON public."maestro_desempeno" FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "system_write_md" ON public."maestro_desempeno" FOR INSERT TO service_role WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."maestro_indicadores"
-- ----------------------------------------------------------------------------
CREATE TABLE public."maestro_indicadores" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "objetivo_id" uuid NOT NULL,
  "orden" integer NOT NULL,
  "nombre" text NOT NULL,
  "criterios_json" jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "maestro_indicadores_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "valid_orden" CHECK ((orden >= 0)),
  CONSTRAINT "valid_orden" CHECK ((orden >= 0)),
  CONSTRAINT "valid_orden" CHECK ((orden >= 0)),
  CONSTRAINT "maestro_indicadores_objetivo_id_fkey" FOREIGN KEY (objetivo_id) REFERENCES maestro_objetivos(id) ON DELETE CASCADE
);

ALTER TABLE public."maestro_indicadores" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_maestro_indicadores_objetivo ON public.maestro_indicadores USING btree (objetivo_id, orden);
CREATE POLICY "maestro_indicadores_delete" ON public."maestro_indicadores" FOR DELETE TO authenticated USING ((es_admin() OR es_coordinador_acm() OR (objetivo_id IN ( SELECT maestro_objetivos.id
   FROM maestro_objetivos
  WHERE (maestro_objetivos.unidad_id IN ( SELECT maestro_unidades.id
           FROM maestro_unidades
          WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id
                   FROM maestro_routes
                  WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
                           FROM maestros
                          WHERE (maestros.user_id = auth.uid())))))))))));
CREATE POLICY "maestro_indicadores_select" ON public."maestro_indicadores" FOR SELECT TO authenticated USING ((es_admin() OR es_coordinador_acm() OR (objetivo_id IN ( SELECT maestro_objetivos.id
   FROM maestro_objetivos
  WHERE (maestro_objetivos.unidad_id IN ( SELECT maestro_unidades.id
           FROM maestro_unidades
          WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id
                   FROM maestro_routes
                  WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
                           FROM maestros
                          WHERE (maestros.user_id = auth.uid())))))))))));
CREATE POLICY "maestro_indicadores_update" ON public."maestro_indicadores" FOR UPDATE TO authenticated USING ((es_admin() OR es_coordinador_acm() OR (objetivo_id IN ( SELECT maestro_objetivos.id
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
CREATE POLICY "maestro_indicadores_write" ON public."maestro_indicadores" FOR INSERT TO authenticated WITH CHECK ((es_admin() OR es_coordinador_acm() OR (objetivo_id IN ( SELECT maestro_objetivos.id
   FROM maestro_objetivos
  WHERE (maestro_objetivos.unidad_id IN ( SELECT maestro_unidades.id
           FROM maestro_unidades
          WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id
                   FROM maestro_routes
                  WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
                           FROM maestros
                          WHERE (maestros.user_id = auth.uid())))))))))));

-- ----------------------------------------------------------------------------
-- Tabla: public."maestro_objetivos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."maestro_objetivos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "unidad_id" uuid NOT NULL,
  "orden" integer NOT NULL,
  "nombre" text NOT NULL,
  "descripcion" text,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "maestro_objetivos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "valid_orden" CHECK ((orden >= 0)),
  CONSTRAINT "valid_orden" CHECK ((orden >= 0)),
  CONSTRAINT "valid_orden" CHECK ((orden >= 0)),
  CONSTRAINT "maestro_objetivos_unidad_id_fkey" FOREIGN KEY (unidad_id) REFERENCES maestro_unidades(id) ON DELETE CASCADE
);

ALTER TABLE public."maestro_objetivos" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_maestro_objetivos_unidad ON public.maestro_objetivos USING btree (unidad_id, orden);
CREATE POLICY "maestro_objetivos_delete" ON public."maestro_objetivos" FOR DELETE TO authenticated USING ((es_admin() OR es_coordinador_acm() OR (unidad_id IN ( SELECT maestro_unidades.id
   FROM maestro_unidades
  WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id
           FROM maestro_routes
          WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
                   FROM maestros
                  WHERE (maestros.user_id = auth.uid())))))))));
CREATE POLICY "maestro_objetivos_select" ON public."maestro_objetivos" FOR SELECT TO authenticated USING ((es_admin() OR es_coordinador_acm() OR (unidad_id IN ( SELECT maestro_unidades.id
   FROM maestro_unidades
  WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id
           FROM maestro_routes
          WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
                   FROM maestros
                  WHERE (maestros.user_id = auth.uid())))))))));
CREATE POLICY "maestro_objetivos_update" ON public."maestro_objetivos" FOR UPDATE TO authenticated USING ((es_admin() OR es_coordinador_acm() OR (unidad_id IN ( SELECT maestro_unidades.id
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
CREATE POLICY "maestro_objetivos_write" ON public."maestro_objetivos" FOR INSERT TO authenticated WITH CHECK ((es_admin() OR es_coordinador_acm() OR (unidad_id IN ( SELECT maestro_unidades.id
   FROM maestro_unidades
  WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id
           FROM maestro_routes
          WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
                   FROM maestros
                  WHERE (maestros.user_id = auth.uid())))))))));

-- ----------------------------------------------------------------------------
-- Tabla: public."maestro_retiros"
-- ----------------------------------------------------------------------------
CREATE TABLE public."maestro_retiros" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "maestro_id" uuid NOT NULL,
  "reemplazo_maestro_id" uuid,
  "retirado_por" uuid,
  "motivo" text,
  "resumen_dependencias" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "maestro_retiros_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "maestro_retiros_maestro_id_fkey" FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE RESTRICT,
  CONSTRAINT "maestro_retiros_reemplazo_maestro_id_fkey" FOREIGN KEY (reemplazo_maestro_id) REFERENCES maestros(id) ON DELETE SET NULL,
  CONSTRAINT "maestro_retiros_retirado_por_fkey" FOREIGN KEY (retirado_por) REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE public."maestro_retiros" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_maestro_retiros_maestro_created ON public.maestro_retiros USING btree (maestro_id, created_at DESC);
CREATE POLICY "maestro_retiros_admin_read" ON public."maestro_retiros" FOR SELECT TO authenticated USING (is_admin());

-- ----------------------------------------------------------------------------
-- Tabla: public."maestro_routes"
-- ----------------------------------------------------------------------------
CREATE TABLE public."maestro_routes" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "maestro_id" uuid NOT NULL,
  "clase_id" uuid NOT NULL,
  "nombre" text NOT NULL,
  "descripcion" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "maestro_routes_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "maestro_routes_maestro_id_clase_id_key" UNIQUE (maestro_id, clase_id),
  CONSTRAINT "maestro_routes_clase_id_fkey" FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE,
  CONSTRAINT "maestro_routes_maestro_id_fkey" FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE
);

ALTER TABLE public."maestro_routes" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_maestro_routes_clase ON public.maestro_routes USING btree (clase_id);
CREATE INDEX idx_maestro_routes_maestro ON public.maestro_routes USING btree (maestro_id);
CREATE INDEX idx_maestro_routes_maestro_clase ON public.maestro_routes USING btree (maestro_id, clase_id);
CREATE UNIQUE INDEX maestro_routes_maestro_id_clase_id_key ON public.maestro_routes USING btree (maestro_id, clase_id);
CREATE POLICY "maestro_routes_delete" ON public."maestro_routes" FOR DELETE TO authenticated USING ((es_admin() OR es_coordinador_acm() OR (maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid())))));
CREATE POLICY "maestro_routes_insert" ON public."maestro_routes" FOR INSERT TO authenticated WITH CHECK ((es_admin() OR es_coordinador_acm() OR (maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid())))));
CREATE POLICY "maestro_routes_select" ON public."maestro_routes" FOR SELECT TO authenticated USING ((es_admin() OR es_coordinador_acm() OR (maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid())))));
CREATE POLICY "maestro_routes_update" ON public."maestro_routes" FOR UPDATE TO authenticated USING ((es_admin() OR es_coordinador_acm() OR (maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))))) WITH CHECK ((es_admin() OR es_coordinador_acm() OR (maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid())))));

-- ----------------------------------------------------------------------------
-- Tabla: public."maestro_tareas"
-- ----------------------------------------------------------------------------
CREATE TABLE public."maestro_tareas" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "maestro_id" uuid NOT NULL,
  "alumno_id" uuid,
  "sesion_id" uuid,
  "tarea" text NOT NULL,
  "fecha_recordatorio" date,
  "completada" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "maestro_tareas_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "maestro_tareas_alumno_id_fkey" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  CONSTRAINT "maestro_tareas_sesion_id_fkey" FOREIGN KEY (sesion_id) REFERENCES sesiones_clase(id) ON DELETE SET NULL
);

ALTER TABLE public."maestro_tareas" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_maestro_tareas_maestro_fecha ON public.maestro_tareas USING btree (maestro_id, fecha_recordatorio);
CREATE POLICY "maestro_tareas_admin_read" ON public."maestro_tareas" FOR SELECT USING (es_admin());
CREATE POLICY "maestro_tareas_own" ON public."maestro_tareas" FOR ALL TO authenticated USING ((maestro_id = maestro_actual())) WITH CHECK ((maestro_id = maestro_actual()));

-- ----------------------------------------------------------------------------
-- Tabla: public."maestro_unidades"
-- ----------------------------------------------------------------------------
CREATE TABLE public."maestro_unidades" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "ruta_id" uuid NOT NULL,
  "orden" integer NOT NULL,
  "nombre" text NOT NULL,
  "descripcion" text,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "maestro_unidades_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "valid_orden" CHECK ((orden >= 0)),
  CONSTRAINT "valid_orden" CHECK ((orden >= 0)),
  CONSTRAINT "valid_orden" CHECK ((orden >= 0)),
  CONSTRAINT "maestro_unidades_ruta_id_fkey" FOREIGN KEY (ruta_id) REFERENCES maestro_routes(id) ON DELETE CASCADE
);

ALTER TABLE public."maestro_unidades" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_maestro_unidades_ruta ON public.maestro_unidades USING btree (ruta_id, orden);
CREATE POLICY "maestro_unidades_delete" ON public."maestro_unidades" FOR DELETE TO authenticated USING ((es_admin() OR es_coordinador_acm() OR (ruta_id IN ( SELECT maestro_routes.id
   FROM maestro_routes
  WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
           FROM maestros
          WHERE (maestros.user_id = auth.uid())))))));
CREATE POLICY "maestro_unidades_select" ON public."maestro_unidades" FOR SELECT TO authenticated USING ((es_admin() OR es_coordinador_acm() OR (ruta_id IN ( SELECT maestro_routes.id
   FROM maestro_routes
  WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
           FROM maestros
          WHERE (maestros.user_id = auth.uid())))))));
CREATE POLICY "maestro_unidades_update" ON public."maestro_unidades" FOR UPDATE TO authenticated USING ((es_admin() OR es_coordinador_acm() OR (ruta_id IN ( SELECT maestro_routes.id
   FROM maestro_routes
  WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
           FROM maestros
          WHERE (maestros.user_id = auth.uid()))))))) WITH CHECK ((es_admin() OR es_coordinador_acm() OR (ruta_id IN ( SELECT maestro_routes.id
   FROM maestro_routes
  WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
           FROM maestros
          WHERE (maestros.user_id = auth.uid())))))));
CREATE POLICY "maestro_unidades_write" ON public."maestro_unidades" FOR INSERT TO authenticated WITH CHECK ((es_admin() OR es_coordinador_acm() OR (ruta_id IN ( SELECT maestro_routes.id
   FROM maestro_routes
  WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id
           FROM maestros
          WHERE (maestros.user_id = auth.uid())))))));

-- ----------------------------------------------------------------------------
-- Tabla: public."maestros"
-- ----------------------------------------------------------------------------
CREATE TABLE public."maestros" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid,
  "nombre_completo" text NOT NULL,
  "especialidad" text NOT NULL,
  "tipo_maestro" text DEFAULT 'catedra'::text,
  "habilidades" ARRAY DEFAULT ARRAY[]::text[],
  "disponibilidad" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "tlf" text,
  "correo" text NOT NULL,
  "resena" text,
  "puede_ser_suplente" boolean DEFAULT true,
  "activo" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "especialidades" ARRAY,
  "es_admin" boolean DEFAULT false,
  "retirado_en" timestamp with time zone,
  "retirado_por" uuid,
  "motivo_retiro" text,
  CONSTRAINT "maestros_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "maestros_correo_key" UNIQUE (correo),
  CONSTRAINT "maestros_tipo_maestro_check" CHECK ((tipo_maestro = ANY (ARRAY['catedra'::text, 'orquesta'::text, 'coro'::text, 'preparatoria'::text, 'monitor'::text, 'suplente'::text, 'direccion'::text, 'otro'::text]))),
  CONSTRAINT "maestros_user_id_key" UNIQUE (user_id),
  CONSTRAINT "fk_maestros_profile" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL,
  CONSTRAINT "maestros_retirado_por_fkey" FOREIGN KEY (retirado_por) REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE public."maestros" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_maestros_activo ON public.maestros USING btree (activo);
CREATE INDEX idx_maestros_especialidad ON public.maestros USING btree (especialidad);
CREATE INDEX idx_maestros_nombre ON public.maestros USING btree (nombre_completo);
CREATE INDEX idx_maestros_user_id ON public.maestros USING btree (user_id);
CREATE UNIQUE INDEX maestros_correo_key ON public.maestros USING btree (correo);
CREATE UNIQUE INDEX maestros_user_id_key ON public.maestros USING btree (user_id);
CREATE POLICY "maestros_admin_insert" ON public."maestros" FOR INSERT TO authenticated WITH CHECK (es_admin());
CREATE POLICY "maestros_admin_read" ON public."maestros" FOR SELECT USING (es_admin());
CREATE POLICY "maestros_admin_update" ON public."maestros" FOR UPDATE TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "maestros_select_self" ON public."maestros" FOR SELECT TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "maestros_superadmin_delete" ON public."maestros" FOR DELETE TO authenticated USING ((( SELECT is_super_admin() AS is_super_admin) = true));

-- ----------------------------------------------------------------------------
-- Tabla: public."mapa_plantillas"
-- ----------------------------------------------------------------------------
CREATE TABLE public."mapa_plantillas" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "nombre" text NOT NULL,
  "instrumento" text NOT NULL,
  "descripcion" text,
  "route_version_id" uuid NOT NULL,
  "level_id" uuid NOT NULL,
  "activo" boolean DEFAULT true NOT NULL,
  "publicada_por" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "mapa_plantillas_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "mapa_plantillas_route_version_id_level_id_key" UNIQUE (route_version_id, level_id),
  CONSTRAINT "mapa_plantillas_level_id_fkey" FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE,
  CONSTRAINT "mapa_plantillas_publicada_por_fkey" FOREIGN KEY (publicada_por) REFERENCES maestros(id),
  CONSTRAINT "mapa_plantillas_route_version_id_fkey" FOREIGN KEY (route_version_id) REFERENCES route_versions(id) ON DELETE RESTRICT
);

ALTER TABLE public."mapa_plantillas" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."mapa_plantillas" IS '-- DEPRECATED: plantillas legacy en evaluación 2026-09 (Owner: ACM)';
CREATE INDEX idx_mp_activo ON public.mapa_plantillas USING btree (activo);
CREATE INDEX idx_mp_level ON public.mapa_plantillas USING btree (level_id);
CREATE INDEX idx_mp_route_version ON public.mapa_plantillas USING btree (route_version_id);
CREATE UNIQUE INDEX mapa_plantillas_route_version_id_level_id_key ON public.mapa_plantillas USING btree (route_version_id, level_id);
CREATE POLICY "plantillas_admin" ON public."mapa_plantillas" FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "plantillas_read" ON public."mapa_plantillas" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."minutas"
-- ----------------------------------------------------------------------------
CREATE TABLE public."minutas" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "titulo" text NOT NULL,
  "fecha_reunion" date NOT NULL,
  "participantes" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "puntos_tratados" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "acuerdos" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "responsables" jsonb DEFAULT '[]'::jsonb,
  "fecha_proxima_reunion" date,
  "visibilidad" minuta_visibilidad DEFAULT 'todos'::minuta_visibilidad NOT NULL,
  "creado_por" uuid,
  "archivo_adjunto_url" text,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "minutas_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "minutas_creado_por_fkey" FOREIGN KEY (creado_por) REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public."minutas" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."minutas" IS '-- DEPRECATED: conservada por integridad referencial desde tareas_institucionales 2026-09 (Owner: DIR)';
CREATE POLICY "minutas_insert_cajero_admin" ON public."minutas" FOR INSERT WITH CHECK ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
CREATE POLICY "minutas_select_admin" ON public."minutas" FOR SELECT USING ((get_user_role() = 'admin'::text));
CREATE POLICY "minutas_select_cajero" ON public."minutas" FOR SELECT USING (((get_user_role() = 'finanzas'::text) AND (visibilidad = ANY (ARRAY['cajero'::minuta_visibilidad, 'todos'::minuta_visibilidad]))));
CREATE POLICY "minutas_update_admin" ON public."minutas" FOR UPDATE USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));

-- ----------------------------------------------------------------------------
-- Tabla: public."modulos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."modulos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "programa_id" uuid NOT NULL,
  "nivel_id" uuid NOT NULL,
  "nombre" text NOT NULL,
  "descripcion" text,
  "orden" integer NOT NULL,
  "duracion_estimada_semanas" integer,
  "requisito_modulo_id" uuid,
  "porcentaje_aprobacion" numeric DEFAULT 80,
  "activo" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "modulos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "modulos_duracion_estimada_semanas_check" CHECK (((duracion_estimada_semanas IS NULL) OR (duracion_estimada_semanas > 0))),
  CONSTRAINT "modulos_nivel_nombre_unique" UNIQUE (nivel_id, nombre),
  CONSTRAINT "modulos_nivel_orden_unique" UNIQUE (nivel_id, orden),
  CONSTRAINT "modulos_orden_check" CHECK ((orden > 0)),
  CONSTRAINT "modulos_porcentaje_aprobacion_check" CHECK (((porcentaje_aprobacion >= (0)::numeric) AND (porcentaje_aprobacion <= (100)::numeric))),
  CONSTRAINT "fk_modulos_nivel" FOREIGN KEY (nivel_id) REFERENCES niveles(id) ON DELETE CASCADE,
  CONSTRAINT "fk_modulos_programa" FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE CASCADE,
  CONSTRAINT "fk_modulos_requisito" FOREIGN KEY (requisito_modulo_id) REFERENCES modulos(id) ON DELETE SET NULL
);

ALTER TABLE public."modulos" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_modulos_nivel ON public.modulos USING btree (nivel_id);
CREATE INDEX idx_modulos_programa ON public.modulos USING btree (programa_id);
CREATE UNIQUE INDEX modulos_nivel_nombre_unique ON public.modulos USING btree (nivel_id, nombre);
CREATE UNIQUE INDEX modulos_nivel_orden_unique ON public.modulos USING btree (nivel_id, orden);
CREATE POLICY "modulos_admin_read" ON public."modulos" FOR SELECT USING (es_admin());
CREATE POLICY "modulos_authenticated_all" ON public."modulos" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."niveles"
-- ----------------------------------------------------------------------------
CREATE TABLE public."niveles" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "programa_id" uuid NOT NULL,
  "nombre" text NOT NULL,
  "descripcion" text,
  "orden" integer NOT NULL,
  "duracion_estimada_meses" integer,
  "criterios_promocion" jsonb DEFAULT '{}'::jsonb,
  "activo" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "niveles_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "niveles_duracion_estimada_meses_check" CHECK (((duracion_estimada_meses IS NULL) OR (duracion_estimada_meses > 0))),
  CONSTRAINT "niveles_orden_check" CHECK ((orden > 0)),
  CONSTRAINT "niveles_programa_nombre_unique" UNIQUE (programa_id, nombre),
  CONSTRAINT "niveles_programa_orden_unique" UNIQUE (programa_id, orden),
  CONSTRAINT "fk_niveles_programa" FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE CASCADE
);

ALTER TABLE public."niveles" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_niveles_programa ON public.niveles USING btree (programa_id);
CREATE UNIQUE INDEX niveles_programa_nombre_unique ON public.niveles USING btree (programa_id, nombre);
CREATE UNIQUE INDEX niveles_programa_orden_unique ON public.niveles USING btree (programa_id, orden);
CREATE POLICY "niveles_admin_read" ON public."niveles" FOR SELECT USING (es_admin());
CREATE POLICY "niveles_authenticated_all" ON public."niveles" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."node_resources"
-- ----------------------------------------------------------------------------
CREATE TABLE public."node_resources" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "node_id" uuid NOT NULL,
  "resource_type" text NOT NULL,
  "title" text NOT NULL,
  "url" text,
  "content" text,
  "order_index" integer DEFAULT 0 NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "node_resources_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "node_resources_resource_type_check" CHECK ((resource_type = ANY (ARRAY['video'::text, 'pdf'::text, 'exercise_text'::text, 'link'::text]))),
  CONSTRAINT "node_resources_node_id_fkey" FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

ALTER TABLE public."node_resources" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_node_resources_node_id ON public.node_resources USING btree (node_id);
CREATE INDEX idx_node_resources_type ON public.node_resources USING btree (resource_type);
CREATE POLICY "Full access for admins" ON public."node_resources" FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'admin'::text)))));
CREATE POLICY "Public read for authenticated users" ON public."node_resources" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."nodes"
-- ----------------------------------------------------------------------------
CREATE TABLE public."nodes" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "level_id" uuid NOT NULL,
  "route_version_id" uuid NOT NULL,
  "name" text NOT NULL,
  "type" text NOT NULL,
  "is_critical" boolean DEFAULT false NOT NULL,
  "is_required" boolean DEFAULT true NOT NULL,
  "objective" text,
  "order_index" integer DEFAULT 0 NOT NULL,
  "codigo" text,
  CONSTRAINT "nodes_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "nodes_level_id_fkey" FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE,
  CONSTRAINT "nodes_route_version_id_fkey" FOREIGN KEY (route_version_id) REFERENCES route_versions(id) ON DELETE CASCADE
);

ALTER TABLE public."nodes" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."nodes"."codigo" IS 'Codigo corto de la categoria de trabajo (ESC, ARP, MI, ARC, SON, AFI, EST, REP). No es unico: se repite una vez por nivel. NULL en nodos de versiones con nomenclatura generada.';
CREATE INDEX idx_nodes_codigo ON public.nodes USING btree (codigo) WHERE (codigo IS NOT NULL);
CREATE INDEX idx_nodes_critical ON public.nodes USING btree (is_critical);
CREATE INDEX idx_nodes_level ON public.nodes USING btree (level_id);
CREATE POLICY "Maestros pueden leer nodos" ON public."nodes" FOR SELECT TO authenticated USING (true);
CREATE POLICY "maestros_write_own_draft_nodes" ON public."nodes" FOR ALL USING ((route_version_id IN ( SELECT route_versions.id
   FROM route_versions
  WHERE ((route_versions.created_by = auth.uid()) AND (route_versions.status = 'draft'::route_status))))) WITH CHECK ((route_version_id IN ( SELECT route_versions.id
   FROM route_versions
  WHERE ((route_versions.created_by = auth.uid()) AND (route_versions.status = 'draft'::route_status)))));
CREATE POLICY "nodes_admin_read" ON public."nodes" FOR SELECT USING (es_admin());

-- ----------------------------------------------------------------------------
-- Tabla: public."notificaciones"
-- ----------------------------------------------------------------------------
CREATE TABLE public."notificaciones" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "profile_id" uuid,
  "registro_pendiente_id" uuid,
  "tipo" text DEFAULT 'in_app'::text,
  "titulo" text NOT NULL,
  "mensaje" text NOT NULL,
  "deep_link" text,
  "estado" text DEFAULT 'pendiente'::text,
  "enviada_en" timestamp with time zone,
  "leida_en" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "escalation_level" integer DEFAULT 0,
  "scheduled_for" timestamp with time zone,
  "dedup_key" text,
  "clase_id" uuid,
  CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "check_deep_link_format" CHECK (((deep_link IS NULL) OR (deep_link ~ '^/[a-zA-Z0-9/_-]+$'::text))),
  CONSTRAINT "notificaciones_estado_check" CHECK ((estado = ANY (ARRAY['pendiente'::text, 'enviada'::text, 'leida'::text, 'fallida'::text]))),
  CONSTRAINT "notificaciones_tipo_check" CHECK ((tipo = ANY (ARRAY['in_app'::text, 'push'::text, 'email'::text, 'sistema'::text, 'recordatorio_clase'::text]))),
  CONSTRAINT "fk_notificaciones_profile" FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT "fk_notificaciones_registro" FOREIGN KEY (registro_pendiente_id) REFERENCES registros_pendientes(id) ON DELETE SET NULL,
  CONSTRAINT "notificaciones_clase_id_fkey" FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE
);

ALTER TABLE public."notificaciones" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_notificaciones_clase_id ON public.notificaciones USING btree (clase_id);
CREATE INDEX idx_notificaciones_dedup_key ON public.notificaciones USING btree (dedup_key) WHERE (dedup_key IS NOT NULL);
CREATE INDEX idx_notificaciones_escalation_level ON public.notificaciones USING btree (escalation_level);
CREATE INDEX idx_notificaciones_estado ON public.notificaciones USING btree (estado);
CREATE INDEX idx_notificaciones_profile ON public.notificaciones USING btree (profile_id);
CREATE POLICY "notificaciones_admin_read" ON public."notificaciones" FOR SELECT USING (es_admin());
CREATE POLICY "notificaciones_authenticated_all" ON public."notificaciones" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."notificaciones_asistencia"
-- ----------------------------------------------------------------------------
CREATE TABLE public."notificaciones_asistencia" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "tipo" text NOT NULL,
  "canal" text DEFAULT 'whatsapp'::text NOT NULL,
  "prioridad" text DEFAULT 'normal'::text NOT NULL,
  "destinatario_telefono" text NOT NULL,
  "destinatario_nombre" text,
  "destinatario_email" text,
  "titulo" text,
  "cuerpo" text NOT NULL,
  "estado" text DEFAULT 'pendiente'::text NOT NULL,
  "fecha_creacion" timestamp with time zone DEFAULT now(),
  "fecha_programada" timestamp with time zone,
  "fecha_envio" timestamp with time zone,
  "fecha_respuesta" timestamp with time zone,
  "respuesta" text,
  "respuesta_hora" timestamp with time zone,
  "datos_extra" jsonb,
  "intentos_envio" integer DEFAULT 0,
  "error_ultimo" jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "notificaciones_asistencia_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notificaciones_asistencia_canal_check" CHECK ((canal = ANY (ARRAY['whatsapp'::text, 'email'::text, 'ambos'::text]))),
  CONSTRAINT "notificaciones_asistencia_estado_check" CHECK ((estado = ANY (ARRAY['pendiente'::text, 'enviado'::text, 'fallido'::text, 'entregado'::text, 'leido'::text]))),
  CONSTRAINT "notificaciones_asistencia_prioridad_check" CHECK ((prioridad = ANY (ARRAY['baja'::text, 'normal'::text, 'alta'::text, 'urgente'::text]))),
  CONSTRAINT "notificaciones_asistencia_tipo_check" CHECK ((tipo = ANY (ARRAY['alerta_asistencia_alumno'::text, 'recordatorio_asistencia_maestro'::text, 'reporte_asistencia_semanal'::text])))
);

ALTER TABLE public."notificaciones_asistencia" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_notif_asistencia_created ON public.notificaciones_asistencia USING btree (created_at DESC);
CREATE INDEX idx_notif_asistencia_destinatario ON public.notificaciones_asistencia USING btree (destinatario_telefono);
CREATE INDEX idx_notif_asistencia_estado ON public.notificaciones_asistencia USING btree (estado) WHERE (estado = 'pendiente'::text);
CREATE INDEX idx_notif_asistencia_estado_programada ON public.notificaciones_asistencia USING btree (estado, fecha_programada) WHERE (estado = 'pendiente'::text);
CREATE INDEX idx_notif_asistencia_tipo ON public.notificaciones_asistencia USING btree (tipo);
CREATE POLICY "hermes_update_notifications" ON public."notificaciones_asistencia" FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "portal_insert_notifications" ON public."notificaciones_asistencia" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "portal_read_own_notifications" ON public."notificaciones_asistencia" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."notificaciones_caja"
-- ----------------------------------------------------------------------------
CREATE TABLE public."notificaciones_caja" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "familia_id" uuid,
  "representante_id" uuid,
  "alumno_id" uuid,
  "tipo" notif_tipo NOT NULL,
  "canal" notif_canal DEFAULT 'ambos'::notif_canal NOT NULL,
  "prioridad" notif_prioridad DEFAULT 'media'::notif_prioridad NOT NULL,
  "titulo" text NOT NULL,
  "cuerpo" text NOT NULL,
  "datos_extra" jsonb DEFAULT '{}'::jsonb,
  "estado_whatsapp" notif_estado_wa DEFAULT 'pendiente'::notif_estado_wa NOT NULL,
  "estado_portal" notif_estado_portal DEFAULT 'no_leida'::notif_estado_portal NOT NULL,
  "respuesta_padre" text,
  "fecha_respuesta" timestamp with time zone,
  "fecha_programada" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "notificaciones_caja_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notificaciones_caja_alumno_id_fkey" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL,
  CONSTRAINT "notificaciones_caja_familia_id_fkey" FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT,
  CONSTRAINT "notificaciones_caja_representante_id_fkey" FOREIGN KEY (representante_id) REFERENCES representantes(id) ON DELETE SET NULL
);

ALTER TABLE public."notificaciones_caja" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_notif_familia ON public.notificaciones_caja USING btree (familia_id, created_at DESC);
CREATE INDEX idx_notif_hermes ON public.notificaciones_caja USING btree (estado_whatsapp, created_at) WHERE ((canal = ANY (ARRAY['whatsapp'::notif_canal, 'ambos'::notif_canal])) AND (estado_whatsapp = 'pendiente'::notif_estado_wa));
CREATE INDEX idx_notif_portal_unreads ON public.notificaciones_caja USING btree (estado_portal) WHERE (estado_portal = 'no_leida'::notif_estado_portal);
CREATE POLICY "notif_all_admin" ON public."notificaciones_caja" FOR ALL USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
CREATE POLICY "notif_insert_cajero_admin" ON public."notificaciones_caja" FOR INSERT WITH CHECK ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
CREATE POLICY "notif_select_cajero_admin" ON public."notificaciones_caja" FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
CREATE POLICY "notif_select_representante" ON public."notificaciones_caja" FOR SELECT USING (((get_user_role() = 'representante'::text) AND (familia_id = get_user_familia_id())));
CREATE POLICY "notif_update_cajero" ON public."notificaciones_caja" FOR UPDATE USING ((get_user_role() = 'finanzas'::text)) WITH CHECK ((get_user_role() = 'finanzas'::text));

-- ----------------------------------------------------------------------------
-- Tabla: public."notification_trigger_logs"
-- ----------------------------------------------------------------------------
CREATE TABLE public."notification_trigger_logs" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "execution_time" timestamp without time zone DEFAULT now(),
  "status" text NOT NULL,
  "maestros_processed" integer,
  "notifications_created" integer,
  "errors_count" integer,
  "error_message" text,
  "context" text,
  "created_at" timestamp without time zone DEFAULT now(),
  CONSTRAINT "notification_trigger_logs_pkey" PRIMARY KEY ("id")
);

ALTER TABLE public."notification_trigger_logs" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_notification_trigger_logs_execution_time ON public.notification_trigger_logs USING btree (execution_time DESC);
CREATE POLICY "solo admins" ON public."notification_trigger_logs" FOR ALL USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'admin'::text)))));

-- ----------------------------------------------------------------------------
-- Tabla: public."objetivos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."objetivos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "node_id" uuid NOT NULL,
  "nombre" text NOT NULL,
  "descripcion" text,
  "order_index" integer DEFAULT 0 NOT NULL,
  "activo" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "objetivos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "objetivos_node_order_unique" UNIQUE (node_id, order_index),
  CONSTRAINT "objetivos_node_id_fkey" FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

ALTER TABLE public."objetivos" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."objetivos" IS 'Objetivos explícitos entre temas (nodes) e indicadores.';
CREATE INDEX idx_objetivos_node_order ON public.objetivos USING btree (node_id, order_index);
CREATE UNIQUE INDEX objetivos_node_order_unique ON public.objetivos USING btree (node_id, order_index);
CREATE POLICY "teacher_read_objetivos" ON public."objetivos" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."observaciones_alumnos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."observaciones_alumnos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "alumno_id" uuid NOT NULL,
  "maestro_id" uuid,
  "clase_id" uuid,
  "sesion_clase_id" uuid,
  "tipo" text DEFAULT 'academica'::text,
  "observacion" text NOT NULL,
  "requiere_seguimiento" boolean DEFAULT false,
  "fecha" date DEFAULT CURRENT_DATE,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "titulo" text,
  "descripcion" text,
  "prioridad" text DEFAULT 'media'::text NOT NULL,
  "estado" text DEFAULT 'abierta'::text NOT NULL,
  "fecha_observacion" date,
  "seguimiento_fecha" date,
  "seguimiento_observacion" text,
  CONSTRAINT "observaciones_alumnos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "observaciones_alumnos_tipo_check" CHECK ((tipo = ANY (ARRAY['academica'::text, 'conductual'::text, 'asistencia'::text, 'tecnica'::text, 'motivacional'::text, 'administrativa'::text, 'otra'::text]))),
  CONSTRAINT "fk_observaciones_alumnos_alumno" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  CONSTRAINT "fk_observaciones_alumnos_clase" FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE SET NULL,
  CONSTRAINT "fk_observaciones_alumnos_maestro" FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE SET NULL,
  CONSTRAINT "fk_observaciones_alumnos_sesion" FOREIGN KEY (sesion_clase_id) REFERENCES sesiones_clase(id) ON DELETE SET NULL
);

ALTER TABLE public."observaciones_alumnos" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."observaciones_alumnos"."estado" IS 'abierta | seguimiento | resuelta';
COMMENT ON COLUMN public."observaciones_alumnos"."prioridad" IS 'baja | media | alta';
CREATE INDEX idx_observaciones_alumno ON public.observaciones_alumnos USING btree (alumno_id);
CREATE INDEX idx_observaciones_alumno_estado ON public.observaciones_alumnos USING btree (alumno_id, estado);
CREATE INDEX idx_observaciones_alumnos_followup ON public.observaciones_alumnos USING btree (alumno_id, estado, tipo) WHERE (estado = ANY (ARRAY['abierta'::text, 'seguimiento'::text, 'pendiente'::text]));
CREATE INDEX idx_observaciones_clase ON public.observaciones_alumnos USING btree (clase_id);
CREATE INDEX idx_observaciones_fecha ON public.observaciones_alumnos USING btree (fecha);
CREATE POLICY "obs_admin_all" ON public."observaciones_alumnos" FOR ALL USING (es_admin());
CREATE POLICY "obs_alumnos_insert" ON public."observaciones_alumnos" FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY "obs_alumnos_select" ON public."observaciones_alumnos" FOR SELECT USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "obs_alumnos_update" ON public."observaciones_alumnos" FOR UPDATE USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "observaciones_alumnos_admin_insert" ON public."observaciones_alumnos" FOR INSERT TO authenticated WITH CHECK (es_admin());
CREATE POLICY "observaciones_alumnos_admin_select" ON public."observaciones_alumnos" FOR SELECT TO authenticated USING (es_admin());
CREATE POLICY "observaciones_alumnos_admin_update" ON public."observaciones_alumnos" FOR UPDATE TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "observaciones_alumnos_superadmin_delete" ON public."observaciones_alumnos" FOR DELETE TO authenticated USING ((( SELECT is_super_admin() AS is_super_admin) = true));

-- ----------------------------------------------------------------------------
-- Tabla: public."observaciones_sesion"
-- ----------------------------------------------------------------------------
CREATE TABLE public."observaciones_sesion" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "sesion_id" uuid NOT NULL,
  "maestro_id" uuid NOT NULL,
  "contenido_raw" text DEFAULT ''::text NOT NULL,
  "contenido_parsed" jsonb,
  "es_borrador" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "contenido_ia_dsl" text,
  "first_note_at" timestamp with time zone,
  "last_note_at" timestamp with time zone,
  "ai_fill_at" timestamp with time zone,
  CONSTRAINT "observaciones_sesion_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "observaciones_sesion_maestro_id_fkey" FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE,
  CONSTRAINT "observaciones_sesion_sesion_id_fkey" FOREIGN KEY (sesion_id) REFERENCES sesiones_clase(id) ON DELETE CASCADE
);

ALTER TABLE public."observaciones_sesion" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."observaciones_sesion" IS 'Raw DSL observations per session. es_borrador=true for auto-drafts, false for confirmed saves.';
CREATE INDEX idx_obs_borrador ON public.observaciones_sesion USING btree (sesion_id, es_borrador) WHERE (es_borrador = true);
CREATE INDEX idx_obs_maestro ON public.observaciones_sesion USING btree (maestro_id);
CREATE INDEX idx_obs_sesion ON public.observaciones_sesion USING btree (sesion_id);
CREATE INDEX idx_observaciones_clase_filled ON public.observaciones_sesion USING btree (sesion_id, first_note_at DESC) WHERE (first_note_at IS NOT NULL);
CREATE INDEX idx_observaciones_first_note_at ON public.observaciones_sesion USING btree (first_note_at DESC);
CREATE INDEX idx_observaciones_last_note_at ON public.observaciones_sesion USING btree (last_note_at DESC);
CREATE INDEX idx_observaciones_maestro_filled ON public.observaciones_sesion USING btree (maestro_id, first_note_at DESC) WHERE (first_note_at IS NOT NULL);
CREATE POLICY "Maestros gestionan observaciones de sus sesiones" ON public."observaciones_sesion" FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM sesiones_clase s
  WHERE ((s.id = observaciones_sesion.sesion_id) AND ((s.maestro_id = maestro_actual()) OR maestro_en_clase(s.clase_id)))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM sesiones_clase s
  WHERE ((s.id = observaciones_sesion.sesion_id) AND ((s.maestro_id = maestro_actual()) OR maestro_en_clase(s.clase_id))))));
CREATE POLICY "observaciones_sesion_admin_read" ON public."observaciones_sesion" FOR SELECT USING (es_admin());

-- ----------------------------------------------------------------------------
-- Tabla: public."pagos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."pagos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "familia_id" uuid NOT NULL,
  "cuota_ids" ARRAY DEFAULT '{}'::uuid[] NOT NULL,
  "monto_centavos" bigint NOT NULL,
  "metodo_pago" metodo_pago NOT NULL,
  "referencia" text,
  "cajero_id" uuid,
  "notas" text,
  "recibo_url" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "fecha_pago" date DEFAULT CURRENT_DATE,
  CONSTRAINT "pagos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "pagos_monto_check" CHECK (((monto_centavos)::numeric > (0)::numeric)),
  CONSTRAINT "pagos_cajero_id_fkey" FOREIGN KEY (cajero_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT "pagos_familia_id_fkey" FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT
);

ALTER TABLE public."pagos" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."pagos"."fecha_pago" IS 'Fecha contable/bancaria real de la transacción; puede diferir de created_at.';
CREATE INDEX idx_pagos_cajero_fecha ON public.pagos USING btree (cajero_id, created_at);
CREATE INDEX idx_pagos_cuota_ids ON public.pagos USING gin (cuota_ids);
CREATE INDEX idx_pagos_familia ON public.pagos USING btree (familia_id);
CREATE POLICY "pagos_insert_cajero_admin" ON public."pagos" FOR INSERT WITH CHECK ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
CREATE POLICY "pagos_select_cajero_admin" ON public."pagos" FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
CREATE POLICY "pagos_select_representante" ON public."pagos" FOR SELECT USING (((get_user_role() = 'representante'::text) AND (familia_id = get_user_familia_id())));
CREATE POLICY "pagos_update_admin" ON public."pagos" FOR UPDATE USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));

-- ----------------------------------------------------------------------------
-- Tabla: public."pagos_alumnos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."pagos_alumnos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "alumno_id" uuid NOT NULL,
  "monto" numeric NOT NULL,
  "concepto" character varying(100) NOT NULL,
  "periodo_mes" date NOT NULL,
  "fecha_pago" date DEFAULT CURRENT_DATE NOT NULL,
  "metodo_pago" character varying(50) NOT NULL,
  "referencia_transaccion" character varying(100),
  "registrado_por" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "pagos_alumnos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "pagos_alumnos_concepto_check" CHECK (((concepto)::text = ANY ((ARRAY['mensualidad'::character varying, 'inscripcion'::character varying, 'uniforme'::character varying, 'otro'::character varying])::text[]))),
  CONSTRAINT "pagos_alumnos_metodo_pago_check" CHECK (((metodo_pago)::text = ANY ((ARRAY['efectivo'::character varying, 'transferencia'::character varying, 'deposito'::character varying, 'beca'::character varying])::text[]))),
  CONSTRAINT "pagos_alumnos_monto_check" CHECK ((monto > (0)::numeric)),
  CONSTRAINT "pagos_alumnos_alumno_id_fkey" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE RESTRICT,
  CONSTRAINT "pagos_alumnos_registrado_por_fkey" FOREIGN KEY (registrado_por) REFERENCES auth.users(id)
);

ALTER TABLE public."pagos_alumnos" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."pagos_alumnos" IS 'Registro de pagos por alumno. periodo_mes es el mes cubierto, no la fecha de pago.';
CREATE INDEX idx_pagos_alumno_periodo ON public.pagos_alumnos USING btree (alumno_id, periodo_mes DESC);
CREATE UNIQUE INDEX uix_pagos_mensualidad_mes ON public.pagos_alumnos USING btree (alumno_id, periodo_mes) WHERE ((concepto)::text = 'mensualidad'::text);
CREATE POLICY "pagos_admin_insert" ON public."pagos_alumnos" FOR INSERT TO authenticated WITH CHECK (es_admin());
CREATE POLICY "pagos_admin_select" ON public."pagos_alumnos" FOR SELECT TO authenticated USING (es_admin());
CREATE POLICY "pagos_admin_update" ON public."pagos_alumnos" FOR UPDATE TO authenticated USING (es_admin());

-- ----------------------------------------------------------------------------
-- Tabla: public."patrocinantes"
-- ----------------------------------------------------------------------------
CREATE TABLE public."patrocinantes" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "nombre" text NOT NULL,
  "tipo" patrocinante_tipo DEFAULT 'persona'::patrocinante_tipo NOT NULL,
  "contacto" text,
  "email" text,
  "telefono" text,
  "activo" boolean DEFAULT true,
  "notas" text,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "patrocinantes_pkey" PRIMARY KEY ("id")
);

ALTER TABLE public."patrocinantes" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "patrocinantes_all_admin" ON public."patrocinantes" FOR ALL USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
CREATE POLICY "patrocinantes_select_cajero_admin" ON public."patrocinantes" FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));

-- ----------------------------------------------------------------------------
-- Tabla: public."patrocinios"
-- ----------------------------------------------------------------------------
CREATE TABLE public."patrocinios" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "patrocinante_id" uuid NOT NULL,
  "alumno_id" uuid NOT NULL,
  "familia_id" uuid NOT NULL,
  "cubre" patrocinio_cubre DEFAULT 'todo'::patrocinio_cubre NOT NULL,
  "monto_mensual_centavos" bigint,
  "activo" boolean DEFAULT true,
  "fecha_inicio" date DEFAULT CURRENT_DATE NOT NULL,
  "fecha_fin" date,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "patrocinios_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "patrocinios_alumno_id_fkey" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE RESTRICT,
  CONSTRAINT "patrocinios_familia_id_fkey" FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT,
  CONSTRAINT "patrocinios_patrocinante_id_fkey" FOREIGN KEY (patrocinante_id) REFERENCES patrocinantes(id) ON DELETE RESTRICT
);

ALTER TABLE public."patrocinios" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "patrocinios_all_admin" ON public."patrocinios" FOR ALL USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
CREATE POLICY "patrocinios_select_cajero_admin" ON public."patrocinios" FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));

-- ----------------------------------------------------------------------------
-- Tabla: public."periodo_excepciones"
-- ----------------------------------------------------------------------------
CREATE TABLE public."periodo_excepciones" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "periodo_id" uuid,
  "fecha_inicio" date NOT NULL,
  "fecha_fin" date NOT NULL,
  "motivo" text NOT NULL,
  "tipo" text DEFAULT 'feriado'::text NOT NULL,
  "creado_por" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "periodo_excepciones_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "periodo_excepciones_rango_chk" CHECK ((fecha_fin >= fecha_inicio)),
  CONSTRAINT "periodo_excepciones_tipo_check" CHECK ((tipo = ANY (ARRAY['feriado'::text, 'receso'::text, 'suspension'::text, 'institucional'::text, 'otro'::text]))),
  CONSTRAINT "periodo_excepciones_creado_por_fkey" FOREIGN KEY (creado_por) REFERENCES profiles(id) ON DELETE SET NULL,
  CONSTRAINT "periodo_excepciones_periodo_id_fkey" FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE CASCADE
);

ALTER TABLE public."periodo_excepciones" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."periodo_excepciones"."periodo_id" IS 'NULL aplica la excepcion a cualquier periodo que contenga el rango. Util para feriados recurrentes.';
COMMENT ON TABLE public."periodo_excepciones" IS 'Dias no lectivos dentro de un periodo academico. periodo_id NULL = excepcion global (feriado nacional).';
CREATE INDEX idx_periodo_excepciones_periodo ON public.periodo_excepciones USING btree (periodo_id) WHERE (periodo_id IS NOT NULL);
CREATE INDEX idx_periodo_excepciones_rango ON public.periodo_excepciones USING btree (fecha_inicio, fecha_fin);
CREATE POLICY "periodo_excepciones_admin_write" ON public."periodo_excepciones" FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "periodo_excepciones_read" ON public."periodo_excepciones" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."periodos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."periodos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "nombre" text NOT NULL,
  "fecha_inicio" date NOT NULL,
  "fecha_fin" date NOT NULL,
  "activo" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "cerrado" boolean DEFAULT false NOT NULL,
  "cerrado_at" timestamp with time zone,
  "cerrado_por" uuid,
  "observaciones_cierre" text,
  CONSTRAINT "periodos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "periodos_fechas_check" CHECK ((fecha_fin > fecha_inicio))
);

ALTER TABLE public."periodos" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."periodos" IS 'Períodos académicos del año (ej: Trimestre I 2025)';
CREATE UNIQUE INDEX idx_periodo_activo_unico ON public.periodos USING btree (activo) WHERE (activo = true);
CREATE UNIQUE INDEX idx_periodos_unico_activo ON public.periodos USING btree (activo) WHERE (activo = true);
CREATE POLICY "periodos_admin_insert" ON public."periodos" FOR INSERT TO authenticated WITH CHECK (es_admin());
CREATE POLICY "periodos_admin_read" ON public."periodos" FOR SELECT USING (es_admin());
CREATE POLICY "periodos_admin_update" ON public."periodos" FOR UPDATE TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "periodos_superadmin_delete" ON public."periodos" FOR DELETE TO authenticated USING ((( SELECT is_super_admin() AS is_super_admin) = true));

-- ----------------------------------------------------------------------------
-- Tabla: public."periodos_cierre_auditoria"
-- ----------------------------------------------------------------------------
CREATE TABLE public."periodos_cierre_auditoria" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "periodo_id" uuid NOT NULL,
  "fecha_inicio" date NOT NULL,
  "fecha_fin" date NOT NULL,
  "cerrado_por" uuid,
  "observaciones" text,
  "resumen" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "snapshot" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "periodos_cierre_auditoria_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "periodos_cierre_auditoria_periodo_id_fkey" FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE CASCADE
);

ALTER TABLE public."periodos_cierre_auditoria" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "periodos_cierre_auditoria_admin_read" ON public."periodos_cierre_auditoria" FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.rol = 'admin'::text) AND (p.estado = 'activo'::text)))));
CREATE POLICY "periodos_cierre_auditoria_service_only" ON public."periodos_cierre_auditoria" FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."permisos_maestros"
-- ----------------------------------------------------------------------------
CREATE TABLE public."permisos_maestros" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "maestro_id" uuid NOT NULL,
  "puede_registrar_alumnos" boolean DEFAULT false,
  "puede_inscribir_clases" boolean DEFAULT false,
  "concedido_por" uuid,
  "creado_en" timestamp with time zone DEFAULT now(),
  "actualizado_en" timestamp with time zone DEFAULT now(),
  "permisos" ARRAY DEFAULT '{}'::text[] NOT NULL,
  "solicitudes" ARRAY DEFAULT '{}'::text[] NOT NULL,
  "fecha_inicio" date DEFAULT CURRENT_DATE NOT NULL,
  "fecha_fin" date,
  "puede_crear_clases" boolean DEFAULT false,
  "puede_planificar" boolean DEFAULT true,
  "puede_asistir" boolean DEFAULT true,
  CONSTRAINT "permisos_maestros_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "permisos_maestros_maestro_id_key" UNIQUE (maestro_id),
  CONSTRAINT "permisos_maestros_concedido_por_fkey" FOREIGN KEY (concedido_por) REFERENCES auth.users(id),
  CONSTRAINT "permisos_maestros_maestro_id_fkey" FOREIGN KEY (maestro_id) REFERENCES maestros(id)
);

ALTER TABLE public."permisos_maestros" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."permisos_maestros"."fecha_fin" IS 'Fecha de expiración del permiso. NULL = permanente.';
COMMENT ON COLUMN public."permisos_maestros"."fecha_inicio" IS 'Fecha desde la que el permiso está activo. Default: día de creación.';
CREATE INDEX idx_permisos_maestros_maestro_id ON public.permisos_maestros USING btree (maestro_id);
CREATE INDEX permisos_maestros_maestro_id_idx ON public.permisos_maestros USING btree (maestro_id);
CREATE UNIQUE INDEX permisos_maestros_maestro_id_key ON public.permisos_maestros USING btree (maestro_id);
CREATE POLICY "Maestro ve sus propios permisos" ON public."permisos_maestros" FOR SELECT TO authenticated USING ((maestro_id = maestro_actual()));
CREATE POLICY "Permitir actualizar sus propios permisos o por admin" ON public."permisos_maestros" FOR UPDATE TO authenticated USING ((es_admin() OR (maestro_id IN ( SELECT m.id
   FROM maestros m
  WHERE (m.user_id = auth.uid()))))) WITH CHECK ((es_admin() OR (maestro_id IN ( SELECT m.id
   FROM maestros m
  WHERE (m.user_id = auth.uid())))));
CREATE POLICY "Permitir insertar sus propios permisos o por admin" ON public."permisos_maestros" FOR INSERT TO authenticated WITH CHECK ((es_admin() OR (maestro_id IN ( SELECT m.id
   FROM maestros m
  WHERE (m.user_id = auth.uid())))));
CREATE POLICY "Todos pueden leer permisos" ON public."permisos_maestros" FOR SELECT TO authenticated USING (true);
CREATE POLICY "permisos_maestros_admin_read" ON public."permisos_maestros" FOR SELECT USING (es_admin());

-- ----------------------------------------------------------------------------
-- Tabla: public."plan_clases"
-- ----------------------------------------------------------------------------
CREATE TABLE public."plan_clases" (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "nombre" text NOT NULL,
  "descripcion" text,
  "activo" boolean DEFAULT true,
  "maestro_id" uuid,
  "clase_id" uuid,
  CONSTRAINT "plan_clases_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "plan_clases_clase_id_fkey" FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE SET NULL,
  CONSTRAINT "plan_clases_maestro_id_fkey" FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE
);

ALTER TABLE public."plan_clases" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."plan_clases" IS 'DEPRECATED: usar routes/route_versions/blocks/levels/nodes/indicators';
CREATE POLICY "plan_clases_admin_read" ON public."plan_clases" FOR SELECT USING (es_admin());
CREATE POLICY "plan_clases_delete" ON public."plan_clases" FOR DELETE TO authenticated USING (true);
CREATE POLICY "plan_clases_insert" ON public."plan_clases" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "plan_clases_select" ON public."plan_clases" FOR SELECT TO authenticated USING (true);
CREATE POLICY "plan_clases_update" ON public."plan_clases" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."plan_indicadores"
-- ----------------------------------------------------------------------------
CREATE TABLE public."plan_indicadores" (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "objetivo_id" uuid,
  "descripcion" text NOT NULL,
  "es_requerido" boolean DEFAULT true,
  "orden_index" integer DEFAULT 0,
  CONSTRAINT "plan_indicadores_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "plan_indicadores_objetivo_id_fkey" FOREIGN KEY (objetivo_id) REFERENCES plan_objetivos(id) ON DELETE CASCADE
);

ALTER TABLE public."plan_indicadores" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."plan_indicadores" IS 'DEPRECATED: usar indicators';
CREATE INDEX idx_indicadores_objetivo ON public.plan_indicadores USING btree (objetivo_id);
CREATE POLICY "plan_indicadores_admin_read" ON public."plan_indicadores" FOR SELECT USING (es_admin());
CREATE POLICY "plan_indicadores_delete" ON public."plan_indicadores" FOR DELETE TO authenticated USING (true);
CREATE POLICY "plan_indicadores_insert" ON public."plan_indicadores" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "plan_indicadores_select" ON public."plan_indicadores" FOR SELECT TO authenticated USING (true);
CREATE POLICY "plan_indicadores_update" ON public."plan_indicadores" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."plan_niveles"
-- ----------------------------------------------------------------------------
CREATE TABLE public."plan_niveles" (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "clase_id" uuid,
  "nombre" text NOT NULL,
  "numero_nivel" integer NOT NULL,
  "objetivo_general" text,
  "orden_index" integer DEFAULT 0,
  CONSTRAINT "plan_niveles_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "plan_niveles_clase_id_fkey" FOREIGN KEY (clase_id) REFERENCES plan_clases(id) ON DELETE CASCADE
);

ALTER TABLE public."plan_niveles" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."plan_niveles" IS 'DEPRECATED: usar levels';
CREATE INDEX idx_niveles_clase ON public.plan_niveles USING btree (clase_id);
CREATE POLICY "plan_niveles_admin_read" ON public."plan_niveles" FOR SELECT USING (es_admin());
CREATE POLICY "plan_niveles_delete" ON public."plan_niveles" FOR DELETE TO authenticated USING (true);
CREATE POLICY "plan_niveles_insert" ON public."plan_niveles" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "plan_niveles_select" ON public."plan_niveles" FOR SELECT TO authenticated USING (true);
CREATE POLICY "plan_niveles_update" ON public."plan_niveles" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."plan_objetivos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."plan_objetivos" (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "tema_id" uuid,
  "nombre" text NOT NULL,
  "orden_index" integer DEFAULT 0,
  CONSTRAINT "plan_objetivos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "plan_objetivos_tema_id_fkey" FOREIGN KEY (tema_id) REFERENCES plan_temas(id) ON DELETE CASCADE
);

ALTER TABLE public."plan_objetivos" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."plan_objetivos" IS 'DEPRECATED: usar indicators';
CREATE INDEX idx_objetivos_tema ON public.plan_objetivos USING btree (tema_id);
CREATE POLICY "plan_objetivos_admin_read" ON public."plan_objetivos" FOR SELECT USING (es_admin());
CREATE POLICY "plan_objetivos_delete" ON public."plan_objetivos" FOR DELETE TO authenticated USING (true);
CREATE POLICY "plan_objetivos_insert" ON public."plan_objetivos" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "plan_objetivos_select" ON public."plan_objetivos" FOR SELECT TO authenticated USING (true);
CREATE POLICY "plan_objetivos_update" ON public."plan_objetivos" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."plan_temas"
-- ----------------------------------------------------------------------------
CREATE TABLE public."plan_temas" (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "nivel_id" uuid,
  "nombre" text NOT NULL,
  "tipo" text DEFAULT 'TECNICA'::text,
  "es_critico" boolean DEFAULT false,
  "orden_index" integer DEFAULT 0,
  CONSTRAINT "plan_temas_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "plan_temas_nivel_id_fkey" FOREIGN KEY (nivel_id) REFERENCES plan_niveles(id) ON DELETE CASCADE
);

ALTER TABLE public."plan_temas" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."plan_temas" IS 'DEPRECATED: usar nodes';
CREATE INDEX idx_temas_nivel ON public.plan_temas USING btree (nivel_id);
CREATE POLICY "plan_temas_admin_read" ON public."plan_temas" FOR SELECT USING (es_admin());
CREATE POLICY "plan_temas_delete" ON public."plan_temas" FOR DELETE TO authenticated USING (true);
CREATE POLICY "plan_temas_insert" ON public."plan_temas" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "plan_temas_select" ON public."plan_temas" FOR SELECT TO authenticated USING (true);
CREATE POLICY "plan_temas_update" ON public."plan_temas" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."planificaciones"
-- ----------------------------------------------------------------------------
CREATE TABLE public."planificaciones" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "programa_id" uuid,
  "nivel_id" uuid,
  "clase_id" uuid NOT NULL,
  "maestro_id" uuid NOT NULL,
  "titulo" text NOT NULL,
  "descripcion" text,
  "periodo_nombre" text,
  "fecha_inicio" date NOT NULL,
  "fecha_fin" date,
  "contenidos" jsonb DEFAULT '[]'::jsonb,
  "tecnicas" jsonb DEFAULT '[]'::jsonb,
  "obras" jsonb DEFAULT '[]'::jsonb,
  "escalas_arpegios" jsonb DEFAULT '[]'::jsonb,
  "evaluaciones" jsonb DEFAULT '[]'::jsonb,
  "estado" text DEFAULT 'borrador'::text,
  "activo" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "instrumento" text,
  "objetivos_estructurados" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "frecuencia_semanal" numeric,
  "semanas_totales" integer,
  "nivel_texto" text,
  CONSTRAINT "planificaciones_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "planificaciones_estado_check" CHECK ((estado = ANY (ARRAY['borrador'::text, 'activa'::text, 'cerrada'::text, 'archivada'::text]))),
  CONSTRAINT "planificaciones_fecha_check" CHECK (((fecha_fin IS NULL) OR (fecha_fin >= fecha_inicio))),
  CONSTRAINT "fk_planificaciones_clase" FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE,
  CONSTRAINT "fk_planificaciones_maestro" FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE RESTRICT,
  CONSTRAINT "fk_planificaciones_nivel" FOREIGN KEY (nivel_id) REFERENCES niveles(id) ON DELETE SET NULL,
  CONSTRAINT "fk_planificaciones_programa" FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE SET NULL
);

ALTER TABLE public."planificaciones" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."planificaciones"."instrumento" IS 'Instrumento o grupo objetivo de la planificación. NULL = aplica a todos los instrumentos de la clase.';
COMMENT ON COLUMN public."planificaciones"."nivel_texto" IS 'Identificador de nivel interno del Diseñador (ej. "nivel-1"), NO es FK — nivel_id (uuid) es de otro sistema de niveles, no tocar.';
COMMENT ON COLUMN public."planificaciones"."objetivos_estructurados" IS 'Árbol de unidades/indicadores del Diseñador Curricular (feat/planificacion-clases-rediseño). Antes se enviaba como objetivosEstructurados y se descartaba en silencio — no existía la columna.';
CREATE INDEX idx_planificaciones_clase ON public.planificaciones USING btree (clase_id);
CREATE INDEX idx_planificaciones_estado ON public.planificaciones USING btree (estado);
CREATE INDEX idx_planificaciones_maestro ON public.planificaciones USING btree (maestro_id);
CREATE POLICY "planificaciones_delete_propia" ON public."planificaciones" FOR DELETE TO authenticated USING ((es_admin() OR (maestro_id = maestro_actual())));
CREATE POLICY "planificaciones_insert_propia" ON public."planificaciones" FOR INSERT TO authenticated WITH CHECK ((es_admin() OR ((maestro_id = maestro_actual()) AND ((clase_id IS NULL) OR maestro_en_clase(clase_id)))));
CREATE POLICY "planificaciones_read" ON public."planificaciones" FOR SELECT TO authenticated USING ((es_admin() OR (maestro_id = maestro_actual()) OR maestro_en_clase(clase_id)));
CREATE POLICY "planificaciones_update_propia" ON public."planificaciones" FOR UPDATE TO authenticated USING ((es_admin() OR (maestro_id = maestro_actual()) OR maestro_en_clase(clase_id))) WITH CHECK ((es_admin() OR (maestro_id = maestro_actual()) OR maestro_en_clase(clase_id)));

-- ----------------------------------------------------------------------------
-- Tabla: public."planned_content"
-- ----------------------------------------------------------------------------
CREATE TABLE public."planned_content" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "maestro_id" uuid NOT NULL,
  "clase_id" uuid NOT NULL,
  "node_id" uuid NOT NULL,
  "planned_date" date DEFAULT CURRENT_DATE,
  "covered" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "planned_content_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "planned_content_maestro_id_clase_id_node_id_planned_date_key" UNIQUE (maestro_id, clase_id, node_id, planned_date),
  CONSTRAINT "planned_content_clase_id_fkey" FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE,
  CONSTRAINT "planned_content_maestro_id_fkey" FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE,
  CONSTRAINT "planned_content_node_id_fkey" FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

ALTER TABLE public."planned_content" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."planned_content"."clase_id" IS 'Class where content will be covered';
COMMENT ON COLUMN public."planned_content"."covered" IS 'Flag indicating if the planned content was actually covered';
COMMENT ON COLUMN public."planned_content"."maestro_id" IS 'Teacher who planned this content';
COMMENT ON COLUMN public."planned_content"."node_id" IS 'Content node/topic planned for coverage';
COMMENT ON COLUMN public."planned_content"."planned_date" IS 'Date when content is planned to be covered';
COMMENT ON TABLE public."planned_content" IS 'Teachers'' daily planning of content to cover in each class session';
CREATE INDEX idx_planned_content_clase ON public.planned_content USING btree (clase_id, planned_date);
CREATE INDEX idx_planned_content_maestro ON public.planned_content USING btree (maestro_id, planned_date);
CREATE INDEX idx_planned_content_node ON public.planned_content USING btree (node_id, planned_date);
CREATE UNIQUE INDEX planned_content_maestro_id_clase_id_node_id_planned_date_key ON public.planned_content USING btree (maestro_id, clase_id, node_id, planned_date);
CREATE POLICY "planned_content_admin_read" ON public."planned_content" FOR SELECT USING (es_admin());
CREATE POLICY "planned_content_delete_all" ON public."planned_content" FOR DELETE USING (true);
CREATE POLICY "planned_content_insert_all" ON public."planned_content" FOR INSERT WITH CHECK (true);
CREATE POLICY "planned_content_select_all" ON public."planned_content" FOR SELECT USING (true);
CREATE POLICY "planned_content_update_all" ON public."planned_content" FOR UPDATE USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."planning_documents"
-- ----------------------------------------------------------------------------
CREATE TABLE public."planning_documents" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "maestro_id" uuid NOT NULL,
  "clase_id" uuid,
  "title" text NOT NULL,
  "file_name" text NOT NULL,
  "file_url" text NOT NULL,
  "file_type" text,
  "file_size" bigint,
  "description" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "planning_documents_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "planning_documents_clase_id_fkey" FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE SET NULL,
  CONSTRAINT "planning_documents_maestro_id_fkey" FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE
);

ALTER TABLE public."planning_documents" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_plandocs_clase ON public.planning_documents USING btree (clase_id);
CREATE INDEX idx_plandocs_maestro ON public.planning_documents USING btree (maestro_id);
CREATE POLICY "plandocs_delete" ON public."planning_documents" FOR DELETE TO authenticated USING ((maestro_id = maestro_actual()));
CREATE POLICY "plandocs_insert" ON public."planning_documents" FOR INSERT TO authenticated WITH CHECK ((maestro_id = maestro_actual()));
CREATE POLICY "plandocs_select" ON public."planning_documents" FOR SELECT TO authenticated USING ((maestro_id = maestro_actual()));
CREATE POLICY "plandocs_update" ON public."planning_documents" FOR UPDATE TO authenticated USING ((maestro_id = maestro_actual())) WITH CHECK ((maestro_id = maestro_actual()));
CREATE POLICY "planning_documents_admin_read" ON public."planning_documents" FOR SELECT USING (es_admin());

-- ----------------------------------------------------------------------------
-- Tabla: public."plantillas_planificacion"
-- ----------------------------------------------------------------------------
CREATE TABLE public."plantillas_planificacion" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "nombre" text NOT NULL,
  "objetivos" text,
  "contenido" text,
  "recursos" text,
  "evaluacion_metodo" text,
  "activo" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "clase_id" uuid,
  CONSTRAINT "plantillas_planificacion_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "plantillas_planificacion_clase_id_fkey" FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE SET NULL
);

ALTER TABLE public."plantillas_planificacion" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."plantillas_planificacion"."clase_id" IS 'Clase a la que pertenece este plan curricular. NULL = plantilla genérica reutilizable.';
COMMENT ON TABLE public."plantillas_planificacion" IS 'DEPRECATED: reemplazada por mapa_plantillas para el mapa gamificado';
CREATE INDEX idx_pp_clase_id ON public.plantillas_planificacion USING btree (clase_id);

-- ----------------------------------------------------------------------------
-- Tabla: public."portal_catalog"
-- ----------------------------------------------------------------------------
CREATE TABLE public."portal_catalog" (
  "portal_id" text NOT NULL,
  "nombre" text NOT NULL,
  "descripcion" text,
  "ruta" text NOT NULL,
  "icono" text DEFAULT 'bi-door-open'::text,
  "roles_default" ARRAY DEFAULT '{}'::text[],
  "activo" boolean DEFAULT true NOT NULL,
  "orden" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "is_active" boolean DEFAULT true,
  CONSTRAINT "portal_catalog_pkey" PRIMARY KEY ("portal_id")
);

ALTER TABLE public."portal_catalog" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "portal_catalog_admin_all" ON public."portal_catalog" FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = ANY (ARRAY['superadmin'::text, 'admin'::text]))))));
CREATE POLICY "portal_catalog_select_authenticated" ON public."portal_catalog" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."postulantes"
-- ----------------------------------------------------------------------------
CREATE TABLE public."postulantes" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "nombre_completo" text NOT NULL,
  "fecha_nacimiento" date,
  "telefono_alumno" text,
  "correo" text,
  "nacionalidad" text,
  "sector_calle_numero" text,
  "madre_nombre" text,
  "madre_tlf_whatsapp" text,
  "padre_nombre" text,
  "padre_tlf_whatsapp" text,
  "representante_parentesco" text,
  "acepta_pago_600" boolean DEFAULT false NOT NULL,
  "autoriza_fotos_redes" boolean DEFAULT false NOT NULL,
  "religion_limita" boolean DEFAULT false NOT NULL,
  "disponibilidad_tiempo" text,
  "tiene_transporte" boolean DEFAULT false NOT NULL,
  "representantes_apoyan" boolean DEFAULT false NOT NULL,
  "copia_cedula" boolean DEFAULT false NOT NULL,
  "sincronizado_en" timestamp with time zone DEFAULT now(),
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "estado" text DEFAULT 'pendiente'::text NOT NULL,
  "alumno_id" uuid,
  "fecha_postulacion" timestamp with time zone,
  "fecha_contacto" timestamp with time zone,
  "fecha_cita" timestamp with time zone,
  "notas_seguimiento" text,
  "instrumento" text,
  CONSTRAINT "postulantes_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "postulantes_submission_key" UNIQUE (correo, nombre_completo),
  CONSTRAINT "postulantes_alumno_id_fkey" FOREIGN KEY (alumno_id) REFERENCES alumnos(id)
);

ALTER TABLE public."postulantes" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."postulantes"."instrumento" IS 'Instrumento de interés del postulante (opcional, solo preferencia, no determina nada).';
CREATE INDEX idx_postulantes_created_at ON public.postulantes USING btree (created_at);
CREATE INDEX idx_postulantes_estado ON public.postulantes USING btree (estado);
CREATE INDEX idx_postulantes_fecha_cita ON public.postulantes USING btree (fecha_cita);
CREATE INDEX idx_postulantes_madre_tlf ON public.postulantes USING btree (madre_tlf_whatsapp);
CREATE INDEX idx_postulantes_nombre_completo ON public.postulantes USING gin (nombre_completo gin_trgm_ops);
CREATE INDEX idx_postulantes_padre_tlf ON public.postulantes USING btree (padre_tlf_whatsapp);
CREATE INDEX idx_postulantes_telefono_alumno ON public.postulantes USING btree (telefono_alumno);
CREATE UNIQUE INDEX postulantes_submission_key ON public.postulantes USING btree (correo, nombre_completo);
CREATE POLICY "postulantes_delete_authenticated" ON public."postulantes" FOR DELETE TO authenticated USING (true);
CREATE POLICY "postulantes_delete_service_role" ON public."postulantes" FOR DELETE TO service_role USING (true);
CREATE POLICY "postulantes_insert_service_role" ON public."postulantes" FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "postulantes_select_authenticated" ON public."postulantes" FOR SELECT TO authenticated USING (true);
CREATE POLICY "postulantes_update_authenticated" ON public."postulantes" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "postulantes_update_service_role" ON public."postulantes" FOR UPDATE TO service_role USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."profiles"
-- ----------------------------------------------------------------------------
CREATE TABLE public."profiles" (
  "id" uuid NOT NULL,
  "email" text NOT NULL,
  "nombre_completo" text,
  "rol" text DEFAULT 'user'::text NOT NULL,
  "avatar_url" text,
  "activo" boolean DEFAULT true,
  "estado" text DEFAULT 'pendiente'::text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "solicitud_instrumento" text,
  "solicitud_resena" text,
  CONSTRAINT "profiles_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "profiles_email_check" CHECK ((email ~* '^[^@]+@[^@]+\.[^@]+$'::text)),
  CONSTRAINT "profiles_estado_check" CHECK ((estado = ANY (ARRAY['pendiente'::text, 'activo'::text, 'rechazado'::text]))),
  CONSTRAINT "profiles_rol_check" CHECK ((rol = ANY (ARRAY['superadmin'::text, 'admin'::text, 'direccion'::text, 'coordinacion_academica'::text, 'maestro'::text, 'monitor'::text, 'finanzas'::text, 'operaciones'::text, 'representante'::text, 'alumno'::text, 'jurado'::text, 'user'::text]))),
  CONSTRAINT "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public."profiles" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_profiles_estado ON public.profiles USING btree (estado);
CREATE INDEX idx_profiles_rol ON public.profiles USING btree (rol);
CREATE POLICY "Usuarios ven su propio perfil" ON public."profiles" FOR SELECT TO authenticated USING ((id = auth.uid()));
CREATE POLICY "profiles_admin_insert" ON public."profiles" FOR INSERT TO authenticated WITH CHECK (es_admin());
CREATE POLICY "profiles_admin_read" ON public."profiles" FOR SELECT USING (es_admin());
CREATE POLICY "profiles_admin_update" ON public."profiles" FOR UPDATE TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "profiles_superadmin_delete" ON public."profiles" FOR DELETE TO authenticated USING ((( SELECT is_super_admin() AS is_super_admin) = true));

-- ----------------------------------------------------------------------------
-- Tabla: public."programas"
-- ----------------------------------------------------------------------------
CREATE TABLE public."programas" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "nombre" text NOT NULL,
  "descripcion" text,
  "activo" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "nivel" text,
  "codigo" text,
  "duracion_anios" numeric,
  CONSTRAINT "programas_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "programas_codigo_key" UNIQUE (codigo),
  CONSTRAINT "programas_nombre_key" UNIQUE (nombre)
);

ALTER TABLE public."programas" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX programas_codigo_key ON public.programas USING btree (codigo);
CREATE UNIQUE INDEX programas_nombre_key ON public.programas USING btree (nombre);
CREATE POLICY "Permitir actualizar programas" ON public."programas" FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir crear programas" ON public."programas" FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir eliminar programas" ON public."programas" FOR DELETE USING (true);
CREATE POLICY "programas_admin_read" ON public."programas" FOR SELECT USING (es_admin());
CREATE POLICY "programas_anon_read" ON public."programas" FOR SELECT TO anon USING (true);
CREATE POLICY "programas_authenticated_all" ON public."programas" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."programas_prerrequisitos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."programas_prerrequisitos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "programa_id" uuid NOT NULL,
  "prerequisito_id" uuid NOT NULL,
  "tipo" text DEFAULT 'seleccion'::text NOT NULL,
  "nota_minima" numeric,
  "notas" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "programas_prerrequisitos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "programas_prerrequisitos_nota_minima_check" CHECK (((nota_minima >= (0)::numeric) AND (nota_minima <= (100)::numeric))),
  CONSTRAINT "programas_prerrequisitos_programa_id_prerequisito_id_key" UNIQUE (programa_id, prerequisito_id),
  CONSTRAINT "programas_prerrequisitos_tipo_check" CHECK ((tipo = ANY (ARRAY['seleccion'::text, 'audicion'::text, 'recomendacion'::text]))),
  CONSTRAINT "programas_prerrequisitos_prerequisito_id_fkey" FOREIGN KEY (prerequisito_id) REFERENCES programas(id) ON DELETE CASCADE,
  CONSTRAINT "programas_prerrequisitos_programa_id_fkey" FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE CASCADE
);

ALTER TABLE public."programas_prerrequisitos" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."programas_prerrequisitos" IS 'Flujo académico: qué programa exige haber cursado otro (selección, audición o recomendación del maestro)';
CREATE UNIQUE INDEX programas_prerrequisitos_programa_id_prerequisito_id_key ON public.programas_prerrequisitos USING btree (programa_id, prerequisito_id);
CREATE POLICY "prerrequisitos_select_authenticated" ON public."programas_prerrequisitos" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."progresos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."progresos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "alumno_id" uuid NOT NULL,
  "clase_id" uuid NOT NULL,
  "sesion_clase_id" uuid,
  "asistencia_id" uuid,
  "ejercicio_id" uuid,
  "maestro_id" uuid,
  "fecha_evaluacion" date DEFAULT CURRENT_DATE NOT NULL,
  "indicadores" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "estado_cualitativo" text,
  "calificacion" numeric,
  "evaluacion_tipo" text DEFAULT 'clase'::text,
  "observaciones" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "periodo_id" uuid,
  "contenido_dsl" text,
  "objetivo_id" uuid,
  CONSTRAINT "progresos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "progresos_calificacion_check" CHECK (((calificacion IS NULL) OR ((calificacion >= (0)::numeric) AND (calificacion <= (10)::numeric)))),
  CONSTRAINT "progresos_evaluacion_tipo_check" CHECK ((evaluacion_tipo = ANY (ARRAY['clase'::text, 'ejercicio'::text, 'audicion'::text, 'recital'::text, 'examen'::text, 'observacion'::text, 'otro'::text]))),
  CONSTRAINT "progresos_upsert_key" UNIQUE (alumno_id, clase_id, sesion_clase_id, contenido_dsl),
  CONSTRAINT "fk_progresos_alumno" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  CONSTRAINT "fk_progresos_asistencia" FOREIGN KEY (asistencia_id) REFERENCES asistencias(id) ON DELETE SET NULL,
  CONSTRAINT "fk_progresos_clase" FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE,
  CONSTRAINT "fk_progresos_ejercicio" FOREIGN KEY (ejercicio_id) REFERENCES ejercicios(id) ON DELETE SET NULL,
  CONSTRAINT "fk_progresos_maestro" FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE SET NULL,
  CONSTRAINT "fk_progresos_sesion" FOREIGN KEY (sesion_clase_id) REFERENCES sesiones_clase(id) ON DELETE SET NULL,
  CONSTRAINT "progresos_objetivo_id_fkey" FOREIGN KEY (objetivo_id) REFERENCES plan_objetivos(id),
  CONSTRAINT "progresos_periodo_id_fkey" FOREIGN KEY (periodo_id) REFERENCES periodos(id)
);

ALTER TABLE public."progresos" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."progresos"."contenido_dsl" IS 'Contenido libre extraído por IA o por token DSL manual. Linkeable retroactivamente a objetivo_id cuando exista plan curricular.';
COMMENT ON COLUMN public."progresos"."objetivo_id" IS 'FK opcional a plan_objetivos. NULL = estado libre sin plan. Poblar retroactivamente al aceptar un plan al fin del semestre.';
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
CREATE POLICY "progresos_admin_read" ON public."progresos" FOR SELECT USING (es_admin());
CREATE POLICY "progresos_authenticated_all" ON public."progresos" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "progresos_insert" ON public."progresos" FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY "progresos_select" ON public."progresos" FOR SELECT USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "progresos_superadmin_delete" ON public."progresos" FOR DELETE TO authenticated USING ((( SELECT is_super_admin() AS is_super_admin) = true));
CREATE POLICY "progresos_update" ON public."progresos" FOR UPDATE USING ((auth.role() = 'authenticated'::text));

-- ----------------------------------------------------------------------------
-- Tabla: public."protocolos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."protocolos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "nombre" text NOT NULL,
  "tipo" text NOT NULL,
  "descripcion" text,
  "tareas" jsonb DEFAULT '[]'::jsonb,
  "activo" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "protocolos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "protocolos_nombre_key" UNIQUE (nombre)
);

ALTER TABLE public."protocolos" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."protocolos" IS '-- DEPRECATED: infraestructura base para Hermes en reserva 2026-09 (Owner: DIR/HERMES)';
CREATE INDEX idx_protocolos_activo ON public.protocolos USING btree (activo);
CREATE INDEX idx_protocolos_tipo ON public.protocolos USING btree (tipo);
CREATE UNIQUE INDEX protocolos_nombre_key ON public.protocolos USING btree (nombre);
CREATE POLICY "protocolos_admin" ON public."protocolos" FOR ALL USING ((get_user_role() = 'admin'::text));
CREATE POLICY "protocolos_select" ON public."protocolos" FOR SELECT USING ((activo = true));

-- ----------------------------------------------------------------------------
-- Tabla: public."pulso_score_history"
-- ----------------------------------------------------------------------------
CREATE TABLE public."pulso_score_history" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "score" numeric NOT NULL,
  "nivel" text NOT NULL,
  "asistencia_pct" numeric DEFAULT 100.00 NOT NULL,
  "tareas_tiempo_pct" numeric DEFAULT 100.00 NOT NULL,
  "cobertura_registro_pct" numeric DEFAULT 100.00 NOT NULL,
  "penalizacion_vencidas_pct" numeric DEFAULT 100.00 NOT NULL,
  "metricas_detalle" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "calculado_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "pulso_score_history_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "pulso_score_history_nivel_check" CHECK ((nivel = ANY (ARRAY['optimo'::text, 'atencion'::text, 'critico'::text])))
);

ALTER TABLE public."pulso_score_history" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_pulso_score_history_calculado ON public.pulso_score_history USING btree (calculado_at DESC);
CREATE POLICY "pulso_score_history_auth_select" ON public."pulso_score_history" FOR SELECT TO authenticated USING (true);
CREATE POLICY "pulso_score_history_service_all" ON public."pulso_score_history" FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."push_subscriptions"
-- ----------------------------------------------------------------------------
CREATE TABLE public."push_subscriptions" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "profile_id" uuid NOT NULL,
  "endpoint" text NOT NULL,
  "p256dh" text NOT NULL,
  "auth" text NOT NULL,
  "user_agent" text,
  "activo" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "push_subscriptions_endpoint_key" UNIQUE (endpoint),
  CONSTRAINT "fk_push_subscriptions_profile" FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

ALTER TABLE public."push_subscriptions" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX push_subscriptions_endpoint_key ON public.push_subscriptions USING btree (endpoint);
CREATE POLICY "push_own_user" ON public."push_subscriptions" FOR ALL USING ((profile_id = auth.uid())) WITH CHECK ((profile_id = auth.uid()));
CREATE POLICY "push_subscriptions_admin_read" ON public."push_subscriptions" FOR SELECT USING (es_admin());
CREATE POLICY "push_subscriptions_own" ON public."push_subscriptions" FOR ALL TO authenticated USING ((profile_id = auth.uid())) WITH CHECK ((profile_id = auth.uid()));

-- ----------------------------------------------------------------------------
-- Tabla: public."rachas"
-- ----------------------------------------------------------------------------
CREATE TABLE public."rachas" (
  "alumno_id" uuid NOT NULL,
  "racha_actual" integer DEFAULT 0,
  "racha_maxima" integer DEFAULT 0,
  "ultima_fecha_activa" date,
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "rachas_pkey" PRIMARY KEY ("alumno_id"),
  CONSTRAINT "rachas_racha_actual_check" CHECK ((racha_actual >= 0)),
  CONSTRAINT "rachas_racha_maxima_check" CHECK ((racha_maxima >= 0)),
  CONSTRAINT "fk_rachas_alumno" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE
);

ALTER TABLE public."rachas" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."rachas" IS '-- DEPRECATED: gamificación pedagógica en pausa 2026-09 (Owner: ACM)';
CREATE POLICY "rachas_admin_read" ON public."rachas" FOR SELECT USING (es_admin());
CREATE POLICY "rachas_authenticated_all" ON public."rachas" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."registros_pendientes"
-- ----------------------------------------------------------------------------
CREATE TABLE public."registros_pendientes" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "maestro_id" uuid NOT NULL,
  "sesion_clase_id" uuid,
  "tipo" text NOT NULL,
  "prioridad" text DEFAULT 'media'::text,
  "estado" text DEFAULT 'pendiente'::text,
  "fecha_limite" timestamp with time zone,
  "mensaje" text NOT NULL,
  "deep_link" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "resuelto_at" timestamp with time zone,
  "last_notified_at" timestamp with time zone,
  "notif_count" integer DEFAULT 0,
  "notification_state" text DEFAULT 'VERDE'::text,
  CONSTRAINT "registros_pendientes_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "registros_pendientes_estado_check" CHECK ((estado = ANY (ARRAY['pendiente'::text, 'visto'::text, 'resuelto'::text, 'cancelado'::text]))),
  CONSTRAINT "registros_pendientes_notification_state_check" CHECK ((notification_state = ANY (ARRAY['VERDE'::text, 'AMARILLO'::text, 'NARANJA'::text, 'ROJO'::text]))),
  CONSTRAINT "registros_pendientes_prioridad_check" CHECK ((prioridad = ANY (ARRAY['baja'::text, 'media'::text, 'alta'::text, 'critica'::text]))),
  CONSTRAINT "registros_pendientes_tipo_check" CHECK ((tipo = ANY (ARRAY['asistencia_pendiente'::text, 'contenido_pendiente'::text, 'progreso_pendiente'::text, 'sesion_sin_cerrar'::text, 'justificacion_pendiente'::text, 'otro'::text]))),
  CONSTRAINT "fk_registros_pendientes_maestro" FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE CASCADE,
  CONSTRAINT "fk_registros_pendientes_sesion" FOREIGN KEY (sesion_clase_id) REFERENCES sesiones_clase(id) ON DELETE CASCADE
);

ALTER TABLE public."registros_pendientes" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_registros_pendientes_estado ON public.registros_pendientes USING btree (estado);
CREATE INDEX idx_registros_pendientes_last_notified ON public.registros_pendientes USING btree (last_notified_at);
CREATE INDEX idx_registros_pendientes_maestro ON public.registros_pendientes USING btree (maestro_id);
CREATE INDEX idx_registros_pendientes_notification_state ON public.registros_pendientes USING btree (notification_state);
CREATE INDEX idx_registros_pendientes_tipo ON public.registros_pendientes USING btree (tipo);
CREATE INDEX idx_rp_maestro_estado_tipo ON public.registros_pendientes USING btree (maestro_id, estado, tipo);
CREATE POLICY "registros_pendientes_admin_read" ON public."registros_pendientes" FOR SELECT USING (es_admin());
CREATE POLICY "registros_pendientes_authenticated_all" ON public."registros_pendientes" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."repertoire_items"
-- ----------------------------------------------------------------------------
CREATE TABLE public."repertoire_items" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "section" text NOT NULL,
  "title" text NOT NULL,
  "type" text DEFAULT 'obra'::text NOT NULL,
  "tempo_indication" text DEFAULT ''::text,
  "key_signature" text DEFAULT ''::text,
  "is_active" boolean DEFAULT true,
  "order_index" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "repertoire_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "repertoire_items_section_title_type_key" UNIQUE (section, title, type),
  CONSTRAINT "repertoire_items_section_fkey" FOREIGN KEY (section) REFERENCES sections(id) ON DELETE CASCADE
);

ALTER TABLE public."repertoire_items" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX repertoire_items_section_title_type_key ON public.repertoire_items USING btree (section, title, type);
CREATE POLICY "Allow admin modify repertoire_items" ON public."repertoire_items" FOR ALL TO authenticated USING (is_app_admin()) WITH CHECK (is_app_admin());
CREATE POLICY "Allow public read repertoire_items" ON public."repertoire_items" FOR SELECT USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."representantes"
-- ----------------------------------------------------------------------------
CREATE TABLE public."representantes" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "familia_id" uuid NOT NULL,
  "user_id" uuid,
  "nombre" text NOT NULL,
  "cedula" text,
  "telefono_whatsapp" text,
  "email" text,
  "relacion" text,
  "es_pagador" boolean DEFAULT true,
  "autoriza_accesorios_hasta" numeric DEFAULT 0,
  "alumno_id" uuid,
  "activo" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "bloqueo_reinscripcion" boolean DEFAULT false NOT NULL,
  "motivo_bloqueo" text,
  CONSTRAINT "representantes_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "representantes_alumno_id_fkey" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL,
  CONSTRAINT "representantes_familia_id_fkey" FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT,
  CONSTRAINT "representantes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public."representantes" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_representantes_bloqueo ON public.representantes USING btree (bloqueo_reinscripcion) WHERE (bloqueo_reinscripcion = true);
CREATE INDEX idx_representantes_familia ON public.representantes USING btree (familia_id);
CREATE INDEX idx_representantes_user ON public.representantes USING btree (user_id);
CREATE POLICY "representantes_all_admin" ON public."representantes" FOR ALL USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
CREATE POLICY "representantes_select_cajero_admin" ON public."representantes" FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
CREATE POLICY "representantes_select_representante" ON public."representantes" FOR SELECT USING (((get_user_role() = 'representante'::text) AND (familia_id = get_user_familia_id())));

-- ----------------------------------------------------------------------------
-- Tabla: public."retenciones_instrumento"
-- ----------------------------------------------------------------------------
CREATE TABLE public."retenciones_instrumento" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "alumno_id" uuid NOT NULL,
  "instrumento_id" uuid,
  "instrumento_texto" text,
  "motivo" text DEFAULT 'ausentismo_acumulado'::text NOT NULL,
  "estado" text DEFAULT 'retenido'::text NOT NULL,
  "retenido_por" uuid DEFAULT auth.uid(),
  "retenido_en" timestamp with time zone DEFAULT now() NOT NULL,
  "maestro_notificado_en" timestamp with time zone,
  "maestro_confirmo_recogida_en" timestamp with time zone,
  "acta_firmada_en" timestamp with time zone,
  "fecha_reincorporacion" timestamp with time zone,
  "levantada_por" uuid,
  "levantada_en" timestamp with time zone,
  "notas" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "retenciones_instrumento_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "retenciones_instrumento_estado_check" CHECK ((estado = ANY (ARRAY['retenido'::text, 'levantada'::text]))),
  CONSTRAINT "retenciones_instrumento_alumno_id_fkey" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  CONSTRAINT "retenciones_instrumento_instrumento_id_fkey" FOREIGN KEY (instrumento_id) REFERENCES instrumentos(id) ON DELETE SET NULL,
  CONSTRAINT "retenciones_instrumento_levantada_por_fkey" FOREIGN KEY (levantada_por) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT "retenciones_instrumento_retenido_por_fkey" FOREIGN KEY (retenido_por) REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public."retenciones_instrumento" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."retenciones_instrumento" IS 'Retención temporal del instrumento de un alumno por ausentismo acumulado (nivel 3). Independiente del inventario instrumentos: instrumento_texto sirve cuando no hay fila formal. fecha_reincorporacion reinicia el contador de ausencias del alumno para el período.';
CREATE INDEX idx_retenciones_alumno ON public.retenciones_instrumento USING btree (alumno_id);
CREATE INDEX idx_retenciones_retenido ON public.retenciones_instrumento USING btree (alumno_id) WHERE (estado = 'retenido'::text);
CREATE POLICY "retenciones_select_auth" ON public."retenciones_instrumento" FOR SELECT TO authenticated USING (true);
CREATE POLICY "retenciones_write_admin" ON public."retenciones_instrumento" FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());

-- ----------------------------------------------------------------------------
-- Tabla: public."route_versions"
-- ----------------------------------------------------------------------------
CREATE TABLE public."route_versions" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "route_id" uuid NOT NULL,
  "version" text NOT NULL,
  "status" route_status DEFAULT 'draft'::route_status NOT NULL,
  "notes" text,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "published_at" timestamp with time zone,
  CONSTRAINT "route_versions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "route_versions_route_id_version_key" UNIQUE (route_id, version),
  CONSTRAINT "route_versions_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT "route_versions_route_id_fkey" FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);

ALTER TABLE public."route_versions" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_route_versions_route ON public.route_versions USING btree (route_id);
CREATE INDEX idx_route_versions_status ON public.route_versions USING btree (status);
CREATE UNIQUE INDEX route_versions_route_id_version_key ON public.route_versions USING btree (route_id, version);
CREATE UNIQUE INDEX uniq_one_draft_per_route_user ON public.route_versions USING btree (route_id, created_by) WHERE (status = 'draft'::route_status);
CREATE POLICY "maestros_delete_own_draft_versions" ON public."route_versions" FOR DELETE USING (((created_by = auth.uid()) AND (status = 'draft'::route_status)));
CREATE POLICY "maestros_select_own_draft_versions" ON public."route_versions" FOR SELECT USING (((created_by = auth.uid()) AND (status = 'draft'::route_status)));
CREATE POLICY "maestros_update_own_draft_versions" ON public."route_versions" FOR UPDATE USING (((created_by = auth.uid()) AND (status = 'draft'::route_status)));
CREATE POLICY "route_versions_admin_read" ON public."route_versions" FOR SELECT USING (es_admin());

-- ----------------------------------------------------------------------------
-- Tabla: public."routes"
-- ----------------------------------------------------------------------------
CREATE TABLE public."routes" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "instrument" text NOT NULL,
  "description" text,
  "status" route_status DEFAULT 'draft'::route_status NOT NULL,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "routes_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "routes_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

ALTER TABLE public."routes" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_routes_instrument ON public.routes USING btree (instrument);
CREATE POLICY "Maestros pueden leer rutas" ON public."routes" FOR SELECT TO authenticated USING (true);
CREATE POLICY "routes_admin_read" ON public."routes" FOR SELECT USING (es_admin());

-- ----------------------------------------------------------------------------
-- Tabla: public."ruta_contenido_objetivos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."ruta_contenido_objetivos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "ruta_id" uuid NOT NULL,
  "objetivo_id" uuid,
  "descripcion" text NOT NULL,
  "semana_inicio" integer NOT NULL,
  "semana_fin" integer NOT NULL,
  "orden" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "ruta_contenido_objetivos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ruta_contenido_objetivos_check" CHECK ((semana_fin >= semana_inicio)),
  CONSTRAINT "ruta_contenido_objetivos_ruta_id_objetivo_id_key" UNIQUE (ruta_id, objetivo_id),
  CONSTRAINT "ruta_contenido_objetivos_ruta_id_orden_key" UNIQUE (ruta_id, orden),
  CONSTRAINT "ruta_contenido_objetivos_semana_inicio_check" CHECK ((semana_inicio > 0)),
  CONSTRAINT "ruta_contenido_objetivos_objetivo_id_fkey" FOREIGN KEY (objetivo_id) REFERENCES curriculo_objetivos(id) ON DELETE SET NULL,
  CONSTRAINT "ruta_contenido_objetivos_ruta_id_fkey" FOREIGN KEY (ruta_id) REFERENCES rutas_contenido(id) ON DELETE CASCADE
);

ALTER TABLE public."ruta_contenido_objetivos" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX ruta_contenido_objetivos_ruta_id_objetivo_id_key ON public.ruta_contenido_objetivos USING btree (ruta_id, objetivo_id);
CREATE UNIQUE INDEX ruta_contenido_objetivos_ruta_id_orden_key ON public.ruta_contenido_objetivos USING btree (ruta_id, orden);
CREATE POLICY "ruta_contenido_objetivos_insert" ON public."ruta_contenido_objetivos" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM rutas_contenido
  WHERE ((rutas_contenido.id = ruta_contenido_objetivos.ruta_id) AND (auth.uid() = rutas_contenido.creada_por)))));
CREATE POLICY "ruta_contenido_objetivos_select_all" ON public."ruta_contenido_objetivos" FOR SELECT USING (true);
CREATE POLICY "ruta_contenido_objetivos_update" ON public."ruta_contenido_objetivos" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM rutas_contenido
  WHERE ((rutas_contenido.id = ruta_contenido_objetivos.ruta_id) AND (auth.uid() = rutas_contenido.creada_por)))));

-- ----------------------------------------------------------------------------
-- Tabla: public."rutas_contenido"
-- ----------------------------------------------------------------------------
CREATE TABLE public."rutas_contenido" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "instrumento" text NOT NULL,
  "nivel" text NOT NULL,
  "nombre" text NOT NULL,
  "tipo" text NOT NULL,
  "estado" text NOT NULL,
  "descripcion" text,
  "ruta_base_id" uuid,
  "duracion_semanas" integer DEFAULT 40 NOT NULL,
  "creada_por" uuid,
  "aprobada_por" uuid,
  "fecha_aprobacion" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "rutas_contenido_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "rutas_contenido_check" CHECK (((tipo = 'soi-estandar'::text) OR (ruta_base_id IS NOT NULL))),
  CONSTRAINT "rutas_contenido_estado_check" CHECK ((estado = ANY (ARRAY['activa'::text, 'pendiente'::text, 'aprobada'::text, 'rechazada'::text]))),
  CONSTRAINT "rutas_contenido_instrumento_nivel_nombre_key" UNIQUE (instrumento, nivel, nombre),
  CONSTRAINT "rutas_contenido_tipo_check" CHECK ((tipo = ANY (ARRAY['soi-estandar'::text, 'maestro-variante'::text]))),
  CONSTRAINT "rutas_contenido_aprobada_por_fkey" FOREIGN KEY (aprobada_por) REFERENCES maestros(id) ON DELETE SET NULL,
  CONSTRAINT "rutas_contenido_creada_por_fkey" FOREIGN KEY (creada_por) REFERENCES maestros(id) ON DELETE SET NULL,
  CONSTRAINT "rutas_contenido_ruta_base_id_fkey" FOREIGN KEY (ruta_base_id) REFERENCES rutas_contenido(id) ON DELETE SET NULL
);

ALTER TABLE public."rutas_contenido" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_rutas_contenido_instrumento_nivel_estado ON public.rutas_contenido USING btree (instrumento, nivel, estado);
CREATE UNIQUE INDEX rutas_contenido_instrumento_nivel_nombre_key ON public.rutas_contenido USING btree (instrumento, nivel, nombre);
CREATE POLICY "rutas_contenido_insert_maestro" ON public."rutas_contenido" FOR INSERT WITH CHECK ((auth.uid() = creada_por));
CREATE POLICY "rutas_contenido_select_all" ON public."rutas_contenido" FOR SELECT USING (true);
CREATE POLICY "rutas_contenido_update_maestro" ON public."rutas_contenido" FOR UPDATE USING (((auth.uid() = creada_por) OR (auth.uid() = aprobada_por)));

-- ----------------------------------------------------------------------------
-- Tabla: public."salones"
-- ----------------------------------------------------------------------------
CREATE TABLE public."salones" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "nombre" text NOT NULL,
  "ubicacion" text,
  "descripcion" text,
  "activo" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "capacidad" integer DEFAULT 20,
  "codigo_salon" text,
  "piso" integer,
  "condicion_fisica" text DEFAULT 'buena'::text,
  "equipamiento" jsonb DEFAULT '[]'::jsonb,
  "responsable_id" uuid,
  "is_active" boolean,
  CONSTRAINT "salones_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "salones_nombre_key" UNIQUE (nombre),
  CONSTRAINT "unique_codigo_salon" UNIQUE (codigo_salon),
  CONSTRAINT "salones_responsable_id_fkey" FOREIGN KEY (responsable_id) REFERENCES maestros(id)
);

ALTER TABLE public."salones" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX salones_nombre_key ON public.salones USING btree (nombre);
CREATE UNIQUE INDEX unique_codigo_salon ON public.salones USING btree (codigo_salon);
CREATE POLICY "Permitir actualizar salones" ON public."salones" FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir crear salones" ON public."salones" FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir eliminar salones" ON public."salones" FOR DELETE USING (true);
CREATE POLICY "salones_admin_read" ON public."salones" FOR SELECT USING (es_admin());
CREATE POLICY "salones_authenticated_all" ON public."salones" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."schedule_run_feedback"
-- ----------------------------------------------------------------------------
CREATE TABLE public."schedule_run_feedback" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "run_id" uuid NOT NULL,
  "usuario_id" uuid NOT NULL,
  "comentario" text NOT NULL,
  "tipo" text DEFAULT 'observacion'::text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "schedule_run_feedback_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "schedule_run_feedback_tipo_check" CHECK ((tipo = ANY (ARRAY['observacion'::text, 'aprobacion'::text, 'rechazo'::text]))),
  CONSTRAINT "schedule_run_feedback_run_id_fkey" FOREIGN KEY (run_id) REFERENCES schedule_runs(id) ON DELETE CASCADE,
  CONSTRAINT "schedule_run_feedback_usuario_id_fkey" FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public."schedule_run_feedback" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."schedule_run_feedback" IS '-- DEPRECATED: telemetría de horarios pausada 2026-09 (Owner: ACM)';
CREATE INDEX idx_schedule_run_feedback_run_id ON public.schedule_run_feedback USING btree (run_id);
CREATE POLICY "admins_all_feedback" ON public."schedule_run_feedback" FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM maestros
  WHERE ((maestros.user_id = auth.uid()) AND (maestros.es_admin = true)))));
CREATE POLICY "authenticated_insert_feedback" ON public."schedule_run_feedback" FOR INSERT TO authenticated WITH CHECK ((usuario_id = auth.uid()));
CREATE POLICY "authenticated_select_feedback" ON public."schedule_run_feedback" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."schedule_runs"
-- ----------------------------------------------------------------------------
CREATE TABLE public."schedule_runs" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "periodo" text,
  "config" jsonb,
  "resultado" jsonb,
  "metricas" jsonb,
  "estado" text DEFAULT 'borrador'::text NOT NULL,
  "applied_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "schedule_runs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "schedule_runs_estado_check" CHECK ((estado = ANY (ARRAY['borrador'::text, 'revision'::text, 'publicado'::text, 'aplicado'::text])))
);

ALTER TABLE public."schedule_runs" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."schedule_runs" IS '-- DEPRECATED: motor algorítmico de horarios pausado 2026-09 (Owner: ACM)';
CREATE POLICY "authenticated_all_runs" ON public."schedule_runs" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."score_compromiso"
-- ----------------------------------------------------------------------------
CREATE TABLE public."score_compromiso" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "representante_id" uuid NOT NULL,
  "familia_id" uuid NOT NULL,
  "score" numeric NOT NULL,
  "nivel" character(1) NOT NULL,
  "puntualidad_pct" numeric,
  "consistencia_meses" integer,
  "voluntad_pago_pct" numeric,
  "comportamiento_mora_pct" numeric,
  "generosidad_pct" numeric,
  "calculado_en" timestamp with time zone DEFAULT now(),
  "ciclo_mes" integer NOT NULL,
  "ciclo_anio" integer NOT NULL,
  CONSTRAINT "score_compromiso_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "score_compromiso_nivel_check" CHECK ((nivel = ANY (ARRAY['A'::bpchar, 'B'::bpchar, 'C'::bpchar, 'D'::bpchar, 'E'::bpchar]))),
  CONSTRAINT "score_compromiso_representante_id_ciclo_mes_ciclo_anio_key" UNIQUE (representante_id, ciclo_mes, ciclo_anio),
  CONSTRAINT "score_compromiso_score_check" CHECK (((score >= (0)::numeric) AND (score <= (100)::numeric))),
  CONSTRAINT "score_compromiso_familia_id_fkey" FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT,
  CONSTRAINT "score_compromiso_representante_id_fkey" FOREIGN KEY (representante_id) REFERENCES representantes(id) ON DELETE RESTRICT
);

ALTER TABLE public."score_compromiso" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_score_representante_ciclo ON public.score_compromiso USING btree (representante_id, ciclo_anio DESC, ciclo_mes DESC);
CREATE UNIQUE INDEX score_compromiso_representante_id_ciclo_mes_ciclo_anio_key ON public.score_compromiso USING btree (representante_id, ciclo_mes, ciclo_anio);
CREATE POLICY "score_select_admin_only" ON public."score_compromiso" FOR SELECT USING ((get_user_role() = 'admin'::text));

-- ----------------------------------------------------------------------------
-- Tabla: public."sections"
-- ----------------------------------------------------------------------------
CREATE TABLE public."sections" (
  "id" text NOT NULL,
  "family" text NOT NULL,
  "default_day" text NOT NULL,
  "order_index" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

ALTER TABLE public."sections" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admin modify sections" ON public."sections" FOR ALL TO authenticated USING (is_app_admin()) WITH CHECK (is_app_admin());
CREATE POLICY "Allow public read sections" ON public."sections" FOR SELECT USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."seguimiento_ausencias_reinicio"
-- ----------------------------------------------------------------------------
CREATE TABLE public."seguimiento_ausencias_reinicio" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "alumno_id" uuid NOT NULL,
  "fecha_corte" timestamp with time zone DEFAULT now() NOT NULL,
  "motivo" text,
  "creado_por" uuid DEFAULT auth.uid(),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "seguimiento_ausencias_reinicio_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "seguimiento_ausencias_reinicio_alumno_id_fkey" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  CONSTRAINT "seguimiento_ausencias_reinicio_creado_por_fkey" FOREIGN KEY (creado_por) REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public."seguimiento_ausencias_reinicio" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_ausencias_reinicio_alumno ON public.seguimiento_ausencias_reinicio USING btree (alumno_id);
CREATE POLICY "ausencias_reinicio_select" ON public."seguimiento_ausencias_reinicio" FOR SELECT TO authenticated USING (true);
CREATE POLICY "ausencias_reinicio_write" ON public."seguimiento_ausencias_reinicio" FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());

-- ----------------------------------------------------------------------------
-- Tabla: public."seguimiento_reglas"
-- ----------------------------------------------------------------------------
CREATE TABLE public."seguimiento_reglas" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "nombre" text NOT NULL,
  "tipo" text NOT NULL,
  "descripcion" text,
  "config" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "activo" boolean DEFAULT true,
  "prioridad" integer DEFAULT 1,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "seguimiento_reglas_pkey" PRIMARY KEY ("id")
);

ALTER TABLE public."seguimiento_reglas" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rls_seguimiento_reglas_all" ON public."seguimiento_reglas" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."service_account_observations"
-- ----------------------------------------------------------------------------
CREATE TABLE public."service_account_observations" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "service_account_id" uuid NOT NULL,
  "observed_at" timestamp with time zone DEFAULT now() NOT NULL,
  "balance_centavos" bigint,
  "amount_due_centavos" bigint,
  "due_date" date,
  "days_remaining" integer,
  "last_query_at" timestamp with time zone,
  "last_success_at" timestamp with time zone,
  "last_status" text DEFAULT 'never'::text NOT NULL,
  "last_error_code" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "service_account_observations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "service_account_observations_last_status_check" CHECK ((last_status = ANY (ARRAY['never'::text, 'success'::text, 'unsupported'::text, 'skipped'::text, 'error'::text]))),
  CONSTRAINT "service_account_observations_service_account_id_fkey" FOREIGN KEY (service_account_id) REFERENCES service_accounts(id) ON DELETE CASCADE
);

ALTER TABLE public."service_account_observations" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_service_account_observations_account ON public.service_account_observations USING btree (service_account_id, observed_at DESC);
CREATE POLICY "service_account_observations_insert_finanzas_admin" ON public."service_account_observations" FOR INSERT WITH CHECK ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
CREATE POLICY "service_account_observations_select_finanzas_admin" ON public."service_account_observations" FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));

-- ----------------------------------------------------------------------------
-- Tabla: public."service_accounts"
-- ----------------------------------------------------------------------------
CREATE TABLE public."service_accounts" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "provider_key" text NOT NULL,
  "provider_name" text NOT NULL,
  "account_name" text NOT NULL,
  "service_type" text NOT NULL,
  "essential" boolean DEFAULT false NOT NULL,
  "refresh_enabled" boolean DEFAULT false NOT NULL,
  "connector_status" text DEFAULT 'unconfigured'::text NOT NULL,
  "currency_code" text DEFAULT 'DOP'::text NOT NULL,
  "activo" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid DEFAULT auth.uid(),
  CONSTRAINT "service_accounts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "service_accounts_connector_status_check" CHECK ((connector_status = ANY (ARRAY['unconfigured'::text, 'active'::text, 'disabled'::text, 'unsupported'::text])))
);

ALTER TABLE public."service_accounts" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_accounts_insert_finanzas_admin" ON public."service_accounts" FOR INSERT WITH CHECK ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
CREATE POLICY "service_accounts_select_finanzas_admin" ON public."service_accounts" FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
CREATE POLICY "service_accounts_update_admin" ON public."service_accounts" FOR UPDATE USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));

-- ----------------------------------------------------------------------------
-- Tabla: public."sesiones_clase"
-- ----------------------------------------------------------------------------
CREATE TABLE public."sesiones_clase" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "clase_id" uuid,
  "horario_id" uuid,
  "maestro_id" uuid NOT NULL,
  "salon_id" uuid,
  "fecha" date NOT NULL,
  "hora_inicio" time without time zone,
  "hora_fin" time without time zone,
  "tema_principal" text,
  "contenidos_trabajados" jsonb DEFAULT '[]'::jsonb,
  "observaciones_generales" text,
  "estado" text DEFAULT 'programada'::text NOT NULL,
  "cerrada_en" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "borrador" boolean DEFAULT false,
  "contenido" text,
  "contenido_dsl" text,
  "asistencia" jsonb DEFAULT '[]'::jsonb,
  "es_codocencia" boolean DEFAULT false,
  "actividad" text,
  "maestro_auxiliar_id" uuid,
  "motivo" text,
  "emergente_id" uuid,
  "node_id" uuid,
  "node_origen" text,
  "node_codigo" text,
  CONSTRAINT "sesiones_clase_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "sesiones_clase_clase_fecha_maestro_unique" UNIQUE (clase_id, fecha, maestro_id),
  CONSTRAINT "sesiones_clase_estado_check" CHECK ((estado = ANY (ARRAY['programada'::text, 'abierta'::text, 'asistencia_registrada'::text, 'progreso_registrado'::text, 'cerrada'::text, 'pendiente'::text, 'atrasada'::text, 'cancelada'::text, 'registrada'::text]))),
  CONSTRAINT "sesiones_clase_hora_check" CHECK (((hora_inicio IS NULL) OR (hora_fin IS NULL) OR (hora_fin > hora_inicio))),
  CONSTRAINT "sesiones_clase_node_codigo_chk" CHECK (((node_codigo IS NULL) OR (node_codigo = ANY (ARRAY['ESC'::text, 'ARP'::text, 'MI'::text, 'ARC'::text, 'SON'::text, 'AFI'::text, 'EST'::text, 'REP'::text])))),
  CONSTRAINT "sesiones_clase_node_origen_check" CHECK (((node_origen IS NULL) OR (node_origen = ANY (ARRAY['explicito'::text, 'derivado'::text, 'manual'::text])))),
  CONSTRAINT "sesiones_clase_unica" UNIQUE (clase_id, fecha, hora_inicio),
  CONSTRAINT "fk_sesiones_clase_clase" FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE,
  CONSTRAINT "fk_sesiones_clase_horario" FOREIGN KEY (horario_id) REFERENCES horarios(id) ON DELETE SET NULL,
  CONSTRAINT "fk_sesiones_clase_maestro" FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE RESTRICT,
  CONSTRAINT "fk_sesiones_clase_salon" FOREIGN KEY (salon_id) REFERENCES salones(id) ON DELETE SET NULL,
  CONSTRAINT "sesiones_clase_emergente_id_fkey" FOREIGN KEY (emergente_id) REFERENCES sesiones_clase(id) ON DELETE SET NULL,
  CONSTRAINT "sesiones_clase_maestro_auxiliar_id_fkey" FOREIGN KEY (maestro_auxiliar_id) REFERENCES maestros(id),
  CONSTRAINT "sesiones_clase_node_id_fkey" FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE SET NULL
);

ALTER TABLE public."sesiones_clase" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."sesiones_clase"."node_codigo" IS 'Categoria de trabajo de la sesion (ESC, ARP, MI, ARC, SON, AFI, EST, REP). Determinable desde el texto del maestro. Base de la metrica de cobertura.';
COMMENT ON COLUMN public."sesiones_clase"."node_id" IS 'Nodo curricular exacto, solo cuando el maestro lo elige explicitamente. Para cobertura usar node_codigo: el nivel no es determinable desde la sesion.';
COMMENT ON COLUMN public."sesiones_clase"."node_origen" IS 'Como se determino: explicito (el maestro escribio >CODIGO), derivado (inferido del texto y confirmado), manual (elegido en la interfaz).';
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
CREATE POLICY "Maestros pueden actualizar sus propias sesiones" ON public."sesiones_clase" FOR UPDATE TO authenticated USING ((maestro_id = maestro_actual())) WITH CHECK ((maestro_id = maestro_actual()));
CREATE POLICY "Maestros pueden crear sesiones de sus clases" ON public."sesiones_clase" FOR INSERT TO authenticated WITH CHECK ((maestro_en_clase(clase_id) AND (maestro_id = maestro_actual())));
CREATE POLICY "Maestros ven sus sesiones" ON public."sesiones_clase" FOR SELECT TO authenticated USING (((maestro_id = maestro_actual()) OR maestro_en_clase(clase_id)));
CREATE POLICY "sesiones_admin_insert" ON public."sesiones_clase" FOR INSERT TO authenticated WITH CHECK ((es_admin() OR (maestro_id = maestro_actual()) OR maestro_en_clase(clase_id)));
CREATE POLICY "sesiones_admin_select" ON public."sesiones_clase" FOR SELECT TO authenticated USING ((es_admin() OR (maestro_id = maestro_actual()) OR maestro_en_clase(clase_id)));
CREATE POLICY "sesiones_admin_update" ON public."sesiones_clase" FOR UPDATE TO authenticated USING ((es_admin() OR (maestro_id = maestro_actual()) OR maestro_en_clase(clase_id))) WITH CHECK ((es_admin() OR (maestro_id = maestro_actual()) OR maestro_en_clase(clase_id)));
CREATE POLICY "sesiones_clase_delete" ON public."sesiones_clase" FOR DELETE TO authenticated USING ((maestro_id = maestro_actual()));
CREATE POLICY "sesiones_superadmin_delete" ON public."sesiones_clase" FOR DELETE TO authenticated USING ((( SELECT is_super_admin() AS is_super_admin) = true));

-- ----------------------------------------------------------------------------
-- Tabla: public."signage_media"
-- ----------------------------------------------------------------------------
CREATE TABLE public."signage_media" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "pantalla_id" uuid,
  "tipo" text NOT NULL,
  "titulo" text,
  "credito" text,
  "storage_path" text,
  "youtube_url" text,
  "youtube_video_id" text,
  "duracion_seg" integer,
  "orden" integer DEFAULT 0 NOT NULL,
  "activo" boolean DEFAULT true NOT NULL,
  "vigente_desde" date,
  "vigente_hasta" date,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "contenido" jsonb,
  CONSTRAINT "signage_media_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "signage_media_fuente_chk" CHECK ((((tipo = 'youtube'::text) AND (youtube_url IS NOT NULL)) OR ((tipo = ANY (ARRAY['imagen'::text, 'video'::text])) AND (storage_path IS NOT NULL)) OR ((tipo = 'slide'::text) AND (contenido IS NOT NULL)))),
  CONSTRAINT "signage_media_tipo_check" CHECK ((tipo = ANY (ARRAY['imagen'::text, 'video'::text, 'youtube'::text, 'slide'::text]))),
  CONSTRAINT "signage_media_pantalla_id_fkey" FOREIGN KEY (pantalla_id) REFERENCES signage_pantallas(id) ON DELETE CASCADE
);

ALTER TABLE public."signage_media" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."signage_media" IS 'Playlist declarativa de la señalética (intención). El caché físico de YouTube y su estado de descarga viven en la Raspberry, no aquí.';
CREATE INDEX idx_signage_media_activo_orden ON public.signage_media USING btree (activo, orden);
CREATE INDEX idx_signage_media_pantalla ON public.signage_media USING btree (pantalla_id);
CREATE INDEX idx_signage_media_youtube ON public.signage_media USING btree (tipo) WHERE (tipo = 'youtube'::text);
CREATE POLICY "signage_media_admin_write" ON public."signage_media" FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "signage_media_anon_read" ON public."signage_media" FOR SELECT TO anon USING (true);
CREATE POLICY "signage_media_auth_read" ON public."signage_media" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."signage_pantallas"
-- ----------------------------------------------------------------------------
CREATE TABLE public."signage_pantallas" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "slug" text NOT NULL,
  "nombre" text NOT NULL,
  "ubicacion" text,
  "orientacion" text DEFAULT 'horizontal'::text NOT NULL,
  "ancho_px" integer DEFAULT 1280 NOT NULL,
  "alto_px" integer DEFAULT 720 NOT NULL,
  "layout" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "modo_nocturno" jsonb DEFAULT '{"desde": "21:00", "hasta": "06:00", "activo": true}'::jsonb NOT NULL,
  "activo" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "institucion" text,
  "siglas" text,
  "menu_portales" ARRAY DEFAULT '{}'::text[] NOT NULL,
  "logo_path" text,
  CONSTRAINT "signage_pantallas_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "signage_pantallas_orientacion_check" CHECK ((orientacion = ANY (ARRAY['horizontal'::text, 'vertical'::text]))),
  CONSTRAINT "signage_pantallas_slug_key" UNIQUE (slug)
);

ALTER TABLE public."signage_pantallas" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."signage_pantallas" IS 'Registro de pantallas de señalética. layout = jsonb con proporciones y ajustes de zona. Escrita por el portal Admin (es_admin), leída por la SPA de la Raspberry.';
CREATE UNIQUE INDEX signage_pantallas_slug_key ON public.signage_pantallas USING btree (slug);
CREATE POLICY "signage_pantallas_admin_write" ON public."signage_pantallas" FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "signage_pantallas_anon_read" ON public."signage_pantallas" FOR SELECT TO anon USING (true);
CREATE POLICY "signage_pantallas_auth_read" ON public."signage_pantallas" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."sim_actores"
-- ----------------------------------------------------------------------------
CREATE TABLE public."sim_actores" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "run_id" uuid NOT NULL,
  "tipo" sim_actor_tipo NOT NULL,
  "nombre_ficticio" text NOT NULL,
  "instrumento" text,
  "estado_pago" sim_estado_pago DEFAULT 'no_aplica'::sim_estado_pago NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "sim_actores_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "sim_actores_run_id_fkey" FOREIGN KEY (run_id) REFERENCES sim_runs(id) ON DELETE CASCADE
);

ALTER TABLE public."sim_actores" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."sim_actores" IS 'Datos 100% FICTICIOS para el sandbox del simulador (postulantes, alumnos, maestros, representantes). Nunca referencia entidades reales de producción.';
CREATE INDEX idx_sim_actores_run_tipo ON public.sim_actores USING btree (run_id, tipo);
CREATE POLICY "sim_actores_admin_write" ON public."sim_actores" FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "sim_actores_auth_read" ON public."sim_actores" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."sim_calendario"
-- ----------------------------------------------------------------------------
CREATE TABLE public."sim_calendario" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "run_id" uuid NOT NULL,
  "titulo" text NOT NULL,
  "descripcion" text,
  "categoria" event_categoria DEFAULT 'otro'::event_categoria NOT NULL,
  "fecha_inicio" timestamp with time zone NOT NULL,
  "fecha_fin" timestamp with time zone NOT NULL,
  "ubicacion" text,
  "departamento_responsable" soi_departamento DEFAULT 'DIR'::soi_departamento NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "estado" text DEFAULT 'programado'::text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "sim_calendario_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "sim_calendario_estado_check" CHECK ((estado = ANY (ARRAY['programado'::text, 'en_curso'::text, 'completado'::text, 'cancelado'::text]))),
  CONSTRAINT "sim_calendario_run_id_fkey" FOREIGN KEY (run_id) REFERENCES sim_runs(id) ON DELETE CASCADE
);

ALTER TABLE public."sim_calendario" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."sim_calendario" IS 'Espejo aislado de calendario_institucional para el sandbox del simulador. Nunca se referencia desde triggers de producción.';
CREATE INDEX idx_sim_calendario_run_fecha ON public.sim_calendario USING btree (run_id, fecha_inicio);
CREATE POLICY "sim_calendario_auth_all" ON public."sim_calendario" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."sim_config"
-- ----------------------------------------------------------------------------
CREATE TABLE public."sim_config" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "canal" sim_canal NOT NULL,
  "destino" text NOT NULL,
  "proveedor_llm" text DEFAULT 'groq'::text NOT NULL,
  "activo" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "sim_config_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "sim_config_canal_key" UNIQUE (canal),
  CONSTRAINT "sim_config_proveedor_llm_check" CHECK ((proveedor_llm = ANY (ARRAY['groq'::text, 'openrouter'::text])))
);

ALTER TABLE public."sim_config" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."sim_config" IS 'Whitelist server-side inviolable de destinos de envío (spec: simulador-salida-segura / Whitelist server-side inviolable). Un registro por canal.';
CREATE UNIQUE INDEX sim_config_canal_key ON public.sim_config USING btree (canal);
CREATE POLICY "sim_config_admin_write" ON public."sim_config" FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "sim_config_auth_read" ON public."sim_config" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."sim_log"
-- ----------------------------------------------------------------------------
CREATE TABLE public."sim_log" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "run_id" uuid NOT NULL,
  "fecha_simulada" timestamp with time zone NOT NULL,
  "departamento" soi_departamento NOT NULL,
  "agente" text NOT NULL,
  "accion" text NOT NULL,
  "evento_id" uuid,
  "payload" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "sim_log_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "sim_log_evento_id_fkey" FOREIGN KEY (evento_id) REFERENCES sim_calendario(id) ON DELETE SET NULL,
  CONSTRAINT "sim_log_run_id_fkey" FOREIGN KEY (run_id) REFERENCES sim_runs(id) ON DELETE CASCADE
);

ALTER TABLE public."sim_log" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."sim_log" IS 'Auditoría append-only de cada acción de agente. Base para la animación en tiempo real vía Supabase Realtime (ver RLS: SELECT abierto a authenticated).';
CREATE INDEX idx_sim_log_run_created ON public.sim_log USING btree (run_id, created_at);
CREATE INDEX idx_sim_log_run_fecha_simulada ON public.sim_log USING btree (run_id, fecha_simulada, id);
CREATE POLICY "sim_log_admin_write" ON public."sim_log" FOR INSERT TO authenticated WITH CHECK (es_admin());
CREATE POLICY "sim_log_auth_read" ON public."sim_log" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."sim_outbox"
-- ----------------------------------------------------------------------------
CREATE TABLE public."sim_outbox" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "run_id" uuid NOT NULL,
  "canal" sim_canal NOT NULL,
  "destinatario_original" text NOT NULL,
  "destinatario_redirigido" text NOT NULL,
  "asunto" text,
  "mensaje" text NOT NULL,
  "estado" sim_outbox_estado DEFAULT 'pendiente'::sim_outbox_estado NOT NULL,
  "error_msg" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "procesado_at" timestamp with time zone,
  CONSTRAINT "sim_outbox_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "sim_outbox_run_id_fkey" FOREIGN KEY (run_id) REFERENCES sim_runs(id) ON DELETE CASCADE
);

ALTER TABLE public."sim_outbox" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."sim_outbox"."destinatario_original" IS 'Destinatario que el LLM/agente decidió (texto libre, NUNCA usado para el envío real).';
COMMENT ON COLUMN public."sim_outbox"."destinatario_redirigido" IS 'Destinatario real de envío. SIEMPRE igual a la whitelist de sim_config, forzado server-side (edge function), independientemente de lo que decida el LLM. Ver spec: simulador-salida-segura.';
CREATE INDEX idx_sim_outbox_run ON public.sim_outbox USING btree (run_id);
CREATE POLICY "sim_outbox_admin_write" ON public."sim_outbox" FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "sim_outbox_auth_read" ON public."sim_outbox" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."sim_runs"
-- ----------------------------------------------------------------------------
CREATE TABLE public."sim_runs" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "nombre" text DEFAULT 'Simulación sin nombre'::text NOT NULL,
  "estado" sim_run_estado DEFAULT 'creado'::sim_run_estado NOT NULL,
  "velocidad" integer DEFAULT 10 NOT NULL,
  "fecha_inicio_virtual" timestamp with time zone NOT NULL,
  "fecha_fin_virtual" timestamp with time zone,
  "fecha_actual_virtual" timestamp with time zone,
  "creado_por" uuid,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "sim_runs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "sim_runs_velocidad_check" CHECK ((velocidad > 0)),
  CONSTRAINT "sim_runs_creado_por_fkey" FOREIGN KEY (creado_por) REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public."sim_runs" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."sim_runs"."velocidad" IS 'Segundos reales que dura 1 día simulado en el reloj virtual del frontend.';
CREATE POLICY "sim_runs_auth_all" ON public."sim_runs" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."sim_tareas"
-- ----------------------------------------------------------------------------
CREATE TABLE public."sim_tareas" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "run_id" uuid NOT NULL,
  "event_id" uuid,
  "titulo" text NOT NULL,
  "descripcion" text,
  "departamento" soi_departamento DEFAULT 'DIR'::soi_departamento NOT NULL,
  "asignado_a" text,
  "estado" tarea_institucional_estado DEFAULT 'pendiente'::tarea_institucional_estado NOT NULL,
  "prioridad" tarea_institucional_prioridad DEFAULT 'media'::tarea_institucional_prioridad NOT NULL,
  "fecha_vencimiento" date,
  "checklist" jsonb DEFAULT '[]'::jsonb,
  "feedback" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "sim_tareas_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "sim_tareas_event_id_fkey" FOREIGN KEY (event_id) REFERENCES sim_calendario(id) ON DELETE CASCADE,
  CONSTRAINT "sim_tareas_run_id_fkey" FOREIGN KEY (run_id) REFERENCES sim_runs(id) ON DELETE CASCADE
);

ALTER TABLE public."sim_tareas" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."sim_tareas" IS 'Espejo aislado de tareas_institucionales para el sandbox del simulador.';
CREATE INDEX idx_sim_tareas_run ON public.sim_tareas USING btree (run_id);
CREATE POLICY "sim_tareas_admin_write" ON public."sim_tareas" FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "sim_tareas_auth_read" ON public."sim_tareas" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."soi_analisis_semanal"
-- ----------------------------------------------------------------------------
CREATE TABLE public."soi_analisis_semanal" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "periodo_inicio" timestamp with time zone NOT NULL,
  "periodo_fin" timestamp with time zone NOT NULL,
  "total_eventos_analizados" integer DEFAULT 0 NOT NULL,
  "resumen_ejecutivo" text NOT NULL,
  "patrones" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "tendencias" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "recomendaciones" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "score_promedio" numeric,
  "modelo_usado" text DEFAULT 'llama-3.3-70b-versatile'::text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "soi_analisis_semanal_pkey" PRIMARY KEY ("id")
);

ALTER TABLE public."soi_analisis_semanal" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_soi_analisis_semanal_created ON public.soi_analisis_semanal USING btree (created_at DESC);
CREATE POLICY "soi_analisis_semanal_auth_select" ON public."soi_analisis_semanal" FOR SELECT TO authenticated USING (true);
CREATE POLICY "soi_analisis_semanal_service_all" ON public."soi_analisis_semanal" FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."soi_event_bus"
-- ----------------------------------------------------------------------------
CREATE TABLE public."soi_event_bus" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "tipo" text NOT NULL,
  "origen" text NOT NULL,
  "payload" jsonb NOT NULL,
  "procesado" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "soi_event_bus_pkey" PRIMARY KEY ("id")
);

ALTER TABLE public."soi_event_bus" ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public."soi_event_bus" IS 'Bus de eventos interno. Solo service_role: sin politica para authenticated, el cliente no accede.';
CREATE INDEX idx_soi_event_bus_procesado ON public.soi_event_bus USING btree (procesado);
CREATE INDEX idx_soi_event_bus_tipo ON public.soi_event_bus USING btree (tipo);
CREATE POLICY "soi_event_bus_service_only" ON public."soi_event_bus" FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."soi_eventos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."soi_eventos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "tipo" text NOT NULL,
  "entidad_tipo" text NOT NULL,
  "entidad_id" uuid,
  "actor_id" uuid,
  "payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "correlation_id" uuid,
  "procesado" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "soi_eventos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "check_soi_eventos_tipo" CHECK ((tipo = ANY (ARRAY['sesion.creada'::text, 'sesion.completada'::text, 'sesion.cancelada'::text, 'asistencia.registrada'::text, 'asistencia.falta_injustificada'::text, 'asistencia.falta_justificada'::text, 'tarea.creada'::text, 'tarea.completada'::text, 'tarea.escalada'::text, 'tarea.vencida'::text, 'justificacion.solicitada'::text, 'justificacion.aprobada'::text, 'justificacion.rechazada'::text, 'periodo.abierto'::text, 'periodo.cerrado'::text])))
);

ALTER TABLE public."soi_eventos" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_soi_eventos_correlation ON public.soi_eventos USING btree (correlation_id);
CREATE INDEX idx_soi_eventos_entity_timeline ON public.soi_eventos USING btree (entidad_id, created_at DESC);
CREATE INDEX idx_soi_eventos_procesado_queue ON public.soi_eventos USING btree (procesado, created_at) WHERE (procesado = false);
CREATE INDEX idx_soi_eventos_tipo_timeline ON public.soi_eventos USING btree (tipo, created_at DESC);
CREATE POLICY "soi_eventos_acm_select" ON public."soi_eventos" FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'ACM'::text) AND (entidad_tipo = ANY (ARRAY['sesiones_clase'::text, 'asistencias'::text, 'periodos'::text]))));
CREATE POLICY "soi_eventos_adm_select" ON public."soi_eventos" FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'ADM'::text) AND (entidad_tipo = ANY (ARRAY['justificaciones'::text, 'periodos'::text]))));
CREATE POLICY "soi_eventos_dir_select" ON public."soi_eventos" FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'DIR'::text)));
CREATE POLICY "soi_eventos_fin_select" ON public."soi_eventos" FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'FIN'::text) AND false));
CREATE POLICY "soi_eventos_immutable_delete" ON public."soi_eventos" FOR DELETE USING (false);
CREATE POLICY "soi_eventos_immutable_update" ON public."soi_eventos" FOR UPDATE USING (false) WITH CHECK (false);
CREATE POLICY "soi_eventos_log_select" ON public."soi_eventos" FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'LOG'::text) AND (entidad_tipo = 'tareas_institucionales'::text)));
CREATE POLICY "soi_eventos_service_role_all" ON public."soi_eventos" FOR ALL USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));
CREATE POLICY "soi_eventos_tecnico_select" ON public."soi_eventos" FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (get_user_department() = 'TECNICO'::text) AND false));

-- ----------------------------------------------------------------------------
-- Tabla: public."soi_process_contracts"
-- ----------------------------------------------------------------------------
CREATE TABLE public."soi_process_contracts" (
  "process_code" text NOT NULL,
  "process_name" text NOT NULL,
  "department_owner" text NOT NULL,
  "canonical_doc_path" text NOT NULL,
  "doc_id" text,
  "trigger_type" text DEFAULT 'manual'::text NOT NULL,
  "required_evidence" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "closure_criteria" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "responsible_departments" ARRAY DEFAULT ARRAY[]::text[] NOT NULL,
  "task_templates" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "automation_status" text DEFAULT 'manual'::text NOT NULL,
  "recurrence_count" integer DEFAULT 0 NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "soi_process_contracts_pkey" PRIMARY KEY ("process_code"),
  CONSTRAINT "soi_process_contracts_automation_status_check" CHECK ((automation_status = ANY (ARRAY['manual'::text, 'semi_auto'::text, 'automated'::text, 'deprecated'::text]))),
  CONSTRAINT "soi_process_contracts_recurrence_count_check" CHECK ((recurrence_count >= 0)),
  CONSTRAINT "soi_process_contracts_trigger_type_check" CHECK ((trigger_type = ANY (ARRAY['manual'::text, 'event'::text, 'scheduled'::text, 'data_driven'::text, 'conversation'::text])))
);

ALTER TABLE public."soi_process_contracts" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."soi_process_contracts"."canonical_doc_path" IS 'Ruta al documento canonico del proceso en la documentacion SOI.';
COMMENT ON COLUMN public."soi_process_contracts"."process_code" IS 'Codigo canonico del proceso SOI, por ejemplo FIN-P13, ACM-P02 u OPR-P10.';
COMMENT ON COLUMN public."soi_process_contracts"."task_templates" IS 'Plantillas JSONB de tareas departamentales que Hermes puede instanciar al abrir un caso.';
COMMENT ON TABLE public."soi_process_contracts" IS 'Contrato digital ejecutable de un proceso SOI documentado. No reemplaza la ficha canonica; la vuelve operable por Hermes.';
CREATE INDEX idx_soi_process_contracts_active ON public.soi_process_contracts USING btree (active) WHERE (active = true);
CREATE INDEX idx_soi_process_contracts_automation ON public.soi_process_contracts USING btree (automation_status);
CREATE INDEX idx_soi_process_contracts_owner ON public.soi_process_contracts USING btree (department_owner);
CREATE POLICY "soi_process_contracts_auth_read" ON public."soi_process_contracts" FOR SELECT TO authenticated USING (true);
CREATE POLICY "soi_process_contracts_auth_write" ON public."soi_process_contracts" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."soi_rule_effectiveness"
-- ----------------------------------------------------------------------------
CREATE TABLE public."soi_rule_effectiveness" (
  "rule_type" text NOT NULL,
  "nombre" text NOT NULL,
  "total_activaciones" integer DEFAULT 0 NOT NULL,
  "casos_resueltos" integer DEFAULT 0 NOT NULL,
  "tasa_exito" numeric DEFAULT 100.00 NOT NULL,
  "tiempo_promedio_horas" numeric DEFAULT 0.00,
  "ultima_activacion" timestamp with time zone,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "soi_rule_effectiveness_pkey" PRIMARY KEY ("rule_type")
);

ALTER TABLE public."soi_rule_effectiveness" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "soi_rule_effectiveness_auth_select" ON public."soi_rule_effectiveness" FOR SELECT TO authenticated USING (true);
CREATE POLICY "soi_rule_effectiveness_service_all" ON public."soi_rule_effectiveness" FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."solicitudes_ausencia"
-- ----------------------------------------------------------------------------
CREATE TABLE public."solicitudes_ausencia" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "maestro_id" uuid NOT NULL,
  "fecha_ausencia" date NOT NULL,
  "motivo" text,
  "contenido_reemplazo" text,
  "suplente_id" uuid,
  "dinamica_trabajo" text,
  "estado" text DEFAULT 'pendiente'::text,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "solicitudes_ausencia_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "solicitudes_ausencia_estado_check" CHECK ((estado = ANY (ARRAY['pendiente'::text, 'aprobada'::text, 'rechazada'::text])))
);

ALTER TABLE public."solicitudes_ausencia" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_solicitudes_ausencia_maestro ON public.solicitudes_ausencia USING btree (maestro_id);
CREATE POLICY "solicitudes_ausencia_admin_read" ON public."solicitudes_ausencia" FOR SELECT USING (es_admin());
CREATE POLICY "solicitudes_ausencia_own" ON public."solicitudes_ausencia" FOR ALL TO authenticated USING ((maestro_id = maestro_actual())) WITH CHECK ((maestro_id = maestro_actual()));

-- ----------------------------------------------------------------------------
-- Tabla: public."solicitudes_necesidades"
-- ----------------------------------------------------------------------------
CREATE TABLE public."solicitudes_necesidades" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "maestro_id" uuid NOT NULL,
  "maestro_nombre" text,
  "tipo_necesidad" text NOT NULL,
  "categoria" text,
  "titulo" text NOT NULL,
  "descripcion" text NOT NULL,
  "prioridad" text DEFAULT 'media'::text NOT NULL,
  "cantidad" integer,
  "area" text,
  "observaciones" text,
  "estado" text DEFAULT 'pendiente'::text NOT NULL,
  "respuesta_admin" text,
  "fecha_solicitud" date DEFAULT CURRENT_DATE,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "correlation_id" uuid,
  "link_tienda" text,
  "costo_estimado" numeric,
  "presupuesto" numeric,
  "departamento_actual" text,
  "pre_aprobada_por" uuid,
  "presupuestado_por" uuid,
  CONSTRAINT "solicitudes_necesidades_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "solicitudes_necesidades_estado_check" CHECK ((estado = ANY (ARRAY['pendiente'::text, 'pre_aprobada_acm'::text, 'rechazada_acm'::text, 'en_presupuesto'::text, 'presupuestada'::text, 'aprobada'::text, 'rechazada'::text, 'comprada'::text, 'entregada'::text, 'cancelada'::text]))),
  CONSTRAINT "solicitudes_necesidades_prioridad_check" CHECK ((prioridad = ANY (ARRAY['baja'::text, 'media'::text, 'alta'::text, 'urgente'::text])))
);

ALTER TABLE public."solicitudes_necesidades" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."solicitudes_necesidades"."correlation_id" IS 'Caso Hermes asociado a la solicitud. Se usa para ruteo ACM -> FIN y auditoria.';
COMMENT ON COLUMN public."solicitudes_necesidades"."costo_estimado" IS 'Costo estimado inicial declarado o inferido en etapa ACM.';
COMMENT ON COLUMN public."solicitudes_necesidades"."departamento_actual" IS 'Departamento Hermes que tiene la solicitud en curso (ACM o FIN).';
COMMENT ON COLUMN public."solicitudes_necesidades"."link_tienda" IS 'URL de referencia de tienda para solicitudes de tipo accesorio.';
COMMENT ON COLUMN public."solicitudes_necesidades"."pre_aprobada_por" IS 'Usuario de profiles.id que pre-aprobo la solicitud en ACM.';
COMMENT ON COLUMN public."solicitudes_necesidades"."presupuestado_por" IS 'Usuario de profiles.id que cargo el presupuesto en FIN.';
COMMENT ON COLUMN public."solicitudes_necesidades"."presupuesto" IS 'Presupuesto aprobado o propuesto en etapa FIN.';
CREATE POLICY "solic_insert_own" ON public."solicitudes_necesidades" FOR INSERT TO authenticated WITH CHECK ((maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))));
CREATE POLICY "solic_select_owner_acm_fin_admin" ON public."solicitudes_necesidades" FOR SELECT TO authenticated USING (((maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'admin'::text)))) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'finanzas'::text))))));
CREATE POLICY "solic_update_acm_admin_stage" ON public."solicitudes_necesidades" FOR UPDATE TO authenticated USING (((estado = 'pendiente'::text) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'admin'::text)))))) WITH CHECK (((estado = ANY (ARRAY['pre_aprobada_acm'::text, 'rechazada_acm'::text, 'en_presupuesto'::text])) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'admin'::text))))));
CREATE POLICY "solic_update_admin_override" ON public."solicitudes_necesidades" FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'admin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'admin'::text)))));
CREATE POLICY "solic_update_fin_admin_cajero_stage" ON public."solicitudes_necesidades" FOR UPDATE TO authenticated USING (((estado = ANY (ARRAY['en_presupuesto'::text, 'presupuestada'::text])) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = ANY (ARRAY['admin'::text, 'finanzas'::text]))))))) WITH CHECK (((estado = ANY (ARRAY['presupuestada'::text, 'aprobada'::text, 'rechazada'::text, 'comprada'::text, 'entregada'::text])) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = ANY (ARRAY['admin'::text, 'finanzas'::text])))))));
CREATE POLICY "solic_update_owner_cancel" ON public."solicitudes_necesidades" FOR UPDATE TO authenticated USING (((estado = 'pendiente'::text) AND (maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid()))))) WITH CHECK (((estado = 'cancelada'::text) AND (maestro_id IN ( SELECT maestros.id
   FROM maestros
  WHERE (maestros.user_id = auth.uid())))));

-- ----------------------------------------------------------------------------
-- Tabla: public."solicitudes_permisos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."solicitudes_permisos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "maestro_id" uuid NOT NULL,
  "tipos" jsonb NOT NULL,
  "estado" text DEFAULT 'pendiente'::text,
  "creado_en" timestamp with time zone DEFAULT now(),
  "aprobado_en" timestamp with time zone,
  "aprobado_por" uuid,
  "solicita_alumnos" boolean DEFAULT false,
  "solicita_clases" boolean DEFAULT false,
  "motivo_rechazo" text,
  CONSTRAINT "solicitudes_permisos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "solicitudes_permisos_aprobado_por_fkey" FOREIGN KEY (aprobado_por) REFERENCES auth.users(id),
  CONSTRAINT "solicitudes_permisos_maestro_id_fkey" FOREIGN KEY (maestro_id) REFERENCES maestros(id)
);

ALTER TABLE public."solicitudes_permisos" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_solicitudes_estado ON public.solicitudes_permisos USING btree (estado);
CREATE INDEX idx_solicitudes_maestro_id ON public.solicitudes_permisos USING btree (maestro_id);
CREATE POLICY "Admin puede ver y actualizar todas" ON public."solicitudes_permisos" FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "Maestro puede crear su solicitud" ON public."solicitudes_permisos" FOR INSERT TO authenticated WITH CHECK ((maestro_id IN ( SELECT m.id
   FROM maestros m
  WHERE (m.user_id = auth.uid()))));
CREATE POLICY "Maestro puede ver su solicitud" ON public."solicitudes_permisos" FOR SELECT TO authenticated USING (((maestro_id IN ( SELECT m.id
   FROM maestros m
  WHERE (m.user_id = auth.uid()))) OR es_admin()));

-- ----------------------------------------------------------------------------
-- Tabla: public."student_case_actions"
-- ----------------------------------------------------------------------------
CREATE TABLE public."student_case_actions" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "case_id" uuid NOT NULL,
  "alumno_id" uuid,
  "tipo" text NOT NULL,
  "titulo" text NOT NULL,
  "descripcion" text,
  "resultado" text,
  "fecha_accion" timestamp with time zone DEFAULT now(),
  "proxima_accion" text,
  "proxima_accion_fecha" date,
  "documento_id" uuid,
  "registrado_por" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "student_case_actions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "student_case_actions_alumno_id_fkey" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL,
  CONSTRAINT "student_case_actions_case_id_fkey" FOREIGN KEY (case_id) REFERENCES student_cases(id) ON DELETE CASCADE
);

ALTER TABLE public."student_case_actions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rls_student_case_actions_all" ON public."student_case_actions" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."student_case_alerts"
-- ----------------------------------------------------------------------------
CREATE TABLE public."student_case_alerts" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "alumno_id" uuid,
  "alumno_nombre" text,
  "case_id" uuid,
  "tipo" text NOT NULL,
  "nivel_riesgo" text NOT NULL,
  "titulo" text NOT NULL,
  "descripcion" text,
  "evidencia" jsonb DEFAULT '{}'::jsonb,
  "estado" text DEFAULT 'pendiente'::text NOT NULL,
  "detectada_en" timestamp with time zone DEFAULT now(),
  "revisada_por" uuid,
  "revisada_en" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "student_case_alerts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "student_case_alerts_estado_check" CHECK ((estado = ANY (ARRAY['pendiente'::text, 'revisada'::text, 'convertida_en_caso'::text, 'descartada'::text, 'archivada'::text]))),
  CONSTRAINT "student_case_alerts_nivel_riesgo_check" CHECK ((nivel_riesgo = ANY (ARRAY['bajo'::text, 'medio'::text, 'alto'::text, 'critico'::text]))),
  CONSTRAINT "student_case_alerts_alumno_id_fkey" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL,
  CONSTRAINT "student_case_alerts_case_id_fkey" FOREIGN KEY (case_id) REFERENCES student_cases(id) ON DELETE SET NULL
);

ALTER TABLE public."student_case_alerts" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rls_student_case_alerts_all" ON public."student_case_alerts" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."student_case_events"
-- ----------------------------------------------------------------------------
CREATE TABLE public."student_case_events" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "case_id" uuid NOT NULL,
  "tipo" text NOT NULL,
  "titulo" text NOT NULL,
  "descripcion" text,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "actor_id" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "student_case_events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "student_case_events_case_id_fkey" FOREIGN KEY (case_id) REFERENCES student_cases(id) ON DELETE CASCADE
);

ALTER TABLE public."student_case_events" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rls_student_case_events_all" ON public."student_case_events" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."student_cases"
-- ----------------------------------------------------------------------------
CREATE TABLE public."student_cases" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "alumno_id" uuid,
  "alumno_nombre" text,
  "tipo" text NOT NULL,
  "titulo" text NOT NULL,
  "descripcion" text,
  "nivel_riesgo" text DEFAULT 'bajo'::text NOT NULL,
  "estado" text DEFAULT 'abierto'::text NOT NULL,
  "origen" text DEFAULT 'manual'::text NOT NULL,
  "responsable_id" uuid,
  "fecha_apertura" date DEFAULT CURRENT_DATE,
  "fecha_cierre" date,
  "resumen_actual" text,
  "proxima_accion" text,
  "proxima_accion_fecha" date,
  "ultimo_contacto_en" timestamp with time zone,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "student_cases_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "student_cases_estado_check" CHECK ((estado = ANY (ARRAY['abierto'::text, 'en_seguimiento'::text, 'resuelto'::text, 'escalado'::text, 'archivado'::text]))),
  CONSTRAINT "student_cases_nivel_riesgo_check" CHECK ((nivel_riesgo = ANY (ARRAY['bajo'::text, 'medio'::text, 'alto'::text, 'critico'::text]))),
  CONSTRAINT "student_cases_origen_check" CHECK ((origen = ANY (ARRAY['automatico'::text, 'manual'::text, 'observacion_maestro'::text, 'asistencia'::text, 'justificacion'::text, 'admin'::text]))),
  CONSTRAINT "student_cases_alumno_id_fkey" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL
);

ALTER TABLE public."student_cases" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rls_student_cases_all" ON public."student_cases" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."student_indicator_progress"
-- ----------------------------------------------------------------------------
CREATE TABLE public."student_indicator_progress" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "student_id" uuid NOT NULL,
  "indicator_id" uuid NOT NULL,
  "session_id" uuid,
  "status" text DEFAULT 'not_started'::text NOT NULL,
  "score" numeric,
  "observation" text,
  "evidence_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "student_indicator_progress_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "student_indicator_progress_unique" UNIQUE (student_id, indicator_id),
  CONSTRAINT "student_indicator_progress_indicator_id_fkey" FOREIGN KEY (indicator_id) REFERENCES indicators(id) ON DELETE CASCADE,
  CONSTRAINT "student_indicator_progress_session_id_fkey" FOREIGN KEY (session_id) REFERENCES teacher_class_sessions(id) ON DELETE SET NULL,
  CONSTRAINT "student_indicator_progress_student_id_fkey" FOREIGN KEY (student_id) REFERENCES alumnos(id) ON DELETE CASCADE
);

ALTER TABLE public."student_indicator_progress" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX student_indicator_progress_unique ON public.student_indicator_progress USING btree (student_id, indicator_id);
CREATE POLICY "student_indicator_progress_scoped" ON public."student_indicator_progress" FOR ALL TO authenticated USING ((es_admin() OR (EXISTS ( SELECT 1
   FROM teacher_class_sessions s
  WHERE ((s.id = student_indicator_progress.session_id) AND (s.teacher_id = maestro_actual())))))) WITH CHECK ((es_admin() OR (EXISTS ( SELECT 1
   FROM teacher_class_sessions s
  WHERE ((s.id = student_indicator_progress.session_id) AND (s.teacher_id = maestro_actual()))))));

-- ----------------------------------------------------------------------------
-- Tabla: public."system_config"
-- ----------------------------------------------------------------------------
CREATE TABLE public."system_config" (
  "key" character varying(100) NOT NULL,
  "value" text,
  "description" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "system_config_pkey" PRIMARY KEY ("key")
);

ALTER TABLE public."system_config" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."system_config"."key" IS 'Clave de configuración (ej: groq_api_key, openrouter_api_key, preferred_ai_model)';
COMMENT ON COLUMN public."system_config"."value" IS 'Valor de la configuración (ej: gsk_xxxx, sk-or-xxxx, google/gemini-2.0-flash-exp)';
COMMENT ON TABLE public."system_config" IS 'Tabla de configuración del sistema - API keys, settings globales';
CREATE POLICY "admin_read_system_config" ON public."system_config" FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.rol = 'admin'::text) AND (p.estado = 'activo'::text)))));
CREATE POLICY "admin_write_system_config" ON public."system_config" FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.rol = 'admin'::text) AND (p.estado = 'activo'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.rol = 'admin'::text) AND (p.estado = 'activo'::text)))));
CREATE POLICY "system_config_admin_read" ON public."system_config" FOR SELECT USING (es_admin());
CREATE POLICY "system_config_public_keys_read" ON public."system_config" FOR SELECT TO authenticated USING (((key)::text <> ALL ((ARRAY['groq_api_key'::character varying, 'openrouter_api_key'::character varying, 'vapid_private_key'::character varying, 'admin_invite_code'::character varying, 'telegram_monitor_healthcheck_secret'::character varying])::text[])));

-- ----------------------------------------------------------------------------
-- Tabla: public."tarea_comentarios"
-- ----------------------------------------------------------------------------
CREATE TABLE public."tarea_comentarios" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "tarea_id" uuid NOT NULL,
  "autor_id" uuid,
  "autor_nombre" text,
  "cuerpo" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "tarea_comentarios_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "tarea_comentarios_tarea_id_fkey" FOREIGN KEY (tarea_id) REFERENCES tareas_institucionales(id) ON DELETE CASCADE
);

ALTER TABLE public."tarea_comentarios" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_tarea_comentarios_tarea ON public.tarea_comentarios USING btree (tarea_id, created_at);
CREATE POLICY "tc_auth_all" ON public."tarea_comentarios" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."tarea_historial"
-- ----------------------------------------------------------------------------
CREATE TABLE public."tarea_historial" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "tarea_id" uuid NOT NULL,
  "campo" text NOT NULL,
  "valor_anterior" text,
  "valor_nuevo" text,
  "actor_id" uuid,
  "actor_nombre" text,
  "actor_rol" text,
  "actor_departamento" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "tarea_historial_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "tarea_historial_tarea_id_fkey" FOREIGN KEY (tarea_id) REFERENCES tareas_institucionales(id) ON DELETE CASCADE
);

ALTER TABLE public."tarea_historial" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_tarea_historial_tarea ON public.tarea_historial USING btree (tarea_id, created_at);
CREATE POLICY "th_auth_read" ON public."tarea_historial" FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."tarea_logs"
-- ----------------------------------------------------------------------------
CREATE TABLE public."tarea_logs" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "tarea_id" uuid NOT NULL,
  "evento" text NOT NULL,
  "cambios" jsonb,
  "changed_by" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "tarea_logs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "tarea_logs_changed_by_fkey" FOREIGN KEY (changed_by) REFERENCES auth.users(id) ON DELETE RESTRICT,
  CONSTRAINT "tarea_logs_tarea_id_fkey" FOREIGN KEY (tarea_id) REFERENCES tareas_calendario(id) ON DELETE CASCADE
);

ALTER TABLE public."tarea_logs" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "logs_admin" ON public."tarea_logs" FOR SELECT USING ((get_user_role() = 'admin'::text));
CREATE POLICY "logs_own_tarea" ON public."tarea_logs" FOR SELECT USING ((tarea_id IN ( SELECT tareas_calendario.id
   FROM tareas_calendario
  WHERE (tareas_calendario.departamento_id IN ( SELECT usuario_departamentos.departamento_id
           FROM usuario_departamentos
          WHERE (usuario_departamentos.user_id = auth.uid()))))));

-- ----------------------------------------------------------------------------
-- Tabla: public."tareas_caja"
-- ----------------------------------------------------------------------------
CREATE TABLE public."tareas_caja" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "titulo" text NOT NULL,
  "descripcion" text,
  "tipo" tarea_tipo DEFAULT 'otro'::tarea_tipo NOT NULL,
  "asignado_a" uuid,
  "familia_id" uuid,
  "alumno_id" uuid,
  "referencia_id" uuid,
  "estado" tarea_estado DEFAULT 'pendiente'::tarea_estado NOT NULL,
  "prioridad" tarea_prioridad DEFAULT 'media'::tarea_prioridad NOT NULL,
  "fecha_vencimiento" date,
  "recurrente" boolean DEFAULT false,
  "patron_recurrencia" jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "tareas_caja_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "tareas_caja_alumno_id_fkey" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL,
  CONSTRAINT "tareas_caja_asignado_a_fkey" FOREIGN KEY (asignado_a) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT "tareas_caja_familia_id_fkey" FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE SET NULL
);

ALTER TABLE public."tareas_caja" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tareas_all_admin" ON public."tareas_caja" FOR ALL USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
CREATE POLICY "tareas_insert_cajero_admin" ON public."tareas_caja" FOR INSERT WITH CHECK ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
CREATE POLICY "tareas_select_own_cajero" ON public."tareas_caja" FOR SELECT USING (((get_user_role() = 'finanzas'::text) AND (asignado_a = auth.uid())));
CREATE POLICY "tareas_update_own_cajero" ON public."tareas_caja" FOR UPDATE USING (((get_user_role() = 'finanzas'::text) AND (asignado_a = auth.uid()))) WITH CHECK (((get_user_role() = 'finanzas'::text) AND (asignado_a = auth.uid())));

-- ----------------------------------------------------------------------------
-- Tabla: public."tareas_calendario"
-- ----------------------------------------------------------------------------
CREATE TABLE public."tareas_calendario" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "evento_id" uuid NOT NULL,
  "departamento_id" uuid NOT NULL,
  "titulo" text NOT NULL,
  "descripcion" text,
  "fecha_vencimiento" date NOT NULL,
  "estado" text DEFAULT 'pendiente'::text,
  "asignado_a" uuid,
  "prioridad" text DEFAULT 'media'::text,
  "generada_por" text DEFAULT 'hermes'::text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "tareas_calendario_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "tareas_calendario_asignado_a_fkey" FOREIGN KEY (asignado_a) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT "tareas_calendario_departamento_id_fkey" FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE,
  CONSTRAINT "tareas_calendario_evento_id_fkey" FOREIGN KEY (evento_id) REFERENCES calendario(id) ON DELETE CASCADE
);

ALTER TABLE public."tareas_calendario" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_tareas_departamento ON public.tareas_calendario USING btree (departamento_id);
CREATE INDEX idx_tareas_estado ON public.tareas_calendario USING btree (estado);
CREATE INDEX idx_tareas_evento ON public.tareas_calendario USING btree (evento_id);
CREATE POLICY "tareas_admin_all" ON public."tareas_calendario" FOR ALL USING ((get_user_role() = 'admin'::text));
CREATE POLICY "tareas_select_own_dept" ON public."tareas_calendario" FOR SELECT USING (((departamento_id IN ( SELECT usuario_departamentos.departamento_id
   FROM usuario_departamentos
  WHERE (usuario_departamentos.user_id = auth.uid()))) OR (asignado_a = auth.uid())));
CREATE POLICY "tareas_update_own" ON public."tareas_calendario" FOR UPDATE USING (((asignado_a = auth.uid()) OR (departamento_id IN ( SELECT usuario_departamentos.departamento_id
   FROM usuario_departamentos
  WHERE ((usuario_departamentos.user_id = auth.uid()) AND (usuario_departamentos.rol = 'jefe'::text))))));

-- ----------------------------------------------------------------------------
-- Tabla: public."tareas_institucionales"
-- ----------------------------------------------------------------------------
CREATE TABLE public."tareas_institucionales" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "event_id" uuid,
  "titulo" text NOT NULL,
  "descripcion" text,
  "departamento" soi_departamento DEFAULT 'DIR'::soi_departamento NOT NULL,
  "asignado_a" text,
  "estado" tarea_institucional_estado DEFAULT 'pendiente'::tarea_institucional_estado NOT NULL,
  "prioridad" tarea_institucional_prioridad DEFAULT 'media'::tarea_institucional_prioridad NOT NULL,
  "fecha_vencimiento" date,
  "checklist" jsonb DEFAULT '[]'::jsonb,
  "feedback" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "minuta_id" uuid,
  "documentos_adjuntos" jsonb DEFAULT '[]'::jsonb,
  "entidad_tipo" text,
  "entidad_id" uuid,
  "entidad_label" text,
  "correlation_id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "updated_by" uuid,
  "updated_by_nombre" text,
  "process_code" text,
  "dependencia_tarea_id" uuid,
  "depende_de_tarea_id" uuid,
  "t_minus_dias" integer,
  "source_event_id" uuid,
  CONSTRAINT "tareas_institucionales_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "tareas_entidad_tipo_check" CHECK (((entidad_tipo IS NULL) OR (entidad_tipo = ANY (ARRAY['alumno'::text, 'maestro'::text, 'postulante'::text, 'representante'::text, 'instrumento'::text, 'evento'::text, 'otro'::text])))),
  CONSTRAINT "tareas_institucionales_depende_de_tarea_id_fkey" FOREIGN KEY (depende_de_tarea_id) REFERENCES tareas_institucionales(id) ON DELETE SET NULL,
  CONSTRAINT "tareas_institucionales_dependencia_tarea_id_fkey" FOREIGN KEY (dependencia_tarea_id) REFERENCES tareas_institucionales(id) ON DELETE SET NULL,
  CONSTRAINT "tareas_institucionales_event_id_fkey" FOREIGN KEY (event_id) REFERENCES calendario_institucional(id) ON DELETE CASCADE,
  CONSTRAINT "tareas_institucionales_minuta_id_fkey" FOREIGN KEY (minuta_id) REFERENCES minutas(id) ON DELETE SET NULL,
  CONSTRAINT "tareas_institucionales_process_code_fkey" FOREIGN KEY (process_code) REFERENCES soi_process_contracts(process_code) ON UPDATE CASCADE,
  CONSTRAINT "tareas_institucionales_source_event_id_fkey" FOREIGN KEY (source_event_id) REFERENCES soi_eventos(id) ON DELETE SET NULL
);

ALTER TABLE public."tareas_institucionales" ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public."tareas_institucionales"."process_code" IS 'Proceso SOI que esta tarea ejecuta. correlation_id agrupa el caso/procedimiento.';
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
CREATE POLICY "tareas_auth_all" ON public."tareas_institucionales" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."teacher_class_sessions"
-- ----------------------------------------------------------------------------
CREATE TABLE public."teacher_class_sessions" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "active_route_id" uuid,
  "teacher_id" uuid,
  "group_id" uuid,
  "class_date" date DEFAULT CURRENT_DATE NOT NULL,
  "week_number" integer,
  "planned_week_id" uuid,
  "status" text DEFAULT 'draft'::text NOT NULL,
  "general_observation" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "closed_at" timestamp with time zone,
  CONSTRAINT "teacher_class_sessions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "teacher_class_sessions_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'started'::text, 'completed'::text, 'cancelled'::text]))),
  CONSTRAINT "teacher_class_sessions_active_route_id_fkey" FOREIGN KEY (active_route_id) REFERENCES acm_active_routes(id) ON DELETE SET NULL,
  CONSTRAINT "teacher_class_sessions_group_id_fkey" FOREIGN KEY (group_id) REFERENCES clases(id) ON DELETE SET NULL,
  CONSTRAINT "teacher_class_sessions_planned_week_id_fkey" FOREIGN KEY (planned_week_id) REFERENCES acm_weekly_plans(id) ON DELETE SET NULL,
  CONSTRAINT "teacher_class_sessions_teacher_id_fkey" FOREIGN KEY (teacher_id) REFERENCES maestros(id) ON DELETE SET NULL
);

ALTER TABLE public."teacher_class_sessions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teacher_class_sessions_owner" ON public."teacher_class_sessions" FOR ALL TO authenticated USING ((es_admin() OR (teacher_id = maestro_actual()))) WITH CHECK ((es_admin() OR (teacher_id = maestro_actual())));

-- ----------------------------------------------------------------------------
-- Tabla: public."teacher_session_indicators"
-- ----------------------------------------------------------------------------
CREATE TABLE public."teacher_session_indicators" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid NOT NULL,
  "indicator_id" uuid,
  "planned_topic" text,
  "planned_objective" text,
  "worked_status" text DEFAULT 'not_started'::text NOT NULL,
  "teacher_notes" text,
  "next_action" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "teacher_session_indicators_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "teacher_session_indicators_indicator_id_fkey" FOREIGN KEY (indicator_id) REFERENCES indicators(id) ON DELETE SET NULL,
  CONSTRAINT "teacher_session_indicators_session_id_fkey" FOREIGN KEY (session_id) REFERENCES teacher_class_sessions(id) ON DELETE CASCADE
);

ALTER TABLE public."teacher_session_indicators" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teacher_session_indicators_owner" ON public."teacher_session_indicators" FOR ALL TO authenticated USING ((es_admin() OR (EXISTS ( SELECT 1
   FROM teacher_class_sessions s
  WHERE ((s.id = teacher_session_indicators.session_id) AND (s.teacher_id = maestro_actual())))))) WITH CHECK ((es_admin() OR (EXISTS ( SELECT 1
   FROM teacher_class_sessions s
  WHERE ((s.id = teacher_session_indicators.session_id) AND (s.teacher_id = maestro_actual()))))));

-- ----------------------------------------------------------------------------
-- Tabla: public."telegram_allowed_users"
-- ----------------------------------------------------------------------------
CREATE TABLE public."telegram_allowed_users" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "telegram_user_id" bigint NOT NULL,
  "nombre" text NOT NULL,
  "rol" text NOT NULL,
  "activo" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  CONSTRAINT "telegram_allowed_users_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "telegram_allowed_users_telegram_user_id_key" UNIQUE (telegram_user_id),
  CONSTRAINT "telegram_allowed_users_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id)
);

ALTER TABLE public."telegram_allowed_users" ENABLE ROW LEVEL SECURITY;
CREATE INDEX telegram_allowed_users_activo_idx ON public.telegram_allowed_users USING btree (telegram_user_id) WHERE (activo = true);
CREATE UNIQUE INDEX telegram_allowed_users_telegram_user_id_key ON public.telegram_allowed_users USING btree (telegram_user_id);
CREATE POLICY "authenticated_read_own" ON public."telegram_allowed_users" FOR SELECT TO authenticated USING (((created_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'admin'::text))))));
CREATE POLICY "service_role_all" ON public."telegram_allowed_users" FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."telegram_messages_raw"
-- ----------------------------------------------------------------------------
CREATE TABLE public."telegram_messages_raw" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "telegram_message_id" bigint NOT NULL,
  "telegram_chat_id" bigint NOT NULL,
  "telegram_user_id" bigint NOT NULL,
  "message_type" text DEFAULT 'text'::text NOT NULL,
  "raw_payload" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "telegram_messages_raw_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "telegram_messages_raw_telegram_message_id_key" UNIQUE (telegram_message_id)
);

ALTER TABLE public."telegram_messages_raw" ENABLE ROW LEVEL SECURITY;
CREATE INDEX telegram_messages_raw_chat_idx ON public.telegram_messages_raw USING btree (telegram_chat_id, created_at DESC);
CREATE UNIQUE INDEX telegram_messages_raw_telegram_message_id_key ON public.telegram_messages_raw USING btree (telegram_message_id);
CREATE INDEX telegram_messages_raw_user_idx ON public.telegram_messages_raw USING btree (telegram_user_id, created_at DESC);
CREATE POLICY "deny_anon" ON public."telegram_messages_raw" FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "deny_authenticated" ON public."telegram_messages_raw" FOR ALL TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY "service_role_all" ON public."telegram_messages_raw" FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."unidades"
-- ----------------------------------------------------------------------------
CREATE TABLE public."unidades" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "modulo_id" uuid NOT NULL,
  "nombre" text NOT NULL,
  "descripcion" text,
  "orden" integer NOT NULL,
  "activo" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "unidades_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "unidades_modulo_nombre_unique" UNIQUE (modulo_id, nombre),
  CONSTRAINT "unidades_modulo_orden_unique" UNIQUE (modulo_id, orden),
  CONSTRAINT "unidades_orden_check" CHECK ((orden > 0)),
  CONSTRAINT "fk_unidades_modulo" FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE
);

ALTER TABLE public."unidades" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_unidades_modulo ON public.unidades USING btree (modulo_id);
CREATE UNIQUE INDEX unidades_modulo_nombre_unique ON public.unidades USING btree (modulo_id, nombre);
CREATE UNIQUE INDEX unidades_modulo_orden_unique ON public.unidades USING btree (modulo_id, orden);
CREATE POLICY "unidades_admin_read" ON public."unidades" FOR SELECT USING (es_admin());
CREATE POLICY "unidades_authenticated_all" ON public."unidades" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Tabla: public."user_portal_access"
-- ----------------------------------------------------------------------------
CREATE TABLE public."user_portal_access" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "portal_id" text NOT NULL,
  "granted_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "user_portal_access_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "user_portal_access_user_portal_unique" UNIQUE (user_id, portal_id),
  CONSTRAINT "user_portal_access_granted_by_fkey" FOREIGN KEY (granted_by) REFERENCES profiles(id) ON DELETE SET NULL,
  CONSTRAINT "user_portal_access_portal_id_fkey" FOREIGN KEY (portal_id) REFERENCES portal_catalog(portal_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT "user_portal_access_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

ALTER TABLE public."user_portal_access" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_user_portal_access_portal_id ON public.user_portal_access USING btree (portal_id);
CREATE INDEX idx_user_portal_access_user_id ON public.user_portal_access USING btree (user_id);
CREATE UNIQUE INDEX user_portal_access_user_portal_unique ON public.user_portal_access USING btree (user_id, portal_id);
CREATE POLICY "user_portal_access_admin_write" ON public."user_portal_access" FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = ANY (ARRAY['superadmin'::text, 'admin'::text]))))));
CREATE POLICY "user_portal_access_select_own_or_admin" ON public."user_portal_access" FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.rol = ANY (ARRAY['superadmin'::text, 'admin'::text])))))));

-- ----------------------------------------------------------------------------
-- Tabla: public."usuario_departamentos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."usuario_departamentos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "departamento_id" uuid NOT NULL,
  "rol" text DEFAULT 'miembro'::text,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "usuario_departamentos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "usuario_departamentos_user_id_departamento_id_key" UNIQUE (user_id, departamento_id),
  CONSTRAINT "usuario_departamentos_departamento_id_fkey" FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE,
  CONSTRAINT "usuario_departamentos_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public."usuario_departamentos" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_usuario_departamentos ON public.usuario_departamentos USING btree (user_id, departamento_id);
CREATE UNIQUE INDEX usuario_departamentos_user_id_departamento_id_key ON public.usuario_departamentos USING btree (user_id, departamento_id);
CREATE POLICY "user_dept_admin" ON public."usuario_departamentos" FOR ALL USING ((get_user_role() = 'admin'::text));
CREATE POLICY "user_dept_own" ON public."usuario_departamentos" FOR SELECT USING ((user_id = auth.uid()));

-- ----------------------------------------------------------------------------
-- Tabla: public."wallet_movimientos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."wallet_movimientos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "familia_id" uuid NOT NULL,
  "tipo" wallet_tipo NOT NULL,
  "monto_centavos" bigint NOT NULL,
  "origen" wallet_origen NOT NULL,
  "referencia_id" uuid,
  "descripcion" text,
  "saldo_resultante_centavos" bigint NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "wallet_movimientos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "wallet_movimientos_monto_check" CHECK (((monto_centavos)::numeric > (0)::numeric)),
  CONSTRAINT "wallet_movimientos_familia_id_fkey" FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT
);

ALTER TABLE public."wallet_movimientos" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_wallet_familia_created ON public.wallet_movimientos USING btree (familia_id, created_at DESC);
CREATE POLICY "wallet_mov_select_cajero_admin" ON public."wallet_movimientos" FOR SELECT USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
CREATE POLICY "wallet_mov_select_representante" ON public."wallet_movimientos" FOR SELECT USING (((get_user_role() = 'representante'::text) AND (familia_id = get_user_familia_id())));

-- ----------------------------------------------------------------------------
-- Tabla: public."whatsapp_consentimientos"
-- ----------------------------------------------------------------------------
CREATE TABLE public."whatsapp_consentimientos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "jid" text NOT NULL,
  "nombre_representante" text,
  "representante_cedula" text,
  "niño_nombre" text,
  "niño_edad" integer,
  "campania_id" uuid,
  "acepta_campania" boolean DEFAULT true NOT NULL,
  "acepta_estadisticas" boolean DEFAULT false NOT NULL,
  "firmas_digitales" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "whatsapp_consentimientos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "whatsapp_consentimientos_jid_campania_id_key" UNIQUE (jid, campania_id),
  CONSTRAINT "whatsapp_consentimientos_campania_id_fkey" FOREIGN KEY (campania_id) REFERENCES campanias_periodo(id) ON DELETE CASCADE
);

ALTER TABLE public."whatsapp_consentimientos" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX whatsapp_consentimientos_jid_campania_id_key ON public.whatsapp_consentimientos USING btree (jid, campania_id);
CREATE POLICY "wc_admin_all" ON public."whatsapp_consentimientos" FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());

-- ----------------------------------------------------------------------------
-- Tabla: public."whatsapp_optout"
-- ----------------------------------------------------------------------------
CREATE TABLE public."whatsapp_optout" (
  "jid" text NOT NULL,
  "motivo" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "whatsapp_optout_pkey" PRIMARY KEY ("jid")
);

ALTER TABLE public."whatsapp_optout" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wo_admin_all" ON public."whatsapp_optout" FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());

-- ----------------------------------------------------------------------------
-- Tabla: public."whatsapp_webhook_log"
-- ----------------------------------------------------------------------------
CREATE TABLE public."whatsapp_webhook_log" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "message_id" text NOT NULL,
  "jid_remitente" text NOT NULL,
  "postulante_id" uuid,
  "mensaje_texto" text,
  "push_name" text,
  "intencion_detectada" text,
  "confianza" numeric,
  "argumento" text,
  "respuesta_enviada" text,
  "estado_conversacion_nuevo" text,
  "accion_pipeline" jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "whatsapp_webhook_log_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "whatsapp_webhook_log_postulante_id_fkey" FOREIGN KEY (postulante_id) REFERENCES postulantes(id) ON DELETE SET NULL
);

ALTER TABLE public."whatsapp_webhook_log" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_webhook_log_created_at ON public.whatsapp_webhook_log USING btree (created_at DESC);
CREATE INDEX idx_webhook_log_message_id ON public.whatsapp_webhook_log USING btree (message_id);
CREATE INDEX idx_webhook_log_postulante ON public.whatsapp_webhook_log USING btree (postulante_id);
CREATE POLICY "webhook_log_admin_read" ON public."whatsapp_webhook_log" FOR SELECT TO authenticated USING (es_admin());
CREATE POLICY "webhook_log_service_role_all" ON public."whatsapp_webhook_log" FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- VISTAS (43)
-- ============================================================================

-- Vista: public."alumno_clases"
CREATE OR REPLACE VIEW public."alumno_clases" AS
SELECT id,
    alumno_id,
    clase_id,
    fecha_inscripcion,
    activo,
    created_at
   FROM alumnos_clases;;

-- Vista: public."node_student_coverage"
CREATE OR REPLACE VIEW public."node_student_coverage" AS
SELECT i.node_id,
    a.id AS student_id,
    a.nombre_completo,
    max(ia.created_at) AS last_attempt_date,
    count(*) AS attempt_count
   FROM ((indicator_attempts ia
     JOIN indicators i ON ((ia.indicator_id = i.id)))
     JOIN alumnos a ON ((ia.student_id = a.id)))
  GROUP BY i.node_id, a.id, a.nombre_completo;;

-- Vista: public."signage_v_calendario_mes"
CREATE OR REPLACE VIEW public."signage_v_calendario_mes" AS
SELECT id,
    titulo,
    descripcion,
    (categoria)::text AS categoria,
    ubicacion,
    fecha_inicio,
    fecha_fin,
    COALESCE(es_macro_evento, false) AS es_macro_evento
   FROM calendario_institucional ci
  WHERE ((estado = 'programado'::text) AND (fecha_fin >= date_trunc('month'::text, (now() AT TIME ZONE 'America/Santo_Domingo'::text))) AND (fecha_inicio < (date_trunc('month'::text, (now() AT TIME ZONE 'America/Santo_Domingo'::text)) + '2 mons'::interval)))
  ORDER BY fecha_inicio;;

-- Vista: public."signage_v_horario_hoy"
CREATE OR REPLACE VIEW public."signage_v_horario_hoy" AS
SELECT id,
    clase_id,
    hora_inicio,
    hora_fin,
    clase_nombre,
    instrumento,
    salon_nombre,
    maestro_nombre,
    origen
   FROM ( SELECT w.id,
            w.clase_id,
            w.hora_inicio,
            w.hora_fin,
            w.clase_nombre,
            w.instrumento,
            w.salon_nombre,
            w.maestro_nombre,
            'regular'::text AS origen
           FROM signage_v_horario_semana w
          WHERE (w.dia_iso = (EXTRACT(isodow FROM (now() AT TIME ZONE 'America/Santo_Domingo'::text)))::integer)
        UNION ALL
         SELECT ce.id,
            ce.clase_id,
            ce.hora_inicio,
            ce.hora_fin,
            COALESCE(ce.nombre_clase, 'Clase emergente'::text) AS "coalesce",
            ce.instrumento,
            ce.salon,
            ( SELECT m.nombre_completo
                   FROM maestros m
                  WHERE (m.id = ce.maestro_id)) AS nombre_completo,
            'emergente'::text AS text
           FROM clases_emergentes ce
          WHERE ((ce.fecha = ((now() AT TIME ZONE 'America/Santo_Domingo'::text))::date) AND (COALESCE(ce.estado, 'activa'::text) <> 'cancelada'::text))) q
  ORDER BY hora_inicio;;

-- Vista: public."signage_v_horario_manana"
CREATE OR REPLACE VIEW public."signage_v_horario_manana" AS
SELECT id,
    clase_id,
    hora_inicio,
    hora_fin,
    clase_nombre,
    instrumento,
    salon_nombre,
    maestro_nombre,
    origen
   FROM ( SELECT w.id,
            w.clase_id,
            w.hora_inicio,
            w.hora_fin,
            w.clase_nombre,
            w.instrumento,
            w.salon_nombre,
            w.maestro_nombre,
            'regular'::text AS origen
           FROM signage_v_horario_semana w
          WHERE (w.dia_iso = (EXTRACT(isodow FROM ((now() AT TIME ZONE 'America/Santo_Domingo'::text) + '1 day'::interval)))::integer)
        UNION ALL
         SELECT ce.id,
            ce.clase_id,
            ce.hora_inicio,
            ce.hora_fin,
            COALESCE(ce.nombre_clase, 'Clase emergente'::text) AS "coalesce",
            ce.instrumento,
            ce.salon,
            ( SELECT m.nombre_completo
                   FROM maestros m
                  WHERE (m.id = ce.maestro_id)) AS nombre_completo,
            'emergente'::text AS text
           FROM clases_emergentes ce
          WHERE ((ce.fecha = (((now() AT TIME ZONE 'America/Santo_Domingo'::text) + '1 day'::interval))::date) AND (COALESCE(ce.estado, 'activa'::text) <> 'cancelada'::text))) q
  ORDER BY hora_inicio;;

-- Vista: public."signage_v_horario_semana"
CREATE OR REPLACE VIEW public."signage_v_horario_semana" AS
SELECT ch.id,
    ch.clase_id,
        CASE lower(ch.dia)
            WHEN 'lunes'::text THEN 1
            WHEN 'martes'::text THEN 2
            WHEN 'miércoles'::text THEN 3
            WHEN 'miercoles'::text THEN 3
            WHEN 'jueves'::text THEN 4
            WHEN 'viernes'::text THEN 5
            WHEN 'sábado'::text THEN 6
            WHEN 'sabado'::text THEN 6
            WHEN 'domingo'::text THEN 7
            ELSE NULL::integer
        END AS dia_iso,
    ch.dia AS dia_nombre,
    ch.hora_inicio,
    ch.hora_fin,
    c.nombre AS clase_nombre,
    c.instrumento,
    s.nombre AS salon_nombre,
    m.nombre_completo AS maestro_nombre
   FROM (((clase_horarios ch
     JOIN clases c ON (((c.id = ch.clase_id) AND COALESCE(c.activo, true))))
     LEFT JOIN salones s ON ((s.id = ch.salon_id)))
     LEFT JOIN maestros m ON ((m.id = COALESCE(ch.maestro_id, c.maestro_principal_id))));;

-- Vista: public."student_results"
CREATE OR REPLACE VIEW public."student_results" AS
SELECT s.id,
    s.nombre_completo AS name,
        CASE
            WHEN ((lower(COALESCE(s.instrumento_principal, s.instrumento_interes)) ~~ '%violin%'::text) OR (lower(COALESCE(s.instrumento_principal, s.instrumento_interes)) ~~ '%violín%'::text) OR (lower(COALESCE(s.instrumento_principal, s.instrumento_interes)) ~~ '%volin%'::text)) THEN 'Violines I'::text
            WHEN (lower(COALESCE(s.instrumento_principal, s.instrumento_interes)) ~~ '%viola%'::text) THEN 'Violas'::text
            WHEN ((lower(COALESCE(s.instrumento_principal, s.instrumento_interes)) ~~ '%cello%'::text) OR (lower(COALESCE(s.instrumento_principal, s.instrumento_interes)) ~~ '%violoncello%'::text)) THEN 'Violoncellos'::text
            WHEN (lower(COALESCE(s.instrumento_principal, s.instrumento_interes)) ~~ '%contrabajo%'::text) THEN 'Contrabajos'::text
            WHEN (lower(COALESCE(s.instrumento_principal, s.instrumento_interes)) ~~ '%flauta%'::text) THEN 'Flautas'::text
            WHEN (lower(COALESCE(s.instrumento_principal, s.instrumento_interes)) ~~ '%oboe%'::text) THEN 'Oboes'::text
            WHEN (lower(COALESCE(s.instrumento_principal, s.instrumento_interes)) ~~ '%clarinete%'::text) THEN 'Clarinetes'::text
            WHEN (lower(COALESCE(s.instrumento_principal, s.instrumento_interes)) ~~ '%corno%'::text) THEN 'Cornos'::text
            WHEN (lower(COALESCE(s.instrumento_principal, s.instrumento_interes)) ~~ '%trompeta%'::text) THEN 'Trompetas'::text
            WHEN (lower(COALESCE(s.instrumento_principal, s.instrumento_interes)) ~~ '%trombo%'::text) THEN 'Trombones'::text
            WHEN (lower(COALESCE(s.instrumento_principal, s.instrumento_interes)) ~~ '%tuba%'::text) THEN 'Tuba'::text
            WHEN (lower(COALESCE(s.instrumento_principal, s.instrumento_interes)) ~~ '%percu%'::text) THEN 'Percusión'::text
            WHEN (lower(COALESCE(s.instrumento_principal, s.instrumento_interes)) ~~ '%piano%'::text) THEN 'Pianistas'::text
            ELSE COALESCE(s.instrumento_principal, s.instrumento_interes, 'Sin sección'::text)
        END AS section,
    count(e.id) AS eval_count,
    round(avg(e.score_escala), 1) AS avg_escala,
    round(avg(e.score_danzon), 1) AS avg_danzon,
    round(avg(e.score_total), 1) AS avg_total,
        CASE
            WHEN (avg(e.score_total) >= (28)::numeric) THEN 'A'::text
            WHEN (avg(e.score_total) >= (20)::numeric) THEN 'B'::text
            WHEN (avg(e.score_total) >= (12)::numeric) THEN 'C'::text
            WHEN (avg(e.score_total) >= (8)::numeric) THEN 'D'::text
            ELSE NULL::text
        END AS assigned_group
   FROM (alumnos s
     LEFT JOIN evaluations e ON ((s.id = e.student_id)))
  WHERE (s.activo = true)
  GROUP BY s.id, s.nombre_completo, s.instrumento_principal, s.instrumento_interes;;

-- Vista: public."teacher_class_fill_metrics"
CREATE OR REPLACE VIEW public."teacher_class_fill_metrics" AS
SELECT sc.id AS sesion_id,
    sc.clase_id,
    sc.maestro_id,
    sc.fecha,
    sc.hora_inicio,
    sc.hora_fin,
    ( SELECT max(a.marked_at) AS max
           FROM asistencias a
          WHERE (a.sesion_clase_id = sc.id)) AS asistencia_marked_at,
    os.first_note_at AS observaciones_first_at,
    os.last_note_at AS observaciones_last_at,
    os.ai_fill_at,
        CASE
            WHEN ((( SELECT max(a.marked_at) AS max
               FROM asistencias a
              WHERE (a.sesion_clase_id = sc.id)) IS NULL) AND (os.first_note_at IS NULL)) THEN 'falta_ambos'::text
            WHEN (( SELECT max(a.marked_at) AS max
               FROM asistencias a
              WHERE (a.sesion_clase_id = sc.id)) IS NULL) THEN 'falta_asistencia'::text
            WHEN (os.first_note_at IS NULL) THEN 'falta_observaciones'::text
            WHEN (( SELECT max(a.marked_at) AS max
               FROM asistencias a
              WHERE (a.sesion_clase_id = sc.id)) < (os.first_note_at - '00:05:00'::interval)) THEN 'asistencia_primero'::text
            WHEN (os.first_note_at < (( SELECT max(a.marked_at) AS max
               FROM asistencias a
              WHERE (a.sesion_clase_id = sc.id)) - '00:05:00'::interval)) THEN 'observaciones_primero'::text
            ELSE 'casi_simultaneo'::text
        END AS orden_llenado,
    EXTRACT(epoch FROM (os.last_note_at - os.first_note_at)) AS duracion_observaciones_segundos,
        CASE
            WHEN (( SELECT max(a.marked_at) AS max
               FROM asistencias a
              WHERE (a.sesion_clase_id = sc.id)) IS NULL) THEN 'no_marcada'::text
            WHEN (( SELECT max(a.marked_at) AS max
               FROM asistencias a
              WHERE (a.sesion_clase_id = sc.id)) < ((sc.fecha)::timestamp with time zone + (sc.hora_inicio)::interval)) THEN 'antes_de_empezar'::text
            WHEN (( SELECT max(a.marked_at) AS max
               FROM asistencias a
              WHERE (a.sesion_clase_id = sc.id)) > ((sc.fecha)::timestamp with time zone + (sc.hora_fin)::interval)) THEN 'despues_de_terminar'::text
            ELSE 'durante_clase'::text
        END AS momento_asistencia,
        CASE
            WHEN (os.first_note_at IS NULL) THEN 'no_llena'::text
            WHEN (os.last_note_at < ((sc.fecha)::timestamp with time zone + (sc.hora_fin)::interval)) THEN 'antes_de_terminar'::text
            WHEN ((os.last_note_at >= ((sc.fecha)::timestamp with time zone + (sc.hora_fin)::interval)) AND (os.last_note_at <= (((sc.fecha)::timestamp with time zone + (sc.hora_fin)::interval) + '00:30:00'::interval))) THEN 'inmediatamente_despues'::text
            WHEN ((os.last_note_at >= (((sc.fecha)::timestamp with time zone + (sc.hora_fin)::interval) + '00:30:00'::interval)) AND (os.last_note_at <= (((sc.fecha)::timestamp with time zone + (sc.hora_fin)::interval) + '02:00:00'::interval))) THEN 'dentro_2_horas'::text
            ELSE 'mucho_despues'::text
        END AS momento_observaciones,
        CASE
            WHEN (os.ai_fill_at IS NOT NULL) THEN 'si'::text
            ELSE 'no'::text
        END AS uso_ai_fill,
    round((EXTRACT(epoch FROM (os.first_note_at - ( SELECT max(a.marked_at) AS max
           FROM asistencias a
          WHERE (a.sesion_clase_id = sc.id)))) / (60)::numeric), 2) AS minutos_entre_asistencia_observaciones
   FROM (sesiones_clase sc
     LEFT JOIN observaciones_sesion os ON ((os.sesion_id = sc.id)))
  WHERE (sc.estado <> 'borrador'::text)
  ORDER BY sc.fecha DESC, sc.hora_inicio DESC;;

-- Vista: public."teacher_class_fill_metrics_aggregated"
CREATE OR REPLACE VIEW public."teacher_class_fill_metrics_aggregated" AS
SELECT m.id AS maestro_id,
    m.nombre_completo AS maestro_nombre,
    count(DISTINCT tcfm.sesion_id) AS total_clases,
    count(DISTINCT tcfm.sesion_id) FILTER (WHERE (tcfm.orden_llenado = 'asistencia_primero'::text)) AS orden_asistencia_primero,
    count(DISTINCT tcfm.sesion_id) FILTER (WHERE (tcfm.orden_llenado = 'observaciones_primero'::text)) AS orden_observaciones_primero,
    count(DISTINCT tcfm.sesion_id) FILTER (WHERE (tcfm.orden_llenado = 'casi_simultaneo'::text)) AS orden_simultaneo,
    count(DISTINCT tcfm.sesion_id) FILTER (WHERE (tcfm.orden_llenado = 'falta_asistencia'::text)) AS incompleto_falta_asistencia,
    count(DISTINCT tcfm.sesion_id) FILTER (WHERE (tcfm.orden_llenado = 'falta_observaciones'::text)) AS incompleto_falta_observaciones,
    count(DISTINCT tcfm.sesion_id) FILTER (WHERE (tcfm.orden_llenado = 'falta_ambos'::text)) AS incompleto_falta_ambos,
    round(avg(COALESCE(tcfm.duracion_observaciones_segundos, (0)::numeric)), 1) AS promedio_duracion_observaciones,
        CASE
            WHEN (count(DISTINCT tcfm.sesion_id) > 0) THEN round((((count(DISTINCT tcfm.sesion_id) FILTER (WHERE (tcfm.ai_fill_at IS NOT NULL)))::numeric / (count(DISTINCT tcfm.sesion_id))::numeric) * (100)::numeric), 1)
            ELSE (0)::numeric
        END AS uso_ai_fill_percent,
    max(tcfm.fecha) AS fecha_ultima_clase
   FROM (teacher_class_fill_metrics tcfm
     LEFT JOIN maestros m ON ((m.id = tcfm.maestro_id)))
  GROUP BY m.id, m.nombre_completo;;

-- Vista: public."v_semaforo_contenidos"
CREATE OR REPLACE VIEW public."v_semaforo_contenidos" AS
SELECT iss.alumno_id,
    s.clase_id,
    s.objetivo_id,
    count(iss.id) AS total_registros,
    count(iss.id) FILTER (WHERE ((iss.nota_cualitativa)::text = 'bien'::text)) AS bien_count,
    count(iss.id) FILTER (WHERE ((iss.nota_cualitativa)::text = 'regular'::text)) AS regular_count,
    count(iss.id) FILTER (WHERE ((iss.nota_cualitativa)::text = 'mal'::text)) AS mal_count,
        CASE
            WHEN (((count(iss.id) FILTER (WHERE ((iss.nota_cualitativa)::text = 'mal'::text)))::numeric / (count(iss.id))::numeric) > 0.50) THEN 'rojo'::text
            WHEN (((count(iss.id) FILTER (WHERE ((iss.nota_cualitativa)::text = 'bien'::text)))::numeric / (count(iss.id))::numeric) >= 0.70) THEN 'verde'::text
            ELSE 'naranja'::text
        END AS semaforo
   FROM (indicator_sessions s
     JOIN indicator_session_students iss ON ((iss.indicator_session_id = s.id)))
  GROUP BY iss.alumno_id, s.clase_id, s.objetivo_id;;

-- Vista: public."view_evaluaciones_pedagogicas"
CREATE OR REPLACE VIEW public."view_evaluaciones_pedagogicas" AS
SELECT ia.id AS attempt_id,
    ia.student_id,
    a.nombre_completo AS student_name,
    ia.indicator_id,
    i.description AS indicator_description,
    i.nombre AS indicator_name,
    n.id AS node_id,
    n.name AS node_name,
    n.codigo AS node_codigo,
    lv.id AS level_id,
    lv.name AS level_name,
    lv.level_number,
    ia.result,
    ia.nota,
    ia.observations,
    ia.created_by AS maestro_id,
    m.nombre_completo AS maestro_name,
    ia.covered_by_clase_id AS clase_id,
    c.nombre AS clase_name,
    ia.covered_date,
    ia.created_at,
    ia.updated_at
   FROM ((((((indicator_attempts ia
     JOIN indicators i ON ((ia.indicator_id = i.id)))
     JOIN nodes n ON ((i.node_id = n.id)))
     JOIN levels lv ON ((n.level_id = lv.id)))
     JOIN alumnos a ON ((ia.student_id = a.id)))
     LEFT JOIN maestros m ON ((m.id = ia.created_by)))
     LEFT JOIN clases c ON ((ia.covered_by_clase_id = c.id)));;

-- Vista: public."view_node_difficulty"
CREATE OR REPLACE VIEW public."view_node_difficulty" AS
SELECT n.name AS node_name,
    count(ia.id) AS total_attempts,
    (((sum(
        CASE
            WHEN (ia.result = 'failed'::text) THEN 1
            ELSE 0
        END))::double precision / (count(ia.id))::double precision) * (100)::double precision) AS failure_percentage
   FROM (nodes n
     JOIN indicator_attempts ia ON ((ia.node_id = n.id)))
  GROUP BY n.id, n.name
 HAVING (count(ia.id) > 0);;

-- Vista: public."vw_activos_ociosos"
CREATE OR REPLACE VIEW public."vw_activos_ociosos" AS
SELECT c.id AS comodato_id,
    c.activo_id,
    ia.codigo_inventario,
    ia.tipo_instrumento,
    ia.marca,
    ia.modelo,
    c.alumno_id,
    a.nombre_completo AS alumno_nombre,
    a.activo AS alumno_activo,
    c.fecha_entrega,
    c.fecha_vencimiento,
    (CURRENT_DATE - c.fecha_entrega) AS dias_prestado,
        CASE
            WHEN (c.fecha_vencimiento IS NULL) THEN NULL::integer
            WHEN (c.fecha_vencimiento < CURRENT_DATE) THEN 0
            ELSE (c.fecha_vencimiento - CURRENT_DATE)
        END AS dias_hasta_vencimiento,
        CASE
            WHEN (a.activo = false) THEN 'alumno_inactivo'::text
            WHEN ((c.fecha_vencimiento IS NOT NULL) AND (c.fecha_vencimiento < CURRENT_DATE)) THEN 'vencido'::text
            WHEN ((c.fecha_vencimiento IS NOT NULL) AND (c.fecha_vencimiento <= (CURRENT_DATE + 7))) THEN 'proximo_vencer'::text
            ELSE 'normal'::text
        END AS alerta_tipo
   FROM ((comodatos_activos c
     JOIN inventario_activos ia ON ((ia.id = c.activo_id)))
     JOIN alumnos a ON ((a.id = c.alumno_id)))
  WHERE ((c.estado)::text = 'activo'::text);;

-- Vista: public."vw_admin_enrollment_calendar"
CREATE OR REPLACE VIEW public."vw_admin_enrollment_calendar" AS
SELECT apt.id AS appointment_id,
    apt.scheduled_datetime,
    apt.status AS appointment_status,
    apt.notes,
    app.id AS applicant_id,
    app.full_name AS applicant_name,
    app.phone_number,
    app.email,
    app.utm_source,
    app.status AS applicant_status,
    apt.created_at AS appointment_created_at
   FROM (appointments apt
     JOIN applicants app ON ((apt.applicant_id = app.id)))
  WHERE (apt.status = ANY (ARRAY['CONFIRMED'::text, 'RESERVED_PENDING'::text]));;

-- Vista: public."vw_alertas_activas"
CREATE OR REPLACE VIEW public."vw_alertas_activas" AS
SELECT 'ausencias_consecutivas'::text AS tipo_alerta,
    'rojo'::text AS color,
    a.id AS alumno_id,
    a.nombre_completo AS alumno_nombre,
    a.instrumento_principal,
    NULL::uuid AS maestro_id,
    NULL::text AS maestro_nombre,
    NULL::uuid AS referencia_id,
    '3 o más ausencias injustificadas en los últimos 14 días'::text AS descripcion,
    count(*) FILTER (WHERE ((ast.estado = 'A'::text) AND (ast.fecha >= (CURRENT_DATE - '14 days'::interval)))) AS valor_numerico,
    max(ast.fecha) AS fecha_referencia
   FROM (alumnos a
     JOIN asistencias ast ON ((ast.alumno_id = a.id)))
  WHERE (a.activo = true)
  GROUP BY a.id, a.nombre_completo, a.instrumento_principal
 HAVING (count(*) FILTER (WHERE ((ast.estado = 'A'::text) AND (ast.fecha >= (CURRENT_DATE - '14 days'::interval)))) >= 3)
UNION ALL
 SELECT 'obs_alta_sin_seguimiento'::text AS tipo_alerta,
    'rojo'::text AS color,
    a.id AS alumno_id,
    a.nombre_completo AS alumno_nombre,
    a.instrumento_principal,
    o.maestro_id,
    m.nombre_completo AS maestro_nombre,
    o.id AS referencia_id,
    ('Observación de prioridad alta sin atender: '::text || COALESCE(o.titulo, "left"(o.observacion, 60))) AS descripcion,
    ((CURRENT_DATE - COALESCE(o.fecha_observacion, o.fecha)))::numeric AS valor_numerico,
    COALESCE(o.fecha_observacion, o.fecha) AS fecha_referencia
   FROM ((observaciones_alumnos o
     JOIN alumnos a ON ((a.id = o.alumno_id)))
     LEFT JOIN maestros m ON ((m.id = o.maestro_id)))
  WHERE ((o.prioridad = 'alta'::text) AND (o.estado <> 'resuelta'::text) AND (COALESCE(o.fecha_observacion, o.fecha) <= (CURRENT_DATE - '5 days'::interval)))
UNION ALL
 SELECT 'caida_calificacion'::text AS tipo_alerta,
    'naranja'::text AS color,
    a.id AS alumno_id,
    a.nombre_completo AS alumno_nombre,
    a.instrumento_principal,
    NULL::uuid AS maestro_id,
    NULL::text AS maestro_nombre,
    NULL::uuid AS referencia_id,
    (('Caída de '::text || round(abs(((array_agg(p.calificacion ORDER BY p.fecha_evaluacion DESC))[1] - (array_agg(p.calificacion ORDER BY p.fecha_evaluacion DESC))[2])), 1)) || ' puntos en la última evaluación'::text) AS descripcion,
    round(abs(((array_agg(p.calificacion ORDER BY p.fecha_evaluacion DESC))[1] - (array_agg(p.calificacion ORDER BY p.fecha_evaluacion DESC))[2])), 1) AS valor_numerico,
    max(p.fecha_evaluacion) AS fecha_referencia
   FROM (progresos p
     JOIN alumnos a ON ((a.id = p.alumno_id)))
  WHERE ((p.calificacion IS NOT NULL) AND (a.activo = true))
  GROUP BY a.id, a.nombre_completo, a.instrumento_principal
 HAVING ((count(*) >= 2) AND (((array_agg(p.calificacion ORDER BY p.fecha_evaluacion DESC))[1] - (array_agg(p.calificacion ORDER BY p.fecha_evaluacion DESC))[2]) <= '-1.0'::numeric))
UNION ALL
 SELECT 'sin_evaluacion'::text AS tipo_alerta,
    'amarillo'::text AS color,
    a.id AS alumno_id,
    a.nombre_completo AS alumno_nombre,
    a.instrumento_principal,
    NULL::uuid AS maestro_id,
    NULL::text AS maestro_nombre,
    NULL::uuid AS referencia_id,
    (('Sin evaluación desde hace '::text || (CURRENT_DATE - max(p.fecha_evaluacion))) || ' días'::text) AS descripcion,
    ((CURRENT_DATE - max(p.fecha_evaluacion)))::numeric AS valor_numerico,
    max(p.fecha_evaluacion) AS fecha_referencia
   FROM (alumnos a
     LEFT JOIN progresos p ON ((p.alumno_id = a.id)))
  WHERE (a.activo = true)
  GROUP BY a.id, a.nombre_completo, a.instrumento_principal
 HAVING ((max(p.fecha_evaluacion) < (CURRENT_DATE - '30 days'::interval)) OR (max(p.fecha_evaluacion) IS NULL))
UNION ALL
 SELECT 'obs_media_sin_seguimiento'::text AS tipo_alerta,
    'amarillo'::text AS color,
    a.id AS alumno_id,
    a.nombre_completo AS alumno_nombre,
    a.instrumento_principal,
    o.maestro_id,
    m.nombre_completo AS maestro_nombre,
    o.id AS referencia_id,
    ('Observación media pendiente: '::text || COALESCE(o.titulo, "left"(o.observacion, 60))) AS descripcion,
    ((CURRENT_DATE - COALESCE(o.fecha_observacion, o.fecha)))::numeric AS valor_numerico,
    COALESCE(o.fecha_observacion, o.fecha) AS fecha_referencia
   FROM ((observaciones_alumnos o
     JOIN alumnos a ON ((a.id = o.alumno_id)))
     LEFT JOIN maestros m ON ((m.id = o.maestro_id)))
  WHERE ((o.prioridad = 'media'::text) AND (o.estado = 'abierta'::text) AND (COALESCE(o.fecha_observacion, o.fecha) <= (CURRENT_DATE - '7 days'::interval)));;

-- Vista: public."vw_alumno_estado_pago"
CREATE OR REPLACE VIEW public."vw_alumno_estado_pago" AS
WITH cuotas_resumen AS (
         SELECT c.alumno_id,
            c.familia_id,
            count(*) FILTER (WHERE (c.estado = ANY (ARRAY['pendiente'::cuota_estado, 'vencida'::cuota_estado, 'en_mora'::cuota_estado]))) AS cuotas_pendientes_count,
            count(*) FILTER (WHERE ((c.estado = ANY (ARRAY['pendiente'::cuota_estado, 'vencida'::cuota_estado, 'en_mora'::cuota_estado])) AND (c.fecha_vencimiento < CURRENT_DATE))) AS cuotas_vencidas_count,
            COALESCE(sum((c.monto_final_centavos - c.monto_pagado_centavos)) FILTER (WHERE (c.estado = ANY (ARRAY['pendiente'::cuota_estado, 'vencida'::cuota_estado, 'en_mora'::cuota_estado]))), (0)::numeric) AS saldo_pendiente_centavos,
            min(c.fecha_vencimiento) FILTER (WHERE (c.estado = ANY (ARRAY['pendiente'::cuota_estado, 'vencida'::cuota_estado, 'en_mora'::cuota_estado]))) AS fecha_mas_antigua_vencida
           FROM cuotas c
          GROUP BY c.alumno_id, c.familia_id
        ), representante_pagador AS (
         SELECT DISTINCT ON (r.familia_id) r.familia_id,
            r.nombre,
            r.cedula,
            r.telefono_whatsapp,
            r.email
           FROM representantes r
          WHERE (r.activo = true)
          ORDER BY r.familia_id, r.es_pagador DESC NULLS LAST, r.created_at
        )
 SELECT a.id AS alumno_id,
    a.nombre_completo AS alumno_nombre,
    a.instrumento_principal,
    COALESCE(a.activo, false) AS alumno_activo,
    COALESCE(a.exento_mensualidad, false) AS exento_mensualidad,
    f.id AS familia_id,
    COALESCE(f.nombre_familia, 'Sin Familia'::text) AS nombre_familia,
    COALESCE(NULLIF(TRIM(BOTH FROM rp.nombre), ''::text), NULLIF(TRIM(BOTH FROM a.representante_nombre), ''::text), NULLIF(TRIM(BOTH FROM a.madre_nombre), ''::text), NULLIF(TRIM(BOTH FROM a.padre_nombre), ''::text), 'Representante no registrado'::text) AS contacto_nombre,
    COALESCE(NULLIF(TRIM(BOTH FROM rp.cedula), ''::text), NULLIF(TRIM(BOTH FROM a.representante_cedula), ''::text), NULLIF(TRIM(BOTH FROM a.madre_cedula), ''::text), NULLIF(TRIM(BOTH FROM a.padre_cedula), ''::text), ''::text) AS contacto_cedula,
    COALESCE(NULLIF(TRIM(BOTH FROM rp.telefono_whatsapp), ''::text), NULLIF(TRIM(BOTH FROM a.representante_tlf), ''::text), NULLIF(TRIM(BOTH FROM a.madre_tlf_whatsapp), ''::text), NULLIF(TRIM(BOTH FROM a.padre_tlf_whatsapp), ''::text), NULLIF(TRIM(BOTH FROM a.tlf_alumno), ''::text), ''::text) AS contacto_telefono,
    COALESCE(NULLIF(TRIM(BOTH FROM rp.email), ''::text), NULLIF(TRIM(BOTH FROM a.correo_representante), ''::text), ''::text) AS contacto_email,
    COALESCE(cr.cuotas_pendientes_count, (0)::bigint) AS cuotas_pendientes_count,
    COALESCE(cr.cuotas_vencidas_count, (0)::bigint) AS cuotas_vencidas_count,
    COALESCE(cr.saldo_pendiente_centavos, (0)::numeric) AS saldo_pendiente_centavos,
    cr.fecha_mas_antigua_vencida,
        CASE
            WHEN (COALESCE(a.activo, false) = false) THEN 'inactivo'::text
            WHEN (COALESCE(a.exento_mensualidad, false) = true) THEN 'exento'::text
            WHEN (COALESCE(cr.cuotas_vencidas_count, (0)::bigint) > 0) THEN 'mora'::text
            WHEN (COALESCE(cr.cuotas_pendientes_count, (0)::bigint) > 0) THEN 'debe'::text
            ELSE 'al_dia'::text
        END AS estado_pago
   FROM (((alumnos a
     LEFT JOIN familias f ON ((f.id = a.familia_id)))
     LEFT JOIN representante_pagador rp ON ((rp.familia_id = a.familia_id)))
     LEFT JOIN cuotas_resumen cr ON ((cr.alumno_id = a.id)));;

-- Vista: public."vw_asistencias_clases_formato"
CREATE OR REPLACE VIEW public."vw_asistencias_clases_formato" AS
WITH base AS (
         SELECT a.sesion_clase_id,
            a.clase_id,
            s.fecha AS fecha_sesion,
            s.hora_inicio,
            s.hora_fin,
            c_1.nombre AS nombre_clase,
            mp.nombre_completo AS maestro_principal,
            c_1.maestro_auxiliar_id,
            ma.nombre_completo AS maestro_auxiliar,
            a.alumno_id,
            al.nombre_completo AS alumno_nombre,
            a.estado AS estado_asistencia,
            a.justificacion_texto,
            j_1.motivo AS justificacion_motivo,
            j_1.evidencia_url,
            j_1.evidencia_base64,
            s.observaciones_generales AS observaciones_clase_registrada
           FROM ((((((asistencias a
             JOIN sesiones_clase s ON ((s.id = a.sesion_clase_id)))
             JOIN clases c_1 ON ((c_1.id = a.clase_id)))
             LEFT JOIN maestros mp ON ((mp.id = c_1.maestro_principal_id)))
             LEFT JOIN maestros ma ON ((ma.id = c_1.maestro_auxiliar_id)))
             JOIN alumnos al ON ((al.id = a.alumno_id)))
             LEFT JOIN justificaciones j_1 ON (((j_1.sesion_id = a.sesion_clase_id) AND (j_1.alumno_id = a.alumno_id))))
        ), agg_counts AS (
         SELECT base.sesion_clase_id,
            base.clase_id,
            base.fecha_sesion,
            base.hora_inicio,
            base.hora_fin,
            base.nombre_clase,
            base.maestro_principal,
            base.maestro_auxiliar_id,
            base.maestro_auxiliar,
            max(base.observaciones_clase_registrada) AS observaciones_clase_registrada,
            count(*) FILTER (WHERE (base.estado_asistencia = 'presente'::text)) AS presentes,
            count(*) FILTER (WHERE (base.estado_asistencia = 'ausente'::text)) AS ausentes,
            count(*) FILTER (WHERE (base.estado_asistencia = 'justificado'::text)) AS justificados
           FROM base
          GROUP BY base.sesion_clase_id, base.clase_id, base.fecha_sesion, base.hora_inicio, base.hora_fin, base.nombre_clase, base.maestro_principal, base.maestro_auxiliar_id, base.maestro_auxiliar
        ), agg_justificados AS (
         SELECT base.sesion_clase_id,
            base.clase_id,
            string_agg(
                CASE
                    WHEN (base.estado_asistencia = 'justificado'::text) THEN
                    CASE
                        WHEN (NULLIF(COALESCE(base.justificacion_motivo, base.justificacion_texto), ''::text) IS NOT NULL) THEN ((('      * Justificado: '::text || base.alumno_nombre) || ' -> '::text) || replace(COALESCE(base.justificacion_motivo, base.justificacion_texto), '
'::text, ' '::text))
                        ELSE ('      * Justificado: '::text || base.alumno_nombre)
                    END
                    ELSE NULL::text
                END, '
'::text ORDER BY base.alumno_nombre) FILTER (WHERE (base.estado_asistencia = 'justificado'::text)) AS justificados_detalle,
            string_agg(
                CASE
                    WHEN ((base.estado_asistencia = 'justificado'::text) AND ((base.evidencia_url IS NOT NULL) OR (base.evidencia_base64 IS NOT NULL))) THEN ('         * Evidencia: '::text || COALESCE(base.evidencia_url, (('base64:'::text || "left"(base.evidencia_base64, 20)) || '...'::text)))
                    ELSE NULL::text
                END, '
'::text ORDER BY base.alumno_nombre) FILTER (WHERE (base.estado_asistencia = 'justificado'::text)) AS justificados_evidencias
           FROM base
          GROUP BY base.sesion_clase_id, base.clase_id
        )
 SELECT to_char((c.fecha_sesion)::timestamp with time zone, 'YYYY-MM-DD'::text) AS fecha,
    c.sesion_clase_id,
    c.clase_id,
    ((((((((((((((((((('Organizar las clases por fechas.'::text || '

'::text) || '* '::text) || c.nombre_clase) || ' - '::text) || to_char((c.hora_inicio)::interval, 'HH12:MI AM'::text)) || ' a '::text) || to_char((c.hora_fin)::interval, 'HH12:MI AM'::text)) || ' - '::text) || COALESCE(c.maestro_principal, 'Sin maestro'::text)) ||
        CASE
            WHEN (c.maestro_auxiliar IS NOT NULL) THEN (' - Aux: '::text || c.maestro_auxiliar)
            ELSE ''::text
        END) || '
   * - Presentes: '::text) || c.presentes) || ' - Ausentes: '::text) || c.ausentes) || ' - Justificado: '::text) || c.justificados) ||
        CASE
            WHEN (COALESCE(j.justificados_detalle, ''::text) <> ''::text) THEN ('
'::text || j.justificados_detalle)
            ELSE ''::text
        END) ||
        CASE
            WHEN (COALESCE(j.justificados_evidencias, ''::text) <> ''::text) THEN ('
'::text || j.justificados_evidencias)
            ELSE ''::text
        END) ||
        CASE
            WHEN (COALESCE(c.observaciones_clase_registrada, ''::text) <> ''::text) THEN (('
'::text || '   * - Observaciones (clase): '::text) || replace(c.observaciones_clase_registrada, '
'::text, ' '::text))
            ELSE ''::text
        END) AS resumen_formateado
   FROM (agg_counts c
     LEFT JOIN agg_justificados j ON (((j.sesion_clase_id = c.sesion_clase_id) AND (j.clase_id = c.clase_id))))
  ORDER BY c.fecha_sesion, c.hora_inicio, c.nombre_clase;;

-- Vista: public."vw_asistencias_consolidada"
CREATE OR REPLACE VIEW public."vw_asistencias_consolidada" AS
SELECT sc.id AS sesion_clase_id,
    sc.fecha,
    sc.clase_id,
    c.nombre AS nombre_clase,
    sc.hora_inicio,
    sc.hora_fin,
    sc.borrador,
    m1.nombre_completo AS maestro_principal,
    m2.nombre_completo AS maestro_auxiliar,
    ( SELECT os.contenido_raw
           FROM observaciones_sesion os
          WHERE (os.sesion_id = sc.id)
          ORDER BY os.created_at DESC
         LIMIT 1) AS observacion_sesion,
    COALESCE(NULLIF(TRIM(BOTH FROM sc.contenido), ''::text), sc.contenido_dsl) AS observacion_clase,
    count(*) FILTER (WHERE (a.estado = 'presente'::text)) AS presentes,
    count(*) FILTER (WHERE (a.estado = 'ausente'::text)) AS ausentes,
    count(*) FILTER (WHERE (a.estado = 'justificado'::text)) AS justificados,
    count(DISTINCT a.alumno_id) AS total_registros,
    COALESCE(json_agg(json_build_object('alumno_id', a.alumno_id, 'alumno_nombre', al.nombre_completo, 'estado', a.estado, 'observacion', a.observaciones) ORDER BY al.nombre_completo) FILTER (WHERE (a.alumno_id IS NOT NULL)), '[]'::json) AS asistencias_detalle,
    COALESCE(json_agg(json_build_object('alumno_id', j.alumno_id, 'alumno_nombre', al2.nombre_completo, 'razon', j.motivo, 'fecha_razon', j.created_at) ORDER BY al2.nombre_completo) FILTER (WHERE (j.alumno_id IS NOT NULL)), '[]'::json) AS justificaciones_detalle,
    sc.salon_id
   FROM (((((((sesiones_clase sc
     LEFT JOIN clases c ON ((c.id = sc.clase_id)))
     LEFT JOIN maestros m1 ON ((m1.id = c.maestro_principal_id)))
     LEFT JOIN maestros m2 ON ((m2.id = c.maestro_suplente_id)))
     LEFT JOIN asistencias a ON ((a.sesion_clase_id = sc.id)))
     LEFT JOIN alumnos al ON ((al.id = a.alumno_id)))
     LEFT JOIN justificaciones j ON ((j.sesion_id = sc.id)))
     LEFT JOIN alumnos al2 ON ((al2.id = j.alumno_id)))
  GROUP BY sc.id, sc.fecha, sc.clase_id, c.nombre, sc.hora_inicio, sc.hora_fin, sc.borrador, m1.nombre_completo, m2.nombre_completo, sc.contenido, sc.contenido_dsl, sc.salon_id;;

-- Vista: public."vw_clase_objetivo_estrellas"
CREATE OR REPLACE VIEW public."vw_clase_objetivo_estrellas" AS
WITH indicadores_req AS (
         SELECT cmi.id AS indicador_id,
            cmi.objetivo_id,
            cmi.clase_id
           FROM clase_mapa_indicadores cmi
          WHERE ((cmi.es_requerido = true) AND (cmi.archived_at IS NULL))
        ), totales AS (
         SELECT indicadores_req.objetivo_id,
            indicadores_req.clase_id,
            count(*) AS total_indicadores
           FROM indicadores_req
          GROUP BY indicadores_req.objetivo_id, indicadores_req.clase_id
        ), indicadores_con_alguna_evaluacion AS (
         SELECT ir.objetivo_id,
            ir.clase_id,
            count(DISTINCT ir.indicador_id) AS indicadores_evaluados
           FROM (indicadores_req ir
             JOIN evaluacion_indicador ei ON ((ei.clase_indicador_id = ir.indicador_id)))
          GROUP BY ir.objetivo_id, ir.clase_id
        ), cobertura_alumno AS (
         SELECT ir.objetivo_id,
            ir.clase_id,
            ei.alumno_id,
            count(*) AS indicadores_del_alumno_evaluados,
            bool_and((ei.nota >= 3)) AS todos_superados,
            avg((ei.nota)::numeric) AS promedio_alumno
           FROM (indicadores_req ir
             JOIN evaluacion_indicador ei ON ((ei.clase_indicador_id = ir.indicador_id)))
          GROUP BY ir.objetivo_id, ir.clase_id, ei.alumno_id
        ), superadores AS (
         SELECT ca.objetivo_id,
            ca.clase_id,
            count(*) AS alumnos_superadores,
            avg(ca.promedio_alumno) AS promedio_superadores
           FROM (cobertura_alumno ca
             JOIN totales t_1 ON (((t_1.objetivo_id = ca.objetivo_id) AND (t_1.clase_id = ca.clase_id))))
          WHERE ((ca.indicadores_del_alumno_evaluados = t_1.total_indicadores) AND (ca.todos_superados IS TRUE))
          GROUP BY ca.objetivo_id, ca.clase_id
        )
 SELECT t.objetivo_id,
    t.clase_id,
    t.total_indicadores,
    COALESCE(ie.indicadores_evaluados, (0)::bigint) AS indicadores_evaluados,
    round((((COALESCE(ie.indicadores_evaluados, (0)::bigint))::numeric / (t.total_indicadores)::numeric) * (100)::numeric), 1) AS pct_avance,
    COALESCE(s.alumnos_superadores, (0)::bigint) AS alumnos_superadores,
    s.promedio_superadores,
        CASE
            WHEN (COALESCE(s.alumnos_superadores, (0)::bigint) = 0) THEN 0
            WHEN (s.promedio_superadores >= 4.3) THEN 3
            WHEN (s.promedio_superadores >= 3.5) THEN 2
            WHEN (s.promedio_superadores >= 3.0) THEN 1
            ELSE 0
        END AS estrellas,
        CASE
            WHEN (COALESCE(s.alumnos_superadores, (0)::bigint) = 0) THEN 'en_progreso'::text
            ELSE 'con_estrellas'::text
        END AS estado_visual
   FROM ((totales t
     LEFT JOIN indicadores_con_alguna_evaluacion ie ON (((ie.objetivo_id = t.objetivo_id) AND (ie.clase_id = t.clase_id))))
     LEFT JOIN superadores s ON (((s.objetivo_id = t.objetivo_id) AND (s.clase_id = t.clase_id))));;

-- Vista: public."vw_comodatos_en_riesgo"
CREATE OR REPLACE VIEW public."vw_comodatos_en_riesgo" AS
SELECT representante_id,
    familia_id,
    rep_nombre,
    nombre_familia,
    score,
    nivel
   FROM vw_score_representantes vsr
  WHERE (nivel = ANY (ARRAY['D'::bpchar, 'E'::bpchar]));;

-- Vista: public."vw_cupos_iniciacion"
CREATE OR REPLACE VIEW public."vw_cupos_iniciacion" AS
SELECT id AS clase_id,
    nombre,
    capacidad_maxima,
    ( SELECT count(*) AS count
           FROM alumnos_clases ac
          WHERE (ac.clase_id = c.id)) AS ocupacion,
    GREATEST((capacidad_maxima - ( SELECT count(*) AS count
           FROM alumnos_clases ac
          WHERE (ac.clase_id = c.id))), (0)::bigint) AS disponible
   FROM clases c
  WHERE ((es_clase_iniciacion = true) AND (activo = true));;

-- Vista: public."vw_destacados_y_riesgo_academico"
CREATE OR REPLACE VIEW public."vw_destacados_y_riesgo_academico" AS
SELECT id,
    nombre_completo,
    instrumento_principal,
    nivel,
    tasa_asistencia,
    promedio_calificacion,
    alertas_alta,
        CASE
            WHEN ((promedio_calificacion >= 4.0) AND (tasa_asistencia >= (90)::numeric)) THEN 'destacado'::text
            WHEN ((promedio_calificacion < 2.5) OR (tasa_asistencia < (70)::numeric)) THEN 'riesgo_academico'::text
            ELSE 'regular'::text
        END AS categoria,
        CASE
            WHEN ((promedio_calificacion >= 4.0) AND (tasa_asistencia >= (90)::numeric)) THEN '🌟 Alumno destacado'::text
            WHEN (promedio_calificacion < 2.5) THEN '⚠️ Bajo rendimiento'::text
            WHEN (tasa_asistencia < (70)::numeric) THEN '⚠️ Baja asistencia'::text
            ELSE '✅ Regular'::text
        END AS etiqueta
   FROM vw_resumen_alumno r
  WHERE (activo = true)
  ORDER BY
        CASE
            WHEN ((promedio_calificacion >= 4.0) AND (tasa_asistencia >= (90)::numeric)) THEN 0
            WHEN ((promedio_calificacion < 2.5) OR (tasa_asistencia < (70)::numeric)) THEN 1
            ELSE 2
        END, promedio_calificacion DESC NULLS LAST;;

-- Vista: public."vw_estadisticas_periodo"
CREATE OR REPLACE VIEW public."vw_estadisticas_periodo" AS
SELECT id AS periodo_id,
    nombre AS periodo_nombre,
    fecha_inicio,
    fecha_fin,
    activo,
    ( SELECT count(*) AS count
           FROM alumnos
          WHERE (alumnos.activo = true)) AS alumnos_activos,
    ( SELECT count(DISTINCT ast.alumno_id) AS count
           FROM asistencias ast
          WHERE ((ast.fecha >= p.fecha_inicio) AND (ast.fecha <= p.fecha_fin))) AS alumnos_con_asistencia,
    ( SELECT count(ast.id) AS count
           FROM asistencias ast
          WHERE ((ast.fecha >= p.fecha_inicio) AND (ast.fecha <= p.fecha_fin))) AS total_registros_asistencia,
    round((((( SELECT count(ast.id) FILTER (WHERE (ast.estado = ANY (ARRAY['presente'::text, 'justificado'::text]))) AS count
           FROM asistencias ast
          WHERE ((ast.fecha >= p.fecha_inicio) AND (ast.fecha <= p.fecha_fin))))::numeric / (NULLIF(( SELECT count(ast.id) AS count
           FROM asistencias ast
          WHERE ((ast.fecha >= p.fecha_inicio) AND (ast.fecha <= p.fecha_fin))), 0))::numeric) * (100)::numeric), 1) AS tasa_asistencia_periodo,
    ( SELECT count(DISTINCT pr.alumno_id) AS count
           FROM progresos pr
          WHERE ((pr.fecha_evaluacion >= p.fecha_inicio) AND (pr.fecha_evaluacion <= p.fecha_fin))) AS alumnos_evaluados,
    ( SELECT count(pr.id) AS count
           FROM progresos pr
          WHERE ((pr.fecha_evaluacion >= p.fecha_inicio) AND (pr.fecha_evaluacion <= p.fecha_fin))) AS total_evaluaciones,
    round(( SELECT avg(pr.calificacion) AS avg
           FROM progresos pr
          WHERE ((pr.fecha_evaluacion >= p.fecha_inicio) AND (pr.fecha_evaluacion <= p.fecha_fin))), 2) AS promedio_calificacion_periodo,
    ( SELECT count(DISTINCT o.id) FILTER (WHERE (o.estado = 'abierta'::text)) AS count
           FROM observaciones_alumnos o
          WHERE ((COALESCE(o.fecha_observacion, o.fecha) >= p.fecha_inicio) AND (COALESCE(o.fecha_observacion, o.fecha) <= p.fecha_fin))) AS obs_abiertas,
    ( SELECT count(DISTINCT o.id) FILTER (WHERE (o.estado = 'resuelta'::text)) AS count
           FROM observaciones_alumnos o
          WHERE ((COALESCE(o.fecha_observacion, o.fecha) >= p.fecha_inicio) AND (COALESCE(o.fecha_observacion, o.fecha) <= p.fecha_fin))) AS obs_resueltas,
    ( SELECT count(DISTINCT o.id) FILTER (WHERE ((o.prioridad = 'alta'::text) AND (o.estado <> 'resuelta'::text))) AS count
           FROM observaciones_alumnos o
          WHERE ((COALESCE(o.fecha_observacion, o.fecha) >= p.fecha_inicio) AND (COALESCE(o.fecha_observacion, o.fecha) <= p.fecha_fin))) AS alertas_alta_activas,
    round(( SELECT avg(ei.nota) AS avg
           FROM evaluacion_indicador ei
          WHERE (((ei.created_at)::date >= p.fecha_inicio) AND ((ei.created_at)::date <= p.fecha_fin))), 2) AS promedio_estrellas,
    ( SELECT count(ei.id) AS count
           FROM evaluacion_indicador ei
          WHERE (((ei.created_at)::date >= p.fecha_inicio) AND ((ei.created_at)::date <= p.fecha_fin))) AS total_evaluaciones_estrellas,
    round(
        CASE
            WHEN ((( SELECT count(pr.calificacion) AS count
               FROM progresos pr
              WHERE ((pr.fecha_evaluacion >= p.fecha_inicio) AND (pr.fecha_evaluacion <= p.fecha_fin))) + ( SELECT count(ei.nota) AS count
               FROM evaluacion_indicador ei
              WHERE (((ei.created_at)::date >= p.fecha_inicio) AND ((ei.created_at)::date <= p.fecha_fin)))) = 0) THEN NULL::numeric
            ELSE (((( SELECT COALESCE(avg(pr.calificacion), (0)::numeric) AS "coalesce"
               FROM progresos pr
              WHERE ((pr.fecha_evaluacion >= p.fecha_inicio) AND (pr.fecha_evaluacion <= p.fecha_fin))) * (( SELECT count(pr.calificacion) AS count
               FROM progresos pr
              WHERE ((pr.fecha_evaluacion >= p.fecha_inicio) AND (pr.fecha_evaluacion <= p.fecha_fin))))::numeric) + (( SELECT (COALESCE(avg(ei.nota), (0)::numeric) * (2)::numeric)
               FROM evaluacion_indicador ei
              WHERE (((ei.created_at)::date >= p.fecha_inicio) AND ((ei.created_at)::date <= p.fecha_fin))) * (( SELECT count(ei.nota) AS count
               FROM evaluacion_indicador ei
              WHERE (((ei.created_at)::date >= p.fecha_inicio) AND ((ei.created_at)::date <= p.fecha_fin))))::numeric)) / (NULLIF((( SELECT count(pr.calificacion) AS count
               FROM progresos pr
              WHERE ((pr.fecha_evaluacion >= p.fecha_inicio) AND (pr.fecha_evaluacion <= p.fecha_fin))) + ( SELECT count(ei.nota) AS count
               FROM evaluacion_indicador ei
              WHERE (((ei.created_at)::date >= p.fecha_inicio) AND ((ei.created_at)::date <= p.fecha_fin)))), 0))::numeric)
        END, 2) AS promedio_integrado
   FROM periodos p
  ORDER BY fecha_inicio DESC;;

-- Vista: public."vw_estado_familiar"
CREATE OR REPLACE VIEW public."vw_estado_familiar" AS
SELECT f.id,
    f.nombre_familia,
    f.activa,
    r.id AS rep_id,
    r.nombre AS rep_nombre,
    r.telefono_whatsapp,
    r.es_pagador,
    sc.score,
    sc.nivel,
    count(c.id) FILTER (WHERE (c.estado = ANY (ARRAY['pendiente'::cuota_estado, 'vencida'::cuota_estado, 'en_mora'::cuota_estado]))) AS cuotas_pendientes,
    sum((c.monto_final_centavos - c.monto_pagado_centavos)) FILTER (WHERE (c.estado = ANY (ARRAY['pendiente'::cuota_estado, 'vencida'::cuota_estado, 'en_mora'::cuota_estado]))) AS saldo_pendiente_centavos,
    wm.saldo_resultante_centavos AS saldo_wallet_centavos
   FROM ((((familias f
     LEFT JOIN representantes r ON (((r.familia_id = f.id) AND (r.es_pagador = true))))
     LEFT JOIN LATERAL ( SELECT sc2.score,
            sc2.nivel
           FROM score_compromiso sc2
          WHERE (sc2.representante_id = r.id)
          ORDER BY sc2.ciclo_anio DESC, sc2.ciclo_mes DESC
         LIMIT 1) sc ON (true))
     LEFT JOIN cuotas c ON ((c.familia_id = f.id)))
     LEFT JOIN LATERAL ( SELECT wm2.saldo_resultante_centavos
           FROM wallet_movimientos wm2
          WHERE (wm2.familia_id = f.id)
          ORDER BY wm2.created_at DESC
         LIMIT 1) wm ON (true))
  GROUP BY f.id, f.nombre_familia, f.activa, r.id, r.nombre, r.telefono_whatsapp, r.es_pagador, sc.score, sc.nivel, wm.saldo_resultante_centavos;;

-- Vista: public."vw_evaluacion_indicador_global"
CREATE OR REPLACE VIEW public."vw_evaluacion_indicador_global" AS
SELECT ei.id,
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
   FROM (evaluacion_indicador ei
     LEFT JOIN clase_mapa_indicadores cmi ON ((cmi.id = ei.clase_indicador_id)));;

-- Vista: public."vw_ia_alumnos"
CREATE OR REPLACE VIEW public."vw_ia_alumnos" AS
SELECT id,
    nombre_completo AS nombre,
    instrumento_principal,
    nivel_actual
   FROM alumnos
  WHERE (activo = true);;

-- Vista: public."vw_ia_asistencias_resumen"
CREATE OR REPLACE VIEW public."vw_ia_asistencias_resumen" AS
SELECT alumno_id,
    count(*) AS total,
    sum(
        CASE
            WHEN (estado = 'presente'::text) THEN 1
            ELSE 0
        END) AS presentes
   FROM asistencias
  WHERE (fecha >= (now() - '30 days'::interval))
  GROUP BY alumno_id;;

-- Vista: public."vw_ia_inventario"
CREATE OR REPLACE VIEW public."vw_ia_inventario" AS
SELECT tipo_instrumento,
    count(*) AS total,
    sum(
        CASE
            WHEN ((estado_uso)::text = 'disponible'::text) THEN 1
            ELSE 0
        END) AS disponibles
   FROM inventario_activos
  WHERE (activo = true)
  GROUP BY tipo_instrumento;;

-- Vista: public."vw_ia_maestros"
CREATE OR REPLACE VIEW public."vw_ia_maestros" AS
SELECT id,
    nombre_completo AS nombre,
    especialidad
   FROM maestros
  WHERE (activo = true);;

-- Vista: public."vw_indice_ensenanza_guiada"
CREATE OR REPLACE VIEW public."vw_indice_ensenanza_guiada" AS
SELECT maestro_id,
    (count(DISTINCT id))::integer AS total_sesiones,
    (count(DISTINCT id) FILTER (WHERE (EXISTS ( SELECT 1
           FROM evaluacion_indicador ei
          WHERE ((ei.clase_id = sc.clase_id) AND (ei.maestro_indicador_id IS NOT NULL) AND ((ei.fecha_evaluacion)::date = sc.fecha))))))::integer AS sesiones_con_indicador,
    round(((count(DISTINCT id) FILTER (WHERE (EXISTS ( SELECT 1
           FROM evaluacion_indicador ei
          WHERE ((ei.clase_id = sc.clase_id) AND (ei.maestro_indicador_id IS NOT NULL) AND ((ei.fecha_evaluacion)::date = sc.fecha))))))::numeric / (NULLIF(count(DISTINCT id), 0))::numeric), 4) AS indice
   FROM sesiones_clase sc
  WHERE (estado = 'registrada'::text)
  GROUP BY maestro_id;;

-- Vista: public."vw_ingresos_diarios"
CREATE OR REPLACE VIEW public."vw_ingresos_diarios" AS
SELECT metodo_pago,
    count(id) AS cantidad_pagos,
    sum(monto_centavos) AS total_centavos,
    min(created_at) AS primer_pago,
    max(created_at) AS ultimo_pago
   FROM pagos p
  WHERE ((created_at)::date = CURRENT_DATE)
  GROUP BY metodo_pago;;

-- Vista: public."vw_instrumentos_disponibles"
CREATE OR REPLACE VIEW public."vw_instrumentos_disponibles" AS
SELECT ia.id,
    ia.codigo_inventario,
    ia.tipo_instrumento,
    ia.marca,
    ia.modelo,
    ia.estado_conservacion,
    ia.ubicacion,
    ia.foto_url,
    COALESCE(ca.comodato_id, NULL::uuid) AS comodato_activo_id
   FROM (inventario_activos ia
     LEFT JOIN LATERAL ( SELECT comodatos_activos.id AS comodato_id
           FROM comodatos_activos
          WHERE ((comodatos_activos.activo_id = ia.id) AND ((comodatos_activos.estado)::text = 'activo'::text))
         LIMIT 1) ca ON (true))
  WHERE ((ia.activo = true) AND ((ia.estado_uso)::text = 'disponible'::text) AND ((ia.estado_conservacion)::text <> ALL ((ARRAY['mantenimiento'::character varying, 'de_baja'::character varying])::text[])));;

-- Vista: public."vw_kpi_inventario"
CREATE OR REPLACE VIEW public."vw_kpi_inventario" AS
SELECT count(*) FILTER (WHERE (activo = true)) AS total_activos,
    count(*) FILTER (WHERE (((estado_uso)::text = 'disponible'::text) AND (activo = true))) AS disponibles,
    count(*) FILTER (WHERE (((estado_uso)::text = 'prestado'::text) AND (activo = true))) AS en_uso,
    count(*) FILTER (WHERE (((estado_uso)::text = 'en_mantenimiento'::text) AND (activo = true))) AS en_mantenimiento,
    count(*) FILTER (WHERE (((estado_uso)::text = 'en_reparacion'::text) AND (activo = true))) AS en_reparacion,
    count(*) FILTER (WHERE (((estado_uso)::text = 'de_baja'::text) OR (activo = false))) AS de_baja,
    COALESCE(sum(valor_adquisicion) FILTER (WHERE (activo = true)), (0)::numeric) AS valor_total_inventario
   FROM inventario_activos;;

-- Vista: public."vw_mora_activa"
CREATE OR REPLACE VIEW public."vw_mora_activa" AS
SELECT c.id AS cuota_id,
    c.familia_id,
    c.alumno_id,
    c.concepto,
    (c.monto_final_centavos - c.monto_pagado_centavos) AS saldo_centavos,
    c.fecha_vencimiento,
    c.estado,
    (CURRENT_DATE - c.fecha_vencimiento) AS dias_mora,
    f.nombre_familia,
    r.nombre AS rep_nombre,
    r.telefono_whatsapp,
    r.email AS rep_email,
    sc.nivel AS score_nivel
   FROM (((cuotas c
     JOIN familias f ON ((f.id = c.familia_id)))
     LEFT JOIN representantes r ON (((r.familia_id = c.familia_id) AND (r.es_pagador = true))))
     LEFT JOIN LATERAL ( SELECT sc2.nivel
           FROM score_compromiso sc2
          WHERE (sc2.representante_id = r.id)
          ORDER BY sc2.ciclo_anio DESC, sc2.ciclo_mes DESC
         LIMIT 1) sc ON (true))
  WHERE (c.estado = ANY (ARRAY['vencida'::cuota_estado, 'en_mora'::cuota_estado]));;

-- Vista: public."vw_patron_asistencia"
CREATE OR REPLACE VIEW public."vw_patron_asistencia" AS
SELECT (EXTRACT(dow FROM ast.fecha))::integer AS dia_semana_num,
    to_char((ast.fecha)::timestamp with time zone, 'Day'::text) AS dia_semana_nombre,
    a.instrumento_principal,
    count(*) AS total_registros,
    count(*) FILTER (WHERE (ast.estado = 'P'::text)) AS presencias,
    count(*) FILTER (WHERE (ast.estado = 'A'::text)) AS ausencias,
    count(*) FILTER (WHERE (ast.estado = 'J'::text)) AS justificados,
    round((((count(*) FILTER (WHERE (ast.estado = 'A'::text)))::numeric / (NULLIF(count(*), 0))::numeric) * (100)::numeric), 1) AS pct_ausencias
   FROM (asistencias ast
     JOIN alumnos a ON ((a.id = ast.alumno_id)))
  GROUP BY (EXTRACT(dow FROM ast.fecha)), (to_char((ast.fecha)::timestamp with time zone, 'Day'::text)), a.instrumento_principal
  ORDER BY ((EXTRACT(dow FROM ast.fecha))::integer), a.instrumento_principal;;

-- Vista: public."vw_prediccion_abandono"
CREATE OR REPLACE VIEW public."vw_prediccion_abandono" AS
SELECT a.id AS alumno_id,
    a.nombre_completo,
    a.familia_id,
    f.nombre_familia,
    COALESCE(vsr.score, (50)::numeric) AS score_financiero,
    COALESCE(vsr.nivel, 'C'::bpchar) AS nivel_financiero,
    0.5::numeric(5,2) AS asistencia_rate,
    0.5::numeric(5,2) AS progreso_rate,
    (round((((((100)::numeric - COALESCE(vsr.score, (50)::numeric)) * 0.4) + ((((1)::numeric - 0.5) * (100)::numeric) * 0.3)) + ((((1)::numeric - 0.5) * (100)::numeric) * 0.3)), 2))::numeric(5,2) AS riesgo_abandono
   FROM ((alumnos a
     JOIN familias f ON ((f.id = a.familia_id)))
     LEFT JOIN vw_score_representantes vsr ON ((vsr.familia_id = a.familia_id)))
  WHERE (a.activo = true);;

-- Vista: public."vw_rendimiento_maestro"
CREATE OR REPLACE VIEW public."vw_rendimiento_maestro" AS
WITH asistencia_m AS (
         SELECT c.maestro_principal_id AS maestro_id,
            count(*) AS total_registros,
            round((((count(*) FILTER (WHERE (a.estado = ANY (ARRAY['P'::text, 'J'::text]))))::numeric / (NULLIF(count(*), 0))::numeric) * (100)::numeric), 1) AS tasa_asistencia_clases
           FROM (asistencias a
             JOIN clases c ON ((c.id = a.clase_id)))
          WHERE (c.maestro_principal_id IS NOT NULL)
          GROUP BY c.maestro_principal_id
        ), progreso_m AS (
         SELECT progresos.maestro_id,
            round(avg(progresos.calificacion), 2) AS promedio_calificacion_alumnos,
            count(DISTINCT progresos.alumno_id) AS total_alumnos_evaluados,
            count(*) AS total_evaluaciones
           FROM progresos
          WHERE ((progresos.calificacion IS NOT NULL) AND (progresos.maestro_id IS NOT NULL))
          GROUP BY progresos.maestro_id
        ), obs_m AS (
         SELECT observaciones_alumnos.maestro_id,
            count(*) AS obs_generadas,
            count(*) FILTER (WHERE (observaciones_alumnos.estado = 'resuelta'::text)) AS obs_resueltas,
            round((((count(*) FILTER (WHERE (observaciones_alumnos.estado = 'resuelta'::text)))::numeric / (NULLIF(count(*), 0))::numeric) * (100)::numeric), 1) AS tasa_resolucion_obs,
            round(avg(
                CASE
                    WHEN ((observaciones_alumnos.estado = 'resuelta'::text) AND (observaciones_alumnos.seguimiento_fecha IS NOT NULL) AND (observaciones_alumnos.fecha_observacion IS NOT NULL)) THEN (observaciones_alumnos.seguimiento_fecha - observaciones_alumnos.fecha_observacion)
                    ELSE NULL::integer
                END), 1) AS dias_promedio_resolucion
           FROM observaciones_alumnos
          WHERE (observaciones_alumnos.maestro_id IS NOT NULL)
          GROUP BY observaciones_alumnos.maestro_id
        )
 SELECT m.id AS maestro_id,
    m.nombre_completo,
    m.especialidad,
    m.activo,
    COALESCE(am.tasa_asistencia_clases, (0)::numeric) AS tasa_asistencia_clases,
    COALESCE(am.total_registros, (0)::bigint) AS total_registros_asistencia,
    pm.promedio_calificacion_alumnos,
    COALESCE(pm.total_alumnos_evaluados, (0)::bigint) AS total_alumnos_evaluados,
    COALESCE(pm.total_evaluaciones, (0)::bigint) AS total_evaluaciones,
    COALESCE(om.obs_generadas, (0)::bigint) AS obs_generadas,
    COALESCE(om.obs_resueltas, (0)::bigint) AS obs_resueltas,
    COALESCE(om.tasa_resolucion_obs, (0)::numeric) AS tasa_resolucion_obs,
    om.dias_promedio_resolucion
   FROM (((maestros m
     LEFT JOIN asistencia_m am ON ((am.maestro_id = m.id)))
     LEFT JOIN progreso_m pm ON ((pm.maestro_id = m.id)))
     LEFT JOIN obs_m om ON ((om.maestro_id = m.id)))
  WHERE (m.activo = true)
  ORDER BY pm.promedio_calificacion_alumnos DESC NULLS LAST;;

-- Vista: public."vw_reparaciones_pendientes"
CREATE OR REPLACE VIEW public."vw_reparaciones_pendientes" AS
SELECT ir.id,
    ir.activo_id,
    ia.codigo_inventario,
    ia.tipo_instrumento,
    ia.marca,
    ia.modelo,
    ir.tipo_tallerista,
    ir.tallerista_nombre,
    ir.descripcion,
    ir.costo_estimado,
    ir.costo_real,
    ir.fecha_ingreso,
    ir.estado,
    (CURRENT_DATE - ir.fecha_ingreso) AS dias_en_reparacion,
        CASE
            WHEN ((ir.estado)::text = 'recibido'::text) THEN 'Recibido'::text
            WHEN ((ir.estado)::text = 'en_reparacion'::text) THEN 'En reparación'::text
            WHEN ((ir.estado)::text = 'finalizado'::text) THEN 'Finalizado'::text
            WHEN ((ir.estado)::text = 'entregado'::text) THEN 'Entregado'::text
            ELSE NULL::text
        END AS estado_label
   FROM (inventario_reparaciones ir
     JOIN inventario_activos ia ON ((ia.id = ir.activo_id)))
  WHERE ((ir.estado)::text = ANY ((ARRAY['recibido'::character varying, 'en_reparacion'::character varying, 'finalizado'::character varying])::text[]))
  ORDER BY ir.fecha_ingreso DESC;;

-- Vista: public."vw_resumen_alumno"
CREATE OR REPLACE VIEW public."vw_resumen_alumno" AS
WITH asistencia_total AS (
         SELECT asistencias.alumno_id,
            count(*) AS total_clases,
            count(*) FILTER (WHERE (asistencias.estado = 'P'::text)) AS presencias,
            count(*) FILTER (WHERE (asistencias.estado = 'A'::text)) AS ausencias,
            count(*) FILTER (WHERE (asistencias.estado = 'J'::text)) AS justificados,
            round((((count(*) FILTER (WHERE (asistencias.estado = ANY (ARRAY['P'::text, 'J'::text]))))::numeric / (NULLIF(count(*), 0))::numeric) * (100)::numeric), 1) AS tasa_asistencia
           FROM asistencias
          GROUP BY asistencias.alumno_id
        ), asistencia_28d AS (
         SELECT asistencias.alumno_id,
            count(*) AS total_28d,
            count(*) FILTER (WHERE (asistencias.estado = 'A'::text)) AS ausencias_28d,
            count(*) FILTER (WHERE ((asistencias.estado = 'A'::text) AND (asistencias.fecha >= (CURRENT_DATE - '14 days'::interval)))) AS ausencias_14d
           FROM asistencias
          WHERE (asistencias.fecha >= (CURRENT_DATE - '28 days'::interval))
          GROUP BY asistencias.alumno_id
        ), progreso_resumen AS (
         SELECT progresos.alumno_id,
            round(avg(progresos.calificacion), 2) AS promedio_calificacion,
            count(*) AS total_evaluaciones,
            max(progresos.fecha_evaluacion) AS ultima_evaluacion
           FROM progresos
          WHERE (progresos.calificacion IS NOT NULL)
          GROUP BY progresos.alumno_id
        ), obs_resumen AS (
         SELECT observaciones_alumnos.alumno_id,
            count(*) FILTER (WHERE (observaciones_alumnos.estado = 'abierta'::text)) AS obs_abiertas,
            count(*) FILTER (WHERE (observaciones_alumnos.estado = 'seguimiento'::text)) AS obs_seguimiento,
            count(*) FILTER (WHERE (observaciones_alumnos.estado = 'resuelta'::text)) AS obs_resueltas,
            count(*) FILTER (WHERE ((observaciones_alumnos.prioridad = 'alta'::text) AND (observaciones_alumnos.estado <> 'resuelta'::text))) AS alertas_alta
           FROM observaciones_alumnos
          GROUP BY observaciones_alumnos.alumno_id
        )
 SELECT a.id,
    a.nombre_completo,
    a.instrumento_principal,
    a.nivel,
    a.activo,
    COALESCE(at2.total_clases, (0)::bigint) AS total_clases,
    COALESCE(at2.presencias, (0)::bigint) AS presencias,
    COALESCE(at2.ausencias, (0)::bigint) AS ausencias,
    COALESCE(at2.justificados, (0)::bigint) AS justificados,
    COALESCE(at2.tasa_asistencia, (0)::numeric) AS tasa_asistencia,
    COALESCE(a28.ausencias_28d, (0)::bigint) AS ausencias_28d,
    COALESCE(a28.ausencias_14d, (0)::bigint) AS ausencias_14d,
    pr.promedio_calificacion,
    COALESCE(pr.total_evaluaciones, (0)::bigint) AS total_evaluaciones,
    pr.ultima_evaluacion,
    COALESCE(ob.obs_abiertas, (0)::bigint) AS obs_abiertas,
    COALESCE(ob.obs_seguimiento, (0)::bigint) AS obs_seguimiento,
    COALESCE(ob.obs_resueltas, (0)::bigint) AS obs_resueltas,
    COALESCE(ob.alertas_alta, (0)::bigint) AS alertas_alta
   FROM ((((alumnos a
     LEFT JOIN asistencia_total at2 ON ((at2.alumno_id = a.id)))
     LEFT JOIN asistencia_28d a28 ON ((a28.alumno_id = a.id)))
     LEFT JOIN progreso_resumen pr ON ((pr.alumno_id = a.id)))
     LEFT JOIN obs_resumen ob ON ((ob.alumno_id = a.id)));;

-- Vista: public."vw_riesgo_abandono"
CREATE OR REPLACE VIEW public."vw_riesgo_abandono" AS
WITH tendencia AS (
         SELECT progresos.alumno_id,
            ((array_agg(progresos.calificacion ORDER BY progresos.fecha_evaluacion DESC))[1] - (array_agg(progresos.calificacion ORDER BY progresos.fecha_evaluacion DESC))[2]) AS delta_calificacion
           FROM progresos
          WHERE (progresos.calificacion IS NOT NULL)
          GROUP BY progresos.alumno_id
         HAVING (count(*) >= 2)
        )
 SELECT r.id AS alumno_id,
    r.nombre_completo,
    r.instrumento_principal,
    r.nivel,
    r.tasa_asistencia,
    r.ausencias_28d,
    r.ausencias_14d,
    r.promedio_calificacion,
    COALESCE(t.delta_calificacion, (0)::numeric) AS delta_calificacion,
    r.alertas_alta,
    r.obs_abiertas,
    LEAST((100)::numeric, ((((COALESCE(round((((r.ausencias_28d)::numeric / (NULLIF(((r.ausencias_28d + r.presencias) + r.justificados), 0))::numeric) * (40)::numeric)), (0)::numeric) + (
        CASE
            WHEN (r.ausencias_14d >= 3) THEN (20)::bigint
            ELSE (r.ausencias_14d * 5)
        END)::numeric) + (LEAST((30)::bigint, (r.alertas_alta * 15)))::numeric) + (
        CASE
            WHEN (COALESCE(t.delta_calificacion, (0)::numeric) < '-0.5'::numeric) THEN 10
            ELSE 0
        END)::numeric) + (
        CASE
            WHEN ((r.ultima_evaluacion < (CURRENT_DATE - '30 days'::interval)) OR (r.ultima_evaluacion IS NULL)) THEN 10
            ELSE 0
        END)::numeric)) AS score_riesgo,
        CASE
            WHEN (LEAST((100)::numeric, ((((COALESCE(round((((r.ausencias_28d)::numeric / (NULLIF(((r.ausencias_28d + r.presencias) + r.justificados), 0))::numeric) * (40)::numeric)), (0)::numeric) + (
            CASE
                WHEN (r.ausencias_14d >= 3) THEN (20)::bigint
                ELSE (r.ausencias_14d * 5)
            END)::numeric) + (LEAST((30)::bigint, (r.alertas_alta * 15)))::numeric) + (
            CASE
                WHEN (COALESCE(t.delta_calificacion, (0)::numeric) < '-0.5'::numeric) THEN 10
                ELSE 0
            END)::numeric) + (
            CASE
                WHEN ((r.ultima_evaluacion < (CURRENT_DATE - '30 days'::interval)) OR (r.ultima_evaluacion IS NULL)) THEN 10
                ELSE 0
            END)::numeric)) >= (60)::numeric) THEN 'alto'::text
            WHEN (LEAST((100)::numeric, ((((COALESCE(round((((r.ausencias_28d)::numeric / (NULLIF(((r.ausencias_28d + r.presencias) + r.justificados), 0))::numeric) * (40)::numeric)), (0)::numeric) + (
            CASE
                WHEN (r.ausencias_14d >= 3) THEN (20)::bigint
                ELSE (r.ausencias_14d * 5)
            END)::numeric) + (LEAST((30)::bigint, (r.alertas_alta * 15)))::numeric) + (
            CASE
                WHEN (COALESCE(t.delta_calificacion, (0)::numeric) < '-0.5'::numeric) THEN 10
                ELSE 0
            END)::numeric) + (
            CASE
                WHEN ((r.ultima_evaluacion < (CURRENT_DATE - '30 days'::interval)) OR (r.ultima_evaluacion IS NULL)) THEN 10
                ELSE 0
            END)::numeric)) >= (35)::numeric) THEN 'medio'::text
            ELSE 'bajo'::text
        END AS nivel_riesgo
   FROM (vw_resumen_alumno r
     LEFT JOIN tendencia t ON ((t.alumno_id = r.id)))
  WHERE (r.activo = true)
  ORDER BY LEAST((100)::numeric, ((((COALESCE(round((((r.ausencias_28d)::numeric / (NULLIF(((r.ausencias_28d + r.presencias) + r.justificados), 0))::numeric) * (40)::numeric)), (0)::numeric) + (
        CASE
            WHEN (r.ausencias_14d >= 3) THEN (20)::bigint
            ELSE (r.ausencias_14d * 5)
        END)::numeric) + (LEAST((30)::bigint, (r.alertas_alta * 15)))::numeric) + (
        CASE
            WHEN (COALESCE(t.delta_calificacion, (0)::numeric) < '-0.5'::numeric) THEN 10
            ELSE 0
        END)::numeric) + (
        CASE
            WHEN ((r.ultima_evaluacion < (CURRENT_DATE - '30 days'::interval)) OR (r.ultima_evaluacion IS NULL)) THEN 10
            ELSE 0
        END)::numeric)) DESC;;

-- Vista: public."vw_score_representantes"
CREATE OR REPLACE VIEW public."vw_score_representantes" AS
SELECT DISTINCT ON (sc.representante_id) sc.representante_id,
    sc.familia_id,
    sc.score,
    sc.nivel,
    sc.puntualidad_pct,
    sc.consistencia_meses,
    sc.voluntad_pago_pct,
    sc.comportamiento_mora_pct,
    sc.generosidad_pct,
    sc.calculado_en,
    sc.ciclo_mes,
    sc.ciclo_anio,
    r.nombre AS rep_nombre,
    f.nombre_familia
   FROM ((score_compromiso sc
     JOIN representantes r ON ((r.id = sc.representante_id)))
     JOIN familias f ON ((f.id = sc.familia_id)))
  ORDER BY sc.representante_id, sc.ciclo_anio DESC, sc.ciclo_mes DESC;;

-- Vista: public."vw_seguimiento_ausentes"
CREATE OR REPLACE VIEW public."vw_seguimiento_ausentes" AS
WITH periodo_activo AS (
         SELECT periodos.id,
            periodos.nombre,
            periodos.fecha_inicio,
            periodos.fecha_fin
           FROM periodos
          WHERE (periodos.activo = true)
          ORDER BY periodos.fecha_inicio DESC
         LIMIT 1
        ), regla AS (
         SELECT COALESCE(((seguimiento_reglas.config ->> 'nivel1'::text))::integer, 3) AS n1,
            COALESCE(((seguimiento_reglas.config ->> 'nivel2'::text))::integer, 6) AS n2,
            COALESCE(((seguimiento_reglas.config ->> 'nivel3'::text))::integer, 10) AS n3
           FROM seguimiento_reglas
          WHERE ((seguimiento_reglas.tipo = 'ausentismo_acumulado'::text) AND seguimiento_reglas.activo)
         LIMIT 1
        ), corte AS (
         SELECT x.alumno_id,
            max(x.f) AS fr
           FROM ( SELECT retenciones_instrumento.alumno_id,
                    retenciones_instrumento.fecha_reincorporacion AS f
                   FROM retenciones_instrumento
                  WHERE (retenciones_instrumento.fecha_reincorporacion IS NOT NULL)
                UNION ALL
                 SELECT seguimiento_ausencias_reinicio.alumno_id,
                    seguimiento_ausencias_reinicio.fecha_corte
                   FROM seguimiento_ausencias_reinicio) x
          GROUP BY x.alumno_id
        ), dias AS (
         SELECT ast.alumno_id,
            count(DISTINCT ast.fecha) FILTER (WHERE ((ast.estado = 'ausente'::text) AND (NOT (EXISTS ( SELECT 1
                   FROM asistencias p
                  WHERE ((p.alumno_id = ast.alumno_id) AND (p.fecha = ast.fecha) AND (p.estado = 'presente'::text))))))) AS dias_ausente,
            count(DISTINCT ast.fecha) AS dias_clase,
            max(ast.fecha) FILTER (WHERE (ast.estado = 'ausente'::text)) AS ultima_ausencia_fecha
           FROM ((asistencias ast
             CROSS JOIN periodo_activo pa)
             LEFT JOIN corte r ON ((r.alumno_id = ast.alumno_id)))
          WHERE ((ast.fecha >= pa.fecha_inicio) AND (ast.fecha <= pa.fecha_fin) AND ((r.fr IS NULL) OR (ast.fecha > (r.fr)::date)))
          GROUP BY ast.alumno_id
        )
 SELECT a.id AS alumno_id,
    a.nombre_completo AS alumno_nombre,
    a.instrumento_principal,
    cls.clase_nombres,
    cls.maestro_id,
    cls.maestro_nombre,
    cls.maestro_tlf,
    d.dias_ausente,
    d.dias_clase,
    d.ultima_ausencia_fecha,
        CASE
            WHEN (d.dias_ausente >= ( SELECT regla.n3
               FROM regla)) THEN 3
            WHEN (d.dias_ausente >= ( SELECT regla.n2
               FROM regla)) THEN 2
            ELSE 1
        END AS nivel,
    ctc.contacto_nombre,
    ctc.contacto_telefono,
    ctc.contacto_origen,
    seg.ultimo_seguimiento_nivel,
    seg.ultimo_seguimiento_fecha,
    seg.ultimo_seguimiento_resultado,
    ret.retencion_id,
    (ret.retencion_id IS NOT NULL) AS retencion_activa,
    ( SELECT periodo_activo.id
           FROM periodo_activo) AS periodo_id,
    ( SELECT periodo_activo.nombre
           FROM periodo_activo) AS periodo_nombre
   FROM (((((alumnos a
     JOIN dias d ON (((d.alumno_id = a.id) AND (d.dias_ausente >= ( SELECT regla.n1
           FROM regla)))))
     LEFT JOIN LATERAL ( SELECT string_agg(DISTINCT c.nombre, ', '::text) AS clase_nombres,
            (array_agg(COALESCE(c.maestro_principal_id, c.maestro_id) ORDER BY c.nombre))[1] AS maestro_id,
            (array_agg(m.nombre_completo ORDER BY c.nombre))[1] AS maestro_nombre,
            (array_agg(m.tlf ORDER BY c.nombre))[1] AS maestro_tlf
           FROM ((alumnos_clases ac
             JOIN clases c ON ((c.id = ac.clase_id)))
             LEFT JOIN maestros m ON ((m.id = COALESCE(c.maestro_principal_id, c.maestro_id))))
          WHERE ((ac.alumno_id = a.id) AND COALESCE(ac.activo, true))) cls ON (true))
     LEFT JOIN LATERAL ( SELECT s.contacto_nombre,
            normalizar_tel_rd(s.contacto_telefono) AS contacto_telefono,
            s.contacto_origen
           FROM ( SELECT r.nombre AS contacto_nombre,
                    r.telefono_whatsapp AS contacto_telefono,
                    'representante_alumno'::text AS contacto_origen,
                    1 AS ord
                   FROM representantes r
                  WHERE (r.alumno_id = a.id)
                UNION ALL
                 SELECT r.nombre,
                    r.telefono_whatsapp,
                    'representante_familia'::text,
                    2
                   FROM representantes r
                  WHERE (r.familia_id = a.familia_id)
                UNION ALL
                 SELECT a.representante_nombre,
                    a.representante_tlf,
                    'alumnos_representante_tlf'::text,
                    3
                UNION ALL
                 SELECT a.madre_nombre,
                    a.madre_tlf_whatsapp,
                    'alumnos_madre_tlf_whatsapp'::text,
                    4
                UNION ALL
                 SELECT a.padre_nombre,
                    a.padre_tlf_whatsapp,
                    'alumnos_padre_tlf_whatsapp'::text,
                    5
                UNION ALL
                 SELECT a.familiar_nombre,
                    a.familiar_telefono,
                    'alumnos_familiar_telefono'::text,
                    6
                UNION ALL
                 SELECT a.contacto_emergencia_nombre,
                    a.contacto_emergencia_telefono,
                    'alumnos_contacto_emergencia_telefono'::text,
                    7) s
          WHERE (normalizar_tel_rd(s.contacto_telefono) IS NOT NULL)
          ORDER BY s.ord
         LIMIT 1) ctc ON (true))
     LEFT JOIN LATERAL ( SELECT cs.nivel AS ultimo_seguimiento_nivel,
            cs.fecha AS ultimo_seguimiento_fecha,
            cs.resultado AS ultimo_seguimiento_resultado
           FROM comunicaciones_seguimiento cs
          WHERE ((cs.alumno_id = a.id) AND (cs.origen = 'ausentismo'::text))
          ORDER BY cs.fecha DESC
         LIMIT 1) seg ON (true))
     LEFT JOIN LATERAL ( SELECT ri.id AS retencion_id
           FROM retenciones_instrumento ri
          WHERE ((ri.alumno_id = a.id) AND (ri.estado = 'retenido'::text))
          ORDER BY ri.retenido_en DESC
         LIMIT 1) ret ON (true))
  WHERE ((a.activo = true) AND (NOT (EXISTS ( SELECT 1
           FROM alumno_suspensiones sp
          WHERE ((sp.alumno_id = a.id) AND (sp.estado = 'activa'::text) AND (CURRENT_DATE >= sp.desde) AND ((sp.hasta IS NULL) OR (CURRENT_DATE <= sp.hasta)))))));;

-- Vista: public."vw_stock_bajo"
CREATE OR REPLACE VIEW public."vw_stock_bajo" AS
SELECT id,
    nombre,
    categoria,
    descripcion,
    stock_actual,
    stock_minimo,
    (stock_minimo - stock_actual) AS unidades_faltantes,
    precio_unitario,
    links_externos
   FROM accesorios
  WHERE ((stock_actual <= stock_minimo) AND (activo = true));;

-- ============================================================================
-- FUNCIONES / RPCS EN PUBLIC (263)
-- ============================================================================

-- Función: _fn_crear_tarea_caso
CREATE OR REPLACE FUNCTION public._fn_crear_tarea_caso(p_corr uuid, p_titulo text, p_desc text, p_depto soi_departamento, p_prioridad text, p_entidad_tipo text, p_entidad_id uuid, p_entidad_label text, p_actor_id uuid, p_actor_nombre text)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  INSERT INTO public.tareas_institucionales
    (titulo, descripcion, departamento, estado, prioridad, correlation_id,
     entidad_tipo, entidad_id, entidad_label, updated_by, updated_by_nombre)
  VALUES (p_titulo, p_desc, p_depto, 'pendiente', p_prioridad::tarea_institucional_prioridad, p_corr,
     p_entidad_tipo, p_entidad_id, p_entidad_label, p_actor_id, p_actor_nombre);
$function$;

-- Función: actualizar_timestamp_permisos
CREATE OR REPLACE FUNCTION public.actualizar_timestamp_permisos()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$function$;

-- Función: actualizar_timestamp_solicitudes
CREATE OR REPLACE FUNCTION public.actualizar_timestamp_solicitudes()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$function$;

-- Función: analizar_seguimiento_alumnos
CREATE OR REPLACE FUNCTION public.analizar_seguimiento_alumnos(p_desde date DEFAULT (CURRENT_DATE - 28), p_hasta date DEFAULT CURRENT_DATE, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0, p_busqueda text DEFAULT NULL::text)
 RETURNS TABLE(alumno_id uuid, nombre_completo text, instrumento_principal text, asistencia_total integer, asistencia_presentes integer, asistencia_rate numeric, progreso_count integer, progreso_promedio numeric, observaciones_count integer, risk_reasons text[], en_riesgo boolean, risk_score integer, nivel_riesgo text, total_count bigint, risk_count bigint)
 LANGUAGE sql
 STABLE
AS $function$
WITH params AS (
  SELECT
    COALESCE(p_desde, CURRENT_DATE - 28) AS desde,
    COALESCE(p_hasta, CURRENT_DATE) AS hasta,
    GREATEST(1, LEAST(COALESCE(p_limit, 50), 200)) AS page_limit,
    GREATEST(0, COALESCE(p_offset, 0)) AS page_offset,
    NULLIF(BTRIM(p_busqueda), '') AS search_text
),
filtered_students AS (
  SELECT a.id, a.nombre_completo, a.instrumento_principal
  FROM public.alumnos a
  CROSS JOIN params p
  WHERE COALESCE(a.activo, true) = true
    AND (
      p.search_text IS NULL
      OR a.nombre_completo ILIKE ('%' || p.search_text || '%')
      OR COALESCE(a.instrumento_principal, '') ILIKE ('%' || p.search_text || '%')
    )
),
attendance AS (
  SELECT
    asi.alumno_id,
    COUNT(*)::integer AS total,
    COUNT(*) FILTER (WHERE asi.estado IN ('P', 'presente'))::integer AS presentes
  FROM public.asistencias asi
  CROSS JOIN params p
  JOIN filtered_students fs ON fs.id = asi.alumno_id
  WHERE asi.fecha >= p.desde
    AND asi.fecha <= p.hasta
  GROUP BY asi.alumno_id
),
latest_grades AS (
  SELECT alumno_id, calificacion
  FROM (
    SELECT
      pr.alumno_id,
      pr.calificacion,
      ROW_NUMBER() OVER (
        PARTITION BY pr.alumno_id
        ORDER BY pr.fecha_evaluacion DESC, pr.created_at DESC NULLS LAST
      ) AS rn
    FROM public.progresos pr
    JOIN filtered_students fs ON fs.id = pr.alumno_id
    WHERE pr.calificacion IS NOT NULL
  ) ranked
  WHERE rn <= 3
),
grades AS (
  SELECT
    alumno_id,
    COUNT(*)::integer AS count,
    AVG(calificacion)::numeric AS promedio
  FROM latest_grades
  GROUP BY alumno_id
),
observations AS (
  SELECT
    obs.alumno_id,
    COUNT(*) FILTER (WHERE obs.tipo IN ('disciplina', 'conductual'))::integer AS disciplina_count,
    COUNT(*)::integer AS total_count
  FROM public.observaciones_alumnos obs
  JOIN filtered_students fs ON fs.id = obs.alumno_id
  WHERE obs.estado IN ('abierta', 'seguimiento', 'pendiente')
  GROUP BY obs.alumno_id
),
computed_base AS (
  SELECT
    fs.id AS alumno_id,
    fs.nombre_completo,
    fs.instrumento_principal,
    COALESCE(att.total, 0)::integer AS asistencia_total,
    COALESCE(att.presentes, 0)::integer AS asistencia_presentes,
    CASE
      WHEN COALESCE(att.total, 0) > 0 THEN ROUND((att.presentes::numeric / att.total::numeric), 4)
      ELSE NULL
    END AS asistencia_rate,
    COALESCE(gr.count, 0)::integer AS progreso_count,
    CASE WHEN gr.promedio IS NULL THEN NULL ELSE ROUND(gr.promedio, 2) END AS progreso_promedio,
    COALESCE(obs.total_count, 0)::integer AS observaciones_count,
    (COALESCE(att.total, 0) >= 4 AND (att.presentes::numeric / NULLIF(att.total, 0)) < 0.70) AS riesgo_asistencia,
    (COALESCE(gr.count, 0) >= 1 AND gr.promedio < 6.0) AS riesgo_calificacion,
    (COALESCE(obs.disciplina_count, 0) > 0) AS riesgo_disciplina
  FROM filtered_students fs
  LEFT JOIN attendance att ON att.alumno_id = fs.id
  LEFT JOIN grades gr ON gr.alumno_id = fs.id
  LEFT JOIN observations obs ON obs.alumno_id = fs.id
),
computed AS (
  SELECT
    cb.*,
    ARRAY_REMOVE(ARRAY[
      CASE WHEN cb.riesgo_asistencia THEN 'asistencia' END,
      CASE WHEN cb.riesgo_calificacion THEN 'calificacion' END,
      CASE WHEN cb.riesgo_disciplina THEN 'disciplina' END
    ]::text[], NULL) AS risk_reasons,
    ((CASE WHEN cb.riesgo_asistencia THEN 40 ELSE 0 END) +
     (CASE WHEN cb.riesgo_calificacion THEN 30 ELSE 0 END) +
     (CASE WHEN cb.riesgo_disciplina THEN 20 ELSE 0 END))::integer AS risk_score
  FROM computed_base cb
),
counted AS (
  SELECT
    c.*,
    (COALESCE(array_length(c.risk_reasons, 1), 0) > 0) AS en_riesgo,
    CASE
      WHEN c.risk_score >= 70 THEN 'alto'
      WHEN c.risk_score >= 40 THEN 'medio'
      WHEN c.risk_score > 0 THEN 'bajo'
      ELSE NULL
    END AS nivel_riesgo,
    COUNT(*) OVER () AS total_count,
    COUNT(*) FILTER (WHERE COALESCE(array_length(c.risk_reasons, 1), 0) > 0) OVER () AS risk_count
  FROM computed c
)
SELECT
  counted.alumno_id,
  counted.nombre_completo,
  counted.instrumento_principal,
  counted.asistencia_total,
  counted.asistencia_presentes,
  counted.asistencia_rate,
  counted.progreso_count,
  counted.progreso_promedio,
  counted.observaciones_count,
  counted.risk_reasons,
  counted.en_riesgo,
  counted.risk_score,
  counted.nivel_riesgo,
  counted.total_count,
  counted.risk_count
FROM counted, params
ORDER BY counted.en_riesgo DESC, counted.risk_score DESC, counted.nombre_completo ASC
LIMIT (SELECT page_limit FROM params)
OFFSET (SELECT page_offset FROM params);
$function$;

-- Función: approve_maestro_profile
CREATE OR REPLACE FUNCTION public.approve_maestro_profile(p_profile_id uuid, p_new_rol text, p_new_estado text DEFAULT 'activo'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
    DECLARE
      v_caller_role TEXT;
      v_profile RECORD;
      v_maestro_id UUID;
      v_instrumento TEXT;
      v_resena TEXT;
    BEGIN
      IF auth.uid() IS NULL THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', 'No auth context — must be called from an authenticated request'
        );
      END IF;

      SELECT rol INTO v_caller_role
      FROM public.profiles
      WHERE id = auth.uid();

      IF v_caller_role IS NULL OR v_caller_role NOT IN (
        'admin',
        'superadmin',
        'direccion',
        'coordinacion_academica'
      ) THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', 'Unauthorized: solo roles administrativos pueden aprobar usuarios'
        );
      END IF;

      SELECT * INTO v_profile
      FROM public.profiles
      WHERE id = p_profile_id;

      IF v_profile.id IS NULL THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', 'Profile no encontrado'
        );
      END IF;

      SELECT
        NULLIF(raw_user_meta_data->>'instrumento', ''),
        NULLIF(raw_user_meta_data->>'resena', '')
      INTO v_instrumento, v_resena
      FROM auth.users
      WHERE id = p_profile_id;

      UPDATE public.profiles
      SET rol = p_new_rol,
          estado = p_new_estado,
          updated_at = NOW()
      WHERE id = p_profile_id;

      UPDATE auth.users
      SET email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
          raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
                               || jsonb_build_object('rol', p_new_rol)
      WHERE id = p_profile_id;

      IF p_new_rol = 'admin' THEN
        DELETE FROM public.maestros
        WHERE user_id = p_profile_id;

      ELSIF p_new_rol = 'maestro' THEN
        BEGIN
          -- 1. Intentar con la columna instrumento_principal
          INSERT INTO public.maestros (
            user_id,
            nombre_completo,
            correo,
            instrumento_principal,
            resena,
            activo
          )
          VALUES (
            p_profile_id,
            v_profile.nombre_completo,
            v_profile.email,
            COALESCE(v_instrumento, ''),
            v_resena,
            true
          )
          ON CONFLICT (user_id) DO UPDATE SET
            nombre_completo = EXCLUDED.nombre_completo,
            correo = EXCLUDED.correo,
            instrumento_principal = COALESCE(v_instrumento, public.maestros.instrumento_principal),
            resena = COALESCE(v_resena, public.maestros.resena),
            activo = true;
        EXCEPTION WHEN undefined_column THEN
          -- 2. Fallback a la columna especialidad si instrumento_principal no existe
          INSERT INTO public.maestros (
            user_id,
            nombre_completo,
            correo,
            especialidad,
            resena,
            activo
          )
          VALUES (
            p_profile_id,
            v_profile.nombre_completo,
            v_profile.email,
            COALESCE(v_instrumento, ''),
            v_resena,
            true
          )
          ON CONFLICT (user_id) DO UPDATE SET
            nombre_completo = EXCLUDED.nombre_completo,
            correo = EXCLUDED.correo,
            especialidad = COALESCE(v_instrumento, public.maestros.especialidad),
            resena = COALESCE(v_resena, public.maestros.resena),
            activo = true;
        END;

        SELECT id INTO v_maestro_id
        FROM public.maestros
        WHERE user_id = p_profile_id;

        IF v_maestro_id IS NOT NULL THEN
          INSERT INTO public.permisos_maestros
            (maestro_id, puede_registrar_alumnos, puede_inscribir_clases, permisos)
          VALUES (
            v_maestro_id,
            true,
            true,
            ARRAY['alumnos:create', 'clases:enroll', 'registrar_alumnos', 'inscribir_clases']
          )
          ON CONFLICT (maestro_id) DO UPDATE SET
            puede_registrar_alumnos = true,
            puede_inscribir_clases = true,
            permisos = ARRAY['alumnos:create', 'clases:enroll', 'registrar_alumnos', 'inscribir_clases'];
        END IF;
      END IF;

      RETURN jsonb_build_object(
        'success', true,
        'profile_id', p_profile_id,
        'rol', p_new_rol,
        'estado', p_new_estado
      );
    END;
    $function$;

-- Función: aprobar_usuario
CREATE OR REPLACE FUNCTION public.aprobar_usuario(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_rol text;
BEGIN
  SELECT rol INTO v_rol
  FROM public.profiles
  WHERE id = auth.uid() AND estado = 'activo';

  IF v_rol NOT IN ('admin', 'superadmin') THEN
    RAISE EXCEPTION 'No autorizado: se requiere rol admin o superadmin';
  END IF;

  UPDATE public.profiles
  SET estado = 'activo',
      activo = true,
      updated_at = now()
  WHERE id = p_user_id;
END;
$function$;

-- Función: backfill_alumnos_desde_postulantes
CREATE OR REPLACE FUNCTION public.backfill_alumnos_desde_postulantes(dry_run boolean DEFAULT false)
 RETURNS TABLE(alumno_id uuid, alumno_nombre text, postulante_id uuid, postulante_nombre text, match_tipo text, campos_llenados integer, accion text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  r RECORD;
  filled INT;
  cols   TEXT[];
BEGIN
  FOR r IN
    WITH matches AS (
      SELECT
        a.id               AS a_id,
        a.nombre_completo  AS a_nombre,
        a.correo_representante AS a_correo,
        p.id               AS p_id,
        p.nombre_completo  AS p_nombre,
        p.correo           AS p_correo,
        CASE
          WHEN a.correo_representante IS NOT NULL
           AND a.correo_representante <> ''
           AND lower(trim(a.correo_representante)) = lower(trim(p.correo))
          THEN 'email'
          WHEN (a.correo_representante IS NULL OR a.correo_representante = '')
           AND lower(regexp_replace(trim(a.nombre_completo), '\s+', ' ', 'g'))
             = lower(regexp_replace(trim(p.nombre_completo), '\s+', ' ', 'g'))
          THEN 'nombre'
          ELSE NULL
        END AS match_tipo
      FROM alumnos a
      JOIN postulantes p ON
        (lower(trim(a.correo_representante)) = lower(trim(p.correo))
         AND a.correo_representante IS NOT NULL AND a.correo_representante <> '')
        OR
        (lower(regexp_replace(trim(a.nombre_completo), '\s+', ' ', 'g'))
         = lower(regexp_replace(trim(p.nombre_completo), '\s+', ' ', 'g'))
         AND (a.correo_representante IS NULL OR a.correo_representante = ''))
      WHERE p.estado IS DISTINCT FROM 'inscrito'
         OR p.alumno_id IS DISTINCT FROM a.id
    )
    SELECT *
    FROM matches
    WHERE matches.match_tipo IS NOT NULL
    ORDER BY matches.match_tipo  -- email matches first
  LOOP
    filled := 0;

    -- Build column list dynamically for dry-run detail
    IF NOT dry_run THEN
      UPDATE alumnos SET
        fecha_nacimiento         = COALESCE(alumnos.fecha_nacimiento,        (SELECT p.fecha_nacimiento         FROM postulantes p WHERE p.id = r.p_id)),
        nacionalidad             = COALESCE(alumnos.nacionalidad,            (SELECT p.nacionalidad             FROM postulantes p WHERE p.id = r.p_id)),
        sector_calle_numero      = COALESCE(alumnos.sector_calle_numero,     (SELECT p.sector_calle_numero      FROM postulantes p WHERE p.id = r.p_id)),
        madre_nombre             = COALESCE(alumnos.madre_nombre,            (SELECT p.madre_nombre             FROM postulantes p WHERE p.id = r.p_id)),
        madre_tlf_whatsapp       = COALESCE(alumnos.madre_tlf_whatsapp,      (SELECT p.madre_tlf_whatsapp       FROM postulantes p WHERE p.id = r.p_id)),
        padre_nombre             = COALESCE(alumnos.padre_nombre,            (SELECT p.padre_nombre             FROM postulantes p WHERE p.id = r.p_id)),
        padre_tlf_whatsapp       = COALESCE(alumnos.padre_tlf_whatsapp,      (SELECT p.padre_tlf_whatsapp       FROM postulantes p WHERE p.id = r.p_id)),
        representante_parentesco = COALESCE(alumnos.representante_parentesco,(SELECT p.representante_parentesco FROM postulantes p WHERE p.id = r.p_id)),
        acepta_pago_600          = COALESCE(alumnos.acepta_pago_600,         (SELECT p.acepta_pago_600          FROM postulantes p WHERE p.id = r.p_id)),
        autoriza_fotos_redes     = COALESCE(alumnos.autoriza_fotos_redes,    (SELECT p.autoriza_fotos_redes     FROM postulantes p WHERE p.id = r.p_id))
      WHERE id = r.a_id;

      -- Count how many were actually filled (non-null in postulante, was null/empty in alumno)
      SELECT COUNT(*) INTO filled
      FROM (
        SELECT unnest(ARRAY[
          CASE WHEN (SELECT p.fecha_nacimiento         FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.fecha_nacimiento         FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.nacionalidad             FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.nacionalidad             FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.sector_calle_numero      FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.sector_calle_numero      FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.madre_nombre             FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.madre_nombre             FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.madre_tlf_whatsapp       FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.madre_tlf_whatsapp       FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.padre_nombre             FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.padre_nombre             FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.padre_tlf_whatsapp       FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.padre_tlf_whatsapp       FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.representante_parentesco FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.representante_parentesco FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.acepta_pago_600          FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.acepta_pago_600          FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.autoriza_fotos_redes     FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.autoriza_fotos_redes     FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END
        ])
      ) AS vals(v)
      WHERE v IS NOT NULL;

      -- Mark the postulante as inscribed
      UPDATE postulantes SET
        estado    = 'inscrito',
        alumno_id = r.a_id,
        updated_at = NOW()
      WHERE id = r.p_id
        AND (estado IS DISTINCT FROM 'inscrito' OR postulantes.alumno_id IS DISTINCT FROM r.a_id);
    END IF;

    RETURN QUERY SELECT
      r.a_id,
      r.a_nombre,
      r.p_id,
      r.p_nombre,
      r.match_tipo,
      filled,
      CASE WHEN dry_run THEN 'preview' ELSE 'updated' END;
  END LOOP;

  -- Also handle postulantes that are ALREADY linked (alumno_id already set) but may have new data
  FOR r IN
    SELECT
      a.id               AS a_id,
      a.nombre_completo  AS a_nombre,
      p.id               AS p_id,
      p.nombre_completo  AS p_nombre,
      'ya_vinculado'     AS match_tipo
    FROM postulantes p
    JOIN alumnos a ON a.id = p.alumno_id
    WHERE p.estado = 'inscrito'
      AND p.alumno_id IS NOT NULL
      AND (a.fecha_nacimiento IS NULL
        OR a.nacionalidad IS NULL
        OR a.madre_nombre IS NULL
        OR a.padre_nombre IS NULL)
  LOOP
    filled := 0;

    IF NOT dry_run THEN
      UPDATE alumnos SET
        fecha_nacimiento         = COALESCE(alumnos.fecha_nacimiento,        (SELECT p.fecha_nacimiento         FROM postulantes p WHERE p.id = r.p_id)),
        nacionalidad             = COALESCE(alumnos.nacionalidad,            (SELECT p.nacionalidad             FROM postulantes p WHERE p.id = r.p_id)),
        sector_calle_numero      = COALESCE(alumnos.sector_calle_numero,     (SELECT p.sector_calle_numero      FROM postulantes p WHERE p.id = r.p_id)),
        madre_nombre             = COALESCE(alumnos.madre_nombre,            (SELECT p.madre_nombre             FROM postulantes p WHERE p.id = r.p_id)),
        madre_tlf_whatsapp       = COALESCE(alumnos.madre_tlf_whatsapp,      (SELECT p.madre_tlf_whatsapp       FROM postulantes p WHERE p.id = r.p_id)),
        padre_nombre             = COALESCE(alumnos.padre_nombre,            (SELECT p.padre_nombre             FROM postulantes p WHERE p.id = r.p_id)),
        padre_tlf_whatsapp       = COALESCE(alumnos.padre_tlf_whatsapp,      (SELECT p.padre_tlf_whatsapp       FROM postulantes p WHERE p.id = r.p_id)),
        representante_parentesco = COALESCE(alumnos.representante_parentesco,(SELECT p.representante_parentesco FROM postulantes p WHERE p.id = r.p_id)),
        acepta_pago_600          = COALESCE(alumnos.acepta_pago_600,         (SELECT p.acepta_pago_600          FROM postulantes p WHERE p.id = r.p_id)),
        autoriza_fotos_redes     = COALESCE(alumnos.autoriza_fotos_redes,    (SELECT p.autoriza_fotos_redes     FROM postulantes p WHERE p.id = r.p_id))
      WHERE id = r.a_id;

      SELECT COUNT(*) INTO filled
      FROM (
        SELECT unnest(ARRAY[
          CASE WHEN (SELECT p.fecha_nacimiento         FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.fecha_nacimiento         FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.nacionalidad             FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.nacionalidad             FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.sector_calle_numero      FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.sector_calle_numero      FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.madre_nombre             FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.madre_nombre             FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.madre_tlf_whatsapp       FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.madre_tlf_whatsapp       FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.padre_nombre             FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.padre_nombre             FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.padre_tlf_whatsapp       FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.padre_tlf_whatsapp       FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.representante_parentesco FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.representante_parentesco FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.acepta_pago_600          FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.acepta_pago_600          FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END,
          CASE WHEN (SELECT p.autoriza_fotos_redes     FROM postulantes p WHERE p.id = r.p_id) IS NOT NULL
                AND (SELECT a.autoriza_fotos_redes     FROM alumnos a WHERE a.id = r.a_id) IS NULL THEN 1 END
        ])
      ) AS vals(v)
      WHERE v IS NOT NULL;
    END IF;

    RETURN QUERY SELECT
      r.a_id,
      r.a_nombre,
      r.p_id,
      r.p_nombre,
      r.match_tipo,
      filled,
      CASE WHEN dry_run THEN 'preview' ELSE 'updated' END;
  END LOOP;
END;
$function$;

-- Función: cambiar_estado_activo
CREATE OR REPLACE FUNCTION public.cambiar_estado_activo(p_id uuid, p_nuevo_estado text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_updated RECORD;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No auth context';
  END IF;

  IF NOT es_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_nuevo_estado NOT IN ('disponible', 'prestado', 'en_mantenimiento', 'en_reparacion', 'de_baja') THEN
    RAISE EXCEPTION 'Estado de uso inválido: %', p_nuevo_estado;
  END IF;

  UPDATE public.inventario_activos
  SET estado_uso = p_nuevo_estado,
      updated_at = NOW()
  WHERE id = p_id
  RETURNING * INTO v_updated;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Activo no encontrado';
  END IF;

  RETURN to_jsonb(v_updated);
END;
$function$;

-- Función: cambiar_estado_reparacion
CREATE OR REPLACE FUNCTION public.cambiar_estado_reparacion(p_id uuid, p_nuevo_estado text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_updated RECORD;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No auth context';
  END IF;

  IF NOT es_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_nuevo_estado NOT IN ('recibido', 'en_reparacion', 'finalizado', 'entregado') THEN
    RAISE EXCEPTION 'Estado de reparación inválido: %', p_nuevo_estado;
  END IF;

  UPDATE public.inventario_reparaciones
  SET estado = p_nuevo_estado,
      fecha_egreso = CASE WHEN p_nuevo_estado = 'entregado' THEN CURRENT_DATE ELSE fecha_egreso END,
      updated_at = NOW()
  WHERE id = p_id
  RETURNING * INTO v_updated;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reparación no encontrada';
  END IF;

  RETURN to_jsonb(v_updated);
END;
$function$;

-- Función: cambiar_rol_usuario
CREATE OR REPLACE FUNCTION public.cambiar_rol_usuario(p_user_id uuid, p_nuevo_rol text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_rol text;
BEGIN
  IF p_nuevo_rol NOT IN ('user', 'admin', 'superadmin') THEN
    RAISE EXCEPTION 'Rol inválido';
  END IF;

  SELECT rol INTO v_rol
  FROM public.profiles
  WHERE id = auth.uid() AND estado = 'activo';

  IF v_rol != 'superadmin' THEN
    RAISE EXCEPTION 'No autorizado: solo el superadmin puede cambiar roles';
  END IF;

  UPDATE public.profiles
  SET rol = p_nuevo_rol,
      updated_at = now()
  WHERE id = p_user_id;
END;
$function$;

-- Función: capture_asistencia_marked_at
CREATE OR REPLACE FUNCTION public.capture_asistencia_marked_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Solo setear marked_at la primera vez que se marca
  -- Si ya existe un marked_at, respetarlo (no sobrescribir)
  IF NEW.marked_at IS NULL AND NEW.estado IS NOT NULL THEN
    NEW.marked_at := NOW();
  END IF;
  RETURN NEW;
END;
$function$;

-- Función: capture_observaciones_timestamps
CREATE OR REPLACE FUNCTION public.capture_observaciones_timestamps()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- INSERT: primera vez que se guarda contenido
  IF TG_OP = 'INSERT' THEN
    IF NEW.contenido_raw IS NOT NULL AND NEW.contenido_raw != '' THEN
      NEW.first_note_at := NOW();
      NEW.last_note_at := NOW();
    END IF;
    -- Si se detecta IA (contenido_ia_dsl tiene valor), marcar cuándo
    IF NEW.contenido_ia_dsl IS NOT NULL AND NEW.contenido_ia_dsl != '' THEN
      NEW.ai_fill_at := NOW();
    END IF;
  END IF;

  -- UPDATE: solo actualizar last_note_at si el contenido cambió
  IF TG_OP = 'UPDATE' THEN
    -- Si el contenido cambió
    IF NEW.contenido_raw IS DISTINCT FROM OLD.contenido_raw THEN
      NEW.last_note_at := NOW();
      -- Si es primera vez que se llena (OLD estaba vacío), setear first_note_at
      IF (OLD.contenido_raw IS NULL OR OLD.contenido_raw = '') 
         AND (NEW.contenido_raw IS NOT NULL AND NEW.contenido_raw != '') THEN
        NEW.first_note_at := NOW();
      END IF;
    END IF;
    
    -- Si aparece DSL (AI fue usado en este UPDATE), marcar ai_fill_at
    IF NEW.contenido_ia_dsl IS NOT NULL 
       AND NEW.contenido_ia_dsl IS DISTINCT FROM OLD.contenido_ia_dsl THEN
      NEW.ai_fill_at := NOW();
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Función: check_permisos_maestros_integrity
CREATE OR REPLACE FUNCTION public.check_permisos_maestros_integrity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF public.es_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.maestro_id NOT IN (
    SELECT m.id
    FROM public.maestros m
    WHERE m.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No tenés permisos para modificar el registro de otro maestro.';
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.puede_registrar_alumnos := false;
    NEW.puede_inscribir_clases := false;
    NEW.puede_crear_clases := false;
    NEW.permisos := ARRAY[]::text[];
    NEW.concedido_por := NULL;

  ELSIF TG_OP = 'UPDATE' THEN
    NEW.puede_registrar_alumnos := OLD.puede_registrar_alumnos;
    NEW.puede_inscribir_clases := OLD.puede_inscribir_clases;
    NEW.puede_crear_clases := OLD.puede_crear_clases;
    NEW.permisos := OLD.permisos;
    NEW.concedido_por := OLD.concedido_por;
  END IF;

  RETURN NEW;
END;
$function$;

-- Función: clonar_catalogo_a_clase
CREATE OR REPLACE FUNCTION public.clonar_catalogo_a_clase(p_clase_id uuid, p_nivel_id uuid, p_objetivo_general_ids uuid[] DEFAULT NULL::uuid[])
 RETURNS TABLE(objetivo_id uuid, origen_objetivo_general_id uuid, indicador_id uuid, origen_objetivo_especifico_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_nivel record;
  v_maestro_id uuid;
  v_next_orden_objetivo integer;
  v_objetivo record;
  v_indicador record;
  v_nuevo_objetivo_id uuid;
  v_start_ts timestamptz := clock_timestamp();
BEGIN
  IF NOT public.es_maestro_de_clase(p_clase_id) THEN
    RAISE EXCEPTION 'SOI-CAT-01: el maestro actual no tiene acceso a la clase %', p_clase_id;
  END IF;

  SELECT cn.id, cn.activo INTO v_nivel
  FROM public.catalogo_niveles cn
  WHERE cn.id = p_nivel_id;

  IF v_nivel.id IS NULL OR v_nivel.activo IS NOT TRUE THEN
    RAISE EXCEPTION 'SOI-CAT-02: nivel de catálogo % no existe o está inactivo', p_nivel_id;
  END IF;

  v_maestro_id := public.maestro_actual();

  SELECT COALESCE(MAX(cmo.orden_objetivo), 0)
    INTO v_next_orden_objetivo
  FROM public.clase_mapa_objetivos cmo
  WHERE cmo.clase_id = p_clase_id AND cmo.level_id = p_nivel_id;

  FOR v_objetivo IN
    SELECT og.id, og.nombre, og.descripcion
    FROM public.catalogo_objetivos_generales og
    WHERE og.nivel_id = p_nivel_id
      AND og.activo = true
      AND (p_objetivo_general_ids IS NULL OR og.id = ANY (p_objetivo_general_ids))
    ORDER BY og.orden
  LOOP
    v_next_orden_objetivo := v_next_orden_objetivo + 1;

    INSERT INTO public.clase_mapa_objetivos (
      clase_id, level_id, origen_objetivo_id,
      nombre, descripcion, orden_objetivo, created_by
    ) VALUES (
      p_clase_id, p_nivel_id, v_objetivo.id,
      v_objetivo.nombre, v_objetivo.descripcion, v_next_orden_objetivo, v_maestro_id
    )
    RETURNING id INTO v_nuevo_objetivo_id;

    FOR v_indicador IN
      SELECT oe.id, oe.nombre
      FROM public.catalogo_objetivos_especificos oe
      WHERE oe.objetivo_general_id = v_objetivo.id
        AND oe.activo = true
      ORDER BY oe.orden
    LOOP
      INSERT INTO public.clase_mapa_indicadores (
        objetivo_id, origen_indicator_id, descripcion
      ) VALUES (
        v_nuevo_objetivo_id, v_indicador.id, v_indicador.nombre
      );
    END LOOP;
  END LOOP;

  RETURN QUERY
  SELECT cmo.id, cmo.origen_objetivo_id, cmi.id, cmi.origen_indicator_id
  FROM public.clase_mapa_objetivos cmo
  LEFT JOIN public.clase_mapa_indicadores cmi ON cmi.objetivo_id = cmo.id
  WHERE cmo.clase_id = p_clase_id
    AND cmo.created_at >= v_start_ts;
END;
$function$;

-- Función: clonar_plantilla_a_clase
CREATE OR REPLACE FUNCTION public.clonar_plantilla_a_clase(p_clase_id uuid, p_plantilla_id uuid, p_node_ids uuid[] DEFAULT NULL::uuid[])
 RETURNS TABLE(objetivo_id uuid, origen_objetivo_id uuid, indicador_id uuid, origen_indicator_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_plantilla record;
  v_maestro_id uuid;
  v_next_orden_objetivo integer;
  v_objetivo record;
  v_indicador record;
  v_nuevo_objetivo_id uuid;
  v_start_ts timestamptz := clock_timestamp();
BEGIN
  IF NOT public.es_maestro_de_clase(p_clase_id) THEN
    RAISE EXCEPTION 'SOI-MAPA-06: el maestro actual no tiene acceso a la clase %', p_clase_id;
  END IF;

  SELECT mp.id, mp.route_version_id, mp.level_id, mp.activo
    INTO v_plantilla
  FROM public.mapa_plantillas mp
  WHERE mp.id = p_plantilla_id;

  IF v_plantilla.id IS NULL OR v_plantilla.activo IS NOT TRUE THEN
    RAISE EXCEPTION 'SOI-MAPA-05: plantilla % no existe o está inactiva', p_plantilla_id;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.acm_active_routes ar
    WHERE ar.group_id = p_clase_id
      AND ar.level_id = v_plantilla.level_id
      AND ar.status = 'active'
  ) THEN
    RAISE EXCEPTION 'SOI-MAPA-02: nivel no asignado a la clase';
  END IF;

  v_maestro_id := public.maestro_actual();

  SELECT COALESCE(MAX(cmo.orden_objetivo), 0)
    INTO v_next_orden_objetivo
  FROM public.clase_mapa_objetivos cmo
  WHERE cmo.clase_id = p_clase_id AND cmo.level_id = v_plantilla.level_id;

  FOR v_objetivo IN
    SELECT o.id, o.nombre, o.descripcion, n.id AS node_id
    FROM public.objetivos o
    JOIN public.nodes n ON n.id = o.node_id
    WHERE n.level_id = v_plantilla.level_id
      AND o.activo = true
      AND (p_node_ids IS NULL OR n.id = ANY (p_node_ids))
    ORDER BY n.order_index, o.order_index
  LOOP
    v_next_orden_objetivo := v_next_orden_objetivo + 1;

    INSERT INTO public.clase_mapa_objetivos (
      clase_id, level_id, origen_node_id, origen_objetivo_id,
      nombre, descripcion, orden_objetivo, created_by
    ) VALUES (
      p_clase_id, v_plantilla.level_id, v_objetivo.node_id, v_objetivo.id,
      v_objetivo.nombre, v_objetivo.descripcion, v_next_orden_objetivo, v_maestro_id
    )
    RETURNING id INTO v_nuevo_objetivo_id;

    FOR v_indicador IN
      SELECT i.id, i.description
      FROM public.indicators i
      WHERE i.objetivo_id = v_objetivo.id
      ORDER BY i.order_index
    LOOP
      INSERT INTO public.clase_mapa_indicadores (
        objetivo_id, origen_indicator_id, descripcion
      ) VALUES (
        v_nuevo_objetivo_id, v_indicador.id, v_indicador.description
      );
    END LOOP;
  END LOOP;

  RETURN QUERY
  SELECT cmo.id, cmo.origen_objetivo_id, cmi.id, cmi.origen_indicator_id
  FROM public.clase_mapa_objetivos cmo
  LEFT JOIN public.clase_mapa_indicadores cmi ON cmi.objetivo_id = cmo.id
  WHERE cmo.clase_id = p_clase_id
    AND cmo.created_at >= v_start_ts;
END;
$function$;

-- Función: clone_route_version_as_draft
CREATE OR REPLACE FUNCTION public.clone_route_version_as_draft(p_source_version_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_route_id uuid;
  v_new_version_id uuid;
  v_uid uuid := auth.uid();
  v_existing uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No authenticated user';
  END IF;

  SELECT route_id INTO v_route_id FROM route_versions WHERE id = p_source_version_id;
  IF v_route_id IS NULL THEN
    RAISE EXCEPTION 'Source route version % not found', p_source_version_id;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(v_route_id::text || ':' || v_uid::text));

  SELECT id INTO v_existing
    FROM route_versions
   WHERE route_id = v_route_id AND created_by = v_uid AND status = 'draft'
   LIMIT 1;
  IF v_existing IS NOT NULL THEN
    RETURN v_existing;
  END IF;

  v_new_version_id := gen_random_uuid();
  INSERT INTO route_versions (id, route_id, version, status, notes, created_by, created_at)
  VALUES (v_new_version_id, v_route_id, 'draft-' || left(v_uid::text, 8), 'draft',
          'Borrador del maestro', v_uid, now());

  CREATE TEMP TABLE _blk_map (old uuid, new uuid) ON COMMIT DROP;
  CREATE TEMP TABLE _lvl_map (old uuid, new uuid) ON COMMIT DROP;
  CREATE TEMP TABLE _nod_map (old uuid, new uuid) ON COMMIT DROP;

  INSERT INTO _blk_map(old, new)
  SELECT id, gen_random_uuid() FROM blocks WHERE route_version_id = p_source_version_id;
  INSERT INTO blocks (id, route_version_id, name, level_from, level_to, objective, description, order_index)
  SELECT m.new, v_new_version_id, b.name, b.level_from, b.level_to, b.objective, b.description, b.order_index
  FROM blocks b JOIN _blk_map m ON m.old = b.id
  WHERE b.route_version_id = p_source_version_id;

  INSERT INTO _lvl_map(old, new)
  SELECT id, gen_random_uuid() FROM levels WHERE route_version_id = p_source_version_id;
  INSERT INTO levels (id, block_id, route_version_id, level_number, name, main_objective,
                      suggested_duration_value, suggested_duration_unit, is_flexible_duration,
                      target_work, unlock_criteria, order_index)
  SELECT lm.new, bm.new, v_new_version_id, l.level_number, l.name, l.main_objective,
         l.suggested_duration_value, l.suggested_duration_unit, l.is_flexible_duration,
         l.target_work, l.unlock_criteria, l.order_index
  FROM levels l
  JOIN _lvl_map lm ON lm.old = l.id
  LEFT JOIN _blk_map bm ON bm.old = l.block_id
  WHERE l.route_version_id = p_source_version_id;

  INSERT INTO _nod_map(old, new)
  SELECT id, gen_random_uuid() FROM nodes WHERE route_version_id = p_source_version_id;
  INSERT INTO nodes (id, level_id, route_version_id, name, type, is_critical, is_required, objective, order_index)
  SELECT nm.new, lm.new, v_new_version_id, n.name, n.type, n.is_critical, n.is_required, n.objective, n.order_index
  FROM nodes n
  JOIN _nod_map nm ON nm.old = n.id
  LEFT JOIN _lvl_map lm ON lm.old = n.level_id
  WHERE n.route_version_id = p_source_version_id;

  INSERT INTO indicators (id, node_id, description, minimum_criteria, is_required, order_index, nombre, activo)
  SELECT gen_random_uuid(), nm.new, i.description, i.minimum_criteria, i.is_required, i.order_index, i.nombre, i.activo
  FROM indicators i
  JOIN _nod_map nm ON nm.old = i.node_id;

  RETURN v_new_version_id;
END;
$function$;

-- Función: count_alumnos_activos
CREATE OR REPLACE FUNCTION public.count_alumnos_activos()
 RETURNS bigint
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT count(*) FROM public.alumnos WHERE activo = true;
$function$;

-- Función: crear_reparacion
CREATE OR REPLACE FUNCTION public.crear_reparacion(p_activo_id uuid, p_tipo_tallerista text, p_tallerista_nombre text, p_descripcion text, p_costo_estimado numeric, p_proveedor_factura_url text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_inserted RECORD;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No auth context';
  END IF;
  
  IF NOT es_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  INSERT INTO public.inventario_reparaciones (
    activo_id,
    tipo_tallerista,
    tallerista_nombre,
    descripcion,
    costo_estimado,
    proveedor_factura_url,
    estado
  ) VALUES (
    p_activo_id,
    p_tipo_tallerista,
    p_tallerista_nombre,
    p_descripcion,
    p_costo_estimado,
    p_proveedor_factura_url,
    'recibido'
  )
  RETURNING * INTO v_inserted;

  RETURN to_jsonb(v_inserted);
END;
$function$;

-- Función: create_profile_for_maestro
CREATE OR REPLACE FUNCTION public.create_profile_for_maestro()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Solo crear si user_id existe y no hay profile previo
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, nombre_completo, rol)
    VALUES (NEW.user_id, NEW.correo, NEW.nombre_completo, 'maestro')
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

-- Función: diagnose_profiles_schema
CREATE OR REPLACE FUNCTION public.diagnose_profiles_schema()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_columns JSONB;
  v_constraints JSONB;
  v_triggers JSONB;
  v_functions JSONB;
BEGIN
  -- Columns
  SELECT jsonb_agg(jsonb_build_object(
    'column_name', column_name,
    'data_type', data_type,
    'is_nullable', is_nullable,
    'column_default', column_default
  ) ORDER BY ordinal_position)
  INTO v_columns
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'profiles';

  -- Check constraints
  SELECT jsonb_agg(jsonb_build_object(
    'constraint_name', conname,
    'definition', pg_get_constraintdef(oid)
  ))
  INTO v_constraints
  FROM pg_constraint
  WHERE conrelid = 'public.profiles'::regclass AND contype = 'c';

  -- Triggers on auth.users
  SELECT jsonb_agg(jsonb_build_object(
    'trigger_name', tgname,
    'function', p.proname,
    'event', tgtype::text
  ))
  INTO v_triggers
  FROM pg_trigger t
  JOIN pg_proc p ON t.tgfoid = p.oid
  WHERE t.tgrelid = 'auth.users'::regclass
    AND NOT t.tgisinternal;

  -- Trigger functions
  SELECT jsonb_agg(jsonb_build_object(
    'function_name', p.proname,
    'owner', pg_catalog.pg_get_userbyid(p.proowner),
    'secdef', p.prosecdef
  ))
  INTO v_functions
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname IN ('handle_new_user', 'handle_profile_insert_maestro', 'get_user_role', 'is_admin', 'is_teacher', 'profile_is_active');

  RETURN jsonb_build_object(
    'profiles_columns', v_columns,
    'profiles_check_constraints', v_constraints,
    'auth_users_triggers', v_triggers,
    'public_functions', v_functions
  );
END;
$function$;

-- Función: eliminar_maestro_limpio
CREATE OR REPLACE FUNCTION public.eliminar_maestro_limpio(p_maestro_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_maestro record;
  v_clases_count integer;
BEGIN
  -- Validar permiso exclusivo de superadmin / desarrollador
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Acción denegada: Solo el desarrollador o super-administrador puede eliminar permanentemente maestros de la base de datos. Los administradores deben inactivar.' USING ERRCODE = '42501';
  END IF;

  -- 1. Verificar si el maestro existe
  SELECT * INTO v_maestro FROM public.maestros WHERE id = p_maestro_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'El maestro no existe.' USING ERRCODE = 'P0002';
  END IF;

  -- 2. Evaluar si tiene clases asignadas (como titular o suplente)
  SELECT count(*) INTO v_clases_count
    FROM public.clases
   WHERE maestro_principal_id = p_maestro_id 
      OR maestro_suplente_id = p_maestro_id 
      OR maestro_id = p_maestro_id;

  IF v_clases_count > 0 THEN
    RAISE EXCEPTION 'No se puede eliminar el maestro porque tiene % clase(s) asignada(s). Reasigna o desvincula las clases primero.', v_clases_count USING ERRCODE = '23503';
  END IF;

  -- 3. Limpiar registros dependientes auxiliares de permisos y credenciales
  DELETE FROM public.maestro_access_credentials WHERE maestro_id = p_maestro_id;
  DELETE FROM public.permisos_maestros WHERE maestro_id = p_maestro_id;
  DELETE FROM public.solicitudes_permisos WHERE maestro_id = p_maestro_id;
  DELETE FROM public.maestro_desempeno WHERE maestro_id = p_maestro_id;
  DELETE FROM public.maestro_retiros WHERE maestro_id = p_maestro_id;
  DELETE FROM public.registros_pendientes WHERE maestro_id = p_maestro_id;
  DELETE FROM public.asistencia_maestros WHERE maestro_id = p_maestro_id OR suplente_id = p_maestro_id;

  -- 4. Eliminar el maestro
  DELETE FROM public.maestros WHERE id = p_maestro_id;

  -- 5. Si existe usuario en profiles vinculado, desactivarlo
  IF v_maestro.user_id IS NOT NULL THEN
    UPDATE public.profiles SET activo = false, updated_at = now() WHERE id = v_maestro.user_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'eliminado_id', p_maestro_id,
    'nombre', v_maestro.nombre_completo
  );
END;
$function$;

-- Función: ensure_session_and_save_evaluation
CREATE OR REPLACE FUNCTION public.ensure_session_and_save_evaluation(p_clase_id uuid, p_maestro_id uuid, p_fecha date, p_hora_inicio time with time zone, p_indicator_id uuid, p_student_id uuid, p_nota integer, p_observations text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_session_id UUID;
BEGIN
  -- 1. Buscar sesión existente
  SELECT s.id
  INTO v_session_id
  FROM public.sesiones_clase s
  WHERE s.clase_id = p_clase_id
    AND s.fecha = p_fecha
    AND s.hora_inicio IS NOT DISTINCT FROM p_hora_inicio
  LIMIT 1;

  -- 2. Si no existe, crear
  IF v_session_id IS NULL THEN
    INSERT INTO public.sesiones_clase (clase_id, maestro_id, fecha, hora_inicio, contenido)
    VALUES (p_clase_id, p_maestro_id, p_fecha, p_hora_inicio, '')
    RETURNING id INTO v_session_id;
  END IF;

  -- 3. Upsert de la evaluación (sin la columna updated_at)
  INSERT INTO public.indicator_attempts (session_id, indicator_id, student_id, nota, observations)
  VALUES (v_session_id, p_indicator_id, p_student_id, p_nota, p_observations)
  ON CONFLICT (session_id, indicator_id, student_id)
  DO UPDATE SET
    nota = EXCLUDED.nota,
    observations = EXCLUDED.observations;

  RETURN v_session_id;
END;
$function$;

-- Función: es_admin
CREATE OR REPLACE FUNCTION public.es_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_role TEXT;
BEGIN
  SELECT p.rol INTO v_role
  FROM public.profiles p
  WHERE p.id = auth.uid();
  RETURN COALESCE(v_role IN ('admin', 'inventarista'), FALSE);
END;
$function$;

-- Función: es_coordinador_acm
CREATE OR REPLACE FUNCTION public.es_coordinador_acm()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_role TEXT;
BEGIN
  SELECT p.rol INTO v_role FROM public.profiles p WHERE p.id = auth.uid();
  RETURN COALESCE(v_role IN ('admin', 'coordinacion_academica'), FALSE);
END;
$function$;

-- Función: es_maestro_de_clase
CREATE OR REPLACE FUNCTION public.es_maestro_de_clase(p_clase_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.clases c
    WHERE c.id = p_clase_id
      AND public.maestro_actual() IS NOT NULL
      AND public.maestro_actual() IN (c.maestro_principal_id, c.maestro_suplente_id, c.maestro_id)
  );
$function$;

-- Función: es_maestro_titular_de_clase
CREATE OR REPLACE FUNCTION public.es_maestro_titular_de_clase(p_clase_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.clases c
    WHERE c.id = p_clase_id
      AND public.maestro_actual() IS NOT NULL
      AND public.maestro_actual() IN (c.maestro_principal_id, c.maestro_id)
  );
$function$;

-- Función: fn_activar_campania
CREATE OR REPLACE FUNCTION public.fn_activar_campania(p_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE c public.campanias_periodo; v_insertados int;
BEGIN
  IF NOT es_admin() THEN RAISE EXCEPTION 'no autorizado'; END IF;
  SELECT * INTO c FROM public.campanias_periodo WHERE id = p_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'campania no encontrada'; END IF;

  IF c.accion = 'inscripcion' THEN
    WITH cand AS (
      SELECT DISTINCT ON (jid) sub.id AS persona_id, sub.nombre_completo AS nombre, sub.segmento, sub.jid
      FROM (
        SELECT p.id, p.nombre_completo,
          CASE WHEN p.estado IN ('pendiente','postulado','contactado','en_espera') THEN 'primer_contacto'
               WHEN p.estado IN ('no_show','reprogramado') THEN 'recuperacion' END AS segmento,
          coalesce(nullif(normalize_phone(p.madre_tlf_whatsapp),''),
                   nullif(normalize_phone(p.padre_tlf_whatsapp),''),
                   nullif(normalize_phone(p.telefono_alumno),'')) AS jid
        FROM public.postulantes p
        WHERE p.estado IN ('pendiente','postulado','contactado','en_espera','no_show','reprogramado')
          AND ((c.tipo='A' AND extract(month FROM p.fecha_postulacion) BETWEEN 1 AND 6)
            OR (c.tipo='B' AND extract(month FROM p.fecha_postulacion) BETWEEN 7 AND 12))
      ) sub
      WHERE sub.jid IS NOT NULL
      ORDER BY sub.jid, sub.id
    )
    INSERT INTO public.campania_envios (campania_id, fuente, persona_id, nombre, telefono, jid, segmento, mensaje)
    SELECT p_id, 'postulante', persona_id, nombre, jid, jid || '@s.whatsapp.net', segmento,
      CASE segmento
        WHEN 'primer_contacto' THEN 'Hola 👋 Le escribimos de El Sistema Punta Cana. Responda *CITA* para agendar su cita de Iniciación Musical.'
        WHEN 'recuperacion' THEN 'Hola 👋 El Sistema Punta Cana. Responda *REAGENDAR* para coordinar una nueva fecha para su cita de Iniciación Musical.'
      END
    FROM cand
    ON CONFLICT (campania_id, jid) DO NOTHING;
  ELSE
    WITH cand AS (
      SELECT DISTINCT ON (jid) sub.id AS persona_id, sub.nombre_completo AS nombre, sub.jid
      FROM (
        SELECT a.id, a.nombre_completo,
          coalesce(nullif(normalize_phone(a.madre_tlf_whatsapp),''),
                   nullif(normalize_phone(a.padre_tlf_whatsapp),''),
                   nullif(normalize_phone(a.representante_tlf),''),
                   nullif(normalize_phone(a.tlf_alumno),'')) AS jid
        FROM public.alumnos a WHERE a.activo = true
      ) sub
      WHERE sub.jid IS NOT NULL
      ORDER BY sub.jid, sub.id
    )
    INSERT INTO public.campania_envios (campania_id, fuente, persona_id, nombre, telefono, jid, segmento, mensaje)
    SELECT p_id, 'alumno', persona_id, nombre, jid, jid || '@s.whatsapp.net', 'reinscripcion',
      'Hola 👋 El Sistema Punta Cana. Inició la reinscripción. Responda *REINSCRIBIR* para confirmar su cupo y actualizar sus datos.'
    FROM cand
    ON CONFLICT (campania_id, jid) DO NOTHING;
  END IF;

  GET DIAGNOSTICS v_insertados = ROW_COUNT;
  UPDATE public.campanias_periodo SET activo = true, updated_at = now() WHERE id = p_id;
  RETURN json_build_object('materializados', v_insertados);
END $function$;

-- Función: fn_activar_periodo
CREATE OR REPLACE FUNCTION public.fn_activar_periodo(p_periodo_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_periodo record;
  v_anterior uuid;
BEGIN
  IF NOT es_admin() THEN
    RAISE EXCEPTION 'Operacion no autorizada: se requiere rol administrador';
  END IF;

  SELECT * INTO v_periodo FROM public.periodos WHERE id = p_periodo_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Periodo no encontrado';
  END IF;

  IF v_periodo.cerrado THEN
    RAISE EXCEPTION 'No se puede activar un periodo cerrado: %', v_periodo.nombre;
  END IF;

  SELECT id INTO v_anterior FROM public.periodos WHERE activo IS TRUE AND id <> p_periodo_id;

  UPDATE public.periodos SET activo = false, updated_at = now()
   WHERE activo IS TRUE AND id <> p_periodo_id;

  UPDATE public.periodos SET activo = true, updated_at = now()
   WHERE id = p_periodo_id;

  RETURN jsonb_build_object(
    'ok', true, 'periodo_id', p_periodo_id, 'nombre', v_periodo.nombre,
    'periodo_anterior_id', v_anterior);
END;
$function$;

-- Función: fn_actualizar_contacto
CREATE OR REPLACE FUNCTION public.fn_actualizar_contacto(p_tipo text, p_nombre text, p_campo text, p_valor text, p_secret text)
 RETURNS TABLE(persona_nombre text, tipo text, campo text, valor_anterior text, valor_nuevo text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_secret text;
  v_id uuid;
  v_nombre text;
  v_anterior text;
  v_match_count int;
begin
  select value into v_secret from public.system_config where key = 'hermes_internal_lookup_secret';
  if v_secret is null or p_secret is null or p_secret <> v_secret then
    raise exception 'unauthorized';
  end if;

  if p_tipo = 'alumno' then
    if p_campo not in ('telefono_alumno','representante_telefono','direccion') then
      raise exception 'campo inválido para alumno: %', p_campo;
    end if;
    select count(*) into v_match_count from public.alumnos where nombre_completo ilike '%' || p_nombre || '%' and activo = true;
    if v_match_count = 0 then raise exception 'no encontré un alumno activo llamado %', p_nombre; end if;
    if v_match_count > 1 then raise exception 'hay % alumnos que coinciden con %', v_match_count, p_nombre; end if;

    select id, nombre_completo,
      case p_campo when 'telefono_alumno' then tlf_alumno when 'representante_telefono' then representante_tlf else direccion end
    into v_id, v_nombre, v_anterior
    from public.alumnos where nombre_completo ilike '%' || p_nombre || '%' and activo = true;

    if p_campo = 'telefono_alumno' then update public.alumnos set tlf_alumno = p_valor, updated_at = now() where id = v_id;
    elsif p_campo = 'representante_telefono' then update public.alumnos set representante_tlf = p_valor, updated_at = now() where id = v_id;
    else update public.alumnos set direccion = p_valor, updated_at = now() where id = v_id;
    end if;

  elsif p_tipo = 'maestro' then
    if p_campo not in ('telefono','correo') then
      raise exception 'campo inválido para maestro: %', p_campo;
    end if;
    select count(*) into v_match_count from public.maestros where nombre_completo ilike '%' || p_nombre || '%' and activo = true;
    if v_match_count = 0 then raise exception 'no encontré un maestro activo llamado %', p_nombre; end if;
    if v_match_count > 1 then raise exception 'hay % maestros que coinciden con %', v_match_count, p_nombre; end if;

    select id, nombre_completo, case p_campo when 'telefono' then tlf else correo end
    into v_id, v_nombre, v_anterior
    from public.maestros where nombre_completo ilike '%' || p_nombre || '%' and activo = true;

    if p_campo = 'telefono' then update public.maestros set tlf = p_valor, updated_at = now() where id = v_id;
    else update public.maestros set correo = p_valor, updated_at = now() where id = v_id;
    end if;

  elsif p_tipo = 'postulante' then
    if p_campo not in ('telefono_alumno','madre_telefono','padre_telefono') then
      raise exception 'campo inválido para postulante: %', p_campo;
    end if;
    select count(*) into v_match_count from public.postulantes where nombre_completo ilike '%' || p_nombre || '%';
    if v_match_count = 0 then raise exception 'no encontré un postulante llamado %', p_nombre; end if;
    if v_match_count > 1 then raise exception 'hay % postulantes que coinciden con %', v_match_count, p_nombre; end if;

    select id, nombre_completo,
      case p_campo when 'telefono_alumno' then telefono_alumno when 'madre_telefono' then madre_tlf_whatsapp else padre_tlf_whatsapp end
    into v_id, v_nombre, v_anterior
    from public.postulantes where nombre_completo ilike '%' || p_nombre || '%';

    if p_campo = 'telefono_alumno' then update public.postulantes set telefono_alumno = p_valor, updated_at = now() where id = v_id;
    elsif p_campo = 'madre_telefono' then update public.postulantes set madre_tlf_whatsapp = p_valor, updated_at = now() where id = v_id;
    else update public.postulantes set padre_tlf_whatsapp = p_valor, updated_at = now() where id = v_id;
    end if;

  else
    raise exception 'tipo inválido: % (debe ser alumno, maestro o postulante)', p_tipo;
  end if;

  return query select v_nombre, p_tipo, p_campo, v_anterior, p_valor;
end;
$function$;

-- Función: fn_actualizar_estado_postulante
CREATE OR REPLACE FUNCTION public.fn_actualizar_estado_postulante(p_nombre text, p_nuevo_estado text, p_secret text)
 RETURNS TABLE(postulante_nombre text, estado_anterior text, estado_nuevo text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_secret text;
  v_id uuid;
  v_nombre text;
  v_anterior text;
begin
  select value into v_secret from public.system_config where key = 'hermes_internal_lookup_secret';
  if v_secret is null or p_secret is null or p_secret <> v_secret then
    raise exception 'unauthorized';
  end if;

  if p_nuevo_estado not in ('pendiente','contactado','cita_agendada','inscrito') then
    raise exception 'estado inválido: %', p_nuevo_estado;
  end if;

  select id, nombre_completo, estado into v_id, v_nombre, v_anterior
  from public.postulantes
  where nombre_completo ilike '%' || p_nombre || '%'
  order by nombre_completo
  limit 2;
  -- limit 2 is a cheap ambiguity trip-wire; the count check below catches it.

  if v_id is null then
    raise exception 'no encontré un postulante llamado %', p_nombre;
  end if;
  if (select count(*) from public.postulantes where nombre_completo ilike '%' || p_nombre || '%') > 1 then
    raise exception 'hay más de un postulante que coincide con %', p_nombre;
  end if;

  update public.postulantes set estado = p_nuevo_estado, updated_at = now() where id = v_id;

  return query select v_nombre, v_anterior, p_nuevo_estado;
end;
$function$;

-- Función: fn_actualizar_racha_alumno
CREATE OR REPLACE FUNCTION public.fn_actualizar_racha_alumno(p_alumno_id uuid, p_fecha date, p_clase_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_racha RECORD;
  v_prev_sesion_fecha date;
BEGIN
  IF p_alumno_id IS NULL OR p_fecha IS NULL THEN
    RETURN;
  END IF;

  SELECT * INTO v_racha FROM rachas WHERE alumno_id = p_alumno_id;

  IF NOT FOUND THEN
    INSERT INTO rachas (alumno_id, racha_actual, racha_maxima, ultima_fecha_activa)
    VALUES (p_alumno_id, 1, 1, p_fecha);
    RETURN;
  END IF;

  IF p_fecha <= v_racha.ultima_fecha_activa THEN
    RETURN;
  END IF;

  SELECT MAX(fecha) INTO v_prev_sesion_fecha
  FROM sesiones_clase
  WHERE clase_id = p_clase_id AND fecha < p_fecha;

  IF v_prev_sesion_fecha IS NULL OR v_prev_sesion_fecha = v_racha.ultima_fecha_activa THEN
    UPDATE rachas
    SET racha_actual = v_racha.racha_actual + 1,
        racha_maxima = GREATEST(v_racha.racha_maxima, v_racha.racha_actual + 1),
        ultima_fecha_activa = p_fecha,
        updated_at = now()
    WHERE alumno_id = p_alumno_id;
  ELSE
    UPDATE rachas
    SET racha_actual = 1,
        ultima_fecha_activa = p_fecha,
        updated_at = now()
    WHERE alumno_id = p_alumno_id;
  END IF;
END;
$function$;

-- Función: fn_actualizar_tarea
CREATE OR REPLACE FUNCTION public.fn_actualizar_tarea(p_tarea_id uuid, p_nuevo_estado text, p_notas text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_tarea RECORD;
  v_puede_actualizar boolean;
BEGIN
  SELECT * INTO v_tarea FROM public.tareas_calendario WHERE id = p_tarea_id;

  IF v_tarea IS NULL THEN
    RETURN json_build_object('error', 'Tarea no encontrada');
  END IF;

  -- Verificar permisos (asignado_a, jefe del depto, o admin)
  v_puede_actualizar := (
    v_tarea.asignado_a = auth.uid()
    OR EXISTS(
      SELECT 1 FROM public.usuario_departamentos
      WHERE user_id = auth.uid() AND departamento_id = v_tarea.departamento_id AND rol = 'jefe'
    )
    OR get_user_role() = 'admin'
  );

  IF NOT v_puede_actualizar THEN
    RETURN json_build_object('error', 'No tiene permiso para actualizar esta tarea');
  END IF;

  -- Validar estado
  IF p_nuevo_estado NOT IN ('pendiente', 'en_progreso', 'completada', 'atrasada') THEN
    RETURN json_build_object('error', 'Estado inválido');
  END IF;

  -- Actualizar
  UPDATE public.tareas_calendario
  SET estado = p_nuevo_estado, updated_at = now()
  WHERE id = p_tarea_id;

  -- Registrar log
  INSERT INTO public.tarea_logs(tarea_id, evento, cambios, changed_by)
  VALUES(p_tarea_id, 'estado_actualizado', json_build_object('nuevo_estado', p_nuevo_estado, 'notas', p_notas), auth.uid());

  RETURN json_build_object(
    'success', true,
    'tarea_id', p_tarea_id,
    'nuevo_estado', p_nuevo_estado,
    'mensaje', 'Tarea actualizada'
  );
END
$function$;

-- Función: fn_alumno_evaluaciones_recientes
CREATE OR REPLACE FUNCTION public.fn_alumno_evaluaciones_recientes(p_alumno_id uuid)
 RETURNS TABLE(evaluacion_id uuid, fecha_evaluacion date, estado_cualitativo text, calificacion numeric, evaluacion_tipo text, objetivo text, contenido_dsl text, observaciones text, tarea text, es_colectivo boolean, maestro_nombre text, clase_nombre text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF get_user_role() NOT IN ('finanzas', 'admin', 'direccion') THEN
    RAISE EXCEPTION 'No autorizado para consultar evaluaciones pedagógicas.';
  END IF;

  RETURN QUERY
  SELECT
    p.id AS evaluacion_id,
    p.fecha_evaluacion,
    p.estado_cualitativo::text,
    p.calificacion,
    p.evaluacion_tipo::text,
    COALESCE(o.nombre, p.contenido_dsl, 'Práctica y Repertorio')::text AS objetivo,
    p.contenido_dsl::text,
    p.observaciones::text,
    (p.indicadores->>'tarea')::text AS tarea,
    (COALESCE((p.indicadores->>'es_colectivo')::boolean, false) OR c.nombre ILIKE '%seccional%' OR c.nombre ILIKE '%orquesta%') AS es_colectivo,
    COALESCE(m.nombre_completo, 'Cátedra Instrumental')::text AS maestro_nombre,
    COALESCE(c.nombre, 'Sesión Instrumental')::text AS clase_nombre
  FROM public.progresos p
  LEFT JOIN public.objetivos o ON o.id = p.objetivo_id
  LEFT JOIN public.maestros m ON m.id = p.maestro_id
  LEFT JOIN public.clases c ON c.id = p.clase_id
  WHERE p.alumno_id = p_alumno_id
  ORDER BY p.fecha_evaluacion DESC NULLS LAST, p.created_at DESC
  LIMIT 5;
END;
$function$;

-- Función: fn_alumno_ficha_360
CREATE OR REPLACE FUNCTION public.fn_alumno_ficha_360(p_alumno_id uuid)
 RETURNS TABLE(total_sesiones integer, presentes integer, ausentes integer, justificados integer, primera_asistencia date, ultima_asistencia date, total_evaluaciones integer, ultima_fecha_evaluacion date, ultima_calificacion numeric, ultimo_estado_cualitativo text, ultimo_objetivo text, ultimas_observaciones text, ultima_tarea text, ultimo_contenido_dsl text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
  IF get_user_role() NOT IN ('finanzas', 'admin', 'direccion') THEN
    RAISE EXCEPTION 'No autorizado para consultar la ficha 360 de alumnos.';
  END IF;

  RETURN QUERY
  SELECT
    count(a.*)::int AS total_sesiones,
    count(*) FILTER (WHERE a.estado = 'presente')::int AS presentes,
    count(*) FILTER (WHERE a.estado = 'ausente')::int AS ausentes,
    count(*) FILTER (WHERE a.estado = 'justificado')::int AS justificados,
    min(a.fecha) AS primera_asistencia,
    max(a.fecha) AS ultima_asistencia,
    (SELECT count(*)::int FROM public.progresos p WHERE p.alumno_id = p_alumno_id) AS total_evaluaciones,
    (SELECT max(p.fecha_evaluacion) FROM public.progresos p WHERE p.alumno_id = p_alumno_id) AS ultima_fecha_evaluacion,
    (SELECT p.calificacion FROM public.progresos p WHERE p.alumno_id = p_alumno_id ORDER BY p.fecha_evaluacion DESC NULLS LAST, p.created_at DESC LIMIT 1) AS ultima_calificacion,
    (SELECT p.estado_cualitativo FROM public.progresos p WHERE p.alumno_id = p_alumno_id ORDER BY p.fecha_evaluacion DESC NULLS LAST, p.created_at DESC LIMIT 1) AS ultimo_estado_cualitativo,
    (SELECT COALESCE(o.nombre, p.contenido_dsl, 'Práctica y Repertorio') FROM public.progresos p LEFT JOIN public.objetivos o ON o.id = p.objetivo_id WHERE p.alumno_id = p_alumno_id ORDER BY p.fecha_evaluacion DESC NULLS LAST, p.created_at DESC LIMIT 1) AS ultimo_objetivo,
    (SELECT p.observaciones FROM public.progresos p WHERE p.alumno_id = p_alumno_id ORDER BY p.fecha_evaluacion DESC NULLS LAST, p.created_at DESC LIMIT 1) AS ultimas_observaciones,
    (SELECT p.indicadores->>'tarea' FROM public.progresos p WHERE p.alumno_id = p_alumno_id ORDER BY p.fecha_evaluacion DESC NULLS LAST, p.created_at DESC LIMIT 1) AS ultima_tarea,
    (SELECT p.contenido_dsl FROM public.progresos p WHERE p.alumno_id = p_alumno_id ORDER BY p.fecha_evaluacion DESC NULLS LAST, p.created_at DESC LIMIT 1) AS ultimo_contenido_dsl
  FROM public.asistencias a
  WHERE a.alumno_id = p_alumno_id;
END;
$function$;

-- Función: fn_alumno_instrumentos_comodato
CREATE OR REPLACE FUNCTION public.fn_alumno_instrumentos_comodato(p_alumno_id uuid)
 RETURNS TABLE(comodato_id uuid, tipo_comodato text, fecha_entrega date, fecha_vencimiento date, comodato_estado text, contrato_firmado_url text, activo_id uuid, codigo_inventario text, tipo_instrumento text, marca text, modelo text, numero_serie text, estado_conservacion text, estado_uso text, ubicacion text, en_reparacion boolean, reparacion_estado text, reparacion_descripcion text, reparacion_fecha_ingreso date)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF get_user_role() NOT IN ('finanzas', 'admin', 'direccion') THEN
    RAISE EXCEPTION 'No autorizado para consultar los instrumentos del alumno.';
  END IF;

  RETURN QUERY
  SELECT
    c.id,
    c.tipo_comodato::text,
    c.fecha_entrega,
    c.fecha_vencimiento,
    c.estado::text,
    c.contrato_firmado_url::text,
    i.id,
    i.codigo_inventario::text,
    i.tipo_instrumento::text,
    i.marca::text,
    i.modelo::text,
    i.numero_serie::text,
    i.estado_conservacion::text,
    i.estado_uso::text,
    i.ubicacion::text,
    (r.id IS NOT NULL) AS en_reparacion,
    r.estado::text AS reparacion_estado,
    r.descripcion AS reparacion_descripcion,
    r.fecha_ingreso AS reparacion_fecha_ingreso
  FROM public.comodatos_activos c
  JOIN public.inventario_activos i ON i.id = c.activo_id
  LEFT JOIN LATERAL (
    SELECT rr.id, rr.estado, rr.descripcion, rr.fecha_ingreso, rr.created_at
    FROM public.inventario_reparaciones rr
    WHERE rr.activo_id = i.id
      AND rr.estado IN ('recibido', 'en_reparacion')
    ORDER BY rr.fecha_ingreso DESC NULLS LAST, rr.created_at DESC
    LIMIT 1
  ) r ON true
  WHERE c.alumno_id = p_alumno_id
  ORDER BY c.fecha_entrega DESC NULLS LAST, c.created_at DESC;
END;
$function$;

-- Función: fn_alumnos_inasistencias_pendiente
CREATE OR REPLACE FUNCTION public.fn_alumnos_inasistencias_pendiente(p_secret text)
 RETURNS TABLE(alumno_nombre text, inasistencias bigint, ultima_fecha date)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_secret text;
begin
  select value into v_secret from public.system_config where key = 'hermes_internal_lookup_secret';
  if v_secret is null or p_secret is null or p_secret <> v_secret then
    raise exception 'unauthorized';
  end if;

  return query
  select
    a.nombre_completo,
    count(asis.id),
    max(asis.fecha)
  from public.asistencias asis
  join public.alumnos a on a.id = asis.alumno_id
  where asis.estado = 'ausente'
    and asis.fecha >= current_date - interval '7 days'
    and asis.fecha <= current_date
    and a.activo = true
    and coalesce(a.representante_tlf, a.madre_tlf_whatsapp, a.padre_tlf_whatsapp) is not null
    and not exists (
      select 1 from public.comunicaciones_seguimiento cs
      where cs.alumno_id = a.id
        and cs.fecha >= current_date - interval '7 days'
    )
  group by a.nombre_completo
  order by count(asis.id) desc, a.nombre_completo
  limit 200;
end;
$function$;

-- Función: fn_anular_sesiones_no_lectivas
CREATE OR REPLACE FUNCTION public.fn_anular_sesiones_no_lectivas(p_dry_run boolean DEFAULT true, p_desde date DEFAULT NULL::date, p_hasta date DEFAULT NULL::date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_candidatas jsonb;
  v_total      integer;
  v_protegidas integer;
  v_afectadas  integer := 0;
BEGIN
  IF NOT es_admin() THEN
    RAISE EXCEPTION 'Operacion no autorizada: se requiere rol administrador';
  END IF;

  DROP TABLE IF EXISTS _anul;
  CREATE TEMP TABLE _anul ON COMMIT DROP AS
  SELECT s.id, s.fecha, s.estado, s.clase_id,
         EXISTS (SELECT 1 FROM public.asistencias a WHERE a.sesion_clase_id = s.id) AS tiene_asistencia,
         public.fn_estado_calendario(s.fecha)->>'motivo'  AS motivo_calendario,
         public.fn_estado_calendario(s.fecha)->>'detalle' AS detalle_calendario
  FROM public.sesiones_clase s
  WHERE NOT public.fn_es_dia_lectivo(s.fecha)
    AND s.estado <> 'cancelada'
    AND (p_desde IS NULL OR s.fecha >= p_desde)
    AND (p_hasta IS NULL OR s.fecha <= p_hasta);

  SELECT count(*), count(*) FILTER (WHERE tiene_asistencia)
    INTO v_total, v_protegidas FROM _anul;

  SELECT coalesce(jsonb_agg(jsonb_build_object(
      'sesion_id', id, 'fecha', fecha, 'estado_actual', estado,
      'motivo_calendario', motivo_calendario, 'detalle', detalle_calendario,
      'accion', CASE WHEN tiene_asistencia THEN 'PROTEGIDA_TIENE_ASISTENCIA'
                     ELSE 'SE_ANULA' END
    ) ORDER BY fecha), '[]'::jsonb)
  INTO v_candidatas FROM _anul;

  IF NOT p_dry_run THEN
    UPDATE public.sesiones_clase s
       SET estado = 'cancelada',
           motivo = coalesce(s.motivo || ' | ', '')
                    || 'Anulada: dia no lectivo (' || a.detalle_calendario || ')',
           updated_at = now()
      FROM _anul a
     WHERE s.id = a.id
       AND NOT a.tiene_asistencia;
    GET DIAGNOSTICS v_afectadas = ROW_COUNT;
  END IF;

  RETURN jsonb_build_object(
    'dry_run', p_dry_run,
    'candidatas', v_total,
    'protegidas_con_asistencia', v_protegidas,
    'anulables', v_total - v_protegidas,
    'anuladas', v_afectadas,
    'detalle', v_candidatas
  );
END;
$function$;

-- Función: fn_asignar_id_jerarquico
CREATE OR REPLACE FUNCTION public.fn_asignar_id_jerarquico()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_datos record;
BEGIN
  SELECT * INTO v_datos FROM public.fn_datos_jerarquicos_de_objetivo(NEW.objetivo_id);

  IF v_datos.clase_id IS NULL THEN
    RAISE EXCEPTION 'SOI-MAPA-03: objetivo_id % no existe en clase_mapa_objetivos', NEW.objetivo_id;
  END IF;

  NEW.clase_id := v_datos.clase_id;

  IF NEW.orden_indicador IS NULL THEN
    SELECT COALESCE(MAX(orden_indicador), 0) + 1
      INTO NEW.orden_indicador
    FROM public.clase_mapa_indicadores
    WHERE objetivo_id = NEW.objetivo_id;
  END IF;

  NEW.id_jerarquico := v_datos.level_number || '.' || v_datos.orden_objetivo || '.' || NEW.orden_indicador;

  RETURN NEW;
END;
$function$;

-- Función: fn_asistencia_maestro_completar
CREATE OR REPLACE FUNCTION public.fn_asistencia_maestro_completar()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sesion record;
BEGIN
  SELECT clase_id, fecha INTO v_sesion
  FROM public.sesiones_clase WHERE id = NEW.sesion_clase_id;

  IF FOUND THEN
    NEW.clase_id := coalesce(NEW.clase_id, v_sesion.clase_id);
    NEW.fecha    := coalesce(NEW.fecha, v_sesion.fecha);
  END IF;

  IF NEW.periodo_id IS NULL AND NEW.fecha IS NOT NULL THEN
    SELECT id INTO NEW.periodo_id
    FROM public.periodos
    WHERE NEW.fecha BETWEEN fecha_inicio AND fecha_fin
    ORDER BY activo DESC, fecha_inicio DESC
    LIMIT 1;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;

-- Función: fn_beca_anula_cuotas_abiertas
CREATE OR REPLACE FUNCTION public.fn_beca_anula_cuotas_abiertas()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.activa IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  UPDATE public.cuotas c
  SET
    descuento_centavos   = GREATEST(0, c.monto_base_centavos - c.monto_pagado_centavos),
    monto_final_centavos = c.monto_pagado_centavos,
    estado               = 'becada',
    updated_at           = now()
  WHERE c.alumno_id = NEW.alumno_id
    AND c.concepto  = 'mensualidad'
    AND c.estado    IN ('pendiente', 'vencida', 'en_mora')
    AND c.fecha_vencimiento >= NEW.fecha_inicio
    AND (NEW.fecha_fin IS NULL OR c.fecha_vencimiento <= NEW.fecha_fin);

  RETURN NEW;
END;
$function$;

-- Función: fn_bloquear_id_jerarquico
CREATE OR REPLACE FUNCTION public.fn_bloquear_id_jerarquico()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_tiene_evaluaciones boolean := false;
  v_datos record;
BEGIN
  IF (NEW.orden_indicador IS DISTINCT FROM OLD.orden_indicador
      OR NEW.objetivo_id IS DISTINCT FROM OLD.objetivo_id
      OR NEW.id_jerarquico IS DISTINCT FROM OLD.id_jerarquico) THEN

    EXECUTE 'SELECT EXISTS (SELECT 1 FROM public.evaluacion_indicador WHERE clase_indicador_id = $1)'
      INTO v_tiene_evaluaciones
      USING OLD.id;

    IF v_tiene_evaluaciones THEN
      RAISE EXCEPTION 'SOI-MAPA-01: ID jerárquico inmutable con evaluaciones' USING ERRCODE = 'P0001';
    END IF;

    IF NEW.objetivo_id IS DISTINCT FROM OLD.objetivo_id THEN
      SELECT * INTO v_datos FROM public.fn_datos_jerarquicos_de_objetivo(NEW.objetivo_id);

      IF v_datos.clase_id IS NULL THEN
        RAISE EXCEPTION 'SOI-MAPA-03: objetivo_id % no existe en clase_mapa_objetivos', NEW.objetivo_id;
      END IF;

      NEW.clase_id := v_datos.clase_id;
      NEW.id_jerarquico := v_datos.level_number || '.' || v_datos.orden_objetivo || '.' || NEW.orden_indicador;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Función: fn_bloquear_objetivo_jerarquico
CREATE OR REPLACE FUNCTION public.fn_bloquear_objetivo_jerarquico()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_tiene_evaluaciones boolean := false;
BEGIN
  IF (NEW.orden_objetivo IS DISTINCT FROM OLD.orden_objetivo
      OR NEW.level_id IS DISTINCT FROM OLD.level_id) THEN

    EXECUTE 'SELECT EXISTS (
      SELECT 1
      FROM public.clase_mapa_indicadores cmi
      JOIN public.evaluacion_indicador ei ON ei.clase_indicador_id = cmi.id
      WHERE cmi.objetivo_id = $1
    )' INTO v_tiene_evaluaciones USING OLD.id;

    IF v_tiene_evaluaciones THEN
      RAISE EXCEPTION 'SOI-MAPA-01: ID jerárquico inmutable con evaluaciones' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Función: fn_calcular_pulso_score
CREATE OR REPLACE FUNCTION public.fn_calcular_pulso_score(p_persistir boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  -- 1. Asistencia semanal (40%)
  v_total_asistencias_7d int := 0;
  v_presentes_7d int := 0;
  v_asistencia_pct numeric(5, 2) := 100.00;

  -- 2. Tareas completadas a tiempo (30%)
  v_total_tareas_30d int := 0;
  v_tareas_a_tiempo_30d int := 0;
  v_tareas_tiempo_pct numeric(5, 2) := 100.00;

  -- 3. Cobertura de registro docente (20%)
  v_total_sesiones_7d int := 0;
  v_sesiones_con_asistencia_7d int := 0;
  v_cobertura_pct numeric(5, 2) := 100.00;

  -- 4. Penalización por tareas vencidas hoy (10%)
  v_tareas_vencidas_activas int := 0;
  v_tareas_activas int := 0;
  v_penalizacion_pct numeric(5, 2) := 100.00;

  -- Resultado consolidado
  v_score_final numeric(5, 2);
  v_nivel text;
  v_resultado jsonb;
BEGIN
  -- Componente 1: Asistencia últimos 7 días
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE estado IN ('presente', 'tardanza', 'asistio'))
  INTO v_total_asistencias_7d, v_presentes_7d
  FROM public.asistencias
  WHERE created_at >= (now() - interval '7 days');

  IF v_total_asistencias_7d > 0 THEN
    v_asistencia_pct := ROUND((v_presentes_7d::numeric / v_total_asistencias_7d::numeric) * 100.0, 2);
  ELSE
    v_asistencia_pct := 100.00;
  END IF;

  -- Componente 2: Tareas completadas en últimos 30 días vs vencimiento
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE fecha_vencimiento IS NULL OR updated_at <= (fecha_vencimiento + interval '1 day'))
  INTO v_total_tareas_30d, v_tareas_a_tiempo_30d
  FROM public.tareas_institucionales
  WHERE estado = 'completada'
    AND updated_at >= (now() - interval '30 days');

  IF v_total_tareas_30d > 0 THEN
    v_tareas_tiempo_pct := ROUND((v_tareas_a_tiempo_30d::numeric / v_total_tareas_30d::numeric) * 100.0, 2);
  ELSE
    v_tareas_tiempo_pct := 100.00;
  END IF;

  -- Componente 3: Cobertura de registro de clases últimos 7 días
  SELECT
    COUNT(DISTINCT s.id),
    COUNT(DISTINCT a.sesion_clase_id)
  INTO v_total_sesiones_7d, v_sesiones_con_asistencia_7d
  FROM public.sesiones_clase s
  LEFT JOIN public.asistencias a ON a.sesion_clase_id = s.id
  WHERE s.created_at >= (now() - interval '7 days');

  IF v_total_sesiones_7d > 0 THEN
    v_cobertura_pct := ROUND((v_sesiones_con_asistencia_7d::numeric / v_total_sesiones_7d::numeric) * 100.0, 2);
  ELSE
    v_cobertura_pct := 100.00;
  END IF;

  -- Componente 4: Tareas vencidas activas
  SELECT
    COUNT(*) FILTER (WHERE estado IN ('pendiente', 'en_progreso', 'bloqueada')),
    COUNT(*) FILTER (WHERE estado IN ('pendiente', 'en_progreso', 'bloqueada') AND fecha_vencimiento < CURRENT_DATE)
  INTO v_tareas_activas, v_tareas_vencidas_activas
  FROM public.tareas_institucionales;

  IF v_tareas_activas > 0 THEN
    v_penalizacion_pct := ROUND(GREATEST(0.0, (1.0 - (v_tareas_vencidas_activas::numeric / v_tareas_activas::numeric))) * 100.0, 2);
  ELSE
    v_penalizacion_pct := 100.00;
  END IF;

  -- Cálculo de Score Ponderado
  v_score_final := ROUND(
    (v_asistencia_pct * 0.40) +
    (v_tareas_tiempo_pct * 0.30) +
    (v_cobertura_pct * 0.20) +
    (v_penalizacion_pct * 0.10),
    1
  );

  -- Nivel Operativo
  IF v_score_final >= 80.0 THEN
    v_nivel := 'optimo';
  ELSIF v_score_final >= 60.0 THEN
    v_nivel := 'atencion';
  ELSE
    v_nivel := 'critico';
  END IF;

  -- Construir resultado
  v_resultado := jsonb_build_object(
    'score', v_score_final,
    'nivel', v_nivel,
    'componentes', jsonb_build_object(
      'asistencia_pct', v_asistencia_pct,
      'tareas_tiempo_pct', v_tareas_tiempo_pct,
      'cobertura_registro_pct', v_cobertura_pct,
      'penalizacion_vencidas_pct', v_penalizacion_pct
    ),
    'conteos', jsonb_build_object(
      'asistencias_total_7d', v_total_asistencias_7d,
      'asistencias_presentes_7d', v_presentes_7d,
      'tareas_completadas_30d', v_total_tareas_30d,
      'tareas_a_tiempo_30d', v_tareas_a_tiempo_30d,
      'sesiones_7d', v_total_sesiones_7d,
      'sesiones_con_asistencia_7d', v_sesiones_con_asistencia_7d,
      'tareas_activas', v_tareas_activas,
      'tareas_vencidas_activas', v_tareas_vencidas_activas
    ),
    'calculado_at', now()
  );

  -- Si se solicitó persistencia histórica
  IF p_persistir THEN
    INSERT INTO public.pulso_score_history (
      score, nivel, asistencia_pct, tareas_tiempo_pct,
      cobertura_registro_pct, penalizacion_vencidas_pct,
      metricas_detalle, calculado_at
    ) VALUES (
      v_score_final, v_nivel, v_asistencia_pct, v_tareas_tiempo_pct,
      v_cobertura_pct, v_penalizacion_pct,
      v_resultado, now()
    );
  END IF;

  RETURN v_resultado;
END;
$function$;

-- Función: fn_calcular_score_representante
CREATE OR REPLACE FUNCTION public.fn_calcular_score_representante(p_representante_id uuid, p_mes integer, p_anio integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_familia_id            uuid;
  v_puntualidad           decimal(5,2) := 35;
  v_consistencia          decimal(5,2) := 20;
  v_voluntad_pago         decimal(5,2) := 20;
  v_comportamiento_mora   decimal(5,2) := 15;
  v_generosidad           decimal(5,2) := 0;
  v_score                 decimal(5,2);
  v_nivel                 char(1);
  v_total_cuotas_pagadas  int;
  v_pagos_a_tiempo        int;
  v_compromisos_total     int;
  v_compromisos_cumplidos int;
  v_mora_episodes         int;
  v_pagos_adelantados     int;
  v_meses_consecutivos    int;
  v_ciclo_hace_12         date;
BEGIN
  SELECT familia_id INTO v_familia_id
  FROM public.representantes
  WHERE id = p_representante_id;

  IF v_familia_id IS NULL THEN
    RAISE EXCEPTION 'Representante % not found or has no familia', p_representante_id;
  END IF;

  v_ciclo_hace_12 := make_date(p_anio, p_mes, 1) - INTERVAL '12 months';

  -- Dimension 1: Puntualidad (35 points max)
  SELECT COUNT(*) INTO v_total_cuotas_pagadas
  FROM public.cuotas
  WHERE familia_id     = v_familia_id
    AND estado         = 'pagada'
    AND fecha_generacion >= v_ciclo_hace_12;

  IF v_total_cuotas_pagadas > 0 THEN
    SELECT COUNT(*) INTO v_pagos_a_tiempo
    FROM public.cuotas
    WHERE familia_id       = v_familia_id
      AND estado           = 'pagada'
      AND fecha_generacion >= v_ciclo_hace_12
      AND updated_at::date <= fecha_vencimiento;

    v_puntualidad := ROUND(
      CAST(v_pagos_a_tiempo AS decimal) / v_total_cuotas_pagadas * 35, 2
    );
  END IF;

  -- Dimension 2: Consistencia (20 points max)
  SELECT COUNT(DISTINCT (ciclo_anio * 100 + ciclo_mes)) INTO v_meses_consecutivos
  FROM public.cuotas
  WHERE familia_id       = v_familia_id
    AND estado           NOT IN ('en_mora')
    AND fecha_generacion >= v_ciclo_hace_12;

  v_consistencia := LEAST(20, ROUND(CAST(v_meses_consecutivos AS decimal) / 12 * 20, 2));

  -- Dimension 3: Voluntad de pago (20 points max) — Decision D3: default 20 when no compromisos
  SELECT COUNT(*) INTO v_compromisos_total
  FROM public.compromisos_pago
  WHERE representante_id = p_representante_id
    AND created_at       >= v_ciclo_hace_12;

  IF v_compromisos_total > 0 THEN
    SELECT COUNT(*) INTO v_compromisos_cumplidos
    FROM public.compromisos_pago
    WHERE representante_id = p_representante_id
      AND cumplido         = true
      AND created_at       >= v_ciclo_hace_12;

    v_voluntad_pago := ROUND(
      CAST(v_compromisos_cumplidos AS decimal) / v_compromisos_total * 20, 2
    );
  END IF;

  -- Dimension 4: Comportamiento en mora (15 points max)
  SELECT COUNT(*) INTO v_mora_episodes
  FROM public.cuotas
  WHERE familia_id       = v_familia_id
    AND estado           = 'en_mora'
    AND fecha_generacion >= v_ciclo_hace_12;

  v_comportamiento_mora := GREATEST(0, CAST(15 - (v_mora_episodes * 3) AS decimal(5,2)));

  -- Dimension 5: Generosidad (10 points max)
  SELECT COUNT(*) INTO v_pagos_adelantados
  FROM public.pagos
  WHERE familia_id   = v_familia_id
    AND created_at   >= v_ciclo_hace_12;

  v_generosidad := LEAST(10, CAST(v_pagos_adelantados AS decimal) * 1);

  -- Composite score
  v_score := LEAST(100, v_puntualidad + v_consistencia + v_voluntad_pago + v_comportamiento_mora + v_generosidad);

  v_nivel := CASE
    WHEN v_score >= 85 THEN 'A'
    WHEN v_score >= 70 THEN 'B'
    WHEN v_score >= 50 THEN 'C'
    WHEN v_score >= 30 THEN 'D'
    ELSE 'E'
  END;

  -- Insert snapshot (ON CONFLICT DO NOTHING makes it idempotent per cycle)
  INSERT INTO public.score_compromiso (
    representante_id, familia_id, score, nivel,
    puntualidad_pct, consistencia_meses, voluntad_pago_pct,
    comportamiento_mora_pct, generosidad_pct,
    calculado_en, ciclo_mes, ciclo_anio
  )
  VALUES (
    p_representante_id, v_familia_id, v_score, v_nivel,
    v_puntualidad, v_meses_consecutivos, v_voluntad_pago,
    v_comportamiento_mora, v_generosidad,
    now(), p_mes, p_anio
  )
  ON CONFLICT DO NOTHING;
END;
$function$;

-- Función: fn_camp_touch_updated_at
CREATE OR REPLACE FUNCTION public.fn_camp_touch_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ begin new.updated_at = now(); return new; end; $function$;

-- Función: fn_cerrar_periodo_academico
CREATE OR REPLACE FUNCTION public.fn_cerrar_periodo_academico(p_periodo_id uuid, p_fecha_inicio date DEFAULT NULL::date, p_fecha_fin date DEFAULT NULL::date, p_cerrado_por uuid DEFAULT NULL::uuid, p_observaciones text DEFAULT NULL::text, p_forzar boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_periodo      record;
  v_fecha_inicio date;
  v_fecha_fin    date;
  v_validacion   jsonb;
  v_snapshot     jsonb;
  v_resumen      jsonb;
  v_result       jsonb;
BEGIN
  SELECT * INTO v_periodo FROM public.periodos WHERE id = p_periodo_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Periodo no encontrado';
  END IF;

  IF v_periodo.cerrado THEN
    RAISE EXCEPTION 'El periodo ya esta cerrado';
  END IF;

  v_fecha_inicio := coalesce(p_fecha_inicio, v_periodo.fecha_inicio);
  v_fecha_fin    := coalesce(p_fecha_fin,    v_periodo.fecha_fin);

  v_validacion := public.fn_validar_cierre_periodo(p_periodo_id);

  IF NOT (v_validacion->>'puede_cerrar')::boolean THEN
    IF NOT p_forzar THEN
      RAISE EXCEPTION 'No se puede cerrar: % de % sesiones sin registro completo (semaforo %). Corrija los registros o cierre con justificacion.',
        v_validacion->>'incompletas', v_validacion->>'total_sesiones', v_validacion->>'semaforo';
    END IF;

    IF p_observaciones IS NULL OR btrim(p_observaciones) = '' THEN
      RAISE EXCEPTION 'El cierre forzado requiere una justificacion escrita.';
    END IF;
  END IF;

  SELECT jsonb_build_object(
    'totalClases', count(distinct sc.clase_id),
    'totalSesiones', count(*),
    'totalAsistencias', count(a.id),
    'totalPresentes', count(a.id) filter (where a.estado = 'presente'),
    'totalAusentes', count(a.id) filter (where a.estado = 'ausente'),
    'totalJustificados', count(a.id) filter (where a.estado = 'justificado'),
    'tasaGlobalAsistencia',
      case when count(a.id) > 0 then
        round(((count(a.id) filter (where a.estado in ('presente','justificado')))::numeric
               / count(a.id)::numeric) * 100, 2)
      else null end
  )
  INTO v_resumen
  FROM public.sesiones_clase sc
  LEFT JOIN public.asistencias a ON a.sesion_clase_id = sc.id
  WHERE sc.fecha BETWEEN v_fecha_inicio AND v_fecha_fin
    AND sc.estado <> 'cancelada';

  SELECT jsonb_build_object(
    'resumen', v_resumen,
    'validacion', v_validacion,
    'cierre_forzado', NOT (v_validacion->>'puede_cerrar')::boolean,
    'clases', coalesce(jsonb_agg(distinct jsonb_build_object(
      'clase_id', sc.clase_id, 'sesion_id', sc.id,
      'fecha', sc.fecha, 'estado', sc.estado)), '[]'::jsonb)
  )
  INTO v_snapshot
  FROM public.sesiones_clase sc
  WHERE sc.fecha BETWEEN v_fecha_inicio AND v_fecha_fin
    AND sc.estado <> 'cancelada';

  UPDATE public.periodos
     SET cerrado = true, cerrado_at = now(), cerrado_por = p_cerrado_por,
         observaciones_cierre = p_observaciones, updated_at = now()
   WHERE id = p_periodo_id;

  INSERT INTO public.periodos_cierre_auditoria (
    periodo_id, fecha_inicio, fecha_fin, cerrado_por, observaciones, resumen, snapshot
  ) VALUES (
    p_periodo_id, v_fecha_inicio, v_fecha_fin, p_cerrado_por, p_observaciones,
    v_resumen, v_snapshot
  )
  RETURNING jsonb_build_object(
    'ok', true, 'periodo_id', periodo_id, 'snapshot_id', id,
    'fecha_inicio', fecha_inicio, 'fecha_fin', fecha_fin,
    'forzado', NOT (v_validacion->>'puede_cerrar')::boolean,
    'validacion', v_validacion
  ) INTO v_result;

  RETURN v_result;
END;
$function$;

-- Función: fn_check_and_notify_pending_asistencias
CREATE OR REPLACE FUNCTION public.fn_check_and_notify_pending_asistencias()
 RETURNS TABLE(notification_count integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_maestro_id   UUID;
  v_profile_id   UUID;
  v_ultima_hora_fin TIME;
  v_clases_pendientes RECORD;
  v_deep_link TEXT;
  v_notification_count INT := 0;
  v_current_time TIME;
  v_day_of_week INT;
  v_hoy DATE;
BEGIN
  v_hoy := (NOW() AT TIME ZONE 'America/Santo_Domingo')::DATE;

  IF NOT public.fn_es_dia_lectivo(v_hoy) THEN
    RAISE NOTICE 'Dia no lectivo (%). Abortando notificaciones.', v_hoy;
    RETURN QUERY SELECT 0::INT;
    RETURN;
  END IF;

  v_current_time := (NOW() AT TIME ZONE 'America/Santo_Domingo')::TIME;
  v_day_of_week  := EXTRACT(ISODOW FROM NOW() AT TIME ZONE 'America/Santo_Domingo');

  IF v_day_of_week = 7 THEN
    RETURN QUERY SELECT 0::INT;
    RETURN;
  END IF;

  FOR v_maestro_id, v_profile_id IN
    SELECT DISTINCT m.id, m.user_id
    FROM maestros m
    INNER JOIN horarios h ON h.maestro_id = m.id
    WHERE h.dia_semana = v_day_of_week
      AND h.activo = TRUE
      AND m.activo = TRUE
      AND m.user_id IS NOT NULL
  LOOP
    SELECT MAX(h.hora_fin)
    INTO v_ultima_hora_fin
    FROM horarios h
    WHERE h.maestro_id = v_maestro_id
      AND h.dia_semana = v_day_of_week
      AND h.hora_fin IS NOT NULL
      AND h.activo = TRUE;

    IF v_ultima_hora_fin IS NULL THEN
      CONTINUE;
    END IF;

    IF v_current_time >= (v_ultima_hora_fin + INTERVAL '5 minutes') THEN

      FOR v_clases_pendientes IN
        SELECT c.id AS clase_id, c.nombre AS clase_nombre
        FROM horarios h
        INNER JOIN clases c ON c.id = h.clase_id
        WHERE h.maestro_id = v_maestro_id
          AND h.dia_semana = v_day_of_week
          AND h.activo = TRUE
          AND NOT EXISTS (
            SELECT 1 FROM asistencias a
            WHERE a.clase_id = c.id AND a.fecha = CURRENT_DATE
          )
          AND NOT EXISTS (
            SELECT 1 FROM notificaciones n
            WHERE n.profile_id = v_profile_id
              AND n.clase_id = c.id
              AND n.created_at > NOW() - INTERVAL '24 hours'
          )
      LOOP
        v_deep_link := '/asistencia/' || v_clases_pendientes.clase_id::TEXT || '/' || CURRENT_DATE::TEXT;

        INSERT INTO notificaciones (
          profile_id, tipo, titulo, mensaje, deep_link, clase_id, estado, created_at
        ) VALUES (
          v_profile_id, 'sistema', 'Asistencia Pendiente',
          'Debes llenar la asistencia de ' || v_clases_pendientes.clase_nombre,
          v_deep_link, v_clases_pendientes.clase_id, 'pendiente', NOW()
        );

        v_notification_count := v_notification_count + 1;
      END LOOP;

     END IF;
  END LOOP;

  RETURN QUERY SELECT v_notification_count;
END;
$function$;

-- Función: fn_cobertura_curricular
CREATE OR REPLACE FUNCTION public.fn_cobertura_curricular(p_periodo_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH periodo AS (SELECT * FROM public.periodos WHERE id = p_periodo_id),
  ses AS (
    SELECT s.id, s.clase_id, s.node_codigo, s.contenido, c.nombre AS clase
    FROM public.sesiones_clase s
    CROSS JOIN periodo p
    LEFT JOIN public.clases c ON c.id = s.clase_id
    WHERE s.fecha BETWEEN p.fecha_inicio AND p.fecha_fin
      AND s.estado <> 'cancelada'
      AND public.fn_es_dia_lectivo(s.fecha)
  ),
  cat(codigo, nombre) AS (VALUES
    ('ESC','Escalas'),('ARP','Arpegios y patrones'),('MI','Mano izquierda'),
    ('ARC','Arco'),('SON','Sonido'),('AFI','Afinación'),
    ('EST','Estudios técnicos'),('REP','Repertorio'))
  SELECT jsonb_build_object(
    'total_sesiones',     (SELECT count(*) FROM ses),
    'con_categoria',      (SELECT count(*) FROM ses WHERE node_codigo IS NOT NULL),
    'sin_categoria',      (SELECT count(*) FROM ses WHERE node_codigo IS NULL),
    'con_texto_sin_categoria', (SELECT count(*) FROM ses
                                 WHERE node_codigo IS NULL AND coalesce(contenido,'') <> ''),
    'pct_vinculacion',
      CASE WHEN (SELECT count(*) FROM ses) = 0 THEN NULL
           ELSE round(((SELECT count(*) FROM ses WHERE node_codigo IS NOT NULL)::numeric
                       / (SELECT count(*) FROM ses)::numeric) * 100, 1) END,
    'por_categoria', (
      SELECT coalesce(jsonb_agg(jsonb_build_object(
          'codigo', c.codigo, 'nombre', c.nombre,
          'sesiones', (SELECT count(*) FROM ses WHERE node_codigo = c.codigo),
          'clases',   (SELECT count(DISTINCT clase_id) FROM ses WHERE node_codigo = c.codigo)
        ) ORDER BY c.codigo), '[]'::jsonb)
      FROM cat c),
    'categorias_sin_trabajar', (
      SELECT coalesce(jsonb_agg(c.codigo ORDER BY c.codigo), '[]'::jsonb)
      FROM cat c WHERE NOT EXISTS (SELECT 1 FROM ses WHERE node_codigo = c.codigo)),
    'por_clase', (
      SELECT coalesce(jsonb_agg(jsonb_build_object(
          'clase', clase, 'sesiones', n_ses, 'con_categoria', n_cat,
          'categorias', cats) ORDER BY clase), '[]'::jsonb)
      FROM (
        SELECT clase, count(*) n_ses, count(node_codigo) n_cat,
               coalesce(jsonb_agg(DISTINCT node_codigo) FILTER (WHERE node_codigo IS NOT NULL), '[]'::jsonb) cats
        FROM ses WHERE clase IS NOT NULL GROUP BY clase
      ) x)
  );
$function$;

-- Función: fn_com_seg_touch_updated_at
CREATE OR REPLACE FUNCTION public.fn_com_seg_touch_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end; $function$;

-- Función: fn_correlacion_asistencia_rendimiento
CREATE OR REPLACE FUNCTION public.fn_correlacion_asistencia_rendimiento()
 RETURNS numeric
 LANGUAGE sql
 STABLE
AS $function$
  SELECT ROUND(CORR(tasa_asistencia, promedio_calificacion)::numeric, 3)
  FROM vw_resumen_alumno
  WHERE tasa_asistencia IS NOT NULL
    AND promedio_calificacion IS NOT NULL
    AND activo = true;
$function$;

-- Función: fn_crear_evento_calendario
CREATE OR REPLACE FUNCTION public.fn_crear_evento_calendario(p_departamento_id uuid, p_titulo text, p_descripcion text DEFAULT NULL::text, p_tipo text DEFAULT 'otro'::text, p_fecha_inicio date DEFAULT NULL::date, p_fecha_fin date DEFAULT NULL::date, p_fecha_alerta integer DEFAULT 7, p_prioridad text DEFAULT 'media'::text, p_responsable_id uuid DEFAULT NULL::uuid, p_protocolo_json jsonb DEFAULT NULL::jsonb, p_notas text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_evento_id uuid;
  v_user_role text;
  v_dept_access boolean;
BEGIN
  -- Verificar permisos
  v_user_role := get_user_role();
  v_dept_access := EXISTS(
    SELECT 1 FROM public.usuario_departamentos
    WHERE user_id = auth.uid() AND departamento_id = p_departamento_id
  );

  IF v_user_role != 'admin' AND NOT v_dept_access THEN
    RETURN json_build_object('error', 'No tiene acceso a este departamento');
  END IF;

  -- Validar fechas
  IF p_fecha_inicio IS NULL THEN
    p_fecha_inicio := CURRENT_DATE;
  END IF;
  IF p_fecha_fin IS NULL THEN
    p_fecha_fin := p_fecha_inicio;
  END IF;
  IF p_fecha_fin < p_fecha_inicio THEN
    RETURN json_build_object('error', 'fecha_fin debe ser >= fecha_inicio');
  END IF;

  -- Insertar evento
  INSERT INTO public.calendario(
    departamento_id, titulo, descripcion, tipo, fecha_inicio, fecha_fin,
    fecha_alerta, prioridad, estado, responsable_id, protocolo_json, notas, created_by
  )
  VALUES(
    p_departamento_id, p_titulo, p_descripcion, p_tipo, p_fecha_inicio, p_fecha_fin,
    COALESCE(p_fecha_alerta, 7), COALESCE(p_prioridad, 'media'), 'planificado',
    p_responsable_id, COALESCE(p_protocolo_json, '{}'), p_notas, auth.uid()
  )
  RETURNING id INTO v_evento_id;

  RETURN json_build_object(
    'success', true,
    'evento_id', v_evento_id,
    'mensaje', 'Evento creado. HERMES generará tareas automáticamente.'
  );
END
$function$;

-- Función: fn_crear_familia_para_alumno
CREATE OR REPLACE FUNCTION public.fn_crear_familia_para_alumno(p_nombre text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_id uuid;
  v_nombre text;
BEGIN
  -- Misma autorizacion que alumnos_insert_authenticated.
  IF public.maestro_actual() IS NULL AND NOT public.es_admin() THEN
    RAISE EXCEPTION 'No autorizado para registrar familias';
  END IF;

  v_nombre := nullif(btrim(coalesce(p_nombre, '')), '');
  IF v_nombre IS NULL THEN
    RAISE EXCEPTION 'El nombre de la familia es obligatorio';
  END IF;

  INSERT INTO public.familias (nombre_familia)
  VALUES (v_nombre)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$function$;

-- Función: fn_dar_de_baja_alumno
CREATE OR REPLACE FUNCTION public.fn_dar_de_baja_alumno(p_alumno_id uuid, p_motivo text, p_observaciones text DEFAULT NULL::text, p_usuario_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_alumno RECORD;
  v_deuda_centavos bigint := 0;
  v_cuotas_pendientes int := 0;
  v_estado_final text;
  v_bloqueo boolean := false;
  v_hoy date := CURRENT_DATE;
BEGIN
  SELECT id, familia_id, nombre_completo, activo, estado_academico
    INTO v_alumno FROM public.alumnos WHERE id = p_alumno_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'El alumno con ID % no existe.', p_alumno_id;
  END IF;

  IF v_alumno.activo = false AND v_alumno.estado_academico IN ('retirado', 'retirado_con_deuda') THEN
    RAISE EXCEPTION 'El alumno % ya se encuentra dado de baja (estado: %).', v_alumno.nombre_completo, v_alumno.estado_academico;
  END IF;

  v_deuda_centavos := public.fn_deuda_viva(p_alumno_id, NULL);

  SELECT COUNT(*) INTO v_cuotas_pendientes
    FROM public.cuotas c
   WHERE c.alumno_id = p_alumno_id
     AND c.estado::text NOT IN ('pagada', 'exonerada', 'becada', 'pre_pagada')
     AND (c.monto_final_centavos - COALESCE(c.monto_pagado_centavos, 0)) > 0;

  IF v_deuda_centavos > 0 THEN
    v_estado_final := 'retirado_con_deuda';
    v_bloqueo := true;
    UPDATE public.representantes
       SET bloqueo_reinscripcion = true,
           motivo_bloqueo = 'Deuda pendiente por retiro de ' || v_alumno.nombre_completo
             || ' (RD$ ' || to_char(v_deuda_centavos / 100.0, 'FM999999990.00') || ')'
     WHERE familia_id = v_alumno.familia_id;
  ELSE
    v_estado_final := 'retirado';
    v_bloqueo := false;
  END IF;

  UPDATE public.alumnos
     SET activo = false, estado_academico = v_estado_final, motivo_baja = p_motivo,
         fecha_baja = v_hoy, observaciones_baja = p_observaciones, baja_procesada_por = p_usuario_id,
         bloqueo_reinscripcion = v_bloqueo, deuda_pendiente_baja_centavos = v_deuda_centavos,
         updated_at = timezone('utc'::text, now())
   WHERE id = p_alumno_id;

  RETURN jsonb_build_object(
    'success', true, 'alumno_id', p_alumno_id, 'nombre_completo', v_alumno.nombre_completo,
    'estado_academico', v_estado_final, 'bloqueo_reinscripcion', v_bloqueo,
    'deuda_centavos', v_deuda_centavos, 'deuda_dop', ROUND(v_deuda_centavos / 100.0, 2),
    'cuotas_pendientes', v_cuotas_pendientes, 'fecha_baja', v_hoy);
END;
$function$;

-- Función: fn_datos_jerarquicos_de_objetivo
CREATE OR REPLACE FUNCTION public.fn_datos_jerarquicos_de_objetivo(p_objetivo_id uuid)
 RETURNS TABLE(clase_id uuid, level_number integer, orden_objetivo integer)
 LANGUAGE sql
 STABLE
AS $function$
  SELECT cmo.clase_id, cn.orden, cmo.orden_objetivo
  FROM public.clase_mapa_objetivos cmo
  JOIN public.catalogo_niveles cn ON cn.id = cmo.level_id
  WHERE cmo.id = p_objetivo_id;
$function$;

-- Función: fn_desplazar_cronograma_evento
CREATE OR REPLACE FUNCTION public.fn_desplazar_cronograma_evento(p_event_id uuid, p_delta_dias integer)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_rows_updated INT;
BEGIN
  UPDATE public.calendario_institucional
  SET
    fecha_inicio = fecha_inicio + (p_delta_dias || ' days')::INTERVAL,
    fecha_fin    = fecha_fin    + (p_delta_dias || ' days')::INTERVAL,
    updated_at   = now()
  WHERE id = p_event_id;

  UPDATE public.tareas_institucionales
  SET
    fecha_vencimiento = fecha_vencimiento + (p_delta_dias || ' days')::INTERVAL,
    updated_at = now()
  WHERE event_id = p_event_id
    AND estado NOT IN ('completada', 'cancelada');

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
  RETURN v_rows_updated;
END;
$function$;

-- Función: fn_deuda_viva
CREATE OR REPLACE FUNCTION public.fn_deuda_viva(p_alumno_id uuid DEFAULT NULL::uuid, p_familia_id uuid DEFAULT NULL::uuid)
 RETURNS bigint
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(SUM(c.monto_final_centavos - COALESCE(c.monto_pagado_centavos, 0)), 0)::bigint
  FROM public.cuotas c
  WHERE (c.monto_final_centavos - COALESCE(c.monto_pagado_centavos, 0)) > 0
    AND c.estado::text NOT IN ('pagada', 'exonerada', 'becada', 'pre_pagada')
    AND (
      (p_alumno_id IS NOT NULL AND c.alumno_id = p_alumno_id)
      OR (p_familia_id IS NOT NULL AND c.familia_id = p_familia_id)
    );
$function$;

-- Función: fn_dispatch_enrollment_reminders
CREATE OR REPLACE FUNCTION public.fn_dispatch_enrollment_reminders()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    r RECORD;
    dispatched_count integer := 0;
    clean_phone text;
    user_jid text;
    msg text;
BEGIN
    FOR r IN (
        SELECT
            apt.id as appointment_id,
            app.id as applicant_id,
            app.full_name,
            app.phone_number,
            to_char(apt.scheduled_datetime AT TIME ZONE 'America/Santo_Domingo', 'DD/MM a las HH12:MI AM') as fecha_fmt
        FROM public.appointments apt
        JOIN public.applicants app ON apt.applicant_id = app.id
        WHERE apt.status = 'CONFIRMED'
          AND apt.scheduled_datetime >= (now() + interval '23 hours 45 minutes')
          AND apt.scheduled_datetime <= (now() + interval '24 hours 45 minutes')
          AND NOT EXISTS (
              SELECT 1 FROM public.applicant_events
              WHERE applicant_id = app.id AND event_name = 'REMINDER_24H_SENT'
          )
    ) LOOP
        clean_phone := regexp_replace(r.phone_number, '\D', '', 'g');
        IF length(clean_phone) >= 10 THEN
            user_jid := clean_phone || '@s.whatsapp.net';
            msg := '👋 ¡Hola ' || r.full_name || '! Te recordamos que mañana tienes tu cita de inscripción en El Sistema Punta Cana:' || chr(10) ||
                   '📅 *' || r.fecha_fmt || '*' || chr(10) || chr(10) ||
                   '📍 Lugar: Sede El Sistema Punta Cana' || chr(10) ||
                   '📄 *Documentos a presentar:*' || chr(10) ||
                   '1. Copia del acta de nacimiento del niño/a.' || chr(10) ||
                   '2. Copia de cédula del representante.' || chr(10) ||
                   '3. 2 fotos 2x2.' || chr(10) || chr(10) ||
                   '¡Te esperamos puntual!';

            INSERT INTO public.hermes_whatsapp_queue (jid, mensaje, estado)
            VALUES (user_jid, msg, 'pendiente');

            INSERT INTO public.applicant_events (applicant_id, event_name, payload)
            VALUES (r.applicant_id, 'REMINDER_24H_SENT', jsonb_build_object('appointment_id', r.appointment_id));

            dispatched_count := dispatched_count + 1;
        END IF;
    END LOOP;

    RETURN dispatched_count;
END;
$function$;

-- Función: fn_eliminar_familia_huerfana
CREATE OR REPLACE FUNCTION public.fn_eliminar_familia_huerfana(p_familia_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF public.maestro_actual() IS NULL AND NOT public.es_admin() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  DELETE FROM public.familias f
  WHERE f.id = p_familia_id
    AND NOT EXISTS (SELECT 1 FROM public.alumnos a WHERE a.familia_id = f.id);

  RETURN FOUND;
END;
$function$;

-- Función: fn_email_departamento
CREATE OR REPLACE FUNCTION public.fn_email_departamento(p_codigo text)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select email from public.departamentos
  where upper(codigo) = upper(p_codigo) and activo and email is not null
  limit 1;
$function$;

-- Función: fn_emit_mora_event
CREATE OR REPLACE FUNCTION public.fn_emit_mora_event()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  vdias   INT;
  vestado TEXT;
  vnombre TEXT;
BEGIN
  -- Solo evaluar mensualidades
  IF NEW.concepto != 'mensualidad' THEN
    RETURN NEW;
  END IF;

  -- Calcular dias desde el periodo mensual mas reciente
  SELECT (CURRENT_DATE - MAX(periodo_mes))::INT
    INTO vdias
    FROM public.pagos_alumnos
   WHERE alumno_id = NEW.alumno_id
     AND concepto  = 'mensualidad';

  -- Si no hay historial o es menor a 30 dias, no hacer nada
  IF vdias IS NULL OR vdias < 30 THEN
    RETURN NEW;
  END IF;

  -- Determinar color del estado
  IF vdias >= 60 THEN
    vestado := 'rojo';
  ELSE
    vestado := 'amarillo';
  END IF;

  -- Buscar nombre del alumno
  SELECT nombre_completo INTO vnombre
    FROM public.alumnos
   WHERE id = NEW.alumno_id;

  -- Insertar en la tabla de Hermes
  INSERT INTO public.hermes_inbox (canal, categoria, summary, raw_ref)
  VALUES (
    'db_trigger',
    'mora_pago',
    format(
      'Alumno %s en estado financiero %s (%s dias desde ultimo pago de mensualidad)',
      COALESCE(vnombre, NEW.alumno_id::TEXT),
      vestado,
      vdias
    ),
    NEW.alumno_id
  );

  RETURN NEW;
END;
$function$;

-- Función: fn_encolar_campania
CREATE OR REPLACE FUNCTION public.fn_encolar_campania(p_campania_id uuid, p_limite integer DEFAULT NULL::integer)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_cap int; v_enviados int; v_pendientes_cola int; v_restante int; v_encolados int;
BEGIN
  IF NOT es_admin() THEN RAISE EXCEPTION 'no autorizado'; END IF;

  v_cap := public.fn_whatsapp_cap_hoy();
  v_enviados := public.fn_whatsapp_enviados_hoy();
  SELECT count(*) INTO v_pendientes_cola FROM public.hermes_whatsapp_queue WHERE estado = 'pendiente';
  v_restante := GREATEST(v_cap - v_enviados - v_pendientes_cola, 0);
  IF p_limite IS NOT NULL THEN v_restante := LEAST(v_restante, p_limite); END IF;

  WITH a_encolar AS (
    SELECT ce.id, ce.jid, ce.mensaje
    FROM public.campania_envios ce
    WHERE ce.campania_id = p_campania_id
      AND ce.estado = 'pendiente_envio'
      AND NOT EXISTS (SELECT 1 FROM public.whatsapp_optout o WHERE o.jid = ce.jid)
    ORDER BY ce.created_at
    LIMIT v_restante
  ), ins AS (
    INSERT INTO public.hermes_whatsapp_queue (jid, mensaje, estado, campania_envio_id)
    SELECT jid, mensaje, 'pendiente', id FROM a_encolar
    RETURNING campania_envio_id
  )
  UPDATE public.campania_envios SET estado = 'encolado', updated_at = now()
    WHERE id IN (SELECT campania_envio_id FROM ins);
  GET DIAGNOSTICS v_encolados = ROW_COUNT;

  RETURN json_build_object('encolados', v_encolados, 'cap_hoy', v_cap,
                           'enviados_hoy', v_enviados, 'restante_tras_encolar', GREATEST(v_restante - v_encolados, 0));
END $function$;

-- Función: fn_enrollment_funnel_set_updated_at
CREATE OR REPLACE FUNCTION public.fn_enrollment_funnel_set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;

-- Función: fn_es_dia_lectivo
CREATE OR REPLACE FUNCTION public.fn_es_dia_lectivo(p_fecha date DEFAULT CURRENT_DATE)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.periodos
    WHERE p_fecha BETWEEN fecha_inicio AND fecha_fin
      AND activo = true
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.periodo_excepciones e
    WHERE p_fecha BETWEEN e.fecha_inicio AND e.fecha_fin
      AND (e.periodo_id IS NULL OR e.periodo_id = public.fn_periodo_vigente(p_fecha))
  );
$function$;

-- Función: fn_escalar_mora
CREATE OR REPLACE FUNCTION public.fn_escalar_mora()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_cuota        RECORD;
  v_dias_mora    int;
  v_notif_exists boolean;
BEGIN
  FOR v_cuota IN
    SELECT c.id, c.familia_id, c.alumno_id,
           c.fecha_vencimiento, c.estado,
           c.concepto, c.monto_final
    FROM public.cuotas c
    WHERE c.estado IN ('vencida', 'en_mora')
      AND c.fecha_vencimiento < CURRENT_DATE
  LOOP
    v_dias_mora := (CURRENT_DATE - v_cuota.fecha_vencimiento)::int;

    -- Day 7: mora_recordatorio + escalate vencida → en_mora
    IF v_dias_mora >= 7 THEN
      SELECT EXISTS (
        SELECT 1 FROM public.notificaciones_caja
        WHERE familia_id              = v_cuota.familia_id
          AND tipo                    = 'mora_recordatorio'
          AND datos_extra->>'cuota_id' = v_cuota.id::text
      ) INTO v_notif_exists;

      IF NOT v_notif_exists THEN
        INSERT INTO public.notificaciones_caja (
          familia_id, alumno_id, tipo, canal, prioridad, titulo, cuerpo, datos_extra
        ) VALUES (
          v_cuota.familia_id, v_cuota.alumno_id,
          'mora_recordatorio', 'ambos', 'media',
          'Recordatorio de pago pendiente',
          'Tiene una cuota de ' || v_cuota.concepto || ' vencida hace ' ||
            v_dias_mora || ' días.',
          jsonb_build_object('cuota_id', v_cuota.id, 'dias_mora', v_dias_mora)
        );

        IF v_cuota.estado = 'vencida' THEN
          UPDATE public.cuotas
          SET estado = 'en_mora', updated_at = now()
          WHERE id = v_cuota.id;
        END IF;
      END IF;
    END IF;

    -- Day 15: mora_compromiso
    IF v_dias_mora >= 15 THEN
      SELECT EXISTS (
        SELECT 1 FROM public.notificaciones_caja
        WHERE familia_id               = v_cuota.familia_id
          AND tipo                     = 'mora_compromiso'
          AND datos_extra->>'cuota_id' = v_cuota.id::text
      ) INTO v_notif_exists;

      IF NOT v_notif_exists THEN
        INSERT INTO public.notificaciones_caja (
          familia_id, alumno_id, tipo, canal, prioridad, titulo, cuerpo, datos_extra
        ) VALUES (
          v_cuota.familia_id, v_cuota.alumno_id,
          'mora_compromiso', 'ambos', 'alta',
          'Solicitud de compromiso de pago',
          'Han pasado ' || v_dias_mora || ' días de su cuota vencida (' ||
            v_cuota.concepto || '). Por favor establezca una fecha comprometida.',
          jsonb_build_object('cuota_id', v_cuota.id, 'dias_mora', v_dias_mora)
        );
      END IF;
    END IF;

    -- Day 30: mora_escalada first
    IF v_dias_mora >= 30 THEN
      SELECT EXISTS (
        SELECT 1 FROM public.notificaciones_caja
        WHERE familia_id               = v_cuota.familia_id
          AND tipo                     = 'mora_escalada'
          AND datos_extra->>'cuota_id' = v_cuota.id::text
          AND datos_extra->>'escalacion_dia' = '30'
      ) INTO v_notif_exists;

      IF NOT v_notif_exists THEN
        INSERT INTO public.notificaciones_caja (
          familia_id, alumno_id, tipo, canal, prioridad, titulo, cuerpo, datos_extra
        ) VALUES (
          v_cuota.familia_id, v_cuota.alumno_id,
          'mora_escalada', 'ambos', 'alta',
          'Mora escalada — 30 días',
          'Su cuota de ' || v_cuota.concepto ||
            ' lleva 30 días sin pagar. Se notificó a administración.',
          jsonb_build_object('cuota_id', v_cuota.id, 'dias_mora', v_dias_mora, 'escalacion_dia', 30)
        );
      END IF;
    END IF;

    -- Day 45: mora_escalada, portal only, critica
    IF v_dias_mora >= 45 THEN
      SELECT EXISTS (
        SELECT 1 FROM public.notificaciones_caja
        WHERE familia_id               = v_cuota.familia_id
          AND tipo                     = 'mora_escalada'
          AND datos_extra->>'cuota_id' = v_cuota.id::text
          AND datos_extra->>'escalacion_dia' = '45'
      ) INTO v_notif_exists;

      IF NOT v_notif_exists THEN
        INSERT INTO public.notificaciones_caja (
          familia_id, alumno_id, tipo, canal, prioridad, titulo, cuerpo, datos_extra
        ) VALUES (
          v_cuota.familia_id, v_cuota.alumno_id,
          'mora_escalada', 'portal', 'critica',
          'Mora crítica — 45 días',
          'Alerta crítica: ' || v_dias_mora ||
            ' días de mora en cuota ' || v_cuota.concepto || '. Atención inmediata requerida.',
          jsonb_build_object('cuota_id', v_cuota.id, 'dias_mora', v_dias_mora, 'escalacion_dia', 45)
        );
      END IF;
    END IF;

    -- Day 60: mora_escalada + create tarea revision_instrumento
    IF v_dias_mora >= 60 THEN
      SELECT EXISTS (
        SELECT 1 FROM public.notificaciones_caja
        WHERE familia_id               = v_cuota.familia_id
          AND tipo                     = 'mora_escalada'
          AND datos_extra->>'cuota_id' = v_cuota.id::text
          AND datos_extra->>'escalacion_dia' = '60'
      ) INTO v_notif_exists;

      IF NOT v_notif_exists THEN
        INSERT INTO public.notificaciones_caja (
          familia_id, alumno_id, tipo, canal, prioridad, titulo, cuerpo, datos_extra
        ) VALUES (
          v_cuota.familia_id, v_cuota.alumno_id,
          'mora_escalada', 'ambos', 'critica',
          'Mora crítica — 60 días — Revisión de instrumento',
          'La cuota ' || v_cuota.concepto ||
            ' lleva 60 días impaga. Tarea de revisión de instrumento generada.',
          jsonb_build_object('cuota_id', v_cuota.id, 'dias_mora', v_dias_mora, 'escalacion_dia', 60)
        );

        INSERT INTO public.tareas_caja (
          titulo, tipo, familia_id, alumno_id, referencia_id,
          estado, prioridad, descripcion
        ) VALUES (
          'Revisión de instrumento — mora 60 días',
          'revision_instrumento',
          v_cuota.familia_id, v_cuota.alumno_id, v_cuota.id,
          'pendiente', 'critica',
          'Cuota ' || v_cuota.concepto || ' lleva ' || v_dias_mora ||
            ' días impaga. Evaluar retención de instrumento en comodato.'
        );
      END IF;
    END IF;
  END LOOP;
END;
$function$;

-- Función: fn_estado_asistencia_maestro
CREATE OR REPLACE FUNCTION public.fn_estado_asistencia_maestro(p_maestro_id uuid, p_desde date, p_hasta date)
 RETURNS TABLE(fecha date, clase_id uuid, clase_nombre text, maestro_id uuid, hora_inicio time without time zone, hora_fin time without time zone, sesion_id uuid, estado text, dias_atraso integer, asistencia_completa boolean, cubierta_emergente boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_actor_maestro_id uuid;
  v_es_admin boolean := COALESCE(public.is_admin(), false) OR auth.role() = 'service_role';
  v_periodo record;
  v_desde date;
  v_hasta date;
  v_now_local timestamp := now() AT TIME ZONE 'America/Santo_Domingo';
  v_hoy date := v_now_local::date;
  v_ahora time := v_now_local::time;
BEGIN
  IF p_maestro_id IS NULL OR p_desde IS NULL OR p_hasta IS NULL OR p_desde > p_hasta THEN
    RAISE EXCEPTION 'Maestro y rango de fechas válidos son requeridos';
  END IF;

  IF p_hasta - p_desde > 93 THEN
    RAISE EXCEPTION 'El rango máximo de consulta es 93 días';
  END IF;

  SELECT m.id INTO v_actor_maestro_id
  FROM public.maestros m
  WHERE m.user_id = auth.uid()
  LIMIT 1;

  IF NOT v_es_admin AND v_actor_maestro_id IS DISTINCT FROM p_maestro_id THEN
    RAISE EXCEPTION 'No tiene permiso para consultar este maestro';
  END IF;

  SELECT p.fecha_inicio, p.fecha_fin INTO v_periodo
  FROM public.periodos p
  WHERE p.activo = true AND COALESCE(p.cerrado, false) = false
  ORDER BY p.fecha_inicio DESC
  LIMIT 1;

  v_desde := p_desde;
  v_hasta := p_hasta;
  IF FOUND THEN
    v_desde := GREATEST(v_desde, v_periodo.fecha_inicio);
    v_hasta := LEAST(v_hasta, v_periodo.fecha_fin);
  END IF;
  IF v_desde > v_hasta THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH fechas AS (
    SELECT d::date AS fecha
    FROM generate_series(v_desde, v_hasta, interval '1 day') AS d
    WHERE public.fn_es_dia_lectivo(d::date)
  ), programadas AS (
    SELECT
      f.fecha,
      c.id AS clase_id,
      c.nombre AS clase_nombre,
      p_maestro_id AS maestro_id,
      h.hora_inicio,
      h.hora_fin
    FROM fechas f
    JOIN public.clase_horarios h
      ON lower(trim(h.dia)) = CASE extract(dow FROM f.fecha)
        WHEN 0 THEN 'domingo' WHEN 1 THEN 'lunes' WHEN 2 THEN 'martes'
        WHEN 3 THEN 'miércoles' WHEN 4 THEN 'jueves' WHEN 5 THEN 'viernes'
        WHEN 6 THEN 'sábado'
      END
    JOIN public.clases c ON c.id = h.clase_id
    WHERE COALESCE(c.activo, true)
      AND (
        c.maestro_principal_id = p_maestro_id
        OR c.maestro_suplente_id = p_maestro_id
        OR c.maestro_id = p_maestro_id
        OR h.maestro_id = p_maestro_id
      )
  ), evaluadas AS (
    SELECT
      p.*,
      s.id AS sesion_id,
      s.estado AS sesion_estado,
      s.borrador,
      s.emergente_id,
      s.asistencia AS asistencia_json,
      COALESCE(a.total, 0) AS total_marcas
    FROM programadas p
    LEFT JOIN LATERAL (
      SELECT sc.*
      FROM public.sesiones_clase sc
      WHERE sc.maestro_id = p.maestro_id
        AND sc.clase_id = p.clase_id
        AND sc.fecha = p.fecha
      ORDER BY
        CASE WHEN sc.estado IN ('registrada', 'cerrada') AND NOT COALESCE(sc.borrador, false) THEN 0 ELSE 1 END,
        sc.updated_at DESC NULLS LAST,
        sc.created_at DESC NULLS LAST
      LIMIT 1
    ) s ON true
    LEFT JOIN LATERAL (
      SELECT count(*)::integer AS total
      FROM public.asistencias a
      WHERE a.sesion_clase_id = s.id
    ) a ON true
  )
  SELECT
    e.fecha,
    e.clase_id,
    e.clase_nombre,
    e.maestro_id,
    e.hora_inicio,
    e.hora_fin,
    e.sesion_id,
    CASE
      WHEN e.emergente_id IS NOT NULL THEN 'cubierta_emergente'
      WHEN e.sesion_id IS NOT NULL
        AND NOT COALESCE(e.borrador, false)
        AND (
          e.sesion_estado IN ('registrada', 'cerrada')
          OR e.total_marcas > 0
          OR (jsonb_typeof(e.asistencia_json) = 'array' AND jsonb_array_length(e.asistencia_json) > 0)
        ) THEN 'registrada'
      WHEN e.fecha > v_hoy
        OR (e.fecha = v_hoy AND v_ahora < e.hora_fin) THEN 'futura'
      WHEN e.fecha >= v_hoy - 7 THEN 'pendiente'
      ELSE 'vencida'
    END AS estado,
    GREATEST(v_hoy - e.fecha, 0)::integer AS dias_atraso,
    e.sesion_id IS NOT NULL
      AND NOT COALESCE(e.borrador, false)
      AND (
        e.sesion_estado IN ('registrada', 'cerrada')
        OR e.total_marcas > 0
        OR (jsonb_typeof(e.asistencia_json) = 'array' AND jsonb_array_length(e.asistencia_json) > 0)
      ) AS asistencia_completa,
    e.emergente_id IS NOT NULL AS cubierta_emergente
  FROM evaluadas e
  ORDER BY e.fecha, e.hora_inicio, e.clase_nombre;
END;
$function$;

-- Función: fn_estado_calendario
CREATE OR REPLACE FUNCTION public.fn_estado_calendario(p_fecha date DEFAULT CURRENT_DATE)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_periodo   record;
  v_excepcion record;
BEGIN
  SELECT * INTO v_periodo FROM public.periodos
   WHERE p_fecha BETWEEN fecha_inicio AND fecha_fin
   ORDER BY activo DESC, fecha_inicio DESC LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'es_lectivo', false,
      'motivo', 'FUERA_DE_PERIODO',
      'detalle', 'La fecha no pertenece a ningun periodo academico registrado.',
      'periodo', NULL);
  END IF;

  SELECT * INTO v_excepcion FROM public.periodo_excepciones e
   WHERE p_fecha BETWEEN e.fecha_inicio AND e.fecha_fin
     AND (e.periodo_id IS NULL OR e.periodo_id = v_periodo.id)
   ORDER BY e.fecha_inicio LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'es_lectivo', false,
      'motivo', upper(v_excepcion.tipo),
      'detalle', v_excepcion.motivo,
      'desde', v_excepcion.fecha_inicio,
      'hasta', v_excepcion.fecha_fin,
      'periodo', jsonb_build_object('id', v_periodo.id, 'nombre', v_periodo.nombre));
  END IF;

  RETURN jsonb_build_object(
    'es_lectivo', true,
    'motivo', 'LECTIVO',
    'detalle', 'Dia dentro del periodo academico.',
    'periodo', jsonb_build_object(
      'id', v_periodo.id, 'nombre', v_periodo.nombre,
      'fecha_inicio', v_periodo.fecha_inicio, 'fecha_fin', v_periodo.fecha_fin,
      'cerrado', v_periodo.cerrado));
END;
$function$;

-- Función: fn_evaluacion_cobertura
CREATE OR REPLACE FUNCTION public.fn_evaluacion_cobertura(p_clase_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_indicators', COUNT(DISTINCT i.id),
    'evaluated_indicators', COUNT(DISTINCT CASE WHEN ia.result IS NOT NULL THEN i.id END),
    'total_students', COUNT(DISTINCT ia.student_id),
    'evaluated_students', COUNT(DISTINCT CASE WHEN ia.result IS NOT NULL THEN ia.student_id END),
    'coverage_pct', CASE WHEN COUNT(DISTINCT i.id) > 0
      THEN ROUND(COUNT(DISTINCT CASE WHEN ia.result IS NOT NULL THEN i.id END)::numeric
                 / COUNT(DISTINCT i.id) * 100, 1)
      ELSE 0 END,
    'by_teacher', (
      SELECT COALESCE(json_agg(t.*), '[]'::json)
      FROM (
        SELECT
          COALESCE(m.nombre_completo, 'Sin identificar') AS teacher_name,
          ia2.created_by AS teacher_id,
          COUNT(DISTINCT CASE WHEN ia2.result IS NOT NULL THEN ia2.indicator_id END) AS evaluated,
          COUNT(DISTINCT ia2.indicator_id) AS total,
          CASE WHEN COUNT(DISTINCT ia2.indicator_id) > 0
            THEN ROUND(COUNT(DISTINCT CASE WHEN ia2.result IS NOT NULL THEN ia2.indicator_id END)::numeric
                       / COUNT(DISTINCT ia2.indicator_id) * 100, 1)
            ELSE 0 END AS pct
        FROM public.indicator_attempts ia2
        LEFT JOIN public.maestros m ON m.id = ia2.created_by
        WHERE ia2.covered_by_clase_id = p_clase_id
        GROUP BY ia2.created_by, m.nombre_completo
      ) t
    )
  ) INTO result
  FROM public.indicator_attempts ia
  JOIN public.indicators i ON ia.indicator_id = i.id
  WHERE ia.covered_by_clase_id = p_clase_id;

  RETURN COALESCE(result, json_build_object(
    'total_indicators', 0, 'evaluated_indicators', 0,
    'total_students', 0, 'evaluated_students', 0,
    'coverage_pct', 0, 'by_teacher', '[]'::json
  ));
END;
$function$;

-- Función: fn_evaluar_logros_alumno
CREATE OR REPLACE FUNCTION public.fn_evaluar_logros_alumno(p_alumno_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_logro RECORD;
  v_tipo text;
  v_valor int;
  v_cumple boolean;
BEGIN
  IF p_alumno_id IS NULL THEN
    RETURN;
  END IF;

  FOR v_logro IN SELECT id, criterio FROM logros WHERE activo = true LOOP
    v_tipo := v_logro.criterio->>'tipo';
    v_valor := COALESCE((v_logro.criterio->>'valor')::int, 1);
    v_cumple := false;

    IF v_tipo IN ('asistencia', 'asistencias_totales') THEN
      SELECT count(*) >= v_valor INTO v_cumple
      FROM asistencias
      WHERE alumno_id = p_alumno_id AND estado = 'presente';

    ELSIF v_tipo = 'ejercicio_aprobado' THEN
      SELECT count(*) >= v_valor INTO v_cumple
      FROM evaluacion_indicador
      WHERE alumno_id = p_alumno_id AND maestro_indicador_id IS NOT NULL AND nota >= 3;

    ELSIF v_tipo = 'primer_objetivo_completado' THEN
      SELECT EXISTS (
        SELECT 1
        FROM maestro_objetivos mo
        WHERE EXISTS (SELECT 1 FROM maestro_indicadores mi2 WHERE mi2.objetivo_id = mo.id)
        AND NOT EXISTS (
          SELECT 1 FROM maestro_indicadores mi
          WHERE mi.objetivo_id = mo.id
          AND NOT EXISTS (
            SELECT 1 FROM evaluacion_indicador ei
            WHERE ei.maestro_indicador_id = mi.id AND ei.alumno_id = p_alumno_id
            AND (ei.nota >= 3 OR ei.recovery_status = 'recuperado')
          )
        )
      ) INTO v_cumple;

    ELSIF v_tipo = 'primero_en_desbloquear_objetivo' THEN
      WITH indicador_satisfecho AS (
        SELECT mi.objetivo_id, mi.id AS indicador_id, ei.alumno_id, MIN(ei.fecha_evaluacion) AS fecha_satisfecho
        FROM maestro_indicadores mi
        JOIN evaluacion_indicador ei ON ei.maestro_indicador_id = mi.id
        WHERE ei.nota >= 3 OR ei.recovery_status = 'recuperado'
        GROUP BY mi.objetivo_id, mi.id, ei.alumno_id
      ),
      objetivo_completo AS (
        SELECT s.objetivo_id, s.alumno_id, MAX(s.fecha_satisfecho) AS fecha_completo
        FROM indicador_satisfecho s
        GROUP BY s.objetivo_id, s.alumno_id
        HAVING COUNT(*) = (SELECT COUNT(*) FROM maestro_indicadores mi3 WHERE mi3.objetivo_id = s.objetivo_id)
      )
      SELECT EXISTS (
        SELECT 1 FROM objetivo_completo oc
        WHERE oc.alumno_id = p_alumno_id
        AND oc.fecha_completo <= ALL (
          SELECT oc2.fecha_completo FROM objetivo_completo oc2
          WHERE oc2.objetivo_id = oc.objetivo_id AND oc2.alumno_id <> p_alumno_id
        )
      ) INTO v_cumple;
    END IF;

    IF v_cumple THEN
      INSERT INTO alumnos_logros (alumno_id, logro_id)
      VALUES (p_alumno_id, v_logro.id)
      ON CONFLICT (alumno_id, logro_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$function$;

-- Función: fn_evaluar_reinscripcion
CREATE OR REPLACE FUNCTION public.fn_evaluar_reinscripcion(p_representante_cedula text, p_alumno_nombre text, p_alumno_fecha_nacimiento date DEFAULT NULL::date, p_representante_telefono text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  v_ced text := public.norm_cedula(p_representante_cedula);
  v_nombre_in text := lower(unaccent(trim(regexp_replace(COALESCE(p_alumno_nombre, ''), '\s+', ' ', 'g'))));
  v_familia_ids uuid[];
  v_rep jsonb;
  v_candidatos jsonb;
  v_deuda_alumno bigint := 0;
  v_deuda_rep bigint := 0;
  v_deuda_total bigint := 0;
  v_detalle jsonb;
  v_bloqueo_manual boolean := false;
  v_hay_exacto_activo boolean := false;
  v_reactivable_id uuid;
  v_permite boolean;
  v_accion text;
  v_mensaje text;
BEGIN
  SELECT array_agg(DISTINCT fid) INTO v_familia_ids FROM (
    SELECT r.familia_id AS fid FROM public.representantes r
     WHERE v_ced <> '' AND public.norm_cedula(r.cedula) = v_ced AND r.familia_id IS NOT NULL
    UNION
    SELECT a.familia_id AS fid FROM public.alumnos a
     WHERE v_ced <> '' AND a.familia_id IS NOT NULL
       AND v_ced IN (
         public.norm_cedula(a.representante_cedula), public.norm_cedula(a.padre_cedula),
         public.norm_cedula(a.madre_cedula), public.norm_cedula(a.otro_responsable_cedula))
  ) s;

  SELECT jsonb_build_object(
           'cedula', v_ced,
           'nombres', COALESCE(jsonb_agg(DISTINCT r.nombre) FILTER (WHERE r.nombre IS NOT NULL), '[]'::jsonb),
           'familia_ids', to_jsonb(COALESCE(v_familia_ids, ARRAY[]::uuid[])),
           'bloqueo_reinscripcion', COALESCE(bool_or(r.bloqueo_reinscripcion), false),
           'motivo_bloqueo', (array_agg(r.motivo_bloqueo) FILTER (WHERE r.motivo_bloqueo IS NOT NULL))[1]
         )
    INTO v_rep
    FROM public.representantes r
   WHERE v_ced <> '' AND public.norm_cedula(r.cedula) = v_ced;

  IF v_rep IS NULL THEN
    v_rep := jsonb_build_object(
      'cedula', v_ced, 'nombres', '[]'::jsonb,
      'familia_ids', to_jsonb(COALESCE(v_familia_ids, ARRAY[]::uuid[])),
      'bloqueo_reinscripcion', false, 'motivo_bloqueo', NULL);
  END IF;

  WITH cand AS (
    SELECT a.id, a.nombre_completo, a.fecha_nacimiento, a.estado_academico,
      a.activo, a.familia_id, a.fecha_baja,
      CASE
        WHEN lower(unaccent(a.nombre_completo)) = v_nombre_in
             AND (p_alumno_fecha_nacimiento IS NULL OR a.fecha_nacimiento = p_alumno_fecha_nacimiento)
          THEN 'exacto'
        WHEN v_ced <> ''
             AND v_ced IN (
               public.norm_cedula(a.representante_cedula), public.norm_cedula(a.padre_cedula),
               public.norm_cedula(a.madre_cedula), public.norm_cedula(a.otro_responsable_cedula))
             AND similarity(lower(unaccent(a.nombre_completo)), v_nombre_in) > 0.30
          THEN 'probable'
        WHEN similarity(lower(unaccent(a.nombre_completo)), v_nombre_in) > 0.55
          THEN 'probable'
        ELSE NULL
      END AS match
    FROM public.alumnos a
  )
  SELECT jsonb_agg(
           jsonb_build_object(
             'alumno_id', c.id, 'nombre', c.nombre_completo, 'fecha_nacimiento', c.fecha_nacimiento,
             'estado_academico', c.estado_academico, 'activo', c.activo, 'familia_id', c.familia_id,
             'fecha_baja', c.fecha_baja, 'match', c.match,
             'deuda_viva_centavos', public.fn_deuda_viva(c.id, NULL))
           ORDER BY (c.match = 'exacto') DESC, c.activo DESC)
    INTO v_candidatos
    FROM cand c WHERE c.match IS NOT NULL;

  v_candidatos := COALESCE(v_candidatos, '[]'::jsonb);

  SELECT COALESCE(SUM((e->>'deuda_viva_centavos')::bigint), 0)
    INTO v_deuda_alumno FROM jsonb_array_elements(v_candidatos) e;

  SELECT COALESCE(SUM(public.fn_deuda_viva(a.id, NULL)), 0)
    INTO v_deuda_rep
    FROM public.alumnos a
   WHERE v_familia_ids IS NOT NULL AND a.familia_id = ANY(v_familia_ids);

  SELECT COALESCE(jsonb_agg(
           jsonb_build_object(
             'alumno_nombre', al.nombre_completo,
             'periodo', c.ciclo_anio || '-' || lpad(c.ciclo_mes::text, 2, '0'),
             'concepto', c.concepto,
             'saldo_centavos', c.monto_final_centavos - COALESCE(c.monto_pagado_centavos, 0),
             'dias_atraso', GREATEST(0, CURRENT_DATE - c.fecha_vencimiento))
           ORDER BY c.fecha_vencimiento), '[]'::jsonb)
    INTO v_detalle
    FROM public.cuotas c
    JOIN public.alumnos al ON al.id = c.alumno_id
   WHERE (c.monto_final_centavos - COALESCE(c.monto_pagado_centavos, 0)) > 0
     AND c.estado::text NOT IN ('pagada', 'exonerada', 'becada', 'pre_pagada')
     AND (
       (v_familia_ids IS NOT NULL AND al.familia_id = ANY(v_familia_ids))
       OR al.id IN (SELECT (e->>'alumno_id')::uuid FROM jsonb_array_elements(v_candidatos) e)
     );

  SELECT v_deuda_rep + COALESCE(SUM((e->>'deuda_viva_centavos')::bigint), 0)
    INTO v_deuda_total
    FROM jsonb_array_elements(v_candidatos) e
   WHERE v_familia_ids IS NULL
      OR (e->>'familia_id') IS NULL
      OR NOT ((e->>'familia_id')::uuid = ANY(v_familia_ids));

  v_bloqueo_manual :=
       COALESCE((v_rep->>'bloqueo_reinscripcion')::boolean, false)
    OR EXISTS (SELECT 1 FROM jsonb_array_elements(v_candidatos) e
          WHERE COALESCE(e->>'activo', 'true') = 'false'
            AND (e->>'estado_academico') = 'retirado_con_deuda')
    OR EXISTS (SELECT 1 FROM public.alumnos a
          WHERE v_familia_ids IS NOT NULL AND a.familia_id = ANY(v_familia_ids)
            AND a.bloqueo_reinscripcion);

  v_hay_exacto_activo := EXISTS (
    SELECT 1 FROM jsonb_array_elements(v_candidatos) e
     WHERE e->>'match' = 'exacto' AND COALESCE(e->>'activo', 'true') = 'true');

  SELECT (e->>'alumno_id')::uuid INTO v_reactivable_id
    FROM jsonb_array_elements(v_candidatos) e
   WHERE e->>'match' = 'exacto' AND COALESCE(e->>'activo', 'true') = 'false'
   LIMIT 1;

  IF v_deuda_total > 0 THEN
    v_permite := false; v_accion := 'saldar_deuda';
    v_mensaje := 'Impedimento financiero: RD$ ' || to_char(v_deuda_total / 100.0, 'FM999999990.00')
      || ' de deuda viva vinculada al representante o al alumno. Debe saldarse antes de reinscribir.';
  ELSIF v_bloqueo_manual THEN
    v_permite := false; v_accion := 'levantar_bloqueo_manual';
    v_mensaje := 'Sin deuda viva, pero hay un bloqueo de reinscripcion activo. Requiere levantamiento manual por Finanzas o Direccion.';
  ELSIF v_hay_exacto_activo THEN
    v_permite := false; v_accion := 'ya_inscrito';
    v_mensaje := 'El alumno ya figura como matricula activa. No corresponde reinscribir (evitar expediente duplicado).';
  ELSIF v_reactivable_id IS NOT NULL THEN
    v_permite := true; v_accion := 'reactivar';
    v_mensaje := 'El alumno existe y esta retirado sin deuda. Reactivar el expediente con fn_reactivar_alumno.';
  ELSE
    v_permite := true; v_accion := 'crear_nuevo';
    v_mensaje := 'Sin coincidencias en la base ni impedimentos financieros. Alta normal.';
  END IF;

  RETURN jsonb_build_object(
    'alumno_existe', jsonb_array_length(v_candidatos) > 0,
    'candidatos', v_candidatos,
    'representante', v_rep,
    'deuda', jsonb_build_object(
      'alumno_centavos', v_deuda_alumno,
      'representante_centavos', v_deuda_rep,
      'total_centavos', v_deuda_total,
      'detalle', v_detalle),
    'permite_reinscripcion', v_permite,
    'accion_requerida', v_accion,
    'reactivable_alumno_id', v_reactivable_id,
    'mensaje', v_mensaje
  );
END;
$function$;

-- Función: fn_fin_acquire_service_refresh_lock
CREATE OR REPLACE FUNCTION public.fn_fin_acquire_service_refresh_lock(p_service_account_id uuid, p_refresh_run_id uuid, p_lease_seconds integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_updated integer;
begin
  insert into fin_service_refresh_state (service_account_id)
  values (p_service_account_id)
  on conflict (service_account_id) do nothing;

  update fin_service_refresh_state
  set locked_by_run_id = p_refresh_run_id,
      lock_expires_at = now() + make_interval(secs => p_lease_seconds),
      updated_at = now()
  where service_account_id = p_service_account_id
    and (locked_by_run_id is null or lock_expires_at < now());

  get diagnostics v_updated = row_count;
  return v_updated > 0;
end;
$function$;

-- Función: fn_fin_complete_service_refresh
CREATE OR REPLACE FUNCTION public.fn_fin_complete_service_refresh(p_service_account_id uuid, p_refresh_run_id uuid, p_status text, p_error_code text, p_record_query boolean, p_success boolean)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_updated integer;
begin
  update fin_service_refresh_state
  set locked_by_run_id = null,
      lock_expires_at = null,
      last_query_at = case when p_record_query then now() else last_query_at end,
      last_success_at = case when p_success then now() else last_success_at end,
      last_status = p_status,
      last_error_code = p_error_code,
      updated_at = now()
  where service_account_id = p_service_account_id
    and locked_by_run_id = p_refresh_run_id;

  get diagnostics v_updated = row_count;
  return v_updated > 0;
end;
$function$;

-- Función: fn_fin_service_dashboard
CREATE OR REPLACE FUNCTION public.fn_fin_service_dashboard()
 RETURNS TABLE(service_account_id uuid, provider_key text, provider_name text, account_name text, service_type text, essential boolean, refresh_enabled boolean, connector_status text, observed_at timestamp with time zone, balance_centavos bigint, amount_due_centavos bigint, due_date date, currency_code text, days_remaining integer, last_query_at timestamp with time zone, last_success_at timestamp with time zone, last_status text, last_error_code text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT
    sa.id,
    sa.provider_key,
    sa.provider_name,
    sa.account_name,
    sa.service_type,
    sa.essential,
    sa.refresh_enabled,
    sa.connector_status,
    latest.observed_at,
    latest.balance_centavos,
    latest.amount_due_centavos,
    latest.due_date,
    sa.currency_code,
    latest.days_remaining,
    latest.last_query_at,
    latest.last_success_at,
    coalesce(latest.last_status, 'never'),
    latest.last_error_code
  FROM public.service_accounts sa
  LEFT JOIN LATERAL (
    SELECT o.*
    FROM public.service_account_observations o
    WHERE o.service_account_id = sa.id
    ORDER BY o.observed_at DESC
    LIMIT 1
  ) latest ON true
  WHERE sa.activo = true
  ORDER BY sa.essential DESC, sa.account_name;
$function$;

-- Función: fn_fusionar_alumnos_duplicados
CREATE OR REPLACE FUNCTION public.fn_fusionar_alumnos_duplicados(p_principal_id uuid, p_obsoleto_id uuid, p_datos_fusion jsonb)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_principal public.alumnos%ROWTYPE;
  v_obsoleto  public.alumnos%ROWTYPE;
  v_row_count integer := 0;
  v_migradas  jsonb := '[]'::jsonb;
  v_filas_migradas jsonb;
  v_rec       record;
  v_col       text;
  v_tabla     text;
  v_sql       text;
  v_antes     integer;
  v_despues   integer;
BEGIN
  -- ── 0. Validaciones ───────────────────────────────────────────────────────
  IF p_principal_id IS NULL OR p_obsoleto_id IS NULL THEN
    RAISE EXCEPTION 'Se requieren los dos ids de los alumnos a fusionar';
  END IF;

  IF p_principal_id = p_obsoleto_id THEN
    RAISE EXCEPTION 'No se puede fusionar un alumno consigo mismo';
  END IF;

  SELECT * INTO v_principal FROM public.alumnos WHERE id = p_principal_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'El alumno principal (a conservar) no existe';
  END IF;

  SELECT * INTO v_obsoleto FROM public.alumnos WHERE id = p_obsoleto_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'El alumno obsoleto (a eliminar) no existe';
  END IF;

  -- ── 1. Actualizar el principal con los datos fusionados ──────────────────
  UPDATE public.alumnos
    SET
      nombre_completo      = COALESCE((p_datos_fusion->>'nombre_completo')::text,      v_principal.nombre_completo),
      genero               = COALESCE((p_datos_fusion->>'genero')::text,               v_principal.genero),
      fecha_nacimiento     = COALESCE((p_datos_fusion->>'fecha_nacimiento')::date,     v_principal.fecha_nacimiento),
      nacionalidad         = COALESCE((p_datos_fusion->>'nacionalidad')::text,         v_principal.nacionalidad),
      municipio_residencia = COALESCE((p_datos_fusion->>'municipio_residencia')::text, v_principal.municipio_residencia),
      direccion            = COALESCE((p_datos_fusion->>'direccion')::text,            v_principal.direccion),
      correo_representante = COALESCE((p_datos_fusion->>'correo_representante')::text, v_principal.correo_representante),
      representante_cedula = COALESCE((p_datos_fusion->>'representante_cedula')::text, v_principal.representante_cedula),
      representante_tlf    = COALESCE((p_datos_fusion->>'representante_tlf')::text,    v_principal.representante_tlf),
      representante_nombre = COALESCE((p_datos_fusion->>'representante_nombre')::text, v_principal.representante_nombre),
      representante_parentesco = COALESCE((p_datos_fusion->>'representante_parentesco')::text, v_principal.representante_parentesco),
      madre_nombre         = COALESCE((p_datos_fusion->>'madre_nombre')::text,         v_principal.madre_nombre),
      madre_cedula         = COALESCE((p_datos_fusion->>'madre_cedula')::text,         v_principal.madre_cedula),
      madre_tlf_whatsapp   = COALESCE((p_datos_fusion->>'madre_tlf_whatsapp')::text,   v_principal.madre_tlf_whatsapp),
      padre_nombre         = COALESCE((p_datos_fusion->>'padre_nombre')::text,         v_principal.padre_nombre),
      padre_cedula         = COALESCE((p_datos_fusion->>'padre_cedula')::text,         v_principal.padre_cedula),
      padre_tlf_whatsapp   = COALESCE((p_datos_fusion->>'padre_tlf_whatsapp')::text,   v_principal.padre_tlf_whatsapp),
      familiar_nombre      = COALESCE((p_datos_fusion->>'familiar_nombre')::text,      v_principal.familiar_nombre),
      familiar_telefono    = COALESCE((p_datos_fusion->>'familiar_telefono')::text,    v_principal.familiar_telefono),
      familiar_parentesco  = COALESCE((p_datos_fusion->>'familiar_parentesco')::text,  v_principal.familiar_parentesco),
      contacto_emergencia_nombre   = COALESCE((p_datos_fusion->>'contacto_emergencia_nombre')::text,   v_principal.contacto_emergencia_nombre),
      contacto_emergencia_telefono = COALESCE((p_datos_fusion->>'contacto_emergencia_telefono')::text, v_principal.contacto_emergencia_telefono),
      contacto_emergencia_parentesco = COALESCE((p_datos_fusion->>'contacto_emergencia_parentesco')::text, v_principal.contacto_emergencia_parentesco),
      instrumento_principal = COALESCE((p_datos_fusion->>'instrumento_principal')::text, v_principal.instrumento_principal),
      instrumento_interes   = COALESCE((p_datos_fusion->>'instrumento_interes')::text,   v_principal.instrumento_interes),
      nivel_lectura_musical = COALESCE((p_datos_fusion->>'nivel_lectura_musical')::text, v_principal.nivel_lectura_musical),
      centro_estudios       = COALESCE((p_datos_fusion->>'centro_estudios')::text,       v_principal.centro_estudios),
      grado_nivel           = COALESCE((p_datos_fusion->>'grado_nivel')::text,           v_principal.grado_nivel),
      alergias_descripcion  = COALESCE((p_datos_fusion->>'alergias_descripcion')::text,  v_principal.alergias_descripcion),
      condiciones_medicas   = COALESCE((p_datos_fusion->>'condiciones_medicas')::text,   v_principal.condiciones_medicas),
      medicamentos          = COALESCE((p_datos_fusion->>'medicamentos')::text,          v_principal.medicamentos),
      updated_at            = now()
    WHERE id = p_principal_id;

  GET DIAGNOSTICS v_row_count = ROW_COUNT;
  IF v_row_count = 0 THEN
    RAISE EXCEPTION 'No se pudo actualizar el alumno principal';
  END IF;

  -- ── 2. Migrar datos hijos: reasignar cada columna que apunta a alumnos ──
  UPDATE public.alumnos_clases ac
    SET alumno_id = p_principal_id
    WHERE ac.alumno_id = p_obsoleto_id
      AND NOT EXISTS (
        SELECT 1 FROM public.alumnos_clases x
        WHERE x.alumno_id = p_principal_id AND x.clase_id = ac.clase_id
      );

  DELETE FROM public.alumnos_clases
    WHERE alumno_id = p_obsoleto_id;

  -- Bucle dinámico SOLO sobre BASE TABLE (excluyendo vistas como vw_alertas_activas)
  FOR v_rec IN
    SELECT c.table_name, c.column_name
    FROM information_schema.columns c
    INNER JOIN information_schema.tables t
      ON t.table_schema = c.table_schema
     AND t.table_name = c.table_name
    WHERE c.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND c.column_name IN ('alumno_id', 'student_id')
      AND c.table_name <> 'alumnos'
      AND c.table_name <> 'alumnos_clases'
    ORDER BY c.table_name
  LOOP
    v_tabla := v_rec.table_name;
    v_col   := v_rec.column_name;

    EXECUTE format('SELECT count(*) FROM public.%I WHERE %I = $1', v_tabla, v_col)
      INTO v_antes USING p_obsoleto_id;

    IF v_antes = 0 THEN
      CONTINUE;
    END IF;

    EXECUTE format(
      'UPDATE public.%I SET %I = $1 WHERE %I = $2 AND NOT EXISTS (SELECT 1 FROM public.%I x WHERE x.%I = $1)',
      v_tabla, v_col, v_col, v_tabla, v_col
    ) USING p_principal_id, p_obsoleto_id;

    EXECUTE format('SELECT count(*) FROM public.%I WHERE %I = $1', v_tabla, v_col)
      INTO v_despues USING p_obsoleto_id;

    IF v_despues > 0 THEN
      EXECUTE format('DELETE FROM public.%I WHERE %I = $1', v_tabla, v_col)
        USING p_obsoleto_id;
      v_row_count := v_row_count + v_despues;
    END IF;

    IF v_antes - v_despues > 0 THEN
      v_migradas := v_migradas || jsonb_build_object(
        'tabla', v_tabla,
        'column', v_col,
        'migradas', v_antes - v_despues
      );
    END IF;
  END LOOP;

  -- ── 3. Familia: adoptar la del obsoleto si el principal no tiene ─────────
  IF v_principal.familia_id IS NULL AND v_obsoleto.familia_id IS NOT NULL THEN
    UPDATE public.alumnos SET familia_id = v_obsoleto.familia_id
      WHERE id = p_principal_id;
  END IF;

  -- ── 4. Eliminar el obsoleto (ya sin datos hijos) ─────────────────────────
  DELETE FROM public.alumnos WHERE id = p_obsoleto_id;

  GET DIAGNOSTICS v_row_count = ROW_COUNT;
  IF v_row_count = 0 THEN
    RAISE EXCEPTION 'No se pudo eliminar el registro obsoleto';
  END IF;

  RETURN json_build_object(
    'success', true,
    'principal_id', p_principal_id,
    'obsoleto_id', p_obsoleto_id,
    'eliminado', true,
    'tablas_migradas', v_migradas
  );
EXCEPTION WHEN OTHERS THEN
  RAISE;
END;
$function$;

-- Función: fn_generar_ciclo_cuotas
CREATE OR REPLACE FUNCTION public.fn_generar_ciclo_cuotas(p_mes integer, p_anio integer, p_monto_centavos bigint DEFAULT NULL::bigint)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_count        int := 0;
  v_alumno       RECORD;
  v_vencimiento  date;
  v_porcentaje   integer;
  v_descuento    bigint;
  v_monto_base   bigint;
  v_monto_final  bigint;
  v_estado       public.cuota_estado;
BEGIN
  IF p_mes < 1 OR p_mes > 12 THEN
    RAISE EXCEPTION 'p_mes debe estar entre 1 y 12, recibido: %', p_mes;
  END IF;

  -- Determinar monto base: si no se provee parámetro explícito, consultar arancel activo vigente
  IF p_monto_centavos IS NOT NULL AND p_monto_centavos > 0 THEN
    v_monto_base := p_monto_centavos;
  ELSE
    SELECT ca.monto_centavos
      INTO v_monto_base
      FROM public.configuracion_aranceles ca
     WHERE ca.concepto = 'mensualidad'
       AND ca.activo = true
       AND ca.fecha_vigencia_desde <= make_date(p_anio, p_mes, 1)
       AND (ca.fecha_vigencia_hasta IS NULL OR ca.fecha_vigencia_hasta >= make_date(p_anio, p_mes, 1))
     ORDER BY ca.fecha_vigencia_desde DESC
     LIMIT 1;

    -- Fallback de seguridad en caso de tabla sin poblar
    IF v_monto_base IS NULL OR v_monto_base <= 0 THEN
      v_monto_base := 60000;
    END IF;
  END IF;

  v_vencimiento := make_date(p_anio, p_mes, 5);

  FOR v_alumno IN
    SELECT a.id AS alumno_id, a.familia_id
    FROM public.alumnos a
    JOIN public.familias f ON f.id = a.familia_id AND f.activa = true
    WHERE a.activo = true
      AND COALESCE(a.exento_mensualidad, false) = false
  LOOP
    -- Beca activa vigente al vencimiento (la de mayor cobertura si hay varias)
    SELECT b.porcentaje
      INTO v_porcentaje
      FROM public.becas b
     WHERE b.alumno_id = v_alumno.alumno_id
       AND b.activa = true
       AND b.fecha_inicio <= v_vencimiento
       AND (b.fecha_fin IS NULL OR b.fecha_fin >= v_vencimiento)
     ORDER BY b.porcentaje DESC
     LIMIT 1;

    v_porcentaje  := LEAST(GREATEST(COALESCE(v_porcentaje, 0), 0), 100);
    v_descuento   := (v_monto_base * v_porcentaje) / 100;
    v_monto_final := v_monto_base - v_descuento;
    v_estado      := CASE WHEN v_monto_final <= 0 THEN 'becada'::public.cuota_estado ELSE 'pendiente'::public.cuota_estado END;

    INSERT INTO public.cuotas (
      familia_id, alumno_id, concepto,
      monto_base_centavos, monto_final_centavos, descuento_centavos,
      fecha_generacion, fecha_vencimiento,
      ciclo_mes, ciclo_anio, estado
    )
    VALUES (
      v_alumno.familia_id, v_alumno.alumno_id, 'mensualidad',
      v_monto_base, v_monto_final, v_descuento,
      CURRENT_DATE, v_vencimiento,
      p_mes, p_anio, v_estado
    )
    ON CONFLICT (familia_id, alumno_id, ciclo_anio, ciclo_mes, concepto)
    DO NOTHING;

    IF FOUND THEN
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$function$;

-- Función: fn_generar_instancias_gastos_fijos
CREATE OR REPLACE FUNCTION public.fn_generar_instancias_gastos_fijos(p_mes integer, p_anio integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_count int := 0;
  v_gasto RECORD;
BEGIN
  IF p_mes < 1 OR p_mes > 12 THEN
    RAISE EXCEPTION 'p_mes must be between 1 and 12, got %', p_mes;
  END IF;

  FOR v_gasto IN
    SELECT id, monto_centavos FROM public.gastos_fijos
    WHERE activo = true AND repetir_mensual = true
  LOOP
    INSERT INTO public.gastos_fijos_pagos (gasto_fijo_id, periodo_anio, periodo_mes, monto_centavos)
    VALUES (v_gasto.id, p_anio, p_mes, v_gasto.monto_centavos)
    ON CONFLICT (gasto_fijo_id, periodo_anio, periodo_mes) DO NOTHING;

    IF FOUND THEN
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$function$;

-- Función: fn_generar_tareas_calendario
CREATE OR REPLACE FUNCTION public.fn_generar_tareas_calendario(p_evento_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_evento RECORD;
  v_tareas_count integer := 0;
  v_protocolo JSONB;
  v_tarea RECORD;
BEGIN
  -- Obtener evento
  SELECT * INTO v_evento FROM public.calendario WHERE id = p_evento_id;

  IF v_evento IS NULL THEN
    RETURN json_build_object('error', 'Evento no encontrado');
  END IF;

  -- Si tiene protocolo JSON, procesar cada tarea del protocolo
  v_protocolo := COALESCE(v_evento.protocolo_json, '{}');

  IF v_protocolo ? 'tareas' THEN
    FOR v_tarea IN SELECT * FROM jsonb_array_elements(v_protocolo->'tareas') AS tarea
    LOOP
      INSERT INTO public.tareas_calendario(
        evento_id, departamento_id, titulo, descripcion,
        fecha_vencimiento, estado, prioridad, generada_por
      )
      VALUES(
        p_evento_id,
        (v_tarea->>'departamento_id')::uuid,
        v_tarea->>'titulo',
        v_tarea->>'descripcion',
        v_evento.fecha_inicio - INTERVAL '1 day' * COALESCE((v_tarea->>'dias_anticipacion')::integer, v_evento.fecha_alerta),
        'pendiente',
        COALESCE(v_tarea->>'prioridad', 'media'),
        'hermes'
      );
      v_tareas_count := v_tareas_count + 1;
    END LOOP;
  END IF;

  RETURN json_build_object(
    'success', true,
    'evento_id', p_evento_id,
    'tareas_generadas', v_tareas_count,
    'mensaje', FORMAT('Se generaron %s tareas para el evento %s', v_tareas_count, v_evento.titulo)
  );
END
$function$;

-- Función: fn_generate_class_start_reminders
CREATE OR REPLACE FUNCTION public.fn_generate_class_start_reminders()
 RETURNS TABLE(notifications_created integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_hoy DATE;
  v_day_of_week INT;
  v_now_time TIME;
  v_rec RECORD;
  v_deep_link TEXT;
  v_dedup_key TEXT;
  v_created INT := 0;
BEGIN
  v_hoy := (NOW() AT TIME ZONE 'America/Santo_Domingo')::DATE;

  IF NOT public.fn_es_dia_lectivo(v_hoy) THEN
    RETURN QUERY SELECT 0::INT;
    RETURN;
  END IF;

  v_now_time := (NOW() AT TIME ZONE 'America/Santo_Domingo')::TIME;
  v_day_of_week := EXTRACT(ISODOW FROM NOW() AT TIME ZONE 'America/Santo_Domingo');

  FOR v_rec IN
    SELECT
      h.clase_id,
      c.nombre AS clase_nombre,
      h.hora_inicio,
      m.user_id AS profile_id
    FROM horarios h
    INNER JOIN clases c ON c.id = h.clase_id
    INNER JOIN maestros m ON m.id = h.maestro_id
    INNER JOIN configuracion_recordatorios cr ON cr.profile_id = m.user_id
    WHERE h.dia_semana = v_day_of_week
      AND h.activo = TRUE
      AND c.activo = TRUE
      AND c.estado = 'activa'
      AND m.activo = TRUE
      AND m.user_id IS NOT NULL
      AND cr.recordatorios_activos = TRUE
      AND cr.alerta_pre_clase = TRUE
      AND cr.push_activo = TRUE
      AND (v_hoy + h.hora_inicio) > (v_hoy + v_now_time)
      AND (v_hoy + h.hora_inicio) <= (v_hoy + v_now_time) + (COALESCE(cr.min_antes_clase, 15) || ' minutes')::INTERVAL
  LOOP
    v_dedup_key := v_rec.profile_id::TEXT || ':recordatorio_clase:' || v_rec.clase_id::TEXT
      || ':' || v_rec.hora_inicio::TEXT || ':' || v_hoy::TEXT;

    IF NOT EXISTS (SELECT 1 FROM notificaciones WHERE dedup_key = v_dedup_key) THEN
      v_deep_link := '/asistencia/' || v_rec.clase_id::TEXT || '/' || v_hoy::TEXT;

      INSERT INTO notificaciones (
        profile_id, tipo, titulo, mensaje, deep_link, clase_id, estado, dedup_key, created_at
      ) VALUES (
        v_rec.profile_id, 'recordatorio_clase',
        'Tu clase empieza pronto',
        v_rec.clase_nombre || ' inicia a las ' || to_char(v_rec.hora_inicio, 'HH24:MI') || '.',
        v_deep_link, v_rec.clase_id, 'pendiente', v_dedup_key, NOW()
      );

      v_created := v_created + 1;
    END IF;
  END LOOP;

  RETURN QUERY SELECT v_created;
END;
$function$;

-- Función: fn_get_indice_ensenanza_guiada
CREATE OR REPLACE FUNCTION public.fn_get_indice_ensenanza_guiada()
 RETURNS SETOF vw_indice_ensenanza_guiada
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT (es_admin() OR es_coordinador_acm()) THEN
    RAISE EXCEPTION 'No autorizado para consultar el índice de enseñanza guiada';
  END IF;

  RETURN QUERY SELECT * FROM vw_indice_ensenanza_guiada;
END;
$function$;

-- Función: fn_hermes_aprobar_whatsapp
CREATE OR REPLACE FUNCTION public.fn_hermes_aprobar_whatsapp(p_queue_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_rol text;
BEGIN
  SELECT rol INTO v_rol FROM public.profiles WHERE id = auth.uid();
  IF coalesce(v_rol, '') NOT IN ('admin', 'superadmin', 'direccion', 'coordinacion_academica') THEN
    RAISE EXCEPTION 'No autorizado para aprobar mensajes de WhatsApp';
  END IF;

  UPDATE public.hermes_whatsapp_queue
  SET estado = 'pendiente'
  WHERE id = p_queue_id AND estado = 'pendiente_aprobacion';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mensaje % no está pendiente de aprobación', p_queue_id;
  END IF;
END;
$function$;

-- Función: fn_hermes_auto_delegar_tareas
CREATE OR REPLACE FUNCTION public.fn_hermes_auto_delegar_tareas()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$;

-- Función: fn_hermes_close_process_case
CREATE OR REPLACE FUNCTION public.fn_hermes_close_process_case(p_case_id uuid, p_closure_summary text DEFAULT NULL::text, p_actor_id uuid DEFAULT NULL::uuid, p_actor_nombre text DEFAULT NULL::text, p_force boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_case public.hermes_process_cases%ROWTYPE;
  v_total_tasks int;
  v_pending_tasks int;
  v_blocked_tasks int;
  v_evidence_required jsonb;
  v_missing_evidence text[];
BEGIN
  SELECT * INTO v_case FROM public.hermes_process_cases WHERE id = p_case_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'process case % not found', p_case_id;
  END IF;
  IF v_case.status = 'closed' THEN
    RAISE EXCEPTION 'process case % is already closed', p_case_id;
  END IF;
  IF v_case.status = 'cancelled' THEN
    RAISE EXCEPTION 'process case % is cancelled — cannot close', p_case_id;
  END IF;

  IF NOT p_force THEN
    SELECT
      COUNT(*),
      COUNT(*) FILTER (WHERE estado NOT IN ('completada', 'cancelada')),
      COUNT(*) FILTER (WHERE estado = 'bloqueada')
    INTO v_total_tasks, v_pending_tasks, v_blocked_tasks
    FROM public.tareas_institucionales
    WHERE correlation_id = p_case_id;

    IF v_pending_tasks > 0 THEN
      RAISE EXCEPTION 'cannot close case: % tareas pendientes (%, bloqueadas: %)',
        v_pending_tasks, (v_total_tasks - v_pending_tasks - v_blocked_tasks), v_blocked_tasks;
    END IF;

    v_evidence_required := v_case.closure_criteria_snapshot;
    IF jsonb_array_length(v_evidence_required) > 0 THEN
      v_missing_evidence := ARRAY[]::text[];
      SELECT ARRAY_AGG(criteria::text) INTO v_missing_evidence
      FROM jsonb_array_elements_text(v_evidence_required) AS criteria
      WHERE criteria IS NOT NULL;

      IF array_length(v_missing_evidence, 1) > 0 AND p_closure_summary IS NULL THEN
        RAISE EXCEPTION 'closure_summary is required when closure criteria are defined';
      END IF;
    END IF;
  END IF;

  UPDATE public.hermes_process_cases
  SET status = 'closed',
      closure_summary = COALESCE(p_closure_summary, closure_summary, 'Cerrado sin observaciones'),
      closed_at = now(),
      updated_at = now()
  WHERE id = p_case_id;

  RETURN jsonb_build_object(
    'case_id', p_case_id,
    'status', 'closed',
    'closed_at', now(),
    'summary', COALESCE(p_closure_summary, 'Cerrado sin observaciones')
  );
END;
$function$;

-- Función: fn_hermes_consulta_estado
CREATE OR REPLACE FUNCTION public.fn_hermes_consulta_estado()
 RETURNS json
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT json_build_object(
    'tareas', (SELECT json_build_object(
        'total', count(*),
        'pendiente', count(*) FILTER (WHERE estado='pendiente'),
        'en_progreso', count(*) FILTER (WHERE estado='en_progreso'),
        'completada', count(*) FILTER (WHERE estado='completada'),
        'bloqueada', count(*) FILTER (WHERE estado='bloqueada'),
        'observada', count(*) FILTER (WHERE estado='observada'),
        'cancelada', count(*) FILTER (WHERE estado='cancelada')
      ) FROM public.tareas_institucionales),
    'por_departamento', (SELECT coalesce(json_agg(d ORDER BY d.pendientes DESC), '[]'::json) FROM (
        SELECT departamento::text AS departamento,
               count(*) FILTER (WHERE estado NOT IN ('completada','cancelada')) AS abiertas,
               count(*) FILTER (WHERE estado='pendiente') AS pendientes,
               count(*) FILTER (WHERE estado='bloqueada') AS bloqueadas,
               count(*) AS total
        FROM public.tareas_institucionales GROUP BY departamento
      ) d),
    'atencion_inmediata', (SELECT coalesce(json_agg(a), '[]'::json) FROM (
        SELECT titulo, departamento::text AS departamento, prioridad::text AS prioridad, estado::text AS estado
        FROM public.tareas_institucionales
        WHERE estado = 'bloqueada' OR (prioridad = 'critica' AND estado NOT IN ('completada','cancelada'))
        ORDER BY CASE WHEN estado='bloqueada' THEN 0 ELSE 1 END, updated_at DESC
        LIMIT 25
      ) a),
    'total_procedimientos', (SELECT count(DISTINCT correlation_id) FROM public.tareas_institucionales)
  );
$function$;

-- Función: fn_hermes_escalar_tareas_bloqueadas
CREATE OR REPLACE FUNCTION public.fn_hermes_escalar_tareas_bloqueadas()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_tarea RECORD;
BEGIN
  FOR v_tarea IN
    SELECT t.id, t.titulo, t.departamento, t.updated_at
    FROM public.tareas_institucionales t
    WHERE t.estado = 'bloqueada'
      AND t.updated_at < NOW() - INTERVAL '72 hours'
      AND NOT EXISTS (
        SELECT 1 FROM public.tareas_institucionales esc
        WHERE esc.titulo LIKE '🚨 ESCALA: %' || LEFT(t.titulo, 40) || '%'
          AND esc.departamento = 'DIR'
          AND esc.estado NOT IN ('completada', 'cancelada')
          AND esc.created_at > NOW() - INTERVAL '96 hours'
      )
  LOOP
    INSERT INTO public.tareas_institucionales (
      titulo, descripcion, departamento, estado, prioridad, fecha_vencimiento
    ) VALUES (
      '🚨 ESCALA: ' || LEFT(v_tarea.titulo, 80),
      'Tarea BLOQUEADA por más de 72 horas sin movimiento. Requiere atención inmediata de Dirección. ' ||
      'Departamento responsable: ' || v_tarea.departamento || '. ' ||
      'Tarea original ID: ' || v_tarea.id::text,
      'DIR', 'pendiente', 'critica', CURRENT_DATE + 1
    );
  END LOOP;
END;
$function$;

-- Función: fn_hermes_force_close_process_case
CREATE OR REPLACE FUNCTION public.fn_hermes_force_close_process_case(p_case_id uuid, p_closure_summary text DEFAULT NULL::text, p_actor_id uuid DEFAULT NULL::uuid, p_actor_nombre text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN public.fn_hermes_close_process_case(
    p_case_id := p_case_id,
    p_closure_summary := p_closure_summary,
    p_actor_id := p_actor_id,
    p_actor_nombre := p_actor_nombre,
    p_force := true
  );
END;
$function$;

-- Función: fn_hermes_gateway_acquire_lease
CREATE OR REPLACE FUNCTION public.fn_hermes_gateway_acquire_lease(p_instance_name text, p_owner_id text, p_duration_seconds integer DEFAULT 30)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_acquired boolean := false;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Solo service_role puede adquirir el lease del gateway';
  END IF;
  IF nullif(btrim(p_instance_name), '') IS NULL OR nullif(btrim(p_owner_id), '') IS NULL THEN
    RETURN false;
  END IF;
  INSERT INTO public.hermes_gateway_worker_lease (instance_name, owner_id, lease_until)
  VALUES (btrim(p_instance_name), btrim(p_owner_id), now() + make_interval(secs => greatest(p_duration_seconds, 10)))
  ON CONFLICT (instance_name) DO UPDATE
  SET owner_id = EXCLUDED.owner_id, lease_until = EXCLUDED.lease_until, updated_at = now()
  WHERE public.hermes_gateway_worker_lease.lease_until < now()
     OR public.hermes_gateway_worker_lease.owner_id = EXCLUDED.owner_id
  RETURNING true INTO v_acquired;
  RETURN coalesce(v_acquired, false);
END;
$function$;

-- Función: fn_hermes_gateway_get_live_status
CREATE OR REPLACE FUNCTION public.fn_hermes_gateway_get_live_status(p_instance_name text DEFAULT 'soi-main'::text)
 RETURNS TABLE(instance_name text, status text, is_alive boolean, phone_number text, battery_level integer, qr_code_base64 text, seconds_since_heartbeat numeric, last_heartbeat timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.role() IS NOT NULL AND auth.role() <> 'service_role'
     AND NOT COALESCE(public.es_admin(), false) THEN
    RAISE EXCEPTION 'No autorizado para consultar el estado de WhatsApp';
  END IF;
  RETURN QUERY
  SELECT
    h.instance_name,
    CASE WHEN h.last_heartbeat < (now() - interval '60 seconds') THEN 'disconnected' ELSE h.status END,
    (h.last_heartbeat >= (now() - interval '60 seconds') AND h.status = 'connected'),
    h.phone_number, h.battery_level, NULL::text,
    EXTRACT(EPOCH FROM (now() - h.last_heartbeat)), h.last_heartbeat
  FROM public.hermes_gateway_health h
  WHERE h.instance_name = p_instance_name
  LIMIT 1;
END;
$function$;

-- Función: fn_hermes_gateway_heartbeat
CREATE OR REPLACE FUNCTION public.fn_hermes_gateway_heartbeat(p_instance_name text DEFAULT 'soi-main'::text, p_status text DEFAULT 'connected'::text, p_phone text DEFAULT NULL::text, p_battery integer DEFAULT NULL::integer, p_qr text DEFAULT NULL::text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_id uuid;
BEGIN
  INSERT INTO public.hermes_gateway_health (
    instance_name, status, phone_number, battery_level, qr_code_base64, last_heartbeat, metadata
  ) VALUES (
    p_instance_name, p_status, p_phone, p_battery, NULL, now(), p_metadata
  )
  ON CONFLICT (instance_name) DO UPDATE SET
    status = EXCLUDED.status,
    phone_number = COALESCE(EXCLUDED.phone_number, public.hermes_gateway_health.phone_number),
    battery_level = EXCLUDED.battery_level,
    qr_code_base64 = NULL,
    last_heartbeat = now(),
    metadata = EXCLUDED.metadata
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$function$;

-- Función: fn_hermes_gateway_release_lease
CREATE OR REPLACE FUNCTION public.fn_hermes_gateway_release_lease(p_instance_name text, p_owner_id text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Solo service_role puede liberar el lease del gateway';
  END IF;
  DELETE FROM public.hermes_gateway_worker_lease
  WHERE instance_name = btrim(p_instance_name) AND owner_id = btrim(p_owner_id);
  RETURN FOUND;
END;
$function$;

-- Función: fn_hermes_orquestar_protocolo
CREATE OR REPLACE FUNCTION public.fn_hermes_orquestar_protocolo(p_evento_id uuid, p_protocolo_id uuid)
 RETURNS TABLE(paso integer, tarea_id uuid, titulo text, departamento text, fecha_vencimiento date, dependencia_tarea_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_evento RECORD;
  v_paso jsonb;
  v_paso_idx int := 0;
  v_tarea_id uuid;
  v_tarea_anterior_id uuid := NULL;
  v_fecha_venc date;
BEGIN
  SELECT * INTO v_evento FROM public.calendario_institucional WHERE id = p_evento_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Evento % no encontrado', p_evento_id;
  END IF;

  FOR v_paso IN
    SELECT * FROM jsonb_array_elements(
      (SELECT tareas_plantilla FROM public.hermes_protocolos WHERE id = p_protocolo_id)
    )
  LOOP
    v_paso_idx := v_paso_idx + 1;
    v_fecha_venc := (v_evento.fecha_inicio::date
      + ((v_paso->>'diferencia_dias')::int || ' days')::interval)::date;

    INSERT INTO public.tareas_institucionales (
      event_id, titulo, descripcion, departamento, estado, prioridad,
      fecha_vencimiento, checklist, dependencia_tarea_id
    ) VALUES (
      v_evento.id,
      v_paso->>'titulo',
      v_paso->>'descripcion',
      (v_paso->>'departamento')::public.soi_departamento,
      'pendiente',
      (v_paso->>'prioridad')::public.tarea_institucional_prioridad,
      v_fecha_venc,
      v_paso->'checklist',
      v_tarea_anterior_id
    )
    RETURNING id INTO v_tarea_id;

    RETURN QUERY SELECT
      v_paso_idx, v_tarea_id, v_paso->>'titulo', v_paso->>'departamento',
      v_fecha_venc, v_tarea_anterior_id;

    v_tarea_anterior_id := v_tarea_id;
  END LOOP;
END;
$function$;

-- Función: fn_hermes_outreach_gate_status
CREATE OR REPLACE FUNCTION public.fn_hermes_outreach_gate_status(p_secret text)
 RETURNS TABLE(whatsapp_ingest_enabled boolean, quiet_hours_start text, quiet_hours_end text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_secret text;
begin
  select value into v_secret from public.system_config where key = 'hermes_internal_lookup_secret';

  if v_secret is null or p_secret is null or p_secret <> v_secret then
    raise exception 'unauthorized';
  end if;

  return query
  select
    coalesce((select value from public.system_config where key = 'whatsapp_ingest_enabled'), 'false') = 'true',
    (select value from public.system_config where key = 'whatsapp_quiet_hours_start'),
    (select value from public.system_config where key = 'whatsapp_quiet_hours_end');
end;
$function$;

-- Función: fn_hermes_queue_whatsapp
CREATE OR REPLACE FUNCTION public.fn_hermes_queue_whatsapp(p_jid text, p_mensaje text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_queue_id uuid;
BEGIN
  IF auth.role() IS NOT NULL AND auth.role() <> 'service_role'
     AND NOT COALESCE(public.es_admin(), false) THEN
    RAISE EXCEPTION 'No autorizado para encolar mensajes de WhatsApp';
  END IF;
  IF p_jid IS NULL OR btrim(p_jid) = '' OR p_mensaje IS NULL OR btrim(p_mensaje) = '' THEN
    RETURN NULL;
  END IF;
  INSERT INTO public.hermes_whatsapp_queue (jid, mensaje, estado, intentos)
  VALUES (btrim(p_jid), btrim(p_mensaje), 'pendiente', 0)
  RETURNING id INTO v_queue_id;
  RETURN v_queue_id;
END;
$function$;

-- Función: fn_hermes_rechazar_whatsapp
CREATE OR REPLACE FUNCTION public.fn_hermes_rechazar_whatsapp(p_queue_id uuid, p_motivo text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_rol text;
BEGIN
  SELECT rol INTO v_rol FROM public.profiles WHERE id = auth.uid();
  IF coalesce(v_rol, '') NOT IN ('admin', 'superadmin', 'direccion', 'coordinacion_academica') THEN
    RAISE EXCEPTION 'No autorizado para rechazar mensajes de WhatsApp';
  END IF;

  UPDATE public.hermes_whatsapp_queue
  SET estado = 'cancelado', error_msg = p_motivo
  WHERE id = p_queue_id AND estado = 'pendiente_aprobacion';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mensaje % no está pendiente de aprobación', p_queue_id;
  END IF;
END;
$function$;

-- Función: fn_hermes_register_response
CREATE OR REPLACE FUNCTION public.fn_hermes_register_response(p_notif_id uuid DEFAULT NULL::uuid, p_response_text text DEFAULT NULL::text, p_sender_whatsapp text DEFAULT NULL::text, p_sender_name text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_target_notif_id uuid;
  v_result json;
BEGIN
  -- Validate input
  IF p_response_text IS NULL OR p_response_text = '' THEN
    RETURN json_build_object('error', 'response_text is required');
  END IF;

  -- If p_notif_id is provided, use it directly
  -- Otherwise, search for the most recent pending notification from this phone
  IF p_notif_id IS NOT NULL THEN
    v_target_notif_id := p_notif_id;
  ELSIF p_sender_whatsapp IS NOT NULL THEN
    -- Search for most recent pending notification from a representante with this phone
    SELECT nc.id INTO v_target_notif_id
    FROM public.notificaciones_caja nc
    INNER JOIN public.familias f ON nc.familia_id = f.id
    INNER JOIN public.representantes r ON f.id = r.familia_id
    WHERE nc.estado_whatsapp = 'pendiente'
      AND (r.telefono_whatsapp LIKE CONCAT('%', p_sender_whatsapp))
    ORDER BY nc.created_at DESC
    LIMIT 1;
  END IF;

  -- If still no notification found, return error
  IF v_target_notif_id IS NULL THEN
    RETURN json_build_object(
      'error', 'No pending notification found for this sender',
      'phone', p_sender_whatsapp
    );
  END IF;

  -- Update the notification with the response
  UPDATE public.notificaciones_caja
  SET
    estado_whatsapp = 'respondida',
    respuesta_padre = p_response_text,
    fecha_respuesta = now(),
    updated_at = now()
  WHERE id = v_target_notif_id
  RETURNING row_to_json(notificaciones_caja.*) INTO v_result;

  RETURN json_build_object('success', true, 'notificacion', v_result);
END
$function$;

-- Función: fn_hermes_reintentar_mensaje
CREATE OR REPLACE FUNCTION public.fn_hermes_reintentar_mensaje(p_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_id uuid;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' AND NOT COALESCE(public.es_admin(), false) THEN
    RAISE EXCEPTION 'No autorizado para reintentar mensajes de WhatsApp';
  END IF;
  UPDATE public.hermes_whatsapp_queue
  SET estado = 'pendiente', intentos = 0, error_msg = NULL
  WHERE id = p_id AND estado = 'fallido'
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$function$;

-- Función: fn_hermes_resolver_caso
CREATE OR REPLACE FUNCTION public.fn_hermes_resolver_caso(p_case_id uuid, p_decision text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_case public.hermes_process_cases%ROWTYPE;
  v_user_dept_match boolean;
  v_new_status text;
  v_updated public.hermes_process_cases%ROWTYPE;
BEGIN
  IF p_decision NOT IN ('approve', 'reject') THEN
    RAISE EXCEPTION 'p_decision inválido: % (esperado approve|reject)', p_decision
      USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_case
  FROM public.hermes_process_cases
  WHERE id = p_case_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'hermes_process_case % not found', p_case_id
      USING ERRCODE = 'P0002';
  END IF;

  IF v_case.status <> 'open' THEN
    RAISE EXCEPTION 'caso % no está en estado open (status actual: %)', p_case_id, v_case.status
      USING ERRCODE = '42501';
  END IF;

  IF v_case.owner_department IS NULL THEN
    RAISE EXCEPTION 'caso % sin owner_department asignado — requiere asignación manual antes de poder resolverse', p_case_id
      USING ERRCODE = '42501';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.usuario_departamentos ud
    JOIN public.departamentos d ON d.id = ud.departamento_id
    WHERE ud.user_id = auth.uid()
      AND upper(d.codigo) = upper(v_case.owner_department)
  ) INTO v_user_dept_match;

  IF NOT v_user_dept_match THEN
    RAISE EXCEPTION 'usuario % no autorizado para resolver caso % (owner_department: %)', auth.uid(), p_case_id, v_case.owner_department
      USING ERRCODE = '42501';
  END IF;

  v_new_status := CASE p_decision
    WHEN 'approve' THEN 'closed'
    WHEN 'reject' THEN 'cancelled'
  END;

  UPDATE public.hermes_process_cases
  SET
    status = v_new_status,
    closure_summary = format(
      '%s por departamento %s — usuario %s — %s',
      CASE p_decision WHEN 'approve' THEN 'Aprobado' ELSE 'Rechazado' END,
      upper(v_case.owner_department),
      auth.uid(),
      to_char(now(), 'YYYY-MM-DD HH24:MI:SS TZ')
    ),
    closed_at = now(),
    updated_at = now()
  WHERE id = p_case_id
    AND status = 'open'
  RETURNING * INTO v_updated;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'caso % fue modificado concurrentemente — resolución abortada', p_case_id
      USING ERRCODE = '40001';
  END IF;

  RETURN jsonb_build_object(
    'case_id', p_case_id,
    'status', v_updated.status,
    'closure_summary', v_updated.closure_summary,
    'updated_at', v_updated.updated_at
  );
END;
$function$;

-- Función: fn_hermes_rules_update_updated_at
CREATE OR REPLACE FUNCTION public.fn_hermes_rules_update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;

-- Función: fn_hermes_start_process_case
CREATE OR REPLACE FUNCTION public.fn_hermes_start_process_case(p_process_code text, p_title text DEFAULT NULL::text, p_description text DEFAULT NULL::text, p_source text DEFAULT 'manual'::text, p_priority text DEFAULT 'media'::text, p_requested_by uuid DEFAULT NULL::uuid, p_requested_by_name text DEFAULT NULL::text, p_entity_type text DEFAULT NULL::text, p_entity_id uuid DEFAULT NULL::uuid, p_entity_label text DEFAULT NULL::text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_contract public.soi_process_contracts%ROWTYPE;
  v_case_id uuid := gen_random_uuid();
  v_task jsonb;
  v_department text;
  v_priority text;
BEGIN
  SELECT * INTO v_contract
  FROM public.soi_process_contracts
  WHERE process_code = p_process_code
    AND active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'process contract % does not exist or is inactive', p_process_code;
  END IF;

  IF p_source NOT IN ('manual', 'event', 'scheduled', 'data_driven', 'conversation') THEN
    RAISE EXCEPTION 'invalid process case source: %', p_source;
  END IF;

  IF p_priority NOT IN ('baja', 'media', 'alta', 'critica') THEN
    RAISE EXCEPTION 'invalid process case priority: %', p_priority;
  END IF;

  IF p_entity_type IS NOT NULL AND p_entity_type NOT IN ('alumno','maestro','postulante','representante','instrumento','evento','otro') THEN
    RAISE EXCEPTION 'invalid process case entity_type: %', p_entity_type;
  END IF;

  INSERT INTO public.hermes_process_cases (
    id, process_code, title, description, source, status, priority,
    requested_by, requested_by_name, owner_department, entity_type, entity_id,
    entity_label, required_evidence_snapshot, closure_criteria_snapshot, metadata
  ) VALUES (
    v_case_id, v_contract.process_code, coalesce(p_title, v_contract.process_name),
    p_description, p_source, 'open', p_priority, p_requested_by, p_requested_by_name,
    v_contract.department_owner, p_entity_type, p_entity_id, p_entity_label,
    v_contract.required_evidence, v_contract.closure_criteria, coalesce(p_metadata, '{}'::jsonb)
  );

  FOR v_task IN SELECT * FROM jsonb_array_elements(v_contract.task_templates)
  LOOP
    v_department := v_task->>'department';
    v_priority := coalesce(v_task->>'priority', p_priority, 'media');

    IF v_department IS NULL OR length(trim(v_department)) = 0 THEN
      RAISE EXCEPTION 'task template for process % is missing department', p_process_code;
    END IF;

    INSERT INTO public.tareas_institucionales (
      titulo, descripcion, departamento, estado, prioridad, fecha_vencimiento,
      checklist, process_code, correlation_id, entidad_tipo, entidad_id,
      entidad_label, updated_by, updated_by_nombre
    ) VALUES (
      coalesce(v_task->>'title', v_task->>'titulo', v_contract.process_name),
      coalesce(v_task->>'description', v_task->>'descripcion', p_description),
      v_department::public.soi_departamento,
      'pendiente',
      v_priority::public.tarea_institucional_prioridad,
      CASE
        WHEN v_task ? 'due_in_days'
          THEN (now()::date + ((v_task->>'due_in_days')::integer || ' days')::interval)::date
        WHEN v_task ? 'diferencia_dias'
          THEN (now()::date + ((v_task->>'diferencia_dias')::integer || ' days')::interval)::date
        ELSE NULL
      END,
      coalesce(v_task->'checklist', '[]'::jsonb),
      v_contract.process_code, v_case_id, p_entity_type, p_entity_id, p_entity_label,
      p_requested_by, p_requested_by_name
    );
  END LOOP;

  UPDATE public.soi_process_contracts
  SET recurrence_count = recurrence_count + 1, updated_at = now()
  WHERE process_code = v_contract.process_code;

  RETURN v_case_id;
END;
$function$;

-- Función: fn_hermes_tarea_completada_feedback
CREATE OR REPLACE FUNCTION public.fn_hermes_tarea_completada_feedback()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_source_event RECORD;
  v_rule_type text := 'GENERAL';
  v_horas_resolucion numeric(6, 2) := 0.00;
BEGIN
  -- Solo actuar si cambia a completada
  IF (OLD.estado IS DISTINCT FROM 'completada' AND NEW.estado = 'completada') THEN

    -- 1. Emitir evento tarea.completada en soi_eventos si no existe ya para esta transición
    INSERT INTO public.soi_eventos (
      tipo,
      entidad_tipo,
      entidad_id,
      payload,
      correlation_id,
      procesado
    ) VALUES (
      'tarea.completada',
      'tarea',
      NEW.id,
      jsonb_build_object(
        'tarea_id', NEW.id,
        'texto', NEW.titulo,
        'departamento', NEW.departamento,
        'source_event_id', NEW.source_event_id,
        'completada_at', now()
      ),
      NEW.correlation_id,
      true
    );

    -- 2. Correlacionar con la regla que originó la tarea
    IF NEW.source_event_id IS NOT NULL THEN
      SELECT tipo INTO v_source_event FROM public.soi_eventos WHERE id = NEW.source_event_id;

      IF v_source_event.tipo = 'asistencia.falta_injustificada' THEN
        v_rule_type := 'R1';
      ELSIF v_source_event.tipo = 'tarea.vencida' THEN
        v_rule_type := 'R2';
      ELSIF v_source_event.tipo = 'periodo.cerrado' THEN
        v_rule_type := 'R3';
      ELSIF v_source_event.tipo = 'sesion.creada' THEN
        v_rule_type := 'R4';
      ELSIF v_source_event.tipo = 'justificacion.rechazada' THEN
        v_rule_type := 'R5';
      ELSIF v_source_event.tipo = 'notificacion.whatsapp_padres' THEN
        v_rule_type := 'R6';
      END IF;

      -- Calcular horas de resolución
      IF NEW.created_at IS NOT NULL THEN
        v_horas_resolucion := ROUND(EXTRACT(EPOCH FROM (now() - NEW.created_at)) / 3600.0, 2);
      END IF;

      -- Actualizar efectividad de la regla
      UPDATE public.soi_rule_effectiveness
      SET
        casos_resueltos = casos_resueltos + 1,
        total_activaciones = GREATEST(total_activaciones, casos_resueltos + 1),
        tasa_exito = ROUND((casos_resueltos::numeric / GREATEST(1, total_activaciones)::numeric) * 100.0, 2),
        tiempo_promedio_horas = CASE
          WHEN tiempo_promedio_horas > 0 THEN ROUND((tiempo_promedio_horas + v_horas_resolucion) / 2.0, 2)
          ELSE v_horas_resolucion
        END,
        updated_at = now()
      WHERE rule_type = v_rule_type;
    END IF;

  END IF;

  RETURN NEW;
END;
$function$;

-- Función: fn_hermes_update_notif
CREATE OR REPLACE FUNCTION public.fn_hermes_update_notif(p_id uuid, p_estado_wa text, p_respuesta text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF p_estado_wa NOT IN ('enviada', 'leida', 'respondida', 'fallida') THEN
    RAISE EXCEPTION 'Invalid estado_wa: %. Must be one of: enviada, leida, respondida, fallida',
      p_estado_wa;
  END IF;

  UPDATE public.notificaciones_caja
  SET
    estado_whatsapp = p_estado_wa::notif_estado_wa,
    respuesta_padre = CASE WHEN p_respuesta IS NOT NULL THEN p_respuesta ELSE respuesta_padre END,
    fecha_respuesta = CASE WHEN p_respuesta IS NOT NULL THEN now() ELSE fecha_respuesta END,
    updated_at      = now()
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Notification % not found', p_id;
  END IF;
END;
$function$;

-- Función: fn_historial_activo
CREATE OR REPLACE FUNCTION public.fn_historial_activo()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.inventario_historial (activo_id, tipo_evento, descripcion, usuario_id, metadata)
    VALUES (
      NEW.id,
      'creacion',
      'Instrumento creado: ' || COALESCE(NEW.tipo_instrumento, 'sin tipo') || ' - ' || COALESCE(NEW.codigo_inventario, ''),
      NULL,
      jsonb_build_object(
        'tipo_instrumento', NEW.tipo_instrumento,
        'codigo_inventario', NEW.codigo_inventario,
        'estado_uso', NEW.estado_uso,
        'estado_conservacion', NEW.estado_conservacion
      )
    );
  ELSIF TG_OP = 'UPDATE' AND (
    OLD.estado_uso IS DISTINCT FROM NEW.estado_uso OR
    OLD.estado_conservacion IS DISTINCT FROM NEW.estado_conservacion
  ) THEN
    INSERT INTO public.inventario_historial (activo_id, tipo_evento, descripcion, usuario_id, metadata)
    VALUES (
      NEW.id,
      'cambio_estado',
      CASE
        WHEN OLD.estado_uso IS DISTINCT FROM NEW.estado_uso
          THEN 'Cambio de estado_uso: ' || COALESCE(OLD.estado_uso, '?') || ' → ' || COALESCE(NEW.estado_uso, '?')
        WHEN OLD.estado_conservacion IS DISTINCT FROM NEW.estado_conservacion
          THEN 'Cambio de estado_conservacion: ' || COALESCE(OLD.estado_conservacion, '?') || ' → ' || COALESCE(NEW.estado_conservacion, '?')
        ELSE 'Cambio de estado'
      END,
      NULL,
      jsonb_build_object(
        'estado_uso_anterior', OLD.estado_uso,
        'estado_uso_nuevo', NEW.estado_uso,
        'estado_conservacion_anterior', OLD.estado_conservacion,
        'estado_conservacion_nuevo', NEW.estado_conservacion
      )
    );

    IF NEW.estado_uso = 'de_baja' AND OLD.estado_uso IS DISTINCT FROM 'de_baja' THEN
      UPDATE public.inventario_activos
         SET fecha_baja = CURRENT_DATE,
             motivo_baja = COALESCE(NEW.notas, 'Sin motivo especificado')
       WHERE id = NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Función: fn_historial_comodato
CREATE OR REPLACE FUNCTION public.fn_historial_comodato()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.estado = 'activo' THEN
    INSERT INTO public.inventario_historial (activo_id, tipo_evento, descripcion, usuario_id, metadata)
    VALUES (
      NEW.activo_id,
      'asignacion',
      'Instrumento asignado en comodato',
      NEW.registrado_por,
      jsonb_build_object(
        'comodato_id', NEW.id,
        'alumno_id', NEW.alumno_id,
        'fecha_entrega', NEW.fecha_entrega
      )
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.estado = 'activo' AND NEW.estado = 'devuelto' THEN
    INSERT INTO public.inventario_historial (activo_id, tipo_evento, descripcion, usuario_id, metadata)
    VALUES (
      NEW.activo_id,
      'devolucion',
      'Instrumento devuelto de comodato',
      NEW.registrado_por,
      jsonb_build_object(
        'comodato_id', NEW.id,
        'alumno_id', NEW.alumno_id,
        'fecha_devolucion', NEW.fecha_devolucion
      )
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- Función: fn_historial_reparacion
CREATE OR REPLACE FUNCTION public.fn_historial_reparacion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.inventario_historial (activo_id, tipo_evento, descripcion, metadata)
    VALUES (
      NEW.activo_id,
      'reparacion',
      'Reparación iniciada: ' || LEFT(NEW.descripcion, 100),
      jsonb_build_object(
        'reparacion_id', NEW.id,
        'tipo_tallerista', NEW.tipo_tallerista,
        'tallerista_nombre', NEW.tallerista_nombre,
        'estado', NEW.estado
      )
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.estado IS DISTINCT FROM NEW.estado THEN
    INSERT INTO public.inventario_historial (activo_id, tipo_evento, descripcion, metadata)
    VALUES (
      NEW.activo_id,
      'reparacion',
      'Reparación cambió a estado: ' || NEW.estado,
      jsonb_build_object(
        'reparacion_id', NEW.id,
        'estado_anterior', OLD.estado,
        'estado_nuevo', NEW.estado
      )
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- Función: fn_listar_protocolos
CREATE OR REPLACE FUNCTION public.fn_listar_protocolos()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_protocolos json;
BEGIN
  SELECT json_agg(row_to_json(p)) INTO v_protocolos
  FROM public.protocolos p
  WHERE activo = true
  ORDER BY tipo ASC;

  RETURN json_build_object('success', true, 'protocolos', COALESCE(v_protocolos, '[]'));
END
$function$;

-- Función: fn_lookup_maestro_contacto
CREATE OR REPLACE FUNCTION public.fn_lookup_maestro_contacto(p_nombre text, p_secret text)
 RETURNS TABLE(maestro_nombre text, jid text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_secret text;
begin
  select value into v_secret from public.system_config where key = 'hermes_internal_lookup_secret';
  if v_secret is null or p_secret is null or p_secret <> v_secret then
    raise exception 'unauthorized';
  end if;

  if p_nombre is null or length(trim(p_nombre)) < 3 then
    raise exception 'nombre too short';
  end if;

  return query
  select
    m.nombre_completo,
    regexp_replace(m.tlf, '\D', '', 'g') || '@s.whatsapp.net'
  from public.maestros m
  where m.activo = true
    and m.nombre_completo ilike '%' || p_nombre || '%'
    and m.tlf is not null
  order by m.nombre_completo
  limit 5;
end;
$function$;

-- Función: fn_lookup_representante_contacto
CREATE OR REPLACE FUNCTION public.fn_lookup_representante_contacto(p_nombre text, p_secret text)
 RETURNS TABLE(alumno_nombre text, representante_nombre text, jid text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_secret text;
begin
  select value into v_secret from public.system_config where key = 'hermes_internal_lookup_secret';

  if v_secret is null or p_secret is null or p_secret <> v_secret then
    raise exception 'unauthorized';
  end if;

  if p_nombre is null or length(trim(p_nombre)) < 3 then
    raise exception 'nombre too short';
  end if;

  return query
  select
    a.nombre_completo,
    coalesce(a.representante_nombre, a.madre_nombre, a.padre_nombre, 'Representante'),
    regexp_replace(coalesce(a.representante_tlf, a.madre_tlf_whatsapp, a.padre_tlf_whatsapp, ''), '\D', '', 'g') || '@s.whatsapp.net'
  from public.alumnos a
  where a.activo = true
    and a.nombre_completo ilike '%' || p_nombre || '%'
    and coalesce(a.representante_tlf, a.madre_tlf_whatsapp, a.padre_tlf_whatsapp) is not null
  order by a.nombre_completo
  limit 5;
end;
$function$;

-- Función: fn_lut_diagnosticos_recalc_costo
CREATE OR REPLACE FUNCTION public.fn_lut_diagnosticos_recalc_costo()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.costo_mano_obra := COALESCE((
    SELECT SUM((item->>'costo_dop')::numeric)
    FROM jsonb_array_elements(NEW.items) AS item
    WHERE item->>'costo_dop' IS NOT NULL
  ), 0);
  RETURN NEW;
END;
$function$;

-- Función: fn_lut_upsert_diagnostico
CREATE OR REPLACE FUNCTION public.fn_lut_upsert_diagnostico(p_orden_id uuid, p_diagnostico_tecnico text, p_items jsonb, p_causa_probable text DEFAULT NULL::text, p_tipo_dano text DEFAULT NULL::text, p_gravedad text DEFAULT NULL::text, p_zona_afectada text DEFAULT NULL::text, p_reparacion_recomendada text DEFAULT NULL::text, p_materiales_requeridos text DEFAULT NULL::text, p_tiempo_estimado_horas numeric DEFAULT NULL::numeric, p_costo_materiales numeric DEFAULT NULL::numeric, p_requiere_servicio_externo boolean DEFAULT false, p_observaciones text DEFAULT NULL::text, p_diagnosticado_por uuid DEFAULT NULL::uuid, p_diagnosticado_por_nombre text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_id uuid;
  v_total numeric;
BEGIN
  v_total := COALESCE((
    SELECT SUM((item->>'costo_dop')::numeric)
    FROM jsonb_array_elements(p_items) AS item
    WHERE item->>'costo_dop' IS NOT NULL
  ), 0);

  INSERT INTO public.lut_diagnosticos (
    orden_id, diagnostico_tecnico, items,
    causa_probable, tipo_dano, gravedad, zona_afectada,
    reparacion_recomendada, materiales_requeridos,
    tiempo_estimado_horas, costo_mano_obra, costo_materiales,
    requiere_servicio_externo, observaciones,
    diagnosticado_por, diagnosticado_por_nombre
  ) VALUES (
    p_orden_id, p_diagnostico_tecnico, p_items,
    p_causa_probable, p_tipo_dano, p_gravedad, p_zona_afectada,
    p_reparacion_recomendada, p_materiales_requeridos,
    p_tiempo_estimado_horas, v_total, p_costo_materiales,
    COALESCE(p_requiere_servicio_externo, false), p_observaciones,
    p_diagnosticado_por, p_diagnosticado_por_nombre
  )
  ON CONFLICT (orden_id) DO UPDATE SET
    diagnostico_tecnico = EXCLUDED.diagnostico_tecnico,
    items = EXCLUDED.items,
    causa_probable = EXCLUDED.causa_probable,
    tipo_dano = EXCLUDED.tipo_dano,
    gravedad = EXCLUDED.gravedad,
    zona_afectada = EXCLUDED.zona_afectada,
    reparacion_recomendada = EXCLUDED.reparacion_recomendada,
    materiales_requeridos = EXCLUDED.materiales_requeridos,
    tiempo_estimado_horas = EXCLUDED.tiempo_estimado_horas,
    costo_materiales = EXCLUDED.costo_materiales,
    requiere_servicio_externo = EXCLUDED.requiere_servicio_externo,
    observaciones = EXCLUDED.observaciones,
    costo_mano_obra = EXCLUDED.costo_mano_obra
  RETURNING id INTO v_id;

  UPDATE public.lut_ordenes_reparacion
  SET costo_estimado = v_total + COALESCE(p_costo_materiales, 0)
  WHERE id = p_orden_id;

  RETURN v_id;
END;
$function$;

-- Función: fn_maestros_asistencia_pendiente
CREATE OR REPLACE FUNCTION public.fn_maestros_asistencia_pendiente(p_secret text)
 RETURNS TABLE(maestro_nombre text, clase_nombre text, fecha date)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_secret text;
begin
  select value into v_secret from public.system_config where key = 'hermes_internal_lookup_secret';
  if v_secret is null or p_secret is null or p_secret <> v_secret then
    raise exception 'unauthorized';
  end if;

  return query
  select distinct
    m.nombre_completo,
    c.nombre,
    sc.fecha
  from public.sesiones_clase sc
  join public.maestros m on m.id = sc.maestro_id
  join public.clases c on c.id = sc.clase_id
  where sc.cerrada_en is null
    and sc.fecha >= current_date - interval '7 days'
    and sc.fecha <= current_date
    and m.activo = true
    and m.tlf is not null
  order by sc.fecha, m.nombre_completo
  limit 200;
end;
$function$;

-- Función: fn_marcar_asistencia
CREATE OR REPLACE FUNCTION public.fn_marcar_asistencia(p_alumno text, p_clase text, p_fecha date, p_nuevo_estado text, p_secret text)
 RETURNS TABLE(alumno_nombre text, clase_nombre text, fecha date, estado_anterior text, estado_nuevo text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_secret text;
  v_row_id uuid;
  v_alumno_nombre text;
  v_clase_nombre text;
  v_anterior text;
  v_match_count int;
begin
  select value into v_secret from public.system_config where key = 'hermes_internal_lookup_secret';
  if v_secret is null or p_secret is null or p_secret <> v_secret then
    raise exception 'unauthorized';
  end if;

  if p_nuevo_estado not in ('presente','ausente','justificado') then
    raise exception 'estado inválido: %', p_nuevo_estado;
  end if;

  select count(*) into v_match_count
  from public.asistencias a
  join public.alumnos al on al.id = a.alumno_id
  join public.clases c on c.id = a.clase_id
  where al.nombre_completo ilike '%' || p_alumno || '%'
    and c.nombre ilike '%' || p_clase || '%'
    and a.fecha = p_fecha;

  if v_match_count = 0 then
    raise exception 'no encontré un registro de asistencia para % en % el %', p_alumno, p_clase, p_fecha;
  end if;
  if v_match_count > 1 then
    raise exception 'hay % registros de asistencia que coinciden con % / % / % — especificá más', v_match_count, p_alumno, p_clase, p_fecha;
  end if;

  select a.id, al.nombre_completo, c.nombre, a.estado
  into v_row_id, v_alumno_nombre, v_clase_nombre, v_anterior
  from public.asistencias a
  join public.alumnos al on al.id = a.alumno_id
  join public.clases c on c.id = a.clase_id
  where al.nombre_completo ilike '%' || p_alumno || '%'
    and c.nombre ilike '%' || p_clase || '%'
    and a.fecha = p_fecha;

  update public.asistencias set estado = p_nuevo_estado, updated_at = now() where id = v_row_id;

  return query select v_alumno_nombre, v_clase_nombre, p_fecha, v_anterior, p_nuevo_estado;
end;
$function$;

-- Función: fn_morning_admissions_briefing
CREATE OR REPLACE FUNCTION public.fn_morning_admissions_briefing()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    today_start timestamptz := date_trunc('day', now() AT TIME ZONE 'America/Santo_Domingo') AT TIME ZONE 'America/Santo_Domingo';
    today_end   timestamptz := today_start + interval '1 day';
    r RECORD;
    agenda_text text := '';
    total_count integer := 0;
    coordinator_jid text;
BEGIN
    FOR r IN (
        SELECT
            app.full_name,
            app.phone_number,
            to_char(apt.scheduled_datetime AT TIME ZONE 'America/Santo_Domingo', 'HH12:MI AM') as hora
        FROM public.appointments apt
        JOIN public.applicants app ON apt.applicant_id = app.id
        WHERE apt.status = 'CONFIRMED'
          AND apt.scheduled_datetime >= today_start
          AND apt.scheduled_datetime < today_end
        ORDER BY apt.scheduled_datetime ASC
    ) LOOP
        total_count := total_count + 1;
        agenda_text := agenda_text || chr(10) || '• ' || r.hora || ' - ' || r.full_name || ' (Tel: ' || r.phone_number || ')';
    END LOOP;

    IF total_count > 0 THEN
        agenda_text := '📋 *AGENDA DE ENTREVISTAS DE HOY (' || to_char(today_start, 'DD/MM/YYYY') || ')*' || chr(10) ||
                       'Total citados: ' || total_count || chr(10) || agenda_text || chr(10) || chr(10) ||
                       '¡Éxitos en la jornada de inscripciones!';
    ELSE
        agenda_text := '📋 *AGENDA DE ENTREVISTAS DE HOY (' || to_char(today_start, 'DD/MM/YYYY') || ')*' || chr(10) ||
                       'No hay citas agendadas para el día de hoy.';
    END IF;

    SELECT value INTO coordinator_jid FROM public.system_config WHERE key = 'admission_coordinator_jid' LIMIT 1;

    IF coordinator_jid IS NOT NULL AND coordinator_jid <> '' THEN
        INSERT INTO public.hermes_whatsapp_queue (jid, mensaje, estado)
        VALUES (coordinator_jid, agenda_text, 'pendiente');
    END IF;

    RETURN agenda_text;
END;
$function$;

-- Función: fn_notify_maestro_ausencia
CREATE OR REPLACE FUNCTION public.fn_notify_maestro_ausencia()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_maestro_nombre TEXT;
BEGIN
  -- Get maestro name
  SELECT nombre_completo INTO v_maestro_nombre
  FROM maestros
  WHERE id = NEW.maestro_id;

  -- Update ausencias to mark as notified
  UPDATE ausencias
  SET notificacion_enviada = true, estado = 'notificado', updated_at = NOW()
  WHERE id = NEW.id;

  -- Log: In production, this would send email/webhook
  RAISE NOTICE 'Absence notification: Maestro % absent on %',
    v_maestro_nombre, NEW.fecha_ausencia;

  RETURN NEW;
END;
$function$;

-- Función: fn_observar_tarea
CREATE OR REPLACE FUNCTION public.fn_observar_tarea(p_tarea_id uuid, p_comentario text, p_actor_id uuid, p_actor_nombre text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_comentario IS NULL OR length(trim(p_comentario)) = 0 THEN
    RAISE EXCEPTION 'observar requiere comentario';
  END IF;
  INSERT INTO public.tarea_comentarios (tarea_id, autor_id, autor_nombre, cuerpo)
    VALUES (p_tarea_id, p_actor_id, p_actor_nombre, p_comentario);
  UPDATE public.tareas_institucionales
    SET estado = 'observada', updated_by = p_actor_id, updated_by_nombre = p_actor_nombre, updated_at = now()
    WHERE id = p_tarea_id;
END $function$;

-- Función: fn_obtener_eventos_proximos
CREATE OR REPLACE FUNCTION public.fn_obtener_eventos_proximos(p_dias_desde integer DEFAULT 0, p_dias_hasta integer DEFAULT 30)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_eventos json;
BEGIN
  IF get_user_role() != 'admin' THEN
    RETURN json_build_object('error', 'Solo admin puede consultar todos los eventos');
  END IF;

  SELECT json_agg(row_to_json(e)) INTO v_eventos
  FROM public.calendario e
  WHERE e.fecha_inicio BETWEEN (CURRENT_DATE + p_dias_desde) AND (CURRENT_DATE + p_dias_hasta)
    AND e.estado = 'planificado'
  ORDER BY e.fecha_inicio ASC;

  RETURN json_build_object(
    'success', true,
    'eventos', COALESCE(v_eventos, '[]'),
    'cantidad', (SELECT COUNT(*) FROM public.calendario WHERE fecha_inicio BETWEEN (CURRENT_DATE + p_dias_desde) AND (CURRENT_DATE + p_dias_hasta))
  );
END
$function$;

-- Función: fn_obtener_protocolo
CREATE OR REPLACE FUNCTION public.fn_obtener_protocolo(p_tipo text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_protocolo record;
BEGIN
  SELECT * INTO v_protocolo FROM public.protocolos
  WHERE tipo = p_tipo AND activo = true
  LIMIT 1;

  IF v_protocolo IS NULL THEN
    RETURN json_build_object('error', 'Protocolo no encontrado para tipo: ' || p_tipo);
  END IF;

  RETURN json_build_object(
    'success', true,
    'protocolo', row_to_json(v_protocolo)
  );
END
$function$;

-- Función: fn_obtener_tareas_departamento
CREATE OR REPLACE FUNCTION public.fn_obtener_tareas_departamento(p_departamento_id uuid DEFAULT NULL::uuid, p_estado text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_tareas json;
  v_dept_id uuid;
BEGIN
  -- Si no específica departamento, usar el del usuario
  IF p_departamento_id IS NULL THEN
    SELECT departamento_id INTO v_dept_id
    FROM public.usuario_departamentos
    WHERE user_id = auth.uid()
    LIMIT 1;
  ELSE
    v_dept_id := p_departamento_id;
  END IF;

  -- Verificar acceso
  IF NOT EXISTS(
    SELECT 1 FROM public.usuario_departamentos
    WHERE user_id = auth.uid() AND departamento_id = v_dept_id
  ) AND get_user_role() != 'admin' THEN
    RETURN json_build_object('error', 'No tiene acceso a este departamento');
  END IF;

  -- Obtener tareas
  SELECT json_agg(row_to_json(t)) INTO v_tareas
  FROM public.tareas_calendario t
  JOIN public.calendario e ON t.evento_id = e.id
  WHERE t.departamento_id = v_dept_id
    AND (p_estado IS NULL OR t.estado = p_estado)
  ORDER BY t.fecha_vencimiento ASC;

  RETURN json_build_object(
    'success', true,
    'tareas', COALESCE(v_tareas, '[]'),
    'cantidad', (SELECT COUNT(*) FROM public.tareas_calendario WHERE departamento_id = v_dept_id AND (p_estado IS NULL OR estado = p_estado))
  );
END
$function$;

-- Función: fn_periodo_vigente
CREATE OR REPLACE FUNCTION public.fn_periodo_vigente(p_fecha date DEFAULT CURRENT_DATE)
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT id
  FROM public.periodos
  WHERE p_fecha BETWEEN fecha_inicio AND fecha_fin
  ORDER BY activo DESC, fecha_inicio DESC
  LIMIT 1;
$function$;

-- Función: fn_portal_maestro_bloqueado
CREATE OR REPLACE FUNCTION public.fn_portal_maestro_bloqueado()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT NOT public.fn_es_dia_lectivo(
    (now() AT TIME ZONE 'America/Santo_Domingo')::date
  );
$function$;

-- Función: fn_prevent_periodo_reopen
CREATE OR REPLACE FUNCTION public.fn_prevent_periodo_reopen()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if old.cerrado and not new.cerrado then
    raise exception 'No se puede reabrir un período académico ya cerrado. Usa la RPC fn_cerrar_periodo_academico para cerrar.';
  end if;
  return new;
end;
$function$;

-- Función: fn_preview_campania
CREATE OR REPLACE FUNCTION public.fn_preview_campania(p_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE c public.campanias_periodo; v json;
BEGIN
  IF NOT es_admin() THEN RAISE EXCEPTION 'no autorizado'; END IF;
  SELECT * INTO c FROM public.campanias_periodo WHERE id = p_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'campania no encontrada'; END IF;

  IF c.accion = 'inscripcion' THEN
    WITH cand AS (
      SELECT p.id,
        CASE WHEN p.estado IN ('pendiente','postulado','contactado','en_espera') THEN 'primer_contacto'
             WHEN p.estado IN ('no_show','reprogramado') THEN 'recuperacion' END AS segmento,
        coalesce(nullif(normalize_phone(p.madre_tlf_whatsapp),''),
                 nullif(normalize_phone(p.padre_tlf_whatsapp),''),
                 nullif(normalize_phone(p.telefono_alumno),'')) AS jid
      FROM public.postulantes p
      WHERE p.estado IN ('pendiente','postulado','contactado','en_espera','no_show','reprogramado')
        AND ((c.tipo='A' AND extract(month FROM p.fecha_postulacion) BETWEEN 1 AND 6)
          OR (c.tipo='B' AND extract(month FROM p.fecha_postulacion) BETWEEN 7 AND 12))
    )
    SELECT json_build_object(
      'accion','inscripcion',
      'primer_contacto', count(DISTINCT jid) FILTER (WHERE segmento='primer_contacto' AND jid IS NOT NULL),
      'recuperacion', count(DISTINCT jid) FILTER (WHERE segmento='recuperacion' AND jid IS NOT NULL),
      'sin_telefono', count(*) FILTER (WHERE jid IS NULL),
      'cupo_disponible', (SELECT coalesce(sum(disponible),0) FROM public.vw_cupos_iniciacion),
      'cupo_total', (SELECT coalesce(sum(capacidad_maxima),0) FROM public.vw_cupos_iniciacion)
    ) INTO v FROM cand;
  ELSE
    WITH cand AS (
      SELECT a.id,
        coalesce(nullif(normalize_phone(a.madre_tlf_whatsapp),''),
                 nullif(normalize_phone(a.padre_tlf_whatsapp),''),
                 nullif(normalize_phone(a.representante_tlf),''),
                 nullif(normalize_phone(a.tlf_alumno),'')) AS jid
      FROM public.alumnos a WHERE a.activo = true
    )
    SELECT json_build_object(
      'accion','reinscripcion',
      'reinscripcion', count(DISTINCT jid) FILTER (WHERE jid IS NOT NULL),
      'sin_telefono', count(*) FILTER (WHERE jid IS NULL)
    ) INTO v FROM cand;
  END IF;
  RETURN v;
END $function$;

-- Función: fn_procedimientos_resumen
CREATE OR REPLACE FUNCTION public.fn_procedimientos_resumen()
 RETURNS TABLE(correlation_id uuid, titulo_muestra text, total integer, completadas integer, pendientes integer, en_progreso integer, bloqueadas integer, observadas integer, canceladas integer, pct_avance integer, departamentos text[], prioridad_max text, ultima_actividad timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    t.correlation_id,
    (array_agg(t.titulo ORDER BY t.created_at))[1] AS titulo_muestra,
    count(*)::int AS total,
    count(*) FILTER (WHERE t.estado = 'completada')::int AS completadas,
    count(*) FILTER (WHERE t.estado = 'pendiente')::int AS pendientes,
    count(*) FILTER (WHERE t.estado = 'en_progreso')::int AS en_progreso,
    count(*) FILTER (WHERE t.estado = 'bloqueada')::int AS bloqueadas,
    count(*) FILTER (WHERE t.estado = 'observada')::int AS observadas,
    count(*) FILTER (WHERE t.estado = 'cancelada')::int AS canceladas,
    CASE WHEN count(*) FILTER (WHERE t.estado <> 'cancelada') = 0 THEN 0
      ELSE round(100.0 * count(*) FILTER (WHERE t.estado = 'completada')
        / count(*) FILTER (WHERE t.estado <> 'cancelada'))::int END AS pct_avance,
    array_agg(DISTINCT t.departamento::text) AS departamentos,
    (array_agg(t.prioridad::text ORDER BY
      CASE t.prioridad::text WHEN 'critica' THEN 0 WHEN 'alta' THEN 1 WHEN 'media' THEN 2 ELSE 3 END))[1] AS prioridad_max,
    max(t.updated_at) AS ultima_actividad
  FROM public.tareas_institucionales t
  GROUP BY t.correlation_id
  ORDER BY max(t.updated_at) DESC;
$function$;

-- Función: fn_racha_ausencias
CREATE OR REPLACE FUNCTION public.fn_racha_ausencias(p_alumno_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  v_racha int := 0;
  v_fila  record;
BEGIN
  FOR v_fila IN
    SELECT estado
    FROM asistencias
    WHERE alumno_id = p_alumno_id
    ORDER BY fecha DESC
  LOOP
    IF v_fila.estado = 'A' THEN
      v_racha := v_racha + 1;
    ELSE
      EXIT;
    END IF;
  END LOOP;
  RETURN v_racha;
END;
$function$;

-- Función: fn_reactivar_alumno
CREATE OR REPLACE FUNCTION public.fn_reactivar_alumno(p_alumno_id uuid, p_usuario_id uuid DEFAULT NULL::uuid, p_nueva_familia_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_alumno RECORD;
  v_familia_efectiva uuid;
  v_deuda_alumno bigint := 0;
  v_deuda_familia bigint := 0;
  v_deuda_total bigint := 0;
BEGIN
  SELECT id, nombre_completo, activo, estado_academico, familia_id, bloqueo_reinscripcion
    INTO v_alumno FROM public.alumnos WHERE id = p_alumno_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'El alumno con ID % no existe.', p_alumno_id;
  END IF;

  IF v_alumno.activo IS TRUE THEN
    RAISE EXCEPTION 'El alumno % ya esta activo; no requiere reactivacion.', v_alumno.nombre_completo;
  END IF;

  v_familia_efectiva := COALESCE(p_nueva_familia_id, v_alumno.familia_id);

  v_deuda_alumno := public.fn_deuda_viva(p_alumno_id, NULL);
  v_deuda_familia := public.fn_deuda_viva(NULL, v_familia_efectiva);
  IF p_nueva_familia_id IS NOT NULL AND v_alumno.familia_id IS DISTINCT FROM p_nueva_familia_id THEN
    v_deuda_familia := v_deuda_familia + public.fn_deuda_viva(NULL, v_alumno.familia_id);
  END IF;
  v_deuda_total := GREATEST(v_deuda_alumno, v_deuda_familia);

  IF v_deuda_total > 0 THEN
    RETURN jsonb_build_object(
      'success', false, 'permite_reinscripcion', false, 'accion_requerida', 'saldar_deuda',
      'deuda_centavos', v_deuda_total,
      'mensaje', 'No se puede reactivar: hay RD$ ' || to_char(v_deuda_total / 100.0, 'FM999999990.00') || ' de deuda viva pendiente.');
  END IF;

  IF v_alumno.bloqueo_reinscripcion OR v_alumno.estado_academico = 'retirado_con_deuda' THEN
    RETURN jsonb_build_object(
      'success', false, 'permite_reinscripcion', false, 'accion_requerida', 'levantar_bloqueo_manual',
      'deuda_centavos', 0,
      'mensaje', 'Sin deuda viva, pero el expediente tiene bloqueo de reinscripcion. Requiere levantamiento manual antes de reactivar.');
  END IF;

  UPDATE public.alumnos
     SET activo = true, estado_academico = 'activo', fecha_baja = NULL, motivo_baja = NULL,
         bloqueo_reinscripcion = false, deuda_pendiente_baja_centavos = 0,
         familia_id = v_familia_efectiva,
         observaciones_baja = NULLIF(TRIM(BOTH ' |' FROM COALESCE(observaciones_baja, '') || ' | Reactivado ' || CURRENT_DATE::text), ''),
         updated_at = timezone('utc'::text, now())
   WHERE id = p_alumno_id;

  INSERT INTO public.alumnos_reinscripciones (alumno_id, procesada_por, deuda_verificada_centavos, familia_anterior, familia_nueva, notas)
  VALUES (p_alumno_id, p_usuario_id, 0, v_alumno.familia_id, v_familia_efectiva, 'Reactivacion via fn_reactivar_alumno');

  RETURN jsonb_build_object(
    'success', true, 'permite_reinscripcion', true, 'accion_requerida', 'ninguna',
    'alumno_id', p_alumno_id, 'nombre_completo', v_alumno.nombre_completo,
    'familia_id', v_familia_efectiva,
    'mensaje', 'Expediente reactivado. Alumno habilitado para el ciclo vigente.');
END;
$function$;

-- Función: fn_recalcular_bloqueos_familia
CREATE OR REPLACE FUNCTION public.fn_recalcular_bloqueos_familia(p_familia_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_deuda bigint := 0;
  v_reps int := 0;
  v_alumnos int := 0;
BEGIN
  IF p_familia_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'mensaje', 'familia_id nulo.');
  END IF;

  v_deuda := public.fn_deuda_viva(NULL, p_familia_id);

  IF v_deuda > 0 THEN
    RETURN jsonb_build_object(
      'success', true, 'familia_id', p_familia_id, 'deuda_viva_centavos', v_deuda,
      'bloqueos_levantados', false,
      'mensaje', 'La familia aun registra deuda viva; los bloqueos se mantienen.');
  END IF;

  UPDATE public.representantes SET bloqueo_reinscripcion = false, motivo_bloqueo = NULL
   WHERE familia_id = p_familia_id AND bloqueo_reinscripcion = true;
  GET DIAGNOSTICS v_reps = ROW_COUNT;

  UPDATE public.alumnos
     SET bloqueo_reinscripcion = false, deuda_pendiente_baja_centavos = 0,
         estado_academico = CASE WHEN estado_academico = 'retirado_con_deuda' THEN 'retirado' ELSE estado_academico END,
         updated_at = timezone('utc'::text, now())
   WHERE familia_id = p_familia_id
     AND (bloqueo_reinscripcion = true OR estado_academico = 'retirado_con_deuda');
  GET DIAGNOSTICS v_alumnos = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true, 'familia_id', p_familia_id, 'deuda_viva_centavos', 0,
    'bloqueos_levantados', (v_reps + v_alumnos) > 0,
    'representantes_desbloqueados', v_reps, 'alumnos_desbloqueados', v_alumnos,
    'mensaje', 'Deuda saldada: bloqueos de reinscripcion de la familia levantados.');
END;
$function$;

-- Función: fn_registrar_alerta_enviada
CREATE OR REPLACE FUNCTION public.fn_registrar_alerta_enviada(p_tipo text, p_canal text, p_destinatario text, p_contenido text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.alertas_log(tipo, canal, destinatario, contenido, created_at)
  VALUES(p_tipo, p_canal, p_destinatario, p_contenido, now());

  RETURN json_build_object('success', true, 'mensaje', 'Alerta registrada');
END
$function$;

-- Función: fn_registrar_pago_transaccional
CREATE OR REPLACE FUNCTION public.fn_registrar_pago_transaccional(p_familia_id uuid, p_monto_centavos bigint, p_metodo_pago text, p_referencia text, p_notas text, p_cuota_ids uuid[], p_fecha_pago date DEFAULT CURRENT_DATE)
 RETURNS pagos
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_rol                   text;
  v_cajero_id             uuid := auth.uid();
  v_pago                  pagos;
  v_cuota                 RECORD;
  v_restante              bigint := p_monto_centavos;
  v_saldo_cuota           bigint;
  v_monto_aplicado        bigint;
  v_dias_atraso           integer;
  v_fecha_efectiva        date := COALESCE(p_fecha_pago, CURRENT_DATE);
  v_cuotas_aplicadas      uuid[] := '{}';
  v_saldo_wallet_anterior bigint;
BEGIN
  SELECT rol INTO v_rol FROM public.profiles WHERE id = v_cajero_id;
  IF v_rol IS NULL OR v_rol NOT IN ('admin', 'finanzas') THEN
    RAISE EXCEPTION 'No autorizado para registrar pagos en ventanilla';
  END IF;

  IF p_monto_centavos <= 0 THEN
    RAISE EXCEPTION 'El monto del pago debe ser mayor a cero';
  END IF;

  PERFORM 1 FROM public.familias WHERE id = p_familia_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Familia con ID % no encontrada', p_familia_id;
  END IF;

  INSERT INTO public.pagos (
    familia_id, cuota_ids, monto_centavos, metodo_pago, referencia, cajero_id, notas, fecha_pago
  )
  VALUES (
    p_familia_id, '{}', p_monto_centavos, p_metodo_pago::metodo_pago, p_referencia, v_cajero_id, p_notas, v_fecha_efectiva
  )
  RETURNING * INTO v_pago;

  FOR v_cuota IN
    SELECT c.*
    FROM public.cuotas c
    WHERE c.familia_id = p_familia_id
      AND c.estado IN ('pendiente', 'vencida', 'en_mora')
    ORDER BY (c.id = ANY(p_cuota_ids)) DESC, c.fecha_vencimiento ASC
    FOR UPDATE
  LOOP
    EXIT WHEN v_restante <= 0;

    v_saldo_cuota := v_cuota.monto_final_centavos - v_cuota.monto_pagado_centavos;
    IF v_saldo_cuota <= 0 THEN
      CONTINUE;
    END IF;

    v_monto_aplicado := LEAST(v_restante, v_saldo_cuota);
    v_dias_atraso := GREATEST(0, v_fecha_efectiva - v_cuota.fecha_vencimiento);

    UPDATE public.cuotas
      SET monto_pagado_centavos = monto_pagado_centavos + v_monto_aplicado,
          estado = CASE
                     WHEN monto_pagado_centavos + v_monto_aplicado >= monto_final_centavos THEN 'pagada'
                     ELSE estado
                   END
      WHERE id = v_cuota.id;

    INSERT INTO public.aplicaciones_pago (
      pago_id, cuota_id, monto_aplicado_centavos, dias_atraso_al_aplicar
    )
    VALUES (v_pago.id, v_cuota.id, v_monto_aplicado, v_dias_atraso);

    v_cuotas_aplicadas := array_append(v_cuotas_aplicadas, v_cuota.id);
    v_restante := v_restante - v_monto_aplicado;
  END LOOP;

  UPDATE public.pagos SET cuota_ids = v_cuotas_aplicadas WHERE id = v_pago.id;
  v_pago.cuota_ids := v_cuotas_aplicadas;

  IF v_restante > 0 THEN
    SELECT saldo_resultante_centavos INTO v_saldo_wallet_anterior
    FROM public.wallet_movimientos
    WHERE familia_id = p_familia_id
    ORDER BY created_at DESC
    LIMIT 1;
    v_saldo_wallet_anterior := COALESCE(v_saldo_wallet_anterior, 0);

    INSERT INTO public.wallet_movimientos (
      familia_id, tipo, monto_centavos, origen, referencia_id, descripcion, saldo_resultante_centavos
    )
    VALUES (
      p_familia_id, 'credito', v_restante, 'pago', v_pago.id,
      'Saldo a favor del pago', v_saldo_wallet_anterior + v_restante
    );
  END IF;

  RETURN v_pago;
END;
$function$;

-- Función: fn_reinscripcion_rol_autorizado
CREATE OR REPLACE FUNCTION public.fn_reinscripcion_rol_autorizado()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.rol IN ('admin', 'finanzas', 'director')
  );
$function$;

-- Función: fn_reportar_alumno_riesgo
CREATE OR REPLACE FUNCTION public.fn_reportar_alumno_riesgo(p_alumno_id uuid, p_alumno_nombre text, p_motivo text, p_actor_id uuid, p_actor_nombre text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_corr uuid := gen_random_uuid(); v_label text := coalesce(p_alumno_nombre, 'Alumno');
BEGIN
  PERFORM public._fn_crear_tarea_caso(v_corr, 'ACM: Levantar informe académico del alumno',
    coalesce(p_motivo,''), 'ACM', 'alta', 'alumno', p_alumno_id, v_label, p_actor_id, p_actor_nombre);
  PERFORM public._fn_crear_tarea_caso(v_corr, 'COM: Contactar al representante',
    'Coordinar contacto con el representante por caso de alumno en riesgo.', 'COM', 'alta', 'alumno', p_alumno_id, v_label, p_actor_id, p_actor_nombre);
  PERFORM public._fn_crear_tarea_caso(v_corr, 'FIN: Revisar estado de pago del representante',
    'Verificar morosidad y compromisos económicos del alumno.', 'FIN', 'media', 'alumno', p_alumno_id, v_label, p_actor_id, p_actor_nombre);
  PERFORM public._fn_crear_tarea_caso(v_corr, 'DIR: Seguimiento de caso crítico',
    coalesce('Motivo: '||p_motivo, 'Definir según protocolo: seguimiento, advertencia, suspensión o retiro.'), 'DIR', 'critica', 'alumno', p_alumno_id, v_label, p_actor_id, p_actor_nombre);

  RETURN v_corr;
END $function$;

-- Función: fn_reportar_instrumento_danado
CREATE OR REPLACE FUNCTION public.fn_reportar_instrumento_danado(p_instrumento_id uuid, p_descripcion text, p_actor_id uuid, p_actor_nombre text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_corr uuid := gen_random_uuid(); v_label text; v_alumno text;
BEGIN
  SELECT coalesce(nombre,'Instrumento') || coalesce(' ('||codigo||')',''), alumno_nombre
    INTO v_label, v_alumno FROM public.instrumentos WHERE id = p_instrumento_id;
  IF v_label IS NULL THEN RAISE EXCEPTION 'instrumento % no existe', p_instrumento_id; END IF;

  UPDATE public.instrumentos SET estado = 'danado', updated_at = now() WHERE id = p_instrumento_id;

  PERFORM public._fn_crear_tarea_caso(v_corr, 'LUT: Diagnosticar daño del instrumento',
    coalesce(p_descripcion,'') , 'LUT', 'alta', 'instrumento', p_instrumento_id, v_label, p_actor_id, p_actor_nombre);
  PERFORM public._fn_crear_tarea_caso(v_corr, 'LOG: Actualizar estado en inventario y evaluar reemplazo temporal',
    'Instrumento marcado como dañado; evaluar disponibilidad de reemplazo.', 'LOG', 'alta', 'instrumento', p_instrumento_id, v_label, p_actor_id, p_actor_nombre);
  PERFORM public._fn_crear_tarea_caso(v_corr, 'FIN: Evaluar si corresponde cargo al representante',
    coalesce('Alumno asociado: '||v_alumno, 'Revisar responsable del daño.'), 'FIN', 'media', 'instrumento', p_instrumento_id, v_label, p_actor_id, p_actor_nombre);
  PERFORM public._fn_crear_tarea_caso(v_corr, 'ACM: Caso de daño asociado al alumno',
    'El alumno tiene un caso abierto por daño de instrumento; considerar impacto en continuidad.', 'ACM', 'media', 'instrumento', p_instrumento_id, v_label, p_actor_id, p_actor_nombre);
  PERFORM public._fn_crear_tarea_caso(v_corr, 'COM: Evaluar comunicado al representante',
    'Coordinar mensaje al representante sobre el caso de instrumento dañado.', 'COM', 'media', 'instrumento', p_instrumento_id, v_label, p_actor_id, p_actor_nombre);

  RETURN v_corr;
END $function$;

-- Función: fn_reporte_cierre_semestre
CREATE OR REPLACE FUNCTION public.fn_reporte_cierre_semestre(p_periodo_id uuid, p_escala_calificacion numeric DEFAULT 5, p_umbral_nota_pct numeric DEFAULT 70, p_umbral_asistencia_pct numeric DEFAULT 75, p_dias_gracia_registro integer DEFAULT 2)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_periodo        record;
  v_fi             date;
  v_ff             date;
  v_resumen        jsonb;
  v_docentes       jsonb;
  v_clases         jsonb;
  v_asistencia     jsonb;
  v_riesgo         jsonb;
  v_promocion      jsonb;
  v_instrumentos   jsonb;
  v_brechas        jsonb;
  v_calidad        jsonb;
BEGIN
  SELECT * INTO v_periodo FROM public.periodos WHERE id = p_periodo_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Periodo no encontrado: %', p_periodo_id;
  END IF;

  v_fi := v_periodo.fecha_inicio;
  v_ff := v_periodo.fecha_fin;

  DROP TABLE IF EXISTS _ses;
  CREATE TEMP TABLE _ses ON COMMIT DROP AS
  SELECT s.id, s.fecha, s.clase_id, s.borrador, s.estado, s.emergente_id,
         c.nombre AS clase_nombre, c.instrumento,
         c.maestro_principal_id AS maestro_id,
         s.maestro_id AS registrado_por_maestro_id
  FROM public.sesiones_clase s
  LEFT JOIN public.clases c ON c.id = s.clase_id
  WHERE s.fecha BETWEEN v_fi AND v_ff;

  DROP TABLE IF EXISTS _asis;
  CREATE TEMP TABLE _asis ON COMMIT DROP AS
  SELECT a.id, a.alumno_id, a.clase_id, a.sesion_clase_id, a.fecha, a.estado, a.marked_at,
         CASE WHEN a.marked_at IS NULL THEN NULL
              ELSE (a.marked_at AT TIME ZONE 'UTC')::date - a.fecha END AS dias_atraso_registro
  FROM public.asistencias a
  WHERE a.fecha BETWEEN v_fi AND v_ff;

  SELECT jsonb_build_object(
    'periodo', jsonb_build_object(
      'id', v_periodo.id, 'nombre', v_periodo.nombre,
      'fecha_inicio', v_fi, 'fecha_fin', v_ff,
      'activo', v_periodo.activo, 'cerrado', v_periodo.cerrado,
      'cerrado_at', v_periodo.cerrado_at),
    'clases_activas',       (SELECT count(*) FROM public.clases WHERE activo),
    'alumnos_activos',      (SELECT count(*) FROM public.alumnos WHERE activo),
    'maestros_activos',     (SELECT count(*) FROM public.maestros WHERE activo),
    'sesiones_periodo',     (SELECT count(*) FROM _ses),
    'sesiones_registradas', (SELECT count(*) FROM _ses WHERE estado = 'registrada'),
    'sesiones_borrador',    (SELECT count(*) FROM _ses WHERE borrador IS TRUE),
    'sesiones_pendientes',  (SELECT count(*) FROM _ses WHERE estado = 'pendiente'),
    'sesiones_sin_clase',   (SELECT count(*) FROM _ses WHERE clase_id IS NULL),
    'marcas_asistencia',    (SELECT count(*) FROM _asis),
    'pct_cumplimiento_registro',
      CASE WHEN (SELECT count(*) FROM _ses) = 0 THEN NULL
           ELSE round(((SELECT count(*) FROM _ses WHERE estado = 'registrada')::numeric
                       / (SELECT count(*) FROM _ses)::numeric) * 100, 1) END
  ) INTO v_resumen;

  WITH por_maestro AS (
    SELECT m.id AS maestro_id, m.nombre_completo, m.especialidad,
      (SELECT count(*) FROM public.clases c WHERE c.maestro_principal_id = m.id AND c.activo) AS clases_a_cargo,
      count(s.id) AS sesiones,
      count(s.id) FILTER (WHERE s.estado = 'registrada') AS registradas,
      count(s.id) FILTER (WHERE s.borrador IS TRUE) AS borradores,
      count(s.id) FILTER (WHERE s.estado = 'pendiente') AS pendientes,
      (SELECT count(*) FROM _asis a JOIN public.clases c2 ON c2.id = a.clase_id
        WHERE c2.maestro_principal_id = m.id) AS marcas_registradas,
      (SELECT count(*) FROM _asis a JOIN public.clases c2 ON c2.id = a.clase_id
        WHERE c2.maestro_principal_id = m.id AND a.dias_atraso_registro > p_dias_gracia_registro) AS marcas_tardias,
      (SELECT round(avg(a.dias_atraso_registro), 1) FROM _asis a JOIN public.clases c2 ON c2.id = a.clase_id
        WHERE c2.maestro_principal_id = m.id AND a.dias_atraso_registro IS NOT NULL) AS dias_atraso_promedio
    FROM public.maestros m
    LEFT JOIN _ses s ON s.maestro_id = m.id
    WHERE m.activo
    GROUP BY m.id, m.nombre_completo, m.especialidad
  )
  SELECT coalesce(jsonb_agg(jsonb_build_object(
      'maestro_id', maestro_id, 'nombre', nombre_completo, 'especialidad', especialidad,
      'clases_a_cargo', clases_a_cargo, 'sesiones', sesiones, 'registradas', registradas,
      'borradores', borradores, 'pendientes', pendientes,
      'marcas_registradas', marcas_registradas, 'marcas_tardias', marcas_tardias,
      'dias_atraso_promedio', dias_atraso_promedio,
      'pct_cumplimiento', CASE WHEN sesiones = 0 THEN NULL
        ELSE round((registradas::numeric / sesiones::numeric) * 100, 1) END,
      'pct_puntualidad', CASE WHEN marcas_registradas = 0 THEN NULL
        ELSE round(((marcas_registradas - marcas_tardias)::numeric / marcas_registradas::numeric) * 100, 1) END,
      'estado_evaluacion', CASE WHEN clases_a_cargo = 0 AND sesiones = 0 THEN 'SIN_CLASES_ASIGNADAS'
        WHEN sesiones = 0 THEN 'SIN_DATOS' ELSE 'EVALUABLE' END
    ) ORDER BY sesiones DESC, nombre_completo), '[]'::jsonb) INTO v_docentes FROM por_maestro;

  WITH por_clase AS (
    SELECT c.id, c.nombre, c.instrumento, c.modalidad, m.nombre_completo AS maestro,
      (SELECT count(*) FROM public.alumnos_clases ac WHERE ac.clase_id = c.id AND ac.activo) AS inscritos,
      (SELECT count(*) FROM _ses s WHERE s.clase_id = c.id) AS sesiones,
      (SELECT count(*) FROM _asis a WHERE a.clase_id = c.id) AS marcas,
      (SELECT count(*) FROM _asis a WHERE a.clase_id = c.id AND a.estado IN ('presente','justificado')) AS asistidas
    FROM public.clases c
    LEFT JOIN public.maestros m ON m.id = c.maestro_principal_id
    WHERE c.activo
  )
  SELECT coalesce(jsonb_agg(jsonb_build_object(
      'clase_id', id, 'nombre', nombre, 'instrumento', instrumento,
      'modalidad', modalidad, 'maestro', maestro,
      'inscritos', inscritos, 'sesiones', sesiones, 'marcas', marcas,
      'tasa_asistencia', CASE WHEN marcas = 0 THEN NULL
        ELSE round((asistidas::numeric / marcas::numeric) * 100, 1) END,
      'alerta_reconciliacion',
        CASE WHEN inscritos = 0 AND marcas > 0 THEN 'MARCAS_SIN_MATRICULA'
             WHEN sesiones > 0 AND inscritos > 0 AND marcas > (sesiones * inscritos) THEN 'MARCAS_EXCEDEN_MATRICULA'
             WHEN sesiones > 0 AND marcas = 0 THEN 'SESIONES_SIN_ASISTENCIA'
             ELSE NULL END,
      'estado_evaluacion', CASE WHEN sesiones = 0 THEN 'SIN_DATOS' ELSE 'EVALUABLE' END
    ) ORDER BY sesiones DESC, inscritos DESC), '[]'::jsonb) INTO v_clases FROM por_clase;

  SELECT jsonb_build_object(
    'total_marcas', (SELECT count(*) FROM _asis),
    'presentes',    (SELECT count(*) FROM _asis WHERE estado = 'presente'),
    'ausentes',     (SELECT count(*) FROM _asis WHERE estado = 'ausente'),
    'justificados', (SELECT count(*) FROM _asis WHERE estado = 'justificado'),
    'tasa_global', CASE WHEN (SELECT count(*) FROM _asis) = 0 THEN NULL
      ELSE round(((SELECT count(*) FROM _asis WHERE estado IN ('presente','justificado'))::numeric
                  / (SELECT count(*) FROM _asis)::numeric) * 100, 1) END,
    'marcas_tardias', (SELECT count(*) FROM _asis WHERE dias_atraso_registro > p_dias_gracia_registro),
    'pct_registro_puntual', CASE WHEN (SELECT count(*) FROM _asis WHERE dias_atraso_registro IS NOT NULL) = 0 THEN NULL
      ELSE round((((SELECT count(*) FROM _asis WHERE dias_atraso_registro IS NOT NULL)
                   - (SELECT count(*) FROM _asis WHERE dias_atraso_registro > p_dias_gracia_registro))::numeric
                  / (SELECT count(*) FROM _asis WHERE dias_atraso_registro IS NOT NULL)::numeric) * 100, 1) END,
    'por_dia_semana', (SELECT coalesce(jsonb_object_agg(dia, ausencias), '{}'::jsonb) FROM (
        SELECT CASE to_char(fecha, 'ID')
                 WHEN '1' THEN 'Lunes' WHEN '2' THEN 'Martes' WHEN '3' THEN 'Miercoles'
                 WHEN '4' THEN 'Jueves' WHEN '5' THEN 'Viernes' WHEN '6' THEN 'Sabado'
                 ELSE 'Domingo' END AS dia,
               count(*) FILTER (WHERE estado = 'ausente') AS ausencias
        FROM _asis GROUP BY 1) d)
  ) INTO v_asistencia;

  WITH por_alumno AS (
    SELECT a.alumno_id, al.nombre_completo, count(*) AS total,
           count(*) FILTER (WHERE a.estado = 'ausente') AS ausencias
    FROM _asis a JOIN public.alumnos al ON al.id = a.alumno_id
    GROUP BY a.alumno_id, al.nombre_completo
  )
  SELECT coalesce(jsonb_agg(jsonb_build_object(
      'alumno_id', alumno_id, 'nombre', nombre_completo,
      'total_marcas', total, 'ausencias', ausencias,
      'pct_ausencias', round((ausencias::numeric / total::numeric) * 100, 1)
    ) ORDER BY (ausencias::numeric / total::numeric) DESC), '[]'::jsonb) INTO v_riesgo
  FROM por_alumno WHERE total >= 3 AND (ausencias::numeric / total::numeric) >= 0.25;

  WITH notas AS (
    SELECT p.alumno_id, round(avg(p.calificacion), 2) AS promedio, count(*) AS n_evals
    FROM public.progresos p
    WHERE p.calificacion IS NOT NULL AND p.fecha_evaluacion BETWEEN v_fi AND v_ff
    GROUP BY p.alumno_id
  ),
  asist AS (
    SELECT alumno_id, count(*) AS total,
           count(*) FILTER (WHERE estado IN ('presente','justificado')) AS asistidas
    FROM _asis GROUP BY alumno_id
  ),
  eval AS (
    SELECT al.id, al.nombre_completo, al.instrumento_principal, al.nivel,
      n.promedio, n.n_evals, a.total AS marcas, a.asistidas,
      CASE WHEN n.promedio IS NULL THEN NULL
           ELSE round((n.promedio / p_escala_calificacion) * 100, 1) END AS pct_nota,
      CASE WHEN a.total IS NULL OR a.total = 0 THEN NULL
           ELSE round((a.asistidas::numeric / a.total::numeric) * 100, 1) END AS pct_asistencia
    FROM public.alumnos al
    LEFT JOIN notas n ON n.alumno_id = al.id
    LEFT JOIN asist a ON a.alumno_id = al.id
    WHERE al.activo
  )
  SELECT coalesce(jsonb_agg(jsonb_build_object(
      'alumno_id', id, 'nombre', nombre_completo,
      'instrumento', instrumento_principal, 'nivel', nivel,
      'promedio', promedio, 'n_evaluaciones', coalesce(n_evals, 0),
      'pct_nota', pct_nota, 'marcas_asistencia', coalesce(marcas, 0),
      'pct_asistencia', pct_asistencia,
      'veredicto', CASE
          WHEN promedio IS NULL AND pct_asistencia IS NULL THEN 'SIN_DATOS'
          WHEN promedio IS NULL THEN 'SIN_EVALUACION'
          WHEN pct_asistencia IS NULL THEN 'SIN_ASISTENCIA'
          WHEN pct_nota >= p_umbral_nota_pct AND pct_asistencia >= p_umbral_asistencia_pct THEN 'PROMUEVE'
          ELSE 'NO_PROMUEVE' END,
      'motivo', CASE
          WHEN promedio IS NULL AND pct_asistencia IS NULL THEN 'Sin evaluaciones ni marcas de asistencia en el periodo'
          WHEN promedio IS NULL THEN 'Sin evaluaciones registradas en el periodo'
          WHEN pct_asistencia IS NULL THEN 'Sin marcas de asistencia en el periodo'
          WHEN pct_nota < p_umbral_nota_pct AND pct_asistencia < p_umbral_asistencia_pct THEN 'Rendimiento y asistencia por debajo del umbral'
          WHEN pct_nota < p_umbral_nota_pct THEN 'Rendimiento por debajo del umbral'
          WHEN pct_asistencia < p_umbral_asistencia_pct THEN 'Asistencia por debajo del umbral'
          ELSE 'Cumple ambos criterios' END
    ) ORDER BY CASE WHEN promedio IS NULL AND pct_asistencia IS NULL THEN 2 ELSE 1 END, pct_nota NULLS LAST
  ), '[]'::jsonb) INTO v_promocion FROM eval;

  SELECT jsonb_build_object(
    'total_activos', (SELECT count(*) FROM public.inventario_activos WHERE activo),
    'por_conservacion', (SELECT coalesce(jsonb_object_agg(coalesce(estado_conservacion,'sin_dato'), n), '{}'::jsonb)
      FROM (SELECT estado_conservacion, count(*) n FROM public.inventario_activos WHERE activo GROUP BY 1) x),
    'por_uso', (SELECT coalesce(jsonb_object_agg(coalesce(estado_uso,'sin_dato'), n), '{}'::jsonb)
      FROM (SELECT estado_uso, count(*) n FROM public.inventario_activos WHERE activo GROUP BY 1) x),
    'requieren_mantenimiento', (SELECT count(*) FROM public.inventario_activos
      WHERE activo AND (estado_conservacion IN ('mantenimiento','regular') OR requiere_mantenimiento IS TRUE)),
    'dados_de_baja', (SELECT count(*) FROM public.inventario_activos WHERE estado_conservacion = 'de_baja'),
    'en_reparacion', (SELECT count(*) FROM public.inventario_activos WHERE estado_uso = 'en_reparacion'),
    'comodatos_activos', (SELECT count(*) FROM public.comodatos_activos WHERE estado = 'activo'),
    'alumnos_con_instrumento', (SELECT count(DISTINCT alumno_id) FROM public.comodatos_activos WHERE estado = 'activo'),
    'comodatos_vencidos', (SELECT count(*) FROM public.comodatos_activos
      WHERE estado = 'activo' AND fecha_vencimiento IS NOT NULL AND fecha_vencimiento < CURRENT_DATE),
    'comodatos_sin_contrato', (SELECT count(*) FROM public.comodatos_activos
      WHERE estado = 'activo' AND (contrato_firmado_url IS NULL OR contrato_firmado_url = '')),
    'detalle_mantenimiento', (SELECT coalesce(jsonb_agg(jsonb_build_object(
        'codigo', codigo_inventario, 'tipo', tipo_instrumento, 'marca', marca,
        'estado', estado_conservacion, 'ubicacion', ubicacion) ORDER BY tipo_instrumento), '[]'::jsonb)
      FROM public.inventario_activos WHERE activo AND estado_conservacion IN ('mantenimiento','regular')),
    'historial_reparaciones', CASE WHEN (SELECT count(*) FROM public.inventario_reparaciones) = 0
      THEN jsonb_build_object('estado','SIN_DATOS','motivo','La tabla inventario_reparaciones no tiene registros: no hay trazabilidad de reparaciones, costos ni tiempos de taller')
      ELSE jsonb_build_object('estado','EVALUABLE','total',(SELECT count(*) FROM public.inventario_reparaciones)) END
  ) INTO v_instrumentos;

  SELECT jsonb_build_array(
    jsonb_build_object('dimension','Asistencia del personal docente',
      'estado', CASE WHEN (SELECT count(*) FROM public.ausencias_maestros) = 0
                       AND (SELECT count(*) FROM public.ausencias) = 0 THEN 'SIN_DATOS' ELSE 'PARCIAL' END,
      'motivo','Las tablas ausencias_maestros y ausencias no tienen registros. No existe captura de presencia docente en el periodo.',
      'accion','Instrumentar el registro de asistencia del maestro para que el proximo cierre disponga del dato.'),
    jsonb_build_object('dimension','Criterio de promocion por nivel','estado','PARCIAL',
      'motivo', format('clases.nivel_id esta vacio en las %s clases activas, por lo que no puede resolverse el criterio de niveles.criterios_promocion por alumno. Se aplico el umbral global de %s%% de la escala.',
        (SELECT count(*) FROM public.clases WHERE activo), p_umbral_nota_pct),
      'accion','Poblar clases.nivel_id para que cada alumno se evalue con el criterio de su nivel.'),
    jsonb_build_object('dimension','Escala de calificacion','estado','REQUIERE_VALIDACION',
      'motivo', format('progresos.calificacion se observa en el rango %s..%s (rubrica), mientras niveles.criterios_promocion.promedio_minimo vale 7 sobre escala 0-10. El reporte normalizo sobre escala %s.',
        (SELECT min(calificacion) FROM public.progresos WHERE calificacion IS NOT NULL),
        (SELECT max(calificacion) FROM public.progresos WHERE calificacion IS NOT NULL), p_escala_calificacion),
      'accion','Confirmar la escala institucional antes de emitir veredictos de promocion como definitivos.'),
    jsonb_build_object('dimension','Cobertura del alumnado','estado','PARCIAL',
      'motivo', format('De %s alumnos activos, %s tienen marcas de asistencia y %s tienen evaluaciones en el periodo.',
        (SELECT count(*) FROM public.alumnos WHERE activo),
        (SELECT count(DISTINCT alumno_id) FROM _asis),
        (SELECT count(DISTINCT alumno_id) FROM public.progresos WHERE fecha_evaluacion BETWEEN v_fi AND v_ff)),
      'accion','El reporte solo describe a la fraccion del alumnado con evidencia registrada.'),
    jsonb_build_object('dimension','Atribucion docente de sesiones','estado','CORREGIDA_EN_LECTURA',
      'motivo', format('sesiones_clase.maestro_id atribuye %s de %s sesiones del periodo a un unico usuario (el creador del registro). Este informe atribuye por clases.maestro_principal_id.',
        (SELECT count(*) FROM _ses s WHERE s.registrado_por_maestro_id = (
          SELECT registrado_por_maestro_id FROM _ses GROUP BY registrado_por_maestro_id ORDER BY count(*) DESC LIMIT 1)),
        (SELECT count(*) FROM _ses)),
      'accion','Corregir el guardado de sesiones para registrar al docente de la clase, ademas del autor.')
  ) INTO v_brechas;

  SELECT jsonb_build_object(
    'marcas_tabla_asistencias', (SELECT count(*) FROM _asis),
    'marcas_jsonb_sesiones', (SELECT coalesce(sum(jsonb_array_length(s.asistencia)), 0)
      FROM public.sesiones_clase s WHERE s.fecha BETWEEN v_fi AND v_ff
        AND s.asistencia IS NOT NULL AND jsonb_typeof(s.asistencia) = 'array'),
    'nota','sesiones_clase.asistencia mezcla codigos P/A/J con etiquetas largas y nulos; la tabla asistencias usa presente/ausente/justificado. El informe usa la tabla como fuente unica.'
  ) INTO v_calidad;

  RETURN jsonb_build_object(
    'meta', jsonb_build_object('generado_en', now(), 'version', '1.0',
      'parametros', jsonb_build_object(
        'escala_calificacion', p_escala_calificacion,
        'umbral_nota_pct', p_umbral_nota_pct,
        'umbral_asistencia_pct', p_umbral_asistencia_pct,
        'dias_gracia_registro', p_dias_gracia_registro)),
    'resumen', v_resumen,
    'docentes', v_docentes,
    'clases', v_clases,
    'asistencia', v_asistencia,
    'alumnos_riesgo', v_riesgo,
    'promocion', v_promocion,
    'promocion_totales', (SELECT jsonb_object_agg(veredicto, n) FROM (
        SELECT e->>'veredicto' AS veredicto, count(*) AS n
        FROM jsonb_array_elements(v_promocion) e GROUP BY 1) t),
    'instrumentos', v_instrumentos,
    'brechas', v_brechas,
    'calidad_datos', v_calidad
  );
END;
$function$;

-- Función: fn_reporte_indicadores_adicionales
CREATE OR REPLACE FUNCTION public.fn_reporte_indicadores_adicionales(p_periodo_id uuid, p_cobertura_minima_pct numeric DEFAULT 30)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_periodo        record;
  v_fi             date;
  v_ff             date;
  v_alumnos_tot    integer;
  v_retencion      jsonb;
  v_avance         jsonb;
  v_contingencias  jsonb;
  v_justif         jsonb;
  v_asis_docente   jsonb;
BEGIN
  SELECT * INTO v_periodo FROM public.periodos WHERE id = p_periodo_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Periodo no encontrado: %', p_periodo_id;
  END IF;

  v_fi := v_periodo.fecha_inicio;
  v_ff := v_periodo.fecha_fin;
  SELECT count(*) INTO v_alumnos_tot FROM public.alumnos;

  WITH mov AS (
    SELECT count(*) FILTER (WHERE fecha BETWEEN v_fi AND v_ff) AS eventos_periodo,
           count(*) AS eventos_total
    FROM public.historial_estado_alumno
  ),
  base AS (
    SELECT
      count(*) FILTER (WHERE fecha_ingreso IS NOT NULL AND fecha_ingreso <= v_ff) AS ingresados_hasta_cierre,
      count(*) FILTER (WHERE fecha_ingreso BETWEEN v_fi AND v_ff) AS ingresos_en_periodo,
      count(*) FILTER (WHERE activo IS TRUE) AS activos,
      count(*) FILTER (WHERE activo IS NOT TRUE) AS inactivos
    FROM public.alumnos
  )
  SELECT CASE
    WHEN (SELECT eventos_total FROM mov) = 0 AND (SELECT inactivos FROM base) = 0 THEN
      jsonb_build_object(
        'estado','SIN_DATOS',
        'motivo', format('No hay bajas registradas: los %s alumnos figuran como activos y historial_estado_alumno no tiene eventos. Una tasa de retencion sobre estos datos daria 100 %% de forma permanente.', v_alumnos_tot),
        'accion','Registrar las bajas marcando alumnos.activo = false. El trigger trg_historial_estado_alumno ya existe y captura el evento automaticamente.',
        'matricula_activa', (SELECT activos FROM base))
    ELSE
      jsonb_build_object(
        'estado', CASE WHEN (SELECT eventos_periodo FROM mov) = 0 THEN 'PARCIAL' ELSE 'EVALUABLE' END,
        'matricula_inicial', (SELECT ingresados_hasta_cierre FROM base),
        'ingresos_en_periodo', (SELECT ingresos_en_periodo FROM base),
        'activos_al_cierre', (SELECT activos FROM base),
        'bajas_acumuladas', (SELECT inactivos FROM base),
        'eventos_en_periodo', (SELECT eventos_periodo FROM mov),
        'tasa_retencion_pct',
          CASE WHEN (SELECT ingresados_hasta_cierre FROM base) = 0 THEN NULL
               ELSE round(((SELECT activos FROM base)::numeric
                           / (SELECT ingresados_hasta_cierre FROM base)::numeric) * 100, 1) END)
  END INTO v_retencion;

  WITH att AS (
    SELECT ia.student_id, ia.status, ia.nota, al.instrumento_principal
    FROM public.indicator_attempts ia
    JOIN public.alumnos al ON al.id = ia.student_id
    WHERE ia.covered_date BETWEEN v_fi AND v_ff
  ),
  cob AS (
    SELECT count(DISTINCT student_id) AS alumnos_cubiertos, count(*) AS intentos FROM att
  )
  SELECT CASE
    WHEN (SELECT intentos FROM cob) = 0 THEN
      jsonb_build_object('estado','SIN_DATOS',
        'motivo','No hay registros en indicator_attempts dentro del periodo.',
        'accion','Promover el uso del mapa de indicadores en el Portal de Maestros.')
    WHEN (SELECT alumnos_cubiertos FROM cob)::numeric / nullif(v_alumnos_tot,0) * 100 < p_cobertura_minima_pct THEN
      jsonb_build_object('estado','PARCIAL',
        'motivo', format('Solo %s de %s alumnos (%s %%) tienen indicadores evaluados en el periodo. Por debajo del %s %% de cobertura el dato no describe al conjunto.',
          (SELECT alumnos_cubiertos FROM cob), v_alumnos_tot,
          round((SELECT alumnos_cubiertos FROM cob)::numeric / nullif(v_alumnos_tot,0) * 100, 1),
          p_cobertura_minima_pct),
        'accion','Ampliar la evaluacion por indicadores antes de reportar avance curricular institucional.',
        'alumnos_cubiertos', (SELECT alumnos_cubiertos FROM cob),
        'intentos', (SELECT intentos FROM cob),
        'por_instrumento', (SELECT coalesce(jsonb_object_agg(coalesce(instrumento_principal,'sin_dato'), n), '{}'::jsonb)
                            FROM (SELECT instrumento_principal, count(*) n FROM att GROUP BY 1) x))
    ELSE
      jsonb_build_object('estado','EVALUABLE',
        'alumnos_cubiertos', (SELECT alumnos_cubiertos FROM cob),
        'intentos', (SELECT intentos FROM cob),
        'por_instrumento', (SELECT coalesce(jsonb_object_agg(coalesce(instrumento_principal,'sin_dato'), n), '{}'::jsonb)
                            FROM (SELECT instrumento_principal, count(*) n FROM att GROUP BY 1) x),
        'por_status', (SELECT coalesce(jsonb_object_agg(coalesce(status,'sin_dato'), n), '{}'::jsonb)
                       FROM (SELECT status, count(*) n FROM att GROUP BY 1) x))
  END INTO v_avance;

  WITH em AS (
    SELECT count(*) n FROM public.clases_emergentes WHERE fecha BETWEEN v_fi AND v_ff),
  sup AS (
    SELECT count(*) n FROM public.asistencia_maestros
     WHERE fecha BETWEEN v_fi AND v_ff AND estado = 'suplencia'),
  ses_em AS (
    SELECT count(*) n FROM public.sesiones_clase
     WHERE fecha BETWEEN v_fi AND v_ff AND emergente_id IS NOT NULL)
  SELECT CASE
    WHEN (SELECT n FROM em) = 0 AND (SELECT n FROM sup) = 0 AND (SELECT n FROM ses_em) = 0 THEN
      jsonb_build_object('estado','SIN_DATOS',
        'motivo','clases_emergentes no tiene registros en el periodo y no hay suplencias cargadas en asistencia_maestros.',
        'accion','Registrar clases emergentes y suplencias docentes para dimensionar la contingencia operativa.')
    ELSE
      jsonb_build_object('estado','EVALUABLE',
        'clases_emergentes', (SELECT n FROM em),
        'sesiones_marcadas_emergentes', (SELECT n FROM ses_em),
        'suplencias_docentes', (SELECT n FROM sup))
  END INTO v_contingencias;

  WITH j AS (
    SELECT categoria, estado FROM public.justificaciones
     WHERE fecha BETWEEN v_fi AND v_ff)
  SELECT CASE
    WHEN (SELECT count(*) FROM j) = 0 THEN
      jsonb_build_object('estado','SIN_DATOS',
        'motivo','No hay justificaciones registradas en el periodo.',
        'accion','Sin accion: la ausencia de justificaciones puede ser correcta.')
    WHEN (SELECT count(*) FROM j WHERE categoria IS NOT NULL) = 0 THEN
      jsonb_build_object('estado','PARCIAL',
        'total', (SELECT count(*) FROM j),
        'sin_clasificar', (SELECT count(*) FROM j),
        'motivo','Ninguna justificacion tiene causal normalizada. El campo motivo es texto libre y no se infiere la categoria a partir de el.',
        'accion','Clasificar las justificaciones con el campo categoria para habilitar el desglose por causal.',
        'por_estado_revision', (SELECT coalesce(jsonb_object_agg(coalesce(estado,'sin_dato'), n), '{}'::jsonb)
                                FROM (SELECT estado, count(*) n FROM j GROUP BY 1) x))
    ELSE
      jsonb_build_object('estado','EVALUABLE',
        'total', (SELECT count(*) FROM j),
        'sin_clasificar', (SELECT count(*) FROM j WHERE categoria IS NULL),
        'por_causal', (SELECT coalesce(jsonb_object_agg(coalesce(categoria,'SIN_CLASIFICAR'), n), '{}'::jsonb)
                       FROM (SELECT categoria, count(*) n FROM j GROUP BY 1) x),
        'por_estado_revision', (SELECT coalesce(jsonb_object_agg(coalesce(estado,'sin_dato'), n), '{}'::jsonb)
                                FROM (SELECT estado, count(*) n FROM j GROUP BY 1) x))
  END INTO v_justif;

  WITH am AS (
    SELECT am.maestro_id, m.nombre_completo, am.estado
    FROM public.asistencia_maestros am
    JOIN public.maestros m ON m.id = am.maestro_id
    WHERE am.fecha BETWEEN v_fi AND v_ff)
  SELECT CASE
    WHEN (SELECT count(*) FROM am) = 0 THEN
      jsonb_build_object('estado','SIN_DATOS',
        'motivo','La tabla asistencia_maestros no tiene registros en el periodo. La captura de presencia docente fue habilitada en esta version y comienza a acumular desde ahora.',
        'accion','Registrar la presencia docente por sesion para que el proximo cierre disponga del indicador.')
    ELSE
      jsonb_build_object('estado','EVALUABLE',
        'total_registros', (SELECT count(*) FROM am),
        'por_estado', (SELECT coalesce(jsonb_object_agg(estado, n), '{}'::jsonb)
                       FROM (SELECT estado, count(*) n FROM am GROUP BY 1) x),
        'por_maestro', (SELECT coalesce(jsonb_agg(jsonb_build_object(
              'maestro', nombre_completo, 'registros', n, 'presentes', p,
              'pct_presencia', CASE WHEN n = 0 THEN NULL ELSE round((p::numeric/n::numeric)*100,1) END)
            ORDER BY nombre_completo), '[]'::jsonb)
          FROM (SELECT nombre_completo, count(*) n,
                       count(*) FILTER (WHERE estado IN ('presente','tardanza')) p
                FROM am GROUP BY 1) y))
  END INTO v_asis_docente;

  RETURN jsonb_build_object(
    'meta', jsonb_build_object(
      'generado_en', now(), 'version','1.0',
      'periodo_id', p_periodo_id,
      'cobertura_minima_pct', p_cobertura_minima_pct),
    'retencion', v_retencion,
    'avance_pedagogico', v_avance,
    'contingencias', v_contingencias,
    'justificaciones', v_justif,
    'asistencia_docente', v_asis_docente
  );
END;
$function$;

-- Función: fn_resumen_academico_integrado
CREATE OR REPLACE FUNCTION public.fn_resumen_academico_integrado(p_alumno_id uuid, p_limite integer DEFAULT 25)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_autorizado boolean;
  v_result jsonb;
BEGIN
  v_autorizado := public.is_admin() OR EXISTS (
    SELECT 1
    FROM public.alumnos_clases ac
    WHERE ac.alumno_id = p_alumno_id
      AND ac.activo = true
      AND public.maestro_en_clase(ac.clase_id)
  );

  IF NOT v_autorizado THEN
    RAISE EXCEPTION 'No autorizado para consultar el perfil integrado del alumno'
      USING ERRCODE = '42501';
  END IF;

  WITH attempts AS (
    SELECT
      ia.id,
      ia.student_id,
      ia.indicator_id,
      ia.covered_by_clase_id AS clase_id,
      ia.nota,
      ia.observations,
      ia.tarea,
      ia.created_at,
      i.nombre AS indicador_nombre,
      n.name AS nodo_nombre,
      c.nombre AS clase_nombre
    FROM public.indicator_attempts ia
    LEFT JOIN public.indicators i ON i.id = ia.indicator_id
    LEFT JOIN public.nodes n ON n.id = i.node_id
    LEFT JOIN public.clases c ON c.id = ia.covered_by_clase_id
    WHERE ia.student_id = p_alumno_id
    ORDER BY ia.created_at DESC
    LIMIT GREATEST(COALESCE(p_limite, 25), 1)
  ),
  stars AS (
    SELECT
      ei.id,
      ei.alumno_id,
      ei.indicator_id,
      ei.clase_id,
      ei.nota,
      ei.estado,
      ei.observaciones,
      COALESCE(ei.fecha_evaluacion, ei.created_at) AS fecha_referencia,
      ei.created_at,
      i.nombre AS indicador_nombre,
      n.name AS nodo_nombre,
      c.nombre AS clase_nombre
    FROM public.evaluacion_indicador ei
    LEFT JOIN public.indicators i ON i.id = ei.indicator_id
    LEFT JOIN public.nodes n ON n.id = i.node_id
    LEFT JOIN public.clases c ON c.id = ei.clase_id
    WHERE ei.alumno_id = p_alumno_id
    ORDER BY COALESCE(ei.fecha_evaluacion, ei.created_at) DESC
    LIMIT GREATEST(COALESCE(p_limite, 25), 1)
  )
  SELECT jsonb_build_object(
    'alumno_id', p_alumno_id,
    'total_indicator_attempts', (SELECT count(*) FROM attempts),
    'total_indicator_attempts_with_note', (SELECT count(*) FROM attempts WHERE nota IS NOT NULL AND nota <> 0),
    'indicadores_aprobados', (SELECT count(*) FROM attempts WHERE nota >= 4),
    'promedio_indicator_attempts', (
      SELECT round(avg(nota)::numeric, 2)
      FROM attempts
      WHERE nota IS NOT NULL AND nota <> 0
    ),
    'total_star_evaluations', (SELECT count(*) FROM stars),
    'total_star_evaluations_with_note', (SELECT count(*) FROM stars WHERE nota IS NOT NULL AND nota <> 0),
    'estrellas_aprobadas', (SELECT count(*) FROM stars WHERE nota >= 4),
    'promedio_star_evaluations', (
      SELECT round(avg(nota)::numeric, 2)
      FROM stars
      WHERE nota IS NOT NULL AND nota <> 0
    ),
    'promedio_integrado', (
      SELECT round(avg(valor)::numeric, 2)
      FROM (
        SELECT nota AS valor FROM attempts WHERE nota IS NOT NULL AND nota <> 0
        UNION ALL
        SELECT nota AS valor FROM stars WHERE nota IS NOT NULL AND nota <> 0
      ) t
    ),
    'historial_indicator_attempts', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'fuente', 'indicator_attempt',
          'fuenteLabel', 'Indicador',
          'fuenteIcono', '📘',
          'indicator_id', indicator_id,
          'clase_id', clase_id,
          'clase_nombre', clase_nombre,
          'indicador_nombre', indicador_nombre,
          'nodo_nombre', nodo_nombre,
          'nota', nota,
          'observations', observations,
          'tarea', tarea,
          'created_at', created_at
        )
        ORDER BY created_at DESC
      )
      FROM attempts
    ), '[]'::jsonb),
    'historial_star_evaluations', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'fuente', 'estrella',
          'fuenteLabel', 'Estrella',
          'fuenteIcono', '⭐',
          'indicator_id', indicator_id,
          'clase_id', clase_id,
          'clase_nombre', clase_nombre,
          'indicador_nombre', indicador_nombre,
          'nodo_nombre', nodo_nombre,
          'nota', nota,
          'estado', estado,
          'observaciones', observaciones,
          'fechaReferencia', fecha_referencia,
          'created_at', created_at
        )
        ORDER BY fecha_referencia DESC
      )
      FROM stars
    ), '[]'::jsonb)
  )
  INTO v_result;

  RETURN v_result;
END;
$function$;

-- Función: fn_resumen_cumplimiento_asistencia
CREATE OR REPLACE FUNCTION public.fn_resumen_cumplimiento_asistencia(p_desde date, p_hasta date, p_maestro_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(maestro_id uuid, maestro_nombre text, total_clases bigint, registradas bigint, pendientes bigint, vencidas bigint, es_solvente boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_actor_maestro_id uuid;
  v_es_admin boolean := COALESCE(public.is_admin(), false) OR auth.role() = 'service_role';
BEGIN
  SELECT m.id INTO v_actor_maestro_id
  FROM public.maestros m
  WHERE m.user_id = auth.uid()
  LIMIT 1;

  IF NOT v_es_admin AND (p_maestro_id IS NULL OR p_maestro_id IS DISTINCT FROM v_actor_maestro_id) THEN
    RAISE EXCEPTION 'No tiene permiso para consultar este resumen';
  END IF;

  RETURN QUERY
  SELECT
    m.id,
    m.nombre_completo,
    count(*)::bigint,
    count(*) FILTER (WHERE e.estado IN ('registrada', 'cubierta_emergente'))::bigint,
    count(*) FILTER (WHERE e.estado = 'pendiente')::bigint,
    count(*) FILTER (WHERE e.estado = 'vencida')::bigint,
    count(*) FILTER (WHERE e.estado IN ('pendiente', 'vencida')) = 0
  FROM public.maestros m
  CROSS JOIN LATERAL public.fn_estado_asistencia_maestro(m.id, p_desde, p_hasta) e
  WHERE COALESCE(m.activo, true)
    AND (p_maestro_id IS NULL OR m.id = p_maestro_id)
  GROUP BY m.id, m.nombre_completo
  ORDER BY m.nombre_completo;
END;
$function$;

-- Función: fn_resumen_diario_director
CREATE OR REPLACE FUNCTION public.fn_resumen_diario_director()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_eventos json;
  v_tareas_atrasadas json;
  v_tareas_proximo_5d json;
  v_resumen json;
BEGIN
  -- Eventos en los próximos 7 días
  SELECT json_agg(json_build_object(
    'titulo', titulo,
    'tipo', tipo,
    'fecha_inicio', fecha_inicio,
    'dias_restantes', (fecha_inicio::date - CURRENT_DATE)
  )) INTO v_eventos
  FROM public.calendario
  WHERE fecha_inicio BETWEEN CURRENT_DATE AND (CURRENT_DATE + 7)
    AND estado = 'planificado'
  ORDER BY fecha_inicio ASC;

  -- Tareas retrasadas (fecha_vencimiento < hoy)
  SELECT json_agg(json_build_object(
    'titulo', tc.titulo,
    'departamento', d.nombre,
    'dias_atraso', EXTRACT(day FROM (CURRENT_DATE - tc.fecha_vencimiento))::int,
    'estado', tc.estado
  )) INTO v_tareas_atrasadas
  FROM public.tareas_calendario tc
  JOIN public.departamentos d ON tc.departamento_id = d.id
  WHERE tc.fecha_vencimiento < CURRENT_DATE
    AND tc.estado != 'completada'
  ORDER BY tc.fecha_vencimiento ASC;

  -- Tareas vencimiento próximos 5 días
  SELECT json_agg(json_build_object(
    'titulo', tc.titulo,
    'departamento', d.nombre,
    'fecha_vencimiento', tc.fecha_vencimiento,
    'dias_restantes', (tc.fecha_vencimiento - CURRENT_DATE)
  )) INTO v_tareas_proximo_5d
  FROM public.tareas_calendario tc
  JOIN public.departamentos d ON tc.departamento_id = d.id
  WHERE tc.fecha_vencimiento BETWEEN CURRENT_DATE AND (CURRENT_DATE + 5)
    AND tc.estado != 'completada'
  ORDER BY tc.fecha_vencimiento ASC;

  -- Compilar resumen
  v_resumen := json_build_object(
    'fecha', CURRENT_DATE,
    'eventos_proximos_7d', COALESCE(v_eventos, '[]'::json),
    'tareas_atrasadas', COALESCE(v_tareas_atrasadas, '[]'::json),
    'tareas_proximo_5d', COALESCE(v_tareas_proximo_5d, '[]'::json),
    'total_eventos', (SELECT COUNT(*) FROM public.calendario WHERE estado = 'planificado'),
    'total_tareas_pendientes', (SELECT COUNT(*) FROM public.tareas_calendario WHERE estado IN ('pendiente', 'en_progreso'))
  );

  RETURN v_resumen;
END
$function$;

-- Función: fn_servicio_publico_activo
CREATE OR REPLACE FUNCTION public.fn_servicio_publico_activo()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.campanias_periodo
    WHERE activo = true AND abre_servicio_publico = true
      AND (now() AT TIME ZONE 'America/Santo_Domingo')::date BETWEEN fecha_inicio AND fecha_fin
  );
$function$;

-- Función: fn_set_updated_at
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Función: fn_set_updated_at_alianzas
CREATE OR REPLACE FUNCTION public.fn_set_updated_at_alianzas()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Función: fn_signage_set_updated_at
CREATE OR REPLACE FUNCTION public.fn_signage_set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog'
AS $function$
begin
  new.updated_at := now();
  return new;
end $function$;

-- Función: fn_sim_set_updated_at
CREATE OR REPLACE FUNCTION public.fn_sim_set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Función: fn_sincronizar_arbol_curricular
CREATE OR REPLACE FUNCTION public.fn_sincronizar_arbol_curricular(p_clase_id uuid, p_nombre text, p_objetivos jsonb, p_plantilla_id uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_plantilla_id uuid;
  v_unidad jsonb;
  v_objetivo jsonb;
  v_indicador jsonb;
  v_o_idx integer;
  v_i_idx integer;
BEGIN
  -- Autorización: admin o maestro principal/suplente de la clase
  IF NOT (public.es_admin() OR public.maestro_en_clase(p_clase_id)) THEN
    RAISE EXCEPTION 'No autorizado: solo un admin o el maestro de la clase puede sincronizar el árbol curricular';
  END IF;

  IF p_nombre IS NULL OR btrim(p_nombre) = '' THEN
    RAISE EXCEPTION 'El nombre del plan curricular no puede estar vacío';
  END IF;

  IF p_objetivos IS NULL OR jsonb_typeof(p_objetivos) <> 'array' THEN
    RAISE EXCEPTION 'El árbol curricular debe ser un arreglo JSON de unidades';
  END IF;

  -- Resolver el id de la plantilla: el indicado por el cliente, el de la
  -- clase, o uno nuevo.
  IF p_plantilla_id IS NOT NULL THEN
    v_plantilla_id := p_plantilla_id;
  ELSE
    SELECT id INTO v_plantilla_id
    FROM public.plantillas_planificacion
    WHERE clase_id = p_clase_id
    ORDER BY updated_at DESC
    LIMIT 1;

    IF v_plantilla_id IS NULL THEN
      v_plantilla_id := gen_random_uuid();
    END IF;
  END IF;

  -- 1. Upsert de la plantilla. `objetivos` se persiste como TEXT según el
  --    esquema (20260605000004) y `contenido` se regenera como resumen texto.
  INSERT INTO public.plantillas_planificacion (
    id, nombre, objetivos, contenido, recursos, evaluacion_metodo,
    clase_id, activo, updated_at
  )
  VALUES (
    v_plantilla_id,
    btrim(p_nombre),
    p_objetivos::text,
    '',
    '',
    '',
    p_clase_id,
    true,
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET nombre = EXCLUDED.nombre,
      objetivos = EXCLUDED.objetivos,
      contenido = EXCLUDED.contenido,
      clase_id = EXCLUDED.clase_id,
      activo = true,
      updated_at = now();

  -- 2. Upsert de indicadores. node_id NULL: pertenecen al plan de la clase,
  --    no a una ruta institucional. Se omiten objetivo_id/node_id porque los
  --    objetivos del Diseñador viven en el JSON de la plantilla.
  FOR v_unidad IN
    SELECT value FROM jsonb_array_elements(p_objetivos)
  LOOP
    FOR v_objetivo, v_o_idx IN
      SELECT value, ordinality
      FROM jsonb_array_elements(COALESCE(v_unidad->'objetivos', '[]'::jsonb)) WITH ORDINALITY
    LOOP
      FOR v_indicador, v_i_idx IN
        SELECT value, ordinality
        FROM jsonb_array_elements(COALESCE(v_objetivo->'indicadores', '[]'::jsonb)) WITH ORDINALITY
      LOOP
        -- Sólo indicadores con id UUID válido; los de demo/preview (ind-1,
        -- obj-ia-seq-*, etc.) nunca se persisten.
        IF v_indicador->>'id' IS NULL
           OR v_indicador->>'id' !~
             '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN
          CONTINUE;
        END IF;

        INSERT INTO public.indicators (id, node_id, nombre, description, is_required, activo, order_index)
        VALUES (
          (v_indicador->>'id')::uuid,
          NULL,
          COALESCE(v_indicador->>'titulo', ''),
          COALESCE(v_indicador->>'descripcion', v_indicador->>'titulo', ''),
          true,
          true,
          v_i_idx
        )
        ON CONFLICT (id) DO UPDATE
        SET nombre = EXCLUDED.nombre,
            description = EXCLUDED.description,
            is_required = EXCLUDED.is_required,
            activo = EXCLUDED.activo,
            order_index = EXCLUDED.order_index;
      END LOOP;
    END LOOP;
  END LOOP;

  RETURN v_plantilla_id;
END;
$function$;

-- Función: fn_soi_evento_asistencia_falta
CREATE OR REPLACE FUNCTION public.fn_soi_evento_asistencia_falta()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_tipo text;
  v_correlation_id uuid;
  v_maestro_id uuid;
BEGIN
  IF NEW.estado = OLD.estado THEN
    RETURN NEW;
  END IF;

  IF NEW.estado IN ('ausente', 'falta_injustificada') THEN
    v_tipo := 'asistencia.falta_injustificada';
    v_correlation_id := NULL;
  ELSIF NEW.estado = 'falta_justificada' THEN
    v_tipo := 'asistencia.falta_justificada';
    v_correlation_id := gen_random_uuid();
  ELSE
    RETURN NEW;
  END IF;

  SELECT maestro_id INTO v_maestro_id
  FROM public.sesiones_clase
  WHERE id = NEW.sesion_clase_id;

  INSERT INTO public.soi_eventos (
    tipo, entidad_tipo, entidad_id, actor_id, payload, correlation_id
  )
  VALUES (
    v_tipo,
    'asistencias',
    NEW.id,
    auth.uid(),
    jsonb_build_object(
      'alumno_id', NEW.alumno_id,
      'sesion_id', NEW.sesion_clase_id,
      'maestro_id', v_maestro_id,
      'dias_consecutivos', 0
    ),
    v_correlation_id
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END $function$;

-- Función: fn_soi_evento_asistencia_registrada
CREATE OR REPLACE FUNCTION public.fn_soi_evento_asistencia_registrada()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_maestro_id uuid;
BEGIN
  SELECT maestro_id INTO v_maestro_id
  FROM public.sesiones_clase
  WHERE id = NEW.sesion_clase_id;

  INSERT INTO public.soi_eventos (
    tipo, entidad_tipo, entidad_id, actor_id, payload, correlation_id
  )
  VALUES (
    'asistencia.registrada',
    'asistencias',
    NEW.id,
    auth.uid(),
    jsonb_build_object(
      'alumno_id', NEW.alumno_id,
      'sesion_id', NEW.sesion_clase_id,
      'maestro_id', v_maestro_id,
      'estado', NEW.estado,
      'clase_id', NEW.clase_id
    ),
    NULL
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END $function$;

-- Función: fn_soi_evento_justificacion
CREATE OR REPLACE FUNCTION public.fn_soi_evento_justificacion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_tipo text;
  v_payload jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_tipo := 'justificacion.solicitada';
    v_payload := jsonb_build_object(
      'alumno_id', NEW.alumno_id,
      'ausencia_fecha', NEW.fecha,
      'motivo', NEW.motivo
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.estado IS DISTINCT FROM OLD.estado THEN
      CASE NEW.estado
        WHEN 'aprobado' THEN v_tipo := 'justificacion.aprobada';
        WHEN 'rechazado' THEN v_tipo := 'justificacion.rechazada';
        ELSE RETURN NEW;
      END CASE;
      v_payload := jsonb_build_object(
        'alumno_id', NEW.alumno_id,
        'ausencia_fecha', NEW.fecha,
        'estado_anterior', OLD.estado,
        'estado_nuevo', NEW.estado,
        'motivo', NEW.motivo,
        'revisado_por', NEW.revisado_por
      );
    ELSE
      RETURN NEW;
    END IF;
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.soi_eventos (tipo, entidad_tipo, entidad_id, actor_id, payload, correlation_id)
  VALUES (v_tipo, 'justificaciones', NEW.id, auth.uid(), v_payload, NULL)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END $function$;

-- Función: fn_soi_evento_periodo
CREATE OR REPLACE FUNCTION public.fn_soi_evento_periodo()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only fire if cerrado changed from false to true
  IF OLD.cerrado = false AND NEW.cerrado = true THEN
    INSERT INTO public.soi_eventos (
      tipo,
      entidad_tipo,
      entidad_id,
      actor_id,
      payload,
      correlation_id
    )
    VALUES (
      'periodo.cerrado',
      'periodos',
      NEW.id,
      auth.uid(),
      jsonb_build_object(
        'periodo_id', NEW.id,
        'nombre', NEW.nombre,
        'total_sesiones', 0,  -- Compute in Phase 2 enrichment
        'total_alumnos', 0    -- Compute in Phase 2 enrichment
      ),
      NULL
    )
    ON CONFLICT DO NOTHING;  -- Fire-and-forget
  END IF;

  RETURN NEW;
END $function$;

-- Función: fn_soi_evento_periodo_abierto
CREATE OR REPLACE FUNCTION public.fn_soi_evento_periodo_abierto()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.soi_eventos (
    tipo,
    entidad_tipo,
    entidad_id,
    actor_id,
    payload,
    correlation_id
  )
  VALUES (
    'periodo.abierto',
    'periodos',
    NEW.id,
    auth.uid(),
    jsonb_build_object(
      'periodo_id', NEW.id,
      'nombre', NEW.nombre,
      'fecha_inicio', NEW.fecha_inicio
    ),
    NULL
  )
  ON CONFLICT DO NOTHING;  -- Fire-and-forget: ignore if insert fails

  RETURN NEW;
END $function$;

-- Función: fn_soi_evento_sesion_creada
CREATE OR REPLACE FUNCTION public.fn_soi_evento_sesion_creada()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.soi_eventos (
    tipo,
    entidad_tipo,
    entidad_id,
    actor_id,
    payload,
    correlation_id
  )
  VALUES (
    'sesion.creada',
    'sesiones_clase',
    NEW.id,
    auth.uid(),
    jsonb_build_object(
      'clase_id', NEW.clase_id,
      'maestro_id', NEW.maestro_id,
      'fecha', NEW.fecha,
      'horario_id', NEW.horario_id
    ),
    NULL
  )
  ON CONFLICT DO NOTHING;  -- Fire-and-forget: ignore if insert fails

  RETURN NEW;
END $function$;

-- Función: fn_soi_evento_tarea
CREATE OR REPLACE FUNCTION public.fn_soi_evento_tarea()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_tipo text;
  v_payload jsonb;
BEGIN
  -- Determine event type
  IF TG_OP = 'INSERT' THEN
    v_tipo := 'tarea.creada';
    v_payload := jsonb_build_object(
      'titulo', NEW.titulo,
      'departamento', NEW.departamento,
      'prioridad', NEW.prioridad,
      'fecha_vencimiento', NEW.fecha_vencimiento
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only fire if estado changed
    IF NEW.estado IS DISTINCT FROM OLD.estado THEN
      CASE NEW.estado
        WHEN 'completada' THEN
          v_tipo := 'tarea.completada';
        WHEN 'escalada' THEN
          v_tipo := 'tarea.escalada';
        WHEN 'vencida' THEN
          v_tipo := 'tarea.vencida';
        ELSE
          RETURN NEW;  -- Not a state change we log
      END CASE;

      v_payload := jsonb_build_object(
        'titulo', NEW.titulo,
        'departamento', NEW.departamento,
        'prioridad', NEW.prioridad,
        'fecha_vencimiento', NEW.fecha_vencimiento,
        'estado_anterior', OLD.estado,
        'estado_nuevo', NEW.estado
      );
    ELSE
      RETURN NEW;  -- No estado change, skip
    END IF;
  ELSE
    RETURN NEW;  -- Ignore DELETE
  END IF;

  -- Log the event
  INSERT INTO public.soi_eventos (
    tipo,
    entidad_tipo,
    entidad_id,
    actor_id,
    payload,
    correlation_id
  )
  VALUES (
    v_tipo,
    'tareas_institucionales',
    NEW.id,
    COALESCE(NEW.updated_by, auth.uid()),
    v_payload,
    NEW.correlation_id
  )
  ON CONFLICT DO NOTHING;  -- Fire-and-forget

  RETURN NEW;
END $function$;

-- Función: fn_solicitudes_necesidades_open_process_case
CREATE OR REPLACE FUNCTION public.fn_solicitudes_necesidades_open_process_case()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_case_id uuid;
BEGIN
  IF NEW.correlation_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  v_case_id := public.fn_hermes_start_process_case(
    'ACM-NEC',
    coalesce(NEW.titulo, 'Solicitud de necesidad'),
    coalesce(NEW.descripcion, NEW.tipo_necesidad, 'Solicitud de necesidad'),
    'event',
    CASE
      WHEN NEW.prioridad = 'urgente' THEN 'critica'
      WHEN NEW.prioridad = 'alta' THEN 'alta'
      ELSE 'media'
    END,
    NEW.maestro_id,
    NEW.maestro_nombre,
    'maestro',
    NEW.maestro_id,
    NEW.titulo,
    jsonb_build_object(
      'solicitud_id', NEW.id,
      'tipo_necesidad', NEW.tipo_necesidad,
      'categoria', NEW.categoria,
      'prioridad', NEW.prioridad,
      'cantidad', NEW.cantidad,
      'area', NEW.area,
      'estado', NEW.estado
    )
  );

  UPDATE public.solicitudes_necesidades
  SET correlation_id = v_case_id,
      departamento_actual = 'ACM',
      updated_at = now()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$function$;

-- Función: fn_sugerir_nodo_por_texto
CREATE OR REPLACE FUNCTION public.fn_sugerir_nodo_por_texto(p_texto text)
 RETURNS TABLE(codigo text, nombre text, aciertos integer)
 LANGUAGE sql
 IMMUTABLE
AS $function$
  WITH vocab(codigo, nombre, termino) AS (VALUES
    ('ESC','Escalas','escala'),        ('ESC','Escalas','escalas'),
    ('ESC','Escalas','octava'),        ('ESC','Escalas','cromatic'),
    ('ARP','Arpegios y patrones','arpegio'),  ('ARP','Arpegios y patrones','triada'),
    ('ARP','Arpegios y patrones','acorde'),   ('ARP','Arpegios y patrones','patron'),
    ('MI','Mano izquierda','dedo'),    ('MI','Mano izquierda','dedos'),
    ('MI','Mano izquierda','mano izq'),('MI','Mano izquierda','posicion'),
    ('MI','Mano izquierda','vibrato'), ('MI','Mano izquierda','digitac'),
    ('MI','Mano izquierda','colocacion'),
    ('ARC','Arco','arco'),             ('ARC','Arco','detache'),
    ('ARC','Arco','legato'),           ('ARC','Arco','martele'),
    ('ARC','Arco','spiccato'),         ('ARC','Arco','staccato'),
    ('ARC','Arco','articulacion'),
    ('SON','Sonido','sonido'),         ('SON','Sonido','color'),
    ('SON','Sonido','dinamic'),        ('SON','Sonido','timbre'),
    ('AFI','Afinación','afinacion'),   ('AFI','Afinación','afinar'),
    ('AFI','Afinación','entonacion'),  ('AFI','Afinación','oido'),
    ('EST','Estudios técnicos','estudio'),   ('EST','Estudios técnicos','kreutzer'),
    ('EST','Estudios técnicos','mazas'),     ('EST','Estudios técnicos','rode'),
    ('EST','Estudios técnicos','gavinies'),  ('EST','Estudios técnicos','ejercicio tecnico'),
    ('REP','Repertorio','repertorio'), ('REP','Repertorio','obra'),
    ('REP','Repertorio','concierto'),  ('REP','Repertorio','pieza'),
    ('REP','Repertorio','cancion'),    ('REP','Repertorio','vivaldi'),
    ('REP','Repertorio','accolay'),    ('REP','Repertorio','danzon')
  ),
  norm AS (
    SELECT lower(translate(coalesce(p_texto,''),
      'áéíóúüñÁÉÍÓÚÜÑ','aeiouunAEIOUUN')) AS t
  )
  SELECT v.codigo, v.nombre, count(*)::integer
  FROM vocab v, norm n
  WHERE position(v.termino IN n.t) > 0
  GROUP BY v.codigo, v.nombre
  ORDER BY count(*) DESC, v.codigo;
$function$;

-- Función: fn_sync_campania_envio_estado
CREATE OR REPLACE FUNCTION public.fn_sync_campania_envio_estado()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.campania_envio_id IS NOT NULL AND NEW.estado IS DISTINCT FROM OLD.estado THEN
    IF NEW.estado = 'enviado' THEN
      UPDATE public.campania_envios SET estado = 'enviado', updated_at = now() WHERE id = NEW.campania_envio_id;
    ELSIF NEW.estado = 'fallido' THEN
      UPDATE public.campania_envios SET estado = 'fallido', updated_at = now() WHERE id = NEW.campania_envio_id;
    END IF;
  END IF;
  RETURN NEW;
END $function$;

-- Función: fn_sync_estado_reparacion
CREATE OR REPLACE FUNCTION public.fn_sync_estado_reparacion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.inventario_activos
       SET estado_uso = 'en_reparacion',
           updated_at = NOW()
     WHERE id = NEW.activo_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.estado = 'entregado' AND OLD.estado IS DISTINCT FROM 'entregado' THEN
    UPDATE public.inventario_activos
       SET estado_uso = CASE
             WHEN EXISTS (
               SELECT 1 FROM public.comodatos_activos
               WHERE activo_id = NEW.activo_id AND estado = 'activo'
             ) THEN 'prestado'
             ELSE 'disponible'
           END,
           updated_at = NOW()
     WHERE id = NEW.activo_id;
  END IF;

  RETURN NEW;
END;
$function$;

-- Función: fn_sync_estado_uso_activo
CREATE OR REPLACE FUNCTION public.fn_sync_estado_uso_activo()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.estado = 'activo' THEN
    UPDATE public.inventario_activos
       SET estado_uso = 'prestado',
           updated_at = NOW()
     WHERE id = NEW.activo_id;

  ELSIF TG_OP = 'UPDATE'
    AND OLD.estado = 'activo'
    AND NEW.estado IN ('devuelto', 'renovado') THEN
      UPDATE public.inventario_activos
         SET estado_uso = 'disponible',
             updated_at = NOW()
       WHERE id = NEW.activo_id;
  END IF;

  RETURN NEW;
END;
$function$;

-- Función: fn_tarea_log_historial
CREATE OR REPLACE FUNCTION public.fn_tarea_log_historial()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.estado IS DISTINCT FROM OLD.estado THEN
    INSERT INTO public.tarea_historial (tarea_id, campo, valor_anterior, valor_nuevo, actor_id, actor_nombre)
    VALUES (NEW.id, 'estado', OLD.estado::text, NEW.estado::text, NEW.updated_by, NEW.updated_by_nombre);
  END IF;
  IF NEW.asignado_a IS DISTINCT FROM OLD.asignado_a THEN
    INSERT INTO public.tarea_historial (tarea_id, campo, valor_anterior, valor_nuevo, actor_id, actor_nombre)
    VALUES (NEW.id, 'asignado_a', OLD.asignado_a, NEW.asignado_a, NEW.updated_by, NEW.updated_by_nombre);
  END IF;
  IF NEW.prioridad IS DISTINCT FROM OLD.prioridad THEN
    INSERT INTO public.tarea_historial (tarea_id, campo, valor_anterior, valor_nuevo, actor_id, actor_nombre)
    VALUES (NEW.id, 'prioridad', OLD.prioridad::text, NEW.prioridad::text, NEW.updated_by, NEW.updated_by_nombre);
  END IF;
  IF NEW.fecha_vencimiento IS DISTINCT FROM OLD.fecha_vencimiento THEN
    INSERT INTO public.tarea_historial (tarea_id, campo, valor_anterior, valor_nuevo, actor_id, actor_nombre)
    VALUES (NEW.id, 'fecha_vencimiento', OLD.fecha_vencimiento::text, NEW.fecha_vencimiento::text, NEW.updated_by, NEW.updated_by_nombre);
  END IF;
  IF NEW.entidad_id IS DISTINCT FROM OLD.entidad_id OR NEW.entidad_tipo IS DISTINCT FROM OLD.entidad_tipo THEN
    INSERT INTO public.tarea_historial (tarea_id, campo, valor_anterior, valor_nuevo, actor_id, actor_nombre)
    VALUES (NEW.id, 'entidad', coalesce(OLD.entidad_tipo,'') || ':' || coalesce(OLD.entidad_label,''), 
            coalesce(NEW.entidad_tipo,'') || ':' || coalesce(NEW.entidad_label,''), NEW.updated_by, NEW.updated_by_nombre);
  END IF;
  IF NEW.correlation_id IS DISTINCT FROM OLD.correlation_id THEN
    INSERT INTO public.tarea_historial (tarea_id, campo, valor_anterior, valor_nuevo, actor_id, actor_nombre)
    VALUES (NEW.id, 'correlation_id', OLD.correlation_id::text, NEW.correlation_id::text, NEW.updated_by, NEW.updated_by_nombre);
  END IF;
  RETURN NEW;
END $function$;

-- Función: fn_tasa_asistencia_periodo
CREATE OR REPLACE FUNCTION public.fn_tasa_asistencia_periodo(p_alumno_id uuid, p_desde date, p_hasta date DEFAULT CURRENT_DATE)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  v_total    int;
  v_presentes int;
BEGIN
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE estado IN ('P','J'))
  INTO v_total, v_presentes
  FROM asistencias
  WHERE alumno_id = p_alumno_id
    AND fecha BETWEEN p_desde AND p_hasta;

  IF v_total = 0 THEN RETURN NULL; END IF;
  RETURN ROUND(v_presentes::numeric / v_total * 100, 1);
END;
$function$;

-- Función: fn_trigger_desbloqueo_tareas_dependientes
CREATE OR REPLACE FUNCTION public.fn_trigger_desbloqueo_tareas_dependientes()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.estado = 'completada' AND (OLD.estado IS DISTINCT FROM 'completada') THEN
    UPDATE public.tareas_institucionales
    SET estado = 'pendiente', updated_at = now()
    WHERE depende_de_tarea_id = NEW.id
      AND estado = 'bloqueada_por_dependencia';
  END IF;
  RETURN NEW;
END;
$function$;

-- Función: fn_trigger_evaluacion_gamificacion
CREATE OR REPLACE FUNCTION public.fn_trigger_evaluacion_gamificacion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.maestro_indicador_id IS NOT NULL THEN
    PERFORM fn_actualizar_racha_alumno(NEW.alumno_id, COALESCE(NEW.fecha_evaluacion::date, CURRENT_DATE), NEW.clase_id);
    PERFORM fn_evaluar_logros_alumno(NEW.alumno_id);
  END IF;
  RETURN NEW;
END;
$function$;

-- Función: fn_trigger_hermes_task_wa_alert
CREATE OR REPLACE FUNCTION public.fn_trigger_hermes_task_wa_alert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_event_title text;
  v_group_jid text;
  v_msg text;
  v_teacher_phone text;
BEGIN
  SELECT titulo INTO v_event_title 
  FROM public.calendario_institucional 
  WHERE id = NEW.event_id;

  IF NEW.prioridad IN ('critica', 'alta') THEN
    v_msg := '🚨 *HERMES TASK DELEGATED* (' || NEW.prioridad || ')' || E'\n' ||
             '• *Evento:* ' || coalesce(v_event_title, 'General') || E'\n' ||
             '• *Tarea:* ' || NEW.titulo || E'\n' ||
             '• *Dept:* ' || NEW.departamento || E'\n' ||
             '• *Vence:* ' || coalesce(NEW.fecha_vencimiento::text, 'Sin fecha') || E'\n\n' ||
             'Por favor, ingresa al portal de tareas de Hermes para completar los requisitos.';


    PERFORM public.fn_hermes_queue_whatsapp(
      NEW.departamento::text || '_coordinator@s.whatsapp.net',
      v_msg
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- Función: fn_trigger_historial_estado_alumno
CREATE OR REPLACE FUNCTION public.fn_trigger_historial_estado_alumno()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.activo IS DISTINCT FROM NEW.activo THEN
    INSERT INTO historial_estado_alumno (alumno_id, estado, motivo, fecha)
    VALUES (
      NEW.id,
      CASE WHEN NEW.activo THEN 'activo' ELSE 'baja_voluntaria' END,
      'Cambio automático detectado',
      CURRENT_DATE
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- Función: fn_update_notif_asistencia_timestamp
CREATE OR REPLACE FUNCTION public.fn_update_notif_asistencia_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Función: fn_update_notifications_on_attendance_change
CREATE OR REPLACE FUNCTION public.fn_update_notifications_on_attendance_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
    DECLARE
      v_vencida_count INT;
      v_pendiente_count INT;
      v_dedup_key TEXT;
      v_mensaje TEXT;
      v_user_has_notif BOOLEAN;
    BEGIN
      -- Solo actuamos si el estado cambió a 'registrada' (asistencia finalizada)
      IF (TG_OP = 'UPDATE' AND OLD.estado IS DISTINCT FROM NEW.estado AND NEW.estado = 'registrada')
         OR (TG_OP = 'INSERT' AND NEW.estado = 'registrada') THEN
        -- 1. Buscamos si el maestro tiene una notificación activa hoy
        v_dedup_key := NEW.maestro_id::TEXT || ':vencidas_pendientes:' || DATE(NOW())::TEXT;
        SELECT EXISTS (
          SELECT 1 FROM public.notificaciones
          WHERE profile_id = NEW.maestro_id
            AND tipo = 'sistema'
            AND (dedup_key = v_dedup_key OR dedup_key = NEW.maestro_id::TEXT || ':vencidas_pendientes:' || DATE(NEW.fecha)::TEXT)
            AND estado = 'pendiente'
        ) INTO v_user_has_notif;
        IF v_user_has_notif THEN
          -- 2. Recalculamos la cantidad de clases sin registrar
          SELECT COUNT(*) INTO v_vencida_count
          FROM public.teacher_class_fill_metrics
          WHERE maestro_id = NEW.maestro_id
            AND asistencia_marked_at IS NULL
            AND fecha < CURRENT_DATE - INTERVAL '7 days';

          SELECT COUNT(*) INTO v_pendiente_count
          FROM public.teacher_class_fill_metrics
          WHERE maestro_id = NEW.maestro_id
            AND asistencia_marked_at IS NULL
            AND fecha >= CURRENT_DATE - INTERVAL '7 days';

          -- 3. Si todavía quedan clases, actualizamos el texto estático
          IF v_vencida_count > 0 OR v_pendiente_count > 0 THEN
            v_mensaje := 'Tienes ' || v_vencida_count || ' clases vencidas, '
                         || v_pendiente_count || ' pendientes';

            UPDATE public.notificaciones
            SET mensaje = v_mensaje,
                created_at = NOW()
            WHERE profile_id = NEW.maestro_id
              AND (dedup_key = v_dedup_key OR dedup_key = NEW.maestro_id::TEXT || ':vencidas_pendientes:' || DATE(NEW.fecha)::TEXT)
              AND estado = 'pendiente';
          ELSE
            -- 4. Si no le quedan más clases por registrar, auto-resolvemos (marcar como leída)
            UPDATE public.notificaciones
            SET estado = 'leida',
                leida_en = NOW()
            WHERE profile_id = NEW.maestro_id
              AND (dedup_key = v_dedup_key OR dedup_key = NEW.maestro_id::TEXT || ':vencidas_pendientes:' || DATE(NEW.fecha)::TEXT)
              AND estado = 'pendiente';
          END IF;
        END IF;
      END IF;

      RETURN NEW;
    END;
    $function$;

-- Función: fn_upsert_protocolo
CREATE OR REPLACE FUNCTION public.fn_upsert_protocolo(p_nombre text, p_tipo text, p_descripcion text DEFAULT NULL::text, p_tareas jsonb DEFAULT '[]'::jsonb)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_protocolo_id uuid;
BEGIN
  IF get_user_role() != 'admin' THEN
    RETURN json_build_object('error', 'Solo admin puede crear/editar protocolos');
  END IF;

  INSERT INTO public.protocolos(nombre, tipo, descripcion, tareas)
  VALUES(p_nombre, p_tipo, p_descripcion, COALESCE(p_tareas, '[]'))
  ON CONFLICT (nombre)
  DO UPDATE SET descripcion = p_descripcion, tareas = p_tareas, updated_at = now()
  RETURNING id INTO v_protocolo_id;

  RETURN json_build_object('success', true, 'protocolo_id', v_protocolo_id);
END
$function$;

-- Función: fn_validar_checklist_tarea
CREATE OR REPLACE FUNCTION public.fn_validar_checklist_tarea()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_items_pendientes integer;
BEGIN
  IF NEW.estado = 'completada' AND OLD.estado != 'completada' THEN
    IF jsonb_array_length(COALESCE(NEW.checklist, '[]'::jsonb)) > 0 THEN
      SELECT COUNT(*) INTO v_items_pendientes
      FROM jsonb_array_elements(NEW.checklist) AS item
      WHERE NOT COALESCE((item->>'completado')::boolean, false);
      IF v_items_pendientes > 0 THEN
        RAISE EXCEPTION
          'No se puede completar la tarea: % item(s) del checklist están pendientes.',
          v_items_pendientes
          USING ERRCODE = 'P0001';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- Función: fn_validar_cierre_periodo
CREATE OR REPLACE FUNCTION public.fn_validar_cierre_periodo(p_periodo_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH periodo AS (
    SELECT * FROM public.periodos WHERE id = p_periodo_id
  ),
  ses AS (
    SELECT
      s.id, s.fecha, s.borrador, s.estado,
      c.nombre AS clase_nombre,
      c.maestro_principal_id AS maestro_id,
      m.nombre_completo AS maestro_nombre,
      EXISTS (SELECT 1 FROM public.asistencias a WHERE a.sesion_clase_id = s.id) AS tiene_asistencia
    FROM public.sesiones_clase s
    CROSS JOIN periodo p
    LEFT JOIN public.clases   c ON c.id = s.clase_id
    LEFT JOIN public.maestros m ON m.id = c.maestro_principal_id
    WHERE s.fecha BETWEEN p.fecha_inicio AND p.fecha_fin
      AND s.estado <> 'cancelada'
      AND public.fn_es_dia_lectivo(s.fecha)
  ),
  tot AS (
    SELECT count(*)::int AS total,
           count(*) FILTER (WHERE tiene_asistencia AND borrador IS NOT TRUE)::int AS completas
    FROM ses
  )
  SELECT jsonb_build_object(
    'periodo', jsonb_build_object(
      'id', p.id, 'nombre', p.nombre,
      'fecha_inicio', p.fecha_inicio, 'fecha_fin', p.fecha_fin,
      'cerrado', p.cerrado),
    'criterio', 'Sesion completa = tiene marcas de asistencia y no esta en borrador. Solo se evaluan dias lectivos.',
    'total_sesiones', t.total,
    'completas', t.completas,
    'incompletas', t.total - t.completas,
    'pct_completitud',
      CASE WHEN t.total = 0 THEN NULL
           ELSE round((t.completas::numeric / t.total::numeric) * 100, 1) END,
    'puede_cerrar', (t.total > 0 AND t.completas = t.total),
    'semaforo',
      CASE WHEN t.total = 0 THEN 'SIN_SESIONES'
           WHEN t.completas = t.total THEN 'VERDE'
           WHEN t.completas::numeric / t.total::numeric >= 0.9 THEN 'AMARILLO'
           ELSE 'ROJO' END,
    'por_maestro', (
      SELECT coalesce(jsonb_agg(jsonb_build_object(
          'maestro_id', maestro_id,
          'maestro', coalesce(maestro_nombre, 'Sin docente asignado'),
          'total', n, 'completas', ok, 'incompletas', n - ok,
          'pct', CASE WHEN n = 0 THEN NULL ELSE round((ok::numeric/n::numeric)*100,1) END
        ) ORDER BY (n - ok) DESC, maestro_nombre), '[]'::jsonb)
      FROM (SELECT maestro_id, maestro_nombre, count(*)::int n,
                   count(*) FILTER (WHERE tiene_asistencia AND borrador IS NOT TRUE)::int ok
            FROM ses GROUP BY 1,2) x),
    'sesiones_incompletas', (
      SELECT coalesce(jsonb_agg(jsonb_build_object(
          'sesion_id', id, 'fecha', fecha, 'clase', clase_nombre,
          'maestro', coalesce(maestro_nombre, 'Sin docente asignado'),
          'estado', estado, 'borrador', borrador,
          'falta', CASE WHEN NOT tiene_asistencia THEN 'asistencia'
                        WHEN borrador IS TRUE THEN 'confirmacion'
                        ELSE 'otro' END
        ) ORDER BY fecha), '[]'::jsonb)
      FROM ses
      WHERE NOT (tiene_asistencia AND borrador IS NOT TRUE))
  )
  FROM periodo p CROSS JOIN tot t;
$function$;

-- Función: fn_validar_reinscripcion_alumno
CREATE OR REPLACE FUNCTION public.fn_validar_reinscripcion_alumno(p_alumno_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_alumno RECORD;
  v_deuda_alumno bigint := 0;
  v_deuda_familia bigint := 0;
  v_deuda_total bigint := 0;
BEGIN
  SELECT a.id, a.nombre_completo, a.activo, a.estado_academico, a.bloqueo_reinscripcion, a.familia_id
    INTO v_alumno FROM public.alumnos a WHERE a.id = p_alumno_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'El alumno con ID % no existe.', p_alumno_id;
  END IF;

  v_deuda_alumno := public.fn_deuda_viva(p_alumno_id, NULL);
  v_deuda_familia := public.fn_deuda_viva(NULL, v_alumno.familia_id);
  v_deuda_total := GREATEST(v_deuda_alumno, v_deuda_familia);

  IF v_deuda_total > 0 OR v_alumno.bloqueo_reinscripcion = true THEN
    RETURN jsonb_build_object(
      'permite_reinscripcion', false,
      'motivo', CASE
        WHEN v_deuda_total > 0
          THEN 'El alumno o su familia registra un impedimento financiero. Debe saldar RD$ '
               || to_char(v_deuda_total / 100.0, 'FM999999990.00') || ' antes de reinscribirse.'
        ELSE 'Bloqueo de reinscripcion activo sin deuda viva: requiere levantamiento manual.'
      END,
      'deuda_centavos', v_deuda_total,
      'estado_academico', v_alumno.estado_academico);
  END IF;

  RETURN jsonb_build_object(
    'permite_reinscripcion', true,
    'motivo', 'Alumno habilitado financieramente para reinscripcion.',
    'deuda_centavos', 0,
    'estado_academico', v_alumno.estado_academico);
END;
$function$;

-- Función: fn_validate_maestro_disponibilidad_horario
CREATE OR REPLACE FUNCTION public.fn_validate_maestro_disponibilidad_horario()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_day_name TEXT;
  v_disponibilidad JSONB;
  v_time_range JSONB;
  v_slot_start TIME;
  v_slot_end TIME;
  v_slot_exists BOOLEAN := false;
BEGIN
  -- Map dia_semana (1=Lunes) to day name
  v_day_name := CASE NEW.dia_semana
    WHEN 1 THEN 'lunes'
    WHEN 2 THEN 'martes'
    WHEN 3 THEN 'miercoles'
    WHEN 4 THEN 'jueves'
    WHEN 5 THEN 'viernes'
    WHEN 6 THEN 'sabado'
    WHEN 7 THEN 'domingo'
  END;

  -- Get maestro's disponibilidad JSON
  SELECT disponibilidad INTO v_disponibilidad
  FROM maestros WHERE id = NEW.maestro_id;

  -- Check if day exists in disponibilidad
  IF v_disponibilidad->>v_day_name IS NULL THEN
    RAISE EXCEPTION 'Maestro % has no availability on %', NEW.maestro_id, v_day_name;
  END IF;

  -- Check if requested time falls within any available slot for that day
  FOR v_time_range IN SELECT jsonb_array_elements(v_disponibilidad->v_day_name)
  LOOP
    v_slot_start := (v_time_range->>0)::TIME;
    v_slot_end := (v_time_range->>1)::TIME;

    -- Check if NEW.hora_inicio >= slot_start AND NEW.hora_fin <= slot_end
    IF NEW.hora_inicio >= v_slot_start AND NEW.hora_fin <= v_slot_end THEN
      v_slot_exists := true;
      EXIT;
    END IF;
  END LOOP;

  IF NOT v_slot_exists THEN
    RAISE EXCEPTION 'Maestro % is not available from % to % on %',
      NEW.maestro_id, NEW.hora_inicio, NEW.hora_fin, v_day_name;
  END IF;

  RETURN NEW;
END;
$function$;

-- Función: fn_validate_salon_capacity_horario
CREATE OR REPLACE FUNCTION public.fn_validate_salon_capacity_horario()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_student_count INT;
  v_salon_capacity INT;
BEGIN
  -- Count active students in this class
  SELECT COUNT(*) INTO v_student_count
  FROM alumnos_clases
  WHERE clase_id = NEW.clase_id AND activo = true;

  -- Get salon capacity
  SELECT capacidad_maxima INTO v_salon_capacity
  FROM salones WHERE id = NEW.salon_id;

  -- Check capacity
  IF v_student_count > v_salon_capacity THEN
    RAISE EXCEPTION 'Salon % has capacity % but clase has % enrolled students',
      NEW.salon_id, v_salon_capacity, v_student_count;
  END IF;

  RETURN NEW;
END;
$function$;

-- Función: fn_validate_salon_no_overlap
CREATE OR REPLACE FUNCTION public.fn_validate_salon_no_overlap()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_conflict_count INT;
BEGIN
  -- Check if another horario exists in same salon, same day, with time overlap
  -- Two time ranges overlap if: new_start < existing_end AND new_end > existing_start
  SELECT COUNT(*) INTO v_conflict_count
  FROM horarios
  WHERE salon_id = NEW.salon_id
    AND dia_semana = NEW.dia_semana
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')
    AND NEW.hora_inicio < hora_fin
    AND NEW.hora_fin > hora_inicio
    AND activo = true;

  IF v_conflict_count > 0 THEN
    RAISE EXCEPTION 'Salon % is already booked for that time on day %',
      NEW.salon_id, NEW.dia_semana;
  END IF;

  RETURN NEW;
END;
$function$;

-- Función: fn_verificar_conflicto_cita
CREATE OR REPLACE FUNCTION public.fn_verificar_conflicto_cita(p_fecha_inicio timestamp with time zone, p_fecha_fin timestamp with time zone, p_departamento text DEFAULT NULL::text)
 RETURNS TABLE(hay_conflicto boolean, evento_id uuid, evento_titulo text, evento_inicio timestamp with time zone, evento_fin timestamp with time zone, evento_departamento text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    true AS hay_conflicto,
    c.id AS evento_id,
    c.titulo AS evento_titulo,
    c.fecha_inicio AS evento_inicio,
    c.fecha_fin AS evento_fin,
    c.departamento_responsable::text AS evento_departamento
  FROM public.calendario_institucional c
  WHERE c.estado IN ('activo','programado','en_curso')
    AND tstzrange(c.fecha_inicio, c.fecha_fin, '[)') && tstzrange(p_fecha_inicio, p_fecha_fin, '[)')
    AND (p_departamento IS NULL OR c.departamento_responsable::text = p_departamento);
$function$;

-- Función: fn_verificar_stock_minimo
CREATE OR REPLACE FUNCTION public.fn_verificar_stock_minimo()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.stock_actual <= NEW.stock_minimo AND OLD.stock_actual > OLD.stock_minimo THEN
    INSERT INTO public.notificaciones_caja (
      tipo, canal, prioridad, titulo, cuerpo, datos_extra
    )
    VALUES (
      'stock_bajo',
      'portal',
      'alta',
      'Stock bajo: ' || NEW.nombre,
      'El accesorio "' || NEW.nombre || '" ha bajado a ' || NEW.stock_actual::text ||
        ' unidades (mínimo: ' || NEW.stock_minimo::text || ').',
      row_to_json(NEW)::jsonb
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- Función: fn_whatsapp_cap_hoy
CREATE OR REPLACE FUNCTION public.fn_whatsapp_cap_hoy()
 RETURNS integer
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE cfg public.hermes_whatsapp_config; v_dias int;
BEGIN
  SELECT * INTO cfg FROM public.hermes_whatsapp_config WHERE activo = true LIMIT 1;
  IF NOT FOUND THEN RETURN 0; END IF;
  IF cfg.warmup_desde IS NULL THEN RETURN cfg.cap_diario; END IF;
  v_dias := ((now() AT TIME ZONE 'America/Santo_Domingo')::date - cfg.warmup_desde);
  IF v_dias >= cfg.warmup_dias THEN RETURN cfg.cap_diario; END IF;
  IF v_dias < 0 THEN RETURN cfg.warmup_inicio; END IF;
  RETURN round(cfg.warmup_inicio + (cfg.cap_diario - cfg.warmup_inicio)::numeric * v_dias / cfg.warmup_dias);
END $function$;

-- Función: fn_whatsapp_enviados_hoy
CREATE OR REPLACE FUNCTION public.fn_whatsapp_enviados_hoy()
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT count(*)::int FROM public.hermes_whatsapp_queue
  WHERE estado = 'enviado'
    AND (procesado_at AT TIME ZONE 'America/Santo_Domingo')::date
        = (now() AT TIME ZONE 'America/Santo_Domingo')::date;
$function$;

-- Función: fn_whatsapp_optout
CREATE OR REPLACE FUNCTION public.fn_whatsapp_optout(p_jid text, p_motivo text DEFAULT 'usuario'::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.whatsapp_optout (jid, motivo) VALUES (p_jid, p_motivo)
    ON CONFLICT (jid) DO NOTHING;
  UPDATE public.campania_envios SET estado = 'opt_out', updated_at = now()
    WHERE jid = p_jid AND estado IN ('pendiente_envio','encolado');
  UPDATE public.hermes_whatsapp_queue SET estado = 'cancelado'
    WHERE jid = p_jid AND estado = 'pendiente';
END $function$;

-- Función: fn_whatsapp_rate_excedido
CREATE OR REPLACE FUNCTION public.fn_whatsapp_rate_excedido(p_jid text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_tope int; v_count int;
BEGIN
  SELECT coalesce(rate_limit_hora, 10) INTO v_tope FROM public.hermes_whatsapp_config WHERE activo = true LIMIT 1;
  IF v_tope IS NULL THEN v_tope := 10; END IF;
  SELECT count(*) INTO v_count FROM public.whatsapp_webhook_log
    WHERE jid_remitente = p_jid AND created_at > now() - interval '1 hour';
  RETURN v_count >= v_tope;
END $function$;

-- Función: fn_whatsapp_reclamar_pendientes
CREATE OR REPLACE FUNCTION public.fn_whatsapp_reclamar_pendientes(p_limite integer DEFAULT NULL::integer)
 RETURNS SETOF hermes_whatsapp_queue
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_cfg public.hermes_whatsapp_config;
  v_enable_whatsapp boolean;
  v_quiet_start time;
  v_quiet_end time;
  v_local_time time;
  v_cap_diario integer;
  v_cap_horario integer;
  v_enviados_hoy integer;
  v_enviados_hora integer;
  v_limite integer;
  v_dedup_horas numeric;
BEGIN
  SELECT * INTO v_cfg
  FROM public.hermes_whatsapp_config
  WHERE activo = true
  LIMIT 1;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT coalesce((SELECT value FROM public.system_config WHERE key = 'whatsapp_ingest_enabled'), 'false') = 'true'
  INTO v_enable_whatsapp;
  IF v_enable_whatsapp IS NOT true THEN RETURN; END IF;

  SELECT nullif((SELECT value FROM public.system_config WHERE key = 'whatsapp_quiet_hours_start'), '')::time,
         nullif((SELECT value FROM public.system_config WHERE key = 'whatsapp_quiet_hours_end'), '')::time
  INTO v_quiet_start, v_quiet_end;

  v_local_time := (now() AT TIME ZONE 'America/Santo_Domingo')::time;
  IF v_quiet_start IS NOT NULL AND v_quiet_end IS NOT NULL AND (
    (v_quiet_start < v_quiet_end AND v_local_time BETWEEN v_quiet_start AND v_quiet_end)
    OR (v_quiet_start >= v_quiet_end AND (v_local_time >= v_quiet_start OR v_local_time <= v_quiet_end))
  ) THEN RETURN; END IF;

  v_cap_diario := public.fn_whatsapp_cap_hoy();
  v_cap_horario := coalesce(v_cfg.cap_horario, 0);
  v_enviados_hoy := public.fn_whatsapp_enviados_hoy();
  SELECT count(*) INTO v_enviados_hora
  FROM public.hermes_whatsapp_queue
  WHERE estado = 'enviado' AND procesado_at >= now() - interval '1 hour';

  v_limite := least(
    coalesce(nullif(p_limite, 0), v_cfg.batch_size, 10),
    coalesce(v_cfg.batch_size, 10),
    greatest(v_cap_diario - v_enviados_hoy, 0),
    greatest(v_cap_horario - v_enviados_hora, 0)
  );
  IF v_limite <= 0 THEN RETURN; END IF;

  v_dedup_horas := coalesce(nullif((SELECT value FROM public.system_config WHERE key = 'whatsapp_dedup_jid_horas'), '')::numeric, 24);

  RETURN QUERY
  WITH candidatas AS (
    SELECT q.id
    FROM public.hermes_whatsapp_queue q
    LEFT JOIN public.campania_envios ce ON ce.id = q.campania_envio_id
    WHERE q.estado = 'pendiente'
      AND coalesce(q.intentos, 0) < 3
      AND NOT EXISTS (SELECT 1 FROM public.whatsapp_optout o WHERE o.jid = q.jid)
      AND (
        q.campania_envio_id IS NULL
        OR EXISTS (
          SELECT 1
          FROM public.whatsapp_consentimientos wc
          WHERE wc.jid = q.jid
            AND wc.campania_id = ce.campania_id
            AND wc.acepta_campania = true
        )
      )
      AND NOT EXISTS (
        SELECT 1 FROM public.hermes_whatsapp_queue sent
        WHERE sent.jid = q.jid
          AND sent.estado = 'enviado'
          AND sent.procesado_at >= now() - (v_dedup_horas || ' hours')::interval
      )
    ORDER BY q.created_at
    FOR UPDATE OF q SKIP LOCKED
    LIMIT v_limite
  )
  UPDATE public.hermes_whatsapp_queue q
  SET estado = 'procesando', intentos = coalesce(q.intentos, 0) + 1
  FROM candidatas c
  WHERE q.id = c.id
  RETURNING q.*;
END;
$function$;

-- Función: generar_contrato_pdf
CREATE OR REPLACE FUNCTION public.generar_contrato_pdf(p_comodato_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_comodato RECORD;
BEGIN
  SELECT * INTO v_comodato FROM public.comodatos_activos WHERE id = p_comodato_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Comodato no encontrado';
  END IF;
  
  RETURN jsonb_build_object(
    'url', COALESCE(v_comodato.contrato_firmado_url, 'https://storage.test/comodatos/' || p_comodato_id || '/contrato.pdf'),
    'comodatoId', p_comodato_id
  );
END;
$function$;

-- Función: generar_numero_factura
CREATE OR REPLACE FUNCTION public.generar_numero_factura()
 RETURNS character varying
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_anio   VARCHAR(4);
  v_contador INTEGER;
  v_numero VARCHAR(50);
BEGIN
  v_anio := EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;
  SELECT COALESCE(MAX(SUBSTRING(numero_factura FROM '\d+$')::INTEGER), 0) + 1
    INTO v_contador
    FROM public.facturas_reparacion
   WHERE numero_factura LIKE 'FACT-' || v_anio || '-%';
  v_numero := 'FACT-' || v_anio || '-' || LPAD(v_contador::VARCHAR, 5, '0');
  RETURN v_numero;
END;
$function$;

-- Función: generar_reporte_inventario
CREATE OR REPLACE FUNCTION public.generar_reporte_inventario(p_tipo text, p_filtros jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_resumen jsonb;
  v_por_tipo jsonb;
  v_por_estado jsonb;
  v_total_reparaciones integer;
  v_total_comodatos integer;
  v_activos_comodatos integer;
  v_datos jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No auth context';
  END IF;
  
  IF NOT es_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_tipo = 'general' OR p_tipo = 'resumen' THEN
    SELECT jsonb_build_object(
      'total', COUNT(*),
      'disponibles', COUNT(*) FILTER (WHERE estado_uso = 'disponible'),
      'en_uso', COUNT(*) FILTER (WHERE estado_uso = 'prestado'),
      'ociosos', (SELECT COUNT(*)::integer FROM public.comodatos_activos WHERE estado = 'activo'),
      'en_reparacion', COUNT(*) FILTER (WHERE estado_uso = 'en_reparacion'),
      'de_baja', COUNT(*) FILTER (WHERE estado_uso = 'de_baja'),
      'valor_total', COALESCE(SUM(valor_adquisicion), 0)
    ) INTO v_resumen
    FROM public.inventario_activos
    WHERE activo = TRUE;

    IF p_tipo = 'general' THEN
      v_datos := v_resumen;
    ELSE
      SELECT COALESCE(jsonb_object_agg(COALESCE(tipo_instrumento, 'Sin tipo'), cnt), '{}'::jsonb) INTO v_por_tipo
      FROM (
        SELECT tipo_instrumento, COUNT(*)::integer AS cnt
        FROM public.inventario_activos
        WHERE activo = TRUE
        GROUP BY tipo_instrumento
      ) t;
      v_datos := jsonb_build_object(
        'resumen', v_resumen,
        'por_tipo', v_por_tipo
      );
    END IF;

  ELSIF p_tipo = 'reparaciones' THEN
    SELECT COUNT(*)::integer INTO v_total_reparaciones
    FROM public.inventario_reparaciones;

    SELECT COALESCE(jsonb_object_agg(COALESCE(estado, 'Sin estado'), cnt), '{}'::jsonb) INTO v_por_estado
    FROM (
      SELECT estado, COUNT(*)::integer AS cnt
      FROM public.inventario_reparaciones
      GROUP BY estado
    ) t;

    v_datos := jsonb_build_object(
      'total', v_total_reparaciones,
      'por_estado', v_por_estado
    );

  ELSIF p_tipo = 'comodatos' THEN
    SELECT COUNT(*)::integer INTO v_total_comodatos
    FROM public.comodatos_activos;

    SELECT COUNT(*)::integer INTO v_activos_comodatos
    FROM public.comodatos_activos
    WHERE estado = 'activo';

    v_datos := jsonb_build_object(
      'total', v_total_comodatos,
      'activos', v_activos_comodatos
    );
  ELSE
    v_datos := '{}'::jsonb;
  END IF;

  RETURN jsonb_build_object(
    'tipo', p_tipo,
    'fecha_generacion', NOW()::text,
    'filtros_aplicados', p_filtros,
    'datos', v_datos
  );
END;
$function$;

-- Función: generate_pending_class_notifications
CREATE OR REPLACE FUNCTION public.generate_pending_class_notifications()
 RETURNS TABLE(maestros_processed integer, notifications_created integer, errors_logged integer)
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_maestro_id UUID;
  v_profile_id UUID;
  v_vencida_count INT;
  v_pendiente_count INT;
  v_dedup_key TEXT;
  v_mensaje TEXT;
  v_titulo TEXT;
  v_errors INT := 0;
  v_created INT := 0;
  v_processed INT := 0;
  v_profile_exists BOOLEAN;
BEGIN
  IF NOT public.fn_es_dia_lectivo((NOW() AT TIME ZONE 'America/Santo_Domingo')::DATE) THEN
    RAISE NOTICE 'Dia no lectivo. Abortando alertas de escalamiento.';
    RETURN QUERY SELECT 0::INT, 0::INT, 0::INT;
    RETURN;
  END IF;

  FOR v_maestro_id, v_profile_id IN
    SELECT DISTINCT tcfm.maestro_id, m.user_id
    FROM teacher_class_fill_metrics tcfm
    INNER JOIN maestros m ON m.id = tcfm.maestro_id
    WHERE tcfm.asistencia_marked_at IS NULL
      AND m.user_id IS NOT NULL
      AND public.fn_es_dia_lectivo(tcfm.fecha)
  LOOP
    v_processed := v_processed + 1;

    BEGIN
      SELECT EXISTS(SELECT 1 FROM profiles WHERE id = v_profile_id) INTO v_profile_exists;

      IF NOT v_profile_exists THEN
        RAISE EXCEPTION 'Maestro profile does not exist: %', v_profile_id;
      END IF;

      SELECT COUNT(*) INTO v_vencida_count
      FROM teacher_class_fill_metrics
      WHERE maestro_id = v_maestro_id
        AND asistencia_marked_at IS NULL
        AND fecha < CURRENT_DATE - INTERVAL '7 days'
        AND public.fn_es_dia_lectivo(fecha);

      SELECT COUNT(*) INTO v_pendiente_count
      FROM teacher_class_fill_metrics
      WHERE maestro_id = v_maestro_id
        AND asistencia_marked_at IS NULL
        AND fecha >= CURRENT_DATE - INTERVAL '7 days'
        AND public.fn_es_dia_lectivo(fecha);

      IF v_vencida_count > 0 OR v_pendiente_count > 0 THEN
        v_dedup_key := v_maestro_id::TEXT || ':vencidas_pendientes:' || DATE(NOW())::TEXT;

        IF NOT EXISTS (
          SELECT 1 FROM notificaciones
          WHERE dedup_key = v_dedup_key
            AND created_at > NOW() - INTERVAL '24 hours'
        ) THEN
          v_titulo := 'Clases pendientes de asistencia';
          v_mensaje := 'Tienes ' || v_vencida_count || ' clases vencidas, '
                       || v_pendiente_count || ' pendientes';

          INSERT INTO notificaciones (
            profile_id, tipo, titulo, mensaje, deep_link, estado, dedup_key, leida_en
          ) VALUES (
            v_profile_id, 'sistema', v_titulo, v_mensaje,
            '/portal/notificaciones', 'pendiente', v_dedup_key, NULL
          );

          v_created := v_created + 1;
        END IF;
      END IF;

    EXCEPTION WHEN OTHERS THEN
      INSERT INTO notification_trigger_logs (
        execution_time, status, error_message, context
      ) VALUES (
        NOW(), 'ERROR', SQLERRM,
        'maestro_id=' || v_maestro_id::TEXT || ', profile_id=' || v_profile_id::TEXT
      );
      v_errors := v_errors + 1;
    END;
  END LOOP;

  INSERT INTO notification_trigger_logs (
    execution_time, status, maestros_processed, notifications_created, errors_count
  ) VALUES (
    NOW(), 'SUCCESS', v_processed, v_created, v_errors
  );

  RETURN QUERY SELECT v_processed, v_created, v_errors;
END;
$function$;

-- Función: generate_salon_code
CREATE OR REPLACE FUNCTION public.generate_salon_code()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.codigo_salon IS NULL OR NEW.codigo_salon = '' THEN
    NEW.codigo_salon := 'SAL-' || LPAD(nextval('public.salones_codigo_seq')::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$function$;

-- Función: get_alumnos_disponibles_para_inscripcion
CREATE OR REPLACE FUNCTION public.get_alumnos_disponibles_para_inscripcion()
 RETURNS TABLE(id uuid, nombre_completo text, instrumento_principal text, activo boolean, nivel text, promedio_notas numeric)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  return query
  select a.id, a.nombre_completo, a.instrumento_principal, a.activo, a.nivel, a.promedio_notas
  from public.alumnos a
  where a.activo = true
  order by a.nombre_completo asc;
end;
$function$;

-- Función: get_app_user_role
CREATE OR REPLACE FUNCTION public.get_app_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role::TEXT FROM public.app_users WHERE id = auth.uid();
$function$;

-- Función: get_informe_academico_semestral
CREATE OR REPLACE FUNCTION public.get_informe_academico_semestral(p_periodo_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_periodo RECORD;
  v_periodo_id UUID;
  v_evolucion_mensual JSONB;
  v_cuadro_honor JSONB;
  v_ranking_ausencias JSONB;
  v_causas_justificaciones JSONB;
  v_retencion_catedra JSONB;
  v_alumnos_destacados JSONB;
  v_evaluacion_docente JSONB;
BEGIN
  -- Obtener período activo o especificado
  IF p_periodo_id IS NOT NULL THEN
    SELECT * INTO v_periodo FROM public.periodos WHERE id = p_periodo_id;
  ELSE
    SELECT * INTO v_periodo FROM public.periodos WHERE activo = true LIMIT 1;
    IF v_periodo IS NULL THEN
      SELECT * INTO v_periodo FROM public.periodos ORDER BY fecha_inicio DESC LIMIT 1;
    END IF;
  END IF;

  v_periodo_id := v_periodo.id;

  -- 1. Evolución Mensual
  WITH meses_agg AS (
    SELECT
      EXTRACT(MONTH FROM a.fecha) AS mes,
      EXTRACT(YEAR FROM a.fecha) AS anio,
      TO_CHAR(a.fecha, 'TMMonth YYYY') AS mes_nombre,
      COUNT(*) AS total_registros,
      COUNT(*) FILTER (WHERE a.estado IN ('presente', 'P', 'tarde', 'T')) AS presentes_total,
      COUNT(*) FILTER (WHERE a.estado IN ('ausente', 'A')) AS ausentes_total,
      COUNT(*) FILTER (WHERE a.estado IN ('justificado', 'J')) AS justificados_total,
      ROUND(
        (COUNT(*) FILTER (WHERE a.estado IN ('presente', 'P', 'tarde', 'T'))::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2
      ) AS tasa_asistencia_pct
    FROM public.asistencias a
    WHERE (v_periodo.fecha_inicio IS NULL OR a.fecha >= v_periodo.fecha_inicio)
      AND (v_periodo.fecha_fin IS NULL OR a.fecha <= v_periodo.fecha_fin)
    GROUP BY anio, mes, mes_nombre
    ORDER BY anio, mes
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(meses_agg)), '[]'::jsonb)
  INTO v_evolucion_mensual
  FROM meses_agg;

  -- 2. Cuadro de Honor de Asistencia (>= 95% asistencia)
  WITH honor AS (
    SELECT
      al.id AS alumno_id,
      al.nombre_completo,
      al.instrumento_principal,
      al.nivel_actual,
      COUNT(DISTINCT a.fecha) AS total_dias_convocados,
      COUNT(*) AS total_clases,
      COUNT(*) FILTER (WHERE a.estado IN ('presente', 'P', 'tarde', 'T')) AS asistencias,
      ROUND(
        (COUNT(*) FILTER (WHERE a.estado IN ('presente', 'P', 'tarde', 'T'))::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2
      ) AS porcentaje_asistencia
    FROM public.asistencias a
    JOIN public.alumnos al ON al.id = a.alumno_id
    WHERE (v_periodo.fecha_inicio IS NULL OR a.fecha >= v_periodo.fecha_inicio)
      AND (v_periodo.fecha_fin IS NULL OR a.fecha <= v_periodo.fecha_fin)
    GROUP BY al.id, al.nombre_completo, al.instrumento_principal, al.nivel_actual
    HAVING COUNT(DISTINCT a.fecha) >= 3 
       AND (COUNT(*) FILTER (WHERE a.estado IN ('presente', 'P', 'tarde', 'T'))::NUMERIC / NULLIF(COUNT(*), 0)) >= 0.95
    ORDER BY porcentaje_asistencia DESC, total_clases DESC
    LIMIT 20
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(honor)), '[]'::jsonb)
  INTO v_cuadro_honor
  FROM honor;

  -- 3. Ranking de Alumnos con Más Días de Inasistencia (Granularidad por Jornadas / Días)
  WITH dias_alumno AS (
    SELECT
      a.alumno_id,
      a.fecha,
      BOOL_OR(a.estado IN ('presente', 'P', 'tarde', 'T')) AS asistio_en_dia,
      BOOL_OR(a.estado IN ('ausente', 'A')) AS falto_en_dia,
      BOOL_AND(a.estado IN ('ausente', 'A')) AS ausencia_total_en_dia,
      BOOL_OR(a.estado IN ('justificado', 'J')) AS justificado_en_dia,
      COUNT(*) AS total_sesiones_dia,
      COUNT(*) FILTER (WHERE a.estado IN ('ausente', 'A')) AS sesiones_ausente_dia
    FROM public.asistencias a
    WHERE (v_periodo.fecha_inicio IS NULL OR a.fecha >= v_periodo.fecha_inicio)
      AND (v_periodo.fecha_fin IS NULL OR a.fecha <= v_periodo.fecha_fin)
    GROUP BY a.alumno_id, a.fecha
  ),
  ausencias_dias_rank AS (
    SELECT
      al.id AS alumno_id,
      al.nombre_completo,
      al.instrumento_principal,
      al.representante_nombre,
      al.representante_tlf,
      COUNT(DISTINCT da.fecha) AS total_dias_convocados,
      COUNT(DISTINCT da.fecha) FILTER (WHERE da.asistio_en_dia = true) AS dias_con_asistencia,
      COUNT(DISTINCT da.fecha) FILTER (WHERE da.falto_en_dia = true) AS dias_con_falta,
      COUNT(DISTINCT da.fecha) FILTER (WHERE da.ausencia_total_en_dia = true) AS dias_ausencia_total,
      COUNT(DISTINCT da.fecha) FILTER (WHERE da.justificado_en_dia = true AND da.asistio_en_dia = false) AS dias_justificados,
      SUM(da.total_sesiones_dia) AS total_sesiones_convocadas,
      SUM(da.sesiones_ausente_dia) AS total_sesiones_ausente,
      ROUND(
        (COUNT(DISTINCT da.fecha) FILTER (WHERE da.falto_en_dia = true)::NUMERIC / NULLIF(COUNT(DISTINCT da.fecha), 0)) * 100, 2
      ) AS porcentaje_dias_ausente
    FROM dias_alumno da
    JOIN public.alumnos al ON al.id = da.alumno_id
    GROUP BY al.id, al.nombre_completo, al.instrumento_principal, al.representante_nombre, al.representante_tlf
    HAVING COUNT(DISTINCT da.fecha) FILTER (WHERE da.falto_en_dia = true) > 0
    ORDER BY 
      porcentaje_dias_ausente DESC,
      dias_con_falta DESC,
      total_dias_convocados DESC
    LIMIT 25
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(ausencias_dias_rank)), '[]'::jsonb)
  INTO v_ranking_ausencias
  FROM ausencias_dias_rank;

  -- 4. Distribución de Motivos de Justificación
  WITH causas AS (
    SELECT
      COALESCE(NULLIF(TRIM(j.motivo), ''), 'No especificado') AS motivo,
      COUNT(*) AS cantidad,
      ROUND((COUNT(*)::NUMERIC / NULLIF(SUM(COUNT(*)) OVER(), 0)) * 100, 2) AS porcentaje
    FROM public.justificaciones j
    WHERE (v_periodo.fecha_inicio IS NULL OR j.created_at >= v_periodo.fecha_inicio)
      AND (v_periodo.fecha_fin IS NULL OR j.created_at <= v_periodo.fecha_fin + INTERVAL '1 day')
    GROUP BY motivo
    ORDER BY cantidad DESC
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(causas)), '[]'::jsonb)
  INTO v_causas_justificaciones
  FROM causas;

  -- 5. Tasa de Retención por Cátedra / Instrumento
  WITH catedra_stats AS (
    SELECT
      COALESCE(NULLIF(TRIM(al.instrumento_principal), ''), 'Sin asignar') AS instrumento,
      COUNT(DISTINCT al.id) AS total_matriculados,
      COUNT(DISTINCT al.id) FILTER (WHERE al.activo = true) AS activos_cierre,
      COUNT(DISTINCT al.id) FILTER (WHERE al.activo = false) AS retirados,
      ROUND(
        (COUNT(DISTINCT al.id) FILTER (WHERE al.activo = true)::NUMERIC / NULLIF(COUNT(DISTINCT al.id), 0)) * 100, 2
      ) AS tasa_retencion_pct
    FROM public.alumnos al
    GROUP BY instrumento
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(catedra_stats)), '[]'::jsonb)
  INTO v_retencion_catedra
  FROM catedra_stats;

  -- 6. Alumnos Destacados (Merit Score)
  WITH merit AS (
    SELECT
      al.id AS alumno_id,
      al.nombre_completo,
      al.instrumento_principal,
      al.nivel_actual,
      ROUND(
        (COUNT(*) FILTER (WHERE a.estado IN ('presente', 'P', 'tarde', 'T'))::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2
      ) AS pct_asistencia,
      (SELECT COUNT(*) FROM public.alumnos_logros al_log WHERE al_log.alumno_id = al.id) AS total_logros,
      (SELECT COUNT(*) FROM public.progresos p WHERE p.alumno_id = al.id AND p.calificacion >= 4) AS indicadores_aprobados
    FROM public.alumnos al
    LEFT JOIN public.asistencias a ON a.alumno_id = al.id
      AND (v_periodo.fecha_inicio IS NULL OR a.fecha >= v_periodo.fecha_inicio)
      AND (v_periodo.fecha_fin IS NULL OR a.fecha <= v_periodo.fecha_fin)
    WHERE al.activo = true
    GROUP BY al.id, al.nombre_completo, al.instrumento_principal, al.nivel_actual
    HAVING COUNT(a.id) > 0
  ),
  merit_calc AS (
    SELECT
      m.*,
      ROUND(
        (COALESCE(m.pct_asistencia, 0) * 0.4) +
        (LEAST(COALESCE(m.total_logros, 0), 10) * 3) +
        (LEAST(COALESCE(m.indicadores_aprobados, 0), 15) * 2),
        2
      ) AS merit_score
    FROM merit m
    ORDER BY merit_score DESC
    LIMIT 20
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(merit_calc)), '[]'::jsonb)
  INTO v_alumnos_destacados
  FROM merit_calc;

  -- 7. Evaluación Consolidada Docente
  WITH docente_stats AS (
    SELECT
      m.id AS maestro_id,
      m.nombre_completo AS maestro_nombre,
      COALESCE(m.especialidad, 'General') AS especialidad,
      COUNT(s.id) AS total_sesiones_semestre,
      COUNT(s.id) FILTER (WHERE s.estado IN ('asistencia_registrada', 'cerrada', 'progreso_registrado', 'registrada')) AS sesiones_cumplidas,
      (
        SELECT COUNT(*)
        FROM public.observaciones_alumnos obs
        WHERE obs.maestro_id = m.id
          AND (v_periodo.fecha_inicio IS NULL OR obs.created_at >= v_periodo.fecha_inicio)
          AND (v_periodo.fecha_fin IS NULL OR obs.created_at <= v_periodo.fecha_fin + INTERVAL '1 day')
      ) AS observaciones_cargadas,
      ROUND(
        (COUNT(s.id) FILTER (WHERE s.estado IN ('asistencia_registrada', 'cerrada', 'progreso_registrado', 'registrada'))::NUMERIC / NULLIF(COUNT(s.id), 0)) * 100, 2
      ) AS solvencia_registro_pct
    FROM public.maestros m
    LEFT JOIN public.sesiones_clase s ON s.maestro_id = m.id
      AND (v_periodo.fecha_inicio IS NULL OR s.fecha >= v_periodo.fecha_inicio)
      AND (v_periodo.fecha_fin IS NULL OR s.fecha <= v_periodo.fecha_fin)
    WHERE m.activo = true
    GROUP BY m.id, m.nombre_completo, m.especialidad
    HAVING COUNT(s.id) > 0
  ),
  docente_score AS (
    SELECT
      d.*,
      ROUND(
        (COALESCE(d.solvencia_registro_pct, 0) * 0.7) +
        (LEAST(COALESCE(d.observaciones_cargadas, 0), 30) * 1.0),
        2
      ) AS score_docente_global
    FROM docente_stats d
    ORDER BY score_docente_global DESC, solvencia_registro_pct DESC
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(docente_score)), '[]'::jsonb)
  INTO v_evaluacion_docente
  FROM docente_score;

  RETURN jsonb_build_object(
    'status', 'success',
    'periodo', jsonb_build_object(
      'id', v_periodo.id,
      'nombre', v_periodo.nombre,
      'fecha_inicio', v_periodo.fecha_inicio,
      'fecha_fin', v_periodo.fecha_fin,
      'activo', v_periodo.activo
    ),
    'evolucion_mensual', v_evolucion_mensual,
    'cuadro_honor', v_cuadro_honor,
    'ranking_ausencias', v_ranking_ausencias,
    'causas_justificaciones', v_causas_justificaciones,
    'retencion_por_catedra', v_retencion_catedra,
    'alumnos_destacados', v_alumnos_destacados,
    'evaluacion_docente', v_evaluacion_docente
  );
END;
$function$;

-- Función: get_my_rol
CREATE OR REPLACE FUNCTION public.get_my_rol()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT rol FROM public.profiles
  WHERE id = auth.uid() AND estado = 'activo'
  LIMIT 1;
$function$;

-- Función: get_resumen_academico_mensual
CREATE OR REPLACE FUNCTION public.get_resumen_academico_mensual(p_periodo_id uuid DEFAULT NULL::uuid, p_mes integer DEFAULT NULL::integer, p_anio integer DEFAULT NULL::integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_mes INT;
  v_anio INT;
  v_fecha_inicio DATE;
  v_fecha_fin DATE;
  v_resumen_general JSONB;
  v_patron_semanal JSONB;
  v_alumnos_riesgo JSONB;
  v_cumplimiento_docente JSONB;
  v_efectividad_clases JSONB;
  v_dia_pico TEXT;
  v_dia_valle TEXT;
BEGIN
  v_mes := COALESCE(p_mes, EXTRACT(MONTH FROM CURRENT_DATE)::INT);
  v_anio := COALESCE(p_anio, EXTRACT(YEAR FROM CURRENT_DATE)::INT);
  
  v_fecha_inicio := MAKE_DATE(v_anio, v_mes, 1);
  v_fecha_fin := (v_fecha_inicio + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

  -- 1. Resumen General de Asistencias
  SELECT jsonb_build_object(
    'mes', v_mes,
    'anio', v_anio,
    'fecha_inicio', v_fecha_inicio,
    'fecha_fin', v_fecha_fin,
    'total_registros', COUNT(*),
    'presentes', COUNT(*) FILTER (WHERE a.estado IN ('presente', 'P')),
    'tardes', COUNT(*) FILTER (WHERE a.estado IN ('tarde', 'T')),
    'ausentes', COUNT(*) FILTER (WHERE a.estado IN ('ausente', 'A')),
    'justificados', COUNT(*) FILTER (WHERE a.estado IN ('justificado', 'J')),
    'tasa_asistencia_pct', ROUND(
      (COUNT(*) FILTER (WHERE a.estado IN ('presente', 'P', 'tarde', 'T'))::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2
    ),
    'ratio_justificacion_pct', ROUND(
      (COUNT(*) FILTER (WHERE a.estado IN ('justificado', 'J'))::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE a.estado IN ('ausente', 'A', 'justificado', 'J')), 0)) * 100, 2
    )
  )
  INTO v_resumen_general
  FROM public.asistencias a
  WHERE a.fecha BETWEEN v_fecha_inicio AND v_fecha_fin;

  -- 2. Patrón Semanal
  WITH dias_stats AS (
    SELECT
      EXTRACT(DOW FROM a.fecha) AS dow,
      CASE EXTRACT(DOW FROM a.fecha)
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Lunes'
        WHEN 2 THEN 'Martes'
        WHEN 3 THEN 'Miércoles'
        WHEN 4 THEN 'Jueves'
        WHEN 5 THEN 'Viernes'
        WHEN 6 THEN 'Sábado'
      END AS dia_nombre,
      COUNT(*) AS total_dia,
      COUNT(*) FILTER (WHERE a.estado IN ('presente', 'P', 'tarde', 'T')) AS presentes_dia,
      COUNT(*) FILTER (WHERE a.estado IN ('ausente', 'A')) AS ausentes_dia,
      ROUND((COUNT(*) FILTER (WHERE a.estado IN ('presente', 'P', 'tarde', 'T'))::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2) AS tasa_asistencia_dia
    FROM public.asistencias a
    WHERE a.fecha BETWEEN v_fecha_inicio AND v_fecha_fin
    GROUP BY dow, dia_nombre
  ),
  ranked_dias AS (
    SELECT *,
      ROW_NUMBER() OVER (ORDER BY tasa_asistencia_dia DESC NULLS LAST) AS rank_max,
      ROW_NUMBER() OVER (ORDER BY tasa_asistencia_dia ASC NULLS LAST) AS rank_min
    FROM dias_stats
    WHERE total_dia > 0
  )
  SELECT 
    COALESCE(jsonb_agg(to_jsonb(dias_stats) ORDER BY dow), '[]'::jsonb),
    (SELECT dia_nombre FROM ranked_dias WHERE rank_max = 1 LIMIT 1),
    (SELECT dia_nombre FROM ranked_dias WHERE rank_min = 1 LIMIT 1)
  INTO v_patron_semanal, v_dia_pico, v_dia_valle
  FROM dias_stats;

  -- 3. Alumnos en Riesgo (>= 2 ausencias en el mes)
  WITH riesgo AS (
    SELECT
      al.id AS alumno_id,
      al.nombre_completo,
      al.instrumento_principal,
      al.representante_nombre,
      al.representante_tlf,
      COUNT(*) FILTER (WHERE a.estado IN ('ausente', 'A', 'justificado', 'J')) AS total_inasistencias,
      COUNT(*) FILTER (WHERE a.estado IN ('ausente', 'A')) AS ausencias_injustificadas,
      COUNT(*) FILTER (WHERE a.estado IN ('justificado', 'J')) AS ausencias_justificadas
    FROM public.asistencias a
    JOIN public.alumnos al ON al.id = a.alumno_id
    WHERE a.fecha BETWEEN v_fecha_inicio AND v_fecha_fin
    GROUP BY al.id, al.nombre_completo, al.instrumento_principal, al.representante_nombre, al.representante_tlf
    HAVING COUNT(*) FILTER (WHERE a.estado IN ('ausente', 'A')) >= 2
    ORDER BY ausencias_injustificadas DESC
    LIMIT 20
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(riesgo)), '[]'::jsonb)
  INTO v_alumnos_riesgo
  FROM riesgo;

  -- 4. Cumplimiento Docente del Mes
  WITH docente_stats AS (
    SELECT
      m.id AS maestro_id,
      m.nombre_completo AS maestro_nombre,
      COALESCE(m.especialidad, 'General') AS especialidad,
      COUNT(s.id) AS total_sesiones,
      COUNT(s.id) FILTER (WHERE s.estado IN ('asistencia_registrada', 'cerrada', 'progreso_registrado', 'registrada')) AS sesiones_cerradas,
      COUNT(s.id) FILTER (WHERE s.estado IN ('programada', 'abierta', 'pendiente', 'atrasada', 'borrador')) AS sesiones_pendientes,
      ROUND(
        (COUNT(s.id) FILTER (WHERE s.estado IN ('asistencia_registrada', 'cerrada', 'progreso_registrado', 'registrada'))::NUMERIC / NULLIF(COUNT(s.id), 0)) * 100, 2
      ) AS cumplimiento_pct,
      (
        SELECT COUNT(*)
        FROM public.observaciones_alumnos obs
        WHERE obs.clase_id IN (
          SELECT c.id FROM public.clases c WHERE c.maestro_principal_id = m.id OR c.maestro_id = m.id
        )
        AND obs.created_at >= v_fecha_inicio AND obs.created_at <= v_fecha_fin + INTERVAL '1 day'
      ) AS sesiones_con_observaciones
    FROM public.maestros m
    LEFT JOIN public.sesiones_clase s ON (
      s.maestro_id = m.id OR s.maestro_id = m.user_id
      OR s.clase_id IN (SELECT c.id FROM public.clases c WHERE c.maestro_principal_id = m.id OR c.maestro_id = m.id)
    ) AND s.fecha BETWEEN v_fecha_inicio AND v_fecha_fin
    WHERE m.activo = true
    GROUP BY m.id, m.nombre_completo, m.especialidad
    HAVING COUNT(s.id) > 0
    ORDER BY cumplimiento_pct ASC, total_sesiones DESC
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(docente_stats)), '[]'::jsonb)
  INTO v_cumplimiento_docente
  FROM docente_stats;

  -- 5. Efectividad de Clases
  SELECT jsonb_build_object(
    'total_programadas', COUNT(*),
    'dictadas', COUNT(*) FILTER (WHERE s.estado IN ('asistencia_registrada', 'cerrada', 'progreso_registrado', 'registrada')),
    'pendientes', COUNT(*) FILTER (WHERE s.estado IN ('programada', 'abierta', 'pendiente', 'atrasada', 'borrador')),
    'canceladas', COUNT(*) FILTER (WHERE s.estado = 'cancelada'),
    'tasa_efectividad_pct', ROUND(
      (COUNT(*) FILTER (WHERE s.estado IN ('asistencia_registrada', 'cerrada', 'progreso_registrado', 'registrada'))::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2
    )
  )
  INTO v_efectividad_clases
  FROM public.sesiones_clase s
  WHERE s.fecha BETWEEN v_fecha_inicio AND v_fecha_fin;

  RETURN jsonb_build_object(
    'status', 'success',
    'tipo', 'mensual',
    'resumen_general', v_resumen_general,
    'patron_semanal', jsonb_build_object(
      'dias', v_patron_semanal,
      'dia_pico_asistencia', COALESCE(v_dia_pico, 'N/A'),
      'dia_valle_asistencia', COALESCE(v_dia_valle, 'N/A')
    ),
    'alumnos_en_riesgo', v_alumnos_riesgo,
    'cumplimiento_docente', v_cumplimiento_docente,
    'efectividad_clases', v_efectividad_clases
  );
END;
$function$;

-- Función: get_user_department
CREATE OR REPLACE FUNCTION public.get_user_department()
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
DECLARE
  v_department text;
  v_rol text;
BEGIN
  v_department := auth.jwt() -> 'app_metadata' ->> 'departamento';
  IF v_department IS NOT NULL THEN
    RETURN v_department;
  END IF;

  SELECT rol INTO v_rol FROM public.profiles WHERE id = auth.uid();

  RETURN CASE v_rol
    WHEN 'admin' THEN 'DIR'
    WHEN 'superadmin' THEN 'DIR'
    WHEN 'direccion' THEN 'DIR'
    WHEN 'coordinacion_academica' THEN 'ACM'
    WHEN 'finanzas' THEN 'FIN'
    WHEN 'operaciones' THEN 'ADM'
    ELSE 'TECNICO'
  END;
END;
$function$;

-- Función: get_user_familia_id
CREATE OR REPLACE FUNCTION public.get_user_familia_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT familia_id
  FROM public.representantes
  WHERE user_id = auth.uid()
  LIMIT 1;
$function$;

-- Función: get_user_portales
CREATE OR REPLACE FUNCTION public.get_user_portales(p_user_id uuid DEFAULT auth.uid())
 RETURNS TABLE(portal_id text, nombre text, ruta text, icono text, orden integer, origen_acceso text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_target_user_id uuid;
  v_caller_id uuid;
  v_caller_role text;
  v_user_role text;
BEGIN
  v_caller_id := auth.uid();
  v_target_user_id := COALESCE(p_user_id, v_caller_id);

  IF v_target_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Protección IDOR: Si consulta por otro usuario, quien consulta debe ser admin o superadmin
  IF v_caller_id IS NOT NULL AND v_caller_id != v_target_user_id THEN
    SELECT rol INTO v_caller_role FROM public.profiles WHERE id = v_caller_id;
    IF v_caller_role NOT IN ('admin', 'superadmin') THEN
      RETURN;
    END IF;
  END IF;

  SELECT rol INTO v_user_role
  FROM public.profiles
  WHERE id = v_target_user_id;

  -- Caso SuperAdmin: retorna todos los portales activos
  IF v_user_role = 'superadmin' THEN
    RETURN QUERY
    SELECT 
      c.portal_id,
      c.nombre,
      c.ruta,
      c.icono,
      c.orden,
      'superadmin'::text AS origen_acceso
    FROM public.portal_catalog c
    WHERE COALESCE(c.activo, c.is_active, true) = true
    ORDER BY c.orden ASC;
    RETURN;
  END IF;

  -- Caso general: Asignaciones explícitas + roles por defecto
  RETURN QUERY
  WITH accessible AS (
    -- Explícitos
    SELECT 
      c.portal_id,
      c.nombre,
      c.ruta,
      c.icono,
      c.orden,
      'asignado'::text AS origen_acceso
    FROM public.portal_catalog c
    INNER JOIN public.user_portal_access a ON a.portal_id = c.portal_id
    WHERE a.user_id = v_target_user_id AND COALESCE(c.activo, c.is_active, true) = true

    UNION

    -- Roles por defecto
    SELECT 
      c.portal_id,
      c.nombre,
      c.ruta,
      c.icono,
      c.orden,
      'rol_default'::text AS origen_acceso
    FROM public.portal_catalog c
    WHERE COALESCE(c.activo, c.is_active, true) = true
      AND v_user_role IS NOT NULL
      AND v_user_role = ANY(c.roles_default)
  )
  SELECT DISTINCT ON (accessible.portal_id)
    accessible.portal_id,
    accessible.nombre,
    accessible.ruta,
    accessible.icono,
    accessible.orden,
    accessible.origen_acceso
  FROM accessible
  ORDER BY accessible.portal_id, accessible.orden ASC;
END;
$function$;

-- Función: get_user_role
CREATE OR REPLACE FUNCTION public.get_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT rol::TEXT FROM public.profiles WHERE id = auth.uid();
$function$;

-- Función: gin_extract_query_trgm
CREATE OR REPLACE FUNCTION public.gin_extract_query_trgm(text, internal, smallint, internal, internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_extract_query_trgm$function$;

-- Función: gin_extract_value_trgm
CREATE OR REPLACE FUNCTION public.gin_extract_value_trgm(text, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_extract_value_trgm$function$;

-- Función: gin_trgm_consistent
CREATE OR REPLACE FUNCTION public.gin_trgm_consistent(internal, smallint, text, integer, internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_trgm_consistent$function$;

-- Función: gin_trgm_triconsistent
CREATE OR REPLACE FUNCTION public.gin_trgm_triconsistent(internal, smallint, text, integer, internal, internal, internal)
 RETURNS "char"
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_trgm_triconsistent$function$;

-- Función: gtrgm_compress
CREATE OR REPLACE FUNCTION public.gtrgm_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_compress$function$;

-- Función: gtrgm_consistent
CREATE OR REPLACE FUNCTION public.gtrgm_consistent(internal, text, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_consistent$function$;

-- Función: gtrgm_decompress
CREATE OR REPLACE FUNCTION public.gtrgm_decompress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_decompress$function$;

-- Función: gtrgm_distance
CREATE OR REPLACE FUNCTION public.gtrgm_distance(internal, text, smallint, oid, internal)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_distance$function$;

-- Función: gtrgm_in
CREATE OR REPLACE FUNCTION public.gtrgm_in(cstring)
 RETURNS gtrgm
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_in$function$;

-- Función: gtrgm_options
CREATE OR REPLACE FUNCTION public.gtrgm_options(internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE
AS '$libdir/pg_trgm', $function$gtrgm_options$function$;

-- Función: gtrgm_out
CREATE OR REPLACE FUNCTION public.gtrgm_out(gtrgm)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_out$function$;

-- Función: gtrgm_penalty
CREATE OR REPLACE FUNCTION public.gtrgm_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_penalty$function$;

-- Función: gtrgm_picksplit
CREATE OR REPLACE FUNCTION public.gtrgm_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_picksplit$function$;

-- Función: gtrgm_same
CREATE OR REPLACE FUNCTION public.gtrgm_same(gtrgm, gtrgm, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_same$function$;

-- Función: gtrgm_union
CREATE OR REPLACE FUNCTION public.gtrgm_union(internal, internal)
 RETURNS gtrgm
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_union$function$;

-- Función: handle_new_auth_user
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.app_users (id, role, jurado_id, display_name, email, specialty, is_active)
    VALUES (
        NEW.id,
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'jurado'),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'jurado_id', ''), 'especialista'),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'name', ''), split_part(COALESCE(NEW.email, ''), '@', 1), 'usuario'),
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data->>'specialty', ''),
        true
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        role = EXCLUDED.role,
        jurado_id = EXCLUDED.jurado_id,
        display_name = EXCLUDED.display_name,
        email = EXCLUDED.email,
        specialty = EXCLUDED.specialty;
    RETURN NEW;
END;
$function$;

-- Función: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_rol TEXT;
BEGIN
  v_rol := COALESCE(NEW.raw_user_meta_data->>'rol', 'user');

  INSERT INTO public.profiles (
    id, email, nombre_completo, rol, estado,
    solicitud_instrumento, solicitud_resena
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    v_rol,
    CASE WHEN v_rol = 'maestro' THEN 'pendiente' ELSE 'activo' END,
    NULLIF(NEW.raw_user_meta_data->>'instrumento', ''),
    NULLIF(NEW.raw_user_meta_data->>'resena', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nombre_completo = COALESCE(NULLIF(EXCLUDED.nombre_completo, ''), public.profiles.nombre_completo),
    solicitud_instrumento = COALESCE(EXCLUDED.solicitud_instrumento, public.profiles.solicitud_instrumento),
    solicitud_resena = COALESCE(EXCLUDED.solicitud_resena, public.profiles.solicitud_resena),
    updated_at = NOW();

  -- Auto-confirm email for maestros (no SMTP needed)
  IF v_rol = 'maestro' THEN
    UPDATE auth.users
    SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$function$;

-- Función: handle_profile_insert_maestro
CREATE OR REPLACE FUNCTION public.handle_profile_insert_maestro()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_instrumento TEXT;
  v_resena TEXT;
  v_maestro_id UUID;
BEGIN
  IF NEW.rol = 'maestro' THEN
    -- Read instrumento/resena from auth.users metadata
    SELECT
      NULLIF(raw_user_meta_data->>'instrumento', ''),
      NULLIF(raw_user_meta_data->>'resena', '')
    INTO v_instrumento, v_resena
    FROM auth.users
    WHERE id = NEW.id;

    -- Check if a maestro row already exists for this email
    SELECT id INTO v_maestro_id
    FROM public.maestros
    WHERE LOWER(correo) = LOWER(NEW.email)
    LIMIT 1;

    BEGIN
      -- 1. Try with instrumento_principal column
      IF v_maestro_id IS NOT NULL THEN
        UPDATE public.maestros
        SET user_id = NEW.id,
            instrumento_principal = COALESCE(v_instrumento, instrumento_principal),
            resena = COALESCE(v_resena, resena),
            activo = true
        WHERE id = v_maestro_id;
      ELSE
        INSERT INTO public.maestros (user_id, nombre_completo, correo, instrumento_principal, resena, activo)
        VALUES (NEW.id, NEW.nombre_completo, NEW.email, COALESCE(v_instrumento, ''), v_resena, true)
        ON CONFLICT (user_id) DO UPDATE
        SET nombre_completo = EXCLUDED.nombre_completo,
            correo = EXCLUDED.correo,
            instrumento_principal = COALESCE(v_instrumento, public.maestros.instrumento_principal),
            resena = COALESCE(v_resena, public.maestros.resena),
            activo = true;
      END IF;
    EXCEPTION WHEN undefined_column THEN
      -- 2. Fallback: use especialidad column
      IF v_maestro_id IS NOT NULL THEN
        UPDATE public.maestros
        SET user_id = NEW.id,
            especialidad = COALESCE(v_instrumento, especialidad),
            resena = COALESCE(v_resena, resena),
            activo = true
        WHERE id = v_maestro_id;
      ELSE
        INSERT INTO public.maestros (user_id, nombre_completo, correo, especialidad, resena, activo)
        VALUES (NEW.id, NEW.nombre_completo, NEW.email, COALESCE(v_instrumento, ''), v_resena, true)
        ON CONFLICT (user_id) DO UPDATE
        SET nombre_completo = EXCLUDED.nombre_completo,
            correo = EXCLUDED.correo,
            especialidad = COALESCE(v_instrumento, public.maestros.especialidad),
            resena = COALESCE(v_resena, public.maestros.resena),
            activo = true;
      END IF;
    END;
  END IF;
  RETURN NEW;
END;
$function$;

-- Función: has_portal_access
CREATE OR REPLACE FUNCTION public.has_portal_access(p_portal_id text, p_user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_target_user_id uuid;
  v_caller_id uuid;
  v_caller_role text;
  v_user_role text;
  v_is_active boolean;
  v_has_explicit boolean;
  v_has_role_default boolean;
BEGIN
  v_caller_id := auth.uid();
  v_target_user_id := COALESCE(p_user_id, v_caller_id);

  IF v_target_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Protección IDOR: Si consulta por otro usuario, quien consulta debe ser admin o superadmin
  IF v_caller_id IS NOT NULL AND v_caller_id != v_target_user_id THEN
    SELECT rol INTO v_caller_role FROM public.profiles WHERE id = v_caller_id;
    IF v_caller_role NOT IN ('admin', 'superadmin') THEN
      RETURN false;
    END IF;
  END IF;

  -- 1. Verificar si el portal existe y está activo
  SELECT COALESCE(activo, is_active, true) INTO v_is_active
  FROM public.portal_catalog
  WHERE portal_id = upper(trim(p_portal_id));

  IF v_is_active IS NOT TRUE THEN
    RETURN false;
  END IF;

  -- 2. Obtener el rol del usuario target
  SELECT rol INTO v_user_role
  FROM public.profiles
  WHERE id = v_target_user_id;

  -- 3. Superadmin tiene acceso irrestricto
  IF v_user_role = 'superadmin' THEN
    RETURN true;
  END IF;

  -- 4. Verificar asignación explícita
  SELECT EXISTS (
    SELECT 1
    FROM public.user_portal_access
    WHERE user_id = v_target_user_id
      AND portal_id = upper(trim(p_portal_id))
  ) INTO v_has_explicit;

  IF v_has_explicit THEN
    RETURN true;
  END IF;

  -- 5. Verificar rol por defecto en catálogo
  IF v_user_role IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.portal_catalog
      WHERE portal_id = upper(trim(p_portal_id))
        AND v_user_role = ANY(roles_default)
    ) INTO v_has_role_default;

    IF v_has_role_default THEN
      RETURN true;
    END IF;
  END IF;

  RETURN false;
END;
$function$;

-- Función: intercambiar_instrumentos
CREATE OR REPLACE FUNCTION public.intercambiar_instrumentos(p_comodato_origen_id uuid, p_activo_destino_id uuid, p_alumno_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_comodato_origen RECORD;
  v_comodato_destino RECORD;
  v_activo_origen RECORD;
  v_activo_destino RECORD;
  v_result jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No auth context';
  END IF;
  
  IF NOT es_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Obtener comodato de origen
  SELECT * INTO v_comodato_origen
  FROM public.comodatos_activos
  WHERE id = p_comodato_origen_id AND estado = 'activo';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Comodato origen no encontrado o no está activo';
  END IF;

  -- Obtener activo de destino
  SELECT * INTO v_activo_destino
  FROM public.inventario_activos
  WHERE id = p_activo_destino_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Activo destino no encontrado';
  END IF;

  -- Obtener activo de origen
  SELECT * INTO v_activo_origen
  FROM public.inventario_activos
  WHERE id = v_comodato_origen.activo_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Activo origen no encontrado';
  END IF;

  -- Buscar si el activo de destino tiene un comodato activo (intercambio mutuo)
  SELECT * INTO v_comodato_destino
  FROM public.comodatos_activos
  WHERE activo_id = p_activo_destino_id AND estado = 'activo';

  IF FOUND THEN
    -- CASO A: Intercambio mutuo
    UPDATE public.comodatos_activos
    SET activo_id = p_activo_destino_id,
        intercambiado_con_id = v_comodato_destino.id,
        updated_at = NOW()
    WHERE id = p_comodato_origen_id;

    UPDATE public.comodatos_activos
    SET activo_id = v_comodato_origen.activo_id,
        intercambiado_con_id = p_comodato_origen_id,
        updated_at = NOW()
    WHERE id = v_comodato_destino.id;

    INSERT INTO public.inventario_historial (activo_id, tipo_evento, descripcion, usuario_id, metadata)
    VALUES 
      (v_comodato_origen.activo_id, 'intercambio', 'Instrumento intercambiado. Destinatario original asignado a nuevo instrumento.', auth.uid(), jsonb_build_object('comodato_origen', p_comodato_origen_id, 'comodato_destino', v_comodato_destino.id)),
      (p_activo_destino_id, 'intercambio', 'Instrumento intercambiado. Destinatario original asignado a nuevo instrumento.', auth.uid(), jsonb_build_object('comodato_origen', p_comodato_origen_id, 'comodato_destino', v_comodato_destino.id));

    v_result := jsonb_build_object(
      'comodatoOrigen', (SELECT to_jsonb(t) FROM public.comodatos_activos t WHERE id = p_comodato_origen_id),
      'comodatoDestino', (SELECT to_jsonb(t) FROM public.comodatos_activos t WHERE id = v_comodato_destino.id)
    );
  ELSE
    -- CASO B: Transferir el comodato origen a un instrumento libre (p_activo_destino_id)
    UPDATE public.comodatos_activos
    SET activo_id = p_activo_destino_id,
        intercambiado_con_id = NULL,
        updated_at = NOW()
    WHERE id = p_comodato_origen_id;

    UPDATE public.inventario_activos
    SET estado_uso = 'disponible',
        updated_at = NOW()
    WHERE id = v_comodato_origen.activo_id;

    UPDATE public.inventario_activos
    SET estado_uso = 'prestado',
        updated_at = NOW()
    WHERE id = p_activo_destino_id;

    INSERT INTO public.inventario_historial (activo_id, tipo_evento, descripcion, usuario_id, metadata)
    VALUES 
      (v_comodato_origen.activo_id, 'cambio_estado', 'Comodato transferido a otro instrumento. Estado cambiado a disponible.', auth.uid(), jsonb_build_object('comodato_id', p_comodato_origen_id)),
      (p_activo_destino_id, 'cambio_estado', 'Comodato asignado por transferencia. Estado cambiado a prestado.', auth.uid(), jsonb_build_object('comodato_id', p_comodato_origen_id));

    v_result := jsonb_build_object(
      'comodatoOrigen', (SELECT to_jsonb(t) FROM public.comodatos_activos t WHERE id = p_comodato_origen_id)
    );
  END IF;

  RETURN v_result;
END;
$function$;

-- Función: is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT public.get_user_role() IN ('admin', 'superadmin');
$function$;

-- Función: is_app_admin
CREATE OR REPLACE FUNCTION public.is_app_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT public.get_app_user_role() = 'admin';
$function$;

-- Función: is_super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
  -- A. Whitelist directa del desarrollador por email en JWT
  IF lower(COALESCE(auth.jwt()->>'email', '')) = 'osuniagarivera@gmail.com' THEN
    RETURN true;
  END IF;

  -- B. Claim de rol especial o service_role en JWT
  IF lower(COALESCE(auth.jwt()->>'role', '')) IN ('superadmin', 'service_role') THEN
    RETURN true;
  END IF;

  -- C. Perfil en tabla profiles con rol 'superadmin'
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND lower(rol) = 'superadmin'
      AND (activo IS NULL OR activo = true)
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$function$;

-- Función: is_teacher
CREATE OR REPLACE FUNCTION public.is_teacher()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT public.get_user_role() = 'maestro';
$function$;

-- Función: maestro_actual
CREATE OR REPLACE FUNCTION public.maestro_actual()
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN (
    SELECT id FROM public.maestros 
    WHERE user_id = auth.uid() 
       OR (user_id IS NULL AND id = auth.uid())
  );
END;
$function$;

-- Función: maestro_en_clase
CREATE OR REPLACE FUNCTION public.maestro_en_clase(p_clase_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.clases 
    WHERE id = p_clase_id 
    AND (maestro_principal_id = public.maestro_actual() OR maestro_suplente_id = public.maestro_actual())
  );
END;
$function$;

-- Función: norm_cedula
CREATE OR REPLACE FUNCTION public.norm_cedula(p text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
  SELECT regexp_replace(COALESCE(p, ''), '\D', '', 'g');
$function$;

-- Función: normalizar_tel_rd
CREATE OR REPLACE FUNCTION public.normalizar_tel_rd(raw text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
  SELECT CASE
    WHEN d ~ '^1(809|829|849)[0-9]{7}$' THEN '+' || d
    WHEN d ~ '^(809|829|849)[0-9]{7}$'  THEN '+1' || d
    ELSE NULL
  END
  FROM (SELECT regexp_replace(coalesce(raw, ''), '[^0-9]', '', 'g') AS d) x
$function$;

-- Función: normalize_phone
CREATE OR REPLACE FUNCTION public.normalize_phone(raw text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
DECLARE
  digits text;
BEGIN
  IF raw IS NULL OR trim(raw) = '' THEN
    RETURN NULL;
  END IF;

  digits := regexp_replace(trim(raw), '[^0-9]', '', 'g');

  -- Descartar datos claramente inválidos (menos de 7 dígitos)
  IF length(digits) < 7 THEN
    RETURN NULL;
  END IF;

  -- Números concatenados (más de 11 dígitos): tomar el primer número válido
  IF length(digits) > 11 THEN
    IF left(digits, 1) = '1' THEN
      -- Empieza con código de país 1 → tomar primeros 11
      digits := left(digits, 11);
    ELSE
      -- Sin código de país → tomar primeros 10
      digits := left(digits, 10);
    END IF;
  END IF;

  -- 11 dígitos empezando en 1 → E.164
  IF length(digits) = 11 AND left(digits, 1) = '1' THEN
    RETURN '+' || digits;
  END IF;

  -- 10 dígitos → +1 (NANP dominicano)
  IF length(digits) = 10 THEN
    RETURN '+1' || digits;
  END IF;

  -- Cualquier otro caso: devolver dígitos limpios
  RETURN digits;
END;
$function$;

-- Función: obtener_kpi_inventario
CREATE OR REPLACE FUNCTION public.obtener_kpi_inventario()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_resumen jsonb;
  v_distribucion jsonb;
  v_comodatos_vencidos integer;
  v_comodatos_proximos_vencer integer;
  v_total_en_reparacion integer;
BEGIN
  -- Verificar autenticación
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No auth context';
  END IF;

  -- Verificar roles
  IF NOT es_admin() THEN
    RAISE EXCEPTION 'Unauthorized: solo admins e inventaristas pueden acceder a los KPIs';
  END IF;

  -- Calcular el resumen de inventario
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'disponibles', COUNT(*) FILTER (WHERE estado_uso = 'disponible'),
    'en_uso', COUNT(*) FILTER (WHERE estado_uso = 'prestado'),
    'ociosos', (SELECT COUNT(*)::integer FROM public.comodatos_activos WHERE estado = 'activo'),
    'en_reparacion', COUNT(*) FILTER (WHERE estado_uso = 'en_reparacion'),
    'de_baja', COUNT(*) FILTER (WHERE estado_uso = 'de_baja'),
    'valor_total', COALESCE(SUM(valor_adquisicion), 0)
  ) INTO v_resumen
  FROM public.inventario_activos
  WHERE activo = TRUE;

  -- Calcular la distribución por tipo (solo activos)
  SELECT COALESCE(jsonb_object_agg(COALESCE(tipo_instrumento, 'Sin tipo'), cnt), '{}'::jsonb) INTO v_distribucion
  FROM (
    SELECT tipo_instrumento, COUNT(*)::integer AS cnt
    FROM public.inventario_activos
    WHERE activo = TRUE
    GROUP BY tipo_instrumento
  ) t;

  -- Calcular comodatos vencidos (estado = 'activo' y fecha_vencimiento < hoy)
  SELECT COUNT(*)::integer INTO v_comodatos_vencidos
  FROM public.comodatos_activos
  WHERE estado = 'activo' AND fecha_vencimiento < CURRENT_DATE;

  -- Calcular comodatos próximos a vencer (estado = 'activo' y fecha_vencimiento entre hoy y hoy + 7 días)
  SELECT COUNT(*)::integer INTO v_comodatos_proximos_vencer
  FROM public.comodatos_activos
  WHERE estado = 'activo' 
    AND fecha_vencimiento >= CURRENT_DATE 
    AND fecha_vencimiento <= CURRENT_DATE + INTERVAL '7 days';

  -- Calcular total en reparación (estado en_reparacion o recibido)
  SELECT COUNT(*)::integer INTO v_total_en_reparacion
  FROM public.inventario_reparaciones
  WHERE estado IN ('en_reparacion', 'recibido');

  -- Retornar el objeto estructurado
  RETURN jsonb_build_object(
    'resumen', v_resumen,
    'distribucion_por_tipo', v_distribucion,
    'comodatos_vencidos', v_comodatos_vencidos,
    'comodatos_proximos_vencer', v_comodatos_proximos_vencer,
    'total_en_reparacion', v_total_en_reparacion
  );
END;
$function$;

-- Función: on_notification_inserted
CREATE OR REPLACE FUNCTION public.on_notification_inserted()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_payload JSONB;
  v_url TEXT;
  v_anon_key TEXT;
  v_actions JSONB := '[]'::jsonb;
BEGIN
  -- 1. Configure Supabase send-push Edge Function endpoint and credentials
  v_url := 'https://zmhmdvmyeyswunurcyow.supabase.co/functions/v1/send-push';
  v_anon_key := 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'; -- standard anon key

  -- 2. Dynamically attach interactive quick actions (buttons) based on the notification type
  IF NEW.tipo = 'sesion_sin_registrar' OR NEW.titulo = 'Asistencia Pendiente' THEN
    v_actions := '[
      {
        "action": "mark-read",
        "title": "Entendido (Marcar Leído)",
        "icon": "/icons/check.png"
      }
    ]'::jsonb;
  ELSE
    v_actions := '[
      {
        "action": "mark-read",
        "title": "Marcar como Leído",
        "icon": "/icons/check.png"
      }
    ]'::jsonb;
  END IF;

  -- 3. Build the payload matching the edge function signature
  v_payload := jsonb_build_object(
    'profile_id', NEW.profile_id,
    'title', NEW.titulo,
    'body', NEW.mensaje,
    'actions', v_actions,
    'data', jsonb_build_object(
      'notification_id', NEW.id,
      'clase_id', NEW.clase_id,
      'tipo', NEW.tipo,
      'created_at', NEW.created_at
    )
  );

  -- 4. Invoke the send-push Edge Function asynchronously using pg_net extension
  -- This prevents blocking the main INSERT transaction if the HTTP request has delays.
  PERFORM net.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', v_anon_key,
      'Authorization', 'Bearer ' || v_anon_key
    )::json,
    body := v_payload::json,
    timeout_milliseconds := 5000
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Fall-soft: log the trigger failure to postgres logs but allow the original INSERT to succeed
  RAISE WARNING '[on_notification_inserted] Fallo al enviar push para notificacion %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$function$;

-- Función: preview_retiro_maestro
CREATE OR REPLACE FUNCTION public.preview_retiro_maestro(p_maestro_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_maestro public.maestros%ROWTYPE;
  v_relation record;
  v_count bigint;
  v_dependencies jsonb := '{}'::jsonb;
  v_clases_principales jsonb := '[]'::jsonb;
  v_clases_suplente jsonb := '[]'::jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden retirar maestros.' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_maestro FROM public.maestros WHERE id = p_maestro_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Maestro no encontrado.' USING ERRCODE = 'P0002';
  END IF;

  FOR v_relation IN
    SELECT
      c.conrelid::regclass AS relation_name,
      a.attname AS column_name,
      CASE c.confdeltype
        WHEN 'a' THEN 'NO ACTION'
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'c' THEN 'CASCADE'
        WHEN 'n' THEN 'SET NULL'
        WHEN 'd' THEN 'SET DEFAULT'
      END AS on_delete
    FROM pg_constraint c
    JOIN LATERAL unnest(c.conkey) WITH ORDINALITY AS keys(attnum, ord) ON true
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = keys.attnum
    WHERE c.contype = 'f'
      AND c.confrelid = 'public.maestros'::regclass
      AND array_length(c.conkey, 1) = 1
    ORDER BY c.conrelid::regclass::text, a.attname
  LOOP
    EXECUTE format('SELECT count(*) FROM %s WHERE %I = $1', v_relation.relation_name, v_relation.column_name)
      INTO v_count USING p_maestro_id;
    IF v_count > 0 THEN
      v_dependencies := v_dependencies || jsonb_build_object(
        v_relation.relation_name::text || '.' || v_relation.column_name,
        jsonb_build_object('count', v_count, 'on_delete', v_relation.on_delete)
      );
    END IF;
  END LOOP;

  SELECT COALESCE(jsonb_agg(jsonb_build_object('id', id, 'nombre', nombre, 'estado', estado) ORDER BY nombre), '[]'::jsonb)
    INTO v_clases_principales
    FROM public.clases
   WHERE maestro_principal_id = p_maestro_id;

  SELECT COALESCE(jsonb_agg(jsonb_build_object('id', id, 'nombre', nombre, 'estado', estado) ORDER BY nombre), '[]'::jsonb)
    INTO v_clases_suplente
    FROM public.clases
   WHERE maestro_suplente_id = p_maestro_id;

  RETURN jsonb_build_object(
    'maestro', jsonb_build_object(
      'id', v_maestro.id,
      'nombre', v_maestro.nombre_completo,
      'activo', v_maestro.activo,
      'user_id', v_maestro.user_id
    ),
    'clases_principales', v_clases_principales,
    'clases_suplente', v_clases_suplente,
    'dependencias', v_dependencies,
    'requiere_reemplazo', jsonb_array_length(v_clases_principales) > 0
  );
END;
$function$;

-- Función: profile_is_active
CREATE OR REPLACE FUNCTION public.profile_is_active()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND estado = 'activo'
  );
$function$;

-- Función: reactivar_maestro_seguro
CREATE OR REPLACE FUNCTION public.reactivar_maestro_seguro(p_maestro_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden reactivar maestros.' USING ERRCODE = '42501';
  END IF;

  UPDATE public.maestros
     SET activo = true,
         retirado_en = NULL,
         retirado_por = NULL,
         motivo_retiro = NULL,
         updated_at = now()
   WHERE id = p_maestro_id
   RETURNING user_id INTO v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Maestro no encontrado.' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.profiles SET activo = true, updated_at = now() WHERE id = v_user_id;
END;
$function$;

-- Función: rechazar_usuario
CREATE OR REPLACE FUNCTION public.rechazar_usuario(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_rol text;
BEGIN
  SELECT rol INTO v_rol
  FROM public.profiles
  WHERE id = auth.uid() AND estado = 'activo';

  IF v_rol NOT IN ('admin', 'superadmin') THEN
    RAISE EXCEPTION 'No autorizado: se requiere rol admin o superadmin';
  END IF;

  UPDATE public.profiles
  SET estado = 'rechazado',
      activo = false,
      updated_at = now()
  WHERE id = p_user_id;
END;
$function$;

-- Función: refresh_maestro_desempeno
CREATE OR REPLACE FUNCTION public.refresh_maestro_desempeno()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_now timestamptz := now();
BEGIN
    INSERT INTO maestro_desempeno (
        maestro_id, total_sesiones, sesiones_verde, sesiones_amarillo,
        sesiones_naranja, sesiones_rojo, categoria, tendencia,
        fecha_ultima_evaluacion, pending_count, oldest_dias_atraso, updated_at
    )
    SELECT
        rp.maestro_id,
        COUNT(*)::int,
        COUNT(*) FILTER (WHERE EXTRACT(DAY FROM v_now - rp.created_at) <= 1)::int,
        COUNT(*) FILTER (WHERE EXTRACT(DAY FROM v_now - rp.created_at) BETWEEN 2 AND 3)::int,
        COUNT(*) FILTER (WHERE EXTRACT(DAY FROM v_now - rp.created_at) BETWEEN 4 AND 6)::int,
        COUNT(*) FILTER (WHERE EXTRACT(DAY FROM v_now - rp.created_at) >= 7)::int,
        CASE
            WHEN COUNT(*) FILTER (WHERE EXTRACT(DAY FROM v_now - rp.created_at) >= 7) > 0 THEN 'negligente'
            WHEN COUNT(*) FILTER (WHERE EXTRACT(DAY FROM v_now - rp.created_at) BETWEEN 4 AND 6) > 0 THEN 'incumplidor'
            WHEN COUNT(*) FILTER (WHERE EXTRACT(DAY FROM v_now - rp.created_at) BETWEEN 2 AND 3) > 0 THEN 'regular'
            ELSE 'responsable'
        END,
        CASE
            WHEN COUNT(*) FILTER (WHERE rp.created_at >= v_now - INTERVAL '7 days') >
                 COUNT(*) FILTER (WHERE rp.created_at BETWEEN v_now - INTERVAL '14 days' AND v_now - INTERVAL '7 days')
            THEN 'empeorando'
            WHEN COUNT(*) FILTER (WHERE rp.created_at >= v_now - INTERVAL '7 days') <
                 COUNT(*) FILTER (WHERE rp.created_at BETWEEN v_now - INTERVAL '14 days' AND v_now - INTERVAL '7 days')
            THEN 'mejorando'
            ELSE 'estable'
        END,
        v_now,
        COUNT(*) FILTER (WHERE rp.estado = 'pendiente')::int,
        COALESCE(EXTRACT(DAY FROM v_now - MIN(rp.created_at) FILTER (WHERE rp.estado = 'pendiente')), 0)::int,
        v_now
    FROM registros_pendientes rp
    WHERE rp.estado = 'pendiente'
    GROUP BY rp.maestro_id
    ON CONFLICT (maestro_id) DO UPDATE SET
        total_sesiones = EXCLUDED.total_sesiones,
        sesiones_verde = EXCLUDED.sesiones_verde,
        sesiones_amarillo = EXCLUDED.sesiones_amarillo,
        sesiones_naranja = EXCLUDED.sesiones_naranja,
        sesiones_rojo = EXCLUDED.sesiones_rojo,
        categoria = EXCLUDED.categoria,
        tendencia = EXCLUDED.tendencia,
        fecha_ultima_evaluacion = EXCLUDED.fecha_ultima_evaluacion,
        pending_count = EXCLUDED.pending_count,
        oldest_dias_atraso = EXCLUDED.oldest_dias_atraso,
        updated_at = EXCLUDED.updated_at;

    DELETE FROM maestro_desempeno md
    WHERE NOT EXISTS (
        SELECT 1 FROM registros_pendientes rp
        WHERE rp.maestro_id = md.maestro_id AND rp.estado = 'pendiente'
    )
    AND md.maestro_id IS NOT NULL;
END;
$function$;

-- Función: registrar_justificacion_asistencia
CREATE OR REPLACE FUNCTION public.registrar_justificacion_asistencia(p_clase_id uuid, p_alumno_id uuid, p_fecha date, p_motivo text DEFAULT ''::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sesion_id uuid;
  v_maestro_id uuid;
  v_asistencia_id uuid;
BEGIN
  SELECT maestro_principal_id
    INTO v_maestro_id
    FROM public.clases
   WHERE id = p_clase_id;

  IF v_maestro_id IS NULL THEN
    RAISE EXCEPTION 'La clase % no tiene un maestro titular asignado', p_clase_id;
  END IF;

  -- Prefer an existing session regardless of who opened it (for example, a substitute).
  SELECT id
    INTO v_sesion_id
    FROM public.sesiones_clase
   WHERE clase_id = p_clase_id
     AND fecha = p_fecha
   ORDER BY created_at DESC
   LIMIT 1;

  -- The class/date/teacher unique constraint makes this creation idempotent.
  IF v_sesion_id IS NULL THEN
    INSERT INTO public.sesiones_clase (clase_id, maestro_id, fecha, estado, borrador)
    VALUES (p_clase_id, v_maestro_id, p_fecha, 'pendiente', false)
    ON CONFLICT ON CONSTRAINT sesiones_clase_clase_fecha_maestro_unique
    DO UPDATE SET updated_at = now()
    RETURNING id INTO v_sesion_id;
  END IF;

  INSERT INTO public.asistencias (
    sesion_clase_id,
    clase_id,
    alumno_id,
    fecha,
    estado,
    justificacion_texto
  )
  VALUES (
    v_sesion_id,
    p_clase_id,
    p_alumno_id,
    p_fecha,
    'justificado',
    nullif(btrim(p_motivo), '')
  )
  ON CONFLICT ON CONSTRAINT uk_asistencias_clase_alumno_fecha
  DO UPDATE SET
    sesion_clase_id = excluded.sesion_clase_id,
    estado = excluded.estado,
    justificacion_texto = excluded.justificacion_texto,
    updated_at = now()
  RETURNING id INTO v_asistencia_id;

  RETURN v_asistencia_id;
END;
$function$;

-- Función: registrar_sesion_bitacora
CREATE OR REPLACE FUNCTION public.registrar_sesion_bitacora(p_clase_id uuid, p_objetivo_id uuid, p_fecha date, p_notas jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_session_id UUID;
  v_nota       JSONB;
  v_nota_val   TEXT;
  v_alumno_id  UUID;
BEGIN
  IF public.maestro_actual() IS NULL THEN
    RAISE EXCEPTION 'Current user is not registered as a maestro';
  END IF;
  IF p_clase_id IS NULL THEN RAISE EXCEPTION 'clase_id is required'; END IF;
  IF p_objetivo_id IS NULL THEN RAISE EXCEPTION 'objetivo_id is required'; END IF;
  IF p_fecha IS NULL THEN RAISE EXCEPTION 'fecha is required'; END IF;
  IF p_fecha > CURRENT_DATE THEN RAISE EXCEPTION 'fecha cannot be in the future: %', p_fecha; END IF;
  IF p_notas IS NULL OR jsonb_array_length(p_notas) < 1 THEN
    RAISE EXCEPTION 'notas array must contain at least one entry';
  END IF;

  FOR v_nota IN SELECT jsonb_array_elements(p_notas) LOOP
    v_nota_val := v_nota->>'nota_cualitativa';
    IF v_nota_val IS NULL OR v_nota_val NOT IN ('bien', 'regular', 'mal') THEN
      RAISE EXCEPTION 'Invalid nota_cualitativa: %. Must be bien, regular, or mal', v_nota_val;
    END IF;
    IF (v_nota->>'alumno_id') IS NULL THEN
      RAISE EXCEPTION 'alumno_id is required in every notas entry';
    END IF;
  END LOOP;

  INSERT INTO public.indicator_sessions (maestro_id, clase_id, objetivo_id, fecha)
  VALUES (public.maestro_actual(), p_clase_id, p_objetivo_id, p_fecha)
  RETURNING id INTO v_session_id;

  FOR v_nota IN SELECT jsonb_array_elements(p_notas) LOOP
    v_alumno_id := (v_nota->>'alumno_id')::UUID;
    v_nota_val  := v_nota->>'nota_cualitativa';
    INSERT INTO public.indicator_session_students (indicator_session_id, alumno_id, nota_cualitativa)
    VALUES (v_session_id, v_alumno_id, v_nota_val);
  END LOOP;

  RETURN v_session_id;
EXCEPTION WHEN OTHERS THEN RAISE;
END;
$function$;

-- Función: renovar_comodato
CREATE OR REPLACE FUNCTION public.renovar_comodato(p_comodato_id uuid, p_nueva_fecha_vencimiento date, p_nuevo_tipo text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_old_comodato RECORD;
  v_new_comodato RECORD;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No auth context';
  END IF;
  
  IF NOT es_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Obtener comodato viejo
  SELECT * INTO v_old_comodato
  FROM public.comodatos_activos
  WHERE id = p_comodato_id AND estado = 'activo';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Comodato no encontrado o no está activo';
  END IF;

  -- Marcar como renovado
  UPDATE public.comodatos_activos
  SET estado = 'renovado',
      fecha_devolucion = CURRENT_DATE
  WHERE id = p_comodato_id;

  -- Crear nuevo comodato
  INSERT INTO public.comodatos_activos (
    activo_id,
    alumno_id,
    tipo_comodato,
    fecha_entrega,
    fecha_vencimiento,
    renovado_de_id,
    estado,
    registrado_por
  ) VALUES (
    v_old_comodato.activo_id,
    v_old_comodato.alumno_id,
    p_nuevo_tipo,
    CURRENT_DATE,
    p_nueva_fecha_vencimiento,
    p_comodato_id,
    'activo',
    auth.uid()
  )
  RETURNING * INTO v_new_comodato;

  -- Registrar en el historial del activo
  INSERT INTO public.inventario_historial (activo_id, tipo_evento, descripcion, usuario_id, metadata)
  VALUES (
    v_old_comodato.activo_id,
    'renovacion',
    'Comodato renovado. Nueva fecha de vencimiento: ' || COALESCE(p_nueva_fecha_vencimiento::text, 'sin fecha'),
    auth.uid(),
    jsonb_build_object('comodato_anterior', p_comodato_id, 'comodato_nuevo', v_new_comodato.id)
  );

  RETURN jsonb_build_object(
    'viejo', (SELECT to_jsonb(t) FROM public.comodatos_activos t WHERE id = p_comodato_id),
    'nuevo', to_jsonb(v_new_comodato)
  );
END;
$function$;

-- Función: retirar_maestro_seguro
CREATE OR REPLACE FUNCTION public.retirar_maestro_seguro(p_maestro_id uuid, p_reemplazo_maestro_id uuid DEFAULT NULL::uuid, p_motivo text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_maestro public.maestros%ROWTYPE;
  v_resumen jsonb;
  v_clases_principales integer;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden retirar maestros.' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_maestro FROM public.maestros WHERE id = p_maestro_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Maestro no encontrado.' USING ERRCODE = 'P0002';
  END IF;
  IF NOT v_maestro.activo THEN
    RAISE EXCEPTION 'El maestro ya está retirado.' USING ERRCODE = 'P0001';
  END IF;
  IF v_maestro.user_id = auth.uid() THEN
    RAISE EXCEPTION 'No puedes retirar tu propia cuenta.' USING ERRCODE = '42501';
  END IF;

  SELECT count(*) INTO v_clases_principales
    FROM public.clases WHERE maestro_principal_id = p_maestro_id;

  IF v_clases_principales > 0 AND p_reemplazo_maestro_id IS NULL THEN
    RAISE EXCEPTION 'Debes seleccionar un reemplazo para las clases principales.' USING ERRCODE = '23514';
  END IF;

  IF p_reemplazo_maestro_id IS NOT NULL THEN
    IF p_reemplazo_maestro_id = p_maestro_id THEN
      RAISE EXCEPTION 'El reemplazo debe ser otro maestro.' USING ERRCODE = '23514';
    END IF;
    PERFORM 1 FROM public.maestros WHERE id = p_reemplazo_maestro_id AND activo = true FOR SHARE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'El maestro de reemplazo no existe o está inactivo.' USING ERRCODE = '23503';
    END IF;
  END IF;

  v_resumen := public.preview_retiro_maestro(p_maestro_id);

  -- A class cannot exist without a primary teacher. Transfer that operational
  -- responsibility; preserve every student enrollment and historical session.
  IF p_reemplazo_maestro_id IS NOT NULL THEN
    UPDATE public.clases
       SET maestro_principal_id = CASE WHEN maestro_principal_id = p_maestro_id THEN p_reemplazo_maestro_id ELSE maestro_principal_id END,
           maestro_suplente_id = CASE WHEN maestro_suplente_id = p_maestro_id THEN NULL ELSE maestro_suplente_id END,
           maestro_id = CASE WHEN maestro_id = p_maestro_id THEN p_reemplazo_maestro_id ELSE maestro_id END,
           updated_at = now()
     WHERE maestro_principal_id = p_maestro_id
        OR maestro_suplente_id = p_maestro_id
        OR maestro_id = p_maestro_id;
  ELSE
    UPDATE public.clases
       SET maestro_suplente_id = NULL,
           maestro_id = NULL,
           updated_at = now()
     WHERE maestro_suplente_id = p_maestro_id OR maestro_id = p_maestro_id;
  END IF;

  -- Revocar facultades y acceso sin borrar información ni relaciones históricas.
  UPDATE public.permisos_maestros
     SET puede_registrar_alumnos = false,
         puede_inscribir_clases = false,
         puede_crear_clases = false,
         puede_planificar = false,
         puede_asistir = false
   WHERE maestro_id = p_maestro_id;

  UPDATE public.profiles
     SET activo = false,
         updated_at = now()
   WHERE id = v_maestro.user_id;

  UPDATE public.maestros
     SET activo = false,
         retirado_en = now(),
         retirado_por = auth.uid(),
         motivo_retiro = NULLIF(trim(p_motivo), ''),
         updated_at = now()
   WHERE id = p_maestro_id;

  INSERT INTO public.maestro_retiros (
    maestro_id, reemplazo_maestro_id, retirado_por, motivo, resumen_dependencias
  ) VALUES (
    p_maestro_id, p_reemplazo_maestro_id, auth.uid(), NULLIF(trim(p_motivo), ''), v_resumen
  );

  RETURN v_resumen || jsonb_build_object(
    'retirado', true,
    'reemplazo_maestro_id', p_reemplazo_maestro_id
  );
END;
$function$;

-- Función: set_evaluations_updated_at
CREATE OR REPLACE FUNCTION public.set_evaluations_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Función: set_limit
CREATE OR REPLACE FUNCTION public.set_limit(real)
 RETURNS real
 LANGUAGE c
 STRICT
AS '$libdir/pg_trgm', $function$set_limit$function$;

-- Función: set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Función: set_user_portales
CREATE OR REPLACE FUNCTION public.set_user_portales(p_user_id uuid, p_portal_ids text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_caller_id uuid;
  v_caller_role text;
  v_target_role text;
  v_cleaned_portals text[];
  v_clean_id text;
  v_inserted_count integer := 0;
BEGIN
  v_caller_id := auth.uid();

  -- 1. Validar que el invocador sea administrador o superadministrador
  SELECT rol INTO v_caller_role
  FROM public.profiles
  WHERE id = v_caller_id;

  IF v_caller_role NOT IN ('admin', 'superadmin') THEN
    RAISE EXCEPTION 'No autorizado: se requieren permisos de administrador para asignar portales';
  END IF;

  -- 2. Validar que el usuario objetivo exista
  SELECT rol INTO v_target_role
  FROM public.profiles
  WHERE id = p_user_id;

  IF v_target_role IS NULL THEN
    RAISE EXCEPTION 'El usuario destino no existe';
  END IF;

  -- 3. Blindaje de escalamiento: Solo superadmin puede asignar el portal SUPERADMIN
  IF 'SUPERADMIN' = ANY(p_portal_ids) AND v_caller_role != 'superadmin' THEN
    RAISE EXCEPTION 'Solo un SuperAdmin puede conceder acceso al portal SUPERADMIN';
  END IF;

  -- 4. Validar que los portal_ids sean válidos y activos antes de modificar
  IF p_portal_ids IS NOT NULL AND array_length(p_portal_ids, 1) > 0 THEN
    FOREACH v_clean_id IN ARRAY p_portal_ids LOOP
      v_clean_id := upper(trim(v_clean_id));
      IF NOT EXISTS (SELECT 1 FROM public.portal_catalog WHERE portal_id = v_clean_id AND COALESCE(activo, is_active, true) = true) THEN
        RAISE EXCEPTION 'El portal % no existe o no está activo', v_clean_id;
      END IF;
      v_cleaned_portals := array_append(v_cleaned_portals, v_clean_id);
    END LOOP;
  END IF;

  -- 5. Eliminar asignaciones previas del usuario
  DELETE FROM public.user_portal_access
  WHERE user_id = p_user_id;

  -- 6. Insertar nuevas asignaciones validadas
  IF v_cleaned_portals IS NOT NULL AND array_length(v_cleaned_portals, 1) > 0 THEN
    FOREACH v_clean_id IN ARRAY v_cleaned_portals LOOP
      INSERT INTO public.user_portal_access (user_id, portal_id, granted_by)
      VALUES (p_user_id, v_clean_id, v_caller_id)
      ON CONFLICT (user_id, portal_id) DO NOTHING;

      v_inserted_count := v_inserted_count + 1;
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'assigned_count', v_inserted_count,
    'assigned_by', v_caller_id
  );
END;
$function$;

-- Función: show_limit
CREATE OR REPLACE FUNCTION public.show_limit()
 RETURNS real
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$show_limit$function$;

-- Función: show_trgm
CREATE OR REPLACE FUNCTION public.show_trgm(text)
 RETURNS text[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$show_trgm$function$;

-- Función: similarity
CREATE OR REPLACE FUNCTION public.similarity(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$similarity$function$;

-- Función: similarity_dist
CREATE OR REPLACE FUNCTION public.similarity_dist(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$similarity_dist$function$;

-- Función: similarity_op
CREATE OR REPLACE FUNCTION public.similarity_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$similarity_op$function$;

-- Función: strict_word_similarity
CREATE OR REPLACE FUNCTION public.strict_word_similarity(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity$function$;

-- Función: strict_word_similarity_commutator_op
CREATE OR REPLACE FUNCTION public.strict_word_similarity_commutator_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_commutator_op$function$;

-- Función: strict_word_similarity_dist_commutator_op
CREATE OR REPLACE FUNCTION public.strict_word_similarity_dist_commutator_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_dist_commutator_op$function$;

-- Función: strict_word_similarity_dist_op
CREATE OR REPLACE FUNCTION public.strict_word_similarity_dist_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_dist_op$function$;

-- Función: strict_word_similarity_op
CREATE OR REPLACE FUNCTION public.strict_word_similarity_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_op$function$;

-- Función: teacher_can_create_students
CREATE OR REPLACE FUNCTION public.teacher_can_create_students()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT
    (SELECT public.profile_is_active()) = true
    AND (SELECT public.is_teacher()) = true
    AND public.tiene_permiso('alumnos:create');
$function$;

-- Función: tg_alumno_suspensiones_touch
CREATE OR REPLACE FUNCTION public.tg_alumno_suspensiones_touch()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at := now();
  IF NEW.estado = 'levantada' AND OLD.estado IS DISTINCT FROM 'levantada' THEN
    NEW.levantada_por := COALESCE(NEW.levantada_por, auth.uid());
    NEW.levantada_en  := COALESCE(NEW.levantada_en, now());
  END IF;
  RETURN NEW;
END $function$;

-- Función: tg_retenciones_levantar
CREATE OR REPLACE FUNCTION public.tg_retenciones_levantar()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.estado = 'levantada' AND (OLD.estado IS DISTINCT FROM 'levantada') THEN
    NEW.levantada_por := COALESCE(NEW.levantada_por, auth.uid());
    NEW.levantada_en  := COALESCE(NEW.levantada_en, now());
  END IF;
  RETURN NEW;
END $function$;

-- Función: tg_retenciones_touch
CREATE OR REPLACE FUNCTION public.tg_retenciones_touch()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN NEW.updated_at := now(); RETURN NEW; END $function$;

-- Función: tiene_permiso
CREATE OR REPLACE FUNCTION public.tiene_permiso(p_permiso text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
  RETURN COALESCE(
    (SELECT p_permiso = ANY(permisos)
     FROM public.permisos_maestros
     WHERE maestro_id = public.maestro_actual()),
    false
  );
END;
$function$;

-- Función: touch_maestro_access_credentials_updated_at
CREATE OR REPLACE FUNCTION public.touch_maestro_access_credentials_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Función: update_catalogo_timestamp
CREATE OR REPLACE FUNCTION public.update_catalogo_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Función: update_cmi_timestamp
CREATE OR REPLACE FUNCTION public.update_cmi_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Función: update_cmo_timestamp
CREATE OR REPLACE FUNCTION public.update_cmo_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Función: update_ei_timestamp
CREATE OR REPLACE FUNCTION public.update_ei_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Función: update_mp_timestamp
CREATE OR REPLACE FUNCTION public.update_mp_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Función: update_profile
CREATE OR REPLACE FUNCTION public.update_profile(p_id uuid, p_nombre_completo text, p_avatar_url text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  update public.profiles
  set nombre_completo = p_nombre_completo,
      avatar_url = p_avatar_url,
      updated_at = now()
  where id = p_id and auth.uid() = p_id;
end;
$function$;

-- Función: update_sb_timestamp
CREATE OR REPLACE FUNCTION public.update_sb_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Función: update_updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Función: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Función: validate_admin_invite_code
CREATE OR REPLACE FUNCTION public.validate_admin_invite_code(p_code text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_expected text;
begin
  select value into v_expected from public.system_config where key = 'admin_invite_code';
  return v_expected is not null and v_expected = p_code;
end;
$function$;

-- Función: validate_disponibilidad_json
CREATE OR REPLACE FUNCTION public.validate_disponibilidad_json(p_json jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
DECLARE
  v_day TEXT;
  v_slots JSONB;
BEGIN
  IF p_json IS NULL OR p_json::TEXT = '{}' THEN
    RETURN TRUE;
  END IF;

  FOR v_day IN SELECT jsonb_object_keys(p_json) LOOP
    IF v_day NOT IN ('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo') THEN
      RETURN FALSE;
    END IF;

    v_slots := p_json -> v_day;
    IF jsonb_typeof(v_slots) != 'array' THEN
      RETURN FALSE;
    END IF;
  END LOOP;

  RETURN TRUE;
END;
$function$;

-- Función: word_similarity
CREATE OR REPLACE FUNCTION public.word_similarity(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity$function$;

-- Función: word_similarity_commutator_op
CREATE OR REPLACE FUNCTION public.word_similarity_commutator_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_commutator_op$function$;

-- Función: word_similarity_dist_commutator_op
CREATE OR REPLACE FUNCTION public.word_similarity_dist_commutator_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_dist_commutator_op$function$;

-- Función: word_similarity_dist_op
CREATE OR REPLACE FUNCTION public.word_similarity_dist_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_dist_op$function$;

-- Función: word_similarity_op
CREATE OR REPLACE FUNCTION public.word_similarity_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_op$function$;

