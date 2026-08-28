import { describe, it, expect } from 'vitest'
import { createAttendanceHeader } from '../../src/portal-maestros/components/attendance/AttendanceHeader.js'

describe('AttendanceHeader Component - Live Counts Badge', () => {
  it('renderiza la cabecera con el badge de conteos inicial (P:0 | J:0 | A:0)', () => {
    const container = document.createElement('div')
    const header = createAttendanceHeader(container, {
      clase: { nombre: 'Violín Inicial A' },
      horario: { hora_inicio: '14:00:00', hora_fin: '15:00:00' },
      salonNombre: 'Salón 102',
      fechaHoy: '2026-08-28',
      totalAlumnos: 15,
      counts: { P: 10, J: 3, A: 2 },
      hasConflict: false,
      onBack: () => {},
    })

    const countP = container.querySelector('#pm-count-p')
    const countJ = container.querySelector('#pm-count-j')
    const countA = container.querySelector('#pm-count-a')

    expect(countP?.textContent).toBe('10')
    expect(countJ?.textContent).toBe('3')
    expect(countA?.textContent).toBe('2')

    header.destroy()
  })

  it('actualiza los conteos reactivamente al invocar updateCounts', () => {
    const container = document.createElement('div')
    const header = createAttendanceHeader(container, {
      clase: { nombre: 'Orquesta Sinfónica Juvenil' },
      horario: null,
      salonNombre: null,
      fechaHoy: '2026-08-28',
      totalAlumnos: 30,
      counts: { P: 0, J: 0, A: 0 },
      hasConflict: false,
      onBack: () => {},
    })

    header.updateCounts({ P: 17, J: 8, A: 5 })

    expect(container.querySelector('#pm-count-p')?.textContent).toBe('17')
    expect(container.querySelector('#pm-count-j')?.textContent).toBe('8')
    expect(container.querySelector('#pm-count-a')?.textContent).toBe('5')

    header.destroy()
  })
})
