import { supabase } from '../../../lib/supabaseClient.js'
import { router } from '../../../core/router/router.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import {
  getPerfil,
  confirmarPropuesta,
  descartarPropuesta,
  getPerfilSummary,
  getPerfilHistorial,
} from '../services/perfilConocimientoApi.js'

const DIMENSION_META = {
  habilidad: { label: 'Habilidades', icon: 'bi-star', color: 'primary' },
  repertorio: { label: 'Repertorio', icon: 'bi-music-note', color: 'success' },
  tecnica: { label: 'Técnica', icon: 'bi-tools', color: 'info' },
  problema: { label: 'Problemas', icon: 'bi-exclamation-triangle', color: 'danger' },
  objetivo: { label: 'Objetivos', icon: 'bi-bullseye', color: 'warning' },
}

const MADUREZ_LABEL = ['', 'Inicial', 'En desarrollo', 'Logrado', 'Avanzado', 'Destacado']

let _alumnoId = null
let _container = null
let _selectedHistorial = null

export async function renderPerfilAlumnoView(container, params = {}) {
  if (!container) return
  _container = container
  _alumnoId = params.alumnoId || _parseAlumnoId()

  if (!_alumnoId) {
    container.innerHTML = `<div class="page-container"><div class="alert alert-warning">No se especificó alumno (esperaba ?alumnoId=UUID).</div></div>`
    return
  }

  container.innerHTML = `
    <div class="page-container">
      <div class="d-flex align-items-center justify-content-center" style="min-height:300px;">
        <div class="spinner-border text-primary"></div>
      </div>
    </div>`
  await _load()
}

function _parseAlumnoId() {
  const hash = window.location.hash || ''
  const qsIdx = hash.indexOf('?')
  if (qsIdx === -1) return null
  const params = new URLSearchParams(hash.slice(qsIdx + 1))
  return params.get('alumnoId')
}

async function _load() {
  try {
    const [alumno, perfilResult, summary] = await Promise.all([
      supabase
        .from('alumnos')
        .select('id, nombre_completo, instrumento_principal, nivel_actual')
        .eq('id', _alumnoId)
        .single()
        .then((r) => r.data),
      getPerfil(_alumnoId),
      getPerfilSummary(_alumnoId),
    ])

    _render(alumno, perfilResult, summary)
  } catch (err) {
    console.error('[perfilAlumno]', err)
    _container.innerHTML = `
      <div class="page-container">
        <div class="alert alert-warning">
          Error al cargar el perfil: ${err.message}
        </div>
      </div>`
  }
}

function _dimColor(dimension) {
  return DIMENSION_META[dimension]?.color || 'secondary'
}

function _dimIcon(dimension) {
  return DIMENSION_META[dimension]?.icon || 'bi-tag'
}

function _dimLabel(dimension) {
  return DIMENSION_META[dimension]?.label || dimension
}

function _madurezBadge(madurez) {
  const colors = ['', 'bg-secondary', 'bg-info', 'bg-success', 'bg-primary', 'bg-warning text-dark']
  const label = MADUREZ_LABEL[madurez] || `Nivel ${madurez}`
  return `<span class="badge ${colors[madurez] || 'bg-secondary'}">${label}</span>`
}

function _estadoBadge(estado) {
  const map = {
    confirmado: 'bg-success-subtle text-success-emphasis',
    propuesto: 'bg-warning-subtle text-warning-emphasis',
    descartado: 'bg-secondary-subtle text-secondary-emphasis',
  }
  return `<span class="badge ${map[estado] || 'bg-secondary'}">${estado}</span>`
}

