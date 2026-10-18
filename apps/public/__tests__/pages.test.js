// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const CARD = { slug: 'concierto-navidad-2026', titulo: '<img src=x onerror=alert(1)>Concierto', descripcion: 'Programa', fecha_documento: '2026-12-20', categoria: 'boletin', extension: 'pdf', mime_type: 'application/pdf', size_bytes: 2048, storage_path: 'p/f.pdf', version_numero: 2 }
let calls
const respond = (map) => vi.fn(async (url, init) => {
  calls.push({ url: String(url), init })
  for (const [needle, body] of Object.entries(map)) {
    if (String(url).includes(needle)) return typeof body === 'function' ? body(url, init) : { ok: true, status: 200, json: async () => body }
  }
  return { ok: false, status: 404, json: async () => ({}) }
})

beforeEach(() => {
  calls = []
  vi.stubEnv('VITE_SUPABASE_URL', 'https://proj.supabase.co')
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key')
  document.body.innerHTML = '<div id="app"></div>'
})
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

const app = () => document.getElementById('app')

describe('inicio /', () => {
  it('muestra nombre, lema, navegación y documentos recientes; escapa el contenido', async () => {
    vi.stubGlobal('fetch', respond({ 'listar_publicaciones_publicas': [CARD] }))
    const { renderHome } = await import('../src/pages/home.js')
    await renderHome(app(), { institutionalUrl: '' })
    expect(app().querySelector('h1').textContent).toBe('El Sistema Punta Cana')
    expect(app().textContent).toContain('Tocamos corazones, cambiamos vidas.')
    expect(app().querySelector('a[href="/qr-code"]')).toBeTruthy()
    expect(app().querySelector('a.card').getAttribute('href')).toBe('/d/concierto-navidad-2026')
    expect(app().querySelector('img[onerror]')).toBeNull()
    expect(app().querySelector('#contenido')).toBeTruthy()
    expect(calls[0].init.body).toContain('"p_limit":3')
  })
  it('el enlace institucional solo aparece si se configura una URL https', async () => {
    vi.stubGlobal('fetch', respond({ 'listar_publicaciones_publicas': [] }))
    const { renderHome } = await import('../src/pages/home.js')
    await renderHome(app(), { institutionalUrl: 'javascript:alert(1)' })
    expect([...app().querySelectorAll('a')].some((a) => a.textContent === 'Información institucional')).toBe(false)
    await renderHome(app(), { institutionalUrl: 'https://ejemplo.org/info' })
    expect([...app().querySelectorAll('a')].find((a) => a.textContent === 'Información institucional')?.rel).toContain('noopener')
  })
  it('degrada con elegancia si la API falla', async () => {
    vi.stubGlobal('fetch', respond({}))
    const { renderHome } = await import('../src/pages/home.js')
    await renderHome(app())
    expect(app().textContent).toContain('No se pudieron cargar')
  })
})

describe('biblioteca /qr-code', () => {
  it('lista, filtra por título y pagina', async () => {
    const rows = Array.from({ length: 24 }, (_, i) => ({ ...CARD, slug: `doc-${i}-aa`, titulo: i === 5 ? 'Programa especial' : `Documento ${i}` }))
    vi.stubGlobal('fetch', respond({ 'listar_publicaciones_publicas': (u, init) => ({ ok: true, status: 200, json: async () => (JSON.parse(init.body).p_offset === 0 ? rows : [{ ...CARD, slug: 'ultimo-doc', titulo: 'Último' }]) }) }))
    const { renderLibrary } = await import('../src/pages/library.js')
    await renderLibrary(app())
    expect(app().querySelectorAll('a.card')).toHaveLength(24)
    const more = [...app().querySelectorAll('button')].find((b) => b.textContent === 'Cargar más')
    expect(more.hidden).toBe(false)
    more.click()
    await vi.waitFor(() => expect(app().querySelectorAll('a.card')).toHaveLength(25))
    const search = app().querySelector('input[type=search]')
    search.value = 'especial'
    search.dispatchEvent(new Event('input'))
    expect(app().querySelectorAll('a.card')).toHaveLength(1)
    search.value = 'zzz'
    search.dispatchEvent(new Event('input'))
    expect(app().textContent).toContain('Ningún documento coincide')
  })
  it('muestra estado vacío', async () => {
    vi.stubGlobal('fetch', respond({ 'listar_publicaciones_publicas': [] }))
    const { renderLibrary } = await import('../src/pages/library.js')
    await renderLibrary(app())
    expect(app().textContent).toContain('Todavía no hay documentos publicados')
  })
})

