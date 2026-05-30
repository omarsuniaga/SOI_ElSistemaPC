# orchestral-section-registry Specification

## Purpose

Mapear secciones orquestales a instrumentos y expandir referencias de sección (ej. "maderas") en alumnos individuales del roster. Sirve como capa de datos pura para Groq, el panel de resumen y el guardado de progresos.

## Requirements

### Requirement: Static Section-Instrument Mapping

El sistema DEBE mantener un mapa estático sección → lista de instrumentos que la componen.

| Sección | Instrumentos |
|---------|-------------|
| `cuerdas` | violín, viola, violonchelo, contrabajo |
| `violines` | violín |
| `violas` | viola |
| `cellos` | violonchelo |
| `contrabajos` | contrabajo |
| `maderas` | flauta, oboe, clarinete |
| `vientos_madera` | flauta, oboe, clarinete |
| `flautas` | flauta |
| `oboes` | oboe |
| `clarinetes` | clarinete |
| `tutti` | (todos los presentes) |
| `general` | (todos los presentes) |
| `individual` | (sin expansión) |

#### Scenario: Unknown section returns empty

- GIVEN a section name that is not in the registry (e.g., "percusiones")
- WHEN `expandSeccionItems` processes an item with that section
- THEN the item SHALL keep its original structure without expansion.

### Requirement: Instrument Normalization

El sistema DEBE normalizar instrumentos para matching case-insensitive, sin acentos y sin plurales.

- "Violín", "violines", "VIOLIN" → matchean "violín"
- "Violonchelo", "violonchelos", "cellos" → matchean "violonchelo"
- "Flauta", "flautas" → matchean "flauta"

#### Scenario: Match with diacritics and plurality

- GIVEN a student with `instrumento_principal = "Violín"`
- WHEN the section `violines` is resolved
- THEN the student SHALL be included in the expansion.

### Requirement: Section-Based Student Filtering

`getAlumnosBySeccion(seccion, alumnos, presentes)` DEBE retornar alumnos cuyo instrumento normalizado pertenezca a la sección indicada.

- `tutti` y `general` → retornan todos los alumnos en `presentes`.
- `individual` → retorna array vacío.
- Sección con instrumentos → filtra `alumnos` por match de instrumento contra el mapa.

#### Scenario: Filter by section

- GIVEN 3 alumnos: { nombre: "Ana", instrumento_principal: "Violín" }, { nombre: "Luis", instrumento_principal: "Flauta" }, { nombre: "Pedro", instrumento_principal: "Violín" }, and `presentes = [1, 2, 3]`
- WHEN `getAlumnosBySeccion("violines", alumnos, presentes)` is called
- THEN it SHALL return [Ana, Pedro].

### Requirement: Groq Item Expansion

`expandSeccionItems(items, alumnos, presentes)` DEBE recorrer items de Groq y para cada item con `seccion` definida y sin `alumnos` individuales, reemplazar `alumnos` con el resultado de `getAlumnosBySeccion`.

#### Scenario: Expand section to individual students

- GIVEN an item `{ contenido: "Danzón maderas", seccion: "maderas", alumnos: [] }`
- WHEN `expandSeccionItems` is called with a roster containing flauta, oboe, and clarinete students
- THEN `item.alumnos` SHALL contain the resolved student IDs.

### Requirement: Section Context Builder

`buildSeccionContext(alumnos, presentes)` DEBE generar un string legible para el prompt de Groq con el formato: `SECCIÓN: violines → [Ana, Pedro], maderas → [Luis, María]...`

#### Scenario: Build context with present students

- GIVEN alumnos with instrumentos mapped to sections
- WHEN `buildSeccionContext` is called
- THEN it SHALL return a string listing only sections that have present students.

## Acceptance Criteria

- [ ] SECCION_MAP contains all 13 sections with correct instrument mappings.
- [ ] `normalizarInstrumento` handles accents, case, and plural forms correctly.
- [ ] `getAlumnosBySeccion` filters correctly for section, tutti, general, individual.
- [ ] `expandSeccionItems` converts section-only Groq items to individual student items.
- [ ] `buildSeccionContext` generates correct prompt context string.
- [ ] Unknown sections return empty without errors.
