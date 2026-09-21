/**
 * Qué filas puede editar el maestro.
 *
 * El defecto que estas pruebas cierran: el runtime construía el adaptador real
 * sin `editableFilaIds`, así que `assertFilaEditable` rechazaba toda edición
 * antes de tocar la red — con la asignación cargada en la base y la RLS del
 * servidor correcta. El alcance editable tiene que salir de las asignaciones
 * reales de `montaje_fila_maestros`, no de un arreglo que nadie llena.
 */
import { describe, expect, it } from 'vitest'
import { collectEditableFilaIds } from '../domain/filaAuthorization.js'

const ASIGNACIONES = [
  { fila_id: 'fila-violines-2', maestro_id: 'm-1', can_edit_preparation: true, active: true },
  { fila_id: 'fila-trompetas', maestro_id: 'm-1', can_edit_preparation: false, active: true },
  { fila_id: 'fila-violas', maestro_id: 'm-1', can_edit_preparation: true, active: false },
  { fila_id: 'fila-cellos', maestro_id: 'm-2', can_edit_preparation: true, active: true },
]

describe('collectEditableFilaIds', () => {
  it('toma las filas donde el maestro puede editar preparación', () => {
    expect(collectEditableFilaIds(ASIGNACIONES, 'm-1')).toEqual(['fila-violines-2'])
  })

  it('excluye asignaciones de solo lectura', () => {
    expect(collectEditableFilaIds(ASIGNACIONES, 'm-1')).not.toContain('fila-trompetas')
  })

  it('excluye asignaciones dadas de baja', () => {
    expect(collectEditableFilaIds(ASIGNACIONES, 'm-1')).not.toContain('fila-violas')
  })

  it('no cruza el límite de fila de otro maestro', () => {
    expect(collectEditableFilaIds(ASIGNACIONES, 'm-1')).not.toContain('fila-cellos')
    expect(collectEditableFilaIds(ASIGNACIONES, 'm-2')).toEqual(['fila-cellos'])
  })

  it('devuelve vacío sin actor o sin asignaciones', () => {
    expect(collectEditableFilaIds(ASIGNACIONES, null)).toEqual([])
    expect(collectEditableFilaIds(null, 'm-1')).toEqual([])
  })

  it('no repite una fila asignada dos veces', () => {
    const duplicadas = [ASIGNACIONES[0], { ...ASIGNACIONES[0], id: 'otra' }]
    expect(collectEditableFilaIds(duplicadas, 'm-1')).toEqual(['fila-violines-2'])
  })
})
