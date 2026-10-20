import { it, expect, vi } from 'vitest'
const calls = vi.hoisted(() => [])
vi.mock('jspdf', () => ({ default: class { setFontSize() {} text() {} addPage() {} save() {} } }))
vi.mock('jspdf-autotable', () => ({ default: (doc, opts) => { calls.push(opts); doc.lastAutoTable = { finalY: 10 } } }))
import { downloadClassHistoryPdf } from '../classHistoryPdfService.js'
import { buildStudentClassHistory } from '../classHistoryService.js'

it('exports the rating per student record and the per-student summary', () => {
  const report = { classId: 'c', students: [], months: [], entries: [{ id: 's1', date: '2026-09-01', content: 'Arco', teacher: 'Omar', attendance: [] }] }
  const details = { s1: { valoracionesDisponibles: true, observaciones: [], asistencias: [{ alumnoId: 'a', estado: 'presente', valoracion: 0 }] } }
  report.studentHistories = [{ ...buildStudentClassHistory(report, { id: 'a', name: 'Ana' }, details), name: 'Ana', current: true }]
  downloadClassHistoryPdf(report, { nombre: 'Violín' })
  const table = calls.find(c => c.head?.[0]?.[2] === 'Participación y valoración')
  expect(table.body[0][0]).toContain('Valoración: promedio 0,0/5 (1 evaluadas, 0 sin evaluar)')
  expect(table.body[0][2]).toContain('Valoración del maestro: 0 estrellas')
})
