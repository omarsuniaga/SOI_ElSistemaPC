import { supabase } from '../../../lib/supabaseClient.js';

export async function obtenerAusenciasPendientes() {
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
    .eq('estado', 'pendiente')
    .order('created_at', { ascending: true });

  if (error) throw error;
  if (!ausencias || ausencias.length === 0) return [];

  // Mapear perfiles en memoria para evitar errores de clave foránea en Supabase real
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

async function actualizarDecisionAusencia(id, estado, decisionNotas) {
  const { data, error } = await supabase
    .from('ausencias_maestros')
    .update({
      estado,
      decision_notas: decisionNotas || null,
      decidido_en: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function aprobarAusencia(id, decisionNotas = '') {
  return actualizarDecisionAusencia(id, 'aprobada', decisionNotas);
}

export function rechazarAusencia(id, decisionNotas = '') {
  return actualizarDecisionAusencia(id, 'rechazada', decisionNotas);
}

// ── Director / Admin API ──────────────────────────────────────────────────────

export async function obtenerPendientesDirector() {
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
    .eq('estado', 'en_revision')
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

  const { data: ausencia, error: updateError } = await supabase
    .from('ausencias_maestros')
    .update({
      estado: nuevoEstado,
      decision_notas: notas || null,
      decidido_en: new Date().toISOString(),
    })
    .eq('id', ausenciaId)
    .select()
    .single();

  if (updateError) throw updateError;

  const { error: auditError } = await supabase.from('ausencias_auditoria').insert({
    ausencia_id: ausenciaId,
    accion,
    notas: notas || null,
    realizado_por: user?.id ?? null,
    realizado_en: new Date().toISOString(),
  });

  if (auditError) throw auditError;

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
