// Estado financiero del alumno basado en días de mora.
// DÍA_CORTE_MES = 10: si hoy es posterior al día 10 del mes y el último periodo_mes registrado
// es el mes anterior (o más antiguo), el alumno ya está en mora.

export function calcularEstadoFinanciero(alumno, pagos = [], fechaEval = new Date()) {
  // Becados y convenios → siempre verde
  if (alumno.exento_mensualidad) {
    return { estado: 'verde', dias: 0, bloqueado: false, etiqueta: 'Exento' }
  }

  // Filtrar solo mensualidades
  const mensualidades = pagos.filter(p => p.concepto === 'mensualidad')

  if (mensualidades.length === 0) {
    return { estado: 'rojo', dias: 999, bloqueado: true, etiqueta: 'Sin pagos registrados' }
  }

  // periodo_mes can be a string 'YYYY-MM-DD' or a Date object
  const periodos = mensualidades.map(p => new Date(p.periodo_mes))
  const ultimoPeriodo = new Date(Math.max(...periodos.map(d => d.getTime())))

  const eval_ = new Date(fechaEval)
  eval_.setHours(0, 0, 0, 0)
  ultimoPeriodo.setHours(0, 0, 0, 0)

  // Days since the last covered month started
  const diasMs = eval_.getTime() - ultimoPeriodo.getTime()
  const dias = Math.floor(diasMs / (1000 * 60 * 60 * 24))

  if (dias < 30) {
    return { estado: 'verde', dias, bloqueado: false, etiqueta: 'Al día' }
  } else if (dias < 60) {
    return { estado: 'amarillo', dias, bloqueado: false, etiqueta: `Mora ${dias} días` }
  } else {
    return { estado: 'rojo', dias, bloqueado: true, etiqueta: `Bloqueado (${dias} días)` }
  }
}

export function estadoBadgeClass(estado) {
  return {
    verde: 'badge bg-success',
    amarillo: 'badge bg-warning text-dark',
    rojo: 'badge bg-danger',
  }[estado] ?? 'badge bg-secondary'
}
