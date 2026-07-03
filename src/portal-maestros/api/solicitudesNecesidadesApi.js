/**
 * solicitudesNecesidadesApi.js — Dispatcher entre mock y Supabase.
 */

import * as mock from './solicitudesNecesidadesMock.js'
import * as real from './solicitudesNecesidadesSupabase.js'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const api = USE_MOCK ? mock : real

export const crearSolicitud = api.crearSolicitud
export const listarPorMaestro = api.listarPorMaestro
export const listarPorDepartamento = api.listarPorDepartamento
export const preAprobar = api.preAprobar
export const rechazar = api.rechazar
export const escalarAFin = api.escalarAFin
export const cargarPresupuesto = api.cargarPresupuesto
export const resolver = api.resolver
export const cancelar = api.cancelar
export const contarPendientes = api.contarPendientes
export const contarNovedadesMaestro = api.contarNovedadesMaestro
