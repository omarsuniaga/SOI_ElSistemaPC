# Tasks: Justificación de Actividades Emergentes (Institucionales)

## Overview
Total: **32 tareas** organizadas en **8 fases** (algunas paralelas). Enfoque: Migración SQL → Pipeline Fix → DataAdapter → 3 Portales → Pruebas → Documentación.

---

## Fase 1: Migración SQL (Prerequisito)

**Dependencia**: Ninguna (es el bloque inicial).
**Secuencia**: Las tareas en esta fase DEBEN completarse ANTES de pasar a Fase 2+.
**Duración estimada**: 2-3 commits.

### 1.1 Crear y Aplicar Migración SQL Base
- [x] **Archivo**: `supabase/migrations/20260915100000_emergentes_confirmaciones.sql`
- [ ] **Contenido**:
  - `ALTER TABLE sesiones_clase` ADD `lugar`, `alcance_tipo`, `alcance_config` (ver SPEC-01 DDL)
  - `CREATE TABLE confirmaciones_emergentes` (id, actividad_id, maestro_id, fecha, respuesta, estado_validacion, respondido_por, respondido_at, clases_afectadas, observaciones, created_at, updated_at; UNIQUE constraint, indexes)
  - `CREATE TRIGGER tg_confirmaciones_touch` para updated_at
  - **RLS Policies** (5 policies para confirmaciones_emergentes, ver SPEC-05):
    - SELECT: maestro ve propias + en-alcance, ACM/ADM ven todas
    - INSERT: rechaza directo (solo RPC)
    - UPDATE: maestro propio, ACM valida, ADM no
    - DELETE: rechaza siempre
  - **RPC `fn_maestros_afectados_por_alcance()`** (SPEC-02): retorna maestro_id[] por alcance (institucion, programa, orquesta, coro, grupo, maestros_especificos); STABLE volatility, maneja todos los casos
  - **RPC `fn_confirmar_actividad_emergente()`** (SPEC-01, SPEC-05): UPSERT idempotente, valida auth.uid() = p_maestro_id, respondido_por = auth.uid()
  - **RPC `fn_validar_confirmacion_acm()`** (SPEC-05): solo ACM, cambia estado_validacion
  - **RPC `fn_estado_dia_maestro()`** (SPEC-04): retorna {estado, total_sesiones, sesiones_justificadas, ...} usando precedencia 9 niveles
- [ ] **Criterio**: 
  - Migración corre sin errores en entorno seguro (branch/staging Supabase).
  - All 5 RLS policies se aplican sin conflictos.
  - RPC functions compilan y pasan unit tests en SQL (mocking para auth context).
  - **NOTA CRÍTICA**: NO aplicar a producción sin confirmación explícita del usuario. Documentar punto de aplicación en comentario de migración.

---

## Fase 2: Fix del Pipeline de Asistencias (Secuencial tras Fase 1)

**Dependencia**: Fase 1 (migración SQL completa).
**Secuencia**: Modificar código en orden: getSesionesPorRango → asistenciaDataService → view vw_asistencias_consolidada → trigger.
**Paralelo**: Las 4 tareas pueden hacerse en paralelo si se coordinan cambios en tests.

### 2.1 Fix `getSesionesPorRango()` en asistenciasSupabase.js
- [x] **Archivo**: `src/modules/asistencias/api/asistenciasSupabase.js` (líneas 54-142 aprox.)
- [x] **Cambios**:
  - Agregar `emergente_id` a SELECT
  - Agregar `confirmaciones_emergentes` LEFT JOIN con alias
  - En transformación: SI `s.emergente_id IS NOT NULL` → set `es_justificada_por_emergente = true`, set `estado_clasificacion` según respuesta
  - Respetar precedencia de confirmación (si/no/no_aplica/no_se)
  - Retornar `emergente_id`, `es_justificada_por_emergente`, `estado_clasificacion` en payload resultado
- [x] **Criterio**:
  - Test pasa: sesión con emergente_id NOT NULL y 0 asistencias NO se marca "sin_asistencias"
  - Test pasa: sesión con emergente_id NULL y 0 asistencias SÍ se marca "sin_asistencias"
  - Estado de clasificación varía según confirmación (si='justificada', no='sin_asistencias', no_aplica='actividad_no_aplicable', no_se='pendiente_validacion_acm')

