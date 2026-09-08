# FASE 0 · Reporte de Impacto y Dry-Run de Poda (Tarea 0.2)

**Auditora técnica:** Lila (Senior Technical Auditor & Architect)  
**Fecha del Snapshot en vivo:** 2026-09-08  
**Base de datos verificada:** Supabase `SOI_DDBB_EL_SISTEMAPC` (`zmhmdvmyeyswunurcyow`) — consulta en vivo solo lectura  
**Estado:** **DRY-RUN CONCLUIDO · CERO DDL EJECUTADO · EN ESPERA DE AUTORIZACIÓN FINAL**

---

## 1. Resumen Ejecutivo del Dry-Run

En cumplimiento estricto de las directivas de Omar para la Tarea 0.2, se ejecutó una simulación en vivo (**dry-run**) contra el catálogo y estado físico de la base de datos de producción (modo solo lectura), verificando el comportamiento de las **34 tablas candidatas a eliminación**.

```
========================================================================
                  RESULTADO CONSOLIDADO DEL DRY-RUN
========================================================================
  Tablas evaluadas para poda           : 34
  Tablas confirmadas con 0 filas hoy   : 34 / 34 (100% vacías en vivo)
  Tablas con cero vistas dependientes  : 34 / 34 (0 vistas afectadas)
  Dependencias FK internas (del lote)  :  7 restricciones (resueltas por orden)
  Dependencias FK externas (fuera lote):  1 caso detectado ('minutas')
  Precondiciones automáticas superadas : 33 / 34 (1 escalada por Regla 4)
  Tablas protegidas (76) alteradas     : 0 (100% blindadas)
  Tablas archivadas (12) alteradas     : 0 (100% preservadas)
========================================================================
```

---

## 2. Auditoría en Vivo de las 34 Tablas (Orden Topológico 1 a 34)

La siguiente tabla refleja el estado físico de la base de datos obtenido en tiempo real al 2026-09-08:

