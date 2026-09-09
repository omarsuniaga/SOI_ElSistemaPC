# FASE 0 · Hallazgos preliminares (Tareas 0.2 – 0.5)

Fecha: 2026-09-08 · Autor: agente · Estado: **para revisión de Omar**

Este documento acompaña a [`FASE-0_inventario_tablas_vacias.md`](./FASE-0_inventario_tablas_vacias.md).
**Ninguna acción destructiva se ha ejecutado.** Todo lo de abajo es diagnóstico + recomendación.

---

## Tarea 0.2 — Poda: estado

**Bloqueada por diseño.** No se genera ningún `DROP TABLE` hasta que Omar complete las
columnas **Decisión** y **Dueño** del inventario (122 filas).

Cuando el inventario esté completo, el agente producirá:

- `supabase/migrations/<fecha>_fase0_poda_DROP.sql` — solo las marcadas **Eliminar**, precedido de
  `-- BACKUP: pg_dump --schema-only` y con checklist de confirmación. **No se aplica solo.**
- `supabase/migrations/<fecha>_fase0_poda_DEPRECATE.sql` — `COMMENT ON TABLE ... IS '-- DEPRECATED: <razón> 2026-09-XX'`
  para las marcadas **Archivar**.
- Las marcadas **Terminar** no se tocan; entran al roadmap de fases siguientes.

Requisito registrado: **cada DROP necesita confirmación humana explícita y queda en el historial de git antes de aplicarse.**

### Señales que ya trae el inventario para ayudar a decidir

| Señal | Nº tablas | Lectura sugerida |
|---|--:|---|
| `sin referencia` en todo el código | 3 | candidatas fuertes a **Eliminar**: `alumnos_reinscripciones`, `maestro_retiros`*, `service_account_observations`* |
| `solo autogen` (aparece únicamente en `schema_dump.json` / `database.types.ts`) | 51 | feature nunca cableada — probable **Archivar** o **Eliminar** |
| `referenciada` por servicio/vista real | 68 | feature a medio construir — probable **Terminar** (entra al roadmap) |
| `— (sin migración fechada)` | 40 | además de la decisión, **hay que reconciliar** (Tarea 0.5): la tabla existe pero no hay migración versionada que la cree |

\* `maestro_retiros` y `service_account_observations` tienen migración reciente (ago-2026) — pueden ser
features en curso más que basura. Confirmar con el dueño antes de eliminar.

> ⚠️ Límites del análisis de "uso en código": el match es textual (`'tabla'` / `"tabla"` / `.from('tabla')`)
> y la lista de archivos por tabla se truncó a 3. Una tabla marcada `solo autogen` *podría* tener un uso real
> fuera de esos 3 archivos. Antes de un DROP, el agente hará un grep exhaustivo por tabla. Varias marcadas
> `referenciada` lo están solo desde **mocks** (`luteriaTallerMock.js`, `weeklyPlanMock.js`, `clases.json`) —
> eso **no** es uso real de producción.

---

## Tarea 0.3 — Familia `acm_*`

### Qué hay realmente

SOI tiene **tres generaciones** de modelo de planificación académica coexistiendo:

| Generación | Tablas | Filas | Estado |
|---|---|--:|---|
| **1 · Legacy plano** | `planificacion` (0), `plan_clases` (2), `plan_temas` (7), `plan_objetivos` (10), `plan_indicadores` (15), `plan_niveles` (3), `planificacion_nodos` (0), `plantillas_planificacion` (8) | ~50 | Marcadas `DEPRECATED` en comentario de BD o casi vacías. Sin `.from()` real para `planificacion`. |
| **2 · Jerarquía de rutas (ACTIVA)** | `routes` (8) → `route_versions` (9) → `blocks` (8) → `levels` (101) → `nodes` (1120) → `indicators` (4163) → `objetivos` (480) | ~5.900 | **Es el modelo en producción hoy.** Miles de filas, uso intensivo. |
| **3 · `acm_*` — gobernanza de currículo** | `acm_curriculum_sources`, `acm_curriculum_versions`, `acm_weekly_plans`, `acm_weekly_plan_items`, `acm_active_routes`, `acm_teacher_week_adjustments`, `acm_evidence_files` + `planificaciones` (plural, 3), + `academic_plans` (0) | 3 | **0 filas en las 7 `acm_`.** Migración única `20260629_acm_curriculum_governance.sql` (+ `_acm_teacher_week_adjustments.sql`), 2026-06-29. |

