import { router } from '../../core/router/router.js'
export function registerRoutesSistema() {
  router.register('historial-versiones',async(container)=>{
    const { renderVersionHistoryView }=await import('../../core/version/versionHistoryView.js')
    renderVersionHistoryView(container)
  })
}
