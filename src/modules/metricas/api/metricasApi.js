import { config } from '../../../core/config/config.js'
import * as supabaseImpl from './metricsApi.js'
import * as mockImpl from './metricasMock.js'

const getApi = () => config.isDemoMode ? mockImpl : supabaseImpl

export const getResumenAlumnos = (...args) => getApi().getResumenAlumnos(...args)
export const getResumenAlumno = (...args) => getApi().getResumenAlumno(...args)
export const getEstadisticasPeriodo = (...args) => getApi().getEstadisticasPeriodo(...args)
export const getEstadisticasPeriodoActivo = (...args) => getApi().getEstadisticasPeriodoActivo(...args)
export const getTasaAsistenciaPeriodo = (...args) => getApi().getTasaAsistenciaPeriodo(...args)
export const getAlertasConfig = (...args) => getApi().getAlertasConfig(...args)
export const updateAlertaConfig = (...args) => getApi().updateAlertaConfig(...args)
export const getAlertasActivas = (...args) => getApi().getAlertasActivas(...args)
export const getResumenAlertas = (...args) => getApi().getResumenAlertas(...args)
export const getHistorialEstadoAlumno = (...args) => getApi().getHistorialEstadoAlumno(...args)
export const getRachaAusencias = (...args) => getApi().getRachaAusencias(...args)
export const getRiesgoAbandono = (...args) => getApi().getRiesgoAbandono(...args)
export const getAlumnosDestacados = (...args) => getApi().getAlumnosDestacados(...args)