# Registro compartido titular y suplente

Solicitud de Omar, 12 de noviembre de 2026. Un suplente asignado debe consultar el historial y registrar asistencia y observaciones de la clase cuando sustituye al titular. La prioridad es conservar la arquitectura y añadir una firma sencilla, sin exigir gestión de turnos ni fechas de suplencia.

## Implementación

- Planificación incluye al suplente en modo real y demo, conservando las asignaciones principales, auxiliares y heredadas.
- El historial y resumen de sesiones incluye las sesiones de las clases donde el maestro es suplente, además de sus sesiones propias; se conservan las restricciones de fecha y las políticas RLS.
- Cada nueva observación conserva la titularidad actual de `maestro_id` y guarda una instantánea `_author` en el JSON existente `contenido_parsed`: maestro actor, usuario, nombre, rol al escribir y fecha. No se modifica el texto musical ni se agregan tablas o columnas.
- La misma firma se conserva en la cola sin conexión. El modo demo permite guardar y consultar observaciones durante la sesión de la aplicación.
- Maestros y ADM muestran un bloque compartido de observaciones con firma. Las observaciones antiguas muestran «Autor no registrado», sin atribuciones retroactivas.
- El botón de observaciones resuelve el ID actual de la sesión al pulsarlo, permitiendo guardar después de crear una sesión sin recargar la pantalla.
- ADM resuelve el nombre del actor por `maestros.user_id`, además de `maestros.id`, utilizando la bitácora actual.

## Alcance y límites

La firma es identificación funcional de la aportación, no firma digital criptográfica ni evidencia inmutable. Las políticas existentes siguen siendo el límite de autorización; no se modifican permisos ni migraciones. Consultar una sesión compartida no prueba quién impartió la clase. No se atribuyen horas impartidas al suplente a partir de la firma. Este cambio no incorpora edición simultánea transaccional ni vigencia de suplencias: el usuario priorizó la sustitución del titular y un cambio mínimo. Esos riesgos del guardado anterior permanecen.

## Validación

50 pruebas focalizadas y 407 pruebas del alcance afectado aprobadas (2 omitidas): relación titular/suplente, planificación real/demo, lectura compartida, observaciones, firma escapada, persistencia sin conexión, historial y bitácora. Compilación y TypeScript aprobados; lint sin errores. `policy:check` detecta deuda de migraciones preexistentes (ninguna migración se modifica en este cambio); confirmada también en master sin cambios. Pendiente: prueba con dos cuentas reales y revisión visual autenticada. Publicado por autorización de Omar el 13/11/2026.

## Publicación y comprobaciones

- PR #167 fusionado como `e30d764302953e08cb033753b9bb4e4063b5fb78`.
- Integración con master responsive: 1.006 pruebas aprobadas, 3 omitidas; build, tipos y lint aprobados.
- CI del PR, ejecución 43374780547, completada correctamente.
- Deploy de producción `6af6a70ecad442ed6670deba`, estado ready, publicado el `2026-11-13T05:58:55.300Z`.
- Sin migraciones nuevas ni activación de servicios de IA de Netlify.
- Se conserva pendiente la revisión visual y funcional con dos cuentas reales; las pruebas automatizadas no sustituyen esa comprobación.
