/**
 * coberturaApi.js — Selector dinámico de persistencia (Puerto) para Cobertura Curricular.
 */

import * as mock from './mocks/coberturaMock.js'
import * as real from './coberturaSupabase.js'

const impl = import.meta.env.VITE_USE_MOCK === 'true' ? mock : real

export async function upsertCobertura(registros) {
  return impl.upsertCobertura(registros)
}

export async function obtenerCoberturaPorAlumno(alumno_id) {
  return impl.obtenerCoberturaPorAlumno(alumno_id)
}

export async function obtenerCoberturaPorPlan(plan_id) {
  return impl.obtenerCoberturaPorPlan(plan_id)
}

export async function confirmarCobertura(ids) {
  return impl.confirmarCobertura(ids)
}
