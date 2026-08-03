import { router } from '../../../core/router/router.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import {
  obtenerClases,
  obtenerPlantillasPlanificacion,
  crearPlantillaPlanificacion,
  actualizarPlantillaPlanificacion,
} from '../api/planificacionAdapter.js'
import { sugerirRutaDidacticaIA, sugerirSiguienteUnidadIA } from '../services/aiEvaluacionService.js'
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
export async function renderDisenadorCurricularView(container, { maestroId, claseId } = {}) {
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

  const claseIdInicial = (claseId && clases.find((c) => String(c.id) === String(claseId)))
    ? claseId
    : clases[0]?.id || ''

  let planExistente = null
  try {
    const plantillas = await obtenerPlantillasPlanificacion().catch(() => [])
    planExistente = plantillas.find((p) => String(p.clase_id) === String(claseIdInicial))
  } catch {}

  // El árbol de unidades viaja serializado como JSON-string en la columna
  // TEXT `objetivos` — hay que parsearlo. Bug encontrado: esto solo se hacía
  // al cambiar de clase en el selector, nunca en la carga inicial, así que
  // la primera vista de una clase con plan real seguía mostrando la muestra
  // demo (y agregar una unidad la apilaba encima del contenido inventado).
  let objetivosReales = null
  if (planExistente?.objetivos) {
    try {
      const parsed = typeof planExistente.objetivos === 'string'
        ? JSON.parse(planExistente.objetivos)
        : planExistente.objetivos
      if (Array.isArray(parsed) && parsed.length > 0) objetivosReales = parsed
    } catch (err) {
      console.error('[DisenadorCurricularView] Error parseando objetivos guardados:', err)
    }
  }

  let estadoEstructura = {
    esDataDemo: !objetivosReales,
    claseId: claseIdInicial,
    nivelId: planExistente?.nivelId || 'nivel-1',
    frecuenciaSemanal: planExistente?.frecuenciaSemanal || 2,
    frecuenciaOrigen: 'manual',
    semanasTotales: 24,
    objetivos: objetivosReales || _objetivosDemoSeed(),
  }

  _renderUI(container, clases, estadoEstructura)
}

/**
 * Muestra de ejemplo (NO son datos reales de ninguna clase). Se reemplaza
 * por completo — nunca se apila — en cuanto el maestro crea su primera
 * unidad real (manual o con IA).
 */
function _objetivosDemoSeed() {
  return [
    {
      id: 'unidad-1',
      titulo: 'Unidad 1: Postura y Emisión Sonora',
      objetivos: [
        {
          id: 'obj-1',
          titulo: 'Dominio de Postura Corporal',
          indicadores: [
            { id: 'ind-1', titulo: 'Postura corporal equilibrada y relajada', prerrequisitoId: null },
            { id: 'ind-2', titulo: 'Distribución fluida del arco en cuerdas abiertas', prerrequisitoId: 'ind-1' },
          ],
        },
      ],
    },
    {
      id: 'unidad-2',
      titulo: 'Unidad 2: Afinación y Articulación Digital',
      objetivos: [
        {
          id: 'obj-2',
          titulo: 'Colocación de Dedos',
          indicadores: [
            { id: 'ind-3', titulo: 'Colocación exacta de 1er y 2do dedo', prerrequisitoId: 'ind-2' },
            { id: 'ind-4', titulo: 'Independencia digital a pulso 60 BPM', prerrequisitoId: 'ind-3' },
          ],
        },
      ],
    },
  ]
}

