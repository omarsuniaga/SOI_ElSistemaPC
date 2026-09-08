# FASE 0 · Plan Definitivo de Poda y Deprecación de Tablas Vacías (Tarea 0.2)

**Auditora técnica:** Lila (Senior Technical Auditor & Architect)  
**Fecha:** 2026-09-08  
**Repositorio:** `SOI_ElSistemaPC` · Rama `claude/soi-empty-tables-inventory-07adbc`  
**Base de datos:** Supabase `SOI_DDBB_EL_SISTEMAPC` (`zmhmdvmyeyswunurcyow`)  
**Estado:** **PLAN RECONCILIADO DEFINITIVO · CERO DDL EJECUTADO · EN ESPERA DE OK FINAL DE OMAR**

---

## 1. Validación Estricta del Gate de Conciliación (122 = 76 + 13 + 33)

Tras incorporar la **Opción B** para la tabla `minutas` (preservada para proteger la integridad referencial de `tareas_institucionales`), la distribución exacta del universo auditado es:

$$\mathbf{122\text{ tablas originales}} = \mathbf{76\text{ Protegidas}} + \mathbf{13\text{ Archivadas}} + \mathbf{33\text{ Eliminables}} \quad (\mathbf{0\text{ duplicadas}}, \mathbf{0\text{ omitidas}})$$

```
=============================================================
             REPORTE DE CONCILIACIÓN DEFINITIVO
=============================================================
  Tablas vacías originales en inventario : 122
  Decisiones totales asignadas          : 122
  Tablas duplicadas                      : 0
  Tablas omitidas / no clasificadas      : 0
  -----------------------------------------------------------
  • TERMINAR / MANTENER Y BLINDAR        :  76 tablas (62.3%)
  • ARCHIVAR (Deprecación con COMMENT)   :  13 tablas (10.7%)
  • ELIMINAR (Poda controlada sin CASCADE:  33 tablas (27.0%)
=============================================================
            GATE DE AUDITORÍA: APROBADO (100% COBERTURA)
=============================================================
```

---

## 2. Plan de Poda Definitivo: Las 33 Tablas a ELIMINAR (Orden Topológico 1 a 33)

> [!IMPORTANT]
> **Garantías de seguridad aplicadas:**
> 1. Cero uso de `CASCADE`. Cada tabla se elimina de forma aislada.
> 2. Las tablas hijas se eliminan estrictamente antes que las tablas padre.
> 3. Bloque transaccional con aserciones defensivas: si una sola tabla tiene `count(*) > 0` o vistas dependientes, la poda se aborta automáticamente.

