/**
 * signagePantallaView.js — Panel de control de la cartelera (pantalla del vestíbulo).
 *
 * Dos secciones:
 *   1. Diseño de zonas   → qué mostrar en cabecera / central / sidebar / footer
 *   2. Biblioteca de medios → imágenes, vídeos y links de YouTube de la rotación
 *
 * Escribe solo en signage_pantallas / signage_media / bucket 'signage'.
 * El horario y el calendario NO se editan aquí (salen de datos de SOI).
 */
import '../styles/signage-admin.css'
import { escapeHTML } from '../../../shared/utils/sanitize.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import * as api from '../api/signageAdminApi.js'

const state = {
  pantallas: [],
  pantalla: null,
  layout: null,
  medios: [],
  seccion: 'zonas', // 'zonas' | 'medios'
  guardando: false,
}

export async function renderSignagePantallaView(container) {
  if (container.cleanup) container.cleanup()
  state.container = container
  container.innerHTML = shellHTML('Cargando…')

  try {
    state.pantallas = await api.listarPantallas()
    if (!state.pantallas.length) {
      container.innerHTML = shellHTML(
        '<div class="alert alert-warning">No hay pantallas registradas. Crea una fila en <code>signage_pantallas</code>.</div>',
      )
      return
    }
    state.pantalla = state.pantallas[0]
    state.layout = api.mergeLayout(state.pantalla.layout)
    await cargarMedios()
    render()
  } catch (e) {
    container.innerHTML = shellHTML(`<div class="alert alert-danger">${escapeHTML(e.message)}</div>`)
  }

  container.cleanup = () => {}
}

async function cargarMedios() {
  state.medios = await api.listarMedios(state.pantalla.id)
}

/* ─── layout HTML ──────────────────────────────────────────────────────── */

function shellHTML(inner) {
  return `
    <div class="page-container signage-admin">
      <div class="card border-0 shadow-sm rounded-4 p-2 p-md-3 bg-body mb-3 border border-body-tertiary">
        <div class="d-flex flex-wrap justify-content-between align-items-center" style="gap:.85rem">
          <div class="d-flex align-items-center gap-2">
            <div class="p-2 rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center">
              <i class="bi bi-tv fs-5"></i>
            </div>
            <div>
              <h5 class="fw-bold mb-0 text-body">Cartelera — Pantalla informativa</h5>
              <small class="text-muted d-block" style="font-size:.75rem">Vestíbulo · lo que se ve en la pantalla del hall</small>
            </div>
          </div>
          <div id="sa-toolbar" class="d-flex align-items-center flex-wrap" style="gap:.6rem"></div>
        </div>
      </div>
      <div id="sa-body">${inner}</div>
    </div>`
}

function render() {
  const c = state.container
  c.innerHTML = shellHTML('')
  renderToolbar()
  renderBody()
  attach()
}

function renderToolbar() {
  const tb = document.getElementById('sa-toolbar')
  const opts = state.pantallas
    .map((p) => `<option value="${p.id}" ${p.id === state.pantalla.id ? 'selected' : ''}>${escapeHTML(p.nombre)}</option>`)
    .join('')
  tb.innerHTML = `
    ${state.pantallas.length > 1 ? `<select class="form-select form-select-sm" id="sa-pantalla" style="width:auto">${opts}</select>` : ''}
    <div class="btn-group btn-group-sm" role="group">
      <button class="btn ${state.seccion === 'zonas' ? 'btn-primary' : 'btn-outline-secondary'}" data-sec="zonas">
        <i class="bi bi-layout-wtf me-1"></i>Diseño de zonas
      </button>
      <button class="btn ${state.seccion === 'medios' ? 'btn-primary' : 'btn-outline-secondary'}" data-sec="medios">
        <i class="bi bi-collection-play me-1"></i>Medios <span class="badge bg-secondary ms-1">${state.medios.length}</span>
      </button>
    </div>`
}

