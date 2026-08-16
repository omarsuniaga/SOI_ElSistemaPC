# Tasks: Racha visible para el alumno, en el momento de la clase

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 450–600 |
| 400-line budget risk | Low-Medium (un solo componente cohesivo + un wiring puntual, no hay dependencias entre partes) |
| Chained PRs recommended | No — cambio aditivo, autocontenido, sin migraciones |
| Delivery strategy | single-pr |

**Decision needed before apply**: No.

---

## Phase 1: Componente `RachaRevealOverlay.js`

- [ ] 1.1 Crear `src/portal-maestros/components/RachaRevealOverlay.js`: overlay a pantalla completa (mismo patrón `position:fixed`/promesa que `InsigniaCelebrationOverlay.js`), export default `showRachaRevealOverlay({ alumnoNombre, rachaActual })`.
- [ ] 1.2 Función `_mensajeParaRacha(rachaActual)` con los 4 tiers definidos en design.md (sin fila / 1 / 2–4 / 5+), siempre positivo, nunca menciona una racha anterior más alta.
- [ ] 1.3 Animación de conteo ascendente del número con `gsap` (de 0 al valor real, ~0.8s) — reutilizar el mismo import estático de `gsap` que ya usa `IndicadorGradingModal.js`.
- [ ] 1.4 Botón de cierre que resuelve la promesa y remueve el overlay del DOM (mismo patrón que `AchievementsSummaryModal`/`InsigniaCelebrationOverlay`).
- [ ] 1.5 Tests `RachaRevealOverlay.test.js`: un test por tier de mensaje, test de que NUNCA aparece vocabulario de pérdida ("perdiste", "rota", "se rompió") en ningún tier, test de que solo se renderiza el alumno pasado como parámetro (nunca otro), test de cierre/resolución de promesa.

---

## Phase 2: Wiring en `IndicadorGradingModal.js`

- [ ] 2.1 Agregar botón "Mostrar racha" (ícono + texto corto) en `_renderPresente(alumnoId)`, junto a la fila de estrellas — con `data-alumno-id`.
- [ ] 2.2 Handler del botón: lee `achievementsBaseline.get(alumnoId)?.rachaActual ?? null`, importa y llama `showRachaRevealOverlay({ alumnoNombre: alumnosMap[alumnoId]?.nombre, rachaActual })`.
- [ ] 2.3 Confirmar explícitamente que NINGÚN call-site existente (`saveIndicadorNota` individual, grupal, `updateRecoveryStatus`) invoca `showRachaRevealOverlay` — el único disparo es el botón de 2.2 (Spec R-02).
- [ ] 2.4 Test `IndicadorGradingModal.rachaReveal.test.js`: el botón existe por cada alumno presente, el click invoca `showRachaRevealOverlay` con el valor correcto del snapshot, y verificar que guardar una nota (individual/grupal/recuperación) NO invoca `showRachaRevealOverlay` por sí solo.

---

## Phase 3: No-regresión y cierre

- [ ] 3.1 Correr `AchievementsSummaryModal.test.js` e `IndicadorGradingModal.gsap.test.js` sin modificarlos — deben seguir pasando exactamente igual (Spec R-05).
- [ ] 3.2 `npm run build` + `eslint` sobre los archivos tocados.
- [ ] 3.3 Suite completa del repo (`npx vitest run`) antes de abrir el PR — mismo estándar que los PRs de `juego-gamificado-planificacion` (evitar el susto de CI de PR2, donde un test fuera de `src/` no se detectó corriendo solo la carpeta tocada).

---

## Notes on Dependency Order

Fase 1 (el componente) no depende de nada y se puede probar de forma completamente aislada. Fase 2 (wiring) depende de que 1.1–1.4 existan. Fase 3 es verificación final, sin tareas de código nuevas.

Sin dependencias hacia otros cambios — se puede aplicar y mergear en cualquier momento.
