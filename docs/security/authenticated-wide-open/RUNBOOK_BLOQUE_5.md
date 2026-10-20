# Runbook de aplicación — Bloque 5 (catálogos y configuración)

Migración: `supabase/migrations/20261020131000_restrict_authenticated_write_catalogs_config_block5.sql`
Rollback: `supabase/rollback/20261020131000_restrict_authenticated_write_catalogs_config_block5.rollback.sql`
**Nada de esto se ha ejecutado en producción.** Aplicar solo con autorización expresa del titular.

## Antes de aplicar

1. **No hay cambio de front.** Ningún archivo de `src/` se modificó: el bloque se puede aplicar en cualquier momento, sin orden respecto a un despliegue. (Distinto del bloque 1, que sí lo exige.)
2. **Dependencia.** La migración exige `public.tiene_capacidad_academica(text)` (migración `20261018042037`, ya en el ledger de producción). Si falta, aborta sin cambios. **No depende** del bloque 1 (`20261020120000`) ni de R9/Storage: puede aplicarse antes o después.
3. Confirmar el ledger: `select version from supabase_migrations.schema_migrations order by 1 desc limit 3` → debe contener `20261018042037`.
4. Re-ejecutar el escáner `supabase/tests/anon-write-fix/01_effective_write_exposure.sql` y comprobar que las 9 tablas siguen en la lista (si ya cambiaron, la autoverificación de la migración aborta).
5. Respaldo: confirmar PITR/copia reciente y guardar la salida de `03_capture_current_state.sql`. Copia lógica (todas las tablas son pequeñas):
   ```bash
   pg_dump "$DATABASE_URL" --no-owner --format=custom \
     -t public.departamentos -t public.instrumentos -t public.niveles -t public.modulos \
     -t public.unidades -t public.ejercicios -t public.configuracion_recordatorios \
     -t public.seguimiento_reglas -t public.soi_process_contracts \
     -f soi_bloque5_2026-10-20.dump
   ```
6. Logs de API (ventanas de ≤12 h, no 24 h): buscar `POST|PATCH|PUT|DELETE` sobre `/rest/v1/(departamentos|instrumentos|niveles|modulos|unidades|ejercicios|seguimiento_reglas|soi_process_contracts)` con un rol que no sea admin. Se esperan solo `configuracion_recordatorios` (preferencias de cada maestro). En la sesión de análisis la API de logs no estuvo disponible, así que **esta evidencia está pendiente**.
7. Ventana: la migración es una transacción única, de milisegundos; si algo queda abierto, aborta sin cambios. No requiere horario especial.

## Aplicar

Con el archivo tal cual (una sola transacción, `ON_ERROR_STOP`). No usar el ledger para «marcar como aplicada» sin ejecutarla.

## Validación posterior (solo lectura)

1. Escáner de exposición: ninguna de las 9 tablas debe aparecer para `authenticated` con escritura incondicional, ni para `anon` con ningún privilegio.
2. Prueba manual por rol (la suite automática cubre la base de datos, no los clics):
   - **Admin:** «Correos Departamentos» (editar un correo y enviar el correo de prueba), Pedagógico → Seguimiento → Configurar reglas (editar un umbral y revertirlo), Hermes → Procedimientos (se listan los contratos), módulo Instrumentos (crear, asignar, marcar dañado).
   - **Maestro:** portal de maestros → preferencias de notificaciones (cambiar y guardar; recargar y ver que persiste; es un *upsert*), planificación/ruta académica (lectura de niveles, módulos, unidades, ejercicios).
   - **Coordinación académica:** puede editar catálogos e instrumentos; **no** puede guardar correos de departamentos ni reglas de seguimiento (error `42501`, comportamiento deseado). Si coordinación necesita alguno, ampliar `tiene_capacidad_configuracion()` en una migración revisada.
   - **Dirección / finanzas / operaciones:** leen departamentos, instrumentos, reglas y contratos (portal de calendario/Hermes); no escriben.
   - **Alumno/representante de prueba (si existe):** leen el árbol curricular; no ven departamentos, instrumentos, reglas ni contratos.
3. Revisar 30 minutos los logs: `401/403` o `42501` sobre estas tablas = alguien dependía de la apertura.
4. Registrar la migración en el ledger.

## Rollback

`supabase/rollback/20261020131000_…rollback.sql` restaura las políticas y ACL exactas capturadas en producción y retira las tres funciones auxiliares (no toca `tiene_capacidad_academica`). **Reabre la vulnerabilidad** (incluidos los privilegios de `anon` sobre siete tablas). Antes de usarlo, intentar corregir hacia adelante ampliando `tiene_capacidad_configuracion()` o `puede_leer_*()` en una migración revisada. Es idempotente y se puede volver a aplicar después.

## Reproducir las pruebas

```bash
npm run test:db:authenticated-wide-open-block5     # requiere Docker (postgres:17), puerto 54329
node supabase/tests/authenticated-wide-open-block5/mutation_check.mjs   # diez mutantes, todos deben ser detectados
```

El arnés del bloque 1 (`npm run test:db:authenticated-wide-open`) no se tocó y sigue funcionando por separado.