> Nota sobre el conteo: el brief menciona "9 tablas `acm_*`". En la BD hay **7** con prefijo `acm_`.
> La misma migración del 2026-06-29 creó además `student_indicator_progress`, `teacher_class_sessions` y
> `teacher_session_indicators` (todas 0 filas) — probablemente esas completan el grupo mental de "9".

### Veredicto del agente (recomendación, no decisión)

`acm_*` **no es un experimento abandonado ni un reemplazo inconcluso de `planificacion`** (generación 1).
Es un intento de añadir una **capa de gobernanza documental** (fuentes de currículo, versiones aprobadas,
planes semanales, ajustes del maestro por semana, evidencias) **por encima** de la jerarquía de rutas
(generación 2, que sigue viva).

Está **parcialmente cableada**: hay código real en
`src/modules/academic-admin/api/academicAdminApi.js`, `src/modules/academic-routes/services/academicService.js`
y `src/modules/planificacion/api/weeklyPlanSupabase.js` que apunta a estas tablas — pero **nunca se pobló**.
Es una feature **detenida a mitad de rollout**, no un cadáver.

**Opciones para Omar:**

1. **Terminar** (si el rollout de gobernanza de currículo sigue en la visión): dejar las 7 `acm_` +
   `academic_plans` + las 3 `teacher_*`/`student_indicator_progress` intactas y meterlas como épica al
   roadmap de la fase siguiente. El código ya existe; falta poblar y activar UI.
2. **Archivar** (si la gobernanza de currículo se pospone > 6 meses): `COMMENT ON TABLE acm_* IS '-- DEPRECATED: rollout de gobernanza de currículo pausado 2026-09'` y quitar el código muerto de los 3 archivos de arriba en una PR aparte.
3. **Eliminar**: no recomendado todavía — el costo de recrear 10 tablas con sus FKs y RLS es alto y el diseño parece sano.

Lo que **sí** conviene resolver ya, independientemente: la **generación 1** (`planificacion`, `plan_*`,
`planificacion_nodos`) está muerta y confunde. Candidata clara a Archivar/Eliminar en la Tarea 0.2.

---

## Tarea 0.4 — Portales-cascarón

### Arquitectura real

Cada portal es un **entry de Vite** (`<portal>.html`) + un bootstrap corto en
`src/portales/<portal>/<portal>.js` que monta módulos de `src/modules/`. "Cascarón" = el bootstrap
es mínimo y/o los módulos que monta no están terminados. **No** significa necesariamente "sin código".

| Portal | Entry HTML | Bootstrap | Módulos que respaldan | Lectura |
|---|---|--:|---|---|
| `calendario` | calendario.html | `src/portales/calendario/` (**131 archivos**) | app dedicada completa | **Real y activo.** |
| `fin` | fin.html / soi-finanzas.html | `src/portales/fin/` (**86 archivos**) | app React dedicada | **Real y activo.** |
| Portal Docente | index.html | `src/portal-maestros/` (dir aparte, grande) | — | **Real y activo.** |
| `adm` | adm.html | `adm.js` (4.5 KB) | `admin-*`, `config`, `programas`… | Bootstrap fino pero módulos existen. **Confirmar cobertura.** |
| `acm` | acm.html | `acm.js` (3.0 KB) | `academic-admin`, `academic-routes`, `planificacion` | Idem. Ligado a la decisión de Tarea 0.3. |
| `inventario` | inventario.html | `inventario.js` + `inventarioDashboardView.js` (~9 KB) | `inventario`, `instrumentos` | Módulos con sustancia. **Confirmar.** |
| `com` | com.html | `com.js` (1.9 KB) | `comunicaciones`, `campanias`, `alianzas` | Bootstrap muy fino. Tablas `campanias_*` casi todas vacías → feature a medio hacer. |
| `luteria` | luteria.html **+ lut.html (duplicado)** | `luteria.js` (1.7 KB) | `luteria`, `luteria-taller` | Módulos existen; tablas `lut_*` vacías (6) pero código real. **Feature construida, sin datos.** |
| `tecnico` | tecnico.html | `tecnico.js` (1.4 KB) | `sistema`, `tool-gateway` | Cascarón. **Confirmar si se activa o se retira.** |
| `simulador` | simulador.html | `simulador.js` (1.6 KB) | `simulador` | El simulador tiene tablas `sim_*` **con datos** (sim_log 125, sim_actores 10…). Bootstrap fino pero backend vivo. |
| `audiciones` | audiciones.html | `audiciones.js` (**554 bytes**) | `audiciones` | **Cascarón casi vacío.** Tabla `audiciones` (0) + `evaluations` (0). Feature no arrancada. |
| — | **`app.html` (0 bytes)** | — | — | **Archivo vacío en la raíz. Retirar.** |

