import { describe, it, expect } from 'vitest'
import { buildStudentHistory, historyGradeLabel } from '../studentClassHistory.js'
const session = (id, estado = 'P', extra = {}) => ({ id, clase_id: 'c1', fecha: '2026-11-01', borrador: false, estado: 'registrada', contenido: 'Escalas', asistencia: [{ alumno_id: 'a1', estado }], ...extra })
const build = (data = {}) => buildStudentHistory('a1', { sessions: [session('s1')], classes: [{ id: 'c1', nombre: 'Violín' }], ...data })
describe('historial individual: evidencia por sesión', () => {
  it('recupera el contenido actual, incluye tardanza y conserva sesiones sin nota', () => {
    const entries = build({ sessions: [session('s1', 'T')] })
    expect(entries[0]).toMatchObject({ id: 's1', status: 'T', content: 'Escalas', participated: true })
  })
  it('excluye borradores y clases suspendidas aunque tengan asistencia', () => {
    expect(build({ sessions: [session('draft', 'P', { borrador: true }), session('suspended', 'P', { estado: 'suspendida' })] })).toEqual([])
  })
  it('prioriza asistencia individual, advierte discrepancias y no muestra notas al ausente', () => {
    const [entry] = build({ attendance: [{ id: 'at', alumno_id: 'a1', sesion_clase_id: 's1', estado: 'ausente' }], progress: [{ alumno_id: 'a1', sesion_clase_id: 's1', calificacion: 5 }] })
    expect(entry.status).toBe('A'); expect(entry.warning).toBeTruthy(); expect(entry.notes).toEqual([])
  })
  it('proyecta solo la evaluación del alumno y firma sin copiar observaciones de compañeros', () => {
    const entries = build({ sessionObservations: [{ id: 'o1', sesion_id: 's1', contenido_raw: 'Secreto de otro alumno', contenido_parsed: { _author: { nombre: 'Luis', rol: 'suplente', maestro_id: 'm2' }, evaluaciones: [{ alumno_id: 'otro', observacion: 'dato privado' }, { alumno_id: 'a1', observacion: 'Buen arco', nota: 4, tarea: 'Practicar' }] } }] })
    expect(JSON.stringify(entries)).not.toContain('dato privado'); expect(JSON.stringify(entries)).not.toContain('Secreto de otro alumno')
    expect(entries[0].notes[0]).toMatchObject({ text: 'Buen arco', author: { nombre: 'Luis', rol: 'suplente' } })
  })
  it('conecta observaciones individuales y evita duplicar textos promovidos', () => {
    const [entry] = build({ progress: [{ alumno_id: 'a1', sesion_clase_id: 's1', observaciones: 'Buen arco', contenido_dsl: 'Escalas' }], studentObservations: [{ id: 'o2', alumno_id: 'a1', sesion_clase_id: 's1', descripcion: 'Buen arco' }] })
    expect(entry.notes.filter(n => n.text === 'Buen arco')).toHaveLength(1)
  })
  it('no declara recuperado un contenido por repetirse en otra fecha', () => {
    const entries = build({ sessions: [session('lost', 'A'), session('later', 'P', { fecha: '2026-11-02' })] })
    expect(entries.find(e => e.id === 'lost').recovery).toBeNull()
  })
  it('acepta solo recuperación explícita del mismo alumno, clase y sesión posterior', () => {
    const entries = build({ sessions: [session('lost', 'J'), session('later', 'T', { fecha: '2026-11-02' })], sessionObservations: [{ id: 'r', sesion_id: 'later', contenido_parsed: { _history_recovery: { alumno_id: 'a1', original_sesion_id: 'lost' }, _author: { nombre: 'Luis' } } }] })
    expect(entries.find(e => e.id === 'lost').recovery).toMatchObject({ sessionId: 'later' })
  })
  it('preserva cero y escala declarada, sin inventar escala para notas antiguas', () => {
    expect(historyGradeLabel(0, 5)).toBe('0/5'); expect(historyGradeLabel(8, 10)).toBe('8/10'); expect(historyGradeLabel(4, null)).toBe('4 · escala no registrada')
  })
  it('no pierde dos clases el mismo día ni inventa asistencia por estar matriculado', () => {
    expect(build({ sessions: [session('s1'), session('s2', 'P', { clase_id: 'c2' }), session('other', 'P', { asistencia: [{ alumno_id: 'otro', estado: 'P' }] })] }).map(e => e.id)).toEqual(['s2', 's1'])
  })
  it('conserva observaciones idénticas de dos maestros con autorías distintas', () => {
    const [entry] = build({ sessionObservations: ['titular','suplente'].map((role, i) => ({ id: `o${i}`, sesion_id: 's1', contenido_parsed: { _author: { maestro_id: `m${i}`, rol: role }, evaluaciones: [{ alumno_id: 'a1', observacion: 'Buen arco', nota: 4 }] } })) })
    expect(entry.notes).toHaveLength(2)
  })
  it('no cuenta una clase exonerada como clase recibida', () => {
    expect(build({ sessions: [session('exempt', 'P', { estado: 'exonerada' })] })).toEqual([])
  })

})
