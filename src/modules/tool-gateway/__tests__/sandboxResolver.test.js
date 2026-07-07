import { describe, it, expect } from 'vitest'
import { resolverSandbox } from '../logic/sandboxResolver.js'

// Decision del orquestador (2026-07-06, cabo suelto Slice 1): NO se crean
// tablas espejo por tool (sim_planificaciones, sim_ordenes_reparacion, etc.
// nunca existieron). El resolver mapea TODA escritura sandbox a las tablas
// GENERICAS ya existentes del simulador (20260707_simulador_core.sql):
//   - sim_tareas: si la tool_call es creacion de tarea/registro operativo.
//   - sim_log: SIEMPRE (auditoria de toda accion en simulacion).
//   - sim_outbox: si la tool_call implica un envio (canal whatsapp/email).

describe('resolverSandbox', () => {
  const toolConSandbox = {
    name: 'acm_register_leveling_plan',
    nivel_riesgo: 'write',
    sandbox_behavior: { tabla_destino: 'sim_planificaciones', nota: 'legacy seed, ignorado por el resolver generico' },
  }

  it('rechaza si sandbox_behavior esta ausente (spec: sandbox_behavior faltante rechaza la tool_call)', () => {
    const tool = { name: 'x', nivel_riesgo: 'write', sandbox_behavior: null }
    const r = resolverSandbox(tool, {})
    expect(r.ok).toBe(false)
    expect(r.operaciones).toEqual([])
  })

  it('toda escritura sandbox genera SIEMPRE una operacion sim_log', () => {
    const r = resolverSandbox(toolConSandbox, { alumno_id: 'a1' })
    expect(r.ok).toBe(true)
    const tablas = r.operaciones.map((op) => op.tabla)
    expect(tablas).toContain('sim_log')
  })

  it('tool de creacion de tarea/registro (write, sin envio) mapea a sim_tareas + sim_log', () => {
    const r = resolverSandbox(toolConSandbox, { alumno_id: 'a1', maestro_id: 'm1' })
    const tablas = r.operaciones.map((op) => op.tabla)
    expect(tablas).toEqual(expect.arrayContaining(['sim_tareas', 'sim_log']))
    expect(tablas).not.toContain('sim_outbox')
  })

  it('tool cuyo sandbox_behavior declara envio (canal) mapea tambien a sim_outbox', () => {
    const toolConEnvio = {
      name: 'fin_notificar_familia',
      nivel_riesgo: 'write',
      sandbox_behavior: { envia_mensaje: true, canal: 'whatsapp' },
    }
    const r = resolverSandbox(toolConEnvio, { familia_id: 'f1' })
    const tablas = r.operaciones.map((op) => op.tabla)
    expect(tablas).toEqual(expect.arrayContaining(['sim_outbox', 'sim_log']))
  })

  it('critical con sandbox_behavior tambien resuelve (sim_tareas + sim_log), igual que write', () => {
    const toolCritical = {
      name: 'fin_apply_repair_charge',
      nivel_riesgo: 'critical',
      sandbox_behavior: { tabla_destino: 'sim_cuotas' },
    }
    const r = resolverSandbox(toolCritical, { monto: 100 })
    expect(r.ok).toBe(true)
    expect(r.operaciones.map((op) => op.tabla)).toEqual(expect.arrayContaining(['sim_tareas', 'sim_log']))
  })

  it('cada operacion incluye el run_id que se le pase para insertar en la tabla correcta', () => {
    const r = resolverSandbox(toolConSandbox, { alumno_id: 'a1' }, { runId: 'run-123' })
    for (const op of r.operaciones) {
      expect(op.payload.run_id).toBe('run-123')
    }
  })

  it('la operacion sim_log incluye tool_name y args para trazabilidad', () => {
    const r = resolverSandbox(toolConSandbox, { alumno_id: 'a1' }, { runId: 'run-123' })
    const log = r.operaciones.find((op) => op.tabla === 'sim_log')
    expect(log.payload.agente).toBe('tool-gateway')
    expect(log.payload.accion).toContain('acm_register_leveling_plan')
    expect(log.payload.payload).toEqual({ alumno_id: 'a1' })
  })

  it('tool read con sandbox_behavior ausente igual rechaza (regla es sobre presencia de sandbox_behavior, no sobre nivel_riesgo)', () => {
    const toolRead = { name: 'lut_estado_orden', nivel_riesgo: 'read', sandbox_behavior: null }
    const r = resolverSandbox(toolRead, {})
    expect(r.ok).toBe(false)
  })
})
