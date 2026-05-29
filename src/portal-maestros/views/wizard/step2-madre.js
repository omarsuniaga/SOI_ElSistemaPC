/**
 * Step 2 — Datos de la Madre
 */
import { renderFormField } from '../../components/wizard/FormField.js'

export const id = 'step2'
export const title = 'Datos de la Madre'

export function render(draft, errors = {}) {
  return `
    <form id="wiz-form-step2" novalidate>
      <div class="alert alert-secondary py-2 mb-3">
        <i class="bi bi-person-heart me-1"></i>
        Ingresa los datos de la madre del alumno tal como aparecen en su documento de identidad.
        Si la madre no está en vida o no aplica, puedes dejar estos campos vacíos.
      </div>

      ${renderFormField({ name: 'madre_nombre', label: 'Nombre y apellido completo de la madre', type: 'text', value: draft.madre_nombre ?? '', error: errors.madre_nombre ?? '', hint: 'Tal como aparece en la cédula' })}
      ${renderFormField({ name: 'madre_cedula', label: 'Cédula / Pasaporte / Documento de identidad', type: 'text', value: draft.madre_cedula ?? '', error: errors.madre_cedula ?? '', hint: 'En su defecto, número de pasaporte o documento nacional' })}
      ${renderFormField({ name: 'madre_tlf_whatsapp', label: 'Número de WhatsApp de la madre', type: 'tel', value: draft.madre_tlf_whatsapp ?? '', error: errors.madre_tlf_whatsapp ?? '', hint: 'Número con código de país, Ej: +1 829 000 0000' })}
    </form>`
}

export function validate(_draft) {
  return { valid: true, errors: {} }
}

export function getState(container) {
  const form = container?.querySelector('#wiz-form-step2')
  if (!form) return {}
  return {
    madre_nombre: form.querySelector('[name="madre_nombre"]')?.value?.trim() ?? '',
    madre_cedula: form.querySelector('[name="madre_cedula"]')?.value?.trim() ?? '',
    madre_tlf_whatsapp: form.querySelector('[name="madre_tlf_whatsapp"]')?.value?.trim() ?? '',
  }
}
