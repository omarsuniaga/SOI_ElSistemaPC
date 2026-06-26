import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { analizarIntencion } from './intentParser.ts'
import { decidirAccion, CONV_ESTADOS, REINTENTOS_MAX, conflictoToMensaje } from './stateMachine.ts'

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY') ?? ''

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function errorResponse(message: string, status = 400) {
  return json({ error: message }, status)
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

function getClient(serviceRole = true) {
  return createClient(SUPABASE_URL, serviceRole ? SUPABASE_SERVICE_ROLE_KEY : SUPABASE_ANON_KEY)
}

interface EvolutionWebhook {
  event?: string
  instance?: string
  data?: {
    key?: {
      remoteJid?: string
      fromMe?: boolean
      id?: string
    }
    pushName?: string
    message?: {
      conversation?: string
      extendedTextMessage?: { text?: string }
      imageMessage?: { caption?: string }
      videoMessage?: { caption?: string }
      documentMessage?: { title?: string }
    }
    messageType?: string
  }
}

type Postulante = Record<string, unknown> & {
  id: string
  estado?: string
  fecha_cita?: string | null
  notas_seguimiento?: string | null
  madre_tlf_whatsapp?: string | null
  padre_tlf_whatsapp?: string | null
  telefono_alumno?: string | null
  telefono_representante?: string | null
  representante_tlf?: string | null
  representante_nombre?: string | null
  madre_nombre?: string | null
  padre_nombre?: string | null
  nombre_completo?: string | null
  nombre_alumno?: string | null
}

type Conversacion = Record<string, unknown> & {
  id: string
  postulante_id: string
  jid: string
  estado_conversacion?: string
  reintentos?: number
  ultimo_mensaje_enviado?: string | null
  ultimo_mensaje_recibido?: string | null
  ultima_intencion?: string | null
  fecha_cita_propuesta?: string | null
}

function extractText(msg: EvolutionWebhook['data']): string | null {
  if (!msg?.message) return null
  const m = msg.message
  if (m.conversation) return m.conversation
  if (m.extendedTextMessage?.text) return m.extendedTextMessage.text
  if (m.imageMessage?.caption) return m.imageMessage.caption
  if (m.videoMessage?.caption) return m.videoMessage.caption
  return null
}

function resolverNombre(p: Postulante): string {
  return p.representante_nombre || p.madre_nombre || p.padre_nombre || 'Representante'
}

function resolverNombreAlumno(p: Postulante): string {
  return p.nombre_completo || p.nombre_alumno || 'su hijo(a)'
}

function obtenerTelefono(p: Postulante): string {
  return p.madre_tlf_whatsapp || p.padre_tlf_whatsapp || p.telefono_alumno || p.telefono_representante || p.representante_tlf || ''
}

function maybeSingle<T>(result: { data: T | null; error: unknown }): T | null {
  if (result.error) throw result.error
  return result.data
}

function esNumeroPersonal(jid: string): boolean {
  return jid.endsWith('@s.whatsapp.net') && !jid.endsWith('@g.us')
}

async function checkDisponibilidad(
  supabase: ReturnType<typeof createClient>,
  fechaSugerida: string,
  excludePostulanteId?: string,
): Promise<boolean> {
  const targetTime = new Date(fechaSugerida).getTime()
  const desde = new Date(targetTime - 30 * 60 * 1000).toISOString()
  const hasta = new Date(targetTime + 30 * 60 * 1000).toISOString()

  let query = supabase
    .from('postulantes')
    .select('id')
    .gte('fecha_cita', desde)
    .lte('fecha_cita', hasta)
    .not('fecha_cita', 'is', null)

  if (excludePostulanteId) {
    query = query.neq('id', excludePostulanteId)
  }

  const { data } = await query
  return (data ?? []).length === 0
}

async function buscarAlternativas(
  supabase: ReturnType<typeof createClient>,
  desdeFecha: string,
  excludePostulanteId?: string,
): Promise<string[]> {
  const desde = new Date(desdeFecha)
  const slots: string[] = []
  const DIAS_A_EXAMINAR = 5

  for (let d = 1; d <= DIAS_A_EXAMINAR; d++) {
    const dia = new Date(desde)
    dia.setDate(dia.getDate() + d)
    dia.setHours(8, 0, 0, 0)

    for (let h = 0; h < 8; h++) {
      const slot = new Date(dia)
      slot.setHours(8 + h, 0, 0, 0)

      if (slot <= desde) continue

      const libre = await checkDisponibilidad(supabase, slot.toISOString(), excludePostulanteId)
      if (libre) {
        slots.push(slot.toISOString())
      }
      if (slots.length >= 3) break
    }
    if (slots.length >= 3) break
  }

  return slots
}

async function crearEventoCalendario(
  supabase: ReturnType<typeof createClient>,
  postulante: Postulante,
  fechaCita: string,
): Promise<void> {
  const fechaFin = new Date(new Date(fechaCita).getTime() + 30 * 60 * 1000).toISOString()
  const nombreAlumno = resolverNombreAlumno(postulante)
  const representante = resolverNombre(postulante)
  const telefono = obtenerTelefono(postulante)

  const { error } = await supabase.from('calendario_institucional').insert({
    titulo: `Inscripción: ${nombreAlumno} - ${representante}`,
    descripcion: `Cita de inscripción agendada vía WhatsApp para ${nombreAlumno}. Contacto: ${telefono}`,
    categoria: 'inscripcion',
    fecha_inicio: fechaCita,
    fecha_fin: fechaFin,
    departamento_responsable: 'ADM',
    metadata: {
      postulante_id: postulante.id,
      telefono_contacto: telefono,
      tipo: 'cita_inscripcion',
      origen: 'whatsapp_campaign',
    },
    estado: 'programado',
  })

  if (error) {
    console.error('[webhook] Error creando evento calendario:', error.message)
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return errorResponse('Método no permitido', 405)
  }

  if (!GROQ_API_KEY) {
    return errorResponse('GROQ_API_KEY no configurada', 500)
  }

  let payload: EvolutionWebhook
  try {
    payload = await req.json()
  } catch {
    return errorResponse('JSON inválido en el body')
  }

  if (!payload.data?.key?.remoteJid) {
    return json({ ok: true, ignored: 'no_remote_jid' })
  }

  const jid = payload.data.key.remoteJid

  if (!esNumeroPersonal(jid)) {
    return json({ ok: true, ignored: 'group_message' })
  }

  if (payload.data.key.fromMe === true) {
    return json({ ok: true, ignored: 'from_me' })
  }

  const texto = extractText(payload.data)
  if (!texto) {
    return json({ ok: true, ignored: 'non_text_message' })
  }

  const pushName = payload.data.pushName || 'Desconocido'
  const messageId = payload.data.key.id || 'unknown'

  const supabase = getClient(true)

  let conversacion: Conversacion | null
  try {
    conversacion = maybeSingle(
      await supabase
        .from('conversaciones_whatsapp')
        .select('*')
        .eq('jid', jid)
        .maybeSingle(),
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[webhook] Error buscando conversación:', msg)
    return errorResponse(`Error en DB: ${msg}`, 502)
  }

  if (!conversacion) {
    console.log(`[webhook] JID ${jid} no tiene conversación activa (pushName: ${pushName})`)
    return json({ ok: true, ignored: 'no_active_conversation', jid })
  }

  const postulanteId = conversacion.postulante_id

  let postulante: Postulante | null
  try {
    postulante = maybeSingle(
      await supabase
        .from('postulantes')
        .select('*')
        .eq('id', postulanteId)
        .maybeSingle(),
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[webhook] Error buscando postulante:', msg)
    return errorResponse(`Error en DB: ${msg}`, 502)
  }

  if (!postulante) {
    console.error(`[webhook] Postulante ${postulanteId} no encontrado para jid ${jid}`)
    return errorResponse('Postulante no encontrado', 404)
  }

  const estadoConversacion = conversacion.estado_conversacion || CONV_ESTADOS.ESPERANDO_RESPUESTA
  const reintentos = conversacion.reintentos || 0

  const contexto = {
    estadoPostulante: postulante.estado || 'postulado',
    ultimoMensajeEnviado: conversacion.ultimo_mensaje_enviado || null,
  }

  const intencion = await analizarIntencion(GROQ_API_KEY, texto, contexto)

  const decision = decidirAccion(
    {
      estadoConversacion,
      nombreRepresentante: resolverNombre(postulante),
      nombreAlumno: resolverNombreAlumno(postulante),
      fechaCitaActual: postulante.fecha_cita || null,
      reintentos,
    },
    intencion,
  )

  // ── Availability check ─────────────────────────────────────────────────
  let mensajeFinal = decision.mensaje
  let estadoFinal = decision.siguienteEstado as string
  let pipelineFinal = decision.pipelineAction

  if (
    decision.siguienteEstado === CONV_ESTADOS.AGENDANDO_CITA &&
    intencion.fecha_sugerida
  ) {
    const disponible = await checkDisponibilidad(supabase, intencion.fecha_sugerida, postulanteId)

    if (disponible) {
      const { error: fcErr } = await supabase
        .from('postulantes')
        .update({ fecha_cita: intencion.fecha_sugerida })
        .eq('id', postulanteId)

      if (!fcErr) {
        postulante.fecha_cita = intencion.fecha_sugerida
      }
    } else {
      const alternativas = await buscarAlternativas(supabase, intencion.fecha_sugerida, postulanteId)
      mensajeFinal = conflictoToMensaje(resolverNombre(postulante), alternativas)
      estadoFinal = CONV_ESTADOS.OFRECIENDO_HORARIOS
      pipelineFinal = null
    }
  }

  // ── Calendar creation ──────────────────────────────────────────────────
  let calendarCreated = false
  if (pipelineFinal?.tipo === 'agendar' && pipelineFinal?.nuevoEstado === 'cita_agendada') {
    if (postulante.fecha_cita) {
      await crearEventoCalendario(supabase, postulante, postulante.fecha_cita)
      calendarCreated = true
    }
  }

  // ── Update DB ──────────────────────────────────────────────────────────
  const nuevosReintentos = intencion.intencion === 'no_respuesta' ? reintentos + 1 : 0

  const convUpdates: Record<string, unknown> = {
    estado_conversacion: estadoFinal,
    reintentos: nuevosReintentos,
    ultimo_mensaje_recibido: texto,
    ultimo_mensaje_enviado: mensajeFinal,
    ultima_intencion: intencion.intencion,
    updated_at: new Date().toISOString(),
  }

  try {
    const { error: convErr } = await supabase
      .from('conversaciones_whatsapp')
      .update(convUpdates)
      .eq('id', conversacion.id)

    if (convErr) throw convErr

    if (pipelineFinal?.meta || pipelineFinal?.nuevoEstado) {
      const pa = pipelineFinal
      const updateData: Record<string, unknown> = {}

      if (pa.nuevoEstado) {
        updateData.estado = pa.nuevoEstado
      }
      if (pa.meta?.notas_seguimiento) {
        const currentNotas = (postulante.notas_seguimiento as string) || ''
        const newNota = pa.meta.notas_seguimiento as string
        updateData.notas_seguimiento = currentNotas
          ? `${currentNotas}\n${newNota}`
          : newNota
      }
      if (pa.tipo === 'agendar' && pa.nuevoEstado === 'cita_agendada') {
        updateData.fecha_contacto = new Date().toISOString()
      }

      if (Object.keys(updateData).length > 0) {
        const { error: postErr } = await supabase
          .from('postulantes')
          .update(updateData)
          .eq('id', postulanteId)
        if (postErr) throw postErr
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[webhook] Error actualizando DB:', msg)
    return errorResponse(`Error actualizando DB: ${msg}`, 502)
  }

  if (mensajeFinal) {
    try {
      const { error: queueErr } = await supabase
        .from('hermes_whatsapp_queue')
        .insert({ jid, mensaje: mensajeFinal, estado: 'pendiente' })

      if (queueErr) throw queueErr
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[webhook] Error encolando respuesta:', msg)
    }
  }

  try {
    await supabase.from('whatsapp_webhook_log').insert({
      message_id: messageId,
      jid_remitente: jid,
      postulante_id: postulanteId,
      mensaje_texto: texto,
      push_name: pushName,
      intencion_detectada: intencion.intencion,
      confianza: intencion.confianza,
      argumento: intencion.argumento,
      respuesta_enviada: mensajeFinal,
      estado_conversacion_nuevo: estadoFinal,
      accion_pipeline: pipelineFinal ? JSON.stringify(pipelineFinal) : null,
    })
  } catch (err) {
    console.warn('[webhook] Error guardando log:', err instanceof Error ? err.message : String(err))
  }

  console.log(
    `[webhook] OK jid=${jid} postulante=${postulanteId.slice(0, 8)} intent=${intencion.intencion} conf=${intencion.confianza.toFixed(2)} estado=${estadoFinal} calendario=${calendarCreated}`,
  )

  return json({
    ok: true,
    postulante_id: postulanteId,
    intencion: intencion.intencion,
    confianza: intencion.confianza,
    siguiente_estado: estadoFinal,
    tiene_respuesta: !!mensajeFinal,
    calendario_creado: calendarCreated,
    conflicto_detectado: mensajeFinal !== decision.mensaje && !calendarCreated,
  })
})
