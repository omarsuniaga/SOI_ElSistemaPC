import * as routeAdapter from '../api/routeAdapter.js'
import { obtenerClases } from '../api/planificacionAdapter.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { sugerirEjercicioIndicador } from '../api/groqService.js'
import { buildAcademicIndicatorLabel, mapMasteryStateMeta } from './mapaPedagogicoHelpers.js'
import * as weeklyPlanAdapter from '../api/weeklyPlanAdapter.js'


function safeArray(value) {
  return Array.isArray(value) ? value : []
}

function countHierarchy(levels) {
  let temas = 0
  let objetivos = 0
  let indicadores = 0

  for (const level of safeArray(levels)) {
    const temasLevel = safeArray(level.plan_temas)
    temas += temasLevel.length
    for (const tema of temasLevel) {
      const objetivosTema = safeArray(tema.plan_objetivos)
      objetivos += objetivosTema.length
      for (const objetivo of objetivosTema) {
        indicadores += safeArray(objetivo.plan_indicadores).length
      }
    }
  }

  return { temas, objetivos, indicadores }
}

function buildClassMeta(clase) {
  return [
    clase?.instrumento ? { label: 'Instrumento', value: clase.instrumento } : null,
    clase?.nivel ? { label: 'Nivel', value: clase.nivel } : null,
    clase?.modalidad ? { label: 'Modalidad', value: clase.modalidad } : null,
    clase?.capacidad_maxima ? { label: 'Capacidad', value: `${clase.capacidad_maxima} alumnos` } : null,
  ].filter(Boolean)
}

function getClassInitials(name = '') {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'CL'
  )
}

function roundWeight(value) {
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return null
  return Math.round(numeric * 100) / 100
}

function findCurrentSelection(levels, selection) {
  const level = levels?.[selection.levelIndex] || null
  const tema = level?.plan_temas?.[selection.topicIndex] || null
  const objetivo = tema?.plan_objetivos?.[selection.objectiveIndex] || null
  const indicador = objetivo?.plan_indicadores?.[selection.indicatorIndex] || null
  return { level, tema, objetivo, indicador }
}

function buildDetail(level, tema, objetivo, indicador) {
  if (indicador) {
    return {
      type: 'indicador',
      entityId: indicador.id,
      title: indicador.descripcion || indicador.nombre || 'Indicador',
      subtitle: `${objetivo?.nombre || 'Objetivo'} · ${tema?.nombre || 'Tema'}`,
      badges: [
        indicador.orden_index != null ? `Orden ${indicador.orden_index + 1}` : null,
        indicador.calificacion != null ? `Calificación ${indicador.calificacion}` : 'Sin calificación',
      ].filter(Boolean),
      hints: [
        { label: 'Objetivo padre', value: objetivo?.nombre || '—' },
        { label: 'Tema', value: tema?.nombre || '—' },
      ],
      form: {
        kind: 'indicador',
        fields: {
          ponderacion: indicador.ponderacion ?? '',
          evidencia_sugerida: indicador.evidencia_sugerida || '',
          ejercicio_sugerido:
            indicador.ejercicio_sugerido ||
            `Diseñar una evidencia observable para "${indicador.descripcion || indicador.nombre || 'este indicador'}".`,
          criterio: indicador.criterio || '',
        },
      },
    }
  }

  if (objetivo) {
    const indicators = safeArray(objetivo.plan_indicadores)
    return {
      type: 'objetivo',
      entityId: objetivo.id,
      title: objetivo.nombre || 'Objetivo',
      subtitle: `${tema?.nombre || 'Tema'} · ${indicators.length} indicadores`,
      badges: [
        objetivo.orden_index != null ? `Orden ${objetivo.orden_index + 1}` : null,
        indicators.length ? `${indicators.length} indicadores` : 'Sin indicadores',
      ].filter(Boolean),
      hints: [
        { label: 'Tema padre', value: tema?.nombre || '—' },
        { label: 'Rama', value: tema?.habilidad_clave || 'Sin habilidad definida' },
      ],
      form: {
        kind: 'objetivo',
        fields: {
          ponderacion: objetivo.ponderacion ?? '',
          evidencia_sugerida: objetivo.evidencia_sugerida || '',
          descripcion: objetivo.descripcion || '',
        },
      },
    }
  }

  if (tema) {
    const objetivos = safeArray(tema.plan_objetivos)
    return {
      type: 'tema',
      entityId: tema.id,
      title: tema.nombre || 'Tema',
      subtitle: `${level?.nombre || 'Nivel'} · ${objetivos.length} objetivos`,
      badges: [tema.tipo || 'Tema', tema.orden_index != null ? `Orden ${tema.orden_index + 1}` : null].filter(Boolean),
      hints: [
        { label: 'Nivel', value: level?.nombre || '—' },
        { label: 'Objetivos conectados', value: String(objetivos.length) },
      ],
      form: {
        kind: 'tema',
        fields: {
          ponderacion: tema.ponderacion ?? '',
          habilidad_clave: tema.habilidad_clave || '',
          descripcion: tema.descripcion || '',
        },
      },
    }
  }

  if (level) {
    return {
      type: 'nivel',
      entityId: level.id,
      title: level.nombre || `Nivel ${level.numero_nivel || ''}`.trim(),
      subtitle: `${safeArray(level.plan_temas).length} temas en esta etapa`,
      badges: [level.numero_nivel != null ? `Nivel ${level.numero_nivel}` : null].filter(Boolean),
      hints: [
        { label: 'Objetivo general', value: level.objetivo_general || 'Sin objetivo general' },
        { label: 'Uso recomendado', value: 'Definir habilidades fundacionales antes de ponderar ramas internas.' },
      ],
      form: null,
    }
  }

  return {
    type: 'empty',
    entityId: null,
    title: 'Seleccioná una rama',
    subtitle: 'Explorá la estructura pedagógica de la clase',
    badges: [],
    hints: [
      {
        label: 'Qué podés hacer aquí',
        value:
          'Ver niveles, temas, objetivos e indicadores; además guardar ponderaciones, evidencias, ejercicios y vínculos reales.',
      },
    ],
    form: null,
  }
}

