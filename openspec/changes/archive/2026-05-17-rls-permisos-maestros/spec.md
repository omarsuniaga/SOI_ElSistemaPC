# Especificación: RLS + Permisos Flexibles para Maestros

## Propósito

Proteger las ~20 tablas de uso diario del maestro mediante políticas RLS basadas en pertenencia (maestro_id, clase_id), y migrar el modelo de permisos de columnas booleanas fijas a un arreglo `text[]` extensible.

---

## Requerimientos

### R1: Helper `maestro_actual()`

El sistema DEBE crear una función `maestro_actual()` en schema `public` que retorne el `id` de la tabla `maestros` correspondiente al `auth.uid()` actual.

- **Tipo**: `STABLE`, `LANGUAGE sql`, `RETURNS uuid`
- **NO** usar `SECURITY DEFINER` — no necesita bypassear RLS en `maestros`
- Retorna `NULL` si `auth.uid()` no tiene registro vinculado en `maestros`

#### Escenario: Maestro autenticado existe

- DADO un usuario autenticado con `id` en `auth.users` vinculado a un registro en `maestros`
- CUANDO se invoca `maestro_actual()`
- ENTONCES retorna el `maestros.id` correspondiente

#### Escenario: Auth anónimo o sin registro

- DADO un usuario NO autenticado, O autenticado sin registro en `maestros`
- CUANDO se invoca `maestro_actual()`
- ENTONCES retorna `NULL`

---

### R2: Helper `tiene_permiso(p_permiso text)`

El sistema DEBE crear una función `tiene_permiso(text)` que verifique membresía en el arreglo `permisos_maestros.permisos` para el `maestro_actual()`.

#### Escenario: Permiso concedido

- DADO un maestro con permiso `'alumnos:create'` en su arreglo `permisos`
- CUANDO se invoca `tiene_permiso('alumnos:create')`
- ENTONCES retorna `TRUE`

#### Escenario: Permiso no concedido

- DADO un maestro sin `'clases:enroll'` en su arreglo `permisos`
- CUANDO se invoca `tiene_permiso('clases:enroll')`
- ENTONCES retorna `FALSE`

#### Escenario: Maestro sin registro en `permisos_maestros`

- DADO un maestro autenticado que NO tiene fila en `permisos_maestros`
- CUANDO se invoca `tiene_permiso(…)`
- ENTONCES retorna `FALSE` (no lanza error)

---

### R3: Migración de permisos booleanos a arreglo

El sistema DEBE migrar `permisos_maestros` agregando columnas `permisos text[]` y `solicitudes text[]`, y poblar `permisos` desde los booleanos existentes:

- `puede_registrar_alumnos = true` → agrega `'alumnos:create'`
- `puede_inscribir_clases = true` → agrega `'clases:enroll'`
- Si ambos son `false`, `permisos` queda como `ARRAY[]::text[]`

La migración NO DEBE eliminar las columnas booleanas (fase de transición).

#### Escenario: Migración completa

- DADO un registro con `puede_registrar_alumnos=true` y `puede_inscribir_clases=false`
- CUANDO ejecuta la migración
- ENTONCES `permisos = ARRAY['alumnos:create']`; columnas booleanas preservadas

#### Escenario: Sin permisos previos

- DADO un registro con ambos booleanos en `false` o `NULL`
- CUANDO ejecuta la migración
- ENTONCES `permisos = ARRAY[]::text[]`

---

### R4: Índices para RLS

El sistema DEBE crear índices en `permisos_maestros(maestro_id)` y en todas las columnas FK usadas en subconsultas RLS.

#### Tablas priorizadas para índices

| Tabla | Columna |
|-------|---------|
| `permisos_maestros` | `maestro_id` |
| `planificaciones` | `maestro_id` |
| `alumnos_clases` | `clase_id`, `alumno_id` |
| `clases` | `maestro_id` |
| `horarios` | `clase_id` |
| `sesiones_clase` | `clase_id` |
| `asistencias` | `alumno_clase_id` |
| `plan_clases` | `planificacion_id` |

---

### R5: RLS en tablas P0 (alta prioridad)

El sistema DEBE habilitar RLS y crear políticas en estas 9 tablas:

