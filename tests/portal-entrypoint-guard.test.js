import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Portal Entry Point Guard (Anti-Regression)', () => {
  const rootDir = path.resolve(__dirname, '..')

  it('admin.html must load the modern V2 portal (src/portales/adm/adm.js)', () => {
    const adminHtml = fs.readFileSync(path.join(rootDir, 'admin.html'), 'utf8')
    expect(adminHtml).toContain('/src/portales/adm/adm.js')
    expect(adminHtml).not.toContain('/src/main.js')
  })

  it('adm.html must load the modern V2 portal (src/portales/adm/adm.js)', () => {
    const admHtml = fs.readFileSync(path.join(rootDir, 'adm.html'), 'utf8')
    expect(admHtml).toContain('/src/portales/adm/adm.js')
  })

  it('vite.config.js must alias /admin and /adm directly to adm.html', () => {
    const viteConfig = fs.readFileSync(path.join(rootDir, 'vite.config.js'), 'utf8')
    // El dev server enruta /admin y /adm a adm.html vía la tabla portalPrefixes.
    expect(viteConfig).toContain("{ prefix: '/admin', file: '/adm.html' }")
    expect(viteConfig).toContain("{ prefix: '/adm', file: '/adm.html' }")
    expect(viteConfig).toMatch(/pathname === p\.prefix \|\| pathname\.startsWith\(p\.prefix \+ '\/'\)/)
  })

  it('portalCatalog.js must define admin with entry adm.html', () => {
    const catalog = fs.readFileSync(path.join(rootDir, 'src/core/portalCatalog.js'), 'utf8')
    expect(catalog).toContain("portalId: 'admin', path: '/admin', entry: 'adm.html'")
    expect(catalog).toContain("portalId: 'ADM', path: '/adm', entry: 'adm.html'")
  })
})
