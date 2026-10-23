# Audiciones semestrales e invitados — SPEC 2.2

Estado: integración funcional en desarrollo y revisión, sin activación en producción. Esta versión sustituye la propuesta 2.1 y sus apéndices. PR #159 depende del #158; no basta fusionar el segundo sobre master sin su base.

## Propósito y orden académico

Administración crea audiciones de medio o final de semestre con uno o varios grupos de Iniciación, maestros jurados, responsables académicos expresamente designados, fecha, período institucional y rúbrica congelada. El período se registra con su denominación institucional: el esquema consultado no contiene `periodos_academicos`; no se añade un catálogo paralelo.

El diagnóstico y la conclusión del jurado preceden la resolución académica. Tras la aprobación publicada se consulta la preferencia del alumno. Coordinación comprueba destino, cupo, horario y recurso, explica la asignación acordada con la familia y autoriza uno o varios destinos independientes. Solo después el maestro receptor habilitado incorpora como invitado, sin volver a buscar al alumno ni poder cambiar la clase autorizada.

Coro y violín son ejemplos: el catálogo es el de clases activas. No se exige más de un destino. El resultado sigue preparado si faltan recursos; no se convierte en rechazo ni en matrícula automática.

## Capacidades por convocatoria

| Actor | Capacidad |
|---|---|
| Administración activa | Crear convocatoria y designar expresamente responsables; gestionar candidatos y jurados |
| Responsable académico designado | Resolver, publicar/reabrir, consultar preferencia, autorizar destinos, regularizar teoría, emitir informes y resolver invitaciones de su convocatoria |
| Jurado actualmente designado | Valorar en convocatoria abierta; ver sus propias notas; consultar diagnóstico y seguimiento de las invitaciones de una revisión final asignada |
| Maestro receptor | Ver destinos que recibe, incorporar con permiso vigente, registrar seguimiento y consultar su ficha; no adquiere condición de jurado |
| Maestro no asignado | Conserva clases y padrón ordinarios; no obtiene evaluaciones ni tareas de jurado |

Se usan perfiles y asignaciones reales, no roles inventados ni `user_metadata`. Administrar técnicamente no otorga resolución académica sin designación explícita. La UI oculta accesos según contexto devuelto por el servidor; RPC/RLS repiten la restricción. Las decisiones finales de cada invitación corresponden a los responsables de la convocatoria que la autorizó, apoyados por la audición final designada.

## Evaluación y resolución

La configuración por convocatoria admite descriptores observables de dos a cinco niveles, criterios requeridos u opcionales y mínimo de jurados. Los cuatro criterios comunes y tres niveles que ofrece la pantalla son provisionales y editables, no una nueva escala institucional ratificada. No se convierte una evaluación histórica de estrellas. No observado es `null`, no cero. Un criterio requerido sin observar impide considerar completa la valoración.

Cada valoración guarda identidad de sesión, notas, evidencia observada, fortalezas, apoyos y recomendación. La UI muestra recomendaciones discordantes a gestión. Se registran por separado `conclusion_jurado` y resolución académica `conclusion`; no hay umbral ni promedio que apruebe automáticamente. Estados: pendiente, preparado, continuar preparación, pendiente de evidencia y ausente.

Retirar un jurado conserva sus registros, bloquea nuevas escrituras, excluye sus notas del quórum pendiente e invalida resoluciones pendientes. Publicar cierra escrituras. Reabrir exige responsable académico y motivo; invalida decisiones pendientes y preferencias anteriores y revoca autorizaciones aún sin incorporar. No revierte automáticamente matrículas reales ni decisiones ya ejecutadas.

## Invitaciones y continuidad

Cada invitación tiene UUID, alumno, candidatura, clase, objetivos, inicio, revisión, ronda, versión, recurso y matrícula. La unicidad del destino vigente es por alumno y clase incluso entre convocatorias distintas. Una matrícula fija activa no se convierte en invitación.

La autorización comprueba cupo y horario, y exige justificación de solapamientos. Al incorporar se revalidan autorización, clase, alumno activo, cupo, turno rotativo, duplicados, permiso docente de inscripción y formación regular. La transacción crea/reactiva matrícula, consume autorización y registra el evento. El reintento de una incorporación ya realizada devuelve su invitación y comprueba que la matrícula sigue vigente.

Se conserva teoría y solfeo. El responsable identifica su matrícula regular explícitamente; no se deduce del nombre. Si falta, se regulariza o registra excepción académica con motivo, actor y revisión futura. El receptor no se autoautoriza. No se desmatricula por una incidencia ni por fecha vencida.

