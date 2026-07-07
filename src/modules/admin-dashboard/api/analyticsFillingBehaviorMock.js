import mockData from '../../../assets/data/mocks/analyticsFillingBehavior.json'
import sessionMockData from '../../../assets/data/mocks/analyticsFillingBehaviorPerSession.json'

export async function getTeacherFillingMetrics(startDate, endDate) {
  let data = [...mockData]

  if (startDate) {
    data = data.filter(m => !m.fecha_ultima_clase || m.fecha_ultima_clase >= startDate)
  }
  if (endDate) {
    data = data.filter(m => !m.fecha_ultima_clase || m.fecha_ultima_clase <= endDate)
  }

  data.sort((a, b) => (a.maestro_nombre || '').localeCompare(b.maestro_nombre || ''))

  return data
}

export async function getFillingMetricsByMaestro(maestroId) {
  return sessionMockData.filter(m => m.maestro_id === maestroId)
}

export async function getTeacherFillingMetricsPerSession(startDate, endDate) {
  let data = [...sessionMockData]

  if (startDate) {
    data = data.filter(m => m.fecha >= startDate)
  }
  if (endDate) {
    data = data.filter(m => m.fecha <= endDate)
  }

  data.sort((a, b) => {
    const d = (b.fecha || '').localeCompare(a.fecha || '')
    if (d !== 0) return d
    return (a.maestro_nombre || '').localeCompare(b.maestro_nombre || '')
  })

  return data
}
