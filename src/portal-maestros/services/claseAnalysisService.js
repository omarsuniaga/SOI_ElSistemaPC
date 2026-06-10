import { supabase } from '../../lib/supabaseClient.js'
import { callGroq, parseGroqJSON } from './groqService.js'

/**
 * Genera análisis pedagógico de una clase usando Groq
 */
export async function generateClaseAnalysis(claseData, contentTracking = null) {
  try {
    // Construir contexto de contenido (últimas 4 semanas)
    let contentContext = ''
    if (contentTracking && contentTracking.sesiones && contentTracking.sesiones.length > 0) {
      contentContext = `

CONTENIDO CUBIERTO (últimas 4 semanas):
${contentTracking.sesiones
  .slice(0, 8)
  .map(
    (s) => `
${s.fecha}: "${s.contenido}"
  ├─ Presentes: ${s.totalPresentes} alumnos
  └─ Ausentes: ${s.totalAusentes} alumnos
  Detalle: ${s.detalleAlumnos
      .map((d) => `${d.alumnoNombre} (${d.estado}${d.tieneObs ? ' ✓obs' : ' ✗obs'})`)
      .join(', ')}
`,
  )
  .join('')}

ANÁLISIS DE GAPS:
Identifica alumnos que faltaron a sesiones donde se cubrió contenido clave,
y si están atrás vs el grupo (no tienen observaciones sobre ese contenido mientras otros sí).
`
    }

    const prompt = `
Analiza esta clase y proporciona un resumen útil para el maestro:

CLASE: ${claseData.nombre}
Instrumento: ${claseData.instrumento || 'N/A'}
Cumplimiento: ${claseData.cumplimiento}%
Total alumnos: ${claseData.totalAlumnos}
Alumnos presentes (última sesión): ${claseData.alumnosPresentes || 'N/A'}
Alumnos ausentes: ${claseData.alumnosAusentes || 'N/A'}
Registros completados: ${claseData.registrosCompletos || 0}
Alumnos en riesgo: ${claseData.alumnosEnRiesgo || 0}
${claseData.alumnosEnRiesgoDetalle ? 'Razón riesgo: ' + claseData.alumnosEnRiesgoDetalle : ''}
${contentContext}

Proporciona en JSON el siguiente análisis:
{
  "resumen": "2-3 líneas resumiendo el estado de la clase",
  "fortalezas": ["punto 1", "punto 2"],
  "preocupaciones": ["punto 1: detalle con nombres de alumnos si aplica", "punto 2"],
  "recomendaciones": ["acción 1", "acción 2", "acción 3"],
  "alerta": "null o texto breve si hay algo crítico (ej: 'Juan lleva 2 semanas de faltas, se perdió escalas')"
}

Sé directo, pedagógico y actionable. Responde SOLO JSON válido.`

    const raw = await callGroq([{ role: 'user', content: prompt }])

    try {
      return parseGroqJSON(raw)
    } catch (e) {
      console.error('[ClaseAnalysis] Parse error:', e, '| raw:', raw)
      return null
    }
  } catch (err) {
    console.error('[ClaseAnalysis] Error:', err)
    return null
  }
}

/**
 * Obtiene tracking de contenido: sesiones + asistencias + observaciones (últimas 4-6 semanas)
 */
