import { describe, it, expect } from 'vitest'
import { generarPdfNominaConsolidada } from '../generarPdfNominaConsolidada.js'
import { generarCsvNominaConsolidada } from '../generarCsvNominaConsolidada.js'

describe('Nómina Consolidada Docente', () => {
  const maestrosMock = [
    {
      nombre_completo: 'Edelyn Abreu Mejía',
      especialidad: 'Violín',
      telefono: '809-555-1234',
      email: 'edelyn@example.com',
      totalSesiones: 12,
      registradas: 12,
      pendingCount: 0,
      vencidasCount: 0,
      estado: 'solvente',
    },
    {
      nombre_completo: 'Carlos Gómez',
      especialidad: 'Cello',
      telefono: '809-555-5678',
      email: 'carlos@example.com',
      totalSesiones: 10,
      registradas: 8,
      pendingCount: 2,
      vencidasCount: 0,
      estado: 'pendiente',
    },
    {
      nombre_completo: 'Ana Martínez',
      especialidad: 'Flauta',
      telefono: '809-555-9012',
      email: 'ana@example.com',
      totalSesiones: 8,
      registradas: 5,
      pendingCount: 1,
      vencidasCount: 2,
      estado: 'vencida',
    },
  ]

  it('debe generar una instancia de jsPDF landscape con páginas válidas', () => {
    const doc = generarPdfNominaConsolidada(maestrosMock, {
      desde: '2026-08-01',
      hasta: '2026-08-15',
      rangoLabel: '1ra Quincena Agosto 2026',
    })
    expect(doc).toBeDefined()
    expect(doc.internal.pageSize.getWidth()).toBeGreaterThan(doc.internal.pageSize.getHeight()) // Landscape
    expect(doc.internal.getNumberOfPages()).toBeGreaterThanOrEqual(1)
  })

  it('debe generar contenido CSV con BOM UTF-8 y todas las columnas requeridas', () => {
    const csv = generarCsvNominaConsolidada(maestrosMock, {
      desde: '2026-08-01',
      hasta: '2026-08-15',
    })

    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toContain('Docente / Maestro')
    expect(csv).toContain('Edelyn Abreu Mejía')
    expect(csv).toContain('Carlos Gómez')
    expect(csv).toContain('Ana Martínez')
    expect(csv).toContain('SOLVENTE')
    expect(csv).toContain('RESTRINGIDO (PENDIENTES)')
    expect(csv).toContain('BLOQUEADO (VENCIDAS)')
  })
})
