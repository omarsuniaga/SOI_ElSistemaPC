// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '../../..')
const script = path.join(root, 'scripts/verify-public-bundle.mjs')
const dist = path.join(root, 'apps/public/dist')

describe('aislamiento del artefacto público', () => {
  it('el build real del sitio público pasa la auditoría (sin código ni rutas administrativas)', () => {
    execFileSync(process.execPath, [path.join(root, 'node_modules/vite/bin/vite.js'), 'build', '--config', 'apps/public/vite.config.mjs'], { cwd: root, stdio: 'pipe' })
    const out = execFileSync(process.execPath, [script], { cwd: root, encoding: 'utf8' })
    expect(out).toContain('Artefacto público aislado')
    const files = fs.readdirSync(dist, { recursive: true }).map(String).map((f) => f.split(path.sep).join('/'))
    expect(files).toEqual(expect.arrayContaining(['index.html', 'qr-code.html', 'd.html', '404.html', '_redirects', '_headers']))
    expect(files.filter((f) => /\.map$|sw\.js|manifest|signage|adm|\.env/i.test(f))).toEqual([])
  }, 60_000)

  it('el bundle no contiene supabase-js, ni auth, ni RPC/rutas administrativas', () => {
    const text = fs.readdirSync(path.join(dist, 'assets')).map((f) => fs.readFileSync(path.join(dist, 'assets', f), 'utf8')).join('\n')
    for (const bad of ['signInWithPassword', 'sb-soi-auth', 'crear_publicacion_documento', 'registrar_version_documento', 'service_role', 'gestion-usuarios', 'accessControl', 'qrcode']) expect(text).not.toContain(bad)
    expect(text).toContain('listar_publicaciones_publicas')
    expect(text).toContain('obtener_publicacion_publica')
  })

  it('la auditoría FALLA si el artefacto se contamina (prueba de que la comprobación detecta)', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pub-dist-'))
    fs.cpSync(dist, tmp, { recursive: true })
    fs.writeFileSync(path.join(tmp, 'adm.html'), '<html></html>')
    const asset = fs.readdirSync(path.join(tmp, 'assets')).find((f) => f.endsWith('.js'))
    fs.appendFileSync(path.join(tmp, 'assets', asset), '\n/* crear_publicacion_documento gestion-usuarios */')
    const r = spawnSync(process.execPath, [script, tmp], { cwd: root, encoding: 'utf8' })
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('adm.html')
    expect(r.stderr).toContain('crear_publicacion_documento')
    fs.rmSync(tmp, { recursive: true, force: true })
  })
})
