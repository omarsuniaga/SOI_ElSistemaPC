# Proposal: Curriculo Tres Planos (Capa de Servicios)

## Intent
Eliminar las consultas a tablas inexistentes `acm_*` en `weeklyPlanSupabase.js`, derivando la guía y el progreso estudiantil desde la jerarquía real de la base de datos (`route_versions` e `indicator_attempts`) para habilitar la planificación en producción.

---

## Scope

### In Scope
- **Refactor `weeklyPlanSupabase.js`**: Redirigir consultas de tablas fantasma (`acm_active_routes`, `acm_weekly_plans`, `student_indicator_progress`) hacia el spine real (`route_versions` e `indicator_attempts`).
- **Resolución de Maestro**: Implementar helper de sesión para deducir `created_by` (maestro) en la inserción de calificaciones.
- **Validación del DataAdapter**: Sincronizar los mocks correspondientes en `weeklyPlanMock.js` para mantener paridad en el Modo Demo.

### Out Scope
- UI del ACM y del Maestro (revisión de propuestas, carga de PDFs).
- Mejoras del parser de IA (`planningParserService.js`).
- Migración de datos históricos de planificaciones `jsonb`.

---

## Approach
Implementar el patrón Adapter/Facade sobre `weeklyPlanSupabase.js`. Las firmas y contratos de las funciones de UI permanecen intactos, pero resuelven sus consultas sobre `route_versions` (estado `published`) e `indicator_attempts` (avances y notas reales) aplicando filtros de scoping por clase (`clase_id`).

---

## Affected Areas

| Area | Impact | Description |
| :--- | :--- | :--- |
| `weeklyPlanSupabase.js` | Modified | Reemplazar consultas de tablas `acm_*` por canónicas. |
| `weeklyPlanMock.js` | Modified | Sincronizar paridad de datos y simulación. |

---

## Risks

| Risk | Likelihood | Mitigation |
| :--- | :--- | :--- |
| Falta de ID de maestro en calificación | High | Resolver UUID mediante helper de sesión `supabase.auth.getUser()` + `maestros.id`. |
| Conflictos de upsert en progreso | Medium | Aplicar `onConflict: 'session_id,indicator_id,student_id'`. |

---

## Rollback Plan
`git revert` de la refactorización de servicios de datos. Al ser un cambio de lectura, no altera esquemas ni arriesga la base de datos.

---

## Success Criteria
- [ ] La planificación del maestro carga en producción usando la ruta publicada.
- [ ] Las calificaciones se persisten directamente en `indicator_attempts` con autoría correcta.
- [ ] Vitest corre en verde al 100% de éxito.
