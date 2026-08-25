/**
 * horarioGeneralService.js
 *
 * Fuente de datos y diagnóstico para el módulo "Horario General" (portal
 * admin, LOG): todas las clases activas con su horario semanal completo,
 * más los hallazgos operativos (conflictos de salón, cupo excedido,
 * sesiones sin salón, salones placeholder, clases duplicadas por nombre).
 *
 * Las funciones de diagnóstico son puras (reciben clases/sesiones ya
 * cargadas, no llaman a Supabase) para poder testearlas sin mocks pesados.
 * `cargarHorarioGeneral()` es la única que hace red.
 */

import { supabase } from '../../../lib/supabaseClient.js'
import { obtenerClasesConHorarioYCupo } from '../../clases/api/clasesApi.js'

export const DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
export const DIA_LABEL = {
  lunes: 'Lunes',
  martes: 'Martes',
  miércoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sábado: 'Sábado',
  domingo: 'Domingo',
}

const FAMILIAS = {
  Violines: 'cuerdas', Violin: 'cuerdas', Violoncellos: 'cuerdas', Viola: 'cuerdas', Violas: 'cuerdas',
  Contrabajo: 'cuerdas', 'Violoncello y Contrabajo': 'cuerdas',
  Flauta: 'maderas', Oboe: 'maderas', Oboes: 'maderas', Clarinete: 'maderas',
  Trompetas: 'metales', Corno: 'metales', Trombón: 'metales', Tuba: 'metales', 'Vientos Metales': 'metales',
  Percusión: 'percusion', percusion: 'percusion',
  Voz: 'voz', Coro: 'voz',
  Piano: 'otros', Lutería: 'otros', 'No aplica': 'otros', 'no aplica': 'otros', Todos: 'otros',
}
export const FAMILIA_LABEL = {
  cuerdas: 'Cuerdas', maderas: 'Maderas', metales: 'Metales', percusion: 'Percusión', voz: 'Voz / Coro', otros: 'Otros / Mixto',
}

export function familiaDe(instrumento) {
  return FAMILIAS[instrumento] || 'otros'
}

