import { listarRutas } from '../api/rutasApi.js'
import { AppToast } from '../../../shared/components/AppToast.js'

const STYLE = `
<style id="ruta-selector-style">
.ruta-option { padding: 12px; border: 1px solid #dee2e6; border-radius: 6px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s; }
.ruta-option:hover { background: #f8f9fa; border-color: #007bff; }
.ruta-option.selected { background: #e7f1ff; border-color: #007bff; box-shadow: 0 0 0 3px rgba(0,123,255,0.25); }
.ruta-info { font-size: 0.85rem; color: #666; margin-top: 4px; }
</style>`

export function openRutaSelectorModal(instrumento, nivel, onSelect) {
  const existing = document.getElementById('ruta-selector-modal')
  if (existing) existing.remove()

  const el = document.createElement('div')
  el.id = 'ruta-selector-modal'
  el.innerHTML = `${STYLE}
    <div class="modal fade" id="ruta-selector-dialog" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-diagram-3 me-2"></i>Selecciona Ruta de Contenidos</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" id="ruta-selector-body">
            <div class="text-center py-4"><div class="spinner-border spinner-border-sm"></div></div>
          </div>
        </div>
      </div>
    </div>`

  document.body.appendChild(el)

  const modalEl = document.getElementById('ruta-selector-dialog')
  const modal = new bootstrap.Modal(modalEl)

  async function _render() {
    const body = document.getElementById('ruta-selector-body')
    try {
      const rutas = await listarRutas({
        instrumento,
        nivel,
        estado: 'activa'
      })

      if (rutas.length === 0) {
        body.innerHTML = '<p class="text-muted text-center">No hay rutas disponibles para este instrumento/nivel.</p>'
        return
      }

      let selectedId = null
      const soiRuta = rutas.find(r => r.tipo === 'soi-estandar')
      if (soiRuta) selectedId = soiRuta.id

      body.innerHTML = `
        <div class="alert alert-info small mb-3">
          <i class="bi bi-lightbulb me-2"></i>La ruta define los objetivos que cubrirás en este período.
        </div>
        <div id="ruta-list">${rutas.map(r => `
          <div class="ruta-option ${selectedId === r.id ? 'selected' : ''}" data-ruta-id="${r.id}">
            <strong>${r.tipo === 'soi-estandar' ? '📌' : '⚡'} ${r.nombre}</strong>
            <div class="ruta-info">
              ${r.duracion_semanas} semanas
              ${r.tipo === 'maestro-variante' ? `| Variante aprobada` : `| Estándar SOI`}
            </div>
          </div>
        `).join('')}</div>
      `

      // Event listeners
      document.querySelectorAll('.ruta-option').forEach(el => {
        el.addEventListener('click', () => {
          document.querySelectorAll('.ruta-option').forEach(e => e.classList.remove('selected'))
          el.classList.add('selected')
          selectedId = el.dataset.rutaId
        })
      })

      // Override close button to call onSelect
      const closeBtn = modalEl.querySelector('.btn-close')
      closeBtn.onclick = () => {
        modal.hide()
        if (selectedId) onSelect(selectedId)
      }

    } catch (err) {
      body.innerHTML = `<div class="alert alert-danger">${err.message}</div>`
      AppToast.error('Error cargando rutas')
    }
  }

  modalEl.addEventListener('shown.bs.modal', _render)
  modal.show()
}
