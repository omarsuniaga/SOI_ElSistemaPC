import { describe,it,expect } from 'vitest'
import { CHANGELOG,APP_VERSION,APP_BUILD_DATE } from '../CHANGELOG.js'
import { renderVersionHistoryView } from '../versionHistoryView.js'
describe('documented SOI releases',()=>{
  it('keeps current version, publication day, unique semantic sequence and documented changes aligned',()=>{
    expect(CHANGELOG[0].version).toBe(APP_VERSION);expect(CHANGELOG[0].date).toBe(APP_BUILD_DATE)
    const seen=new Set()
    for(const release of CHANGELOG){expect(release.version).toMatch(/^\d+\.\d+\.\d+$/);expect(seen.has(release.version)).toBe(false);seen.add(release.version);expect(release.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);expect(release.changes.length).toBeGreaterThan(0)}
    for(let i=1;i<CHANGELOG.length;i++){const previous=CHANGELOG[i-1].version.split('.').map(Number);const next=CHANGELOG[i].version.split('.').map(Number);expect(previous[0]*1000000+previous[1]*1000+previous[2]).toBeGreaterThan(next[0]*1000000+next[1]*1000+next[2])}
  })
  it('exposes feature history and counts without exposing admin maintenance actions',()=>{
    const root=document.createElement('div');renderVersionHistoryView(root)
    expect(root.textContent).toContain(APP_VERSION);expect(root.textContent).toContain('Versiones documentadas');expect(root.textContent).toContain('Cambios documentados')
    expect(root.textContent).toContain('Cumpleañeros');expect(root.textContent).toContain('retrospectiva')
    expect(root.textContent).not.toContain('Optimizar base de datos');expect(root.textContent).not.toContain('Diagnóstico IA')
  })
})
