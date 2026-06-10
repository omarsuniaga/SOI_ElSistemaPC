import { supabase } from '../../lib/supabaseClient.js'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_API_KEY = process.env.GROQ_API_KEY || localStorage.getItem('groq_api_key')

/**
 * Genera análisis pedagógico de una clase usando Groq
 */
export async function generateClaseAnalysis(claseData) {
  try {
    // Construir contexto de la clase
    const prompt = `
Analiza esta clase y proporciona un resumen útil para el maestro:

Clase: ${claseData.nombre}
Instrumento: ${claseData.instrumento || 'N/A'}
Cumplimiento: ${claseData.cumplimiento}%
Total alumnos: ${claseData.totalAlumnos}
Alumnos presentes (última sesión): ${claseData.alumnosPresentes || 'N/A'}
Alumnos ausentes: ${claseData.alumnosAusentes || 'N/A'}
Registros completados: ${claseData.registrosCompletos || 0}
Registros pendientes: ${claseData.registrosPendientes || 0}
Alumnos en riesgo: ${claseData.alumnosEnRiesgo || 0}
${claseData.alumnosEnRiesgoDetalle ? 'Razón riesgo: ' + claseData.alumnosEnRiesgoDetalle : ''}

Proporciona en JSON el siguiente análisis:
{
  "resumen": "2-3 líneas resumiendo el estado de la clase",
  "fortalezas": ["punto 1", "punto 2"],
  "preocupaciones": ["punto 1", "punto 2"],
  "recomendaciones": ["acción 1", "acción 2", "acción 3"],
  "alerta": "null o texto breve si hay algo crítico"
}

Sé directo, pedagógico y actionable. Responde SOLO JSON válido.`

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      console.error('[ClaseAnalysis] Groq error:', response.status)
      return null
    }

    const result = await response.json()
    const content = result.choices?.[0]?.message?.content || ''

    try {
      return JSON.parse(content)
    } catch (e) {
      console.error('[ClaseAnalysis] Parse error:', e)
      return null
    }
  } catch (err) {
    console.error('[ClaseAnalysis] Error:', err)
    return null
  }
}

/**
 * Obtiene datos completos de una clase para el análisis
 */
export async function getClaseDataForAnalysis(claseId, fechaActual) {
  try {
    // Obtener info de la clase
    const { data: clase } = await supabase
      .from('clases')
      .select('id, nombre, instrumento_id, instrumento')
      .eq('id', claseId)
      .maybeSingle()

    if (!clase) return null

    // Obtener alumnos inscritos
    const { data: inscripciones } = await supabase
      .from('inscripciones')
      .select('alumno_id')
      .eq('clase_id', claseId)

    const totalAlumnos = inscripciones?.length || 0

    // Obtener última sesión de hace max 30 días
    const hace30Dias = new Date(new Date(fechaActual).getTime() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    const { data: sesiones } = await supabase
      .from('sesiones_clase')
      .select('asistencia, contenido, borrador')
      .eq('clase_id', claseId)
      .gte('fecha', hace30Dias)
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
      .gte('fecha', hace30Dias)
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
