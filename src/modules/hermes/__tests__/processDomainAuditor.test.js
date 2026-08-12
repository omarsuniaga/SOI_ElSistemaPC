/**
 * processDomainAuditor.test.js — Suite de pruebas para la auditoría y enriquecimiento automático de Contratos SOI
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../admin-dashboard/api/adminMaestroApi.js', () => ({
  getMaestrosComplianceStatus: vi.fn(() => Promise.resolve([
    {
      maestro_id: 'm-1',
      maestros: { id: 'm-1', nombre_completo: 'Prof. Carlos Santana' },
      pending_count: 3,
      categoria: 'rojo',
      oldest_dias_atraso: 5,
    },
    {
      maestro_id: 'm-2',
      maestros: { id: 'm-2', nombre_completo: 'Prof. Gustavo Dudamel' },
      pending_count: 0,
      categoria: 'verde',
      oldest_dias_atraso: 0,
    },
  ])),
}))

vi.mock('../../asistencias/api/asistenciasApi.js', () => ({
  getMaestros: vi.fn(() => Promise.resolve([
    { id: 'm-1', nombre_completo: 'Prof. Carlos Santana' },
    { id: 'm-2', nombre_completo: 'Prof. Gustavo Dudamel' },
  ])),
}))

import { auditAndEnrichProcessContract } from '../logic/processDomainAuditor.js'
import * as tareasMock from '../api/tareasMock.js'

describe('ProcessDomainAuditor — Auditoría Automática de Procesos Institucionales', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ACM-P02: Audita el cumplimiento docente y genera tareas con checklist nominal y métricas', async () => {
    const contract = {
      process_code: 'ACM-P02',
      process_name: 'Asistencia y contenido de clase',
      department_owner: 'ACM',
    }

    const { taskTemplates, auditSummary, metadata } = await auditAndEnrichProcessContract(contract, {
      description: 'Auditoría semanal de período',
    })

    expect(taskTemplates.length).toBe(3)
    expect(auditSummary).toContain('50% de cumplimiento global')
    expect(metadata.compliance_rate).toBe('50%')
    expect(metadata.maestros_pendientes_count).toBe(1)

    // Tarea 1: ACM regularizar docentes omisos
    const taskAcm = taskTemplates.find((t) => t.department === 'ACM' && t.title.includes('Exigir regularización'))
    expect(taskAcm).toBeTruthy()
    expect(taskAcm.checklist.some((item) => item.item.includes('Carlos Santana'))).toBe(true)

    // Tarea 2: ACM weekly plans
    const taskPlan = taskTemplates.find((t) => t.title.includes('weekly_plans'))
    expect(taskPlan).toBeTruthy()

    // Tarea 3: DIR supervisión
    const taskDir = taskTemplates.find((t) => t.department === 'DIR')
    expect(taskDir).toBeTruthy()
  })

  it('FIN-P13: Despliega protocolo de cobranza cruzado (FIN, COM, DIR)', async () => {
    const contract = {
      process_code: 'FIN-P13',
      process_name: 'Gestión de mora y cobranza',
      department_owner: 'FIN',
    }

    const { taskTemplates, auditSummary } = await auditAndEnrichProcessContract(contract)

    expect(taskTemplates.length).toBe(3)
    expect(auditSummary).toContain('Auditoría FIN')
    expect(taskTemplates.map((t) => t.department)).toEqual(['FIN', 'COM', 'DIR'])
  })

  it('OPR-P10: Despliega protocolo de lutería (LUT, FIN, ACM)', async () => {
    const contract = {
      process_code: 'OPR-P10',
      process_name: 'Taller de lutería y mantenimiento',
      department_owner: 'OPR',
    }

    const { taskTemplates } = await auditAndEnrichProcessContract(contract)

    expect(taskTemplates.length).toBe(3)
    expect(taskTemplates.map((t) => t.department)).toEqual(['LUT', 'FIN', 'ACM'])
  })

  it('startProcessCase en tareasMock despliega las tareas enriquecidas con correlation_id', async () => {
    const caseId = await tareasMock.startProcessCase({
      process_code: 'ACM-P02',
      title: 'Auditoría Inicial Período 2026-II',
    })

    expect(caseId).toContain('case-acm-p02')

    const tareas = await tareasMock.getTareasFiltradas({ correlation_id: caseId })
    expect(tareas.length).toBe(3)
    expect(tareas.some((t) => t.titulo.includes('regularización'))).toBe(true)
    expect(tareas.some((t) => t.titulo.includes('weekly_plans'))).toBe(true)
  })
})
