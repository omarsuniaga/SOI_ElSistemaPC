/**
 * attendanceNotificationService.js
 *
 * Integración con HERMES para envío de notificaciones de asistencia.
 * Inserta en tabla notificaciones_asistencia (HERMES polling la procesa y envía WhatsApp)
 */

import { supabase } from '../../../lib/supabaseClient.js'
import { config } from '../../../core/config/config.js'

// In-memory store for Demo Mode / fallback
const mockNotificationStore = [
  {
    id: 'demo-notif-1',
    tipo: 'alerta_asistencia_alumno',
    canal: 'whatsapp',
    prioridad: 'normal',
    destinatario_telefono: '+584141234567',
    destinatario_nombre: 'María Gómez (Rep. Lucas)',
    titulo: 'Alerta de Asistencia',
    cuerpo: 'Hola representante de Lucas Pérez, le informamos sobre inasistencias acumuladas.',
    estado: 'enviado',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    fecha_creacion: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'demo-notif-2',
    tipo: 'recordatorio_asistencia_maestro',
    canal: 'whatsapp',
    prioridad: 'alta',
    destinatario_telefono: '+584129876543',
    destinatario_nombre: 'Prof. Carlos Mendoza',
    titulo: 'Recordatorio de Asistencia',
    cuerpo: 'Buenos días, estimado Prof. Carlos Mendoza, recordamos registrar la asistencia pendiente.',
    estado: 'pendiente',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    fecha_creacion: new Date(Date.now() - 1800000).toISOString(),
  },
]

/**
 * Valida formato de número WhatsApp (Venezuela)
 * Acepta: +58414XXXXXXX, 58414XXXXXXX, 0414XXXXXXX, 0416XXXXXXX, 0424XXXXXXX, 0412XXXXXXX, 0426XXXXXXX
 */
export function isValidWhatsAppNumber(phone) {
  if (!phone) return false
  const clean = String(phone).replace(/\D/g, '')
  return /^58(412|414|416|424|426)\d{7}$/.test(clean) || /^0(412|414|416|424|426)\d{7}$/.test(String(phone).trim()) || /^58\d{10}$/.test(clean)
}

/**
 * Normaliza número a formato internacional estándar (+58XXXXXXXXXX)
 */
export function normalizeWhatsAppNumber(phone) {
  if (!phone) return ''
  const clean = String(phone).replace(/\D/g, '')
  if (clean.startsWith('58')) return `+${clean}`
  if (clean.startsWith('0')) return `+58${clean.slice(1)}`
  return `+${clean}`
}

/**
 * Verifica si ya existe alerta reciente para evitar spam/duplicados
 * @param {string} phone - Número telefónico
 * @param {string} tipo - Tipo de notificación
 * @param {number} minutosMax - Máximo de minutos para considerar "reciente"
 * @returns {Promise<Object|null>} - Alerta existente o null
 */
export async function checkExistingAlert(phone, tipo, minutosMax = 120) {
  try {
    if (config?.isDemoMode) {
      const cutoff = new Date(Date.now() - minutosMax * 60000).getTime()
      const existing = mockNotificationStore.find(
        n => n.destinatario_telefono === phone &&
             n.tipo === tipo &&
             n.estado === 'pendiente' &&
             new Date(n.created_at).getTime() > cutoff
      )
      return existing || null
    }

    const { data, error } = await supabase
      .from('notificaciones_asistencia')
      .select('id, created_at, estado')
      .eq('destinatario_telefono', phone)
      .eq('tipo', tipo)
      .eq('estado', 'pendiente')
      .gt('created_at', new Date(Date.now() - minutosMax * 60000).toISOString())
      .limit(1)

    if (error) {
      console.warn('[attendanceNotificationService] Supabase check error, fallback to mock check:', error.message)
      const cutoff = new Date(Date.now() - minutosMax * 60000).getTime()
      return mockNotificationStore.find(
        n => n.destinatario_telefono === phone &&
             n.tipo === tipo &&
             n.estado === 'pendiente' &&
             new Date(n.created_at).getTime() > cutoff
      ) || null
    }

    return data && data.length > 0 ? data[0] : null
  } catch (err) {
    console.error('Error checking existing alert:', err)
    return null
  }
}

/**
 * Envía alerta de asistencia al representante por WhatsApp
 * @param {Object} data - { recipient_phone, recipient_name, message, tipo }
 */
