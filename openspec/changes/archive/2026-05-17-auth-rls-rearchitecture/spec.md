# auth-rls-rearchitecture — Especificación Delta

## Propósito

Reparar la cadena de autenticación `auth.users → profiles → maestros` que tiene 5 fallos de consistencia y seguridad, y habilitar el auto-registro de maestros con flujo de aprobación administrativa. La fuente única de verdad para el estado de activación es `profiles.estado`.

---

## Requisitos

### Grupo A — Base de datos (migración SQL)

#### A1. Trigger: auto-crear `maestros` al insertar `profiles` con `rol = 'maestro'`

El sistema DEBE crear automáticamente un registro en la tabla `maestros` cuando se inserte un perfil con `rol = 'maestro'`. El trigger se ejecuta DESPUÉS del insert en `profiles` y copia `user_id` (de `profiles.id`), `email` y `full_name`.

| Escenario | GIVEN | WHEN | THEN |
|-----------|-------|------|------|
| Auto-creación exitosa | `handle_new_user` crea `profiles` con `rol = 'maestro'` | El trigger `on_profile_insert_maestro` se ejecuta | Se crea `maestros` con `user_id = profiles.id`, `correo = profiles.email`, `nombre_completo = profiles.full_name` |
| Perfil no es maestro | `profiles.rol` es `admin` o `user` | El trigger evalúa la condición | NO se crea registro en `maestros` |
| Maestro ya existe | Existe `maestros.user_id` para este usuario | El trigger detecta conflicto por `user_id` | Se omite (ON CONFLICT DO NOTHING) |

#### A2. Migración de datos: backfill `user_id` en maestros existentes

El sistema DEBE actualizar los registros existentes en `maestros` que tengan `user_id IS NULL`, vinculando por `correo` contra `auth.users.email`.

| Escenario | GIVEN | WHEN | THEN |
|-----------|-------|------|------|
| Match por email | `maestros.correo` coincide con `auth.users.email` | Se ejecuta UPDATE de backfill | `maestros.user_id` se actualiza con el UUID de `auth.users` |
| Sin match | No existe `auth.users` con ese email | Se ejecuta UPDATE de backfill | El registro queda con `user_id IS NULL` (se reporta en log) |

#### A3. Helper function `auth.user_profile()` para RLS

El sistema DEBE crear una función `public.user_profile()` que retorne el perfil del usuario autenticado. Las políticas RLS usarán esta función para verificar `estado` y `rol`.

| Escenario | GIVEN | WHEN | THEN |
|-----------|-------|------|------|
| Usuario autenticado con perfil | `auth.uid()` tiene registro en `profiles` | Se llama `public.user_profile()` | Retorna el row completo de `profiles` |
| Usuario sin perfil | `auth.uid()` no existe en `profiles` | Se llama `public.user_profile()` | Retorna `NULL` |
| Usuario no autenticado | `auth.uid()` es `NULL` | Se llama `public.user_profile()` | Retorna `NULL` |

#### A4. Fix `is_admin()`: columna `role` → `rol`

La función `public.is_admin()` DEBE usar la columna `rol` en vez de `role`. Igual para `public.is_teacher()`.

| Escenario | GIVEN | WHEN | THEN |
|-----------|-------|------|------|
| Admin autenticado | `profiles.rol = 'admin'` | Se ejecuta `is_admin()` | Retorna `true` |
| Maestro autenticado | `profiles.rol = 'maestro'` | Se ejecuta `is_admin()` | Retorna `false` |
| Maestro autenticado | `profiles.rol = 'maestro'` | Se ejecuta `is_teacher()` | Retorna `true` |

#### A5. Corregir nombres de tabla en políticas RLS

Las políticas en `004_rls_policies.sql` DEBEN referenciar los nombres reales de tablas:

| Nombre incorrecto | Nombre correcto |
|-------------------|-----------------|
| `students` | `alumnos` |
| `progresos_academicos` | `progresos` |
| `observaciones` | `observaciones_sesion` |

| Escenario | GIVEN | WHEN | THEN |
|-----------|-------|------|------|
| Tabla renombrada | Existe policy con `public.students` | Se aplica migración con `ALTER POLICY ... USING (subquery con alumnos)` | La policy funciona sin error "relation does not exist" |
| Consulta de progresos | Teacher autenticado consulta `progresos` | RLS evalúa policy | No lanza error de tabla inexistente |

