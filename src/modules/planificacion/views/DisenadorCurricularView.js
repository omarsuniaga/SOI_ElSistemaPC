import { router } from '../../../core/router/router.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import {
  crearPlanificacion,
  obtenerClases,
} from '../api/planificacionAdapter.js'
import { sugerirRutaDidacticaIA } from '../services/aiEvaluacionService.js'
import { renderMapaContenidoSVG } from '../components/MapaContenidoSVG.js'
import { obtenerAlumnosRealesPorClase } from '../services/realAlumnosService.js'
import { OfflineSyncAdapter } from '../api/offlineSyncAdapter.js'
import { IndicadorLogro } from '../domain/IndicadorLogro.js'

const NIVELES_TECNICOS = [
  { id: 'nivel-0', nombre: 'Nivel 0: Iniciación / Descubrimiento', color: 'success' },
  { id: 'nivel-1', nombre: 'Nivel 1: Básico / Formación Técnica', color: 'primary' },
  { id: 'nivel-2', nombre: 'Nivel 2: Intermedio / Desarrollo Solista', color: 'warning' },
  { id: 'nivel-3', nombre: 'Nivel 3: Avanzado / Maestría Institucional', color: 'danger' },
]

import { getMisClases } from '../../../portal-maestros/services/maestroDataService.js'

/**
 * Vista de Pantalla Completa: Diseñador Curricular Institucional (Premium UI/UX con Datos Reales)
 */
