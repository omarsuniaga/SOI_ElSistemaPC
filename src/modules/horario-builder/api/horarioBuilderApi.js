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
    .select('id, nombre, maestro_principal_id, capacidad_maxima, instrumento')
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
 * Fetches current registered schedule assignments from the database
 * along with student enrollments (alumnos_clases) for per-student filtering.
 */
export async function fetchRegisteredScheduleData() {
  if (config.isDemoMode) {
    // Generate simulated assignments for demo mode
    const assignments = [
      { id: '1', clase_id: 'c-001', clase_nombre: 'Violín Inicial', maestro_id: 'm-001', maestro_nombre: 'Jaime de la Cruz', salon_id: 's-104', salon_nombre: 'Salón Vivaldi (Violín)', dia: 'lunes', hora_inicio: '08:00', hora_fin: '10:00', alumnos_ids: ['a-101', 'a-102'] },
      { id: '2', clase_id: 'c-002', clase_nombre: 'Violín Intermedio', maestro_id: 'm-001', maestro_nombre: 'Jaime de la Cruz', salon_id: 's-104', salon_nombre: 'Salón Vivaldi (Violín)', dia: 'miércoles', hora_inicio: '10:00', hora_fin: '12:00', alumnos_ids: ['a-101', 'a-103'] },
      { id: '3', clase_id: 'c-003', clase_nombre: 'Piano Inicial A', maestro_id: 'm-002', maestro_nombre: 'María Naroldy Hilario', salon_id: 's-103', salon_nombre: 'Salón Bach (Piano)', dia: 'martes', hora_inicio: '09:00', hora_fin: '11:00', alumnos_ids: ['a-102', 'a-104'] },
      { id: '4', clase_id: 'c-004', clase_nombre: 'Teoría y Solfeo I', maestro_id: 'm-006', maestro_nombre: 'Carlos Mendoza', salon_id: 's-101', salon_nombre: 'Salón Mozart (Grande)', dia: 'jueves', hora_inicio: '14:00', hora_fin: '16:00', alumnos_ids: ['a-101', 'a-102', 'a-103', 'a-104'] }
    ];

    const alumnos = [
      { id: 'a-101', nombre_completo: 'Mateo Alejandro García', instrumento_principal: 'Violín' },
      { id: 'a-102', nombre_completo: 'Sofía Isabella Martínez', instrumento_principal: 'Piano' },
      { id: 'a-103', nombre_completo: 'Gabriel Eduardo López', instrumento_principal: 'Violín' },
      { id: 'a-104', nombre_completo: 'Lucía Fernanda Rodríguez', instrumento_principal: 'Solfeo' }
    ];

    return {
      assignments,
      alumnos,
      maestros: mockTeachers,
      salones: mockSalones,
      clases: mockClases
    };
  }

  try {
    const [clasesRes, horariosRes, maestrosRes, salonesRes, inscripcionesRes, alumnosRes] = await Promise.all([
      supabase.from('clases').select('*'),
      supabase.from('clase_horarios').select('*'),
      supabase.from('maestros').select('*'),
      supabase.from('salones').select('*'),
      supabase.from('alumnos_clases').select('*').eq('activo', true),
      supabase.from('alumnos').select('*').order('nombre_completo')
    ]);

    const clases = clasesRes.data || [];
    const horarios = horariosRes.data || [];
    const maestros = maestrosRes.data || [];
    const salones = salonesRes.data || [];
    const inscripciones = inscripcionesRes.data || [];
    const alumnos = alumnosRes.data || [];

    const clasesMap = clases.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});
    const salonesMap = salones.reduce((acc, s) => { acc[s.id] = s.nombre; return acc; }, {});

    const maestrosMap = {};
    maestros.forEach(m => {
      const name = (m.nombre_completo || m.nombre || (m.nombres ? `${m.nombres} ${m.apellidos || ''}`.trim() : '') || 'Maestro').trim();
      if (m.id) maestrosMap[m.id] = name;
      if (m.user_id) maestrosMap[m.user_id] = name;
    });

    const alumnosByClase = inscripciones.reduce((acc, row) => {
      if (row.clase_id) {
        if (!acc[row.clase_id]) acc[row.clase_id] = [];
        if (row.alumno_id && !acc[row.clase_id].includes(row.alumno_id)) {
          acc[row.clase_id].push(row.alumno_id);
        }
      }
      return acc;
    }, {});

    const assignments = horarios.map((h, i) => {
      const clase = clasesMap[h.clase_id] || {};
      let maestroId = h.maestro_id || clase.maestro_id || clase.maestro_principal_id;
      
      // Fallback si la clase no tiene maestro asignado en DB
      if (!maestroId && maestros.length > 0) {
        let hash = 0;
        const key = String(h.clase_id || h.id || i);
        for (let k = 0; k < key.length; k++) hash = key.charCodeAt(k) + ((hash << 5) - hash);
        const idx = Math.abs(hash) % maestros.length;
        maestroId = maestros[idx].id;
      }

      const maestroNombre = maestrosMap[maestroId] || (maestros[0] ? (maestros[0].nombre_completo || maestros[0].nombre) : 'Sin maestro');
      const salonNombre = salonesMap[h.salon_id] || 'Sin salón';

      return {
        id: h.id,
        clase_id: h.clase_id,
        clase_nombre: clase.nombre || 'Clase sin nombre',
        instrumento: clase.instrumento || 'General',
        maestro_id: maestroId,
        maestro_nombre: maestroNombre,
        salon_id: h.salon_id,
        salon_nombre: salonNombre,
        dia: (h.dia || '').toLowerCase(),
        hora_inicio: (h.hora_inicio || '').slice(0, 5),
        hora_fin: (h.hora_fin || '').slice(0, 5),
        alumnos_ids: alumnosByClase[h.clase_id] || []
      };
    });

    return {
      assignments,
      alumnos,
      maestros,
      salones,
      clases
    };
  } catch (error) {
    console.error('[horarioBuilderApi] Error in fetchRegisteredScheduleData:', error);
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
    const classIds = [...new Set(assignments.map(a => a.clase_id))];
    
    const { error: deleteErr } = await supabase
      .from('clase_horarios')
      .delete()
      .in('clase_id', classIds);

    if (deleteErr) throw deleteErr;

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
