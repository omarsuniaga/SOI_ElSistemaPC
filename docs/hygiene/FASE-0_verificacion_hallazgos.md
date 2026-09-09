# FASE 0 · Verificación exhaustiva del inventario de tablas vacías (Tarea 0.1)

**Auditora técnica:** Lila (Senior Technical Auditor & Architect)  
**Fecha:** 2026-09-08  
**Repositorio:** `SOI_ElSistemaPC` · Rama `claude/soi-empty-tables-inventory-07adbc`  
**Base de datos:** Supabase `SOI_DDBB_EL_SISTEMAPC` (ref `zmhmdvmyeyswunurcyow`) — modo solo lectura  
**Artefacto fuente verificado:** [`docs/hygiene/FASE-0_inventario_verificado.csv`](./FASE-0_inventario_verificado.csv) (122 filas)

---

## 1. Resumen ejecutivo y distribución de veredictos

El inventario preliminar de Claude Code identificó correctamente el universo de **122 tablas con 0 filas** en PostgreSQL, pero su clasificación de "uso en código" adolecía de dos limitaciones críticas:
1. **Truncamiento a 3 archivos**, ocultando dependencias en servicios secundarios, vistas y edge functions.
2. **Ceguera de dependencias en base de datos**: evaluó únicamente coincidencias textuales de código fuente sin inspeccionar el catálogo de PostgreSQL (`pg_views`, `pg_proc`, `pg_trigger`, `pg_policies`, ni foreign keys entrantes `fk_in`).

Tras una inspección exhaustiva de **2.476 archivos del repositorio** (descartando artefactos autogenerados) combinada con una auditoría relacional completa del catálogo de PostgreSQL, la distribución real de las 122 tablas es la siguiente:

| Veredicto de uso | Conteo verificado | % del universo | Definición operativa |
|---|--:|--:|---|
| **ACTIVA** | **33** | 27.0% | Código PROD (servicios, portales, Edge Functions o RPCs en producción) ejecuta queries contra la tabla o la requiere operativamente en caliente. |
| **CABLEADA-SIN-DATOS** | **50** | 41.0% | Módulos o servicios implementados formalmente (código PROD o RPCs/vistas de BD existentes), pero la funcionalidad está pausada, a medio rollout o nunca se pobló con registros. |
| **SOLO-MOCK** | **3** | 2.5% | Únicamente nombrada y utilizada por archivos mock (`*Mock.js`, `assets/data/mocks/`) o tests unitarios; sin uso en código PROD. |
| **HUÉRFANA** | **36** | 29.5% | Sin ninguna referencia en código productivo, mocks, tests, vistas ni funciones de base de datos fuera de sus DDL de migración/tipos. |
| **TOTAL** | **122** | **100.0%** | Universo auditado con rigor técnico sin atajos. |

### Comparativa: Inventario inicial vs. Verificación auditada

| Categoría preliminar (Claude Code) | Conteo inicial | Veredicto real auditado (Lila) | Conteo real | Delta / Explicación |
|---|--:|---|--:|---|
| `referenciada` | 68 | ACTIVA / CABLEADA / SOLO-MOCK / HUÉRFANA | 33 ACT / 42 CAB / 2 MOCK / 2 HUER | Múltiples falsos positivos por nombres de rutas/módulos (`audiciones`, `planificacion`, `cierres_caja`). |
| `solo autogen` | 51 | CABLEADA / ACTIVA / HUÉRFANA | 10 ACT / 7 CAB / 34 HUER | **17 tablas** marcadas como "solo autogen" están en realidad cableadas o activas vía RPCs y vistas. |
| `sin referencia` | 3 | ACTIVA / CABLEADA | 2 ACT / 1 CAB / 0 HUER | **3 de 3 eran falsos negativos graves** (`service_account_observations`, `maestro_retiros`, `alumnos_reinscripciones`). |

---

## 2. Hallazgos críticos y regresiones evitadas

