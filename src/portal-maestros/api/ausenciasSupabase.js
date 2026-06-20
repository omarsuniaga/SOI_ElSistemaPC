import { supabase } from '../../lib/supabaseClient.js';

export async function obtenerClasesMaestro(maestroId) {
  const { data, error } = await supabase
    .from('clases')
    .select('id, nombre, instrumento, maestro_principal_id, maestro_suplente_id')
    .or(`maestro_principal_id.eq.${maestroId},maestro_suplente_id.eq.${maestroId}`);
  
  if (error) throw error;
  return data || [];
}

export async function obtenerSesionesRango(claseIds, start, end) {
  const { data, error } = await supabase
    .from('sesiones_clase')
    .select('clase_id, fecha, hora_inicio, hora_fin, salon_id')
    .in('clase_id', claseIds)
    .gte('fecha', start)
    .lte('fecha', end);
  
  if (error) throw error;
  return data || [];
}

export async function obtenerHorariosClases(claseIds) {
  const { data, error } = await supabase
    .from('clase_horarios')
    .select('clase_id, dia, hora_inicio, hora_fin, salon_id')
    .in('clase_id', claseIds);
  
  if (error) throw error;
  return data || [];
}

export async function obtenerSalonesActivos() {
  const { data, error } = await supabase
    .from('salones')
    .select('id, nombre, capacidad')
    .eq('activo', true);
  
  if (error) throw error;
  return data || [];
}

export async function obtenerSesionesOcupadas(fecha, hora) {
  const { data, error } = await supabase
    .from('sesiones_clase')
    .select('salon_id')
    .eq('fecha', fecha)
    .filter('hora_inicio', 'lte', hora)
    .filter('hora_fin', 'gt', hora);
  
  if (error) throw error;
  return data || [];
}

export async function obtenerMaestrosSuplentes(claseId) {
  const { data: clase, error: claseError } = await supabase
    .from('clases')
    .select('maestro_suplente_id')
    .eq('id', claseId)
    .maybeSingle();

  if (claseError) throw claseError;
  if (!clase?.maestro_suplente_id) return [];

  const { data, error } = await supabase
    .from('maestros')
    .select('id, nombre_completo, nombre, apellido, tipo_maestro, puede_ser_suplente')
    .eq('id', clase.maestro_suplente_id)
    .eq('activo', true);

  if (error) throw error;
  return data || [];
}

export async function registrarAusencia(payload) {
  const { data, error } = await supabase
    .from('ausencias_maestros')
    .insert([payload])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function crearNotificacionAusencia({ ausencia, maestro, directorProfileId, approvalUrl }) {
  if (!directorProfileId) return null;

  const { data, error } = await supabase
    .from('notificaciones')
    .insert({
      profile_id: directorProfileId,
      tipo: 'sistema',
      titulo: 'Nueva solicitud de ausencia',
      mensaje: `${maestro?.nombre_completo || 'Un maestro'} solicitó ausencia del ${ausencia.fecha_inicio} al ${ausencia.fecha_fin}.`,
      deep_link: approvalUrl || null,
      estado: 'pendiente',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function obtenerSalonPorId(id) {
  const { data, error } = await supabase
    .from('salones')
    .select('nombre')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}
