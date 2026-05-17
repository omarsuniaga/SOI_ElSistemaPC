# Archive Report: actualizacion-portales

**Archived**: 2026-05-16
**Change**: Portal Maestros — Professionalization, Notifications & Ruta Player
**SDD Cycle**: Complete (proposal → spec → design → tasks → apply → verify → archive)

---

## Executive Summary

Three workstreams that collectively make Portal Maestros production-ready: **(A)** Enterprise documentation quality audit and service wiring verification, **(B)** Notification system optimization (30s polling, Web Push UI, dedup exposure), **(C)** Ruta Player interactive classroom flow with semaphore refresh. Implemented as a single PR (~250 lines delta) with 22 tests passing.

## Artifacts Archived

| Artifact | File | Engram ID | Status |
|----------|------|-----------|--------|
| Proposal | `proposal.md` | #1519 | ✅ |
| Spec — Professionalization | `spec-professionalization.md` | #1520 | ✅ |
| Spec — Notifications | `spec-notifications.md` | #1521 | ✅ |
| Spec — Ruta Player | `spec-ruta-player.md` | #1522 | ✅ |
| Design | `design.md` | #1523 | ✅ |
| Tasks | `tasks.md` | #1524 | ✅ |
| Apply Progress | *(Engram only)* | #1525 | ✅ |
| Verify Report | *(Engram only)* | #1526 | ✅ |
| Archive Report | `archive-report.md` | *(current)* | ✅ |

## Delta Specs Synced

| Domain | Action | Spec Source | Location |
|--------|--------|-------------|----------|
| `enterprise-docs` | Created (NEW) | `spec-professionalization.md` | `openspec/specs/enterprise-docs/spec.md` |
| `notification-polling` | Created (MODIFIED) | `spec-notifications.md` | `openspec/specs/notification-polling/spec.md` |
| `ruta-player-view` | Created (MODIFIED) | `spec-ruta-player.md` | `openspec/specs/ruta-player-view/spec.md` |

Note: No pre-existing main specs existed. Delta specs were promoted to initial main specs.

## Delivery Summary

### Completed Workstreams

- **A: Professionalization** — Fixed ARCHITECTURE.md (Vue 3 → Vanilla JS), corrected DEVELOPER.md import paths, removed dead gdprService import, verified README cross-links to all 7 docs.
- **B: Notifications** — `POLL_INTERVAL_MS` 300000 → 30000, added `getDedupCount()` export with UI badge in notificacionesPanel, added test notification button + subscription status badge in perfilView.
- **C: Ruta Player** — Fixed router bug (case 'ruta' was calling `renderPlanificacionView` instead of `renderRutaPlayerView`), wired inline eval buttons (Logrado/En Proceso/No Logrado) with semaphore invalidation, added `getRutaTemaForAsistencia()` for topic handoff.

### Test Results

| Metric | Value |
|--------|-------|
| New tests written | 8 |
| Tests passing (our scope) | 22 (across 3 test files) |
| Test layers | Unit (notificationService), Integration (rutaPlayerView router + eval) |
| Pre-existing failures | 2 (configView.test.js), 1 (ErrorBoundary.test.js) — unrelated |

### Deviations from Design

- **NodeEvaluationCard**: Not used directly. Design assumed per-student evaluation, but the ruta player operates at class level. Replaced with lightweight inline eval buttons (Logrado/En Proceso/No Logrado) in the action panel — functionally equivalent, architecturally simpler.

## Verification Results

**Status**: PASS WITH WARNINGS

| Issue | Severity | Resolution |
|-------|----------|------------|
| Cross-references between sibling docs missing | Critical | ✅ Resolved (task 3.5 — audit confirmed all links resolve) |
| GDPR service gap not documented in SECURITY.md | Critical | ❌ **NOT resolved** — not in task scope. SECURITY.md lacks "Known Limitations" section for unwired gdprService. |
| Push toggle not grayed out on unsupported browsers | Warning | ⚠️ Not addressed — requires feature detection check in configView |

## Known Post-Archive Issues

1. **GDPR gap documentation** (critical): `SECURITY.md` does not document that `gdprService` is imported but not wired. Recommended follow-up: add a "Known Limitations" section to SECURITY.md or wire the service.
2. **Push toggle on unsupported browsers** (warning): The push toggle in perfilView doesn't gray out when Push API is unavailable. Feature detection (`'PushManager' in window`) should gate the toggle.

## Source of Truth Updated

The following main specs now reflect the new behavior:
- `openspec/specs/enterprise-docs/spec.md` — 3 requirements (DOC-01, DOC-02, DOC-03), 5 ACs
- `openspec/specs/notification-polling/spec.md` — 5 requirements (NOTIF-01 through NOTIF-05), 5 ACs
- `openspec/specs/ruta-player-view/spec.md` — 3 requirements (RUTA-01, RUTA-02, RUTA-03), 6 ACs

---

**SDD Cycle Complete** ✅
