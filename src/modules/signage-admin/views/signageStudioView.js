/**
 * signageStudioView.js — Estudio de la cartelera (pantalla del vestíbulo).
 *
 * Vista previa EN VIVO (iframe = el mismo player que la Raspberry, en modo
 * ?preview=1) + panel de edición. Cada cambio se refleja al instante en la
 * vista previa vía postMessage; "Guardar" persiste el diseño en Supabase.
 * Los medios (subir / YouTube / orden / vigencia) se guardan al momento.
 *
 * AISLADO: solo signage_pantallas / signage_media / bucket 'signage'.
 * El horario y el calendario NO se editan aquí (vienen de los datos de SOI).
 */
import '../styles/signage-admin.css'
import { escapeHTML } from '../../../shared/utils/sanitize.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import * as api from '../api/signageAdminApi.js'

const PREVIEW_SRC = '/signage/index.html?preview=1'

const state = {
  container: null,
  pantallas: [],
  pantalla: null,
  layout: null,
  marca: { institucion: '', siglas: '', logoPath: '' },
  menuPortales: [],
  medios: [],
  seccion: 'cabecera',
  dirty: false,
  guardando: false,
  iframeReady: false,
  // handshake del modelo con el iframe de vista previa
  modelSeq: 0,
  modelRetry: null,
}

export async function renderSignageStudioView(container) {
  if (container.cleanup) container.cleanup()
  state.container = container
  container.innerHTML = shell('<div class="text-center text-muted py-5"><span class="spinner-border spinner-border-sm me-2"></span>Cargando…</div>')

  const cerrar = () => {
    window.removeEventListener('message', onMessage)
    window.removeEventListener('resize', fitWorkspace)
    clearInterval(state.modelRetry)
  }
  const onMessage = (ev) => {
    // el router borra el DOM sin llamar cleanup al navegar fuera: auto-desmontar
    if (!state.container || !state.container.isConnected) { cerrar(); return }
    const d = ev.data
    if (!d || typeof d !== 'object' || String(d.type || '').indexOf('signage:') !== 0) return
    if (d.type === 'signage:ready') { state.iframeReady = true; postModel() }
    else if (d.type === 'signage:model-ack') { if (d.seq === state.modelSeq) clearInterval(state.modelRetry) }
    else if (d.type === 'signage:zone-click' && d.zone) irASeccion(d.zone)
  }
  window.addEventListener('message', onMessage)
  container.cleanup = cerrar

  try {
    state.pantallas = await api.listarPantallas()
    if (!state.pantallas.length) {
      container.innerHTML = shell('<div class="alert alert-warning">No hay pantallas registradas en <code>signage_pantallas</code>.</div>')
      return
    }
    await seleccionarPantalla(state.pantallas[0].id)
  } catch (e) {
    container.innerHTML = shell(`<div class="alert alert-danger">${escapeHTML(e.message)}</div>`)
  }
}

async function seleccionarPantalla(id) {
  state.pantalla = state.pantallas.find((p) => p.id === id) || state.pantallas[0]
  state.layout = api.mergeLayout(state.pantalla.layout)
  state.marca = {
    institucion: state.pantalla.institucion || '',
    siglas: state.pantalla.siglas || '',
    logoPath: state.pantalla.logo_path || '',
  }
  state.menuPortales = Array.isArray(state.pantalla.menu_portales) ? [...state.pantalla.menu_portales] : []
  state.medios = await api.listarMedios(state.pantalla.id)
  state.dirty = false
  state.iframeReady = false
  render()
}

/* ─── layout general ──────────────────────────────────────────────────── */

function shell(inner) {
  return `
    <div class="page-container signage-studio">
      <div class="ss-header">
        <div class="d-flex align-items-center gap-2 min-w-0">
          <div class="ss-header-ico"><i class="bi bi-tv"></i></div>
          <div class="min-w-0">
            <h5 class="fw-bold mb-0 text-body text-truncate">Cartelera — Estudio</h5>
            <small class="text-muted d-block text-truncate" style="font-size:.75rem">Vista previa en vivo de la pantalla del vestíbulo</small>
          </div>
        </div>
        <div id="ss-toolbar" class="d-flex align-items-center flex-wrap justify-content-end" style="gap:.5rem"></div>
      </div>
      <div id="ss-body">${inner}</div>
    </div>`
}

function render() {
  const host = state.container
  host.innerHTML = shell('')
  // renderBody() recrea el <iframe>: hasta el próximo handshake no está listo.
  state.iframeReady = false
  clearInterval(state.modelRetry)
  renderToolbar()
  renderBody()
  attach(host)
}

/* Re-renderiza SOLO el panel lateral (acordeones, medios). NO toca el iframe de
   vista previa ni la toolbar: antes cada clic de acordeón o cada reordenamiento
   de medios llamaba a render() y recreaba el iframe, que se quedaba en la
   pantalla de carga y perdía el modelo hasta rehacer el handshake. */
function renderPanel() {
  const host = state.container
  const panel = host && host.querySelector('.ss-panel')
  if (!panel) { render(); return }
  panel.innerHTML = panelHTML()
  attachPanel(host)
}

/* Ajusta el workspace para llenar la ventana y encaja la vista previa en 16:9. */
function fitWorkspace() {
  const ws = document.querySelector('.signage-studio .ss-workspace')
  if (!ws) return
  const desktop = window.matchMedia('(min-width: 1200px)').matches
  ws.style.height = ''
  const top = ws.getBoundingClientRect().top
  ws.style.height = desktop ? Math.max(420, window.innerHeight - top - 18) + 'px' : ''

  const vp = ws.querySelector('.ss-stage-viewport')
  const fr = ws.querySelector('.ss-stage-frame')
  if (!vp || !fr) return
  const availW = vp.clientWidth
  const availH = vp.clientHeight || (window.innerHeight * 0.44)
  const w = Math.max(240, Math.min(availW, availH * 16 / 9))
  fr.style.width = Math.round(w) + 'px'
  fr.style.height = Math.round(w * 9 / 16) + 'px'
}

function renderToolbar() {
  const tb = document.getElementById('ss-toolbar')
  const opts = state.pantallas
    .map((p) => `<option value="${p.id}" ${p.id === state.pantalla.id ? 'selected' : ''}>${escapeHTML(p.nombre || p.slug)}</option>`)
    .join('')
  tb.innerHTML = `
    ${state.pantallas.length > 1 ? `<select class="form-select form-select-sm" id="ss-pantalla" style="width:auto">${opts}</select>` : ''}
    <a class="btn btn-sm btn-outline-secondary" href="${PREVIEW_SRC}" target="_blank" rel="noopener" title="Abrir la cartelera en una pestaña">
      <i class="bi bi-box-arrow-up-right me-1"></i>Abrir
    </a>
    <button class="btn btn-sm btn-primary" id="ss-guardar" ${state.guardando ? 'disabled' : ''}>
      <i class="bi bi-check-lg me-1"></i>${state.dirty ? 'Guardar diseño' : 'Guardado'}
    </button>`
}

