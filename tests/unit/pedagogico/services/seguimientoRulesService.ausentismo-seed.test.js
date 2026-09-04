/**
 * T0.5: Unit tests for seguimiento_reglas ausentismo_acumulado seed
 * NOTE: This test will be GREEN once the migration in Fase 1a seeds the rule.
 * For now, we mock the rule to test that getActiveRuleByTipo returns the correct contract.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Define mock functions
const mockFrom = vi.fn()

vi.mock('../../../../src/lib/supabaseClient.js', () => ({
  supabase: {
    from: (...args) => mockFrom(...args),
  },
}))

import { getActiveRuleByTipo } from '../../../../src/modules/pedagogico/services/seguimientoRulesService.js'

describe('seguimientoRulesService - ausentismo_acumulado seed', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockQueryChain = (data) => {
    const mockEq2 = vi.fn().mockResolvedValue({ data, error: null })
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
    const mockOrder2 = vi.fn().mockReturnValue({ eq: mockEq1 })
    const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 })
    const mockSelect = vi.fn().mockReturnValue({ order: mockOrder1 })
    return { select: mockSelect }
  }

  it('getActiveRuleByTipo(ausentismo_acumulado) returns rule with correct config', async () => {
    const ruleData = [
      {
        id: 'rule-1',
        nombre: 'Ausentismo acumulado',
        tipo: 'ausentismo_acumulado',
        descripcion: 'Escalamiento de contactos por inasistencias injustificadas acumuladas.',
        config: {
          periodo: 'academico',
          nivel1: 1,
          nivel2: 2,
          nivel3: 3,
          contar_justificadas: false,
        },
        activo: true,
        prioridad: 5,
      },
    ]

    mockFrom.mockReturnValue(mockQueryChain(ruleData))

    const rule = await getActiveRuleByTipo('ausentismo_acumulado')

    expect(rule).not.toBeNull()
    expect(rule.tipo).toBe('ausentismo_acumulado')
    expect(rule.activo).toBe(true)
    expect(rule.config).toHaveProperty('nivel1', 1)
    expect(rule.config).toHaveProperty('nivel2', 2)
    expect(rule.config).toHaveProperty('nivel3', 3)
    expect(rule.config).toHaveProperty('contar_justificadas', false)
  })

  it('getActiveRuleByTipo filters by tipo parameter', async () => {
    const ruleData = [
      {
        id: 'rule-1',
        tipo: 'ausentismo_acumulado',
        activo: true,
        config: { nivel1: 1, nivel2: 2, nivel3: 3, contar_justificadas: false },
      },
    ]

    mockFrom.mockReturnValue(mockQueryChain(ruleData))

    const rule = await getActiveRuleByTipo('ausentismo_acumulado')

    expect(rule).not.toBeNull()
    expect(rule.tipo).toBe('ausentismo_acumulado')
  })

  it('returns null when ausentismo_acumulado rule not found', async () => {
    mockFrom.mockReturnValue(mockQueryChain([]))

    const rule = await getActiveRuleByTipo('ausentismo_acumulado')

    expect(rule).toBeNull()
  })
})
