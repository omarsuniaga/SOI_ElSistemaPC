/**
 * seguimientoView.js — CRM de seguimiento de comunicaciones (portal COM).
 * Dos bloques:
 *   1. Agenda de follow-up: vencidos / hoy / próximos ("a quién llamar hoy")
 *   2. Historial de interacciones, filtrable, con registrar/editar/cerrar.
 *
 * Exporta openRegistroSeguimientoModal(contacto, onSaved) para reuso desde el Directorio.
 * Patrón: retorna { teardown() } (AbortController).
 */

import '../styles/comunicaciones.css'
import * as api from '../api/seguimientoApi.js'
import {
  CANALES,
  RESULTADOS,
  clasificarAgenda,
  diasParaProxima,
} from '../domain/seguimiento.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'

const state = {
  registros: [],
  filtroCanal: 'todos',
  filtroEstado: 'abierto',
}

let _abort = null

export async function renderSeguimientoView(container) {
  _abort?.abort()
  _abort = new AbortController()

  container.innerHTML = `<div class="d-flex justify-content-center align-items-center" style="min-height:300px">
    <div class="spinner-border text-primary"></div></div>`
  try {
    state.registros = await api.getSeguimientos()
    renderContent(container)
  } catch (err) {
    console.error('[Seguimiento] Error:', err)
    container.innerHTML = `<div class="container mt-4"><div class="alert alert-danger">
      <h5><i class="bi bi-exclamation-triangle"></i> Error al cargar seguimiento</h5>
      <p>${escapeHTML(err.message)}</p></div></div>`
  }
  return { teardown: () => _abort?.abort() }
}

function renderContent(container) {
  const agenda = clasificarAgenda(state.registros)
  const filtrados = filtrar()

  container.innerHTML = `
    <div class="page-container comm-portal">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge rounded-3 d-flex align-items-center justify-content-center"
            style="width:42px;height:42px;background:rgba(219,39,119,0.1);color:#db2777">
            <i class="bi bi-telephone-outbound fs-4"></i>
          </div>
          <div>
            <h1 class="mb-0 h3">Seguimiento de Comunicaciones</h1>
            <p class="text-muted small mb-0">Registro de interacciones · agenda de próximos pasos</p>
          </div>
        </div>
        <button class="btn btn-primary" id="segNuevo"><i class="bi bi-plus-lg me-1"></i>Registrar interacción</button>
      </div>

      <!-- Agenda de follow-up -->
      <div class="row g-3 mb-4">
        ${columnaAgenda('Vencidos', agenda.vencidos, 'danger', 'bi-exclamation-octagon')}
        ${columnaAgenda('Para hoy', agenda.hoy, 'warning', 'bi-calendar-day')}
        ${columnaAgenda('Próximos', agenda.proximos, 'info', 'bi-calendar-week')}
      </div>

      <!-- Historial -->
      <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
        <h6 class="fw-bold mb-0"><i class="bi bi-clock-history me-1"></i>Historial de interacciones</h6>
        <div class="d-flex gap-2">
          <select class="form-select form-select-sm" id="segFiltroEstado" style="max-width:140px">
            <option value="todos" ${state.filtroEstado === 'todos' ? 'selected' : ''}>Todos</option>
            <option value="abierto" ${state.filtroEstado === 'abierto' ? 'selected' : ''}>Abiertos</option>
            <option value="cerrado" ${state.filtroEstado === 'cerrado' ? 'selected' : ''}>Cerrados</option>
          </select>
          <select class="form-select form-select-sm" id="segFiltroCanal" style="max-width:140px">
            <option value="todos">Todo canal</option>
            ${Object.entries(CANALES).map(([k, v]) => `<option value="${k}" ${state.filtroCanal === k ? 'selected' : ''}>${v.label}</option>`).join('')}
          </select>
        </div>
      </div>
      <div id="segLista">
        ${
          filtrados.length === 0
            ? `<div class="alert alert-info text-center py-4"><i class="bi bi-inbox"></i> No hay interacciones para este filtro</div>`
            : filtrados.map(tarjetaRegistro).join('')
        }
      </div>
    </div>
  `
  attach(container)
}

function columnaAgenda(titulo, lista, color, icon) {
  return `
    <div class="col-md-4">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-header bg-${color} bg-opacity-10 border-0 d-flex align-items-center justify-content-between">
          <span class="fw-bold text-${color}"><i class="bi ${icon} me-1"></i>${titulo}</span>
          <span class="badge bg-${color}">${lista.length}</span>
        </div>
        <div class="card-body p-2" style="max-height:240px;overflow-y:auto">
          ${
            lista.length === 0
              ? `<p class="text-muted small text-center mb-0 py-3">Sin pendientes</p>`
              : lista
                  .map(
                    (r) => `
            <button class="btn btn-light btn-sm w-100 text-start mb-1 seg-agenda-item" data-id="${r.id}">
              <div class="fw-semibold small">${escapeHTML(r.contacto_nombre || 'Contacto')}</div>
              <div class="text-muted extra-small">${escapeHTML(r.proxima_accion || 'Seguimiento')}</div>
            </button>`,
                  )
                  .join('')
          }
        </div>
      </div>
    </div>
  `
}