function renderBody() {
  document.getElementById('ss-body').innerHTML = `
    <div class="ss-workspace">
      <div class="ss-stage">
        <div class="ss-stage-viewport">
          <div class="ss-stage-frame">
            <iframe id="ss-preview" src="${PREVIEW_SRC}" title="Vista previa de la cartelera"
              referrerpolicy="no-referrer" loading="eager"></iframe>
          </div>
        </div>
        <div class="ss-stage-note">
          <i class="bi bi-broadcast text-success"></i>
          <span>Refleja tus cambios al instante. La pantalla real del vestíbulo se actualiza 1–3 min después de guardar.</span>
        </div>
      </div>
      <aside class="ss-side">
        <div class="ss-panel">${panelHTML()}</div>
      </aside>
    </div>`
}

/* ─── panel de edición ────────────────────────────────────────────────── */

function acc(id, icon, titulo, cuerpo, badge) {
  const open = state.seccion === id
  return `
    <div class="card border border-body-tertiary rounded-4 mb-2 ss-acc" data-acc="${id}">
      <button class="card-header bg-body-tertiary d-flex align-items-center justify-content-between w-100 border-0 ss-acc-head" type="button" data-acc-toggle="${id}">
        <span class="fw-semibold"><i class="bi ${icon} me-2"></i>${escapeHTML(titulo)}</span>
        <span class="d-flex align-items-center gap-2">
          ${badge || ''}
          <i class="bi bi-chevron-${open ? 'up' : 'down'} text-muted"></i>
        </span>
      </button>
      <div class="card-body ${open ? '' : 'd-none'}" data-acc-body="${id}">${cuerpo}</div>
    </div>`
}

function sw(path, label, hint) {
  const v = getPath(state.layout, path)
  return `
    <label class="form-check form-switch d-flex align-items-center gap-2 py-1 m-0">
      <input class="form-check-input" type="checkbox" data-path="${path}" ${v ? 'checked' : ''}>
      <span>${escapeHTML(label)}${hint ? `<small class="text-muted d-block" style="font-size:.72rem">${escapeHTML(hint)}</small>` : ''}</span>
    </label>`
}
function sel(path, label, options) {
  const v = getPath(state.layout, path)
  const o = options.map(([val, t]) => `<option value="${val}" ${val === v ? 'selected' : ''}>${escapeHTML(t)}</option>`).join('')
  return `<label class="d-block py-1"><span class="d-block mb-1 small">${escapeHTML(label)}</span><select class="form-select form-select-sm" data-path="${path}">${o}</select></label>`
}
function txt(path, label, ph) {
  const v = getPath(state.layout, path) || ''
  return `<label class="d-block py-1"><span class="d-block mb-1 small">${escapeHTML(label)}</span><input type="text" class="form-control form-control-sm" data-path="${path}" value="${escapeHTML(v)}" placeholder="${escapeHTML(ph || '')}"></label>`
}
function rng(path, label, min, max, suf) {
  const v = getPath(state.layout, path)
  return `<label class="d-block py-1"><span class="d-block mb-1 small">${escapeHTML(label)}: <b data-rng-val="${path}">${v}${suf || ''}</b></span>
    <input type="range" class="form-range" data-path="${path}" data-num="1" min="${min}" max="${max}" value="${v}"></label>`
}

function panelHTML() {
  return `
    ${acc('cabecera', 'bi-window-sidebar', 'Cabecera', `
      <div class="py-1">
        <span class="d-block mb-1 small">Logo (PNG, se ajusta al alto de la cabecera)</span>
        <div class="d-flex align-items-center gap-2">
          <div class="ss-logo-preview">${state.marca.logoPath
            ? `<img src="${escapeHTML(api.urlPublica(state.marca.logoPath))}" alt="logo">`
            : '<span class="ss-logo-empty">✳</span>'}</div>
          <label class="btn btn-sm btn-outline-secondary mb-0">
            <i class="bi bi-upload me-1"></i>${state.marca.logoPath ? 'Cambiar' : 'Subir logo'}
            <input type="file" id="ss-logo-file" accept="image/png,image/webp,image/svg+xml" hidden>
          </label>
          ${state.marca.logoPath ? '<button class="btn btn-sm btn-outline-danger" id="ss-logo-del" title="Quitar logo"><i class="bi bi-x-lg"></i></button>' : ''}
        </div>
      </div>
      <label class="d-block py-1"><span class="d-block mb-1 small">Institución</span>
        <input type="text" class="form-control form-control-sm" data-marca="institucion" value="${escapeHTML(state.marca.institucion)}" placeholder="El Sistema Punta Cana"></label>
      <label class="d-block py-1"><span class="d-block mb-1 small">Siglas</span>
        <input type="text" class="form-control form-control-sm" data-marca="siglas" value="${escapeHTML(state.marca.siglas)}" placeholder="FUNEYCA-PC"></label>
      <hr class="my-2">
      ${sw('cabecera.visible', 'Mostrar cabecera')}
      ${sw('cabecera.marca', 'Logo y nombre')}
      ${sw('cabecera.reloj', 'Reloj')}
      ${sw('cabecera.fecha', 'Fecha')}
      ${sw('cabecera.evento', 'Próximo evento del calendario')}
    `)}
    ${acc('visualizador', 'bi-easel2', 'Visualizador — contenido', mediosHTML(), `<span class="badge bg-secondary">${state.medios.length}</span>`)}
    ${acc('horario', 'bi-list-columns-reverse', 'Horario (barra lateral)', `
      ${sw('horario.visible', 'Mostrar barra lateral')}
      ${sw('horario.hoy', 'Clases de hoy')}
      ${sw('horario.manana', 'Clases de mañana')}
      <hr class="my-2">
      <div class="text-muted small mb-1">Detalle por clase:</div>
      ${sw('horario.instrumento', 'Etiqueta de instrumento')}
      ${sw('horario.meta', 'Salón y maestro')}
      <hr class="my-2">
      ${rng('horario.anchoPct', 'Ancho de la barra', 20, 40, '%')}
      <small class="text-muted">El tamaño de letra se ajusta solo para que quepan todas las clases.</small>
    `)}
    ${state.layout.visualizador ? acc('ajustes', 'bi-sliders', 'Visualizador — ajustes', `
      ${sw('visualizador.visible', 'Mostrar visualizador')}
      ${sel('visualizador.ajuste', 'Ajuste de imagen', [['contain', 'Completa (sin recortar)'], ['cover', 'Rellenar (recorta bordes)']])}
      ${sw('visualizador.pie', 'Pie de foto (título y crédito)')}
      ${txt('visualizador.pieTexto', 'Pie de foto fijo (opcional)', 'Sobrescribe el título del medio actual')}
    `) : ''}
    ${acc('visibilidad', 'bi-eye', 'Visibilidad del menú', `
      <p class="small text-muted mb-2">El menú <b>Cartelera</b> siempre está en los portales <b>Admin</b>, <b>ADM</b> y <b>ACM</b>. Aquí eliges en qué otros portales aparece también:</p>
      ${api.PORTALES_DEPTO.map((p) => `
        <label class="form-check form-switch d-flex align-items-center gap-2 py-1 m-0">
          <input class="form-check-input" type="checkbox" data-portal="${p.id}"
            ${p.fijo || state.menuPortales.includes(p.id) ? 'checked' : ''} ${p.fijo ? 'disabled' : ''}>
          <span>${escapeHTML(p.label)} <small class="text-muted">(${p.id})${p.fijo ? ' · siempre' : ''}</small></span>
        </label>`).join('')}
    `)}`
}

