// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { createSignedUrl, fromSpy } = vi.hoisted(() => {
  const createSignedUrl = vi.fn()
  const fromSpy = vi.fn(() => ({ createSignedUrl }))
  return { createSignedUrl, fromSpy }
})

vi.mock('../supabaseClient.js', () => ({
  supabase: { storage: { from: fromSpy } },
}))

import {
  installStorageLinkHandler,
  parseStorageRef,
  resolveStorageUrl,
  storageLinkAttrs,
  SIGNED_URL_TTL_SECONDS,
} from '../storageFiles.js'

describe('parseStorageRef', () => {
  it('interpreta una ruta relativa con el bucket por defecto', () => {
    expect(parseStorageRef('justificaciones/a.jpg')).toEqual({ bucket: 'documentos', path: 'justificaciones/a.jpg' })
  })

  it('respeta un bucket por defecto distinto', () => {
    expect(parseStorageRef('x/y.pdf', 'tareas')).toEqual({ bucket: 'tareas', path: 'x/y.pdf' })
  })

  it('extrae bucket y path de URLs públicas, firmadas y autenticadas heredadas', () => {
    const base = 'https://abc.supabase.co/storage/v1/object'
    expect(parseStorageRef(`${base}/public/documentos/justificaciones/a%20b.jpg?t=1`))
      .toEqual({ bucket: 'documentos', path: 'justificaciones/a b.jpg' })
    expect(parseStorageRef(`${base}/sign/tareas/t1/f.pdf?token=zzz`)).toEqual({ bucket: 'tareas', path: 't1/f.pdf' })
    expect(parseStorageRef(`${base}/authenticated/documentos/ausencias/m/f.png`))
      .toEqual({ bucket: 'documentos', path: 'ausencias/m/f.png' })
  })

  it.each([
    [null], [undefined], [''], ['data:image/png;base64,AAAA'], ['blob:http://x/1'],
    ['https://ejemplo.com/archivo.pdf'], ['../secreto.pdf'], ['a/../../b'],
  ])('devuelve null para %s', (ref) => {
    expect(parseStorageRef(ref)).toBeNull()
  })
})

describe('resolveStorageUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createSignedUrl.mockResolvedValue({ data: { signedUrl: 'https://signed.test/f?token=1' }, error: null })
  })

  it('firma las rutas de Storage con la caducidad por defecto', async () => {
    const url = await resolveStorageUrl('justificaciones/a.jpg')
    expect(fromSpy).toHaveBeenCalledWith('documentos')
    expect(createSignedUrl).toHaveBeenCalledWith('justificaciones/a.jpg', SIGNED_URL_TTL_SECONDS)
    expect(url).toBe('https://signed.test/f?token=1')
  })

  it('firma también URLs públicas heredadas usando el bucket de la URL', async () => {
    await resolveStorageUrl('https://abc.supabase.co/storage/v1/object/public/tareas/t/f.pdf')
    expect(fromSpy).toHaveBeenCalledWith('tareas')
    expect(createSignedUrl).toHaveBeenCalledWith('t/f.pdf', SIGNED_URL_TTL_SECONDS)
  })

  it('no toca data:, blob: ni URLs externas', async () => {
    expect(await resolveStorageUrl('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA')
    expect(await resolveStorageUrl('blob:http://x/1')).toBe('blob:http://x/1')
    expect(await resolveStorageUrl('https://ejemplo.com/a.pdf')).toBe('https://ejemplo.com/a.pdf')
    expect(createSignedUrl).not.toHaveBeenCalled()
  })

  it('devuelve null si no hay referencia', async () => {
    expect(await resolveStorageUrl(null)).toBeNull()
  })

  it('propaga el error cuando no se puede firmar', async () => {
    createSignedUrl.mockResolvedValue({ data: null, error: new Error('Object not found') })
    await expect(resolveStorageUrl('justificaciones/no-existe.jpg')).rejects.toThrow('Object not found')
  })
})

describe('storageLinkAttrs', () => {
  it('marca los objetos de Storage para resolverlos al hacer clic', () => {
    expect(storageLinkAttrs('ausencias/m1/a.pdf')).toBe('href="#" data-storage-ref="ausencias/m1/a.pdf" data-storage-bucket="documentos"')
  })

  it('enlaza directamente lo que no es un objeto de Storage', () => {
    expect(storageLinkAttrs('https://ejemplo.com/a.pdf')).toBe('href="https://ejemplo.com/a.pdf"')
  })

  it('escapa comillas y signos para evitar inyección en el HTML', () => {
    const attrs = storageLinkAttrs('a/"><script>x</script>.pdf')
    expect(attrs).not.toContain('"><script>')
    expect(attrs).toContain('&quot;&gt;'.replace('&gt;', '>'))
  })
})

describe('installStorageLinkHandler', () => {
  it('abre la URL firmada al hacer clic en un enlace data-storage-ref', async () => {
    createSignedUrl.mockResolvedValue({ data: { signedUrl: 'https://signed.test/doc?token=9' }, error: null })
    const fakeTab = { location: { href: '' }, close: vi.fn() }
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(fakeTab)

    installStorageLinkHandler()
    installStorageLinkHandler() // idempotente
    document.body.innerHTML = `<a id="l" ${storageLinkAttrs('ausencias/m1/a.pdf')}>Ver</a>`
    document.getElementById('l').click()

    await vi.waitFor(() => expect(fakeTab.location.href).toBe('https://signed.test/doc?token=9'))
    expect(openSpy).toHaveBeenCalledTimes(1)
    expect(createSignedUrl).toHaveBeenCalledWith('ausencias/m1/a.pdf', SIGNED_URL_TTL_SECONDS)
    openSpy.mockRestore()
  })

  it('cierra la pestaña y no navega si falla la firma', async () => {
    createSignedUrl.mockResolvedValue({ data: null, error: new Error('denied') })
    const fakeTab = { location: { href: '' }, close: vi.fn() }
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(fakeTab)
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    document.body.innerHTML = `<a id="l2" ${storageLinkAttrs('ausencias/m1/b.pdf')}>Ver</a>`
    document.getElementById('l2').click()

    await vi.waitFor(() => expect(fakeTab.close).toHaveBeenCalled())
    expect(fakeTab.location.href).toBe('')
    expect(alertSpy).toHaveBeenCalled()
    openSpy.mockRestore(); alertSpy.mockRestore(); errSpy.mockRestore()
  })
})