Para un instrumento se registra código único de inventario o referencia operativa comprobada, autor, fecha y explicación. No se inventa stock. Se bloquea el recurso ya reservado por otra invitación y, si el código existe en inventario, su estado o asignación incompatible. El receptor revalida la comprobación antes de incorporar. Esto no crea préstamo ni entrega física, ni modifica instrumento principal. Coro o un destino que no necesite instrumento institucional usa «No aplica», con motivo. La reserva permanece conservadoramente después de confirmar como fijo; su liberación/entrega pertenece a la gestión patrimonial, no se simula desde esta pantalla.

## Seguimiento y final de semestre

El receptor registra avances respecto de objetivos, dificultades/apoyos, recomendación y referencia al registro pedagógico existente. La asistencia ordinaria incluye al invitado, sin duplicar asistencia ni inferir dominio por presencia. Las nóminas y la ficha muestran su condición por clase.

La audición final vincula invitaciones activas y unifica al alumno sin perder destinos. Cada jurado final evalúa por invitación y ronda. La pantalla compara diagnóstico inicial, objetivos y seguimiento. Resolver requiere evidencia final publicada y seguimiento de la ronda vigente, observación, plan de continuidad, versión actual y continuidad teórica.

Confirmar cambia solo esa matrícula a fija; finalizar desactiva solo esa matrícula de destino; prorrogar conserva invitación, exige nuevos objetivos y revisión posterior, abre otra ronda y desvincula la evaluación final anterior para exigir evidencia nueva. No altera los demás destinos.

## Informes y comunicaciones

El consolidado incluye convocados, evaluados, preparados, ausentes, pendientes y detalle trazable. El individual presenta criterios, fortalezas, apoyos, resolución y destinos confirmados o pendientes; omite contactos ajenos y deliberación interna. Cada emisión tiene fecha, versión, revisión académica y snapshot inmutable; se imprime o guarda en PDF con la función del navegador.

La devolución distingue aprobar de tener una incorporación confirmada. Una autorización pendiente no promete plaza ni instrumento. Para continuar preparación hay explicación y apoyos, sin felicitación equivocada.

La implementación prepara un borrador manual revisado con representante, contacto y constancia de consentimiento. No envía mensajes ni simula un canal operativo. Solo registra entrega cuando una persona confirma que la realizó; los reintentos del borrador con el mismo identificador y de la confirmación no duplican eventos. Durante desarrollo se usan exclusivamente contactos sintéticos.

## Arquitectura y esquema

`semesterApi.js` expone `execute(accion, datos)` y selecciona proveedor real o demo. La UI no importa Supabase. La demo usa fixtures sintéticos y almacenamiento local versionado, con selector explícito de perfiles de prueba. El proveedor real usa `public.iniciacion_semestre`, envoltorio invocador de un despachador autorizado privado.

La migración incremental `20261023002545_initiation_semester_workflow.sql` evoluciona las cuatro tablas del PR158 y agrega solo `iniciacion_invitaciones`. Los seguimientos, comunicaciones y emisiones se escriben como eventos en el historial existente, sin catálogos ni tablas huérfanas. Revoca RPC y escrituras antiguas que permitirían saltarse el flujo nuevo.

Las mutaciones de este módulo se serializan entre convocatorias iniciales/finales con candado transaccional. Los cupos comparten además el candado por clase del trigger de matrículas y bloquean la fila de clase. El diseño favorece consistencia para el volumen institucional actual; un mayor volumen requeriría medir y afinar granularidad. Las pruebas PGlite son PostgreSQL embebido, no acreditan contención entre conexiones independientes de un servidor nativo.

R3: exención explícita por núcleo académico de institución única sin catálogo/membresía canónica; antes de otra institución deben migrar alumnos, clases y este módulo con ámbito y FKs compuestas. No se declara multitenencia.

## Aceptación y publicación

Ver `TEST_PLAN.md` y `VALIDACION_V2.md`. Se exige ensayo con RLS/grants/core equivalentes a producción, respaldo/restauración comprobables, contención concurrente del último cupo y recorrido real de tres perfiles antes del piloto real. Ninguna prueba demo se presenta como prueba de Supabase desplegado.

R1: coordinación será escritora de la primera convocatoria y autorización; maestros designados escribirán valoraciones, incorporación y seguimiento. La fecha de primeras filas reales y los responsables/jurados del piloto deben fijarse antes de aplicar tablas a producción. No se inventan designaciones para completar ese requisito.

No ejecutar migraciones históricas en masa. Aplicar solo la base del PR158 y su evolución, en ese orden. Para revertir interfaz conservar historial, invitaciones y matrículas; no borrar tablas con alumnos reales.
