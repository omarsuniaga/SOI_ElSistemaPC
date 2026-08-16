# Proposal: Racha visible para el alumno, en el momento de la clase

**Date**: 2026-08-16
**Author**: Claude (delegado por Omar Suniaga, DIR)
**Status**: Draft

## Intent

Los alumnos de El Sistema Punta Cana no tienen cuenta ni portal propio (confirmado: no existe ningún login de alumno en el sistema — solo portales departamentales y el portal de maestros). La racha (`rachas.racha_actual`, alimentada desde `juego-gamificado-planificacion`/PR2, ya en producción) hoy solo se muestra en `AchievementsSummaryModal.js`, un popup **para el maestro**: texto compacto, formato de lista administrativa, y solo aparece cuando hay una novedad (logro nuevo o racha que subió) — no hay forma de que el maestro le muestre la racha actual a un alumno de forma legible y celebratoria en el momento, ni de mostrarla cuando el alumno simplemente mantiene su racha sin que suba ese día.

Este cambio agrega un **momento explícito de "mostrar al alumno"**: una pantalla grande, legible a distancia y con lenguaje/diseño pensado para un niño (no para un adulto revisando datos), que el maestro puede activar desde el flujo de calificación para girar el dispositivo y mostrársela al alumno.

## Decisión de alcance (resuelta con el usuario)

Se evaluaron 4 alcances posibles para "racha visible para el alumno":
1. **En el momento de la clase** (maestro le muestra su propia pantalla al alumno) — **ELEGIDO**
2. Portal para padres — requiere construir un portal nuevo, no existe hoy
3. Portal para alumnos con login propio — requiere sistema de identidad para alumnos desde cero
4. Pantalla compartida/kiosko en el salón — requiere un modo de visualización a distancia nuevo

Se eligió la opción 1 porque reutiliza infraestructura ya existente (RLS, datos, el flujo de calificación) sin requerir un sistema de autenticación o portal nuevos — el alcance más chico que resuelve la necesidad real expresada.

## Scope

**In scope**:
- Un componente nuevo de "revelar racha" que el maestro puede disparar manualmente (botón) O que se dispara automáticamente tras calificar, mostrando la racha ACTUAL del alumno (no solo cuando sube) — con diseño grande/legible/celebratorio.
- Wiring en `IndicadorGradingModal.js` (mismo punto donde hoy se dispara `AchievementsSummaryModal.js`).
- Copy en español, tono cálido, apropiado para niños — **nunca comparar entre alumnos**, nunca mostrar la racha de otro alumno.

**Out of scope** (explícitamente, por la decisión de alcance):
- Cualquier portal, login o cuenta de alumno.
- Portal de padres.
- Pantalla de salón/kiosko con actualización en tiempo real para todo el grupo.
- Notificaciones push/SMS a los padres sobre la racha (no hay canal de contacto de alumno, solo email/teléfono de padre capturado en el wizard de inscripción — fuera de alcance).

## Approach

Reutilizar los datos y el punto de disparo ya existentes (`getRachaAlumno` de `maestroDataService.js`, ya usado en `IndicadorGradingModal.js` desde PR2) — no se necesita ninguna migración de base de datos nueva. El trabajo es puramente de UI: un nuevo overlay (siguiendo el patrón visual ya establecido por `InsigniaCelebrationOverlay.js` de PR3 — full-screen, GSAP para la animación del número, tipografía grande) que se puede disparar independientemente del modal de resumen para el maestro (que sigue existiendo, sin cambios).

## Affected Areas

- `src/portal-maestros/components/IndicadorGradingModal.js` — agregar el punto de disparo del nuevo overlay.
- Nuevo: `src/portal-maestros/components/RachaRevealOverlay.js` (o nombre similar, a definir en design.md).
- Sin cambios de base de datos — reutiliza `rachas`/`getRachaAlumno` tal cual.

## Risks

- **Pedagógico**: mostrar una racha rota (`racha_actual = 1` tras una ausencia) podría leerse como negativo si no se enmarca bien — el copy debe ser positivo incluso en ese caso ("¡Empezando una nueva racha!", nunca "perdiste tu racha").
- **UX físico**: "girar la pantalla" asume que el maestro usa un dispositivo con pantalla que el alumno puede ver cómodamente (tablet/laptop) — en un celular chico la legibilidad a distancia puede fallar. Se documenta como limitación conocida, no se resuelve en este cambio (fuera de alcance rediseñar para tamaños de pantalla específicos más allá de la responsividad estándar del portal).

## Rollback Plan

Cambio puramente de frontend, sin migraciones. Revertir el/los commits del PR es suficiente — no deja estado en la base de datos que limpiar.

## Dependencies

Depende de `juego-gamificado-planificacion` (PR2, ya en producción) para los datos de `rachas`. Ninguna dependencia hacia adelante.

## Success Criteria

- [ ] El maestro puede mostrarle al alumno su racha actual de forma legible y celebratoria desde el flujo de calificación existente.
- [ ] El copy nunca compara con otros alumnos ni enmarca una racha reiniciada como un fracaso.
- [ ] No se toca la base de datos ni el modal existente para el maestro (`AchievementsSummaryModal.js` sigue funcionando igual).
