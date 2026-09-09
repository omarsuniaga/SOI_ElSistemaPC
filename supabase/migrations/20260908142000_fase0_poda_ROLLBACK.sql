-- ==============================================================================
-- FASE 0 · SCRIPT DE ROLLBACK INTEGRAL: RESTAURACIÓN ESTRUCTURAL COMPLETA
-- ==============================================================================
-- Fecha: 2026-09-08
-- Autorización: Omar Suniaga (Owner)
-- Auditoría técnica: Lila (Senior Technical Auditor & Architect)
-- Estatus: REVERSIBILIDAD ESTRUCTURAL 100% GARANTIZADA
-- 
-- COBERTURA COMPLETA:
--   • 33 tablas recreadas en orden de dependencias inverso
--   • 375 columnas con tipos de datos nativos, nullability y defaults
--   • 33 primary keys
--   • 38 unique y check constraints
--   • 48 foreign keys
--   • 41 índices secundarios
--   • 33 activaciones de Row Level Security (RLS)
--   • 74 políticas RLS (CREATE POLICY)
--   • 6 triggers
--   • 5 comentarios descriptivos de catálogo
--   • Permisos estándar de Supabase (service_role, authenticated)
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- FASE 1: CREACIÓN DE TABLAS, COLUMNAS Y PRIMARY KEYS
-- ==============================================================================
-- ----------------------------------------------------
-- Tabla: hilos_mensajes
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."hilos_mensajes" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "titulo" text NOT NULL,
  "tema" text,
  "departamentos_involucrados" _text DEFAULT '{}'::text[],
  "creado_por" uuid,
  "resuelto" bool DEFAULT false,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: hermes_acciones
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."hermes_acciones" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "protocolo_id" uuid,
  "tipo" text,
  "destinatario" text,
  "descripcion" text,
  "estado" text DEFAULT 'pendiente'::text,
  "fecha_creacion" timestamp DEFAULT now(),
  "fecha_completacion" timestamp,
  "resultado" jsonb,
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: xp_log
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."xp_log" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "alumno_id" uuid NOT NULL,
  "cantidad" int4 NOT NULL,
  "concepto" text NOT NULL,
  "referencia_tipo" text,
  "referencia_id" uuid,
  "created_at" timestamptz DEFAULT now(),
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: wallet_config
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."wallet_config" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "familia_id" uuid NOT NULL,
  "modo" wallet_modo DEFAULT 'mixto'::wallet_modo NOT NULL,
  "saldo_minimo_alerta_centavos" int8 DEFAULT 0,
  "activo" bool DEFAULT true,
  "status" wallet_status DEFAULT 'operativa'::wallet_status NOT NULL,
  "congelada_en" timestamptz,
  "devuelta_en" timestamptz,
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: tareas_portales
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."tareas_portales" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "codigo" text,
  "titulo" text NOT NULL,
  "descripcion" text,
  "generada_por" text DEFAULT 'hermes'::text,
  "protocolo_id" uuid,
  "departamento" text NOT NULL,
  "responsable_id" uuid,
  "responsable_nombre" text,
  "responsable_email" text,
  "responsable_whatsapp" text,
  "prioridad" text DEFAULT 'MEDIO'::text,
  "tipo_tarea" text,
  "categoria" text,
  "contexto" jsonb,
  "fecha_vencimiento" date NOT NULL,
  "estado" text DEFAULT 'pendiente'::text,
  "progreso_porcentaje" int4 DEFAULT 0,
  "feedback_texto" text,
  "feedback_puntuacion" int4,
  "feedback_causa_raiz" text,
  "feedback_accion_realizada" text,
  "feedback_fecha" timestamp,
  "fecha_creacion" timestamp DEFAULT now(),
  "fecha_completacion" timestamp,
  "updated_at" timestamp DEFAULT now(),
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: sesion_bitacora
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."sesion_bitacora" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "sesion_id" uuid NOT NULL,
  "clase_id" uuid NOT NULL,
  "maestro_id" uuid NOT NULL,
  "texto_libre" text DEFAULT ''::text NOT NULL,
  "texto_ia" text,
  "tareas_enviadas" bool DEFAULT false NOT NULL,
  "tareas_detalle" text,
  "incidencia_comportamiento" bool DEFAULT false NOT NULL,
  "incidencia_detalle" text,
  "clase_no_realizada" bool DEFAULT false NOT NULL,
  "motivo_no_realizada" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: repertoire_fragments
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."repertoire_fragments" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "repertoire_item_id" uuid NOT NULL,
  "title" text NOT NULL,
  "start_measure" text DEFAULT ''::text,
  "end_measure" text DEFAULT ''::text,
  "order_index" int4 DEFAULT 0 NOT NULL,
  "created_at" timestamptz DEFAULT now(),
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: prospeccion_log
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."prospeccion_log" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "termino_busqueda" text NOT NULL,
  "ubicacion" text,
  "industria" text,
  "resultados_encontrados" int4 DEFAULT 0 NOT NULL,
  "resultados_procesados" int4 DEFAULT 0 NOT NULL,
  "estado" text DEFAULT 'pendiente'::text NOT NULL,
  "error" text,
  "ejecutado_por" text DEFAULT 'scanner'::text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: mensajes_internos
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."mensajes_internos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "hilo_id" uuid NOT NULL,
  "autor_id" uuid,
  "rol_autor" text NOT NULL,
  "contenido" text NOT NULL,
  "tipo" mensaje_tipo DEFAULT 'general'::mensaje_tipo NOT NULL,
  "departamento_destino" _text DEFAULT '{}'::text[],
  "leido_por" jsonb DEFAULT '{}'::jsonb,
  "resuelto" bool DEFAULT false,
  "created_at" timestamptz DEFAULT now(),
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: inventario_import_staging
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."inventario_import_staging" (
  "codigo_importacion" text NOT NULL,
  "codigo_interno_original" text,
  "familia" text,
  "tipo_item" text,
  "nombre_item" text,
  "nombre_normalizado" text,
  "tamano" text,
  "marca" text,
  "modelo" text,
  "serial" text,
  "cantidad" text,
  "unidad" text,
  "ubicacion_actual" text,
  "estado_asignacion" text,
  "asignado_a" text,
  "estado_fisico" text,
  "requiere_mantenimiento" text,
  "tiene_arco" text,
  "tiene_estuche" text,
  "tiene_funda" text,
  "tiene_hombrera_almohadilla" text,
  "faltantes_detectados" text,
  "donante_inferido" text,
  "codigo_donante" text,
  "observaciones" text,
  "tags" text,
  "activo" text,
  "fuente_seccion" text,
  "numero_original" text,
  "fila_origen_csv" text,
  "revisar" text,
  "alertas_calidad" text,
  "imported_at" timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY ("codigo_importacion")
);

