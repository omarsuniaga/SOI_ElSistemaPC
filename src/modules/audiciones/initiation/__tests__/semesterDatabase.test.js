// @vitest-environment node
import { PGlite } from '@electric-sql/pglite'
import { beforeAll, afterAll, beforeEach, afterEach, describe, it, expect } from 'vitest'
import { bootstrap, ids, rubric } from './fixtures/semesterDatabase.js'
let db, campaign, candidate
const q = async (sql, params = []) => (await db.query(sql, params)).rows
const actor = async (key) => {
  await db.exec('RESET ROLE')
  await q("select set_config('request.jwt.claims',$1,true)", [
    JSON.stringify({ sub: ids[key], role: 'authenticated' }),
  ])
  await db.exec('SET LOCAL ROLE authenticated')
}
const call = async (action, data = {}) =>
  (await q('select public.iniciacion_semestre($1,$2) result', [action, JSON.stringify(data)]))[0]
    .result
const fail = async (action, data, message) => {
  await db.exec('SAVEPOINT rejected')
  try {
    await expect(call(action, data)).rejects.toThrow(message)
  } finally {
    await db.exec('ROLLBACK TO SAVEPOINT rejected')
  }
}
const create = async (tipo = 'medio') =>
  call('crear', {
    nombre: 'Audición de prueba',
    tipo,
    periodo: '2026 semestre 2',
    clases_origen: [ids.source],
    cohorte_desde: '2026-01-01',
    cohorte_hasta: '2026-12-31',
    fecha_audicion: '2026-12-31',
    jurados: [ids.jury, ids.jury2],
    responsables: [ids.admin],
    min_jurados: 2,
    rubrica: rubric,
  })
async function evaluate(c = campaign, a = candidate, extra = {}) {
  for (const key of ['jury', 'jury2']) {
    await actor(key)
    await call('valorar', {
      candidato_id: a.id,
      notas: { pulso: 3, escucha: 2 },
      observacion: 'Imita el motivo con apoyo puntual',
      recomendacion: 'preparado',
      fortalezas: 'Sostiene pulso',
      apoyos: 'Escuchar antes de repetir',
      ...extra,
    })
  }
  await actor('admin')
}
async function prepared() {
  await evaluate()
  candidate = (await q('select * from public.iniciacion_candidatos where id=$1', [candidate.id]))[0]
  candidate = await call('resolver', {
    candidato_id: candidate.id,
    version: candidate.version,
    resultado: 'preparado',
    conclusion_jurado: 'Conclusión del jurado de prueba',
    conclusion: 'Jurado concluye preparado; coordinación ratifica',
    fortalezas: 'Pulso estable',
    apoyos: 'Escucha guiada',
  })
  await call('publicar', { convocatoria_id: campaign.id })
  candidate = await call('preferencia', {
    candidato_id: candidate.id,
    version: candidate.version,
    preferencia: 'Coro y flauta',
  })
}
const authorize = async (classId = ids.dest, extra = {}) =>
  call('autorizar', {
    candidato_id: candidate.id,
    version: candidate.version,
    clase_id: classId,
    objetivos: 'Sostener el pulso y participar en grupo',
    inicio: '2026-10-01',
    revision: '2099-06-01',
    requiere_instrumento: false,
    comprobacion: 'Coro no requiere instrumento; cupo y horario revisados',
    observacion: 'Destino acordado con la familia',
    ...extra,
  })
