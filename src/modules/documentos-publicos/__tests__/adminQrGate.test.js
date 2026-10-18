// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'

const pub = {
  id: '11111111-1111-4111-8111-111111111111', slug: 'concierto-navidad-2026', titulo: 'Concierto', descripcion: null, fecha_documento: '2026-10-17',
  categoria: 'boletin', estado: 'publicado', version_actual_id: 'v1', updated_at: '2026-10-17T12:00:00Z',
  version: { numero: 1, mime_type: 'application/pdf', extension: 'pdf', size_bytes: 10, nombre_original: 'a.pdf', storage_path: 'p/x.pdf' },
}
const created = vi.fn(async () => ({ id: 'n', slug: 's' }))
vi.mock('../api/documentosPublicosApi.js', () => ({
  puedeGestionar: async () => true,
  listarPublicaciones: async () => [pub],
  obtenerPublicacion: async () => pub,
  listarVersiones: async () => [],
  listarEventos: async () => [],
  crearPublicacion: (...a) => created(...a),
}))
const { renderDocumentosPublicosView } = await import('../views/documentosPublicosView.js')

async function openDetail() {
  const el = document.createElement('div')
  document.body.appendChild(el)
  await renderDocumentosPublicosView(el)
  el.querySelector('tr[data-id]').click()
  await vi.waitFor(() => expect(el.querySelector('h2')).toBeTruthy())
  return el
}
afterEach(() => { vi.unstubAllEnvs(); document.body.innerHTML = '' })

describe('panel: bloqueo de QR definitivos', () => {
  it('sin VITE_PUBLIC_BASE_URL no hay QR, ni URL, ni descargas, y se explica el motivo', async () => {
    const el = await openDetail()
    expect(el.querySelector('#dpQrBlocked').textContent).toContain('VITE_PUBLIC_BASE_URL')
    expect(el.querySelector('#dpQr')).toBeNull()
    expect(el.querySelector('#dpUrl').value).toBe('')
    for (const id of ['#dpPng', '#dpSvg', '#dpCopiar']) expect(el.querySelector(id).disabled).toBe(true)
  })
  it.each(['https://soi-el-sistema-pc.netlify.app', 'https://deploy-preview-3--elsistemapc.netlify.app', 'http://elsistemapc.netlify.app'])(
    'dominio no autorizado %s bloquea la exportación', async (base) => {
      vi.stubEnv('VITE_PUBLIC_BASE_URL', base)
      const el = await openDetail()
      expect(el.querySelector('#dpQrBlocked')).toBeTruthy()
      expect(el.querySelector('#dpPng').disabled).toBe(true)
    })
  it('con el dominio autorizado genera el QR de /d/<slug> y habilita descargas', async () => {
    vi.stubEnv('VITE_PUBLIC_BASE_URL', 'https://elsistemapc.netlify.app')
    const el = await openDetail()
    await vi.waitFor(() => expect(el.querySelector('#dpQr svg')).toBeTruthy())
    expect(el.querySelector('#dpUrl').value).toBe('https://elsistemapc.netlify.app/d/concierto-navidad-2026')
    expect(el.querySelector('#dpQrBlocked')).toBeNull()
    expect(el.querySelector('#dpPng').disabled).toBe(false)
  })
})

describe('panel: subidas en producción', () => {
  it('se deshabilitan en producción sin verificación en servidor', async () => {
    vi.stubEnv('PROD', true)
    const el = await openDetail()
    expect(el.querySelector('#dpSubir').disabled).toBe(true)
    expect(el.querySelector('#dpUploadsBlocked').textContent).toContain('VITE_DOCS_SERVER_VERIFY')
  })
  it('se habilitan en producción solo con VITE_DOCS_SERVER_VERIFY=true', async () => {
    vi.stubEnv('PROD', true)
    vi.stubEnv('VITE_DOCS_SERVER_VERIFY', 'true')
    const el = await openDetail()
    expect(el.querySelector('#dpSubir').disabled).toBe(false)
    expect(el.querySelector('#dpUploadsBlocked')).toBeNull()
  })
  it('en desarrollo y pruebas no se bloquean', async () => {
    const el = await openDetail()
    expect(el.querySelector('#dpSubir').disabled).toBe(false)
  })
})

describe('panel: identificador público al crear', () => {
  it('ofrece el campo de identificador solo al crear, y valida el formato', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    await renderDocumentosPublicosView(el)
    el.querySelector('#dpNueva').click()
    await vi.waitFor(() => expect(document.querySelector('#dpSlug')).toBeTruthy())
    document.querySelector('#dpTitulo').value = 'Concierto de Navidad'
    document.querySelector('#dpSlug').value = 'Mal Slug!'
    document.querySelector('.app-modal-btn-save').click()
    await new Promise((r) => setTimeout(r, 100))
    expect(created).not.toHaveBeenCalled()
    document.querySelector('#dpSlug').value = 'concierto-navidad-2026'
    document.querySelector('.app-modal-btn-save').click()
    await vi.waitFor(() => expect(created).toHaveBeenCalledWith(expect.objectContaining({ slug: 'concierto-navidad-2026' })))
  })
})
