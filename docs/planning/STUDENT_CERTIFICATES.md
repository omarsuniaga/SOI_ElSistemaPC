# Constancias por alumno · 26/11/2026

Solicitud de Omar: separar la aceptación de beca y compromiso de pago de una constancia tradicional de estudios.

Desde el perfil ADM se ofrecen enlaces a `alumnos/:id/constancia-inscripcion` y `alumnos/:id/constancia-estudios`. Ambos cargan el alumno seleccionado mediante el DataAdapter existente y permiten revisar/completar los datos antes de generar. Las correcciones de esta pantalla afectan solo al PDF y se indica expresamente; no se escriben datos ni consentimientos en la ficha.

La inscripción expresa en primera persona la aceptación de la beca mensual de RD$4,500.00 sobre un programa de RD$5,150.00 (87% cubierto), condiciones de rendimiento, interés y asistencia notable y compromiso del aporte regular de RD$650.00. Conserva el plan semestral de RD$3,600.00 adelantados en enero por enero–junio, equivalente a RD$600.00/mes y ahorro de RD$300.00. Incluye identidad, parentesco, firma y fecha de firma del representante. No afirma que generar el documento constituya firma o aceptación.

Estudios acredita pertenencia desde la fecha real de ingreso, nombre, formación instrumental o programa, nacimiento y nacionalidad cuando estén disponibles; se emite a solicitud de la parte interesada, con espacio para firma y sello institucional. No contiene condiciones de beca o pago.

No se usa `created_at` para inferir ingreso ni `instrumento_interes` para acreditar formación. Se requieren nombre, ingreso y formación; en inscripción, además identidad del representante. Se rechazan fechas inválidas, futuras o anteriores al nacimiento. Un alumno inactivo debe revisarse en el perfil antes de emitir pertenencia actual. Los datos introducidos se escapan al renderizar y el PDF no incorpora campos médicos ni observaciones ajenas al documento.

No se crean tablas, migraciones, permisos públicos, accesos sin sesión, firmas electrónicas ni cobros. Demo y producción usan el mismo flujo a través de alumnosApi.
