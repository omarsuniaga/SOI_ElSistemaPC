import { supabase } from '../../../lib/supabaseClient.js';

export async function obtenerAusenciasPendientes() {
  const { data, error } = await supabase
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
      clases_afectadas,
      actividades_por_clase,
      clase_emergente,
      archivo_url,
      created_at,
      maestros:maestro_id(nombre_completo, correo)
    `)
    .eq('estado', 'pendiente')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
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
