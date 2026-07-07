/**
 * Step 7 — Compromisos y Autorizaciones
 */
import { renderFormField } from '../../components/wizard/FormField.js'

export const id = 'step7'
export const title = 'Compromisos'

export function render(draft, errors = {}) {
  return `
    <form id="wiz-form-step7" novalidate>

      <div class="card border-warning mb-4">
        <div class="card-body">
          <h6 class="card-title text-warning"><i class="bi bi-star-fill me-1"></i>Beca El Sistema Punta Cana</h6>
          <p class="card-text mb-1">Al inscribirse, el alumno recibe una <strong>beca por RD$4,500</strong> que cubre materiales y programa de formación.</p>
          <p class="card-text mb-1">El representante realizará un <strong>aporte mensual de RD$600</strong> para el sostenimiento del programa.</p>
          <p class="card-text small text-muted mb-0">La beca se mantiene siempre que el alumno demuestre <strong>rendimiento, interés y asistencia notable</strong>.</p>
        </div>
      </div>

      <div class="card border-primary mb-4">
        <div class="card-body">
          <h6 class="card-title text-primary"><i class="bi bi-music-note-list me-1"></i>Al completar la inscripción recibirás:</h6>
          <ul class="mb-0">
            <li>Ficha oficial del alumno (para la carpeta del programa)</li>
            <li>Constancia de inscripción en El Sistema Punta Cana</li>
            <li>Tarjeta de pago mensual</li>
            <li>Horario de clases asignado</li>
            <li>Lista de útiles: lápiz, cuaderno pentagramado, borrador, T-shirt de El Sistema PC</li>
          </ul>
          <p class="mt-2 mb-0 small text-muted">El pago inicial de <strong>RD$600</strong> se realiza en caja al momento de recibir estos materiales.</p>
        </div>
      </div>

      <h6 class="fw-semibold mb-3">Para confirmar la inscripción, debe aceptar los siguientes puntos:</h6>

      <div class="mb-3 p-3 bg-light rounded">
        ${renderFormField({
          name: 'acepta_beca_4500',
          label: 'Estoy consciente de que el alumno recibe una beca de RD$4,500 y que solo pagaré RD$600 mensuales, siempre que el rendimiento, interés y asistencia sean notables.',
          type: 'checkbox',
          value: draft.acepta_beca_4500 ?? false,
          error: errors.acepta_beca_4500 ?? '',
        })}
      </div>

      <div class="mb-3 p-3 bg-light rounded">
        ${renderFormField({
          name: 'acepta_pago_600',
          label: 'Me comprometo a realizar el aporte mensual de RD$600 de manera responsable y puntual.',
          type: 'checkbox',
          value: draft.acepta_pago_600 ?? false,
          error: errors.acepta_pago_600 ?? '',
        })}
      </div>

      <hr class="my-3">
      <h6 class="fw-semibold mb-3"><i class="bi bi-camera me-1"></i>Autorización de imagen</h6>
      <div class="mb-3 p-3 bg-light rounded">
        ${renderFormField({
          name: 'autoriza_fotos_redes',
          label: 'Autorizo a "El Sistema Punta Cana" a compartir por redes sociales y/o medios de comunicación fotos y videos donde pueda aparecer el rostro del alumno.',
          type: 'checkbox',
          value: draft.autoriza_fotos_redes ?? false,
          error: errors.autoriza_fotos_redes ?? '',
        })}
      </div>

    </form>`
}

export function validate(draft) {
  const errors = {}
  if (!draft.acepta_beca_4500) errors.acepta_beca_4500 = 'Debe aceptar los términos de la beca para continuar'
  if (!draft.acepta_pago_600) errors.acepta_pago_600 = 'Debe comprometerse con el aporte mensual para continuar'
  return { valid: Object.keys(errors).length === 0, errors }
}

export function getState(container) {
  const form = container?.querySelector('#wiz-form-step7')
  if (!form) return {}
  return {
    acepta_beca_4500: form.querySelector('[name="acepta_beca_4500"]')?.checked ?? false,
    acepta_pago_600: form.querySelector('[name="acepta_pago_600"]')?.checked ?? false,
    autoriza_fotos_redes: form.querySelector('[name="autoriza_fotos_redes"]')?.checked ?? false,
  }
}
