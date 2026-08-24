import { supabase } from '../../../lib/supabaseClient.js'

export async function registrarPago(payload) {
  const { data, error } = await supabase
    .from('pagos_alumnos')
    .insert([payload])
    .select()
    .single()
  return { data, error }
}

export async function obtenerPagosAlumno(alumnoId) {
  const { data, error } = await supabase
    .from('pagos_alumnos')
    .select('*')
    .eq('alumno_id', alumnoId)
    .order('periodo_mes', { ascending: false })
  return { data, error }
}

export async function obtenerBalanceAlumnos() {
  const { data: alumnos, error: errAlumnos } = await supabase
    .from('alumnos')
    .select('id, nombre_completo, activo, exento_mensualidad')
    .eq('activo', true)
    .order('nombre_completo')

  if (errAlumnos) return { data: null, error: errAlumnos }

  const { data: pagos, error: errPagos } = await supabase
    .from('pagos_alumnos')
    .select('alumno_id, concepto, periodo_mes')
    .eq('concepto', 'mensualidad')
    .order('periodo_mes', { ascending: false })

  if (errPagos) return { data: null, error: errPagos }

  return { data: { alumnos, pagos }, error: null }
}

export async function registrarPagosLote(pagos) {
  const { data, error } = await supabase
    .from('pagos_alumnos')
    .insert(pagos)
    .select()
  return { data, error }
}

// FIN-P13: los umbrales de mora viven en esta fila única y editable por un
// flujo administrativo auditado — el portal solo la lee, nunca la calcula.
export async function obtenerPoliticaCobranza() {
  const { data, error } = await supabase
    .from('finanzas_politica_cobranza')
    .select('dia_vencimiento, dias_mora_amarilla, dias_mora_critica, bloqueo_requiere_aprobacion')
    .limit(1)
    .maybeSingle()
  return { data, error }
}

export async function obtenerCobradoHoy() {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const manana = new Date(hoy)
  manana.setDate(manana.getDate() + 1)

  const { data, error } = await supabase
    .from('pagos_alumnos')
    .select('monto')
    .gte('fecha_pago', hoy.toISOString())
    .lt('fecha_pago', manana.toISOString())

  if (error) return { data: null, error }
  const total = (data ?? []).reduce((sum, r) => sum + Number(r.monto ?? 0), 0)
  return { data: total, error: null }
}
