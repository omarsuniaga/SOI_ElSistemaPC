import { obtenerRuta, proponerVariante } from '../api/rutasApi.js'
import { AppToast } from '../../../shared/components/AppToast.js'

const STYLE = `
<style id="ruta-variante-style">
.cambio-item { padding: 10px; border-bottom: 1px solid #eee; font-size: 0.9rem; }
.cambio-add { color: #28a745; }
.cambio-remove { color: #dc3545; }
.cambio-move { color: #ffc107; }
</style>`

export function openRutaVarianteModal(rutaBaseId, onProposed) {
  const existing = document.getElementById('ruta-variante-modal')
  if (existing) existing.remove()

  const el = document.createElement('div')
  el.id = 'ruta-variante-modal'
  el.innerHTML = `${STYLE}
    <div class="modal fade" id="ruta-variante-dialog" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-arrow-repeat me-2"></i>Proponer Variante de Ruta</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" id="variante-body">
            <div class="text-center py-4"><div class="spinner-border spinner-border-sm"></div></div>
          </div>
        </div>
      </div>
    </div>`

  document.body.appendChild(el)

  const modalEl = document.getElementById('ruta-variante-dialog')
  const modal = new bootstrap.Modal(modalEl)

  async function _render() {
    const body = document.getElementById('variante-body')
    try {
      const rutaBase = await obtenerRuta(rutaBaseId)

      body.innerHTML = `
        <div class="alert alert-info small mb-3">
          <i class="bi bi-info-circle me-2"></i>
          Estás creando una variante de <strong>${rutaBase.nombre}</strong>
        </div>

        <div class="mb-3">
          <label class="form-label"><strong>Nombre de tu Variante</strong></label>
          <input type="text" class="form-control" id="variante-nombre" placeholder="ej: Variante acelerada para grupo avanzado">
        </div>

        <div class="mb-3">
          <label class="form-label"><strong>¿Cuál es la razón del cambio?</strong></label>
          <textarea class="form-control" id="variante-razon" rows="3" placeholder="Explica por qué tu grupo necesita esta variante..."></textarea>
        </div>

        <hr>

        <div class="mb-3">
          <label class="form-label"><strong>Objetivos de tu Variante</strong></label>
          <div id="objetivos-variante"></div>
          <button type="button" class="btn btn-outline-primary btn-sm w-100" id="btn-agregar-obj-var">
            <i class="bi bi-plus me-1"></i>Agregar Objetivo
          </button>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-primary" id="btn-proponer-variante">
            <i class="bi bi-send me-1"></i>Enviar para Aprobación
          </button>
        </div>
      `

      let objetivos = JSON.parse(JSON.stringify(rutaBase.objetivos))

      function _renderObjetivosVar() {
        const list = document.getElementById('objetivos-variante')
        list.innerHTML = objetivos.map((obj, i) => `
          <div class="mb-2" data-idx="${i}">
            <div style="display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: start;">
              <div style="border: 1px solid #ddd; padding: 10px; border-radius: 4px; background: #f9f9f9;">
                <small style="color: #999;">Semana ${obj.semana_inicio}-${obj.semana_fin}</small>
                <div style="font-weight: 500;">${obj.descripcion}</div>
              </div>
              <button type="button" class="btn btn-sm btn-link text-danger" data-remove-idx="${i}">Quitar</button>
            </div>
          </div>
        `).join('')

        // Attach remove listeners
        document.querySelectorAll('[data-remove-idx]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.removeIdx)
            objetivos.splice(idx, 1)
            _renderObjetivosVar()
          })
        })
      }

      document.getElementById('btn-agregar-obj-var').addEventListener('click', () => {
        const maxSemana = Math.max(...objetivos.map(o => o.semana_fin))
        objetivos.push({
          descripcion: '',
          semana_inicio: maxSemana + 1,
          semana_fin: maxSemana + 2,
          orden: objetivos.length + 1
        })
        _renderObjetivosVar()
      })

      document.getElementById('btn-proponer-variante').addEventListener('click', async () => {
        const nombre = document.getElementById('variante-nombre').value
        const razon = document.getElementById('variante-razon').value

        if (!nombre || !razon) {
          AppToast.warning('Completa nombre y razón')
          return
        }

        try {
          const variante = await proponerVariante(rutaBaseId, nombre, razon, objetivos)
          AppToast.success('Variante propuesta para aprobación')
          modal.hide()
          if (onProposed) onProposed(variante)
        } catch (err) {
          AppToast.error(`Error: ${err.message}`)
        }
      })

      _renderObjetivosVar()
    } catch (err) {
      body.innerHTML = `<div class="alert alert-danger">${err.message}</div>`
    }
  }

  modalEl.addEventListener('shown.bs.modal', _render)
  modal.show()
}
