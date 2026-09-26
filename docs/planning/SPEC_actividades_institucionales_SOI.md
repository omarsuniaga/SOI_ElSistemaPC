# SOI — Especificación funcional: actividades institucionales y clases afectadas

**Estado:** propuesta para revisión · **Fecha:** 25 de septiembre de 2026 · **Alcance:** Calendario, Administración, Coordinación Académica y portal de Maestros.

## Decisión de integración: calendario como registro institucional

El portal de Calendario administra la fecha, tipo, horario, alcance y estado de feriados, ensayos, conciertos, visitas y suspensiones. Una actividad aprobada se publica mediante identificador estable y se proyecta en Administración, Académico y Maestros. Ningún portal crea una copia independiente del evento ni modifica métricas por sincronizar una pantalla. Las reglas de asistencia consumen la decisión aprobada y sus afectaciones concretas; las propuestas no tienen efecto.

El botón «Actividad especial» en **Clases de Hoy** y el acceso de **Gestión de Clases** abren el mismo flujo del calendario con fecha o clase precargada. La persona autorizada en Calendario administra el evento; la aprobación de suspensiones o exenciones exige además el permiso institucional correspondiente, comprobado en el servidor. El calendario muestra la actividad y su estado; las vistas académicas muestran qué clases se suspendieron o qué alumnos quedaron exentos y la referencia al evento. Una modificación aprobada propaga una nueva revisión y recalcula los resultados derivados de forma idempotente y auditable.

**Límite de producto y titularidad:** el alcance contractual de los portales de Maestros y Administración debe documentarse por separado del portal Calendario y de otros módulos de la suite. Esta especificación describe interoperabilidad técnica; no determina cesión, licencia o titularidad de esos módulos. Revisar el contrato real antes de atribuir derechos sobre ellos.

## 1. Problema y objetivo

El horario crea clases regulares, pero un feriado, ensayo general, concierto o visita puede suspenderlas, sustituirlas o convocar solo a parte de sus alumnos. Registrar una clase emergente por cada maestro no expresa bien qué ocurrió y puede generar ausencias falsas o alterar porcentajes. El SOI debe conservar la trazabilidad de la clase prevista y registrar por separado la actividad real y la participación individual.

## 2. Conceptos

- **Clase programada:** ocurrencia concreta de una clase del horario, con fecha, hora, docente y alumnos previstos.
- **Actividad institucional:** ensayo, concierto, visita u otra actividad con fecha, franja horaria, responsables y convocatoria. No es una clase regular aunque pueda sustituirla.
- **Cierre institucional:** feriado o suspensión que impide impartir clases en todo el centro o en un alcance definido.
- **Afectación:** decisión explícita sobre una clase programada: impartida sin cambios, suspendida, sustituida por actividad o impartida parcialmente. Se decide por ocurrencia, no modificando el horario recurrente.
- **Convocado / presente / ausente de actividad:** estados distintos. Convocar no demuestra asistencia.

## 3. Permisos y flujo

| Actor | Puede hacer |
|---|---|
| Docente o director de programa con cuenta de maestro, como Kalani | Proponer actividad y lista de convocados; aportar observaciones; confirmar asistencia a actividad si se le designa responsable. No puede aprobar cambios en otras clases ni en métricas. |
| Coordinación Académica o Administración, según permiso asignado | Revisar cruces con horario, aprobar o rechazar actividad, definir clases afectadas, crear cierre institucional y corregir con motivo. |
| Maestro de clase afectada | Ver decisión aprobada, registrar asistencia de su clase si se impartió, confirmar si ocurrió según lo previsto o reportar discrepancia. No crea excepciones globales. |

Flujo: **borrador/propuesta → revisión de conflictos → aprobación y publicación → registro de asistencia real → cierre → corrección auditada si procede**. Solo la aprobación publica efectos sobre clases y métricas. Las acciones privilegiadas se validan también en el servidor/base de datos; ocultar botones no basta. Cada aprobación, cambio de alcance, lista o asistencia conserva autor, fecha, motivo y valores anteriores.

## 4. Reglas de negocio

