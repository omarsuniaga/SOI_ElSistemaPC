# Informe de preparación para producción — Escritura anónima en ocho tablas

**Fecha:** 17 de octubre de 2026 · **Rama:** `claude/anon-write-vulnerability-fix-69c2fe`
**Migración:** `supabase/migrations/20261017180000_restrict_write_access_academic_catalog_and_class_records.sql`
**Estado:** nada aplicado en producción, nada fusionado a `master`. Producción solo se consultó en modo lectura (`pg_catalog`, estadísticas y registros de API).

## Conclusión: APTO CON CONDICIONES

La corrección es correcta, probada y reversible, y el riesgo que cierra es real y explotable hoy por cualquiera con la clave pública. El ensayo de migración, rollback y aserciones **ya se hizo** sobre una copia de solo esquema y políticas de producción (sección 6). No la declaro "apto para despliegue" sin condiciones porque faltan dos cosas que solo pueden hacer personas con acceso de escritura:

1. **Prueba manual de interfaz por rol** (admin, maestro, sin sesión) contra el entorno real o una rama con datos. Las pruebas automáticas cubren la base de datos, no los clics.
2. **Respaldo tomado y verificado** antes de aplicar (procedimiento en la sección 8).

(La rama de Supabase se descartó por decisión del usuario: sus migraciones no arrancan desde cero, así que no habría sido una copia fiel.) Con esas dos hechas y las aserciones post-aplicación en verde, pasa a **APTO PARA DESPLIEGUE**. Si algo falla, el rollback probado lo deshace.

## 1. Decisiones incorporadas

- **`direccion` sin escritura por defecto.** La autorización es por capacidad, no por rol. Función `tiene_capacidad_academica(capacidad)`:

  | Capacidad | `admin`, `superadmin` | `coordinacion_academica` | Cualquier otro rol (incl. `direccion`, `maestro`) |
  |---|---|---|---|
  | `catalogo:escribir` (programas, salones, horarios) | sí | sí | no |
  | `registros_clase:gestionar` (eventos de clase, metodología, tareas, planificado; borrar) | sí | sí | no |
  | `alertas_asistencia:gestionar` (`notificaciones_asistencia`) | sí | sí | no |

  Dar una capacidad a otro rol es un cambio deliberado y revisado de esa función. Hoy ninguna cuenta es `direccion` ni `coordinacion_academica`.
- **Hallazgo del ensayo con el esquema real:** mi primer diseño permitía concesiones individuales en `permisos_maestros.permisos`. La política real de esa tabla (`Permitir actualizar sus propios permisos o por admin`) deja que **cada maestro edite su propia fila**, así que cualquier maestro podía auto-concederse la capacidad. Se retiró esa rama; queda probado que auto-concederse no desbloquea nada, y el hueco queda documentado como seguimiento (R9). Las concesiones individuales exigen arreglar antes esa tabla.
- Exige perfil `estado = 'activo'` **y** `activo = true` (reutiliza `soi_security.has_role` tal como está en producción). Un admin inactivo no escribe: probado. Los 5 admins cumplen ambas.
- El maestro dueño escribe sus propios registros (`maestro_actual()`), y el titular/suplente de la clase los de su sesión. Un maestro **no** edita el catálogo ni borra registros.

## 2. Registros de la API (punto 2)

Acceso confirmado: herramienta de logs de Supabase (consulta solo lectura, ventana máx. 24 h por llamada). Se revisó **1–17 de octubre** (retención disponible hasta al menos el 28 de septiembre).

| Pregunta | Resultado |
|---|---|
| Escrituras (POST/PATCH/PUT/DELETE) a las ocho tablas por la API, cualquier rol | **0** en 17 días |
| Peticiones de `anon`/sin JWT a las ocho tablas (distintas de preflight CORS) | **0** (1–15 y 17 oct; el 16 solo se revisaron escrituras) |
| Lo que sí aparece | Solo `GET` de cuentas autenticadas a `programas` y `salones`, más preflights `OPTIONS` sin JWT |

**Conclusión:** no hay ninguna escritura anónima legítima en la ventana observada; nadie depende de la apertura. Límite: un proceso que escriba con menos frecuencia que cada 17 días no aparecería. Mitigación: la consulta queda documentada (`02_api_logs_anon_writes.sql`) para repetirla el día de aplicar, y el fallo sería visible de inmediato como `401/403`.

## 3. Flujos verificados (punto 3)

La suite ejecuta los flujos de extremo a extremo con **triggers activos y claves foráneas exigidas** (antes se desactivaban), contra los triggers reales de producción (`generate_salon_code` con su secuencia, `updated_at`, etc.).

