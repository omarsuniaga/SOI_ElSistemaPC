import clasesMock from '../../../../assets/data/mocks/clases.json'
import maestrosMock from '../../../../assets/data/mocks/maestros.json'
import alumnosMock from '../../../../assets/data/mocks/alumnos.json'
import sesionesMock from '../../../../assets/data/mocks/sesiones.json'

// ─── MEMORY DB ───────────────────────────────────────────────────────────────

let dbSesiones = [...sesionesMock.sesiones]
let dbAsistencias = []
let dbJustificaciones = []
let dbObservaciones = []
let dbContenidos = []

// Populate initial mock data for existing registered sessions
dbSesiones.forEach(s => {
  if (s.estado === 'registrada') {
    // Distribute students to simulate class enrollment
    const studentsInClass = (alumnosMock || []).slice(0, 8) 
    studentsInClass.forEach((st, idx) => {
      const states = ['presente', 'presente', 'presente', 'ausente', 'justificado', 'tarde']
      const estado = states[idx % states.length]
      
      dbAsistencias.push({
        id: `mock-ast-${s.id}-${st.id}`,
        sesion_clase_id: s.id,
        clase_id: s.clase_id,
        alumno_id: st.id,
        fecha: s.fecha,
        estado: estado,
        justificacion_texto: estado === 'justificado' ? 'Presentó justificativo médico' : null,
        observaciones: idx % 3 === 0 ? 'Llegó con retraso pero recuperó clase.' : null
      })

      if (estado === 'justificado') {
        dbJustificaciones.push({
          alumno_id: st.id,
          sesion_id: s.id,
          motivo: 'Médica',
          descripcion: 'Cita con pediatra',
          archivo_url: 'https://example.com/justificante.pdf',
          estado: 'aprobado'
        })
      }
    })

    dbObservaciones.push({
      id: `mock-obs-${s.id}`,
      sesion_clase_id: s.id,
      tipo: 'academico',
      titulo: 'Buen ritmo',
      descripcion: 'El grupo avanzó rápido en la escala de Do.',
      prioridad: 'baja',
      alumno_id: studentsInClass[0].id
    })

    dbContenidos.push({
      id: `mock-cont-${s.id}`,
      sesion_clase_id: s.id,
      descripcion: s.tema,
      nivel_logro: '4/5',
      planificacion_id: 'plan_001'
    })
  }
})

// ─── CONSTANTES ──────────────────────────────────────────────────────────────

export const ESTADOS = {
  PRESENTE: 'presente',
  AUSENTE: 'ausente',
  JUSTIFICADO: 'justificado',
  TARDE: 'tarde',
}

export const ESTADO_LABEL = {
  presente: { short: 'P', label: 'Presente', css: 'success' },
  ausente: { short: 'A', label: 'Ausente', css: 'danger' },
  justificado: { short: 'J', label: 'Justificado', css: 'warning' },
}

// ─── TIMELINE ────────────────────────────────────────────────────────────────

export async function getSesionesPorRango({
  fechaInicio,
  fechaFin,
  claseId,
  maestroId,
} = {}) {
  let filtered = [...dbSesiones]

  if (fechaInicio) filtered = filtered.filter(s => s.fecha >= fechaInicio)
  if (fechaFin) filtered = filtered.filter(s => s.fecha <= fechaFin)
  if (claseId) filtered = filtered.filter(s => s.clase_id === claseId)
  if (maestroId) filtered = filtered.filter(s => s.maestro_id === maestroId)

  const sesiones = filtered.map(sc => {
    const classInfo = clasesMock.clases.find(c => c.id === sc.clase_id) || {}
    const teacherInfo = (maestrosMock || []).find(m => m.id === sc.maestro_id) || {}
    const scAsistencias = dbAsistencias.filter(a => a.sesion_clase_id === sc.id)

    return {
      sesionId: sc.id,
      fecha: sc.fecha,
      horaInicio: sc.hora_inicio,
      horaFin: sc.hora_fin,
      temaPrincipal: sc.tema || 'Sin tema',
      observacionesGenerales: sc.contenido || '',
      estado: sc.estado,
      claseId: sc.clase_id,
      claseNombre: classInfo.nombre ?? '—',
      instrumento: classInfo.instrumento ?? '—',
      maestroId: sc.maestro_id,
      maestroNombre: teacherInfo.nombre_completo ?? '—',
      totalPresentes: scAsistencias.filter(a => a.estado === ESTADOS.PRESENTE).length,
      totalAusentes: scAsistencias.filter(a => a.estado === ESTADOS.AUSENTE).length,
      totalJustificados: scAsistencias.filter(a => a.estado === ESTADOS.JUSTIFICADO).length,
      totalRegistros: scAsistencias.length,
    }
  })

  // Group by date
  const map = new Map()
  for (const s of sesiones) {
    if (!map.has(s.fecha)) map.set(s.fecha, [])
    map.get(s.fecha).push(s)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([fecha, sesiones]) => ({ fecha, sesiones }))
}

