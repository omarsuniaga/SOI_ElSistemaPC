import { config } from '../../core/config/config.js';
import * as supabaseImpl from './ausenciasSupabase.js';
import * as mockImpl from './ausenciasMock.js';

const getApi = () => config.isDemoMode ? mockImpl : supabaseImpl;

export const obtenerClasesMaestro = (...args) => getApi().obtenerClasesMaestro(...args);
export const obtenerSesionesRango = (...args) => getApi().obtenerSesionesRango(...args);
export const obtenerHorariosClases = (...args) => getApi().obtenerHorariosClases(...args);
export const obtenerSalonesActivos = (...args) => getApi().obtenerSalonesActivos(...args);
export const obtenerSesionesOcupadas = (...args) => getApi().obtenerSesionesOcupadas(...args);
export const obtenerMaestrosSuplentes = (...args) => getApi().obtenerMaestrosSuplentes(...args);
export const registrarAusencia = (...args) => getApi().registrarAusencia(...args);
export const crearNotificacionAusencia = (...args) => getApi().crearNotificacionAusencia(...args);
export const obtenerSalonPorId = (...args) => getApi().obtenerSalonPorId(...args);