function renderBody() {
  const b = document.getElementById('sa-body')
  b.innerHTML = state.seccion === 'zonas' ? zonasHTML() : mediosHTML()
}

/* ─── SECCIÓN: ZONAS ───────────────────────────────────────────────────── */

function chk(path, label, hint) {
  const val = getPath(state.layout, path)
  return `
    <label class="form-check form-switch d-flex align-items-center gap-2 py-1">
      <input class="form-check-input" type="checkbox" data-path="${path}" ${val ? 'checked' : ''}>
      <span>${escapeHTML(label)}${hint ? `<small class="text-muted d-block" style="font-size:.72rem">${escapeHTML(hint)}</small>` : ''}</span>
    </label>`
}
function sel(path, label, options) {
  const val = getPath(state.layout, path)
  const opts = options.map(([v, t]) => `<option value="${v}" ${v === val ? 'selected' : ''}>${escapeHTML(t)}</option>`).join('')
  return `
    <label class="d-block py-1">
      <span class="d-block mb-1">${escapeHTML(label)}</span>
      <select class="form-select form-select-sm" data-path="${path}">${opts}</select>
    </label>`
}
function txt(path, label, ph) {
  const val = getPath(state.layout, path) || ''
  return `
    <label class="d-block py-1">
      <span class="d-block mb-1">${escapeHTML(label)}</span>
      <input type="text" class="form-control form-control-sm" data-path="${path}" value="${escapeHTML(val)}" placeholder="${escapeHTML(ph || '')}">
    </label>`
}
function num(path, label, min, max) {
  const val = getPath(state.layout, path)
  return `
    <label class="d-block py-1">
      <span class="d-block mb-1">${escapeHTML(label)}</span>
      <input type="number" class="form-control form-control-sm" data-path="${path}" value="${val}" min="${min}" max="${max}" style="width:6rem">
    </label>`
}

function zonaCard(icon, titulo, visiblePath, inner) {
  const vis = getPath(state.layout, visiblePath)
  return `
    <div class="col-12 col-lg-6">
      <div class="card border border-body-tertiary rounded-4 h-100">
        <div class="card-header bg-body-tertiary d-flex align-items-center justify-content-between">
          <span class="fw-semibold"><i class="bi ${icon} me-2"></i>${escapeHTML(titulo)}</span>
          <label class="form-check form-switch m-0">
            <input class="form-check-input" type="checkbox" data-path="${visiblePath}" ${vis ? 'checked' : ''}>
          </label>
        </div>
        <div class="card-body ${vis ? '' : 'opacity-50'}" data-zonebody>${inner}</div>
      </div>
    </div>`
}

