/**
 * iniciarCasoModal.js — Modal interactivo para abrir un nuevo caso SOI / Procedimiento Hermes
 */

import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import * as tareasApi from '../api/tareasApi.js'

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

const DEPARTAMENTOS = {
  DIR: 'Dirección', ACM: 'Académica', ADM: 'Administración', FIN: 'Financiero',
  LOG: 'Logística', COM: 'Comunicaciones', TECNICO: 'Técnico', LUT: 'Lutería', OPR: 'Operaciones',
}

export function openIniciarCasoModal({ processCode = null, contracts = [], onOpened = () => {} } = {}) {
  const selectedContract = contracts.find((c) => c.process_code === processCode) || contracts[0] || null

  const contractOptions = contracts.map((c) => `
    <option value="${esc(c.process_code)}" ${c.process_code === (selectedContract?.process_code || processCode) ? 'selected' : ''}>
      ${esc(c.process_code)} — ${esc(c.process_name || c.process_code)}
    </option>
  `).join('')

  const body = `
    <form id="form-iniciar-caso" class="vstack gap-3">
      <div>
        <label class="form-label fw-bold small text-muted">Contrato SOI / Procedimiento</label>
        <select id="modal-process-code" class="form-select form-select-sm" required>
          ${contractOptions || `<option value="${esc(processCode || 'PROC-CUSTOM')}">${esc(processCode || 'Procedimiento Personalizado')}</option>`}
        </select>
        <div id="modal-contract-info" class="small text-muted mt-1">
          ${selectedContract ? `Dueño: <strong>${esc(DEPARTAMENTOS[selectedContract.department_owner] || selectedContract.department_owner)}</strong> · Tipo: <span class="badge bg-primary-subtle text-primary">${esc(selectedContract.automation_status || 'semi_auto')}</span>` : ''}
        </div>
      </div>

      <div>
        <label class="form-label fw-bold small text-muted">Título del Caso <span class="text-danger">*</span></label>
        <input
          id="modal-case-title"
          type="text"
          class="form-control form-control-sm"
          placeholder="Ej: Reinscripción Período Académico 2026-II"
          value="${esc(selectedContract?.process_name || '')}"
          required
        />
      </div>

      <div class="row g-2">
        <div class="col-md-6">
          <label class="form-label fw-bold small text-muted">Prioridad Inicial</label>
          <select id="modal-case-priority" class="form-select form-select-sm">
            <option value="media" selected>Media (Normal)</option>
            <option value="alta">Alta (Urgente)</option>
            <option value="critica">Crítica (Bloqueo Operacional)</option>
            <option value="baja">Baja</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label fw-bold small text-muted">Fecha Límite Estimada (Opcional)</label>
          <input id="modal-case-deadline" type="date" class="form-control form-control-sm" />
        </div>
      </div>

      <div>
        <label class="form-label fw-bold small text-muted">Descripción u Objetivos del Caso</label>
        <textarea
          id="modal-case-desc"
          class="form-control form-control-sm"
          rows="3"
          placeholder="Detalles operacionales, justificación institucional o alcance del caso…"
        ></textarea>
      </div>
    </form>
  `

  AppModal.open({
    title: '<i class="bi bi-play-circle-fill me-2"></i>Abrir Caso Institucional',
    body,
    saveText: '<i class="bi bi-rocket-takeoff-fill me-1"></i> Abrir Expediente',
    onSave: async () => {
      const codeSelect = document.getElementById('modal-process-code')
      const titleInput = document.getElementById('modal-case-title')
      const prioritySelect = document.getElementById('modal-case-priority')
      const deadlineInput = document.getElementById('modal-case-deadline')
      const descInput = document.getElementById('modal-case-desc')

      const code = codeSelect?.value?.trim()
      const title = titleInput?.value?.trim()
      const priority = prioritySelect?.value || 'media'
      const deadline = deadlineInput?.value || null
      const desc = descInput?.value?.trim() || null

      if (!code || !title) {
        AppToast.error('El contrato y el título del caso son obligatorios.')
        return false // prevent close
      }

      try {
        await tareasApi.startProcessCase({
          process_code: code,
          title,
          description: desc,
          priority,
          source: 'manual',
          metadata: {
            deadline,
            opened_from: 'procedimientos_view',
          },
        })
        AppToast.success(`Caso "${title}" abierto: tareas delegadas a los departamentos.`)
        onOpened()
        return true
      } catch (err) {
        AppToast.error(`Error al abrir caso: ${err.message}`)
        return false
      }
    },
  })

  // Dynamic contract info updates
  const codeSelect = document.getElementById('modal-process-code')
  if (codeSelect) {
    codeSelect.addEventListener('change', (e) => {
      const newCode = e.target.value
      const found = contracts.find((c) => c.process_code === newCode)
      const titleInput = document.getElementById('modal-case-title')
      const infoBox = document.getElementById('modal-contract-info')

      if (found) {
        if (titleInput && (!titleInput.value || titleInput.value === selectedContract?.process_name)) {
          titleInput.value = found.process_name || found.process_code
        }
        if (infoBox) {
          infoBox.innerHTML = `Dueño: <strong>${esc(DEPARTAMENTOS[found.department_owner] || found.department_owner)}</strong> · Tipo: <span class="badge bg-primary-subtle text-primary">${esc(found.automation_status || 'semi_auto')}</span>`
        }
      }
    })
  }
}
