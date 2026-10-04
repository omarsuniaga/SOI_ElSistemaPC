/**
 * Alumnos críticos por ausentismo (ADM).
 * Lista de alumnos con ausencias sin justificar acumuladas. Nada se envía
 * automáticamente: el WhatsApp se abre solo con un clic explícito del admin.
 */
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { escapeHTML } from '../../../shared/utils/sanitize.js'
import {
  obtenerCriticos,
  justificarDiaCritico,
  filtrarCriticosPorInstrumento,
  renderPlantillaWhatsapp,
  enlaceWhatsappCritico,
  PLANTILLA_WHATSAPP_DEFAULT,
} from '../services/alumnosCriticosService.js'
import '../styles/ausentismo.css'

const state = { container: null, criticos: [], instrumento: '' }

export async function renderAlumnosCriticosView(container) {
  if (!container) return
  state.container = container
  container.innerHTML = '<div class="page-container"><div class="text-muted p-4">Cargando alumnos críticos…</div></div>'
  try {
    state.criticos = await obtenerCriticos()
    _render()
  } catch (err) {
    console.error('[AlumnosCriticos]', err)
    container.innerHTML = `<div class="page-container"><div class="alert alert-warning">${escapeHTML(err.message)}</div></div>`
  }
}

function _instrumentos() {
  return [...new Set(state.criticos.map((c) => c.instrumento).filter(Boolean))].sort()
}

function _render() {
  const lista = filtrarCriticosPorInstrumento(state.criticos, state.instrumento)
  const conWhatsapp = state.criticos.filter((c) => c.telefono_whatsapp).length
  state.container.innerHTML = `
    <div class="page-container">
      <div class="d-flex flex-wrap align-items-center gap-3 mb-3">
        <h1 class="page-title mb-0">Alumnos críticos por ausentismo</h1>
        <span class="badge bg-danger-subtle text-danger-emphasis">${state.criticos.length} críticos</span>
        <span class="badge bg-success-subtle text-success-emphasis">${conWhatsapp} con WhatsApp</span>
        <select class="form-select form-select-sm w-auto ms-auto" id="crit-instrumento" aria-label="Filtrar por instrumento">
          <option value="">Todos los instrumentos</option>
          ${_instrumentos().map((i) => `<option value="${escapeHTML(i)}" ${i === state.instrumento ? 'selected' : ''}>${escapeHTML(i)}</option>`).join('')}
        </select>
      </div>
      ${lista.length === 0
        ? '<div class="text-center text-muted py-5">No hay alumnos críticos con este filtro.</div>'
        : `<div class="row g-3">${lista.map(_cardHTML).join('')}</div>`}
    </div>`
  _attachEvents()
}

function _cardHTML(c) {
  return `
    <div class="col-12 col-md-6 col-xl-4">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start gap-2">
            <div>
              <h2 class="h6 mb-1">${escapeHTML(c.nombre_completo || 'Alumno')}</h2>
              <small class="text-muted">${escapeHTML(c.instrumento || 'Sin instrumento')}</small>
            </div>
            <span class="badge bg-danger">${c.dias_ausencia_distintos} días</span>
          </div>
          <p class="small text-muted mt-2 mb-2">Última ausencia: ${escapeHTML(String(c.ultima_ausencia || '—').slice(0, 10))}</p>
          <p class="small mb-3">${c.telefono_whatsapp ? 'Tiene WhatsApp' : '<span class="text-danger">Sin WhatsApp</span>'}</p>
          <button class="btn btn-sm btn-outline-primary w-100" data-ver="${escapeHTML(c.alumno_id)}">Ver detalle</button>
        </div>
      </div>
    </div>`
}

function _attachEvents() {
  state.container.querySelector('#crit-instrumento')?.addEventListener('change', (e) => {
    state.instrumento = e.target.value
    _render()
  })
  state.container.querySelectorAll('[data-ver]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const c = state.criticos.find((x) => x.alumno_id === btn.dataset.ver)
      if (c) _abrirDetalle(c)
    })
  })
}

function _abrirDetalle(c) {
  const fechas = (c.fechas_ausencia || []).map((f) => String(f).slice(0, 10))
  const historialHTML = fechas.length
    ? `<ul class="small mb-0">${fechas.map((f) => `<li>${escapeHTML(f)}</li>`).join('')}</ul>`
    : '<p class="small text-muted mb-0">Sin fechas registradas.</p>'

  AppModal.open({
    title: `${escapeHTML(c.nombre_completo || 'Alumno')} — ausencias`,
    size: 'lg',
    saveText: 'Abrir WhatsApp',
    cancelText: 'Cerrar',
    body: `
      <div class="row g-3">
        <div class="col-md-6">
          <h3 class="h6">Representante</h3>
          <p class="small mb-1">${escapeHTML(c.representante_nombre || 'Sin representante registrado')}</p>
          <p class="small mb-3">${escapeHTML(c.telefono_whatsapp || 'Sin teléfono de WhatsApp')}</p>
          <h3 class="h6">Historial de ausencias sin justificar</h3>
          ${historialHTML}
          <hr>
          <h3 class="h6">Justificar un día</h3>
          <input type="date" class="form-control form-control-sm mb-2" id="crit-just-fecha">
          <input type="text" class="form-control form-control-sm mb-2" id="crit-just-motivo" placeholder="Motivo">
          <button class="btn btn-sm btn-outline-secondary" id="crit-just-btn">Justificar día</button>
        </div>
        <div class="col-md-6">
          <h3 class="h6">Mensaje de WhatsApp</h3>
          <textarea class="form-control mb-2" id="crit-plantilla" rows="7">${escapeHTML(PLANTILLA_WHATSAPP_DEFAULT)}</textarea>
          <p class="small text-muted mb-0">Usa {representante}, {alumno} y {dias}. Nada se envía hasta que pulses "Abrir WhatsApp".</p>
        </div>
      </div>`,
    onShow: (body) => {
      body.querySelector('#crit-just-btn')?.addEventListener('click', async () => {
        const fecha = body.querySelector('#crit-just-fecha').value
        const motivo = body.querySelector('#crit-just-motivo').value.trim()
        if (!fecha || !motivo) return AppToast.error('Indica la fecha y el motivo')
        try {
          await justificarDiaCritico({ alumnoId: c.alumno_id, fecha, motivo })
          AppToast.success('Día justificado')
          await renderAlumnosCriticosView(state.container)
        } catch (err) {
          AppToast.error(err.message)
        }
      })
    },
    onSave: async (body) => {
      const plantilla = body.querySelector('#crit-plantilla').value
      const url = enlaceWhatsappCritico(c, plantilla)
      if (!url) {
        AppToast.error('El alumno no tiene un WhatsApp válido')
        return false
      }
      window.open(url, '_blank', 'noopener')
      return true
    },
  })
}

export { renderPlantillaWhatsapp }
