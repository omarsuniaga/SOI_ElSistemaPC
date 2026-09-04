/**
 * T0.3: Unit tests for resolverContactoAlumno contact resolution cascade
 * Tests all 7 tiers of the cascade, phone normalization, and fallthrough behavior
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Define mock functions
const mockFrom = vi.fn()

vi.mock('../../../../src/lib/supabaseClient.js', () => ({
  supabase: {
    from: (...args) => mockFrom(...args),
  },
}))

import { resolverContactoAlumno } from '../../../../src/modules/pedagogico/services/seguimientoAusentesService.js'

describe('resolverContactoAlumno - Contact Resolution Cascade', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockQueryChain = (resolveValue) => ({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue(resolveValue),
      }),
    }),
  })

  const mockQueryChainWithOrder = (resolveValue) => ({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(resolveValue),
        }),
      }),
    }),
  })

  it('Tier 1: finds representante.telefono_whatsapp with alumno_id match', async () => {
    const alumnoId = 'alumno-1'

    let callCount = 0
    mockFrom.mockImplementation((table) => {
      callCount++
      if (callCount === 1 && table === 'alumnos') {
        return mockQueryChain({ data: { id: alumnoId, nombre_completo: 'Test Alumno' } })
      }
      if (callCount === 2 && table === 'representantes') {
        return mockQueryChain({
          data: { nombre: 'Repr 1', telefono_whatsapp: '8091234567' },
        })
      }
      return mockQueryChain({ data: null })
    })

    const result = await resolverContactoAlumno(alumnoId)

    expect(result.origen).toBe('representante_alumno')
    expect(result.nombre).toBe('Repr 1')
    expect(result.telefono).toBe('+18091234567')
  })

  it('Tier 3: falls through to alumnos.representante_tlf when Tier 1-2 empty', async () => {
    const alumnoId = 'alumno-3'

    mockFrom.mockImplementation((table) => {
      if (table === 'alumnos') {
        return mockQueryChain({
          data: {
            id: alumnoId,
            nombre_completo: 'Test Alumno 3',
            familia_id: null,
            representante_tlf: '+18097778888',
          },
        })
      }
      if (table === 'representantes') {
        return mockQueryChain({ data: null })
      }
      return mockQueryChain({ data: null })
    })

    const result = await resolverContactoAlumno(alumnoId)

    expect(result.origen).toBe('alumnos_representante_tlf')
    expect(result.telefono).toBe('+18097778888')
  })

  it('Tier 4: falls through to alumnos.madre_tlf_whatsapp', async () => {
    const alumnoId = 'alumno-4'

    mockFrom.mockImplementation((table) => {
      if (table === 'alumnos') {
        return mockQueryChain({
          data: {
            id: alumnoId,
            nombre_completo: 'Test Alumno 4',
            familia_id: null,
            representante_tlf: null,
            madre_tlf_whatsapp: '+18099991111',
          },
        })
      }
      if (table === 'representantes') {
        return mockQueryChain({ data: null })
      }
      return mockQueryChain({ data: null })
    })

    const result = await resolverContactoAlumno(alumnoId)

    expect(result.origen).toBe('alumnos_madre_tlf_whatsapp')
    expect(result.telefono).toBe('+18099991111')
  })

  it('Tier 5: falls through to alumnos.padre_tlf_whatsapp', async () => {
    const alumnoId = 'alumno-5'

    mockFrom.mockImplementation((table) => {
      if (table === 'alumnos') {
        return mockQueryChain({
          data: {
            id: alumnoId,
            nombre_completo: 'Test Alumno 5',
            familia_id: null,
            representante_tlf: null,
            madre_tlf_whatsapp: null,
            padre_tlf_whatsapp: '+18092223333',
          },
        })
      }
      if (table === 'representantes') {
        return mockQueryChain({ data: null })
      }
      return mockQueryChain({ data: null })
    })

    const result = await resolverContactoAlumno(alumnoId)

    expect(result.origen).toBe('alumnos_padre_tlf_whatsapp')
    expect(result.telefono).toBe('+18092223333')
  })

  it('Tier 6: falls through to alumnos.familiar_telefono', async () => {
    const alumnoId = 'alumno-6'

    mockFrom.mockImplementation((table) => {
      if (table === 'alumnos') {
        return mockQueryChain({
          data: {
            id: alumnoId,
            nombre_completo: 'Test Alumno 6',
            familia_id: null,
            representante_tlf: null,
            madre_tlf_whatsapp: null,
            padre_tlf_whatsapp: null,
            familiar_telefono: '+18094445555',
          },
        })
      }
      if (table === 'representantes') {
        return mockQueryChain({ data: null })
      }
      return mockQueryChain({ data: null })
    })

    const result = await resolverContactoAlumno(alumnoId)

    expect(result.origen).toBe('alumnos_familiar_telefono')
    expect(result.telefono).toBe('+18094445555')
  })

  it('Tier 7: falls through to alumnos.contacto_emergencia_telefono', async () => {
    const alumnoId = 'alumno-7'

    mockFrom.mockImplementation((table) => {
      if (table === 'alumnos') {
        return mockQueryChain({
          data: {
            id: alumnoId,
            nombre_completo: 'Test Alumno 7',
            familia_id: null,
            representante_tlf: null,
            madre_tlf_whatsapp: null,
            padre_tlf_whatsapp: null,
            familiar_telefono: null,
            contacto_emergencia_telefono: '+18096667777',
          },
        })
      }
      if (table === 'representantes') {
        return mockQueryChain({ data: null })
      }
      return mockQueryChain({ data: null })
    })

    const result = await resolverContactoAlumno(alumnoId)

    expect(result.origen).toBe('alumnos_contacto_emergencia_telefono')
    expect(result.telefono).toBe('+18096667777')
  })

  it('returns {origen: null} when all tiers are empty', async () => {
    const alumnoId = 'alumno-empty'

    mockFrom.mockImplementation((table) => {
      if (table === 'alumnos') {
        return mockQueryChain({
          data: {
            id: alumnoId,
            nombre_completo: 'Test Alumno Empty',
            familia_id: null,
            representante_tlf: null,
            madre_tlf_whatsapp: null,
            padre_tlf_whatsapp: null,
            familiar_telefono: null,
            contacto_emergencia_telefono: null,
          },
        })
      }
      if (table === 'representantes') {
        return mockQueryChain({ data: null })
      }
      return mockQueryChain({ data: null })
    })

    const result = await resolverContactoAlumno(alumnoId)

    expect(result.origen).toBeNull()
  })

  it('rejects 7-digit phone numbers (too short for DR area code matching)', async () => {
    const alumnoId = 'alumno-7digit'

    mockFrom.mockImplementation((table) => {
      if (table === 'alumnos') {
        return mockQueryChain({
          data: {
            id: alumnoId,
            nombre_completo: 'Test Alumno 7digit',
            familia_id: null,
            representante_tlf: '1234567',
          },
        })
      }
      if (table === 'representantes') {
        return mockQueryChain({ data: null })
      }
      return mockQueryChain({ data: null })
    })

    const result = await resolverContactoAlumno(alumnoId)

    expect(result.origen).toBeNull()
  })

  it('normalizes 10-digit phone with DR area code 809 to +1XXXXXXXXXX format', async () => {
    const alumnoId = 'alumno-10digit'

    mockFrom.mockImplementation((table) => {
      if (table === 'alumnos') {
        return mockQueryChain({
          data: {
            id: alumnoId,
            nombre_completo: 'Test Alumno 10digit',
            familia_id: null,
            representante_tlf: '8091234567',
          },
        })
      }
      if (table === 'representantes') {
        return mockQueryChain({ data: null })
      }
      return mockQueryChain({ data: null })
    })

    const result = await resolverContactoAlumno(alumnoId)

    expect(result.telefono).toBe('+18091234567')
  })

  it('rejects 10-digit phone with non-DR area code (e.g., 212 NYC)', async () => {
    const alumnoId = 'alumno-10digit-non-dr'

    mockFrom.mockImplementation((table) => {
      if (table === 'alumnos') {
        return mockQueryChain({
          data: {
            id: alumnoId,
            nombre_completo: 'Test Alumno Non-DR',
            familia_id: null,
            representante_tlf: '2121234567',
          },
        })
      }
      if (table === 'representantes') {
        return mockQueryChain({ data: null })
      }
      return mockQueryChain({ data: null })
    })

    const result = await resolverContactoAlumno(alumnoId)

    expect(result.origen).toBeNull()
  })

  it('skips malformed number and falls through to next tier', async () => {
    const alumnoId = 'alumno-malformed'

    mockFrom.mockImplementation((table) => {
      if (table === 'alumnos') {
        return mockQueryChain({
          data: {
            id: alumnoId,
            nombre_completo: 'Test Alumno Malformed',
            familia_id: null,
            representante_tlf: 'abc123',
            madre_tlf_whatsapp: '+18095556666',
          },
        })
      }
      if (table === 'representantes') {
        return mockQueryChain({ data: null })
      }
      return mockQueryChain({ data: null })
    })

    const result = await resolverContactoAlumno(alumnoId)

    expect(result.origen).toBe('alumnos_madre_tlf_whatsapp')
    expect(result.telefono).toBe('+18095556666')
  })

  it('Tier 2: prefers es_pagador when using familia_id representantes', async () => {
    const alumnoId = 'alumno-2'

    let reprCallCount = 0
    mockFrom.mockImplementation((table) => {
      if (table === 'alumnos') {
        return mockQueryChain({
          data: {
            id: alumnoId,
            nombre_completo: 'Test Alumno 2',
            familia_id: 'fam-2',
          },
        })
      }
      if (table === 'representantes') {
        reprCallCount++
        if (reprCallCount === 1) {
          // First call: Tier 1 - direct alumno link (returns null)
          return mockQueryChain({ data: null })
        } else {
          // Second call: Tier 2 - via familia_id with order by es_pagador
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [
                    { nombre: 'Non Pagador', telefono_whatsapp: null, es_pagador: false },
                    { nombre: 'Repr Pagador', telefono_whatsapp: '8295556666', es_pagador: true },
                  ],
                }),
              }),
            }),
          }
        }
      }
      return mockQueryChain({ data: null })
    })

    const result = await resolverContactoAlumno(alumnoId)

    expect(result.origen).toBe('representante_familia')
    expect(result.telefono).toBe('+18295556666')
  })
})
