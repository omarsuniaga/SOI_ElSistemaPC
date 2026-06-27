/**
 * eventosApi.js — DataAdapter para eventos institucionales.
 *
 * Dispatcher que elige entre mock y Supabase según el modo de la app.
 */

import { config } from '../../../core/config/config.js'
import * as mockImpl from './eventosMock.js'
import * as supabaseImpl from './eventosSupabase.js'

const impl = config.isDemoMode ? mockImpl : supabaseImpl

export function getEventos(filtros) {
  return impl.getEventos(filtros)
}

export function actualizarEstadoEvento(id, nuevoEstado) {
  return impl.actualizarEstadoEvento(id, nuevoEstado)
}

export function preprogramarEvento(id, datos) {
  return impl.preprogramarEvento(id, datos)
}

export function getEventoById(id) {
  return impl.getEventoById(id)
}
