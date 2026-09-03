import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../styles/clasesHoy.css', () => ({}))
vi.mock('../../../shared/components/AppModal.js', () => ({
  AppModal: { open: vi.fn(), close: vi.fn() },
}))
vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: { success: vi.fn(), error: vi.fn() },
}))
vi.mock('../../../core/router/router.js', () => ({
  router: { navigate: vi.fn() },
}))

vi.mock('../../api/clasesHoyApi.js', () => ({
  obtenerClasesDelDia: vi.fn(),
  obtenerDiaActual: () => 'lunes',
  DIAS_SEMANA: [
    { value: 'lunes', label: 'Lun', labelLargo: 'Lunes' },
    { value: 'martes', label: 'Mar', labelLargo: 'Martes' },
  ],
  COMPLIANCE_META: {
    VERDE: { color: '#198754' },
    AMARILLO: { color: '#ffc107' },
    ROJO: { color: '#dc3545' },
  },
}))

import { renderClasesHoyView } from '../clasesHoyView.js'
import { obtenerClasesDelDia } from '../../api/clasesHoyApi.js'
import fs from 'fs'
import path from 'path'

describe('clasesHoyView - 4 Cards Per Row on Desktop', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()
  })

  it('verifies that clasesHoy.css specifies 4 columns on desktop (min-width: 992px and 1400px)', () => {
    const cssPath = path.resolve(__dirname, '../../styles/clasesHoy.css')
    const cssContent = fs.readFileSync(cssPath, 'utf-8')

    // Expect grid to have 4 columns at 992px
    expect(cssContent).toMatch(/@media\s*\(min-width:\s*992px\)\s*\{\s*\.clases-hoy__grid\s*\{\s*grid-template-columns:\s*repeat\(4,\s*1fr\);/)
    // Expect grid to maintain 4 columns at 1400px
    expect(cssContent).toMatch(/@media\s*\(min-width:\s*1400px\)\s*\{\s*\.clases-hoy__grid\s*\{\s*grid-template-columns:\s*repeat\(4,\s*1fr\);/)
  })

  it('renders cards inside .clases-hoy__grid container correctly', async () => {
    obtenerClasesDelDia.mockResolvedValue({
      dia: 'lunes',
      kpis: {
        totalClases: 4,
        enCursoAhora: 1,
        totalAlumnos: 25,
        salonesOcupados: 2,
        justificadosHoy: 0,
        asistenciaPendiente: 0,
      },
      sesiones: [
        {
          claseId: 'c1',
          nombre: 'Iniciación Musical A',
          instrumento: 'Flauta Dulce',
          nivel: 1,
          horaInicio: '08:00',
          horaFin: '09:30',
          estado: 'en-curso',
          maestroTitular: { nombre_completo: 'Laura Méndez' },
          salon: { nombre: 'Salón 1' },
          alumnos: [{ id: 'a1', nombre_completo: 'Carlos Ruiz' }],
          totalAlumnos: 8,
          capacidadMaxima: 12,
          justificadosCount: 0,
          pendienteAsistencia: null,
        },
        {
          claseId: 'c2',
          nombre: 'Cátedra de Violín I',
          instrumento: 'Violín',
          nivel: 2,
          horaInicio: '09:45',
          horaFin: '11:15',
          estado: 'proxima',
          maestroTitular: { nombre_completo: 'Roberto Silva' },
          salon: { nombre: 'Salón 2' },
          alumnos: [],
          totalAlumnos: 6,
          capacidadMaxima: 10,
          justificadosCount: 0,
          pendienteAsistencia: null,
        },
        {
          claseId: 'c3',
          nombre: 'Coro Infantil',
          instrumento: 'Vocal',
          nivel: 1,
          horaInicio: '14:00',
          horaFin: '15:30',
          estado: 'futura',
          maestroTitular: { nombre_completo: 'Elena Peña' },
          salon: { nombre: 'Salón Principal' },
          alumnos: [],
          totalAlumnos: 15,
          capacidadMaxima: 20,
          justificadosCount: 0,
          pendienteAsistencia: null,
        },
        {
          claseId: 'c4',
          nombre: 'Ensamble de Percusión',
          instrumento: 'Percusión',
          nivel: 3,
          horaInicio: '16:00',
          horaFin: '17:30',
          estado: 'futura',
          maestroTitular: { nombre_completo: 'David Rojas' },
          salon: { nombre: 'Salón 3' },
          alumnos: [],
          totalAlumnos: 10,
          capacidadMaxima: 12,
          justificadosCount: 0,
          pendienteAsistencia: null,
        },
      ],
    })

    await renderClasesHoyView(container)

    const grid = container.querySelector('.clases-hoy__grid')
    expect(grid).not.toBeNull()

    const cards = grid.querySelectorAll('.clases-hoy__card')
    expect(cards.length).toBe(4)

    // Verify card contents
    expect(cards[0].textContent).toContain('Iniciación Musical A')
    expect(cards[0].textContent).toContain('Laura Méndez')
    expect(cards[0].textContent).toContain('Salón 1')

    expect(cards[1].textContent).toContain('Cátedra de Violín I')
    expect(cards[2].textContent).toContain('Coro Infantil')
    expect(cards[3].textContent).toContain('Ensamble de Percusión')
  })
})
