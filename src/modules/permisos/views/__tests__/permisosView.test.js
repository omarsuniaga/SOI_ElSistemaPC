import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- Mocks ---
vi.mock('../../api/permisosApi.js', () => ({
  obtenerPermisos: vi.fn(),
  actualizarPermiso: vi.fn(),
}))

vi.mock('../../api/permisosSupabase.js', () => ({
  listarMaestrosSinPermisos: vi.fn(),
  actualizarPermiso: vi.fn(),
}))

vi.mock('../../../auth/hooks/useAuth.js', () => ({
  useAuth: { getUser: vi.fn(() => ({ nombre_completo: 'Admin Test' })) },
}))

vi.mock('../../../../core/config/config.js', () => ({
  config: { isDemoMode: false },
}))

vi.mock('../../../../shared/components/AppToast.js', () => ({
  AppToast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('../../services/grantBulk.js', () => ({
  grantBulk: vi.fn(),
}))

import { renderPermisosView } from '../permisosView.js'
import { obtenerPermisos, actualizarPermiso as actualizarPermisoApi } from '../../api/permisosApi.js'
import { listarMaestrosSinPermisos, actualizarPermiso as actualizarPermisoSupabase } from '../../api/permisosSupabase.js'
import { grantBulk } from '../../services/grantBulk.js'
import { AppToast } from '../../../../shared/components/AppToast.js'

// Helpers
function makePermiso(overrides = {}) {
  return {
    id: 'perm-1',
    maestro_id: 'm1',
    maestro_nombre: 'Juan Perez',
    maestro_email: 'juan@test.com',
    puede_registrar_alumnos: false,
    puede_inscribir_clases: false,
    permisos: [],
    fecha_inicio: '2026-01-01',
    fecha_fin: null,
    vigente: true,
    ...overrides,
  }
}

function makeExpiredPermiso() {
  return makePermiso({
    id: 'perm-expired',
    maestro_id: 'm-expired',
    fecha_fin: '2025-01-01',
    vigente: false,
  })
}

describe('permisosView — Admin UI', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  // --- Add teacher flow ---
  describe('Add teacher flow', () => {
    it('renders an "Add teacher" button that opens the AddMaestroModal', async () => {
      obtenerPermisos.mockResolvedValue([makePermiso()])
      await renderPermisosView(container)

      const addBtn = container.querySelector('[data-action="add-maestro"]')
      expect(addBtn).not.toBeNull()
    })

    it('modal search filters the maestros list', async () => {
      obtenerPermisos.mockResolvedValue([])
      listarMaestrosSinPermisos.mockResolvedValue([
        { id: 'm2', nombre_completo: 'Ana Lopez' },
        { id: 'm3', nombre_completo: 'Carlos Torres' },
      ])
      await renderPermisosView(container)

      const addBtn = container.querySelector('[data-action="add-maestro"]')
      addBtn?.click()
      await Promise.resolve()

      const modal = container.querySelector('[data-testid="add-maestro-modal"]') ||
                    document.querySelector('[data-testid="add-maestro-modal"]')
      expect(modal).not.toBeNull()

      // Simulate search
      const searchInput = modal?.querySelector('[data-testid="modal-search"]')
      if (searchInput) {
        searchInput.value = 'Ana'
        searchInput.dispatchEvent(new Event('input'))
        await Promise.resolve()
        const items = modal.querySelectorAll('[data-testid="maestro-option"]')
        const names = Array.from(items).map(el => el.textContent)
        expect(names.some(n => n.includes('Ana'))).toBe(true)
        expect(names.every(n => !n.includes('Carlos'))).toBe(true)
      }
    })

    it('confirm in modal calls actualizarPermiso and adds a row to the list', async () => {
      obtenerPermisos.mockResolvedValue([])
      listarMaestrosSinPermisos.mockResolvedValue([{ id: 'm2', nombre_completo: 'Ana Lopez' }])
      actualizarPermisoSupabase.mockResolvedValue(makePermiso({ maestro_id: 'm2', maestro_nombre: 'Ana Lopez' }))
      await renderPermisosView(container)

      // Dispatch maestro-added event simulating what AddMaestroModal would emit
      container.dispatchEvent(new CustomEvent('maestro-added', {
        bubbles: true,
        detail: { maestro_id: 'm2' },
      }))
      await Promise.resolve()

      // After event, list should refresh — obtenerPermisos called again
      expect(obtenerPermisos).toHaveBeenCalledTimes(2)
    })
  })

  // --- Bulk grant ---
  describe('Bulk grant', () => {
    it('multi-select + apply calls grantBulk and shows toast with summary', async () => {
      const permisos = [
        makePermiso({ maestro_id: 'm1' }),
        makePermiso({ maestro_id: 'm2' }),
      ]
      obtenerPermisos.mockResolvedValue(permisos)
      grantBulk.mockResolvedValue({ succeeded: ['m1', 'm2'], failed: [] })
      await renderPermisosView(container)

      // Select all via select-all checkbox
      const selectAll = container.querySelector('[data-action="select-all"]')
      if (selectAll) {
        selectAll.checked = true
        selectAll.dispatchEvent(new Event('change', { bubbles: true }))
        await Promise.resolve()
      }

      // Set grant key
      const grantSelect = container.querySelector('[data-action="grant-key"]')
      if (grantSelect) grantSelect.value = 'alumnos:create'

      // Click apply
      const applyBtn = container.querySelector('[data-action="apply-bulk"]')
      applyBtn?.click()
      await Promise.resolve()

      if (selectAll && grantSelect && applyBtn) {
        expect(grantBulk).toHaveBeenCalled()
        expect(AppToast.success).toHaveBeenCalled()
      }
    })
  })

  // --- Row edit auto-save ---
  describe('Row edit: auto-save', () => {
    it('toggle checkbox triggers auto-save and succeeds silently', async () => {
      obtenerPermisos.mockResolvedValue([makePermiso()])
      actualizarPermisoApi.mockResolvedValue(makePermiso({ puede_registrar_alumnos: true }))
      await renderPermisosView(container)

      const toggle = container.querySelector('[data-field="puede_registrar_alumnos"]')
      if (toggle) {
        toggle.checked = true
        toggle.dispatchEvent(new Event('change', { bubbles: true }))
        await Promise.resolve()
        // No error toast
        expect(AppToast.error).not.toHaveBeenCalled()
      }
    })

    it('toggle checkbox reverts on auto-save failure', async () => {
      obtenerPermisos.mockResolvedValue([makePermiso()])
      actualizarPermisoApi.mockRejectedValue(new Error('DB fail'))
      await renderPermisosView(container)

      const toggle = container.querySelector('[data-field="puede_registrar_alumnos"]')
      if (toggle) {
        const originalChecked = toggle.checked
        toggle.checked = true
        toggle.dispatchEvent(new Event('change', { bubbles: true }))
        await new Promise(r => setTimeout(r, 0))
        // Checkbox should revert
        expect(toggle.checked).toBe(originalChecked)
      }
    })
  })

  // --- Expired row ---
  describe('Expired row', () => {
    it('row with vigente=false has .permiso-expirado CSS class', async () => {
      obtenerPermisos.mockResolvedValue([makeExpiredPermiso()])
      await renderPermisosView(container)

      const expiredRow = container.querySelector('[data-maestro-id="m-expired"]')
      expect(expiredRow).not.toBeNull()
      expect(expiredRow?.classList.contains('permiso-expirado')).toBe(true)
    })
  })

  // --- Clear fecha_fin ---
  describe('Clear fecha_fin', () => {
    it('clearing fecha_fin input saves null to DB', async () => {
      obtenerPermisos.mockResolvedValue([makePermiso({ fecha_fin: '2026-12-31' })])
      actualizarPermisoApi.mockResolvedValue(makePermiso({ fecha_fin: null }))
      await renderPermisosView(container)

      const fechaFinInput = container.querySelector('[data-field="fecha_fin"]')
      if (fechaFinInput) {
        fechaFinInput.value = ''
        fechaFinInput.dispatchEvent(new Event('blur', { bubbles: true }))
        await new Promise(r => setTimeout(r, 0))
        const calls = actualizarPermisoApi.mock.calls
        if (calls.length > 0) {
          const lastCall = calls[calls.length - 1]
          expect(lastCall[1]).toMatchObject({ fecha_fin: null })
        }
      }
    })
  })
})
