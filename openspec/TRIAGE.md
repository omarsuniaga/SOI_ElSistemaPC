# OpenSpec — Triage de consolidación (2026-08-30)

Parte de Fase A del [Plan de Cierre](../../soi/06_IA_AGENTS_LOGIC/SOI_PLAN_DE_CIERRE_V0.md).
Objetivo: de 3 árboles de OpenSpec + ~27 changes sin clasificar → 1 árbol y cada
change con destino claro.

## Árboles de OpenSpec

| Ubicación | Rol | Acción |
|---|---|---|
| `~/projects/sistema-academico-pwa/openspec` | **canónico** | queda |
| `~/soi/09_SOI_WEB_PORTAL/.../openspec` | clon obsoleto | se va con el clon (único aporte: `panel-hermes-calendario`, ya portado) |
| `~/soi/openspec` | changes institucionales | los de código → migrar acá; los de doc/legal → quedan en `~/soi` |

## Changes del repo (`openspec/changes/`)

| Change | Tareas | Veredicto |
|---|---|---|
| `alumnos-audit-fixes` | 37/37 | **Archive** (verificar y `sdd-archive`) |
| `curriculo-tres-planos` | 9/9 | **Archive** (verificar) |
| `modulo-planificacion-standardization` | 15/15 | **Archive** (verificar) |
| `planificacion-dataadapter` | 21/21 | **Archive** (verificar) |
| `soi-event-enrichment` | sin tasks | **Archive** — Handoff dice "Phase 2 COMPLETO ✅" |
| `juego-gamificado-planificacion` | sin tasks | **Archive** — master #35 "cierra el ciclo verify+archive" |
| `soi-event-spine` | 0/94 | **Reconciliar vs prod primero** — Phases 1-3 deployadas, spec viejo. Luego archive. |
| `teacher-portal-ai-grading` | 34/42 | **Queda** — Fase C, cerrar los 8 restantes |
| `cierre-periodo` | 0/14 | **Queda** — Fase C, mecanismo ya especificado |
| `panel-hermes-calendario` | 0/22 | **Queda** — Fase C, atado a #46-47 (decisión de Omar) |
| `transicion-semestre` | sin tasks | **Queda** — hay módulo `src/modules/transicion-semestre`; falta `sdd-tasks` |

## Changes institucionales (`~/soi/openspec/changes/`)

### Código — migrar a `openspec/` del repo si Omar los prioriza para 2026

| Change | Tareas | Nota |
|---|---|---|
| `refactor-modulo-alumnos` | 7/10 | En curso. **Queda** (Fase C). |
| `rubrica-acm-rub-001-pwa` | 0/4 | Parcial — migración `20260714203000_acm_rubrica_evaluacion` en prod. |
| `refactor-arquitectura-limpia-audiciones` | 0/6 | Parcial — ramas `feat/audiciones-*` mergeadas. Verificar qué falta. |
| `circuito-cambio-instrumentos-pwa` | 0/20 | Grande. ¿Prioridad 2026? |
| `crear-skill-soi-drift-sync` | 0/4 | Útil para el cierre mismo (detectar drift doc↔código). |
| `dockerizar-ecosistema-soi` | 0/5 | Hay Dockerfile + compose. Baja prioridad para "cerrar". |
| `integrar-perfiles-administracion-v9` | sin tasks | Parcial — `portalAccessService` existe. |
| `diseno-modulo-pedagogico-avanzado` / `modulo-pedagogico-avanzado-gcp` | sin tasks | Diseño. Hay `src/modules/pedagogico`. ¿Superado? |
| `crear-proceso-lutheria-y-ficha-diagnostico` | 0/3 | Parcial — `src/modules/luteria-taller`. Cruzar con SP-6. |

### Doc / legal / proceso — NO son código, quedan en `~/soi` (o tracker de procesos)

- `crear-contrato-comodato-instrumentos-soi` (0/2)
- `crear-plantilla-contrato-trabajo-y-proceso-hr` (0/3)
- `crear-plantilla-control-viajes-y-permisos-menores` (0/2)
- `protocolo-concierto-aniversario` (sin tasks)
- `completar-formularios-evaluacion-y-logistica-concierto` (0/3)

## Pasos

1. **Verificar los 6 "Archive"** — confirmar contra código/DB que están hechos, correr `sdd-verify` + `sdd-archive`.
2. **Reconciliar `soi-event-spine`** contra las Phases 1-3 ya deployadas.
3. **Omar prioriza** los 9 changes institucionales de código: cuáles a 2026, cuáles parkear.
4. **Migrar** los priorizados a `openspec/changes/` del repo; el resto → `archive` con nota.
5. Los 5 de doc/legal quedan fuera del openspec del repo.
