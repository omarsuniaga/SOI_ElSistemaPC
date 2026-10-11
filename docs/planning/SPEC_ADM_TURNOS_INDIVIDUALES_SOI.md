# SPEC · Turnos individuales en Administración (SOI)

**Estado:** propuesta de implementación · **Fecha:** 29 de septiembre de 2026  
**Caso inicial:** piano, maestro Juan Cardona · **Alcance:** portal ADM, catálogo de clases y nómina.  
**Base revisada:** rama predeterminada `feat/planificacion-clases-rediseño`, commit `121977c` (26-09-2026). No se verificaron registros de producción.

## 1. Problema y resultado esperado

Una clase puede tener varios estudiantes inscritos, cada uno con su propia media hora y, en ocasiones, con un día distinto. El portal del maestro consulta `alumnos_clases.dia`, `hora_inicio` y `hora_fin`; la ficha y la nómina de ADM muestran el conjunto de inscritos y solo el primer `clase_horarios`. Quien administra interpreta que asisten juntos el jueves aunque los turnos sean distintos.

**Resultado:** desde **ADM → Clases → Nómina** se ven los días generales de la clase y, para cada alumno, su turno efectivo; una persona autorizada puede editar día y horas de una inscripción sin modificar otros alumnos, los horarios de la clase ni la asistencia histórica. En la ficha de clase se resumen todos los días programados.

## 2. Hallazgos comprobados en código

| Pieza | Hallazgo | Consecuencia |
| --- | --- | --- |
| `src/modules/clases/api/clasesApi.js` | `obtenerClases()` trae `clase_horarios`, pero de `alumnos_clases` solo pide IDs. `obtenerAlumnosInscritos()` ya puede traer los turnos. `actualizarTurnoInscripcion()` acepta `dia`. | Hay datos reutilizables; la tarjeta no los tiene cargados. |
| `src/modules/clases/views/clasesView.js` | `_renderClaseCardV2()` y `_mostrarModalNominaClase()` usan `primerHorario`; la nómina consulta alumnos sin día ni horas. | Oculta otros días y las franjas individuales. |
| `src/modules/clases/components/claseModal.js` | El editor rotativo agrupa inscripciones por `hora_inicio + hora_fin`, sin día; `_readSlots()` tampoco lee día y `_syncRotativa()` actualiza solo horas. | Franjas iguales en distintos días se fusionan visualmente; guardar puede mantener un día viejo aunque se reorganice la pantalla. |
| `src/modules/clases/components/claseModal.helpers.js` | `rotativa`, `rotativo` e `individual` se interpretan como turnos; `grupal` prevalece aun con horas legadas. | No basta comprobar `tipo_clase === 'rotativa'`. |
| `src/modules/clases/components/alumnoInscripcionModal.js` | Existe edición de día y horas, pero no hay importación/entrada desde la vista actual de clases. | No presentarla como ruta operativa sin conectarla y probarla. |
| `supabase/migrations/schema_reference.sql` | `alumnos_clases` tiene `UNIQUE (alumno_id, clase_id)` y permite `dia` nulo. | Una inscripción representa como máximo un turno por alumno y clase; no promete varios días para el mismo alumno. |

## 3. Contrato funcional

### 3.1 Lectura en ADM

1. **Ficha de clase:** mostrar todos los `clase_horarios` ordenados lunes–domingo y por hora, con una síntesis legible (`Lun 14:00–17:00 · Jue 14:00–17:00 · +1 día`, si hace falta espacio). Nunca titular el primer horario como si fuese el horario completo. Indicar `Turnos individuales` para tipos rotativos y compatibles.
2. **Nómina:** conservar búsqueda, inscripción, baja y PDF actuales. Para cada inscripción activa, mostrar nombre y **día efectivo**, inicio y fin. Ordenar por día efectivo, inicio y nombre; ofrecer filtro por día y un contador por día. La lista de horarios generales de la clase aparece separada del detalle de estudiantes.
3. `dia` explícito en la inscripción es el día efectivo. Si es nulo y la clase tiene **un solo día distinto**, mostrar ese día como **«heredado de la clase»**. Si es nulo y la clase tiene **más de un día distinto**, mostrar **«Día por confirmar»**, sin elegir arbitrariamente el primero. Si faltan horas, mostrar **«Turno sin hora»**. No inventar una franja a partir del horario general.
4. Para una clase grupal, conservar la nómina grupal sin habilitar la edición de turnos individuales; mostrar todos los horarios generales. No reclasificar clases por la presencia de horas heredadas.
5. El salón se muestra en cada bloque de `clase_horarios`; solo se atribuye un salón al turno si su día y franja permiten resolverlo sin ambigüedad. En otros casos, `Salón por confirmar`. No existe `salon_id` por inscripción.

