import '../styles/campanias.css'
import * as api from '../api/campaniasApi.js'
import { router } from '../../../core/router/router.js'
import { AppToast } from '../../../shared/components/AppToast.js'

let _state = {
  campania: null,
  instituciones: [],
  seleccion: new Set(),
  asunto: '',
  cuerpoHtml: '',
  cuerpoTexto: '',
  temporada: '',
  titulo: '',
  esNuevo: true,
}

export async function renderCampaniaCompositorView(container, params) {
  container.innerHTML = `<div class="d-flex justify-content-center py-5"><div class="spinner-border text-primary"></div></div>`
  try {
    const [instituciones, campanias] = await Promise.all([api.getInstituciones(), api.getCampanias()])
    _state.instituciones = instituciones

    const editId = params?.id
    if (editId) {
      _state.campania = campanias.find((c) => c.id === editId) || null
      if (_state.campania) {
        _state.titulo = _state.campania.titulo
        _state.temporada = _state.campania.temporada || ''
        _state.asunto = _state.campania.asunto
        _state.cuerpoHtml = _state.campania.cuerpo_html
        _state.cuerpoTexto = _state.campania.cuerpo_texto || ''
        _state.esNuevo = false
        const dests = await api.getDestinatarios(editId)
        _state.seleccion = new Set(dests.filter((d) => d.institucion).map((d) => d.institucion_id))
      }
    } else {
      resetState()
    }
    render(container)
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger m-3">${escapeHTML(err.message)}</div>`
  }
  return { teardown: () => {} }
}

function resetState() {
  _state.campania = null
  _state.titulo = ''
  _state.temporada = ''
  _state.asunto = ''
  _state.cuerpoHtml = '<h2>Estimado/a {contacto_nombre}</h2>\n\n<p>Desde <strong>El Sistema Punta Cana</strong> queremos invitarle a...</p>\n\n<p>Quedamos atentos,</p>\n<p><em>Departamento de Comunicaciones</em><br>El Sistema Punta Cana</p>'
  _state.cuerpoTexto = ''
  _state.seleccion = new Set()
  _state.esNuevo = true
}

function render(container) {
  const filtrados = _state.instituciones.filter((i) => i.estado !== 'inactivo' && i.estado !== 'rechazado')

  container.innerHTML = `
    <div class="page-container camp-portal">
      <div class="d-flex align-items-center gap-3 mb-3">
        <div class="page-header-icon"><i class="bi bi-pencil-square fs-4"></i></div>
        <div>
          <h1 class="mb-0 h3">${_state.esNuevo ? 'Nueva Campaña' : 'Editar Campaña'}</h1>
          <p class="text-muted small mb-0">Compositor de campañas de email B2B</p>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-8">
          <div class="card mb-3">
            <div class="card-body">
              <div class="row g-2 mb-2">
                <div class="col-8">
                  <label class="form-label small fw-medium">Título de la campaña *</label>
                  <input class="form-control form-control-sm" id="camp-titulo" value="${escapeHTML(_state.titulo)}" placeholder="Ej: Oferta conciertos navideños">
                </div>
                <div class="col-4">
                  <label class="form-label small fw-medium">Temporada</label>
                  <input class="form-control form-control-sm" id="camp-temporada" value="${escapeHTML(_state.temporada)}" placeholder="Ej: Navidad 2026">
                </div>
              </div>
              <div class="mb-2">
                <label class="form-label small fw-medium">Asunto del correo *</label>
                <input class="form-control form-control-sm" id="camp-asunto" value="${escapeHTML(_state.asunto)}" placeholder="Ej: Conciertos educativos para su institución">
              </div>
              <div class="mb-2">
                <div class="d-flex justify-content-between align-items-center">
                  <label class="form-label small fw-medium mb-0">Cuerpo del correo (HTML)</label>
                  <button class="btn btn-sm btn-outline-secondary" id="btn-preview">Vista previa</button>
                </div>
                <textarea class="form-control form-control-sm font-monospace" id="camp-cuerpo" rows="14" style="font-size:0.85rem">${escapeHTML(_state.cuerpoHtml)}</textarea>
              </div>
              <div class="small text-muted">
                Variables disponibles: <code>{contacto_nombre}</code> <code>{institucion}</code> <code>{cargo}</code>
              </div>
            </div>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-outline-secondary btn-sm" id="btn-cancelar"><i class="bi bi-x"></i> Cancelar</button>
            <button class="btn btn-primary btn-sm" id="btn-guardar"><i class="bi bi-check"></i> Guardar campaña</button>
            <button class="btn btn-success btn-sm" id="btn-guardar-enviar" ${_state.seleccion.size === 0 ? 'disabled' : ''}>
              <i class="bi bi-send"></i> Guardar y enviar
            </button>
          </div>
        </div>

        <div class="col-4">
          <div class="card mb-3">
            <div class="card-header py-2">
              <strong class="small">Destinatarios</strong>
              <span class="badge bg-primary ms-1" id="seleccion-count">${_state.seleccion.size}</span>
            </div>
            <div class="card-body p-2" style="max-height:400px;overflow-y:auto">
              <input class="form-control form-control-sm mb-2" id="filtro-dest" placeholder="Filtrar...">
              <div id="destinatarios-list">
                ${filtrados.map((ins) => destinatarioCheckHTML(ins)).join('')}
              </div>
              ${filtrados.length === 0 ? '<p class="text-muted small text-center py-3">No hay instituciones activas. Cree alguna en el Directorio primero.</p>' : ''}
            </div>
          </div>

          <div id="preview-panel" class="card" style="display:none">
            <div class="card-header py-2 d-flex justify-content-between">
              <strong class="small">Vista previa</strong>
              <button class="btn-close btn-sm" id="btn-cerrar-preview"></button>
            </div>
            <div class="card-body p-3 template-preview" id="preview-content"></div>
          </div>
        </div>
      </div>
    </div>`

  bindEvents(container)
}