`plan_indicadores`, `plan_objetivos`, `plan_niveles`, `plan_temas`, `alumnos_clases`, `asistencias`, `planificaciones`, `plan_clases`, `planificacion_nodos`

| Política | Comportamiento |
|----------|----------------|
| SELECT | Fila visible si pertenece al `maestro_actual()` vía cadena clase/alumno |
| INSERT | Requiere `tiene_permiso(permiso_correspondiente)` = TRUE |
| UPDATE | Misma verificación que INSERT |
| DELETE | NO habilitada para `authenticated` |

#### Escenario: Teacher ve solo sus planificaciones

- DADO un maestro con id `M1` que creó planificaciones
- CUANDO ejecuta `SELECT * FROM planificaciones`
- ENTONCES solo ve filas donde `maestro_id = M1`

#### Escenario: Teacher NO ve datos de otro maestro

- DADO un maestro `M1` y planificaciones de `M2`
- CUANDO ejecuta `SELECT * FROM planificaciones`
- ENTONCES las filas de `M2` NO aparecen en resultados

#### Escenario: Teacher sin clases, consulta `alumnos_clases`

- DADO un maestro sin clases asignadas
- CUANDO ejecuta `SELECT * FROM alumnos_clases`
- ENTONCES retorna 0 filas (subquery IN vacía, sin error)

---

### R6: RLS en tablas P1 (core diario)

Mismo patrón que R5 para: `alumnos`, `clases`, `sesiones_clase`, `horarios`, `contenidos_sesion`

#### Escenario: Teacher ve solo sus clases

- DADO un maestro `M1` con clase `C1` y otro maestro `M2` con clase `C2`
- CUANDO `M1` ejecuta `SELECT * FROM clases`
- ENTONCES solo ve `C1` (donde `maestro_id = M1`)

---

### R7: RLS en tablas P2 (secundarias)

Mismo patrón para: `ausencias`, `justificaciones`, `progresos`, `observaciones_sesion`, `observaciones_alumnos`, `planificacion`

---

### R8: Modelo de permisos modificado (teacher-permissions)

El sistema DEBE modificar el modelo actual de permisos booleanos a un arreglo `text[]`, y el frontend DEBE adaptar `permisoService.fetchCurrent()` para leer del arreglo y mapear a la interfaz booleana existente.

(Anteriormente: columnas booleanas fijas `puede_registrar_alumnos`, `puede_inscribir_clases`)

#### Escenario: fetchCurrent() retorna permisos mapeados

- DADO un maestro con `permisos = ARRAY['alumnos:create']`
- CUANDO `fetchCurrent()` consulta permisos
- ENTONCES retorna `{ puede_registrar_alumnos: true, puede_inscribir_clases: false }` (mapeo arreglo → booleano para compatibilidad)

#### Escenario: Admin toggle escribe en arreglo

- DADO un administrador que activa `puede_registrar_alumnos` para un maestro
- CUANDO persiste el cambio
- ENTONCES actualiza el arreglo `permisos` agregando/quitando `'alumnos:create'`

---

## Catálogo de Claves de Permiso

| Clave | Booleano anterior | Descripción |
|-------|-------------------|-------------|
| `alumnos:create` | `puede_registrar_alumnos` | Registrar nuevos alumnos |
| `clases:enroll` | `puede_inscribir_clases` | Inscribir alumnos en clases |
| `planificacion:write` | *(nuevo)* | Crear/editar planificaciones |
| `asistencias:write` | *(nuevo)* | Registrar asistencias |

Solo `alumnos:create` y `clases:enroll` se migran de booleanos. Las claves nuevas son reservadas para uso futuro.

---

## No Metas

- UI de solicitud de permisos por parte del maestro
- UI de gestión administrativa de permisos (admin panel no cambia)
- Políticas RLS para las ~45 tablas de solo administración
- Roles de estudiante (`user`)

---

## Referencias Cruzadas

- **Dependencia**: cambio `auth-rls-rearchitecture` completado — provee `auth.uid()` funcional y flujo auth
- **Tabla vinculante**: `maestros.id` debe ser UUID vinculado a `auth.users` (ver migraciones `004_rls_policies.sql`, `007_academic_route_rls.sql`)
- **Patrón RLS**: usar subconsultas `IN (SELECT ...)` con `maestro_actual()`, no joins directos
