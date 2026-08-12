/**
 * cerrarCasoModal.js — Modal interactivo para el cierre formal, auditoría y emisión de acta PDF de un caso SOI
 */

import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { useAuth } from '../../auth/hooks/useAuth.js'
import { generateCaseDossierPdf } from '../logic/caseDossierPdfGenerator.js'
import * as tareasApi from '../api/tareasApi.js'

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

export function openCerrarCasoModal({ caseId, title = 'Caso Hermes', caseDetail = null, onClosed = () => {} } = {}) {
  const body = `
    <form id="form-cerrar-caso" class="vstack gap-3">
      <div class="alert alert-success py-2 px-3 small mb-0">
        <i class="bi bi-check2-circle me-1"></i>
        Estás a punto de emitir la resolución y archivar formalmente el expediente <strong>${esc(title)}</strong>.
      </div>

      <div>
        <label class="form-label fw-bold small text-muted">Dictamen / Resumen de Resolución <span class="text-danger">*</span></label>
        <textarea
          id="modal-cierre-resumen"
          class="form-control form-control-sm"
          rows="3"
          placeholder="Describe la resolución final, acuerdos alcanzados o evidencias verificadas para dar por concluido el caso…"
          required
        ></textarea>
      </div>

      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="modal-cierre-confirm" required />
        <label class="form-check-label small" for="modal-cierre-confirm">
          Confirmo que todas las tareas han sido completadas y las evidencias institucionales han sido consignadas.
        </label>
      </div>

      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="modal-cierre-pdf" checked />
        <label class="form-check-label small fw-semibold text-primary" for="modal-cierre-pdf">
          <i class="bi bi-file-earmark-pdf-fill me-1"></i> Generar y descargar automáticamente el Acta Oficial en PDF
        </label>
      </div>
    </form>
  `

  AppModal.open({
    title: '<i class="bi bi-check2-all text-success me-2"></i>Cierre Formal de Procedimiento',
    body,
    saveText: '<i class="bi bi-archive-fill me-1"></i> Concluir y Archivar Caso',
    onSave: async () => {
      const resumenInput = document.getElementById('modal-cierre-resumen')
      const confirmCheck = document.getElementById('modal-cierre-confirm')
      const pdfCheck = document.getElementById('modal-cierre-pdf')

      const resumen = resumenInput?.value?.trim()
      const isConfirmed = confirmCheck?.checked
      const shouldDownloadPdf = pdfCheck?.checked

      if (!resumen) {
        AppToast.error('Debes proporcionar un resumen de resolución para el cierre.')
        return false
      }

      if (!isConfirmed) {
        AppToast.error('Debes confirmar la verificación de tareas y evidencias.')
        return false
      }

      try {
        const actor = useAuth().getUsuario?.() || {}
        await tareasApi.closeProcessCase({
          caseId,
          closureSummary: resumen,
          actor,
        })

        if (shouldDownloadPdf && caseDetail) {
          generateCaseDossierPdf({
            ...caseDetail,
            closure_summary: resumen,
          }, { autoDownload: true })
        }

        AppToast.success(`Caso "${title}" concluido y archivado exitosamente.`)
        onClosed()
        return true
      } catch (err) {
        AppToast.error(`Error al cerrar caso: ${err.message}`)
        return false
      }
    },
  })
}
