import { router } from '../../core/router/router.js'
import { renderAlumnosView } from './views/alumnosView.js'
import { renderReporteInscripcionesMes } from './views/reporteInscripcionesMes.js'
import { renderWizardInscripcionAlumnoView } from '../../portal-maestros/views/wizardInscripcionAlumnoView.js'
import { renderAlumnoAdminView } from './views/alumnoAdminView.js'
import { renderPdfDemoView } from './views/pdfDemoView.js'
import { renderPostuladosView } from './views/postulados/postuladosView.js'
import { renderPostuladoPerfilView } from './views/postulados/postuladoPerfilView.js'
import { renderPostuladoCalendarioView } from './views/postulados/postuladoCalendarioView.js'

export function registerRoutesAlumnos() {
  router.register('alumnos', renderAlumnosView)
  router.register('alumnos-reporte-mes', renderReporteInscripcionesMes)
  router.register('alumnos-inscribir', renderWizardInscripcionAlumnoView)
  router.register('alumnos-pdf-demo', renderPdfDemoView)
  router.register('alumno', renderAlumnoAdminView)
  router.register('postulados', renderPostuladosView)
  router.register('postulado', renderPostuladoPerfilView)
  router.register('postulados-calendario', renderPostuladoCalendarioView)
}