1. Un feriado de alcance institucional suspende las ocurrencias afectadas. Ninguna genera ausencia ni aumenta el denominador de asistencia de clase. El feriado se registra una sola vez, sin pedir una clase emergente a cada maestro.
2. Una actividad aprobada indica programa convocado, alumnos concretos o ambos, horario, lugar, responsable de pasar lista y ocurrencias que afecta. Administración revisa la intersección, porque compartir fecha no implica conflicto si los horarios no se solapan.
3. Si la clase se **suspende para todos**, nadie queda ausente de esa clase. Si solo algunos alumnos son liberados por una actividad y el resto sí tiene clase, la clase sigue impartida: los liberados quedan **exentos por actividad** y los demás tienen asistencia normal.
4. El alumno convocado que efectivamente asistió queda **presente en la actividad**, nunca presente automáticamente en una clase regular que no recibió. Quien no asistió a la actividad queda ausente de esa actividad; una eventual justificación personal se tramita por separado. No se convierte por ello en ausente de una clase suspendida.
5. Cuando una clase siguió impartiéndose, un alumno sin exención válida que faltó conserva su ausencia normal. Las exenciones se aplican solo a alumnos y franjas afectadas; pertenecer a la orquesta no justifica todo el día.
6. Una propuesta pendiente o una discrepancia no cambia métricas. Si se corrige una aprobación o lista después de registrada la asistencia, se recalculan los resultados derivados y queda historial auditable; nunca se duplican registros de clase.

## 5. Métricas e informes

**Asistencia a clase del alumno = presencias en clases impartidas y exigibles / clases impartidas y exigibles.** Las clases suspendidas y las exenciones institucionales aprobadas quedan fuera de numerador y denominador. Las ausencias justificadas personales siguen siendo una categoría visible: su tratamiento en porcentaje requiere una política académica expresa, independiente de las suspensiones institucionales. Mostrar por separado clases previstas, impartidas, suspendidas, exenciones, ausencias y participaciones en actividades. El reporte mensual debe permitir abrir la fecha, actividad, autorización y lista confirmada que explican cada excepción.

Para alertas de inasistencia y pendientes de maestros, ignorar clases suspendidas; no pedir lista de una clase que no ocurrió. Si hubo actividad, pedir la lista solo al responsable designado y mostrar al maestro de la clase afectada el motivo y el estado de confirmación.

## 6. Interfaz mínima

- **Clases de Hoy (ACM/ADM):** botón «Actividad especial» asociado a la fecha seleccionada. Abre una propuesta o creación según permiso y precarga la fecha; nunca altera asistencia al abrirse ni al guardar borrador. Cada clase afectada muestra su estado y un enlace al detalle de la actividad.
- **Gestión de Clases (ACM/ADM):** acceso contextual a actividades relacionadas con una clase y a su historial de afectaciones. No se agregan eventos extraordinarios como si fueran clases recurrentes ni se modifica el horario semanal para reflejar un hecho de una fecha.
- **Actividades institucionales (ACM/ADM):** bandeja y vista completa para propuestas, aprobaciones, feriados, edición auditada y consulta histórica. Crear feriado o actividad; seleccionar alcance, fecha y franja; previsualizar cruces con clases y alumnos; elegir afectación de cada ocurrencia; aprobar y publicar con vista de impacto estimado. Mostrar conflictos y evitar aprobaciones contradictorias. La misma función puede abrirse desde «Clases de Hoy» o «Gestión de Clases» sin duplicar reglas.
- **Maestros:** bandeja de propuestas propias y actividades que afectan sus clases; aviso «Ensayo general de orquesta: tu clase del 10/09 se suspendió» o «estos alumnos están exentos; pasa lista al resto»; acción para reportar discrepancias. El responsable de actividad pasa lista de convocados con estados presente, ausente o pendiente.
- **Perfil e informe del alumno:** línea temporal distinguible entre clase impartida, clase suspendida, exención y asistencia a actividad; referencia a la autorización.

## 7. Datos e invariantes para implementación

Separar entidades de actividad, convocatoria, asistencia a actividad, ocurrencia de clase, afectación de ocurrencia y exención por alumno. Referenciar identificadores estables de alumno, clase, actividad y autor. Restringir efectos a fecha/franja/alcance aprobados. Una sola decisión vigente por ocurrencia y alumno, con historial de revisiones; impedir asistencia de clase activa en una ocurrencia suspendida. Publicar decisión y afectaciones en una operación transaccional; hacer idempotente la reejecución. Derivar métricas de estados vigentes sin sumar dos veces al alumno que tiene dos clases el mismo día cuando el reporte se agrupa por **días**.