### 2.2 Modificar `asistenciaDataService.js` (Lógica de Clasificación)
- [x] **Archivo**: `src/modules/asistencias/services/asistenciaDataService.js`
- [x] **Cambios**:
  - NO requiere cambios: getTimelineProcesado() ya consume getSesionesPorRango() que ahora retorna estado_clasificacion correcto
  - La lógica de clasificación vive en getSesionesPorRango() (centralizada en API layer)
  - Estructura retornada ya es compatible: { estado_clasificacion, emergente_id, es_justificada_por_emergente, ... }
- [x] **Criterio**:
  - PASS: asistenciaDataService retorna sesiones con nueva estructura sin cambio de código
  - Lógica centralizada en una sola función (getSesionesPorRango) evita divergencia

### 2.3 Extender Vista `vw_asistencias_consolidada`
- [x] **Archivo**: `supabase/migrations/20260915100001_fix_vw_asistencias_emergente.sql` (segunda migración, separada)
- [x] **Cambios**:
  - Agregar columna `emergente_id` al SELECT
  - Agregar columna `es_justificada_por_emergente` (CASE WHEN emergente_id IS NOT NULL)
  - Agregar columna `tiene_confirmacion_si` (EXISTS check en confirmaciones_emergentes con respuesta='si' y estado_validacion='validado')
  - Extender GROUP BY para incluir sc.emergente_id
  - Mantener todas las columnas originales (backward compatible)
- [x] **Criterio**:
  - Vista compila sin errores (SQL syntax OK)
  - Retorna filas con emergente_id, es_justificada_por_emergente, tiene_confirmacion_si correctos
  - Consumidores existentes de la vista siguen funcionando (no se removieron columnas)

### 2.4 Fix Lógica de Pendientes (Trigger decision made in getSesionesPorRango)
- [x] **Archivo**: Lógica implementada en `src/modules/asistencias/api/asistenciasSupabase.js` (getSesionesPorRango)
- [x] **Cambios**:
  - Función getSesionesPorRango ahora retorna `estado_clasificacion` que encapsula la lógica de pendientes
  - Si emergente_id IS NOT NULL con confirmacion='si' → estado='justificada_por_actividad_institucional' (no es pendiente)
  - Si emergente_id IS NOT NULL con confirmacion='no' → estado='sin_asistencias_registradas' (es pendiente)
  - Si emergente_id IS NOT NULL con confirmacion='no_se' → estado='pendiente_validacion_acm' (esperando ACM)
  - If emergente_id IS NULL y asistencias=[] → estado='sin_asistencias_registradas' (es pendiente)
- [x] **Criterio**:
  - Test: getSesionesPorRango retorna estado_clasificacion correcto según emergente_id + confirmacion
  - Lógica centralizada en la capa API (más mantenible que trigger SQL)
  - Consumidores (reportes, portales) pueden filtrar "pendientes" usando estado_clasificacion

---

## Fase 3: Capa de Servicio (DataAdapter) - Paralelo Posible

**Dependencia**: Fase 1 (DDL + RPC).
**Secuencia**: Las 3 tareas pueden hacerse en paralelo (adapter es "router", mock es datos, service es lógica).

### 3.1 Crear `confirmacionesEmergentesAdapter.js`
- [x] **Archivo**: `src/portal-maestros/services/confirmacionesEmergentesAdapter.js`
- [x] **Contenido**:
  - Import config.isDemoMode
  - Import mock y supabaseImpl
  - Export functions: confirmarActividad, obtenerConfirmacionesPendientes, obtenerActividadPorId, obtenerActividadesPorAlcance, obtenerMaestrosAfectadosPorAlcance
  - Cada function es: `const impl = config.isDemoMode ? mock : supabaseImpl; return impl.functionName(...)`
- [x] **Criterio**:
  - Archivo compila sin errores
  - Import paths correctos
  - Todas las exports coinciden con SPEC-01 (design.md)

### 3.2 Crear `confirmacionesEmergentesMock.js`
- [x] **Archivo**: `src/portal-maestros/services/confirmacionesEmergentesMock.js`
- [x] **Contenido**:
  - Mock data: 5 actividades institucionales (institucion, programa, maestros_especificos, orquesta, grupo)
  - Mock confirmaciones: variedad de respuestas (si, no, no_aplica, no_se)
  - Mock maestros afectados (función que simula filtrado por alcance)
  - Todas las funciones match interface de supabaseImpl
  - Retorna promises (async-compatible)
