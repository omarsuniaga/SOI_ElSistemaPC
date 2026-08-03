import { router } from '../../../core/router/router.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { obtenerClases, obtenerPlanificacionesConDetalles } from '../api/planificacionAdapter.js'
import { renderMapaContenidoSVG } from '../components/MapaContenidoSVG.js'
import { obtenerAlumnosRealesPorClase } from '../services/realAlumnosService.js'
import { OfflineSyncAdapter } from '../api/offlineSyncAdapter.js'
import { IndicadorLogro } from '../domain/IndicadorLogro.js'

/**
 * Vista de Pantalla Completa: Ruta Pedagógica SVG Premium (UI/UX Rediseñada con Datos Reales)
 */
export async function renderRutaPedagogicaView(container) {
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
    const [cRes, pRes] = await Promise.all([
      obtenerClases(),
      obtenerPlanificacionesConDetalles(),
    ])
    clases = cRes || []
    planificaciones = pRes || []
  } catch (err) {
    console.error('[RutaPedagogicaView] Error:', err)
  }

  _renderUI(container, clases, planificaciones)
}

function _renderUI(container, clases, planificaciones) {
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

  // Actualiza únicamente la cabecera del panel de evaluación (título del nodo
  // seleccionado + visibilidad). No toca el tbody ni el canvas SVG.
  const _actualizarPanelNodo = () => {
    const panel = container.querySelector('#panel-alumnos-evaluacion-nodo')
    const lblNodo = container.querySelector('#lbl-nodo-seleccionado')
    if (panel) panel.style.display = selectedNodo ? 'block' : 'none'
    if (lblNodo) {
      lblNodo.innerHTML = `<i class="bi bi-award-fill text-warning me-2"></i>${escapeHTML(selectedNodo?.titulo || 'Selecciona un Nodo')}`
    }
  }

  // Repinta SOLO el <tbody> con las filas de alumnos (y el chip de "Evaluados").
  // Se invoca tras cada tap de estrella o cambio de roster — nunca reconstruye
  // la cabecera, los chips KPI completos ni el canvas SVG, evitando el
  // flicker de un innerHTML completo en cada evaluación.
  const _renderTbody = () => {
    const tbody = container.querySelector('#tbody-alumnos-ruta')
    if (!tbody) return

    tbody.innerHTML = alumnosClase
      .map((a) => {
        const initials = a.nombre
          .split(' ')
          .slice(0, 2)
          .map((n) => n[0])
          .join('')
          .toUpperCase()

        return `
          <tr class="row-alumno-ruta${nodoDatosListos ? '' : ' opacity-50'}" data-id="${a.id}" style="cursor: pointer;">
            <td>
              <div class="d-flex align-items-center gap-3">
                <div class="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center shadow-sm"
                     style="width: 40px; height: 40px; background: linear-gradient(135deg, hsl(220, 80%, 55%), hsl(280, 75%, 60%)); flex-shrink: 0;">
                  ${initials}
                </div>
                <div>
                  <div class="fw-bold text-body fs-6">${escapeHTML(a.nombre)}</div>
                  <small class="text-body-secondary">ID: ${a.id.slice(0, 8)}</small>
                </div>
              </div>
            </td>

            <td class="text-center">
              <span class="badge ${a.idia >= 80 ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'} border px-2 py-1">
                IDIA ${a.idia}%
              </span>
            </td>

            <td class="text-center">
              <span class="badge ${a.presente ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'}">
                ${a.presente ? 'Presente' : 'Ausente (Bloqueado)'}
              </span>
            </td>

            <td class="text-center">
              <div class="fs-4 text-warning user-select-none">
                ${_renderEstrellasSVG(a.estrellas)}
              </div>
              <small class="fw-bold text-body-secondary">${a.estrellas > 0 ? `${a.estrellas} Estrellas (${_getEtiquetaEstrella(a.estrellas)})` : 'Sin Registrar (0★)'}</small>
            </td>

            <td class="text-end">
              <button class="btn btn-sm ${a.presente ? 'btn-outline-primary' : 'btn-outline-secondary'} btn-evaluar-one-tap" data-id="${a.id}" ${!a.presente || !nodoDatosListos ? 'disabled' : ''}>
                <i class="bi bi-hand-index me-1"></i>Ciclar ★
              </button>
            </td>
          </tr>
        `
      })
      .join('')

    // Chip "Evaluados en Nodo" — se actualiza en el DOM sin re-render completo.
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
        <div class="card border border-secondary-subtle bg-body-tertiary rounded-4 p-4 shadow-sm mb-4">
          <div id="full-ruta-svg-canvas" style="min-height: 260px;"></div>
        </div>

        <!-- SECCIÓN DE EVALUACIÓN DE ALUMNOS (SE DESPLIEGA AL SELECCIONAR NODO) -->
        <div id="panel-alumnos-evaluacion-nodo" class="card border border-secondary-subtle bg-body-tertiary rounded-4 p-4 shadow-sm" style="display: ${selectedNodo ? 'block' : 'none'};">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 pb-3 border-bottom border-secondary-subtle">
            <div>
              <h4 class="fw-bold text-body mb-1" id="lbl-nodo-seleccionado">
                <i class="bi bi-award-fill text-warning me-2"></i>${escapeHTML(selectedNodo?.titulo || 'Selecciona un Nodo')}
              </h4>
              <p class="text-body-secondary small mb-0">Toca la fila de cualquier alumno para ciclar la evaluación 1-5★. (0★ = Sin Registrar).</p>
            </div>
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 fs-6 fw-semibold">
              <i class="bi bi-hand-index-thumb me-1"></i>1-Tap Star Evaluator
            </span>
          </div>

          <!-- GRID DE TARJETAS DE ALUMNOS (DISEÑO PREMIUM A DOS COLUMNAS / TABLA) -->
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Alumno Inscrito</th>
                  <th class="text-center">Índice IDIA</th>
                  <th class="text-center">Asistencia</th>
                  <th class="text-center">Calificación (1-5★)</th>
                  <th class="text-end">Acción Rápida</th>
                </tr>
              </thead>
              <tbody id="tbody-alumnos-ruta"></tbody>
            </table>
          </div>
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
          AppToast.info(`Nodo Seleccionado: ${nodo.titulo}`)
          _actualizarPanelNodo()

          // Roster ya resuelto para este nodo en esta sesión: repinta al toque.
          const cached = nodoEvalCache.get(nodo.id)
          if (cached) {
            alumnosClase = cached
            nodoDatosListos = true
            _renderTbody()
            return
          }

          // Re-consulta el roster filtrado por (claseId, nodoId) — ver
          // auditoría M-3: sin nodoId, las estrellas mostradas eran las de
          // la evaluación más reciente del alumno en CUALQUIER nodo, no las
          // de este nodo puntual. Mientras resuelve, la tabla sigue
          // mostrando los datos previos (no hay flicker a estado vacío) pero
          // queda deshabilitada (ver `nodoDatosListos`) para no registrar una
          // evaluación con el conteo base de otro nodo.
          nodoDatosListos = false
          _renderTbody()

          obtenerAlumnosRealesPorClase(selectedClaseId, nodo.id).then((lista) => {
            // El maestro pudo haber seleccionado otro nodo mientras esta
            // consulta estaba en vuelo: descarta la respuesta obsoleta.
            if (selectedNodo?.id !== nodo.id) return
            nodoEvalCache.set(nodo.id, lista)
            alumnosClase = lista
            nodoDatosListos = true
            _renderTbody()
          })
        },
      })
    }

    // Attach Event Listeners
    container.querySelector('#btn-volver-plan')?.addEventListener('click', () => {
      router.navigate('planificacion')
    })

    container.querySelector('#btn-ir-disenador')?.addEventListener('click', () => {
      router.navigate('planificacion-disenador')
    })

    container.querySelector('#select-clase-ruta')?.addEventListener('change', (e) => {
      selectedClaseId = e.target.value
      selectedNodo = null
      _loadAlumnosYRender()
    })

    // Delegación ÚNICA para evaluar estrellas: un solo listener en el tbody
    // (no en cada fila/botón), así un click en el botón no dispara el mismo
    // handler dos veces (una en el target, otra en el bubbling hacia la fila).
    container.querySelector('#tbody-alumnos-ruta')?.addEventListener('click', (e) => {
      // El roster del nodo seleccionado todavía se está confirmando por red:
      // ignora el tap para no evaluar sobre el conteo base de otro nodo.
      if (!nodoDatosListos) return
      const tr = e.target.closest('.row-alumno-ruta')
      if (!tr) return
      const alId = tr.dataset.id
      const targetAl = alumnosClase.find((al) => String(al.id) === String(alId))

      if (targetAl && targetAl.presente) {
        targetAl.estrellas = IndicadorLogro.siguienteEstrella(targetAl.estrellas)

        // Guardar persistencia en IndexedDB / LocalStorage
        OfflineSyncAdapter.guardarLocal({
          alumnoId: targetAl.id,
          claseId: selectedClaseId,
          nodoId: selectedNodo?.id || 'nodo-1',
          estrellas: targetAl.estrellas,
        })

        // Solo repinta el tbody — evita el flicker de re-renderizar toda
        // la vista (cabecera + SVG) por cada tap de estrella.
        _renderTbody()
        AppToast.show(`${targetAl.nombre}: ${targetAl.estrellas}★ registrad@s en LocalStorage/Offline`, 'info')
      }
    })

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