function bindEvents(container) {
  const getCampo = (id) => container.querySelector(`#${id}`)
  const val = () => ({
    titulo: getCampo('camp-titulo')?.value || '',
    temporada: getCampo('camp-temporada')?.value || '',
    asunto: getCampo('camp-asunto')?.value || '',
    cuerpoHtml: getCampo('camp-cuerpo')?.value || '',
  })

  getCampo('btn-preview')?.addEventListener('click', () => {
    const v = val()
    const panel = container.querySelector('#preview-panel')
    const content = container.querySelector('#preview-content')
    panel.style.display = 'block'
    content.innerHTML = v.cuerpoHtml || '<em class="text-muted">Sin contenido</em>'
  })

  getCampo('btn-cerrar-preview')?.addEventListener('click', () => {
    container.querySelector('#preview-panel').style.display = 'none'
  })

  getCampo('btn-cancelar')?.addEventListener('click', () => router.navigate('com-campanias'))

  getCampo('btn-guardar')?.addEventListener('click', async () => {
    const v = val()
    if (!v.titulo || !v.asunto || !v.cuerpoHtml) {
      AppToast.warning('Complete título, asunto y cuerpo del correo')
      return
    }
    try {
      const saved = await api.guardarCampania({
        id: _state.campania?.id || undefined,
        titulo: v.titulo,
        temporada: v.temporada || null,
        asunto: v.asunto,
        cuerpo_html: v.cuerpoHtml,
        cuerpo_texto: stripHTML(v.cuerpoHtml),
        estado: 'borrador',
      })
      _state.campania = saved
      _state.esNuevo = false
      AppToast.success('Campaña guardada')
    } catch (err) {
      AppToast.error(err.message)
    }
  })

  getCampo('btn-guardar-enviar')?.addEventListener('click', async () => {
    const v = val()
    if (!v.titulo || !v.asunto || !v.cuerpoHtml) {
      AppToast.warning('Complete título, asunto y cuerpo del correo')
      return
    }
    if (_state.seleccion.size === 0) {
      AppToast.warning('Seleccione al menos un destinatario')
      return
    }
    try {
      const saved = await api.guardarCampania({
        id: _state.campania?.id || undefined,
        titulo: v.titulo,
        temporada: v.temporada || null,
        asunto: v.asunto,
        cuerpo_html: v.cuerpoHtml,
        cuerpo_texto: stripHTML(v.cuerpoHtml),
        estado: 'borrador',
      })
      _state.campania = saved
      _state.esNuevo = false
      await api.enviarCampania(saved.id)
      AppToast.success(`Campaña enviada a ${_state.seleccion.size} destinatarios. Hermes monitoreará las respuestas.`)
      router.navigate('com-campanias')
    } catch (err) {
      AppToast.error(err.message)
    }
  })

  getCampo('filtro-dest')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase()
    container.querySelectorAll('.destinatario-item').forEach((el) => {
      const nombre = (el.dataset.nombre || '').toLowerCase()
      el.style.display = nombre.includes(q) ? '' : 'none'
    })
  })

  container.querySelectorAll('.destinatario-check').forEach((cb) => {
    cb.checked = _state.seleccion.has(cb.value)
    cb.addEventListener('change', () => {
      if (cb.checked) _state.seleccion.add(cb.value)
      else _state.seleccion.delete(cb.value)
      const count = container.querySelector('#seleccion-count')
      if (count) count.textContent = _state.seleccion.size
      const btn = container.querySelector('#btn-guardar-enviar')
      if (btn) btn.disabled = _state.seleccion.size === 0
    })
  })
}

function destinatarioCheckHTML(ins) {
  const checked = _state.seleccion.has(ins.id) ? ' checked' : ''
  const label = `${escapeHTML(ins.nombre)}${ins.contacto_nombre ? ` (${escapeHTML(ins.contacto_nombre)})` : ''}`
  const sub = ins.email ? escapeHTML(ins.email) : 'sin email'
  return `<div class="form-check destinatario-item" data-nombre="${escapeHTML(ins.nombre.toLowerCase())}">
    <input class="form-check-input destinatario-check" type="checkbox" value="${ins.id}" id="dest-${ins.id}"${checked}>
    <label class="form-check-label small" for="dest-${ins.id}">
      <span class="d-block">${label}</span>
      <span class="text-muted" style="font-size:0.75rem">${sub}</span>
    </label>
  </div>`
}

function stripHTML(html) {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

function escapeHTML(s) {
  if (s === null || s === undefined) return ''
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
