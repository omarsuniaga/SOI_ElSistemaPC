# Historial individual de clases del alumno

Implementación: 13 de noviembre de 2026. Rama: `feat/student-class-history`.

## Objetivo y recorrido

El maestro abre un alumno desde su lista y encuentra en el perfil su historial individual. La consulta reúne sesiones finalizadas, asistencia, contenido general y seguimiento individual. Titular y suplente consultan la misma evidencia de las clases que tienen asignadas.

Se reemplaza el historial anterior, que consultaba como máximo 60 sesiones, no incluía tardanzas, mostraba siempre notas sobre 10 e infería recuperaciones por coincidencia de contenido. No se crean tablas, no se migran notas antiguas y no se modifican políticas de acceso.

## Reglas implementadas

| Evidencia | Tratamiento |
|---|---|
| Sesión registrada con P o T | Clase recibida; contenido y seguimiento individual disponibles |
| Sesión registrada con A o J | Contenido impartido al grupo; sin atribuir evaluación recibida |
| Borrador, pendiente, programada, suspendida, cancelada, sustituida o exonerada | Fuera del historial de clases recibidas |
| Asistencia individual y JSON de sesión en desacuerdo | Prima la individual; se muestra advertencia |
| Observación de grupo | Solo se proyectan evaluaciones con el ID exacto del alumno; nunca se muestra el texto crudo del grupo |
| Nota con escala declarada | Se conserva su escala, incluyendo el valor cero |
| Nota antigua sin escala | Se muestra «escala no registrada»; sin convertir ni inferir |
| Autor conocido | Nombre y rol declarado; autores distintos conservan sus observaciones |
| Autoría antigua desconocida | «Autor no registrado»; sin atribuirla al titular por defecto |
| Contenido repetido posteriormente | No implica recuperación |
| Recuperación | Confirmación explícita por un maestro, contra una sesión posterior P/T de la misma clase y alumno |

Las recuperaciones se guardan como evidencia adicional en `observaciones_sesion.contenido_parsed._history_recovery`, con firma `_author`. No se cambia la asistencia original ni se reemplazan comentarios existentes. Al confirmar se vuelven a consultar los datos autorizados. La confirmación requiere conexión; no se incorpora un nuevo tipo de operación a las colas existentes.

Los guardados nuevos de evaluación estructurada declaran `_rating_scale: 5` y `indicadores.escala: 5`, conservando firma. Las tardanzas participan en el flujo de evaluación, igual que las presencias. Los guardados existentes de observación, progreso y planificación mantienen sus contratos. Un fallo en una copia secundaria muestra una advertencia; el historial también puede leer directamente la evaluación conservada en la observación de sesión.

## Arquitectura y consulta

- Dominio puro: `src/portal-maestros/domain/studentClassHistory.js`.
- Adaptador Real/Demo: `src/portal-maestros/services/studentClassHistoryAdapter.js`.
- Interfaz compartimentada: `StudentClassHistory.js` y CSS limitado a `.pm-history`.
- Integración: perfil existente del portal maestros; sus demás secciones se conservan.
- Demostración: JSON en `src/assets/data/mocks/student-class-history.json`. Maestro `maestro_001` o suplente `maestro_003`, alumno `1`; no escribe en producción.

La consulta pagina todas las filas de cada fuente en bloques de 500, con orden estable, y agrupa búsquedas relacionadas por 100 sesiones. La interfaz muestra 25 tarjetas por página y calcula los totales sobre todos los resultados del rango seleccionado. Permite filtrar clase, estado y fechas dentro del rango superior del perfil. Cada tarjeta permite inspeccionar los identificadores de sus registros de origen.

El adaptador restringe clases por maestro titular, suplente o relación histórica `maestro_id`. Las notas individuales se consultan por alumno **y** sesiones autorizadas. Un fallo de consulta se presenta como error con reintento, no como historial vacío.

## Validación y límites

