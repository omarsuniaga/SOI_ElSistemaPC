# hermes-vista-anticipacion Specification

## Purpose

Vista cruzada de solo lectura que combina `calendario_institucional`, `tareas_institucionales` y `hermes_process_cases` para responder "qué se acerca, qué se le pidió a cada depto, qué está pendiente/vencido", usando el pipeline ya generado por `fn_hermes_auto_delegar_tareas()`.

## Requirements

### Requirement: Vista cruzada por evento próximo
El sistema MUST mostrar, para cada evento próximo de `calendario_institucional`, las tareas de `tareas_institucionales` vinculadas a ese evento (`event_id`), junto con el `hermes_process_case` de escalamiento asociado si existe.

#### Scenario: Evento con tareas generadas por el trigger existente
- GIVEN un evento en `calendario_institucional` con tareas creadas por `fn_hermes_auto_delegar_tareas()`
- WHEN el usuario abre la vista de anticipación
- THEN el sistema muestra el evento junto con todas sus tareas asociadas por `event_id`
- AND cada tarea muestra `departamento`, `estado`, `prioridad` y `fecha_vencimiento`

#### Scenario: Evento sin protocolo asociado
- GIVEN un evento en `calendario_institucional` sin `categoria_evento` que matchee ningún `hermes_protocolos` activo
- WHEN el usuario abre la vista de anticipación
- THEN el evento se muestra sin tareas asociadas (lista vacía), sin error

### Requirement: Agrupación por departamento y orden por vencimiento
El sistema MUST agrupar las tareas mostradas por `departamento` y MUST ordenarlas de forma ascendente por `fecha_vencimiento` dentro de cada grupo.

#### Scenario: Múltiples departamentos con tareas del mismo evento
- GIVEN un evento con tareas para `departamento = "ACM"` y `departamento = "FIN"`, con distintas `fecha_vencimiento`
- WHEN el usuario visualiza el evento en la vista de anticipación
- THEN las tareas aparecen agrupadas por departamento
- AND dentro de cada grupo, la tarea con `fecha_vencimiento` más próxima aparece primero

### Requirement: Vista de solo lectura, sin escritura
El sistema MUST NOT permitir, desde esta vista, la edición de `tareas_institucionales`, `calendario_institucional` ni `hermes_process_cases`. Las únicas acciones de escritura disponibles son las heredadas de `hermes-panel-calendario` (approve/reject de caso).

#### Scenario: Usuario intenta editar una tarea desde la vista de anticipación
- GIVEN la vista de anticipación renderizada
- WHEN el usuario interactúa con una tarea listada
- THEN no existe control de UI que modifique `estado`, `checklist` ni ningún campo de `tareas_institucionales`
