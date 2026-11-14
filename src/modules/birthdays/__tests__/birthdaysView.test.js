import { beforeEach,afterEach,describe,it,expect,vi } from 'vitest'
import { fireEvent,waitFor } from '@testing-library/dom'
import { renderBirthdaysView } from '../views/birthdaysView.js'
import { createBirthdaysAdapter } from '../api/birthdaysAdapter.js'
import { mountTeacherBirthDateField } from '../components/teacherBirthDateField.js'
let root
beforeEach(()=>{root=document.createElement('div');document.body.append(root)})
afterEach(()=>root.remove())
const fixture={people:[{id:'a1',kind:'alumno',nombre_completo:'Ana',activo:true,fecha_nacimiento:'2010-11-20'},{id:'m1',kind:'maestro',nombre_completo:'Laura',activo:true,fecha_nacimiento:'1990-11-10'},{id:'a2',kind:'alumno',nombre_completo:'<img src=x>',activo:true,fecha_nacimiento:null},{id:'a3',kind:'alumno',nombre_completo:'Inactivo',activo:false,fecha_nacimiento:'2011-11-01'}],celebrations:[]}
const adapter=()=>createBirthdaysAdapter({rpc:vi.fn()},{demo:true,data:fixture})
describe('birthday management UI',()=>{
  it('counts the selected month, excludes inactive records and never displays birth years',async()=>{
    await renderBirthdaysView(root,{period:'2026-11'},adapter())
    expect(root.querySelectorAll('.birthday-list>.birthday-person')).toHaveLength(2)
    expect(root.querySelectorAll('.birthday-stats strong')[3].textContent).toBe('1')
  })
  it('filters by month and role, lists pending data, and escapes names',async()=>{
    await renderBirthdaysView(root,{period:'2026-11'},adapter())
    const search=root.querySelector('[data-search]');search.focus();fireEvent.input(search,{target:{value:'Laura'}});expect(document.activeElement).toBe(root.querySelector('[data-search]'));expect(root.querySelectorAll('.birthday-list>.birthday-person')).toHaveLength(1);fireEvent.input(root.querySelector('[data-search]'),{target:{value:''}})
    expect(root.querySelector('img')).toBeNull();expect(root.textContent).not.toContain('1990');expect(root.textContent).not.toContain('2010')
    fireEvent.change(root.querySelector('[data-kind]'),{target:{value:'maestro'}})
    expect(root.querySelectorAll('.birthday-list>.birthday-person')).toHaveLength(1)
    fireEvent.change(root.querySelector('[data-month]'),{target:{value:'1'}})
    expect(root.querySelectorAll('.birthday-list>.birthday-person')).toHaveLength(0)
  })
  it('creates, reopens and marks a celebration completed using the same saved record',async()=>{
    const api=adapter();await renderBirthdaysView(root,{period:'2026-11'},api)
    root.querySelector('[name="location"]').value='Sede';root.querySelector('[name="responsible"]').value='Omar'
    fireEvent.submit(root.querySelector('[data-celebration]'))
    await waitFor(()=>expect(root.textContent).toContain('Compartir guardado en el calendario'))
    const record=(await api.load(2026)).celebrations[0];expect(record.date).toBe('2026-11-30')
    await renderBirthdaysView(root,{period:'2026-11'},api)
    expect(root.querySelector('[name="responsible"]').value).toBe('Omar')
    root.querySelector('[name="status"]').value='completado';fireEvent.submit(root.querySelector('[data-celebration]'))
    await waitFor(()=>expect(root.textContent).toContain('Realizado'))
    expect((await api.load(2026)).celebrations).toHaveLength(1)
  })
  it('preserves form values and offers retry after save failure',async()=>{
    const api=adapter();api.saveCelebration=vi.fn().mockRejectedValue(new Error('Sin conexión'))
    await renderBirthdaysView(root,{period:'2026-11'},api)
    root.querySelector('[name="location"]').value='Sede';root.querySelector('[name="responsible"]').value='Omar'
    fireEvent.submit(root.querySelector('[data-celebration]'))
    await waitFor(()=>expect(root.textContent).toContain('Sin conexión'))
    expect(root.querySelector('[name="responsible"]').value).toBe('Omar');expect(root.querySelector('[data-celebration] button').disabled).toBe(false)
  })
  it('completes a missing date and includes it in the corresponding month after reload',async()=>{
    const api=adapter();await renderBirthdaysView(root,{period:'2026-11'},api)
    const form=root.querySelector('[data-person="alumno:a2"]');form.querySelector('input').value='2012-11-25';fireEvent.submit(form)
    await waitFor(()=>expect(root.textContent).toContain('Fecha de nacimiento guardada.'))
    expect(root.querySelectorAll('.birthday-list>.birthday-person')).toHaveLength(3)
  })
  it('loads only the maestros own date and saves through the own-date method',async()=>{
    const api={getOwnBirthDate:vi.fn().mockResolvedValue({available:true,date:'1990-11-10'}),saveOwnBirthDate:vi.fn().mockResolvedValue(null)}
    await mountTeacherBirthDateField(root,api)
    expect(root.querySelector('input').value).toBe('1990-11-10')
    root.querySelector('input').value='1990-12-10';fireEvent.click(root.querySelector('button'))
    await waitFor(()=>expect(api.saveOwnBirthDate).toHaveBeenCalledWith('1990-12-10'))
    expect(root.textContent).toContain('solo se mostrarán el día y el mes')
  })
  it('does not replace another view when a birthday query finishes after navigation',async()=>{
    let resolve
    const pending=new Promise(done=>{resolve=done})
    const loading=renderBirthdaysView(root,{period:'2026-11'},{load:()=>pending})
    root.innerHTML='<p>Otra vista</p>'
    resolve({people:[],celebrations:[]})
    await loading
    expect(root.textContent).toBe('Otra vista')
  })

})
