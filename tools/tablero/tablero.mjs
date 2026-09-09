#!/usr/bin/env node
/**
 * tablero.mjs — renderiza el backlog de reparaciones SOI de Engram como una
 * pagina HTML kanban estilizada, alineada a SOI-MAP.
 *
 * Lee (solo lectura) desde ~/.engram/engram.db:
 *   - `tablero/reparaciones`  → el backlog (QUE hacer), en tablas markdown
 *   - `coordination/lanes`    → el candado por AREA (quien toca que ahora)
 * y genera un HTML autocontenido: kanban por estado SOI-MAP
 * (LIBRE / EN-CURSO / EN-REVIEW / CERRADA) + tira de carriles arriba.
 *
 * Uso:
 *   node tools/tablero/tablero.mjs                 # genera tools/tablero/tablero.html y lo abre
 *   node tools/tablero/tablero.mjs --no-open       # solo genera
 *   node tools/tablero/tablero.mjs --watch         # regenera cada 15s (vista en vivo)
 *   node tools/tablero/tablero.mjs --topic otro/topic --lanes otro/lanes
 *   node tools/tablero/tablero.mjs --file tablero.md    # parsea un .md en vez de la BD
 *   node tools/tablero/tablero.mjs --out /ruta/x.html --db /ruta/engram.db
 *
 * Sin dependencias. Requiere Node >= 22 (node:sqlite).
 */

import { DatabaseSync } from 'node:sqlite'
import { spawn } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import os from 'node:os'
import path from 'node:path'

// ---------------------------------------------------------------- args
const argv = process.argv.slice(2)
const opt = (name, def = null) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : def
}
const flag = (name) => argv.includes(`--${name}`)

const here = path.dirname(fileURLToPath(import.meta.url))
const TOPIC = opt('topic', 'tablero/reparaciones')
const LANES_TOPIC = opt('lanes', 'coordination/lanes')
const DB_PATH = opt('db', path.join(os.homedir(), '.engram', 'engram.db'))
const OUT = opt('out', path.join(here, 'tablero.html'))
const FILE = opt('file')
const OPEN = !flag('no-open')
const WATCH = flag('watch')
const REPO = 'https://github.com/omarsuniaga/SOI_ElSistemaPC'

// ---------------------------------------------------------------- fuente
function dbRow(db, topic) {
  return db
    .prepare(
      `SELECT id, title, content, topic_key, revision_count, updated_at
         FROM observations
        WHERE topic_key = ? AND deleted_at IS NULL
        ORDER BY updated_at DESC LIMIT 1`,
    )
    .get(topic)
}

function fromDb() {
  if (!existsSync(DB_PATH)) throw new Error(`no existe la BD de Engram: ${DB_PATH}`)
  const db = new DatabaseSync(DB_PATH, { readOnly: true })
  const row = dbRow(db, TOPIC)
  const lanes = dbRow(db, LANES_TOPIC)
  // progreso por tarea: cada agente escribe su propio topic → a prueba de upsert
  const progreso = db
    .prepare(
      `SELECT topic_key, content, updated_at
         FROM observations
        WHERE topic_key LIKE 'tablero/%/progress' AND deleted_at IS NULL
        ORDER BY updated_at DESC`,
    )
    .all()
    .map((r) => ({ topic: r.topic_key, content: String(r.content), updated_at: r.updated_at }))
  db.close()
  if (!row) throw new Error(`no hay observation con topic_key="${TOPIC}"`)
  return {
    src: { ...row, content: String(row.content) },
    lanesContent: lanes ? String(lanes.content) : '',
    progreso,
  }
}

function fromFile() {
  return {
    src: { id: null, title: TOPIC, content: readFileSync(FILE, 'utf8'), revision_count: null, updated_at: null },
    lanesContent: '',
    progreso: [],
  }
}

/**
 * Deriva la actividad real de los agentes desde los topics `tablero/<id>/progress`.
 * Es a prueba de clobber: cada agente tiene su propio topic, nadie pisa a nadie.
 */
function parseProgreso(rows) {
  return rows.map((r) => {
    const id = (r.topic.match(/^tablero\/(.+?)\/progress$/) || [])[1] || r.topic
    const txt = limpiar(r.content)
    const primera = txt.split('\n').find((l) => l.trim()) || ''
    const rama = (txt.match(/\b(?:rama|branch)[:\s]+`?([\w./-]+\/[\w./-]+)`?/i) || txt.match(/`([\w./-]+\/[\w./-]+)`/) || [])[1] || ''
    const agente = (txt.match(/\[([^\]/]+)\/\d{4}-\d{2}-\d{2}\]/) || txt.match(/\bfor\s+([A-Z][\w-]+)\b/) || [])[1] || ''
    let estado = 'EN-CURSO'
    if (/\bblock|bloque|no could|could not|blocked\b/i.test(txt)) estado = 'BLOQUEADO'
    if (/\bcommit|commiteado|PR #?\d|EN-REVIEW\b/i.test(txt)) estado = 'EN-REVIEW'
    return { id: id.toUpperCase(), agente, rama, estado, resumen: primera.slice(0, 160), updated_at: r.updated_at }
  })
}

