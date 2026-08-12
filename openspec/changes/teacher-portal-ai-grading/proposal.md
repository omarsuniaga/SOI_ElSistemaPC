# Proposal: Teacher Portal — AI-Assisted Grading & Personal Route Maps

## Intent

Enable teachers to grade student performance by indicator using two ergonomic mechanisms: (1) star ratings (1–5) for present students, (2) free-text observations + AI pedagogical analysis (suggesting improvements, never auto-assigning grades). Introduce personal lesson-planning infrastructure (UNIDADES > OBJETIVOS > INDICADORES, distinct from institutional ACM catalog) to allow teachers to structure their own learning objectives per class, track student progress per indicator, and manage prerequisite chains and academic debt from absences.

**Problem:** Portal Maestros lacks structured per-indicator grading, route mapping, and prerequisite validation. IA analysis works at class level but not per-indicator. Absent students have no "recovery" workflow.

**Why now:** Foundation (IA services, attendance tracking, `evaluacion_indicador` table) is complete. Unblocked by recent ACM standardization (commit 1160209).

## Scope

### In Scope
- Personal **maestro_routes** (UNIDADES > OBJETIVOS > INDICADORES) with create/edit/clone/reuse workflows
- Specialized **IndicadorGradingModal**: stars for present students, "Con Deudas Académicas" for absent students
- Free-text observation input + "Analizar" button → IA pedagogical analysis (no auto-grading)
- **Prerequisite chains**: configurable soft enforcement (alerts but allows override); recovery triggers reevaluation of dependent indicators
- **Academic debt tracking**: absent students flagged; recovery sessions resolve debt and promote indicator checks
- **Visual check markers**: no check (untaught), single check (taught + some absent), double check (all present/recovered)
- Database migration: `maestro_routes`, `maestro_unidades`, `maestro_objetivos`, `maestro_indicadores`, `indicador_prerequisito`, `recovery_status` field on `evaluacion_indicador`
- Import ACM objectives as template (one-time, then free edit)

### Out of Scope (Phase 2+)
- Drag-and-drop visual route editor (Phase 2; start with form-based CRUD)
- Complex prerequisite DAG with AND/OR logic (Phase 1: linear chains only)
- IA-generated route suggestions from observations
- Bulk grading UI or template grades
- Circular prerequisite detection UI (caught at save-time with error only)
- Integration with external calendar sync or IEP systems

## Capabilities

### New Capabilities
- `teacher-route-builder`: Personal lesson-plan creation (UNIDADES > OBJETIVOS > INDICADORES) per class
- `indicator-grading`: Specialized modal for per-indicator grading with attendance awareness
- `prerequisite-validation`: DAG validation and soft enforcement of indicator dependencies
- `academic-debt-recovery`: Track and resolve absence-based deficits
- `ai-analysis-indicator`: IA pedagogical analysis for free-text per-indicator observations

### Modified Capabilities
- `class-analysis`: Existing IA service extended to accept indicator context (injected into prompt)
- `attendance-tracking`: Extended with `recovery_status` and recovery session linking

## Approach

1. **Route builder (form-based)**: React component with add/remove rows for UNIDADES/OBJETIVOS/INDICADORES; JSON persistence to `maestro_routes`
2. **Grading modal**: Query `attendance_records` to partition students (presentes vs. ausentes); show stars for presentes, recovery button for ausentes
3. **IA integration**: Reuse `analyzeObservation()` from groqService; pass indicator criteria and student names in context
4. **Prerequisite system**: In-memory DAG validator (JS); cache at session load; check before grading
5. **Recovery workflow**: "Registrar Recuperación" button → creates recovery session entry, updates `evaluacion_indicador.recovery_status`, triggers reevaluation of dependent indicators

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `supabase/migrations/` | New | maestro_routes, maestro_unidades, maestro_objetivos, maestro_indicadores, indicador_prerequisito tables |
| `evaluacion_indicador` table | Modified | Add recovery_status enum (pendiente, recuperado) |
| `src/portal-maestros/components/` | New | IndicadorGradingModal.js, TeacherRouteBuilder.js |
| `src/portal-maestros/views/hoyView.js` | Modified | Rename "Ver análisis" → "Analizar"; add route-map navigation |
| `src/portal-maestros/services/maestroDataService.js` | Modified | Add getTeacherRoutes, createTeacherRoute, getRoutePrerequisites |
| `src/portal-maestros/services/groqService.js` | Modified | Extend analyzeObservation to inject indicator context |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Route builder scope creep (drag/drop, rich editors) | High | Scope to form-based CRUD only; defer visual editor to Phase 2 |
| Prerequisite DAG performance (many indicators) | Medium | Cache DAG at session load; warn on cycle at save-time |
| Attendance state ambiguity (absent vs. recovered) | Medium | Use explicit recovery_status enum; clear UI labeling |
| IA prompt tuning (class-level → indicator-level) | Medium | Reuse existing analyzeObservation with indicator context; test with 5–10 real examples |
| Teacher confusion (personal route vs. ACM catalog) | Medium | Separate UI sections; clear headers; import workflow docs |

## Rollback Plan

1. Remove maestro_routes tables (drop in reverse migration order)
2. Revert IndicadorGradingModal to generic calificacionModal
3. Remove recovery_status field from evaluacion_indicador
4. Restore hoyView button label to "Ver análisis"
5. Disable route-map navigation in sidebar

## Dependencies

- Groq IA service (already working)
- attendance_records table (006 migration, complete)
- evaluacion_indicador table (20260730 migration, complete)
- React 19, TypeScript 5.x (existing stack)

## Success Criteria

- [ ] Teacher creates personal route (3+ unidades, 2+ objectives per unidad, 1+ indicators per objective)
- [ ] Teacher grades students by indicator via specialized modal (estrellas for present, deuda for absent)
- [ ] IA analyzes free-text observation without auto-assigning grades
- [ ] Prerequisite soft alert blocks OR allows override; recovery reevaluates dependent indicators
- [ ] Academic debt resolution updates student progress and check marks
- [ ] No data loss or corruption on rollback
- [ ] Performance: prerequisite DAG validation < 50ms for 50+ indicators
