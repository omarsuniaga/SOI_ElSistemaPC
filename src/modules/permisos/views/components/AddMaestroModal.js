import { listarMaestrosSinPermisos, actualizarPermiso } from '../../api/permisosSupabase.js'

function escapeHTML(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * AddMaestroModal
 * Renders a Bootstrap 5.3 modal into `container`.
 * Emits custom event `maestro-added` on `container` after a teacher is added.
 *
 * @param {HTMLElement} container — parent element to mount modal into
 */
export class AddMaestroModal {
  constructor(container) {
    this.container = container
    this._maestros = []
    this._filtered = []
    this._el = null
    this._searchValue = ''
  }

  /** Open the modal and load maestros list */
  async open() {
    this._render()
    this._maestros = await listarMaestrosSinPermisos()
    this._filtered = [...this._maestros]
    this._renderList()
    this._attachEvents()
  }

  _render() {
    const existing = this.container.querySelector('#addMaestroModal')
    if (existing) existing.remove()

    const div = document.createElement('div')
    div.innerHTML = `
      <div
        id="addMaestroModal"
        data-testid="add-maestro-modal"
        class="modal fade show d-block"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="addMaestroModalLabel"
        style="background:rgba(0,0,0,.5)"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="addMaestroModalLabel">Agregar Maestro</h5>
              <button type="button" class="btn-close" data-action="close-modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <input
                type="text"
                class="form-control mb-3"
                data-testid="modal-search"
                placeholder="Buscar maestro..."
                value=""
              >
              <ul class="list-group" data-testid="maestros-list" style="max-height:300px;overflow-y:auto;"></ul>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-action="close-modal">Cancelar</button>
              <button type="button" class="btn btn-primary" data-action="confirm-add" disabled>Confirmar</button>
            </div>
          </div>
        </div>
      </div>
    `
    this._el = div.firstElementChild
    this.container.appendChild(this._el)
  }

  _renderList() {
    const list = this._el.querySelector('[data-testid="maestros-list"]')
    if (!list) return

    if (!this._filtered.length) {
      list.innerHTML = '<li class="list-group-item text-muted">No hay maestros disponibles</li>'
      return
    }

    list.innerHTML = this._filtered.map(m => `
      <li
        class="list-group-item list-group-item-action"
        data-testid="maestro-option"
        data-maestro-id="${escapeHTML(m.id)}"
        style="cursor:pointer"
      >
        ${escapeHTML(m.nombre_completo)}
      </li>
    `).join('')
  }

  _attachEvents() {
    // Search filter
    const searchInput = this._el.querySelector('[data-testid="modal-search"]')
    searchInput?.addEventListener('input', (e) => {
      this._searchValue = e.target.value.toLowerCase()
      this._filtered = this._maestros.filter(m =>
        m.nombre_completo.toLowerCase().includes(this._searchValue)
      )
      this._renderList()
      this._attachListEvents()
    })

    this._attachListEvents()

    // Close buttons
    this._el.querySelectorAll('[data-action="close-modal"]').forEach(btn => {
      btn.addEventListener('click', () => this.close())
    })

    // Confirm
    const confirmBtn = this._el.querySelector('[data-action="confirm-add"]')
    confirmBtn?.addEventListener('click', async () => {
      const selected = this._el.querySelector('[data-testid="maestro-option"].active')
      if (!selected) return

      const maestroId = selected.dataset.maestroId
      confirmBtn.disabled = true
      confirmBtn.textContent = 'Guardando...'

      try {
        await actualizarPermiso(maestroId, {
          puede_registrar_alumnos: false,
          puede_inscribir_clases: false,
          permisos: [],
          fecha_inicio: todayISO(),
        })

        this.container.dispatchEvent(new CustomEvent('maestro-added', {
          bubbles: true,
          detail: { maestro_id: maestroId },
        }))

        this.close()
      } catch (err) {
        console.error('Error adding maestro:', err)
        confirmBtn.disabled = false
        confirmBtn.textContent = 'Confirmar'
      }
    })
  }

  _attachListEvents() {
    const list = this._el.querySelector('[data-testid="maestros-list"]')
    const confirmBtn = this._el.querySelector('[data-action="confirm-add"]')

    list?.querySelectorAll('[data-testid="maestro-option"]').forEach(item => {
      item.addEventListener('click', () => {
        list.querySelectorAll('[data-testid="maestro-option"]').forEach(i => i.classList.remove('active'))
        item.classList.add('active')
        if (confirmBtn) confirmBtn.disabled = false
      })
    })
  }

  close() {
    this._el?.remove()
    this._el = null
  }
}
