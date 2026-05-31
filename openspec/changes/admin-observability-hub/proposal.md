# Proposal: Admin Observability Hub

## Intent

The existing `analytics-observability-hub` (archived) built the 5-tab structure, DataAdapter layer, widgets, and IA flow. This change **hardens, completes, and admin-enables** that foundation. We need CSP compliance, proper admin-auth gating, elimination of direct Supabase calls from views (Mock First discipline), richer mock data, and full Vitest coverage for all 5 tabs.

## Scope

### In Scope
- CSP compliance: refactor inline `style=""` and `innerHTML` patterns to CSS classes + safe DOM APIs
- Admin auth gate: observability hub only renders for `admin` role; redirect non-admin to login
- DataAdapter enforcement: remove direct `supabase` import from `iaReporteGeneradorView.js` (uses `metricasApi.js` instead)
- Expanded mock data: richer datasets for audit trail (20+ entries), logs, operaciones, and resumen KPIs
- Full Vitest coverage: view rendering tests for each tab (resumen, operaciones, logs, auditoría, IA) + widget lifecycle tests
- Widget destruction guarantee: IA tab returns a destroyable instance matching the pattern from Logs/Auditoría tabs
- Admin portal nav integration: register observability hub as a first-class admin route alongside dashboard/aprobacion

### Out of Scope
- New tabs or features beyond the existing 5
- Backend Supabase view changes (only frontend/mock work)
- Real-time WebSocket log streaming (uses polling/pull as today)
- i18n / multi-language support

## Capabilities

### New Capabilities
- `admin-observability-hub`: Centralized admin observability dashboard with 5 tabs, CSP-compliant rendering, admin-auth gating, and full DataAdapter compliance

### Modified Capabilities
- `institutional-analytics-hub`: Enhanced to enforce CSP-safe DOM patterns, admin-only access, and complete widget lifecycle management (destroy patterns across all 5 tabs)

## Approach

1. **CSP Pass**: Scan all view/widget files for `style="..."` attributes and `innerHTML` assignments. Replace with `classList.add()` / `classList.remove()` + CSS class definitions. Use `document.createElement()` + `textContent` for safe text injection instead of template strings with user data.
2. **Admin Gate**: Check `user.rol === 'admin'` before rendering the hub route. Show 403 fallback for non-admin users.
3. **DataAdapter Fix**: Replace direct `supabase` import in `iaReporteGeneradorView.js` with calls through `metricasApi.js` (already uses `config.isDemoMode`).
4. **Mock Data**: Expand `observabilidadMock.js` with 20+ audit entries, diverse log levels, and realistic operaciones data. Add new mock JSON files as needed.
5. **Tests**: Add Vitest tests for each tab's render output, widget init/destroy lifecycle, filter behavior, and CSP compliance (no inline styles emitted).
6. **IA Widget Lifecycle**: Refactor IA tab to return a widget object with `init()` and `destroy()` methods, matching the pattern used by `systemLogsWidget` and `auditTrailWidget`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/modules/metricas/views/dashboardMetricasView.js` | Modified | CSP-safe templates, admin gate check, use API layer for IA data |
| `src/modules/metricas/views/systemLogsWidget.js` | Modified | Inline styles → CSS classes |
| `src/modules/metricas/views/auditTrailWidget.js` | Modified | Inline styles → CSS classes |
| `src/modules/metricas/views/iaReporteGeneradorView.js` | Modified | Remove direct supabase import, add destroy() method |
| `src/modules/metricas/api/observabilidadMock.js` | Modified | Expand mock datasets (20+ entries) |
| `src/modules/metricas/api/metricasApi.js` | Modified | Add exports for IA payload DSL data (if missing) |
| `src/modules/metricas/metricas.router.js` | Modified | Admin role gate before registration |
| `src/modules/metricas/__tests__/observabilidad.test.js` | Modified | Expand to cover view rendering + lifecycle |
| `src/modules/metricas/__tests__/dashboardView.test.js` | New | Resumen/Operaciones tab render tests |
| `src/modules/metricas/__tests__/iaReporte.test.js` | New | IA tab widget lifecycle + DSL compilation tests |
| `src/modules/admin-dashboard/` | Modified | Register observability hub route in admin nav |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| CSP refactor breaks existing UI styling | Medium | Visual regression check with screenshots before/after each tab |
| Mock data expansion inflates bundle | Low | Mocks are dev-only; tree-shaken in production builds |
| IA tab refactor (remove supabase) breaks report generation | Medium | Keep `compilePayloadDSL` fallback logic intact; full test coverage |

## Rollback Plan

Restore the 4 modified view files from git HEAD and revert router changes. The existing `analytics-observability-hub` archive guarantees the current state is stable and documented.

## Dependencies

- Existing `analytics-observability-hub` archive (verified: implemented)
- Vitest test runner (already configured)
- `config.isDemoMode` flag (already operational)

## Success Criteria

- [ ] No inline `style="..."` attributes in any view/widget HTML output (verified by grep + tests)
- [ ] All 5 tabs render in admin portal; non-admin users see 403 fallback
- [ ] `iaReporteGeneradorView` has zero direct `supabase` imports (uses API layer only)
- [ ] Mock audit trail has 20+ entries covering all action types (CREACION, APROBACION_FINAL, RECHAZO)
- [ ] Every tab widget exposes `init()` and `destroy()` methods; lifecycle tests pass
- [ ] `npm run test:run` passes with 100+ tests (existing + new)
- [ ] Admin nav includes "Observabilidad" link at the same level as "Dashboard" and "Aprobaciones"