> [!CAUTION]
> **Peligro de regresión estructural evitado:** El inventario preliminar señaló 3 tablas como *"sin referencia en todo el código: candidatas fuertes a Eliminar"* y 51 como *"solo autogen"*. De haberse aplicado un `DROP TABLE` basándose en ese reporte preliminar, se habrían roto de inmediato vistas y procedimientos almacenados actualmente en producción.

### Las 3 tablas "sin referencia" que en realidad están vivas:
1. **`service_account_observations`** (marcada *"sin referencia"*):
   - **Realidad:** Es leída por el RPC `fn_fin_service_dashboard()`, el cual es invocado directamente por `SupabaseServiceBalancesRepository.ts` (línea 55) en el portal de Finanzas para renderizar los balances de cuentas de servicio en el panel *Mi Día*. Además, posee una FK entrante desde `service_accounts.id`.
   - **Impacto de eliminación:** Error 500 / fallo de RPC en la pantalla principal de Finanzas.
2. **`maestro_retiros`** (marcada *"sin referencia"*):
   - **Realidad:** Es manipulada directamente por los procedimientos almacenados `retirar_maestro_seguro` y `eliminar_maestro_limpio`, ambos llamados activamente desde `src/modules/maestros/api/maestrosApi.js`.
   - **Impacto de eliminación:** Ruptura del flujo administrativo de baja y saneamiento de credenciales docentes.
3. **`alumnos_reinscripciones`** (marcada *"sin referencia"*):
   - **Realidad:** Es referenciada internamente por la función de PostgreSQL `fn_reactivar_alumno`.
   - **Impacto de eliminación:** Falla en la ejecución del procedimiento de reactivación de matrícula de alumnos.

### Tablas marcadas "solo autogen" que están activas o cableadas en BD:
- **`score_compromiso`**: Utilizada por **tres vistas activas** de base de datos (`vw_estado_familiar`, `vw_mora_activa`, `vw_score_representantes`) y por la función `fn_calcular_score_representante`. Las vistas `vw_mora_activa` y `vw_estado_familiar` son consultadas activamente por el portal de Finanzas.
- **`calendario`**, **`tareas_calendario`**, **`tarea_logs`**, **`usuario_departamentos`**: Operadas de forma centralizada por las funciones RPC `fn_crear_evento_calendario`, `fn_obtener_tareas_departamento` y `fn_actualizar_tarea` invocadas desde `src/modules/calendario/api/calendarApi.js`. Adicionalmente, `usuario_departamentos` actúa como guardián en las políticas de seguridad RLS de `calendario` y `tareas_calendario`.
- **`campania_envios`** y **`whatsapp_consentimientos`**: Operadas por las funciones `fn_encolar_campania`, `fn_activar_campania` (llamadas desde `src/modules/campanias/api/campaniasApi.js`) y `fn_whatsapp_reclamar_pendientes` (ejecutada periódicamente por la Edge Function `whatsapp-dispatcher`).
- **`asistencia_maestros`**: Operada por los RPCs `eliminar_maestro_limpio` (en `maestrosApi.js`) y `fn_reporte_indicadores_adicionales` (en `reporteCierreApi.js`).
- **`alumnos_logros`**: Consultada por el RPC `get_informe_academico_semestral` utilizado en `academicReportsApi.js` y `reporteSemestralView.js`.
- **`patrocinantes`**: Consultada directamente vía REST (`supabaseRest('patrocinantes?select=*')`) en el contexto central de Finanzas (`FinanceContext.tsx`).

---

## 3. Lista exhaustiva de las 23 tablas que cambiaron de clasificación

A continuación se detalla cada una de las 23 tablas cuya clasificación fue corregida respecto al informe preliminar, junto con la evidencia técnica irrebatible del cambio:

