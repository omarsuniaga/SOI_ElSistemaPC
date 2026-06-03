import * as routeAdapter from '../api/routeAdapter.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'

const CALIF_LABELS = {
  0: 'Sin eval.',
  1: 'Inicial',
  2: 'En desarrollo',
  3: 'Logrado',
  4: 'Destacado',
  5: 'Superado',
}

const CALIF_COLORS = {
  0: '#9ca3af',
  1: '#ef4444',
  2: '#f97316',
  3: '#22c55e',
  4: '#06b6d4',
  5: '#8b5cf6',
}

export async function renderRutaAcademicaView(container) {
  _injectStyles()

  container.innerHTML = `
    <div class="ra-container">
      <div class="ra-header">
        <div class="ra-header-left">
          <div class="ra-icon">
            <i class="bi bi-diagram-3"></i>
          </div>
          <div>
            <h1 class="ra-title">Ruta Académica</h1>
            <p class="ra-subtitle">Contenidos curriculares por clase — nivel, tema, objetivo e indicador</p>
          </div>
        </div>
      </div>

      <div class="ra-toolbar">
        <div class="ra-select-wrapper">
          <i class="bi bi-book"></i>
          <select id="ra-clase-select" class="ra-select">
            <option value="">Cargando clases...</option>
          </select>
        </div>
        <div class="ra-stats" id="ra-stats"></div>
      </div>

      <div id="ra-tree-container" class="ra-tree-container">
        <div class="ra-placeholder">
          <i class="bi bi-arrow-up-circle"></i>
          <p>Seleccioná una clase para ver su ruta académica</p>
        </div>
      </div>
    </div>
  `

  try {
    const clases = await routeAdapter.getClasses()
    const select = container.querySelector('#ra-clase-select')
    select.innerHTML =
      '<option value="">Seleccionar clase...</option>' +
      clases.map((c) => `<option value="${c.id}">${escapeHTML(c.nombre)}</option>`).join('')

    select.addEventListener('change', () => {
      const classId = select.value
      if (classId) _loadHierarchy(container, classId)
      else {
        container.querySelector('#ra-tree-container').innerHTML = `
          <div class="ra-placeholder">
            <i class="bi bi-arrow-up-circle"></i>
            <p>Seleccioná una clase para ver su ruta académica</p>
          </div>`
        container.querySelector('#ra-stats').innerHTML = ''
      }
    })
  } catch (err) {
    console.error('[rutaAcademica] Error loading classes:', err)
    container.querySelector('#ra-clase-select').innerHTML =
      '<option value="">Error al cargar clases</option>'
  }
}

async function _loadHierarchy(container, classId) {
  const treeContainer = container.querySelector('#ra-tree-container')
  const statsEl = container.querySelector('#ra-stats')

  treeContainer.innerHTML = `
    <div class="ra-loading">
      <div class="spinner-border spinner-border-sm text-primary"></div>
      <span>Cargando ruta académica...</span>
    </div>
  `

  try {
    const levels = await routeAdapter.getFullHierarchy(classId)
    if (!levels || levels.length === 0) {
      treeContainer.innerHTML = `
        <div class="ra-placeholder">
          <i class="bi bi-journal-x"></i>
          <p>Esta clase no tiene niveles configurados</p>
        </div>`
      statsEl.innerHTML = ''
      return
    }

    let totalTemas = 0
    let totalObjetivos = 0
    let totalIndicadores = 0
    let totalCalificados = 0

    levels.forEach((lvl) => {
      const temas = lvl.plan_temas || []
      totalTemas += temas.length
      temas.forEach((t) => {
        const objs = t.plan_objetivos || []
        totalObjetivos += objs.length
        objs.forEach((o) => {
          const inds = o.plan_indicadores || []
          totalIndicadores += inds.length
          totalCalificados += inds.filter((i) => i.calificacion > 0).length
        })
      })
    })

    statsEl.innerHTML = `
      <span class="ra-stat"><strong>${levels.length}</strong> niveles</span>
      <span class="ra-stat"><strong>${totalTemas}</strong> temas</span>
      <span class="ra-stat"><strong>${totalObjetivos}</strong> objetivos</span>
      <span class="ra-stat"><strong>${totalIndicadores}</strong> indicadores</span>
      <span class="ra-stat"><strong>${totalCalificados}</strong> calificados</span>
    `

    treeContainer.innerHTML = `
      <div class="ra-tree">
        ${levels
          .map(
            (lvl, li) => `
          <div class="ra-level">
            <div class="ra-level-header" data-level-idx="${li}">
              <i class="bi bi-chevron-right ra-chevron"></i>
              <span class="ra-level-badge">Nivel ${lvl.numero_nivel}</span>
              <span class="ra-level-name">${escapeHTML(lvl.nombre)}</span>
              ${lvl.objetivo_general ? `<span class="ra-level-goal">— ${escapeHTML(lvl.objetivo_general)}</span>` : ''}
              <span class="ra-level-count">${(lvl.plan_temas || []).length} temas</span>
            </div>
            <div class="ra-level-body" style="display:none;">
              ${_renderTemas(lvl.plan_temas || [])}
            </div>
          </div>
        `,
          )
          .join('')}
      </div>
    `

    treeContainer.querySelectorAll('.ra-level-header').forEach((hdr) => {
      hdr.addEventListener('click', () => {
        const body = hdr.nextElementSibling
        const chevron = hdr.querySelector('.ra-chevron')
        const isOpen = body.style.display !== 'none'
        body.style.display = isOpen ? 'none' : 'block'
        chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(90deg)'
      })
    })

    treeContainer.querySelectorAll('.ra-tema-header').forEach((hdr) => {
      hdr.addEventListener('click', () => {
        const body = hdr.nextElementSibling
        const chevron = hdr.querySelector('.ra-chevron')
        const isOpen = body.style.display !== 'none'
        body.style.display = isOpen ? 'none' : 'block'
        chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(90deg)'
      })
    })
  } catch (err) {
    console.error('[rutaAcademica] Error loading hierarchy:', err)
    treeContainer.innerHTML = `
      <div class="ra-placeholder text-danger">
        <i class="bi bi-exclamation-triangle"></i>
        <p>Error al cargar la ruta: ${escapeHTML(err.message)}</p>
      </div>`
  }
}

