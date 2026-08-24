import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * misClasesView.test.js
 *
 * "Mis Clases Dadas": historial del maestro con el contenido tal cual lo
 * registró, asistencia y metadatos de cada sesión confirmada. Cubre:
 * - Solo se muestran sesiones confirmadas (borrador === false).
 * - El contenido se muestra literal, sin escapar de más ni de menos.
 * - Los conteos P/A/J salen del JSONB `asistencia` de sesiones_clase.
 * - El filtro por clase excluye sesiones de otras clases.
 */

vi.mock('../../auth/maestroAuth.js', () => ({
  getMaestroLocal: vi.fn(() => ({ id: 'maestro-1' })),
}))

const mockGetMisClases = vi.fn()
const mockGetSesiones = vi.fn()
const mockGetSalones = vi.fn(() => Promise.resolve([]))

vi.mock('../../services/maestroDataService.js', () => ({
  getMisClases: (...args) => mockGetMisClases(...args),
  getSesiones: (...args) => mockGetSesiones(...args),
  getSalones: (...args) => mockGetSalones(...args),
}))

import { renderMisClasesView } from '../misClasesView.js'

const CLASES = [
  { id: 'clase-1', nombre: 'Violín 101' },
  { id: 'clase-2', nombre: 'Cello 201' },
]

function sesionBase(overrides) {
  return {
    id: 's1',
    fecha: '2026-08-20',
    hora_inicio: '14:00:00',
    hora_fin: '15:00:00',
    clase_id: 'clase-1',
    salon_id: null,
    borrador: false,
    contenido: '#Ana [Escalas] práctica de vibrato',
    asistencia: [
      { alumno_id: 'a1', estado: 'P' },
      { alumno_id: 'a2', estado: 'A' },
      { alumno_id: 'a3', estado: 'J' },
    ],
    ...overrides,
  }
}

describe('misClasesView', () => {
  let container

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetMisClases.mockResolvedValue(CLASES)
    mockGetSalones.mockResolvedValue([])
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container?.remove()
  })

  it('muestra el contenido de la sesión literal, sin reformatear', async () => {
    mockGetSesiones.mockResolvedValue([sesionBase({})])

    await renderMisClasesView(container)

    expect(container.textContent).toContain('#Ana [Escalas] práctica de vibrato')
  })

  it('escapa HTML en el contenido para evitar inyección', async () => {
    mockGetSesiones.mockResolvedValue([
      sesionBase({ contenido: '<img src=x onerror=alert(1)>' }),
    ])

    await renderMisClasesView(container)

    expect(container.innerHTML).not.toContain('<img src=x')
    expect(container.textContent).toContain('<img src=x onerror=alert(1)>')
  })

  it('excluye las sesiones en borrador — no son "clases dadas" todavía', async () => {
    mockGetSesiones.mockResolvedValue([
      sesionBase({ id: 's1', borrador: false, contenido: 'confirmada' }),
      sesionBase({ id: 's2', borrador: true, contenido: 'todavia-en-borrador' }),
    ])

    await renderMisClasesView(container)

    expect(container.textContent).toContain('confirmada')
    expect(container.textContent).not.toContain('todavia-en-borrador')
  })

  it('calcula presentes/ausentes/justificados desde el JSONB de asistencia', async () => {
    mockGetSesiones.mockResolvedValue([sesionBase({})])

    await renderMisClasesView(container)

    expect(container.textContent).toContain('1 P')
    expect(container.textContent).toContain('1 A')
    expect(container.textContent).toContain('1 J')
  })

  it('muestra un aviso cuando la sesión no tiene contenido registrado', async () => {
    mockGetSesiones.mockResolvedValue([sesionBase({ contenido: null })])

    await renderMisClasesView(container)

    expect(container.textContent).toContain('Sin contenido registrado')
  })

  it('muestra estado vacío cuando no hay sesiones confirmadas en el rango', async () => {
    mockGetSesiones.mockResolvedValue([])

    await renderMisClasesView(container)

    expect(container.textContent).toContain('No hay clases registradas en este rango')
  })

  it('sin sesión de maestro activa, muestra mensaje y no consulta datos', async () => {
    const { getMaestroLocal } = await import('../../auth/maestroAuth.js')
    getMaestroLocal.mockReturnValueOnce(null)

    await renderMisClasesView(container)

    expect(container.textContent).toContain('No hay sesión activa')
    expect(mockGetSesiones).not.toHaveBeenCalled()
  })

  it('filtra por clase cuando el maestro cambia el selector', async () => {
    mockGetSesiones.mockResolvedValue([
      sesionBase({ id: 's1', clase_id: 'clase-1', contenido: 'contenido-violin' }),
      sesionBase({ id: 's2', clase_id: 'clase-2', contenido: 'contenido-cello' }),
    ])

    await renderMisClasesView(container)
    expect(container.textContent).toContain('contenido-violin')
    expect(container.textContent).toContain('contenido-cello')

    const selectClase = container.querySelector('#pm-misclases-clase')
    selectClase.value = 'clase-1'
    selectClase.dispatchEvent(new Event('change'))
    await new Promise((resolve) => setTimeout(resolve, 0))
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(container.textContent).toContain('contenido-violin')
    expect(container.textContent).not.toContain('contenido-cello')
  })
})
