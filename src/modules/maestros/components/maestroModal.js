import { Modal } from 'bootstrap'
import { isValidEmail, validarNombre, getInstrumentos } from '../utils/maestrosUtils.js'

const VALIDATION = {
  nombreMax: 100,
  emailMax: 100,
  telefonoMax: 20,
  especialidadMax: 100,
  bioMax: 500,
}

export class MaestroModalManager {
  constructor() {
    this.modal = null
    this.formElement = null
    this.isEditing = false
    this.currentMaestroId = null
  }

  init(containerId = 'maestroModal') {
    const modalElement = document.getElementById(containerId)
    if (modalElement) {
      this.modal = new Modal(modalElement)
      this.formElement = document.getElementById('formMaestro')
      this.attachFormEvents()
    }
  }

  attachFormEvents() {
    if (!this.formElement) return

    const nombreInput = this.formElement.querySelector('#nombre')
    const emailInput = this.formElement.querySelector('#email')
    const bioInput = this.formElement.querySelector('#bio')

    if (nombreInput) {
      nombreInput.addEventListener('input', (e) => this.validateNombre(e.target))
    }

    if (emailInput) {
      emailInput.addEventListener('blur', (e) => this.validateEmail(e.target))
    }

    if (bioInput) {
      bioInput.addEventListener('input', (e) => this.updateBioCount(e.target))
    }
  }

  validateNombre(input) {
    const error = input.parentElement.querySelector('.invalid-feedback')
    if (!validarNombre(input.value)) {
      input.classList.add('is-invalid')
      if (error) {
        error.textContent = 'Nombre requerido (3-100 caracteres)'
      }
    } else {
      input.classList.remove('is-invalid')
      if (error) {
        error.textContent = ''
      }
    }
  }

  validateEmail(input) {
    const error = input.parentElement.querySelector('.invalid-feedback')
    if (input.value && !isValidEmail(input.value)) {
      input.classList.add('is-invalid')
      if (error) {
        error.textContent = 'Email inválido'
      }
    } else {
      input.classList.remove('is-invalid')
      if (error) {
        error.textContent = ''
      }
    }
  }

  updateBioCount(input) {
    const counter = input.parentElement.querySelector('.char-count')
    if (counter) {
      counter.textContent = `${input.value.length}/${VALIDATION.bioMax}`
    }
  }

  openForCreate() {
    this.isEditing = false
    this.currentMaestroId = null
    this.resetForm()
    const title = document.getElementById('modalTitulo')
    if (title) title.textContent = 'Nuevo Maestro'
    this.modal?.show()
  }

  openForEdit(maestro) {
    this.isEditing = true
    this.currentMaestroId = maestro.id
    this.populateForm(maestro)
    const title = document.getElementById('modalTitulo')
    if (title) title.textContent = `Editar: ${maestro.nombre}`
    this.modal?.show()
  }

  populateForm(maestro) {
    if (!this.formElement) return

    this.formElement.querySelector('#nombre').value = maestro.nombre || ''
    this.formElement.querySelector('#email').value = maestro.email || ''
    this.formElement.querySelector('#telefono').value = maestro.telefono || ''
    this.formElement.querySelector('#instrumento').value = maestro.instrumento || ''
    this.formElement.querySelector('#especialidad').value = maestro.especialidad || ''
    this.formElement.querySelector('#bio').value = maestro.bio || ''
    this.formElement.querySelector('#isActive').checked = maestro.is_active

    const bioCounter = this.formElement.querySelector('#bio').parentElement.querySelector('.char-count')
    if (bioCounter) {
      bioCounter.textContent = `${maestro.bio ? maestro.bio.length : 0}/${VALIDATION.bioMax}`
    }
  }

  resetForm() {
    if (!this.formElement) return
    this.formElement.reset()
    this.formElement.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'))
    const bioCounter = this.formElement.querySelector('.char-count')
    if (bioCounter) bioCounter.textContent = `0/${VALIDATION.bioMax}`
  }

  getFormData() {
    if (!this.formElement) return null

    return {
      nombre: this.formElement.querySelector('#nombre').value.trim(),
      email: this.formElement.querySelector('#email').value.trim(),
      telefono: this.formElement.querySelector('#telefono').value.trim(),
      instrumento: this.formElement.querySelector('#instrumento').value.trim(),
      especialidad: this.formElement.querySelector('#especialidad').value.trim(),
      bio: this.formElement.querySelector('#bio').value.trim(),
      is_active: this.formElement.querySelector('#isActive').checked,
    }
  }

  validateForm() {
    const data = this.getFormData()
    const errores = []

    if (!data.nombre) {
      errores.push('El nombre es obligatorio')
    } else if (data.nombre.length < 3) {
      errores.push('El nombre debe tener mínimo 3 caracteres')
    }

    if (!data.email) {
      errores.push('El email es obligatorio')
    } else if (!isValidEmail(data.email)) {
      errores.push('El email no es válido')
    }

    if (!data.instrumento) {
      errores.push('El instrumento es obligatorio')
    }

    return errores
  }

  close() {
    this.modal?.hide()
  }
}
