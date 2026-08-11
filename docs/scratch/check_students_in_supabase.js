import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env
const envPath = path.resolve(process.cwd(), '.env.local');
const fallbackPath = path.resolve(process.cwd(), '.env');
const content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : fs.readFileSync(fallbackPath, 'utf8');
const env = {};
content.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const parts = trimmed.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const rawInput = `
Ana Machillanda	 Dylan Machillanda	12	si 	8293159040	cortecito	tarde
Grismaldy mercedes José Paulino	 Iriam Méndez José	8	si	8292307813	ciudad del rey	tarde
antonieta barreto 	 Liam Benitez 	7	si	8294377749	pueblo bavaro	mañana
Juvinda milfort	abigail jada	14	no	8494889768		tarde
juan carlos saldaña	alan manuel saldaña	11	no	8099069632	veron 	tarde
Noreliz de los Santos	Amelia Mercedez	7	si	8294601827	domingo maiz, veron 	tarde
lucymart mateo	amelia olaverria	9	no	8293827967	Residenciales la antigua	tarde
Dieula Charite	Anaika plaisimond	10	no	8299324623	punta cana	
erika ramirez 	angel david  ramirez 	10	si	8096606513	hotel yonu	tarde
marie  Nose antis 	ann saena antis	11	no 	8495938730	veron 	tarde
Miledis Rodríguez guerrero	Brianna lisset Jiménez Rodríguez	12	no	8295285884	residencial don domingo	tarde
Mercedes de la Cruz	Camila celestino de la cruz	8		8294568248	Calle segunda guateque	mañana
Mariel Polanco 	Camila del Carmen Luna Polanco 	7	si	8292841840	veron punta cana 	tarde
Nicaury diaz	Clariluz castillo	13	no	8099799258	residencial la antigua	tarde
Barbara Strano	Coral Isabella	7	si	8298680851	cocotal 	tarde
Cinthya Castillo	Daniella Gomez Castillo	10	si	8293566985	capcana	tarde
Martina Cedeño mota	Darianny Gómez	11	si	8293481557	veron	mañana
Carolyn valdez	Darolyn veloz valdez	11	si	8297762023	lotificacion veron 	tarde
nelson jimenes 	dylan isaac Sanchez Urraca	7	no	8294398194	sector ayutamiento	tarde
suzzell pichardo 	eliseo abreu 	9	no	8099179580	ciudad caracoli 	mañana
Yudeily escarolina ortega	emmanuel andres santana gils	4	si	8093954932	friusa, plaza estrella	mañana
erika ramirez 	endy jadiel ramirez 	12	si	8096606513	hotel yonu	tarde
wilma ferreira cornier	ezequiel ortiz ferreira	8	no	8293865759	lotificacion veron 	Cualquiera
Katherin Abreu 	haide Mejia 	6	si	8293665351	veron pc	tarde
Jenaury 	Justin Benitez	14	no	8299284914	proyecto puente del mar 	mañana
yaraisa amparo abelino	Jeremias amparo	8	si	8297448469	caracoli	tarde
Claribel reyes 	lesauribel reyes 	7		8296508489	domingo maiz 	mañana
Leidi Pamela toros 	leslie camella lopez toros 	6	no	8094039276	domingo maiz 	
Leidi pamela torres carrasco	leslie lopez	6	no	8094039276	domingo maiz 	tarde
Santa Elizaire	Liah Rashel Escoto	13	si	8299938015	cocotal	tarde
laura elvira 	Lilaj del Angel García	9	si	529841507007	bavaro punta cana	tarde
lisbet severino nuñez	lissette jimenez	13	si	8097080162	bello amanecer	tarde
angela maria crispin	maria victoria fernandez crispin	15	no	8092091227	residencial bavaro puntacana 	tarde
Minerva Rivas	Melany vargas Rivas	8	no	8293295821	Veron	tarde
yaraisa amparo abelino	Meredi amparo	13	si	8297448469	caracoli	tarde
nayrobys mateo	nasly daniel majia mateo 	7	no	8298746735	domingo maiz 	tarde
Yokaty De Leon Lopez	Oliver Yotniel Perez De Leon	9	si		veron 	tarde
Yorli Bravo 	Oriana Isabella duarte 	9	si	8297084180	ciudad cayenas 	tarde
Leidi pamela torres carrasco	pameli lopez	8	no	8094039276	domingo maiz 	tarde
Veronica Diaz	PATRICIA DELVA DIAZ	16		8496334475		mañana
Alejandrina lizardo trinidad	Richard alexander de la cruz	7	no	8297596796	lotificacion veron 	tarde
marie maso antis 	richard chales 	19	no	8495938730	veron 	tarde
isabell mateo alcantara 	rocio francisca reyes perez	12	no	8496243270	domingo maiz 	tarde
isabell mateo alcantara 	rogelio antonio reyes felix	7	no	8496243270	domingo maiz 	tarde
pamela rodriguez 	samuel elias rodriguez	7	no 	8492838673	Los manantiales	tarde
santa nicolasa falcon cabrera	sandy Olfran garcia 	6	no	8294370367	veron 	tarde
liah escoto	Santa elizaire	13	si	8494708015	cocotal	tarde
genesis castillo 	sara B moya castillo 	8	no	8293863907	veron campolindo 	tarde
Meredit Miosoti Amparo Amparo	Jeremías Amparo	8	si 	8297448469	caracoli	tarde
Maria guzman ruiz 	thaomi mateo 	19	no	8299205227	villa playbo	tarde
katherin abreu 	Vasti Mejia 	12	si	8293665351	veron pc 	tarde
 Xiomara de leon lopez	Victor Daniel Garcia de leon	9	si	8094659490	Los manantiales	tarde
Elis viloria	victoria brito viloria (piano)	13	si	8098401259	bavaro punta cana	tarde
Yocani barinas 	wellington sebastian 	7	si	8293666803	residencial don rogelio	tarde
yocani barinas 	wilcani  barinas 	14	si	8293666803	residencial don rogelio	tarde
Jeremías Amparo Amparo	Yaraisa Amparo Avelino	8	si	8297448469	caracoli	tarde
yuliany  sosa	yasser nicolas mejias	8	si	8293356974	Los manantiales	tarde
	Escarline Urena	27	si	8299090717	Friusa	tarde
Johanny joseph		8				
	scarlet salas 	28		8299090717	bavaro punta cana	Coro Sinfónico
Rodolfo paredes	Matias paredes	5	si	8095467711	Residecial sueño verde	Cualquiera revisa esto
`;

