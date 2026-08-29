/**
 * Modal de Exportación Consolidada de Nómina Docente
 * Permite seleccionar el período de corte (quincenal, mensual o personalizado),
 * visualizar las métricas previas y exportar en PDF formal o CSV/Excel.
 */

import { getMaestrosComplianceStatus } from '../api/adminMaestroApi.js'
import { descargarPdfNominaConsolidada } from '../domain/generarPdfNominaConsolidada.js'
import { descargarCsvNominaConsolidada } from '../domain/generarCsvNominaConsolidada.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { escapeHTML } from '../../../shared/utils/sanitize.js'

function getRangosNomina() {
  const ahora = new Date()
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santo_Domingo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const [y, m, d] = formatter.format(ahora).split('-')
  const anio = Number(y)
  const mes = Number(m)
  const dia = Number(d)

  const mesStr = String(mes).padStart(2, '0')
  const mesAnt = mes === 1 ? 12 : mes - 1
  const anioAnt = mes === 1 ? anio - 1 : anio
  const mesAntStr = String(mesAnt).padStart(2, '0')

  const ultDiaMes = new Date(anio, mes, 0).getDate()
  const ultDiaMesAnt = new Date(anioAnt, mesAnt, 0).getDate()

  return [
    {
      id: 'quincena_1_actual',
      label: `1ra Quincena (${mesStr}/${anio}) · 01 al 15`,
      desde: `${anio}-${mesStr}-01`,
      hasta: `${anio}-${mesStr}-15`,
    },
    {
      id: 'quincena_2_actual',
      label: `2da Quincena (${mesStr}/${anio}) · 16 al ${ultDiaMes}`,
      desde: `${anio}-${mesStr}-16`,
      hasta: `${anio}-${mesStr}-${ultDiaMes}`,
    },
    {
      id: 'mes_actual',
      label: `Mes Completo (${mesStr}/${anio})`,
      desde: `${anio}-${mesStr}-01`,
      hasta: `${anio}-${mesStr}-${ultDiaMes}`,
    },
    {
      id: 'mes_anterior',
      label: `Mes Anterior (${mesAntStr}/${anioAnt})`,
      desde: `${anioAnt}-${mesAntStr}-01`,
      hasta: `${anioAnt}-${mesAntStr}-${ultDiaMesAnt}`,
    },
    {
      id: 'custom',
      label: 'Rango Personalizado...',
      desde: `${anio}-${mesStr}-01`,
      hasta: `${anio}-${mesStr}-${String(dia).padStart(2, '0')}`,
    },
  ]
}

