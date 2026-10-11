import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  },
}))

vi.mock('../../auth/maestroAuth.js', () => ({
  getMaestroLocal: vi.fn().mockReturnValue({ id: 'm-123' }),
  detectarRolMaestro: vi.fn().mockResolvedValue({ id: 'm-123' }),
}))

vi.mock('../../shared/components/AppToast.js', () => ({
  AppToast: {
    info: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}))

vi.mock('../services/maestroRouteService.js', () => ({
  getTeacherRoutes: vi.fn().mockResolvedValue([]),
  createRoute: vi.fn().mockResolvedValue({ id: 'new-r' }),
  updateRoute: vi.fn().mockResolvedValue({ id: 'r-1' }),
  cloneRoute: vi.fn().mockResolvedValue({ id: 'cloned-r' }),
}))

vi.mock('../services/maestroDataService.js', () => ({
  getMisClases: vi.fn().mockResolvedValue([]),
}))

import { openTeacherRouteBuilder } from '../TeacherRouteBuilder.js'

describe('TeacherRouteBuilder — bug regression: Cannot read properties of undefined (reading _localId)', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  it('no lanza error al hacer click en quitar unidad (.trb-remove-unidad)', async () => {
    const route = {
      id: 'r-1',
      nombre: 'Violín Básico',
      unidades: [
        {
          id: 'u-1',
          nombre: 'Unidad 1',
          objetivos: [
            {
              id: 'o-1',
              nombre: 'Objetivo 1',
              indicadores: [{ id: 'i-1', nombre: 'Indicador 1' }],
            },
          ],
        },
      ],
    }

    await openTeacherRouteBuilder({ maestroId: 'm-123', claseId: 'c-1', route })

    const removeBtn = document.querySelector('.trb-remove-unidad')
    expect(removeBtn).toBeTruthy()

    // El click en quitar unidad no debe lanzar error ni propagar a toggle-unidad con índice inválido
    expect(() => {
      removeBtn.click()
    }).not.toThrow()

    // La unidad fue removida
    const unidades = document.querySelectorAll('.trb-unidad')
    expect(unidades.length).toBe(0)
  })

  it('no lanza error al hacer click en quitar objetivo (.trb-remove-objetivo)', async () => {
    const route = {
      id: 'r-1',
      nombre: 'Violín Básico',
      unidades: [
        {
          id: 'u-1',
          nombre: 'Unidad 1',
          objetivos: [
            {
              id: 'o-1',
              nombre: 'Objetivo 1',
              indicadores: [{ id: 'i-1', nombre: 'Indicador 1' }],
            },
          ],
        },
      ],
    }

    await openTeacherRouteBuilder({ maestroId: 'm-123', claseId: 'c-1', route })

    // Expandir la unidad para ver el objetivo
    const chevronUnidad = document.querySelector('[data-role="toggle-unidad"]')
    chevronUnidad.click()

    const removeObjBtn = document.querySelector('.trb-remove-objetivo')
    expect(removeObjBtn).toBeTruthy()

    expect(() => {
      removeObjBtn.click()
    }).not.toThrow()

    const objetivos = document.querySelectorAll('.trb-objetivo')
    expect(objetivos.length).toBe(0)
  })

  it('no lanza error al togglear unidad si el estado no tiene la unidad o índice fuera de rango', async () => {
    const route = {
      id: 'r-1',
      nombre: 'Violín Básico',
      unidades: [],
    }

    await openTeacherRouteBuilder({ maestroId: 'm-123', claseId: 'c-1', route })

    // Crear un elemento artificial con data-role="toggle-unidad" y data-ui="99"
    const fakeToggle = document.createElement('div')
    fakeToggle.setAttribute('data-role', 'toggle-unidad')
    fakeToggle.setAttribute('data-ui', '99')
    document.querySelector('#trb-unidades').appendChild(fakeToggle)

    // Al no existir unidad en state.unidades[99], no debe lanzar error de _localId
    expect(() => {
      fakeToggle.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    }).not.toThrow()
  })

  it('no lanza error al quitar indicador (.trb-remove-indicador)', async () => {
    const route = {
      id: 'r-1',
      nombre: 'Violín Básico',
      unidades: [
        {
          id: 'u-1',
          nombre: 'Unidad 1',
          objetivos: [
            {
              id: 'o-1',
              nombre: 'Objetivo 1',
              indicadores: [{ id: 'i-1', nombre: 'Indicador 1' }],
            },
          ],
        },
      ],
    }

    await openTeacherRouteBuilder({ maestroId: 'm-123', claseId: 'c-1', route })

    // Expandir unidad y objetivo
    document.querySelector('[data-role="toggle-unidad"]').click()
    document.querySelector('[data-role="toggle-objetivo"]').click()

    const removeIndBtn = document.querySelector('.trb-remove-indicador')
    expect(removeIndBtn).toBeTruthy()

    expect(() => {
      removeIndBtn.click()
    }).not.toThrow()

    expect(document.querySelectorAll('.trb-indicador').length).toBe(0)
  })

  it('permite agregar objetivo e indicador sin errores', async () => {
    const route = {
      id: 'r-1',
      nombre: 'Violín Básico',
      unidades: [
        {
          id: 'u-1',
          nombre: 'Unidad 1',
          objetivos: [],
        },
      ],
    }

    await openTeacherRouteBuilder({ maestroId: 'm-123', claseId: 'c-1', route })
    document.querySelector('[data-role="toggle-unidad"]').click()

    const addObjBtn = document.querySelector('[data-role="add-objetivo"]')
    expect(addObjBtn).toBeTruthy()
    addObjBtn.click()

    expect(document.querySelectorAll('.trb-objetivo').length).toBe(1)

    const addIndBtn = document.querySelector('[data-role="add-indicador"]')
    expect(addIndBtn).toBeTruthy()
    addIndBtn.click()

    expect(document.querySelectorAll('.trb-indicador').length).toBe(1)
  })
})
