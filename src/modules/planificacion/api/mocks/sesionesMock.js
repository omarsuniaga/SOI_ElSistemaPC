import MOCK_CLASES from '../../../../assets/data/mocks/clases.json'
import MOCK_SESIONES from '../../../../assets/data/mocks/sesiones.json'

const STORAGE_KEY = 'soi_sesiones_demo'
const SCHEMA_VERSION = 1

let dbSesiones = null

function _ensureStore() {
  if (dbSesiones !== null) return

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.schemaVersion === SCHEMA_VERSION) {
        dbSesiones = parsed.sesiones
      }
    }
  } catch (e) {
    console.warn('[sesionesMock] Error reading localStorage:', e)
  }

  if (!dbSesiones) {
    // Clone to prevent mutating original static imports directly
    dbSesiones = JSON.parse(JSON.stringify(MOCK_SESIONES.sesiones))
    _persist()
  }
}

function _persist() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: SCHEMA_VERSION,
        sesiones: dbSesiones,
      })
    )
  } catch (e) {
    console.warn('[sesionesMock] Error writing localStorage:', e)
  }
}

export async function obtenerSesiones(filtros = {}) {
  _ensureStore()
  const { soloConContenido, ...rest } = filtros
  let sesiones = [...dbSesiones]

  if (rest.fecha) {
    sesiones = sesiones.filter((s) => s.fecha === rest.fecha)
  }
  if (rest.clase_id) {
    sesiones = sesiones.filter((s) => s.clase_id === rest.clase_id)
  }
  if (rest.maestro_id) {
    sesiones = sesiones.filter((s) => s.maestro_id === rest.maestro_id)
  }
  if (rest.tipo) {
    sesiones = sesiones.filter((s) => s.tipo === rest.tipo)
  }
  if (soloConContenido) {
    sesiones = sesiones.filter((s) => s.contenido && s.contenido.trim() !== '')
  }

  return sesiones
}

export async function obtenerSesionPorId(id) {
  _ensureStore()
  const sesion = dbSesiones.find((s) => s.id === id)
  if (!sesion) throw new Error('Sesión no encontrada')
  return sesion
}

export async function crearSesion(sesion) {
  _ensureStore()
  if (!sesion.clase_id) {
    throw new Error('La clase es obligatoria')
  }
  if (!sesion.fecha) {
    throw new Error('La fecha es obligatoria')
  }
  if (!sesion.tema) {
    throw new Error('El tema es obligatorio')
  }

  const datosLimpios = {
    id: `sesion_${Date.now()}`,
    clase_id: sesion.clase_id,
    maestro_id: sesion.maestro_id || null,
    fecha: sesion.fecha,
    hora_inicio: sesion.hora_inicio || null,
    hora_fin: sesion.hora_fin || null,
    horario_id: null,
    salon_id: null,
    tema: sesion.tema.trim(),
    contenido: sesion.contenido?.trim() || null,
    motivo: sesion.motivo?.trim() || null,
    tipo: sesion.tipo || 'regular',
    estado: sesion.estado || 'pendiente',
    es_codocencia: sesion.es_codocencia || false,
    maestro_auxiliar_id: sesion.maestro_auxiliar_id || null,
    asistencia: null,
    created_at: new Date().toISOString(),
  }

  dbSesiones.push(datosLimpios)
  _persist()
  return datosLimpios
}

export async function actualizarSesion(id, actualizaciones) {
  _ensureStore()
  const idx = dbSesiones.findIndex((s) => s.id === id)
  if (idx === -1) throw new Error('Sesión no encontrada')

  const datosActualizacion = {}

  if (actualizaciones.tema !== undefined) {
    datosActualizacion.tema = actualizaciones.tema.trim()
  }
  if (actualizaciones.contenido !== undefined) {
    datosActualizacion.contenido = actualizaciones.contenido?.trim() || null
  }
  if (actualizaciones.hora_inicio !== undefined) {
    datosActualizacion.hora_inicio = actualizaciones.hora_inicio
  }
  if (actualizaciones.hora_fin !== undefined) {
    datosActualizacion.hora_fin = actualizaciones.hora_fin
  }
  if (actualizaciones.estado !== undefined) {
    datosActualizacion.estado = actualizaciones.estado
  }
  if (actualizaciones.asistencia !== undefined) {
    datosActualizacion.asistencia = actualizaciones.asistencia
  }
  if (actualizaciones.es_codocencia !== undefined) {
    datosActualizacion.es_codocencia = actualizaciones.es_codocencia
  }
  if (actualizaciones.maestro_auxiliar_id !== undefined) {
    datosActualizacion.maestro_auxiliar_id = actualizaciones.maestro_auxiliar_id
  }

  dbSesiones[idx] = {
    ...dbSesiones[idx],
    ...datosActualizacion,
    updated_at: new Date().toISOString(),
  }

  _persist()
  return dbSesiones[idx]
}

export async function eliminarSesion(id) {
  _ensureStore()
  const idx = dbSesiones.findIndex((s) => s.id === id)
  if (idx === -1) throw new Error('Sesión no encontrada')
  dbSesiones.splice(idx, 1)
  _persist()
  return { success: true }
}

export async function registrarAsistencia(sesionId, asistencia) {
  const datosActualizacion = {
    asistencia: asistencia || [],
  }
  return actualizarSesion(sesionId, datosActualizacion)
}

export async function obtenerSesionesCoDocencia(maestroAuxiliarId) {
  _ensureStore()
  return dbSesiones.filter((s) => s.maestro_auxiliar_id === maestroAuxiliarId)
}

export async function obtenerSesionesPorFechaYClase(fecha, claseId) {
  _ensureStore()
  return dbSesiones.filter((s) => s.fecha === fecha && s.clase_id === claseId)
}

export async function obtenerClasesDelMaestro(maestroId) {
  return MOCK_CLASES.clases.filter(
    (c) => c.maestro_titular_id === maestroId || c.maestro_auxiliar_id === maestroId
  )
}
