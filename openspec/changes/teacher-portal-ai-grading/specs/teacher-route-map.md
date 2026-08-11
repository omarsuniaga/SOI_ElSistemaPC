# Spec: teacher-route-map

Personal lesson-plan creation and management (UNIDADES > OBJETIVOS > INDICADORES) per class, with create/edit/clone/reuse workflows and one-time ACM template import.

## ADDED Requirements

### R1.1: Create Personal Route from Scratch
- Teacher navigates to class and initiates "Nueva Ruta" flow
- Form allows:
  - Route name (e.g., "Matemáticas Unidad 1 - 2026")
  - Add/remove UNIDADES (rows: name, description, optional order)
  - For each UNIDAD: add/remove OBJETIVOS (name, description, optional order)
  - For each OBJETIVO: add/remove INDICADORES (name, description, weight/points optional)
- Route persists to `maestro_routes`, `maestro_unidades`, `maestro_objetivos`, `maestro_indicadores` tables (Supabase)
- Route is immediately usable for grading (linked to class)

**Acceptance Criteria:**
- Teacher creates route with 2+ unidades, 2+ objectives per unidad, 1+ indicators per objective
- Data persists correctly across page reload
- Route appears in route list for that class only (not visible for other classes)

---

### R1.2: Edit Existing Route
- Teacher opens route in edit mode
- Can rename UNIDADES, OBJETIVOS, INDICADORES (all levels)
- Can add/remove UNIDADES, OBJETIVOS, INDICADORES
- Cannot delete a UNIDAD/OBJETIVO/INDICADOR that has evaluation records (soft constraint: show warning, allow override with confirmation)
- Changes persist immediately or via explicit save (TBD in design)

**Acceptance Criteria:**
- Edit form loads current route structure without data loss
- Rename is reflected in route list and grading modal within same session
- Deletion warning appears when attempting to remove evaluated items

---

### R1.3: Clone Existing Route
- Teacher opens route and selects "Clonar"
- Dialog asks for new route name and target class (optional; defaults to same class if user wants reuse)
- Creates copy of entire UNIDADES > OBJETIVOS > INDICADORES hierarchy
- Clone has no evaluation records (fresh start)
- Clone is immediately editable

**Acceptance Criteria:**
- Clone creates a new independent route with same structure but no grade data
- Cloned route name is distinct from original (e.g., appends "Copia" or allows custom name)
- Original route unaffected

---

### R1.4: Import ACM Template (One-Time)
- Route-creation form includes "Importar desde Catálogo Institucional" button
- Button opens modal showing ACM hierarchy (NIVEL > OBJETIVO GENERAL > OBJETIVO ESPECÍFICO)
- Teacher selects NIVEL(s) and clicks "Importar como Plantilla"
- System maps:
  - NIVEL → UNIDAD (in maestro_routes)
  - OBJETIVO GENERAL → OBJETIVO (in maestro_objetivos)
  - OBJETIVO ESPECÍFICO → INDICADOR (in maestro_indicadores)
- **Critical:** After import, route is fully owned by teacher and free-form editable; no live link to ACM
- Teacher can rename, add, remove, or restructure freely

**Acceptance Criteria:**
- ACM import preserves NIVEL > OBJETIVO GENERAL > OBJETIVO ESPECÍFICO hierarchy
- After import, teacher can edit route without ACM sync constraints
- Multiple imports by same teacher create separate routes (no merge)

---

## MODIFIED Requirements

None (new feature).

---

## Open Questions / Design Decisions Needed

1. **Edit vs. Create Flow:** Should create and edit use the same form component or separate ones?
2. **Reordering:** Should indicators have explicit order/priority fields, or is insertion order sufficient?
3. **Route Versioning:** Should teacher be able to create versions of a route, or always edit in-place?
4. **Deletion Cascade:** When deleting an UNIDAD, what happens to its OBJETIVOS/INDICADORES? Cascade delete or prevent?
5. **ACM Mapping Details:** Which ACM fields (description, codes, competencies) map to UNIDAD/OBJETIVO/INDICADOR? Defaults only, or selective?

---

## Scenario: Create and Clone Route

**Given** a teacher is logged in and viewing class "7A-Matemáticas"

**When** teacher clicks "Nueva Ruta"
  - Form opens with empty UNIDADES section

**And** teacher adds:
  - UNIDAD: "Algebra" > OBJETIVO: "Factorización" > INDICADOR: "Resuelve trinomios cuadrados"
  - UNIDAD: "Algebra" > OBJETIVO: "Factorización" > INDICADOR: "Grafica funciones cuadráticas"

**And** teacher clicks "Guardar"

**Then** route "Algebra 2026 - 7A" persists to database
  - Route is visible in route list for class 7A
  - Route is ready for grading (appears in indicator selector in hoyView)

**When** teacher opens route and clicks "Clonar" → "Clonar para 7B-Matemáticas"

**Then** new route "Algebra 2026 - 7B Copia" is created
  - Identical hierarchy copied (2 UNIDADES, 2 OBJETIVOS, 2 INDICADORES)
  - No evaluation records in clone
  - Original route in 7A unaffected

---

## Scenario: Import and Edit ACM Template

**Given** teacher is creating new route for class "10A-Lengua"

**When** teacher clicks "Importar desde Catálogo Institucional"

**And** ACM modal displays NIVEL "Comprensión Lectora" with 3 OBJETIVO GENERALES

**And** teacher selects all 3 OBJETIVO GENERALES and clicks "Importar"

**Then** new route is populated with:
  - 1 UNIDAD: "Comprensión Lectora"
  - 3 OBJETIVOS (mapped from OBJETIVO GENERALES)
  - N INDICADORES (mapped from OBJETIVO ESPECÍFICOS)

**When** teacher then edits route to rename an INDICADOR to "Lee textos narrativos con 90% comprensión"

**Then** change persists
  - No sync back to ACM catalog
  - Teacher can freely restructure route

---

## Success Criteria (from Proposal)

- Teacher creates personal route (3+ unidades, 2+ objectives per unidad, 1+ indicators per objective) ✓
- Import ACM objectives as template (one-time, then free edit) ✓