| # | Tabla | Dueño | Filas en vivo | Vistas dependientes | FKs entrantes internas | FKs externas | Estado Precondición |
|:--:|---|:---:|:---:|:---:|---|---|:---:|
| **1** | `planificacion` | ACM | **0** | Ninguna | Ninguna | Ninguna | ✅ **PASÓ** |
| **2** | `planificacion_nodos` | ACM | **0** | Ninguna | `planificacion_nodos.padre_id` (auto) | Ninguna | ✅ **PASÓ** |
| **3** | `accesorio_asignaciones` | LUT | **0** | Ninguna | Ninguna | Ninguna | ✅ **PASÓ** |
| **4** | `alumnos_ejercicios` | ACM | **0** | Ninguna | Ninguna | Ninguna | ✅ **PASÓ** |
| **5** | `alumnos_modulos` | ADM | **0** | Ninguna | Ninguna | Ninguna | ✅ **PASÓ** |
| **6** | `alumnos_rutas` | ACM | **0** | Ninguna | Ninguna | Ninguna | ✅ **PASÓ** |
| **7** | `asistencias_emergentes` | ACM | **0** | Ninguna | Ninguna | Ninguna | ✅ **PASÓ** |
| **8** | `audiciones` | ADM | **0** | Ninguna | Ninguna | Ninguna | ✅ **PASÓ** |
| **9** | `ausencias_clases_afectadas` | ACM | **0** | Ninguna | Ninguna | Ninguna | ✅ **PASÓ** |
| **10** | `ausencias_notificaciones` | ACM | **0** | Ninguna | Ninguna | Ninguna | ✅ **PASÓ** |
| **11** | `autorizaciones_accesorio` | LUT | **0** | Ninguna | Ninguna | Ninguna | ✅ **PASÓ** |
| **12** | `campana_participaciones` | COM | **0** | Ninguna | Ninguna | Ninguna | ✅ **PASÓ** |
| **13** | `campanas_pago` | FIN | **0** | Ninguna | `campana_participaciones.campana_id` | Ninguna | ✅ **PASÓ** |
| **14** | `campanias_destinatarios` | COM | **0** | Ninguna | Ninguna | Ninguna | ✅ **PASÓ** |
| **15** | `campanias_marketing` | COM | **0** | Ninguna | `campanias_destinatarios.campania_id` | Ninguna | ✅ **PASÓ** |
| **16** | `cierres_caja` | FIN | **0** | Ninguna | Ninguna | Ninguna | ✅ **PASÓ** |
| **17** | `clase_acceso_temporal` | ACM | **0** | Ninguna | Ninguna | Ninguna | ✅ **PASÓ** |
| **18** | `exoneraciones` | FIN | **0** | Ninguna | Ninguna | Ninguna | ✅ **PASÓ** |
| **19** | `hermes_evaluaciones` | HERMES | **0** | Ninguna | Ninguna | Ninguna | ✅ **PASÓ** |
| **20** | `hermes_feedback` | HERMES | **0** | Ninguna | Ninguna | Ninguna | ✅ **PASÓ** |
| **21** | `hermes_notificaciones` | HERMES | **0** | Ninguna | Ninguna | Ninguna | ✅ **PASÓ** |
| **22** | `instituciones` | COM | **0** | Ninguna | `campanias_destinatarios.institucion_id` | Ninguna | ✅ **PASÓ** |
| **23** | `intentos_ejercicios` | ACM | **0** | Ninguna | Ninguna | Ninguna | ✅ **PASÓ** |
| **24** | `inventario_import_staging` | LUT | **0** | Ninguna | Ninguna | Ninguna | ✅ **PASÓ** |
| **25** | `mensajes_internos` | COM | **0** | Ninguna | Ninguna | Ninguna | ✅ **PASÓ** |
| **26** | `minutas` | DIR | **0** | Ninguna | Ninguna | `tareas_institucionales.minuta_id` | ⚠️ **ESCALADA** |
| **27** | `prospeccion_log` | ADM | **0** | Ninguna | Ninguna | Ninguna | ✅ **PASÓ** |
| **28** | `repertoire_fragments` | ACM | **0** | Ninguna | Ninguna | Ninguna | ✅ **PASÓ** |
| **29** | `sesion_bitacora` | ACM | **0** | Ninguna | Ninguna | Ninguna | ✅ **PASÓ** |
| **30** | `tareas_portales` | INFRA | **0** | Ninguna | Ninguna | Ninguna | ✅ **PASÓ** |
| **31** | `wallet_config` | FIN | **0** | Ninguna | Ninguna | Ninguna | ✅ **PASÓ** |
| **32** | `xp_log` | ACM | **0** | Ninguna | Ninguna | Ninguna | ✅ **PASÓ** |
| **33** | `hermes_acciones` | HERMES | **0** | Ninguna | `hermes_feedback`, `hermes_notificaciones` | Ninguna | ✅ **PASÓ** |
| **34** | `hilos_mensajes` | COM | **0** | Ninguna | `mensajes_internos.hilo_id` | Ninguna | ✅ **PASÓ** |

---

## 3. Escalamiento Preventivo: El caso de `minutas` (Regla 4 de Omar)

> [!WARNING]
> **Detalle del hallazgo:** La tabla `minutas` (paso 26) tiene **0 filas** y ninguna vista dependiente. Sin embargo, la tabla activa `tareas_institucionales` (que tiene **198 filas**) posee la clave foránea `tareas_institucionales_minuta_id_fkey`.  
> Aunque los 198 registros tienen `minuta_id = NULL` (cero registros apuntan a datos), la existencia de la restricción en una tabla externa protegida impediría ejecutar `DROP TABLE minutas;` sin utilizar `CASCADE`.

### Opciones para Omar sobre `minutas`:
1. **Opción A (Recomendada en el script):** El script de poda incluye una sentencia defensiva que verifica que `minuta_id` sea 100% nulo en `tareas_institucionales` y suelta únicamente la restricción huérfana (`ALTER TABLE tareas_institucionales DROP CONSTRAINT tareas_institucionales_minuta_id_fkey;`), procediendo luego al DROP limpio de `minutas`.
2. **Opción B (Conservadora):** Retirar `minutas` de la lista de eliminación y moverla a **ARCHIVAR**, dejando exactamente **33 tablas a eliminar**.