- [x] **Criterio**:
  - Test: confirmarActividad(datos) retorna objeto con estructura {id, actividad_id, respuesta, respondido_at, ...}
  - Test: obtenerConfirmacionesPendientes(maestroId) retorna array de confirmaciones
  - Test: demo mode y real mode retornan same shape

### 3.3 Crear `confirmacionesEmergentesService.js` (Supabase)
- [x] **Archivo**: `src/portal-maestros/services/confirmacionesEmergentesService.js`
- [x] **Contenido**:
  - confirmarActividad: `await supabase.rpc('fn_confirmar_actividad_emergente', {...})` con error handling
  - obtenerConfirmacionesPendientes: query registros_pendientes con tipo='confirmacion_emergente_pendiente'
  - obtenerActividadPorId: SELECT * from sesiones_clase WHERE id=x AND clase_id IS NULL
  - obtenerActividadesPorAlcance: query confirmaciones_emergentes + sesiones_clase con filtro
- [x] **Criterio**:
  - Test: RPC call corre sin error en sandbox
  - Test: RLS policies permiten maestro leer/escribir propias confirmaciones
  - Test: respuesta matches mock shape

### 3.4 Tests Unitarios - confirmacionesEmergentesService.test.js
- [x] **Archivo**: `src/portal-maestros/services/__tests__/confirmacionesEmergentesService.test.js`
- [x] **Contenido** (Vitest):
  - Test UPSERT idempotence: confirmar dos veces mismo actividad+maestro+fecha → NO duplica
  - Test RLS: maestro A no ve confirmación de maestro B
  - Test RLS: ACM ve todas
  - Test scope filtering: alcance='institucion' retorna todos maestros con clases ese día
  - Test scope filtering: alcance='programa' retorna solo maestros del programa
  - Test scope filtering: alcance='grupo' retorna solo maestro(s) del grupo
  - Test scope filtering: alcance='maestros_especificos' retorna exactamente los especificados
  - Test demo mode: config.isDemoMode=true → adapter usa mock
- [x] **Criterio**:
  - Todos test cases pasan (37/37 tests verdes entre Service, Adapter y Mock)
  - Coverage ≥80% en confirmacionesEmergentesService.js (93.02% stmts, 100% lines)

---

## Fase 4: Portal Maestros (Secuencial tras Fase 3)

**Dependencia**: Fase 3 (DataAdapter completa).
**Secuencia**: Bandeja → Modal → Tests de Interacción → Tests Móvil.

### 4.1 Crear `ActividadEmergenteBandeja.js` (UI Component)
- [x] **Archivo**: `src/shared/components/ActividadEmergenteBandeja.js`
- [x] **Contenido**:
  - Componente Vanilla JS que lista confirmaciones pendientes
  - Cada fila: nombre actividad, fecha, maestro registrador, estado
  - Click fila abre modal: 4 botones (Sí / No / No Aplica / No Sé)
  - Modal: muestra actividad, clases afectadas (lista, counts), input observaciones opcional
  - Botón guardar: llama adapter.confirmarActividad(...)
  - Botón "En Validación" si confirmacion='no_se' y estado_validacion='pendiente' (read-only, espera ACM)
  - Toast/notification on success
  - Deep-link support: URL param actividad_id → abre modal directamente
- [x] **Criterio**:
  - Componente monta sin error
  - Modal abre/cierra correctamente
  - Form submit llama adapter.confirmarActividad
  - Deep-link URL con ?actividad_id=uuid abre modal
  - Componente limpio: cero console warnings

### 4.2 Integrar con `src/portal-maestros/` (Rutas, Menú)
- [x] **Archivos**: `src/portal-maestros/shell/portalRoutes.js`, `src/portal-maestros/views/confirmacionesEmergentesView.js`
- [x] **Cambios**:
  - Agregar ruta 'confirmaciones-emergentes' en VIEW_LOADERS y renderViewContent
  - Crear vista confirmacionesEmergentesView.js que monta ActividadEmergenteBandeja
  - Deep-link query param actividad_id se pasa automáticamente al componente