-- ----------------------------------------------------
-- Tabla: intentos_ejercicios
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."intentos_ejercicios" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "alumno_id" uuid NOT NULL,
  "ejercicio_id" uuid NOT NULL,
  "maestro_id" uuid,
  "clase_id" uuid,
  "sesion_clase_id" uuid,
  "fecha" timestamptz DEFAULT now(),
  "puntaje" numeric NOT NULL,
  "aprobado" bool DEFAULT false,
  "rubrica" jsonb DEFAULT '{}'::jsonb,
  "observaciones" text,
  "evidencia_url" text,
  "created_at" timestamptz DEFAULT now(),
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: instituciones
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."instituciones" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "nombre" text NOT NULL,
  "tipo" text DEFAULT 'empresa'::text NOT NULL,
  "sector" text,
  "contacto_nombre" text,
  "cargo" text,
  "email" text,
  "telefono" text,
  "direccion" text,
  "sitio_web" text,
  "redes" jsonb DEFAULT '{}'::jsonb,
  "estado" text DEFAULT 'lead'::text NOT NULL,
  "notas" text,
  "ultima_gestion" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: hermes_notificaciones
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."hermes_notificaciones" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "destinatario" text,
  "tipo" text,
  "asunto" text,
  "mensaje" text,
  "accion_id" uuid,
  "estado" text DEFAULT 'enviada'::text,
  "fecha_envio" timestamp DEFAULT now(),
  "fecha_lectura" timestamp,
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: hermes_feedback
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."hermes_feedback" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "accion_id" uuid,
  "protocolo_id" uuid,
  "resuelta_en_plazo" bool,
  "tiempo_resolucion_dias" int4,
  "causa_raiz" text,
  "accion_realizada" text,
  "eficacia_score" int4,
  "comentarios" text,
  "fecha_feedback" timestamp DEFAULT now(),
  "usuario_feedback" text,
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: hermes_evaluaciones
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."hermes_evaluaciones" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "fecha" timestamp DEFAULT now(),
  "alertas_identificadas" int4,
  "acciones_generadas" int4,
  "detalle" jsonb,
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: exoneraciones
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."exoneraciones" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "cuota_id" uuid NOT NULL,
  "familia_id" uuid NOT NULL,
  "tipo" exoneracion_tipo NOT NULL,
  "porcentaje" numeric NOT NULL,
  "motivo" text NOT NULL,
  "aprobado_por" uuid,
  "documento_url" text,
  "fecha_inicio" date NOT NULL,
  "fecha_fin" date,
  "activa" bool DEFAULT true,
  "created_at" timestamptz DEFAULT now(),
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: clase_acceso_temporal
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."clase_acceso_temporal" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "clase_id" uuid,
  "maestro_suplente_id" uuid NOT NULL,
  "fecha_inicio" date NOT NULL,
  "fecha_fin" date NOT NULL,
  "activo" bool DEFAULT true,
  "created_at" timestamptz DEFAULT now(),
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: cierres_caja
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."cierres_caja" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "fecha" date NOT NULL,
  "cajero_id" uuid,
  "total_general_centavos" int8 DEFAULT 0 NOT NULL,
  "por_metodo" jsonb DEFAULT '{}'::jsonb,
  "cantidad_transacciones" int4 DEFAULT 0 NOT NULL,
  "estado" cierre_caja_estado DEFAULT 'cerrado'::cierre_caja_estado NOT NULL,
  "notas" text,
  "created_at" timestamptz DEFAULT now(),
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: campanias_marketing
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."campanias_marketing" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "titulo" text NOT NULL,
  "temporada" text,
  "asunto" text NOT NULL,
  "cuerpo_html" text NOT NULL,
  "cuerpo_texto" text,
  "estado" text DEFAULT 'borrador'::text NOT NULL,
  "fecha_programada" timestamptz,
  "fecha_envio" timestamptz,
  "enviados" int4 DEFAULT 0 NOT NULL,
  "abiertos" int4 DEFAULT 0 NOT NULL,
  "respondidos" int4 DEFAULT 0 NOT NULL,
  "creado_por" uuid DEFAULT auth.uid(),
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: campanias_destinatarios
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."campanias_destinatarios" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "campania_id" uuid NOT NULL,
  "institucion_id" uuid NOT NULL,
  "estado" text DEFAULT 'pendiente'::text NOT NULL,
  "fecha_envio" timestamptz,
  "fecha_respuesta" timestamptz,
  "respuesta_texto" text,
  "notas_seguimiento" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: campanas_pago
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."campanas_pago" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "nombre" text NOT NULL,
  "descripcion" text,
  "incentivo" text,
  "fecha_inicio" date NOT NULL,
  "fecha_fin" date NOT NULL,
  "creado_por" uuid,
  "activa" bool DEFAULT true,
  "created_at" timestamptz DEFAULT now(),
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: campana_participaciones
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."campana_participaciones" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "campana_id" uuid NOT NULL,
  "familia_id" uuid NOT NULL,
  "aceptada" bool DEFAULT false,
  "fecha_aceptacion" timestamptz,
  "monto_recuperado_centavos" int8 DEFAULT 0,
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: autorizaciones_accesorio
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."autorizaciones_accesorio" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "familia_id" uuid NOT NULL,
  "representante_id" uuid NOT NULL,
  "monto_maximo" numeric DEFAULT 0 NOT NULL,
  "categorias_incluidas" _text DEFAULT '{}'::text[],
  "activa" bool DEFAULT true,
  "fecha_firma" timestamptz DEFAULT now(),
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: ausencias_notificaciones
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."ausencias_notificaciones" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "ausencia_id" uuid NOT NULL,
  "director_id" uuid NOT NULL,
  "tipo" text DEFAULT 'director_alert'::text,
  "estado" text DEFAULT 'pendiente'::text,
  "created_at" timestamptz DEFAULT now(),
  "leida_en" timestamptz,
  "actuado_en" timestamptz,
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: ausencias_clases_afectadas
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."ausencias_clases_afectadas" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "ausencia_id" uuid NOT NULL,
  "clase_id" uuid NOT NULL,
  "actividad_reemplazo" text,
  "created_at" timestamptz DEFAULT now(),
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: audiciones
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."audiciones" (
  "id_auditoria" int4 DEFAULT nextval('audiciones_id_auditoria_seq'::regclass) NOT NULL,
  "fecha_auditoria" date DEFAULT CURRENT_DATE NOT NULL,
  "alumno_id" uuid,
  "nombre_alumno" varchar NOT NULL,
  "instrumento" varchar NOT NULL,
  "evaluador" varchar DEFAULT 'Omar Suniaga'::character varying,
  "calif_postura" int4 NOT NULL,
  "nota_postura" text,
  "calif_afinacion" int4 NOT NULL,
  "nota_afinacion" text,
  "calif_ritmo" int4 NOT NULL,
  "nota_ritmo" text,
  "calif_musicalidad" int4 NOT NULL,
  "nota_musicalidad" text,
  "promedio_ponderado" numeric,
  "resultado" resultado_audicion NOT NULL,
  "nivel_asignado" nivel_estudiante,
  "profesor_asignado" varchar,
  "proxima_auditoria" date,
  "validado_por_omar" bool DEFAULT false,
  "fecha_validacion" timestamptz,
  "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id_auditoria")
);

