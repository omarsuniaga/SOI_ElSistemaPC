/**
 * documentosPublicosView.js — panel administrativo de Documentos públicos y códigos QR.
 *
 * Lista de publicaciones + detalle (QR PNG/SVG, URL permanente, reemplazo de archivo,
 * publicar/despublicar/archivar, historial de versiones y auditoría). La autorización real
 * la imponen la base de datos y Storage; esta vista solo refleja el resultado.
 */
import { escapeHTML } from '../../../shared/utils/sanitize.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { renderAccessDenied } from '../../../core/auth/accessControl.js'
import { renderPageHeader } from '../../../shared/components/pageShell.js'
import * as api from '../api/documentosPublicosApi.js'
import { ESTADOS, CATEGORIAS, categoriaLabel, transicionesDisponibles, ACCION_LABEL } from '../lib/estados.js'
import { buildPublicUrl, generateQrSvg, generateQrPngDataUrl, dataUrlToBlob, downloadBlob, qrFileName } from '../lib/qr.js'
import { formatBytes, ALLOWED_TYPES } from '../lib/fileValidation.js'

const state = { container: null, items: [], filtro: '', selectedId: null }

// 'YYYY-MM-DD' se interpreta como fecha local (new Date('2026-10-17') sería UTC y mostraría el día anterior).
const fmtDate = (iso) => (iso ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00:00` : iso).toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: 'numeric' }) : '—')
const fmtDateTime = (iso) => (iso ? new Date(iso).toLocaleString('es-DO') : '—')
/** Fecha de hoy en hora local (toISOString() daría el día UTC, adelantado por la noche en RD). */
export const todayLocal = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
const badge = (estado) => `<span class="badge ${ESTADOS[estado]?.badge ?? 'bg-secondary'}">${escapeHTML(ESTADOS[estado]?.label ?? estado)}</span>`

export async function renderDocumentosPublicosView(container) {
  state.container = container
  state.selectedId = null
  container.innerHTML = '<div class="p-4 text-center text-muted"><span class="spinner-border spinner-border-sm me-2"></span>Cargando documentos…</div>'
  try {
    // El shell ADM no aplica ROUTE_PERMISSIONS: se verifica aquí (UX); la base de datos es la autoridad.
    if (!(await api.puedeGestionar())) {
      container.innerHTML = renderAccessDenied('Solo administradores pueden gestionar documentos públicos.')
      return
    }
    state.items = await api.listarPublicaciones()
    renderList()
  } catch (error) {
    container.innerHTML = `<div class="p-4 text-center text-danger"><i class="bi bi-exclamation-triangle fs-3 d-block mb-2"></i>${escapeHTML(error.message)}</div>`
  }
}

async function refresh(keepSelection = true) {
  state.items = await api.listarPublicaciones()
  if (keepSelection && state.selectedId) await renderDetail(state.selectedId)
  else renderList()
}

function renderList() {
  state.selectedId = null
  const items = state.items.filter((p) => !state.filtro || p.estado === state.filtro)
  const rows = items.map((p) => `
    <tr data-id="${escapeHTML(p.id)}" style="cursor:pointer">
      <td><div class="fw-semibold">${escapeHTML(p.titulo)}</div><div class="small text-muted">/d/${escapeHTML(p.slug)}</div></td>
      <td>${escapeHTML(categoriaLabel(p.categoria))}</td>
      <td>${badge(p.estado)}</td>
      <td class="text-nowrap">${escapeHTML(fmtDate(p.fecha_documento))}</td>
      <td class="text-nowrap">${p.version ? `v${p.version.numero} · ${escapeHTML(p.version.extension.toUpperCase())} · ${escapeHTML(formatBytes(p.version.size_bytes))}` : '<span class="text-muted">sin documento</span>'}</td>
      <td class="text-nowrap small text-muted">${escapeHTML(fmtDateTime(p.updated_at))}</td>
    </tr>`).join('')
  const filtros = ['', 'borrador', 'publicado', 'archivado']
    .map((f) => `<button type="button" class="btn btn-sm ${state.filtro === f ? 'btn-primary' : 'btn-outline-secondary'}" data-filtro="${f}">${f ? ESTADOS[f].label : 'Todas'}</button>`).join('')
  state.container.innerHTML = `
    <div class="container-fluid py-3">
      ${renderPageHeader({
        icon: 'bi-qr-code',
        title: 'Documentos públicos',
        subtitle: 'Publica PDF e imágenes con una dirección permanente y un código QR.',
        actionsHtml: '<button class="btn btn-primary" id="dpNueva"><i class="bi bi-plus-lg me-1"></i>Nueva publicación</button>',
      })}
      <div class="d-flex gap-2 flex-wrap mb-3">${filtros}</div>
      <div class="card"><div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead><tr><th>Publicación</th><th>Categoría</th><th>Estado</th><th>Fecha</th><th>Archivo</th><th>Actualizada</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="6" class="text-center text-muted py-4">No hay publicaciones.</td></tr>'}</tbody>
        </table>
      </div></div>
    </div>`
  state.container.querySelector('#dpNueva').onclick = () => openForm()
  state.container.querySelectorAll('[data-filtro]').forEach((b) => { b.onclick = () => { state.filtro = b.dataset.filtro; renderList() } })
  state.container.querySelectorAll('tr[data-id]').forEach((tr) => { tr.onclick = () => renderDetail(tr.dataset.id) })
}

function formHtml(p = {}) {
  const cats = CATEGORIAS.map((c) => `<option value="${c.value}" ${c.value === (p.categoria ?? 'general') ? 'selected' : ''}>${escapeHTML(c.label)}</option>`).join('')
  return `
    <div class="mb-3"><label class="form-label">Título</label>
      <input class="form-control" id="dpTitulo" maxlength="160" value="${escapeHTML(p.titulo ?? '')}" required></div>
    <div class="mb-3"><label class="form-label">Descripción</label>
      <textarea class="form-control" id="dpDescripcion" rows="3" maxlength="2000">${escapeHTML(p.descripcion ?? '')}</textarea></div>
    <div class="row g-3">
      <div class="col-6"><label class="form-label">Fecha del documento</label>
        <input type="date" class="form-control" id="dpFecha" value="${escapeHTML(p.fecha_documento ?? todayLocal())}"></div>
      <div class="col-6"><label class="form-label">Categoría</label><select class="form-select" id="dpCategoria">${cats}</select></div>
    </div>`
}

function readForm(body) {
  return {
    titulo: body.querySelector('#dpTitulo').value.trim(),
    descripcion: body.querySelector('#dpDescripcion').value.trim(),
    fecha: body.querySelector('#dpFecha').value,
    categoria: body.querySelector('#dpCategoria').value,
  }
}

function openForm(p = null) {
  AppModal.open({
    title: p ? 'Editar publicación' : 'Nueva publicación',
    body: formHtml(p ?? {}),
    saveText: p ? 'Guardar cambios' : 'Crear',
    onSave: async (body) => {
      const data = readForm(body)
      if (data.titulo.length < 3) { AppToast.error('El título debe tener al menos 3 caracteres.'); return false }
      try {
        if (p) {
          await api.actualizarPublicacion(p.id, data)
          AppToast.success('Datos actualizados.')
          await refresh(true)
        } else {
          const created = await api.crearPublicacion(data)
          AppToast.success('Publicación creada. Suba ahora el documento.')
          state.items = await api.listarPublicaciones()
          await renderDetail(created.id)
        }
      } catch (error) {
        AppToast.error(error.message)
        return false
      }
    },
  })
}

async function renderDetail(id) {
  state.selectedId = id
  const [p, versiones, eventos] = await Promise.all([api.obtenerPublicacion(id), api.listarVersiones(id), api.listarEventos(id)])
  if (!p) { renderList(); return }
  const url = buildPublicUrl(p.slug)
  const acciones = transicionesDisponibles(p.estado, !!p.version_actual_id)
    .map((t) => `<button class="btn btn-${t.variant} btn-sm" data-estado="${t.hacia}"><i class="bi ${t.icon} me-1"></i>${escapeHTML(t.label)}</button>`).join(' ')
  const verRows = versiones.map((v) => `
    <tr>
      <td>v${v.numero}${v.id === p.version_actual_id ? ' <span class="badge bg-primary">vigente</span>' : ''}</td>
      <td>${escapeHTML(v.nombre_original)}<div class="small text-muted">${escapeHTML(v.motivo ?? '')}</div></td>
      <td class="text-nowrap">${escapeHTML(formatBytes(v.size_bytes))}</td>
      <td class="text-nowrap small">${escapeHTML(fmtDateTime(v.created_at))}</td>
      <td class="text-nowrap small text-muted" title="SHA-256 ${escapeHTML(v.sha256)}">${escapeHTML(v.sha256.slice(0, 10))}…</td>
      <td class="text-end text-nowrap">
        <button class="btn btn-sm btn-outline-secondary" data-ver="${escapeHTML(v.storage_path)}" title="Ver archivo"><i class="bi bi-eye"></i></button>
        ${v.id !== p.version_actual_id && p.estado !== 'archivado' ? `<button class="btn btn-sm btn-outline-primary" data-activar="${escapeHTML(v.id)}" title="Volver a esta versión"><i class="bi bi-arrow-counterclockwise"></i></button>` : ''}
      </td>
    </tr>`).join('')
  const evRows = eventos.map((e) => `<li class="list-group-item small d-flex justify-content-between"><span>${escapeHTML(ACCION_LABEL[e.accion] ?? e.accion)}</span><span class="text-muted">${escapeHTML(fmtDateTime(e.created_at))}</span></li>`).join('')
  const accept = Object.values(ALLOWED_TYPES).map((t) => `.${t.ext}`).join(',')

  state.container.innerHTML = `
    <div class="container-fluid py-3">
      <button class="btn btn-link px-0 mb-2" id="dpVolver"><i class="bi bi-arrow-left me-1"></i>Todas las publicaciones</button>
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
        <div><h2 class="h4 mb-1">${escapeHTML(p.titulo)} ${badge(p.estado)}</h2>
          <div class="text-muted small">${escapeHTML(categoriaLabel(p.categoria))} · ${escapeHTML(fmtDate(p.fecha_documento))}</div>
          ${p.descripcion ? `<p class="mt-2 mb-0">${escapeHTML(p.descripcion)}</p>` : ''}</div>
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn btn-outline-secondary btn-sm" id="dpEditar"><i class="bi bi-pencil me-1"></i>Editar datos</button>${acciones}
        </div>
      </div>
      <div class="row g-3">
        <div class="col-lg-4"><div class="card h-100"><div class="card-body text-center">
          <h3 class="h6">Código QR</h3>
          <div id="dpQr" class="mx-auto mb-3" style="max-width:240px"></div>
          <div class="input-group input-group-sm mb-2"><input class="form-control" readonly value="${escapeHTML(url)}" id="dpUrl"><button class="btn btn-outline-secondary" id="dpCopiar" title="Copiar"><i class="bi bi-clipboard"></i></button></div>
          <div class="d-flex gap-2 justify-content-center">
            <button class="btn btn-primary btn-sm" id="dpPng"><i class="bi bi-download me-1"></i>PNG</button>
            <button class="btn btn-primary btn-sm" id="dpSvg"><i class="bi bi-download me-1"></i>SVG</button>
          </div>
          <p class="small text-muted mt-3 mb-0">El QR apunta a la dirección permanente: reemplazar el documento no lo invalida.${p.estado !== 'publicado' ? ' <strong>Aún no está publicada: la página mostrará “no disponible”.</strong>' : ''}</p>
        </div></div></div>
        <div class="col-lg-8"><div class="card h-100"><div class="card-body">
          <h3 class="h6">${p.version_actual_id ? 'Reemplazar documento' : 'Subir documento'}</h3>
          <div class="row g-2 align-items-end">
            <div class="col-md-5"><input type="file" class="form-control form-control-sm" id="dpArchivo" accept="${accept}"></div>
            <div class="col-md-5"><input class="form-control form-control-sm" id="dpMotivo" maxlength="500" placeholder="Motivo del cambio (opcional)"></div>
            <div class="col-md-2 d-grid"><button class="btn btn-success btn-sm" id="dpSubir" ${p.estado === 'archivado' ? 'disabled' : ''}><i class="bi bi-upload me-1"></i>Subir</button></div>
          </div>
          <div class="small text-muted mt-1">PDF, JPG, PNG o WebP · máximo 10 MB · se valida el contenido real del archivo.</div>
          <h3 class="h6 mt-4">Historial de versiones</h3>
          <div class="table-responsive"><table class="table table-sm align-middle mb-0">
            <thead><tr><th>Versión</th><th>Archivo</th><th>Tamaño</th><th>Fecha</th><th>Huella</th><th></th></tr></thead>
            <tbody>${verRows || '<tr><td colspan="6" class="text-muted text-center py-3">Aún no hay documento.</td></tr>'}</tbody></table></div>
        </div></div></div>
        <div class="col-12"><div class="card"><div class="card-body">
          <h3 class="h6">Registro de actividad</h3>
          <ul class="list-group list-group-flush">${evRows}</ul>
        </div></div></div>
      </div>
    </div>`

  const $ = (s) => state.container.querySelector(s)
  $('#dpVolver').onclick = async () => { state.items = await api.listarPublicaciones(); renderList() }
  $('#dpEditar').onclick = () => openForm(p)
  state.container.querySelectorAll('[data-estado]').forEach((b) => {
    b.onclick = async () => {
      try { await api.cambiarEstado(p.id, b.dataset.estado); AppToast.success('Estado actualizado.'); await refresh(true) } catch (e) { AppToast.error(e.message) }
    }
  })
  $('#dpSubir').onclick = async () => {
    const file = $('#dpArchivo').files[0]
    const btn = $('#dpSubir')
    btn.disabled = true
    try {
      await api.subirVersion(p.id, file, $('#dpMotivo').value.trim() || null)
      AppToast.success('Documento cargado. La dirección y el QR no cambiaron.')
      await refresh(true)
    } catch (e) { AppToast.error(e.message); btn.disabled = false }
  }
  state.container.querySelectorAll('[data-ver]').forEach((b) => {
    b.onclick = async () => {
      try { const u = await api.urlArchivoAdmin(b.dataset.ver); if (u) window.open(u, '_blank', 'noopener'); else AppToast.info('En modo Demo solo se pueden abrir archivos subidos en esta sesión.') } catch (e) { AppToast.error(e.message) }
    }
  })
  state.container.querySelectorAll('[data-activar]').forEach((b) => {
    b.onclick = async () => {
      try { await api.activarVersion(p.id, b.dataset.activar); AppToast.success('Versión reactivada.'); await refresh(true) } catch (e) { AppToast.error(e.message) }
    }
  })
  $('#dpCopiar').onclick = async () => { try { await navigator.clipboard.writeText(url); AppToast.success('Dirección copiada.') } catch { AppToast.info('Copie la dirección manualmente.') } }

  const svg = await generateQrSvg(url)
  $('#dpQr').innerHTML = svg.replace('<svg', '<svg style="width:100%;height:auto"')
  $('#dpSvg').onclick = () => downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), qrFileName(p.slug, 'svg'))
  $('#dpPng').onclick = async () => downloadBlob(dataUrlToBlob(await generateQrPngDataUrl(url)), qrFileName(p.slug, 'png'))
}
