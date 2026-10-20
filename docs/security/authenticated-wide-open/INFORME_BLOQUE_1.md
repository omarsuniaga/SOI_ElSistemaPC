# Informe — Bloque 1: datos personales de alumnos abiertos a cualquier cuenta autenticada

**Fecha:** 20 de octubre de 2026 · **Rama:** `claude/authenticated-wide-open-tables-8c6153`
**Migración:** `20261020120000_restrict_authenticated_write_student_data_block1.sql` · **Estado:** nada aplicado en producción, nada fusionado.

## Veredicto: APTO CON CONDICIONES

La corrección es correcta, probada y reversible. Condiciones antes de aplicar (ver [RUNBOOK](./RUNBOOK_BLOQUE_1.md)):

1. **Prueba manual por rol** (admin y maestro) en el entorno real: la suite cubre la base de datos, no los clics.
2. **Desplegar junto el cambio de front** (tres archivos del portal de maestros, sección 4).
3. **Respaldo** verificado.
4. **Evidencia de logs incompleta:** la API de logs falló en ventanas de 24 h y en dos días laborables; las ventanas que respondieron mostraron 0 escrituras a estas tablas. Es ausencia de evidencia, no prueba de que nadie dependa de la apertura. Repetir el día de aplicar.

## 1. Riesgo

Cualquier cuenta con sesión (`alumno`, `representante`, `user`…) podía, con una llamada PostgREST y la clave pública:

| Tabla (filas) | Qué podía hacer |
|---|---|
| `postulantes` (404) | leer nombres y WhatsApp de madres/padres, cambiar estados, borrar aspirantes |
| `alumnos_programas` (456) | reescribir matrícula y `calificacion`; **además `anon` (sin sesión) la leía entera** |
| `notificaciones` (526) | leer los mensajes de todos, reescribirlos, **crear notificaciones a cualquier perfil: cada INSERT dispara un push** (trigger `pg_net`) → suplantación/phishing |
| `student_cases`, `_alerts`, `_events`, `_actions` | leer y alterar niveles de riesgo de alumnos y borrar la pista de auditoría |
| `comunicaciones_seguimiento` (2) | leer teléfonos/notas, falsificar o borrar contactos |
| `registros_pendientes` (8), `tarea_comentarios` (1), `alumno_escolaridad` (0) | leer/alterar; suplantar autores de comentarios |

La suite lo demuestra «antes» (37 casos), incluido el caso anónimo.

## 2. Consumidores (verificados en código y catálogo)

| Tabla | Quién escribe hoy | Tratamiento |
|---|---|---|
| `postulantes` | UI admin (`postuladosSupabase`), edge functions con `service_role` (sync, WhatsApp, citas), asistente de inscripción del portal de maestros (`UPDATE estado/alumno_id`) | UPDATE/DELETE por capacidad `postulantes:gestionar` (admin/superadmin); el asistente usa la RPC `marcar_postulante_inscrito` (solo `estado`, `alumno_id`, `updated_at`); INSERT sigue cerrado a la API |
| `alumnos_programas`, `alumno_escolaridad` | ningún cliente escribe; RPC `SECURITY DEFINER` de inscripción | lectura: personal institucional; escritura: admin/superadmin |
| `notificaciones` | maestro → dirección (solicitud de ausencia), admin → maestro, cron y funciones `SECURITY DEFINER` (dueño, no afectados), función `notification-actions` (marcar leída con JWT del usuario) | leer/marcar leída/borrar solo las propias; INSERT por capacidad `notificaciones:administrar` o maestro→dirección (`tipo='sistema'`, destino NULL o perfil directivo); UPDATE solo columnas `estado`, `leida_en` |
| `student_*`, `comunicaciones_seguimiento`, `tarea_comentarios` | módulos admin (`pedagogico`, `comunicaciones`, `hermes`) | capacidades `casos_estudiantiles:gestionar`, `seguimiento_alumnos:gestionar`, `tareas:comentar` (admin, superadmin, coordinación académica); `direccion` solo lectura; eventos/acciones/comentarios de solo-añadir |
| `registros_pendientes` | edge functions y cron (service_role/dueño); clientes solo leen | solo SELECT (admin todo; maestro los propios o de su clase) |

Sin vistas definer ni cron que dependan de las políticas; `vw_seguimiento_ausentes` es `security_invoker` y sigue funcionando para quienes leen el seguimiento.

## 3. Diseño (mínimo privilegio, por capacidad)

Siete funciones nuevas (`SECURITY DEFINER`, `search_path` fijo, `EXECUTE` revocado a `anon`): `tiene_capacidad_estudiantil(text)`, `puede_leer_seguimiento_estudiantil()`, `es_personal_institucional()`, `puede_leer_postulantes()`, `es_perfil_directivo(uuid)`, `puede_ver_registro_pendiente(uuid,uuid)` y la RPC `marcar_postulante_inscrito(uuid,uuid)`. No leen `permisos_maestros`. `direccion` no recibe escritura. Cada tabla: `REVOKE ALL` a `anon`/`authenticated` y `GRANT` mínimo (sin TRUNCATE/REFERENCES/TRIGGER). R6: ninguna automatización nueva; el sistema no etiqueta ni expulsa a nadie, solo se ordena quién puede ver y editar lo que ya existía.

