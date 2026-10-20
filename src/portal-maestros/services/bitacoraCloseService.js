/**
 * Cierre de la clase desde la bitácora: arma el payload de `cerrar_sesion` a partir de la
 * interpretación determinista (`parseBitacora`) y lo envía. Sin conexión, el cierre se encola
 * como un único ítem `rpc` con los ids ya fijados, así que reintentar es idempotente.
 */

import { supabase } from '../../lib/supabaseClient.js'
import { enqueue } from './offlineQueue.js'
import { isPresentState, studentName } from '../../shared/utils/bitacoraParser.js'

const ESTADO_DB = { P: 'presente', A: 'ausente', J: 'justificado', T: 'tarde' }
const NETWORK_ERROR = /Failed to fetch|NetworkError|Network request failed/
const isValoracion = value => Number.isInteger(value) && value >= 0 && value <= 5

/**
 * @returns {{ payload: object, problemas: Array<object>, sinAsignar: Array<object> }}
 */
export function buildCierrePayload({
  sesionId,
  contenido,
  alumnos = [],
  estado = {},
  parsed,
  valoraciones = {},
  newId = () => crypto.randomUUID(),
}) {
  const nombres = new Map(alumnos.map(a => [a.id, studentName(a)]))
  const asistencia = []
  const presentes = new Set()
  for (const alumno of alumnos) {
    const estadoUi = estado[alumno.id]
    if (isPresentState(estadoUi)) presentes.add(alumno.id)
    if (Object.hasOwn(ESTADO_DB, estadoUi)) asistencia.push({ alumno_id: alumno.id, estado: ESTADO_DB[estadoUi] })
  }

  const problemas = []
  const registros = []
  for (const registro of parsed?.registros ?? []) {
    const evidencia = registro.evidencia.texto
    const base = {
      tipo: registro.tipo,
      texto: registro.texto,
      evidencia,
      evidencia_inicio: registro.evidencia.inicio,
      evidencia_fin: registro.evidencia.fin,
      indicador_id: null,
      origen: registro.origen,
    }

    if (registro.alcance === 'grupo') {
      if (presentes.size === 0) {
        problemas.push({ tipo: 'sin_presentes', texto: registro.texto })
        continue
      }
      registros.push({ id: newId(), grupo_registro_id: newId(), alcance: 'grupo', ...base })
      continue
    }

    const recipients = []
    for (const alumnoId of registro.alumnoIds) {
      if (presentes.has(alumnoId)) recipients.push(alumnoId)
      else problemas.push({ tipo: 'no_presente', alumnoId, nombre: nombres.get(alumnoId) ?? '', texto: registro.texto })
    }
    if (!recipients.length) continue
    const grupoRegistroId = newId()
    for (const alumnoId of recipients) {
      registros.push({ id: newId(), grupo_registro_id: grupoRegistroId, alumno_id: alumnoId, alcance: 'alumno', ...base })
    }
  }

  const valoracionRows = alumnos
    .filter(a => presentes.has(a.id) && isValoracion(valoraciones[a.id]))
    .map(a => ({ alumno_id: a.id, valoracion: valoraciones[a.id] }))

  return {
    payload: {
      sesion_id: sesionId,
      contenido,
      asistencia,
      registros,
      valoraciones: valoracionRows,
    },
    problemas,
    sinAsignar: parsed?.sinAsignar ?? [],
  }
}

const isNetworkFailure = error => NETWORK_ERROR.test(String(error?.message ?? ''))

/**
 * Llama a `cerrar_sesion`. Sin conexión (o con fallo de red) encola el mismo payload con los
 * mismos ids; cualquier otro error del servidor es de negocio y se lanza sin encolar.
 * @returns {Promise<{ data: any, queued: boolean }>}
 */
export async function cerrarSesion(
  payload,
  { client = supabase, enqueueFn = enqueue, isOnline = () => navigator.onLine } = {},
) {
  let response
  try {
    response = await client.rpc('cerrar_sesion', { p_payload: payload })
  } catch (thrown) {
    response = { data: null, error: thrown }
  }
  const { data, error } = response ?? {}
  if (!error) return { data, queued: false }

  if (!isOnline() || isNetworkFailure(error)) {
    await enqueueFn({
      tabla: 'registros_sesion',
      operacion: 'rpc',
      preservar: true,
      payload: { fn: 'cerrar_sesion', args: { p_payload: payload } },
    })
    return { data: null, queued: true }
  }

  const businessError = new Error(error.message)
  businessError.code = error.code
  throw businessError
}

/**
 * Registros confirmados de una sesión, en orden de creación.
 */
export async function getRegistrosSesion(sesionId, { client = supabase } = {}) {
  const { data, error } = await client
    .from('registros_sesion')
    .select('*')
    .eq('sesion_clase_id', sesionId)
    .eq('estado', 'confirmado')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}
