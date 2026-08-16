# Design: racha-visible-en-clase

## Technical Approach

Un único componente nuevo, `RachaRevealOverlay.js`, modelado sobre el patrón ya establecido por `InsigniaCelebrationOverlay.js` (PR3 de `juego-gamificado-planificacion`): overlay `position: fixed` a pantalla completa, se monta en `document.body`, devuelve una `Promise` que resuelve al cerrarse. A diferencia de ese componente, NO usa Rive — no hace falta un runtime de animación complejo para mostrar un número grande; alcanza con `gsap` (ya instalado, PR3) para un conteo ascendente del número de racha, que es un efecto simple y ya conocido en este código base.

Se agrega un botón "Mostrar racha" por cada fila de alumno presente en `IndicadorGradingModal.js`, que lee el valor de racha directamente del `achievementsBaseline` Map ya existente (poblado por `_snapshotAchievements` en la carga del modal, y actualizado por `_computeAchievementsUpdate` tras cada guardado — ver PR2) — cero consultas nuevas a Supabase.

## Architecture Decisions

### Decision: Disparo manual (botón), nunca automático

**Choice**: El overlay se abre solo cuando el maestro toca el botón "Mostrar racha" de un alumno específico — nunca se dispara solo tras guardar una nota.

**Rationale**: `AchievementsSummaryModal.js` ya es automático (se abre tras detectar una novedad) y eso funciona bien para un resumen administrativo rápido. Pero "girar la pantalla para mostrarle al alumno" es un gesto físico deliberado del maestro — automatizarlo interrumpiría el flujo de calificar a varios alumnos seguidos con una pantalla completa no solicitada cada vez que sube una racha. El botón le da al maestro control total sobre CUÁNDO mostrarlo (Spec R-02).

### Decision: Leer racha del snapshot en memoria, no una consulta nueva

**Choice**: El botón usa `achievementsBaseline.get(alumnoId)?.rachaActual`, la misma estructura que ya mantiene `IndicadorGradingModal.js` desde PR2 para detectar logros/racha nuevos.

**Rationale**: Evita una consulta a `rachas` por cada click del botón. El snapshot ya se actualiza automáticamente tras cada guardado (`_computeAchievementsUpdate` lo refresca), así que el valor que ve el botón siempre está al día sin trabajo adicional. Único caso a cuidar: si el maestro nunca calificó a ese alumno en esta sesión del modal, el snapshot igual existe (se puebla para TODOS los presentes+ausentes al abrir el modal, no solo los ya calificados).

### Decision: GSAP para el conteo, sin Rive

**Choice**: `gsap.to({value: 0}, {value: rachaActual, duration: 0.8, onUpdate: ...})` anima el número de 0 al valor real. No se agrega ninguna dependencia nueva.

**Rationale**: El efecto de "conteo ascendente" es suficiente para el momento celebratorio — no requiere el peso ni la complejidad de un runtime de animación vectorial. Mantiene el bundle liviano (gsap ya está en el chunk principal desde PR3, no hay costo adicional).

### Decision: Copy por niveles (tiers), siempre positivo

**Choice**: Una función `_mensajeParaRacha(n)` con 4 niveles de mensaje según el valor de racha — nunca menciona una racha anterior más alta ni usa lenguaje de pérdida:

| Racha | Mensaje |
|-------|---------|
| Sin fila en `rachas` (nunca evaluado) | "¡Vamos a comenzar tu racha! 🎵" |
| 1 | "¡Empezando una nueva racha! 🌱" |
| 2–4 | "¡Racha de {n} clases! Sigue así 🔥" |
| 5+ | "¡Racha increíble de {n} clases! 🌟" |

**Rationale**: Cumple Spec R-03 (nunca lenguaje de pérdida) incluso en el caso más delicado — una racha en 1 tras haberse reiniciado se lee exactamente igual que la primera racha de un alumno nuevo, sin exponer que "antes era más alta". El copy es un borrador razonable, ajustable si el usuario lo pide — no hay un gate formal de aprobación en spec.md para este caso (a diferencia de D-02, que sí lo exigía explícitamente).

## Data Flow

1. **Carga del modal**: `IndicadorGradingModal.js` llama `_snapshotAchievements` para todos los alumnos (ya existente, PR2) — puebla `achievementsBaseline` con `{logroIds, rachaActual}` por alumno.
2. **Render**: cada fila de alumno presente (`_renderPresente`) agrega un botón "Mostrar racha" con `data-alumno-id`.
3. **Click**: el handler lee `achievementsBaseline.get(alumnoId)?.rachaActual ?? null`, llama a `showRachaRevealOverlay({ alumnoNombre, rachaActual })` (import estático — no hace falta diferirlo, el componente es liviano y no trae dependencias pesadas nuevas).
4. **Overlay**: monta a pantalla completa, anima el número con GSAP, muestra el mensaje según el tier, botón de cerrar.
5. **Cierre**: resuelve la promesa, remueve el overlay del DOM — el modal de calificación sigue intacto debajo (nunca se desmontó).
6. **Guardados posteriores**: siguen actualizando `achievementsBaseline` normalmente (sin cambios) — el próximo click del botón para ese alumno ya refleja el valor nuevo.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/portal-maestros/components/RachaRevealOverlay.js` | New | Overlay a pantalla completa, conteo animado con GSAP, copy por tiers (Spec R-01, R-03, R-04) |
| `src/portal-maestros/components/IndicadorGradingModal.js` | Modify | Botón "Mostrar racha" por alumno presente, lee de `achievementsBaseline` (Spec R-01, R-02) |

Sin migraciones — reutiliza `rachas`/`getRachaAlumno` tal cual (PR2).

## Interfaces / Contracts

### `showRachaRevealOverlay({ alumnoNombre, rachaActual })` (JS)
`rachaActual: number | null` (`null` = sin fila en `rachas` todavía). Devuelve `Promise<void>` que resuelve al cerrarse — mismo contrato que `createAchievementsSummaryModal`/`showInsigniaCelebrationOverlay`.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|--------------|----------|
| `RachaRevealOverlay.js` | Render del mensaje correcto por tier, ausencia de lenguaje de pérdida, cierre y resolución de la promesa | Unit test con jsdom, mock de `gsap` (mismo patrón que `IndicadorGradingModal.gsap.test.js`) |
| `IndicadorGradingModal.js` | El botón existe por alumno, lee el valor correcto del snapshot, NO se dispara solo tras guardar una nota | Unit test con mocks de servicios (mismo patrón que `IndicadorGradingModal.gsap.test.js`) |
| No-regresión | `AchievementsSummaryModal.js` sigue funcionando igual | La suite existente (`AchievementsSummaryModal.test.js`) no debe requerir cambios y debe seguir pasando |

## Rollout

Un solo PR, sin dependencias hacia otros cambios, sin migraciones — seguro de desplegar en cualquier momento (aditivo puro, no toca ningún flujo existente salvo agregar un botón nuevo).
