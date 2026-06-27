/**
 * hermesConsultaView.js — Capa de consulta de Hermes (SP-5).
 *
 * El Director pregunta en lenguaje natural sobre el estado de la operación.
 * Hermes clasifica la INTENCIÓN de forma determinística (keywords, sin LLM) y responde
 * SIEMPRE con datos reales agregados (fn_hermes_consulta_estado + getProcedimientos).
 * No hay generación libre → respuestas factuales, sin alucinación, sin costo de tokens.
 *
 * @param {HTMLElement} container
 */

import '../styles/tareas.css'
import * as tareasApi from '../api/tareasApi.js'

const DEPARTAMENTOS = {
  DIR: 'Dirección', ACM: 'Académica', ADM: 'Administración', FIN: 'Financiero',
  LOG: 'Logística', COM: 'Comunicaciones', TECNICO: 'Técnico', LUT: 'Lutería',
}
const SUGERENCIAS = [
  '¿Cómo va la operación en general?',
  '¿Qué departamentos tienen tareas pendientes?',
  '¿Qué casos requieren atención inmediata?',
  '¿Cómo va la reinscripción?',
]

const state = { snapshot: null, procedimientos: [], historial: [] }

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}
function norm(s) {
  return String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export async function renderHermesConsultaView(container) {
  const ac = new AbortController()
  try {
    ;[state.snapshot, state.procedimientos] = await Promise.all([
      tareasApi.getConsultaEstado(),
      tareasApi.getProcedimientos(),
    ])
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger m-3">No pude consultar el estado: ${esc(err.message)}</div>`
    return { teardown: () => ac.abort() }
  }

  render(container)

  const enviar = () => {
    const input = container.querySelector('#hermes-q')
    const q = input.value.trim()
    if (!q) return
    state.historial.push({ rol: 'user', texto: q })
    state.historial.push({ rol: 'hermes', html: responder(q) })
    input.value = ''
    render(container)
    const log = container.querySelector('#hermes-log')
    if (log) log.scrollTop = log.scrollHeight
  }

  container.addEventListener('click', (e) => {
    if (e.target.closest('#hermes-send')) enviar()
    const chip = e.target.closest('.hermes-sug')
    if (chip) {
      container.querySelector('#hermes-q').value = chip.dataset.q
      enviar()
    }
  }, { signal: ac.signal })

  container.addEventListener('keydown', (e) => {
    if (e.target.id === 'hermes-q' && e.key === 'Enter') { e.preventDefault(); enviar() }
  }, { signal: ac.signal })

  return { teardown: () => ac.abort() }
}

// ─── Clasificación determinística + respuesta factual ─────────────────────────
function responder(pregunta) {
  const q = norm(pregunta)
  const s = state.snapshot

  // 1) Atención inmediata / bloqueos / urgencias / críticos
  if (/(atencion|inmediat|urgent|bloque|critic|riesgo|priorid)/.test(q)) {
    const items = s.atencion_inmediata || []
    if (items.length === 0) return `<p>✅ No hay tareas bloqueadas ni críticas abiertas. Nada requiere atención inmediata.</p>`
    return `<p><strong>${items.length}</strong> tarea(s) requieren atención inmediata:</p><ul class="mb-0">` +
      items.map((t) => `<li><span class="badge bg-${t.estado === 'bloqueada' ? 'danger' : 'warning text-dark'} me-1">${esc(t.estado)}</span>
        <strong>${esc(DEPARTAMENTOS[t.departamento] || t.departamento)}</strong> — ${esc(t.titulo)}</li>`).join('') + '</ul>'
  }

  // 2) Pendientes por departamento
  if (/(pendient|departament|quien|quienes|cargad|saturad)/.test(q)) {
    const deptos = (s.por_departamento || []).filter((d) => d.abiertas > 0)
    if (deptos.length === 0) return `<p>No hay tareas abiertas en ningún departamento.</p>`
    return `<p>Tareas abiertas por departamento:</p><ul class="mb-0">` +
      deptos.map((d) => `<li><strong>${esc(DEPARTAMENTOS[d.departamento] || d.departamento)}</strong>: ${d.abiertas} abiertas
        (${d.pendientes} pendientes${d.bloqueadas > 0 ? `, <span class="text-danger">${d.bloqueadas} bloqueadas</span>` : ''})</li>`).join('') + '</ul>'
  }

  // 3) Procedimiento específico (busca por keyword en el título del caso)
  const palabras = q.split(/\s+/).filter((w) => w.length >= 4 &&
    !['como','va','van','esta','estan','sobre','para','proceso','procedimiento','caso'].includes(w))
  if (/(como va|como van|proceso|procedimiento|caso|estado de)/.test(q) && palabras.length > 0) {
    const matches = state.procedimientos.filter((p) => {
      const t = norm(p.titulo_muestra)
      return palabras.some((w) => t.includes(w))
    })
    if (matches.length > 0) {
      return `<p>Encontré ${matches.length} procedimiento(s) relacionados:</p><ul class="mb-0">` +
        matches.slice(0, 8).map((p) => `<li><strong>${p.pct_avance}%</strong> — ${esc(p.titulo_muestra)}
          <span class="text-muted">(${p.completadas}/${p.total} tareas${p.bloqueadas > 0 ? `, ${p.bloqueadas} bloqueadas` : ''})</span></li>`).join('') + '</ul>'
    }
    // sin match: cae al resumen general
  }

  // 4) Resumen general (default)
  const t = s.tareas
  const abiertas = t.pendiente + t.en_progreso + t.bloqueada + t.observada
  return `<p>Estado general de la operación:</p>
    <ul class="mb-0">
      <li><strong>${s.total_procedimientos}</strong> procedimientos en el sistema</li>
      <li><strong>${t.total}</strong> tareas — ${abiertas} abiertas, ${t.completada} completadas</li>
      <li>Pendientes: ${t.pendiente} · En progreso: ${t.en_progreso}
        ${t.bloqueada > 0 ? `· <span class="text-danger">Bloqueadas: ${t.bloqueada}</span>` : ''}
        ${t.observada > 0 ? `· <span class="text-warning">Observadas: ${t.observada}</span>` : ''}</li>
    </ul>`
}

function render(container) {
  const mensajes = state.historial.length === 0
    ? `<div class="text-muted text-center py-4">
         <i class="bi bi-robot fs-1"></i>
         <p class="mt-2 mb-0">Preguntale a Hermes sobre el estado de la operación.</p>
       </div>`
    : state.historial.map((m) => m.rol === 'user'
        ? `<div class="d-flex justify-content-end mb-2"><div class="p-2 px-3 rounded bg-primary text-white" style="max-width:80%">${esc(m.texto)}</div></div>`
        : `<div class="d-flex justify-content-start mb-3"><div class="p-2 px-3 rounded bg-light border" style="max-width:90%"><div class="small text-muted mb-1"><i class="bi bi-robot"></i> Hermes</div>${m.html}</div></div>`
      ).join('')

  container.innerHTML = `
    <div class="p-3 p-md-4" style="max-width:900px;margin:0 auto">
      <h3 class="mb-1"><i class="bi bi-robot me-2"></i>Consultar a Hermes</h3>
      <p class="text-muted small">Respuestas factuales desde el estado real — sin generación libre.</p>

      <div class="mb-2 d-flex flex-wrap gap-2">
        ${SUGERENCIAS.map((s) => `<button class="btn btn-sm btn-outline-secondary hermes-sug" data-q="${esc(s)}">${esc(s)}</button>`).join('')}
      </div>

      <div id="hermes-log" class="border rounded p-3 mb-2 bg-white" style="height:380px;overflow-y:auto">
        ${mensajes}
      </div>

      <div class="input-group">
        <input id="hermes-q" type="text" class="form-control" placeholder="Escribí tu pregunta…" autocomplete="off" />
        <button id="hermes-send" class="btn btn-primary"><i class="bi bi-send"></i></button>
      </div>
    </div>`
}
