import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { 
  obtenerProgresos, 
  obtenerAlumnos, 
  obtenerClases, 
  actualizarProgreso, 
  crearProgreso, 
  eliminarProgreso,
  exportarBoletinPDF,
  getNivelLabel
} from '../api/progresosApi.js'
import { PROGRESO_SERVICE } from '../services/progresoDataService.js'
import { Progreso } from '../models/progreso.model.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'

const state = {
  progresos: [],
  progresosOriginales: [],
  alumnos: [],
  clases: [],
  cargando: false,
  filtroClase: 'todas',
  container: null
}

/**
 * Vista de Progresos y Calificaciones - Refactored
 */
export async function renderProgresosView(container) {
  if (!container) return
  try {
    state.container = container
    state.cargando = true
    renderLoading(container)

    const [progresos, alumnos, clases] = await Promise.all([
      obtenerProgresos(),
      obtenerAlumnos(),
      obtenerClases()
    ])

    state.progresos = (progresos || []).map(p => new Progreso(p))
    state.progresosOriginales = [...state.progresos]
    state.alumnos = alumnos || []
    state.clases = clases || []
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
          <span class="page-title"><i class="bi bi-graph-up-arrow me-2 text-primary"></i>Calificaciones</span>
        </div>
        <button class="btn btn-primary btn-sm-compact" id="btn-nueva-nota">
          <i class="bi bi-plus-lg"></i> Registrar Nota
        </button>
      </div>

      <div class="toolbar-dense mb-3">
        <div class="search-bar flex-grow-1">
          <i class="bi bi-search"></i>
          <input type="text" class="form-control input-dense" placeholder="Buscar por alumno o programa..." id="buscar-progreso">
        </div>
        <select class="form-select input-dense w-auto" id="select-clase">
          <option value="todas">Todas las clases</option>
          ${state.clases.map(c => `<option value="${c.id}" ${c.id === state.filtroClase ? 'selected' : ''}>${escapeHTML(c.nombre)}</option>`).join('')}
        </select>
      </div>

      <div class="page-glass rounded">
        <div class="table-responsive">
          <table class="table table-compact table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Alumno / Clase</th>
                <th class="text-center">Promedio</th>
                <th class="d-none d-md-table-cell">Evaluaciones</th>
                <th>Estado</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody id="progresos-tbody">
              ${renderGroupedByAlumno()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
}

function renderGroupedByAlumno() {
  const term = state.container.querySelector('#buscar-progreso')?.value.trim().toLowerCase() || ''
  const claseId = state.filtroClase

  // Agrupar por alumno para la vista principal
  const porAlumno = {}
  state.progresosOriginales.forEach(p => {
    const alumno = state.alumnos.find(a => a.id === p.alumno_id)
    const clase = state.clases.find(c => c.id === p.clase_id)
    
    if (claseId !== 'todas' && p.clase_id !== claseId) return
    if (term && !alumno?.nombre_completo.toLowerCase().includes(term) && !clase?.nombre.toLowerCase().includes(term)) return

    if (!porAlumno[p.alumno_id]) porAlumno[p.alumno_id] = { alumno, lista: [] }
    porAlumno[p.alumno_id].lista.push(p)
  })

  const entries = Object.values(porAlumno)
  if (entries.length === 0) return `<tr><td colspan="5" class="text-center py-5 text-muted">No hay resultados.</td></tr>`

  return entries.map(({ alumno, lista }) => {
    const rend = PROGRESO_SERVICE.calcularRendimiento(lista)
    return `
      <tr>
        <td>
          <div class="fw-bold">${escapeHTML(alumno?.nombre_completo || 'Desconocido')}</div>
          <div class="small text-muted">${lista.length > 0 ? escapeHTML(state.clases.find(c => c.id === lista[0].clase_id)?.nombre) : ''}</div>
        </td>
        <td class="text-center">
          <div class="fw-bold ${rend.enRiesgo ? 'text-danger' : 'text-success'}" style="font-size: 1.1rem;">
            ${rend.promedio !== null ? rend.promedio.toFixed(2) : '-.--'}
          </div>
        </td>
        <td class="d-none d-md-table-cell text-center">
          <span class="badge bg-light text-dark border">${rend.total}</span>
        </td>
        <td>
          ${rend.enRiesgo 
            ? '<span class="badge bg-danger bg-opacity-10 text-danger border border-danger-subtle"><i class="bi bi-exclamation-circle me-1"></i>En Riesgo</span>' 
            : '<span class="badge bg-success bg-opacity-10 text-success border border-success-subtle">Satisfactorio</span>'}
        </td>
        <td class="text-end">
          <div class="quick-actions justify-content-end">
            <button class="btn btn-sm btn-outline-secondary btn-icon-compact" data-action="pdf" data-alumno-id="${alumno?.id}" title="Generar Boletín">
              <i class="bi bi-file-earmark-pdf"></i>
            </button>
            <button class="btn btn-sm btn-outline-primary btn-icon-compact" data-action="view-detail" data-alumno-id="${alumno?.id}" title="Ver Detalle">
              <i class="bi bi-eye"></i>
            </button>
          </div>
        </td>
      </tr>
    `
  }).join('')
}

function _attachEvents(container) {
  container.querySelector('#select-clase')?.addEventListener('change', (e) => {
    state.filtroClase = e.target.value
    container.querySelector('#progresos-tbody').innerHTML = renderGroupedByAlumno()
  })

  container.querySelector('#buscar-progreso')?.addEventListener('input', () => {
    container.querySelector('#progresos-tbody').innerHTML = renderGroupedByAlumno()
  })

  container.querySelector('#progresos-tbody')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]')
    if (!btn) return
    const { action, alumnoId } = btn.dataset
    if (action === 'pdf') _generatePDF(alumnoId)
    if (action === 'view-detail') _showDetail(alumnoId)
  })

  container.querySelector('#btn-nueva-nota')?.addEventListener('click', () => openCreateModal())
}

