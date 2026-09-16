/**
 * @fileoverview Mock DataAdapter for daily classes feed (Modo Demo / Fallback)
 * @module modules/clases/api/clasesHoyMock
 */

import CLASES_MOCK from '../../../assets/data/mocks/clases.json'
import MAESTROS_MOCK from '../../../assets/data/mocks/maestros.json'
import ALUMNOS_MOCK from '../../../assets/data/mocks/alumnos.json'
import { timeToMinutes } from '../utils/clasesUtils.js'
import { obtenerDiaActual, fechaParaDia } from './clasesHoyApi.js'

const JUSTIFICACIONES_STORAGE_KEY = 'justificaciones_demo'

/**
 * Normaliza nombres de días quitando acentos y espacios.
 * @param {string} dia
 * @returns {string}
 */
function normalizarDia(dia) {
  return (dia || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Determina el estado temporal de la clase (en-curso, proxima, pasada).
 * @param {string} horaInicio
 * @param {string} horaFin
 * @param {number} ahoraMin
 * @returns {string}
 */
function estadoTemporal(horaInicio, horaFin, ahoraMin) {
  const inicioMin = timeToMinutes(horaInicio)
  const finMin = timeToMinutes(horaFin)
  if (ahoraMin >= inicioMin && ahoraMin < finMin) return 'en-curso'
  if (ahoraMin < inicioMin) return 'proxima'
  return 'pasada'
}

/**
 * Obtiene el almacén local de justificaciones en modo demo.
 * @returns {Record<string, { motivo: string, fecha: string }>}
 */
function getJustificacionesStore() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(JUSTIFICACIONES_STORAGE_KEY) : null
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

/**
 * Genera el feed de clases del día a partir de los mocks locales.
 * @param {string|null} [diaFiltro=null]
 * @returns {Promise<{dia: string, fecha: string, esHoy: boolean, sesiones: Array, kpis: Object}>}
 */
export async function obtenerClasesDelDiaMock(diaFiltro = null) {
  const dia = diaFiltro || obtenerDiaActual()
  const diaNorm = normalizarDia(dia)
  const esHoy = diaNorm === normalizarDia(obtenerDiaActual())
  const fecha = fechaParaDia(dia)
  const ahoraMin = new Date().getHours() * 60 + new Date().getMinutes()
  const justificaciones = getJustificacionesStore()

  // Mapa de maestros por ID
  const maestrosMap = new Map()
  if (Array.isArray(MAESTROS_MOCK)) {
    for (const m of MAESTROS_MOCK) {
      maestrosMap.set(m.id, {
        id: m.id,
        nombre_completo: m.nombre_completo,
        especialidad: m.especialidad,
        tlf: '+180955501' + String(m.id.replace(/\D/g, '') || '01').padStart(2, '0'),
      })
    }
  }

  // Alumnos disponibles
  const listaAlumnos = Array.isArray(ALUMNOS_MOCK) ? ALUMNOS_MOCK : []

  // Salones predefinidos para asociar a las clases mock
  const salonesMap = {
    clase_001: { id: 'salon_101', nombre: 'Salón 101 (Cuerdas)', ubicacion: 'Ala Norte - Piso 1' },
    clase_002: { id: 'salon_102', nombre: 'Salón 102 (Teclados)', ubicacion: 'Ala Sur - Piso 1' },
    clase_003: { id: 'salon_201', nombre: 'Salón 201 (Ensamble)', ubicacion: 'Ala Norte - Piso 2' },
    clase_004: { id: 'salon_202', nombre: 'Salón 202 (Vientos)', ubicacion: 'Ala Sur - Piso 2' },
    clase_005: { id: 'salon_aud', nombre: 'Auditorio Principal', ubicacion: 'Edificio Central' },
  }

  const clasesList = Array.isArray(CLASES_MOCK?.clases) ? CLASES_MOCK.clases : []
  const sesiones = []

  let claseIndex = 0
  for (const clase of clasesList) {
    if (clase.estado && clase.estado !== 'activa') continue

    const horarios = Array.isArray(clase.horarios) ? clase.horarios : []
    let horarioIdx = 0

    for (const h of horarios) {
      if (normalizarDia(h.dia) === diaNorm) {
        const maestroTitular = maestrosMap.get(clase.maestro_titular_id) || {
          id: clase.maestro_titular_id || 'm_default',
          nombre_completo: 'Maestro Titular',
          especialidad: clase.instrumento || 'Música',
          tlf: '+18095550101',
        }

        const maestroSuplente = clase.maestro_auxiliar_id
          ? maestrosMap.get(clase.maestro_auxiliar_id) || null
          : null

        const salon = salonesMap[clase.id] || {
          id: `salon_${clase.id}`,
          nombre: `Salón General ${claseIndex + 1}`,
          ubicacion: 'Edificio Central',
        }

        // Asignar un subconjunto estable de alumnos para esta clase
        const alumnosOffset = (claseIndex * 5) % Math.max(1, listaAlumnos.length - 8)
        const cantidadAlumnos = Math.min(clase.max_alumnos || 8, 7)
        const alumnosClase = listaAlumnos.slice(alumnosOffset, alumnosOffset + cantidadAlumnos).map((a) => {
          const justKey = `${clase.id}_${a.id}_${fecha}`
          const just = justificaciones[justKey]
          return {
            id: a.id,
            nombre_completo: a.nombre_completo,
            estadoAsistencia: just ? 'justificado' : null,
            justificacionTexto: just?.motivo || null,
          }
        })

        const estado = esHoy ? estadoTemporal(h.hora_inicio, h.hora_fin, ahoraMin) : 'futura'
        const justificadosCount = alumnosClase.filter((a) => a.estadoAsistencia === 'justificado').length

        sesiones.push({
          horarioId: `mock_horario_${clase.id}_${horarioIdx}`,
          claseId: clase.id,
          dia,
          fecha,
          horaInicio: h.hora_inicio,
          horaFin: h.hora_fin,
          nombre: clase.nombre || 'Clase sin nombre',
          instrumento: clase.instrumento || null,
          nivel: clase.grado || null,
          capacidadMaxima: clase.max_alumnos ?? null,
          salon,
          maestroTitular,
          maestroSuplente,
          alumnos: alumnosClase,
          totalAlumnos: alumnosClase.length,
          justificadosCount,
          estado,
          pendienteAsistencia: null,
        })
      }
      horarioIdx++
    }
    claseIndex++
  }

  sesiones.sort((a, b) => timeToMinutes(a.horaInicio) - timeToMinutes(b.horaInicio))

  const salonesOcupados = new Set(sesiones.filter((s) => s.salon?.id).map((s) => s.salon.id))

  const kpis = {
    totalClases: sesiones.length,
    enCursoAhora: sesiones.filter((s) => s.estado === 'en-curso').length,
    totalAlumnos: sesiones.reduce((acc, s) => acc + s.totalAlumnos, 0),
    salonesOcupados: salonesOcupados.size,
    justificadosHoy: sesiones.reduce((acc, s) => acc + s.justificadosCount, 0),
    asistenciaPendiente: sesiones.filter((s) => s.pendienteAsistencia).length,
  }

  return { dia, fecha, esHoy, sesiones, kpis }
}

/**
 * Registra una justificación de ausencia en almacenamiento local para modo demo.
 * @param {Object} params
 * @param {string} params.claseId
 * @param {string} params.alumnoId
 * @param {string} params.fecha
 * @param {string} params.motivo
 * @returns {Promise<Object>}
 */
export async function justificarAusenciaMock({ claseId, alumnoId, fecha, motivo }) {
  const justificaciones = getJustificacionesStore()
  const key = `${claseId}_${alumnoId}_${fecha}`

  justificaciones[key] = {
    claseId,
    alumnoId,
    fecha,
    motivo: motivo || 'Justificación registrada en modo demo',
    createdAt: new Date().toISOString(),
  }

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(JUSTIFICACIONES_STORAGE_KEY, JSON.stringify(justificaciones))
    }
  } catch (err) {
    console.warn('[clasesHoyMock] No se pudo persistir justificación en localStorage:', err)
  }

  return { success: true, id: `mock_just_${Date.now()}` }
}
