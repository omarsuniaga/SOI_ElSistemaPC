import { config } from '../../../core/config/config.js'
import * as supabaseImpl from './finanzasSupabase.js'
import * as mockImpl from './finanzasMock.js'

const getApi = () => (config.isDemoMode ? mockImpl : supabaseImpl)

export const registrarPago = (...args) => getApi().registrarPago(...args)
export const obtenerPagosAlumno = (...args) => getApi().obtenerPagosAlumno(...args)
export const obtenerBalanceAlumnos = (...args) => getApi().obtenerBalanceAlumnos(...args)
export const registrarPagosLote = (...args) => getApi().registrarPagosLote(...args)
export const obtenerCobradoHoy = (...args) => getApi().obtenerCobradoHoy(...args)
