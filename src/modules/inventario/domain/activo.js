export const ESTADOS_ACTIVO = [
  'disponible', 'prestado', 'en_mantenimiento', 'en_reparacion', 'de_baja',
]

export const CATEGORIAS = [
  'Violín', 'Viola', 'Cello', 'Contrabajo',
  'Flauta', 'Clarinete', 'Saxofón',
  'Trompeta', 'Trombón', 'Corno',
  'Piano', 'Teclado', 'Guitarra', 'Bajo Eléctrico', 'Percusión', 'Otro',
]

export const TRANSICIONES_ESTADO = {
  disponible: ['prestado', 'en_mantenimiento', 'en_reparacion', 'de_baja'],
  prestado: ['disponible', 'en_mantenimiento', 'en_reparacion'],
  en_mantenimiento: ['disponible', 'en_reparacion'],
  en_reparacion: ['disponible', 'en_mantenimiento'],
  de_baja: [],
}

export function puedeTransitarA(origen, destino) {
  const transiciones = TRANSICIONES_ESTADO[origen]
  if (!transiciones) return false
  return transiciones.includes(destino)
}

export function validarActivo(payload) {
  const errores = []
  if (!payload.tipo_instrumento) errores.push('tipo_instrumento es requerido')
  if (!payload.codigo_inventario) {
    errores.push('codigo_inventario es requerido')
  } else if (!/^V8-[A-Z]{3,4}-\d{3,}$/.test(payload.codigo_inventario)) {
    errores.push('codigo_inventario debe tener formato V8-XXX-001')
  }
  if (payload.estado_uso && !ESTADOS_ACTIVO.includes(payload.estado_uso)) {
    errores.push(`estado_uso inválido: ${payload.estado_uso}`)
  }
  if (payload.estado_conservacion && !['excelente', 'bueno', 'regular', 'mantenimiento', 'de_baja'].includes(payload.estado_conservacion)) {
    errores.push(`estado_conservacion inválido: ${payload.estado_conservacion}`)
  }
  if (payload.valor_adquisicion != null && payload.valor_adquisicion < 0) {
    errores.push('valor_adquisicion no puede ser negativo')
  }
  return errores
}

export function calcularAntiguedad(activo) {
  if (!activo.fecha_adquisicion) return null
  const adq = new Date(activo.fecha_adquisicion)
  const hoy = new Date()
  const diff = hoy.getFullYear() - adq.getFullYear()
  const mes = hoy.getMonth() - adq.getMonth()
  return mes < 0 || (mes === 0 && hoy.getDate() < adq.getDate()) ? diff - 1 : diff
}

export function crearEventoCambioEstado(activoId, estadoAnterior, estadoNuevo, usuarioId) {
  return {
    activo_id: activoId,
    tipo_evento: 'cambio_estado',
    descripcion: `Cambio de estado: ${estadoAnterior} → ${estadoNuevo}`,
    estado_anterior: estadoAnterior,
    estado_nuevo: estadoNuevo,
    usuario_id: usuarioId,
    fecha: new Date().toISOString(),
  }
}

export function puedeDarseDeBaja(activo) {
  if (!activo.activo) return false
  if (activo.estado_uso === 'prestado') return false
  if (activo.estado_uso === 'en_reparacion') return false
  if (activo.estado_uso === 'de_baja') return false
  return true
}

export function motivoNoBaja(activo) {
  if (!activo.activo) return 'Instrumento inactivo o dado de baja del sistema.'
  if (activo.estado_uso === 'prestado') return 'El instrumento está en comodato activo.'
  if (activo.estado_uso === 'en_reparacion') return 'El instrumento está en reparación.'
  if (activo.estado_uso === 'de_baja') return 'El instrumento ya está dado de baja.'
  return null
}

export function calcularValorDepreciado(activo) {
  if (activo.valor_adquisicion == null) return null
  if (!activo.fecha_adquisicion) return activo.valor_adquisicion
  const antiguedad = calcularAntiguedad(activo)
  const vidaUtil = 10
  if (antiguedad >= vidaUtil) return 0
  const depreciacion = (activo.valor_adquisicion / vidaUtil) * antiguedad
  return Math.max(0, activo.valor_adquisicion - depreciacion)
}

export function badgeEstadoConservacion(estado) {
  return {
    excelente: 'badge bg-success',
    bueno: 'badge bg-primary',
    regular: 'badge bg-warning text-dark',
    mantenimiento: 'badge bg-orange text-dark',
    de_baja: 'badge bg-danger',
  }[estado] ?? 'badge bg-secondary'
}

export function badgeEstadoUso(estado) {
  return {
    disponible: 'badge bg-success',
    prestado: 'badge bg-info text-dark',
    en_mantenimiento: 'badge bg-warning text-dark',
    en_reparacion: 'badge bg-danger',
    de_baja: 'badge bg-dark',
  }[estado] ?? 'badge bg-secondary'
}