| # | Tabla | Clasificación preliminar | Veredicto verificado | Archivo clave / Evidencia técnica | Razón técnica del cambio |
|---|---|---|---|---|---|
| 1 | `accesorios` | referenciada | **SOLO-MOCK** | `src/modules/luteria-taller/api/luteriaTallerMock.js` | En código solo la consume el mock de lutería; en BD tiene la vista `vw_stock_bajo`, pero ninguna vista ni código la consulta. |
| 2 | `alertas_log` | solo autogen | **CABLEADA-SIN-DATOS** | RPC `fn_registrar_alerta_enviada` | Procedimiento en BD implementado para auditoría de alertas; sin llamadas directas desde la UI. |
| 3 | `alumnos_logros` | solo autogen | **ACTIVA** | `src/modules/admin-dashboard/api/academicReportsApi.js` | Consultada por el RPC activo `get_informe_academico_semestral` en reportes semestrales y dashboard. |
| 4 | `alumnos_reinscripciones` | sin referencia | **CABLEADA-SIN-DATOS** | RPC `fn_reactivar_alumno` | Procedimiento almacenado en BD la utiliza para registrar reinscripciones al reactivar alumnos. |
| 5 | `asistencia_maestros` | solo autogen | **ACTIVA** | `src/modules/maestros/api/maestrosApi.js` | Operada por RPCs `retirar_maestro_seguro` y `eliminar_maestro_limpio` en `maestrosApi.js` y cierre de semestre. |
| 6 | `audiciones` | referenciada | **HUÉRFANA** | `audiciones.html` | Los hits preliminares correspondían al ID de ruta/portal (`audiciones-entry`), no a la tabla relacional `audiciones`. |
| 7 | `campania_envios` | solo autogen | **ACTIVA** | `src/modules/campanias/api/campaniasApi.js` | Operada por RPCs `fn_encolar_campania`, `fn_activar_campania` y webhook de WhatsApp. |
| 8 | `catalogo_objetivos_especificos` | solo autogen | **CABLEADA-SIN-DATOS** | RPC `clonar_catalogo_a_clase` | Esquema curricular legacy con funciones en BD (`clonar_catalogo_a_clase`) y FK entrante en `clase_mapa_indicadores`. |
| 9 | `cierres_caja` | referenciada | **HUÉRFANA** | `src/portales/fin/src/lib/supabaseManager.ts` | Solo aparece como string descriptivo en el manifiesto de tablas de Finanzas; cero queries o RPCs reales. |
| 10 | `clase_mapa_indicadores` | solo autogen | **CABLEADA-SIN-DATOS** | Vistas `vw_clase_objetivo_estrellas`, `vw_evaluacion_indicador_global` | Utilizada por 2 vistas y 4 RPCs curriculares (`clonar_plantilla_a_clase`, etc.); FK entrante de evaluaciones. |
| 11 | `clase_mapa_objetivos` | solo autogen | **CABLEADA-SIN-DATOS** | RPC `clonar_plantilla_a_clase` | Utilizada por 5 RPCs curriculares en BD; FK entrante desde `clase_mapa_indicadores.objetivo_id`. |
| 12 | `maestro_retiros` | sin referencia | **ACTIVA** | `src/modules/maestros/api/maestrosApi.js` | Operada activamente por procedimientos `retirar_maestro_seguro` y `eliminar_maestro_limpio` en la API docente. |
| 13 | `mapa_plantillas` | solo autogen | **CABLEADA-SIN-DATOS** | RPC `clonar_plantilla_a_clase` | Función en BD para clonación curricular; estructura cableada en BD sin llamadas directas de UI. |
| 14 | `patrocinantes` | solo autogen | **ACTIVA** | `src/portales/fin/src/context/FinanceContext.tsx` | Consulta REST directa en `FinanceContext.tsx` (`supabaseRest('patrocinantes?select=*')`) en cada sesión. |
| 15 | `planificacion` | referenciada | **SOLO-MOCK** | `src/modules/planificacion/api/planificacionMock.js` | Gen-1 plano. En código solo la tocan mocks y tests; los hits PROD eran falsos positivos del nombre de carpeta/módulo. |
| 16 | `score_compromiso` | solo autogen | **CABLEADA-SIN-DATOS** | Vista `vw_estado_familiar` | Enlazada en 3 vistas activas de finanzas (`vw_estado_familiar`, `vw_mora_activa`, `vw_score_representantes`) y 1 RPC. |
| 17 | `service_account_observations` | sin referencia | **ACTIVA** | `src/portales/fin/src/infrastructure/supabase/SupabaseServiceBalancesRepository.ts` | Leída por RPC `fn_fin_service_dashboard()` en el repositorio de balances de servicio del portal Finanzas. |
| 18 | `service_accounts` | solo autogen | **ACTIVA** | `src/portales/fin/src/infrastructure/supabase/SupabaseServiceBalancesRepository.ts` | Tabla principal leída por RPC `fn_fin_service_dashboard()` para el panel *Mi Día* en Finanzas. |
| 19 | `tarea_logs` | solo autogen | **ACTIVA** | `src/modules/calendario/api/calendarApi.js` | Modificada por RPC `fn_actualizar_tarea` invocado desde `calendarApi.js`; posee RLS vinculado a departamentos. |
| 20 | `tareas_caja` | solo autogen | **CABLEADA-SIN-DATOS** | RPC `fn_escalar_mora` | Procedimiento en BD para escalamiento automático de mora financiera; sin consultas directas desde frontend. |
| 21 | `tareas_calendario` | solo autogen | **ACTIVA** | `src/modules/calendario/api/calendarApi.js` | Operada por RPCs `fn_generar_tareas_calendario`, `fn_obtener_tareas_departamento`, etc., en `calendarApi.js`. |
| 22 | `usuario_departamentos` | solo autogen | **ACTIVA** | `src/modules/calendario/api/calendarApi.js` | Operada por RPCs de asignación departamental y referenciada en 6 políticas RLS de seguridad activas. |
| 23 | `whatsapp_consentimientos` | solo autogen | **ACTIVA** | `src/modules/campanias/api/campaniasApi.js` | Leída por RPC `fn_whatsapp_reclamar_pendientes` ejecutada por la Edge Function `whatsapp-dispatcher`. |

