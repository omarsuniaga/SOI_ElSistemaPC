# SOI — Propuesta y especificación de audiciones e incorporación como invitado

**Versión:** 2.1 · 22 de octubre de 2026  
**Estado:** desarrollo iniciado por autorización de Omar; contrato demo en curso, sin activación en producción.  
**Responsable de la definición:** Omar Suniaga.  
**Base técnica revisada:** PR #158, commit `f6781e06f32e86b6498dd63089f77bcc3c2ae49e`, documentos SRS/SPEC de primera integración y requisitos de esta conversación.

## 1. Resultado esperado

Organizar las audiciones de medio y final de semestre desde administración; permitir que los profesores designados evalúen desde su portal; registrar la asignación de destino decidida por dirección o coordinación académica; incorporar al alumno con un botón como invitado; acompañar su adaptación y resolver su condición al cierre del semestre.

La preferencia del alumno informa la decisión. Dirección o coordinación académica decide instrumento, coro y clase, considerando preparación, necesidades de la agrupación, cupos e instrumentos disponibles. Ninguna calificación asigna destinos ni crea matrículas automáticamente.

La condición de invitado pertenece a la matrícula de destino. El alumno mantiene su formación regular de teoría y solfeo durante la invitación. Confirmar como miembro oficial no elimina por sí mismo esa formación.

## 2. Alcance y decisiones de producto

- Administración gestiona convocatorias de medio semestre y de final de semestre, alumnos convocados y jurados.
- Solo los jurados designados ven la tarea de calificar esa convocatoria en su portal. El servidor verifica la misma restricción.
- El profesor receptor accede al seguimiento de sus invitados mediante una sección distinta. Ser receptor no lo convierte en jurado de la audición inicial ni final.
- Dirección/coordinación registra el resultado académico y autoriza un destino concreto.
- El profesor habilitado incorpora al alumno a ese destino desde su portal, sin volver a buscarlo en el padrón.
- El seguimiento utiliza asistencia y evidencia pedagógica existentes, además de valoraciones de adaptación; la revisión final queda vinculada a la invitación original.
- Vencer una fecha genera un pendiente visible. Nunca retira, confirma ni sanciona automáticamente.

## 3. Responsabilidades y permisos

| Acción | Administración | Dirección/coordinación autorizada | Jurado asignado | Profesor receptor |
|---|---|---|---|---|
| Crear convocatoria y designar jurados | Sí | Sí, si tiene capacidad de gestión | No | No |
| Calificar audición | Solo si está designado | Solo si está designado | Sí, en su asignación vigente | Solo si está designado |
| Consultar consolidado | Sí, según permiso académico | Sí | Resultado publicado de sus convocados | Resultado autorizado necesario para sus invitados |
| Autorizar instrumento y destino | Solo con capacidad académica explícita | Sí | No | No |
| Incorporar al destino autorizado | Con permiso de inscripción | Con permiso de inscripción | Solo si también es receptor habilitado | Sí, con permiso de inscripción y clase asignada |
| Registrar seguimiento de adaptación | Según función académica | Sí | No por ser jurado | Sí, para sus invitados |
| Confirmar, prorrogar o finalizar invitación | Solo con capacidad académica explícita | Sí | Recomienda | Recomienda |

La aplicación actual opera con perfiles `admin` y `maestro`. La implementación debe mapear estas capacidades al sistema real de permisos; no suponer que existen cuentas con roles `direccion` o `coordinacion_academica`. La administración técnica no implica por sí sola autoridad académica. Los UUID, permisos y asignaciones se verifican desde la sesión y la base, nunca mediante campos editables del navegador.

## 4. Recorrido funcional

### 4.1 Preparar audición en administración

Crear convocatoria con nombre, tipo (medio/final de semestre), período académico y fechas, clase de origen, cohorte, rúbrica, jurados y mínimo de valoraciones. Una convocatoria admite varias clases de origen y un listado unificado con filtros por grupo; un alumno figura una sola vez en la convocatoria.

Seleccionar alumnos con matrícula activa y mostrar fecha de ingreso, preparación y excepciones justificadas. Los tres meses de preparación de la versión anterior quedan como parámetro propuesto, sujeto a validación pedagógica; no son requisito nuevo confirmado por esta conversación.

En audición final, seleccionar las invitaciones que se revisarán y conservar la referencia a su evaluación inicial. Evitar crear una candidatura independiente que pierda ese vínculo.

