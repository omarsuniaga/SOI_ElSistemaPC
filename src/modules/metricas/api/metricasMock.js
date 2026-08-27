import { loadJsonMock } from '../../../core/utils/loadJsonMock.js'

export async function getResumenAlumnos() {
  const data = await loadJsonMock('/assets/data/mocks/resumen_alumnos.json')
  return data
}

export async function getResumenAlumno(alumnoId) {
  const data = await loadJsonMock('/assets/data/mocks/resumen_alumnos.json')
  return data.find(a => a.id === alumnoId) || null
}

export async function getEstadisticasPeriodo(periodoId) {
  const data = await loadJsonMock('/assets/data/mocks/estadisticas_periodo.json')
  return data.find(p => p.id === periodoId) || null
}

export async function getEstadisticasPeriodoActivo() {
  const data = await loadJsonMock('/assets/data/mocks/estadisticas_periodo.json')
  const activo = data?.find(p => p.activo) || null
  if (activo) {
    return {
      ...activo,
      alumnos_activos: 270,
      promedio_integrado: 77.7,
      promedio_calificacion_periodo: 77.7,
      tasa_asistencia_periodo: 92.5,
      alumnos_honor: 43,
      alumnos_riesgo: 38,
      catedras_activas: 20,
      instrumentos_taller: 3
    }
  }
  return {
    id: 'mock-periodo-1',
    nombre: 'Período Lectivo 2026',
    activo: true,
    alumnos_activos: 270,
    promedio_integrado: 77.7,
    promedio_calificacion_periodo: 77.7,
    tasa_asistencia_periodo: 92.5,
    alumnos_honor: 43,
    alumnos_riesgo: 38,
    catedras_activas: 20,
    instrumentos_taller: 3
  }
}

export async function getResumenCierreAcademico(params) {
  return {
    totales: { clases: 120, alumnos: 270, contenidosTrabajados: 450, presentes: 1890, ausentes: 90, justificados: 60, tasaAsistenciaGlobal: 92.8 },
    alumnos: [],
    clases: []
  }
}

export async function getTasaAsistenciaPeriodo(alumnoId, desde, hasta) {
  return 92.5
}

export async function cerrarPeriodoAcademico(params) {
  return { success: true, message: 'Período cerrado exitosamente (Mock)' }
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
  return data?.alertas?.filter(a => a.activo) || []
}

export async function getResumenAlertas() {
  const data = await loadJsonMock('/assets/data/mocks/alertas_config.json')
  const activas = data?.alertas?.filter(a => a.activo) || []
  return {
    total: activas.length || 38,
    rojas: activas.filter(a => a.color === 'rojo').length || 12,
    naranjas: activas.filter(a => a.color === 'naranja').length || 16,
    amarillas: activas.filter(a => a.color === 'amarillo').length || 10
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
    { id: '1', nombre_completo: 'Abigail Oller', promedio: 100, programa: 'Oboe', nivel: 'basico', categoria: 'destacado' },
    { id: '2', nombre_completo: 'Sara Patricia Bello Cabrera', promedio: 100, programa: 'Flauta dulce', nivel: 'basico', categoria: 'destacado' },
    { id: '3', nombre_completo: 'Francisco Emanuel López', promedio: 99, programa: 'Viola', nivel: 'basico', categoria: 'destacado' },
    { id: '4', nombre_completo: 'Ismeray Lara Doñe', promedio: 99, programa: 'Iniciación Musical', nivel: 'basico', categoria: 'destacado' },
    { id: '5', nombre_completo: 'Yangel Jair Medina Ramírez', promedio: 99, programa: 'Clarinete', nivel: 'avanzado', categoria: 'destacado' },
    { id: '6', nombre_completo: 'Helen Siri', promedio: 98, programa: 'Violín', nivel: 'basico', categoria: 'destacado' },
    { id: '7', nombre_completo: 'Dyakenson Lamerique', promedio: 98, programa: 'Violín', nivel: 'avanzado', categoria: 'destacado' },
    { id: '8', nombre_completo: 'Alina Marola Jiménez Vargas', promedio: 98, programa: 'Flauta', nivel: 'intermedio', categoria: 'destacado' }
  ]
}