---

## 4. Desglose detallado de los falsos positivos preliminares

Para asegurar total transparencia técnica, se documentan los 4 casos donde el informe inicial reportó "referenciada" basándose en coincidencias puramente léxicas:

1. **`planificacion` (Generación 1 - Legacy)**:
   - *Hit preliminar:* Aparecía referenciada en `src/core/moduleCatalog.js` y `src/main-maestros.js`.
   - *Análisis de Lila:* El string `'planificacion'` en esos archivos corresponde al identificador del módulo, las rutas del router y las importaciones de componentes. La tabla relacional `planificacion` NO tiene ningún `.from('planificacion')` en producción. El módulo productivo (`planificacionSupabase.js`) opera sobre las tablas de Generación 2 (`routes`, `blocks`, `levels`, `nodes`, `indicators`). La tabla `planificacion` solo persiste en archivos mock (`planificacionMock.js`, `curriculoTresPlanosStore.js`) y pruebas unitarias. Veredicto: **SOLO-MOCK**.
2. **`audiciones`**:
   - *Hit preliminar:* Referenciada en `scripts/patch-main-portal-hub.js` y `src/core/moduleCatalog.js`.
   - *Análisis de Lila:* Los hits corresponden al entry point HTML (`audiciones.html`) y al identificador de navegación externa `audiciones-entry`. El servicio real de audiciones (`src/modules/audiciones/api/audicionesSupabase.js`) consulta la tabla `evaluations`, nunca la tabla `audiciones`. La tabla física `audiciones` carece de consultas, funciones o vistas. Veredicto: **HUÉRFANA**.
3. **`cierres_caja`**:
   - *Hit preliminar:* Referenciada en `src/portales/fin/src/lib/supabaseManager.ts`.
   - *Análisis de Lila:* Coincidencia dentro de un array de metadatos estáticos (`{ table: 'cierres_caja', description: 'Arqueos y cierres diarios de cajero' }`) y en `CanonicalManifest.ts`. No existe ningún servicio, vista, hook o RPC que consuma esta tabla. Veredicto: **HUÉRFANA**.
