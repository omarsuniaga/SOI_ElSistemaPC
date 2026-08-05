import { beforeEach, describe, expect, it, vi } from 'vitest'
import { disableMobileZoom } from '../mobileZoomBlocker.js'

describe('disableMobileZoom', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', { maxTouchPoints: 2 })
  })

  it('blocks pinch and gesture zoom events on touch devices', () => {
    const cleanup = disableMobileZoom()
    const preventDefault = vi.fn()
    const touchMove = new Event('touchmove', { cancelable: true })
    Object.defineProperty(touchMove, 'touches', { value: [{}, {}] })
    touchMove.preventDefault = preventDefault

    document.dispatchEvent(new Event('gesturestart', { cancelable: true }))
    document.dispatchEvent(touchMove)

    expect(preventDefault).toHaveBeenCalledOnce()
    cleanup()
  })

  it('does not block single-finger touch movement', () => {
    const cleanup = disableMobileZoom()
    const preventDefault = vi.fn()
    const touchMove = new Event('touchmove', { cancelable: true })
    Object.defineProperty(touchMove, 'touches', { value: [{}] })
    touchMove.preventDefault = preventDefault

    document.dispatchEvent(touchMove)

    expect(preventDefault).not.toHaveBeenCalled()
    cleanup()
  })
})
