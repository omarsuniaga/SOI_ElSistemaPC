# Handoff → AI-Anti · FASE 0 · Verificación exhaustiva de la Tarea 0.1

**Contexto:** Claude Code hizo el inventario inicial de las 122 tablas vacías de SOI
(`docs/hygiene/FASE-0_inventario_tablas_vacias.md` / `.csv`). La columna **"uso en código"**
de ese inventario es aproximada: el match fue textual y la lista de archivos por tabla
**se truncó a 3**. Tu trabajo es rehacer esa columna sin atajos, para que Omar decida
Terminar / Archivar / Eliminar con datos firmes.

**Repo:** rama `claude/soi-empty-tables-inventory-07adbc`
**BD:** proyecto Supabase `SOI_DDBB_EL_SISTEMAPC` (ref `zmhmdvmyeyswunurcyow`) — solo lectura.

---

## Entrada

- `docs/hygiene/FASE-0_inventario_tablas_vacias.csv` — 122 filas, columna `code_usage` a corregir.
- Lista de nombres: la columna `table` de ese CSV.

## Método (por cada una de las 122 tablas)

1. **Grep exhaustivo** del nombre exacto de la tabla en TODO el repo salvo:
   - `node_modules/`, `dist/`, `build/`, `.git/`
   - archivos autogenerados: `**/database.types.ts`, `**/schema_dump.json`,
     `**/*.d.ts`, `docs/database_schema.sql`, `supabase/migrations/schema_reference.sql`
   - **incluí** sí o sí: `src/`, `supabase/functions/`, `supabase/migrations/`,
     `scripts/`, `tools/`, `*.html`, `*.sql`, funciones RPC.
2. Para cada hit, clasificá el archivo:
   - **PROD** — `.from('<tabla>')`, `.rpc(...)` que la toca, INSERT/UPDATE/SELECT real en
     un servicio/vista/edge function que corre en producción.
   - **MOCK/FIXTURE** — `*Mock.js`, `*.fixture.*`, `assets/data/mocks/`, `*.json` de datos de ejemplo,
     seeds de demo. NO cuenta como uso real.
   - **TEST** — `*.test.*`, `*.spec.*`, `__tests__/`. Anotar pero no cuenta.
   - **MIGRACIÓN/DDL** — solo define el esquema.
   - **DOC/COMENTARIO** — markdown, comentarios.
3. **Verificá contra la BD** (vía MCP Supabase o SQL de solo lectura):
   - ¿la tabla es destino de alguna VIEW, función, trigger o RLS policy de otra tabla?
   - ¿tiene `fk_in > 0`? ¿quién la referencia?
4. Determiná el veredicto de uso:
   - `ACTIVA` — ≥1 hit PROD que claramente se ejecuta.
   - `CABLEADA-SIN-DATOS` — hay código PROD que la usa pero la feature nunca se pobló.
   - `SOLO-MOCK` — únicamente mocks/tests la nombran.
   - `HUÉRFANA` — nadie la nombra fuera de migración/tipos.
5. Confianza: `alta` / `media` / `baja` + una nota de 1 línea con el archivo clave.

## Salida esperada

- `docs/hygiene/FASE-0_inventario_verificado.csv` — mismo orden de filas, columnas nuevas:
  `veredicto_uso, confianza, archivo_clave, referencias_prod, referencias_mock, notas`
- `docs/hygiene/FASE-0_verificacion_hallazgos.md` — resumen: cuántas ACTIVA / CABLEADA-SIN-DATOS /
  SOLO-MOCK / HUÉRFANA, y la lista de las que cambiaron de clasificación respecto al inventario inicial
  (con el porqué). Señalá cualquier tabla que el inventario marcó "solo autogen" y que en realidad
  tiene uso PROD.

## Reglas

- **Solo lectura en la BD.** No generar ni aplicar DDL. No tocar el inventario original.
- No decidir Terminar/Archivar/Eliminar — eso lo hace Omar.
- Si una tabla es ambigua, marcá `confianza: baja` y explicá la duda; no adivines.
- Al terminar, dejá los 2 archivos en `docs/hygiene/` y un commit en la rama (no merge, no PR).
