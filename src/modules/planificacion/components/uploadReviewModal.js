import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import '../styles/uploadReviewModal.css'

let _modalEl = null

export function openUploadReviewModal(hierarchy, { onSave, title, subtitle }) {
  closeUploadReviewModal()

  const data = JSON.parse(JSON.stringify(hierarchy))

  _modalEl = document.createElement('div')
  _modalEl.id = 'upload-review-modal'
  _modalEl.className = 'pm-plan-modal-overlay'
  _modalEl.innerHTML = _buildHTML(data, { title, subtitle })

  document.body.appendChild(_modalEl)

  _wireEvents(data, onSave)

  requestAnimationFrame(() => {
    _modalEl.classList.add('open')
  })
}

export function closeUploadReviewModal() {
  if (_modalEl) {
    _modalEl.classList.remove('open')
    setTimeout(() => {
      _modalEl?.remove()
      _modalEl = null
    }, 200)
  }
}

function _buildHTML(data, opts = {}) {
  const routeName = escapeHTML(data.route?.nombre || 'Sin nombre')
  const routeNivel = escapeHTML(data.route?.nivel || '')
  const modalTitle = opts.title || 'Revisar Jerarquía'
  const modalSubtitle = opts.subtitle || 'Edite, agregue o elimine elementos antes de guardar'

  return `
    <div class="urm-backdrop"></div>
    <div class="urm-modal">
      <div class="urm-header">
        <div class="urm-header-left">
          <div class="urm-icon">
            <i class="bi bi-diagram-3"></i>
          </div>
          <div>
            <h2 class="urm-title">${escapeHTML(modalTitle)}</h2>
            <p class="urm-subtitle">${escapeHTML(modalSubtitle)}</p>
          </div>
        </div>
        <button class="urm-close-x" aria-label="Cerrar">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="urm-body">
        <div class="urm-route-section">
          <div class="urm-section-label">RUTA</div>
          <div class="urm-route-row">
            <div class="urm-field">
              <label class="urm-field-label">Nombre</label>
              <input type="text" class="urm-input" id="urm-route-nombre" value="${routeName}">
            </div>
            <div class="urm-field">
              <label class="urm-field-label">Nivel</label>
              <input type="text" class="urm-input" id="urm-route-nivel" value="${routeNivel}">
            </div>
          </div>
        </div>

        <div class="urm-tree-section">
          <div class="urm-section-label">ESTRUCTURA</div>
          <div id="urm-tree-container">${_renderLevels(data.levels || [])}</div>
          <button class="urm-add-btn" id="urm-add-level">
            <i class="bi bi-plus-circle me-1"></i>Agregar nivel
          </button>
        </div>
      </div>

      <div class="urm-footer">
        <button class="urm-cancel-btn">Cancelar</button>
        <button class="urm-save-btn">
          <i class="bi bi-check-lg me-1"></i>Guardar estructura
        </button>
      </div>
    </div>
  `
}

