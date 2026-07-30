import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from .env.local or parent .env
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY in .env.local or parent .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const studentsToInsert = [
  {
    "nombre_completo": "Dyakenson Lamerique",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2011-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Violín 1",
    "id_inventario": "ESPCVLN42MU",
    "edad": 15,
    "telefono": "829-928-7837"
  },
  {
    "nombre_completo": "Emmanuel De los Santos Tavarez",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2017-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Violín 1",
    "id_inventario": "23,066",
    "edad": 9,
    "telefono": "829-886-1050"
  },
  {
    "nombre_completo": "Elianny Mejia",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2014-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Violín 1",
    "id_inventario": "22,083",
    "edad": 12,
    "telefono": "809-982-1853"
  },
  {
    "nombre_completo": "Edelyn Abreu Mejia",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2012-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Violín 1",
    "id_inventario": "23,056",
    "edad": 14,
    "telefono": "829-863-6465"
  },
  {
    "nombre_completo": "Yeiri Alexandra Germain Michel",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2013-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Violín 1",
    "id_inventario": "23,059",
    "edad": 13,
    "telefono": "809-258-5632"
  },
  {
    "nombre_completo": "Escarlet Lisbeth Martinez",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2015-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Violín 1",
    "id_inventario": "22,081",
    "edad": 11,
    "telefono": "849-266-5100"
  },
  {
    "nombre_completo": "Angenie St Juste Philogene",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2013-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Violín 1",
    "id_inventario": "23,061",
    "edad": 13,
    "telefono": "829-557-7515"
  },
  {
    "nombre_completo": "Yurma Stjuste Philogene",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2013-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Violín 1",
    "id_inventario": "23,062",
    "edad": 13,
    "telefono": "849-868-2014"
  },
  {
    "nombre_completo": "Angelita St Juste  Philogene",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2015-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Violín 1",
    "id_inventario": "22,087",
    "edad": 11,
    "telefono": "829-557-7515"
  },
  {
    "nombre_completo": "Cesar Andres Mendoza Gimenez",
    "fecha_ingreso": "2025-01-31",
    "fecha_nacimiento": "2011-09-01",
    "fecha_asignacion_instrumento": "2025-06-28",
    "instrumento_principal": "Violín 2",
    "id_inventario": "23,058",
    "edad": 13,
    "telefono": "829-840-6942"
  },
  {
    "nombre_completo": "Santa Isaura Castillo Díaz",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2017-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Violín 2",
    "id_inventario": "ESPCVLN28SG",
    "edad": 9,
    "telefono": "809-979-9258"
  },
  {
    "nombre_completo": "Gabriela Jireh Marte Colome",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2014-01-01",
    "fecha_asignacion_instrumento": "2025-06-10",
    "instrumento_principal": "Violín 2",
    "id_inventario": "23,055",
    "edad": 12,
    "telefono": "829-753-9979"
  },
  {
    "nombre_completo": "Yereni Esther Germain Michel",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2017-01-01",
    "fecha_asignacion_instrumento": "2025-06-06",
    "instrumento_principal": "Violín 2",
    "id_inventario": "24.090.",
    "edad": 9,
    "telefono": "809-258-5632"
  },
  {
    "nombre_completo": "Amelia Marlin Gutierrez",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2016-01-01",
    "fecha_asignacion_instrumento": "2025-06-17",
    "instrumento_principal": "Violín 2",
    "id_inventario": "22.090.",
    "edad": 10,
    "telefono": "809-967-6171"
  },
  {
    "nombre_completo": "Lia Annelise Lopez Matos",
    "fecha_ingreso": "2025-02-10",
    "fecha_nacimiento": "2016-08-23",
    "fecha_asignacion_instrumento": "2025-06-10",
    "instrumento_principal": "Violín 2",
    "id_inventario": "ESPCVLN45SG",
    "edad": 8,
    "telefono": "829-853-3972"
  },
  {
    "nombre_completo": "Jeydhen Andres Peguero Cortorreal",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2016-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Violín 2",
    "id_inventario": "PERSONAL",
    "edad": 10,
    "telefono": "809-841-9649"
  },
  {
    "nombre_completo": "Rosyairy Gabriel Reyes",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2017-01-01",
    "fecha_asignacion_instrumento": "2025-06-10",
    "instrumento_principal": "Violín 2",
    "id_inventario": "ESPCVLN34RO",
    "edad": 9,
    "telefono": "809-364-2097"
  },
  {
    "nombre_completo": "Ruth Esther Camille Jn Simon",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2011-01-01",
    "fecha_asignacion_instrumento": "2025-06-18",
    "instrumento_principal": "Clarinete",
    "id_inventario": "22,101",
    "edad": 15,
    "telefono": "809-999-6334"
  },
  {
    "nombre_completo": "Geily Yosairy Diviche",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2013-01-01",
    "fecha_asignacion_instrumento": "2025-06-12",
    "instrumento_principal": "Clarinete",
    "id_inventario": "22,102",
    "edad": 13,
    "telefono": "809-460-9313"
  },
  {
    "nombre_completo": "Yangel Jair Medina Ramirez",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2016-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Clarinete",
    "id_inventario": "23.070.",
    "edad": 10,
    "telefono": "829-324-6576"
  },
  {
    "nombre_completo": "Williams Abraham Fariñas Solano",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2009-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Contrabajo",
    "id_inventario": "22,086",
    "edad": 17,
    "telefono": "809-648-5562"
  },
  {
    "nombre_completo": "Nairoby Jean",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2010-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Contrabajo",
    "id_inventario": "23,051",
    "edad": 16,
    "telefono": "829-840-9444"
  },
  {
    "nombre_completo": "Julianny Dalexa Mendez",
    "fecha_ingreso": "2025-02-12",
    "fecha_nacimiento": "2014-06-02",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Contrabajo",
    "id_inventario": "COMPARTIDO",
    "edad": 11,
    "telefono": "809-804-6949"
  },
  {
    "nombre_completo": "Laura Gil Santana",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2015-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Contrabajo",
    "id_inventario": "ESPCCTB10YA",
    "edad": 11,
    "telefono": "829-663-8698"
  },
  {
    "nombre_completo": "Christina Pierre",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2014-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Contrabajo",
    "id_inventario": "ESPCCTB11YA",
    "edad": 12,
    "telefono": "829-839-7825"
  },
  {
    "nombre_completo": "Maia Santana Aracena",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2013-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Contrabajo",
    "id_inventario": "ESPCCTB12YA",
    "edad": 13,
    "telefono": "829-663-8698"
  },
  {
    "nombre_completo": "Diafreisi Dumond",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2011-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Corno",
    "id_inventario": "24,094",
    "edad": 15,
    "telefono": "809-961-7864"
  },
  {
    "nombre_completo": "Alegna Cuello Medina",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2017-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Flauta",
    "id_inventario": "22,095",
    "edad": 9,
    "telefono": "809-875-5523"
  },
  {
    "nombre_completo": "Zara Isabella Diaz Bodre",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2014-01-01",
    "fecha_asignacion_instrumento": "2025-06-07",
    "instrumento_principal": "Flauta",
    "id_inventario": "22,095",
    "edad": 12,
    "telefono": "829-394-1017"
  },
  {
    "nombre_completo": "Alina Marola Jimenez Vargas",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2016-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Flauta",
    "id_inventario": "22,097",
    "edad": 10,
    "telefono": "809-304-2080"
  },
  {
    "nombre_completo": "Ansherlin Zoe Contreras Polanco",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2016-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Flauta",
    "id_inventario": "24,091",
    "edad": 10,
    "telefono": "829-977-4033"
  },
  {
    "nombre_completo": "Jacob David Rojas Arellán",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2019-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Flauta",
    "id_inventario": "ESPCFLT08NU",
    "edad": 7,
    "telefono": "809-437-7577"
  },
  {
    "nombre_completo": "Josias Alejandro Fariñas Solano",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2012-01-01",
    "fecha_asignacion_instrumento": "2024-09-06",
    "instrumento_principal": "Oboe",
    "id_inventario": "23,067",
    "edad": 14,
    "telefono": "829-648-5562"
  },
  {
    "nombre_completo": "Cher Akemi Corredor",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2015-01-01",
    "fecha_asignacion_instrumento": "2025-06-06",
    "instrumento_principal": "Oboe",
    "id_inventario": "23,068",
    "edad": 11,
    "telefono": "829-439-8064"
  },
  {
    "nombre_completo": "Elisha Sosa",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2014-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Percusión",
    "id_inventario": "",
    "edad": 12,
    "telefono": "829-750-1155"
  },
  {
    "nombre_completo": "Marthin Alejandro Ramos",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2016-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Percusión",
    "id_inventario": "",
    "edad": 10,
    "telefono": "809-215-9387"
  },
  {
    "nombre_completo": "Zoe García Acevedo",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2011-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Percusión",
    "id_inventario": "",
    "edad": 15,
    "telefono": "829-850-0005"
  },
  {
    "nombre_completo": "Mauricio José Urquia",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2014-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Trombón",
    "id_inventario": "22,109",
    "edad": 12,
    "telefono": "829-355-1711"
  },
  {
    "nombre_completo": "Mathias Alejandro Ramos",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2015-01-01",
    "fecha_asignacion_instrumento": "2025-06-09",
    "instrumento_principal": "Trompeta",
    "id_inventario": "22,111",
    "edad": 11,
    "telefono": "809-215-9387"
  },
  {
    "nombre_completo": "Yeseña Joseph Bless",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2012-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Trompeta",
    "id_inventario": "22,114",
    "edad": 14,
    "telefono": "809-280-5920"
  },
  {
    "nombre_completo": "Feder de los Santos Gonzales",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2014-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Trompeta",
    "id_inventario": "22,115",
    "edad": 12,
    "telefono": "829-928-1188"
  },
  {
    "nombre_completo": "Jose Tomás Lorenzo Ogando",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2014-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Trompeta",
    "id_inventario": "22.110.",
    "edad": 12,
    "telefono": "809-803-3158"
  },
  {
    "nombre_completo": "Jhoennsy Sariel Castillo Batista",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2016-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Tuba",
    "id_inventario": "22,121",
    "edad": 10,
    "telefono": "809-228-1971"
  },
  {
    "nombre_completo": "María Naroldy Hilario",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2011-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Viola",
    "id_inventario": "23,053",
    "edad": 15,
    "telefono": "849-873-0530"
  },
  {
    "nombre_completo": "Jaime de la Cruz",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2011-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Viola",
    "id_inventario": "23,054",
    "edad": 15,
    "telefono": "829-278-9337"
  },
  {
    "nombre_completo": "Branyan Francisco Peguero",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2012-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Viola",
    "id_inventario": "ESPCVLA21JA",
    "edad": 14,
    "telefono": "829-558-0279"
  },
  {
    "nombre_completo": "Dariel Aquino Mejia",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2014-01-01",
    "fecha_asignacion_instrumento": "2025-06-06",
    "instrumento_principal": "Viola",
    "id_inventario": "ESPCVLA22EX",
    "edad": 12,
    "telefono": "829-887-7671"
  },
  {
    "nombre_completo": "Argeiris Yudeny Pacheco Pinales",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2012-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Viola",
    "id_inventario": "ESPCVLA23EX",
    "edad": 14,
    "telefono": "849-456-1545"
  },
  {
    "nombre_completo": "Jhouse Manuel Lacen",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2014-01-01",
    "fecha_asignacion_instrumento": "2025-06-07",
    "instrumento_principal": "Viola",
    "id_inventario": "ESPCVLN39EX",
    "edad": 12,
    "telefono": "829-558-3023"
  },
  {
    "nombre_completo": "Helen Sofia Alvarado Pérez",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2017-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Viola",
    "id_inventario": "ESPCVLN44RO",
    "edad": 9,
    "telefono": "809-710-6176"
  },
  {
    "nombre_completo": "Lucas Gutierrez Pérez",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2019-01-01",
    "fecha_asignacion_instrumento": "2025-06-17",
    "instrumento_principal": "Flauta",
    "id_inventario": "22,088",
    "edad": 7,
    "telefono": ""
  },
  {
    "nombre_completo": "Eva Taveras",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2016-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Violín 2",
    "id_inventario": "22,089",
    "edad": 10,
    "telefono": "829-672-6826"
  },
  {
    "nombre_completo": "Alanna Pilier",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2018-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Violín 2",
    "id_inventario": "ESPCVLN25SG",
    "edad": 8,
    "telefono": "829-680-7245"
  },
  {
    "nombre_completo": "Nicole Castillo Díaz",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2016-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Violín 2",
    "id_inventario": "ESPCVLN26SG",
    "edad": 10,
    "telefono": "809-979-9258"
  },
  {
    "nombre_completo": "Ashley Saint Philippe",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2016-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Violín 2",
    "id_inventario": "ESPCVLN37RO",
    "edad": 10,
    "telefono": "829-604-8490"
  },
  {
    "nombre_completo": "Alejandra Annaly Pérez",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2014-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Violín 2",
    "id_inventario": "ESPCVLN46YS",
    "edad": 12,
    "telefono": "849-245-8848"
  },
  {
    "nombre_completo": "Daniel Monfismon Peralte",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2018-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Violín 2",
    "id_inventario": "",
    "edad": 8,
    "telefono": "829-274-8894"
  },
  {
    "nombre_completo": "Amy Balbuena",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2012-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Violoncello",
    "id_inventario": "24,087",
    "edad": 14,
    "telefono": "829-913-6681"
  },
  {
    "nombre_completo": "Ysabella Valentina Brito Suniaga",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2014-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Violoncello",
    "id_inventario": "24.250.",
    "edad": 12,
    "telefono": "809-215-6273"
  },
  {
    "nombre_completo": "Alondra Lorenzo Ogando",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2010-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Violoncello",
    "id_inventario": "ESPCVLC14EX",
    "edad": 16,
    "telefono": "809-803-3158"
  },
  {
    "nombre_completo": "Lia Bonilla Santana",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2012-01-01",
    "fecha_asignacion_instrumento": "2025-05-29",
    "instrumento_principal": "Violoncello",
    "id_inventario": "ESPCVLC17EX",
    "edad": 14,
    "telefono": "829-846-8470"
  },
  {
    "nombre_completo": "Sol Marte",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2017-01-01",
    "fecha_asignacion_instrumento": "2025-06-24",
    "instrumento_principal": "Violoncello",
    "id_inventario": "ESPCVLC19RO",
    "edad": 9,
    "telefono": "809-617-5724"
  },
  {
    "nombre_completo": "Dinora Amanda Evangelista Paniagua",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2016-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Violoncello",
    "id_inventario": "ESPCVLC20RO",
    "edad": 10,
    "telefono": "809-219-8782"
  },
  {
    "nombre_completo": "Aarón Di Lorenzo",
    "fecha_ingreso": null,
    "fecha_nacimiento": "2015-01-01",
    "fecha_asignacion_instrumento": null,
    "instrumento_principal": "Violoncello",
    "id_inventario": "PERSONAL",
    "edad": 11,
    "telefono": "829-341-7693"
  }
];

