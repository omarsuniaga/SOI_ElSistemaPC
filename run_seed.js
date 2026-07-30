import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the root .env
dotenv.config({ path: '/home/omedsunriv/soi/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  }
});

const rawData = [
  {
    "dia": "Lunes",
    "nombre_clase": "Clases de Violoncello",
    "salon": "Salón 1 (Johann Sebastian Bach)",
    "horario_inicio": "14:00",
    "horario_fin": "16:00",
    "profesor": "Prof. Francisco Domínguez"
  },
  {
    "dia": "Lunes",
    "nombre_clase": "Coro Niños Cantores",
    "salon": "Salón 1 (Johann Sebastian Bach)",
    "horario_inicio": "16:00",
    "horario_fin": "18:00",
    "profesor": "Prof. Francisco Domínguez"
  },
  {
    "dia": "Lunes",
    "nombre_clase": "Coro Sinfónico",
    "salon": "Salón 2 (Antonio Vivaldi)",
    "horario_inicio": "16:00",
    "horario_fin": "18:00",
    "profesor": "Prof. Manuel Marcano"
  },
  {
    "dia": "Lunes",
    "nombre_clase": "Clases de Corno",
    "salon": "Salón 3 (Argelia Martínez)",
    "horario_inicio": "15:30",
    "horario_fin": "18:30",
    "profesor": "Prof. Luis"
  },
  {
    "dia": "Lunes",
    "nombre_clase": "Clases de Percusión",
    "salon": "Salón 4 (Bienvenido Bustamante)",
    "horario_inicio": "15:00",
    "horario_fin": "17:00",
    "profesor": ""
  },
  {
    "dia": "Lunes",
    "nombre_clase": "Clases de Trompeta",
    "salon": "Salón 5 (Juan Luis Guerra)",
    "horario_inicio": "15:30",
    "horario_fin": "17:00",
    "profesor": "Prof. Alfredo Sánchez"
  },
  {
    "dia": "Lunes",
    "nombre_clase": "Ensamble de Metales",
    "salon": "Salón 5 (Juan Luis Guerra)",
    "horario_inicio": "17:00",
    "horario_fin": "18:30",
    "profesor": "Prof. Alfredo Sánchez"
  },
  {
    "dia": "Lunes",
    "nombre_clase": "Clases de Violín Nivel 1",
    "salon": "Salón 6 (Julio De Windt)",
    "horario_inicio": "15:30",
    "horario_fin": "18:30",
    "profesor": "Prof. Camila Lico"
  },
  {
    "dia": "Lunes",
    "nombre_clase": "Clases de Contrabajos",
    "salon": "Salón 9 (Elila Mena)",
    "horario_inicio": "15:30",
    "horario_fin": "18:30",
    "profesor": "Prof. Kalani Paredes"
  },
  {
    "dia": "Martes",
    "nombre_clase": "Clases de Violín",
    "salon": "Salón 1 (Johann Sebastian Bach)",
    "horario_inicio": "15:30",
    "horario_fin": "18:30",
    "profesor": "Prof. Omar Suniaga"
  },
  {
    "dia": "Martes",
    "nombre_clase": "Clases de Flauta",
    "salon": "Salón 2 (Antonio Vivaldi)",
    "horario_inicio": "15:30",
    "horario_fin": "18:30",
    "profesor": "Prof. Alfredo Sánchez"
  },
  {
    "dia": "Martes",
    "nombre_clase": "Clases de Oboe",
    "salon": "Salón 3 (Argelia Martínez)",
    "horario_inicio": "15:30",
    "horario_fin": "18:30",
    "profesor": "Prof. Isabella Minozzi"
  },
  {
    "dia": "Martes",
    "nombre_clase": "Clases de Trombón",
    "salon": "Salón 4 (Bienvenido Bustamante)",
    "horario_inicio": "14:00",
    "horario_fin": "17:00",
    "profesor": "Prof. Manuel Marcano"
  },
  {
    "dia": "Martes",
    "nombre_clase": "Taller de Contrabajo",
    "salon": "Salón 5 (Juan Luis Guerra)",
    "horario_inicio": "15:30",
    "horario_fin": "17:00",
    "profesor": "Prof. Kalani Paredes"
  },
  {
    "dia": "Martes",
    "nombre_clase": "Ensayo General",
    "salon": "Salón 5 (Juan Luis Guerra)",
    "horario_inicio": "17:00",
    "horario_fin": "18:30",
    "profesor": "Prof. Manuel Marcano"
  },
  {
    "dia": "Martes",
    "nombre_clase": "Taller de Violoncello",
    "salon": "Salón 6 (Julio De Windt)",
    "horario_inicio": "15:30",
    "horario_fin": "17:00",
    "profesor": "Monitor Aarón Di Lorenzo"
  },
  {
    "dia": "Martes",
    "nombre_clase": "Clases de Tuba",
    "salon": "Salón 7 (Amadeus Mozart)",
    "horario_inicio": "15:30",
    "horario_fin": "18:30",
    "profesor": "Prof. Braylin Pérez"
  },
  {
    "dia": "Martes",
    "nombre_clase": "Clases de Clarinetes",
    "salon": "Salón 9 (Elila Mena)",
    "horario_inicio": "15:30",
    "horario_fin": "18:30",
    "profesor": "Prof. Magliana Quintero"
  },
  {
    "dia": "Martes",
    "nombre_clase": "Clases de Corno",
    "salon": "Salón 10 (Sin Nombre)",
    "horario_inicio": "15:30",
    "horario_fin": "18:30",
    "profesor": "Prof. Luis"
  },
  {
    "dia": "Miércoles",
    "nombre_clase": "Clases de Violoncello",
    "salon": "Salón 1 (Johann Sebastian Bach)",
    "horario_inicio": "14:00",
    "horario_fin": "16:00",
    "profesor": "Prof. Francisco Domínguez"
  },
  {
    "dia": "Miércoles",
    "nombre_clase": "Coro Niños Cantores",
    "salon": "Salón 1 (Johann Sebastian Bach)",
    "horario_inicio": "16:00",
    "horario_fin": "18:30",
    "profesor": "Prof. Francisco Domínguez"
  },
  {
    "dia": "Miércoles",
    "nombre_clase": "Coro Sinfónico",
    "salon": "Salón 2 (Antonio Vivaldi)",
    "horario_inicio": "16:00",
    "horario_fin": "18:00",
    "profesor": "Prof. Manuel Marcano"
  },
  {
    "dia": "Miércoles",
    "nombre_clase": "Clases de Trompeta",
    "salon": "Salón 3 (Argelia Martínez)",
    "horario_inicio": "15:30",
    "horario_fin": "18:30",
    "profesor": "Prof. Alfredo Sánchez"
  },
  {
    "dia": "Miércoles",
    "nombre_clase": "Clases de Violines Nivel 2",
    "salon": "Salón 4 (Bienvenido Bustamante)",
    "horario_inicio": "15:30",
    "horario_fin": "18:30",
    "profesor": "Prof. Omar Suniaga"
  },
  {
    "dia": "Miércoles",
    "nombre_clase": "Clases de Clarinetes",
    "salon": "Salón 5 (Juan Luis Guerra)",
    "horario_inicio": "16:00",
    "horario_fin": "18:30",
    "profesor": "Prof. Magliana Quintero"
  },
  {
    "dia": "Miércoles",
    "nombre_clase": "Iniciación de Violines",
    "salon": "Salón 6 (Julio De Windt)",
    "horario_inicio": "16:30",
    "horario_fin": "18:30",
    "profesor": "Monitor Dyakenson Lamerique"
  },
  {
    "dia": "Miércoles",
    "nombre_clase": "Clases de Luthería",
    "salon": "Salón 7 (Amadeus Mozart)",
    "horario_inicio": "15:30",
    "horario_fin": "18:30",
    "profesor": "Prof. Kalani Paredes"
  },
  {
    "dia": "Miércoles",
    "nombre_clase": "Iniciación de Violas",
    "salon": "Salón 8 (José Antonio Abreu)",
    "horario_inicio": "16:30",
    "horario_fin": "18:30",
    "profesor": "Monitor Jaime De La Cruz"
  },
  {
    "dia": "Miércoles",
    "nombre_clase": "Iniciación de Violines",
    "salon": "Salón 9 (Elila Mena)",
    "horario_inicio": "15:30",
    "horario_fin": "17:30",
    "profesor": "Monitor Edelyn Abreu"
  },
  {
    "dia": "Jueves",
    "nombre_clase": "Clases de Viola",
    "salon": "Salón 1 (Johann Sebastian Bach)",
    "horario_inicio": "15:30",
    "horario_fin": "18:30",
    "profesor": "Prof. Omar Suniaga"
  },
  {
    "dia": "Jueves",
    "nombre_clase": "Seccional de Violoncello y Contrabajo",
    "salon": "Salón 2 (Antonio Vivaldi)",
    "horario_inicio": "15:30",
    "horario_fin": "18:30",
    "profesor": "Prof. Kalani Paredes"
  },
  {
    "dia": "Jueves",
    "nombre_clase": "Seccional de Vientos Madera",
    "salon": "Salón 3 (Argelia Martínez)",
    "horario_inicio": "15:30",
    "horario_fin": "18:30",
    "profesor": "Prof. Isabella Minozzi"
  },
  {
    "dia": "Jueves",
    "nombre_clase": "Clases de Percusión",
    "salon": "Salón 4 (Bienvenido Bustamante)",
    "horario_inicio": "15:00",
    "horario_fin": "17:00",
    "profesor": ""
  },
  {
    "dia": "Jueves",
    "nombre_clase": "Clases de Trombón",
    "salon": "Salón 6 (Julio De Windt)",
    "horario_inicio": "15:30",
    "horario_fin": "18:30",
    "profesor": "Prof. María Helen Font"
  },
  {
    "dia": "Jueves",
    "nombre_clase": "Clases de Tuba",
    "salon": "Salón 7 (Amadeus Mozart)",
    "horario_inicio": "15:30",
    "horario_fin": "18:30",
    "profesor": "Prof. Braylin Pérez"
  },
  {
    "dia": "Jueves",
    "nombre_clase": "Clases de Flauta",
    "salon": "Salón 8 (José Antonio Abreu)",
    "horario_inicio": "15:30",
    "horario_fin": "18:30",
    "profesor": "Prof. Alfredo Sánchez"
  },
  {
    "dia": "Jueves",
    "nombre_clase": "Clases de Violoncellos",
    "salon": "Salón 9 (Elila Mena)",
    "horario_inicio": "15:30",
    "horario_fin": "18:30",
    "profesor": "Monitor Aarón Di Lorenzo"
  },
  {
    "dia": "Jueves",
    "nombre_clase": "Taller de Piano",
    "salon": "Salón 10 (Sin Nombre)",
    "horario_inicio": "14:30",
    "horario_fin": "18:30",
    "profesor": "Prof. Helenne Alvarez"
  },
  {
    "dia": "Viernes",
    "nombre_clase": "Clases de Violoncello",
    "salon": "Salón 1 (Johann Sebastian Bach)",
    "horario_inicio": "14:00",
    "horario_fin": "16:00",
    "profesor": "Prof. Francisco Domínguez"
  },
  {
    "dia": "Viernes",
    "nombre_clase": "Coro Niños Cantores",
    "salon": "Salón 1 (Johann Sebastian Bach)",
    "horario_inicio": "16:00",
    "horario_fin": "18:30",
    "profesor": "Prof. Francisco Domínguez"
  },
  {
    "dia": "Viernes",
    "nombre_clase": "Clases de Violoncellos",
    "salon": "Salón 2 (Antonio Vivaldi)",
    "horario_inicio": "14:30",
    "horario_fin": "18:30",
    "profesor": "Monitor Aarón Di Lorenzo"
  },
  {
    "dia": "Viernes",
    "nombre_clase": "Clases de Oboe",
    "salon": "Salón 3 (Argelia Martínez)",
    "horario_inicio": "15:30",
    "horario_fin": "18:30",
    "profesor": "Prof. Isabella Minozzi"
  },
  {
    "dia": "Viernes",
    "nombre_clase": "Clases de Violines Nivel 2",
    "salon": "Salón 4 (Bienvenido Bustamante)",
    "horario_inicio": "15:30",
    "horario_fin": "18:30",
    "profesor": "Prof. Omar Suniaga"
  },
  {
    "dia": "Viernes",
    "nombre_clase": "Iniciación de Violines",
    "salon": "Salón 5 (Juan Luis Guerra)",
    "horario_inicio": "16:30",
    "horario_fin": "18:30",
    "profesor": "Monitor Dyakenson Lamerique"
  },
  {
    "dia": "Viernes",
    "nombre_clase": "Iniciación de Viola",
    "salon": "Salón 6 (Julio De Windt)",
    "horario_inicio": "16:30",
    "horario_fin": "18:30",
    "profesor": "Monitor Jaime De La Cruz"
  },
  {
    "dia": "Viernes",
    "nombre_clase": "Día de Reparación de Instrumentos",
    "salon": "Salón 7 (Amadeus Mozart)",
    "horario_inicio": "15:30",
    "horario_fin": "18:30",
    "profesor": "Prof. Kalani Paredes"
  },
  {
    "dia": "Viernes",
    "nombre_clase": "Iniciación de Violines",
    "salon": "Salón 9 (Elila Mena)",
    "horario_inicio": "15:30",
    "horario_fin": "17:30",
    "profesor": "Monitor Edelyn Abreu"
  },
  {
    "dia": "Viernes",
    "nombre_clase": "Taller de Piano",
    "salon": "Salón 10 (Sin Nombre)",
    "horario_inicio": "15:00",
    "horario_fin": "18:30",
    "profesor": "Prof. Helenne Alvarez"
  },
  {
    "dia": "Sábado",
    "nombre_clase": "Coro Sinfónico",
    "salon": "Salón 1 (Johann Sebastian Bach)",
    "horario_inicio": "09:00",
    "horario_fin": "11:00",
    "profesor": "Prof. Manuel Marcano"
  },
  {
    "dia": "Sábado",
    "nombre_clase": "Clases de Violines Nivel 1",
    "salon": "Salón 2 (Antonio Vivaldi)",
    "horario_inicio": "09:00",
    "horario_fin": "12:00",
    "profesor": "Prof. Camila Lico"
  },
  {
    "dia": "Sábado",
    "nombre_clase": "Seccional de Madera",
    "salon": "Salón 3 (Argelia Martínez)",
    "horario_inicio": "09:00",
    "horario_fin": "11:00",
    "profesor": "Prof. Isabella Minozzi"
  },
  {
    "dia": "Sábado",
    "nombre_clase": "Taller de Violines 2",
    "salon": "Salón 4 (Bienvenido Bustamante)",
    "horario_inicio": "09:00",
    "horario_fin": "11:00",
    "profesor": "Prof. Omar Suniaga"
  },
  {
    "dia": "Sábado",
    "nombre_clase": "Taller de Cellos y Contrabajos",
    "salon": "Salón 5 (Juan Luis Guerra)",
    "horario_inicio": "09:00",
    "horario_fin": "11:00",
    "profesor": "Prof. Kalani Paredes"
  },
  {
    "dia": "Sábado",
    "nombre_clase": "Ensayo General",
    "salon": "Salón 5 (Juan Luis Guerra)",
    "horario_inicio": "11:30",
    "horario_fin": "13:00",
    "profesor": ""
  },
  {
    "dia": "Sábado",
    "nombre_clase": "Taller de Violas",
    "salon": "Salón 6 (Julio De Windt)",
    "horario_inicio": "09:00",
    "horario_fin": "11:00",
    "profesor": "Monitor Jaime De La Cruz"
  },
  {
    "dia": "Sábado",
    "nombre_clase": "Seccional de Metales",
    "salon": "Salón 7 (Amadeus Mozart)",
    "horario_inicio": "09:00",
    "horario_fin": "11:00",
    "profesor": "Prof. Braylin Pérez"
  },
  {
    "dia": "Sábado",
    "nombre_clase": "Taller de Violines 1",
    "salon": "Salón 8 (José Antonio Abreu)",
    "horario_inicio": "09:00",
    "horario_fin": "11:00",
    "profesor": "Monitor Dyakenson Lamerique"
  },
  {
    "dia": "Sábado",
    "nombre_clase": "Clases de Violines 1",
    "salon": "Salón 9 (Elila Mena)",
    "horario_inicio": "09:00",
    "horario_fin": "11:00",
    "profesor": "Prof. Lina Cavanzo"
  },
  {
    "dia": "Sábado",
    "nombre_clase": "Taller de Piano",
    "salon": "Salón 10 (Sin Nombre)",
    "horario_inicio": "09:00",
    "horario_fin": "13:00",
    "profesor": "Prof. Helenne Alvarez"
  }
];

