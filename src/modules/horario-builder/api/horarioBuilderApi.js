import { supabase } from '../../../lib/supabaseClient.js';
import { config } from '../../../core/config/config.js';
import { getDisponibilidadBulk } from '../../../portal-maestros/api/disponibilidadApi.js';
import mockTeachers from '../../../assets/data/mocks/maestros-disponibilidad.json';

// Mock values for Demo Mode
const mockSalones = [
  { id: 's-101', nombre: 'Salón Mozart (Grande)', capacidad: 30, piso: 1, is_active: true },
  { id: 's-102', nombre: 'Salón Beethoven (Mediano)', capacidad: 15, piso: 1, is_active: true },
  { id: 's-103', nombre: 'Salón Bach (Piano)', capacidad: 10, piso: 2, is_active: true },
  { id: 's-104', nombre: 'Salón Vivaldi (Violín)', capacidad: 8, piso: 2, is_active: true },
  { id: 's-105', nombre: 'Salón Chopin (Teclados)', capacidad: 12, piso: 2, is_active: true }
];

const mockClases = [
  { id: 'c-001', nombre: 'Violín Inicial', instrumento: 'Violín', maestro_principal_id: 'm-001', capacidad_maxima: 10, total_alumnos: 6, horarios: [] },
  { id: 'c-002', nombre: 'Violín Intermedio', instrumento: 'Violín', maestro_principal_id: 'm-001', capacidad_maxima: 8, total_alumnos: 5, horarios: [] },
  { id: 'c-003', nombre: 'Piano Inicial A', instrumento: 'Piano', maestro_principal_id: 'm-002', capacidad_maxima: 12, total_alumnos: 10, horarios: [] },
  { id: 'c-004', nombre: 'Teoría y Solfeo I', instrumento: 'Solfeo', maestro_principal_id: 'm-006', capacidad_maxima: 25, total_alumnos: 18, horarios: [] },
  { id: 'c-005', nombre: 'Batería Básica', instrumento: 'Percusión', maestro_principal_id: 'm-003', capacidad_maxima: 6, total_alumnos: 4, horarios: [] },
  { id: 'c-006', nombre: 'Guitarra Clásica I', instrumento: 'Guitarra', maestro_principal_id: 'm-005', capacidad_maxima: 15, total_alumnos: 11, horarios: [] },
  { id: 'c-007', nombre: 'Cello y Cámara', instrumento: 'Cello', maestro_principal_id: 'm-004', capacidad_maxima: 8, total_alumnos: 3, horarios: [] },
  { id: 'c-008', nombre: 'Técnica Vocal A', instrumento: 'Voz', maestro_principal_id: 'm-006', capacidad_maxima: 10, total_alumnos: 8, horarios: [] }
];

// In-memory storage for runs in demo mode
let mockRuns = [];

// ─── REAL DB API FUNCTIONS ──────────────────────────────────────

async function getSalonesReal() {
  const { data, error } = await supabase
    .from('salones')
    .select('id, nombre, capacidad, is_active')
    .eq('is_active', true)
    .order('nombre', { ascending: true });

  if (error) throw new Error('Error al cargar salones reales: ' + error.message);
  return data;
}

async function getClasesReal() {
  const { data: clases, error } = await supabase
    .from('clases')
    .select('id, nombre, maestro_principal_id, capacidad_maxima, instrumento, duracion_minutos')
    .order('nombre', { ascending: true });

  if (error) throw new Error('Error al cargar clases reales: ' + error.message);

  const { data: horarios } = await supabase
    .from('clase_horarios')
    .select('*');

  const { data: inscripciones } = await supabase
    .from('alumnos_clases')
    .select('clase_id');

  return (clases || []).map(c => {
    const classHorarios = (horarios || []).filter(h => h.clase_id === c.id);
    const enrolledCount = (inscripciones || []).filter(i => i.clase_id === c.id).length;
    return {
      id: c.id,
      nombre: c.nombre,
      instrumento: c.instrumento || 'General',
      maestro_principal_id: c.maestro_principal_id,
      capacidad_maxima: c.capacidad_maxima || 20,
      total_alumnos: enrolledCount,
      duracion_minutos: c.duracion_minutos ?? null,
      horarios: classHorarios.map(h => ({
        dia: h.dia,
        hora_inicio: h.hora_inicio,
        hora_fin: h.hora_fin,
        salon_id: h.salon_id
      }))
    };
  });
}

