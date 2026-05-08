# Project Governance & Agent Rules

Este archivo es la fuente de verdad para humanos y agentes de IA (Claude, Gemini, Cursor, etc.).

## 1. Stack & Standards
- **Framework:** Vite + Vanilla JS (Transitioning to React pattern)
- **Persistence:** Supabase (Real) / JSON (Demo)
- **Language:** Código en Inglés (variables, funciones, archivos). UI y Documentación en Español.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).

## 2. Architecture: DataAdapter Pattern
- Todo servicio de datos DEBE implementar el patrón de abstracción.
- No se permiten llamadas directas a Supabase desde la UI.
- **Mock First:** Toda nueva funcionalidad debe estar disponible en Modo Demo (JSON) antes de ser considerada completa.
- Localización de Mocks: `src/assets/data/mocks/`.

## 3. Directory Structure
- `src/modules/[name]/`: Autocontenido (api, hooks, components, views).
- `src/assets/data/mocks/`: Archivos JSON para el Modo Demo.
- `scripts/`: Herramientas de mantenimiento y automatización.
- `docs/skills/`: Skills de IA (como `doc-coauthoring.md`) para flujos de trabajo estructurados.
- `OpenClaudeTools/`: Herramientas externas (excluidas de Git).

## 4. Security & Hygiene
- **Secrets:** PROHIBIDO commitear `.env`, keys o tokens.
- **Root Cleanliness:** Mantener la raíz libre de archivos temporales o huérfanos.
- **Git Hygiene:** Verificar `.gitignore` regularmente para evitar leaks de herramientas locales.

## 5. Documentation
- El `README.md` debe reflejar siempre el estado actual del "Modo Demo" para reclutadores.
- Comentar el "POR QUÉ" de las decisiones técnicas, no el "QUÉ".