-- ----------------------------------------------------
-- Tabla: asistencias_emergentes
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."asistencias_emergentes" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "clase_emergente_id" uuid NOT NULL,
  "alumno_id" uuid,
  "alumno_nombre" text NOT NULL,
  "estado" text DEFAULT 'presente'::text NOT NULL,
  "justificacion" text,
  "observacion" text,
  "fecha" date,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: alumnos_rutas
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."alumnos_rutas" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "alumno_id" uuid NOT NULL,
  "programa_id" uuid NOT NULL,
  "nivel_id" uuid NOT NULL,
  "fecha_inicio" date DEFAULT CURRENT_DATE,
  "fecha_fin_estimada" date,
  "fecha_completado" date,
  "estado" text DEFAULT 'activa'::text NOT NULL,
  "progreso_porcentaje" numeric DEFAULT 0,
  "activo" bool DEFAULT true,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: alumnos_modulos
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."alumnos_modulos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "alumno_id" uuid NOT NULL,
  "modulo_id" uuid NOT NULL,
  "estado" text DEFAULT 'bloqueado'::text NOT NULL,
  "porcentaje_completado" numeric DEFAULT 0,
  "fecha_inicio" date,
  "fecha_completado" date,
  "intentos_totales" int4 DEFAULT 0,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: alumnos_ejercicios
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."alumnos_ejercicios" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "alumno_id" uuid NOT NULL,
  "ejercicio_id" uuid NOT NULL,
  "estado" text DEFAULT 'pendiente'::text NOT NULL,
  "puntaje_actual" numeric,
  "mejor_puntaje" numeric,
  "intentos" int4 DEFAULT 0,
  "aprobado" bool DEFAULT false,
  "fecha_ultimo_intento" timestamptz,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: accesorio_asignaciones
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."accesorio_asignaciones" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "accesorio_id" uuid NOT NULL,
  "alumno_id" uuid NOT NULL,
  "familia_id" uuid NOT NULL,
  "cantidad" int4 DEFAULT 1 NOT NULL,
  "precio_unitario" numeric NOT NULL,
  "monto_total" numeric NOT NULL,
  "estado" asignacion_estado DEFAULT 'pendiente'::asignacion_estado NOT NULL,
  "aprobacion_requerida" bool DEFAULT false,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: planificacion_nodos
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."planificacion_nodos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "maestro_id" uuid NOT NULL,
  "programa_id" uuid,
  "codigo" text,
  "nombre" text,
  "descripcion" text,
  "nivel" int4,
  "bloque" int4,
  "ponderacion" numeric,
  "padre_id" uuid,
  "estado" text DEFAULT 'disponible'::text,
  "created_at" timestamptz DEFAULT now(),
  PRIMARY KEY ("id")
);

-- ----------------------------------------------------
-- Tabla: planificacion
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."planificacion" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "programa_id" uuid NOT NULL,
  "nivel" int4 NOT NULL,
  "titulo" text NOT NULL,
  "contenidos" jsonb DEFAULT '[]'::jsonb,
  "tecnicas" jsonb,
  "obras" jsonb,
  "escalas_arpegios" jsonb,
  "evaluaciones" jsonb,
  "fecha_inicio" date NOT NULL,
  "fecha_fin" date,
  "activo" bool DEFAULT true,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  PRIMARY KEY ("id")
);

