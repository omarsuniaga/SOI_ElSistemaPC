import { router } from '../../core/router/router.js'
import { renderAlumnosView } from './views/alumnosView.js'
import { renderReporteInscripcionesMes } from './views/reporteInscripcionesMes.js'
import { renderWizardInscripcionAlumnoView } from '../../portal-maestros/views/wizardInscripcionAlumnoView.js'
import { renderAlumnoAdminView } from './views/alumnoAdminView.js'

export function registerRoutesAlumnos() {
  router.register('alumnos', renderAlumnosView)
  router.register('alumnos-reporte-mes', renderReporteInscripcionesMes)
  router.register('alumnos-inscribir', renderWizardInscripcionAlumnoView)
  // Admin student profile — used by notification deep-links (alumno?id=...)
  router.register('alumno', renderAlumnoAdminView)
}
