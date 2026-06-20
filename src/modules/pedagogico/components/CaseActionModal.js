import { AppModal } from '../../../shared/components/AppModal.js'
import {
  addCallAction, addMeetingAction, addAgreementAction, addInternalNote,
} from '../services/caseActionsService.js'

/**
 * Open a modal to register a case action.
 * @param {'llamada'|'reunion'|'acuerdo'|'nota'} type
 * @param {object} caso
 * @param {Function} onSaved
 */
export function openCaseActionModal(type, caso, onSaved) {
  const cfg = MODAL_CONFIG[type]
  if (!cfg) return

  AppModal.open({
    title:    cfg.title,
    size:     'lg',
    saveText: cfg.saveText,
    body:     cfg.body(caso),
    onSave: async () => {
      const payload = cfg.collect()
      if (cfg.requiredKeys.some(k => !payload[k] || String(payload[k]).trim() === '')) {
        alert(`Completá los campos requeridos: ${cfg.requiredKeys.join(', ')}`)
        return false
      }
      try {
        await cfg.save(caso.id, payload)
        onSaved?.()
        return true
      } catch (err) { alert(`Error: ${err.message}`); return false }
    },
  })
}

const MODAL_CONFIG = {
  llamada: {
    title: 'Registrar llamada',
    saveText: 'Registrar',
    requiredKeys: ['persona_contactada', 'resultado'],
    body: () => `
      <div class="row g-2 small">
        <div class="col-md-6">
          <label class="form-label fw-semibold">Fecha y hora</label>
          <input type="datetime-local" class="form-control form-control-sm" id="cma-fecha" value="${new Date().toISOString().slice(0, 16)}">
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold">Teléfono usado</label>
          <input type="text" class="form-control form-control-sm" id="cma-telefono">
        </div>
        <div class="col-12">
          <label class="form-label fw-semibold">Persona contactada *</label>
          <input type="text" class="form-control form-control-sm" id="cma-persona" placeholder="Ej: Madre del alumno">
        </div>
        <div class="col-12">
          <label class="form-label fw-semibold">Resultado *</label>
          <select class="form-select form-select-sm" id="cma-resultado">
            <option value="">Seleccioná...</option>
            <option value="contactado_exitoso">Contactado exitoso</option>
            <option value="no_contesto">No contestó</option>
            <option value="numero_incorrecto">Número incorrecto</option>
            <option value="apagado">Apagado / Fuera de servicio</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div class="col-12">
          <label class="form-label fw-semibold">Resumen</label>
          <textarea class="form-control form-control-sm" id="cma-descripcion" rows="3"></textarea>
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold">Próxima acción</label>
          <input type="text" class="form-control form-control-sm" id="cma-proxima">
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold">Fecha próxima acción</label>
          <input type="date" class="form-control form-control-sm" id="cma-proxima-fecha">
        </div>
      </div>`,
    collect: () => ({
      fecha_accion:         document.querySelector('#cma-fecha')?.value ? new Date(document.querySelector('#cma-fecha').value).toISOString() : undefined,
      persona_contactada:   document.querySelector('#cma-persona')?.value?.trim(),
      resultado:            document.querySelector('#cma-resultado')?.value,
      descripcion:          document.querySelector('#cma-descripcion')?.value?.trim() || null,
      proxima_accion:       document.querySelector('#cma-proxima')?.value?.trim() || null,
      proxima_accion_fecha: document.querySelector('#cma-proxima-fecha')?.value || null,
    }),
    save: (caseId, p) => addCallAction(caseId, p),
  },

  reunion: {
    title: 'Registrar reunión',
    saveText: 'Registrar',
    requiredKeys: ['titulo'],
    body: () => `
      <div class="row g-2 small">
        <div class="col-md-6">
          <label class="form-label fw-semibold">Fecha de reunión</label>
          <input type="datetime-local" class="form-control form-control-sm" id="cmr-fecha" value="${new Date().toISOString().slice(0, 16)}">
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold">Participantes</label>
          <input type="text" class="form-control form-control-sm" id="cmr-participantes" placeholder="Ej: Madre, coordinación, maestro">
        </div>
        <div class="col-12">
          <label class="form-label fw-semibold">Motivo / Título *</label>
          <input type="text" class="form-control form-control-sm" id="cmr-titulo">
        </div>
        <div class="col-12">
          <label class="form-label fw-semibold">Acuerdos</label>
          <textarea class="form-control form-control-sm" id="cmr-descripcion" rows="3"></textarea>
        </div>
        <div class="col-12">
          <label class="form-label fw-semibold">Resultado / Conclusiones</label>
          <textarea class="form-control form-control-sm" id="cmr-resultado" rows="2"></textarea>
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold">Próxima acción</label>
          <input type="text" class="form-control form-control-sm" id="cmr-proxima">
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold">Fecha de seguimiento</label>
          <input type="date" class="form-control form-control-sm" id="cmr-proxima-fecha">
        </div>
      </div>`,
    collect: () => ({
      fecha_accion: document.querySelector('#cmr-fecha')?.value ? new Date(document.querySelector('#cmr-fecha').value).toISOString() : undefined,
      titulo:       document.querySelector('#cmr-titulo')?.value?.trim() || 'Reunión',
      descripcion:  [
        document.querySelector('#cmr-participantes')?.value ? `Participantes: ${document.querySelector('#cmr-participantes').value}` : '',
        document.querySelector('#cmr-descripcion')?.value || '',
      ].filter(Boolean).join('\n'),
      resultado:            document.querySelector('#cmr-resultado')?.value?.trim() || null,
      proxima_accion:       document.querySelector('#cmr-proxima')?.value?.trim() || null,
      proxima_accion_fecha: document.querySelector('#cmr-proxima-fecha')?.value || null,
    }),
    save: (caseId, p) => addMeetingAction(caseId, p),
  },

  acuerdo: {
    title: 'Registrar acuerdo',
    saveText: 'Registrar',
    requiredKeys: ['titulo', 'descripcion'],
    body: () => `
      <div class="row g-2 small">
        <div class="col-12">
          <label class="form-label fw-semibold">Tipo de acuerdo / Título *</label>
          <input type="text" class="form-control form-control-sm" id="cmac-titulo">
        </div>
        <div class="col-12">
          <label class="form-label fw-semibold">Descripción del acuerdo *</label>
          <textarea class="form-control form-control-sm" id="cmac-descripcion" rows="4"></textarea>
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold">Responsable</label>
          <input type="text" class="form-control form-control-sm" id="cmac-responsable">
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold">Fecha límite</label>
          <input type="date" class="form-control form-control-sm" id="cmac-fecha-limite">
        </div>
        <div class="col-12">
          <label class="form-label fw-semibold">Observaciones</label>
          <textarea class="form-control form-control-sm" id="cmac-observaciones" rows="2"></textarea>
        </div>
      </div>`,
    collect: () => ({
      titulo:               document.querySelector('#cmac-titulo')?.value?.trim(),
      descripcion:          document.querySelector('#cmac-descripcion')?.value?.trim(),
      resultado:            [
        document.querySelector('#cmac-responsable')?.value ? `Responsable: ${document.querySelector('#cmac-responsable').value}` : '',
        document.querySelector('#cmac-observaciones')?.value || '',
      ].filter(Boolean).join('\n') || null,
      proxima_accion_fecha: document.querySelector('#cmac-fecha-limite')?.value || null,
    }),
    save: (caseId, p) => addAgreementAction(caseId, p),
  },

  nota: {
    title: 'Agregar nota interna',
    saveText: 'Guardar',
    requiredKeys: ['descripcion'],
    body: () => `
      <div class="row g-2 small">
        <div class="col-12">
          <label class="form-label fw-semibold">Título</label>
          <input type="text" class="form-control form-control-sm" id="cmn-titulo" value="Nota interna" maxlength="160">
        </div>
        <div class="col-12">
          <label class="form-label fw-semibold">Contenido *</label>
          <textarea class="form-control form-control-sm" id="cmn-descripcion" rows="5"></textarea>
        </div>
      </div>`,
    collect: () => ({
      titulo:      document.querySelector('#cmn-titulo')?.value?.trim() || 'Nota interna',
      descripcion: document.querySelector('#cmn-descripcion')?.value?.trim(),
    }),
    save: (caseId, p) => addInternalNote(caseId, p),
  },
}
