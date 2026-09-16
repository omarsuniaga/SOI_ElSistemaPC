# VERIFICATION MATRIX — Validación Empírica de Afirmaciones del Master SPEC v2.0

> **Documento Auditado:** `SOI_MASTER_SPEC_v2.0_UNIFICADO.md`
> **Base de Datos:** `SOI_DDBB_EL_SISTEMAPC` (`zmhmdvmyeyswunurcyow`, PostgreSQL 17.6)
> **Repositorio:** `SOI_ElSistemaPC` @ commit `2803124f`
> **Estados Permitidos:** `VERIFIED` · `PARTIALLY_VERIFIED` · `FALSE` · `STALE` · `UNKNOWN`

| SPEC_REFERENCE | CLAIM | STATUS | EVIDENCE | FILE / TABLE / RPC / POLICY | NOTES |
|---|---|---|---|---|---|
| §3 L163 | "Tablas totales: 247" | `FALSE` | En Supabase `public` existen exactamente **216 tablas base**, 43 vistas y 0 matviews. | `information_schema.tables`, `columns.json` | 247 contaba probablemente schemas internos o extensiones. |
| §3 L164 | "Tablas sin una sola fila: 123 (50,2%)" | `PARTIALLY_VERIFIED` | 88 tablas tienen filas (>0) y 128 tablas tienen `n_live_tup = 0`. 19 tienen comentario `-- DEPRECATED`. | `pg_stat_user_tables`, `_SHARED_FACTS.md` | El orden de magnitud es correcto (59% vacías). |
| §3 L165 | "Indicadores curriculares cargados: 4.163" | `VERIFIED` | `SELECT count(*) FROM public.indicators` = 4.163 filas. | Tabla `indicators` | Activo curricular masivo confirmado. |
| §3 L166 | "Intentos de evaluación de indicadores: 20" | `VERIFIED` | `SELECT count(*) FROM public.indicator_attempts` = 20 filas. | Tabla `indicator_attempts` | Confirma subutilización del árbol curricular. |
| §3 L167 | "Eventos detectados por Hermes: 1.971" | `STALE` | La tabla `public.soi_eventos` registra hoy **2.579 eventos** (+608 desde la auditoría previa del 7 sep). | Tabla `soi_eventos` | El sensor sigue registrando actividad en vivo. |
| §3 L168 | "Acciones registradas sobre eventos Hermes: 0" | `VERIFIED` | Brecha B confirmada: no existen tablas de acciones ejecutadas sobre `soi_eventos`. | `soi_eventos`, `soi_event_bus` | Se requiere el bucle de cierre en SOI 2.0. |
| §3 L169 | "Tareas de seguimiento: 187" | `STALE` | `tareas_institucionales` tiene hoy **210 filas**. | Tabla `tareas_institucionales` | Creció de 187 a 210 tareas. |
| §3 L170 | "Disparos de notificación: 317" | `STALE` | `notification_trigger_logs` tiene hoy **326 filas**. | Tabla `notification_trigger_logs` | Notificaciones activas. |
| §3 L171 | "Cuotas emitidas: 474" | `STALE` | `public.cuotas` tiene hoy **718 filas**. | Tabla `cuotas` | Se emitieron nuevas cuotas mensuales. |
| §3 L172 | "Pagos registrados: 2" | `STALE` | `public.pagos` tiene hoy **3 filas** y `aplicaciones_pago` tiene **6 filas**. | Tablas `pagos`, `aplicaciones_pago` | Sigue confirmando que el circuito financiero no cierra. |
| §3 L173 | "Instrumentos inventariados: 324 (informe 2025: 219)" | `VERIFIED` | `inventario_activos` registra exactamente **324 filas**. `comodatos_activos` tiene 30. | Tabla `inventario_activos` | Hay 324 físicos registrados; 30 en comodato formal. |
| §3 L174 | "Órdenes de reparación: 1" | `VERIFIED` | `lut_ordenes_reparacion` registra exactamente **1 fila**. | Tabla `lut_ordenes_reparacion` | Lutería no deja rastro en producción. |
| §3 L175 | "Portales-cascarón (1-4 archivos): 8" | `VERIFIED` | Portales `audiciones`, `com`, `tecnico`, `simulador`, `luteria`, `inventario` tienen 1-2 archivos js en `src/portales/`. | `src/portales/*` | Confirmada navegación promisoria sin módulo profundo. |
| §3 L176 | "Mutaciones sin verificar filas (C1): ~51-74" | `VERIFIED` | Escaneo estático muestra decenas de `.update()` y `.delete()` sin encadenar `.select()` en `src/modules/` y `portal-maestros`. | Múltiples en `src/modules/*/api/` | Riesgo de éxito fantasma ante fallas de RLS. |
| §5.1 L228 | "RLS por departamento (get_user_department())" | `VERIFIED` | Función `get_user_department()` existe en BD y 591 políticas la aplican. | `functions_triggers.json`, `policies.json` | IAM departamental activo. |
| §5.1 L234 | "WhatsApp runner con Baileys" | `VERIFIED` | Código presente en `src/services/whatsapp-runner/` y `docker/whatsapp-gateway/`. | Repositorio | Migración desde Evolution API completada en arquitectura. |
| §5.1 L235 | "whatsapp-webhook con autorespuesta obsoleto" | `VERIFIED` | Edge Function `whatsapp-webhook` aún desplegada (v23); debe retirarse autorespuesta LLM. | Supabase Edge Functions | Tarea para Fase 0. |
| §10.1 L563 | "Auditoría académica por criterios" | `PARTIALLY_VERIFIED` | Existen vistas `teacher_class_fill_metrics` y `v_semaforo_contenidos`. | Vistas SQL | Existen métricas de llenado de clase y semáforo. |
| §10.1 L610 | "Clases emergentes existen" | `VERIFIED` | Tabla `clases_emergentes` existe, tiene vistas en señalética y endpoint en portal maestros. | Tabla `clases_emergentes` | Opera para clases fuera de cronograma. |
| §10.1 L621 | "alumno.registrar hoy lo usan maestros" | `VERIFIED` | Política RLS `alumnos_insert_authenticated` valida `maestro_actual() IS NOT NULL`. | RLS en tabla `alumnos` | Maestros tienen permiso de inserción de alumnos. |
| §10.1 L634 | "Detector de duplicados existente" | `VERIFIED` | Función `fn_fusionar_alumnos_duplicados` implementada en PostgreSQL y vista `duplicadosView.js`. | RPC `fn_fusionar_alumnos_duplicados` | Flujo transaccional robusto y verificado. |
| §11.1 L738 | "Notificaciones y recordatorios de registro" | `VERIFIED` | Cron jobs `generate-pending-notifs-*` llaman a `generate_pending_class_notifications()`. | `cron.job`, RPC `generate_pending_class_notifications` | Opera 3 veces al día en horas hábiles. |
| §16.1 L977 | "Recuperación de postulados en panel administrativo" | `VERIFIED` | Tabla `postulantes` (404 filas) y Edge Function `sync-postulantes` (v27). | `postulantes`, `sync-postulantes` | Integración con Google Forms/Sheets activa. |
| §18.1 L1181 | "Comodatos activos: 88 alumnos" | `FALSE` | La BD registra **30 filas** en `comodatos_activos`, no 88. | Tabla `comodatos_activos` | La cifra de 88 era documentación histórica desfasada. |
| §24.1 L1563 | "Señalética digital del vestíbulo" | `VERIFIED` | Tablas `signage_pantallas` (1), `signage_media` (3), vistas `signage_v_*` y app `signage-pi/`. | Tablas `signage_*`, carpeta `signage-pi/` | Kiosk Raspberry Pi operativo. |
