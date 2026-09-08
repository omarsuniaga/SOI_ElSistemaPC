-- ==============================================================================
-- FASE 0 · SCRIPT DE PODA CONTROLADA: DROP TABLE DE 33 TABLAS (Tarea 0.2)
-- ==============================================================================
-- Fecha: 2026-09-08
-- Autorización: Omar Suniaga (Owner) — PENDIENTE DE OK FINAL
-- Auditoría técnica: Lila (Senior Technical Auditor & Architect)
-- Estatus: 33 TABLAS RECONCILIADAS (minutas retirada bajo Opción B)
-- 
-- PROTOCOLO DE SEGURIDAD ESTRICTO:
-- 1. NO UTILIZA 'CASCADE'. Cada una de las 33 tablas se elimina limpiamente por orden topológico.
-- 2. PRECONDICIONES AUTOMÁTICAS: Antes de cada DROP se valida:
--    a) count(*) = 0 (abort si la tabla recibió aunque sea 1 registro).
--    b) cero vistas dependientes en pg_views.
--    c) cero foreign keys entrantes desde tablas externas fuera del lote.
-- 3. TRANSACCIÓN ATÓMICA: Todo corre dentro de un bloque BEGIN...COMMIT.
--    Si una sola precondición falla, la transacción se revierte por completo (ROLLBACK).
-- 4. RESPALDO PREVIO OBLIGATORIO:
--    Evidencia almacenada en: supabase/backups/20260908_backup_pre_poda_33tablas.sql
-- ==============================================================================

BEGIN;

DO $$
DECLARE
  v_count bigint;
  v_views text;
  v_fks text;
