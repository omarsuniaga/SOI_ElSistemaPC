/**
 * alianzasView.js — Panel de Alianzas Institucionales
 * Visualiza y gestiona contactos_alianzas: fundaciones, artistas, redes y aliados.
 * @param {HTMLElement} container
 * @param {object} [opciones]
 */
import { supabase } from '../../../lib/supabaseClient.js'
import { getAlianzas, updateEstadoAlianza } from '../api/alianzasApi.js'

const TIPO_LABELS = {
  fundacion: 'Fundación',
  artista: 'Artista',
  aliado_local: 'Aliado Local',
  gobierno: 'Gobierno',
  red: 'Red / Movimiento',
}

const TIPO_COLORS = {
  fundacion: 'primary',
  artista: 'warning',
  aliado_local: 'success',
  gobierno: 'secondary',
  red: 'info',
}

const TIPO_ICONS = {
  fundacion: 'bi-building',
  artista: 'bi-music-note-beamed',
  aliado_local: 'bi-geo-alt',
  gobierno: 'bi-bank',
  red: 'bi-diagram-3',
}

const ESTADO_LABELS = {
  prospecto: 'Prospecto',
  contactado: 'Contactado',
  respondio: 'Respondió',
  en_negociacion: 'En Negociación',
  convenio_activo: 'Activo',
  descartado: 'Descartado',
}

const ESTADO_COLORS = {
  prospecto: 'secondary',
  contactado: 'primary',
  respondio: 'info',
  en_negociacion: 'warning',
  convenio_activo: 'success',
  descartado: 'danger',
}

const ESTADOS_PIPELINE = [
  'prospecto', 'contactado', 'respondio', 'en_negociacion', 'convenio_activo', 'descartado',
]

let _abortController = null

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function estrellas(n) {
  const puntuacion = Math.min(5, Math.max(0, Number(n) || 0))
  return '⭐'.repeat(puntuacion) + '☆'.repeat(5 - puntuacion)
}

function safeWebsiteHref(website) {
  try {
    const url = new URL(website)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url
  } catch {
    return null
  }
}

function cardHTML(c) {
  const tipoBadge = `<span class="badge bg-${TIPO_COLORS[c.tipo] ?? 'secondary'} me-1">
    <i class="bi ${TIPO_ICONS[c.tipo] ?? 'bi-circle'} me-1"></i>${TIPO_LABELS[c.tipo] ?? c.tipo}
  </span>`

  const estadoBadge = `<span class="badge bg-${ESTADO_COLORS[c.estado] ?? 'secondary'}">
    ${ESTADO_LABELS[c.estado] ?? c.estado}
  </span>`

  const borradorBadge = c.email_draft_id
    ? `<span class="badge bg-success bg-opacity-75 ms-1" title="Borrador de email listo en Gmail">
        <i class="bi bi-envelope-check me-1"></i>Borrador listo
      </span>`
    : ''

  const emailLine = c.email_contacto
    ? `<div class="text-muted small mt-1"><i class="bi bi-envelope me-1"></i>${escapeHtml(c.email_contacto)}</div>`
    : ''

  const personaLine = c.persona_contacto
    ? `<div class="text-muted small"><i class="bi bi-person me-1"></i>${escapeHtml(c.persona_contacto)}</div>`
    : ''

  const statsOpts = ESTADOS_PIPELINE.map(e =>
    `<option value="${e}" ${c.estado === e ? 'selected' : ''}>${ESTADO_LABELS[e]}</option>`
  ).join('')

  const websiteUrl = c.website ? safeWebsiteHref(c.website) : null

  return `
    <div class="col-md-6 col-lg-4 mb-3" data-id="${c.id}" data-tipo="${c.tipo}" data-estado="${c.estado}" data-match="${c.puntuacion_match}">
      <div class="card h-100 shadow-sm border-0 alianza-card ${c.estado === 'convenio_activo' ? 'border-success border-start border-3' : ''}">
        <div class="card-body d-flex flex-column gap-2">
          <div class="d-flex justify-content-between align-items-start">
            <div class="fw-semibold" style="font-size:.95rem">${escapeHtml(c.nombre_institucion)}</div>
            <div class="text-nowrap ms-2" style="font-size:.8rem">${estrellas(c.puntuacion_match)}</div>
          </div>

          <div class="d-flex flex-wrap gap-1 align-items-center">
            ${tipoBadge}${estadoBadge}${borradorBadge}
          </div>

          ${c.area_enfoque ? `<div class="text-muted small">${escapeHtml(c.area_enfoque)}</div>` : ''}
          ${c.enfoque_geografico ? `<div class="text-muted small"><i class="bi bi-geo me-1"></i>${escapeHtml(c.enfoque_geografico)}</div>` : ''}
          ${emailLine}${personaLine}

          <div class="mt-auto pt-2">
            <select class="form-select form-select-sm estado-select" data-id="${c.id}">
              ${statsOpts}
            </select>
          </div>
        </div>
        ${websiteUrl ? `<div class="card-footer bg-transparent py-1">
          <a href="${escapeHtml(websiteUrl.href)}" target="_blank" rel="noopener" class="text-decoration-none small text-muted">
            <i class="bi bi-box-arrow-up-right me-1"></i>${escapeHtml(websiteUrl.hostname)}
          </a>
        </div>` : ''}
      </div>
    </div>`
}

