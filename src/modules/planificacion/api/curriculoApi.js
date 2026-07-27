/**
 * curriculoApi.js — Selector dinámico de persistencia (Puerto) para Currículos Académicos.
 */

import * as mock from './mocks/curriculoMock.js'
import * as real from './curriculoSupabase.js'

const impl = import.meta.env.VITE_USE_MOCK === 'true' ? mock : real

export async function obtenerCurriculo(instrumento, nivel) {
  return impl.obtenerCurriculo(instrumento, nivel)
}

export async function listarCurriculos() {
  return impl.listarCurriculos()
}

export async function crearCurriculo(data) {
  return impl.crearCurriculo(data)
}

export async function actualizarCurriculo(id, fields) {
  return impl.actualizarCurriculo(id, fields)
}

export async function toggleActivoCurriculo(id, activo) {
  return impl.toggleActivoCurriculo(id, activo)
}

// ── Pillars ──────────────────────────────────────────────────────────────────

export async function crearPilar(curriculo_id, nombre, orden) {
  return impl.crearPilar(curriculo_id, nombre, orden)
}

export async function actualizarPilar(id, fields) {
  return impl.actualizarPilar(id, fields)
}

export async function eliminarPilar(id) {
  return impl.eliminarPilar(id)
}

// ── Objectives ───────────────────────────────────────────────────────────────

export async function crearObjetivo(pilar_id, descripcion, orden) {
  return impl.crearObjetivo(pilar_id, descripcion, orden)
}

export async function actualizarObjetivo(id, fields) {
  return impl.actualizarObjetivo(id, fields)
}

export async function eliminarObjetivo(id) {
  return impl.eliminarObjetivo(id)
}

// ── Adopt AI Proposal ────────────────────────────────────────────────────────

export async function adoptarPropuesta(data) {
  return impl.adoptarPropuesta(data)
}
