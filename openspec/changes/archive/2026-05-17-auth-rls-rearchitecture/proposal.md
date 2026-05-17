# Propuesta: Reestructuración de Autenticación RLS (auth-rls-rearchitecture)

## Intent

La cadena `auth.users → profiles → maestros` tiene 5 fallos: (1) no hay trigger que cree `maestros.user_id` al registrarse un teacher, (2) políticas RLS referencian tablas inexistentes (`students`, `progresos_academicos`, `observaciones`), (3) `is_admin()` busca columna `role` en vez de `rol`, (4) RLS de `class_sessions` compara `maestro_id` contra `auth.uid()` en vez de subquery contra `maestros`, (5) no existe vista de registro en Portal Maestros. El objetivo es habilitar auto-registro seguro de maestros con aprobación del admin y reparar la seguridad RLS.

## Scope

### In Scope
- Nuevo trigger SQL: al insertar `profiles` con `rol = 'maestro'`, crear `maestros` con `user_id`
- Corrección de nombres de tabla en `004_rls_policies.sql` (`students`→`alumnos`, `progresos_academicos`→`progresos`, `observaciones`→`observaciones_sesion`)
- Fix `is_admin()`: cambiar `role` por `rol`
- Fix RLS `class_sessions`: `maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())`
- Fix `crearMaestro()`: incluir `user_id` al crear desde admin
- Vista `registerView.js` en Portal Maestros (auto-registro)
- UI de aprobación/rechazo en Admin (cambiar `profiles.estado`)
- Helper function `auth.user_profile()` para RLS

### Out of Scope
- CRUD existente (alumnos, clases, asistencias)
- Modelo de datos (no se agregan/quitan columnas)
- Modo Demo (JSON mocks)
- Recuperación de contraseña ni 2FA

## Capabilities

### New Capabilities
- `teacher-self-registration`: Auto-registro de maestros con flujo registro → pendiente → aprobación. Incluye trigger de sincronización, RLS corregidas, helper function, y UI en ambos portales.

### Modified Capabilities
None — `teacher-permissions` y `student-registration` no cambian su comportamiento especificado. Los permisos por flag se mantienen en capa de aplicación.

## Approach

**Flujo completo**: Teacher registra desde Portal Maestros (`supabase.auth.signUp()`) → `handle_new_user` crea `profiles(estado=pendiente, rol=maestro)` → **nuevo trigger** crea `maestros(user_id)` → Admin aprueba desde UI cambiando `profiles.estado=activo` → RLS permite acceso.

**Patrón RLS**: Helper function `auth.user_profile()` expone el perfil actual. Las policies usan subqueries: `maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())`. Una sola migración SQL corrige todas las policies y agrega el trigger.

**Approval unificado**: `profiles.estado` es la fuente única de verdad (`pendiente | activo | rechazado`). No se necesita `maestros.activo` para control de acceso.

## Affected Areas

| Area | Impact |
|------|--------|
| `supabase/migrations/*_auth_rls_fix.sql` | New — trigger, RLS fixes, helper |
| `src/modules/maestros/api/crearMaestro.js` | Modified — agregar `user_id` |
| `src/portal-maestros/views/registerView.js` | New — formulario auto-registro |
| `src/admin/views/teacherApprovalView.js` | New — UI aprobación/rechazo |
| `src/lib/supabase/rlsHelpers.js` | New — helper functions RLS |

## Riesgos

| Riesgo | Prob. | Mitigación |
|--------|-------|------------|
| Maestros existentes sin `user_id` | Alta | Migración UPDATE vinculando `maestros.email` con `auth.users.email` |
| RLS nueva demasiado restrictiva bloquea login | Media | Probar en staging; tener query de respaldo sin RLS |
| Tests Vitest sin conexión a Supabase real | Media | Mock de `rlsHelpers` para unit tests; integración separada |

## Rollback

Revertir el merge commit. La migración es aditiva (nuevo trigger, nuevas policies, corrección de nombres). No destruye datos. Si hay maestros migrados con `user_id` incorrecto, revertir también la migración de datos por email.

## Dependencies

- Proyecto Supabase con migrations habilitadas
- Trigger `handle_new_user` existente (se complementa, no se modifica)

## Success Criteria

- [ ] Teacher auto-registrado aparece con `estado = pendiente` en admin
- [ ] Admin aprueba → teacher puede iniciar sesión y ve su portal
- [ ] Admin rechaza → teacher no puede iniciar sesión
- [ ] `is_admin()` retorna `true` para admins, `false` para maestros
- [ ] RLS `class_sessions` muestra solo sesiones del teacher autenticado
- [ ] Mock/Demo mode sigue funcionando sin cambios
- [ ] Tests existentes pasan (`npm run test:run`)
