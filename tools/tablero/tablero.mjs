#!/usr/bin/env node
/**
 * tablero.mjs — renderiza el tablero kanban de Engram como una pagina HTML estilizada.
 *
 * Lee (solo lectura) el observation de Engram con el topic_key dado desde
 * ~/.engram/engram.db, parsea el tablero ASCII y genera un HTML autocontenido.
 *
 * Uso:
 *   node tools/tablero/tablero.mjs                 # genera tools/tablero/tablero.html y lo abre
 *   node tools/tablero/tablero.mjs --no-open       # solo genera
 *   node tools/tablero/tablero.mjs --watch         # regenera cada 15s (vista en vivo)
 *   node tools/tablero/tablero.mjs --topic otro/topic
 *   node tools/tablero/tablero.mjs --file tablero.txt   # parsea un .txt en vez de la BD
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
const TOPIC = opt('topic', 'fase-0/tablero-tareas')
const DB_PATH = opt('db', path.join(os.homedir(), '.engram', 'engram.db'))
const OUT = opt('out', path.join(here, 'tablero.html'))
const FILE = opt('file')
const OPEN = !flag('no-open')
const WATCH = flag('watch')
const REPO = 'https://github.com/omarsuniaga/SOI_ElSistemaPC'

// ---------------------------------------------------------------- fuente
function fromDb() {
  if (!existsSync(DB_PATH)) throw new Error(`no existe la BD de Engram: ${DB_PATH}`)
  const db = new DatabaseSync(DB_PATH, { readOnly: true })
  const row = db
    .prepare(
      `SELECT id, title, content, topic_key, revision_count, updated_at
         FROM observations
        WHERE topic_key = ? AND deleted_at IS NULL
        ORDER BY updated_at DESC LIMIT 1`,
    )
    .get(TOPIC)
  db.close()
  if (!row) throw new Error(`no hay observation con topic_key="${TOPIC}"`)
  return { ...row, content: String(row.content) }
}

function fromFile() {
  return { id: null, title: TOPIC, content: readFileSync(FILE, 'utf8'), revision_count: null, updated_at: null }
}

// ---------------------------------------------------------------- parser
const ESTADOS = ['LIBRE', 'EN CURSO', 'PARCIAL', 'BLOQUEADO', 'HECHO']

function prioridadDe(txt) {
  if (!txt) return 'sin'
  const t = txt.toUpperCase()
  if (t.includes('ALTA')) return 'alta'
  if (t.includes('MEDIA')) return 'media'
  if (t.includes('BAJA')) return 'baja'
  return 'otro'
}

function limpiar(content) {
  let c = content.replace(/^#\d+\s+\[[^\]]*\]\s+.*\n/, '')
  const cierre = c.indexOf('╚') // ╚
  if (cierre >= 0) {
    const nl = c.indexOf('\n', cierre)
    c = nl >= 0 ? c.slice(0, nl) : c.slice(0, cierre)
  }
  return c
}

function parseTablero(content) {
  const c = limpiar(content)
  const lines = c.split('\n')
  const meta = { bloques: [], log: [], introTexto: '' }
  let bloque = null
  let sub = null
  let tarea = null
  let modo = 'intro'

  const pushTarea = () => { if (tarea && bloque) bloque.tareas.push(tarea); tarea = null }

  const reBloque = /^═+\s*BLOQUE\s+([A-Z0-9]+)\s*·\s*(.+?)\s*═+$/
  const reSub = /^-{2,}\s*(.+?)\s*-{2,}$/
  const reLog = /^─+\s*LOG\s*─+$/
  const reTarea = /^\[([A-Za-z0-9.-]+)\]\s*(?:\[([^\]]+)\]\s*)?(.*)$/
  const reEstado = new RegExp(`^\\s+(${ESTADOS.join('|')})\\b(.*)$`)

  for (const line of lines) {
    if (reLog.test(line)) { pushTarea(); modo = 'log'; continue }
    const mB = line.match(reBloque)
    if (mB) {
      pushTarea()
      bloque = { letra: mB[1], nombre: mB[2], tareas: [] }
      meta.bloques.push(bloque)
      sub = null
      modo = 'bloque'
      continue
    }
    if (modo === 'log') { if (line.trim()) meta.log.push(line.trim()); continue }

    const mS = line.match(reSub)
    if (mS && bloque) { pushTarea(); sub = mS[1]; continue }

    const mT = bloque && line.match(reTarea)
    if (mT) {
      pushTarea()
      tarea = {
        id: mT[1],
        prioridadRaw: mT[2] || '',
        prioridad: prioridadDe(mT[2]),
        titulo: mT[3].trim(),
        sub: sub || null,
        estado: null,
        estadoLinea: '',
        agente: null,
        fecha: null,
        entregable: null,
        notas: [],
      }
      continue
    }

    if (tarea) {
      const mE = line.match(reEstado)
      if (mE && !tarea.estado) {
        tarea.estado = mE[1]
        const resto = (mE[1] + mE[2]).trim()
        tarea.estadoLinea = resto
        const partes = resto.split('·').map((s) => s.trim()).filter(Boolean)
        if (partes[1]) tarea.agente = partes[1]
        const fp = resto.match(/\d{4}-\d{2}-\d{2}/)
        if (fp) tarea.fecha = fp[0]
        const ep = partes.slice(2).filter((p) => !/^\d{4}-\d{2}-\d{2}$/.test(p))
        if (ep.length) tarea.entregable = ep.join(' · ')
        continue
      }
      if (line.trim()) tarea.notas.push(line.trim())
      continue
    }
  }
  pushTarea()

  // 2a pasada: estado INLINE en la descripcion ("... LIBRE - parte de [LA7].")
  for (const b of meta.bloques) {
    for (const t of b.tareas) {
      if (t.estado) continue
      const texto = `${t.titulo}  ${t.notas.join('  ')}`
      const m = texto.match(new RegExp(`\\b(${ESTADOS.join('|')})\\b`))
      if (!m) continue
      t.estado = m[1]
      const cola = texto.slice(m.index)
      const fp = cola.match(/\d{4}-\d{2}-\d{2}/)
      if (fp) t.fecha = fp[0]
      const ag = cola.match(/·\s*([A-Za-zÀ-ſ][\wÀ-ſ .-]*?)\s*(?:·|$|\.|\d{4})/)
      if (ag && !t.agente) t.agente = ag[1].trim()
    }
  }

  const idxBloque = c.indexOf('BLOQUE')
  meta.introTexto = idxBloque > 0 ? c.slice(0, c.lastIndexOf('\n', idxBloque)).trim() : ''
  return meta
}

// ---------------------------------------------------------------- html
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]))

const slug = (s) => String(s || 'sin').toLowerCase().replace(/[^a-z]+/g, '-')

function linkify(s) {
  let t = esc(String(s ?? ''))
  // PR: "#NN" solo si va tras inicio / espacio / parentesis (evita chocar con &#39;)
  t = t.replace(/(^|[\s(])#(\d{1,4})(?!\d)/g,
    (_, p, n) => `${p}<a class="pr" href="${REPO}/pull/${n}" target="_blank" rel="noopener">#${n}</a>`)
  // rutas del repo -> <code>
  t = t.replace(/\b((?:docs|src|supabase|tools|apps|scripts|openspec)\/[\w./@-]+|\.github\/[\w./-]+)/g,
    '<code>$1</code>')
  return t
}

const COLS = [
  { k: 'LIBRE', label: 'Libre', hint: 'para tomar' },
  { k: 'EN CURSO', label: 'En curso', hint: 'reclamada' },
  { k: 'PARCIAL', label: 'Parcial', hint: 'sub-parte libre' },
  { k: 'BLOQUEADO', label: 'Bloqueado', hint: 'espera algo' },
  { k: 'HECHO', label: 'Hecho', hint: 'cerrada' },
]

function cardHtml(t) {
  const prioBadge = t.prioridadRaw
    ? `<span class="prio prio-${t.prioridad}">${esc(t.prioridadRaw)}</span>` : ''
  const agente = t.agente ? `<span class="chip chip-agente">${esc(t.agente)}</span>` : ''
  const fecha = t.fecha ? `<span class="chip chip-fecha">${esc(t.fecha)}</span>` : ''
  const bloque = `<span class="chip chip-bloque bloque-${t._bloque}">${esc(t._bloque)}</span>`
  const sub = t.sub ? `<span class="chip chip-sub">${esc(t.sub)}</span>` : ''
  const entregable = t.entregable ? `<div class="entregable">📦 ${linkify(t.entregable)}</div>` : ''
  const notas = t.notas.length
    ? `<div class="notas">${t.notas.map((n) => `<div>${linkify(n)}</div>`).join('')}</div>` : ''
  return `<article class="card estado-${slug(t.estado)}" data-bloque="${t._bloque}" data-prio="${t.prioridad}">
    <header><span class="tid">${esc(t.id)}</span>${prioBadge}${bloque}${sub}</header>
    <p class="titulo">${linkify(t.titulo)}</p>
    ${entregable}
    <footer>${agente}${fecha}</footer>
    ${notas}
  </article>`
}

function render(meta, src) {
  const tareas = []
  for (const b of meta.bloques) for (const t of b.tareas) { t._bloque = b.letra; tareas.push(t) }

  const porEstado = Object.fromEntries(COLS.map((c) => [c.k, []]))
  const sinEstado = []
  for (const t of tareas) {
    if (t.estado && porEstado[t.estado]) porEstado[t.estado].push(t)
    else sinEstado.push(t)
  }
  const cuenta = (k) => porEstado[k]?.length || 0
  const total = tareas.length
  const accionables = cuenta('LIBRE') + cuenta('PARCIAL')

  const columnas = COLS.map((col) => {
    const items = porEstado[col.k]
    return `<section class="col col-${slug(col.k)}">
      <h2>${col.label} <span class="n">${items.length}</span><small>${col.hint}</small></h2>
      <div class="col-body">${items.map(cardHtml).join('') || '<p class="vacio">—</p>'}</div>
    </section>`
  }).join('')

  const bloquesLeyenda = meta.bloques.map((b) =>
    `<span class="chip chip-bloque bloque-${b.letra}">${b.letra}</span> ${esc(b.nombre)}`).join(' &nbsp;·&nbsp; ')

  const logHtml = meta.log.map((l) => {
    const m = l.match(/^(\d{4}-\d{2}-\d{2})\s*·\s*([^·]+?)\s*·\s*(.+)$/)
    return m
      ? `<li><span class="log-fecha">${esc(m[1])}</span><span class="log-agente">${esc(m[2].trim())}</span><span class="log-txt">${linkify(m[3])}</span></li>`
      : `<li><span class="log-txt">${linkify(l)}</span></li>`
  }).join('')

  const updated = src.updated_at ? `rev ${src.revision_count ?? '?'} · ${esc(src.updated_at)} UTC` : 'desde archivo'
  const generado = new Date().toISOString().replace('T', ' ').slice(0, 19)
  const sinEstadoHtml = sinEstado.length
    ? `<details class="log"><summary>Sin estado reconocido (${sinEstado.length})</summary><ul>${sinEstado
        .map((t) => `<li><span class="log-agente">${esc(t.id)}</span><span class="log-txt">${linkify(t.titulo)}</span></li>`)
        .join('')}</ul></details>`
    : ''

  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Tablero · ${esc(TOPIC)}</title>
<style>
:root{
  --bg:#0f1115;--panel:#171a21;--panel2:#1e222b;--line:#2a2f3a;--tx:#e6e8ec;--tx2:#9aa3b2;
  --alta:#ff5c5c;--media:#ffb020;--baja:#6b7280;--otro:#8b5cf6;
  --libre:#22c55e;--encurso:#38bdf8;--parcial:#a78bfa;--bloqueado:#6b7280;--hecho:#334155;
  --A:#f59e0b;--B:#ef4444;--C:#25D366;
}
@media (prefers-color-scheme: light){
  :root{--bg:#f6f7f9;--panel:#fff;--panel2:#f0f2f5;--line:#e3e6ea;--tx:#1a1d23;--tx2:#5b6472}
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--tx);font:14px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
a{color:inherit}
code{background:var(--panel2);border:1px solid var(--line);border-radius:4px;padding:.5px 4px;font-size:12px;word-break:break-all}
.pr{color:var(--C);text-decoration:none;font-weight:600}
header.top{position:sticky;top:0;z-index:5;background:var(--bg);padding:16px 20px 10px;border-bottom:1px solid var(--line)}
header.top h1{margin:0;font-size:16px}
header.top .sub{color:var(--tx2);font-size:12px;margin-top:3px}
.stats{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;font-size:12px}
.stats .s{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:6px 10px;display:flex;gap:6px;align-items:baseline}
.stats b{font-size:15px}
.leyenda{color:var(--tx2);font-size:12px;margin-top:8px}
.filtros{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.filtros button{background:var(--panel);border:1px solid var(--line);color:var(--tx2);border-radius:999px;padding:4px 11px;font-size:12px;cursor:pointer}
.filtros button.on{color:var(--tx);border-color:var(--tx2)}
main{display:grid;grid-template-columns:repeat(5,minmax(240px,1fr));gap:12px;padding:16px 20px;align-items:start;overflow-x:auto}
@media (max-width:1100px){main{grid-template-columns:repeat(2,1fr)}}
@media (max-width:640px){main{grid-template-columns:1fr}}
.col{background:var(--panel);border:1px solid var(--line);border-radius:12px;min-width:0}
.col h2{margin:0;padding:11px 13px;font-size:13px;display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--line)}
.col h2 small{color:var(--tx2);font-weight:400;font-size:11px;margin-left:auto}
.col h2 .n{background:var(--panel2);border-radius:999px;padding:0 8px;font-size:12px}
.col-libre h2{box-shadow:inset 3px 0 0 var(--libre)}
.col-en-curso h2{box-shadow:inset 3px 0 0 var(--encurso)}
.col-parcial h2{box-shadow:inset 3px 0 0 var(--parcial)}
.col-bloqueado h2{box-shadow:inset 3px 0 0 var(--bloqueado)}
.col-hecho h2{box-shadow:inset 3px 0 0 var(--hecho)}
.col-body{padding:10px;display:flex;flex-direction:column;gap:9px}
.vacio{color:var(--tx2);text-align:center;padding:14px 0;margin:0}
.card{background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:10px}
.card.estado-hecho{opacity:.6}
.card header{display:flex;gap:5px;align-items:center;flex-wrap:wrap;margin-bottom:5px}
.tid{font-weight:700;font-size:12px}
.titulo{margin:2px 0 6px}
.prio{font-size:10px;font-weight:700;border-radius:4px;padding:1px 5px;text-transform:uppercase}
.prio-alta{background:color-mix(in srgb,var(--alta) 22%,transparent);color:var(--alta)}
.prio-media{background:color-mix(in srgb,var(--media) 20%,transparent);color:var(--media)}
.prio-baja{background:color-mix(in srgb,var(--baja) 26%,transparent);color:var(--tx2)}
.prio-otro{background:color-mix(in srgb,var(--otro) 22%,transparent);color:var(--otro)}
.chip{font-size:10px;border-radius:999px;padding:1px 7px;border:1px solid var(--line);color:var(--tx2)}
.chip-bloque{font-weight:700;border:none;color:#0b0d10}
.bloque-A{background:var(--A)}.bloque-B{background:var(--B)}.bloque-C{background:var(--C)}
.chip-agente{background:var(--panel);color:var(--tx)}
.entregable{font-size:11px;color:var(--tx2);margin:4px 0}
.card footer{display:flex;gap:5px;flex-wrap:wrap;margin-top:6px}
.notas{margin-top:7px;padding-top:7px;border-top:1px dashed var(--line);font-size:11.5px;color:var(--tx2);display:flex;flex-direction:column;gap:3px}
details.log,details.intro{margin:8px 20px;background:var(--panel);border:1px solid var(--line);border-radius:12px}
details.log summary,details.intro summary{padding:11px 14px;cursor:pointer;font-weight:600;font-size:13px}
details.log ul{list-style:none;margin:0;padding:0 14px 14px;display:flex;flex-direction:column;gap:6px}
details.log li{display:flex;gap:10px;font-size:12px;align-items:baseline;flex-wrap:wrap}
.log-fecha{color:var(--tx2);font-variant-numeric:tabular-nums}
.log-agente{background:var(--panel2);border-radius:999px;padding:0 8px;font-size:11px}
.log-txt{color:var(--tx2);flex:1;min-width:200px}
details.intro pre{margin:0;padding:0 14px 14px;white-space:pre-wrap;font-size:11.5px;color:var(--tx2);font-family:ui-monospace,Menlo,Consolas,monospace}
footer.pie{color:var(--tx2);font-size:11px;text-align:center;padding:20px}
</style></head><body>
<header class="top">
  <h1>🗂️ ${esc(src.title || TOPIC)}</h1>
  <div class="sub">${esc(TOPIC)} · ${updated} · generado ${generado}</div>
  <div class="stats">
    <div class="s"><b>${total}</b> tareas</div>
    <div class="s"><b style="color:var(--libre)">${accionables}</b> accionables</div>
    <div class="s"><b>${cuenta('EN CURSO')}</b> en curso</div>
    <div class="s"><b>${cuenta('BLOQUEADO')}</b> bloqueadas</div>
    <div class="s"><b>${cuenta('HECHO')}</b> hechas</div>
  </div>
  <div class="leyenda">${bloquesLeyenda}</div>
  <div class="filtros" id="filtros">
    <button data-f="all" class="on">Todos</button>
    ${meta.bloques.map((b) => `<button data-f="bloque:${b.letra}">Bloque ${b.letra}</button>`).join('')}
    <button data-f="prio:alta">Solo ALTA</button>
  </div>
</header>
<main id="board">${columnas}</main>
${sinEstadoHtml}
<details class="log" open><summary>LOG (${meta.log.length})</summary><ul>${logHtml}</ul></details>
<details class="intro"><summary>Protocolo / reglas del tablero</summary><pre>${esc(meta.introTexto)}</pre></details>
<footer class="pie">Fuente: Engram · ~/.engram/engram.db · topic <code>${esc(TOPIC)}</code>. Re-ejecuta <code>node tools/tablero/tablero.mjs</code> para refrescar.</footer>
<script>
const board=document.getElementById('board');
document.getElementById('filtros').addEventListener('click',(e)=>{
  const b=e.target.closest('button'); if(!b)return;
  document.querySelectorAll('#filtros button').forEach(x=>x.classList.toggle('on',x===b));
  const f=b.dataset.f;
  board.querySelectorAll('.card').forEach(c=>{
    let show=true;
    if(f.startsWith('bloque:')) show=c.dataset.bloque===f.split(':')[1];
    else if(f.startsWith('prio:')) show=c.dataset.prio===f.split(':')[1];
    c.style.display=show?'':'none';
  });
});
${WATCH ? "setTimeout(()=>location.reload(), 15000);" : ''}
</script>
</body></html>`
}

// ---------------------------------------------------------------- run
function build() {
  const src = FILE ? fromFile() : fromDb()
  const meta = parseTablero(src.content)
  const html = render(meta, src)
  writeFileSync(OUT, html)
  const n = meta.bloques.reduce((a, b) => a + b.tareas.length, 0)
  console.log(`ok ${OUT}  (${meta.bloques.length} bloques, ${n} tareas, ${meta.log.length} log)`)
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
