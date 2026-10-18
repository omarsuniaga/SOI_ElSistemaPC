import { describe, expect, it } from 'vitest'
import { buildPublicUrl, generateQrSvg, generateQrPngDataUrl, dataUrlToBlob, isValidSlug, qrFileName } from '../lib/qr.js'

describe('qr', () => {
  it('construye la URL permanente /d/<slug>', () => {
    expect(buildPublicUrl('abc123def0', 'https://soi.example/')).toBe('https://soi.example/d/abc123def0')
  })
  it('rechaza slugs inválidos (evita QR hacia rutas arbitrarias)', () => {
    for (const bad of ['', 'ABC', '../x', 'abc123def0/extra', 'ab', 'a_b', '-ab', 'ab-', 'a--b', null]) expect(isValidSlug(bad)).toBe(false)
    expect(() => buildPublicUrl('../etc', 'https://x')).toThrow()
  })
  it('genera SVG local con la URL codificada (sin red)', async () => {
    const svg = await generateQrSvg('https://soi.example/d/abc123def0')
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg).toContain('</svg>')
    expect(svg).not.toMatch(/https?:\/\/(?!www\.w3\.org)/)
  })
  it('genera PNG válido', async () => {
    const dataUrl = await generateQrPngDataUrl('https://soi.example/d/abc123def0', 256)
    expect(dataUrl.startsWith('data:image/png;base64,')).toBe(true)
    const bytes = new Uint8Array(await dataUrlToBlob(dataUrl).arrayBuffer())
    expect([...bytes.slice(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  })
  it('es determinista: el mismo slug produce el mismo QR', async () => {
    const a = await generateQrSvg('https://soi.example/d/abc123def0')
    const b = await generateQrSvg('https://soi.example/d/abc123def0')
    expect(a).toBe(b)
  })
  it('nombra los archivos de descarga', () => {
    expect(qrFileName('abc123def0', 'png')).toBe('qr-soi-abc123def0.png')
  })
})
