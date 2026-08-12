import { describe, expect, it } from 'vitest'
import { filterCatalogModules } from './catalogDiagnosticsView.js'

describe('catalog diagnostic filters', () => {
  it('filters the shadow inventory by owner, route kind and descriptive state', () => {
    expect(filterCatalogModules({ owner: 'MAESTROS' }).map(module => module.moduleId)).toEqual(['teacher-core'])
    expect(filterCatalogModules({ kind: 'external-entry' }).map(module => module.moduleId)).toEqual(['audiciones-entry'])
    expect(filterCatalogModules({ status: 'CANDIDATO' }).map(module => module.moduleId))
      .toEqual(expect.arrayContaining(['periodos', 'academic-admin']))
  })
})
