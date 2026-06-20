import { describe, it, expect } from 'vitest'

describe('asistenciaView - Toast Replacement', () => {
  it('should import AppToast from AppToast.js', async () => {
    const fs = await import('fs')
    const path = await import('path')

    const filePath = path.resolve('./src/portal-maestros/views/asistenciaView.js')
    const content = fs.readFileSync(filePath, 'utf-8')

    expect(content).toContain("import { AppToast } from '../../shared/components/AppToast.js'")
  })

  it('should replace alert for "Error al generar informe" with AppToast.error', async () => {
    const fs = await import('fs')
    const path = await import('path')

    const filePath = path.resolve('./src/portal-maestros/views/asistenciaView.js')
    const content = fs.readFileSync(filePath, 'utf-8')

    // The alert() call must be replaced with AppToast.error()
    expect(content).toContain("AppToast.error('Error al generar informe: ' + err.message)")
    // Ensure the old alert() is gone
    expect(content).not.toContain("alert('Error al generar informe:")
  })

  it('should replace alert for "Error al estructurar con IA" with AppToast.error', async () => {
    const fs = await import('fs')
    const path = await import('path')

    const filePath = path.resolve('./src/portal-maestros/views/asistenciaView.js')
    const content = fs.readFileSync(filePath, 'utf-8')

    expect(content).toContain("AppToast.error('Error al estructurar con IA: ' + err.message)")
    expect(content).not.toContain("alert('Error al estructurar con IA:")
  })

  it('should replace alert for "Error al guardar la planificación" with AppToast.error (in PlanificationCard.js)', async () => {
    const fs = await import('fs')
    const path = await import('path')

    const filePath = path.resolve('./src/portal-maestros/components/attendance/PlanificationCard.js')
    const content = fs.readFileSync(filePath, 'utf-8')

    expect(content).toContain("AppToast.error('Error al guardar la planificación: ' + (err.message || err))")
    expect(content).not.toContain("alert('Error al guardar la planificación:")
  })
})