| Orden | Tabla a eliminar | Dueño | Justificación técnica de seguridad |
|:--:|---|:---:|---|
| **1** | `planificacion` | ACM | Gen-1 plano legacy. Cero dependencias vivas; reemplazada por Gen-2 (`routes`, `nodes`). |
| **2** | `planificacion_nodos` | ACM | Gen-1 plano legacy. Residuo aislado de migración/test. |
| **3** | `accesorio_asignaciones` | LUT | Huérfana pura sin filas ni dependencias activas. |
| **4** | `alumnos_ejercicios` | ACM | Prototipo gamificado sin uso en frontend ni en vistas. |
| **5** | `alumnos_modulos` | ADM | Tabla huérfana de módulos de alumno sin uso. |
| **6** | `alumnos_rutas` | ACM | Asignación legacy de rutas sin uso productivo. |
| **7** | `asistencias_emergentes` | ACM | Creada para contingencias; sin filas ni consumidores. |
| **8** | `audiciones` | ADM | El portal real usa la tabla `evaluations`. Esta tabla relacional está huérfana. |
| **9** | `ausencias_clases_afectadas` | ACM | Esquema no adoptado; el flujo real usa `ausencias` directa. |
| **10** | `ausencias_notificaciones` | ACM | Notificaciones de ausencias desacopladas; sin registros. |
| **11** | `autorizaciones_accesorio` | LUT | Prototipo de flujo de autorización en lutería sin uso. |
| **12** | `campana_participaciones` | COM | **Hija de `campanas_pago`**. Se elimina ANTES que su padre. |
| **13** | `campanas_pago` | FIN | **Padre de `campana_participaciones`**. Se elimina tras el paso 12. |
| **14** | `campanias_destinatarios` | COM | **Hija de `campanias_marketing` e `instituciones`**. Se elimina ANTES. |
| **15** | `campanias_marketing` | COM | **Padre de `campanias_destinatarios`**. Se elimina tras el paso 14. |
| **16** | `cierres_caja` | FIN | Solo constaba en un array de metadatos estáticos; cero consultas en código. |
| **17** | `clase_acceso_temporal` | ACM | Permisos temporales sin cableado productivo. |
| **18** | `exoneraciones` | FIN | Prototipo financiero sin uso (el sistema real usa becas y exenciones directas). |
| **19** | `hermes_evaluaciones` | HERMES | Evaluación interna de agente Hermes no utilizada. |
| **20** | `hermes_feedback` | HERMES | **Hija de `hermes_acciones`**. Se elimina ANTES que su padre. |
| **21** | `hermes_notificaciones` | HERMES | **Hija de `hermes_acciones`**. Se elimina ANTES que su padre. |
| **22** | `instituciones` | COM | **Padre de `campanias_destinatarios`**. Se elimina tras el paso 14. |
| **23** | `intentos_ejercicios` | ACM | Prototipo de intentos de ejercicios huérfano. |
| **24** | `inventario_import_staging` | LUT | Tabla temporal de importación inicial ya concluida. |
| **25** | `mensajes_internos` | COM | **Hija de `hilos_mensajes`**. Se elimina ANTES que su padre. |
| **26** | `prospeccion_log` | ADM | Log de prospección no implementado. |
| **27** | `repertoire_fragments` | ACM | Fragmentos de repertorio sin uso en frontend ni en portal docente. |
| **28** | `sesion_bitacora` | ACM | Prototipo temprano de bitácora; sustituido por el diseño de `indicator_sessions`. |
| **29** | `tareas_portales` | INFRA | Prototipo de despacho entre portales huérfano. |
| **30** | `wallet_config` | FIN | Configuración financiera embebida directamente en código y constantes. |
| **31** | `xp_log` | ACM | Log de gamificación sin implementación productiva. |
| **32** | `hermes_acciones` | HERMES | **Padre de `hermes_feedback` y `hermes_notificaciones`**. Se elimina tras pasos 20 y 21. |
| **33** | `hilos_mensajes` | COM | **Padre de `mensajes_internos`**. Se elimina tras el paso 25. |

---

## 3. Plan de Deprecación: Las 13 Tablas a ARCHIVAR

