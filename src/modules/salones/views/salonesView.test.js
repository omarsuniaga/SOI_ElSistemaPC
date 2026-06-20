import { beforeEach, describe, expect, it, vi } from 'vitest'
import { obtenerUsoSalones } from '../api/salonesApi.js'
import { descargarPdfUsoSalones } from '../domain/generarPdfUsoSalones.js'
import { useSalones } from '../hooks/useSalones.js'
import { renderSalonesView } from './salonesView.js'

vi.mock('../api/salonesApi.js', () => ({
  obtenerUsoSalones: vi.fn(),
  crearSalon: vi.fn(),
  actualizarSalon: vi.fn(),
  eliminarSalon: vi.fn(),
}))

vi.mock('../domain/generarPdfUsoSalones.js', () => ({
  descargarPdfUsoSalones: vi.fn(),
}))

vi.mock('../hooks/useSalones.js', () => ({
  useSalones: {
    salones: [
      { id: 'salon-1', nombre: 'Sal?n Bach', capacidad: 12, piso: 1, condicion: 'buena', ubicacion: '', codigo: 'BACH' },
    ],
    cargando: false,
    error: null,
    subscribe: vi.fn(() => vi.fn()),
    fetchSalones: vi.fn(),
    getFiltered: vi.fn(() => [
      { id: 'salon-1', nombre: 'Sal?n Bach', capacidad: 12, piso: 1, condicion: 'buena', ubicacion: '', codigo: 'BACH' },
    ]),
  },
}))

vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}))

vi.mock('../../../shared/components/AppModal.js', () => ({
  AppModal: {
    open: vi.fn(),
    close: vi.fn(),
  },
}))

describe('salonesView PDF usage button', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('renders the PDF Uso de Salones button in the Salones header', () => {
    const container = document.createElement('div')
    renderSalonesView(container)

    const button = container.querySelector('#btnPdfUsoSalones')
    expect(button).toBeTruthy()
    expect(button.textContent).toContain('PDF Uso de Salones')
  })

  it('generates the room usage PDF for the visible rooms', async () => {
    obtenerUsoSalones.mockResolvedValue({
      'salon-1': [
        { dia: 'lunes', hora_inicio: '08:00', hora_fin: '09:00', clase_nombre: 'Piano', maestro_nombre: 'Ana' },
      ],
    })

    const container = document.createElement('div')
    renderSalonesView(container)

    container.querySelector('#btnPdfUsoSalones').click()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(useSalones.getFiltered).toHaveBeenCalled()
    expect(obtenerUsoSalones).toHaveBeenCalledWith(['salon-1'])
    expect(descargarPdfUsoSalones).toHaveBeenCalledWith([
      expect.objectContaining({
        salon: expect.objectContaining({ id: 'salon-1', nombre: 'Sal?n Bach' }),
        usos: [expect.objectContaining({ clase_nombre: 'Piano' })],
      }),
    ])
  })
})
