/**
 * Step 1 — Datos del Alumno
 */
import { renderFormField } from '../../components/wizard/FormField.js'
import { validarPaso1 } from '../../../modules/alumnos/domain/inscripcionValidators.js'
import { calcularEdad } from '../../../modules/alumnos/domain/calcularEdad.js'

export const id = 'step1'
export const title = 'Datos del Alumno'

export function render(draft, errors = {}) {
  const edad = draft.fecha_nacimiento
    ? (() => {
        try {
          return calcularEdad(draft.fecha_nacimiento)
        } catch {
          return ''
        }
      })()
    : ''

  return `
    <form id="wiz-form-step1" novalidate>
      ${renderFormField({ name: 'nombre_completo', label: 'Nombre completo del alumno', type: 'text', value: draft.nombre_completo ?? '', error: errors.nombre_completo ?? '', required: true, hint: 'Tal como aparece en el documento de identidad' })}

      <div class="row g-2">
        <div class="col-sm-8">
          ${renderFormField({ name: 'fecha_nacimiento', label: 'Fecha de nacimiento', type: 'date', value: draft.fecha_nacimiento ?? '', error: errors.fecha_nacimiento ?? '', required: true })}
        </div>
        <div class="col-sm-4">
          ${renderFormField({ name: 'edad_display', label: 'Edad actual', type: 'text', value: edad !== '' ? edad + ' años' : '—', readOnly: true })}
        </div>
      </div>

      <div class="row g-2 mb-3">
        <div class="col-6">
          ${renderFormField({
            name: 'sabe_leer',
            label: '¿Sabe leer?',
            type: 'radio',
            value: draft.sabe_leer === true ? 'true' : draft.sabe_leer === false ? 'false' : '',
            options: [
              { value: 'true', label: 'Sí' },
              { value: 'false', label: 'No' },
            ],
          })}
        </div>
        <div class="col-6">
          ${renderFormField({
            name: 'sabe_escribir',
            label: '¿Sabe escribir?',
            type: 'radio',
            value:
              draft.sabe_escribir === true ? 'true' : draft.sabe_escribir === false ? 'false' : '',
            options: [
              { value: 'true', label: 'Sí' },
              { value: 'false', label: 'No' },
            ],
          })}
        </div>
      </div>

      <div class="row g-2">
        <div class="col-sm-8">
          ${renderFormField({ name: 'nacionalidad', label: 'Nacionalidad', type: 'text', value: draft.nacionalidad ?? '', error: errors.nacionalidad ?? '', required: true })}
        </div>
        <div class="col-sm-4">
          ${renderFormField({ name: 'tiene_pasaporte', label: '¿Tiene pasaporte?', type: 'checkbox', value: draft.tiene_pasaporte ?? false })}
        </div>
      </div>

      ${renderFormField({
        name: 'como_se_entero',
        label: '¿Cómo se enteró de El Sistema Punta Cana?',
        type: 'select',
        value: draft.como_se_entero ?? '',
        error: errors.como_se_entero ?? '',
        required: true,
        options: [
          { value: '', label: 'Selecciona una opción...' },
          { value: 'amigo_familiar', label: 'Un amigo o familiar' },
          { value: 'redes_sociales', label: 'Redes sociales' },
          { value: 'colegio', label: 'Colegio / Escuela' },
          { value: 'iglesia', label: 'Iglesia' },
          { value: 'vecino', label: 'Un vecino' },
          { value: 'otro', label: 'Otro' },
        ],
      })}

      ${renderFormField({
        name: 'municipio_residencia',
        label: 'Municipio de residencia',
        type: 'select',
        value: draft.municipio_residencia ?? '',
        error: errors.municipio_residencia ?? '',
        required: true,
        options: [
          { value: '', label: 'Selecciona...' },
          { value: 'punta_cana', label: 'Punta Cana' },
          { value: 'bavaro', label: 'Bávaro' },
          { value: 'veron', label: 'Verón' },
          { value: 'friusa', label: 'Friusa' },
          { value: 'el_cortecito', label: 'El Cortecito' },
          { value: 'los_corales', label: 'Los Corales' },
          { value: 'otro', label: 'Otro sector / municipio' },
        ],
      })}

      <div id="sector-calle-block" style="${draft.municipio_residencia === 'otro' ? '' : 'display:none'}">
        ${renderFormField({ name: 'sector_calle_numero', label: 'Sector, Calle y Número', type: 'text', value: draft.sector_calle_numero ?? '', error: errors.sector_calle_numero ?? '', hint: 'Ej: Sector Los Pinos, Calle 3, #14' })}
      </div>

      ${renderFormField({ name: 'direccion', label: 'Dirección completa', type: 'textarea', value: draft.direccion ?? '', error: errors.direccion ?? '', required: true })}
      ${renderFormField({ name: 'ubicacion_maps_url', label: 'Enlace de Google Maps (opcional)', type: 'text', value: draft.ubicacion_maps_url ?? '', error: errors.ubicacion_maps_url ?? '', hint: 'Copia el enlace desde Google Maps para la ubicación exacta del hogar' })}
    </form>

    <script>
    (function() {
      const fechaEl = document.querySelector('[name="fecha_nacimiento"]')
      const edadEl = document.getElementById('wiz-edad_display')
      const municipioEl = document.querySelector('[name="municipio_residencia"]')
      const sectorBlock = document.getElementById('sector-calle-block')

      if (fechaEl && edadEl) {
        fechaEl.addEventListener('change', function() {
          try {
            const y = parseInt(this.value.slice(0,4)), m = parseInt(this.value.slice(5,7))-1, d = parseInt(this.value.slice(8,10))
            const today = new Date()
            let age = today.getFullYear() - y
            if (today.getMonth() < m || (today.getMonth() === m && today.getDate() < d)) age--
            edadEl.value = age >= 0 ? age + ' años' : '—'
          } catch { edadEl.value = '—' }
        })
      }
      if (municipioEl && sectorBlock) {
        municipioEl.addEventListener('change', function() {
          sectorBlock.style.display = this.value === 'otro' ? '' : 'none'
        })
      }
    })()
    </script>`
}

export function validate(draft) {
  return validarPaso1(draft)
}

export function getState(container) {
  const form = container?.querySelector('#wiz-form-step1')
  if (!form) return {}

  const boolRadio = (name) => {
    const el = form.querySelector(`[name="${name}"]:checked`)
    if (!el) return undefined
    return el.value === 'true'
  }

  return {
    nombre_completo: form.querySelector('[name="nombre_completo"]')?.value?.trim() ?? '',
    fecha_nacimiento: form.querySelector('[name="fecha_nacimiento"]')?.value ?? '',
    sabe_leer: boolRadio('sabe_leer'),
    sabe_escribir: boolRadio('sabe_escribir'),
    nacionalidad: form.querySelector('[name="nacionalidad"]')?.value?.trim() ?? '',
    tiene_pasaporte: form.querySelector('[name="tiene_pasaporte"]')?.checked ?? false,
    como_se_entero: form.querySelector('[name="como_se_entero"]')?.value ?? '',
    municipio_residencia: form.querySelector('[name="municipio_residencia"]')?.value ?? '',
    sector_calle_numero: form.querySelector('[name="sector_calle_numero"]')?.value?.trim() ?? '',
    direccion: form.querySelector('[name="direccion"]')?.value?.trim() ?? '',
    ubicacion_maps_url: form.querySelector('[name="ubicacion_maps_url"]')?.value?.trim() ?? '',
  }
}