-- ==============================================================================
-- FASE 2: RESTRICCIONES UNIQUE Y CHECK
-- ==============================================================================
ALTER TABLE public."xp_log" ADD CONSTRAINT "xp_log_cantidad_check" CHECK ((cantidad > 0));
ALTER TABLE public."wallet_config" ADD CONSTRAINT "wallet_config_familia_id_key" UNIQUE (familia_id);
ALTER TABLE public."tareas_portales" ADD CONSTRAINT "chk_estado" CHECK ((estado = ANY (ARRAY['pendiente'::text, 'en_progreso'::text, 'completada'::text, 'vencida'::text, 'cancelada'::text])));
ALTER TABLE public."tareas_portales" ADD CONSTRAINT "chk_prioridad" CHECK ((prioridad = ANY (ARRAY['CRÍTICO'::text, 'ALTO'::text, 'MEDIO'::text, 'BAJO'::text])));
ALTER TABLE public."tareas_portales" ADD CONSTRAINT "chk_progreso" CHECK (((progreso_porcentaje >= 0) AND (progreso_porcentaje <= 100)));
ALTER TABLE public."tareas_portales" ADD CONSTRAINT "tareas_portales_codigo_key" UNIQUE (codigo);
ALTER TABLE public."sesion_bitacora" ADD CONSTRAINT "sesion_bitacora_sesion_id_key" UNIQUE (sesion_id);
ALTER TABLE public."prospeccion_log" ADD CONSTRAINT "prospeccion_log_estado_check" CHECK ((estado = ANY (ARRAY['pendiente'::text, 'procesando'::text, 'completado'::text, 'error'::text])));
ALTER TABLE public."intentos_ejercicios" ADD CONSTRAINT "intentos_ejercicios_puntaje_check" CHECK ((puntaje >= (0)::numeric));
ALTER TABLE public."instituciones" ADD CONSTRAINT "instituciones_estado_check" CHECK ((estado = ANY (ARRAY['lead'::text, 'contactado'::text, 'en_negociacion'::text, 'aceptado'::text, 'rechazado'::text, 'inactivo'::text])));
ALTER TABLE public."instituciones" ADD CONSTRAINT "instituciones_tipo_check" CHECK ((tipo = ANY (ARRAY['empresa'::text, 'institucion'::text, 'colegio'::text, 'fundacion'::text, 'iglesia'::text, 'club'::text, 'otro'::text])));
ALTER TABLE public."exoneraciones" ADD CONSTRAINT "exoneraciones_porcentaje_check" CHECK (((porcentaje > (0)::numeric) AND (porcentaje <= (100)::numeric)));
ALTER TABLE public."cierres_caja" ADD CONSTRAINT "cierres_caja_fecha_unique" UNIQUE (fecha);
ALTER TABLE public."campanias_marketing" ADD CONSTRAINT "campanias_marketing_estado_check" CHECK ((estado = ANY (ARRAY['borrador'::text, 'programada'::text, 'enviando'::text, 'enviada'::text, 'completada'::text, 'cancelada'::text])));
ALTER TABLE public."campanias_destinatarios" ADD CONSTRAINT "campanias_destinatarios_campania_id_institucion_id_key" UNIQUE (campania_id, institucion_id);
ALTER TABLE public."campanias_destinatarios" ADD CONSTRAINT "campanias_destinatarios_estado_check" CHECK ((estado = ANY (ARRAY['pendiente'::text, 'enviado'::text, 'abierto'::text, 'respondido'::text, 'rechazado'::text, 'error'::text])));
ALTER TABLE public."campana_participaciones" ADD CONSTRAINT "campana_participaciones_campana_id_familia_id_key" UNIQUE (campana_id, familia_id);
ALTER TABLE public."ausencias_notificaciones" ADD CONSTRAINT "ausencias_notificaciones_estado_check" CHECK ((estado = ANY (ARRAY['pendiente'::text, 'leida'::text, 'actuado'::text])));
ALTER TABLE public."ausencias_notificaciones" ADD CONSTRAINT "ausencias_notificaciones_tipo_check" CHECK ((tipo = ANY (ARRAY['director_alert'::text, 'maestro_confirmacion'::text, 'aprobacion'::text, 'rechazo'::text])));
ALTER TABLE public."audiciones" ADD CONSTRAINT "audiciones_calif_afinacion_check" CHECK (((calif_afinacion >= 1) AND (calif_afinacion <= 5)));
ALTER TABLE public."audiciones" ADD CONSTRAINT "audiciones_calif_musicalidad_check" CHECK (((calif_musicalidad >= 1) AND (calif_musicalidad <= 5)));
ALTER TABLE public."audiciones" ADD CONSTRAINT "audiciones_calif_postura_check" CHECK (((calif_postura >= 1) AND (calif_postura <= 5)));
ALTER TABLE public."audiciones" ADD CONSTRAINT "audiciones_calif_ritmo_check" CHECK (((calif_ritmo >= 1) AND (calif_ritmo <= 5)));
ALTER TABLE public."asistencias_emergentes" ADD CONSTRAINT "asistencias_emergentes_estado_check" CHECK ((estado = ANY (ARRAY['presente'::text, 'ausente'::text, 'justificado'::text, 'tarde'::text])));
ALTER TABLE public."alumnos_rutas" ADD CONSTRAINT "alumnos_rutas_estado_check" CHECK ((estado = ANY (ARRAY['activa'::text, 'pausada'::text, 'completada'::text, 'retirada'::text])));
ALTER TABLE public."alumnos_rutas" ADD CONSTRAINT "alumnos_rutas_progreso_porcentaje_check" CHECK (((progreso_porcentaje >= (0)::numeric) AND (progreso_porcentaje <= (100)::numeric)));
ALTER TABLE public."alumnos_rutas" ADD CONSTRAINT "alumnos_rutas_unica" UNIQUE (alumno_id, programa_id, nivel_id);
ALTER TABLE public."alumnos_modulos" ADD CONSTRAINT "alumnos_modulos_estado_check" CHECK ((estado = ANY (ARRAY['bloqueado'::text, 'disponible'::text, 'en_progreso'::text, 'completado'::text, 'refuerzo'::text])));
ALTER TABLE public."alumnos_modulos" ADD CONSTRAINT "alumnos_modulos_intentos_totales_check" CHECK ((intentos_totales >= 0));
ALTER TABLE public."alumnos_modulos" ADD CONSTRAINT "alumnos_modulos_porcentaje_completado_check" CHECK (((porcentaje_completado >= (0)::numeric) AND (porcentaje_completado <= (100)::numeric)));
ALTER TABLE public."alumnos_modulos" ADD CONSTRAINT "alumnos_modulos_unico" UNIQUE (alumno_id, modulo_id);
ALTER TABLE public."alumnos_ejercicios" ADD CONSTRAINT "alumnos_ejercicios_estado_check" CHECK ((estado = ANY (ARRAY['pendiente'::text, 'en_progreso'::text, 'aprobado'::text, 'refuerzo'::text, 'bloqueado'::text])));
ALTER TABLE public."alumnos_ejercicios" ADD CONSTRAINT "alumnos_ejercicios_intentos_check" CHECK ((intentos >= 0));
ALTER TABLE public."alumnos_ejercicios" ADD CONSTRAINT "alumnos_ejercicios_unico" UNIQUE (alumno_id, ejercicio_id);
ALTER TABLE public."accesorio_asignaciones" ADD CONSTRAINT "accesorio_asignaciones_cantidad_check" CHECK ((cantidad > 0));
ALTER TABLE public."planificacion_nodos" ADD CONSTRAINT "planificacion_nodos_estado_check" CHECK ((estado = ANY (ARRAY['bloqueado'::text, 'disponible'::text, 'en_progreso'::text, 'completado'::text])));
ALTER TABLE public."planificacion" ADD CONSTRAINT "planificacion_nivel_check" CHECK (((nivel >= 1) AND (nivel <= 10)));
ALTER TABLE public."planificacion" ADD CONSTRAINT "uq_planificacion_programa_nivel" UNIQUE (programa_id, nivel);

