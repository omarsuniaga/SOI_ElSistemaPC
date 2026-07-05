/**
 * wizardInscripcionAlumnoView — Wizard de inscripción de alumnos, 7 pasos.
 */

import { mountWizard } from '../components/wizard/WizardShell.js'
import { crearAlumno } from '../../modules/alumnos/api/alumnosApi.js'

import * as step1 from './wizard/step1-datos-personales.js'
import * as step2 from './wizard/step2-madre.js'
import * as step3 from './wizard/step3-padre.js'
import * as step4 from './wizard/step4-familia-social.js'
import * as step5 from './wizard/step7-compromisos.js'      // compromisos = inscripción básica completa
import * as step6 from './wizard/step5-perfil-musical.js'  // opcional — completar después
import * as step7 from './wizard/step6-salud-escolar.js'   // opcional — completar después

// Pasos 1-5: inscripción obligatoria. Pasos 6-7: perfil opcional.
const STEP_MODULES = [step1, step2, step3, step4, step5, step6, step7]
export const PASOS_OBLIGATORIOS = 5

/**
 * @param {HTMLElement} container
 */
export async function renderWizardInscripcionAlumnoView(container) {
  // Layout: fixed header + wizard mount area (wizard overwrites its own container on each step)
  container.innerHTML = `
    <div class="d-flex align-items-center gap-3 px-3 py-2 bg-white border-bottom" id="inscribir-header">
      <button class="btn btn-sm btn-outline-secondary" id="btn-inscribir-back">
        <i class="bi bi-arrow-left"></i> Volver
      </button>
      <div class="flex-grow-1">
        <div class="fw-semibold small text-muted text-uppercase" style="letter-spacing:0.05em;">Inscribir alumno</div>
        <div class="fs-6 fw-bold" id="inscribir-alumno-name">Nuevo alumno</div>
      </div>
    </div>
    <div id="inscribir-wizard-mount"></div>
  `

  const wizardMount = container.querySelector('#inscribir-wizard-mount')
  const nameEl = container.querySelector('#inscribir-alumno-name')

  container.querySelector('#btn-inscribir-back')?.addEventListener('click', () => {
    window.router?.back?.() || window.router?.navigate('alumnos')
  })

  // Update header name as the user types in step 1
  wizardMount.addEventListener('input', () => {
    const val = wizardMount.querySelector('[name="nombre_completo"]')?.value?.trim()
    if (nameEl) nameEl.textContent = val || 'Nuevo alumno'
  })

  async function handleSubmit(draft) {
    const alumno = await crearAlumno(draft)
    return alumno
  }

  mountWizard(wizardMount, STEP_MODULES, handleSubmit, PASOS_OBLIGATORIOS)
}
