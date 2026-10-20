# Etiquetas de alumnos en observaciones

## Solicitud
Omar reporta que seleccionar dos alumnos desde # deja nombres pegados, sin sus
hashtags, y ## sueltos al final. Cada selección debe ser una etiqueta independiente.

## Diagnóstico
El popup deja perder el foco en mousedown y el editor restaura un Range vivo que
puede haberse colapsado al inicio al reconstruir el resaltado. La inserción antigua
no actualiza el caret guardado. Además, el token se reemplaza parcialmente (consulta,
pero no #), así que los siguientes nombres se insertan contra una posición antigua.

## Resultado
- Cada alumno seleccionado se representa con span no editable, nombre y # propios,
  data-student-id, espacio de separación y cursor posterior a la etiqueta.
- El guardado sigue siendo texto canónico #Nombre completo; no se cambia el esquema.
  Los IDs de los spans pertenecen a la representación del editor y se rehidratan
  solo con coincidencias de nombre completo inequívocas en la nómina actual.
- El popup conserva la selección, reemplaza el token completo y es una sola instancia.
- Doble pulsación de # reutiliza la consulta pendiente; no acumula hashtags.
- Una respuesta asíncrona se descarta si el texto, cursor o petición ya cambió.
- Un alumno seleccionado deja de funcionar como disparador de autocompletado.
- Retroceso y Supr quitan una etiqueta completa. El texto alrededor se conserva.
- El cierre del editor limpia peticiones, temporizadores y listeners globales.
- El popup se adapta al ancho móvil y Tab acepta la opción resaltada.
- Los cierres de [], () y {} ya existentes no se duplican al autocompletar.

## Verificación
Prueba de regresión añadida primero en 70efafc: dos alumnos consecutivos, consulta
parcial, orden, caret, carga de etiquetas, respuestas tardías y doble hashtag.
Pruebas adicionales: Retroceso, cambio de foco, inserción entre texto, rehidratación,
nombres duplicados y cierres de delimitadores. CI usado por falta de runtime local.

## Revisión manual pendiente
En escritorio y móvil: elegir tres alumnos seguidos con ratón/tacto y teclado,
seguir escribiendo, borrar la última etiqueta, guardar y reabrir la fecha.
Comprobar que el texto canónico sigue siendo compatible con informes y revisión IA.

CI rojo confirmado: 7 regresiones fallan en la implementación previa y los otros
4.802 tests pasan. Próximo gate: misma prueba sobre la corrección más suite completa.
