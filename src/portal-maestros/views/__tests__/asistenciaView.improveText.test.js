import { describe, it, expect } from 'vitest'

// Simple test to verify imports are present
describe('asistenciaView - Improve Text Integration', () => {
  it('should have improveText imported in asistenciaView', async () => {
    // Read the source to verify improveText is imported
    const fs = await import('fs')
    const path = await import('path')

    const filePath = path.resolve('./src/portal-maestros/views/asistenciaView.js')
    const content = fs.readFileSync(filePath, 'utf-8')

    expect(content).toContain('improveText')
    expect(content).toContain('import { createImproveTextModal }')
  })

  it('should have improveTextModal component imported', async () => {
    const fs = await import('fs')
    const path = await import('path')

    const filePath = path.resolve('./src/portal-maestros/views/asistenciaView.js')
    const content = fs.readFileSync(filePath, 'utf-8')

    expect(content).toContain("import { createImproveTextModal } from '../components/improveTextModal.js'")
  })

  it('should have onImproveClick callback passed to toolbar', async () => {
    const fs = await import('fs')
    const path = await import('path')

    const filePath = path.resolve('./src/portal-maestros/views/asistenciaView.js')
    const content = fs.readFileSync(filePath, 'utf-8')

    expect(content).toContain('onImproveClick')
  })

  it('should wire improveText to modal open call', async () => {
    const fs = await import('fs')
    const path = await import('path')

    const filePath = path.resolve('./src/portal-maestros/views/asistenciaView.js')
    const content = fs.readFileSync(filePath, 'utf-8')

    expect(content).toContain('informeModal.open')
    expect(content).toContain('await improveText(text)')
  })
})
