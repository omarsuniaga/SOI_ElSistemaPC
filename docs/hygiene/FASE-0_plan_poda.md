# FASE 0 · Plan de Poda y Deprecación de Tablas Vacías (Tarea 0.2)

**Auditora técnica:** Lila (Senior Technical Auditor & Architect)  
**Fecha:** 2026-09-08  
**Repositorio:** `SOI_ElSistemaPC` · Rama `claude/soi-empty-tables-inventory-07adbc`  
**Base de datos:** Supabase `SOI_DDBB_EL_SISTEMAPC` (`zmhmdvmyeyswunurcyow`)  
**Estado:** **PROPUESTA TÉCNICA BLOQUEADA HASTA OK HUMANO DE OMAR** (Cero DDL ejecutado)

---

## 1. Validación estricta del Gate de Conciliación Automática

Siguiendo el principio de **Fundamentos sobre Código** y la directiva explícita de Omar, se ejecutó una verificación matemática automatizada de cobertura biunívoca sobre el universo de tablas:

$$\text{Universo auditado: } 122 \text{ tablas} \iff \text{Decisiones registradas: } 122 \text{ decisiones}$$

```
=============================================================
             REPORTE DE CONCILIACIÓN DEL GATE
=============================================================
  Tablas vacías originales en inventario : 122
  Decisiones totales asignadas          : 122
  Tablas duplicadas                      : 0
  Tablas omitidas / no clasificadas      : 0
  -----------------------------------------------------------
  • TERMINAR / MANTENER Y BLINDAR        :  76 tablas (62.3%)
  • ARCHIVAR (Deprecación con COMMENT)   :  12 tablas ( 9.8%)
  • ELIMINAR (Poda controlada con DROP)  :  34 tablas (27.9%)
=============================================================
            GATE DE AUDITORÍA: APROBADO (100% COBERTURA)
=============================================================
```

> [!NOTE]
> **Aclaración sobre las discrepancias numéricas preliminares:**  
> 1. **Familia 3A (`acm_*`):** Se reportaron preliminarmente 6 tablas en el texto porque 4 entidades creadas en la misma migración de gobernanza (`acm_curriculum_versions`, `acm_evidence_files`, `teacher_class_sessions`, `teacher_session_indicators`) habían sido catalogadas como huérfanas puras por el grep. Al reconciliar bajo la decisión de Omar de **TERMINAR** la gobernanza curricular, se reintegran las 10 entidades del grafo de currículo bajo el mismo paraguas para preservar la integridad de sus claves foráneas.  
> 2. **Bloque 3I:** El reporte preliminar enumeraba pares funcionales (ej. `rutas_contenido y ruta_contenido_objetivos`). Al desagregar individualmente cada entidad relacional, el bloque contiene exactamente las 20 tablas desglosadas en las decisiones de Omar (18 a Terminar + 2 a Archivar).

---

## 2. Plan de Poda: Las 34 tablas a ELIMINAR

> [!IMPORTANT]
> **Requisitos previos mandatorios antes de ejecutar cualquier DROP:**
> 1. Respaldo previo de solo esquema: `pg_dump --schema-only --table=... > backup_poda_fase0.sql`
> 2. Confirmación humana explícita de Omar.
> 3. Ejecución en orden topológico estricto: **las tablas hijas (con dependencias entrantes) deben borrarse antes que sus tablas padre** para evitar errores de restricción de clave foránea (`foreign_key_violation`).

### Orden Topológico Seguro de Eliminación (1 a 34)

