import { supabase } from '../../../lib/supabaseClient.js'
import { whatsappLink } from '../../../shared/utils/phoneUtils.js'
import { construirMensajeAusentismo } from '../domain/plantillasAusentismo.js'

async function _uidActual() {
  try {
    const { data } = await supabase.auth.getUser()
    return data?.user?.id || null
  } catch {
    return null
  }
}

/**
 * Normalize Dominican Republic phone number format to match SQL normalizar_tel_rd().
 * - Strips non-digits
 * - 11 digits matching 1(809|829|849)\d{7} → +digits
 * - 10 digits matching (809|829|849)\d{7} → +1+digits
 * - All else → null
 *
 * @param {string} raw - Raw phone input
 * @returns {string|null} - Normalized E.164 format or null
 */
function normalizarTelefonoRD(raw) {
  if (!raw || !raw.trim()) return null

  const digits = raw.replace(/\D/g, '')

  if (digits.length < 10) return null

  // 11 digits: 1 followed by (809|829|849) followed by 7 more
  if (digits.length === 11 && /^1(809|829|849)\d{7}$/.test(digits)) {
    return `+${digits}`
  }

  // 10 digits: (809|829|849) followed by 7 more
  if (digits.length === 10 && /^(809|829|849)\d{7}$/.test(digits)) {
    return `+1${digits}`
  }

  return null
}

/**
 * Resolve contact information for an alumno through cascading tiers.
 * Returns the first valid, non-empty contact found in this order:
 *
 * 1. representantes.telefono_whatsapp (direct alumno link)
 * 2. representantes.telefono_whatsapp (via alumnos.familia_id, prefer es_pagador)
 * 3. alumnos.representante_tlf
 * 4. alumnos.madre_tlf_whatsapp
 * 5. alumnos.padre_tlf_whatsapp
 * 6. alumnos.familiar_telefono
 * 7. alumnos.contacto_emergencia_telefono
 *
 * @param {string} alumnoId - UUID of the student
 * @returns {Promise<{nombre: string, telefono: string, origen: string}|{origen: null}>}
 */
export async function resolverContactoAlumno(alumnoId) {
  // Fetch the alumno row
  const { data: alumno, error: alumnoError } = await supabase
    .from('alumnos')
    .select('id, nombre_completo, familia_id, representante_tlf, madre_tlf_whatsapp, padre_tlf_whatsapp, familiar_telefono, contacto_emergencia_telefono')
    .eq('id', alumnoId)
    .single()

  if (alumnoError || !alumno) {
    return { origen: null }
  }

  // Tier 1: representantes.telefono_whatsapp where alumno_id = alumnoId
  const { data: repr1 } = await supabase
    .from('representantes')
    .select('nombre, telefono_whatsapp')
    .eq('alumno_id', alumnoId)
    .single()

  if (repr1?.telefono_whatsapp) {
    const telefono = normalizarTelefonoRD(repr1.telefono_whatsapp)
    if (telefono) {
      return { nombre: repr1.nombre, telefono, origen: 'representante_alumno' }
    }
  }

  // Tier 2: representantes via familia_id (prefer es_pagador)
  if (alumno.familia_id) {
    const { data: repr2List } = await supabase
      .from('representantes')
      .select('nombre, telefono_whatsapp, es_pagador')
      .eq('familia_id', alumno.familia_id)
      .order('es_pagador', { ascending: false })

    if (repr2List && repr2List.length > 0) {
      for (const repr of repr2List) {
        if (repr.telefono_whatsapp) {
          const telefono = normalizarTelefonoRD(repr.telefono_whatsapp)
          if (telefono) {
            return { nombre: repr.nombre, telefono, origen: 'representante_familia' }
          }
        }
      }
    }
  }

  // Tier 3: alumnos.representante_tlf
  if (alumno.representante_tlf) {
    const telefono = normalizarTelefonoRD(alumno.representante_tlf)
    if (telefono) {
      return { nombre: alumno.nombre_completo, telefono, origen: 'alumnos_representante_tlf' }
    }
  }

  // Tier 4: alumnos.madre_tlf_whatsapp
  if (alumno.madre_tlf_whatsapp) {
    const telefono = normalizarTelefonoRD(alumno.madre_tlf_whatsapp)
    if (telefono) {
      return { nombre: alumno.nombre_completo, telefono, origen: 'alumnos_madre_tlf_whatsapp' }
    }
  }

  // Tier 5: alumnos.padre_tlf_whatsapp
  if (alumno.padre_tlf_whatsapp) {
    const telefono = normalizarTelefonoRD(alumno.padre_tlf_whatsapp)
    if (telefono) {
      return { nombre: alumno.nombre_completo, telefono, origen: 'alumnos_padre_tlf_whatsapp' }
    }
  }

  // Tier 6: alumnos.familiar_telefono
  if (alumno.familiar_telefono) {
    const telefono = normalizarTelefonoRD(alumno.familiar_telefono)
    if (telefono) {
      return { nombre: alumno.nombre_completo, telefono, origen: 'alumnos_familiar_telefono' }
    }
  }

  // Tier 7: alumnos.contacto_emergencia_telefono
  if (alumno.contacto_emergencia_telefono) {
    const telefono = normalizarTelefonoRD(alumno.contacto_emergencia_telefono)
    if (telefono) {
      return { nombre: alumno.nombre_completo, telefono, origen: 'alumnos_contacto_emergencia_telefono' }
    }
  }

  // No valid contact found
  return { origen: null }
}