function mediosHTML() {
  const filas = state.medios.length
    ? state.medios.map(medioRow).join('')
    : '<div class="text-center text-muted py-4"><i class="bi bi-collection d-block fs-3 mb-2"></i>Sin contenido. Sube una imagen o agrega un vídeo.</div>'
  return `
    <div class="d-flex flex-wrap gap-2 mb-2">
      <label class="btn btn-sm btn-primary mb-0">
        <i class="bi bi-upload me-1"></i>Subir imagen / vídeo
        <input type="file" id="ss-file" accept="image/*,video/mp4,video/webm" hidden>
      </label>
      <button class="btn btn-sm btn-outline-primary" id="ss-slide"><i class="bi bi-easel2 me-1"></i>Nueva diapositiva</button>
      <button class="btn btn-sm btn-outline-danger" id="ss-yt"><i class="bi bi-youtube me-1"></i>YouTube</button>
    </div>
    <div class="ss-media-list">${filas}</div>`
}

const TIPO_ICONO = { video: 'film', youtube: 'youtube', slide: 'easel2' }
const TIPO_LABEL = { imagen: 'Imagen', video: 'Vídeo', youtube: 'YouTube', slide: 'Diapositiva' }

function medioRow(m) {
  const url = m.storage_path ? api.urlPublica(m.storage_path) : null
  const thumb = m.tipo === 'imagen' && url
    ? `<img src="${escapeHTML(url)}" alt="" class="ss-thumb">`
    : `<div class="ss-thumb ss-thumb--icon"><i class="bi bi-${TIPO_ICONO[m.tipo] || 'image'}"></i></div>`
  const vig = [m.vigente_desde, m.vigente_hasta].filter(Boolean).join(' → ')
  const sub = [
    (TIPO_LABEL[m.tipo] || m.tipo) + (m.tipo === 'slide' && m.contenido?.plantilla ? ` · ${m.contenido.plantilla}` : ''),
    m.duracion_seg ? `${m.duracion_seg}s` : '',
    vig,
  ].filter(Boolean).join('  ·  ')
  return `
    <div class="ss-media-row${m.activo ? '' : ' is-off'}" data-id="${m.id}">
      <div class="ss-media-main">
        ${thumb}
        <div class="ss-media-txt">
          <div class="ss-media-title">${escapeHTML(m.titulo || m.youtube_url || 'Sin título')}</div>
          <div class="ss-media-sub">${escapeHTML(sub)}</div>
        </div>
        <label class="ss-media-sw form-check form-switch m-0" title="${m.activo ? 'Activo — clic para ocultar' : 'Oculto — clic para mostrar'}">
          <input class="form-check-input ss-activo" type="checkbox" ${m.activo ? 'checked' : ''}>
        </label>
      </div>
      <div class="ss-media-actions">
        <button class="ss-iconbtn ss-move" data-dir="-1" title="Subir"><i class="bi bi-chevron-up"></i></button>
        <button class="ss-iconbtn ss-move" data-dir="1" title="Bajar"><i class="bi bi-chevron-down"></i></button>
        <span class="flex-grow-1"></span>
        <button class="ss-iconbtn ss-edit" title="Editar"><i class="bi bi-pencil"></i></button>
        <button class="ss-iconbtn ss-iconbtn--danger ss-del" title="Eliminar"><i class="bi bi-trash"></i></button>
      </div>
    </div>`
}

/* ─── eventos ─────────────────────────────────────────────────────────── */

function attach(host) {
  attachShell(host)
  attachPanel(host)
}

/* Eventos del marco (toolbar + iframe). Se cablean una sola vez por montaje. */
function attachShell(host) {
  const preview = () => document.getElementById('ss-preview')

  host.querySelector('#ss-pantalla')?.addEventListener('change', (e) => seleccionarPantalla(e.target.value))
  host.querySelector('#ss-guardar')?.addEventListener('click', guardar)

  // reintenta pintar el modelo por si el iframe ya estaba listo
  if (state.iframeReady) postModel()
  else preview()?.addEventListener('load', () => {
    try { preview().contentWindow.postMessage({ type: 'signage:ping' }, '*') } catch { /* iframe aún no accesible */ }
  })

  fitWorkspace()
  requestAnimationFrame(fitWorkspace)
  setTimeout(fitWorkspace, 250)
  window.removeEventListener('resize', fitWorkspace)
  window.addEventListener('resize', fitWorkspace)
}

/* Eventos del panel lateral. Se re-cablean en cada renderPanel(). */
function attachPanel(host) {
  host.querySelectorAll('[data-acc-toggle]').forEach((b) =>
    b.addEventListener('click', () => { state.seccion = state.seccion === b.dataset.accToggle ? '' : b.dataset.accToggle; renderPanel() }),
  )

  host.querySelectorAll('[data-path]').forEach((el) => {
    const evt = el.type === 'range' ? 'input' : 'change'
    el.addEventListener(evt, () => {
      const path = el.dataset.path
      let v
      if (el.type === 'checkbox') v = el.checked
      else if (el.dataset.num) { v = Number(el.value); const b = host.querySelector(`[data-rng-val="${path}"]`); if (b) b.textContent = v + (path.endsWith('Pct') ? '%' : '') }
      else v = el.value
      setPath(state.layout, path, v)
      markDirty()
      postModel()
    })
  })

  host.querySelectorAll('[data-marca]').forEach((el) =>
    el.addEventListener('change', () => { state.marca[el.dataset.marca] = el.value.trim(); markDirty(); postModel() }),
  )

  host.querySelector('#ss-logo-file')?.addEventListener('change', onLogo)
  host.querySelector('#ss-logo-del')?.addEventListener('click', quitarLogo)

  host.querySelectorAll('[data-portal]').forEach((el) =>
    el.addEventListener('change', () => togglePortal(el.dataset.portal, el.checked)),
  )

  // medios
  host.querySelector('#ss-file')?.addEventListener('change', onSubir)
  host.querySelector('#ss-slide')?.addEventListener('click', () => editorCanvas(null))
  host.querySelector('#ss-yt')?.addEventListener('click', onYouTube)
  host.querySelectorAll('.ss-media-row').forEach((row) => {
    const id = row.dataset.id
    const m = state.medios.find((x) => x.id === id)
    row.querySelector('.ss-activo')?.addEventListener('change', (e) => cambiarMedio(id, { activo: e.target.checked }, m))
    row.querySelector('.ss-del')?.addEventListener('click', async () => {
      if (!confirm('¿Quitar este contenido de la cartelera?')) return
      try { await api.eliminarMedio(m.id, m.storage_path); AppToast.success('Contenido quitado.'); await recargarMedios() }
      catch (err) { AppToast.error(err.message) }
    })
    row.querySelector('.ss-edit')?.addEventListener('click', () => editarMedio(m))
    row.querySelectorAll('.ss-move').forEach((btn) => btn.addEventListener('click', () => moverMedio(id, Number(btn.dataset.dir))))
  })
}

