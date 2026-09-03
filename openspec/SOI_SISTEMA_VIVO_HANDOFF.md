# SOI Sistema Vivo — Handoff para agente continuador
> Última actualización: 2026-09-03 | Autor: Claude Sonnet 4.6

---

## Trabajo reciente en el portal (UI/UX) — 2026-09-03

Rediseño y consolidación de varios módulos del portal ADM/maestros. Rama:
`feat/planificacion-clases-rediseño`. Build verde, suite en verde salvo 2 tests
pre-existentes con fecha hardcodeada (`reporteSemestralView.test.js`, agosto).

- **Alumnos** (`src/modules/alumnos/`): la grilla ahora se agrupa por programa vía
  `domain/agruparAlumnosPorPrograma.js` (grupos "Sin programa asignado" y
  "Más de un programa" al final; resto alfabético). Cada card muestra tags de
  programa cuando el alumno tiene más de uno. Estilos nuevos `alumnos-programa-*`.
- **Clases** (`src/modules/clases/views/clasesView.js`): "alumnos sin clase" ahora
  se calcula solo sobre el padrón **activo**. Helpers exportados y testeables:
  `filtrarPadronActivo`, `construirSetInscritos`, `calcularAlumnosSinClase`. La
  consulta a `alumnos` agrega `.eq('activo', true)`.
- **Asistencias** (`src/modules/asistencias/`): affordance del estado
  "justificado" y modal de formato con `AppModal`; fix de TDZ en reporte view.
- **Portal-maestros / ausenciaModal** (`src/portal-maestros/`): el modal arma un
  `formState` único (`_buildFormState`) que consume
  `createAbsenceRequest` / `validateAbsenceRequest` / `buildAbsencePayload`;
  errores de validación se muestran inline. `ausenciasApi.js`: tabla correcta
  `sesiones_clase` (no `sesiones`); se removió `creado_en` manual (usa default de
  columna `created_at`); `notificaciones` no tiene `ausencia_id`.
- **Admin-aprobación de ausencias** (`src/modules/admin-aprobacion/`): vista
  reworkeada con pestañas Pendientes/Historial (`obtenerHistorialAusencias`),
  barra de filtros en vivo (búsqueda + tipo + urgencia), stats-cards clicables y
  grilla de 4 columnas en desktop (`@media (min-width: 1200px)`). Los callbacks
  approve/reject hacen recarga (`_loadData`) para reconciliar con el servidor.
- **Shells de portal** (`src/portales/_shared/`): `adminPortalShell.js` expone
  `setPortalNavBadge(route, count)` + listener global del evento `set-nav-badge`
  para badges dinámicos en el nav lateral/bottom-sheet. `portalHubModal.js` cierra
  el modal al elegir un portal. `adm.js` sincroniza el badge de `admin-ausencias`
  contando `ausencias_maestros` pendientes (poll cada 60s).

**Nota Event Spine**: el trigger sobre `justificaciones` y los tipos
`justificacion.*` siguen vigentes; este trabajo no tocó migraciones ni Edge
Functions.

---

## Estado actual — qué está deployado en producción

### Phase 1 — Event Spine (COMPLETO ✅)
- Tabla `public.soi_eventos` — log inmutable, append-only, 9 columnas
- 9 triggers SECURITY DEFINER activos en tablas core:
  - `sesiones_clase` → `sesion.creada`
  - `asistencias` → `asistencia.registrada`, `asistencia.falta_injustificada`, `asistencia.falta_justificada`
  - `tareas_institucionales` → `tarea.creada`, `tarea.completada`, `tarea.escalada`, `tarea.vencida`
  - `justificaciones` → `justificacion.solicitada`, `justificacion.aprobada`, `justificacion.rechazada`
  - `periodos` → `periodo.abierto`, `periodo.cerrado`
- RLS: ACM ve sesiones/asistencias, ADM ve justificaciones/periodos, DIR ve todo, service_role acceso total
- Migrations deployadas: `20260818000000_soi_eventos_event_spine.sql`, `20260818000001_soi_eventos_triggers.sql`

