--
-- FASE 0 · SCRIPT DE ROLLBACK / RESTAURACIÓN DE TABLAS PODADAS
-- Generado automáticamente tras auditoría FASE 0 - Tarea 0.2
-- Restaura las tablas podadas con sus columnas, tipos y primary keys originales
--
BEGIN;

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
-- Tabla: minutas
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public."minutas" (
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
  "created_at" timestamptz DEFAULT now(),
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

COMMIT;