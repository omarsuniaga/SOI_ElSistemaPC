/**
 * buscadorView.js — Búsqueda de instrumentos vinculados al inventario.
 *
 * Conecta con el módulo de inventario para buscar instrumentos
 * y ver su historial de reparaciones en el taller.
 */

import '../styles/luteria.css'
import * as api from '../api/luteriaTallerApi.js'

const state = { instrumentos: [], busqueda: '', resultados: [], buscando: false }
let _abort = null

function escapeHTML(str) {
  if (!str) return ''
  const d = document.createElement('div')
  d.textContent = str
  return d.innerHTML
}

function formatFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' })
}

export async function renderBuscadorView(container) {
  _abort?.abort()
  _abort = new AbortController()

  container.innerHTML = `
    <div class="page-container luteria-portal">
      <div class="d-flex align-items-center gap-3 mb-3">
        <div class="brand-badge rounded-3 d-flex align-items-center justify-content-center"
          style="width:42px;height:42px;background:rgba(59,130,246,0.1);color:#2563eb">
          <i class="bi bi-search fs-4"></i>
        </div>
        <div>
          <h1 class="mb-0 h3">Buscador de Instrumentos</h1>
          <p class="text-muted small mb-0">Inventario e historial de reparaciones</p>
        </div>
      </div>

      <div class="row justify-content-center">
        <div class="col-lg-8 col-xl-6">
          <div class="input-group mb-3 shadow-sm rounded-3 overflow-hidden">
            <span class="input-group-text bg-white border-end-0">
              <i class="bi bi-search text-muted"></i>
            </span>
            <input type="text" class="form-control form-control-lg border-start-0 border-end-0"
              id="lut-buscador-input" placeholder="Buscar por ID, marca, modelo, serie, alumno..."
              value="${escapeHTML(state.busqueda)}" style="font-size:0.95rem">
            <span class="input-group-text bg-white border-start-0" id="lut-buscador-clear" style="cursor:pointer">
              <i class="bi bi-x-lg text-muted"></i>
            </span>
          </div>
          <div id="lut-buscador-results"></div>
        </div>
      </div>
    </div>
  `

  const input = container.querySelector('#lut-buscador-input')
  let debounceTimer
  input?.focus()
  input?.addEventListener('input', () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      state.busqueda = input.value.trim()
      if (state.busqueda.length >= 2) doSearch(container)
      else {
        container.querySelector('#lut-buscador-results').innerHTML = ''
        state.resultados = []
      }
    }, 300)
  })
  container.querySelector('#lut-buscador-clear')?.addEventListener('click', () => {
    state.busqueda = ''
    state.resultados = []
    if (input) { input.value = ''; input.focus() }
    container.querySelector('#lut-buscador-results').innerHTML = ''
  })

  return { teardown: () => _abort?.abort() }
}

async function doSearch(container) {
  const resultsEl = container.querySelector('#lut-buscador-results')
  if (state.buscando) return
  state.buscando = true
  resultsEl.innerHTML = `<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div> Buscando...</div>`

  try {
    const resultados = await api.buscarInstrumentos(state.busqueda)
    state.resultados = resultados
    state.buscando = false
    renderResults(resultsEl)
  } catch (err) {
    state.buscando = false
    resultsEl.innerHTML = `<div class="alert alert-danger py-2 small">${escapeHTML(err.message)}</div>`
  }
}

async function renderResults(resultsEl) {
  const r = state.resultados
  if (!r.length) {
    resultsEl.innerHTML = `<div class="text-center py-4 text-muted">
      <i class="bi bi-inbox fs-2 d-block mb-2"></i>No se encontraron instrumentos</div>`
    return
  }

  resultsEl.innerHTML = `
    <div class="small text-muted mb-2">${r.length} resultado${r.length !== 1 ? 's' : ''}</div>
    ${r.map((ins) => {
      const imageUrl = ins.imagen_url || null
      const ordenesActivas = (ins.ordenes_reparacion || []).filter((o) => !['entregado', 'cerrado', 'cancelado'].includes(o.estado))
      return `
        <div class="card mb-2 border shadow-sm lut-result-card">
          <div class="card-body p-3">
            <div class="d-flex gap-3">
              ${imageUrl
                ? `<div style="width:60px;height:60px;flex-shrink:0;border-radius:8px;overflow:hidden;background:#f0f0f0">
                     <img src="${escapeHTML(imageUrl)}" alt="" style="width:100%;height:100%;object-fit:cover">
                   </div>`
                : `<div style="width:60px;height:60px;flex-shrink:0;border-radius:8px;background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;color:#2563eb">
                     <i class="bi bi-music-note-beamed fs-4"></i>
                   </div>`
              }
              <div class="flex-grow-1 min-w-0">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 class="mb-0">${escapeHTML(ins.marca || '')} ${escapeHTML(ins.modelo || '')}</h6>
                    <p class="text-muted small mb-1">
                      ${escapeHTML(ins.tipo_instrumento || '')} · 
                      Serie: <code style="font-size:0.65rem">${escapeHTML(ins.numero_serie || '—')}</code> · 
                      ID: <code style="font-size:0.65rem">${escapeHTML(ins.id)}</code>
                    </p>
                  </div>
                  <div class="text-end" style="flex-shrink:0">
                    ${ins.alumno_nombre
                      ? `<span class="d-block small fw-semibold">${escapeHTML(ins.alumno_nombre)}</span><span class="d-block text-muted" style="font-size:0.6rem">${escapeHTML(ins.alumno_matricula || '')}</span>`
                      : '<span class="text-muted small">No asignado</span>'}
                  </div>
                </div>
                <div class="d-flex gap-2 flex-wrap mt-1">
                  ${ordenesActivas.length > 0
                    ? ordenesActivas.map((o) =>
                        `<a class="badge bg-warning-subtle text-warning text-decoration-none" href="#" data-nav-orden="${o.id}">
                          <i class="bi bi-tools me-1"></i>${o.id}
                        </a>`
                      ).join('')
                    : ins.ordenes_reparacion?.length > 0
                      ? '<span class="text-muted small">Última reparación: ' + formatFecha(ins.ultima_reparacion) + '</span>'
                      : '<span class="text-muted small">Sin historial de reparaciones</span>'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>`
    }).join('')}
  `

  resultsEl.querySelectorAll('[data-nav-orden]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault()
      window.router.navigate('lut-orden', { id: a.dataset.navOrden })
    })
  })
}
