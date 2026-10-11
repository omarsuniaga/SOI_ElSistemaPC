// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { showEvidenciaPreviewModal } from '../EvidenciaPreviewModal.js'

describe('EvidenciaPreviewModal', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    document.getElementById('pm-evidencia-preview-modal')?.remove()
  })

  afterEach(() => {
    document.getElementById('pm-evidencia-preview-modal')?.remove()
  })

  it('no hace nada si url está vacía o es null', () => {
    const res = showEvidenciaPreviewModal({ url: null })
    expect(res).toBeNull()
    expect(document.getElementById('pm-evidencia-preview-modal')).toBeNull()
  })

  it('muestra la imagen y los datos del alumno y motivo', () => {
    const modal = showEvidenciaPreviewModal({
      url: 'https://test.co/receta.jpg',
      alumnoNombre: 'Carlos Santana',
      motivo: 'Consulta médica',
    })

    expect(modal).not.toBeNull()
    const img = modal.querySelector('img.pm-evidencia-img')
    expect(img).not.toBeNull()
    expect(img.src).toBe('https://test.co/receta.jpg')
    expect(modal.textContent).toContain('Carlos Santana')
    expect(modal.textContent).toContain('Consulta médica')
  })

  it('renderiza vista PDF cuando la url termina en .pdf', () => {
    const modal = showEvidenciaPreviewModal({
      url: 'https://test.co/informe.pdf',
      alumnoNombre: 'María Teresa',
      motivo: 'Examen de admisión',
    })

    expect(modal).not.toBeNull()
    expect(modal.querySelector('img.pm-evidencia-img')).toBeNull()
    expect(modal.querySelector('.pm-evidencia-pdf')).not.toBeNull()
    expect(modal.textContent).toContain('Documento PDF adjunto')
  })

  it('cierra el modal al hacer click en el botón de cerrar', () => {
    showEvidenciaPreviewModal({
      url: 'https://test.co/receta.jpg',
      alumnoNombre: 'Carlos Santana',
    })

    const closeBtn = document.getElementById('pm-evidencia-close')
    expect(closeBtn).not.toBeNull()
    closeBtn.click()

    expect(document.getElementById('pm-evidencia-preview-modal')).toBeNull()
  })

  it('cierra el modal al hacer click en el backdrop', () => {
    showEvidenciaPreviewModal({
      url: 'https://test.co/receta.jpg',
      alumnoNombre: 'Carlos Santana',
    })

    const backdrop = document.querySelector('.pm-evidencia-backdrop')
    expect(backdrop).not.toBeNull()
    backdrop.click()

    expect(document.getElementById('pm-evidencia-preview-modal')).toBeNull()
  })

  it('cierra el modal al presionar Escape y detiene la propagación', () => {
    showEvidenciaPreviewModal({
      url: 'https://test.co/receta.jpg',
      alumnoNombre: 'Carlos Santana',
    })

    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    window.dispatchEvent(event)

    expect(document.getElementById('pm-evidencia-preview-modal')).toBeNull()
  })
})
