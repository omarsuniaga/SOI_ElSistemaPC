/**
 * documentosPublicosApi.js — DataAdapter del módulo: Supabase real o Demo (mocks JSON).
 * La UI solo importa este archivo.
 */
import { config } from '../../../core/config/config.js'
import * as supabaseImpl from './documentosPublicosSupabase.js'
import * as mockImpl from './documentosPublicosMock.js'

const getApi = () => (config.isDemoMode ? mockImpl : supabaseImpl)

export const listarPublicaciones = (...a) => getApi().listarPublicaciones(...a)
export const obtenerPublicacion = (...a) => getApi().obtenerPublicacion(...a)
export const crearPublicacion = (...a) => getApi().crearPublicacion(...a)
export const actualizarPublicacion = (...a) => getApi().actualizarPublicacion(...a)
export const cambiarEstado = (...a) => getApi().cambiarEstado(...a)
export const subirVersion = (...a) => getApi().subirVersion(...a)
export const activarVersion = (...a) => getApi().activarVersion(...a)
export const listarVersiones = (...a) => getApi().listarVersiones(...a)
export const listarEventos = (...a) => getApi().listarEventos(...a)
export const urlArchivoAdmin = (...a) => getApi().urlArchivoAdmin(...a)
export const obtenerPublicacionPublica = (...a) => getApi().obtenerPublicacionPublica(...a)
export const urlArchivoPublico = (...a) => getApi().urlArchivoPublico(...a)