#### A6. Fix RLS `class_sessions`: subquery via `maestros.user_id`

La política de `sesiones_clase` (class_sessions) DEBE usar `maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())` en vez de comparar `maestro_id = auth.uid()` directamente.

| Escenario | GIVEN | WHEN | THEN |
|-----------|-------|------|------|
| Teacher ve sus sesiones | Maestro autenticado con `user_id` en `maestros` | Consulta `sesiones_clase` | Ve SOLO las sesiones donde `maestro_id` corresponde a su `maestros.id` |
| Admin ve todas las sesiones | Admin autenticado | Consulta `sesiones_clase` | Ve TODAS las sesiones (policy `is_admin() = true`) |
| Teacher sin user_id | `maestros.user_id IS NULL` | Consulta `sesiones_clase` | No ve ninguna sesión (subquery retorna vacío) |

#### A7. Nueva política RLS: control por `profiles.estado`

El sistema DEBE verificar `profiles.estado = 'activo'` en las políticas RLS. Un perfil con `estado = 'pendiente'` o `estado = 'rechazado'` NO puede leer datos del sistema.

| Escenario | GIVEN | WHEN | THEN |
|-----------|-------|------|------|
| Perfil activo | `profiles.estado = 'activo'` y `rol = 'maestro'` | Teacher ejecuta SELECT en `sesiones_clase` | RLS permite la consulta |
| Perfil pendiente | `profiles.estado = 'pendiente'` | Teacher ejecuta cualquier SELECT | RLS bloquea (0 filas retornadas) |
| Perfil rechazado | `profiles.estado = 'rechazado'` | Teacher ejecuta cualquier SELECT | RLS bloquea (0 filas retornadas) |
| Admin activo | `profiles.estado = 'activo'` y `rol = 'admin'` | Admin ejecuta SELECT | RLS permite (bypass por `is_admin()`) |

---

### Grupo B — Portal Maestros (Frontend)

#### B1. Vista de auto-registro (`registerView.js`)

El Portal Maestros DEBE mostrar un formulario de registro con los campos: nombre completo, correo electrónico, contraseña, confirmación de contraseña, instrumento y una breve reseña. Al enviar, llama a `supabase.auth.signUp()`.

| Escenario | GIVEN | WHEN | THEN |
|-----------|-------|------|------|
| Formulario renderizado | Usuario no autenticado visita Portal Maestros | Ve la pantalla de login | Hay un link / botón "Registrarse como maestro" visible |
| Registro exitoso | Usuario completa todos los campos válidos | Envía el formulario | Se llama `signUp()` → aparece mensaje "Registro exitoso. Esperá la aprobación del administrador." → redirige a login |
| Email ya registrado | Email existe en `auth.users` | Envía el formulario | Error inline "Este correo ya está registrado" |
| Contraseña débil | Contraseña < 6 caracteres | Envía el formulario | Error inline "La contraseña debe tener al menos 6 caracteres" |
| Confirmación no coincide | Password !== Confirm password | Envía el formulario | Error inline "Las contraseñas no coinciden" |
| Error de red | `signUp()` falla por conectividad | Envía el formulario | Error toast "Error al registrarse. Intentá de nuevo." — datos preservados |

#### B2. Navegación registro/login

El loginView DEBE incluir un link a la vista de registro, y la registerView DEBE incluir un link de vuelta al login.

| Escenario | GIVEN | WHEN | THEN |
|-----------|-------|------|------|
| Ir a registro | Usuario en loginView | Click en "Registrarse" | Navega a ruta `register` |
| Volver a login | Usuario en registerView | Click en "Ya tengo cuenta" | Navega a ruta `login` |

---

### Grupo C — Panel Admin (Frontend)

#### C1. Vista de aprobación/rechazo de maestros

El panel admin DEBE mostrar una lista de maestros con `estado = 'pendiente'` y permitir al admin aprobar (`estado = 'activo'`) o rechazar (`estado = 'rechazado'`).

