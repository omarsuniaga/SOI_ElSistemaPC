# Auditoría y Limpieza: Código Basura y Proyectos Abandonados [LA5]

**Fecha:** 2026-09-08  
**Autor:** AI-Anti (Antigravity)  
**Tarea:** [LA5] [BAJA] Basura commiteada: `src/portales/calendario/_standalone-project-backup/` y carpeta raíz duplicada `/unicode-reviewer/`

---

## 1. Contexto y Diagnóstico

En la auditoría del Bloque B (`audit/soi-lila-2026-09`) se identificaron dos acumulaciones de código redundante / huérfano dentro del árbol de control de versiones:

1. **`src/portales/calendario/_standalone-project-backup/`**:
   - Backup completo de un proyecto standalone Vite/Bun con sus propios `package.json`, `bun.lock`, `index.html`, `metadata.json` y `vite.config.ts`.
   - No participaba en el build general de la aplicación ni era importado por ningún módulo.
   - **Acción:** Eliminado por completo tras autorización expresa de Omar.

2. **`unicode-reviewer/` en la raíz vs `tools/unicode-reviewer/`**:
   - En la raíz existía una carpeta `/unicode-reviewer/` que duplicaba byte-a-byte a la herramienta canónica `tools/unicode-reviewer/` (795 líneas duplicadas entre script y tests).
   - `package.json` hace referencia explícita a la versión bajo `tools/` (`"unicode:check": "node tools/unicode-reviewer/revisar-textos.js ./src --dry-run"`).
   - **Acción:** Eliminada la carpeta duplicada en la raíz `/unicode-reviewer/` manteniendo intacta la herramienta oficial `tools/unicode-reviewer/`.

---

## 2. Verificación

- **Suite de pruebas de unicode-reviewer:**
  `npm run unicode:test` ejecutado con éxito: 1 archivo, 36/36 tests pasando en 282ms contra `tools/unicode-reviewer/revisar-textos.test.mjs`.
- **Árbol de trabajo:** Limpio de proyectos fantasma y duplicados innecesarios.
