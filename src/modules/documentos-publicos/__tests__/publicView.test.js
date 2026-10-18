// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

const obtener = vi.fn()
const urlPublica = vi.fn()
vi.mock('../api/documentosPublicosApi.js', () => ({ obtenerPublicacionPublica: obtener, urlArchivoPublico: urlPublica }))
const { renderDocumentoPublicoView, slugFromPath } = await import('../views/documentoPublicoView.js')

const doc = {
  slug: 'abc123def0', titulo: '<img src=x onerror=alert(1)>Circular', descripcion: 'Texto', fecha_documento: '2026-10-01',
  categoria: 'comunicado', published_at: '2026-10-02T00:00:00Z', version_numero: 1, mime_type: 'application/pdf',
  extension: 'pdf', size_bytes: 2048, storage_path: 'p/f.pdf',
}

describe('página pública', () => {
  let el
  beforeEach(() => { vi.clearAllMocks(); el = document.createElement('div') })

  it('extrae el slug solo de /d/<slug> válido', () => {
    expect(slugFromPath('/d/abc123def0')).toBe('abc123def0')
    expect(slugFromPath('/d/abc123def0/')).toBe('abc123def0')
    expect(slugFromPath('/d/../admin')).toBeNull()
    expect(slugFromPath('/d/ABC')).toBeNull()
    expect(slugFromPath('/otra/abc123def0')).toBeNull()
  })
  it('muestra el mismo mensaje para inexistente, borrador o error', async () => {
    obtener.mockResolvedValueOnce(null)
    await renderDocumentoPublicoView(el, 'abc123def0')
    obtener.mockRejectedValueOnce(new Error('boom'))
    const el2 = document.createElement('div')
    await renderDocumentoPublicoView(el2, 'abc123def0')
    const el3 = document.createElement('div')
    await renderDocumentoPublicoView(el3, null)
    expect(el.textContent).toContain('Documento no disponible')
    expect(el2.textContent).toBe(el.textContent)
    expect(el3.textContent).toBe(el.textContent)
  })
  it('escapa el contenido y habilita abrir/descargar con URL firmada', async () => {
    obtener.mockResolvedValue(doc)
    urlPublica.mockImplementation(async (_p, o) => (o?.download ? 'https://x/sign?download=1' : 'https://x/sign'))
    await renderDocumentoPublicoView(el, 'abc123def0')
    expect(el.querySelector('img[onerror]')).toBeNull()
    expect(el.querySelector('#dpAbrir').getAttribute('href')).toBe('https://x/sign')
    expect(el.querySelector('#dpDescargar').getAttribute('href')).toContain('download')
    expect(el.querySelector('#dpAbrir').rel).toContain('noopener')
  })
  it('incrusta imágenes y avisa si el archivo no se puede firmar', async () => {
    obtener.mockResolvedValue({ ...doc, mime_type: 'image/png', extension: 'png' })
    urlPublica.mockResolvedValue('https://x/img')
    await renderDocumentoPublicoView(el, 'abc123def0')
    expect(el.querySelector('img.dp-img').src).toBe('https://x/img')
    obtener.mockResolvedValue(doc)
    urlPublica.mockRejectedValue(new Error('x'))
    const el2 = document.createElement('div')
    await renderDocumentoPublicoView(el2, 'abc123def0')
    expect(el2.textContent).toContain('No se pudo obtener el archivo')
  })
})
