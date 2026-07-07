import { config } from '../../../core/config/config.js'
import * as supabaseService from './analyticsFillingBehaviorService.js'
import * as mockService from './analyticsFillingBehaviorMock.js'

const impl = config.isDemoMode ? mockService : supabaseService

export const getTeacherFillingMetrics = (startDate, endDate) =>
  impl.getTeacherFillingMetrics(startDate, endDate)

export const getFillingMetricsByMaestro = (maestroId) =>
  impl.getFillingMetricsByMaestro(maestroId)

export const getTeacherFillingMetricsPerSession = (startDate, endDate) =>
  impl.getTeacherFillingMetricsPerSession(startDate, endDate)
