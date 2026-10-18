import { router } from '../../core/router/router.js'

/** Registra la ruta administrativa de Documentos públicos y códigos QR. */
export function registerRoutesDocumentosPublicos() {
  router.register('documentos-publicos', async (container) => {
    try {
      container.innerHTML = '<div class="p-4 text-center text-muted"><i class="bi bi-qr-code fs-3 d-block mb-2"></i>Cargando documentos públicos…</div>'
      const { renderDocumentosPublicosView } = await import('./views/documentosPublicosView.js')
      await renderDocumentosPublicosView(container)
    } catch (error) {
      console.error('[documentos-publicos] Error:', error)
      container.innerHTML = `<div class="p-4 text-center text-muted"><i class="bi bi-exclamation-triangle fs-3 d-block mb-2"></i><p>Error al cargar documentos públicos: ${String(error.message).replace(/</g, '&lt;')}</p></div>`
    }
  })
}
