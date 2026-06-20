/**
 * Integration test — wizardInscripcion.flow.test.js
 * Uses jsdom (vitest environment). Tests wizard domain flow end-to-end:
 * - Step validation blocks advance on invalid data
 * - Happy path: valid data per step passes validation
 * - crearAlumno called with full payload
 *
 * Note: validators return { valid, errors } (not { ok, errors }).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock external dependencies ──────────────────────────────────────────────
vi.mock('../../src/assets/data/mocks/alumnos.json', () => ({ default: [] }))
vi.mock('../../src/lib/supabaseClient.js', () => ({ supabase: { from: vi.fn() } }))
vi.mock('../../src/core/config/config.js', () => ({ config: { isDemoMode: true } }))
vi.mock('../../src/portal-maestros/auth/maestroAuth.js', () => ({
  getMaestroLocal: () => ({ id: 'maestro-1', nombre: 'Test Maestro' })
}))
vi.mock('../../src/portal-maestros/components/wizard/draftStorage.js', () => ({
  guardarBorrador: vi.fn(),
  cargarBorrador: vi.fn(() => null),
  limpiarBorrador: vi.fn(),
}))

// ── Mock crearAlumno at the API facade level ─────────────────────────────────
const mockCrearAlumno = vi.fn().mockResolvedValue({ id: 'test-id', nombre_completo: 'Test' })
vi.mock('../../src/modules/alumnos/api/alumnosApi.js', () => ({
  crearAlumno: (...args) => mockCrearAlumno(...args),
}))

// ── Imports under test ───────────────────────────────────────────────────────
import {
  validarPaso1,
  validarPaso2,
  validarPaso3,
  validarPaso4,
  validarPaso5,
} from '../../src/modules/alumnos/domain/inscripcionValidators.js'
import { crearWizard, avanzar } from '../../src/portal-maestros/components/wizard/wizardStateMachine.js'
import { crearAlumno } from '../../src/modules/alumnos/api/alumnosApi.js'

// ── Full valid draft ──────────────────────────────────────────────────────────
const FULL_DRAFT = {
  // Step 1
  nombre_completo: 'Maria Test',
  fecha_nacimiento: '2015-03-10',
  nacionalidad: 'Dominicana',
  como_se_entero: 'amigo',
  direccion: 'Calle 1, Santo Domingo',
  ubicacion_maps_url: '',
  sabe_leer: false,
  sabe_escribir: false,
  tiene_pasaporte: false,
  // Step 2
  tiene_conocimientos_musicales: false,
  interes_musical: 'instrumento',
  instrumento_interes: 'Violin',
  instrumento_previo: null,
  nivel_lectura_musical: null,
  // Step 3
  problemas_conducta: 'no',
  tiene_condicion_transmisible: false,
  alergia_medicamento: false,
  impedimento_social: false,
  // Step 4
  centro_estudios: 'Escuela Nacional',
  grado_nivel: '3ro de primaria',
  padres_en_vida: 'ambos',
  // Step 5
  representante_nombre: 'Juan Test',
  representante_parentesco: 'padre',
  representante_tlf: '809-555-0000',
  representante_cedula: '001-0000000-1',
  acepta_beca_4500: true,
  acepta_pago_600: true,
}

// ────────────────────────────────────────────────────────────────────────────

describe('Wizard integration — domain flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Negative path — Step 1 blocks on empty nombre_completo', () => {
    it('returns errors when nombre_completo is empty', () => {
      const invalidDraft = { ...FULL_DRAFT, nombre_completo: '' }
      const result = validarPaso1(invalidDraft)
      expect(result.valid).toBe(false)
      expect(result.errors.nombre_completo).toBeTruthy()
    })

    it('state machine stays on step 1 when validation fails', () => {
      const invalidDraft = { ...FULL_DRAFT, nombre_completo: '' }
      let state = crearWizard(5)
      state = { ...state, draft: invalidDraft }
      // wizardStateMachine.avanzar calls validate(draft) and checks result
      const nextState = avanzar(state, invalidDraft, (d) => validarPaso1(d))
      expect(nextState.currentStep).toBe(1)
    })
  })

  describe('Happy path — all 5 steps validate correctly', () => {
    it('step 1 validates valid data', () => {
      const result = validarPaso1(FULL_DRAFT)
      expect(result.valid).toBe(true)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })

    it('step 2 validates valid data', () => {
      const result = validarPaso2(FULL_DRAFT)
      expect(result.valid).toBe(true)
    })

    it('step 3 validates valid data', () => {
      const result = validarPaso3(FULL_DRAFT)
      expect(result.valid).toBe(true)
    })

    it('step 4 validates valid data', () => {
      const result = validarPaso4(FULL_DRAFT)
      expect(result.valid).toBe(true)
    })

    it('step 5 validates valid data', () => {
      const result = validarPaso5(FULL_DRAFT)
      expect(result.valid).toBe(true)
    })

    it('state machine advances through all 5 steps with valid data', () => {
      const validators = [validarPaso1, validarPaso2, validarPaso3, validarPaso4, validarPaso5]
      let state = crearWizard(5)
      state = { ...state, draft: FULL_DRAFT }

      for (let i = 0; i < 4; i++) {
        const before = state.currentStep
        state = avanzar(state, FULL_DRAFT, validators[i])
        expect(state.currentStep).toBe(before + 1)
      }
      expect(state.currentStep).toBe(5)
    })
  })

  describe('Negative path — Step 5 blocks submit without compromisos', () => {
    it('returns error when acepta_beca_4500 is false', () => {
      const draft = { ...FULL_DRAFT, acepta_beca_4500: false }
      const result = validarPaso5(draft)
      expect(result.valid).toBe(false)
      expect(result.errors.acepta_beca_4500).toBeTruthy()
    })

    it('returns error when acepta_pago_600 is false', () => {
      const draft = { ...FULL_DRAFT, acepta_pago_600: false }
      const result = validarPaso5(draft)
      expect(result.valid).toBe(false)
      expect(result.errors.acepta_pago_600).toBeTruthy()
    })
  })

  describe('Submit — crearAlumno called with full payload', () => {
    it('calls crearAlumno with all wizard fields', async () => {
      const draft = { ...FULL_DRAFT, fecha_aceptacion_compromisos: '2026-06-01T00:00:00.000Z' }
      await crearAlumno(draft)
      expect(mockCrearAlumno).toHaveBeenCalledOnce()
      const called = mockCrearAlumno.mock.calls[0][0]
      expect(called.nombre_completo).toBe('Maria Test')
      expect(called.acepta_beca_4500).toBe(true)
      expect(called.acepta_pago_600).toBe(true)
    })
  })
})
