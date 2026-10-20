# Runbook de aplicación — Bloque 1 (datos personales de alumnos)

Migración: `supabase/migrations/20261020120000_restrict_authenticated_write_student_data_block1.sql`
Rollback: `supabase/rollback/20261020120000_restrict_authenticated_write_student_data_block1.rollback.sql`
**Nada de esto se ha ejecutado en producción.** Aplicar solo con autorización expresa del titular.

## Antes de aplicar

1. **Código desplegado primero.** Esta rama cambia tres archivos del portal de maestros (`WizardShell.js`, `ausenciasApi.js`, `ausenciasSupabase.js`). Desplegar el front **antes** de la migración: el asistente de inscripción usa la RPC `marcar_postulante_inscrito` (que la migración crea; si el front nuevo se despliega antes, el paso falla en silencio con un aviso en consola hasta que se aplique la migración, y el aspirante no queda marcado como inscrito). Orden seguro: aplicar la migración y desplegar el front en la misma ventana, o la migración primero (el front viejo hace `UPDATE` directo, que dejaría de funcionar; la inscripción del alumno **no** se ve afectada, solo el marcado del aspirante).
2. Confirmar el ledger: `select version from supabase_migrations.schema_migrations order by 1 desc limit 3` → la última debe ser `20261018042037` (o posterior sin tocar estas tablas).
3. Re-ejecutar `supabase/tests/anon-write-fix/01_effective_write_exposure.sql` y comprobar que las 11 tablas siguen en la lista (si ya hubo cambios, la migración lo dirá abortando).
4. Respaldo: confirmar copia automática/PITR reciente y guardar la salida de `03_capture_current_state.sql`. Copia lógica de las tablas con datos:
   ```bash
   pg_dump "$DATABASE_URL" --no-owner --format=custom \
     -t public.postulantes -t public.alumnos_programas -t public.notificaciones \
     -t public.student_cases -t public.student_case_alerts -t public.student_case_events \
     -t public.comunicaciones_seguimiento -t public.registros_pendientes \
     -t public.tarea_comentarios -t public.student_case_actions -t public.alumno_escolaridad \
     -f soi_bloque1_2026-10-20.dump
   ```
5. Repetir la consulta de logs de API (ventanas de ≤12 h; la de 24 h falló en nuestro intento) buscando escrituras a estas tablas con rol distinto de admin.
6. Ventana: fuera de horario de clases. La migración es una transacción única; si algo queda abierto, aborta sin cambios.

## Aplicar

Con el archivo tal cual (una sola transacción, `ON_ERROR_STOP`). No usar el ledger para «marcar como aplicada» sin ejecutarla.

## Validación posterior (solo lectura)

1. Escáner de exposición: ninguna de las 11 tablas debe aparecer para `authenticated` con escritura incondicional ni para `anon` con ningún privilegio.
2. Prueba manual por rol (la suite automática cubre la base, no los clics):
   - **Admin:** abrir Postulados (cambiar estado, borrar uno de prueba), Seguimiento pedagógico (crear caso, registrar acción), Comunicaciones (registrar contacto), campana de notificaciones, enviar una notificación a un maestro.
   - **Maestro:** campana (ver, marcar leída, marcar todas, borrar), pedir una ausencia (debe llegar la notificación a dirección), asistente de inscripción hasta el final (el aspirante debe quedar `inscrito`), lista de alumnos con su programa, panel «clases de hoy» (pendientes de asistencia).
   - **Alumno/representante de prueba (si existe):** no deben ver postulantes, casos, ni notificaciones ajenas.
3. Revisar 30 minutos los logs: `401/403` o `42501` en estas tablas = alguien dependía de la apertura.
4. Registrar la migración en el ledger.

## Rollback

`supabase/rollback/20261020120000_…rollback.sql` restaura políticas y ACL exactas capturadas en producción y retira las siete funciones. **Reabre la vulnerabilidad** (incluida la lectura anónima de `alumnos_programas`). Antes de usarlo, intentar corregir hacia adelante ampliando `tiene_capacidad_estudiantil()` en una migración revisada. Si se hace rollback, revertir también el front (o dejarlo: la RPC desaparece y el asistente registraría un aviso, sin romper la inscripción).

## Reproducir las pruebas

```bash
npm run test:db:authenticated-wide-open          # requiere Docker (postgres:17), puerto 54329
node supabase/tests/authenticated-wide-open/mutation_check.mjs   # ocho mutantes, todos deben ser detectados
```
