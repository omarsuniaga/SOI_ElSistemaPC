import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { test } from 'node:test'
import assert from 'node:assert/strict'

const source = readFileSync(new URL('../../public/signage/js/app.js', import.meta.url), 'utf8')
async function run({ search = '', mode = 'web', screen = true } = {}) {
  const calls = [], updates = [], intervals = [], listeners = {}
  const nodes = new Map()
  const node = (s) => {
    if (!nodes.has(s)) nodes.set(s, { hidden: true, style: {}, classList: { add() {}, toggle() {} }, addEventListener() {} })
    return nodes.get(s)
  }
  const SIG = {
    cfg: { mode, screenSlug: 'vestibulo', marca: {}, poll: { pantalla: 180000, horario: 180000, calendario: 900000, media: 180000 }, defaultLayout: {} },
    $: node, mergeLayout: () => ({ horario: {}, cabecera: {} }),
    cache: { put() {}, get() { return null } }, time: { isoDate: () => '2026-10-29', localHour: () => 12, dayMonth: () => '' },
    api: async (path) => {
      calls.push(path)
      if (path.startsWith('signage_pantallas')) return screen ? [{ id: 'screen-1', layout: {} }] : []
      if (path.startsWith('signage_media')) return [{ id: 'slide-1', tipo: 'slide', pantalla_id: 'screen-1' }]
      return []
    },
  }
  for (const name of ['Cabecera', 'Visualizador', 'Horario']) SIG[name] = () => ({ start() {}, relayout() {}, update(model) { updates.push({ name, model }) } })
  const window = { SIG, addEventListener(name, cb) { listeners[name] = cb } }
  window.parent = window
  const document = { documentElement: { classList: { toggle() {} } }, createElement: () => ({}), body: { appendChild() {} } }
  vm.runInNewContext(source, { window, document, location: { search, hash: '', reload() {} }, console: { warn() {}, error() {} }, setTimeout() {}, clearTimeout() {}, clearInterval() {}, setInterval(cb, ms) { intervals.push({ cb, ms }) }, Date })
  for (let i = 0; i < 20; i++) await Promise.resolve()
  return { SIG, calls, updates, intervals, listeners, nodes }
}

test('la URL pública arranca y muestra contenido guardado sin sesión ni preview', async () => {
  const result = await run()
  assert.ok(result.calls.some(p => p.startsWith('signage_pantallas')))
  assert.ok(result.updates.some(u => u.name === 'Visualizador' && u.model.items.length === 1))
  assert.ok(result.intervals.some(i => i.ms === 180000))
  assert.equal(result.SIG.preview, false)
})
test('la pantalla pública solo consulta pantallas activas', async () => {
  const result = await run()
  assert.match(result.calls.find(p => p.startsWith('signage_pantallas')) || '', /activo=eq.true/)
})
test('una pantalla inexistente no carga medios de otras pantallas', async () => {
  const result = await run({ mode: 'device', screen: false })
  assert.equal(result.calls.filter(p => p.startsWith('signage_media')).length, 0)
})
test('la vista previa mantiene el canal de edición del Estudio', async () => {
  const result = await run({ search: '?preview=1' })
  assert.equal(result.SIG.preview, true)
  assert.equal(typeof result.listeners.message, 'function')
})
test('el dispositivo conserva su reproducción autónoma', async () => {
  const result = await run({ mode: 'device' })
  assert.ok(result.calls.some(p => p.startsWith('signage_media')))
  assert.ok(result.updates.some(u => u.name === 'Visualizador' && u.model.items.length === 1))
})

test('el enlace selecciona la pantalla indicada', async () => {
  const result = await run({ search: '?pantalla=otra-pantalla' })
  assert.match(result.calls[0], /slug=eq.otra-pantalla/)
  assert.match(result.calls.find(p => p.startsWith('signage_media')), /pantalla_id.eq.screen-1/)
})

test('la visualización pública ignora mensajes de edición', async () => {
  const result = await run()
  assert.equal(result.listeners.message, undefined)
})

test('el caché no mezcla contenido entre pantallas', () => {
  const values = new Map()
  const config = { screenSlug: 'uno', supabaseUrl: 'https://example.invalid', defaultLayout: {} }
  const window = { SIGNAGE_CONFIG: config }
  vm.runInNewContext(readFileSync(new URL('../../public/signage/js/core.js', import.meta.url), 'utf8'), {
    window, localStorage: { setItem: (k, v) => values.set(k, v), getItem: k => values.get(k) || null },
  })
  window.SIG.cache.put('media', ['contenido-uno'])
  config.screenSlug = 'dos'
  assert.equal(window.SIG.cache.get('media'), null)
  config.screenSlug = 'uno'
  assert.equal(window.SIG.cache.get('media')[0], 'contenido-uno')
})

test('la ruta /cartelera sirve el reproductor antes del fallback del portal', () => {
  const redirects = readFileSync(new URL('../../public/_redirects', import.meta.url), 'utf8')
  assert.match(redirects, /^\/cartelera\s+\/signage\/index.html\s+200$/m)
  assert.ok(redirects.indexOf('/cartelera') < redirects.indexOf('/*             /index.html'))
})
