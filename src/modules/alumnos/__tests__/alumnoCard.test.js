import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createAlumnoCard, createAlumnoListItem } from '../components/alumnoCard.js'

// Mock calcularEdad from domain
vi.mock('../domain/calcularEdad.js', () => ({
  calcularEdad: vi.fn(() => 10),
}))

describe('alumnoCard', () => {
  const baseAlumno = {
    id: '1',
    nombre: 'Ana García',
    email: 'ana@test.com',
    cedula: '001-1234567-8',
    is_active: true,
    instrumento_principal: 'Violín',
    familiar_nombre: 'María García',
    fecha_nacimiento: '2014-06-15',
    created_at: '2026-01-10',
  }

  describe('createAlumnoCard', () => {
    it('renders nombre not name', () => {
      const card = createAlumnoCard(baseAlumno, false)
      expect(card.innerHTML).toContain('Ana García')
      expect(card.innerHTML).not.toContain('alumno.name')
    })

    it('active badge uses is_active', () => {
      const card = createAlumnoCard(baseAlumno, false)
      expect(card.innerHTML).toContain('Activo')

      const inactive = createAlumnoCard({ ...baseAlumno, is_active: false }, false)
      expect(inactive.innerHTML).toContain('Inactivo')
    })

    it('uses instrumento_principal for section display', () => {
      const card = createAlumnoCard(baseAlumno, false)
      expect(card.innerHTML).toContain('Violín')
      expect(card.innerHTML).not.toContain('alumno.section')
    })

    it('uses familiar_nombre for acudiente display', () => {
      const card = createAlumnoCard(baseAlumno, false)
      expect(card.innerHTML).toContain('María García')
      expect(card.innerHTML).not.toContain('alumno.acudiente')
    })

    it('getInitials returns 2 chars for any nombre', () => {
      const singleName = createAlumnoCard({ ...baseAlumno, nombre: 'Pedro' }, false)
      const initials = singleName.querySelector('.avatar strong')?.textContent
      expect(initials?.length).toBe(2)

      const fullName = createAlumnoCard({ ...baseAlumno, nombre: 'María José López' }, false)
      const initials2 = fullName.querySelector('.avatar strong')?.textContent
      expect(initials2?.length).toBe(2)
    })
  })

  describe('createAlumnoListItem', () => {
    it('renders nombre not name', () => {
      const li = createAlumnoListItem(baseAlumno)
      expect(li.innerHTML).toContain('Ana García')
      expect(li.innerHTML).not.toContain('alumno.name')
    })

    it('active badge uses is_active', () => {
      const li = createAlumnoListItem(baseAlumno)
      expect(li.innerHTML).toContain('Activo')
    })
  })
})
