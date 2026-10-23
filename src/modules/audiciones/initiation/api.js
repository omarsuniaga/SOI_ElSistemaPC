import { config } from '../../../core/config/config.js'
import * as real from './real.js'
import { demoAdapter } from './mock.js'
export function getInitiationAdapter() {
  return config.isDemoMode || import.meta.env.VITE_USE_MOCK === 'true' ? demoAdapter : real
}
