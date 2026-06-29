# ACM / Portal Maestro — Separation Plan (V9)

## Objective

Separate planning responsibilities so the architecture matches the operating model:

- **Portal Maestro**: consume, execute, and report against the guide assigned to each class.
- **ACM**: concentrate, assign, supervise, and refine planning across all teachers.

## Current Problem

Today the `planificacion` module mixes:

- teacher-facing planning
- cross-teacher oversight
- curricular coverage
- route supervision

That makes the teacher portal carry institutional control surfaces that belong to ACM.

## Target Model

### Portal Maestro

Owns:

- `planificacion`
- `bitacora-clase`
- teacher-facing AI guidance
- focus by assigned class and assigned guide

Must answer:

- What should I teach next?
- What guide is assigned to this class?
- What evidence do I need to record?

### ACM

Owns:

- `planificacion-maestros`
- `planificacion-cobertura`
- `planificacion-ruta`
- `gestion-curricular`
- `planificacion-curricular`
- `torre-de-control`

Must answer:

- Which guide is assigned to each class/teacher?
- Which teachers are aligned or drifting?
- Which routes or curricular nodes need intervention?

## Implementation Phases

### Phase 1 — Navigation and responsibility split

- Remove ACM control surfaces from the teacher-oriented pedagogical group.
- Create a dedicated ACM navigation group for concentration and supervision.
- Keep route registration stable so no current screen breaks.

### Phase 2 — Data authority split

- Make ACM the source of truth for guide assignment by class.
- Make teacher planning resolve from assigned class + assigned guide.
- Prevent teacher flows from acting as if they define institutional guidance.

### Phase 3 — Teacher guidance rendering

- Show assigned guide explicitly inside teacher planning.
- Show why a class is prioritized.
- Show route objective, expected evidence, and next recommended action.

### Phase 4 — ACM control surfaces

- Add assignment matrix: class → teacher → guide/ruta/version.
- Add drift monitoring and exception handling.
- Add Hermes-readable summaries for what is assigned and what is happening.

## First Executed Slice

This slice implements the architectural separation at the navigation layer first:

- Teacher portal stays focused on execution surfaces.
- ACM receives concentration/supervision surfaces.

This is the correct first cut because it aligns user intent and system boundaries before deeper data refactors.

## Second Executed Slice

Teacher planning now reads the assigned guide context from the class itself:

- coverage rows include assigned `ruta_id` and `ruta_nombre`
- the teacher faro shows the assigned guide for the prioritized class
- the academic route view is framed explicitly as the guide assigned by ACM

This makes the teacher portal behave more like a consumer of ACM assignment instead of an origin of institutional planning.

## Third Executed Slice

ACM now has an explicit concentration surface for assignment authority:

- `planificacion-curricular` is now a dedicated ACM matrix
- it shows class → teacher → assigned route/guide → teacher planning status
- this is the first concrete surface where ACM acts as the institutional planning concentrator

This is a strong boundary move because teacher planning is no longer the only visible place where planning state exists.

## Fourth Executed Slice

ACM can now actively orchestrate assignment from the matrix itself:

- reassignment/correction of `ruta_id` happens directly from the ACM matrix
- ACM no longer only observes planning authority; it can change it
- the new ACM matrix was also aligned to the shared light/dark responsive standard
