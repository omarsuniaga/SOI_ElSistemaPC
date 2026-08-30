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
import * as plantillasSupabase from './plantillasSupabase.js'
import * as plantillasPlanificacionSupabase from './plantillasPlanificacionSupabase.js'

// El mock exporta exactamente las 17 funciones que el adapter delega. Antes
// `impl` estaba hardcodeado a supabase (el import de config quedaba muerto) →
// en Demo mode y en tests las llamadas colgaban / "No supabase configured".
const impl = config.isDemoMode ? mock : supabase
const plantillasImpl = plantillasSupabase
const plantillasPlanificacionImpl = plantillasPlanificacionSupabase

export const obtenerPlanificaciones = (maestroId) => impl.obtenerPlanificaciones(maestroId)
export const obtenerPlanificacion = (id) => impl.obtenerPlanificacion(id)
export const obtenerPlanificacionesConDetalles = (maestroId) =>
  impl.obtenerPlanificacionesConDetalles(maestroId)
export const obtenerPlanificacionesPaginadas = (maestroId, params) =>
  impl.obtenerPlanificacionesPaginadas(maestroId, params)
export const obtenerPlanificacionesExportables = (params) =>
  impl.obtenerPlanificacionesExportables(params)
export const obtenerCoberturaEvaluacion = (claseId) => impl.obtenerCoberturaEvaluacion(claseId)
export const crearPlanificacion = (planData) => impl.crearPlanificacion(planData)
export const actualizarPlanificacion = (id, actualizaciones) =>
  impl.actualizarPlanificacion(id, actualizaciones)
export const eliminarPlanificacion = (id) => impl.eliminarPlanificacion(id)
export const marcarRevisadasMasivo = (ids) => impl.marcarRevisadasMasivo(ids)
export const marcarRevisada = (id) => impl.marcarRevisada(id)
export const marcarEjecutada = (id) => impl.marcarEjecutada(id)
export const obtenerClases = () => impl.obtenerClases()
export const obtenerMaestros = () => impl.obtenerMaestros()
export const obtenerMaestro = (id) => impl.obtenerMaestro(id)
export const obtenerSesiones = (maestroId, fechaInicio, fechaFin) =>
  impl.obtenerSesiones(maestroId, fechaInicio, fechaFin)

/**
 * Cobertura curricular: todas las clases con o sin plan asociado.
 * Usar esta función (no planificacionApi directo) para respetar el DataAdapter.
 * @param {string|null} maestroId - null para vista admin (todas las clases)
 */
export const obtenerCoberturaCurricular = (maestroId) => impl.obtenerCoberturaCurricular(maestroId)

// ── Plantillas DSL ─────────────────────────────────────────────────

export const obtenerPlantillas = () => plantillasImpl.obtenerPlantillas()
export const obtenerPlantilla = (id) => plantillasImpl.obtenerPlantilla(id)
export const crearPlantilla = (data) => plantillasImpl.crearPlantilla(data)
export const actualizarPlantilla = (id, cambios) => plantillasImpl.actualizarPlantilla(id, cambios)
export const eliminarPlantilla = (id) => plantillasImpl.eliminarPlantilla(id)

// ── Plantillas de Planificación ──────────────────────────────────────────────

export const obtenerPlantillasPlanificacion = () =>
  plantillasPlanificacionImpl.obtenerPlantillasPlanificacion()
export const obtenerPlantillaPlanificacion = (id) =>
  plantillasPlanificacionImpl.obtenerPlantillaPlanificacion(id)
export const crearPlantillaPlanificacion = (data) =>
  plantillasPlanificacionImpl.crearPlantillaPlanificacion(data)
export const actualizarPlantillaPlanificacion = (id, cambios) =>
  plantillasPlanificacionImpl.actualizarPlantillaPlanificacion(id, cambios)
export const eliminarPlantillaPlanificacion = (id) =>
  plantillasPlanificacionImpl.eliminarPlantillaPlanificacion(id)
export const guardarArbolCurricular = (data) =>
  plantillasPlanificacionImpl.guardarArbolCurricular(data)

