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

## Ampliación: «Evaluar presentes» (valoración 0–5)

Solicitada por Omar el 20 de octubre de 2026. El prototipo `PresentRatings.js` del
entorno de ChatGPT **no estaba en GitHub** y no se usó: se construyó sobre los
servicios existentes (`asistenciasApi`, `AppModal`, `AppToast`, `IndicadorLogro`).
`EvaluacionEstrellasModal` y `GradePanel` no se reutilizaron como UI porque son por
indicador, solo admiten 1–5 y GradePanel arranca en 5★; aquí la valoración es de la
clase y el 0 es válido.

**Dónde:** vista de asistencia del portal de maestros, botón «Evaluar presentes»
junto a «Observación». Requiere la sesión guardada (las filas de asistencia nacen al
guardar).

**Comportamiento:** selección directa de 0 a 5 con un toque; «Sin evaluar» (`NULL`)
es un botón aparte y distinto de 0. Solo presentes y tarde; ausentes, justificados y
sin marcar se excluyen. Al abrir se recuperan las notas guardadas; solo se envían las
filas cambiadas.

**Persistencia:** columnas `valoracion` (0–5, `NULL` = sin evaluar), `valorada_por` y
`valorada_at` en `asistencias` (migración `20261020170631_asistencias_valoracion_clase.sql`).
Sin tabla nueva: existe una fila única por (sesión, alumno), así que corregir es un
`UPDATE` y no puede duplicarse; el adaptador nunca inserta. Un trigger descarta la
valoración si la asistencia se corrige a ausente/justificado. El upsert de asistencia
no toca estas columnas, por lo que re-guardar la sesión no las borra.

**Informe de clase:** cada registro por alumno muestra estrellas o «Sin evaluar»,
«No aplica (no asistió)» o «Valoración no disponible»; el encabezado del alumno resume
«promedio X/5 (n evaluadas, m sin evaluar)». El promedio usa solo lo evaluado (los 0
cuentan). PDF incluye ambos. Es el juicio del maestro por clase, no un diagnóstico
automático ni una etiqueta al alumno (R6); cada valor se rastrea a su fecha y sesión (R5).

**Riesgos conocidos:**
- La migración debe aplicarse **antes** de usar el botón en producción. El informe
  tolera su ausencia (consulta aparte, muestra «no disponible»); el botón fallaría con
  un error claro al cargar.
- Hay dos conceptos de «estrellas» en el portal: por indicador (GradePanel,
  `evaluacion_indicador`) y por clase (esta). No se mezclan ni se promedian entre sí.
- Primera fila real: la primera clase valorada tras el despliegue (R1).

Validación: ver la descripción del PR. Pendiente: comprobación en el portal con sesión
real autenticada y aplicar la migración en un entorno de prueba.

### Actualización 20-10-2026: migración aplicada
La migración de valoraciones ya se aplicó al proyecto SOI. Pruebas SQL con rollback
aprobadas, sin notas ficticias persistidas. El frontend permanece en revisión y la
prueba autenticada final sigue pendiente. Ante otra base sin columnas se explica la
indisponibilidad sin inventar valoraciones.
