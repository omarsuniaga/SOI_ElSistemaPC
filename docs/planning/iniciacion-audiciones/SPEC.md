# Especificación técnica — primera integración

## Puntos de integración

- Entrada: `/audiciones.html#iniciacion`; el acceso sin hash también abre Iniciación. Los hash legacy explícitos conservan el módulo anterior y su control de acceso.
- `src/modules/audiciones/initiation/`: dominio puro, DataAdapter real/demo, vista y pruebas. La UI no importa Supabase.
- `alumnos_clases`: condición `fijo|invitado`, revisión y referencia a candidatura. La asistencia existente sigue consultando matrículas activas. Badge en nóminas de maestro y administración. No se modifica el alumno global ni su instrumento.
- Las decisiones requieren versión vigente y son atómicas: candidatura, matrícula e historial se escriben juntos. Se conserva la matrícula de origen.

## Modelo de datos

| Tabla | Identidad / relaciones | Datos y restricciones |
|---|---|---|
| `iniciacion_convocatorias` | UUID, clase origen → clases, creador → profiles | Nombre; ventana de ingreso; fecha de audición; UUID[] de jurados activos; mínimo de valoraciones; rúbrica JSON congelada; estado. No confundir con `periodos`. |
| `iniciacion_candidatos` | UUID, convocatoria, alumno; UNIQUE(convocatoria,alumno) | Snapshot de nombre validado desde alumnos; excepción; estado; ronda; versión; destino y matrícula; revisión; objetivos. |
| `iniciacion_valoraciones` | UUID, candidato, evaluador → profiles; UNIQUE(candidato,ronda,jurado) | Notas JSON de claves conocidas, 1–4 o null; observación; clase sugerida; completitud calculada en servidor; fecha. No reutiliza jurado text del legacy. |
| `iniciacion_decisiones` | UUID, candidato, actor → profiles; índice único candidato/versión | Acción explícita; observación obligatoria; payload; snapshot antes/después; fecha. Sin escritura ni borrado desde el navegador. |
| `alumnos_clases` existente | Matrícula única alumno/clase | Añade `condicion` (por defecto fijo), `invitacion_revision` y `audicion_candidato_id`. No convierte matrículas antiguas en invitaciones. |

Se conservan las tablas `evaluations`, `periodos`, `evaluacion_indicador`, alumnos, clases y asistencias. No se crean tablas genéricas de rúbrica, semestre, grupo o historial paralelo de alumnos.

## Contrato del adapter

`getContext`, `listCampaigns`, `createCampaign`, `getCampaign`, `listSourceStudents`, `addCandidate`, `saveEvaluation`, `decide`. El contexto incluye identidad auténtica, capacidad de gestión y catálogos mínimos. Las evaluaciones se consultan con join inner a la convocatoria seleccionada; RLS filtra además por actor. Demo usa exclusivamente fixtures sintéticos y el mismo contrato funcional, sin contactos reales.

RPCs expuestas: `iniciacion_contexto`, `iniciacion_guardar_valoracion`, `iniciacion_decidir`, todas invoker. El trabajo privilegiado reside en `soi_security`, comprueba perfil activo, identidad, asignación y transiciones. Sus EXECUTE se revocan de PUBLIC y anon. Decisión solo para admin/superadmin/dirección/coordinación académica activos; el sistema actual opera principalmente con admin/maestro.

## Integridad y concurrencia

- RLS en las cuatro tablas. Jurado lee sus valoraciones y candidatos de sus convocatorias. Receptor lee únicamente sus candidatos de destino. Coordinación consolida las evidencias. Las notas de otros jurados no se muestran al jurado.
- Insert de convocatoria/candidato solo con columnas permitidas y validación en trigger. Un alumno debe estar activo y matriculado en Iniciación. Falta de fecha, cohorte distinta o preparación inferior a tres meses requieren excepción.
- Las escrituras de valoración/decisión pasan por RPC. Bloquean el candidato, evitando cambios de ronda simultáneos. Cada decisión incrementa versión, con control de reenvío y auditoría inmutable.
- Invitación verifica capacidad, duplicado activo, fecha futura, objetivos y matrícula origen. Bloqueo de destino y advisory lock de clase compartido por el guard de matrículas para coordinar inserciones. No sustituye todas las validaciones históricas del catálogo; los otros flujos heredados pueden seguir permitiendo sobrecupo propio.
- Comprueba cruce de horarios; un acuerdo excepcional requiere motivo en el acta. Clases rotativas exigen día/hora dentro del horario general.
- Guard impide cambiar/borrar una invitación directamente desde los botones ordinarios de matrícula; debe finalizarse mediante decisión. Matrículas fijas ordinarias mantienen el comportamiento anterior. No se borra ninguna matrícula para hacer regresar al alumno.

## Política estructural y límites

POLICY-EXCEPTION R3: las cuatro tablas dependen del despliegue académico de una sola institución y no introducen un identificador ficticio. La base no tiene catálogo ni membresías institucionales canónicas. Plan de pago: incorporar `institucion_id`, FKs compuestas y aislamiento de actores conjuntamente con alumnos/clases antes de admitir una segunda institución; requisito de bloqueo de esa expansión. La exención está declarada en cada CREATE TABLE. No se afirma soporte multitenant.

R1: cada tabla tiene escritor en esta entrega: coordinación crea convocatoria y candidatura; jurado guarda valoraciones; RPC de coordinación registra decisiones. No aplicar tablas reales hasta fijar la fecha del piloto con coordinación; sus primeras filas se producirán en la apertura de ese piloto. En desarrollo las primeras filas son fixtures descartables de tests, nunca datos reales.

R6: ninguna nota media ni vencimiento cambia una matrícula. No se disparan comunicaciones ni automatizaciones de Hermes. Revisión pendiente se señala con fecha; no es una sanción.

Demo no reproduce bloqueos PostgreSQL ni toda la agenda; SQL es la autoridad para permisos, solapamientos y turnos rotativos. Primera UI: un origen por convocatoria, sin cierre/edición de convocatoria, carga masiva, panel de asistencia con badge ni PDF de acta. Esas ampliaciones tienen que conservar el contrato y las pruebas de esta versión.

## Publicación y reversión

1. Ejecutar tests de dominio, adapter, UI y PostgreSQL embebido, lint, tipos y build.
2. Ensayar la migración en copia de producción, incluidas las RLS y grants actuales; no ejecutar todas las migraciones históricas.
3. Confirmar cohorte, rúbrica, jurados, capacidades, fecha del piloto y aprobación de R3.
4. Aplicar solo la migración de esta entrega, desplegar frontend y realizar recorrido con coordinación, jurado y receptor.
5. Reversión inicial de frontend no borra datos. Si ya hay invitaciones, conservar esquema e historial hasta finalizar las invitaciones. Nunca eliminar tablas como rollback después de datos reales.