function zonasHTML() {
  const L = state.layout
  return `
    <div class="row g-3">
      ${zonaCard('bi-window-sidebar', 'Cabecera', 'cabecera.visible', `
        ${chk('cabecera.marca', 'Logo y nombre de la institución')}
        ${chk('cabecera.reloj', 'Reloj')}
        ${chk('cabecera.fecha', 'Fecha del día')}
        ${sel('cabecera.centro', 'Contenido del centro', [['calendario', 'Eventos del mes (rotando)'], ['texto', 'Texto fijo'], ['nada', 'Nada']])}
        ${L.cabecera.centro === 'texto' ? txt('cabecera.texto', 'Texto de la cabecera', 'Bienvenidos…') : ''}
      `)}
      ${zonaCard('bi-easel2', 'Espacio central', null, `
        ${sel('central.contenido', 'Qué mostrar', [['media', 'Imágenes y vídeos (rotación)'], ['mensaje', 'Un mensaje a pantalla']])}
        ${L.central.contenido === 'mensaje' ? txt('central.mensaje', 'Mensaje', 'Texto grande centrado') : ''}
        ${L.central.contenido === 'media' ? chk('central.leyendas', 'Mostrar pie de foto (título y crédito)') : ''}
        ${L.central.contenido === 'media' ? sel('central.ajuste', 'Ajuste de imagen', [['contain', 'Completa (sin recortar)'], ['cover', 'Rellenar (recorta bordes)']]) : ''}
      `)}
      ${zonaCard('bi-list-columns-reverse', 'Sidebar — horario', 'sidebar.visible', `
        ${chk('sidebar.hoy', 'Clases de hoy')}
        ${chk('sidebar.manana', 'Clases de mañana')}
        <hr class="my-2">
        <div class="text-muted small mb-1">Detalle por clase (menos = más compacto):</div>
        ${chk('sidebar.instrumento', 'Instrumento')}
        ${chk('sidebar.salon', 'Salón')}
        ${chk('sidebar.maestro', 'Maestro')}
        <hr class="my-2">
        ${num('sidebar.anchoPct', 'Ancho del sidebar (%)', 20, 45)}
        <small class="text-muted">El tamaño de letra se ajusta solo para que entren todas las clases en una columna.</small>
      `)}
      ${zonaCard('bi-card-text', 'Footer', 'footer.visible', `
        ${sel('footer.contenido', 'Contenido', [['calendario', 'Eventos del mes (marquesina)'], ['texto', 'Texto fijo'], ['nada', 'Nada']])}
        ${L.footer.contenido === 'texto' ? txt('footer.texto', 'Texto del footer', 'Aviso o bienvenida…') : ''}
        ${num('footer.altoPct', 'Alto del footer (%)', 5, 15)}
      `)}
    </div>

    <div class="d-flex justify-content-end gap-2 mt-3">
      <button class="btn btn-outline-secondary btn-sm" id="sa-reset-zonas">Descartar cambios</button>
      <button class="btn btn-primary btn-sm" id="sa-guardar-zonas" ${state.guardando ? 'disabled' : ''}>
        <i class="bi bi-check-lg me-1"></i>Guardar diseño
      </button>
    </div>`
}

/* ─── SECCIÓN: MEDIOS ──────────────────────────────────────────────────── */

function mediosHTML() {
  const rows = state.medios.length
    ? state.medios.map(medioRow).join('')
    : `<div class="text-center text-muted py-5"><i class="bi bi-collection fs-2 d-block mb-2"></i>Sin medios. Sube una imagen o agrega un vídeo de YouTube.</div>`
  return `
    <div class="d-flex flex-wrap gap-2 mb-3">
      <label class="btn btn-primary btn-sm mb-0">
        <i class="bi bi-upload me-1"></i>Subir imagen / vídeo
        <input type="file" id="sa-file" accept="image/*,video/mp4,video/webm" hidden>
      </label>
      <button class="btn btn-outline-danger btn-sm" id="sa-add-yt">
        <i class="bi bi-youtube me-1"></i>Agregar link de YouTube
      </button>
      <div class="ms-auto small text-muted align-self-center">Arrastra con ▲▼ para ordenar la rotación.</div>
    </div>
    <div class="list-group signage-media-list" id="sa-media-list">${rows}</div>`
}