// ─── INTERACTION FUNCTIONS ──────────────────────────────────────

export async function fetchSchedulingData() {
  if (config.isDemoMode) {
    return {
      maestros: mockTeachers,
      salones: mockSalones,
      clases: mockClases
    };
  }

  try {
    const [maestros, salones, clases] = await Promise.all([
      getDisponibilidadBulk(),
      getSalonesReal(),
      getClasesReal()
    ]);

    return { maestros, salones, clases };
  } catch (error) {
    console.error('[horarioBuilderApi] Error fetching data:', error);
    throw error;
  }
}

/**
 * Saves a schedule run as a draft or applies it.
 */
export async function saveScheduleRun(runData) {
  if (config.isDemoMode) {
    const newRun = {
      id: `run-${Date.now()}`,
      created_at: new Date().toISOString(),
      estado: runData.estado || 'borrador',
      periodo: runData.periodo,
      config: runData.config,
      resultado: runData.resultado,
      metricas: runData.metricas
    };
    mockRuns.push(newRun);
    return newRun;
  }

  const { data, error } = await supabase
    .from('schedule_runs')
    .insert([{
      periodo: runData.periodo,
      config: runData.config,
      resultado: runData.resultado,
      metricas: runData.metricas,
      estado: runData.estado || 'borrador'
    }])
    .select()
    .single();

  if (error) {
    console.error('[horarioBuilderApi] Error saving run:', error);
    throw new Error('No se pudo guardar la corrida de horario: ' + error.message);
  }

  return data;
}

/**
 * Applies a schedule run's result into the active classroom schedules.
 */
export async function applyScheduleRun(runId, assignments) {
  if (config.isDemoMode) {
    const run = mockRuns.find(r => r.id === runId);
    if (run) {
      run.estado = 'aplicado';
      run.applied_at = new Date().toISOString();
    }
    // Update local mock class schedules
    assignments.forEach(as => {
      const cl = mockClases.find(c => c.id === as.clase_id);
      if (cl) {
        cl.horarios = [{
          dia: as.dia,
          hora_inicio: as.hora_inicio,
          hora_fin: as.hora_fin,
          salon_id: as.salon_id
        }];
      }
    });
    return { success: true };
  }

  try {
    // 1. Delete old class schedules affected or all?
    // According to plan, we should batch replace the active schedules for these classes.
    const classIds = [...new Set(assignments.map(a => a.clase_id))];
    
    // Perform in transaction/sequential queries
    const { error: deleteErr } = await supabase
      .from('clase_horarios')
      .delete()
      .in('clase_id', classIds);

    if (deleteErr) throw deleteErr;

    // 2. Insert new schedules
    const newHorarios = assignments.map(a => ({
      clase_id: a.clase_id,
      dia: a.dia,
      hora_inicio: a.hora_inicio,
      hora_fin: a.hora_fin,
      salon_id: a.salon_id,
      maestro_id: a.maestro_id
    }));

    const { error: insertErr } = await supabase
      .from('clase_horarios')
      .insert(newHorarios);

    if (insertErr) throw insertErr;

    // 3. Update the run status to 'aplicado'
    const { error: updateRunErr } = await supabase
      .from('schedule_runs')
      .update({ estado: 'aplicado', applied_at: new Date().toISOString() })
      .eq('id', runId);

    if (updateRunErr) console.warn('Could not update run status to applied:', updateRunErr);

    return { success: true };
  } catch (error) {
    console.error('[horarioBuilderApi] Error applying schedule run:', error);
    throw new Error('Error al aplicar el horario generado en el sistema: ' + error.message);
  }
}

/**
 * Loads schedule runs.
 */
export async function getScheduleRuns() {
  if (config.isDemoMode) {
    return mockRuns;
  }

  const { data, error } = await supabase
    .from('schedule_runs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[horarioBuilderApi] Error fetching runs:', error);
    throw new Error('No se pudieron obtener las corridas de horarios');
  }

  return data;
}
