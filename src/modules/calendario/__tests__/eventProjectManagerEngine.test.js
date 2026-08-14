import { describe, it, expect } from 'vitest'
import {
  PUNTA_CANA_VENUES,
  PROTOCOLOS_ORQUESTACION,
  analizarSaludEvento,
} from '../domain/eventProjectManagerEngine.js'

describe('eventProjectManagerEngine', () => {
  it('contains verified Punta Cana venue intelligence', () => {
    expect(PUNTA_CANA_VENUES.length).toBeGreaterThanOrEqual(4)
    const club = PUNTA_CANA_VENUES.find(v => v.id === 'auditorio-puntacana-club')
    expect(club).toBeDefined()
    expect(club.capacidad).toBe(450)
    expect(club.acustica).toContain('Excelente')
  })

  it('contains multi-departmental Anniversary WBS protocol', () => {
    const aniversario = PROTOCOLOS_ORQUESTACION.aniversario
    expect(aniversario).toBeDefined()
    expect(aniversario.hitos.length).toBeGreaterThanOrEqual(8)

    const deptosInvolucrados = new Set(aniversario.hitos.map(h => h.departamento))
    expect(deptosInvolucrados.has('ACM')).toBe(true)
    expect(deptosInvolucrados.has('ADM')).toBe(true)
    expect(deptosInvolucrados.has('COM')).toBe(true)
    expect(deptosInvolucrados.has('FIN')).toBe(true)
    expect(deptosInvolucrados.has('DIR')).toBe(true)
    expect(deptosInvolucrados.has('LUT')).toBe(true)
  })

  it('analyzes event health and calculates bottlenecks', () => {
    const fakeEvent = {
      fecha_inicio: '2026-11-22T19:00:00Z',
    }

    const fakeTasks = [
      {
        id: 't-1',
        titulo: 'Scouting de Recinto',
        departamento: 'ADM',
        estado: 'pendiente',
        fecha_vencimiento: '2026-08-01', // Vencida en el pasado
        prioridad: 'critica',
      },
      {
        id: 't-2',
        titulo: 'Repertorio Oficial',
        departamento: 'ACM',
        estado: 'completada',
        fecha_vencimiento: '2026-08-10',
        prioridad: 'alta',
      },
    ]

    const salud = analizarSaludEvento(fakeEvent, fakeTasks)
    expect(salud.totalTareas).toBe(2)
    expect(salud.completadas).toBe(1)
    expect(salud.porcentaje).toBe(50)
    expect(salud.cuellosDeBotella.length).toBe(1)
    expect(salud.cuellosDeBotella[0].departamento).toBe('ADM')
    expect(salud.progresoPorDepartamento.ACM.porcentaje).toBe(100)
    expect(salud.progresoPorDepartamento.ADM.porcentaje).toBe(0)
  })
})
