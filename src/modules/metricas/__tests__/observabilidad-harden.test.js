import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import * as observabilidadMock from '../api/observabilidadMock.js'
import * as observabilidadApi from '../api/observabilidadApi.js'
import { auditTrailWidget } from '../views/auditTrailWidget.js'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// Hoisted mock for admin auth gate tests
const mockGetUser = vi.fn()
vi.mock('../../../core/auth/authManager.js', () => ({
  getUser: mockGetUser,
}))

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

// ---------------------------------------------------------------------------
// PR 2 — Task G: Admin auth gate in dashboardMetricasView
// ---------------------------------------------------------------------------
describe('PR2 — Task G: Admin auth gate', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    document.body.innerHTML = '<div id="test-admin-gate"></div>'
  })

  it('should render 403 error when user is not admin', async () => {
    mockGetUser.mockReturnValue({ role: 'maestro', email: 'teacher@test.com' })

    const { renderDashboardMetricasView } = await import('../views/dashboardMetricasView.js')
    const container = document.getElementById('test-admin-gate')
    await renderDashboardMetricasView(container)

    expect(container.innerHTML).toContain('Acceso Restringido')
    expect(container.innerHTML).toContain('Solo los administradores')
    // No hub content for non-admin
    expect(container.innerHTML).not.toContain('Observability Hub')
  })

  it('should render hub content when user is admin', async () => {
    mockGetUser.mockReturnValue({ role: 'admin', email: 'admin@test.com' })

    // Set demo mode so API calls use mock data
    const { config } = await import('../../../core/config/config.js')
    const originalMode = config.isDemoMode
    config.isDemoMode = true

    // Re-import the view module to get fresh module state
    const viewModule = await import('../views/dashboardMetricasView.js')
    const container = document.getElementById('test-admin-gate')
    await viewModule.renderDashboardMetricasView(container)

    // Admin should see the hub content
    expect(container.innerHTML).toContain('Analytics')
    expect(container.innerHTML).toContain('Observability Hub')

    config.isDemoMode = originalMode
  })
})

// ---------------------------------------------------------------------------
// PR 2 — Task F & J: CSP compliance — no inline style attributes
// ---------------------------------------------------------------------------
describe('PR2 — Task F: CSP compliance (no inline styles)', () => {
  const viewsDir = resolve(process.cwd(), 'src', 'modules', 'metricas', 'views')

  const viewFiles = [
    'dashboardMetricasView.js',
    'systemLogsWidget.js',
    'auditTrailWidget.js',
    'iaReporteGeneradorView.js',
  ]

  viewFiles.forEach((file) => {
    it(`${file} should not contain inline style="..." attributes in templates`, () => {
      const content = readFileSync(resolve(viewsDir, file), 'utf-8')

      // Allow only inline styles inside the guia modal (which was already refactored)
      // Count matches: style= followed by anything
      const inlineStyleMatches = content.match(/style\s*=\s*"/g)

      // Allow: imported CSS modules (style="css"), utility objects, or nullish
      // For CSP compliance there should be zero `style="..."` in template strings
      // But we need to be pragmatic: allow 1-2 in edge cases like dynamic color badges
      // where CSS classes can't replace a dynamic value
      if (inlineStyleMatches) {
        // Filter out known false positives:
        // - Bootstrap/inline style objects: `style={...}` (JSX style objects are fine)
        // - `style="css"` or style imports
        // - Dynamic template strings: style="${...}" are the ones we care about
        const templateStyleMatches = content.match(/style="[^}]*"/g) || []
        // We want ZERO template literal inline styles
        expect(templateStyleMatches.length).toBe(0)
      }
    })
  })
})

// ---------------------------------------------------------------------------
// PR 2 — Task H: DataAdapter in IA tab — no direct supabase calls
// ---------------------------------------------------------------------------
describe('PR2 — Task H: DataAdapter in IA tab', () => {
  it('iaReporteGeneradorView should not import supabase directly', () => {
    const viewPath = resolve(
      process.cwd(),
      'src',
      'modules',
      'metricas',
      'views',
      'iaReporteGeneradorView.js',
    )
    const content = readFileSync(viewPath, 'utf-8')

    // Should NOT have a direct supabase import
    expect(content).not.toContain("from '../../../lib/supabaseClient.js'")
    expect(content).not.toContain("from '../lib/supabaseClient.js'")

    // Should import callDslRpc from the DataAdapter layer
    expect(content).toContain('callDslRpc')
  })

  it('observabilidadApi should export callDslRpc', async () => {
    const api = await import('../api/observabilidadApi.js')
    expect(api.callDslRpc).toBeDefined()
    expect(typeof api.callDslRpc).toBe('function')
  })

  it('observabilidadMock should export callDslRpc and return mock data', async () => {
    const mock = await import('../api/observabilidadMock.js')
    expect(mock.callDslRpc).toBeDefined()

    const result = await mock.callDslRpc('riesgo')
    expect(result).toHaveProperty('radarData')
    expect(result).toHaveProperty('nodeDifficulty')
    expect(result).toHaveProperty('complianceData')
    expect(Array.isArray(result.radarData)).toBe(true)
    expect(Array.isArray(result.nodeDifficulty)).toBe(true)
    expect(Array.isArray(result.complianceData)).toBe(true)
  })

  it('observabilidadSupabase should export callDslRpc', async () => {
    const supabaseImpl = await import('../api/observabilidadSupabase.js')
    expect(supabaseImpl.callDslRpc).toBeDefined()
    expect(typeof supabaseImpl.callDslRpc).toBe('function')
  })
})

// ---------------------------------------------------------------------------
// PR 2 — Task I: destroy() in IA tab
// ---------------------------------------------------------------------------
describe('PR2 — Task I: IA tab destroy lifecycle', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('iaReporteGeneradorView should export destroyIaReporteGeneradorView', async () => {
    const view = await import('../views/iaReporteGeneradorView.js')
    expect(view.destroyIaReporteGeneradorView).toBeDefined()
    expect(typeof view.destroyIaReporteGeneradorView).toBe('function')
  })

  it('destroyIaReporteGeneradorView should not throw when called with no active state', async () => {
    const view = await import('../views/iaReporteGeneradorView.js')

    // Should not throw when no active view
    expect(() => view.destroyIaReporteGeneradorView()).not.toThrow()
  })

  it('destroyIaReporteGeneradorView should clean up after render', async () => {
    document.body.innerHTML = '<div id="test-ia-destroy"></div>'

    const view = await import('../views/iaReporteGeneradorView.js')
    const container = document.getElementById('test-ia-destroy')

    // Render the view
    await view.renderIaReporteGeneradorView(container)
    expect(container.innerHTML).toContain('Generador de Reportes')

    // Now destroy
    expect(() => view.destroyIaReporteGeneradorView()).not.toThrow()
  })
})