function _renderLevels(levels) {
  return levels
    .map(
      (level, li) => `
      <div class="urm-level" data-level-idx="${li}">
        <div class="urm-level-header">
          <span class="urm-drag-handle" title="Reordenar"><i class="bi bi-grip-vertical"></i></span>
          <input type="text" class="urm-input urm-input-sm" data-field="nombre" value="${escapeHTML(level.nombre || '')}" placeholder="Nombre del nivel">
          <button class="urm-icon-btn urm-danger-btn" data-action="remove-level" data-level-idx="${li}" title="Eliminar nivel">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
        <div class="urm-nodes-container">
          ${(level.nodes || [])
            .map(
              (node, ni) => `
              <div class="urm-node" data-level-idx="${li}" data-node-idx="${ni}">
                <div class="urm-node-header">
                  <input type="text" class="urm-input urm-input-sm" data-field="nombre" value="${escapeHTML(node.nombre || '')}" placeholder="Nombre del tema/nodo">
                  <button class="urm-icon-btn urm-danger-btn" data-action="remove-node" data-level-idx="${li}" data-node-idx="${ni}" title="Eliminar nodo">
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
                <div class="urm-objetivos-container">
                  ${(node.objetivos || [])
                    .map(
                      (obj, oi) => `
                      <div class="urm-objetivo" data-level-idx="${li}" data-node-idx="${ni}" data-obj-idx="${oi}">
                        <div class="urm-objetivo-header">
                          <span class="urm-tag urm-tag-obj">OBJ</span>
                          <input type="text" class="urm-input urm-input-sm" data-field="descripcion" value="${escapeHTML(obj.descripcion || '')}" placeholder="Descripción del objetivo">
                          <button class="urm-icon-btn urm-danger-btn" data-action="remove-obj" data-level-idx="${li}" data-node-idx="${ni}" data-obj-idx="${oi}" title="Eliminar">
                            <i class="bi bi-x-lg"></i>
                          </button>
                        </div>
                        <div class="urm-indicadores-container">
                          ${(obj.indicadores || [])
                            .map(
                              (ind, ii) => `
                            <div class="urm-indicador" data-level-idx="${li}" data-node-idx="${ni}" data-obj-idx="${oi}" data-ind-idx="${ii}">
                              <span class="urm-tag ${ind.tipo === 'sumativo' ? 'urm-tag-sum' : 'urm-tag-for'}">IND</span>
                              <input type="text" class="urm-input urm-input-sm urm-input-grow" data-field="descripcion" value="${escapeHTML(ind.descripcion || '')}" placeholder="Indicador">
                              <select class="urm-select-tipo" data-field="tipo" data-level-idx="${li}" data-node-idx="${ni}" data-obj-idx="${oi}" data-ind-idx="${ii}">
                                <option value="formativo" ${ind.tipo === 'formativo' ? 'selected' : ''}>Formativo</option>
                                <option value="sumativo" ${ind.tipo === 'sumativo' ? 'selected' : ''}>Sumativo</option>
                              </select>
                              <button class="urm-icon-btn urm-danger-btn" data-action="remove-ind" data-level-idx="${li}" data-node-idx="${ni}" data-obj-idx="${oi}" data-ind-idx="${ii}" title="Eliminar">
                                <i class="bi bi-x-lg"></i>
                              </button>
                            </div>
                          `,
                            )
                            .join('')}
                        </div>
                        <button class="urm-add-btn-sm" data-action="add-ind" data-level-idx="${li}" data-node-idx="${ni}" data-obj-idx="${oi}">
                          <i class="bi bi-plus me-1"></i>Indicador
                        </button>
                      </div>
                    `,
                    )
                    .join('')}
                </div>
                <button class="urm-add-btn-sm" data-action="add-obj" data-level-idx="${li}" data-node-idx="${ni}">
                  <i class="bi bi-plus me-1"></i>Objetivo
                </button>
              </div>
            `,
            )
            .join('')}
        </div>
        <button class="urm-add-btn-sm" data-action="add-node" data-level-idx="${li}">
          <i class="bi bi-plus me-1"></i>Nodo/Tema
        </button>
      </div>
    `,
    )
    .join('')
}

