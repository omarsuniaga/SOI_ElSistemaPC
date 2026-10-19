# Permisos ADM: cambios consecutivos sin recargar

## Solicitud y diagnóstico
Omar reportó que conceder un permiso impedía modificar los siguientes hasta recargar. La fila se regeneraba con el estado de guardado todavía activo y el desbloqueo operaba sobre un control retirado del DOM.

## Comportamiento
- Registrar alumnos, Gestionar clases y Crear clases se pueden activar y revocar consecutivamente.
- Cada maestro tiene su propio bloqueo durante el guardado. Otras filas siguen disponibles.
- Se actualiza únicamente la fila afectada después de liberar el bloqueo, tanto al guardar como al fallar.
- Aprobar solicitudes utiliza el mismo bloqueo para evitar escrituras simultáneas en esa fila.
- Los permisos locales cambian después de confirmar la persistencia. Los errores restauran los valores anteriores.
- Se conservan las restricciones actuales de elegibilidad y la eliminación de alias al revocar.

## Verificación
Dos pruebas reprodujeron el defecto antes de corregirlo. Después: 47 pruebas aprobadas en cinco archivos (vista, servicio del portal maestro, API/mocks y solicitudes). Incluyen nueve cambios consecutivos, rollback, dos maestros guardando simultáneamente y aprobación seguida de otra concesión sin perder el permiso anterior.

Build, tipos y lint de los archivos modificados aprobados. El control estructural conserva exactamente los hallazgos previos; no hay cambios en esquema ni en las reglas de autorización.

## Prueba manual
En ADM → Permisos, cambiar los tres permisos de un maestro elegible y volverlos a cambiar sin recargar. Con red lenta, comprobar bloqueo temporal de esa fila y disponibilidad de las demás. Con un error de guardado, comprobar el mensaje de error y la recuperación del valor anterior. Verificar los accesos correspondientes en el portal maestro tras actualizar sus permisos.