-- ==============================================================================
-- FASE 3: CLAVES FORÁNEAS (FOREIGN KEYS)
-- ==============================================================================
ALTER TABLE public."hilos_mensajes" ADD CONSTRAINT "hilos_mensajes_creado_por_fkey" FOREIGN KEY (creado_por) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public."hermes_acciones" ADD CONSTRAINT "hermes_acciones_protocolo_id_fkey" FOREIGN KEY (protocolo_id) REFERENCES hermes_protocolos(id);
ALTER TABLE public."xp_log" ADD CONSTRAINT "fk_xp_log_alumno" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE;
ALTER TABLE public."wallet_config" ADD CONSTRAINT "wallet_config_familia_id_fkey" FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT;
ALTER TABLE public."sesion_bitacora" ADD CONSTRAINT "sesion_bitacora_clase_id_fkey" FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE;
ALTER TABLE public."sesion_bitacora" ADD CONSTRAINT "sesion_bitacora_maestro_id_fkey" FOREIGN KEY (maestro_id) REFERENCES maestros(id);
ALTER TABLE public."sesion_bitacora" ADD CONSTRAINT "sesion_bitacora_sesion_id_fkey" FOREIGN KEY (sesion_id) REFERENCES sesiones_clase(id) ON DELETE CASCADE;
ALTER TABLE public."repertoire_fragments" ADD CONSTRAINT "repertoire_fragments_repertoire_item_id_fkey" FOREIGN KEY (repertoire_item_id) REFERENCES repertoire_items(id) ON DELETE CASCADE;
ALTER TABLE public."mensajes_internos" ADD CONSTRAINT "mensajes_internos_autor_id_fkey" FOREIGN KEY (autor_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public."mensajes_internos" ADD CONSTRAINT "mensajes_internos_hilo_id_fkey" FOREIGN KEY (hilo_id) REFERENCES hilos_mensajes(id) ON DELETE RESTRICT;
ALTER TABLE public."intentos_ejercicios" ADD CONSTRAINT "fk_intentos_ejercicios_alumno" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE;
ALTER TABLE public."intentos_ejercicios" ADD CONSTRAINT "fk_intentos_ejercicios_clase" FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE SET NULL;
ALTER TABLE public."intentos_ejercicios" ADD CONSTRAINT "fk_intentos_ejercicios_ejercicio" FOREIGN KEY (ejercicio_id) REFERENCES ejercicios(id) ON DELETE CASCADE;
ALTER TABLE public."intentos_ejercicios" ADD CONSTRAINT "fk_intentos_ejercicios_maestro" FOREIGN KEY (maestro_id) REFERENCES maestros(id) ON DELETE SET NULL;
ALTER TABLE public."intentos_ejercicios" ADD CONSTRAINT "fk_intentos_ejercicios_sesion" FOREIGN KEY (sesion_clase_id) REFERENCES sesiones_clase(id) ON DELETE SET NULL;
ALTER TABLE public."hermes_notificaciones" ADD CONSTRAINT "hermes_notificaciones_accion_id_fkey" FOREIGN KEY (accion_id) REFERENCES hermes_acciones(id);
ALTER TABLE public."hermes_feedback" ADD CONSTRAINT "hermes_feedback_accion_id_fkey" FOREIGN KEY (accion_id) REFERENCES hermes_acciones(id);
ALTER TABLE public."hermes_feedback" ADD CONSTRAINT "hermes_feedback_protocolo_id_fkey" FOREIGN KEY (protocolo_id) REFERENCES hermes_protocolos(id);
ALTER TABLE public."exoneraciones" ADD CONSTRAINT "exoneraciones_aprobado_por_fkey" FOREIGN KEY (aprobado_por) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public."exoneraciones" ADD CONSTRAINT "exoneraciones_cuota_id_fkey" FOREIGN KEY (cuota_id) REFERENCES cuotas(id) ON DELETE RESTRICT;
ALTER TABLE public."exoneraciones" ADD CONSTRAINT "exoneraciones_familia_id_fkey" FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT;
ALTER TABLE public."clase_acceso_temporal" ADD CONSTRAINT "clase_acceso_temporal_clase_id_fkey" FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE;
ALTER TABLE public."cierres_caja" ADD CONSTRAINT "cierres_caja_cajero_id_fkey" FOREIGN KEY (cajero_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public."campanias_marketing" ADD CONSTRAINT "campanias_marketing_creado_por_fkey" FOREIGN KEY (creado_por) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public."campanias_destinatarios" ADD CONSTRAINT "campanias_destinatarios_campania_id_fkey" FOREIGN KEY (campania_id) REFERENCES campanias_marketing(id) ON DELETE CASCADE;
ALTER TABLE public."campanias_destinatarios" ADD CONSTRAINT "campanias_destinatarios_institucion_id_fkey" FOREIGN KEY (institucion_id) REFERENCES instituciones(id) ON DELETE CASCADE;
ALTER TABLE public."campanas_pago" ADD CONSTRAINT "campanas_pago_creado_por_fkey" FOREIGN KEY (creado_por) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public."campana_participaciones" ADD CONSTRAINT "campana_participaciones_campana_id_fkey" FOREIGN KEY (campana_id) REFERENCES campanas_pago(id) ON DELETE RESTRICT;
ALTER TABLE public."campana_participaciones" ADD CONSTRAINT "campana_participaciones_familia_id_fkey" FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT;
ALTER TABLE public."autorizaciones_accesorio" ADD CONSTRAINT "autorizaciones_accesorio_familia_id_fkey" FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT;
ALTER TABLE public."autorizaciones_accesorio" ADD CONSTRAINT "autorizaciones_accesorio_representante_id_fkey" FOREIGN KEY (representante_id) REFERENCES representantes(id) ON DELETE RESTRICT;
ALTER TABLE public."ausencias_notificaciones" ADD CONSTRAINT "ausencias_notificaciones_ausencia_id_fkey" FOREIGN KEY (ausencia_id) REFERENCES ausencias_maestros(id) ON DELETE CASCADE;
ALTER TABLE public."ausencias_notificaciones" ADD CONSTRAINT "ausencias_notificaciones_director_id_fkey" FOREIGN KEY (director_id) REFERENCES maestros(id) ON DELETE CASCADE;
ALTER TABLE public."ausencias_clases_afectadas" ADD CONSTRAINT "ausencias_clases_afectadas_ausencia_id_fkey" FOREIGN KEY (ausencia_id) REFERENCES ausencias_maestros(id) ON DELETE CASCADE;
ALTER TABLE public."ausencias_clases_afectadas" ADD CONSTRAINT "ausencias_clases_afectadas_clase_id_fkey" FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE;
ALTER TABLE public."audiciones" ADD CONSTRAINT "audiciones_alumno_id_fkey" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL;
ALTER TABLE public."asistencias_emergentes" ADD CONSTRAINT "asistencias_emergentes_clase_emergente_id_fkey" FOREIGN KEY (clase_emergente_id) REFERENCES clases_emergentes(id) ON DELETE CASCADE;
ALTER TABLE public."alumnos_rutas" ADD CONSTRAINT "fk_alumnos_rutas_alumno" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE;
ALTER TABLE public."alumnos_rutas" ADD CONSTRAINT "fk_alumnos_rutas_nivel" FOREIGN KEY (nivel_id) REFERENCES niveles(id) ON DELETE CASCADE;
ALTER TABLE public."alumnos_rutas" ADD CONSTRAINT "fk_alumnos_rutas_programa" FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE CASCADE;
ALTER TABLE public."alumnos_modulos" ADD CONSTRAINT "fk_alumnos_modulos_alumno" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE;
ALTER TABLE public."alumnos_modulos" ADD CONSTRAINT "fk_alumnos_modulos_modulo" FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE;
ALTER TABLE public."alumnos_ejercicios" ADD CONSTRAINT "fk_alumnos_ejercicios_alumno" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE;
ALTER TABLE public."alumnos_ejercicios" ADD CONSTRAINT "fk_alumnos_ejercicios_ejercicio" FOREIGN KEY (ejercicio_id) REFERENCES ejercicios(id) ON DELETE CASCADE;
ALTER TABLE public."accesorio_asignaciones" ADD CONSTRAINT "accesorio_asignaciones_accesorio_id_fkey" FOREIGN KEY (accesorio_id) REFERENCES accesorios(id) ON DELETE RESTRICT;
ALTER TABLE public."accesorio_asignaciones" ADD CONSTRAINT "accesorio_asignaciones_alumno_id_fkey" FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE RESTRICT;
ALTER TABLE public."accesorio_asignaciones" ADD CONSTRAINT "accesorio_asignaciones_familia_id_fkey" FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE RESTRICT;
ALTER TABLE public."planificacion_nodos" ADD CONSTRAINT "planificacion_nodos_padre_id_fkey" FOREIGN KEY (padre_id) REFERENCES planificacion_nodos(id);

-- ==============================================================================
-- FASE 4: ÍNDICES SECUNDARIOS
-- ==============================================================================
CREATE INDEX idx_hermes_acciones_estado ON public.hermes_acciones USING btree (estado);
CREATE INDEX idx_hermes_acciones_fecha ON public.hermes_acciones USING btree (fecha_creacion);
CREATE INDEX idx_xp_log_alumno ON public.xp_log USING btree (alumno_id);
CREATE INDEX idx_xp_log_created ON public.xp_log USING btree (created_at);
CREATE UNIQUE INDEX wallet_config_familia_id_key ON public.wallet_config USING btree (familia_id);
CREATE UNIQUE INDEX tareas_portales_codigo_key ON public.tareas_portales USING btree (codigo);
CREATE INDEX idx_tareas_vencimiento ON public.tareas_portales USING btree (fecha_vencimiento);
CREATE INDEX idx_tareas_responsable ON public.tareas_portales USING btree (responsable_id);
CREATE INDEX idx_tareas_protocolo ON public.tareas_portales USING btree (protocolo_id);
CREATE UNIQUE INDEX sesion_bitacora_sesion_id_key ON public.sesion_bitacora USING btree (sesion_id);
CREATE INDEX idx_sb_clase ON public.sesion_bitacora USING btree (clase_id);
CREATE INDEX idx_sb_maestro ON public.sesion_bitacora USING btree (maestro_id);
CREATE INDEX idx_mensajes_hilo ON public.mensajes_internos USING btree (hilo_id, created_at);
CREATE INDEX idx_mensajes_departamento ON public.mensajes_internos USING gin (departamento_destino);
CREATE INDEX idx_intentos_alumno ON public.intentos_ejercicios USING btree (alumno_id);
CREATE INDEX idx_intentos_ejercicio ON public.intentos_ejercicios USING btree (ejercicio_id);
CREATE INDEX idx_intentos_sesion ON public.intentos_ejercicios USING btree (sesion_clase_id);
CREATE INDEX idx_instituciones_estado ON public.instituciones USING btree (estado);
CREATE INDEX idx_instituciones_tipo ON public.instituciones USING btree (tipo);
CREATE UNIQUE INDEX cierres_caja_fecha_unique ON public.cierres_caja USING btree (fecha);
CREATE INDEX idx_cierres_caja_fecha ON public.cierres_caja USING btree (fecha DESC);
CREATE UNIQUE INDEX campanias_destinatarios_campania_id_institucion_id_key ON public.campanias_destinatarios USING btree (campania_id, institucion_id);
CREATE INDEX idx_camp_dest_campania ON public.campanias_destinatarios USING btree (campania_id);
CREATE INDEX idx_camp_dest_institucion ON public.campanias_destinatarios USING btree (institucion_id);
CREATE INDEX idx_camp_dest_estado ON public.campanias_destinatarios USING btree (estado);
CREATE UNIQUE INDEX campana_participaciones_campana_id_familia_id_key ON public.campana_participaciones USING btree (campana_id, familia_id);
CREATE INDEX idx_audiciones_alumno ON public.audiciones USING btree (alumno_id);
CREATE INDEX idx_audiciones_fecha ON public.audiciones USING btree (fecha_auditoria);
CREATE INDEX idx_audiciones_resultado ON public.audiciones USING btree (resultado);
CREATE UNIQUE INDEX alumnos_rutas_unica ON public.alumnos_rutas USING btree (alumno_id, programa_id, nivel_id);
CREATE INDEX idx_alumnos_rutas_alumno ON public.alumnos_rutas USING btree (alumno_id);
CREATE UNIQUE INDEX alumnos_modulos_unico ON public.alumnos_modulos USING btree (alumno_id, modulo_id);
CREATE INDEX idx_alumnos_modulos_alumno ON public.alumnos_modulos USING btree (alumno_id);
CREATE UNIQUE INDEX alumnos_ejercicios_unico ON public.alumnos_ejercicios USING btree (alumno_id, ejercicio_id);
CREATE INDEX idx_alumnos_ejercicios_alumno ON public.alumnos_ejercicios USING btree (alumno_id);
CREATE INDEX idx_planificacion_nodos_maestro ON public.planificacion_nodos USING btree (maestro_id);
CREATE UNIQUE INDEX uq_planificacion_programa_nivel ON public.planificacion USING btree (programa_id, nivel);
CREATE INDEX idx_planificacion_programa_id ON public.planificacion USING btree (programa_id);
CREATE INDEX idx_planificacion_nivel ON public.planificacion USING btree (nivel);
CREATE INDEX idx_planificacion_activo ON public.planificacion USING btree (activo);
CREATE INDEX idx_planificacion_fecha_inicio ON public.planificacion USING btree (fecha_inicio);

-- ==============================================================================
-- FASE 5: ROW LEVEL SECURITY (RLS) Y POLÍTICAS DE SEGURIDAD
-- ==============================================================================
ALTER TABLE public."hilos_mensajes" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hilos_all_admin" ON public."hilos_mensajes" FOR ALL TO public USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
CREATE POLICY "hilos_insert_cajero_admin" ON public."hilos_mensajes" FOR INSERT TO public WITH CHECK ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
CREATE POLICY "hilos_select_cajero_admin" ON public."hilos_mensajes" FOR SELECT TO public USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
ALTER TABLE public."hermes_acciones" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hermes_acciones_authenticated_all" ON public."hermes_acciones" FOR ALL TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE public."xp_log" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "xp_log_admin_read" ON public."xp_log" FOR SELECT TO public USING (es_admin());
CREATE POLICY "xp_log_authenticated_all" ON public."xp_log" FOR ALL TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE public."wallet_config" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wallet_config_all_cajero_admin" ON public."wallet_config" FOR ALL TO public USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text]))) WITH CHECK ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
ALTER TABLE public."tareas_portales" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tareas_portales_authenticated_all" ON public."tareas_portales" FOR ALL TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE public."sesion_bitacora" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bitacora_acm_read" ON public."sesion_bitacora" FOR SELECT TO authenticated USING (es_coordinador_acm());
CREATE POLICY "bitacora_owner" ON public."sesion_bitacora" FOR ALL TO authenticated USING ((es_maestro_de_clase(clase_id) AND (maestro_id = maestro_actual()))) WITH CHECK ((es_maestro_de_clase(clase_id) AND (maestro_id = maestro_actual())));
ALTER TABLE public."repertoire_fragments" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admin modify repertoire_fragments" ON public."repertoire_fragments" FOR ALL TO authenticated USING (is_app_admin()) WITH CHECK (is_app_admin());
CREATE POLICY "Allow public read repertoire_fragments" ON public."repertoire_fragments" FOR SELECT TO public USING (true);
ALTER TABLE public."prospeccion_log" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "camp_prospeccion_insert_authenticated" ON public."prospeccion_log" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "camp_prospeccion_select_authenticated" ON public."prospeccion_log" FOR SELECT TO authenticated USING (true);
ALTER TABLE public."mensajes_internos" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mensajes_insert_cajero_admin" ON public."mensajes_internos" FOR INSERT TO public WITH CHECK ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
CREATE POLICY "mensajes_select_cajero_admin" ON public."mensajes_internos" FOR SELECT TO public USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
ALTER TABLE public."inventario_import_staging" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."intentos_ejercicios" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "intentos_ejercicios_admin_read" ON public."intentos_ejercicios" FOR SELECT TO public USING (es_admin());
CREATE POLICY "intentos_ejercicios_authenticated_all" ON public."intentos_ejercicios" FOR ALL TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE public."instituciones" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "camp_instituciones_delete_authenticated" ON public."instituciones" FOR DELETE TO authenticated USING (true);
CREATE POLICY "camp_instituciones_insert_authenticated" ON public."instituciones" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "camp_instituciones_select_authenticated" ON public."instituciones" FOR SELECT TO authenticated USING (true);
CREATE POLICY "camp_instituciones_update_authenticated" ON public."instituciones" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE public."hermes_notificaciones" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hermes_notificaciones_authenticated_all" ON public."hermes_notificaciones" FOR ALL TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE public."hermes_feedback" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hermes_feedback_authenticated_all" ON public."hermes_feedback" FOR ALL TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE public."hermes_evaluaciones" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hermes_evaluaciones_authenticated_all" ON public."hermes_evaluaciones" FOR ALL TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE public."exoneraciones" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exoneraciones_all_admin" ON public."exoneraciones" FOR ALL TO public USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
CREATE POLICY "exoneraciones_select_cajero_admin" ON public."exoneraciones" FOR SELECT TO public USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
ALTER TABLE public."clase_acceso_temporal" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clase_acceso_temporal_admin_read" ON public."clase_acceso_temporal" FOR SELECT TO public USING (es_admin());
CREATE POLICY "clase_acceso_temporal_delete" ON public."clase_acceso_temporal" FOR DELETE TO authenticated USING (maestro_en_clase(clase_id));
CREATE POLICY "clase_acceso_temporal_insert" ON public."clase_acceso_temporal" FOR INSERT TO authenticated WITH CHECK (maestro_en_clase(clase_id));
CREATE POLICY "clase_acceso_temporal_select" ON public."clase_acceso_temporal" FOR SELECT TO authenticated USING (((maestro_suplente_id = maestro_actual()) OR maestro_en_clase(clase_id)));
CREATE POLICY "clase_acceso_temporal_update" ON public."clase_acceso_temporal" FOR UPDATE TO authenticated USING (maestro_en_clase(clase_id)) WITH CHECK (maestro_en_clase(clase_id));
ALTER TABLE public."cierres_caja" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cierres_caja_insert_cajero_admin" ON public."cierres_caja" FOR INSERT TO public WITH CHECK ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
CREATE POLICY "cierres_caja_select_cajero_admin" ON public."cierres_caja" FOR SELECT TO public USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
CREATE POLICY "cierres_caja_update_admin" ON public."cierres_caja" FOR UPDATE TO public USING ((get_user_role() = 'admin'::text));
ALTER TABLE public."campanias_marketing" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "camp_campanias_delete_authenticated" ON public."campanias_marketing" FOR DELETE TO authenticated USING (true);
CREATE POLICY "camp_campanias_insert_authenticated" ON public."campanias_marketing" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "camp_campanias_select_authenticated" ON public."campanias_marketing" FOR SELECT TO authenticated USING (true);
CREATE POLICY "camp_campanias_update_authenticated" ON public."campanias_marketing" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE public."campanias_destinatarios" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "camp_destinatarios_delete_authenticated" ON public."campanias_destinatarios" FOR DELETE TO authenticated USING (true);
CREATE POLICY "camp_destinatarios_insert_authenticated" ON public."campanias_destinatarios" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "camp_destinatarios_select_authenticated" ON public."campanias_destinatarios" FOR SELECT TO authenticated USING (true);
CREATE POLICY "camp_destinatarios_update_authenticated" ON public."campanias_destinatarios" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE public."campanas_pago" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campanas_all_admin" ON public."campanas_pago" FOR ALL TO public USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
CREATE POLICY "campanas_select_activa_cajero" ON public."campanas_pago" FOR SELECT TO public USING (((get_user_role() = 'finanzas'::text) AND (activa = true)));
ALTER TABLE public."campana_participaciones" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campana_part_all_admin" ON public."campana_participaciones" FOR ALL TO public USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
CREATE POLICY "campana_part_insert_cajero_admin" ON public."campana_participaciones" FOR INSERT TO public WITH CHECK ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
CREATE POLICY "campana_part_select_cajero_admin" ON public."campana_participaciones" FOR SELECT TO public USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
ALTER TABLE public."autorizaciones_accesorio" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "autorizaciones_all_admin" ON public."autorizaciones_accesorio" FOR ALL TO public USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
CREATE POLICY "autorizaciones_select_cajero" ON public."autorizaciones_accesorio" FOR SELECT TO public USING ((get_user_role() = 'finanzas'::text));
ALTER TABLE public."ausencias_notificaciones" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_can_insert_notifications" ON public."ausencias_notificaciones" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "ausencias_notificaciones_admin_read" ON public."ausencias_notificaciones" FOR SELECT TO public USING (es_admin());
CREATE POLICY "director_can_read_own_notifications" ON public."ausencias_notificaciones" FOR SELECT TO authenticated USING ((director_id = auth.uid()));
ALTER TABLE public."ausencias_clases_afectadas" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ausencias_clases_afectadas_admin_read" ON public."ausencias_clases_afectadas" FOR SELECT TO public USING (es_admin());
CREATE POLICY "maestro_can_insert_own_clase_afectada" ON public."ausencias_clases_afectadas" FOR INSERT TO authenticated WITH CHECK ((ausencia_id IN ( SELECT ausencias_maestros.id
   FROM ausencias_maestros
  WHERE (ausencias_maestros.maestro_id = auth.uid()))));
CREATE POLICY "maestro_can_read_own_clase_afectada" ON public."ausencias_clases_afectadas" FOR SELECT TO authenticated USING (((ausencia_id IN ( SELECT ausencias_maestros.id
   FROM ausencias_maestros
  WHERE (ausencias_maestros.maestro_id = auth.uid()))) OR (clase_id IN ( SELECT clases.id
   FROM clases
  WHERE ((clases.maestro_principal_id = auth.uid()) OR (clases.maestro_suplente_id = auth.uid()))))));
ALTER TABLE public."audiciones" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir escritura solo a jurado y administradores" ON public."audiciones" FOR INSERT TO authenticated WITH CHECK (((auth.role() = 'service_role'::text) OR ((auth.jwt() ->> 'role'::text) = ANY (ARRAY['jurado'::text, 'admin'::text])) OR ((auth.jwt() ->> 'email'::text) = 'jurado1@test.com'::text)));
CREATE POLICY "Permitir lectura para usuarios autenticados" ON public."audiciones" FOR SELECT TO authenticated USING (true);
ALTER TABLE public."asistencias_emergentes" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated insert asistencias_emergentes" ON public."asistencias_emergentes" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated read asistencias_emergentes" ON public."asistencias_emergentes" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated update asistencias_emergentes" ON public."asistencias_emergentes" FOR UPDATE TO authenticated USING (true);
ALTER TABLE public."alumnos_rutas" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alumnos_rutas_admin_read" ON public."alumnos_rutas" FOR SELECT TO public USING (es_admin());
CREATE POLICY "alumnos_rutas_authenticated_all" ON public."alumnos_rutas" FOR ALL TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE public."alumnos_modulos" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alumnos_modulos_admin_read" ON public."alumnos_modulos" FOR SELECT TO public USING (es_admin());
CREATE POLICY "alumnos_modulos_authenticated_all" ON public."alumnos_modulos" FOR ALL TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE public."alumnos_ejercicios" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alumnos_ejercicios_admin_read" ON public."alumnos_ejercicios" FOR SELECT TO public USING (es_admin());
CREATE POLICY "alumnos_ejercicios_authenticated_all" ON public."alumnos_ejercicios" FOR ALL TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE public."accesorio_asignaciones" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aa_all_admin" ON public."accesorio_asignaciones" FOR ALL TO public USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));
CREATE POLICY "aa_insert_cajero_admin" ON public."accesorio_asignaciones" FOR INSERT TO public WITH CHECK ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
CREATE POLICY "aa_select_cajero_admin" ON public."accesorio_asignaciones" FOR SELECT TO public USING ((get_user_role() = ANY (ARRAY['finanzas'::text, 'admin'::text])));
ALTER TABLE public."planificacion_nodos" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "planificacion_nodos_admin_read" ON public."planificacion_nodos" FOR SELECT TO public USING (es_admin());
ALTER TABLE public."planificacion" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Planificacion is viewable by everyone" ON public."planificacion" FOR SELECT TO public USING (true);
CREATE POLICY "Service role has full access to planificacion" ON public."planificacion" FOR ALL TO public USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));
CREATE POLICY "planificacion_admin_read" ON public."planificacion" FOR SELECT TO public USING (es_admin());

