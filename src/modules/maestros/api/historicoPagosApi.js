/**
 * historicoPagosApi.js
 *
 * Ensambla el objeto `data` que consume
 * src/modules/maestros/domain/generarReporteHistoricoPagos.js para el reporte
 * "Histórico para pagos" por maestro.
 *
 * 100% ADITIVO: solo lee de objetos existentes (RPC canónica
 * fn_estado_asistencia_maestro + tablas clase_horarios / sesiones_clase /
 * observaciones_sesion / justificaciones). No modifica nada.
 *
 * Cada sub-consulta está aislada en try/catch: si una falla, esa sección del
 * reporte queda vacía en lugar de tumbar todo el reporte.
 */

import { supabase } from '../../../lib/supabaseClient.js'
import { etiquetaEstado, resumirCumplimiento } from '../domain/generarReporteHistoricoPagos.js'

/* La RPC fn_estado_asistencia_maestro rechaza rangos de más de 93 días. */
const MAX_RANGO_DIAS = 93

function hoyISOSantoDomingo() {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santo_Domingo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return fmt.format(new Date())
}

function isoAddDays(iso, days) {
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + days)
  return dt.toISOString().slice(0, 10)
}

function clampRango({ desde, hasta }) {
  // Garantiza desde <= hasta y una ventana <= MAX_RANGO_DIAS (recorta por el inicio).
  let d = String(desde).slice(0, 10)
  let h = String(hasta).slice(0, 10)
  if (d > h) [d, h] = [h, d]
  const minDesde = isoAddDays(h, -(MAX_RANGO_DIAS - 1))
  if (d < minDesde) d = minDesde
  return { desde: d, hasta: h }
}

/**
 * Rango por defecto: período académico activo, recortado a los últimos
 * MAX_RANGO_DIAS días hasta hoy. Si no hay período activo, últimos 90 días.
 */
async function resolverRangoPorDefecto() {
  const hoy = hoyISOSantoDomingo()
  try {
    const { data } = await supabase
      .from('periodos')
      .select('nombre, fecha_inicio, fecha_fin, activo')
      .eq('activo', true)
      .order('fecha_inicio', { ascending: false })
      .limit(1)

    const periodo = Array.isArray(data) ? data[0] : null
    if (periodo) {
      const desde = periodo.fecha_inicio
      const hasta = periodo.fecha_fin < hoy ? periodo.fecha_fin : hoy
      const rango = clampRango({ desde, hasta })
      return { ...rango, periodoNombre: periodo.nombre || null }
    }
  } catch (err) {
    console.warn('[historicoPagosApi] resolverRangoPorDefecto:', err?.message || err)
  }
  return { desde: isoAddDays(hoy, -90), hasta: hoy, periodoNombre: null }
}

/* Cuenta P/A/J desde el jsonb sesiones_clase.asistencia ([{estado, alumno_id}]). */
function contarPAJ(asistencia) {
  const out = { P: 0, A: 0, J: 0 }
  const list = Array.isArray(asistencia) ? asistencia : []
  for (const row of list) {
    const key = String(row?.estado || '').trim().toUpperCase().charAt(0)
    if (key === 'P') out.P += 1
    else if (key === 'A') out.A += 1
    else if (key === 'J') out.J += 1
  }
  return out
}

async function cargarMaestro(maestroId) {
  try {
    const { data } = await supabase
      .from('maestros')
      .select('id, nombre_completo, especialidad, correo, tlf')
      .eq('id', maestroId)
      .maybeSingle()
    if (data) {
      return {
        nombre_completo: data.nombre_completo || '',
        especialidad: data.especialidad || '',
        correo: data.correo || '',
        tlf: data.tlf || '',
      }
    }
  } catch (err) {
    console.warn('[historicoPagosApi] cargarMaestro:', err?.message || err)
  }
  return { nombre_completo: '', especialidad: '', correo: '', tlf: '' }
}

async function cargarEstadoAsistencia(maestroId, rango) {
  try {
    const { data, error } = await supabase.rpc('fn_estado_asistencia_maestro', {
      p_maestro_id: maestroId,
      p_desde: rango.desde,
      p_hasta: rango.hasta,
    })
    if (error || !Array.isArray(data)) return []
    return data.map((r) => {
      const estadoLabel =
        r.estado === 'vencida' ? 'SIN REGISTRO' : etiquetaEstado(r.estado)
      return {
        fecha: r.fecha,
        dia: null,
        clase_id: r.clase_id,
        clase_nombre: r.clase_nombre || '',
        estado: r.estado,
        estadoLabel,
        dias_atraso: Number(r.dias_atraso) || 0,
        asistencia: { P: 0, A: 0, J: 0 },
        tema: '',
        observaciones: '',
        sesion_id: r.sesion_id || null,
      }
    })
  } catch (err) {
    console.warn('[historicoPagosApi] cargarEstadoAsistencia:', err?.message || err)
    return []
  }
}

async function cargarHorario(maestroId) {
  try {
    const { data } = await supabase
      .from('clase_horarios')
      .select('dia, hora_inicio, hora_fin, clase_id, clases(nombre), salones(nombre)')
      .eq('maestro_id', maestroId)

    return (data || []).map((h) => ({
      dia: h.dia || '',
      hora_inicio: h.hora_inicio || null,
      hora_fin: h.hora_fin || null,
      clase: h.clases?.nombre || '',
      clase_id: h.clase_id || null,
      salon: h.salones?.nombre || '',
    }))
  } catch (err) {
    console.warn('[historicoPagosApi] cargarHorario:', err?.message || err)
    return []
  }
}

