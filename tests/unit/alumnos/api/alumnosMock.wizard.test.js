/**
 * RED — alumnosMock.wizard.test.js
 * Verifies that crearAlumno accepts the full InscripcionDraft payload
 * and returns all wizard fields.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the JSON import used by alumnosMock
vi.mock('../../../../src/assets/data/mocks/alumnos.json', () => ({
  default: []
}))

import * as mock from '../../../../src/modules/alumnos/api/alumnosMock.js'

const FULL_DRAFT = {
  // Step 1
  nombre_completo: 'Maria Test',
  fecha_nacimiento: '2015-03-10',
  sabe_leer: true,
  sabe_escribir: true,
  nacionalidad: 'Dominicana',
  tiene_pasaporte: false,
  como_se_entero: 'Un amigo',
  direccion: 'Calle 1, Santo Domingo',
  ubicacion_maps_url: 'https://goo.gl/maps/abc',
  // Step 2
  tiene_conocimientos_musicales: false,
  instrumento_previo: null,
  nivel_lectura_musical: null,
  interes_musical: 'instrumento',
  instrumento_interes: 'Violin',
  // Policy-derived (computed by API facade)
  iniciacion_musical_requerida: true,
  fecha_elegible_audicion: '2026-09-01',
  fecha_fin_iniciacion: '2026-12-01',
  // Step 3
  alergias_descripcion: null,
  tiene_condicion_transmisible: false,
  condicion_transmisible_descripcion: null,
  alergia_medicamento: false,
  alergia_medicamento_descripcion: null,
  impedimento_social: false,
  problemas_conducta: 'no',
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
  fecha_aceptacion_compromisos: '2026-06-01T00:00:00.000Z',
}

describe('alumnosMock — crearAlumno wizard fields', () => {
  it('returns all wizard fields in the created alumno', async () => {
    const result = await mock.crearAlumno(FULL_DRAFT)

    // Core identity
    expect(result.nombre_completo).toBe('Maria Test')
    expect(result.id).toBeTruthy()

    // Step 1 extras
    expect(result.sabe_leer).toBe(true)
    expect(result.sabe_escribir).toBe(true)
    expect(result.nacionalidad).toBe('Dominicana')
    expect(result.tiene_pasaporte).toBe(false)
    expect(result.como_se_entero).toBe('Un amigo')
    expect(result.ubicacion_maps_url).toBe('https://goo.gl/maps/abc')

    // Step 2 musical
    expect(result.tiene_conocimientos_musicales).toBe(false)
    expect(result.instrumento_previo).toBeNull()
    expect(result.nivel_lectura_musical).toBeNull()
    expect(result.interes_musical).toBe('instrumento')
    expect(result.instrumento_interes).toBe('Violin')

    // Policy-derived
    expect(result.iniciacion_musical_requerida).toBe(true)
    expect(result.fecha_elegible_audicion).toBe('2026-09-01')
    expect(result.fecha_fin_iniciacion).toBe('2026-12-01')

    // Step 3 health
    expect(result.alergias_descripcion).toBeNull()
    expect(result.tiene_condicion_transmisible).toBe(false)
    expect(result.alergia_medicamento).toBe(false)
    expect(result.impedimento_social).toBe(false)
    expect(result.problemas_conducta).toBe('no')

    // Step 4 school
    expect(result.centro_estudios).toBe('Escuela Nacional')
    expect(result.grado_nivel).toBe('3ro de primaria')
    expect(result.padres_en_vida).toBe('ambos')

    // Step 5 rep + compromisos
    expect(result.representante_nombre).toBe('Juan Test')
    expect(result.representante_parentesco).toBe('padre')
    expect(result.representante_tlf).toBe('809-555-0000')
    expect(result.representante_cedula).toBe('001-0000000-1')
    expect(result.acepta_beca_4500).toBe(true)
    expect(result.acepta_pago_600).toBe(true)
    expect(result.fecha_aceptacion_compromisos).toBe('2026-06-01T00:00:00.000Z')
  })

  it('persists alumno so subsequent obtenerAlumnos returns it', async () => {
    await mock.crearAlumno({ ...FULL_DRAFT, nombre_completo: 'Persist Test' })
    const { alumnos } = await mock.obtenerAlumnos()
    expect(alumnos.some(a => a.nombre_completo === 'Persist Test')).toBe(true)
  })
})
