# Proposal: Actualización Portales — Portal Maestros

## Intent

Portal Maestros is functionally complete but has three critical gaps that block enterprise rollout: **(1)** back-end enterprise services (error tracking, analytics, GDPR) exist but are undocumented, **(2)** notification polling is slow (5 min), Push UI missing, and dedup logic exists but isn't wired into the UI, **(3)** the gamified Ruta Player view shows the route tree but lacks the full interactive classroom flow. This change closes all three gaps to make Portal Maestros production-ready.

## Scope

### In Scope
- **Professionalization (docs)**: Create 6 enterprise docs — USER_GUIDE.md, DEVELOPER.md, API_REFERENCE.md, DEPLOYMENT.md, ARCHITECTURE.md, SECURITY.md — and verify service wiring (errorReporter, analyticsService, gdpr/compliance, rateLimit, CSRF, Web Vitals).
- **Notification System**: Reduce polling from 5 min → 30 sec; add Web Push subscription toggle in settings (configView.js); wire dedup into notification panel UI; add "Test Notification" button.
- **Ruta Player**: Complete gamified route view — node detail panel, "asignar a clase" flow via rutaTopicStore, semaphore refresh after evaluation, lazy-load for large routes.

### Out of Scope
- Backend push sending (server-side) — requires separate infra change.
- Multi-portal sync (Portal Padres/Estudiantes) — deferred.
- Dark mode refinements or PWA install prompt changes.
- AI/groq service changes — not related to these three pillars.

## Capabilities

### New Capabilities
- `enterprise-docs`: 6 operational docs covering deployment, security, API, architecture, dev setup, and user guide.
- `web-push-settings`: UI panel for Push subscription management with live status.

### Modified Capabilities
- `notification-polling`: polling interval changes from 5 min → 30 sec; dedup becomes user-visible (no more duplicates in notification panel).
- `ruta-player-view`: from route-tree-only to full interactive classroom assignment flow with semaphore refresh.

## Approach

| Workstream | Approach |
|---|---|
| **A. Professionalization** | Audit 6 existing enterprise services for correct wiring to main-maestros.js entry point. Write docs as `src/portal-maestros/docs/*.md`. No code changes beyond minor import fixes if wiring is broken. |
| **B. Notifications** | Change `POLL_INTERVAL_MS` constant; add subscription section to configView.js using pushService.getSubscriptionStatus(); expose dedup toggle in notification panel (notificacionesPanel.js). |
| **C. Ruta Player** | Wire rutaTopicStore into rutaPlayerView.js for class session injection; add NodeEvaluationCard for per-node student progress; implement lazy-load for levels >160 nodes. |

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `src/portal-maestros/docs/*.md` | New | 6 enterprise documentation files |
| `src/portal-maestros/services/notificationService.js` | Modified | POLL_INTERVAL_MS → 30s; dedup wire |
| `src/portal-maestros/services/pushService.js` | Modified | getSubscriptionStatus() expose |
| `src/portal-maestros/views/configView.js` | Modified | Web Push subscription panel |
| `src/portal-maestros/components/notificacionesPanel.js` | Modified | Dedup display + test button |
| `src/portal-maestros/views/rutaPlayerView.js` | Modified | Full interactive flow |
| `src/portal-maestros/services/rutaTopicStore.js` | Modified | Session handoff integration |
| `src/portal-maestros/components/NodeEvaluationCard.js` | Modified | Per-node student progress |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Polling at 30s increases battery/bandwidth usage | Low | Add configurable interval with server-side override |
| Push subscription UI confuses users without backend push | Medium | Gray out toggle + label "requiere configuración del servidor" |
| Ruta tree re-render perf with 643 indicators | Low | Implement lazy-load pagination in rutaService |

## Rollback Plan

1. **Git revert**: `git revert HEAD` on each workunit commit if deployed individually.
2. **Polling**: Keep old `POLL_INTERVAL_MS` constant as `POLL_INTERVAL_MS_FALLBACK`; a one-line config change restores 5 min.
3. **Docs**: Pure additive — delete files if unwanted.

## Dependencies

```
A (Professionalization) ────── no deps, parallel
B (Notification System) ────── no deps, parallel
C (Ruta Player) ────────────── no deps, parallel
```

All three workstreams are independent. Order of execution is interchangeable.

## Success Criteria

- [ ] 6 enterprise docs exist at `src/portal-maestros/docs/` covering all required topics
- [ ] `POLL_INTERVAL_MS = 30000` and verified in notificationService.test.js
- [ ] Push subscription toggle renders in configView and calls pushService correctly
- [ ] Ruta Player: teacher can browse nodes, see semaphore, assign to class, and see result in asistenciaView
- [ ] All existing tests pass (`npm run test:run`)
