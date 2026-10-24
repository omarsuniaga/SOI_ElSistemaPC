import { afterEach, describe, expect, it, vi } from 'vitest'
const create = vi.fn(), revoke = vi.fn()
vi.mock('../../api/recordExemptionsAdapter.js', () => ({ createRecordExemption: (...args) => create(...args), revokeRecordExemption: (...args) => revoke(...args), getClassValidity: vi.fn(), saveClassValidity: vi.fn() }))
import { openRecordExemptionDialog } from '../recordExemptionDialog.js'
afterEach(() => { document.body.innerHTML=''; vi.clearAllMocks() })
describe('decisión administrativa', () => {
  it('no anuncia éxito antes de persistir y conserva el motivo ante un error', async () => {
    create.mockRejectedValue(new Error('Permiso denegado'))
    const saved = vi.fn()
    await openRecordExemptionDialog({ row: { clase_id: 'c', clase_nombre: 'Oboe', fecha: '2026-09-29' }, maestroId: 'm', onSaved: saved })
    const form = document.querySelector('form')
    form.querySelector('[name=reason]').value='Incidencia de registro verificada'
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await vi.waitFor(() => expect(form.querySelector('[role=alert]').textContent).toBe('Permiso denegado'))
    expect(saved).not.toHaveBeenCalled()
    expect(form.querySelector('[name=reason]').value).toContain('Incidencia')
    expect(form.querySelector('[type=submit]').disabled).toBe(false)
  })
  it('muestra historia escapada y revoca con un nuevo motivo', async () => {
    revoke.mockResolvedValue({})
    const saved=vi.fn()
    await openRecordExemptionDialog({ row: { clase_id:'c',clase_nombre:'Oboe',fecha:'2026-09-29' }, maestroId:'m', onSaved:saved, exemptions:[{ id:'x',clase_id:'c',fecha:'2026-09-29',alcance:'ambos',motivo:'<script>mal</script>',creado_por:'admin',creado_en:'2026-10-24' }] })
    expect(document.querySelector('dialog script')).toBeNull()
    document.querySelector('[data-revoke]').click()
    document.querySelector('[name=reason]').value='Registro recuperado posteriormente'
    document.querySelector('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))
    await vi.waitFor(()=>expect(saved).toHaveBeenCalledOnce())
    expect(revoke).toHaveBeenCalledWith('x','Registro recuperado posteriormente')
  })
})
