# Runbook — aplicar y revertir `20261017190000_secure_permisos_maestros_self_edit`

Alcance: solo `public.permisos_maestros` (políticas y privilegios). Sin datos, sin esquema de columnas, sin tocar triggers. Independiente de `20261017180000` (escritura anónima), de Storage y del módulo QR.

## Antes de aplicar

1. Respaldo reciente o PITR confirmado en el panel; anotar la hora.
2. Ejecutar [`01_capture_and_verify.sql`](../../../supabase/tests/permisos-maestros-fix/01_capture_and_verify.sql) (solo lectura) y guardar la salida. Debe mostrar **5 políticas** (`Maestro ve sus propios permisos`, `Permitir actualizar...`, `Permitir insertar...`, `Todos pueden leer permisos`, `permisos_maestros_admin_read`), `authenticated` con 8 privilegios, 2 triggers. Si difiere, **detenerse**: el rollback restaura el estado capturado el 2026-10-17, no otro.
3. Fuera de horario de clases. Aviso a quien administre permisos: durante segundos la tabla toma un bloqueo breve (`lock_timeout` de 10 s; si no lo obtiene, la migración falla sin cambios).
4. Prueba manual por rol (sección 6 del informe) en un entorno con datos.

## Aplicar

Un solo archivo, transacción única con auto-verificación (aborta y no deja nada a medias):

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20261017190000_secure_permisos_maestros_self_edit.sql
```

(o pegarlo completo en el SQL Editor de Supabase). Registrar la versión en el ledger de migraciones.

## Validar

1. `01_capture_and_verify.sql` otra vez. Esperado: **4 políticas** (`Maestro ve sus propios permisos`, `permisos_maestros_admin_insert`, `permisos_maestros_admin_read`, `permisos_maestros_admin_update`); `authenticated = INSERT,SELECT,UPDATE`; sin `anon`; mismos 2 triggers; sin grants por columna; RLS `true / false`.
2. Prueba manual: admin concede, revoca, aprueba solicitud e inactiva un maestro; maestro abre el portal y ve sus permisos (también en vivo).
3. Durante 30 minutos, registros de API: `403` en `permisos_maestros` desde cuentas de maestro = alguien dependía de la apertura (no se encontró ninguno entre el 13 y el 17 de octubre).

## Revertir

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/rollback/20261017190000_secure_permisos_maestros_self_edit.rollback.sql
```

Restaura exactamente las tres políticas textuales de producción y `GRANT ALL` a `anon` y `authenticated`. **Reabre R9.** Úselo solo si un flujo legítimo falla y no puede corregirse hacia adelante; verificar con `01_capture_and_verify.sql` que vuelven las 5 políticas. Reaplicar la migración después funciona (probado).

## Reproducir las pruebas

```bash
npm run test:db:permisos-maestros   # Docker; suite + mutación
```
