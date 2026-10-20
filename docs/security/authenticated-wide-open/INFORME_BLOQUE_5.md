# Informe — Bloque 5: catálogos y configuración abiertos a cualquier cuenta autenticada

**Fecha:** 20 de octubre de 2026 · **Rama:** `claude/bloque5-catalogos-e2b160` (parte de `claude/authenticated-wide-open-tables-8c6153`, bloque 1)
**Migración:** `20261020130000_restrict_authenticated_write_catalogs_config_block5.sql` · **Estado:** nada aplicado en producción, nada fusionado. Producción solo se consultó en lectura (`pg_catalog`, agregados, estadísticas).

## Veredicto: APTO CON CONDICIONES

La corrección es correcta, probada, reversible y **no requiere cambios de front**. Condiciones antes de aplicar (ver [RUNBOOK](./RUNBOOK_BLOQUE_5.md)):

1. **Prueba manual por rol** (admin, maestro, coordinación): la suite cubre la base de datos, no los clics. Las dos pantallas con escritura de admin (Correos Departamentos, reglas de seguimiento) y el guardado de preferencias del maestro son las que hay que mirar.
2. **Decisión del titular sobre dos endurecimientos que van más allá del encargo** (sección 3): `departamentos` y `seguimiento_reglas` quedan solo para admin/superadmin, de modo que **coordinación académica deja de poder editarlos**; y `soi_process_contracts` queda de solo lectura para toda la API. Si se quiere otro reparto, es un cambio de una línea en `tiene_capacidad_configuracion()`.
3. **Respaldo** verificado.
4. **Evidencia de logs ausente:** la API de logs no estuvo utilizable en esta sesión (rechazó las tablas de logs). Se usaron los contadores acumulados de `pg_stat_user_tables` (sección 2). Repetir la consulta de logs (ventanas ≤12 h) el día de aplicar.

## 1. Riesgo

Las nueve tablas tenían una política `ALL TO authenticated USING (true) WITH CHECK (true)`: cualquier cuenta con sesión (`alumno`, `representante`, `user`…) podía, con una llamada PostgREST y la clave pública:

| Tabla (filas) | Qué podía hacer |
|---|---|
| `departamentos` (7) | **cambiar el correo de un departamento**: `email` es la dirección que Hermes y `send-email` usan para despachar correo institucional → desvío de correo / suplantación. También leer todos los correos y responsables. |
| `instrumentos` (3) | leer el inventario con el nombre del alumno que tiene cada instrumento; crear, reasignar o dar de baja instrumentos |
| `niveles` (3), `modulos` (1), `unidades` (1), `ejercicios` (2) | alterar o borrar el árbol curricular (`niveles` borra en cascada módulos, unidades y ejercicios) |
| `seguimiento_reglas` (5) | cambiar los umbrales que fijan el nivel de ausentismo de cada alumno (`vw_seguimiento_ausentes`) → afecta qué alumnos se marcan en seguimiento (R6) |
| `soi_process_contracts` (4) | reescribir contratos de procesos Hermes (responsables, evidencias, plantillas de tarea) |
| `configuracion_recordatorios` (1) | leer y reescribir las preferencias de recordatorio de **cada** maestro |

Además `anon` conservaba **todos los privilegios** (`arwdDxtm`) sobre siete de las nueve (todas salvo `instrumentos` y `soi_process_contracts`). Verificado: ninguna política dejaba pasar a `anon` (las `*_admin_read` usan `es_admin()`, falso sin sesión), así que **no leía ni escribía nada hoy**, pero era una política permisiva de distancia de una fuga. La suite lo documenta «antes» (43 casos).

## 2. Consumidores (verificados en código y catálogo)

| Tabla | Quién la usa hoy | Tratamiento |
|---|---|---|
| `departamentos` | módulo admin «Correos Departamentos» (`departamentosSupabase.js`: lista y `UPDATE` de nombre, correos, responsable, activo); RPC `fn_email_departamento` (`SECURITY DEFINER`) | lectura: personal institucional; `UPDATE` solo de esas columnas, solo admin/superadmin. Sin INSERT/DELETE (ningún flujo los usa) |
| `instrumentos` | módulo `instrumentos` (listar, crear, editar, asignar, estado); RPC `fn_reportar_instrumento_danado` (`SECURITY DEFINER`) | lectura: personal institucional; INSERT/UPDATE por `catalogo:escribir` (admin, superadmin, coordinación). Sin DELETE |
| `niveles`, `modulos`, `unidades`, `ejercicios` | **ningún código de `src/` ni edge function las lee o escribe** (el portal de maestros lee `levels`/`nodes`, no estas). FKs desde `clases`, `contenidos_sesion`, `planificaciones`, `progresos` | lectura: toda cuenta con sesión (catálogo no sensible, igual que `programas`); escritura: `catalogo:escribir` |
| `seguimiento_reglas` | módulo pedagógico (`seguimientoRulesService`: lista, crea, edita, alta masiva); vista `vw_seguimiento_ausentes` (`security_invoker`) | lectura: admin, superadmin, dirección, coordinación, finanzas, operaciones; INSERT/UPDATE solo admin/superadmin. Sin DELETE |
| `soi_process_contracts` | Hermes (`getProcessContracts`, solo lectura), portal de calendario (nombres de procesos, solo lectura), edge functions `tool-gateway` y `telegram-classifier-cron` (`service_role`), RPC `fn_hermes_*` (`SECURITY DEFINER`, actualiza `recurrence_count`) | lectura: el mismo personal que reglas (sin maestros); **ninguna escritura por API** |
| `configuracion_recordatorios` | `portal-maestros/services/pushService.js`: cada maestro lee y hace *upsert* por `profile_id` de **su** fila; cron `fn_generate_class_start_reminders` (`SECURITY DEFINER`) | cada cuenta lee/inserta/actualiza solo su fila; admin/superadmin leen todas. Sin DELETE |

