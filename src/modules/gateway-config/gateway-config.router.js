import { router } from '../../core/router/router.js'
import { renderGatewayConfigView } from './views/gatewayConfigView.js'

export function registerRoutesGatewayConfig() {
  router.register('gateway-config', renderGatewayConfigView)
}
