import { describe, it, expect, beforeEach } from 'vitest'
import {
  listarPostulantesPorMes,
  actualizarEstadoPostulante,
  hayConflictoCita,
  agregarNota,
  eliminarPostulante,
  resetMockData,
  data,
} from '../../../../src/modules/alumnos/api/postuladosMock.js'

describe('Postulados Mock API', () => {
  beforeEach(() => {
    resetMockData()
  })

  describe('listarPostulantesPorMes', () => {
    it('filtra correctamente por año y mes', async () => {
      // Tomamos una fecha de creación del mock data para testear de manera robusta
      const items = await listarPostulantesPorMes(2025, 4)
      expect(Array.isArray(items)).toBe(true)
      
      // Comprobar que todos los filtrados tengan la fecha correspondiente
      items.forEach((p) => {
        const date = new Date(p.created_at)
        expect(date.getFullYear()).toBe(2025)
        expect(date.getMonth() + 1).toBe(4)
      })
    })

    it('devuelve array vacío si no hay postulantes ese mes', async () => {
      const items = await listarPostulantesPorMes(1999, 12)
      expect(items).toEqual([])
    })

    it('no mezcla postulantes de meses distintos', async () => {
      const items1 = await listarPostulantesPorMes(2025, 4)
      const items2 = await listarPostulantesPorMes(2025, 5)
      
      const ids1 = items1.map((p) => p.id)
      const ids2 = items2.map((p) => p.id)
      
      // La intersección de IDs debe ser vacía
      const interseccion = ids1.filter((id) => ids2.includes(id))
      expect(interseccion).toEqual([])
    })
  })

  describe('actualizarEstadoPostulante', () => {
    it('actualiza estado correctamente en transición válida', async () => {
      // Buscamos uno en estado 'postulado'
      const postulado = data.find((p) => p.estado === 'postulado' || !p.estado)
      expect(postulado).toBeDefined()
      const targetId = postulado.id

      // Forzar estado de partida limpio
      postulado.estado = 'postulado'

      const resultado = await actualizarEstadoPostulante(targetId, 'contactado', {
        notas_seguimiento: 'Primer contacto telefónico',
      })

      expect(resultado.estado).toBe('contactado')
      expect(resultado.notas_seguimiento).toContain('Primer contacto telefónico')
    })

    it('lanza Error en transición inválida (usa puedeTransicionar)', async () => {
      const postulado = data.find((p) => p.estado === 'postulado' || !p.estado)
      expect(postulado).toBeDefined()
      
      // Forzar estado limpio
      postulado.estado = 'postulado'

      // postulado -> inscrito es inválido
      await expect(
        actualizarEstadoPostulante(postulado.id, 'inscrito')
      ).rejects.toThrow('Transición inválida')
    })

    it('guarda fecha_cita cuando se transiciona a cita_agendada', async () => {
      const contactado = data.find((p) => p.estado === 'contactado')
      // Si no hay contactado, forzamos uno
      let targetId
      if (!contactado) {
        const p = data[0]
        p.estado = 'contactado'
        targetId = p.id
      } else {
        targetId = contactado.id
      }

      const fechaCita = '2026-06-15T15:30:00Z'
      const resultado = await actualizarEstadoPostulante(targetId, 'cita_agendada', {
        fecha_cita: fechaCita,
      })

      expect(resultado.estado).toBe('cita_agendada')
      expect(resultado.fecha_cita).toBe(fechaCita)
    })

    it('retorna el postulante actualizado', async () => {
      const p = data[0]
      p.estado = 'postulado'

      const resultado = await actualizarEstadoPostulante(p.id, 'contactado')
      expect(resultado.id).toBe(p.id)
      expect(resultado.estado).toBe('contactado')
    })
  })

  describe('hayConflictoCita', () => {
    it('devuelve true si ya hay cita en el mismo slot ±30min', async () => {
      // Creamos una cita en memoria
      const p1 = data[0]
      p1.estado = 'cita_agendada'
      p1.fecha_cita = '2026-06-20T10:00:00Z'

      // Probamos el mismo horario
      const conflictoExacto = await hayConflictoCita('2026-06-20T10:00:00Z')
      expect(conflictoExacto).toBe(true)

      // Probamos 15 minutos después
      const conflictoMargen = await hayConflictoCita('2026-06-20T10:15:00Z')
      expect(conflictoMargen).toBe(true)
    })

    it('devuelve false si el slot está libre', async () => {
      // Cita a las 10:00
      const p1 = data[0]
      p1.estado = 'cita_agendada'
      p1.fecha_cita = '2026-06-20T10:00:00Z'

      // Probamos 45 minutos después (fuera del margen de 30min)
      const libre = await hayConflictoCita('2026-06-20T10:45:00Z')
      expect(libre).toBe(false)
    })

    it('excluye el propio id al verificar conflicto (reprogramación)', async () => {
      const p1 = data[0]
      p1.estado = 'cita_agendada'
      p1.fecha_cita = '2026-06-20T10:00:00Z'

      // Si es el mismo postulante reprogramando a la misma hora, no debe dar conflicto
      const conflicto = await hayConflictoCita('2026-06-20T10:00:00Z', p1.id)
      expect(conflicto).toBe(false)
    })
  })

  describe('agregarNota', () => {
    it('añade la nota al campo notas_seguimiento del postulante', async () => {
      const p = data[0]
      p.notas_seguimiento = ''

      const resultado = await agregarNota(p.id, 'Llamar más tarde')
      expect(resultado.notas_seguimiento).toBe('Llamar más tarde')
    })

    it('concatena con notas anteriores si ya había texto', async () => {
      const p = data[0]
      p.notas_seguimiento = 'Nota 1'

      const resultado = await agregarNota(p.id, 'Nota 2')
      expect(resultado.notas_seguimiento).toBe('Nota 1\nNota 2')
    })
  })

  describe('eliminarPostulante', () => {
    it('elimina un postulante correctamente de la lista en memoria', async () => {
      const originalLength = data.length
      const p = data[0]
      
      const resultado = await eliminarPostulante(p.id)
      expect(resultado).toBe(true)
      expect(data.length).toBe(originalLength - 1)
      
      // Comprobar que ya no exista
      const encontrado = data.find((item) => item.id === p.id)
      expect(encontrado).toBeUndefined()
    })

    it('lanza Error si el id no existe', async () => {
      await expect(eliminarPostulante('inexistente-id-123')).rejects.toThrow('no encontrado')
    })
  })
})
