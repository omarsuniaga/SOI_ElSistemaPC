import { router } from '../../../core/router/router.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { obtenerClases, obtenerPlanificacionesConDetalles } from '../api/planificacionAdapter.js'
import { getFullHierarchy } from '../api/routeAdapter.js'
import { renderMapaContenidoSVG } from '../components/MapaContenidoSVG.js'
import { extraerNodosDePlan, extraerNodosDeRutaCurricular } from '../components/routeNodes.js'
import { selectBestPlanForClass, sameClaseId } from '../utils/planificacionClassResolver.js'
import { obtenerAlumnosRealesPorClase } from '../services/realAlumnosService.js'
import { registrarEvaluacion } from '../services/evaluacionClaseService.js'
import { OfflineSyncAdapter } from '../api/offlineSyncAdapter.js'
import { IndicadorLogro } from '../domain/IndicadorLogro.js'

import { getMisClases } from '../../../portal-maestros/services/maestroDataService.js'
import { DeudaPedagogicaEngine } from '../domain/DeudaPedagogicaEngine.js'

/**
 * Vista de Pantalla Completa: Ruta Pedagógica SVG Premium (UI/UX Rediseñada con Datos Reales)
 */
export async function renderRutaPedagogicaView(container, { maestroId, parentRoute = 'planificacion', claseId } = {}) {
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
      obtenerPlanificacionesConDetalles(maestroId || null),
    ])
    const claseSolicitadaNoEstaEnMisClases =
      claseId && Array.isArray(misClases) && misClases.length > 0 &&
      !misClases.some((c) => sameClaseId(c.id, claseId))

    clases = (misClases && misClases.length > 0 && !claseSolicitadaNoEstaEnMisClases)
      ? misClases
      : await obtenerClases()
    planificaciones = pRes || []
  } catch (err) {
    console.error('[RutaPedagogicaView] Error:', err)
  }

  _renderUI(container, clases, planificaciones, { parentRoute, claseIdInicial: claseId, maestroId })
}