### Phase 2 — Event Enrichment (COMPLETO ✅)
- Edge Function `event-spine-logger` deployada en producción
- 5 handlers reactivos:
  - R1: `asistencia.falta_injustificada` × 3 en 7 días → tarea ACM "Seguimiento alumno"
  - R2: `tarea.vencida` → escalación DIR
  - R3: `periodo.cerrado` → tarea ACM critica de cierre
  - R4: `sesion.creada` sin asistencia en 24h → recordatorio maestro
  - R5: `justificacion.rechazada` → tarea ADM
- pg_cron job `soi-event-enrichment`: `*/10 7-21 * * 1-5` (L-V, cada 10 min en horario académico)
- Idempotencia: `source_event_id` UNIQUE en `tareas_institucionales` + `correlation_id`
- Migrations deployadas: `20260818000002_event_spine_cron.sql`, `20260818000003_tareas_institucionales_idempotency.sql`

### Phase 3 — Pulso Institucional (COMPLETO ✅)
- Tabla `public.hermes_reactive_rules` con 5 reglas seed (R1-R5), enabled=true
- Campo `conditions_json` soporta `{ "groq_enabled": true }` por regla
- Handlers R1-R5 consultan la tabla al inicio → si `enabled=false`, skip sin crear tarea
- `src/modules/hermes/views/pulsoView.js` — dashboard tiempo real vía Supabase Realtime
- `src/modules/hermes/views/rulesView.js` — toggle enable/disable desde portal DIR
- Rutas registradas en `src/main.js`: `hermes-pulso`, `hermes-reglas`
- Migration deployada: `20260818000004_hermes_reactive_rules.sql`
- Edge Function redeployada con handlers actualizados

---

## Arquitectura del stack

```
Portal (Vite + Vanilla JS)
  src/modules/hermes/views/pulsoView.js     ← Dashboard Pulso (Realtime)
  src/modules/hermes/views/rulesView.js     ← Gestión de reglas
  src/modules/hermes/api/tareasSupabase.js  ← getPulsoEventos, getRules, updateRule

Supabase
  public.soi_eventos                        ← Event log (append-only)
  public.hermes_reactive_rules              ← Reglas configurables
  public.tareas_institucionales             ← Tareas HERMES (+ source_event_id, correlation_id)
  supabase/functions/event-spine-logger/    ← Consumer principal
    index.ts                                ← Batch loop + routing
    handlers/r1-r5-*.ts                     ← 5 handlers reactivos
    lib/hermes.ts                           ← Wrapper hermes-crear-tarea
    lib/groq.ts                             ← Wrapper groq-proxy (5s timeout + fallback)
    types.ts                                ← SoiEvento, HandlerResult
  supabase/functions/hermes-crear-tarea/    ← Crea tareas via LLM classification
  supabase/functions/groq-proxy/            ← LLaMA 3.3-70b + OpenRouter fallback
  supabase/functions/hermes-event-monitor/  ← Monitor existente (NO modificar en Phase 4)

Tests
  tests/integration/soi-event-spine/       ← 42 tests Phase 1
  tests/integration/soi-event-enrichment/  ← 24 tests Phase 2
  tests/integration/soi-pulso/             ← 92 tests Phase 3
```

### Patrones clave a respetar
- **Views del portal**: función `async renderXView(container, { supabase, signal })` que retorna HTML o manipula DOM. Cleanup via `signal.addEventListener('abort', ...)`. Ver `hermesConsultaView.js` como referencia.
- **Realtime**: `supabase.channel('nombre').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'soi_eventos' }, callback).subscribe()`. Debounce 800ms. Ver `admin-notificaciones/realtimeService.js`.
- **RLS departamento**: se obtiene del JWT claim o JOIN a tabla `profiles`. Ver migraciones existentes para el patrón exacto.
- **Edge Functions**: Deno, usar `supabase.functions.invoke()` para llamadas inter-función. `x-internal-key` header para auth entre funciones internas.
- **Migrations**: siempre con `IF NOT EXISTS`, patrón de `ON CONFLICT DO NOTHING` en seeds.
- **Tests**: Vitest, config en `vitest.config.js` (incluye `*.test.{js,ts}`), mocks inline con `vi.fn()`.

