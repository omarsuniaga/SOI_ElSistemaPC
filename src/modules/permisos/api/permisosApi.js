import { config } from '../../../core/config/config.js'
import * as supabaseImpl from './permisosSupabase.js'
import * as mockImpl from './permisosMock.js'

// El dispatcher elige qué implementación usar basándose en la configuración global
const getApi = () => config.isDemoMode ? mockImpl : supabaseImpl

export const obtenerPermisos = (...args) => getApi().obtenerPermisos(...args)
export const obtenerPermisoPorMaestro = (...args) => getApi().obtenerPermisoPorMaestro(...args)
export const actualizarPermiso = (...args) => getApi().actualizarPermiso(...args)
