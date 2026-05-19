import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    storage: {
      from: vi.fn(),
    },
  },
}))

import { supabase } from '../../../lib/supabaseClient.js'
import { uploadAbsenceDoc } from '../fileUploadService.js'

/** Helper: create a File-like object accepted by jsdom */
function makeFile(name, type, sizeBytes) {
  const content = new Uint8Array(sizeBytes).fill(65) // 'A' bytes
  const file = new File([content], name, { type })
  return file
}

describe('fileUploadService.uploadAbsenceDoc', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws FileTooLargeError when file exceeds 5 MB', async () => {
    const bigFile = makeFile('big.pdf', 'application/pdf', 6 * 1024 * 1024)
    await expect(uploadAbsenceDoc(bigFile, 'maestro-1')).rejects.toMatchObject({
      name: 'FileTooLargeError',
    })
  })

  it('throws InvalidMimeError for unsupported file type (.docx)', async () => {
    const docx = makeFile('doc.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 100)
    await expect(uploadAbsenceDoc(docx, 'maestro-1')).rejects.toMatchObject({
      name: 'InvalidMimeError',
    })
  })

  it('throws InvalidMimeError for .exe files', async () => {
    const exe = makeFile('virus.exe', 'application/x-msdownload', 100)
    await expect(uploadAbsenceDoc(exe, 'maestro-1')).rejects.toMatchObject({
      name: 'InvalidMimeError',
    })
  })

  it('accepts a valid PDF under 5 MB and returns publicUrl + metadata', async () => {
    const pdf = makeFile('soporte.pdf', 'application/pdf', 1024)
    const mockUpload = vi.fn().mockResolvedValue({ error: null })
    const mockGetPublicUrl = vi.fn().mockReturnValue({
      data: { publicUrl: 'https://cdn.test/ausencias/file.pdf' },
    })
    supabase.storage.from.mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
    })

    const result = await uploadAbsenceDoc(pdf, 'maestro-1')

    expect(result.publicUrl).toBe('https://cdn.test/ausencias/file.pdf')
    expect(result.fileName).toContain('soporte.pdf')
    expect(result.uploadedAt).toBeDefined()
  })

  it('accepts a valid JPG under 5 MB', async () => {
    const jpg = makeFile('foto.jpg', 'image/jpeg', 2048)
    const mockUpload = vi.fn().mockResolvedValue({ error: null })
    const mockGetPublicUrl = vi.fn().mockReturnValue({
      data: { publicUrl: 'https://cdn.test/ausencias/foto.jpg' },
    })
    supabase.storage.from.mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
    })

    const result = await uploadAbsenceDoc(jpg, 'maestro-2')
    expect(result.publicUrl).toContain('cdn.test')
  })

  it('upload path matches ausencias/{timestamp}_{maestroId}_{rand}.{ext} pattern', async () => {
    const pdf = makeFile('doc.pdf', 'application/pdf', 512)
    let capturedPath = ''
    const mockUpload = vi.fn().mockImplementation((path) => {
      capturedPath = path
      return Promise.resolve({ error: null })
    })
    const mockGetPublicUrl = vi.fn().mockReturnValue({
      data: { publicUrl: 'https://cdn.test/path' },
    })
    supabase.storage.from.mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
    })

    await uploadAbsenceDoc(pdf, 'maestro-99')

    expect(capturedPath).toMatch(/^ausencias\/\d+_maestro-99_[a-z0-9]+\.pdf$/)
  })

  it('throws UploadError when Supabase storage returns an error', async () => {
    const pdf = makeFile('fail.pdf', 'application/pdf', 512)
    supabase.storage.from.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: new Error('Storage quota exceeded') }),
      getPublicUrl: vi.fn(),
    })

    await expect(uploadAbsenceDoc(pdf, 'maestro-1')).rejects.toMatchObject({
      name: 'UploadError',
    })
  })

  it('throws UploadError when upload rejects (network failure)', async () => {
    const pdf = makeFile('net.pdf', 'application/pdf', 512)
    supabase.storage.from.mockReturnValue({
      upload: vi.fn().mockRejectedValue(new Error('Network error')),
      getPublicUrl: vi.fn(),
    })

    await expect(uploadAbsenceDoc(pdf, 'maestro-1')).rejects.toBeDefined()
  })
})
