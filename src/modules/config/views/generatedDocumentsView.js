import { supabase } from '../../../lib/supabaseClient.js'
import { generateInstitutionalPdf, downloadPdf, buildDocumentFilename } from '../services/pdfDocumentService.js'
import { archiveDocument } from '../services/documentBatchService.js'

export async function renderGeneratedDocumentsView(container) {
  if (!container) return
  container.innerHTML = `
    <div class="page-container d-flex align-items-center justify-content-center" style="min-height:300px;">
      <div class="spinner-border text-primary"></div>
    </div>`
  await _load(container)
}

async function _load(container) {
  try {
    const { data, error } = await supabase
      .from('generated_documents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) throw error
    _render(container, data || [])
  } catch (err) {
    container.innerHTML = `<div class="page-container"><div class="alert alert-warning">Error: ${err.message}</div></div>`
  }
}

function _render(container, docs) {
  const estadoClass = {
    borrador:  'bg-secondary-subtle text-secondary-emphasis',
    generado:  'bg-success-subtle text-success-emphasis',
    archivado: 'bg-warning-subtle text-warning-emphasis',
    anulado:   'bg-danger-subtle text-danger-emphasis',
  }

  container.innerHTML = `
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center"
             style="width:42px;height:42px;">
          <i class="bi bi-clock-history fs-4"></i>
        </div>
        <div>
          <h1 class="page-title mb-0">Historial documental</h1>
          <p class="text-muted small mb-0">${docs.length} documento(s) registrados</p>
        </div>
        <button class="btn btn-sm btn-outline-secondary ms-auto" id="btn-doc-hist-back">
          <i class="bi bi-arrow-left me-1"></i>Volver
        </button>
      </div>

      ${docs.length === 0 ? `
        <div class="text-center py-5 text-muted">
          <i class="bi bi-clock-history fs-1 d-block mb-2 opacity-40"></i>
          <p>No hay documentos generados aún.</p>
        </div>` :
        docs.map(d => `
          <div class="card border-0 shadow-sm mb-2">
            <div class="card-body py-2 px-3">
              <div class="d-flex justify-content-between align-items-start gap-2">
                <div class="flex-grow-1 overflow-hidden">
                  <div class="fw-semibold small text-truncate">${d.titulo}</div>
                  <div class="text-muted" style="font-size:0.72rem;">
                    ${d.alumno_nombre ? `<span class="me-2"><i class="bi bi-person me-1"></i>${d.alumno_nombre}</span>` : ''}
                    ${d.actividad_nombre ? `<span class="me-2"><i class="bi bi-calendar3 me-1"></i>${d.actividad_nombre}</span>` : ''}
                    <span>${new Date(d.created_at).toLocaleDateString('es-DO')}</span>
                  </div>
                </div>
                <div class="d-flex align-items-center gap-2 flex-shrink-0">
                  <span class="badge ${estadoClass[d.estado] || 'bg-secondary-subtle text-secondary-emphasis'}">${d.estado}</span>
                  <button class="btn btn-sm btn-outline-primary btn-doc-redownload" data-id="${d.id}" title="Descargar">
                    <i class="bi bi-download"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-secondary btn-doc-archive" data-id="${d.id}" title="Archivar">
                    <i class="bi bi-archive"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>`).join('')}
    </div>`

  container.querySelector('#btn-doc-hist-back')?.addEventListener('click', () => window.router?.navigate('exportar-datos'))

  container.querySelectorAll('.btn-doc-redownload').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const doc = docs.find(d => d.id === btn.dataset.id)
      if (!doc) return
      const pdf = generateInstitutionalPdf({
        title:    doc.titulo,
        content:  doc.contenido_final,
        metadata: { alumnoNombre: doc.alumno_nombre, tipo: doc.tipo },
      })
      downloadPdf(pdf, buildDocumentFilename({
        tipo:         doc.tipo,
        alumnoNombre: doc.alumno_nombre,
        fecha:        doc.created_at?.slice(0, 10),
      }))
    })
  })

  container.querySelectorAll('.btn-doc-archive').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
      if (!confirm('¿Archivar este documento?')) return
      await archiveDocument(btn.dataset.id)
      await _load(container)
    })
  })
}
