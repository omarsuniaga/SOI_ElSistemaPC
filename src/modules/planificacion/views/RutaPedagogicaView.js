import { router } from '../../../core/router/router.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { obtenerClases, obtenerPlanificacionesConDetalles } from '../api/planificacionAdapter.js'
import { renderMapaContenidoSVG } from '../components/MapaContenidoSVG.js'
import { obtenerAlumnosRealesPorClase } from '../services/realAlumnosService.js'
import { OfflineSyncAdapter } from '../api/offlineSyncAdapter.js'
import { IndicadorLogro } from '../domain/IndicadorLogro.js'

import { getMisClases } from '../../../portal-maestros/services/maestroDataService.js'
import { DeudaPedagogicaEngine } from '../domain/DeudaPedagogicaEngine.js'

/**
 * Vista de Pantalla Completa: Ruta Pedagógica SVG Premium (UI/UX Rediseñada con Datos Reales)
 */
export async function renderRutaPedagogicaView(container, { maestroId, parentRoute = 'planificacion' } = {}) {
  if (!container) return

  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center py-5" style="min-height: 450px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;" role="status"></div>
        <h5 class="fw-bold text-body">Cargando Datos Reales de la Ruta Pedagógica...</h5>
        <p class="text-body-secondary small">Sincronizando la matriz de alumnos y evaluaciones 1-5★</p>
      </div>
    </div>
  `

  let clases = []
  let planificaciones = []
  try {
    const [misClases, pRes] = await Promise.all([
      getMisClases().catch(() => []),
      obtenerPlanificacionesConDetalles(),
    ])
    clases = misClases && misClases.length > 0 ? misClases : await obtenerClases()
    planificaciones = pRes || []
  } catch (err) {
    console.error('[RutaPedagogicaView] Error:', err)
  }

  _renderUI(container, clases, planificaciones, { parentRoute })
}

function _renderUI(container, clases, planificaciones, { parentRoute = 'planificacion' } = {}) {
  let selectedClaseId = clases[0]?.id || ''
  let selectedNodo = null
  let alumnosClase = []
  // Cache en memoria de roster por nodo (evita repetir la consulta a
  // Supabase/cola offline cada vez que el maestro vuelve a un nodo ya
  // visitado en esta sesión de la vista). Se invalida al cambiar de clase.
  const nodoEvalCache = new Map()
  // false mientras `alumnosClase` todavía no refleja al nodo seleccionado
  // (fetch en vuelo). Bloquea el ciclado de estrellas durante ese hueco:
  // sin esto, un tap durante la espera de red evaluaría sobre el conteo
  // base de OTRO nodo pero lo guardaría con el nodoId nuevo (ver M-3).
  let nodoDatosListos = true

  const _loadAlumnosYRender = async () => {
    nodoEvalCache.clear()
    nodoDatosListos = true
    alumnosClase = await obtenerAlumnosRealesPorClase(selectedClaseId)
    _renderShell()
  }

  const _actualizarPanelNodo = () => {
    // El detalle ahora se gestiona limpiamente a través del modal del 90%
  }

  const _renderTbody = () => {
    // La evaluación se gestiona limpiamente en la tabla interactiva dentro del modal del 90%
    const chipEvaluados = container.querySelector('#kpi-evaluados-count')
    if (chipEvaluados) {
      const evaluadosCount = alumnosClase.filter((a) => a.estrellas > 0).length
      chipEvaluados.textContent = `${evaluadosCount} / ${alumnosClase.length}`
    }
  }

  // Construye la "carcasa" completa (cabecera, chips KPI, canvas SVG y la
  // tabla vacía) UNA sola vez por carga de clase/roster. El canvas SVG solo
  // se dibuja acá — nunca en cada tap de estrella.
  const _renderShell = () => {
    const planClase = planificaciones.find((p) => String(p.clase_id || p.claseId) === String(selectedClaseId)) || planificaciones[0]
    const targetClaseObj = clases.find((c) => String(c.id) === String(selectedClaseId)) || { nombre: 'Clase General' }

    const nodosDemo = [
      { id: 'nd-1', titulo: 'Postura corporal y emisión sonora libre', estado: 'logrado' },
      { id: 'nd-2', titulo: 'Escala de Do Mayor en cuerdas Re-Sol', estado: 'en_proceso' },
      { id: 'nd-3', titulo: 'Estudio Nº 4: Control de pulso a 80 BPM', estado: 'pendiente' },
      { id: 'nd-4', titulo: 'Articulación de 1er y 2do dedo', estado: 'pendiente' },
      { id: 'nd-5', titulo: 'Repertorio: Canción de Mayo (Suzuki)', estado: 'pendiente' },
    ]

    const nodos = planClase?.objetivosEstructurados
      ? _extraerNodosDePlan(planClase)
      : nodosDemo

    // Métricas para la cabecera Premium
    const totalAlumnosCount = alumnosClase.length
    const evaluadosCount = alumnosClase.filter((a) => a.estrellas > 0).length
    const idiaPromedio = Math.round(alumnosClase.reduce((acc, a) => acc + (a.idia || 0), 0) / (totalAlumnosCount || 1))

    container.innerHTML = `
      <div class="container-fluid px-4 py-4">
        <!-- CABECERA PREMIUM EN GLASSMORPHISM / HSL GRADIENTE -->
        <div class="card border-0 shadow-lg rounded-4 p-4 mb-4 text-white position-relative overflow-hidden"
             style="background: linear-gradient(135deg, hsl(224, 76%, 16%), hsl(263, 70%, 28%), hsl(217, 91%, 35%));">
          <div class="position-absolute top-0 end-0 p-3 pe-none" style="opacity:.1;">
            <i class="bi bi-diagram-3-fill display-1"></i>
          </div>

          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 position-relative z-1">
            <div class="d-flex align-items-center gap-3">
              <button class="btn btn-light btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm" id="btn-volver-plan" style="width:42px; height:42px;">
                <i class="bi bi-arrow-left text-dark fs-5"></i>
              </button>
              <div>
                <div class="d-flex align-items-center gap-2 mb-1">
                  <span class="badge bg-white text-primary fw-bold shadow-sm px-2 py-1">
                    <i class="bi bi-music-note-beamed me-1"></i>${escapeHTML(targetClaseObj.nombre || 'Clase Académica')}
                  </span>
                  <span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                    <i class="bi bi-wifi me-1"></i>Modo Datos Reales + Sync Offline
                  </span>
                </div>
                <h2 class="fw-bold mb-0 text-white">Ruta Pedagógica Interactiva</h2>
              </div>
            </div>

            <!-- SELECTOR DE CLASE Y ACCIONES -->
            <div class="d-flex flex-wrap align-items-center gap-2">
              <select class="form-select border-0 shadow-sm text-body  fw-bold" id="select-clase-ruta" style="min-width: 240px; ">
                ${clases
                  .map(
                    (c) => `
                  <option value="${c.id}" ${c.id === selectedClaseId ? 'selected' : ''}>
                    ${escapeHTML(c.nombre || c.name || `Clase ${c.id}`)}
                  </option>
                `,
                  )
                  .join('')}
              </select>
              <button class="btn btn-warning fw-bold d-inline-flex align-items-center gap-1 shadow-sm px-3" id="btn-ir-disenador">
                <i class="bi bi-pencil-square"></i>Diseñar Estructura ACM
              </button>
            </div>
          </div>

          <!-- CHIPS DE MÉTRICAS -->
          <div class="row g-3 mt-3 pt-3 border-top border-white border-opacity-10">
            <div class="col-md-3 col-6">
              <div class="d-flex align-items-center gap-2">
                <div class="p-2 bg-white bg-opacity-10 rounded-3" style="background:rgba(255,255,255,.15);"><i class="bi bi-people fs-4"></i></div>
                <div>
                  <div class="small opacity-75">Inscritos Reales</div>
                  <div class="fw-bold fs-5">${totalAlumnosCount} Alumnos</div>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="d-flex align-items-center gap-2">
                <div class="p-2 bg-white bg-opacity-10 rounded-3" style="background:rgba(255,255,255,.15);"><i class="bi bi-activity fs-4"></i></div>
                <div>
                  <div class="small opacity-75">Salud IDIA Promedio</div>
                  <div class="fw-bold fs-5">${idiaPromedio}%</div>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="d-flex align-items-center gap-2">
                <div class="p-2 bg-white bg-opacity-10 rounded-3" style="background:rgba(255,255,255,.15);"><i class="bi bi-check2-circle fs-4"></i></div>
                <div>
                  <div class="small opacity-75">Evaluados en Nodo</div>
                  <div class="fw-bold fs-5" id="kpi-evaluados-count">${evaluadosCount} / ${totalAlumnosCount}</div>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="d-flex align-items-center gap-2">
                <div class="p-2 bg-white bg-opacity-10 rounded-3" style="background:rgba(255,255,255,.15);"><i class="bi bi-diagram-2 fs-4"></i></div>
                <div>
                  <div class="small opacity-75">Nodos Curriculares</div>
                  <div class="fw-bold fs-5">${nodos.length} Nodos</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CANVAS SVG DE GRAFO VECTORIAL -->
        <div class="card border border-secondary-subtle bg-body-tertiary rounded-4 p-4 shadow-sm">
          <div id="full-ruta-svg-canvas" style="min-height: 260px;"></div>
        </div>
      </div>
    `

    // Render Canvas SVG — solo se dibuja acá (carga inicial / cambio de clase),
    // nunca en cada tap de estrella.
    const canvasContainer = container.querySelector('#full-ruta-svg-canvas')
    if (canvasContainer) {
      renderMapaContenidoSVG({
        container: canvasContainer,
        nodos,
        onNodeClick: (nodo) => {
          selectedNodo = nodo
          _actualizarPanelNodo()

          // Roster ya resuelto para este nodo en esta sesión: repinta al toque.
          const cached = nodoEvalCache.get(nodo.id)
          if (cached) {
            alumnosClase = cached
            nodoDatosListos = true
            openNodoDetailModal(nodo, alumnosClase, nodos)
            _renderTbody()
            return
          }

          nodoDatosListos = false
          _renderTbody()

          obtenerAlumnosRealesPorClase(selectedClaseId, nodo.id).then((lista) => {
            if (selectedNodo?.id !== nodo.id) return
            nodoEvalCache.set(nodo.id, lista)
            alumnosClase = lista
            nodoDatosListos = true
            openNodoDetailModal(nodo, alumnosClase, nodos)
            _renderTbody()
          })
        },
      })
    }

    // Attach Event Listeners
    container.querySelector('#btn-volver-plan')?.addEventListener('click', () => {
      const activeNav = (typeof window !== 'undefined' && window.router) ? window.router : router
      activeNav.navigate(parentRoute)
    })

    container.querySelector('#btn-ir-disenador')?.addEventListener('click', () => {
      const activeNav = (typeof window !== 'undefined' && window.router) ? window.router : router
      activeNav.navigate('planificacion-disenador')
    })

    container.querySelector('#select-clase-ruta')?.addEventListener('change', (e) => {
      selectedClaseId = e.target.value
      selectedNodo = null
      _loadAlumnosYRender()
    })

    // Delegación ÚNICA para evaluar estrellas: un solo listener en el tbody
    _actualizarPanelNodo()
    _renderTbody()
  }

  _loadAlumnosYRender()
}

function _extraerNodosDePlan(plan) {
  const nodos = []
  if (Array.isArray(plan.objetivosEstructurados)) {
    plan.objetivosEstructurados.forEach((obj) => {
      if (Array.isArray(obj.indicadores)) {
        obj.indicadores.forEach((ind) => {
          nodos.push({
            id: ind.id,
            titulo: `${obj.titulo}: ${ind.titulo}`,
            estado: ind.prerrequisitoId ? 'en_proceso' : 'logrado',
          })
        })
      }
    })
  }
  return nodos
}

function _renderEstrellasSVG(cant) {
  let html = ''
  for (let i = 1; i <= 5; i++) {
    if (i <= cant) {
      html += `<i class="bi bi-star-fill text-warning me-1 star-click-item" data-star-val="${i}" style="cursor: pointer; padding: 2px;"></i>`
    } else {
      html += `<i class="bi bi-star text-secondary opacity-50 me-1 star-click-item" data-star-val="${i}" style="cursor: pointer; padding: 2px;"></i>`
    }
  }
  return html
}

function _mostrarExplicacionIDIA() {
  const existingModal = document.getElementById('modalInfoIDIA')
  if (existingModal) existingModal.remove()

  const infoModalEl = document.createElement('div')
  infoModalEl.className = 'modal fade'
  infoModalEl.id = 'modalInfoIDIA'
  infoModalEl.tabIndex = -1

  infoModalEl.innerHTML = `
    <div class="modal-dialog modal-dialog-centered my-auto" style="max-width: 520px; margin-bottom: 90px !important;">
      <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden" style="max-height: 82vh; display: flex; flex-direction: column;">
        <div class="modal-header text-white px-3 py-3 border-0" style="background: linear-gradient(135deg, hsl(190, 85%, 25%), hsl(210, 80%, 35%));">
          <div class="d-flex align-items-center gap-2">
            <div class="rounded-circle bg-white text-info p-2 d-flex align-items-center justify-content-center fw-bold fs-6" style="width:36px; height:36px; flex-shrink:0;">
              <i class="bi bi-shield-check"></i>
            </div>
            <div>
              <h5 class="fw-bold mb-0 text-white" style="font-size:1rem;">¿Qué es el Índice IDIA?</h5>
              <small class="text-white opacity-75" style="font-size:0.75rem;">Salud e Integridad Académica</small>
            </div>
          </div>
          <button type="button" class="btn-close btn-close-white ms-auto" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>

        <div class="modal-body p-3 overflow-y-auto" style="background: var(--bs-body-bg, #0f172a);">
          <div class="alert alert-info border-0 rounded-3 mb-3 small p-2" style="background: rgba(13, 202, 240, 0.1); color: var(--bs-body-color); font-size: 0.8rem;">
            <strong>El IDIA (%)</strong> es la métrica institucional que mide la <strong>salud pedagógica global</strong> del estudiante en su programa académico.
          </div>

          <h6 class="fw-bold mb-2 text-primary small"><i class="bi bi-calculator me-1"></i>¿Cómo se calcula el IDIA?</h6>
          <ul class="small text-body-secondary ps-3 mb-3" style="font-size:0.78rem;">
            <li class="mb-1"><strong>Logro Curricular (+):</strong> Nodos aprobados con 3★ o más.</li>
            <li class="mb-1"><strong>Inasistencias Injustificadas (-4%):</strong> Cada falta resta 4%.</li>
            <li class="mb-1"><strong>Inasistencias Justificadas (-1.5%):</strong> Cada falta resta 1.5%.</li>
          </ul>

          <h6 class="fw-bold mb-2 text-primary small"><i class="bi bi-speedometer2 me-1"></i>Escala de Salud IDIA:</h6>
          <div class="d-flex flex-column gap-2 small">
            <div class="d-flex align-items-center justify-content-between p-2 rounded bg-info bg-opacity-10 border border-info border-opacity-25" style="font-size:0.78rem;">
              <span><i class="bi bi-check-circle-fill text-info me-1"></i><strong>80% - 100%</strong> (Excelente)</span>
              <span class="badge bg-info-subtle text-info-emphasis">Saludable</span>
            </div>
            <div class="d-flex align-items-center justify-content-between p-2 rounded bg-warning bg-opacity-10 border border-warning border-opacity-25" style="font-size:0.78rem;">
              <span><i class="bi bi-exclamation-triangle-fill text-warning me-1"></i><strong>50% - 79%</strong> (Refuerzo)</span>
              <span class="badge bg-warning-subtle text-warning-emphasis">Atención</span>
            </div>
            <div class="d-flex align-items-center justify-content-between p-2 rounded bg-danger bg-opacity-10 border border-danger border-opacity-25" style="font-size:0.78rem;">
              <span><i class="bi bi-x-circle-fill text-danger me-1"></i><strong>< 50%</strong> (Riesgo)</span>
              <span class="badge bg-danger-subtle text-danger">Riesgo</span>
            </div>
          </div>
        </div>

        <div class="modal-footer border-0 bg-body-tertiary px-3 py-2">
          <button type="button" class="btn btn-sm btn-primary rounded-3 px-4 fw-semibold ms-auto" data-bs-dismiss="modal">Entendido</button>
        </div>
      </div>
    </div>
  `

  infoModalEl.style.zIndex = '1070'
  document.body.appendChild(infoModalEl)
  const bsModal = new bootstrap.Modal(infoModalEl)
  infoModalEl.addEventListener('hidden.bs.modal', () => {
    try { bsModal.dispose() } catch {}
    infoModalEl.remove()
  }, { once: true })
  bsModal.show()
}

function _getEtiquetaEstrella(cant) {
  if (cant === 1) return 'Iniciado'
  if (cant === 2) return 'En Proceso'
  if (cant === 3) return 'Aprobado Básico'
  if (cant === 4) return 'Logrado Fluido'
  if (cant === 5) return 'Dominado Total'
  return 'Sin Registrar'
}

let activeNodeModal = null

async function openNodoDetailModal(nodo, alumnosList = [], nodosSecuencia = []) {
  const colaOfflineData = await OfflineSyncAdapter.obtenerCola()
  alumnosList._colaOfflineData = colaOfflineData
  if (activeNodeModal) {
    try {
      const bsModal = bootstrap.Modal.getInstance(activeNodeModal)
      if (bsModal) bsModal.dispose()
    } catch {}
    activeNodeModal.remove()
    activeNodeModal = null
  }

  const modalEl = document.createElement('div')
  modalEl.className = 'modal fade'
  modalEl.id = 'nodoDetailModal90'
  modalEl.tabIndex = -1
  modalEl.setAttribute('aria-hidden', 'true')

  const rawTitle = nodo.titulo || nodo.nombre || 'Postura corporal y emisión sonora libre'

  const renderModalTbody = (list) => {
    if (!list || list.length === 0) {
      return `
        <tr>
          <td colspan="3" class="text-center py-4 text-muted">
            <i class="bi bi-person-x display-6 d-block mb-2"></i>
            No hay alumnos registrados o cargando lista de la clase...
          </td>
        </tr>
      `
    }
    return list.map((a) => {
      const statusColor = a.justificado ? '#8b5cf6' : a.presente ? '#10b981' : '#ef4444'
      const statusTitle = a.justificado ? 'Justificado' : a.presente ? 'Presente' : 'Ausente'

      const prevEstrellas = typeof a.estrellasAnteriores === 'number' ? a.estrellasAnteriores : null
      const prevTexto = prevEstrellas !== null && prevEstrellas > 0 
        ? `Previo: ${prevEstrellas}★ (${_getEtiquetaEstrella(prevEstrellas)})` 
        : 'Sin calificación previa'

      const esEvaluable = a.presente && !a.justificado
      const statusLabel = a.justificado ? 'Bloqueado (Justificado)' : a.presente ? 'Presente' : 'Bloqueado (Ausente)'

      const analisisDeuda = DeudaPedagogicaEngine.evaluarDeuda({
        alumnoId: a.id,
        nodoActual: nodo,
        nodosOrdenados: nodosSecuencia,
        colaOffline: alumnosList._colaOfflineData || [],
      })

      const tieneDeudaPrev = esEvaluable && (analisisDeuda.tieneDeuda || a.tieneDeudaPrevia)
      const warningDeudaText = analisisDeuda.advertencia || '⚠️ Deuda Pedagógica: Asistió hoy pero debe contenidos de clase(s) anterior(es).'

      return `
        <tr class="row-alumno-modal-eval${esEvaluable ? '' : ' opacity-50'}" data-id="${a.id}" style="cursor: ${esEvaluable ? 'pointer' : 'not-allowed'};">
          <td>
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <span class="rounded-circle d-inline-block shadow-sm"
                    style="width: 10px; height: 10px; background-color: ${statusColor}; flex-shrink: 0;"
                    title="${statusTitle}"></span>
              <span class="fw-bold text-body fs-6">${escapeHTML(a.nombre)}</span>
              ${tieneDeudaPrev ? `
                <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-0.5"
                      style="font-size: 0.68rem;" title="${escapeHTML(warningDeudaText)}">
                  <i class="bi bi-exclamation-triangle-fill text-warning me-1"></i>Deuda Previa
                </span>
              ` : ''}
            </div>
            <small class="text-body-secondary d-block" style="font-size: 0.75rem;">
              <i class="bi bi-clock-history me-1"></i>${escapeHTML(prevTexto)}
            </small>
            ${tieneDeudaPrev ? `
              <div class="text-warning-emphasis small mt-1 p-1 bg-warning bg-opacity-10 rounded border border-warning border-opacity-25" style="font-size:0.7rem; line-height: 1.2;">
                <i class="bi bi-info-circle me-1"></i>${escapeHTML(warningDeudaText)}
              </div>
            ` : ''}
          </td>
          <td class="text-center">
            <span class="badge ${a.idia >= 80 ? 'bg-info-subtle text-info-emphasis border border-info-subtle' : 'bg-secondary-subtle text-body border'} px-2 py-1" style="font-size: 0.75rem;">
              IDIA ${a.idia || 85}%
            </span>
          </td>
          <td class="text-center text-nowrap" style="white-space: nowrap;">
            <div class="d-inline-flex align-items-center gap-1 ${esEvaluable ? 'text-warning' : 'text-secondary opacity-50'} user-select-none text-nowrap" style="white-space: nowrap; ${esEvaluable ? '' : 'pointer-events: none;'}">
              ${_renderEstrellasSVG(a.estrellas || 0, esEvaluable)}
            </div>
            <small class="fw-bold ${esEvaluable ? 'text-body-secondary' : 'text-danger'} d-block" style="font-size: 0.75rem;">
              ${esEvaluable ? (a.estrellas > 0 ? `${a.estrellas}★ (${_getEtiquetaEstrella(a.estrellas)})` : 'Sin Registrar (0★)') : statusLabel}
            </small>
          </td>
        </tr>
      `
    }).join('')
  }

  modalEl.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-dialog-90" style="max-width: 96vw; width: 96vw;">
      <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden" style="height: 90vh;">
        <!-- Header del Modal -->
        <div class="modal-header text-white px-3 py-3 border-0"
             style="background: linear-gradient(135deg, hsl(215, 85%, 20%), hsl(240, 80%, 30%));">
          <div class="d-flex align-items-center gap-2">
            <div class="rounded-circle bg-white text-primary p-2 d-flex align-items-center justify-content-center fw-bold fs-6" style="width:36px; height:36px; flex-shrink: 0;">
              <i class="bi bi-award-fill"></i>
            </div>
            <div>
              <span class="badge bg-white text-dark fw-bold shadow-sm px-2 py-1 mb-1" style="font-size:0.75rem;">
                <i class="bi bi-journal-check me-1 text-primary"></i>Calificación de Alumnos
              </span>
              <h5 class="fw-bold mb-0 text-white" style="font-size: 1rem;">${escapeHTML(rawTitle)}</h5>
            </div>
          </div>
          <button type="button" class="btn-close btn-close-white ms-auto" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>

        <!-- Body del Modal (Scrollable 90%) -->
        <div class="modal-body p-3 overflow-y-auto" style="background: var(--bs-body-bg, #0f172a);">
          
          <!-- TARJETA DEL NODO SELECCIONADO -->
          <div class="card border border-primary-subtle bg-primary-subtle bg-opacity-10 rounded-4 p-3 mb-3 shadow-sm">
            <div class="d-flex align-items-center justify-content-between mb-1">
              <h6 class="fw-bold text-primary mb-0">
                <i class="bi bi-award me-1"></i>${escapeHTML(rawTitle)}
              </h6>
              <span class="badge bg-primary px-2 py-1" style="font-size: 0.7rem;">Nodo Activo</span>
            </div>
            <p class="text-body-secondary mb-0" style="font-size: 0.8rem;">
              Toca la fila de cualquier alumno para ciclar su calificación (1 a 5★).
            </p>
          </div>

          <!-- TABLA OPTIMIZADA PARA MÓVIL EN EL MODAL DE 90% -->
          <div class="card border border-secondary-subtle bg-body-tertiary rounded-4 p-2 shadow-sm">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th class="text-center">
                      <div class="d-inline-flex align-items-center justify-content-center gap-1">
                        <span>IDIA</span>
                        <button type="button" class="btn btn-link p-0 text-info text-decoration-none" id="btn-info-idia" title="¿Qué es el Índice IDIA? Tap para saber más">
                          <i class="bi bi-info-circle-fill fs-6"></i>
                        </button>
                      </div>
                    </th>
                    <th class="text-center text-nowrap" style="white-space: nowrap;">Calificación (1-5★)</th>
                  </tr>
                </thead>
                <tbody id="tbody-modal-alumnos">
                  ${renderModalTbody(alumnosList)}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- Footer del Modal -->
        <div class="modal-footer border-0 bg-body-tertiary px-3 py-2">
          <button type="button" class="btn btn-sm btn-secondary rounded-3 px-4 fw-semibold" data-bs-dismiss="modal">Cerrar</button>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(modalEl)
  activeNodeModal = modalEl

  // Event listener para el botón explicativo "¿Qué es IDIA?"
  modalEl.querySelector('#btn-info-idia')?.addEventListener('click', (e) => {
    e.stopPropagation()
    _mostrarExplicacionIDIA()
  })

  // Event listener con soporte para clic directo en estrella o clic de fila (ciclo)
  const tbodyModal = modalEl.querySelector('#tbody-modal-alumnos')
  tbodyModal?.addEventListener('click', (e) => {
    const tr = e.target.closest('.row-alumno-modal-eval')
    if (!tr) return
    const alId = tr.dataset.id
    const targetAl = alumnosList.find((al) => String(al.id) === String(alId))

    if (targetAl && targetAl.presente && !targetAl.justificado) {
      // Verificar si el clic fue en un ícono de estrella específico
      const starIcon = e.target.closest('.star-click-item')
      if (starIcon && starIcon.dataset.starVal) {
        targetAl.estrellas = parseInt(starIcon.dataset.starVal, 10)
      } else {
        targetAl.estrellas = IndicadorLogro.siguienteEstrella(targetAl.estrellas || 0)
      }

      // Guardar persistencia
      OfflineSyncAdapter.guardarLocal({
        alumnoId: targetAl.id,
        claseId: targetAl.claseId || 'clase-1',
        nodoId: nodo.id,
        estrellas: targetAl.estrellas,
      })

      // Actualizar vista dentro del modal de forma silenciosa e instantánea
      tbodyModal.innerHTML = renderModalTbody(alumnosList)
    }
  })

  const bsModal = new bootstrap.Modal(modalEl, { backdrop: true })
  modalEl.addEventListener('hidden.bs.modal', () => {
    try {
      bsModal.dispose()
    } catch {}
    modalEl.remove()
    activeNodeModal = null
  }, { once: true })

  bsModal.show()
}