function renderField(name, label, value, opts = {}) {
  if (opts.type === 'textarea') {
    return `
      <label class="pm-mapa-form-field">
        <span>${escapeHTML(label)}</span>
        <textarea class="pm-mapa-textarea" name="${name}" rows="${opts.rows || 3}" placeholder="${escapeHTML(opts.placeholder || '')}">${escapeHTML(String(value || ''))}</textarea>
      </label>
    `
  }
  return `
    <label class="pm-mapa-form-field">
      <span>${escapeHTML(label)}</span>
      <input class="pm-mapa-input" type="${opts.type || 'text'}" name="${name}" value="${escapeHTML(String(value || ''))}" placeholder="${escapeHTML(opts.placeholder || '')}">
    </label>
  `
}

function renderDetailCard(detail, saving, suggesting, options = {}) {
  const catalog = options.catalog || []
  const link = options.link || null
  const mastery = options.mastery || null
  const masteryDetails = options.masteryDetails || []

  const formHtml = detail.form
    ? `
      <form id="pm-mapa-detail-form" class="pm-mapa-form">
        ${
          detail.form.kind === 'tema'
            ? [
                renderField('ponderacion', 'Ponderación', detail.form.fields.ponderacion, { type: 'number', placeholder: 'Ej. 25' }),
                renderField('habilidad_clave', 'Habilidad detectada', detail.form.fields.habilidad_clave, { placeholder: 'Ej. Lectura rítmica' }),
                renderField('descripcion', 'Descripción de la rama', detail.form.fields.descripcion, { type: 'textarea', rows: 4, placeholder: 'Qué persigue esta rama pedagógica' }),
              ].join('')
            : ''
        }
        ${
          detail.form.kind === 'objetivo'
            ? [
                renderField('ponderacion', 'Ponderación', detail.form.fields.ponderacion, { type: 'number', placeholder: 'Ej. 15' }),
                renderField('evidencia_sugerida', 'Evidencia sugerida', detail.form.fields.evidencia_sugerida, { type: 'textarea', rows: 3, placeholder: 'Qué debe hacer el alumno para evidenciar dominio' }),
                renderField('descripcion', 'Descripción del objetivo', detail.form.fields.descripcion, { type: 'textarea', rows: 3, placeholder: 'Contexto pedagógico del objetivo' }),
              ].join('')
            : ''
        }
        ${
          detail.form.kind === 'indicador'
            ? [
                renderField('ponderacion', 'Ponderación', detail.form.fields.ponderacion, { type: 'number', placeholder: 'Ej. 10' }),
                renderField('criterio', 'Criterio de dominio', detail.form.fields.criterio, { type: 'textarea', rows: 2, placeholder: 'Cómo sabemos si está dominado' }),
                renderField('evidencia_sugerida', 'Evidencia sugerida', detail.form.fields.evidencia_sugerida, { type: 'textarea', rows: 3, placeholder: 'Desempeño observable o mini reto' }),
                renderField('ejercicio_sugerido', 'Ejercicio sugerido', detail.form.fields.ejercicio_sugerido, { type: 'textarea', rows: 4, placeholder: 'Ejercicio para comprobar dominio del indicador' }),
              ].join('')
            : ''
        }
        <div class="pm-mapa-form-actions">
          ${
            detail.form.kind === 'indicador'
              ? `<button class="btn btn-outline-secondary btn-sm" type="button" id="pm-mapa-ai-suggest" ${suggesting ? 'disabled' : ''}>
                   ${suggesting ? '<span class="spinner-border spinner-border-sm me-2"></span>Sugiriendo...' : '<i class="bi bi-magic me-1"></i>Sugerir con IA'}
                 </button>`
              : ''
          }
          <button class="btn btn-primary btn-sm" type="submit" ${saving ? 'disabled' : ''}>
            ${saving ? '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...' : '<i class="bi bi-save me-1"></i>Guardar metadatos'}
          </button>
        </div>
      </form>
    `
    : ''

  const mappingHtml =
    detail.form?.kind === 'indicador'
      ? `
        <section class="pm-mapa-link-card">
          <div class="pm-mapa-link-head">
            <div>
              <div class="pm-mapa-detail-label">Vínculo académico real</div>
              <div class="pm-mapa-link-copy">Conecta este indicador pedagógico con el indicador evaluable de la ruta real.</div>
            </div>
            ${link?.indicator_id ? '<span class="pm-mapa-link-status pm-mapa-link-status--ok">Vinculado</span>' : '<span class="pm-mapa-link-status">Pendiente</span>'}
          </div>
          <div class="pm-mapa-link-current">${link?.indicator ? `<strong>${escapeHTML(buildAcademicIndicatorLabel(link.indicator))}</strong>` : 'Todavía no hay un indicador académico vinculado.'}</div>
          <label class="pm-mapa-form-field">
            <span>Indicador académico</span>
            <select class="pm-mapa-select" id="pm-mapa-link-select">
              <option value="">Seleccionar indicador...</option>
              ${catalog
                .map(
                  (item) => `
                    <option value="${item.id}" ${link?.indicator_id === item.id ? 'selected' : ''}>
                      ${escapeHTML(buildAcademicIndicatorLabel(item))}
                    </option>
                  `,
                )
                .join('')}
            </select>
          </label>
          <div class="pm-mapa-form-actions">
            <button class="btn btn-outline-primary btn-sm" type="button" id="pm-mapa-link-save" ${saving ? 'disabled' : ''}>
              <i class="bi bi-link-45deg me-1"></i>Guardar vínculo
            </button>
            ${
              link?.indicator_id
                ? `<button class="btn btn-outline-danger btn-sm" type="button" id="pm-mapa-link-remove" ${saving ? 'disabled' : ''}>
                     <i class="bi bi-trash3 me-1"></i>Quitar vínculo
                   </button>`
                : ''
            }
          </div>
          ${
            mastery
              ? `
                <div class="pm-mapa-mastery-grid">
                  <div class="pm-mapa-mastery-chip">
                    <strong>${mastery.total}</strong>
                    <span>Total alumnos</span>
                  </div>
                  <div class="pm-mapa-mastery-chip pm-mapa-mastery-chip--ok">
                    <strong>${mastery.mastered}</strong>
                    <span>Dominan</span>
                  </div>
                  <div class="pm-mapa-mastery-chip pm-mapa-mastery-chip--warn">
                    <strong>${mastery.in_progress}</strong>
                    <span>En progreso</span>
                  </div>
                  <div class="pm-mapa-mastery-chip">
                    <strong>${mastery.pending}</strong>
                    <span>Sin evidencia</span>
                  </div>
                </div>
              `
              : ''
          }
          ${
            masteryDetails.length
              ? `
                <div class="pm-mapa-students">
                  <div class="pm-mapa-detail-label">Trazabilidad por alumno</div>
                  <div class="pm-mapa-student-list">
                    ${masteryDetails
                      .map((student) => {
                        const meta = mapMasteryStateMeta(student.state)
                        return `
                          <div class="pm-mapa-student-row" data-student-id="${student.student_id}" data-student-name="${escapeHTML(student.student_name || '')}">
                            <div class="pm-mapa-student-main">
                              <strong>${escapeHTML(student.student_name || 'Alumno')}</strong>
                              <span>${student.nota != null ? `Nota ${student.nota}` : 'Sin nota registrada'}</span>
                            </div>
                            <div class="pm-mapa-student-meta-wrap">
                              <span class="pm-mapa-student-state pm-mapa-student-state--${meta.tone}">
                                ${escapeHTML(meta.label)}
                              </span>
                              <div class="pm-mapa-student-actions">
                                <button class="pm-mapa-action-btn pm-mapa-action-btn--profile" data-action="view-profile" title="Ver Perfil del Alumno">
                                  <i class="bi bi-person-badge"></i>
                                </button>
                                <button class="pm-mapa-action-btn pm-mapa-action-btn--eval" data-action="eval-student" data-indicator-id="${link?.indicator_id || ''}" title="Abrir Evaluación de Indicador">
                                  <i class="bi bi-check2-circle"></i>
                                </button>
                                <button class="pm-mapa-action-btn pm-mapa-action-btn--evidence" data-action="upload-evidence" data-indicator-id="${link?.indicator_id || ''}" title="Registrar Evidencia">
                                  <i class="bi bi-cloud-upload"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        `
                      })
                      .join('')}
                  </div>
                </div>
              `
              : link?.indicator_id
                ? `
                  <div class="pm-mapa-students pm-mapa-students--empty">
                    <div class="pm-mapa-detail-label">Trazabilidad por alumno</div>
                    <p>No hay alumnos o todavía no existe evidencia individual para esta clase.</p>
                  </div>
                `
                : ''
          }
        </section>
      `
      : ''

  return `
    <div class="pm-mapa-detail-card">
      <div class="pm-mapa-detail-type">${escapeHTML(detail.type.toUpperCase())}</div>
      <h3 class="pm-mapa-detail-title">${escapeHTML(detail.title)}</h3>
      <p class="pm-mapa-detail-subtitle">${escapeHTML(detail.subtitle)}</p>
      <div class="pm-mapa-detail-badges">
        ${detail.badges.map((badge) => `<span class="pm-mapa-badge">${escapeHTML(badge)}</span>`).join('')}
      </div>
      <div class="pm-mapa-detail-sections">
        ${detail.hints
          .map(
            (item) => `
              <div class="pm-mapa-detail-section">
                <div class="pm-mapa-detail-label">${escapeHTML(item.label)}</div>
                <div class="pm-mapa-detail-value">${escapeHTML(item.value)}</div>
              </div>
            `,
          )
          .join('')}
      </div>
      ${mappingHtml}
      ${formHtml}
    </div>
  `
}

