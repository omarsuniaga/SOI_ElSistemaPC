# teacher-permissions Specification

## Purpose

Admin-managed permissions for teachers using a flexible `text[]` array model with RLS protection across ~20 core tables. Supports backward compatibility with legacy boolean flags (`puede_registrar_alumnos`, `puede_inscribir_clases`) through automated mapping in the frontend.

## Requirements

### Requirement: Teacher Permission List (Admin)

The admin panel MUST display all teachers with their permissions status.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| List renders | an authenticated admin | they navigate to "Permisos de Maestros" | a table renders all teachers with permission toggles |
| Empty roster | no teachers exist | the admin views the page | an empty-state message shows "No hay maestros registrados" |

### Requirement: Toggle Teacher Permission (Admin)

Admin MUST toggle permissions per teacher. Each change MUST update the `permisos` text array and record `concedido_por` (admin UUID) and `updated_at` timestamp.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Grant permission | admin on permissions table | they toggle off → on | toggle switches immediately; `permisos` array is updated; audit records admin ID |
| Revoke permission | teacher has active permission | admin toggles on → off | toggle switches immediately; key is removed from `permisos`; audit records revoker ID |

### Requirement: SQL Helper `maestro_actual()`

The system DEBE crear una función `maestro_actual()` en schema `public` que retorne el `id` de la tabla `maestros` correspondiente al `auth.uid()` actual.

- **Tipo**: `STABLE`, `LANGUAGE sql`, `RETURNS uuid`
- **NO** usar `SECURITY DEFINER`
- Retorna `NULL` si `auth.uid()` no tiene registro vinculado en `maestros`

### Requirement: SQL Helper `tiene_permiso(p_permiso text)`

The system DEBE crear una función `tiene_permiso(text)` que verifique membresía en el arreglo `permisos_maestros.permisos` para el `maestro_actual()`.

### Requirement: Migración de permisos booleanos a arreglo

El sistema DEBE migrar `permisos_maestros` agregando columnas `permisos text[]` y `solicitudes text[]`, y poblar `permisos` desde los booleanos existentes:
- `puede_registrar_alumnos = true` → agrega `'alumnos:create'`
- `puede_inscribir_clases = true` → agrega `'clases:enroll'`

### Requirement: RLS protection for Teacher Tables (P0, P1, P2)

El sistema DEBE habilitar RLS y crear políticas basadas en pertenencia (maestro_id o clase_id) en ~20 tablas de uso diario del maestro.

| Priority | Tables | Behavior |
|----------|--------|----------|
| P0 (High) | `plan_indicadores`, `plan_objetivos`, `plan_niveles`, `plan_temas`, `alumnos_clases`, `asistencias`, `planificaciones`, `plan_clases`, `planificacion_nodos` | Visibilidad restringida al maestro propietario/asignado. Escritura requiere `tiene_permiso()`. |
| P1 (Core) | `alumnos`, `clases`, `sesiones_clase`, `horarios`, `contenidos_sesion` | Acceso basado en asignación de clases. |
| P2 (Sec) | `ausencias`, `justificaciones`, `progresos`, `observaciones_sesion`, `observaciones_alumnos`, `planificacion` | Acceso basado en pertenencia de alumnos/sesiones. |

### Requirement: Portal Permission Mapping

Portal Maestros MUST check `permisoService.getPermisos()` at render time. The service MUST map the `permisos` array keys to the boolean interface used by the UI components.

| Array Key | Boolean Flag |
|-----------|--------------|
| `alumnos:create` | `puede_registrar_alumnos` |
| `clases:enroll` | `puede_inscribir_clases` |
| `planificacion:write` | `puede_planificar` |
| `asistencias:write` | `puede_asistir` |

## Catálogo de Claves de Permiso

| Clave | Descripción |
|-------|-------------|
| `alumnos:create` | Registrar nuevos alumnos |
| `clases:enroll` | Inscribir alumnos en clases |
| `planificacion:write` | Crear/editar planificaciones |
| `asistencias:write` | Registrar asistencias |

## Acceptance Criteria

- [ ] Admin permission list supports array-based permissions
- [ ] Every permission change records `concedido_por` + `updated_at`
- [ ] ~20 teacher tables protected by RLS membership policies
- [ ] Teacher sees registration UI only when they have the required key in their array
- [ ] `maestro_actual()` correctly resolves UUID in RLS context
- [ ] Full flow works in Demo mode (mock data)
