import { supabase } from '../../../lib/supabaseClient.js'
import { analizarIntencion } from '../domain/intencionParser.js'
import {
  decidirAccion,
  CONV_ESTADOS,
  conflictoToMensaje,
} from '../domain/flujoInscripcionWhatsApp.js'
import {
  actualizarEstadoPostulante,
  hayConflictoCita,
  obtenerPostulante,
} from '../api/postulantesApi.js'

const JID_SUFFIX = '@s.whatsapp.net'

function toJid(telefono) {
  if (!telefono) return null
  const limpio = telefono.replace(/[^0-9]/g, '')
  if (limpio.length < 10) return null
  return `${limpio}${JID_SUFFIX}`
}

function obtenerTelefono(postulante) {
  return postulante.madre_tlf_whatsapp
    || postulante.padre_tlf_whatsapp
    || postulante.telefono_alumno
    || postulante.telefono_representante
    || postulante.representante_tlf
    || ''
}

function resolverNombre(postulante) {
  return postulante.representante_nombre
    || postulante.madre_nombre
    || postulante.padre_nombre
    || 'Representante'
}

function resolverNombreAlumno(postulante) {
  return postulante.nombre_completo
    || postulante.nombre_alumno
    || 'su hijo(a)'
}

const MENSAJE_CAMPANIA = `Hola {nombre}, le contactamos de *El Sistema Punta Cana*. Hemos recibido la postulación de *{alumno}* y estamos en periodo de inscripción. ¿Le gustaría agendar una cita para formalizar la inscripción?`

async function getConversacion(postulanteId) {
  const { data, error } = await supabase
    .from('conversaciones_whatsapp')
    .select('*')
    .eq('postulante_id', postulanteId)
    .maybeSingle()

  if (error) throw new Error(`Error al obtener conversación: ${error.message}`)
  return data
}

async function upsertConversacion(postulanteId, jid, updates) {
  const payload = { postulante_id: postulanteId, jid, updated_at: new Date().toISOString(), ...updates }
  const { data, error } = await supabase
    .from('conversaciones_whatsapp')
    .upsert(payload, { onConflict: 'postulante_id' })
    .select()
    .maybeSingle()

  if (error) throw new Error(`Error al guardar conversación: ${error.message}`)
  return data
}

async function encolarMensaje(jid, mensaje) {
  if (!jid || !mensaje) return null
  const { data, error } = await supabase
    .from('hermes_whatsapp_queue')
    .insert({ jid, mensaje, estado: 'pendiente' })
    .select('id')
    .maybeSingle()

  if (error) throw new Error(`Error al encolar mensaje: ${error.message}`)
  return data?.id ?? null
}

export async function iniciarCampaña(sobreescribirMensaje = null) {
  const { data: postulantes, error } = await supabase
    .from('postulantes')
    .select('*')
    .eq('estado', 'en_espera')

  if (error) throw new Error(`Error al obtener postulantes: ${error.message}`)

  let enviados = 0
  let errores = 0

  for (const p of postulantes || []) {
    try {
      const telefono = obtenerTelefono(p)
      if (!telefono) {
        errores++
        continue
      }

      const nombre = resolverNombre(p)
      const alumno = resolverNombreAlumno(p)
      const mensaje = (sobreescribirMensaje || MENSAJE_CAMPANIA)
        .replace('{nombre}', nombre)
        .replace('{alumno}', alumno)

      const jid = toJid(telefono)
      if (!jid) {
        errores++
        continue
      }

      await upsertConversacion(p.id, jid, { estado_conversacion: CONV_ESTADOS.ESPERANDO_RESPUESTA, reintentos: 0, ultimo_mensaje_enviado: mensaje, ultimo_mensaje_recibido: null, ultima_intencion: null, fecha_cita_propuesta: null })

      await encolarMensaje(jid, mensaje)
      enviados++
    } catch {
      errores++
    }
  }

  return { enviados, errores, total: postulantes?.length || 0 }
}

