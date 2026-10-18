// Extra test phases for run_tests.mjs (imported). Kept separate so the main file stays readable.
//   flows       end-to-end maintenance flows with triggers ON and foreign keys enforced
//   collateral  statements outside the eight tables must behave identically before/after
//   policies    the exact whitelist of policies allowed on the eight tables after the migration
export function makeExtraPhases({ ID, TABLES }) {
  const catalog = (actor) => ({
    name: `flow: catalogue maintenance (programa, salon, horario) as ${actor}`, actor, kind: 'flow', expect: 'allowed',
    sql: `DO $flow$ DECLARE p uuid; s uuid; h uuid; BEGIN
      INSERT INTO public.programas (nombre) VALUES ('Programa flujo') RETURNING id INTO p;
      UPDATE public.programas SET descripcion = 'editado' WHERE id = p;
      IF NOT FOUND THEN RAISE EXCEPTION 'programa update affected 0 rows'; END IF;
      INSERT INTO public.salones (nombre) VALUES ('Salon flujo') RETURNING id INTO s;
      UPDATE public.salones SET capacidad = 12 WHERE id = s;
      IF NOT FOUND THEN RAISE EXCEPTION 'salon update affected 0 rows'; END IF;
      INSERT INTO public.horarios (clase_id, maestro_id, salon_id, dia_semana, hora_inicio, hora_fin)
        VALUES ('${ID.clase}', '${ID.m_titular}', s, 3, '09:00', '10:00') RETURNING id INTO h;
      UPDATE public.horarios SET activo = false WHERE id = h;
      IF NOT FOUND THEN RAISE EXCEPTION 'horario update affected 0 rows'; END IF;
      DELETE FROM public.horarios WHERE id = h;
    END $flow$`,
  });

  const teacher = (actor) => ({
    name: `flow: class record (event, methodology, homework, status update) as ${actor}`, actor, kind: 'flow', expect: 'allowed',
    sql: `DO $flow$ DECLARE e uuid; BEGIN
      INSERT INTO public.class_events (teacher_id, student_id, session_id, event_date, status)
        VALUES ('${ID.m_titular}', '${ID.alumno3}', '${ID.sesion}', current_date, 'draft') RETURNING id INTO e;
      INSERT INTO public.class_event_methodology (class_event_id, warmup) VALUES (e, 'calentamiento');
      INSERT INTO public.homework_assignments (class_event_id, student_id, teacher_id, description)
        VALUES (e, '${ID.alumno3}', '${ID.m_titular}', 'tarea');
      UPDATE public.class_events SET status = 'completed' WHERE id = e;
      IF NOT FOUND THEN RAISE EXCEPTION 'event update affected 0 rows'; END IF;
      UPDATE public.class_event_methodology SET closing_observation = 'ok' WHERE class_event_id = e;
      IF NOT FOUND THEN RAISE EXCEPTION 'methodology update affected 0 rows'; END IF;
    END $flow$`,
  });

  function flowCases() {
    const c = [];
    for (const a of ['admin', 'admin2', 'admin3', 'admin4', 'admin5', 'coordinacion', 'superadmin']) c.push(catalog(a));
    c.push(teacher('maestro_titular'), teacher('maestro_suplente'));
    c.push({
      name: 'flow: titular plans content and marks it covered', actor: 'maestro_titular', kind: 'flow', expect: 'allowed',
      sql: `DO $flow$ DECLARE p uuid; BEGIN
        INSERT INTO public.planned_content (maestro_id, clase_id, node_id, planned_date)
          VALUES ('${ID.m_titular}', '${ID.clase}', '${ID.nodo}', current_date + 7) RETURNING id INTO p;
        UPDATE public.planned_content SET covered = true WHERE id = p;
        IF NOT FOUND THEN RAISE EXCEPTION 'plan update affected 0 rows'; END IF;
      END $flow$`,
    });
    c.push({
      name: 'flow: admin dashboard widget queues and reads an attendance alert', actor: 'admin', kind: 'flow', expect: 'allowed',
      sql: `DO $flow$ DECLARE n uuid; BEGIN
        INSERT INTO public.notificaciones_asistencia (tipo, canal, prioridad, destinatario_telefono, destinatario_nombre, titulo, cuerpo, estado)
          VALUES ('alerta_asistencia_alumno', 'whatsapp', 'normal', '+1', 'x', 'x', 'x', 'pendiente') RETURNING id INTO n;
        PERFORM 1 FROM public.notificaciones_asistencia WHERE id = n;
        IF NOT FOUND THEN RAISE EXCEPTION 'alert not readable'; END IF;
      END $flow$`,
    });
    c.push({
      name: 'flow: service role (Hermes) marks an alert as sent', actor: 'service_role', kind: 'flow', expect: 'allowed',
      sql: `UPDATE public.notificaciones_asistencia SET estado = 'enviado' WHERE id = '${ID.notif}'`,
    });
    // Why the capability check does not read permisos_maestros: RLS lets every teacher edit their own row.
    c.push({
      name: 'known hole (documented): a teacher can write capabilities into their own permisos_maestros row',
      actor: 'maestro_otro', kind: 'finding', expect: 'allowed',
      sql: `UPDATE public.permisos_maestros SET permisos = permisos || ARRAY['catalogo:escribir'] WHERE maestro_id = '${ID.m_otro}'`,
    });
    c.push({
      name: 'self-granting in permisos_maestros does NOT unlock the catalogue (grant, then try to write)',
      actor: 'maestro_otro', kind: 'write', expect: 'denied',
      sql: `DO $flow$ BEGIN
        UPDATE public.permisos_maestros SET permisos = permisos || ARRAY['catalogo:escribir', 'registros_clase:gestionar'] WHERE maestro_id = '${ID.m_otro}';
        INSERT INTO public.programas (nombre) VALUES ('autoconcedido');
      END $flow$`,
    });
    // the same end-to-end flow must be refused to anyone without the capability
    for (const a of ['alumno', 'representante', 'maestro_otro', 'maestro_cap', 'direccion', 'finanzas', 'admin_inactivo', 'anon']) {
      c.push({ ...catalog(a), name: `flow (must be refused): catalogue maintenance as ${a}`, expect: 'denied', kind: 'write' });
    }
    return c;
  }

  function collateralCases() {
    const c = [];
    const sel = (actor, t) => ({ name: `collateral: ${actor} reads ${t}`, actor, sql: `SELECT count(*) FROM public.${t}` });
    for (const t of ['calendario_institucional', 'clase_horarios', 'tareas_institucionales']) {
      for (const a of ['anon', 'alumno', 'maestro_titular', 'maestro_otro', 'coordinacion', 'admin']) c.push(sel(a, t));
    }
    for (const t of ['signage_pantallas', 'signage_media', 'signage_v_horario_semana', 'signage_v_horario_hoy', 'signage_v_horario_manana', 'signage_v_calendario_mes']) {
      c.push(sel('anon', t), sel('admin', t));
    }
    for (const a of ['admin', 'coordinacion', 'maestro_titular', 'maestro_otro', 'alumno', 'anon']) {
      c.push({ name: `collateral: ${a} assigns a room (clase_horarios insert)`, actor: a,
        sql: `INSERT INTO public.clase_horarios (clase_id, dia, hora_inicio, hora_fin, salon_id) VALUES ('${ID.clase}', 'lunes', '09:00', '10:00', '${ID.salon}')` });
      c.push({ name: `collateral: ${a} creates an academic task`, actor: a,
        sql: `INSERT INTO public.tareas_institucionales (titulo) VALUES ('tarea')` });
      c.push({ name: `collateral: ${a} creates a calendar event`, actor: a,
        sql: `INSERT INTO public.calendario_institucional (titulo, fecha_inicio, fecha_fin) VALUES ('evento', now(), now() + interval '1 hour')` });
    }
    return c;
  }

  function expectedPolicies() {
    const base = (t, extra = []) => [`${t}_admin_read`, `${t}_read_authenticated`, ...extra];
    const owner = (t) => [`${t}_owner_insert`, `${t}_owner_update`, `${t}_gestor_delete`];
    return {
      programas: base('programas', ['programas_gestor_write', 'programas_anon_read']),
      salones: base('salones', ['salones_gestor_write']),
      horarios: base('horarios', ['horarios_gestor_write']),
      class_events: base('class_events', owner('class_events')),
      class_event_methodology: base('class_event_methodology', owner('class_event_methodology')),
      homework_assignments: base('homework_assignments', owner('homework_assignments')),
      planned_content: base('planned_content', owner('planned_content')),
      notificaciones_asistencia: ['notificaciones_asistencia_gestor_read', 'notificaciones_asistencia_gestor_insert'],
    };
  }

  const tableNames = Object.keys(TABLES);
  async function policyInventory(client) {
    const r = await client.query(
      `SELECT tablename, policyname, permissive FROM pg_policies WHERE schemaname = 'public' AND tablename = ANY($1)`, [tableNames]);
    const by = {};
    for (const row of r.rows) (by[row.tablename] ??= []).push(row);
    return by;
  }

  return { flowCases, collateralCases, expectedPolicies, policyInventory };
}
