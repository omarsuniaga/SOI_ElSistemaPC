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
  marca: { institucion: '', siglas: '' },
  menuPortales: [],
  medios: [],
  seccion: 'cabecera',
  dirty: false,
  guardando: false,
  iframeReady: false,
}

export async function renderSignageStudioView(container) {
  if (container.cleanup) container.cleanup()
  state.container = container
  container.innerHTML = shell('<div class="text-center text-muted py-5"><span class="spinner-border spinner-border-sm me-2"></span>Cargando…</div>')

  const cerrar = () => window.removeEventListener('message', onMessage)
  const onMessage = (ev) => {
    // el router borra el DOM sin llamar cleanup al navegar fuera: auto-desmontar
    if (!state.container || !state.container.isConnected) { cerrar(); return }
    const d = ev.data
    if (!d || typeof d !== 'object' || String(d.type || '').indexOf('signage:') !== 0) return
    if (d.type === 'signage:ready') { state.iframeReady = true; postModel() }
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
      <div class="card border-0 shadow-sm rounded-4 p-2 p-md-3 bg-body mb-3 border border-body-tertiary">
        <div class="d-flex flex-wrap justify-content-between align-items-center" style="gap:.85rem">
          <div class="d-flex align-items-center gap-2">
            <div class="p-2 rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center"><i class="bi bi-tv fs-5"></i></div>
            <div>
              <h5 class="fw-bold mb-0 text-body">Cartelera — Estudio</h5>
              <small class="text-muted d-block" style="font-size:.75rem">Vista previa en vivo de la pantalla del vestíbulo</small>
            </div>
          </div>
          <div id="ss-toolbar" class="d-flex align-items-center flex-wrap" style="gap:.6rem"></div>
        </div>
      </div>
      <div id="ss-body">${inner}</div>
    </div>`
}

function render() {
  const host = state.container
  host.innerHTML = shell('')
  renderToolbar()
  renderBody()
  attach(host)
}

function renderToolbar() {
  const tb = document.getElementById('ss-toolbar')
  const opts = state.pantallas
    .map((p) => `<option value="${p.id}" ${p.id === state.pantalla.id ? 'selected' : ''}>${escapeHTML(p.nombre || p.slug)}</option>`)
    .join('')
  tb.innerHTML = `
    ${state.pantallas.length > 1 ? `<select class="form-select form-select-sm" id="ss-pantalla" style="width:auto">${opts}</select>` : ''}
    <a class="btn btn-sm btn-outline-secondary" href="/signage/index.html" target="_blank" rel="noopener" title="Abrir la cartelera en una pestaña">
      <i class="bi bi-box-arrow-up-right me-1"></i>Abrir
    </a>
    <button class="btn btn-sm btn-primary" id="ss-guardar" ${state.guardando ? 'disabled' : ''}>
      <i class="bi bi-check-lg me-1"></i>${state.dirty ? 'Guardar diseño' : 'Guardado'}
    </button>`
}

function renderBody() {
  document.getElementById('ss-body').innerHTML = `
    <div class="row g-3 ss-grid">
      <div class="col-12 col-xl-7">
        <div class="ss-preview-card card border border-body-tertiary rounded-4 overflow-hidden">
          <div class="ss-preview-frame">
            <iframe id="ss-preview" src="${PREVIEW_SRC}" title="Vista previa de la cartelera"
              referrerpolicy="no-referrer" loading="eager"></iframe>
          </div>
          <div class="card-footer bg-body-tertiary d-flex align-items-center gap-2 small text-muted">
            <i class="bi bi-broadcast text-success"></i>
            Refleja tus cambios al instante. La pantalla real se actualiza 1–3 min después de guardar.
          </div>
        </div>
      </div>
      <div class="col-12 col-xl-5">
        <div class="ss-panel">${panelHTML()}</div>
      </div>
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
      <button class="btn btn-sm btn-outline-danger" id="ss-yt"><i class="bi bi-youtube me-1"></i>YouTube</button>
    </div>
    <div class="ss-media-list">${filas}</div>`
}

function medioRow(m) {
  const url = m.storage_path ? api.urlPublica(m.storage_path) : null
  const thumb = m.tipo === 'imagen' && url
    ? `<img src="${escapeHTML(url)}" alt="" class="ss-thumb">`
    : `<div class="ss-thumb ss-thumb--icon"><i class="bi bi-${m.tipo === 'video' ? 'film' : 'youtube'}"></i></div>`
  const vig = [m.vigente_desde, m.vigente_hasta].filter(Boolean).join(' → ')
  return `
    <div class="ss-media-row d-flex align-items-center gap-2" data-id="${m.id}">
      <div class="d-flex flex-column">
        <button class="btn btn-sm btn-link p-0 ss-move" data-dir="-1" title="Subir"><i class="bi bi-chevron-up"></i></button>
        <button class="btn btn-sm btn-link p-0 ss-move" data-dir="1" title="Bajar"><i class="bi bi-chevron-down"></i></button>
      </div>
      ${thumb}
      <div class="flex-grow-1 min-w-0">
        <div class="fw-semibold text-truncate small">${escapeHTML(m.titulo || m.youtube_url || m.storage_path || 'Sin título')}</div>
        <div class="text-muted" style="font-size:.72rem">
          ${{ imagen: 'Imagen', video: 'Vídeo', youtube: 'YouTube' }[m.tipo] || m.tipo}
          ${m.duracion_seg ? ` · ${m.duracion_seg}s` : ''}${vig ? ` · ${escapeHTML(vig)}` : ''}
        </div>
      </div>
      <label class="form-check form-switch m-0" title="Activo">
        <input class="form-check-input ss-activo" type="checkbox" ${m.activo ? 'checked' : ''}>
      </label>
      <button class="btn btn-sm btn-outline-secondary ss-edit" title="Editar"><i class="bi bi-pencil"></i></button>
      <button class="btn btn-sm btn-outline-danger ss-del" title="Eliminar"><i class="bi bi-trash"></i></button>
    </div>`
}

/* ─── eventos ─────────────────────────────────────────────────────────── */

function attach(host) {
  const preview = () => document.getElementById('ss-preview')

  host.querySelector('#ss-pantalla')?.addEventListener('change', (e) => seleccionarPantalla(e.target.value))
  host.querySelector('#ss-guardar')?.addEventListener('click', guardar)

  host.querySelectorAll('[data-acc-toggle]').forEach((b) =>
    b.addEventListener('click', () => { state.seccion = state.seccion === b.dataset.accToggle ? '' : b.dataset.accToggle; render() }),
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

  host.querySelectorAll('[data-portal]').forEach((el) =>
    el.addEventListener('change', () => togglePortal(el.dataset.portal, el.checked)),
  )

  // medios
  host.querySelector('#ss-file')?.addEventListener('change', onSubir)
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

  // reintenta pintar el modelo por si el iframe ya estaba listo
  if (state.iframeReady) postModel()
  else preview()?.addEventListener('load', () => { try { preview().contentWindow.postMessage({ type: 'signage:ping' }, '*') } catch { /* iframe aún no accesible */ } })
}

function irASeccion(zona) {
  const map = { cabecera: 'cabecera', visualizador: 'visualizador', horario: 'horario' }
  state.seccion = map[zona] || state.seccion
  render()
  state.container.querySelector(`[data-acc="${state.seccion}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

/* ─── modelo → iframe ─────────────────────────────────────────────────── */

function postModel() {
  const iframe = document.getElementById('ss-preview')
  if (!iframe || !iframe.contentWindow) return
  const model = {
    layout: state.layout,
    marca: state.marca,
    media: state.medios.map((m) => ({
      tipo: m.tipo,
      storage_path: m.storage_path,
      youtube_url: m.youtube_url,
      titulo: m.titulo,
      credito: m.credito,
      duracion_seg: m.duracion_seg,
      orden: m.orden,
      activo: m.activo,
      vigente_desde: m.vigente_desde,
      vigente_hasta: m.vigente_hasta,
    })),
  }
  iframe.contentWindow.postMessage({ type: 'signage:model', model }, '*')
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
    render()
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
  render()
  postModel()
}

async function onSubir(e) {
  const file = e.target.files && e.target.files[0]
  e.target.value = ''
  if (!file) return
  if (file.size > 60 * 1024 * 1024) { AppToast.error('El archivo supera 60 MB.'); return }
  const tipo = file.type.startsWith('video') ? 'video' : 'imagen'
  AppToast.info('Subiendo…')
  try {
    const { path } = await api.subirArchivo(file)
    await api.crearMedio({
      tipo, titulo: file.name.replace(/\.[^.]+$/, ''), storage_path: path,
      duracion_seg: tipo === 'imagen' ? 12 : null,
      orden: (state.medios.length + 1) * 10, activo: true,
    })
    AppToast.success('Contenido agregado.')
    await recargarMedios()
  } catch (err) { AppToast.error(err.message) }
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

async function cambiarMedio(id, cambios, m) {
  try {
    await api.actualizarMedio(id, cambios)
    Object.assign(m, cambios)
    postModel()
  } catch (err) { AppToast.error(err.message); await recargarMedios() }
}

function editarMedio(m) {
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
  render()
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
