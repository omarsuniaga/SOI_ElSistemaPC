import { describe, it, expect } from 'vitest'
import { calcularCompletitud } from '../domain/completitudAlumno.js'

describe('calcularCompletitud (domain)', () => {
  /**
   * Create a completely filled alumno (every domain field has a value).
   * Some optional fields (alergias_descripcion, problemas_conducta) are still
   * expected to be present — optional means "no penalty if missing in business
   * rules", but the domain treats them as regular fields with a weight.
   */
  function alumnoCompleto() {
    return {
      nombre_completo: 'Ana García',
      fecha_nacimiento: '2014-06-15',
      genero: 'Femenino',
      nacionalidad: 'Dominicana',
      municipio_residencia: 'Punta Cana',
      direccion: 'Calle Principal 123',
      madre_tlf_whatsapp: '809-555-0101',
      padre_tlf_whatsapp: '809-555-0102',
      representante_tlf: '809-555-0103',
      madre_nombre: 'María García',
      padre_nombre: 'Juan García',
      representante_nombre: 'María García',
      representante_parentesco: 'Madre',
      contacto_emergencia_nombre: 'Tía Rosa',
      instrumento_principal: 'Violín',
      instrumento_interes: 'Piano',
      nivel_actual: 'Básico',
      centro_estudios: 'Escuela Primaria',
      grado_nivel: '1ro',
      alergias_descripcion: 'Ninguna',
      problemas_conducta: 'Ninguno',
      acepta_pago_600: true,
      autoriza_fotos_redes: true,
    }
  }

  it('returns 100% for a fully complete alumno', () => {
    const result = calcularCompletitud(alumnoCompleto())
    expect(result.porcentaje).toBe(100)
    expect(result.nivel).toBe('completo')
  })

  it('flags missing fields', () => {
    const alumno = { ...alumnoCompleto(), fecha_nacimiento: '' }
    const result = calcularCompletitud(alumno)
    expect(result.camposFaltantes.some(c => c.key === 'fecha_nacimiento')).toBe(true)
    expect(result.porcentaje).toBeLessThan(100)
  })

  it('returns all camposFaltantes with key, label, grupo, peso', () => {
    const alumno = { ...alumnoCompleto(), municipio_residencia: '', madre_nombre: '' }
    const result = calcularCompletitud(alumno)
    for (const c of result.camposFaltantes) {
      expect(c).toHaveProperty('key')
      expect(c).toHaveProperty('label')
      expect(c).toHaveProperty('grupo')
      expect(c).toHaveProperty('peso')
    }
  })

  it('classifies nivel correctly at thresholds', () => {
    // Empty: 0%
    const empty = calcularCompletitud({})
    expect(empty.nivel).toBe('critico')

    // nombre_completo=10, fecha_nacimiento=8 → 18/(total weight)
    const partial = calcularCompletitud({ nombre_completo: 'Test', fecha_nacimiento: '2000-01-01' })
    expect(partial.nivel).toBe('critico')
    expect(partial.porcentaje).toBeGreaterThan(0)
    expect(partial.porcentaje).toBeLessThan(35)
  })

  it('porGrupo groups fields correctly', () => {
    const result = calcularCompletitud(alumnoCompleto())
    expect(result.porGrupo).toHaveProperty('Personal')
    expect(result.porGrupo).toHaveProperty('Contacto')
    expect(result.porGrupo).toHaveProperty('Familia')
    expect(result.porGrupo).toHaveProperty('Musical')
    expect(result.porGrupo).toHaveProperty('Escolar')
    expect(result.porGrupo).toHaveProperty('Salud')
    expect(result.porGrupo).toHaveProperty('Compromisos')
  })

  it('empty string values are treated as missing', () => {
    const alumno = { ...alumnoCompleto(), centro_estudios: '' }
    const result = calcularCompletitud(alumno)
    expect(result.camposFaltantes.some(c => c.key === 'centro_estudios')).toBe(true)
  })
})
