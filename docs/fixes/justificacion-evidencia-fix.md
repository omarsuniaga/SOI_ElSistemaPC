# Fix: evidencia de justificación (portal de maestros)

Ámbito real: `src/portal-maestros/{views/asistenciaView.js, components/JustificacionModal.js,
components/attendance/JustifModalManager.js, services/justificacionService.js}`.
(`src/modules/asistencias/views/asistenciasView.js` es solo visor de solo lectura, no se toca.)

## Bugs y fix

1. **Bucket inexistente ('documentos-private') → imagen se perdía en silencio al crear.**
   `justificacionService.js`: `BUCKET_DOCUMENTOS` cambiado a `'documentos'` (el bucket real,
   usado por `ausenciaService.js`, `fileUploadService.js`, `planningDocService.js`).

2. **Lógica de storage duplicada en el flujo de edición.**
   `JustifModalManager.js` subía/borraba archivos inline con Supabase directo.
   Ahora reusa `uploadEvidencia`/`deleteEvidencia`/`actualizarJustificacion` exportadas
   de `justificacionService.js`.

3. **Quitar evidencia no se persistía.**
   El botón "×" solo limpiaba estado local del modal. Se agregó el flag `_evidenciaRemoved`
   en `JustificacionModal.js`, que viaja por `onSave` hasta `actualizarJustificacion()`,
   la cual borra el archivo viejo y pone `evidencia_url: null` cuando corresponde.

4. **Sin validación de tamaño/tipo en el input de evidencia.**
   Se agregó validación (5 MB, `pdf|jpeg|png`) en `JustificacionModal.js` (feedback inmediato)
   y en `uploadEvidencia()` (defensa en el servicio), reusando los errores tipados
   `FileTooLargeError`/`InvalidMimeError` ya existentes en `fileUploadService.js`.

5. **(Encontrado al corregir #2/#3) Orden borrar-antes-de-subir dejaba URL rota si la subida fallaba.**
   `actualizarJustificacion()` ahora sube el archivo nuevo primero y solo borra el viejo
   si la subida tuvo éxito; si falla, conserva la evidencia anterior.

## Test plan

- `justificacionService.test.js`: bucket correcto en upload/delete, los 3 casos de
  `actualizarJustificacion` (reemplazar / quitar / sin cambios), orden subir-antes-de-borrar,
  validación de tamaño/tipo lanzando los errores tipados.
- `JustifModalManager.test.js` (nuevo): wiring onSave/onDelete usa las funciones del servicio,
  no Supabase directo.
