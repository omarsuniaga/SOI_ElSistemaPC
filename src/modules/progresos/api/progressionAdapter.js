import { config } from '../../../core/config/config.js'
import * as mock from './progressionMock.js'
import * as supabaseImpl from './progressionApi.js'

/**
 * DataAdapter pattern (curriculo-tres-planos WU #8) — misma convención que
 * weeklyPlanAdapter.js / routeAdapter.js: config.isDemoMode enruta a la
 * implementación en memoria o a Supabase.
 */
const impl = config.isDemoMode ? mock : supabaseImpl

export const getObjetivoActual = (alumnoId, routeVersionId) =>
  impl.getObjetivoActual(alumnoId, routeVersionId)
