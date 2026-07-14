import { supabase } from './supabaseClient.js'

let cachedHasPeriodoSupport = null

/**
 * Sniffer dinámico para detectar si la base de datos física de producción
 * cuenta con soporte para periodos (migración aplicada con la columna periodo_id en la tabla clases).
 * No lanza excepciones ni ruidos HTTP 400 en la consola del navegador.
 */
export async function checkPeriodoSupport() {
  if (cachedHasPeriodoSupport !== null) {
    return cachedHasPeriodoSupport
  }

  // Si estamos en entorno de tests locales (Vitest), asumimos que sí hay soporte
  const isTestEnv = typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true')
  if (isTestEnv) {
    cachedHasPeriodoSupport = true
    return true
  }

  try {
    // 1. Verificar primero si existe la tabla 'periodos' consultando con select '*' y limit(1)
    // Usamos select('*') para evitar que falle por columnas ausentes
    const { data: periodos, error: pError } = await supabase
      .from('periodos')
      .select('*')
      .limit(1)

    if (pError || !periodos) {
      cachedHasPeriodoSupport = false
      return false
    }

    // 2. Oler la tabla 'clases' para ver si tiene la columna periodo_id
    const { data: clases, error: cError } = await supabase
      .from('clases')
      .select('*')
      .limit(1)

    if (cError) {
      cachedHasPeriodoSupport = false
      return false
    }

    // Si hay clases registradas en el portal, verificamos directamente la existencia de la propiedad
    if (clases.length > 0) {
      cachedHasPeriodoSupport = 'periodo_id' in clases[0]
      return cachedHasPeriodoSupport
    }

    // Si no hay clases registradas, verificamos si existe la tabla periodos y asumimos soporte
    cachedHasPeriodoSupport = true
    return true
  } catch (err) {
    console.warn('[PeriodoSniffer] Error al detectar soporte de periodos en DB:', err)
    cachedHasPeriodoSupport = false
    return false
  }
}
