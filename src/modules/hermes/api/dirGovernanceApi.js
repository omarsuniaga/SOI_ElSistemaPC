import * as mock from './dirGovernanceMock.js'
import * as real from './dirGovernanceSupabase.js'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const api = USE_MOCK ? mock : real

export const createDecision = api.createDecision
export const getDecisions = api.getDecisions
