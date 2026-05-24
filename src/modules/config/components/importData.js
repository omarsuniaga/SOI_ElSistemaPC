import { supabase } from '../../../lib/supabaseClient.js'

const IMPORT_ENTITIES = {
  students: {
    label: 'Alumnos/Estudiantes',
    description: 'Importar estudiantes (tabla: alumnos)',
    fields: [
      { name: 'nombre_completo', type: 'string', required: true, label: 'Nombre completo' },
      { name: 'tlf_alumno', type: 'string', required: false, label: 'Teléfono del alumno' },
      { name: 'direccion', type: 'string', required: false, label: 'Dirección' },
      { name: 'fecha_nacimiento', type: 'date', required: false, label: 'Fecha de nacimiento' },
      { name: 'instrumento_principal', type: 'string', required: false, label: 'Instrumento principal' },
      { name: 'nivel', type: 'string', required: false, label: 'Nivel' },
      { name: 'fecha_ingreso', type: 'date', required: false, label: 'Fecha de ingreso' },
      { name: 'padre_nombre', type: 'string', required: false, label: 'Nombre del padre' },
      { name: 'madre_nombre', type: 'string', required: false, label: 'Nombre de la madre' },
      { name: 'representante_nombre', type: 'string', required: false, label: 'Nombre del representante' },
      { name: 'representante_cedula', type: 'string', required: false, label: 'Cédula del representante' },
      { name: 'representante_tlf', type: 'string', required: false, label: 'Teléfono del representante' },
      { name: 'correo_representante', type: 'string', required: false, label: 'Email del representante' },
      { name: 'contacto_emergencia_nombre', type: 'string', required: false, label: 'Contacto emergencia (nombre)' },
      { name: 'contacto_emergencia_telefono', type: 'string', required: false, label: 'Contacto emergencia (teléfono)' },
      { name: 'observaciones_generales', type: 'string', required: false, label: 'Observaciones' },
      { name: 'activo', type: 'boolean', required: false, label: 'Activo', default: true }
    ],
    table: 'alumnos',
    idField: 'id'
  },
  
  programas: {
    label: 'Programas',
    description: 'Programas académicos (tabla: programas)',
    fields: [
      { name: 'nombre', type: 'string', required: true, label: 'Nombre del programa' },
      { name: 'descripcion', type: 'string', required: false, label: 'Descripción' },
      { name: 'nivel', type: 'string', required: false, label: 'Nivel' },
      { name: 'duracion_anios', type: 'number', required: false, label: 'Duración (años)' },
      { name: 'activo', type: 'boolean', required: false, label: 'Activo', default: true }
    ],
    table: 'programas',
    idField: 'id'
  },
  
  salones: {
    label: 'Salones/Aulas',
    description: 'Espacios físicos (tabla: salones)',
    fields: [
      { name: 'nombre', type: 'string', required: true, label: 'Nombre del salón' },
      { name: 'codigo_salon', type: 'string', required: false, label: 'Código' },
      { name: 'ubicacion', type: 'string', required: false, label: 'Ubicación' },
      { name: 'piso', type: 'number', required: false, label: 'Piso' },
      { name: 'capacidad', type: 'number', required: false, label: 'Capacidad', default: 20 },
      { name: 'is_active', type: 'boolean', required: false, label: 'Activo', default: true }
    ],
    table: 'salones',
    idField: 'id'
  },
  
  maestros: {
    label: 'Maestros/Profesores',
    description: 'Docentes del sistema (tabla: maestros)',
    fields: [
      { name: 'nombre_completo', type: 'string', required: true, label: 'Nombre completo' },
      { name: 'correo', type: 'string', required: false, label: 'Email (correo)' },
      { name: 'tlf', type: 'string', required: false, label: 'Teléfono' },
      { name: 'especialidad', type: 'string', required: false, label: 'Especialidad' },
      { name: 'resena', type: 'string', required: false, label: 'Biografía (reseña)' },
      { name: 'activo', type: 'boolean', required: false, label: 'Activo', default: true }
    ],
    table: 'maestros',
    idField: 'id'
  },
  
  clases: {
    label: 'Clases/Cursos',
    description: 'Clases programadas (tabla: clases)',
    fields: [
      { name: 'nombre', type: 'string', required: true, label: 'Nombre de la clase' },
      { name: 'programa_id', type: 'string', required: false, label: 'ID del programa (UUID)' },
      { name: 'maestro_principal_id', type: 'string', required: false, label: 'ID del maestro (UUID)' },
      { name: 'maestro_nombre', type: 'string', required: false, label: 'Nombre del maestro (lookup)', virtual: true },
      { name: 'instrumento', type: 'string', required: false, label: 'Instrumento' },
      { name: 'tipo_clase', type: 'string', required: false, label: 'Tipo de clase' },
      { name: 'descripcion', type: 'string', required: false, label: 'Descripción' },
      { name: 'plan_estudio', type: 'string', required: false, label: 'Plan de estudio / Nivel', alias: 'nivel' },
      { name: 'capacidad_maxima', type: 'number', required: false, label: 'Capacidad máxima', default: 20, alias: 'capacidad' },
      { name: 'activo', type: 'boolean', required: false, label: 'Activo', default: true }
    ],
    table: 'clases',
    idField: 'id'
  },
  
  inscripciones: {
    label: 'Inscripciones',
    description: 'Relación alumno-clase (matrículas)',
    fields: [
      { name: 'alumno_id', type: 'string', required: true, label: 'ID del alumno' },
      { name: 'clase_id', type: 'string', required: true, label: 'ID de la clase' },
      { name: 'fecha_inscripcion', type: 'date', required: false, label: 'Fecha de inscripción' },
      { name: 'estado', type: 'select', required: false, label: 'Estado', options: ['activo', 'suspendido', 'retirado'], default: 'activo' }
    ],
    table: 'clase_alumnos',
    idField: 'id'
  },
  
  asistencias: {
    label: 'Asistencias',
    description: 'Registro de asistencia a clases',
    fields: [
      { name: 'alumno_id', type: 'string', required: true, label: 'ID del alumno' },
      { name: 'sesion_id', type: 'string', required: true, label: 'ID de la sesión' },
      { name: 'estado', type: 'select', required: true, label: 'Estado (P/A/J)', options: ['P', 'A', 'J'] },
      { name: 'fecha', type: 'date', required: true, label: 'Fecha (YYYY-MM-DD)' },
      { name: 'observaciones', type: 'string', required: false, label: 'Observaciones' }
    ],
    table: 'asistencias',
    idField: 'id'
  },
  
  progresos: {
    label: 'Calificaciones/Progresos',
    description: 'Calificaciones de estudiantes',
    fields: [
      { name: 'alumno_id', type: 'string', required: true, label: 'ID del alumno' },
      { name: 'clase_id', type: 'string', required: true, label: 'ID de la clase' },
      { name: 'tipo_evaluacion', type: 'select', required: true, label: 'Tipo', options: ['parcial', 'final', 'continua'] },
      { name: 'calificacion', type: 'number', required: false, label: 'Calificación (0-5)' },
      { name: 'fecha_evaluacion', type: 'date', required: false, label: 'Fecha de evaluación' },
      { name: 'observaciones', type: 'string', required: false, label: 'Observaciones' },
      { name: 'estado', type: 'select', required: false, label: 'Estado', options: ['en_progreso', 'completado', 'pendiente'], default: 'en_progreso' }
    ],
    table: 'progresos_academicos',
    idField: 'id'
  }
}

