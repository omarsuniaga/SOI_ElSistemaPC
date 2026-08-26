// Estado financiero del alumno basado en días de mora.
// DÍA_CORTE_MES = 10: si hoy es posterior al día 10 del mes y el último periodo_mes registrado
// es el mes anterior (o más antiguo), el alumno ya está en mora.
//
// FIN-P13 (Gestión de Mora y Cobranza): este cálculo es una alerta de seguimiento,
// nunca una orden de bloqueo. El portal no puede decidir `bloqueado: true` por sí
// solo — solo puede señalar que un caso requiere revisión/aprobación de Dirección.
// Los umbrales deben venir de la fila única `finanzas_politica_cobranza` (editable
// por un flujo administrativo auditado, no desde el cliente); estos valores son
// solo el default de arranque si esa fila no pudo cargarse.
export const POLITICA_COBRANZA_DEFAULT = { dias_mora_amarilla: 30, dias_mora_critica: 60 }

export function calcularEstadoFinanciero(alumno, pagos = [], fechaEval = new Date(), politica = POLITICA_COBRANZA_DEFAULT) {
  const { dias_mora_amarilla, dias_mora_critica } = { ...POLITICA_COBRANZA_DEFAULT, ...politica }

  // Becados y convenios → siempre verde
  if (alumno.exento_mensualidad) {
    return { estado: 'verde', dias: 0, requiereAprobacionDireccion: false, etiqueta: 'Exento' }
  }

  // Filtrar solo mensualidades
  const mensualidades = pagos.filter(p => p.concepto === 'mensualidad')

  if (mensualidades.length === 0) {
    return { estado: 'rojo', dias: 999, requiereAprobacionDireccion: true, etiqueta: 'Sin pagos registrados — requiere revisión de Dirección' }
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

  if (dias < dias_mora_amarilla) {
    return { estado: 'verde', dias, requiereAprobacionDireccion: false, etiqueta: 'Al día' }
  } else if (dias < dias_mora_critica) {
    return { estado: 'amarillo', dias, requiereAprobacionDireccion: false, etiqueta: `Mora ${dias} días` }
  } else {
    return { estado: 'rojo', dias, requiereAprobacionDireccion: true, etiqueta: `Mora crítica (${dias} días) — requiere revisión de Dirección` }
  }
}

export function estadoBadgeClass(estado) {
  return {
    verde: 'badge bg-success',
    amarillo: 'badge bg-warning text-dark',
    rojo: 'badge bg-danger',
  }[estado] ?? 'badge bg-secondary'
}
