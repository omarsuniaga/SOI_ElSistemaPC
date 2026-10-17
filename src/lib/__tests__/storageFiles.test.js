// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { createSignedUrl, getPublicUrl, fromSpy } = vi.hoisted(() => {
  const createSignedUrl = vi.fn()
  const getPublicUrl = vi.fn()
  const fromSpy = vi.fn(() => ({ createSignedUrl, getPublicUrl }))
  return { createSignedUrl, getPublicUrl, fromSpy }
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
    ['javascript:alert(1)'], ['JaVaScRiPt:alert(1)'], ['vbscript:x'], ['file:///etc/passwd'],
    ['a//b.pdf'], ['a/./b.pdf'], ['a\\b.pdf'], ['a/b\u0000.pdf'], ['x'.repeat(1100)],
    ['https://abc.supabase.co/storage/v1/object/public/documentos/a/%2e%2e/b.pdf'],
    ['https://abc.supabase.co/storage/v1/object/public/documentos/a/%E0%A4%A.pdf'],
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

  it('no toca data: de imagen/PDF, blob: ni URLs externas', async () => {
    expect(await resolveStorageUrl('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA')
    expect(await resolveStorageUrl('blob:http://x/1')).toBe('blob:http://x/1')
    expect(await resolveStorageUrl('https://ejemplo.com/a.pdf')).toBe('https://ejemplo.com/a.pdf')
    expect(createSignedUrl).not.toHaveBeenCalled()
  })

  it('anula esquemas peligrosos en lugar de devolverlos', async () => {
    expect(await resolveStorageUrl('javascript:alert(1)')).toBeNull()
    expect(await resolveStorageUrl('data:text/html;base64,PHNjcmlwdD4=')).toBeNull()
    expect(createSignedUrl).not.toHaveBeenCalled()
  })

  it('rechaza URLs de Supabase con ruta manipulada (traversal)', async () => {
    await expect(resolveStorageUrl('https://abc.supabase.co/storage/v1/object/public/documentos/a/%2e%2e/b.pdf'))
      .rejects.toThrow('no válida')
    expect(createSignedUrl).not.toHaveBeenCalled()
  })

  it('solo firma buckets privados: los públicos no se firman', async () => {
    const pub = 'https://abc.supabase.co/storage/v1/object/public/instrumentos-fotos/activos/1/foto.png'
    expect(await resolveStorageUrl(pub)).toBe(pub)
    expect(createSignedUrl).not.toHaveBeenCalled()
  })

  it('construye la URL pública de una ruta relativa de un bucket público', async () => {
    getPublicUrl.mockReturnValue({ data: { publicUrl: 'https://abc.supabase.co/pub/activos/1/foto.png' } })
    expect(await resolveStorageUrl('activos/1/foto.png', { bucket: 'instrumentos-fotos' }))
      .toBe('https://abc.supabase.co/pub/activos/1/foto.png')
    expect(createSignedUrl).not.toHaveBeenCalled()
  })

  it('firma los buckets privados tareas y planificacion-docs', async () => {
    await resolveStorageUrl('t1/f.pdf', { bucket: 'tareas' })
    await resolveStorageUrl('planificacion-uploads/u/a.pdf', { bucket: 'planificacion-docs' })
    expect(fromSpy).toHaveBeenCalledWith('tareas')
    expect(fromSpy).toHaveBeenCalledWith('planificacion-docs')
  })

  it('no acepta una URL firmada con esquema inesperado', async () => {
    createSignedUrl.mockResolvedValue({ data: { signedUrl: 'javascript:alert(1)' }, error: null })
    await expect(resolveStorageUrl('justificaciones/u/a.jpg')).rejects.toBeDefined()
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

  it('enlaza directamente lo que ya es una URL segura', () => {
    expect(storageLinkAttrs('https://ejemplo.com/a.pdf')).toBe('href="https://ejemplo.com/a.pdf"')
    expect(storageLinkAttrs('data:image/png;base64,AAAA')).toBe('href="data:image/png;base64,AAAA"')
  })

  it.each([
    ['javascript:alert(1)'], ['data:text/html;base64,PHNjcmlwdD4='], ['vbscript:x'], ['file:///etc/passwd'],
  ])('neutraliza %s (href inerte)', (ref) => {
    expect(storageLinkAttrs(ref)).toBe('href="#" aria-disabled="true"')
  })

  it('escapa comillas, apóstrofos y signos para evitar inyección en el HTML', () => {
    const attrs = storageLinkAttrs(`a/"><script>x</script>'.pdf`)
    expect(attrs).not.toContain('"><script>')
    expect(attrs).not.toContain('<script>')
    expect(attrs).not.toContain("'")
    expect(attrs).toContain('&quot;&gt;&lt;script&gt;')
  })
})

describe('installStorageLinkHandler', () => {
  it('abre la URL firmada al hacer clic en un enlace data-storage-ref', async () => {
    createSignedUrl.mockResolvedValue({ data: { signedUrl: 'https://signed.test/doc?token=9' }, error: null })
    const fakeTab = { location: { href: '' }, close: vi.fn(), opener: 'pagina' }
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(fakeTab)

    installStorageLinkHandler()
    installStorageLinkHandler() // idempotente
    document.body.innerHTML = `<a id="l" ${storageLinkAttrs('ausencias/m1/a.pdf')}>Ver</a>`
    document.getElementById('l').click()

    await vi.waitFor(() => expect(fakeTab.location.href).toBe('https://signed.test/doc?token=9'))
    expect(openSpy).toHaveBeenCalledTimes(1)
    expect(openSpy).toHaveBeenCalledWith('', '_blank') // sin 'noopener': así devuelve la pestaña
    expect(fakeTab.opener).toBeNull()                  // y se desvincula de la página
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

describe('installStorageLinkHandler — errores', () => {
  it('emite storage:error y no muestra alert si el evento se cancela', async () => {
    createSignedUrl.mockResolvedValue({ data: null, error: new Error('denied') })
    const fakeTab = { location: { href: '' }, close: vi.fn(), opener: null }
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(fakeTab)
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const onError = vi.fn((e) => e.preventDefault())
    window.addEventListener('storage:error', onError)

    document.body.innerHTML = `<a id="l3" ${storageLinkAttrs('ausencias/m1/c.pdf')}>Ver</a>`
    document.getElementById('l3').click()

    await vi.waitFor(() => expect(onError).toHaveBeenCalled())
    expect(alertSpy).not.toHaveBeenCalled()
    window.removeEventListener('storage:error', onError)
    openSpy.mockRestore(); alertSpy.mockRestore(); errSpy.mockRestore()
  })
})
