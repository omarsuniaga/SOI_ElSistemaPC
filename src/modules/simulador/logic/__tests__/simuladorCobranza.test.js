/**
 * simuladorCobranza.test.js
 * Slice 2 — Portal Simulador: regla de negocio de cobranza.
 * Spec: simulador-agentes-departamentales / Exclusión de morosos al día en cobranza
 *   ("El agente de cobranza SHALL excluir representantes con pago al día").
 * Seeds reales de la migración 20260707_simulador_core.sql (sim_actores, sección 12):
 *   'Representante Ficticio Moroso' (estado_pago='moroso', dias_mora:45)
 *   'Representante Ficticio Solvente' (estado_pago='solvente', dias_mora:0)
 * TDD: tests escritos ANTES de la implementación (strict TDD mode).
 */
import { describe, it, expect } from 'vitest'
import { filtrarActoresMorosos } from '../simuladorCobranza.js'

// Seed real de sim_actores (representantes) tal como quedó en la migración de Slice 1.
const SEED_ACTORES = [
  { tipo: 'postulante', nombre_ficticio: 'Postulante Ficticio Uno', estado_pago: 'no_aplica' },
  { tipo: 'alumno', nombre_ficticio: 'Alumno Ficticio Uno', estado_pago: 'no_aplica' },
  { tipo: 'maestro', nombre_ficticio: 'Maestro Ficticio Uno', estado_pago: 'no_aplica' },
  {
    tipo: 'representante',
    nombre_ficticio: 'Representante Ficticio Moroso',
    estado_pago: 'moroso',
    metadata: { dias_mora: 45, alumno_asociado: 'Alumno Ficticio Uno' },
  },
  {
    tipo: 'representante',
    nombre_ficticio: 'Representante Ficticio Solvente',
    estado_pago: 'solvente',
    metadata: { dias_mora: 0, alumno_asociado: 'Alumno Ficticio Dos' },
  },
]

describe('filtrarActoresMorosos', () => {
  it('incluye únicamente representantes con estado_pago = "moroso"', () => {
    const resultado = filtrarActoresMorosos(SEED_ACTORES)
    expect(resultado).toHaveLength(1)
    expect(resultado[0].nombre_ficticio).toBe('Representante Ficticio Moroso')
  })

  it('EXCLUYE explícitamente al representante solvente (requisito de spec)', () => {
    const resultado = filtrarActoresMorosos(SEED_ACTORES)
    expect(resultado.some((a) => a.nombre_ficticio === 'Representante Ficticio Solvente')).toBe(false)
  })

  it('excluye actores que no son de tipo "representante" aunque tuvieran estado_pago moroso por error de datos', () => {
    const actores = [
      { tipo: 'alumno', nombre_ficticio: 'Alumno raro', estado_pago: 'moroso' },
      { tipo: 'representante', nombre_ficticio: 'Rep válido', estado_pago: 'moroso' },
    ]
    const resultado = filtrarActoresMorosos(actores)
    expect(resultado).toHaveLength(1)
    expect(resultado[0].nombre_ficticio).toBe('Rep válido')
  })

  it('retorna array vacío si no hay ningún actor moroso', () => {
    const actores = SEED_ACTORES.filter((a) => a.estado_pago !== 'moroso')
    expect(filtrarActoresMorosos(actores)).toEqual([])
  })

  it('retorna array vacío ante entrada vacía o inválida, sin lanzar', () => {
    expect(filtrarActoresMorosos([])).toEqual([])
    expect(filtrarActoresMorosos(null)).toEqual([])
    expect(filtrarActoresMorosos(undefined)).toEqual([])
  })
})
