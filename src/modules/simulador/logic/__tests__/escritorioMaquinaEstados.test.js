import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { crearEscritorioMaquinaEstados } from '../escritorioMaquinaEstados.js'

describe('escritorioMaquinaEstados', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('arranca en estado idle sin diálogo', () => {
    const maquina = crearEscritorioMaquinaEstados()
    expect(maquina.getEstado()).toBe('idle')
    expect(maquina.getDialogo()).toBeNull()
  })

  it('encolarEvento() pasa a working inmediatamente y luego a talking con el texto del evento', () => {
    const maquina = crearEscritorioMaquinaEstados()
    maquina.encolarEvento({ texto: 'Enviando WhatsApp a maestros: reunión el 15/03' })

    expect(maquina.getEstado()).toBe('working')

    vi.advanceTimersByTime(maquina.DURACION_WORKING_MS)
    expect(maquina.getEstado()).toBe('talking')
    expect(maquina.getDialogo()).toBe('Enviando WhatsApp a maestros: reunión el 15/03')
  })

  it('vuelve a idle tras la duración mínima visible de talking', () => {
    const maquina = crearEscritorioMaquinaEstados()
    maquina.encolarEvento({ texto: 'Acción X' })

    vi.advanceTimersByTime(maquina.DURACION_WORKING_MS)
    expect(maquina.getEstado()).toBe('talking')

    vi.advanceTimersByTime(maquina.DURACION_TALKING_MS)
    expect(maquina.getEstado()).toBe('idle')
    expect(maquina.getDialogo()).toBeNull()
  })

  it('procesa eventos concurrentes en orden FIFO, uno a la vez, con duración mínima visible cada uno', () => {
    const maquina = crearEscritorioMaquinaEstados()
    maquina.encolarEvento({ texto: 'Primero' })
    maquina.encolarEvento({ texto: 'Segundo' })
    maquina.encolarEvento({ texto: 'Tercero' })

    // Working del primero
    expect(maquina.getEstado()).toBe('working')
    expect(maquina.getColaLength()).toBe(2) // segundo y tercero esperan

    vi.advanceTimersByTime(maquina.DURACION_WORKING_MS)
    expect(maquina.getEstado()).toBe('talking')
    expect(maquina.getDialogo()).toBe('Primero')

    vi.advanceTimersByTime(maquina.DURACION_TALKING_MS)
    // Pasa automáticamente al siguiente en cola (no vuelve a idle real si hay pendientes)
    expect(maquina.getEstado()).toBe('working')
    expect(maquina.getColaLength()).toBe(1)

    vi.advanceTimersByTime(maquina.DURACION_WORKING_MS)
    expect(maquina.getDialogo()).toBe('Segundo')

    vi.advanceTimersByTime(maquina.DURACION_TALKING_MS)
    expect(maquina.getEstado()).toBe('working')
    expect(maquina.getColaLength()).toBe(0)

    vi.advanceTimersByTime(maquina.DURACION_WORKING_MS)
    expect(maquina.getDialogo()).toBe('Tercero')

    vi.advanceTimersByTime(maquina.DURACION_TALKING_MS)
    expect(maquina.getEstado()).toBe('idle')
    expect(maquina.getColaLength()).toBe(0)
  })

  it('encolar un evento mientras ya está trabajando no interrumpe el actual (se añade a la cola)', () => {
    const maquina = crearEscritorioMaquinaEstados()
    maquina.encolarEvento({ texto: 'A' })
    expect(maquina.getEstado()).toBe('working')

    maquina.encolarEvento({ texto: 'B' })
    expect(maquina.getColaLength()).toBe(1)
    expect(maquina.getEstado()).toBe('working') // sigue con el actual
  })

  it('reset() vuelve a idle, limpia diálogo y vacía la cola, cancelando timers pendientes', () => {
    const maquina = crearEscritorioMaquinaEstados()
    maquina.encolarEvento({ texto: 'A' })
    maquina.encolarEvento({ texto: 'B' })

    maquina.reset()
    expect(maquina.getEstado()).toBe('idle')
    expect(maquina.getDialogo()).toBeNull()
    expect(maquina.getColaLength()).toBe(0)

    // Avanzar el tiempo no debe reactivar timers previos
    vi.advanceTimersByTime(10000)
    expect(maquina.getEstado()).toBe('idle')
  })

  it('lanza si encolarEvento recibe un evento sin texto', () => {
    const maquina = crearEscritorioMaquinaEstados()
    expect(() => maquina.encolarEvento({})).toThrow()
    expect(() => maquina.encolarEvento(null)).toThrow()
  })

  describe('estado walking', () => {
    it('encolarEvento con requiereCaminata=true pasa por walking antes de working', () => {
      const maquina = crearEscritorioMaquinaEstados()
      maquina.encolarEvento({ texto: 'Caminando a ADM', requiereCaminata: true })

      expect(maquina.getEstado()).toBe('walking')

      vi.advanceTimersByTime(maquina.DURACION_WALKING_MS)
      expect(maquina.getEstado()).toBe('working')
    })

    it('walking dura DURACION_WALKING_MS = 1200ms', () => {
      const maquina = crearEscritorioMaquinaEstados()
      maquina.encolarEvento({ texto: 'Caminando', requiereCaminata: true })

      vi.advanceTimersByTime(1199)
      expect(maquina.getEstado()).toBe('walking')

      vi.advanceTimersByTime(1)
      expect(maquina.getEstado()).toBe('working')
    })

    it('sin requiereCaminata no pasa por walking (comportamiento legacy)', () => {
      const maquina = crearEscritorioMaquinaEstados()
      maquina.encolarEvento({ texto: 'Normal', requiereCaminata: false })

      expect(maquina.getEstado()).toBe('working')
    })

    it('walking no muestra diálogo', () => {
      const maquina = crearEscritorioMaquinaEstados()
      maquina.encolarEvento({ texto: 'Caminando', requiereCaminata: true })

      expect(maquina.getEstado()).toBe('walking')
      expect(maquina.getDialogo()).toBeNull()
    })

    it('si requiereCaminata no está definido, default es sin caminata', () => {
      const maquina = crearEscritorioMaquinaEstados()
      maquina.encolarEvento({ texto: 'Sin flag' })

      expect(maquina.getEstado()).toBe('working')
    })
  })
})
