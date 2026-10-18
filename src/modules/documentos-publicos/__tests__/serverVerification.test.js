import { beforeEach, describe, expect, it, vi } from 'vitest'
import { detectSignature as clientDetect } from '../lib/fileValidation.js'
import { detectSignature as serverDetect, verifyObject, MAX_BYTES } from '../../../../supabase/functions/registrar-version-documento/signature.ts'

const PDF = [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]
const JPG = [0xff, 0xd8, 0xff, 0xe0]
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const WEBP = [0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50]
const PATH = (ext) => `11111111-1111-4111-8111-111111111111/22222222-2222-4222-8222-222222222222.${ext}`

const { upload, remove, invoke, rpc } = vi.hoisted(() => ({ upload: vi.fn(), remove: vi.fn(), invoke: vi.fn(), rpc: vi.fn() }))
vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: { rpc, functions: { invoke }, storage: { from: () => ({ upload, remove }) } },
}))

describe('Edge Function: verificación de contenido en servidor', () => {
  it('coincide con la validación del cliente en firmas conocidas, falsas y aleatorias', () => {
    const samples = [PDF, JPG, PNG, WEBP, [0x4d, 0x5a, 0x90, 0], [0x3c, 0x73, 0x76, 0x67], [], [1, 2, 3], [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x41, 0x56, 0x45]]
    for (let i = 0; i < 300; i++) samples.push(Array.from({ length: 16 }, () => Math.floor(Math.random() * 256)))
    for (const s of samples) expect(serverDetect(new Uint8Array(s))).toBe(clientDetect(new Uint8Array(s)))
  })

  it('acepta un PDF real en ruta .pdf', () => {
    expect(verifyObject(new Uint8Array(PDF), PATH('pdf'))).toMatchObject({ ok: true, type: 'pdf', mime: 'application/pdf' })
  })
  it('rechaza un ejecutable con ruta .pdf (el ataque que el cliente no puede impedir)', () => {
    const r = verifyObject(new Uint8Array([0x4d, 0x5a, 0x90, 0, 3, 0, 0, 0]), PATH('pdf'))
    expect(r).toMatchObject({ ok: false, status: 422 })
  })
  it('rechaza contenido válido con extensión distinta, vacío y exceso de tamaño', () => {
    expect(verifyObject(new Uint8Array(PNG), PATH('jpg')).ok).toBe(false)
    expect(verifyObject(new Uint8Array([]), PATH('pdf')).ok).toBe(false)
    const big = new Uint8Array(MAX_BYTES + 1)
    big.set(PDF)
    expect(verifyObject(big, PATH('pdf'))).toMatchObject({ ok: false, status: 413 })
  })
})

describe('subirVersion con verificación en servidor activada', () => {
  const pdf = () => new File([new Uint8Array(PDF)], 'a.pdf', { type: 'application/pdf' })
  const PID = '11111111-1111-4111-8111-111111111111'

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('VITE_DOCS_SERVER_VERIFY', 'true')
    upload.mockResolvedValue({ error: null })
    remove.mockResolvedValue({ error: null })
  })

  it('registra por la Edge Function y nunca por la RPC directa', async () => {
    invoke.mockResolvedValue({ data: { version: { numero: 2 } }, error: null })
    const { subirVersion } = await import('../api/documentosPublicosSupabase.js')
    expect((await subirVersion(PID, pdf(), 'm')).numero).toBe(2)
    expect(invoke).toHaveBeenCalledWith('registrar-version-documento', { body: expect.objectContaining({ publicacion_id: PID, motivo: 'm' }) })
    expect(rpc).not.toHaveBeenCalled()
  })

  it('propaga el motivo de rechazo del servidor', async () => {
    invoke.mockResolvedValue({ data: null, error: { message: 'Edge Function returned a non-2xx status code', context: { json: async () => ({ error: 'El contenido no es PDF, JPG, PNG ni WebP válido' }) } } })
    const { subirVersion } = await import('../api/documentosPublicosSupabase.js')
    await expect(subirVersion(PID, pdf())).rejects.toThrow('El contenido no es PDF')
  })
})
