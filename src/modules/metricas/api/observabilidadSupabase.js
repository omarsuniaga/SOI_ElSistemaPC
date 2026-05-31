import { supabase } from '../../../lib/supabaseClient.js'

// Llave para guardar logs locales persistentes en IndexedDB/localStorage de la PWA
const LOCAL_LOGS_KEY = 'soi_system_logs'

/**
 * Obtiene los logs de excepciones técnicas del cliente persistidos localmente
 * @returns {Promise<Array<{timestamp: string, level: string, message: string, module: string, network: string}>>}
 */
export async function getSystemLogs() {
  try {
    const raw = localStorage.getItem(LOCAL_LOGS_KEY)
    const logs = raw ? JSON.parse(raw) : []

    // Si está vacío, cargar al menos un log inicial de carga exitosa
    if (logs.length === 0) {
      const initialLog = {
        timestamp: new Date().toISOString(),
        level: 'INFO',
        module: 'PWA',
        message: 'System logs initialized. Tracking core activities.',
        network: navigator.onLine ? 'Online' : 'Offline',
      }
      logs.push(initialLog)
      localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(logs))
    }
    return logs
  } catch (err) {
    console.error('Error al leer los logs del sistema local:', err)
    return []
  }
}

/**
 * Registra una excepción técnica ocurrida en el cliente (apto para modo offline)
 * @param {object} logEntry
 */
export async function recordSystemLog(logEntry) {
  try {
    const logs = await getSystemLogs()
    const newLog = {
      timestamp: new Date().toISOString(),
      level: logEntry.level || 'INFO',
      module: logEntry.module || 'Client',
      message: logEntry.message || 'Sin mensaje de error especificado',
      network: navigator.onLine ? 'Online' : 'Offline',
      stack: logEntry.stack || '',
    }
    logs.unshift(newLog)

    // Limitar almacenamiento para evitar saturar el localStorage (máx 100 logs)
    if (logs.length > 100) {
      logs.pop()
    }
    localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(logs))
    return newLog
  } catch (err) {
    console.error('Error al registrar log de sistema:', err)
  }
}

/**
 * Obtiene el trail de auditorías transaccionales de la tabla ausencias_auditoria
 * Controla errores de RLS y red de forma impecable.
 * @returns {Promise<Array>}
 */
export async function getAuditLogs() {
  try {
    const { data, error } = await supabase
      .from('ausencias_auditoria')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      // Registrar la falla de RLS o Base de Datos en la consola de logs local
      await recordSystemLog({
        level: 'ERROR',
        module: 'SupabaseClient',
        message: `Falla al consultar ausencias_auditoria (RLS o Permisos): ${error.message}`,
      })
      throw error
    }

    return (data || []).map((item) => ({
      id: item.id,
      ausencia_id: item.ausencia_id,
      actor_id: item.actor_id,
      usuario_id: item.actor_id, // Identificador seguro del actor
      creado_a: item.created_at,
      created_at: item.created_at,
      accion: item.accion,
      notas: item.notas,
      detalles: item.notas ? { notas: item.notas } : {},
    }))
  } catch (error) {
    console.warn('Excepción de RLS controlada con éxito en getAuditLogs:', error.message || error)

    // En caso de error de red o RLS, registrar evento en los logs locales
    await recordSystemLog({
      level: 'WARNING',
      module: 'ObservabilidadAPI',
      message: `Audit logs no disponibles (RLS o Red caída). Retornando lista vacía resiliente.`,
    })

    return []
  }
}

/**
 * Obtiene el registro de operaciones del sistema (sincronización, reportes, mantenimiento)
 * En producción consulta una vista o tabla de operaciones; mock devuelve datos simulados.
 * @returns {Promise<Array<{id: string, tipo: string, descripcion: string, estado: string, timestamp: string}>>}
 */
export async function getOperaciones() {
  try {
    const { data, error } = await supabase
      .from('operaciones_sistema')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      await recordSystemLog({
        level: 'WARNING',
        module: 'ObservabilidadAPI',
        message: `Error al consultar operaciones_sistema: ${error.message}`,
      })
      return []
    }

    return (data || []).map((op) => ({
      id: op.id,
      tipo: op.tipo,
      descripcion: op.descripcion,
      estado: op.estado,
      timestamp: op.created_at || op.timestamp,
      detalles: op.detalles || {},
    }))
  } catch (error) {
    console.warn('Error al obtener operaciones del sistema:', error.message || error)
    await recordSystemLog({
      level: 'WARNING',
      module: 'ObservabilidadAPI',
      message: 'Operaciones del sistema no disponibles. Retornando lista vacía.',
    })
    return []
  }
}
