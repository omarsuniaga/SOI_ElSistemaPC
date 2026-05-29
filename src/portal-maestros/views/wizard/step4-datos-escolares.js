/**
 * Step 4 — Datos Escolares
 */
import { renderFormField } from '../../components/wizard/FormField.js'
import { validarPaso4 } from '../../../modules/alumnos/domain/inscripcionValidators.js'

export const id = 'step4'
export const title = 'Datos Escolares'

/**
 * @param {object} draft
 * @param {object} [errors]
 * @returns {string} HTML string
 */
export function render(draft, errors = {}) {
  return `
    <form id="wiz-form-step4" novalidate>
      ${renderFormField({ name: 'centro_estudios', label: 'Centro de estudios', type: 'text', value: draft.centro_estudios ?? '', error: errors.centro_estudios ?? '', required: true })}
      ${renderFormField({ name: 'grado_nivel', label: 'Grado o nivel', type: 'text', value: draft.grado_nivel ?? '', error: errors.grado_nivel ?? '', required: true })}
      ${renderFormField({
        name: 'padres_en_vida',
        label: 'Padres en vida',
        type: 'select',
        value: draft.padres_en_vida ?? '',
        error: errors.padres_en_vida ?? '',
        required: true,
        options: [
          { value: 'ambos', label: 'Ambos' },
          { value: 'solo_madre', label: 'Solo madre' },
          { value: 'solo_padre', label: 'Solo padre' },
          { value: 'ninguno', label: 'Ninguno' },
        ],
      })}
    </form>`
}

/**
 * @param {object} draft
 * @returns {{ valid: boolean, errors: object }}
 */
export function validate(draft) {
  return validarPaso4(draft)
}

/**
 * @param {HTMLElement} container
 * @returns {object}
 */
export function getState(container) {
  const form = container?.querySelector('#wiz-form-step4')
  if (!form) return {}

  return {
    centro_estudios: form.querySelector('[name="centro_estudios"]')?.value?.trim() ?? '',
    grado_nivel: form.querySelector('[name="grado_nivel"]')?.value?.trim() ?? '',
    padres_en_vida: form.querySelector('[name="padres_en_vida"]')?.value ?? '',
  }
}