### Discrepancia a resolver con Omar

El brief dice "**8** portales-cascarón de 1-4 archivos cada uno". Necesito **tu lista original** para
mapear 1:1. Mi mejor candidato de los 8: `adm`, `acm`, `com`, `tecnico`, `audiciones`, `simulador`,
`luteria`, `inventario` (+ `app.html` vacío como bonus, + `lut.html` como duplicado de `luteria.html`).

### `portal_catalog` (tabla de navegación, 11 filas, todas `activo=true`)

La navegación **anuncia 11 portales** como activos: SUPERADMIN, ADM, ACM, FIN, CAL, MAE, COM, TEC, LUT, SIM, AUD.
Al menos **COM, TEC y AUD** no tienen implementación a la altura de esa promesa. Decisión por portal
(activar pronto / fusionar / sacar de `portal_catalog` poniendo `activo=false`) — registrar en una columna
nueva del catálogo o en este doc.

---

## Tarea 0.5 — Reconciliar `schema_reference.sql`

### Hallazgo: el archivo está **gravemente desactualizado**

- Ruta real del archivo: **`supabase/migrations/schema_reference.sql`** (no existe `schema_reference.sql` en la raíz;
  sí hay un `docs/database_schema.sql` — otro candidato a fuente de verdad, revisar cuál es el canónico).
- `schema_reference.sql` contiene **65 `CREATE TABLE`**.
- La BD real tiene **247 tablas**.
- ⇒ El archivo refleja **~26%** del esquema. Su cabecera ya avisa: *"This schema is for context only and is not meant to be run."*
- **40 de las 122 tablas vacías no tienen NI migración fechada NI entrada en `schema_reference.sql`** — existen
  solo en la BD (creadas por dashboard de Supabase o en archivos base perdidos). Ejemplos: `calendario`, `protocolos`,
  `minutas`, `wallet_config`, `wallet_movimientos`, `tareas_caja`, `tareas_portales`, `hermes_acciones`,
  `patrocinantes`, `facturas_reparacion`, `accesorios`, `cierres_caja`, `usuario_departamentos`, toda la familia
  `hermes_*` vacía, etc.

### Recomendación

1. **Regenerar** `schema_reference.sql` desde la BD real. Como el MCP no da shell a `pg_dump`, el agente puede
   reconstruir el DDL vía `information_schema` / `pg_catalog` en una migración de solo-lectura, o Omar corre:
   ```bash
   supabase db dump --schema public --file supabase/migrations/schema_reference.sql
   ```
   (requiere `SUPABASE_DB_URL` / login de CLI — más fiable que la reconstrucción del agente).
2. **Definir el canónico**: `supabase/migrations/schema_reference.sql` **o** `docs/database_schema.sql`, no ambos.
3. **Proceso de sincronización** (documentar en `CONTRIBUTING.md` o un `docs/hygiene/schema-sync.md`):
   - script `scripts/check-schema-drift.sh` que compara `schema_reference.sql` contra `supabase db dump` y falla
     si difieren;
   - hook o paso de CI (`.github/workflows/ci.yml`) que lo corre en cada PR que toca `supabase/migrations/`;
   - regla: toda tabla nueva entra por migración fechada, nunca por dashboard.
4. **Criterio de cierre** (del brief): `schema_reference.sql` coincide 100% con el esquema real, verificado por
   un diff automatizado. Ese diff es el entregable de la Tarea 0.5, no solo el archivo regenerado.

---

## Próximo paso (te toca a ti, Omar)

1. Abrí [`FASE-0_inventario_tablas_vacias.md`](./FASE-0_inventario_tablas_vacias.md) (o el `.csv` en Excel/Sheets)
   y llená **Decisión** (Terminar / Archivar / Eliminar) + **Dueño** en las 122 filas.
2. Respondé la discrepancia de la Tarea 0.4 (tu lista de los 8) y el veredicto `acm_*` (opción 1 / 2 / 3).
3. Confirmá quién corre `supabase db dump` para la Tarea 0.5.

Con eso, el agente genera los scripts de poda (revisables, sin auto-aplicar) y el diff de esquema.
