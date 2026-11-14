# Cumpleañeros, compartir mensual y versiones del SOI

Autorizado por Omar el 14/11/2026. Rama: `feat/monthly-birthdays`. Versión de producto: **1.6.0**.

## Recorrido funcional

1. ADM → Personas y Admisión → **Cumpleañeros**: mes actual por defecto, selector de mes y año del compartir, búsqueda, alumnos/maestros y fichas activas por defecto.
2. La vista muestra cumpleaños del mes y un apartado independiente de fechas pendientes o por revisar. Cada registro enseña nombre, día/mes y clase activa o especialidad. No presenta edad ni año de nacimiento.
3. ADM puede completar/corregir una fecha en la misma ficha. El maestro puede completar la propia desde **Perfil → Datos personales → Fecha de nacimiento**, con guardado independiente.
4. La fecha propuesta para el compartir es el último día del mes. Administración elige fecha, horas, lugar, responsable y notas; guarda explícitamente la reserva.
5. Un compartir puede quedar por organizar, programado, realizado o cancelado. Al cancelar/reprogramar se reutiliza el mismo registro; no se duplica el mes.
6. Actividades Institucionales → Todas muestra el compartir con un enlace a su gestión. La tarjeta no reutiliza los botones de aprobación, corrección académica ni pase de lista.
7. Clases de Hoy de ADM muestra un resumen del mes y acceso directo a la organización. Su carga no bloquea la consulta de clases si falla.
8. ADM → Sistema y Accesos → **Versiones y novedades**; en el portal maestros, el mismo historial se abre desde el pie de Perfil para cualquier maestro.

Los totales cuentan fichas por grupo. No se deduplican alumnos y maestros mediante coincidencias de nombre. El filtro de inactivos es explícito; los datos incompletos no se convierten en cumpleaños. El 29 de febrero permanece en febrero, incluso al organizar un compartir en un año no bisiesto.

## Persistencia y efectos

Se reutilizan `alumnos.fecha_nacimiento` y `calendario_institucional`; se añade únicamente `maestros.fecha_nacimiento`. No se crean tablas.

El evento del compartir tiene categoría `otro`, metadatos `tipo=cumpleanos_mes` y `cumpleanos_periodo=AAAA-MM`. Un índice único impide dos reservas para el mismo mes; la versión del evento evita sobrescribir cambios simultáneos. Las horas se construyen en `America/Santo_Domingo`.

Guardar el compartir no llama a la aprobación académica, no crea afectaciones ni exenciones, no registra asistencias, no convoca personas ni envía mensajes. El disparador existente de Hermes conserva su funcionamiento para los demás eventos y excluye los eventos de compartir de cumpleaños, incluso si se configura un protocolo genérico de categoría `otro`.

El adaptador Real/Demo expone consulta, captura administrativa, captura propia y gestión del evento. La consulta real vuelve a comprobar permisos en cada carga; no reutiliza un caché de personas entre sesiones de distintos usuarios. La respuesta agregada no está sujeta al límite de filas de una consulta PostgREST plana. La interfaz pagina tarjetas y no limita los conteos a las tarjetas visibles.

Demo usa JSON y un almacén compartido en memoria para reflejar el mismo evento en Cumpleañeros y Actividades Institucionales durante la sesión de la app. No escribe datos reales.

## Permisos y privacidad

Las nuevas funciones son `SECURITY INVOKER`, tienen acceso anónimo revocado y respetan RLS. La consulta global y la gestión administrativa requieren un perfil activo de administración, superadministración o coordinación académica.

El guardado propio no recibe un ID de maestro: lo resuelve con `auth.uid()` y exige ficha activa. La política de actualización propia está acompañada de un guard que impide modificar campos administrativos, cambiar de propietario o elevar permisos. Se conservan los campos personales que ya edita el perfil existente: nombre, teléfono, especialidad y disponibilidad. Otros miembros de coordinación que corrigen una ficha ajena solo pueden cambiar su fecha; las operaciones administrativas y las funciones privilegiadas existentes conservan sus permisos y guardas.

La vista administrativa recibe día/mes, contexto e identificadores, sin fecha de nacimiento completa. Solo el formulario de captura administrativa y el propietario trabajan con la fecha completa. No se guarda esa fecha nueva en el almacenamiento local del navegador ni en metadatos del evento.

Migración aplicada: `20261114044553_monthly_birthdays.sql`, con el mismo identificador registrado en Supabase. No se ingresaron fechas ficticias ni se crearon celebraciones reales para probar.

## Historial de versiones

`src/core/version/CHANGELOG.js` continúa como fuente única de versiones, fechas y cambios. `config.version` también consume `APP_VERSION`. La vista muestra versión actual, cantidad de versiones y cambios **documentados**, secuencia, fechas, tipos y búsqueda. No expone diagnósticos ni herramientas administrativas a maestros.

Se documentan retrospectivamente las entregas verificables del 13/11 como 1.5.2 y 1.5.3. Se etiquetan expresamente como numeración retrospectiva; no se afirma que esos números estuvieran visibles al publicarlas originalmente. Se conserva el historial anterior. La publicación nueva 1.6.0 corresponde al 14/11/2026, con precisión de día.

AGENTS.md establece el registro de una entrada y actualización coherente de versión/fecha en cada publicación funcional futura. Las publicaciones exclusivamente documentales no generan una versión de producto. Las pruebas verifican versiones únicas, orden semántico y coherencia con la versión activa.

## Evidencia de validación

- Suite completa local: **4.901 aprobadas, 7 omitidas**, con 587 archivos aprobados y 2 omitidos.
- Pruebas SQL aisladas: migración, permisos, captura propia/administrativa, rechazo de futuras, ausencia de efectos académicos/Hermes, persistencia, unicidad mensual, cancelación/reprogramación, control de concurrencia y compatibilidad con operaciones previas del perfil.
- Pruebas de interfaz/adaptador: conteos, filtros, búsqueda conservando foco, datos pendientes, escape de nombres, recarga de eventos, fallos de guardado conservando campos y navegación sin sobrescribir otra vista tras una respuesta tardía.
- Registro de rutas comprobado para todos los elementos del menú ADM; suite SQL incorporada a CI y al contrato de descubrimiento de pruebas.
- Lectura real con rol autenticado administrativo, en transacción revertida: **242 fichas activas, 10 cumpleaños de noviembre y 82 fechas pendientes**; las 21 fichas de maestros aún no tenían fecha capturada. Son conteos de verificación, no una fotografía histórica permanente.
- Funciones reales verificadas sin elevación `SECURITY DEFINER` y sin permiso de ejecución anónimo. No aparecieron advertencias de seguridad con nombres de los objetos nuevos en el asesor consultado; esto no constituye un cierre de la deuda de seguridad previa del proyecto.

La revisión visual interactiva del entorno de pruebas quedó limitada por la falta del proveedor de accesibilidad del navegador disponible. Las pruebas de interfaz automatizadas y las reglas responsive están verificadas; la comprobación manual con cuentas reales queda pendiente. No se usaron servicios de IA de Netlify.

## Reversión

Se puede restaurar el despliegue anterior conservando fechas y eventos registrados. No se deben borrar los datos nuevos para revertir el frontend. La migración es aditiva y no altera las funciones de aprobación académica; la exclusión de cumpleaños del disparador de Hermes evita que una reserva de convivencia se convierta en una automatización de tareas.
