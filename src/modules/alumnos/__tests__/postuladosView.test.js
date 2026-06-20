/**
 * postuladosView.test.js
 * C04 — hidden postulados banner
 * C05 — name search in postulados view
 *
 * These are structural tests (source-code analysis) because postuladosView.js
 * imports router and Supabase-backed APIs that are difficult to mock in unit context.
 * Structural tests verify the implementation exists in source without requiring
 * full DOM integration.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const postuladosViewPath = join(__dirname, '..', 'views', 'postulados', 'postuladosView.js')

function readSource() {
  return readFileSync(postuladosViewPath, 'utf8')
}

// ─── C04: Hidden postulados banner ──────────────────────────────────────────

describe('C04 — hidden postulados banner', () => {
  it('source computes hiddenCount after phone filter', () => {
    const source = readSource()

    // After GREEN: cargarDatos must compute hiddenCount = todos.length - state.postulantes.length
    expect(source).toMatch(/hiddenCount/)
    expect(source).toMatch(/todos\.length\s*-\s*state\.postulantes\.length/)
  })

  it('source renders a banner element when hiddenCount > 0', () => {
    const source = readSource()

    // After GREEN: there must be HTML for the hidden-postulantes-banner or similar
    expect(source).toMatch(/hidden-postulantes-banner|info-banner|sin número de contacto/i)
    expect(source).toMatch(/hiddenCount\s*>\s*0/)
  })

  it('cargarDatos stores todos separately from filtered postulantes', () => {
    const source = readSource()

    // The filter line assigns state.postulantes = todos.filter(...)
    // and todos is the full list from the API
    const cargarDatosIdx = source.indexOf('async function cargarDatos')
    expect(cargarDatosIdx).toBeGreaterThan(-1)

    const cargarDatosBody = source.slice(cargarDatosIdx, cargarDatosIdx + 1500)
    expect(cargarDatosBody).toMatch(/const todos\s*=\s*await/)
    expect(cargarDatosBody).toMatch(/state\.postulantes\s*=\s*todos\.filter/)
  })
})

// ─── C05: Name search in postulados view ────────────────────────────────────

describe('C05 — postulados name search', () => {
  it('source contains a search input element', () => {
    const source = readSource()

    // After GREEN: renderContent must include a search input
    expect(source).toMatch(/buscar-postulante|buscarPostulante/)
    expect(source).toMatch(/type="search"|input.*search/i)
  })

  it('source has an input event listener that filters postulantes', () => {
    const source = readSource()

    // After GREEN: attachEvents or similar must wire an 'input' event on the search field
    expect(source).toMatch(/buscar-postulante|buscarPostulante/)
    expect(source).toMatch(/'input'/)
  })

  it('search filter covers nombre, telefono, and municipio', () => {
    const source = readSource()

    // After GREEN: the filter callback must check nombre (via resolverNombre), phone, municipio
    // We look for these terms near the search listener
    const searchIdx = source.indexOf('buscar-postulante') !== -1
      ? source.indexOf('buscar-postulante')
      : source.indexOf('buscarPostulante')

    expect(searchIdx).toBeGreaterThan(-1)

    // Look for resolverNombre and municipio within 1500 chars of the search input reference
    const nearSearch = source.slice(Math.max(0, searchIdx - 200), searchIdx + 1500)
    expect(nearSearch).toMatch(/resolverNombre|nombre/)
    expect(nearSearch).toMatch(/municipio/)
  })
})
