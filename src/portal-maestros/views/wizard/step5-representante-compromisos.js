/**
 * Step 5 — Representante y Compromisos
 * Both acepta_beca_4500 and acepta_pago_600 must be checked to submit.
 */
import { renderFormField } from '../../components/wizard/FormField.js'
import { validarPaso5 } from '../../../modules/alumnos/domain/inscripcionValidators.js'

export const id = 'step5'
export const title = 'Representante y Compromisos'

/**
 * @param {object} draft
 * @param {object} [errors]
 * @returns {string} HTML string
 */
export function render(draft, errors = {}) {
  return `
    <form id="wiz-form-step5" novalidate>
      <h6 class="text-muted mb-3">Datos del representante</h6>
      ${renderFormField({ name: 'representante_nombre', label: 'Nombre del representante', type: 'text', value: draft.representante_nombre ?? '', error: errors.representante_nombre ?? '', required: true })}
      ${renderFormField({ name: 'representante_parentesco', label: 'Parentesco', type: 'text', value: draft.representante_parentesco ?? '', error: errors.representante_parentesco ?? '', required: true })}
      ${renderFormField({ name: 'representante_tlf', label: 'Teléfono del representante', type: 'tel', value: draft.representante_tlf ?? '', error: errors.representante_tlf ?? '', required: true })}
      ${renderFormField({ name: 'representante_cedula', label: 'Cédula del representante', type: 'text', value: draft.representante_cedula ?? '', error: errors.representante_cedula ?? '', required: true })}

      <hr>
      <h6 class="text-muted mb-3">Compromisos económicos</h6>
      <div class="alert alert-warning">
        <p class="mb-2"><strong>Beca:</strong> El programa tiene un valor real de <strong>RD$5,150.00 mensuales</strong> y otorga una beca de <strong>RD$4,500.00 mensuales (87% cubierto)</strong>, sujeta a rendimiento, interés y asistencia notable.</p>
        <p class="mb-0"><strong>Aporte mensual:</strong> Puede elegir <strong>RD$650.00 cada mes</strong> o un <strong>pago semestral adelantado de RD$3,600.00 en enero</strong> por enero a junio (RD$600.00 por mes y ahorro de RD$300.00 en el semestre).</p>
      </div>
      ${renderFormField({
        name: 'acepta_beca_4500',
        label: 'Acepto y entiendo los términos de la beca de RD$4,500.00 mensuales (87% cubierto)',
        type: 'checkbox',
        value: draft.acepta_beca_4500 ?? false,
        error: errors.acepta_beca_4500 ?? '',
      })}
      ${renderFormField({
        name: 'acepta_pago_600',
        label: 'Me comprometo a cubrir el aporte restante: RD$650.00 cada mes o RD$3,600.00 por adelantado en enero por enero a junio',
        type: 'checkbox',
        value: draft.acepta_pago_600 ?? false,
        error: errors.acepta_pago_600 ?? '',
      })}
    </form>`
}

/**
 * @param {object} draft
 * @returns {{ valid: boolean, errors: object }}
 */
export function validate(draft) {
  return validarPaso5(draft)
}

/**
 * @param {HTMLElement} container
 * @returns {object}
 */
export function getState(container) {
  const form = container?.querySelector('#wiz-form-step5')
  if (!form) return {}

  return {
    representante_nombre: form.querySelector('[name="representante_nombre"]')?.value?.trim() ?? '',
    representante_parentesco: form.querySelector('[name="representante_parentesco"]')?.value?.trim() ?? '',
    representante_tlf: form.querySelector('[name="representante_tlf"]')?.value?.trim() ?? '',
    representante_cedula: form.querySelector('[name="representante_cedula"]')?.value?.trim() ?? '',
    acepta_beca_4500: form.querySelector('[name="acepta_beca_4500"]')?.checked ?? false,
    acepta_pago_600: form.querySelector('[name="acepta_pago_600"]')?.checked ?? false,
  }
}
