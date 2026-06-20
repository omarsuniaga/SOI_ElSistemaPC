import postulantesData from '../../../assets/data/mocks/postulantes.json'
import { puedeTransicionar, aplicarTransicion } from '../domain/postuladoStateMachine.js'

const delay = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms))

// Variable en memoria para persistir cambios durante la sesión de tests / demo
export let data = [...postulantesData]

// Helper para resetear la base de datos en memoria (muy útil para tests)
export function resetMockData() {
  data = [...postulantesData]
}

/**
 * Obtiene un postulante por ID.
 */
export async function obtenerPostulante(id) {
  await delay()
  return data.find((p) => p.id === id) ?? null
}

/**
 * Cambia el estado de un postulante en memoria.
 */
export async function actualizarEstadoPostulante(id, nuevoEstado, meta = {}) {
  await delay()
  const index = data.findIndex((p) => p.id === id)
  if (index === -1) {
    throw new Error(`Postulante con ID ${id} no encontrado`)
  }

  const postulanteActual = data[index]

  // Usar la máquina de estados pura para validar y aplicar
  const postulanteActualizado = aplicarTransicion(postulanteActual, nuevoEstado, meta)

  // Guardar en memoria
  data[index] = postulanteActualizado

  return postulanteActualizado
}

/**
 * Lista postulantes filtrados por mes de creación.
 * @param {number} year
 * @param {number} month  (1-12)
 */
export async function listarPostulantesPorMes(year, month) {
  await delay()
  return data.filter((p) => {
    if (!p.created_at) return false
    const date = new Date(p.created_at)
    return date.getFullYear() === year && date.getMonth() + 1 === month
  })
}

/**
 * Lista postulantes registrados en un rango de fechas, ordenados por fecha descendente.
 * @param {string} desde - ISO date string (ej. '2026-01-01')
 * @param {string} hasta - ISO date string (ej. '2026-06-30')
 * @returns {Promise<object[]>}
 */
export async function listarPostulantesPorRango(desde, hasta) {
  await delay()
  const desdeTime = new Date(desde).getTime()
  const hastaTime = new Date(hasta + 'T23:59:59.999Z').getTime()

  return data
    .filter((p) => {
      if (!p.created_at) return false
      const time = new Date(p.created_at).getTime()
      return time >= desdeTime && time <= hastaTime
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

/**
 * Lista citas agendadas en un rango de fechas.
 */
export async function listarCitas(desde, hasta) {
  await delay()
  const start = new Date(desde).getTime()
  const end = new Date(hasta).getTime()

  return data
    .filter((p) => {
      if (!p.fecha_cita) return false
      const time = new Date(p.fecha_cita).getTime()
      return time >= start && time <= end
    })
    .sort((a, b) => new Date(a.fecha_cita) - new Date(b.fecha_cita))
}

/**
 * Verifica si hay conflicto de cita en un slot dado (±30 min).
 */
export async function hayConflictoCita(fechaHora, excludeId = null) {
  await delay()
  const targetTime = new Date(fechaHora).getTime()
  if (isNaN(targetTime)) {
    throw new Error('Fecha/Hora de cita inválida')
  }

  const margen = 30 * 60 * 1000 // 30 minutos en ms

  return data.some((p) => {
    if (excludeId && p.id === excludeId) return false
    if (!p.fecha_cita) return false

    // Solo verificar conflicto si está en estado de cita_agendada o reprogramado
    if (p.estado !== 'cita_agendada' && p.estado !== 'reprogramado') return false

    const time = new Date(p.fecha_cita).getTime()
    return Math.abs(time - targetTime) <= margen
  })
}

/**
 * Agrega una nota de seguimiento.
 */
export async function agregarNota(id, nota) {
  await delay()
  const index = data.findIndex((p) => p.id === id)
  if (index === -1) {
    throw new Error(`Postulante con ID ${id} no encontrado`)
  }

  const postulante = data[index]
  const notasPrevias = postulante.notas_seguimiento || postulante.notes || ''
  const nuevasNotas = notasPrevias ? `${notasPrevias}\n${nota}`.trim() : nota.trim()

  const postulanteActualizado = {
    ...postulante,
    notas_seguimiento: nuevasNotas,
  }

  data[index] = postulanteActualizado
  return postulanteActualizado
}

/**
 * Busca postulantes por nombre completo o email.
 * @param {string} query - Texto de búsqueda (case-insensitive)
 * @returns {Promise<object[]>}
 */
export async function buscarPostulante(query = '') {
  await delay()
  const q = query.toLowerCase()
  if (!q) return [...data]
  return data.filter(p =>
    (p.nombre_completo || '').toLowerCase().includes(q) ||
    (p.correo || p.email || '').toLowerCase().includes(q)
  )
}

/**
 * Elimina permanentemente un postulante de la base de datos en memoria.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function eliminarPostulante(id) {
  await delay()
  const index = data.findIndex((p) => p.id === id)
  if (index === -1) {
    throw new Error(`Postulante con ID ${id} no encontrado`)
  }

  // Eliminar el registro del array en memoria
  data.splice(index, 1)

  return true
}