function _wireEvents(data, onSave) {
  const backdrop = _modalEl.querySelector('.urm-backdrop')
  const closeBtn = _modalEl.querySelector('.urm-close-x')
  const cancelBtn = _modalEl.querySelector('.urm-cancel-btn')
  const saveBtn = _modalEl.querySelector('.urm-save-btn')
  const addLevelBtn = _modalEl.querySelector('#urm-add-level')

  const close = () => closeUploadReviewModal()
  backdrop.onclick = close
  closeBtn.onclick = close
  cancelBtn.onclick = close

  const escHandler = (e) => {
    if (e.key === 'Escape') {
      close()
      document.removeEventListener('keydown', escHandler)
    }
  }
  document.addEventListener('keydown', escHandler)

  addLevelBtn.onclick = () => {
    data.levels.push({
      nombre: `Nivel ${(data.levels?.length || 0) + 1}`,
      nodes: [],
    })
    _refreshTree(data)
  }

  _modalEl.querySelector('#urm-tree-container').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]')
    if (!btn) return
    const action = btn.dataset.action
    const li = Number(btn.dataset.levelIdx)
    const ni = Number(btn.dataset.nodeIdx)
    const oi = Number(btn.dataset.objIdx)
    const ii = Number(btn.dataset.indIdx)

    if (action === 'remove-level') {
      data.levels.splice(li, 1)
    } else if (action === 'remove-node') {
      data.levels[li]?.nodes?.splice(ni, 1)
    } else if (action === 'remove-obj') {
      data.levels[li]?.nodes?.[ni]?.objetivos?.splice(oi, 1)
    } else if (action === 'remove-ind') {
      data.levels[li]?.nodes?.[ni]?.objetivos?.[oi]?.indicadores?.splice(ii, 1)
    } else if (action === 'add-node') {
      if (!data.levels[li].nodes) data.levels[li].nodes = []
      data.levels[li].nodes.push({ nombre: 'Nuevo tema', objetivos: [] })
    } else if (action === 'add-obj') {
      const node = data.levels[li]?.nodes?.[ni]
      if (!node) return
      if (!node.objetivos) node.objetivos = []
      node.objetivos.push({ descripcion: 'Nuevo objetivo', indicadores: [] })
    } else if (action === 'add-ind') {
      const obj = data.levels[li]?.nodes?.[ni]?.objetivos?.[oi]
      if (!obj) return
      if (!obj.indicadores) obj.indicadores = []
      obj.indicadores.push({ descripcion: 'Nuevo indicador', tipo: 'formativo' })
    }

    _refreshTree(data)
  })

  _modalEl.querySelector('#urm-tree-container').addEventListener('input', (e) => {
    const input = e.target
    if (!input.matches('.urm-input')) return

    const li = Number(input.closest('[data-level-idx]')?.dataset.levelIdx)
    const ni = input.closest('[data-node-idx]')?.dataset.nodeIdx
    const oi = input.closest('[data-obj-idx]')?.dataset.objIdx
    const ii = input.closest('[data-ind-idx]')?.dataset.indIdx
    const field = input.dataset.field

    if (ni === undefined && oi === undefined && ii === undefined) {
      if (data.levels[li]) data.levels[li][field] = input.value
    } else if (oi === undefined && ii === undefined) {
      if (data.levels[li]?.nodes?.[Number(ni)]) data.levels[li].nodes[Number(ni)][field] = input.value
    } else if (ii === undefined) {
      const obj = data.levels[li]?.nodes?.[Number(ni)]?.objetivos?.[Number(oi)]
      if (obj) obj[field] = input.value
    } else {
      const ind = data.levels[li]?.nodes?.[Number(ni)]?.objetivos?.[Number(oi)]?.indicadores?.[Number(ii)]
      if (ind) ind[field] = input.value
    }
  })

  _modalEl.querySelector('#urm-tree-container').addEventListener('change', (e) => {
    if (!e.target.matches('.urm-select-tipo')) return
    const select = e.target
    const li = Number(select.dataset.levelIdx)
    const ni = Number(select.dataset.nodeIdx)
    const oi = Number(select.dataset.objIdx)
    const ii = Number(select.dataset.indIdx)
    const ind = data.levels[li]?.nodes?.[ni]?.objetivos?.[oi]?.indicadores?.[ii]
    if (ind) ind.tipo = select.value
  })

  saveBtn.onclick = () => {
    data.route = {
      nombre: _modalEl.querySelector('#urm-route-nombre')?.value || data.route?.nombre || '',
      nivel: _modalEl.querySelector('#urm-route-nivel')?.value || data.route?.nivel || '',
    }

    if (!data.levels || data.levels.length === 0) {
      AppToast.error('Debe haber al menos un nivel')
      return
    }

    const hasContent = data.levels.some(
      (l) => l.nodes?.some((n) => n.objetivos?.length > 0),
    )
    if (!hasContent) {
      AppToast.error('Debe haber al menos un objetivo en algún nodo')
      return
    }

    if (onSave) onSave(data)
    closeUploadReviewModal()
  }
}

function _refreshTree(data) {
  const container = _modalEl.querySelector('#urm-tree-container')
  if (container) {
    container.innerHTML = _renderLevels(data.levels || [])
  }
}