### 3.2 Edición puntual

1. En cada fila de una clase rotativa o compatible, **Editar turno** abre un formulario con día, inicio y fin, valores actuales, y botón Guardar/Cancelar. El formulario distingue `Día de la clase` (valor nulo) de un día explícito; ofrecer herencia solo cuando resulte inequívoca.
2. Guardar actualiza **solo** `dia`, `hora_inicio`, `hora_fin` de la inscripción identificada por clase y alumno (o por su `id` verificado). No llamar a `actualizarClase()`, no reescribir `clase_horarios`, no desinscribir/reinscribir, no alterar `activo`, `tipo_clase`, docente ni salón.
3. Validar que día pertenezca al dominio permitido, que ambas horas estén presentes y que inicio < fin. Para un turno fuera de los bloques de la clase, mostrar un error explicativo y orientar a editar primero el horario general; no extenderlo en secreto. Comprobar solapes con otros alumnos de la misma clase y con otros horarios relevantes del docente/salón; para microgrupos deliberados, mantener la coincidencia permitida solo mediante la interacción existente de clase rotativa y sin bloquear datos previamente guardados en una vista de solo lectura.
4. Si la fila desapareció, fue desactivada o la actualización afecta cero filas, mostrar error y recargar: nunca anunciar éxito falso. Deshabilitar Guardar mientras la petición está en curso. Al guardar, refrescar nómina y caché que alimenta al maestro; al fallar, conservar el formulario y no modificar la UI optimistamente.
5. Respetar las reglas RLS vigentes y verificar permisos del rol ADM; no introducir escrituras desde la UI directamente. Encapsular lectura y mutación en el adaptador/API del módulo de clases con respuestas claras.

### 3.3 Editor completo de clase

El editor **Editar clase → Rotativa (Turnos)** debe preservar `dia` aunque se cambien datos generales:

- La clave de agrupación es `(dia efectivo, hora_inicio, hora_fin)`; dos lunes y jueves a las 15:00 nunca forman un único turno.
- Cada tarjeta de turno muestra su día; `_readSlots()` transporta día y horas por alumno. `_syncRotativa()` transmite el día explícito al actualizar/inscribir. No convertir un `dia` nulo preexistente en uno explícito por un guardado ajeno al turno, salvo que el usuario cambie el día.
- Con más de un día general y una inscripción sin día, mantenerla visible como **pendiente de día** y bloquear únicamente su reasignación ambigua, con mensaje específico. No borrar esos alumnos ni fusionarlos al guardar.
- Si cambia el tipo de clase, la confirmación debe explicar el efecto sobre turnos existentes. No eliminar valores de `alumnos_clases` por cambiar a grupal sin una operación explícita y revisada.
- **Riesgo existente a controlar:** `actualizarClase()` borra y reinserta todos los `clase_horarios` al guardar. Una edición puntual de turno no debe pasar por ese flujo. Antes de liberar cambios al editor completo, cubrir con regresión el guardado sin cambios y su posible impacto en referencias a horarios.

## 4. Diseño técnico y entregas

**Entrega A — Lectura segura (sin mutaciones):** función pura para resolver día efectivo, presentación de todos los horarios en tarjeta, consulta de nómina con `dia`, `hora_inicio`, `hora_fin`, badges/orden/filtro y estados de datos incompletos. La consulta de nómina se hace al abrir el modal, para no cargar todas las inscripciones del catálogo. Mantener búsqueda, inscripción, baja y PDF.

