/**
 * wizardInscripcionAlumnoView — Wizard de inscripción de alumnos, 7 pasos.
 */

import { getMaestroLocal } from '../auth/maestroAuth.js'
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
  const maestro = getMaestroLocal()

  if (!maestro) {
    container.innerHTML = `
      <div class="pm-settings-empty">
        <i class="bi bi-shield-lock"></i>
        <p>No hay sesión activa. Inicia sesión para continuar.</p>
      </div>`
    return
  }

  async function handleSubmit(draft) {
    const alumno = await crearAlumno(draft)
    return alumno
  }

  mountWizard(container, STEP_MODULES, handleSubmit, PASOS_OBLIGATORIOS)
}
