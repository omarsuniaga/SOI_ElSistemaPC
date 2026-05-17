# Design: Actualización Portales — Portal Maestros

## Technical Approach

Three independent workstreams that refine existing code rather than build from scratch. The codebase audit revealed **the proposal overestimates what's missing** — all 6 enterprise docs exist already, the push/notification UI is mostly wired, and the Ruta player has lazy-load and NodeEvaluationCard already. This design reframes the work as **audit + correct + wire** rather than create.

## Architecture Decisions

### Decision: Workstream A reframed as doc quality audit

**Choice**: Audit existing docs at `src/portal-maestros/docs/` for factual accuracy vs. enterprise-service wiring audit.
**Alternatives considered**: Creating docs from scratch (as proposed).
**Rationale**: All 6 docs exist with substantive content. The gap is correctness: `ARCHITECTURE.md` claims Vue 3 (actual is Vanilla JS), `main-maestros.js` imports `initAnalytics` but the export is `setAnalyticsConsent`, and `gdprService` is imported but unused. Fixing these inaccuracies is higher value than rewriting docs.
**Evidence**: 7 files verified at `src/portal-maestros/docs/` — ARCHITECTURE.md, DEVELOPER.md, API_REFERENCE.md, DEPLOYMENT.md, SECURITY.md, USER_GUIDE.md, COMPLIANCE.md.

### Decision: Notifications — minimal delta on existing infra

**Choice**: Change `POLL_INTERVAL_MS` constant, wire dedup badge into `notificacionesPanel`, add "Test Notification" to `perfilView` sidebar.
**Alternatives considered**: Rewriting polling or dedup logic.
**Rationale**: `notifConfigModal.js` already has push toggle, test button, and preferences. `notificationService.js` already has dedup keys. The only delta is: (a) 30s polling constant, (b) exposing dedup count to the panel UI, (c) a test-notification shortcut from the perfil page (which already has a toggle but no test button in its main view).
**Evidence**: `perfilView.js` renders push toggle + "Configurar preferencias..." button linking to `notifConfigModal`. `notifConfigModal` already includes the test button. The main perfil view lacks a direct test button.

### Decision: Ruta Player — fix route wiring + integrate NodeEvaluationCard

**Choice**: Fix the `ruta` route bug (calls `renderPlanificacionView` instead of `renderRutaPlayerView`), wire `NodeEvaluationCard` into the node detail flow, add semaphore refresh after evaluation.
**Alternatives considered**: Rewriting the player from scratch.
**Rationale**: The route tree, lazy-load, and `NodeEvaluationCard` component all exist. The bug at `main-maestros.js:736` (`case 'ruta': renderPlanificacionView(...)`) means the Ruta Player is never shown via the tab. The primary work is fixing this, then adding the evaluation card to the node detail panel and triggering semaphore cache invalidation.
**Evidence**: `NodeEvaluationCard.js` exists and uses `academicService.saveIndicatorAttempt()`. The rutaService has `invalidateSemaphoresForClase()` already. `rutaTopicStore.js` handles session handoff via sessionStorage.

## Data Flow

