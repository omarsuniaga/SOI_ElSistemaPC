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
  return activo ? {
    ...activo,
    ...est,
    // Campos mapeados al contrato real de vw_estadisticas_periodo
    alumnos_activos: est.total_alumnos ?? 0,
    promedio_calificacion_periodo: est.promedio_calificaciones ?? 7.82,
    promedio_integrado: est.promedio_calificaciones ?? 7.82, // Demo: sin estrellas, integrado = notas
    tasa_asistencia_periodo: est.tasa_asistencia_promedio ?? 87.5,
    // Hardcodes legacy (out of scope para esta task)
    alumnos_riesgo: 3,
    instrumentos_taller: 2
  } : null
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

// ─── ANÁLISIS DE ASISTENCIAS E INASISTENCIAS DEL PERÍODO ACTIVO ──────────────

export async function getAnalisisAsistenciasPeriodoActivo({ periodoId = null, fechaInicio = null, fechaFin = null } = {}) {
  const periodosData = await loadJsonMock('/assets/data/mocks/metricas_periodo.json')
  const activo = periodosData?.configuraciones?.find(c => c.activo) || {
    id: 'per-001',
    nombre: 'Trimestre 1 2026',
    fecha_inicio: '2026-01-15',
    fecha_fin: '2026-04-15',
    activo: true,
  }

  const pInicio = fechaInicio || activo.fecha_inicio || '2026-01-15'
  const pFin = fechaFin || activo.fecha_fin || '2026-04-15'
  const pNombre = activo.nombre || 'Trimestre 1 2026'
  const pId = periodoId || activo.id || 'per-001'

  const inicioDate = new Date(pInicio)
  const ahoraDate = new Date()
  const diffTime = Math.abs(ahoraDate - inicioDate)
  const diasTranscurridos = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  const alumnos = [
    {
      alumnoId: 'alum-001',
      alumnoNombre: 'Mateo Fernández',
      instrumento: 'Violín',
      programa: 'Violín Cátedra Intermedio',
      totalPresentes: 10,
      totalAusentes: 4,
      totalJustificados: 1,
      totalTardes: 1,
      totalRegistros: 15,
      tasaAsistencia: 73.3,
      nivelRiesgo: 'critico',
      ultimaFalta: '2026-03-28',
      clasesAfectadas: ['Violín Práctica Avanzada', 'Lenguaje Musical II'],
      maestrosReportaron: ['Prof. Carlos Méndez', 'Prof. Elena Ramos'],
      detalleFaltas: [
        { fecha: '2026-03-28', claseNombre: 'Violín Práctica Avanzada', maestroNombre: 'Prof. Carlos Méndez', estado: 'ausente', justificacion: null },
        { fecha: '2026-03-21', claseNombre: 'Violín Práctica Avanzada', maestroNombre: 'Prof. Carlos Méndez', estado: 'ausente', justificacion: null },
        { fecha: '2026-03-14', claseNombre: 'Lenguaje Musical II', maestroNombre: 'Prof. Elena Ramos', estado: 'ausente', justificacion: null },
        { fecha: '2026-02-20', claseNombre: 'Lenguaje Musical II', maestroNombre: 'Prof. Elena Ramos', estado: 'ausente', justificacion: null },
        { fecha: '2026-02-05', claseNombre: 'Violín Práctica Avanzada', maestroNombre: 'Prof. Carlos Méndez', estado: 'justificado', justificacion: 'Cita médica pediátrica' },
      ],
    },
    {
      alumnoId: 'alum-002',
      alumnoNombre: 'Lucía Benítez',
      instrumento: 'Violonchelo',
      programa: 'Cuerdas Graves',
      totalPresentes: 11,
      totalAusentes: 3,
      totalJustificados: 1,
      totalTardes: 0,
      totalRegistros: 15,
      tasaAsistencia: 80.0,
      nivelRiesgo: 'critico',
      ultimaFalta: '2026-03-25',
      clasesAfectadas: ['Ensamble Cuerdas', 'Violonchelo Cátedra'],
      maestrosReportaron: ['Prof. Roberto Díaz'],
      detalleFaltas: [
        { fecha: '2026-03-25', claseNombre: 'Violonchelo Cátedra', maestroNombre: 'Prof. Roberto Díaz', estado: 'ausente', justificacion: null },
        { fecha: '2026-03-11', claseNombre: 'Ensamble Cuerdas', maestroNombre: 'Prof. Roberto Díaz', estado: 'ausente', justificacion: null },
        { fecha: '2026-02-18', claseNombre: 'Violonchelo Cátedra', maestroNombre: 'Prof. Roberto Díaz', estado: 'ausente', justificacion: null },
        { fecha: '2026-02-04', claseNombre: 'Ensamble Cuerdas', maestroNombre: 'Prof. Roberto Díaz', estado: 'justificado', justificacion: 'Reposo por gripe' },
      ],
    },
    {
      alumnoId: 'alum-003',
      alumnoNombre: 'Santiago Morales',
      instrumento: 'Viola',
      programa: 'Viola Práctica',
      totalPresentes: 12,
      totalAusentes: 2,
      totalJustificados: 1,
      totalTardes: 1,
      totalRegistros: 15,
      tasaAsistencia: 86.7,
      nivelRiesgo: 'alerta',
      ultimaFalta: '2026-03-18',
      clasesAfectadas: ['Viola Práctica'],
      maestrosReportaron: ['Prof. Carlos Méndez'],
      detalleFaltas: [
        { fecha: '2026-03-18', claseNombre: 'Viola Práctica', maestroNombre: 'Prof. Carlos Méndez', estado: 'ausente', justificacion: null },
        { fecha: '2026-03-04', claseNombre: 'Viola Práctica', maestroNombre: 'Prof. Carlos Méndez', estado: 'ausente', justificacion: null },
        { fecha: '2026-02-11', claseNombre: 'Viola Práctica', maestroNombre: 'Prof. Carlos Méndez', estado: 'justificado', justificacion: 'Compromiso familiar notificado' },
      ],
    },
    {
      alumnoId: 'alum-004',
      alumnoNombre: 'Camila Rodríguez',
      instrumento: 'Flauta Dulce',
      programa: 'Iniciación Maderas',
      totalPresentes: 12,
      totalAusentes: 2,
      totalJustificados: 0,
      totalTardes: 0,
      totalRegistros: 14,
      tasaAsistencia: 85.7,
      nivelRiesgo: 'alerta',
      ultimaFalta: '2026-03-12',
      clasesAfectadas: ['Iniciación Instrumental'],
      maestrosReportaron: ['Prof. María García'],
      detalleFaltas: [
        { fecha: '2026-03-12', claseNombre: 'Iniciación Instrumental', maestroNombre: 'Prof. María García', estado: 'ausente', justificacion: null },
        { fecha: '2026-02-26', claseNombre: 'Iniciación Instrumental', maestroNombre: 'Prof. María García', estado: 'ausente', justificacion: null },
      ],
    },
    {
      alumnoId: 'alum-005',
      alumnoNombre: 'Diego Torres',
      instrumento: 'Contrabajo',
      programa: 'Cuerdas Graves',
      totalPresentes: 11,
      totalAusentes: 1,
      totalJustificados: 2,
      totalTardes: 0,
      totalRegistros: 14,
      tasaAsistencia: 92.9,
      nivelRiesgo: 'alerta',
      ultimaFalta: '2026-03-05',
      clasesAfectadas: ['Práctica Orquestal'],
      maestrosReportaron: ['Prof. Roberto Díaz'],
      detalleFaltas: [
        { fecha: '2026-03-05', claseNombre: 'Práctica Orquestal', maestroNombre: 'Prof. Roberto Díaz', estado: 'ausente', justificacion: null },
        { fecha: '2026-02-12', claseNombre: 'Práctica Orquestal', maestroNombre: 'Prof. Roberto Díaz', estado: 'justificado', justificacion: 'Trámite escolar' },
        { fecha: '2026-01-29', claseNombre: 'Práctica Orquestal', maestroNombre: 'Prof. Roberto Díaz', estado: 'justificado', justificacion: 'Cita odontológica' },
      ],
    },
    {
      alumnoId: 'alum-006',
      alumnoNombre: 'Valentina Morales',
      instrumento: 'Coro',
      programa: 'Coro Infantil',
      totalPresentes: 12,
      totalAusentes: 1,
      totalJustificados: 1,
      totalTardes: 0,
      totalRegistros: 14,
      tasaAsistencia: 92.9,
      nivelRiesgo: 'alerta',
      ultimaFalta: '2026-02-28',
      clasesAfectadas: ['Coro Infantil'],
      maestrosReportaron: ['Prof. Elena Ramos'],
      detalleFaltas: [
        { fecha: '2026-02-28', claseNombre: 'Coro Infantil', maestroNombre: 'Prof. Elena Ramos', estado: 'ausente', justificacion: null },
        { fecha: '2026-02-14', claseNombre: 'Coro Infantil', maestroNombre: 'Prof. Elena Ramos', estado: 'justificado', justificacion: 'Problemas de transporte' },
      ],
    },
    {
      alumnoId: 'alum-007',
      alumnoNombre: 'Valeria Russo',
      instrumento: 'Violín',
      programa: 'Violín Cátedra Avanzada',
      totalPresentes: 15,
      totalAusentes: 0,
      totalJustificados: 0,
      totalTardes: 0,
      totalRegistros: 15,
      tasaAsistencia: 100.0,
      nivelRiesgo: 'normal',
      ultimaFalta: null,
      clasesAfectadas: [],
      maestrosReportaron: [],
      detalleFaltas: [],
    },
    {
      alumnoId: 'alum-008',
      alumnoNombre: 'Thiago Silva',
      instrumento: 'Violín',
      programa: 'Violín Inicial',
      totalPresentes: 15,
      totalAusentes: 0,
      totalJustificados: 0,
      totalTardes: 0,
      totalRegistros: 15,
      tasaAsistencia: 100.0,
      nivelRiesgo: 'normal',
      ultimaFalta: null,
      clasesAfectadas: [],
      maestrosReportaron: [],
      detalleFaltas: [],
    },
    {
      alumnoId: 'alum-009',
      alumnoNombre: 'Delfina Lombardi',
      instrumento: 'Violín',
      programa: 'Violín Cátedra',
      totalPresentes: 14,
      totalAusentes: 0,
      totalJustificados: 0,
      totalTardes: 0,
      totalRegistros: 14,
      tasaAsistencia: 100.0,
      nivelRiesgo: 'normal',
      ultimaFalta: null,
      clasesAfectadas: [],
      maestrosReportaron: [],
      detalleFaltas: [],
    },
    {
      alumnoId: 'alum-010',
      alumnoNombre: 'Joaquín Medina',
      instrumento: 'Percusión',
      programa: 'Percusión y Rítmica',
      totalPresentes: 13,
      totalAusentes: 0,
      totalJustificados: 0,
      totalTardes: 0,
      totalRegistros: 13,
      tasaAsistencia: 100.0,
      nivelRiesgo: 'normal',
      ultimaFalta: null,
      clasesAfectadas: [],
      maestrosReportaron: [],
      detalleFaltas: [],
    },
    {
      alumnoId: 'alum-011',
      alumnoNombre: 'Martina Castillo',
      instrumento: 'Piano',
      programa: 'Piano Complementario',
      totalPresentes: 13,
      totalAusentes: 0,
      totalJustificados: 0,
      totalTardes: 0,
      totalRegistros: 13,
      tasaAsistencia: 100.0,
      nivelRiesgo: 'normal',
      ultimaFalta: null,
      clasesAfectadas: [],
      maestrosReportaron: [],
      detalleFaltas: [],
    },
    {
      alumnoId: 'alum-012',
      alumnoNombre: 'Samuel Gómez',
      instrumento: 'Trompeta',
      programa: 'Metales Inicial',
      totalPresentes: 12,
      totalAusentes: 0,
      totalJustificados: 0,
      totalTardes: 0,
      totalRegistros: 12,
      tasaAsistencia: 100.0,
      nivelRiesgo: 'normal',
      ultimaFalta: null,
      clasesAfectadas: [],
      maestrosReportaron: [],
      detalleFaltas: [],
    },
  ]

  const maestros = [
    {
      maestroId: 'maestro_001',
      maestroNombre: 'Prof. Carlos Méndez',
      totalSesiones: 14,
      totalRegistros: 98,
      totalPresentes: 87,
      totalAusentes: 6,
      totalJustificados: 5,
      tasaAusentismo: 6.1,
      clases: ['Violín Práctica Avanzada', 'Viola Práctica'],
    },
    {
      maestroId: 'maestro_002',
      maestroNombre: 'Prof. Roberto Díaz',
      totalSesiones: 12,
      totalRegistros: 84,
      totalPresentes: 75,
      totalAusentes: 5,
      totalJustificados: 4,
      tasaAusentismo: 6.0,
      clases: ['Ensamble Cuerdas', 'Violonchelo Cátedra', 'Práctica Orquestal'],
    },
    {
      maestroId: 'maestro_003',
      maestroNombre: 'Prof. Elena Ramos',
      totalSesiones: 11,
      totalRegistros: 77,
      totalPresentes: 70,
      totalAusentes: 4,
      totalJustificados: 3,
      tasaAusentismo: 5.2,
      clases: ['Lenguaje Musical II', 'Coro Infantil'],
    },
    {
      maestroId: 'maestro_004',
      maestroNombre: 'Prof. María García',
      totalSesiones: 9,
      totalRegistros: 63,
      totalPresentes: 59,
      totalAusentes: 2,
      totalJustificados: 2,
      tasaAusentismo: 3.2,
      clases: ['Iniciación Instrumental', 'Flauta Maderas'],
    },
  ]

  const totalAlumnosEvaluados = alumnos.length
  const alumnosConFaltas = alumnos.filter(a => a.totalAusentes > 0).length
  const alumnosSinFaltas = totalAlumnosEvaluados - alumnosConFaltas
  const porcentajeAlumnosConFaltas = Number(((alumnosConFaltas / totalAlumnosEvaluados) * 100).toFixed(1))
  const totalRegistros = alumnos.reduce((acc, a) => acc + a.totalRegistros, 0)
  const totalPresentes = alumnos.reduce((acc, a) => acc + a.totalPresentes, 0)
  const totalAusentes = alumnos.reduce((acc, a) => acc + a.totalAusentes, 0)
  const totalJustificados = alumnos.reduce((acc, a) => acc + a.totalJustificados, 0)
  const tasaAusentismo = Number(((totalAusentes / totalRegistros) * 100).toFixed(1))

  return {
    periodo: {
      id: pId,
      nombre: pNombre,
      fecha_inicio: pInicio,
      fecha_fin: pFin,
      activo: activo.activo ?? true,
      dias_transcurridos: diasTranscurridos,
    },
    resumen: {
      totalAlumnosEvaluados,
      alumnosConFaltas,
      alumnosSinFaltas,
      porcentajeAlumnosConFaltas,
      totalRegistros,
      totalPresentes,
      totalAusentes,
      totalJustificados,
      tasaAusentismo,
      totalSesionesRegistradas: maestros.reduce((acc, m) => acc + m.totalSesiones, 0),
      totalMaestrosConRegistros: maestros.length,
    },
    alumnos,
    maestros,
  }
}

