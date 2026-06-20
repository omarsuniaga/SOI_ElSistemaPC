/**
 * Modal para que maestros registren nuevos alumnos
 * Requiere permiso: puede_registrar_alumnos
 */

import { supabase } from '../../lib/supabaseClient.js'
import * as bootstrap from 'bootstrap'
import { sanitizeFormData } from '../../shared/utils/sanitize.js'
import { Validators } from '../../shared/utils/validators.js'

export function registrarAlumnoModal() {
  let isOpen = false
  let maestroId = null

  const modal = document.createElement('div')
  modal.id = 'registrar-alumno-modal'
  modal.className = 'modal modal-fade'
  modal.setAttribute('role', 'dialog')
  modal.setAttribute('aria-labelledby', 'registrar-alumno-title')
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-apple-primary text-white border-0">
          <h5 class="modal-title" id="registrar-alumno-title">
            <i class="bi bi-person-plus-fill"></i> Registrar Nuevo Alumno
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body">
          <form id="registrar-alumno-form">
            <div class="mb-3">
              <label for="alumno-nombre" class="form-label">Nombre Completo *</label>
              <input
                type="text"
                class="form-control"
                id="alumno-nombre"
                placeholder="Ej: Juan Pérez"
                required
              />
              <div class="form-text text-danger d-none" id="alumno-nombre-error"></div>
            </div>

            <div class="mb-3">
              <label for="alumno-apellido" class="form-label">Apellido *</label>
              <input
                type="text"
                class="form-control"
                id="alumno-apellido"
                placeholder="Ej: González"
                required
              />
              <div class="form-text text-danger d-none" id="alumno-apellido-error"></div>
            </div>

            <div class="mb-3">
              <label for="alumno-email" class="form-label">Email</label>
              <input
                type="email"
                class="form-control"
                id="alumno-email"
                placeholder="alumno@example.com"
              />
              <div class="form-text text-danger d-none" id="alumno-email-error"></div>
            </div>

            <div class="mb-3">
              <label for="alumno-dni" class="form-label">DNI</label>
              <input
                type="text"
                class="form-control"
                id="alumno-dni"
                placeholder="Ej: 12345678"
              />
              <div class="form-text text-danger d-none" id="alumno-dni-error"></div>
            </div>

            <div class="mb-3">
              <label for="alumno-tlf" class="form-label">Teléfono *</label>
              <input
                type="tel"
                class="form-control"
                id="alumno-tlf"
                placeholder="Ej: 8091234567"
                required
              />
              <div class="form-text text-danger d-none" id="alumno-tlf-error"></div>
            </div>

            <div class="mb-3">
              <label for="alumno-estado" class="form-label">Estado *</label>
              <select class="form-select" id="alumno-estado" required>
                <option value="">-- Seleccionar estado --</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="egresado">Egresado</option>
              </select>
              <div class="form-text text-danger d-none" id="alumno-estado-error"></div>
            </div>
          </form>

          <div id="registrar-alumno-error" class="alert alert-danger d-none mt-3" role="alert">
            <i class="bi bi-exclamation-circle"></i>
            <span id="registrar-alumno-error-message"></span>
          </div>
        </div>

        <div class="modal-footer border-0">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-apple-primary" id="btn-registrar-alumno">
            <i class="bi bi-check-circle"></i> Registrar
          </button>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  const formElement = modal.querySelector('#registrar-alumno-form')
  const submitBtn = modal.querySelector('#btn-registrar-alumno')
  const errorDiv = modal.querySelector('#registrar-alumno-error')
  const errorMsg = modal.querySelector('#registrar-alumno-error-message')

  submitBtn.addEventListener('click', async () => {
    if (!formElement.checkValidity()) {
      formElement.reportValidity()
      return
    }

    await handleRegistrarAlumno()
  })

  async function handleRegistrarAlumno() {
    let originalText = ''
    try {
      submitBtn.disabled = true
      originalText = submitBtn.innerHTML
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Registrando...'

      const raw = {
        nombre:     modal.querySelector('#alumno-nombre').value.trim(),
        apellido:   modal.querySelector('#alumno-apellido').value.trim(),
        correo:     modal.querySelector('#alumno-email').value.trim() || null,
        dni:        modal.querySelector('#alumno-dni').value.trim() || null,
        tlf_alumno: modal.querySelector('#alumno-tlf').value.trim() || null,
        estado:     modal.querySelector('#alumno-estado').value,
        creado_por: maestroId,
        creado_en:  new Date().toISOString(),
      }

      // Sanitize all free-text fields before validation and DB insert
      const formData = sanitizeFormData(raw, {
        nombre:     { maxLength: 100 },
        apellido:   { maxLength: 100 },
        correo:     { maxLength: 254 },
        dni:        { maxLength: 20 },
        tlf_alumno: { maxLength: 30 },
      })

      // Validate required fields and formats
      const errors = Validators.run([
        { test: () => Validators.required(formData.nombre),             message: 'El nombre es requerido.' },
        { test: () => Validators.length(formData.nombre, 2, 100),       message: 'El nombre debe tener entre 2 y 100 caracteres.' },
        { test: () => Validators.required(formData.apellido),           message: 'El apellido es requerido.' },
        { test: () => Validators.length(formData.apellido, 2, 100),     message: 'El apellido debe tener entre 2 y 100 caracteres.' },
        { test: () => Validators.required(formData.tlf_alumno),         message: 'El teléfono es requerido.' },
        { test: () => Validators.email(formData.correo),                message: 'El correo no tiene un formato válido.' },
        { test: () => !formData.dni || Validators.cedula(formData.dni), message: 'El DNI/Cédula solo puede contener dígitos (5-20).' },
        { test: () => Validators.required(formData.estado),             message: 'El estado es requerido.' },
      ])
      if (errors.length > 0) throw new Error(errors[0])

      // Insertar alumno
      const { data, error } = await supabase
        .from('alumnos')
        .insert([formData])
        .select()
        .single()

      if (error) throw error

      // Limpiar formulario y cerrar modal
      formElement.reset()
      errorDiv.classList.add('d-none')

      // Trigger event para actualizar lista de alumnos
      window.dispatchEvent(new CustomEvent('alumno-registrado', {
        detail: { alumno: data }
      }))

      // Mostrar toast
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          message: `Alumno "${formData.nombre} ${formData.apellido}" registrado exitosamente`,
          type: 'success'
        }
      }))

      // Cerrar modal
      const bsModal = bootstrap.Modal.getInstance(modal)
      bsModal?.hide()

    } catch (err) {
      console.error('[registrarAlumnoModal] Error:', err)
      errorMsg.textContent = err.message || 'Error al registrar el alumno'
      errorDiv.classList.remove('d-none')
    } finally {
      submitBtn.disabled = false
      if (originalText) {
        submitBtn.innerHTML = originalText
      }
    }
  }

  return {
    show(maestro_id) {
      maestroId = maestro_id
      const bsModal = new bootstrap.Modal(modal)
      bsModal.show()
      isOpen = true
      // Focus first input
      setTimeout(() => {
        modal.querySelector('#alumno-nombre').focus()
      }, 200)
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
