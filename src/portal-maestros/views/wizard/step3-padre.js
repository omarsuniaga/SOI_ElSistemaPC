/**
 * Step 3 — Datos del Padre
 */
import { renderFormField } from '../../components/wizard/FormField.js'

export const id = 'step3'
export const title = 'Datos del Padre'

export function render(draft, errors = {}) {
  return `
    <form id="wiz-form-step3" novalidate>
      <div class="alert alert-secondary py-2 mb-3">
        <i class="bi bi-person-heart me-1"></i>
        Ingresa los datos del padre del alumno tal como aparecen en su documento de identidad.
        Si el padre no está en vida o no aplica, puedes dejar estos campos vacíos.
      </div>

      ${renderFormField({ name: 'padre_nombre', label: 'Nombre y apellido completo del padre', type: 'text', value: draft.padre_nombre ?? '', error: errors.padre_nombre ?? '', hint: 'Tal como aparece en la cédula' })}
      ${renderFormField({ name: 'padre_cedula', label: 'Cédula / Pasaporte / Documento de identidad', type: 'text', value: draft.padre_cedula ?? '', error: errors.padre_cedula ?? '', hint: 'En su defecto, número de pasaporte o documento nacional' })}
      ${renderFormField({ name: 'padre_tlf_whatsapp', label: 'Número de WhatsApp del padre', type: 'tel', value: draft.padre_tlf_whatsapp ?? '', error: errors.padre_tlf_whatsapp ?? '', hint: 'Número con código de país, Ej: +1 829 000 0000' })}
    </form>`
}

export function validate(_draft) {
  return { valid: true, errors: {} }
}

export function getState(container) {
  const form = container?.querySelector('#wiz-form-step3')
  if (!form) return {}
  return {
    padre_nombre: form.querySelector('[name="padre_nombre"]')?.value?.trim() ?? '',
    padre_cedula: form.querySelector('[name="padre_cedula"]')?.value?.trim() ?? '',
    padre_tlf_whatsapp: form.querySelector('[name="padre_tlf_whatsapp"]')?.value?.trim() ?? '',
  }
}
