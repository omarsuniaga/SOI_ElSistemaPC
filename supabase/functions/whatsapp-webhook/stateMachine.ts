export const CONV_ESTADOS = {
  ESPERANDO_RESPUESTA: 'esperando_respuesta_campania',
  OFRECIENDO_HORARIOS: 'ofreciendo_horarios',
  AGENDANDO_CITA: 'agendando_cita',
  CONFIRMADA: 'cita_confirmada',
  ESPERANDO_CONFIRMACION_D1: 'esperando_confirmacion_d1',
  CANCELADA: 'cancelada',
  REQUISITOS: 'respondiendo_requisitos',
} as const

export type ConvEstado = (typeof CONV_ESTADOS)[keyof typeof CONV_ESTADOS]

export const REINTENTOS_MAX = 2

const DOCS_REQUERIDOS = [
  'Cédula del representante',
  'Partida de nacimiento del alumno',
  'Constancia escolar',
  'Foto del alumno',
  'Documentos médicos (si aplica)',
]

interface ConvCtx {
  nombreRepresentante: string
  nombreAlumno: string
  fechaCitaActual: string | null
  reintentos: number
}

interface PipelineAction {
  tipo: 'transicionar' | 'agendar' | 'notificar'
  nuevoEstado?: string
  meta?: Record<string, unknown>
}

interface Decision {
  mensaje: string | null
  siguienteEstado: ConvEstado | string
  pipelineAction: PipelineAction | null
}