function _renderTemas(temas) {
  return temas
    .map(
      (t, ti) => `
    <div class="ra-tema">
      <div class="ra-tema-header" data-tema-idx="${ti}">
        <i class="bi bi-chevron-right ra-chevron"></i>
        <span class="ra-tema-badge">${escapeHTML(t.tipo || 'TEMA')}</span>
        <span class="ra-tema-name">${escapeHTML(t.nombre)}</span>
        <span class="ra-tema-count">${(t.plan_objetivos || []).length} objetivos</span>
      </div>
      <div class="ra-tema-body" style="display:none;">
        ${_renderObjetivos(t.plan_objetivos || [])}
      </div>
    </div>
  `,
    )
    .join('')
}

function _renderObjetivos(objetivos) {
  return objetivos
    .map(
      (o) => `
    <div class="ra-objetivo">
      <div class="ra-objetivo-header">
        <i class="bi bi-bullseye ra-obj-icon"></i>
        <span class="ra-obj-name">${escapeHTML(o.nombre)}</span>
      </div>
      ${_renderIndicadores(o.plan_indicadores || [])}
    </div>
  `,
    )
    .join('')
}

function _renderIndicadores(indicadores) {
  return `
    <div class="ra-indicadores">
      ${indicadores
        .map(
          (i) => `
        <div class="ra-indicador">
          <span class="ra-ind-text">${escapeHTML(i.descripcion)}</span>
          <span class="ra-ind-calif" style="background:${CALIF_COLORS[i.calificacion] || CALIF_COLORS[0]};">
            ${i.calificacion || 0} — ${CALIF_LABELS[i.calificacion] || CALIF_LABELS[0]}
          </span>
        </div>
      `,
        )
        .join('')}
    </div>
  `
}

