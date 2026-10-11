# tablero — visor del backlog de reparaciones SOI (Engram → HTML kanban)

Convierte los observations de Engram en una página HTML kanban estilizada, alineada
a **SOI-MAP**:

- `tablero/reparaciones` — el backlog (**QUÉ** hacer), en tablas markdown.
- `coordination/lanes` — el candado por **ÁREA** (quién toca qué), si existe como tabla.
- `tablero/<id>/progress` — el progreso real de cada agente (cada uno su topic → **a
  prueba de clobber**). Se agrega en la tira "Actividad de agentes".

## Uso

```bash
node tools/tablero/tablero.mjs            # genera tools/tablero/tablero.html y lo abre
node tools/tablero/tablero.mjs --no-open  # solo genera
node tools/tablero/tablero.mjs --watch    # regenera cada 15s (la página se auto-recarga)
```

| Bandera | Qué hace |
|---|---|
| `--topic <key>` | backlog (default `tablero/reparaciones`) |
| `--lanes <key>` | registro de carriles (default `coordination/lanes`) |
| `--file <ruta.md>` | parsea un `.md` en vez de leer la BD |
| `--out <ruta.html>` | destino del HTML |
| `--db <ruta>` | otra `engram.db` (default `~/.engram/engram.db`) |

## Cómo funciona

1. Abre `~/.engram/engram.db` **en modo solo lectura** (`node:sqlite`, sin deps).
2. Parsea el backlog: secciones `##`, tablas markdown (`| ID | Área | Prio | Tarea | … |`),
   la lista de CERRADA y el texto de protocolo.
3. Deriva la actividad de agentes de todos los topics `tablero/%/progress`.
4. Renderiza un HTML autocontenido: 4 columnas por estado SOI-MAP
   (**Libre / En curso / En review / Cerrada**), badges de prioridad, chips de
   área/agente/rama, rutas del repo como `<code>`, `#NN` → links a PRs, filtros por
   área y por prioridad ALTA, tira de carriles + actividad arriba.

No escribe nada en Engram. Refrescar = re-ejecutar (o `--watch`).

## Requisitos

Node ≥ 22 (`node:sqlite`; el repo corre Node 24).