function medioRow(m) {
  const url = m.storage_path ? api.urlPublica(m.storage_path) : null
  const thumb =
    m.tipo === 'imagen' && url
      ? `<img src="${escapeHTML(url)}" alt="" class="sa-thumb">`
      : m.tipo === 'video'
        ? `<div class="sa-thumb sa-thumb--icon"><i class="bi bi-film"></i></div>`
        : `<div class="sa-thumb sa-thumb--icon"><i class="bi bi-youtube text-danger"></i></div>`
  const tipoBadge = { imagen: 'Imagen', video: 'Vídeo', youtube: 'YouTube' }[m.tipo] || m.tipo
  const vig = [m.vigente_desde, m.vigente_hasta].filter(Boolean).join(' → ')
  return `
    <div class="list-group-item d-flex align-items-center gap-3" data-id="${m.id}">
      <div class="d-flex flex-column">
        <button class="btn btn-sm btn-link p-0 sa-move" data-dir="-1" title="Subir"><i class="bi bi-chevron-up"></i></button>
        <button class="btn btn-sm btn-link p-0 sa-move" data-dir="1" title="Bajar"><i class="bi bi-chevron-down"></i></button>
      </div>
      ${thumb}
      <div class="flex-grow-1 min-w-0">
        <div class="fw-semibold text-truncate">${escapeHTML(m.titulo || (m.youtube_url || m.storage_path || 'Sin título'))}</div>
        <div class="small text-muted">
          <span class="badge bg-secondary-subtle text-secondary-emphasis">${tipoBadge}</span>
          ${m.credito ? ` · ${escapeHTML(m.credito)}` : ''}
          ${m.duracion_seg ? ` · ${m.duracion_seg}s` : ''}
          ${vig ? ` · vigencia ${escapeHTML(vig)}` : ''}
        </div>
      </div>
      <label class="form-check form-switch m-0" title="Activo en la rotación">
        <input class="form-check-input sa-activo" type="checkbox" ${m.activo ? 'checked' : ''}>
      </label>
      <button class="btn btn-sm btn-outline-secondary sa-edit" title="Editar"><i class="bi bi-pencil"></i></button>
      <button class="btn btn-sm btn-outline-danger sa-del" title="Eliminar"><i class="bi bi-trash"></i></button>
    </div>`
}

/* ─── eventos ──────────────────────────────────────────────────────────── */

function attach() {
  const c = state.container

  c.querySelector('#sa-pantalla')?.addEventListener('change', async (e) => {
    state.pantalla = state.pantallas.find((p) => p.id === e.target.value)
    state.layout = api.mergeLayout(state.pantalla.layout)
    await cargarMedios()
    render()
  })

  c.querySelectorAll('[data-sec]').forEach((b) =>
    b.addEventListener('click', () => { state.seccion = b.dataset.sec; render() }),
  )

  if (state.seccion === 'zonas') attachZonas(c)
  else attachMedios(c)
}

function attachZonas(c) {
  c.querySelectorAll('[data-path]').forEach((el) => {
    el.addEventListener('change', () => {
      const path = el.dataset.path
      let v
      if (el.type === 'checkbox') v = el.checked
      else if (el.type === 'number') v = clampNum(el)
      else v = el.value
      setPath(state.layout, path, v)
      // re-render para reflejar campos condicionales (texto/mensaje…)
      renderBody(); attachZonas(c)
    })
  })
  c.querySelector('#sa-guardar-zonas')?.addEventListener('click', guardarZonas)
  c.querySelector('#sa-reset-zonas')?.addEventListener('click', () => {
    state.layout = api.mergeLayout(state.pantalla.layout)
    render()
  })
}

async function guardarZonas() {
  if (state.guardando) return
  state.guardando = true
  try {
    await api.guardarLayout(state.pantalla.id, state.layout)
    state.pantalla.layout = JSON.parse(JSON.stringify(state.layout))
    AppToast.success('Diseño guardado. La pantalla se actualiza en 1–3 min.')
  } catch (e) {
    AppToast.error(e.message)
  } finally {
    state.guardando = false
  }
}

function attachMedios(c) {
  c.querySelector('#sa-file')?.addEventListener('change', onSubir)
  c.querySelector('#sa-add-yt')?.addEventListener('click', onAgregarYouTube)

  c.querySelectorAll('#sa-media-list .list-group-item').forEach((row) => {
    const id = row.dataset.id
    const m = state.medios.find((x) => x.id === id)
    row.querySelector('.sa-activo')?.addEventListener('change', async (e) => {
      try { await api.actualizarMedio(id, { activo: e.target.checked }); m.activo = e.target.checked }
      catch (err) { AppToast.error(err.message); e.target.checked = m.activo }
    })
    row.querySelector('.sa-del')?.addEventListener('click', async () => {
      if (!confirm('¿Eliminar este medio de la cartelera?')) return
      try { await api.eliminarMedio(id, m.storage_path); await recargarMedios() }
      catch (err) { AppToast.error(err.message) }
    })
    row.querySelector('.sa-edit')?.addEventListener('click', () => editarMedio(m))
    row.querySelectorAll('.sa-move').forEach((btn) =>
      btn.addEventListener('click', () => moverMedio(id, Number(btn.dataset.dir))),
    )
  })
}

