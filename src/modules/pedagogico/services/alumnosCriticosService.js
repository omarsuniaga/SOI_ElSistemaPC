import { supabase } from '../../../lib/supabaseClient.js'
import { whatsappLink } from '../../../shared/utils/phoneUtils.js'

export const PLANTILLA_WHATSAPP_DEFAULT =
  'Estimado/a {representante}, le escribimos de El Sistema Punta Cana. ' +
  '{alumno} acumula {dias} días de ausencia sin justificar en las últimas semanas. ' +
  'Por favor comuníquese con la administración.'

const normalizar = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()

export function filtrarCriticosPorInstrumento(criticos = [], instrumento = '') {
  const q = normalizar(instrumento)
  if (!q) return criticos
  return criticos.filter((c) => normalizar(c.instrumento) === q)
}

export function renderPlantillaWhatsapp(plantilla, critico) {
  return String(plantilla)
    .replaceAll('{representante}', critico.representante_nombre || 'Representante')
    .replaceAll('{alumno}', critico.nombre_completo || 'el alumno')
    .replaceAll('{dias}', String(critico.dias_ausencia_distintos ?? 0))
}

export function enlaceWhatsappCritico(critico, plantilla) {
  return whatsappLink(critico.telefono_whatsapp, renderPlantillaWhatsapp(plantilla, critico))
}

export async function obtenerCriticos() {
  const { data, error } = await supabase
    .from('v_alumnos_criticos_ausentismo')
    .select('*')
    .order('dias_ausencia_distintos', { ascending: false })
  if (error) throw new Error('No se pudieron cargar los alumnos críticos')
  return data || []
}

export async function justificarDiaCritico({ alumnoId, fecha, motivo }) {
  const { data: auth } = await supabase.auth.getUser()
  const { data, error } = await supabase.rpc('justificar_alumno_por_dia', {
    p_alumno_id: alumnoId,
    p_fecha: fecha,
    p_motivo: motivo,
    p_creado_por: auth?.user?.id ?? null,
  })
  if (error) throw new Error(error.message || 'No se pudo justificar el día')
  const fila = Array.isArray(data) ? data[0] : data
  if (fila && fila.success === false) throw new Error(fila.message || 'No se pudo justificar el día')
  return fila
}
