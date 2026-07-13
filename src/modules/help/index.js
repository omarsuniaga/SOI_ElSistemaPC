import { router } from '../../core/router/router.js'

export function registerRoutesHelp() {
  router.register('ayuda', async (container) => {
    const { renderHelpView } = await import('./views/helpView.js')
    renderHelpView(container)
  })
}
