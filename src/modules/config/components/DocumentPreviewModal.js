import { AppModal } from '../../../shared/components/AppModal.js'
import { generateInstitutionalPdf, downloadPdf, buildDocumentFilename } from '../services/pdfDocumentService.js'
import { saveGeneratedDocument } from '../services/documentBatchService.js'

export function openDocumentPreview(opts) {
  const {
    title, tipo, alumnoNombre, alumnoId, templateId,
    contenidoFinal, variablesUsadas, variablesFaltantes, advertencias,
    onSaved,
  } = opts

  const hasCritical = variablesFaltantes.length > 0

  const headerActionsHTML = `
    <div class="d-flex align-items-center gap-2">
      <button class="btn btn-sm text-white border-0 d-inline-flex align-items-center justify-content-center px-2 py-1" id="btn-preview-draft" style="background: rgba(255,255,255,0.18); font-size: 0.8rem; border-radius: 6px;" type="button" title="Guardar borrador">
        <i class="bi bi-floppy me-1"></i>Borrador
      </button>
      <button class="btn btn-sm text-white border-0 d-inline-flex align-items-center justify-content-center px-2 py-1 ${hasCritical ? 'disabled opacity-50' : ''}" id="btn-preview-pdf" style="background: rgba(255,255,255,0.3); font-size: 0.8rem; border-radius: 6px;" type="button" ${hasCritical ? 'disabled' : ''} title="Generar PDF">
        <i class="bi bi-file-earmark-pdf me-1"></i>Generar PDF
      </button>
    </div>
  `

  AppModal.open({
    title:         `Vista previa — ${title}`,
    headerActions: headerActionsHTML,
    autoFocus:     false,
    size:          'xl',
    hideSave:      true,
    cancelText:    'Cerrar',
    body: `
      <div class="row g-3">
        <div class="col-md-4">
          <div class="card border-0 bg-body-secondary h-100">
            <div class="card-body small">
              <div class="mb-3">
                <div class="text-muted fw-bold mb-1" style="font-size:0.72rem;text-transform:uppercase;">Alumno/a</div>
                <div class="fw-semibold">${alumnoNombre || '—'}</div>
              </div>
              <div class="mb-3">
                <div class="text-muted fw-bold mb-1" style="font-size:0.72rem;text-transform:uppercase;">Tipo de documento</div>
                <div>${(tipo || '').replace(/_/g, ' ')}</div>
              </div>
              ${advertencias.length > 0 ? `
                <div class="mb-3">
                  <div class="text-muted fw-bold mb-1" style="font-size:0.72rem;text-transform:uppercase;">Datos faltantes</div>
                  ${advertencias.map(w => `
                    <div class="badge bg-warning-subtle text-warning-emphasis mb-1 d-block text-start">
                      <i class="bi bi-exclamation-triangle me-1"></i>${w}
                    </div>`).join('')}
                </div>` : `
                <div class="text-success small"><i class="bi bi-check-circle me-1"></i>Datos completos</div>`}
            </div>
          </div>
        </div>
        <div class="col-md-8">
          <label class="form-label small fw-semibold">Contenido final (editable antes de generar)</label>
          <textarea class="form-control font-monospace" id="preview-content-editor"
                    rows="18" style="font-size:0.8rem;line-height:1.5;">${contenidoFinal}</textarea>
        </div>
      </div>
      ${hasCritical ? `<p class="text-danger small mt-2 mb-0"><i class="bi bi-exclamation-triangle me-1"></i>Hay datos críticos faltantes. Completá los datos antes de generar.</p>` : ''}
    `,
    onShow: (modalBody) => {
      const dialog = modalBody.closest('.app-modal-dialog')
      dialog?.querySelector('#btn-preview-draft')?.addEventListener('click', async () => {
        const contenido = modalBody.querySelector('#preview-content-editor')?.value || contenidoFinal
        try {
          const doc = await saveGeneratedDocument({
            template_id: templateId || null, tipo, titulo: title,
            alumno_id: alumnoId || null, alumno_nombre: alumnoNombre || null,
            actividad_nombre: variablesUsadas?.nombre_actividad || null,
            contenido_final: contenido, variables_usadas: variablesUsadas || {},
            variables_faltantes: variablesFaltantes || [], advertencias: advertencias || [],
            estado: 'borrador', generated_at: new Date().toISOString(),
          })
          onSaved?.(doc)
          alert('Borrador guardado correctamente.')
        } catch (err) { alert(`Error al guardar: ${err.message}`) }
      })

      dialog?.querySelector('#btn-preview-pdf')?.addEventListener('click', async () => {
        const contenido = modalBody.querySelector('#preview-content-editor')?.value || contenidoFinal
        const btn = dialog.querySelector('#btn-preview-pdf')
        if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Generando...' }
        try {
          const pdf = generateInstitutionalPdf({ title, content: contenido, metadata: { alumnoNombre, tipo } })
          const filename = buildDocumentFilename({ tipo, alumnoNombre, fecha: new Date().toISOString().slice(0, 10) })
          downloadPdf(pdf, filename)
          const doc = await saveGeneratedDocument({
            template_id: templateId || null, tipo, titulo: title,
            alumno_id: alumnoId || null, alumno_nombre: alumnoNombre || null,
            actividad_nombre: variablesUsadas?.nombre_actividad || null,
            contenido_final: contenido, variables_usadas: variablesUsadas || {},
            variables_faltantes: variablesFaltantes || [], advertencias: advertencias || [],
            estado: 'generado', generated_at: new Date().toISOString(),
          })
          onSaved?.(doc)
        } catch (err) {
          alert(`Error al generar PDF: ${err.message}`)
        } finally {
          if (btn) { btn.disabled = false; btn.innerHTML = '<i class="bi bi-file-earmark-pdf me-1"></i>Generar PDF' }
        }
      })
    }
  })
}
