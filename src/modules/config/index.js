import { router } from '../../core/router/router.js'

export { 
  getGroqApiKey, setGroqApiKey,
  getOpenRouterApiKey, setOpenRouterApiKey,
  getPreferredModel, setPreferredModel
} from './api/configApi.js'

export function registerRoutesConfig() {
  router.register('configuracion', async (container) => {
    const { renderConfigView } = await import('./views/configView.js')
    await renderConfigView(container)
  })
  
  router.register('importar-datos', async (container) => {
    const { renderImportView } = await import('./views/importView.js')
    await renderImportView(container)
  })

  router.register('exportar-datos', async (container) => {
    const { renderExportView } = await import('./views/exportView.js')
    await renderExportView(container)
  })

  router.register('documentos-historial', async (container) => {
    const { renderGeneratedDocumentsView } = await import('./views/generatedDocumentsView.js')
    await renderGeneratedDocumentsView(container)
  })
}