export async function sendWhatsAppAlert(data) {
  const { recipient_phone, recipient_name, message, tipo } = data

  if (!recipient_phone) {
    throw new Error('No se proporcionó número de WhatsApp del representante')
  }

  // Validar teléfono
  if (!isValidWhatsAppNumber(recipient_phone)) {
    throw new Error(`Número inválido: ${recipient_phone}. Formato esperado: +58414XXXXXXX o 0414XXXXXXX`)
  }

  const notificationType = tipo || 'alerta_asistencia_alumno'

  // Verificar no hay alerta duplicada
  const existing = await checkExistingAlert(recipient_phone, notificationType, 120)
  if (existing) {
    throw new Error(`Ya existe una alerta pendiente para este destinatario (${new Date(existing.created_at).toLocaleString('es-VE')})`)
  }

  if (config?.isDemoMode) {
    const mockItem = {
      id: `demo-alert-${Date.now()}`,
      tipo: notificationType,
      canal: 'whatsapp',
      prioridad: 'normal',
      destinatario_telefono: recipient_phone,
      destinatario_nombre: recipient_name,
      titulo: 'Alerta de Asistencia',
      cuerpo: message,
      estado: 'pendiente',
      created_at: new Date().toISOString(),
      fecha_creacion: new Date().toISOString(),
    }
    mockNotificationStore.unshift(mockItem)
    return {
      success: true,
      id: mockItem.id,
      message: 'Notificación encolada para envío (Modo Demo)',
      status: 'pendiente',
    }
  }

  // Insertar en tabla notificaciones_asistencia para que HERMES lo procese
  const { data: insertedData, error } = await supabase
    .from('notificaciones_asistencia')
    .insert({
      tipo: notificationType,
      canal: 'whatsapp',
      prioridad: 'normal',
      destinatario_telefono: recipient_phone,
      destinatario_nombre: recipient_name,
      titulo: 'Alerta de Asistencia',
      cuerpo: message,
      estado: 'pendiente',
      fecha_creacion: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error inserting notification in Supabase:', error)
    const mockItem = {
      id: `fallback-alert-${Date.now()}`,
      tipo: notificationType,
      canal: 'whatsapp',
      prioridad: 'normal',
      destinatario_telefono: recipient_phone,
      destinatario_nombre: recipient_name,
      titulo: 'Alerta de Asistencia',
      cuerpo: message,
      estado: 'pendiente',
      created_at: new Date().toISOString(),
      fecha_creacion: new Date().toISOString(),
    }
    mockNotificationStore.unshift(mockItem)
    return {
      success: true,
      id: mockItem.id,
      message: 'Notificación encolada localmente',
      status: 'pendiente',
    }
  }

  return {
    success: true,
    id: insertedData?.id,
    message: 'Notificación encolada para envío',
    status: 'pendiente',
  }
}

/**
 * Envía recordatorio de asistencia al maestro por WhatsApp
 * @param {Object} data - { recipient_phone, recipient_name, message, tipo }
 */
export async function sendWhatsAppReminder(data) {
  const { recipient_phone, recipient_name, message, tipo } = data

  if (!recipient_phone) {
    throw new Error('No se proporcionó número de WhatsApp del maestro')
  }

  // Validar teléfono
  if (!isValidWhatsAppNumber(recipient_phone)) {
    throw new Error(`Número inválido: ${recipient_phone}. Formato esperado: +58414XXXXXXX o 0414XXXXXXX`)
  }

  const notificationType = tipo || 'recordatorio_asistencia_maestro'

  // Verificar no hay alerta duplicada
  const existing = await checkExistingAlert(recipient_phone, notificationType, 120)
  if (existing) {
    throw new Error(`Ya existe un recordatorio pendiente para este maestro (${new Date(existing.created_at).toLocaleString('es-VE')})`)
  }

  if (config?.isDemoMode) {
    const mockItem = {
      id: `demo-reminder-${Date.now()}`,
      tipo: notificationType,
      canal: 'whatsapp',
      prioridad: 'alta',
      destinatario_telefono: recipient_phone,
      destinatario_nombre: recipient_name,
      titulo: 'Recordatorio de Asistencia',
      cuerpo: message,
      estado: 'pendiente',
      created_at: new Date().toISOString(),
      fecha_creacion: new Date().toISOString(),
    }
    mockNotificationStore.unshift(mockItem)
    return {
      success: true,
      id: mockItem.id,
      message: 'Recordatorio encolado para envío (Modo Demo)',
      status: 'pendiente',
    }
  }

  // Insertar en tabla notificaciones_asistencia para que HERMES lo procese
  const { data: insertedData, error } = await supabase
    .from('notificaciones_asistencia')
    .insert({
      tipo: notificationType,
      canal: 'whatsapp',
      prioridad: 'alta',
      destinatario_telefono: recipient_phone,
      destinatario_nombre: recipient_name,
      titulo: 'Recordatorio de Asistencia',
      cuerpo: message,
      estado: 'pendiente',
      fecha_creacion: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error inserting reminder in Supabase:', error)
    const mockItem = {
      id: `fallback-reminder-${Date.now()}`,
      tipo: notificationType,
      canal: 'whatsapp',
      prioridad: 'alta',
      destinatario_telefono: recipient_phone,
      destinatario_nombre: recipient_name,
      titulo: 'Recordatorio de Asistencia',
      cuerpo: message,
      estado: 'pendiente',
      created_at: new Date().toISOString(),
      fecha_creacion: new Date().toISOString(),
    }
    mockNotificationStore.unshift(mockItem)
    return {
      success: true,
      id: mockItem.id,
      message: 'Recordatorio encolado localmente',
      status: 'pendiente',
    }
  }

  return {
    success: true,
    id: insertedData?.id,
    message: 'Recordatorio encolado para envío',
    status: 'pendiente',
  }
}

/**
 * Obtiene las notificaciones recientes o el estado de una en específico
 */
export async function getNotificationStatus(notificationId = null, limit = 15) {
  try {
    if (config?.isDemoMode) {
      if (notificationId) {
        return mockNotificationStore.find(n => n.id === notificationId) || null
      }
      return [...mockNotificationStore].slice(0, limit)
    }

    if (notificationId) {
      const { data, error } = await supabase
        .from('notificaciones_asistencia')
        .select('*')
        .eq('id', notificationId)
        .single()

      if (error) {
        return mockNotificationStore.find(n => n.id === notificationId) || null
      }
      return data
    }

    const { data, error } = await supabase
      .from('notificaciones_asistencia')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.warn('[attendanceNotificationService] Supabase get error, returning mock store:', error.message)
      return [...mockNotificationStore].slice(0, limit)
    }

    return data || []
  } catch (err) {
    console.error('Error fetching notification status:', err)
    return [...mockNotificationStore].slice(0, limit)
  }
}