function renderStats(todos) {
  const activos = todos.filter(c => c.estado === 'convenio_activo').length
  const prospectos = todos.filter(c => c.estado !== 'convenio_activo' && c.estado !== 'descartado').length
  const borradores = todos.filter(c => c.email_draft_id).length
  const match5 = todos.filter(c => c.puntuacion_match === 5 && c.estado !== 'convenio_activo').length
  return `
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="card border-0 bg-success bg-opacity-10 text-center py-3">
          <div class="fs-3 fw-bold text-success">${activos}</div>
          <div class="small text-muted">Alianzas activas</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card border-0 bg-primary bg-opacity-10 text-center py-3">
          <div class="fs-3 fw-bold text-primary">${prospectos}</div>
          <div class="small text-muted">Prospectos</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card border-0 bg-warning bg-opacity-10 text-center py-3">
          <div class="fs-3 fw-bold text-warning">${match5}</div>
          <div class="small text-muted">Match ⭐⭐⭐⭐⭐</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card border-0 bg-info bg-opacity-10 text-center py-3">
          <div class="fs-3 fw-bold text-info">${borradores}</div>
          <div class="small text-muted">Borradores Gmail</div>
        </div>
      </div>
    </div>`
}

function filtrar(todos, { tipo, estado, busqueda }) {
  return todos.filter(c => {
    if (tipo && tipo !== 'todos' && c.tipo !== tipo) return false
    if (estado && estado !== 'todos' && c.estado !== estado) return false
    if (busqueda) {
      const q = busqueda.toLowerCase()
      return (
        c.nombre_institucion?.toLowerCase().includes(q) ||
        c.area_enfoque?.toLowerCase().includes(q) ||
        c.enfoque_geografico?.toLowerCase().includes(q) ||
        c.notas?.toLowerCase().includes(q)
      )
    }
    return true
  })
}

function renderGrid(contactos) {
  if (!contactos.length) {
    return `<div class="text-center text-muted py-5">
      <i class="bi bi-search fs-2 d-block mb-2"></i>
      No hay contactos con estos filtros.
    </div>`
  }

  const activos = contactos.filter(c => c.estado === 'convenio_activo')
  const prospectos = contactos.filter(c => c.estado !== 'convenio_activo' && c.estado !== 'descartado')
  const descartados = contactos.filter(c => c.estado === 'descartado')

  let html = ''

  if (activos.length) {
    html += `<h6 class="text-success mb-3 mt-2"><i class="bi bi-patch-check-fill me-2"></i>Alianzas Activas (${activos.length})</h6>
    <div class="row">${activos.map(cardHTML).join('')}</div>`
  }

  if (prospectos.length) {
    // Agrupar por match score
    const porMatch = [5, 4, 3, 2, 1].reduce((acc, m) => {
      const grupo = prospectos.filter(c => c.puntuacion_match === m)
      if (grupo.length) acc.push({ match: m, items: grupo })
      return acc
    }, [])

    html += `<hr class="my-4"><h6 class="text-primary mb-3"><i class="bi bi-funnel me-2"></i>Pipeline de Prospectos</h6>`
    porMatch.forEach(({ match, items }) => {
      html += `<div class="d-flex align-items-center gap-2 mb-2">
        <span class="text-muted small fw-semibold">Match ${estrellas(match)}</span>
        <span class="badge bg-secondary rounded-pill">${items.length}</span>
      </div>
      <div class="row mb-3">${items.map(cardHTML).join('')}</div>`
    })
  }

  if (descartados.length) {
    html += `<details class="mt-3">
      <summary class="text-muted small cursor-pointer mb-2">Descartados (${descartados.length})</summary>
      <div class="row opacity-50">${descartados.map(cardHTML).join('')}</div>
    </details>`
  }

  return html
}

