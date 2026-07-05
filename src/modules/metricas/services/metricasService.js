import { getEstadisticasPeriodoActivo, getTasaAsistenciaPeriodo, getAlertasActivas, getResumenAlertas } from '../api/metricasApi.js'

export class MetricasService {
  constructor() {
    this.cache = new Map()
    this.cacheExpiry = 5 * 60 * 1000
  }

  getCached(key) {
    const entry = this.cache.get(key)
    if (entry && Date.now() - entry.timestamp < this.cacheExpiry) {
      return entry.data
    }
    return null
  }

  setCached(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  async getDashboardData() {
    const cached = this.getCached('dashboard')
    if (cached) return cached

    const periodoActivo = await getEstadisticasPeriodoActivo()
    const alertas = await getResumenAlertas()
    const alertasActivas = await getAlertasActivas()

    const data = { periodoActivo, alertas, alertasActivas }
    this.setCached('dashboard', data)
    return data
  }

  async getTasaAsistenciaAlumno(alumnoId, dias = 30) {
    const desde = new Date()
    desde.setDate(desde.getDate() - dias)
    return getTasaAsistenciaPeriodo(alumnoId, desde.toISOString().split('T')[0])
  }

  calcularPorcentaje(tasa, umbrales) {
    if (tasa < umbrales.rojo) return 'rojo'
    if (tasa < umbrales.naranja) return 'naranja'
    if (tasa < umbrales.amarillo) return 'amarillo'
    return 'verde'
  }

  generarAlertas(tasa, config) {
    const alerts = []
    if (tasa < config.umbral_rojo) {
      alerts.push({ nivel: 'rojo', mensaje: 'Asistencia crítica' })
    } else if (tasa < config.umbral_naranja) {
      alerts.push({ nivel: 'naranja', mensaje: 'Asistencia baja' })
    } else if (tasa < config.umbral_amarillo) {
      alerts.push({ nivel: 'amarillo', mensaje: 'Precaución' })
    }
    return alerts
  }

  clearCache() {
    this.cache.clear()
  }
}

export const metricasService = new MetricasService()