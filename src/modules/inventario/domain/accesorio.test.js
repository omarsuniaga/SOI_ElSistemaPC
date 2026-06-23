import { describe, test, expect } from 'vitest'
import {
  TIPOS_ACCESORIO,
  COMPATIBILIDAD_CATEGORIA,
  validarAccesorio,
  accesorioCompatibleCon,
  accesorioAsignable,
  aumentarStock,
  disminuirStock,
  estadoAccesorioLabel,
} from './accesorio.js'

describe('TIPOS_ACCESORIO', () => {
  test('incluye al menos 5 tipos', () => {
    expect(TIPOS_ACCESORIO.length).toBeGreaterThanOrEqual(5)
  })

  test('incluye tipos esperados', () => {
    expect(TIPOS_ACCESORIO).toContain('funda')
    expect(TIPOS_ACCESORIO).toContain('arco')
    expect(TIPOS_ACCESORIO).toContain('cuerdas')
    expect(TIPOS_ACCESORIO).toContain('boquilla')
    expect(TIPOS_ACCESORIO).toContain('atril')
    expect(TIPOS_ACCESORIO).toContain('parlante')
    expect(TIPOS_ACCESORIO).toContain('cable')
    expect(TIPOS_ACCESORIO).toContain('otro')
  })
})

describe('COMPATIBILIDAD_CATEGORIA', () => {
  test('tiene entradas para categorías esperadas', () => {
    const categorias = Object.keys(COMPATIBILIDAD_CATEGORIA)
    expect(categorias.length).toBeGreaterThanOrEqual(3)
  })
})

describe('accesorioCompatibleCon', () => {
  test('violín compatible con arco y funda', () => {
    expect(accesorioCompatibleCon('arco', 'Violín')).toBe(true)
    expect(accesorioCompatibleCon('funda', 'Violín')).toBe(true)
  })

  test('cuerdas compatible con cualquier categoría', () => {
    expect(accesorioCompatibleCon('cuerdas', 'Violín')).toBe(true)
    expect(accesorioCompatibleCon('cuerdas', 'Cello')).toBe(true)
  })

  test('boquilla NO compatible con Violín', () => {
    expect(accesorioCompatibleCon('boquilla', 'Violín')).toBe(false)
  })

  test('otro es compatible con cualquier categoría', () => {
    expect(accesorioCompatibleCon('otro', 'Violín')).toBe(true)
    expect(accesorioCompatibleCon('otro', 'Piano')).toBe(true)
  })

  test('parlante compatible con instrumentos eléctricos', () => {
    expect(accesorioCompatibleCon('parlante', 'Bajo Eléctrico')).toBe(true)
    expect(accesorioCompatibleCon('parlante', 'Violín')).toBe(false)
  })

  test('tipo de accesorio desconocido retorna false', () => {
    expect(accesorioCompatibleCon('inexistente', 'Violín')).toBe(false)
  })
})

describe('validarAccesorio', () => {
  test('payload válido retorna array vacío', () => {
    const errores = validarAccesorio({ tipo: 'funda', activo_id: 'act-1', cantidad: 1 })
    expect(errores).toEqual([])
  })

  test('retorna error si falta tipo', () => {
    const errores = validarAccesorio({ activo_id: 'act-1', cantidad: 1 })
    expect(errores).toContain('tipo es requerido')
  })

  test('retorna error si falta activo_id', () => {
    const errores = validarAccesorio({ tipo: 'funda', cantidad: 1 })
    expect(errores).toContain('activo_id es requerido')
  })

  test('retorna error si cantidad <= 0', () => {
    const errores = validarAccesorio({ tipo: 'funda', activo_id: 'act-1', cantidad: 0 })
    expect(errores).toContain('cantidad debe ser mayor a 0')
  })

  test('retorna error si cantidad negativa', () => {
    const errores = validarAccesorio({ tipo: 'funda', activo_id: 'act-1', cantidad: -1 })
    expect(errores).toContain('cantidad debe ser mayor a 0')
  })

  test('retorna error si tipo no es válido', () => {
    const errores = validarAccesorio({ tipo: 'inexistente', activo_id: 'act-1', cantidad: 1 })
    expect(errores.some(e => e.includes('tipo'))).toBe(true)
  })
})

describe('accesorioAsignable', () => {
  test('con activo_id y estado disponible → true', () => {
    expect(accesorioAsignable({ activo_id: 'act-1', estado: 'disponible' })).toBe(true)
  })

  test('sin activo_id → false', () => {
    expect(accesorioAsignable({ estado: 'disponible' })).toBe(false)
  })

  test('estado agotado → false', () => {
    expect(accesorioAsignable({ activo_id: 'act-1', estado: 'agotado' })).toBe(false)
  })
})

describe('aumentarStock', () => {
  test('incrementa cantidad correctamente', () => {
    const resultado = aumentarStock({ cantidad: 5 }, 3)
    expect(resultado.cantidad).toBe(8)
  })

  test('retorna nuevo objeto (inmutable)', () => {
    const original = { cantidad: 5 }
    const resultado = aumentarStock(original, 3)
    expect(resultado).not.toBe(original)
  })
})

describe('disminuirStock', () => {
  test('disminuye cantidad correctamente', () => {
    const resultado = disminuirStock({ cantidad: 5 }, 2)
    expect(resultado.cantidad).toBe(3)
  })

  test('lanza error si intenta bajar de 0 stock', () => {
    expect(() => disminuirStock({ cantidad: 1 }, 2)).toThrow()
  })

  test('retorna nuevo objeto (inmutable)', () => {
    const original = { cantidad: 5 }
    const resultado = disminuirStock(original, 1)
    expect(resultado).not.toBe(original)
  })
})

describe('estadoAccesorioLabel', () => {
  test('retorna label legible para cada estado', () => {
    expect(estadoAccesorioLabel('disponible')).toMatch(/Disponible/i)
    expect(estadoAccesorioLabel('asignado')).toMatch(/Asignado/i)
    expect(estadoAccesorioLabel('agotado')).toMatch(/Agotado/i)
  })

  test('retorna el estado mismo si no hay label mapeado', () => {
    expect(estadoAccesorioLabel('inexistente')).toBe('inexistente')
  })
})
