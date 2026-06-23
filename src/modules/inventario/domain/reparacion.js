export const ESTADOS_REPARACION = ['recibido', 'en_reparacion', 'finalizado', 'entregado']

export const TRANSICIONES_REPARACION = {
  recibido: ['en_reparacion'],
  en_reparacion: ['finalizado'],
  finalizado: ['entregado'],
  entregado: [],
}

const TIPOS_TALLERISTA = ['externo', 'luthier_interno']

export function puedeTransitarReparacion(origen, destino) {
  const transiciones = TRANSICIONES_REPARACION[origen]
  if (!transiciones) return false
  return transiciones.includes(destino)
}

export function validarReparacion(payload) {
  const errores = []
  if (!payload.activo_id) errores.push('activo_id es requerido')
  if (!payload.descripcion) errores.push('descripcion es requerida')
  if (!payload.tipo_tallerista) {
    errores.push('tipo_tallerista es requerido')
  } else if (!TIPOS_TALLERISTA.includes(payload.tipo_tallerista)) {
    errores.push(`tipo_tallerista inválido: ${payload.tipo_tallerista}. Válidos: ${TIPOS_TALLERISTA.join(', ')}`)
  }
  if (!payload.tallerista_nombre && payload.tipo_tallerista) {
    errores.push('tallerista_nombre es requerido')
  }
  if (payload.costo_estimado != null && payload.costo_estimado < 0) {
    errores.push('costo_estimado no puede ser negativo')
  }
  return errores
}

export function calcularCostoReal(reparacion) {
  if (reparacion.costo_real != null) return reparacion.costo_real
  if (reparacion.costo_estimado != null) return reparacion.costo_estimado
  return 0
}

export function diasEnReparacion(reparacion) {
  if (!reparacion.fecha_ingreso) return 0
  if (!reparacion.fecha_egreso) return 0
  const ingreso = new Date(reparacion.fecha_ingreso)
  const egreso = new Date(reparacion.fecha_egreso)
  return Math.max(0, Math.floor((egreso - ingreso) / (1000 * 60 * 60 * 24)))
}

export function puedeIngresarAReparacion(reparacion, activo) {
  if (activo.estado_uso === 'en_reparacion') return false
  if (activo.estado_uso === 'de_baja') return false
  return true
}
