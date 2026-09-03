import { supabase } from '../../../lib/supabaseClient.js';

async function _enriquecerConDatosDocentes(ausencias) {
  if (!ausencias || ausencias.length === 0) return [];

  // Mapear maestros y profiles con soporte global e independiente de tipo de clave
  let allMaestros = [];
  try {
    const { data: mData, error: mErr } = await supabase
      .from('maestros')
      .select('*');
    if (!mErr && mData) allMaestros = mData;
  } catch (e) {
    console.warn('[ausenciaAprobacionApi] Warning cargando maestros:', e);
  }

  let allProfiles = [];
  try {
    const { data: pData, error: pErr } = await supabase
      .from('profiles')
      .select('id, email, nombre_completo, rol');
    if (!pErr && pData) allProfiles = pData;
  } catch (e) {
    console.warn('[ausenciaAprobacionApi] Warning cargando profiles:', e);
  }

  const teacherMap = new Map();

  allMaestros.forEach(m => {
    const fullName = m.nombre_completo || `${m.nombre || ''} ${m.apellido || ''}`.trim() || 'Docente';
    const email = m.correo || m.email || '';
    const info = {
      nombre_completo: fullName,
      correo: email,
      especialidad: m.especialidad || m.instrumento_principal || ''
    };

    if (m.id !== undefined && m.id !== null) teacherMap.set(String(m.id).toLowerCase(), info);
    if (m.user_id) teacherMap.set(String(m.user_id).toLowerCase(), info);
    if (m.correo) teacherMap.set(String(m.correo).toLowerCase(), info);
    if (m.email) teacherMap.set(String(m.email).toLowerCase(), info);
  });

  allProfiles.forEach(p => {
    const sId = String(p.id).toLowerCase();
    const current = teacherMap.get(sId);
    const fullName = current?.nombre_completo || p.nombre_completo || p.email?.split('@')[0] || 'Docente';
    const email = current?.correo || p.email || '';
    const info = {
      nombre_completo: fullName,
      correo: email,
      especialidad: current?.especialidad || ''
    };

    teacherMap.set(sId, info);
    if (p.email) teacherMap.set(String(p.email).toLowerCase(), info);
  });

  return ausencias.map(a => {
    const candidates = [
      a.maestro_id,
      a.user_id,
      a.docente_id,
      a.profesor_id,
      a.correo,
      a.email
    ].filter(Boolean).map(v => String(v).toLowerCase());

    let found = null;
    for (const c of candidates) {
      if (teacherMap.has(c)) {
        found = teacherMap.get(c);
        break;
      }
    }

    const resolvedName = (
      found?.nombre_completo ||
      a.nombre_completo ||
      a.maestro_nombre ||
      a.docente_nombre ||
      a.nombre ||
      (a.maestros && typeof a.maestros === 'object' ? a.maestros.nombre_completo : null) ||
      'Docente de la Institución'
    );

    const resolvedEmail = (
      found?.correo ||
      a.correo ||
      a.email ||
      a.maestro_email ||
      a.docente_email ||
      (a.maestros && typeof a.maestros === 'object' ? (a.maestros.correo || a.maestros.email) : null) ||
      ''
    );

    return {
      ...a,
      maestro_nombre: resolvedName,
      maestro_email: resolvedEmail,
      maestros: {
        nombre_completo: resolvedName,
        correo: resolvedEmail,
        instrumento: found?.especialidad || ''
      }
    };
  });
}

export async function obtenerAusenciasPendientes() {
  const { data: ausencias, error } = await supabase
    .from('ausencias_maestros')
    .select('*')
    .eq('estado', 'pendiente')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[ausenciaAprobacionApi] Error cargando ausencias:', error);
    throw error;
  }
  return _enriquecerConDatosDocentes(ausencias);
}

export async function obtenerHistorialAusencias() {
  const { data: ausencias, error } = await supabase
    .from('ausencias_maestros')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('[ausenciaAprobacionApi] Error cargando historial de ausencias:', error);
    throw error;
  }
  return _enriquecerConDatosDocentes(ausencias);
}

async function actualizarDecisionAusencia(id, estado, decisionNotas) {
  console.log('[ausenciaAprobacionApi] Actualizando ausencia:', { id, estado, decisionNotas });

  // Actualizar solo el estado sin depender de columnas inexistentes
  let { data, error } = await supabase
    .from('ausencias_maestros')
    .update({ estado })
    .eq('id', id);

  // Si id es string numérico, intentar con Number(id)
  if (error && !isNaN(Number(id))) {
    const retry = await supabase
      .from('ausencias_maestros')
      .update({ estado })
      .eq('id', Number(id));
    if (!retry.error) {
      return { id, estado };
    }
  }

  if (error) {
    console.error('[ausenciaAprobacionApi] Error en actualizarDecisionAusencia:', error);
    throw error;
  }

  return { id, estado };
}

export function aprobarAusencia(id, decisionNotas = '') {
  return actualizarDecisionAusencia(id, 'aprobada', decisionNotas);
}

export function rechazarAusencia(id, decisionNotas = '') {
  return actualizarDecisionAusencia(id, 'rechazada', decisionNotas);
}

// ── Director / Admin API ──────────────────────────────────────────────────────

export async function obtenerPendientesDirector() {
  return obtenerAusenciasPendientes();
}

export async function revisarAusencia(ausenciaId, accion, notas = '') {
  const estadoMap = {
    aprobar: 'aprobada',
    rechazar: 'rechazada',
    solicitar_info: 'pendiente_info',
  };

  const nuevoEstado = estadoMap[accion];
  if (!nuevoEstado) throw new Error(`Acción no válida: ${accion}`);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ausencia = await actualizarDecisionAusencia(ausenciaId, nuevoEstado, notas);

  try {
    await supabase.from('ausencias_auditoria').insert({
      ausencia_id: ausenciaId,
      accion,
      notas: notas || null,
      realizado_por: user?.id ?? null,
      realizado_en: new Date().toISOString(),
    });
  } catch (auditErr) {
    console.warn('[ausenciaAprobacionApi] No se pudo registrar auditoría:', auditErr);
  }

  return ausencia;
}

export async function obtenerPendientesAprobacion() {
  const { data: ausencias, error } = await supabase
    .from('ausencias_maestros')
    .select(`
      id,
      maestro_id,
      tipo_ausencia,
      urgencia,
      fecha_inicio,
      fecha_fin,
      motivo,
      estado,
      created_at
    `)
    .eq('estado', 'pendiente_admin')
    .order('created_at', { ascending: true });

  if (error) throw error;
  if (!ausencias || ausencias.length === 0) return [];

  // Mapear perfiles en memoria
  const maestroIds = [...new Set(ausencias.map(a => a.maestro_id).filter(Boolean))];
  if (maestroIds.length > 0) {
    const { data: perfiles, error: perfError } = await supabase
      .from('profiles')
      .select('id, nombre_completo, email')
      .in('id', maestroIds);

    if (!perfError && perfiles) {
      const perfMap = new Map(perfiles.map(p => [p.id, p]));
      return ausencias.map(a => {
        const perf = perfMap.get(a.maestro_id);
        return {
          ...a,
          maestros: perf ? { nombre_completo: perf.nombre_completo, correo: perf.email } : a.maestros || null
        };
      });
    }
  }

  return ausencias.map(a => ({ ...a, maestros: a.maestros || null }));
}