### Gotchas importantes
1. `WITH CHECK` no aplica a políticas DELETE en PostgreSQL — usar solo `USING (false)`
2. `ALTER TABLE ADD CONSTRAINT UNIQUE ... WHERE` no existe — usar `CREATE UNIQUE INDEX ... WHERE`
3. `supabase db query --linked` acepta `--file` pero NO `--query` inline
4. `supabase functions deploy` usa `--project-ref` (no `--linked`)
5. OPR no es un departamento válido — solo: DIR, ACM, ADM, FIN, LOG, COM, TECNICO, LUT
6. `tareas_institucionales` ya tiene `source_event_id uuid` y `correlation_id uuid` (agregados en Phase 2)
7. pg_cron config usa `system_config` table con keys: `supabase_functions_url`, `supabase_anon_key`, `internal_api_key`
8. Supabase project ref: `zmhmdvmyeyswunurcyow`

---

## Phase 4 — Lo que falta (prioridad ordenada)

### 4A — WhatsApp proactivo a padres [PRIORIDAD ALTA]
**Por qué**: R1 ya detecta cuando un alumno acumula 3 faltas. Falta cerrar el loop comunicando directamente a los padres, no solo creando una tarea interna.

**Qué construir:**
1. Nueva Edge Function `notificar-padres-ausencias` (o extender R1 handler)
2. Consultar tabla de contactos de padres — buscar tabla `alumnos` o `contactos` con campo de teléfono/WhatsApp
3. Llamar `supabase/functions/whatsapp-dispatcher/` que ya existe en el proyecto
4. Template del mensaje en español: "Estimado padre/madre, su hijo/a [nombre] ha faltado 3 días esta semana en El Sistema Punta Cana. Por favor comuníquese con nosotros."
5. Guard: no enviar si ya se envió en las últimas 48h (usar `soi_eventos` para dedup)
6. Integrar con `hermes_reactive_rules` como regla R6 configurable

**Archivos a revisar antes de implementar:**
- `supabase/functions/whatsapp-dispatcher/index.ts` — interface actual
- `supabase/functions/whatsapp-webhook/index.ts` — patrón de mensajería
- Migrations para encontrar tabla de contactos de alumnos/padres

---

### 4B — Pulso Score 0-100 [PRIORIDAD ALTA]
**Por qué**: El director necesita un número único que resuma la salud institucional sin leer el feed completo.

**Qué construir:**
1. Edge Function o RPC SQL `fn_calcular_pulso_score()` que retorna 0-100
2. Fórmula sugerida (ajustar con Omar):
   ```
   Score = (
     asistencia_semanal_pct * 0.40 +      -- % alumnos que asistieron esta semana
     tareas_completadas_a_tiempo_pct * 0.30 + -- % tareas completadas antes de vencer
     sesiones_con_registro_pct * 0.20 +    -- % sesiones con asistencia registrada
     (1 - tareas_vencidas_hoy / max(1, total_tareas)) * 0.10  -- penalización por vencidas
   ) * 100
   ```
3. Widget en `pulsoView.js` — número grande con color (verde ≥80, amarillo ≥60, rojo <60)
4. Push notification al director si score < umbral configurable (usar `admin-escalation-alerts` como referencia)
5. Guardar histórico en tabla `pulso_score_history (score, calculado_at)` para tendencias

**Archivos a revisar:**
- `src/modules/hermes/views/pulsoView.js` — agregar el widget al header existente
- `supabase/functions/admin-escalation-alerts/index.ts` — patrón de alerta a DIR
- `supabase/functions/send-push/index.ts` — push notifications existentes

---

