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

// Helper to format time (e.g. "15:30:00" -> "3:30pm")
function formatTime(timeStr) {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  let h = parseInt(parts[0], 10);
  const m = parts[1];
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${m}${ampm}`;
}

// Helper to format phone into WhatsApp JID with Dominican Republic normalization
function formatPhoneJid(phoneStr) {
  if (!phoneStr) return null;
  let clean = phoneStr.replace(/\D/g, '');
  if (!clean) return null;
  
  // Normalization for Dominican Republic (809, 829, 849)
  if (clean.length === 10 && (clean.startsWith('809') || clean.startsWith('829') || clean.startsWith('849'))) {
    clean = '1' + clean;
  }
  
  return `${clean}@s.whatsapp.net`;
}

// Get current date and day of week in America/Santo_Domingo timezone
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

async function run() {
  console.log(`📅 Analizando jornada académica: ${todayDateStr} (${todayDay.toUpperCase()})`);

  // 1. Fetch today's class schedules
  let schedules = null;
  let queryResult = await supabase
    .from('clase_horarios')
    .select(`
      dia,
      hora_inicio,
      hora_fin,
      clases (
        id,
        nombre,
        estado,
        maestro_principal_id,
        maestro_suplente_id,
        whatsapp_group_jid,
        alumnos_clases (
          activo,
          alumnos (
            id,
            nombre_completo,
            familiar_nombre,
            familiar_telefono,
            familiar_parentesco
          )
        )
      )
    `)
    .eq('dia', todayDay);

  if (queryResult.error) {
    if (queryResult.error.message.includes('whatsapp_group_jid') || queryResult.error.code === 'PGRST200') {
      console.warn('⚠️ La columna "whatsapp_group_jid" no existe en la base de datos aún. Corriendo en modo fallback individual.');
      const retryResult = await supabase
        .from('clase_horarios')
        .select(`
          dia,
          hora_inicio,
          hora_fin,
          clases (
            id,
            nombre,
            estado,
            maestro_principal_id,
            maestro_suplente_id,
            alumnos_clases (
              activo,
              alumnos (
                id,
                nombre_completo,
                familiar_nombre,
                familiar_telefono,
                familiar_parentesco
              )
            )
          )
        `)
        .eq('dia', todayDay);

      if (retryResult.error) {
        console.error('❌ Error consultando horarios (fallback):', retryResult.error.message);
        process.exit(1);
      }
      schedules = retryResult.data;
    } else {
      console.error('❌ Error consultando horarios:', queryResult.error.message);
      process.exit(1);
    }
  } else {
    schedules = queryResult.data;
  }

  if (!schedules || schedules.length === 0) {
    console.log(`✅ No hay clases programadas para hoy (${todayDay}).`);
    process.exit(0);
  }

  // 2. Fetch approved teacher absences for today
  const { data: absences, error: absError } = await supabase
    .from('solicitudes_ausencia')
    .select('*')
    .eq('fecha_ausencia', todayDateStr)
    .eq('estado', 'aprobada');

  if (absError) {
    console.warn('⚠️ No se pudieron consultar las ausencias de maestros:', absError.message);
  }

  const absentTeacherIds = (absences || []).map(a => a.maestro_id);
  const absenceMap = (absences || []).reduce((acc, a) => {
    acc[a.maestro_id] = a;
    return acc;
  }, {});

  // Fetch all teachers names for fallback display
  const { data: maestros, error: mError } = await supabase.from('maestros').select('id, nombre_completo');
  if (mError) {
    console.error('❌ Error consultando maestros:', mError.message);
  }
  const teacherMap = (maestros || []).reduce((acc, t) => {
    acc[t.id] = t.nombre_completo;
    return acc;
  }, {});

  const groupReminders = [];
  const individualStudents = {};
  const missingPhones = [];
  const suspendedClasses = [];

  for (const schedule of schedules) {
    const clase = schedule.clases;
    if (!clase) continue;

    const classId = clase.id;
    const className = clase.nombre;
    const mainTeacherId = clase.maestro_principal_id;

    // A. Check if the class is permanently suspended or finished
    if (clase.estado && clase.estado !== 'activa') {
      suspendedClasses.push({
        class_id: classId,
        nombre_clase: className,
        motivo: `Clase inactiva en el sistema (Estado: ${clase.estado})`
      });
      continue;
    }

    // B. Check if main teacher is absent today
    if (absentTeacherIds.includes(mainTeacherId)) {
      const absenceRecord = absenceMap[mainTeacherId];
      // Check if there is a substitute teacher assigned (in absence record)
      const substituteId = absenceRecord.suplente_id;
      
      if (!substituteId) {
        // Teacher is absent, no substitute assigned -> Class is suspended for today!
        suspendedClasses.push({
          class_id: classId,
          nombre_clase: className,
          motivo: `Ausencia aprobada del maestro titular (${teacherMap[mainTeacherId]}) sin suplente asignado.`
        });
        continue;
      } else {
        const subName = teacherMap[substituteId] || 'Suplente';
        console.log(`ℹ️ La clase "${className}" será impartida hoy por el maestro suplente: ${subName}`);
      }
    }

    // C. Compile reminders for active classes
    if (clase.whatsapp_group_jid && clase.whatsapp_group_jid.trim() !== '') {
      // Group reminders
      groupReminders.push({
        type: 'group',
        recipient_jid: clase.whatsapp_group_jid.trim(),
        recipient_name: `Grupo de "${clase.nombre}"`,
        message: `Estimados padres y representantes, les recordamos que hoy tenemos clase de "${clase.nombre}", de ${formatTime(schedule.hora_inicio)} a ${formatTime(schedule.hora_fin)}.`,
        class_name: clase.nombre,
        horario: `${formatTime(schedule.hora_inicio)}-${formatTime(schedule.hora_fin)}`
      });
    } else {
      // Individual fallback reminders
      const enrollments = clase.alumnos_clases || [];
      for (const enrollment of enrollments) {
        if (enrollment.activo === false) continue;

        const student = enrollment.alumnos;
        if (!student) continue;

        const studentId = student.id;

        // Check if phone number is missing
        if (!student.familiar_telefono || student.familiar_telefono.trim() === '') {
          missingPhones.push({
            student_id: studentId,
            nombre_alumno: student.nombre_completo,
            class_name: clase.nombre
          });
          continue;
        }

        if (!individualStudents[studentId]) {
          individualStudents[studentId] = {
            student_id: studentId,
            nombre_alumno: student.nombre_completo,
            familiar_nombre: student.familiar_nombre || 'Representante',
            familiar_telefono: student.familiar_telefono,
            familiar_parentesco: student.familiar_parentesco || 'Padre/Madre',
            classes: []
          };
        }

        individualStudents[studentId].classes.push({
          nombre_clase: clase.nombre,
          hora_inicio: schedule.hora_inicio,
          hora_fin: schedule.hora_fin,
          sortTime: schedule.hora_inicio
        });
      }
    }
  }

  const individualReminders = [];

  for (const studentId of Object.keys(individualStudents)) {
    const info = individualStudents[studentId];
    const phoneJid = formatPhoneJid(info.familiar_telefono);
    
    info.classes.sort((a, b) => a.sortTime.localeCompare(b.sortTime));

    let message = `Estimado/a ${info.familiar_nombre}, le recordamos que ${info.nombre_alumno} tiene `;
    
    if (info.classes.length === 1) {
      const cls = info.classes[0];
      message += `clase de "${cls.nombre_clase}", de ${formatTime(cls.hora_inicio)} a ${formatTime(cls.hora_fin)}.`;
    } else if (info.classes.length === 2) {
      const cls1 = info.classes[0];
      const cls2 = info.classes[1];
      message += `clase de "${cls1.nombre_clase}", de ${formatTime(cls1.hora_inicio)} a ${formatTime(cls1.hora_fin)}, y posteriormente su clase de "${cls2.nombre_clase}", de ${formatTime(cls2.hora_inicio)} a ${formatTime(cls2.hora_fin)}.`;
    } else {
      message += `clase de "${info.classes[0].nombre_clase}", de ${formatTime(info.classes[0].hora_inicio)} a ${formatTime(info.classes[0].hora_fin)}`;
      for (let i = 1; i < info.classes.length - 1; i++) {
        const cls = info.classes[i];
        message += `, posteriormente su clase de "${cls.nombre_clase}", de ${formatTime(cls.hora_inicio)} a ${formatTime(cls.hora_fin)}`;
      }
      const lastCls = info.classes[info.classes.length - 1];
      message += `, y finalmente su clase de "${lastCls.nombre_clase}", de ${formatTime(lastCls.hora_inicio)} a ${formatTime(lastCls.hora_fin)}.`;
    }

    individualReminders.push({
      type: 'individual',
      recipient_jid: phoneJid,
      recipient_name: `${info.familiar_nombre} (${info.nombre_alumno})`,
      message: message,
      nombre_alumno: info.nombre_alumno,
      classes: info.classes.map(c => ({ nombre: c.nombre_clase, horario: `${formatTime(c.hora_inicio)}-${formatTime(c.hora_fin)}` }))
    });
  }

  const allReminders = [...groupReminders, ...individualReminders];
  
  // Output JSON with alerts, warnings and suspended items
  const output = {
    reminders: allReminders,
    warnings: {
      missing_phones: missingPhones
    },
    alterations: {
      suspended_classes: suspendedClasses
    }
  };

  console.log(JSON.stringify(output, null, 2));
}

run();