function _injectStyles() {
  if (document.getElementById('ra-styles')) return
  const style = document.createElement('style')
  style.id = 'ra-styles'
  style.textContent = `
    .ra-container { padding: 1.5rem; max-width: 1100px; margin: 0 auto; }
    .ra-header { margin-bottom: 1.5rem; }
    .ra-header-left { display: flex; align-items: center; gap: 1rem; }
    .ra-icon { width: 42px; height: 42px; background: linear-gradient(135deg,#6366f1,#8b5cf6); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.2rem; flex-shrink: 0; }
    .ra-title { font-size: 1.4rem; font-weight: 700; margin: 0; }
    .ra-subtitle { font-size: 0.85rem; color: var(--bs-secondary-color); margin: 0.2rem 0 0; }
    .ra-toolbar { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .ra-select-wrapper { position: relative; min-width: 280px; }
    .ra-select-wrapper i { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--bs-secondary-color); }
    .ra-select { width: 100%; padding: 0.6rem 1rem 0.6rem 2.2rem; border: 1px solid var(--bs-border-color); border-radius: 10px; font-size: 0.9rem; background: var(--bs-body-bg); color: var(--bs-body-color); appearance: none; cursor: pointer; }
    .ra-stats { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .ra-stat { font-size: 0.75rem; color: var(--bs-secondary-color); background: var(--bs-tertiary-bg); padding: 0.3rem 0.6rem; border-radius: 6px; white-space: nowrap; }
    .ra-tree-container { min-height: 200px; }
    .ra-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; color: var(--bs-secondary-color); text-align: center; }
    .ra-placeholder i { font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.3; }
    .ra-placeholder p { margin: 0; font-size: 0.9rem; }
    .ra-loading { display: flex; align-items: center; justify-content: center; gap: 0.75rem; padding: 3rem; color: var(--bs-secondary-color); }
    .ra-tree { display: flex; flex-direction: column; gap: 0.5rem; }
    .ra-level { background: var(--bs-body-bg); border: 1px solid var(--bs-border-color); border-radius: 12px; overflow: hidden; }
    .ra-level-header { display: flex; align-items: center; gap: 0.75rem; padding: 0.9rem 1rem; cursor: pointer; transition: background 0.15s; user-select: none; min-height: 44px; }
    .ra-level-header:hover { background: var(--bs-tertiary-bg); }
    .ra-chevron { transition: transform 0.2s; font-size: 0.8rem; color: var(--bs-secondary-color); flex-shrink: 0; }
    .ra-level-badge { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: var(--bs-primary,#6366f1); color: #fff; padding: 0.15rem 0.5rem; border-radius: 4px; flex-shrink: 0; }
    .ra-level-name { font-weight: 600; font-size: 0.9rem; }
    .ra-level-goal { font-size: 0.8rem; color: var(--bs-secondary-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ra-level-count { margin-left: auto; font-size: 0.7rem; color: var(--bs-secondary-color); flex-shrink: 0; }
    .ra-level-body { border-top: 1px solid var(--bs-border-color); padding: 0.5rem 0.5rem 0.5rem 0; }
    .ra-tema { margin: 0 0 0.25rem 1.5rem; border: 1px solid var(--bs-border-color); border-radius: 8px; overflow: hidden; background: var(--bs-tertiary-bg); }
    .ra-tema-header { display: flex; align-items: center; gap: 0.6rem; padding: 0.65rem 0.75rem; cursor: pointer; transition: background 0.15s; user-select: none; min-height: 44px; }
    .ra-tema-header:hover { background: var(--bs-body-bg); }
    .ra-tema-badge { font-size: 0.55rem; font-weight: 700; background: var(--bs-info,#3b82f6); color: #fff; padding: 0.1rem 0.4rem; border-radius: 3px; flex-shrink: 0; }
    .ra-tema-name { font-weight: 500; font-size: 0.85rem; }
    .ra-tema-count { margin-left: auto; font-size: 0.65rem; color: var(--bs-secondary-color); }
    .ra-tema-body { border-top: 1px solid var(--bs-border-color); padding: 0.5rem 0; }
    .ra-objetivo { padding: 0.5rem 0.75rem; margin: 0 0.5rem 0.5rem 1.5rem; background: var(--bs-body-bg); border: 1px solid var(--bs-border-color); border-radius: 8px; }
    .ra-objetivo-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
    .ra-obj-icon { color: var(--bs-warning,#f59e0b); font-size: 0.85rem; }
    .ra-obj-name { font-weight: 500; font-size: 0.8rem; color: var(--bs-body-color); }
    .ra-indicadores { display: flex; flex-direction: column; gap: 0.3rem; margin-left: 1.5rem; }
    .ra-indicador { display: flex; align-items: center; gap: 0.5rem; padding: 0.35rem 0.5rem; border-radius: 6px; background: var(--bs-tertiary-bg); font-size: 0.8rem; }
    .ra-ind-text { flex: 1; color: var(--bs-body-color); }
    .ra-ind-calif { font-size: 0.6rem; font-weight: 700; color: #fff; padding: 0.15rem 0.5rem; border-radius: 10px; white-space: nowrap; flex-shrink: 0; }

    [data-bs-theme="dark"] .ra-level-badge { background: #818cf8; }
    [data-bs-theme="dark"] .ra-tema-badge { background: #60a5fa; }
    [data-bs-theme="dark"] .ra-obj-icon { color: #fbbf24; }
    [data-bs-theme="dark"] .ra-indicador { background: rgba(255,255,255,0.04); }
    [data-bs-theme="dark"] .ra-tema { background: rgba(255,255,255,0.03); }

    @media (max-width: 768px) {
      .ra-container { padding: 1rem; }
      .ra-toolbar { flex-direction: column; align-items: stretch; }
      .ra-select-wrapper { min-width: unset; width: 100%; }
      .ra-select { min-height: 44px; }
      .ra-stats { gap: 0.4rem; }
      .ra-stat { font-size: 0.65rem; padding: 0.2rem 0.5rem; }
      .ra-level { border-radius: 10px; }
      .ra-level-header { padding: 0.7rem 0.75rem; gap: 0.5rem; }
      .ra-level-goal { display: none; }
      .ra-tema { margin-left: 0.75rem; }
      .ra-objetivo { margin-left: 0.75rem; padding: 0.4rem 0.6rem; }
      .ra-indicadores { margin-left: 0.75rem; }
      .ra-indicador { flex-direction: column; align-items: flex-start; gap: 0.3rem; }
      .ra-ind-calif { align-self: flex-start; }
    }

    @media (max-width: 480px) {
      .ra-container { padding: 0.75rem; }
      .ra-title { font-size: 1.1rem; }
      .ra-icon { width: 36px; height: 36px; font-size: 1rem; }
      .ra-tema { margin-left: 0.5rem; }
      .ra-objetivo { margin-left: 0.5rem; }
      .ra-indicadores { margin-left: 0.5rem; }
    }
  `
  document.head.appendChild(style)
}
