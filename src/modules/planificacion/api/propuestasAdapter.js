import { config } from '../../../core/config/config.js'
import * as mock from './propuestasMock.js'
import * as supabaseImpl from './propuestasApi.js'

/**
 * DataAdapter pattern (curriculo-tres-planos WU #8) — misma convención que
 * routeAdapter.js / weeklyPlanAdapter.js.
 */
const impl = config.isDemoMode ? mock : supabaseImpl

export const listarPropuestasPendientes = () => impl.listarPropuestasPendientes()
export const publicarPropuesta = (routeVersionId) => impl.publicarPropuesta(routeVersionId)
export const devolverPropuesta = (routeVersionId, feedback) => impl.devolverPropuesta(routeVersionId, feedback)