| Orden | Tabla a eliminar | Dueño | Justificación técnica de seguridad |
|:--:|---|:---:|---|
| **1** | `planificacion` | ACM | Gen-1 plano. Cero dependencias relacionales; reemplazada por Gen-2 (`routes`, `nodes`). |
| **2** | `planificacion_nodos` | ACM | Gen-1 plano. Residuo aislado de migración. Su FK reflexiva (`padre_id`) desaparece al caer. |
| **3** | `accesorio_asignaciones` | LUT | Huérfana pura sin filas ni dependencias activas. |
| **4** | `alumnos_ejercicios` | ACM | Prototipo de ejercicios sin uso en producción ni en vistas. |
| **5** | `alumnos_modulos` | ADM | Tabla huérfana sin referencias activas. |
| **6** | `alumnos_rutas` | ACM | Esquema anterior de asignación de rutas sin uso. |
| **7** | `asistencias_emergentes` | ACM | Creada para contingencias; sin filas ni consumidores en producción. |
| **8** | `audiciones` | ADM | El portal real usa la tabla `evaluations`. Esta tabla está huérfana. |
| **9** | `ausencias_clases_afectadas` | ACM | Esquema de ausencias no adoptado; el flujo real usa `ausencias` directa. |
| **10** | `ausencias_notificaciones` | ACM | Notificaciones de ausencias desacopladas; sin registros. |
| **11** | `autorizaciones_accesorio` | LUT | Prototipo de flujo de autorización en lutería sin uso. |
| **12** | `campana_participaciones` | COM | **Hija de `campanas_pago`**. Debe eliminarse ANTES de `campanas_pago`. |
| **13** | `campanas_pago` | FIN | **Padre de `campana_participaciones`**. Se elimina de forma segura tras el paso 12. |
| **14** | `campanias_destinatarios` | COM | **Hija de `campanias_marketing` e `instituciones`**. Debe eliminarse ANTES. |
| **15** | `campanias_marketing` | COM | **Padre de `campanias_destinatarios`**. Se elimina tras el paso 14. |
| **16** | `cierres_caja` | FIN | Solo constaba en un diccionario de metadatos estáticos; cero consultas en código. |
| **17** | `clase_acceso_temporal` | ACM | Permisos temporales sin cableado productivo. |
| **18** | `exoneraciones` | FIN | Prototipo financiero sin uso (el sistema real usa becas y exenciones directas). |
| **19** | `hermes_evaluaciones` | HERMES | Evaluación interna de agente Hermes no utilizada. |
| **20** | `hermes_feedback` | HERMES | **Hija de `hermes_acciones`**. Debe eliminarse ANTES de `hermes_acciones`. |
| **21** | `hermes_notificaciones` | HERMES | **Hija de `hermes_acciones`**. Debe eliminarse ANTES de `hermes_acciones`. |
| **22** | `instituciones` | COM | **Padre de `campanias_destinatarios`**. Se elimina tras el paso 14. |
| **23** | `intentos_ejercicios` | ACM | Prototipo gamificado de intentos huérfano. |
| **24** | `inventario_import_staging` | LUT | Tabla temporal de importación única ya concluida. |
| **25** | `mensajes_internos` | COM | **Hija de `hilos_mensajes`**. Debe eliminarse ANTES de `hilos_mensajes`. |
| **26** | `minutas` | DIR | Huérfana; la FK desde `tareas_institucionales` está vacía. |
| **27** | `prospeccion_log` | ADM | Log de prospección no implementado. |
| **28** | `repertoire_fragments` | ACM | Fragmentos de repertorio sin uso en frontend ni en portal docente. |
| **29** | `sesion_bitacora` | ACM | Prototipo temprano de bitácora; reemplazado por el diseño de `indicator_sessions`. |
| **30** | `tareas_portales` | INFRA | Prototipo de despacho entre portales huérfano. |
| **31** | `wallet_config` | FIN | Configuración financiera embebida directamente en código / constantes. |
| **32** | `xp_log` | ACM | Log de gamificación sin implementación productiva. |
| **33** | `hermes_acciones` | HERMES | **Padre de `hermes_feedback` y `hermes_notificaciones`**. Se elimina tras pasos 20 y 21. |
| **34** | `hilos_mensajes` | COM | **Padre de `mensajes_internos`**. Se elimina tras el paso 25. |

---

## 3. Plan de Deprecación: Las 12 tablas a ARCHIVAR

Estas tablas **NO se eliminan**. Se conservan en el esquema pero se marcan formalmente en el catálogo de PostgreSQL con un comentario de deprecación para evitar que nuevos desarrollos se acoplen a ellas:

| # | Tabla | Dueño | Razón de archivado / Visión | DDL de deprecación propuesto |
|:--:|---|:---:|---|---|
| 1 | `accesorios` | LUT | Concepto de valor futuro para lutería e inventario. | `COMMENT ON TABLE accesorios IS '-- DEPRECATED: conservada para rediseño de inventario lutería 2026-09';` |
| 2 | `schedule_runs` | ACM | Generación de horarios automatizada no prioritaria en este ciclo. | `COMMENT ON TABLE schedule_runs IS '-- DEPRECATED: motor algorítmico de horarios pausado 2026-09';` |
| 3 | `schedule_run_feedback` | ACM | Telemetría del motor de horarios pausada. | `COMMENT ON TABLE schedule_run_feedback IS '-- DEPRECATED: telemetría de horarios pausada 2026-09';` |
| 4 | `document_batches` | DIR/ADM | Emisión de constancias por lote no crítica para sinceramiento. | `COMMENT ON TABLE document_batches IS '-- DEPRECATED: generador documental diferido 2026-09';` |
| 5 | `generated_documents` | DIR/ADM | Archivo histórico documental diferido. | `COMMENT ON TABLE generated_documents IS '-- DEPRECATED: generador documental diferido 2026-09';` |
| 6 | `alumno_escolaridad` | DIR/ADM | Registro escolar documental secundario diferido. | `COMMENT ON TABLE alumno_escolaridad IS '-- DEPRECATED: datos escolares secundarios diferidos 2026-09';` |
| 7 | `catalogo_objetivos_especificos` | ACM | Plantilla curricular legacy; verificar desacople de RPCs. | `COMMENT ON TABLE catalogo_objetivos_especificos IS '-- DEPRECATED: plantilla curricular legacy en evaluación 2026-09';` |
| 8 | `clase_mapa_indicadores` | ACM | Jerarquía curricular legacy en BD; verificar reemplazo Gen-2. | `COMMENT ON TABLE clase_mapa_indicadores IS '-- DEPRECATED: jerarquía legacy en evaluación 2026-09';` |
| 9 | `clase_mapa_objetivos` | ACM | Objetivos jerárquicos legacy en BD; verificar reemplazo Gen-2. | `COMMENT ON TABLE clase_mapa_objetivos IS '-- DEPRECATED: objetivos legacy en evaluación 2026-09';` |
| 10 | `mapa_plantillas` | ACM | Plantillas curriculares legacy en BD; verificar reemplazo Gen-2. | `COMMENT ON TABLE mapa_plantillas IS '-- DEPRECATED: plantillas legacy en evaluación 2026-09';` |
| 11 | `rachas` | ACM | Gamificación académica reservada para fases futuras. | `COMMENT ON TABLE rachas IS '-- DEPRECATED: gamificación pedagógica en pausa 2026-09';` |
| 12 | `protocolos` | DIR/HERMES | Infraestructura de protocolos reservada para orquestación Hermes. | `COMMENT ON TABLE protocolos IS '-- DEPRECATED: infraestructura base para Hermes en reserva 2026-09';` |

