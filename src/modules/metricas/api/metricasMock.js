import { loadJsonMock } from '../../../core/utils/loadJsonMock.js'

const DATA_PATH = '/assets/data/mocks/metricas_periodo.json'

export async function getResumenAlumnos() {
  const data = await loadJsonMock(DATA_PATH)
  return data.estadisticas_periodo[0]?.total_alumnos || 0
}

export async function getResumenAlumno(alumnoId) {
  return null
}

export async function getEstadisticasPeriodo() {
  const data = await loadJsonMock(DATA_PATH)
  return data.configuraciones
}

export async function getEstadisticasPeriodoActivo() {
  const data = await loadJsonMock(DATA_PATH)
  const activo = data.configuraciones.find(c => c.activo)
  const est = data.estadisticas_periodo.find(e => e.periodo_id === activo?.id)
  return activo ? { ...activo, ...est } : null
}

export async function getTasaAsistenciaPeriodo(alumnoId, desde, hasta = null) {
  return 87.5
}

export async function getAlertasConfig() {
  const data = await loadJsonMock('/assets/data/mocks/alertas_config.json')
  return data
}

export async function updateAlertaConfig(alertaId, updates) {
  console.log('Mock: updateAlertaConfig', alertaId, updates)
  return { id: alertaId, ...updates }
}

export async function getAlertasActivas(options = {}) {
  const data = await loadJsonMock('/assets/data/mocks/alertas_config.json')
  return data.alertas.filter(a => a.activo)
}

export async function getResumenAlertas() {
  const data = await loadJsonMock('/assets/data/mocks/alertas_config.json')
  const activas = data.alertas.filter(a => a.activo)
  return {
    total: activas.length,
    rojas: activas.filter(a => a.color === 'rojo').length,
    naranjas: activas.filter(a => a.color === 'naranja').length,
    amarillas: activas.filter(a => a.color === 'amarillo').length
  }
}

export async function getHistorialEstadoAlumno(alumnoId) {
  return []
}

export async function getRachaAusencias(alumnoId) {
  return 0
}