**Entrega B — Edición puntual:** método `actualizarTurnoIndividual({ claseId, alumnoId, dia, horaInicio, horaFin })` en `src/modules/clases/api/clasesApi.js` o adaptador equivalente; prevalidación y control de fila afectada; formulario por fila en la nómina. Compartir la regla de día efectivo con el portal de maestro, sin cambiar su contrato de datos. Tras guardar, invalidar/refrescar las lecturas afectadas.

**Entrega C — Corrección del editor rotativo:** ampliar las tarjetas y lectura/escritura de slots con día, preservar valores nulos y distinguir franjas idénticas de días distintos. Revisar clonado de clase para que `preInscritosSlots` y la sincronización conserven día y horas. No alterar la semántica de microgrupos ni de clases grupales.

**Archivos principales:** `src/modules/clases/views/clasesView.js`, `src/modules/clases/components/claseModal.js`, `src/modules/clases/components/claseModal.helpers.js`, `src/modules/clases/api/clasesApi.js`, pruebas correspondientes y mocks de demostración. Evitar una nueva tabla o migración para este alcance. Seguir el patrón DataAdapter declarado en `AGENTS.md`.

## 5. Pruebas de aceptación y regresión

| Escenario | Resultado obligatorio |
| --- | --- |
| Juan tiene lunes, miércoles y jueves; tres alumnos con turnos distintos | ADM muestra los tres días generales y cada alumno en su día/hora; no parecen una clase simultánea. |
| Dos alumnos a las 15:00, uno lunes y otro jueves | Editor genera dos franjas distintas; guardar y reabrir conserva ambos días. |
| Editar solo la hora de un alumno | Solo cambian las tres columnas autorizadas de esa inscripción; otro alumno, horarios generales y portal maestro permanecen coherentes. |
| Guardar el editor completo sin cambios | Todos los días y horas individuales quedan idénticos; ninguna inscripción se pierde. |
| `dia = null` con un día general / con varios días generales | Se muestra herencia inequívoca / «Día por confirmar» respectivamente. |
| Clase grupal con horas legadas | Sigue siendo grupal; no aparece editor de turnos ni cambia su nómina. |
| Turno sin hora, fuera de bloque o fin anterior al inicio | Estado claro en lectura y rechazo explicado al intentar guardar valores inválidos. |
| RLS deniega edición; fila inexistente; error de red | Error visible, sin éxito falso ni pérdida del formulario. |
| Inscribir, dar de baja, buscar, PDF y duplicar | Siguen funcionando; el duplicado conserva la asignación de día/hora cuando corresponde. |

Crear pruebas unitarias de resolución/agrupación de turnos y pruebas de integración del modal/API con casos multi-día; ejecutar `npm run test:run` para el alcance pertinente, `npm run build` y `npm run policy:check`. Verificar manualmente en modo demo y en un entorno de prueba con datos de piano anonimizados. Comparar una instantánea de las inscripciones y horarios antes/después; nunca usar producción para inventar datos de prueba.

## 6. Verificación previa y despliegue

1. En un entorno autorizado, consultar las clases de piano de Juan Cardona, sus `clase_horarios` y las inscripciones activas con día y horas. Confirmar si hay una o varias clases, cuáles días son generales, y si hay alumnos sin día/hora. No cambiar datos durante el diagnóstico.
2. Implementar A, B y C en una rama aislada según el tablero/lane del proyecto; revisar el diff y las pruebas. Para datos existentes ambiguos, registrar una lista de revisión humana sin asignar días automáticamente.
3. Publicar primero un preview y comprobar con Administración y el maestro que un turno de ejemplo coincide en ambos portales. Integrar solo tras pasar CI y revisión de permisos. Validar de nuevo en producción **sin editar masivamente horarios**.

## 7. Fuera de alcance y decisión posterior

Esta SPEC resuelve **un turno semanal por alumno y clase**, que es lo que el esquema actual permite. Si el mismo alumno necesita varios días en la misma clase, `UNIQUE (alumno_id, clase_id)` lo impide: requiere otra SPEC para modelar recurrencias, asistencia y migración. Tampoco modifica el calendario institucional, históricos de asistencia, reportes financieros ni reglas académicas.

**Criterio de cierre:** Administración puede decir con certeza qué día y a qué hora corresponde cada estudiante de piano, editar un turno concreto y comprobar que la misma asignación sigue apareciendo al maestro, sin alterar los demás horarios o alumnos.
