# Informe ejecutivo — Escritura anónima en ocho tablas del SOI

**Fecha:** 17 de octubre de 2026 · **Rama:** `claude/anon-write-vulnerability-fix-69c2fe`
**Estado:** propuesta validada en PostgreSQL aislado. **No aplicada en producción. Sin fusión a `master`. Sin despliegue.**

## 1. Riesgo demostrado

La clave pública `anon` de Supabase viaja en el paquete del navegador, así que cualquier persona la tiene. Con solo esa clave y sin iniciar sesión, en el modelo aislado de producción:

| Tabla | Qué puede hacer un anónimo hoy | Filas (inventario del repo, sept. 2026) |
|---|---|---|
| `programas` | Leer, **modificar y borrar** | 7 filas (catálogo académico real) |
| `salones` | **Insertar** filas (UPDATE/DELETE: no, ver nota) | 11 filas (reales) |
| `horarios` | **Insertar** filas (UPDATE/DELETE: no, ver nota) | 0 |
| `class_events` | Leer, **modificar y borrar** | 0 |
| `class_event_methodology` | Leer, **modificar y borrar** (incluye `closing_observation`) | 0 |
| `homework_assignments` | Leer, **modificar y borrar** (tareas por alumno) | 0 |
| `planned_content` | Leer, **modificar y borrar** | 0 |
| `notificaciones_asistencia` | No directamente (ver nota) | 0 |

**Nota sobre UPDATE/DELETE.** PostgreSQL exige que el rol *vea* las filas para modificarlas. `salones`, `horarios` y `notificaciones_asistencia` no tienen política de lectura para `anon`, así que ahí el anónimo solo logra inserciones a ciegas. Para `notificaciones_asistencia` la apertura real es otra: la política `hermes_update_notifications` (`UPDATE … TO public USING (true)`) deja que **cualquier cuenta registrada** (alumno, representante) altere el estado de las alertas, y otra política deja a cualquier cuenta registrada **leer teléfonos de tutores** e insertar alertas arbitrarias.

**Segunda exposición, más sutil.** `programas`, `salones` y `horarios` tienen además una política `*_authenticated_all` (`ALL TO authenticated USING (true)`). Cambiar solo `public` por `authenticated` dejaría a cualquier cuenta registrada reescribir el catálogo institucional. La suite lo confirma: la "corrección ingenua" falla 161 de 426 casos.

**Evidencia (rol `anon`, sin sesión, base aislada):**

```
> UPDATE programas SET nombre='HACKED' RETURNING nombre   →  HACKED
> DELETE FROM programas RETURNING nombre                    →  HACKED   (fila borrada)
> INSERT INTO salones (nombre) VALUES ('pwn-anon')          →  INSERT 0 1
> UPDATE class_events SET status='cancelled' RETURNING …    →  cancelled / cancelled
> DELETE FROM homework_assignments RETURNING description    →  fixture  (fila borrada)
```

Tras la migración, las mismas sentencias devuelven `permission denied for table …`.

Causa raíz común: políticas `TO public USING (true)` y concesiones totales por defecto (`GRANT ALL` a `anon` y `authenticated`) en tablas creadas sin revisión de acceso. Algunas son herencia de migraciones antiguas (`020_notificaciones_asistencia.sql`, `20260507_class_events_schema.sql`), otras aparecen solo en el esquema vivo (`Permitir crear/actualizar/eliminar …`, aplicadas a mano).

## 2. Consumidores y flujos

| Tabla | Quién escribe (código) | Con qué sesión |
|---|---|---|
| `programas` | `modules/programas/api/programasApi.js` | Portal ACM/ADM — admin, coordinación |
| `salones` | `modules/salones/api/salonesApi.js` | Portal ACM/ADM — admin, coordinación |
| `horarios` | **Nadie** en el frontend (solo lectura en `ausenciasApi.js`; la UI escribe `clase_horarios`, otra tabla) | — |
| `class_events`, `class_event_methodology`, `homework_assignments` | `portal-maestros/services/classEventService.js` | Maestro autenticado |
| `planned_content` | `portal-maestros/services/rutaGameificadaService.js` | Maestro autenticado |
| `notificaciones_asistencia` | Inserta `attendanceNotificationService.js` (único llamador: widget del dashboard admin); actualiza Hermes con service role | Admin / service role |

Flujos **sin sesión** revisados: la cartelera (`public/signage/js/core.js`) lee solo `signage_pantallas`, `signage_media` y las vistas `signage_v_*`; las vistas corren con los privilegios de su dueño, así que **no dependen** de los permisos de `anon` sobre `salones`. El portal de calendario (`calendario.html`) es solo para roles autenticados (`portalAccessService.js`); no escribe en estas tablas (solo lee `salones`). Ninguna función de la base escribe en ellas (búsqueda sobre los cuerpos de las 231 funciones públicas del modelo) y ninguna de las 29 funciones Edge las modifica (la única mención, `whatsapp-webhook`, es base de conocimiento de texto). Si alguna usara service role, RLS no le aplica y quedaría igual. La única lectura anónima legítima sobre estas tablas es `programas_anon_read`, que se conserva.

**Hallazgo incidental (no corregido aquí):** `classEventService.js` inserta `class_events.status = 'pending'`, pero la tabla solo admite `draft | completed | cancelled`. Ese flujo ya falla hoy en la base (tabla vacía, "cableada sin datos"). Conviene corregirlo en el módulo, no en esta migración.

