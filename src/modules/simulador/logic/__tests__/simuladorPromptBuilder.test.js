/**
 * simuladorPromptBuilder.test.js
 * Slice 2 — Portal Simulador: construcción del prompt de orquestación batch.
 * Spec: simulador-motor / Procesamiento concurrente determinista
 *   ("orden determinista basado en simulation_run_id + timestamp_simulado + id").
 * Design: decisión #5 (UNA llamada Groq por tick con todos los eventos del día).
 * TDD: tests escritos ANTES de la implementación (strict TDD mode).
 */
import { describe, it, expect } from 'vitest'
import { ordenarEventosDeterministico, construirPromptTick } from '../simuladorPromptBuilder.js'

describe('ordenarEventosDeterministico', () => {
  it('ordena por fecha_inicio y luego por id de forma estable', () => {
    const eventos = [
      { id: 'b', fecha_inicio: '2026-03-05T09:00:00-04:00' },
      { id: 'a', fecha_inicio: '2026-03-05T09:00:00-04:00' },
      { id: 'c', fecha_inicio: '2026-03-05T08:00:00-04:00' },
    ]
    const ordenado = ordenarEventosDeterministico(eventos)
    expect(ordenado.map((e) => e.id)).toEqual(['c', 'a', 'b'])
  })

  it('no muta el array original', () => {
    const eventos = [
      { id: 'z', fecha_inicio: '2026-03-05T09:00:00-04:00' },
      { id: 'a', fecha_inicio: '2026-03-05T08:00:00-04:00' },
    ]
    const copia = [...eventos]
    ordenarEventosDeterministico(eventos)
    expect(eventos).toEqual(copia)
  })

  it('produce el mismo orden en llamadas repetidas (determinismo)', () => {
    const eventos = [
      { id: 'e3', fecha_inicio: '2026-03-05T09:00:00-04:00' },
      { id: 'e1', fecha_inicio: '2026-03-05T09:00:00-04:00' },
      { id: 'e2', fecha_inicio: '2026-03-05T09:00:00-04:00' },
    ]
    const primero = ordenarEventosDeterministico(eventos).map((e) => e.id)
    const segundo = ordenarEventosDeterministico(eventos).map((e) => e.id)
    expect(primero).toEqual(segundo)
    expect(primero).toEqual(['e1', 'e2', 'e3']) // mismo timestamp -> desempate por id ascendente
  })
})

describe('construirPromptTick', () => {
  const contratos = {
    FIN: { rol: 'Copiloto Financiero', responsabilidades: ['mora', 'pago'], tono: 'formal' },
    ACM: { rol: 'Copiloto Académico', responsabilidades: ['evaluación'], tono: 'formal' },
    GENERICO: { rol: 'Agente genérico', responsabilidades: ['tarea', 'notificación'], tono: 'formal' },
  }

  it('incluye SOLO los contratos de los departamentos presentes en el batch de eventos', () => {
    const eventos = [
      { id: 'e1', fecha_inicio: '2026-03-05T09:00:00-04:00', departamento_responsable: 'FIN', titulo: 'Corte de cobranza' },
    ]
    const prompt = construirPromptTick({ eventos, contratos, actoresRelevantes: [] })
    expect(prompt.system).toContain('Copiloto Financiero')
    expect(prompt.system).not.toContain('Copiloto Académico')
  })

  it('usa el contrato GENERICO como fallback si el departamento del evento no tiene contrato dedicado', () => {
    const eventos = [
      { id: 'e1', fecha_inicio: '2026-03-05T09:00:00-04:00', departamento_responsable: 'ADM', titulo: 'Inscripciones' },
    ]
    const prompt = construirPromptTick({ eventos, contratos, actoresRelevantes: [] })
    expect(prompt.system).toContain('Agente genérico')
  })

  it('el mensaje "user" contiene el batch de eventos ordenado deterministamente como JSON', () => {
    const eventos = [
      { id: 'e2', fecha_inicio: '2026-03-05T09:00:00-04:00', departamento_responsable: 'FIN', titulo: 'B' },
      { id: 'e1', fecha_inicio: '2026-03-05T09:00:00-04:00', departamento_responsable: 'FIN', titulo: 'A' },
    ]
    const prompt = construirPromptTick({ eventos, contratos, actoresRelevantes: [] })
    const parsedUser = JSON.parse(prompt.user)
    expect(parsedUser.eventos.map((e) => e.id)).toEqual(['e1', 'e2'])
  })

  it('incluye actores relevantes (ej. morosos) en el contexto del prompt', () => {
    const eventos = [
      { id: 'e1', fecha_inicio: '2026-02-01T08:00:00-04:00', departamento_responsable: 'FIN', titulo: 'Corte de cobranza' },
    ]
    const actoresRelevantes = [{ nombre_ficticio: 'Representante Ficticio Moroso', estado_pago: 'moroso' }]
    const prompt = construirPromptTick({ eventos, contratos, actoresRelevantes })
    const parsedUser = JSON.parse(prompt.user)
    expect(parsedUser.actores_relevantes).toHaveLength(1)
    expect(parsedUser.actores_relevantes[0].nombre_ficticio).toBe('Representante Ficticio Moroso')
  })

  it('el system prompt exige responder SOLO JSON con el contrato AgentDecision[]', () => {
    const eventos = [{ id: 'e1', fecha_inicio: '2026-01-01T00:00:00-04:00', departamento_responsable: 'FIN', titulo: 'x' }]
    const prompt = construirPromptTick({ eventos, contratos, actoresRelevantes: [] })
    expect(prompt.system).toMatch(/JSON/i)
    expect(prompt.system).toMatch(/sim_calendario_id/)
    expect(prompt.system).toMatch(/resumen_accion/)
  })

  it('lanza si eventos está vacío (no tiene sentido llamar al LLM sin eventos)', () => {
    expect(() => construirPromptTick({ eventos: [], contratos, actoresRelevantes: [] })).toThrow(/evento/i)
  })
})