function _render(alumno, perfilResult, summary) {
  const grouped = perfilResult.grouped || {}
  const dimensions = Object.keys(grouped).sort()
  const allData = perfilResult.data || []

  const pending = allData.filter((a) => a.estado === 'propuesto')

  _container.innerHTML = `
    <div class="page-container">
      <!-- Header -->
      <div class="d-flex flex-wrap align-items-start justify-content-between mb-3">
        <div>
          <button class="btn btn-sm btn-outline-secondary mb-2" id="pf-btn-back">
            <i class="bi bi-arrow-left me-1"></i>Volver al Cockpit
          </button>
          <h4 class="fw-bold mb-1"><i class="bi bi-person-lines-fill me-2"></i>${alumno?.nombre_completo || 'Alumno'}</h4>
          <div class="text-muted small">
            ${alumno?.instrumento_principal || '—'} · Nivel ${alumno?.nivel_actual || '—'}
          </div>
        </div>
        <div class="text-end small">
          <div><strong>${summary.total}</strong> aserciones</div>
          <div><span class="text-success">${summary.confirmados}</span> confirmadas · <span class="text-warning">${summary.propuestos}</span> propuestas</div>
          <div class="text-muted" style="font-size:0.7rem;">${summary.dimensiones.length} dimensión${summary.dimensiones.length !== 1 ? 'es' : ''}</div>
        </div>
      </div>

      <!-- Pending proposals alert -->
      ${
        pending.length > 0
          ? `
      <div class="alert alert-warning py-2 small d-flex align-items-center justify-content-between mb-3">
        <span><i class="bi bi-lightbulb me-1"></i>${pending.length} propuesta${pending.length !== 1 ? 's' : ''} pendiente${pending.length !== 1 ? 's' : ''} de revisión</span>
        <button class="btn btn-sm btn-outline-warning" id="pf-scroll-pending">Revisar</button>
      </div>`
          : ''
      }

      <!-- Dimension cards -->
      <div class="row g-3">
        ${dimensions.map((dim) => _renderDimensionCard(dim, grouped[dim])).join('')}
        ${dimensions.length === 0 ? '<div class="col-12"><div class="card border-0 shadow-sm"><div class="card-body text-center text-muted py-5"><i class="bi bi-inbox fs-1 d-block mb-2"></i>Este alumno aún no tiene perfil de conocimiento.</div></div></div>' : ''}
      </div>
    </div>`

  _attachEvents(pending)
}

function _renderDimensionCard(dimension, assertions) {
  const meta = DIMENSION_META[dimension] || { label: dimension, icon: 'bi-tag', color: 'secondary' }
  const confirmados = assertions.filter((a) => a.estado === 'confirmado').length
  const propuestos = assertions.filter((a) => a.estado === 'propuesto').length

  const rows = assertions
    .sort((a, b) => {
      // Propuestos first, then by madurez desc
      if (a.estado === 'propuesto' && b.estado !== 'propuesto') return -1
      if (a.estado !== 'propuesto' && b.estado === 'propuesto') return 1
      return (b.madurez || 0) - (a.madurez || 0)
    })
    .map(
      (a) => `
    <div class="d-flex justify-content-between align-items-start py-2 px-3 border-bottom ${a.estado === 'propuesto' ? 'bg-warning bg-opacity-10' : ''}" data-perfil-id="${a.id}">
      <div class="flex-grow-1 me-2 overflow-hidden">
        <div class="small fw-semibold text-truncate">${a.item || '—'}</div>
        <div class="d-flex gap-2 align-items-center" style="font-size:0.72rem;">
          ${_madurezBadge(a.madurez)}
          <span>Confianza: ${Math.round((a.confianza || 0) * 100)}%</span>
          ${_estadoBadge(a.estado)}
          ${a.origen_obs_id ? `<span class="text-muted"><i class="bi bi-journal-text me-1"></i>Desde observación</span>` : ''}
        </div>
        ${a.evidencia_texto ? `<div class="text-muted mt-1 text-truncate" style="font-size:0.72rem;">“${a.evidencia_texto}”</div>` : ''}
      </div>
      <div class="d-flex gap-1 flex-shrink-0">
        ${
          a.estado === 'propuesto'
            ? `
          <button class="btn btn-sm btn-outline-success" data-confirmar="${a.id}" title="Confirmar"><i class="bi bi-check-lg"></i></button>
          <button class="btn btn-sm btn-outline-danger" data-descartar="${a.id}" title="Descartar"><i class="bi bi-x-lg"></i></button>
        `
            : ''
        }
        <button class="btn btn-sm btn-outline-secondary" data-historial="${a.id}" title="Ver historial de madurez"><i class="bi bi-clock-history"></i></button>
      </div>
    </div>`,
    )
    .join('')

  return `
    <div class="col-12 col-lg-6">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-header bg-light d-flex align-items-center justify-content-between">
          <span class="fw-semibold small">
            <i class="bi ${meta.icon} text-${meta.color} me-1"></i>${meta.label}
          </span>
          <span class="small text-muted">${confirmados} conf. · ${propuestos} prop.</span>
        </div>
        <div class="card-body p-0">
          ${rows}
        </div>
      </div>
    </div>`
}