/**
 * In-memory cache for active periodo with 5-min TTL
 */
let periodoCacheData = null
let periodoCacheTime = null
const PERIODO_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Clear the periodo cache (for testing only).
 * @private
 */
export function __clearPeriodoCache() {
  periodoCacheData = null
  periodoCacheTime = null
}

/**
 * Get the active periodo (cached, 5-min TTL).
 * Throws if no active periodo exists.
 *
 * @returns {Promise<{id, nombre, fecha_inicio, fecha_fin}>}
 */
export async function getPeriodoActivo() {
  const now = Date.now()
  if (periodoCacheData && periodoCacheTime && now - periodoCacheTime < PERIODO_CACHE_TTL) {
    return periodoCacheData
  }

  const { data, error } = await supabase
    .from('periodos')
    .select('id, nombre, fecha_inicio, fecha_fin')
    .eq('activo', true)
    .single()

  if (error || !data) {
    throw new Error('No active periodo found')
  }

  periodoCacheData = data
  periodoCacheTime = now
  return data
}

/**
 * Fetch ausentes from vw_seguimiento_ausentes with filters and pagination.
 *
 * @param {Object} options
 * @param {number} [options.nivel] - Filter by nivel (1|2|3)
 * @param {string} [options.maestroId] - Filter by maestro_id
 * @param {boolean} [options.soloSinContacto] - If true, filter to contacto_telefono IS NULL
 * @param {string} [options.busqueda] - Search alumno_nombre (ILIKE)
 * @param {number} [options.limit=50] - Pagination limit
 * @param {number} [options.offset=0] - Pagination offset
 * @returns {Promise<{alumnos: Array, totalCount: number}>}
 */
export async function fetchSeguimientoAusentes({
  nivel = null,
  maestroId = null,
  soloSinContacto = false,
  busqueda = '',
  limit = 50,
  offset = 0,
} = {}) {
  let q = supabase.from('vw_seguimiento_ausentes').select('*', { count: 'exact' })

  if (nivel !== null) {
    q = q.eq('nivel', nivel)
  }

  if (maestroId !== null) {
    q = q.eq('maestro_id', maestroId)
  }

  if (soloSinContacto) {
    q = q.is('contacto_telefono', null)
  }

  if (busqueda) {
    q = q.ilike('alumno_nombre', `%${busqueda}%`)
  }

  // Order by nivel DESC, then by dias_ausente DESC
  q = q.order('nivel', { ascending: false }).order('dias_ausente', { ascending: false })

  // Pagination
  const { data, count, error } = await q.range(offset, offset + limit - 1)

  if (error) {
    console.error('[fetchSeguimientoAusentes]', error)
    throw new Error('Failed to fetch ausentes')
  }

  return {
    alumnos: data || [],
    totalCount: count || 0,
  }
}

