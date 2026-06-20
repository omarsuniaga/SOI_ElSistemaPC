#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env.local') })
dotenv.config({ path: path.join(__dirname, '../.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY not found')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

// Helper to format time (e.g. "09:00:00" -> "9:00am", "13:00:00" -> "1pm")
function formatTimeSummary(timeStr) {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  let h = parseInt(parts[0], 10);
  const m = parts[1];
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12;
  h = h ? h : 12;
  
  // Omit minutes if they are '00' for a cleaner look (e.g. "9:00am" -> "9am", or keep it as user prefers)
  // Let's keep minutes for consistency unless they are 00 and user wrote e.g. "9am" or "9:00am".
  // The user wrote: "9:00am a 11:00pm" and "9:00Am a 1Pm". Let's match:
  const minStr = m === '00' ? '' : `:${m}`;
  
  // Format AM/PM properly as 'am' or 'pm' or 'Am' or 'Pm'
  // Let's make it standard lower case or match the user's casing
  return `${h}${minStr}${ampm}`;
}

// Get emoji based on instrument or class name
function getClassEmoji(className, instrument) {
  const name = (className + ' ' + (instrument || '')).toLowerCase();
  if (name.includes('violin') || name.includes('violín') || name.includes('viola') || name.includes('cello') || name.includes('contrabajo') || name.includes('cuerda')) {
    return '🎻';
  }
  if (name.includes('madera') || name.includes('flauta') || name.includes('oboe') || name.includes('clarinete') || name.includes('fagot') || name.includes('saxo')) {
    return '🪈';
  }
  if (name.includes('metal') || name.includes('trompeta') || name.includes('trombon') || name.includes('trombón') || name.includes('trompa') || name.includes('tuba') || name.includes('corno')) {
    return '🎷';
  }
  if (name.includes('piano') || name.includes('teclado')) {
    return '🎹';
  }
  if (name.includes('coro') || name.includes('canto') || name.includes('sinfonico') || name.includes('sinfónico')) {
    return '🎤';
  }
  if (name.includes('percusión') || name.includes('percusion') || name.includes('bateria') || name.includes('batería') || name.includes('redoblante')) {
    return '🥁';
  }
  return '🎼';
}

// Date calculations
const dateOptions = {
  timeZone: 'America/Santo_Domingo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
};
const dateParts = new Intl.DateTimeFormat('en-US', dateOptions).formatToParts(new Date());
const year = dateParts.find(p => p.type === 'year').value;
const month = dateParts.find(p => p.type === 'month').value;
const day = dateParts.find(p => p.type === 'day').value;
const todayDateStr = `${year}-${month}-${day}`;

const formatter = new Intl.DateTimeFormat('es-ES', {
  timeZone: 'America/Santo_Domingo',
  weekday: 'long'
});
const rawDay = formatter.format(new Date()).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const dayMap = {
  'domingo': 'domingo',
  'lunes': 'lunes',
  'martes': 'martes',
  'miercoles': 'miércoles',
  'jueves': 'jueves',
  'viernes': 'viernes',
  'sabado': 'sábado'
};
const todayDay = dayMap[rawDay] || rawDay;

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
// Parse local date to get correct day number and month name
const localDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Santo_Domingo' }));
const dayNum = localDate.getDate();
const monthName = monthNames[localDate.getMonth()];

async function run() {
  // 1. Fetch today's schedules
  const { data: schedules, error } = await supabase
    .from('clase_horarios')
    .select(`
      dia,
      hora_inicio,
      hora_fin,
      salon_id,
      salones ( nombre ),
      clases (
        id,
        nombre,
        estado,
        instrumento,
        maestro_principal_id,
        maestro_suplente_id
      )
    `)
    .eq('dia', todayDay);

  if (error) {
    console.error('❌ Error consultando horarios:', error.message);
    process.exit(1);
  }

  // 2. Fetch approved teacher absences
  const { data: absences } = await supabase
    .from('solicitudes_ausencia')
    .select('*')
    .eq('fecha_ausencia', todayDateStr)
    .eq('estado', 'aprobada');

  const absentTeacherIds = (absences || []).map(a => a.maestro_id);
  const absenceMap = (absences || []).reduce((acc, a) => {
    acc[a.maestro_id] = a;
    return acc;
  }, {});

  // 3. Fetch all teachers names
  const { data: maestros, error: mError } = await supabase.from('maestros').select('id, nombre_completo');
  if (mError) {
    console.error('❌ Error consultando maestros:', mError.message);
  }
  const teacherMap = (maestros || []).reduce((acc, t) => {
    acc[t.id] = t.nombre_completo;
    return acc;
  }, {});

  // Build the broadcast message
  let text = `🎶🎵 _PROGRAMA ORQUESTAL_ 🎻🎺🪈🥁\n\n`;
  text += `  *_${rawDay.toUpperCase()} ${dayNum} De ${monthName}_*\n`;
  text += `Clases Regulares\n`;
  text += `👇🏼👇🏼👇🏼👇🏼👇🏼\n\n`;

  const activeLines = [];
  const suspendedLines = [];

  if (schedules && schedules.length > 0) {
    for (const schedule of schedules) {
      const clase = schedule.clases;
      if (!clase) continue;

      const mainTeacherId = clase.maestro_principal_id;
      const mainTeacherName = teacherMap[mainTeacherId] || 'Sin docente';
      const salonName = schedule.salones?.nombre || 'Salón sin nombre';
      const timeRange = `*${formatTimeSummary(schedule.hora_inicio)} a ${formatTimeSummary(schedule.hora_fin)}*`;
      const emoji = getClassEmoji(clase.nombre, clase.instrumento);

      // Check if permanently suspended
      if (clase.estado && clase.estado !== 'activa') {
        suspendedLines.push(`_${clase.nombre.toUpperCase()}_\n(SUSPENDIDO)\n${mainTeacherName}`);
        continue;
      }

      // Check if main teacher is absent today
      if (absentTeacherIds.includes(mainTeacherId)) {
        const absence = absenceMap[mainTeacherId];
        const substituteId = absence.suplente_id;

        if (!substituteId) {
          // Absent without substitute -> Suspended class
          const motive = absence.motivo ? ` ${absence.motivo.replace(/\.*$/, '')}` : '';
          suspendedLines.push(`_${clase.nombre.toUpperCase()}_\n(SUSPENDIDO)${motive}.\n${mainTeacherName}`);
        } else {
          // Absent with substitute -> Runs under substitute
          const subName = teacherMap[substituteId] || 'Docente Suplente';
          activeLines.push(
            `${emoji}_${clase.nombre.toUpperCase()}_\n▶️ ${timeRange}\n${salonName}\nProf. ${subName} (Suplente)`
          );
        }
      } else {
        // Normal class
        activeLines.push(
          `${emoji}_${clase.nombre.toUpperCase()}_\n▶️ ${timeRange}\n${salonName}\nProf. ${mainTeacherName}`
        );
      }
    }
  }

  if (activeLines.length === 0 && suspendedLines.length === 0) {
    text += `No hay actividades programadas para hoy.\n`;
  } else {
    text += activeLines.join('\n\n');
    if (suspendedLines.length > 0) {
      text += `\n\n` + suspendedLines.join('\n\n');
    }
  }

  // Output broadcast summary
  console.log(text);
}

run();
