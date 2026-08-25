import { describe, it, expect } from 'vitest'
import {
  construirSesiones,
  detectarConflictosSalon,
  detectarSobreCupo,
  detectarSinSalon,
  detectarSalonPlaceholder,
  detectarNombresDuplicados,
  construirDiagnostico,
  familiaDe,
} from '../horarioGeneralService.js'

/**
 * horarioGeneralService.test.js
 *
 * Cubre la lógica de diagnóstico del módulo "Horario General" — la misma
 * verificada a mano contra Supabase real al generar el reporte del mismo
 * nombre (36 clases, 1 conflicto de salón real, 5 sobre-cupo, 2 clases
 * "Cátedra de Oboe" con nombre duplicado). Estos casos replican esos
 * hallazgos para que no se rompan silenciosamente.
 */

function clase(overrides) {
  return {
    id: 'c1',
    nombre: 'Clase',
    instrumento: 'Violín',
    capacidad_maxima: 20,
    inscritos: 5,
    horarios: [],
    ...overrides,
  }
}

const maestroNombreById = new Map([
  ['m1', 'Prof. Ana'],
  ['m2', 'Prof. Bruno'],
])
const salonNombreById = new Map([
  ['s1', 'Salón Bach'],
  ['s2', 'Salón Vivaldi'],
  ['s3', 'Salón Sin Nombre'],
])

describe('construirSesiones', () => {
  it('aplana clase+horarios en una fila por sesión, con nombres resueltos', () => {
    const clases = [
      clase({
        id: 'c1',
        nombre: 'Violín 101',
        maestro_principal_id: 'm1',
        horarios: [
          { dia: 'lunes', hora_inicio: '15:00:00', hora_fin: '16:00:00', salon_id: 's1' },
          { dia: 'miércoles', hora_inicio: '15:00:00', hora_fin: '16:00:00', salon_id: 's1' },
        ],
      }),
    ]

    const sesiones = construirSesiones(clases, { maestroNombreById, salonNombreById })

    expect(sesiones).toHaveLength(2)
    expect(sesiones[0]).toMatchObject({ dia: 'lunes', inicio: '15:00', fin: '16:00', salon: 'Salón Bach', maestro: 'Prof. Ana' })
  })

  it('sin salon_id, no rompe — salon queda null', () => {
    const clases = [clase({ horarios: [{ dia: 'lunes', hora_inicio: '15:00:00', hora_fin: '16:00:00', salon_id: null }] })]

    const sesiones = construirSesiones(clases, { maestroNombreById, salonNombreById })

    expect(sesiones[0].salon).toBeNull()
    expect(sesiones[0].salonId).toBeNull()
  })

  it('con suplente asignado, resuelve su nombre también', () => {
    const clases = [
      clase({
        maestro_principal_id: 'm1',
        maestro_suplente_id: 'm2',
        horarios: [{ dia: 'lunes', hora_inicio: '15:00:00', hora_fin: '16:00:00', salon_id: 's1' }],
      }),
    ]

    const sesiones = construirSesiones(clases, { maestroNombreById, salonNombreById })

    expect(sesiones[0].maestro).toBe('Prof. Ana')
    expect(sesiones[0].suplente).toBe('Prof. Bruno')
  })
})

describe('detectarConflictosSalon', () => {
  it('detecta dos clases distintas en el mismo salón, mismo día, con horas que se solapan', () => {
    const sesiones = [
      { claseId: 'c1', clase: 'Coro Niños Cantores', dia: 'viernes', inicio: '16:30', fin: '18:30', salonId: 's1', salon: 'Salón Bach' },
      { claseId: 'c2', clase: 'Iniciación Coral - Grupo B', dia: 'viernes', inicio: '17:00', fin: '18:30', salonId: 's1', salon: 'Salón Bach' },
    ]

    const conflictos = detectarConflictosSalon(sesiones)

    expect(conflictos).toHaveLength(1)
    expect(conflictos[0].a.clase).toBe('Coro Niños Cantores')
    expect(conflictos[0].b.clase).toBe('Iniciación Coral - Grupo B')
  })

  it('la misma clase repitiéndose (multi-horario) en el mismo salón NO es un conflicto consigo misma', () => {
    const sesiones = [
      { claseId: 'c1', clase: 'Violín 101', dia: 'lunes', inicio: '15:00', fin: '16:00', salonId: 's1' },
      { claseId: 'c1', clase: 'Violín 101', dia: 'lunes', inicio: '15:30', fin: '16:30', salonId: 's1' },
    ]

    expect(detectarConflictosSalon(sesiones)).toHaveLength(0)
  })

  it('horarios consecutivos sin solape (17:00 termina cuando empieza el otro) no son conflicto', () => {
    const sesiones = [
      { claseId: 'c1', clase: 'A', dia: 'lunes', inicio: '15:00', fin: '17:00', salonId: 's1' },
      { claseId: 'c2', clase: 'B', dia: 'lunes', inicio: '17:00', fin: '18:00', salonId: 's1' },
    ]

    expect(detectarConflictosSalon(sesiones)).toHaveLength(0)
  })

  it('salones distintos al mismo horario no son conflicto', () => {
    const sesiones = [
      { claseId: 'c1', clase: 'A', dia: 'lunes', inicio: '15:00', fin: '17:00', salonId: 's1' },
      { claseId: 'c2', clase: 'B', dia: 'lunes', inicio: '15:00', fin: '17:00', salonId: 's2' },
    ]

    expect(detectarConflictosSalon(sesiones)).toHaveLength(0)
  })

  it('sesiones sin salón (salonId null) se ignoran — no pueden generar falso conflicto', () => {
    const sesiones = [
      { claseId: 'c1', clase: 'A', dia: 'lunes', inicio: '15:00', fin: '17:00', salonId: null },
      { claseId: 'c2', clase: 'B', dia: 'lunes', inicio: '15:00', fin: '17:00', salonId: null },
    ]

    expect(detectarConflictosSalon(sesiones)).toHaveLength(0)
  })
})

