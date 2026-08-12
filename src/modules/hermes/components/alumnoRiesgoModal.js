/**
 * alumnoRiesgoModal.js — Modal interactivo para el protocolo "Alumno en Riesgo" (SP-4)
 */

import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { shouldBlockSensitiveMessage, buildSafeRejectionMessage } from '../api/whatsappSecurityGuard.js'
import * as tareasApi from '../api/tareasApi.js'

export function openAlumnoRiesgoModal({ onReported = () => {} } = {}) {
  const body = `
    <form id="form-alumno-riesgo" class="vstack gap-3">
      <div class="alert alert-warning py-2 px-3 small mb-0">
        <i class="bi bi-shield-exclamation me-1"></i>
        Este protocolo desplegará tareas inmediatas para <strong>Académica</strong>, <strong>Administración</strong>, <strong>Comunicaciones</strong> y <strong>Dirección</strong>.
      </div>

      <div>
        <label class="form-label fw-bold small text-muted">Nombre del Alumno <span class="text-danger">*</span></label>
        <input
          id="modal-riesgo-alumno"
          type="text"
          class="form-control form-control-sm"
          placeholder="Nombre y apellido del estudiante"
          required
        />
      </div>

      <div>
        <label class="form-label fw-bold small text-muted">Causa Principal del Riesgo <span class="text-danger">*</span></label>
        <select id="modal-riesgo-categoria" class="form-select form-select-sm" required>
          <option value="Inasistencias crónicas (> 3 faltas consecutivas)">Inasistencias crónicas (> 3 faltas consecutivas)</option>
          <option value="Bajo rendimiento o estancamiento pedagógico">Bajo rendimiento o estancamiento pedagógico</option>
          <option value="Morosidad o compromiso de pago administrativo pendiente">Morosidad o compromiso administrativo</option>
          <option value="Situación conductual / psicopedagógica">Situación conductual / psicopedagógica</option>
          <option value="Instrumento dañado / retenido en lutería">Instrumento dañado / retenido en lutería</option>
        </select>
      </div>

      <div>
        <label class="form-label fw-bold small text-muted">Detalles y Antecedentes del Caso</label>
        <textarea
          id="modal-riesgo-motivo"
          class="form-control form-control-sm"
          rows="3"
          placeholder="Describe la situación actual, intentos previos de contacto o acciones pedagógicas realizadas…"
          required
        ></textarea>
      </div>
    </form>
  `

  AppModal.open({
    title: '<i class="bi bi-person-exclamation text-danger me-2"></i>Reportar Alumno en Riesgo',
    body,
    saveText: '<i class="bi bi-send-exclamation-fill me-1"></i> Activar Protocolo',
    onSave: async () => {
      const alumnoInput = document.getElementById('modal-riesgo-alumno')
      const catSelect = document.getElementById('modal-riesgo-categoria')
      const motivoInput = document.getElementById('modal-riesgo-motivo')

      const alumnoNombre = alumnoInput?.value?.trim()
      const categoria = catSelect?.value
      const detalles = motivoInput?.value?.trim()

      if (!alumnoNombre) {
        AppToast.error('El nombre del alumno es requerido.')
        return false
      }

      const motivoCompleto = `[${categoria}] ${detalles ? `: ${detalles}` : ''}`

      // Verificación de seguridad de datos sensibles
      if (shouldBlockSensitiveMessage(`${alumnoNombre}\n${motivoCompleto}`)) {
        AppToast.error(buildSafeRejectionMessage())
        return false
      }

      try {
        await tareasApi.reportarAlumnoRiesgo(null, alumnoNombre, motivoCompleto)
        AppToast.success(`Protocolo activado para "${alumnoNombre}". Tareas creadas y asignadas.`)
        onReported()
        return true
      } catch (err) {
        AppToast.error(`Error al reportar alumno: ${err.message}`)
        return false
      }
    },
  })
}
