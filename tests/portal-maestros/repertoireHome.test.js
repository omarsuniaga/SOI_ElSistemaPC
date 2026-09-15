import { describe, expect, it } from 'vitest'
import { repertoireHomeMarkup } from '../../src/portal-maestros/views/repertorioView.js'

const official = { id: 'm-1', estado: 'EN_ESTUDIO', obra: { titulo: 'Danzón No. 2', compositor: 'A. Márquez' }, version: { nombre: 'Edición escolar' }, filas: [{ id: 'f-1', nombre: 'Violín I' }] }
const own = { id: 'o-1', titulo: 'Canon en Re', compositor: 'J. Pachelbel', obra_versiones: [{ id: 'v-1' }] }

describe('Teacher repertoire home', () => {
  it('renders real tabs and cards without a redundant open button', () => {
    const html = repertoireHomeMarkup({ montajes: [official], obras: [own] })
    expect(html).toContain('data-value="mine"')
    expect(html).toContain('data-value="official"')
    expect(html).toContain('Canon en Re')
    expect(html).not.toContain('class="btn btn-primary repertoire-open"')
    expect(html).toContain('repertoire-card-menu')
    expect(html).toContain('data-context-action="edit"')
    expect(html).toMatch(/data-context-action="delete"[^>]*disabled/)
  })

  it('filters by title/composer and renders the selected tab source', () => {
    const html = repertoireHomeMarkup({ montajes: [official], obras: [own], activeTab: 'official', search: 'márquez' })
    expect(html).toContain('Danzón No. 2')
    expect(html).not.toContain('Canon en Re')
    expect(html).toContain('value="márquez"')
  })

  it('renders empty, loading and error states without demo fallback data', () => {
    expect(repertoireHomeMarkup({ montajes: [], obras: [] })).toContain('Tu repertorio está vacío')
    expect(repertoireHomeMarkup({ montajes: [], obras: [], loading: true })).toContain('pm-skeleton-card')
    expect(repertoireHomeMarkup({ montajes: [], obras: [], activeTab: 'official', error: new Error('network') })).toContain('No se pudo cargar el repertorio')
    expect(repertoireHomeMarkup({ montajes: [], obras: [] })).not.toContain('Danzón')
  })

  it('keeps the create workflow available and escapes card content', () => {
    const html = repertoireHomeMarkup({ montajes: [], obras: [], canCreate: true, action: 'new-work', teachingScopes: [{ id: 'scope-1', name: 'Cuerdas' }] })
    expect(html).toContain('repertoire-work-form')
    expect(html).toContain('scope-1')
    expect(repertoireHomeMarkup({ montajes: [], obras: [{ titulo: '<script>alert(1)</script>' }] })).not.toContain('<script>alert(1)</script>')
  })
})