// ─── DETALLE SESIÓN ──────────────────────────────────────────────────────────

export async function getDetalleSesion(sesionId) {
  const sc = dbSesiones.find(s => s.id === sesionId)
  if (!sc) throw new Error('Sesión no encontrada')

  const classInfo = clasesMock.clases.find(c => c.id === sc.clase_id) || {}
  const teacherInfo = (maestrosMock || []).find(m => m.id === sc.maestro_id) || {}
  
  const asistencias = dbAsistencias.filter(a => a.sesion_clase_id === sesionId)
  const observaciones = dbObservaciones.filter(o => o.sesion_clase_id === sesionId)
  const contenidos = dbContenidos.filter(c => c.sesion_clase_id === sesionId)

  return {
    sesion: {
      id: sc.id,
      fecha: sc.fecha,
      horaInicio: sc.hora_inicio,
      horaFin: sc.hora_fin,
      temaPrincipal: sc.tema || 'Sin tema',
      observacionesGenerales: sc.contenido || '',
      // Espeja la forma del adaptador real: el contenido del maestro va en `contenido`.
      contenido: sc.contenido || null,
      estado: sc.estado,
      claseNombre: classInfo.nombre ?? '—',
      instrumento: classInfo.instrumento ?? '—',
      salon: classInfo.salon ?? null,
      maestroNombre: teacherInfo.nombre_completo ?? '—',
    },
    asistencias: asistencias.map(a => {
      const studentInfo = (alumnosMock || []).find(st => st.id === a.alumno_id) || {}
      const justif = dbJustificaciones.find(j => j.alumno_id === a.alumno_id && j.sesion_id === sesionId)
      return {
        id: a.id,
        estado: a.estado,
        justificacionTexto: a.justificacion_texto,
        observacion: a.observaciones,
        alumnoId: a.alumno_id,
        alumnoNombre: studentInfo.nombre_completo ?? 'Estudiante Mock',
        justificacion: justif ?? null,
      }
    }),
    observaciones: observaciones.map(o => {
      const studentInfo = (alumnosMock || []).find(st => st.id === o.alumno_id) || {}
      return {
        id: o.id,
        tipo: o.tipo,
        titulo: o.titulo,
        descripcion: o.descripcion,
        prioridad: o.prioridad,
        alumnoId: o.alumno_id,
        alumnoNombre: studentInfo.nombre_completo ?? 'Estudiante Mock',
      }
    }),
    contenidos: contenidos.map(c => ({
      id: c.id,
      descripcion: c.descripcion,
      nivelLogro: c.nivel_logro,
      planTitulo: 'Planificación General'
    }))
  }
}

// ─── REPORTE COMPLETO ────────────────────────────────────────────────────────

