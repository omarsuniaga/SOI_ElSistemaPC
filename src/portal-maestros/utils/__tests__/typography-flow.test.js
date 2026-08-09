// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  FONT_SCALES, FONT_FAMILIES,
  getSavedFontScale, getSavedFontFamily,
  applyFontScale, applyFontFamily, scaleLabel
} from '../typography.js'

function mountPanel(container) {
  container.innerHTML = `
    <div class="pm-text-size-panel">
      <span class="pm-text-size-chip" id="pm-font-scale-label">100%</span>
      <button type="button" id="pm-font-scale-down"><span>A-</span></button>
      <button type="button" id="pm-font-scale-up"><span>A+</span></button>
      <select id="pm-font-family-select">
        <option value="system">Sistema</option>
        <option value="inter">Inter</option>
        <option value="poppins">Poppins</option>
        <option value="nunito">Nunito</option>
        <option value="lato">Lato</option>
        <option value="merriweather">Merriweather</option>
        <option value="georgia">Georgia (serif)</option>
      </select>
    </div>
  `
  // Boot idéntico a themeToggle.init(): aplica preferencias guardadas al html
  applyFontScale(getSavedFontScale())
  applyFontFamily(getSavedFontFamily())

  // Binding idéntico al de perfilView.js
  const labelEl = container.querySelector('#pm-font-scale-label')
  const downBtn = container.querySelector('#pm-font-scale-down')
  const upBtn = container.querySelector('#pm-font-scale-up')
  const selectEl = container.querySelector('#pm-font-family-select')

  const refresh = () => {
    const scale = getSavedFontScale()
    const idx = FONT_SCALES.indexOf(scale)
    const family = getSavedFontFamily()
    if (labelEl) labelEl.textContent = scaleLabel(scale)
    if (downBtn) downBtn.disabled = idx === 0
    if (upBtn) upBtn.disabled = idx === FONT_SCALES.length - 1
    if (selectEl && selectEl.value !== family) selectEl.value = family
  }

  const step = (dir) => {
    const idx = FONT_SCALES.indexOf(getSavedFontScale())
    const next = idx + dir
    if (next < 0 || next >= FONT_SCALES.length) return
    applyFontScale(FONT_SCALES[next])
    refresh()
  }

  const setFamily = (id) => {
    applyFontFamily(id)
    refresh()
  }

  if (downBtn) downBtn.addEventListener('click', () => step(-1))
  if (upBtn) upBtn.addEventListener('click', () => step(1))
  if (selectEl) selectEl.addEventListener('change', (e) => setFamily(e.target.value))

  refresh()
  return { step, setFamily }
}

describe('Flujo UI "Tamaño de texto" (integración jsdom)', () => {
  beforeEach(() => {
    localStorage.clear()
    const html = document.documentElement
    for (const key of ['--pm-font-scale', '--pm-font-family']) html.style.removeProperty(key)
    document.querySelectorAll('link[id^="google-font-"]').forEach((l) => l.remove())
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('empieza en 100% y aplica escala al documentElement', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    mountPanel(host)
    expect(host.querySelector('#pm-font-scale-label').textContent).toBe('100%')
    expect(document.documentElement.style.getPropertyValue('--pm-font-scale')).toBe('1')
  })

  it('A+ recorre los 4 niveles de zoom in y se deshabilita al llegar a 180%', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    mountPanel(host)
    const up = host.querySelector('#pm-font-scale-up')
    const label = host.querySelector('#pm-font-scale-label')
    ;['116%', '125%', '150%', '180%'].forEach((pct) => {
      up.click()
      expect(label.textContent).toBe(pct)
    })
    expect(up.disabled).toBe(true)
    expect(document.documentElement.style.getPropertyValue('--pm-font-scale')).toBe('1.8')
  })

  it('A- recorre los 4 niveles de zoom out y se deshabilita en 50%', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    mountPanel(host)
    const down = host.querySelector('#pm-font-scale-down')
    const label = host.querySelector('#pm-font-scale-label')
    ;['90%', '85%', '60%', '50%'].forEach((pct) => {
      down.click()
      expect(label.textContent).toBe(pct)
    })
    expect(down.disabled).toBe(true)
    expect(document.documentElement.style.getPropertyValue('--pm-font-scale')).toBe('0.5')
  })

  it('persiste la escala elegida en localStorage', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    mountPanel(host)
    const up = host.querySelector('#pm-font-scale-up')
    up.click()
    up.click()
    expect(localStorage.getItem('portal-maestros-font-scale')).toBe('1.25')
  })

  it('cambiar la fuente en el select aplica --pm-font-family y la persiste', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    mountPanel(host)
    const sel = host.querySelector('#pm-font-family-select')
    sel.value = 'poppins'
    sel.dispatchEvent(new Event('change', { bubbles: true }))
    expect(localStorage.getItem('portal-maestros-font-family')).toBe('poppins')
    const family = FONT_FAMILIES.find((f) => f.id === 'poppins')
    expect(document.documentElement.style.getPropertyValue('--pm-font-family')).toBe(family.stack)
    expect(document.querySelector('link[id="google-font-poppins"]')).toBeTruthy()
  })

  it('restaura el estado guardado al reabrir', () => {
    localStorage.setItem('portal-maestros-font-scale', '1.5')
    localStorage.setItem('portal-maestros-font-family', 'lato')
    const host = document.createElement('div')
    document.body.appendChild(host)
    mountPanel(host)
    expect(host.querySelector('#pm-font-scale-label').textContent).toBe('150%')
    expect(host.querySelector('#pm-font-family-select').value).toBe('lato')
    expect(document.documentElement.style.getPropertyValue('--pm-font-scale')).toBe('1.5')
    expect(document.documentElement.style.getPropertyValue('--pm-font-family')).toBe(
      FONT_FAMILIES.find((f) => f.id === 'lato').stack
    )
  })
})