import actividadesMockData from '../../../assets/data/mocks/actividadesInstitucionales.json'
import clasesMockData from '../../../assets/data/mocks/clases.json'

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

// Persistencia en memoria de la sesión Demo, como permisosMock.js.
const actividades = actividadesMockData.map((a) => ({ ...a }))
const afectacionesPorEvento = new Map() // eventoId -> [{claseId, fecha, tipoAfectacion, motivo, exentos}]

const DIAS_ES_LARGO = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']

function normalizeDia(str) {
  return Array.from((str || '').normalize('NFD'))
    .filter((ch) => {
      const code = ch.codePointAt(0)
      return code < 0x300 || code > 0x36f
    })
    .join('')
    .trim()
    .toLowerCase()
}

function diaSemanaDe(fechaISO) {
  const [y, m, d] = fechaISO.split('-').map(Number)
  return DIAS_ES_LARGO[new Date(y, m - 1, d).getDay()]
}

function normalizeActividad(row) {
  return {
    id: row.id,
    titulo: row.titulo,
    descripcion: row.descripcion ?? '',
    categoria: row.categoria,
    alcance: row.alcance,
    fechaInicio: row.fecha_inicio,
    fechaFin: row.fecha_fin,
    ubicacion: row.ubicacion ?? '',
    programasConvocados: row.programas_convocados ?? [],
    clasesConvocadas: row.clases_convocadas ?? [],
    responsableAsistenciaId: row.responsable_asistencia_id ?? null,
    requiereAprobacion: row.requiere_aprobacion ?? true,
    estado: row.estado,
    aprobadoPor: row.aprobado_por ?? null,
    aprobadoEn: row.aprobado_en ?? null,
    motivoRechazo: row.motivo_rechazo ?? null,
    creadoPor: row.creado_por ?? null,
    version: row.version ?? 1,
    createdAt: row.created_at,
  }
}

export async function listarActividades(filtros = {}) {
  await delay()
  let list = actividades
  if (filtros.estado) list = list.filter((a) => a.estado === filtros.estado)
  return [...list]
    .sort((a, b) => (a.fecha_inicio < b.fecha_inicio ? 1 : -1))
    .map(normalizeActividad)
}

export async function obtenerActividad(id) {
  await delay()
  const row = actividades.find((a) => a.id === id)
  if (!row) return null

  const afectaciones = (afectacionesPorEvento.get(id) || []).map((a) => {
    const clase = (clasesMockData.clases || clasesMockData || []).find((c) => c.id === a.claseId)
    return {
      id: `${id}-${a.claseId}-${a.fecha}`,
      claseId: a.claseId,
      claseNombre: clase?.nombre ?? '',
      fecha: a.fecha,
      tipoAfectacion: a.tipoAfectacion,
      motivo: a.motivo ?? '',
      exentos: a.exentos || [],
    }
  })

  return { ...normalizeActividad(row), afectaciones, convocatoria: [] }
}

export async function crearActividad(payload) {
  await delay()
  const { titulo, categoria, alcance, fechaInicio, fechaFin } = payload
  if (!titulo || !categoria || !alcance || !fechaInicio || !fechaFin) {
    throw new Error('Título, categoría, alcance y fechas son obligatorios')
  }

  const nueva = {
    id: `demo-act-${Date.now()}`,
    titulo,
    descripcion: payload.descripcion || '',
    categoria,
    alcance,
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
    ubicacion: payload.ubicacion || null,
    programas_convocados: payload.programasConvocados || [],
    clases_convocadas: payload.clasesConvocadas || [],
    responsable_asistencia_id: payload.responsableAsistenciaId || null,
    requiere_aprobacion: true,
    estado: 'pendiente_revision',
    aprobado_por: null,
    aprobado_en: null,
    motivo_rechazo: null,
    creado_por: 'demo-user',
    version: 1,
    created_at: new Date().toISOString(),
  }
  actividades.unshift(nueva)
  return normalizeActividad(nueva)
}

