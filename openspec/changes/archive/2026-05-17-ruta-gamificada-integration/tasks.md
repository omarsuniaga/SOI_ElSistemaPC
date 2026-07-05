# Tasks: Integración de Ruta Gamificada

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 150 - 250 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | exception-ok |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Wiring & Handoff | PR 1 | Main router and sessionStorage logic |
| 2 | Component Polish | PR 1 | Tree rendering and cleanup |

## Phase 1: Infrastructure & Wiring

- [x] 1.1 Update `src/main-maestros.js`: Replace `renderRutaPlayerView` import with `renderRutaGameificadaView`.
- [x] 1.2 Update `src/main-maestros.js`: Change route case 'ruta' to call `renderRutaGameificadaView`.
- [x] 1.3 Verify `src/portal-maestros/services/rutaTopicStore.js` behavior with a unit test.

## Phase 2: View Implementation (Ruta Gamificada)

- [ ] 2.1 Implement `_renderFull` in `rutaGameificadaView.js` to render blocks using `renderBlockSection`.
- [ ] 2.2 Implement level rendering with progress bars and lock icons.
- [ ] 2.3 Implement node and indicator rendering with semaphore dots.
- [ ] 2.4 Add sticky action panel for indicator selection and "Usar como tema" button.
- [ ] 2.5 Implement handoff action: `setRutaTema(tema)` + `router.navigate('asistencia')`.

## Phase 3: Asistencia Integration

- [ ] 3.1 Ensure `asistenciaView.js` banner has a working "Cancelar" button that clears `sessionStorage`.
- [ ] 3.2 Add a unit test in `src/portal-maestros/views/__tests__/asistenciaViewTopic.test.js` for handoff consumption.

## Phase 4: Cleanup & Verification

- [ ] 4.1 Delete `src/portal-maestros/views/rutaPlayerView.js`.
- [ ] 4.2 Run all tests and verify no dead references remain.
- [ ] 4.3 Manual check: Switch classes in Ruta view and verify tree refreshes.
