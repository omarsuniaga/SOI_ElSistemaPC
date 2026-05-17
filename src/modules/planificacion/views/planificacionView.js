import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { Planificacion } from '../models/planificacion.model.js'
import {
  obtenerPlanificacionesConDetalles,
  actualizarPlanificacion,
  crearPlanificacion,
  eliminarPlanificacion,
  marcarRevisadasMasivo
} from '../api/planificacionApi.js'
import { supabase } from '../../../lib/supabaseClient.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'

const state = {
  planes: [],
  planesOriginales: [],
  cargando: false,
  filtroEstado: 'todos',
  vista: 'maestro', // 'maestro' o 'admin'
  seleccionados: new Set(),
  container: null
}

/**
 * Vista de Planificación Curricular - Unificada y Refactorizada
 */
export async function renderPlanificacionView(container) {
  if (!container) return
  try {
    state.container = container
    state.cargando = true
    renderLoading(container)

    const planes = await obtenerPlanificacionesConDetalles()
    state.planes = planes
    state.planesOriginales = [...planes]
    state.cargando = false

    renderContent(container)
    _attachEvents(container)
  } catch (error) {
    console.error(error)
    renderError(container, error.message)
  }
}

function renderLoading(container) {
  container.innerHTML = `<div class="d-flex justify-content-center align-items-center" style="min-height: 400px;"><div class="spinner-border text-primary" role="status"></div></div>`
}

function renderError(container, msg) {
  container.innerHTML = `<div class="alert alert-danger m-3"><h5>Error al cargar</h5><p>${escapeHTML(msg)}</p></div>`
}