export async function getDestacadosYRiesgoAcademico({ categoria = null } = {}) {
  const todos = [
    { id: '1', nombre_completo: 'Abigail Oller', promedio: 100, programa: 'Oboe', nivel: 'basico', categoria: 'destacado' },
    { id: '2', nombre_completo: 'Sara Patricia Bello Cabrera', promedio: 100, programa: 'Flauta dulce', nivel: 'basico', categoria: 'destacado' },
    { id: '3', nombre_completo: 'Francisco Emanuel López', promedio: 99, programa: 'Viola', nivel: 'basico', categoria: 'destacado' },
    { id: '4', nombre_completo: 'Ismeray Lara Doñe', promedio: 99, programa: 'Iniciación Musical', nivel: 'basico', categoria: 'destacado' },
    { id: '5', nombre_completo: 'Yangel Jair Medina Ramírez', promedio: 99, programa: 'Clarinete', nivel: 'avanzado', categoria: 'destacado' },
    { id: '6', nombre_completo: 'Helen Siri', promedio: 98, programa: 'Violín', nivel: 'basico', categoria: 'destacado' },
    { id: '7', nombre_completo: 'Dyakenson Lamerique', promedio: 98, programa: 'Violín', nivel: 'avanzado', categoria: 'destacado' },
    { id: '8', nombre_completo: 'Alina Marola Jiménez Vargas', promedio: 98, programa: 'Flauta', nivel: 'intermedio', categoria: 'destacado' },
    { id: '9', nombre_completo: 'Samuel Sosa', promedio: 83.5, programa: 'Piano', nivel: 'intermedio', categoria: 'regular' },
    { id: '10', nombre_completo: 'Ronald Gonzalez', promedio: 79, programa: 'Piano', nivel: 'basico', categoria: 'regular' },
    { id: '11', nombre_completo: 'Lismell Noba Jimenez', promedio: 42, programa: 'Iniciación Musical', nivel: 'basico', categoria: 'riesgo_academico' }
  ]

  if (categoria) return todos.filter(a => a.categoria === categoria)
  return todos
}

export async function getHistorialCierresPeriodos(limitOrOptions = 20) {
  return [
    {
      id: 'cierre-mock-1',
      periodo_id: 'periodo-2025-2',
      fecha_inicio: '2025-09-01',
      fecha_fin: '2025-12-15',
      cerrado_por: 'Administrador Demo',
      observaciones: 'Cierre de ciclo regular sin novedades.',
      resumen: { clases: 240, alumnos: 265, tasaAsistenciaGlobal: 93.4 },
      created_at: '2025-12-16T18:00:00.000Z',
      periodos: { nombre: 'Ciclo Regular 2025-II', cerrado: true }
    }
  ]
}

export const getCierresAcademicos = getHistorialCierresPeriodos

export async function getAnalisisAsistenciasPeriodoActivo() {
  return {
    periodo: {
      id: 'per-demo-1',
      nombre: 'Semestre Demo 2026-I',
      fecha_inicio: '2026-01-15',
      fecha_fin: '2026-06-15',
      activo: true,
    },
    resumen: {
      totalAlumnosEvaluados: 12,
      alumnosConFaltas: 4,
      alumnosSinFaltas: 8,
      porcentajeAlumnosConFaltas: 33.3,
      totalRegistros: 120,
      totalPresentes: 110,
      totalAusentes: 8,
      totalJustificados: 2,
      tasaAusentismo: 6.7,
      totalSesionesRegistradas: 24,
      totalMaestrosConRegistros: 3,
    },
    alumnos: [
      {
        alumnoId: 'alum-demo-1',
        alumnoNombre: 'Mateo Fernández',
        instrumento: 'Violín',
        programa: 'Cátedra',
        totalPresentes: 10,
        totalAusentes: 3,
        totalJustificados: 1,
        totalRegistros: 14,
        tasaAsistencia: 71.4,
        nivelRiesgo: 'critico',
        ultimaFalta: '2026-03-10',
        clasesAfectadas: ['Violín Práctica'],
        maestrosReportaron: ['Prof. Carlos Méndez'],
        detalleFaltas: [],
      }
    ],
    maestros: [
      {
        maestroId: 'm-demo-1',
        maestroNombre: 'Prof. Carlos Méndez',
        totalSesiones: 12,
        totalRegistros: 60,
        totalPresentes: 55,
        totalAusentes: 4,
        totalJustificados: 1,
        tasaAusentismo: 6.7,
        clases: ['Violín Práctica'],
      }
    ],
  }
}
