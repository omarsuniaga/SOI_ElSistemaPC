import { router } from '../../core/router/router.js'
import { renderActividadesInstitucionalesView } from './views/actividadesInstitucionalesView.js'

export function registerRoutesActividadesInstitucionales() {
  router.register('actividades-institucionales', renderActividadesInstitucionalesView)
}
