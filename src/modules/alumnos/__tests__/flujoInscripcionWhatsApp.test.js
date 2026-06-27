import { describe, it, expect } from 'vitest'
import {
  decidirAccion,
  CONV_ESTADOS,
  REINTENTOS_MAX,
  conflictoToMensaje,
} from '../domain/flujoInscripcionWhatsApp.js'
import { INTENCIONES } from '../domain/intencionParser.js'

const CONTEXTO_BASE = {
  nombreRepresentante: 'María',
  nombreAlumno: 'Carlitos',
  fechaCitaActual: '2026-07-10T10:00:00.000Z',
  reintentos: 0,
}

describe('decidirAccion', () => {
  describe('estado: esperando_respuesta_campania', () => {
    it('agendar_cita con confianza alta → ofrece horarios y transiciona a contactado', () => {
      const r = decidirAccion(
        { ...CONTEXTO_BASE, estadoConversacion: CONV_ESTADOS.ESPERANDO_RESPUESTA },
        { intencion: INTENCIONES.AGENDAR_CITA, confianza: 0.95, fecha_sugerida: null, argumento: null },
      )
      expect(r.siguienteEstado).toBe('ofreciendo_horarios')
      expect(r.pipelineAction).not.toBeNull()
      expect(r.pipelineAction.tipo).toBe('transicionar')
      expect(r.pipelineAction.nuevoEstado).toBe('contactado')
      expect(r.mensaje).toContain('8:00')
    })

    it('cancelar con confianza alta → cancelada y descarta postulante', () => {
      const r = decidirAccion(
        { ...CONTEXTO_BASE, estadoConversacion: CONV_ESTADOS.ESPERANDO_RESPUESTA },
        { intencion: INTENCIONES.CANCELAR, confianza: 0.9, fecha_sugerida: null, argumento: null },
      )
      expect(r.siguienteEstado).toBe('cancelada')
      expect(r.pipelineAction.nuevoEstado).toBe('descartado')
    })

    it('cancelar con confianza baja → pregunta confirmación sin transicionar', () => {
      const r = decidirAccion(
        { ...CONTEXTO_BASE, estadoConversacion: CONV_ESTADOS.ESPERANDO_RESPUESTA },
        { intencion: INTENCIONES.CANCELAR, confianza: 0.3, fecha_sugerida: null, argumento: null },
      )
      expect(r.siguienteEstado).toBe('esperando_respuesta_campania')
      expect(r.pipelineAction).toBeNull()
      expect(r.mensaje).toContain('¿quiso decir')
    })

    it('preguntar_requisitos → responde docs sin transicionar', () => {
      const r = decidirAccion(
        { ...CONTEXTO_BASE, estadoConversacion: CONV_ESTADOS.ESPERANDO_RESPUESTA },
        { intencion: INTENCIONES.PREGUNTAR_REQUISITOS, confianza: 0.9, fecha_sugerida: null, argumento: null },
      )
      expect(r.siguienteEstado).toBe('esperando_respuesta_campania')
      expect(r.pipelineAction).toBeNull()
      expect(r.mensaje).toContain('Cédula del representante')
      expect(r.mensaje).toContain('agendar una cita')
    })

    it('consulta_general → responde info y pregunta por cita', () => {
      const r = decidirAccion(
        { ...CONTEXTO_BASE, estadoConversacion: CONV_ESTADOS.ESPERANDO_RESPUESTA },
        { intencion: INTENCIONES.CONSULTA_GENERAL, confianza: 0.8, fecha_sugerida: null, argumento: null },
      )
      expect(r.siguienteEstado).toBe('esperando_respuesta_campania')
      expect(r.mensaje).toContain('El Sistema Punta Cana')
    })

    it('no_respuesta con reintentos bajos → reenvía campaña', () => {
      const r = decidirAccion(
        { ...CONTEXTO_BASE, estadoConversacion: CONV_ESTADOS.ESPERANDO_RESPUESTA, reintentos: 0 },
        { intencion: INTENCIONES.NO_RESPUESTA, confianza: 0, fecha_sugerida: null, argumento: null },
      )
      expect(r.siguienteEstado).toBe('esperando_respuesta_campania')
      expect(r.mensaje).toContain('Carlitos')
    })

    it('no_respuesta con reintentos máximos → cierra sin mensaje', () => {
      const r = decidirAccion(
        { ...CONTEXTO_BASE, estadoConversacion: CONV_ESTADOS.ESPERANDO_RESPUESTA, reintentos: REINTENTOS_MAX },
        { intencion: INTENCIONES.NO_RESPUESTA, confianza: 0, fecha_sugerida: null, argumento: null },
      )
      expect(r.siguienteEstado).toBe('cancelada')
      expect(r.mensaje).toBeNull()
    })

    it('agendar_cita con confianza baja → pide confirmación sin transicionar', () => {
      const r = decidirAccion(
        { ...CONTEXTO_BASE, estadoConversacion: CONV_ESTADOS.ESPERANDO_RESPUESTA },
        { intencion: INTENCIONES.AGENDAR_CITA, confianza: 0.3, fecha_sugerida: null, argumento: null },
      )
      expect(r.siguienteEstado).toBe('esperando_respuesta_campania')
      expect(r.pipelineAction).toBeNull()
      expect(r.mensaje).toContain('¿Le gustaría agendar')
    })
  })

  describe('estado: ofreciendo_horarios', () => {
    it('agendar_cita con fecha → pasa a verificación de disponibilidad', () => {
      const r = decidirAccion(
        { ...CONTEXTO_BASE, estadoConversacion: CONV_ESTADOS.OFRECIENDO_HORARIOS },
        { intencion: INTENCIONES.AGENDAR_CITA, confianza: 0.9, fecha_sugerida: '2026-07-15T09:00:00.000Z', argumento: null },
      )
      expect(r.siguienteEstado).toBe('agendando_cita')
      expect(r.mensaje).toContain('verificando disponibilidad')
    })

    it('agendar_cita sin fecha → pide día y horario', () => {
      const r = decidirAccion(
        { ...CONTEXTO_BASE, estadoConversacion: CONV_ESTADOS.OFRECIENDO_HORARIOS },
        { intencion: INTENCIONES.AGENDAR_CITA, confianza: 0.9, fecha_sugerida: null, argumento: null },
      )
      expect(r.siguienteEstado).toBe('ofreciendo_horarios')
      expect(r.mensaje).toContain('día y horario')
    })

    it('reprogramar → ofrece alternativas', () => {
      const r = decidirAccion(
        { ...CONTEXTO_BASE, estadoConversacion: CONV_ESTADOS.OFRECIENDO_HORARIOS },
        { intencion: INTENCIONES.REPROGRAMAR, confianza: 0.8, fecha_sugerida: null, argumento: null },
      )
      expect(r.siguienteEstado).toBe('ofreciendo_horarios')
      expect(r.mensaje).toContain('Sin problema')
    })

    it('cancelar → descarta', () => {
      const r = decidirAccion(
        { ...CONTEXTO_BASE, estadoConversacion: CONV_ESTADOS.OFRECIENDO_HORARIOS },
        { intencion: INTENCIONES.CANCELAR, confianza: 0.9, fecha_sugerida: null, argumento: null },
      )
      expect(r.siguienteEstado).toBe('cancelada')
      expect(r.pipelineAction.nuevoEstado).toBe('descartado')
    })

    it('preguntar_requisitos → responde docs y vuelve al flujo', () => {
      const r = decidirAccion(
        { ...CONTEXTO_BASE, estadoConversacion: CONV_ESTADOS.OFRECIENDO_HORARIOS },
        { intencion: INTENCIONES.PREGUNTAR_REQUISITOS, confianza: 0.9, fecha_sugerida: null, argumento: null },
      )
      expect(r.siguienteEstado).toBe('ofreciendo_horarios')
      expect(r.mensaje).toContain('Cédula')
    })
  })

  describe('estado: agendando_cita', () => {
    it('confirma cita → pipelineAction tipo agendar', () => {
      const r = decidirAccion(
        { ...CONTEXTO_BASE, estadoConversacion: CONV_ESTADOS.AGENDANDO_CITA, fechaCitaActual: '2026-07-10T10:00:00.000Z' },
        { intencion: INTENCIONES.CONFIRMAR_ASISTENCIA, confianza: 0.9, fecha_sugerida: null, argumento: null },
      )
      expect(r.siguienteEstado).toBe('cita_confirmada')
      expect(r.pipelineAction.tipo).toBe('agendar')
      expect(r.pipelineAction.nuevoEstado).toBe('cita_agendada')
      expect(r.mensaje).toContain('Cédula')
    })

    it('reprogramar → transiciona a reprogramado y ofrece horarios', () => {
      const r = decidirAccion(
        { ...CONTEXTO_BASE, estadoConversacion: CONV_ESTADOS.AGENDANDO_CITA },
        { intencion: INTENCIONES.REPROGRAMAR, confianza: 0.8, fecha_sugerida: null, argumento: null },
      )
      expect(r.siguienteEstado).toBe('ofreciendo_horarios')
      expect(r.pipelineAction.nuevoEstado).toBe('reprogramado')
    })

    it('cancelar → descarta', () => {
      const r = decidirAccion(
        { ...CONTEXTO_BASE, estadoConversacion: CONV_ESTADOS.AGENDANDO_CITA },
        { intencion: INTENCIONES.CANCELAR, confianza: 0.9, fecha_sugerida: null, argumento: null },
      )
      expect(r.siguienteEstado).toBe('cancelada')
      expect(r.pipelineAction.nuevoEstado).toBe('descartado')
    })

    it('confirmar con confianza baja → pide confirmación explícita', () => {
      const r = decidirAccion(
        { ...CONTEXTO_BASE, estadoConversacion: CONV_ESTADOS.AGENDANDO_CITA, fechaCitaActual: '2026-07-10T10:00:00.000Z' },
        { intencion: INTENCIONES.CONFIRMAR_ASISTENCIA, confianza: 0.3, fecha_sugerida: null, argumento: null },
      )
      expect(r.siguienteEstado).toBe('agendando_cita')
      expect(r.pipelineAction).toBeNull()
      expect(r.mensaje).toContain('Confirmamos')
    })
  })

  describe('estado: esperando_confirmacion_d1', () => {
    it('confirma asistencia → notifica sin transicionar pipeline', () => {
      const r = decidirAccion(
        { ...CONTEXTO_BASE, estadoConversacion: CONV_ESTADOS.ESPERANDO_CONFIRMACION_D1, fechaCitaActual: '2026-07-10T10:00:00.000Z' },
        { intencion: INTENCIONES.CONFIRMAR_ASISTENCIA, confianza: 0.9, fecha_sugerida: null, argumento: null },
      )
      expect(r.siguienteEstado).toBe('cita_confirmada')
      expect(r.pipelineAction.tipo).toBe('notificar')
      expect(r.mensaje).toContain('mañana')
      expect(r.mensaje).toContain('Cédula')
    })

    it('reprogramar → reprogramado y ofrece horarios', () => {
      const r = decidirAccion(
        { ...CONTEXTO_BASE, estadoConversacion: CONV_ESTADOS.ESPERANDO_CONFIRMACION_D1 },
        { intencion: INTENCIONES.REPROGRAMAR, confianza: 0.8, fecha_sugerida: null, argumento: null },
      )
      expect(r.siguienteEstado).toBe('ofreciendo_horarios')
      expect(r.pipelineAction.nuevoEstado).toBe('reprogramado')
    })

    it('cancelar → descarta', () => {
      const r = decidirAccion(
        { ...CONTEXTO_BASE, estadoConversacion: CONV_ESTADOS.ESPERANDO_CONFIRMACION_D1 },
        { intencion: INTENCIONES.CANCELAR, confianza: 0.9, fecha_sugerida: null, argumento: null },
      )
      expect(r.siguienteEstado).toBe('cancelada')
      expect(r.pipelineAction.nuevoEstado).toBe('descartado')
    })

    it('no_respuesta → reenvía recordatorio', () => {
      const r = decidirAccion(
        { ...CONTEXTO_BASE, estadoConversacion: CONV_ESTADOS.ESPERANDO_CONFIRMACION_D1, fechaCitaActual: '2026-07-10T10:00:00.000Z' },
        { intencion: INTENCIONES.NO_RESPUESTA, confianza: 0, fecha_sugerida: null, argumento: null },
      )
      expect(r.siguienteEstado).toBe('esperando_confirmacion_d1')
      expect(r.mensaje).toContain('recordamos')
      expect(r.mensaje).toMatch(/mañana.*cita/)
    })
  })

  describe('estados terminales', () => {
    it('confirmada → responde genérico sin acciones', () => {
      const r = decidirAccion(
        { ...CONTEXTO_BASE, estadoConversacion: CONV_ESTADOS.CONFIRMADA },
        { intencion: INTENCIONES.NO_RESPUESTA, confianza: 0, fecha_sugerida: null, argumento: null },
      )
      expect(r.siguienteEstado).toBe('cita_confirmada')
      expect(r.pipelineAction).toBeNull()
    })

    it('cancelada → no envía mensaje', () => {
      const r = decidirAccion(
        { ...CONTEXTO_BASE, estadoConversacion: CONV_ESTADOS.CANCELADA },
        { intencion: INTENCIONES.NO_RESPUESTA, confianza: 0, fecha_sugerida: null, argumento: null },
      )
      expect(r.siguienteEstado).toBe('cancelada')
      expect(r.mensaje).toBeNull()
    })
  })

  describe('estado desconocido', () => {
    it('fallback a mensaje genérico', () => {
      const r = decidirAccion(
        { ...CONTEXTO_BASE, estadoConversacion: 'estado_que_no_existe' },
        { intencion: INTENCIONES.NO_RESPUESTA, confianza: 0, fecha_sugerida: null, argumento: null },
      )
      expect(r.mensaje).toBeTruthy()
      expect(r.siguienteEstado).toBe('estado_que_no_existe')
    })

    it('fallback sin estado', () => {
      const r = decidirAccion(
        { ...CONTEXTO_BASE, estadoConversacion: null },
        { intencion: INTENCIONES.NO_RESPUESTA, confianza: 0, fecha_sugerida: null, argumento: null },
      )
      expect(r.siguienteEstado).toBe('esperando_respuesta_campania')
    })
  })

  describe('confirmar_asistencia desde campaña inicial', () => {
    it('confirma interés → ofrece horarios y transiciona a contactado', () => {
      const r = decidirAccion(
        { ...CONTEXTO_BASE, estadoConversacion: CONV_ESTADOS.ESPERANDO_RESPUESTA },
        { intencion: INTENCIONES.CONFIRMAR_ASISTENCIA, confianza: 0.9, fecha_sugerida: null, argumento: null },
      )
      expect(r.siguienteEstado).toBe('ofreciendo_horarios')
      expect(r.pipelineAction.nuevoEstado).toBe('contactado')
    })
  })
})

describe('conflictoToMensaje', () => {
  it('menciona alternativas cuando hay', () => {
    const msg = conflictoToMensaje('María', ['2026-07-11T09:00:00.000Z', '2026-07-11T11:00:00.000Z'])
    expect(msg).toContain('Lo sentimos')
    expect(msg).toContain('julio')
    expect(msg).toContain('Horarios disponibles')
  })

  it('funciona sin alternativas', () => {
    const msg = conflictoToMensaje('Pedro', [])
    expect(msg).toContain('Lo sentimos')
    expect(msg).toContain('Pedro')
  })
})
