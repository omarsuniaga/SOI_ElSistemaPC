import { describe, it, expect } from 'vitest'

import { readFileSync } from 'node:fs'
const tokens = readFileSync('src/portal-maestros/styles/01-tokens.css', 'utf8')
const history = readFileSync('src/portal-maestros/components/studentClassHistory.css', 'utf8')

// Resolve the actual theme tokens and control declarations, including CSS fallbacks.
// jsdom does not resolve var() in computed background colors itself.
function colorsFor(theme, attribute, tag) {
  const doc = document
  const previous = doc.documentElement.getAttribute(attribute)
  doc.documentElement.setAttribute(attribute, theme)
  const style = doc.createElement('style'); style.textContent = tokens + history; doc.head.append(style)
  const root = doc.createElement('div'); root.className = 'pm-history'; doc.body.append(root)
  const control = doc.createElement(tag); root.append(control)
  const variables = {}
  const declarations = {}
  for (const rule of style.sheet.cssRules) {
    if (!rule.selectorText) continue
    if (doc.documentElement.matches(rule.selectorText)) {
      for (const name of Array.from({ length: rule.style.length }, (_, i) => rule.style[i])) if (name.startsWith('--')) variables[name] = rule.style.getPropertyValue(name)
    }
    if (control.matches(rule.selectorText)) {
      for (const property of ['color', 'background']) if (rule.style.getPropertyValue(property)) declarations[property] = rule.style.getPropertyValue(property)
    }
  }
  const resolve = value => value.replace(/var\((--[\w-]+)(?:,\s*([^()]+))?\)/g, (_, name, fallback) => resolve(variables[name] || fallback || ''))
  const result = { foreground: resolve(declarations.color), background: resolve(declarations.background) }
  style.remove(); root.remove()
  if (previous == null) doc.documentElement.removeAttribute(attribute)
  else doc.documentElement.setAttribute(attribute, previous)
  return result
}
function luminance(color) {
  const hex = color.trim() === 'white' ? '#ffffff' : color.trim()
  expect(hex).toMatch(/^#[a-f\d]{6}$/i)
  const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4)
  return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2]
}
describe('history form text contrast', () => {
  for (const attribute of ['data-bs-theme', 'data-portal-theme']) for (const theme of ['light', 'dark']) for (const tag of ['select', 'input']) {
    it(`${tag} remains readable in ${theme} through ${attribute}`, () => {
      const { foreground, background } = colorsFor(theme, attribute, tag)
      const values = [luminance(foreground), luminance(background)].sort((a,b) => b-a)
      expect((values[0] + .05) / (values[1] + .05)).toBeGreaterThanOrEqual(4.5)
    })
  }
})
