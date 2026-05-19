/**
 * fileUploadService — Handles file uploads for absence support documents.
 * Supports PDF, JPG, PNG up to 5MB.
 */

import { supabase } from '../../lib/supabaseClient.js';

const MAX_FILE_SIZE = 5_000_000; // 5MB
const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const UPLOAD_BUCKET = 'ausencias-docs';

export class FileTooLargeError extends Error {
  constructor() {
    super('El archivo supera el tamaño máximo permitido de 5MB.');
    this.name = 'FileTooLargeError';
  }
}

export class InvalidMimeError extends Error {
  constructor() {
    super('Tipo de archivo no permitido. Usa PDF, JPG o PNG.');
    this.name = 'InvalidMimeError';
  }
}

export class UploadError extends Error {
  constructor(message) {
    super(message ?? 'Error al subir el archivo. Intenta de nuevo.');
    this.name = 'UploadError';
  }
}

export const fileUploadService = {
  /**
   * Upload an absence support document for a teacher.
   * @param {File} file
   * @param {string} maestroId
   * @returns {Promise<{ url: string }>}
   */
  async uploadAbsenceDoc(file, maestroId) {
    if (file.size > MAX_FILE_SIZE) throw new FileTooLargeError();
    if (!ALLOWED_MIME_TYPES.has(file.type)) throw new InvalidMimeError();

    const ext = file.name.split('.').pop();
    const path = `${maestroId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from(UPLOAD_BUCKET)
      .upload(path, file, { upsert: false });

    if (error) throw new UploadError(error.message);

    const { data } = supabase.storage.from(UPLOAD_BUCKET).getPublicUrl(path);
    return { url: data.publicUrl };
  },
};