/**
 * Historial de contactos de ausentismo de un alumno (para el panel de detalle).
 * @param {string} alumnoId
 * @returns {Promise<Array>} filas de comunicaciones_seguimiento (origen='ausentismo'), más recientes primero
 */
export async function fetchHistorialSeguimiento(alumnoId) {
  const { data, error } = await supabase
    .from('comunicaciones_seguimiento')
    .select('id, fecha, nivel, canal, resultado, estado, notas, proxima_accion, proxima_fecha')
    .eq('alumno_id', alumnoId)
    .eq('origen', 'ausentismo')
    .order('fecha', { ascending: false })

  if (error) {
    console.error('[fetchHistorialSeguimiento]', error)
    return []
  }
  return data || []
}

/**
 * Register a contact action to comunicaciones_seguimiento.
 * Enforces 120-min duplicate guard at the same nivel.
 * For nivel 2, auto-sets proxima_fecha = now() + 7 days.
 *
 * @param {Object} options
 * @param {string} options.alumnoId
 * @param {number} options.nivel - 1|2|3
 * @param {string} options.contactoTelefono
 * @param {string} [options.contactoNombre]
 * @param {string} [options.notas]
 * @param {string} [options.responsableId]
 * @returns {Promise<Object>} - Inserted comunicaciones_seguimiento row
 * @throws {Error} 'CONTACTO_DUPLICADO' if duplicate within 120 min
 */
export async function registrarContacto({
  alumnoId,
  nivel,
  contactoTelefono,
  contactoNombre = '',
  notas = '',
  responsableId = null,
} = {}) {
  // Check for duplicate within 120 minutes
  const minutoAtras = new Date(Date.now() - 120 * 60 * 1000).toISOString()
  const { data: recentContacts } = await supabase
    .from('comunicaciones_seguimiento')
    .select('id, fecha')
    .eq('alumno_id', alumnoId)
    .eq('origen', 'ausentismo')
    .eq('nivel', nivel)
    .gte('fecha', minutoAtras)

  if (recentContacts && recentContacts.length > 0) {
    throw new Error('CONTACTO_DUPLICADO')
  }

  // Prepare insert data
  const insertData = {
    alumno_id: alumnoId,
    canal: 'whatsapp',
    fecha: new Date().toISOString(),
    // resultado/estado según CHECK de comunicaciones_seguimiento:
    //   resultado ∈ contactado|buzon_no_contesto|reagendar|sin_interes|resuelto
    //   estado ∈ abierto|cerrado
    resultado: 'contactado',
    estado: 'abierto',
    requiere_seguimiento: true,
    origen: 'ausentismo',
    nivel,
    contacto_nombre: contactoNombre,
    contacto_telefono: contactoTelefono,
    notas,
  }

  insertData.responsable_id = responsableId || (await _uidActual())

  // For nivel 2, auto-set escalation deadline
  if (nivel === 2) {
    insertData.proxima_accion = 'contacto_nivel_3'
    const tomorrow7d = new Date()
    tomorrow7d.setDate(tomorrow7d.getDate() + 7)
    insertData.proxima_fecha = tomorrow7d.toISOString().split('T')[0]
  }

  const { data, error } = await supabase
    .from('comunicaciones_seguimiento')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('[registrarContacto]', error)
    throw new Error('Failed to register contact')
  }

  return data
}

