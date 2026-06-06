import { callGroq, parseGroqJSON } from '../portal-maestros/services/groqService.js'
import { getQueryStats, getIndexes } from './dbOptimizer.js'
import { getRecentErrors } from './errorReporter.js'
import { getCacheVersion } from './swCaching.js'

const SYSTEM_PROMPT = `
Eres un agente de diagnóstico inteligente del Sistema SOI (Sistema Operativo Institucional).
Analizas las métricas de rendimiento, estadísticas de consultas de base de datos, caché del Service Worker y logs de errores recientes para generar un diagnóstico y sugerencias de auto-mantenimiento.

Debes responder ÚNICAMENTE con un objeto JSON estructurado con el siguiente formato exacto:
{
  "healthScore": 85, // número del 0 al 100 indicando la salud general del sistema
  "findings": [ // lista de hallazgos
    {
      "severity": "critical" | "warning" | "info",
      "msg": "Descripción breve del problema detectado (máx 80 caracteres)."
    }
  ],
  "recommendations": {
    "sql": "CREATE INDEX IF NOT EXISTS...", // SQL sugerido para optimizar las consultas lentas detectadas, o null si no se requiere.
    "cache": "clear" | "keep", // Sugerencia sobre si es conveniente vaciar la caché PWA para solucionar errores detectados.
    "advice": "Consejo o recomendación pedagógica/arquitectónica de 1 frase (máx 120 caracteres)."
  }
}

Reglas:
1. Sé extremadamente honesto con el healthScore: si hay múltiples errores capturados, baja el score. Si las estadísticas de consultas muestran fallos de índice (index Misses), baja el score.
2. Si las estadísticas muestran index misses elevadas en ciertas columnas, propone el SQL de creación de índice adecuado en "sql".
3. Responde únicamente con el JSON válido, sin bloques de código markdown, sin prefijos, sin explicaciones externas.
`

export async function runAIDiagnostic() {
  const queryStats = getQueryStats()
  const definedIndexes = getIndexes()
  const recentErrors = getRecentErrors()
  const cacheVersion = getCacheVersion()

  const payload = {
    queryStats,
    definedIndexes,
    recentErrors,
    cacheVersion,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'NodeJS-Test-Env'
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: JSON.stringify(payload) }
  ]

  try {
    const rawResponse = await callGroq(messages)
    const diagnosis = parseGroqJSON(rawResponse)
    
    // Normalization & Fallbacks
    return {
      healthScore: typeof diagnosis.healthScore === 'number' ? Math.min(100, Math.max(0, diagnosis.healthScore)) : 100,
      findings: Array.isArray(diagnosis.findings) ? diagnosis.findings : [],
      recommendations: {
        sql: diagnosis.recommendations?.sql || null,
        cache: diagnosis.recommendations?.cache || 'keep',
        advice: diagnosis.recommendations?.advice || 'El sistema funciona de forma óptima.'
      }
    }
  } catch (err) {
    console.error('[aiDiagnosticService] Failed to run AI diagnostics:', err)
    
    // Graceful fallback in case AI is offline or returns invalid format
    const hasErrors = recentErrors.length > 0
    const hasMisses = queryStats.indexMisses > queryStats.indexHits
    
    return {
      healthScore: hasErrors ? 70 : (hasMisses ? 85 : 95),
      findings: [
        ...(hasErrors ? [{ severity: 'critical', msg: `Se detectaron ${recentErrors.length} errores recientes en el reportero.` }] : []),
        ...(hasMisses ? [{ severity: 'warning', msg: 'Elevada tasa de búsquedas secuenciales (misses de índice).' }] : []),
        { severity: 'info', msg: 'Modo de contingencia: diagnóstico local básico (IA offline).' }
      ],
      recommendations: {
        sql: hasMisses ? 'CREATE INDEX IF NOT EXISTS obs_student_date ON observations (student_id, created_at);' : null,
        cache: hasErrors ? 'clear' : 'keep',
        advice: 'Conexión con el servicio de IA no disponible. Se aplicó el diagnóstico heurístico local.'
      }
    }
  }
}