```
[B] Notification Polling Flow (existing + delta)

  setInterval(30s) ──→ fetchNotificaciones()
                            │
                            ├─→ _loadCachedNotifs() ──→ localStorage
                            │
                            ├─→ supabase SELECT ... limit(30)
                            │       │
                            │       └─→ _isDuplicateNotification() ← new: expose count to UI
                            │
                            └─→ _checkLocalAlerts()
                            │       │
                            │       └─→ getMisClases() / getSesiones()
                            │
                            └─→ notifyListeners() ──→ notificacionesPanel.renderList()

[C] Ruta Player Evaluation Flow (new wiring)

  renderRutaPlayerView(container)     ← FIX: was renderPlanificacionView
       │
       ├─→ renderBlocks() ──→ toggle-node → loadIndicatorsForNode()
       │
       ├─→ select-indicator → show NodeEvaluationCard
       │       │
       │       └─→ academicService.saveIndicatorAttempt(sessionId, indicatorId, studentId)
       │               │
       │               └─→ invalidateSemaphoresForClase(claseId)   ← refresh semaphore
       │
       └─→ usar-tema-hoy → setRutaTema() → router.navigate(#/asistencia)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| **A — Professionalization Docs** | | |
| `src/portal-maestros/docs/ARCHITECTURE.md` | Modify | Fix "Vue 3" → Vanilla JS; correct service paths |
| `src/portal-maestros/docs/DEVELOPER.md` | Modify | Verify all import paths match actual exports |
| `src/main-maestros.js` (lines 36, 39) | Modify | Fix `initAnalytics` → `setAnalyticsConsent`; remove unused gdpr import or wire it |
| `src/portal-maestros/services/analyticsService.js` | Modify | Add `initAnalytics` as named export for backward compat, or fix the import |
| **B — Notification System** | | |
| `src/portal-maestros/services/notificationService.js` | Modify | `POLL_INTERVAL_MS = 30000`; export `getDedupCount()` for UI badge |
| `src/portal-maestros/components/notificacionesPanel.js` | Modify | Show dedup count badge in panel header; expose "Enviar prueba" button |
| `src/portal-maestros/views/perfilView.js` | Modify | Add "Test Notification" button in notifications section |
| **C — Ruta Player** | | |
| `src/main-maestros.js` (line 736) | Modify | `case 'ruta':` → `renderRutaPlayerView` |
| `src/portal-maestros/views/rutaPlayerView.js` | Modify | Integrate `NodeEvaluationCard` into select-indicator flow; add "asignar a clase" via `rutaTopicStore`; call `invalidateSemaphoresForClase()` after eval save |
| `src/portal-maestros/services/rutaService.js` | Modify | Ensure `invalidateSemaphoresForClase` is importable and batch-reset works with new flows |
| `src/portal-maestros/services/rutaTopicStore.js` | Modify | Add `getRutaTemaForAsistencia()` that builds query params for `asistenciaView` |

## Interfaces / Contracts

```js
// notificationService.js — new exports
export const POLL_INTERVAL_MS = 30000  // was 300000
export function getDedupCount()        // returns number of deduped notifications in current window

// rutaTopicStore.js — new method
export function getRutaTemaForAsistencia()  // returns { indicatorId, nombre } or null, and clears

// rutaPlayerView.js — internal state additions
_state.evaluacionActiva: { sesionId, nodoId, indicadorId, claseId }
_state.evaluando: boolean
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `POLL_INTERVAL_MS = 30000` | Update `notificationService.test.js` assertion |
| Unit | `getDedupCount()` during dedup window | Add test with 3 mock notifications, 2 deduped |
| Integration | Ruta route renders player view | Verify hash navigation triggers correct render function |
| Integration | NodeEvaluationCard save → semaphore invalidate | Mock `academicService.saveIndicatorAttempt`, verify `invalidateSemaphoresForClase()` called |
| E2E | Notification panel shows dedup badge | Manual: trigger 2 similar notifications, verify badge count |

## Migration / Rollout

No migration required. All changes are additive or constant changes. The `POLL_INTERVAL_MS` change is the only operational concern — see rollback plan in proposal (keep old value as `POLL_INTERVAL_MS_FALLBACK`).

## Open Questions

- [ ] `initAnalytics` import in `main-maestros.js:36` — should we add the export to analyticsService or fix the import to use the existing `setAnalyticsConsent`?
- [ ] `gdprService` is imported but `exportUserData` is never called in the visible code path — is there a deferred integration hook, or should we remove it?
- [ ] NodeEvaluationCard uses `academicService` from `../../modules/academic-routes/services/academicService.js` — verify this module exists and the save path is correct for the ruta context
