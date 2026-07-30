import { analyzeAllStudentsRisk } from '../../pedagogico/services/studentRiskDetectorService.js'
import { getReporteConsolidado } from '../../asistencias/api/asistenciasApi.js'
import { callGroq } from '../../../portal-maestros/services/groqService.js'

const REPORTS_KEY = 'soi_reportes_director_logs'

export function obtenerReportesDirector() {
  try {
    const raw = localStorage.getItem(REPORTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error('[aiReportingService] Error reading reports:', e)
    return []
  }
}

function guardarReporteDirector(report) {
  try {
    const reports = obtenerReportesDirector()
    reports.unshift({
      id: `report_${Date.now()}`,
      created_at: new Date().toISOString(),
      ...report
    })
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports))
  } catch (e) {
    console.error('[aiReportingService] Error saving report:', e)
  }
}

export async function generarReporteConsolidadoIA() {
  // 1. Obtener los riesgos de alumnos
  const riesgos = await analyzeAllStudentsRisk()
  
  // 2. Obtener el consolidado de asistencia
  const { resumenGlobal, timelineByDate } = await getReporteConsolidado()
  
  // 3. Procesar estadísticas para el prompt
  const totalClases = resumenGlobal?.totalClases || 0
  const totalSesiones = resumenGlobal?.totalSesiones || 0
  const presentes = resumenGlobal?.totalPresentes || 0
  const ausentes = resumenGlobal?.totalAusentes || 0
  const totalAsistencias = resumenGlobal?.totalRegistros || 0
  const tasaAsistenciaGral = totalAsistencias > 0 ? ((presentes / totalAsistencias) * 100).toFixed(1) : '0'

  // Agrupar asistencia por instrumento
  const porInstrumento = {}
  if (timelineByDate) {
    timelineByDate.forEach(day => {
      day.clases.forEach(cl => {
        if (cl.asistencias) {
          cl.asistencias.forEach(ast => {
            const inst = ast.instrumento || 'General'
            if (!porInstrumento[inst]) {
              porInstrumento[inst] = { presentes: 0, total: 0 }
            }
            porInstrumento[inst].total++
            if (ast.estado === 'presente') porInstrumento[inst].presentes++
          })
        }
      })
    })
  }

  const statsInstrumento = Object.entries(porInstrumento).map(([inst, s]) => {
    const rate = s.total > 0 ? ((s.presentes / s.total) * 100).toFixed(1) : '0'
    return `* ${inst}: ${rate}% (${s.presentes}/${s.total})`
  }).join('\n')

  // Alumnos en riesgo crítico/alto
  const riesgosCriticos = riesgos.filter(r => r.nivelRiesgo === 'critico' || r.nivelRiesgo === 'alto')
  const listaRiesgos = riesgosCriticos.map(r => 
    `* ${r.alumnoNombre} (Riesgo: ${r.nivelRiesgo.toUpperCase()}, Score: ${r.score}): ${r.razones.join(' · ')}`
  ).join('\n') || '* Ningún alumno en riesgo crítico o alto detectado.'

  // Construir prompt
  const systemPrompt = `Eres el Coordinador Pedagógico Senior de "El Sistema Punta Cana" (fundación de educación musical).
Tu tarea es redactar el Reporte Consolidado Semanal de Dirección para el Director General.
Debes entregar un análisis detallado, pedagógico, estratégico y formal en base a las estadísticas reales recibidas.
Reglas:
- Redacta en español formal e institucional.
- Sé sumamente claro y estructurado. Usa emojis para los títulos.
- Escribe el reporte en formato Markdown completo y profesional con secciones claras.
- Proporciona planes de acción realistas y concretos para los alumnos en riesgo.`

  const userPrompt = `A continuación se detallan las estadísticas consolidadas de la última semana:

📊 ESTADÍSTICAS GENERALES DE ASISTENCIA:
- Tasa de Asistencia General: ${tasaAsistenciaGral}%
- Total Clases Impartidas: ${totalClases}
- Total Sesiones Registradas: ${totalSesiones}
- Alumnos Presentes acumulados: ${presentes}
- Alumnos Ausentes acumulados: ${ausentes}

🎻 ASISTENCIA POR INSTRUMENTO:
${statsInstrumento}

👥 ALUMNOS EN RIESGO DETECTADOS:
${listaRiesgos}

Por favor, genera el reporte en Markdown con las siguientes secciones:
1. 📈 Resumen Ejecutivo (Análisis de la asistencia general e interpretación de los datos).
2. 🎻 Desempeño y Asistencia por Cátedra (Identificar cátedras líderes y cuáles requieren atención).
3. ⚠️ Alumnos de Atención Prioritaria (Análisis de los estudiantes críticos y planes recomendados).
4. 🎯 Recomendaciones Pedagógicas y Operativas para la Dirección.`

  // Llamar a Groq
  let content = ''
  try {
    const respuesta = await callGroq([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ])

    if (typeof respuesta === 'string') content = respuesta.trim()
    else if (respuesta && typeof respuesta.content === 'string') content = respuesta.content.trim()
    else content = String(respuesta || '').trim()
  } catch (e) {
    console.error('[aiReportingService] Groq failed, generating fallback template:', e)
    // Fallback template if proxy or API fails (e.g. rate limits or offline)
    content = `# 📈 Reporte Consolidado Semanal de Dirección

## 📊 Resumen Ejecutivo
La última semana cerró con una tasa de asistencia general del **${tasaAsistenciaGral}%**, habiéndose impartido **${totalClases} clases** en **${totalSesiones} sesiones** registradas. 

## 🎻 Desempeño y Asistencia por Cátedra
El desglose de asistencia acumulada por cátedra de instrumento muestra el siguiente desempeño:
${statsInstrumento}

## ⚠️ Alumnos de Atención Prioritaria
Se identificaron los siguientes casos que requieren intervención inmediata de coordinación social o tutoría:
${listaRiesgos}

## 🎯 Recomendaciones del Coordinador Pedagógico
1. **Intervención Familiar:** Contactar a los representantes de los alumnos con riesgo alto para mitigar deserción.
2. **Refuerzo en Cátedras:** Apoyar a los profesores de los instrumentos con menor porcentaje de asistencia.
3. **Monitoreo de Objetivos:** Sincronizar planes remediales en las clases remediales de la semana entrante.`
  }

  const nuevoReporte = {
    titulo: `Reporte consolidado de dirección — ${new Date().toLocaleDateString('es-ES')}`,
    asistencia_general: parseFloat(tasaAsistenciaGral),
    total_clases: totalClases,
    riesgos_criticos_count: riesgosCriticos.length,
    contenido_markdown: content
  }

  guardarReporteDirector(nuevoReporte)
  return nuevoReporte
}
