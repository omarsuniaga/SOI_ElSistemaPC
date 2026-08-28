import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { escapeHTML } from '../utils/maestrosUtils.js'
import { cargarHistorialClases } from '../../../portal-maestros/services/historialClasesService.js'
import { descargarPdfHistoricoMaestro } from '../domain/generarPdfHistoricoMaestro.js'
import { abrirHtmlHistoricoMaestro } from '../domain/generarHtmlHistoricoMaestro.js'

function formatFecha(fecha) {
  if (!fecha) return '—'
  const d = new Date(`${fecha}T12:00:00`)
  if (Number.isNaN(d.getTime())) return fecha
  return d.toLocaleDateString('es-DO', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatHora(hora) {
  return hora ? String(hora).slice(0, 5) : '—'
}

function showToast(message, type = 'info') {
  AppToast.show(message, type)
}

/**
 * Abre el modal interactivo de Histórico de Clases de un Maestro.
 *
 * @param {Object} maestro - Objeto del maestro
 */
export async function openHistoricoMaestroModal(maestro) {
  if (!maestro?.id) {
    showToast('Maestro inválido', 'error')
    return
  }

  const maestroNombre = maestro.nombre || maestro.nombre_completo || maestro.name || 'Docente'
  let currentDias = 30
  let currentClaseId = 'todas'
  let currentDesde = ''
  let currentHasta = ''
  let currentSesiones = []
  let currentClases = []
  let isLoading = false

  const getRangoLabel = () => {
    if (currentDesde || currentHasta) {
      return `Desde ${currentDesde || 'inicio'} hasta ${currentHasta || 'hoy'}`
    }
    if (currentDias === 0) return 'Todo el Histórico'
    return `Últimos ${currentDias} días`
  }

  const getClaseLabel = () => {
    if (currentClaseId === 'todas') return 'Todas las clases'
    const c = currentClases.find((item) => item.id === currentClaseId)
    return c ? c.nombre : 'Clase seleccionada'
  }

  const headerActionsHTML = `
    <div class="d-flex align-items-center gap-2">
      <button class="btn btn-sm text-white border-0 d-inline-flex align-items-center justify-content-center px-2 py-1" id="historico-btn-html" style="background: rgba(255,255,255,0.18); font-size: 0.8rem; border-radius: 6px;" type="button" title="Ver / Imprimir en HTML">
        <i class="bi bi-file-earmark-code me-1"></i>Ver HTML
      </button>
      <button class="btn btn-sm text-white border-0 d-inline-flex align-items-center justify-content-center px-2 py-1" id="historico-btn-pdf" style="background: rgba(255,255,255,0.25); font-size: 0.8rem; border-radius: 6px; font-weight: 600;" type="button" title="Descargar Reporte PDF">
        <i class="bi bi-file-earmark-pdf me-1"></i>PDF
      </button>
    </div>
  `

  const modalBodyHTML = `
    <div class="historico-maestro-container">
      <!-- Filtros -->
      <div class="p-3 bg-light rounded-3 border mb-3">
        <div class="row g-2 align-items-end">
          <div class="col-md-4">
            <label class="form-label small fw-bold text-muted mb-1">Período de tiempo</label>
            <select class="form-select form-select-sm" id="historico-filtro-periodo">
              <option value="7">Últimos 7 días</option>
              <option value="30" selected>Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
              <option value="0">Todo el Histórico</option>
              <option value="custom">Rango Personalizado...</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label small fw-bold text-muted mb-1">Clase / Cátedra</label>
            <select class="form-select form-select-sm" id="historico-filtro-clase">
              <option value="todas">Todas las clases</option>
            </select>
          </div>
          <div class="col-md-4" id="historico-custom-dates" style="display: none;">
            <div class="row g-1">
              <div class="col-6">
                <label class="form-label small text-muted mb-0" style="font-size:0.75rem;">Desde</label>
                <input type="date" class="form-control form-control-sm" id="historico-fecha-desde">
              </div>
              <div class="col-6">
                <label class="form-label small text-muted mb-0" style="font-size:0.75rem;">Hasta</label>
                <input type="date" class="form-control form-control-sm" id="historico-fecha-hasta">
              </div>
            </div>
          </div>
          <div class="col-md-auto ms-auto" id="historico-btn-apply-col" style="display: none;">
            <button class="btn btn-sm btn-primary px-3" id="historico-btn-filtrar" type="button">
              <i class="bi bi-funnel me-1"></i>Filtrar
            </button>
          </div>
        </div>
      </div>

      <!-- Métricas Resumen -->
      <div class="row g-2 mb-3" id="historico-metricas-container">
        <div class="col-6 col-md-3">
          <div class="p-2 border rounded-3 text-center bg-white shadow-sm">
            <div class="text-muted small text-uppercase" style="font-size:0.7rem; font-weight:600;">Sesiones Dadas</div>
            <div class="h5 mb-0 fw-bold text-primary" id="m-sesiones">-</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="p-2 border rounded-3 text-center bg-white shadow-sm">
            <div class="text-muted small text-uppercase" style="font-size:0.7rem; font-weight:600;">Presentes (P)</div>
            <div class="h5 mb-0 fw-bold text-success" id="m-presentes">-</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="p-2 border rounded-3 text-center bg-white shadow-sm">
            <div class="text-muted small text-uppercase" style="font-size:0.7rem; font-weight:600;">Ausentes (A)</div>
            <div class="h5 mb-0 fw-bold text-danger" id="m-ausentes">-</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="p-2 border rounded-3 text-center bg-white shadow-sm">
            <div class="text-muted small text-uppercase" style="font-size:0.7rem; font-weight:600;">Justificados (J)</div>
            <div class="h5 mb-0 fw-bold text-warning" id="m-justificados">-</div>
          </div>
        </div>
      </div>

      <!-- Lista / Acordeón de Sesiones -->
      <div class="d-flex align-items-center justify-content-between mb-2">
        <h6 class="fw-bold mb-0 text-dark">
          <i class="bi bi-clock-history text-primary me-1"></i> Registro Cronológico de Clases
        </h6>
        <span class="badge bg-secondary-subtle text-secondary" id="historico-conteo-badge">Cargando...</span>
      </div>

      <div id="historico-sesiones-lista" style="max-height: 520px; overflow-y: auto; padding-right: 4px;">
        <div class="text-center py-5 text-muted">
          <div class="spinner-border spinner-border-sm text-primary me-2"></div>
          Cargando historial de clases dadas...
        </div>
      </div>
    </div>
  `

  AppModal.open({
    title: `Histórico de Clases — ${escapeHTML(maestroNombre)}`,
    headerActions: headerActionsHTML,
    size: 'lg',
    hideSave: true,
    cancelText: 'Cerrar',
    body: modalBodyHTML,
    onShow: async (modalBody) => {
      const dialog = modalBody.closest('.app-modal-dialog')
      const periodoSelect = modalBody.querySelector('#historico-filtro-periodo')
      const claseSelect = modalBody.querySelector('#historico-filtro-clase')
      const customDatesDiv = modalBody.querySelector('#historico-custom-dates')
      const applyBtnCol = modalBody.querySelector('#historico-btn-apply-col')
      const fechaDesdeInput = modalBody.querySelector('#historico-fecha-desde')
      const fechaHastaInput = modalBody.querySelector('#historico-fecha-hasta')
      const filtrarBtn = modalBody.querySelector('#historico-btn-filtrar')
      const listaContainer = modalBody.querySelector('#historico-sesiones-lista')
      const conteoBadge = modalBody.querySelector('#historico-conteo-badge')
      const mSesiones = modalBody.querySelector('#m-sesiones')
      const mPresentes = modalBody.querySelector('#m-presentes')
      const mAusentes = modalBody.querySelector('#m-ausentes')
      const mJustificados = modalBody.querySelector('#m-justificados')

      const btnHtml = dialog?.querySelector('#historico-btn-html')
      const btnPdf = dialog?.querySelector('#historico-btn-pdf')

      const renderData = () => {
        const totalSesiones = currentSesiones.length
        const totalP = currentSesiones.reduce((acc, s) => acc + (s.presentes || 0), 0)
        const totalA = currentSesiones.reduce((acc, s) => acc + (s.ausentes || 0), 0)
        const totalJ = currentSesiones.reduce((acc, s) => acc + (s.justificados || 0), 0)

        if (mSesiones) mSesiones.textContent = String(totalSesiones)
        if (mPresentes) mPresentes.textContent = String(totalP)
        if (mAusentes) mAusentes.textContent = String(totalA)
        if (mJustificados) mJustificados.textContent = String(totalJ)
        if (conteoBadge) conteoBadge.textContent = `${totalSesiones} sesión${totalSesiones === 1 ? '' : 'es'}`

        if (totalSesiones === 0) {
          listaContainer.innerHTML = `
            <div class="text-center py-5 text-muted border rounded-3 bg-light">
              <i class="bi bi-calendar-x fs-1 d-block mb-2 text-secondary"></i>
              <p class="mb-0 fw-semibold">No se encontraron clases dadas en este período.</p>
              <small class="text-muted">Prueba seleccionando otro rango de fechas o clase.</small>
            </div>
          `
          return
        }

        const itemsHTML = currentSesiones.map((s, idx) => {
          const horarioStr = s.horaInicio ? `${formatHora(s.horaInicio)} - ${formatHora(s.horaFin)}` : 'Horario no registrado'
          const salonStr = s.salonNombre ? ` · Salón: ${escapeHTML(s.salonNombre)}` : ''
          const rolBadge = s.esSuplencia
            ? '<span class="badge bg-warning-subtle text-warning border border-warning-subtle" style="font-size:0.7rem;">Suplencia</span>'
            : '<span class="badge bg-primary-subtle text-primary border border-primary-subtle" style="font-size:0.7rem;">Titular</span>'

          const roster = s.roster || []
          const rosterRows = roster.map((a, jIdx) => {
            let badgeClass = 'bg-success-subtle text-success'
            let label = 'Presente'
            if (a.estado === 'A') {
              badgeClass = 'bg-danger-subtle text-danger'
              label = 'Ausente'
            } else if (a.estado === 'J') {
              badgeClass = 'bg-warning-subtle text-warning'
              label = 'Justificado'
            }

            const justificacionHtml = a.motivo
              ? `<div class="mt-1 small p-1 px-2 rounded bg-warning-subtle border border-warning text-dark">
                   <i class="bi bi-info-circle text-warning me-1"></i><strong>Justificación:</strong> ${escapeHTML(a.motivo)}
                 </div>`
              : (a.estado === 'J' ? '<div class="small text-muted fst-italic">Sin motivo especificado</div>' : '')

            return `
              <div class="d-flex flex-column py-1 border-bottom border-light">
                <div class="d-flex align-items-center justify-content-between">
                  <span class="small fw-semibold text-dark">${jIdx + 1}. ${escapeHTML(a.nombre)}</span>
                  <span class="badge ${badgeClass}" style="font-size:0.7rem;">${label}</span>
                </div>
                ${justificacionHtml}
              </div>
            `
          }).join('')

          const contenidoTexto = s.contenido
            ? escapeHTML(s.contenido).replace(/\n/g, '<br>')
            : '<em class="text-muted small">Sin observaciones ni temas registrados.</em>'

          return `
            <div class="card mb-3 border shadow-sm rounded-3 overflow-hidden">
              <div class="card-header bg-light d-flex align-items-center justify-content-between py-2 px-3">
                <div class="d-flex align-items-center gap-2">
                  <span class="badge bg-primary text-white rounded-pill px-2" style="font-size:0.75rem;">#${idx + 1}</span>
                  <div>
                    <span class="fw-bold text-dark me-2" style="font-size:0.95rem;">${escapeHTML(s.claseNombre)}</span>
                    ${rolBadge}
                    <div class="text-muted small" style="font-size:0.8rem;">
                      <i class="bi bi-calendar3 me-1"></i>${formatFecha(s.fecha)} · 
                      <i class="bi bi-clock me-1"></i>${horarioStr}${salonStr}
                    </div>
                  </div>
                </div>
                <div class="d-flex gap-1">
                  <span class="badge bg-success-subtle text-success" title="Presentes">${s.presentes || 0} P</span>
                  <span class="badge bg-danger-subtle text-danger" title="Ausentes">${s.ausentes || 0} A</span>
                  <span class="badge bg-warning-subtle text-warning" title="Justificados">${s.justificados || 0} J</span>
                </div>
              </div>
              <div class="card-body p-3">
                <div class="mb-3 p-2 bg-light rounded border-start border-3 border-primary">
                  <div class="small fw-bold text-primary mb-1">
                    <i class="bi bi-journal-text me-1"></i>Contenido / Temas trabajados y Observaciones:
                  </div>
                  <div class="small text-secondary">${contenidoTexto}</div>
                </div>
                
                <div>
                  <div class="small fw-bold text-dark mb-1">
                    <i class="bi bi-people me-1 text-primary"></i>Asistencia y Justificaciones (${roster.length}):
                  </div>
                  <div class="p-2 border rounded bg-white" style="max-height: 180px; overflow-y: auto;">
                    ${rosterRows || '<div class="text-muted small">Sin registros de alumnos</div>'}
                  </div>
                </div>
              </div>
            </div>
          `
        }).join('')

        listaContainer.innerHTML = itemsHTML
      }

      const fetchData = async () => {
        if (isLoading) return
        isLoading = true
        listaContainer.innerHTML = `
          <div class="text-center py-5 text-muted">
            <div class="spinner-border spinner-border-sm text-primary me-2"></div>
            Cargando historial de clases dadas...
          </div>
        `
        try {
          const params = {
            maestroId: maestro.id,
            claseId: currentClaseId,
          }
          if (currentDesde || currentHasta) {
            params.desde = currentDesde
            params.hasta = currentHasta
          } else {
            params.dias = currentDias
          }

          const result = await cargarHistorialClases(params)
          currentClases = result.clases || []
          currentSesiones = result.sesiones || []

          // Populate clases select if only has 'todas'
          if (claseSelect && claseSelect.options.length <= 1) {
            currentClases.forEach((c) => {
              const opt = document.createElement('option')
              opt.value = c.id
              opt.textContent = c.nombre + (c.esSuplencia ? ' (Suplencia)' : '')
              claseSelect.appendChild(opt)
            })
            claseSelect.value = currentClaseId
          }

          renderData()
        } catch (err) {
          console.error('[HistoricoMaestroModal] Error:', err)
          showToast('Error cargando historial: ' + err.message, 'error')
          listaContainer.innerHTML = `
            <div class="alert alert-danger my-3">
              <i class="bi bi-exclamation-triangle me-1"></i> Error al cargar datos: ${escapeHTML(err.message)}
            </div>
          `
        } finally {
          isLoading = false
        }
      }

      // Eventos de Filtro
      periodoSelect?.addEventListener('change', (e) => {
        const val = e.target.value
        if (val === 'custom') {
          if (customDatesDiv) customDatesDiv.style.display = 'block'
          if (applyBtnCol) applyBtnCol.style.display = 'block'
        } else {
          if (customDatesDiv) customDatesDiv.style.display = 'none'
          if (applyBtnCol) applyBtnCol.style.display = 'none'
          currentDias = Number(val)
          currentDesde = ''
          currentHasta = ''
          fetchData()
        }
      })

      claseSelect?.addEventListener('change', (e) => {
        currentClaseId = e.target.value
        fetchData()
      })

      filtrarBtn?.addEventListener('click', () => {
        currentDesde = fechaDesdeInput?.value || ''
        currentHasta = fechaHastaInput?.value || ''
        if (!currentDesde && !currentHasta) {
          showToast('Selecciona al menos una fecha para filtrar', 'warning')
          return
        }
        fetchData()
      })

      // Exportar PDF
      btnPdf?.addEventListener('click', (e) => {
        if (currentSesiones.length === 0) {
          showToast('No hay sesiones para exportar en este período', 'warning')
          return
        }
        const btn = e.currentTarget
        btn.disabled = true
        btn.style.opacity = '0.6'
        try {
          descargarPdfHistoricoMaestro(maestro, currentSesiones, {
            rangoLabel: getRangoLabel(),
            claseLabel: getClaseLabel(),
          })
          showToast('PDF de histórico generado exitosamente', 'success')
        } catch (err) {
          console.error('Error generando PDF:', err)
          showToast('Error al generar PDF: ' + err.message, 'error')
        } finally {
          btn.disabled = false
          btn.style.opacity = '1'
        }
      })

      // Exportar HTML
      btnHtml?.addEventListener('click', () => {
        if (currentSesiones.length === 0) {
          showToast('No hay sesiones para exportar en este período', 'warning')
          return
        }
        try {
          abrirHtmlHistoricoMaestro({
            maestro,
            sesiones: currentSesiones,
            options: {
              rangoLabel: getRangoLabel(),
              claseLabel: getClaseLabel(),
            },
          })
        } catch (err) {
          console.error('Error abriendo HTML:', err)
          showToast('Error al abrir HTML: ' + err.message, 'error')
        }
      })

      // Fetch inicial
      await fetchData()
    },
  })
}
