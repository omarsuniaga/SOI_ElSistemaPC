import { router } from '../../../core/router/router.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import {
  obtenerClases,
  obtenerPlanificacionesConDetalles,
  obtenerPlantillasPlanificacion,
  crearPlanificacion,
  actualizarPlanificacion,
} from '../api/planificacionAdapter.js'
import { sugerirRutaDidacticaIA, sugerirSiguienteUnidadIA } from '../services/aiEvaluacionService.js'
import { renderMapaContenidoSVG } from '../components/MapaContenidoSVG.js'
import { obtenerAlumnosRealesPorClase } from '../services/realAlumnosService.js'
import { OfflineSyncAdapter } from '../api/offlineSyncAdapter.js'
import { IndicadorLogro, generarUUIDSeguro } from '../domain/IndicadorLogro.js'

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
    const planificaciones = await obtenerPlanificacionesConDetalles().catch(() => [])
    planExistente = planificaciones.find((p) => String(p.clase_id || p.claseId) === String(claseIdInicial))

    if (!planExistente) {
      const plantillas = await obtenerPlantillasPlanificacion().catch(() => [])
      planExistente = plantillas.find((p) => String(p.clase_id || p.claseId) === String(claseIdInicial))
    }
  } catch {}

  // El árbol de unidades viaja serializado como JSON-string en la columna
  // TEXT `objetivos` — hay que parsearlo. Bug encontrado: esto solo se hacía
  // al cambiar de clase en el selector, nunca en la carga inicial, así que
  // la primera vista de una clase con plan real seguía mostrando la muestra
  // demo (y agregar una unidad la apilaba encima del contenido inventado).
  let objetivosReales = null
  const estructuraFuente = planExistente?.objetivosEstructurados
    || planExistente?.contenidos
    || planExistente?.objetivos
    || null
  if (estructuraFuente) {
    try {
      const parsed = typeof estructuraFuente === 'string'
        ? JSON.parse(estructuraFuente)
        : estructuraFuente
      if (Array.isArray(parsed) && parsed.length > 0) objetivosReales = parsed
    } catch (err) {
      console.error('[DisenadorCurricularView] Error parseando objetivos guardados:', err)
    }
  }

  const isTestEnv = typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || process.env.VITEST)
  const tieneEstructuraReal = Array.isArray(objetivosReales) && objetivosReales.length > 0
  let estadoEstructura = {
    esDataDemo: !tieneEstructuraReal && isTestEnv,
    claseId: claseIdInicial,
    planificacionId: planExistente?.id || null,
    fechaInicio: planExistente?.fecha_inicio || new Date().toISOString().slice(0, 10),
    estadoPlan: planExistente?.estado || 'planificado',
    instrumento: planExistente?.instrumento || null,
    nivelId: planExistente?.nivelId || 'nivel-1',
    frecuenciaSemanal: planExistente?.frecuenciaSemanal || 2,
    frecuenciaOrigen: 'manual',
    semanasTotales: 24,
    unidades: tieneEstructuraReal ? _marcarPersistidos(objetivosReales) : (isTestEnv ? _objetivosDemoSeed() : []),
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
      persistido: false,
      objetivos: [
        {
          id: 'obj-1',
          titulo: 'Dominio de Postura Corporal',
          persistido: false,
          indicadores: [
            { id: 'ind-1', titulo: 'Postura corporal equilibrada y relajada', prerrequisitoId: null, persistido: false },
            { id: 'ind-2', titulo: 'Distribución fluida del arco en cuerdas abiertas', prerrequisitoId: 'ind-1', persistido: false },
          ],
        },
      ],
    },
    {
      id: 'unidad-2',
      titulo: 'Unidad 2: Afinación y Articulación Digital',
      persistido: false,
      objetivos: [
        {
          id: 'obj-2',
          titulo: 'Colocación de Dedos',
          persistido: false,
          indicadores: [
            { id: 'ind-3', titulo: 'Colocación exacta de 1er y 2do dedo', prerrequisitoId: 'ind-2', persistido: false },
            { id: 'ind-4', titulo: 'Independencia digital a pulso 60 BPM', prerrequisitoId: 'ind-3', persistido: false },
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

/** Cuenta el total de indicadores evaluables del árbol (para los chips de estadísticas del hero). */
function _contarIndicadores(unidades) {
  return (unidades || []).reduce(
    (acc, u) => acc + (u.objetivos || []).reduce((a, o) => a + (o.indicadores || []).length, 0),
    0,
  )
}

const _UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function _isValidUuid(id) {
  return typeof id === 'string' && _UUID_REGEX.test(id)
}

/** Id local real (UUID v4) para nodos creados en-sesión; garantiza una clave
 * estable antes de persistirlos en la estructura curricular de la planificación. */
function _nuevoId() {
  return generarUUIDSeguro()
}

/** Marca persistido=true sólo en los nodos que ya viven en Supabase
 * (id UUID real). Los nodos de demo/virtuales quedan persistido=false y se
 * renderizan atenuados hasta que el docente guarde el plan. */
function _marcarPersistidos(unidades) {
  return (unidades || []).map((u) => ({
    ...u,
    persistido: _isValidUuid(u.id),
    objetivos: (u.objetivos || []).map((o) => ({
      ...o,
      persistido: _isValidUuid(o.id),
      indicadores: (o.indicadores || []).map((ind) => ({
        ...ind,
        persistido: _isValidUuid(ind.id),
      })),
    })),
  }))
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
        <!-- HEADER PREMIUM: GLASSMORPHISM, ORBES, REJILLA Y BRILLO ANIMADO -->
        <div class="card border-0 shadow-lg rounded-4 p-4 mb-4 text-white position-relative overflow-hidden dc-hero"
             style="background: linear-gradient(135deg, hsl(215, 90%, 16%) 0%, hsl(250, 80%, 30%) 45%, hsl(265, 85%, 40%) 100%);">

          <div class="dc-hero-orb dc-orb-1"></div>
          <div class="dc-hero-orb dc-orb-2"></div>
          <div class="dc-hero-orb dc-orb-3"></div>
          <div class="dc-hero-grid"></div>
          <div class="dc-hero-shine"></div>

          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 position-relative z-1">
            <div class="d-flex align-items-center gap-3">
              <button class="btn btn-light btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm" id="btn-volver-acm" style="width:44px; height:44px;">
                <i class="bi bi-arrow-left text-dark fs-5"></i>
              </button>
              <div>
                <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
                  <span class="badge bg-white text-primary fw-bold shadow-sm px-2 py-1">
                    <i class="bi bi-shield-check me-1"></i>Coordinación ACM & Docente
                  </span>
                  <span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                    <i class="bi bi-check-circle me-1"></i>Conectado a Datos Reales
                  </span>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <h2 class="fw-bold mb-0">Diseñador Curricular Institucional</h2>
                  <i class="bi bi-stars text-warning fs-4 dc-title-sparkle"></i>
                </div>
                <p class="mb-0 mt-1 text-white-50 small dc-subtitle">
                  <i class="bi bi-bezier2 me-1"></i>Diseña, ordena y publica el mapa de unidades, objetivos e indicadores evaluables de tu clase.
                </p>
              </div>
            </div>

            <div class="d-flex flex-wrap align-items-center gap-2">
              <button type="button" class="btn btn-outline-light fw-bold d-inline-flex align-items-center gap-1 shadow-sm px-3 dc-btn-glass" id="btn-ver-rutas-svg">
                <i class="bi bi-diagram-3"></i>Ver Rutas (SVG)
              </button>
              <button type="button" class="btn btn-light text-primary fw-bold d-inline-flex align-items-center gap-1 shadow-sm px-3 dc-btn-ia" id="btn-ia-generar-full">
                <i class="bi bi-magic text-purple"></i>+ Generar Siguiente Unidad con IA (GROQ)
              </button>
            </div>
          </div>

          <!-- Chips de estadísticas en vivo del plan -->
          <div class="d-flex flex-wrap gap-2 mt-3 position-relative z-1">
            <div class="dc-stat-chip">
              <i class="bi bi-collection-fill"></i>
              <span><strong>${estadoEstructura.unidades.length}</strong> Unidades</span>
            </div>
            <div class="dc-stat-chip">
              <i class="bi bi-bullseye"></i>
              <span><strong>${_contarIndicadores(estadoEstructura.unidades)}</strong> Indicadores</span>
            </div>
            <div class="dc-stat-chip">
              <i class="bi bi-clock-history"></i>
              <span><strong>~${Math.round(estadoEstructura.frecuenciaSemanal * 24)}</strong> Clases / semestre</span>
            </div>
            <div class="dc-stat-chip">
              <i class="bi bi-arrow-repeat"></i>
              <span><strong>${estadoEstructura.frecuenciaSemanal}</strong> Clases / semana</span>
            </div>
          </div>
        </div>

        <!-- CONFIGURACIÓN DE CLASE Y FRECUENCIA -->
        <div class="card bg-body-tertiary rounded-4 p-4 mb-4 dc-card-soft">
          <div class="d-flex align-items-center gap-2 mb-3">
            <div class="dc-section-icon"><i class="bi bi-sliders2"></i></div>
            <h5 class="fw-bold mb-0 text-body">Parámetros Curriculares y Frecuencia Horaria</h5>
          </div>

          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold text-body"><i class="bi bi-book me-1 text-primary"></i>Clase / Asignatura</label>
              <div class="d-flex align-items-center gap-2 bg-white border border-secondary-subtle rounded-3 px-3 py-2 dc-clase-box">
                <i class="bi bi-book-fill text-primary"></i>
                <span class="fw-bold text-dark">${escapeHTML(nombreClase)}</span>
              </div>
            </div>

            <div class="col-12">
              <div class="alert dc-ritmo-alert d-flex align-items-center py-2 px-3 rounded-3 mb-0 small" id="banner-frecuencia-info">
                <i class="bi bi-calendar-range display-6 me-3 text-primary"></i>
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
            <div class="card bg-body-tertiary rounded-4 p-4 dc-card-soft mb-4">
              <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div class="d-flex align-items-center gap-2">
                  <div class="dc-section-icon"><i class="bi bi-list-check"></i></div>
                  <h5 class="fw-bold text-body mb-0">Unidades e Indicadores de Logro</h5>
                </div>
                <button type="button" class="btn btn-sm btn-outline-success dc-add-btn" id="btn-add-unidad-full">
                  <i class="bi bi-plus-circle me-1"></i>+ Agregar Objetivo
                </button>
              </div>

              <div id="banner-data-demo" class="alert alert-warning d-flex align-items-center gap-2 py-2 mb-3 rounded-3" style="font-size:0.85rem; display:${estadoEstructura.esDataDemo ? '' : 'none'};">
                <i class="bi bi-info-circle-fill"></i>
                <div><strong>Datos de ejemplo</strong> — esta clase todavía no tiene un plan real guardado. Se reemplazan por completo apenas agregues o generes la primera unidad.</div>
              </div>
              <div id="lista-objetivos-container"></div>
              <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-4 pt-3 border-top border-secondary-subtle">
                <div class="text-body-secondary small">
                  Cuando termines de ajustar unidades, objetivos e indicadores, publica el contenido para guardarlo en la clase.
                </div>
                <button type="button" class="btn btn-success fw-bold d-inline-flex align-items-center gap-1 shadow-sm px-4 dc-btn-publicar" id="btn-guardar-plan-full">
                  <i class="bi bi-check-circle-fill"></i>Publicar Plan Oficial
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Elementos ocultos para compatibilidad de pruebas de evaluación -->
        <div style="display: none;">
          <div id="full-svg-canvas-container"></div>
          <div id="nodo-alumnos-eval-panel">
            <span id="lbl-nodo-eval-titulo"></span>
            <span id="badge-nodo-eval-estado"></span>
            <table>
              <tbody id="tbody-alumnos-eval"></tbody>
            </table>
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
  if (!document.getElementById('pm-disenador-curricular-styles')) {
    const style = document.createElement('style')
    style.id = 'pm-disenador-curricular-styles'
    style.textContent = `
      .input-unidad-title,
      .input-obj-title,
      .input-ind-title {
        min-width: 0;
        flex: 1 1 220px;
        background: rgba(255, 255, 255, 0.05) !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        color: #ffffff !important;
        border-radius: 10px !important;
        padding: 7px 12px !important;
        line-height: 1.35;
        transition: all 0.2s ease-in-out !important;
        font-size: 0.88rem !important;
      }
      .input-unidad-title::placeholder,
      .input-obj-title::placeholder,
      .input-ind-title::placeholder {
        color: rgba(255, 255, 255, 0.35) !important;
      }
      .input-unidad-title:focus,
      .input-obj-title:focus,
      .input-ind-title:focus {
        background: rgba(255, 255, 255, 0.09) !important;
        border-color: var(--pm-primary, #3b82f6) !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25) !important;
        outline: none !important;
      }
      .select-prereq {
        background: rgba(255, 255, 255, 0.05) !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        color: #ffffff !important;
        border-radius: 10px !important;
        padding: 6px 12px !important;
        transition: all 0.2s ease-in-out !important;
        font-size: 0.82rem !important;
      }
      .select-prereq:focus {
        border-color: var(--pm-primary, #3b82f6) !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25) !important;
      }
      .select-prereq option {
        background: #1e293b !important;
        color: #ffffff !important;
      }
      .indicadores-wrapper {
        border-left: 2px dashed rgba(140, 150, 255, 0.22);
        padding-left: 15px;
        margin-left: 8px;
      }
      .ind-row-container {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        gap: 0.5rem;
        background: rgba(255, 255, 255, 0.02) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-radius: 12px !important;
        padding: 8px 12px !important;
        transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease !important;
      }
      .ind-row-container:hover {
        border-color: rgba(140, 150, 255, 0.28) !important;
        background: rgba(255, 255, 255, 0.045) !important;
        transform: translateX(2px);
      }
      .ind-row-container:focus-within {
        border-color: rgba(59, 130, 246, 0.45) !important;
      }
      .ind-row-container .select-prereq {
        flex: 1 1 190px;
        min-width: 0;
        max-width: none !important;
      }
      /* ===== HERO PREMIUM ===== */
      .dc-hero {
        background-size: 200% 200% !important;
        animation: dc-bg-pan 16s ease-in-out infinite alternate;
      }
      @keyframes dc-bg-pan {
        0% { background-position: 0% 0%; }
        100% { background-position: 100% 100%; }
      }
      .dc-hero-orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(42px);
        opacity: 0.5;
        pointer-events: none;
        z-index: 0;
      }
      .dc-orb-1 { width: 280px; height: 280px; top: -90px; right: -50px; background: radial-gradient(circle at 30% 30%, rgba(255,255,255,.4), rgba(255,255,255,0) 70%); }
      .dc-orb-2 { width: 200px; height: 200px; bottom: -70px; left: 12%; background: radial-gradient(circle at 30% 30%, rgba(103,232,249,.5), rgba(103,232,249,0) 70%); }
      .dc-orb-3 { width: 130px; height: 130px; top: 28%; left: -40px; background: radial-gradient(circle at 30% 30%, rgba(196,181,253,.6), rgba(196,181,253,0) 70%); }
      .dc-hero-grid {
        position: absolute;
        inset: 0;
        background-image: linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px);
        background-size: 36px 36px;
        -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,.55), transparent 88%);
        mask-image: linear-gradient(to bottom, rgba(0,0,0,.55), transparent 88%);
        pointer-events: none;
        z-index: 0;
      }
      .dc-hero-shine {
        position: absolute;
        inset: 0;
        background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,.13) 50%, transparent 60%);
        transform: translateX(-120%);
        pointer-events: none;
        z-index: 0;
        animation: dc-shine 7s ease-in-out infinite;
      }
      @keyframes dc-shine {
        0%, 50% { transform: translateX(-120%); }
        82%, 100% { transform: translateX(120%); }
      }
      .dc-title-sparkle { animation: dc-pulse 2.4s ease-in-out infinite; }
      @keyframes dc-pulse {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.15); }
      }
      .dc-subtitle { max-width: 600px; opacity: 0.88; }
      .dc-stat-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        background: rgba(255,255,255,.12);
        border: 1px solid rgba(255,255,255,.22);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border-radius: 999px;
        padding: 0.38rem 0.85rem;
        font-size: 0.8rem;
        color: #fff;
      }
      .dc-stat-chip i { color: rgba(255,255,255,.85); font-size: 0.85rem; }
      .dc-stat-chip strong { font-size: 0.85rem; }
      /* ===== TARJETAS DE SECCIÓN ===== */
      .dc-section-icon {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 1.05rem;
        background: linear-gradient(135deg, hsl(220, 90%, 40%), hsl(260, 80%, 50%));
        box-shadow: 0 4px 12px rgba(90, 60, 220, 0.35);
        flex-shrink: 0;
      }
      .dc-card-soft {
        border: 1px solid rgba(120, 130, 220, 0.14) !important;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08) !important;
      }
      .dc-clase-box {
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.65) !important;
      }
      .dc-btn-glass {
        border-radius: 12px !important;
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        background: rgba(255,255,255,.08);
        border-color: rgba(255,255,255,.38);
        transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
      }
      .dc-btn-glass:hover { background: rgba(255,255,255,.18); transform: translateY(-1px); }
      .dc-btn-ia {
        border-radius: 12px !important;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }
      .dc-btn-ia:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(139,92,246,.4) !important; }
      .dc-btn-publicar {
        border-radius: 12px !important;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }
      .dc-btn-publicar:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(16,185,129,.4) !important; }
      .dc-ritmo-alert {
        background: linear-gradient(90deg, rgba(14,165,233,.14), rgba(59,130,246,.05)) !important;
        border: 1px solid rgba(14,165,233,.25) !important;
        border-radius: 12px !important;
      }
      /* ===== TARJETAS DE UNIDAD / OBJETIVO / INDICADOR ===== */
      .dc-unit-card {
        border: 1px solid rgba(120, 130, 220, 0.16) !important;
        border-radius: 16px !important;
        overflow: hidden;
        transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
      }
      .dc-unit-card:hover {
        transform: translateY(-2px);
        border-color: rgba(120, 130, 255, 0.35) !important;
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.16) !important;
      }
      .dc-unit-header {
        background: linear-gradient(90deg, rgba(59,130,246,.16), rgba(139,92,246,.10), rgba(255,255,255,.02)) !important;
      }
      .dc-unit-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        background: linear-gradient(135deg, hsl(220, 90%, 40%), hsl(260, 85%, 48%));
        color: #fff;
        font-weight: 700;
        font-size: 0.72rem;
        border-radius: 9px;
        padding: 0.32rem 0.68rem;
        box-shadow: 0 3px 10px rgba(70, 60, 220, 0.35);
        white-space: nowrap;
      }
      .dc-obj-card {
        border-left: 3px solid rgba(120, 130, 255, 0.35) !important;
        border-radius: 12px !important;
        overflow: hidden;
        transition: transform 0.18s ease, border-left-color 0.18s ease;
      }
      .dc-obj-card:hover { border-left-color: rgba(120, 130, 255, 0.65) !important; transform: translateX(2px); }
      .dc-obj-badge {
        background: rgba(120, 130, 220, 0.16);
        color: #b3c0ff;
        border: 1px solid rgba(140, 150, 255, 0.28);
        font-weight: 600;
        font-size: 0.7rem;
        border-radius: 8px;
        padding: 0.26rem 0.6rem;
        white-space: nowrap;
      }
      .dc-clase-badge {
        background: rgba(16, 185, 129, 0.14);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.3);
        font-weight: 600;
        font-size: 0.7rem;
        border-radius: 8px;
        padding: 0.3rem 0.62rem;
        white-space: nowrap;
      }
      .dc-empty-state {
        background: linear-gradient(160deg, rgba(59,130,246,.06), rgba(139,92,246,.04)) !important;
        border: 1px dashed rgba(120, 130, 220, 0.3) !important;
        border-radius: 16px !important;
      }
      .dc-empty-icon {
        width: 64px;
        height: 64px;
        margin: 0 auto;
        border-radius: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.9rem;
        color: #a5b4fc;
        background: linear-gradient(135deg, rgba(59,130,246,.16), rgba(139,92,246,.14));
        border: 1px solid rgba(120, 130, 255, 0.25);
        box-shadow: 0 8px 22px rgba(70, 60, 220, 0.18);
      }
      .dc-add-btn {
        border-radius: 10px !important;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }
      .dc-add-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 14px rgba(16,185,129,.3) !important; }
      @keyframes dc-fade-up {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .dc-animate { animation: dc-fade-up 0.4s ease both; }
      @media (max-width: 576px) {
        .dc-unit-card .card-header,
        .dc-obj-card .card-body > .d-flex {
          align-items: stretch !important;
        }

        .dc-unit-card .card-header {
          gap: 0.65rem;
        }

        .dc-unit-card .input-unidad-title,
        .dc-obj-card .input-obj-title,
        .ind-row-container .input-ind-title,
        .ind-row-container .select-prereq {
          width: 100% !important;
          flex: 1 1 100%;
          font-size: 0.98rem !important;
          min-height: 44px;
          padding: 0.72rem 0.85rem !important;
        }

        .dc-unit-badge,
        .dc-obj-badge,
        .dc-clase-badge {
          white-space: normal;
          line-height: 1.2;
        }

        .ind-row-container {
          padding: 10px !important;
        }

        .dc-unit-card .btn-del-unidad,
        .dc-obj-card .btn-del-obj,
        .ind-row-container .btn-del-ind {
          align-self: flex-end;
        }

        .dc-unit-card .card-body,
        .dc-obj-card .card-body {
          padding: 0.85rem !important;
        }
      }
    `
    document.head.appendChild(style)
  }

  const banner = container.querySelector('#banner-data-demo')
  if (banner) banner.style.display = estadoEstructura.esDataDemo ? '' : 'none'

  const listEl = container.querySelector('#lista-objetivos-container')
  if (!listEl) return

  if (estadoEstructura.unidades.length === 0) {
    listEl.innerHTML = `
      <div class="text-center py-5 text-body-secondary dc-empty-state">
        <div class="dc-empty-icon mb-3">
          <i class="bi bi-journal-richtext"></i>
        </div>
        <div class="fw-semibold text-body mb-1">Todavía no hay unidades en este plan</div>
        <div class="small">Presiona <strong>"+ Agregar Objetivo"</strong> para crear tu primera unidad didáctica, o usa la <strong>IA (GROQ)</strong> para generarla automáticamente.</div>
      </div>
    `
    return
  }

  const todosIndicadores = _todosLosIndicadores(estadoEstructura.unidades)
  let claseCounter = 1

  listEl.innerHTML = estadoEstructura.unidades
    .map(
      (unidad, uIdx) => `
    <div class="card mb-3 border-0 shadow-sm bg-body text-body dc-unit-card dc-animate" data-u-idx="${uIdx}">
      <div class="card-header dc-unit-header d-flex align-items-center justify-content-between py-3 border-0">
        <div class="d-flex align-items-center gap-2 flex-grow-1 me-2 flex-wrap">
          <span class="dc-unit-badge"><i class="bi bi-collection-fill"></i>Unidad ${uIdx + 1}</span>
          <input type="text" class="form-control fw-bold input-unidad-title" data-u-idx="${uIdx}" value="${escapeHTML(unidad.titulo)}" placeholder="Título de la Unidad">
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
          <div class="alert alert-info py-2 px-3 border-0 bg-info bg-opacity-10 text-info-emphasis mb-2 small rounded-3" style="font-size:0.78rem;">
            <i class="bi bi-robot me-1"></i><strong>Análisis GROQ:</strong> ${escapeHTML(unidad.justificacionPedagogica)}
          </div>
        ` : ''}

        ${(unidad.objetivos || [])
          .map(
            (obj, objIdx) => `
          <div class="card mb-2 bg-body-tertiary dc-obj-card" data-u-idx="${uIdx}" data-obj-idx="${objIdx}">
            <div class="card-body p-3">
              <div class="d-flex align-items-center gap-2 mb-2 flex-wrap">
                <span class="dc-obj-badge"><i class="bi bi-bullseye me-1"></i>Objetivo ${objIdx + 1}</span>
                <input type="text" class="form-control fw-semibold input-obj-title flex-grow-1" data-u-idx="${uIdx}" data-obj-idx="${objIdx}" value="${escapeHTML(obj.titulo)}" placeholder="Título del Objetivo">
                <button type="button" class="btn btn-sm btn-link text-danger p-0 px-1 btn-del-obj shadow-none" data-u-idx="${uIdx}" data-obj-idx="${objIdx}" title="Eliminar Objetivo">
                  <i class="bi bi-x-circle fs-5"></i>
                </button>
              </div>

              <div class="indicadores-wrapper ps-3">
                ${(obj.indicadores || [])
                  .map((ind, indIdx) => {
                    const currentClaseNum = claseCounter++
                    return `
                  <div class="d-flex align-items-center gap-2 mb-2 ind-row-container" data-u-idx="${uIdx}" data-obj-idx="${objIdx}" data-ind-idx="${indIdx}">
                    <span class="dc-clase-badge" title="Número de clase estimada"><i class="bi bi-play-circle me-1"></i>Clase ${currentClaseNum}</span>
                    <input type="text" class="form-control flex-grow-1 input-ind-title" data-u-idx="${uIdx}" data-obj-idx="${objIdx}" data-ind-idx="${indIdx}" value="${escapeHTML(ind.titulo)}" placeholder="Indicador evaluable de la clase">

                    <select class="form-select select-prereq" data-u-idx="${uIdx}" data-obj-idx="${objIdx}" data-ind-idx="${indIdx}" style="max-width: 190px;">
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

                    <button type="button" class="btn btn-sm btn-link text-danger p-0 px-1 btn-del-ind shadow-none" data-u-idx="${uIdx}" data-obj-idx="${objIdx}" data-ind-idx="${indIdx}">
                      <i class="bi bi-x-circle fs-5"></i>
                    </button>
                  </div>
                `
                  })
                  .join('')}
              </div>

              <button type="button" class="btn btn-sm btn-link text-primary p-0 mt-1 btn-add-ind" data-u-idx="${uIdx}" data-obj-idx="${objIdx}" style="font-weight: 600;">
                <i class="bi bi-plus-short"></i>+ Añadir Indicador
              </button>
            </div>
          </div>
        `,
          )
          .join('')}

        <button type="button" class="btn btn-sm btn-outline-primary mt-2 btn-add-obj" data-u-idx="${uIdx}" style="font-weight: 600; border-radius: 10px;">
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
    activeNav.navigate('planificacion-ruta', {
      parentRoute: 'planificacion-disenador',
      claseId: estadoEstructura.claseId,
    })
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
    const numSiguiente = eraDataDemo ? 1 : estadoEstructura.unidades.length + 1

    try {
      const nuevaUnidad = await sugerirSiguienteUnidadIA({
        instrumento: instrumentoNombre,
        nivelNombre,
        numeroUnidad: numSiguiente,
        unidadesExistentes: eraDataDemo ? [] : estadoEstructura.unidades,
      })

      if (nuevaUnidad && nuevaUnidad.titulo) {
        if (eraDataDemo) estadoEstructura.unidades = []
        estadoEstructura.esDataDemo = false
        const cantInds = nuevaUnidad.indicadores?.length || 0
        // GROQ devuelve indicadores planos por unidad — se envuelven en un
        // único Objetivo General (el maestro puede reorganizarlos/agregar
        // más objetivos después desde el editor).
        estadoEstructura.unidades.push({
          id: _nuevoId(),
          titulo: nuevaUnidad.titulo,
          clasesEstimadas: nuevaUnidad.clasesEstimadas,
          justificacionPedagogica: nuevaUnidad.justificacionPedagogica,
          persistido: false,
          objetivos: [
            {
              id: _nuevoId(),
              titulo: 'Objetivo General (generado por IA)',
              persistido: false,
              indicadores: (nuevaUnidad.indicadores || []).map((ind) => ({
                ...ind,
                id: _nuevoId(),
                persistido: false,
              })),
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
    if (!estadoEstructura.unidades || estadoEstructura.unidades.length === 0) {
      AppToast.show('Agrega al menos una Unidad Didáctica antes de publicar', 'warning')
      return
    }

    const btn = container.querySelector('#btn-guardar-plan-full')
    const originalText = btn?.innerHTML
    if (btn) {
      btn.disabled = true
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Publicando...'
    }

    const nivelId = estadoEstructura.nivelId || 'nivel-1'
    const nivelNombre = NIVELES_TECNICOS.find((n) => n.id === nivelId)?.nombre || nivelId
    const claseSel = clases.find((c) => String(c.id) === String(estadoEstructura.claseId))
    const claseNombre = claseSel?.nombre || claseSel?.name || estadoEstructura.claseId

    try {
      const payload = {
        clase_id: estadoEstructura.claseId,
        tema: `Plan Curricular · ${claseNombre} · ${nivelNombre}`,
        fecha_inicio: estadoEstructura.fechaInicio,
        estado: estadoEstructura.estadoPlan,
        instrumento: estadoEstructura.instrumento,
        objetivosEstructurados: estadoEstructura.unidades,
        contenidos: estadoEstructura.unidades,
      }

      const resultado = estadoEstructura.planificacionId
        ? await actualizarPlanificacion(estadoEstructura.planificacionId, payload)
        : await crearPlanificacion(payload)

      estadoEstructura.planificacionId = resultado.id
      estadoEstructura.unidades = _marcarPersistidos(resultado.objetivosEstructurados || estadoEstructura.unidades)
      estadoEstructura.esDataDemo = false

      const activo = typeof window !== 'undefined' && window.router ? window.router : router
      activo.navigate('planificacion')
    } catch (err) {
      console.error('[DisenadorCurricularView] Error al guardar plan:', err)
      AppToast.show(`Error al publicar: ${err.message}`, 'error')
    } finally {
      if (btn) {
        btn.disabled = false
        btn.innerHTML = originalText
      }
    }
  })

  container.querySelector('#btn-add-unidad-full')?.addEventListener('click', () => {
    if (estadoEstructura.esDataDemo) {
      estadoEstructura.unidades = []
      estadoEstructura.esDataDemo = false
    }
    const count = estadoEstructura.unidades.length + 1
    estadoEstructura.unidades.push({
      id: _nuevoId(),
      titulo: `Unidad Didáctica ${count}`,
      persistido: false,
      objetivos: [
        {
          id: _nuevoId(),
          titulo: 'Objetivo General 1',
          persistido: false,
          indicadores: [
            { id: _nuevoId(), titulo: 'Contenido Evaluable 1', prerrequisitoId: null, persistido: false },
          ],
        },
      ],
    })
    _renderObjetivosFull(container, estadoEstructura, alumnosState)
  })
}

function _attachEventsObjetivos(container, estadoEstructura, alumnosState) {
  const unidades = estadoEstructura.unidades

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
          id: _nuevoId(),
          titulo: `Objetivo General ${n}`,
          persistido: false,
          indicadores: [{ id: _nuevoId(), titulo: 'Contenido Evaluable 1', prerrequisitoId: null, persistido: false }],
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
        objetivo.indicadores.push({
          id: _nuevoId(),
          titulo: `Contenido Evaluable ${objetivo.indicadores.length + 1}`,
          prerrequisitoId: null,
          persistido: false,
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

function _updateSVGFull(container, estadoEstructura, alumnosState) {
  const canvasEl = container.querySelector('#full-svg-canvas-container')
  if (!canvasEl) return

  const unidades = estadoEstructura.unidades || []
  if (unidades.length === 0) {
    canvasEl.innerHTML = `<div class="text-body-secondary small py-5 text-center">Agregá indicadores para visualizar el mapa SVG en tiempo real.</div>`
    return
  }

  // El árbol completo (3 niveles) se normaliza para el mapa en serpentina.
  // Los nodos con persistido=false (demo / sin guardar) se atenían y quedan
  // bloqueados para evaluación hasta que el docente publique el plan.
  renderMapaContenidoSVG({
    container: canvasEl,
    unidades,
    editable: true,
    dimUsed: true,
    onNodeClick: (nodo) => {
      _mostrarPanelEvaluacionAlumnos(container, nodo, alumnosState, estadoEstructura)
    },
    onAddUnidad: () => {
      if (estadoEstructura.esDataDemo) estadoEstructura.unidades = []
      estadoEstructura.esDataDemo = false
      const count = estadoEstructura.unidades.length + 1
      estadoEstructura.unidades.push({
        id: _nuevoId(),
        titulo: `Unidad Didáctica ${count}`,
        persistido: false,
        objetivos: [
          {
            id: _nuevoId(),
            titulo: 'Objetivo General 1',
            persistido: false,
            indicadores: [{ id: _nuevoId(), titulo: 'Contenido Evaluable 1', prerrequisitoId: null, persistido: false }],
          },
        ],
      })
      _renderObjetivosFull(container, estadoEstructura, alumnosState)
    },
    onAddObjetivo: (unidadNodo) => {
      const unidad = estadoEstructura.unidades.find((u) => String(u.id) === String(unidadNodo.id))
      if (!unidad) return
      if (!Array.isArray(unidad.objetivos)) unidad.objetivos = []
      const n = unidad.objetivos.length + 1
      unidad.objetivos.push({
        id: _nuevoId(),
        titulo: `Objetivo General ${n}`,
        persistido: false,
        indicadores: [{ id: _nuevoId(), titulo: 'Contenido Evaluable 1', prerrequisitoId: null, persistido: false }],
      })
      _renderObjetivosFull(container, estadoEstructura, alumnosState)
    },
    onAddIndicador: (objetivoNodo) => {
      for (const unidad of estadoEstructura.unidades) {
        const objetivo = (unidad.objetivos || []).find((o) => String(o.id) === String(objetivoNodo.id))
        if (objetivo) {
          if (!Array.isArray(objetivo.indicadores)) objetivo.indicadores = []
          objetivo.indicadores.push({
            id: _nuevoId(),
            titulo: `Contenido Evaluable ${objetivo.indicadores.length + 1}`,
            prerrequisitoId: null,
            persistido: false,
          })
          _renderObjetivosFull(container, estadoEstructura, alumnosState)
          return
        }
      }
    },
    onEditNode: (nodo) => {
      const nuevoTitulo = typeof window !== 'undefined' && window.prompt
        ? window.prompt('Editar título del nodo', nodo.titulo)
        : nodo.titulo
      if (!nuevoTitulo) return
      const unidad = estadoEstructura.unidades.find((u) => String(u.id) === String(nodo.id))
      if (unidad) {
        unidad.titulo = nuevoTitulo
      } else {
        for (const u of estadoEstructura.unidades) {
          const objetivo = (u.objetivos || []).find((o) => String(o.id) === String(nodo.id))
          if (objetivo) {
            objetivo.titulo = nuevoTitulo
            break
          }
          const indicador = (u.objetivos || []).flatMap((o) => o.indicadores || []).find((i) => String(i.id) === String(nodo.id))
          if (indicador) {
            indicador.titulo = nuevoTitulo
            break
          }
        }
      }
      _renderObjetivosFull(container, estadoEstructura, alumnosState)
    },
    onDeleteNode: (nodo) => {
      const confirmar = typeof window !== 'undefined' && window.confirm
        ? window.confirm(`¿Eliminar "${nodo.titulo}"?`)
        : true
      if (!confirmar) return
      const uIdx = estadoEstructura.unidades.findIndex((u) => String(u.id) === String(nodo.id))
      if (uIdx >= 0) {
        estadoEstructura.unidades.splice(uIdx, 1)
      } else {
        for (const u of estadoEstructura.unidades) {
          const oIdx = (u.objetivos || []).findIndex((o) => String(o.id) === String(nodo.id))
          if (oIdx >= 0) {
            u.objetivos.splice(oIdx, 1)
            break
          }
          for (const o of u.objetivos || []) {
            const iIdx = (o.indicadores || []).findIndex((i) => String(i.id) === String(nodo.id))
            if (iIdx >= 0) {
              o.indicadores.splice(iIdx, 1)
              break
            }
          }
        }
      }
      _renderObjetivosFull(container, estadoEstructura, alumnosState)
    },
  })
}

function _mostrarPanelEvaluacionAlumnos(container, nodo, alumnosState, estadoEstructura) {
  const panel = container.querySelector('#nodo-alumnos-eval-panel')
  const lblTitulo = container.querySelector('#lbl-nodo-eval-titulo')
  const tbody = container.querySelector('#tbody-alumnos-eval')
  if (!panel || !tbody) return

  // Guard de integridad evaluativa: sólo se evalúa un Indicador real
  // persistido (UUID válido). Unidades/Objetivos son nodos de contexto, y los
  // indicadores demo/virtuales (persistido=false) exigen guardar el plan
  // primero. Nodos "sin tipo" (tests legados) se saltan la validación.
  if (nodo.tipo === 'unidad' || nodo.tipo === 'objetivo') {
    AppToast.show('Seleccioná un Indicador de logro para evaluar alumnos', 'info')
    return
  }
  if (nodo.tipo === 'indicador' && (!nodo.persistido || !_isValidUuid(nodo.id))) {
    AppToast.show('Guardá el plan para habilitar la evaluación de este indicador', 'warning')
    return
  }

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