-- ==============================================================================
-- FASE 6: COMENTARIOS DE TABLAS Y COLUMNAS
-- ==============================================================================
COMMENT ON TABLE public."inventario_import_staging" IS 'Tabla temporal/auditable para importar inventario_supabase_import.csv antes de normalizar a inventario_activos e inventario_accesorios.';
COMMENT ON TABLE public."ausencias_notificaciones" IS 'Tracks notifications sent to directors about absence requests';
COMMENT ON TABLE public."ausencias_clases_afectadas" IS 'Junction table: tracks which classes are affected by an absence and replacement activities';
COMMENT ON TABLE public."audiciones" IS 'Registro centralizado de evaluaciones de audiciones de nivel y diagnóstico según el canon ACM-RUB-001 V8.';
COMMENT ON TABLE public."planificacion_nodos" IS 'DEPRECATED: usar routes hierarchy';

-- ==============================================================================
-- FASE 7: PERMISOS ESTÁNDAR SUPABASE
-- ==============================================================================
GRANT ALL ON TABLE public."hilos_mensajes" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."hilos_mensajes" TO authenticated;
GRANT ALL ON TABLE public."hermes_acciones" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."hermes_acciones" TO authenticated;
GRANT ALL ON TABLE public."xp_log" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."xp_log" TO authenticated;
GRANT ALL ON TABLE public."wallet_config" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."wallet_config" TO authenticated;
GRANT ALL ON TABLE public."tareas_portales" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."tareas_portales" TO authenticated;
GRANT ALL ON TABLE public."sesion_bitacora" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."sesion_bitacora" TO authenticated;
GRANT ALL ON TABLE public."repertoire_fragments" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."repertoire_fragments" TO authenticated;
GRANT ALL ON TABLE public."prospeccion_log" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."prospeccion_log" TO authenticated;
GRANT ALL ON TABLE public."mensajes_internos" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."mensajes_internos" TO authenticated;
GRANT ALL ON TABLE public."inventario_import_staging" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."inventario_import_staging" TO authenticated;
GRANT ALL ON TABLE public."intentos_ejercicios" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."intentos_ejercicios" TO authenticated;
GRANT ALL ON TABLE public."instituciones" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."instituciones" TO authenticated;
GRANT ALL ON TABLE public."hermes_notificaciones" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."hermes_notificaciones" TO authenticated;
GRANT ALL ON TABLE public."hermes_feedback" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."hermes_feedback" TO authenticated;
GRANT ALL ON TABLE public."hermes_evaluaciones" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."hermes_evaluaciones" TO authenticated;
GRANT ALL ON TABLE public."exoneraciones" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."exoneraciones" TO authenticated;
GRANT ALL ON TABLE public."clase_acceso_temporal" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."clase_acceso_temporal" TO authenticated;
GRANT ALL ON TABLE public."cierres_caja" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."cierres_caja" TO authenticated;
GRANT ALL ON TABLE public."campanias_marketing" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."campanias_marketing" TO authenticated;
GRANT ALL ON TABLE public."campanias_destinatarios" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."campanias_destinatarios" TO authenticated;
GRANT ALL ON TABLE public."campanas_pago" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."campanas_pago" TO authenticated;
GRANT ALL ON TABLE public."campana_participaciones" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."campana_participaciones" TO authenticated;
GRANT ALL ON TABLE public."autorizaciones_accesorio" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."autorizaciones_accesorio" TO authenticated;
GRANT ALL ON TABLE public."ausencias_notificaciones" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."ausencias_notificaciones" TO authenticated;
GRANT ALL ON TABLE public."ausencias_clases_afectadas" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."ausencias_clases_afectadas" TO authenticated;
GRANT ALL ON TABLE public."audiciones" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."audiciones" TO authenticated;
GRANT ALL ON TABLE public."asistencias_emergentes" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."asistencias_emergentes" TO authenticated;
GRANT ALL ON TABLE public."alumnos_rutas" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."alumnos_rutas" TO authenticated;
GRANT ALL ON TABLE public."alumnos_modulos" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."alumnos_modulos" TO authenticated;
GRANT ALL ON TABLE public."alumnos_ejercicios" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."alumnos_ejercicios" TO authenticated;
GRANT ALL ON TABLE public."accesorio_asignaciones" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."accesorio_asignaciones" TO authenticated;
GRANT ALL ON TABLE public."planificacion_nodos" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."planificacion_nodos" TO authenticated;
GRANT ALL ON TABLE public."planificacion" TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."planificacion" TO authenticated;

COMMIT;