export async function getContentTracking(claseId, fechaActual, semanas = 4) {
  try {
    const hace_N_semanas = new Date(new Date(fechaActual).getTime() - semanas * 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    // 1. Obtener todas las sesiones en el rango
    const { data: sesiones } = await supabase
      .from('sesiones_clase')
      .select('id, fecha, contenido, asistencia')
      .eq('clase_id', claseId)
      .gte('fecha', hace_N_semanas)
      .lte('fecha', fechaActual)
      .order('fecha', { ascending: false })

    if (!sesiones || sesiones.length === 0) return { sesiones: [], tracking: [] }

    // 2. Obtener observaciones por alumno
    const { data: obs } = await supabase
      .from('observaciones_alumnos')
      .select('id, alumno_id, contenido, created_at')
      .eq('clase_id', claseId)
      .gte('created_at', hace_N_semanas + 'T00:00:00')

    const obsPorAlumno = {}
    if (obs) {
      obs.forEach((o) => {
        if (!obsPorAlumno[o.alumno_id]) obsPorAlumno[o.alumno_id] = []
        obsPorAlumno[o.alumno_id].push(o.contenido)
      })
    }

    // 3. Obtener nombres de alumnos
    const { data: alumnos } = await supabase
      .from('alumnos')
      .select('id, nombre_completo')

    const alumnoMap = Object.fromEntries((alumnos || []).map((a) => [a.id, a.nombre_completo]))

    // 4. Consolidar: sesión → quién fue → qué contenido cubrió → obs de cada alumno
    const tracking = sesiones.map((sesion) => {
      const asistentesRaw = Array.isArray(sesion.asistencia) ? sesion.asistencia : []
      const asistentes = asistentesRaw.filter((a) => a.estado === 'P').map((a) => a.alumno_id || a)
      const ausentes = asistentesRaw.filter((a) => a.estado === 'A').map((a) => a.alumno_id || a)

      return {
        fecha: sesion.fecha,
        contenido: sesion.contenido || '(sin descripción)',
        totalPresentes: asistentes.length,
        totalAusentes: ausentes.length,
        asistentes: asistentes.map((id) => alumnoMap[id] || 'Desconocido'),
        ausentes: ausentes.map((id) => alumnoMap[id] || 'Desconocido'),
        detalleAlumnos: asistentesRaw.map((a) => ({
          alumnoId: a.alumno_id || a,
          alumnoNombre: alumnoMap[a.alumno_id || a] || 'Desconocido',
          estado: a.estado,
          tieneObs: obsPorAlumno[a.alumno_id || a]?.length > 0,
          obsPreview: obsPorAlumno[a.alumno_id || a]?.[0] || null,
        })),
      }
    })

    return { sesiones: tracking, alumnoMap, obsPorAlumno }
  } catch (err) {
    console.error('[ContentTracking] Error:', err)
    return { sesiones: [], tracking: [], alumnoMap: {}, obsPorAlumno: {} }
  }
}

/**
 * Obtiene datos completos de una clase para el análisis
 */
export async function getClaseDataForAnalysis(claseId, fechaActual, semanas = 4) {
  try {
    console.log('[getClaseDataForAnalysis] Iniciando con claseId:', claseId, 'fecha:', fechaActual, 'semanas:', semanas)

    // Obtener info de la clase
    const { data: clase, error: claseError } = await supabase
      .from('clases')
      .select('id, nombre, instrumento')
      .eq('id', claseId)
      .maybeSingle()

    console.log('[getClaseDataForAnalysis] Clase:', clase, 'Error:', claseError)
    if (!clase) {
      console.warn('[getClaseDataForAnalysis] No se encontró clase con id:', claseId)
      return null
    }

    // Obtener alumnos inscritos
    const { data: inscripciones } = await supabase
      .from('inscripciones')
      .select('alumno_id')
      .eq('clase_id', claseId)

    const totalAlumnos = inscripciones?.length || 0

    // Obtener última sesión del período especificado
    const haceSemanas = new Date(new Date(fechaActual).getTime() - semanas * 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    const { data: sesiones } = await supabase
      .from('sesiones_clase')
      .select('asistencia, contenido, borrador')
      .eq('clase_id', claseId)
      .gte('fecha', haceSemanas)
      .order('fecha', { ascending: false })
      .limit(1)

    const ultimaSesion = sesiones?.[0]
    const alumnosPresentes = Array.isArray(ultimaSesion?.asistencia)
      ? ultimaSesion.asistencia.filter((a) => a.estado === 'P').length
      : 0
    const alumnosAusentes = totalAlumnos - alumnosPresentes

    // Contar registros completos vs pendientes (últimas 10 sesiones)
    const { data: allSesiones } = await supabase
      .from('sesiones_clase')
      .select('asistencia, contenido, borrador')
      .eq('clase_id', claseId)
      .gte('fecha', haceSemanas)
      .order('fecha', { ascending: false })
      .limit(10)

    const registrosCompletos = (allSesiones || []).filter((s) => {
      const tieneAsistencia = Array.isArray(s.asistencia) && s.asistencia.length > 0
      const tieneContenido = typeof s.contenido === 'string' && s.contenido.trim().length > 0
      return tieneAsistencia || (s.borrador === false && tieneContenido)
    }).length

    const registrosPendientes = (allSesiones || []).length - registrosCompletos

    // Calcular cumplimiento
    const cumplimiento = allSesiones && allSesiones.length > 0
      ? Math.round((registrosCompletos / allSesiones.length) * 100)
      : 0

    // Detectar alumnos en riesgo (asistencia <70% en últimas 4 semanas)
    const hace4Semanas = new Date(new Date(fechaActual).getTime() - 28 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    const { data: asistencias } = await supabase
      .from('asistencias')
      .select('alumno_id, estado')
      .eq('clase_id', claseId)
      .gte('fecha', hace4Semanas)

    const asistenciasPorAlumno = {}
    if (asistencias) {
      asistencias.forEach((a) => {
        if (!asistenciasPorAlumno[a.alumno_id]) {
          asistenciasPorAlumno[a.alumno_id] = { total: 0, presentes: 0 }
        }
        asistenciasPorAlumno[a.alumno_id].total++
        if (a.estado === 'P') asistenciasPorAlumno[a.alumno_id].presentes++
      })
    }

    const alumnosEnRiesgo = Object.values(asistenciasPorAlumno).filter(
      (a) => a.total >= 3 && a.presentes / a.total < 0.7
    ).length

    return {
      id: claseId,
      nombre: clase.nombre,
      instrumento: clase.instrumento || 'Sin especificar',
      cumplimiento,
      totalAlumnos,
      alumnosPresentes,
      alumnosAusentes,
      registrosCompletos,
      registrosPendientes,
      alumnosEnRiesgo,
      alumnosEnRiesgoDetalle: alumnosEnRiesgo > 0
        ? `${alumnosEnRiesgo} alumno(s) con <70% asistencia`
        : null,
    }
  } catch (err) {
    console.error('[ClaseDataForAnalysis] Error:', err)
    return null
  }
}
