export const TIPOS_REPORTE = ['general', 'historial', 'reparaciones', 'comodatos', 'resumen']

export function armarReporte(tipo, data) {
  const base = {
    tipo,
    fecha_generacion: new Date().toISOString(),
    filtros_aplicados: {},
  }

  switch (tipo) {
    case 'general':
      return { ...base, datos: resumirInventario(data) }
    case 'resumen':
      return {
        ...base,
        datos: {
          resumen: resumirInventario(data),
          por_tipo: activosPorTipo(data.activos || []),
        },
      }
    case 'reparaciones':
      return {
        ...base,
        datos: {
          total: (data.reparaciones || []).length,
          por_estado: reparacionesPorEstado(data.reparaciones || []),
        },
      }
    case 'comodatos':
      return {
        ...base,
        datos: {
          total: (data.comodatos || []).length,
          activos: (data.comodatos || []).filter(c => c.estado === 'activo').length,
        },
      }
    default:
      return { ...base, datos: data }
  }
}

export function filtrarReporte(activos, filtros) {
  return activos.filter(a => {
    for (const [key, val] of Object.entries(filtros)) {
      if (val === '' || val == null) continue
      if (String(a[key]) !== String(val)) return false
    }
    return true
  })
}

export function exportarCSV(data, headers) {
  const escape = val => {
    const s = String(val ?? '')
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }
  const lines = [headers.map(h => escape(h)).join(',')]
  data.forEach(row => {
    lines.push(headers.map(h => escape(row[h])).join(','))
  })
  return lines.join('\n')
}

export function resumirInventario({ activos, comodatos, reparaciones }) {
  activos = activos || []
  comodatos = comodatos || []
  reparaciones = reparaciones || []
  return {
    total: activos.length,
    disponibles: activos.filter(a => a.estado_uso === 'disponible' && a.activo !== false).length,
    en_uso: activos.filter(a => a.estado_uso === 'prestado').length,
    ociosos: comodatos.filter(c => c.estado === 'activo').length,
    en_reparacion: activos.filter(a => a.estado_uso === 'en_reparacion').length,
    de_baja: activos.filter(a => a.estado_uso === 'de_baja' || a.activo === false).length,
    valor_total: activos.reduce((sum, a) => sum + (Number(a.valor_adquisicion) || 0), 0),
  }
}

export function activosPorTipo(activos) {
  const grupos = {}
  activos.forEach(a => {
    const tipo = a.tipo_instrumento || 'Sin tipo'
    grupos[tipo] = (grupos[tipo] || 0) + 1
  })
  return grupos
}

export function topInstrumentosMasPrestados(comodatos, activos, limit) {
  if (limit === undefined) limit = 10
  const conteo = {}
  comodatos.forEach(c => {
    conteo[c.activo_id] = (conteo[c.activo_id] || 0) + 1
  })
  const activoMap = {}
  activos.forEach(a => { activoMap[a.id] = a })
  return Object.entries(conteo)
    .map(([id, veces]) => ({
      activo_id: id,
      veces,
      ...activoMap[id] ? {
        codigo_inventario: activoMap[id].codigo_inventario,
        tipo_instrumento: activoMap[id].tipo_instrumento,
      } : {},
    }))
    .sort((a, b) => b.veces - a.veces)
    .slice(0, limit)
}

export function alumnosConMasComodatos(comodatos, limit) {
  if (limit === undefined) limit = 10
  const conteo = {}
  comodatos.forEach(c => {
    conteo[c.alumno_id] = (conteo[c.alumno_id] || 0) + 1
  })
  return Object.entries(conteo)
    .map(([alumno_id, total]) => ({ alumno_id, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
}

export function reparacionesPorEstado(reparaciones) {
  const grupos = {}
  reparaciones.forEach(r => {
    const estado = r.estado || 'Sin estado'
    grupos[estado] = (grupos[estado] || 0) + 1
  })
  return grupos
}
