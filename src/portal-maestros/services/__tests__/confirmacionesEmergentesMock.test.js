import { beforeEach, describe, expect, it } from 'vitest'
import {
  MOCK_ACTIVIDADES,
  confirmarActividad,
  obtenerConfirmacionesPendientes,
  obtenerActividadPorId,
  obtenerActividadesPorAlcance,
  obtenerMaestrosAfectadosPorAlcance,
  _resetMockStore,
  _getStore
} from '../confirmacionesEmergentesMock.js'

describe('confirmacionesEmergentesMock', () => {
  beforeEach(() => {
    _resetMockStore([])
  })

  describe('confirmarActividad', () => {
    const validParams = {
      actividad_id: 'act-demo-institucion-1',
      maestro_id: 'maestro-test-1',
      fecha: '2026-09-15',
      respuesta: 'si',
      observaciones: 'Confirmación exitosa',
      clases_afectadas: [{ clase_id: 'c1', clase_nombre: 'Violín', alumnos_count: 10 }]
    }

    it('valida parámetros obligatorios', async () => {
      await expect(confirmarActividad()).rejects.toThrow('se requiere actividad_id')
      await expect(confirmarActividad({ actividad_id: 'a1' })).rejects.toThrow('se requiere maestro_id')
      await expect(confirmarActividad({ actividad_id: 'a1', maestro_id: 'm1' })).rejects.toThrow('se requiere fecha')
      await expect(confirmarActividad({ actividad_id: 'a1', maestro_id: 'm1', fecha: '2026-09-15' })).rejects.toThrow('se requiere respuesta')
    })

    it('valida que la respuesta sea una de las permitidas', async () => {
      await expect(confirmarActividad({ ...validParams, respuesta: 'quizas' })).rejects.toThrow('respuesta inválida')
    })

    it('crea una nueva confirmación con estado_validacion correcto', async () => {
      const conf = await confirmarActividad(validParams)
      expect(conf.id).toBeTruthy()
      expect(conf.actividad_id).toBe(validParams.actividad_id)
      expect(conf.maestro_id).toBe(validParams.maestro_id)
      expect(conf.respuesta).toBe('si')
      expect(conf.estado_validacion).toBe('validado')
      expect(conf.observaciones).toBe('Confirmación exitosa')
      expect(conf.clases_afectadas).toEqual(validParams.clases_afectadas)
    })

    it('asigna estado_validacion="pendiente" si respuesta="no_se"', async () => {
      const conf = await confirmarActividad({ ...validParams, respuesta: 'no_se' })
      expect(conf.respuesta).toBe('no_se')
      expect(conf.estado_validacion).toBe('pendiente')
    })

    it('UPSERT: reintento de confirmación para misma actividad+maestro+fecha es idempotente', async () => {
      const conf1 = await confirmarActividad(validParams)
      const storeBefore = _getStore()
      expect(storeBefore).toHaveLength(1)

      const conf2 = await confirmarActividad({
        ...validParams,
        respuesta: 'no',
        observaciones: 'Cambio de respuesta por el maestro'
      })

      const storeAfter = _getStore()
      expect(storeAfter).toHaveLength(1)
      expect(conf2.id).toBe(conf1.id)
      expect(conf2.respuesta).toBe('no')
      expect(conf2.observaciones).toBe('Cambio de respuesta por el maestro')
    })
  })

  describe('obtenerConfirmacionesPendientes', () => {
    it('valida maestroId requerido', async () => {
      await expect(obtenerConfirmacionesPendientes()).rejects.toThrow('se requiere maestroId')
    })

    it('retorna actividades en alcance que no han sido confirmadas por el maestro', async () => {
      // maestro-1 está en alcance de institucion-1, programa-1 y especificos-1
      const pendientes = await obtenerConfirmacionesPendientes('maestro-1')
      expect(Array.isArray(pendientes)).toBe(true)
      expect(pendientes.length).toBeGreaterThan(0)
      expect(pendientes[0]).toHaveProperty('actividad_id')
      expect(pendientes[0]).toHaveProperty('actividad_info')
    })

    it('elimina de pendientes cuando el maestro confirma con "si"', async () => {
      const pendientesIniciales = await obtenerConfirmacionesPendientes('maestro-1')
      const countInicial = pendientesIniciales.length

      // Confirmamos una de las actividades
      await confirmarActividad({
        actividad_id: pendientesIniciales[0].actividad_id,
        maestro_id: 'maestro-1',
        fecha: pendientesIniciales[0].fecha,
        respuesta: 'si'
      })

      const pendientesDespues = await obtenerConfirmacionesPendientes('maestro-1')
      expect(pendientesDespues.length).toBe(countInicial - 1)
    })
  })

  describe('obtenerActividadPorId', () => {
    it('retorna la actividad correspondiente del mock', async () => {
      const act = await obtenerActividadPorId('act-demo-institucion-1')
      expect(act).not.toBeNull()
      expect(act.id).toBe('act-demo-institucion-1')
      expect(act.alcance_tipo).toBe('institucion')
    })

    it('retorna null si la actividad no existe', async () => {
      const act = await obtenerActividadPorId('inexistente')
      expect(act).toBeNull()
    })
  })

  describe('obtenerActividadesPorAlcance', () => {
    it('retorna las confirmaciones del maestro filtradas por fecha', async () => {
      await confirmarActividad({
        actividad_id: 'act-demo-institucion-1',
        maestro_id: 'm-fecha',
        fecha: '2026-09-15',
        respuesta: 'si'
      })
      await confirmarActividad({
        actividad_id: 'act-demo-especificos-1',
        maestro_id: 'm-fecha',
        fecha: '2026-09-16',
        respuesta: 'no'
      })

      const todas = await obtenerActividadesPorAlcance('m-fecha')
      expect(todas).toHaveLength(2)

      const delDia = await obtenerActividadesPorAlcance('m-fecha', '2026-09-15')
      expect(delDia).toHaveLength(1)
      expect(delDia[0].actividad_id).toBe('act-demo-institucion-1')
    })
  })

  describe('obtenerMaestrosAfectadosPorAlcance', () => {
    const clasesContexto = [
      { id: 'c1', maestro_id: 'm-inst-1', fecha: '2026-09-15', tipo_clase: 'regular', programa_id: 'p1' },
      { id: 'c2', maestro_id: 'm-inst-2', fecha: '2026-09-15', tipo_clase: 'orquesta', programa_id: 'p1' },
      { id: 'c3', maestro_id: 'm-coro-1', fecha: '2026-09-15', tipo_clase: 'coro', programa_id: 'p2' }
    ]

    it('alcance institucion: incluye todos los maestros con clase en la fecha', async () => {
      const maestros = await obtenerMaestrosAfectadosPorAlcance({
        alcance_tipo: 'institucion',
        fecha: '2026-09-15',
        clasesContexto
      })
      expect(maestros).toEqual(['m-inst-1', 'm-inst-2', 'm-coro-1'])
    })

    it('alcance programa: filtra solo maestros de ese programa_id', async () => {
      const maestros = await obtenerMaestrosAfectadosPorAlcance({
        alcance_tipo: 'programa',
        alcance_config: { programa_id: 'p2' },
        fecha: '2026-09-15',
        clasesContexto
      })
      expect(maestros).toEqual(['m-coro-1'])
    })

    it('alcance orquesta: filtra solo maestros de clases orquesta', async () => {
      const maestros = await obtenerMaestrosAfectadosPorAlcance({
        alcance_tipo: 'orquesta',
        fecha: '2026-09-15',
        clasesContexto
      })
      expect(maestros).toEqual(['m-inst-2'])
    })

    it('alcance coro: filtra solo maestros de clases coro', async () => {
      const maestros = await obtenerMaestrosAfectadosPorAlcance({
        alcance_tipo: 'coro',
        fecha: '2026-09-15',
        clasesContexto
      })
      expect(maestros).toEqual(['m-coro-1'])
    })

    it('alcance grupo: filtra solo maestros de las clases en clase_ids', async () => {
      const maestros = await obtenerMaestrosAfectadosPorAlcance({
        alcance_tipo: 'grupo',
        alcance_config: { clase_ids: ['c1'] },
        fecha: '2026-09-15',
        clasesContexto
      })
      expect(maestros).toEqual(['m-inst-1'])
    })

    it('alcance maestros_especificos: retorna la lista explícita', async () => {
      const maestros = await obtenerMaestrosAfectadosPorAlcance({
        alcance_tipo: 'maestros_especificos',
        alcance_config: { maestro_ids: ['esp-1', 'esp-2'] }
      })
      expect(maestros).toEqual(['esp-1', 'esp-2'])
    })
  })

  describe('Funciones ACM (Fase 5)', () => {
    it('crearActividadInstitucional crea la actividad en el mock y retorna maestros notificados', async () => {
      const res = await (await import('../confirmacionesEmergentesMock.js')).crearActividadInstitucional({
        actividad: 'Concierto de Gala ACM',
        fecha: '2026-09-20',
        alcance_tipo: 'institucion'
      })
      expect(res.actividad.id).toBeTruthy()
      expect(res.actividad.actividad).toBe('Concierto de Gala ACM')
      expect(res.maestros_notificados.length).toBeGreaterThan(0)
    })

    it('validarConfirmacionAcm actualiza estado_validacion y observaciones', async () => {
      const mock = await import('../confirmacionesEmergentesMock.js')
      const conf = await mock.confirmarActividad({
        actividad_id: 'act-demo-institucion-1',
        maestro_id: 'm-val-test',
        fecha: '2026-09-15',
        respuesta: 'no_se'
      })

      const val = await mock.validarConfirmacionAcm({
        confirmacion_id: conf.id,
        estado_validacion: 'validado',
        observaciones: 'Aprobado por ACM'
      })

      expect(val.estado_validacion).toBe('validado')
      expect(val.observaciones).toBe('Aprobado por ACM')
    })

    it('obtenerTodasLasConfirmaciones filtra por maestro, fecha y estado', async () => {
      const mock = await import('../confirmacionesEmergentesMock.js')
      mock._resetMockStore([
        { id: 'c1', maestro_id: 'm1', fecha: '2026-09-15', estado_validacion: 'pendiente', respuesta: 'no_se' },
        { id: 'c2', maestro_id: 'm2', fecha: '2026-09-15', estado_validacion: 'validado', respuesta: 'si' },
        { id: 'c3', maestro_id: 'm1', fecha: '2026-09-16', estado_validacion: 'validado', respuesta: 'no' }
      ])

      const todas = await mock.obtenerTodasLasConfirmaciones()
      expect(todas).toHaveLength(3)

      const soloM1 = await mock.obtenerTodasLasConfirmaciones({ maestro_id: 'm1' })
      expect(soloM1).toHaveLength(2)

      const soloPendientes = await mock.obtenerTodasLasConfirmaciones({ estado_validacion: 'pendiente' })
      expect(soloPendientes).toHaveLength(1)
    })

    it('obtenerResumenAgregado calcula totales por respuesta y por maestro', async () => {
      const mock = await import('../confirmacionesEmergentesMock.js')
      const confirmaciones = [
        { id: '1', maestro_id: 'm1', respuesta: 'si', estado_validacion: 'validado' },
        { id: '2', maestro_id: 'm1', respuesta: 'no', estado_validacion: 'validado' },
        { id: '3', maestro_id: 'm2', respuesta: 'no_se', estado_validacion: 'pendiente' },
        { id: '4', maestro_id: 'm3', respuesta: 'no_aplica', estado_validacion: 'validado' }
      ]

      const resumen = mock.obtenerResumenAgregado(confirmaciones)
      expect(resumen.total).toBe(4)
      expect(resumen.si).toBe(1)
      expect(resumen.no).toBe(1)
      expect(resumen.no_se).toBe(1)
      expect(resumen.no_aplica).toBe(1)
      expect(resumen.pendientes_validacion).toBe(1)
      expect(resumen.por_maestro.m1.total).toBe(2)
    })
  })
})
