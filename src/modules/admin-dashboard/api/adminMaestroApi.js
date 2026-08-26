import { supabase } from '../../../lib/supabaseClient.js'

/**
 * Normaliza cualquier formato de teléfono a formato internacional E.164 para WhatsApp
 */
export function normalizarTelefonoWhatsApp(rawPhone) {
  if (!rawPhone) return ''
  let cleaned = String(rawPhone).replace(/\D/g, '')
  if (!cleaned) return ''

  // Formato Venezuela (04141234567 -> 584141234567)
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = '58' + cleaned.substring(1)
  } else if (cleaned.length === 10 && (cleaned.startsWith('414') || cleaned.startsWith('424') || cleaned.startsWith('412') || cleaned.startsWith('416') || cleaned.startsWith('426'))) {
    cleaned = '58' + cleaned
  }

  return cleaned
}

/**
 * Actualiza el número de teléfono del maestro en la base de datos
 */
export async function actualizarTelefonoMaestro(maestroId, nuevoTelefono) {
  try {
    const { data, error } = await supabase
      .from('maestros')
      .update({
        tlf: nuevoTelefono,
        updated_at: new Date().toISOString()
      })
      .eq('id', maestroId)
      .select('id, nombre_completo, tlf, correo')

    if (error) {
      console.warn('[actualizarTelefonoMaestro] Error actualizando teléfono:', error)
      return null
    }

    return data?.[0] || null
  } catch (err) {
    console.warn('[actualizarTelefonoMaestro] Exception:', err)
    return null
  }
}

/**
 * Obtiene la semana actual de lunes a domingo en zona horaria America/Santo_Domingo
 */
export function getSemanaActualSantoDomingo() {
  const ahora = new Date()
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santo_Domingo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  
  // Format returns YYYY-MM-DD
  const hoyStr = formatter.format(ahora)
  const hoyParts = hoyStr.split('-').map(Number)
  const fechaAst = new Date(Date.UTC(hoyParts[0], hoyParts[1] - 1, hoyParts[2], 12, 0, 0))

  const dayOfWeek = fechaAst.getUTCDay() // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

  const lunes = new Date(fechaAst)
  lunes.setUTCDate(fechaAst.getUTCDate() + diffToMonday)

  const domingo = new Date(lunes)
  domingo.setUTCDate(lunes.getUTCDate() + 6)

  return {
    desde: lunes.toISOString().split('T')[0],
    hasta: domingo.toISOString().split('T')[0],
  }
}

/**
 * Obtiene el perfil de un maestro (nombre, contacto, especialidad)
 */
export async function getMaestroProfile(maestroId) {
  try {
    const { data, error } = await supabase
      .from('maestros')
      .select('id, nombre_completo, correo, tlf, especialidad, activo, user_id, tipo_maestro')
      .eq('id', maestroId)
      .maybeSingle()

    if (error || !data) {
      return {
        id: maestroId,
        nombre_completo: 'Maestro de Cátedra',
        email: '---',
        telefono: '',
        telefono_wa: '',
        especialidad: 'Música',
        activo: true,
      }
    }

    return {
      ...data,
      email: data.correo || '---',
      telefono: data.tlf || '',
      telefono_wa: normalizarTelefonoWhatsApp(data.tlf),
    }
  } catch (err) {
    return {
      id: maestroId,
      nombre_completo: 'Maestro de Cátedra',
      email: '---',
      telefono: '',
      telefono_wa: '',
      especialidad: 'Música',
      activo: true,
    }
  }
}

/**
 * Consulta la función canónica public.fn_resumen_cumplimiento_asistencia
 * Devuelve por maestro: total_clases, registradas, pendientes, vencidas, es_solvente
 */