/**
 * Orquesta el envío del mensaje de seguimiento de un alumno:
 * arma el texto del nivel, registra el contacto en comunicaciones_seguimiento
 * y devuelve el link wa.me para que el operador lo abra y envíe.
 *
 * El registro se hace ANTES de devolver el link: si el registro falla
 * (p. ej. duplicado en 120 min) NO se abre WhatsApp.
 *
 * @param {Object} opts
 * @param {Object} opts.alumno - fila de vw_seguimiento_ausentes (incluye contacto_telefono, contacto_nombre, nivel)
 * @param {1|2|3} [opts.nivel] - por defecto el nivel del alumno
 * @param {'representante'|'maestro'} [opts.destinatario='representante']
 * @returns {Promise<{ waUrl: string, mensaje: string, registro: Object }>}
 * @throws {Error} 'SIN_CONTACTO' si no hay teléfono; 'CONTACTO_DUPLICADO' si ya se contactó en 120 min
 */
export async function enviarSeguimientoAusentismo({ alumno, nivel, destinatario = 'representante' } = {}) {
  const nivelReal = nivel || alumno?.nivel
  const telefono = alumno?.contacto_telefono
  if (!telefono) {
    throw new Error('SIN_CONTACTO')
  }

  const mensaje = construirMensajeAusentismo({ nivel: nivelReal, destinatario, alumno })

  const registro = await registrarContacto({
    alumnoId: alumno.alumno_id,
    nivel: nivelReal,
    contactoTelefono: telefono,
    contactoNombre: alumno.contacto_nombre || '',
    notas: `Mensaje de nivel ${nivelReal} enviado por WhatsApp (${destinatario}).`,
  })

  return { waUrl: whatsappLink(telefono, mensaje), mensaje, registro }
}

/**
 * Reinicia el contador de ausencias de un alumno: inserta un corte con fecha now().
 * La vista sólo cuenta ausencias posteriores al corte más reciente.
 *
 * @param {Object} opts
 * @param {string} opts.alumnoId
 * @param {string} [opts.motivo]
 * @returns {Promise<Object>} fila de seguimiento_ausencias_reinicio
 */
export async function reiniciarContadorAusencias({ alumnoId, motivo = '' } = {}) {
  const { data, error } = await supabase
    .from('seguimiento_ausencias_reinicio')
    .insert({
      alumno_id: alumnoId,
      motivo: motivo || null,
      creado_por: await _uidActual(),
    })
    .select()
    .single()

  if (error) {
    console.error('[reiniciarContadorAusencias]', error)
    throw new Error(error.message || 'No se pudo reiniciar el contador')
  }
  return data
}

/**
 * Suspende temporalmente a un alumno. Mientras la suspensión esté activa y vigente,
 * el alumno no aparece en el panel de seguimiento de ausentes. No toca alumnos.activo.
 *
 * @param {Object} opts
 * @param {string} opts.alumnoId
 * @param {string} [opts.motivo]
 * @param {string} [opts.hasta] - fecha 'YYYY-MM-DD'; null = indefinida
 * @returns {Promise<Object>} fila de alumno_suspensiones
 */
export async function suspenderAlumno({ alumnoId, motivo = '', hasta = null } = {}) {
  const { data, error } = await supabase
    .from('alumno_suspensiones')
    .insert({
      alumno_id: alumnoId,
      motivo: motivo || null,
      hasta: hasta || null,
      estado: 'activa',
      creado_por: await _uidActual(),
    })
    .select()
    .single()

  if (error) {
    console.error('[suspenderAlumno]', error)
    throw new Error(error.message || 'No se pudo suspender al alumno')
  }
  return data
}

/**
 * Levanta la suspensión activa de un alumno (reactivarlo).
 * @param {Object} opts
 * @param {string} opts.suspensionId
 * @returns {Promise<Object>}
 */
export async function levantarSuspension({ suspensionId } = {}) {
  const { data, error } = await supabase
    .from('alumno_suspensiones')
    .update({ estado: 'levantada' })
    .eq('id', suspensionId)
    .select()
    .single()

  if (error) {
    console.error('[levantarSuspension]', error)
    throw new Error(error.message || 'No se pudo levantar la suspensión')
  }
  return data
}

