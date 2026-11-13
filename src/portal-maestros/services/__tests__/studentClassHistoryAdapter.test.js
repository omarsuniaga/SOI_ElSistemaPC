import { describe, it, expect, vi } from 'vitest'
vi.mock('../../../lib/supabaseClient.js', () => ({ supabase: {} }))
import { createStudentClassHistoryAdapter, readHistoryPages } from '../studentClassHistoryAdapter.js'

const session = (id, state = 'P', fecha = '2026-11-02') => ({ id, clase_id: 'c1', fecha, estado: 'registrada', borrador: false, contenido: 'Escalas', asistencia: [{ alumno_id: 'a1', estado: state }] })
const clazz = { id: 'c1', nombre: 'Violín', maestro_principal_id: 'm1', maestro_suplente_id: 'm2' }
function clientFor(tables, errors = {}) {
  const calls = []
  const client = { from(table) {
    const call = { table, filters: [], columns: null }; calls.push(call)
    const query = {
      select(columns) { call.columns = columns; return this },
      eq(field, value) { call.filters.push([field, value]); return this },
      in(field, value) { call.filters.push([field, value]); return this },
      or(value) { call.or = value; return this }, filter() { return this },
      gte() { return this }, lte() { return this }, order() { return this },
      range(start, end) { call.range = [start, end]; return this },
      then(resolve) { return Promise.resolve({ data: (tables[table] || []).slice(...(call.range ? [call.range[0], call.range[1] + 1] : [0])), error: errors[table] || null }).then(resolve) },
    }; return query
  } }
  return { client, calls }
}
describe('student history adapter', () => {
  it('lee más de 500 sesiones sin cortar y propaga errores de páginas posteriores', async () => {
    const pages = vi.fn().mockReturnValueOnce({ range: async () => ({ data: Array(500).fill({ id: 'x' }) }) }).mockReturnValueOnce({ range: async () => ({ data: [{ id: 'last' }] }) })
    expect(await readHistoryPages(pages)).toHaveLength(501)
    await expect(readHistoryPages(() => ({ range: async () => ({ error: { message: 'network failure' } }) }))).rejects.toThrow('network failure')
  })
  it('incluye maestro titular y suplente, acota cada fuente individual por alumno y sesiones autorizadas', async () => {
    const { client, calls } = clientFor({ clases: [clazz], sesiones_clase: [session('s1')], progresos: [{ id: 'p', alumno_id: 'a1', sesion_clase_id: 's1', calificacion: 4 }] })
    const result = await createStudentClassHistoryAdapter(client, { demo: false }).load('a1', 'm2')
    expect(result.entries[0].notes[0].grade).toBe(4)
    expect(calls.find(c => c.table === 'clases').or).toContain('maestro_suplente_id.eq.m2')
    for (const table of ['progresos', 'observaciones_alumnos']) {
      expect(calls.find(c => c.table === table).filters).toEqual(expect.arrayContaining([['alumno_id', 'a1'], ['sesion_clase_id', ['s1']]]))
    }
    expect(calls.find(c => c.table === 'observaciones_sesion').columns).not.toContain('contenido_raw')
  })
  it('rechaza alumno ajeno y no consulta observaciones sin sesiones autorizadas', async () => {
    const { client, calls } = clientFor({ clases: [clazz] })
    await expect(createStudentClassHistoryAdapter(client, { demo: false }).load('other', 'm1')).rejects.toThrow('fuera de tus clases')
    expect(calls.some(c => c.table === 'progresos' || c.table === 'observaciones_sesion')).toBe(false)
  })
  it('no disfraza un fallo de consulta como historial vacío', async () => {
    const { client } = clientFor({ clases: [clazz] }, { asistencias: { message: 'permission denied' } })
    await expect(createStudentClassHistoryAdapter(client, { demo: false }).load('a1', 'm1')).rejects.toThrow('permission denied')
  })
  it('demo permite confirmar y releer recuperación sin escribir Supabase ni cambiar asistencia', async () => {
    const client = { from: vi.fn() }
    const adapter = createStudentClassHistoryAdapter(client, { demo: true, data: { classes: [clazz], sessions: [session('missed', 'A', '2026-11-01'), session('later', 'T')], sessionObservations: [] } })
    await adapter.confirmRecovery({ studentId: 'a1', maestro: { id: 'm2', nombre: 'Luis' }, originalId: 'missed', recoveryId: 'later' })
    const result = await adapter.load('a1', 'm1')
    expect(result.entries.find(e => e.id === 'missed')).toMatchObject({ status: 'A', recovery: { sessionId: 'later', author: { rol: 'suplente', maestro_id: 'm2' } } })
    expect(client.from).not.toHaveBeenCalled()
    await expect(adapter.confirmRecovery({ studentId: 'a1', maestro: { id: 'm1' }, originalId: 'later', recoveryId: 'missed' })).rejects.toThrow('posterior asistida')
  })
})
