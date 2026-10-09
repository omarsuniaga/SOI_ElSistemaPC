/**
 * Ciclo escribir → salir → reabrir del contenido del registro de clase.
 *
 * Cada prueba termina "reabriendo" la clase con la misma lógica que usa la
 * vista (servidor + cola local) y comprueba el TEXTO recuperado, no que se haya
 * invocado una función de guardado.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createContentAutosaver,
  contentStatusLabel,
  selectAutosavePayload,
} from '../contentAutosaver.js'
import { pickContentToShow, findPendingSessionContent } from '../../../services/pendingSessionContent.js'

/** Mundo fake: "servidor" y "cola local" en memoria. */
function createWorld({ online = true, serverContent = '', registered = false } = {}) {
  const world = {
    online,
    server: { id: serverContent || registered ? 's1' : null, contenido: serverContent, borrador: !registered, updated_at: '2026-10-08T10:00:00Z' },
    queue: [],
    saves: [],
  }
  world.saveFn = vi.fn(async ({ content }) => {
    if (world.online) {
      world.server = { ...world.server, id: 's1', contenido: content, updated_at: new Date().toISOString() }
      world.saves.push(content)
      return 'saved'
    }
    world.queue.push({
      id: world.queue.length + 1,
      tabla: 'sesiones_clase',
      operacion: 'update',
      payload: { id: 's1', contenido: content },
      created_at: new Date().toISOString(),
    })
    return 'queued'
  })
  world.reopen = () => {
    const pending = findPendingSessionContent(world.queue, { sesionId: 's1', claseId: 'c1', fecha: '2026-10-08' })
    return pickContentToShow({
      serverContent: world.server.contenido,
      serverUpdatedAt: world.server.updated_at,
      pending,
    }).content
  }
  return world
}

