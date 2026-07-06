import { listarRutas } from '../api/rutasApi.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'

export function openRutaSelectorModal(instrumento, nivel, onSelect) {
  const STYLES = `
    <style id="ruta-selector-style">
      .ruta-option {
        padding: 12px; border: 1px solid #dee2e6; border-radius: 6px;
        margin-bottom: 8px; cursor: pointer; transition: all 0.2s;
      }
      .ruta-option:hover { background: #f8f9fa; border-color: #007bff; }
      .ruta-option.selected {
        background: #e7f1ff; border-color: #007bff;
        box-shadow: 0 0 0 3px rgba(0,123,255,0.25);
      }
      .ruta-info { font-size: 0.85rem; color: #666; margin-top: 4px; }
    </style>`

  const state = { selectedId: null }

  const _handleClose = () => {
    if (state.selectedId) onSelect(state.selectedId)
  }

  AppModal.open({
    title: '<i class="bi bi-diagram-3 me-2"></i>Selecciona Ruta de Contenidos',
    size: 'md',
    body: `${STYLES}<div class="text-center py-4"><div class="spinner-border spinner-border-sm"></div></div>`,
    saveText: 'Seleccionar',
    cancelText: 'Cancelar',
    hideSave: true,
    onCancel: _handleClose,
  })

  _loadAndRender(instrumento, nivel, state)
}

async function _loadAndRender(instrumento, nivel, state) {
  try {
    const rutas = await listarRutas({
      instrumento,
      nivel,
      estado: 'activa'
    })

    if (rutas.length === 0) {
      AppModal.updateBody('<p class="text-muted text-center">No hay rutas disponibles para este instrumento/nivel.</p>')
      return
    }

    const soiRuta = rutas.find(r => r.tipo === 'soi-estandar')
    if (soiRuta) state.selectedId = soiRuta.id

    const content = `
      <div class="alert alert-info small mb-3">
        <i class="bi bi-lightbulb me-2"></i>La ruta define los objetivos que cubrirás en este período.
      </div>
      <div id="ruta-list">${rutas.map(r => `
        <div class="ruta-option ${state.selectedId === r.id ? 'selected' : ''}" data-ruta-id="${r.id}">
          <strong>${r.tipo === 'soi-estandar' ? '📌' : '⚡'} ${r.nombre}</strong>
          <div class="ruta-info">
            ${r.duracion_semanas} semanas
            ${r.tipo === 'maestro-variante' ? `| Variante aprobada` : `| Estándar SOI`}
          </div>
        </div>
      `).join('')}</div>
    `

    AppModal.updateBody(content)

    document.querySelectorAll('.ruta-option').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.ruta-option').forEach(e => e.classList.remove('selected'))
        el.classList.add('selected')
        state.selectedId = el.dataset.rutaId
      })
    })

  } catch (err) {
    AppModal.updateBody(`<div class="alert alert-danger">${err.message}</div>`)
    AppToast.error('Error cargando rutas')
  }
}
