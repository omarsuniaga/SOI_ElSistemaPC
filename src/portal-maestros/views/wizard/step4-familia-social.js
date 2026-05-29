/**
 * Step 4 — Representante, Familia y Entorno Social
 */
import { renderFormField } from '../../components/wizard/FormField.js'

export const id = 'step4'
export const title = 'Representante y Entorno'

export function render(draft, errors = {}) {
  const tieneSubsidio = draft.beneficiario_subsidio_estado === true

  return `
    <form id="wiz-form-step4" novalidate>

      <h6 class="fw-semibold text-primary mb-3"><i class="bi bi-person-check me-1"></i>Representante oficial ante El Sistema PC</h6>
      ${renderFormField({ name: 'representante_nombre', label: 'Nombre y apellido completo', type: 'text', value: draft.representante_nombre ?? '', error: errors.representante_nombre ?? '', required: true, hint: 'Tal como aparece en la cédula' })}
      <div class="row g-2">
        <div class="col-sm-6">
          ${renderFormField({ name: 'representante_parentesco', label: 'Parentesco con el alumno', type: 'text', value: draft.representante_parentesco ?? '', error: errors.representante_parentesco ?? '', required: true })}
        </div>
        <div class="col-sm-6">
          ${renderFormField({ name: 'representante_cedula', label: 'Cédula / Pasaporte', type: 'text', value: draft.representante_cedula ?? '', error: errors.representante_cedula ?? '', required: true })}
        </div>
      </div>
      ${renderFormField({ name: 'representante_tlf', label: 'Teléfono / WhatsApp del representante', type: 'tel', value: draft.representante_tlf ?? '', error: errors.representante_tlf ?? '', required: true })}

      <hr class="my-3">
      <h6 class="fw-semibold text-secondary mb-3"><i class="bi bi-person-plus me-1"></i>Otro responsable (opcional)</h6>
      ${renderFormField({ name: 'otro_responsable_nombre', label: 'Nombre y apellido completo', type: 'text', value: draft.otro_responsable_nombre ?? '', error: errors.otro_responsable_nombre ?? '', hint: 'Tal como aparece en la cédula' })}
      <div class="row g-2">
        <div class="col-sm-6">
          ${renderFormField({ name: 'otro_responsable_cedula', label: 'Cédula / Pasaporte', type: 'text', value: draft.otro_responsable_cedula ?? '', error: errors.otro_responsable_cedula ?? '' })}
        </div>
        <div class="col-sm-6">
          ${renderFormField({ name: 'otro_responsable_tlf', label: 'Teléfono (si tiene)', type: 'tel', value: draft.otro_responsable_tlf ?? '', error: errors.otro_responsable_tlf ?? '' })}
        </div>
      </div>

      <hr class="my-3">
      <h6 class="fw-semibold text-secondary mb-3"><i class="bi bi-telephone-fill me-1"></i>Contactos de emergencia</h6>
      <div class="row g-2">
        <div class="col-sm-8">
          ${renderFormField({ name: 'contacto_emergencia_nombre', label: 'Contacto de emergencia #1', type: 'text', value: draft.contacto_emergencia_nombre ?? '' })}
        </div>
        <div class="col-sm-4">
          ${renderFormField({ name: 'contacto_emergencia_telefono', label: 'Teléfono', type: 'tel', value: draft.contacto_emergencia_telefono ?? '' })}
        </div>
      </div>
      <div class="row g-2">
        <div class="col-sm-8">
          ${renderFormField({ name: 'contacto_emergencia_2_nombre', label: 'Contacto de emergencia #2', type: 'text', value: draft.contacto_emergencia_2_nombre ?? '' })}
        </div>
        <div class="col-sm-4">
          ${renderFormField({ name: 'contacto_emergencia_2_telefono', label: 'Teléfono', type: 'tel', value: draft.contacto_emergencia_2_telefono ?? '' })}
        </div>
      </div>

      <hr class="my-3">
      <h6 class="fw-semibold text-secondary mb-3"><i class="bi bi-house-heart me-1"></i>Situación familiar y social</h6>

      ${renderFormField({ name: 'familia_monoparental', label: '¿El alumno pertenece a una familia monoparental (sin padre o sin madre)?', type: 'radio', value: draft.familia_monoparental === true ? 'true' : draft.familia_monoparental === false ? 'false' : '', options: [{ value: 'true', label: 'Sí' }, { value: 'false', label: 'No' }] })}

      ${renderFormField({ name: 'beneficiario_subsidio_estado', label: '¿Algún miembro del hogar es beneficiario de un subsidio del Estado?', type: 'radio', value: tieneSubsidio ? 'true' : draft.beneficiario_subsidio_estado === false ? 'false' : '', options: [{ value: 'true', label: 'Sí' }, { value: 'false', label: 'No' }] })}

      <div id="subsidio-block" style="${tieneSubsidio ? '' : 'display:none'}">
        ${renderFormField({ name: 'subsidio_descripcion', label: '¿Qué tipo de subsidio? (adjunte prueba de beneficio al momento de inscripción)', type: 'textarea', value: draft.subsidio_descripcion ?? '', hint: 'Ej: Supérate, Progresando con Solidaridad, SIUBEN...' })}
      </div>

      ${renderFormField({ name: 'apoyo_actividades', label: '¿De qué forma el hogar podría apoyar las actividades de El Sistema Punta Cana?', type: 'textarea', value: draft.apoyo_actividades ?? '', hint: 'Ej: transporte, logística, voluntariado, donaciones, etc.' })}
    </form>

    <script>
    (function() {
      const subsidioRadios = document.querySelectorAll('[name="beneficiario_subsidio_estado"]')
      const subsidioBlock = document.getElementById('subsidio-block')
      subsidioRadios.forEach(function(r) {
        r.addEventListener('change', function() {
          if (subsidioBlock) subsidioBlock.style.display = this.value === 'true' ? '' : 'none'
        })
      })
    })()
    </script>`
}