### 4.2 Evaluar desde el portal de maestros

El jurado ve «Mis audiciones», con fecha, convocatoria, candidatos y estado pendiente/completo de su valoración. Solo aparecen sus asignaciones. Cada criterio admite nota o «No observado», observaciones y recomendación académica.

Cada jurado guarda su valoración identificada por sesión; no modifica las notas de otros. Coordinación consulta todas. Las notas individuales ajenas no se muestran al jurado por defecto; los resultados consolidados se muestran cuando coordinación los publica. La escala 1–4 y la rúbrica de seis criterios del PR anterior son propuestas que deben revisarse antes del piloto, especialmente si se conserva una escala institucional de estrellas.

### 4.3 Consolidar resultado y autorizar destino

Mostrar listado con valoraciones completas/pendientes y evidencia de cada alumno. Coordinación registra explícitamente «Preparado para invitación», «Continuar preparación» o «Pendiente de evidencia». El promedio es informativo y nunca sustituye esta decisión.

Registrar por separado preferencia del alumno, instrumento/coro asignado, clase autorizada, motivo de asignación, objetivos, profesor receptor y revisión al cierre del semestre. Si preferencia y asignación difieren, documentar la explicación y el acuerdo comunicado al alumno/familia; no enviar mensajes automáticamente.

La disponibilidad de instrumentos puede registrarse con referencia a inventario o comprobación manual identificada y fechada. Esta fase no supone que el módulo de inventario esté completo ni entrega instrumentos automáticamente.

### 4.4 Incorporar con un botón

En «Alumnos autorizados para mi clase», mostrar nombre, resultado publicado, instrumento/destino autorizado y estado de incorporación. Acción principal: **«Agregar como invitado»**.

Abrir confirmación breve con clase preseleccionada, objetivos y fecha de revisión. El profesor no puede cambiar el destino autorizado desde esa acción; debe solicitar revisión académica. Comprobar nuevamente autorización vigente, permiso de inscripción, cupo, horario, matrícula regular y duplicados al confirmar.

Crear o reactivar la matrícula autorizada, vincularla a la candidatura y registrar actor/fecha en una operación atómica e idempotente. Doble clic o reintento no crea dos matrículas. Si ya existe matrícula fija activa, mostrar «Ya inscrito como miembro oficial» y remitir a coordinación sin convertirla en invitación. Si existe otra invitación vigente, mostrarla y evitar una segunda.

La nómina y la ficha de esa matrícula muestran **«Invitado · En periodo de prueba»**, objetivos y fecha de revisión. El alumno entra en el registro ordinario de asistencia de destino.

### 4.5 Acompañar y resolver

El receptor registra observaciones fechadas y progreso respecto de objetivos. Consultar asistencias y evidencias pedagógicas existentes con vínculo al registro original; no duplicarlas ni confundir presencia con dominio de una habilidad.

Al final del semestre, el jurado designado para esa audición evalúa y el receptor aporta seguimiento. Dirección/coordinación decide: confirmar miembro oficial, prorrogar con nuevos objetivos y fecha, o finalizar la invitación y continuar preparación. La decisión requiere evidencia y observación, se registra en historial y modifica únicamente la matrícula de destino correspondiente.

## 5. Estados y reglas de integridad

| Objeto | Estados propuestos |
|---|---|
| Convocatoria | Borrador → abierta → cerrada; publicación de resultados explícita |
| Resultado diagnóstico | Pendiente → preparado / continuar preparación; pendiente de evidencia cuando falte información |
| Autorización de destino | Sin asignación → autorizada → incorporada; revocable antes de incorporar |
| Matrícula de destino | Invitado → fijo / invitación finalizada; prórroga conserva invitado |

Separar resultado, autorización e incorporación: aprobar no equivale a estar matriculado. Revocar una autorización ya incorporada exige una decisión sobre la invitación; no debe borrar la matrícula ni el historial.

Identificar explícitamente la clase regular de teoría/solfeo, aunque no coincida con la clase de origen de la audición. Comprobar que esté activa al incorporar y al decidir. Si falta, advertir y dirigir a regularizarla; permitir continuar solo con excepción expresa de dirección/coordinación, responsable, motivo y fecha de revisión. El receptor no puede autorizar su propia excepción. Si se desactiva después mediante otro flujo, señalar la incidencia para revisión; no expulsar al alumno automáticamente de destino. No asignar esa clase por coincidencia de nombre ni inventar una matrícula.

