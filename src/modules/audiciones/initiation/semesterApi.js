import { config } from '../../../core/config/config.js'
import { supabase } from '../../../lib/supabaseClient.js'
import { createSemesterAdapter } from './semesterMock.js'
let demo
// Única frontera de datos para ambos portales. El servidor define identidad y permisos.
// Tablas del backend: iniciacion_convocatorias, iniciacion_candidatos,
// iniciacion_valoraciones, iniciacion_invitaciones, iniciacion_decisiones.
export const semesterRealAdapter = {
  async execute(action, data = {}) {
    if (!supabase) throw new Error('No hay conexión configurada para audiciones')
    const { data: result, error } = await supabase.rpc('iniciacion_semestre', {
      p_accion: action,
      p_datos: data,
    })
    if (error) {
      if (error.code === '42P01' && error.message?.includes('iniciacion_invitaciones'))
        throw new Error(
          'Falta la evolución de invitaciones por destino. No se guardó la operación; complete la migración semestral.',
        )
      if (['42P01', '42703', 'PGRST202', 'PGRST205', '42883'].includes(error.code))
        throw new Error(
          'Audiciones semestrales aún no está habilitado en esta base. La migración está pendiente; no se ha guardado esta operación.',
        )
      throw new Error(error.message || 'No se pudo completar la operación')
    }
    return result
  },
}
export function getSemesterAdapter() {
  if (config.isDemoMode || import.meta.env.VITE_USE_MOCK === 'true') {
    demo ||= createSemesterAdapter({ storage: globalThis.localStorage })
    return demo
  }
  return semesterRealAdapter
}