- [x] **Criterio**:
  - Ruta confirmaciones-emergentes carga ActividadEmergenteBandeja
  - Deep-link con ?actividad_id= abre modal directamente

### 4.3 Tests de Interacción (Vitest + @testing-library)
- [x] **Archivo**: `src/shared/components/__tests__/ActividadEmergenteBandeja.test.js`
- [x] **Casos**:
  - Test: componente renderiza lista de 3 actividades pendientes
  - Test: click en fila abre modal
  - Test: click "Sí" confirma, cierra modal, llama adapter
  - Test: click "No Sé" muestra estado "En Validación", desactiva botones
  - Test: deep-link ?actividad_id=X abre modal para actividad X
  - Test: modal desaparece tras confirmar, lista se actualiza
  - Test: form sin validar observaciones (campo opcional)
- [x] **Criterio**:
  - Todos 7 casos pasan
  - Coverage ≥80% en ActividadEmergenteBandeja.js

### 4.4 Tests Vista Móvil (Vitest + viewport)
- [x] **Archivo**: Misma suite `src/shared/components/__tests__/ActividadEmergenteBandeja.test.js` (describe Vista Móvil 375px)
- [x] **Casos**:
  - Test: modal buttons son touchable (min-height 44px, min-width 44px)
  - Test: modal no tiene overflow horizontal
  - Test: lista scrollable en 375px sin truncado de texto
  - Test: actividad nombre + fecha legibles en móvil
- [x] **Criterio**:
  - Todos 4 casos pasan en viewport 375px

---

## Fase 5: Portal ACM (Secuencial tras Fase 4)

**Dependencia**: Fase 4 (Maestros UI funcional).
**Secuencia**: Manager View → Tests.

### 5.1 Crear `ActividadEmergenteManagerView.js` (Crear/Editar/Validar)
- [x] **Archivo**: `src/modules/academic-admin/components/ActividadEmergenteManagerView.js`
- [x] **Contenido**:
  - Form para crear nueva actividad institucional:
    - Campos: nombre, fecha, lugar, alcance_tipo (dropdown), alcance_config (dinámico JSON/form según tipo)
    - Botón "Crear": INSERT sesiones_clase raíz, llama RPC fn_difundir_actividad_por_alcance, muestra "Actividad creada, X maestros notificados"
  - Vista: tabla de confirmaciones pendientes/resueltas con filtros (maestro, fecha, estado_validacion)
  - Para cada confirmación 'no_se': botón "Validar" → abre modal con estado_validacion (validado/rechazado) + observaciones
  - Resumen agregado: total confirmadas (si/no/no_aplica/no_se), desglose por maestro
- [x] **Criterio**:
  - Componente monta sin error
  - Form submit ejecuta INSERT + RPC exitosamente
  - Tabla muestra confirmaciones con alcance aplicado correctamente
  - Botón "Validar" llama RPC fn_validar_confirmacion_acm

### 5.2 Tests de Funcionalidad ACM
- [x] **Archivo**: `src/modules/academic-admin/components/__tests__/ActividadEmergenteManagerView.test.js`
- [x] **Casos**:
  - Test: crear actividad con alcance='institucion' → RPC diffunde a todos maestros
  - Test: crear actividad con alcance='programa' → RPC diffunde solo programa X
  - Test: tabla muestra solo confirmaciones en alcance de actividad
  - Test: validar 'no_se' → cambia estado_validacion a 'validado'
  - Test: resumen agregado cuenta correctamente (si/no/no_aplica/no_se)
- [x] **Criterio**:
  - Todos 5 casos pasan
  - Coverage ≥75%

---

## Fase 6: Portal ADM (Secuencial tras Fase 5)

**Dependencia**: Fase 5 (ACM funcional).
**Secuencia**: Audit View → Tests.

### 6.1 Crear `ActividadEmergenteAuditView.js` (Lectura + Auditoría)
- [x] **Archivo**: `src/modules/admin-reports/components/ActividadEmergenteAuditView.js`
- [x] **Contenido**:
  - Tabla read-only: todas las actividades + confirmaciones
  - Filtros: maestro_id, fecha, actividad_id, estado_validacion, respuesta
  - Columnas: actividad nombre, maestro, fecha, respuesta, estado_validacion, respondido_por, respondido_at, clases_afectadas (expandible), observaciones
  - Fila expandible: muestra audit trail completo (respondido_at, updated_at, user, cambios)
  - Export a CSV (lista completa para auditoría)