async function cargarSesiones(maestroId, rango) {
  try {
    const { data } = await supabase
      .from('sesiones_clase')
      .select(
        'id, fecha, clase_id, tema_principal, contenido, contenido_dsl, observaciones_generales, asistencia, clases(nombre)',
      )
      .eq('maestro_id', maestroId)
      .gte('fecha', rango.desde)
      .lte('fecha', rango.hasta)
      .order('fecha', { ascending: true })

    const sesiones = data || []
    const ids = sesiones.map((s) => s.id).filter(Boolean)

    let observacionesPorSesion = {}
    if (ids.length > 0) {
      try {
        const { data: obs } = await supabase
          .from('observaciones_sesion')
          .select('sesion_id, contenido_raw, contenido_ia_dsl, es_borrador')
          .in('sesion_id', ids)
        for (const o of obs || []) {
          if (!o?.sesion_id) continue
          observacionesPorSesion[o.sesion_id] =
            o.contenido_raw || o.contenido_ia_dsl || observacionesPorSesion[o.sesion_id] || ''
        }
      } catch (err) {
        console.warn('[historicoPagosApi] observaciones_sesion:', err?.message || err)
      }
    }

    return sesiones.map((s) => ({
      sesion_id: s.id,
      fecha: s.fecha,
      clase_id: s.clase_id,
      clase_nombre: s.clases?.nombre || '',
      asistencia: contarPAJ(s.asistencia),
      tema_principal: s.tema_principal || '',
      contenido: s.contenido || s.contenido_dsl || '',
      observaciones_generales: s.observaciones_generales || '',
      observaciones_raw: observacionesPorSesion[s.id] || '',
    }))
  } catch (err) {
    console.warn('[historicoPagosApi] cargarSesiones:', err?.message || err)
    return []
  }
}

async function cargarJustificaciones(claseIds, rango) {
  const ids = Array.from(new Set((claseIds || []).filter(Boolean)))
  if (ids.length === 0) return []
  try {
    const { data } = await supabase
      .from('justificaciones')
      .select('fecha, motivo, categoria, estado, evidencia_url, alumno_id')
      .in('clase_id', ids)
      .gte('fecha', rango.desde)
      .lte('fecha', rango.hasta)
      .order('fecha', { ascending: true })

    const rows = data || []
    let nombrePorAlumno = {}
    const alumnoIds = Array.from(new Set(rows.map((r) => r.alumno_id).filter(Boolean)))
    if (alumnoIds.length > 0) {
      try {
        const { data: alumnos } = await supabase
          .from('alumnos')
          .select('id, nombre_completo')
          .in('id', alumnoIds)
        for (const a of alumnos || []) nombrePorAlumno[a.id] = a.nombre_completo || ''
      } catch (err) {
        console.warn('[historicoPagosApi] alumnos justificaciones:', err?.message || err)
      }
    }

    return rows.map((j) => ({
      alumno: nombrePorAlumno[j.alumno_id] || '',
      fecha: j.fecha,
      motivo: j.motivo || '',
      categoria: j.categoria || '',
      estado: j.estado || '',
      evidencia_url: j.evidencia_url || '',
    }))
  } catch (err) {
    console.warn('[historicoPagosApi] cargarJustificaciones:', err?.message || err)
    return []
  }
}

/**
 * @param {string} maestroId
 * @param {{desde?:string, hasta?:string}} [opts]
 * @returns {Promise<Object>} data para construirHtmlHistoricoPagos / abrir / pdf
 */
export async function obtenerHistoricoPagos(maestroId, { desde, hasta } = {}) {
  let rango
  if (desde && hasta) {
    rango = { ...clampRango({ desde, hasta }), periodoNombre: null }
  } else {
    rango = await resolverRangoPorDefecto()
  }

  const [maestro, fechas, horario, sesiones] = await Promise.all([
    cargarMaestro(maestroId),
    cargarEstadoAsistencia(maestroId, rango),
    cargarHorario(maestroId),
    cargarSesiones(maestroId, rango),
  ])

  // Enriquecer las fechas del RPC con P/A/J + contenido de la sesión real.
  const sesionPorId = new Map()
  const sesionPorClaseFecha = new Map()
  for (const s of sesiones) {
    if (s.sesion_id) sesionPorId.set(s.sesion_id, s)
    sesionPorClaseFecha.set(`${s.clase_id}__${s.fecha}`, s)
  }
  for (const f of fechas) {
    const match =
      (f.sesion_id && sesionPorId.get(f.sesion_id)) ||
      sesionPorClaseFecha.get(`${f.clase_id}__${f.fecha}`)
    if (match) {
      f.asistencia = match.asistencia
      f.tema = match.tema_principal || f.tema
      f.observaciones =
        [match.observaciones_generales, match.observaciones_raw].filter(Boolean).join('\n') ||
        f.observaciones
    }
  }

  const claseIds = [
    ...horario.map((h) => h.clase_id),
    ...fechas.map((f) => f.clase_id),
    ...sesiones.map((s) => s.clase_id),
  ]
  const justificaciones = await cargarJustificaciones(claseIds, rango)

  const resumen = resumirCumplimiento(fechas)

  return {
    maestro,
    rango,
    horario,
    fechas,
    sesiones,
    justificaciones,
    resumen,
    generadoEn: new Date().toISOString(),
  }
}

export default { obtenerHistoricoPagos }
