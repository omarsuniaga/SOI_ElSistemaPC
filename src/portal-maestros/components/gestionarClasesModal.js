/**
 * Modal para que maestros creen y gestionen clases
 * Requiere permiso: puede_inscribir_clases
 */

import { supabase } from '../../lib/supabaseClient.js'

export function gestionarClasesModal() {
  let isOpen = false
  let maestroId = null
  let clasesList = []

  const modal = document.createElement('div')
  modal.id = 'gestionar-clases-modal'
  modal.className = 'modal modal-fade'
  modal.setAttribute('role', 'dialog')
  modal.setAttribute('aria-labelledby', 'gestionar-clases-title')
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-apple-primary text-white border-0">
          <h5 class="modal-title" id="gestionar-clases-title">
            <i class="bi bi-mortarboard-fill"></i> Gestionar Clases
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body">
          <!-- Tabs para listar y crear -->
          <ul class="nav nav-tabs mb-3" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active" id="clases-list-tab" type="button" role="tab" aria-controls="clases-list" aria-selected="true">
                <i class="bi bi-list-check"></i> Mis Clases
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="clases-create-tab" type="button" role="tab" aria-controls="clases-create" aria-selected="false">
                <i class="bi bi-plus-circle"></i> Crear Clase
              </button>
            </li>
          </ul>

          <!-- Tab: Listar clases -->
          <div class="tab-pane fade show active" id="clases-list" role="tabpanel" aria-labelledby="clases-list-tab">
            <div id="clases-loading" class="text-center">
              <div class="spinner-border spinner-border-sm text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="mt-2">Cargando clases...</p>
            </div>
            <div id="clases-container" style="display: none;"></div>
            <div id="clases-empty" style="display: none;" class="text-center py-4">
              <i class="bi bi-inbox" style="font-size: 2rem; color: #ccc;"></i>
              <p class="text-muted mt-2">No hay clases registradas</p>
            </div>
            <div id="clases-error" style="display: none;" class="alert alert-danger" role="alert">
              <i class="bi bi-exclamation-circle"></i>
              <span id="clases-error-message"></span>
            </div>
          </div>

          <!-- Tab: Crear clase -->
          <div class="tab-pane fade" id="clases-create" role="tabpanel" aria-labelledby="clases-create-tab">
            <form id="crear-clase-form">
              <div class="mb-3">
                <label for="clase-nombre" class="form-label">Nombre de la Clase *</label>
                <input
                  type="text"
                  class="form-control"
                  id="clase-nombre"
                  placeholder="Ej: Matemáticas Básicas"
                  required
                />
                <div class="form-text text-danger d-none" id="clase-nombre-error"></div>
              </div>

              <div class="mb-3">
                <label for="clase-codigo" class="form-label">Código de Clase *</label>
                <input
                  type="text"
                  class="form-control"
                  id="clase-codigo"
                  placeholder="Ej: MAT-101"
                  required
                />
                <div class="form-text text-muted small">Identificador único para la clase</div>
              </div>

              <div class="mb-3">
                <label for="clase-descripcion" class="form-label">Descripción</label>
                <textarea
                  class="form-control"
                  id="clase-descripcion"
                  rows="3"
                  placeholder="Describe el contenido y objetivos de la clase..."
                ></textarea>
              </div>

              <div class="mb-3">
                <label for="clase-horario" class="form-label">Horario</label>
                <input
                  type="text"
                  class="form-control"
                  id="clase-horario"
                  placeholder="Ej: Lunes 10:00 - 12:00"
                />
              </div>

              <div class="mb-3">
                <label for="clase-ubicacion" class="form-label">Ubicación / Aula</label>
                <input
                  type="text"
                  class="form-control"
                  id="clase-ubicacion"
                  placeholder="Ej: Aula 101"
                />
              </div>

              <div id="crear-clase-error" class="alert alert-danger d-none mt-3" role="alert">
                <i class="bi bi-exclamation-circle"></i>
                <span id="crear-clase-error-message"></span>
              </div>
            </form>
          </div>
        </div>

        <div class="modal-footer border-0">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cerrar</button>
          <button type="button" class="btn btn-apple-primary" id="btn-crear-clase" style="display: none;">
            <i class="bi bi-check-circle"></i> Crear Clase
          </button>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  const tabButtons = modal.querySelectorAll('[role="tab"]')
  const createButton = modal.querySelector('#btn-crear-clase')
  const createForm = modal.querySelector('#crear-clase-form')
  const createError = modal.querySelector('#crear-clase-error')
  const createErrorMsg = modal.querySelector('#crear-clase-error-message')

  // Handle tab switching
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabContent = btn.getAttribute('aria-controls')
      if (tabContent === 'clases-create') {
        createButton.style.display = 'inline-block'
      } else {
        createButton.style.display = 'none'
      }
    })
  })

  createButton.addEventListener('click', handleCrearClase)

  async function loadClases() {
    try {
      const listContainer = modal.querySelector('#clases-container')
      const loadingDiv = modal.querySelector('#clases-loading')
      const emptyDiv = modal.querySelector('#clases-empty')
      const errorDiv = modal.querySelector('#clases-error')

      loadingDiv.style.display = 'block'
      listContainer.style.display = 'none'
      emptyDiv.style.display = 'none'
      errorDiv.style.display = 'none'

      const { data, error } = await supabase
        .from('clases')
        .select('*')
        .eq('maestro_id', maestroId)
        .order('creado_en', { ascending: false })

      if (error) throw error

      clasesList = data || []
      loadingDiv.style.display = 'none'

      if (clasesList.length === 0) {
        emptyDiv.style.display = 'block'
      } else {
        listContainer.innerHTML = renderClasesList(clasesList)
        listContainer.style.display = 'block'
        attachClasesListeners(listContainer)
      }
    } catch (err) {
      console.error('[gestionarClasesModal] Error loading clases:', err)
      const errorDiv = modal.querySelector('#clases-error')
      const errorMsg = modal.querySelector('#clases-error-message')
      errorMsg.textContent = err.message || 'Error al cargar las clases'
      errorDiv.style.display = 'block'
      modal.querySelector('#clases-loading').style.display = 'none'
    }
  }

  function renderClasesList(clases) {
    return `
      <div class="list-group">
        ${clases.map(clase => `
          <div class="list-group-item" data-clase-id="${clase.id}">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="mb-1 fw-bold">${clase.nombre}</h6>
                <p class="mb-1 text-muted small">
                  <i class="bi bi-code"></i> ${clase.codigo}
                </p>
                ${clase.descripcion ? `<p class="mb-1 small">${clase.descripcion}</p>` : ''}
                ${clase.horario ? `<p class="mb-1 small"><i class="bi bi-clock"></i> ${clase.horario}</p>` : ''}
                ${clase.ubicacion ? `<p class="mb-0 small"><i class="bi bi-geo-alt"></i> ${clase.ubicacion}</p>` : ''}
              </div>
              <div class="btn-group-sm" role="group">
                <button type="button" class="btn btn-sm btn-outline-primary btn-editar" data-clase-id="${clase.id}">
                  <i class="bi bi-pencil"></i>
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar" data-clase-id="${clase.id}">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `
  }

  function attachClasesListeners(container) {
    container.querySelectorAll('.btn-eliminar').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const claseId = btn.getAttribute('data-clase-id')
        if (confirm('¿Estás seguro de que quieres eliminar esta clase?')) {
          await deleteClase(claseId)
        }
      })
    })

    container.querySelectorAll('.btn-editar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const claseId = btn.getAttribute('data-clase-id')
        // TODO: Implement edit functionality
        alert('Funcionalidad de edición próximamente')
      })
    })
  }

  async function deleteClase(claseId) {
    try {
      const { error } = await supabase
        .from('clases')
        .delete()
        .eq('id', claseId)
        .eq('maestro_id', maestroId)

      if (error) throw error

      window.dispatchEvent(new CustomEvent('showToast', {
        detail: { message: 'Clase eliminada exitosamente', type: 'success' }
      }))

      await loadClases()
    } catch (err) {
      console.error('[gestionarClasesModal] Error deleting clase:', err)
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: { message: 'Error al eliminar la clase', type: 'danger' }
      }))
    }
  }

  async function handleCrearClase() {
    let originalText = ''
    try {
      if (!createForm.checkValidity()) {
        createForm.reportValidity()
        return
      }

      createButton.disabled = true
      originalText = createButton.innerHTML
      createButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creando...'

      const formData = {
        maestro_id: maestroId,
        nombre: modal.querySelector('#clase-nombre').value.trim(),
        codigo: modal.querySelector('#clase-codigo').value.trim(),
        descripcion: modal.querySelector('#clase-descripcion').value.trim() || null,
        horario: modal.querySelector('#clase-horario').value.trim() || null,
        ubicacion: modal.querySelector('#clase-ubicacion').value.trim() || null,
        creado_en: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('clases')
        .insert([formData])
        .select()
        .single()

      if (error) throw error

      // Reset form
      createForm.reset()
      createError.classList.add('d-none')

      // Dispatch event
      window.dispatchEvent(new CustomEvent('clase-creada', {
        detail: { clase: data }
      }))

      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          message: `Clase "${formData.nombre}" creada exitosamente`,
          type: 'success'
        }
      }))

      // Switch to list tab
      const listTab = modal.querySelector('#clases-list-tab')
      const tab = new bootstrap.Tab(listTab)
      tab.show()

      await loadClases()

    } catch (err) {
      console.error('[gestionarClasesModal] Error:', err)
      createErrorMsg.textContent = err.message || 'Error al crear la clase'
      createError.classList.remove('d-none')
    } finally {
      createButton.disabled = false
      if (originalText) {
        createButton.innerHTML = originalText
      }
    }
  }

  return {
    show(maestro_id) {
      maestroId = maestro_id
      const bsModal = new bootstrap.Modal(modal)
      bsModal.show()
      isOpen = true
      loadClases()
    },

    hide() {
      const bsModal = bootstrap.Modal.getInstance(modal)
      bsModal?.hide()
      isOpen = false
    },

    destroy() {
      modal.remove()
    },

    isOpen() {
      return isOpen
    }
  }
}
