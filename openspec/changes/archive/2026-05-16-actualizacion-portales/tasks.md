# Tasks: Actualización Portales — Portal Maestros

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~200-250 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | exception-ok |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

## Phase 1: Foundation — Service-Layer Changes

- [x] 1.1 **notificationService.js** — `POLL_INTERVAL_MS = 30000`; export `getDedupCount()` for UI badge
- [x] 1.2 **rutaTopicStore.js** — Add `getRutaTemaForAsistencia()` with query-param builder for DSL handoff
- [x] 1.3 **main-maestros.js:735** — Fix `case 'ruta'`: call `renderRutaPlayerView` not `renderPlanificacionView`
- [x] 1.4 **gdprService** — Remove unused `exportUserData` import from main-maestros.js:39 (dead code, never called)

## Phase 2: Core — UI & Docs Corrections

- [x] 2.1 **perfilView.js** — Add "🔔 Probar notificación" test-notification button in notifications section
- [x] 2.2 **notificacionesPanel.js** — Show dedup count badge in panel header; wire `getDedupCount()`
- [x] 2.3 **rutaPlayerView.js** — Wire `NodeEvaluationCard` into indicator-select flow; call `invalidateSemaphoresForClase()` after eval save; integrate `rutaTopicStore` for topic handoff
- [x] 2.4 **ARCHITECTURE.md** — Fix "Vue 3" → "Vanilla JS"; correct service paths to match actual exports
- [x] 2.5 **DEVELOPER.md** — Verify/correct import paths vs actual service exports
- [x] 2.6 **README.md** — Add feature matrix + cross-links to all 7 docs

## Phase 3: Testing — Verificación

- [x] 3.1 **notificationService.test.js** — Assert `POLL_INTERVAL_MS = 30000` (NOTIF-04 AC-01)
- [x] 3.2 **notificationService.test.js** — Test `getDedupCount()`: 3 mock, 2 deduped in window (NOTIF-05 AC-03)
- [x] 3.3 **Router integration** — Verify `#/ruta` hash triggers `renderRutaPlayerView` not `renderPlanificacionView` (RUTA-01 AC-01)
- [x] 3.4 **Eval→semaphore integration** — Mock `saveIndicatorAttempt`, verify `invalidateSemaphoresForClase()` called (RUTA-02 AC-05)
- [x] 3.5 **Doc cross-ref audit** — Internal links resolve across 7 docs; README references all 7 (DOC-01/03 AC-02/05)
