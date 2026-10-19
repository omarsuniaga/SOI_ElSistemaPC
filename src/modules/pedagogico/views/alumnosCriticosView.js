import '../../../shared/styles/adm-responsive.css'
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

let loadRequest = 0

const state = { container: null, criticos: [], instrumento: '', search: '', page: 1 }

export async function renderAlumnosCriticosView(container) {
  if (!container) return
  container.cleanup?.()
  const request = ++loadRequest
  state.container = container
  container.cleanup = () => { loadRequest++ }
  container.innerHTML = '<div class="page-container adm-responsive-view"><div class="text-muted p-4">Cargando alumnos críticos…</div></div>'
  try {
    const items = await obtenerCriticos()
    if (request !== loadRequest) return
    state.criticos = items
    _render()
  } catch (err) {
    if (request !== loadRequest) return
    console.error('[AlumnosCriticos]', err)
    container.innerHTML = `<div class="page-container adm-responsive-view"><div class="alert alert-warning">${escapeHTML(err.message)}</div></div>`
  }
}

function _instrumentos() {
  return [...new Set(state.criticos.map((c) => c.instrumento).filter(Boolean))].sort()
}

function _render(preserveSearch = false) {
  const query = state.search.trim().toLocaleLowerCase('es')
  const lista = filtrarCriticosPorInstrumento(state.criticos, state.instrumento)
    .filter((item) => [item.nombre_completo, item.representante_nombre].some((text) => String(text || '').toLocaleLowerCase('es').includes(query)))
  const pages = Math.max(1, Math.ceil(lista.length / 20))
  state.page = Math.min(state.page, pages)
  const visible = lista.slice((state.page - 1) * 20, state.page * 20)
  const target = preserveSearch ? document.createElement('div') : state.container
  const conWhatsapp = lista.filter((c) => c.telefono_whatsapp).length
  target.innerHTML = `
    <div class="page-container adm-responsive-view">
      <div class="d-flex flex-wrap align-items-center gap-3 mb-3">
        <h1 class="page-title mb-0">Alumnos críticos por ausentismo</h1>
        <span class="badge bg-danger-subtle text-danger-emphasis">${lista.length} de ${state.criticos.length} alumnos</span>
        <span class="badge bg-success-subtle text-success-emphasis">${conWhatsapp} con WhatsApp</span>
        <select class="form-select form-select-sm w-auto ms-auto" id="crit-instrumento" aria-label="Filtrar por instrumento">
          <option value="">Todos los instrumentos</option>
          ${_instrumentos().map((i) => `<option value="${escapeHTML(i)}" ${i === state.instrumento ? 'selected' : ''}>${escapeHTML(i)}</option>`).join('')}
        </select>
      </div>
      <p class="small text-muted">Ausencias sin justificar · las fechas de origen están disponibles en el detalle de cada alumno.</p>
      <label class="form-label small" for="crit-search">Buscar alumno o representante</label>
      <input class="form-control mb-3" id="crit-search" type="search" value="${escapeHTML(state.search)}" placeholder="Nombre del alumno o representante">
      <div id="crit-results">
      ${lista.length === 0
        ? '<div class="text-center text-muted py-5">No hay alumnos críticos con este filtro.</div>'
        : `<div class="d-flex flex-column gap-2">${visible.map(_cardHTML).join('')}</div>`}
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
        <span class="small text-muted">Página ${state.page} de ${pages} · ${lista.length} resultados</span>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-secondary" data-crit-prev ${state.page <= 1 ? 'disabled' : ''}>Anterior</button>
          <button class="btn btn-sm btn-outline-secondary" data-crit-next ${state.page >= pages ? 'disabled' : ''}>Siguiente</button>
        </div>
      </div>
      </div>
    </div>`
  if (preserveSearch) {
    state.container.querySelector('#crit-results').replaceWith(target.querySelector('#crit-results'))
    const badges = state.container.querySelectorAll('.page-container > div:first-child .badge')
    target.querySelectorAll('.page-container > div:first-child .badge').forEach((badge, index) => {
      if (badges[index]) badges[index].textContent = badge.textContent
    })
  }
  _attachEvents()
}

