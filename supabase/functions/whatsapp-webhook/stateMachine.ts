import { formatearFecha, formatearHora, docsToList, DOCS_REQUERIDOS } from './formatHelpers.ts'

export const CONV_ESTADOS = {
  ESPERANDO_RESPUESTA: 'esperando_respuesta_campania',
  PREGUNTANDO_PROGRAMA: 'preguntando_programa',
  PREGUNTANDO_TURNO: 'preguntando_turno',
  OFRECIENDO_HORARIOS: 'ofreciendo_horarios',
  AGENDANDO_CITA: 'agendando_cita',
  REQUISITOS: 'respondiendo_requisitos',
  REPROGRAMANDO: 'reprogramando_cita',
  CONFIRMADA: 'cita_confirmada',
  ESPERANDO_CONFIRMACION_D1: 'esperando_confirmacion_d1',
  FINALIZADO: 'conversacion_finalizada',
  CANCELADA: 'cancelada',
} as const

export type ConvEstado = (typeof CONV_ESTADOS)[keyof typeof CONV_ESTADOS]

export const REINTENTOS_MAX = 2

interface ConvCtx {
  nombreRepresentante: string
  nombreAlumno: string
  fechaCitaActual: string | null
  reintentos: number
  programa?: string
  turno?: string
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

function resolverNombre(ctx: ConvCtx): string {
  return ctx.nombreRepresentante || 'estimado'
}

function resolverAlumno(ctx: ConvCtx): string {
  return ctx.nombreAlumno || 'su hijo(a)'
}

const MSG_DEFAULT = 'Gracias por comunicarse con El Sistema Punta Cana. Pronto le daremos seguimiento.'

function handleRespuestaInicial(intencion: string, confianza: number, _fecha_sugerida: string | null, ctx: ConvCtx): Decision {
  const nombre = resolverNombre(ctx)
  const alumno = resolverAlumno(ctx)

  // Helper para despido institucional
  const despedida: Decision = {
    mensaje: `Estamos siempre a la orden. Tocamos Vidas y Cambiamos Corazones.\n\nPuede seguir nuestro camino musical por Instagram @elsistema_puntacana`,
    siguienteEstado: CONV_ESTADOS.CANCELADA,
    pipelineAction: {
      tipo: 'transicionar',
      nuevoEstado: 'descartado',
      meta: { notas_seguimiento: 'Rechazó inscripción vía WhatsApp.' },
    },
  }

  switch (intencion) {
    case 'agendar_cita':
    case 'confirmar_asistencia':
      if (confianza < 0.4) {
        return {
          mensaje: `¿Le interesa formalizar la inscripción de ${alumno}, ${nombre}?`,
          siguienteEstado: CONV_ESTADOS.ESPERANDO_RESPUESTA,
          pipelineAction: null,
        }
      }
      // Mensaje [1] — confirmado interés → preguntar programa
      return {
        mensaje: `Nos complace saber esta información. Para poder continuar necesitamos agendar una cita para formalizar la inscripción del alumno.\n\nContamos con los siguientes programas:\n\n🎻 Orquesta Sinfónica\n🎶 Coro\n🎹 Iniciación Musical\n🎹 Clases de Piano\n\n¿Cuál le interesa?`,
        siguienteEstado: CONV_ESTADOS.PREGUNTANDO_PROGRAMA,
        pipelineAction: {
          tipo: 'transicionar',
          nuevoEstado: 'contactado',
          meta: { notas_seguimiento: 'Contacto vía WhatsApp — respuesta positiva a campaña.' },
        },
      }

    case 'reprogramar':
      return {
        mensaje: `Entendido, ${nombre}. ¿Qué día y horario le queda mejor?`,
        siguienteEstado: CONV_ESTADOS.REPROGRAMANDO,
        pipelineAction: null,
      }

    case 'cancelar':
      return despedida

    case 'preguntar_requisitos':
      return {
        mensaje: `Claro. Los requisitos son:\n\n• Copia de la Cédula del Representante.\n• Certificado o constancia de estudios.\n• Acta de nacimiento del alumno.\n\n¿Le gustaría agendar una cita para formalizar la inscripción de ${alumno}?`,
        siguienteEstado: CONV_ESTADOS.REQUISITOS,
        pipelineAction: null,
      }

    case 'consulta_general':
      return {
        mensaje: `Somos un programa de educación musical. Las inscripciones están abiertas.\n\nRequisitos:\n• Copia de la Cédula del Representante.\n• Certificado o constancia de estudios.\n• Acta de nacimiento del alumno.\n\n¿Le gustaría agendar una cita para inscribir a ${alumno}?`,
        siguienteEstado: CONV_ESTADOS.ESPERANDO_RESPUESTA,
        pipelineAction: null,
      }

    case 'agradecimiento':
    case 'despedida':
      return {
        mensaje: `¡Gracias a usted, ${nombre}! Si necesita algo más, estamos para servirle.`,
        siguienteEstado: CONV_ESTADOS.FINALIZADO,
        pipelineAction: null,
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
        mensaje: `Saludos, ${nombre}. Le escribimos desde El Sistema Punta Cana. Hemos obtenido sus datos desde la lista de espera, después de haber llenado el formulario de Postulación.\n\n¿Mantiene el interés de formar parte de nuestra institución musical, para poder continuar con la etapa de inscripción?`,
        siguienteEstado: CONV_ESTADOS.ESPERANDO_RESPUESTA,
        pipelineAction: null,
      }
  }
}

function handlePreguntandoPrograma(intencion: string, confianza: number, _fecha_sugerida: string | null, ctx: ConvCtx): Decision {
  const nombre = resolverNombre(ctx)
  const text = intencion.toLowerCase()

  // Detectar programa
  let programa: string | null = null
  if (text.includes('orquesta')) programa = 'Orquesta Sinfónica'
  else if (text.includes('coro')) programa = 'Coro'
  else if (text.includes('iniciación') || text.includes('iniciacion')) programa = 'Iniciación Musical'
  else if (text.includes('piano')) programa = 'Piano'

  if (programa) {
    // Ir directo a pedir turno
    return {
      mensaje: `Excelente, ${programa}. Tenemos dos turnos disponibles:\n\n🌅 Mañana: 9:00 a.m. a 12:00 p.m.\n🌇 Tarde: 3:30 p.m. a 6:30 p.m.\n\n¿Cuál prefiere?`,
      siguienteEstado: CONV_ESTADOS.PREGUNTANDO_TURNO,
      pipelineAction: {
        tipo: 'transicionar',
        nuevoEstado: 'contactado',
        meta: { programa },
      },
    }
  }

  // No detectó programa → insistir
  if (confianza < 0.4) {
    return {
      mensaje: `¿Cuál de nuestros programas le interesa? Tenemos:\n\n🎻 Orquesta Sinfónica\n🎶 Coro\n🎹 Iniciación Musical\n🎹 Clases de Piano`,
      siguienteEstado: CONV_ESTADOS.PREGUNTANDO_PROGRAMA,
      pipelineAction: null,
    }
  }

  return {
    mensaje: `No terminé de entender. Nuestros programas son:\n\n🎻 Orquesta Sinfónica\n🎶 Coro\n🎹 Iniciación Musical\n🎹 Clases de Piano\n\n¿Cuál le interesa?`,
    siguienteEstado: CONV_ESTADOS.PREGUNTANDO_PROGRAMA,
    pipelineAction: null,
  }
}

function handlePreguntandoTurno(intencion: string, confianza: number, _fecha_sugerida: string | null, ctx: ConvCtx): Decision {
  const nombre = resolverNombre(ctx)
  const text = intencion.toLowerCase()

  let turno: string | null = null
  if (text.includes('mañana') || text.includes('manana')) turno = 'Mañana (9am–12pm)'
  else if (text.includes('tarde')) turno = 'Tarde (3:30pm–6:30pm)'

  if (turno) {
    // Ahora sí pedir fecha
    return {
      mensaje: `Perfecto. Ahora necesitamos saber su disponibilidad para la cita.\n\nDebe presentarse con los siguientes requisitos:\n\n• Copia de la Cédula del Representante.\n• Certificado o constancia de estudios.\n• Acta de nacimiento del alumno.\n\n¿Qué día y horario le queda bien? Trabajamos de lunes a viernes de 8:00 a.m. a 4:00 p.m.`,
      siguienteEstado: CONV_ESTADOS.OFRECIENDO_HORARIOS,
      pipelineAction: {
        tipo: 'transicionar',
        nuevoEstado: 'contactado',
        meta: { turno },
      },
    }
  }

  if (confianza < 0.4) {
    return {
      mensaje: `¿Prefiere el turno de la mañana (9am a 12pm) o el de la tarde (3:30pm a 6:30pm)?`,
      siguienteEstado: CONV_ESTADOS.PREGUNTANDO_TURNO,
      pipelineAction: null,
    }
  }

  return {
    mensaje: `Nuestros turnos son:\n\n🌅 Mañana: 9:00 a.m. a 12:00 p.m.\n🌇 Tarde: 3:30 p.m. a 6:30 p.m.\n\n¿Cuál prefiere?`,
    siguienteEstado: CONV_ESTADOS.PREGUNTANDO_TURNO,
    pipelineAction: null,
  }
}

function handleOfreciendoHorarios(intencion: string, _confianza: number, fecha_sugerida: string | null, ctx: ConvCtx): Decision {
  const nombre = resolverNombre(ctx)

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
        siguienteEstado: CONV_ESTADOS.REPROGRAMANDO,
        pipelineAction: null,
      }