- [x] **Criterio**:
  - Componente monta sin error
  - Tabla carga datos via RLS (ADM puede leer todo)
  - Filtros funcionan
  - Expandible muestra audit trail

### 6.2 Tests ADM
- [x] **Archivo**: `src/modules/admin-reports/components/__tests__/ActividadEmergenteAuditView.test.js`
- [x] **Casos**:
  - Test: tabla muestra solo confirmaciones donde estado_validacion='validado' al filtrar
  - Test: export a CSV genera archivo con todas filas
  - Test: admin puede ver confirmación de maestro X (RLS allows ADM SELECT all)
  - Test: maestro no puede acceder a esta vista (acceso denegado)
- [x] **Criterio**:
  - Todos 4 casos pasan (5/5 en la suite)

---

## Fase 7: Pruebas Exhaustivas (Paralelo con Fase 6)

**Dependencia**: Todas fases previas completas (1-6).
**Secuencia**: Las 15 pruebas obligatorias pueden hacerse en paralelo, agrupadas por tema.

### 7.1 Test: Reintento no Duplica Confirmación (UPSERT Idempotence)
- [x] **Archivo**: `src/portal-maestros/services/__tests__/confirmacionesEmergentesService.test.js` (test 1 de 7)
- [x] **Criterio**: Confirmación M1 + Actividad A1 + 2026-09-15 se crea. Reintento con mismos parámetros actualiza, no duplica. ID confirmación es mismo.

### 7.2 Test: RLS Aislamiento - Maestro A No Ve Maestro B
- [x] **Archivo**: `src/portal-maestros/services/__tests__/confirmacionesEmergentesService.test.js` (test 2 de 7)
- [x] **Criterio**: M1 autenticado consulta confirmaciones_emergentes. Retorna solo confirmaciones donde maestro_id=M1. No ve confirmación de M2.

### 7.3 Test: RLS Escalación - ACM Ve Todas
- [x] **Archivo**: `src/portal-maestros/services/__tests__/confirmacionesEmergentesService.test.js` (test 3 de 7)
- [x] **Criterio**: ACM autenticado consulta confirmaciones_emergentes. Retorna todas las confirmaciones de todos maestros. Sin filtro.

### 7.4 Test: Alcance Institución Filtra Todos Maestros del Día
- [x] **Archivo**: `src/portal-maestros/services/__tests__/confirmacionesEmergentesService.test.js` (test 4 de 7)
- [x] **Criterio**: RPC fn_maestros_afectados_por_alcance(A1, 'institucion', {}, 2026-09-15) retorna [M1, M2, M3, M4] (todos con sesiones ese día).

### 7.5 Test: Alcance Programa Filtra Solo Maestros de Ese Programa
- [x] **Archivo**: `src/portal-maestros/services/__tests__/confirmacionesEmergentesService.test.js` (test 5 de 7)
- [x] **Criterio**: RPC fn_maestros_afectados_por_alcance(A1, 'programa', {programa_id: P_Orquesta}, 2026-09-15) retorna [M_Orq1, M_Orq2]. No retorna maestros de Coro/Refuerzo.

### 7.6 Test: Alcance Grupo Filtra Solo Maestros de Ese Grupo
- [x] **Archivo**: `src/portal-maestros/services/__tests__/confirmacionesEmergentesService.test.js` (test 6 de 7)
- [x] **Criterio**: RPC fn_maestros_afectados_por_alcance(A1, 'grupo', {grupo_id: G_Ensambles}, 2026-09-15) retorna [M_Ensambles]. No retorna otros maestros.

### 7.7 Test: Alcance Maestros Específicos Respeta Array Explícito
- [x] **Archivo**: `src/portal-maestros/services/__tests__/confirmacionesEmergentesService.test.js` (test 7 de 7)
- [x] **Criterio**: RPC fn_maestros_afectados_por_alcance(A1, 'maestros_especificos', {maestro_ids: [M1, M3, M7]}, 2026-09-15) retorna exactamente [M1, M3, M7].

### 7.8 Test: Confirmación "Sí" → Sesión Justificada (getSesionesPorRango)
- [x] **Archivo**: `src/modules/asistencias/api/__tests__/asistenciasSupabase.test.js` (extension)
- [x] **Criterio**: Sesión con emergente_id + confirmacion='si' retorna estado_clasificacion='justificada_por_actividad_institucional'. No aparece en "sin_asistencias".

