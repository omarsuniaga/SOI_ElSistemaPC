export const TIPOS_ACCESORIO = [
  'funda', 'arco', 'cuerdas', 'boquilla', 'atril', 'parlante', 'cable', 'otro',
]

export const COMPATIBILIDAD_CATEGORIA = {
  'Cuerdas Frotadas': ['funda', 'arco', 'cuerdas', 'otro'],
  'Cuerdas Pulsadas': ['funda', 'cuerdas', 'cable', 'parlante', 'otro'],
  'Viento Madera': ['funda', 'boquilla', 'otro'],
  'Viento Metal': ['funda', 'boquilla', 'otro'],
  Percusión: ['funda', 'otro'],
  Teclados: ['funda', 'cable', 'parlante', 'otro'],
}

const CATEGORIA_POR_INSTRUMENTO = {
  Violín: 'Cuerdas Frotadas',
  Viola: 'Cuerdas Frotadas',
  Cello: 'Cuerdas Frotadas',
  Contrabajo: 'Cuerdas Frotadas',
  Guitarra: 'Cuerdas Pulsadas',
  'Bajo Eléctrico': 'Cuerdas Pulsadas',
  Flauta: 'Viento Madera',
  Clarinete: 'Viento Madera',
  Saxofón: 'Viento Madera',
  Trompeta: 'Viento Metal',
  Trombón: 'Viento Metal',
  Corno: 'Viento Metal',
  Piano: 'Teclados',
  Teclado: 'Teclados',
  Percusión: 'Percusión',
}

function categoriaParaInstrumento(instrumento) {
  return CATEGORIA_POR_INSTRUMENTO[instrumento] || null
}

export function accesorioCompatibleCon(tipoAccesorio, tipoInstrumento) {
  if (tipoAccesorio === 'otro') return true
  if (tipoAccesorio === 'cuerdas') return true
  if (tipoAccesorio === 'atril') return true
  const categoria = categoriaParaInstrumento(tipoInstrumento)
  if (!categoria) return false
  const compatibles = COMPATIBILIDAD_CATEGORIA[categoria]
  if (!compatibles) return false
  return compatibles.includes(tipoAccesorio)
}

export function validarAccesorio(payload) {
  const errores = []
  if (!payload.tipo) errores.push('tipo es requerido')
  else if (!TIPOS_ACCESORIO.includes(payload.tipo)) {
    errores.push(`tipo inválido: ${payload.tipo}. Válidos: ${TIPOS_ACCESORIO.join(', ')}`)
  }
  if (!payload.activo_id) errores.push('activo_id es requerido')
  if (!payload.cantidad || payload.cantidad <= 0) {
    errores.push('cantidad debe ser mayor a 0')
  }
  return errores
}

export function accesorioAsignable(accesorio) {
  if (!accesorio.activo_id) return false
  return accesorio.estado === 'asignado' || accesorio.estado === 'disponible'
}

export function aumentarStock(accesorio, cantidad) {
  return { ...accesorio, cantidad: accesorio.cantidad + cantidad }
}

export function disminuirStock(accesorio, cantidad) {
  const nueva = accesorio.cantidad - cantidad
  if (nueva < 0) throw new Error('No hay suficiente stock disponible')
  return { ...accesorio, cantidad: nueva }
}

export function estadoAccesorioLabel(estado) {
  const labels = {
    disponible: 'Disponible',
    asignado: 'Asignado',
    agotado: 'Agotado',
  }
  return labels[estado] ?? estado
}