function irASeccion(zona) {
  const map = { cabecera: 'cabecera', visualizador: 'visualizador', horario: 'horario' }
  state.seccion = map[zona] || state.seccion
  renderPanel()
  state.container.querySelector(`[data-acc="${state.seccion}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

/* ─── modelo → iframe ─────────────────────────────────────────────────── */

function buildModel() {
  return {
    layout: state.layout,
    marca: {
      institucion: state.marca.institucion,
      siglas: state.marca.siglas,
      logo: state.marca.logoPath ? api.urlPublica(state.marca.logoPath) : '',
    },
    media: state.medios.map((m) => ({
      tipo: m.tipo,
      storage_path: m.storage_path,
      youtube_url: m.youtube_url,
      contenido: m.contenido,
      titulo: m.titulo,
      credito: m.credito,
      duracion_seg: m.duracion_seg,
      orden: m.orden,
      activo: m.activo,
      vigente_desde: m.vigente_desde,
      vigente_hasta: m.vigente_hasta,
    })),
  }
}

/* Envía el modelo al iframe y reintenta hasta el acuse (signage:model-ack) o
   hasta agotar los intentos. Cubre la carrera de que el iframe todavía no tenga
   su listener puesto cuando se manda el primer postMessage. */
function postModel() {
  const iframe = document.getElementById('ss-preview')
  if (!iframe || !iframe.contentWindow) return

  state.modelSeq += 1
  const seq = state.modelSeq
  const msg = { type: 'signage:model', seq, model: buildModel() }

  clearInterval(state.modelRetry)
  let tries = 0
  const send = () => {
    const f = document.getElementById('ss-preview')
    if (!f || !f.contentWindow || seq !== state.modelSeq) { clearInterval(state.modelRetry); return }
    try { f.contentWindow.postMessage(msg, '*') } catch { /* iframe cross-origin momentáneo */ }
    if (++tries >= 6) clearInterval(state.modelRetry)   // ~2.4 s de reintentos
  }
  send()
  state.modelRetry = setInterval(send, 400)
}

function markDirty() {
  state.dirty = true
  const btn = document.getElementById('ss-guardar')
  if (btn) btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Guardar diseño'
}

async function togglePortal(portalId, on) {
  const prev = [...state.menuPortales]
  state.menuPortales = on
    ? [...new Set([...state.menuPortales, portalId])]
    : state.menuPortales.filter((x) => x !== portalId)
  try {
    await api.guardarMenuPortales(state.pantalla.id, state.menuPortales)
    state.pantalla.menu_portales = [...state.menuPortales]
    AppToast.success(on ? `Menú visible en ${portalId}.` : `Menú oculto en ${portalId}.`)
  } catch (e) {
    state.menuPortales = prev
    AppToast.error(e.message)
    renderPanel()
  }
}

async function guardar() {
  if (state.guardando) return
  state.guardando = true
  const btn = document.getElementById('ss-guardar')
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando…' }
  try {
    await api.guardarLayout(state.pantalla.id, state.layout)
    await api.guardarIdentidad(state.pantalla.id, state.marca)
    state.pantalla.layout = JSON.parse(JSON.stringify(state.layout))
    state.pantalla.institucion = state.marca.institucion
    state.pantalla.siglas = state.marca.siglas
    state.dirty = false
    AppToast.success('Diseño guardado. La pantalla se actualiza en 1–3 min.')
  } catch (e) {
    AppToast.error(e.message)
  } finally {
    state.guardando = false
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Guardado' }
  }
}

/* ─── medios (se guardan al momento) ──────────────────────────────────── */

async function recargarMedios() {
  state.medios = await api.listarMedios(state.pantalla.id)
  renderPanel()
  postModel()
}

async function onLogo(e) {
  const file = e.target.files && e.target.files[0]
  e.target.value = ''
  if (!file) return
  if (file.size > 4 * 1024 * 1024) { AppToast.error('El logo supera 4 MB.'); return }
  const t = AppToast.progress('Subiendo logo…')
  try {
    const path = await api.subirLogo(file)
    await api.guardarLogo(state.pantalla.id, path)
    state.marca.logoPath = path
    state.pantalla.logo_path = path
    t.success('Logo actualizado. La pantalla se refresca en 1–3 min.')
    renderPanel()
    postModel()
  } catch (err) { t.error(err.message) }
}

async function quitarLogo() {
  if (!confirm('¿Quitar el logo? Volverá a mostrarse el ✳.')) return
  try {
    await api.guardarLogo(state.pantalla.id, null)
    state.marca.logoPath = ''
    state.pantalla.logo_path = null
    AppToast.success('Logo quitado.')
    renderPanel()
    postModel()
  } catch (err) { AppToast.error(err.message) }
}

async function onSubir(e) {
  const file = e.target.files && e.target.files[0]
  e.target.value = ''
  if (!file) return
  if (file.size > 60 * 1024 * 1024) { AppToast.error('El archivo supera 60 MB.'); return }
  const tipo = file.type.startsWith('video') ? 'video' : 'imagen'
  const t = AppToast.progress('Subiendo…')
  try {
    const { path } = await api.subirArchivo(file)
    await api.crearMedio({
      tipo, titulo: file.name.replace(/\.[^.]+$/, ''), storage_path: path,
      duracion_seg: tipo === 'imagen' ? 12 : null,
      orden: (state.medios.length + 1) * 10, activo: true,
    })
    t.success('Contenido agregado.')
    await recargarMedios()
  } catch (err) { t.error(err.message) }
}

/* ─── editor de lienzo libre (arrastrar textos e imágenes) ───────────── */

const CV_GRAD = {
  oscuro: 'linear-gradient(135deg,#10192b,#0b0e17 75%)',
  dorado: 'linear-gradient(135deg,#2a2312,#0b0e17 72%)',
  azul: 'linear-gradient(135deg,#0a1b2e,#0b0e17 78%)',
  verde: 'linear-gradient(135deg,#10241c,#0b0e17 78%)',
}
const CV_FONT = { sans: 'system-ui,"Segoe UI",Roboto,sans-serif', serif: 'Georgia,"Times New Roman",serif' }
const cvUid = () => 'e' + Math.random().toString(36).slice(2, 8)

function editorCanvas(m) {
  const editar = !!(m && m.contenido && m.contenido.tipo === 'canvas')
  const cv = editar
    ? JSON.parse(JSON.stringify(m.contenido))
    : { tipo: 'canvas', w: 1280, h: 720, fondo: { tipo: 'gradiente', valor: 'oscuro' }, elementos: [] }
  cv.w = cv.w || 1280
  cv.h = cv.h || 720
  cv.elementos = cv.elementos || []
  let sel = null
  let scale = 1

  AppModal.open({
    title: editar ? 'Editar diapositiva' : 'Nueva diapositiva',
    saveText: editar ? 'Guardar' : 'Agregar',
    size: 'xl',
    deleteText: editar ? '<i class="bi bi-trash me-1"></i>Quitar' : '',
    onDelete: editar ? async () => {
      try { await api.eliminarMedio(m.id, null) } catch (e) { AppToast.error(e.message); return false }
      AppToast.success('Diapositiva quitada.'); await recargarMedios()
    } : null,
    body: `
      <div class="signage-studio ss-cv">
        <div class="ss-cv-tools">
          <button class="btn btn-sm btn-primary" data-cv="add-text"><i class="bi bi-fonts me-1"></i>Texto</button>
          <label class="btn btn-sm btn-outline-primary mb-0"><i class="bi bi-image me-1"></i>Imagen<input type="file" accept="image/*" hidden data-cv="add-img"></label>
          <span class="ss-cv-sep"></span>
          <select class="form-select form-select-sm" style="width:auto" data-cv="bg-kind">
            <option value="gradiente">Fondo: gradiente</option>
            <option value="color">Fondo: color</option>
            <option value="imagen">Fondo: imagen</option>
          </select>
          <select class="form-select form-select-sm" style="width:auto" data-cv="bg-grad">
            <option value="oscuro">Oscuro</option><option value="dorado">Dorado</option>
            <option value="azul">Azul</option><option value="verde">Verde</option>
          </select>
          <input type="color" class="form-control form-control-color form-control-sm" data-cv="bg-color" value="#0b0e17" hidden>
          <label class="btn btn-sm btn-outline-secondary mb-0" data-cv="bg-img-lbl" hidden>Subir fondo<input type="file" accept="image/*" hidden data-cv="bg-img"></label>
          <span class="ss-cv-sep"></span>
          <label class="d-flex align-items-center gap-1 small mb-0">Seg
            <input type="number" class="form-control form-control-sm" style="width:4.5rem" min="4" max="60" value="${(editar && m.duracion_seg) || 12}" data-cv="dur"></label>
        </div>
        <div class="ss-cv-body">
          <div class="ss-cv-stage" data-cv="stage"><div class="ss-cv-art" data-cv="art"></div></div>
          <div class="ss-cv-props" data-cv="props"></div>
        </div>
      </div>`,
    onShow: (body) => wireCanvas(body),
    onSave: async (body) => {
      if (!cv.elementos.length) { AppToast.error('Agrega al menos un texto o una imagen.'); return false }
      const d = Math.min(60, Math.max(4, Number(body.querySelector('[data-cv="dur"]')?.value) || 12))
      const txt = cv.elementos.find((e) => e.tipo === 'texto' && e.texto)
      const label = (txt ? txt.texto : 'Diapositiva').replace(/\s+/g, ' ').trim().slice(0, 42) || 'Diapositiva'
      const comun = { titulo: label, contenido: cv, duracion_seg: d }
      try {
        if (editar) await api.actualizarMedio(m.id, comun)
        else await api.crearMedio({ ...comun, tipo: 'slide', orden: (state.medios.length + 1) * 10, activo: true })
      } catch (e) { AppToast.error(e.message); return false }
      AppToast.success(editar ? 'Diapositiva actualizada.' : 'Diapositiva agregada.')
      await recargarMedios()
    },
  })

  function wireCanvas(body) {
    const art = body.querySelector('[data-cv="art"]')
    const stage = body.querySelector('[data-cv="stage"]')
    const props = body.querySelector('[data-cv="props"]')
    art.style.width = cv.w + 'px'
    art.style.height = cv.h + 'px'

    const fitScale = () => {
      const r = stage.getBoundingClientRect()
      scale = Math.max(0.08, Math.min((r.width - 28) / cv.w, (r.height - 28) / cv.h))
      art.style.transform = `scale(${scale})`
    }
    const bgCss = () => {
      const f = cv.fondo || {}
      if (f.tipo === 'imagen' && f.storage_path) return `#0b0e17 center/cover no-repeat url(${api.urlPublica(f.storage_path)})`
      if (f.tipo === 'color') return f.valor || '#0b0e17'
      return CV_GRAD[f.valor] || CV_GRAD.oscuro
    }

    function renderArt() {
      art.style.background = bgCss()
      art.innerHTML = cv.elementos.map((el) => {
        const base = `left:${el.x}px;top:${el.y}px;width:${el.w}px;height:${el.h}px;`
        const handle = sel === el.id ? '<span class="cvel-h" data-h="se"></span>' : ''
        if (el.tipo === 'imagen') {
          return `<div class="cvel${sel === el.id ? ' is-sel' : ''}" data-id="${el.id}" style="${base}">
            <img src="${el.storage_path ? escapeHTML(api.urlPublica(el.storage_path)) : ''}" draggable="false"
              style="width:100%;height:100%;object-fit:${el.ajuste === 'cover' ? 'cover' : 'contain'}">${handle}</div>`
        }
        const ts = base +
          `font-size:${el.tamano || 48}px;color:${el.color || '#fff'};font-weight:${el.peso || 700};` +
          `text-align:${el.align || 'left'};font-family:${CV_FONT[el.fuente] || CV_FONT.sans};` +
          `line-height:1.15;white-space:pre-wrap;overflow:hidden;display:flex;flex-direction:column;justify-content:center;` +
          (el.sombra ? 'text-shadow:0 2px 12px rgba(0,0,0,.55);' : '')
        return `<div class="cvel cvel--texto${sel === el.id ? ' is-sel' : ''}" data-id="${el.id}" style="${ts}">${escapeHTML(el.texto || '')}${handle}</div>`
      }).join('')
      renderProps()
    }

    function elById(id) { return cv.elementos.find((e) => e.id === id) }

    function renderProps() {
      const el = elById(sel)
      if (!el) { props.innerHTML = '<p class="text-muted small m-0">Seleccioná un elemento para editarlo. Doble clic en un texto para escribir.</p>'; return }
      const layerBtns = `<div class="d-flex gap-2 mt-1">
        <button class="btn btn-sm btn-outline-secondary" data-p="fwd">Al frente</button>
        <button class="btn btn-sm btn-outline-secondary" data-p="back">Atrás</button>
        <button class="btn btn-sm btn-outline-danger ms-auto" data-p="del"><i class="bi bi-trash"></i></button></div>`
      if (el.tipo === 'imagen') {
        props.innerHTML = `<div class="fw-semibold small mb-2">Imagen</div>
          <label class="d-block mb-2"><span class="small">Ajuste</span>
            <select class="form-select form-select-sm" data-p="ajuste">
              <option value="contain" ${el.ajuste !== 'cover' ? 'selected' : ''}>Completa</option>
              <option value="cover" ${el.ajuste === 'cover' ? 'selected' : ''}>Rellenar</option></select></label>${layerBtns}`
      } else {
        props.innerHTML = `<div class="fw-semibold small mb-2">Texto</div>
          <textarea class="form-control form-control-sm mb-2" rows="3" data-p="texto">${escapeHTML(el.texto || '')}</textarea>
          <label class="d-block mb-2"><span class="small">Tamaño: <b data-p-val>${el.tamano || 48}</b></span>
            <input type="range" class="form-range" min="16" max="260" value="${el.tamano || 48}" data-p="tamano"></label>
          <div class="row g-2 mb-2">
            <div class="col-6"><span class="small d-block">Color</span>
              <input type="color" class="form-control form-control-color form-control-sm w-100" value="${el.color || '#ffffff'}" data-p="color"></div>
            <div class="col-6"><span class="small d-block">Fuente</span>
              <select class="form-select form-select-sm" data-p="fuente">
                <option value="sans" ${el.fuente !== 'serif' ? 'selected' : ''}>Sans</option>
                <option value="serif" ${el.fuente === 'serif' ? 'selected' : ''}>Serif</option></select></div>
          </div>
          <div class="row g-2 mb-2">
            <div class="col-6"><span class="small d-block">Peso</span>
              <select class="form-select form-select-sm" data-p="peso">${[300, 400, 600, 700, 800, 900].map((w) => `<option ${String(el.peso || 700) === String(w) ? 'selected' : ''}>${w}</option>`).join('')}</select></div>
            <div class="col-6"><span class="small d-block">Alinear</span>
              <div class="btn-group btn-group-sm w-100">
                ${['left', 'center', 'right'].map((a) => `<button class="btn btn-outline-secondary ${(el.align || 'left') === a ? 'active' : ''}" data-p="align" data-v="${a}"><i class="bi bi-text-${a === 'center' ? 'center' : a}"></i></button>`).join('')}
              </div></div>
          </div>
          <label class="form-check form-switch small mb-1"><input class="form-check-input" type="checkbox" data-p="sombra" ${el.sombra ? 'checked' : ''}> Sombra</label>${layerBtns}`
      }
      props.querySelectorAll('[data-p]').forEach((node) => {
        const p = node.dataset.p
        if (p === 'del') return node.addEventListener('click', () => { cv.elementos = cv.elementos.filter((e) => e.id !== el.id); sel = null; renderArt() })
        if (p === 'fwd') return node.addEventListener('click', () => { const i = cv.elementos.indexOf(el); if (i > -1 && i < cv.elementos.length - 1) { cv.elementos.splice(i, 1); cv.elementos.push(el); renderArt() } })
        if (p === 'back') return node.addEventListener('click', () => { const i = cv.elementos.indexOf(el); if (i > 0) { cv.elementos.splice(i, 1); cv.elementos.unshift(el); renderArt() } })
        if (p === 'align') return node.addEventListener('click', () => { el.align = node.dataset.v; renderArt() })
        const ev = (node.type === 'range' || node.type === 'color' || node.tagName === 'TEXTAREA') ? 'input' : 'change'
        node.addEventListener(ev, () => {
          if (node.type === 'checkbox') el[p] = node.checked
          else if (p === 'tamano') { el.tamano = Number(node.value); const v = props.querySelector('[data-p-val]'); if (v) v.textContent = node.value }
          else el[p] = node.value
          if (p === 'tamano') syncStyle(el)
          else renderArt()
        })
      })
    }

    function node(el) { return art.querySelector(`.cvel[data-id="${el.id}"]`) }
    function syncStyle(el) {
      const n = node(el); if (n && el.tipo === 'texto') n.style.fontSize = (el.tamano || 48) + 'px'
    }

    // arrastre + resize
    let drag = null
    art.addEventListener('pointerdown', (e) => {
      const elNode = e.target.closest('.cvel')
      if (!elNode) { if (sel) { sel = null; renderArt() } return }
      const el = elById(elNode.dataset.id)
      if (!el) return
      if (sel !== el.id) { sel = el.id; renderArt() }
      drag = { el, mode: e.target.closest('.cvel-h') ? 'resize' : 'move', sx: e.clientX, sy: e.clientY, ox: el.x, oy: el.y, ow: el.w, oh: el.h }
      try { art.setPointerCapture(e.pointerId) } catch { /* sin soporte de pointer capture */ }
      e.preventDefault()
    })
    art.addEventListener('pointermove', (e) => {
      if (!drag) return
      const dx = (e.clientX - drag.sx) / scale
      const dy = (e.clientY - drag.sy) / scale
      if (drag.mode === 'move') { drag.el.x = Math.round(drag.ox + dx); drag.el.y = Math.round(drag.oy + dy) }
      else { drag.el.w = Math.max(40, Math.round(drag.ow + dx)); drag.el.h = Math.max(24, Math.round(drag.oh + dy)) }
      const n = node(drag.el)
      if (n) { n.style.left = drag.el.x + 'px'; n.style.top = drag.el.y + 'px'; n.style.width = drag.el.w + 'px'; n.style.height = drag.el.h + 'px' }
    })
    const endDrag = () => { drag = null }
    art.addEventListener('pointerup', endDrag)
    art.addEventListener('pointercancel', endDrag)
    art.addEventListener('dblclick', (e) => {
      const elNode = e.target.closest('.cvel--texto')
      if (!elNode) return
      const el = elById(elNode.dataset.id)
      elNode.setAttribute('contenteditable', 'true')
      elNode.focus()
      const done = () => { el.texto = elNode.innerText; elNode.removeAttribute('contenteditable'); elNode.removeEventListener('blur', done); renderArt() }
      elNode.addEventListener('blur', done)
    })

    // toolbar
    body.querySelector('[data-cv="add-text"]').addEventListener('click', () => {
      const el = { id: cvUid(), tipo: 'texto', x: 140, y: 280, w: 1000, h: 160, texto: 'Doble clic para escribir', tamano: 84, color: '#ffffff', peso: 700, align: 'center', fuente: 'sans', sombra: true }
      cv.elementos.push(el); sel = el.id; renderArt()
    })
    body.querySelector('[data-cv="add-img"]').addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0]; e.target.value = ''
      if (!file) return
      AppToast.info('Subiendo…')
      try {
        const { path } = await api.subirArchivo(file)
        const el = { id: cvUid(), tipo: 'imagen', x: 360, y: 150, w: 560, h: 420, storage_path: path, ajuste: 'contain' }
        cv.elementos.push(el); sel = el.id; renderArt()
      } catch (err) { AppToast.error(err.message) }
    })
    const bgKind = body.querySelector('[data-cv="bg-kind"]')
    const bgGrad = body.querySelector('[data-cv="bg-grad"]')
    const bgColor = body.querySelector('[data-cv="bg-color"]')
    const bgImgLbl = body.querySelector('[data-cv="bg-img-lbl"]')
    bgKind.value = (cv.fondo && cv.fondo.tipo) || 'gradiente'
    if (cv.fondo && cv.fondo.tipo === 'gradiente') bgGrad.value = cv.fondo.valor || 'oscuro'
    if (cv.fondo && cv.fondo.tipo === 'color') bgColor.value = cv.fondo.valor || '#0b0e17'
    const syncBg = () => {
      bgGrad.hidden = bgKind.value !== 'gradiente'
      bgColor.hidden = bgKind.value !== 'color'
      bgImgLbl.hidden = bgKind.value !== 'imagen'
    }
    syncBg()
    bgKind.addEventListener('change', () => {
      const k = bgKind.value
      cv.fondo = k === 'color' ? { tipo: 'color', valor: bgColor.value }
        : k === 'imagen' ? { tipo: 'imagen', storage_path: cv.fondo && cv.fondo.storage_path }
          : { tipo: 'gradiente', valor: bgGrad.value }
      syncBg(); renderArt()
    })
    bgGrad.addEventListener('change', () => { cv.fondo = { tipo: 'gradiente', valor: bgGrad.value }; renderArt() })
    bgColor.addEventListener('input', () => { cv.fondo = { tipo: 'color', valor: bgColor.value }; renderArt() })
    body.querySelector('[data-cv="bg-img"]').addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0]; e.target.value = ''
      if (!file) return
      AppToast.info('Subiendo fondo…')
      try { const { path } = await api.subirArchivo(file); cv.fondo = { tipo: 'imagen', storage_path: path }; renderArt() }
      catch (err) { AppToast.error(err.message) }
    })

    renderArt()
    setTimeout(fitScale, 60)
    setTimeout(fitScale, 320)
    window.addEventListener('resize', fitScale)
    const obs = new MutationObserver(() => {
      if (!body.isConnected) { window.removeEventListener('resize', fitScale); obs.disconnect() }
    })
    obs.observe(document.body, { childList: true, subtree: true })
  }
}

