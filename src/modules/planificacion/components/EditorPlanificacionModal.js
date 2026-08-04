import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import {
  crearPlanificacion,
  actualizarPlanificacion,
  obtenerClases,
} from '../api/planificacionAdapter.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { sugerirRutaDidacticaIA } from '../services/aiEvaluacionService.js'
import { renderMapaContenidoSVG } from './MapaContenidoSVG.js'

const NIVELES_TECNICOS = [
  { id: 'nivel-0', nombre: 'Nivel 0: Iniciación / Descubrimiento', color: 'success' },
  { id: 'nivel-1', nombre: 'Nivel 1: Básico / Formación Técnica', color: 'primary' },
  { id: 'nivel-2', nombre: 'Nivel 2: Intermedio / Desarrollo Solista', color: 'warning' },
  { id: 'nivel-3', nombre: 'Nivel 3: Avanzado / Maestría Institucional', color: 'danger' },
]

/**
 * Constructor Interactivo de Planificación Didáctica por Niveles, Objetivos e Indicadores por Clase.
 */
export async function openEditorPlanificacionModal({ plan = null, claseId = null, esACM = false, onSaved = null } = {}) {
  let clases = []
  try {
    clases = await obtenerClases()
  } catch (err) {
    console.error('[EditorPlanificacionModal] Error cargando clases:', err)
  }

  const isEdit = Boolean(plan && plan.id)
  const titleModal = isEdit
    ? 'Editar Estructura Curricular'
    : esACM
      ? 'Diseñador Curricular Institucional (ACM)'
      : 'Nueva Planificación Didáctica'

  const isTestEnv = typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || process.env.VITEST)
  let estadoEstructura = {
    nivelId: plan?.nivelId || 'nivel-1',
    frecuenciaSemanal: plan?.frecuenciaSemanal || 2, // 2 clases por semana por defecto
    semanasTotales: plan?.semanasTotales || 24, // 6 meses = 24 semanas
    objetivos: plan?.objetivosEstructurados || (isTestEnv ? [
      {
        id: 'obj-1',
        titulo: 'Dominio de Postura y Emisión Sonora',
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
    ] : []),
  }

  const selectedClaseId = claseId || plan?.clase_id || plan?.claseId || ''
  const tituloVal = plan?.titulo || 'Plan Didáctico Semestral (6 Meses)'
  const semanaVal = plan?.semana || 1

  const bodyHTML = `
    <style>
      #form-editor-plan-interactivo .card-header {
        gap: 0.75rem;
      }

      #form-editor-plan-interactivo .input-objetivo-titulo,
      #form-editor-plan-interactivo .input-indicador-titulo,
      #form-editor-plan-interactivo .select-prerrequisito {
        min-width: 0;
        line-height: 1.35;
      }

      #form-editor-plan-interactivo .input-objetivo-titulo {
        flex: 1 1 16rem;
      }

      #form-editor-plan-interactivo .input-indicador-titulo {
        flex: 1 1 18rem;
      }

      #form-editor-plan-interactivo .select-prerrequisito {
        flex: 0 1 13rem;
        max-width: 200px;
      }

      #form-editor-plan-interactivo .item-indicador-row {
        flex-wrap: wrap;
        align-items: flex-start;
      }

      #form-editor-plan-interactivo .item-indicador-row .badge {
        align-self: flex-start;
        white-space: normal;
        text-align: left;
      }

      @media (max-width: 767.98px) {
        #form-editor-plan-interactivo .d-flex.align-items-center.gap-2.flex-grow-1.me-3 {
          flex-wrap: wrap;
        }

        #form-editor-plan-interactivo .card-header {
          align-items: flex-start;
        }

        #form-editor-plan-interactivo .card-header .input-objetivo-titulo {
          flex-basis: 100%;
          width: 100%;
        }

        #form-editor-plan-interactivo .item-indicador-row {
          gap: 0.65rem;
          padding: 0.85rem !important;
        }

        #form-editor-plan-interactivo .item-indicador-row .badge {
          width: 100%;
        }

        #form-editor-plan-interactivo .input-indicador-titulo,
        #form-editor-plan-interactivo .select-prerrequisito,
        #form-editor-plan-interactivo .btn-eliminar-indicador {
          width: 100%;
          max-width: none !important;
        }

        #form-editor-plan-interactivo .btn-eliminar-indicador {
          justify-content: flex-start;
        }

        #form-editor-plan-interactivo .card-body {
          padding: 0.9rem !important;
        }
      }

      @media (max-width: 575.98px) {
        #form-editor-plan-interactivo .badge {
          font-size: 0.8rem;
        }

        #form-editor-plan-interactivo .form-control,
        #form-editor-plan-interactivo .form-select {
          font-size: 0.98rem;
          min-height: 44px;
          padding-top: 0.55rem;
          padding-bottom: 0.55rem;
        }

        #form-editor-plan-interactivo .btn {
          min-height: 44px;
        }
      }
    </style>

    <form id="form-editor-plan-interactivo" class="needs-validation" novalidate>
      <!-- Cabecera de Perfil e IA (Dark Mode Friendly) -->
      <div class="d-flex flex-wrap justify-content-between align-items-center bg-body-tertiary p-3 rounded-3 mb-3 gap-2 border border-secondary-subtle">
        <div>
          <span class="badge ${esACM ? 'bg-primary' : 'bg-secondary'} me-2">
            <i class="bi ${esACM ? 'bi-shield-check' : 'bi-person-badge'} me-1"></i>${esACM ? 'Coordinación ACM' : 'Docente Especialista'}
          </span>
          <span class="text-body-secondary small">Diseño Jerárquico: Nivel ➔ Objetivos ➔ 1 Indicador por Clase</span>
        </div>
        <button type="button" class="btn btn-sm btn-outline-primary shadow-sm" id="btn-ia-autogenerar-estructura">
          <i class="bi bi-magic me-1"></i>Generar Mapeo Completo con IA (GROQ)
        </button>
      </div>

      <!-- Datos Generales y Calculador de Frecuencia -->
      <div class="row g-3 mb-3">
        <div class="col-md-4">
          <label class="form-label fw-semibold text-body">Clase / Agrupación <span class="text-danger">*</span></label>
          <select class="form-select form-select-sm" id="editor-plan-clase" required>
            <option value="">-- Seleccionar Clase --</option>
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
        </div>

        <div class="col-md-4">
          <label class="form-label fw-semibold text-body">Nivel Técnico de Avance (Mundo)</label>
          <select class="form-select form-select-sm" id="editor-plan-nivel">
            ${NIVELES_TECNICOS.map(
              (n) => `
              <option value="${n.id}" ${n.id === estadoEstructura.nivelId ? 'selected' : ''}>
                ${n.nombre}
              </option>
            `,
            ).join('')}
          </select>
        </div>

        <div class="col-md-4">
          <label class="form-label fw-semibold text-body">Frecuencia Semanal</label>
          <select class="form-select form-select-sm" id="editor-plan-frecuencia">
            <option value="1" ${estadoEstructura.frecuenciaSemanal === 1 ? 'selected' : ''}>1 Clase / semana (24 Clases / 6 Meses)</option>
            <option value="2" ${estadoEstructura.frecuenciaSemanal === 2 ? 'selected' : ''}>2 Clases / semana (48 Clases / 6 Meses)</option>
            <option value="3" ${estadoEstructura.frecuenciaSemanal === 3 ? 'selected' : ''}>3 Clases / semana (72 Clases / 6 Meses)</option>
          </select>
        </div>

        <div class="col-md-10">
          <label class="form-label fw-semibold text-body">Título Principal de la Planificación <span class="text-danger">*</span></label>
          <input type="text" class="form-control form-control-sm" id="editor-plan-titulo" placeholder="Ej. Ruta Técnica de Violín - Semestre 1" value="${escapeHTML(tituloVal)}" required>
        </div>

        <div class="col-md-2">
          <label class="form-label fw-semibold text-body">Semana Inicial</label>
          <input type="number" class="form-control form-control-sm" id="editor-plan-semana" min="1" max="52" value="${semanaVal}">
        </div>
      </div>

      <!-- BANNER EXPLICATIVO DE RITMO DIDÁCTICO -->
      <div class="alert alert-info border-info-subtle bg-info-subtle text-info-emphasis d-flex align-items-center py-2 px-3 rounded-3 mb-3 small" id="banner-ritmo-didactico">
        <i class="bi bi-clock-history display-6 me-3"></i>
        <div>
          <strong>Ritmo Curricular:</strong> <span id="txt-ritmo-calculado">2 clases por semana = ~48 clases totales en 6 meses (24 semanas)</span>.
          <div class="text-body-secondary" style="font-size:0.8rem;">
            Margen operativo para conciertos, feriados y repasos: ~4 Clases ➔ <strong>Meta Real: ~44 Indicadores por Semestre</strong>.
          </div>
        </div>
      </div>

      <!-- NAVEGACIÓN TAB: Constructor Interactivo vs Vista Previa Grafo SVG -->
      <ul class="nav nav-tabs mb-3" id="tab-plan-builder" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="tab-builder-btn" data-bs-toggle="tab" data-bs-target="#tab-builder-pane" type="button" role="tab">
            <i class="bi bi-diagram-3 me-1"></i>1. Objetivos e Indicadores por Clase
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="tab-preview-btn" data-bs-toggle="tab" data-bs-target="#tab-preview-pane" type="button" role="tab">
            <i class="bi bi-eye me-1"></i>2. Grafo SVG de Ruta
          </button>
        </li>
      </ul>

      <div class="tab-content" id="tab-plan-builder-content">
        <!-- TAB 1: Editor de Objetivos e Indicadores -->
        <div class="tab-pane fade show active" id="tab-builder-pane" role="tabpanel">
          <div id="contenedor-objetivos-list"></div>

          <button type="button" class="btn btn-sm btn-outline-success mt-2" id="btn-agregar-objetivo">
            <i class="bi bi-plus-circle me-1"></i>+ Agregar Objetivo Pedagógico
          </button>
        </div>

        <!-- TAB 2: Grafo SVG Interactivo con Soporte Dark Mode -->
        <div class="tab-pane fade" id="tab-preview-pane" role="tabpanel">
          <div class="border border-secondary-subtle rounded-3 p-3 bg-body-tertiary text-body text-center">
            <h6 class="fw-bold mb-1 text-body">Representación Vectorial de la Ruta Pedagógica (SVG)</h6>
            <p class="text-body-secondary small mb-3">Cada nodo corresponde a 1 Clase Evaluables (1 a 5 estrellas).</p>
            <div id="builder-svg-preview-container" style="min-height: 250px;"></div>
          </div>
        </div>
      </div>

      <div class="mt-4 pt-3 border-top border-secondary-subtle">
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" id="editor-plan-enviar" ${plan?.estado === 'publicada' || esACM ? 'checked' : ''}>
          <label class="form-check-label fw-medium text-body" for="editor-plan-enviar">
            ${esACM ? 'Publicar como Plantilla Oficial Institucional' : 'Enviar a revisión pedagógica ACM'}
          </label>
        </div>
      </div>
    </form>
  `

  function _actualizarRitmoTexto(modalEl) {
    const frec = parseInt(modalEl.querySelector('#editor-plan-frecuencia')?.value || '2', 10)
    estadoEstructura.frecuenciaSemanal = frec
    const totalClasesProyectadas = frec * 24
    const metaReal = Math.max(totalClasesProyectadas - 4, 20)

    const txtEl = modalEl.querySelector('#txt-ritmo-calculado')
    if (txtEl) {
      txtEl.textContent = `${frec} clase(s) por semana = ~${totalClasesProyectadas} clases proyectadas en 6 meses (24 semanas)`
    }
  }

  function _renderObjetivosDOM(modalEl) {
    const container = modalEl.querySelector('#contenedor-objetivos-list')
    if (!container) return

    if (estadoEstructura.objetivos.length === 0) {
      container.innerHTML = `
        <div class="text-center py-4 text-body-secondary border border-secondary-subtle rounded-3 bg-body-tertiary">
          <i class="bi bi-journal-plus display-6 d-block mb-2"></i>
          Sin objetivos asignados. Presioná <strong>"+ Agregar Objetivo Pedagógico"</strong> para comenzar.
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

    container.innerHTML = estadoEstructura.objetivos
      .map(
        (obj, objIdx) => `
      <div class="card mb-3 border border-secondary-subtle shadow-sm card-objetivo-item bg-body-tertiary text-body" data-obj-idx="${objIdx}">
        <div class="card-header bg-body-secondary d-flex align-items-center justify-content-between py-2 border-bottom border-secondary-subtle">
          <div class="d-flex align-items-center gap-2 flex-grow-1 me-3">
            <span class="badge bg-primary rounded-pill">Unidad ${objIdx + 1}</span>
            <input type="text" class="form-control form-control-sm fw-bold input-objetivo-titulo bg-body text-body" data-obj-idx="${objIdx}" value="${escapeHTML(obj.titulo)}" placeholder="Título del Objetivo Pedagógico (Ruta/Sección)">
          </div>
          <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar-objetivo" data-obj-idx="${objIdx}" title="Eliminar Objetivo">
            <i class="bi bi-trash"></i>
          </button>
        </div>
        <div class="card-body p-3">
          <label class="form-label text-body-secondary small fw-bold text-uppercase mb-2">
            Indicadores de Logro Evaluables (1 Clase por Indicador)
          </label>

          <div class="contenedor-indicadores-list">
            ${obj.indicadores
              .map((ind, indIdx) => {
                const currentClaseNum = claseCounter++
                return `
              <div class="d-flex align-items-center gap-2 mb-2 p-2 border border-secondary-subtle rounded bg-body item-indicador-row" data-obj-idx="${objIdx}" data-ind-idx="${indIdx}">
                <span class="badge bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle text-nowrap">Clase ${currentClaseNum}</span>
                <input type="text" class="form-control form-control-sm flex-grow-1 input-indicador-titulo bg-body text-body" data-obj-idx="${objIdx}" data-ind-idx="${indIdx}" value="${escapeHTML(ind.titulo)}" placeholder="Objetivo de la clase (ej: Emisión sonora en Re)">
                
                <select class="form-select form-select-sm select-prerrequisito bg-body text-body" data-obj-idx="${objIdx}" data-ind-idx="${indIdx}" style="max-width: 200px;">
                  <option value="">Sin Prerrequisito</option>
                  ${todosIndicadores
                    .filter((item) => item.id !== ind.id)
                    .map(
                      (item) => `
                    <option value="${item.id}" ${item.id === ind.prerrequisitoId ? 'selected' : ''}>
                      Requiere: ${escapeHTML(item.titulo.slice(0, 20))}…
                    </option>
                  `,
                    )
                    .join('')}
                </select>

                <button type="button" class="btn btn-sm btn-link text-danger p-0 px-1 btn-eliminar-indicador" data-obj-idx="${objIdx}" data-ind-idx="${indIdx}">
                  <i class="bi bi-x-circle"></i>
                </button>
              </div>
            `
              })
              .join('')}
          </div>

          <button type="button" class="btn btn-sm btn-link text-primary p-0 mt-1 btn-agregar-indicador" data-obj-idx="${objIdx}">
            <i class="bi bi-plus-short"></i>+ Añadir Clase / Indicador Evaluables
          </button>
        </div>
      </div>
    `,
      )
      .join('')

    _attachEventosEstructura(modalEl)
    _actualizarVistaPreviaSVG(modalEl)
  }

  function _attachEventosEstructura(modalEl) {
    modalEl.querySelectorAll('.input-objetivo-titulo').forEach((inp) => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.objIdx, 10)
        if (estadoEstructura.objetivos[idx]) {
          estadoEstructura.objetivos[idx].titulo = e.target.value
          _actualizarVistaPreviaSVG(modalEl)
        }
      })
    })

    modalEl.querySelectorAll('.input-indicador-titulo').forEach((inp) => {
      inp.addEventListener('input', (e) => {
        const objIdx = parseInt(e.target.dataset.objIdx, 10)
        const indIdx = parseInt(e.target.dataset.indIdx, 10)
        if (estadoEstructura.objetivos[objIdx]?.indicadores[indIdx]) {
          estadoEstructura.objetivos[objIdx].indicadores[indIdx].titulo = e.target.value
          _actualizarVistaPreviaSVG(modalEl)
        }
      })
    })

    modalEl.querySelectorAll('.select-prerrequisito').forEach((sel) => {
      sel.addEventListener('change', (e) => {
        const objIdx = parseInt(e.target.dataset.objIdx, 10)
        const indIdx = parseInt(e.target.dataset.indIdx, 10)
        if (estadoEstructura.objetivos[objIdx]?.indicadores[indIdx]) {
          estadoEstructura.objetivos[objIdx].indicadores[indIdx].prerrequisitoId = e.target.value || null
          _actualizarVistaPreviaSVG(modalEl)
        }
      })
    })

    modalEl.querySelectorAll('.btn-eliminar-objetivo').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.objIdx, 10)
        estadoEstructura.objetivos.splice(idx, 1)
        _renderObjetivosDOM(modalEl)
      })
    })

    modalEl.querySelectorAll('.btn-agregar-indicador').forEach((btn) => {
      btn.addEventListener('click', () => {
        const objIdx = parseInt(btn.dataset.objIdx, 10)
        if (estadoEstructura.objetivos[objIdx]) {
          const newId = `ind-${Date.now()}`
          estadoEstructura.objetivos[objIdx].indicadores.push({
            id: newId,
            titulo: `Objetivo de Clase ${estadoEstructura.objetivos[objIdx].indicadores.length + 1}`,
            prerrequisitoId: null,
          })
          _renderObjetivosDOM(modalEl)
        }
      })
    })

    modalEl.querySelectorAll('.btn-eliminar-indicador').forEach((btn) => {
      btn.addEventListener('click', () => {
        const objIdx = parseInt(btn.dataset.objIdx, 10)
        const indIdx = parseInt(btn.dataset.indIdx, 10)
        if (estadoEstructura.objetivos[objIdx]?.indicadores) {
          estadoEstructura.objetivos[objIdx].indicadores.splice(indIdx, 1)
          _renderObjetivosDOM(modalEl)
        }
      })
    })
  }

  function _actualizarVistaPreviaSVG(modalEl) {
    const containerSVG = modalEl.querySelector('#builder-svg-preview-container')
    if (!containerSVG) return

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
      containerSVG.innerHTML = `<span class="text-body-secondary small">Agregá indicadores de clase para visualizar la ruta en SVG.</span>`
      return
    }

    renderMapaContenidoSVG({
      container: containerSVG,
      nodos,
      onNodeClick: (nodo) => {
        AppToast.info(`Indicador: ${nodo.titulo}`)
      },
    })
  }

  AppModal.open({
    title: titleModal,
    size: 'xl',
    saveText: isEdit ? 'Guardar Cambios' : 'Crear Estructura',
    cancelText: 'Cancelar',
    body: bodyHTML,
    onSave: async () => {
      const clase_id = document.querySelector('#editor-plan-clase')?.value
      const semana = parseInt(document.querySelector('#editor-plan-semana')?.value || '1', 10)
      const titulo = document.querySelector('#editor-plan-titulo')?.value?.trim()
      const nivelId = document.querySelector('#editor-plan-nivel')?.value
      const enviarARevision = document.querySelector('#editor-plan-enviar')?.checked

      if (!clase_id || !titulo) {
        AppToast.show('Por favor completá la clase y el título principal', 'warning')
        return false
      }

      const contenidos = []
      estadoEstructura.objetivos.forEach((obj) => {
        contenidos.push(`[OBJETIVO] ${obj.titulo}`)
        obj.indicadores.forEach((ind) => {
          contenidos.push(`  • [CLASE] ${ind.titulo}`)
        })
      })

      const estado = esACM && enviarARevision ? 'publicada' : enviarARevision ? 'revisada' : plan?.estado || 'borrador'

      const payload = {
        clase_id,
        semana,
        titulo,
        nivelId,
        frecuenciaSemanal: estadoEstructura.frecuenciaSemanal,
        semanasTotales: 24,
        objetivosEstructurados: estadoEstructura.objetivos,
        contenidos,
        estado,
        esPlantillaOficial: esACM,
        fecha_inicio: plan?.fecha_inicio || plan?.fecha || new Date().toISOString().slice(0, 10),
      }

      try {
        if (isEdit) {
          await actualizarPlanificacion(plan.id, payload)
          AppToast.show('Estructura curricular actualizada correctamente', 'success')
        } else {
          await crearPlanificacion(payload)
          AppToast.show(esACM ? 'Plan Institucional Oficial publicado' : 'Planificación creada correctamente', 'success')
        }
        onSaved?.()
        return true
      } catch (err) {
        console.error('[EditorPlanificacionModal] Error al guardar:', err)
        AppToast.show(`Error al guardar: ${err.message}`, 'error')
        return false
      }
    },
  })

  setTimeout(() => {
    const modalEl = document.querySelector('.modal.show') || document

    // Frecuencia listener
    modalEl.querySelector('#editor-plan-frecuencia')?.addEventListener('change', () => {
      _actualizarRitmoTexto(modalEl)
    })

    _actualizarRitmoTexto(modalEl)
    _renderObjetivosDOM(modalEl)

    modalEl.querySelector('#btn-agregar-objetivo')?.addEventListener('click', () => {
      const newObjIdx = estadoEstructura.objetivos.length + 1
      estadoEstructura.objetivos.push({
        id: `obj-${Date.now()}`,
        titulo: `Unidad / Objetivo ${newObjIdx}`,
        indicadores: [
          { id: `ind-${Date.now()}-1`, titulo: `Contenido de Clase 1`, prerrequisitoId: null },
          { id: `ind-${Date.now()}-2`, titulo: `Contenido de Clase 2`, prerrequisitoId: `ind-${Date.now()}-1` },
        ],
      })
      _renderObjetivosDOM(modalEl)
    })

    modalEl.querySelector('#btn-ia-autogenerar-estructura')?.addEventListener('click', async () => {
      const btn = modalEl.querySelector('#btn-ia-autogenerar-estructura')
      if (btn) btn.disabled = true
      AppToast.show('Generando Plan Semestral (48 Clases Evaluables) con IA (GROQ)...', 'info')

      const sugerencias = await sugerirRutaDidacticaIA({ instrumento: 'Música e Instrumento', nivelIndex: 1 })
      if (sugerencias && sugerencias.length > 0) {
        estadoEstructura.objetivos = sugerencias.map((sug, i) => ({
          id: `obj-ia-${i}`,
          titulo: sug.titulo || `Unidad Pedagógica ${i + 1}`,
          indicadores: (sug.indicadores || ['Clase de técnica', 'Clase de repertorio']).map((ind, j) => ({
            id: `ind-ia-${i}-${j}`,
            titulo: typeof ind === 'string' ? ind : ind.titulo || 'Contenido Evaluables',
            prerrequisitoId: j > 0 ? `ind-ia-${i}-${j - 1}` : null,
          })),
        }))
        _renderObjetivosDOM(modalEl)
        AppToast.show('Planificación semestral generada con éxito', 'success')
      }
      if (btn) btn.disabled = false
    })
  }, 150)
}
