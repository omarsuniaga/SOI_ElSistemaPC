import { router } from '../../core/router/router.js'
import { renderAsistenciasView } from './views/asistenciasView.js'
import { renderAsistenciaReporteView } from './views/asistenciaReporteView.js'

export function registerRoutesAsistencias() {
  router.register('asistencias', renderAsistenciasView)
  router.register('asistencias-reportes', renderAsistenciaReporteView)
}
