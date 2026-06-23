import { router } from '../../core/router/router.js'
import { renderCalendarioView } from './views/calendarioView.js'
import { renderTareasView } from './views/tareasView.js'
import { renderProtocolosView } from './views/protocolosView.js'
import { renderHermesConfigView } from './views/hermesConfigView.js'

export function registerRoutesHermes() {
  router.register('hermes-calendario', renderCalendarioView)
  router.register('hermes-tareas', renderTareasView)
  router.register('hermes-protocolos', renderProtocolosView)
  router.register('hermes-config', renderHermesConfigView)
}