/**
 * Create a retention (retención de instrumento).
 * Requires ACM role (enforced by RLS).
 *
 * @param {Object} options
 * @param {string} options.alumnoId
 * @param {string} [options.instrumentoTexto]
 * @param {string} [options.instrumentoId]
 * @param {string} [options.notas]
 * @returns {Promise<Object>} - Inserted retenciones_instrumento row
 */
export async function crearRetencion({
  alumnoId,
  instrumentoTexto = null,
  instrumentoId = null,
  notas = '',
} = {}) {
  const { data, error } = await supabase
    .from('retenciones_instrumento')
    .insert({
      alumno_id: alumnoId,
      instrumento_id: instrumentoId,
      instrumento_texto: instrumentoTexto,
      motivo: 'ausentismo_acumulado',
      estado: 'retenido',
      notas,
    })
    .select()
    .single()

  if (error) {
    console.error('[crearRetencion] RLS or DB error:', error)
    throw new Error(error.message || 'Failed to create retention')
  }

  return data
}

/**
 * Lift a retention (mark as levantada).
 *
 * @param {Object} options
 * @param {string} options.retencionId
 * @param {string} [options.notas]
 * @returns {Promise<Object>} - Updated retenciones_instrumento row
 */
export async function levantarRetencion({
  retencionId,
  notas = '',
} = {}) {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('retenciones_instrumento')
    .update({
      estado: 'levantada',
      acta_firmada_en: now,
      fecha_reincorporacion: now,
      levantada_en: now,
      ...(notas && { notas }),
    })
    .eq('id', retencionId)
    .select()
    .single()

  if (error) {
    console.error('[levantarRetencion]', error)
    throw new Error('Failed to lift retention')
  }

  return data
}

/**
 * Nivel 3: retiene el instrumento del alumno y prepara los DOS mensajes de WhatsApp
 * (al representante con instrucciones de desbloqueo, y al maestro con la orden de
 * recoger el instrumento). Registra ambos contactos.
 *
 * @param {Object} opts
 * @param {Object} opts.alumno - fila de vw_seguimiento_ausentes
 * @param {string} [opts.notas]
 * @returns {Promise<{ retencion, waRepresentante: string|null, waMaestro: string|null }>}
 * @throws {Error} 'SIN_CONTACTO' si no hay teléfono del representante
 */
export async function enviarRetencionNivel3({ alumno, notas = '' } = {}) {
  if (!alumno?.contacto_telefono) throw new Error('SIN_CONTACTO')

  const retencion = await crearRetencion({
    alumnoId: alumno.alumno_id,
    instrumentoTexto: alumno.instrumento_principal || null,
    notas: notas || `Retención por ${alumno.dias_ausente} días de ausencia acumulados.`,
  })

  // Mensaje al representante
  const msgRep = construirMensajeAusentismo({ nivel: 3, destinatario: 'representante', alumno })
  await registrarContacto({
    alumnoId: alumno.alumno_id,
    nivel: 3,
    contactoTelefono: alumno.contacto_telefono,
    contactoNombre: alumno.contacto_nombre || '',
    notas: 'Nivel 3: retención de instrumento — instrucciones de desbloqueo al representante.',
  }).catch((e) => { if (e.message !== 'CONTACTO_DUPLICADO') throw e })

  // Mensaje al maestro (si tiene teléfono)
  let waMaestro = null
  const telMaestro = normalizarTelefonoRD(alumno.maestro_tlf)
  if (telMaestro) {
    const msgMaestro = construirMensajeAusentismo({ nivel: 3, destinatario: 'maestro', alumno })
    waMaestro = whatsappLink(telMaestro, msgMaestro)
    await supabase.from('comunicaciones_seguimiento').insert({
      alumno_id: alumno.alumno_id,
      canal: 'whatsapp',
      fecha: new Date().toISOString(),
      resultado: 'contactado',
      estado: 'abierto',
      requiere_seguimiento: true,
      origen: 'ausentismo',
      nivel: 3,
      contacto_nombre: alumno.maestro_nombre || 'Maestro',
      contacto_telefono: telMaestro,
      notas: 'Nivel 3: orden de recogida del instrumento al maestro.',
      responsable_id: await _uidActual(),
    })
  }

  await supabase.from('retenciones_instrumento')
    .update({ maestro_notificado_en: new Date().toISOString() })
    .eq('id', retencion.id)

  return {
    retencion,
    waRepresentante: whatsappLink(alumno.contacto_telefono, msgRep),
    waMaestro,
  }
}

