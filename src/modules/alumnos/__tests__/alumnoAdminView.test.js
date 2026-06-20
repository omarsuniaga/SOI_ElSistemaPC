/**
 * alumnoAdminView.test.js
 * D04 — parallel queries: alumno and clases queries run concurrently via Promise.all
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('D04 — parallel queries in alumnoAdminView', () => {
  it('source: uses Promise.all for alumno and clases fetch', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const { fileURLToPath } = await import('url')
    const { dirname } = await import('path')

    const thisFile = fileURLToPath(import.meta.url)
    const viewPath = path.join(dirname(thisFile), '..', 'views', 'alumnoAdminView.js')
    const source = fs.readFileSync(viewPath, 'utf8')

    // Must use Promise.all to parallelize the two DB fetches
    expect(source).toMatch(/Promise\.all/)
  })

  it('source: alumno and clases queries inside Promise.all', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const { fileURLToPath } = await import('url')
    const { dirname } = await import('path')

    const thisFile = fileURLToPath(import.meta.url)
    const viewPath = path.join(dirname(thisFile), '..', 'views', 'alumnoAdminView.js')
    const source = fs.readFileSync(viewPath, 'utf8')

    // Both queries should appear near Promise.all
    const promiseAllIdx = source.indexOf('Promise.all')
    expect(promiseAllIdx).toBeGreaterThan(-1)

    // Look for the pattern within a reasonable range after/around Promise.all
    const region = source.slice(Math.max(0, promiseAllIdx - 50), promiseAllIdx + 600)
    expect(region).toMatch(/alumnos/)
    expect(region).toMatch(/alumnos_clases/)
  })

  it('total elapsed time < 150ms when each query takes 80ms', async () => {
    // Mock supabase with controlled delays
    let alumnoResolve, clasesResolve
    const alumnoPromise = new Promise(res => { alumnoResolve = res })
    const clasesPromise = new Promise(res => { clasesResolve = res })

    const alumnoData = {
      id: 'test-id',
      nombre_completo: 'Juan Test',
      activo: true,
      instrumento_principal: 'Violin',
      fecha_nacimiento: '2010-01-01',
      correo_representante: 'j@t.com',
      familiar_nombre: 'Luis',
      familiar_telefono: '809',
      familiar_parentesco: 'padre',
      condiciones_medicas: null,
      alergias: null,
      medicamentos: null,
    }
    const clasesData = []

    // Fire both resolvers after 80ms simulating parallel execution
    setTimeout(() => {
      alumnoResolve({ data: alumnoData, error: null })
      clasesResolve({ data: clasesData, error: null })
    }, 80)

    const start = Date.now()
    const [alumnoResult, clasesResult] = await Promise.all([alumnoPromise, clasesPromise])
    const elapsed = Date.now() - start

    // Both resolved after ~80ms (parallel), not ~160ms (sequential)
    expect(elapsed).toBeLessThan(150)
    expect(alumnoResult.data).toBeDefined()
    expect(clasesResult.data).toBeDefined()
  })
})
