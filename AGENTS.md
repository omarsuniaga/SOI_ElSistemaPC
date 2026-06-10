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

- El `README.md` debe reflejar siempre el estado actual del "Modo Demo" para reclutadores.
- Comentar el "POR QUÉ" de las decisiones técnicas, no el "QUÉ".

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

`graphify` is a CLI tool installed at `~/.local/bin/graphify`. When the user types `/graphify`, run the command before doing anything else.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
