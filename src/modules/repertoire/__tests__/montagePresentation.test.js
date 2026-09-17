/**
 * Presentación de un montaje en la tarjeta y en el encabezado del mapa.
 *
 * Los defectos que estas pruebas cierran, todos visibles al cargar el primer
 * montaje real (el modo demo los tapaba porque su fixture trae todo completo):
 *  - decía "Sin evento" y "Fecha pendiente" aunque el montaje tuviera
 *    `fecha_objetivo` y un vínculo en `montaje_eventos`;
 *  - con la obra sin compositor, el subtítulo abría con un " · " colgando;
 *  - el encabezado del mapa imprimía "undefined · undefined" sin evento.
 */
import { describe, expect, it } from 'vitest'
import { montageSubtitle, montageEventLabel, montageDeadline, pickPrincipalEvent } from '../domain/montagePresentation.js'

const HOY = new Date('2026-09-16T12:00:00Z')

describe('montageSubtitle', () => {
  it('une compositor y versión con separador', () => {
    expect(montageSubtitle({ obra: { compositor: 'Dvořák' }, version: { nombre: 'Edición de estudio' } }))
      .toBe('Dvořák · Edición de estudio')
  })

  it('no deja el separador colgando cuando falta el compositor', () => {
    expect(montageSubtitle({ obra: {}, version: { nombre: 'Edición de trabajo' } })).toBe('Edición de trabajo')
  })

  it('devuelve cadena vacía cuando no hay nada que mostrar', () => {
    expect(montageSubtitle({ obra: {}, version: {} })).toBe('')
    expect(montageSubtitle({})).toBe('')
  })
})

describe('montageEventLabel', () => {
  it('usa el nombre del evento vinculado', () => {
    expect(montageEventLabel({ evento: { nombre: 'Concierto 5to Aniversario' } })).toBe('Concierto 5to Aniversario')
  })

  it('dice "Sin evento" solo cuando de verdad no hay', () => {
    expect(montageEventLabel({})).toBe('Sin evento')
    expect(montageEventLabel({ evento: {} })).toBe('Sin evento')
  })
})

describe('montageDeadline', () => {
  it('cuenta desde la fecha del evento', () => {
    const r = montageDeadline({ evento: { fecha: '2026-11-22' } }, HOY)
    expect(r).toEqual({ days: 67, label: 'Faltan 67 días' })
  })

  it('cae en fecha_objetivo del montaje cuando no hay evento', () => {
    // Este es el caso que mostraba "Fecha pendiente" teniendo la fecha cargada.
    const r = montageDeadline({ fecha_objetivo: '2026-11-22' }, HOY)
    expect(r).toEqual({ days: 67, label: 'Faltan 67 días' })
  })

  it('prefiere la fecha del evento sobre la del montaje', () => {
    expect(montageDeadline({ evento: { fecha: '2026-10-15' }, fecha_objetivo: '2026-11-22' }, HOY).days).toBe(29)
  })

  it('avisa cuando la fecha ya pasó', () => {
    expect(montageDeadline({ fecha_objetivo: '2026-09-06' }, HOY)).toEqual({ days: -10, label: 'Venció hace 10 días' })
  })

  it('dice "Hoy" el mismo día', () => {
    expect(montageDeadline({ fecha_objetivo: '2026-09-16' }, HOY)).toEqual({ days: 0, label: 'Hoy' })
  })

  it('solo dice "Fecha pendiente" cuando no hay ninguna fecha', () => {
    expect(montageDeadline({}, HOY)).toEqual({ days: null, label: 'Fecha pendiente' })
  })
})

describe('pickPrincipalEvent', () => {
  const principal = { es_principal: true, calendario_institucional: { titulo: 'Concierto 5to Aniversario', fecha_inicio: '2026-11-22T00:00:00+00' } }
  const secundario = { es_principal: false, calendario_institucional: { titulo: 'Ensayo general', fecha_inicio: '2026-11-20T09:00:00+00' } }

  it('toma el vínculo principal aunque venga después', () => {
    expect(pickPrincipalEvent([secundario, principal])).toEqual({ nombre: 'Concierto 5to Aniversario', fecha: '2026-11-22' })
  })

  it('recorta la marca de tiempo a fecha', () => {
    expect(pickPrincipalEvent([principal]).fecha).toBe('2026-11-22')
  })

  it('cae al primer vínculo si ninguno es principal', () => {
    expect(pickPrincipalEvent([secundario]).nombre).toBe('Ensayo general')
  })

  it('devuelve null sin vínculos', () => {
    expect(pickPrincipalEvent([])).toBeNull()
    expect(pickPrincipalEvent(null)).toBeNull()
  })

  it('ignora vínculos sin evento cargado', () => {
    expect(pickPrincipalEvent([{ es_principal: true, calendario_institucional: null }])).toBeNull()
  })
})
