import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import {
  listarPropuestasPendientes,
  publicarPropuesta,
  devolverPropuesta,
} from '../api/propuestasAdapter.js'

/**
 * Vista ACM — revisión de propuestas de contenido curricular enviadas por
 * maestros (curriculo-tres-planos WU #6).
 *
 * Ruta: maestro-propuestas-pendientes
 *
 * Flujo:
 *   1. Lista route_versions con origen='maestro' AND status='propuesta'.
 *   2. Al seleccionar una, muestra el árbol Nivel -> Tema -> Objetivo -> Indicador.
 *   3. [Publicar] -> status='published' (valor real del enum, ver design.md).
 *   4. [Devolver] -> requiere feedback no vacío -> status='devuelta' + feedback.
 */
export async function renderAcmPropuestasView(container) {
  container.innerHTML = `
    <div class="acm-propuestas-container">
      <div class="acm-propuestas-header">
        <h1>Propuestas de Maestros</h1>
        <p>Revisá el contenido curricular propuesto y decidí si publicarlo o devolverlo con feedback.</p>
      </div>
      <div class="acm-propuestas-body" style="display:flex; gap:1.5rem;">
        <div class="acm-propuestas-list" id="acm-propuestas-list" style="flex: 0 0 320px;"></div>
        <div class="acm-propuestas-detail" id="acm-propuestas-detail" style="flex:1;">
          <p class="acm-placeholder">Seleccioná una propuesta para revisarla.</p>
        </div>
      </div>
    </div>
  `

  const listEl = container.querySelector('#acm-propuestas-list')
  const detailEl = container.querySelector('#acm-propuestas-detail')

  let propuestas = []
  try {
    propuestas = await listarPropuestasPendientes()
  } catch (err) {
    console.error('[acmPropuestasView] Error cargando propuestas:', err)
    listEl.innerHTML = `<p class="acm-error">Error al cargar propuestas: ${escapeHTML(err.message)}</p>`
    return
  }

  if (!propuestas.length) {
    listEl.innerHTML = `<p class="acm-placeholder">No hay propuestas pendientes de revisión.</p>`
    return
  }

  listEl.innerHTML = propuestas
    .map(
      (p) => `
      <button type="button" class="acm-propuesta-item" data-propuesta-id="${escapeHTML(p.id)}">
        <strong>Clase: ${escapeHTML(p.clase_id || 'sin clase')}</strong>
        <span class="acm-propuesta-fecha">${escapeHTML(p.created_at || '')}</span>
      </button>
    `,
    )
    .join('')

  listEl.querySelectorAll('[data-propuesta-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const propuesta = propuestas.find((p) => p.id === btn.dataset.propuestaId)
      if (propuesta) _renderDetail(detailEl, propuesta, { onResolved: () => renderAcmPropuestasView(container) })
    })
  })
}

function _renderDetail(detailEl, propuesta, { onResolved }) {
  const tree = _buildTreeHTML(propuesta.levels || [])

  detailEl.innerHTML = `
    <div class="acm-propuesta-detail-inner">
      <h3>Árbol de contenido propuesto</h3>
      <div class="acm-tree">${tree}</div>

      <div class="acm-feedback-block" style="margin-top:1rem;">
        <label for="acm-feedback-textarea">Feedback (obligatorio para devolver)</label>
        <textarea id="acm-feedback-textarea" data-role="feedback-textarea" rows="3" style="width:100%;"></textarea>
      </div>

      <div class="acm-actions" style="margin-top:1rem; display:flex; gap:0.5rem;">
        <button type="button" class="btn-apple-primary" data-action="publicar">Publicar</button>
        <button type="button" class="btn-apple-secondary" data-action="devolver">Devolver</button>
      </div>
    </div>
  `

  let feedback = ''
  const textarea = detailEl.querySelector('[data-role="feedback-textarea"]')
  textarea.addEventListener('input', (e) => {
    feedback = e.target.value
  })

  detailEl.querySelector('[data-action="publicar"]').addEventListener('click', async () => {
    try {
      await publicarPropuesta(propuesta.id)
      onResolved()
    } catch (err) {
      console.error('[acmPropuestasView] Error al publicar:', err)
      window.alert(`Error al publicar: ${err.message}`)
    }
  })

  detailEl.querySelector('[data-action="devolver"]').addEventListener('click', async () => {
    if (!feedback.trim()) {
      window.alert('Escribí un feedback antes de devolver la propuesta.')
      return
    }
    try {
      await devolverPropuesta(propuesta.id, feedback)
      onResolved()
    } catch (err) {
      console.error('[acmPropuestasView] Error al devolver:', err)
      window.alert(`Error al devolver: ${err.message}`)
    }
  })
}

function _buildTreeHTML(levels) {
  if (!levels.length) return '<p class="acm-placeholder">Esta propuesta no tiene niveles.</p>'

  return levels
    .slice()
    .sort((a, b) => (a.level_number || 0) - (b.level_number || 0))
    .map(
      (level) => `
      <div class="acm-tree-level">
        <strong>Nivel ${escapeHTML(String(level.level_number ?? ''))}</strong>
        ${(level.nodes || [])
          .map(
            (node) => `
          <div class="acm-tree-node" style="margin-left:1rem;">
            <em>${escapeHTML(node.name || '')}</em>
            ${(node.objetivos || [])
              .map(
                (obj) => `
              <div class="acm-tree-objetivo" style="margin-left:1rem;">
                ${escapeHTML(obj.nombre || '')}
                <ul>
                  ${(obj.indicators || [])
                    .map((ind) => `<li>${escapeHTML(ind.description || '')}</li>`)
                    .join('')}
                </ul>
              </div>
            `,
              )
              .join('')}
          </div>
        `,
          )
          .join('')}
      </div>
    `,
    )
    .join('')
}