// ---------------------------------------------------------------- helpers de texto
/** Quita el prefijo `#<id> [type] <title>` y el sufijo de metadatos de Engram. */
function limpiar(content) {
  let c = content.replace(/^#\d+\s+\[[^\]]*\]\s+.*\n/, '')
  // sufijo acumulado de Engram: "Session:/Topic:/Scope:/Revisions:/Created:" al final
  c = c.replace(/\n(?:Session|Project|Scope|Topic|Duplicates|Revisions|Created|Updated):.*$/gis, '')
  return c.trim()
}

const stripMd = (s) =>
  String(s ?? '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s+|\s+$/g, '')

function prioridadDe(txt) {
  const t = String(txt || '').toUpperCase()
  if (t.includes('ALTA')) return 'alta'
  if (t.includes('MEDIA')) return 'media'
  if (t.includes('BAJA')) return 'baja'
  return 'sin'
}

const ESTADOS = ['LIBRE', 'EN-CURSO', 'EN-REVIEW', 'CERRADA']
function estadoDe(txt, fallback = null) {
  const t = String(txt || '').toUpperCase().replace(/\s+/g, '-').replace(/-+/g, '-')
  if (t.includes('EN-REVIEW') || t.includes('REVIEW')) return 'EN-REVIEW'
  if (t.includes('EN-CURSO') || t.includes('CURSO')) return 'EN-CURSO'
  if (t.includes('CERRAD')) return 'CERRADA'
  if (t.includes('LIBRE')) return 'LIBRE'
  return fallback
}

// ---------------------------------------------------------------- parser de tablas markdown
/** Divide una fila `| a | b | c |` en celdas limpias. */
function splitRow(line) {
  return line
    .replace(/^\s*\|/, '')
    .replace(/\|\s*$/, '')
    .split('|')
    .map((c) => stripMd(c))
}
const isSep = (cells) => cells.every((c) => /^:?-{2,}:?$/.test(c.replace(/\s/g, '')))

/**
 * Recorre el markdown por secciones `##` y extrae:
 *  - tareas (filas de cualquier tabla que tenga columna ID/Tarea)
 *  - lista de CERRADA (parrafo con IDs)
 *  - texto de protocolo (todo lo previo a la primera `##`)
 *  - pendientes de Omar (seccion "Pendientes de Omar")
 */
function parseBacklog(content) {
  const c = limpiar(content)
  const lines = c.split('\n')
  const meta = { tareas: [], cerradas: [], protocolo: '', pendientesOmar: [], titulo: '' }

  const mt = c.match(/^#\s+(.+)$/m)
  if (mt) meta.titulo = stripMd(mt[1])

  let seccion = ''
  let headers = null
  let hintEstado = null
  let hintEsperaOmar = false
  const protoLines = []
  let enProto = true

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const mh = line.match(/^##\s+(.+)$/)
    if (mh) {
      enProto = false
      seccion = stripMd(mh[1])
      headers = null
      const S = seccion.toUpperCase()
      hintEstado = estadoDe(S)
      hintEsperaOmar = /ESPERA\s+OMAR/.test(S)
      // "EN-CURSO / EN-REVIEW" combinado → sin hint fijo, se decide por fila
      if (/EN-CURSO.*EN-REVIEW|EN-REVIEW.*EN-CURSO/.test(S)) hintEstado = null
      continue
    }
    if (enProto) { protoLines.push(line); continue }

    // seccion CERRADA: parrafo con IDs, no tabla
    if (/CERRAD/i.test(seccion) && line.trim() && !line.startsWith('|')) {
      const ids = line.match(/\b([A-Z]{1,4}\d*(?:\.\d+[a-z]?)?|PR#\d+|T\d\.\d[a-z-]*|L[AC]\d+)\b/g)
      if (ids) meta.cerradas.push(...ids)
      continue
    }

    // "Pendientes de Omar": lista numerada
    if (/PENDIENTES DE OMAR/i.test(seccion)) {
      const mo = line.match(/^\s*\d+\.\s+(.+)$/)
      if (mo) meta.pendientesOmar.push(stripMd(mo[1]))
      continue
    }

    // filas de tabla
    if (line.trim().startsWith('|')) {
      const cells = splitRow(line)
      if (isSep(cells)) continue
      if (!headers) {
        headers = cells.map((h) => h.toLowerCase())
        continue
      }
      const get = (...names) => {
        for (const n of names) {
          const idx = headers.findIndex((h) => h.includes(n))
          if (idx >= 0 && cells[idx]) return cells[idx]
        }
        return ''
      }
      const id = get('id')
      const tareaTxt = get('tarea', 'qué', 'que')
      if (!id && !tareaTxt) continue
      const estadoCell = get('estado')
      const estado =
        estadoDe(estadoCell) ||
        hintEstado ||
        (hintEsperaOmar ? 'LIBRE' : null) ||
        'LIBRE'
      meta.tareas.push({
        id: id || '—',
        area: get('área', 'area', 'carril'),
        prioridadRaw: get('prio', 'prioridad'),
        prioridad: prioridadDe(get('prio', 'prioridad', 'estado')),
        titulo: tareaTxt || get('nota', 'descripción', 'descripcion'),
        estado,
        agente: get('agente', 'dueño', 'dueno', 'owner'),
        rama: (get('agente', 'rama', 'branch').match(/`?([\w./-]*\/[\w./-]+)`?/) || [])[1] || '',
        espera: hintEsperaOmar ? (get('espera') || 'Omar') : get('espera'),
        origen: get('origen', 'fuente'),
      })
    }
  }

  meta.protocolo = protoLines.join('\n').trim()
  return meta
}

function parseLanes(content) {
  if (!content) return []
  const c = limpiar(content)
  const out = []
  let headers = null
  for (const line of c.split('\n')) {
    if (!line.trim().startsWith('|')) { headers = headers && out.length ? null : headers; continue }
    const cells = splitRow(line)
    if (isSep(cells)) continue
    if (!headers) { headers = cells.map((h) => h.toLowerCase()); continue }
    const get = (...names) => {
      for (const n of names) {
        const idx = headers.findIndex((h) => h.includes(n))
        if (idx >= 0) return cells[idx] || ''
      }
      return ''
    }
    const area = get('área', 'area', 'carril')
    if (!area) continue
    out.push({
      area,
      estado: estadoDe(get('estado'), 'LIBRE'),
      dueno: get('dueño', 'dueno', 'owner'),
      rama: (get('rama', 'branch').match(/`?([\w./-]+)`?/) || [])[1] || '',
      nota: get('nota'),
    })
  }
  return out
}

// ---------------------------------------------------------------- html
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]))
const slug = (s) => String(s || 'sin').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

function linkify(s) {
  let t = esc(String(s ?? ''))
  t = t.replace(/(^|[\s(])#(\d{1,4})(?!\d)/g,
    (_, p, n) => `${p}<a class="pr" href="${REPO}/pull/${n}" target="_blank" rel="noopener">#${n}</a>`)
  t = t.replace(/\b((?:docs|src|supabase|tools|apps|scripts|openspec)\/[\w./@-]+|\.github\/[\w./-]+)/g,
    '<code>$1</code>')
  return t
}

const COLS = [
  { k: 'LIBRE', label: 'Libre', hint: 'para tomar' },
  { k: 'EN-CURSO', label: 'En curso', hint: 'reclamada' },
  { k: 'EN-REVIEW', label: 'En review', hint: 'PR abierto, espera merge' },
  { k: 'CERRADA', label: 'Cerrada', hint: 'mergeada / hecha' },
]

function cardHtml(t) {
  const prio = t.prioridadRaw
    ? `<span class="prio prio-${t.prioridad}">${esc(t.prioridadRaw)}</span>` : ''
  const area = t.area ? `<span class="chip chip-area area-${slug(t.area)}">${esc(t.area)}</span>` : ''
  const agente = t.agente ? `<span class="chip chip-agente">${esc(t.agente.replace(/\s*`[^`]*`\s*/g, '').trim() || t.agente)}</span>` : ''
  const rama = t.rama ? `<span class="chip chip-rama">⎇ ${esc(t.rama)}</span>` : ''
  const espera = t.espera ? `<div class="espera">⏳ espera: ${linkify(t.espera)}</div>` : ''
  const origen = t.origen ? `<span class="chip chip-origen">${esc(t.origen)}</span>` : ''
  return `<article class="card estado-${slug(t.estado)}" data-area="${slug(t.area)}" data-prio="${t.prioridad}">
    <header><span class="tid">${esc(t.id)}</span>${prio}${area}</header>
    <p class="titulo">${linkify(t.titulo)}</p>
    ${espera}
    <footer>${agente}${rama}${origen}</footer>
  </article>`
}

function lanesHtml(lanes, progreso) {
  const laneRow = (l) => `<div class="lane lane-${slug(l.estado)}">
    <span class="lane-area">${esc(l.area)}</span>
    <span class="lane-estado">${esc(l.estado)}</span>
    ${l.dueno ? `<span class="lane-dueno">${esc(l.dueno)}</span>` : ''}
    ${l.rama ? `<span class="lane-rama">⎇ ${esc(l.rama)}</span>` : ''}
  </div>`
  const progRow = (p) => `<div class="lane lane-${slug(p.estado)}" title="${esc(p.resumen)}">
    <span class="lane-area">${esc(p.id)}</span>
    <span class="lane-estado">${esc(p.estado)}</span>
    ${p.agente ? `<span class="lane-dueno">${esc(p.agente)}</span>` : ''}
    ${p.rama ? `<span class="lane-rama">⎇ ${esc(p.rama)}</span>` : ''}
    <span class="lane-when">${esc(String(p.updated_at || '').slice(5, 16))}</span>
  </div>`
  const laneBlock = lanes.length
    ? `<h3>Carriles · <code>${esc(LANES_TOPIC)}</code> <small>candado por área (SOI-MAP)</small></h3>
       <div class="lanes-grid">${lanes.map(laneRow).join('')}</div>`
    : ''
  const progBlock = progreso.length
    ? `<h3>Actividad de agentes <small>derivada de <code>tablero/&lt;id&gt;/progress</code> — a prueba de clobber</small></h3>
       <div class="lanes-grid">${progreso.map(progRow).join('')}</div>`
    : ''
  if (!laneBlock && !progBlock) return ''
  return `<section class="lanes">${laneBlock}${progBlock}</section>`
}

// ---------------------------------------------------------------- instrucciones para agentes
const AGENT_PROMPT = `Sos un agente del equipo SOI. Vas a tomar UNA tarea del backlog de reparaciones,
analizarla contra el código real y resolverla, siguiendo el protocolo SOI-MAP.

Proyecto Engram: soi_elsistemapc  (SIEMPRE ese; nunca la raíz)
Tu identidad fija para firmar y para los carriles: <TU-NOMBRE>   (ej: Claude-Code | AI-Anti | AI-Codex)

━━━ PASO 0 · LEER (obligatorio, en este orden) ━━━
Usá mem_get_observation para el texto completo (mem_search / MCP truncan):
  1. mem_search "coordination/soi-multi-agent-protocol"  → el protocolo. Leelo entero.
  2. mem_search "coordination/lanes"                      → quién tiene cada ÁREA ahora.
  3. mem_search "tablero/reparaciones"                    → el backlog: el QUÉ hay que hacer.
Si tu tarea sale de una auditoría, leé también su topic fuente (ver tabla de topic_keys).

━━━ PASO 1 · ELEGIR ━━━
Tomá la tarea LIBRE de mayor prioridad cuya ÁREA esté LIBRE en coordination/lanes.
  · Si el área está EN-CURSO / EN-REVIEW por otro agente → NO la toques. Elegí otra.
  · Si la tarea dice "espera Omar" → no es tomable.
  · Área INTEGRACIÓN (src/lib/*, adminPortalShell, allRegistrars, vite.config, *.html,
    migraciones, CI, tareasApi*) → solo si está 100% LIBRE y nadie toca shared/core en paralelo.
  · Si no queda ninguna tarea tomable → PARÁ y reportá. No inventes trabajo.

━━━ PASO 2 · RECLAMAR ━━━
NO edites coordination/lanes con una nota (el upsert de Engram pisa toda la tabla).
En su lugar: mem_save en TU topic  tablero/<id-tarea>/progress  con:
    "<id> EN-CURSO [<TU-NOMBRE>/<AAAA-MM-DD>]. Rama: <rama>. Plan: <2-3 líneas>."
El coordinador (Claude-Code) consolida coordination/lanes.

━━━ PASO 3 · AISLAR ━━━
Trabajá en TU worktree (nunca en el checkout principal, que suele estar sucio):
    git worktree add ../soi-<tu-nombre>-<id>  feat/planificacion-clases-rediseño
    cd ../soi-<tu-nombre>-<id>
    git switch -c <tu-nombre>/<id>-<slug>
Base SIEMPRE feat/planificacion-clases-rediseño  (NO master: está congelada).
Si NO podés crear rama/worktree (permisos, repo bloqueado) → reportá y PARÁ. No fuerces
(no stash, no reset, no borrar locks — hay trabajo de otros sin commitear).

━━━ PASO 4 · ANALIZAR ━━━
Leé los archivos de la tarea. Confirmá el diagnóstico del backlog con el código real
(grep exhaustivo, no asumas). Verificá contra la BD viva si aplica (solo lectura).
Si el cambio supera ~400 líneas o toca varias áreas → partilo en slices y hacé solo el slice 1.

━━━ PASO 5 · RESOLVER ━━━
  · SOLO archivos del ÁREA de tu tarea. Nada compartido fuera de tu carril.
  · Si el repo tiene tests que corren (vitest): TDD — test que falla → fix → test verde.
  · Corré lint sobre lo que tocaste.
  · NADA destructivo en BD (DROP/DDL) ni cambio de comportamiento en prod sin
    Decisión + Dueño registrados por Omar.
  · Seguí las convenciones del repo (ej. docs/UI_THEME_IMPLEMENTATION_STANDARD_V9.md para UI).

━━━ PASO 6 · ENTREGAR ━━━
  1. mem_save en tablero/<id>/progress: qué hiciste, archivos, hallazgos/gotchas, qué falta.
  2. commit(s) con mensaje claro (Co-Authored-By si aplica).
  3. git push  +  abrí PR contra feat/planificacion-clases-rediseño.
  4. Actualizá tablero/<id>/progress → "EN-REVIEW · PR #<n>".
NADIE mergea. Omar es el único integrador.

━━━ PASO 7 · SIGUIENTE ━━━
Volvé al PASO 1. Repetí hasta que no queden tareas tomables, entonces PARÁ y reportá.

━━━ PARÁ Y REPORTÁ SI ━━━
  · no quedan tareas tomables · no podés crear rama/worktree · una tarea necesita
    decisión de Omar · un fix requiere tocar otra área · un test que estaba verde se rompe.

━━━ REGLAS DE ORO (SOI-MAP) ━━━
  · Un área, un dueño a la vez.   · Cada agente su rama.   · Nadie mergea a master.
  · Antes de inventar un concepto, buscá en Engram si ya existe. Conectar, no duplicar.
  · Guardá tu avance en TU topic tablero/<id>/progress, nunca pisando coordination/lanes.`

const TOPIC_KEYS = [
  ['coordination/soi-multi-agent-protocol', 'El protocolo. Cómo coexisten los agentes sin pisarse. LEER PRIMERO.', 'nadie (referencia)'],
  ['coordination/lanes', 'Candado por ÁREA: quién trabaja qué ahora (LIBRE/EN-CURSO/EN-REVIEW).', 'solo el coordinador (Claude-Code)'],
  ['tablero/reparaciones', 'El backlog: la lista de QUÉ hay que arreglar, con área y prioridad.', 'solo el coordinador'],
  ['tablero/&lt;id&gt;/progress', 'Tu bitácora de la tarea &lt;id&gt; (ej. tablero/lc1/progress). Uno por agente/tarea.', 'el agente que toma esa tarea'],
  ['coordination/bloqueo-git-2026-09-09', 'Bloqueos de entorno conocidos (repo sucio, ACL de Codex).', 'coordinador'],
  ['audit/soi-lila-2026-09', 'Hallazgos de la auditoría "lila" — fuente de las tareas LC* / LA*.', '(archivo)'],
  ['audit/ausentismo-dashboard-2026-09', 'Los 34 hallazgos del dashboard de ausentismo — fuente de AUS1.', '(archivo)'],
  ['fase-0/tablas-vacias-inventario', 'Inventario de las 122 tablas vacías de la BD (FASE 0).', '(archivo)'],
]

function instruccionesHtml() {
  const rows = TOPIC_KEYS.map(
    ([k, q, w]) => `<tr><td><code>${k}</code></td><td>${q}</td><td class="tk-who">${esc(w)}</td></tr>`,
  ).join('')
  return `<section class="instr">
  <details open>
    <summary>👥 Cómo trabaja el equipo de agentes (SOI-MAP)</summary>
    <div class="instr-body">
      <ol class="pasos">
        <li><b>Leer</b> — el agente lee, en orden: el protocolo, los carriles, el backlog. Siempre con <code>mem_get_observation</code> (las búsquedas truncan).</li>
        <li><b>Elegir</b> — toma la tarea LIBRE de mayor prioridad cuya <b>área</b> esté LIBRE. Si el área ya tiene dueño, elige otra. Si no hay ninguna: para y reporta.</li>
        <li><b>Reclamar</b> — escribe en <b>su propio</b> <code>tablero/&lt;id&gt;/progress</code> (NO en <code>coordination/lanes</code> — el upsert de Engram lo pisa). El coordinador consolida los carriles.</li>
        <li><b>Aislar</b> — crea su <b>worktree</b> y su <b>rama</b> desde <code>feat/planificacion-clases-rediseño</code>. Nunca trabaja en el checkout principal.</li>
        <li><b>Analizar</b> — confirma el diagnóstico del backlog contra el código real (grep, BD en solo lectura). Si es grande, lo parte en slices.</li>
        <li><b>Resolver</b> — solo archivos de su área. TDD si hay tests. Lint. Nada destructivo en BD sin OK de Omar.</li>
        <li><b>Entregar</b> — guarda progreso + commit + push + PR contra <code>feat/planificacion-clases-rediseño</code>. Marca su progress como <b>EN-REVIEW</b>. Nadie mergea: <b>Omar es el único integrador</b>.</li>
        <li><b>Repetir</b> — vuelve al paso 2 hasta que no queden tareas tomables.</li>
      </ol>
      <p class="instr-nota">Un área = un dueño a la vez. Cada agente su rama. Antes de crear un concepto nuevo, buscar en Engram si ya existe (conectar, no duplicar).</p>

      <h4>📌 Topic keys de Engram — qué leer y dónde escribir</h4>
      <div style="overflow-x:auto">
        <table class="tk">
          <thead><tr><th>topic_key</th><th>qué es</th><th>quién escribe</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>

      <h4>🤖 Prompt para pegar en un agente <button class="copy" data-copy="agent-prompt">copiar</button></h4>
      <p class="instr-nota">Reemplazá <code>&lt;TU-NOMBRE&gt;</code> por la identidad del agente (Claude-Code / AI-Anti / AI-Codex). El agente elige la tarea del backlog.</p>
      <pre id="agent-prompt" class="prompt">${esc(AGENT_PROMPT)}</pre>
    </div>
  </details>
</section>`
}

function render(meta, lanes, progreso, src) {
  const porEstado = Object.fromEntries(COLS.map((c) => [c.k, []]))
  const otras = []
  for (const t of meta.tareas) (porEstado[t.estado] || otras).push(t)

  const cuenta = (k) => porEstado[k]?.length || 0
  const total = meta.tareas.length
  const libres = porEstado['LIBRE'].filter((t) => !t.espera).length
  const esperaOmar = porEstado['LIBRE'].filter((t) => t.espera).length
  const areas = [...new Set(meta.tareas.map((t) => t.area).filter(Boolean))]

  // columna Cerrada: chips compactos (vienen del parrafo)
  const cerradasChips = meta.cerradas.length
    ? `<div class="cerradas">${[...new Set(meta.cerradas)].map((id) => `<span class="cchip">${esc(id)}</span>`).join('')}</div>`
    : ''

  const columnas = COLS.map((col) => {
    const items = porEstado[col.k]
    const body =
      col.k === 'CERRADA'
        ? (items.map(cardHtml).join('') + cerradasChips) || '<p class="vacio">—</p>'
        : items.map(cardHtml).join('') || '<p class="vacio">—</p>'
    const n = col.k === 'CERRADA' ? items.length + new Set(meta.cerradas).size : items.length
    return `<section class="col col-${slug(col.k)}">
      <h2>${col.label} <span class="n">${n}</span><small>${col.hint}</small></h2>
      <div class="col-body">${body}</div>
    </section>`
  }).join('')

  const omarHtml = meta.pendientesOmar.length
    ? `<details class="log" open><summary>Pendientes de Omar (${meta.pendientesOmar.length})</summary><ul>${
        meta.pendientesOmar.map((p) => `<li><span class="log-txt">${linkify(p)}</span></li>`).join('')
      }</ul></details>`
    : ''
  const otrasHtml = otras.length
    ? `<details class="log"><summary>Filas sin estado reconocido (${otras.length})</summary><ul>${
        otras.map((t) => `<li><span class="log-agente">${esc(t.id)}</span><span class="log-txt">${linkify(t.titulo)}</span></li>`).join('')
      }</ul></details>`
    : ''

  const updated = src.updated_at ? `rev ${src.revision_count ?? '?'} · ${esc(src.updated_at)} UTC` : 'desde archivo'
  const generado = new Date().toISOString().replace('T', ' ').slice(0, 19)

  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<title>Backlog SOI · ${esc(TOPIC)}</title>
<style>
/* modo oscuro forzado — pensado para escritorios nocturnos */
:root{
  color-scheme:dark;
  --bg:#0f1115;--panel:#171a21;--panel2:#1e222b;--line:#2a2f3a;--tx:#e6e8ec;--tx2:#9aa3b2;
  --alta:#ff5c5c;--media:#ffb020;--baja:#6b7280;--sin:#8b5cf6;
  --libre:#22c55e;--encurso:#38bdf8;--enreview:#a78bfa;--cerrada:#334155;
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--tx);font:14px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
a{color:inherit}
code{background:var(--panel2);border:1px solid var(--line);border-radius:4px;padding:.5px 4px;font-size:12px;word-break:break-all}
.pr{color:#25D366;text-decoration:none;font-weight:600}
header.top{position:sticky;top:0;z-index:5;background:var(--bg);padding:16px 20px 10px;border-bottom:1px solid var(--line)}
header.top h1{margin:0;font-size:16px}
header.top .sub{color:var(--tx2);font-size:12px;margin-top:3px}
.stats{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;font-size:12px}
.stats .s{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:6px 10px;display:flex;gap:6px;align-items:baseline}
.stats b{font-size:15px}
.filtros{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.filtros button{background:var(--panel);border:1px solid var(--line);color:var(--tx2);border-radius:999px;padding:4px 11px;font-size:12px;cursor:pointer}
.filtros button.on{color:var(--tx);border-color:var(--tx2)}
.lanes{margin:14px 20px 0}
.lanes h3{margin:14px 0 8px;font-size:13px;font-weight:600}
.lanes h3:first-child{margin-top:0}
.lane-when{color:var(--tx2);font-variant-numeric:tabular-nums;font-size:10px}
.lane-bloqueado .lane-estado{background:color-mix(in srgb,var(--alta) 22%,transparent);color:var(--alta)}
.lanes h3 small{color:var(--tx2);font-weight:400}
.lanes-grid{display:flex;gap:8px;flex-wrap:wrap}
.lane{background:var(--panel);border:1px solid var(--line);border-radius:9px;padding:6px 10px;font-size:11.5px;display:flex;gap:7px;align-items:center;flex-wrap:wrap}
.lane-area{font-weight:600}
.lane-estado{border-radius:999px;padding:0 7px;font-size:10px;font-weight:700}
.lane-libre .lane-estado{background:color-mix(in srgb,var(--libre) 22%,transparent);color:var(--libre)}
.lane-en-curso .lane-estado{background:color-mix(in srgb,var(--encurso) 22%,transparent);color:var(--encurso)}
.lane-en-review .lane-estado{background:color-mix(in srgb,var(--enreview) 22%,transparent);color:var(--enreview)}
.lane-dueno{color:var(--tx2)}
.lane-rama{color:var(--tx2);font-family:ui-monospace,Menlo,Consolas,monospace;font-size:10.5px}
main{display:grid;grid-template-columns:repeat(4,minmax(240px,1fr));gap:12px;padding:16px 20px;align-items:start;overflow-x:auto}
@media (max-width:1000px){main{grid-template-columns:repeat(2,1fr)}}
@media (max-width:620px){main{grid-template-columns:1fr}}
.col{background:var(--panel);border:1px solid var(--line);border-radius:12px;min-width:0}
.col h2{margin:0;padding:11px 13px;font-size:13px;display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--line)}
.col h2 small{color:var(--tx2);font-weight:400;font-size:11px;margin-left:auto}
.col h2 .n{background:var(--panel2);border-radius:999px;padding:0 8px;font-size:12px}
.col-libre h2{box-shadow:inset 3px 0 0 var(--libre)}
.col-en-curso h2{box-shadow:inset 3px 0 0 var(--encurso)}
.col-en-review h2{box-shadow:inset 3px 0 0 var(--enreview)}
.col-cerrada h2{box-shadow:inset 3px 0 0 var(--cerrada)}
.col-body{padding:10px;display:flex;flex-direction:column;gap:9px}
.vacio{color:var(--tx2);text-align:center;padding:14px 0;margin:0}
.card{background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:10px}
.card.estado-cerrada{opacity:.6}
.card header{display:flex;gap:5px;align-items:center;flex-wrap:wrap;margin-bottom:5px}
.tid{font-weight:700;font-size:12px}
.titulo{margin:2px 0 6px;font-size:12.5px}
.prio{font-size:10px;font-weight:700;border-radius:4px;padding:1px 5px;text-transform:uppercase}
.prio-alta{background:color-mix(in srgb,var(--alta) 22%,transparent);color:var(--alta)}
.prio-media{background:color-mix(in srgb,var(--media) 20%,transparent);color:var(--media)}
.prio-baja{background:color-mix(in srgb,var(--baja) 26%,transparent);color:var(--tx2)}
.prio-sin{display:none}
.chip{font-size:10px;border-radius:999px;padding:1px 7px;border:1px solid var(--line);color:var(--tx2)}
.chip-area{font-weight:600;color:var(--tx);background:var(--panel)}
.chip-agente{background:var(--panel);color:var(--tx)}
.chip-rama{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:9.5px}
.espera{font-size:11px;color:var(--media);margin:4px 0}
.card footer{display:flex;gap:5px;flex-wrap:wrap;margin-top:6px}
.cerradas{display:flex;flex-wrap:wrap;gap:4px}
.cchip{font-size:10px;border:1px solid var(--line);border-radius:6px;padding:1px 5px;color:var(--tx2)}
details.log{margin:8px 20px;background:var(--panel);border:1px solid var(--line);border-radius:12px}
details.log summary{padding:11px 14px;cursor:pointer;font-weight:600;font-size:13px}
details.log ul{list-style:none;margin:0;padding:0 14px 14px;display:flex;flex-direction:column;gap:6px}
details.log li{display:flex;gap:10px;font-size:12px;align-items:baseline;flex-wrap:wrap}
.log-agente{background:var(--panel2);border-radius:999px;padding:0 8px;font-size:11px}
.log-txt{color:var(--tx2);flex:1;min-width:200px}
details.intro{margin:8px 20px;background:var(--panel);border:1px solid var(--line);border-radius:12px}
details.intro summary{padding:11px 14px;cursor:pointer;font-weight:600;font-size:13px}
details.intro pre{margin:0;padding:0 14px 14px;white-space:pre-wrap;font-size:11.5px;color:var(--tx2);font-family:ui-monospace,Menlo,Consolas,monospace}
footer.pie{color:var(--tx2);font-size:11px;text-align:center;padding:20px}
.instr{margin:8px 20px}
.instr details{background:var(--panel);border:1px solid var(--line);border-radius:12px}
.instr summary{padding:12px 15px;cursor:pointer;font-weight:700;font-size:14px}
.instr-body{padding:4px 16px 18px}
.instr-body h4{margin:18px 0 8px;font-size:13px}
ol.pasos{margin:6px 0;padding-left:20px;display:flex;flex-direction:column;gap:5px;font-size:13px}
ol.pasos b{color:var(--tx)}
.instr-nota{color:var(--tx2);font-size:11.5px;margin:6px 0}
table.tk{border-collapse:collapse;width:100%;font-size:12px}
table.tk th,table.tk td{border:1px solid var(--line);padding:5px 8px;text-align:left;vertical-align:top}
table.tk th{background:var(--panel2);font-size:11px;color:var(--tx2)}
table.tk td.tk-who{color:var(--tx2);white-space:nowrap}
pre.prompt{background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:12px;font-size:11.5px;line-height:1.45;white-space:pre-wrap;overflow-x:auto;font-family:ui-monospace,Menlo,Consolas,monospace;max-height:420px;overflow-y:auto}
button.copy{background:var(--panel2);border:1px solid var(--line);color:var(--tx2);border-radius:6px;padding:2px 9px;font-size:11px;cursor:pointer;margin-left:6px;vertical-align:middle}
button.copy.ok{color:var(--libre);border-color:var(--libre)}
</style></head><body>
<header class="top">
  <h1>🗂️ ${esc(meta.titulo || src.title || TOPIC)}</h1>
  <div class="sub">${esc(TOPIC)} · ${updated} · generado ${generado}</div>
  <div class="stats">
    <div class="s"><b style="color:var(--libre)">${libres}</b> tomables</div>
    <div class="s"><b style="color:var(--media)">${esperaOmar}</b> esperan a Omar</div>
    <div class="s"><b>${cuenta('EN-CURSO')}</b> en curso</div>
    <div class="s"><b>${cuenta('EN-REVIEW')}</b> en review</div>
    <div class="s"><b>${total}</b> tareas activas</div>
  </div>
  <div class="filtros" id="filtros">
    <button data-f="all" class="on">Todas</button>
    ${areas.map((a) => `<button data-f="area:${slug(a)}">${esc(a)}</button>`).join('')}
    <button data-f="prio:alta">Solo ALTA</button>
  </div>
</header>
${lanesHtml(lanes, progreso)}
<main id="board">${columnas}</main>
${instruccionesHtml()}
${omarHtml}
${otrasHtml}
<details class="intro"><summary>Protocolo / reglas del backlog (SOI-MAP)</summary><pre>${esc(meta.protocolo)}</pre></details>
<footer class="pie">Fuente: Engram · <code>${esc(DB_PATH)}</code> · topics <code>${esc(TOPIC)}</code> + <code>${esc(LANES_TOPIC)}</code>. Re-ejecutá <code>node tools/tablero/tablero.mjs</code> (o <code>--watch</code>) para refrescar.</footer>
<script>
const board=document.getElementById('board');
document.getElementById('filtros').addEventListener('click',(e)=>{
  const b=e.target.closest('button'); if(!b)return;
  document.querySelectorAll('#filtros button').forEach(x=>x.classList.toggle('on',x===b));
  const f=b.dataset.f;
  board.querySelectorAll('.card').forEach(c=>{
    let show=true;
    if(f.startsWith('area:')) show=c.dataset.area===f.split(':')[1];
    else if(f.startsWith('prio:')) show=c.dataset.prio===f.split(':')[1];
    c.style.display=show?'':'none';
  });
});
document.querySelectorAll('button.copy').forEach(b=>{
  b.addEventListener('click',async()=>{
    const el=document.getElementById(b.dataset.copy); if(!el)return;
    try{ await navigator.clipboard.writeText(el.innerText); }
    catch(_){ const r=document.createRange(); r.selectNode(el); getSelection().removeAllRanges(); getSelection().addRange(r); document.execCommand('copy'); getSelection().removeAllRanges(); }
    const t=b.textContent; b.textContent='copiado ✓'; b.classList.add('ok');
    setTimeout(()=>{ b.textContent=t; b.classList.remove('ok'); },1500);
  });
});
${WATCH ? "setTimeout(()=>location.reload(), 15000);" : ''}
</script>
</body></html>`
}

// ---------------------------------------------------------------- run
function build() {
  const { src, lanesContent, progreso } = FILE ? fromFile() : fromDb()
  const meta = parseBacklog(src.content)
  const lanes = parseLanes(lanesContent)
  const prog = parseProgreso(progreso)
  writeFileSync(OUT, render(meta, lanes, prog, src))
  console.log(
    `ok ${OUT}  (${meta.tareas.length} tareas, ${meta.cerradas.length} cerradas, ${lanes.length} carriles, ${prog.length} progress)`,
  )
  return OUT
}

function abrir(p) {
  const isWin = process.platform === 'win32'
  const cmd = isWin ? 'cmd' : process.platform === 'darwin' ? 'open' : 'xdg-open'
  const args = isWin ? ['/c', 'start', '', p] : [p]
  spawn(cmd, args, { stdio: 'ignore', detached: true }).unref()
}

try {
  const out = build()
  if (OPEN) abrir(out)
  if (WATCH) {
    console.log('watch: regenerando cada 15s (Ctrl+C para salir)')
    setInterval(() => { try { build() } catch (e) { console.error('watch:', e.message) } }, 15000)
  }
} catch (e) {
  console.error('x', e.message)
  process.exit(1)
}