export async function getReporteCompleto({ fechaInicio, fechaFin } = {}) {
  const grupos = await getSesionesPorRango({ fechaInicio, fechaFin })
  
  const resumen = {
    totalSesiones: dbSesiones.length,
    totalRegistros: dbAsistencias.length,
    totalPresentes: dbAsistencias.filter(a => a.estado === ESTADOS.PRESENTE).length,
    totalAusentes: dbAsistencias.filter(a => a.estado === ESTADOS.AUSENTE).length,
    totalJustificados: dbAsistencias.filter(a => a.estado === ESTADOS.JUSTIFICADO).length,
  }

  const gruposConDetalle = grupos.map(g => ({
    fecha: g.fecha,
    sesiones: g.sesiones.map(s => {
      const asistenciasSesion = dbAsistencias.filter(a => a.sesion_clase_id === s.sesionId)
      return {
        ...s,
        alumnos: asistenciasSesion.map(a => {
          const studentInfo = (alumnosMock || []).find(st => st.id === a.alumno_id) || {}
          return {
            alumnoNombre: studentInfo.nombre_completo ?? 'Estudiante Mock',
            estado: a.estado,
            justificacionTexto: a.justificacion_texto,
            justificacionMotivo: 'Personal'
          }
        })
      }
    })
  }))

  return { grupos: gruposConDetalle, resumen }
}

// ─── FILTROS ─────────────────────────────────────────────────────────────────

export async function getPeriodos() {
  return [
    { id: 'p_2026_1', nombre: 'Semestre 2026-I', fecha_inicio: '2026-01-15', fecha_fin: '2026-06-15', activo: true },
    { id: 'p_2025_2', nombre: 'Semestre 2025-II', fecha_inicio: '2025-08-15', fecha_fin: '2025-12-15', activo: false }
  ]
}

export async function getPeriodoActivo() {
  return { id: 'p_2026_1', nombre: 'Semestre 2026-I', fecha_inicio: '2026-01-15', fecha_fin: '2026-06-15' }
}

export async function getClases() {
  return clasesMock.clases.map(c => ({ id: c.id, nombre: c.nombre, instrumento: c.instrumento }))
}

export async function getMaestros() {
  return (maestrosMock || []).map(m => ({ id: m.id, nombre_completo: m.nombre_completo }))
}

// ─── CRUD LEGACY ─────────────────────────────────────────────────────────────

export async function obtenerAsistencias() {
  return dbAsistencias
}

export async function obtenerAsistencia(id) {
  return dbAsistencias.find(a => a.id === id) || null
}

export async function crearAsistencia(asistencia) {
  const newAst = {
    id: `mock-ast-${Date.now()}`,
    clase_id: asistencia.clase_id,
    alumno_id: asistencia.alumno_id,
    fecha: asistencia.fecha,
    estado: asistencia.estado,
    justificacion_texto: asistencia.justificacion_texto || null,
    observaciones: asistencia.observaciones || null,
    sesion_clase_id: asistencia.sesion_clase_id || null,
    registrado_por: asistencia.registrado_por || null
  }
  dbAsistencias.push(newAst)
  return newAst
}

export async function registrarAsistenciaBulk(asistencias) {
  asistencias.forEach(a => {
    const idx = dbAsistencias.findIndex(da => da.clase_id === a.clase_id && da.alumno_id === a.alumno_id && da.fecha === a.fecha)
    const record = {
      id: idx >= 0 ? dbAsistencias[idx].id : `mock-ast-${Date.now()}-${a.alumno_id}`,
      sesion_clase_id: a.sesion_clase_id,
      clase_id: a.clase_id,
      alumno_id: a.alumno_id,
      fecha: a.fecha,
      estado: a.estado,
      justificacion_texto: a.justificacion_texto || null,
      observaciones: a.observaciones || null
    }

    if (idx >= 0) dbAsistencias[idx] = record
    else dbAsistencias.push(record)

    // Mark session as registered
    if (a.sesion_clase_id) {
      const sIdx = dbSesiones.findIndex(s => s.id === a.sesion_clase_id)
      if (sIdx >= 0) dbSesiones[sIdx].estado = 'registrada'
    }
  })
  return asistencias
}

// ─── GATE DE MODO SESIÓN (mapa-gamificado-planificacion, Tarea 3.2, REQ-03) ──