## 3. Solución propuesta (mínimo privilegio)

Migración `supabase/migrations/20261017180000_restrict_write_access_academic_catalog_and_class_records.sql`, independiente de Storage y del módulo QR.

- **Catálogo (`programas`, `salones`, `horarios`):** escribe solo `es_gestor_academico()` = `admin`, `superadmin`, `coordinacion_academica`, `direccion`. Lectura: toda cuenta autenticada (sin cambios). `anon` conserva únicamente `SELECT` sobre `programas`.
- **Registros de clase (`class_events`, `class_event_methodology`, `homework_assignments`, `planned_content`):** escribe el maestro dueño (`maestro_actual()`), el titular o suplente de la clase de la sesión, y los gestores. `DELETE` solo gestores (ningún flujo borra estas filas). `anon` pierde todo acceso.
- **`notificaciones_asistencia`:** se elimina la política UPDATE abierta (Hermes usa service role); `INSERT` y `SELECT` pasan de "cualquier cuenta" a gestores.
- **Privilegios de tabla:** `REVOKE ALL … FROM anon, authenticated` y se devuelve solo lo que las políticas usan. Esto elimina también `TRUNCATE`, que RLS no restringe.
- **Autoverificación:** el bloque final aborta toda la transacción si queda algún privilegio de escritura para `anon` o alguna política incondicional.
- Dos funciones nuevas (`SECURITY DEFINER`, `search_path` fijo, sin `EXECUTE` para `anon`). No se modifica ningún archivo de la aplicación.

**Decisiones que debe confirmar (negocio):**
1. `direccion` puede escribir el catálogo (hoy accede al portal ACM). Si solo debe leer, se quita de la lista de `es_gestor_academico()`.
2. Maestros **no** pueden editar el catálogo ni borrar sus propios registros de clase. Hoy ningún flujo lo hace; si aparece uno, se añade una política puntual.
3. La lectura de los cuatro registros de clase sigue abierta a toda cuenta autenticada (incluye `alumno`/`representante`). Cerrarla requiere revisar flujos de suplentes; queda como seguimiento.

## 4. Resultados de las pruebas

PostgreSQL 17 en contenedor aislado. La línea base se reconstruye desde `supabase/migrations/schema_reference.sql` (volcado del 8-sep, 216 tablas, 591 políticas) más los `GRANT/REVOKE` de migraciones anteriores y las migraciones posteriores. Se prueban 13 actores: `anon`, `user`, `alumno`, `representante`, `finanzas`, tres maestros (titular, suplente, ajeno), `coordinacion`, `direccion`, `admin`, `superadmin` y `service_role`.

| Fase | Resultado | Qué prueba |
|---|---|---|
| Antes | 33/33 | La vulnerabilidad existe (anónima y por cuenta registrada) |
| Después | 426/426 | Casos negativos y positivos por rol, tabla y operación; lecturas; flujos públicos (vistas de cartelera, `signage_*`); suplencia; intento de suplantar al titular; cambio de dueño bloqueado por `WITH CHECK` |
| Idempotencia | 1/1 | Aplicar dos veces deja el catálogo idéntico |
| Rollback | 36/36 | Restaura las políticas y ACL exactas previas, retira las funciones y la migración se puede reaplicar |

**Prueba de mutación:** con la "corrección ingenua" (`public` → `authenticated`) la suite falla 161 casos, así que detecta justo el error que se quería evitar.

Reproducir: `npm run test:db:anon-write` (requiere Docker).

## 5. Límites de esta validación

- **El modelo no es producción.** Se reconstruyó desde el repositorio porque no se autorizó SQL en producción. No refleja cambios hechos a mano en el SQL Editor después del volcado del 8-sep. Por eso el procedimiento incluye capturar el estado real antes de aplicar (`03_capture_current_state.sql`).
- Los 35 enunciados del volcado que no cargaron (tablas `hermes_inbox`, `applicant_events` y políticas de `maestro_unidades/objetivos/indicadores`) no afectan a las ocho tablas.
- Otras 47 tablas con escritura abierta a `authenticated` (`01_effective_write_exposure.sql` las lista) **no** se tocaron, a propósito: otra superficie y otro riesgo de regresión.

## 6. Seguimiento fuera de alcance

1. Auditar las otras 47 tablas con escritura abierta a cuentas autenticadas (`01_effective_write_exposure.sql` las lista).
2. Cerrar la lectura de los registros de clase y de `notificaciones_asistencia` por pertenencia.
3. Las 128 funciones `SECURITY DEFINER` ejecutables por `anon` y las 13 vistas definer (diagnóstico del 11-oct), con su propio análisis de consumidores.
4. Corregir `status: 'pending'` en `classEventService.js`.
5. Prevención (R1/R2 de la política): una comprobación en CI que falle si una migración crea una política `TO public` con `USING (true)` para escritura.

## 7. Procedimiento seguro de aplicación

Ver [`RUNBOOK_APLICACION.md`](./RUNBOOK_APLICACION.md). Resumen: capturar estado real (solo lectura) → revisar logs de API → aplicar en rama/staging → `04_post_apply_assertions.sql` → prueba manual por rol → producción → aserciones de nuevo. Rollback probado y disponible.
