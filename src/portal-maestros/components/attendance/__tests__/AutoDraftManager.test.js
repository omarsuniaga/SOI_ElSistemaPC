/**
 * Contrato del auto-borrador del editor de contenido.
 *
 * El defecto que estas pruebas cierran: el manager capturaba `sesionId` por
 * valor al montarse. En el caso más común — el maestro abre una fecha nueva y
 * empieza a escribir antes de marcar asistencia — ese id era `null`, el manager
 * se apagaba entero y no volvía a encenderse cuando la sesión sí se creaba
 * segundos después. Ahora consulta el id vigente en cada guardado.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// `vi.mock` se iza al tope del archivo: los dobles tienen que nacer dentro de
// `vi.hoisted` para existir cuando la fábrica corre.
const { saveDraft, loadDraft, discardDraft } = vi.hoisted(() => ({
  saveDraft: vi.fn(() => Promise.resolve({})),
  loadDraft: vi.fn(() => Promise.resolve(null)),
  discardDraft: vi.fn(() => Promise.resolve()),
}))

vi.mock('../../../services/autoDraftService.js', async (importOriginal) => {
  const real = await importOriginal()
  return { ...real, saveDraft, loadDraft, discardDraft }
})

import { createAutoDraftManager } from '../AutoDraftManager.js'

function montar({ sesionIdInicial = null } = {}) {
  const container = document.createElement('div')
  container.innerHTML = `
    <div id="pm-dsl-editable" contenteditable="true"></div>
    <span id="pm-draft-indicator" style="display:none"></span>
  `
  document.body.appendChild(container)

  let sesionId = sesionIdInicial
  let texto = ''
  const editor = { getValue: () => texto }

  const mgr = createAutoDraftManager(container, {
    getSesionId: () => sesionId,
    maestroId: 'maestro-1',
    editor,
    sesionExistenteData: null,
    onDraftRecovered: () => {},
  })

  const escribir = (nuevo) => {
    texto = nuevo
    container.querySelector('#pm-dsl-editable').oninput?.({})
  }

  return { container, mgr, escribir, crearSesion: (id) => { sesionId = id }, sesionActual: () => sesionId }
}

describe('createAutoDraftManager', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    saveDraft.mockClear()
    loadDraft.mockClear()
    discardDraft.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('guarda con el id vigente cuando la sesión se crea después de empezar a escribir', async () => {
    const vista = montar({ sesionIdInicial: null })

    vista.escribir('Trabajamos arcadas con Yereni')
    vista.crearSesion('sesion-nueva')
    await vi.advanceTimersByTimeAsync(30000)

    expect(saveDraft).toHaveBeenCalledWith('sesion-nueva', 'maestro-1', 'Trabajamos arcadas con Yereni')
  })

  it('no intenta guardar mientras no exista la sesión', async () => {
    const vista = montar({ sesionIdInicial: null })

    vista.escribir('Texto sin sesión')
    await vi.advanceTimersByTimeAsync(30000)

    expect(saveDraft).not.toHaveBeenCalled()
  })

  it('no usa un id viejo si la sesión cambió de identidad', async () => {
    const vista = montar({ sesionIdInicial: 'sesion-vieja' })

    vista.crearSesion('sesion-actual')
    vista.escribir('Contenido corregido')
    await vi.advanceTimersByTimeAsync(30000)

    expect(saveDraft).toHaveBeenCalledWith('sesion-actual', 'maestro-1', 'Contenido corregido')
  })

  it('deja de guardar después de destruirse', async () => {
    const vista = montar({ sesionIdInicial: 'sesion-1' })

    vista.escribir('Algo')
    vista.mgr.destroy()
    await vi.advanceTimersByTimeAsync(30000)

    expect(saveDraft).not.toHaveBeenCalled()
  })
})
