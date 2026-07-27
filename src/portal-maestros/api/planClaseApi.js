import { supabase } from '../../lib/supabaseClient.js'

/**
 * Plan de clase del maestro.
 *
 * El plan NO depende del currículo. Un maestro puede planificar su clase aunque
 * su instrumento todavía no tenga ruta cargada — hoy viola y orquesta están en
 * esa situación, cuatro de las once clases activas. Cuando la clase sí tiene
 * `route_version_id`, el currículo se ofrece como apoyo para llenar el plan,
 * nunca como requisito para poder escribirlo.
 *
 * Los campos de listas (contenidos, obras, técnicas, escalas) se guardan como
 * arreglos JSON: la tabla los declara jsonb.
 */

/** Convierte el textarea de "una por línea" en el arreglo que espera la tabla. */
export function lineasAArreglo(texto) {
  if (!texto) return []
  return String(texto)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}

/** Y de vuelta, para poblar el formulario. */
export function arregloALineas(valor) {
  if (!valor) return ''
  if (Array.isArray(valor)) return valor.join('\n')
  if (typeof valor === 'string') return valor
  return ''
}

/**
 * Plan vigente de una clase.
 * Devuelve null si todavía no hay: es un estado normal, no un error.
 */
export async function obtenerPlanDeClase(claseId, periodoNombre = null) {
  if (!claseId) return null

  let q = supabase
    .from('planificaciones')
    .select('*')
    .eq('clase_id', claseId)
    .eq('activo', true)
    .order('created_at', { ascending: false })
    .limit(1)

  if (periodoNombre) q = q.eq('periodo_nombre', periodoNombre)

  const { data, error } = await q
  if (error) throw new Error(`No se pudo cargar el plan: ${error.message}`)
  return data?.[0] ?? null
}

/** El maestro autenticado, para firmar el plan. */
async function _maestroActual() {
  const { data: sesion } = await supabase.auth.getUser()
  const userId = sesion?.user?.id
  if (!userId) throw new Error('Sesión no iniciada')

  const { data, error } = await supabase
    .from('maestros')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error(`No se pudo identificar al maestro: ${error.message}`)
  if (!data?.id) throw new Error('Su usuario no está vinculado a un maestro')
  return data.id
}

/**
 * Crea o actualiza el plan de la clase.
 * El RLS exige que `maestro_id` sea el del maestro autenticado y que la clase
 * sea suya, así que la identidad se resuelve acá y no se acepta del formulario.
 */
export async function guardarPlanDeClase(plan) {
  const titulo = (plan.titulo || '').trim()
  if (!plan.clase_id) throw new Error('Falta la clase')
  if (!titulo) throw new Error('El título del plan es obligatorio')

  const payload = {
    clase_id: plan.clase_id,
    titulo,
    descripcion: (plan.descripcion || '').trim() || null,
    periodo_nombre: plan.periodo_nombre || null,
    fecha_inicio: plan.fecha_inicio || null,
    fecha_fin: plan.fecha_fin || null,
    instrumento: plan.instrumento || null,
    contenidos: lineasAArreglo(plan.contenidos),
    obras: lineasAArreglo(plan.obras),
    tecnicas: lineasAArreglo(plan.tecnicas),
    escalas_arpegios: lineasAArreglo(plan.escalas_arpegios),
    estado: plan.estado || 'borrador',
    activo: true,
    updated_at: new Date().toISOString(),
  }

  if (plan.id) {
    const { data, error } = await supabase
      .from('planificaciones')
      .update(payload)
      .eq('id', plan.id)
      .select()
      .maybeSingle()

    if (error) throw new Error(`No se pudo guardar el plan: ${error.message}`)
    return data
  }

  payload.maestro_id = await _maestroActual()

  const { data, error } = await supabase
    .from('planificaciones')
    .insert([payload])
    .select()
    .maybeSingle()

  if (error) throw new Error(`No se pudo crear el plan: ${error.message}`)
  return data
}

/**
 * Copia el plan a otro período, para reusar el trabajo del semestre anterior.
 *
 * El original no se toca: queda como registro de lo que se planificó entonces.
 * La copia nace en borrador para que el maestro la revise antes de darla por
 * buena — un plan arrastrado sin mirar es la forma más rápida de que el
 * currículo deje de reflejar lo que pasa en el aula.
 */
export async function duplicarPlanParaPeriodo(planId, { periodoNombre, fechaInicio = null, fechaFin = null }) {
  if (!planId) throw new Error('Falta el plan a duplicar')
  if (!periodoNombre) throw new Error('Indique el período de destino')

  const { data: original, error: errLectura } = await supabase
    .from('planificaciones')
    .select('*')
    .eq('id', planId)
    .maybeSingle()

  if (errLectura) throw new Error(`No se pudo leer el plan original: ${errLectura.message}`)
  if (!original) throw new Error('El plan original ya no existe')

  const { id, created_at, updated_at, ...resto } = original

  const { data, error } = await supabase
    .from('planificaciones')
    .insert([{
      ...resto,
      periodo_nombre: periodoNombre,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      estado: 'borrador',
      activo: true,
      maestro_id: await _maestroActual(),
    }])
    .select()
    .maybeSingle()

  if (error) throw new Error(`No se pudo duplicar el plan: ${error.message}`)
  return data
}

/**
 * Nodos del currículo de la clase, para ofrecerlos como apoyo al planificar.
 * Devuelve [] cuando la clase no tiene ruta asignada — es el caso de viola y
 * orquesta, y no impide planificar.
 */
export async function obtenerApoyoCurricular(claseId) {
  if (!claseId) return []

  const { data: clase, error: errClase } = await supabase
    .from('clases')
    .select('route_version_id')
    .eq('id', claseId)
    .maybeSingle()

  if (errClase) throw new Error(`No se pudo leer la clase: ${errClase.message}`)
  if (!clase?.route_version_id) return []

  const { data, error } = await supabase
    .from('nodes')
    .select('id, name, codigo, level:levels!inner(level_number, name, route_version_id)')
    .eq('level.route_version_id', clase.route_version_id)
    .not('codigo', 'is', null)
    .order('name')

  if (error) throw new Error(`No se pudo cargar el apoyo curricular: ${error.message}`)

  // Los 8 nodos se repiten una vez por nivel; para sugerir contenidos alcanza
  // con la categoría, no con cada repetición.
  const vistos = new Set()
  return (data ?? []).filter((n) => {
    if (vistos.has(n.codigo)) return false
    vistos.add(n.codigo)
    return true
  })
}

/** Períodos disponibles, para elegir destino al duplicar. */
export async function listarPeriodos() {
  const { data, error } = await supabase
    .from('periodos')
    .select('id, nombre, fecha_inicio, fecha_fin, activo')
    .order('fecha_inicio', { ascending: false })

  if (error) throw new Error(`No se pudieron cargar los períodos: ${error.message}`)
  return data ?? []
}
