import { config } from '../../../core/config/config.js'
import * as supabaseImpl from './postulantesSupabase.js'
import * as mockImpl from './postulantesMock.js'

const getApi = () => (config.isDemoMode ? mockImpl : supabaseImpl)

export const buscarPostulante = (...args) => getApi().buscarPostulante(...args)
export const obtenerPostulante = (...args) => getApi().obtenerPostulante(...args)
export const listarPostulantes = (...args) => getApi().listarPostulantes(...args)
export const sincronizarPostulantes = (...args) => getApi().sincronizarPostulantes(...args)
export const backfillDesdePostulantes = (...args) => getApi().backfillDesdePostulantes(...args)

// Nuevas funciones para el Módulo de Postulados
export const actualizarEstadoPostulante = (...args) => getApi().actualizarEstadoPostulante(...args)
export const listarPostulantesPorMes    = (...args) => getApi().listarPostulantesPorMes(...args)
export const listarCitas                = (...args) => getApi().listarCitas(...args)
export const hayConflictoCita           = (...args) => getApi().hayConflictoCita(...args)
export const agregarNota                = (...args) => getApi().agregarNota(...args)
export const eliminarPostulante         = (...args) => getApi().eliminarPostulante(...args)
