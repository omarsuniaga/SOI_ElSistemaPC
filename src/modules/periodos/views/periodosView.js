import * as PeriodosApi from '../api/periodosApi.js'
import { Toast } from 'bootstrap'
import { AppModal } from '../../../shared/components/AppModal.js'
import { escapeHTML } from '../../../shared/utils/sanitize.js'
import { router } from '../../../core/router/router.js'
import {
  obtenerReporteCierre,
  activarPeriodoAtomico,
  explicarListaVacia,
  clasificarDocente,
  fmtPct,
  ESTADO,
} from '../api/reporteCierreApi.js'
import { generarInformePdfCierreSemestre } from '../services/pdfCierreSemestre.js'

export async function renderPeriodosView(container) {
  container.innerHTML = `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold mb-0">Gestión de Períodos Académicos</h2>
          <p class="text-muted mb-0">Administra los ciclos de estudio y el período activo del sistema.</p>
        </div>
        <button id="btn-nuevo-periodo" class="btn btn-primary d-flex align-items-center gap-2">
          <i class="bi bi-plus-lg"></i> Nuevo Período
        </button>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th class="ps-4">Nombre del Período</th>
                  <th>Fecha Inicio</th>
                  <th>Fecha Fin</th>
                  <th>Estado</th>
                  <th class="text-end pe-4">Acciones</th>
                </tr>
              </thead>
              <tbody id="periodos-table-body">
                <tr><td colspan="5" class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="toast-container position-fixed bottom-0 end-0 p-3"></div>
  `

  const tableBody = document.getElementById('periodos-table-body')

  async function loadPeriodos() {
    try {
      const periodos = await PeriodosApi.getPeriodos()
      await renderTable(periodos)
    } catch (error) {
      showToast(error.message, 'danger')
    }
  }

  async function renderTable(periodos) {
    if (periodos.length === 0) {
      // RLS filtra devolviendo cero filas, sin error. Sin esta distinción la
      // tabla afirma "no hay períodos" cuando la verdad puede ser "no podés
      // verlos", y empuja al usuario a crear uno que ya existe.
      const motivo = await explicarListaVacia()
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-5">
        <div class="text-muted mb-1">No hay períodos para mostrar</div>
        <div class="small text-secondary">${escapeHTML(motivo)}</div>
      </td></tr>`
      return
    }

    tableBody.innerHTML = periodos.map(p => {
      // fecha_fin es nullable en el esquema: sin guardia, `new Date(null)` imprime
      // "Invalid Date" en una tabla que la directiva puede llegar a ver.
      const start = fmtFecha(p.fecha_inicio)
      const end = fmtFecha(p.fecha_fin)

      return `
      <tr>
        <td class="ps-4">
          <span class="fw-bold text-body d-block">${escapeHTML(p.nombre)}</span>
          ${p.activo ? '<span class="badge bg-success-subtle text-success border border-success-subtle small" style="font-size: 0.7rem;">PERÍODO ACTUAL</span>' : ''}
          ${p.cerrado ? '<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle small ms-1" style="font-size: 0.7rem;">CERRADO</span>' : ''}
        </td>
        <td class="text-muted">${start}</td>
        <td class="text-muted">${end}</td>
        <td>
          <span class="badge ${p.activo ? 'bg-success' : 'bg-body-tertiary text-muted border'} rounded-pill">
            ${p.activo ? 'Activo' : 'Inactivo'}
          </span>
        </td>
        <td class="text-end pe-4">
          <div class="btn-group shadow-sm">
            <button class="btn btn-sm btn-outline-info px-2" data-action="auditar" data-id="${p.id}" title="Auditar Cierre de Semestre">
              <i class="bi bi-clipboard-check"></i> Auditar
            </button>
            ${!p.activo ? `
              <button class="btn btn-sm btn-outline-success px-3" data-action="activar" data-id="${p.id}">
                Activar
              </button>
            ` : ''}
            <button class="btn btn-sm btn-outline-secondary px-2" data-action="edit" data-id="${p.id}" title="Editar">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger px-2" data-action="delete" data-id="${p.id}" title="Eliminar">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `}).join('')
  }

  function fmtFecha(valor) {
    if (!valor) return '—'
    const d = new Date(`${valor}T00:00:00`)
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString()
  }

  function showToast(message, type = 'success') {
    const container = document.querySelector('.toast-container')
    if (!container) return
    const toastId = 'toast-' + Date.now()
    // insertAdjacentHTML en vez de `innerHTML +=`: la concatenación reconstruye
    // todo el contenedor y mata los listeners de los toasts ya visibles.
    container.insertAdjacentHTML('beforeend', `
      <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">${escapeHTML(message)}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `)
    const toastEl = document.getElementById(toastId)
    if (toastEl) new Toast(toastEl).show()
  }

  document.getElementById('btn-nuevo-periodo').addEventListener('click', () => {
    openCreateModal()
  })

  tableBody.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]')
    if (!btn) return
    
    const id = btn.dataset.id
    const action = btn.dataset.action
    
    if (action === 'activar') {
      await openActivarModal(id)
    } else if (action === 'auditar') {
      await openAuditoriaModal(id)
    } else if (action === 'edit') {
      await openEditModal(id)
    } else if (action === 'delete') {
      await openDeleteModal(id)
    }
  })

  /**
   * Resumen del informe de cierre, con acceso al PDF y al informe completo.
   *
   * Consume `obtenerReporteCierre` (RPC) en lugar de la auditoría anterior, que
   * agrupaba por `sesiones_clase.maestro_id` — el autor del registro, no el
   * docente de la clase — y atribuía el trabajo de todo el cuerpo docente a una
   * sola persona.
   */
  async function openAuditoriaModal(periodoId) {
    AppModal.open({
      title: 'Informe de cierre',
      body: '<div class="text-center py-4"><div class="spinner-border text-primary"></div></div>',
      saveText: 'Cerrar',
      hideSave: true,
    })

    let reporte
    try {
      reporte = await obtenerReporteCierre(periodoId)
      if (!reporte?.resumen) throw new Error('El informe no devolvió datos del período')
    } catch (err) {
      AppModal.close()
      showToast(err.message, 'danger')
      return
    }

    const s = reporte.resumen ?? {}
    const a = reporte.asistencia ?? {}
    const evaluables = reporte.docentesEvaluables ?? []
    const sinEvaluar = (reporte.docentes ?? []).filter(d => d.estado_evaluacion !== ESTADO.EVALUABLE)

    const docentesHTML = evaluables.length === 0
      ? '<p class="text-muted small my-2">Ningún docente registró sesiones en este período.</p>'
      : `<div class="list-group list-group-flush my-2" style="max-height: 220px; overflow-y: auto;">
          ${evaluables.map(m => {
            const ef = clasificarDocente(m.pct_puntualidad, m.estado_evaluacion)
            return `
            <div class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
              <div>
                <div class="fw-semibold small">${escapeHTML(m.nombre)}</div>
                <div class="text-muted" style="font-size:0.75rem;">
                  ${m.registradas ?? 0} registradas / ${m.borradores ?? 0} en borrador (${m.sesiones ?? 0} sesiones)
                </div>
              </div>
              <div class="d-flex align-items-center gap-1">
                <span class="badge bg-${ef.tone}-subtle text-${ef.tone} border border-${ef.tone}-subtle small" style="font-size:0.7rem;">${escapeHTML(ef.badge)}</span>
                <span class="badge bg-${ef.tone} rounded-pill">${escapeHTML(fmtPct(m.pct_puntualidad))}</span>
              </div>
            </div>`
          }).join('')}
        </div>`

    AppModal.open({
      title: `Informe de cierre: ${reporte.periodo?.nombre ?? ''}`,
      size: 'lg',
      saveText: 'Ver informe completo',
      cancelText: 'Cerrar',
      body: `
        <div class="mb-2">
          <button id="btn-descargar-pdf-cierre" class="btn btn-outline-danger btn-sm w-100 mb-3 d-flex align-items-center justify-content-center gap-2 py-2">
            <i class="bi bi-file-earmark-pdf-fill fs-5"></i>
            <span>Descargar Informe Ejecutivo PDF</span>
          </button>

          <div class="p-3 rounded bg-body-tertiary mb-3">
            <div class="row g-2 text-center small">
              <div class="col-4"><div class="p-2 rounded bg-body">
                <div class="text-muted" style="font-size:.7rem;">CUMPLIM. REGISTRO</div>
                <div class="fw-bold text-primary fs-6">${escapeHTML(fmtPct(s.pct_cumplimiento_registro))}</div>
                <div class="text-muted" style="font-size:.65rem;">${s.sesiones_registradas ?? 0}/${s.sesiones_periodo ?? 0}</div>
              </div></div>
              <div class="col-4"><div class="p-2 rounded bg-body">
                <div class="text-muted" style="font-size:.7rem;">ASISTENCIA</div>
                <div class="fw-bold text-success fs-6">${escapeHTML(fmtPct(a.tasa_global))}</div>
                <div class="text-muted" style="font-size:.65rem;">${a.total_marcas ?? 0} marcas</div>
              </div></div>
              <div class="col-4"><div class="p-2 rounded bg-body">
                <div class="text-muted" style="font-size:.7rem;">REGISTRO PUNTUAL</div>
                <div class="fw-bold text-warning fs-6">${escapeHTML(fmtPct(a.pct_registro_puntual))}</div>
                <div class="text-muted" style="font-size:.65rem;">${a.marcas_tardias ?? 0} tardías</div>
              </div></div>
            </div>
          </div>

          <h6 class="fw-bold small mb-1">Desempeño docente</h6>
          ${docentesHTML}
          ${sinEvaluar.length === 0 ? '' : `
            <p class="text-muted mt-2 mb-0" style="font-size:.72rem;">
              <i class="bi bi-info-circle"></i>
              ${sinEvaluar.length} docente(s) sin actividad registrada no se clasifican:
              ausencia de datos no equivale a incumplimiento.
            </p>`}
        </div>`,
      onSave: () => {
        AppModal.close()
        router.navigate('reporte-cierre')
        return false
      },
    })

    const btnPdf = document.getElementById('btn-descargar-pdf-cierre')
    if (btnPdf) {
      btnPdf.addEventListener('click', async () => {
        const original = btnPdf.innerHTML
        btnPdf.disabled = true
        btnPdf.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Generando PDF…'
        try {
          const doc = await generarInformePdfCierreSemestre(reporte)
          const nombre = String(reporte.periodo?.nombre ?? 'periodo').replace(/[^\w\-]+/g, '_')
          doc.save(`Informe_Cierre_${nombre}.pdf`)
          showToast('Informe PDF descargado')
        } catch (pdfErr) {
          showToast('Error al generar PDF: ' + pdfErr.message, 'danger')
        } finally {
          btnPdf.disabled = false
          btnPdf.innerHTML = original
        }
      })
    }
  }

  /**
   * Corte de período académico.
   *
   * Este modal existía en el archivo pero nunca se abría: el listener enviaba a la
   * auditoría, y aquella pasaba `onConfirm` a AppModal — que solo entiende `onSave`.
   * El resultado era un botón que cerraba el diálogo sin activar nada.
   */
  async function openActivarModal(periodoId) {
    const periodos = await PeriodosApi.getPeriodos()
    const periodo = periodos.find(p => p.id === periodoId)
    if (!periodo) {
      showToast('Período no encontrado', 'danger')
      return
    }
    if (periodo.cerrado) {
      showToast('No se puede activar un período cerrado', 'warning')
      return
    }

    const saliente = periodos.find(p => p.activo && p.id !== periodoId)

    AppModal.open({
      title: 'Corte de período académico',
      saveText: 'Confirmar activación',
      cancelText: 'Cancelar',
      body: `
        <div class="p-2">
          <div class="alert alert-warning border-warning-subtle d-flex align-items-start gap-2 mb-3">
            <i class="bi bi-exclamation-triangle-fill text-warning fs-5"></i>
            <div>
              <strong class="d-block mb-1">Advertencia de integridad académica</strong>
              Se activará <strong>${escapeHTML(periodo.nombre)}</strong>${
                saliente ? ` y se desactivará <strong>${escapeHTML(saliente.nombre)}</strong>` : ''}.
            </div>
          </div>
          <p class="mb-2 small">Esta acción aplica los siguientes cambios:</p>
          <ul class="small text-muted mb-3 ps-3">
            <li class="mb-1"><strong>Período de referencia</strong>: el nuevo período pasa a ser el activo del sistema.</li>
            <li class="mb-1"><strong>Operación atómica</strong>: el cambio ocurre completo o no ocurre; el sistema no queda sin período activo.</li>
            <li class="mb-1"><strong>Consulta histórica</strong>: los registros del período saliente siguen disponibles para lectura.</li>
          </ul>
          <div class="alert alert-info border-info-subtle small mb-0">
            <i class="bi bi-info-circle"></i>
            <strong>Nota:</strong> activar un período <em>no</em> congela por sí solo los datos del anterior.
            El bloqueo de escritura histórica requiere cerrar el período desde el informe de cierre.
          </div>
        </div>`,
      onSave: async () => {
        try {
          await activarPeriodoAtomico(periodoId)
          showToast('Período activado correctamente')
          await loadPeriodos()
        } catch (error) {
          showToast(error.message, 'danger')
          return false
        }
      },
    })
  }

  async function openCreateModal() {
    AppModal.open({
      title: 'Crear Nuevo Período',
      body: `<form class="row g-3" id="form-periodo">
        <div class="col-12">
          <label class="form-label fw-semibold small">Nombre del Período *</label>
          <input type="text" class="form-control" id="modal-nombre" placeholder="Ej: Primer Semestre 2026" required>
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold small">Fecha Inicio *</label>
          <input type="date" class="form-control" id="modal-fecha_inicio" required>
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold small">Fecha Fin *</label>
          <input type="date" class="form-control" id="modal-fecha_fin" required>
        </div>
        <div class="col-12">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="modal-activo">
            <label class="form-check-label" for="modal-activo">Marcar como período activo</label>
          </div>
        </div>
      </form>`,
      saveText: 'Guardar Período',
      onSave: async (modalBody) => {
        const nombre = modalBody.querySelector('#modal-nombre').value.trim()
        const fecha_inicio = modalBody.querySelector('#modal-fecha_inicio').value
        const fecha_fin = modalBody.querySelector('#modal-fecha_fin').value
        const activo = modalBody.querySelector('#modal-activo').checked

        if (!nombre || !fecha_inicio || !fecha_fin) {
          showToast('Por favor complete todos los campos obligatorios', 'warning')
          return false
        }

        if (new Date(fecha_fin) <= new Date(fecha_inicio)) {
          showToast('La fecha de fin debe ser posterior a la fecha de inicio', 'warning')
          return false
        }

        await PeriodosApi.crearPeriodo({ nombre, fecha_inicio, fecha_fin, activo })
        showToast('Período creado con éxito')
        await loadPeriodos()
      }
    })
  }

  async function openEditModal(id) {
    const periodos = await PeriodosApi.getPeriodos()
    const periodo = periodos.find(p => p.id === id)
    if (!periodo) {
      showToast('Período no encontrado', 'danger')
      return
    }

    AppModal.open({
      title: 'Editar Período',
      body: `<form class="row g-3" id="form-periodo">
        <div class="col-12">
          <label class="form-label fw-semibold small">Nombre del Período *</label>
          <input type="text" class="form-control" id="modal-nombre" value="${escapeHTML(periodo.nombre)}" required>
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold small">Fecha Inicio *</label>
          <input type="date" class="form-control" id="modal-fecha_inicio" value="${escapeHTML(periodo.fecha_inicio)}" required>
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold small">Fecha Fin *</label>
          <input type="date" class="form-control" id="modal-fecha_fin" value="${escapeHTML(periodo.fecha_fin)}" required>
        </div>
        <div class="col-12">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="modal-activo" ${periodo.activo ? 'checked' : ''}>
            <label class="form-check-label" for="modal-activo">Marcar como período activo</label>
          </div>
        </div>
      </form>`,
      saveText: 'Guardar Cambios',
      onSave: async (modalBody) => {
        const nombre = modalBody.querySelector('#modal-nombre').value.trim()
        const fecha_inicio = modalBody.querySelector('#modal-fecha_inicio').value
        const fecha_fin = modalBody.querySelector('#modal-fecha_fin').value
        const activo = modalBody.querySelector('#modal-activo').checked

        if (!nombre || !fecha_inicio || !fecha_fin) {
          showToast('Por favor complete todos los campos obligatorios', 'warning')
          return false
        }

        if (new Date(fecha_fin) <= new Date(fecha_inicio)) {
          showToast('La fecha de fin debe ser posterior a la fecha de inicio', 'warning')
          return false
        }

        await PeriodosApi.actualizarPeriodo(id, { nombre, fecha_inicio, fecha_fin, activo })
        showToast('Período actualizado con éxito')
        await loadPeriodos()
      }
    })
  }

  async function openDeleteModal(id) {
    const periodos = await PeriodosApi.getPeriodos()
    const periodo = periodos.find(p => p.id === id)
    if (!periodo) {
      showToast('Período no encontrado', 'danger')
      return
    }

    AppModal.open({
      title: '⚠️ Eliminar Período',
      saveText: 'Eliminar',
      body: `<p>¿Estás seguro de que deseas eliminar el período <strong>${escapeHTML(periodo.nombre)}</strong>?</p>
             <div class="alert alert-warning small mb-0">
               <i class="bi bi-exclamation-triangle"></i>
               Las claves foráneas hacia este período están definidas como <code>ON DELETE SET NULL</code>:
               los registros asociados <strong>no se borran, quedan sin período asignado</strong> y dejan de
               aparecer en los informes de cierre. Esta acción no se puede deshacer.
             </div>`,
      onSave: async () => {
        try {
          await PeriodosApi.eliminarPeriodo(id)
          showToast('Período eliminado')
          await loadPeriodos()
        } catch (error) {
          showToast(error.message, 'danger')
          return false
        }
      }
    })
  }

  loadPeriodos()
}