---

## 4. Las 76 tablas a TERMINAR / MANTENER Y BLINDAR

Estas tablas representan capacidades estratégicas y operativas del SOI. **Quedan terminantemente excluidas de cualquier script de eliminación**:

### 4.1 Operación Activa en Producción (33 tablas blindadas)
- **Finanzas:** `gastos_fijos_pagos`, `patrocinantes`, `patrocinios`, `wallet_movimientos`, `fin_service_balance_snapshots`, `fin_service_refresh_runs`, `fin_service_refresh_state`, `service_accounts`, `service_account_observations`.
- **Ausentismo y Disciplina:** `alumno_suspensiones`, `retenciones_instrumento`, `seguimiento_ausencias_reinicio`, `ausencias`, `ausencias_auditoria`.
- **Admisiones y WhatsApp:** `applicants`, `appointments`, `applicant_events`, `telegram_messages_raw`, `campania_envios`, `campanias_periodo`, `whatsapp_optout`, `whatsapp_consentimientos`.
- **Docencia y Calendario:** `calendario`, `tareas_calendario`, `tarea_logs`, `usuario_departamentos`, `horarios`, `clases_emergentes`, `maestro_access_credentials`, `maestro_retiros`, `asistencia_maestros`, `observaciones_alumnos`, `alumnos_logros`.

### 4.2 Gobernanza Curricular y Docencia (14 tablas a Terminar)
- `academic_plans`, `acm_active_routes`, `acm_curriculum_sources`, `acm_curriculum_versions`, `acm_evidence_files`, `acm_teacher_week_adjustments`, `acm_weekly_plan_items`, `acm_weekly_plans`, `teacher_class_sessions`, `teacher_session_indicators`.
- `class_events`, `class_event_methodology`, `homework_assignments`, `class_session_content_snapshots`.

### 4.3 Taller de Lutería y Costos de Instrumentos (8 tablas a Terminar)
- `lut_diagnosticos`, `lut_evidencias`, `lut_insumos`, `lut_movimientos_insumos`, `lut_presupuestos`, `lut_solicitudes_compra`.
- `inventario_reparaciones`, `facturas_reparacion`.

### 4.4 Bitácora Pedagógica y Seguimiento de Alumnos (21 tablas a Terminar de Bloque 3I)
- `indicator_sessions`, `indicator_session_students`, `student_indicator_progress`.
- `alumno_plan_entradas`, `cobertura_alumno_objetivo`, `contenidos_sesion`, `node_resources`, `rutas_contenido`, `ruta_contenido_objetivos`, `planning_documents`, `planned_content`, `evaluations`, `notificaciones_asistencia`, `maestro_tareas`, `student_case_actions`, `score_compromiso`, `compromisos_pago`, `notificaciones_caja`, `alumnos_reinscripciones`, `alertas_log`, `tareas_caja`.

---

## 5. Próximo paso y control humano

El inventario verificado y completado con `decision` y `owner` reside en:
- [`docs/hygiene/FASE-0_inventario_decidido.csv`](./FASE-0_inventario_decidido.csv)

**Ninguna modificación destructiva ha sido ejecutada en la base de datos.**  
Una vez que Omar dé el **OK formal** a este plan de poda, se generarán los dos scripts SQL versionados en `supabase/migrations/`:
1. `supabase/migrations/<fecha>_fase0_poda_DROP.sql` (las 34 tablas en orden topológico con checklist de seguridad).
2. `supabase/migrations/<fecha>_fase0_poda_DEPRECATE.sql` (los 12 comentarios de deprecación).