function formatearFecha(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatearHora(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function docsToList(): string {
  return DOCS_REQUERIDOS.map(d => `• ${d}`).join('\n')
}

const MSG_DEFAULT = 'Gracias por comunicarse con El Sistema Punta Cana. Pronto le daremos seguimiento.'

function handleRespuestaInicial(intencion: string, confianza: number, _fecha_sugerida: string | null, ctx: ConvCtx): Decision {
  const nombre = ctx.nombreRepresentante || 'estimado representante'
  const alumno = ctx.nombreAlumno || 'su hijo'

  switch (intencion) {
    case 'agendar_cita':
      if (confianza < 0.5) {
        return {
          mensaje: `Hola ${nombre}, gracias por su respuesta. ¿Le gustaría agendar una cita para formalizar la inscripción de ${alumno}?`,
          siguienteEstado: CONV_ESTADOS.ESPERANDO_RESPUESTA,
          pipelineAction: null,
        }
      }
      return {
        mensaje: `¡Excelente, ${nombre}! Para agendar la cita, ¿qué día y horario le queda bien? Trabajamos de lunes a viernes de 8:00 a.m. a 4:00 p.m.`,
        siguienteEstado: CONV_ESTADOS.OFRECIENDO_HORARIOS,
        pipelineAction: {
          tipo: 'transicionar',
          nuevoEstado: 'contactado',
          meta: { notas_seguimiento: 'Contacto vía WhatsApp — respuesta positiva a campaña de inscripción.' },
        },
      }

    case 'reprogramar':
      return {
        mensaje: `Entendido, ${nombre}. ¿Qué día y horario le queda mejor?`,
        siguienteEstado: CONV_ESTADOS.OFRECIENDO_HORARIOS,
        pipelineAction: null,
      }

    case 'cancelar':
      if (confianza < 0.6) {
        return {
          mensaje: `Hola ${nombre}, ¿quiso decir que no le interesa la inscripción de ${alumno} en este momento?`,
          siguienteEstado: CONV_ESTADOS.ESPERANDO_RESPUESTA,
          pipelineAction: null,
        }
      }
      return {
        mensaje: `Entendemos su decisión, ${nombre}. Si en el futuro desea inscribir a ${alumno}, puede contactarnos. Muchas gracias.`,
        siguienteEstado: CONV_ESTADOS.CANCELADA,
        pipelineAction: {
          tipo: 'transicionar',
          nuevoEstado: 'descartado',
          meta: { notas_seguimiento: 'Rechazó inscripción vía WhatsApp durante campaña.' },
        },
      }

    case 'preguntar_requisitos':
      return {
        mensaje: `Claro, ${nombre}. Los requisitos para la inscripción son:\n\n${docsToList()}\n\n¿Le gustaría agendar una cita para formalizar la inscripción de ${alumno}?`,
        siguienteEstado: CONV_ESTADOS.ESPERANDO_RESPUESTA,
        pipelineAction: null,
      }

    case 'consulta_general':
      return {
        mensaje: `Somos *El Sistema Punta Cana*, un programa de educación musical. Las inscripciones están abiertas.\n\nRequisitos:\n${docsToList()}\n\n¿Le gustaría agendar una cita para inscribir a ${alumno}?`,
        siguienteEstado: CONV_ESTADOS.ESPERANDO_RESPUESTA,
        pipelineAction: null,
      }

    case 'confirmar_asistencia':
      return {
        mensaje: `¡Perfecto, ${nombre}! Confirmamos su interés. ¿Qué día le gustaría agendar la cita?`,
        siguienteEstado: CONV_ESTADOS.OFRECIENDO_HORARIOS,
        pipelineAction: {
          tipo: 'transicionar',
          nuevoEstado: 'contactado',
          meta: { notas_seguimiento: 'Contacto vía WhatsApp — confirmó interés en campaña.' },
        },
      }

    case 'no_respuesta':
    default:
      if (ctx.reintentos >= REINTENTOS_MAX) {
        return {
          mensaje: null,
          siguienteEstado: CONV_ESTADOS.CANCELADA,
          pipelineAction: null,
        }
      }
      return {
        mensaje: `Hola ${nombre}, le escribimos de *El Sistema Punta Cana*. Hemos recibido la postulación de *${alumno}* y queremos coordinar su inscripción. ¿Le gustaría agendar una cita?`,
        siguienteEstado: CONV_ESTADOS.ESPERANDO_RESPUESTA,
        pipelineAction: null,
      }
  }
}

function handleOfreciendoHorarios(intencion: string, _confianza: number, fecha_sugerida: string | null, ctx: ConvCtx): Decision {
  const nombre = ctx.nombreRepresentante || 'estimado'

  switch (intencion) {
    case 'agendar_cita':
    case 'confirmar_asistencia':
      if (fecha_sugerida) {
        return {
          mensaje: `Perfecto, estamos verificando disponibilidad para *${formatearFecha(fecha_sugerida)}*. Le confirmamos en un momento.`,
          siguienteEstado: CONV_ESTADOS.AGENDANDO_CITA,
          pipelineAction: null,
        }
      }
      return {
        mensaje: `¿Qué día y horario le gustaría, ${nombre}? Tenemos disponible lunes a viernes de 8:00 a.m. a 4:00 p.m.`,
        siguienteEstado: CONV_ESTADOS.OFRECIENDO_HORARIOS,
        pipelineAction: null,
      }

    case 'reprogramar':
      return {
        mensaje: `Sin problema, ${nombre}. ¿Qué día y horario le queda mejor?`,
        siguienteEstado: CONV_ESTADOS.OFRECIENDO_HORARIOS,
        pipelineAction: null,
      }

    case 'preguntar_requisitos':
      return {
        mensaje: `Los requisitos son:\n\n${docsToList()}\n\nAhora, ¿qué día le gustaría venir para la cita?`,
        siguienteEstado: CONV_ESTADOS.OFRECIENDO_HORARIOS,
        pipelineAction: null,
      }

    case 'cancelar':
      return {
        mensaje: `Entendemos, ${nombre}. Si cambia de opinión, estamos a su disposición.`,
        siguienteEstado: CONV_ESTADOS.CANCELADA,
        pipelineAction: {
          tipo: 'transicionar',
          nuevoEstado: 'descartado',
          meta: { notas_seguimiento: 'Rechazó inscripción durante agendamiento vía WhatsApp.' },
        },
      }

    case 'no_respuesta':
    default:
      if (_confianza >= 0.3) {
        return {
          mensaje: `Hola ${nombre}, recordatorio de nuestro mensaje anterior. ¿Qué día le gustaría agendar la cita para la inscripción?`,
          siguienteEstado: CONV_ESTADOS.OFRECIENDO_HORARIOS,
          pipelineAction: null,
        }
      }
      return {
        mensaje: MSG_DEFAULT,
        siguienteEstado: CONV_ESTADOS.OFRECIENDO_HORARIOS,
        pipelineAction: null,
      }
  }
}

function handleAgendandoCita(intencion: string, confianza: number, _fecha_sugerida: string | null, ctx: ConvCtx): Decision {
  const nombre = ctx.nombreRepresentante || 'estimado'

  switch (intencion) {
    case 'agendar_cita':
    case 'confirmar_asistencia':
      if (confianza < 0.4) {
        return {
          mensaje: `¿Confirmamos la cita para ${ctx.fechaCitaActual ? formatearFecha(ctx.fechaCitaActual) : 'la fecha acordada'}, ${nombre}?`,
          siguienteEstado: CONV_ESTADOS.AGENDANDO_CITA,
          pipelineAction: null,
        }
      }
      return {
        mensaje: `✅ *Cita confirmada* para *${formatearFecha(ctx.fechaCitaActual!)}*.\n\n*Requisitos para la inscripción:*\n${docsToList()}\n\nPor favor, llegue 10 minutos antes. ¡Lo esperamos en El Sistema Punta Cana! 🎵`,
        siguienteEstado: CONV_ESTADOS.CONFIRMADA,
        pipelineAction: {
          tipo: 'agendar',
          nuevoEstado: 'cita_agendada',
          meta: { notas_seguimiento: `Cita agendada vía WhatsApp: ${formatearFecha(ctx.fechaCitaActual!)}.` },
        },
      }

    case 'reprogramar':
      return {
        mensaje: `Sin problema, ${nombre}. ¿Qué día y horario le queda mejor?`,
        siguienteEstado: CONV_ESTADOS.OFRECIENDO_HORARIOS,
        pipelineAction: {
          tipo: 'transicionar',
          nuevoEstado: 'reprogramado',
          meta: { notas_seguimiento: 'Reprogramación solicitada vía WhatsApp.' },
        },
      }

    case 'cancelar':
      return {
        mensaje: `Entendemos, ${nombre}. Si desea retomarlo, contáctenos.`,
        siguienteEstado: CONV_ESTADOS.CANCELADA,
        pipelineAction: {
          tipo: 'transicionar',
          nuevoEstado: 'descartado',
          meta: { notas_seguimiento: 'Canceló cita vía WhatsApp.' },
        },
      }

    case 'preguntar_requisitos':
      return {
        mensaje: `Los requisitos son:\n\n${docsToList()}\n\n¿Confirmamos su cita para el ${ctx.fechaCitaActual ? formatearFecha(ctx.fechaCitaActual) : 'la fecha acordada'}?`,
        siguienteEstado: CONV_ESTADOS.AGENDANDO_CITA,
        pipelineAction: null,
      }

    default:
      return {
        mensaje: MSG_DEFAULT,
        siguienteEstado: CONV_ESTADOS.AGENDANDO_CITA,
        pipelineAction: null,
      }
  }
}

function handleConfirmacionD1(intencion: string, _confianza: number, _fecha_sugerida: string | null, ctx: ConvCtx): Decision {
  const nombre = ctx.nombreRepresentante || 'estimado'
  const hora = ctx.fechaCitaActual ? formatearHora(ctx.fechaCitaActual) : 'la hora acordada'

  switch (intencion) {
    case 'confirmar_asistencia':
    case 'agendar_cita':
      return {
        mensaje: `¡Perfecto, ${nombre}! Los esperamos mañana a las *${hora}* en nuestra sede. No olvide traer:\n\n${docsToList()}\n\nCualquier cambio, avísenos.`,
        siguienteEstado: CONV_ESTADOS.CONFIRMADA,
        pipelineAction: {
          tipo: 'notificar',
          meta: { notas_seguimiento: 'Recordatorio D-1: confirmó asistencia.' },
        },
      }

    case 'reprogramar':
      return {
        mensaje: `Sin problema, ${nombre}. ¿Qué día y horario le queda mejor para reagendar?`,
        siguienteEstado: CONV_ESTADOS.OFRECIENDO_HORARIOS,
        pipelineAction: {
          tipo: 'transicionar',
          nuevoEstado: 'reprogramado',
          meta: { notas_seguimiento: 'Reprogramó cita desde recordatorio D-1 vía WhatsApp.' },
        },
      }

    case 'cancelar':
      return {
        mensaje: `Entendemos, ${nombre}. Si desea retomar el proceso, contáctenos.`,
        siguienteEstado: CONV_ESTADOS.CANCELADA,
        pipelineAction: {
          tipo: 'transicionar',
          nuevoEstado: 'descartado',
          meta: { notas_seguimiento: 'Canceló inscripción desde recordatorio D-1 vía WhatsApp.' },
        },
      }

    case 'no_respuesta':
    default:
      return {
        mensaje: `Hola ${nombre}, le recordamos que mañana tiene una cita en *El Sistema Punta Cana* a las *${hora}*.\n\n*Requisitos:*\n${docsToList()}\n\n¿Confirma su asistencia?`,
        siguienteEstado: CONV_ESTADOS.ESPERANDO_CONFIRMACION_D1,
        pipelineAction: null,
      }
  }
}

function handleConfirmada(_intencion: string, _confianza: number, _fecha_sugerida: string | null, ctx: ConvCtx): Decision {
  const nombre = ctx.nombreRepresentante || 'estimado'
  return {
    mensaje: `Gracias, ${nombre}. Su cita está confirmada para *${formatearFecha(ctx.fechaCitaActual!)}*. Estamos a su disposición.`,
    siguienteEstado: CONV_ESTADOS.CONFIRMADA,
    pipelineAction: null,
  }
}

function handleCancelada(): Decision {
  return {
    mensaje: null,
    siguienteEstado: CONV_ESTADOS.CANCELADA,
    pipelineAction: null,
  }
}

export function decidirAccion(
  conversacion: { estadoConversacion: string } & ConvCtx,
  intencion: { intencion: string; confianza: number; fecha_sugerida: string | null },
): Decision {
  const { estadoConversacion, ...ctx } = conversacion
  const { intencion: intento, confianza, fecha_sugerida } = intencion

  switch (estadoConversacion) {
    case CONV_ESTADOS.ESPERANDO_RESPUESTA:
      return handleRespuestaInicial(intento, confianza, fecha_sugerida, ctx)
    case CONV_ESTADOS.OFRECIENDO_HORARIOS:
      return handleOfreciendoHorarios(intento, confianza, fecha_sugerida, ctx)
    case CONV_ESTADOS.AGENDANDO_CITA:
      return handleAgendandoCita(intento, confianza, fecha_sugerida, ctx)
    case CONV_ESTADOS.ESPERANDO_CONFIRMACION_D1:
      return handleConfirmacionD1(intento, confianza, fecha_sugerida, ctx)
    case CONV_ESTADOS.CONFIRMADA:
      return handleConfirmada(intento, confianza, fecha_sugerida, ctx)
    case CONV_ESTADOS.CANCELADA:
      return handleCancelada()
    default:
      return {
        mensaje: MSG_DEFAULT,
        siguienteEstado: estadoConversacion || CONV_ESTADOS.ESPERANDO_RESPUESTA,
        pipelineAction: null,
      }
  }
}

export function conflictoToMensaje(nombre: string, alternativas: string[]): string {
  const nombreFmt = nombre || 'estimado'
  const alternativasStr = Array.isArray(alternativas) && alternativas.length > 0
    ? `\n\nHorarios disponibles:\n${alternativas.map(a => `• ${formatearFecha(a)}`).join('\n')}`
    : ''
  return `Lo sentimos, ${nombreFmt}, ese horario no está disponible.${alternativasStr}\n\n¿Qué otro día le queda bien?`
}