Una candidatura admite varios destinos autorizados, con invitación, objetivos, seguimiento, matrícula y resolución independientes por destino. La confirmación en coro no confirma ni finaliza la invitación de violín. Nunca duplicar un destino vigente.

## 6. Diseño técnico propuesto

Reutilizar el módulo `src/modules/audiciones/initiation/`, DataAdapter real/demo y las cuatro tablas del PR #158. Integrar componentes en administración y portal docente; conservar una única lógica de dominio y autorización.

| Elemento existente | Cambio necesario |
|---|---|
| `iniciacion_convocatorias` | Tipo de audición, período/fechas de semestre, borrador/cierre, publicación y administración de jurados con trazabilidad |
| `iniciacion_candidatos` | Preferencia, resultado explícito, autorización de destino, clase regular obligatoria, vínculo de revisión final y versión |
| `iniciacion_valoraciones` | Distinguir diagnóstico, seguimiento y evaluación final; reglas de asignación por tipo; conservar notas históricas |
| `iniciacion_decisiones` | Registrar autorización, revocación, incorporación y resolución con actor, evidencia y snapshots |
| `alumnos_clases` | Mantener condición, referencia de candidatura y revisión; no duplicar matrículas existentes |

Los nombres de campos y firmas son propuestas: comprobar esquema, consumidores y permisos antes de escribir la migración. Reutilizar el período académico existente si es adecuado; no crear un catálogo paralelo de semestres. Evitar tablas nuevas si las existentes cubren el flujo sin perder integridad.

Ampliar el adapter con operaciones equivalentes a `listMyJuryAssignments`, `publishResults`, `authorizeDestination`, `listMyAuthorizedCandidates`, `enrollAuthorizedGuest`, `saveAdaptationReview` y `resolveGuest`. Todas las mutaciones validan sesión, permiso, estado y versión en servidor. El cliente no envía una identidad de actor confiable.

Separar la actual RPC `iniciacion_decidir`, que invita y matricula a la vez, en autorización e incorporación. La matrícula y el consumo de autorización deben ocurrir juntos. Bloquear candidato y destino en orden consistente; validar último cupo y duplicados bajo concurrencia. Devolver el resultado anterior ante reenvío de la misma operación, sin éxito falso.

Revisar RLS de convocatorias: el receptor no debe obtener acceso a todos los candidatos de una convocatoria por tener un solo invitado. Retirar un jurado impide nuevas calificaciones y conserva sus aportes históricos; coordinación revisa si esas valoraciones cuentan en el resultado pendiente. Tras publicar, cualquier corrección exige reapertura autorizada y auditoría.

## 7. Diferencias respecto de la primera integración

Ya existen en el código propuesto: convocatoria/origen, jurados, valoraciones, decisiones atómicas, invitación con revisión, historial y etiqueta en nóminas. No está desplegada la migración de ese módulo.

Falta en esta nueva versión: entradas por rol en ambos portales; medio/final de semestre enlazados; preferencia y asignación diferenciadas; aprobación explícita; publicación de resultados; autorización separada de matrícula; botón del receptor; seguimiento semestral; vínculo obligatorio a teoría/solfeo y permisos afinados para estas responsabilidades.

Esta especificación no acredita que esas ampliaciones estén implementadas. La comprobación de este turno anterior aprobó 163 pruebas relacionadas; la suite PostgreSQL no arrancó por dependencia ausente. No se declara validación completa de esta versión.

## 8. Criterios de aceptación y pruebas

