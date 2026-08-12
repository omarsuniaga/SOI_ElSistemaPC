/**
 * asistenciasApi.js — Puerto / Router de Adaptadores para el módulo de Asistencias.
 * Resuelve dinámicamente entre la persistencia real (Supabase) y el modo simulado (Mocks)
 * basado en la configuración del entorno, desacoplando la UI de la base de datos física.
 */

import * as mock from './mocks/asistenciasMock.js'
import * as real from './asistenciasSupabase.js'

const impl = import.meta.env.VITE_USE_MOCK === 'true' ? mock : real

// ─── CONSTANTES COMPARTIDAS ──────────────────────────────────────────────────

export const ESTADOS = impl.ESTADOS
export const ESTADO_LABEL = impl.ESTADO_LABEL

// ─── MÉTODOS DE CONSULTA Y MUTACIÓN ──────────────────────────────────────────

export async function getSesionesPorRango(params) {
  return impl.getSesionesPorRango(params)
}

export async function getDetalleSesion(sesionId) {
  return impl.getDetalleSesion(sesionId)
}

export async function getReporteCompleto(params) {
  return impl.getReporteCompleto(params)
}

export async function getPeriodos() {
  return impl.getPeriodos()
}

export async function getPeriodoActivo() {
  return impl.getPeriodoActivo()
}

export async function getClases() {
  return impl.getClases()
}

export async function getMaestros() {
  return impl.getMaestros()
}

export async function obtenerAsistencias() {
  return impl.obtenerAsistencias()
}

export async function obtenerAsistencia(id) {
  return impl.obtenerAsistencia(id)
}

export async function crearAsistencia(asistencia) {
  return impl.crearAsistencia(asistencia)
}

export async function registrarAsistenciaBulk(asistencias) {
  return impl.registrarAsistenciaBulk(asistencias)
}

export async function getReporteConsolidado(params) {
  return impl.getReporteConsolidado(params)
}

// ─── GATE DE MODO SESIÓN (mapa-gamificado-planificacion, Tarea 3.2, REQ-03) ──

export async function obtenerAsistenciaDelDia(params) {
  return impl.obtenerAsistenciaDelDia(params)
}

export async function obtenerAsistenciasPorClasesFecha(claseIds, fecha) {
  return impl.obtenerAsistenciasPorClasesFecha(claseIds, fecha)
}
