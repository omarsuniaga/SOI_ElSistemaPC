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

export const obtenerFuentesCurriculares = (claseId = null) => impl.obtenerFuentesCurriculares(claseId)

export const obtenerPlanSemanalPorNivel = (levelId, instrument = 'violín') => 
  impl.obtenerPlanSemanalPorNivel(levelId, instrument)

export const obtenerPlanSemanalPorId = (planId) =>
  impl.obtenerPlanSemanalPorId(planId)

export const obtenerRutasActivas = (maestroId = null) => 
  impl.obtenerRutasActivas(maestroId)

export const obtenerGuiaHeredadaPorClase = (claseId, maestroId = null) =>
  impl.obtenerGuiaHeredadaPorClase(claseId, maestroId)

export const obtenerRutaActivaPorGrupo = (groupId) => 
  impl.obtenerRutaActivaPorGrupo(groupId)

export const obtenerAjustesPlanDocente = (groupId, teacherId, weeklyPlanId) =>
  impl.obtenerAjustesPlanDocente(groupId, teacherId, weeklyPlanId)

export const guardarAjustePlanDocente = (adjustmentData) =>
  impl.guardarAjustePlanDocente(adjustmentData)

export const crearRutaActiva = (routeData) => 
  impl.crearRutaActiva(routeData)

export const actualizarSemanaRutaActiva = (routeId, nuevaSemana) => 
  impl.actualizarSemanaRutaActiva(routeId, nuevaSemana)

export const registrarProgresoIndicador = async (studentId, indicatorId, status, observation = '', evidenceUrl = '', sessionId = null) => {
  const result = await impl.registrarProgresoIndicador(studentId, indicatorId, status, observation, evidenceUrl, sessionId)
  if (status === 'achieved') {
    import('../../comunicaciones/services/boletinesService.js')
      .then((m) => m.procesarAvancePedagogico(studentId, indicatorId))
      .catch(console.error)
  }
  return result
}

export const obtenerProgresoGrupo = (groupId, levelId = null) => 
  impl.obtenerProgresoGrupo(groupId, levelId)

export const obtenerVersionesCurriculares = (routeId = null) =>
  impl.obtenerVersionesCurriculares(routeId)

export const publicarVersionCurricular = (versionId) => 
  impl.publicarVersionCurricular(versionId)

export const obtenerIndicadoresExcluidosDeClase = (claseId) =>
  impl.obtenerIndicadoresExcluidosDeClase(claseId)

export const eliminarIndicadoresDeClase = (claseId, indicatorIds) =>
  impl.eliminarIndicadoresDeClase(claseId, indicatorIds)

