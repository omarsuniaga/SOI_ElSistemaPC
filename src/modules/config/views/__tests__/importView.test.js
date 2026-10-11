import { beforeEach, describe, expect, it, vi } from 'vitest'

const hostileHeader = '<svg onload="window.__pwned=2">'
const hostileCell = '<img src=x onerror="window.__pwned=1">'

vi.mock('../../components/importData.js', () => ({
  getImportEntities: vi.fn(() => ({})),
  getEntityTemplate: vi.fn(),
  parseCSV: vi.fn(),
  parseJSON: vi.fn(),
  previewImport: vi.fn(),
  importData: vi.fn(),
}))

import * as importData from '../../components/importData.js'
import { renderImportView } from '../importView.js'

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

async function setup() {
  const container = document.createElement('div')
  document.body.appendChild(container)
  await renderImportView(container)
  return container
}

function typeData(container, text) {
  const textarea = container.querySelector('#import-data')
  textarea.value = text
  textarea.dispatchEvent(new Event('input'))
}

function expectNoActiveMarkup(container) {
  expect(container.querySelector('img, svg')).toBeNull()
  expect(window.__pwned).toBeUndefined()
}

beforeEach(() => {
  document.body.innerHTML = ''
  delete window.__pwned
  vi.clearAllMocks()
})

describe('importView: contenido no confiable se muestra como texto', () => {
  it('la previsualización muestra encabezados y celdas hostiles literalmente y conserva datos válidos', async () => {
    importData.parseJSON.mockReturnValue({ data: [{ [hostileHeader]: hostileCell }] })
    importData.previewImport.mockResolvedValue([
      { data: { [hostileHeader]: hostileCell, nombre: 'Ana & Luis "E"' }, issues: [] },
    ])
    const container = await setup()

    typeData(container, '[{"a":1}]')
    container.querySelector('#preview-btn').click()
    await flush()

    expect(container.querySelector('#preview-thead').textContent).toContain(hostileHeader)
    expect(container.querySelector('#preview-tbody').textContent).toContain(hostileCell)
    expect(container.querySelector('#preview-tbody').textContent).toContain('Ana & Luis "E"')
    expectNoActiveMarkup(container)
  })

  it('un error de parseo JSON devuelto se muestra como texto', async () => {
    importData.parseJSON.mockReturnValue({ error: hostileCell })
    const container = await setup()

    typeData(container, '[{"a":1}]')

    expect(container.querySelector('#parse-status').textContent).toContain(hostileCell)
    expectNoActiveMarkup(container)
  })

  it('un error de parseo CSV devuelto se muestra como texto', async () => {
    importData.parseCSV.mockReturnValue({ error: hostileCell })
    const container = await setup()

    typeData(container, 'a,b\n1,2')

    expect(container.querySelector('#parse-status').textContent).toContain(hostileCell)
    expectNoActiveMarkup(container)
  })

  it('una excepción al parsear se muestra como texto', async () => {
    importData.parseJSON.mockImplementation(() => {
      throw new Error(hostileCell)
    })
    const container = await setup()

    typeData(container, '[{"a":1}]')

    expect(container.querySelector('#parse-status').textContent).toContain(hostileCell)
    expectNoActiveMarkup(container)
  })

  it('los errores devueltos por la importación se muestran como texto', async () => {
    importData.parseJSON.mockReturnValue({ data: [{ a: 1 }] })
    importData.previewImport.mockResolvedValue([])
    importData.importData.mockResolvedValue({ success: 0, errors: [{ row: 2, error: hostileCell }] })
    const container = await setup()

    typeData(container, '[{"a":1}]')
    container.querySelector('#preview-btn').click()
    await flush()
    container.querySelector('#execute-import-btn').click()
    await flush()

    expect(container.querySelector('#results-content').textContent).toContain(hostileCell)
    expectNoActiveMarkup(container)
  })
})
