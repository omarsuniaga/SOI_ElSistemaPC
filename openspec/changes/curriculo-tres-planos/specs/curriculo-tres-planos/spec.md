# Delta for Curriculo Tres Planos

## ADDED Requirements

### Requirement: Objetivos explícitos en el spine curricular
El sistema MUST representar los objetivos como un nivel propio entre temas y indicadores.

#### Scenario: Creación de contenido con objetivo
- GIVEN una ruta publicada con niveles y temas
- WHEN se registra un contenido con uno o más objetivos
- THEN el sistema persiste el objetivo como entidad separada
- AND los indicadores quedan asociados al objetivo correcto

#### Scenario: Tema sin objetivos
- GIVEN un tema existente sin objetivos migrados aún
- WHEN se consulta el contenido
- THEN el sistema MUST seguir respondiendo sin romper la lectura

### Requirement: Propuestas de contenido por maestro
El sistema MUST permitir que un maestro cree una propuesta de contenido scoped a una clase y la envíe para revisión ACM.

#### Scenario: Propuesta válida
- GIVEN un maestro autenticado y una clase asignada
- WHEN el maestro guarda una propuesta
- THEN la versión queda en estado `propuesta`
- AND queda asociada a `propuesta_por` y `clase_id`

#### Scenario: Propuesta inválida
- GIVEN un usuario sin clase asignada
- WHEN intenta guardar una propuesta
- THEN el sistema MUST rechazar la operación

### Requirement: Revisión ACM de propuestas
El sistema MUST permitir que ACM publique o devuelva una propuesta con feedback.

#### Scenario: Publicar propuesta
- GIVEN una propuesta en estado `propuesta`
- WHEN ACM la aprueba
- THEN el estado cambia a `publicada`

#### Scenario: Devolver propuesta
- GIVEN una propuesta en estado `propuesta`
- WHEN ACM la rechaza con feedback
- THEN el estado cambia a `devuelta`
- AND el feedback queda guardado

### Requirement: Lectura heredada desde versiones publicadas
El sistema MUST derivar la guía heredada desde `route_versions` publicadas.

#### Scenario: Guía con versión publicada
- GIVEN una ruta con versiones publicadas
- WHEN ACM abre la planificación
- THEN la vista muestra contenido derivado de `route_versions`

#### Scenario: Sin tablas fantasma
- GIVEN que no existen tablas ACM antiguas en producción
- WHEN la vista resuelve datos
- THEN la consulta MUST no depender de tablas `acm_*`

### Requirement: Parser como borrador revisable
El sistema MUST convertir la planificación subida por el maestro en borrador y exigir revisión antes de guardar.

#### Scenario: Documento parseable
- GIVEN un archivo PDF, DOCX o MD
- WHEN el parser lo procesa
- THEN el sistema devuelve un borrador estructurado
- AND no guarda nada automáticamente

#### Scenario: Documento largo
- GIVEN un documento que supera el límite de texto
- WHEN se procesa
- THEN el sistema MUST conservar el contenido completo por chunks

