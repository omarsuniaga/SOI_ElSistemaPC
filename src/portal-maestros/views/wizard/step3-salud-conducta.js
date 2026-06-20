/**
 * Step 3 — Salud y Conducta
 */
import { renderFormField } from '../../components/wizard/FormField.js'
import { validarPaso3 } from '../../../modules/alumnos/domain/inscripcionValidators.js'

export const id = 'step3'
export const title = 'Salud y Conducta'

/**
 * @param {object} draft
 * @param {object} [errors]
 * @returns {string} HTML string
 */
export function render(draft, errors = {}) {
  const tieneCondicion = draft.tiene_condicion_transmisible === true
  const tieneAlergiaMediacmento = draft.tiene_alergia_medicamento === true

  return `
    <form id="wiz-form-step3" novalidate>
      ${renderFormField({ name: 'tiene_alergias', label: '¿Tiene alergias?', type: 'radio', value: draft.tiene_alergias === true ? 'true' : draft.tiene_alergias === false ? 'false' : '', options: [{ value: 'true', label: 'Sí' }, { value: 'false', label: 'No' }] })}
      ${draft.tiene_alergias === true
        ? renderFormField({ name: 'alergias_descripcion', label: 'Descripción de alergias', type: 'textarea', value: draft.alergias_descripcion ?? '' })
        : ''}
      ${renderFormField({ name: 'tiene_condicion_transmisible', label: '¿Tiene condición transmisible?', type: 'radio', value: tieneCondicion ? 'true' : draft.tiene_condicion_transmisible === false ? 'false' : '', error: errors.tiene_condicion_transmisible ?? '', options: [{ value: 'true', label: 'Sí' }, { value: 'false', label: 'No' }] })}
      ${tieneCondicion
        ? `<div data-visible-when="tiene_condicion_transmisible=true">${renderFormField({ name: 'condicion_transmisible_descripcion', label: 'Descripción de la condición transmisible', type: 'textarea', value: draft.condicion_transmisible_descripcion ?? '', error: errors.condicion_transmisible_descripcion ?? '', required: true })}</div>`
        : ''}
      ${renderFormField({ name: 'tiene_alergia_medicamento', label: '¿Tiene alergia a medicamentos?', type: 'radio', value: tieneAlergiaMediacmento ? 'true' : draft.tiene_alergia_medicamento === false ? 'false' : '', options: [{ value: 'true', label: 'Sí' }, { value: 'false', label: 'No' }] })}
      ${tieneAlergiaMediacmento
        ? `<div data-visible-when="tiene_alergia_medicamento=true">${renderFormField({ name: 'alergia_medicamento_descripcion', label: 'Descripción de alergia a medicamento', type: 'textarea', value: draft.alergia_medicamento_descripcion ?? '', error: errors.alergia_medicamento_descripcion ?? '', required: true })}</div>`
        : ''}
      ${renderFormField({ name: 'impedimento_social', label: '¿Tiene impedimento social?', type: 'radio', value: draft.impedimento_social === true ? 'true' : draft.impedimento_social === false ? 'false' : '', options: [{ value: 'true', label: 'Sí' }, { value: 'false', label: 'No' }] })}
      ${renderFormField({
        name: 'problemas_conducta',
        label: 'Problemas de conducta',
        type: 'select',
        value: draft.problemas_conducta ?? 'no',
        error: errors.problemas_conducta ?? '',
        options: [
          { value: 'no', label: 'No' },
          { value: 'pocas_veces', label: 'Pocas veces' },
          { value: 'si', label: 'Sí' },
          { value: 'violento', label: 'Violento' },
        ],
      })}
    </form>`
}

/**
 * @param {object} draft
 * @returns {{ valid: boolean, errors: object }}
 */
export function validate(draft) {
  return validarPaso3(draft)
}

/**
 * @param {HTMLElement} container
 * @returns {object}
 */
export function getState(container) {
  const form = container?.querySelector('#wiz-form-step3')
  if (!form) return {}

  const boolField = (name) => {
    const el = form.querySelector(`[name="${name}"]:checked`)
    if (!el) return undefined
    return el.value === 'true'
  }

  return {
    tiene_alergias: boolField('tiene_alergias'),
    alergias_descripcion: form.querySelector('[name="alergias_descripcion"]')?.value?.trim() ?? null,
    tiene_condicion_transmisible: boolField('tiene_condicion_transmisible'),
    condicion_transmisible_descripcion: form.querySelector('[name="condicion_transmisible_descripcion"]')?.value?.trim() ?? null,
    tiene_alergia_medicamento: boolField('tiene_alergia_medicamento'),
    alergia_medicamento_descripcion: form.querySelector('[name="alergia_medicamento_descripcion"]')?.value?.trim() ?? null,
    impedimento_social: boolField('impedimento_social'),
    problemas_conducta: form.querySelector('[name="problemas_conducta"]')?.value ?? 'no',
  }
}
