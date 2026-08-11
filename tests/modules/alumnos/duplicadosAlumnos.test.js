import { describe, it, expect } from 'vitest'
import {
  normalizeText,
  tokensNombre,
  jaccard,
  esSubset,
  compareNombres,
  similitudEntre,
  nivelDuplicado,
  detectarPosiblesDuplicados,
  evaluarCampo,
  construirFusion,
  quienEsMasCompleto,
  CAMPOS_FUSION,
} from '../../../src/modules/alumnos/domain/duplicadosAlumnos.js'

describe('duplicadosAlumnos: normalización', () => {
  it('normaliza acentos, mayúsculas y puntuación', () => {
    expect(normalizeText('Luis Eduardo Martínez Obando.')).toBe('luis eduardo martinez obando')
  })

  it('colapsa espacios múltiples', () => {
    expect(normalizeText('  Luis   Martinez  ')).toBe('luis martinez')
  })

  it('tokeniza nombres sin duplicados', () => {
    expect(tokensNombre('Luis Luis Martínez')).toEqual(['luis', 'martinez'])
  })
})

describe('duplicadosAlumnos: similitud de nombres', () => {
  it('detecta subconjunto de tokens', () => {
    expect(esSubset(tokensNombre('Luis Martinez'), tokensNombre('Luis Eduardo Martinez Obando'))).toBe(true)
  })

  it('jaccard de conjuntos idénticos = 1', () => {
    expect(jaccard(['luis', 'martinez'], ['luis', 'martinez'])).toBe(1)
  })

  it('compareNombres premia el subconjunto con proporción razonable', () => {
    const score = compareNombres('Luis Martinez', 'Luis Eduardo Martinez Obando')
    expect(score).toBeGreaterThan(0.4)
    expect(score).toBeLessThanOrEqual(1)
  })

  it('nombres totalmente distintos → score bajo', () => {
    expect(compareNombres('Luis Martinez', 'María José Rodríguez')).toBeLessThan(0.5)
  })
})

describe('duplicadosAlumnos: scoring entre alumnos', () => {
  const baseA = {
    id: 'a1',
    nombre_completo: 'Luis Martinez',
    fecha_nacimiento: '2015-05-10',
    genero: 'M',
    instrumento_principal: 'Violín',
    madre_nombre: 'Carmen Martinez',
  }
  const baseB = {
    id: 'b1',
    nombre_completo: 'Luis Eduardo Martinez Obando',
    fecha_nacimiento: '2015-05-10',
    instrumento_principal: 'Violín',
    madre_nombre: 'Carmen Martinez',
    representante_tlf: '+18091111111',
    correo_representante: 'lmartinez@gmail.com',
  }

  it('dos registros del mismo alumno obtienen puntaje alto', () => {
    const s = similitudEntre(baseA, baseB)
    expect(s.puntaje).toBeGreaterThanOrEqual(0.82)
  })

  it('el mismo registro obtiene puntaje 1', () => {
    expect(similitudEntre(baseA, baseA).puntaje).toBe(1)
  })

  it('detecta coincidencias de identidad (madre, fecha, instrumento)', () => {
    const s = similitudEntre(baseA, baseB)
    expect(s.coincidencias.madre_nombre).toBe(true)
    expect(s.coincidencias.fecha_nacimiento).toBe(true)
    expect(s.coincidencias.instrumento_principal).toBe(true)
  })

  it('nivelDuplicado clasifica alto y medio', () => {
    expect(nivelDuplicado(0.9).nivel).toBe('alta')
    expect(nivelDuplicado(0.7).nivel).toBe('media')
    expect(nivelDuplicado(0.5)).toBeNull()
  })
})

