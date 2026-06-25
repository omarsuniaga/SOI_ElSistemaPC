/**
 * departamentosApi.js — Dispatcher (mock o supabase según VITE_USE_MOCK).
 */

import * as mock from './departamentosMock.js'
import * as real from './departamentosSupabase.js'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const api = USE_MOCK ? mock : real

export const getDepartamentos = api.getDepartamentos
export const actualizarDepartamento = api.actualizarDepartamento
export const enviarCorreoPrueba = api.enviarCorreoPrueba