export async function procesarMensajeEntrante(postulanteId, mensajeTexto, telefono) {
  const postulante = await obtenerPostulante(postulanteId)
  if (!postulante) throw new Error(`Postulante ${postulanteId} no encontrado`)

  const jid = toJid(telefono || obtenerTelefono(postulante))
  let conversacion = await getConversacion(postulanteId)

  const estadoConversacion = conversacion?.estado_conversacion || CONV_ESTADOS.ESPERANDO_RESPUESTA
  const reintentos = conversacion?.reintentos || 0
  const fechaCitaActual = postulante.fecha_cita

  const contexto = {
    estadoPostulante: postulante.estado || 'postulado',
    ultimoMensajeEnviado: conversacion?.ultimo_mensaje_enviado || null,
  }

  const intencion = await analizarIntencion(mensajeTexto, contexto)

  const decision = decidirAccion(
    {
      estadoConversacion,
      nombreRepresentante: resolverNombre(postulante),
      nombreAlumno: resolverNombreAlumno(postulante),
      fechaCitaActual,
      reintentos,
    },
    intencion,
  )

  if (decision.pipelineAction) {
    const { tipo, nuevoEstado, meta } = decision.pipelineAction

    if (tipo === 'transicionar' || tipo === 'agendar') {
      await actualizarEstadoPostulante(postulanteId, nuevoEstado, meta || {})
    }

    if (tipo === 'agendar') {
      await upsertConversacion(postulanteId, jid, {
        estado_conversacion: decision.siguienteEstado,
        ultimo_mensaje_recibido: mensajeTexto,
        ultima_intencion: intencion.intencion,
        fecha_cita_propuesta: postulante.fecha_cita,
      })
    }

    if (tipo === 'notificar') {
      await upsertConversacion(postulanteId, jid, {
        estado_conversacion: decision.siguienteEstado,
        ultimo_mensaje_recibido: mensajeTexto,
        ultima_intencion: intencion.intencion,
      })
    }
  }

  const nuevosReintentos = intencion.intencion === 'no_respuesta' ? reintentos + 1 : 0

  await upsertConversacion(postulanteId, jid, {
    estado_conversacion: decision.siguienteEstado,
    reintentos: nuevosReintentos,
    ultimo_mensaje_recibido: mensajeTexto,
    ultimo_mensaje_enviado: decision.mensaje,
    ultima_intencion: intencion.intencion,
  })

  if (decision.mensaje && jid) {
    await encolarMensaje(jid, decision.mensaje)
  }

  return {
    intencion: intencion.intencion,
    confianza: intencion.confianza,
    mensajeRespuesta: decision.mensaje,
    siguienteEstado: decision.siguienteEstado,
    pipelineAction: decision.pipelineAction,
  }
}

export async function verificarDisponibilidad(fechaSugerida, postulanteExcluir = null) {
  if (!fechaSugerida) {
    return { disponible: false, alternativas: [], mensaje: 'No se proporcionó una fecha.' }
  }

  const conflicto = await hayConflictoCita(fechaSugerida, postulanteExcluir)
  if (!conflicto) {
    return { disponible: true, alternativas: [], mensaje: null }
  }

  const alternativas = await buscarAlternativas(fechaSugerida, postulanteExcluir)
  return {
    disponible: false,
    alternativas,
    mensaje: 'Ese horario no está disponible.',
  }
}

async function buscarAlternativas(desdeFecha, postulanteExcluir) {
  const desde = new Date(desdeFecha)
  const slots = []
  const diasAExaminar = 5

  for (let d = 1; d <= diasAExaminar; d++) {
    const dia = new Date(desde)
    dia.setDate(dia.getDate() + d)
    dia.setHours(8, 0, 0, 0)

    for (let h = 0; h < 8; h++) {
      const slot = new Date(dia)
      slot.setHours(8 + h, 0, 0, 0)

      if (slot <= desde) continue

      const ocupado = await hayConflictoCita(slot.toISOString(), postulanteExcluir)
      if (!ocupado) {
        slots.push(slot.toISOString())
      }
      if (slots.length >= 3) break
    }
    if (slots.length >= 3) break
  }

  return slots
}

export async function ejecutarRecordatorios() {
  const manana = new Date()
  manana.setDate(manana.getDate() + 1)
  const inicio = new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 0, 0, 0)
  const fin = new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 23, 59, 59)

  const { data: postulantes, error } = await supabase
    .from('postulantes')
    .select('*')
    .eq('estado', 'cita_agendada')
    .gte('fecha_cita', inicio.toISOString())
    .lte('fecha_cita', fin.toISOString())

  if (error) throw new Error(`Error al obtener citas de mañana: ${error.message}`)

  let enviados = 0

  for (const p of postulantes || []) {
    try {
      const telefono = obtenerTelefono(p)
      const jid = toJid(telefono)
      if (!jid) continue

      const nombre = resolverNombre(p)
      const hora = p.fecha_cita
        ? new Date(p.fecha_cita).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        : 'la hora acordada'

      const mensaje = `Hola ${nombre}, le recordamos que mañana tiene una cita en *El Sistema Punta Cana* a las *${hora}*.\n\n*Requisitos:*\n• Cédula del representante\n• Partida de nacimiento del alumno\n• Constancia escolar\n• Foto del alumno\n• Documentos médicos (si aplica)\n\n¿Confirma su asistencia?`

      await upsertConversacion(p.id, jid, {
        estado_conversacion: CONV_ESTADOS.ESPERANDO_CONFIRMACION_D1,
        ultimo_mensaje_enviado: mensaje,
      })

      await encolarMensaje(jid, mensaje)
      enviados++
    } catch {
      continue
    }
  }

  return { enviados, total: postulantes?.length || 0 }
}