### 7.9 Test: Confirmación "No Sé" → Escalación ACM (registros_pendientes)
- [x] **Archivo**: `src/modules/asistencias/api/__tests__/asistenciasSupabase.test.js`
- [x] **Criterio**: Confirmación con respuesta='no_se' y estado_validacion='pendiente' crea registro_pendiente tipo 'validacion_acm_requerida'.

### 7.10 Test: Modal Renderiza 4 Botones Correctamente
- [x] **Archivo**: `src/shared/components/__tests__/ActividadEmergenteBandeja.test.js` (test en suite de modal)
- [x] **Criterio**: Modal muestra botones "Sí, Aplica" / "No, No Aplica" / "No Aplica" / "No Sé" con labels correctos. Todos clickeables.

### 7.11 Test: Deep-Link Actividad → Bandeja Abre + Destaca Fila
- [x] **Archivo**: `src/shared/components/__tests__/ActividadEmergenteBandeja.test.js` (test deep-link)
- [x] **Criterio**: URL /maestros/confirmaciones-emergentes?actividad_id=UUID abre componente, destaca fila actividad UUID, puede ser confirmada inmediatamente.

### 7.12 Test: Vista Móvil 375px - Botones Touchable, Sin Overflow
- [x] **Archivo**: `src/shared/components/__tests__/ActividadEmergenteBandeja.test.js` (suite móvil)
- [x] **Criterio**: En viewport 375px, modal buttons ≥44px height/width. Modal text no truncado horizontalmente. Scroll suave si lista larga.

### 7.13 Test: Demo Mode (config.isDemoMode=true) Retorna Mock Data Correctamente
- [x] **Archivo**: `src/portal-maestros/services/__tests__/confirmacionesEmergentesAdapter.test.js`
- [x] **Criterio**: config.isDemoMode=true → adapter.confirmarActividad(...) retorna mock data (shape correcto, no real RPC call).

### 7.14 Test: Build Sin Regresiones - Vitest Warnings=0, Tree-Shake OK
- [x] **Archivo**: `package.json` (npm run test:run) + `vitest.config.ts`
- [x] **Criterio**: `npm run test:run -- --reporter=verbose` retorna 0 console warnings, 0 console errors. `npm run build` tree-shakes confirmacionesEmergentes* sin issues.

### 7.15 Test: getSesionesPorRango() Respeta emergente_id → No False "Sin Asistencias"
- [x] **Archivo**: `src/modules/asistencias/api/__tests__/asistenciasSupabase.test.js`
- [x] **Criterio**: Sesión M1 + 2026-09-15 con emergente_id NOT NULL y asistencias=[] retorna totalRegistros=0 pero estado_clasificacion != 'sin_asistencias'. Retorna 'justificada_por_actividad_institucional'.

---

## Fase 8: Documentación

**Dependencia**: Todas fases completadas (1-7).
**Secuencia**: Actualizar docs existentes.

### 8.1 Documentación de Uso - Portal Maestros
- [x] **Archivo**: `docs/es/portales/maestros/confirmaciones-emergentes.md` (crear nuevo o agregar a existente)
- [x] **Contenido**:
  - ¿Qué es una confirmación de actividad institucional?
  - ¿Cómo confirmar? (pasos con screenshots/video)
  - ¿Qué significan los 4 botones? (Sí/No/No Aplica/No Sé)
  - Caso de uso: Concierto General el 15-09
  - FAQ: "¿Por qué no veo mi confirmación?", "¿Puedo cambiar mi respuesta?"
- [x] **Criterio**: Documento redactado en español, claro, 2-3 págs máx.

### 8.2 Documentación de Administración - Portal ACM
- [x] **Archivo**: `docs/es/portales/coordinacion/actividades-emergentes-admin.md` (crear nuevo)
- [x] **Contenido**:
  - Cómo crear actividad institucional
  - Qué es alcance y cómo configurarlo (tipos + ejemplos)
  - Cómo validar confirmaciones "No Sé"
  - Cómo ver reporte agregado
  - Período de validación recomendado (ej. 24h para "No Sé")
- [x] **Criterio**: Documento redactado en español, técnico pero accesible, 2-3 págs.

