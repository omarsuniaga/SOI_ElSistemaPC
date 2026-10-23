import { describe, it, expect, vi } from 'vitest'
import { mountSemester } from '../semesterView.js'
import { createSemesterAdapter } from '../semesterMock.js'
import { SEMESTER_RUBRIC, familyMessage, reportHTML } from '../semesterDomain.js'
import { installAuditionLinks } from '../semesterPortalLinks.js'
async function setup() {
  const adapter = createSemesterAdapter({ today: () => '2026-10-22' }),
    x = (a, d) => adapter.execute(a, d)
  const c = await x('crear', {
    nombre: 'Audición UI',
    tipo: 'medio',
    periodo: '2026-2',
    fecha_audicion: '2026-10-22',
    clases_origen: ['source', 'source-b'],
    jurados: ['demo-jury'],
    responsables: ['demo-admin'],
    min_jurados: 1,
    rubrica: SEMESTER_RUBRIC,
  })
  await x('agregar', {
    convocatoria_id: c.id,
    alumno_id: 'demo-student-a',
    regular_clase_id: 'source',
  })
  await x('abrir', { convocatoria_id: c.id })
  const a = (await x('detalle', { convocatoria_id: c.id })).candidatos[0]
  document.body.innerHTML = '<div id="app"></div>'
  const root = document.getElementById('app')
  return { adapter, x, c, a, root }
}
const submit = (root, name, values = {}) => {
  const f = root.querySelector(`[data-form="${name}"]`)
  for (const [key, value] of Object.entries(values)) f.elements[key].value = value
  f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  return f
}
describe('Semester UI and portal assignment', () => {
  it('assigned jury evaluates with no-observed and preserves values on server rejection', async () => {
    const { adapter, root } = await setup()
    adapter.setActor('demo-jury')
    const view = await mountSemester(root, adapter)
    expect(root.querySelector('[data-form=valorar]')).toBeTruthy()
    expect(root.querySelector('[data-form=resolver]')).toBeNull()
    const form = submit(root, 'valorar', {
      observacion: 'Evidencia que se conserva',
      fortalezas: 'Pulso',
      apoyos: 'Escucha',
    })
    await vi.waitFor(() => expect(root.textContent).toContain('Incompleta / No observado'))
    expect(root.querySelector('[data-form=valorar]').elements.observacion.value).toBe(
      'Evidencia que se conserva',
    )
    const original = adapter.execute
    adapter.execute = vi.fn().mockRejectedValue(new Error('Sin conexión de prueba'))
    const retained = submit(root, 'valorar', { observacion: 'No perder esta evidencia' })
    await vi.waitFor(() =>
      expect(root.querySelector('[data-error]').textContent).toContain('Sin conexión'),
    )
    expect(retained.elements.observacion.value).toBe('No perder esta evidencia')
    expect(retained.isConnected).toBe(true)
    adapter.execute = original
    expect(form.isConnected).toBe(false)
    view.destroy()
  })
  it('creates a campaign from human-readable criteria, multiple groups and explicit academic authority', async () => {
    const { root, adapter } = await setup()
    const view = await mountSemester(root, adapter)
    const f = root.querySelector('[data-form=crear]')
    f.elements.nombre.value = 'Nueva audición'
    f.elements.periodo.value = '2026 final'
    f.elements.fecha_audicion.value = '2026-12-01'
    for (const name of ['clases_origen', 'jurados', 'responsables'])
      f.elements[name].options[0].selected = true
    root.querySelector('[data-action=add-criterion]').click()
    await vi.waitFor(() => expect(f.querySelectorAll('[data-criterion]')).toHaveLength(5))
    const added = f.querySelectorAll('[data-criterion]')[4]
    added.querySelector('[name=criterion_label]').value =
      'Participa en una actividad adecuada al destino'
    f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await vi.waitFor(() => expect(root.querySelector('h2').textContent).toContain('Convocatorias'))
    await vi.waitFor(async () =>
      expect((await adapter.execute('contexto')).convocatorias).toHaveLength(2),
    )
    view.destroy()
  })
  it('receiver has a preselected destination and no jury screen', async () => {
    const { root, adapter, x, c, a } = await setup()
    adapter.setActor('demo-jury')
    await x('valorar', {
      candidato_id: a.id,
      notas: Object.fromEntries(SEMESTER_RUBRIC.map((c) => [c.key, 3])),
      observacion: 'Evidencia observada',
      recomendacion: 'preparado',
    })
    adapter.setActor('demo-admin')
    const updated = (await x('detalle', { convocatoria_id: c.id })).candidatos[0]
    await x('resolver', {
      candidato_id: a.id,
      version: updated.version,
      resultado: 'preparado',
      conclusion_jurado: 'Conclusión del jurado de prueba',
      conclusion: 'Preparado con apoyo',
      fortalezas: 'Pulso',
      apoyos: 'Escucha',
    })
    await x('publicar', { convocatoria_id: c.id })
    await x('preferencia', {
      candidato_id: a.id,
      version: updated.version + 1,
      preferencia: 'Solo coro',
    })
    const i = await x('autorizar', {
      candidato_id: a.id,
      version: updated.version + 2,
      clase_id: 'choir',
      objetivos: 'Participar en entradas',
      inicio: '2026-10-22',
      revision: '2099-01-01',
      requiere_instrumento: false,
      comprobacion: 'No aplica instrumento',
      observacion: 'Coro solicitado y acordado',
    })
    const report = await x('informe', { candidato_id: a.id })
    expect(report.alumnos[0].nombre).toBe('Alumno Sintético A')
    expect(report.alumnos[0]).not.toHaveProperty('conclusion_jurado')
    expect(report.alumnos[0]).not.toHaveProperty('excepcion_regular')
    adapter.setActor('demo-receiver')
    const view = await mountSemester(root, adapter, { section: 'invitaciones' })
    expect(root.querySelector('[data-form=valorar]')).toBeNull()
    expect(root.textContent).toContain('Clase preseleccionada: Coro Infantil')
    submit(root, 'incorporar')
    await vi.waitFor(() => expect(root.textContent).toContain('Invitado · En periodo de prueba'))
    root.querySelector(`[data-action=expediente][data-id="${i.id}"]`).click()
    await vi.waitFor(() => expect(root.querySelector('[data-form=seguimiento]')).toBeTruthy())
    submit(root, 'seguimiento', {
      avances: 'Sigue las entradas',
      apoyos: 'Practicar escucha',
      recomendacion: 'Continuar acompañamiento',
    })
    await vi.waitFor(() =>
      expect(root.querySelector('[data-dossier]').textContent).toContain('Sigue las entradas'),
    )
    view.destroy()
  })
  it('does not show jury access to an unassigned teacher and keeps normal navigation', async () => {
    const { adapter } = await setup()
    document.body.innerHTML = '<nav><a>Mis clases</a></nav>'
    const nav = document.querySelector('nav')
    adapter.setActor('demo-other')
    await installAuditionLinks(nav, vi.fn(), adapter)
    expect(nav.textContent).toBe('Mis clases')
    adapter.setActor('demo-jury')
    await installAuditionLinks(nav, vi.fn(), adapter)
    expect(nav.querySelector('[data-route=mis-audiciones]')).toBeTruthy()
    expect(nav.querySelector('[data-route=mis-invitados]')).toBeNull()
  })
  it('persists synthetic demo work after reload and never labels a draft as sent', async () => {
    const memory = new Map(),
      storage = { getItem: (k) => memory.get(k), setItem: (k, v) => memory.set(k, v) }
    let adapter = createSemesterAdapter({ storage })
    await adapter.execute('crear', {
      nombre: 'Persistente',
      tipo: 'medio',
      periodo: '2026-2',
      clases_origen: ['source'],
      jurados: ['demo-jury'],
      responsables: ['demo-admin'],
      min_jurados: 1,
      rubrica: SEMESTER_RUBRIC,
    })
    adapter = createSemesterAdapter({ storage })
    expect((await adapter.execute('contexto')).convocatorias[0].nombre).toBe('Persistente')
  })
  it('individual report escapes content and congratulates without promising a place', () => {
    const report = {
      convocatoria: 'Audición',
      tipo: 'medio',
      periodo: '2026-2',
      emitido: '2026-10-22',
      version: 1,
      alumnos: [
        {
          nombre: '<script>Alumno</script>',
          resultado: 'preparado',
          conclusion_jurado: 'Conclusión del jurado de prueba',
          conclusion: 'Aprobado',
          fortalezas: 'Pulso',
          apoyos: 'Escucha',
          criterios: SEMESTER_RUBRIC,
          valoraciones: [],
          destinos: [],
        },
      ],
    }
    expect(reportHTML(report)).not.toContain('<script>')
    expect(familyMessage(report)).toContain('no confirma por sí sola una plaza')
    report.alumnos[0].resultado = 'continuar'
    expect(familyMessage(report)).not.toContain('Felicitaciones')
  })
})