Sin cron (`cron.job`) que mencione estas tablas. La única vista que depende de ellas es `vw_seguimiento_ausentes`. Las funciones `SECURITY DEFINER` (propietario `postgres`, RLS no forzado) no se ven afectadas: la suite lo comprueba.

**Evidencia de uso (sin logs).** Contadores acumulados de `pg_stat_user_tables` (desde el último reinicio de estadísticas, fecha desconocida): `configuracion_recordatorios` 2 INSERT / 34 UPDATE (preferencias de maestros, coherente con el código); `soi_process_contracts` 12 UPDATE (coherente con `recurrence_count` vía RPC definer); `instrumentos` 10/5/1; `niveles` 3 INSERT / 8 DELETE; el resto solo INSERT de carga inicial. No se puede atribuir cada escritura a un rol: es ausencia de evidencia en contra, no prueba.

## 3. Diseño (mínimo privilegio, por capacidad) y desviaciones del encargo

Tres funciones nuevas (`SECURITY DEFINER`, `search_path` fijo, `EXECUTE` revocado a `anon`): `tiene_capacidad_configuracion(text)`, `puede_leer_catalogo_staff()`, `puede_leer_configuracion_institucional()`. Se reutiliza `tiene_capacidad_academica('catalogo:escribir')` (ya en producción). No se lee `permisos_maestros`. `dirección` no escribe nada. Cada tabla: `REVOKE ALL` a `anon`/`authenticated` y `GRANT` mínimo (sin TRUNCATE/REFERENCES/TRIGGER). El bloque es independiente del bloque 1.

Desviaciones respecto al encargo, con su motivo — **a confirmar por el titular**:

- **`configuracion_recordatorios` no es configuración institucional**: es una preferencia **por usuario** (`profile_id` único, FK a `profiles`) que cada maestro guarda desde su portal. Dejarla «solo admin» habría roto ese guardado. Se protege con *fila propia* (`profile_id = auth.uid()`, también en `WITH CHECK` para impedir re-dirigirla), y admin/superadmin pueden leer todas. El *upsert* de PostgREST incluye `profile_id` en el `SET`, por eso INSERT/UPDATE son de tabla completa; la política es lo que impide tocar la de otro.
- **`departamentos` solo admin/superadmin** (el encargo lo listaba entre los catálogos con `catalogo:escribir`). Su `email` enruta correo institucional: es configuración sensible, no un catálogo académico. Coordinación sigue leyéndola.
- **`seguimiento_reglas` solo admin/superadmin** (configuración, como pedía el encargo): coordinación académica, que antes podía editarla por la apertura, ya no.
- **`soi_process_contracts` sin escritura por API**: ningún cliente la escribe; si algún día se necesita, se añade una política con `tiene_capacidad_configuracion`.
- `niveles`, `modulos`, `unidades`, `ejercicios`: lectura abierta a cualquier cuenta con sesión (portales de alumnos incluidos), escritura por `catalogo:escribir`, tal como pedía el encargo.

La migración se autoverifica y **aborta** si: queda RLS desactivado, `anon` conserva algún privilegio (de tabla o de columna), `authenticated` conserva TRUNCATE/REFERENCES/TRIGGER, existe **cualquier** política fuera de la lista blanca exacta (aunque se escriba como `own OR true`, restrictiva o para otro rol), o falta una esperada. Si falta `tiene_capacidad_academica`, se niega a correr.

## 4. Cambios de front

**Ninguno.** Los clientes ya escriben exactamente lo que las nuevas políticas permiten (verificado línea a línea). Efecto visible esperado: un usuario no admin que abra «Correos Departamentos» o las reglas de seguimiento verá un error `42501` al guardar (antes lo lograba por la apertura). Con los 6 admins y 25 maestros reales de producción no cambia nada.

## 5. Pruebas (PostgreSQL 17 aislado, esquema real de producción capturado en solo lectura)

Línea base: subconjunto de producción anterior + migración ya aplicada de las ocho tablas + `prod_schema_subset_block5_2026-10-20.sql` (columnas, defaults, restricciones, RLS, políticas, triggers y ACL de las nueve tablas; vista `vw_seguimiento_ausentes` reducida a su dependencia). 20 actores: anon, user, alumno, representante, maestro titular/suplente/ajeno/con `activo=false`, coordinación, dirección, 6 admins, admin inactivo, superadmin, finanzas, operaciones, service_role.

