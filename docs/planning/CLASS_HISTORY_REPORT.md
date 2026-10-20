# Informe individual de clase

Solicitud de Omar, 20 de octubre de 2026.

## Entrega

Desde Gestión de clases, botón Informe de clase en el encabezado superior derecho
de cada tarjeta. Abre HTML exploratorio, sin descarga automática.

Controles: período académico (o todo el historial), rango de fechas y contenido
en bruto o análisis mensual por IA con evidencia. Visualizar aplica los filtros;
PDF descarga exactamente el último informe visualizado y reutiliza los resúmenes.
Los filtros de fecha se intersectan con las fechas del período elegido.

El historial usa ID de clase, nunca nombre. Reutiliza el puerto de asistencias,
los adaptadores real/demo y el evaluador mensual existente. Sin nuevas tablas,
automatizaciones ni evaluadores. Consulta paginada para historiales largos.

Los alumnos únicos son personas con asistencia registrada, no matrícula histórica.
La primera fecha es primera clase registrada, no inicio real. Meses sin registros
no se convierten en ausencias. El HTML ofrece registros originales, estados por
alumno, contenidos y fechas. PDF conserva sus identificadores como evidencia.
Los resúmenes por IA son opcionales, etiquetados y no se consultan en Demo.

La variedad y repetición siguen como datos descriptivos, fuera de la puntuación.
Se normalizan los pesos restantes manteniendo la proporción 5:3:
62,5 % asistencia + 37,5 % cobertura de contenido. No representa una evaluación
integral de calidad pedagógica. Comparaciones previas usan el mes anterior
completo cuando está disponible; no se deduce progreso a partir del texto.

## Verificación

- 247 pruebas de asistencias/clases aprobadas.
- 105 pruebas focalizadas aprobadas, incluida interacción HTML/filtros/IA/PDF.
- Build y typecheck aprobados; lint de nuevos módulos aprobado.
- La prueba de repetición falló antes de corregir la fórmula (90 vs 100) y pasó después.
- policy:check falla por migraciones existentes ajenas al cambio; sin nuevas migraciones.
- Pendiente: comprobación visual en navegador, PDF real y llamada real de IA.
- Sin prueba autenticada contra producción; no se ha desplegado ni fusionado.

## Ampliación: seguimiento por alumno

Autorizada por Omar durante la misma conversación. Nómina actual desde el adaptador
y alumnos con evidencia histórica; cada alumno expone fecha, asistencia, contenido
general trabajado y observaciones individuales vinculadas por ID. La presencia no
certifica dominio. La ausencia señala contenido a verificar/recuperar, sin crear
una deuda pedagógica automática. Sin estado, no se inventa participación.

Se reutiliza getDetalleSesion para recuperar observaciones existentes, con cargas
en lotes de cinco. Fallos parciales se anuncian en HTML y PDF. Menciones libres a
nombres permanecen en el texto general: no hay asociación automática ni nuevo
mecanismo de captura/confirmación en esta entrega. No se evalúa al alumno por IA.
La nómina Demo coincide con la matrícula simulada del adaptador existente.

Validación actualizada: 249 pruebas aprobadas; build, lint focalizado y typecheck
aprobados. Sigue pendiente validación visual y autenticada con datos reales.
