import { router } from '../../core/router/router.js'
import { importarConReintento } from '../../shared/utils/dynamicImport.js'
import CumplimientoMaestrosWidget from './views/cumplimientoMaestrosWidget.js'
import DirectorReportingPanel from './views/directorReportingPanel.js'
import { analyticsFillingBehaviorWidget } from './views/analyticsFillingBehaviorWidget.js'
import { directorTrendReportView } from './views/directorTrendReportView.js'

/**
 * Registra las rutas del módulo Admin Dashboard
 * Incluye: cumplimiento de maestros, reportes, analítica de llenado, tendencias
 */
export function registerRoutesAdminDashboard() {
  // Cumplimiento de Maestros - Vista principal del dashboard
  router.register('admin-dashboard', (container) => {
    try {
      container.innerHTML = `<div id="admin-dashboard-container"></div>`
      const widget = new CumplimientoMaestrosWidget('admin-dashboard-container')
      widget.init()
    } catch (error) {
      console.error('[admin-dashboard] Error:', error)
      container.innerHTML = `<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar cumplimiento: ${error.message}</p></div>`
    }
  })

  // Reportes de Director
  router.register('admin-dashboard-reportes', (container) => {
    try {
      container.innerHTML = `<div id="director-reporting-container"></div>`
      const panel = new DirectorReportingPanel('director-reporting-container')
      panel.init()
    } catch (error) {
      console.error('[admin-dashboard-reportes] Error:', error)
      container.innerHTML = `<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar reportes: ${error.message}</p></div>`
    }
  })

  // Analítica de Llenado de Asistencias
  router.register('admin-dashboard-analitca-llenado', (container) => {
    try {
      container.innerHTML = `<div id="analytics-filling-container"></div>`
      const widget = analyticsFillingBehaviorWidget('analytics-filling-container')
      widget.init()
    } catch (error) {
      console.error('[admin-dashboard-analitca-llenado] Error:', error)
      container.innerHTML = `<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar analítica: ${error.message}</p></div>`
    }
  })

  // Detalle de Maestro - Registros pendientes
  router.register('admin-maestro-detalle', async (container, params) => {
    try {
      container.innerHTML = `<div id="maestro-detalle-container" class="p-4"></div>`
      const { MaestroDetalleView } = await importarConReintento(
        () => import('./views/maestroDetalleView.js'),
        { nombre: 'admin-maestro-detalle' },
      )
      const hashParams = typeof window !== 'undefined' && window.location.hash.includes('?')
        ? Object.fromEntries(new URLSearchParams(window.location.hash.split('?')[1]))
        : {}
      const searchParams = typeof window !== 'undefined' && window.location.search
        ? Object.fromEntries(new URLSearchParams(window.location.search))
        : {}
      const maestroId = params?.maestroId ?? params?.id ?? hashParams.maestroId ?? hashParams.id ?? searchParams.maestroId ?? searchParams.id
      if (!maestroId) {
        container.innerHTML = `
          <div class="p-4 text-center">
            <div class="alert alert-warning d-inline-block shadow-sm">
              <i class="bi bi-person-exclamation me-2"></i>
              No se seleccionó ningún maestro para ver el detalle.
            </div>
            <div class="mt-3">
              <button class="btn btn-primary btn-sm" id="btnVolverMaestrosDetalle">
                <i class="bi bi-arrow-left me-1"></i> Volver al Catálogo de Maestros
              </button>
            </div>
          </div>
        `
        container.querySelector('#btnVolverMaestrosDetalle')?.addEventListener('click', () => {
          router.navigate('maestros')
        })
        return
      }
      const rango = params?.desde && params?.hasta ? { desde: params.desde, hasta: params.hasta } : null
      const view = new MaestroDetalleView('maestro-detalle-container', maestroId, rango)
      view.init()
    } catch (error) {
      console.error('[admin-maestro-detalle] Error:', error)
      container.innerHTML = `<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar detalle: ${error.message}</p></div>`
    }
  })

  // Clases Dadas de un Maestro — contenido, roster y análisis IA de progreso
  router.register('admin-maestro-clases', async (container, params) => {
    try {
      container.innerHTML = `<div id="maestro-clases-container" class="p-4"></div>`
      const { MaestroClasesContenidoView } = await importarConReintento(
        () => import('./views/maestroClasesContenidoView.js'),
        { nombre: 'admin-maestro-clases' },
      )
      const hashParams = typeof window !== 'undefined' && window.location.hash.includes('?')
        ? Object.fromEntries(new URLSearchParams(window.location.hash.split('?')[1]))
        : {}
      const searchParams = typeof window !== 'undefined' && window.location.search
        ? Object.fromEntries(new URLSearchParams(window.location.search))
        : {}
      const maestroId = params?.maestroId ?? params?.id ?? hashParams.maestroId ?? hashParams.id ?? searchParams.maestroId ?? searchParams.id
      if (!maestroId) {
        container.innerHTML = `
          <div class="p-4 text-center">
            <div class="alert alert-warning d-inline-block shadow-sm">
              <i class="bi bi-calendar-x me-2"></i>
              No se especificó el maestro para consultar sus clases.
            </div>
            <div class="mt-3">
              <button class="btn btn-primary btn-sm" id="btnVolverMaestrosClases">
                <i class="bi bi-arrow-left me-1"></i> Volver al Catálogo de Maestros
              </button>
            </div>
          </div>
        `
        container.querySelector('#btnVolverMaestrosClases')?.addEventListener('click', () => {
          router.navigate('maestros')
        })
        return
      }
      const view = new MaestroClasesContenidoView('maestro-clases-container', maestroId)
      view.init()
    } catch (error) {
      console.error('[admin-maestro-clases] Error:', error)
      container.innerHTML = `<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar clases dadas: ${error.message}</p></div>`
    }
  })

  // Reporte de Tendencias para Director
  router.register('admin-dashboard-tendencias', (container) => {
    try {
      container.innerHTML = `<div id="trend-report-container"></div>`
      const view = directorTrendReportView('trend-report-container')
      view.init()
    } catch (error) {
      console.error('[admin-dashboard-tendencias] Error:', error)
      container.innerHTML = `<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar tendencias: ${error.message}</p></div>`
    }
  })

  // Resumen del Mes - Reporte ejecutivo mensual
  router.register('reporte-mensual', async (container) => {
    try {
      container.innerHTML = `<div id="reporte-mensual-container"></div>`
      const { default: ReporteMensualView } = await importarConReintento(
        () => import('./views/reporteMensualView.js'),
        { nombre: 'reporte-mensual' },
      )
      const view = new ReporteMensualView('reporte-mensual-container')
      view.init()
    } catch (error) {
      console.error('[reporte-mensual] Error:', error)
      container.innerHTML = `<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar el resumen mensual: ${error.message}</p></div>`
    }
  })

  // Informe del Período - Reporte ejecutivo semestral
  router.register('reporte-semestral', async (container) => {
    try {
      container.innerHTML = `<div id="reporte-semestral-container"></div>`
      const { default: ReporteSemestralView } = await importarConReintento(
        () => import('./views/reporteSemestralView.js'),
        { nombre: 'reporte-semestral' },
      )
      const view = new ReporteSemestralView('reporte-semestral-container')
      view.init()
    } catch (error) {
      console.error('[reporte-semestral] Error:', error)
      container.innerHTML = `<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar el informe del período: ${error.message}</p></div>`
    }
  })

  // Análisis Pedagógico y Contenido Curricular (Semanal / Mensual / Semestral)
  router.register('analisis-contenido', async (container) => {
    try {
      container.innerHTML = `<div id="analisis-contenido-container"></div>`
      const { default: AnalisisContenidoView } = await importarConReintento(
        () => import('./views/analisisContenidoView.js'),
        { nombre: 'analisis-contenido' },
      )
      const view = new AnalisisContenidoView('analisis-contenido-container')
      view.init()
    } catch (error) {
      console.error('[analisis-contenido] Error:', error)
      container.innerHTML = `<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar el análisis pedagógico: ${error.message}</p></div>`
    }
  })

  // Project Manager Institucional — Motor WBS y DAG
  router.register('proyecto-manager', async (container) => {
    try {
      container.innerHTML = `<div id="proyecto-manager-container" class="p-3"></div>`
      const { renderProyectoManagerView } = await importarConReintento(
        () => import('./views/proyectoManagerView.js'),
        { nombre: 'proyecto-manager' },
      )
      renderProyectoManagerView('proyecto-manager-container')
    } catch (error) {
      console.error('[proyecto-manager] Error:', error)
      container.innerHTML = `<div class="pm-placeholder p-4 text-center text-muted">
        <i class="bi bi-exclamation-triangle fs-3 d-block mb-2"></i>
        <p>Error al cargar el Project Manager: ${error.message}</p>
      </div>`
    }
  })
}
