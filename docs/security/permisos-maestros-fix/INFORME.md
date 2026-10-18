# Informe — R9: edición propia en `permisos_maestros`

**Fecha:** 17 de octubre de 2026 · **Rama:** `claude/r9-permisos-maestros-selfedit-cecbbf`
**Migración:** `supabase/migrations/20261017190000_secure_permisos_maestros_self_edit.sql` · **Rollback:** `supabase/rollback/20261017190000_secure_permisos_maestros_self_edit.rollback.sql`
**Estado:** nada aplicado en producción ni fusionado. Producción solo se consultó en lectura (`pg_catalog`, agregados y registros de API).

## Veredicto: APTO CON CONDICIONES

La migración es mínima, probada por rol, idempotente, con auto-verificación y rollback exacto. Condiciones antes de aplicar: **(1)** prueba manual de interfaz (sección 6) y **(2)** re-ejecutar `01_capture_and_verify.sql` el día de aplicar y comprobar que el estado coincide con el "antes" (así el rollback es fiel). Además, hay una **corrección al informe anterior** (sección 1) que conviene leer primero.

## 1. Riesgo demostrado — y una corrección

El informe de la rama base dice que cada maestro podía auto-concederse `puede_inscribir_clases`, `permisos`, etc. **Eso no es cierto en producción.** Esa conclusión salió de la copia de esquema, que no incluía los triggers de `permisos_maestros`. En producción existe `trigger_check_permisos_maestros_integrity` (`BEFORE INSERT OR UPDATE`, `SECURITY DEFINER`) que, para quien no es admin, **restaura** `puede_registrar_alumnos`, `puede_inscribir_clases`, `puede_crear_clases`, `permisos` y `concedido_por`. La suite lo demuestra (fase "antes": esas cinco columnas no cambian).

Lo que **sí** se puede hacer hoy, demostrado en PostgreSQL 17 con ese trigger presente (fase "antes", 120/120):

| Qué hace un maestro con su propia fila | Antes | Después |
|---|---|---|
| Reactivar `puede_planificar` / `puede_asistir` que un admin puso en `false` (lo hace `retirar_maestro_seguro`) | **funciona** | rechazado |
| Borrar `fecha_fin` (vencimiento) o mover `fecha_inicio` | **funciona** | rechazado |
| Escribir `solicitudes` | **funciona** | rechazado |
| Crear su propia fila si no existe | **funciona** | rechazado |
| Leer las filas de **todos** los maestros | **funciona** | solo la suya |
| `TRUNCATE` (anon y authenticated tienen el privilegio) | privilegio presente | revocado |

Severidad real: **media-baja hoy** (el portal usa `puede_planificar`/`puede_asistir` como interruptores de interfaz y `retirar_maestro_seguro` los apaga para maestros retirados). Pero la defensa de las columnas críticas dependía **solo de un trigger**: cualquier columna de autorización futura, o un trigger deshabilitado/reemplazado, reabre la escalada. Por eso se corrige en RLS y no ampliando el trigger. La conclusión del informe base se mantiene: **no usar `permisos_maestros` como fuente de capacidades hasta aplicar esta migración.**

## 2. Consumidores (código, SQL y registros)

| Quién | Qué hace | Operación | Cambia con la migración |
|---|---|---|---|
| Admin: `permisosSupabase.js` (`actualizarPermiso`, `aprobarSolicitud`, `obtenerPermisos`) | concede/revoca, lista todo | upsert / SELECT | No (`es_admin()`) |
| Admin: `maestrosApi.js` (inactivar maestro) | `puede_planificar/puede_asistir = false` | UPDATE | No |
| RPC `SECURITY DEFINER` `approve_maestro_profile`, `retirar_maestro_seguro`, `eliminar_maestro_limpio` (dueño `postgres`, BYPASSRLS, con compuerta `es_admin()`) | fila por defecto, retiro, borrado | INSERT/UPDATE/DELETE | No (omiten RLS) |
| Portal del maestro: `permisoService.getPermisos`, canal realtime filtrado por `maestro_id` | lee **solo su fila** | SELECT | No (política "Maestro ve sus propios permisos") |
| `tiene_permiso()` (política de `alumnos_clases`, `asistencias`) | `SECURITY INVOKER`, lee la fila del que llama | SELECT | No (misma política) |
| Solicitud de permiso del portal (`crearSolicitud`) | escribe **`solicitudes_permisos`**, otra tabla | — | No aplica |
| Columna `permisos_maestros.solicitudes` | **sin escritor**; vacía en las 19 filas | — | Se cierra |
| Edge Functions | ninguna referencia | — | — |

**El maestro no necesita escribir ninguna columna** de la tabla, y tampoco leer las filas ajenas. Por eso se descartó el `GRANT` por columna (opción a): `admin` y maestro son ambos `authenticated`, un permiso por columna no los distingue.

**Registros de API** (herramienta `query_logs`, ventanas de 24 h; **13–17 de octubre**, no los 17 días del informe base porque las consultas amplias fallaron con "Backend error"): unas 88 peticiones a `permisos_maestros` (80 `GET`, 8 `POST`). Todas las escrituras (`POST ?on_conflict=maestro_id`) vienen de **una única cuenta admin**; las cuentas de maestro (hasta 11 distintas por día) solo hacen `GET ...maestro_id=eq.<su id>`. Cero escrituras de maestros. Límite: una escritura legítima más espaciada que 4 días no aparecería; el fallo sería inmediato (`403`/0 filas) y el rollback está probado.

Datos de producción (agregados): 19 filas; 6 con `permisos` no vacío; 0 con `solicitudes`; 0 con `fecha_fin`; 5 admin activos.