export function openNominaConsolidadaModal(initialMaestros = [], currentDates = {}) {
  let modalEl = document.getElementById('modalNominaConsolidada')
  if (modalEl) modalEl.remove()

  const rangos = getRangosNomina()
  let rangoActivo = rangos[0]
  if (currentDates?.desde && currentDates?.hasta) {
    rangoActivo = {
      id: 'custom',
      label: 'Período Activo de Vista',
      desde: currentDates.desde,
      hasta: currentDates.hasta,
    }
  }

  let maestrosData = [...initialMaestros]
  let cargando = false

  modalEl = document.createElement('div')
  modalEl.id = 'modalNominaConsolidada'
  modalEl.className = 'modal fade show'
  modalEl.style.display = 'block'
  modalEl.style.backgroundColor = 'rgba(2, 6, 23, 0.8)'
  modalEl.style.backdropFilter = 'blur(6px)'
  modalEl.style.zIndex = '10005'
  modalEl.setAttribute('tabindex', '-1')
  modalEl.setAttribute('role', 'dialog')
  modalEl.setAttribute('aria-modal', 'true')

  const renderModalContent = () => {
    const totalDocentes = maestrosData.length
    const solventes = maestrosData.filter(m => m.estado === 'solvente' || m.es_solvente).length
    const conPendientes = maestrosData.filter(m => m.estado === 'pendiente' || (m.pending_count > 0 && (m.vencidas_count ?? 0) === 0)).length
    const conVencidas = maestrosData.filter(m => m.estado === 'vencida' || (m.vencidas_count ?? 0) > 0).length
    const totalClases = maestrosData.reduce((acc, m) => acc + (m.total_sesiones || m.totalSesiones || 0), 0)
    const totalReg = maestrosData.reduce((acc, m) => acc + (m.registradas || 0), 0)
    const pctGlobal = totalClases > 0 ? Math.round((totalReg / totalClases) * 100) : 100

    modalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-xl" style="max-width: 1050px;">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-body">
          
          <!-- Modal Header -->
          <div class="modal-header bg-gradient text-white border-0 py-3 px-4" style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%);">
            <div class="d-flex align-items-center gap-3">
              <div class="p-2.5 rounded-3 bg-white bg-opacity-10 d-flex align-items-center justify-content-center">
                <i class="bi bi-file-earmark-spreadsheet-fill text-warning fs-4"></i>
              </div>
              <div>
                <h5 class="modal-title fw-bold mb-0 text-white">Planilla Consolidada de Nómina Docente</h5>
                <small class="text-white-50">Cierre de asistencias, horas dictadas y solvencia institucional de pago</small>
              </div>
            </div>
            <button type="button" class="btn-close btn-close-white" id="btnCloseNominaModal" aria-label="Close"></button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body p-4 bg-body-tertiary">
            
            <!-- Toolbar de Filtro de Período -->
            <div class="card border-0 shadow-xs rounded-3 p-3 bg-body mb-3 border border-body-secondary">
              <div class="row g-2 align-items-center">
                <div class="col-12 col-md-5">
                  <label class="form-label small fw-semibold text-muted mb-1">Período de Corte / Nómina</label>
                  <select class="form-select form-select-sm fw-medium rounded-3" id="selectPeriodoNomina">
                    ${rangos.map(r => `<option value="${r.id}" ${r.id === rangoActivo.id ? 'selected' : ''}>${r.label}</option>`).join('')}
                  </select>
                </div>
                <div class="col-6 col-md-3">
                  <label class="form-label small fw-semibold text-muted mb-1">Fecha Desde</label>
                  <input type="date" class="form-control form-control-sm rounded-3" id="inputFechaDesde" value="${rangoActivo.desde}">
                </div>
                <div class="col-6 col-md-3">
                  <label class="form-label small fw-semibold text-muted mb-1">Fecha Hasta</label>
                  <input type="date" class="form-control form-control-sm rounded-3" id="inputFechaHasta" value="${rangoActivo.hasta}">
                </div>
                <div class="col-12 col-md-1 d-flex align-items-end">
                  <button class="btn btn-sm btn-primary w-100 rounded-3 py-1.5" id="btnActualizarNomina" title="Consultar período">
                    <i class="bi bi-arrow-clockwise"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Bento KPIs de Nómina -->
            <div class="row g-2 mb-3">
              <div class="col-6 col-md-3">
                <div class="p-3 rounded-3 bg-body border border-body-secondary shadow-xs">
                  <div class="small fw-semibold text-muted">Total Docentes</div>
                  <div class="fs-4 fw-bold text-body mt-1">${totalDocentes}</div>
                  <small class="text-muted" style="font-size:0.75rem;">En catálogo activo</small>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="p-3 rounded-3 bg-body border border-success-subtle shadow-xs">
                  <div class="small fw-semibold text-success"><i class="bi bi-check-circle-fill me-1"></i>Solventes (Pago OK)</div>
                  <div class="fs-4 fw-bold text-success mt-1">${solventes}</div>
                  <small class="text-success-emphasis" style="font-size:0.75rem;">100% de asistencia registrada</small>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="p-3 rounded-3 bg-body border border-warning-subtle shadow-xs">
                  <div class="small fw-semibold text-warning-emphasis"><i class="bi bi-clock-fill me-1"></i>Con Pendientes (≤7d)</div>
                  <div class="fs-4 fw-bold text-warning-emphasis mt-1">${conPendientes}</div>
                  <small class="text-muted" style="font-size:0.75rem;">Requiere registro docente</small>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="p-3 rounded-3 bg-body border border-danger-subtle shadow-xs">
                  <div class="small fw-semibold text-danger"><i class="bi bi-exclamation-octagon-fill me-1"></i>Con Vencidas (>7d)</div>
                  <div class="fs-4 fw-bold text-danger mt-1">${conVencidas}</div>
                  <small class="text-danger" style="font-size:0.75rem;">Bloquea pago nómina</small>
                </div>
              </div>
            </div>

            <!-- Tabla de Previsualización -->
            <div class="card border-0 shadow-xs rounded-3 bg-body overflow-hidden border border-body-secondary">
              <div class="card-header bg-body py-2.5 px-3 d-flex justify-content-between align-items-center border-bottom border-body-secondary">
                <span class="fw-semibold small text-body">
                  <i class="bi bi-table me-1.5 text-primary"></i>Previsualización de Planilla (${totalDocentes} docentes)
                </span>
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2 py-1" style="font-size:0.75rem;">
                  Cumplimiento Global: ${pctGlobal}%
                </span>
              </div>
              <div class="table-responsive" style="max-height: 320px;">
                <table class="table table-hover table-sm align-middle mb-0" style="font-size: 0.8rem;">
                  <thead class="table-light sticky-top">
                    <tr>
                      <th class="ps-3" style="width: 40px;">#</th>
                      <th>Docente / Maestro</th>
                      <th>Cátedra</th>
                      <th class="text-center">Prog.</th>
                      <th class="text-center">Reg.</th>
                      <th class="text-center">Pend.</th>
                      <th class="text-center">Venc.</th>
                      <th class="text-center">% Cump.</th>
                      <th class="pe-3 text-center">Estado para Nómina</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${
                      maestrosData.length === 0
                        ? `<tr><td colspan="9" class="text-center py-4 text-muted">No se encontraron docentes en el período seleccionado</td></tr>`
                        : maestrosData
                            .map((m, idx) => {
                              const nombre = escapeHTML(m.maestros?.nombre_completo || m.nombre_completo || '—')
                              const esp = escapeHTML(m.maestros?.especialidad || m.especialidad || '—')
                              const prog = m.total_sesiones || m.totalSesiones || 0
                              const reg = m.registradas || 0
                              const pend = m.pending_count ?? m.pendingCount ?? 0
                              const venc = m.vencidas_count ?? m.vencidasCount ?? 0
                              const pct = prog > 0 ? Math.round((reg / prog) * 100) : 100

                              let badge = '<span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">SOLVENTE</span>'
                              if (venc > 0) {
                                badge = '<span class="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">BLOQUEADO</span>'
                              } else if (pend > 0) {
                                badge = '<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1">PENDIENTE</span>'
                              }

                              return `
                                <tr>
                                  <td class="ps-3 text-muted">${idx + 1}</td>
                                  <td class="fw-semibold text-body">${nombre}</td>
                                  <td class="text-muted">${esp}</td>
                                  <td class="text-center">${prog}</td>
                                  <td class="text-center text-success fw-medium">${reg}</td>
                                  <td class="text-center ${pend > 0 ? 'text-warning-emphasis fw-bold' : 'text-muted'}">${pend}</td>
                                  <td class="text-center ${venc > 0 ? 'text-danger fw-bold' : 'text-muted'}">${venc}</td>
                                  <td class="text-center fw-bold ${pct >= 85 ? 'text-success' : pct >= 70 ? 'text-warning-emphasis' : 'text-danger'}">${pct}%</td>
                                  <td class="pe-3 text-center">${badge}</td>
                                </tr>
                              `
                            })
                            .join('')
                    }
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <!-- Modal Footer con botones de exportación -->
          <div class="modal-footer bg-body border-top border-body-secondary py-3 px-4 d-flex justify-content-between flex-wrap gap-2">
            <button type="button" class="btn btn-sm btn-outline-secondary rounded-3 px-3 fw-semibold" id="btnCerrarNominaModal">
              Cerrar
            </button>
            <div class="d-flex align-items-center gap-2">
              <button type="button" class="btn btn-sm btn-outline-success rounded-3 px-3 fw-semibold d-inline-flex align-items-center gap-1.5" id="btnDescargarCsvNomina">
                <i class="bi bi-file-earmark-excel-fill text-success"></i>
                <span>Exportar Excel (CSV)</span>
              </button>
              <button type="button" class="btn btn-sm btn-primary rounded-3 px-3.5 fw-semibold d-inline-flex align-items-center gap-1.5 shadow-sm" id="btnDescargarPdfNomina">
                <i class="bi bi-file-earmark-pdf-fill text-white"></i>
                <span>Descargar PDF Oficial</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    `

    attachModalEvents()
  }

  const attachModalEvents = () => {
    modalEl.querySelector('#btnCloseNominaModal')?.addEventListener('click', closeModal)
    modalEl.querySelector('#btnCerrarNominaModal')?.addEventListener('click', closeModal)

    // Selector de rango
    modalEl.querySelector('#selectPeriodoNomina')?.addEventListener('change', (e) => {
      const selected = rangos.find(r => r.id === e.target.value)
      if (selected) {
        rangoActivo = selected
        modalEl.querySelector('#inputFechaDesde').value = selected.desde
        modalEl.querySelector('#inputFechaHasta').value = selected.hasta
        consultarRango()
      }
    })

    // Botón actualizar / recargar
    modalEl.querySelector('#btnActualizarNomina')?.addEventListener('click', () => {
      consultarRango()
    })

    // Exportar PDF
    modalEl.querySelector('#btnDescargarPdfNomina')?.addEventListener('click', () => {
      if (maestrosData.length === 0) {
        AppToast.info('No hay datos para exportar en este período')
        return
      }
      descargarPdfNominaConsolidada(maestrosData, {
        desde: rangoActivo.desde,
        hasta: rangoActivo.hasta,
        rangoLabel: rangoActivo.label,
      })
      AppToast.show('PDF Oficial de Nómina generado exitosamente')
    })

    // Exportar CSV / Excel
    modalEl.querySelector('#btnDescargarCsvNomina')?.addEventListener('click', () => {
      if (maestrosData.length === 0) {
        AppToast.info('No hay datos para exportar en este período')
        return
      }
      descargarCsvNominaConsolidada(maestrosData, {
        desde: rangoActivo.desde,
        hasta: rangoActivo.hasta,
        rangoLabel: rangoActivo.label,
      })
      AppToast.show('Planilla Excel/CSV descargada exitosamente')
    })
  }

  const consultarRango = async () => {
    const desde = modalEl.querySelector('#inputFechaDesde')?.value
    const hasta = modalEl.querySelector('#inputFechaHasta')?.value
    if (!desde || !hasta) return

    rangoActivo.desde = desde
    rangoActivo.hasta = hasta

    const btnRefresh = modalEl.querySelector('#btnActualizarNomina')
    if (btnRefresh) {
      btnRefresh.disabled = true
      btnRefresh.innerHTML = '<span class="spinner-border spinner-border-sm"></span>'
    }

    try {
      const nuevosMaestros = await getMaestrosComplianceStatus({ desde, hasta })
      maestrosData = (nuevosMaestros || []).map(m => {
        const pendientes = m.pending_count ?? 0
        const vencidas = m.vencidas_count ?? 0
        let estado = 'solvente'
        if (vencidas > 0) estado = 'vencida'
        else if (pendientes > 0) estado = 'pendiente'
        return {
          ...m,
          estado,
          pendingCount: pendientes,
          vencidasCount: vencidas,
          totalSesiones: m.total_sesiones ?? 0,
          registradas: m.registradas ?? 0,
        }
      })
    } catch (err) {
      console.error('[NominaModal] Error recargando:', err)
      AppToast.error('Error al consultar datos del período')
    } finally {
      renderModalContent()
    }
  }

  const closeModal = () => {
    modalEl.remove()
  }

  document.body.appendChild(modalEl)
  renderModalContent()
}
