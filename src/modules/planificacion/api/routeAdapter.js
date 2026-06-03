import { config } from '../../../core/config/config.js'
import * as supabase from './routeSupabase.js'
import * as mock from './routeMock.js'

const impl = config.isDemoMode ? mock : supabase

export const getClasses = (maestroId) => impl.getClasses(maestroId)
export const getLevelsByClass = (classId) => impl.getLevelsByClass(classId)
export const getNodesByLevel = (levelId) => impl.getNodesByLevel(levelId)
export const getObjectivesByNode = (nodeId) => impl.getObjectivesByNode(nodeId)
export const getIndicatorsByObjective = (objectiveId) => impl.getIndicatorsByObjective(objectiveId)
export const getFullHierarchy = (classId) => impl.getFullHierarchy(classId)
export const updateIndicatorCalificacion = (indicatorId, calificacion) =>
  impl.updateIndicatorCalificacion(indicatorId, calificacion)