## 4. Cambios de front (necesarios)

- `WizardShell.js`: llama a la RPC en lugar de `UPDATE postulantes`.
- `ausenciasApi.js`, `ausenciasSupabase.js`: el maestro inserta la notificación a dirección **sin** `.select()` (no puede leer de vuelta una notificación ajena; la suite lo verifica). El valor devuelto pasa a `{ enviada, titulo, mensaje }`; ningún consumidor usaba el objeto de la fila. Pruebas vitest de esas áreas: 19 archivos / 146 pruebas en verde.

## 5. Pruebas (PostgreSQL 17 aislado, esquema real de producción capturado en solo lectura)

La línea base es el subconjunto de producción anterior + la migración ya aplicada de las ocho tablas + `prod_schema_subset_block1_2026-10-20.sql` (columnas, defaults, restricciones, RLS, políticas, triggers de las 11 tablas). 20 actores: anon, user, alumno, representante, maestro titular/suplente/ajeno/con `activo=false`, coordinación, dirección, 6 admins, admin inactivo, superadmin, finanzas, operaciones, service_role.

| Fase | Resultado |
|---|---|
| Antes (la exposición existe, incluida la lectura anónima) | 37/37 |
| Después: matriz actor × tabla × operación | 1197/1197 |
| Flujos con triggers activos y FKs exigidas (ciclo de casos, bitácora de contactos, embudo de postulantes, RPC y sus rechazos, campana del maestro, solicitud de ausencia, push solo por inserts autorizados, notificadores `SECURITY DEFINER`/cron, comentarios, pendientes, lista de alumnos con programa) | 315/315 |
| Lista blanca de políticas (sin restrictivas, sin sobrantes) | 11/11 |
| ACL exacta de tabla y de columna; `anon` sin ningún privilegio | 24/24 |
| Idempotencia (aplicar dos veces) | 2/2 |
| Autoverificación: políticas residuales desconocidas abortan la migración, de forma atómica | 6/6 |
| Rollback exacto (políticas, ACL de tabla y columna), idempotente, reaplicable | 41/41 |
| **Total** | **1633/1633** |

**Prueba de mutación** (`mutation_check.mjs`): 8 mutantes (política permisiva residual añadida tras la autoverificación; `direccion` con todas las capacidades; UPDATE de tabla completa en `notificaciones`; `anon` recupera SELECT; `own OR true`, que el chequeo literal no ve; maestro notifica a cualquiera; comentario sin control de autoría; eventos editables). **Los 8 fueron detectados** (de 1 a 39 fallos cada uno).

## 6. Riesgos residuales

| # | Riesgo | Severidad |
|---|---|---|
| R1 | Un maestro lee **todos** los postulantes (el asistente de inscripción los precarga). Acotarlo requiere rediseñar ese flujo (RPC de búsqueda). | Media |
| R2 | Funciones `SECURITY DEFINER` ejecutables por `anon` que escriben aspirantes/alumnos (`backfill_alumnos_desde_postulantes`, `fn_actualizar_*`) o generan notificaciones. **No las cubre ninguna política**; análisis propio pendiente. | Alta |
| R3 | `notificaciones`: un maestro puede enviar texto libre a dirección (necesario para la solicitud de ausencia); dispara push a esos perfiles. | Baja |
| R4 | La evidencia de logs es parcial (ver condición 4). | Media |
| R5 | Realtime de `notificaciones` respeta RLS: probado a nivel de políticas, no con un cliente Realtime real. Verificar la campana del maestro en vivo. | Baja |
| R6 | Un maestro con `profiles.activo=false` sigue operando por `maestro_actual()` (igual que la migración anterior). | Informativo |
| R7 | El resto de tablas (36) sigue abierto: ver [INVENTARIO_Y_PLAN](./INVENTARIO_Y_PLAN.md). | Alta |
| R8 | Las tablas del bloque no llevan `institucion_id` (R3 de la política estructural); es deuda previa, no se agrava. | Baja |

POLICY-EXCEPTION R3: no se crea ninguna tabla — las once ya existían sin `institucion_id` — se pagará con el backlog multi-institución, no en este PR.

## 7. Siguientes bloques

Ver orden en [INVENTARIO_Y_PLAN](./INVENTARIO_Y_PLAN.md): 2) progreso/gamificación y contenidos de sesión; 3) `tareas_institucionales` y casos Hermes; 4) documentos y planificación; 5) catálogos y configuración; 6) lutería y simulador. Orden de aplicación recomendado: bloque 1 → 5 (bajo riesgo de ruptura, gran reducción de superficie) → 2 → 4 → 6 → 3.