function renderContent(container) {
  container.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div class="d-flex align-items-center gap-2">
          <span class="page-title"><i class="bi bi-journal-check me-2 text-primary"></i>Planificación</span>
        </div>
        <div class="d-flex gap-2">
          ${state.vista === 'admin' ? `
            <button class="btn btn-outline-success btn-sm-compact d-none" id="btn-aprobar-bulk">
              <i class="bi bi-check-all"></i> Aprobar Seleccionados
            </button>
          ` : ''}
          <button class="btn btn-primary btn-sm-compact" id="btn-nuevo-plan">
            <i class="bi bi-plus-lg"></i> Nuevo Plan
          </button>
        </div>
      </div>

      <div class="toolbar-dense mb-3">
        <div class="btn-group btn-group-sm me-3" role="group">
          <button class="btn btn-outline-primary ${state.vista === 'maestro' ? 'active' : ''}" id="tab-maestro">Mis Planes</button>
          <button class="btn btn-outline-primary ${state.vista === 'admin' ? 'active' : ''}" id="tab-admin">Administración</button>
        </div>
        <div class="search-bar flex-grow-1">
          <i class="bi bi-search"></i>
          <input type="text" class="form-control input-dense" placeholder="Buscar por tema o clase..." id="buscar-plan">
        </div>
      </div>

      <div class="page-glass rounded">
        <div class="table-responsive">
          <table class="table table-compact table-hover mb-0">
            <thead class="table-light">
              <tr>
                ${state.vista === 'admin' ? '<th style="width: 30px;"><input type="checkbox" id="check-all"></th>' : ''}
                <th>Clase / Tema</th>
                <th class="d-none d-md-table-cell">Estado</th>
                <th class="d-none d-lg-table-cell">Fecha</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody id="planes-tbody">
              ${renderTableRows(state.planes)}
            </tbody>
          </table>
        </div>
        <div id="empty-container">${state.planes.length === 0 ? renderEmpty() : ''}</div>
      </div>
    </div>
  `
}

function renderTableRows(planes) {
  return planes.map(p => {
    const config = Planificacion.getEstadoConfig(p.estado)
    return `
      <tr data-id="${p.id}" class="${p.isLocked() ? 'text-muted' : ''}">
        ${state.vista === 'admin' ? `<td><input type="checkbox" class="plan-check" value="${p.id}" ${state.seleccionados.has(p.id) ? 'checked' : ''}></td>` : ''}
        <td>
          <div class="fw-bold">${escapeHTML(p.clase_nombre)}</div>
          <div class="small">${escapeHTML(p.tema)}</div>
        </td>
        <td class="d-none d-md-table-cell">
          <span class="badge badge-compact ${config.color}">${config.label}</span>
        </td>
        <td class="d-none d-lg-table-cell text-muted small">
          ${p.fecha_inicio || '-'}
        </td>
        <td class="text-end">
          <div class="quick-actions justify-content-end">
            <button class="btn btn-sm btn-outline-primary btn-icon-compact" data-action="edit" data-id="${p.id}" title="Editar">
              <i class="bi bi-pencil"></i>
            </button>
            ${state.vista === 'admin' && p.canApprove() ? `
              <button class="btn btn-sm btn-outline-success btn-icon-compact" data-action="approve" data-id="${p.id}" title="Aprobar">
                <i class="bi bi-check-circle"></i>
              </button>
            ` : ''}
            <button class="btn btn-sm btn-outline-danger btn-icon-compact" data-action="delete" data-id="${p.id}" title="Eliminar">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `
  }).join('')
}

function renderEmpty() {
  return `<div class="text-center py-5 text-muted"><i class="bi bi-journal-x fs-1 d-block mb-2"></i>No se encontraron planificaciones.</div>`
}

function _attachEvents(container) {
  container.querySelector('#tab-maestro')?.addEventListener('click', () => {
    state.vista = 'maestro'
    renderContent(container)
    _attachEvents(container)
  })

  container.querySelector('#tab-admin')?.addEventListener('click', () => {
    state.vista = 'admin'
    renderContent(container)
    _attachEvents(container)
  })

  container.querySelector('#buscar-plan')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase()
    state.planes = state.planesOriginales.filter(p => 
      p.tema.toLowerCase().includes(term) || p.clase_nombre.toLowerCase().includes(term)
    )
    container.querySelector('#planes-tbody').innerHTML = renderTableRows(state.planes)
  })

  container.querySelector('#planes-tbody')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]')
    if (!btn) return
    const { action, id } = btn.dataset
    if (action === 'edit') openEditModal(id)
    if (action === 'delete') openDeleteModal(id)
    if (action === 'approve') _approveOne(id)
  })

  container.querySelector('#btn-nuevo-plan')?.addEventListener('click', () => openEditModal(null))
}

async function openEditModal(id) {
  const plan = id ? state.planesOriginales.find(p => p.id === id) : new Planificacion()
  
  AppModal.open({
    title: id ? 'Editar Plan' : 'Nuevo Plan de Clase',
    saveText: 'Guardar Plan',
    body: `
      <form id="form-plan" class="row g-3">
        <div class="col-md-8">
          <label class="form-label-compact">Tema de la Clase *</label>
          <input type="text" class="form-control input-dense" id="plan-tema" value="${escapeHTML(plan.tema)}" required>
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Clase *</label>
          <select class="form-select input-dense" id="plan-clase_id" required>
            <option value="">Seleccionar...</option>
            ${(await supabase.from('clases').select('id, nombre')).data?.map(c => `<option value="${c.id}" ${c.id === plan.clase_id ? 'selected' : ''}>${c.nombre}</option>`).join('')}
          </select>
        </div>
        <div class="col-12">
          <label class="form-label-compact">Objetivos</label>
          <textarea class="form-control input-dense" id="plan-objetivos" rows="2">${escapeHTML(plan.objetivos)}</textarea>
        </div>
        <div class="col-12">
          <label class="form-label-compact">Contenido Pedagógico (DSL)</label>
          <div class="border rounded p-2 bg-body-tertiary mb-1 d-flex gap-2">
            <button type="button" class="btn btn-xs btn-outline-secondary" onclick="document.getElementById('plan-contenido').value += '[Indicador] '">Ind</button>
            <button type="button" class="btn btn-xs btn-outline-secondary" onclick="document.getElementById('plan-contenido').value += '{Actividad} '">Act</button>
          </div>
          <textarea class="form-control input-dense font-monospace" id="plan-contenido" rows="5" placeholder="Escribe el contenido usando etiquetas SOI...">${escapeHTML(plan.contenido)}</textarea>
        </div>
      </form>
    `,
    onSave: async (modalBody) => {
      const data = {
        tema: modalBody.querySelector('#plan-tema').value.trim(),
        clase_id: modalBody.querySelector('#plan-clase_id').value,
        objetivos: modalBody.querySelector('#plan-objetivos').value.trim(),
        contenido: modalBody.querySelector('#plan-contenido').value.trim()
      }

      try {
        if (id) {
          await actualizarPlanificacion(id, data)
          AppToast.success('Plan actualizado')
        } else {
          await crearPlanificacion(data)
          AppToast.success('Plan creado')
        }
        renderPlanificacionView(state.container)
        return true
      } catch (err) {
        AppToast.error(err.message)
        return false
      }
    }
  })
}

async function _approveOne(id) {
  try {
    await marcarRevisadasMasivo([id])
    AppToast.success('Plan aprobado')
    renderPlanificacionView(state.container)
  } catch (err) {
    AppToast.error(err.message)
  }
}

async function openDeleteModal(id) {
  const plan = state.planesOriginales.find(p => p.id === id)
  AppModal.open({
    title: '⚠️ Eliminar Plan',
    saveText: 'Confirmar',
    body: `<p>¿Estás seguro de eliminar el plan "${escapeHTML(plan.tema)}"?</p>`,
    onSave: async () => {
      await eliminarPlanificacion(id)
      renderPlanificacionView(state.container)
      return true
    }
  })
}
