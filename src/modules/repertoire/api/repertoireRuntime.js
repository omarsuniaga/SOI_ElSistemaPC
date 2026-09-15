import { supabase } from '../../../lib/supabaseClient.js'
import { createRepertoireAdapter } from './repertoireAdapter.js'
import { createRepertoireDemoAdapter } from '../demo/repertoireDemoAdapter.js'
import { isRepertoirePilotUser } from './repertoirePilotAccess.js'

export class RepertoireUnavailableError extends Error {
  constructor(message = 'No se pudo cargar el módulo de Repertorio.') {
    super(message)
    this.name = 'RepertoireUnavailableError'
  }
}

export function getRepertoireAdapter({ mode = import.meta.env.VITE_REPERTOIRE_DATA_MODE || 'real', supabaseClient = supabase, actorContext = {}, enabled = import.meta.env.VITE_REPERTOIRE_ENABLED === 'true' } = {}) {
  if (mode === 'demo') return createRepertoireDemoAdapter()
  if (mode !== 'real') throw new RepertoireUnavailableError('Modo de Repertorio inválido.')
  if (!isRepertoirePilotUser(actorContext?.maestroId, { enabled })) throw new RepertoireUnavailableError('El módulo de Repertorio no está activado para este usuario.')
  if (!supabaseClient) throw new RepertoireUnavailableError()
  if (!actorContext?.maestroId) throw new RepertoireUnavailableError('No se pudo identificar al maestro actual.')
  return createRepertoireAdapter(supabaseClient, { actorId: actorContext.maestroId })
}
