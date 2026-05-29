/**
 * Step 2 — Perfil Musical
 * Conditional: instrumento_previo and nivel_lectura_musical only when tiene_conocimientos_musicales=true
 */
import { renderFormField } from '../../components/wizard/FormField.js'
import { validarPaso2 } from '../../../modules/alumnos/domain/inscripcionValidators.js'

export const id = 'step2'
export const title = 'Perfil Musical'

/**
 * @param {object} draft
 * @param {object} [errors]
 * @returns {string} HTML string
 */
export function render(draft, errors = {}) {
  const tieneConocimientos = draft.tiene_conocimientos_musicales === true

  const conditionalBlock = tieneConocimientos
    ? `
      <div data-visible-when="tiene_conocimientos_musicales=true">
        ${renderFormField({ name: 'instrumento_previo', label: 'Instrumento previo', type: 'text', value: draft.instrumento_previo ?? '', error: errors.instrumento_previo ?? '', required: true })}
        ${renderFormField({
          name: 'nivel_lectura_musical',
          label: 'Nivel de lectura musical',
          type: 'select',
          value: draft.nivel_lectura_musical ?? '',
          error: errors.nivel_lectura_musical ?? '',
          required: true,
          options: [
            { value: 'basico', label: 'Básico' },
            { value: 'intermedio', label: 'Intermedio' },
            { value: 'avanzado', label: 'Avanzado' },
          ],
        })}
      </div>`
    : `
      <div class="alert alert-info" role="note">
        <i class="bi bi-info-circle"></i>
        <strong>Iniciación musical requerida:</strong> El alumno deberá completar un período de iniciación musical de 6 meses antes de poder audicionarse.
      </div>`

  return `
    <form id="wiz-form-step2" novalidate>
      ${renderFormField({
        name: 'tiene_conocimientos_musicales',
        label: '¿Tiene conocimientos musicales previos?',
        type: 'radio',
        value: draft.tiene_conocimientos_musicales === true ? 'true' : draft.tiene_conocimientos_musicales === false ? 'false' : '',
        error: errors.tiene_conocimientos_musicales ?? '',
        required: true,
        options: [
          { value: 'true', label: 'Sí' },
          { value: 'false', label: 'No' },
        ],
      })}
      ${conditionalBlock}
      ${renderFormField({
        name: 'interes_musical',
        label: 'Interés musical',
        type: 'radio',
        value: draft.interes_musical ?? '',
        error: errors.interes_musical ?? '',
        required: true,
        options: [
          { value: 'cantar', label: 'Cantar' },
          { value: 'instrumento', label: 'Instrumento' },
          { value: 'ambas', label: 'Ambas' },
        ],
      })}
      ${renderFormField({ name: 'instrumento_interes', label: 'Instrumento de interés', type: 'text', value: draft.instrumento_interes ?? '', error: errors.instrumento_interes ?? '', required: true })}
    </form>`
}

/**
 * @param {object} draft
 * @returns {{ valid: boolean, errors: object }}
 */
export function validate(draft) {
  return validarPaso2(draft)
}

/**
 * @param {HTMLElement} container
 * @returns {object}
 */
export function getState(container) {
  const form = container?.querySelector('#wiz-form-step2')
  if (!form) return {}

  const tieneConocimientosEl = form.querySelector('[name="tiene_conocimientos_musicales"]:checked')
  const tieneConocimientos = tieneConocimientosEl
    ? tieneConocimientosEl.value === 'true'
    : undefined

  return {
    tiene_conocimientos_musicales: tieneConocimientos,
    instrumento_previo: form.querySelector('[name="instrumento_previo"]')?.value?.trim() ?? null,
    nivel_lectura_musical: form.querySelector('[name="nivel_lectura_musical"]')?.value ?? null,
    interes_musical: form.querySelector('[name="interes_musical"]:checked')?.value ?? '',
    instrumento_interes: form.querySelector('[name="instrumento_interes"]')?.value?.trim() ?? '',
  }
}
