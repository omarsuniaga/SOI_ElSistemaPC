import { supabase } from '../../../lib/supabaseClient.js';

export async function obtenerPendientesDirector() {
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

export async function revisarAusencia(id, estado, notas = '') {
  const { data, error } = await supabase
    .from('ausencias_maestros')
    .update({
      estado,
      decision_notas: notas || null,
      decidido_en: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
