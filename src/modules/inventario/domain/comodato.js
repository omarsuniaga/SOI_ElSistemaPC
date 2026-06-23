export const TIPOS_COMODATO = ['escolar', 'anual', 'eventual']

const ESTADOS_NO_ASIGNABLE = ['mantenimiento', 'de_baja']

export function puedeAsignarse(activo) {
  if (!activo.activo) return false
  if (ESTADOS_NO_ASIGNABLE.includes(activo.estado_conservacion)) return false
  if (activo.estado_uso !== 'disponible') return false
  return true
}

export function motivoNoAsignable(activo) {
  if (!activo.activo) return 'Instrumento dado de baja del sistema.'
  if (activo.estado_conservacion === 'mantenimiento') return 'En mantenimiento.'
  if (activo.estado_conservacion === 'de_baja') return 'Dado de baja por estado físico.'
  if (activo.estado_uso === 'prestado') return 'Ya está en comodato activo.'
  if (activo.estado_uso === 'en_mantenimiento') return 'En mantenimiento operativo.'
  return null
}

export function estadoUsoBadgeClass(estado) {
  return {
    disponible: 'badge bg-success',
    prestado: 'badge bg-info text-dark',
    en_mantenimiento: 'badge bg-warning text-dark',
    en_reparacion: 'badge bg-danger',
    de_baja: 'badge bg-dark',
  }[estado] ?? 'badge bg-secondary'
}

export function estadoConservacionBadgeClass(estado) {
  return {
    excelente: 'badge bg-success',
    bueno: 'badge bg-primary',
    regular: 'badge bg-warning text-dark',
    mantenimiento: 'badge bg-orange text-dark',
    de_baja: 'badge bg-danger',
  }[estado] ?? 'badge bg-secondary'
}

export function puedeIntercambiarse(comodato, activoDestino) {
  if (comodato.estado !== 'activo') return false
  if (!activoDestino.activo) return false
  if (activoDestino.estado_uso === 'en_reparacion') return false
  if (activoDestino.estado_uso === 'de_baja') return false
  return true
}

export function intercambiar(comodatoOrigen, comodatoDestino, activoOrigen, activoDestino) {
  if (!puedeIntercambiarse(comodatoOrigen, activoDestino)) {
    throw new Error('No se puede intercambiar: el comodato origen no puede intercambiarse con el activo destino')
  }
  if (!puedeIntercambiarse(comodatoDestino, activoOrigen)) {
    throw new Error('No se puede intercambiar: el comodato destino no puede intercambiarse con el activo origen')
  }
  return {
    comodatoOrigenActualizado: {
      ...comodatoOrigen,
      activo_id: activoDestino.id,
      intercambiado_con_id: comodatoDestino.id,
    },
    comodatoDestinoActualizado: {
      ...comodatoDestino,
      activo_id: activoOrigen.id,
      intercambiado_con_id: comodatoOrigen.id,
    },
  }
}

export function diasHastaVencimiento(comodato) {
  if (!comodato.fecha_vencimiento) return null
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const parts = comodato.fecha_vencimiento.split('-')
  const venc = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  venc.setHours(0, 0, 0, 0)
  const diff = Math.round((venc - hoy) / (1000 * 60 * 60 * 24))
  return diff
}

export function estaVencido(comodato) {
  const dias = diasHastaVencimiento(comodato)
  if (dias === null) return false
  return dias < 0
}

export function puedeRenovarse(comodato) {
  if (comodato.estado !== 'activo') return false
  const dias = diasHastaVencimiento(comodato)
  if (dias === null) return false
  return dias <= 30
}

export function renovar(comodatoViejo) {
  if (!puedeRenovarse(comodatoViejo)) {
    throw new Error('El comodato no puede renovarse')
  }
  return {
    activo_id: comodatoViejo.activo_id,
    alumno_id: comodatoViejo.alumno_id,
    tipo_comodato: comodatoViejo.tipo_comodato || 'escolar',
    fecha_entrega: new Date().toISOString().split('T')[0],
    renovado_de_id: comodatoViejo.id,
    estado: 'activo',
  }
}

export function PALETA_VENCIMIENTO(dias) {
  if (dias === null || dias === undefined) return 'badge bg-secondary'
  if (dias > 30) return 'badge bg-success'
  if (dias >= 7) return 'badge bg-warning text-dark'
  return 'badge bg-danger'
}

export function calcularDiasVencimiento(comodato) {
  return diasHastaVencimiento(comodato)
}

export function crearComodatoRenovado(comodatoViejo) {
  return renovar(comodatoViejo)
}

export function estadoVencimiento(comodato) {
  const dias = diasHastaVencimiento(comodato)
  if (dias === null) return { label: 'Sin vencimiento', clase: 'badge bg-secondary' }
  if (dias < 0) return { label: `Vencido hace ${Math.abs(dias)} días`, clase: 'badge bg-danger' }
  if (dias === 0) return { label: 'Vence hoy', clase: 'badge bg-danger' }
  if (dias <= 7) return { label: `Vence en ${dias} días`, clase: 'badge bg-warning text-dark' }
  if (dias <= 30) return { label: `Vence en ${dias} días`, clase: 'badge bg-info text-dark' }
  return { label: `Vence en ${dias} días`, clase: 'badge bg-success' }
}
