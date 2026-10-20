# Barra de observaciones y dictado

Solicitud de Omar, 20-10-2026: aplicar los cambios anotados en la imagen del editor.

## Resultado

- Se conservan # alumno, [] contenido, () sugerencia y {} tarea.
- Se retiran los botones $ medida, > objetivo, / banco y el botón de informe tachados.
  Los tokens escritos en observaciones existentes siguen siendo compatibles con el editor.
- Se conserva el cohete para estructurar y la ayuda.
- Analizar con IA muestra «✨ IA» y conserva su nombre completo accesible.
- El micrófono queda a la derecha y añade texto plano en español al editor existente.
- No analiza ni evalúa automáticamente; el texto pasa por el mismo onChange/autoguardado.
- El reconocimiento empieza exclusivamente al pulsar el botón; una segunda pulsación
  solicita terminar y conserva los últimos resultados finales.
- No se insertan resultados parciales ni índices finales repetidos.
- Al salir de la clase, ocultar la página o abandonar la ventana se aborta el dictado.
- Si el navegador no admite reconocimiento, se explica el uso del dictado del teclado.
  SpeechRecognition puede requerir red y usar el servicio del navegador.

## Alcance y verificación

Rama aislada desde `claude/keen-brahmagupta-879rma`; incluye su trabajo de valoraciones.
Sin cambios a base de datos por esta tarea, sin fusionar ni publicar en producción.

Comprobación aislada del módulo real con API de navegador simulada: 13 aserciones
aprobadas (estado, idioma, finales, duplicados, detener, permisos, excepciones,
limpieza, página oculta y editor desconectado). Sintaxis de nuevos módulos y tests
comprobada. El entorno local de ejecución no estaba disponible; no se afirma haber
ejecutado Vitest, ESLint, typecheck, build ni Playwright.

Pruebas Vitest incluidas para barra y dictado. Validación pendiente en CI y portal
autenticado: escritorio/móvil, dictar con contenido previo, corregir, guardar,
recargar; probar rechazo de permiso, navegador sin soporte y salida mientras dicta.
La migración de valoraciones heredada de Claude sigue siendo un pendiente separado.