/**
 * Reincorpora al alumno: levanta la retención (lo que reinicia su contador vía
 * fecha_reincorporacion) y registra el contacto de cierre.
 *
 * @param {Object} opts
 * @param {string} opts.retencionId
 * @param {Object} opts.alumno
 * @param {string} [opts.notas]
 * @returns {Promise<Object>} retención actualizada
 */
export async function reincorporarAlumno({ retencionId, alumno, notas = '' } = {}) {
  const ret = await levantarRetencion({ retencionId, notas: notas || 'Reincorporación: acta de compromiso firmada.' })

  try {
    await supabase.from('comunicaciones_seguimiento').insert({
      alumno_id: alumno.alumno_id,
      canal: 'reunion',
      fecha: new Date().toISOString(),
      resultado: 'resuelto',
      estado: 'cerrado',
      requiere_seguimiento: false,
      origen: 'ausentismo',
      nivel: 3,
      contacto_nombre: alumno.contacto_nombre || alumno.alumno_nombre,
      notas: notas || 'Reincorporación tras retención de instrumento. Contador reiniciado.',
      responsable_id: await _uidActual(),
    })
  } catch (e) {
    console.warn('[reincorporarAlumno] log', e?.message)
  }

  return ret
}

/**
 * KPIs del panel de ausentismo (para ADM). Lee la vista + retenciones_instrumento.
 * @returns {Promise<Object>}
 */
export async function fetchKpisAusentismo() {
  const [vista, retActivas, retLevantadas, contactos] = await Promise.all([
    supabase.from('vw_seguimiento_ausentes').select('nivel, contacto_telefono'),
    supabase.from('retenciones_instrumento').select('id', { count: 'exact', head: true }).eq('estado', 'retenido'),
    supabase.from('retenciones_instrumento').select('id', { count: 'exact', head: true }).eq('estado', 'levantada'),
    supabase.from('comunicaciones_seguimiento')
      .select('fecha')
      .eq('origen', 'ausentismo')
      .gte('fecha', new Date(Date.now() - 72 * 3600 * 1000).toISOString()),
  ])

  const rows = vista.data || []
  return {
    nivel1: rows.filter((r) => r.nivel === 1).length,
    nivel2: rows.filter((r) => r.nivel === 2).length,
    nivel3: rows.filter((r) => r.nivel === 3).length,
    sinContacto: rows.filter((r) => !r.contacto_telefono).length,
    totalAusentes: rows.length,
    retencionesActivas: retActivas.count || 0,
    retencionesLevantadas: retLevantadas.count || 0,
    contactosUltimas72h: (contactos.data || []).length,
  }
}

/**
 * Casos de ausentismo cerrados/resueltos, para el histórico de ADM.
 * @param {Object} opts
 * @param {string} [opts.desde] 'YYYY-MM-DD'
 * @param {string} [opts.hasta] 'YYYY-MM-DD'
 * @param {number} [opts.limit=200]
 * @returns {Promise<Array>}
 */
export async function fetchCasosCerrados({ desde = null, hasta = null, limit = 200 } = {}) {
  let q = supabase.from('comunicaciones_seguimiento')
    .select('id, alumno_id, fecha, nivel, canal, resultado, estado, notas, contacto_nombre')
    .eq('origen', 'ausentismo')
    .in('resultado', ['resuelto'])
    .order('fecha', { ascending: false })
    .limit(limit)
  if (desde) q = q.gte('fecha', desde)
  if (hasta) q = q.lte('fecha', `${hasta}T23:59:59`)
  const { data, error } = await q
  if (error) { console.error('[fetchCasosCerrados]', error); return [] }
  return data || []
}
