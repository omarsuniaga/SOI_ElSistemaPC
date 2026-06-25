/**
 * seguimientoApi.js — Dispatcher del CRM de seguimiento (mock o supabase según VITE_USE_MOCK).
 */

import * as mock from './seguimientoMock.js'
import * as real from './seguimientoSupabase.js'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const api = USE_MOCK ? mock : real

export const getSeguimientos = api.getSeguimientos
export const getSeguimientosByAlumno = api.getSeguimientosByAlumno
export const crearSeguimiento = api.crearSeguimiento
export const actualizarSeguimiento = api.actualizarSeguimiento
export const cerrarSeguimiento = api.cerrarSeguimiento
export const eliminarSeguimiento = api.eliminarSeguimiento
