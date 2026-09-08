# tablero — visor del tablero kanban de Engram

Convierte el observation de Engram `fase-0/tablero-tareas` (texto ASCII, editado por
varios agentes) en una página HTML kanban estilizada.

## Uso

```bash
node tools/tablero/tablero.mjs            # genera tools/tablero/tablero.html y lo abre
node tools/tablero/tablero.mjs --no-open  # solo genera
node tools/tablero/tablero.mjs --watch    # regenera cada 15s (la página se auto-recarga)
```

Otras banderas:

| Bandera | Qué hace |
|---|---|
| `--topic <key>` | otro topic_key (default `fase-0/tablero-tareas`) |
| `--file <ruta.txt>` | parsea un `.txt` en vez de leer la BD |
| `--out <ruta.html>` | destino del HTML |
| `--db <ruta>` | otra `engram.db` (default `~/.engram/engram.db`) |

## Cómo funciona

1. Abre `~/.engram/engram.db` **en modo solo lectura** (`node:sqlite`, sin deps) y lee el
   `content` más reciente del `observations` con ese `topic_key`.
2. Parsea la estructura del tablero:
   - `═ BLOQUE X · nombre ═` → columnas de agrupación (chip de color por bloque)
   - `[ID] [PRIO] descripción` + línea de estado (`ESTADO · agente · fecha · entregable`)
   - estado **inline** también (`... LIBRE — parte de [LA7].`)
   - `─ LOG ─` → timeline al pie
3. Renderiza un HTML autocontenido: 5 columnas (Libre / En curso / Parcial / Bloqueado /
   Hecho), badges de prioridad, chips de bloque/agente/fecha, rutas del repo como `<code>`,
   `#NN` como links a PRs, filtros por bloque y por prioridad ALTA.

No escribe nada en Engram. Para refrescar, volvé a correr el script (o usá `--watch`).

## Requisitos

Node ≥ 22 (usa `node:sqlite`, estable desde Node 22.5; el repo corre Node 24).
