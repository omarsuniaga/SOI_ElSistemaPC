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

export async function getResumenCierreAcademico() {
  return {
    rango: { fechaInicio: null, fechaFin: null },
    resumen: {
      totalClases: 12,
      totalContenido: 34,
      totalPresentes: 210,
      totalAusentes: 18,
      totalJustificados: 9,
      totalAlumnos: 42,
    },
    clases: [
      { claseNombre: 'Violín 1', instrumento: 'Violín', maestroNombre: 'Prof. A', sesiones: 6, contenidosTrabajados: 18, presentes: 104, ausentes: 8, justificados: 4 },
      { claseNombre: 'Coro Inicial', instrumento: 'Coro', maestroNombre: 'Prof. B', sesiones: 6, contenidosTrabajados: 16, presentes: 106, ausentes: 10, justificados: 5 },
    ],
    alumnos: [
      { alumnoNombre: 'Valeria Russo', presentes: 12, ausentes: 0, justificados: 0, totalRegistrosProgreso: 8, tasaAsistencia: 100, justificaciones: [] },
      { alumnoNombre: 'Mateo Fernández', presentes: 10, ausentes: 2, justificados: 1, totalRegistrosProgreso: 7, tasaAsistencia: 84.6, justificaciones: ['Cita médica'] },
    ],
  }
}

export async function cerrarPeriodoAcademico({ periodoId, fechaInicio, fechaFin, cerradoPor = null, observaciones = null } = {}) {
  return {
    ok: true,
    periodoId: periodoId || 'mock-periodo',
    fechaInicio: fechaInicio || null,
    fechaFin: fechaFin || null,
    cerradoPor,
    observaciones,
    snapshotId: 'mock-snapshot',
  }
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

export async function getRiesgoAbandono({ nivel = null } = {}) {
  const riesgo = [
    { nombre_completo: 'Mateo Fernández', score_riesgo: 88, nivel_riesgo: 'alto' },
    { nombre_completo: 'Lucía Benítez', score_riesgo: 65, nivel_riesgo: 'medio' },
    { nombre_completo: 'Santiago Morales', score_riesgo: 35, nivel_riesgo: 'bajo' }
  ]
  if (nivel) return riesgo.filter(r => r.nivel_riesgo === nivel)
  return riesgo
}

export async function getAlumnosDestacados() {
  return [
    { nombre_completo: 'Valeria Russo', promedio: 9.85, programa: 'Violín Cátedra' },
    { nombre_completo: 'Thiago Silva', promedio: 9.72, programa: 'Violín Inicial' },
    { nombre_completo: 'Delfina Lombardi', promedio: 9.60, programa: 'Violín Cátedra' }
  ]
}
