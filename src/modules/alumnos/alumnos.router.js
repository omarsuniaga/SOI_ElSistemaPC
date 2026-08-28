import { router } from '../../core/router/router.js'
import { renderAlumnosView } from './views/alumnosView.js'
import { renderReporteInscripcionesMes } from './views/reporteInscripcionesMes.js'
import { renderWizardInscripcionAlumnoView } from '../../portal-maestros/views/wizardInscripcionAlumnoView.js'
import { renderAlumnoAdminView } from './views/alumnoAdminView.js'
import { renderPdfDemoView } from './views/pdfDemoView.js'
import { renderPostuladosView } from './views/postulados/postuladosView.js'
import { renderPostuladoPerfilView } from './views/postulados/postuladoPerfilView.js'
import { renderPostuladoCalendarioView } from './views/postulados/postuladoCalendarioView.js'
import { renderFicha360AdminView } from './views/ficha360AdminView.js'
import { renderDuplicadosWorkbenchView } from './views/duplicadosWorkbenchView.js'
import { renderAlumnosInactivosView } from './views/alumnosInactivosView.js'

export function registerRoutesAlumnos() {
  router.register('alumnos', renderAlumnosView)
  router.register('alumnos/duplicados', renderDuplicadosWorkbenchView)
  router.register('alumnos-duplicados', renderDuplicadosWorkbenchView) // Alias retrocompatible
  router.register('alumnos/inactivos', renderAlumnosInactivosView)
  router.register('alumnos-inactivos', renderAlumnosInactivosView)
  router.register('alumnos/reporte-mes', renderReporteInscripcionesMes)
  router.register('alumnos-reporte-mes', renderReporteInscripcionesMes)
  router.register('alumnos/inscribir', renderWizardInscripcionAlumnoView)
  router.register('alumnos-inscribir', renderWizardInscripcionAlumnoView)
  router.register('alumnos/pdf-demo', renderPdfDemoView)
  router.register('alumnos-pdf-demo', renderPdfDemoView)
  router.register('alumnos/:id', renderAlumnoAdminView)
  router.register('alumno', renderAlumnoAdminView)
  router.register('ficha-360', renderFicha360AdminView)
  router.register('postulados', renderPostuladosView)
  router.register('postulados/:id', renderPostuladoPerfilView)
  router.register('postulado', renderPostuladoPerfilView)
  router.register('postulados-calendario', renderPostuladoCalendarioView)
  router.register('postulados/calendario', renderPostuladoCalendarioView)
}


