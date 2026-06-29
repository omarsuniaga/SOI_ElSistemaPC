/**
 * weeklyPlanAdapter.js — DataAdapter router for Weekly Plans & Routes
 *
 * Delegates to weeklyPlanSupabase or weeklyPlanMock based on config.isDemoMode.
 * Exposes a unified API for the Academics (ACM) Portal and Teacher Portal.
 */

import { config } from '../../../core/config/config.js'
import * as supabase from './weeklyPlanSupabase.js'
import * as mock from './weeklyPlanMock.js'

const impl = config.isDemoMode ? mock : supabase

export const obtenerFuentesCurriculares = () => impl.obtenerFuentesCurriculares()

export const obtenerPlanSemanalPorNivel = (levelId, instrument = 'violín') => 
  impl.obtenerPlanSemanalPorNivel(levelId, instrument)

export const obtenerRutasActivas = (maestroId = null) => 
  impl.obtenerRutasActivas(maestroId)

export const obtenerGuiaHeredadaPorClase = (claseId, maestroId = null) =>
  impl.obtenerGuiaHeredadaPorClase(claseId, maestroId)

export const obtenerRutaActivaPorGrupo = (groupId) => 
  impl.obtenerRutaActivaPorGrupo(groupId)

export const crearRutaActiva = (routeData) => 
  impl.crearRutaActiva(routeData)

export const actualizarSemanaRutaActiva = (routeId, nuevaSemana) => 
  impl.actualizarSemanaRutaActiva(routeId, nuevaSemana)

export const registrarProgresoIndicador = (studentId, indicatorId, status, observation = '', evidenceUrl = '', sessionId = null) => 
  impl.registrarProgresoIndicador(studentId, indicatorId, status, observation, evidenceUrl, sessionId)

export const obtenerProgresoGrupo = (groupId, levelId = null) => 
  impl.obtenerProgresoGrupo(groupId, levelId)
