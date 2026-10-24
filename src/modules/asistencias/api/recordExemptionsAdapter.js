import { supabase } from '../../../lib/supabaseClient.js'
import fixture from '../../../assets/data/mocks/registro-exoneraciones.json'
import classesFixture from '../../../assets/data/mocks/clases.json'

const demo = import.meta.env.VITE_USE_MOCK === 'true'
const records = structuredClone(fixture.exoneraciones)
const demoValidity = new Map()
const assertResult = ({ data, error }) => { if (error) throw new Error(error.message); return data }

export async function listRecordExemptions(maestroId, from, to) {
  if (demo) return records.filter(x => x.maestro_id === maestroId && x.fecha >= from && x.fecha <= to).map(x => ({ ...x }))
  return assertResult(await supabase.from('registro_exoneraciones').select('*').eq('maestro_id', maestroId).gte('fecha', from).lte('fecha', to).order('creado_en', { ascending: false })) || []
}

export async function createRecordExemption({ claseId, maestroId, fecha, alcance, motivo }) {
  const reason = motivo?.trim() || ''
  if (reason.length < 10 || reason.length > 2000) throw new Error('El motivo debe tener entre 10 y 2000 caracteres.')
  if (!['asistencia', 'contenido', 'ambos'].includes(alcance)) throw new Error('Alcance inválido.')
  const row = { clase_id: claseId, maestro_id: maestroId, fecha, alcance, motivo: reason }
  if (demo) {
    if (records.some(x => x.clase_id === claseId && x.maestro_id === maestroId && x.fecha === fecha && x.alcance === alcance && !x.revocado_en)) throw new Error('Ya existe una exoneración activa para ese alcance.')
    const saved = { ...row, id: crypto.randomUUID(), creado_por: 'demo-admin', creado_en: new Date().toISOString(), revocado_en: null }
    records.push(saved)
    return { ...saved }
  }
  return assertResult(await supabase.from('registro_exoneraciones').insert(row).select().single())
}

export async function revokeRecordExemption(id, motivo) {
  const reason = motivo?.trim() || ''
  if (reason.length < 10 || reason.length > 2000) throw new Error('Explique la revocación en 10 a 2000 caracteres.')
  if (demo) {
    const row = records.find(x => x.id === id && !x.revocado_en)
    if (!row) throw new Error('Exoneración no disponible.')
    Object.assign(row, { motivo_revocacion: reason, revocado_en: new Date().toISOString(), revocado_por: 'demo-admin' })
    return { ...row }
  }
  return assertResult(await supabase.from('registro_exoneraciones').update({ motivo_revocacion: reason }).eq('id', id).is('revocado_en', null).select().single())
}

export async function getClassValidity(claseId) {
  if (demo) {
    if (!demoValidity.has(claseId)) {
      const classes = Array.isArray(classesFixture) ? classesFixture : classesFixture.clases || []
      const clase = classes.find(c => c.id === claseId) || { id: claseId }
      demoValidity.set(claseId, { clase, horarios: (clase.horarios || []).map((h, i) => ({ ...h, id: `${claseId}-${i}` })) })
    }
    return structuredClone(demoValidity.get(claseId))
  }
  const [clase, horarios] = await Promise.all([
    supabase.from('clases').select('id,nombre,fecha_inicio,created_at').eq('id', claseId).single(),
    supabase.from('clase_horarios').select('id,dia,hora_inicio,vigente_desde,vigente_hasta,created_at').eq('clase_id', claseId),
  ])
  return { clase: assertResult(clase), horarios: assertResult(horarios) || [] }
}

export async function saveClassValidity(claseId, start, schedules) {
  if (demo) {
    const current = await getClassValidity(claseId)
    demoValidity.set(claseId, { clase: { ...current.clase, fecha_inicio: start || null }, horarios: schedules })
    return
  }
  assertResult(await supabase.rpc('save_class_validity', { p_clase_id: claseId, p_fecha_inicio: start || null, p_horarios: schedules }))
}

export async function getExemptionCandidates(maestroId, fecha) {
  if (demo) {
    const classes = Array.isArray(classesFixture) ? classesFixture : classesFixture.clases || []
    const day = new Intl.DateTimeFormat('es-DO', { weekday:'long',timeZone:'UTC' }).format(new Date(`${fecha}T12:00:00Z`)).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    return classes.filter(c => [c.maestro_titular_id,c.maestro_principal_id,c.maestro_auxiliar_id].includes(maestroId)).flatMap(c => (c.horarios || []).filter(h => h.dia.normalize('NFD').replace(/[\u0300-\u036f]/g,'') === day).map(h => ({clase_id:c.id,clase_nombre:c.nombre,fecha,hora_inicio:h.hora_inicio,estado:'pendiente'})))
  }
  return assertResult(await supabase.rpc('fn_estado_asistencia_maestro', {p_maestro_id:maestroId,p_desde:fecha,p_hasta:fecha})) || []
}
