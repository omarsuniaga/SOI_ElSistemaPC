// Contrato de Servicios de Observabilidad y Logs
import { config } from '../../../core/config/config.js'
import * as supabaseImpl from './observabilidadSupabase.js'
import * as mockImpl from './observabilidadMock.js'

const getApi = () => (config.isDemoMode ? mockImpl : supabaseImpl)

/**
 * Obtiene los logs de excepciones técnicas del cliente
 * @returns {Promise<Array<{timestamp: string, level: string, message: string, module: string, network: string}>>}
 */
export const getSystemLogs = (...args) => getApi().getSystemLogs(...args)

/**
 * Obtiene el trail de auditorías transaccionales del sistema (ausencias_auditoria)
 * @returns {Promise<Array<{id: string, accion: string, usuario_id: string, creado_a: string, detalles: object}>>}
 */
export const getAuditLogs = (...args) => getApi().getAuditLogs(...args)

/**
 * Registra una excepción técnica ocurrida en el cliente (para auditoría offline)
 * @param {object} logEntry
 */
export const recordSystemLog = (...args) => getApi().recordSystemLog(...args)

/**
 * Obtiene el registro de operaciones del sistema (sincronización, reportes, mantenimiento)
 * @returns {Promise<Array<{id: string, tipo: string, descripcion: string, estado: string, timestamp: string}>>}
 */
export const getOperaciones = (...args) => getApi().getOperaciones(...args)

/**
 * Compila el Payload DSL para el generador de reportes de IA.
 * En producción consulta las vistas de base de datos; en demo retorna datos mock.
 * @param {string} tipo - Tipo de reporte (asistencia, progreso, riesgo, etc.)
 * @returns {Promise<{radarData: Array, nodeDifficulty: Array, complianceData: Array}>}
 */
export const callDslRpc = (...args) => getApi().callDslRpc(...args)
