import { getAlumnos } from '../../alumnos/api/alumnosApi.js'

export function createAlumnoPickerModal(options = {}) {
  const {
    onSelect = null,
    onClose = null,
  } = options

  let selectedAlumnos = new Set()
  let searchTerm = ''

  const modal = document.createElement('div')
  modal.className = 'modal fade'
  modal.setAttribute('tabindex', '-1')
  modal.setAttribute('role', 'dialog')
  modal.innerHTML = `
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Seleccionar Alumnos</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body p-0">
          <div class="p-3 border-bottom bg-light">
            <input type="text" class="form-control search-input" placeholder="Buscar por nombre...">
          </div>
          <div class="alumno-list-container" style="max-height: 300px; overflow-y: auto;">
            <div class="list-group list-group-flush alumno-list">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary cancel-btn" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-primary confirm-btn">Insertar seleccionados</button>
        </div>
      </div>
    </div>
  `

  const searchInput = modal.querySelector('.search-input')
  const alumnoList = modal.querySelector('.alumno-list')
  const confirmBtn = modal.querySelector('.confirm-btn')
  const cancelBtn = modal.querySelector('.cancel-btn')

  async function loadAlumnos() {
    const allAlumnos = await getAlumnos()
    const filtered = searchTerm
      ? allAlumnos.filter(a => 
          a.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : allAlumnos

    renderAlumnos(filtered)
  }

  function renderAlumnos(alumnos) {
    alumnoList.innerHTML = ''

    if (alumnos.length === 0) {
      const empty = document.createElement('div')
      empty.className = 'text-center text-muted py-4'
      empty.textContent = 'No se encontraron alumnos'
      alunoList.appendChild(empty)
      return
    }

    alumnos.forEach(alumno => {
      const item = document.createElement('label')
      item.className = 'list-group-item d-flex align-items-center gap-2 cursor-pointer'
      item.style.cursor = 'pointer'

      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.className = 'form-check-input'
      checkbox.checked = selectedAlumnos.has(alumno.id)
      checkbox.value = alumno.id

      const info = document.createElement('div')
      info.className = 'flex-grow-1'
      info.innerHTML = `
        <div class="fw-medium">${escapeHtml(alumno.nombre_completo)}</div>
        <small class="text-muted">${escapeHtml(alumno.instrumento_principal)}</small>
      `

      item.appendChild(checkbox)
      item.appendChild(info)

      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          selectedAlumnos.add(alumno.id)
        } else {
          selectedAlumnos.delete(alumno.id)
        }
      })

      item.addEventListener('click', e => {
        if (e.target !== checkbox) {
          checkbox.checked = !checkbox.checked
          checkbox.dispatchEvent(new Event('change'))
        }
      })

      alumnoList.appendChild(item)
    })
  }

  searchInput.addEventListener('input', e => {
    searchTerm = e.target.value
    loadAlumnos()
  })

  confirmBtn.addEventListener('click', () => {
    if (onSelect) {
      const seleccionados = Array.from(selectedAlumnos)
      onSelect(seleccionados)
    }
    closeModal()
  })

  cancelBtn.addEventListener('click', () => {
    if (onClose) {
      onClose()
    }
    closeModal()
  })

  function openModal() {
    selectedAlumnos.clear()
    searchTerm = ''
    searchInput.value = ''

    const bsModal = new bootstrap.Modal(modal)
    bsModal.show()

    loadAlumnos()

    modal.bsModal = bsModal
  }

  function closeModal() {
    if (modal.bsModal) {
      modal.bsModal.hide()
    }
  }

  modal.openModal = openModal
  modal.closeModal = closeModal

  return modal
}

function escapeHtml(text) {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function insertAlumnosMention(alumnoIds, getAlumnosFn) {
  return new Promise(async (resolve) => {
    const allAlumnos = await getAlumnosFn()
    const selected = allAlumnos.filter(a => alumnoIds.includes(a.id))

    const mentions = selected.map(a => `#${a.nombre_completo}`).join(', ')
    resolve(mentions)
  })
}