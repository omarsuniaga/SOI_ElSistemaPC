import { describe, test, expect } from 'vitest'
import {
  buscarAlumnos,
  getCuotasByAlumno,
  listarAlumnosPorEstado,
} from '../api/cajaMock.js'

describe('buscarAlumnos', () => {
  test('devuelve [] con menos de 2 caracteres', async () => {
    expect((await buscarAlumnos('a')).data).toEqual([])
    expect((await buscarAlumnos('')).data).toEqual([])
  })

  test('encuentra por nombre de alumno', async () => {
    const { data } = await buscarAlumnos('sofía')
    expect(data.map(a => a.alumno_nombre)).toContain('Sofía García')
  })

  test('encuentra por nombre de representante', async () => {
    const { data } = await buscarAlumnos('carlos lópez')
    expect(data.some(a => a.familia_id === 'fam-002')).toBe(true)
  })

  test('encuentra por nombre de familia', async () => {
    const { data } = await buscarAlumnos('rodríguez')
    expect(data.length).toBeGreaterThan(0)
  })

  test('oculta retirados por defecto', async () => {
    const { data } = await buscarAlumnos('martínez')
    expect(data.some(a => a.alumno_nombre === 'Diego Martínez')).toBe(false)
  })

  test('incluye retirados con incluirRetirados', async () => {
    const { data } = await buscarAlumnos('martínez', { incluirRetirados: true })
    const diego = data.find(a => a.alumno_nombre === 'Diego Martínez')
    expect(diego?.estado_pago).toBe('inactivo')
  })

  test('cada fila trae el contrato de la vista', async () => {
    const { data } = await buscarAlumnos('mateo')
    const row = data[0]
    expect(row).toMatchObject({
      alumno_id: expect.any(String),
      alumno_nombre: expect.any(String),
      alumno_activo: expect.any(Boolean),
      nombre_familia: expect.any(String),
      contacto_nombre: expect.any(String),
      saldo_pendiente_centavos: expect.any(Number),
      estado_pago: expect.stringMatching(/^(al_dia|debe|mora|exento|inactivo)$/),
    })
  })
})

describe('getCuotasByAlumno', () => {
  test('solo liquidables por defecto, más viejas primero', async () => {
    const { data } = await getCuotasByAlumno('alum-005')
    expect(data.length).toBeGreaterThan(0)
    expect(data.every(c => ['pendiente', 'vencida', 'en_mora'].includes(c.estado))).toBe(true)
    const fechas = data.map(c => c.fecha_vencimiento)
    expect(fechas).toEqual([...fechas].sort())
  })

  test('soloLiquidables:false incluye pagadas y becadas', async () => {
    const { data } = await getCuotasByAlumno('alum-004', { soloLiquidables: false })
    expect(data.some(c => c.estado === 'pagada' || c.estado === 'becada')).toBe(true)
  })

  test('alumno sin cuotas devuelve []', async () => {
    expect((await getCuotasByAlumno('alum-006')).data).toEqual([])
  })
})

describe('listarAlumnosPorEstado', () => {
  test('filtra por un estado', async () => {
    const { data } = await listarAlumnosPorEstado('mora')
    expect(data.length).toBeGreaterThan(0)
    expect(data.every(a => a.estado_pago === 'mora')).toBe(true)
  })

  test('acepta varios estados', async () => {
    const { data } = await listarAlumnosPorEstado(['exento', 'al_dia'])
    expect(data.every(a => ['exento', 'al_dia'].includes(a.estado_pago))).toBe(true)
  })

  test('soloConSaldo: "deudas de retirados"', async () => {
    const { data } = await listarAlumnosPorEstado('inactivo', { soloConSaldo: true })
    expect(data.every(a => a.estado_pago === 'inactivo' && a.saldo_pendiente_centavos > 0)).toBe(true)
  })

  test('soloActivos excluye retirados', async () => {
    const { data } = await listarAlumnosPorEstado(['al_dia', 'debe', 'mora', 'exento', 'inactivo'], { soloActivos: true })
    expect(data.every(a => a.alumno_activo === true)).toBe(true)
  })

  test('ordenado por nombre', async () => {
    const { data } = await listarAlumnosPorEstado(['al_dia', 'debe', 'mora', 'exento'])
    const nombres = data.map(a => a.alumno_nombre)
    expect(nombres).toEqual([...nombres].sort((a, b) => a.localeCompare(b)))
  })
})