## 3. Solución (mínimo privilegio)

- `INSERT`/`UPDATE`: políticas `permisos_maestros_admin_insert` / `_update`, `es_admin()`. Ningún maestro escribe ninguna columna.
- `SELECT`: se elimina `"Todos pueden leer permisos"`; quedan la fila propia (`"Maestro ve sus propios permisos"`) y admin (`permisos_maestros_admin_read`).
- Privilegios: `anon` ninguno; `authenticated` solo `SELECT, INSERT, UPDATE` (sin `DELETE`, que ninguna política permite, ni `TRUNCATE/REFERENCES/TRIGGER/MAINTAIN`).
- El trigger de integridad **no se toca** (defensa en profundidad).
- Auto-verificación al final: aborta toda la transacción si queda una política de escritura que no sea exactamente `es_admin()`, una lectura incondicional, privilegios de `anon`/`PUBLIC`, privilegios extra de `authenticated`, grants por columna, o RLS apagado.

## 4. Pruebas (PostgreSQL 17 aislado; `npm run test:db:permisos-maestros`)

Línea base: subconjunto de producción de la rama base + `prod_overlay_permisos_maestros_2026-10-17.sql` (trigger, funciones y FK **textuales** de producción; `solicitudes_permisos` y los RPC son equivalentes modelados). 21 actores: anon, user, alumno, representante, finanzas, direccion, coordinacion, superadmin, 5 admin, admin inactivo, 5 maestros (propio, ajeno, sin fila, retirado, con permiso) y service_role.

| Fase | Resultado |
|---|---|
| Antes (el hueco existe; el trigger protege las 5 columnas críticas) | 120/120 |
| Después (matriz rol × operación, 10 columnas de autorización, `tiene_permiso`) | 120/120 |
| Flujos (conceder/revocar, solicitar/aprobar, RPC, pantallas admin) en el estado nuevo | 18/18 |
| Los mismos flujos en el estado viejo (no hay regresión funcional) | 18/18 |
| Idempotencia · lista blanca de políticas · ACL exacta | 1/1 · 3/3 · 1/1 |
| Colateral: políticas y ACL de todas las demás tablas idénticas | 1/1 |
| Auto-verificación aborta con política/privilegio residual (5 casos) y no deja cambios parciales | 10/10 |
| Rollback exacto (políticas, ACL, triggers), idempotente, y la migración se reaplica | 123/123 |
| **Mutación**: 3 mutantes (política residual de auto-edición, lectura total, privilegios intactos) | 3/3 detectados (19, 24 y 30 casos fallan) |

## 5. Riesgos residuales

| # | Riesgo | Severidad | Tratamiento |
|---|---|---|---|
| R10 | `solicitudes_permisos`: la política `"Maestro puede crear su solicitud"` no limita `estado`; un maestro puede insertar su solicitud ya como `'aprobado'` y el portal (`getPermisos`) la trata como concesión. Probado como "abierto, fuera de alcance" (1/1). Efecto: solo la interfaz; el servidor sigue exigiendo `permisos` (`tiene_permiso`) | Media | Migración propia: `WITH CHECK (... AND estado = 'pendiente')` + test |
| R11 | `es_admin()` ignora `profiles.estado/activo` y acepta `inventarista`, rol que el `CHECK` de `profiles` ya no permite. Un admin inactivo sigue escribiendo aquí (probado) | Baja | Es global a `es_admin()`; decisión aparte |
| R12 | `service_role` no puede INSERT/UPDATE en esta tabla: el trigger rechaza cuando `auth.uid()` es nulo. Igual antes y después; ningún Edge Function la escribe | Baja | Informativo |
| R13 | `superadmin` y `direccion` no pueden administrar permisos (igual que antes) | Baja | Informativo; decisión de negocio |
| R14 | Los RPC reales no se ejecutaron en el ensayo (se usaron equivalentes con la misma compuerta); `solicitudes_permisos` modelada | Baja | La prueba manual de la sección 6 cierra la brecha |

## 6. Prueba manual antes de aplicar (rama con datos o entorno real)

Admin: conceder y revocar desde *Permisos & Roles*; aprobar una solicitud; inactivar un maestro. Maestro: abrir el portal (se cargan sus permisos), pedir un permiso, ver el cambio en vivo cuando el admin lo concede (realtime). Si cualquiera falla: rollback.

## 7. Habilitar luego capacidades individuales (p. ej. `catalogo:escribir`)

Una vez aplicada esta migración, `permisos_maestros.permisos` solo lo escribe un admin (o un RPC `SECURITY DEFINER`), así que ya puede ser fuente de capacidades. Pasos, en una migración **aparte** y con su propia suite:

1. En `tiene_capacidad_academica(cap)`, añadir una rama: `EXISTS (SELECT 1 FROM permisos_maestros pm WHERE pm.maestro_id = maestro_actual() AND cap = ANY(pm.permisos) AND current_date BETWEEN pm.fecha_inicio AND coalesce(pm.fecha_fin, 'infinity'))`, **conservando** la exigencia de perfil `estado='activo'` y `activo`.
2. Capacidades con nombre de recurso (`catalogo:escribir`, `registros_clase:gestionar`, `alertas_asistencia:gestionar`), nunca banderas `puede_*`.
3. Pruebas: el maestro con la capacidad escribe; el maestro sin ella y el que intenta auto-concedérsela (rechazado en RLS, no solo por trigger) no; la revocación surte efecto inmediato.
4. Cerrar R10 antes, para que ningún flujo de solicitud conceda por la vía de la interfaz.
