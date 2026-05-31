import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import * as observabilidadMock from '../api/observabilidadMock.js'
import * as observabilidadApi from '../api/observabilidadApi.js'
import { auditTrailWidget } from '../views/auditTrailWidget.js'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// ---------------------------------------------------------------------------
// Task A: CSS external file exists with expected classes
// ---------------------------------------------------------------------------
describe('PR1 — Task A: External CSS file', () => {
  const cssPath = resolve(
    process.cwd(),
    'src',
    'modules',
    'metricas',
    'styles',
    'metricas-observabilidad.css',
  )

  it('should exist at src/modules/metricas/styles/metricas-observabilidad.css', () => {
    expect(existsSync(cssPath)).toBe(true)
  })

  it('should contain terminal container class (.obs-terminal-container)', () => {
    const content = readFileSync(cssPath, 'utf-8')
    expect(content).toContain('.obs-terminal-container')
  })

  it('should contain audit header class (.obs-audit-header)', () => {
    const content = readFileSync(cssPath, 'utf-8')
    expect(content).toContain('.obs-audit-header')
  })

  it('should contain offline badge class (.obs-offline-badge)', () => {
    const content = readFileSync(cssPath, 'utf-8')
    expect(content).toContain('.obs-offline-badge')
  })

  it('should contain guide modal classes (.obs-guia-modal-body, .obs-guia-tab-btn)', () => {
    const content = readFileSync(cssPath, 'utf-8')
    expect(content).toContain('.obs-guia-modal-body')
    expect(content).toContain('.obs-guia-tab-btn')
  })

  it('should contain guide panel card class (.obs-guia-panel-card)', () => {
    const content = readFileSync(cssPath, 'utf-8')
    expect(content).toContain('.obs-guia-panel-card')
  })

  it('should contain log level classes (.obs-log-level-info, .obs-log-level-warning, .obs-log-level-error)', () => {
    const content = readFileSync(cssPath, 'utf-8')
    expect(content).toContain('.obs-log-level-info')
    expect(content).toContain('.obs-log-level-warning')
    expect(content).toContain('.obs-log-level-error')
  })
})

// ---------------------------------------------------------------------------
// Task B: Expanded mock data
// ---------------------------------------------------------------------------
describe('PR1 — Task B: Expanded mock data', () => {
  describe('audit trail — 20+ entries, new action types', () => {
    let auditLogs

    beforeAll(async () => {
      auditLogs = await observabilidadMock.getAuditLogs()
    })

    it('should have at least 20 audit entries', () => {
      expect(auditLogs.length).toBeGreaterThanOrEqual(20)
    })

    it('should include ausencia_creada action type', () => {
      const actions = auditLogs.map((e) => e.accion)
      expect(actions).toContain('ausencia_creada')
    })

    it('should include estado_modificado action type', () => {
      const actions = auditLogs.map((e) => e.accion)
      expect(actions).toContain('estado_modificado')
    })

    it('should include permiso_aprobado action type', () => {
      const actions = auditLogs.map((e) => e.accion)
      expect(actions).toContain('permiso_aprobado')
    })

    it('should still include existing action types (APROBACION_FINAL, CREACION, RECHAZO)', () => {
      const actions = auditLogs.map((e) => e.accion)
      expect(actions).toContain('APROBACION_FINAL')
      expect(actions).toContain('CREACION')
      expect(actions).toContain('RECHAZO')
    })

    it('each entry should have required properties', () => {
      auditLogs.forEach((entry) => {
        expect(entry).toHaveProperty('id')
        expect(entry).toHaveProperty('accion')
        expect(entry).toHaveProperty('actor_id')
        expect(entry).toHaveProperty('usuario_id')
        expect(entry).toHaveProperty('creado_a')
        expect(entry).toHaveProperty('notas')
      })
    })
  })

  describe('system logs — 15+ entries across levels', () => {
    let logs

    beforeAll(async () => {
      logs = await observabilidadMock.getSystemLogs()
    })

    it('should have at least 15 log entries', () => {
      expect(logs.length).toBeGreaterThanOrEqual(15)
    })

    it('should have entries at INFO level', () => {
      const levels = logs.map((l) => l.level)
      expect(levels).toContain('INFO')
    })

    it('should have entries at WARNING level', () => {
      const levels = logs.map((l) => l.level)
      expect(levels).toContain('WARNING')
    })

    it('should have entries at ERROR level', () => {
      const levels = logs.map((l) => l.level)
      expect(levels).toContain('ERROR')
    })

    it('each log entry should have required properties', () => {
      logs.forEach((log) => {
        expect(log).toHaveProperty('timestamp')
        expect(log).toHaveProperty('level')
        expect(log).toHaveProperty('module')
        expect(log).toHaveProperty('message')
        expect(log).toHaveProperty('network')
      })
    })
  })

  describe('getOperaciones — 10+ realistic operations', () => {
    let operaciones

    beforeAll(async () => {
      operaciones = await observabilidadMock.getOperaciones()
    })

    it('should have at least 10 operation entries', () => {
      expect(operaciones.length).toBeGreaterThanOrEqual(10)
    })

    it('each operation should have required properties', () => {
      operaciones.forEach((op) => {
        expect(op).toHaveProperty('id')
        expect(op).toHaveProperty('tipo')
        expect(op).toHaveProperty('descripcion')
        expect(op).toHaveProperty('estado')
        expect(op).toHaveProperty('timestamp')
      })
    })

    it('should have at least 3 distinct operation types', () => {
      const tipos = [...new Set(operaciones.map((op) => op.tipo))]
      expect(tipos.length).toBeGreaterThanOrEqual(3)
    })
  })
})

