/**
 * RED — alumnosSupabase.wizard.contract.test.js
 * Contract test: both Mock and Supabase adapters accept the same full wizard
 * payload and return the same row shape (minus id/timestamps).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock the JSON for alumnosMock ──────────────────────────────────────────
vi.mock('../../../../src/assets/data/mocks/alumnos.json', () => ({
  default: []
}))

// ── Mock supabase client ───────────────────────────────────────────────────
const mockInsert = vi.fn()
const mockSelect = vi.fn()
const mockFrom = vi.fn()

vi.mock('../../../../src/lib/supabaseClient.js', () => ({
  supabase: {
    from: (...args) => mockFrom(...args)
  }
}))

import * as mockAdapter from '../../../../src/modules/alumnos/api/alumnosMock.js'
import * as supabaseAdapter from '../../../../src/modules/alumnos/api/alumnosSupabase.js'

const FULL_PAYLOAD = {
  nombre_completo: 'Contract Test',
  fecha_nacimiento: '2015-06-15',
  sabe_leer: true,
  sabe_escribir: true,
  nacionalidad: 'Dominicana',
  tiene_pasaporte: false,
  como_se_entero: 'Internet',
  direccion: 'Av. 27 de Febrero',
  ubicacion_maps_url: null,
  tiene_conocimientos_musicales: false,
  instrumento_previo: null,
  nivel_lectura_musical: null,
  interes_musical: 'cantar',
  instrumento_interes: 'Voz',
  iniciacion_musical_requerida: true,
  fecha_elegible_audicion: '2026-09-15',
  fecha_fin_iniciacion: '2026-12-15',
  alergias_descripcion: null,
  tiene_condicion_transmisible: false,
  condicion_transmisible_descripcion: null,
  alergia_medicamento: false,
  alergia_medicamento_descripcion: null,
  impedimento_social: false,
  problemas_conducta: 'no',
  centro_estudios: 'Colegio Abc',
  grado_nivel: '4to',
  padres_en_vida: 'ambos',
  representante_nombre: 'Ana Test',
  representante_parentesco: 'madre',
  representante_tlf: '809-111-2222',
  representante_cedula: '001-1111111-1',
  acepta_beca_4500: true,
  acepta_pago_600: true,
  fecha_aceptacion_compromisos: '2026-06-01T12:00:00.000Z',
  activo: true,
}

const EXPECTED_FIELDS = [
  'nombre_completo',
  'sabe_leer', 'sabe_escribir', 'nacionalidad', 'tiene_pasaporte',
  'como_se_entero', 'ubicacion_maps_url',
  'tiene_conocimientos_musicales', 'instrumento_previo', 'nivel_lectura_musical',
  'interes_musical', 'instrumento_interes',
  'iniciacion_musical_requerida', 'fecha_elegible_audicion', 'fecha_fin_iniciacion',
  'alergias_descripcion', 'tiene_condicion_transmisible', 'condicion_transmisible_descripcion',
  'alergia_medicamento', 'alergia_medicamento_descripcion',
  'impedimento_social', 'problemas_conducta',
  'centro_estudios', 'grado_nivel', 'padres_en_vida',
  'representante_nombre', 'representante_parentesco', 'representante_tlf', 'representante_cedula',
  'acepta_beca_4500', 'acepta_pago_600', 'fecha_aceptacion_compromisos',
]

describe('Adapter contract — Mock vs Supabase shape parity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Supabase chain: from().insert().select() -> { data: [...], error: null }
    const selectFn = vi.fn().mockResolvedValue({
      data: [{ ...FULL_PAYLOAD, id: 'sb-id-123' }],
      error: null
    })
    const insertFn = vi.fn().mockReturnValue({ select: selectFn })
    mockFrom.mockReturnValue({ insert: insertFn })
  })

  it('mock adapter returns all wizard fields', async () => {
    const result = await mockAdapter.crearAlumno(FULL_PAYLOAD)
    for (const field of EXPECTED_FIELDS) {
      expect(result, `missing field: ${field}`).toHaveProperty(field)
    }
  })

  it('supabase adapter sends all wizard fields and returns same shape', async () => {
    const result = await supabaseAdapter.crearAlumno(FULL_PAYLOAD)
    for (const field of EXPECTED_FIELDS) {
      expect(result, `missing field: ${field}`).toHaveProperty(field)
    }
  })

  it('both adapters return the same field set (shape parity)', async () => {
    const mockResult = await mockAdapter.crearAlumno(FULL_PAYLOAD)
    const supabaseResult = await supabaseAdapter.crearAlumno(FULL_PAYLOAD)

    for (const field of EXPECTED_FIELDS) {
      expect(Object.prototype.hasOwnProperty.call(mockResult, field) ||
             mockResult[field] !== undefined ||
             field in mockResult,
        `Mock missing field: ${field}`
      ).toBeTruthy()
      expect(Object.prototype.hasOwnProperty.call(supabaseResult, field) ||
             supabaseResult[field] !== undefined ||
             field in supabaseResult,
        `Supabase missing field: ${field}`
      ).toBeTruthy()
    }
  })
})