export function getImportEntities() {
  return IMPORT_ENTITIES
}

export function getEntityTemplate(entityKey) {
  const entity = IMPORT_ENTITIES[entityKey]
  if (!entity) return null
  
  const sample = {}
  for (const field of entity.fields) {
    if (field.required) {
      sample[field.name] = field.type === 'number' ? 0 : field.type === 'boolean' ? true : field.type === 'date' ? '2024-01-01' : `valor_${field.name}`
    }
  }
  return sample
}

export function generateCsvTemplate(entityKey) {
  const entity = IMPORT_ENTITIES[entityKey]
  if (!entity) return ''
  
  const headers = entity.fields.map(f => f.name)
  const sample = entity.fields
    .filter(f => f.required)
    .map(f => {
      switch (f.type) {
        case 'number': return '0'
        case 'boolean': return 'true'
        case 'date': return '2024-01-01'
        case 'select': return f.options?.[0] || 'valor'
        default: return `ejemplo_${f.name}`
      }
    })
  
  return headers.join(',') + '\n' + sample.join(',')
}

export function generateJsonTemplate(entityKey) {
  const entity = IMPORT_ENTITIES[entityKey]
  if (!entity) return null
  
  const sample = {}
  for (const field of entity.fields) {
    if (field.required) {
      switch (field.type) {
        case 'number': sample[field.name] = 0; break
        case 'boolean': sample[field.name] = true; break
        case 'date': sample[field.name] = '2024-01-01'; break
        case 'select': sample[field.name] = field.options?.[0] || ''; break
        default: sample[field.name] = `ejemplo_${field.name}`
      }
    }
  }
  
  return [sample]
}

export function parseCSV(content) {
  const lines = content.trim().split('\n')
  if (lines.length < 2) return { headers: [], data: [], error: 'Archivo vacío o sin datos' }
  
  const headers = lines[0].split(',').map(h => h.trim())
  const data = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    const row = {}
    headers.forEach((header, idx) => {
      row[header] = values[idx] || ''
    })
    data.push(row)
  }
  
  return { headers, data }
}

export function parseJSON(content) {
  try {
    const parsed = JSON.parse(content)
    const data = Array.isArray(parsed) ? parsed : [parsed]
    const headers = data.length > 0 ? Object.keys(data[0]) : []
    return { headers, data, error: null }
  } catch (e) {
    return { headers: [], data: [], error: `JSON inválido: ${e.message}` }
  }
}