describe('contentAutosaver — ciclo escribir → salir → reabrir', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('borrador escrito y abandonado antes de los 2 s reaparece al reabrir', async () => {
    const world = createWorld()
    const saver = createContentAutosaver({ initialContent: '', hasSesion: () => true, save: world.saveFn })

    saver.change('Trabajamos arcadas')
    await vi.advanceTimersByTimeAsync(500) // el debounce de 2 s aún no venció
    expect(world.server.contenido).toBe('') // nada guardado todavía

    await saver.flush() // el maestro sale de la vista
    expect(world.reopen()).toBe('Trabajamos arcadas')
  })

  it('con el debounce vencido guarda una sola vez', async () => {
    const world = createWorld()
    const saver = createContentAutosaver({ initialContent: '', hasSesion: () => true, save: world.saveFn })

    saver.change('Hola')
    await vi.advanceTimersByTimeAsync(2000)
    expect(world.saves).toEqual(['Hola'])
    await saver.flush() // ya persistido: no reescribe
    expect(world.saveFn).toHaveBeenCalledTimes(1)
    expect(world.reopen()).toBe('Hola')
  })

  it('no marca «guardado» hasta que la escritura se confirma', async () => {
    let resolveSave
    const save = vi.fn(() => new Promise((res) => { resolveSave = res }))
    const saver = createContentAutosaver({ initialContent: '', hasSesion: () => true, save })

    saver.change('Texto')
    const flushing = saver.flush()
    expect(saver.getStatus()).not.toBe('saved')

    resolveSave('saved')
    await flushing
    expect(saver.getStatus()).toBe('saved')
  })

  it('si el guardado falla queda «failed» y el siguiente flush reintenta', async () => {
    const save = vi.fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce('saved')
    const saver = createContentAutosaver({ initialContent: '', hasSesion: () => true, save })

    saver.change('Texto')
    await saver.flush()
    expect(saver.getStatus()).toBe('failed')
    expect(saver.needsSave()).toBe(true)

    await saver.flush()
    expect(saver.getStatus()).toBe('saved')
    expect(save).toHaveBeenCalledTimes(2)
  })

  it('edita una sesión ya registrada sin degradarla a borrador', async () => {
    const world = createWorld({ serverContent: 'Original', registered: true })
    const saver = createContentAutosaver({ initialContent: 'Original', hasSesion: () => true, save: world.saveFn })

    saver.change('Original corregido')
    await saver.flush()

    expect(world.server.contenido).toBe('Original corregido')
    expect(world.server.borrador).toBe(false)
    expect(world.reopen()).toBe('Original corregido')
  })

  it('sin red: queda «pending», se recupera de la cola al reabrir y pasa a «saved» al sincronizar', async () => {
    const world = createWorld({ online: false, serverContent: 'Viejo' })
    const saver = createContentAutosaver({ initialContent: 'Viejo', hasSesion: () => true, save: world.saveFn })

    saver.change('Escrito sin red')
    await saver.flush()
    expect(saver.getStatus()).toBe('pending')
    expect(world.server.contenido).toBe('Viejo') // el servidor no lo tiene

    expect(world.reopen()).toBe('Escrito sin red') // reabrir offline recupera la cola

    // Reconexión: la cola se drena hacia el servidor
    world.online = true
    world.server = { ...world.server, contenido: 'Escrito sin red', updated_at: new Date().toISOString() }
    world.queue.length = 0
    saver.markSynced()
    expect(saver.getStatus()).toBe('saved')
    expect(world.reopen()).toBe('Escrito sin red')
  })

  it('no vuelve a encolar el mismo texto ya pendiente en la cola', async () => {
    const world = createWorld({ online: false, serverContent: 'Viejo' })
    const saver = createContentAutosaver({ initialContent: 'Viejo', hasSesion: () => true, save: world.saveFn })

    saver.change('Pendiente')
    await saver.flush()
    await saver.flush()
    expect(world.queue).toHaveLength(1)
  })

  it('al reabrir con texto pendiente en la cola arranca «pending» y no lo vuelve a encolar', async () => {
    const world = createWorld({ online: false, serverContent: 'Viejo' })
    const saver = createContentAutosaver({
      initialContent: 'Viejo',
      pendingContent: 'Escrito sin red',
      hasSesion: () => true,
      save: world.saveFn,
    })
    expect(saver.getStatus()).toBe('pending')
    await saver.flush()
    expect(world.saveFn).not.toHaveBeenCalled()

    saver.markSynced()
    expect(saver.getStatus()).toBe('saved')
  })

  it('un editor vacío sin sesión no crea una fila', async () => {
    const save = vi.fn()
    const saver = createContentAutosaver({ initialContent: '', hasSesion: () => false, save })
    saver.change('   ')
    await saver.flush()
    expect(save).not.toHaveBeenCalled()
  })

  it('registra el resultado de otro guardado (p. ej. autosave de asistencia)', async () => {
    const save = vi.fn()
    const saver = createContentAutosaver({ initialContent: '', hasSesion: () => true, save })
    saver.change('Texto')
    saver.record('Texto', 'saved')
    expect(saver.getStatus()).toBe('saved')
    await saver.flush()
    expect(save).not.toHaveBeenCalled()
  })
})

describe('contentStatusLabel', () => {
  it('muestra al maestro si está guardado, pendiente o falló', () => {
    expect(contentStatusLabel('saved')).toBe('Guardado')
    expect(contentStatusLabel('pending')).toBe('Pendiente de sincronizar')
    expect(contentStatusLabel('failed')).toBe('No se pudo guardar')
    expect(contentStatusLabel('dirty')).toBe('Guardando…')
    expect(contentStatusLabel('saving')).toBe('Guardando…')
  })
})


describe('selectAutosavePayload', () => {
  const full = {
    maestro_id: 'm1',
    fecha: '2026-10-08',
    estado: 'pendiente',
    borrador: true,
    asistencia: [{ alumno_id: 'a' }],
    contenido: 'x',
  }

  it('en modo solo-contenido nunca envía borrador/estado/asistencia', () => {
    const payload = selectAutosavePayload({ contentOnly: true, payload: full })
    expect(payload).toEqual({ maestro_id: 'm1', fecha: '2026-10-08', contenido: 'x' })
  })

  it('en modo normal conserva el payload completo', () => {
    expect(selectAutosavePayload({ contentOnly: false, payload: full })).toEqual(full)
  })
})