4. **`accesorios`**:
   - *Hit preliminar:* Referenciada en `src/modules/luteria-taller/api/luteriaTallerMock.js`.
   - *Análisis de Lila:* Las apariciones en archivos como `detalleInstrumentoView.js` corresponden a variables locales (`const accesorios = ...`) o textos de botones (`Accesorios`), no a la tabla. El único archivo que consulta la tabla es el mock de lutería. La vista `vw_stock_bajo` existe en PostgreSQL pero no es consumida por el código. Veredicto: **SOLO-MOCK**.

---

## 5. Criterios y recomendaciones técnicas para la toma de decisiones de Omar

De acuerdo con las reglas de gobierno del proyecto, **la decisión final de Terminar / Archivar / Eliminar corresponde exclusivamente a Omar**. Esta auditoría provee la base fáctica rigurosa para dicha decisión:

### Grupo 1: Tablas ACTIVA (33 tablas)
- **Diagnóstico:** Componentes integrales de la operativa en vivo (Finanzas, Ausentismo 2026-09-04, Credenciales, Campañas WhatsApp, Tareas de Calendario, Reportes Académicos).
- **Riesgo:** **CRÍTICO.** Cualquier alteración o DROP romperá funcionalidades operativas o disparará excepciones no controladas en tiempo de ejecución.
- **Recomendación técnica para Omar:** **Terminar / Mantener**. Verificar por qué tienen 0 filas (ej. recién migradas, tablas transaccionales de eventos que aún no han ocurrido o registros que se limpian tras procesamiento).

### Grupo 2: Tablas CABLEADA-SIN-DATOS (50 tablas)
- **Diagnóstico:** Features a medio rollout o módulos diseñados con código estructurado pero sin usuarios activos:
  - Familia `acm_*` (7 tablas) + `academic_plans`: Gobernanza curricular pausada.
  - Familia `lut_*` (6 tablas): Taller de lutería completamente codificado pero no utilizado en producción.
  - Metodología de eventos de clase (`class_event_*`, `homework_assignments`).
  - Bitácora de indicadores y sesiones (`indicator_sessions`, etc.).
  - Esquema curricular legacy (`clase_mapa_*`, `mapa_plantillas`).
- **Recomendación técnica para Omar:**
  - Si la feature está en el roadmap a corto plazo (< 6 meses): **Terminar**.
  - Si la feature está pausada o en rediseño: **Archivar** (`COMMENT ON TABLE ... IS '-- DEPRECATED'`). No eliminar código abruptamente.

### Grupo 3: Tablas SOLO-MOCK (3 tablas: `accesorios`, `planificacion`, `planificacion_nodos`)
- **Diagnóstico:** Tablas que han quedado relegadas a entornos de pruebas o simulaciones locales. La lógica productiva ya migró a otros esquemas (ej. Generación 2 de rutas para planificación).
- **Recomendación técnica para Omar:** **Archivar** o **Eliminar** tras desacoplar los mocks correspondientes.

### Grupo 4: Tablas HUÉRFANA (36 tablas)
- **Diagnóstico:** Tablas sin ningún enlace funcional, vistas, funciones ni llamadas de código en todo el ecosistema (`accesorio_asignaciones`, `alumnos_ejercicios`, `alumnos_modulos`, `campanas_pago`, `exoneraciones`, `hermes_evaluaciones`, `intentos_ejercicios`, `xp_log`, etc.).
- **Recomendación técnica para Omar:** Candidatas óptimas a **Eliminar** en la Tarea 0.2, previa verificación de foreign keys salientes y generación del script con confirmación humana explícita.

---

*Fin del informe de verificación exhaustiva. Los datos completos fila por fila se encuentran en [`docs/hygiene/FASE-0_inventario_verificado.csv`](./FASE-0_inventario_verificado.csv).*