const enroll = async (i) => {
  await actor('receiver')
  const r = await call('incorporar', {
    invitacion_id: i.id,
    version: i.version,
    recurso_referencia: i.recurso_referencia,
    disponibilidad_confirmada: true,
  })
  await actor('admin')
  return r
}
describe('Semester PostgreSQL authorization and workflow', () => {
  beforeAll(async () => {
    db = new PGlite()
    await bootstrap(db)
  }, 30000)
  afterAll(async () => db?.close())
  beforeEach(async () => {
    await db.exec('BEGIN')
    await actor('admin')
    campaign = await create()
    await call('agregar', {
      convocatoria_id: campaign.id,
      alumno_id: ids.student,
      regular_clase_id: ids.source,
    })
    candidate = (
      await q('select * from public.iniciacion_candidatos where convocatoria_id=$1', [campaign.id])
    )[0]
    await call('abrir', { convocatoria_id: campaign.id })
  })
  afterEach(async () => db.exec('ROLLBACK'))
  it('only assigned jurors evaluate; receiving teacher and technical admin cannot self-assign evaluation', async () => {
    for (const key of ['receiver', 'other', 'admin']) {
      await actor(key)
      await fail(
        'valorar',
        { candidato_id: candidate.id, notas: { pulso: 3, escucha: 3 } },
        /jurado/,
      )
    }
    await actor('other')
    expect((await call('contexto')).convocatorias).toEqual([])
    await fail('detalle', { convocatoria_id: campaign.id }, /No autorizado/)
  })
  it('requires explicit academic assignment, complete quorum, and published approval before preference', async () => {
    await actor('jury')
    await fail(
      'resolver',
      {
        candidato_id: candidate.id,
        version: 0,
        resultado: 'preparado',
        conclusion_jurado: 'Conclusión del jurado de prueba',
        conclusion: 'Prueba',
      },
      /responsable académico/,
    )
    await actor('admin')
    await fail(
      'resolver',
      {
        candidato_id: candidate.id,
        version: 0,
        resultado: 'preparado',
        conclusion_jurado: 'Conclusión del jurado de prueba',
        conclusion: 'Prueba',
      },
      /Faltan valoraciones/,
    )
    await fail(
      'preferencia',
      { candidato_id: candidate.id, version: 0, preferencia: 'Flauta' },
      /aprobación publicada/,
    )
    await db.exec('RESET ROLE')
    await q('update public.iniciacion_convocatorias set responsables=$1 where id=$2', [
      [ids.other],
      campaign.id,
    ])
    await actor('admin')
    await fail('publicar', { convocatoria_id: campaign.id }, /responsable académico/)
  })
  it('keeps no-observed incomplete and rejects scores outside configured levels', async () => {
    await actor('jury')
    await fail(
      'valorar',
      {
        candidato_id: candidate.id,
        notas: { pulso: 4, escucha: 3 },
        observacion: 'Evidencia',
        recomendacion: 'preparado',
      },
      /escala/,
    )
    await call('valorar', {
      candidato_id: candidate.id,
      notas: { pulso: 3, escucha: null },
      observacion: 'No pudo observarse escucha',
      recomendacion: 'evidencia',
    })
    expect((await q('select completa from public.iniciacion_valoraciones'))[0].completa).toBe(false)
  })
  it('separates authorization and enrollment, replays safely, and preserves theory', async () => {
    await prepared()
    let i = await authorize()
    expect(
      await q('select id from public.alumnos_clases where clase_id=$1', [ids.dest]),
    ).toHaveLength(0)
    await actor('other')
    await fail('incorporar', { invitacion_id: i.id, version: 0 }, /receptor/)
    i = await enroll(i)
    const repeated = await enroll(i)
    expect(repeated.id).toBe(i.id)
    expect(
      await q('select id from public.alumnos_clases where clase_id=$1', [ids.dest]),
    ).toHaveLength(1)
    expect(
      (
        await q('select activo from public.alumnos_clases where clase_id=$1 and alumno_id=$2', [
          ids.source,
          ids.student,
        ])
      )[0].activo,
    ).toBe(true)
  })
  it('revalidates capacity and enrollment permission at incorporation', async () => {
    await prepared()
    let i = await authorize()
    await db.exec('RESET ROLE')
    await q('update public.clases set capacidad_maxima=0 where id=$1', [ids.dest])
    await actor('receiver')
    await fail('incorporar', { invitacion_id: i.id, version: 0 }, /sin cupo/)
    await db.exec('RESET ROLE')
    await q('update public.permisos_maestros set puede_inscribir_clases=false')
    await actor('receiver')
    await fail('incorporar', { invitacion_id: i.id, version: 0 }, /permiso/)
  })
  it('reserves an identified instrument exclusively and requires receiver revalidation', async () => {
    await prepared()
    const i = await authorize(ids.dest2, {
      requiere_instrumento: true,
      recurso_referencia: 'FL-001',
      comprobacion: 'Instrumento FL-001 revisado físicamente por coordinación',
    })
    await actor('receiver')
    await fail('incorporar', { invitacion_id: i.id, version: 0 }, /disponibilidad/)
    await actor('admin')
    await fail(
      'autorizar',
      {
        candidato_id: candidate.id,
        version: candidate.version,
        clase_id: ids.dest,
        objetivos: 'Prueba',
        inicio: '2026-10-01',
        revision: '2099-01-01',
        requiere_instrumento: true,
        recurso_referencia: 'fl-001',
        comprobacion: 'Prueba',
        observacion: 'Prueba',
      },
      /duplicate key/,
    )
  })
  it('requires regular theory enrollment or a dated academic exception', async () => {
    await prepared()
    const i = await authorize()
    await db.exec('RESET ROLE')
    await q('update public.alumnos_clases set activo=false where alumno_id=$1', [ids.student])
    await actor('receiver')
    await fail('incorporar', { invitacion_id: i.id, version: 0 }, /teoría/)
    await actor('admin')
    await call('excepcion_regular', {
      candidato_id: candidate.id,
      version: candidate.version,
      observacion: 'Regularizar teoría con coordinación',
      revision: '2099-01-01',
    })
    await enroll(i)
  })
  it('does not expose individual jury notes or unrelated receiving candidates', async () => {
    await prepared()
    await enroll(await authorize())
    await actor('jury')
    expect(await q('select jurado_id from public.iniciacion_valoraciones')).toEqual([
      { jurado_id: ids.jury },
    ])
    expect((await call('detalle', { convocatoria_id: campaign.id })).valoraciones).toHaveLength(1)
    await actor('receiver')
    expect(await q('select id from public.iniciacion_valoraciones')).toHaveLength(0)
    expect(await q('select id from public.iniciacion_decisiones')).toHaveLength(0)
    await fail('detalle', { convocatoria_id: campaign.id }, /No autorizado/)
  })
  it('withdrawn jurors lose writes, preserve history, and invalidate pending resolutions', async () => {
    await evaluate()
    await call('jurados', {
      convocatoria_id: campaign.id,
      jurados: [ids.jury2, ids.admin],
      observacion: 'Cambio de jurado',
    })
    await actor('jury')
    await fail('valorar', { candidato_id: candidate.id, notas: { pulso: 3, escucha: 3 } }, /jurado/)
    expect(await q('select id from public.iniciacion_valoraciones')).toHaveLength(0)
    await actor('admin')
    expect(await q('select id from public.iniciacion_valoraciones')).toHaveLength(2)
  })
  it('requires final published evidence and resolves two destinations independently', async () => {
    await prepared()
    let one = await enroll(await authorize())
    let two = await enroll(
      await authorize(ids.dest2, {
        requiere_instrumento: true,
        recurso_referencia: 'FL-001',
        comprobacion: 'Flauta disponible y revisada',
      }),
    )
    await actor('receiver')
    for (const i of [one, two])
      await call('seguimiento', {
        invitacion_id: i.id,
        avances: 'Sostiene pulso',
        apoyos: 'Practicar escucha',
        recomendacion: 'Continuar',
        evidencia: 'Registro de clase del período',
      })
    await actor('admin')
    await fail(
      'resolver_invitacion',
      {
        invitacion_id: one.id,
        version: one.version,
        accion: 'confirmar',
        observacion: 'Adaptación lograda',
        plan: 'Mantener teoría',
      },
      /audición final/,
    )
    const final = await create('final')
    for (const i of [one, two])
      await call('vincular_final', { convocatoria_id: final.id, revision_id: i.id })
    await call('abrir', { convocatoria_id: final.id })
    let finalCandidate = (
      await q('select * from public.iniciacion_candidatos where convocatoria_id=$1', [final.id])
    )[0]
    for (const i of [one, two]) await evaluate(final, finalCandidate, { destino_revision_id: i.id })
    finalCandidate = (
      await q('select * from public.iniciacion_candidatos where id=$1', [finalCandidate.id])
    )[0]
    await call('resolver', {
      candidato_id: finalCandidate.id,
      version: finalCandidate.version,
      resultado: 'preparado',
      conclusion_jurado: 'Conclusión del jurado de prueba',
      conclusion: 'Jurado final: evidencia por destino revisada',
    })
    await call('publicar', { convocatoria_id: final.id })
    one = await call('resolver_invitacion', {
      invitacion_id: one.id,
      version: one.version,
      accion: 'confirmar',
      observacion: 'Adaptación lograda',
      plan: 'Continuar teoría y ensamble',
    })
    two = await call('resolver_invitacion', {
      invitacion_id: two.id,
      version: two.version,
      accion: 'prorrogar',
      observacion: 'Necesita más tiempo',
      plan: 'Apoyo semanal',
      revision: '2099-07-01',
      objetivos: 'Ajustar escucha en grupo',
    })
    expect(one.estado).toBe('fijo')
    expect(two).toMatchObject({ estado: 'invitado', ronda: 2, convocatoria_final_id: null })
    await fail(
      'resolver_invitacion',
      {
        invitacion_id: two.id,
        version: two.version,
        accion: 'confirmar',
        observacion: 'Prueba',
        plan: 'Apoyo',
      },
      /seguimiento de esta ronda/,
    )
  })
  it('makes reports individual and records manual communications without inventing a send', async () => {
    await prepared()
    const report = await call('informe', { candidato_id: candidate.id })
    expect(report.alumnos).toHaveLength(1)
    expect(report.alumnos[0].nombre).toBe('Alumno Sintético')
    expect(report.version).toBe(1)
    await fail(
      'comunicacion',
      { candidato_id: candidate.id, destinatario: 'Tutor sintético', contacto: 'ejemplo.invalid' },
      /consentimiento/,
    )
    const message = await call('comunicacion', {
      candidato_id: candidate.id,
      destinatario: 'Tutor sintético',
      contacto: 'tutor@example.invalid',
      consentimiento: 'Registro sintético de consentimiento',
      revision_confirmada: true,
    })
    expect(message.estado).toBe('borrador_manual')
    expect(message.informe.alumnos).toHaveLength(1)
  })
  it('rejects direct writers and anonymous invocation without trusting editable metadata', async () => {
    await db.exec('SAVEPOINT denied')
    await expect(
      q('insert into public.iniciacion_invitaciones(candidato_id) values($1)', [candidate.id]),
    ).rejects.toThrow(/permission denied/)
    await db.exec(
      'ROLLBACK TO SAVEPOINT denied; RESET ROLE; SET LOCAL ROLE anon; SAVEPOINT anon_denied',
    )
    await expect(call('contexto')).rejects.toThrow(/permission denied/)
    await db.exec('ROLLBACK TO SAVEPOINT anon_denied')
  })
  it('rechecks a known inventory resource after academic authorization', async () => {
    await prepared()
    const i = await authorize(ids.dest2, {
      requiere_instrumento: true,
      recurso_referencia: 'FL-001',
      comprobacion: 'Recurso verificado físicamente',
    })
    await db.exec('RESET ROLE')
    await q("insert into public.instrumentos(codigo,estado) values('FL-001','fuera_de_uso')")
    await actor('receiver')
    await fail(
      'incorporar',
      {
        invitacion_id: i.id,
        version: 0,
        recurso_referencia: 'FL-001',
        disponibilidad_confirmada: true,
      },
      /inventario indica/,
    )
    await actor('admin')
    expect(
      await q('select id from public.alumnos_clases where clase_id=$1', [ids.dest2]),
    ).toHaveLength(0)
  })
  it('replays a reviewed manual draft and delivery without duplicating events', async () => {
    await prepared()
    const data = {
      candidato_id: candidate.id,
      operacion_id: '90000000-0000-0000-0000-000000000001',
      destinatario: 'Tutor sintético',
      contacto: 'tutor@example.invalid',
      consentimiento: 'Referencia sintética',
      revision_confirmada: true,
    }
    const first = await call('comunicacion', data)
    expect(await call('comunicacion', data)).toEqual(first)
    expect(
      await q("select id from public.iniciacion_decisiones where accion='comunicacion'"),
    ).toHaveLength(1)
    const [event] = await q(
      "select id from public.iniciacion_decisiones where accion='comunicacion'",
    )
    const delivery = {
      convocatoria_id: campaign.id,
      comunicacion_id: event.id,
      entrega_confirmada: true,
      observacion: 'Entrega manual confirmada en prueba',
    }
    await call('entrega', delivery)
    await call('entrega', delivery)
    expect(
      await q("select id from public.iniciacion_decisiones where accion='entrega'"),
    ).toHaveLength(1)
    await fail('comunicacion', { ...data, contacto: 'otra@example.invalid' }, /reutilizado/)
  })
  it('invalidates preference and pending authorizations when published results reopen', async () => {
    await prepared()
    await authorize()
    await call('reabrir', {
      convocatoria_id: campaign.id,
      observacion: 'Corrección documentada de evidencia',
    })
    const row = (
      await q('select resultado,preferencia from public.iniciacion_candidatos where id=$1', [
        candidate.id,
      ])
    )[0]
    expect(row).toEqual({ resultado: 'evidencia', preferencia: null })
    expect((await q('select estado from public.iniciacion_invitaciones'))[0].estado).toBe(
      'revocada',
    )
  })
  it('rejects stale candidate versions and never turns an active fixed enrollment into a guest', async () => {
    await prepared()
    await fail(
      'preferencia',
      { candidato_id: candidate.id, version: 0, preferencia: 'Otra preferencia' },
      /expediente cambió/,
    )
    await db.exec('RESET ROLE')
    await q('insert into public.alumnos_clases(alumno_id,clase_id) values($1,$2)', [
      ids.student,
      ids.dest,
    ])
    await actor('admin')
    await fail(
      'autorizar',
      {
        candidato_id: candidate.id,
        version: candidate.version,
        clase_id: ids.dest,
        objetivos: 'Prueba',
        inicio: '2026-10-01',
        revision: '2099-01-01',
        requiere_instrumento: false,
        comprobacion: 'Sin instrumento',
        observacion: 'Prueba',
      },
      /Ya inscrito|matrícula activa/,
    )
    expect(
      (await q('select condicion from public.alumnos_clases where clase_id=$1', [ids.dest]))[0]
        .condicion,
    ).toBe('fijo')
  })
  it('blocks old RPC, direct invitation writes and anonymous access', async () => {
    await expect(
      q("select public.iniciacion_decidir($1,0,'invitar','{}')", [candidate.id]),
    ).rejects.toThrow(/permission denied/)
  })
})
