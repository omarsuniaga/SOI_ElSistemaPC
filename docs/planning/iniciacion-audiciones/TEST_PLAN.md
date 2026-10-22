# Plan de pruebas y trazabilidad

| Requisitos | Casos automatizados / de aceptación |
|---|---|
| RF01–02 | Convocatoria real con perfiles activos; candidato de matrícula origen; cohorte con fecha ausente/fuera/menos de tres meses exige motivo; duplicado rechazado. |
| RF03–05 | Notas válidas 1–4, null sin convertir a cero, desconocidos/cero rechazados; completitud y mínimo de jurados; independencia de notas y autenticación de evaluador. |
| RF06–07 | Invitar conserva origen y añade/reactiva destino; cupo, duplicado y solapamiento; badge por matrícula sin cambiar condición global. |
| RF08–10 | Receptor registra revisión; confirmar mantiene destino, continuar solo desactiva invitación; prorrogar incrementa ronda y requiere nueva evidencia; versión desactualizada rechazada; auditoría inmutable. |
| RF11–12 | Error de capability/permisos visible, formulario conservado, demo completo, UI conectada a adapter, RPC con versión e identidad de sesión. |
| Seguridad | Maestro no asignado no ve candidatura; jurado no decide; receptor no ve otros candidatos; notas ajenas ocultas; manipulación directa de invitación y auditoría rechazada. |

Ejecución: `npx vitest run src/modules/audiciones/initiation/__tests__`.

SQL se ejecuta con PostgreSQL embebido PGlite fijado a versión exacta en devDependencies. Fixtures crean roles/RLS de audición y un núcleo académico mínimo equivalente a los campos usados; no es una copia completa de producción. Cada caso abre y revierte una transacción. Los tests no se conectan a Supabase ni publican datos.

Regresión relacionada: tests legacy de audiciones, gestión de clases del portal y clases del administrador. Si aparece un fallo previo en master, reproducirlo con la misma versión de dependencias en checkout base antes de atribuirlo al cambio.

Aceptación manual pendiente para piloto: dispositivo real de jurado y receptor, sesiones separadas, doble envío concurrente, conservación de asistencia, conflicto de dos candidatos por último cupo y fallos de red. El test PostgreSQL verifica restricciones y transacciones; no representa una prueba de concurrencia de varios navegadores.
