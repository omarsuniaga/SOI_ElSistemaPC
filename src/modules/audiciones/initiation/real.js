import { supabase } from '../../../lib/supabaseClient.js'
function client() {
  if (!supabase) throw new Error('No hay conexión configurada para audiciones')
  return supabase
}
async function unwrap(request) {
  const { data, error } = await request
  if (error) {
    if (['42P01', '42703', 'PGRST202', 'PGRST205'].includes(error.code)) throw new Error('El módulo de Iniciación aún no está habilitado en esta base de datos')
    throw new Error(error.message || 'No se pudo completar la operación')
  }
  return data
}
export function getContext() { return unwrap(client().rpc('iniciacion_contexto')) }
export function listCampaigns() { return unwrap(client().from('iniciacion_convocatorias').select('*').order('creado_at', { ascending: false })) }
export function createCampaign(payload) {
  const { nombre, clase_origen_id, cohorte_desde, cohorte_hasta, fecha_audicion, jurados, min_jurados, rubrica } = payload
  return unwrap(client().from('iniciacion_convocatorias').insert({ nombre, clase_origen_id, cohorte_desde, cohorte_hasta, fecha_audicion, jurados, min_jurados, rubrica }).select().single())
}
export async function getCampaign(id) {
  const [candidates, evaluations, decisions] = await Promise.all([
    unwrap(client().from('iniciacion_candidatos').select('*').eq('convocatoria_id', id).order('alumno_nombre')),
    // Join inner scopes both queries to the selected campaign at the server.
    unwrap(client().from('iniciacion_valoraciones').select('*, candidato:iniciacion_candidatos!inner(convocatoria_id)').eq('candidato.convocatoria_id', id)),
    unwrap(client().from('iniciacion_decisiones').select('*, candidato:iniciacion_candidatos!inner(convocatoria_id)').eq('candidato.convocatoria_id', id).order('creado_at')),
  ])
  return { candidates, evaluations, decisions }
}
export function listSourceStudents(classId) {
  return unwrap(client().from('alumnos_clases').select('alumno:alumnos!inner(id,nombre_completo,fecha_ingreso_iniciacion)').eq('clase_id', classId).eq('activo', true).eq('alumno.activo', true))
    .then(rows => rows.map(r => r.alumno))
}
export function addCandidate({ convocatoria_id, alumno_id, motivo_excepcion }) {
  return unwrap(client().from('iniciacion_candidatos').insert({ convocatoria_id, alumno_id, motivo_excepcion }).select().single())
}
export function saveEvaluation({ candidato_id, ronda, notas, observacion, clase_propuesta_id }) {
  return unwrap(client().rpc('iniciacion_guardar_valoracion', { p_candidato: candidato_id, p_ronda: ronda, p_notas: notas, p_observacion: observacion, p_clase: clase_propuesta_id || null })).then(data => Array.isArray(data) ? data[0] : data)
}
export function decide({ candidato_id, version, accion, datos }) {
  return unwrap(client().rpc('iniciacion_decidir', { p_candidato: candidato_id, p_version: version, p_accion: accion, p_datos: datos })).then(data => Array.isArray(data) ? data[0] : data)
}
