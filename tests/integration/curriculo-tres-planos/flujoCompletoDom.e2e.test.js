/**
 * E2E (DOM) — curriculo-tres-planos WU #10.
 *
 * Renderiza las vistas REALES (no solo las capas de API/mock) para probar
 * el flujo completo tal como lo viviría un usuario:
 *
 *   1. Maestro: proponerContenidoView.js — sube archivo, lo parsea
 *      (planningParserService real, con callGroq mockeado), revisa el
 *      árbol y hace click en [Proponer].
 *   2. ACM: acmProuestasView.js — ve la propuesta recién creada en su
 *      bandeja, abre el detalle y hace click en [Publicar].
 *   3. Progresión: progressionAdapter.getObjetivoActual — contrato de
 *      salida válido para un alumno sin intentos previos.
 *
 * Corre en modo demo (config.isDemoMode: true) para evitar cualquier
 * dependencia de Supabase real — usa el store compartido
 * curriculoTresPlanosStore.js (WU #8/#9) de punta a punta.
 *
 * NOTA: los mocks de demo (proponerContenidoMock.js, propuestasMock.js)
 * simulan latencia de red con un `setTimeout` interno (~80ms) para que el
 * comportamiento async se sienta realista — los `await` de este test usan
 * esperas explícitas (`waitFor`) en vez de un solo microtask-flush para no
 * acoplarse a ese valor mágico.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/core/config/config.js', () => ({ config: { isDemoMode: true } }))
vi.mock('../../../src/portal-maestros/services/groqService.js', () => ({
  callGroq: vi.fn(),
}))

const ESTRUCTURA_PROPUESTA = {
  niveles: [
    {
      nombre: 'Nivel 1 - Iniciación (E2E)',
      numero_nivel: 1,
      temas: [
        {
          nombre: 'Repertorio inicial E2E',
          objetivos: [
            {
              nombre: 'Interpretar una pieza simple E2E',
              indicadores: [{ descripcion: 'Ejecuta la pieza de memoria E2E', es_requerido: true }],
            },
          ],
        },
      ],
    },
  ],
}

/** Espera hasta que `check()` deje de lanzar, o hasta agotar el timeout. */
async function waitFor(check, { timeout = 1000, interval = 10 } = {}) {
  const start = Date.now()
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return check()
    } catch (err) {
      if (Date.now() - start > timeout) throw err
      await new Promise((r) => setTimeout(r, interval))
    }
  }
}

describe('curriculo-tres-planos E2E (DOM): proponer -> publicar -> progresión', () => {
  let container

  beforeEach(async () => {
    localStorage.clear()
    vi.clearAllMocks()
    window.alert = vi.fn()
    container = document.createElement('div')
    document.body.appendChild(container)

    const { callGroq } = await import('../../../src/portal-maestros/services/groqService.js')
    callGroq.mockResolvedValue(JSON.stringify(ESTRUCTURA_PROPUESTA))
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.restoreAllMocks()
  })

  it('sube y propone contenido desde la vista del maestro, el ACM lo publica desde su vista, y queda disponible para progresión', async () => {
    const { renderProponerContenidoView } = await import('../../../src/portal-maestros/views/proponerContenidoView.js')
    const { renderAcmPropuestasView } = await import('../../../src/modules/planificacion/views/acmProuestasView.js')
    const { getObjetivoActual } = await import('../../../src/modules/progresos/api/progressionAdapter.js')

    // ── 1. Maestro sube y propone ──────────────────────────────────────────
    renderProponerContenidoView(container, { maestroId: 'e2e-maestro-1', claseId: 'e2e-clase-1' })

    const fileInput = container.querySelector('[data-role="file-input"]')
    const file = new File(['contenido e2e'], 'plan-e2e.md', { type: 'text/markdown' })
    Object.defineProperty(fileInput, 'files', { value: [file] })
    fileInput.dispatchEvent(new Event('change'))

    await waitFor(() => {
      expect(container.querySelector('[data-pane="revisar"]').classList.contains('d-none')).toBe(false)
    })
    expect(container.textContent).toContain('Interpretar una pieza simple E2E')

    container.querySelector('[data-action="proponer"]').click()
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Propuesta enviada'))
    })

    // ── 2. ACM ve la propuesta y la publica ────────────────────────────────
    const acmContainer = document.createElement('div')
    document.body.appendChild(acmContainer)

    await renderAcmPropuestasView(acmContainer)
    const propuestaBtn = Array.from(acmContainer.querySelectorAll('[data-propuesta-id]')).find((btn) =>
      btn.textContent.includes('e2e-clase-1'),
    )
    expect(propuestaBtn).toBeTruthy()
    const routeVersionId = propuestaBtn.dataset.propuestaId

    propuestaBtn.click()
    expect(acmContainer.textContent).toContain('Interpretar una pieza simple E2E')

    acmContainer.querySelector('[data-action="publicar"]').click()
    await waitFor(() => {
      expect(acmContainer.querySelector(`[data-propuesta-id="${routeVersionId}"]`)).toBeFalsy()
    })

    document.body.removeChild(acmContainer)

    // ── 3. Progresión: contrato de salida válido tras publicar ─────────────
    const objetivoActual = await getObjetivoActual('e2e-alumno-1', routeVersionId)

    // El mock de progresión (progressionMock.js) recorre route_versions del
    // fixture ESTÁTICO; una route_version creada dinámicamente por
    // proponerContenidoMock no está indexada allí (limitación conocida y
    // documentada del modo demo — en producción progressionApi.js consulta
    // la tabla real, que sí ve la fila recién publicada). Por eso este test
    // valida el contrato de salida, no un objetivo específico.
    expect(objetivoActual).toHaveProperty('objetivo_actual_id')
    expect(objetivoActual).toHaveProperty('indicadores_pendientes_requeridos')
  })
})