function _cardHTML(c) {
  return `
    <article class="border rounded-3 bg-body p-3 d-flex flex-wrap align-items-center gap-2">
      <div class="flex-grow-1" style="min-width:0">
        <h2 class="h6 mb-1 text-break">${escapeHTML(c.nombre_completo || 'Alumno')}</h2>
        <span class="small text-muted">${escapeHTML(c.instrumento || 'Sin instrumento')} · Última ausencia: ${escapeHTML(String(c.ultima_ausencia || '—').slice(0, 10))}</span>
      </div>
      <span class="badge bg-danger-subtle text-danger-emphasis">${escapeHTML(c.dias_ausencia_distintos)} días</span>
      <span class="small ${c.telefono_whatsapp ? 'text-muted' : 'text-danger'}">${c.telefono_whatsapp ? 'Con WhatsApp' : 'Sin WhatsApp'}</span>
      <button class="btn btn-outline-primary" data-ver="${escapeHTML(c.alumno_id)}">Ver detalle</button>
    </article>`
}

function _attachEvents() {
  state.container.querySelector('#crit-search').oninput = (event) => {
    state.search = event.target.value
    state.page = 1
    _render(true)
  }
  state.container.querySelector('[data-crit-prev]').onclick = () => { state.page--; _render() }
  state.container.querySelector('[data-crit-next]').onclick = () => { state.page++; _render() }

  state.container.querySelector('#crit-instrumento').onchange = (e) => {
    state.instrumento = e.target.value
    state.page = 1
    _render()
  }
  state.container.querySelectorAll('[data-ver]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const c = state.criticos.find((x) => x.alumno_id === btn.dataset.ver)
      if (c) _abrirDetalle(c)
    })
  })
}

function _abrirDetalle(c, template = PLANTILLA_WHATSAPP_DEFAULT) {
  let saving = false
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
          <details class="mb-3"><summary>Ver ${fechas.length} fechas de ausencia</summary>${historialHTML}</details>
          <hr>
          <h3 class="h6">Justificar un día</h3>
          <input type="date" class="form-control form-control-sm mb-2" id="crit-just-fecha">
          <input type="text" class="form-control form-control-sm mb-2" id="crit-just-motivo" placeholder="Motivo">
          <button class="btn btn-sm btn-outline-secondary" id="crit-just-btn">Justificar día</button>
        </div>
        <div class="col-md-6">
          <h3 class="h6">Mensaje de WhatsApp</h3>
          <textarea class="form-control mb-2" id="crit-plantilla" rows="7">${escapeHTML(template)}</textarea>
          <p class="small text-muted mb-0">Usa {representante}, {alumno} y {dias}. Nada se envía hasta que pulses "Abrir WhatsApp".</p>
        </div>
      </div>`,
    onShow: (body) => {
      body.querySelector('#crit-just-btn')?.addEventListener('click', async () => {
        if (saving) return
        const fecha = body.querySelector('#crit-just-fecha').value
        const motivo = body.querySelector('#crit-just-motivo').value.trim()
        if (!fecha || !motivo) return AppToast.error('Indica la fecha y el motivo')
        saving = true
        const button = body.querySelector('#crit-just-btn')
        button.disabled = true
        button.textContent = 'Guardando…'
        try {
          await justificarDiaCritico({ alumnoId: c.alumno_id, fecha, motivo })
          AppToast.success('Día justificado')
          const template = body.querySelector('#crit-plantilla').value
          const request = loadRequest
          const container = state.container
          if (button.isConnected) AppModal.close()
          const items = await obtenerCriticos()
          if (request !== loadRequest || container !== state.container) return
          state.criticos = items
          _render()
          const updated = items.find((item) => item.alumno_id === c.alumno_id)
          if (updated) _abrirDetalle(updated, template)
        } catch (err) {
          AppToast.error(err.message)
        } finally {
          saving = false
          button.disabled = false
          button.textContent = 'Justificar día'
        }
      })
    },
    onSave: async (body) => {
      if (saving) { AppToast.info('Espere a que termine el guardado'); return false }
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