- Pruebas de dominio: privacidad de compañeros, asistencia discrepante, autorías distintas, escalas, cero, borradores, exoneraciones, fechas y recuperación explícita.
- Pruebas de adaptador: paginación superior a 500 filas, restricción de alumno/sesión, errores y recuperación en Demo.
- Pruebas de interfaz: 70 sesiones con 25 tarjetas iniciales, totales completos, filtros, escape HTML, confirmación y reintento.
- Pruebas de perfil y escritores: compatibilidad del perfil, rango académico, modo Demo sin consultar Supabase, metadatos y tardanzas.
- Regresiones de base de datos: asistencias, exoneraciones, notificaciones y actividades institucionales.

La auditoría de esquema y consultas se realizó sobre el proyecto existente. Las políticas de `progresos`, `observaciones_alumnos` y `clases` mantienen deuda previa de permisos amplios; este cambio no resuelve ni amplía esa deuda. Los filtros del adaptador no sustituyen la autorización del servidor. No se declara una auditoría global de seguridad terminada.

La validación manual con dos cuentas reales (titular y suplente) está pendiente: el navegador disponible muestra la pantalla de inicio de sesión. No se crearon asistencias, notas ni recuperaciones ficticias en datos reales. Antes de considerar cerrado ese control manual: abrir el mismo alumno con ambas cuentas, verificar una observación de cada autor, confirmar una recuperación real y comprobar persistencia al volver a entrar.

### Resultado de comprobaciones locales

- Suite completa: **4.876 aprobadas, 7 omitidas; cero fallos** (582 archivos aprobados, 2 omitidos).
- Regresiones de base de datos de asistencia/exoneraciones: **9 comprobaciones aprobadas**.
- `lint --quiet`, `typecheck` y compilación de producción: aprobados.
- `policy:check`: mantiene exactamente el mismo fallo que `master`, verificado con una extracción completa de esa revisión; no se altera la línea base ni se agregan migraciones.
- La validación de cuentas reales descrita arriba continúa pendiente.

## Publicación verificada

- PR #169 integrado: https://github.com/omarsuniaga/SOI_ElSistemaPC/pull/169.
- Revisión publicada: `3570de7c6ce6ec81566b928c576123b014063f44`.
- CI de la revisión final: **4.877 pruebas aprobadas, 7 omitidas; cero fallos**, además de lint, tipos, build y regresiones de base de datos aprobados. Incluye la prueba añadida de acceso con matrícula histórica inactiva y rango vacío.
- Producción Netlify: `6af6b4c29b0af9aaead2fc56`, estado `ready`, publicada el 13/11/2026 a las 06:57:24 UTC.
- Sitio: https://soi-el-sistema-pc.netlify.app.
- Sin nuevas funciones de Netlify ni ejecuciones de Agent Runner; no se utilizaron sus servicios de IA.
- Las actualizaciones documentales posteriores omiten CI y despliegue. La validación manual con cuentas reales continúa pendiente; el lane se libera al terminar la implementación publicada.

## Corrección de contraste del historial (13/11/2026)

Se reprodujo el problema de texto claro sobre filtros blancos: `--pm-bg` no existe en los tokens del portal y activaba el fondo blanco de reserva. El contraste calculado en modo oscuro era aproximadamente 1,10:1.

Los controles ahora usan `--pm-surface` con `--pm-text`. Títulos, etiquetas, fechas, autores, botones y opciones usan los colores semánticos del tema; los calendarios y desplegables nativos reciben `color-scheme` según el modo elegido. Los estilos están limitados a `.pm-history`, sin cambiar datos ni comportamiento.

Verificación local: 8 combinaciones de contraste (select/input, claro/oscuro y ambos atributos de tema) superiores o iguales a 4,5:1; 25 pruebas focalizadas aprobadas; lint y build aprobados. La prueba de contraste fallaba en las cuatro combinaciones oscuras antes de la corrección.