function renderTree(levels) {
  return levels
    .map((level, levelIndex) => {
      const temas = safeArray(level.plan_temas)
      return `
        <section class="pm-mapa-level">
          <button class="pm-mapa-level-head" type="button" data-collapsible="level">
            <span class="pm-mapa-arrow"><i class="bi bi-chevron-right"></i></span>
            <span class="pm-mapa-level-pill">Nivel ${level.numero_nivel ?? levelIndex + 1}</span>
            <span class="pm-mapa-level-title" data-selectable="level" data-level-index="${levelIndex}" data-topic-index="-1" data-objective-index="-1" data-indicator-index="-1">${escapeHTML(level.nombre || 'Nivel')}</span>
            <span class="pm-mapa-level-count">${temas.length} temas</span>
          </button>
          <div class="pm-mapa-level-body" hidden>
            ${temas
              .map((tema, temaIndex) => {
                const objetivos = safeArray(tema.plan_objetivos)
                return `
                  <article class="pm-mapa-topic">
                    <button class="pm-mapa-topic-head" type="button" data-collapsible="topic">
                      <span class="pm-mapa-arrow"><i class="bi bi-chevron-right"></i></span>
                      <span class="pm-mapa-topic-type">${escapeHTML(tema.tipo || 'Tema')}</span>
                      <span class="pm-mapa-topic-title" data-selectable="tema" data-level-index="${levelIndex}" data-topic-index="${temaIndex}" data-objective-index="-1" data-indicator-index="-1">${escapeHTML(tema.nombre || 'Tema')}</span>
                      <span class="pm-mapa-level-count">${objetivos.length} objetivos</span>
                    </button>
                    <div class="pm-mapa-topic-body" hidden>
                      ${objetivos
                        .map((objetivo, objectiveIndex) => {
                          const indicadores = safeArray(objetivo.plan_indicadores)
                          return `
                            <div class="pm-mapa-objective">
                              <div class="pm-mapa-objective-head">
                                <button class="pm-mapa-objective-name" type="button" data-selectable="objetivo" data-level-index="${levelIndex}" data-topic-index="${temaIndex}" data-objective-index="${objectiveIndex}" data-indicator-index="-1">
                                  <i class="bi bi-bullseye"></i>
                                  ${escapeHTML(objetivo.nombre || 'Objetivo')}
                                </button>
                                <span class="pm-mapa-weight-chip">${objetivo.ponderacion ?? 'Ponderar'}</span>
                              </div>
                              <div class="pm-mapa-indicator-list">
                                ${indicadores
                                  .map(
                                    (indicador, indicatorIndex) => `
                                      <button class="pm-mapa-indicator" type="button" data-selectable="indicador" data-level-index="${levelIndex}" data-topic-index="${temaIndex}" data-objective-index="${objectiveIndex}" data-indicator-index="${indicatorIndex}">
                                        <span class="pm-mapa-indicator-dot"></span>
                                        <span class="pm-mapa-indicator-text">${escapeHTML(indicador.descripcion || indicador.nombre || 'Indicador')}</span>
                                        <span class="pm-mapa-indicator-score">${indicador.ponderacion ?? indicador.calificacion ?? '—'}</span>
                                      </button>
                                    `,
                                  )
                                  .join('')}
                              </div>
                            </div>
                          `
                        })
                        .join('')}
                    </div>
                  </article>
                `
              })
              .join('')}
          </div>
        </section>
      `
    })
    .join('')
}