export async function getMaestrosComplianceStatus(rangoFechas = null) {
  try {
    const rango = rangoFechas || getSemanaActualSantoDomingo()
    
    // 1. Llamar a la función canónica RPC fn_resumen_cumplimiento_asistencia
    const { data: resumen, error: errRpc } = await supabase.rpc('fn_resumen_cumplimiento_asistencia', {
      p_desde: rango.desde,
      p_hasta: rango.hasta,
      p_maestro_id: null,
    })

    // 2. Obtener datos de contacto y especialidad de la tabla maestros
    const { data: maestrosList } = await supabase
      .from('maestros')
      .select('id, nombre_completo, especialidad, tlf, correo, activo')
      .eq('activo', true)
      .order('nombre_completo')

    const maestrosMap = new Map((maestrosList || []).map(m => [m.id, m]))

    if (!errRpc && Array.isArray(resumen) && resumen.length > 0) {
      return resumen.map(r => {
        const info = maestrosMap.get(r.maestro_id) || {}
        const total = Number(r.total_clases) || 0
        const registradas = Number(r.registradas) || 0
        const pendientes = Number(r.pendientes) || 0
        const vencidas = Number(r.vencidas) || 0
        const esSolvente = Boolean(r.es_solvente)

        // Estado semántico según solvencia canónica
        let estado = 'al_dia'
        if (vencidas > 0) {
          estado = 'vencida' // Rojo (#ef4444)
        } else if (pendientes > 0) {
          estado = 'pendiente' // Naranja (#f97316)
        }

        return {
          id: r.maestro_id,
          maestro_id: r.maestro_id,
          maestros: {
            id: r.maestro_id,
            nombre_completo: r.maestro_nombre || info.nombre_completo || 'Maestro',
            especialidad: info.especialidad || 'Cátedra Instrumental',
            telefono: info.tlf || '',
            email: info.correo || '---',
          },
          total_sesiones: total,
          registradas: registradas,
          pending_count: pendientes,
          vencidas_count: vencidas,
          oldest_dias_atraso: vencidas > 0 ? 8 : (pendientes > 0 ? 2 : 0),
          es_solvente: esSolvente,
          estado: estado,
          rango_consultado: rango,
          updated_at: new Date().toISOString()
        }
      })
    }

    // Si no hay respuesta de la RPC o el usuario no tiene permisos globales,
    // consultar maestros activos y mapear con su estado
    return (maestrosList || []).map(m => ({
      id: m.id,
      maestro_id: m.id,
      maestros: {
        id: m.id,
        nombre_completo: m.nombre_completo,
        especialidad: m.especialidad || 'Cátedra Instrumental',
        telefono: m.tlf || '',
        email: m.correo || '---',
      },
      total_sesiones: 0,
      registradas: 0,
      pending_count: 0,
      vencidas_count: 0,
      oldest_dias_atraso: 0,
      es_solvente: true,
      estado: 'al_dia',
      rango_consultado: rango,
      updated_at: new Date().toISOString()
    }))
  } catch (err) {
    console.warn('[getMaestrosComplianceStatus] Exception:', err)
    return []
  }
}

/**
 * Consulta la función canónica public.fn_estado_asistencia_maestro
 * Devuelve el detalle exacto de cada clase programada en el rango:
 * fecha, clase_id, clase_nombre, hora_inicio, hora_fin, sesion_id, estado, dias_atraso, asistencia_completa, cubierta_emergente
 */
export async function getMaestroClasesDetalle(maestroId, rangoFechas = null) {
  try {
    const rango = rangoFechas || getSemanaActualSantoDomingo()

    const { data: clasesRpc, error: errRpc } = await supabase.rpc('fn_estado_asistencia_maestro', {
      p_maestro_id: maestroId,
      p_desde: rango.desde,
      p_hasta: rango.hasta,
    })

    if (!errRpc && Array.isArray(clasesRpc)) {
      return clasesRpc.map(r => ({
        id: r.sesion_id || `${r.clase_id}_${r.fecha}`,
        fecha: r.fecha,
        clase_id: r.clase_id,
        clase_nombre: r.clase_nombre || 'Cátedra Instrumental',
        maestro_id: r.maestro_id,
        hora_inicio: r.hora_inicio,
        hora_fin: r.hora_fin,
        sesion_id: r.sesion_id,
        estado: r.estado, // 'registrada', 'cubierta_emergente', 'futura', 'pendiente', 'vencida'
        dias_atraso: Number(r.dias_atraso) || 0,
        asistencia_completa: Boolean(r.asistencia_completa),
        cubierta_emergente: Boolean(r.cubierta_emergente),
        notification_state: r.estado === 'vencida' ? 'ROJO' : (r.estado === 'pendiente' ? 'NARANJA' : 'VERDE'),
        clases: {
          nombre: r.clase_nombre || 'Cátedra Instrumental'
        },
        sesiones_clase: {
          fecha: r.fecha,
          hora_inicio: r.hora_inicio,
          hora_fin: r.hora_fin
        }
      }))
    }

    return []
  } catch (err) {
    console.warn('[getMaestroClasesDetalle] Exception:', err)
    return []
  }
}

/**
 * Compatibilidad con vistas existentes: getMaestroPendingRegistros
 * Filtra las clases devueltas por fn_estado_asistencia_maestro que sean pendientes o vencidas
 */
export async function getMaestroPendingRegistros(maestroId, rangoFechas = null) {
  const todasLasClases = await getMaestroClasesDetalle(maestroId, rangoFechas)
  return todasLasClases.filter(c => c.estado === 'pendiente' || c.estado === 'vencida')
}

/**
 * Consulta el histórico de desempeño de un maestro usando la RPC canónica fn_estado_asistencia_maestro
 * en una ventana de las últimas 6 semanas
 */
