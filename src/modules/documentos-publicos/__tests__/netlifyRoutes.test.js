// @vitest-environment node
import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '../../../..')

/** Reglas de netlify.toml en orden: [{ from, to, status }]. */
function tomlRedirects() {
  const text = fs.readFileSync(path.join(root, 'netlify.toml'), 'utf8')
  return text.split('[[redirects]]').slice(1).map((block) => ({
    from: /from\s*=\s*"([^"]+)"/.exec(block)?.[1],
    to: /to\s*=\s*"([^"]+)"/.exec(block)?.[1],
    status: Number(/status\s*=\s*(\d+)/.exec(block)?.[1] ?? 301),
  }))
}

/** Reglas de public/_redirects en orden. */
function fileRedirects() {
  return fs.readFileSync(path.join(root, 'public/_redirects'), 'utf8').split(/\r?\n/)
    .map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
    .map((l) => { const [from, to, status] = l.split(/\s+/); return { from, to, status: Number(status ?? 301) } })
}

/** Primera regla que coincide (semántica de Netlify: comodín final `*`, coincidencia exacta si no hay). */
function resolve(rules, url) {
  return rules.find((r) => (r.from.endsWith('/*') ? url.startsWith(r.from.slice(0, -1)) || url === r.from.slice(0, -2) : r.from === url))
}

const SLUG_URLS = ['/d/abc123def0', '/d/abc123def0/', '/d/zzzzzzzzzz']

describe.each([['netlify.toml', tomlRedirects], ['public/_redirects', fileRedirects]])('%s', (_name, load) => {
  const rules = load()
  it('sirve /d/<slug> con d.html y estado 200 (rewrite: la URL del QR no cambia al abrir ni al recargar)', () => {
    for (const url of SLUG_URLS) {
      const r = resolve(rules, url)
      expect(r, url).toBeTruthy()
      expect(r.to).toBe('/d.html')
      expect(r.status).toBe(200)
    }
  })
  it('la regla de /d/* va antes del catch-all /*', () => {
    const iD = rules.findIndex((r) => r.from === '/d/*')
    const iAll = rules.findIndex((r) => r.from === '/*')
    expect(iD).toBeGreaterThanOrEqual(0)
    expect(iAll).toBeGreaterThan(iD)
  })
  it('no captura rutas administrativas ni de otros portales', () => {
    for (const url of ['/adm/clases-hoy', '/fin/cuotas', '/documentos-publicos']) {
      expect(resolve(rules, url)?.to).not.toBe('/d.html')
    }
  })
})

describe('entrada d.html y build', () => {
  it('d.html existe, no se indexa y carga el módulo público (no el shell administrativo)', () => {
    const html = fs.readFileSync(path.join(root, 'd.html'), 'utf8')
    expect(html).toContain('name="robots" content="noindex"')
    expect(html).toContain('/src/modules/documentos-publicos/public/main.js')
    expect(html).not.toMatch(/main-maestros|adminPortalShell/)
  })
  it('vite incluye d.html como entrada y el servidor de desarrollo reescribe /d/*', () => {
    const cfg = fs.readFileSync(path.join(root, 'vite.config.js'), 'utf8')
    expect(cfg).toMatch(/documento:\s*'d\.html'/)
    expect(cfg).toMatch(/prefix:\s*'\/d',\s*file:\s*'\/d\.html'/)
  })
})