## 8. Casos de aceptación

1. **Feriado total:** Administración registra cierre; tres clases previstas desaparecen del denominador y ningún maestro recibe pendiente de asistencia.
2. **Ensayo de orquesta, clase suspendida:** Kalani propone, Administración aprueba, el responsable registra presentes; todos quedan sin ausencia de clase y solo los presentes cuentan como participantes del ensayo.
3. **Ensayo parcial, clase de violín impartida:** dos alumnos convocados quedan exentos en esa franja; los demás reciben asistencia normal. Uno de los convocados que faltó al ensayo aparece ausente del ensayo, sin ausencia ficticia de violín.
4. **Actividad propuesta y rechazada:** no afecta ninguna lista ni métrica.
5. **Cambio posterior:** Administración modifica una afectación con motivo; los informes se actualizan y muestran quién cambió qué y cuándo.
6. **Seguridad:** un docente no puede aprobar mediante interfaz ni llamada directa a la base de datos una suspensión que afecte clases ajenas.

## 9. Comprobación previa en SOI

Antes de desarrollar, inspeccionar el esquema y el código reales: cómo se generan ocurrencias desde el horario, cómo se calculan ausencias justificadas y porcentajes, y qué permisos tienen ADM/ACM/maestros. Revisar específicamente el feriado del 24/09/2026 y un ensayo ya registrado para identificar efectos existentes. Ya se observó que el registro emergente actual **sí genera justificaciones automáticas** en clases del maestro; comprobar su impacto real antes de corregir datos. Adaptar nombres y migraciones a las tablas reales, proteger los datos históricos y ejecutar los controles de integración del proyecto.

## 10. Instrucciones de implementación para Claude Code

**Meta:** entregar en una rama y PR revisable feriados, suspensiones y actividades especiales con aprobación institucional, efectos precisos en asistencia y calendario como registro compartido. Seguir `AGENTS.md`, `CONTEXT.md`, tablero de tareas y coordinación vigente. Conservar cambios ajenos del worktree. Documentar qué se hizo, pruebas y riesgos. No desplegar a producción antes de verificar CI, permisos y migración.

### 10.1 Puntos del código a inspeccionar

- `src/modules/clases/views/clasesHoyView.js`: «Clases de Hoy», semana y acciones por fecha. Menús ADM/ACM: `src/portales/adm/adm.js`, `src/portales/acm/acm.js`. `src/modules/clases/views/clasesView.js`: «Gestión de Clases».
- `src/modules/calendario/api/calendarioUnificadoApi.js` consulta y escribe `calendario_institucional`, proyecta clases regulares; `src/modules/calendario/views/calendarioGlobalView.js` contiene una vista, pero verificar su ruta operativa.
- Portal Calendario: `src/portales/calendario/src/container.ts` usa `SupabaseCalendarRepository` con `VITE_USE_SUPABASE=true` y cliente configurado; si no, usa `MockCalendarRepository`. Inspeccionar despliegue, autenticación y `src/portales/calendario/src/infrastructure/repositories/supabase/SupabaseCalendarRepository.ts`. No presumir que el portal está conectado en producción.
- **Defecto a resolver:** `src/portal-maestros/views/calendarioView.js` llama `autoJustificarClasesProgramadas` al crear clase emergente. `src/portal-maestros/services/emergenteJustificacionService.js` genera sesiones justificadas para todos los alumnos de clases del maestro en esa fecha, sin aprobación ni comprobación individual de horario. Desactivar esa escritura automática nueva al habilitar el flujo aprobado, preservando históricos. Auditar todos los reportes y alertas en `src/modules/asistencias/` y `src/portal-maestros/`.
- Revisar el DDL vivo antes de migraciones: `src/portales/calendario/docs/architecture/11-schema-reconciliation.md` marca `calendario_institucional` como existente con estructura pendiente de comprobar.

### 10.2 Ubicación y conducta

