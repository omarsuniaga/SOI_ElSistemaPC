import { describe, it, expect } from 'vitest'
import { construirTareaAprobacion } from '../logic/construirTareaAprobacion.js'

// Convencion decidida en tasks (obs #2740): entidad_tipo='tool_call',
// entidad_id=soi_tool_log.id, entidad_label=tool_name, checklist[0] transporta
// el GatewayRequest completo, titulo prefijado "[Aprobacion Tool] {tool_name}".

describe('construirTareaAprobacion', () => {
  const toolCallWrite = {
    tool_name: 'acm_register_leveling_plan',
    args: { alumno_id: 'a1', maestro_id: 'm1', objetivos_pedagogicos: ['x'], fecha_inicio: '2026-08-01' },
    correlation_id: 'corr-1',
  }

  it('usa entidad_tipo=tool_call, entidad_id=logId, entidad_label=tool_name', () => {
    const tarea = construirTareaAprobacion({
      toolCall: toolCallWrite,
      logId: 'log-uuid-1',
      departamento: 'ACM',
      nivelRiesgo: 'write',
    })
    expect(tarea.entidad_tipo).toBe('tool_call')
    expect(tarea.entidad_id).toBe('log-uuid-1')
    expect(tarea.entidad_label).toBe('acm_register_leveling_plan')
  })

  it('el titulo tiene el prefijo "[Aprobacion Tool]" seguido del tool_name', () => {
    const tarea = construirTareaAprobacion({ toolCall: toolCallWrite, logId: 'log-1', departamento: 'ACM', nivelRiesgo: 'write' })
    expect(tarea.titulo).toBe('[Aprobación Tool] acm_register_leveling_plan')
  })

  it('el checklist[0] transporta el payload completo de la tool_call (GatewayRequest)', () => {
    const tarea = construirTareaAprobacion({ toolCall: toolCallWrite, logId: 'log-1', departamento: 'ACM', nivelRiesgo: 'write' })
    expect(tarea.checklist).toHaveLength(1)
    expect(tarea.checklist[0].item).toBe('tool_call_payload')
    expect(tarea.checklist[0].completado).toBe(false)
    expect(tarea.checklist[0].payload).toEqual(toolCallWrite)
  })

  it('departamento se propaga tal cual al campo departamento de la tarea', () => {
    const tarea = construirTareaAprobacion({ toolCall: toolCallWrite, logId: 'log-1', departamento: 'FIN', nivelRiesgo: 'write' })
    expect(tarea.departamento).toBe('FIN')
  })

  it('prioridad es alta para write y critica para critical', () => {
    const tareaWrite = construirTareaAprobacion({ toolCall: toolCallWrite, logId: 'log-1', departamento: 'ACM', nivelRiesgo: 'write' })
    expect(tareaWrite.prioridad).toBe('alta')

    const tareaCritical = construirTareaAprobacion({ toolCall: toolCallWrite, logId: 'log-1', departamento: 'FIN', nivelRiesgo: 'critical' })
    expect(tareaCritical.prioridad).toBe('critica')
  })

  it('critical fuerza departamento=DIR sin importar el departamento de la tool (asignacion a DIR)', () => {
    const tarea = construirTareaAprobacion({ toolCall: toolCallWrite, logId: 'log-1', departamento: 'FIN', nivelRiesgo: 'critical', asignarA: 'DIR' })
    expect(tarea.departamento).toBe('DIR')
  })

  it('correlation_id de la tool_call se propaga a la tarea si viene presente', () => {
    const tarea = construirTareaAprobacion({ toolCall: toolCallWrite, logId: 'log-1', departamento: 'ACM', nivelRiesgo: 'write' })
    expect(tarea.correlation_id).toBe('corr-1')
  })

  it('sin correlation_id en la tool_call, la tarea no fuerza ningun valor (deja que la DB use su default)', () => {
    const sinCorrelation = { tool_name: 'x', args: {} }
    const tarea = construirTareaAprobacion({ toolCall: sinCorrelation, logId: 'log-2', departamento: 'ACM', nivelRiesgo: 'write' })
    expect(tarea.correlation_id).toBeUndefined()
  })

  it('estado inicial siempre pendiente', () => {
    const tarea = construirTareaAprobacion({ toolCall: toolCallWrite, logId: 'log-1', departamento: 'ACM', nivelRiesgo: 'write' })
    expect(tarea.estado).toBe('pendiente')
  })
})
