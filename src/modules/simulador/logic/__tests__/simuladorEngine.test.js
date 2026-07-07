import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { crearSimuladorEngine } from '../simuladorEngine.js'

describe('simuladorEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('arranca en estado pausado y no dispara onTick sin llamar start()', () => {
    const onTick = vi.fn()
    const engine = crearSimuladorEngine({ velocidad: 5, onTick })

    expect(engine.getEstado()).toBe('pausado')
    vi.advanceTimersByTime(20000)
    expect(onTick).not.toHaveBeenCalled()
  })

  it('start() pasa a estado corriendo y dispara onTick cada `velocidad` segundos', () => {
    const onTick = vi.fn()
    const engine = crearSimuladorEngine({ velocidad: 5, onTick })

    engine.start()
    expect(engine.getEstado()).toBe('corriendo')

    vi.advanceTimersByTime(5000)
    expect(onTick).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(5000)
    expect(onTick).toHaveBeenCalledTimes(2)
  })

  it('pause() detiene el disparo de ticks sin perder el estado', () => {
    const onTick = vi.fn()
    const engine = crearSimuladorEngine({ velocidad: 5, onTick })

    engine.start()
    vi.advanceTimersByTime(5000)
    expect(onTick).toHaveBeenCalledTimes(1)

    engine.pause()
    expect(engine.getEstado()).toBe('pausado')
    vi.advanceTimersByTime(20000)
    expect(onTick).toHaveBeenCalledTimes(1)
  })

  it('resume() reanuda el disparo de ticks tras una pausa sin duplicar ni perder ticks', () => {
    const onTick = vi.fn()
    const engine = crearSimuladorEngine({ velocidad: 5, onTick })

    engine.start()
    vi.advanceTimersByTime(5000)
    engine.pause()
    vi.advanceTimersByTime(15000) // tiempo "muerto" mientras está pausado, no debe contar

    engine.resume()
    expect(engine.getEstado()).toBe('corriendo')
    vi.advanceTimersByTime(5000)
    expect(onTick).toHaveBeenCalledTimes(2)
  })

  it('cambiarVelocidad() reprograma el intervalo sin perder el estado corriendo', () => {
    const onTick = vi.fn()
    const engine = crearSimuladorEngine({ velocidad: 10, onTick })

    engine.start()
    engine.cambiarVelocidad(2)
    expect(engine.getEstado()).toBe('corriendo')

    vi.advanceTimersByTime(2000)
    expect(onTick).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(2000)
    expect(onTick).toHaveBeenCalledTimes(2)
  })

  it('cambiarVelocidad() mientras está pausado no dispara ticks hasta resume()', () => {
    const onTick = vi.fn()
    const engine = crearSimuladorEngine({ velocidad: 10, onTick })

    engine.start()
    engine.pause()
    engine.cambiarVelocidad(1)
    vi.advanceTimersByTime(5000)
    expect(onTick).not.toHaveBeenCalled()

    engine.resume()
    vi.advanceTimersByTime(1000)
    expect(onTick).toHaveBeenCalledTimes(1)
  })

  it('stop() detiene el reloj y lo deja en estado pausado, ignorando ticks futuros', () => {
    const onTick = vi.fn()
    const engine = crearSimuladorEngine({ velocidad: 5, onTick })

    engine.start()
    engine.stop()
    expect(engine.getEstado()).toBe('pausado')
    vi.advanceTimersByTime(20000)
    expect(onTick).not.toHaveBeenCalled()
  })

  it('start() es idempotente: llamarlo dos veces no duplica el intervalo', () => {
    const onTick = vi.fn()
    const engine = crearSimuladorEngine({ velocidad: 5, onTick })

    engine.start()
    engine.start()
    vi.advanceTimersByTime(5000)
    expect(onTick).toHaveBeenCalledTimes(1)
  })

  it('lanza si se construye con velocidad <= 0', () => {
    expect(() => crearSimuladorEngine({ velocidad: 0, onTick: vi.fn() })).toThrow()
    expect(() => crearSimuladorEngine({ velocidad: -3, onTick: vi.fn() })).toThrow()
  })

  it('lanza si onTick no es una función', () => {
    expect(() => crearSimuladorEngine({ velocidad: 5, onTick: null })).toThrow()
  })
})
