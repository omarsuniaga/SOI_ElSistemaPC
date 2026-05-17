import { describe, it, expect, vi } from 'vitest'

vi.mock('../assets/data/mocks/permisos.json', () => ({
  default: [
    {
      id: 'perm-001',
      maestro_id: 'maestro_001',
      maestro_nombre: 'Carlos Méndez',
      maestro_email: 'carlos@ejemplo.com',
      puede_registrar_alumnos: true,
      puede_inscribir_clases: true,
      concedido_por: 'admin_001',
      concedido_por_nombre: 'Admin Sistema',
      creado_en: '2026-01-15T10:00:00Z',
      actualizado_en: '2026-05-01T14:30:00Z',
    },
    {
      id: 'perm-002',
      maestro_id: 'maestro_002',
      maestro_nombre: 'María López',
      maestro_email: 'maria@ejemplo.com',
      puede_registrar_alumnos: true,
      puede_inscribir_clases: false,
      concedido_por: 'admin_001',
      concedido_por_nombre: 'Admin Sistema',
      creado_en: '2026-02-20T09:00:00Z',
      actualizado_en: '2026-04-10T11:00:00Z',
    },
  ],
}))

import * as mockImpl from '../modules/permisos/api/permisosMock.js'

describe('permisosMock CRUD', () => {
  describe('obtenerPermisos', () => {
    it('should return all permisos', async () => {
      const result = await mockImpl.obtenerPermisos()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(2)
      expect(result[0].maestro_id).toBe('maestro_001')
      expect(result[1].maestro_id).toBe('maestro_002')
    })

    it('should normalize permiso fields', async () => {
      const result = await mockImpl.obtenerPermisos()
      const p = result[0]
      expect(p).toHaveProperty('id')
      expect(p).toHaveProperty('maestro_id')
      expect(p).toHaveProperty('maestro_nombre')
      expect(p).toHaveProperty('maestro_email')
      expect(p).toHaveProperty('puede_registrar_alumnos')
      expect(p).toHaveProperty('puede_inscribir_clases')
      expect(p).toHaveProperty('concedido_por')
      expect(p).toHaveProperty('creado_en')
      expect(p).toHaveProperty('actualizado_en')
    })
  })

  describe('obtenerPermisoPorMaestro', () => {
    it('should return permiso for existing maestro', async () => {
      const result = await mockImpl.obtenerPermisoPorMaestro('maestro_001')
      expect(result).not.toBeNull()
      expect(result.maestro_id).toBe('maestro_001')
      expect(result.puede_registrar_alumnos).toBe(true)
      expect(result.puede_inscribir_clases).toBe(true)
    })

    it('should return default false permissions for missing maestro (fail-closed)', async () => {
      const result = await mockImpl.obtenerPermisoPorMaestro('maestro_unknown')
      expect(result).not.toBeNull()
      expect(result.maestro_id).toBe('maestro_unknown')
      expect(result.puede_registrar_alumnos).toBe(false)
      expect(result.puede_inscribir_clases).toBe(false)
      expect(result.id).toBeNull()
    })
  })

  describe('actualizarPermiso', () => {
    it('should update existing permiso (upsert)', async () => {
      const result = await mockImpl.actualizarPermiso('maestro_002', {
        puede_registrar_alumnos: false,
        puede_inscribir_clases: true,
      })
      expect(result.maestro_id).toBe('maestro_002')
      expect(result.puede_registrar_alumnos).toBe(false)
      expect(result.puede_inscribir_clases).toBe(true)
      expect(result.actualizado_en).toBeTruthy()
    })

    it('should create new permiso for maestro without one (upsert)', async () => {
      const result = await mockImpl.actualizarPermiso('maestro_new_003', {
        maestro_nombre: 'Nuevo Maestro',
        maestro_email: 'nuevo@ejemplo.com',
        puede_registrar_alumnos: true,
        puede_inscribir_clases: false,
      })
      expect(result.maestro_id).toBe('maestro_new_003')
      expect(result.maestro_nombre).toBe('Nuevo Maestro')
      expect(result.puede_registrar_alumnos).toBe(true)
      expect(result.puede_inscribir_clases).toBe(false)
      expect(result.id).toBeTruthy()
    })

    it('should not change fields not provided in update', async () => {
      const original = await mockImpl.obtenerPermisoPorMaestro('maestro_001')
      const result = await mockImpl.actualizarPermiso('maestro_001', {
        puede_registrar_alumnos: false,
      })
      expect(result.puede_registrar_alumnos).toBe(false)
      expect(result.puede_inscribir_clases).toBe(original.puede_inscribir_clases)
    })
  })

  describe('CRUD lifecycle', () => {
    it('should read what was written (create + read roundtrip)', async () => {
      await mockImpl.actualizarPermiso('maestro_create_test', {
        maestro_nombre: 'Test Maestro',
        puede_registrar_alumnos: true,
        puede_inscribir_clases: true,
      })

      const result = await mockImpl.obtenerPermisoPorMaestro('maestro_create_test')
      expect(result.maestro_id).toBe('maestro_create_test')
      expect(result.puede_registrar_alumnos).toBe(true)
      expect(result.puede_inscribir_clases).toBe(true)
    })

    it('should list newly created permiso in obtenerPermisos', async () => {
      await mockImpl.actualizarPermiso('maestro_new', {
        maestro_nombre: 'New',
        puede_registrar_alumnos: true,
        puede_inscribir_clases: false,
      })
      const all = await mockImpl.obtenerPermisos()
      const found = all.find(p => p.maestro_id === 'maestro_new')
      expect(found).toBeTruthy()
      expect(found.maestro_nombre).toBe('New')
    })
  })
})