| Flujo | Resultado |
|---|---|
| **Programas, salones, horarios** (crear, editar, borrar horario) por los 5 admins, coordinación y superadmin | pasa |
| **Asignación de salones** (`clase_horarios` con `salon_id`): admin, coordinación, maestro de la clase | idéntico antes y después |
| **Calendario** (`calendario_institucional`: leer y crear) | idéntico antes y después |
| **Tareas académicas**: `tareas_institucionales` (crear) y `homework_assignments` (maestro titular y suplente) | pasa / idéntico |
| **Cartelera pública**: `signage_pantallas`, `signage_media` y las 4 vistas `signage_v_*` leídas sin sesión; `programas` legible sin sesión | pasa |
| **Registros de clase**: evento → metodología → tarea → cambio de estado, titular y suplente; planificar y marcar cubierto | pasa |
| **Alertas de asistencia**: el widget del admin encola y lee; Hermes (service role) actualiza estado | pasa |
| Los mismos flujos de catálogo para `alumno`, `representante`, `maestro` ajeno, `direccion`, `finanzas`, admin inactivo y anónimo | **rechazados** |

Las 48 sentencias de "colateral" (calendario, aula, tareas, cartelera, cada una con 6 actores) dan el mismo resultado antes y después: la migración no altera nada fuera de las ocho tablas.

## 4. Administradores y maestros (punto 4)

Producción (consulta de agregados, sin datos personales):

- **5 administradores**, los cinco `estado = activo` y sin `activo = false`: todos satisfacen `has_role`. Probados los cinco perfiles (`admin`…`admin5`): escriben catálogo, registros de clase y alertas.
- **25 maestros:** 17 `activo` y operativos, 6 con `estado = activo` pero `profiles.activo = false` (siguen escribiendo sus registros porque la política usa `maestro_actual()`, igual que hoy), 1 inactivo y 1 rechazado. **18** resuelven a una fila de `maestros`; los 7 restantes no pueden escribir registros de clase hoy (la clave foránea `teacher_id → maestros` lo impide) y no empeoran.
- Los maestros conservan: leer catálogo y registros, crear y editar **sus** eventos, metodología, tareas y planificado; titular y suplente cubren la sesión de su clase. Pierden: escribir catálogo, borrar registros, suplantar a otro maestro (probado: `INSERT` con `teacher_id` ajeno y mover un evento a otro dueño se rechazan).

## 5. Las políticas permisivas no anulan las nuevas (punto 5)

Postgres combina políticas permisivas con **OR**: una sola abierta anula todas las restrictivas. Se comprobó de tres formas:

1. **Inventario exacto:** las 39 políticas de producción están enumeradas y la migración las elimina por nombre. Tras migrar, el conjunto de políticas de cada tabla debe ser **exactamente** la lista blanca (8/8 tablas). Quedan, a propósito, `*_admin_read` (`es_admin()`, solo lectura) y `programas_anon_read`.
2. **Auto-verificación dentro de la migración:** si queda algún privilegio de escritura para `anon`, alguna política de escritura hacia `public/anon` o alguna política incondicional, **aborta toda la transacción**. Si aparece una política nueva antes de aplicar, falla en seco en vez de dejar un hueco.
3. **Prueba de mutación:** al añadir a propósito una política "cualquier usuario con sesión puede actualizar `programas`", la suite falla (9 casos de matriz y la lista blanca). Con la "corrección ingenua" (`public`→`authenticated`) falla 161.

Sin restrictivas, sin permisos por columna, sin `PUBLIC` en la ACL, sin vistas actualizables ni funciones `SECURITY DEFINER` que escriban en estas tablas (consultado en producción).

## 6. Ensayo sobre copia de esquema y políticas de producción

Con autorización, se capturó con **consultas de solo lectura a `pg_catalog`** un subconjunto de esquema de producción (`supabase/tests/anon-write-fix/prod_schema_subset_2026-10-17.sql`): columnas, restricciones, RLS, **todas las políticas (incluidas las RESTRICTIVAS)**, ACL de tablas y secuencias, triggers de las ocho tablas, funciones auxiliares y las cuatro vistas de cartelera, textuales. Sin datos. Se cargó en PostgreSQL 17 local y se ejecutó ahí el ciclo completo:

| Paso | Resultado |
|---|---|
| Exposición antes | exactamente las ocho tablas, como en producción |
| `04_post_apply_assertions.sql` antes | falla (4 de 7), como debe |
| **Migración** (`ON_ERROR_STOP`, transacción única con auto-verificación) | aplicada sin errores |
| `04_post_apply_assertions.sql` después | **7/7 en `true`** |
| Filas "abiertas" en las ocho tablas (anon + authenticated) | 0 |
| **Rollback** | aplicado sin errores; las aserciones vuelven al estado vulnerable original |
| Reaplicar tras el rollback | 7/7 en `true` |

Reducido a propósito en esa copia: `alumnos`, `levels`, `nodes`, `academic_plans` (solo columnas clave, sin RLS) y los triggers de Hermes de `calendario_institucional`/`tareas_institucionales`, que la migración no toca.

## 6b. Pruebas automáticas

La suite corre contra **dos líneas base**: la copia de producción anterior (por defecto) y el modelo reconstruido desde el repositorio. Ambas dan el mismo resultado.

