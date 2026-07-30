import { obtenerAlumnos, obtenerAlumno } from '../../alumnos/api/alumnosApi.js'
import { getReporteConsolidado } from '../../asistencias/api/asistenciasApi.js'
import { supabase } from '../../../lib/supabaseClient.js'

const LOGS_KEY = 'soi_boletines_automaticos_logs'

// Helper to load sent logs from LocalStorage
export function obtenerBoletinesEnviados() {
  try {
    const raw = localStorage.getItem(LOGS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error('[boletinesService] Error reading logs:', e)
    return []
  }
}

// Helper to save a log entry
function registrarLogBoletin(logEntry) {
  try {
    const logs = obtenerBoletinesEnviados()
    logs.unshift({
      id: `bulletin_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      fecha_envio: new Date().toISOString(),
      ...logEntry
    })
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs))
  } catch (e) {
    console.error('[boletinesService] Error saving log:', e)
  }
}

/**
 * Trigger 1: Ausencias Irregulares (3+ inasistencias en la última semana)
 */
export async function procesarAusenciasSemanales() {
  const logsPrevios = obtenerBoletinesEnviados()
  const unaSemanaAtras = new Date()
  unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7)
  const unaSemanaAtrasStr = unaSemanaAtras.toISOString().split('T')[0]

  // Obtener consolidado para computar asistencias
  const { timelineByDate } = await getReporteConsolidado()
  if (!timelineByDate || timelineByDate.length === 0) return { procesados: 0, enviados: 0 }

  // Contar faltas agrupadas por alumno en la última semana
  const inasistencias = {}
  timelineByDate.forEach(day => {
    if (day.fecha >= unaSemanaAtrasStr) {
      day.clases.forEach(cl => {
        if (cl.asistencias) {
          cl.asistencias.forEach(ast => {
            if (ast.estado === 'ausente') {
              inasistencias[ast.alumno_id] = (inasistencias[ast.alumno_id] || 0) + 1
            }
          })
        }
      })
    }
  })

  let procesados = 0
  let enviados = 0

  const { alumnos } = await obtenerAlumnos({ page: 0, pageSize: 200 })

  for (const [alumnoId, faltas] of Object.entries(inasistencias)) {
    if (faltas >= 3) {
      procesados++
      
      // Evitar spam: no enviar más de un boletín de ausencias cada 7 días para el mismo alumno
      const yaEnviado = logsPrevios.some(
        log => log.alumno_id === alumnoId && 
        log.tipo === 'ausencia_irregular' && 
        new Date(log.fecha_envio) >= unaSemanaAtras
      )

      if (yaEnviado) continue

      const alumno = alumnos.find(a => a.id === alumnoId)
      if (!alumno) continue

      const destinatario = alumno.representante_nombre || alumno.madre_nombre || 'Representante'
      const telefono = alumno.madre_tlf_whatsapp || alumno.padre_tlf_whatsapp || alumno.representante_tlf || ''

      if (!telefono) continue

      const mensaje = `Estimado/a ${destinatario}, le notificamos que ${alumno.nombre_completo} ha acumulado ${faltas} inasistencias en la última semana. Por favor contáctenos para justificar las ausencias. El Sistema Punta Cana.`

      registrarLogBoletin({
        alumno_id: alumnoId,
        alumno_nombre: alumno.nombre_completo,
        contacto_nombre: destinatario,
        contacto_telefono: telefono,
        tipo: 'ausencia_irregular',
        mensaje,
        estado: 'enviado_automatico'
      })
      enviados++
    }
  }

  return { procesados, enviados }
}

/**
 * Trigger 2: Evaluación de Desempeño Baja (< 3 en un indicador crítico)
 */
export async function procesarEvaluacionBaja(sesionId, alumnoId, nota, observaciones, indicadorId) {
  if (nota === null || nota >= 3) return

  let isRequired = false
  let indicadorDesc = 'indicador de desempeño'

  // Determinar si el indicador es requerido/crítico
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    // Simulación mock
    isRequired = indicadorId === 'demo-ind-1' || indicadorId === 'demo-ind-3' || String(indicadorId).includes('ind-')
    indicadorDesc = indicadorId === 'demo-ind-1' ? 'Espalda alineada' : 'Afinación del instrumento'
  } else {
    try {
      const { data } = await supabase
        .from('indicators')
        .select('is_required, description')
        .eq('id', indicadorId)
        .single()
      if (data) {
        isRequired = !!data.is_required
        indicadorDesc = data.description || indicadorDesc
      }
    } catch (e) {
      console.error('[boletinesService] Error querying indicator:', e)
    }
  }

  // Solo se gatilla si el indicador es crítico/requerido
  if (!isRequired) return

  try {
    const alumno = await obtenerAlumno(alumnoId)
    const destinatario = alumno.representante_nombre || alumno.madre_nombre || 'Representante'
    const telefono = alumno.madre_tlf_whatsapp || alumno.padre_tlf_whatsapp || alumno.representante_tlf || ''

    if (!telefono) return

    const mensaje = `Estimado/a ${destinatario}, le informamos que ${alumno.nombre_completo} ha obtenido un desempeño bajo (${nota}/5) en el indicador crítico '${indicadorDesc}'. Le sugerimos conversar con el maestro para reforzar esta área. El Sistema Punta Cana.`

    registrarLogBoletin({
      alumno_id: alumnoId,
      alumno_nombre: alumno.nombre_completo,
      contacto_nombre: destinatario,
      contacto_telefono: telefono,
      tipo: 'desempeno_bajo',
      mensaje,
      estado: 'enviado_automatico'
    })
  } catch (e) {
    console.error('[boletinesService] Error processing low evaluation:', e)
  }
}

/**
 * Trigger 3: Avance Pedagógico Positivo (Nuevo logro alcanzado)
 */
export async function procesarAvancePedagogico(alumnoId, indicadorId) {
  let indicadorDesc = 'indicador de desempeño'

  if (import.meta.env.VITE_USE_MOCK === 'true') {
    indicadorDesc = indicadorId === 'demo-ind-2' ? 'Hombros relajados' : 'Escala de Do Mayor'
  } else {
    try {
      const { data } = await supabase
        .from('indicators')
        .select('description')
        .eq('id', indicadorId)
        .single()
      if (data) {
        indicadorDesc = data.description || indicadorDesc
      }
    } catch (e) {
      console.error('[boletinesService] Error querying indicator for achievement:', e)
    }
  }

  try {
    const alumno = await obtenerAlumno(alumnoId)
    const destinatario = alumno.representante_nombre || alumno.madre_nombre || 'Representante'
    const telefono = alumno.madre_tlf_whatsapp || alumno.padre_tlf_whatsapp || alumno.representante_tlf || ''

    if (!telefono) return

    const mensaje = `¡Felicitaciones ${destinatario}! Queremos compartirle que ${alumno.nombre_completo} ha alcanzado un nuevo logro en su ruta de aprendizaje: '${indicadorDesc}'. ¡Sigamos apoyando su crecimiento musical! El Sistema Punta Cana.`

    registrarLogBoletin({
      alumno_id: alumnoId,
      alumno_nombre: alumno.nombre_completo,
      contacto_nombre: destinatario,
      contacto_telefono: telefono,
      tipo: 'logro_pedagogico',
      mensaje,
      estado: 'enviado_automatico'
    })
  } catch (e) {
    console.error('[boletinesService] Error processing achievement notification:', e)
  }
}

/**
 * Trigger 4: Cumpleaños del Alumno
 */
export async function procesarCumpleanosDiarios() {
  const logsPrevios = obtenerBoletinesEnviados()
  const hoyStr = new Date().toISOString().slice(5, 10) // MM-DD
  const hoyAnioStr = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  const { alumnos } = await obtenerAlumnos({ page: 0, pageSize: 200 })
  let enviados = 0

  alumnos.forEach(alumno => {
    if (alumno.fecha_nacimiento && alumno.fecha_nacimiento.slice(5, 10) === hoyStr) {
      // Evitar duplicar el envío de cumpleaños hoy
      const yaEnviado = logsPrevios.some(
        log => log.alumno_id === alumno.id && 
        log.tipo === 'cumpleanos' && 
        log.fecha_envio.slice(0, 10) === hoyAnioStr
      )

      if (yaEnviado) return

      const telefono = alumno.madre_tlf_whatsapp || alumno.padre_tlf_whatsapp || alumno.representante_tlf || ''
      if (!telefono) return

      const mensaje = `¡Feliz cumpleaños ${alumno.nombre_completo}! Que pases un hermoso día lleno de música. Con mucho cariño, la familia de El Sistema Punta Cana.`

      registrarLogBoletin({
        alumno_id: alumno.id,
        alumno_nombre: alumno.nombre_completo,
        contacto_nombre: alumno.representante_nombre || 'Alumno',
        contacto_telefono: telefono,
        tipo: 'cumpleanos',
        mensaje,
        estado: 'enviado_automatico'
      })
      enviados++
    }
  })

  return { enviados }
}