| # | Tabla | Dueño | Razón estratégica | DDL de deprecación propuesto |
|:--:|---|:---:|---|---|
| 1 | `accesorios` | LUT | Valor futuro para inventario y taller. | `COMMENT ON TABLE accesorios IS '-- DEPRECATED: conservada para rediseño de inventario lutería 2026-09';` |
| 2 | `schedule_runs` | ACM | Motor algorítmico de horarios pausado. | `COMMENT ON TABLE schedule_runs IS '-- DEPRECATED: motor algorítmico de horarios pausado 2026-09';` |
| 3 | `schedule_run_feedback` | ACM | Telemetría del generador de horarios. | `COMMENT ON TABLE schedule_run_feedback IS '-- DEPRECATED: telemetría de horarios pausada 2026-09';` |
| 4 | `document_batches` | DIR/ADM | Emisión por lotes diferida; no crítica. | `COMMENT ON TABLE document_batches IS '-- DEPRECATED: generador documental diferido 2026-09';` |
| 5 | `generated_documents` | DIR/ADM | Archivo histórico documental diferido. | `COMMENT ON TABLE generated_documents IS '-- DEPRECATED: generador documental diferido 2026-09';` |
| 6 | `alumno_escolaridad` | DIR/ADM | Datos escolares secundarios diferidos. | `COMMENT ON TABLE alumno_escolaridad IS '-- DEPRECATED: datos escolares secundarios diferidos 2026-09';` |
| 7 | `catalogo_objetivos_especificos` | ACM | Plantilla curricular legacy en evaluación. | `COMMENT ON TABLE catalogo_objetivos_especificos IS '-- DEPRECATED: plantilla curricular legacy en evaluación 2026-09';` |
| 8 | `clase_mapa_indicadores` | ACM | Jerarquía curricular legacy en BD. | `COMMENT ON TABLE clase_mapa_indicadores IS '-- DEPRECATED: jerarquía legacy en evaluación 2026-09';` |
| 9 | `clase_mapa_objetivos` | ACM | Objetivos jerárquicos legacy en BD. | `COMMENT ON TABLE clase_mapa_objetivos IS '-- DEPRECATED: objetivos legacy en evaluación 2026-09';` |
| 10 | `mapa_plantillas` | ACM | Plantillas curriculares legacy en BD. | `COMMENT ON TABLE mapa_plantillas IS '-- DEPRECATED: plantillas legacy en evaluación 2026-09';` |
| 11 | `rachas` | ACM | Gamificación pedagógica en reserva. | `COMMENT ON TABLE rachas IS '-- DEPRECATED: gamificación pedagógica en pausa 2026-09';` |
| 12 | `protocolos` | DIR/HERMES | Infraestructura base reservada para Hermes. | `COMMENT ON TABLE protocolos IS '-- DEPRECATED: infraestructura base para Hermes en reserva 2026-09';` |
| 13 | `minutas` | DIR | Conservada por FK entrante activa desde `tareas_institucionales`. | `COMMENT ON TABLE minutas IS '-- DEPRECATED: conservada por integridad referencial desde tareas_institucionales 2026-09';` |

---

## 4. Las 76 Tablas a TERMINAR / MANTENER Y BLINDAR

Están 100% blindadas y fuera de cualquier script destructivo:
- **Operación Activa en Producción (33 tablas):** Finanzas, Ausentismo 2026-09-04, Admisiones, WhatsApp, Tareas de Calendario, Reportes Académicos.
- **Gobernanza Curricular y Docencia (14 tablas):** Familia `acm_*`, `academic_plans`, `class_events`, etc.
- **Taller de Lutería y Reparaciones (8 tablas):** Familia `lut_*`, `inventario_reparaciones`, `facturas_reparacion`.
- **Bitácora y Seguimiento de Alumnos (21 tablas del Bloque 3I):** `indicator_sessions`, `student_case_actions`, `score_compromiso`, etc.

---

## 5. Artefactos Entregados

1. [`docs/hygiene/FASE-0_dry_run_reporte_impacto.md`](./FASE-0_dry_run_reporte_impacto.md)
2. [`docs/hygiene/FASE-0_inventario_decidido.csv`](./FASE-0_inventario_decidido.csv)
3. [`supabase/migrations/20260908140000_fase0_poda_DEPRECATE.sql`](../../supabase/migrations/20260908140000_fase0_poda_DEPRECATE.sql)
4. [`supabase/migrations/20260908141000_fase0_poda_DROP.sql`](../../supabase/migrations/20260908141000_fase0_poda_DROP.sql)
5. [`supabase/migrations/20260908142000_fase0_poda_ROLLBACK.sql`](../../supabase/migrations/20260908142000_fase0_poda_ROLLBACK.sql)
6. [`supabase/backups/20260908_backup_pre_poda_33tablas.sql`](../../supabase/backups/20260908_backup_pre_poda_33tablas.sql)
