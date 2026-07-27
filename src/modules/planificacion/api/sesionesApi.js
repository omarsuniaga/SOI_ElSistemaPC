/**
 * sesionesApi.js — Selector dinámico de persistencia (Puerto) para Sesiones de Clase.
 */

import * as mock from './mocks/sesionesMock.js'
import * as real from './sesionesSupabase.js'

const impl = import.meta.env.VITE_USE_MOCK === 'true' ? mock : real

export async function obtenerSesiones(filtros) {
  return impl.obtenerSesiones(filtros)
}

export async function obtenerSesionPorId(id) {
  return impl.obtenerSesionPorId(id)
}

export async function crearSesion(sesion) {
  return impl.crearSesion(sesion)
}

export async function actualizarSesion(id, actualizaciones) {
  return impl.actualizarSesion(id, actualizaciones)
}

export async function eliminarSesion(id) {
  return impl.eliminarSesion(id)
}

export async function registrarAsistencia(sesionId, asistencia) {
  return impl.registrarAsistencia(sesionId, asistencia)
}

export async function obtenerSesionesCoDocencia(maestroAuxiliarId) {
  return impl.obtenerSesionesCoDocencia(maestroAuxiliarId)
}

export async function obtenerSesionesPorFechaYClase(fecha, claseId) {
  return impl.obtenerSesionesPorFechaYClase(fecha, claseId)
}

export async function obtenerClasesDelMaestro(maestroId) {
  return impl.obtenerClasesDelMaestro(maestroId)
}
