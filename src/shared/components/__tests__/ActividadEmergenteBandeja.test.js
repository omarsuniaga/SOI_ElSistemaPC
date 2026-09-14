import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../portal-maestros/services/confirmacionesEmergentesAdapter.js', () => ({
  obtenerConfirmacionesPendientes: vi.fn(),
  confirmarActividad: vi.fn(),
  obtenerActividadPorId: vi.fn(),
  obtenerActividadesPorAlcance: vi.fn(),
  obtenerMaestrosAfectadosPorAlcance: vi.fn()
}))

import * as adapter from '../../../portal-maestros/services/confirmacionesEmergentesAdapter.js'
import { renderActividadEmergenteBandeja } from '../ActividadEmergenteBandeja.js'

describe('ActividadEmergenteBandeja', () => {
  let container

  const mockPendientes = [
    {
      id: 'p-1',
      actividad_id: 'act-1',
      maestro_id: 'maestro-test',
      fecha: '2026-09-15',
      estado: 'pendiente',
      actividad_info: {
        id: 'act-1',
        actividad: 'Concierto Sinfónico Anual',
        fecha: '2026-09-15',
        lugar: 'Auditorio Principal',
        alcance_tipo: 'institucion',
        clases_afectadas: [
          { clase_id: 'c1', clase_nombre: 'Violín I', alumnos_count: 12 }
        ]
      }
    },
    {
      id: 'p-2',
      actividad_id: 'act-2',
      maestro_id: 'maestro-test',
      fecha: '2026-09-15',
      estado: 'pendiente',
      actividad_info: {
        id: 'act-2',
        actividad: 'Masterclass de Viola',
        fecha: '2026-09-15',
        lugar: 'Sala 102',
        alcance_tipo: 'programa',
        clases_afectadas: [
          { clase_id: 'c2', clase_nombre: 'Viola Técnica', alumnos_count: 6 }
        ]
      }
    },
    {
      id: 'p-3',
      actividad_id: 'act-3',
      maestro_id: 'maestro-test',
      fecha: '2026-09-16',
      estado: 'pendiente',
      actividad_info: {
        id: 'act-3',
        actividad: 'Ensayo Seccional de Metales',
        fecha: '2026-09-16',
        lugar: 'Sala 204',
        alcance_tipo: 'maestros_especificos'
      }
    }
  ]

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  describe('Interacción y Casos de Uso (Fase 4.3)', () => {
    it('renderiza la lista de actividades pendientes', async () => {
      adapter.obtenerConfirmacionesPendientes.mockResolvedValueOnce(mockPendientes)

      renderActividadEmergenteBandeja(container, { maestroId: 'maestro-test' })

      // Esperar resolución de promesas
      await vi.waitFor(() => {
        const filas = container.querySelectorAll('[data-role="actividad-fila"]')
        expect(filas.length).toBe(3)
      })

      expect(container.textContent).toContain('Concierto Sinfónico Anual')
      expect(container.textContent).toContain('Masterclass de Viola')
      expect(container.textContent).toContain('Ensayo Seccional de Metales')
    })

    it('click en fila abre el modal de confirmación con los detalles de la actividad', async () => {
      adapter.obtenerConfirmacionesPendientes.mockResolvedValueOnce(mockPendientes)

      renderActividadEmergenteBandeja(container, { maestroId: 'maestro-test' })

      await vi.waitFor(() => {
        expect(container.querySelectorAll('[data-role="actividad-fila"]').length).toBe(3)
      })

      const primeraFila = container.querySelector('[data-role="actividad-fila"]')
      primeraFila.click()

      const modal = container.querySelector('[data-role="modal-confirmacion"]')
      expect(modal).toBeTruthy()
      expect(modal.textContent).toContain('Concierto Sinfónico Anual')
      expect(modal.textContent).toContain('Auditorio Principal')
      expect(modal.textContent).toContain('Violín I')
    })

    it('click en "Sí" selecciona respuesta, confirma y llama a adapter.confirmarActividad', async () => {
      adapter.obtenerConfirmacionesPendientes
        .mockResolvedValueOnce(mockPendientes)
        .mockResolvedValueOnce(mockPendientes.slice(1)) // post-confirmación

      adapter.confirmarActividad.mockResolvedValueOnce({
        id: 'conf-1',
        actividad_id: 'act-1',
        maestro_id: 'maestro-test',
        respuesta: 'si'
      })

      const onConfirmSpy = vi.fn()

      renderActividadEmergenteBandeja(container, {
        maestroId: 'maestro-test',
        onConfirm: onConfirmSpy
      })

      await vi.waitFor(() => {
        expect(container.querySelectorAll('[data-role="actividad-fila"]').length).toBe(3)
      })

      // Abrir modal
      container.querySelector('[data-role="actividad-fila"]').click()

      // Click botón "Sí"
      const btnSi = container.querySelector('[data-role="btn-confirmar-si"]')
      expect(btnSi).toBeTruthy()
      btnSi.click()

      // Click Confirmar / Guardar
      const btnGuardar = container.querySelector('[data-role="btn-guardar"]')
      expect(btnGuardar.disabled).toBe(false)
      btnGuardar.click()

      await vi.waitFor(() => {
        expect(adapter.confirmarActividad).toHaveBeenCalledWith(expect.objectContaining({
          actividad_id: 'act-1',
          maestro_id: 'maestro-test',
          fecha: '2026-09-15',
          respuesta: 'si'
        }))
        expect(onConfirmSpy).toHaveBeenCalled()
      })

      // El modal debe haberse cerrado
      expect(container.querySelector('[data-role="modal-confirmacion"]')).toBeNull()
    })

    it('click en "No Sé" con estado pendiente muestra "En Validación" y no permite re-confirmar', async () => {
      const pendientesConNoSe = [
        {
          id: 'p-val',
          actividad_id: 'act-val',
          maestro_id: 'maestro-test',
          fecha: '2026-09-15',
          estado: 'pendiente',
          confirmacion: {
            respuesta: 'no_se',
            estado_validacion: 'pendiente'
          },
          actividad_info: {
            actividad: 'Actividad En Revisión ACM',
            fecha: '2026-09-15'
          }
        }
      ]

      adapter.obtenerConfirmacionesPendientes.mockResolvedValueOnce(pendientesConNoSe)

      renderActividadEmergenteBandeja(container, { maestroId: 'maestro-test' })

      await vi.waitFor(() => {
        expect(container.querySelector('[data-role="badge-en-validacion"]')).toBeTruthy()
      })

      // Abrir modal
      container.querySelector('[data-role="actividad-fila"]').click()

      const modal = container.querySelector('[data-role="modal-confirmacion"]')
      expect(modal).toBeTruthy()

      // Debe mostrar el aviso de En Validación
      const enValidacion = modal.querySelector('[data-role="estado-en-validacion"]')
      expect(enValidacion).toBeTruthy()
      expect(enValidacion.textContent).toContain('Respuesta en Validación')

      // Los botones de confirmación no deben estar disponibles para re-guardar
      expect(modal.querySelector('[data-role="btn-guardar"]')).toBeNull()
    })

    it('deep-link ?actividad_id=X abre directamente el modal para esa actividad', async () => {
      adapter.obtenerConfirmacionesPendientes.mockResolvedValueOnce(mockPendientes)

      renderActividadEmergenteBandeja(container, {
        maestroId: 'maestro-test',
        deepLinkActividadId: 'act-2'
      })

      await vi.waitFor(() => {
        const modal = container.querySelector('[data-role="modal-confirmacion"]')
        expect(modal).toBeTruthy()
        expect(modal.textContent).toContain('Masterclass de Viola')
      })
    })

    it('modal desaparece tras confirmar y la lista se actualiza', async () => {
      adapter.obtenerConfirmacionesPendientes
        .mockResolvedValueOnce(mockPendientes)
        .mockResolvedValueOnce([]) // Ya no hay pendientes

      adapter.confirmarActividad.mockResolvedValueOnce({
        id: 'conf-1',
        actividad_id: 'act-1',
        respuesta: 'no'
      })

      renderActividadEmergenteBandeja(container, { maestroId: 'maestro-test' })

      await vi.waitFor(() => {
        expect(container.querySelectorAll('[data-role="actividad-fila"]').length).toBe(3)
      })

      container.querySelector('[data-role="actividad-fila"]').click()
      container.querySelector('[data-role="btn-confirmar-no"]').click()
      container.querySelector('[data-role="btn-guardar"]').click()

      await vi.waitFor(() => {
        expect(container.querySelector('[data-role="vacio-mensaje"]')).toBeTruthy()
        expect(container.querySelector('[data-role="modal-confirmacion"]')).toBeNull()
      })
    })

    it('el formulario guarda correctamente sin validar observaciones (campo opcional)', async () => {
      adapter.obtenerConfirmacionesPendientes
        .mockResolvedValueOnce(mockPendientes)
        .mockResolvedValueOnce(mockPendientes.slice(1))

      adapter.confirmarActividad.mockResolvedValueOnce({
        id: 'conf-2',
        actividad_id: 'act-1',
        respuesta: 'no_aplica',
        observaciones: null
      })

      renderActividadEmergenteBandeja(container, { maestroId: 'maestro-test' })

      await vi.waitFor(() => {
        expect(container.querySelectorAll('[data-role="actividad-fila"]').length).toBe(3)
      })

      container.querySelector('[data-role="actividad-fila"]').click()
      container.querySelector('[data-role="btn-confirmar-no_aplica"]').click()

      const inputObs = container.querySelector('[data-role="input-observaciones"]')
      expect(inputObs.value).toBe('') // vacío

      container.querySelector('[data-role="btn-guardar"]').click()

      await vi.waitFor(() => {
        expect(adapter.confirmarActividad).toHaveBeenCalledWith(expect.objectContaining({
          actividad_id: 'act-1',
          respuesta: 'no_aplica',
          observaciones: null
        }))
      })
    })
  })

  describe('Vista Móvil (375px) — Fase 4.4', () => {
    beforeEach(() => {
      // Simular viewport móvil de 375px
      window.innerWidth = 375
      container.style.width = '375px'
    })

    it('botones del modal cumplen con el target táctil mínimo de 44px (touchable)', async () => {
      adapter.obtenerConfirmacionesPendientes.mockResolvedValueOnce([mockPendientes[0]])

      renderActividadEmergenteBandeja(container, { maestroId: 'maestro-test' })

      await vi.waitFor(() => {
        expect(container.querySelectorAll('[data-role="actividad-fila"]').length).toBe(1)
      })

      container.querySelector('[data-role="actividad-fila"]').click()

      const modal = container.querySelector('[data-role="modal-confirmacion"]')
      expect(modal).toBeTruthy()

      const botones = modal.querySelectorAll('button')
      expect(botones.length).toBeGreaterThan(0)

      botones.forEach(btn => {
        const minHeight = btn.style.minHeight
        const minWidth = btn.style.minWidth
        expect(minHeight).toBe('44px')
        expect(minWidth).toBe('44px')
      })
    })

    it('modal y contenedor están acotados sin desborde horizontal (overflow-x safe)', async () => {
      adapter.obtenerConfirmacionesPendientes.mockResolvedValueOnce([mockPendientes[0]])

      renderActividadEmergenteBandeja(container, { maestroId: 'maestro-test' })

      await vi.waitFor(() => {
        expect(container.querySelectorAll('[data-role="actividad-fila"]').length).toBe(1)
      })

      container.querySelector('[data-role="actividad-fila"]').click()

      const dialog = container.querySelector('.actividad-modal-dialog')
      expect(dialog).toBeTruthy()
      expect(dialog.style.boxSizing).toBe('border-box')
      expect(dialog.style.overflowX).toBe('hidden')
    })

    it('la lista de actividades es legible y scrollable en 375px', async () => {
      adapter.obtenerConfirmacionesPendientes.mockResolvedValueOnce(mockPendientes)

      renderActividadEmergenteBandeja(container, { maestroId: 'maestro-test' })

      await vi.waitFor(() => {
        const filas = container.querySelectorAll('[data-role="actividad-fila"]')
        expect(filas.length).toBe(3)
      })

      const filas = container.querySelectorAll('.actividad-fila')
      filas.forEach(fila => {
        expect(fila.style.boxSizing).toBe('border-box')
      })
    })

    it('nombre de actividad y fecha son legibles sin truncado no deseado en 375px', async () => {
      adapter.obtenerConfirmacionesPendientes.mockResolvedValueOnce([mockPendientes[0]])

      renderActividadEmergenteBandeja(container, { maestroId: 'maestro-test' })

      await vi.waitFor(() => {
        expect(container.textContent).toContain('Concierto Sinfónico Anual')
        expect(container.textContent).toContain('2026-09-15')
      })
    })
  })
})
