/**
 * Step 5 — Perfil Musical y Motivación
 */
import { renderFormField } from '../../components/wizard/FormField.js'

export const id = 'step5'
export const title = 'Perfil Musical'

export function render(draft, errors = {}) {
  const tieneConocimientos = draft.tiene_conocimientos_musicales === true

  return `
    <form id="wiz-form-step5" novalidate>

      <h6 class="fw-semibold text-primary mb-3"><i class="bi bi-music-note-beamed me-1"></i>Conocimientos musicales</h6>

      ${renderFormField({
        name: 'tiene_conocimientos_musicales',
        label: '¿Has aprendido a tocar algún instrumento musical antes?',
        type: 'radio',
        value: tieneConocimientos ? 'true' : draft.tiene_conocimientos_musicales === false ? 'false' : '',
        error: errors.tiene_conocimientos_musicales ?? '',
        required: true,
        options: [{ value: 'true', label: 'Sí' }, { value: 'false', label: 'No' }],
      })}

      <div id="conocimientos-block" style="${tieneConocimientos ? '' : 'display:none'}">
        ${renderFormField({ name: 'instrumento_previo', label: '¿Qué instrumento has tocado?', type: 'text', value: draft.instrumento_previo ?? '', error: errors.instrumento_previo ?? '' })}
        ${renderFormField({
          name: 'nivel_lectura_musical',
          label: 'Nivel de lectura musical',
          type: 'select',
          value: draft.nivel_lectura_musical ?? '',
          error: errors.nivel_lectura_musical ?? '',
          options: [
            { value: '', label: 'Selecciona...' },
            { value: 'basico', label: 'Básico — conozco pocas notas' },
            { value: 'intermedio', label: 'Intermedio — leo partituras simples' },
            { value: 'avanzado', label: 'Avanzado — leo con fluidez' },
          ],
        })}
      </div>

      <div id="iniciacion-block" style="${tieneConocimientos ? 'display:none' : ''}">
        <div class="alert alert-info">
          <i class="bi bi-info-circle me-1"></i>
          <strong>Iniciación musical:</strong> El alumno recibirá una clase obligatoria de iniciación musical durante los primeros <strong>6 meses</strong>.
          A los 3 meses podrá audicionarse para avanzar al semestre completo del programa.
        </div>
      </div>

      ${renderFormField({
        name: 'interes_musical',
        label: '¿Qué te interesa aprender?',
        type: 'radio',
        value: draft.interes_musical ?? '',
        error: errors.interes_musical ?? '',
        required: true,
        options: [
          { value: 'cantar', label: 'Cantar' },
          { value: 'instrumento', label: 'Tocar un instrumento' },
          { value: 'ambas', label: 'Ambas cosas' },
        ],
      })}

      ${renderFormField({ name: 'instrumento_interes', label: '¿Qué instrumento te gustaría tocar?', type: 'text', value: draft.instrumento_interes ?? '', error: errors.instrumento_interes ?? '', hint: 'Ej: violín, flauta, cello, piano, trompeta...' })}

      <hr class="my-3">
      <h6 class="fw-semibold text-secondary mb-3"><i class="bi bi-heart-pulse me-1"></i>Tu relación con la música</h6>

      ${renderFormField({ name: 'sentimiento_musica_clasica', label: '¿Qué sientes cuando escuchas música clásica?', type: 'textarea', value: draft.sentimiento_musica_clasica ?? '', hint: 'Responde con tus propias palabras, no hay respuesta incorrecta' })}
      ${renderFormField({ name: 'sentimiento_aprender_instrumento', label: '¿Cómo te sientes cuando piensas en aprender un instrumento?', type: 'textarea', value: draft.sentimiento_aprender_instrumento ?? '' })}
      ${renderFormField({ name: 'aspiracion_instrumento', label: '¿Qué te gustaría hacer si aprendes a tocar un instrumento?', type: 'textarea', value: draft.aspiracion_instrumento ?? '' })}
      ${renderFormField({ name: 'musico_favorito', label: '¿Tienes algún músico o cantante favorito?', type: 'text', value: draft.musico_favorito ?? '' })}

      ${renderFormField({
        name: 'preferencia_aprendizaje_musical',
        label: '¿Cómo prefieres aprender música?',
        type: 'select',
        value: draft.preferencia_aprendizaje_musical ?? '',
        options: [
          { value: '', label: 'Selecciona...' },
          { value: 'individual', label: 'Clases individuales (uno a uno con el maestro)' },
          { value: 'grupal', label: 'Clases en grupo' },
          { value: 'ambas', label: 'Me es igual, ambas formas' },
          { value: 'autodidacta', label: 'Prefiero aprender por mi cuenta también' },
        ],
      })}

      ${renderFormField({ name: 'por_que_unirse', label: '¿Por qué deseas formar parte de "El Sistema Punta Cana"?', type: 'textarea', value: draft.por_que_unirse ?? '', hint: 'Cuéntanos tu motivación para unirte al programa' })}

    </form>

    <script>
    (function() {
      const radios = document.querySelectorAll('[name="tiene_conocimientos_musicales"]')
      const conocBlock = document.getElementById('conocimientos-block')
      const inicBlock = document.getElementById('iniciacion-block')
      radios.forEach(function(r) {
        r.addEventListener('change', function() {
          if (!conocBlock || !inicBlock) return
          if (this.value === 'true') {
            conocBlock.style.display = ''
            inicBlock.style.display = 'none'
          } else {
            conocBlock.style.display = 'none'
            inicBlock.style.display = ''
          }
        })
      })
    })()
    </script>`
}

export function validate(draft) {
  const errors = {}
  if (draft.tiene_conocimientos_musicales === undefined || draft.tiene_conocimientos_musicales === null) {
    errors.tiene_conocimientos_musicales = 'Indica si tiene conocimientos musicales'
  }
  if (!draft.interes_musical) errors.interes_musical = 'Indica el interés musical'
  return { valid: Object.keys(errors).length === 0, errors }
}

export function getState(container) {
  const form = container?.querySelector('#wiz-form-step5')
  if (!form) return {}

  const boolRadio = (name) => {
    const el = form.querySelector(`[name="${name}"]:checked`)
    if (!el) return undefined
    return el.value === 'true'
  }

  return {
    tiene_conocimientos_musicales: boolRadio('tiene_conocimientos_musicales'),
    instrumento_previo: form.querySelector('[name="instrumento_previo"]')?.value?.trim() ?? null,
    nivel_lectura_musical: form.querySelector('[name="nivel_lectura_musical"]')?.value || null,
    interes_musical: form.querySelector('[name="interes_musical"]:checked')?.value ?? '',
    instrumento_interes: form.querySelector('[name="instrumento_interes"]')?.value?.trim() ?? '',
    sentimiento_musica_clasica: form.querySelector('[name="sentimiento_musica_clasica"]')?.value?.trim() ?? '',
    sentimiento_aprender_instrumento: form.querySelector('[name="sentimiento_aprender_instrumento"]')?.value?.trim() ?? '',
    aspiracion_instrumento: form.querySelector('[name="aspiracion_instrumento"]')?.value?.trim() ?? '',
    musico_favorito: form.querySelector('[name="musico_favorito"]')?.value?.trim() ?? '',
    preferencia_aprendizaje_musical: form.querySelector('[name="preferencia_aprendizaje_musical"]')?.value ?? '',
    por_que_unirse: form.querySelector('[name="por_que_unirse"]')?.value?.trim() ?? '',
  }
}
