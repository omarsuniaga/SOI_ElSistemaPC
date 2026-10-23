import fixture from '../../../assets/data/mocks/initiation-semester.json'
export function createSemesterAdapter({
  seed = fixture,
  storage = null,
  today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santo_Domingo' }),
} = {}) {
  const key = 'soi-initiation-semester-demo-v3'
  const empty = {
    campaigns: [],
    candidates: [],
    evaluations: [],
    invitations: [],
    events: [],
    sequence: 0,
    ...structuredClone(seed),
  }
  let state = empty,
    actorId = seed.actors[0].id
  try {
    const saved = JSON.parse(storage?.getItem(key) || 'null')
    if (saved?.schema === 3) state = saved.state
  } catch {
    /* Un demo corrupto no modifica datos reales. */
  }
  const clone = (x) => structuredClone(x),
    id = () => `semester-demo-${++state.sequence}`
  const person = () => {
    const p = state.actors.find((a) => a.id === actorId)
    if (!p) throw new Error('Perfil no activo')
    return p
  }
  const manages = (c) => person().canManage || c?.responsables.includes(actorId)
  const decides = (c) => c?.responsables.includes(actorId)
  const receives = (i) =>
    state.classes.find((c) => c.id === i.clase_id)?.teacher_user_id === actorId
  const check = (condition, message) => {
    if (!condition) throw new Error(message)
  }
  const event = (action, c, a, i, data = {}, after = {}) => {
    const e = {
      id: id(),
      accion: action,
      convocatoria_id: c?.id,
      candidato_id: a?.id,
      invitacion_id: i?.id,
      datos: clone(data),
      despues: clone(after),
      creado_at: new Date().toISOString(),
      actor_id: actorId,
    }
    state.events.push(e)
    return e
  }
  const candidate = (cid, alumno) => {
    let a = state.candidates.find((a) => a.convocatoria_id === cid && a.alumno_id === alumno)
    if (!a) {
      const s = state.students.find((s) => s.id === alumno)
      check(s, 'Alumno no encontrado')
      a = {
        id: id(),
        convocatoria_id: cid,
        alumno_id: alumno,
        alumno_nombre: s.nombre_completo,
        version: 0,
        resultado: 'pendiente',
        conclusion: '',
        fortalezas: '',
        apoyos: '',
      }
      state.candidates.push(a)
    }
    return a
  }
  const activeRegular = (a) =>
    state.enrollments.some(
      (e) => e.alumno_id === a.alumno_id && e.clase_id === a.regular_clase_id && e.activo,
    ) || a.excepcion_regular?.revision >= today()
  const quorum = (c, a, i = null) =>
    state.evaluations.filter(
      (v) =>
        v.candidato_id === a.id &&
        v.invitacion_id === (i?.id || null) &&
        v.ronda === (i?.ronda || 0) &&
        v.completa &&
        c.jurados.includes(v.jurado_id),
    ).length >= c.min_jurados
  const capacity = (i, a) => {
    const c = state.classes.find((c) => c.id === i.clase_id)
    check(c, 'Clase no encontrada')
    check(
      state.enrollments.filter((e) => e.clase_id === c.id && e.activo).length < c.capacidad_maxima,
      'Clase sin cupo disponible',
    )
    check(
      !state.enrollments.some(
        (e) => e.clase_id === c.id && e.alumno_id === a.alumno_id && e.activo,
      ),
      'Ya existe matrícula activa',
    )
  }
  const report = (c, aid = null) => ({
    convocatoria: c.nombre,
    periodo: c.periodo,
    tipo: c.tipo,
    fecha: c.fecha_audicion,
    emitido: new Date().toISOString(),
    totales: (() => {
      const rows = state.candidates.filter(
        (a) => a.convocatoria_id === c.id && (!aid || a.id === aid),
      )
      return {
        convocados: rows.length,
        evaluados: rows.filter((a) =>
          state.evaluations.some((v) => v.candidato_id === a.id && c.jurados.includes(v.jurado_id)),
        ).length,
        preparados: rows.filter((a) => a.resultado === 'preparado').length,
        continuar: rows.filter((a) => a.resultado === 'continuar').length,
        ausentes: rows.filter((a) => a.resultado === 'ausente').length,
        pendientes: rows.filter((a) => ['pendiente', 'evidencia'].includes(a.resultado)).length,
      }
    })(),
    alumnos: state.candidates
      .filter((a) => a.convocatoria_id === c.id && (!aid || a.id === aid))
      .map((a) => ({
        id: a.id,
        nombre: a.alumno_nombre,
        resultado: a.resultado,
        conclusion: a.conclusion,
        fortalezas: a.fortalezas,
        apoyos: a.apoyos,
        criterios: clone(c.rubrica),
        valoraciones: clone(
          state.evaluations
            .filter((v) => v.candidato_id === a.id && c.jurados.includes(v.jurado_id))
            .map(({ notas, fortalezas, apoyos }) => ({ notas, fortalezas, apoyos })),
        ),
        destinos: state.invitations
          .filter(
            (i) =>
              (i.candidato_id === a.id ||
                state.evaluations.some(
                  (v) => v.candidato_id === a.id && v.invitacion_id === i.id,
                )) &&
              i.estado !== 'revocada',
          )
          .map((i) => ({
            ...clone(i),
            clase: state.classes.find((c) => c.id === i.clase_id).nombre,
            instrumento: state.classes.find((c) => c.id === i.clase_id).instrumento,
            horarios: state.classes.find((c) => c.id === i.clase_id).horarios,
          })),
      })),
  })
  function operation(action, d) {
    person()
    if (action === 'contexto')
      return {
        user: clone(person()),
        demo: true,
        actors: clone(state.actors),
        jurados: person().canManage ? clone(state.actors) : [],
        clases: state.classes.map((c) => ({
          ...clone(c),
          receptor: c.teacher_user_id === actorId,
        })),
        convocatorias: state.campaigns
          .filter((c) => manages(c) || c.jurados.includes(actorId))
          .map((c) => ({ ...clone(c), canManage: manages(c), canDecide: decides(c) })),
        invitaciones: state.invitations
          .filter(
            (i) =>
              receives(i) ||
              manages(
                state.campaigns.find(
                  (c) =>
                    c.id === state.candidates.find((a) => a.id === i.candidato_id).convocatoria_id,
                ),
              ),
          )
          .map((i) => ({
            ...clone(i),
            alumno_nombre: state.candidates.find((a) => a.id === i.candidato_id).alumno_nombre,
            convocatoria_id: state.candidates.find((a) => a.id === i.candidato_id).convocatoria_id,
            clase_nombre: state.classes.find((c) => c.id === i.clase_id).nombre,
          })),
      }
    if (action === 'matriculas_alumno')
      return state.invitations
        .filter(
          (i) =>
            state.candidates.find((a) => a.id === i.candidato_id)?.alumno_id === d.alumno_id &&
            ['invitado', 'fijo'].includes(i.estado) &&
            (receives(i) ||
              manages(
                state.campaigns.find(
                  (c) =>
                    c.id === state.candidates.find((a) => a.id === i.candidato_id).convocatoria_id,
                ),
              )),
        )
        .map((i) => ({
          clase: state.classes.find((c) => c.id === i.clase_id).nombre,
          condicion: i.estado,
          objetivos: i.objetivos,
          invitacion_revision: i.revision,
        }))
    if (action === 'crear') {
      check(person().canManage, 'Solo administración crea convocatorias')
      check(
        d.clases_origen?.length && d.jurados?.length && d.responsables?.length,
        'Seleccione grupos, jurados y responsables',
      )
      check(d.min_jurados >= 1 && d.min_jurados <= d.jurados.length, 'Quórum inválido')
      check(
        d.rubrica?.length && d.rubrica.every((c) => c.levels?.length >= 2 && c.levels?.length <= 5),
        'Rúbrica inválida',
      )
      const c = { ...clone(d), id: id(), estado: 'borrador', publicada: false, version: 0 }
      state.campaigns.push(c)
      event(action, c, null, null, d)
      return c
    }
    let i = state.invitations.find((i) => i.id === d.invitacion_id),
      a = state.candidates.find((a) => a.id === (i?.candidato_id || d.candidato_id))
    const c = state.campaigns.find((c) => c.id === (a?.convocatoria_id || d.convocatoria_id))
    check(c, 'Convocatoria no encontrada')
    if (action === 'detalle') {
      check(manages(c) || c.jurados.includes(actorId), 'No autorizado')
      return {
        candidatos: clone(state.candidates.filter((a) => a.convocatoria_id === c.id)),
        valoraciones: clone(
          state.evaluations.filter(
            (v) =>
              state.candidates.find((a) => a.id === v.candidato_id)?.convocatoria_id === c.id &&
              (manages(c) || v.jurado_id === actorId),
          ),
        ),
        invitaciones: manages(c)
          ? clone(
              state.invitations.filter(
                (i) =>
                  state.candidates.find((a) => a.id === i.candidato_id)?.convocatoria_id === c.id,
              ),
            )
          : [],
        revision_invitaciones: clone(
          state.invitations
            .filter((i) => i.convocatoria_final_id === c.id)
            .map((i) => ({
              ...i,
              alumno_id: state.candidates.find((a) => a.id === i.candidato_id).alumno_id,
              alumno_nombre: state.candidates.find((a) => a.id === i.candidato_id).alumno_nombre,
            })),
        ),
        historial: manages(c) ? clone(state.events.filter((e) => e.convocatoria_id === c.id)) : [],
      }
    }
    if (action === 'comparar') {
      check(manages(c) || c.jurados.includes(actorId), 'No autorizado')
      i = state.invitations.find((i) => i.id === d.revision_id && i.convocatoria_final_id === c.id)
      check(i, 'Revisión no encontrada')
      a = state.candidates.find((a) => a.id === i.candidato_id)
      return {
        invitacion: clone(i),
        diagnostico: { conclusion: a.conclusion, fortalezas: a.fortalezas, apoyos: a.apoyos },
        seguimientos: state.events
          .filter((e) => e.invitacion_id === i.id && e.accion === 'seguimiento')
          .map((e) => ({ fecha: e.creado_at, datos: clone(e.datos), ronda: e.despues.ronda })),
      }
    }
    if (action === 'alumnos_origen') {
      check(manages(c), 'No autorizado')
      return clone(
        state.students.filter((s) =>
          state.enrollments.some(
            (e) => e.alumno_id === s.id && e.activo && c.clases_origen.includes(e.clase_id),
          ),
        ),
      )
    }
    if (['abrir', 'cerrar', 'jurados', 'agregar', 'vincular_final', 'reabrir'].includes(action)) {
      check(manages(c), 'Solo gestión de convocatoria')
      check(!c.publicada || action === 'reabrir', 'Resultados publicados; requiere reapertura')
      if (action === 'agregar') {
        check(
          state.enrollments.some(
            (e) => e.alumno_id === d.alumno_id && e.activo && c.clases_origen.includes(e.clase_id),
          ),
          'Sin matrícula de origen',
        )
        a = candidate(c.id, d.alumno_id)
        a.regular_clase_id = d.regular_clase_id || null
      }
      if (action === 'vincular_final') {
        i = state.invitations.find((i) => i.id === d.revision_id)
        check(
          c.tipo === 'final' && i?.estado === 'invitado' && !i.convocatoria_final_id,
          'Invitación no disponible para revisión',
        )
        const origin = state.candidates.find((a) => a.id === i.candidato_id)
        a = candidate(c.id, origin.alumno_id)
        a.regular_clase_id = origin.regular_clase_id
        i.convocatoria_final_id = c.id
      }
      if (action === 'abrir') c.estado = 'abierta'
      if (action === 'cerrar') c.estado = 'cerrada'
      if (action === 'jurados') {
        check(d.jurados.length >= c.min_jurados, 'Jurados insuficientes')
        c.jurados = clone(d.jurados)
        state.candidates
          .filter(
            (a) =>
              a.convocatoria_id === c.id &&
              a.resultado !== 'pendiente' &&
              a.resultado !== 'ausente',
          )
          .forEach((a) => {
            a.resultado = 'evidencia'
            a.version++
          })
      }
      if (action === 'reabrir') {
        check(decides(c) && d.observacion?.trim(), 'Reapertura requiere responsable y motivo')
        c.publicada = false
        c.estado = 'abierta'
        state.candidates
          .filter((a) => a.convocatoria_id === c.id)
          .forEach((a) => {
            if (a.resultado !== 'ausente') a.resultado = 'evidencia'
            a.version++
          })
        state.invitations
          .filter(
            (i) =>
              state.candidates.find((a) => a.id === i.candidato_id)?.convocatoria_id === c.id &&
              i.estado === 'autorizada',
          )
          .forEach((i) => {
            i.estado = 'revocada'
            i.version++
          })
      }
      c.version++
      event(action, c, a, i, d)
      return { ok: true }
    }
    if (action === 'valorar') {
      check(
        c.jurados.includes(actorId) && c.estado === 'abierta' && !c.publicada,
        'No está autorizado como jurado activo',
      )
      i = state.invitations.find((i) => i.id === d.destino_revision_id)
      check(
        c.tipo === 'medio'
          ? !i
          : i?.convocatoria_final_id === c.id &&
              state.candidates.find((a) => a.id === i.candidato_id).alumno_id === a.alumno_id,
        'Seleccione la invitación que evalúa',
      )
      let complete = true,
        observed = 0
      check(
        Object.keys(d.notas).every((k) => c.rubrica.some((x) => x.key === k)),
        'Criterio desconocido',
      )
      for (const criterion of c.rubrica) {
        const score = d.notas[criterion.key]
        if (score == null) {
          if (criterion.required) complete = false
        } else {
          check(
            Number.isInteger(score) && score >= 1 && score <= criterion.levels.length,
            'Nota fuera de escala',
          )
          observed++
        }
      }
      check(
        d.observacion?.trim() && ['preparado', 'continuar', 'evidencia'].includes(d.recomendacion),
        'Registre evidencia y recomendación',
      )
      const entry = {
        ...clone(d),
        invitacion_id: i?.id || null,
        ronda: i?.ronda || 0,
        jurado_id: actorId,
        completa: complete && observed > 0,
      }
      const old = state.evaluations.find(
        (v) =>
          v.candidato_id === a.id &&
          v.jurado_id === actorId &&
          v.invitacion_id === entry.invitacion_id &&
          v.ronda === entry.ronda,
      )
      if (old) Object.assign(old, entry)
      else state.evaluations.push(entry)
      if (a.resultado !== 'pendiente') a.resultado = 'evidencia'
      a.version++
      event(action, c, a, i, d)
      return { ok: true }
    }
    if (
      [
        'resolver',
        'preferencia',
        'publicar',
        'autorizar',
        'regularizar',
        'excepcion_regular',
        'revocar',
        'resolver_invitacion',
        'informe',
        'comunicacion',
        'entrega',
      ].includes(action)
    )
      check(decides(c), 'Solo el responsable académico designado puede decidir')
    if (
      ['resolver', 'preferencia', 'autorizar', 'regularizar', 'excepcion_regular'].includes(action)
    )
      check(a.version === d.version, 'El expediente cambió; recargue')
    if (action === 'resolver') {
      check(c.estado === 'abierta' && !c.publicada, 'Reabra los resultados')
      check(
        d.conclusion?.trim() && d.conclusion_jurado?.trim(),
        'Registre conclusión del jurado y resolución académica',
      )
      if (['preparado', 'continuar'].includes(d.resultado))
        check(
          c.tipo === 'medio'
            ? quorum(c, a)
            : state.invitations
                .filter(
                  (i) =>
                    i.convocatoria_final_id === c.id &&
                    state.candidates.find((a) => a.id === i.candidato_id).alumno_id === a.alumno_id,
                )
                .every((i) => quorum(c, a, i)),
          'Faltan valoraciones completas',
        )
      Object.assign(a, {
        resultado: d.resultado,
        conclusion_jurado: d.conclusion_jurado,
        conclusion: d.conclusion,
        fortalezas: d.fortalezas,
        apoyos: d.apoyos,
        version: a.version + 1,
      })
      event(action, c, a, null, d)
      return clone(a)
    }
    if (action === 'publicar') {
      check(
        state.candidates.some((a) => a.convocatoria_id === c.id) &&
          !state.candidates.some((a) => a.convocatoria_id === c.id && a.resultado === 'pendiente'),
        'Resuelva los candidatos',
      )
      c.publicada = true
      c.estado = 'cerrada'
      event(action, c, null, null, d)
      return clone(c)
    }
    if (action === 'preferencia') {
      check(
        a.resultado === 'preparado' && c.publicada && c.tipo === 'medio',
        'Falta aprobación publicada',
      )
      check(d.preferencia?.trim(), 'Registre preferencia')
      a.preferencia = {
        texto: d.preferencia,
        consultado_at: new Date().toISOString(),
        actor: actorId,
      }
      a.version++
      event(action, c, a, null, d)
      return clone(a)
    }
    if (action === 'regularizar') {
      check(
        state.enrollments.some(
          (e) => e.alumno_id === a.alumno_id && e.clase_id === d.regular_clase_id && e.activo,
        ),
        'Seleccione matrícula regular activa',
      )
      a.regular_clase_id = d.regular_clase_id
      a.excepcion_regular = null
      a.version++
      event(action, c, a, null, d)
      return { ok: true }
    }
    if (action === 'excepcion_regular') {
      check(
        d.observacion?.trim() && d.revision > today(),
        'Excepción exige motivo y revisión futura',
      )
      a.excepcion_regular = { motivo: d.observacion, revision: d.revision, actor: actorId }
      a.version++
      event(action, c, a, null, d)
      return { ok: true }
    }
    if (action === 'autorizar') {
      check(
        c.tipo === 'medio' && c.publicada && a.resultado === 'preparado' && a.preferencia,
        'Faltan aprobación y preferencia',
      )
      check(
        d.objetivos?.trim() && d.comprobacion?.trim() && d.observacion?.trim(),
        'Defina objetivos y comprobación',
      )
      check(d.revision > today() && d.revision > d.inicio, 'Revisión futura requerida')
      check(!c.clases_origen.includes(d.clase_id), 'Destino y origen deben ser distintos')
      capacity(d, a)
      check(
        !state.invitations.some(
          (i) =>
            state.candidates.find((ca) => ca.id === i.candidato_id)?.alumno_id === a.alumno_id &&
            i.clase_id === d.clase_id &&
            ['autorizada', 'invitado', 'fijo'].includes(i.estado),
        ),
        'Destino ya autorizado',
      )
      check(
        !d.requiere_instrumento || d.recurso_referencia?.trim(),
        'Identifique el recurso comprobado',
      )
      check(
        !d.requiere_instrumento ||
          !state.invitations.some(
            (i) =>
              i.requiere_instrumento &&
              i.recurso_referencia.toLowerCase().trim() ===
                d.recurso_referencia.toLowerCase().trim() &&
              ['autorizada', 'invitado', 'fijo'].includes(i.estado),
          ),
        'Recurso ya reservado',
      )
      i = { ...clone(d), id: id(), estado: 'autorizada', version: 0, ronda: 1, candidato_id: a.id }
      state.invitations.push(i)
      event(action, c, a, i, d)
      return clone(i)
    }
    if (action === 'incorporar') {
      check(receives(i), 'Se requiere receptor asignado con permiso de inscripción')
      if (i.estado === 'invitado') return clone(i)
      check(
        i.estado === 'autorizada' &&
          i.version === d.version &&
          c.publicada &&
          a.resultado === 'preparado' &&
          i.revision > today(),
        'Autorización no vigente',
      )
      check(activeRegular(a), 'Regularice teoría y solfeo o solicite excepción')
      check(
        !i.requiere_instrumento ||
          (d.disponibilidad_confirmada && d.recurso_referencia === i.recurso_referencia),
        'Confirme disponibilidad del recurso',
      )
      capacity(i, a)
      let en = state.enrollments.find(
        (e) => e.alumno_id === a.alumno_id && e.clase_id === i.clase_id,
      )
      if (!en) {
        en = { id: id(), alumno_id: a.alumno_id, clase_id: i.clase_id }
        state.enrollments.push(en)
      }
      Object.assign(en, {
        activo: true,
        condicion: 'invitado',
        invitacion_revision: i.revision,
        audicion_candidato_id: a.id,
      })
      Object.assign(i, { estado: 'invitado', version: i.version + 1, inscripcion_id: en.id })
      event(action, c, a, i, d)
      return clone(i)
    }
    if (action === 'expediente') {
      check(receives(i) || manages(c), 'No autorizado')
      return {
        invitacion: clone(i),
        alumno_nombre: a.alumno_nombre,
        diagnostico: { conclusion: a.conclusion, fortalezas: a.fortalezas, apoyos: a.apoyos },
        seguimientos: state.events
          .filter((e) => e.invitacion_id === i.id && e.accion === 'seguimiento')
          .map((e) => ({ fecha: e.creado_at, datos: clone(e.datos), ronda: e.despues.ronda })),
        canDecide: decides(c),
        regular_activa: activeRegular(a),
      }
    }
    if (action === 'seguimiento') {
      check(
        i.estado === 'invitado' && (receives(i) || decides(c)),
        'Seguimiento reservado al receptor',
      )
      check(
        d.avances?.trim() && d.apoyos?.trim() && d.recomendacion?.trim(),
        'Registre avances, apoyos y recomendación',
      )
      event(action, c, a, i, d, { ronda: i.ronda })
      return { ok: true }
    }
    if (action === 'revocar') {
      check(
        i.estado === 'autorizada' && i.version === d.version && d.observacion?.trim(),
        'Revocación no válida',
      )
      i.estado = 'revocada'
      i.version++
      event(action, c, a, i, d)
      return { ok: true }
    }
    if (action === 'resolver_invitacion') {
      check(i.estado === 'invitado' && i.version === d.version, 'La invitación cambió; recargue')
      check(d.observacion?.trim() && d.plan?.trim(), 'Registre decisión y plan')
      check(
        state.events.some(
          (e) =>
            e.accion === 'seguimiento' && e.invitacion_id === i.id && e.despues.ronda === i.ronda,
        ),
        'Falta seguimiento de esta ronda',
      )
      const final = state.campaigns.find((c) => c.id === i.convocatoria_final_id),
        fa = state.candidates.find(
          (x) => x.convocatoria_id === final?.id && x.alumno_id === a.alumno_id,
        )
      check(
        final?.publicada &&
          fa &&
          ['preparado', 'continuar'].includes(fa.resultado) &&
          quorum(final, fa, i),
        'Falta audición final publicada con evidencia actual',
      )
      check(activeRegular(a), 'Regularice teoría y solfeo')
      const en = state.enrollments.find((e) => e.id === i.inscripcion_id)
      check(en?.activo && en.condicion === 'invitado', 'La matrícula cambió')
      if (d.accion === 'prorrogar') {
        check(
          d.revision > i.revision && d.revision > today() && d.objetivos?.trim(),
          'Prórroga exige revisión y objetivos',
        )
        i.revision = d.revision
        i.objetivos = d.objetivos
        i.ronda++
        i.convocatoria_final_id = null
        en.invitacion_revision = i.revision
      } else {
        check(['confirmar', 'finalizar'].includes(d.accion), 'Decisión desconocida')
        i.estado = d.accion === 'confirmar' ? 'fijo' : 'finalizada'
        en.activo = d.accion === 'confirmar'
        en.condicion = d.accion === 'confirmar' ? 'fijo' : 'invitado'
      }
      i.version++
      event(action, c, a, i, d)
      return clone(i)
    }
    if (action === 'informe') {
      check(c.publicada, 'Publique los resultados')
      const r = report(c, a?.id)
      r.version =
        state.events.filter(
          (e) => e.accion === 'informe' && e.convocatoria_id === c.id && e.candidato_id === a?.id,
        ).length + 1
      event(action, c, a, null, r)
      return r
    }
    if (action === 'comunicacion') {
      check(
        c.publicada &&
          a &&
          d.destinatario?.trim() &&
          d.contacto?.trim() &&
          d.consentimiento?.trim() &&
          d.revision_confirmada,
        'Revise destinatario y consentimiento',
      )
      const existing = state.events.find(
        (e) =>
          e.accion === 'comunicacion' &&
          e.datos.operacion_id &&
          e.datos.operacion_id === d.operacion_id,
      )
      if (existing) {
        check(
          existing.candidato_id === a.id &&
            existing.actor_id === actorId &&
            existing.datos.destinatario === d.destinatario &&
            existing.datos.contacto === d.contacto,
          'Identificador de operación reutilizado',
        )
        return clone(existing.datos)
      }
      const r = {
        operacion_id: d.operacion_id,
        destinatario: d.destinatario,
        contacto: d.contacto,
        canal: 'manual',
        estado: 'borrador_manual',
        consentimiento: d.consentimiento,
        informe: report(c, a.id),
      }
      event(action, c, a, null, r)
      return r
    }
    if (action === 'entrega') {
      check(d.entrega_confirmada && d.observacion?.trim(), 'Confirme la entrega manual realizada')
      const source = state.events.find(
        (e) =>
          e.id === d.comunicacion_id && e.accion === 'comunicacion' && e.convocatoria_id === c.id,
      )
      check(source, 'Comunicación no encontrada')
      if (
        !state.events.some((e) => e.accion === 'entrega' && e.datos.comunicacion_id === source.id)
      )
        event(action, c, a, null, d)
      return { estado: 'entrega_confirmada' }
    }
    throw new Error('Operación no reconocida')
  }
  return {
    demo: true,
    setActor(id) {
      actorId = id
    },
    async execute(action, data = {}) {
      const previous = clone(state)
      try {
        const value = operation(action, data)
        storage?.setItem(key, JSON.stringify({ schema: 3, state }))
        return clone(value)
      } catch (error) {
        state = previous
        throw error
      }
    },
    reset() {
      state = clone(empty)
      storage?.removeItem(key)
    },
  }
}
