/**
 * Política de guardado del contenido escrito en clase.
 *
 * El defecto que estas pruebas cierran: el texto del editor DSL solo vivía en
 * memoria (`dslContent`). Si el maestro escribía y salía de la vista sin marcar
 * asistencia, nada lo persistía y el contenido se perdía. Ahora cada cambio
 * agenda el mismo autosave que usa la asistencia, que crea o actualiza la
 * sesión con `borrador: true` — que es de donde la vista recarga el texto.
 *
 * Los dos frenos que hay que respetar:
 *  - no reescribir cuando el valor es el mismo que ya está persistido (el
 *    editor dispara `onChange` al montarse con el contenido del servidor);
 *  - no crear una sesión vacía por un editor vacío.
 */
import { describe, expect, it } from 'vitest'
import { shouldQueueDraftSave } from '../draftPolicy.js'

describe('shouldQueueDraftSave', () => {
  it('guarda el texto nuevo aunque todavía no exista la sesión', () => {
    expect(shouldQueueDraftSave({ value: 'Trabajamos arcadas', lastPersisted: '', hasSesion: false })).toBe(true)
  })

  it('no reescribe cuando el contenido no cambió respecto de lo persistido', () => {
    expect(shouldQueueDraftSave({ value: 'Igual', lastPersisted: 'Igual', hasSesion: true })).toBe(false)
    expect(shouldQueueDraftSave({ value: '', lastPersisted: '', hasSesion: true })).toBe(false)
  })

  it('no crea una sesión vacía cuando el editor está vacío y no hay sesión', () => {
    expect(shouldQueueDraftSave({ value: '', lastPersisted: 'algo', hasSesion: false })).toBe(false)
    expect(shouldQueueDraftSave({ value: '   ', lastPersisted: 'algo', hasSesion: false })).toBe(false)
  })

  it('sí permite vaciar el contenido cuando la sesión ya existe', () => {
    expect(shouldQueueDraftSave({ value: '', lastPersisted: 'algo', hasSesion: true })).toBe(true)
  })

  it('sí guarda el texto de una sesión ya registrada (la vista lo hace en modo solo-contenido)', () => {
    expect(shouldQueueDraftSave({
      value: 'Texto nuevo',
      lastPersisted: 'Texto viejo',
      hasSesion: true,
    })).toBe(true)
  })
})