/** Recorre unidades → objetivos → indicadores y devuelve la lista plana de indicadores (para prerrequisitos y canvas SVG). */
function _todosLosIndicadores(unidades) {
  const out = []
  unidades.forEach((u) => {
    ;(u.objetivos || []).forEach((o) => {
      ;(o.indicadores || []).forEach((ind) =>
        out.push({ ...ind, unidadTitulo: u.titulo, objTitulo: o.titulo }),
      )
    })
  })
  return out
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
    const claseSel = clases.find((c) => String(c.id) === String(estadoEstructura.claseId))
    const nombreClase = claseSel?.nombre || claseSel?.name || (estadoEstructura.claseId ? `Clase ${estadoEstructura.claseId}` : 'Sin clase seleccionada')
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
                <i class="bi bi-magic text-purple"></i>+ Generar Siguiente Unidad con IA (GROQ)
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
              <label class="form-label fw-semibold text-body">Clase / Asignatura</label>
              <div class="d-flex align-items-center gap-2 bg-white border border-secondary-subtle rounded-3 px-3 py-2">
                <i class="bi bi-book-fill text-primary"></i>
                <span class="fw-bold text-dark">${escapeHTML(nombreClase)}</span>
              </div>
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

              <div id="banner-data-demo" class="alert alert-warning d-flex align-items-center gap-2 py-2 mb-3" style="font-size:0.85rem; display:${estadoEstructura.esDataDemo ? '' : 'none'};">
                <i class="bi bi-info-circle-fill"></i>
                <div><strong>Datos de ejemplo</strong> — esta clase todavía no tiene un plan real guardado. Se reemplazan por completo apenas agregues o generes la primera unidad.</div>
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
  const banner = container.querySelector('#banner-data-demo')
  if (banner) banner.style.display = estadoEstructura.esDataDemo ? '' : 'none'

  const listEl = container.querySelector('#lista-objetivos-container')
  if (!listEl) return

  if (estadoEstructura.objetivos.length === 0) {
    listEl.innerHTML = `
      <div class="text-center py-5 text-body-secondary border border-secondary-subtle rounded-3 bg-body">
        <i class="bi bi-journal-x display-5 d-block mb-2"></i>
        Sin unidades agregadas. Presiona <strong>"+ Agregar Unidad"</strong>.
      </div>
    `
    return
  }

  const todosIndicadores = _todosLosIndicadores(estadoEstructura.objetivos)
  let claseCounter = 1

  listEl.innerHTML = estadoEstructura.objetivos
    .map(
      (unidad, uIdx) => `
    <div class="card mb-3 border border-primary-subtle shadow-sm bg-body text-body" data-u-idx="${uIdx}">
      <div class="card-header bg-body-secondary d-flex align-items-center justify-content-between py-2 border-bottom border-primary-subtle">
        <div class="d-flex align-items-center gap-2 flex-grow-1 me-2">
          <span class="badge bg-primary rounded-pill">Unidad ${uIdx + 1}</span>
          <input type="text" class="form-control form-control-sm fw-bold input-unidad-title bg-body text-body" data-u-idx="${uIdx}" value="${escapeHTML(unidad.titulo)}" placeholder="Título de la Unidad">
          ${unidad.clasesEstimadas ? `
            <span class="badge bg-info-subtle text-info-emphasis border border-info-subtle px-2 py-1 text-nowrap" style="font-size:0.75rem;" title="${escapeHTML(unidad.justificacionPedagogica || 'Estimación basada en complejidad')}">
              <i class="bi bi-clock me-1"></i>~${unidad.clasesEstimadas} Clases Est.
            </span>
          ` : ''}
        </div>
        <button type="button" class="btn btn-sm btn-outline-danger btn-del-unidad" data-u-idx="${uIdx}" title="Eliminar Unidad">
          <i class="bi bi-trash"></i>
        </button>
      </div>

      <div class="card-body p-3">
        ${unidad.justificacionPedagogica ? `
          <div class="alert alert-info py-1 px-2 border-0 bg-info bg-opacity-10 text-info-emphasis mb-2 small" style="font-size:0.78rem;">
            <i class="bi bi-robot me-1"></i><strong>Análisis GROQ:</strong> ${escapeHTML(unidad.justificacionPedagogica)}
          </div>
        ` : ''}

        ${(unidad.objetivos || [])
          .map(
            (obj, objIdx) => `
          <div class="card mb-2 border border-secondary-subtle bg-body-tertiary" data-u-idx="${uIdx}" data-obj-idx="${objIdx}">
            <div class="card-body p-2">
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="badge bg-secondary rounded-pill text-nowrap">Objetivo ${objIdx + 1}</span>
                <input type="text" class="form-control form-control-sm fw-semibold input-obj-title bg-body text-body" data-u-idx="${uIdx}" data-obj-idx="${objIdx}" value="${escapeHTML(obj.titulo)}" placeholder="Título del Objetivo">
                <button type="button" class="btn btn-sm btn-link text-danger p-0 px-1 btn-del-obj" data-u-idx="${uIdx}" data-obj-idx="${objIdx}" title="Eliminar Objetivo">
                  <i class="bi bi-x-circle"></i>
                </button>
              </div>

              <div class="indicadores-wrapper ps-3">
                ${(obj.indicadores || [])
                  .map((ind, indIdx) => {
                    const currentClaseNum = claseCounter++
                    return `
                  <div class="d-flex align-items-center gap-2 mb-2 p-2 border border-secondary-subtle rounded bg-body" data-u-idx="${uIdx}" data-obj-idx="${objIdx}" data-ind-idx="${indIdx}">
                    <span class="badge bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle text-nowrap">Clase ${currentClaseNum}</span>
                    <input type="text" class="form-control form-control-sm flex-grow-1 input-ind-title bg-body text-body" data-u-idx="${uIdx}" data-obj-idx="${objIdx}" data-ind-idx="${indIdx}" value="${escapeHTML(ind.titulo)}" placeholder="Indicador evaluable de la clase">

                    <select class="form-select form-select-sm select-prereq bg-body text-body" data-u-idx="${uIdx}" data-obj-idx="${objIdx}" data-ind-idx="${indIdx}" style="max-width: 190px;">
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

                    <button type="button" class="btn btn-sm btn-link text-danger p-0 px-1 btn-del-ind" data-u-idx="${uIdx}" data-obj-idx="${objIdx}" data-ind-idx="${indIdx}">
                      <i class="bi bi-x-circle"></i>
                    </button>
                  </div>
                `
                  })
                  .join('')}
              </div>

              <button type="button" class="btn btn-sm btn-link text-primary p-0 mt-1 btn-add-ind" data-u-idx="${uIdx}" data-obj-idx="${objIdx}">
                <i class="bi bi-plus-short"></i>+ Añadir Indicador
              </button>
            </div>
          </div>
        `,
          )
          .join('')}

        <button type="button" class="btn btn-sm btn-outline-primary mt-1 btn-add-obj" data-u-idx="${uIdx}">
          <i class="bi bi-plus-circle me-1"></i>+ Agregar Objetivo
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
    activeNav.navigate('planificacion-ruta', { parentRoute: 'planificacion-disenador' })
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
    const originalText = btn ? btn.innerHTML : ''
    if (btn) {
      btn.disabled = true
      btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Analizando en GROQ...`
    }
    AppToast.show('Analizando materia, nivel e historial para la Siguiente Unidad...', 'info')

    const claseActual = clases.find((c) => String(c.id) === String(estadoEstructura.claseId))
    const nivelObj = NIVELES_TECNICOS.find((n) => n.id === estadoEstructura.nivelId)
    const instrumentoNombre = claseActual?.nombre || claseActual?.name || 'Música e Instrumento'
    const nivelNombre = nivelObj?.nombre || 'Nivel 1: Básico'

    // Si lo que hay todavía es la muestra demo, la primera unidad real la
    // reemplaza por completo — nunca se apila arriba de datos inventados.
    const eraDataDemo = estadoEstructura.esDataDemo
    const numSiguiente = eraDataDemo ? 1 : estadoEstructura.objetivos.length + 1

    try {
      const nuevaUnidad = await sugerirSiguienteUnidadIA({
        instrumento: instrumentoNombre,
        nivelNombre,
        numeroUnidad: numSiguiente,
        unidadesExistentes: eraDataDemo ? [] : estadoEstructura.objetivos,
      })

      if (nuevaUnidad && nuevaUnidad.titulo) {
        if (eraDataDemo) estadoEstructura.objetivos = []
        estadoEstructura.esDataDemo = false
        const cantInds = nuevaUnidad.indicadores?.length || 0
        // GROQ devuelve indicadores planos por unidad — se envuelven en un
        // único Objetivo General (el maestro puede reorganizarlos/agregar
        // más objetivos después desde el editor).
        estadoEstructura.objetivos.push({
          id: nuevaUnidad.id || `unidad-${Date.now()}`,
          titulo: nuevaUnidad.titulo,
          clasesEstimadas: nuevaUnidad.clasesEstimadas,
          justificacionPedagogica: nuevaUnidad.justificacionPedagogica,
          objetivos: [
            {
              id: `obj-${Date.now()}`,
              titulo: 'Objetivo General (generado por IA)',
              indicadores: nuevaUnidad.indicadores || [],
            },
          ],
        })
        _renderObjetivosFull(container, estadoEstructura, alumnosState)

        const estimacion = nuevaUnidad.clasesEstimadas || cantInds
        AppToast.show(`¡Unidad ${numSiguiente} generada! (${cantInds} Indicadores, ~${estimacion} clases estimadas) ⭐`, 'success')
      }
    } catch (err) {
      AppToast.show(`Error al consultar a GROQ: ${err.message}`, 'error')
    } finally {
      if (btn) {
        btn.disabled = false
        btn.innerHTML = originalText
      }
    }
  })

  container.querySelector('#btn-guardar-plan-full')?.addEventListener('click', async () => {
    if (!estadoEstructura.claseId) {
      AppToast.show('Debes seleccionar una Clase o Agrupación', 'warning')
      return
    }
    if (!estadoEstructura.objetivos || estadoEstructura.objetivos.length === 0) {
      AppToast.show('Agrega al menos una Unidad Didáctica antes de publicar', 'warning')
      return
    }

    const btn = container.querySelector('#btn-guardar-plan-full')
    const originalText = btn?.innerHTML
    if (btn) {
      btn.disabled = true
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Publicando...'
    }

    const nivelId = container.querySelector('#select-nivel-full')?.value || estadoEstructura.nivelId || 'nivel-1'
    const nivelNombre = NIVELES_TECNICOS.find((n) => n.id === nivelId)?.nombre || nivelId
    const claseSel = clases.find((c) => String(c.id) === String(estadoEstructura.claseId))
    const claseNombre = claseSel?.nombre || claseSel?.name || estadoEstructura.claseId

    const payload = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}`,
      nombre: `Plan Curricular · ${claseNombre} · ${nivelNombre}`,
      // El árbol completo de unidades + indicadores serializado como JSON en el campo TEXT `objetivos`
      objetivos: JSON.stringify(estadoEstructura.objetivos),
      contenido: estadoEstructura.objetivos
        .map((unidad) => [
          `[UNIDAD] ${unidad.titulo}`,
          ...(unidad.objetivos || []).flatMap((obj) => [
            `  [OBJETIVO] ${obj.titulo}`,
            ...(obj.indicadores || []).map((ind) => `    • ${ind.titulo}`),
          ]),
        ].join('\n'))
        .join('\n\n'),
      recursos: '',
      evaluacion_metodo: `Frecuencia: ${estadoEstructura.frecuenciaSemanal} clase(s)/semana · ${estadoEstructura.semanasTotales || 24} semanas`,
      clase_id: estadoEstructura.claseId,
    }

    try {
      // Upsert: intentar actualizar si ya existe, crear si no.
      let existente = null
      try {
        const todas = await obtenerPlantillasPlanificacion()
        existente = todas.find((p) => p.id === plantillaId || String(p.clase_id) === String(estadoEstructura.claseId))
      } catch {}

      if (existente) {
        await actualizarPlantillaPlanificacion(existente.id, {
          nombre: payload.nombre,
          objetivos: payload.objetivos,
          contenido: payload.contenido,
          evaluacion_metodo: payload.evaluacion_metodo,
        })
        AppToast.show('Plan Curricular actualizado con éxito ✅', 'success')
      } else {
        await crearPlantillaPlanificacion(payload)
        AppToast.show('Plan Curricular publicado con éxito ⭐', 'success')
      }

      const activeNav = (typeof window !== 'undefined' && window.router) ? window.router : router
      activeNav.navigate('planificacion')
    } catch (err) {
      console.error('[DisenadorCurricularView] Error al publicar plan:', err)
      AppToast.show(`Error al publicar: ${err.message}`, 'error')
    } finally {
      if (btn) {
        btn.disabled = false
        btn.innerHTML = originalText
      }
    }
  })

  container.querySelector('#btn-add-objetivo-full')?.addEventListener('click', () => {
    if (estadoEstructura.esDataDemo) {
      estadoEstructura.objetivos = []
      estadoEstructura.esDataDemo = false
    }
    const count = estadoEstructura.objetivos.length + 1
    estadoEstructura.objetivos.push({
      id: `unidad-${Date.now()}`,
      titulo: `Unidad Didáctica ${count}`,
      objetivos: [
        {
          id: `obj-${Date.now()}`,
          titulo: 'Objetivo General 1',
          indicadores: [
            { id: `ind-${Date.now()}-1`, titulo: 'Contenido Evaluable 1', prerrequisitoId: null },
          ],
        },
      ],
    })
    _renderObjetivosFull(container, estadoEstructura, alumnosState)
  })
}

function _attachEventsObjetivos(container, estadoEstructura, alumnosState) {
  const unidades = estadoEstructura.objetivos

  container.querySelectorAll('.input-unidad-title').forEach((inp) => {
    inp.addEventListener('input', (e) => {
      const uIdx = parseInt(e.target.dataset.uIdx, 10)
      if (unidades[uIdx]) {
        unidades[uIdx].titulo = e.target.value
        _updateSVGFull(container, estadoEstructura, alumnosState)
      }
    })
  })

  container.querySelectorAll('.input-obj-title').forEach((inp) => {
    inp.addEventListener('input', (e) => {
      const uIdx = parseInt(e.target.dataset.uIdx, 10)
      const objIdx = parseInt(e.target.dataset.objIdx, 10)
      if (unidades[uIdx]?.objetivos[objIdx]) {
        unidades[uIdx].objetivos[objIdx].titulo = e.target.value
        _updateSVGFull(container, estadoEstructura, alumnosState)
      }
    })
  })

  container.querySelectorAll('.input-ind-title').forEach((inp) => {
    inp.addEventListener('input', (e) => {
      const uIdx = parseInt(e.target.dataset.uIdx, 10)
      const objIdx = parseInt(e.target.dataset.objIdx, 10)
      const indIdx = parseInt(e.target.dataset.indIdx, 10)
      if (unidades[uIdx]?.objetivos[objIdx]?.indicadores[indIdx]) {
        unidades[uIdx].objetivos[objIdx].indicadores[indIdx].titulo = e.target.value
        _updateSVGFull(container, estadoEstructura, alumnosState)
      }
    })
  })

  container.querySelectorAll('.select-prereq').forEach((sel) => {
    sel.addEventListener('change', (e) => {
      const uIdx = parseInt(e.target.dataset.uIdx, 10)
      const objIdx = parseInt(e.target.dataset.objIdx, 10)
      const indIdx = parseInt(e.target.dataset.indIdx, 10)
      if (unidades[uIdx]?.objetivos[objIdx]?.indicadores[indIdx]) {
        unidades[uIdx].objetivos[objIdx].indicadores[indIdx].prerrequisitoId = e.target.value || null
        _updateSVGFull(container, estadoEstructura, alumnosState)
      }
    })
  })

  container.querySelectorAll('.btn-del-unidad').forEach((btn) => {
    btn.addEventListener('click', () => {
      const uIdx = parseInt(btn.dataset.uIdx, 10)
      unidades.splice(uIdx, 1)
      _renderObjetivosFull(container, estadoEstructura, alumnosState)
    })
  })

  container.querySelectorAll('.btn-add-obj').forEach((btn) => {
    btn.addEventListener('click', () => {
      const uIdx = parseInt(btn.dataset.uIdx, 10)
      if (unidades[uIdx]) {
        if (!Array.isArray(unidades[uIdx].objetivos)) unidades[uIdx].objetivos = []
        const n = unidades[uIdx].objetivos.length + 1
        unidades[uIdx].objetivos.push({
          id: `obj-${Date.now()}`,
          titulo: `Objetivo General ${n}`,
          indicadores: [{ id: `ind-${Date.now()}-1`, titulo: 'Contenido Evaluable 1', prerrequisitoId: null }],
        })
        _renderObjetivosFull(container, estadoEstructura, alumnosState)
      }
    })
  })

  container.querySelectorAll('.btn-del-obj').forEach((btn) => {
    btn.addEventListener('click', () => {
      const uIdx = parseInt(btn.dataset.uIdx, 10)
      const objIdx = parseInt(btn.dataset.objIdx, 10)
      if (unidades[uIdx]?.objetivos) {
        unidades[uIdx].objetivos.splice(objIdx, 1)
        _renderObjetivosFull(container, estadoEstructura, alumnosState)
      }
    })
  })

  container.querySelectorAll('.btn-add-ind').forEach((btn) => {
    btn.addEventListener('click', () => {
      const uIdx = parseInt(btn.dataset.uIdx, 10)
      const objIdx = parseInt(btn.dataset.objIdx, 10)
      const objetivo = unidades[uIdx]?.objetivos[objIdx]
      if (objetivo) {
        const newId = `ind-${Date.now()}`
        objetivo.indicadores.push({
          id: newId,
          titulo: `Contenido Evaluable ${objetivo.indicadores.length + 1}`,
          prerrequisitoId: null,
        })
        _renderObjetivosFull(container, estadoEstructura, alumnosState)
      }
    })
  })

  container.querySelectorAll('.btn-del-ind').forEach((btn) => {
    btn.addEventListener('click', () => {
      const uIdx = parseInt(btn.dataset.uIdx, 10)
      const objIdx = parseInt(btn.dataset.objIdx, 10)
      const indIdx = parseInt(btn.dataset.indIdx, 10)
      if (unidades[uIdx]?.objetivos[objIdx]?.indicadores) {
        unidades[uIdx].objetivos[objIdx].indicadores.splice(indIdx, 1)
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

  // El canvas es una cadena plana de nodos (no dibuja sub-árboles), así que
  // la jerarquía Unidad › Objetivo se muestra como contexto en el título de
  // cada indicador — siempre visible, sin perder de dónde viene cada nodo.
  const nodos = _todosLosIndicadores(estadoEstructura.objetivos).map((ind) => ({
    id: ind.id,
    titulo: `${ind.unidadTitulo} › ${ind.objTitulo} › ${ind.titulo}`,
    estado: ind.prerrequisitoId ? 'en_proceso' : 'logrado',
  }))

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