| ID | Verificación obligatoria |
|---|---|
| AC01 | Administración crea convocatoria de medio/final, asigna jurados y abre la evaluación sin generar matrículas. |
| AC02 | Jurado asignado ve su tarea y guarda notas; no asignado no ve la tarea y recibe rechazo al intentar consultar o escribir directamente. |
| AC03 | Retirar jurado bloquea nuevas escrituras sin perder historial. Un receptor no asignado como jurado no califica la audición. |
| AC04 | Un resultado incompleto no autoriza incorporación; aprobar no asigna clase automáticamente. |
| AC05 | Preferencia violín y asignación distinta quedan separadas, con justificación y actor académico. |
| AC06 | Receptor autorizado incorpora con clase preseleccionada; otro maestro o un destino alterado recibe rechazo. |
| AC07 | Doble clic, reintento y solicitudes concurrentes producen una única matrícula e incorporación auditada. Dos alumnos compitiendo por el último cupo no sobrepasan capacidad. |
| AC08 | Matrícula fija previa no se convierte en invitada; invitación previa no se duplica; errores conservan formulario y no muestran éxito. |
| AC09 | Invitado aparece identificado y registra asistencia ordinaria; teoría/solfeo permanece activa y una ausencia de matrícula regular exige regularización o excepción académica registrada. |
| AC10 | Seguimiento enlaza evidencias originales. Audición final se vincula a la invitación inicial, aun con jurados distintos. |
| AC11 | Confirmar/prorrogar/finalizar exige autoridad, evidencia, observación y versión vigente; fecha vencida no cambia la matrícula. |
| AC12 | Jurado no consulta notas individuales ajenas; receptor ve solo alumnos que le corresponden; anónimos/inactivos no acceden. |
| AC13 | Demo permite recorrer el ciclo con alumnos sintéticos; UI usable en móvil y teclado, con etiquetas, carga y errores claros. |
| AC14 | Migración ensayada con esquema, triggers, grants y RLS equivalentes a producción; regresión de inscripción, asistencia y permisos aprobada. |

## 9. Plan de implementación posterior

1. Revisar esta propuesta y cerrar parámetros pedagógicos: escala/rúbrica, mínimo de jurados, fechas de semestre, capacidad académica de cada perfil y selección de teoría/solfeo.
2. Ajustar dominio y demo; crear pruebas de autorización, transición, reintento y regresión antes de la corrección correspondiente.
3. Preparar migración incremental, adapter y RPC con los mismos permisos en demo/real; preservar el trabajo de PR #158.
4. Integrar administración, «Mis audiciones», resultados autorizados, incorporación y seguimiento en portal docente.
5. Verificar recorrido completo con administración académica, jurado, receptor y maestro no asignado; revisar móvil y concurrencia.
6. Entregar vista previa evaluable con datos sintéticos y evidencia de pruebas. Después programar piloto, aplicar migración específica y publicar conforme a autorización institucional.

La activación requiere fijar responsable y fecha de primeras filas reales. Conservar las exenciones estructurales documentadas y revisar su vigencia; no afirmar soporte multiinstitucional. Reversión por frontend conserva matrículas e historial; no borrar tablas con datos reales.

## 10. Fuera de alcance

Mensajería automática a familias, entrega automática de instrumentos, cambios automáticos de instrumento principal, promociones por promedio, expulsiones por asistencia, evaluación offline y reconstrucción del evaluador legacy. No se aplican cambios de producción en la fase de propuesta.


## 11. Revisión crítica incorporada y mejoras profesionales

### Aclaración de Omar: secuencia académica y comunicación

Orden obligatorio: audición → conclusión explícita del jurado → resolución académica → consulta y registro de preferencia del alumno → verificación de disponibilidad del instrumento y cupo/horario de clase → autorización del destino por dirección/coordinación → incorporación como invitado → seguimiento → decisión final. Las preferencias se consultan después de la aprobación; una preferencia anterior en el padrón no sustituye esa consulta.

Violín y coro son únicamente ejemplos de pruebas, nunca opciones cerradas ni destinos obligatoriamente simultáneos. El catálogo proviene de las clases y especialidades activas del SOI. Un alumno puede optar solamente por coro, solamente por una clase instrumental u otros destinos que coordinación autorice. El soporte de varios destinos no obliga a elegir varios.

La conclusión del jurado debe ser explícita y trazable; coordinación conserva la decisión de asignación. Si hay discrepancias, registrar deliberación, conclusión y responsables, sin inferir aprobación de un promedio. El estado «Aprobó audición, pendiente de asignación» es distinto de «Destino autorizado» e «Incorporado como invitado».

Para destinos instrumentales, registrar comprobación de disponibilidad, responsable y fecha antes de autorizar. Un registro de instrumento disponible no equivale a préstamo o entrega física. Para coro, el requisito de instrumento es «No aplica»; cupo y horario siguen siendo obligatorios. Sin instrumento o cupo, mantener pendiente y ofrecer revisión de alternativas por coordinación, sin cambiar automáticamente la preferencia ni declarar fracaso académico. Revalidar la disponibilidad antes de incorporar; si cambió, detener e informar. No prometer disponibilidad en dos asignaciones incompatibles: el proveedor real deberá usar reserva verificable o confirmación operativa bajo control de coordinación.

