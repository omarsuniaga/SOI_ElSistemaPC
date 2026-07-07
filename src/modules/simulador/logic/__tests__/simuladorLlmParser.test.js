/**
 * simuladorLlmParser.test.js
 * Slice 2 — Portal Simulador: parser/validador defensivo de la respuesta JSON del LLM.
 * Design: Interfaces/Contracts -> AgentDecision + reglas de validación/fallback
 *   (mismo patrón que hermes-crear-tarea: strip fences, regex, JSON.parse defensivo).
 * TDD: tests escritos ANTES de la implementación (strict TDD mode).
 */
import { describe, it, expect } from 'vitest'
import { parseAgentDecisions, DEPARTAMENTOS_VALIDOS, PRIORIDADES_VALIDAS } from '../simuladorLlmParser.js'

describe('parseAgentDecisions — respuesta bien formada', () => {
  it('parsea un array JSON plano de decisiones', () => {
    const raw = JSON.stringify([
      {
        sim_calendario_id: 'evt-1',
        departamento: 'FIN',
        tareas: [{ titulo: 'Revisar mora', descripcion: 'desc', prioridad: 'alta' }],
        mensajes: [{ canal: 'whatsapp', destinatario_original: 'Representante X', cuerpo: 'Aviso' }],
        resumen_accion: 'Se notificó al representante moroso',
      },
    ])
    const resultado = parseAgentDecisions(raw)
    expect(resultado.ok).toBe(true)
    expect(resultado.decisiones).toHaveLength(1)
    expect(resultado.decisiones[0].departamento).toBe('FIN')
    expect(resultado.decisiones[0].tareas[0].prioridad).toBe('alta')
    expect(resultado.decisiones[0].mensajes[0].canal).toBe('whatsapp')
  })

  it('parsea múltiples decisiones concurrentes preservando el orden de entrada', () => {
    const raw = JSON.stringify([
      { sim_calendario_id: 'evt-b', departamento: 'ACM', tareas: [], mensajes: [], resumen_accion: 'b' },
      { sim_calendario_id: 'evt-a', departamento: 'DIR', tareas: [], mensajes: [], resumen_accion: 'a' },
    ])
    const resultado = parseAgentDecisions(raw)
    expect(resultado.ok).toBe(true)
    expect(resultado.decisiones.map((d) => d.sim_calendario_id)).toEqual(['evt-b', 'evt-a'])
  })
})

describe('parseAgentDecisions — tolera fences y ruido de markdown', () => {
  it('extrae el JSON aunque venga envuelto en ```json fences', () => {
    const raw = '```json\n[{"sim_calendario_id":"evt-1","departamento":"COM","tareas":[],"mensajes":[],"resumen_accion":"ok"}]\n```'
    const resultado = parseAgentDecisions(raw)
    expect(resultado.ok).toBe(true)
    expect(resultado.decisiones[0].departamento).toBe('COM')
  })

  it('extrae el JSON aunque tenga texto explicativo alrededor', () => {
    const raw = 'Aquí está la respuesta:\n[{"sim_calendario_id":"evt-1","departamento":"ADM","tareas":[],"mensajes":[],"resumen_accion":"ok"}]\nEspero que ayude.'
    const resultado = parseAgentDecisions(raw)
    expect(resultado.ok).toBe(true)
    expect(resultado.decisiones[0].departamento).toBe('ADM')
  })

  it('acepta un único objeto (no array) y lo normaliza a array de un elemento', () => {
    const raw = '{"sim_calendario_id":"evt-1","departamento":"LOG","tareas":[],"mensajes":[],"resumen_accion":"ok"}'
    const resultado = parseAgentDecisions(raw)
    expect(resultado.ok).toBe(true)
    expect(resultado.decisiones).toHaveLength(1)
  })
})

