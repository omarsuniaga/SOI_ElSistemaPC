import { describe, it, expect } from 'vitest'
import { resolverPertenenciaClase } from '../suplenciaService.js'

const CLASE_CON_SUPLENTE = {
  id: 'clase-1',
  nombre: 'Violín 101',
  maestro_principal_id: 'maestro-titular',
  maestro_suplente_id: 'maestro-suplente',
  maestro_id: null,
}

describe('resolverPertenenciaClase', () => {
  it('el titular: maestroIdSesion es su propio id, esTitular=true, esSuplente=false', () => {
    const r = resolverPertenenciaClase(CLASE_CON_SUPLENTE, 'maestro-titular')

    expect(r.maestroIdSesion).toBe('maestro-titular')
    expect(r.esTitular).toBe(true)
    expect(r.esSuplente).toBe(false)
  })

  it('el suplente: maestroIdSesion sigue siendo el TITULAR, esSuplente=true', () => {
    const r = resolverPertenenciaClase(CLASE_CON_SUPLENTE, 'maestro-suplente')

    expect(r.maestroIdSesion).toBe('maestro-titular')
    expect(r.esSuplente).toBe(true)
    expect(r.esTitular).toBe(false)
  })

  it('un maestro ajeno (ni titular ni suplente): maestroIdSesion sigue siendo el titular, ninguna bandera activa', () => {
    const r = resolverPertenenciaClase(CLASE_CON_SUPLENTE, 'maestro-ajeno')

    expect(r.maestroIdSesion).toBe('maestro-titular')
    expect(r.esSuplente).toBe(false)
    expect(r.esTitular).toBe(false)
  })

  it('idsRelevantes incluye titular, suplente y el maestro logueado — sin duplicados', () => {
    const r = resolverPertenenciaClase(CLASE_CON_SUPLENTE, 'maestro-suplente')

    expect(r.idsRelevantes).toEqual(new Set(['maestro-titular', 'maestro-suplente']))
  })

  it('clase sin suplente: se comporta igual que hoy para el titular (sin romper el caso normal)', () => {
    const clase = { id: 'c1', maestro_principal_id: 'maestro-titular', maestro_suplente_id: null }
    const r = resolverPertenenciaClase(clase, 'maestro-titular')

    expect(r.maestroIdSesion).toBe('maestro-titular')
    expect(r.esSuplente).toBe(false)
    expect(r.idsRelevantes).toEqual(new Set(['maestro-titular']))
  })

  it('clase legacy sin maestro_principal_id, solo maestro_id: usa maestro_id como titular', () => {
    const clase = { id: 'c1', maestro_principal_id: null, maestro_id: 'maestro-legacy', maestro_suplente_id: 'maestro-suplente' }
    const r = resolverPertenenciaClase(clase, 'maestro-suplente')

    expect(r.maestroIdSesion).toBe('maestro-legacy')
    expect(r.esSuplente).toBe(true)
  })

  it('clase sin ningún maestro_id conocido: usa el id del maestro logueado como último recurso', () => {
    const clase = { id: 'c1', maestro_principal_id: null, maestro_id: null, maestro_suplente_id: null }
    const r = resolverPertenenciaClase(clase, 'maestro-actual')

    expect(r.maestroIdSesion).toBe('maestro-actual')
    expect(r.esSuplente).toBe(false)
    expect(r.esTitular).toBe(false)
  })

  it('clase o maestroId ausentes no rompe — devuelve valores neutros', () => {
    expect(resolverPertenenciaClase(null, 'maestro-1').maestroIdSesion).toBe('maestro-1')
    expect(resolverPertenenciaClase(CLASE_CON_SUPLENTE, null).esSuplente).toBe(false)
    expect(resolverPertenenciaClase(null, null).maestroIdSesion).toBeNull()
  })
})