function renderEmpty() {
  return `
    <div class="pm-mapa-empty">
      <i class="bi bi-diagram-3"></i>
      <h3>Mapa pedagógico</h3>
      <p>Elegí una clase para ver su árbol de niveles, temas, objetivos e indicadores.</p>
    </div>
  `
}

export function renderMapaPedagogicoPanel(container, { maestroId = null } = {}) {
  if (!container) return

  const _injectStyles = () => {
    if (document.getElementById('pm-mapa-cta-styles')) return
    const style = document.createElement('style')
    style.id = 'pm-mapa-cta-styles'
    style.textContent = `
      .pm-mapa-student-row {
        display: flex; align-items: center; justify-content: space-between;
        padding: 10px 14px; border-radius: 10px; background: rgba(255,255,255,0.01);
        margin-bottom: 6px; border: 1px solid rgba(255,255,255,0.04);
        transition: all 0.2s ease;
      }
      .pm-mapa-student-row:hover {
        background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.08);
      }
      .pm-mapa-student-meta-wrap {
        display: flex; align-items: center; gap: 14px;
      }
      .pm-mapa-student-actions {
        display: flex; gap: 6px; opacity: 0; transition: opacity 0.2s ease, transform 0.2s ease;
        transform: translateX(5px);
      }
      .pm-mapa-student-row:hover .pm-mapa-student-actions {
        opacity: 1; transform: translateX(0);
      }
      .pm-mapa-action-btn {
        background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
        color: #fff; width: 30px; height: 30px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center; cursor: pointer;
        font-size: 0.85rem; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .pm-mapa-action-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      .pm-mapa-action-btn--profile:hover { background: rgba(59,130,246,0.15); color: #60a5fa; border-color: rgba(59,130,246,0.3); }
      .pm-mapa-action-btn--eval:hover { background: rgba(16,185,129,0.15); color: #34d399; border-color: rgba(16,185,129,0.3); }
      .pm-mapa-action-btn--evidence:hover { background: rgba(245,158,11,0.15); color: #facc15; border-color: rgba(245,158,11,0.3); }
      
      .pm-mapa-modal-status-grid {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 15px;
      }
      .pm-mapa-modal-status-btn {
        padding: 8px 4px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.03); color: #fff; font-weight: 600; font-size: 0.72rem; cursor: pointer; transition: all 0.2s;
        display: flex; flex-direction: column; align-items: center; gap: 4px;
      }
      .pm-mapa-modal-status-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); }
      .pm-mapa-modal-status-btn.active.achieved { background: rgba(16,185,129,0.2); border-color: #10b981; color: #34d399; }
      .pm-mapa-modal-status-btn.active.in_process { background: rgba(234,179,8,0.2); border-color: #eab308; color: #facc15; }
      .pm-mapa-modal-status-btn.active.needs_reinforcement { background: rgba(249,115,22,0.2); border-color: #f97316; color: #ff9800; }
      .pm-mapa-modal-status-btn.active.failed { background: rgba(239,68,68,0.2); border-color: #ef4444; color: #f87171; }
      .pm-mapa-modal-status-btn.active.exceeded { background: rgba(59,130,246,0.2); border-color: #3b82f6; color: #60a5fa; }
      .pm-mapa-modal-status-btn.active.not_started { background: rgba(156,163,175,0.2); border-color: #9ca3af; color: #e5e7eb; }
    `
    document.head.appendChild(style)
  }

  _injectStyles()

  const state = {
    clases: [],
    clase: null,

    levels: [],
    indicatorCatalog: [],
    currentLink: null,
    currentMastery: null,
    currentMasteryDetails: [],
    saving: false,
    suggesting: false,
    linking: false,
    selection: { levelIndex: -1, topicIndex: -1, objectiveIndex: -1, indicatorIndex: -1 },
  }

  const setLoading = (message = 'Cargando mapa pedagógico...') => {
    container.innerHTML = `
      <div class="pm-mapa-shell">
        <div class="pm-mapa-loading">
          <div class="spinner-border spinner-border-sm text-primary"></div>
          <span>${escapeHTML(message)}</span>
        </div>
      </div>
    `
  }

  const setDefaultSelection = () => {
    const firstLevel = state.levels[0] || null
    const firstTopic = firstLevel?.plan_temas?.[0] || null
    const firstObjective = firstTopic?.plan_objetivos?.[0] || null
    const firstIndicator = firstObjective?.plan_indicadores?.[0] || null
    state.selection = {
      levelIndex: firstLevel ? 0 : -1,
      topicIndex: firstTopic ? 0 : -1,
      objectiveIndex: firstObjective ? 0 : -1,
      indicatorIndex: firstIndicator ? 0 : -1,
    }
  }

  const syncIndicatorBridgeState = async () => {
    const selected = findCurrentSelection(state.levels, state.selection)
    const indicatorId = selected.indicador?.id
    if (!indicatorId || !state.clase?.id) {
      state.currentLink = null
      state.currentMastery = null
      state.currentMasteryDetails = []
      return
    }

    const link = await routeAdapter.getPlanIndicatorLink(indicatorId).catch(() => null)
    state.currentLink = link
    if (!link?.indicator_id) {
      state.currentMastery = null
      state.currentMasteryDetails = []
      return
    }

    const [mastery, masteryDetails] = await Promise.all([
      routeAdapter.getPlanIndicatorMastery(indicatorId, state.clase.id).catch(() => null),
      routeAdapter.getPlanIndicatorMasteryDetails(indicatorId, state.clase.id).catch(() => []),
    ])
    state.currentMastery = mastery
    state.currentMasteryDetails = masteryDetails
  }

  const render = () => {
    const counts = countHierarchy(state.levels)
    const selected = findCurrentSelection(state.levels, state.selection)
    const detail = buildDetail(selected.level, selected.tema, selected.objetivo, selected.indicador)
    const meta = buildClassMeta(state.clase)
    const heroName = state.clase?.nombre || 'Seleccioná una clase'

    container.innerHTML = `
      <div class="pm-mapa-shell">
        <div class="pm-mapa-toolbar">
          <div class="pm-mapa-select-wrap">
            <i class="bi bi-book"></i>
            <select id="pm-mapa-class-select" class="pm-mapa-select">
              <option value="">Seleccionar clase...</option>
              ${state.clases
                .map(
                  (clase) => `
                    <option value="${clase.id}" ${state.clase?.id === clase.id ? 'selected' : ''}>
                      ${escapeHTML(clase.nombre || 'Clase')}
                    </option>
                  `,
                )
                .join('')}
            </select>
          </div>
          <div class="pm-mapa-kpis">
            <span class="pm-mapa-kpi"><strong>${state.levels.length}</strong> niveles</span>
            <span class="pm-mapa-kpi"><strong>${counts.temas}</strong> temas</span>
            <span class="pm-mapa-kpi"><strong>${counts.objetivos}</strong> objetivos</span>
            <span class="pm-mapa-kpi"><strong>${counts.indicadores}</strong> indicadores</span>
          </div>
        </div>

        ${
          state.clase
            ? `
              <div class="pm-mapa-class-hero">
                <div class="pm-mapa-class-avatar">${escapeHTML(getClassInitials(heroName))}</div>
                <div class="pm-mapa-class-main">
                  <div class="pm-mapa-class-label">Clase activa</div>
                  <h2 class="pm-mapa-class-title">${escapeHTML(heroName)}</h2>
                  <p class="pm-mapa-class-copy">
                    Explorá la estructura jerárquica de esta clase y usala como base para ponderar, secuenciar y evidenciar dominio.
                  </p>
                  <div class="pm-mapa-class-meta">
                    ${meta.map((item) => `<span class="pm-mapa-meta-chip"><strong>${escapeHTML(item.label)}:</strong> ${escapeHTML(item.value)}</span>`).join('')}
                  </div>
                </div>
              </div>
            `
            : ''
        }

        ${
          state.clase
            ? `
              <div class="pm-mapa-grid">
                <div class="pm-mapa-tree-panel">
                  <div class="pm-mapa-panel-head">
                    <h3>Árbol pedagógico</h3>
                    <p>Ramas: nivel → tema → objetivo → indicador</p>
                  </div>
                  <div class="pm-mapa-tree">
                    ${state.levels.length ? renderTree(state.levels) : renderEmpty()}
                  </div>
                </div>
                <aside class="pm-mapa-detail-panel">
                  <div class="pm-mapa-panel-head">
                    <h3>Detalle contextual</h3>
                    <p>Ahora podés guardar peso, evidencia, ejercicio sugerido y vínculo académico real.</p>
                  </div>
                  ${detail.type === 'indicador' ? '<div class="pm-mapa-detail-note">La señal real de dominio por alumno ya se alimenta desde el indicador académico vinculado abajo.</div>' : ''}
                  ${renderDetailCard(detail, state.saving || state.linking, state.suggesting, { catalog: state.indicatorCatalog, link: state.currentLink, mastery: state.currentMastery, masteryDetails: state.currentMasteryDetails })}
                </aside>
              </div>
            `
            : renderEmpty()
        }
      </div>
    `

    attachEvents(detail)
  }

  const loadClasses = async () => {
    setLoading('Cargando clases...')
    const routeClasses = await routeAdapter.getClasses(maestroId)
    const fallbackClasses = await obtenerClases()
    const base = maestroId ? routeClasses : routeClasses.length ? routeClasses : fallbackClasses
    const mergedMap = new Map()
    ;[...fallbackClasses, ...base].forEach((clase) => {
      if (clase?.id) mergedMap.set(clase.id, clase)
    })
    state.clases = [...mergedMap.values()].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
    render()
  }

  const loadHierarchy = async (classId) => {
    state.clase = state.clases.find((item) => item.id === classId) || null
    state.levels = []
    state.indicatorCatalog = []
    state.currentLink = null
    state.currentMastery = null
    state.currentMasteryDetails = []
    state.selection = { levelIndex: -1, topicIndex: -1, objectiveIndex: -1, indicatorIndex: -1 }
    render()
    if (!classId) return
    setLoading('Cargando árbol pedagógico...')
    const [levels, catalog] = await Promise.all([
      routeAdapter.getFullHierarchy(classId),
      routeAdapter.getAcademicIndicatorsCatalogForClass(classId).catch(() => []),
    ])
    state.levels = levels
    state.indicatorCatalog = catalog
    setDefaultSelection()
    await syncIndicatorBridgeState()
    render()
  }

  const reloadHierarchy = async () => {
    if (!state.clase?.id) return
    state.levels = await routeAdapter.getFullHierarchy(state.clase.id)
    await syncIndicatorBridgeState()
  }

  const saveDetail = async (detail, formElement) => {
    const formData = new FormData(formElement)
    const numericWeight = roundWeight(formData.get('ponderacion'))
    state.saving = true
    render()

    try {
      if (detail.form?.kind === 'tema') {
        await routeAdapter.updateTemaMetadata(detail.entityId, {
          ponderacion: numericWeight,
          habilidad_clave: String(formData.get('habilidad_clave') || '').trim() || null,
          descripcion: String(formData.get('descripcion') || '').trim() || null,
        })
      }

      if (detail.form?.kind === 'objetivo') {
        await routeAdapter.updateObjetivoMetadata(detail.entityId, {
          ponderacion: numericWeight,
          evidencia_sugerida: String(formData.get('evidencia_sugerida') || '').trim() || null,
          descripcion: String(formData.get('descripcion') || '').trim() || null,
        })
      }

      if (detail.form?.kind === 'indicador') {
        await routeAdapter.updateIndicadorMetadata(detail.entityId, {
          ponderacion: numericWeight,
          criterio: String(formData.get('criterio') || '').trim() || null,
          evidencia_sugerida: String(formData.get('evidencia_sugerida') || '').trim() || null,
          ejercicio_sugerido: String(formData.get('ejercicio_sugerido') || '').trim() || null,
        })
      }

      await reloadHierarchy()
      AppToast.success('Metadatos pedagógicos guardados')
    } catch (error) {
      console.error('[mapaPedagogicoPanel] save error:', error)
      AppToast.error(error.message || 'No se pudo guardar la rama pedagógica')
    } finally {
      state.saving = false
      render()
    }
  }

  const suggestIndicator = async (detail) => {
    if (detail.form?.kind !== 'indicador') return
    state.suggesting = true
    render()
    try {
      const { level, tema, objetivo, indicador } = findCurrentSelection(state.levels, state.selection)
      const result = await sugerirEjercicioIndicador({ clase: state.clase, level, tema, objetivo, indicador })
      if (!result.success || !result.suggestion) {
        throw new Error(result.error || 'No se pudo generar sugerencia')
      }
      await routeAdapter.updateIndicadorMetadata(detail.entityId, {
        criterio: result.suggestion.criterio || null,
        evidencia_sugerida: result.suggestion.evidencia_sugerida || null,
        ejercicio_sugerido: result.suggestion.ejercicio_sugerido || null,
      })
      await reloadHierarchy()
      AppToast.success('Sugerencia IA aplicada al indicador')
    } catch (error) {
      console.error('[mapaPedagogicoPanel] suggestIndicator error:', error)
      AppToast.error(error.message || 'No se pudo sugerir ejercicio')
    } finally {
      state.suggesting = false
      render()
    }
  }

  const saveIndicatorLink = async () => {
    const selected = findCurrentSelection(state.levels, state.selection)
    const planIndicatorId = selected.indicador?.id
    const indicatorId = container.querySelector('#pm-mapa-link-select')?.value
    if (!planIndicatorId) return
    if (!indicatorId) {
      AppToast.error('Seleccioná un indicador académico real antes de guardar')
      return
    }

    state.linking = true
    render()
    try {
      state.currentLink = await routeAdapter.savePlanIndicatorLink(planIndicatorId, indicatorId)
      ;[state.currentMastery, state.currentMasteryDetails] = await Promise.all([
        routeAdapter.getPlanIndicatorMastery(planIndicatorId, state.clase.id),
        routeAdapter.getPlanIndicatorMasteryDetails(planIndicatorId, state.clase.id),
      ])
      AppToast.success('Vínculo académico guardado')
    } catch (error) {
      console.error('[mapaPedagogicoPanel] saveIndicatorLink error:', error)
      AppToast.error(error.message || 'No se pudo guardar el vínculo')
    } finally {
      state.linking = false
      render()
    }
  }

  const removeIndicatorLink = async () => {
    const selected = findCurrentSelection(state.levels, state.selection)
    const planIndicatorId = selected.indicador?.id
    if (!planIndicatorId) return

    state.linking = true
    render()
    try {
      await routeAdapter.removePlanIndicatorLink(planIndicatorId)
      state.currentLink = null
      state.currentMastery = null
      state.currentMasteryDetails = []
      AppToast.success('Vínculo académico removido')
    } catch (error) {
      console.error('[mapaPedagogicoPanel] removeIndicatorLink error:', error)
      AppToast.error(error.message || 'No se pudo quitar el vínculo')
    } finally {
      state.linking = false
      render()
    }
  }

  const attachEvents = (detail) => {
    container.querySelector('#pm-mapa-class-select')?.addEventListener('change', async (event) => {
      await loadHierarchy(event.target.value)
    })

    container.querySelectorAll('[data-collapsible]').forEach((button) => {
      button.addEventListener('click', () => {
        const section = button.nextElementSibling
        const icon = button.querySelector('.pm-mapa-arrow i')
        const hidden = section?.hasAttribute('hidden')
        if (!section) return
        if (hidden) {
          section.removeAttribute('hidden')
          icon?.classList.remove('bi-chevron-right')
          icon?.classList.add('bi-chevron-down')
        } else {
          section.setAttribute('hidden', '')
          icon?.classList.remove('bi-chevron-down')
          icon?.classList.add('bi-chevron-right')
        }
      })
    })

    container.querySelectorAll('[data-selectable]').forEach((button) => {
      button.addEventListener('click', async () => {
        state.selection = {
          levelIndex: Number(button.dataset.levelIndex ?? -1),
          topicIndex: Number(button.dataset.topicIndex ?? -1),
          objectiveIndex: Number(button.dataset.objectiveIndex ?? -1),
          indicatorIndex: Number(button.dataset.indicatorIndex ?? -1),
        }
        await syncIndicatorBridgeState()
        render()
      })
    })

    container.querySelector('#pm-mapa-detail-form')?.addEventListener('submit', async (event) => {
      event.preventDefault()
      await saveDetail(detail, event.currentTarget)
    })

    container.querySelector('#pm-mapa-ai-suggest')?.addEventListener('click', async () => {
      await suggestIndicator(detail)
    })

    container.querySelector('#pm-mapa-link-save')?.addEventListener('click', async () => {
      await saveIndicatorLink()
    })

    container.querySelector('#pm-mapa-link-remove')?.addEventListener('click', async () => {
      await removeIndicatorLink()
    })

    // Delegación de eventos para CTAs de alumnos en la trazabilidad
    container.addEventListener('click', async (event) => {
      const btn = event.target.closest('[data-action]')
      if (!btn) return
      
      const action = btn.dataset.action
      const row = btn.closest('.pm-mapa-student-row')
      if (!row) return
      
      const studentId = row.dataset.studentId
      const studentName = row.dataset.studentName
      const indicatorId = btn.dataset.indicatorId
      
      if (action === 'view-profile') {
        event.stopPropagation()
        window.location.hash = `#/alumno/${studentId}`
        AppToast.success(`Redirigiendo al perfil de ${studentName}`)
        return
      }
      
      if (action === 'eval-student') {
        event.stopPropagation()
        openEvalStudentModal(studentId, studentName, indicatorId)
        return
      }
      
      if (action === 'upload-evidence') {
        event.stopPropagation()
        openEvidenceModal(studentId, studentName, indicatorId)
        return
      }
    })
  }

  const openEvalStudentModal = async (studentId, studentName, indicatorId) => {
    if (!indicatorId) {
      AppToast.error('Este indicador no está vinculado a un indicador real aún')
      return
    }
    
    const record = state.currentMasteryDetails.find(d => d.student_id === studentId && d.indicator_id === indicatorId) || null
    let selectedStatus = record?.status || 'not_started'
    
    AppModal.open({
      title: `Evaluar Indicador — ${studentName}`,
      body: `
        <div class="pm-student-panel__modal-field">
          <label style="display:block;font-size:0.75rem;font-weight:700;color:rgba(255,255,255,0.5);margin-bottom:8px;text-transform:uppercase;">Nivel de Logro (Semáforo)</label>
          <div class="pm-mapa-modal-status-grid">
            <button class="pm-mapa-modal-status-btn ${selectedStatus === 'not_started' ? 'active' : ''} not_started" data-status="not_started">
              <span>⚫</span><span>Sin iniciar</span>
            </button>
            <button class="pm-mapa-modal-status-btn ${selectedStatus === 'in_process' ? 'active' : ''} in_process" data-status="in_process">
              <span>🟡</span><span>En proceso</span>
            </button>
            <button class="pm-mapa-modal-status-btn ${selectedStatus === 'achieved' ? 'active' : ''} achieved" data-status="achieved">
              <span>🟢</span><span>Dominado</span>
            </button>
            <button class="pm-mapa-modal-status-btn ${selectedStatus === 'needs_reinforcement' ? 'active' : ''} needs_reinforcement" data-status="needs_reinforcement">
              <span>🟠</span><span>Requiere refuerzo</span>
            </button>
            <button class="pm-mapa-modal-status-btn ${selectedStatus === 'failed' ? 'active' : ''} failed" data-status="failed">
              <span>🔴</span><span>No aprobado</span>
            </button>
            <button class="pm-mapa-modal-status-btn ${selectedStatus === 'exceeded' ? 'active' : ''} exceeded" data-status="exceeded">
              <span>🔵</span><span>Sobresaliente</span>
            </button>
          </div>
        </div>
        <div class="pm-student-panel__modal-field" style="margin-top:15px;">
          <label style="display:block;font-size:0.75rem;font-weight:700;color:rgba(255,255,255,0.5);margin-bottom:8px;text-transform:uppercase;">Observaciones / Comentarios</label>
          <textarea id="mapa-modal-obs" rows="3" style="width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; padding: 10px; font-size: 0.9rem; resize: none; outline: none;" placeholder="Comentarios sobre el desempeño...">${record?.observation || ''}</textarea>
        </div>
        <div class="pm-student-panel__modal-field" style="margin-top:15px;">
          <label style="display:block;font-size:0.75rem;font-weight:700;color:rgba(255,255,255,0.5);margin-bottom:8px;text-transform:uppercase;">Enlace de Evidencia (Video/Audio)</label>
          <input type="text" id="mapa-modal-evidence" style="width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; padding: 10px; font-size: 0.9rem; outline: none;" placeholder="URL de video o audio en drive/supabase..." value="${record?.evidence_url || ''}">
        </div>
      `,
      confirmText: 'Guardar Evaluación',
      cancelText: 'Cancelar',
      onSave: async () => {
        const obs = document.getElementById('mapa-modal-obs').value
        const evidence = document.getElementById('mapa-modal-evidence').value
        
        try {
          await weeklyPlanAdapter.registrarProgresoIndicador(
            studentId,
            indicatorId,
            selectedStatus,
            obs.trim(),
            evidence.trim()
          )
          
          await reloadHierarchy()
          render()
          AppToast.success('Evaluación del alumno guardada con éxito')
          return true
        } catch (err) {
          console.error(err)
          AppToast.error('Error al guardar: ' + err.message)
          return false
        }
      }
    })
    
    setTimeout(() => {
      const modal = document.querySelector('.pm-mapa-modal-status-grid')
      if (modal) {
        modal.addEventListener('click', (e) => {
          const btn = e.target.closest('[data-status]')
          if (btn) {
            modal.querySelectorAll('[data-status]').forEach(b => b.classList.remove('active'))
            btn.classList.add('active')
            selectedStatus = btn.dataset.status
          }
        })
      }
    }, 150)
  }

  const openEvidenceModal = async (studentId, studentName, indicatorId) => {
    if (!indicatorId) {
      AppToast.error('Este indicador no está vinculado a un indicador real aún')
      return
    }
    
    const record = state.currentMasteryDetails.find(d => d.student_id === studentId && d.indicator_id === indicatorId) || null
    const currentStatus = record?.status || 'in_process'
    
    AppModal.open({
      title: `Registrar Evidencia — ${studentName}`,
      body: `
        <div class="pm-student-panel__modal-field">
          <label style="display:block;font-size:0.75rem;font-weight:700;color:rgba(255,255,255,0.5);margin-bottom:8px;text-transform:uppercase;">Enlace de Evidencia (Video/Audio)</label>
          <input type="text" id="mapa-modal-evidence" style="width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; padding: 10px; font-size: 0.9rem; outline: none;" placeholder="URL de video o audio en drive/supabase..." value="${record?.evidence_url || ''}">
        </div>
        <div class="pm-student-panel__modal-field" style="margin-top:15px;">
          <label style="display:block;font-size:0.75rem;font-weight:700;color:rgba(255,255,255,0.5);margin-bottom:8px;text-transform:uppercase;">Comentarios / Observaciones</label>
          <textarea id="mapa-modal-obs" rows="3" style="width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; padding: 10px; font-size: 0.9rem; resize: none; outline: none;" placeholder="Comentarios sobre la evidencia...">${record?.observation || ''}</textarea>
        </div>
      `,
      confirmText: 'Registrar Evidencia',
      cancelText: 'Cancelar',
      onSave: async () => {
        const obs = document.getElementById('mapa-modal-obs').value
        const evidence = document.getElementById('mapa-modal-evidence').value
        
        try {
          await weeklyPlanAdapter.registrarProgresoIndicador(
            studentId,
            indicatorId,
            currentStatus,
            obs.trim(),
            evidence.trim()
          )
          
          await reloadHierarchy()
          render()
          AppToast.success('Evidencia registrada con éxito')
          return true
        } catch (err) {
          console.error(err)
          AppToast.error('Error al guardar: ' + err.message)
          return false
        }
      }
    })
  }

  loadClasses().catch((error) => {
    console.error('[mapaPedagogicoPanel] Error:', error)
    container.innerHTML = `
      <div class="alert alert-warning border-0">
        No se pudo cargar el mapa pedagógico: ${escapeHTML(error.message || 'Error desconocido')}
      </div>
    `
  })
}
