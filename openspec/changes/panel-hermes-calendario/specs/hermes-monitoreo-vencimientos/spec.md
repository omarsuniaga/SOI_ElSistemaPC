# hermes-monitoreo-vencimientos Specification

## Purpose

Función/cron nueva (patrón `analyze-risk.js`) que escanea `tareas_institucionales` próximas a vencer y escala como `hermes_process_case` de alerta. Es monitoreo de solo lectura sobre tareas con escritura acotada a casos — **nunca ejecuta acciones, nunca modifica tareas**.

## Requirements

### Requirement: Escaneo de tareas por vencer
El sistema MUST escanear `tareas_institucionales` filtrando por `fecha_vencimiento` dentro de una ventana `[hoy, hoy+N días]` y `estado != 'completado'`.

#### Scenario: Tarea dentro de la ventana de riesgo
- GIVEN una tarea con `fecha_vencimiento = hoy + 3 días` y `estado = 'pendiente'`
- AND `N >= 3`
- WHEN se ejecuta el escaneo
- THEN la tarea es incluida en el conjunto de tareas en riesgo

#### Scenario: Tarea ya completada se excluye
- GIVEN una tarea con `fecha_vencimiento` dentro de la ventana y `estado = 'completado'`
- WHEN se ejecuta el escaneo
- THEN la tarea NO se incluye en el conjunto de tareas en riesgo

### Requirement: Creación/actualización de caso de alerta
Al detectar una tarea en riesgo, el sistema MUST crear o actualizar (idempotente) un `hermes_process_case` con `owner_department` igual al `departamento` de la tarea, referenciando la tarea de origen.

#### Scenario: Primera detección de una tarea en riesgo
- GIVEN una tarea en riesgo sin caso de alerta previo asociado
- WHEN se ejecuta el escaneo
- THEN el sistema crea un `hermes_process_case` nuevo con `owner_department = departamento` de la tarea
- AND el caso queda vinculado a la tarea de origen (vía `entity_type`/`entity_id` o campo equivalente)

#### Scenario: Segunda ejecución sobre la misma tarea aún en riesgo
- GIVEN un `hermes_process_case` de alerta ya creado para una tarea que sigue en riesgo
- WHEN el escaneo se ejecuta nuevamente
- THEN el sistema actualiza el caso existente en lugar de crear un duplicado

### Requirement: Prohibición absoluta de escritura fuera de hermes_process_cases
El sistema MUST NOT modificar el campo `estado` (ni ningún otro campo) de `tareas_institucionales` como parte de este monitoreo. El monitoreo MUST limitar su escritura exclusivamente a la creación/actualización de filas en `hermes_process_cases`.

#### Scenario: Tarea vencida detectada, estado permanece intacto
- GIVEN una tarea con `fecha_vencimiento` vencida y `estado = 'pendiente'`
- WHEN el escaneo detecta la tarea y crea el caso de alerta
- THEN el campo `estado` de la tarea en `tareas_institucionales` permanece `'pendiente'` sin cambios
- AND ningún otro campo de la fila de la tarea es modificado

### Requirement: Prohibición absoluta de ejecución de acciones externas
El sistema MUST NOT disparar, directa ni indirectamente, ninguna acción de comunicación externa (WhatsApp, email, Instagram, u otro canal) como parte de este monitoreo. La única salida permitida es la creación/actualización del caso en `hermes_process_cases`.

#### Scenario: Escalamiento no envía notificación externa
- GIVEN una tarea en riesgo detectada por el escaneo
- WHEN el sistema crea el caso de alerta correspondiente
- THEN no se invoca ningún servicio de WhatsApp, email o Instagram desde esta función
- AND la única evidencia observable de la ejecución es la fila creada/actualizada en `hermes_process_cases`

### Requirement: Sin mecanismo de cola, reintentos ni niveles de ejecución
El sistema MUST NOT implementar ni referenciar `hermes_jobs`, colas, reintentos, ni niveles `AUTO`/`PROPOSAL`/`HUMAN_REQUIRED` como mecanismo de ejecución de este monitoreo.

#### Scenario: Ejecución del escaneo es una función directa, no una cola
- GIVEN el cron/función de monitoreo configurado
- WHEN se ejecuta en su horario programado
- THEN corre como invocación directa de función (patrón `analyze-risk.js`), sin encolar trabajo en `hermes_jobs` ni tabla de cola equivalente