function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function run() {
  console.log('--- Conectando a Supabase ---');
  const { data: dbAlumnos, error: errAlumnos } = await supabase
    .from('alumnos')
    .select('id, nombre_completo, representante_nombre, representante_tlf, familiar_telefono, activo, created_at, nivel');
  
  if (errAlumnos) {
    console.error('Error al obtener alumnos:', errAlumnos);
    return;
  }

  const { data: dbClases, error: errClases } = await supabase
    .from('clases')
    .select('id, nombre, tipo_clase, activo');

  console.log(`Total alumnos en Supabase: ${dbAlumnos.length}`);
  console.log(`Total clases en Supabase: ${dbClases?.length || 0}`);

  // Parse lines
  const lines = rawInput.trim().split('\n').filter(l => l.trim().length > 0);
  const candidates = [];

  for (let idx = 0; idx < lines.length; idx++) {
    const cols = lines[idx].split('\t').map(c => c.trim());
    // Padres	Alumnos	Edad	Pasaporte	Telefono	Direccion	Turno
    const padres = cols[0] || '';
    const alumno = cols[1] || '';
    const edad = parseInt(cols[2], 10) || null;
    const pasaporte = cols[3] || '';
    const telefono = cols[4] || '';
    const direccion = cols[5] || '';
    const turno = cols[6] || '';

    candidates.push({
      line: idx + 1,
      padres,
      alumno,
      edad,
      pasaporte,
      telefono,
      direccion,
      turno,
      raw: lines[idx]
    });
  }

  console.log(`\nCandidatos en la lista ingresada: ${candidates.length}`);

  // Match analysis
  const results = {
    exactMatchesInDB: [],
    fuzzyMatchesInDB: [],
    duplicatesInList: [],
    anomalies: [],
    newReady: []
  };

  const seenInList = new Map();

  for (const c of candidates) {
    const normName = normalize(c.alumno);
    const normTel = c.telefono.replace(/\D/g, '');

    // Anomaly checks
    if (!c.alumno) {
      results.anomalies.push({ candidate: c, issue: 'Fila sin nombre de alumno (ej: Johanny joseph)' });
      continue;
    }

    if (c.edad && c.edad >= 18) {
      results.anomalies.push({ candidate: c, issue: `Alumno adulto (${c.edad} años) - posible caso especial / coro` });
    }

    // Check list internal duplicates
    if (normName) {
      if (seenInList.has(normName)) {
        results.duplicatesInList.push({
          candidate: c,
          previous: seenInList.get(normName),
          issue: `Duplicado en la misma lista ingresada (Nombre: "${c.alumno}")`
        });
      } else {
        seenInList.set(normName, c);
      }
    }

    // Check DB exact match
    const exactMatch = dbAlumnos.find(db => normalize(db.nombre_completo) === normName);
    if (exactMatch) {
      results.exactMatchesInDB.push({ candidate: c, dbMatch: exactMatch });
      continue;
    }

    // Check DB fuzzy match
    const nameTokens = normName.split(' ').filter(t => t.length > 2);
    const fuzzyMatch = dbAlumnos.find(db => {
      const dbNorm = normalize(db.nombre_completo);
      const dbTokens = dbNorm.split(' ').filter(t => t.length > 2);
      // match if 2 or more significant tokens match
      const common = nameTokens.filter(t => dbTokens.includes(t));
      return common.length >= 2 && (common.length / Math.max(nameTokens.length, dbTokens.length)) >= 0.5;
    });

    if (fuzzyMatch) {
      results.fuzzyMatchesInDB.push({ candidate: c, dbMatch: fuzzyMatch });
      continue;
    }

    // Check phone match
    if (normTel && normTel.length >= 7) {
      const telMatch = dbAlumnos.find(db => {
        const dbTel1 = (db.representante_tlf || '').replace(/\D/g, '');
        const dbTel2 = (db.familiar_telefono || '').replace(/\D/g, '');
        return (dbTel1 && dbTel1.includes(normTel)) || (dbTel2 && dbTel2.includes(normTel));
      });
      if (telMatch) {
        results.fuzzyMatchesInDB.push({
          candidate: c,
          dbMatch: telMatch,
          reason: `Coincidencia por teléfono con otro alumno existente: "${telMatch.nombre_completo}"`
        });
        continue;
      }
    }

    // If not matched, ready
    results.newReady.push(c);
  }

  console.log('\n================ RESULTADOS DEL ANÁLISIS ================');
  console.log(`1. Coincidencias Exactas en DB: ${results.exactMatchesInDB.length}`);
  results.exactMatchesInDB.forEach(m => {
    console.log(`   - [Línea ${m.candidate.line}] "${m.candidate.alumno}" ya existe en DB (ID: ${m.dbMatch.id}, Creado: ${m.dbMatch.created_at})`);
  });

  console.log(`\n2. Coincidencias Parciales / Teléfono en DB: ${results.fuzzyMatchesInDB.length}`);
  results.fuzzyMatchesInDB.forEach(m => {
    console.log(`   - [Línea ${m.candidate.line}] "${m.candidate.alumno}" se parece a DB: "${m.dbMatch.nombre_completo}" (ID: ${m.dbMatch.id}) ${m.reason || ''}`);
  });

  console.log(`\n3. Duplicados internos dentro de tu lista: ${results.duplicatesInList.length}`);
  results.duplicatesInList.forEach(m => {
    console.log(`   - [Línea ${m.candidate.line}] "${m.candidate.alumno}" ya aparecía en línea ${m.previous.line}`);
  });

  console.log(`\n4. Casos Especiales / Anomalías: ${results.anomalies.length}`);
  results.anomalies.forEach(m => {
    console.log(`   - [Línea ${m.candidate.line}] "${m.candidate.alumno || m.candidate.padres}" -> ${m.issue}`);
  });

  console.log(`\n5. Alumnos Nuevos Listos para Inserción Limpia: ${results.newReady.length}`);
  results.newReady.forEach(m => {
    console.log(`   - [Línea ${m.line}] ${m.alumno} | Edad: ${m.edad} | Turno: ${m.turno || 'Sin turno'} | Tel: ${m.telefono}`);
  });
}

run();