export function validate(draft) {
  const errors = {}
  if (!draft.representante_nombre?.trim()) errors.representante_nombre = 'Campo requerido'
  if (!draft.representante_parentesco?.trim()) errors.representante_parentesco = 'Campo requerido'
  if (!draft.representante_cedula?.trim()) errors.representante_cedula = 'Campo requerido'
  if (!draft.representante_tlf?.trim()) errors.representante_tlf = 'Campo requerido'
  return { valid: Object.keys(errors).length === 0, errors }
}

export function getState(container) {
  const form = container?.querySelector('#wiz-form-step4')
  if (!form) return {}

  const boolRadio = (name) => {
    const el = form.querySelector(`[name="${name}"]:checked`)
    if (!el) return undefined
    return el.value === 'true'
  }

  return {
    representante_nombre: form.querySelector('[name="representante_nombre"]')?.value?.trim() ?? '',
    representante_parentesco: form.querySelector('[name="representante_parentesco"]')?.value?.trim() ?? '',
    representante_cedula: form.querySelector('[name="representante_cedula"]')?.value?.trim() ?? '',
    representante_tlf: form.querySelector('[name="representante_tlf"]')?.value?.trim() ?? '',
    otro_responsable_nombre: form.querySelector('[name="otro_responsable_nombre"]')?.value?.trim() ?? '',
    otro_responsable_cedula: form.querySelector('[name="otro_responsable_cedula"]')?.value?.trim() ?? '',
    otro_responsable_tlf: form.querySelector('[name="otro_responsable_tlf"]')?.value?.trim() ?? '',
    contacto_emergencia_nombre: form.querySelector('[name="contacto_emergencia_nombre"]')?.value?.trim() ?? '',
    contacto_emergencia_telefono: form.querySelector('[name="contacto_emergencia_telefono"]')?.value?.trim() ?? '',
    contacto_emergencia_2_nombre: form.querySelector('[name="contacto_emergencia_2_nombre"]')?.value?.trim() ?? '',
    contacto_emergencia_2_telefono: form.querySelector('[name="contacto_emergencia_2_telefono"]')?.value?.trim() ?? '',
    familia_monoparental: boolRadio('familia_monoparental'),
    beneficiario_subsidio_estado: boolRadio('beneficiario_subsidio_estado'),
    subsidio_descripcion: form.querySelector('[name="subsidio_descripcion"]')?.value?.trim() ?? '',
    apoyo_actividades: form.querySelector('[name="apoyo_actividades"]')?.value?.trim() ?? '',
  }
}
