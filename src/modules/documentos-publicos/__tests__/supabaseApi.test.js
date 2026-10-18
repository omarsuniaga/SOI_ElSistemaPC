import { beforeEach, describe, expect, it, vi } from 'vitest'

const upload = vi.fn()
const remove = vi.fn()
const createSignedUrl = vi.fn()
const rpc = vi.fn()
const from = vi.fn()
const storageFrom = vi.fn(() => ({ upload, remove, createSignedUrl }))
vi.mock('../../../lib/supabaseClient.js', () => ({ supabase: { rpc, from, storage: { from: storageFrom } } }))

const api = await import('../api/documentosPublicosSupabase.js')

const pdf = () => new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31])], 'a.pdf', { type: 'application/pdf' })
const PID = '11111111-1111-4111-8111-111111111111'

describe('documentosPublicosSupabase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    remove.mockResolvedValue({ error: null })
  })

  it('sube al bucket exclusivo con ruta <id>/<uuid>.pdf, sin upsert, y luego registra la versión por RPC', async () => {
    upload.mockResolvedValue({ error: null })
    rpc.mockResolvedValue({ data: { numero: 1 }, error: null })
    await api.subirVersion(PID, pdf(), 'inicial')
    expect(storageFrom).toHaveBeenCalledWith('soi-publico')
    const [path, , opts] = upload.mock.calls[0]
    expect(path).toMatch(new RegExp(`^${PID}/[0-9a-f-]{36}\\.pdf$`))
    expect(opts).toMatchObject({ upsert: false, contentType: 'application/pdf' })
    expect(rpc).toHaveBeenCalledWith('registrar_version_documento', expect.objectContaining({
      p_publicacion_id: PID, p_storage_path: path, p_mime: 'application/pdf', p_size: 6, p_motivo: 'inicial',
    }))
    expect(rpc.mock.calls[0][1].p_sha256).toMatch(/^[0-9a-f]{64}$/)
    expect(from).not.toHaveBeenCalled()
  })

  it('no sube nada si el contenido es inválido', async () => {
    const fake = new File([new Uint8Array([0x4d, 0x5a, 0, 0])], 'a.pdf', { type: 'application/pdf' })
    await expect(api.subirVersion(PID, fake)).rejects.toThrow()
    expect(upload).not.toHaveBeenCalled()
  })

  it('intenta limpiar el archivo si el registro de la versión falla', async () => {
    upload.mockResolvedValue({ error: null })
    rpc.mockResolvedValue({ data: null, error: { message: 'No autorizado' } })
    await expect(api.subirVersion(PID, pdf())).rejects.toThrow('No autorizado')
    expect(remove).toHaveBeenCalledWith([upload.mock.calls[0][0]])
  })

  it('las mutaciones administrativas usan solo RPC (nunca DML directo)', async () => {
    rpc.mockResolvedValue({ data: {}, error: null })
    await api.crearPublicacion({ titulo: 'Titulo', categoria: 'general' })
    await api.actualizarPublicacion(PID, { titulo: 'Titulo' })
    await api.cambiarEstado(PID, 'publicado')
    await api.activarVersion(PID, PID)
    expect(rpc.mock.calls.map((c) => c[0])).toEqual([
      'crear_publicacion_documento', 'actualizar_publicacion_documento',
      'cambiar_estado_publicacion_documento', 'activar_version_documento',
    ])
    expect(from).not.toHaveBeenCalled()
  })

  it('la lectura pública usa la RPC y una URL firmada de 5 minutos', async () => {
    rpc.mockResolvedValue({ data: [{ slug: 'abc123def0', storage_path: 'x/y.pdf' }], error: null })
    expect((await api.obtenerPublicacionPublica('abc123def0')).storage_path).toBe('x/y.pdf')
    expect(rpc).toHaveBeenCalledWith('obtener_publicacion_publica', { p_slug: 'abc123def0' })
    createSignedUrl.mockResolvedValue({ data: { signedUrl: 'https://s/u' }, error: null })
    await api.urlArchivoPublico('x/y.pdf', { download: 'n.pdf' })
    expect(createSignedUrl).toHaveBeenCalledWith('x/y.pdf', 300, { download: 'n.pdf' })
  })

  it('devuelve null si la publicación no está publicada', async () => {
    rpc.mockResolvedValue({ data: [], error: null })
    expect(await api.obtenerPublicacionPublica('abc123def0')).toBeNull()
  })
})
