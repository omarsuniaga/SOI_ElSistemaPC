import { AppModal } from '../../../shared/components/AppModal.js'
import { listTemplates } from '../../config/services/documentTemplateService.js'
import {
  getStudentDocumentData, buildStudentDocumentContext,
} from '../../config/services/studentDocumentDataService.js'
import { buildResolvedDocument } from '../../config/services/documentGeneratorService.js'
import { openDocumentPreview } from '../../config/components/DocumentPreviewModal.js'
import { addDocumentAction } from '../services/caseActionsService.js'

/** Risk level → suggested template tipos */
const RISK_TEMPLATE_MAP = {
  bajo:    ['amonestacion_leve', 'carta_representante'],
  medio:   ['amonestacion_moderada', 'carta_institucional'],
  alto:    ['amonestacion_grave', 'solicitud_reunion_representante'],
  critico: ['llamado_formal_directiva', 'solicitud_devolucion_instrumento', 'acta_compromiso'],
}

export async function openCaseLetterModal(caso, _alumno, onSaved) {
  if (!caso.alumno_id) {
    alert('Este caso no tiene alumno asociado.')
    return
  }

  const allTemplates   = await listTemplates()
  const suggestedTipos = RISK_TEMPLATE_MAP[caso.nivel_riesgo] || []
  // Only active templates — never expose inactive/archived even if their tipo is in the suggestion map.
  const activeTemplates = allTemplates.filter(t => t.estado === 'activa')

  AppModal.open({
    title:      'Generar carta desde el caso',
    size:       'lg',
    hideSave:   true,
    cancelText: 'Cerrar',
    body: `
      <div class="small">
        <div class="alert alert-info py-2 mb-3">
          <i class="bi bi-info-circle me-1"></i>
          Sugerencia según nivel de riesgo <strong>${caso.nivel_riesgo}</strong>:
          ${suggestedTipos.length > 0 ? suggestedTipos.map(t => t.replace(/_/g, ' ')).join(', ') : 'sin sugerencia específica'}.
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold">Plantilla *</label>
          <select class="form-select form-select-sm" id="clt-template">
            <option value="">Seleccioná una plantilla...</option>
            ${activeTemplates.map(t => `
              <option value="${t.id}" data-tipo="${t.tipo}" data-nombre="${t.nombre}">
                ${suggestedTipos.includes(t.tipo) ? '⭐ ' : ''}${t.nombre}
              </option>`).join('')}
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold">Motivo / Resumen del caso</label>
          <textarea class="form-control form-control-sm" id="clt-motivo" rows="3">${caso.resumen_actual || caso.descripcion || ''}</textarea>
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold">Responsable institucional</label>
          <input type="text" class="form-control form-control-sm" id="clt-responsable" value="Coordinación Pedagógica">
        </div>

        <div class="d-flex justify-content-end">
          <button class="btn btn-sm btn-primary" id="clt-preview-btn">
            <i class="bi bi-eye me-1"></i>Vista previa y generar
          </button>
        </div>
      </div>
    `,
    onOpen: (modalBody) => {
      modalBody.querySelector('#clt-preview-btn')?.addEventListener('click', async () => {
        const sel              = modalBody.querySelector('#clt-template')
        const templateId       = sel?.value
        const templateNombre   = sel?.selectedOptions[0]?.dataset.nombre
        const templateTipo     = sel?.selectedOptions[0]?.dataset.tipo

        if (!templateId) { alert('Seleccioná una plantilla.'); return }

        const motivo      = modalBody.querySelector('#clt-motivo')?.value?.trim() || ''
        const responsable = modalBody.querySelector('#clt-responsable')?.value?.trim() || 'Coordinación Pedagógica'

        const template     = allTemplates.find(t => t.id === templateId)
        const studentData  = await getStudentDocumentData(caso.alumno_id)
        const context      = buildStudentDocumentContext({
          alumno:      studentData.alumno,
          escolaridad: studentData.escolaridad,
          actividad:   { nombre: `Caso institucional: ${caso.titulo}`, motivo },
          extra:       { responsable },
        })

        const { contenidoFinal, variablesUsadas, variablesFaltantes, advertencias } = buildResolvedDocument({ template, context })

        AppModal.close()
        setTimeout(() => {
          openDocumentPreview({
            title:        templateNombre,
            tipo:         templateTipo,
            alumnoNombre: studentData.alumno?.nombre_completo || '',
            alumnoId:     caso.alumno_id,
            templateId,
            contenidoFinal,
            variablesUsadas,
            variablesFaltantes,
            advertencias,
            onSaved: async (docRecord) => {
              if (docRecord?.id) {
                try {
                  await addDocumentAction(caso.id, docRecord.id, {
                    titulo:      `Carta generada: ${templateNombre}`,
                    descripcion: motivo,
                  })
                  onSaved?.()
                } catch (err) {
                  console.error('[case letter] link error', err)
                }
              }
            },
          })
        }, 300)
      })
    },
  })
}
