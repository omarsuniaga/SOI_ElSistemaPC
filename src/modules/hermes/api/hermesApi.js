import { config } from '../../../core/config/config.js'
import * as supabaseImpl from './hermesSupabase.js'
import * as mockImpl from './hermesMock.js'

const getApi = () => (config.isDemoMode ? mockImpl : supabaseImpl)

export const obtenerEventos = (...args) => getApi().obtenerEventos(...args)
export const crearEvento = (...args) => getApi().crearEvento(...args)
export const eliminarEvento = (...args) => getApi().eliminarEvento(...args)

export const obtenerTareas = (...args) => getApi().obtenerTareas(...args)
export const crearTarea = (...args) => getApi().crearTarea(...args)
export const actualizarTarea = (...args) => getApi().actualizarTarea(...args)
export const eliminarTarea = (...args) => getApi().eliminarTarea(...args)

export const obtenerProtocolos = (...args) => getApi().obtenerProtocolos(...args)
export const actualizarProtocolo = (...args) => getApi().actualizarProtocolo(...args)
export const crearProtocolo = (...args) => getApi().crearProtocolo(...args)
