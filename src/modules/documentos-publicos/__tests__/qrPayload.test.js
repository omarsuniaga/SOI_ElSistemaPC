// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'

const slug = 'abc123def0'
const pub = {
  id: '11111111-1111-4111-8111-111111111111', slug, titulo: 'Circular', descripcion: null, fecha_documento: '2026-10-17', categoria: 'general',
  estado: 'publicado', version_actual_id: 'v1', updated_at: '2026-10-17T12:00:00Z',
  version: { numero: 1, mime_type: 'application/pdf', extension: 'pdf', size_bytes: 10, nombre_original: 'a.pdf', storage_path: 'p/secret-object-path.pdf' },
}
const generated = []
vi.mock('../api/documentosPublicosApi.js', () => ({
  puedeGestionar: async () => true,
  listarPublicaciones: async () => [pub],
  obtenerPublicacion: async () => pub,
  listarVersiones: async () => [{ id: 'v1', numero: 1, nombre_original: 'a.pdf', size_bytes: 10, created_at: '2026-10-17T12:00:00Z', sha256: 'a'.repeat(64), storage_path: pub.version.storage_path }],
  listarEventos: async () => [],
  urlArchivoAdmin: async () => 'https://x/sign?token=TEMPORAL',
}))
vi.mock('../lib/qr.js', async (orig) => {
  const real = await orig()
  return {
    ...real,
    generateQrSvg: async (url) => { generated.push(url); return real.generateQrSvg(url) },
    generateQrPngDataUrl: async (url) => { generated.push(url); return real.generateQrPngDataUrl(url, 64) },
    downloadBlob: vi.fn(),
  }
})
const { renderDocumentosPublicosView } = await import('../views/documentosPublicosView.js')

describe('el QR codifica solo la URL permanente', () => {
  it('SVG y PNG usan /d/<slug>, nunca la URL firmada ni la ruta del objeto', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    await renderDocumentosPublicosView(el)
    el.querySelector('tr[data-id]').click()
    await vi.waitFor(() => expect(el.querySelector('#dpQr svg')).toBeTruthy())
    el.querySelector('#dpPng').click()
    await vi.waitFor(() => expect(generated.length).toBeGreaterThanOrEqual(2))
    for (const url of generated) {
      expect(url).toMatch(new RegExp(`/d/${slug}$`))
      expect(url).not.toMatch(/token|sign|storage|secret-object-path|supabase/i)
    }
    expect(new Set(generated).size).toBe(1)
    expect(el.querySelector('#dpUrl').value).toBe(generated[0])
  })
})
