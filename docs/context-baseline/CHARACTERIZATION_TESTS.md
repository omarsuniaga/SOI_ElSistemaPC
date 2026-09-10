# CHARACTERIZATION TEST BASELINE — Batería de Pruebas de Caracterización (As-Is)

> **Propósito:** Demostrar que el comportamiento operativo existente no se altera durante la transición a SOI 2.0.
> **Infraestructura:** Vitest + Node Test Runner en el repositorio.
> **Clasificaciones:** `UNIT` · `DOMAIN` · `DATABASE` · `RLS` · `INTEGRATION` · `E2E`

| ID | Nombre del Flujo | Tipo | GIVEN (Precondición) | WHEN (Acción) | THEN (Resultado Esperado) |
|---|---|---|---|---|---|
| `CT-01` | **Autenticación y Redirección por Rol** | `INTEGRATION` | Un usuario registrado con perfil en profiles | Inicia sesión con credenciales válidas en loginView | Si rol es maestro redirige a index.html#hoy; si es admin/finanzas redirige al portal correspondiente |
| `CT-02` | **Aislamiento RLS por Departamento** | `RLS` | Un usuario autenticado con departamento ACM | Intenta ejecutar SELECT o UPDATE sobre cuotas de finanzas | La consulta falla o retorna conjunto vacío por denegación de RLS |
| `CT-03` | **Maestro ve sus Clases Asignadas** | `DATABASE` | Un maestro autenticado con ID registrado en tabla maestros | Consulta la vista o tabla clases | Retorna exactamente las clases donde maestro_principal_id o maestro_suplente_id coincide con su maestro_id |
| `CT-04` | **Toma de Asistencia y Creación de Sesión** | `INTEGRATION` | Una clase regular en el día de la fecha | El maestro marca P, A o J a la lista de alumnos en asistenciaView | Se crea o reutiliza la sesión en sesiones_clase y se inserta un registro en asistencias por cada alumno con marked_at |
| `CT-05` | **Modificar / Completar Asistencia Existente** | `DATABASE` | Una sesión de clase con asistencia previamente guardada | El maestro cambia el estado de un alumno de Ausente a Justificado adjuntando motivo | Se actualiza asistencias.estado y se crea/actualiza el registro en la tabla justificaciones |
| `CT-06` | **Registro de Contenido Pedagógico** | `DOMAIN` | Una sesión de clase abierta | El maestro escribe observaciones y tema visto | Se actualiza sesiones_clase.contenido y se inserta en observaciones_sesion con timestamp first_note_at |
| `CT-07` | **Detección de Alumno Crítico por Ausentismo** | `DATABASE` | Un alumno con 3 o más faltas injustificadas en los últimos 14 días | Se consulta la vista vw_alertas_activas | Retorna una fila tipo ausencias_consecutivas con color rojo y el total de faltas |
| `CT-08` | **Detección de Maestro sin Asistencia Registrada** | `DATABASE` | Clases dictadas en días lectivos pasados sin registro | Se ejecuta fn_resumen_cumplimiento_asistencia() o check_teacher_attendance | Retorna al maestro con es_solvente = false y el conteo de clases vencidas |
| `CT-09` | **Identificación de Alumno Activo sin Clase** | `DATABASE` | Un alumno con activo = true | No posee registros en alumnos_clases donde activo = true | Aparece en reportes de auditoría académica para asignación obligatoria |
| `CT-10` | **Detección y Fusión Atómica de Duplicados** | `INTEGRATION` | Dos registros de alumno con datos coincidentes (principal y obsoleto) | Se invoca RPC fn_fusionar_alumnos_duplicados | Se migran asistencias, cuotas y clases al principal y se borra el obsoleto dentro de una sola transacción atómica |
| `CT-11` | **Flujo de Solicitud de Ausencia Docente** | `INTEGRATION` | Un maestro que solicita permiso en su perfil | Envía fechas y motivo a ausencias_maestros | El estado queda pendiente y aparece en la bandeja de aprobación del coordinador en admin-aprobacion |
| `CT-12` | **Cobro de Cuota e Imputación FIFO** | `DATABASE` | Una familia con 3 cuotas pendientes de diferentes meses | Se invoca fn_registrar_pago_transaccional con monto parcial | Se cancela primero la cuota más antigua, el remanente amortiza la siguiente y el excedente va a wallet_movimientos |
| `CT-13` | **Asignación de Comodato de Instrumento** | `INTEGRATION` | Un instrumento disponible en inventario_activos y un alumno activo | Se registra comodatos_activos | El activo cambia su estado_uso a prestado y se genera el contrato legal PDF vía generar_contrato_pdf |
| `CT-14` | **Encolado y Despacho en Hermes WhatsApp** | `INTEGRATION` | Un evento que dispara una alerta a un representante | Se invoca fn_hermes_queue_whatsapp | Se inserta en hermes_whatsapp_queue con estado pendiente y el runner Baileys lo procesa respetando rate limit y horas de silencio |
