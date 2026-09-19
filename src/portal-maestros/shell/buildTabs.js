import { isRepertoirePilotUser } from '../../modules/repertoire/api/repertoirePilotAccess.js'

/**
 * Pestañas de la barra inferior del portal de maestros — solo vistas de maestro.
 *
 * Repertorio y Seccional son el mismo módulo piloto (aún en desarrollo): solo se
 * muestran a los maestros habilitados. La ruta también está guardada en
 * portalRoutes.js (ROUTE_PERMISSION_GUARDS) para que no se abra por URL.
 *
 * @param {object|null} permisos
 * @param {string|null} maestroId
 */
export function buildTabs(permisos, maestroId = null) {
  const tabs = [
    { id: 'fechas', label: 'Fechas', icon: 'bi-calendar3' },
    { id: 'hoy', label: 'Hoy', icon: 'bi-house-door' },
    { id: 'planificacion', label: 'Plan', icon: 'bi-signpost-split' },
    { id: 'metricas', label: 'Métricas', icon: 'bi-bar-chart-line' },
  ]
  if (isRepertoirePilotUser(maestroId)) {
    tabs.push(
      { id: 'repertorio', label: 'Repertorio', icon: 'bi-music-note-list' },
      { id: 'seccional', label: 'Seccional', icon: 'bi-diagram-3' },
    )
  }
  if (permisos?.puede_inscribir_clases) {
    tabs.push({ id: 'gestionar-clases', label: 'Clases', icon: 'bi-mortarboard' })
  }
  return tabs
}