function toMin(hhmm) {
  if (!hhmm) return null
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function overlap(aStart, aEnd, bStart, bEnd) {
  if (aStart == null || aEnd == null || bStart == null || bEnd == null) return false
  return aStart < bEnd && bStart < aEnd
}

/**
 * Aplana clases + su array de horarios en una fila por sesión semanal,
 * con nombres de maestro/salón ya resueltos.
 */
export function construirSesiones(clases, { maestroNombreById, salonNombreById }) {
  const sesiones = []
  for (const clase of clases) {
    for (const h of clase.horarios || []) {
      sesiones.push({
        claseId: clase.id,
        clase: clase.nombre,
        instrumento: clase.instrumento || null,
        maestroId: clase.maestro_principal_id || null,
        maestro: (clase.maestro_principal_id && maestroNombreById.get(clase.maestro_principal_id)) || 'Sin asignar',
        suplenteId: clase.maestro_suplente_id || null,
        suplente: (clase.maestro_suplente_id && maestroNombreById.get(clase.maestro_suplente_id)) || null,
        dia: (h.dia || '').toLowerCase().trim(),
        inicio: h.hora_inicio ? h.hora_inicio.slice(0, 5) : null,
        fin: h.hora_fin ? h.hora_fin.slice(0, 5) : null,
        salonId: h.salon_id || null,
        salon: (h.salon_id && salonNombreById.get(h.salon_id)) || null,
        cupo: clase.capacidad_maxima,
        inscritos: clase.inscritos || 0,
      })
    }
  }
  return sesiones
}

/** Salones cuyo nombre real todavía es un placeholder ("Salón Sin Nombre"). */
export function detectarSalonPlaceholder(sesiones) {
  return sesiones.filter((s) => s.salon && /^sal[oó]n sin nombre$/i.test(s.salon.trim()))
}

export function detectarSinSalon(sesiones) {
  return sesiones.filter((s) => !s.salonId)
}

/** Mismo salón, mismo día, horas que se solapan, clases distintas. */
export function detectarConflictosSalon(sesiones) {
  const conflictos = []
  for (const dia of DIAS) {
    const enDia = sesiones.filter((s) => s.dia === dia && s.salonId)
    for (let i = 0; i < enDia.length; i++) {
      for (let j = i + 1; j < enDia.length; j++) {
        const a = enDia[i]
        const b = enDia[j]
        if (a.claseId === b.claseId) continue
        if (a.salonId === b.salonId && overlap(toMin(a.inicio), toMin(a.fin), toMin(b.inicio), toMin(b.fin))) {
          conflictos.push({ dia, a, b })
        }
      }
    }
  }
  return conflictos
}

/** Una fila por clase (no por sesión) — evita repetir el hallazgo N veces. */
export function detectarSobreCupo(clases) {
  return clases.filter((c) => (c.inscritos || 0) > (c.capacidad_maxima ?? Infinity))
}

/** Clases distintas (id distinto) que comparten el mismo nombre literal. */
export function detectarNombresDuplicados(clases) {
  const idsPorNombre = new Map()
  for (const c of clases) {
    if (!idsPorNombre.has(c.nombre)) idsPorNombre.set(c.nombre, [])
    idsPorNombre.get(c.nombre).push(c.id)
  }
  return [...idsPorNombre.entries()].filter(([, ids]) => ids.length > 1)
}

export function construirDiagnostico(clases, sesiones) {
  const conflictosSalon = detectarConflictosSalon(sesiones)
  const sobreCupo = detectarSobreCupo(clases)
  const sinSalon = detectarSinSalon(sesiones)
  const salonPlaceholder = detectarSalonPlaceholder(sesiones)
  const nombresDuplicados = detectarNombresDuplicados(clases)
  const sinInstrumento = clases.filter((c) => !c.instrumento || !c.instrumento.trim())
  const salonesEnUso = new Set(sesiones.filter((s) => s.salonId).map((s) => s.salonId)).size

  const stats = {
    totalClases: clases.length,
    totalSesiones: sesiones.length,
    conflictos: conflictosSalon.length,
    sinSalon: sinSalon.length,
    sobreCupo: sobreCupo.length,
    salonesEnUso,
  }

  const findings = []
  conflictosSalon.forEach((c) => {
    findings.push({
      sev: 'crit',
      chip: 'Conflicto',
      claseId: c.a.claseId,
      claseIdB: c.b.claseId,
      summary: `${c.a.salon}, ${DIA_LABEL[c.dia] || c.dia} — "${c.a.clase}" (${c.a.inicio}–${c.a.fin}) se solapa con "${c.b.clase}" (${c.b.inicio}–${c.b.fin}).`,
      detail: 'Reasignar salón u horario a una de las dos.',
    })
  })
  sobreCupo.forEach((c) => {
    findings.push({
      sev: 'warn',
      chip: 'Cupo',
      claseId: c.id,
      summary: `"${c.nombre}" tiene ${c.inscritos} inscritos con cupo de ${c.capacidad_maxima}.`,
      detail: c.capacidad_maxima <= 1
        ? 'Capacidad máxima probablemente mal cargada — revisar en la ficha de la clase.'
        : 'Ajustar capacidad_maxima o depurar inscripción activa.',
    })
  })
  if (salonPlaceholder.length) {
    const clasesAfectadas = [...new Map(salonPlaceholder.map((s) => [s.claseId, s.clase])).values()]
    findings.push({
      sev: 'warn',
      chip: 'Dato',
      summary: `${salonPlaceholder.length} sesión(es) usan el salón placeholder "Salón Sin Nombre" (${clasesAfectadas.join(', ')}).`,
      detail: 'Falta asignarle nombre real al salón o reasignar la sesión.',
    })
  }
  if (sinSalon.length) {
    const clasesAfectadas = [...new Map(sinSalon.map((s) => [s.claseId, s.clase])).values()]
    findings.push({
      sev: 'warn',
      chip: 'Salón',
      summary: `${sinSalon.length} sesión(es) no tienen salón asignado: ${clasesAfectadas.join(', ')}.`,
      detail: 'No aparecen agrupadas por salón hasta que se les asigne uno.',
    })
  }
  sinInstrumento.forEach((c) => {
    findings.push({
      sev: 'warn',
      chip: 'Dato',
      claseId: c.id,
      summary: `"${c.nombre}" no tiene instrumento/categoría registrada.`,
      detail: 'Se agrupa como "Otros / Mixto" en esta vista.',
    })
  })
  nombresDuplicados.forEach(([nombre, ids]) => {
    findings.push({
      sev: 'warn',
      chip: 'Duplicado',
      summary: `Existen ${ids.length} registros de clase distintos llamados "${nombre}".`,
      detail: 'Probablemente deberían ser un solo registro con varios horarios — revisar si conviene fusionarlos.',
    })
  })

  return { stats, findings }
}

export async function cargarHorarioGeneral() {
  const [clases, maestrosRes, salonesRes] = await Promise.all([
    obtenerClasesConHorarioYCupo(),
    supabase.from('maestros').select('id, nombre_completo'),
    supabase.from('salones').select('id, nombre'),
  ])

  const maestroNombreById = new Map((maestrosRes.data || []).map((m) => [m.id, m.nombre_completo]))
  const salonNombreById = new Map((salonesRes.data || []).map((s) => [s.id, s.nombre]))

  const sesiones = construirSesiones(clases, { maestroNombreById, salonNombreById })
  const diagnostico = construirDiagnostico(clases, sesiones)

  return { clases, sesiones, diagnostico }
}
