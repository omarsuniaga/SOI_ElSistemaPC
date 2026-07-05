/**
 * Tests para propuestasMock.js — curriculo-tres-planos WU #8 (demo parity).
 *
 * Réplica en memoria (localStorage) de propuestasApi.js para que la vista
 * ACM (acmProuestasView.js, WU #6) funcione en modo demo sin Supabase.
 *
 * Cada test reimporta el módulo con vi.resetModules() para evitar fugas de
 * estado entre tests — el mock mantiene un singleton en memoria
 * (_routeVersions) igual que routeMock.js / weeklyPlanMock.js.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

async function freshModule() {
  vi.resetModules()
  return import('../propuestasMock.js')
}

describe('propuestasMock', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('listarPropuestasPendientes devuelve solo origen=maestro y status=propuesta', async () => {
    const { listarPropuestasPendientes } = await freshModule()
    const result = await listarPropuestasPendientes()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    result.forEach((p) => {
      expect(p.origen).toBe('maestro')
      expect(p.status).toBe('propuesta')
    })
  })

  it('publicarPropuesta cambia el status a published y persiste el cambio', async () => {
    const { listarPropuestasPendientes, publicarPropuesta } = await freshModule()
    const pendientes = await listarPropuestasPendientes()
    const [first] = pendientes

    const updated = await publicarPropuesta(first.id)
    expect(updated.status).toBe('published')

    const pendientesDespues = await listarPropuestasPendientes()
    expect(pendientesDespues.find((p) => p.id === first.id)).toBeUndefined()
  })

  it('devolverPropuesta cambia el status a devuelta y guarda el feedback', async () => {
    const { listarPropuestasPendientes, devolverPropuesta } = await freshModule()
    const pendientes = await listarPropuestasPendientes()
    const [first] = pendientes

    const updated = await devolverPropuesta(first.id, 'Falta el nivel 3')
    expect(updated.status).toBe('devuelta')
    expect(updated.feedback).toBe('Falta el nivel 3')
  })

  it('devolverPropuesta requiere feedback no vacío', async () => {
    const { listarPropuestasPendientes, devolverPropuesta } = await freshModule()
    const pendientes = await listarPropuestasPendientes()
    const [first] = pendientes
    await expect(devolverPropuesta(first.id, '')).rejects.toThrow(/feedback/)
  })

  it('publicarPropuesta requiere routeVersionId', async () => {
    const { publicarPropuesta } = await freshModule()
    await expect(publicarPropuesta()).rejects.toThrow(/routeVersionId/)
  })
})