export async function obtenerAsistenciaDelDia({ claseId, fecha } = {}) {
  if (!claseId || !fecha) return { tomada: false, presentes: [] }

  const registros = dbAsistencias.filter((a) => a.clase_id === claseId && a.fecha === fecha)
  const presentes = registros
    .filter((a) => a.estado === ESTADOS.PRESENTE)
    .map((a) => {
      const studentInfo = (alumnosMock || []).find((st) => st.id === a.alumno_id) || {}
      return { id: a.alumno_id, nombre: studentInfo.nombre_completo ?? 'Estudiante Mock' }
    })

  return { tomada: registros.length > 0, presentes }
}

export async function obtenerAsistenciasPorClasesFecha(claseIds = [], fecha) {
  const ids = [...new Set((claseIds || []).filter(Boolean))]
  if (ids.length === 0 || !fecha) return {}
  return dbAsistencias
    .filter((a) => ids.includes(a.clase_id) && a.fecha === fecha)
    .reduce((acc, a) => {
      if (!acc[a.clase_id]) acc[a.clase_id] = {}
      acc[a.clase_id][a.alumno_id] = { estado: a.estado, justificacion_texto: a.justificacion_texto }
      return acc
    }, {})
}

// ─── REPORTE CONSOLIDADO ─────────────────────────────────────────────────────

export async function getReporteConsolidado({ fecha, claseId } = {}) {
  let filtered = [...dbSesiones].filter(s => s.estado === 'registrada')
  
  if (fecha) filtered = filtered.filter(s => s.fecha === fecha)
  if (claseId) filtered = filtered.filter(s => s.clase_id === claseId)

  const timelineByDate = {}

  filtered.forEach(row => {
    const classInfo = clasesMock.clases.find(c => c.id === row.clase_id) || {}
    const teacherInfo = (maestrosMock || []).find(m => m.id === row.maestro_id) || {}
    const scAsistencias = dbAsistencias.filter(a => a.sesion_clase_id === row.id)

    const clase = {
      // Necesario para que la fila del timeline pueda abrir el modal de detalle.
      sesion_clase_id: row.id,
      clase_id: row.clase_id,
      clase_nombre: classInfo.nombre ?? '—',
      instrumento: classInfo.instrumento || 'General',
      fecha: row.fecha,
      hora_inicio: row.hora_inicio,
      hora_fin: row.hora_fin,
      maestro_nombre: teacherInfo.nombre_completo || 'Sin asignar',
      maestro_auxiliar_nombre: null,
      observacion_clase: null,
      observacion_sesion: row.contenido || null,
      presentes: scAsistencias.filter(a => a.estado === 'presente').length,
      ausentes: scAsistencias.filter(a => a.estado === 'ausente').length,
      justificados: scAsistencias.filter(a => a.estado === 'justificado').length,
      total_alumnos: scAsistencias.length,
      asistencias: scAsistencias.map(a => {
        const studentInfo = (alumnosMock || []).find(st => st.id === a.alumno_id) || {}
        return {
          alumno_id: a.alumno_id,
          alumno_nombre: studentInfo.nombre_completo ?? 'Estudiante Mock',
          estado: a.estado,
          justificacion_texto: a.justificacion_texto,
          instrumento: studentInfo.instrumento_principal || classInfo.instrumento || 'Violín'
        }
      }),
      justificaciones: dbJustificaciones.filter(j => j.sesion_id === row.id)
    }

    if (!timelineByDate[row.fecha]) {
      timelineByDate[row.fecha] = []
    }
    timelineByDate[row.fecha].push(clase)
  })

  const timeline = Object.entries(timelineByDate)
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
    .map(([fecha, clases]) => ({
      fecha,
      clases: clases.sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || '')),
    }))

  const todasLasClases = timeline.flatMap(d => d.clases)
  const resumenGlobal = {
    totalClases: todasLasClases.length,
    totalPresentes: todasLasClases.reduce((sum, c) => sum + c.presentes, 0),
    totalAusentes: todasLasClases.reduce((sum, c) => sum + c.ausentes, 0),
    totalJustificados: todasLasClases.reduce((sum, c) => sum + c.justificados, 0),
    totalRegistros: todasLasClases.reduce((sum, c) => sum + c.total_alumnos, 0),
    totalSesiones: filtered.length,
  }

  return {
    timelineByDate: timeline,
    resumenGlobal,
  }
}
