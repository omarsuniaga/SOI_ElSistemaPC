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
- **Mock First:** Toda nueva funcionalidad debe estar disponible en Modo Demo (JSON) antes de ser considerada completa.
- Localización de Mocks: `src/assets/data/mocks/`.
- **Estado actual:** El DataAdapter está definido como target arquitectónico. Actualmente algunos servicios llaman a Supabase directamente. La migración completa al patrón es un work in progress.

## 3. Directory Structure

- `src/modules/[name]/`: Autocontenido (api, hooks, components, views).
- `src/assets/data/mocks/`: Archivos JSON para el Modo Demo.
- `scripts/`: Herramientas de mantenimiento y automatización.
- `docs/skills/`: Skills de IA (como `doc-coauthoring.md`) para flujos de trabajo estructurados.
- `OpenClaudeTools/`: Herramientas externas (excluidas de Git).
- `docs/planning/`: Archivos de planificación, SPECs y diagnósticos.
- `docs/scratch/`: Scripts de depuración y consultas ad-hoc.

## 4. Security & Hygiene

- **Secrets:** PROHIBIDO commitear `.env`, keys o tokens.
- **Root Cleanliness:** Mantener la raíz libre de archivos temporales o huérfanos.
- **Git Hygiene:** Verificar `.gitignore` regularmente para evitar leaks de herramientas locales.

## 5. Documentation

- Los cambios significativos deben reflejarse en `docs/` o en las `specs/` correspondientes.
- Los SPECs deben estar vinculados a historias de usuario y tareas concretas.

## 6. Decision Autonomy & Execution Mode

- **Full Autonomy on Implementation:** The agent MUST make technical, structural, architectural, and design decisions autonomously without pausing to ask confirmation on standard implementation steps.
- **Continuous Tool Chaining:** Read, edit, build, test, and commit consecutively to completion. Report only final synthesis and outcomes.
- **Zero Question Loops:** Do not ask permission to proceed, write files, or run tests. Execute directly. Only pause for user input on true business domain ambiguities or irreversible destructive operations.