    case 'preguntar_requisitos':
      return {
        mensaje: `Los requisitos son:\n\n${docsToList()}\n\nAhora, ¿qué día le gustaría venir para la cita?`,
        siguienteEstado: CONV_ESTADOS.REQUISITOS,
        pipelineAction: null,
      }

    case 'cancelar':
      return {
        mensaje: `Estamos siempre a la orden. Tocamos Vidas y Cambiamos Corazones.\n\nPuede seguir nuestro camino musical por Instagram @elsistema_puntacana`,
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
          mensaje: `${nombre}, recordatorio de nuestro mensaje anterior. ¿Qué día le gustaría agendar la cita para la inscripción?`,
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

function handleAgendandoCita(intencion: string, confianza: number, fecha_sugerida: string | null, ctx: ConvCtx): Decision {
  const nombre = resolverNombre(ctx)

  switch (intencion) {
    case 'agendar_cita':
    case 'confirmar_asistencia':
      if (confianza < 0.4 || !ctx.fechaCitaActual) {
        return {
          mensaje: `¿Confirmamos la cita para ${ctx.fechaCitaActual ? formatearFecha(ctx.fechaCitaActual) : 'la fecha acordada'}, ${nombre}?`,
          siguienteEstado: CONV_ESTADOS.AGENDANDO_CITA,
          pipelineAction: null,
        }
      }
      return {
        mensaje: `✅ *Cita confirmada* para *${formatearFecha(ctx.fechaCitaActual)}*.\n\n*Requisitos para la inscripción:*\n${docsToList()}\n\nPor favor, llegue 10 minutos antes. ¡Lo esperamos en El Sistema Punta Cana! 🎵`,
        siguienteEstado: CONV_ESTADOS.CONFIRMADA,
        pipelineAction: {
          tipo: 'agendar',
          nuevoEstado: 'cita_agendada',
          meta: { notas_seguimiento: `Cita agendada vía WhatsApp: ${formatearFecha(ctx.fechaCitaActual)}.` },
        },
      }

    case 'reprogramar':
      if (fecha_sugerida) {
        return {
          mensaje: `Entendido, ${nombre}. Vamos a verificar disponibilidad para *${formatearFecha(fecha_sugerida)}*.`,
          siguienteEstado: CONV_ESTADOS.AGENDANDO_CITA,
          pipelineAction: null,
        }
      }
      return {
        mensaje: `Sin problema, ${nombre}. ¿Qué día y horario le queda mejor?`,
        siguienteEstado: CONV_ESTADOS.REPROGRAMANDO,
        pipelineAction: {
          tipo: 'transicionar',
          nuevoEstado: 'reprogramado',
          meta: { notas_seguimiento: 'Reprogramación solicitada vía WhatsApp.' },
        },
      }

    case 'cancelar':
      return {
        mensaje: `Estamos siempre a la orden. Tocamos Vidas y Cambiamos Corazones.\n\nPuede seguir nuestro camino musical por Instagram @elsistema_puntacana`,
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
        siguienteEstado: CONV_ESTADOS.REQUISITOS,
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

function handleRequisitos(intencion: string, confianza: number, fecha_sugerida: string | null, ctx: ConvCtx): Decision {
  const nombre = resolverNombre(ctx)
  const alumno = resolverAlumno(ctx)

  switch (intencion) {
    case 'agendar_cita':
    case 'confirmar_asistencia':
      if (fecha_sugerida) {
        return {
          mensaje: `Perfecto, verificamos disponibilidad para *${formatearFecha(fecha_sugerida)}*.`,
          siguienteEstado: CONV_ESTADOS.AGENDANDO_CITA,
          pipelineAction: null,
        }
      }
      if (confianza >= 0.5) {
        return {
          mensaje: `¡Excelente! ¿Qué día y horario le gustaría, ${nombre}?`,
          siguienteEstado: CONV_ESTADOS.OFRECIENDO_HORARIOS,
          pipelineAction: null,
        }
      }
      return {
        mensaje: `¿Le gustaría agendar una cita para inscribir a ${alumno}, ${nombre}?`,
        siguienteEstado: CONV_ESTADOS.REQUISITOS,
        pipelineAction: null,
      }

    case 'preguntar_requisitos':
      return {
        mensaje: `Claro, los requisitos son:\n\n${docsToList()}\n\n¿Le gustaría agendar una cita?`,
        siguienteEstado: CONV_ESTADOS.REQUISITOS,
        pipelineAction: null,
      }

    case 'reprogramar':
      return {
        mensaje: `Entendido, ${nombre}. ¿Qué día le queda mejor?`,
        siguienteEstado: CONV_ESTADOS.REPROGRAMANDO,
        pipelineAction: null,
      }

    case 'cancelar':
      return {
        mensaje: `Estamos siempre a la orden. Tocamos Vidas y Cambiamos Corazones.\n\nPuede seguir nuestro camino musical por Instagram @elsistema_puntacana`,
        siguienteEstado: CONV_ESTADOS.CANCELADA,
        pipelineAction: {
          tipo: 'transicionar',
          nuevoEstado: 'descartado',
          meta: { notas_seguimiento: 'Rechazó inscripción después de consultar requisitos vía WhatsApp.' },
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
        mensaje: `${nombre}, ¿tuvo oportunidad de revisar los requisitos? ¿Le gustaría agendar una cita para inscribir a ${alumno}?`,
        siguienteEstado: CONV_ESTADOS.REQUISITOS,
        pipelineAction: null,
      }
  }
}

function handleReprogramando(intencion: string, confianza: number, fecha_sugerida: string | null, ctx: ConvCtx): Decision {
  const nombre = resolverNombre(ctx)

  switch (intencion) {
    case 'agendar_cita':
    case 'confirmar_asistencia':
      if (fecha_sugerida) {
        return {
          mensaje: `Perfecto, verificamos disponibilidad para *${formatearFecha(fecha_sugerida)}*.`,
          siguienteEstado: CONV_ESTADOS.AGENDANDO_CITA,
          pipelineAction: null,
        }
      }
      return {
        mensaje: `¿Qué día y horario le queda mejor, ${nombre}?`,
        siguienteEstado: CONV_ESTADOS.REPROGRAMANDO,
        pipelineAction: null,
      }

    case 'preguntar_requisitos':
      return {
        mensaje: `Los requisitos son:\n\n${docsToList()}\n\nAhora, ¿para qué día le gustaría reprogramar?`,
        siguienteEstado: CONV_ESTADOS.REQUISITOS,
        pipelineAction: null,
      }

    case 'cancelar':
      return {
        mensaje: `Estamos siempre a la orden. Tocamos Vidas y Cambiamos Corazones.\n\nPuede seguir nuestro camino musical por Instagram @elsistema_puntacana`,
        siguienteEstado: CONV_ESTADOS.CANCELADA,
        pipelineAction: {
          tipo: 'transicionar',
          nuevoEstado: 'descartado',
          meta: { notas_seguimiento: 'Canceló reprogramación vía WhatsApp.' },
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
        mensaje: `${nombre}, ¿qué día le gustaría reagendar la cita para la inscripción?`,
        siguienteEstado: CONV_ESTADOS.REPROGRAMANDO,
        pipelineAction: null,
      }
  }
}

function handleConfirmacionD1(intencion: string, _confianza: number, _fecha_sugerida: string | null, ctx: ConvCtx): Decision {
  const nombre = resolverNombre(ctx)
  const hora = ctx.fechaCitaActual ? formatearHora(ctx.fechaCitaActual) : 'la hora acordada'

  switch (intencion) {
    case 'confirmar_asistencia':
    case 'agendar_cita':
      return {
        mensaje: `¡Perfecto, ${nombre}! Los esperamos mañana a las *${hora}* en nuestra sede. No olvide traer:\n\n${docsToList()}\n\nCualquier cambio, avísenos.`,
        siguienteEstado: CONV_ESTADOS.FINALIZADO,
        pipelineAction: {
          tipo: 'notificar',
          meta: { notas_seguimiento: 'Recordatorio D-1: confirmó asistencia.' },
        },
      }

    case 'reprogramar':
      return {
        mensaje: `Sin problema, ${nombre}. ¿Qué día y horario le queda mejor para reagendar?`,
        siguienteEstado: CONV_ESTADOS.REPROGRAMANDO,
        pipelineAction: {
          tipo: 'transicionar',
          nuevoEstado: 'reprogramado',
          meta: { notas_seguimiento: 'Reprogramó cita desde recordatorio D-1 vía WhatsApp.' },
        },
      }

    case 'cancelar':
      return {
        mensaje: `Estamos siempre a la orden. Tocamos Vidas y Cambiamos Corazones.\n\nPuede seguir nuestro camino musical por Instagram @elsistema_puntacana`,
        siguienteEstado: CONV_ESTADOS.CANCELADA,
        pipelineAction: {
          tipo: 'transicionar',
          nuevoEstado: 'descartado',
          meta: { notas_seguimiento: 'Canceló inscripción desde recordatorio D-1 vía WhatsApp.' },
        },
      }

    case 'preguntar_requisitos':
      return {
        mensaje: `Los requisitos son:\n\n${docsToList()}\n\n¿Confirma su asistencia para mañana a las *${hora}*?`,
        siguienteEstado: CONV_ESTADOS.ESPERANDO_CONFIRMACION_D1,
        pipelineAction: null,
      }

    case 'no_respuesta':
    default:
      return {
        mensaje: `${nombre}, le recordamos que mañana tiene una cita a las *${hora}*.\n\nRequisitos:\n${docsToList()}\n\n¿Confirma su asistencia?`,
        siguienteEstado: CONV_ESTADOS.ESPERANDO_CONFIRMACION_D1,
        pipelineAction: null,
      }
  }
}

function handleConfirmada(intencion: string, _confianza: number, _fecha_sugerida: string | null, ctx: ConvCtx): Decision {
  const nombre = resolverNombre(ctx)
  const fecha = ctx.fechaCitaActual ? formatearFecha(ctx.fechaCitaActual) : 'la fecha acordada'

  switch (intencion) {
    case 'confirmar_asistencia':
    case 'agendar_cita':
      return {
        mensaje: `Su cita ya está confirmada para *${fecha}*.`,
        siguienteEstado: CONV_ESTADOS.CONFIRMADA,
        pipelineAction: null,
      }

    case 'reprogramar':
      return {
        mensaje: `Sin problema, ${nombre}. ¿Qué día y horario le queda mejor?`,
        siguienteEstado: CONV_ESTADOS.REPROGRAMANDO,
        pipelineAction: {
          tipo: 'transicionar',
          nuevoEstado: 'reprogramado',
          meta: { notas_seguimiento: 'Solicitó reprogramación desde estado confirmado vía WhatsApp.' },
        },
      }

    case 'cancelar':
      return {
        mensaje: `Entendemos, ${nombre}. Si desea retomarlo, puede contactarnos cuando guste.`,
        siguienteEstado: CONV_ESTADOS.CANCELADA,
        pipelineAction: {
          tipo: 'transicionar',
          nuevoEstado: 'descartado',
          meta: { notas_seguimiento: 'Canceló cita confirmada vía WhatsApp.' },
        },
      }

    case 'preguntar_requisitos':
      return {
        mensaje: `Los requisitos para la inscripción son:\n\n${docsToList()}\n\nSu cita sigue confirmada para *${fecha}*.`,
        siguienteEstado: CONV_ESTADOS.CONFIRMADA,
        pipelineAction: null,
      }

    case 'agradecimiento':
    case 'despedida':
    case 'no_respuesta':
    default:
      return {
        mensaje: null,
        siguienteEstado: CONV_ESTADOS.CONFIRMADA,
        pipelineAction: null,
      }
  }
}

function handleFinalizado(_intencion: string, _confianza: number, _fecha_sugerida: string | null, ctx: ConvCtx): Decision {
  return {
    mensaje: null,
    siguienteEstado: CONV_ESTADOS.FINALIZADO,
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
    case CONV_ESTADOS.PREGUNTANDO_PROGRAMA:
      return handlePreguntandoPrograma(intento, confianza, fecha_sugerida, ctx)
    case CONV_ESTADOS.PREGUNTANDO_TURNO:
      return handlePreguntandoTurno(intento, confianza, fecha_sugerida, ctx)
    case CONV_ESTADOS.OFRECIENDO_HORARIOS:
      return handleOfreciendoHorarios(intento, confianza, fecha_sugerida, ctx)
    case CONV_ESTADOS.AGENDANDO_CITA:
      return handleAgendandoCita(intento, confianza, fecha_sugerida, ctx)
    case CONV_ESTADOS.REQUISITOS:
      return handleRequisitos(intento, confianza, fecha_sugerida, ctx)
    case CONV_ESTADOS.REPROGRAMANDO:
      return handleReprogramando(intento, confianza, fecha_sugerida, ctx)
    case CONV_ESTADOS.ESPERANDO_CONFIRMACION_D1:
      return handleConfirmacionD1(intento, confianza, fecha_sugerida, ctx)
    case CONV_ESTADOS.CONFIRMADA:
      return handleConfirmada(intento, confianza, fecha_sugerida, ctx)
    case CONV_ESTADOS.FINALIZADO:
      return handleFinalizado(intento, confianza, fecha_sugerida, ctx)
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
