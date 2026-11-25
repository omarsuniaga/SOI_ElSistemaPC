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
          <p class="card-text mb-1">El valor real del programa es de <strong>RD$5,150.00 mensuales</strong>. El alumno recibe una <strong>beca de RD$4,500.00 mensuales (87% cubierto)</strong>.</p>
          <p class="card-text mb-1">Para cubrir el aporte restante, el representante puede elegir entre dos modalidades:<br><strong>Pago Mensual Regular:</strong> RD$650.00 cada mes.<br><strong>Plan Semestral por Adelantado:</strong> pago único de RD$3,600.00 en enero por enero a junio, equivalente a RD$600.00 por mes, con un ahorro de RD$300.00 en el semestre y sin preocuparse por fechas de pago mensuales.</p>
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

          </ul>
          <p class="mt-2 mb-0 small text-muted">Materiales con costo adicional, separados del aporte al programa: <strong>T-shirt oficial RD$500.00</strong> y <strong>cuaderno pentagramado RD$150.00</strong>.</p>
        </div>
      </div>

      <h6 class="fw-semibold mb-3">Para confirmar la inscripción, debe aceptar los siguientes puntos:</h6>

      <div class="mb-3 p-3 bg-light rounded">
        ${renderFormField({
          name: 'acepta_beca_4500',
          label: 'Estoy consciente de que el programa tiene un valor real de RD$5,150.00 mensuales y el alumno recibe una beca de RD$4,500.00 mensuales (87% cubierto), sujeta a rendimiento, interés y asistencia notable.',
          type: 'checkbox',
          value: draft.acepta_beca_4500 ?? false,
          error: errors.acepta_beca_4500 ?? '',
        })}
      </div>

      <div class="mb-3 p-3 bg-light rounded">
        ${renderFormField({
          name: 'acepta_pago_600',
          label: 'Me comprometo a cubrir el aporte restante mediante una de las modalidades: RD$650.00 cada mes o pago semestral adelantado de RD$3,600.00 en enero por enero a junio (RD$600.00 por mes y ahorro de RD$300.00 en el semestre).',
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
