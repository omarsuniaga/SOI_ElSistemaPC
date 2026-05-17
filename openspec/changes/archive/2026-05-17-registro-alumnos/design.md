# Design: Teacher-Authorized Student Registration

## Technical Approach

New `permisos` module following the DataAdapter pattern (alumnos as reference) + portal registration form + conditional navigation. Admin grants boolean flags per teacher; portal checks flags at render time. Mock-first: entire flow works in demo mode.

## Architecture Decisions

### Decision: Boolean flags over RBAC

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Full RBAC (roles + permissions tables) | Flexible but overengineered for 2 flags | **Rejected** |
| Two boolean columns on `permisos_maestros` | Simple queries, trivial audit, upgradable | **Chosen** |

### Decision: Application-level checks, no RLS

| Option | Tradeoff | Decision |
|--------|----------|----------|
| RLS policies on `permisos_maestros` | Adds complexity, auth dependency at DB layer | **Rejected** |
| `permisoService.js` renders check in portal | Simpler, fail-closed (default false), same security | **Chosen** |

### Decision: permisoService.js uses DataAdapter

Reuses `config.isDemoMode` to dispatch between mock and Supabase. The service is a thin wrapper — `getPermisos(maestroId)` → `{ puede_registrar_alumnos, puede_inscribir_clases }`.

## Data Flow

### Registration Flow (portal)

```
registroAlumnoView.tsx
  │
  ├─ on mount
  │   └─ permisoService.getPermisos(maestroId)
  │       ├─ mock → permisosMock.json (in-memory)
  │       └─ supabase → permisos_maestros table
  │       └─ returns { puede_registrar_alumnos, puede_inscribir_clases }
  │
  ├─ form submit
  │   └─ validateAll() → client-side
  │   └─ alumnosApi.crearAlumno(data)  → dispatcher
  │       ├─ mock → array push + generate ID
  │       └─ supabase → INSERT alumnos
  │
  └─ optional: enroll in class
      └─ (future TBD: alumnos_clases INSERT via existing API)
```

### Permission Toggle Flow (admin)

```
permisosView
  │
  ├─ load → permisosApi.obtenerPermisos() → table of all maestros + flags
  │       ├─ mock → join maestrosMock + permisosMock
  │       └─ supabase → LEFT JOIN maestros ON permisos_maestros
  │
  └─ toggle switch → permisosApi.actualizarPermiso(maestroId, campo, valor)
      ├─ mock → update in-memory array
      └─ supabase → UPSERT permisos_maestros
      └─ optimistic update (flip immediately, rollback on error)
```

## File Changes

### New Files

| File | Action | Description |
|------|--------|-------------|
| `src/modules/permisos/api/permisosApi.js` | Create | Dispatcher — delegates to mock or supabase |
| `src/modules/permisos/api/permisosMock.js` | Create | In-memory store with delay(), upsert semantics |
| `src/modules/permisos/api/permisosSupabase.js` | Create | Supabase queries (SELECT, UPSERT) |
| `src/modules/permisos/models/permiso.model.js` | Create | Validation class for permiso data |
| `src/modules/permisos/views/permisosView.js` | Create | Admin Bootstrap table + toggle switches |
| `src/modules/permisos/hooks/usePermisos.js` | Create | Reactivity helper (following useAlumnos pattern) |
| `src/modules/permisos/permisos.router.js` | Create | Route registration (router.register) |
| `src/modules/permisos/index.js` | Create | Public exports for MODULES_REGISTRY |
| `src/portal-maestros/services/permisoService.js` | Create | Permission check service (DataAdapter-aware) |
| `src/portal-maestros/views/registroAlumnoView.js` | Create | Registration form (Apple design pattern) |
| `src/assets/data/mocks/permisos.json` | Create | Mock permission data for demo mode |
| `supabase/migrations/20260516_permisos_maestros.sql` | Create | DB migration for new table |

### Modified Files

| File | Action | Description |
|------|--------|-------------|
| `src/main.js` | Modify | Add `permisos` to MODULES_REGISTRY and NAV_GROUPS |
| `src/main-maestros.js` | Modify | Add `registrar-alumno` route, view container, nav item (conditional) |
| `src/assets/data/mocks/alumnos.json` | Modify | Ensure mock supports schema expected by form (add any missing fields) |

## Interfaces / Contracts

### permisosApi

```js
// Dispatcher
export const obtenerPermisos = () => getApi().obtenerPermisos()
export const obtenerPermisoPorMaestro = (maestroId) => getApi().obtenerPermisoPorMaestro(maestroId)
export const actualizarPermiso = (maestroId, cambios) => getApi().actualizarPermiso(maestroId, cambios)
// cambios: { puede_registrar_alumnos?, puede_inscribir_clases? }
```

### permisoModel.validate()

```js
class Permiso {
  constructor(data)
  validate() // returns string[] of errors
  toJSON()
}
```

### permisoService (portal)

```js
// Returns { puede_registrar_alumnos: boolean, puede_inscribir_clases: boolean }
export async function getPermisos(maestroId)
// Fail-closed: returns { false, false } on error
```

### Permissions DB row shape

