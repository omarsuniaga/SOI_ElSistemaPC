# Spec: racha-visible-en-clase
**Date**: 2026-08-16
**Version**: 1.0
**Change**: `racha-visible-en-clase` — overlay de pantalla completa para que el maestro le muestre al alumno su racha actual, en el momento de la clase.

---

## R-01 Botón "Mostrar racha" por alumno, siempre disponible

`IndicadorGradingModal.js` MUST mostrar, junto a cada alumno presente, un botón para revelar su racha actual — disponible en todo momento (no solo tras calificar), reutilizando el snapshot de racha ya cargado por `_snapshotAchievements` (sin consulta extra).

**Files**: `src/portal-maestros/components/IndicadorGradingModal.js` (modificar), nuevo `src/portal-maestros/components/RachaRevealOverlay.js`
**Test**: `src/portal-maestros/components/__tests__/RachaRevealOverlay.test.js`, `IndicadorGradingModal.rachaReveal.test.js`

#### Scenario: Maestro muestra la racha de un alumno con racha activa

- GIVEN un alumno presente con `racha_actual = 5`
- WHEN el maestro toca el botón "Mostrar racha" de ese alumno
- THEN se abre un overlay de pantalla completa mostrando el número 5 de forma grande y legible a distancia, con un mensaje celebratorio

#### Scenario: Alumno sin fila en `rachas` todavía (nunca evaluado)

- GIVEN un alumno presente sin fila en `rachas`
- WHEN el maestro toca "Mostrar racha"
- THEN el overlay muestra un estado de bienvenida apropiado (ej. invitación a empezar), nunca un error ni un "0" desnudo

---

## R-02 Disparo siempre manual, nunca automático

El overlay de racha MUST dispararse únicamente por acción explícita del maestro (el botón de R-01) — MUST NOT abrirse automáticamente tras guardar una calificación, para no interrumpir el flujo de calificación grupal con una toma de pantalla completa no solicitada. Esto es distinto del comportamiento de `AchievementsSummaryModal.js` (que sí es automático) — ambos coexisten sin reemplazarse.

**Files**: `src/portal-maestros/components/IndicadorGradingModal.js`
**Test**: verificar que guardar una nota (individual, grupal, o recuperación) nunca invoca `RachaRevealOverlay` por sí solo.

#### Scenario: Guardar una calificación no dispara el overlay de racha

- GIVEN un alumno cuya racha sube de 3 a 4 al guardarle una nota
- WHEN se completa el guardado
- THEN se sigue comportando igual que hoy (posible `AchievementsSummaryModal`), y el overlay de racha (R-01) NO se abre solo — requiere el toque explícito del botón

---

## R-03 Copy siempre positivo, nunca de pérdida ni comparativo

El copy del overlay MUST enmarcar cualquier valor de racha de forma positiva, incluso `racha_actual = 1` tras una ausencia — MUST NOT usar lenguaje de pérdida, ruptura o fracaso ("perdiste tu racha", "se rompió"). El overlay MUST NOT mostrar el nombre, la racha, ni ningún dato de otro alumno.

**Files**: `src/portal-maestros/components/RachaRevealOverlay.js`
**Test**: `RachaRevealOverlay.test.js` — verificar que ningún string de copy contiene vocabulario de pérdida, y que solo se renderiza el alumno pasado como parámetro (nunca una lista).

#### Scenario: Racha reiniciada en 1

- GIVEN un alumno con `racha_actual = 1` (reiniciada tras faltar a una clase programada)
- WHEN se abre el overlay
- THEN el copy es positivo/de inicio (ej. "¡Empezando una nueva racha!"), sin mencionar que hubo una racha anterior más alta ni usar palabras como "perdiste" o "rota"

#### Scenario: Nunca se compara entre alumnos

- GIVEN cualquier valor de racha
- WHEN se abre el overlay para un alumno
- THEN el contenido renderizado no incluye el nombre ni el dato de ningún otro alumno de la clase

---

## R-04 Cierre simple, no bloqueante

El overlay MUST poder cerrarse con un toque/click único y claro, sin bloquear que el maestro siga calificando a otros alumnos inmediatamente después de cerrarlo.

**Files**: `src/portal-maestros/components/RachaRevealOverlay.js`
**Test**: `RachaRevealOverlay.test.js` — verificar que existe un botón de cierre y que al activarlo se remueve el overlay del DOM.

#### Scenario: Maestro cierra el overlay y sigue calificando

- GIVEN el overlay de racha abierto para un alumno
- WHEN el maestro toca el botón de cerrar
- THEN el overlay se remueve del DOM y el modal de calificación (`IndicadorGradingModal`) sigue funcionando normalmente, sin recargar ni perder el estado de calificación ya guardado

---

## R-05 No modifica el flujo existente del maestro

`AchievementsSummaryModal.js` y la lógica de detección de logros/racha nueva (`_computeAchievementsUpdate`, `_checkAndShowAchievements`, `_showAchievements`) MUST seguir funcionando exactamente igual que antes de este cambio — este es un agregado puramente aditivo, sin reemplazar ni modificar ese flujo.

**Files**: ninguno (requisito de no-regresión)
**Test**: la suite existente de `AchievementsSummaryModal.test.js` e `IndicadorGradingModal.gsap.test.js` MUST seguir pasando sin modificaciones.

#### Scenario: El resumen para el maestro sigue apareciendo igual

- GIVEN un alumno que obtiene un logro nuevo al ser calificado
- WHEN se completa el guardado
- THEN `AchievementsSummaryModal` se muestra exactamente como antes de este cambio, sin ningún cambio de comportamiento
