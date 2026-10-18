# Informe de preparación para producción — Escritura anónima en ocho tablas

**Fecha:** 17 de octubre de 2026 · **Rama:** `claude/anon-write-vulnerability-fix-69c2fe`
**Migración:** `supabase/migrations/20261017180000_restrict_write_access_academic_catalog_and_class_records.sql`
**Estado:** nada aplicado en producción, nada fusionado a `master`. Producción solo se consultó en modo lectura (`pg_catalog`, estadísticas y registros de API).

## Conclusión: APTO CON CONDICIONES

La corrección es correcta, probada y reversible, y el riesgo que cierra es real y explotable hoy por cualquiera con la clave pública. No la declaro "apto para despliegue" sin condiciones porque faltan tres cosas que solo pueden hacerse con acceso de escritura o con personas:

1. **Ensayo en una rama/staging de Supabase** con copia de producción (no se hizo: crear la rama es un cambio en el proyecto y no estaba autorizado).
2. **Prueba manual de interfaz por rol** (admin, maestro, sin sesión) en ese ensayo. Las pruebas automáticas cubren la base de datos, no los clics.
3. **Respaldo tomado y verificado** antes de aplicar (procedimiento abajo).

Con esas tres hechas y las aserciones post-aplicación en verde, pasa a **APTO PARA DESPLIEGUE**. Si alguna falla, el rollback probado la deshace.

## 1. Decisiones incorporadas

- **`direccion` sin escritura por defecto.** La autorización ahora es por capacidad, no por rol. Función `tiene_capacidad_academica(capacidad)`:

  | Capacidad | `admin`, `superadmin` | `coordinacion_academica` | Cualquier otra cuenta |
  |---|---|---|---|
  | `catalogo:escribir` (programas, salones, horarios) | sí | sí | solo con concesión explícita |
  | `registros_clase:gestionar` (eventos de clase, metodología, tareas, planificado; borrar) | sí | sí | solo con concesión explícita |
  | `alertas_asistencia:gestionar` (`notificaciones_asistencia`) | sí | sí | solo con concesión explícita |

  La concesión explícita reutiliza el mecanismo existente `permisos_maestros.permisos` (con `fecha_inicio`/`fecha_fin`), administrable por un admin; exige una fila en `maestros`. Hoy ninguna cuenta es `direccion`; si algún día necesita una capacidad, se le concede esa capacidad, no un rol.
- Exige perfil `estado = 'activo'` (reutiliza `soi_security.has_role`). Un admin inactivo no escribe: probado.
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
| **Programas, salones, horarios** (crear, editar, borrar horario) por los 5 admins, coordinación, superadmin y maestro con capacidad | pasa |
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

## 6. Pruebas

PostgreSQL 17 aislado; línea base reconstruida del volcado del repo y **verificada contra producción** (políticas y ACL idénticas). 20 cuentas simuladas, todas las combinaciones tabla × operación.

| Fase | Resultado |
|---|---|
| Antes (la vulnerabilidad existe, anónima y por cuenta registrada) | 33/33 |
| Después: matriz por rol, tabla y operación (negativos y positivos) | 618/618 |
| Idempotencia (aplicar dos veces) | 1/1 |
| Flujos de extremo a extremo con triggers | 20/20 |
| Lista blanca de políticas | 8/8 |
| Colateral (calendario, aulas, tareas, cartelera) | 48/48 |
| Rollback (restaura ACL y políticas exactas; reaplicable) | 36/36 |

Reproducir: `npm run test:db:anon-write` (requiere Docker).

## 7. Riesgos residuales

| # | Riesgo | Severidad | Tratamiento |
|---|---|---|---|
| R1 | **47 tablas más** con escritura abierta a cualquier cuenta registrada (p. ej. `alumnos_programas`, `postulantes`, `student_cases`, `notificaciones`, `departamentos`, `lut_*`, `document_templates`, `tareas_institucionales`) | Alta | Fuera de alcance por decisión; mismo método, otra migración. `01_effective_write_exposure.sql` las lista |
| R2 | 128 funciones `SECURITY DEFINER` ejecutables por `anon` y 13 vistas definer (diagnóstico del 11-oct) | Alta | Análisis propio de consumidores |
| R3 | La lectura de registros de clase queda abierta a toda cuenta autenticada (incluye `alumno`/`representante`); `notificaciones_asistencia` ya no | Media (tablas vacías hoy) | Requiere revisar flujos de suplentes; seguimiento |
| R4 | Un escritor anónimo legítimo que opere con menos frecuencia que cada 17 días | Baja | Repetir la consulta de logs el día de aplicar; rollback disponible |
| R5 | El modelo de pruebas no es producción | Baja | Políticas y ACL verificadas idénticas; el ensayo en rama cierra el resto |
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

1. Ensayo en rama de Supabase con copia de producción → `04_post_apply_assertions.sql` (todo `true`) → prueba manual: sin sesión (cartelera), admin (crear/editar programa y salón), maestro (asistencia, planificar), alumno (no puede editar catálogo).
2. Producción, fuera de horario de clases, con el mismo archivo (transacción única con auto-verificación).
3. Validación posterior: `04_post_apply_assertions.sql` en producción; `01_effective_write_exposure.sql` ya no debe listar ninguna de las ocho tablas para `anon`; revisar 30 minutos los logs (`401/403` en estas tablas = alguien dependía de la apertura); registrar la migración en el ledger.

## 10. Reversión

`supabase/rollback/20261017180000_restrict_write_access_academic_catalog_and_class_records.rollback.sql`: idempotente y probado (restaura políticas y ACL exactas del estado verificado en producción, retira las dos funciones, y la migración se puede reaplicar después). **Reabre la vulnerabilidad**; usar solo si un flujo legítimo falla y no se puede corregir hacia adelante. Antes, intentar siempre la salida menos costosa: conceder la capacidad a quien la necesite (`permisos_maestros.permisos`).