describe('duplicadosAlumnos: detección en lista', () => {
  it('encuentra la pareja duplicada y la ordena por puntaje', () => {
    const alumnos = [
      { id: 'a', nombre_completo: 'Luis Martinez', fecha_nacimiento: '2015-05-10', madre_nombre: 'Carmen', instrumento_principal: 'Violín' },
      { id: 'b', nombre_completo: 'Luis Eduardo Martinez Obando', fecha_nacimiento: '2015-05-10', madre_nombre: 'Carmen', instrumento_principal: 'Violín' },
      { id: 'c', nombre_completo: 'Ana García', fecha_nacimiento: '2014-01-01', madre_nombre: 'Rosa', instrumento_principal: 'Flauta' },
    ]
    const res = detectarPosiblesDuplicados(alumnos)
    expect(res).toHaveLength(1)
    expect(res[0].a.id).toBe('a')
    expect(res[0].b.id).toBe('b')
    expect(res[0].nivel).toBe('alta')
  })

  it('nombres con igual apellido pero distinta identidad no se marcan', () => {
    const alumnos = [
      { id: 'a', nombre_completo: 'Luis Martinez', fecha_nacimiento: '2015-05-10', madre_nombre: 'Carmen' },
      { id: 'b', nombre_completo: 'Pedro Martinez', fecha_nacimiento: '2013-11-02', madre_nombre: 'Juana' },
    ]
    expect(detectarPosiblesDuplicados(alumnos)).toHaveLength(0)
  })

  it('permite subir el umbral mínimo', () => {
    const alumnos = [
      { id: 'a', nombre_completo: 'Luis Martinez' },
      { id: 'b', nombre_completo: 'Luis Eduardo Martinez Obando' },
    ]
    const res = detectarPosiblesDuplicados(alumnos, { minPuntaje: 0.95 })
    expect(res).toHaveLength(0)
  })

  it('detecta duplicado complejo: Matias Paredes vs Mathias Alejandro Paredes Masuoka con mismo padre', () => {
    const alumnos = [
      { id: 'm1', nombre_completo: 'Matias Paredes', padre_nombre: 'Carlos Paredes' },
      { id: 'm2', nombre_completo: 'Mathias Alejandro Paredes Masuoka', padre_nombre: 'Carlos Paredes' },
      { id: 'x3', nombre_completo: 'Juan Pérez', padre_nombre: 'Pedro Pérez' },
    ]
    const res = detectarPosiblesDuplicados(alumnos)
    expect(res.length).toBeGreaterThanOrEqual(1)
    expect(res[0].a.id).toBe('m1')
    expect(res[0].b.id).toBe('m2')
    expect(res[0].puntaje).toBeGreaterThanOrEqual(0.80)
    expect(res[0].nivel).toBe('alta')
  })
})

describe('duplicadosAlumnos: fusión', () => {
  const reg1 = {
    id: '1',
    nombre_completo: 'Luis Martinez',
    genero: 'M',
    fecha_nacimiento: '2015-05-10',
    instrumento_principal: 'Violín',
    representante_tlf: null,
    correo_representante: null,
  }
  const reg2 = {
    id: '2',
    nombre_completo: 'Luis Eduardo Martinez Obando',
    genero: null,
    fecha_nacimiento: '2015-05-10',
    instrumento_principal: 'Violín',
    representante_tlf: '+18091111111',
    correo_representante: 'lmartinez@gmail.com',
  }

  it('completa los campos vacíos del principal con los del obsoleto', () => {
    const fusion = construirFusion(reg1, reg2)
    expect(fusion.resultante.nombre_completo).toBe('Luis Eduardo Martinez Obando')
    expect(fusion.resultante.genero).toBe('M')
    expect(fusion.resultante.representante_tlf).toBe('+18091111111')
    expect(fusion.resultante.correo_representante).toBe('lmartinez@gmail.com')
    expect(fusion.completados).toBe(4) // nombre, tlf, correo, genero
  })

  it('no marca conflicto cuando los valores coinciden', () => {
    const fusion = construirFusion(reg1, reg2)
    expect(fusion.conflictos).toBe(0)
    const fecha = fusion.campos.find(c => c.key === 'fecha_nacimiento')
    expect(fecha.tipo).toBe('coincide')
  })

  it('marca conflicto cuando ambos tienen valores distintos', () => {
    const fusion = construirFusion(
      { ...reg1, instrumento_principal: 'Viola' },
      { ...reg2, instrumento_principal: 'Violín' },
    )
    const inst = fusion.campos.find(c => c.key === 'instrumento_principal')
    expect(inst.tipo).toBe('conflicto')
    expect(inst.puedeElegir).toBe(true)
    // El nombre se adopta como "más completo" (subconjunto) y no genera conflicto.
    expect(fusion.conflictos).toBe(1)
  })

  it('por defecto gana el principal en conflicto', () => {
    const fusion = construirFusion(
      { ...reg1, instrumento_principal: 'Viola' },
      { ...reg2, instrumento_principal: 'Violín' },
    )
    expect(fusion.resultante.instrumento_principal).toBe('Viola')
  })

  it('quienEsMasCompleto elige el registro con más datos', () => {
    const masCompleto = quienEsMasCompleto(reg1, reg2)
    expect(masCompleto.id).toBe('2')
  })

  it('cubre todos los campos de CAMPOS_FUSION en la fusión', () => {
    const fusion = construirFusion({}, {})
    expect(fusion.campos).toHaveLength(CAMPOS_FUSION.length)
    expect(fusion.resultante).toEqual({})
  })
})

describe('duplicadosAlumnos: comparaciones robustas', () => {
  it('compara teléfonos por dígitos (809 vs +809 vs (809))', () => {
    const c = evaluarCampo(
      { key: 'representante_tlf', label: 'Tel', grupo: 'Contacto' },
      { representante_tlf: '+18095551234' },
      { representante_tlf: '1(809)555-1234' },
    )
    expect(c.tipo).toBe('coincide')
  })

  it('trata null y vacío como vacíos', () => {
    const c = evaluarCampo(
      { key: 'madre_nombre', label: 'Madre', grupo: 'Familia' },
      { madre_nombre: null },
      { madre_nombre: 'Carmen' },
    )
    expect(c.tipo).toBe('completa')
    expect(c.valorFusionado).toBe('Carmen')
  })
})