function convertValue(value, fieldType, fieldOptions) {
  if (value === '' || value === null || value === undefined) return null
  
  // If already boolean (from JSON), return as is
  if (typeof value === 'boolean') return value
  
  switch (fieldType) {
    case 'number':
      const num = parseFloat(value)
      return isNaN(num) ? null : num
    case 'boolean':
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value === '1' || value === 'yes'
      }
      return Boolean(value)
    case 'select':
      return value
    default:
      return value
  }
}

async function resolveLookups(entityKey, record, cleanRecord) {
  // clases: resolve maestro_nombre → maestro_principal_id
  if (entityKey === 'clases' && !cleanRecord.maestro_principal_id && record.maestro_nombre) {
    const nombre = String(record.maestro_nombre).trim()
    const { data } = await supabase
      .from('maestros')
      .select('id')
      .ilike('nombre_completo', `%${nombre}%`)
      .limit(1)
      .maybeSingle()
    if (data) cleanRecord.maestro_principal_id = data.id
  }
}

export async function importData(entityKey, records) {
  const entity = IMPORT_ENTITIES[entityKey]
  if (!entity) throw new Error('Entidad no válida')

  const results = { success: 0, errors: [], total: records.length }

  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    const cleanRecord = {}

    // Process all non-virtual fields — resolve alias if the canonical name is absent
    for (const field of entity.fields) {
      if (field.virtual) continue
      const value = field.name in record
        ? record[field.name]
        : (field.alias && field.alias in record ? record[field.alias] : undefined)
      cleanRecord[field.name] = convertValue(value, field.type, field.options)
    }

    await resolveLookups(entityKey, record, cleanRecord)
    
    cleanRecord.created_at = new Date().toISOString()
    
    // Try to find by unique fields for each table type
    let existingRecord = null
    
    // For 'alumnos' table - search by email and cedula
    if (entity.table === 'alumnos') {
      if (cleanRecord.correo_representante) {
        const { data: found, error } = await supabase
          .from('alumnos')
          .select('id')
          .eq('correo_representante', cleanRecord.correo_representante)
          .limit(1)
          .maybeSingle()
        if (!error && found) existingRecord = found
      }
      
      if (!existingRecord && cleanRecord.representante_cedula) {
        const { data: found, error } = await supabase
          .from('alumnos')
          .select('id')
          .eq('representante_cedula', cleanRecord.representante_cedula)
          .limit(1)
          .maybeSingle()
        if (!error && found) existingRecord = found
      }
      
      if (!existingRecord && cleanRecord.nombre_completo) {
        const { data: found, error } = await supabase
          .from('alumnos')
          .select('id')
          .ilike('nombre_completo', cleanRecord.nombre_completo)
          .limit(1)
          .maybeSingle()
        if (!error && found) existingRecord = found
      }
    }
    // For other tables - search by email
    else if (cleanRecord.correo || cleanRecord.email) {
      const email = cleanRecord.correo || cleanRecord.email
      const { data: found, error } = await supabase
        .from(entity.table)
        .select('id')
        .eq('correo', email)
        .limit(1)
        .maybeSingle()
      if (!error && found) existingRecord = found
    }
    // Search by nombre for programas/salones
    else if (cleanRecord.nombre) {
      const { data: found, error } = await supabase
        .from(entity.table)
        .select('id')
        .eq('nombre', cleanRecord.nombre)
        .limit(1)
        .maybeSingle()
      if (!error && found) existingRecord = found
    }
    
    // Try by nombre_completo for maestros
    if (!existingRecord && cleanRecord.nombre_completo) {
      const fullName = cleanRecord.nombre_completo.toLowerCase()
      const { data: found, error } = await supabase
        .from(entity.table)
        .select('id')
        .ilike('nombre_completo', `%${fullName}%`)
        .limit(1)
        .maybeSingle()
      if (!error && found) existingRecord = found
    }
    
    let error = null
    
    if (existingRecord) {
      // Update existing record
      const { error: updateError } = await supabase
        .from(entity.table)
        .update(cleanRecord)
        .eq('id', existingRecord.id)
      
      error = updateError
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from(entity.table)
        .insert(cleanRecord)
      
      error = insertError
    }
    
    if (error) {
      console.error('Import error:', error)
      results.errors.push({ row: i + 1, error: error.message, data: record })
    } else {
      results.success++
    }
  }
  
  return results
}

export async function previewImport(entityKey, records) {
  const entity = IMPORT_ENTITIES[entityKey]
  if (!entity) throw new Error('Entidad no válida')
  
  const preview = []
  
  for (let i = 0; i < Math.min(records.length, 5); i++) {
    const record = records[i]
    const cleanRecord = {}
    const issues = []
    
    for (const field of entity.fields) {
      if (field.virtual) continue
      const value = field.name in record
        ? record[field.name]
        : (field.alias && field.alias in record ? record[field.alias] : undefined)

      if (field.required && (value === undefined || value === null || value === '')) {
        issues.push(`Falta campo requerido: ${field.label || field.name}`)
      }

      cleanRecord[field.name] = convertValue(value, field.type, field.options)
    }
    
    preview.push({ row: i + 1, data: cleanRecord, issues })
  }
  
  return preview
}