import * as mock from './contractsMock.js'
import * as real from './contractsSupabase.js'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const api = USE_MOCK ? mock : real

export const createTaskContract = api.createTaskContract
export const getTaskContracts = api.getTaskContracts
export const getTaskContractAudit = api.getTaskContractAudit