function onYouTube() {
  AppModal.open({
    title: 'Agregar vídeo de YouTube',
    saveText: 'Agregar',
    body: `
      <div class="signage-studio">
        <label class="d-block mb-3">
          <span class="d-block mb-1 small fw-semibold">Enlace de YouTube</span>
          <input type="url" id="ssm-url" class="form-control" placeholder="https://www.youtube.com/watch?v=…" autocomplete="off">
        </label>
        <label class="d-block mb-1">
          <span class="d-block mb-1 small fw-semibold">Título (opcional)</span>
          <input type="text" id="ssm-titulo" class="form-control" placeholder="Nombre para identificarlo">
        </label>
        <p class="small text-muted mt-2 mb-0"><i class="bi bi-info-circle me-1"></i>La pantalla descargará el vídeo para reproducirlo sin cortes.</p>
      </div>`,
    onSave: async () => {
      const url = (document.getElementById('ssm-url')?.value || '').trim()
      const vid = api.youtubeId(url)
      if (!vid) { AppToast.error('No reconozco ese enlace de YouTube.'); return false }
      const titulo = (document.getElementById('ssm-titulo')?.value || '').trim() || null
      try {
        await api.crearMedio({
          tipo: 'youtube', titulo, youtube_url: url, youtube_video_id: vid,
          orden: (state.medios.length + 1) * 10, activo: true,
        })
      } catch (err) { AppToast.error(err.message); return false }
      AppToast.success('Vídeo agregado.')
      await recargarMedios()
    },
  })
}