describe('detectarSobreCupo', () => {
  it('una fila por clase — no se repite aunque tenga varias sesiones semanales', () => {
    const clases = [clase({ id: 'c1', nombre: 'Coro Niños Cantores', capacidad_maxima: 40, inscritos: 42 })]

    expect(detectarSobreCupo(clases)).toHaveLength(1)
  })

  it('capacidad_maxima=1 con muchos inscritos (dato mal cargado) también se detecta', () => {
    const clases = [clase({ nombre: '3 - Clases de Violin', capacidad_maxima: 1, inscritos: 11 })]

    expect(detectarSobreCupo(clases)).toHaveLength(1)
  })

  it('exactamente en el límite no cuenta como sobre-cupo', () => {
    const clases = [clase({ capacidad_maxima: 20, inscritos: 20 })]

    expect(detectarSobreCupo(clases)).toHaveLength(0)
  })
})

describe('detectarSinSalon / detectarSalonPlaceholder', () => {
  it('cuenta sesiones sin salon_id', () => {
    const sesiones = [
      { claseId: 'c1', clase: 'A', salonId: null, salon: null },
      { claseId: 'c2', clase: 'B', salonId: 's1', salon: 'Salón Bach' },
    ]

    expect(detectarSinSalon(sesiones)).toHaveLength(1)
  })

  it('detecta el salón placeholder "Salón Sin Nombre" sin importar mayúsculas/espacios', () => {
    const sesiones = [
      { claseId: 'c1', clase: 'A', salonId: 's3', salon: '  Salón Sin Nombre  ' },
      { claseId: 'c2', clase: 'B', salonId: 's1', salon: 'Salón Bach' },
    ]

    expect(detectarSalonPlaceholder(sesiones)).toHaveLength(1)
  })
})

describe('detectarNombresDuplicados', () => {
  it('detecta dos ids de clase distintos con el mismo nombre literal (caso real: "Cátedra de Oboe")', () => {
    const clases = [
      clase({ id: 'a1', nombre: 'Cátedra de Oboe' }),
      clase({ id: 'a2', nombre: 'Cátedra de Oboe' }),
      clase({ id: 'a3', nombre: 'Cátedra de Flauta' }),
    ]

    const dup = detectarNombresDuplicados(clases)

    expect(dup).toEqual([['Cátedra de Oboe', ['a1', 'a2']]])
  })

  it('sin nombres repetidos, no reporta nada', () => {
    const clases = [clase({ id: 'a1', nombre: 'A' }), clase({ id: 'a2', nombre: 'B' })]

    expect(detectarNombresDuplicados(clases)).toEqual([])
  })
})

describe('familiaDe', () => {
  it('agrupa instrumentos conocidos en su familia', () => {
    expect(familiaDe('Violines')).toBe('cuerdas')
    expect(familiaDe('Trompetas')).toBe('metales')
    expect(familiaDe('Clarinete')).toBe('maderas')
    expect(familiaDe('Percusión')).toBe('percusion')
    expect(familiaDe('Voz')).toBe('voz')
  })

  it('instrumento desconocido o vacío cae en "otros"', () => {
    expect(familiaDe('Algo Raro')).toBe('otros')
    expect(familiaDe(null)).toBe('otros')
  })
})

describe('construirDiagnostico', () => {
  it('arma stats y findings combinando todos los hallazgos, deduplicados por clase', () => {
    const clases = [
      clase({ id: 'c1', nombre: 'Coro Niños Cantores', capacidad_maxima: 40, inscritos: 42 }),
      clase({ id: 'c2', nombre: 'Iniciación Coral - Grupo B', capacidad_maxima: 20, inscritos: 16, instrumento: null }),
    ]
    const sesiones = [
      { claseId: 'c1', clase: 'Coro Niños Cantores', dia: 'viernes', inicio: '16:30', fin: '18:30', salonId: 's1', salon: 'Salón Bach' },
      { claseId: 'c2', clase: 'Iniciación Coral - Grupo B', dia: 'viernes', inicio: '17:00', fin: '18:30', salonId: 's1', salon: 'Salón Bach' },
    ]

    const { stats, findings } = construirDiagnostico(clases, sesiones)

    expect(stats).toMatchObject({ totalClases: 2, totalSesiones: 2, conflictos: 1, sinSalon: 0, sobreCupo: 1 })
    expect(findings.some((f) => f.chip === 'Conflicto')).toBe(true)
    expect(findings.some((f) => f.chip === 'Cupo')).toBe(true)
    expect(findings.some((f) => f.chip === 'Dato' && f.summary.includes('instrumento'))).toBe(true)
  })

  it('sin hallazgos, stats en cero y findings vacío (la vista decide el mensaje "todo OK")', () => {
    const clases = [clase({ id: 'c1', capacidad_maxima: 20, inscritos: 5 })]
    const sesiones = [{ claseId: 'c1', clase: 'Clase', dia: 'lunes', inicio: '15:00', fin: '16:00', salonId: 's1', salon: 'Salón Bach' }]

    const { stats, findings } = construirDiagnostico(clases, sesiones)

    expect(stats.conflictos).toBe(0)
    expect(stats.sobreCupo).toBe(0)
    expect(stats.sinSalon).toBe(0)
    expect(findings).toEqual([])
  })
})
