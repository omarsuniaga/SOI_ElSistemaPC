import { router } from '../../../core/router/router.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { obtenerClases, obtenerPlanificacionesConDetalles } from '../api/planificacionAdapter.js'
import { renderMapaContenidoSVG } from '../components/MapaContenidoSVG.js'
import { obtenerAlumnosRealesPorClase } from '../services/realAlumnosService.js'
import { OfflineSyncAdapter } from '../api/offlineSyncAdapter.js'
import { IndicadorLogro } from '../domain/IndicadorLogro.js'

import { getMisClases } from '../../../portal-maestros/services/maestroDataService.js'

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
            openNodoDetailModal(nodo, alumnosClase)
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
            openNodoDetailModal(nodo, alumnosClase)
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
      html += '<i class="bi bi-star-fill text-warning me-1"></i>'
    } else {
      html += '<i class="bi bi-star text-secondary opacity-50 me-1"></i>'
    }
  }
  return html
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

function openNodoDetailModal(nodo, alumnosList = []) {
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
      return `
        <tr class="row-alumno-modal-eval" data-id="${a.id}" style="cursor: pointer;">
          <td>
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <span class="fw-bold text-body fs-6">${escapeHTML(a.nombre)}</span>
              <span class="badge ${a.presente ? 'bg-success text-white' : 'bg-danger text-white'}" style="font-size: 0.7rem;">
                ${a.presente ? 'Presente' : 'Ausente'}
              </span>
            </div>
            <small class="text-body-secondary d-block" style="font-size: 0.75rem;">ID: ${a.id.slice(0, 8)}</small>
          </td>
          <td class="text-center">
            <span class="badge ${a.idia >= 80 ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'} border px-2 py-1" style="font-size: 0.75rem;">
              IDIA ${a.idia || 85}%
            </span>
          </td>
          <td class="text-center text-nowrap" style="white-space: nowrap;">
            <div class="d-inline-flex align-items-center gap-1 text-warning user-select-none text-nowrap" style="white-space: nowrap;">
              ${_renderEstrellasSVG(a.estrellas || 0)}
            </div>
            <small class="fw-bold text-body-secondary d-block" style="font-size: 0.75rem;">${a.estrellas > 0 ? `${a.estrellas}★ (${_getEtiquetaEstrella(a.estrellas)})` : 'Sin Registrar (0★)'}</small>
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
              <span class="badge bg-white bg-opacity-20 text-white border border-white border-opacity-25 px-2 py-0.5 mb-0.5" style="font-size:0.7rem;">
                <i class="bi bi-journal-check me-1"></i>Calificación de Alumnos
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
                    <th class="text-center">IDIA</th>
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

  // Event listener para ciclar estrellas dentro del modal de 90%
  const tbodyModal = modalEl.querySelector('#tbody-modal-alumnos')
  tbodyModal?.addEventListener('click', (e) => {
    const tr = e.target.closest('.row-alumno-modal-eval')
    if (!tr) return
    const alId = tr.dataset.id
    const targetAl = alumnosList.find((al) => String(al.id) === String(alId))

    if (targetAl && targetAl.presente) {
      targetAl.estrellas = IndicadorLogro.siguienteEstrella(targetAl.estrellas || 0)

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