| Fase | Resultado |
|---|---|
| Antes (la vulnerabilidad existe, anónima y por cuenta registrada) | 33/33 |
| Después: matriz por rol, tabla y operación (20 cuentas, negativos y positivos) | 618/618 |
| Idempotencia (aplicar dos veces) | 1/1 |
| Flujos de extremo a extremo con triggers y claves foráneas; incluye auto-concesión en `permisos_maestros` | 22/22 |
| Lista blanca de políticas | 8/8 |
| Colateral (calendario, aulas, tareas, cartelera) | 48/48 |
| Rollback (restaura ACL y políticas exactas; reaplicable) | 36/36 |

Reproducir: `npm run test:db:anon-write` (Docker). Línea base alternativa: `node supabase/tests/anon-write-fix/run_tests.mjs --baseline repo-model`.

## 7. Riesgos residuales

| # | Riesgo | Severidad | Tratamiento |
|---|---|---|---|
| R1 | **47 tablas más** con escritura abierta a cualquier cuenta registrada (p. ej. `alumnos_programas`, `postulantes`, `student_cases`, `notificaciones`, `departamentos`, `lut_*`, `document_templates`, `tareas_institucionales`) | Alta | Fuera de alcance por decisión; mismo método, otra migración. `01_effective_write_exposure.sql` las lista |
| R2 | 128 funciones `SECURITY DEFINER` ejecutables por `anon` y 13 vistas definer (diagnóstico del 11-oct) | Alta | Análisis propio de consumidores |
| R3 | La lectura de registros de clase queda abierta a toda cuenta autenticada (incluye `alumno`/`representante`); `notificaciones_asistencia` ya no | Media (tablas vacías hoy) | Requiere revisar flujos de suplentes; seguimiento |
| R4 | Un escritor anónimo legítimo que opere con menos frecuencia que cada 17 días | Baja | Repetir la consulta de logs el día de aplicar; rollback disponible |
| R5 | El ensayo usa un subconjunto de esquema de producción, sin datos ni los demás módulos | Baja | Políticas y ACL de las ocho tablas verificadas idénticas; la prueba manual por rol cierra el resto |
| R9 | `permisos_maestros`: cada maestro puede editar su propia fila (auto-concesión de permisos como `puede_inscribir_clases`) | Media | Fuera de alcance; por eso las capacidades de esta migración no se leen de ahí. Seguimiento |
| R6 | `classEventService.js` inserta `status = 'pending'` (la tabla solo admite `draft/completed/cancelled`): ese flujo ya falla hoy | Media (funcional) | Corregir en el módulo; no depende de esta migración |
| R7 | Quien hoy gestione catálogo con un rol distinto de admin/coordinación quedará bloqueado | Baja | No existe ninguno (solo `admin` y `maestro` en producción); se concede por capacidad |
| R8 | Cambios manuales en producción entre este informe y la aplicación | Baja | Re-ejecutar `03_capture_current_state.sql`; la migración aborta si queda algo abierto |

## 8. Respaldo

Antes de aplicar (ninguno de estos pasos modifica datos):

1. Confirmar en el panel de Supabase que existe copia de seguridad automática reciente o PITR, y anotar la hora.
2. Exportar el estado de seguridad: guardar la salida de `03_capture_current_state.sql` (políticas, ACL, roles, funciones).
3. Copia lógica de las dos tablas con datos y de las otras seis (vacías, para tener el esquema):
   ```bash
   pg_dump "$DATABASE_URL" --no-owner --format=custom \
     -t public.programas -t public.salones -t public.horarios \
     -t public.class_events -t public.class_event_methodology \
     -t public.homework_assignments -t public.planned_content \
     -t public.notificaciones_asistencia \
     -f soi_ocho_tablas_2026-10-17.dump
   ```
4. Guardar fuera del repositorio. La migración no borra datos; el respaldo es para la hipótesis improbable de que algo externo lo haga mientras tanto.

## 9. Migración y validación posterior

Ver [`RUNBOOK_APLICACION.md`](./RUNBOOK_APLICACION.md). Resumen:

1. Ensayo ya hecho en copia local de esquema/políticas de producción; en el entorno real: `04_post_apply_assertions.sql` (todo `true`) → prueba manual: sin sesión (cartelera), admin (crear/editar programa y salón), maestro (asistencia, planificar), alumno (no puede editar catálogo).
2. Producción, fuera de horario de clases, con el mismo archivo (transacción única con auto-verificación).
3. Validación posterior: `04_post_apply_assertions.sql` en producción; `01_effective_write_exposure.sql` ya no debe listar ninguna de las ocho tablas para `anon`; revisar 30 minutos los logs (`401/403` en estas tablas = alguien dependía de la apertura); registrar la migración en el ledger.

## 10. Reversión

`supabase/rollback/20261017180000_restrict_write_access_academic_catalog_and_class_records.rollback.sql`: idempotente y probado (restaura políticas y ACL exactas del estado verificado en producción, retira las dos funciones, y la migración se puede reaplicar después). **Reabre la vulnerabilidad**; usar solo si un flujo legítimo falla y no se puede corregir hacia adelante. Antes, intentar siempre la salida menos costosa: ampliar `tiene_capacidad_academica()` con una migración revisada para quien la necesite.
