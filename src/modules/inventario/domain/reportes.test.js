import { describe, test, expect } from 'vitest'
import {
  TIPOS_REPORTE,
  armarReporte,
  filtrarReporte,
  exportarCSV,
  resumirInventario,
  activosPorTipo,
  topInstrumentosMasPrestados,
  alumnosConMasComodatos,
  reparacionesPorEstado,
} from './reportes.js'

describe('TIPOS_REPORTE', () => {
  test('incluye tipos esperados', () => {
    expect(TIPOS_REPORTE).toContain('general')
    expect(TIPOS_REPORTE).toContain('historial')
    expect(TIPOS_REPORTE).toContain('reparaciones')
    expect(TIPOS_REPORTE).toContain('comodatos')
    expect(TIPOS_REPORTE).toContain('resumen')
  })
})

describe('resumirInventario', () => {
  test('con arrays vacíos retorna ceros', () => {
    const resumen = resumirInventario({ activos: [], comodatos: [], reparaciones: [] })
    expect(resumen.total).toBe(0)
    expect(resumen.disponibles).toBe(0)
    expect(resumen.en_uso).toBe(0)
    expect(resumen.en_reparacion).toBe(0)
    expect(resumen.valor_total).toBe(0)
  })

  test('calcula correctamente con datos', () => {
    const activos = [
      { id: '1', estado_uso: 'disponible', activo: true, valor_adquisicion: 500 },
      { id: '2', estado_uso: 'prestado', activo: true, valor_adquisicion: 300 },
      { id: '3', estado_uso: 'en_reparacion', activo: true, valor_adquisicion: 200 },
      { id: '4', estado_uso: 'de_baja', activo: false, valor_adquisicion: 100 },
    ]
    const comodatos = [
      { activo_id: '2', estado: 'activo' },
    ]
    const reparaciones = [
      { activo_id: '3', estado: 'en_reparacion' },
    ]
    const resumen = resumirInventario({ activos, comodatos, reparaciones })
    expect(resumen.total).toBe(4)
    expect(resumen.disponibles).toBe(1)
    expect(resumen.en_uso).toBe(1)
    expect(resumen.en_reparacion).toBe(1)
    expect(resumen.de_baja).toBe(1)
    expect(resumen.valor_total).toBe(1100)
  })
})

describe('activosPorTipo', () => {
  test('agrupa correctamente 2 violines + 1 cello', () => {
    const activos = [
      { id: '1', tipo_instrumento: 'Violín' },
      { id: '2', tipo_instrumento: 'Violín' },
      { id: '3', tipo_instrumento: 'Cello' },
    ]
    const agrupado = activosPorTipo(activos)
    expect(agrupado['Violín']).toBe(2)
    expect(agrupado['Cello']).toBe(1)
  })

  test('con array vacío retorna objeto vacío', () => {
    expect(activosPorTipo([])).toEqual({})
  })
})

describe('topInstrumentosMasPrestados', () => {
  test('retorna ranking con límite por defecto 10', () => {
    const comodatos = [
      { activo_id: 'act-1' },
      { activo_id: 'act-2' },
      { activo_id: 'act-1' },
    ]
    const activos = [
      { id: 'act-1', codigo_inventario: 'V8-VIO-001', tipo_instrumento: 'Violín' },
      { id: 'act-2', codigo_inventario: 'V8-CEL-001', tipo_instrumento: 'Cello' },
    ]
    const ranking = topInstrumentosMasPrestados(comodatos, activos, 10)
    expect(ranking[0].codigo_inventario).toBe('V8-VIO-001')
    expect(ranking[0].veces).toBe(2)
    expect(ranking[1].veces).toBe(1)
  })

  test('con datos vacíos retorna array vacío', () => {
    expect(topInstrumentosMasPrestados([], [])).toEqual([])
  })
})

describe('alumnosConMasComodatos', () => {
  test('retorna ranking de alumnos con más comodatos', () => {
    const comodatos = [
      { alumno_id: 'al-1' },
      { alumno_id: 'al-2' },
      { alumno_id: 'al-1' },
    ]
    const ranking = alumnosConMasComodatos(comodatos, 10)
    expect(ranking[0].alumno_id).toBe('al-1')
    expect(ranking[0].total).toBe(2)
  })

  test('con datos vacíos retorna array vacío', () => {
    expect(alumnosConMasComodatos([], 10)).toEqual([])
  })
})

describe('reparacionesPorEstado', () => {
  test('agrupa reparaciones por estado', () => {
    const reparaciones = [
      { estado: 'recibido' },
      { estado: 'en_reparacion' },
      { estado: 'recibido' },
      { estado: 'entregado' },
    ]
    const agrupado = reparacionesPorEstado(reparaciones)
    expect(agrupado['recibido']).toBe(2)
    expect(agrupado['en_reparacion']).toBe(1)
    expect(agrupado['entregado']).toBe(1)
  })

  test('con array vacío retorna objeto vacío', () => {
    expect(reparacionesPorEstado([])).toEqual({})
  })
})

describe('armarReporte', () => {
  test('retorna estructura esperada para tipo general', () => {
    const reporte = armarReporte('general', { activos: [], comodatos: [], reparaciones: [] })
    expect(reporte.tipo).toBe('general')
    expect(reporte.fecha_generacion).toBeDefined()
    expect(reporte.datos).toBeDefined()
  })
})

describe('filtrarReporte', () => {
  test('filtra por tipo de instrumento', () => {
    const activos = [
      { id: '1', tipo_instrumento: 'Violín', estado_uso: 'disponible' },
      { id: '2', tipo_instrumento: 'Cello', estado_uso: 'disponible' },
    ]
    const filtrados = filtrarReporte(activos, { tipo_instrumento: 'Violín' })
    expect(filtrados).toHaveLength(1)
    expect(filtrados[0].id).toBe('1')
  })

  test('filtra por estado_uso', () => {
    const activos = [
      { id: '1', tipo_instrumento: 'Violín', estado_uso: 'disponible' },
      { id: '2', tipo_instrumento: 'Cello', estado_uso: 'prestado' },
    ]
    const filtrados = filtrarReporte(activos, { estado_uso: 'prestado' })
    expect(filtrados).toHaveLength(1)
  })

  test('retorna todos si no hay filtros', () => {
    const activos = [
      { id: '1', tipo_instrumento: 'Violín', estado_uso: 'disponible' },
      { id: '2', tipo_instrumento: 'Cello', estado_uso: 'prestado' },
    ]
    const filtrados = filtrarReporte(activos, {})
    expect(filtrados).toHaveLength(2)
  })
})

describe('exportarCSV', () => {
  const data = [
    { codigo: 'V8-VIO-001', tipo: 'Violín', estado: 'disponible' },
    { codigo: 'V8-CEL-001', tipo: 'Cello', estado: 'prestado' },
  ]

  test('genera string CSV con headers', () => {
    const csv = exportarCSV(data, ['codigo', 'tipo', 'estado'])
    expect(csv).toContain('codigo,tipo,estado')
    expect(csv).toContain('V8-VIO-001')
    expect(csv).toContain('V8-CEL-001')
  })

  test('maneja datos vacíos', () => {
    const csv = exportarCSV([], ['a', 'b'])
    expect(csv).toContain('a,b')
  })
})
