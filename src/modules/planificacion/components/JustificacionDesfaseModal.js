/**
 * JustificacionDesfaseModal.js — Modal para que el Maestro Justifique un Desfase de Tiempo a ACM
 */
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'

/**
 * Abre el modal de justificación de retraso curricular.
 * @param {Object} options
 * @param {Object} options.plan — Planificación afectada
 * @param {Object} options.calculoDesfase — Diagnóstico retornado por CalculadorVelocidadCurricular
 * @param {Function} [options.onSubmitted] — Callback al enviar justificación
 */
export function openJustificacionDesfaseModal({ plan, calculoDesfase, onSubmitted = null }) {
  if (!plan) return

  const bodyHTML = `
    <div>
      <div class="alert alert-warning p-3 mb-3 border-warning">
        <h6 class="fw-bold mb-1"><i class="bi bi-clock-history me-1"></i>Diagnóstico de Desfase de Tiempo</h6>
        <p class="small mb-0">
          <strong>Semana ${calculoDesfase.semanaActual} de ${calculoDesfase.semanasTotales}</strong><br/>
          Avance Esperado: <strong>${calculoDesfase.avanceEsperadoPct}%</strong> | Avance Real: <strong>${calculoDesfase.avanceRealPct}%</strong> (${calculoDesfase.desfasePct}%).
        </p>
      </div>

      <form id="form-justificacion-desfase">
        <div class="mb-3">
          <label class="form-label fw-semibold">Motivo Principal del Desfase <span class="text-danger">*</span></label>
          <select class="form-select" id="justificacion-motivo" required>
            <option value="">-- Seleccionar Causa --</option>
            <option value="salud">Licencia / Motivos de Salud del Docente</option>
            <option value="ensayos">Ensayos Extraordinarios o Concierto Institucional</option>
            <option value="feriados">Días Feriados / Suspensión de Actividades</option>
            <option value="nivelacion">Necesidad de Nivelación Técnica del Grupo</option>
            <option value="otro">Otro motivo justificado</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold">Explicación y Plan de Ajuste Pedagógico <span class="text-danger">*</span></label>
          <textarea class="form-control" id="justificacion-detalle" rows="4" placeholder="Detallá las razones del atraso y cómo proponés ajustar el cronograma con Coordinación ACM..." required></textarea>
        </div>
      </form>
    </div>
  `

  AppModal.open({
    title: `📝 Justificar Desfase: ${escapeHTML(plan.titulo || 'Planificación')}`,
    size: 'lg',
    saveText: 'Enviar Justificación a ACM',
    cancelText: 'Cancelar',
    body: bodyHTML,
    onSave: async () => {
      const motivo = document.querySelector('#justificacion-motivo')?.value
      const detalle = document.querySelector('#justificacion-detalle')?.value?.trim()

      if (!motivo || !detalle) {
        AppToast.show('Por favor completá la causa y la explicación detallada.', 'error')
        return false
      }

      onSubmitted?.({
        planId: plan.id,
        motivo,
        detalle,
        desfasePct: calculoDesfase.desfasePct,
        fecha: new Date().toISOString(),
      })

      AppToast.show('Justificación enviada a la Coordinación ACM con éxito', 'success')
      return true
    },
  })
}