export async function getMaestroHistoricoDesempeno(maestroId) {
  try {
    const ahora = new Date()
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Santo_Domingo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    
    const hoyStr = formatter.format(ahora)
    const [y, m, d] = hoyStr.split('-').map(Number)
    const hoyAst = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))

    // 6 semanas atrás (42 días)
    const hace42Dias = new Date(hoyAst)
    hace42Dias.setUTCDate(hoyAst.getUTCDate() - 41)

    const desdeStr = hace42Dias.toISOString().split('T')[0]
    const hastaStr = hoyAst.toISOString().split('T')[0]

    const { data: registrosRpc } = await supabase.rpc('fn_estado_asistencia_maestro', {
      p_maestro_id: maestroId,
      p_desde: desdeStr,
      p_hasta: hastaStr,
    })

    const lista = Array.isArray(registrosRpc) ? registrosRpc : []
    const total = lista.length
    const registradas = lista.filter(r => r.estado === 'registrada' || r.estado === 'cubierta_emergente').length
    const pendientes = lista.filter(r => r.estado === 'pendiente').length
    const vencidas = lista.filter(r => r.estado === 'vencida').length

    const porcentajeCumplimiento = total > 0 ? Math.round((registradas / total) * 100) : 100
    const esSolvente = pendientes === 0 && vencidas === 0

    // Agrupar en 6 bloques semanales de 7 días
    const semanas = []
    for (let s = 5; s >= 0; s--) {
      const finSem = new Date(hoyAst)
      finSem.setUTCDate(hoyAst.getUTCDate() - (s * 7))
      const iniSem = new Date(finSem)
      iniSem.setUTCDate(finSem.getUTCDate() - 6)

      const iniStr = iniSem.toISOString().split('T')[0]
      const finStr = finSem.toISOString().split('T')[0]

      const clasesEnSemana = lista.filter(r => r.fecha >= iniStr && r.fecha <= finStr)
      const reg = clasesEnSemana.filter(r => r.estado === 'registrada' || r.estado === 'cubierta_emergente').length
      const pen = clasesEnSemana.filter(r => r.estado === 'pendiente').length
      const ven = clasesEnSemana.filter(r => r.estado === 'vencida').length

      semanas.push({
        label: s === 0 ? 'Esta Sem' : `Sem ${6 - s}`,
        registradas: reg,
        pendientes: pen,
        vencidas: ven,
      })
    }

    return {
      total,
      registradas,
      pendientes,
      vencidas,
      porcentajeCumplimiento,
      esSolvente,
      semanas,
    }
  } catch (err) {
    console.warn('[getMaestroHistoricoDesempeno] Exception:', err)
    return {
      total: 0,
      registradas: 0,
      pendientes: 0,
      vencidas: 0,
      porcentajeCumplimiento: 100,
      esSolvente: true,
      semanas: [
        { label: 'Sem 1', registradas: 0, pendientes: 0, vencidas: 0 },
        { label: 'Sem 2', registradas: 0, pendientes: 0, vencidas: 0 },
        { label: 'Sem 3', registradas: 0, pendientes: 0, vencidas: 0 },
        { label: 'Sem 4', registradas: 0, pendientes: 0, vencidas: 0 },
        { label: 'Sem 5', registradas: 0, pendientes: 0, vencidas: 0 },
        { label: 'Esta Sem', registradas: 0, pendientes: 0, vencidas: 0 },
      ]
    }
  }
}

/**
 * Consulta el historial de notificaciones enviadas a un maestro
 */
export async function getMaestroNotificationHistory(maestroId, limit = 20) {
  try {
    const { data: maestro } = await supabase
      .from('maestros')
      .select('id, user_id')
      .eq('id', maestroId)
      .maybeSingle()

    const targetUserId = maestro?.user_id
    if (targetUserId) {
      const { data } = await supabase
        .from('notificaciones')
        .select('id, titulo, mensaje, tipo, estado, created_at')
        .eq('profile_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(limit)

      return data || []
    }

    return []
  } catch (err) {
    console.warn('[getMaestroNotificationHistory] Exception:', err)
    return []
  }
}

/**
 * Registra un contacto / recordatorio enviado al maestro en la base de datos
 */
export async function registrarContactoWhatsAppMaestro(maestroId, { mensaje, canal = 'whatsapp', tipo = 'recordatorio_asistencia' }) {
  try {
    const { data: maestro } = await supabase
      .from('maestros')
      .select('id, user_id')
      .eq('id', maestroId)
      .maybeSingle()

    if (maestro?.user_id) {
      const { data, error } = await supabase
        .from('notificaciones')
        .insert({
          profile_id: maestro.user_id,
          titulo: 'Recordatorio de Asistencia por WhatsApp',
          mensaje: mensaje,
          tipo: tipo,
          canal: canal,
          estado: 'enviada',
          created_at: new Date().toISOString()
        })
        .select()

      if (!error && data?.[0]) return data[0]
    }

    return {
      id: 'notif_' + Date.now(),
      titulo: 'Recordatorio enviado',
      mensaje,
      canal,
      created_at: new Date().toISOString()
    }
  } catch (err) {
    console.warn('[registrarContactoWhatsAppMaestro] Error:', err)
    return null
  }
}