export async function renderDisenadorCurricularView(container, { maestroId } = {}) {
  if (!container) return

  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center py-5" style="min-height: 450px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;" role="status"></div>
        <h5 class="fw-bold text-body">Cargando Diseñador Curricular Institucional...</h5>
        <p class="text-body-secondary small">Cargando catálogo de clases y datos de alumnos reales</p>
      </div>
    </div>
  `

  let clases = []
  try {
    clases = await getMisClases().catch(() => [])
    if (!clases || clases.length === 0) {
      clases = await obtenerClases()
    }
  } catch (err) {
    console.error('[DisenadorCurricularView] Error:', err)
  }

  let estadoEstructura = {
    claseId: clases[0]?.id || '',
    nivelId: 'nivel-1',
    frecuenciaSemanal: 2,
    frecuenciaOrigen: 'manual',
    semanasTotales: 24,
    objetivos: [
      {
        id: 'obj-1',
        titulo: 'Dominio de Postura y Emisión Sonora Libre',
        indicadores: [
          { id: 'ind-1', titulo: 'Postura corporal equilibrada y relajada', prerrequisitoId: null },
          { id: 'ind-2', titulo: 'Distribución fluida del arco en cuerdas abiertas', prerrequisitoId: 'ind-1' },
        ],
      },
      {
        id: 'obj-2',
        titulo: 'Afinación y Articulación Digital',
        indicadores: [
          { id: 'ind-3', titulo: 'Colocación exacta de 1er y 2do dedo', prerrequisitoId: 'ind-2' },
          { id: 'ind-4', titulo: 'Independencia digital a pulso 60 BPM', prerrequisitoId: 'ind-3' },
        ],
      },
    ],
  }

  _renderUI(container, clases, estadoEstructura)
}

function _renderUI(container, clases, estadoEstructura) {
  // `porNodo`: cache en memoria del roster ya resuelto por nodo (evita
  // repetir la consulta a Supabase/cola offline al revisitar un nodo).
  // `currentNodoId`: nodo actualmente seleccionado, para descartar
  // respuestas obsoletas si el maestro cambia de nodo mientras una consulta
  // anterior sigue en vuelo.
  // `datosListos`: false mientras `list` todavía no refleja al nodo
  // seleccionado (fetch en vuelo). Bloquea el ciclado de estrellas durante
  // ese hueco: sin esto, un tap evaluaría sobre el conteo base de OTRO nodo
  // pero lo guardaría con el nodoId nuevo (ver M-3).
  const alumnosState = { list: [], porNodo: new Map(), currentNodoId: null, datosListos: true }

  const _loadAlumnosModal = async () => {
    alumnosState.porNodo.clear()
    alumnosState.datosListos = true
    if (estadoEstructura.claseId) {
      alumnosState.list = await obtenerAlumnosRealesPorClase(estadoEstructura.claseId)
    }
  }

  const _renderMain = () => {
    container.innerHTML = `
      <div class="container-fluid px-4 py-4">
        <!-- HEADER EN GLASSMORPHISM Y GRADIENTE HSL PREMIUM -->
        <div class="card border-0 shadow-lg rounded-4 p-4 mb-4 text-white position-relative overflow-hidden"
             style="background: linear-gradient(135deg, hsl(210, 80%, 18%), hsl(240, 75%, 26%), hsl(220, 90%, 36%));">
          
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 position-relative z-1">
            <div class="d-flex align-items-center gap-3">
              <button class="btn btn-light btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm" id="btn-volver-acm" style="width:42px; height:42px;">
                <i class="bi bi-arrow-left text-dark fs-5"></i>
              </button>
              <div>
                <div class="d-flex align-items-center gap-2 mb-1">
                  <span class="badge bg-white text-primary fw-bold shadow-sm px-2 py-1">
                    <i class="bi bi-shield-check me-1"></i>Coordinación ACM & Docente
                  </span>
                  <span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                    <i class="bi bi-check-circle me-1"></i>Conectado a Datos Reales
                  </span>
                </div>
                <h2 class="fw-bold mb-0 text-white">Diseñador Curricular Institucional</h2>
              </div>
            </div>

            <div class="d-flex align-items-center gap-2">
              <button type="button" class="btn btn-outline-light fw-bold d-inline-flex align-items-center gap-1 shadow-sm px-3" id="btn-ver-rutas-svg">
                <i class="bi bi-diagram-3"></i>Ver Rutas (SVG)
              </button>
              <button type="button" class="btn btn-light text-primary fw-bold d-inline-flex align-items-center gap-1 shadow-sm px-3" id="btn-ia-generar-full">
                <i class="bi bi-magic"></i>Generar Mapeo con IA (GROQ)
              </button>
              <button type="button" class="btn btn-success fw-bold d-inline-flex align-items-center gap-1 shadow-sm px-3" id="btn-guardar-plan-full">
                <i class="bi bi-check-circle-fill"></i>Publicar Plan Oficial
              </button>
            </div>
          </div>
        </div>

        <!-- CONFIGURACIÓN DE CLASE Y FRECUENCIA -->
        <div class="card border border-secondary-subtle bg-body-tertiary rounded-4 p-4 mb-4 shadow-sm">
          <h5 class="fw-bold mb-3 text-body"><i class="bi bi-sliders me-2 text-primary"></i>Parámetros Curriculares y Frecuencia Horaria</h5>
          
          <div class="row g-3">
            <div class="col-md-5">
              <label class="form-label fw-semibold text-body">Clase / Asignatura <span class="text-danger">*</span></label>
              <select class="form-select border-secondary-subtle" id="select-clase-full">
                <option value="">-- Seleccionar Clase --</option>
                ${clases
                  .map(
                    (c) => `
                  <option value="${c.id}" ${c.id === estadoEstructura.claseId ? 'selected' : ''}>
                    ${escapeHTML(c.nombre || c.name || `Clase ${c.id}`)}
                  </option>
                `,
                  )
                  .join('')}
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold text-body">Nivel Técnico (Mundo)</label>
              <select class="form-select border-secondary-subtle" id="select-nivel-full">
                ${NIVELES_TECNICOS.map(
                  (n) => `
                  <option value="${n.id}" ${n.id === estadoEstructura.nivelId ? 'selected' : ''}>
                    ${n.nombre}
                  </option>
                `,
                ).join('')}
              </select>
            </div>

            <div class="col-md-3">
              <label class="form-label fw-semibold text-body">Clases / Semana</label>
              <div class="input-group">
                <input type="number" class="form-control border-secondary-subtle" id="input-frecuencia-full" min="1" max="14" step="0.5" value="${estadoEstructura.frecuenciaSemanal}">
                <button class="btn btn-outline-primary" type="button" id="btn-auto-frecuencia" title="Detectar desde el horario de la clase">
                  <i class="bi bi-magic me-1"></i>Auto
                </button>
              </div>
            </div>

            <div class="col-12">
              <div class="alert alert-info border-info-subtle bg-info-subtle text-info-emphasis d-flex align-items-center py-2 px-3 rounded-3 mb-0 small" id="banner-frecuencia-info">
                <i class="bi bi-calendar-range display-6 me-3"></i>
                <div>
                  <strong>Cálculo Semestral:</strong> <span id="lbl-ritmo-calculado">${estadoEstructura.frecuenciaSemanal} clase(s)/semana ➔ ~${Math.round(estadoEstructura.frecuenciaSemanal * 24)} clases en 6 meses (24 semanas)</span>.
                  <div class="text-body-secondary" style="font-size:0.8rem;">
                    Con 4 clases de margen para conciertos y repasos, la meta real es de <strong>~${Math.max(Math.round(estadoEstructura.frecuenciaSemanal * 24) - 4, 20)} Indicadores Evaluables</strong>.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ESTRUCTURA A ANCHO COMPLETO (100%) -->
        <div class="row g-4">
          <div class="col-12">
            <div class="card border border-secondary-subtle bg-body-tertiary rounded-4 p-4 shadow-sm mb-4">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <h5 class="fw-bold text-body mb-0"><i class="bi bi-list-check me-2 text-primary"></i>Unidades e Indicadores de Logro</h5>
                <button type="button" class="btn btn-sm btn-outline-success" id="btn-add-objetivo-full">
                  <i class="bi bi-plus-circle me-1"></i>+ Agregar Objetivo
                </button>
              </div>

              <div id="lista-objetivos-container"></div>
            </div>
          </div>
        </div>
      </div>
    `

    _attachEventsFull(container, clases, estadoEstructura, alumnosState, _loadAlumnosModal)
    _renderObjetivosFull(container, estadoEstructura, alumnosState)
  }

  _loadAlumnosModal().then(() => _renderMain())
}

function _renderObjetivosFull(container, estadoEstructura, alumnosState) {
  const listEl = container.querySelector('#lista-objetivos-container')
  if (!listEl) return

  if (estadoEstructura.objetivos.length === 0) {
    listEl.innerHTML = `
      <div class="text-center py-5 text-body-secondary border border-secondary-subtle rounded-3 bg-body">
        <i class="bi bi-journal-x display-5 d-block mb-2"></i>
        Sin objetivos agregados. Presiona <strong>"+ Agregar Objetivo"</strong>.
      </div>
    `
    return
  }

  const todosIndicadores = []
  estadoEstructura.objetivos.forEach((o) => {
    o.indicadores.forEach((ind) => {
      todosIndicadores.push({ id: ind.id, titulo: ind.titulo, objTitulo: o.titulo })
    })
  })

  let claseCounter = 1

  listEl.innerHTML = estadoEstructura.objetivos
    .map(
      (obj, objIdx) => `
    <div class="card mb-3 border border-secondary-subtle shadow-sm bg-body text-body" data-obj-idx="${objIdx}">
      <div class="card-header bg-body-secondary d-flex align-items-center justify-content-between py-2 border-bottom border-secondary-subtle">
        <div class="d-flex align-items-center gap-2 flex-grow-1 me-2">
          <span class="badge bg-primary rounded-pill">Unidad ${objIdx + 1}</span>
          <input type="text" class="form-control form-control-sm fw-bold input-obj-title bg-body text-body" data-obj-idx="${objIdx}" value="${escapeHTML(obj.titulo)}" placeholder="Título del Objetivo Pedagógico">
        </div>
        <button type="button" class="btn btn-sm btn-outline-danger btn-del-obj" data-obj-idx="${objIdx}" title="Eliminar Unidad">
          <i class="bi bi-trash"></i>
        </button>
      </div>

      <div class="card-body p-3">
        <label class="form-label text-body-secondary small fw-bold text-uppercase mb-2">Indicadores Evaluables (1 Clase por Indicador)</label>
        
        <div class="indicadores-wrapper">
          ${obj.indicadores
            .map((ind, indIdx) => {
              const currentClaseNum = claseCounter++
              return `
            <div class="d-flex align-items-center gap-2 mb-2 p-2 border border-secondary-subtle rounded bg-body-tertiary" data-obj-idx="${objIdx}" data-ind-idx="${indIdx}">
              <span class="badge bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle text-nowrap">Clase ${currentClaseNum}</span>
              <input type="text" class="form-control form-control-sm flex-grow-1 input-ind-title bg-body text-body" data-obj-idx="${objIdx}" data-ind-idx="${indIdx}" value="${escapeHTML(ind.titulo)}" placeholder="Objetivo evaluable de la clase">

              <select class="form-select form-select-sm select-prereq bg-body text-body" data-obj-idx="${objIdx}" data-ind-idx="${indIdx}" style="max-width: 190px;">
                <option value="">Sin Prerrequisito</option>
                ${todosIndicadores
                  .filter((item) => item.id !== ind.id)
                  .map(
                    (item) => `
                  <option value="${item.id}" ${item.id === ind.prerrequisitoId ? 'selected' : ''}>
                    Requiere: ${escapeHTML(item.titulo.slice(0, 18))}…
                  </option>
                `,
                  )
                  .join('')}
              </select>

              <button type="button" class="btn btn-sm btn-link text-danger p-0 px-1 btn-del-ind" data-obj-idx="${objIdx}" data-ind-idx="${indIdx}">
                <i class="bi bi-x-circle"></i>
              </button>
            </div>
          `
            })
            .join('')}
        </div>

        <button type="button" class="btn btn-sm btn-link text-primary p-0 mt-1 btn-add-ind" data-obj-idx="${objIdx}">
          <i class="bi bi-plus-short"></i>+ Añadir Clase / Indicador
        </button>
      </div>
    </div>
  `,
    )
    .join('')

  _attachEventsObjetivos(container, estadoEstructura, alumnosState)
  _updateSVGFull(container, estadoEstructura, alumnosState)
}

function _attachEventsFull(container, clases, estadoEstructura, alumnosState, _loadAlumnosModal) {
  container.querySelector('#btn-volver-acm')?.addEventListener('click', () => {
    const activeNav = (typeof window !== 'undefined' && window.router) ? window.router : router
    activeNav.navigate('planificacion')
  })

  container.querySelector('#btn-ver-rutas-svg')?.addEventListener('click', () => {
    const activeNav = (typeof window !== 'undefined' && window.router) ? window.router : router
    activeNav.navigate('planificacion-ruta')
  })

  container.querySelector('#select-clase-full')?.addEventListener('change', (e) => {
    estadoEstructura.claseId = e.target.value
    _loadAlumnosModal().then(() => _renderObjetivosFull(container, estadoEstructura, alumnosState))
  })

  container.querySelector('#input-frecuencia-full')?.addEventListener('input', (e) => {
    estadoEstructura.frecuenciaSemanal = parseFloat(e.target.value || '2')
    _updateRitmoBanner(container, estadoEstructura)
  })

  container.querySelector('#btn-auto-frecuencia')?.addEventListener('click', () => {
    const targetClase = clases.find((c) => String(c.id) === String(estadoEstructura.claseId))
    if (!targetClase) {
      AppToast.show('Selecciona primero una clase para detectar su horario', 'warning')
      return
    }

    let detectedFreq = 2
    if (Array.isArray(targetClase.diasSemana)) {
      detectedFreq = targetClase.diasSemana.length
    } else if (typeof targetClase.horario === 'string') {
      const matches = targetClase.horario.match(/lunes|martes|miércoles|jueves|viernes|sábado|domingo/gi)
      if (matches) detectedFreq = new Set(matches.map((m) => m.toLowerCase())).size
    }

    estadoEstructura.frecuenciaSemanal = detectedFreq
    const inp = container.querySelector('#input-frecuencia-full')
    if (inp) inp.value = detectedFreq

    AppToast.show(`Horario detectado: ${detectedFreq} clases/semana`, 'info')
    _updateRitmoBanner(container, estadoEstructura)
  })

  container.querySelector('#btn-ia-generar-full')?.addEventListener('click', async () => {
    const btn = container.querySelector('#btn-ia-generar-full')
    if (btn) btn.disabled = true
    AppToast.show('Generando Estructura Curricular con IA (GROQ)...', 'info')

    const sugerencias = await sugerirRutaDidacticaIA({ instrumento: 'Música e Instrumento', nivelIndex: 1 })
    if (sugerencias && sugerencias.length > 0) {
      estadoEstructura.objetivos = sugerencias.map((sug, i) => ({
        id: `obj-full-ia-${i}`,
        titulo: sug.titulo || `Unidad Didáctica ${i + 1}`,
        indicadores: (sug.indicadores || ['Evaluación de desempeño']).map((ind, j) => ({
          id: `ind-full-ia-${i}-${j}`,
          titulo: typeof ind === 'string' ? ind : ind.titulo || 'Contenido Evaluables',
          prerrequisitoId: j > 0 ? `ind-full-ia-${i}-${j - 1}` : null,
        })),
      }))
      _renderObjetivosFull(container, estadoEstructura, alumnosState)
      AppToast.show('Estructura generada por IA cargada exitosamente', 'success')
    }
    if (btn) btn.disabled = false
  })

  container.querySelector('#btn-guardar-plan-full')?.addEventListener('click', async () => {
    if (!estadoEstructura.claseId) {
      AppToast.show('Debes seleccionar una Clase o Agrupación', 'warning')
      return
    }

    const contenidos = []
    estadoEstructura.objetivos.forEach((obj) => {
      contenidos.push(`[OBJETIVO] ${obj.titulo}`)
      obj.indicadores.forEach((ind) => {
        contenidos.push(`  • [CLASE] ${ind.titulo}`)
      })
    })

    const payload = {
      clase_id: estadoEstructura.claseId,
      semana: 1,
      titulo: `Plan Didáctico Semestral - ${estadoEstructura.frecuenciaSemanal} clases/sem`,
      nivelId: container.querySelector('#select-nivel-full')?.value || 'nivel-1',
      frecuenciaSemanal: estadoEstructura.frecuenciaSemanal,
      semanasTotales: 24,
      objetivosEstructurados: estadoEstructura.objetivos,
      contenidos,
      estado: 'publicada',
      esPlantillaOficial: true,
      fecha: new Date().toISOString().slice(0, 10),
    }

    try {
      await crearPlanificacion(payload)
      AppToast.show('Plan Institucional Oficial publicado con éxito ⭐', 'success')
      const activeNav = (typeof window !== 'undefined' && window.router) ? window.router : router
      activeNav.navigate('planificacion')
    } catch (err) {
      AppToast.show(`Error al publicar plan: ${err.message}`, 'error')
    }
  })

  container.querySelector('#btn-add-objetivo-full')?.addEventListener('click', () => {
    const count = estadoEstructura.objetivos.length + 1
    estadoEstructura.objetivos.push({
      id: `obj-${Date.now()}`,
      titulo: `Unidad Didáctica ${count}`,
      indicadores: [
        { id: `ind-${Date.now()}-1`, titulo: `Contenido Evaluables 1`, prerrequisitoId: null },
      ],
    })
    _renderObjetivosFull(container, estadoEstructura, alumnosState)
  })
}

function _attachEventsObjetivos(container, estadoEstructura, alumnosState) {
  container.querySelectorAll('.input-obj-title').forEach((inp) => {
    inp.addEventListener('input', (e) => {
      const idx = parseInt(e.target.dataset.objIdx, 10)
      if (estadoEstructura.objetivos[idx]) {
        estadoEstructura.objetivos[idx].titulo = e.target.value
        _updateSVGFull(container, estadoEstructura, alumnosState)
      }
    })
  })

  container.querySelectorAll('.input-ind-title').forEach((inp) => {
    inp.addEventListener('input', (e) => {
      const objIdx = parseInt(e.target.dataset.objIdx, 10)
      const indIdx = parseInt(e.target.dataset.indIdx, 10)
      if (estadoEstructura.objetivos[objIdx]?.indicadores[indIdx]) {
        estadoEstructura.objetivos[objIdx].indicadores[indIdx].titulo = e.target.value
        _updateSVGFull(container, estadoEstructura, alumnosState)
      }
    })
  })

  container.querySelectorAll('.select-prereq').forEach((sel) => {
    sel.addEventListener('change', (e) => {
      const objIdx = parseInt(e.target.dataset.objIdx, 10)
      const indIdx = parseInt(e.target.dataset.indIdx, 10)
      if (estadoEstructura.objetivos[objIdx]?.indicadores[indIdx]) {
        estadoEstructura.objetivos[objIdx].indicadores[indIdx].prerrequisitoId = e.target.value || null
        _updateSVGFull(container, estadoEstructura, alumnosState)
      }
    })
  })

  container.querySelectorAll('.btn-del-obj').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.objIdx, 10)
      estadoEstructura.objetivos.splice(idx, 1)
      _renderObjetivosFull(container, estadoEstructura, alumnosState)
    })
  })

  container.querySelectorAll('.btn-add-ind').forEach((btn) => {
    btn.addEventListener('click', () => {
      const objIdx = parseInt(btn.dataset.objIdx, 10)
      if (estadoEstructura.objetivos[objIdx]) {
        const newId = `ind-${Date.now()}`
        estadoEstructura.objetivos[objIdx].indicadores.push({
          id: newId,
          titulo: `Objetivo de Clase ${estadoEstructura.objetivos[objIdx].indicadores.length + 1}`,
          prerrequisitoId: null,
        })
        _renderObjetivosFull(container, estadoEstructura, alumnosState)
      }
    })
  })

  container.querySelectorAll('.btn-del-ind').forEach((btn) => {
    btn.addEventListener('click', () => {
      const objIdx = parseInt(btn.dataset.objIdx, 10)
      const indIdx = parseInt(btn.dataset.indIdx, 10)
      if (estadoEstructura.objetivos[objIdx]?.indicadores) {
        estadoEstructura.objetivos[objIdx].indicadores.splice(indIdx, 1)
        _renderObjetivosFull(container, estadoEstructura, alumnosState)
      }
    })
  })
}

function _updateRitmoBanner(container, estadoEstructura) {
  const frec = estadoEstructura.frecuenciaSemanal
  const totalClases = Math.round(frec * 24)
  const metaReal = Math.max(totalClases - 4, 15)

  const lbl = container.querySelector('#lbl-ritmo-calculado')
  if (lbl) {
    lbl.textContent = `${frec} clase(s)/semana ➔ ~${totalClases} clases en 6 meses (24 semanas). Meta real: ~${metaReal} Indicadores.`
  }
}

function _updateSVGFull(container, estadoEstructura, alumnosState) {
  const canvasEl = container.querySelector('#full-svg-canvas-container')
  if (!canvasEl) return

  const nodos = []
  estadoEstructura.objetivos.forEach((obj) => {
    obj.indicadores.forEach((ind) => {
      nodos.push({
        id: ind.id,
        titulo: ind.titulo,
        estado: ind.prerrequisitoId ? 'en_proceso' : 'logrado',
      })
    })
  })

  if (nodos.length === 0) {
    canvasEl.innerHTML = `<div class="text-body-secondary small py-5 text-center">Agregá indicadores para visualizar el mapa SVG en tiempo real.</div>`
    return
  }

  renderMapaContenidoSVG({
    container: canvasEl,
    nodos,
    onNodeClick: (nodo) => {
      _mostrarPanelEvaluacionAlumnos(container, nodo, alumnosState, estadoEstructura)
    },
  })
}

function _mostrarPanelEvaluacionAlumnos(container, nodo, alumnosState, estadoEstructura) {
  const panel = container.querySelector('#nodo-alumnos-eval-panel')
  const lblTitulo = container.querySelector('#lbl-nodo-eval-titulo')
  const tbody = container.querySelector('#tbody-alumnos-eval')
  if (!panel || !tbody) return

  panel.style.display = 'block'
  if (lblTitulo) lblTitulo.textContent = `Evaluación: ${nodo.titulo}`
  alumnosState.currentNodoId = nodo.id

  const badgeEstado = container.querySelector('#badge-nodo-eval-estado')

  const _renderRows = () => {
    tbody.innerHTML = (alumnosState.list || [])
      .map(
        (a) => `
      <tr class="row-alumno-eval${alumnosState.datosListos ? '' : ' opacity-50'}" data-id="${a.id}" style="cursor: pointer;">
        <td class="fw-semibold text-body">${escapeHTML(a.nombre)}</td>
        <td class="text-center">
          <span class="fs-6 text-warning">
            ${_renderEstrellasHTML(a.estrellas)}
          </span>
          <small class="text-body-secondary ms-1">(${a.estrellas > 0 ? `${a.estrellas}/5★` : 'Sin Registrar'})</small>
        </td>
      </tr>
    `,
      )
      .join('')

    tbody.querySelectorAll('.row-alumno-eval').forEach((tr) => {
      tr.addEventListener('click', () => {
        // El roster del nodo seleccionado todavía se está confirmando por
        // red: ignora el tap para no evaluar sobre el conteo base de otro
        // nodo pero guardarlo con el nodoId de este (ver auditoría M-3).
        if (!alumnosState.datosListos) return

        const id = tr.dataset.id
        const target = alumnosState.list.find((al) => String(al.id) === String(id))
        if (target) {
          target.estrellas = IndicadorLogro.siguienteEstrella(target.estrellas)

          OfflineSyncAdapter.guardarLocal({
            alumnoId: target.id,
            claseId: estadoEstructura.claseId,
            nodoId: nodo.id,
            estrellas: target.estrellas,
          })

          _renderRows()
          AppToast.show(`${target.nombre}: ${target.estrellas}★ registrados`, 'info')
        }
      })
    })
  }

  const cached = alumnosState.porNodo.get(nodo.id)
  if (cached) {
    alumnosState.list = cached
    alumnosState.datosListos = true
    _renderRows()
    return
  }

  // Repinta al toque con el mejor dato disponible (roster de clase cargado
  // hasta ahora) pero deshabilitado (`datosListos = false`) mientras se
  // confirma el roster específico de este nodo — sin esto, cambiar de nodo
  // dejaba el panel vacío/congelado O, peor, evaluable sobre datos de otro
  // nodo mientras resolvía la consulta de red (ver auditoría M-3).
  alumnosState.datosListos = false
  _renderRows()
  if (badgeEstado) badgeEstado.textContent = 'Actualizando…'

  // Re-consulta el roster filtrado por (claseId, nodoId) — ver auditoría
  // M-3: sin nodoId, las estrellas mostradas eran las de la evaluación más
  // reciente del alumno en CUALQUIER nodo, no las de este nodo puntual.
  obtenerAlumnosRealesPorClase(estadoEstructura.claseId, nodo.id).then((lista) => {
    // El maestro pudo haber seleccionado otro nodo mientras esta consulta
    // estaba en vuelo: descarta la respuesta obsoleta.
    if (alumnosState.currentNodoId !== nodo.id) return
    alumnosState.porNodo.set(nodo.id, lista)
    alumnosState.list = lista
    alumnosState.datosListos = true
    _renderRows()
    if (badgeEstado) badgeEstado.textContent = 'En Tiempo Real'
  })
}

function _renderEstrellasHTML(cant) {
  let html = ''
  for (let i = 1; i <= 5; i++) {
    if (i <= cant) {
      html += '<i class="bi bi-star-fill text-warning"></i>'
    } else {
      html += '<i class="bi bi-star text-secondary opacity-50"></i>'
    }
  }
  return html
}