---

## 4. Mecanismos de Respaldo y Rollback

### 4.1 Respaldo Previo (Pre-requisito de ejecución)
Antes de ejecutar el script en Supabase, se debe generar un snapshot exclusivo de la estructura de las 34 tablas mediante la CLI:
```bash
# Comando de respaldo en frío del esquema de las tablas a podar
supabase db dump --schema-only -f supabase/backups/20260908_backup_pre_poda_34tablas.sql
```

### 4.2 Script de Rollback Inmediato y Atómico
Se generó el artefacto versionado:  
[`supabase/migrations/20260908142000_fase0_poda_ROLLBACK.sql`](file:///C:/Users/omare/dev/SOI_ElSistemaPC/.claude/worktrees/soi-empty-tables-inventory-07adbc/supabase/migrations/20260908142000_fase0_poda_ROLLBACK.sql)

- Contiene las sentencias `CREATE TABLE IF NOT EXISTS` exactas para las 34 tablas, restaurando sus **387 columnas**, tipos de datos de PostgreSQL (`uuid`, `timestamptz`, `text`, etc.), valores por defecto y sus **34 primary keys**.
- Se ejecuta en orden inverso (padres antes que hijos) dentro de una transacción atómica (`BEGIN...COMMIT`).

---

## 5. Garantía de Blindaje de Tablas Protegidas y Archivadas

| Conjunto | Conteo | Impacto del Script de Poda | Garantía Técnica |
|---|--:|---|---|
| **Tablas TERMINAR / MANTENER** | **76** | **CERO IMPACTO** | No figuran en el script. Ninguna de las 34 tablas a podar tiene FKs salientes ni vistas que apunten hacia las tablas protegidas. |
| **Tablas ARCHIVAR** | **12** | **CERO IMPACTO ESTRUCTURAL** | Reciben únicamente su metadato de documentación en [`20260908140000_fase0_poda_DEPRECATE.sql`](file:///C:/Users/omare/dev/SOI_ElSistemaPC/.claude/worktrees/soi-empty-tables-inventory-07adbc/supabase/migrations/20260908140000_fase0_poda_DEPRECATE.sql). Sus columnas, constraints y datos permanecen 100% inalterados. |

---

## 6. Estado del Paquete y Próximo Paso

Los artefactos requeridos están preparados y comiteados en el repositorio:
1. [`supabase/migrations/20260908140000_fase0_poda_DEPRECATE.sql`](file:///C:/Users/omare/dev/SOI_ElSistemaPC/.claude/worktrees/soi-empty-tables-inventory-07adbc/supabase/migrations/20260908140000_fase0_poda_DEPRECATE.sql) (Archivado)
2. [`supabase/migrations/20260908141000_fase0_poda_DROP.sql`](file:///C:/Users/omare/dev/SOI_ElSistemaPC/.claude/worktrees/soi-empty-tables-inventory-07adbc/supabase/migrations/20260908141000_fase0_poda_DROP.sql) (Poda con precondiciones sin CASCADE)
3. [`supabase/migrations/20260908142000_fase0_poda_ROLLBACK.sql`](file:///C:/Users/omare/dev/SOI_ElSistemaPC/.claude/worktrees/soi-empty-tables-inventory-07adbc/supabase/migrations/20260908142000_fase0_poda_ROLLBACK.sql) (Rollback determinístico)
4. [`docs/hygiene/FASE-0_dry_run_reporte_impacto.md`](file:///C:/Users/omare/dev/SOI_ElSistemaPC/.claude/worktrees/soi-empty-tables-inventory-07adbc/docs/hygiene/FASE-0_dry_run_reporte_impacto.md) (Este reporte)

> **Lila se detiene aquí.** No se ha corrido ni se correrá ninguna mutación destructiva en Supabase hasta que Omar revise este reporte y dé su **OK final de ejecución**.
