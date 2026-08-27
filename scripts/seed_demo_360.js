import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/home/omedsunriv/soi/.env' });
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zmhmdvmyeyswunurcyow.supabase.co';
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Faltan variables de Supabase');
  process.exit(1);
}

const sb = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const SOFIA_ID = '11111111-1111-4111-8111-111111111111';
const SOFIA_FAM_ID = 'aaaaaaaa-1111-4111-8111-111111111111';
const SOFIA_ACTIVO_ID = '33333333-3333-4333-8333-333333333333';
const SOFIA_COMODATO_ID = '44444444-4444-4444-8444-444444444444';

const MATEO_ID = '22222222-2222-4222-8222-222222222222';
const MATEO_FAM_ID = 'bbbbbbbb-2222-4222-8222-222222222222';
const MATEO_ACTIVO_ID = '55555555-5555-4555-8555-555555555555';
const MATEO_COMODATO_ID = '66666666-6666-4666-8666-666666666666';

async function seed() {
  console.log('--- Iniciando inyección autoritativa de datos Ficha 360° ---');

  // 1. Familias
  console.log('1. Creando / actualizando familias...');
  const familias = [
    {
      id: SOFIA_FAM_ID,
      nombre_familia: 'Rodríguez Morales',
      fecha_ingreso: '2024-09-01',
      activa: true,
      datos_extra: {
        codigo_familia: 'FAM-101',
        apellidos: 'Rodríguez Morales',
        telefono_principal: '+1 809-555-0101',
        email_principal: 'carmen.morales@demo.org',
        representante: {
          nombre_completo: 'Carmen Morales',
          cedula: '001-1234567-8',
          telefono: '+1 809-555-0101',
          email: 'carmen.morales@demo.org',
          direccion: 'Av. Principal #12, Punta Cana Village'
        },
        isp: {
          valor: 96,
          categoria: 'A',
          cobertura_datos: 1.0,
          confiabilidad: 'alta',
          penalizaciones: 0,
          desglose: [
            { nombre: 'Puntualidad Histórica', puntos: 40, peso: 40, disponible: true, dato_crudo: '100% a tiempo', descripcion: 'Paga siempre los días 2-4 del mes' },
            { nombre: 'Antigüedad y Constancia', puntos: 30, peso: 30, disponible: true, dato_crudo: '24 meses activo', descripcion: 'Familia fundadora sin incidencias' },
            { nombre: 'Asistencia del Alumno', puntos: 26, peso: 30, disponible: true, dato_crudo: '96% presentismo', descripcion: 'Alto compromiso escolar' }
          ],
          ventana_pago_sugerida: { inicio_dia: 1, fin_dia: 5, patron: 'fin_de_mes', confianza: 0.95 },
          requiere_aprobacion_humana: false
        }
      }
    },
    {
      id: MATEO_FAM_ID,
      nombre_familia: 'Morales Pérez',
      fecha_ingreso: '2025-01-10',
      activa: true,
      datos_extra: {
        codigo_familia: 'FAM-102',
        apellidos: 'Morales Pérez',
        telefono_principal: '+1 809-555-0202',
        email_principal: 'roberto.morales@demo.org',
        representante: {
          nombre_completo: 'Roberto Morales',
          cedula: '001-9876543-2',
          telefono: '+1 809-555-0202',
          email: 'roberto.morales@demo.org',
          direccion: 'Calle Los Corales #45, Bávaro'
        },
        isp: {
          valor: 68,
          categoria: 'C',
          cobertura_datos: 0.85,
          confiabilidad: 'media',
          penalizaciones: 15,
          desglose: [
            { nombre: 'Puntualidad Histórica', puntos: 25, peso: 40, disponible: true, dato_crudo: 'Pagos con retraso promedio de 8 días', descripcion: 'Patrón de pago quincenal' },
            { nombre: 'Antigüedad y Constancia', puntos: 25, peso: 30, disponible: true, dato_crudo: '8 meses activo', descripcion: 'Ingreso reciente' },
            { nombre: 'Asistencia del Alumno', puntos: 18, peso: 30, disponible: true, dato_crudo: '75% presentismo', descripcion: 'Inasistencias en el último mes' }
          ],
          ventana_pago_sugerida: { inicio_dia: 15, fin_dia: 20, patron: 'quincenal', confianza: 0.80 },
          requiere_aprobacion_humana: false
        }
      }
    }
  ];

  for (const fam of familias) {
    const { error } = await sb.from('familias').upsert(fam, { onConflict: 'id' });
    if (error) console.error(`Error en familia ${fam.id}:`, error.message);
    else console.log(`✓ Familia guardada: ${fam.nombre_familia}`);
  }

  // 2. Alumnos
  console.log('2. Creando / actualizando alumnos...');
  const alumnos = [
    {
      id: SOFIA_ID,
      nombre_completo: 'Sofía Valentina Rodríguez',
      instrumento_principal: 'Violín',
      nivel: 'Intermedio B',
      nivel_actual: 'Intermedio B',
      familia_id: SOFIA_FAM_ID,
      representante_nombre: 'Carmen Morales',
      representante_cedula: '001-1234567-8',
      representante_tlf: '+1 809-555-0101',
      correo_representante: 'carmen.morales@demo.org',
      direccion: 'Av. Principal #12, Punta Cana Village',
      tiene_pasaporte: true,
      nacionalidad: 'Dominicana',
      fecha_nacimiento: '2012-05-14',
      fecha_ingreso: '2024-09-01',
      contacto_emergencia_nombre: 'Dr. Alejandro Rodríguez (Padre)',
      contacto_emergencia_telefono: '+1 809-555-0199',
      contacto_emergencia_parentesco: 'Padre',
      observaciones_generales: 'Alumna destacada, concertino de la Orquesta Infantil. Asistencia impecable.',
      activo: true,
      exento_mensualidad: false,
      mora_flag: false
    },
    {
      id: MATEO_ID,
      nombre_completo: 'Mateo Alejandro Morales',
      instrumento_principal: 'Violonchelo',
      nivel: 'Inicial A',
      nivel_actual: 'Inicial A',
      familia_id: MATEO_FAM_ID,
      representante_nombre: 'Roberto Morales',
      representante_cedula: '001-9876543-2',
      representante_tlf: '+1 809-555-0202',
      correo_representante: 'roberto.morales@demo.org',
      direccion: 'Calle Los Corales #45, Bávaro',
      tiene_pasaporte: false,
      nacionalidad: 'Dominicana',
      fecha_nacimiento: '2014-11-20',
      fecha_ingreso: '2025-01-10',
      contacto_emergencia_nombre: 'Laura Pérez (Madre)',
      contacto_emergencia_telefono: '+1 809-555-0299',
      contacto_emergencia_parentesco: 'Madre',
      observaciones_generales: 'Presenta dificultades de transporte algunos martes. Instrumento en calibración.',
      activo: true,
      exento_mensualidad: false,
      mora_flag: true
    }
  ];

  for (const alu of alumnos) {
    const { error } = await sb.from('alumnos').upsert(alu, { onConflict: 'id' });
    if (error) console.error(`Error en alumno ${alu.id}:`, error.message);
    else console.log(`✓ Alumno guardado: ${alu.nombre_completo}`);
  }

  // 3. Asistencias
  console.log('3. Generando historial de asistencias...');
  await sb.from('asistencias').delete().in('alumno_id', [SOFIA_ID, MATEO_ID]);

  const asistenciasSofia = [];
  const startSofia = new Date('2026-03-02');
  for (let i = 0; i < 24; i++) {
    const d = new Date(startSofia);
    d.setDate(d.getDate() + (i * 7));
    const fechaStr = d.toISOString().split('T')[0];
    const estado = i === 11 ? 'justificado' : 'presente';
    asistenciasSofia.push({
      alumno_id: SOFIA_ID,
      fecha: fechaStr,
      estado,
      observaciones: estado === 'justificado' ? 'Cita médica justificada con certificado' : 'Presente y participativa'
    });
  }

  const asistenciasMateo = [];
  const startMateo = new Date('2026-03-02');
  for (let i = 0; i < 20; i++) {
    const d = new Date(startMateo);
    d.setDate(d.getDate() + (i * 7));
    const fechaStr = d.toISOString().split('T')[0];
    const ausente = [4, 9, 14, 17, 19].includes(i);
    asistenciasMateo.push({
      alumno_id: MATEO_ID,
      fecha: fechaStr,
      estado: ausente ? 'ausente' : 'presente',
      observaciones: ausente ? 'Inasistencia sin previo aviso' : 'Presente en clase'
    });
  }

  const { error: errAsisSof } = await sb.from('asistencias').insert(asistenciasSofia);
  if (errAsisSof) console.error('Error asistencias Sofía:', errAsisSof.message);
  else console.log(`✓ ${asistenciasSofia.length} asistencias insertadas para Sofía (96% presentismo)`);

  const { error: errAsisMat } = await sb.from('asistencias').insert(asistenciasMateo);
  if (errAsisMat) console.error('Error asistencias Mateo:', errAsisMat.message);
  else console.log(`✓ ${asistenciasMateo.length} asistencias insertadas para Mateo (75% presentismo)`);

  // 4. Progresos & Evaluaciones
  console.log('4. Registrando evaluaciones pedagógicas...');
  await sb.from('progresos').delete().in('alumno_id', [SOFIA_ID, MATEO_ID]);

  const progresos = [
    {
      alumno_id: SOFIA_ID,
      fecha_evaluacion: '2026-08-15',
      calificacion: 9.5,
      estado_cualitativo: 'LOGRADO',
      evaluacion_tipo: 'audicion_semestral',
      observaciones: 'Ejecución brillante del Concierto en La menor de Vivaldi (Mvt 1). Excelente postura de mano izquierda y afinación en cambios de posición.'
    },
    {
      alumno_id: SOFIA_ID,
      fecha_evaluacion: '2026-06-20',
      calificacion: 9.2,
      estado_cualitativo: 'LOGRADO',
      evaluacion_tipo: 'evaluacion_continua',
      observaciones: 'Dominio completo de escalas en dos octavas y golpes de arco martelé.'
    },
    {
      alumno_id: MATEO_ID,
      fecha_evaluacion: '2026-08-10',
      calificacion: 7.8,
      estado_cualitativo: 'EN_PROGRESO',
      evaluacion_tipo: 'audicion_semestral',
      observaciones: 'Buen sonido base. Necesita mayor relajación en la muñeca derecha y asegurar la digitación en primera posición sobre cuerdas Sol y Do.'
    }
  ];

  const { error: errProg } = await sb.from('progresos').insert(progresos);
  if (errProg) console.error('Error progresos:', errProg.message);
  else console.log('✓ Evaluaciones registradas en progresos');

  // 5. Cuotas y Finanzas
  console.log('5. Generando cuotas de aranceles...');
  await sb.from('cuotas').delete().in('alumno_id', [SOFIA_ID, MATEO_ID]);

  const meses = [
    { periodo: '2026-03', mes: 3, anio: 2026 },
    { periodo: '2026-04', mes: 4, anio: 2026 },
    { periodo: '2026-05', mes: 5, anio: 2026 },
    { periodo: '2026-06', mes: 6, anio: 2026 },
    { periodo: '2026-07', mes: 7, anio: 2026 },
    { periodo: '2026-08', mes: 8, anio: 2026 },
  ];
  const cuotas = [];

  for (const m of meses) {
    cuotas.push({
      alumno_id: SOFIA_ID,
      familia_id: SOFIA_FAM_ID,
      concepto: 'Mensualidad Formación Orquestal',
      ciclo_mes: m.mes,
      ciclo_anio: m.anio,
      monto_base_centavos: 250000,
      monto_final_centavos: 250000,
      descuento_centavos: 0,
      monto_pagado_centavos: 250000,
      fecha_generacion: `${m.periodo}-01`,
      fecha_vencimiento: `${m.periodo}-15`,
      estado: 'pagada'
    });
  }

  for (const m of meses) {
    const esPendiente = m.periodo === '2026-08';
    cuotas.push({
      alumno_id: MATEO_ID,
      familia_id: MATEO_FAM_ID,
      concepto: 'Mensualidad Formación Orquestal',
      ciclo_mes: m.mes,
      ciclo_anio: m.anio,
      monto_base_centavos: 250000,
      monto_final_centavos: 250000,
      descuento_centavos: 0,
      monto_pagado_centavos: esPendiente ? 0 : 250000,
      fecha_generacion: `${m.periodo}-01`,
      fecha_vencimiento: `${m.periodo}-15`,
      estado: esPendiente ? 'pendiente' : 'pagada'
    });
  }

  const { error: errCuotas } = await sb.from('cuotas').insert(cuotas);
  if (errCuotas) console.error('Error cuotas:', errCuotas.message);
  else console.log('✓ Cuotas generadas exitosamente');

  // 6. Inventario y Comodatos
  console.log('6. Asignando activos e instrumentos en comodato...');
  await sb.from('comodatos_activos').delete().in('alumno_id', [SOFIA_ID, MATEO_ID]);
  await sb.from('inventario_activos').delete().in('id', [SOFIA_ACTIVO_ID, MATEO_ACTIVO_ID]);

  const activos = [
    {
      id: SOFIA_ACTIVO_ID,
      codigo_inventario: 'VIO-042',
      tipo_instrumento: 'Violín',
      marca: 'Yamaha',
      modelo: 'V5 4/4',
      numero_serie: 'YMH-88219',
      tamano: '4/4',
      estado_conservacion: 'excelente',
      estado_uso: 'en_comodato',
      asignado_a_texto: 'Sofía Valentina Rodríguez',
      ubicacion: 'En poder del alumno (Comodato)',
      activo: true,
      tiene_estuche: true,
      tiene_arco: true,
      requiere_mantenimiento: false,
      notas: 'Calibrado recientemente por el taller. Alma y puente en posición óptima.'
    },
    {
      id: MATEO_ACTIVO_ID,
      codigo_inventario: 'CEL-018',
      tipo_instrumento: 'Violonchelo',
      marca: 'Strunal',
      modelo: 'Student 4/4',
      numero_serie: 'STR-44102',
      tamano: '4/4',
      estado_conservacion: 'regular',
      estado_uso: 'en_reparacion',
      asignado_a_texto: 'Mateo Alejandro Morales',
      ubicacion: 'Taller de Lutería (Mesa 2)',
      activo: true,
      tiene_estuche: true,
      tiene_arco: true,
      requiere_mantenimiento: true,
      notas: 'En taller de luthería por desgaste de clavijas y revisión de diapasón.'
    }
  ];

  const { error: errActivos } = await sb.from('inventario_activos').insert(activos);
  if (errActivos) console.error('Error inventario activos:', errActivos.message);
  else console.log('✓ Activos de inventario registrados');

  const comodatos = [
    {
      id: SOFIA_COMODATO_ID,
      activo_id: SOFIA_ACTIVO_ID,
      alumno_id: SOFIA_ID,
      fecha_entrega: '2026-01-15',
      fecha_vencimiento: '2026-12-15',
      estado: 'vigente',
      tipo_comodato: 'anual_academico',
      observaciones: 'Entregado a Carmen Morales (Representante). Estado excelente verificado.'
    },
    {
      id: MATEO_COMODATO_ID,
      activo_id: MATEO_ACTIVO_ID,
      alumno_id: MATEO_ID,
      fecha_entrega: '2026-02-01',
      fecha_vencimiento: '2026-12-15',
      estado: 'vigente',
      tipo_comodato: 'anual_academico',
      observaciones: 'Instrumento temporalmente ingresado a taller para ajuste de clavijas.'
    }
  ];

  const { error: errComodatos } = await sb.from('comodatos_activos').insert(comodatos);
  if (errComodatos) console.error('Error comodatos:', errComodatos.message);
  else console.log('✓ Contratos de comodato registrados');

  console.log('\n=== Inyección de datos Ficha 360° completada con éxito ===');
}

seed().catch(err => {
  console.error('Fallo en seed:', err);
  process.exit(1);
});
