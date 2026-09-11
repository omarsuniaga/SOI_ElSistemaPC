# Project Governance & Agent Rules

Este archivo es la fuente de verdad para humanos y agentes de IA (Claude, Gemini, Cursor, etc.).

## 1. Stack & Standards

- **Framework:** Vite + Vanilla JS (modular SPA con router personalizado)
- **Persistence:** Supabase (Real) / JSON (Demo)
- **Language:** Código en Inglés (variables, funciones, archivos). UI y Documentación en Español.
- **Commits:** Conventional Commits — 100% en Inglés.
  - Formato: `tipo(alcance): descripción en inglés`
  - Tipos: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`
  - Alcance opcional: módulo o área afectada (ej: `feat(postulados):`, `fix(auth):`)
  - NO mezclar idiomas. El mensaje completo en inglés siempre.

## 2. Architecture: DataAdapter Pattern

- Todo servicio de datos DEBE implementar el patrón de abstracción (DataAdapter).
- No se permiten llamadas directas a Supabase desde la UI.
- **Deep Modules (Ousterhout):** Cada DataAdapter debe comportarse como un módulo profundo: exponer una interfaz estrecha y simple a las vistas y componentes, encapsulando internamente la complejidad de joins, mapeo de datos, caché y fallback a mocks.
- **Mock First:** Toda nueva funcionalidad debe estar disponible en Modo Demo (JSON) antes de ser considerada completa.
- Localización de Mocks: `src/assets/data/mocks/`.
- **Estado actual:** El DataAdapter está definido como target arquitectónico. Actualmente algunos servicios llaman a Supabase directamente. La migración completa al patrón es un work in progress.

## 3. Directory Structure

- `src/modules/[name]/`: Autocontenido (api, hooks, components, views).
- `src/assets/data/mocks/`: Archivos JSON para el Modo Demo.
- `scripts/`: Herramientas de mantenimiento y automatización.
- `.agent/skills/`: Skills de ingeniería adaptadas para el agente (`domain-modeling`, `codebase-design`, `diagnosing-bugs`).
- `docs/skills/`: Skills de IA (como `doc-coauthoring.md`) para flujos de trabajo estructurados.
- `OpenClaudeTools/`: Herramientas externas (excluidas de Git).
- `docs/planning/`: Archivos de planificación, SPECs y diagnósticos.
- `docs/scratch/`: Scripts de depuración y consultas ad-hoc.

## 4. Security & Hygiene

- **Secrets:** PROHIBIDO commitear `.env`, keys o tokens.
- **Root Cleanliness:** Mantener la raíz libre de archivos temporales o huérfanos.
- **Git Hygiene:** Verificar `.gitignore` regularmente para evitar leaks de herramientas locales.

## 5. Documentation & Domain Model

- **Ubiquitous Language (`CONTEXT.md`):** Consultar `CONTEXT.md` en la raíz como fuente de verdad para la nomenclatura del dominio musical e institucional. Mantener actualizado el modelo.
- Los cambios significativos deben reflejarse en `docs/` o en las `specs/` correspondientes.
- Los SPECs deben estar vinculados a historias de usuario y tareas concretas.

## 6. Decision Autonomy & Execution Mode

- **Full Autonomy on Implementation:** The agent MUST make technical, structural, architectural, and design decisions autonomously without pausing to ask confirmation on standard implementation steps.
- **Continuous Tool Chaining:** Read, edit, build, test, and commit consecutively to completion. Report only final synthesis and outcomes.
- **Zero Question Loops:** Do not ask permission to proceed, write files, or run tests. Execute directly. Only pause for user input on true business domain ambiguities or irreversible destructive operations.

## 7. Engineering Disciplines & Skills

- **Domain Modeling (`.agent/skills/domain-modeling`):** Respetar el vocabulario canónico de `CONTEXT.md` y prevenir la deriva sinonímica en código y UI.
- **Codebase Design (`.agent/skills/codebase-design`):** Construir módulos profundos sobre costuras (*seams*) limpias que aíslen la UI de la persistencia.
- **Diagnosing Bugs (`.agent/skills/diagnosing-bugs`):** Ciclo estricto de diagnóstico ante fallos: escribir primero un test fallando en Vitest (rojo) $\rightarrow$ formular hipótesis técnica $\rightarrow$ aplicar corrección quirúrgica $\rightarrow$ verificar resolución (verde) y prevenir regresiones.

## 8. Política Estructural (VINCULANTE)

Fuente completa: **[`docs/POLITICA_DE_DESARROLLO.md`](docs/POLITICA_DE_DESARROLLO.md)**.
Origen del diagnóstico: [`docs/SOI_RUTA_A_REFERENCIA.md`](docs/SOI_RUTA_A_REFERENCIA.md).

En septiembre de 2026 se midió el estado real: **247 tablas en producción, 123 completamente vacías**.
El problema de SOI no es funcionalidad faltante sino **capacidad construida y no cerrada**.
Estas seis reglas existen para que eso no se repita, y para empujar hacia una plataforma
replicable en otras organizaciones musicales.

- **R1 · Toda tabla nace con escritor y con fecha de primera fila.** La migración y el código
  que escribe en ella viajan en el MISMO PR. Además, el PR declara quién produce la primera
  fila real y cuándo. Si el escritor llega después, la tabla llega después.
- **R2 · Cerrar el bucle.** Lo que detecta algo registra la acción y su resultado; lo que define
  un catálogo incluye su captura de uso. Prohibido entregar la mitad emisora sin la receptora.
- **R3 · Multi-institución desde el día uno.** Toda tabla de dominio nueva lleva `institucion_id`,
  o una exención declarada en la migración: `-- policy:exento-institucion_id razón: <por qué>`.
- **R4 · Configuración, no esquema.** Lo particular de FUNEYCA se configura; lo común se
  estandariza. Prueba: ¿otra organización lo usaría cambiando datos, sin tocar código?
- **R5 · Todo número trazable hasta su evidencia.** Ningún indicador se publica sin drill-down
  a sus registros de origen.
- **R6 · La persona decide; el sistema recomienda.** Ninguna automatización expulsa, sanciona
  ni etiqueta a un alumno. Toda recomendación de Hermes lleva sus seis campos (qué ocurrió,
  qué evidencia, por qué importa, qué acción, quién decide, cuándo revisar). Ninguna
  comunicación sale sin consentimiento verificable.

**Aplicación — trinquete, no muro.** El repo arrastra deuda; la política no exige perfección,
exige **no retroceder**. `npm run policy:check` falla solo si la deuda **crece** respecto de
`scripts/.structural-baseline.json`. Está integrada en `scripts/soi-verify-gate.sh`.

**Excepciones** se declaran en el PR: `POLICY-EXCEPTION R<n>: <qué> — <por qué> — <cómo y cuándo se paga>`.
Una excepción sin plan de pago es deuda silenciosa — el mecanismo exacto que produjo las 123 tablas vacías.
