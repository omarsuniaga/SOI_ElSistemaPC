import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'

/**
 * Regresión: un registrar importado en allRegistrars.js pero ausente del arreglo `allRegistrars`
 * deja sus rutas sin registrar y el ítem de menú "no hace nada" (ocurrió con 'documentos-publicos').
 */
const file = path.resolve(import.meta.dirname, '../allRegistrars.js')
const source = fs.readFileSync(file, 'utf8')

const imported = [...source.matchAll(/import\s*\{\s*(registerRoutes\w+)\s*\}\s*from/g)].map((m) => m[1])
const arrayBody = /export const allRegistrars\s*=\s*\[([\s\S]*?)\]/.exec(source)?.[1] ?? ''
const listed = [...arrayBody.matchAll(/\b(registerRoutes\w+)\b/g)].map((m) => m[1])

describe('allRegistrars.js: importados vs. arreglo', () => {
  it('encuentra imports y el arreglo (la comprobación no es vacía)', () => {
    expect(imported.length).toBeGreaterThan(20)
    expect(listed.length).toBeGreaterThan(20)
  })
  it('todo registrar importado está en el arreglo', () => {
    expect(imported.filter((name) => !listed.includes(name))).toEqual([])
  })
  it('el arreglo no contiene nombres no importados ni duplicados', () => {
    expect(listed.filter((name) => !imported.includes(name))).toEqual([])
    expect(listed.filter((name, i) => listed.indexOf(name) !== i)).toEqual([])
  })
})

const routes = new Set()
vi.mock('../../../core/router/router.js', () => ({ router: { register: (route) => routes.add(route), navigate: vi.fn() } }))

describe('rutas registradas al ejecutar todos los registrars', () => {
  it('registra la ruta del menú «Documentos públicos y QR» (documentos-publicos)', async () => {
    const { allRegistrars } = await import('../allRegistrars.js')
    for (const registrar of allRegistrars) registrar()
    expect(routes.has('documentos-publicos')).toBe(true)
  }, 120_000)

  it('cada ítem del menú del portal ADM tiene ruta registrada', async () => {
    const { allRegistrars } = await import('../allRegistrars.js')
    for (const registrar of allRegistrars) registrar()
    vi.doMock('../adminPortalShell.js', () => ({ bootAdminPortal: (profile) => { profiles.push(profile); return Promise.resolve() } }))
    const profiles = []
    await import('../../adm/adm.js')
    const ids = profiles.flatMap((p) => p.navGroups.flatMap((g) => g.items.map((i) => i.id)))
    expect(ids.length).toBeGreaterThan(10)
    expect(ids).toContain('documentos-publicos')
    expect(ids.filter((id) => !routes.has(id))).toEqual([])
  }, 120_000)
})