async function _generatePDF(alumnoId) {
  const alumno = state.alumnos.find(a => a.id === alumnoId)
  const progresos = state.progresosOriginales.filter(p => p.alumno_id === alumnoId)
  
  AppToast.info('Generando boletín institucional...')
  try {
    await exportarBoletinPDF(alumno, progresos)
    AppToast.success('Boletín generado exitosamente')
  } catch (err) {
    AppToast.error('Error al generar PDF: ' + err.message)
  }
}

function _showDetail(alumnoId) {
  const alumno = state.alumnos.find(a => a.id === alumnoId)
  const lista = state.progresosOriginales.filter(p => p.alumno_id === alumnoId)
  const rend = PROGRESO_SERVICE.calcularRendimiento(lista)

  AppModal.open({
    title: `Detalle Académico: ${alumno.nombre_completo}`,
    size: 'lg',
    hideSave: true,
    body: `
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="p-3 rounded bg-body-tertiary text-center border">
            <div class="small text-muted text-uppercase fw-bold mb-1">Promedio General</div>
            <div class="h3 mb-0 ${rend.enRiesgo ? 'text-danger' : 'text-success'}">${rend.promedio?.toFixed(2) || '-'}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="p-3 rounded bg-body-tertiary text-center border">
            <div class="small text-muted text-uppercase fw-bold mb-1">Evaluaciones</div>
            <div class="h3 mb-0">${rend.total}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="p-3 rounded bg-body-tertiary text-center border">
            <div class="small text-muted text-uppercase fw-bold mb-1">Estado Institucional</div>
            <div class="h5 mb-0 mt-2">${rend.enRiesgo ? '🚨 En Riesgo' : '✅ Estable'}</div>
          </div>
        </div>
      </div>
      
      <div class="table-responsive">
        <table class="table table-compact">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th class="text-center">Nota</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            ${lista.map(p => `
              <tr>
                <td class="small">${p.fecha_evaluacion || '-'}</td>
                <td><span class="badge bg-light text-dark border small">${p.tipo_evaluacion}</span></td>
                <td class="text-center fw-bold ${p.calificacion < 3 ? 'text-danger' : ''}">${p.calificacion?.toFixed(1) || '-'}</td>
                <td class="small text-muted">${escapeHTML(p.observaciones || '-')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `
  })
}

function openCreateModal() {
  AppModal.open({
    title: 'Registrar Nueva Calificación',
    saveText: 'Guardar Nota',
    body: `
      <form id="form-nota" class="row g-3">
        <div class="col-md-12">
          <label class="form-label-compact">Alumno *</label>
          <select class="form-select input-dense" id="nota-alumno_id" required>
            <option value="">Seleccionar alumno...</option>
            ${state.alumnos.map(a => `<option value="${a.id}">${a.nombre_completo}</option>`).join('')}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Clase *</label>
          <select class="form-select input-dense" id="nota-clase_id" required>
            <option value="">Seleccionar...</option>
            ${state.clases.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('')}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Tipo de Evaluación *</label>
          <select class="form-select input-dense" id="nota-tipo" required>
            ${Progreso.getTiposEvaluacion().map(t => `<option value="${t.value}">${t.label}</option>`).join('')}
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Calificación (0 a 10) *</label>
          <input type="number" class="form-control input-dense" id="nota-valor" min="0" max="10" step="0.1" required>
        </div>
        <div class="col-md-8">
          <label class="form-label-compact">Fecha</label>
          <input type="date" class="form-control input-dense" id="nota-fecha" value="${new Date().toISOString().split('T')[0]}">
        </div>
        <div class="col-12">
          <label class="form-label-compact">Observaciones</label>
          <textarea class="form-control input-dense" id="nota-obs" rows="2"></textarea>
        </div>
      </form>
    `,
    onSave: async (modalBody) => {
      const data = {
        alumno_id: modalBody.querySelector('#nota-alumno_id').value,
        clase_id: modalBody.querySelector('#nota-clase_id').value,
        tipo_evaluacion: modalBody.querySelector('#nota-tipo').value,
        calificacion: parseFloat(modalBody.querySelector('#nota-valor').value),
        fecha_evaluacion: modalBody.querySelector('#nota-fecha').value,
        observaciones: modalBody.querySelector('#nota-obs').value.trim()
      }

      const p = new Progreso(data)
      const errores = p.validate()
      if (errores.length > 0) {
        AppToast.error(errores[0])
        return false
      }

      try {
        await crearProgreso(data)
        AppToast.success('Nota registrada exitosamente')
        renderProgresosView(state.container)
        return true
      } catch (err) {
        AppToast.error(err.message)
        return false
      }
    }
  })
}