```sql
CREATE TABLE permisos_maestros (
  maestro_id           UUID PRIMARY KEY REFERENCES maestros(id),
  puede_registrar_alumnos BOOLEAN DEFAULT false,
  puede_inscribir_clases  BOOLEAN DEFAULT false,
  concedido_por        UUID REFERENCES maestros(id),
  creado_en            TIMESTAMPTZ DEFAULT now(),
  actualizado_en       TIMESTAMPTZ DEFAULT now()
);
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       main.js (Admin)                        │
│  MODULES_REGISTRY ──► permisos ──► registerRoutesPermisos()  │
│  NAV_GROUPS (Sistema) ──► "Permisos" nav item                │
└───────────────────────┬─────────────────────────────────────┘
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
┌──────────────────┐     ┌──────────────────────────┐
│ permisosView.js   │     │   src/modules/permisos/   │
│ (Bootstrap table  │     │   api/permisosApi.js       │
│  + toggles)       │────►   ├── permisosMock.js       │
└──────────────────┘     │   └── permisosSupabase.js   │
                         └──────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   main-maestros.js (Portal)                   │
│  router.on('registrar-alumno', ...)                          │
│  _renderView('registrar-alumno')                              │
│  Conditional nav: "Registrar Alumno" (only if permiso true)   │
└───────────────────────┬─────────────────────────────────────┘
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
┌──────────────────┐  ┌─────────────────┐  ┌───────────────┐
│ permisoService.js │  │registroAlumno   │  │ alumnosApi.js  │
│ getPermisos(id)   │  │View.js          │──► crearAlumno() │
│ (DataAdapter)     │  │(Apple card      │  └───────────────┘
└──────────────────┘  │ form + validate) │
                      └─────────────────┘
```

## Sequence Diagram: Student Registration (Portal)

```
Teacher                    registroAlumnoView        permisoService       alumnosApi         alumnosMock/Supabase
  │                              │                       │                    │                      │
  │  navigate('registrar-alumno')│                       │                    │                      │
  │ ───────────────────────────► │                       │                    │                      │
  │                              │ getPermisos(maestroId)│                    │                      │
  │                              │ ───────────────────►  │                    │                      │
  │                              │                       │ ──► dispatch ──►  │                      │
  │                              │  { puede_registrar:   │                    │                      │
  │                              │    true }             │                    │                      │
  │                              │ ◄──────────────────── │                    │                      │
  │                              │                       │                    │                      │
  │                              │ Render form + class   │                    │                      │
  │                              │ selector (mis clases) │                    │                      │
  │                              │                       │                    │                      │
  │  Fill form + submit          │                       │                    │                      │
  │ ───────────────────────────► │                       │                    │                      │
  │                              │ client-side validate  │                    │                      │
  │                              │ crearAlumno(payload)  │                    │                      │
  │                              │ ───────────────────────────────────────►  │                      │
  │                              │                       │                    │ INSERT alumnos +       │
  │                              │                       │                    │ alumnos_clases         │
  │                              │ ◄── alumno creado ────│                    │                      │
  │                              │                       │                    │                      │
  │  Toast: "Alumno registrado"  │                       │                    │                      │
  │ ◄─────────────────────────── │                       │                    │                      │
  │  Redirect to hoy / clase     │                       │                    │                      │
```

## Conditional Nav Logic (Portal)

In `main-maestros.js`, after shell render but before registering routes:

```js
const permisos = await getPermisos(maestroId)
if (permisos.puede_registrar_alumnos) {
  // Add nav item to MAESTRO_TABS or a secondary dropdown
  // Register route: router.on('registrar-alumno', ...)
}
```

Implementation detail: rather than modifying the static `MAESTRO_TABS` array (which is used in the shell template), use a dedicated button rendered by the view or a separate nav element. The simplest approach: add a fixed button in the portal shell header/sidebar that only renders when the maestro has permission.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `permisoModel.validate()` | Vitest — mock data permutations |
| Unit | `permisosMock.js` CRUD ops | Vitest — create, read, update permissions |
| Unit | `permisoService.getPermisos()` fail-closed | Mock API throws, assert default `{false, false}` |
| Integration | Admin toggles permission → API called | Vitest — spy on `actualizarPermiso`, assert payload matches toggle state |
| Manual | Portal registration flow | Demo mode: open browser, toggle permission, navigate portal, submit form |

## Migration / Rollout

No data migration required. `permisos_maestros` is new table with no existing dependencies. Rollback: `git revert` merge commit, optional `DROP TABLE permisos_maestros` SQL.

## Component Tree

```
Admin Side
└── permisosView (Bootstrap)
    ├── Loading state (spinner)
    ├── Table rows (maestro | email | toggles | actions)
    └── Error state (retry button)

Portal Side
└── registroAlumnoView (Apple Design)
    ├── Hero / header section
    ├── Form section (card-apple)
    │   ├── nombre_completo [input-apple]
    │   ├── fecha_nacimiento [input-apple type=date]
    │   ├── instrumento_principal [input-apple]
    │   ├── representante_nombre [input-apple]
    │   ├── representante_tlf [input-apple type=tel]
    │   ├── representante_cedula [input-apple]
    │   ├── correo_representante [input-apple type=email]
    │   └── direccion [textarea-apple]
    ├── Class selector (dropdown, teacher's classes only)
    ├── Validation summary (inline errors per field)
    └── Submit button [btn-apple-primary]
        └── Loading state during API call
```

## Open Questions

- [ ] Class enrollment on registration: should it be optional or mandatory? If optional, do we enroll via existing `alumnos_clases` API or inline in the form?
