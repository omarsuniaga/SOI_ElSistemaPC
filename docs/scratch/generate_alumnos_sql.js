import fs from 'fs';
import path from 'path';

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

function capitalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .trim();
}

function parse() {
  const lines = rawInput.trim().split('\n').filter(l => l.trim().length > 0);
  const rows = [];

  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split('\t').map(p => p.trim());
    const padre = parts[0] || '';
    const alumno = parts[1] || '';
    const edad = parseInt(parts[2], 10) || null;
    const pasaporte = parts[3] || '';
    const telefono = parts[4] || '';
    const direccion = parts[5] || '';
    const turno = parts[6] || '';

    rows.push({
      line: i + 1,
      padre: capitalize(padre),
      alumno: capitalize(alumno),
      edad,
      pasaporte,
      telefono,
      direccion: capitalize(direccion),
      turno: turno.toLowerCase()
    });
  }

  return rows;
}

const parsed = parse();
console.log(`Parsed ${parsed.length} rows.`);

// Generate SQL verification script
let sql = `-- ==============================================================================
-- SOI - SCRIPT DE DIAGNÓSTICO, VERIFICACIÓN E INSERCIÓN SEGURA DE ALUMNOS NUEVOS
-- Clase: Iniciación Musical (Turno Mañana / Turno Tarde)
-- ==============================================================================

-- 1. TABLA TEMPORAL DE ALUMNOS CANDIDATOS
CREATE TEMP TABLE tmp_nuevos_alumnos (
  line_num INT,
  representante_nombre TEXT,
  nombre_completo TEXT,
  edad INT,
  fecha_nacimiento_estimada DATE,
  tiene_pasaporte TEXT,
  representante_tlf TEXT,
  direccion TEXT,
  turno_solicitado TEXT,
  instrumento_interes TEXT
) ON COMMIT DROP;

INSERT INTO tmp_nuevos_alumnos VALUES
`;

const values = parsed.map(r => {
  const anioNac = r.edad ? (2026 - r.edad) : 2018;
  const fechaNac = `${anioNac}-06-15`;
  const cleanTel = r.telefono.replace(/[^0-9+]/g, '');
  const instrumento = r.alumno.toLowerCase().includes('(piano)') ? 'Piano' : (r.turno.includes('coro') ? 'Coro' : null);
  const cleanNombre = r.alumno.replace(/\(piano\)/i, '').trim();

  return `  (${r.line}, '${r.padre.replace(/'/g, "''")}', '${cleanNombre.replace(/'/g, "''")}', ${r.edad || 'NULL'}, '${fechaNac}', '${r.pasaporte}', '${cleanTel}', '${r.direccion.replace(/'/g, "''")}', '${r.turno}', ${instrumento ? `'${instrumento}'` : 'NULL'})`;
});

sql += values.join(',\n') + ';\n\n';

sql += `-- 2. CONSULTA DE DIAGNÓSTICO DE DUPLICADOS Y COINCIDENCIAS CON LA BASE DE DATOS
SELECT 
  t.line_num AS "Línea",
  t.nombre_completo AS "Alumno Solicitado",
  t.edad AS "Edad",
  t.representante_nombre AS "Representante",
  t.representante_tlf AS "Teléfono",
  t.turno_solicitado AS "Turno",
  CASE 
    WHEN t.nombre_completo = '' THEN '⚠️ ANOMALÍA: Sin nombre de alumno'
    WHEN a.id IS NOT NULL THEN '🔴 YA REGISTRADO EN SUPABASE (ID: ' || a.id::text || ')'
    WHEN dup.count > 1 THEN '🟡 DUPLICADO INTERNO EN LISTA'
    WHEN t.edad >= 18 THEN '🔵 ALUMNO ADULTO (' || t.edad || ' años)'
    ELSE '🟢 NUEVO (Listo para registrar)'
  END AS "Estado Diagnóstico"
FROM tmp_nuevos_alumnos t
LEFT JOIN public.alumnos a ON LOWER(TRIM(a.nombre_completo)) = LOWER(TRIM(t.nombre_completo))
LEFT JOIN (
  SELECT LOWER(TRIM(nombre_completo)) as norm_name, COUNT(*) as count 
  FROM tmp_nuevos_alumnos 
  WHERE nombre_completo <> ''
  GROUP BY LOWER(TRIM(nombre_completo))
) dup ON dup.norm_name = LOWER(TRIM(t.nombre_completo))
ORDER BY t.line_num;
`;

fs.writeFileSync('docs/scratch/diagnostico_alumnos_supabase.sql', sql);
console.log('SQL generated at docs/scratch/diagnostico_alumnos_supabase.sql');
