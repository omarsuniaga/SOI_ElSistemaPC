import { describe, it, expect } from 'vitest'
import { resolverAutonomia } from '../logic/resolverAutonomia.js'

// Matriz de autonomia (design obs #2738 + spec obs #2737):
// read              -> ejecuta siempre (cualquier caller)
// write + simulador  -> ejecuta (sandbox, redirige a sim_*)
// write + llm/mcp + automation_status=auto        -> ejecuta
// write + llm/mcp + automation_status!=auto        -> pendiente_aprobacion
// write + humano + tieneTareaAprobada              -> ejecuta
// write + humano SIN tarea aprobada                -> pendiente_aprobacion (requiere flujo de aprobacion igual)
// critical + simulador -> ejecuta (sandbox)
// critical + cualquiera SIN (humano Y tieneTareaAprobada) -> SIEMPRE pendiente_aprobacion, ignora automation_status
// critical + humano + tieneTareaAprobada -> ejecuta

describe('resolverAutonomia', () => {
  it('read ejecuta siempre sin importar caller ni automation_status', () => {
    expect(resolverAutonomia({ nivelRiesgo: 'read', callerType: 'llm', automationStatus: 'manual' }).decision).toBe('ejecutar')
    expect(resolverAutonomia({ nivelRiesgo: 'read', callerType: 'mcp', automationStatus: 'manual' }).decision).toBe('ejecutar')
    expect(resolverAutonomia({ nivelRiesgo: 'read', callerType: 'simulador', automationStatus: 'manual' }).decision).toBe('ejecutar')
    expect(resolverAutonomia({ nivelRiesgo: 'read', callerType: 'humano', automationStatus: 'manual' }).decision).toBe('ejecutar')
  })

  it('write + simulador ejecuta en sandbox sin importar automation_status', () => {
    const r = resolverAutonomia({ nivelRiesgo: 'write', callerType: 'simulador', automationStatus: 'manual' })
    expect(r.decision).toBe('ejecutar')
    expect(r.sandbox).toBe(true)
  })

  it('write + llm + automation_status=auto ejecuta en produccion', () => {
    const r = resolverAutonomia({ nivelRiesgo: 'write', callerType: 'llm', automationStatus: 'auto' })
    expect(r.decision).toBe('ejecutar')
    expect(r.sandbox).toBe(false)
  })

  it('write + llm + automation_status!=auto crea tarea de aprobacion', () => {
    const r = resolverAutonomia({ nivelRiesgo: 'write', callerType: 'llm', automationStatus: 'manual' })
    expect(r.decision).toBe('pendiente_aprobacion')
  })

  it('write + mcp + automation_status=auto ejecuta (mcp se trata igual que llm)', () => {
    const r = resolverAutonomia({ nivelRiesgo: 'write', callerType: 'mcp', automationStatus: 'auto' })
    expect(r.decision).toBe('ejecutar')
  })

  it('write + humano CON tarea aprobada ejecuta', () => {
    const r = resolverAutonomia({ nivelRiesgo: 'write', callerType: 'humano', automationStatus: 'manual', tieneTareaAprobada: true })
    expect(r.decision).toBe('ejecutar')
  })

  it('write + humano SIN tarea aprobada crea tarea de aprobacion', () => {
    const r = resolverAutonomia({ nivelRiesgo: 'write', callerType: 'humano', automationStatus: 'manual', tieneTareaAprobada: false })
    expect(r.decision).toBe('pendiente_aprobacion')
  })

  it('critical + simulador ejecuta en sandbox', () => {
    const r = resolverAutonomia({ nivelRiesgo: 'critical', callerType: 'simulador', automationStatus: 'auto' })
    expect(r.decision).toBe('ejecutar')
    expect(r.sandbox).toBe(true)
  })

  it('critical + llm SIEMPRE crea tarea aunque automation_status=auto (ignora auto)', () => {
    const r = resolverAutonomia({ nivelRiesgo: 'critical', callerType: 'llm', automationStatus: 'auto' })
    expect(r.decision).toBe('pendiente_aprobacion')
    expect(r.asignarA).toBe('DIR')
  })

  it('critical + humano SIN tarea aprobada crea tarea asignada a DIR', () => {
    const r = resolverAutonomia({ nivelRiesgo: 'critical', callerType: 'humano', automationStatus: 'manual', tieneTareaAprobada: false })
    expect(r.decision).toBe('pendiente_aprobacion')
    expect(r.asignarA).toBe('DIR')
  })

  it('critical + humano CON tarea aprobada ejecuta', () => {
    const r = resolverAutonomia({ nivelRiesgo: 'critical', callerType: 'humano', automationStatus: 'manual', tieneTareaAprobada: true })
    expect(r.decision).toBe('ejecutar')
  })

  it('nivelRiesgo invalido se rechaza sin ejecutar', () => {
    const r = resolverAutonomia({ nivelRiesgo: 'no-existe', callerType: 'llm', automationStatus: 'manual' })
    expect(r.decision).toBe('rechazar')
  })

  it('callerType invalido se rechaza sin ejecutar', () => {
    const r = resolverAutonomia({ nivelRiesgo: 'read', callerType: 'desconocido', automationStatus: 'manual' })
    expect(r.decision).toBe('rechazar')
  })
})