// ---------------------------------------------------------------------------
// Task C: API DataAdapter — getOperaciones
// ---------------------------------------------------------------------------
describe('PR1 — Task C: API DataAdapter for getOperaciones', () => {
  it('should export getOperaciones from observabilidadApi', () => {
    expect(observabilidadApi.getOperaciones).toBeDefined()
    expect(typeof observabilidadApi.getOperaciones).toBe('function')
  })

  it('mock getOperaciones should return data via DataAdapter', async () => {
    const { config } = await import('../../../core/config/config.js')
    const originalMode = config.isDemoMode
    config.isDemoMode = true

    const data = await observabilidadApi.getOperaciones()
    expect(data).toBeInstanceOf(Array)
    expect(data.length).toBeGreaterThanOrEqual(10)

    config.isDemoMode = originalMode
  })
})

// ---------------------------------------------------------------------------
// Task C: Supabase layer — getOperaciones
// ---------------------------------------------------------------------------
describe('PR1 — Task C: Supabase layer getOperaciones', () => {
  it('should export getOperaciones from observabilidadSupabase', async () => {
    const supabaseImpl = await import('../api/observabilidadSupabase.js')
    expect(supabaseImpl.getOperaciones).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// Task D: auditTrailWidget destroy() lifecycle
// ---------------------------------------------------------------------------
describe('PR1 — Task D: Destroy lifecycle', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('auditTrailWidget should return a destroy() method', () => {
    const widget = auditTrailWidget('test-audit-container')
    expect(widget.destroy).toBeDefined()
    expect(typeof widget.destroy).toBe('function')
  })

  it('dashboardMetricasView should export destroyDashboardMetricasView', async () => {
    const view = await import('../views/dashboardMetricasView.js')
    expect(view.destroyDashboardMetricasView).toBeDefined()
    expect(typeof view.destroyDashboardMetricasView).toBe('function')
  })

  it('destroyDashboardMetricasView should clean up state and listeners', async () => {
    const view = await import('../views/dashboardMetricasView.js')

    // Should not throw when called with no active state
    expect(() => view.destroyDashboardMetricasView()).not.toThrow()
  })
})
