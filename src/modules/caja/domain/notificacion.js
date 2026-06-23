/**
 * Domain: notificacion
 * Notification building and escalation — no Supabase imports.
 */

export const NOTIF_TIPOS = {
  MORA_RECORDATORIO: 'mora_recordatorio',
  MORA_COMPROMISO: 'mora_compromiso',
  MORA_ESCALADA: 'mora_escalada',
  ACCESORIO_ASIGNADO: 'accesorio_asignado',
  ACCESORIO_APROBACION: 'accesorio_aprobacion',
  STOCK_BAJO: 'stock_bajo',
  COMODATO_RIESGO: 'comodato_riesgo',
  CAMPANA_PAGO: 'campana_pago',
  MENSAJE_INTERNO: 'mensaje_interno',
  TAREA_ASIGNADA: 'tarea_asignada',
  MINUTA_NUEVA: 'minuta_nueva',
}

export function buildNotificacion({
  familia_id,
  representante_id,
  alumno_id,
  tipo,
  canal,
  prioridad,
  titulo,
  cuerpo,
  datos_extra,
  fecha_programada,
}) {
  return {
    familia_id,
    representante_id,
    alumno_id,
    tipo,
    canal,
    prioridad,
    titulo,
    cuerpo,
    datos_extra: datos_extra || {},
    fecha_programada: fecha_programada || null,
    estado_whatsapp: 'pendiente',
    estado_portal: 'no_leida',
  }
}

const ESCALACION_MAP = {
  7:  { tipo: 'mora_recordatorio', canal: 'ambos',  prioridad: 'baja'   },
  15: { tipo: 'mora_compromiso',   canal: 'ambos',  prioridad: 'media'  },
  30: { tipo: 'mora_escalada',     canal: 'ambos',  prioridad: 'alta'   },
  45: { tipo: 'mora_escalada',     canal: 'portal', prioridad: 'critica' },
  60: { tipo: 'mora_escalada',     canal: 'portal', prioridad: 'critica' },
}

export function buildEscalacionMora(cuota, diasMora, familia) {
  const config = ESCALACION_MAP[diasMora]
  if (!config) return null

  return buildNotificacion({
    familia_id: cuota.familia_id,
    representante_id: familia.representante_id || null,
    alumno_id: cuota.alumno_id || null,
    tipo: config.tipo,
    canal: config.canal,
    prioridad: config.prioridad,
    titulo: `Mora en cuota — día ${diasMora}`,
    cuerpo: `La cuota ${cuota.id} lleva ${diasMora} días de mora.`,
    datos_extra: { cuota_id: cuota.id, dias_mora: diasMora },
    fecha_programada: null,
  })
}

export function shouldSendPush(notificacion) {
  const highPriority = ['alta', 'critica'].includes(notificacion.prioridad)
  const pushCanal = ['portal', 'ambos'].includes(notificacion.canal)
  return highPriority && pushCanal
}
