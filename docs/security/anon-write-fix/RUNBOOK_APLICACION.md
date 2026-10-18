# Runbook — aplicar la corrección de escritura anónima

**Migración:** `supabase/migrations/20261017180000_restrict_write_access_academic_catalog_and_class_records.sql`
**Rollback:** `supabase/rollback/20261017180000_restrict_write_access_academic_catalog_and_class_records.rollback.sql`
**Independiente de:** migración de Storage (`20261017200000_…`) y módulo QR. Pueden aplicarse en cualquier orden.

> Nada de esto está autorizado todavía. Este documento describe cómo hacerlo cuando se autorice.

## Antes de aplicar

1. **Decisiones de negocio** (ya tomadas: `direccion` sin escritura por defecto, autorización por capacidad). Pendiente de confirmar: maestros sin edición de catálogo y lectura de registros de clase abierta a autenticados (ver riesgos residuales).
2. **Estado real** (ya confirmado el 17-oct contra producción en solo lectura; repetir si pasó tiempo): ejecutar `supabase/tests/anon-write-fix/03_capture_current_state.sql` en el SQL Editor y guardar la salida. Compararla con las políticas listadas en el archivo de rollback. Si hay diferencias, ajustar el rollback **antes** de aplicar.
3. **Confirmar que nadie legítimo escribe por la API pública:** el 17-oct se revisaron los logs del 1 al 17 de octubre (0 escrituras, 0 peticiones anónimas); repetir `02_api_logs_anon_writes.sql` en Logs Explorer el día de aplicar. Cualquier `POST/PATCH/DELETE` legítimo contra las ocho tablas debe comprobarse contra las políticas nuevas. Se espera ver solo tráfico de las pantallas ACM/ADM y del portal de maestros con sesión.
4. **Respaldo:** seguir la sección 8 de `INFORME_PREPARACION_PRODUCCION.md` (copia automática/PITR verificada + `pg_dump` de las ocho tablas + salida de `03_capture_current_state.sql`).
5. **Ventana:** fuera de horas de clase. La migración corre en una transacción y toma bloqueos breves.
6. **Roles:** el 17-oct `profiles.rol` solo contenía `maestro` (25) y `admin` (5); si cambió, revisar que quien gestiona programas/salones esté en la lista de `tiene_capacidad_academica()`.

## Aplicación

1. Ya ensayado en una copia local de esquema/políticas de producción (informe, sección 6). Si hay staging con datos, aplicar ahí primero; si no, ir a producción en horario de baja actividad con el respaldo hecho:
   ```bash
   supabase db push --include-all    # o aplicar el archivo desde el SQL Editor de la rama
   ```
2. Ejecutar `04_post_apply_assertions.sql`: todas las filas deben mostrar `ok = true`.
3. Prueba manual por rol (5 minutos):
   - **Sin sesión:** abrir `/signage/` → la cartelera sigue mostrando horario, calendario y medios.
   - **Admin / coordinación (ACM):** crear, editar y desactivar un programa y un salón.
   - **Maestro:** abrir el portal de maestros, registrar asistencia y planificar contenido (`planned_content`).
   - **Cuenta de alumno/representante:** confirmar que no puede editar programas ni salones.
4. Si todo está bien, aplicar en producción con el mismo archivo, en una sola ejecución (la migración ya trae `BEGIN/COMMIT` y autoverificación; si algo queda abierto, aborta entera).
5. Volver a ejecutar `04_post_apply_assertions.sql` en producción y guardar la salida junto a la del paso previo.

## Señales de problema y qué hacer

| Síntoma | Causa probable | Acción |
|---|---|---|
| Usuario de coordinación recibe "permission denied"/RLS al guardar programa o salón | Su `profiles.rol` no está en la lista | Corregir el rol o ampliar `tiene_capacidad_academica()` con una migración nueva (no revertir) |
| Maestro no puede guardar un registro de clase | `maestro_actual()` no lo resuelve (sin fila en `maestros`) | Revisar `maestros.user_id`; no revertir |
| La cartelera queda vacía | No debería ocurrir (las vistas corren como dueño) | Revisar `signage_v_*`; solo entonces considerar rollback |
| Un proceso externo con la clave `anon` falla | Dependía de escritura anónima | Moverlo a service role o a una RPC; **no** reabrir `anon` |

## Rollback

Reabre la vulnerabilidad: usar solo si un flujo legítimo se rompe y no se puede corregir hacia adelante.

```bash
# En el SQL Editor (o psql contra la base): ejecutar el archivo completo
supabase/rollback/20261017180000_restrict_write_access_academic_catalog_and_class_records.rollback.sql
```

Es idempotente y está probado: restaura políticas y ACL exactas del estado previo y retira las dos funciones. Después, publicar una migración corregida cuanto antes.

## Después de aplicar

- Registrar la aplicación en el ledger de migraciones (`supabase migration list` / `repair`) siguiendo `supabase/migrations/RECONCILIACION_LEDGER.md`.
- Re-ejecutar `01_effective_write_exposure.sql` en producción: las ocho tablas deben desaparecer del listado de `anon` y de `WIDE-OPEN`.
- Abrir los seguimientos del informe (sección 6).
