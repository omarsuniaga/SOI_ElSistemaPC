import { describe, expect, it } from 'vitest'
import { validateFile, detectSignature, normalizedExtension, sha256Hex, buildStoragePath, MAX_FILE_BYTES } from '../lib/fileValidation.js'

const PDF = [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]
const JPG = [0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46]
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]
const WEBP = [0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50]
const EXE = [0x4d, 0x5a, 0x90, 0, 3, 0, 0, 0]
const file = (bytes, name, type = '') => new File([new Uint8Array(bytes)], name, { type })

describe('detectSignature', () => {
  it('reconoce PDF, JPEG, PNG y WebP por contenido', () => {
    expect(detectSignature(new Uint8Array(PDF))).toBe('pdf')
    expect(detectSignature(new Uint8Array(JPG))).toBe('jpg')
    expect(detectSignature(new Uint8Array(PNG))).toBe('png')
    expect(detectSignature(new Uint8Array(WEBP))).toBe('webp')
  })
  it('rechaza HTML, SVG, ejecutables y RIFF que no es WebP', () => {
    for (const text of ['<!doctype html>', '<svg xmlns=', '<?xml version']) {
      expect(detectSignature(new TextEncoder().encode(text))).toBeNull()
    }
    expect(detectSignature(new Uint8Array(EXE))).toBeNull()
    expect(detectSignature(new Uint8Array([0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x41, 0x56, 0x45]))).toBeNull()
    expect(detectSignature(new Uint8Array([1, 2]))).toBeNull()
  })
})

describe('normalizedExtension', () => {
  it('normaliza mayúsculas y jpeg', () => {
    expect(normalizedExtension('A.PDF')).toBe('pdf')
    expect(normalizedExtension('foto.JPEG')).toBe('jpg')
    expect(normalizedExtension('sin_extension')).toBe('')
  })
})

describe('validateFile', () => {
  it('acepta archivos válidos de cada tipo', async () => {
    expect((await validateFile(file(PDF, 'a.pdf', 'application/pdf'))).mime).toBe('application/pdf')
    expect((await validateFile(file(JPG, 'a.jpeg', 'image/jpeg'))).ext).toBe('jpg')
    expect((await validateFile(file(PNG, 'a.png', 'image/png'))).ok).toBe(true)
    expect((await validateFile(file(WEBP, 'a.webp', 'image/webp'))).ok).toBe(true)
    expect((await validateFile(file(PDF, 'a.pdf', ''))).ok).toBe(true)
  })
  it('rechaza un ejecutable renombrado a .pdf (extensión y MIME falsos)', async () => {
    expect((await validateFile(file(EXE, 'virus.pdf', 'application/pdf'))).ok).toBe(false)
  })
  it('rechaza extensión que no coincide con el contenido', async () => {
    const r = await validateFile(file(PNG, 'foto.jpg', 'image/jpeg'))
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/PNG/)
  })
  it('rechaza MIME declarado incompatible', async () => {
    expect((await validateFile(file(PDF, 'a.pdf', 'text/html'))).ok).toBe(false)
  })
  it('rechaza extensiones no permitidas, vacíos y exceso de tamaño', async () => {
    expect((await validateFile(file(PDF, 'a.svg', 'image/svg+xml'))).ok).toBe(false)
    expect((await validateFile(file(PDF, 'a.html'))).ok).toBe(false)
    expect((await validateFile(new File([], 'a.pdf'))).ok).toBe(false)
    expect((await validateFile(null)).ok).toBe(false)
    const big = { size: MAX_FILE_BYTES + 1, name: 'a.pdf', type: 'application/pdf', slice: () => new Blob([]) }
    expect((await validateFile(big)).error).toMatch(/10 MB/)
  })
})

describe('sha256Hex / buildStoragePath', () => {
  it('calcula SHA-256 conocido', async () => {
    expect(await sha256Hex(new Blob(['abc']))).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
  })
  it('genera rutas <publicacion>/<uuid>.<ext> que cumplen la política de Storage', () => {
    const re = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|jpg|png|webp)$/
    expect(buildStoragePath(crypto.randomUUID(), 'pdf')).toMatch(re)
  })
})
