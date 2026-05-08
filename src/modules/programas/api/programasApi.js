import { supabase } from '../../../lib/supabaseClient.js'

function normalizePrograma(p) {
  return {
    ...p,
    nombre: p.nombre ?? p.name ?? '',
    descripcion: p.descripcion ?? p.description ?? '',
    nivel: p.nivel ?? p.level ?? '',
    duracion_anios: p.duracion_anios ?? p.duracionAnios ?? null,
  }
}

export const NIVELES = [
  { value: '', label: 'Sin nivel específico' },
  { value: '1', label: '1° Año' },
  { value: '2', label: '2° Año' },
  { value: '3', label: '3° Año' },
  { value: '4', label: '4° Año' },
  { value: '5', label: '5° Año' },
  { value: '6', label: '6° Año' },
  { value: 'inicial', label: 'Nivel Inicial' },
  { value: 'intermedio', label: 'Nivel Intermedio' },
  { value: 'avanzado', label: 'Nivel Avanzado' },
  { value: 'preuniversitario', label: 'Pre-Universitario' },
]

export function getNivelLabel(nivel) {
  const found = NIVELES.find(n => n.value === nivel)
  return found ? found.label : nivel || '-'
}

export async function obtenerProgramas() {
  const { data, error } = await supabase
    .from('programas')
    .select('*')
    .order('nombre', { ascending: true })

  if (error) {
    console.error('Error cargando programas:', error.message)
    throw error
  }

  return data.map(normalizePrograma)
}

/**
 * Obtiene un programa por ID
 */
export async function obtenerPrograma(id) {
  const { data, error } = await supabase
    .from('programas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error cargando programa:', error.message)
    throw error
  }

  return data
}

/**
 * Crea un nuevo programa
 */
export async function crearPrograma(programa) {
  const { data, error } = await supabase
    .from('programas')
    .insert([programa])
    .select()

  if (error) {
    console.error('Error creando programa:', error.message)
    throw error
  }

  return data[0]
}

/**
 * Actualiza un programa existente
 */
export async function actualizarPrograma(id, actualizaciones) {
  const { data, error } = await supabase
    .from('programas')
    .update(actualizaciones)
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error actualizando programa:', error.message)
    throw error
  }

  return data[0]
}

/**
 * Elimina un programa
 */
export async function eliminarPrograma(id) {
  const { error } = await supabase
    .from('programas')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error eliminando programa:', error.message)
    throw error
  }
}

/**
 * Exporta programas a PDF
 */
export async function exportarProgramasPDF(programas) {
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text('Programas Académicos', 14, 22)
  doc.setFontSize(10)
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 14, 30)

  const tableData = programas.map(p => [
    p.nombre,
    p.nivel || '-',
    p.descripcion ? p.descripcion.substring(0, 50) + (p.descripcion.length > 50 ? '...' : '') : '-',
    p.activo ? 'Activo' : 'Inactivo',
    p.created_at ? new Date(p.created_at).toLocaleDateString('es-ES') : '-'
  ])

  autoTable(doc, {
    head: [['Nombre', 'Nivel', 'Descripción', 'Estado', 'Creado']],
    body: tableData,
    startY: 35,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185] },
  })

  doc.save('programas.pdf')
}