export async function renderAlianzasView(container, opciones = {}) {
  _abortController?.abort()
  _abortController = new AbortController()
  const { signal } = _abortController

  container.innerHTML = `
    <div class="container-fluid px-3 py-3">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 class="mb-0 fw-bold"><i class="bi bi-handshake me-2 text-primary"></i>Panel de Alianzas</h5>
          <div class="text-muted small">Fundaciones · Artistas · Redes · Aliados institucionales</div>
        </div>
      </div>

      <div id="alianzas-stats"></div>

      <div class="card border-0 shadow-sm mb-3">
        <div class="card-body py-2 px-3">
          <div class="row g-2 align-items-center">
            <div class="col-12 col-md-5">
              <input type="text" class="form-control form-control-sm" id="alianzas-busqueda"
                placeholder="Buscar institución, área, país...">
            </div>
            <div class="col-6 col-md-3">
              <select class="form-select form-select-sm" id="alianzas-filtro-tipo">
                <option value="todos">Todos los tipos</option>
                <option value="fundacion">Fundaciones</option>
                <option value="artista">Artistas</option>
                <option value="red">Redes / Movimientos</option>
                <option value="aliado_local">Aliados Locales</option>
                <option value="gobierno">Gobierno</option>
              </select>
            </div>
            <div class="col-6 col-md-4">
              <select class="form-select form-select-sm" id="alianzas-filtro-estado">
                <option value="todos">Todos los estados</option>
                <option value="convenio_activo">✅ Activos</option>
                <option value="prospecto">Prospectos</option>
                <option value="contactado">Contactados</option>
                <option value="respondio">Respondieron</option>
                <option value="en_negociacion">En Negociación</option>
                <option value="descartado">Descartados</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div id="alianzas-toast" class="position-fixed bottom-0 end-0 p-3" style="z-index:9999"></div>
      <div id="alianzas-grid"><div class="text-center py-5 text-muted">
        <div class="spinner-border spinner-border-sm me-2"></div>Cargando alianzas...
      </div></div>
    </div>`

  let todos = []
  let filtros = { tipo: 'todos', estado: 'todos', busqueda: '' }

  function toast(msg, tipo = 'success') {
    const el = container.querySelector('#alianzas-toast')
    if (!el) return
    el.innerHTML = `<div class="toast show align-items-center text-bg-${tipo} border-0" role="alert">
      <div class="d-flex">
        <div class="toast-body">${msg}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>`
    setTimeout(() => { el.innerHTML = '' }, 3000)
  }

  function renderTodo() {
    const visibles = filtrar(todos, filtros)
    const grid = container.querySelector('#alianzas-grid')
    if (grid) grid.innerHTML = renderGrid(visibles)

    // Bind estado selects
    container.querySelectorAll('.estado-select').forEach(sel => {
      sel.addEventListener('change', async (e) => {
        const id = e.target.dataset.id
        const nuevoEstado = e.target.value
        try {
          await updateEstadoAlianza(id, nuevoEstado)
          const idx = todos.findIndex(c => c.id === id)
          if (idx !== -1) todos[idx].estado = nuevoEstado
          renderTodo()
          toast(`Estado actualizado: <strong>${ESTADO_LABELS[nuevoEstado]}</strong>`)
        } catch (err) {
          toast(`Error al actualizar: ${escapeHtml(err.message)}`, 'danger')
          e.target.value = todos.find(c => c.id === id)?.estado ?? 'prospecto'
        }
      }, { signal })
    })
  }

  try {
    todos = await getAlianzas()
    const stats = container.querySelector('#alianzas-stats')
    if (stats) stats.innerHTML = renderStats(todos)
    renderTodo()
  } catch (err) {
    const grid = container.querySelector('#alianzas-grid')
    if (grid) grid.innerHTML = `<div class="alert alert-danger">Error cargando alianzas: ${escapeHtml(err.message)}</div>`
  }

  // Filtros
  container.querySelector('#alianzas-filtro-tipo')?.addEventListener('change', e => {
    filtros.tipo = e.target.value
    renderTodo()
  }, { signal })

  container.querySelector('#alianzas-filtro-estado')?.addEventListener('change', e => {
    filtros.estado = e.target.value
    renderTodo()
  }, { signal })

  let _debounce = null
  container.querySelector('#alianzas-busqueda')?.addEventListener('input', e => {
    clearTimeout(_debounce)
    _debounce = setTimeout(() => {
      filtros.busqueda = e.target.value.trim()
      renderTodo()
    }, 250)
  }, { signal })

  // Realtime
  const channel = supabase
    .channel('alianzas:panel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'contactos_alianzas' }, async () => {
      if (signal.aborted) return
      try {
        todos = await getAlianzas()
      } catch (err) {
        console.error('[AlianzasView] Realtime refresh error:', err.message)
        return
      }
      if (signal.aborted) return
      const stats = container.querySelector('#alianzas-stats')
      if (stats) stats.innerHTML = renderStats(todos)
      renderTodo()
    })
    .subscribe()

  return {
    teardown() {
      _abortController?.abort()
      channel.unsubscribe?.()
    },
  }
}