/* ─── diapositivas (plantillas nativas, sin Canva) ───────────────────── */

const SLIDE_TPLS = [
  ['titulo', 'Título grande'],
  ['evento', 'Evento (fecha + lugar)'],
  ['aviso', 'Aviso'],
  ['cita', 'Frase / cita'],
]
const SLIDE_FONDOS = [
  ['oscuro', 'Oscuro'], ['dorado', 'Dorado'], ['azul', 'Azul'], ['verde', 'Verde'],
]

function editorSlide(m) {
  const editar = !!m
  const c = (editar && m.contenido) || {}
  const f = c.fondo || { tipo: 'gradiente', valor: 'oscuro' }
  const v = (x) => escapeHTML(x == null ? '' : String(x))
  const grp = (tpls, inner) => `<div class="sl-group" data-tpl="${tpls}">${inner}</div>`
  const campo = (id, label, val, ph = '') =>
    `<label class="d-block mb-2"><span class="d-block mb-1 small fw-semibold">${label}</span>
      <input type="text" id="${id}" class="form-control" value="${v(val)}" placeholder="${ph}"></label>`
  const area = (id, label, val, ph = '') =>
    `<label class="d-block mb-2"><span class="d-block mb-1 small fw-semibold">${label}</span>
      <textarea id="${id}" class="form-control" rows="3" placeholder="${ph}">${v(val)}</textarea></label>`

  AppModal.open({
    title: editar ? 'Editar diapositiva' : 'Nueva diapositiva',
    saveText: editar ? 'Guardar' : 'Agregar',
    size: 'lg',
    deleteText: editar ? '<i class="bi bi-trash me-1"></i>Quitar' : '',
    onDelete: editar ? async () => {
      try { await api.eliminarMedio(m.id, null) } catch (e) { AppToast.error(e.message); return false }
      AppToast.success('Diapositiva quitada.')
      await recargarMedios()
    } : null,
    body: `
      <div class="signage-studio">
        <label class="d-block mb-3"><span class="d-block mb-1 small fw-semibold">Plantilla</span>
          <select id="sl-tpl" class="form-select">
            ${SLIDE_TPLS.map(([k, l]) => `<option value="${k}" ${c.plantilla === k ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </label>

        ${grp('titulo evento aviso', campo('sl-titulo', 'Título', c.titulo, 'Texto principal'))}
        ${grp('titulo', campo('sl-subtitulo', 'Subtítulo (opcional)', c.subtitulo))}
        ${grp('evento', campo('sl-fecha', 'Fecha', c.fecha, 'Sábado 6 de septiembre'))}
        ${grp('evento', `<div class="row g-2 mb-2">
          <div class="col-7"><label class="d-block"><span class="d-block mb-1 small fw-semibold">Lugar</span>
            <input type="text" id="sl-lugar" class="form-control" value="${v(c.lugar)}" placeholder="Teatro Nacional"></label></div>
          <div class="col-5"><label class="d-block"><span class="d-block mb-1 small fw-semibold">Hora</span>
            <input type="text" id="sl-hora" class="form-control" value="${v(c.hora)}" placeholder="19:00"></label></div>
        </div>`)}
        ${grp('aviso', campo('sl-icono', 'Ícono / emoji (opcional)', c.icono, '📣'))}
        ${grp('aviso', area('sl-cuerpo-aviso', 'Cuerpo', c.cuerpo))}
        ${grp('cita', area('sl-cuerpo-cita', 'Frase', c.cuerpo))}
        ${grp('cita', campo('sl-autor', 'Autor (opcional)', c.autor))}

        <hr class="my-2">
        <div class="row g-2 mb-2">
          <div class="col-6"><label class="d-block"><span class="d-block mb-1 small fw-semibold">Fondo</span>
            <select id="sl-bg-valor" class="form-select">
              ${SLIDE_FONDOS.map(([k, l]) => `<option value="${k}" ${f.tipo !== 'color' && f.valor === k ? 'selected' : ''}>${l}</option>`).join('')}
              <option value="__color" ${f.tipo === 'color' ? 'selected' : ''}>Color sólido…</option>
            </select></label></div>
          <div class="col-6" id="sl-bg-color-wrap" style="${f.tipo === 'color' ? '' : 'display:none'}">
            <label class="d-block"><span class="d-block mb-1 small fw-semibold">Color</span>
              <input type="color" id="sl-bg-color" class="form-control form-control-color" value="${f.tipo === 'color' ? v(f.valor) : '#0b0e17'}"></label>
          </div>
        </div>
        <div class="row g-2">
          <div class="col-4"><label class="d-block"><span class="d-block mb-1 small fw-semibold">Segundos</span>
            <input type="number" id="sl-dur" class="form-control" min="4" max="60" value="${(editar && m.duracion_seg) || 12}"></label></div>
          <div class="col-4"><label class="d-block"><span class="d-block mb-1 small fw-semibold">Desde</span>
            <input type="date" id="sl-desde" class="form-control" value="${editar ? v(m.vigente_desde) : ''}"></label></div>
          <div class="col-4"><label class="d-block"><span class="d-block mb-1 small fw-semibold">Hasta</span>
            <input type="date" id="sl-hasta" class="form-control" value="${editar ? v(m.vigente_hasta) : ''}"></label></div>
        </div>
        <p class="small text-muted mt-2 mb-0">La diapositiva aparece en la vista previa de la izquierda al guardar.</p>
      </div>`,
    onShow: (body) => {
      const tplSel = body.querySelector('#sl-tpl')
      const sync = () => {
        const t = tplSel.value
        body.querySelectorAll('.sl-group').forEach((g) => {
          g.style.display = g.dataset.tpl.split(' ').includes(t) ? '' : 'none'
        })
      }
      tplSel.addEventListener('change', sync)
      sync()
      const bgSel = body.querySelector('#sl-bg-valor')
      const bgWrap = body.querySelector('#sl-bg-color-wrap')
      bgSel.addEventListener('change', () => { bgWrap.style.display = bgSel.value === '__color' ? '' : 'none' })
    },
    onSave: async (body) => {
      const g = (id) => (body.querySelector('#' + id)?.value || '').trim()
      const plantilla = g('sl-tpl')
      const cuerpo = plantilla === 'cita' ? g('sl-cuerpo-cita') : g('sl-cuerpo-aviso')
      const bgVal = g('sl-bg-valor')
      const fondo = bgVal === '__color'
        ? { tipo: 'color', valor: g('sl-bg-color') || '#0b0e17' }
        : { tipo: 'gradiente', valor: bgVal }
      const contenido = {
        plantilla,
        titulo: g('sl-titulo') || null,
        subtitulo: g('sl-subtitulo') || null,
        fecha: g('sl-fecha') || null,
        lugar: g('sl-lugar') || null,
        hora: g('sl-hora') || null,
        icono: g('sl-icono') || null,
        cuerpo: cuerpo || null,
        autor: g('sl-autor') || null,
        fondo,
      }
      const label = contenido.titulo || contenido.fecha || (contenido.cuerpo || '').slice(0, 40) || 'Diapositiva'
      if (!contenido.titulo && !contenido.cuerpo && !contenido.fecha) {
        AppToast.error('Escribe al menos un título, una fecha o un texto.'); return false
      }
      const dur = Math.min(60, Math.max(4, Number(g('sl-dur')) || 12))
      const comun = {
        titulo: label, contenido, duracion_seg: dur,
        vigente_desde: g('sl-desde') || null, vigente_hasta: g('sl-hasta') || null,
      }
      try {
        if (editar) await api.actualizarMedio(m.id, comun)
        else await api.crearMedio({ ...comun, tipo: 'slide', orden: (state.medios.length + 1) * 10, activo: true })
      } catch (e) { AppToast.error(e.message); return false }
      AppToast.success(editar ? 'Diapositiva actualizada.' : 'Diapositiva agregada.')
      await recargarMedios()
    },
  })
}

async function cambiarMedio(id, cambios, m) {
  try {
    await api.actualizarMedio(id, cambios)
    Object.assign(m, cambios)
    postModel()
  } catch (err) { AppToast.error(err.message); await recargarMedios() }
}

function editarMedio(m) {
  if (m.tipo === 'slide') {
    if (m.contenido?.tipo === 'canvas') editorCanvas(m)
    else editorSlide(m)
    return
  }
  const esImagen = m.tipo === 'imagen'
  const val = (x) => escapeHTML(x == null ? '' : String(x))
  AppModal.open({
    title: 'Editar contenido',
    saveText: 'Guardar',
    deleteText: '<i class="bi bi-trash me-1"></i>Quitar',
    onDelete: async () => {
      try { await api.eliminarMedio(m.id, m.storage_path) }
      catch (err) { AppToast.error(err.message); return false }
      AppToast.success('Contenido quitado.')
      await recargarMedios()
    },
    body: `
      <div class="signage-studio">
        <label class="d-block mb-3">
          <span class="d-block mb-1 small fw-semibold">Título</span>
          <input type="text" id="ssm-titulo" class="form-control" value="${val(m.titulo)}">
        </label>
        <label class="d-block mb-3">
          <span class="d-block mb-1 small fw-semibold">Crédito / bajada (opcional)</span>
          <input type="text" id="ssm-credito" class="form-control" value="${val(m.credito)}" placeholder="Ej: Departamento Académico">
        </label>
        ${esImagen ? `
        <label class="d-block mb-3">
          <span class="d-block mb-1 small fw-semibold">Segundos en pantalla</span>
          <input type="number" id="ssm-dur" class="form-control" style="max-width:8rem" min="3" max="120" value="${m.duracion_seg || 12}">
        </label>` : ''}
        <div class="row g-2">
          <div class="col-6"><label class="d-block">
            <span class="d-block mb-1 small fw-semibold">Mostrar desde</span>
            <input type="date" id="ssm-desde" class="form-control" value="${val(m.vigente_desde)}">
          </label></div>
          <div class="col-6"><label class="d-block">
            <span class="d-block mb-1 small fw-semibold">Mostrar hasta</span>
            <input type="date" id="ssm-hasta" class="form-control" value="${val(m.vigente_hasta)}">
          </label></div>
        </div>
        <p class="small text-muted mt-2 mb-0">Deja las fechas en blanco para mostrarlo siempre.</p>
      </div>`,
    onSave: async () => {
      const cambios = {
        titulo: (document.getElementById('ssm-titulo')?.value || '').trim() || null,
        credito: (document.getElementById('ssm-credito')?.value || '').trim() || null,
        vigente_desde: (document.getElementById('ssm-desde')?.value || '').trim() || null,
        vigente_hasta: (document.getElementById('ssm-hasta')?.value || '').trim() || null,
      }
      if (esImagen) {
        const d = Number(document.getElementById('ssm-dur')?.value)
        cambios.duracion_seg = Math.min(120, Math.max(3, d || 12))
      }
      try { await api.actualizarMedio(m.id, cambios) }
      catch (err) { AppToast.error(err.message); return false }
      await recargarMedios()
    },
  })
}

async function moverMedio(id, dir) {
  const i = state.medios.findIndex((m) => m.id === id)
  const j = i + dir
  if (i < 0 || j < 0 || j >= state.medios.length) return
  const arr = [...state.medios]
  ;[arr[i], arr[j]] = [arr[j], arr[i]]
  state.medios = arr
  renderPanel()
  postModel()
  try { await api.reordenarMedios(arr.map((m) => m.id)) }
  catch (err) { AppToast.error(err.message); await recargarMedios() }
}

/* ─── helpers path a.b.c ─────────────────────────────────────────────── */
function getPath(obj, path) { return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj) }
function setPath(obj, path, val) {
  const ks = path.split('.'); const last = ks.pop()
  const t = ks.reduce((o, k) => (o[k] = o[k] || {}), obj)
  t[last] = val
}
