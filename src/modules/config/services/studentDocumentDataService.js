import { supabase } from '../../../lib/supabaseClient.js'

const INST = {
  nombre:    'El Sistema Punta Cana',
  fundacion: 'Fundación para la Educación y Cultura a través de la Música',
}

export async function getStudentDocumentData(alumnoId) {
  const { data: alumno, error } = await supabase
    .from('alumnos')
    .select('*')
    .eq('id', alumnoId)
    .single()
  if (error) throw error
  const escolaridad = await getActiveSchooling(alumnoId)
  return { alumno, escolaridad }
}

export async function getActiveSchooling(alumnoId) {
  const { data } = await supabase
    .from('alumno_escolaridad')
    .select('*')
    .eq('alumno_id', alumnoId)
    .eq('activo', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data || null
}

export function buildStudentDocumentContext({ alumno, escolaridad, actividad = {}, extra = {} }) {
  const a = alumno || {}
  const e = escolaridad || {}
  const hoy = new Date().toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' })

  return {
    nombre_alumno:           a.nombre_completo || '',
    instrumento:             a.instrumento_principal || '',
    nivel_alumno:            a.nivel_actual || a.nivel || '',
    nacionalidad:            a.nacionalidad || '',
    fecha_nacimiento:        a.fecha_nacimiento || '',
    tiene_pasaporte:         a.tiene_pasaporte ? 'Sí' : 'No',
    nombre_representante:    a.representante_nombre || '',
    cedula_representante:    a.representante_cedula || '',
    telefono_representante:  a.representante_tlf || '',
    correo_representante:    a.correo_representante || '',
    parentesco_representante:a.representante_parentesco || '',
    nombre_madre:            a.madre_nombre || '',
    cedula_madre:            a.madre_cedula || '',
    telefono_madre:          a.madre_tlf_whatsapp || '',
    nombre_padre:            a.padre_nombre || '',
    cedula_padre:            a.padre_cedula || '',
    telefono_padre:          a.padre_tlf_whatsapp || '',
    centro_estudios:         e.centro_estudios     || a.centro_estudios     || '',
    grado:                   e.grado_nivel         || a.grado_nivel         || '',
    seccion:                 e.seccion             || '',
    anio_escolar:            e.anio_escolar        || '',
    director_institucion:    e.director_institucion || '',
    cargo_director:          e.cargo_director      || 'Director/a',
    telefono_centro:         e.telefono_centro      || '',
    correo_centro:           e.correo_centro        || '',
    direccion_centro:        e.direccion_centro     || '',
    nombre_institucion:      INST.nombre,
    nombre_fundacion:        INST.fundacion,
    responsable_institucional: extra.responsable || 'Coordinación Pedagógica',
    fecha_actual:            hoy,
    nombre_actividad:        actividad.nombre    || '',
    fecha_actividad:         actividad.fecha     || '',
    lugar_actividad:         actividad.lugar     || '',
    hora_salida:             actividad.hora_salida  || '',
    hora_regreso:            actividad.hora_regreso || '',
    motivo_permiso:          actividad.motivo    || '',
    observaciones_actividad: actividad.observaciones || '',
    ...extra,
  }
}

export const DOCUMENT_REQUIRED_FIELDS = [
  { key: 'nombre_alumno',          label: 'Nombre completo del alumno',   critical: true  },
  { key: 'centro_estudios',        label: 'Centro educativo',             critical: true  },
  { key: 'grado',                  label: 'Grado o nivel escolar',        critical: false },
  { key: 'seccion',                label: 'Sección',                      critical: false },
  { key: 'anio_escolar',           label: 'Año escolar',                  critical: false },
  { key: 'director_institucion',   label: 'Director de la institución',   critical: false },
  { key: 'nombre_representante',   label: 'Nombre del representante',     critical: true  },
  { key: 'telefono_representante', label: 'Teléfono del representante',   critical: true  },
  { key: 'correo_representante',   label: 'Correo del representante',     critical: false },
  { key: 'instrumento',            label: 'Instrumento principal',        critical: false },
]

export function getMissingDocumentFields(context) {
  return DOCUMENT_REQUIRED_FIELDS.filter(f => {
    const v = context[f.key]
    return v === undefined || v === null || String(v).trim() === ''
  })
}

export function getStudentDocumentStatus(context) {
  const missing = getMissingDocumentFields(context)
  if (missing.length === 0)          return 'completo'
  if (missing.some(f => f.critical)) return 'critico'
  return 'incompleto'
}

export async function getStudentsForDocumentGroup({ groupType, groupId, instrument, nivel }) {
  if (groupType === 'clase' && groupId) {
    const { data } = await supabase
      .from('alumnos_clases')
      .select('alumno_id, alumnos(*)')
      .eq('clase_id', groupId)
    return (data || []).map(r => r.alumnos).filter(Boolean)
  }
  if (groupType === 'programa' && groupId) {
    const { data } = await supabase
      .from('alumnos_programas')
      .select('alumno_id, alumnos(*)')
      .eq('programa_id', groupId)
    return (data || []).map(r => r.alumnos).filter(Boolean)
  }
  let query = supabase.from('alumnos').select('*').eq('activo', true)
  if (instrument) query = query.eq('instrumento_principal', instrument)
  if (nivel)      query = query.eq('nivel_actual', nivel)
  const { data } = await query
  return data || []
}