export async function previsualizarImpacto({ fecha, alcance, clasesConvocadas = [], programasConvocados = [] }) {
  await delay()
  if (!fecha || !alcance) throw new Error('fecha y alcance son obligatorios')

  const diaSemana = normalizeDia(diaSemanaDe(fecha))
  const todas = clasesMockData.clases || clasesMockData || []

  let candidatas = todas
  if (alcance === 'clase' && clasesConvocadas.length) {
    candidatas = candidatas.filter((c) => clasesConvocadas.includes(c.id))
  } else if (alcance === 'programa' && programasConvocados.length) {
    candidatas = candidatas.filter((c) => programasConvocados.includes(c.programa_id))
  }

  const delDia = candidatas.filter((c) => (c.horarios || []).some((h) => normalizeDia(h.dia) === diaSemana))

  return delDia.map((c) => {
    const decisionVigente = (afectacionesPorEvento.get('__todas__') || [])
      .find((a) => a.claseId === c.id && a.fecha === fecha)
    return {
      claseId: c.id,
      claseNombre: c.nombre,
      programaId: c.programa_id,
      // Demo mode no tiene tabla de inscripciones simulada: se aproxima con
      // max_alumnos como estimación visible, documentada en la UI.
      totalAlumnos: c.max_alumnos ?? 0,
      decisionVigente: decisionVigente ? { tipoAfectacion: decisionVigente.tipoAfectacion } : null,
    }
  })
}

export async function listarAlumnosDeClase(claseId) {
  await delay()
  const clase = (clasesMockData.clases || clasesMockData || []).find((c) => c.id === claseId)
  const total = clase?.max_alumnos ?? 0
  return Array.from({ length: Math.min(total, 5) }, (_, i) => ({
    id: `demo-alumno-${claseId}-${i}`,
    nombreCompleto: `Alumno Demo ${i + 1}`,
  }))
}

export async function aprobarActividad(eventoId, afectaciones = [], convocatoria = [], responsableAsistenciaId = null) {
  await delay()
  const row = actividades.find((a) => a.id === eventoId)
  if (!row) throw new Error('Actividad no encontrada')
  if (!['borrador', 'pendiente_revision', 'aprobado'].includes(row.estado)) {
    throw new Error(`La actividad no se puede aprobar/corregir desde su estado actual (${row.estado})`)
  }

  row.estado = 'aprobado'
  row.aprobado_por = 'demo-admin'
  row.aprobado_en = new Date().toISOString()
  row.version = (row.version || 1) + 1
  if (responsableAsistenciaId) row.responsable_asistencia_id = responsableAsistenciaId

  afectacionesPorEvento.set(eventoId, afectaciones)
  const todas = afectacionesPorEvento.get('__todas__') || []
  afectacionesPorEvento.set('__todas__', [
    ...todas.filter((a) => !afectaciones.some((n) => n.claseId === a.claseId && n.fecha === a.fecha)),
    ...afectaciones,
  ])

  return {
    evento_id: eventoId,
    estado: 'aprobado',
    version: row.version,
    afectaciones_creadas: afectaciones.length,
    exenciones_creadas: afectaciones.reduce((n, a) => n + (a.exentos?.length || 0), 0),
    convocatoria_creada: convocatoria.length,
  }
}

const asistenciaActividad = new Map() // `${eventoId}:${alumnoId}` -> estado

export async function obtenerListaAsistenciaActividad(eventoId) {
  await delay()
  // Demo mode no simula convocatoria persistida; deja una lista fija corta
  // para poder probar el flujo de pasar lista sin depender de datos reales.
  return ['demo-alumno-1', 'demo-alumno-2', 'demo-alumno-3'].map((alumnoId, i) => ({
    alumnoId,
    nombreCompleto: `Alumno Demo ${i + 1}`,
    estado: asistenciaActividad.get(`${eventoId}:${alumnoId}`) || 'pendiente',
  }))
}

export async function registrarAsistenciaActividad(eventoId, alumnoId, estado) {
  await delay()
  if (!['presente', 'ausente', 'pendiente'].includes(estado)) {
    throw new Error('estado inválido (presente|ausente|pendiente)')
  }
  asistenciaActividad.set(`${eventoId}:${alumnoId}`, estado)
  return { eventoId, alumnoId, estado }
}

export async function rechazarActividad(eventoId, motivo) {
  await delay()
  const row = actividades.find((a) => a.id === eventoId)
  if (!row) throw new Error('Actividad no encontrada')
  if (!['borrador', 'pendiente_revision'].includes(row.estado)) {
    throw new Error('Actividad no encontrada o ya no está pendiente de revisión')
  }
  row.estado = 'rechazado'
  row.motivo_rechazo = motivo || null
  return { evento_id: eventoId, estado: 'rechazado', motivo_rechazo: motivo || null }
}
