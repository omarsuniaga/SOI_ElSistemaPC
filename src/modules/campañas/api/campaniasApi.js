import * as mock from './campaniasMock.js'
import * as real from './campaniasSupabase.js'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const api = USE_MOCK ? mock : real

export const getInstituciones = api.getInstituciones
export const getInstitucion = api.getInstitucion
export const guardarInstitucion = api.guardarInstitucion
export const eliminarInstitucion = api.eliminarInstitucion
export const getCampanias = api.getCampanias
export const getCampania = api.getCampania
export const guardarCampania = api.guardarCampania
export const eliminarCampania = api.eliminarCampania
export const enviarCampania = api.enviarCampania
export const getDestinatarios = api.getDestinatarios
export const registrarRespuesta = api.registrarRespuesta
export const getProspeccionLog = api.getProspeccionLog
