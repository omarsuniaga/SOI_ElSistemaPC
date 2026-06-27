import { router } from '../../core/router/router.js'
import { renderInstitucionesView } from './views/institucionesView.js'
import { renderCampaniasView } from './views/campaniasView.js'
import { renderCampaniaCompositorView } from './views/campaniaCompositorView.js'

export function registerRoutesCampañas() {
  router.register('com-instituciones', (mount) => renderInstitucionesView(mount))
  router.register('com-campanias', (mount) => renderCampaniasView(mount))
  router.register('com-campania-compositor', (mount) => renderCampaniaCompositorView(mount))
}