describe('parseAgentDecisions — fallback ante formato inválido (el tick NO debe explotar)', () => {
  it('retorna ok:false con error_parseo_llm si el texto no contiene JSON', () => {
    const resultado = parseAgentDecisions('esto no es json en absoluto')
    expect(resultado.ok).toBe(false)
    expect(resultado.accion).toBe('error_parseo_llm')
    expect(resultado.decisiones).toEqual([])
  })

  it('retorna ok:false si el JSON está mal formado (llaves rotas)', () => {
    const resultado = parseAgentDecisions('[{"departamento":"FIN", tareas: []')
    expect(resultado.ok).toBe(false)
    expect(resultado.accion).toBe('error_parseo_llm')
  })

  it('retorna ok:false si la entrada es null/undefined/vacía', () => {
    for (const raw of [null, undefined, '', '   ']) {
      const resultado = parseAgentDecisions(raw)
      expect(resultado.ok).toBe(false)
      expect(resultado.decisiones).toEqual([])
    }
  })
})

describe('parseAgentDecisions — normalización defensiva de campos', () => {
  it('si "departamento" no matchea soi_departamento, hace fallback a DIR', () => {
    const raw = JSON.stringify([
      { sim_calendario_id: 'evt-1', departamento: 'INEXISTENTE', tareas: [], mensajes: [], resumen_accion: 'x' },
    ])
    const resultado = parseAgentDecisions(raw)
    expect(resultado.ok).toBe(true)
    expect(resultado.decisiones[0].departamento).toBe('DIR')
  })

  it('acepta todos los departamentos válidos de soi_departamento', () => {
    expect(DEPARTAMENTOS_VALIDOS).toEqual(['DIR', 'ACM', 'ADM', 'FIN', 'LOG', 'COM', 'TECNICO'])
  })

  it('si "prioridad" de una tarea no es válida, hace fallback a media', () => {
    const raw = JSON.stringify([
      {
        sim_calendario_id: 'evt-1',
        departamento: 'FIN',
        tareas: [{ titulo: 't', descripcion: 'd', prioridad: 'urgentisima' }],
        mensajes: [],
        resumen_accion: 'x',
      },
    ])
    const resultado = parseAgentDecisions(raw)
    expect(resultado.decisiones[0].tareas[0].prioridad).toBe('media')
  })

  it('expone las prioridades válidas', () => {
    expect(PRIORIDADES_VALIDAS).toEqual(['baja', 'media', 'alta', 'critica'])
  })

  it('si "tareas" o "mensajes" faltan, los normaliza a arrays vacíos en vez de fallar', () => {
    const raw = JSON.stringify([{ sim_calendario_id: 'evt-1', departamento: 'FIN', resumen_accion: 'x' }])
    const resultado = parseAgentDecisions(raw)
    expect(resultado.ok).toBe(true)
    expect(resultado.decisiones[0].tareas).toEqual([])
    expect(resultado.decisiones[0].mensajes).toEqual([])
  })

  it('si "canal" de un mensaje no es whatsapp/email, descarta ese mensaje en vez de fallar el tick completo', () => {
    const raw = JSON.stringify([
      {
        sim_calendario_id: 'evt-1',
        departamento: 'FIN',
        tareas: [],
        mensajes: [
          { canal: 'sms', destinatario_original: 'x', cuerpo: 'y' },
          { canal: 'email', destinatario_original: 'x', cuerpo: 'y' },
        ],
        resumen_accion: 'x',
      },
    ])
    const resultado = parseAgentDecisions(raw)
    expect(resultado.decisiones[0].mensajes).toHaveLength(1)
    expect(resultado.decisiones[0].mensajes[0].canal).toBe('email')
  })

  it('descarta decisiones sin sim_calendario_id (no se puede vincular al evento origen)', () => {
    const raw = JSON.stringify([
      { departamento: 'FIN', tareas: [], mensajes: [], resumen_accion: 'sin id' },
      { sim_calendario_id: 'evt-2', departamento: 'FIN', tareas: [], mensajes: [], resumen_accion: 'con id' },
    ])
    const resultado = parseAgentDecisions(raw)
    expect(resultado.decisiones).toHaveLength(1)
    expect(resultado.decisiones[0].sim_calendario_id).toBe('evt-2')
  })
})