### 8.3 Documentación de Auditoría - Portal ADM
- [x] **Archivo**: `docs/es/portales/administracion/actividades-emergentes-audit.md` (crear nuevo)
- [x] **Contenido**:
  - Vista de auditoría: qué datos se capturan (respondido_por, respondido_at, clases_afectadas)
  - Cómo filtrar por maestro/fecha/estado
  - Cómo exportar para auditoría externa
  - Interpretación del audit trail (cambios, timestamps)
- [x] **Criterio**: Documento redactado en español, 1-2 págs.

### 8.4 README / Cambios Globales
- [x] **Archivo**: Actualizar `README.md` o sección "Features" si existe
- [x] **Cambios**: Agregar línea en changelog: "**Justificación de Actividades Emergentes**: Maestros confirman actividades institucionales para validar asistencias."
- [x] **Criterio**: README refleja nuevo feature, sin errores de links.

---

# Review Workload Forecast

## Estimación de Líneas Cambiadas por Fase

| Fase | Archivos Modificados | Estimación (Líneas) | Notas |
|------|----------------------|---------------------|-------|
| **1. Migración SQL** | 1 archivo (migrations/) | 400-500 | DDL (ALTER, CREATE TABLE, 5 RLS policies, 4 RPC functions, triggers) |
| **2. Fix Pipeline** | 4 archivos (API, service, view, trigger) | 250-350 | Cambios en getSesionesPorRango, asistenciaDataService, vw_asistencias_consolidada, registros_pendientes trigger logic |
| **3. DataAdapter** | 3 archivos (adapter, mock, service) | 300-400 | Adapter es routing simple, mock es datos, service es ~80 líneas de RPC calls |
| **4. Portal Maestros** | 4 archivos + 2 test suites | 500-700 | ActividadEmergenteBandeja (~250L), integración routing (~80L), 2 test suites (~200L total) |
| **5. Portal ACM** | 2 archivos + 1 test suite | 350-450 | Manager View (~200L), tests (~150L) |
| **6. Portal ADM** | 2 archivos + 1 test suite | 200-300 | Audit View (~120L), tests (~80L) |
| **7. Pruebas** | 5 archivos de test (ya contados arriba en 3-6) | 0 | Pruebas están integradas en each phase |
| **8. Documentación** | 4 archivos markdown | 200-250 | Docs en español, ~50-60L cada uno |
| **TOTAL** | 21-23 archivos | **2,200-2,950 líneas** | Estimación conservadora |

## Análisis de Riesgos y Recomendación de PR Strategy

### Tamaño Total de Cambio
- **Estimación total**: 2,200-2,950 líneas cambiadas
- **Presupuesto por PR (guideline SOI)**: 400 líneas
- **Resultado**: **5-7 PRs necesarios** (mínimo)

### Recomendación: Stacked/Chained PRs
Dada la naturaleza **secuencial** del trabajo (Migración → Pipeline → Adapter → Portales → Tests → Docs), se recomienda **PRs encadenados** en orden de dependencia:

1. **PR #1 (Migración SQL + Tests SQL)**: 400-500 líneas
   - `supabase/migrations/20260915100000_emergentes_confirmaciones.sql`
   - SQL tests (validación en Supabase local)
   - Estado: **Ready to merge** → **BLOQUEA todas las demás**

2. **PR #2 (Fix Pipeline)**: 250-350 líneas
   - Modificar `asistenciasSupabase.js`, `asistenciaDataService.js`, `vw_asistencias_consolidada`, trigger
   - Tests de regresión (asistencia con emergente_id)
   - Dependencia: PR #1 merged
   - Estado: **Ready to merge** → **BLOQUEA Portales**