function _renderUI(container, clases, planificaciones, { parentRoute = 'planificacion', claseIdInicial, maestroId } = {}) {
  let selectedClaseId = (claseIdInicial && clases.find((c) => sameClaseId(c.id, claseIdInicial)))
    ? (clases.find((c) => sameClaseId(c.id, claseIdInicial))?.id || claseIdInicial)
    : clases[0]?.id || ''
  let selectedNodo = null
  let alumnosClase = []
  let jerarquiaCurricular = []
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
    const [roster, hierarchy] = await Promise.all([
      obtenerAlumnosRealesPorClase(selectedClaseId).catch(() => []),
      getFullHierarchy(selectedClaseId).catch(() => []),
    ])
    alumnosClase = roster
    jerarquiaCurricular = Array.isArray(hierarchy) ? hierarchy : []
    _renderShell()
  }

  const _actualizarPanelNodo = () => {
    // El detalle ahora se gestiona limpiamente a través del modal del 90%
  }

  const _renderTbody = () => {
    // La evaluación se gestiona limpiamente en la tabla interactiva dentro del modal del 90%
    const totalAlumnosCount = alumnosClase.length

    const chipEvaluados = container.querySelector('#kpi-evaluados-count')
    if (chipEvaluados) {
      const evaluadosCount = alumnosClase.filter((a) => a.estrellas > 0).length
      chipEvaluados.textContent = `${evaluadosCount} / ${totalAlumnosCount}`
    }

    // Bug: este chip se calculaba una sola vez en _renderShell() y nunca se
    // refrescaba tras calificar — quedaba en 0% o desactualizado toda la
    // sesión aunque el maestro siguiera evaluando alumnos.
    const chipIdia = container.querySelector('#kpi-idia-promedio')
    if (chipIdia) {
      const idiaPromedio = Math.round(
        alumnosClase.reduce((acc, a) => acc + (a.idia || 0), 0) / (totalAlumnosCount || 1),
      )
      chipIdia.textContent = `${idiaPromedio}%`
    }
  }

  // Construye la "carcasa" completa (cabecera, chips KPI, canvas SVG y la
  // tabla vacía) UNA sola vez por carga de clase/roster. El canvas SVG solo
  // se dibuja acá — nunca en cada tap de estrella.
  const _renderShell = () => {
    const planClase = selectBestPlanForClass(planificaciones, {
      claseId: selectedClaseId,
      maestroId,
    })
    const targetClaseObj = clases.find((c) => sameClaseId(c.id, selectedClaseId)) || { nombre: 'Clase General' }

    const nodosDelPlan = planClase ? extraerNodosDePlan(planClase, targetClaseObj) : []
    const nodos = nodosDelPlan.length > 0
      ? nodosDelPlan
      : extraerNodosDeRutaCurricular(jerarquiaCurricular, targetClaseObj)

    // Métricas para la cabecera Premium
    const totalAlumnosCount = alumnosClase.length
    const evaluadosCount = alumnosClase.filter((a) => a.estrellas > 0).length
    const idiaPromedio = Math.round(alumnosClase.reduce((acc, a) => acc + (a.idia || 0), 0) / (totalAlumnosCount || 1))

    container.innerHTML = `
      <div class="container-fluid px-2 py-2">
        <!-- CABECERA PREMIUM EN GLASSMORPHISM / HSL GRADIENTE -->
        <div class="card border-0 shadow-lg rounded-4 p-2 mb-2 text-white position-relative overflow-hidden"
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
                <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
                  <span class="badge bg-white text-primary fw-bold shadow-sm px-2 py-1">
                    <i class="bi bi-music-note-beamed me-1"></i>${escapeHTML(targetClaseObj.nombre || 'Clase Académica')}
                  </span>
                  ${nodos.esDemo ? `<span class="badge bg-warning text-dark border border-warning px-2 py-1"><i class="bi bi-exclamation-triangle-fill me-1"></i>Ruta de ejemplo — sin plan real todavía</span>` : ''}
                </div>
                <h2 class="fw-bold mb-0 text-white">Ruta Pedagógica Interactiva</h2>
              </div>
            </div>

            <!-- ACCIONES -->
            <div class="d-flex flex-wrap align-items-center gap-2">
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
                  <div class="fw-bold fs-5" id="kpi-idia-promedio">${idiaPromedio}%</div>
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
            openNodoDetailModal(nodo, alumnosClase, nodos, selectedClaseId, true, maestroId)
            _renderTbody()
            return
          }

          nodoDatosListos = false
          openNodoDetailModal(nodo, alumnosClase, nodos, selectedClaseId, false, maestroId)
          _renderTbody()

          obtenerAlumnosRealesPorClase(selectedClaseId, nodo.id).then((lista) => {
            if (selectedNodo?.id !== nodo.id) return
            nodoEvalCache.set(nodo.id, lista)
            alumnosClase = lista
            nodoDatosListos = true
            openNodoDetailModal(nodo, alumnosClase, nodos, selectedClaseId, true, maestroId)
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
      activeNav.navigate('planificacion-disenador', {
        claseId: selectedClaseId,
        parentRoute,
      })
    })

    // Delegación ÚNICA para evaluar estrellas: un solo listener en el tbody
    _actualizarPanelNodo()
    _renderTbody()
  }

  _loadAlumnosYRender()
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

function _estadoDesdeEstrellas(estrellas) {
  if (estrellas <= 0) return 'sin_evaluar'
  if (estrellas === 1) return 'inicia'
  if (estrellas === 2) return 'en_progreso'
  if (estrellas === 3) return 'avanzado'
  if (estrellas === 4) return 'avanzado'
  return 'dominado'
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
              <span><i class="bi bi-x-circle-fill text-danger me-1"></i><strong>&lt; 50%</strong> (Riesgo)</span>
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
    try { bsModal.dispose() } catch { }
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

async function openNodoDetailModal(
  nodo,
  alumnosList = [],
  nodosSecuencia = [],
  selectedClaseId = '',
  datosListos = true,
  evaluadoPorId = null,
) {
  const colaOfflineData = await OfflineSyncAdapter.obtenerCola()
  alumnosList._colaOfflineData = colaOfflineData

  let isExisting = false
  let modalEl
  if (activeNodeModal && activeNodeModal.dataset.nodoId === nodo.id) {
    modalEl = activeNodeModal
    isExisting = true
  } else {
    modalEl = document.createElement('div')
    modalEl.className = 'modal fade'
    modalEl.id = 'nodoDetailModal90'
    modalEl.tabIndex = -1
    modalEl.dataset.nodoId = nodo.id
  }

  modalEl._state = { nodo, alumnosList, nodosSecuencia, selectedClaseId, datosListos, evaluadoPorId }

  // ─── RENDER: Card-based student list (mobile-first) ───────────────────────
  const renderModalTbody = (list) => {
    if (!list || list.length === 0) {
      return `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--bs-secondary-color, #94a3b8);">
          <i class="bi bi-person-x" style="font-size: 2.5rem; display: block; margin-bottom: 0.75rem;"></i>
          <p style="margin: 0; font-size: 0.9rem;">No hay alumnos registrados o cargando lista de la clase...</p>
        </div>
      `
    }
    const currentDatosListos = modalEl._state.datosListos !== false
    return list.map((a) => {
      const statusColor = a.justificado ? '#8b5cf6' : a.presente ? '#10b981' : '#ef4444'
      const statusBg    = a.justificado ? 'rgba(139,92,246,.12)' : a.presente ? 'rgba(16,185,129,.10)' : 'rgba(239,68,68,.10)'
      const statusTitle = a.justificado ? 'Justificado' : a.presente ? 'Presente' : 'Ausente'

      const prevEstrellas = typeof a.estrellasAnteriores === 'number' ? a.estrellasAnteriores : null
      const prevTexto = prevEstrellas !== null && prevEstrellas > 0
        ? `Previo: ${prevEstrellas}★ — ${_getEtiquetaEstrella(prevEstrellas)}`
        : 'Sin calificación previa'

      const esEvaluable = currentDatosListos && a.presente && !a.justificado
      const statusLabel = a.justificado ? 'Justificado' : a.presente ? (currentDatosListos ? 'Presente' : 'Actualizando…') : 'Ausente'

      const analisisDeuda = DeudaPedagogicaEngine.evaluarDeuda({
        alumnoId: a.id,
        nodoActual: nodo,
        nodosOrdenados: nodosSecuencia,
        colaOffline: alumnosList._colaOfflineData || [],
      })

      const tieneDeudaPrev = esEvaluable && (analisisDeuda.tieneDeuda || a.tieneDeudaPrevia)
      const warningDeudaText = analisisDeuda.advertencia || '⚠️ Deuda Pedagógica: Asistió hoy pero debe contenidos de clase(s) anterior(es).'

      const idiaVal = a.idia || 85
      const idiaClass = idiaVal >= 80 ? 'bg-info-subtle text-info-emphasis border-info-subtle' : 'bg-secondary-subtle text-body border-secondary-subtle'

      const estrellaLabel = esEvaluable
        ? (a.estrellas > 0 ? `${a.estrellas} Estrellas · ${a.estrellas}★  ${_getEtiquetaEstrella(a.estrellas)}` : 'Sin Registrar (0 Estrellas)')
        : statusLabel
      const estrellaColor = esEvaluable ? 'color: var(--bs-secondary-color, #94a3b8);' : 'color: #ef4444;'

      return `
        <div class="row-alumno-modal-eval row-alumno-ruta${esEvaluable ? '' : ' is-blocked opacity-50'}"
             data-id="${a.id}"
             style="
               background: ${esEvaluable ? 'var(--bs-tertiary-bg, #1e293b)' : 'rgba(30,41,59,0.45)'};
               border: 1px solid ${esEvaluable ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)'};
               border-radius: 14px;
               padding: 12px 14px;
               margin-bottom: 10px;
               cursor: ${esEvaluable ? 'pointer' : 'not-allowed'};
               opacity: ${esEvaluable ? '1' : '0.55'};
               transition: background 0.15s ease;
             "
        >
          <!-- ROW 1: dot + nombre + status pill -->
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
            <span style="
              width: 11px; height: 11px; border-radius: 50%; flex-shrink: 0;
              background: ${statusColor}; box-shadow: 0 0 6px ${statusColor}88;
            " title="${statusTitle}"></span>
            <span style="font-weight: 700; font-size: 0.96rem; flex: 1; line-height: 1.25;">${escapeHTML(a.nombre)}</span>
            <span style="
              font-size: 0.67rem; font-weight: 600; padding: 2px 9px;
              border-radius: 20px; white-space: nowrap;
              background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusColor}44;
            ">${statusTitle}</span>
          </div>

          <!-- ROW 2: calificación previa -->
          <div style="font-size: 0.73rem; color: var(--bs-secondary-color, #94a3b8); margin-bottom: ${tieneDeudaPrev ? '8px' : '10px'}; padding-left: 21px;">
            <i class="bi bi-clock-history" style="margin-right: 4px;"></i>${escapeHTML(prevTexto)}
          </div>

          <!-- ROW 3 (condicional): advertencia de deuda pedagógica -->
          ${tieneDeudaPrev ? `
          <div style="
            background: rgba(234,179,8,.10); border: 1px solid rgba(234,179,8,.28);
            border-radius: 8px; padding: 7px 10px; margin-bottom: 10px;
            font-size: 0.71rem; line-height: 1.4; color: #fde68a;
            display: flex; align-items: flex-start; gap: 6px;
          ">
            <i class="bi bi-exclamation-triangle-fill" style="color: #f59e0b; flex-shrink: 0; margin-top: 1px;"></i>
            <span>${escapeHTML(warningDeudaText)}</span>
          </div>
          ` : ''}

          <!-- ROW 4: IDIA + estrellas -->
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <span class="border ${idiaClass}" style="font-size: 0.73rem; padding: 3px 10px; border-radius: 20px; font-weight: 600; white-space: nowrap;">
              IDIA ${idiaVal}%
            </span>
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
              <button class="btn-evaluar-one-tap d-none" data-id="${a.id}" ${esEvaluable ? '' : 'disabled'}></button>
              <div class="${esEvaluable ? 'text-warning' : 'text-secondary'}"
                   style="display: inline-flex; gap: 2px; ${esEvaluable ? '' : 'opacity: 0.35; pointer-events: none;'}">
                ${_renderEstrellasSVG(a.estrellas || 0, esEvaluable)}
              </div>
              <small style="font-size: 0.69rem; font-weight: 600; ${estrellaColor}">${estrellaLabel}</small>
            </div>
          </div>
        </div>
      `
    }).join('')
  }
  // ──────────────────────────────────────────────────────────────────────────

  if (isExisting) {
    const listEl = modalEl.querySelector('#tbody-modal-alumnos')
    if (listEl) listEl.innerHTML = renderModalTbody(alumnosList)
    return
  }

  if (activeNodeModal) {
    try {
      const bsModal = bootstrap.Modal.getInstance(activeNodeModal)
      if (bsModal) bsModal.dispose()
    } catch { }
    activeNodeModal.remove()
    activeNodeModal = null
  }

  const rawTitle = nodo.titulo || nodo.nombre || 'Postura corporal y emisión sonora libre'

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
              Toca la card de cualquier alumno para ciclar su calificación (1 a 5★).
            </p>
          </div>

          <!-- CABECERA DE LISTA -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <span style="font-size: 0.78rem; font-weight: 600; color: var(--bs-secondary-color, #94a3b8); letter-spacing: 0.05em;">ALUMNOS</span>
            <button type="button" class="btn btn-link p-0 text-info text-decoration-none d-inline-flex align-items-center gap-1" id="btn-info-idia" title="¿Qué es el Índice IDIA?" style="font-size: 0.75rem;">
              <i class="bi bi-info-circle-fill"></i> ¿Qué es IDIA?
            </button>
          </div>

          <!-- LISTA DE CARDS DE ALUMNOS -->
          <div id="tbody-modal-alumnos">
            ${renderModalTbody(alumnosList)}
          </div>

        </div>

        <!-- Footer del Modal -->
        <div class="modal-footer border-0 bg-body-tertiary px-3 py-2">
          <button type="button" class="btn btn-sm btn-success rounded-3 px-4 fw-semibold me-auto" id="btn-guardar-calificaciones">
            Guardar calificaciones
          </button>
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

  // Event listener con soporte para clic directo en estrella o clic de card (ciclo)
  const listContainer = modalEl.querySelector('#tbody-modal-alumnos')
  listContainer?.addEventListener('click', (e) => {
    const state = modalEl._state || { nodo, alumnosList, selectedClaseId, datosListos, evaluadoPorId }
    if (state.datosListos === false) return

    const cardEl = e.target.closest('.row-alumno-modal-eval')
    if (!cardEl) return
    const alId = cardEl.dataset.id
    const targetAl = state.alumnosList.find((al) => String(al.id) === String(alId))

    if (targetAl && targetAl.presente && !targetAl.justificado) {
      // Verificar si el clic fue en un ícono de estrella específico
      const starIcon = e.target.closest('.star-click-item')
      if (starIcon && starIcon.dataset.starVal) {
        targetAl.estrellas = parseInt(starIcon.dataset.starVal, 10)
      } else {
        targetAl.estrellas = IndicadorLogro.siguienteEstrella(targetAl.estrellas || 0)
      }

      // Guardar persistencia con IDs reales de Alumno, Clase y Nodo en Supabase/IndexedDB
      OfflineSyncAdapter.guardarLocal({
        alumnoId: targetAl.id,
        claseId: targetAl.claseId || state.selectedClaseId,
        nodoId: state.nodo.id,
        estrellas: targetAl.estrellas,
      })

      // Actualizar vista dentro del modal de forma silenciosa e instantánea
      listContainer.innerHTML = renderModalTbody(state.alumnosList)
    }
  })

  modalEl.querySelector('#btn-guardar-calificaciones')?.addEventListener('click', async (e) => {
    e.preventDefault()
    const state = modalEl._state || { nodo, alumnosList, selectedClaseId, datosListos, evaluadoPorId }
    const saveBtn = e.currentTarget
    const originalHTML = saveBtn.innerHTML
    const evaluables = (state.alumnosList || []).filter((a) => a.presente && !a.justificado)

    if (evaluables.length === 0) {
      AppToast.show('No hay calificaciones para guardar en este nodo.', 'info')
      return
    }

    saveBtn.disabled = true
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...'

    let guardadas = 0
    let pendientes = 0

    try {
      for (const alumno of evaluables) {
        const estrellas = Number(alumno.estrellas || 0)

        try {
          await registrarEvaluacion({
            alumno_id: alumno.id,
            indicator_id: state.nodo.id,
            clase_id: state.selectedClaseId,
            nota: estrellas > 0 ? estrellas : null,
            estado: _estadoDesdeEstrellas(estrellas),
            evaluado_por: state.evaluadoPorId || evaluadoPorId || null,
          })

          await OfflineSyncAdapter.eliminarDeCola({
            alumnoId: alumno.id,
            claseId: state.selectedClaseId,
            nodoId: state.nodo.id,
          })

          guardadas++
        } catch (err) {
          pendientes++
          console.error('[RutaPedagogicaView] Error guardando calificación en Supabase:', err)
          await OfflineSyncAdapter.guardarLocal({
            alumnoId: alumno.id,
            claseId: state.selectedClaseId,
            nodoId: state.nodo.id,
            estrellas,
          })
        }
      }

      state.alumnosList._colaOfflineData = await OfflineSyncAdapter.obtenerCola()
      const refrescados = await obtenerAlumnosRealesPorClase(state.selectedClaseId, state.nodo.id)
      state.alumnosList.splice(0, state.alumnosList.length, ...refrescados)
      listContainer.innerHTML = renderModalTbody(state.alumnosList)

      if (pendientes === 0) {
        AppToast.show(`${guardadas} calificaciones guardadas en la base de datos.`, 'success')
      } else {
        AppToast.show(`${guardadas} calificaciones guardadas en la base de datos y ${pendientes} quedaron pendientes de sincronización.`, 'warning')
      }
    } catch (err) {
      console.error('[RutaPedagogicaView] Error en el guardado masivo del nodo:', err)
      AppToast.show(err.message || 'No se pudieron guardar las calificaciones.', 'error')
    } finally {
      saveBtn.disabled = false
      saveBtn.innerHTML = originalHTML
    }
  })

  const bsModal = new bootstrap.Modal(modalEl, { backdrop: true })
  modalEl.addEventListener('hide.bs.modal', () => {
    // Libera el foco antes de que Bootstrap marque el modal con aria-hidden;
    // evita el warning de accesibilidad por foco retenido dentro de un
    // elemento oculto del árbol de accesibilidad.
    if (modalEl.contains(document.activeElement)) {
      document.activeElement.blur()
    }
  })
  modalEl.addEventListener('hidden.bs.modal', () => {
    try {
      bsModal.dispose()
    } catch { }
    modalEl.remove()
    activeNodeModal = null
  }, { once: true })

  bsModal.show()
}