async function run() {
  console.log('=== INICIANDO REGISTRO MASIVO EN SUPABASE ===');
  console.log(`Total alumnos a procesar: ${studentsToInsert.length}\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const s of studentsToInsert) {
    let obs = '';
    if (s.id_inventario) obs += `ID Inventario: ${s.id_inventario}`;
    if (s.fecha_asignacion_instrumento) {
      if (obs) obs += ' | ';
      obs += `Asignación Instrumento: ${s.fecha_asignacion_instrumento}`;
    }
    if (s.edad) {
      if (obs) obs += ' | ';
      obs += `Edad registrada: ${s.edad}`;
    }
    
    console.log(`Procesando: "${s.nombre_completo}"...`);
    
    // Check if user already exists
    const { data: existing, error: findErr } = await supabase
      .from('alumnos')
      .select('id')
      .eq('nombre_completo', s.nombre_completo)
      .maybeSingle();
      
    if (findErr) {
      console.error(`  ❌ Error al buscar alumno: ${findErr.message}`);
      failCount++;
      continue;
    }
    
    if (existing) {
      // Update
      const { error: updErr } = await supabase
        .from('alumnos')
        .update({
          fecha_nacimiento: s.fecha_nacimiento,
          instrumento_principal: s.instrumento_principal,
          fecha_ingreso: s.fecha_ingreso || undefined,
          representante_tlf: s.telefono,
          tlf_alumno: s.telefono,
          observaciones_generales: obs
        })
        .eq('id', existing.id);
        
      if (updErr) {
        console.error(`  ❌ Error al actualizar: ${updErr.message}`);
        failCount++;
      } else {
        console.log(`  ✅ Actualizado con éxito. ID: ${existing.id}`);
        successCount++;
      }
    } else {
      // Insert
      const { data: inserted, error: insErr } = await supabase
        .from('alumnos')
        .insert([{
          nombre_completo: s.nombre_completo,
          fecha_nacimiento: s.fecha_nacimiento,
          instrumento_principal: s.instrumento_principal,
          fecha_ingreso: s.fecha_ingreso || undefined,
          representante_tlf: s.telefono,
          tlf_alumno: s.telefono,
          observaciones_generales: obs,
          activo: true
        }])
        .select('id')
        .single();
        
      if (insErr) {
        console.error(`  ❌ Error al insertar: ${insErr.message}`);
        failCount++;
      } else {
        console.log(`  ✅ Insertado con éxito. ID: ${inserted.id}`);
        successCount++;
      }
    }
  }
  
  console.log(`\n=== REGISTRO MASIVO COMPLETADO ===`);
  console.log(`✅ Éxitos: ${successCount}`);
  console.log(`❌ Fallas: ${failCount}`);
}

run().catch(console.error);
