import { config } from '../../core/config/config.js'
import * as mock from './proponerContenidoMock.js'
import * as supabaseImpl from './proponerContenidoService.js'

/**
 * DataAdapter pattern (curriculo-tres-planos WU #8) — misma convención que
 * routeAdapter.js / weeklyPlanAdapter.js.
 */
const impl = config.isDemoMode ? mock : supabaseImpl

export const enviarPropuesta = (estructura, ctx) => impl.enviarPropuesta(estructura, ctx)
