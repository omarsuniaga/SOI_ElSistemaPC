import { config } from '../../../core/config/config.js'
import * as supabaseImpl from './actividadesInstitucionalesSupabase.js'
import * as mockImpl from './actividadesInstitucionalesMock.js'

// Dispatcher DataAdapter (AGENTS.md §2): la UI nunca llama a Supabase directo.
const getApi = () => (config.isDemoMode ? mockImpl : supabaseImpl)

export const listarActividades = (...args) => getApi().listarActividades(...args)
export const obtenerActividad = (...args) => getApi().obtenerActividad(...args)
export const crearActividad = (...args) => getApi().crearActividad(...args)
export const eliminarActividad = (...args) => getApi().eliminarActividad(...args)
export const previsualizarImpacto = (...args) => getApi().previsualizarImpacto(...args)
export const listarAlumnosDeClase = (...args) => getApi().listarAlumnosDeClase(...args)
export const obtenerAfectacionesVigentes = (...args) => getApi().obtenerAfectacionesVigentes(...args)
export const aprobarActividad = (...args) => getApi().aprobarActividad(...args)
export const rechazarActividad = (...args) => getApi().rechazarActividad(...args)
export const obtenerListaAsistenciaActividad = (...args) => getApi().obtenerListaAsistenciaActividad(...args)
export const registrarAsistenciaActividad = (...args) => getApi().registrarAsistenciaActividad(...args)
