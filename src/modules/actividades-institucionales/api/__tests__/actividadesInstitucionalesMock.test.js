import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('actividadesInstitucionalesMock', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('lista las actividades semilla y filtra por estado', async () => {
    const { listarActividades } = await import('../actividadesInstitucionalesMock.js')
    const todas = await listarActividades()
    expect(todas.length).toBeGreaterThanOrEqual(2)

    const pendientes = await listarActividades({ estado: 'pendiente_revision' })
    expect(pendientes.every((a) => a.estado === 'pendiente_revision')).toBe(true)
  })

  it('crea una actividad como pendiente_revision y no afecta nada hasta aprobarse', async () => {
    const { crearActividad, listarActividades } = await import('../actividadesInstitucionalesMock.js')
    const nueva = await crearActividad({
      titulo: 'Suspensión de prueba',
      categoria: 'suspension',
      alcance: 'institucional',
      fechaInicio: '2026-11-02',
      fechaFin: '2026-11-02',
    })
    expect(nueva.estado).toBe('pendiente_revision')

    const lista = await listarActividades()
    expect(lista.find((a) => a.id === nueva.id)).toBeTruthy()
  })

  it('rechaza crear sin campos obligatorios', async () => {
    const { crearActividad } = await import('../actividadesInstitucionalesMock.js')
    await expect(crearActividad({ titulo: 'Sin fechas' })).rejects.toThrow(/obligatorios/)
  })

  it('aprobar/rechazar exige que la actividad exista', async () => {
    const { aprobarActividad, rechazarActividad } = await import('../actividadesInstitucionalesMock.js')
    await expect(aprobarActividad('no-existe', [])).rejects.toThrow(/no encontrada/)
    await expect(rechazarActividad('no-existe', 'motivo')).rejects.toThrow(/no encontrada/)
  })

  it('aprobar marca la actividad como aprobada y permite corregirla después (mismo flujo del RPC real)', async () => {
    const { crearActividad, aprobarActividad, listarActividades } = await import('../actividadesInstitucionalesMock.js')
    const nueva = await crearActividad({
      titulo: 'Actividad a aprobar',
      categoria: 'actividad_especial',
      alcance: 'institucional',
      fechaInicio: '2026-11-05',
      fechaFin: '2026-11-05',
    })

    const primeraAprobacion = await aprobarActividad(nueva.id, [
      { claseId: 'clase_001', fecha: '2026-11-05', tipoAfectacion: 'suspendida' },
    ])
    expect(primeraAprobacion.estado).toBe('aprobado')

    // Corrección: reaprobar un evento ya aprobado no debe fallar.
    const correccion = await aprobarActividad(nueva.id, [
      { claseId: 'clase_001', fecha: '2026-11-05', tipoAfectacion: 'impartida_sin_cambios' },
    ])
    expect(correccion.estado).toBe('aprobado')
    expect(correccion.version).toBeGreaterThan(primeraAprobacion.version)

    const lista = await listarActividades()
    expect(lista.find((a) => a.id === nueva.id).estado).toBe('aprobado')
  })

  it('registrarAsistenciaActividad valida el estado y queda reflejado en la lista', async () => {
    const { obtenerListaAsistenciaActividad, registrarAsistenciaActividad } = await import('../actividadesInstitucionalesMock.js')

    await expect(registrarAsistenciaActividad('act-x', 'al-1', 'inventado')).rejects.toThrow(/inválido/)

    await registrarAsistenciaActividad('act-x', 'demo-alumno-1', 'presente')
    const roster = await obtenerListaAsistenciaActividad('act-x')
    expect(roster.find((r) => r.alumnoId === 'demo-alumno-1').estado).toBe('presente')
  })

  it('elimina una propuesta pendiente pero no una ya aprobada', async () => {
    const { crearActividad, eliminarActividad, aprobarActividad, listarActividades } = await import('../actividadesInstitucionalesMock.js')
    const pendiente = await crearActividad({
      titulo: 'A eliminar', categoria: 'feriado', alcance: 'institucional', fechaInicio: '2026-11-07', fechaFin: '2026-11-07',
    })
    await eliminarActividad(pendiente.id)
    expect((await listarActividades()).find((a) => a.id === pendiente.id)).toBeUndefined()

    const aprobada = await crearActividad({
      titulo: 'No se puede borrar', categoria: 'feriado', alcance: 'institucional', fechaInicio: '2026-11-08', fechaFin: '2026-11-08',
    })
    await aprobarActividad(aprobada.id, [])
    await expect(eliminarActividad(aprobada.id)).rejects.toThrow(/no fueron aprobadas/)
  })

  it('no permite aprobar una actividad ya rechazada', async () => {
    const { crearActividad, rechazarActividad, aprobarActividad } = await import('../actividadesInstitucionalesMock.js')
    const nueva = await crearActividad({
      titulo: 'Actividad a rechazar',
      categoria: 'feriado',
      alcance: 'institucional',
      fechaInicio: '2026-11-06',
      fechaFin: '2026-11-06',
    })
    await rechazarActividad(nueva.id, 'No corresponde')
    await expect(aprobarActividad(nueva.id, [])).rejects.toThrow(/no se puede aprobar/)
  })
})
