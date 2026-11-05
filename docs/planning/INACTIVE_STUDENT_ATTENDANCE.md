# Alumnos inactivos: asistencia, estado y búsqueda

## Regla y alcance

`alumnos.activo` determina la elegibilidad para registrar asistencia. También se requiere una inscripción activa para la nómina ordinaria. Retirar de una clase y desactivar al alumno son operaciones distintas. No se eliminan asistencias ni se desactivan masivamente inscripciones.

## Evidencia y corrección

La consulta del portal solo filtraba `alumnos_clases.activo`; la caché de esa consulta persistía diez minutos. El filtro de instrumentos comparaba el campo completo, excluyendo asignaciones combinadas.

- Nómina: join interno con alumno activo, filtro defensivo y consulta fresca al entrar a asistencia.
- Pantalla abierta: revalida actividad al recuperar foco o recibir un cambio desde otra pestaña. Retira los alumnos inactivos de las listas compartidas sin perder contenido ni las marcas de los demás alumnos.
- Caché: cambios de ficha, activación e inscripción notifican a las pestañas abiertas e invalidan peticiones pendientes y caché persistida.
- Base de datos: triggers protegen tanto las filas de `asistencias` como el JSON de `sesiones_clase`, incluyendo escrituras de clientes antiguos y cola offline.
- Historial: permite conservar marcas idénticas existentes, rechaza nuevas marcas y modificaciones de estado para inactivos, y fusiona las marcas históricas ocultas cuando el editor guarda una sesión anterior.
- Estados: sincroniza `activo` con `estado_academico`, conserva `retirado_con_deuda` y rechaza reactivaciones que eludan ese bloqueo. Las transiciones nuevas registran fecha local, autor mediante `auth.uid()` y motivo. Una desactivación genérica se registra como `inactivo`, sin inferir que fue voluntaria.
- Formulario: exige motivo antes de inactivar. No se reclasifican motivos históricos.
- Instrumentos: comparación por términos separados por coma, insensible a mayúsculas y acentos, sin confundir «Clarinete» con «Clarinete bajo». Disponible en adaptadores real y demo.

## Reconciliación de datos

Consulta del 2026-11-05: 80 alumnos inactivos conservaban la etiqueta académica `activo`; ninguno activo tenía etiqueta retirada. Había 20 inscripciones activas de 20 alumnos inactivos. La migración solo reconcilia la etiqueta redundante de los 80 inactivos a `retirado`; no cambia `activo`, matrículas, deuda, asistencias ni auditorías anteriores. Las 20 matrículas permanecen resguardadas y quedan excluidas de la nómina por la regla de actividad.

## Verificación

- Pruebas de consulta y DOM: alumno inactivo con inscripción activa, nómina fresca, refresco al recuperar foco con contenido conservado, filtro multivalor y motivo obligatorio.
- Notificaciones: pestaña actual, evento `storage` de otras pestañas y limpieza de suscripciones.
- PostgreSQL local mediante PGlite: nuevas asistencias rechazadas, UPSERT histórico idéntico permitido, cambio de marca e identidad rechazados, JSON protegido, historial oculto preservado y transiciones auditadas con autor/motivo.
- CI ejecuta `node supabase/tests/inactiveStudentAttendance.test.mjs` junto con las regresiones existentes de asistencia.
- Ejecutar además build, tipos, lint y política estructural. No se crean tablas ni permisos de lectura/escritura nuevos.

## Despliegue

Aplicar la migración transaccional antes de publicar el frontend. Verificar que no existan alumnos inactivos con etiqueta académica activa, y que permanezcan intactos los conteos de asistencias e inscripciones. Comprobar rechazo de una asistencia nueva de alumno inactivo en una transacción con rollback.

La actualización entre dispositivos sucede al recuperar foco o ante un intento de escritura; no se añade un canal Realtime ni sondeo continuo. Offline, el servidor vuelve a validar al sincronizar.

## Resultado de controles

Pruebas focalizadas iniciales: 348 aprobadas; motivo y eventos añadidos posteriormente verificados en sus suites. Build y TypeScript aprobados; lint sin errores (avisos preexistentes). El control estructural falla también en `origin/master`: comparación literal de salida entre la rama y un worktree limpio idéntica (3 tablas huérfanas y 26 tablas sin institución fuera del baseline). No se aumenta ni se modifica ese baseline.

Batería completa: 4,847 pruebas aprobadas, siete omitidas y un fallo de descubrimiento de la nueva prueba SQL. Se corrigió registrándola como suite dedicada y se verificó el contrato de descubrimiento nuevamente. La prueba SQL pasa también bajo el rol `authenticated`, sin permisos directos sobre la tabla de auditoría.

## Estado de entrega

Implementación conservada en la rama local `fix/inactive-student-attendance`. Publicación bloqueada por revisión automática: solicita autorización explícita para enviar los cambios al repositorio remoto. No se aplicó la migración a producción ni se modificaron datos institucionales durante esta implementación.