**Informe de audición incluido en el alcance:** informe institucional con convocados, evaluados, pendientes/ausentes, conclusión, fortalezas, aspectos por mejorar, preferencias consultadas y clase/instrumento autorizado o pendiente. Informe individual con criterios observados, fortalezas, necesidades de apoyo, conclusión explicada, siguientes pasos y condición de invitado cuando corresponda. Cada informe queda fechado, versionado y aprobado por coordinación; los datos se vinculan a evidencia y no incluyen notas privadas de deliberación.

**Notificación a representantes incluida como flujo supervisado:** preparar una felicitación individual cuando exista aprobación confirmada y resultados publicados. Explicar qué significa aprobar, qué sigue pendiente y que una incorporación inicial es como invitado, manteniendo teoría/solfeo. Comunicar clase, horarios e instrumento solo cuando estén confirmados. Si la asignación ocurre después, emitir una comunicación distinta de incorporación. Para quienes continúan preparación, preparar devolución respetuosa con fortalezas, apoyos y próxima revisión; nunca una felicitación falsa.

Antes de enviar: verificar representante y contacto del alumno, canal autorizado y consentimiento aplicable; coordinación revisa destinatario y contenido y confirma el envío. Registrar identificador del evento, versión, destinatario, canal y estado pendiente/enviado/fallido; un reintento no duplica envíos. Nunca mostrar notas o resultados de otros alumnos. Reutilizar el mecanismo institucional de comunicaciones existente, una vez comprobadas sus capacidades; si no hay canal operativo, ofrecer texto revisado para entrega manual y marcar entrega solo con confirmación. Esta autorización de desarrollo no autoriza envíos reales en esta etapa.

Estos requisitos sustituyen la exclusión previa de informes elaborados para esta entrega: el informe individual y consolidado básico forman parte de la versión; diseño avanzado y envío desatendido siguen fuera de alcance.

**Aceptación adicional:** aprobar audición sin cupo o instrumento conserva resultado favorable y destino pendiente; coro omite instrumento; preferencia se consulta tras resolución; ningún botón incorpora antes de verificar disponibilidad; informe y felicitación reflejan el estado real; destinatario no verificado impide enviar; reintentos no duplican notificaciones.

- Criterios observables comunes y específicos de destino; descriptores para cada nivel. No observado no equivale a dificultad. La escala y el mínimo de jurados son configuración pendiente de validación, nunca un umbral de aprobación automático.
- Calibración breve de jurados con un ejemplo previo; diferencias de recomendación quedan visibles a coordinación para deliberación y acuerdo trazable. No aplicar alertas por diferencias numéricas sin definir escala y criterio.
- Panel con filtros: por evaluar, evidencia incompleta, por decidir, preparado sin cupo/instrumento, autorizado sin incorporar e invitado por revisar. Cada pendiente muestra responsable y próxima acción.
- Ficha de invitación: dos o tres objetivos observables, fecha de inicio, revisión y receptor. Seguimiento breve: progreso por objetivo, dificultad, apoyo requerido, recomendación y enlaces a evidencia. No exigir un informe semanal adicional.
- Evaluación final compara línea base y progreso por destino, distinguiendo ausencia a audición, evidencia insuficiente y decisión de continuar preparación. No convertir ausencia en resultado negativo.
- Resumen para conversación con familia, revisado por coordinación; separar deliberaciones internas. Informes elaborados y envío automático quedan fuera de primera fase.
- Recorrido de aceptación ampliado: alumno del segundo grupo, dos jurados, coro y violín, teoría/solfeo vigente; confirmar coro y prorrogar violín sin afectar el otro destino.

### Modelo revisado

La relación convocatoria/orígenes y la relación candidato/destinos deben ser múltiples. No guardar todos los destinos en un único campo ni reutilizar la versión de la candidatura como si fuera la versión de todas las invitaciones. Cada autorización/invitación requiere identidad y versión propias. La migración se diseñará después de inspeccionar integraciones; cualquier relación nueva incluirá escritor, primera utilización y ámbito institucional según política.

### Entrega inicial de desarrollo

Se incorpora un proveedor demo aislado con contrato ejecutable para autorización, incorporación por receptor, múltiples destinos, seguimiento y resolución independiente. Es una primera base de comportamiento, no una interfaz terminada ni un reemplazo de RPC/RLS. No se conecta todavía a la vista ni a la base de producción. Fechas de semestre, rúbricas, publicación y evaluación final por jurado requieren las siguientes etapas.
