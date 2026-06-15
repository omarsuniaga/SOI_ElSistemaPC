import { supabase } from '../../../lib/supabaseClient.js'

export async function getObjetivosClase(claseId) {
  const { data, error } = await supabase
    .from('ruta_contenido_objetivos')
    .select('*')
    .eq('clase_id', claseId)
    .is('activo', true)

  if (error) throw error
  return data
}

export async function getSemaforoClase(claseId) {
  const { data, error } = await supabase
    .from('v_semaforo_contenidos')
    .select('*')
    .eq('clase_id', claseId)

  if (error) throw error
  return data
}

export async function registrarSesion(payload) {
  const { data, error } = await supabase.rpc('registrar_sesion_bitacora', {
    p_clase_id: payload.claseId,
    p_objetivo_id: payload.objetivoId,
    p_fecha: payload.fecha,
    p_notas: payload.notas,
  })

  if (error) throw error
  return { id: data }
}

export async function getHistorialContenido(claseId, objetivoId) {
  const { data, error } = await supabase
    .from('indicator_sessions')
    .select('*, indicator_session_students(*)')
    .eq('clase_id', claseId)
    .eq('objetivo_id', objetivoId)
    .order('fecha', { ascending: false })

  if (error) throw error
  return data
}
