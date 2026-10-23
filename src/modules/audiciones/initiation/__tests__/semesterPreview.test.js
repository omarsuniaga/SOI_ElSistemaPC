import {afterEach,describe,it,expect,vi} from 'vitest'
const {mount}=vi.hoisted(()=>({mount:vi.fn().mockResolvedValue({})}))
vi.mock('../semesterView.js',()=>({mountSemester:mount}))
vi.mock('../../../../lib/supabaseClient.js',()=>({supabase:{}}))
afterEach(()=>{vi.unstubAllEnvs();mount.mockClear()})
describe('Auditions preview isolation',()=>{
 it('does not let a URL parameter replace the real adapter in production',async()=>{
  vi.resetModules();vi.stubEnv('VITE_AUDITION_PREVIEW','false');window.history.replaceState({},'','/audiciones.html?demo=1#iniciacion');document.body.innerHTML='<div id="app"></div>'
  await import('../../../../portales/audiciones/audiciones.js');await vi.waitFor(()=>expect(mount).toHaveBeenCalled())
  expect(mount.mock.calls[0][1]).toBeUndefined()
 })
 it('uses the isolated synthetic adapter only when preview compilation and the explicit URL agree',async()=>{
  vi.resetModules();vi.stubEnv('VITE_AUDITION_PREVIEW','true');window.history.replaceState({},'','/audiciones.html?demo=1#iniciacion');document.body.innerHTML='<div id="app"></div>'
  await import('../../../../portales/audiciones/audiciones.js');await vi.waitFor(()=>expect(mount).toHaveBeenCalled())
  expect(mount.mock.calls[0][1].demo).toBe(true)
  const context=await mount.mock.calls[0][1].execute('contexto');expect(context.demo).toBe(true)
 })
})
