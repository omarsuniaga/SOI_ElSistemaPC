# Registro de aplicación en producción — escritura anónima en ocho tablas

**Fecha:** 18 de octubre de 2026 · **Proyecto:** `zmhmdvmyeyswunurcyow` · **Autorizado por:** el titular (instrucción expresa en la conversación).
**Migración aplicada:** `restrict_write_access_academic_catalog_and_class_records` (contenido de `supabase/migrations/20261017180000_restrict_write_access_academic_catalog_and_class_records.sql`, sin comentarios de cabecera ni `BEGIN/COMMIT`; el conector la ejecuta en una sola transacción). El ledger la registró con la versión `20261018042037`, no con `20261017180000`: al fusionar la rama, esa migración ya figurará aplicada por nombre; **no volver a ejecutarla** (es idempotente, pero conviene `supabase migration repair` si el CLI reclama la versión).

## Antes (solo lectura)
- 39 políticas exactamente las del modelo; ninguna inesperada. ACL `arwdDxtm` para `anon` y `authenticated` en las ocho tablas.
- Filas: `programas` 7, `salones` 11, las otras seis 0.
- 5 administradores con `estado = activo` y `activo = true`; sin cuentas `direccion`, `coordinacion_academica` ni `superadmin`.
- Registros de API de las últimas 24 h: 0 escrituras y 0 peticiones anónimas a las ocho tablas.
- Respaldo lógico de `programas` y `salones` (7 + 11 filas) guardado fuera del repositorio; las demás tablas estaban vacías.

## Después (solo lectura y prueba revertida)
- La migración terminó sin error: su auto-verificación no abortó.
- 32 políticas, **exactamente** la lista blanca (ninguna sobrante, faltante ni restrictiva). `anon` conserva solo `SELECT` en `programas`. `authenticated` quedó sin `TRUNCATE/REFERENCES/TRIGGER/MAINTAIN`.
- Aserciones de `04_post_apply_assertions.sql`: 7/7 en `true`. Las RPC públicas del módulo de documentos y las vistas de cartelera siguen accesibles para `anon`.
- Filas intactas: `programas` 7, `salones` 11, sin filas de prueba.
- Prueba por rol dentro de un bloque que se aborta a propósito (nada persistió):

| Actor | Resultado |
|---|---|
| anónimo | lee `programas` (7); inserta/actualiza `programas` denegado; lee `salones` denegado; inserta `class_events` denegado; vista de cartelera responde |
| maestro | lee `programas` y `salones`; inserta `programas` denegado; actualiza `salones` 0 filas |
| administrador | inserta `programas`, actualiza `programas` (1) y `salones` (11); `tiene_capacidad_academica('catalogo:escribir')` = verdadero |

## Pendiente
- Prueba manual de interfaz por rol (admin, maestro) en el portal.
- Vigilar los registros de API unas horas: un `401/403` sobre estas tablas indicaría un cliente que dependía de la apertura.
- Aplicar R9 (`permisos_maestros`) y Storage por separado; siguen sin aplicarse.

## Reversión
`supabase/rollback/20261017180000_restrict_write_access_academic_catalog_and_class_records.rollback.sql` (probado). Reabre la vulnerabilidad: usar solo si un flujo legítimo falla y no se puede corregir hacia adelante.
