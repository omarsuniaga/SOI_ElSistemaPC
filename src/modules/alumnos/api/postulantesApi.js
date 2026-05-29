import { config } from '../../../core/config/config.js'
import * as supabaseImpl from './postulantesSupabase.js'
import * as mockImpl from './postulantesMock.js'

const getApi = () => (config.isDemoMode ? mockImpl : supabaseImpl)

export const buscarPostulante = (...args) => getApi().buscarPostulante(...args)
export const obtenerPostulante = (...args) => getApi().obtenerPostulante(...args)
export const listarPostulantes = (...args) => getApi().listarPostulantes(...args)
export const sincronizarPostulantes = (...args) => getApi().sincronizarPostulantes(...args)
export const backfillDesdePostulantes = (...args) => getApi().backfillDesdePostulantes(...args)
