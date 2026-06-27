/**
 * instrumentosApi.js — Dispatcher: enruta las llamadas a instrumentosMock o instrumentosSupabase
 * según la variable de entorno VITE_USE_MOCK.
 *
 * Uso:
 *   import * as instrumentosApi from './instrumentosApi.js'
 *   const instrumentos = await instrumentosApi.listarInstrumentos({ estado: 'danado' })
 */

import * as mock from './instrumentosMock.js'
import * as real from './instrumentosSupabase.js'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const api = USE_MOCK ? mock : real

export const listarInstrumentos = api.listarInstrumentos
export const crearInstrumento = api.crearInstrumento
export const actualizarInstrumento = api.actualizarInstrumento
export const cambiarEstadoInstrumento = api.cambiarEstadoInstrumento
export const asignarInstrumento = api.asignarInstrumento