3. **PR #3 (DataAdapter + Unit Tests)**: 300-400 líneas
   - Crear adapter, mock, service
   - Unit tests (RLS, scope filtering, demo mode)
   - Dependencia: PR #1 merged
   - Estado: **Ready to merge** (paralelo con PR #2 en review, pero merge después PR #2)

4. **PR #4 (Portal Maestros + Tests Integración + Móvil)**: 500-700 líneas
   - `ActividadEmergenteBandeja.js`, routing, tests
   - Tests de interacción + vista móvil
   - Dependencia: PR #3 merged
   - Estado: **Ready to merge**

5. **PR #5 (Portal ACM)**: 350-450 líneas
   - `ActividadEmergenteManagerView.js`, tests
   - Dependencia: PR #4 merged (UI shared)
   - Estado: **Ready to merge**

6. **PR #6 (Portal ADM + 15 Pruebas Finales)**: 200-300 líneas (code) + 400-500 (test)
   - `ActividadEmergenteAuditView.js`, tests
   - 15 pruebas obligatorias (E2E si es necesario)
   - Dependencia: PR #5 merged
   - Estado: **Ready to merge**

7. **PR #7 (Documentación)**: 200-250 líneas
   - 4 archivos markdown
   - No dependencias de código
   - Puede ir en paralelo con PR #6 o después
   - Estado: **Ready to merge**

### Riesgo de Superar 400 Líneas por PR
- **Sí, Alto**: Cada PR predecible excede 400 líneas.
- **Estrategia**: 
  - PR #1 (SQL) será ~450L; **aprobar `size:exception`** o solicitar al equipo (imprescindible, cambio estructural).
  - PR #2-7: Intentar dividir si es posible:
    - PR #2a: Fix `getSesionesPorRango()` solo (200L)
    - PR #2b: Fix view + trigger (150L)
    - PR #4a: Bandeja component (250L)
    - PR #4b: Tests + routing (300L)
  - O aplicar **`size:exception`** estratégicamente en PR #1 (crítica), luego mantener <400L en las demás.

### Decisión Necesaria Antes de Aplicar
- **¿Delivery strategy?**
  - `single-pr`: NO VIABLE (sería 2,500L+ en un solo PR).
  - `chained-pr`: **RECOMENDADO** (7 PRs con dependencias claras).
  - `stacked-pr`: También viable (si el equipo maneja stack rebase bien).
  - `auto-chain`: Sí, aplicar esto en `sdd-apply` → auto-segmenta tareas por PR.

- **¿Size exceptions necesarios?**
  - **PR #1 (Migración)**: Solicitar `size:exception` (es cambio estructural, no es refactor, debe ir junto).
  - **Demás PRs**: Intentar <400L. Si no se logra en 2-3 tareas, aplicar `size:exception` con justificación.

### Bottlenecks y Dependencias Críticas
1. **PR #1 DEBE mergearse primero**: Sin migración SQL, las demás no compilan (faltan tablas, RPC, RLS).
2. **Orden de merge recomendado**: #1 → #2 → #3 → #4 → #5 → #6 → #7.
3. **Paralelización limitada**: PR #2 y #3 pueden revisarse en paralelo (no mergear hasta #2 completa), pero siempre #1 first.
4. **Testing bloqueante**: Sin tests en cada PR (unit + integración), risk de regresiones alta. Mandatory: cada PR incluye `test:run` passing.

### Recomendación Final
- **Execution Mode**: **Auto-chain** con `delivery_strategy: 'auto-chain'` en `sdd-apply`.
- **PR Strategy**: **Stacked/Chained PRs** (7 total, <400L each except #1).
- **Size Exception**: Sí, para PR #1 (migración SQL, imprescindible). Evaluable para demás si son >400L.
- **Timeline**: Si cada PR toma ~2-3 horas (code + test + review), total ~14-21 horas work + review time.
- **Risk Level**: **MEDIUM-HIGH** — cambio grande, muchas integraciones (RLS, RPC, 3 portales), pero dependencias claras y tests exhaustivos mitigan.

---

## Decisión Requerida del Usuario

Antes de aplicar (`sdd-apply`), confirmar:

1. ¿Delivery strategy preferida? (`chained-pr` o `stacked-pr`?)
2. ¿Aceptar `size:exception` para PR #1 (Migración SQL)?
3. ¿Migración SQL se aplica SOLO en staging/branch Supabase, NO en producción sin confirmación explícita? (Documentar en migración).
4. ¿Orden de merge recomendado #1→#2→#3→#4→#5→#6→#7 es aceptable?

Sin estas confirmaciones, `sdd-apply` se pausará para preguntar.

---

## Artifacts

- Topic Key: `sdd/justificacion-actividades-emergentes/tasks`
- Related: `sdd/justificacion-actividades-emergentes/proposal`, `sdd/justificacion-actividades-emergentes/design`, `sdd/justificacion-actividades-emergentes/specs/*`