function cleanProfessorName(prof) {
  if (!prof) return "";
  return prof.replace(/^(Prof\.|Monitor)\s+/i, '').trim();
}

function stringToUuid(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hex = Math.abs(hash).toString(16).padEnd(8, '0');
  const part1 = hex.slice(0, 8);
  const part2 = 'f522';
  const part3 = '47cc';
  const part4 = '9e67';
  const part5 = 'ea31b0e' + part1.slice(1);
  return `${part1}-${part2}-${part3}-${part4}-${part5}`;
}

function normalizeClassName(name) {
  const norm = name.trim();
  if (norm === "Clases de Violines Nivel 1") return "Clases de Violín Nivel 1";
  if (norm === "Iniciación de Violas") return "Iniciación de Viola";
  return norm;
}

function inferInstrumento(nombreClase) {
  const nombreLower = nombreClase.toLowerCase();
  const mapaInstrumentos = {
    'violoncello': 'Violonchelo',
    'violoncellos': 'Violonchelo',
    'cellos': 'Violonchelo',
    'coro': 'Voz',
    'corno': 'Trompa',
    'percusión': 'Percusión',
    'percusion': 'Percusión',
    'trompeta': 'Trompeta',
    'metales': 'Metales',
    'violín': 'Violín',
    'violines': 'Violín',
    'violin': 'Violín',
    'contrabajo': 'Contrabajo',
    'contrabajos': 'Contrabajo',
    'flauta': 'Flauta',
    'oboe': 'Oboe',
    'trombón': 'Trombón',
    'trombon': 'Trombón',
    'tuba': 'Tuba',
    'clarinete': 'Clarinete',
    'clarinetes': 'Clarinete',
    'luthería': 'Luthería',
    'lutheria': 'Luthería',
    'reparación': 'Luthería',
    'reparacion': 'Luthería',
    'viola': 'Viola',
    'violas': 'Viola',
    'madera': 'Maderas',
    'maderas': 'Maderas',
    'piano': 'Piano',
    'ensayo': 'Dirección',
    'dirección': 'Dirección'
  };

  for (const [key, value] of Object.entries(mapaInstrumentos)) {
    if (nombreLower.includes(key)) {
      return value;
    }
  }
  return 'Música';
}

