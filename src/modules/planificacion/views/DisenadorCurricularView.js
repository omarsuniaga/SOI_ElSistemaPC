import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { obtenerClases } from '../api/planificacionAdapter.js'
import { sugerirRutaDidacticaIA } from '../services/aiEvaluacionService.js'
import {
  obtenerNivelesAsignadosClase,
  clonarCatalogoAClase,
  obtenerObjetivosPorClase,
  crearObjetivo,
  crearIndicador,
} from '../services/mapaClaseService.js'

/**
 * Vista de Pantalla Completa: Diseñador Curricular Institucional
 *
 * Tarea 3.6 (openspec/changes/mapa-gamificado-planificacion): deja de
 * serializar hacia `planificaciones` el árbol de objetivos/indicadores en
 * memoria y el campo fantasma que marcaba un plan como plantilla oficial
 * institucional — ninguno de los dos existía como columna real; el payload
 * se descartaba en silencio (Decisión 6 de design.md) y las "semillas" que
 * este componente mantenía en memoria nunca se persistían (Migration/Rollout
 * §2 de design.md: "las semillas viven solo en el estado en memoria... se
 * elimina con la reescritura del componente"). No queda ninguna referencia
 * a esos dos campos en este archivo — se verifica con un guard estructural
 * (mismo patrón que Decisión 7 / REQ-12).
 *
 * Pasa a ser el punto de entrada de **"Clonar desde plantilla"** (REQ-10):
 * el maestro elige una clase + una plantilla semilla curada por ACM
 * (`mapa_plantillas`, Tarea 1.5) y el RPC `clonar_plantilla_a_clase`
 * (`mapaClaseService.clonarPlantillaAClase`, Tarea 2.2) copia sus
 * objetivos/indicadores a `clase_mapa_objetivos`/`clase_mapa_indicadores`
 * — propiedad de la clase, nunca del catálogo global (REQ-14).
 *
 * Conserva `sugerirRutaDidacticaIA` (GROQ): "Generar con IA" migró al mismo
 * flujo de plantillas — ahora persiste directamente en el árbol de la
 * clase vía `crearObjetivo`/`crearIndicador` en lugar de quedar como una
 * maqueta en memoria que nunca se guardaba.
 */
