import '../styles/campanias.css'
import * as api from '../api/campaniasApi.js'
import { router } from '../../../core/router/router.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'

const ESTADOS_CAMP = [
  { value: 'borrador', label: 'Borrador', color: 'secondary' },
  { value: 'programada', label: 'Programada', color: 'info' },
  { value: 'enviando', label: 'Enviando...', color: 'warning' },
  { value: 'enviada', label: 'Enviada', color: 'primary' },
  { value: 'completada', label: 'Completada', color: 'success' },
  { value: 'cancelada', label: 'Cancelada', color: 'danger' },
]

let _state = { list: [] }

export async function renderCampaniasView(container) {
  container.innerHTML = `<div class="d-flex justify-content-center py-5"><div class="spinner-border text-primary"></div></div>`
  try {
    _state.list = await api.getCampanias()
    render(container)
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger m-3">${escapeHTML(err.message)}</div>`
  }
  return { teardown: () => {} }
}

function render(container) {
  const total = _state.list.length
  const enviadas = _state.list.filter((c) => c.estado === 'enviada' || c.estado === 'completada').length
  const totalEnviados = _state.list.reduce((s, c) => s + (c.enviados || 0), 0)
  const totalRespuestas = _state.list.reduce((s, c) => s + (c.respondidos || 0), 0)

  container.innerHTML = `
    <div class="page-container camp-portal">
      <div class="d-flex align-items-center justify-content-between gap-3 mb-3">
        <div class="d-flex align-items-center gap-3">
          <div class="page-header-icon"><i class="bi bi-send fs-4"></i></div>
          <div>
            <h1 class="mb-0 h3">Campañas de Marketing</h1>
            <p class="text-muted small mb-0">Campañas de email masivo B2B · Temporadas · Seguimiento</p>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="btn-nueva-campania">
          <i class="bi bi-plus-lg"></i> Nueva campaña
        </button>
      </div>

      <div class="row g-2 mb-4">
        <div class="col-6 col-md-3">
          <div class="camp-stat-card"><div class="stat-number">${total}</div><div class="small text-muted">Total campañas</div></div>
        </div>
        <div class="col-6 col-md-3">
          <div class="camp-stat-card"><div class="stat-number">${enviadas}</div><div class="small text-muted">Enviadas</div></div>
        </div>
        <div class="col-6 col-md-3">
          <div class="camp-stat-card"><div class="stat-number">${totalEnviados}</div><div class="small text-muted">Correos enviados</div></div>
        </div>
        <div class="col-6 col-md-3">
          <div class="camp-stat-card"><div class="stat-number">${totalRespuestas}</div><div class="small text-muted">Respuestas</div></div>
        </div>
      </div>

      <div id="campanias-list">
        ${_state.list.length === 0
          ? '<p class="text-muted text-center py-4">No hay campañas todavía. ¡Cree la primera!</p>'
          : _state.list.map((c) => campaniaRowHTML(c)).join('')}
      </div>
    </div>`

  container.querySelector('#btn-nueva-campania').onclick = () => {
    router.navigate('com-campania-compositor')
  }
  container.querySelectorAll('[data-campania-id]').forEach((el) => {
    el.querySelector('.btn-ver')?.addEventListener('click', () => {
      router.navigate('com-campania-compositor', { id: el.dataset.campaniaId })
    })
    el.querySelector('.btn-enviar')?.addEventListener('click', async (e) => {
      e.stopPropagation()
      await confirmarEnvio(el.dataset.campaniaId, container)
    })
    el.querySelector('.btn-eliminar')?.addEventListener('click', async (e) => {
      e.stopPropagation()
      await eliminarCampania(el.dataset.campaniaId, container)
    })
  })
}

function campaniaRowHTML(c) {
  const est = ESTADOS_CAMP.find((e) => e.value === c.estado) || ESTADOS_CAMP[0]
  const puedeEnviar = c.estado === 'borrador' || c.estado === 'programada'
  return `<div class="card mb-2" data-campania-id="${c.id}">
    <div class="card-body py-2 px-3">
      <div class="d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-3">
          <div>
            <strong>${escapeHTML(c.titulo)}</strong>
            ${c.temporada ? `<span class="badge bg-light text-dark ms-1">${escapeHTML(c.temporada)}</span>` : ''}
            <div class="small text-muted">
              <span class="badge badge-estado bg-${est.color} me-2">${est.label}</span>
              Asunto: ${escapeHTML(c.asunto || '')}
            </div>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2 text-end small">
          <div class="me-2">
            <div>${c.enviados || 0} enviados</div>
            ${c.respondidos ? `<div class="text-success">${c.respondidos} respuestas</div>` : ''}
          </div>
          <button class="btn btn-sm btn-outline-primary btn-ver"><i class="bi bi-eye"></i></button>
          ${puedeEnviar ? `<button class="btn btn-sm btn-success btn-enviar"><i class="bi bi-send"></i></button>` : ''}
          <button class="btn btn-sm btn-outline-danger btn-eliminar"><i class="bi bi-trash"></i></button>
        </div>
      </div>
    </div>
  </div>`
}

async function confirmarEnvio(id, container) {
  const camp = _state.list.find((c) => c.id === id)
  if (!camp) return

  const dests = await api.getDestinatarios(id)
  const pendientes = dests.length

  if (pendientes === 0) {
    AppToast.warning('Esta campaña no tiene destinatarios. Agregue instituciones primero.')
    return
  }

  const modal = new AppModal({
    title: 'Confirmar envío',
    body: `<p>¿Enviar <strong>${escapeHTML(camp.titulo)}</strong> a <strong>${pendientes}</strong> destinatarios?</p>
      <p class="text-muted small">Los correos se enviarán usando el servicio de correo institucional (Resend).</p>`,
    buttons: [
      { text: 'Cancelar', class: 'btn btn-light', dismiss: true },
      { text: 'Enviar ahora', class: 'btn btn-success', dismiss: false, primary: true },
    ],
  })

  modal.on('primary', async () => {
    try {
      modal.close()
      await api.enviarCampania(id)
      _state.list = await api.getCampanias()
      render(container)
      AppToast.success(`Campaña "${camp.titulo}" enviada a ${pendientes} destinatarios. Hermes monitoreará las respuestas.`)
    } catch (err) {
      AppToast.error(err.message)
    }
  })

  modal.show()
}

async function eliminarCampania(id, container) {
  if (!confirm('¿Eliminar esta campaña?')) return
  try {
    await api.eliminarCampania(id)
    _state.list = _state.list.filter((c) => c.id !== id)
    render(container)
    AppToast.success('Campaña eliminada')
  } catch (err) {
    AppToast.error(err.message)
  }
}

function escapeHTML(s) {
  if (s === null || s === undefined) return ''
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