| Vista | Acción y resultado |
|---|---|
| Calendario institucional | Capturar feriado, ensayo, concierto, visita o cierre con fecha, hora, alcance, responsable y convocatoria; consultar estado, clases afectadas e historial. |
| ADM/ACM → Clases de Hoy | Botón «Actividad especial» ligado a la fecha concreta; abre ese mismo registro, con fecha precargada. Cada clase enseña si sigue normal, se suspende o tiene exenciones. |
| ADM/ACM → Gestión de Clases | «Ver actividades» para las ocurrencias de esa clase y acceso contextual para proponer; el horario semanal recurrente no se modifica. |
| ADM/ACM → Actividades institucionales | Bandeja de revisión y aprobación de eventos, feriados, afectaciones, discrepancias y correcciones; comparte identificador y persistencia con Calendario. |
| Maestros → Hoy/Calendario | Proponer actividad; consultar decisiones que afectan sus clases; responsable designado pasa asistencia real a actividad, y maestro de clase impartida pasa lista al resto. No aprobar cambios de otras clases. |
| Alumno, reportes y alertas | Distinguir clase impartida, suspensión, exención y participación; enlazar evento y autorización. |

**Registro manual:** si el portal Calendario no está disponible o conectado, ADM/ACM captura fecha y horas desde Clases de Hoy o Actividades institucionales mediante **el mismo servicio y tabla canónica**, dejando el evento pendiente hasta su aprobación. Si el portal está disponible pero no existe un evento ese día, se puede crear uno nuevo; no inferir que no hubo clase. Si falla la lectura, mostrar error y mantener métricas intactas. Nunca conservar una segunda copia independiente del evento.

### 10.3 Flujo y modelo

1. Propuesta: título, tipo, fecha local `America/Santo_Domingo`, hora inicial y final o día completo, lugar, ámbito, responsable, clases y alumnos convocados. Validar rango y zona horaria. Crear borrador no afecta métricas.
2. Previsualizar intersecciones de **fecha y franja horaria**, clases, inscripciones, sesiones existentes, alumnos y decisiones aprobadas. Seleccionar por ocurrencia: suspensión total, clase impartida con exención de alumnos concretos o sin afectación. Convocar no implica asistir.
3. ADM/ACM con permiso institucional explícito aprueba alcance. El administrador de Calendario puede registrar sin heredar permiso de alterar asistencia. Verificar identidad y permiso en servidor/base, incluso si llaman la API directamente. Aprobar evento y afectaciones de forma atómica e idempotente; impedir decisiones vigentes incompatibles.
4. Publicar en los portales desde el mismo identificador. Responsable de actividad registra presentes/ausentes de la actividad; maestro registra clase impartida. Reportes de discrepancia no alteran métricas automáticamente.
5. Corrección/cancelación necesita motivo, autor, fecha, versión anterior y nueva; recalcular resultados derivados sin duplicar sesiones ni borrar listas reales.

Reutilizar `calendario_institucional` para eventos. Verificar DDL, políticas, roles, `calendario`, `horarios`, `clase_horarios`, `sesiones_clase`, `class_events`, inscripciones y asistencia antes de diseñar migración. Modelar afectación por clase/fecha/franja, exención individual, convocatoria y asistencia de actividad, e historial. Crear solo las tablas que no existan y aplicar claves foráneas y unicidad de decisión vigente y de evento/alumno. Mantener datos históricos de emergentes: inventariar casos sospechosos para revisión humana, sin reescritura masiva por suposiciones. Seguir DataAdapter del repositorio y ofrecer la misma conducta en modo Demo.

### 10.4 Métricas, verificaciones y salida

- Porcentaje de clase: presencias sobre clases **impartidas y exigibles**; suspensión y exención institucional quedan fuera de numerador y denominador. Justificación personal conserva su política existente hasta que se decida formalmente otra. Asistencia a concierto/ensayo se informa aparte y no se presenta como clase impartida. Al agrupar ausencias por días, cada fecha cuenta una sola vez por alumno.
- Pendientes de maestro ignoran clases suspendidas; la lista de actividad corresponde al responsable designado. Revisar ADM, ACM, Maestros, perfil de alumno y exportaciones que consumen estos datos.
- Tests: feriado con varias clases; ensayo con sustitución total; exención parcial y ausente de actividad; clase sin solapamiento; propuesta rechazada; edición/cancelación; aprobación repetida sin duplicados; dos clases en un día; maestro intentando aprobar por API; modo Demo; error de calendario sin cambio; histórico intacto.
- PR: migración revisada si hace falta, pruebas, capturas de los tres portales, resultados de build/CI y breve explicación de métricas. Desplegar progresivamente: esquema y lecturas compatibles, aprobación, después reportes. Verificar en preview un feriado y un ensayo antes de producción.