### 4C — groq como motor de análisis de patrones [PRIORIDAD MEDIA]
**Por qué**: Hoy groq solo embellece texto. Un sistema autónomo real usa IA para detectar patrones que las reglas hardcodeadas no pueden ver.

**Qué construir:**
1. Nueva Edge Function `soi-pattern-analyzer` (cron semanal, lunes 8am)
2. Lee los últimos 7 días de `soi_eventos` agrupados por entidad
3. Llama groq-proxy con prompt de análisis:
   ```
   Analiza estos eventos institucionales de El Sistema Punta Cana de la última semana.
   Identifica patrones preocupantes, tendencias positivas, y recomienda 2-3 acciones concretas.
   Formato JSON: { patrones: [], tendencias: [], recomendaciones: [] }
   ```
4. Guarda resultado en tabla nueva `soi_analisis_semanal`
5. Muestra en pulsoView como sección "Análisis IA de la semana"

---

### 4D — Feedback loop [PRIORIDAD MEDIA]
**Por qué**: El sistema crea tareas pero no sabe si fueron efectivas.

**Qué construir:**
1. Trigger en `tareas_institucionales` cuando `estado` cambia a `completada`
2. Emite evento `tarea.completada` en `soi_eventos` (ya existe el tipo)
3. Edge Function que correlaciona: si tarea nació de R1 (ausencia), verificar si el alumno asistió después
4. Tabla `soi_rule_effectiveness` (rule_type, total_activaciones, resueltas, tasa_exito)
5. Mostrar en rulesView junto al toggle: "R1: 87% efectividad (43/49 casos resueltos)"

---

### 4E — Realtime sub-segundo (reemplazar pg_cron) [PRIORIDAD BAJA]
**Por qué**: pg_cron tiene 10 min de latencia. Para urgencias críticas eso es demasiado.

**Qué construir:**
1. Usar Supabase Database Webhooks (en lugar de pg_cron) para invocar `event-spine-logger` en cada INSERT a `soi_eventos`
2. Configurar en Supabase Dashboard: Database → Webhooks → soi_eventos INSERT → POST a event-spine-logger
3. Mantener pg_cron como fallback (no eliminar)
4. Agregar guard en el consumer: si el evento tiene `created_at` < 30s, procesarlo; si no, ya fue procesado por cron

---

## Cómo iniciar el trabajo (instrucciones para el agente)

```bash
# 1. Directorio de trabajo
cd C:\Users\omare\OneDrive\Documentos\SOI_Sistema_Operativo_Institucional\09_SOI_WEB_PORTAL\sistema-academico-pwa

# 2. Recuperar contexto completo de memoria
# Buscar en engram: mem_search("soi-event-spine soi-event-enrichment soi-pulso-institucional")
# Project: SOI_Sistema_Operativo_Institucional

# 3. Verificar estado de producción
npx supabase db query --linked --file /tmp/check.sql
# (verificar que soi_eventos, hermes_reactive_rules existen)

# 4. Correr tests para confirmar baseline
npx vitest run

# 5. Arrancar Phase 4A: WhatsApp proactivo
# Lanzar /sdd-new soi-whatsapp-padres
```

## Engram topic keys existentes (para recuperar contexto)
- `sdd/soi-event-spine/*` — Phase 1 (explore, proposal, spec, design, tasks, apply-progress, verify-report, archive-report)
- `sdd/soi-event-enrichment/*` — Phase 2
- `sdd/soi-pulso-institucional/*` — Phase 3
- `sdd-init/soi_sistema_operativo_institucional` — stack detection, testing capabilities

## Contacto y contexto organizacional
- **Organización**: El Sistema Punta Cana — ONG educación musical gratuita, Rep. Dominicana
- **Supabase project**: `zmhmdvmyeyswunurcyow`
- **Responder siempre en español**
- **Departamentos válidos**: DIR, ACM, ADM, FIN, LOG, COM, TECNICO, LUT (OPR NO existe)
- **Menores en riesgo**: escalar INMEDIATAMENTE a DIR sin crear tarea automática
