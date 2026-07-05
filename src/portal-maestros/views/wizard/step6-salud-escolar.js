/**
 * Step 6 — Salud, Conducta y Datos Escolares
 */
import { renderFormField } from '../../components/wizard/FormField.js'

export const id = 'step6'
export const title = 'Salud y Educación'

export function render(draft, errors = {}) {
  const tieneAlergias = draft.tiene_alergias === true
  const tieneCondicion = draft.tiene_condicion_transmisible === true
  const tieneAlergiaMed = draft.tiene_alergia_medicamento === true

  return `
    <form id="wiz-form-step6" novalidate>

      <h6 class="fw-semibold text-primary mb-3"><i class="bi bi-heart-pulse me-1"></i>Información de salud</h6>

      ${renderFormField({ name: 'tiene_alergias', label: '¿El alumno es alérgico a algo?', type: 'radio', value: tieneAlergias ? 'true' : draft.tiene_alergias === false ? 'false' : '', options: [{ value: 'true', label: 'Sí' }, { value: 'false', label: 'No' }] })}
      <div id="alergias-block" style="${tieneAlergias ? '' : 'display:none'}">
        ${renderFormField({ name: 'alergias_descripcion', label: '¿A qué es alérgico?', type: 'textarea', value: draft.alergias_descripcion ?? '' })}
      </div>

      ${renderFormField({ name: 'tiene_condicion_transmisible', label: '¿El alumno padece alguna condición médica transmisible?', type: 'radio', value: tieneCondicion ? 'true' : draft.tiene_condicion_transmisible === false ? 'false' : '', options: [{ value: 'true', label: 'Sí' }, { value: 'false', label: 'No' }] })}
      <div id="condicion-block" style="${tieneCondicion ? '' : 'display:none'}">
        ${renderFormField({ name: 'condicion_transmisible_desc', label: '¿Cuál condición?', type: 'textarea', value: draft.condicion_transmisible_desc ?? '' })}
      </div>

      ${renderFormField({ name: 'tiene_alergia_medicamento', label: '¿El alumno es alérgico a algún medicamento?', type: 'radio', value: tieneAlergiaMed ? 'true' : draft.tiene_alergia_medicamento === false ? 'false' : '', options: [{ value: 'true', label: 'Sí' }, { value: 'false', label: 'No' }] })}
      <div id="med-block" style="${tieneAlergiaMed ? '' : 'display:none'}">
        ${renderFormField({ name: 'alergia_medicamento_desc', label: '¿A qué medicamento?', type: 'textarea', value: draft.alergia_medicamento_desc ?? '' })}
      </div>

      <hr class="my-3">
      <h6 class="fw-semibold text-secondary mb-3"><i class="bi bi-people me-1"></i>Socialización y conducta</h6>

      ${renderFormField({ name: 'impedimento_social', label: '¿El alumno tiene alguna condición especial que le impida socializar?', type: 'radio', value: draft.impedimento_social === true ? 'true' : draft.impedimento_social === false ? 'false' : '', options: [{ value: 'true', label: 'Sí' }, { value: 'false', label: 'No' }] })}

      ${renderFormField({
        name: 'problemas_conducta',
        label: '¿Presenta problemas de conducta?',
        type: 'select',
        value: draft.problemas_conducta ?? '',
        error: errors.problemas_conducta ?? '',
        options: [
          { value: '', label: 'Selecciona...' },
          { value: 'no', label: 'No presenta problemas' },
          { value: 'pocas_veces', label: 'Pocas veces' },
          { value: 'si', label: 'Sí' },
          { value: 'violento', label: 'Presenta conducta violenta' },
        ],
      })}

      <hr class="my-3">
      <h6 class="fw-semibold text-secondary mb-3"><i class="bi bi-book me-1"></i>Datos escolares</h6>

      ${renderFormField({ name: 'centro_estudios', label: '¿En dónde estudia actualmente?', type: 'text', value: draft.centro_estudios ?? '', error: errors.centro_estudios ?? '', hint: 'Nombre del colegio o escuela' })}
      ${renderFormField({ name: 'grado_nivel', label: 'Grado o nivel escolar', type: 'text', value: draft.grado_nivel ?? '', hint: 'Ej: 4to grado primaria, 2do bachillerato...' })}

      ${renderFormField({
        name: 'padres_en_vida',
        label: '¿Los dos padres del alumno están en vida?',
        type: 'select',
        value: draft.padres_en_vida ?? '',
        error: errors.padres_en_vida ?? '',
        options: [
          { value: '', label: 'Selecciona...' },
          { value: 'ambos', label: 'Sí, ambos' },
          { value: 'solo_madre', label: 'Solo la madre' },
          { value: 'solo_padre', label: 'Solo el padre' },
          { value: 'ninguno', label: 'Ninguno' },
        ],
      })}

    </form>

    <script>
    (function() {
      function toggle(radioName, blockId) {
        const radios = document.querySelectorAll('[name="' + radioName + '"]')
        const block = document.getElementById(blockId)
        if (!block) return
        radios.forEach(function(r) {
          r.addEventListener('change', function() {
            block.style.display = this.value === 'true' ? '' : 'none'
          })
        })
      }
      toggle('tiene_alergias', 'alergias-block')
      toggle('tiene_condicion_transmisible', 'condicion-block')
      toggle('tiene_alergia_medicamento', 'med-block')
    })()
    </script>`
}

export function validate(_draft) {
  return { valid: true, errors: {} }
}

export function getState(container) {
  const form = container?.querySelector('#wiz-form-step6')
  if (!form) return {}

  const boolRadio = (name) => {
    const el = form.querySelector(`[name="${name}"]:checked`)
    if (!el) return undefined
    return el.value === 'true'
  }

  return {
    tiene_alergias: boolRadio('tiene_alergias'),
    alergias_descripcion: form.querySelector('[name="alergias_descripcion"]')?.value?.trim() ?? '',
    tiene_condicion_transmisible: boolRadio('tiene_condicion_transmisible'),
    condicion_transmisible_desc: form.querySelector('[name="condicion_transmisible_desc"]')?.value?.trim() ?? '',
    tiene_alergia_medicamento: boolRadio('tiene_alergia_medicamento'),
    alergia_medicamento_desc: form.querySelector('[name="alergia_medicamento_desc"]')?.value?.trim() ?? '',
    impedimento_social: boolRadio('impedimento_social'),
    problemas_conducta: form.querySelector('[name="problemas_conducta"]')?.value ?? '',
    centro_estudios: form.querySelector('[name="centro_estudios"]')?.value?.trim() ?? '',
    grado_nivel: form.querySelector('[name="grado_nivel"]')?.value?.trim() ?? '',
    padres_en_vida: form.querySelector('[name="padres_en_vida"]')?.value ?? '',
  }
}
