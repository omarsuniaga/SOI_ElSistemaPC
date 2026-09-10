# DOMAIN INVARIANTS — Invariantes Reales del Dominio Institucional

> **Clasificación de Cumplimiento:**
> - `DB_ENFORCED`: Garantizado a nivel de base de datos por Constraint (PK, FK, UNIQUE, CHECK) o Trigger.
> - `SERVER_ENFORCED`: Garantizado en lógica de stored procedure / RPC / Edge Function.
> - `CLIENT_ONLY`: Solo validado en formularios del frontend (vulnerable a bypass).
> - `NOT_ENFORCED`: Declarado en documentación o lenguaje ubicuo pero no implementado.

| Invariante del Dominio | Nivel de Cumplimiento | Mecanismo de Validación | Riesgo si se Viola |
|---|---|---|---|
| **Un alumno no puede tener dos asistencias en la misma sesión** | `DB_ENFORCED` | UNIQUE constraint en `asistencias (sesion_clase_id, alumno_id)` | Duplicación de métricas de presencia |
| **El maestro solo puede registrar asistencia si está asignado a la clase** | `DB_ENFORCED` | RLS policy `Maestros gestionan sus asistencias` con `maestro_en_clase()` | Un maestro modificando asistencias ajenas |
| **Toda cuota pagada debe reflejar imputación FIFO** | `SERVER_ENFORCED` | Stored Procedure `fn_registrar_pago_transaccional` | Descuadre contable y moras falsas |
| **No puede haber dos clases solapadas en el mismo salón y horario** | `DB_ENFORCED` | Trigger `fn_validate_salon_no_overlap` sobre `clase_horarios` | Conflicto físico de aulas en la sede |
| **Un instrumento en reparación no puede ser entregado en comodato** | `SERVER_ENFORCED` | Trigger `fn_sync_estado_uso_activo` y validación en `comodatosApi.js` | Entrega de activos dañados o inoperativos |
| **Fusión atómica de alumnos transfiere todo el historial sin huérfanos** | `SERVER_ENFORCED` | Transacción atómica en `fn_fusionar_alumnos_duplicados` | Pérdida de notas o registros de pago del alumno |
| **Consentimiento explícito antes de envíos de WhatsApp masivos** | `SERVER_ENFORCED` | Verificación en `fn_whatsapp_reclamar_pendientes` contra `whatsapp_optout` | Bloqueo o baneo del número por spam |
| **No registrar asistencia en días no lectivos / recesos** | `SERVER_ENFORCED` | Función `fn_es_dia_lectivo()` consultada antes de notificar | Falsas alertas de ausentismo a maestros |
| **Validación de cédula y teléfono dominicano único** | `CLIENT_ONLY` | Expresiones regulares en formularios de admisión | Múltiples perfiles creados para un mismo representante |
| **Puntuación crediticia no combinada con rendimiento pedagógico (P12)** | `SERVER_ENFORCED` | Vistas separadas `vw_alumno_estado_pago` vs `vw_destacados_y_riesgo_academico` | Discriminación algorítmica de estudiantes |