async function runSeed() {
  console.log("Starting seed process via REST API...");

  const PROGRAMA_ID = '77233e71-4a41-47cc-9e67-ea31b0e00001';

  const teachers = {};
  const salones = {};
  const classes = {};
  const horarios = [];

  rawData.forEach(item => {
    const profClean = cleanProfessorName(item.profesor);
    const normalizedName = normalizeClassName(item.nombre_clase);
    
    // Resolve Teacher
    const teacherName = profClean || 'Maestro por Definir';
    const teacherId = stringToUuid('teacher_' + teacherName);
    const isMonitor = item.profesor.startsWith('Monitor');
    teachers[teacherName] = {
      id: teacherId,
      nombre_completo: teacherName,
      especialidad: inferInstrumento(normalizedName),
      correo: teacherName.toLowerCase().replace(/[^a-z]/g, '') + '@instituto.edu',
      tipo_maestro: isMonitor ? 'monitor' : 'catedra',
      activo: true
    };

    // Resolve Salon
    const salonName = item.salon;
    const salonCode = 'SALON_' + (salonName.match(/\d+/) ? salonName.match(/\d+/)[0] : '10');
    const salonId = stringToUuid('salon_' + salonName);
    salones[salonName] = {
      id: salonId,
      nombre: salonName,
      codigo_salon: salonCode,
      capacidad: 20,
      activo: true
    };

    // Group classes
    const classKey = `${normalizedName}::${teacherName}`;
    const classId = stringToUuid('class_' + classKey);
    
    if (!classes[classKey]) {
      classes[classKey] = {
        id: classId,
        nombre: normalizedName,
        maestro_principal_id: teacherId,
        programa_id: PROGRAMA_ID,
        instrumento: inferInstrumento(normalizedName),
        capacidad_maxima: 20,
        estado: 'activa',
        salon: salonName,
        activo: true
      };
    }
    
    horarios.push({
      clase_id: classId,
      dia: item.dia.toLowerCase(),
      hora_inicio: item.horario_inicio + ':00',
      hora_fin: item.horario_fin + ':00',
      salon_id: salonId
    });
  });

  // 1. Upsert Program
  console.log("Upserting program...");
  const { error: progError } = await supabase
    .from('programas')
    .upsert({
      id: PROGRAMA_ID,
      nombre: 'Programa de Música',
      descripcion: 'Programa académico general',
      activo: true
    }, { onConflict: 'nombre' });
  if (progError) throw new Error("Program upsert failed: " + JSON.stringify(progError));

  // 2. Upsert Teachers
  console.log("Upserting teachers...");
  const { error: tError } = await supabase
    .from('maestros')
    .upsert(Object.values(teachers), { onConflict: 'correo' });
  if (tError) throw new Error("Teachers upsert failed: " + JSON.stringify(tError));

  // 3. Upsert Salones
  console.log("Upserting salones...");
  const { error: sError } = await supabase
    .from('salones')
    .upsert(Object.values(salones), { onConflict: 'nombre' });
  if (sError) throw new Error("Salones upsert failed: " + JSON.stringify(sError));

  // 4. Upsert Clases
  console.log("Upserting classes...");
  const { error: cError } = await supabase
    .from('clases')
    .upsert(Object.values(classes), { onConflict: 'id' });
  if (cError) throw new Error("Classes upsert failed: " + JSON.stringify(cError));

  // 5. Clean & Insert Horarios
  console.log("Cleaning old schedules...");
  const classIds = Object.values(classes).map(c => c.id);
  const { error: delError } = await supabase
    .from('clase_horarios')
    .delete()
    .in('clase_id', classIds);
  if (delError) throw new Error("Schedule deletion failed: " + JSON.stringify(delError));

  console.log("Inserting new schedules...");
  const { error: hError } = await supabase
    .from('clase_horarios')
    .insert(horarios);
  if (hError) throw new Error("Schedule insertion failed: " + JSON.stringify(hError));

  console.log("Database seeded successfully!");
}

runSeed().catch(err => {
  console.error("Error running seed script:", err);
  process.exit(1);
});
