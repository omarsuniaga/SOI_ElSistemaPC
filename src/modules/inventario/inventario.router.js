import { router } from '../../core/router/router.js'
import { renderStockInstrumentosView } from './views/stockInstrumentosView.js'
import { renderControlComodatosView } from './views/controlComodatosView.js'
import { renderAlertasComodatosView } from './views/alertasComodatosView.js'
import { renderDashboardInventarioView } from './views/dashboardInventarioView.js'
import { renderDetalleInstrumentoView } from './views/detalleInstrumentoView.js'
import { renderHistorialInstrumentoView } from './views/historialInstrumentoView.js'
import { renderReportesInventarioView } from './views/reportesInventarioView.js'
import { renderReparacionesView } from './views/reparacionesView.js'
import { renderDetalleReparacionView } from './views/detalleReparacionView.js'
import { renderFacturasReparacionView } from './views/facturasReparacionView.js'
import { renderIntercambioInstrumentosView } from './views/intercambioInstrumentosView.js'

export function registerRoutesInventario() {
  router.register('inventario-stock', renderStockInstrumentosView)
  router.register('inventario-comodatos', renderControlComodatosView)
  router.register('inventario-alertas', renderAlertasComodatosView)
  router.register('inventario-dashboard', renderDashboardInventarioView)
  router.register('inventario-detalle', renderDetalleInstrumentoView)
  router.register('inventario-historial', renderHistorialInstrumentoView)
  router.register('inventario-reportes', renderReportesInventarioView)
  router.register('inventario-reparaciones', renderReparacionesView)
  router.register('inventario-reparacion', renderDetalleReparacionView)
  router.register('inventario-facturas', renderFacturasReparacionView)
  router.register('inventario-intercambio', renderIntercambioInstrumentosView)
}
