import { afterEach, describe, expect, it, vi } from 'vitest'
import { evaluatePublicBase, allowedOrigins, normalizeOrigin, qrExportStatus, DEFAULT_ALLOWED_ORIGINS } from '../lib/qrDomain.js'
import { buildDefinitiveQrUrl, publicBaseUrl } from '../lib/qr.js'
import { isValidSlug, suggestSlug } from '../lib/slug.js'

const OK = 'https://elsistemapc.netlify.app'
afterEach(() => vi.unstubAllEnvs())

describe('lista blanca de dominios para QR definitivos', () => {
  it('acepta solo el dominio público aprobado (por defecto)', () => {
    expect(DEFAULT_ALLOWED_ORIGINS).toEqual([OK])
    expect(evaluatePublicBase(OK)).toEqual({ ok: true, origin: OK })
    expect(evaluatePublicBase(`${OK}/`)).toEqual({ ok: true, origin: OK })
  })
  it('bloquea configuración ausente (sin respaldo en el dominio del panel)', () => {
    expect(evaluatePublicBase('')).toMatchObject({ ok: false, reason: 'missing' })
    expect(evaluatePublicBase(undefined)).toMatchObject({ ok: false, reason: 'missing' })
    expect(qrExportStatus()).toMatchObject({ ok: false, reason: 'missing' })
    expect(publicBaseUrl()).toBe('')
  })
  it.each([
    ['https://soi-el-sistema-pc.netlify.app', 'not_allowed'],
    ['https://evil.example', 'not_allowed'],
    ['https://elsistemapc.netlify.app.evil.example', 'not_allowed'],
    ['http://elsistemapc.netlify.app', 'not_https'],
    ['https://deploy-preview-12--elsistemapc.netlify.app', 'preview'],
    ['https://master--elsistemapc.netlify.app', 'preview'],
    ['https://6acc55a3aef43d0008890d9c--elsistemapc.netlify.app', 'preview'],
    ['https://elsistemapc.netlify.app/d/x', 'invalid'],
    ['https://elsistemapc.netlify.app?x=1', 'invalid'],
    ['https://user:pass@elsistemapc.netlify.app', 'invalid'],
    ['javascript:alert(1)', 'invalid'],
    ['not a url', 'invalid'],
    ['http://127.0.0.1:4180', 'not_allowed'],
  ])('bloquea %s (%s)', (base, reason) => {
    expect(evaluatePublicBase(base)).toMatchObject({ ok: false, reason })
  })
  it('la lista es configurable; un origen local solo vale si se incluye explícitamente', () => {
    const allowed = allowedOrigins('http://127.0.0.1:4180, https://otro.example')
    expect(allowed).toEqual(['http://127.0.0.1:4180', 'https://otro.example'])
    expect(evaluatePublicBase('http://127.0.0.1:4180', allowed).ok).toBe(true)
    expect(evaluatePublicBase(OK, allowed)).toMatchObject({ ok: false, reason: 'not_allowed' })
    expect(allowedOrigins('')).toEqual([OK])
    expect(allowedOrigins('basura, ftp://x')).toEqual([OK])
  })
  it('normalizeOrigin descarta ruta, query, hash y credenciales', () => {
    expect(normalizeOrigin('https://a.example/')).toBe('https://a.example')
    expect(normalizeOrigin('https://a.example/x')).toBeNull()
    expect(normalizeOrigin('https://a.example#h')).toBeNull()
  })
})

describe('generación de la URL definitiva del QR', () => {
  it('con la variable correcta produce <dominio>/d/<slug>', () => {
    vi.stubEnv('VITE_PUBLIC_BASE_URL', OK)
    expect(qrExportStatus().ok).toBe(true)
    expect(buildDefinitiveQrUrl('concierto-navidad-2026')).toBe(`${OK}/d/concierto-navidad-2026`)
  })
  it('con la variable ausente o equivocada lanza (exportación bloqueada)', () => {
    expect(() => buildDefinitiveQrUrl('concierto-navidad-2026')).toThrow(/bloqueado/)
    vi.stubEnv('VITE_PUBLIC_BASE_URL', 'https://soi-el-sistema-pc.netlify.app')
    expect(() => buildDefinitiveQrUrl('concierto-navidad-2026')).toThrow(/lista de dominios/)
    expect(() => buildDefinitiveQrUrl('concierto-navidad-2026', 'https://deploy-preview-1--x.netlify.app')).toThrow(/bloqueado/)
  })
  it('rechaza slugs que no sean un identificador permanente', () => {
    vi.stubEnv('VITE_PUBLIC_BASE_URL', OK)
    expect(() => buildDefinitiveQrUrl('../admin')).toThrow()
    expect(() => buildDefinitiveQrUrl('ABC')).toThrow()
  })
})

describe('slug', () => {
  it('valida el formato permanente', () => {
    for (const ok of ['concierto-navidad-2026', 'abc', 'a1b2c3d4e5', 'x'.repeat(60)]) expect(isValidSlug(ok)).toBe(true)
    for (const bad of ['', 'ab', 'x'.repeat(61), 'Con-Mayus', 'con espacio', 'a--b', '-a', 'a-', 'ñandú', undefined]) expect(isValidSlug(bad)).toBe(false)
  })
  it('sugiere un identificador legible desde el título', () => {
    expect(suggestSlug('Programa de mano — Concierto de Navidad 2026')).toBe('programa-de-mano-concierto-de-navidad-2026')
    expect(suggestSlug('  ¡Año Nuevo!  ')).toBe('ano-nuevo')
    expect(isValidSlug(suggestSlug('x'.repeat(100)))).toBe(true)
  })
})
