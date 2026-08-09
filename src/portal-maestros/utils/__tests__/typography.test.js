import { describe, it, expect } from 'vitest'
import {
  FONT_SCALES, FONT_SCALE_LABELS, FONT_FAMILIES,
  normalizeFontScale, scaleIndex, scaleLabel,
  getSavedFontScale, getSavedFontFamily, resolveFontFamily
} from '../typography.js'

describe('normalizeFontScale', () => {
  it('acepta las escalas definidas', () => {
    FONT_SCALES.forEach(s => expect(normalizeFontScale(s)).toBe(s))
  })

  it('rechaza valores fuera del rango y devuelve 1', () => {
    expect(normalizeFontScale('0.92')).toBe('1')
    expect(normalizeFontScale('2')).toBe('1')
    expect(normalizeFontScale('abc')).toBe('1')
  })
})

describe('escalas', () => {
  it('define 5 niveles de zoom in y 4 de zoom out desde 100%', () => {
    expect(FONT_SCALES).toEqual(['0.5', '0.6', '0.85', '0.9', '1', '1.16', '1.25', '1.5', '1.8'])
  })

  it('tiene 100% en el centro de la lista', () => {
    expect(FONT_SCALES[4]).toBe('1')
  })

  it('scaleIndex devuelve posición correcta', () => {
    expect(scaleIndex('1')).toBe(4)
    expect(scaleIndex('1.8')).toBe(8)
    expect(scaleIndex('0.5')).toBe(0)
  })

  it('scaleLabel muestra porcentajes legibles', () => {
    expect(scaleLabel('1')).toBe('100%')
    expect(scaleLabel('1.16')).toBe('116%')
    expect(scaleLabel('1.8')).toBe('180%')
    expect(scaleLabel('0.5')).toBe('50%')
  })

  it('todas las escalas tienen label', () => {
    FONT_SCALES.forEach(s => expect(FONT_SCALE_LABELS[s]).toBeTruthy())
  })
})

describe('tipografías', () => {
  it('ofrece al menos 5 estilos de letra', () => {
    expect(FONT_FAMILIES.length).toBeGreaterThanOrEqual(5)
  })

  it('incluye la fuente del sistema como predeterminada', () => {
    expect(FONT_FAMILIES[0].id).toBe('system')
  })

  it('resolveFontFamily cae a sistema si el id no existe', () => {
    expect(resolveFontFamily('no-existe').id).toBe('system')
    expect(resolveFontFamily('inter').id).toBe('inter')
  })

  it('cada familia tiene stack de respaldo', () => {
    FONT_FAMILIES.forEach(f => {
      expect(f.stack.length).toBeGreaterThan(0)
      expect(f.label.length).toBeGreaterThan(0)
    })
  })
})
