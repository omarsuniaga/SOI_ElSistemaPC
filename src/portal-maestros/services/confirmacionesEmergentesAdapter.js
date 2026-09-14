import { config } from '../../core/config/config.js'
import * as mock from './confirmacionesEmergentesMock.js'
import * as supabaseImpl from './confirmacionesEmergentesService.js'

/**
 * DataAdapter pattern for Institutional Activity Confirmations (justificacion-actividades-emergentes).
 * Automatically delegates to Mock implementation in Demo Mode (config.isDemoMode = true)
 * or Supabase implementation in production.
 */

const getImpl = () => (config.isDemoMode ? mock : supabaseImpl)

export const confirmarActividad = (datos) => getImpl().confirmarActividad(datos)

export const obtenerConfirmacionesPendientes = (maestroId) =>
  getImpl().obtenerConfirmacionesPendientes(maestroId)

export const obtenerActividadPorId = (actividad_id) =>
  getImpl().obtenerActividadPorId(actividad_id)

export const obtenerActividadesPorAlcance = (maestroId, fecha) =>
  getImpl().obtenerActividadesPorAlcance(maestroId, fecha)

export const obtenerMaestrosAfectadosPorAlcance = (params) =>
  getImpl().obtenerMaestrosAfectadosPorAlcance(params)