export async function renderDisenadorCurricularView(container) {
  if (!container) return

  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center py-5" style="min-height: 450px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;" role="status"></div>
        <h5 class="fw-bold text-body">Cargando Diseñador Curricular Institucional...</h5>
        <p class="text-body-secondary small">Cargando catálogo de clases</p>
      </div>
    </div>
  `

  let clases = []
  try {
    clases = await obtenerClases()
  } catch (err) {
    console.error('[DisenadorCurricularView] Error cargando clases:', err)
  }

  const state = {
    claseId: clases[0]?.id || '',
    niveles: [],
    nivelIdClonar: '',
    nivelIdIA: '',
  }

  await _cargarDependenciasClase(state)
  _renderUI(container, clases, state)
}

async function _cargarDependenciasClase(state) {
  if (!state.claseId) {
    state.niveles = []
    state.nivelIdClonar = ''
    state.nivelIdIA = ''
    return
  }

  try {
    state.niveles = await obtenerNivelesAsignadosClase(state.claseId)
  } catch (err) {
    console.error('[DisenadorCurricularView] Error cargando niveles del catálogo:', err)
    state.niveles = []
  }

  state.nivelIdClonar = state.niveles[0]?.id || ''
  state.nivelIdIA = state.niveles[0]?.id || ''
}

/** Próximo orden_objetivo libre para (claseId, nivelId) — mismo criterio que el RPC clonar_catalogo_a_clase. */
async function _siguienteOrdenObjetivo(claseId, nivelId) {
  const existentes = await obtenerObjetivosPorClase(claseId)
  const delNivel = existentes.filter((o) => o.level_id === nivelId)
  return delNivel.reduce((max, o) => Math.max(max, o.orden_objetivo || 0), 0) + 1
}

function _renderUI(container, clases, state) {
  const sinNiveles = Boolean(state.claseId) && state.niveles.length === 0
  const bloqueado = !state.claseId || sinNiveles

  container.innerHTML = `
    <div class="container-fluid px-4 py-4">
      <!-- HEADER -->
      <div class="card border-0 shadow-lg rounded-4 p-4 mb-4 text-white position-relative overflow-hidden"
           style="background: linear-gradient(135deg, hsl(210, 80%, 18%), hsl(240, 75%, 26%), hsl(220, 90%, 36%));">
        <div class="d-flex flex-wrap align-items-center gap-3 position-relative z-1">
          <button class="btn btn-light btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm" id="btn-volver-acm" style="width:42px; height:42px;">
            <i class="bi bi-arrow-left text-dark fs-5"></i>
          </button>
          <div>
            <span class="badge bg-white text-primary fw-bold shadow-sm px-2 py-1 mb-1 d-inline-block">
              <i class="bi bi-shield-check me-1"></i>Coordinación ACM &amp; Docente
            </span>
            <h2 class="fw-bold mb-0 text-white">Diseñador Curricular Institucional</h2>
          </div>
          <button class="btn btn-light btn-sm ms-auto" id="btn-ir-catalogo">
            <i class="bi bi-collection me-1"></i>Gestionar catálogo
          </button>
        </div>
      </div>

      <!-- CLASE -->
      <div class="card border border-secondary-subtle bg-body-tertiary rounded-4 p-4 mb-4 shadow-sm">
        <h5 class="fw-bold mb-3 text-body"><i class="bi bi-mortarboard me-2 text-primary"></i>Clase</h5>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label fw-semibold text-body">Clase / Agrupación <span class="text-danger">*</span></label>
            <select class="form-select border-secondary-subtle" id="select-clase-disenador">
              <option value="">-- Seleccionar Clase --</option>
              ${clases
                .map(
                  (c) => `
                <option value="${c.id}" ${c.id === state.claseId ? 'selected' : ''}>
                  ${escapeHTML(c.nombre || c.name || `Clase ${c.id}`)}
                </option>
              `,
                )
                .join('')}
            </select>
          </div>
        </div>

        ${
          sinNiveles
            ? `
          <div class="alert alert-warning mt-3 mb-0" role="alert">
            <i class="bi bi-exclamation-triangle me-2"></i>Todavía no hay niveles cargados en el catálogo para el instrumento de esta clase.
          </div>
        `
            : ''
        }
      </div>

      <!-- ENTRADAS: CLONAR DESDE CATÁLOGO / GENERAR CON IA -->
      <div class="row g-4">
        <div class="col-lg-6">
          <div class="card border border-secondary-subtle bg-body-tertiary rounded-4 p-4 shadow-sm h-100">
            <h5 class="fw-bold text-body mb-2"><i class="bi bi-copy me-2 text-primary"></i>Clonar desde catálogo</h5>
            <p class="text-body-secondary small mb-3">Copia editable e independiente de un nivel del catálogo institucional.</p>

            <label class="form-label fw-semibold text-body">Nivel</label>
            <select class="form-select border-secondary-subtle mb-3" id="select-nivel-clonar-disenador" ${state.niveles.length === 0 ? 'disabled' : ''}>
              ${
                state.niveles.length === 0
                  ? '<option value="">Sin niveles en el catálogo para esta clase</option>'
                  : state.niveles
                      .map(
                        (n) => `
                    <option value="${n.id}" ${n.id === state.nivelIdClonar ? 'selected' : ''}>
                      ${escapeHTML(n.nombre)}
                    </option>
                  `,
                      )
                      .join('')
              }
            </select>

            <button type="button" class="btn btn-primary" id="btn-clonar-plantilla" ${bloqueado ? 'disabled' : ''}>
              <i class="bi bi-copy me-1"></i>Clonar a esta clase
            </button>
          </div>
        </div>

        <div class="col-lg-6">
          <div class="card border border-secondary-subtle bg-body-tertiary rounded-4 p-4 shadow-sm h-100">
            <h5 class="fw-bold text-body mb-2"><i class="bi bi-magic me-2 text-primary"></i>Generar con IA (GROQ)</h5>
            <p class="text-body-secondary small mb-3">Sugiere objetivos e indicadores y los crea directamente en el mapa de esta clase.</p>

            <label class="form-label fw-semibold text-body">Nivel</label>
            <select class="form-select border-secondary-subtle mb-3" id="select-nivel-ia-disenador" ${state.niveles.length === 0 ? 'disabled' : ''}>
              ${
                state.niveles.length === 0
                  ? '<option value="">Sin niveles asignados</option>'
                  : state.niveles
                      .map((n) => `<option value="${n.id}" ${n.id === state.nivelIdIA ? 'selected' : ''}>${escapeHTML(n.nombre)}</option>`)
                      .join('')
              }
            </select>

            <button type="button" class="btn btn-outline-primary" id="btn-generar-ia" ${bloqueado ? 'disabled' : ''}>
              <i class="bi bi-magic me-1"></i>Generar Mapeo con IA
            </button>
          </div>
        </div>
      </div>
    </div>
  `

  _attachEvents(container, clases, state)
}

function _attachEvents(container, clases, state) {
  container.querySelector('#btn-volver-acm')?.addEventListener('click', () => {
    window.router?.navigate('planificacion-acm')
  })

  container.querySelector('#btn-ir-catalogo')?.addEventListener('click', () => {
    window.router?.navigate('planificacion-catalogo')
  })

  container.querySelector('#select-clase-disenador')?.addEventListener('change', async (e) => {
    state.claseId = e.target.value
    await _cargarDependenciasClase(state)
    _renderUI(container, clases, state)
  })

  container.querySelector('#select-nivel-clonar-disenador')?.addEventListener('change', (e) => {
    state.nivelIdClonar = e.target.value
  })

  container.querySelector('#select-nivel-ia-disenador')?.addEventListener('change', (e) => {
    state.nivelIdIA = e.target.value
  })

  container.querySelector('#btn-clonar-plantilla')?.addEventListener('click', async () => {
    if (!state.claseId || !state.nivelIdClonar) return
    const btn = container.querySelector('#btn-clonar-plantilla')
    btn.disabled = true

    try {
      await clonarCatalogoAClase(state.claseId, state.nivelIdClonar)
      AppToast.show('Nivel del catálogo clonado a la clase con éxito ⭐', 'success')
      window.router?.navigate('planificacion-acm')
    } catch (err) {
      AppToast.show(`Error al clonar el catálogo: ${err.message}`, 'error')
      btn.disabled = false
    }
  })

  container.querySelector('#btn-generar-ia')?.addEventListener('click', async () => {
    if (!state.claseId || !state.nivelIdIA) return
    const btn = container.querySelector('#btn-generar-ia')
    btn.disabled = true
    AppToast.show('Generando estructura curricular con IA (GROQ)...', 'info')

    try {
      const clase = clases.find((c) => String(c.id) === String(state.claseId))
      const nivelIndex = state.niveles.findIndex((n) => n.id === state.nivelIdIA)

      const sugerencias = await sugerirRutaDidacticaIA({
        instrumento: clase?.nombre || clase?.name || 'Música',
        nivelIndex: nivelIndex >= 0 ? nivelIndex : 0,
      })

      let ordenObjetivo = await _siguienteOrdenObjetivo(state.claseId, state.nivelIdIA)
      for (const sug of sugerencias || []) {
        const objetivoCreado = await crearObjetivo({
          clase_id: state.claseId,
          level_id: state.nivelIdIA,
          nombre: sug.titulo || sug.id || 'Objetivo generado por IA',
          orden_objetivo: ordenObjetivo++,
        })

        for (const ind of sug.indicadores || []) {
          await crearIndicador({
            objetivo_id: objetivoCreado.id,
            clase_id: state.claseId,
            descripcion: typeof ind === 'string' ? ind : ind.titulo || ind.id || 'Indicador generado por IA',
          })
        }
      }

      AppToast.show('Estructura generada por IA creada en el mapa de la clase ⭐', 'success')
      window.router?.navigate('planificacion-acm')
    } catch (err) {
      console.error('[DisenadorCurricularView] Error generando con IA:', err)
      AppToast.show(`Error al generar con IA: ${err.message}`, 'error')
      btn.disabled = false
    }
  })
}
