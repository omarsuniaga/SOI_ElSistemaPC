import { describe, it, expect } from 'vitest'
import { escapeHTML } from '../utils/alumnosUtils.js'

describe('escapeHTML', () => {
  it('escapes double quotes', () => {
    expect(escapeHTML('"hello"')).toBe('&quot;hello&quot;')
  })

  it('escapes single quotes', () => {
    expect(escapeHTML("it's")).toBe('it&#39;s')
  })

  it('escapes both quotes together', () => {
    expect(escapeHTML('"John\'s"')).toBe('&quot;John&#39;s&quot;')
  })

  it('leaves safe string unchanged', () => {
    expect(escapeHTML('Hello world')).toBe('Hello world')
  })

  it('still escapes < > and &', () => {
    expect(escapeHTML('<script>')).toBe('&lt;script&gt;')
    expect(escapeHTML('a & b')).toBe('a &amp; b')
  })

  it('handles null and undefined safely', () => {
    expect(escapeHTML(null)).toBe('')
    expect(escapeHTML(undefined)).toBe('')
  })

  it('handles empty string', () => {
    expect(escapeHTML('')).toBe('')
  })
})
