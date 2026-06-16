/**
 * bitacoraAdapter.js — DataAdapter router for Bitacora module.
 *
 * Delegates to bitacoraSupabase or bitacoraMock based on config.isDemoMode.
 * All 4 exported functions share the same signatures regardless of the
 * backing implementation.
 *
 * Mirrors planificacionAdapter.js pattern exactly.
 */

import { config } from '../../../core/config/config.js'
import * as supabase from './bitacoraSupabase.js'
import * as mock from './bitacoraMock.js'

const impl = config.isDemoMode ? mock : supabase

/**
 * Returns objectives for a clase ordered by orden ASC.
 * @param {string} claseId
 * @returns {Promise<{id: string, descripcion: string, orden: number}[]>}
 */
export const getContenidosDeClase = (claseId) => impl.getContenidosDeClase(claseId)

/**
 * Returns semáforo aggregates for all (alumno, objetivo) pairs in a clase.
 * @param {string} claseId
 * @returns {Promise<{alumno_id: string, objetivo_id: string, bien_count: number,
 *   regular_count: number, mal_count: number, total_registros: number}[]>}
 */
export const getSemaforoPorClase = (claseId) => impl.getSemaforoPorClase(claseId)

/**
 * Registers a session with per-student notes atomically.
 * Validates payload before calling the RPC (or mock equivalent).
 * @param {{ claseId: string, objetivoId: string, fecha: string,
 *   notas: { alumnoId: string, nota: 'bien'|'regular'|'mal' }[] }} payload
 * @returns {Promise<{ sessionId: string }>}
 */
export const registrarSesion = (payload) => impl.registrarSesion(payload)

/**
 * Returns alumnos enrolled in a clase.
 * @param {string} claseId
 * @returns {Promise<{id: string, nombre_completo: string}[]>}
 */
export const getAlumnosByClase = (claseId) => impl.getAlumnosByClase(claseId)

/**
 * Returns all session notes for (claseId, objetivoId) ordered by fecha DESC.
 * @param {string} claseId
 * @param {string} objetivoId
 * @returns {Promise<{fecha: string, alumno_id: string, nota_cualitativa: string, observacion: string|null}[]>}
 */
export const getHistorialContenido = (claseId, objetivoId) =>
  impl.getHistorialContenido(claseId, objetivoId)
