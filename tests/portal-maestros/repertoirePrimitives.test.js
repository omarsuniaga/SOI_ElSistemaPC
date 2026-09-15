import { describe, expect, it } from 'vitest'
import { renderActionSheet, renderBottomSheet, renderConfirmDialog, renderDerivedPresentation, renderHorizontalFilaTabs, renderMeasureGridShell, renderMeasureCell, renderSegmentedControl, renderSaveStatus } from '../../src/portal-maestros/components/repertoirePrimitives.js'

describe('Repertoire premium primitives', () => {
  it('renders an accessible segmented control with one active option', () => {
    const html = renderSegmentedControl({ label: 'Vista', value: 'fila', options: [{ value: 'fila', label: 'Fila' }, { value: 'alumnos', label: 'Alumnos' }] })
    expect(html).toContain('role="group"')
    expect(html).toContain('aria-pressed="true"')
    expect(html).toContain('Alumnos')
  })

  it('renders fila tabs with roving tabindex semantics', () => {
    const html = renderHorizontalFilaTabs({ activeId: 'v1', filas: [{ id: 'v1', name: 'Violín I' }, { id: 'v2', name: 'Violas' }] })
    expect(html).toContain('role="tablist"')
    expect(html).toContain('aria-selected="true"')
    expect(html).toContain('tabindex="-1"')
  })

  it('keeps the configured number of numbered cells in each row', () => {
    const html = renderMeasureGridShell({ measures: Array.from({ length: 16 }, (_, i) => ({ id: i + 1, numero_visible: i + 1 })), measuresPerRow: 8 })
    expect(html.match(/class="pm-measure-grid__row"/g)).toHaveLength(2)
    expect(html.match(/class="pm-measure-cell /g)).toHaveLength(16)
    expect(html).toContain('--measures-per-row:8')
  })

  it('exposes measure state, applicability and selection through accessible markup', () => {
    const html = renderMeasureCell({ measure: { id: 'm-4', numero_visible: 4 }, state: 'DOMINADO', applicability: 'TOCA', selected: true, linked: true })
    expect(html).toContain('Compás 4 — DOMINADO')
    expect(html).toContain('aria-pressed="true"')
    expect(html).toContain('is-linked')
  })

  it('makes individual overrides explicit instead of replacing collective context', () => {
    const html = renderDerivedPresentation({ collectiveState: 'CON_DIFICULTAD', individualState: 'DOMINADO' })
    expect(html).toContain('Override individual')
    expect(html).toContain('DOMINADO')
    expect(html).toContain('CON_DIFICULTAD')
  })

  it('renders a touch-safe action sheet with selected count and actions', () => {
    const html = renderActionSheet({ id: 'bulk-actions', selectedCount: 4, actions: [{ id: 'state', label: 'Cambiar estado' }] })
    expect(html).toContain('4 compases seleccionados')
    expect(html).toContain('data-action="state"')
    expect(html).toContain('role="dialog"')
  })

  it('renders closable sheets and safe destructive confirmation controls', () => {
    expect(renderBottomSheet({ id: 'filters', title: 'Filtros', open: true })).toContain('data-sheet-close="filters"')
    const dialog = renderConfirmDialog({ id: 'delete-work', title: 'Eliminar obra', message: 'Esta acción no se puede deshacer.', danger: true })
    expect(dialog).toContain('role="alertdialog"')
    expect(dialog).toContain('data-dialog-close="delete-work"')
    expect(dialog).toContain('data-dialog-confirm="delete-work"')
  })

  it('exposes offline and pending-sync save states without claiming persistence', () => {
    expect(renderSaveStatus('offline')).toContain('Sin conexión')
    expect(renderSaveStatus('pending-sync')).toContain('Pendiente de sincronizar')
  })
})
