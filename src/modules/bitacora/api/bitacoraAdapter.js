import { config } from '../../../core/config/config.js'
import * as supabase from './bitacoraSupabase.js'
import * as mock from './bitacoraMock.js'

const impl = config.isDemoMode ? mock : supabase

export const getObjetivosClase = (claseId) => impl.getObjetivosClase(claseId)
export const getSemaforoClase = (claseId) => impl.getSemaforoClase(claseId)
export const registrarSesion = (payload) => impl.registrarSesion(payload)
export const getHistorialContenido = (claseId, objetivoId) =>
  impl.getHistorialContenido(claseId, objetivoId)