function _attachEvents(pending) {
  const c = _container

  // Back button
  c.querySelector('#pf-btn-back')?.addEventListener('click', () =>
    router.navigate('pedagogico-cockpit'),
  )

  // Scroll to pending
  c.querySelector('#pf-scroll-pending')?.addEventListener('click', () => {
    const firstPending = c.querySelector('[data-perfil-id] .btn-outline-success')
    if (firstPending)
      firstPending
        .closest('[data-perfil-id]')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })

  // Confirmar propuesta
  c.querySelectorAll('[data-confirmar]').forEach((el) => {
    el.addEventListener('click', async () => {
      const id = el.dataset.confirmar
      try {
        await confirmarPropuesta(id)
        await _load()
      } catch (err) {
        console.error('[perfilAlumno] confirm error:', err)
        alert(`Error al confirmar: ${err.message}`)
      }
    })
  })

  // Descartar propuesta
  c.querySelectorAll('[data-descartar]').forEach((el) => {
    el.addEventListener('click', async () => {
      const id = el.dataset.descartar
      if (!confirm('¿Descartar esta propuesta?')) return
      try {
        await descartarPropuesta(id)
        await _load()
      } catch (err) {
        console.error('[perfilAlumno] descartar error:', err)
        alert(`Error al descartar: ${err.message}`)
      }
    })
  })

  // Historial
  c.querySelectorAll('[data-historial]').forEach((el) => {
    el.addEventListener('click', async () => {
      const id = el.dataset.historial
      await _openHistorialModal(id)
    })
  })
}

async function _openHistorialModal(perfilId) {
  try {
    const historial = await getPerfilHistorial(perfilId)

    const rows =
      historial.length > 0
        ? historial
            .map(
              (h) => `
        <tr>
          <td class="small">${new Date(h.created_at).toLocaleString('es-DO')}</td>
          <td class="text-center">${_madurezBadge(h.madurez_anterior)}</td>
          <td class="text-center">${_madurezBadge(h.madurez_nueva)}</td>
          <td class="small">${h.cambio_origen || '—'}</td>
          ${h.nota ? `<td class="small text-muted">${h.nota}</td>` : ''}
        </tr>`,
            )
            .join('')
        : '<tr><td colspan="5" class="text-center text-muted small py-3">Sin historial de cambios.</td></tr>'

    AppModal.open({
      title: 'Historial de madurez',
      size: 'lg',
      saveText: null,
      body: `
        <div class="table-responsive" style="max-height:400px;">
          <table class="table table-sm mb-0">
            <thead class="table-light small">
              <tr>
                <th>Fecha</th>
                <th class="text-center">Anterior</th>
                <th class="text-center">Nuevo</th>
                <th>Origen</th>
                <th>Nota</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`,
    })
  } catch (err) {
    console.error('[perfilAlumno] historial error:', err)
    alert(`Error al cargar historial: ${err.message}`)
  }
}