async function recargarMedios() {
  await cargarMedios()
  render()
}

async function onSubir(e) {
  const file = e.target.files && e.target.files[0]
  e.target.value = ''
  if (!file) return
  const MAX = 60 * 1024 * 1024
  if (file.size > MAX) { AppToast.error('El archivo supera 60 MB.'); return }
  const tipo = file.type.startsWith('video') ? 'video' : 'imagen'
  AppToast.info('Subiendo…')
  try {
    const { path } = await api.subirArchivo(file)
    await api.crearMedio({
      pantalla_id: null,
      tipo,
      titulo: file.name.replace(/\.[^.]+$/, ''),
      storage_path: path,
      duracion_seg: tipo === 'imagen' ? 12 : null,
      orden: (state.medios.length + 1) * 10,
      activo: true,
    })
    AppToast.success('Medio agregado.')
    await recargarMedios()
  } catch (err) {
    AppToast.error(err.message)
  }
}

async function onAgregarYouTube() {
  const url = prompt('Pega el link de YouTube:')
  if (!url) return
  const vid = api.youtubeId(url)
  if (!vid) { AppToast.error('No reconozco ese link de YouTube.'); return }
  const titulo = prompt('Título (opcional):') || null
  try {
    await api.crearMedio({
      pantalla_id: null,
      tipo: 'youtube',
      titulo,
      youtube_url: url,
      youtube_video_id: vid,
      orden: (state.medios.length + 1) * 10,
      activo: true,
    })
    AppToast.success('Vídeo de YouTube agregado. Se descargará en la pantalla para reproducirlo.')
    await recargarMedios()
  } catch (err) {
    AppToast.error(err.message)
  }
}

async function editarMedio(m) {
  const titulo = prompt('Título:', m.titulo || '')
  if (titulo === null) return
  const credito = prompt('Crédito (opcional):', m.credito || '')
  const dur = m.tipo === 'imagen' ? prompt('Segundos en pantalla:', m.duracion_seg || 12) : null
  try {
    const cambios = { titulo: titulo || null, credito: credito || null }
    if (dur !== null) cambios.duracion_seg = Math.max(3, Number(dur) || 12)
    await api.actualizarMedio(m.id, cambios)
    await recargarMedios()
  } catch (err) {
    AppToast.error(err.message)
  }
}

async function moverMedio(id, dir) {
  const idx = state.medios.findIndex((m) => m.id === id)
  const j = idx + dir
  if (idx < 0 || j < 0 || j >= state.medios.length) return
  const arr = [...state.medios]
  ;[arr[idx], arr[j]] = [arr[j], arr[idx]]
  state.medios = arr
  render()
  try { await api.reordenarMedios(arr.map((m) => m.id)) }
  catch (err) { AppToast.error(err.message); await recargarMedios() }
}

/* ─── helpers path a.b.c ───────────────────────────────────────────────── */
function getPath(obj, path) {
  if (!path) return undefined
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj)
}
function setPath(obj, path, val) {
  const ks = path.split('.')
  const last = ks.pop()
  const t = ks.reduce((o, k) => (o[k] = o[k] || {}), obj)
  t[last] = val
}
function clampNum(el) {
  let n = Number(el.value)
  if (Number.isNaN(n)) n = Number(el.min)
  n = Math.min(Number(el.max), Math.max(Number(el.min), n))
  el.value = n
  return n
}
