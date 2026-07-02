# Brief de implementación — Flujo de Necesidades (Maestro → ACM → FIN)

> Documento autocontenido para un agente que implementa esta feature **en frío**.
> Diseño aprobado por el usuario. También en Engram: topic `architecture/necesidades-flow`.

## 0. Contexto del proyecto

- **Repo**: `omarsuniaga/SOI_ElSistemaPC` (default branch `master`, **sin branch protection**).
- **Stack**: PWA vanilla JS + Vite (multi-entry: `maestros.html`, `acm.html`, `fin.html`, `adm.html`, etc.). Backend **Supabase** (Postgres + Auth + RLS + Edge Functions). Tests con **Vitest**.
- **Proyecto Supabase (prod)**: `SOI_DDBB_EL_SISTEMAPC`, id `zmhmdvmyeyswunurcyow` (us-east-2). La org está en **plan Free → NO hay branching de Supabase**; las migraciones se validan **directo contra el proyecto real** (son aditivas/idempotentes).
- **Portal maestros**: `src/portal-maestros/`, entry `src/main-maestros.js`.

### Convenciones OBLIGATORIAS del repo
1. **Data-layer**: todo acceso a datos va por `api/<x>Api.js` que rutea `config.isDemoMode ? mock : supabase` (`<x>Mock.js` / `<x>Supabase.js`). NO llamar `supabase` directo desde vistas.
2. **Migraciones**: namespaced, idempotentes (`CREATE ... IF NOT EXISTS`, `CREATE OR REPLACE`, `DROP POLICY IF EXISTS`). **Validar contra la DB real ANTES del PR** (aplicar + smoke test + `get_advisors`).
3. **CSS**: usar tokens `pm-*` existentes del portal maestros; nada de sistemas paralelos.
4. **Commits**: conventional commits, en español o inglés, **SIN atribución de IA / sin Co-Authored-By**.
5. **Tests**: el env de Supabase para tests va en `.env.test` (dummy), NO en secrets. Vitest lee `.env` files, no `process.env` del workflow.
6. **CI**: al fallar tests tras cambios, distinguir SIEMPRE *test stale* vs *bug real* — no "arreglar a verde" ocultando bugs.

## 1. Estado ACTUAL (lo que ya existe)

### Tabla `public.solicitudes_necesidades` (ya creada, 0 filas)
Columnas: `id (uuid)`, `maestro_id (uuid)`, `maestro_nombre (text)`, `tipo_necesidad (text)`, `categoria (text)`, `titulo (text)`, `descripcion (text)`, `prioridad (text)`, `cantidad (int)`, `area (text)`, `observaciones (text)`, `estado (text)`, `respuesta_admin (text)`, `fecha_solicitud (date)`, `created_at (timestamptz)`, `updated_at (timestamptz)`.

### RLS actual (aplicada en migración `20260702_solicitudes_necesidades_rls_hardening.sql`)
- `solic_select_own_or_admin` (SELECT): dueño (`maestro_id IN (select id from maestros where user_id = auth.uid())`) o admin (`profiles.rol='admin'`).
- `solic_insert_own` (INSERT): `maestro_id` propio.
- `solic_update_admin` (UPDATE): solo admin.
- `solic_update_own_cancel` (UPDATE): maestro cancela lo suyo `pendiente → cancelada`.
> ⚠️ Estas RLS son **admin-only** y hay que **REEMPLAZARLAS** por el modelo por-departamento (ver Fase 1).

### Frontend actual (a refactorizar)
`src/portal-maestros/views/perfilView.js`:
- `renderSolicitudesNecesidades(container, maestro)` (~línea 269): sección "Necesidades" con botón "Solicitar" + historial.
- `openNuevaSolicitudModal(maestro)` (~línea 301): modal con form. **INSERT directo a supabase** (~línea 403) — anti-patrón a corregir.
- `_loadSolicitudesHistorial(maestroId)` (~línea 442): **SELECT directo a supabase** — anti-patrón.

### Vista admin actual
`src/modules/pedagogico/views/solicitudesAdminView.js`: lee/actualiza `solicitudes_necesidades` (también directo a supabase). Reubicar/duplicar lógica hacia ACM.

### Backbone Hermes (reusar para el ruteo)
- `public.soi_process_contracts` (process_code PK, task_templates jsonb, department_owner, closure_criteria…).
- `public.hermes_process_cases` (id, process_code, status, entity_type, entity_id…). Su `id` se usa como `correlation_id`.
- `public.tareas_institucionales` (departamento enum `soi_departamento` con ACM/FIN/LUT/etc., `correlation_id`, `process_code`, `estado`, `prioridad`…).
- RPCs: `fn_hermes_start_process_case(p_process_code, ...)` abre caso + instancia tareas; `fn_hermes_close_process_case(...)`.
- Enum `soi_departamento` incluye ACM y FIN; enum `tarea_institucional_prioridad` (baja/media/alta/critica).

### GOTCHAS importantes
- **`solicitudes.maestro_id` = `maestros.id` (row id), NO `auth.uid()`.** Las RLS mapean vía `maestros.user_id = auth.uid()`.
- Admin/rol se valida en `public.profiles` (`profiles.id = auth.uid()`, `profiles.rol`). Los departamentos de un usuario: revisar cómo se determina el rol ACM/FIN (ver `permisoService.js` y `profiles`/`maestros`; puede requerir un campo de departamento — **confirmar con el usuario si no existe**).

