# SRS — Audición de Iniciación y participación como invitado

Versión 1.0, 22-10-2026. Solicitante: Omar. Propuesta pedagógica: maestro de Iniciación. Estado: primera integración para revisión, sin publicación automática.

## Objetivo y actores

Evaluar una cohorte semestral alrededor de los tres meses, recoger valoraciones individuales del jurado, decidir una participación temporal en una clase de destino y revisar si se confirma o finaliza. El alumno sigue siendo alumno de la institución; invitado/fijo describe su matrícula en una clase.

Actores: administrador/coordinación con rol institucional autorizado, jurado asignado (maestro o perfil jurado activo), maestro receptor y lector autenticado asignado. El rol de maestro por sí solo no permite decidir ni consultar otras convocatorias.

## Historias y requisitos funcionales

| ID | Historia / comportamiento verificable |
|---|---|
| RF01 | Coordinación crea una convocatoria con cohorte inicio/fin, fecha de audición, clase de origen de Iniciación, rúbrica y jurados identificados por UUID real. Un registro por grupo de origen; varios grupos usan convocatorias distintas. |
| RF02 | Coordinación incorpora alumnos activos con matrícula activa en la clase de origen. La fecha principal es ingreso a Iniciación; si falta, cae fuera de cohorte o aún no cumple tres meses calendario, exige excepción justificada. Tres meses no es una promoción automática. |
| RF03 | El jurado asignado califica cada criterio 1–4 o «No observado». Guarda observación y clase sugerida opcional. Un cero o vacío no se convierte en nota. |
| RF04 | Cada jurado ve sus propias valoraciones; coordinación ve todas. La identidad se toma de la sesión, nunca de texto libre. Se puede corregir la valoración solo en la ronda vigente y antes de la decisión. |
| RF05 | Una nota media es orientativa. Para invitar o continuar preparación se exige el mínimo configurado de valoraciones completas. Ningún promedio toma la decisión. |
| RF06 | Coordinación invita con observación, objetivos, clase destino activa distinta del origen y revisión futura. Se verifica cupo y solapamiento; un conflicto requiere justificación explícita. No se eliminan matrículas de origen. |
| RF07 | La invitación crea/reactiva una matrícula normal de `alumnos_clases`, con condición invitado y fecha de revisión. La nómina identifica esa condición; el registro ordinario de asistencia la incluye. |
| RF08 | Jurado o maestro receptor registra la valoración de revisión. Confirmar fijo, continuar Iniciación o prorrogar exige nota completa de la ronda actual y observación de la decisión. |
| RF09 | Confirmar cambia solo la condición de destino. Continuar Iniciación desactiva solo esa invitación. Prorrogar establece nueva revisión posterior a la anterior e incrementa la ronda. No hay cambios automáticos al vencer una fecha. |
| RF10 | Toda decisión guarda actor, fecha, versión y snapshot antes/después. Reenvíos o pantallas antiguas no duplican matrículas ni sobrescriben decisiones posteriores. |
| RF11 | Error de red, permiso, conflicto o falta de migración se muestra sin éxito falso. La UI conserva el formulario en error. No hay envío de mensajes ni publicación de notas a familias en esta fase. |
| RF12 | Demo y real ofrecen el mismo contrato de aplicación. Las tablas nuevas tienen escritor desde esta entrega. |

## Reglas pedagógicas propuestas, configurables

Rúbrica inicial: pulso/ritmo, escucha/entonación, lectura/teoría, coordinación, trabajo en grupo y preparación para destino. Escala 1=inicial, 2=en desarrollo, 3=logrado, 4=consolidado. Criterios obligatorios sin observar hacen la valoración incompleta para decidir. La media solo utiliza notas observadas y muestra su denominador. Rúbrica congelada por convocatoria, sin editor posterior que cambie notas históricas. Invitación inicial sugerida: 42 días; el plazo lo fija coordinación. Mínimo inicial sugerido: un jurado, ajustable al crear convocatoria.

La permanencia en Iniciación no se describe como fracaso. No se cambia `instrumento_principal` al invitar ni al confirmar; requiere el procedimiento académico de asignación correspondiente.

## Estados y autorizaciones

`pendiente → invitado → fijo` o `pendiente/invitado → continua_iniciacion`. `invitado → invitado` mediante prórroga registrada. Cada nueva revisión es otra ronda. Las candidaturas finalizadas no se reabren; una nueva oportunidad requiere otra convocatoria.

Coordinación decide. Jurado evalúa cuando está asignado. Maestro receptor evalúa revisiones de sus alumnos invitados. Usuarios pendientes, inactivos, anónimos y maestros no asignados no acceden al flujo. No se altera la lectura global de alumnos autorizada por separado.

## Requisitos no funcionales

- Atomicidad de matrícula y decisión; control de versión y bloqueo del candidato/clase destino.
- RLS y grants restrictivos; helper privilegiado privado solo para operaciones de dominio, fachada invoker y autenticación por `auth.uid()`.
- Historial sin eliminación desde el navegador y sin información de salud/contacto en el contexto de audición.
- UI usable por teclado y pantalla pequeña, etiquetas explícitas y mensajes de guardado.
- No modifica ni duplica evaluaciones diarias, planificación, asistencia, Hermes ni el evaluador legacy.

## Alcance y límites de entrega

La primera integración incluye convocatoria, candidatos, valoración inicial/revisión, decisiones y matrícula con badge, además de demo, esquema y tests. La activación real queda sujeta al ensayo de la migración contra una copia de producción y piloto institucional. No se ejecutan migraciones históricas en bloque ni se crean convocatorias reales sin datos aprobados.

Fuera de esta entrega: comunicación a familias, boletín PDF, agenda por turnos, carga masiva de varias clases origen, evaluación offline, firma del acta, políticas académicas definitivas y multitenencia completa. El vencimiento solo informa; no sanciona ni matricula automáticamente.