describe('visualizador /d/:slug', () => {
  it('extrae el slug solo de rutas válidas', async () => {
    const { slugFromPath } = await import('../src/pages/viewer.js')
    expect(slugFromPath('/d/concierto-navidad-2026')).toBe('concierto-navidad-2026')
    expect(slugFromPath('/d/abc123def0/')).toBe('abc123def0')
    for (const bad of ['/d/', '/d/../admin', '/d/ABC', '/d/a/b', '/x/abc']) expect(slugFromPath(bad)).toBeNull()
  })
  it('PDF: abrir y descargar con URL firmada; sin sesión ni claves privilegiadas', async () => {
    vi.stubGlobal('fetch', respond({
      'obtener_publicacion_publica': [CARD],
      '/storage/v1/object/sign/soi-publico/p/f.pdf': { signedURL: '/object/sign/soi-publico/p/f.pdf?token=T' },
    }))
    const { renderViewer } = await import('../src/pages/viewer.js')
    await renderViewer(app(), 'concierto-navidad-2026')
    await vi.waitFor(() => expect(app().querySelector('#abrir').getAttribute('href')).toBe('https://proj.supabase.co/storage/v1/object/sign/soi-publico/p/f.pdf?token=T'))
    expect(app().querySelector('#descargar').getAttribute('href')).toContain('&download=concierto-navidad-2026.pdf')
    expect(app().querySelector('#abrir').rel).toContain('noopener')
    expect(app().querySelector('img[onerror]')).toBeNull()
    for (const c of calls) {
      expect(c.init.headers.Authorization).toBe('Bearer anon-key')
      expect(JSON.stringify(c.init.headers)).not.toMatch(/service_role/i)
    }
    expect(JSON.parse(calls[1].init.body)).toEqual({ expiresIn: 300 })
  })
  it('imagen: se muestra en línea', async () => {
    vi.stubGlobal('fetch', respond({
      'obtener_publicacion_publica': [{ ...CARD, mime_type: 'image/png', extension: 'png', storage_path: 'p/i.png' }],
      '/storage/v1/object/sign/': { signedURL: '/object/sign/soi-publico/p/i.png?token=T' },
    }))
    const { renderViewer } = await import('../src/pages/viewer.js')
    await renderViewer(app(), 'concierto-navidad-2026')
    await vi.waitFor(() => expect(app().querySelector('img.doc-img')).toBeTruthy())
  })
  it('inexistente, no publicado, error de red y slug inválido muestran el mismo mensaje', async () => {
    const texts = []
    for (const f of [respond({ 'obtener_publicacion_publica': [] }), respond({}), vi.fn(async () => { throw new Error('red') })]) {
      vi.stubGlobal('fetch', f)
      const { renderViewer } = await import('../src/pages/viewer.js')
      document.body.innerHTML = '<div id="app"></div>'
      await renderViewer(app(), 'concierto-navidad-2026')
      texts.push(app().querySelector('article').textContent)
    }
    document.body.innerHTML = '<div id="app"></div>'
    const { renderViewer } = await import('../src/pages/viewer.js')
    await renderViewer(app(), null)
    texts.push(app().querySelector('article').textContent)
    expect(texts[0]).toContain('Documento no disponible')
    expect(new Set(texts).size).toBe(1)
  })
  it('avisa si no se puede firmar el archivo', async () => {
    vi.stubGlobal('fetch', respond({ 'obtener_publicacion_publica': [CARD] }))
    const { renderViewer } = await import('../src/pages/viewer.js')
    await renderViewer(app(), 'concierto-navidad-2026')
    await vi.waitFor(() => expect(app().textContent).toContain('No se pudo obtener el archivo'))
  })
})