function tarjetaRegistro(r) {
  const canal = CANALES[r.canal] || CANALES.otro
  const res = RESULTADOS[r.resultado] || { label: r.resultado, color: 'secondary' }
  const dias = r.requiere_seguimiento ? diasParaProxima(r) : null
  const vencClass = dias === null ? 'text-muted' : dias < 0 ? 'text-danger' : dias === 0 ? 'text-warning' : 'text-muted'
  return `
    <div class="card border-0 shadow-sm mb-2 seg-card" data-id="${r.id}">
      <div class="card-body p-3">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div class="flex-grow-1">
            <div class="d-flex align-items-center gap-2 mb-1">
              <i class="bi ${canal.icon} text-primary"></i>
              <span class="fw-semibold">${escapeHTML(r.contacto_nombre || 'Contacto')}</span>
              <span class="badge bg-${res.color} bg-opacity-75">${res.label}</span>
              ${r.estado === 'cerrado' ? '<span class="badge bg-secondary">Cerrado</span>' : ''}
            </div>
            ${r.notas ? `<p class="small text-secondary mb-1">${escapeHTML(r.notas)}</p>` : ''}
            ${
              r.requiere_seguimiento && r.proxima_fecha
                ? `<div class="small ${vencClass}"><i class="bi bi-arrow-return-right"></i>
                    ${escapeHTML(r.proxima_accion || 'Seguimiento')} · ${r.proxima_fecha}${dias !== null && dias < 0 ? ' (vencido)' : dias === 0 ? ' (hoy)' : ''}</div>`
                : ''
            }
          </div>
          <div class="text-end flex-shrink-0">
            <div class="text-muted extra-small mb-1">${new Date(r.fecha).toLocaleDateString('es-DO')}</div>
            <button class="btn btn-sm btn-outline-secondary seg-edit" data-id="${r.id}" title="Editar"><i class="bi bi-pencil"></i></button>
            ${r.estado === 'abierto' ? `<button class="btn btn-sm btn-outline-success seg-cerrar" data-id="${r.id}" title="Cerrar"><i class="bi bi-check2"></i></button>` : ''}
          </div>
        </div>
      </div>
    </div>
  `
}

function filtrar() {
  let res = [...state.registros]
  if (state.filtroEstado !== 'todos') res = res.filter((r) => r.estado === state.filtroEstado)
  if (state.filtroCanal !== 'todos') res = res.filter((r) => r.canal === state.filtroCanal)
  return res
}

function attach(container) {
  const signal = _abort.signal
  container.querySelector('#segNuevo')?.addEventListener('click', () => openRegistroSeguimientoModal(null, () => renderSeguimientoView(container)), { signal })

  container.querySelector('#segFiltroEstado')?.addEventListener('change', (e) => { state.filtroEstado = e.target.value; renderContent(container) }, { signal })
  container.querySelector('#segFiltroCanal')?.addEventListener('change', (e) => { state.filtroCanal = e.target.value; renderContent(container) }, { signal })

  const abrirPorId = (id) => {
    const r = state.registros.find((x) => x.id === id)
    if (r) openRegistroSeguimientoModal(r, () => renderSeguimientoView(container))
  }
  container.querySelectorAll('.seg-agenda-item, .seg-edit').forEach((b) =>
    b.addEventListener('click', () => abrirPorId(b.dataset.id), { signal }),
  )

  container.querySelectorAll('.seg-cerrar').forEach((b) =>
    b.addEventListener('click', async () => {
      try {
        await api.cerrarSeguimiento(b.dataset.id)
        AppToast.show('Seguimiento cerrado', 'success')
        renderSeguimientoView(container)
      } catch (err) {
        AppToast.show(`Error: ${err.message}`, 'error')
      }
    }, { signal }),
  )
}

/**
 * Abre el modal para registrar/editar una interacción.
 * @param {object|null} registro — null para nuevo; objeto para editar.
 * @param {function} [onSaved] — callback tras guardar.
 * @param {object} [contactoPrefill] — datos de contacto del Directorio (alumno_id, nombre, tel, email).
 */
