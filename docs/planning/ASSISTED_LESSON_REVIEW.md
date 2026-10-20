# Registro asistido y valoración de clase

## Solicitud de Omar · 20-10-2026
Facilitar # alumno, [] contenido, () reforzar y {} tarea; dictar; mejorar la
redacción sin cambiar el mensaje; aclarar destinatarios y detectar valoraciones
pendientes; planificación académica contraída por defecto.

## Flujo
1. Escribir, dictar o usar botones con nombres y autocompletado. # prioriza
   presentes usando la nómina ya cargada, sin consultar alumnos de otra clase.
2. IA hace una sola llamada por el proxy existente. Propone fragmentos con su
   evidencia literal, tipo y destinatarios de la nómina. No asigna notas.
3. Validación local exige que las fuentes cubran todas las palabras del original;
   IDs ajenos, fuentes inventadas u omisiones descartan la propuesta completa.
   Si falla IA o en Demo, se conserva el texto completo para organización manual.
4. Maestro corrige texto/tipos y confirma presentes por fragmento. Los nombres
   ambiguos requieren selección. Cambios de texto/asistencia invalidan la revisión.
5. Confirmar solo contenido, o confirmar y abrir el panel de valoraciones existente.
   Se conserva la distinción 0 / Sin evaluar y se muestra cobertura. Selección
   múltiple explícita para grupos; luego se pueden corregir alumnos individuales.
6. Contenido confirmado usa DSL existente: #todos para presentes, y una línea por
   destinatario individual con nombre completo. No hay una nueva tabla/evaluador.
   Se rechazan nombres completos duplicados antes de atribución individual.
7. El historial HTML/PDF filtra esas líneas por alumno; no difunde un comentario
   individual al resto. El texto histórico libre no se reinterpreta automáticamente.

## Planificación
HTML inicial cerrado; componente también cerrado; recargas de datos respetan la
apertura elegida. Control con aria-expanded, teclado y exclusión del botón de gestión.

## Persistencia y límites
El guardado reutiliza contenido/autoguardado y registrarAsistenciaBulk antes de abrir
las valoraciones; respeta clases ya registradas. Sin conexión el contenido queda
pendiente de sincronización y no se afirma haber guardado una valoración.
Se reemplaza en esta vista la ruta de IA que infería 3/5 por actividad. Se conservan
servicios anteriores para consumidores ajenos a este cambio.

Consulta de solo lectura al esquema SOI: asistencias NO tiene valoracion,
valorada_por ni valorada_at. La migración de Claude sigue pendiente; no se ha
aplicado ni modificado producción. Si no se pueden consultar las notas, la revisión
de contenido continúa y muestra disponibilidad desconocida, sin asumir cero.
Los presentes se confirman por ID en UI; el DSL existente conserva nombres completos,
por eso se bloquean duplicados y se requiere validación institucional antes de fusionar.

## Verificación
Comprobaciones aisladas de modelos/dictado aprobadas; sintaxis validada.
Nuevos tests de modelo, servicio, UI de revisión, destinatarios en historial,
selección múltiple y planificación. Suite completa, lint, tipos y build se delegan
a CI de PR #147 porque no hay entorno local ejecutable.
Pendiente prueba autenticada del proveedor IA, micrófono, guardado y recarga en móvil.
