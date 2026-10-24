# Vigencia de clases y exoneración administrativa

Solicitud de Omar, 24 de octubre de 2026. Historia: como administrador quiero eliminar deuda anterior al inicio de una clase y resolver incidencias documentadas sin inventar asistencias ni contenido.

## Diagnóstico

La RPC `fn_estado_asistencia_maestro` y el calendario local proyectaban los horarios actuales sobre todas las fechas del período. Iniciación Musical - Matutino fue creada el 2 de septiembre y su horario de miércoles el 23 de septiembre. Los miércoles de agosto no son obligaciones válidas. El registro actual de Oboe del 29 de septiembre es un borrador vacío creado el 24 de octubre; las consultas de sesiones/observaciones/asistencias/eventos no localizaron contenido en las tres fechas señaladas. La ausencia en BD no prueba que nunca se escribió contenido en el dispositivo.

## Comportamiento y operación

- Fecha inicial efectiva: `clases.fecha_inicio` y `clase_horarios.vigente_desde`; si están vacías se usa `created_at` convertido a America/Santo_Domingo. `vigente_hasta` es inclusiva. Se respetan ambas fronteras y se preservan sesiones históricas registradas reales.
- Administración → Balance de asistencia → Ver detalle del maestro → Vigencia, por clase. La operación actualiza clase y horarios en una transacción. Solo administración puede cambiar estos campos.
- En el mismo detalle: Exonerar / Historial → alcance (asistencia, contenido, ambos) → motivo de 10 a 2000 caracteres → Registrar. La decisión conserva autor, fecha y motivo. Revocar exige un motivo nuevo y conserva la evidencia original.
- Tabla `registro_exoneraciones`: lectura por el propio maestro y administración; inserción/revocación solo administración. No permite borrar ni reescribir evidencia desde el cliente. El servidor fija los campos de autoría.
- El calendario muestra la exoneración en violeta y su motivo al abrir el día. No se crean sesiones ficticias, contenido ni marcas de asistencia.
- El alcance asistencia/ambos produce estado canónico `exonerada`: sale de la deuda y del denominador, nunca suma como registrada. Solo contenido conserva la obligación de asistencia y cancela únicamente las alertas de contenido.
- Los evaluadores y notificaciones existentes filtran exoneraciones; no se añade otro cron ni evaluador. Alertas pendientes canceladas guardan referencia a la exoneración y vuelven a estar pendientes al revocarla si la obligación sigue sin datos.
- No se exoneran automáticamente el 26, 29 ni 30 de septiembre: corresponde a administración elegir alcance y documentar el motivo.
- Primera fila real: administrador académico al resolver el primer caso después de publicar la interfaz. Demo: JSON inicial y mutaciones simuladas en memoria.

## Validación

`npm run test:db:class-exemptions` ejecuta PostgreSQL embebido (PGlite) con fixtures mínimos y las funciones legadas reales del dump de referencia. Verifica vigencia, conservación histórica, alcance, denominador, permisos, inmutabilidad, revocación y alertas. Vitest cubre el calendario renderizado, el adaptador Demo, errores de persistencia y revocación desde el formulario.

El control estructural del repositorio ya falla en master por deuda previa; la salida de esta rama es idéntica a la de master. No se cambia el baseline ni se agrega deuda: la nueva tabla tiene escritor y exención explícita por heredar clases/maestros del modelo legado.

## Límites

La vigencia explícita permite corregir cargas tardías. No reconstruye automáticamente versiones históricas de días/horarios eliminados ni asignaciones anteriores de maestros. El inicio por creación es un valor por defecto conservador, corregible por administración. La migración no borra registros previos y no registra decisiones institucionales por cuenta del usuario.

## Estado al cierre de la implementación

Las consultas iniciales no encontraban contenido en esas fechas. Una comprobación posterior, a las 12:49 del 24 de octubre (Santo Domingo), encontró registros nuevos: 26 de septiembre (57 caracteres de contenido, 8 asistencias; actualizado hoy 12:43) y 29 de septiembre (229 caracteres, 5 asistencias; actualizado hoy 12:41). El 30 seguía sin sesión. No atribuir esta actualización a la implementación: las consultas fueron de lectura y el cambio aún no está publicado.

247 pruebas de integración aprobadas; build y typecheck aprobados; ESLint sin errores. Las pruebas PostgreSQL embebidas incluyen además acceso de otro maestro y bloqueo de cambios en created_at para impedir evitar la vigencia por esa vía.

Publicación pendiente: la revisión automática rechazó `git push` por considerar insuficiente la autorización para publicar código en el remoto. No se intenta otro mecanismo de subida ni se aplica la migración a producción. Se requiere autorización explícita de Omar para subir la rama, fusionar/publicar el frontend y aplicar la migración.
