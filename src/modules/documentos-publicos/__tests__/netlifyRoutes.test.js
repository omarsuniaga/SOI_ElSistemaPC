// @vitest-environment node
import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '../../../..')
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8')

/** Reglas "from to status" de un archivo _redirects, en orden. */
function fileRedirects(p) {
  return read(p).split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
    .map((l) => { const [from, to, status] = l.split(/\s+/); return { from, to, status: Number(status ?? 301) } })
}
const tomlRedirects = (p) => read(p).split('[[redirects]]').slice(1).map((b) => ({
  from: /from\s*=\s*"([^"]+)"/.exec(b)?.[1], to: /to\s*=\s*"([^"]+)"/.exec(b)?.[1], status: Number(/status\s*=\s*(\d+)/.exec(b)?.[1] ?? 301),
}))
/** Semántica de Netlify: primera regla que coincide; `/*` final comodín. */
const resolve = (rules, url) => rules.find((r) => (r.from.endsWith('/*') ? url.startsWith(r.from.slice(0, -1)) || url === r.from.slice(0, -2) : r.from.replace(/\/$/, '') === url.replace(/\/$/, '')))

describe('sitio público: redirects (apps/public/static/_redirects)', () => {
  const rules = fileRedirects('apps/public/static/_redirects')
  it('/qr-code y /d/<slug> se sirven con su HTML y estado 200 (acceso directo y recarga)', () => {
    expect(resolve(rules, '/qr-code')).toMatchObject({ to: '/qr-code.html', status: 200 })
    expect(resolve(rules, '/qr-code/')).toMatchObject({ to: '/qr-code.html', status: 200 })
    for (const url of ['/d/concierto-navidad-2026', '/d/abc123def0', '/d/a-b']) expect(resolve(rules, url)).toMatchObject({ to: '/d.html', status: 200 })
  })
  it('no hay catch-all: una ruta inexistente cae en el 404 real de Netlify', () => {
    expect(rules.some((r) => r.from === '/*')).toBe(false)
    for (const url of ['/inexistente', '/admin', '/adm/clases-hoy', '/login']) expect(resolve(rules, url)).toBeUndefined()
    expect(fs.existsSync(path.join(root, 'apps/public/404.html'))).toBe(true)
  })
})

describe('sitio público: cabeceras y configuración', () => {
  const headers = read('apps/public/static/_headers')
  it('CSP estricta: sin unsafe-inline/unsafe-eval, connect-src solo self + Supabase, sin frames', () => {
    const csp = /Content-Security-Policy:\s*(.+)/.exec(headers)[1]
    expect(csp).not.toMatch(/unsafe-inline|unsafe-eval/)
    expect(csp).toContain("default-src 'none'")
    expect(csp).toContain("script-src 'self'")
    expect(/connect-src ([^;]+)/.exec(csp)[1].trim().split(/\s+/)).toEqual(["'self'", 'https://zmhmdvmyeyswunurcyow.supabase.co'])
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("base-uri 'none'")
  })
  it('endurece la respuesta y no cachea los visualizadores ni los HTML', () => {
    for (const h of ['X-Content-Type-Options: nosniff', 'X-Frame-Options: DENY', 'Referrer-Policy: no-referrer']) expect(headers).toContain(h)
    expect(headers).toMatch(/\/assets\/\*\s+Cache-Control: public, max-age=31536000, immutable/)
    expect(headers).toMatch(/\/d\/\*\s+X-Robots-Tag: noindex, nofollow\s+Cache-Control: no-store/)
  })
  it('netlify.toml del público: base propia, publica solo dist y no hereda reglas del admin', () => {
    const toml = read('apps/public/netlify.toml')
    expect(toml).toContain('publish = "dist"')
    expect(toml).toContain('build:public')
    expect(toml).not.toContain('[[redirects]]')
    expect(toml).not.toContain('Content-Security-Policy')
  })
})

describe('sitio admin: sin cambios de despliegue', () => {
  it('no sirve /d/* ni publica d.html (el visualizador vive solo en el sitio público)', () => {
    expect(tomlRedirects('netlify.toml').some((r) => r.from.startsWith('/d'))).toBe(false)
    expect(fileRedirects('public/_redirects').some((r) => r.from.startsWith('/d'))).toBe(false)
    expect(read('vite.config.js')).not.toMatch(/d\.html/)
    expect(fs.existsSync(path.join(root, 'd.html'))).toBe(false)
  })
  it('conserva el catch-all del SOI y la CSP original', () => {
    const rules = tomlRedirects('netlify.toml')
    expect(rules.at(-1)).toMatchObject({ from: '/*', to: '/index.html', status: 200 })
    expect(read('netlify.toml')).toContain('[build]')
    expect(read('netlify.toml')).toContain('publish = "dist"')
  })
})
