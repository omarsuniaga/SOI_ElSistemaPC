import { afterEach, describe, expect, it, vi } from 'vitest'
const { candidates, history, openForm } = vi.hoisted(() => ({ candidates: vi.fn(), history: vi.fn(async () => []), openForm: vi.fn() }))
vi.mock('../../api/recordExemptionsAdapter.js', () => ({ getExemptionCandidates: candidates, listRecordExemptions: history }))
vi.mock('../recordExemptionDialog.js', () => ({ openRecordExemptionDialog: openForm }))
import { openExemptionDatePicker } from '../exemptionDatePicker.js'
afterEach(() => { document.body.innerHTML=''; vi.clearAllMocks() })
describe('exonerar clases: fecha antes del motivo', () => {
  it('exige elegir fecha y clase y luego abre el formulario con la selección exacta', async () => {
    candidates.mockResolvedValue([{ clase_id:'c',clase_nombre:'Oboe',fecha:'2026-09-29',estado:'vencida',hora_inicio:'15:00' }])
    await openExemptionDatePicker({ maestroId:'m',nombre:'Isabella' })
    expect(document.querySelector('[data-continue]').disabled).toBe(true)
    const date=document.querySelector('[name=fecha]');date.value='2026-09-29';date.dispatchEvent(new Event('change'))
    await vi.waitFor(()=>expect(document.querySelector('select').options.length).toBe(2))
    const select=document.querySelector('select');select.value='0';select.dispatchEvent(new Event('change'))
    document.querySelector('[data-continue]').click()
    await vi.waitFor(()=>expect(openForm).toHaveBeenCalledOnce())
    expect(openForm.mock.calls[0][0]).toMatchObject({ maestroId:'m',row:{ clase_id:'c',fecha:'2026-09-29' } })
  })
  it('explica una fecha sin clases y no permite continuar', async () => {
    candidates.mockResolvedValue([])
    await openExemptionDatePicker({ maestroId:'m',nombre:'Isabella' })
    const date=document.querySelector('[name=fecha]');date.value='2026-09-27';date.dispatchEvent(new Event('change'))
    await vi.waitFor(()=>expect(document.querySelector('[role=status]').textContent).toContain('No hay clases'))
    expect(document.querySelector('[data-continue]').disabled).toBe(true)
  })
})