| Escenario | GIVEN | WHEN | THEN |
|-----------|-------|------|------|
| Lista de pendientes | Admin autenticado | Navega a "Aprobación de Maestros" | Tabla con maestros pendientes: nombre, email, instrumento, fecha de registro, botones Aprobar / Rechazar |
| Sin pendientes | No hay maestros con `estado = 'pendiente'` | Admin ve la vista | Mensaje "No hay maestros pendientes de aprobación" |
| Aprobar maestro | Admin hace click en "Aprobar" | Se actualiza `profiles.estado = 'activo'` | Toast de éxito; maestro desaparece de la lista; el teacher ya puede iniciar sesión |
| Rechazar maestro | Admin hace click en "Rechazar" | Se actualiza `profiles.estado = 'rechazado'` | Toast de éxito; maestro desaparece de la lista; el teacher ve error al intentar login |
| Error de red | Admin intenta aprobar/rechazar | Persistence call falla | Error toast; estado no cambia |

---

### Grupo D — API y servicios

#### D1. Fix `crearMaestro()`: incluir `user_id`

La función `crearMaestro()` en `src/modules/maestros/api/maestrosApi.js` DEBE aceptar y persistir `user_id` al crear un maestro desde el panel admin.

| Escenario | GIVEN | WHEN | THEN |
|-----------|-------|------|------|
| Admin crea maestro con usuario existente | Admin selecciona un auth user existente | Envía formulario de creación | `crearMaestro()` inserta `maestros` con `user_id` incluido |
| Admin crea maestro sin vincular usuario | No se selecciona auth user | Envía formulario | `crearMaestro()` inserta `maestros` con `user_id = null` (comportamiento actual, backfill posterior) |

#### D2. Helper function `rlsHelpers.js`

El sistema DEBE exponer funciones auxiliares para que el frontend pueda verificar el estado del perfil actual sin hacer queries manuales a `profiles`.

| Escenario | GIVEN | WHEN | THEN |
|-----------|-------|------|------|
| Verificar estado | Usuario autenticado | Llama `getProfileStatus()` | Retorna `{ estado: 'activo', rol: 'maestro' }` o `null` |
| No autenticado | Sin sesión | Llama `getProfileStatus()` | Retorna `null` |

---

### Grupo E — Migración SQL única

#### E1. Archivo de migración `XXXX_auth_rls_fix.sql`

TODOS los cambios SQL DEBEN estar en UNA sola migración con el siguiente orden:

1. `CREATE OR REPLACE FUNCTION public.user_profile()`
2. Fix `public.get_user_role()`: `role` → `rol` (es la función auxiliar base)
3. Fix `public.is_admin()` y `public.is_teacher()`: usan `get_user_role()` corregida
4. Nuevo trigger `on_profile_insert_maestro`: crea `maestros` row
5. Migración de datos: UPDATE backfill de `maestros.user_id`
6. Renombrar policies existentes (DROP + CREATE con nombres correctos de tablas):
   - `students_*` → políticas sobre `alumnos`
   - `progresos_*` → políticas sobre `progresos`
   - `observaciones_*` → políticas sobre `observaciones_sesion`
7. Nueva policy `sesiones_clase_teacher_access` con subquery
8. Nueva policy sobre `profiles` que verifica `estado`

---

## Criterios de Aceptación

- [ ] **A1**: Al crear un auth user con `raw_user_meta_data.rol = 'maestro'`, se crea automáticamente `profiles` + `maestros` con `user_id` poblado
- [ ] **A3**: `public.user_profile()` retorna el perfil del usuario autenticado
- [ ] **A4**: `is_admin()` retorna `true` para admins, `false` para maestros
- [ ] **A5**: Ninguna policy en `004_rls_policies.sql` referencias tablas inexistentes
- [ ] **A6**: Maestro autenticado ve solo sus `sesiones_clase` (match via `maestros.user_id`)
- [ ] **A7**: Maestro con `estado = 'pendiente'` no puede leer datos del sistema vía RLS
- [ ] **B1**: Formulario de registro en Portal Maestros crea auth user + redirige a login
- [ ] **B2**: Navegación login ↔ register funciona en ambos sentidos
- [ ] **C1**: Admin puede ver pendientes, aprobar y rechazar; los cambios se reflejan en RLS
- [ ] **D1**: `crearMaestro()` acepta `user_id` en el payload
- [ ] **E1**: Migración SQL única ejecutable sin errores
- [ ] Backfill de maestros existentes con `user_id` poblado vía match por email
- [ ] Modo Demo (JSON mocks) sigue funcionando sin cambios
- [ ] Tests existentes pasan (`npm run test:run`)

