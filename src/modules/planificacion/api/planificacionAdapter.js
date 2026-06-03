/**
 * planificacionAdapter.js — DataAdapter router for Planificacion
 *
 * Delegates to planificacionSupabase or planificacionMock based on
 * config.isDemoMode. All 9 exported functions share the same signatures
 * regardless of the backing implementation.
 */

import { config } from '../../../core/config/config.js'
import * as supabase from './planificacionSupabase.js'
import * as mock from './planificacionMock.js'

const api = () => (config.isDemoMode ? mock : supabase)

export const obtenerPlanificaciones = (maestroId) => api().obtenerPlanificaciones(maestroId)
export const obtenerPlanificacion = (id) => api().obtenerPlanificacion(id)
export const obtenerPlanificacionesConDetalles = (maestroId) =>
  api().obtenerPlanificacionesConDetalles(maestroId)
export const crearPlanificacion = (planData) => api().crearPlanificacion(planData)
export const actualizarPlanificacion = (id, actualizaciones) =>
  api().actualizarPlanificacion(id, actualizaciones)
export const eliminarPlanificacion = (id) => api().eliminarPlanificacion(id)
export const marcarRevisadasMasivo = (ids) => api().marcarRevisadasMasivo(ids)
export const marcarRevisada = (id) => api().marcarRevisada(id)
export const marcarEjecutada = (id) => api().marcarEjecutada(id)
