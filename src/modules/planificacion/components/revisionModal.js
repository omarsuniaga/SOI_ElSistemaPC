import { AppModal } from '../../../shared/components/AppModal.js'
import { highlightDsl, parseDsl, getTokenSummary } from '../utils/dslParser.js'

export function openRevisionModal(originalText, dslResult, onAccept) {
  const parsed = parseDsl(dslResult)
  const summary = getTokenSummary(parsed)
  const highlighted = highlightDsl(dslResult)

  AppModal.open({
    title: '✨ Revisión IA',
    size: 'lg',
    saveText: 'Aceptar y usar',
    cancelText: 'Cancelar',
    body: `
      <div class="row">
        <div class="col-12 mb-3">
          <label class="form-label fw-bold text-muted small">📝 Texto original</label>
          <div class="p-2 bg-light rounded" style="font-size: 0.9rem;">
            ${escapeHTML(originalText)}
          </div>
        </div>
        
        <div class="col-12 mb-3">
          <label class="form-label fw-bold text-success small">✨ DSL estructurado</label>
          <div class="p-3 bg-white border rounded" style="font-size: 0.95rem; white-space: pre-wrap;">
            ${highlighted || escapeHTML(dslResult)}
          </div>
        </div>
        
        <div class="col-12">
          <label class="form-label fw-bold text-muted small">📊 Resumen</label>
          <div class="d-flex flex-wrap gap-2">
            ${summary !== 'Sin tokens' ? summary.split(', ').map(token => `
              <span class="badge bg-secondary bg-opacity-10 text-secondary border">
                ${escapeHTML(token)}
              </span>
            `).join('') : '<span class="text-muted">Sin tokens detectados</span>'}
          </div>
        </div>
      </div>
      
      <style>
        .dsl-token { padding: 2px 6px; border-radius: 4px; font-weight: 500; }
        .dsl-alumno { background: rgba(13, 110, 253, 0.15); color: #0d6efd; }
        .dsl-contenido { background: rgba(25, 135, 84, 0.15); color: #198754; }
        .dsl-sugerencia { background: rgba(253, 126, 20, 0.15); color: #fd7e14; }
        .dsl-tarea { background: rgba(147, 51, 234, 0.15); color: #9333ea; }
        .dsl-medida { background: rgba(6, 182, 212, 0.15); color: #06b6d4; }
        .dsl-calificacion { background: rgba(220, 53, 69, 0.15); color: #dc3545; font-weight: bold; }
        .dsl-objetivo { background: rgba(108, 117, 125, 0.15); color: #6c757d; }
      </style>
    `,
    onSave: () => {
      if (onAccept) onAccept(dslResult)
    },
  })
}

function escapeHTML(text) {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}