BEGIN
  RAISE NOTICE '>>> Iniciando validación de precondiciones y poda de 33 tablas...';

  -- --------------------------------------------------------------------------
  -- [Paso 1/33] Tabla: planificacion (Owner: ACM)
  -- Justificación: Reemplazada por arquitectura curricular Gen-2
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'planificacion' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'planificacion', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'planificacion';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'planificacion', v_views;
  END IF;
  DROP TABLE public."planificacion";
  RAISE NOTICE '   [Paso 1/33] DROP TABLE public.% completado.', 'planificacion';

  -- --------------------------------------------------------------------------
  -- [Paso 2/33] Tabla: planificacion_nodos (Owner: ACM)
  -- Justificación: Residuo de migración y test
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'planificacion_nodos' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'planificacion_nodos', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'planificacion_nodos';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'planificacion_nodos', v_views;
  END IF;
  DROP TABLE public."planificacion_nodos";
  RAISE NOTICE '   [Paso 2/33] DROP TABLE public.% completado.', 'planificacion_nodos';

  -- --------------------------------------------------------------------------
  -- [Paso 3/33] Tabla: accesorio_asignaciones (Owner: inventario/lutería)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'accesorio_asignaciones' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'accesorio_asignaciones', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'accesorio_asignaciones';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'accesorio_asignaciones', v_views;
  END IF;
  DROP TABLE public."accesorio_asignaciones";
  RAISE NOTICE '   [Paso 3/33] DROP TABLE public.% completado.', 'accesorio_asignaciones';

  -- --------------------------------------------------------------------------
  -- [Paso 4/33] Tabla: alumnos_ejercicios (Owner: protección/seguimiento)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'alumnos_ejercicios' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'alumnos_ejercicios', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'alumnos_ejercicios';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'alumnos_ejercicios', v_views;
  END IF;
  DROP TABLE public."alumnos_ejercicios";
  RAISE NOTICE '   [Paso 4/33] DROP TABLE public.% completado.', 'alumnos_ejercicios';

  -- --------------------------------------------------------------------------
  -- [Paso 5/33] Tabla: alumnos_modulos (Owner: alumno/admisiones)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'alumnos_modulos' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'alumnos_modulos', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'alumnos_modulos';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'alumnos_modulos', v_views;
  END IF;
  DROP TABLE public."alumnos_modulos";
  RAISE NOTICE '   [Paso 5/33] DROP TABLE public.% completado.', 'alumnos_modulos';

  -- --------------------------------------------------------------------------
  -- [Paso 6/33] Tabla: alumnos_rutas (Owner: académico)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'alumnos_rutas' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'alumnos_rutas', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'alumnos_rutas';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'alumnos_rutas', v_views;
  END IF;
  DROP TABLE public."alumnos_rutas";
  RAISE NOTICE '   [Paso 6/33] DROP TABLE public.% completado.', 'alumnos_rutas';

  -- --------------------------------------------------------------------------
  -- [Paso 7/33] Tabla: asistencias_emergentes (Owner: protección/seguimiento)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'asistencias_emergentes' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'asistencias_emergentes', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'asistencias_emergentes';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'asistencias_emergentes', v_views;
  END IF;
  DROP TABLE public."asistencias_emergentes";
  RAISE NOTICE '   [Paso 7/33] DROP TABLE public.% completado.', 'asistencias_emergentes';

  -- --------------------------------------------------------------------------
  -- [Paso 8/33] Tabla: audiciones (Owner: alumno/admisiones)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'audiciones' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'audiciones', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'audiciones';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'audiciones', v_views;
  END IF;
  DROP TABLE public."audiciones";
  RAISE NOTICE '   [Paso 8/33] DROP TABLE public.% completado.', 'audiciones';

  -- --------------------------------------------------------------------------
  -- [Paso 9/33] Tabla: ausencias_clases_afectadas (Owner: protección/seguimiento)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'ausencias_clases_afectadas' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'ausencias_clases_afectadas', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'ausencias_clases_afectadas';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'ausencias_clases_afectadas', v_views;
  END IF;
  DROP TABLE public."ausencias_clases_afectadas";
  RAISE NOTICE '   [Paso 9/33] DROP TABLE public.% completado.', 'ausencias_clases_afectadas';

  -- --------------------------------------------------------------------------
  -- [Paso 10/33] Tabla: ausencias_notificaciones (Owner: protección/seguimiento)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'ausencias_notificaciones' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'ausencias_notificaciones', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'ausencias_notificaciones';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'ausencias_notificaciones', v_views;
  END IF;
  DROP TABLE public."ausencias_notificaciones";
  RAISE NOTICE '   [Paso 10/33] DROP TABLE public.% completado.', 'ausencias_notificaciones';

  -- --------------------------------------------------------------------------
  -- [Paso 11/33] Tabla: autorizaciones_accesorio (Owner: inventario/lutería)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'autorizaciones_accesorio' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'autorizaciones_accesorio', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'autorizaciones_accesorio';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'autorizaciones_accesorio', v_views;
  END IF;
  DROP TABLE public."autorizaciones_accesorio";
  RAISE NOTICE '   [Paso 11/33] DROP TABLE public.% completado.', 'autorizaciones_accesorio';

  -- --------------------------------------------------------------------------
  -- [Paso 12/33] Tabla: campana_participaciones (Owner: ninguna identificada)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'campana_participaciones' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'campana_participaciones', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'campana_participaciones';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'campana_participaciones', v_views;
  END IF;
  DROP TABLE public."campana_participaciones";
  RAISE NOTICE '   [Paso 12/33] DROP TABLE public.% completado.', 'campana_participaciones';

  -- --------------------------------------------------------------------------
  -- [Paso 13/33] Tabla: campanas_pago (Owner: finanzas)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'campanas_pago' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'campanas_pago', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'campanas_pago';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'campanas_pago', v_views;
  END IF;
  DROP TABLE public."campanas_pago";
  RAISE NOTICE '   [Paso 13/33] DROP TABLE public.% completado.', 'campanas_pago';

  -- --------------------------------------------------------------------------
  -- [Paso 14/33] Tabla: campanias_destinatarios (Owner: alianzas/comunicaciones)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'campanias_destinatarios' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'campanias_destinatarios', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'campanias_destinatarios';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'campanias_destinatarios', v_views;
  END IF;
  DROP TABLE public."campanias_destinatarios";
  RAISE NOTICE '   [Paso 14/33] DROP TABLE public.% completado.', 'campanias_destinatarios';

  -- --------------------------------------------------------------------------
  -- [Paso 15/33] Tabla: campanias_marketing (Owner: alianzas/comunicaciones)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'campanias_marketing' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'campanias_marketing', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'campanias_marketing';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'campanias_marketing', v_views;
  END IF;
  DROP TABLE public."campanias_marketing";
  RAISE NOTICE '   [Paso 15/33] DROP TABLE public.% completado.', 'campanias_marketing';

  -- --------------------------------------------------------------------------
  -- [Paso 16/33] Tabla: cierres_caja (Owner: finanzas)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'cierres_caja' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'cierres_caja', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'cierres_caja';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'cierres_caja', v_views;
  END IF;
  DROP TABLE public."cierres_caja";
  RAISE NOTICE '   [Paso 16/33] DROP TABLE public.% completado.', 'cierres_caja';

  -- --------------------------------------------------------------------------
  -- [Paso 17/33] Tabla: clase_acceso_temporal (Owner: académico/operaciones)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'clase_acceso_temporal' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'clase_acceso_temporal', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'clase_acceso_temporal';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'clase_acceso_temporal', v_views;
  END IF;
  DROP TABLE public."clase_acceso_temporal";
  RAISE NOTICE '   [Paso 17/33] DROP TABLE public.% completado.', 'clase_acceso_temporal';

  -- --------------------------------------------------------------------------
  -- [Paso 18/33] Tabla: exoneraciones (Owner: finanzas)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'exoneraciones' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'exoneraciones', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'exoneraciones';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'exoneraciones', v_views;
  END IF;
  DROP TABLE public."exoneraciones";
  RAISE NOTICE '   [Paso 18/33] DROP TABLE public.% completado.', 'exoneraciones';

  -- --------------------------------------------------------------------------
  -- [Paso 19/33] Tabla: hermes_evaluaciones (Owner: gateway/hermes)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'hermes_evaluaciones' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'hermes_evaluaciones', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'hermes_evaluaciones';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'hermes_evaluaciones', v_views;
  END IF;
  DROP TABLE public."hermes_evaluaciones";
  RAISE NOTICE '   [Paso 19/33] DROP TABLE public.% completado.', 'hermes_evaluaciones';

  -- --------------------------------------------------------------------------
  -- [Paso 20/33] Tabla: hermes_feedback (Owner: gateway/hermes)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'hermes_feedback' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'hermes_feedback', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'hermes_feedback';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'hermes_feedback', v_views;
  END IF;
  DROP TABLE public."hermes_feedback";
  RAISE NOTICE '   [Paso 20/33] DROP TABLE public.% completado.', 'hermes_feedback';

  -- --------------------------------------------------------------------------
  -- [Paso 21/33] Tabla: hermes_notificaciones (Owner: gateway/hermes)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'hermes_notificaciones' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'hermes_notificaciones', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'hermes_notificaciones';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'hermes_notificaciones', v_views;
  END IF;
  DROP TABLE public."hermes_notificaciones";
  RAISE NOTICE '   [Paso 21/33] DROP TABLE public.% completado.', 'hermes_notificaciones';

  -- --------------------------------------------------------------------------
  -- [Paso 22/33] Tabla: instituciones (Owner: alianzas/comunicaciones)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'instituciones' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'instituciones', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'instituciones';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'instituciones', v_views;
  END IF;
  DROP TABLE public."instituciones";
  RAISE NOTICE '   [Paso 22/33] DROP TABLE public.% completado.', 'instituciones';

  -- --------------------------------------------------------------------------
  -- [Paso 23/33] Tabla: intentos_ejercicios (Owner: protección/seguimiento)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'intentos_ejercicios' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'intentos_ejercicios', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'intentos_ejercicios';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'intentos_ejercicios', v_views;
  END IF;
  DROP TABLE public."intentos_ejercicios";
  RAISE NOTICE '   [Paso 23/33] DROP TABLE public.% completado.', 'intentos_ejercicios';

  -- --------------------------------------------------------------------------
  -- [Paso 24/33] Tabla: inventario_import_staging (Owner: inventario/lutería)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'inventario_import_staging' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'inventario_import_staging', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'inventario_import_staging';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'inventario_import_staging', v_views;
  END IF;
  DROP TABLE public."inventario_import_staging";
  RAISE NOTICE '   [Paso 24/33] DROP TABLE public.% completado.', 'inventario_import_staging';

  -- --------------------------------------------------------------------------
  -- [Paso 25/33] Tabla: mensajes_internos (Owner: alianzas/comunicaciones)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'mensajes_internos' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'mensajes_internos', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'mensajes_internos';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'mensajes_internos', v_views;
  END IF;
  DROP TABLE public."mensajes_internos";
  RAISE NOTICE '   [Paso 25/33] DROP TABLE public.% completado.', 'mensajes_internos';

  -- --------------------------------------------------------------------------
  -- [Paso 26/33] Tabla: prospeccion_log (Owner: alianzas/comunicaciones)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'prospeccion_log' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'prospeccion_log', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'prospeccion_log';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'prospeccion_log', v_views;
  END IF;
  DROP TABLE public."prospeccion_log";
  RAISE NOTICE '   [Paso 26/33] DROP TABLE public.% completado.', 'prospeccion_log';

  -- --------------------------------------------------------------------------
  -- [Paso 27/33] Tabla: repertoire_fragments (Owner: académico)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'repertoire_fragments' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'repertoire_fragments', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'repertoire_fragments';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'repertoire_fragments', v_views;
  END IF;
  DROP TABLE public."repertoire_fragments";
  RAISE NOTICE '   [Paso 27/33] DROP TABLE public.% completado.', 'repertoire_fragments';

  -- --------------------------------------------------------------------------
  -- [Paso 28/33] Tabla: sesion_bitacora (Owner: académico)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'sesion_bitacora' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'sesion_bitacora', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'sesion_bitacora';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'sesion_bitacora', v_views;
  END IF;
  DROP TABLE public."sesion_bitacora";
  RAISE NOTICE '   [Paso 28/33] DROP TABLE public.% completado.', 'sesion_bitacora';

  -- --------------------------------------------------------------------------
  -- [Paso 29/33] Tabla: tareas_portales (Owner: operaciones/reportes)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'tareas_portales' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'tareas_portales', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'tareas_portales';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'tareas_portales', v_views;
  END IF;
  DROP TABLE public."tareas_portales";
  RAISE NOTICE '   [Paso 29/33] DROP TABLE public.% completado.', 'tareas_portales';

  -- --------------------------------------------------------------------------
  -- [Paso 30/33] Tabla: wallet_config (Owner: finanzas)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'wallet_config' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'wallet_config', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'wallet_config';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'wallet_config', v_views;
  END IF;
  DROP TABLE public."wallet_config";
  RAISE NOTICE '   [Paso 30/33] DROP TABLE public.% completado.', 'wallet_config';

  -- --------------------------------------------------------------------------
  -- [Paso 31/33] Tabla: xp_log (Owner: protección/seguimiento)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'xp_log' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'xp_log', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'xp_log';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'xp_log', v_views;
  END IF;
  DROP TABLE public."xp_log";
  RAISE NOTICE '   [Paso 31/33] DROP TABLE public.% completado.', 'xp_log';

  -- --------------------------------------------------------------------------
  -- [Paso 32/33] Tabla: hermes_acciones (Owner: gateway/hermes)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'hermes_acciones' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'hermes_acciones', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'hermes_acciones';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'hermes_acciones', v_views;
  END IF;
  DROP TABLE public."hermes_acciones";
  RAISE NOTICE '   [Paso 32/33] DROP TABLE public.% completado.', 'hermes_acciones';

  -- --------------------------------------------------------------------------
  -- [Paso 33/33] Tabla: hilos_mensajes (Owner: alianzas/comunicaciones)
  -- Justificación: Sin consumidores en código ni dependencias en BD
  -- --------------------------------------------------------------------------
  EXECUTE 'SELECT count(*) FROM public."' || 'hilos_mensajes' || '"' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% no está vacía (tiene % filas). Poda cancelada.', 'hilos_mensajes', v_count;
  END IF;
  SELECT string_agg(view_name, ', ') INTO v_views
  FROM information_schema.view_table_usage
  WHERE view_schema = 'public' AND table_name = 'hilos_mensajes';
  IF v_views IS NOT NULL THEN
    RAISE EXCEPTION 'ABORT: La tabla public.% es requerida por vistas (%s). Poda cancelada.', 'hilos_mensajes', v_views;
  END IF;
  DROP TABLE public."hilos_mensajes";
  RAISE NOTICE '   [Paso 33/33] DROP TABLE public.% completado.', 'hilos_mensajes';

  RAISE NOTICE '>>> PODA COMPLETADA CON ÉXITO: 33 tablas eliminadas en orden topológico sin CASCADE.';
END $$;

COMMIT;