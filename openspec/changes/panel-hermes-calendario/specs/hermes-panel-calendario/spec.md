# hermes-panel-calendario Specification

## Purpose

Vista de casos operativos de `hermes_process_cases` en el portal Calendario, con aprobación/rechazo scoped por `owner_department` autorizado server-side. No introduce ejecución automática: la máquina propone el caso, el humano decide.

**Nota de vocabulario (mapeo a valores reales de columna)**: los términos "pending", "approved" y "rejected" usados en los escenarios de abajo son conceptos de negocio, no los literales exactos de `hermes_process_cases.status`. El CHECK constraint real de producción es `status = ANY (ARRAY['open','in_progress','blocked','closed','cancelled'])`. Mapeo: **pending → `open`**, **approved → `closed`**, **rejected → `cancelled`**. Cualquier test/assert contra esta spec debe verificar el valor real de columna (`open`/`closed`/`cancelled`), no los strings conceptuales usados aquí para legibilidad.

## Requirements

### Requirement: Visibilidad universal de casos
El sistema MUST mostrar a todos los roles autenticados todos los `hermes_process_cases`, en solo lectura, independientemente del `owner_department` del caso.

#### Scenario: Usuario ve casos de otros departamentos
- GIVEN un usuario autenticado con `owner_department = "ACM"`
- WHEN abre el panel Calendario
- THEN ve en la lista casos con `owner_department` distinto de "ACM" (ej. "FIN", "DIR")
- AND los campos del caso se muestran en modo solo-lectura

### Requirement: Aprobación/rechazo scoped por owner_department (server-side)
El sistema MUST autorizar la acción approve/reject de un `hermes_process_case` exclusivamente vía política RLS o RPC server-side que valide `owner_department` del caso contra el departamento del usuario autenticado. El sistema MUST NOT depender únicamente de ocultar el botón en la UI.

#### Scenario: Mismo departamento aprueba su propio caso
- GIVEN un caso con `owner_department = "FIN"` y estado `pending`
- AND un usuario autenticado con `owner_department = "FIN"` y rol autorizado
- WHEN el usuario invoca la acción approve sobre ese caso
- THEN el RPC/policy server-side permite la operación
- AND el estado del caso se actualiza a `approved`

#### Scenario: Departamento cruzado intenta aprobar/rechazar (rechazo obligatorio)
- GIVEN un caso con `owner_department = "FIN"`
- AND un usuario autenticado con `owner_department = "ACM"` (departamento distinto)
- WHEN el usuario invoca approve o reject directamente contra el RPC/endpoint (sin pasar por la UI), incluso si conociera el `id` del caso
- THEN el servidor MUST rechazar la operación con un error de autorización (403 o equivalente)
- AND el estado del caso MUST permanecer sin cambios
- AND el rechazo MUST ocurrir aunque la UI del cliente hubiese estado manipulada para mostrar el botón

#### Scenario: Usuario sin owner_department asignado
- GIVEN un usuario autenticado sin `owner_department` configurado
- WHEN intenta aprobar/rechazar cualquier caso
- THEN el servidor MUST rechazar la operación con error de autorización

### Requirement: automationLevel como metadato de política
Si existe el campo `automationLevel` en `src/domains/orchestration/`, el sistema MUST tratarlo únicamente como metadato informativo de política, y MUST NOT usarlo para disparar ejecución automática de acciones.

#### Scenario: automationLevel no dispara ejecución
- GIVEN un caso con `metadata.automationLevel` presente
- WHEN el panel renderiza el caso
- THEN el valor se muestra como etiqueta informativa
- AND ninguna acción (aprobar, rechazar, notificar) se ejecuta automáticamente a partir de ese valor