// ─── ALERTAS DE ASISTENCIA (MOCK) ────────────────────────────────────

export async function getStudentAbsencesSummary(daysBack = 7) {
  return {
    periodo_dias: daysBack,
    fecha_inicio: new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString(),
    fecha_fin: new Date().toISOString(),
    total_alumnos_con_faltas: 3,
    alumnos: [
      {
        id: 'student-001',
        nombre: 'Juan García López',
        phone: '+1-555-0001',
        representante_phone: '+1-555-9001',
        faltas_periodo: 3,
        total_faltas_historico: 12,
        clases_ausente: [
          { grupo: 'Violines 1B', fecha: '2026-08-15', maestro: 'Prof. Omar Suniaga' },
          { grupo: 'Violines 1B', fecha: '2026-08-13', maestro: 'Prof. Omar Suniaga' },
          { grupo: 'Violines 1B', fecha: '2026-08-10', maestro: 'Prof. Omar Suniaga' },
        ],
      },
      {
        id: 'student-002',
        nombre: 'María Rodríguez Pérez',
        phone: '+1-555-0002',
        representante_phone: '+1-555-9002',
        faltas_periodo: 2,
        total_faltas_historico: 8,
        clases_ausente: [
          { grupo: 'Clarinete 2A', fecha: '2026-08-14', maestro: 'Prof. María López' },
          { grupo: 'Clarinete 2A', fecha: '2026-08-11', maestro: 'Prof. María López' },
        ],
      },
      {
        id: 'student-003',
        nombre: 'Carlos Martínez Díaz',
        phone: '+1-555-0003',
        representante_phone: '+1-555-9003',
        faltas_periodo: 1,
        total_faltas_historico: 5,
        clases_ausente: [
          { grupo: 'Coro Inicial', fecha: '2026-08-12', maestro: 'Prof. Juan Pérez' },
        ],
      },
    ],
  }
}

export async function getIncompleteClassSessions() {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - today.getDay() + 1)

  return {
    semana_inicio: monday.toISOString(),
    semana_fin: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    total_incompletas: 2,
    sesiones_incompletas: [
      {
        id: 'session-001',
        fecha: '2026-08-15',
        grupo: 'Violines 1B',
        hora: '15:30',
        maestro_id: 'maestro-001',
        maestro_nombre: 'Omar Suniaga',
        maestro_whatsapp: '+1-555-8001',
        maestro_phone: '+1-555-8001',
      },
      {
        id: 'session-002',
        fecha: '2026-08-14',
        grupo: 'Clarinete 3A',
        hora: '16:00',
        maestro_id: 'maestro-002',
        maestro_nombre: 'María López',
        maestro_whatsapp: '+1-555-8002',
        maestro_phone: '+1-555-8002',
      },
    ],
  }
}