## 2. Diseño aprobado (HÍBRIDO)

- `solicitudes_necesidades` sigue siendo la **tabla de datos**, + un `correlation_id` que la vincula a un **caso Hermes** que rutea ACM→FIN (colas por departamento vía `tareas_institucionales.departamento` + `correlation_id`).
- **Máquina de estados**: `pendiente → pre_aprobada_acm | rechazada_acm → en_presupuesto → presupuestada → aprobada | rechazada → comprada → entregada` (+ `cancelada` por el maestro).
- **Formulario condicional**: `tipo=accesorio` → `link_tienda` (URL obligatoria, da costo/specs); `tipo=material` → detalles escritos; otros → descripción.
- **Badges (3 lados)**: ACM (por pre-aprobar), FIN (por presupuestar), Maestro (respuestas a lo suyo).

## 3. Fases de implementación

### Fase 1 — DB (migración + validar en prod)
- `ALTER TABLE solicitudes_necesidades ADD COLUMN IF NOT EXISTS`: `correlation_id uuid`, `link_tienda text`, `costo_estimado numeric(10,2)`, `presupuesto numeric(10,2)`, `departamento_actual text`, `pre_aprobada_por uuid`, `presupuestado_por uuid`.
- Actualizar el CHECK de `estado` a los nuevos valores (drop + re-add constraint).
- **Reemplazar RLS** por modelo por-departamento:
  - SELECT: dueño OR ACM OR FIN OR admin.
  - INSERT: dueño.
  - UPDATE: ACM cuando `estado IN ('pendiente')` (pre-aprobar/rechazar); FIN cuando `estado IN ('en_presupuesto','presupuestada')`; maestro cancela `pendiente→cancelada`; admin override.
  - **Determinar cómo se identifica un usuario ACM/FIN** (campo departamento en profiles/maestros, o tabla de roles). Confirmar con el usuario.
- Contrato Hermes: seed en `soi_process_contracts` (ej. `process_code='ACM-NEC'`) con `task_templates` para ACM (pre-aprobación) y escalado a FIN. RPC o lógica para: al insertar solicitud → `fn_hermes_start_process_case('ACM-NEC', entity_type='solicitud', entity_id=solicitud.id, ...)` y guardar el case id como `correlation_id`.
- **Validar**: aplicar a `zmhmdvmyeyswunurcyow`, smoke test (insertar solicitud → verificar caso+tarea ACM creados; transiciones de estado con distintos roles respetan RLS), `get_advisors` security sin errores nuevos. Guardar el `.sql` en `supabase/migrations/`.

### Fase 2 — Data-layer
- Crear `src/portal-maestros/api/solicitudesNecesidadesApi.js` + `solicitudesNecesidadesMock.js` + `solicitudesNecesidadesSupabase.js` (patrón `config.isDemoMode`).
- Funciones: `crearSolicitud`, `listarPorMaestro`, `listarPorDepartamento(dep, estados)`, `preAprobar`, `rechazar`, `escalarAFin`, `cargarPresupuesto`, `resolver`, `cancelar`, `contarPendientes(dep)`, `contarNovedadesMaestro(maestroId, desde)`.
- Tests en `__tests__/` (mock). Recordar `.env.test`.

### Fase 3 — Maestro (perfilView)
- Refactor: reemplazar los supabase directos por el api de Fase 2.
- Form **condicional** (accesorio→link obligatorio / material→detalles).
- Historial con **estados visibles (timeline)**, mostrar `respuesta_admin`/`presupuesto`, botón **cancelar** (solo pendiente).

### Fase 4 — Portal ACM
- Vista cola de pre-aprobación (solicitudes `pendiente`): aprobar → `pre_aprobada_acm` + escalar (`en_presupuesto` + tarea FIN vía Hermes) / rechazar.
- **Badge** con `contarPendientes('ACM')` en el nav de `acm.html`.

### Fase 5 — Portal FIN
- Vista cola de presupuesto (`en_presupuesto`): cargar `presupuesto`/`costo_estimado` → `presupuestada` → `aprobada`/`rechazada`.
- **Badge** con `contarPendientes('FIN')` en el nav de `fin.html`.

### Fase 6 — Badge maestro
- En "Necesidades" del perfil: badge cuando hay solicitudes con respuesta/estado nuevo desde el último "visto" (guardar last-seen en localStorage por maestro).

## 4. Criterios de aceptación
- Un maestro solo ve/gestiona lo suyo (RLS verificada, no client-side only).
- ACM pre-aprueba y escala; FIN presupuesta; ningún maestro puede auto-aprobarse (RLS).
- Accesorio exige link de tienda; material exige detalles.
- Los 3 badges reflejan conteos reales.
- Data-layer sin supabase directo en vistas; tests verdes; CI verde (`.env.test`).
- Migraciones validadas en prod antes del PR.

## 5. Entregables
- Migración(es) SQL validada(s) en prod.
- Data-layer + tests.
- Cambios en perfilView (maestro) + vistas ACM y FIN.
- PRs encadenados ≤ 400 líneas por slice (una fase por PR idealmente), cada uno con build+tests verdes.
