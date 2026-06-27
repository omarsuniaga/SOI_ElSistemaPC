/**
 * calendarioComApi.js — Dispatcher de la lente de calendario (mock o supabase).
 */

import * as mock from './calendarioComMock.js'
import * as real from './calendarioComSupabase.js'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const api = USE_MOCK ? mock : real

export const getEventos = api.getEventos
