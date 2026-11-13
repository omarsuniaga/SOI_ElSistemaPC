import { describe, it, expect, vi } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/dom'
import { mountStudentClassHistory } from '../StudentClassHistory.js'
const entry = (id, status = 'P', extra = {}) => ({ id, classId: 'c1', className: 'Violín', date: '2026-11-01', status, participated: ['P','T'].includes(status), content: '<img src=x onerror=alert(1)>', notes: [], source: { table: 'sesiones_clase', id }, ...extra })
const mount = (entries, adapter = {}) => {
  const root = document.createElement('div')
  mountStudentClassHistory(root, { entries, adapter, studentId: 'a1', maestro: { id: 'm1' } })
  return root
}
describe('student class history UI', () => {
  it('muestra 25 tarjetas pero calcula totales sobre las 70 y permite abrir las restantes', () => {
    const root = mount(Array.from({ length: 70 }, (_, i) => entry(`s${i}`)))
    expect(root.querySelectorAll('[data-session]')).toHaveLength(25)
    expect(root.textContent).toContain('70 sesiones')
    fireEvent.click(root.querySelector('[data-more]'))
    expect(root.querySelectorAll('[data-session]')).toHaveLength(50)
    fireEvent.click(root.querySelector('[data-more]'))
    expect(root.querySelectorAll('[data-session]')).toHaveLength(70)
    expect(root.querySelector('img')).toBeNull()
  })
  it('filtra asistencia, clase y fechas sin modificar los registros', () => {
    const records = [entry('s1'), entry('s2', 'T', { classId: 'c2', className: 'Teoría', date: '2026-11-02' })]
    const root = mount(records)
    fireEvent.change(root.querySelector('[data-filter="status"]'), { target: { value: 'T' } })
    expect(root.querySelectorAll('[data-session]')).toHaveLength(1)
    fireEvent.change(root.querySelector('[data-filter="classId"]'), { target: { value: 'c1' } })
    expect(root.querySelectorAll('[data-session]')).toHaveLength(0)
    expect(records).toHaveLength(2)
  })
  it('solo escribe una recuperación después del clic explícito y relee evidencia', async () => {
    const entries = [entry('lost','A'), entry('later','T',{date:'2026-11-02'})]
    const adapter = { confirmRecovery: vi.fn().mockResolvedValue({ saved: true }), load: vi.fn().mockResolvedValue({ entries }) }
    const root = mount(entries, adapter)
    expect(adapter.confirmRecovery).not.toHaveBeenCalled()
    fireEvent.click(root.querySelector('[data-confirm]'))
    await waitFor(() => expect(adapter.load).toHaveBeenCalled())
    expect(adapter.confirmRecovery).toHaveBeenCalledWith({ studentId: 'a1', maestro: { id: 'm1' }, originalId: 'lost', recoveryId: 'later' })
    expect(root.textContent).toContain('Recuperación confirmada')
  })
  it('expone fallo de guardado y permite reintentar sin anunciar éxito', async () => {
    const adapter = { confirmRecovery: vi.fn().mockRejectedValue(new Error('Sin conexión')) }
    const root = mount([entry('lost','A'),entry('later','P',{date:'2026-11-02'})], adapter)
    fireEvent.click(root.querySelector('[data-confirm]'))
    await waitFor(() => expect(root.textContent).toContain('No se pudo completar'))
    expect(root.textContent).not.toContain('Recuperación confirmada.')
    expect(root.querySelector('[data-confirm]').disabled).toBe(false)
  })
})