---

## No Metas (Non-goals)

- NO se reescribe el CRUD de alumnos, clases o asistencias
- NO se modifican columnas existentes en ninguna tabla
- NO se toca el Modo Demo (JSON mocks en `src/assets/data/mocks/`)
- NO se agrega recuperación de contraseña ni 2FA
- NO se modifican los permisos por flag (`puede_registrar_alumnos`, etc.) — esos siguen en capa de aplicación
- NO se cambia la estructura del panel admin Bootstrap existente
- NO se agrega notificación push al aprobar/rechazar maestro (fuera de scope)

---

## Referencias Cruzadas

| Especificación | Relación |
|---------------|----------|
| `openspec/specs/student-registration/spec.md` | No cambia — los permisos por flag se mantienen en capa de aplicación |
| `openspec/specs/teacher-permissions/spec.md` | No cambia — `puede_registrar_alumnos` sigue siendo independiente del estado de activación |
| `supabase/migrations/004_rls_policies.sql` | Archivo modificado — se corrigen nombres de tabla y funciones |
| `supabase/migrations/003_auth_profiles.sql` | Referencia — trigger `handle_new_user` existente se complementa pero NO se modifica |
| `src/modules/maestros/api/maestrosApi.js` | Modificado — `crearMaestro()` acepta `user_id` |
| `src/portal-maestros/auth/maestroAuth.js` | Referencia — usa `maestros.user_id` para login; este spec asegura que siempre esté poblado |
| `src/main-maestros.js` | Referencia — router y shell del Portal Maestros; se agrega ruta `register` |

---

## Escenarios Integrados (End-to-End)

### Happy Path: Teacher se registra → Admin aprueba → Teacher accede

1. Teacher visita Portal Maestros → ve login
2. Click "Registrarse" → completa formulario (nombre, email, password, instrumento)
3. Sistema llama `supabase.auth.signUp()` → trigger `handle_new_user` crea `profiles(estado='pendiente', rol='maestro')`
4. Trigger nuevo `on_profile_insert_maestro` crea `maestros(user_id, correo, nombre_completo)`
5. Teacher ve mensaje "Registro exitoso. Esperá la aprobación del administrador."
6. Admin abre panel → "Aprobación de Maestros" → ve el nuevo maestro en lista de pendientes
7. Admin click "Aprobar" → `profiles.estado = 'activo'`
8. Teacher vuelve a login → ingresa credenciales → `loginMaestro()` busca `maestros.user_id` → encuentra el registro → acceso concedido

### Edge Case: Admin rechaza al teacher

1-6. Igual que happy path
7. Admin click "Rechazar" → `profiles.estado = 'rechazado'`
8. Teacher intenta login → `supabase.auth.signInWithPassword()` funciona (auth) → `loginMaestro()` busca `maestros.user_id` → encuentra el registro pero RLS bloquea todo → sesión se cierra → error "No tenés acceso de maestro en este sistema."

### Edge Case: Email ya existe en auth.users

1. Teacher completa formulario con email existente
2. `supabase.auth.signUp()` retorna error `Email already registered`
3. Formulario muestra error inline "Este correo ya está registrado"
4. Datos del formulario se preservan

### Edge Case: Maestro existente sin `user_id` (backfill)

1. En BBDD hay maestros con `user_id IS NULL` pero con `correo` poblado
2. Migración ejecuta: `UPDATE maestros SET user_id = auth_users.id FROM auth.users WHERE maestros.correo = auth.users.email`
3. Maestros sin match en `auth.users` quedan con `user_id IS NULL`
4. Admin debe vincularlos manualmente o crearles un auth user

### Edge Case: Teacher se registra pero no completa el perfil en el trigger

1. `handle_new_user` inserta `profiles` con `full_name` posiblemente NULL
2. Trigger crea `maestros` con `nombre_completo = NULL`
3. Teacher ve perfil incompleto en Portal Maestros
4. Teacher completa su perfil desde la vista `perfilView` (comportamiento existente)
