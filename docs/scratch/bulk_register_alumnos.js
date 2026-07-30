import { createClient } from '@supabase/supabase-js'

const url = 'https://zmhmdvmyeyswunurcyow.supabase.co'
const key = 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'

const supabase = createClient(url, key)

const CLASES = {
  violines_n0_a: '45f1eff8-699c-4bf5-84fa-e7c13979fc3c',
  violines_n0_b: '3bc800b1-597d-4ad4-bf69-cc45ba1df89d',
  violas: '9d45ecfb-e7f1-4c13-855f-751131969e14'
}

const nuevosAlumnos = [
  // Clase de Violines N0-A (Edelyn Abreu)
  {
    nombre_completo: 'Karelyn Alaia Jiménez Agramonte',
    fecha_nacimiento: '2018-01-01', // 8 años
    genero: 'F',
    instrumento_principal: 'Violín',
    posee_instrumento: true,
    clase_id: CLASES.violines_n0_a,
    clase_nombre: 'Clase de Violines N0-A'
  },
  {
    nombre_completo: 'Ismeray Lara Doñe',
    fecha_nacimiento: '2017-01-01', // 9 años
    genero: 'F',
    instrumento_principal: 'Violín',
    posee_instrumento: false,
    clase_id: CLASES.violines_n0_a,
    clase_nombre: 'Clase de Violines N0-A'
  },
  {
    nombre_completo: 'Yarayni Pierre Mateo',
    fecha_nacimiento: '2019-01-01', // 7 años
    genero: 'F',
    instrumento_principal: 'Violín',
    posee_instrumento: false,
    clase_id: CLASES.violines_n0_a,
    clase_nombre: 'Clase de Violines N0-A'
  },
  // Clases de Violines N0-B (Dyakenson Lamerique)
  {
    nombre_completo: 'Allexa Jireh Marte Mancebo',
    fecha_nacimiento: '2015-01-01', // 11 años
    genero: 'F',
    instrumento_principal: 'Violín',
    posee_instrumento: false,
    clase_id: CLASES.violines_n0_b,
    clase_nombre: 'Clases de Violines N0-B'
  },
  {
    nombre_completo: 'Chanaika Joseph',
    fecha_nacimiento: '2014-01-01', // 12 años
    genero: 'F',
    instrumento_principal: 'Violín',
    posee_instrumento: false,
    clase_id: CLASES.violines_n0_b,
    clase_nombre: 'Clases de Violines N0-B'
  },
  {
    nombre_completo: 'Samantha Oller Román',
    fecha_nacimiento: '2013-01-01', // 13 años
    genero: 'F',
    instrumento_principal: 'Violín',
    posee_instrumento: false,
    clase_id: CLASES.violines_n0_b,
    clase_nombre: 'Clases de Violines N0-B'
  },
  // Clases de Violas (Jaime de la Cruz)
  {
    nombre_completo: 'Esther Tucen',
    fecha_nacimiento: '2015-01-01', // 11 años
    genero: 'F',
    instrumento_principal: 'Viola',
    posee_instrumento: false,
    clase_id: CLASES.violas,
    clase_nombre: 'Clases de Violas'
  },
  {
    nombre_completo: 'Stacey Raquel Peñaló Méndez',
    fecha_nacimiento: '2014-01-01', // 12 años
    genero: 'F',
    instrumento_principal: 'Viola',
    posee_instrumento: false,
    clase_id: CLASES.violas,
    clase_nombre: 'Clases de Violas'
  },
  {
    nombre_completo: 'Aliyah Elizabeth Marte Mancebo',
    fecha_nacimiento: '2011-01-01', // 15 años
    genero: 'F',
    instrumento_principal: 'Viola',
    posee_instrumento: false,
    clase_id: CLASES.violas,
    clase_nombre: 'Clases de Violas'
  },
  {
    nombre_completo: 'Fednaika Nicolas Joseph',
    fecha_nacimiento: '2013-01-01', // 13 años
    genero: 'F',
    instrumento_principal: 'Viola',
    posee_instrumento: true,
    clase_id: CLASES.violas,
    clase_nombre: 'Clases de Violas'
  }
]

async function bulkRegister() {
  console.log('=== REGISTRO MASIVO DE 10 NUEVOS ALUMNOS ===\n')

  for (const a of nuevosAlumnos) {
    console.log(`Registrando: ${a.nombre_completo} (${a.instrumento_principal}) -> ${a.clase_nombre}...`)
    
    // Crear la familia primero o insertar alumno
    const { data: familyId, error: rpcErr } = await supabase.rpc('fn_crear_familia_para_alumno', {
      p_nombre: `Familia ${a.nombre_completo}`
    })

    const familiaId = rpcErr ? null : familyId

    const alumnoPayload = {
      nombre_completo: a.nombre_completo,
      fecha_nacimiento: a.fecha_nacimiento,
      instrumento_principal: a.instrumento_principal,
      activo: true,
      familia_id: familiaId
    }

    const { data: inserted, error: insErr } = await supabase
      .from('alumnos')
      .insert([alumnoPayload])
      .select()

    if (insErr) {
      console.log(`   ❌ Error registrando ${a.nombre_completo}: [${insErr.code}] ${insErr.message}`)
      continue
    }

    const newAlumnoId = inserted[0].id
    console.log(`   ✅ ALUMNO CREADO! ID: ${newAlumnoId}`)

    // Inscribir en la clase correspondiente
    const { error: inscErr } = await supabase
      .from('alumnos_clases')
      .insert([{ alumno_id: newAlumnoId, clase_id: a.clase_id }])

    if (inscErr) {
      console.log(`   ⚠️ Inscripción en clase warning: ${inscErr.message}`)
    } else {
      console.log(`   ✅ INSCRITO EXITOSAMENTE en "${a.clase_nombre}"!`)
    }
  }

  console.log('\n=== PROCESO FINALIZADO ===')
}

bulkRegister().catch(console.error)
