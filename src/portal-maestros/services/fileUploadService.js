/**
 * fileUploadService.js
 * Handles file uploads for the portal-maestros module.
 * Mirrors the planningDocService pattern.
 */

import { supabase } from '../../lib/supabaseClient.js'

const STORAGE_BUCKET = 'documentos'
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png'])

// ---------------------------------------------------------------------------
// Typed error classes
// ---------------------------------------------------------------------------

export class FileTooLargeError extends Error {
  constructor() {
    super('El archivo no debe superar 5 MB.')
    this.name = 'FileTooLargeError'
  }
}

export class InvalidMimeError extends Error {
  constructor() {
    super('Solo se aceptan archivos PDF, JPG o PNG.')
    this.name = 'InvalidMimeError'
  }
}

export class UploadError extends Error {
  /**
   * @param {string} message
   * @param {Error} [cause]
   */
  constructor(message, cause) {
    super(message)
    this.name = 'UploadError'
    if (cause) this.cause = cause
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Derives the file extension from a MIME type.
 *
 * @param {string} mimeType
 * @returns {string} Extension without leading dot (e.g. "pdf", "jpg", "png")
 */
function extFromMime(mimeType) {
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType === 'image/jpeg') return 'jpg'
  if (mimeType === 'image/png') return 'png'
  return 'bin'
}

/**
 * Generates a short random alphanumeric id (8 chars).
 *
 * @returns {string}
 */
function randomId() {
  return Math.random().toString(36).slice(2, 10)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Uploads an absence support document to Supabase Storage.
 *
 * @param {File} file - The file to upload
 * @param {string} maestroId - The teacher's ID (used in the storage path)
 * @returns {Promise<{ publicUrl: string, fileName: string, uploadedAt: string }>}
 * @throws {FileTooLargeError} When file exceeds 5 MB
 * @throws {InvalidMimeError} When file MIME type is not PDF, JPG, or PNG
 * @throws {UploadError} When the Supabase upload fails
 */
export async function uploadAbsenceDoc(file, maestroId) {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new FileTooLargeError()
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new InvalidMimeError()
  }

  const ext = extFromMime(file.type)
  const timestamp = Date.now()
  const rand = randomId()
  const path = `ausencias/${timestamp}_${maestroId}_${rand}.${ext}`

  let uploadError
  try {
    const result = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, { contentType: file.type })
    uploadError = result.error
  } catch (err) {
    throw new UploadError('Error al subir el archivo.', err)
  }

  if (uploadError) {
    throw new UploadError(uploadError.message || 'Error al subir el archivo.', uploadError)
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)

  return {
    publicUrl: data.publicUrl,
    fileName: file.name,
    uploadedAt: new Date().toISOString(),
  }
}