export function openRegistroSeguimientoModal(registro, onSaved, contactoPrefill = null) {
  const esNuevo = !registro
  const r = registro || {
    alumno_id: contactoPrefill?.alumnoId || null,
    contacto_nombre: contactoPrefill?.alumno || contactoPrefill?.contactoNombre || '',
    contacto_telefono: contactoPrefill?.whatsapp || '',
    contacto_email: contactoPrefill?.email || '',
    canal: 'llamada',
    fecha: new Date().toISOString(),
    resultado: 'contactado',
    notas: '',
    requiere_seguimiento: false,
    proxima_accion: '',
    proxima_fecha: '',
    estado: 'abierto',
  }
  const hoy = new Date().toISOString().slice(0, 10)

  AppModal.open({
    title: esNuevo ? 'Registrar interacción' : 'Editar seguimiento',
    size: 'lg',
    body: `
      <div class="row g-2 mb-2">
        <div class="col-md-6"><label class="form-label small fw-semibold">Contacto *</label>
          <input type="text" class="form-control form-control-sm" id="segNombre" value="${escapeHTML(r.contacto_nombre || '')}"></div>
        <div class="col-md-6"><label class="form-label small fw-semibold">Teléfono</label>
          <input type="text" class="form-control form-control-sm" id="segTel" value="${escapeHTML(r.contacto_telefono || '')}"></div>
      </div>
      <div class="row g-2 mb-2">
        <div class="col-md-4"><label class="form-label small fw-semibold">Canal</label>
          <select class="form-select form-select-sm" id="segCanal">
            ${Object.entries(CANALES).map(([k, v]) => `<option value="${k}" ${r.canal === k ? 'selected' : ''}>${v.label}</option>`).join('')}
          </select></div>
        <div class="col-md-4"><label class="form-label small fw-semibold">Resultado</label>
          <select class="form-select form-select-sm" id="segResultado">
            ${Object.entries(RESULTADOS).map(([k, v]) => `<option value="${k}" ${r.resultado === k ? 'selected' : ''}>${v.label}</option>`).join('')}
          </select></div>
        <div class="col-md-4"><label class="form-label small fw-semibold">Fecha</label>
          <input type="date" class="form-control form-control-sm" id="segFecha" value="${(r.fecha || '').slice(0, 10) || hoy}"></div>
      </div>
      <div class="mb-2"><label class="form-label small fw-semibold">Notas (¿qué se habló? ¿en qué quedaron?)</label>
        <textarea class="form-control form-control-sm" id="segNotas" rows="3">${escapeHTML(r.notas || '')}</textarea></div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="segReq" ${r.requiere_seguimiento ? 'checked' : ''}>
        <label class="form-check-label small fw-semibold" for="segReq">Requiere seguimiento (agendar próxima acción)</label>
      </div>
      <div id="segProxWrap" class="row g-2 ${r.requiere_seguimiento ? '' : 'd-none'}">
        <div class="col-md-8"><label class="form-label small">Próxima acción</label>
          <input type="text" class="form-control form-control-sm" id="segProxAccion" value="${escapeHTML(r.proxima_accion || '')}" placeholder="Ej. Volver a llamar para confirmar"></div>
        <div class="col-md-4"><label class="form-label small">Fecha</label>
          <input type="date" class="form-control form-control-sm" id="segProxFecha" value="${r.proxima_fecha || ''}"></div>
      </div>
    `,
    saveText: esNuevo ? 'Registrar' : 'Guardar',
    deleteText: 'Eliminar',
    onDelete: esNuevo
      ? null
      : async () => {
          try {
            await api.eliminarSeguimiento(r.id)
            AppToast.show('Registro eliminado', 'success')
            onSaved?.()
          } catch (err) {
            AppToast.show(`Error: ${err.message}`, 'error')
            return false
          }
        },
    onShow: (mb) => {
      mb.querySelector('#segReq')?.addEventListener('change', (e) => {
        mb.querySelector('#segProxWrap').classList.toggle('d-none', !e.target.checked)
      })
    },
    onSave: async (mb) => {
      const nombre = mb.querySelector('#segNombre').value.trim()
      if (!nombre) { AppToast.show('El contacto es obligatorio', 'error'); return false }
      const requiere = mb.querySelector('#segReq').checked
      const payload = {
        alumno_id: r.alumno_id || null,
        contacto_nombre: nombre,
        contacto_telefono: mb.querySelector('#segTel').value.trim() || null,
        contacto_email: r.contacto_email || null,
        canal: mb.querySelector('#segCanal').value,
        resultado: mb.querySelector('#segResultado').value,
        fecha: new Date(mb.querySelector('#segFecha').value || hoy).toISOString(),
        notas: mb.querySelector('#segNotas').value.trim() || null,
        requiere_seguimiento: requiere,
        proxima_accion: requiere ? mb.querySelector('#segProxAccion').value.trim() || null : null,
        proxima_fecha: requiere ? mb.querySelector('#segProxFecha').value || null : null,
      }
      try {
        if (esNuevo) await api.crearSeguimiento(payload)
        else await api.actualizarSeguimiento(r.id, payload)
        AppToast.show('Seguimiento guardado', 'success')
        onSaved?.()
      } catch (err) {
        AppToast.show(`Error: ${err.message}`, 'error')
        return false
      }
    },
  })
}

function escapeHTML(str) {
  if (str == null) return ''
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
