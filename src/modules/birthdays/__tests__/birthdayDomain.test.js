import { describe, it, expect } from 'vitest'
import { summarizeBirthdays, suggestCelebrationDate, validateCelebration, projectBirthday } from '../domain/birthdayDomain.js'
describe('monthly birthdays', () => {
  it('counts active records by role, sorts by civil day and exposes missing dates', () => {
    const report = summarizeBirthdays([{id:'a',kind:'alumno',name:'Ana',active:true,day:20,month:11},{id:'m',kind:'maestro',name:'Luis',active:true,day:2,month:11},{id:'n',kind:'alumno',active:true,day:null,month:null},{id:'i',kind:'maestro',active:false,day:1,month:11}], 11)
    expect(report.people.map(p=>p.id)).toEqual(['m','a']); expect(report).toMatchObject({total:2,alumnos:1,maestros:1,missing:1})
  })
  it('preserves February 29 in February without changing it to March or exposing birth year', () => {
    const person=projectBirthday({id:'a',nombre_completo:'Ana',activo:true,fecha_nacimiento:'2008-02-29'},'alumno','2026-11-14')
    expect(person).toMatchObject({day:29,month:2}); expect(JSON.stringify(person)).not.toContain('2008')
    expect(summarizeBirthdays([person],2).total).toBe(1)
    expect(suggestCelebrationDate(2027,2)).toBe('2027-02-28')
  })
  it('does not turn missing or future dates into birthdays',()=>{
    expect(projectBirthday({id:'x',activo:true,fecha_nacimiento:'2099-01-01'},'maestro','2026-11-14')).toMatchObject({day:null,month:null,needsReview:true})
  })
  it('rejects another month, reversed times and missing responsible person',()=>{
    const p={period:'2026-11',date:'2026-11-30',start:'17:00',end:'19:00',location:'Sede',responsible:'Omar',status:'programado'}
    expect(validateCelebration(p)).toEqual(p)
    expect(()=>validateCelebration({...p,date:'2026-12-01'})).toThrow('mes')
    expect(()=>validateCelebration({...p,end:'16:00'})).toThrow('final')
    expect(()=>validateCelebration({...p,responsible:''})).toThrow('responsable')
  })
})
