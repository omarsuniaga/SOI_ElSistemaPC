import { describe, it, expect, vi } from 'vitest'
import { generarPdfHistoricoMaestro } from '../generarPdfHistoricoMaestro.js'
import { generarHtmlHistoricoMaestro } from '../generarHtmlHistoricoMaestro.js'

describe('Histórico de Clases del Maestro — Domain Exporters', () => {
  const dummyMaestro = {
    id: 'm-123',
    nombre: 'Edelyn Abreu Mejía',
    email: 'edelyn@elsistema.do',
    telefono: '809-555-1234',
    instrumento: 'Violín',
    is_active: true,
  }

  const dummySesiones = [
    {
      id: 'ses-1',
      fecha: '2026-05-10',
      horaInicio: '14:00:00',
      horaFin: '15:30:00',
      claseId: 'c-1',
      claseNombre: 'Cátedra de Violín Avanzado',
      salonNombre: 'Salón 102',
      esSuplencia: false,
      contenido: 'Trabajo de afinación y escalas en tercera posición. Concierto de Vivaldi en La Menor.',
      presentes: 2,
      ausentes: 1,
      justificados: 1,
      totalRegistros: 4,
      roster: [
        { alumnoId: 'a-1', nombre: 'Carlos Santana', estado: 'P', motivo: null },
        { alumnoId: 'a-2', nombre: 'Ana Gómez', estado: 'P', motivo: null },
        { alumnoId: 'a-3', nombre: 'Pedro Martínez', estado: 'A', motivo: null },
        { alumnoId: 'a-4', nombre: 'Lucía Fernández', estado: 'J', motivo: 'Cita médica odontológica programada' },
      ],
    },
    {
      id: 'ses-2',
      fecha: '2026-05-12',
      horaInicio: '09:00:00',
      horaFin: '10:30:00',
      claseId: 'c-2',
      claseNombre: 'Ensamble de Cuerdas',
      salonNombre: 'Auditorio Principal',
      esSuplencia: true,
      contenido: 'Ensayo general de sección de cuerdas para gala semestral.',
      presentes: 3,
      ausentes: 0,
      justificados: 0,
      totalRegistros: 3,
      roster: [
        { alumnoId: 'a-1', nombre: 'Carlos Santana', estado: 'P', motivo: null },
        { alumnoId: 'a-2', nombre: 'Ana Gómez', estado: 'P', motivo: null },
        { alumnoId: 'a-5', nombre: 'Marcos Díaz', estado: 'P', motivo: null },
      ],
    },
  ]

  describe('generarPdfHistoricoMaestro', () => {
    it('debe generar una instancia de jsPDF con páginas y tablas de sesiones', () => {
      const doc = generarPdfHistoricoMaestro(dummyMaestro, dummySesiones, {
        rangoLabel: 'Últimos 30 días',
        claseLabel: 'Todas las clases',
      })

      expect(doc).toBeDefined()
      expect(typeof doc.save).toBe('function')
      // 1 página de resumen + 2 páginas de detalle por sesión = 3 páginas
      expect(doc.internal.getNumberOfPages()).toBe(3)
    })

    it('debe manejar lista vacía de sesiones sin errores', () => {
      const doc = generarPdfHistoricoMaestro(dummyMaestro, [], {
        rangoLabel: 'Últimos 7 días',
      })

      expect(doc).toBeDefined()
      expect(doc.internal.getNumberOfPages()).toBe(1)
    })
  })

  describe('generarHtmlHistoricoMaestro', () => {
    it('debe generar un HTML completo con metadatos del maestro, contenido y justificaciones', () => {
      const html = generarHtmlHistoricoMaestro(dummyMaestro, dummySesiones, {
        rangoLabel: 'Últimos 30 días',
        claseLabel: 'Todas las clases',
      })

      expect(html).toContain('HISTÓRICO ACADÉMICO DE CLASES DEL DOCENTE')
      expect(html).toContain('Edelyn Abreu Mejía')
      expect(html).toContain('Cátedra de Violín Avanzado')
      expect(html).toContain('Cita médica odontológica programada')
      expect(html).toContain('Lucía Fernández')
      expect(html).toContain('Trabajo de afinación y escalas')
      expect(html).toContain('Ensamble de Cuerdas')
      expect(html).toContain('Suplencia')
    })

    it('debe manejar lista vacía de sesiones mostrando mensaje de advertencia', () => {
      const html = generarHtmlHistoricoMaestro(dummyMaestro, [], {
        rangoLabel: 'Últimos 7 días',
      })

      expect(html).toContain('No se encontraron sesiones registradas')
      expect(html).toContain('Edelyn Abreu Mejía')
    })
  })
})