| Fase | Resultado |
|---|---|
| Antes (la exposición existe; `anon` con privilegios en siete tablas) | 43/43 |
| Después: matriz actor × tabla × operación (incluye columnas no concedidas y *upsert* de preferencias) | 924/924 |
| Flujos con triggers activos y FKs exigidas (árbol curricular con borrado en cascada, ciclo de vida de un instrumento, edición de correo de departamento + lectura `SECURITY DEFINER`, guardado doble de preferencias del maestro, cron de recordatorios, reglas + vista, Hermes lee y actualiza contrato) | 210/210 |
| Lista blanca de políticas (sin restrictivas, sin sobrantes) | 9/9 |
| ACL exacta de tabla y de columna, RLS activo, `anon` sin ningún privilegio, funciones sin `EXECUTE` para `anon` | 29/29 |
| Idempotencia (aplicar dos veces) | 2/2 |
| Autoverificación: política desconocida (ALL, `TO public`, `own OR true`, restrictiva), RLS desactivado o precondición ausente abortan la migración, de forma atómica | 12/12 |
| Rollback exacto (políticas, ACL de tabla y columna, RLS), idempotente, reaplicable; no toca `tiene_capacidad_academica` | 47/47 |
| **Total** | **1276/1276** |

**Prueba de mutación** (`mutation_check.mjs`): 10 mutantes (política permisiva residual añadida tras la autoverificación; `dirección` con la capacidad de configuración; UPDATE de tabla completa en `departamentos`; `anon` recupera SELECT; `own OR true` en preferencias; INSERT de preferencias sobre otro perfil; reglas escribibles por quien las lee; maestros leen contratos; contratos escribibles de nuevo; inventario legible por todos). **Los 10 fueron detectados** (de 1 a 26 fallos cada uno). La primera pasada dejó escapar uno (INSERT de preferencias sobre un perfil sin fila previa, que la matriz no ejercía) y otro era inválido por un error del propio script (`$$` en un reemplazo de JavaScript); se añadió el caso que faltaba y se corrigió el script, y la pasada final es la que se informa.

## 6. Hallazgos laterales (fuera de alcance, para seguimiento)

| # | Hallazgo | Severidad |
|---|---|---|
| L1 | `fn_email_departamento(text)` es `SECURITY DEFINER` y **ejecutable por `anon`**: cualquiera sin sesión obtiene el correo de un departamento dado su código. Cerrar RLS no la afecta. | Media |
| L2 | `fn_reportar_instrumento_danado(...)` es `SECURITY DEFINER`, ejecutable por cualquier cuenta autenticada y **sin comprobación de rol** en su cuerpo: marca cualquier instrumento como dañado y crea cinco tareas (LUT/LOG/FIN/ACM/COM). Mismo patrón que R2 del bloque 1. | Alta |
| L3 | `es_admin()` incluye el rol `inventarista`, que `profiles_rol_check` no permite: rama muerta, pero el rol existiría si se ampliara la restricción. Este bloque usa `soi_security.has_role`, que no lo incluye. | Informativo |
| L4 | `fn_sincronizar_arbol_curricular` es ejecutable por `anon` pero su guarda (`es_admin()` o maestro de la clase) lo detiene (visto en su cuerpo; no se auditó el resto de la función). | Informativo |

## 7. Riesgos residuales

| # | Riesgo | Severidad |
|---|---|---|
| R1 | Un maestro lee **todos** los departamentos (correos y responsables) y el inventario de instrumentos con el nombre del alumno. Acotarlo exige rediseñar esas pantallas. | Baja |
| R2 | Un maestro con `profiles.activo=false` (hay 6) sigue leyendo por `maestro_actual()`; igual que en migraciones anteriores. | Informativo |
| R3 | El portal de calendario/Hermes lo usan roles institucionales; si algún maestro lo usara, perdería la lectura de nombres de procesos (los maestros no están en la lista de lectura de contratos). Verificar en la prueba manual. | Baja |
| R4 | Las preferencias de recordatorio las puede crear cualquier cuenta para sí misma (no solo maestros). Efecto nulo: solo gobiernan los recordatorios de la propia cuenta. | Baja |
| R5 | Evidencia de uso solo por contadores acumulados (sin logs). | Media |
| R6 | Quedan 27 tablas del inventario abiertas (bloques 2, 3, 4 y 6 de [INVENTARIO_Y_PLAN](./INVENTARIO_Y_PLAN.md)) y las funciones `SECURITY DEFINER` ejecutables por `anon` (L1, L2). | Alta |
| R7 | Las nueve tablas no llevan `institucion_id` (R3 de la política estructural); deuda previa, no se agrava. | Baja |

POLICY-EXCEPTION R3: no se crea ninguna tabla — las nueve ya existían sin `institucion_id` — se pagará con el backlog multi-institución (`departamentos`, `instrumentos` y el árbol curricular son los primeros candidatos), no en este PR.
